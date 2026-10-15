import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClient, makeFileEnv, multipart, seedFor } from './helpers';

type FileEnv = Awaited<ReturnType<typeof makeFileEnv>>;

const countStudents = (env: FileEnv) => (env.db.sqlite.prepare('select count(*) c from students').get() as { c: number }).c;
const cookieHeader = (c: TestClient) => [...c.cookies].map(([k, v]) => `${k}=${v}`).join('; ');

describe('النسخ الاحتياطي والاستعادة', () => {
  let env: FileEnv;
  let admin: TestClient;
  let ctx: Awaited<ReturnType<typeof seedFor>>;

  beforeAll(async () => {
    env = await makeFileEnv({ BACKUP_KEEP: '2' });
    admin = new TestClient(env.app);
    await admin.setupAdmin();
    ctx = await seedFor(admin);
  });
  afterAll(async () => env.cleanup());

  it('ينشئ نسخة صالحة (SQLite سليمة) ويعرضها في القائمة', async () => {
    const r = await admin.post('/api/backups');
    expect(r.status).toBe(201);
    expect(r.body.name).toMatch(/^sijilli-\d{8}-\d{6}-\d{3}-manual\.sqlite$/);
    expect(r.body.encrypted).toBe(false);

    const list = (await admin.get('/api/backups')).body;
    expect(list.items.map((b: any) => b.name)).toContain(r.body.name);

    const file = path.join(env.config.backupDir, r.body.name);
    const copy = new Database(file, { readonly: true });
    expect((copy.prepare('select count(*) c from students').get() as { c: number }).c).toBe(3);
    expect(copy.pragma('integrity_check', { simple: true })).toBe('ok');
    copy.close();
    expect((fs.statSync(file).mode & 0o777).toString(8)).toBe('600'); // صلاحيات خاصة
  });

  it('يحمّل النسخة كما هي', async () => {
    const name = (await admin.get('/api/backups')).body.items[0].name;
    const r = await admin.get(`/api/backups/${name}/download`);
    expect(r.status).toBe(200);
    expect(r.raw.subarray(0, 15).toString()).toBe('SQLite format 3');
  });

  it('يستعيد حالة سابقة بالكامل وينشئ نسخة أمان من الحالة الحالية', async () => {
    const backup = (await admin.post('/api/backups')).body;
    // تغيير بعد النسخة: إضافة طالب
    await admin.post(`/api/sections/${ctx.section.id}/students`, { students: [{ fullName: 'طالب أُضيف بعد النسخة' }] });
    expect(countStudents(env)).toBe(4);

    const r = await admin.post(`/api/backups/${backup.name}/restore`, { confirm: true });
    expect(r.status).toBe(200);
    expect(r.body.safety).toMatch(/pre-restore/);
    expect(countStudents(env)).toBe(3); // عادت الحالة السابقة
    // نسخة الأمان تحتوي الحالة التي كانت قبل الاستعادة (4 طلاب)
    const safety = new Database(path.join(env.config.backupDir, r.body.safety), { readonly: true });
    expect((safety.prepare('select count(*) c from students').get() as { c: number }).c).toBe(4);
    safety.close();
    // التطبيق ما زال يعمل بعد الاستعادة بنفس الاتصال
    expect((await admin.get('/api/students')).body.total).toBe(3);
  });

  it('يتطلب تأكيدًا صريحًا للاستعادة', async () => {
    const name = (await admin.get('/api/backups')).body.items[0].name;
    expect((await admin.post(`/api/backups/${name}/restore`, {})).status).toBe(400);
    expect((await admin.post(`/api/backups/${name}/restore`, { confirm: false })).status).toBe(400);
  });

  it('يحمي من أسماء الملفات الخبيثة (path traversal)', async () => {
    for (const bad of ['..%2F..%2Fetc%2Fpasswd', 'sijilli.sqlite', '..', 'x.sqlite']) {
      expect((await admin.get(`/api/backups/${bad}/download`)).status).toBe(404);
      expect((await admin.del(`/api/backups/${bad}`)).status).toBe(404);
    }
  });

  it('يرفض استعادة ملف ليس قاعدة بيانات أو ليس من سجلي', async () => {
    const send = async (content: Buffer | string) => {
      const { payload, headers } = multipart('x.sqlite', content, 'application/octet-stream');
      return env.app.inject({
        method: 'POST',
        url: '/api/backups/restore-upload',
        payload,
        headers: { ...headers, cookie: cookieHeader(admin), 'x-sijilli-client': 'web' },
      });
    };
    const garbage = await send('this is not a database');
    expect(garbage.statusCode).toBe(400);
    expect(garbage.json().error.code).toBe('BAD_BACKUP');

    // قاعدة SQLite سليمة لكنها ليست من سجلي
    const foreign = path.join(env.dir, 'foreign.sqlite');
    const fdb = new Database(foreign);
    fdb.exec('create table t(x)');
    fdb.close();
    const r = await send(fs.readFileSync(foreign));
    expect(r.statusCode).toBe(400);
    expect(r.json().error.code).toBe('NOT_SIJILLI_BACKUP');
    expect(countStudents(env)).toBe(3); // لم تتأثر البيانات الحالية
  });

  it('يستعيد من ملف مرفوع من جهاز المدير', async () => {
    const backup = (await admin.post('/api/backups')).body;
    await admin.post(`/api/sections/${ctx.section.id}/students`, { students: [{ fullName: 'طالب آخر بعد النسخة' }] });
    const { payload, headers } = multipart('mine.sqlite', fs.readFileSync(path.join(env.config.backupDir, backup.name)), 'application/octet-stream');
    const r = await env.app.inject({
      method: 'POST',
      url: '/api/backups/restore-upload',
      payload,
      headers: { ...headers, cookie: cookieHeader(admin), 'x-sijilli-client': 'web' },
    });
    expect(r.statusCode).toBe(200);
    expect(countStudents(env)).toBe(3);
  });

  it('يحتفظ بعدد محدد من النسخ التلقائية فقط ولا يحذف اليدوية', async () => {
    for (let i = 0; i < 4; i++) await env.app.backups.create('auto');
    const items = env.app.backups.list();
    expect(items.filter((b) => b.reason === 'auto')).toHaveLength(2);
    expect(items.filter((b) => b.reason === 'manual').length).toBeGreaterThanOrEqual(2);
  });

  it('المعلم العادي لا يصل إلى النسخ الاحتياطية', async () => {
    await admin.post('/api/users', { email: 't@school.om', password: 'Temp-Pass-91', fullName: 'معلم' });
    const t = new TestClient(env.app);
    await t.login('t@school.om', 'Temp-Pass-91');
    await t.post('/api/auth/password', { currentPassword: 'Temp-Pass-91', newPassword: 'Real-Pass-77' });
    expect((await t.get('/api/backups')).status).toBe(403);
    expect((await t.post('/api/backups')).status).toBe(403);
  });

  it('يحذف نسخة ويُسجَّل ذلك في التدقيق', async () => {
    const name = env.app.backups.list().find((b) => b.reason === 'manual')!.name;
    expect((await admin.del(`/api/backups/${name}`)).status).toBe(200);
    expect(fs.existsSync(path.join(env.config.backupDir, name))).toBe(false);
    const rows = env.db.sqlite.prepare("select action from audit_log where action like 'backup_%'").all() as { action: string }[];
    expect(rows.map((r) => r.action)).toEqual(expect.arrayContaining(['backup_created', 'backup_restored', 'backup_deleted']));
  });
});

