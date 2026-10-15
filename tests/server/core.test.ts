import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClient, makeEnv, multipart, seedFor, PASSWORD, type TestEnv } from './helpers';

let env: TestEnv;
beforeAll(async () => {
  env = await makeEnv();
});
afterAll(async () => {
  await env.app.close();
});

describe('العام الدراسي والمواد والشعب', () => {
  let c: TestClient;
  beforeAll(async () => {
    c = new TestClient(env.app);
    await c.setupAdmin();
  });

  it('ينشئ العام الدراسي مع فصلين تلقائيًا ويجعله الحالي', async () => {
    const r = await c.post('/api/years', { name: '2026/2027', startDate: '2026-08-23', endDate: '2027-06-17' });
    expect(r.status).toBe(201);
    expect(r.body.isCurrent).toBe(true);
    expect(r.body.terms).toHaveLength(2);
    const [t1, t2] = r.body.terms;
    expect(t1.startDate).toBe('2026-08-23');
    expect(t2.endDate).toBe('2027-06-17');
    expect(t1.endDate < t2.startDate).toBe(true);
  });

  it('يمنع تكرار اسم العام ويرفض الفترات غير المنطقية', async () => {
    expect((await c.post('/api/years', { name: '2026/2027', startDate: '2026-08-23', endDate: '2027-06-17' })).status).toBe(409);
    expect((await c.post('/api/years', { name: '2030/2031', startDate: '2031-06-01', endDate: '2030-09-01' })).status).toBe(400);
  });

  it('عام واحد حالي فقط لكل معلم', async () => {
    const second = await c.post('/api/years', { name: '2027/2028', startDate: '2027-08-22', endDate: '2028-06-15', makeCurrent: true });
    expect(second.body.isCurrent).toBe(true);
    const years = (await c.get('/api/years')).body;
    expect(years.filter((y: any) => y.isCurrent)).toHaveLength(1);
    // نعيد الأول حاليًا
    const first = years.find((y: any) => y.name === '2026/2027');
    await c.post(`/api/years/${first.id}/current`);
    expect((await c.get('/api/years')).body.filter((y: any) => y.isCurrent).map((y: any) => y.name)).toEqual(['2026/2027']);
  });

  it('يتحقق من عدم تداخل الفصلين', async () => {
    const y = (await c.get('/api/years')).body.find((x: any) => x.name === '2026/2027');
    const bad = await c.patch(`/api/terms/${y.terms[0].id}`, { endDate: '2027-03-01' });
    expect(bad.status).toBe(400);
    const ok = await c.patch(`/api/terms/${y.terms[0].id}`, { endDate: '2027-01-10' });
    expect(ok.status).toBe(200);
  });

  it('ينشئ الشعبة بمقرراتها ويمنع تكرارها', async () => {
    const y = (await c.get('/api/years')).body.find((x: any) => x.name === '2026/2027');
    const sci = (await c.post('/api/subjects', { name: 'العلوم' })).body;
    const math = (await c.post('/api/subjects', { name: 'الرياضيات' })).body;
    expect((await c.post('/api/subjects', { name: 'العلوم' })).status).toBe(409);
    const s = await c.post('/api/sections', { yearId: y.id, gradeLevel: 10, name: '3', subjectIds: [sci.id, math.id] });
    expect(s.status).toBe(201);
    expect(s.body.label).toBe('10/3');
    expect(s.body.assignments.map((a: any) => a.subjectName).sort()).toEqual(['الرياضيات', 'العلوم']);
    expect((await c.post('/api/sections', { yearId: y.id, gradeLevel: 10, name: '3' })).status).toBe(409);
    // مادة لا تتبع هذا المعلم → 404
    expect((await c.post('/api/sections', { yearId: y.id, gradeLevel: 11, name: '1', subjectIds: ['00000000-0000-4000-8000-000000000000'] })).status).toBe(404);
  });

  it('لا يحذف مادة مستخدمة ولا عامًا فيه شعب', async () => {
    const subjects = (await c.get('/api/subjects')).body;
    const sci = subjects.find((s: any) => s.name === 'العلوم');
    expect(sci.assignmentCount).toBe(1);
    expect((await c.del(`/api/subjects/${sci.id}`)).status).toBe(409);
    const y = (await c.get('/api/years')).body.find((x: any) => x.name === '2026/2027');
    expect((await c.del(`/api/years/${y.id}`)).status).toBe(409);
  });
});

