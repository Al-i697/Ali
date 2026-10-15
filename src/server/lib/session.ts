// جلسات من جهة الخادم: الرمز عشوائي 256-بت يُرسَل في كوكي HttpOnly، وما يُخزَّن في القاعدة هو SHA-256 له فقط.
// فلو تسرّبت القاعدة (أو نسخة احتياطية) لا يمكن انتحال الجلسات.
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, lt, ne } from 'drizzle-orm';
import type { Db } from '../db/client';
import { schema } from '../db/client';
import type { AuthContext } from '../types';

const { sessions, users } = schema;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** أقصى عمر مطلق للجلسة مهما جُدِّدت */
const ABSOLUTE_MAX_MS = 90 * DAY;
/** لا نكتب في القاعدة عند كل طلب: نجدد كل 10 دقائق فقط */
const TOUCH_INTERVAL_MS = 10 * 60_000;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateToken(): { token: string; id: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, id: hashToken(token) };
}

export type SessionTtl = { sessionHours: number; rememberDays: number };

function ttlMs(remember: boolean, ttl: SessionTtl): number {
  return remember ? ttl.rememberDays * DAY : ttl.sessionHours * HOUR;
}

export function createSession(
  db: Db,
  userId: string,
  opts: { remember: boolean; ip?: string | null; userAgent?: string | null; ttl: SessionTtl },
): { token: string; expiresAt: Date } {
  const { token, id } = generateToken();
  const expiresAt = new Date(Date.now() + ttlMs(opts.remember, opts.ttl));
  db.insert(sessions)
    .values({
      id,
      userId,
      expiresAt: expiresAt.toISOString(),
      remember: opts.remember,
      ip: opts.ip ?? null,
      userAgent: opts.userAgent?.slice(0, 300) ?? null,
    })
    .run();
  return { token, expiresAt };
}

/** يقرأ الجلسة ويتحقق من صلاحيتها وحالة المستخدم، ويجدّدها (انزلاقيًا) عند الحاجة */
export function readSession(db: Db, token: string, ttl: SessionTtl): AuthContext | null {
  const id = hashToken(token);
  const row = db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      lastSeenAt: sessions.lastSeenAt,
      createdAt: sessions.createdAt,
      remember: sessions.remember,
      userId: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      status: users.status,
      isDemo: users.isDemo,
      mustChangePassword: users.mustChangePassword,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id))
    .get();
  if (!row) return null;

  const now = Date.now();
  if (new Date(row.expiresAt).getTime() <= now || row.status !== 'active') {
    db.delete(sessions).where(eq(sessions.id, id)).run();
    return null;
  }

  if (now - new Date(row.lastSeenAt).getTime() > TOUCH_INTERVAL_MS) {
    const cap = new Date(row.createdAt).getTime() + ABSOLUTE_MAX_MS;
    const next = Math.min(now + ttlMs(row.remember, ttl), cap);
    db.update(sessions)
      .set({ lastSeenAt: new Date(now).toISOString(), expiresAt: new Date(next).toISOString() })
      .where(eq(sessions.id, id))
      .run();
  }

  return {
    sessionId: id,
    user: {
      id: row.userId,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      isDemo: row.isDemo,
      mustChangePassword: row.mustChangePassword,
    },
  };
}

export function destroySession(db: Db, sessionId: string): void {
  db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

/** إنهاء كل جلسات المستخدم (مع استثناء الحالية اختياريًا) — عند تغيير/إعادة تعيين كلمة المرور */
export function destroyUserSessions(db: Db, userId: string, exceptSessionId?: string): void {
  db.delete(sessions)
    .where(
      exceptSessionId
        ? and(eq(sessions.userId, userId), ne(sessions.id, exceptSessionId))
        : eq(sessions.userId, userId),
    )
    .run();
}

export function purgeExpiredSessions(db: Db): number {
  return db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString())).run().changes;
}
