import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClient, makeEnv, PASSWORD, type TestEnv } from './helpers';

let env: TestEnv;

beforeAll(async () => {
  env = await makeEnv();
});
afterAll(async () => {
  await env.app.close();
  env.db.close();
});

describe('الإعداد الأولي والدخول', () => {
  it('يبلغ أن النظام يحتاج إعدادًا قبل وجود مستخدمين', async () => {
    const c = new TestClient(env.app);
    const r = await c.get('/api/system/info');
    expect(r.status).toBe(200);
    expect(r.body.needsSetup).toBe(true);
  });

  it('يرفض الوصول لأي مورد بلا تسجيل دخول', async () => {
    const c = new TestClient(env.app);
    const r = await c.get('/api/settings');
    expect(r.status).toBe(401);
    expect(r.body.error.code).toBe('UNAUTHORIZED');
  });

  it('يرفض كلمات المرور الضعيفة برسالة عربية', async () => {
    const c = new TestClient(env.app);
    const r = await c.post('/api/auth/setup', { email: 'a@b.om', password: '12345678', fullName: 'علي' });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
    expect(r.body.error.fields.password).toBeTruthy();
  });

  it('أول مستخدم يصبح مديرًا ويُسجَّل دخوله بكوكي HttpOnly', async () => {
    const c = new TestClient(env.app);
    const r = await c.post('/api/auth/setup', { email: 'Admin@School.om', password: PASSWORD, fullName: 'سالم الحارثي' });
    expect(r.status).toBe(201);
    expect(r.body.user.role).toBe('admin');
    expect(r.body.user.email).toBe('admin@school.om'); // يُحوَّل لأحرف صغيرة
    const setCookie = String(r.headers['set-cookie']);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(r.body.user.passwordHash).toBeUndefined();

    const me = await c.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.fullName).toBe('سالم الحارثي');
  });

  it('يمنع الإعداد الأولي مرة ثانية', async () => {
    const c = new TestClient(env.app);
    const r = await c.post('/api/auth/setup', { email: 'x@y.om', password: PASSWORD, fullName: 'مستخدم' });
    expect(r.status).toBe(409);
    expect(r.body.error.code).toBe('ALREADY_SETUP');
  });

  it('لا يخزّن كلمة المرور نصًا صريحًا ولا الرمز الخام للجلسة', () => {
    const user = env.db.sqlite.prepare('select password_hash from users').get() as { password_hash: string };
    expect(user.password_hash.startsWith('scrypt$')).toBe(true);
    expect(user.password_hash).not.toContain(PASSWORD);
    const session = env.db.sqlite.prepare('select id from sessions').get() as { id: string };
    expect(session.id).toMatch(/^[0-9a-f]{64}$/); // SHA-256 وليس الرمز نفسه
  });

  it('يسجّل الدخول بالبيانات الصحيحة ويرفض الخاطئة برسالة عامة', async () => {
    const good = new TestClient(env.app);
    const ok = await good.login('admin@school.om', PASSWORD);
    expect(ok.status).toBe(200);

    const bad = new TestClient(env.app);
    const r1 = await bad.login('admin@school.om', 'wrong-password');
    const r2 = await bad.login('nobody@school.om', 'wrong-password');
    expect(r1.status).toBe(401);
    expect(r2.status).toBe(401);
    expect(r1.body.error.message).toBe(r2.body.error.message); // لا كشف لوجود الحساب
  });

  it('يقفل الحساب مؤقتًا بعد 5 محاولات فاشلة حتى لو كانت كلمة المرور صحيحة لاحقًا', async () => {
    const e2 = await makeEnv();
    const admin = await new TestClient(e2.app).setupAdmin();
    expect(admin).toBeTruthy();
    const c = new TestClient(e2.app);
    for (let i = 0; i < 5; i++) {
      const r = await c.login('admin@school.om', 'wrong-' + i);
      expect(r.status).toBe(401);
    }
    const locked = await c.login('admin@school.om', PASSWORD);
    expect(locked.status).toBe(429);
    await e2.app.close();
  });

  it('يُنهي الجلسة عند الخروج', async () => {
    const c = new TestClient(env.app);
    await c.login('admin@school.om', PASSWORD);
    expect((await c.get('/api/auth/me')).status).toBe(200);
    const out = await c.post('/api/auth/logout');
    expect(out.status).toBe(200);
    expect((await c.get('/api/auth/me')).status).toBe(401);
  });
});

