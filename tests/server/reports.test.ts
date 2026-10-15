import ExcelJS from 'exceljs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClient, makeEnv, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let other: TestClient;
let ids: string[];

beforeAll(async () => {
  env = await makeEnv({ PDF_NO_SANDBOX: 'true' });
  const admin = new TestClient(env.app);
  await admin.setupAdmin();
  ctx = await seedFor(admin);
  ids = ctx.roster.map((r: any) => r.student.id);
  await admin.patch('/api/settings', { profile: { schoolName: 'مدرسة الإمام الخليل للتعليم الأساسي', directorate: 'المديرية العامة للتربية والتعليم بمحافظة مسقط' } });

  const quiz = (await admin.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'اختبار قصير 1', type: 'written', maxScore: 10, date: '2026-09-10' })).body;
  const proj = (await admin.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'مشروع', type: 'project', maxScore: 20, weight: 10 })).body;
  await admin.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: ids[0], score: 8 }, { studentId: ids[1], status: 'absent' }, { studentId: ids[2], status: 'excused' }] });
  await admin.put(`/api/assessments/${proj.id}/results`, { results: [{ studentId: ids[0], score: 15 }, { studentId: ids[1], score: 20 }] });
  await admin.post('/api/lessons', { assignmentId: ctx.assignmentId, date: '2026-09-13', period: 2, title: 'الخلية', unitName: 'الوحدة الأولى', status: 'delivered' });

  const a2 = new TestClient(env.app);
  await a2.post('/api/users', {}).catch(() => undefined);
  await admin.post('/api/users', { email: 'o@school.om', password: 'Temp-Pass-91', fullName: 'معلم آخر' });
  other = new TestClient(env.app);
  await other.login('o@school.om', 'Temp-Pass-91');
  await other.post('/api/auth/password', { currentPassword: 'Temp-Pass-91', newPassword: 'Real-Pass-77' });
});
afterAll(async () => {
  await env.app.close();
});

const q = () => `assignmentId=${ctx.assignmentId}&termId=${ctx.term1.id}`;

