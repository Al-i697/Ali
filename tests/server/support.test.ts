import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '../../src/server/db/client';
import * as support from '../../src/server/modules/support/service';
import { TestClient, makeEnv, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let other: TestClient;
let ownerId: string;
let A: string; // منخفض (30%)
let B: string; // متوسط (70%)
let C: string; // مرتفع (100%)
let quizId: string;
const TODAY = '2026-10-01'; // داخل الفصل الأول (23 أغسطس 2026 – ...)

async function newTeacher(admin: TestClient, email: string) {
  await admin.post('/api/users', { email, password: 'Temp-Pass-91', fullName: 'معلم ' + email, role: 'teacher' });
  const t = new TestClient(env.app);
  await t.login(email, 'Temp-Pass-91');
  await t.post('/api/auth/password', { currentPassword: 'Temp-Pass-91', newPassword: 'Real-Pass-77' });
  return t;
}

beforeAll(async () => {
  env = await makeEnv();
  const admin = new TestClient(env.app);
  await admin.setupAdmin();
  const t1 = await newTeacher(admin, 'a@school.om');
  other = await newTeacher(admin, 'b@school.om');
  ctx = await seedFor(t1);
  ownerId = (await t1.get('/api/auth/me')).body.user.id;
  [A, B, C] = ctx.roster.map((r: any) => r.student.id as string);
  const quiz = await ctx.c.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'اختبار قصير 1', type: 'written', maxScore: 10, date: '2026-09-10' });
  quizId = quiz.body.id;
  const saved = await ctx.c.put(`/api/assessments/${quizId}/results`, {
    results: [
      { studentId: A, score: 3 },
      { studentId: B, score: 7 },
      { studentId: C, score: 10 },
    ],
  });
  expect(saved.status).toBe(200);
});
afterAll(async () => {
  await env.app.close();
});

describe('الاقتراحات التلقائية وخط الأساس (بتاريخ مُحقَن)', () => {
  it('تقترح علاجًا لمن دون الحد وإثراءً لمن فوق حد الإثراء، ولا تقترح المتوسط', () => {
    const list = support.suggestions(env.db.orm, ownerId, { assignmentId: ctx.assignmentId }, TODAY);
    expect(list.map((s) => [s.studentId, s.kind, s.percent])).toEqual([
      [A, 'remedial', 30],
      [C, 'enrichment', 100],
    ]);
    expect(list[0]!.sectionLabel).toBe('10/3');
    expect(list[0]!.subjectName).toBe('العلوم');
  });

  it('خط الأساس يُلتقط من نسبة الطالب الحالية لحظة الإنشاء', () => {
    const plan = support.createPlan(env.db.orm, ownerId, { studentId: A, assignmentId: ctx.assignmentId, kind: 'remedial', title: 'علاج مهارة القياس', goal: 'رفع المستوى', startDate: TODAY }, TODAY);
    expect(plan.baselinePercent).toBe(30);
    expect(plan.currentPercent).toBe(30);
    expect(plan.status).toBe('open');
    support.deletePlan(env.db.orm, ownerId, plan.id);
  });

  it('بعد تحسّن الدرجات تظهر النسبة الحالية أعلى من خط الأساس، ولا يتغير خط الأساس', async () => {
    const plan = support.createPlan(env.db.orm, ownerId, { studentId: A, assignmentId: ctx.assignmentId, kind: 'remedial', title: 'خطة', goal: 'هدف', startDate: TODAY }, TODAY);
    await ctx.c.put(`/api/assessments/${quizId}/results`, { results: [{ studentId: A, score: 6 }] });
    const after = support.getPlan(env.db.orm, ownerId, plan.id, TODAY);
    expect(after.baselinePercent).toBe(30);
    expect(after.currentPercent).toBe(60);
    // لم تعد مقترحة للعلاج: نسبته الآن فوق الحد، ولديه خطة مفتوحة أصلًا
    expect(support.suggestions(env.db.orm, ownerId, { assignmentId: ctx.assignmentId }, TODAY).some((s) => s.studentId === A)).toBe(false);
    await ctx.c.put(`/api/assessments/${quizId}/results`, { results: [{ studentId: A, score: 3 }] });
    // ولديه خطة مفتوحة ⇒ لا يُقترح ثانية رغم أنه دون الحد من جديد
    expect(support.suggestions(env.db.orm, ownerId, { assignmentId: ctx.assignmentId }, TODAY).some((s) => s.studentId === A && s.kind === 'remedial')).toBe(false);
    support.deletePlan(env.db.orm, ownerId, plan.id);
    expect(support.suggestions(env.db.orm, ownerId, { assignmentId: ctx.assignmentId }, TODAY).some((s) => s.studentId === A && s.kind === 'remedial')).toBe(true);
  });
});