describe('حماية CSRF', () => {
  it('يرفض طلبات التعديل بلا الرأس المخصص', async () => {
    const c = new TestClient(env.app, false);
    const r = await c.post('/api/auth/login', { email: 'admin@school.om', password: PASSWORD });
    expect(r.status).toBe(403);
  });

  it('يرفض Origin من موقع آخر', async () => {
    const c = new TestClient(env.app);
    const r = await c.post('/api/auth/login', { email: 'admin@school.om', password: PASSWORD }, { origin: 'https://evil.example', host: 'sijilli.local' });
    expect(r.status).toBe(403);
  });

  it('يقبل Origin المطابق للمضيف', async () => {
    const c = new TestClient(env.app);
    const r = await c.post('/api/auth/login', { email: 'admin@school.om', password: PASSWORD }, { origin: 'http://localhost:80', host: 'localhost:80' });
    expect(r.status).toBe(200);
  });
});

describe('إدارة المستخدمين والصلاحيات', () => {
  it('المدير ينشئ معلمًا بكلمة مرور مؤقتة يُلزَم بتغييرها', async () => {
    const admin = new TestClient(env.app);
    await admin.login('admin@school.om', PASSWORD);
    const created = await admin.post('/api/users', { email: 'teacher@school.om', password: 'Temp-Pass-9', fullName: 'فاطمة البلوشية', role: 'teacher' });
    expect(created.status).toBe(201);
    expect(created.body.mustChangePassword).toBe(true);

    const t = new TestClient(env.app);
    expect((await t.login('teacher@school.om', 'Temp-Pass-9')).status).toBe(200);
    // قبل تغيير كلمة المرور: كل شيء محجوب عدا تغييرها
    const blocked = await t.get('/api/settings');
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
    const changed = await t.post('/api/auth/password', { currentPassword: 'Temp-Pass-9', newPassword: 'My-Own-Pass-77' });
    expect(changed.status).toBe(200);
    expect((await t.get('/api/settings')).status).toBe(200);
  });

  it('المعلم لا يستطيع الوصول لإدارة المستخدمين', async () => {
    const t = new TestClient(env.app);
    await t.login('teacher@school.om', 'My-Own-Pass-77');
    expect((await t.get('/api/users')).status).toBe(403);
    expect((await t.post('/api/users', { email: 'z@z.om', password: 'Whatever-123', fullName: 'زيد' })).status).toBe(403);
  });

  it('لا يمكن تعطيل آخر مدير ولا سحب صلاحية المدير من النفس', async () => {
    const admin = new TestClient(env.app);
    await admin.login('admin@school.om', PASSWORD);
    const users = await admin.get('/api/users');
    const me = users.body.find((u: any) => u.email === 'admin@school.om');
    const r = await admin.patch(`/api/users/${me.id}`, { status: 'disabled' });
    expect(r.status).toBe(409);
  });

  it('تعطيل مستخدم يُنهي جلساته فورًا', async () => {
    const admin = new TestClient(env.app);
    await admin.login('admin@school.om', PASSWORD);
    const t = new TestClient(env.app);
    await t.login('teacher@school.om', 'My-Own-Pass-77');
    expect((await t.get('/api/settings')).status).toBe(200);
    const users = await admin.get('/api/users');
    const teacher = users.body.find((u: any) => u.email === 'teacher@school.om');
    expect((await admin.patch(`/api/users/${teacher.id}`, { status: 'disabled' })).status).toBe(200);
    expect((await t.get('/api/settings')).status).toBe(401);
    expect((await t.login('teacher@school.om', 'My-Own-Pass-77')).status).toBe(403);
    await admin.patch(`/api/users/${teacher.id}`, { status: 'active' });
  });
});

describe('الإعدادات', () => {
  it('تُرجع القيم الافتراضية ثم تحفظ التعديلات', async () => {
    const c = new TestClient(env.app);
    await c.login('admin@school.om', PASSWORD);
    const s = await c.get('/api/settings');
    expect(s.body.grading.bands.length).toBeGreaterThan(2);
    expect(s.body.schedule.workDays).toEqual([0, 1, 2, 3, 4]);

    const upd = await c.patch('/api/settings', {
      profile: { schoolName: 'مدرسة الإمام الخليل للتعليم الأساسي', directorate: 'مسقط' },
      preferences: { theme: 'dark', digits: 'arab' },
    });
    expect(upd.status).toBe(200);
    expect(upd.body.profile.schoolName).toBe('مدرسة الإمام الخليل للتعليم الأساسي');
    expect(upd.body.preferences).toEqual({ theme: 'dark', digits: 'arab' });
  });

  it('يرفض مستويات أداء غير صالحة', async () => {
    const c = new TestClient(env.app);
    await c.login('admin@school.om', PASSWORD);
    const r = await c.patch('/api/settings', {
      grading: {
        bands: [{ min: 50, label: 'ناجح', tone: 'good' }, { min: 40, label: 'راسب', tone: 'bad' }],
        remedialBelow: 40, enrichmentFrom: 90, passFrom: 50,
      },
    });
    expect(r.status).toBe(400);
  });
});
