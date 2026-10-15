import { and, count, eq } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import type { ScryptParams } from '../../config';
import { conflict, notFound } from '../../lib/errors';
import { hashPassword } from '../../lib/password';
import type { AuthUser } from '../../types';
import type { UserRole } from '../../../shared/constants';

const { users, userSettings } = schema;

export type UserRow = typeof users.$inferSelect;

export function countUsers(db: Db): number {
  return db.select({ c: count() }).from(users).get()?.c ?? 0;
}

export function findUserByEmail(db: Db, email: string): UserRow | undefined {
  return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
}

export function findUserById(db: Db, id: string): UserRow | undefined {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function toAuthUser(u: UserRow): AuthUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    isDemo: u.isDemo,
    mustChangePassword: u.mustChangePassword,
  };
}

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserRow['status'];
  isDemo: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function toPublicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    status: u.status,
    isDemo: u.isDemo,
    mustChangePassword: u.mustChangePassword,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
}

export type NewUser = {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  isDemo?: boolean;
  mustChangePassword?: boolean;
};

/** ينشئ المستخدم وصف إعداداته (الافتراضية) في معاملة واحدة */
export async function createUser(db: Db, scrypt: ScryptParams, input: NewUser): Promise<UserRow> {
  const email = input.email.toLowerCase();
  if (findUserByEmail(db, email)) throw conflict('هذا البريد الإلكتروني مسجّل مسبقًا', 'EMAIL_TAKEN');
  const passwordHash = await hashPassword(input.password, scrypt);
  return db.transaction((tx) => {
    const user = tx
      .insert(users)
      .values({
        email,
        fullName: input.fullName,
        passwordHash,
        role: input.role,
        isDemo: input.isDemo ?? false,
        mustChangePassword: input.mustChangePassword ?? false,
      })
      .returning()
      .get();
    tx.insert(userSettings).values({ userId: user.id }).run();
    return user;
  });
}

export function listUsers(db: Db): PublicUser[] {
  return db.select().from(users).orderBy(users.createdAt).all().map(toPublicUser);
}

export function requireUser(db: Db, id: string): UserRow {
  const u = findUserById(db, id);
  if (!u) throw notFound('المستخدم');
  return u;
}

/** عدد المديرين النشطين (لمنع إغلاق النظام على نفسه) */
export function activeAdminCount(db: Db): number {
  return (
    db
      .select({ c: count() })
      .from(users)
      .where(and(eq(users.role, 'admin'), eq(users.status, 'active')))
      .get()?.c ?? 0
  );
}
