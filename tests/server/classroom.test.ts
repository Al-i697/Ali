import ExcelJS from 'exceljs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildDashboard } from '../../src/server/modules/dashboard/service';
import * as cls from '../../src/server/modules/classroom/service';
import { setSlot } from '../../src/server/modules/timetable/service';
import { TestClient, makeEnv, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let admin: TestClient;
let other: TestClient;
let ownerId: string;
let A: string; // أحمد (1)
let B: string; // فاطمة (2)
let C: string; // سعيد (3)

// أيام ماضية دائمًا (الخادم يرفض المستقبل). 2026-10-05 اثنين، فتصلح لاختبار الجدول
const D1 = '2026-10-01';
const D2 = '2026-10-04';
const D3 = '2026-10-05';
const D4 = '2026-10-06';
const D5 = '2026-10-07';

async function newTeacher(admin: TestClient, email: string) {
  await admin.post('/api/users', { email, password: 'Temp-Pass-91', fullName: 'معلم ' + email, role: 'teacher' });
  const t = new TestClient(env.app);
  await t.login(email, 'Temp-Pass-91');
  await t.post('/api/auth/password', { currentPassword: 'Temp-Pass-91', newPassword: 'Real-Pass-77' });
  return t;
}

beforeAll(async () => {
  env = await makeEnv();
  admin = new TestClient(env.app);
  await admin.setupAdmin();
  const t1 = await newTeacher(admin, 'a@school.om');
  other = await newTeacher(admin, 'b@school.om');
  ctx = await seedFor(t1);
  ownerId = (await t1.get('/api/auth/me')).body.user.id;
  [A, B, C] = ctx.roster.map((r: { student: { id: string } }) => r.student.id) as [string, string, string];
});
afterAll(async () => {
  await env.app.close();
});

const wipe = () => {
  env.db.sqlite.prepare('delete from class_participation where owner_id = ?').run(ownerId);
  env.db.sqlite.prepare('delete from class_records where owner_id = ?').run(ownerId);
};
const key = (date: string, period: number | null = 1) => ({ assignmentId: ctx.assignmentId, date, ...(period ? { period } : {}) });
const put = (studentId: string, date: string, count: number | null, period: number | null = 1) =>
  ctx.c.put('/api/class/participation', { ...key(date, period), studentId, count });
const rec = (studentId: string, date: string, kind: string, reason?: string | null, note?: string | null, period: number | null = 1) =>
  ctx.c.post('/api/class/records', { ...key(date, period), studentId, kind, reason, note });
const session = (date: string, period: number | null = 1) => ctx.c.get(`/api/class/session?assignmentId=${ctx.assignmentId}&date=${date}${period ? `&period=${period}` : ''}`);
const row = (body: any, id: string) => body.students.find((s: any) => s.studentId === id);
const count = (table: string) => (env.db.sqlite.prepare(`select count(*) c from ${table} where owner_id = ?`).get(ownerId) as { c: number }).c;

describe('الحصة والمشاركة', () => {
  afterAll(wipe);

  it('تعرض الحصة طلاب الشعبة بترتيب القائمة وكلهم «لم يُسجَّل» بعد', async () => {
    const r = await session(D1);
    expect(r.status).toBe(200);
    expect(r.body.assignment).toMatchObject({ sectionLabel: '10/3', subjectName: 'العلوم' });
    expect(r.body).toMatchObject({ date: D1, period: 1, lesson: null });
    expect(r.body.students.map((s: any) => [s.rollNo, s.fullName, s.participation])).toEqual([
      [1, 'أحمد بن سالم الحارثي', null],
      [2, 'فاطمة بنت خالد البلوشية', null],
      [3, 'سعيد بن ناصر الهنائي', null],
    ]);
    expect(r.body.totals).toMatchObject({ students: 3, unrecorded: 3, participating: 0, didNotParticipate: 0 });
    expect(r.body.students[0].before).toMatchObject({ sessions: 0, rate: null });
  });

  it('المشاركة تُضبط بالحالة المطلوبة: لم يُسجَّل ← لم يشارك ← شارك n ← إلغاء، وتكرار الطلب بلا أثر', async () => {
    expect((await put(A, D1, 1)).body).toMatchObject({ studentId: A, participation: 1 });
    expect((await put(A, D1, 2)).body.participation).toBe(2);
    expect((await put(A, D1, 2)).body.participation).toBe(2); // تكرار
    expect(count('class_participation')).toBe(1); // صف واحد لا اثنان
    expect((await put(A, D1, 0)).body.participation).toBe(0);
    expect((await put(A, D1, 3)).body.participation).toBe(3); // من «لم يشارك» إلى «شارك»
    expect((await put(A, D1, null)).body.participation).toBeNull();
    expect(count('class_participation')).toBe(0);
    expect((await put(A, D1, null)).status).toBe(200); // إلغاء ما لم يُسجَّل لا يفشل
  });

  it('الحصص تتمايز برقمها: الحصة 1 والحصة 2 وحصة بلا رقم ثلاث حصص مستقلة في اليوم نفسه', async () => {
    await put(A, D1, 1, 1);
    await put(A, D1, 2, 2);
    await put(A, D1, 5, null);
    expect(count('class_participation')).toBe(3);
    expect(row((await session(D1, 1)).body, A).participation).toBe(1);
    expect(row((await session(D1, 2)).body, A).participation).toBe(2);
    expect(row((await session(D1, null)).body, A).participation).toBe(5);
    expect(row((await session(D1, 3)).body, A).participation).toBeNull();
    expect((await session(D1, null)).body.period).toBeNull();
  });

  it('يرفض بأخطاء عربية: تاريخ مستقبلي، عدد خارج الحدود، حصة خارج النطاق، تاريخ غير صالح', async () => {
    const future = await put(A, '2999-01-01', 1);
    expect(future.status).toBe(400);
    expect(future.body.error.code).toBe('FUTURE_DATE');
    expect(future.body.error.fields.date).toBeTruthy();
    expect((await put(A, D1, 51)).status).toBe(400);
    expect((await put(A, D1, -1)).status).toBe(400);
    expect((await put(A, D1, 1.5)).status).toBe(400);
    expect((await put(A, D1, 1, 13)).status).toBe(400);
    expect((await put(A, '2026-13-40', 1)).status).toBe(400);
    expect((await ctx.c.put('/api/class/participation', { ...key(D1), count: 1 })).status).toBe(400); // بلا طالب
    expect((await ctx.c.put('/api/class/participation', { ...key(D1), studentId: A })).status).toBe(400); // بلا عدد
    expect((await put(A, D1, 50)).status).toBe(200); // الحد الأقصى مقبول
  });

  it('لا يُسجَّل على طالب ليس في شعبة الحصة ولا على منقول أو منسحب', async () => {
    const other4 = (await ctx.c.post('/api/sections', { yearId: ctx.year.id, gradeLevel: 10, name: '4', subjectIds: [ctx.subject.id] })).body;
    const stranger = (await ctx.c.post(`/api/sections/${other4.id}/students`, { students: [{ fullName: 'مازن بن راشد العبري' }] })).body[0].student.id;
    const r = await put(stranger, D1, 1);
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('NOT_IN_SECTION');
    expect((await rec(stranger, D1, 'negative', 'حديث جانبي')).status).toBe(400);

    await ctx.c.patch(`/api/students/${B}`, { status: 'withdrawn' });
    const w = await put(B, D1, 1);
    expect(w.status).toBe(400);
    expect(w.body.error.code).toBe('STUDENT_INACTIVE');
    const s = await session(D1);
    expect(s.body.students.map((x: any) => x.studentId)).toEqual([A, C]); // لا يظهر في الحصة
    await ctx.c.patch(`/api/students/${B}`, { status: 'active' });
    expect((await session(D1)).body.students).toHaveLength(3);
    await ctx.c.del(`/api/sections/${other4.id}?force=true`);
  });

  it('«لم يشارك» لمن تبقّى: لا يمسّ من سُجّل له، ويكرَّر بلا أثر، ويُعيد الحصة محدّثة', async () => {
    wipe();
    await put(A, D2, 2);
    const first = await ctx.c.post('/api/class/session/mark-rest', key(D2));
    expect(first.status).toBe(200);
    expect(first.body.added).toBe(2);
    expect(first.body.session.students.map((s: any) => s.participation)).toEqual([2, 0, 0]);
    expect(first.body.session.totals).toMatchObject({ participating: 1, didNotParticipate: 2, unrecorded: 0, participations: 2 });
    const again = await ctx.c.post('/api/class/session/mark-rest', key(D2));
    expect(again.body.added).toBe(0);
    expect(count('class_participation')).toBe(3);
    // حصة مستقبلية مرفوضة
    expect((await ctx.c.post('/api/class/session/mark-rest', key('2999-01-01'))).status).toBe(400);
  });

  it('مسح الحصة يزيل مشاركتها وسلوكها وحدها دون حصص أخرى', async () => {
    wipe();
    await put(A, D1, 1);
    await put(B, D2, 1);
    await rec(A, D1, 'negative', 'حديث جانبي');
    await rec(A, D2, 'positive', 'مساعدة زميل');
    const r = await ctx.c.del(`/api/class/session?assignmentId=${ctx.assignmentId}&date=${D1}&period=1`);
    expect(r.body).toMatchObject({ ok: true, participation: 1, records: 1 });
    expect(count('class_participation')).toBe(1);
    expect(count('class_records')).toBe(1);
    expect(row((await session(D1)).body, A)).toMatchObject({ participation: null, records: [] });
    expect(row((await session(D2)).body, B).participation).toBe(1);
  });
});

describe('السلوك والملاحظات', () => {
  afterAll(wipe);

  it('تسجّل سلوكًا غير حسن بسبب وتفاصيل (201) ويظهر في صف الطالب ومجاميع الحصة', async () => {
    wipe();
    const r = await rec(A, D1, 'negative', 'حديث جانبي', 'تكرر ثلاث مرات أثناء الشرح');
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ studentId: A, kind: 'negative', reason: 'حديث جانبي', note: 'تكرر ثلاث مرات أثناء الشرح', date: D1, period: 1 });
    const s = await session(D1);
    expect(row(s.body, A).records).toHaveLength(1);
    expect(s.body.totals).toMatchObject({ negative: 1, positive: 0, notes: 0 });
  });

  it('يقبل سببًا وحده أو ملاحظة وحدها، ويرفض الخالي منهما أو المخالف بأخطاء عربية مرتبطة بالحقل', async () => {
    expect((await rec(A, D1, 'positive', 'مساعدة زميل', null)).status).toBe(201);
    expect((await rec(A, D1, 'note', null, 'سألني عن موضوع خارج المنهج')).status).toBe(201);
    const empty = await rec(A, D1, 'negative', '   ', '');
    expect(empty.status).toBe(400);
    expect(empty.body.error.fields.reason).toBe('اختر سببًا أو اكتب ملاحظة');
    expect((await rec(A, D1, 'negative')).status).toBe(400);
    expect((await rec(A, D1, 'participated', 'شارك')).status).toBe(400); // المشاركة لها مسارها
    expect((await rec(A, D1, 'bad', 'x')).status).toBe(400);
    expect((await rec(A, D1, 'negative', 'س'.repeat(81))).status).toBe(400);
    expect((await rec(A, D1, 'negative', 'سبب', 'ن'.repeat(501))).status).toBe(400);
    expect((await rec(A, '2999-01-01', 'negative', 'سبب')).status).toBe(400);
    expect((await rec(A, D1, 'negative', 'س'.repeat(80))).status).toBe(201); // الحد مقبول
  });

  it('التعديل يدمج الحقول: حذف السبب جائز ما دامت الملاحظة باقية، لا حذفهما معًا، وتغيير النوع', async () => {
    wipe();
    const created = (await rec(A, D1, 'negative', 'حديث جانبي', 'تفاصيل')).body;
    const a = await ctx.c.patch(`/api/class/records/${created.id}`, { reason: 'إزعاج الزملاء' });
    expect(a.body).toMatchObject({ reason: 'إزعاج الزملاء', note: 'تفاصيل', kind: 'negative' });
    const b = await ctx.c.patch(`/api/class/records/${created.id}`, { reason: null });
    expect(b.status).toBe(200);
    expect(b.body).toMatchObject({ reason: null, note: 'تفاصيل' });
    const c = await ctx.c.patch(`/api/class/records/${created.id}`, { note: '' });
    expect(c.status).toBe(400);
    expect(c.body.error.fields.reason).toBeTruthy();
    const d = await ctx.c.patch(`/api/class/records/${created.id}`, { kind: 'note' });
    expect(d.body.kind).toBe('note');
    expect((await ctx.c.patch(`/api/class/records/${created.id}`, { kind: 'participated' })).status).toBe(400);
    // لا يغيّر الحصة ولا الطالب: الحقول الأخرى تُتجاهل
    const e = await ctx.c.patch(`/api/class/records/${created.id}`, { studentId: B, date: D2 });
    expect(e.body).toMatchObject({ studentId: A, date: D1 });
  });

  it('الحذف يزيل التسجيل ولا يكتب في سجل العمليات سببًا ولا ملاحظة ولا اسمًا', async () => {
    wipe();
    env.db.sqlite.prepare("delete from audit_log where action like 'class_%'").run();
    const r = (await rec(B, D1, 'negative', 'استخدام الجوال', 'ضُبط يصوّر الاختبار')).body;
    expect((await ctx.c.del(`/api/class/records/${r.id}`)).body).toEqual({ ok: true });
    expect(count('class_records')).toBe(0);
    await put(A, D1, 1);
    await ctx.c.post('/api/class/session/mark-rest', key(D1));
    const logs = env.db.sqlite.prepare("select action, meta from audit_log where action like 'class_%' order by id").all() as { action: string; meta: string }[];
    expect(logs.map((l) => l.action)).toEqual(['class_record_created', 'class_record_deleted', 'class_session_filled']);
    const blob = JSON.stringify(logs);
    expect(blob).not.toMatch(/استخدام الجوال|يصوّر|فاطمة|أحمد/);
    expect(JSON.parse(logs[0]!.meta)).toEqual({ kind: 'negative' });
    expect(JSON.parse(logs[2]!.meta)).toEqual({ added: 2 });
  });

  it('أرقام الحصة السابقة «قبل هذه الحصة» لا تتغير بما يُسجَّل فيها ولا تشمل ما بعدها', async () => {
    wipe();
    await put(A, D1, 2);
    await rec(A, D1, 'positive', 'مساعدة زميل');
    await put(A, D2, 0);
    await put(A, D3, 4);
    await put(A, D4, 1); // بعد الحصة المفحوصة: لا يدخل «قبل»
    const s3 = row((await session(D3)).body, A);
    expect(s3.participation).toBe(4);
    expect(s3.before).toMatchObject({ sessions: 2, participatedSessions: 1, noParticipationSessions: 1, participations: 2, positive: 1, rate: 50 });
    await put(A, D3, 9);
    expect(row((await session(D3)).body, A).before).toMatchObject({ sessions: 2, participations: 2 }); // لم يتغير
    expect(row((await session(D1)).body, A).before.sessions).toBe(0);
  });

  it('تحضير الدرس المطابق يظهر عنوانه في الحصة (برقمها، أو العام بلا رقم، أو أول تحضير في اليوم)', async () => {
    const l1 = (await ctx.c.post('/api/lessons', { assignmentId: ctx.assignmentId, date: D3, period: 1, title: 'الانتشار والخاصية الأسموزية' })).body;
    const l2 = (await ctx.c.post('/api/lessons', { assignmentId: ctx.assignmentId, date: D4, title: 'تحضير عام لليوم' })).body;
    expect((await session(D3, 1)).body.lesson).toEqual({ id: l1.id, title: 'الانتشار والخاصية الأسموزية' });
    expect((await session(D3, 2)).body.lesson).toBeNull(); // تحضير الحصة الأولى لا يخص الثانية
    expect((await session(D3, null)).body.lesson?.title).toBe('الانتشار والخاصية الأسموزية');
    expect((await session(D4, 3)).body.lesson?.id).toBe(l2.id); // تحضير بلا رقم يخص أي حصة
    await ctx.c.del(`/api/lessons/${l1.id}`);
    await ctx.c.del(`/api/lessons/${l2.id}`);
  });
});

