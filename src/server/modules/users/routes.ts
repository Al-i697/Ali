import type { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { createUserSchema, resetPasswordSchema, updateUserSchema } from '../../../shared/schemas/auth';
import { schema } from '../../db/client';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { AppError, conflict } from '../../lib/errors';
import { hashPassword } from '../../lib/password';
import { destroyUserSessions } from '../../lib/session';
import { parse } from '../../lib/validate';
import {
  activeAdminCount,
  createUser,
  listUsers,
  requireUser,
  toPublicUser,
} from './service';

const { users } = schema;

/** إدارة الحسابات — للمدير فقط */
export const usersModule: FastifyPluginAsync = async (app) => {
  const admin = { config: { roles: ['admin' as const] } };

  app.get('/users', admin, async (req) => {
    const { db } = getCtx(req);
    return listUsers(db);
  });

  app.post('/users', admin, async (req, reply) => {
    const { db } = getCtx(req);
    const body = parse(createUserSchema, req.body);
    // كلمة المرور المؤقتة: يُلزَم المستخدم بتغييرها عند أول دخول
    const user = await createUser(db, app.config.scrypt, { ...body, mustChangePassword: true });
    audit(req, { action: 'user_created', entityType: 'user', entityId: user.id, meta: { role: user.role } });
    return reply.code(201).send(toPublicUser(user));
  });

  app.patch<{ Params: { id: string } }>('/users/:id', admin, async (req) => {
    const { db, user: me } = getCtx(req);
    const target = requireUser(db, req.params.id);
    const body = parse(updateUserSchema, req.body);
    const demotesSelf = target.id === me.id && ((body.role && body.role !== 'admin') || body.status === 'disabled');
    if (demotesSelf) throw conflict('لا يمكنك تعطيل حسابك أو سحب صلاحية الإدارة منه', 'SELF_LOCKOUT');
    const removesAdmin =
      target.role === 'admin' && target.status === 'active' && ((body.role && body.role !== 'admin') || body.status === 'disabled');
    if (removesAdmin && activeAdminCount(db) <= 1) throw conflict('يجب أن يبقى مدير نشط واحد على الأقل', 'LAST_ADMIN');
    const updated = db.update(users).set(body).where(eq(users.id, target.id)).returning().get();
    if (body.status === 'disabled') destroyUserSessions(db, target.id);
    audit(req, { action: 'user_updated', entityType: 'user', entityId: target.id, meta: { fields: Object.keys(body) } });
    return toPublicUser(updated);
  });

  app.post<{ Params: { id: string } }>('/users/:id/reset-password', admin, async (req) => {
    const { db } = getCtx(req);
    const target = requireUser(db, req.params.id);
    const body = parse(resetPasswordSchema, req.body);
    const passwordHash = await hashPassword(body.newPassword, app.config.scrypt);
    db.update(users).set({ passwordHash, mustChangePassword: true, failedLogins: 0, lockedUntil: null }).where(eq(users.id, target.id)).run();
    destroyUserSessions(db, target.id);
    audit(req, { action: 'password_reset', entityType: 'user', entityId: target.id });
    return { ok: true };
  });

  /** حذف نهائي لحساب وكل بياناته (حق المحو): يشترط تعطيله أولًا وكتابة بريده للتأكيد */
  app.delete<{ Params: { id: string }; Querystring: { confirm?: string } }>('/users/:id', admin, async (req) => {
    const { db, user: me } = getCtx(req);
    const target = requireUser(db, req.params.id);
    if (target.id === me.id) throw conflict('لا يمكنك حذف حسابك الخاص', 'SELF_DELETE');
    if (target.status !== 'disabled') throw conflict('عطّل الحساب أولًا قبل حذفه نهائيًا', 'NOT_DISABLED');
    if (req.query.confirm?.toLowerCase() !== target.email)
      throw new AppError(400, 'CONFIRM_MISMATCH', 'اكتب البريد الإلكتروني للمستخدم لتأكيد الحذف');
    db.delete(users).where(eq(users.id, target.id)).run();
    audit(req, { action: 'user_deleted', entityType: 'user', entityId: target.id });
    return { ok: true };
  });
};
