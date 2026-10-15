// تشفير ملفات النسخ الاحتياطي: AES-256-GCM بمفتاح مشتق من عبارة المرور عبر scrypt.
// الصيغة: "SJLBK1" | salt(16) | iv(12) | ciphertext | authTag(16). التحقق من الوسم يتم عند فك التشفير فيُرفض أي تلاعب.
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'node:crypto';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';

const MAGIC = Buffer.from('SJLBK1');
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const HEADER_LEN = MAGIC.length + SALT_LEN + IV_LEN;

function deriveKey(passphrase: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(passphrase.normalize('NFKC'), salt, 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

export async function encryptFile(src: string, dest: string, passphrase: string): Promise<void> {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = await deriveKey(passphrase, salt);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const out = fs.createWriteStream(dest, { mode: 0o600 });
  out.write(Buffer.concat([MAGIC, salt, iv]));
  await pipeline(fs.createReadStream(src), cipher, out, { end: false });
  out.end(cipher.getAuthTag());
  await new Promise<void>((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });
}

export function isEncryptedBackup(file: string): boolean {
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(MAGIC.length);
    fs.readSync(fd, head, 0, MAGIC.length, 0);
    return head.equals(MAGIC);
  } finally {
    fs.closeSync(fd);
  }
}

/** يفكّ التشفير إلى ملف مؤقت. يرمي خطأً عند عبارة خاطئة أو ملف معبوث به */
export async function decryptFile(src: string, dest: string, passphrase: string): Promise<void> {
  const size = fs.statSync(src).size;
  if (size < HEADER_LEN + TAG_LEN) throw new Error('ملف مشفّر غير صالح');
  const fd = fs.openSync(src, 'r');
  const head = Buffer.alloc(HEADER_LEN);
  const tag = Buffer.alloc(TAG_LEN);
  try {
    fs.readSync(fd, head, 0, HEADER_LEN, 0);
    fs.readSync(fd, tag, 0, TAG_LEN, size - TAG_LEN);
  } finally {
    fs.closeSync(fd);
  }
  if (!head.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('ليس ملف نسخة احتياطية مشفّرًا من سجلي');
  const salt = head.subarray(MAGIC.length, MAGIC.length + SALT_LEN);
  const iv = head.subarray(MAGIC.length + SALT_LEN);
  const key = await deriveKey(passphrase, salt);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  try {
    await pipeline(
      fs.createReadStream(src, { start: HEADER_LEN, end: size - TAG_LEN - 1 }),
      decipher,
      fs.createWriteStream(dest, { mode: 0o600 }),
    );
  } catch {
    fs.rmSync(dest, { force: true });
    throw new Error('عبارة المرور غير صحيحة أو أن الملف تالف');
  }
}