describe('واجهة الخطط: الإنشاء والتحقق', () => {
  let planId: string;

  it('ينشئ خطة ويعيدها بتفاصيلها (201) ويسجّل الحدث في سجل العمليات بلا أسماء', async () => {
    const r = await ctx.c.post('/api/support-plans', {
      studentId: A, assignmentId: ctx.assignmentId, kind: 'remedial', title: 'علاج مهارة القياس', reason: 'أخطاء متكررة في وحدات القياس',
      goal: 'يرفع مستواه إلى 60% فأكثر', strategies: ['التعلّم بالأقران', 'تدريبات إضافية'], startDate: '2026-10-01', reviewDate: '2026-10-15',
    });
    expect(r.status).toBe(201);
    planId = r.body.id;
    expect(r.body).toMatchObject({ studentName: 'أحمد بن سالم الحارثي', sectionLabel: '10/3', subjectName: 'العلوم', kind: 'remedial', status: 'open', notes: [] });
    expect(r.body.strategies).toEqual(['التعلّم بالأقران', 'تدريبات إضافية']);
    const logs = env.db.sqlite.prepare("select meta, entity_id from audit_log where action='support_plan_created'").all() as { meta: string; entity_id: string }[];
    expect(logs).toHaveLength(1);
    expect(logs[0]!.meta).not.toMatch(/أحمد|علاج/);
  });

  it('يرفض: موعد مراجعة قبل البدء، غياب المقرر، طالب خارج شعبة المقرر، ونوعًا غير صالح', async () => {
    const base = { studentId: B, assignmentId: ctx.assignmentId, kind: 'remedial', title: 'خطة', goal: 'هدف', startDate: '2026-10-10' };
    const early = await ctx.c.post('/api/support-plans', { ...base, reviewDate: '2026-10-01' });
    expect(early.status).toBe(400);
    expect(early.body.error.fields.reviewDate).toMatch(/المراجعة/);
    const noAsg = await ctx.c.post('/api/support-plans', { ...base, assignmentId: undefined });
    expect(noAsg.status).toBe(400);
    expect(noAsg.body.error.fields.assignmentId).toBeTruthy();
    const badKind = await ctx.c.post('/api/support-plans', { ...base, kind: 'other' });
    expect(badKind.status).toBe(400);

    // طالب من شعبة أخرى لنفس المعلم
    const s2 = (await ctx.c.post('/api/sections', { yearId: ctx.year.id, gradeLevel: 10, name: '4', subjectIds: [ctx.subject.id] })).body;
    const r2 = (await ctx.c.post(`/api/sections/${s2.id}/students`, { students: [{ fullName: 'طالب شعبة أخرى', gender: 'male' }] })).body;
    const notEnrolled = await ctx.c.post('/api/support-plans', { ...base, studentId: r2[0].student.id });
    expect(notEnrolled.status).toBe(400);
    expect(notEnrolled.body.error.code).toBe('NOT_ENROLLED');
  });

  it('ملاحظات المتابعة: إضافة وتعديل وحذف، ويظهر عددها وآخر تاريخ في القائمة', async () => {
    const n1 = await ctx.c.post(`/api/support-plans/${planId}/notes`, { date: '2026-10-05', text: 'حضر جلسة علاجية' });
    expect(n1.status).toBe(201);
    const n2 = await ctx.c.post(`/api/support-plans/${planId}/notes`, { date: '2026-10-12', text: 'تحسّن في التمارين' });
    const list = (await ctx.c.get(`/api/support-plans?studentId=${A}`)).body;
    expect(list[0]).toMatchObject({ id: planId, notesCount: 2, lastNoteDate: '2026-10-12' });
    const edited = await ctx.c.patch(`/api/support-plans/${planId}/notes/${n1.body.id}`, { text: 'حضر جلستين علاجيتين' });
    expect(edited.body.text).toBe('حضر جلستين علاجيتين');
    const detail = (await ctx.c.get(`/api/support-plans/${planId}`)).body;
    expect(detail.notes.map((n: any) => n.date)).toEqual(['2026-10-12', '2026-10-05']); // الأحدث أولًا
    expect((await ctx.c.del(`/api/support-plans/${planId}/notes/${n2.body.id}`)).status).toBe(200);
    expect((await ctx.c.get(`/api/support-plans/${planId}`)).body.notes).toHaveLength(1);
    expect((await ctx.c.post(`/api/support-plans/${planId}/notes`, { date: 'غلط', text: 'x' })).status).toBe(400);
  });

  it('إغلاق الخطة يسجّل closedAt وإعادة الفتح تمسحه، و«due» يعتمد على موعد المراجعة', async () => {
    const closed = await ctx.c.patch(`/api/support-plans/${planId}`, { status: 'done', outcome: 'ارتفع مستواه إلى 65%' });
    expect(closed.body.status).toBe('done');
    expect(closed.body.closedAt).toBeTruthy();
    expect(closed.body.outcome).toBe('ارتفع مستواه إلى 65%');
    expect(closed.body.due).toBe(false); // المنجزة لا «تحين» أبدًا
    const reopened = await ctx.c.patch(`/api/support-plans/${planId}`, { status: 'open' });
    expect(reopened.body.closedAt).toBeNull();
    expect(reopened.body.due).toBe(true); // موعد المراجعة 2026-10-15 مضى/حان (التاريخ الفعلي ≥ ذلك)
    const dueList = (await ctx.c.get('/api/support-plans?view=due')).body;
    expect(dueList.map((p: any) => p.id)).toContain(planId);
  });

  it('الإنشاء الجماعي: يتخطى من لديه خطة مفتوحة من النوع نفسه ويعيّن عنوانًا وهدفًا افتراضيين', async () => {
    const r = await ctx.c.post('/api/support-plans/bulk', { assignmentId: ctx.assignmentId, studentIds: [A, B], kind: 'remedial', startDate: '2026-10-01', reviewDate: '2026-11-01' });
    expect(r.status).toBe(201);
    expect(r.body.skipped).toBe(1); // A لديه الخطة المفتوحة أعلاه
    expect(r.body.created).toHaveLength(1);
    expect(r.body.created[0]).toMatchObject({ studentId: B, kind: 'remedial', title: 'خطة علاجية — العلوم', reviewDate: '2026-11-01' });
    const again = await ctx.c.post('/api/support-plans/bulk', { assignmentId: ctx.assignmentId, studentIds: [A, B], kind: 'remedial' });
    expect(again.body).toMatchObject({ skipped: 2, created: [] });
    const enrich = await ctx.c.post('/api/support-plans/bulk', { assignmentId: ctx.assignmentId, studentIds: [C], kind: 'enrichment', strategies: ['مشروع بحثي مصغّر'] });
    expect(enrich.body.created[0]).toMatchObject({ studentId: C, kind: 'enrichment', strategies: ['مشروع بحثي مصغّر'] });
  });

  it('الترشيح بالنوع والحالة والشعبة', async () => {
    const enrichOnly = (await ctx.c.get('/api/support-plans?kind=enrichment')).body;
    expect(enrichOnly.map((p: any) => p.studentId)).toEqual([C]);
    const bySection = (await ctx.c.get(`/api/support-plans?sectionId=${ctx.section.id}`)).body;
    expect(bySection.length).toBe(3);
    const done = (await ctx.c.get('/api/support-plans?status=done')).body;
    expect(done).toEqual([]);
  });
});

