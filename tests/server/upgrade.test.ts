// ترقية قاعدة بيانات قائمة: لا تُطبَّق الهجرات على بيانات حقيقية بلا نسخة أمان، ولا تضيع البيانات.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/server/app';
import { loadConfig } from '../../src/server/config';
import { AppDatabase } from '../../src/server/db/client';
import { getAiEnabled } from '../../src/server/modules/ai/service';
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
    expect(old.sqlite.prepare("select name from sqlite_master where name='lab_activities'").get()).toBeUndefined();
    expect(old.sqlite.prepare("select name from sqlite_master where name='app_settings'").get()).toBeUndefined();
    expect(old.sqlite.prepare("select name from sqlite_master where name='class_participation'").get()).toBeUndefined();
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
    expect(app2.db.sqlite.prepare("select name from sqlite_master where name='lab_activities'").get()).toBeTruthy();
    expect(app2.db.sqlite.prepare("select name from sqlite_master where name='app_settings'").get()).toBeTruthy();
    // إدارة الصف: جدولان جديدان فارغان لا يمسّان أي بيانات قائمة
    expect(app2.db.sqlite.prepare("select name from sqlite_master where name='class_participation'").get()).toBeTruthy();
    expect(app2.db.sqlite.prepare("select name from sqlite_master where name='class_records'").get()).toBeTruthy();
    expect((app2.db.sqlite.prepare('select count(*) c from class_participation').get() as { c: number }).c).toBe(0);
    // الترقية لا تُفعّل المساعد الذكي: لا موافقة مسجّلة ولا صفوف في app_settings
    expect((app2.db.sqlite.prepare('select count(*) c from app_settings').get() as { c: number }).c).toBe(0);
    expect(getAiEnabled(app2.db.orm)).toBe(false);
    expect((app2.db.sqlite.prepare('select count(*) c from students').get() as { c: number }).c).toBe(3);
    expect(app2.db.sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(app2.db.sqlite.pragma('foreign_key_check')).toEqual([]);
    const c2 = new TestClient(app2);
    expect((await c2.login('owner@school.om', 'Str0ng-Pass!')).status).toBe(200);
    expect((await c2.get('/api/support-plans')).body).toEqual([]);
    expect((await c2.get('/api/lab-activities')).body).toMatchObject({ items: [], total: 0 });
    await app2.close();

    // 3) إعادة التشغيل لا تُنشئ نسخة ثانية (لا هجرات معلّقة)
    const app3 = await buildApp({ config });
    await app3.ready();
    expect(fs.readdirSync(config.backupDir).filter((f) => f.endsWith('-pre-migration.sqlite'))).toHaveLength(1);
    await app3.close();
  });
  it('استعادة نسخة احتياطية بمخطط أقدم (من قبل الوحدات الجديدة) تُرقّى تلقائيًا بعد الاستعادة فتعمل كل الوحدات ببياناتها السليمة', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sijilli-restore-old-'));
    dirs.push(dir);
    const config = loadConfig({ NODE_ENV: 'test', DATA_DIR: dir, BACKUP_INTERVAL_HOURS: '0' });
    const journal = JSON.parse(fs.readFileSync(path.join(config.migrationsDir, 'meta', '_journal.json'), 'utf8')) as { entries: { tag: string }[] };
    const oldDir = path.join(dir, 'old-migrations');
    fs.mkdirSync(path.join(oldDir, 'meta'), { recursive: true });
    fs.copyFileSync(path.join(config.migrationsDir, `${journal.entries[0]!.tag}.sql`), path.join(oldDir, `${journal.entries[0]!.tag}.sql`));
    fs.writeFileSync(path.join(oldDir, 'meta', '_journal.json'), JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) }));

    // 1) قاعدة بالمخطط القديم وفيها بيانات، تُحفظ نسخةً احتياطية «قديمة»
    const old = AppDatabase.open(config.databaseFile);
    old.migrate(oldDir);
    const app1 = await buildApp({ config, db: old });
    await app1.ready();
    const c1 = new TestClient(app1);
    await c1.setupAdmin('owner@school.om');
    await seedFor(c1);
    await app1.close();
    old.sqlite.pragma('wal_checkpoint(TRUNCATE)');
    old.close();
    fs.mkdirSync(config.backupDir, { recursive: true });
    const oldName = 'sijilli-20260101-000000-000-manual.sqlite';
    fs.copyFileSync(config.databaseFile, path.join(config.backupDir, oldName));

    // 2) تشغيل بالمخطط الأحدث (يُرقّي القاعدة الحيّة)، ثم نضيف بيانات جديدة لا وجود لها في النسخة القديمة
    const app2 = await buildApp({ config });
    await app2.ready();
    const c2 = new TestClient(app2);
    await c2.login('owner@school.om', 'Str0ng-Pass!');
    expect((await c2.post('/api/lab-activities', { date: '2026-10-01', title: 'نشاط بعد الترقية' })).status).toBe(201);

    // 3) الاستعادة من النسخة القديمة: تُستبدل القاعدة ثم تُرقّى بالهجرات المعلّقة
    const r = await c2.post(`/api/backups/${oldName}/restore`, { confirm: true });
    expect(r.status).toBe(200);
    const sqlite = app2.db.sqlite;
    expect(sqlite.prepare("select name from sqlite_master where name='lab_activities'").get()).toBeTruthy();
    expect((sqlite.prepare('select count(*) c from lab_activities').get() as { c: number }).c).toBe(0); // لا أثر لنشاط ما بعد النسخة
    expect((sqlite.prepare('select count(*) c from students').get() as { c: number }).c).toBe(3); // بيانات النسخة سليمة
    expect(sqlite.pragma('integrity_check', { simple: true })).toBe('ok');
    expect(sqlite.pragma('foreign_key_check')).toEqual([]);
    expect(app2.db.pendingMigrations(config.migrationsDir)).toBe(0);

    // 4) والوحدات الجديدة تعمل فعلًا بعد الاستعادة (دخول جديد لأن الجلسات من النسخة القديمة)
    const c3 = new TestClient(app2);
    expect((await c3.login('owner@school.om', 'Str0ng-Pass!')).status).toBe(200);
    expect((await c3.post('/api/lab-activities', { date: '2026-10-02', title: 'نشاط بعد الاستعادة' })).status).toBe(201);
    expect((await c3.get('/api/lab-activities')).body.total).toBe(1);
    expect((await c3.get('/api/support-plans')).body).toEqual([]);
    await app2.close();
  });
});