describe('تقارير HTML', () => {
  it('كشف الدرجات يعرض الطلاب والمجاميع والمستويات والترويسة الرسمية', async () => {
    const r = await ctx.c.get(`/api/reports/class-gradebook/html?${q()}`);
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toContain('text/html');
    expect(r.headers['content-security-policy']).toContain("default-src 'none'");
    const html: string = r.body;
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('كشف درجات التقويم المستمر');
    expect(html).toContain('سلطنة عُمان');
    expect(html).toContain('مدرسة الإمام الخليل للتعليم الأساسي');
    expect(html).toContain('أحمد بن سالم الحارثي');
    expect(html).toContain('77.5%'); // 8/10*10 + 15/20*10 = 15.5 من 20
    expect(html).toContain('50%'); // الغائب صفر + المشروع كامل
    expect(html).toContain('font-face'); // خطوط مضمّنة
    expect(html).toContain('@bottom-center');
  });

  it('يهرّب كل المدخلات (لا حقن HTML عبر اسم طالب)', async () => {
    await ctx.c.post(`/api/sections/${ctx.section.id}/students`, { students: [{ fullName: '<img src=x onerror=alert(1)> الخبيث' }] });
    const r = await ctx.c.get(`/api/reports/class-gradebook/html?${q()}`);
    expect(r.body).not.toContain('<img src=x');
    expect(r.body).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('يحترم تفضيل الأرقام الهندية', async () => {
    await ctx.c.patch('/api/settings', { preferences: { digits: 'arab' } });
    const r = await ctx.c.get(`/api/reports/class-gradebook/html?${q()}`);
    expect(r.body).toContain('٧٧٫٥%'); // أرقام هندية وفاصل عشري عربي
    expect(r.body).toContain('alert(1)'); // نص الاسم المُدخل لا يُحوَّل
    await ctx.c.patch('/api/settings', { preferences: { digits: 'latn' } });
  });

  it('تحليل الشعبة: توزيع المستويات وطلاب العلاج', async () => {
    const r = await ctx.c.get(`/api/reports/class-analysis/html?${q()}`);
    expect(r.status).toBe(200);
    expect(r.body).toContain('توزيع الطلاب حسب مستوى الأداء');
    expect(r.body).toContain('أداء كل تقويم');
    expect(r.body).toContain('خطة علاجية');
  });

  it('تقرير الطالب يضمّ ملخص المواد والتفاصيل، ويخفي ولي الأمر افتراضيًا', async () => {
    await ctx.c.patch(`/api/students/${ids[0]}`, { guardianName: 'سالم الحارثي', guardianPhone: '99112233' });
    const base = await ctx.c.get(`/api/reports/student/html?studentId=${ids[0]}&termId=${ctx.term1.id}`);
    expect(base.status).toBe(200);
    expect(base.body).toContain('تقرير أداء الطالب');
    expect(base.body).toContain('ملخص الأداء بالمواد');
    expect(base.body).toContain('تفاصيل العلوم');
    expect(base.body).not.toContain('99112233');
    const withG = await ctx.c.get(`/api/reports/student/html?studentId=${ids[0]}&termId=${ctx.term1.id}&includeGuardian=true`);
    expect(withG.body).toContain('99112233');
  });

  it('سجل التحضير', async () => {
    const r = await ctx.c.get('/api/reports/lessons/html?from=2026-09-01&to=2026-09-30');
    expect(r.status).toBe(200);
    expect(r.body).toContain('سجل التحضير');
    expect(r.body).toContain('الخلية');
    expect(r.body).toContain('نُفّذ');
  });

  it('يتحقق من المعاملات المطلوبة ويرفض أنواعًا غير معروفة', async () => {
    expect((await ctx.c.get('/api/reports/class-gradebook/html')).status).toBe(400);
    expect((await ctx.c.get('/api/reports/student/html')).status).toBe(400);
    expect((await ctx.c.get('/api/reports/unknown/html')).status).toBe(400);
    expect((await ctx.c.get(`/api/reports/class-gradebook/docx?${q()}`)).status).toBe(400);
  });

  it('لا يستطيع معلم آخر توليد تقارير لبيانات غيره', async () => {
    expect((await other.get(`/api/reports/class-gradebook/html?${q()}`)).status).toBe(404);
    expect((await other.get(`/api/reports/student/html?studentId=${ids[0]}`)).status).toBe(404);
    expect((await other.get(`/api/reports/class-gradebook/xlsx?${q()}`)).status).toBe(404);
  });
});

describe('تصدير Excel', () => {
  it('ينتج ملف xlsx صالحًا بأرقام حقيقية وورقة من اليمين لليسار', async () => {
    const r = await ctx.c.get(`/api/reports/class-gradebook/xlsx?${q()}`);
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toContain('spreadsheetml');
    expect(r.headers['content-disposition']).toContain('attachment');
    expect(r.headers['content-disposition']).toContain("filename*=UTF-8''");

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(r.raw as unknown as ArrayBuffer);
    const ws = wb.worksheets[0]!;
    expect(ws.views[0]?.rightToLeft).toBe(true);
    // نجد صف الطالب الأول ونتحقق أن الدرجات أرقام وليست نصوصًا
    let found: ExcelJS.Row | undefined;
    ws.eachRow((row) => {
      if (row.getCell(2).value === 'أحمد بن سالم الحارثي') found = row;
    });
    expect(found).toBeTruthy();
    const values = (found!.values as unknown[]).slice(1);
    expect(values).toContain(8); // اختبار قصير
    expect(values).toContain(15.5); // المجموع
    expect(values).toContain(77.5); // النسبة
    expect(typeof found!.getCell(3).value).toBe('number');
  });
});

describe('تصدير PDF', () => {
  it('ينتج PDF عربيًا صالحًا عند توفر Chromium، وإلا يعتذر برسالة واضحة', async () => {
    const r = await ctx.c.get(`/api/reports/class-gradebook/pdf?${q()}`);
    if (env.app.pdf.available) {
      expect(r.status).toBe(200);
      expect(r.headers['content-type']).toBe('application/pdf');
      expect(r.raw.subarray(0, 5).toString()).toBe('%PDF-');
      expect(r.raw.length).toBeGreaterThan(10_000);
      expect(r.raw.subarray(-16).toString()).toContain('%%EOF');
    } else {
      expect(r.status).toBe(501);
      expect(r.body.error.code).toBe('PDF_UNAVAILABLE');
    }
  }, 60_000);

  it('تسجَّل عمليات التصدير في سجل التدقيق', async () => {
    const rows = env.db.sqlite.prepare("select action, meta from audit_log where action = 'report_exported'").all() as { meta: string }[];
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });
});