describe('الطلاب: التسجيل والاستيراد والترتيب', () => {
  let ctx: Awaited<ReturnType<typeof seedFor>>;
  beforeAll(async () => {
    const c = new TestClient(env.app);
    await c.post('/api/auth/setup', { email: 'x@x.om', password: PASSWORD, fullName: 'x' }).catch(() => undefined);
    // معلم جديد مستقل عن الاختبارات السابقة
    const admin = new TestClient(env.app);
    await admin.login('admin@school.om', PASSWORD);
    await admin.post('/api/users', { email: 't1@school.om', password: 'Temp-Pass-91', fullName: 'معلم أول', role: 'teacher' });
    const t = new TestClient(env.app);
    await t.login('t1@school.om', 'Temp-Pass-91');
    await t.post('/api/auth/password', { currentPassword: 'Temp-Pass-91', newPassword: 'Real-Pass-77' });
    ctx = await seedFor(t);
  });

  it('يرقّم الطلاب تسلسليًا ويرتب القائمة', async () => {
    expect(ctx.roster.map((r: any) => r.rollNo)).toEqual([1, 2, 3]);
    const sorted = await ctx.c.post(`/api/sections/${ctx.section.id}/students/reorder`, { sort: 'name' });
    expect(sorted.body.map((r: any) => r.student.fullName)[0]).toBe('أحمد بن سالم الحارثي');
    expect(sorted.body.map((r: any) => r.rollNo)).toEqual([1, 2, 3]);
  });

  it('يمنع رقمًا تعريفيًا مكررًا', async () => {
    const r = await ctx.c.post(`/api/sections/${ctx.section.id}/students`, {
      students: [{ fullName: 'طالب مكرر الرقم', studentNumber: '10000001' }],
    });
    expect(r.status).toBe(409);
  });

  it('يعاين استيراد نص ملصوق ويكشف المكرر والجديد ثم يؤكد', async () => {
    const text = ['1. أحمد بن سالم الحارثي', '2. ماجد بن عبدالله العبري', '3. ماجد بن عبدالله العبري', '4. ريم بنت سعيد الكلبانية\t10000099'].join('\n');
    const prev = await ctx.c.post(`/api/sections/${ctx.section.id}/students/import/preview`, { text });
    expect(prev.status).toBe(200);
    const byName = Object.fromEntries(prev.body.rows.map((r: any) => [r.rowNumber, r]));
    expect(byName[1].action).toBe('skip'); // موجود في هذه الشعبة
    expect(byName[2].action).toBe('create');
    expect(byName[3].action).toBe('skip'); // مكرر داخل الملف
    expect(byName[4].studentNumber).toBe('10000099');
    const rows = prev.body.rows.filter((r: any) => r.action !== 'skip');
    const commit = await ctx.c.post(`/api/sections/${ctx.section.id}/students/import/commit`, {
      rows: rows.map((r: any) => ({ fullName: r.fullName, studentNumber: r.studentNumber, gender: r.gender, linkStudentId: r.linkStudentId })),
    });
    expect(commit.status).toBe(201);
    expect(commit.body.created).toBe(2);
    expect(commit.body.roster).toHaveLength(5);
  });

  it('يستورد ملف CSV بأعمدة عربية ويتعرف على الرأس تلقائيًا', async () => {
    const csv = '﻿م,اسم الطالب,الرقم المدني,الجنس\n1,عبدالله بن مبارك الراشدي,20000001,ذكر\n2,مريم بنت حمد المعمرية,20000002,أنثى\n';
    const { payload, headers } = multipart('students.csv', csv);
    const r = await env.app.inject({
      method: 'POST',
      url: `/api/sections/${ctx.section.id}/students/import/preview`,
      payload,
      headers: { ...headers, cookie: [...ctx.c.cookies].map(([k, v]) => `${k}=${v}`).join('; '), 'x-sijilli-client': 'web' },
    });
    expect(r.statusCode).toBe(200);
    const body = r.json();
    expect(body.detected.headerRow).toBe(1);
    expect(body.rows).toHaveLength(2);
    expect(body.rows[0]).toMatchObject({ fullName: 'عبدالله بن مبارك الراشدي', studentNumber: '20000001', gender: 'male', action: 'create' });
    expect(body.rows[1].gender).toBe('female');
  });

  it('يرفض صيغ الملفات غير المدعومة برسالة واضحة', async () => {
    const { payload, headers } = multipart('list.xls', Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0]), 'application/vnd.ms-excel');
    const r = await env.app.inject({
      method: 'POST',
      url: `/api/sections/${ctx.section.id}/students/import/preview`,
      payload,
      headers: { ...headers, cookie: [...ctx.c.cookies].map(([k, v]) => `${k}=${v}`).join('; '), 'x-sijilli-client': 'web' },
    });
    expect(r.statusCode).toBe(400);
    expect(r.json().error.code).toBe('UNSUPPORTED_XLS');
  });

  it('ينقل طالبًا بين الشعب ويعيد الترقيم', async () => {
    const sec2 = (await ctx.c.post('/api/sections', { yearId: ctx.year.id, gradeLevel: 10, name: '4' })).body;
    const first = ctx.roster[0].student;
    const moved = await ctx.c.post(`/api/students/${first.id}/move`, { sectionId: sec2.id });
    expect(moved.status).toBe(200);
    expect(moved.body.enrollment.sectionLabel).toBe('10/4');
    const r1 = (await ctx.c.get(`/api/sections/${ctx.section.id}/students`)).body;
    expect(r1.map((r: any) => r.rollNo)).toEqual(r1.map((_: any, i: number) => i + 1));
  });

  it('يبحث بتطبيع عربي (همزات/ياء/تاء مربوطة)', async () => {
    const r = await ctx.c.get('/api/students?q=' + encodeURIComponent('احمد الحارثى'));
    expect(r.body.total).toBeGreaterThanOrEqual(1);
    expect(r.body.items[0].fullName).toContain('أحمد');
  });
});

