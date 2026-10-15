// عميل قاعدة البيانات: SQLite عبر better-sqlite3 + Drizzle.
// ضبطنا PRAGMA للمتانة: WAL للأداء، synchronous=FULL حتى لا تضيع درجة عند انقطاع الكهرباء،
// foreign_keys لفرض سلامة العلاقات، secure_delete ليُمحى محتوى المحذوف فعليًا (خصوصية الطلاب).
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export type Db = BetterSQLite3Database<typeof schema>;
export { schema };

export class AppDatabase {
  sqlite: Database.Database;
  orm: Db;

  private constructor(
    readonly file: string,
    sqlite: Database.Database,
  ) {
    this.sqlite = sqlite;
    this.orm = drizzle(sqlite, { schema });
  }

  static open(file: string): AppDatabase {
    if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    const sqlite = new Database(file);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('synchronous = FULL');
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('busy_timeout = 5000');
    sqlite.pragma('secure_delete = ON');
    sqlite.pragma('temp_store = MEMORY');
    if (file !== ':memory:') {
      try {
        fs.chmodSync(file, 0o600);
      } catch {
        /* أنظمة ملفات لا تدعم الصلاحيات */
      }
    }
    return new AppDatabase(file, sqlite);
  }

  /** هل توجد هجرات لم تُطبَّق بعد؟ (للنسخ الاحتياطي قبل الترقية) */
  pendingMigrations(migrationsDir: string): number {
    const journalPath = path.join(migrationsDir, 'meta', '_journal.json');
    if (!fs.existsSync(journalPath)) return 0;
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as { entries: unknown[] };
    const hasTable = this.sqlite
      .prepare("select 1 from sqlite_master where type='table' and name='__drizzle_migrations'")
      .get();
    if (!hasTable) return journal.entries.length;
    const applied = (
      this.sqlite.prepare('select count(*) as c from __drizzle_migrations').get() as { c: number }
    ).c;
    return Math.max(0, journal.entries.length - applied);
  }

  /** هل قاعدة البيانات تحتوي بيانات مستخدمين سابقة؟ */
  hasUserData(): boolean {
    const t = this.sqlite
      .prepare("select 1 from sqlite_master where type='table' and name='users'")
      .get();
    if (!t) return false;
    return Boolean(this.sqlite.prepare('select 1 from users limit 1').get());
  }

  migrate(migrationsDir: string): void {
    migrate(this.orm, { migrationsFolder: migrationsDir });
  }

  /** نسخة متسقة وآمنة أثناء التشغيل (واجهة النسخ الاحتياطي الداخلية لـ SQLite) */
  async backupTo(dest: string): Promise<void> {
    fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
    await this.sqlite.backup(dest);
    try {
      fs.chmodSync(dest, 0o600);
    } catch {
      /* تجاهل */
    }
  }

  integrityCheck(): string {
    return String(this.sqlite.pragma('integrity_check', { simple: true }));
  }

  close(): void {
    if (this.sqlite.open) this.sqlite.close();
  }
}