describe('العزل بين المعلمين', () => {
  it('معلم آخر لا يرى الخطط ولا يعدّلها ولا يضيف عليها ولا يحذفها (404)', async () => {
    const mine = (await ctx.c.get('/api/support-plans')).body[0].id as string;
    expect((await other.get('/api/support-plans')).body).toEqual([]);
    expect((await other.get(`/api/support-plans/${mine}`)).status).toBe(404);
    expect((await other.patch(`/api/support-plans/${mine}`, { goal: 'اختراق' })).status).toBe(404);
    expect((await other.post(`/api/support-plans/${mine}/notes`, { date: '2026-10-01', text: 'x' })).status).toBe(404);
    expect((await other.del(`/api/support-plans/${mine}`)).status).toBe(404);
    expect((await other.post('/api/support-plans', { studentId: A, assignmentId: ctx.assignmentId, kind: 'remedial', title: 'x', goal: 'y', startDate: '2026-10-01' })).status).toBe(404);
    expect((await other.post('/api/support-plans/bulk', { assignmentId: ctx.assignmentId, studentIds: [A], kind: 'remedial' })).status).toBe(404);
    expect((await other.get(`/api/support-plans/suggestions?assignmentId=${ctx.assignmentId}`)).status).toBe(404);
    expect((await other.get(`/api/reports/support-plans/html?planId=${mine}`)).status).toBe(404);
    // لم يتغير شيء عند صاحبها
    expect((await ctx.c.get(`/api/support-plans/${mine}`)).body.goal).not.toBe('اختراق');
  });
});