describe('الملخص وتقرير الطالب والنظرة العامة', () => {
  // مصفوفة معلومة: 5 حصص (D1..D5) × ثلاثة طلاب
  //   أحمد: 2،1،3،0،1  → شارك في 4 ولم يشارك في 1 (7 مرات، 80%) + سلوك إيجابي
  //   فاطمة: 0،0،1،0،0 → شاركت في 1 ولم تشارك في 4 (20% ← قليلة) + 3 ملاحظات غير حسنة
  //   سعيد: 0،0،0،0، (D5 بلا تسجيل) → لم يشارك مطلقًا في 4 + ملاحظة
  beforeAll(async () => {
    wipe();
    const m: Record<string, (number | null)[]> = { [A]: [2, 1, 3, 0, 1], [B]: [0, 0, 1, 0, 0], [C]: [0, 0, 0, 0, null] };
    const dates = [D1, D2, D3, D4, D5];
    for (const [id, counts] of Object.entries(m)) {
      for (let i = 0; i < dates.length; i++) if (counts[i] !== null) await put(id, dates[i]!, counts[i]!);
    }
    await rec(A, D2, 'positive', 'مساعدة زميل');
    await rec(B, D1, 'negative', 'حديث جانبي');
    await rec(B, D2, 'negative', 'حديث جانبي', 'بعد التنبيه الأول');
    await rec(B, D4, 'negative', 'عدم أداء الواجب');
    await rec(C, D5, 'note', 'يحتاج إلى متابعة');
  });
  afterAll(wipe);

  it('الملخص: أعداد كل طالب ونسبته ومؤشرات المتابعة (لم يشارك مطلقًا / قليل المشاركة / ملاحظات كثيرة)', async () => {
    const r = await ctx.c.get(`/api/class/summary?assignmentId=${ctx.assignmentId}`);
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ sectionLabel: '10/3', subjectName: 'العلوم', sessions: 5, from: null, to: null });
    const [a, b, c] = r.body.rows;
    expect(a).toMatchObject({ studentId: A, rollNo: 1, flags: [], lastDate: D5 });
    expect(a.counts).toEqual({ sessions: 5, participatedSessions: 4, noParticipationSessions: 1, participations: 7, positive: 1, negative: 0, notes: 0, rate: 80 });
    expect(b.counts).toEqual({ sessions: 5, participatedSessions: 1, noParticipationSessions: 4, participations: 1, positive: 0, negative: 3, notes: 0, rate: 20 });
    expect(b.flags).toEqual(['low', 'concern']);
    expect(c.counts).toMatchObject({ sessions: 5, participatedSessions: 0, noParticipationSessions: 4, notes: 1, rate: 0 });
    expect(c.flags).toEqual(['silent']);
    expect(r.body.totals).toEqual({ participatedSessions: 5, noParticipationSessions: 9, participations: 8, positive: 1, negative: 3, notes: 1, rate: 35.7 });
  });

  it('الملخص: آخر الحصص بالأحدث أولًا وبأعداد كل حصة، ومعاملات النطاق تقيّد كل شيء', async () => {
    const r = await ctx.c.get(`/api/class/summary?assignmentId=${ctx.assignmentId}`);
    expect(r.body.recent.map((s: any) => s.date)).toEqual([D5, D4, D3, D2, D1]);
    expect(r.body.recent[0]).toMatchObject({ date: D5, period: 1, sectionLabel: '10/3', subjectName: 'العلوم', recordedStudents: 3, participating: 1, didNotParticipate: 1, participations: 1, notes: 1, negative: 0 });
    expect(r.body.recent[1]).toMatchObject({ date: D4, recordedStudents: 3, negative: 1, didNotParticipate: 3 });

    const ranged = await ctx.c.get(`/api/class/summary?assignmentId=${ctx.assignmentId}&from=${D3}&to=${D4}`);
    expect(ranged.body.sessions).toBe(2);
    expect(ranged.body.rows[0].counts).toMatchObject({ sessions: 2, participatedSessions: 1, noParticipationSessions: 1, participations: 3, rate: 50 });
    expect(ranged.body.rows[1].counts).toMatchObject({ participatedSessions: 1, noParticipationSessions: 1, negative: 1 });
    expect(ranged.body.rows[1].flags).toEqual([]); // أقل من 4 حصص: لا حكم على المشاركة بعد
    expect((await ctx.c.get(`/api/class/summary?assignmentId=${ctx.assignmentId}&from=${D4}&to=${D1}`)).status).toBe(400);
    expect((await ctx.c.get('/api/class/summary')).status).toBe(400);
    // بالشعبة بدل المقرر
    const bySection = await ctx.c.get(`/api/class/summary?sectionId=${ctx.section.id}`);
    expect(bySection.body).toMatchObject({ assignmentId: null, subjectName: null, sessions: 5 });
  });

  it('تقرير الطالب: أعداده وأسباب سلوكه مجمّعة وخطه الزمني بالأحدث أولًا ومقارنته بالشعبة', async () => {
    const r = await ctx.c.get(`/api/class/students/${B}`);
    expect(r.status).toBe(200);
    expect(r.body.student).toMatchObject({ id: B, fullName: 'فاطمة بنت خالد البلوشية' });
    expect(r.body.student.enrollment.sectionLabel).toBe('10/3');
    expect(r.body.counts).toMatchObject({ sessions: 5, participatedSessions: 1, noParticipationSessions: 4, negative: 3, rate: 20 });
    expect(r.body.sectionRate).toBe(35.7);
    expect(r.body.reasons).toEqual([
      { kind: 'negative', reason: 'حديث جانبي', count: 2 },
      { kind: 'negative', reason: 'عدم أداء الواجب', count: 1 },
    ]);
    expect(r.body.totalSessions).toBe(5);
    expect(r.body.sessions.map((s: any) => [s.date, s.participation, s.records.length])).toEqual([
      [D5, 0, 0],
      [D4, 0, 1],
      [D3, 1, 0],
      [D2, 0, 1],
      [D1, 0, 1],
    ]);
    expect(r.body.sessions[1].records[0]).toMatchObject({ kind: 'negative', reason: 'عدم أداء الواجب' });
    expect(r.body.bySubject).toHaveLength(1);
    expect(r.body.bySubject[0]).toMatchObject({ subjectName: 'العلوم', sectionLabel: '10/3' });
    expect(r.body.assignments).toEqual([{ id: ctx.assignmentId, label: 'العلوم — 10/3' }]);
  });

  it('تقرير الطالب: الحد الأقصى للحصص لا يغيّر الأعداد، والنطاق والمقرر يصفّيان، وطالب بلا تسجيلات يُرجع أصفارًا', async () => {
    const limited = await ctx.c.get(`/api/class/students/${B}?limit=2`);
    expect(limited.body.sessions).toHaveLength(2);
    expect(limited.body.totalSessions).toBe(5);
    expect(limited.body.counts.sessions).toBe(5);
    const ranged = await ctx.c.get(`/api/class/students/${B}?from=${D4}&to=${D5}&assignmentId=${ctx.assignmentId}`);
    expect(ranged.body.counts).toMatchObject({ sessions: 2, negative: 1 });
    expect(ranged.body.assignmentId).toBe(ctx.assignmentId);

    const fresh = (await ctx.c.post(`/api/sections/${ctx.section.id}/students`, { students: [{ fullName: 'ناصر بن حمد الراشدي' }] })).body.at(-1).student.id;
    const z = await ctx.c.get(`/api/class/students/${fresh}`);
    expect(z.body.counts).toEqual({ sessions: 0, participatedSessions: 0, noParticipationSessions: 0, participations: 0, positive: 0, negative: 0, notes: 0, rate: null });
    expect(z.body.sessions).toEqual([]);
    expect(z.body.reasons).toEqual([]);
    await ctx.c.del(`/api/students/${fresh}`);
  });

  it('النظرة العامة: حصة اليوم من الجدول بما سُجّل لها، وآخر الحصص، والإجمالي', async () => {
    setSlot(env.db.orm, ownerId, { yearId: ctx.year.id, weekday: 1, period: 1, assignmentId: ctx.assignmentId });
    const o = cls.getOverview(env.db.orm, ownerId, { date: D3, time: '07:45', weekday: 1 }, 12);
    expect(o.total).toBe(14 + 5); // 14 مشاركة + 5 تسجيلات
    expect(o.slots).toHaveLength(1);
    expect(o.slots[0]).toMatchObject({ period: 1, studentCount: 3, state: 'current' });
    expect(o.slots[0]!.assignment.sectionLabel).toBe('10/3');
    expect(o.slots[0]!.session).toMatchObject({ date: D3, recordedStudents: 3, participating: 2, didNotParticipate: 1, participations: 4 });
    expect(o.recent.map((s) => s.date)).toEqual([D5, D4, D3, D2, D1]);
    expect(cls.getOverview(env.db.orm, ownerId, { date: D3, time: '07:45', weekday: 1 }, 2).recent).toHaveLength(2);
    // يوم بلا حصص
    expect(cls.getOverview(env.db.orm, ownerId, { date: D2, time: '07:45', weekday: 0 }).slots).toEqual([]);
    // الحصة المسجّلة بلا رقم تُنسب لحصة الجدول
    await put(A, D3, 3, null);
    const o2 = cls.getOverview(env.db.orm, ownerId, { date: D3, time: '07:45', weekday: 1 });
    expect(o2.slots[0]!.session).toMatchObject({ date: D3 });
    await put(A, D3, null, null);
  });

  it('لوحة التحكم: عدد المسجَّل لكل حصة اليوم، وسلوك يحتاج متابعة، وقليلو المشاركة بعتباتهم', () => {
    const dash = buildDashboard(env.db.orm, ownerId, { date: D5, time: '07:45', weekday: 3 });
    expect(dash.classroom.total).toBe(19);
    expect(dash.classroom.negativeRecent).toEqual([expect.objectContaining({ fullName: 'فاطمة بنت خالد البلوشية', sectionLabel: '10/3', count: 3, rate: null, reason: 'عدم أداء الواجب' })]);
    expect(dash.classroom.lowParticipation.map((x) => [x.fullName, x.count, x.rate])).toEqual([
      ['سعيد بن ناصر الهنائي', 4, 0],
      ['فاطمة بنت خالد البلوشية', 5, 20],
    ]);
    // قبل بلوغ الحد الأدنى للحصص لا يُنبَّه على أحد
    const early = buildDashboard(env.db.orm, ownerId, { date: D3, time: '07:45', weekday: 1 });
    expect(early.classroom.lowParticipation).toEqual([]);
    expect(early.todaySlots[0]!.classRecorded).toBe(3);
  });

  it('من لم يستعمل الوحدة بعد: لوحته ونظرته العامة فارغتان بلا أخطاء', async () => {
    const fresh = await newTeacher(admin, 'c@school.om');
    const d = await fresh.get('/api/dashboard');
    expect(d.status).toBe(200);
    expect(d.body.classroom).toEqual({ total: 0, negativeRecent: [], lowParticipation: [] });
    expect((await fresh.get('/api/class/overview')).body).toMatchObject({ slots: [], recent: [], total: 0 });
  });
});

