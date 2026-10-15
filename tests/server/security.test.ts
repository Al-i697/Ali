// مصفوفة الصلاحيات الشاملة: تُولَّد من المسارات المسجّلة فعليًا، فأي مسار جديد يدخل الفحص تلقائيًا.
// الهدف: لا يمكن أن يُضاف مسار «مفتوح» بالخطأ — أي مسار غير عام يجب أن يرفض غير المسجّل،
// وأي مسار للمدير يجب أن يرفض المعلم، وأي طلب يغيّر البيانات يجب أن يحمل رأس CSRF.
import type { RouteOptions } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClient, makeEnv, type TestEnv } from './helpers';

type Route = { method: string; url: string; isPublic: boolean; roles?: string[]; allowMustChange: boolean };

let env: TestEnv;
const routes: Route[] = [];

beforeAll(async () => {
  env = await makeEnv({}, {
    onRoute: (r: RouteOptions) => {
      if (!r.url.startsWith('/api/') || r.url === '/api/*') return;
      const cfg = (r.config ?? {}) as { public?: boolean; roles?: string[]; allowMustChange?: boolean };
      for (const m of ([] as string[]).concat(r.method as string | string[])) {
        if (m === 'HEAD' || m === 'OPTIONS') continue;
        routes.push({ method: m, url: r.url, isPublic: !!cfg.public, roles: cfg.roles, allowMustChange: !!cfg.allowMustChange });
      }
    },
  });
});
afterAll(async () => {
  await env.app.close();
});

const concrete = (url: string) => url.replace(/:[A-Za-z]+/g, '00000000-0000-4000-8000-000000000000');

describe('مصفوفة الصلاحيات', () => {
  it('المسارات العامة محصورة في قائمة معلومة — أي إضافة تتطلب مراجعة واعية', () => {
    const publicRoutes = routes.filter((r) => r.isPublic).map((r) => `${r.method} ${r.url}`).sort();
    expect(publicRoutes).toEqual(
      ['GET /api/auth/me', 'GET /api/health', 'GET /api/system/info', 'POST /api/auth/login', 'POST /api/auth/setup'].sort(),
    );
  });

  it('كل مسار غير عام يرفض الزائر غير المسجّل بـ 401 (حتى مع رأس CSRF صحيح)', async () => {
    expect(routes.length).toBeGreaterThan(60); // تأكيد أن الجمع يعمل
    const anon = new TestClient(env.app);
    const leaks: string[] = [];
    for (const r of routes.filter((x) => !x.isPublic)) {
      const res = await anon.request(r.method as 'GET', concrete(r.url), r.method === 'GET' ? undefined : {});
      if (res.status !== 401) leaks.push(`${r.method} ${r.url} → ${res.status}`);
    }
    expect(leaks).toEqual([]);
  });

  it('كل طلب يغيّر البيانات بلا رأس CSRF يُرفض بـ 403 (عامًا كان أو خاصًا)', async () => {
    const anon = new TestClient(env.app, false);
    const open: string[] = [];
    for (const r of routes.filter((x) => x.method !== 'GET')) {
      const res = await anon.request(r.method as 'POST', concrete(r.url), {});
      if (res.status !== 403) open.push(`${r.method} ${r.url} → ${res.status}`);
    }
    expect(open).toEqual([]);
  });

  describe('مسارات المدير', () => {
    let teacher: TestClient;
    beforeAll(async () => {
      const admin = new TestClient(env.app);
      await admin.setupAdmin('boss@school.om');
      const created = await admin.post('/api/users', { fullName: 'معلم', email: 'teacher@school.om', password: 'Teach3r-Pass!', role: 'teacher' });
      expect(created.status).toBe(201);
      teacher = new TestClient(env.app);
      expect((await teacher.login('teacher@school.om', 'Teach3r-Pass!')).status).toBe(200);
      // الحساب الجديد مُلزَم بتغيير كلمة المرور قبل أي شيء — نغيّرها ليصير حسابًا عاديًا
      expect((await teacher.post('/api/auth/password', { currentPassword: 'Teach3r-Pass!', newPassword: 'Teach3r-Pass-2!' })).status).toBe(200);
    });

    it('كل مسار مقيَّد بدور المدير يرفض المعلم بـ 403', async () => {
      const adminOnly = routes.filter((r) => r.roles?.includes('admin'));
      expect(adminOnly.length).toBeGreaterThanOrEqual(10);
      const leaks: string[] = [];
      for (const r of adminOnly) {
        const res = await teacher.request(r.method as 'GET', concrete(r.url), r.method === 'GET' ? undefined : {});
        if (res.status !== 403) leaks.push(`${r.method} ${r.url} → ${res.status}`);
      }
      expect(leaks).toEqual([]);
    });

    it('واجهات النسخ الاحتياطي والمستخدمين وسجل العمليات كلها ضمن مسارات المدير', () => {
      const adminUrls = new Set(routes.filter((r) => r.roles?.includes('admin')).map((r) => r.url));
      for (const prefix of ['/api/backups', '/api/users', '/api/audit']) {
        const group = routes.filter((r) => r.url.startsWith(prefix));
        expect(group.length).toBeGreaterThan(0);
        for (const r of group) expect(adminUrls.has(r.url), `${r.method} ${r.url} ليس مقيَّدًا بالمدير`).toBe(true);
      }
    });
  });

  it('مسارات «يُسمح بتغيير كلمة المرور» محصورة في ما يلزم لإتمام التغيير', () => {
    const allowed = routes.filter((r) => r.allowMustChange).map((r) => `${r.method} ${r.url}`).sort();
    expect(allowed).toEqual(['GET /api/auth/me', 'POST /api/auth/logout', 'POST /api/auth/password'].sort());
  });
});
