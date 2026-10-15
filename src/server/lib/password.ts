// تجزئة كلمات المرور بـ scrypt (مدمجة في Node، مقاومة لعتاد التخمين). الصيغة تحمل المعاملات لتسهّل الترقية لاحقًا:
//   scrypt$N$r$p$salt(base64)$hash(base64)
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import type { ScryptParams } from '../config';

const KEY_LEN = 64;

function scryptAsync(password: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(
      password.normalize('NFKC'),
      salt,
      KEY_LEN,
      { N: params.N, r: params.r, p: params.p, maxmem: 256 * 1024 * 1024 },
      (err, key) => (err ? reject(err) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string, params: ScryptParams): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, params);
  return `scrypt$${params.N}$${params.r}$${params.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

type Parsed = { params: ScryptParams; salt: Buffer; hash: Buffer };

function parseHash(stored: string): Parsed | null {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [, n, r, p, salt, hash] = parts;
  const N = Number(n);
  const R = Number(r);
  const P = Number(p);
  if (![N, R, P].every(Number.isInteger) || !salt || !hash) return null;
  return { params: { N, r: R, p: P }, salt: Buffer.from(salt, 'base64'), hash: Buffer.from(hash, 'base64') };
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;
  const key = await scryptAsync(password, parsed.salt, parsed.params);
  return key.length === parsed.hash.length && timingSafeEqual(key, parsed.hash);
}

/** هل المعاملات المخزنة أضعف من المطلوبة حاليًا؟ (لإعادة التجزئة عند الدخول) */
export function needsRehash(stored: string, target: ScryptParams): boolean {
  const parsed = parseHash(stored);
  if (!parsed) return true;
  return parsed.params.N < target.N || parsed.params.r < target.r || parsed.params.p < target.p;
}

/** تجزئة وهمية للتنفيذ المتزامن زمنيًا عند عدم وجود المستخدم (تفادي كشف وجود الحساب بالتوقيت) */
export async function dummyVerify(password: string, params: ScryptParams): Promise<void> {
  await scryptAsync(password, Buffer.alloc(16), params);
}