describe('تقارير HTML وExcel', () => {
  beforeAll(async () => {
    wipe();
    await put(A, D1, 2);
    await put(B, D1, 0);
    await put(C, D1, 0);
    await rec(B, D1, 'negative', 'حديث جانبي', 'بعد التنبيه');
    await rec(A, D1, 'positive', 'مساعدة زميل');
    for (const d of [D2, D3, D4, D5]) {
      await put(B, d, 0);
      await put(C, d, 0);
      await put(A, d, 1);
    }
  });
  afterAll(wipe);

  it('تقرير الطالب: مؤشراته وأسباب سلوكه وخطه الزمني ظاهرة (الفترة الافتراضية: الفصل الحالي)', async () => {
    const r = await ctx.c.get(`/api/reports/class-student/html?studentId=${B}`);
    expect(r.status).toBe(200);
    expect(r.body).toContain('تقرير المشاركة والسلوك الصفي');
    expect(r.body).toContain('فاطمة بنت خالد البلوشية');
    expect(r.body).toContain('حديث جانبي');
    expect(r.body).toContain('بعد التنبيه');
    expect(r.body).toContain('لم يشارك');
    expect(r.body).toContain('سلوك غير حسن');
    const a = await ctx.c.get(`/api/reports/class-student/html?studentId=${A}&classAll=true`);
    expect(a.body).toContain('شارك ×2');
    expect(a.body).toContain('مساعدة زميل');
  });

  it('تقرير الشعبة: جدول الطلاب ومؤشرات المتابعة، وExcel بورقتين (الطلاب ثم الحصص)', async () => {
    const r = await ctx.c.get(`/api/reports/class-section/html?assignmentId=${ctx.assignmentId}&classAll=true`);
    expect(r.status).toBe(200);
    expect(r.body).toContain('سجل المشاركة والسلوك الصفي');
    expect(r.body).toContain('سعيد بن ناصر الهنائي');
    expect(r.body).toContain('لم يشارك مطلقًا');

    const x = await ctx.c.get(`/api/reports/class-section/xlsx?assignmentId=${ctx.assignmentId}&classAll=true`);
    expect(x.status).toBe(200);
    expect(x.raw.subarray(0, 2).toString()).toBe('PK');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(x.raw as unknown as ArrayBuffer);
    expect(wb.worksheets.map((w) => w.name)).toEqual(['سجل المشاركة والسلوك الصفي', 'الحصص']);
    const text: string[] = [];
    wb.worksheets[0]!.eachRow((row) => row.eachCell((c) => text.push(String(c.value))));
    expect(text).toContain('سعيد بن ناصر الهنائي');
    const sx = await ctx.c.get(`/api/reports/class-student/xlsx?studentId=${B}&classAll=true`);
    expect(sx.status).toBe(200);
  });

  it('معاملات ناقصة أو خاطئة ← أخطاء عربية، وتاريخ نهاية قبل البداية مرفوض', async () => {
    const m = await ctx.c.get('/api/reports/class-student/html');
    expect(m.status).toBe(400);
    expect(m.body.error.message).toContain('حدّد');
    expect((await ctx.c.get('/api/reports/class-section/html')).status).toBe(400);
    expect((await ctx.c.get(`/api/reports/class-section/html?assignmentId=${ctx.assignmentId}&from=${D4}&to=${D1}`)).status).toBe(400);
  });
});

