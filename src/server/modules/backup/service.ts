import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { BackupDto, BackupReason } from '../../../shared/dto';
import type { AppConfig } from '../../config';
import type { AppDatabase } from '../../db/client';
import { decryptFile, encryptFile, isEncryptedBackup } from '../../lib/crypto-file';
import { badRequest, notFound } from '../../lib/errors';

export type { BackupReason };

const NAME_RE = /^sijilli-(\d{8}-\d{6}-\d{3})-(manual|auto|pre-migration|pre-restore)\.sqlite(\.enc)?$/;
const KEEP_OTHER = 5;

function stamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}-${String(d.getUTCMilliseconds()).padStart(3, '0')}`;
}

type Cfg = Pick<AppConfig, 'backupDir' | 'backupKeep' | 'backupPassphrase' | 'backupIntervalHours' | 'migrationsDir' | 'databaseFile'>;

export class BackupService {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly db: AppDatabase,
    private readonly cfg: Cfg,
    private readonly log: { info: (o: object, m?: string) => void; error: (o: object, m?: string) => void } = { info() {}, error() {} },
  ) {}

  get encrypted(): boolean {
    return Boolean(this.cfg.backupPassphrase);
  }

  private dir(): string {
    fs.mkdirSync(this.cfg.backupDir, { recursive: true, mode: 0o700 });
    return this.cfg.backupDir;
  }

  list(): BackupDto[] {
    const dir = this.dir();
    return fs
      .readdirSync(dir)
      .map((name) => ({ name, m: NAME_RE.exec(name) }))
      .filter((x): x is { name: string; m: RegExpExecArray } => x.m !== null)
      .map(({ name, m }) => {
        const st = fs.statSync(path.join(dir, name));
        return { name, size: st.size, createdAt: st.mtime.toISOString(), encrypted: m[3] === '.enc', reason: m[2] as BackupReason };
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  /** مسار ملف نسخة بعد التحقق الصارم من الاسم (يمنع الخروج من مجلد النسخ) */
  resolve(name: string): string {
    if (!NAME_RE.test(name)) throw notFound('النسخة الاحتياطية');
    const full = path.join(this.dir(), name);
    if (!fs.existsSync(full)) throw notFound('النسخة الاحتياطية');
    return full;
  }

  async create(reason: BackupReason): Promise<BackupDto> {
    const dir = this.dir();
    const base = `sijilli-${stamp()}-${reason}.sqlite`;
    const plain = path.join(dir, `${base}.partial`);
    await this.db.backupTo(plain);
    try {
      // نتحقق من سلامة النسخة قبل اعتمادها — نسخة تالفة أخطر من عدم وجود نسخة
      const check = new Database(plain, { readonly: true, fileMustExist: true });
      try {
        const res = String(check.pragma('integrity_check', { simple: true }));
        if (res !== 'ok') throw new Error(`فشل فحص سلامة النسخة: ${res}`);
      } finally {
        check.close();
      }
      const finalName = this.encrypted ? `${base}.enc` : base;
      const finalPath = path.join(dir, finalName);
      if (this.cfg.backupPassphrase) {
        await encryptFile(plain, finalPath, this.cfg.backupPassphrase);
        fs.rmSync(plain, { force: true });
      } else {
        fs.renameSync(plain, finalPath);
        fs.chmodSync(finalPath, 0o600);
      }
      this.prune();
      const st = fs.statSync(finalPath);
      return { name: finalName, size: st.size, createdAt: st.mtime.toISOString(), encrypted: this.encrypted, reason };
    } catch (err) {
      fs.rmSync(plain, { force: true });
      throw err;
    }
  }

  /** الاحتفاظ: التلقائية بعدد BACKUP_KEEP، وما قبل الترقية/الاستعادة بآخر 5. اليدوية لا تُحذف تلقائيًا */
  prune(): void {
    const all = this.list();
    const del = (xs: { name: string }[]) => xs.forEach((x) => fs.rmSync(path.join(this.cfg.backupDir, x.name), { force: true }));
    del(all.filter((b) => b.reason === 'auto').slice(this.cfg.backupKeep));
    for (const r of ['pre-migration', 'pre-restore'] as const) del(all.filter((b) => b.reason === r).slice(KEEP_OTHER));
  }

  delete(name: string): void {
    fs.rmSync(this.resolve(name), { force: true });
  }

  /**
   * فحص ملف قاعدة بيانات مرشّح للاستعادة دون المساس بالحالية.
   * يرفض: ملفًا ليس SQLite، فاشل السلامة، ليس من سجلي، أو من إصدار أحدث من هذا التطبيق.
   */
  validateCandidate(file: string): { users: number } {
    let cand: Database.Database;
    try {
      cand = new Database(file, { readonly: true, fileMustExist: true });
    } catch {
      throw badRequest('الملف ليس قاعدة بيانات صالحة', 'BAD_BACKUP');
    }
    try {
      let integrity: string;
      try {
        integrity = String(cand.pragma('integrity_check', { simple: true }));
      } catch {
        throw badRequest('الملف ليس قاعدة بيانات صالحة', 'BAD_BACKUP');
      }
      if (integrity !== 'ok') throw badRequest('النسخة الاحتياطية تالفة (فشل فحص السلامة)', 'CORRUPT_BACKUP');
      const tables = new Set((cand.prepare("select name from sqlite_master where type='table'").all() as { name: string }[]).map((t) => t.name));
      for (const need of ['users', 'students', 'assessments', 'assessment_results', '__drizzle_migrations'])
        if (!tables.has(need)) throw badRequest('الملف ليس نسخة احتياطية من «سجلي»', 'NOT_SIJILLI_BACKUP');
      const applied = (cand.prepare('select count(*) c from __drizzle_migrations').get() as { c: number }).c;
      const journal = JSON.parse(fs.readFileSync(path.join(this.cfg.migrationsDir, 'meta', '_journal.json'), 'utf8')) as { entries: unknown[] };
      if (applied > journal.entries.length)
        throw badRequest('هذه النسخة من إصدار أحدث من التطبيق الحالي. حدّث التطبيق أولًا', 'BACKUP_TOO_NEW');
      return { users: (cand.prepare('select count(*) c from users').get() as { c: number }).c };
    } finally {
      cand.close();
    }
  }

  /** استعادة من ملف (قد يكون مشفّرًا). تُنشأ نسخة أمان من الحالية أولًا */
  async restoreFrom(file: string): Promise<{ safety: string; users: number }> {
    const tmp = path.join(this.dir(), `restore-${stamp()}.tmp`);
    let candidate = file;
    try {
      if (isEncryptedBackup(file)) {
        if (!this.cfg.backupPassphrase) throw badRequest('النسخة مشفّرة. اضبط BACKUP_PASSPHRASE على الخادم ثم أعد المحاولة', 'PASSPHRASE_REQUIRED');
        try {
          await decryptFile(file, tmp, this.cfg.backupPassphrase);
        } catch (e) {
          throw badRequest((e as Error).message, 'DECRYPT_FAILED');
        }
        candidate = tmp;
      }
      const info = this.validateCandidate(candidate);
      const safety = await this.create('pre-restore');
      this.db.replaceWith(candidate, this.cfg.migrationsDir);
      this.log.info({ safety: safety.name }, 'database restored from backup');
      return { safety: safety.name, users: info.users };
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  }

  // ───────── الجدولة ─────────
  start(): void {
    const hours = this.cfg.backupIntervalHours;
    if (!hours || hours <= 0) return;
    const tick = () => {
      const last = this.list().find((b) => b.reason === 'auto');
      const age = last ? Date.now() - new Date(last.createdAt).getTime() : Infinity;
      if (age >= hours * 3_600_000 - 60_000) {
        this.create('auto').then(
          (b) => this.log.info({ backup: b.name }, 'automatic backup created'),
          (err) => this.log.error({ err }, 'automatic backup failed'),
        );
      }
    };
    setTimeout(tick, 15_000).unref();
    this.timer = setInterval(tick, 60 * 60_000);
    this.timer.unref();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

