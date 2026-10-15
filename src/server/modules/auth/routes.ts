import type { FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify';
import { and, desc, eq } from 'drizzle-orm';
import { APP_NAME } from '../../../shared/constants';
import { changePasswordSchema, loginSchema, setupSchema } from '../../../shared/schemas/auth';
import { sessionCookieName } from '../../app';
import { schema } from '../../db/client';
import { audit, writeAudit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { AppError, conflict, tooMany, unauthorized } from '../../lib/errors';
import { dummyVerify, hashPassword, needsRehash, verifyPassword } from '../../lib/password';
import { createSession, destroySession, destroyUserSessions } from '../../lib/session';
import { parse } from '../../lib/validate';
import { aiReady } from '../ai/service';
import { countUsers, createUser, findUserByEmail, findUserById, toAuthUser } from '../users/service';

const { users, sessions } = schema;

const MAX_FAILED = 5;
const GENERIC_LOGIN_ERROR = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';

function setSessionCookie(app: FastifyInstance, reply: FastifyReply, token: string, expiresAt: Date, remember: boolean) {
  reply.setCookie(sessionCookieName(app.config), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: app.config.cookieSecure,
    path: '/',
    ...(remember ? { expires: expiresAt } : {}),
  });
}

function clearSessionCookie(app: FastifyInstance, reply: FastifyReply) {
  reply.clearCookie(sessionCookieName(app.config), {
    httpOnly: true,
    sameSite: 'lax',
    secure: app.config.cookieSecure,
    path: '/',
  });
}

export const authModule: FastifyPluginAsync = async (app) => {
  const cfg = app.config;

  // ───────── معلومات عامة ─────────
  app.get('/health', { config: { public: true } }, async () => ({ status: 'ok', version: cfg.version }));

  app.get('/system/info', { config: { public: true } }, async () => ({
    name: APP_NAME,
    version: cfg.version,
    needsSetup: countUsers(app.db.orm) === 0,
    timezone: cfg.timezone,
    capabilities: { pdf: app.pdf.available, ai: aiReady(app) },
  }));

  // ───────── الإعداد الأولي: أول مستخدم يصبح مدير النظام ─────────
  app.post(
    '/auth/setup',
    { config: { public: true, rateLimit: { max: 10, timeWindow: '1 hour' } } },
    async (req, reply) => {
      const db = app.db.orm;
      if (countUsers(db) > 0) throw conflict('تم إعداد النظام مسبقًا', 'ALREADY_SETUP');
      const body = parse(setupSchema, req.body);
      const user = await createUser(db, cfg.scrypt, { ...body, role: 'admin' });
      // سباق نادر: لو أُنشئ مستخدمان معًا نُبقي الأقدم مديرًا
      writeAudit(db, { action: 'setup', entityType: 'user', entityId: user.id, userId: user.id, userEmail: user.email }, req.ip);
      const { token, expiresAt } = createSession(db, user.id, {
        remember: false,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        ttl: cfg,
      });
      setSessionCookie(app, reply, token, expiresAt, false);
      return reply.code(201).send({ user: toAuthUser(user) });
    },
  );

  // ───────── الدخول ─────────
  app.post(
    '/auth/login',
    { config: { public: true, rateLimit: { max: 20, timeWindow: '15 minutes' } } },
    async (req, reply) => {
      const db = app.db.orm;
      const body = parse(loginSchema, req.body);
      const user = findUserByEmail(db, body.email);
      const fail = (reason: string, u?: { id: string; email: string }) => {
        writeAudit(db, { action: 'login_failed', userId: u?.id ?? null, userEmail: body.email, meta: { reason } }, req.ip);
      };

      if (!user) {
        await dummyVerify(body.password, cfg.scrypt); // تساوي الزمن مع حالة وجود الحساب
        fail('unknown_user');
        throw unauthorized(GENERIC_LOGIN_ERROR);
      }

      if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
        fail('locked', user);
        throw tooMany('تم تعليق محاولات الدخول مؤقتًا بسبب كثرة المحاولات الفاشلة. حاول بعد قليل');
      }

      const ok = await verifyPassword(body.password, user.passwordHash);
      if (!ok) {
        const failed = user.failedLogins + 1;
        const lockMinutes = failed >= MAX_FAILED ? Math.min(30, 2 ** (failed - MAX_FAILED)) : 0;
        db.update(users)
          .set({
            failedLogins: failed,
            lockedUntil: lockMinutes ? new Date(Date.now() + lockMinutes * 60_000).toISOString() : null,
          })
          .where(eq(users.id, user.id))
          .run();
        fail('bad_password', user);
        throw unauthorized(GENERIC_LOGIN_ERROR);
      }

      if (user.status !== 'active') {
        fail('disabled', user);
        throw new AppError(403, 'ACCOUNT_DISABLED', 'هذا الحساب معطّل. تواصل مع مدير النظام');
      }

      const patch: Partial<typeof users.$inferInsert> = {
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: new Date().toISOString(),
      };
      if (needsRehash(user.passwordHash, cfg.scrypt)) patch.passwordHash = await hashPassword(body.password, cfg.scrypt);
      db.update(users).set(patch).where(eq(users.id, user.id)).run();

      const { token, expiresAt } = createSession(db, user.id, {
        remember: body.remember,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        ttl: cfg,
      });
      setSessionCookie(app, reply, token, expiresAt, body.remember);
      writeAudit(db, { action: 'login', userId: user.id, userEmail: user.email }, req.ip);
      return { user: toAuthUser(user) };
    },
  );

  app.post('/auth/logout', { config: { allowMustChange: true } }, async (req, reply) => {
    if (req.auth) {
      destroySession(app.db.orm, req.auth.sessionId);
      audit(req, { action: 'logout' });
    }
    clearSessionCookie(app, reply);
    return { ok: true };
  });

  /** عام: يعيد المستخدم الحالي أو null (بدل 401) حتى لا تمتلئ كونسول المتصفح بأخطاء عند كل زيارة لشاشة الدخول */
  app.get('/auth/me', { config: { public: true, allowMustChange: true } }, async (req) => ({
    user: req.auth?.user ?? null,
  }));

  // ───────── تغيير كلمة المرور ─────────
  app.post(
    '/auth/password',
    { config: { allowMustChange: true, rateLimit: { max: 10, timeWindow: '1 hour' } } },
    async (req) => {
      const { db, user } = getCtx(req);
      const body = parse(changePasswordSchema, req.body);
      const row = findUserById(db, user.id);
      if (!row || !(await verifyPassword(body.currentPassword, row.passwordHash))) {
        throw new AppError(400, 'WRONG_PASSWORD', 'كلمة المرور الحالية غير صحيحة', {
          currentPassword: 'كلمة المرور الحالية غير صحيحة',
        });
      }
      if (body.newPassword === body.currentPassword)
        throw new AppError(400, 'SAME_PASSWORD', 'كلمة المرور الجديدة يجب أن تختلف عن الحالية', {
          newPassword: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
        });
      const passwordHash = await hashPassword(body.newPassword, cfg.scrypt);
      db.update(users).set({ passwordHash, mustChangePassword: false, failedLogins: 0, lockedUntil: null }).where(eq(users.id, user.id)).run();
      // نُنهي بقية الجلسات (أجهزة أخرى) ونُبقي الحالية
      destroyUserSessions(db, user.id, req.auth!.sessionId);
      audit(req, { action: 'password_changed', entityType: 'user', entityId: user.id });
      return { ok: true };
    },
  );

  // ───────── الأجهزة المتصلة ─────────
  app.get('/auth/sessions', async (req) => {
    const { db, user } = getCtx(req);
    const rows = db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.lastSeenAt))
      .all();
    return rows.map((s) => ({
      id: s.id,
      current: s.id === req.auth!.sessionId,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      expiresAt: s.expiresAt,
      ip: s.ip,
      userAgent: s.userAgent,
    }));
  });

  app.delete<{ Params: { id: string } }>('/auth/sessions/:id', async (req) => {
    const { db, user } = getCtx(req);
    db.delete(sessions).where(and(eq(sessions.id, req.params.id), eq(sessions.userId, user.id))).run();
    audit(req, { action: 'session_revoked' });
    return { ok: true };
  });

  app.post('/auth/logout-others', async (req) => {
    const { db, user } = getCtx(req);
    destroyUserSessions(db, user.id, req.auth!.sessionId);
    audit(req, { action: 'sessions_revoked_all' });
    return { ok: true };
  });
};