describe('العزل بين المعلمين', () => {
  let recId: string;
  beforeAll(async () => {
    wipe();
    await put(A, D1, 1);
    recId = (await rec(A, D1, 'negative', 'حديث جانبي')).body.id;
  });
  afterAll(wipe);

  it('معلم آخر لا يرى حصة غيره ولا يسجّل عليها ولا يعدّل ولا يحذف (404) ولا يطبع تقريرًا', async () => {
    const q = `assignmentId=${ctx.assignmentId}&date=${D1}`;
    const calls = await Promise.all([
      other.get(`/api/class/session?${q}`),
      other.put('/api/class/participation', { ...key(D1), studentId: A, count: 1 }),
      other.post('/api/class/session/mark-rest', key(D1)),
      other.del(`/api/class/session?${q}`),
      other.post('/api/class/records', { ...key(D1), studentId: A, kind: 'negative', reason: 'x' }),
      other.patch(`/api/class/records/${recId}`, { reason: 'عبث' }),
      other.del(`/api/class/records/${recId}`),
      other.get(`/api/class/summary?assignmentId=${ctx.assignmentId}`),
      other.get(`/api/class/summary?sectionId=${ctx.section.id}`),
      other.get(`/api/class/students/${A}`),
      other.get(`/api/reports/class-student/html?studentId=${A}`),
      other.get(`/api/reports/class-section/html?assignmentId=${ctx.assignmentId}`),
    ]);
    expect(calls.map((c) => c.status)).toEqual(Array(calls.length).fill(404));
    // لم يتغير شيء
    expect(count('class_participation')).toBe(1);
    expect(count('class_records')).toBe(1);
    expect(env.db.sqlite.prepare('select reason from class_records where id = ?').get(recId)).toEqual({ reason: 'حديث جانبي' });
  });

  it('لا يتسرب شيء إلى نظرته العامة ولا لوحة تحكمه', async () => {
    const o = await other.get('/api/class/overview');
    expect(o.body).toMatchObject({ slots: [], recent: [], total: 0 });
    expect((await other.get('/api/dashboard')).body.classroom).toEqual({ total: 0, negativeRecent: [], lowParticipation: [] });
  });
});