describe('التكامل: لوحة التحكم والتقويم والتقارير والحذف المتسلسل', () => {
  it('لوحة التحكم تعرض أعداد الخطط وتعلّم من لديه خطة في «يحتاجون متابعة»', async () => {
    const d = (await ctx.c.get('/api/dashboard')).body;
    expect(d.support.open).toBeGreaterThanOrEqual(3);
    expect(d.support.due).toBeGreaterThanOrEqual(1);
    // (حالة الطلاب دون الحد تعتمد على الفصل الحالي بتاريخ اليوم الفعلي؛ نتحقق من وجود الحقل فقط)
    for (const a of d.attention) expect(typeof a.hasPlan).toBe('boolean');
  });

  it('التقويم الدراسي يعرض مواعيد مراجعة الخطط المفتوحة', async () => {
    const cal = (await ctx.c.get('/api/calendar?from=2026-10-01&to=2026-11-30')).body as { type: string; title: string; date: string; href: string }[];
    const items = cal.filter((i) => i.type === 'support');
    expect(items.map((i) => i.date).sort()).toEqual(['2026-10-15', '2026-11-01']);
    expect(items[0]!.title).toMatch(/^مراجعة خطة/);
    expect(items[0]!.href).toMatch(/^\/support\//);
  });

  it('تقرير القائمة وتقرير الخطة الفردية (HTML وExcel) يحملان بيانات الخطة', async () => {
    const list = await ctx.c.get('/api/reports/support-plans/html');
    expect(list.status).toBe(200);
    expect(list.body).toContain('الخطط العلاجية والإثرائية');
    expect(list.body).toContain('أحمد بن سالم الحارثي');
    expect(list.body).toContain('تنمية قدرات الطالب المتميز');
    const planId = (await ctx.c.get(`/api/support-plans?studentId=${A}`)).body[0].id as string;
    const one = await ctx.c.get(`/api/reports/support-plans/html?planId=${planId}`);
    expect(one.body).toContain('خطة علاجية فردية');
    expect(one.body).toContain('أخطاء متكررة في وحدات القياس');
    expect(one.body).toContain('التعلّم بالأقران');
    expect(one.body).toContain('حضر جلستين علاجيتين');
    const xl = await ctx.c.get('/api/reports/support-plans/xlsx');
    expect(xl.status).toBe(200);
    expect(xl.raw.subarray(0, 2).toString()).toBe('PK');
    const filtered = await ctx.c.get('/api/reports/support-plans/html?kind=enrichment');
    expect(filtered.body).not.toContain('أحمد بن سالم الحارثي');
  });

  it('حذف المقرر يُبقي الخطة (بلا مقرر)، وحذف الطالب يحذف خططه وملاحظاتها', async () => {
    // أنشئ مقررًا مستقلًا وخطة عليه ثم احذفه
    const subj2 = (await ctx.c.post('/api/subjects', { name: 'الأحياء' })).body;
    const section2 = (await ctx.c.post('/api/sections', { yearId: ctx.year.id, gradeLevel: 10, name: '9', subjectIds: [subj2.id] })).body;
    const roster2 = (await ctx.c.post(`/api/sections/${section2.id}/students`, { students: [{ fullName: 'طالب مؤقت للحذف', gender: 'male' }] })).body;
    const sid = roster2[0].student.id as string;
    const plan = (await ctx.c.post('/api/support-plans', { studentId: sid, assignmentId: section2.assignments[0].id, kind: 'enrichment', title: 'مؤقتة', goal: 'هدف', startDate: '2026-10-01' })).body;
    await ctx.c.post(`/api/support-plans/${plan.id}/notes`, { date: '2026-10-02', text: 'ملاحظة' });
    expect((await ctx.c.del(`/api/assignments/${section2.assignments[0].id}?force=true`)).status).toBe(200);
    const kept = (await ctx.c.get(`/api/support-plans/${plan.id}`)).body;
    expect(kept.assignmentId).toBeNull();
    expect(kept.subjectName).toBeNull();
    expect(kept.currentPercent).toBeNull();
    expect((await ctx.c.del(`/api/students/${sid}?force=true`)).status).toBe(200);
    expect((await ctx.c.get(`/api/support-plans/${plan.id}`)).status).toBe(404);
    const orphanNotes = env.db.sqlite.prepare('select count(*) c from support_plan_notes where plan_id = ?').get(plan.id) as { c: number };
    expect(orphanNotes.c).toBe(0);
    void schema;
  });
});
