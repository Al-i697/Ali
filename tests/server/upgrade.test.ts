// ترقية قاعدة بيانات قائمة: لا تُطبَّق الهجرات على بيانات حقيقية بلا نسخة أمان، ولا تضيع البيانات.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/server/app';
import { loadConfig } from '../../src/server/config';
import { AppDatabase } from '../../src/server/db/client';
import { TestClient, seedFor } from './helpers';

const dirs: string[] = [];
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

describe('ترقية قاعدة بيانات إلى أحدث هجرة', () => {
  it('تأخذ نسخة pre-migration قبل الترقية وتُبقي كل البيانات سليمة وتضيف الجداول الجديدة', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sijilli-upgrade-'));
    dirs.push(dir);
    const config = loadConfig({ NODE_ENV: 'test', DATA_DIR: dir, BACKUP_INTERVAL_HOURS: '0' });

    // مجلد هجرات «قديم»: الهجرة الأولى فقط (كأن النظام لم يُرقَّ بعد)
    const journal = JSON.parse(fs.readFileSync(path.join(config.migrationsDir, 'meta', '_journal.json'), 'utf8')) as { entries: { tag: string }[] };
    expect(journal.entries.length).toBeGreaterThanOrEqual(2); // يلزم وجود هجرة لاحقة لاختبار الترقية
    const oldDir = path.join(dir, 'old-migrations');
    fs.mkdirSync(path.join(oldDir, 'meta'), { recursive: true });
    fs.copyFileSync(path.join(config.migrationsDir, `${journal.entries[0]!.tag}.sql`), path.join(oldDir, `${journal.entries[0]!.tag}.sql`));
    fs.writeFileSync(path.join(oldDir, 'meta', '_journal.json'), JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) }));

    // 1) قاعدة بالمخطط القديم وفيها بيانات حقيقية
    const old = AppDatabase.open(config.databaseFile);
    old.migrate(oldDir);
    expect(old.pendingMigrations(config.migrationsDir)).toBe(journal.entries.length - 1);
    const app1 = await buildApp({ config, db: old });
    await app1.ready();
    const c1 = new TestClient(app1);
    await c1.setupAdmin('owner@school.om');
    const seeded = await seedFor(c1);
    expect(seeded.roster).toHaveLength(3);
    await app1.close();
    expect(old.sqlite.prepare("select name from sqlite_master where name='support_plans'").get()).toBeUndefined();
    old.close();

    // 2) بدء التطبيق بالمخطط الأحدث: نسخة أمان ثم ترقية
    const app2 = await buildApp({ config });
    await app2.ready();
    const backups = fs.readdirSync(config.backupDir).filter((f) => f.endsWith('-pre-migration.sqlite'));
    expect(backups).toHaveLength(1);

    // النسخة الاحتياطية تحمل المخطط القديم والبيانات كاملة
    const snap = AppDatabase.open(path.join(config.backupDir, backups[0]!));
    expect((snap.sqlite.prepare('select count(*) c from students').get() as { c: number }).c).toBe(3);
    expect(snap.sqlite.prepare("select name from sqlite_master where name='support_plans'").get()).toBeUndefined();
    snap.close();

    // القاعدة الحيّة: بياناتها سليمة والجداول الجديدة موجودة، والدخول يعمل بنفس الحساب
    expect(app2.db.sqlite.prepare("select name from sqlite_master where name='support_plans'").get()).toBeTruthy();
    expect((app2.db.sqlite.prepare('select count(*) c from students').get() as { c: number }).c).toBe(3);
    expect(app2.db.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(app2.db.sqlite.pragma('foreign_key_check')).toEqual([]);
    const c2 = new TestClient(app2);
    expect((await c2.login('owner@school.om', 'Str0ng-Pass!')).status).toBe(200);
    expect((await c2.get('/api/support-plans')).body).toEqual([]);
    await app2.close();

    // 3) إعادة التشغيل لا تُنشئ نسخة ثانية (لا هجرات معلّقة)
    const app3 = await buildApp({ config });
    await app3.ready();
    expect(fs.readdirSync(config.backupDir).filter((f) => f.endsWith('-pre-migration.sqlite'))).toHaveLength(1);
    await app3.close();
  });
});