describe('قيود القاعدة والحذف المتسلسل', () => {
  const insertPart = (over: Record<string, unknown> = {}) => {
    const v = { id: crypto.randomUUID(), owner_id: ownerId, student_id: A, assignment_id: ctx.assignmentId, date: D1, period: 0, count: 1, ...over };
    return env.db.sqlite
      .prepare('insert into class_participation (id, owner_id, student_id, assignment_id, date, period, count, created_at, updated_at) values (@id, @owner_id, @student_id, @assignment_id, @date, @period, @count, @t, @t)')
      .run({ ...v, t: new Date().toISOString() });
  };
  const insertRec = (over: Record<string, unknown> = {}) => {
    const v = { id: crypto.randomUUID(), owner_id: ownerId, student_id: A, assignment_id: ctx.assignmentId, date: D1, period: 0, kind: 'negative', reason: 'س', note: null, ...over };
    return env.db.sqlite
      .prepare('insert into class_records (id, owner_id, student_id, assignment_id, date, period, kind, reason, note, created_at, updated_at) values (@id, @owner_id, @student_id, @assignment_id, @date, @period, @kind, @reason, @note, @t, @t)')
      .run({ ...v, t: new Date().toISOString() });
  };
  beforeAll(wipe);
  afterAll(wipe);

  it('القاعدة نفسها ترفض ما يخالف المنطق ولو تجاوز التطبيق', () => {
    expect(() => insertPart({ count: 51 })).toThrow(/CHECK/);
    expect(() => insertPart({ count: -1 })).toThrow(/CHECK/);
    expect(() => insertPart({ period: 13 })).toThrow(/CHECK/);
    expect(() => insertRec({ kind: 'participated' })).toThrow(/CHECK/);
    expect(() => insertRec({ reason: null, note: null })).toThrow(/CHECK/);
    expect(() => insertRec({ period: 13 })).toThrow(/CHECK/);
    expect(insertPart({ count: 50 }).changes).toBe(1);
    expect(() => insertPart({ count: 2 })).toThrow(/UNIQUE/); // صف واحد لكل (طالب × حصة)
    expect(insertPart({ period: 1 }).changes).toBe(1); // حصة أخرى جائزة
  });

  it('حذف المقرر يُبقي التسجيلات بلا مقرر (توثيق لما جرى)، وحذف الطالب يمحو تسجيلاته وحدها', async () => {
    wipe();
    await put(A, D1, 2);
    await put(B, D1, 1);
    await rec(B, D1, 'negative', 'حديث جانبي');
    // طالب B يُحذف: تسجيلاته فقط تذهب
    const fresh = (await ctx.c.post(`/api/sections/${ctx.section.id}/students`, { students: [{ fullName: 'خالد بن سعيد الكلباني' }] })).body.at(-1).student.id;
    await put(fresh, D1, 3);
    await rec(fresh, D1, 'note', 'ملاحظة');
    expect(count('class_participation')).toBe(3);
    expect((await ctx.c.del(`/api/students/${fresh}?force=true`)).status).toBe(200);
    expect(count('class_participation')).toBe(2);
    expect(count('class_records')).toBe(1);

    // المقرر يُحذف: تبقى الأعداد ويظهر الطالب بلا مقرر في تقريره
    expect((await ctx.c.del(`/api/assignments/${ctx.assignmentId}?force=true`)).status).toBe(200);
    expect(count('class_participation')).toBe(2);
    expect(count('class_records')).toBe(1);
    expect(env.db.sqlite.prepare('select count(*) c from class_participation where assignment_id is null').get()).toEqual({ c: 2 });
    const r = await ctx.c.get(`/api/class/students/${B}`);
    expect(r.status).toBe(200);
    expect(r.body.counts).toMatchObject({ sessions: 1, participatedSessions: 1, negative: 1 });
    expect(r.body.sessions[0]).toMatchObject({ assignmentId: null, sectionLabel: null, subjectName: null });
    expect(r.body.bySubject[0]).toMatchObject({ assignmentId: null, subjectName: null });
    // والحصة نفسها لم تعد قابلة للفتح
    expect((await session(D1)).status).toBe(404);
  });

  it('حذف حساب المعلم يمحو كل تسجيلاته', () => {
    expect(count('class_participation') + count('class_records')).toBeGreaterThan(0);
    env.db.sqlite.prepare('delete from users where id = ?').run(ownerId);
    expect(count('class_participation')).toBe(0);
    expect(count('class_records')).toBe(0);
  });
});