describe('تشفير النسخ الاحتياطية', () => {
  let env: FileEnv;
  let admin: TestClient;

  beforeAll(async () => {
    env = await makeFileEnv({ BACKUP_PASSPHRASE: 'عبارة-سرية-طويلة-123' });
    admin = new TestClient(env.app);
    await admin.setupAdmin();
    await seedFor(admin);
  });
  afterAll(async () => env.cleanup());

  it('تُنشأ النسخة مشفّرة ولا تُقرأ كقاعدة بيانات ولا تحوي نصًا صريحًا', async () => {
    const b = (await admin.post('/api/backups')).body;
    expect(b.encrypted).toBe(true);
    expect(b.name.endsWith('.sqlite.enc')).toBe(true);
    const buf = fs.readFileSync(path.join(env.config.backupDir, b.name));
    expect(buf.subarray(0, 6).toString()).toBe('SJLBK1');
    expect(buf.includes(Buffer.from('SQLite format 3'))).toBe(false);
    expect(buf.includes(Buffer.from('أحمد بن سالم الحارثي'))).toBe(false);
  });

  it('تُستعاد بالعبارة الصحيحة', async () => {
    const name = env.app.backups.list()[0]!.name;
    await admin.post(`/api/sections/${(await admin.get('/api/sections?yearId=' + (await admin.get('/api/years')).body[0].id)).body[0].id}/students`, { students: [{ fullName: 'بعد النسخة المشفّرة' }] });
    expect((await admin.post(`/api/backups/${name}/restore`, { confirm: true })).status).toBe(200);
    expect(countStudents(env)).toBe(3);
  });

  it('يفشل فك التشفير بعبارة خاطئة أو عند العبث بالملف، دون المساس بالبيانات', async () => {
    const name = env.app.backups.list()[0]!.name;
    const file = path.join(env.config.backupDir, name);

    // ملف معبوث به (قلب بايت في المنتصف)
    const tampered = Buffer.from(fs.readFileSync(file));
    tampered[Math.floor(tampered.length / 2)]! ^= 0xff;
    const tamperedPath = path.join(env.config.backupDir, 'sijilli-20990101-000000-000-manual.sqlite.enc');
    fs.writeFileSync(tamperedPath, tampered);
    const r1 = await admin.post(`/api/backups/${path.basename(tamperedPath)}/restore`, { confirm: true });
    expect(r1.status).toBe(400);
    expect(r1.body.error.code).toBe('DECRYPT_FAILED');
    expect(countStudents(env)).toBe(3);

    // خادم بعبارة مختلفة
    const other = await makeFileEnv({ BACKUP_PASSPHRASE: 'عبارة-أخرى-خاطئة' });
    try {
      await expect(other.app.backups.restoreFrom(file)).rejects.toMatchObject({ code: 'DECRYPT_FAILED' });
    } finally {
      await other.cleanup();
    }
  });
});

describe('نظافة مجلد النسخ الاحتياطية', () => {
  it('كل نسخة ملف واحد قائم بذاته: بلا ملفات -wal/-shm/.partial جانبية، بوضع DELETE، وتبقى سليمة بعد الفتح والتحقق', async () => {
    const env = await makeFileEnv();
    try {
      const admin = new TestClient(env.app);
      await admin.setupAdmin();
      await seedFor(admin);
      const created = await admin.post('/api/backups');
      expect(created.status).toBe(201);
      const file = path.join(env.config.backupDir, created.body.name);
      // رأس SQLite: البايتان 18 و19 = 1 (وضع DELETE القديم) وليس 2 (WAL)
      const header = Buffer.alloc(20);
      const fd = fs.openSync(file, 'r');
      fs.readSync(fd, header, 0, 20, 0);
      fs.closeSync(fd);
      expect([header[18], header[19]]).toEqual([1, 1]);
      // فحص الاستعادة (يفتح الملف) لا يترك أثرًا أيضًا
      env.app.backups.validateCandidate(file);
      expect(fs.readdirSync(env.config.backupDir)).toEqual([created.body.name]);
    } finally {
      await env.cleanup();
    }
  });
});