describe('نقطة توسعة المساعد الذكي', () => {
  it('معطّلة افتراضيًا: لا مزوّد ← available=false والتشغيل يرفض بـ 501', async () => {
    const { AiService } = await import('../../src/server/ai/provider');
    const svc = new AiService();
    expect(svc.available).toBe(false);
    await expect(svc.run({ task: 'lesson-draft', input: 'نص' })).rejects.toMatchObject({ status: 501, code: 'AI_UNAVAILABLE' });
  });

  it('عند تسجيل مزوّد جاهز تعمل، وتُقصّ المدخلات وتُرفض الفارغة والطويلة', async () => {
    const { AiService } = await import('../../src/server/ai/provider');
    const seen: string[] = [];
    const svc = new AiService();
    svc.register({
      id: 'fake',
      isAvailable: () => true,
      complete: async (r) => {
        seen.push(r.input);
        return { text: `اقتراح: ${r.input}`, provider: 'fake' };
      },
    });
    expect(svc.available).toBe(true);
    await expect(svc.run({ task: 'assessment-ideas', input: '  أهداف الدرس  ' })).resolves.toEqual({ text: 'اقتراح: أهداف الدرس', provider: 'fake' });
    expect(seen).toEqual(['أهداف الدرس']);
    await expect(svc.run({ task: 'assessment-ideas', input: '   ' })).rejects.toMatchObject({ status: 400 });
    await expect(svc.run({ task: 'assessment-ideas', input: 'ا'.repeat(4001) })).rejects.toMatchObject({ status: 400 });
  });

  it('system/info يعلن أن المساعد غير متاح', async () => {
    const info = (await env.app.inject({ method: 'GET', url: '/api/system/info' })).json();
    expect(info.capabilities.ai).toBe(false);
  });
});
