import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { weekdayOf } from '../../src/shared/dates';
import { buildDashboard } from '../../src/server/modules/dashboard/service';
import { TestClient, makeEnv, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let userId: string;

beforeAll(async () => {
  env = await makeEnv();
  const admin = new TestClient(env.app);
  await admin.setupAdmin();
  ctx = await seedFor(admin);
  userId = (await admin.get('/api/auth/me')).body.user.id;
});
afterAll(async () => {
  await env.app.close();
});

const SUNDAY = '2026-09-13';
const lessonBody = (over: Record<string, unknown> = {}) => ({
  assignmentId: ctx.assignmentId,
  date: SUNDAY,
  period: 2,
  title: 'الخلية: وحدة بناء الكائن الحي',
  unitName: 'الوحدة الأولى: الأحياء',
  objectives: ['أن يتعرف الطالب أجزاء الخلية', 'أن يقارن بين الخلية النباتية والحيوانية'],
  strategies: ['التعلم التعاوني', 'العصف الذهني'],
  activities: [
    { phase: 'intro', description: 'عرض صورة مجهرية', minutes: 5 },
    { phase: 'main', description: 'شرح أجزاء الخلية', minutes: 20 },
  ],
  ...over,
});

describe('التحضير الإلكتروني', () => {
  let lesson: any;

  it('ينشئ تحضيرًا ويحدد الفصل الدراسي تلقائيًا من التاريخ', async () => {
    const r = await ctx.c.post('/api/lessons', lessonBody());
    expect(r.status).toBe(201);
    lesson = r.body;
    expect(lesson.termId).toBe(ctx.term1.id);
    expect(lesson.status).toBe('draft');
    expect(lesson.sectionLabel).toBe('10/3');
    expect(lesson.activities.map((a: any) => a.id)).toEqual(['a1', 'a2']);
  });

  it('يرفض تحضيرًا بلا عنوان أو بتاريخ غير صالح', async () => {
    expect((await ctx.c.post('/api/lessons', lessonBody({ title: '   ' }))).status).toBe(400);
    expect((await ctx.c.post('/api/lessons', lessonBody({ date: '2026-02-30' }))).status).toBe(400);
  });

  it('يبحث بتطبيع عربي في العنوان والوحدة', async () => {
    // «الاحياء» بلا همزة تجد «الأحياء» في اسم الوحدة
    const r = await ctx.c.get('/api/lessons?q=' + encodeURIComponent('الاحياء الخلية'));
    expect(r.body.total).toBe(1);
    expect((await ctx.c.get('/api/lessons?q=' + encodeURIComponent('كهرباء'))).body.total).toBe(0);
  });

  it('يعدّل التحضير ويحدّث نص البحث والحالة', async () => {
    const r = await ctx.c.patch(`/api/lessons/${lesson.id}`, { title: 'الأنسجة النباتية', status: 'ready', reflection: 'كان التفاعل جيدًا' });
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ready');
    expect((await ctx.c.get('/api/lessons?q=' + encodeURIComponent('الانسجه'))).body.total).toBe(1);
    // العنوان القديم لم يعد قابلًا للبحث (نص البحث يُحدَّث مع كل تعديل)
    expect((await ctx.c.get('/api/lessons?q=' + encodeURIComponent('الخلية'))).body.total).toBe(0);
  });

  it('ينسخ التحضير إلى شعب وتواريخ متعددة كمسودات دون نسخ التأمل', async () => {
    const sec2 = (await ctx.c.post('/api/sections', { yearId: ctx.year.id, gradeLevel: 10, name: '4', subjectIds: [ctx.subject.id] })).body;
    const copy = await ctx.c.post(`/api/lessons/${lesson.id}/copy`, {
      targets: [
        { assignmentId: sec2.assignments[0].id, date: '2026-09-14', period: 3 },
        { assignmentId: ctx.assignmentId, date: '2026-09-20' },
      ],
    });
    expect(copy.status).toBe(201);
    expect(copy.body).toHaveLength(2);
    const full = (await ctx.c.get(`/api/lessons/${copy.body[0].id}`)).body;
    expect(full.status).toBe('draft');
    expect(full.reflection).toBeNull();
    expect(full.sourceLessonId).toBe(lesson.id);
    expect(full.objectives).toEqual(lesson.objectives);
    expect(full.sectionLabel).toBe('10/4');
    expect(full.date).toBe('2026-09-14');
  });

  it('القوالب منفصلة عن التحضير المجدول', async () => {
    await ctx.c.patch(`/api/lessons/${lesson.id}`, { isTemplate: true });
    const scheduled = (await ctx.c.get('/api/lessons')).body;
    const templates = (await ctx.c.get('/api/lessons?templates=true')).body;
    expect(scheduled.items.find((l: any) => l.id === lesson.id)).toBeUndefined();
    expect(templates.items.map((l: any) => l.id)).toEqual([lesson.id]);
    await ctx.c.patch(`/api/lessons/${lesson.id}`, { isTemplate: false });
  });

  it('يصفّي بالفترة والشعبة', async () => {
    const week = (await ctx.c.get('/api/lessons?from=2026-09-13&to=2026-09-15')).body;
    expect(week.total).toBe(2);
    const one = (await ctx.c.get(`/api/lessons?assignmentId=${ctx.assignmentId}`)).body;
    expect(one.total).toBe(2);
  });
});

describe('الجدول الأسبوعي', () => {
  it('يضع حصة ويستبدلها في الخانة نفسها ثم يفرغها', async () => {
    const put = (assignmentId: string | null, weekday = 0, period = 2) =>
      ctx.c.put('/api/timetable/slot', { yearId: ctx.year.id, weekday, period, assignmentId });
    const first = await put(ctx.assignmentId);
    expect(first.status).toBe(200);
    expect(first.body.slot.assignment.sectionLabel).toBe('10/3');
    // الخانة نفسها مرة أخرى لا تنشئ سجلًا ثانيًا
    await put(ctx.assignmentId, 0, 2);
    expect((await ctx.c.get(`/api/timetable?yearId=${ctx.year.id}`)).body).toHaveLength(1);
    expect((await put(null)).body.slot).toBeNull();
    expect((await ctx.c.get(`/api/timetable?yearId=${ctx.year.id}`)).body).toHaveLength(0);
    await put(ctx.assignmentId, 0, 2); // نُبقيه للاختبارات التالية
  });

  it('يرفض مقررًا من عام آخر', async () => {
    const y2 = (await ctx.c.post('/api/years', { name: '2027/2028', startDate: '2027-08-22', endDate: '2028-06-15', makeCurrent: false })).body;
    const r = await ctx.c.put('/api/timetable/slot', { yearId: y2.id, weekday: 1, period: 1, assignmentId: ctx.assignmentId });
    expect(r.status).toBe(400);
  });
});

describe('المهام والتقويم الدراسي', () => {
  let task: any;
  it('ينشئ مهمة ويسجّل وقت الإنجاز عند إتمامها', async () => {
    const r = await ctx.c.post('/api/tasks', { title: 'تصحيح أوراق الاختبار القصير', dueDate: SUNDAY, priority: 'high', assignmentId: ctx.assignmentId });
    expect(r.status).toBe(201);
    task = r.body;
    expect(task.assignmentLabel).toBe('العلوم — 10/3');
    const done = await ctx.c.patch(`/api/tasks/${task.id}`, { status: 'done' });
    expect(done.body.completedAt).toBeTruthy();
    const reopen = await ctx.c.patch(`/api/tasks/${task.id}`, { status: 'open' });
    expect(reopen.body.completedAt).toBeNull();
  });

  it('يرفض وقتًا بلا تاريخ', async () => {
    expect((await ctx.c.post('/api/tasks', { title: 'x', dueTime: '10:00' })).status).toBe(400);
  });

  it('يدمج المهام والتقويمات والتحضيرات في تقويم واحد مرتب', async () => {
    await ctx.c.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'اختبار الوحدة', type: 'written', maxScore: 20, date: '2026-09-14' });
    const cal = (await ctx.c.get('/api/calendar?from=2026-09-13&to=2026-09-20')).body;
    expect(cal.map((i: any) => i.type)).toEqual(expect.arrayContaining(['task', 'assessment', 'lesson']));
    const dates = cal.map((i: any) => i.date);
    expect([...dates].sort()).toEqual(dates);
    expect((await ctx.c.get('/api/calendar?from=2026-09-20&to=2026-09-13')).status).toBe(400);
  });
});

describe('لوحة التحكم', () => {
  it('يجمع حصص اليوم وحالة التحضير والمهام والتقويمات غير المكتملة', async () => {
    expect(weekdayOf(SUNDAY)).toBe(0);
    // خلال الحصة الثانية (08:15–09:00 افتراضيًا)
    const d = buildDashboard(env.db.orm, userId, { date: SUNDAY, time: '08:30', weekday: 0 });
    expect(d.year?.name).toBe('2026/2027');
    expect(d.term?.number).toBe(1);
    expect(d.weekNumber).toBe(4); // الأسبوع الرابع منذ 23 أغسطس (الأحد)
    expect(d.counts).toEqual({ sections: 2, students: 3, assignments: 2 });
    expect(d.setup).toMatchObject({ hasYear: true, hasSection: true, hasStudents: true, hasTimetable: true, hasLesson: true });

    expect(d.todaySlots).toHaveLength(1);
    const slot = d.todaySlots[0]!;
    expect(slot).toMatchObject({ period: 2, state: 'current', start: '08:15', end: '09:00' });
    expect(slot.lesson?.title).toBe('الأنسجة النباتية'); // له تحضير اليوم
    expect(d.lessonsThisWeek).toEqual({ planned: 1, slots: 1 });

    expect(d.tasks.today.map((t) => t.title)).toEqual(['تصحيح أوراق الاختبار القصير']);
    expect(d.upcomingAssessments.map((a) => a.title)).toEqual(['اختبار الوحدة']);
  });

  it('يقترح نسخ آخر تحضير عند غياب تحضير اليوم، ويحسب الحصة المنتهية/القادمة', async () => {
    const monday = '2026-09-14'; // لا حصص مجدولة يوم الاثنين في الجدول
    const none = buildDashboard(env.db.orm, userId, { date: monday, time: '07:00', weekday: 1 });
    expect(none.todaySlots).toHaveLength(0);
    await ctx.c.put('/api/timetable/slot', { yearId: ctx.year.id, weekday: 1, period: 4, assignmentId: ctx.assignmentId });
    const mon = buildDashboard(env.db.orm, userId, { date: monday, time: '07:00', weekday: 1 });
    expect(mon.todaySlots[0]).toMatchObject({ period: 4, state: 'upcoming', lesson: null });
    expect(mon.todaySlots[0]!.lastLesson?.date).toBe(SUNDAY);
    const later = buildDashboard(env.db.orm, userId, { date: monday, time: '12:00', weekday: 1 });
    expect(later.todaySlots[0]!.state).toBe('past');
  });

  it('يُظهر التقويمات غير المكتملة والطلاب الذين يحتاجون دعمًا', async () => {
    const a = (await ctx.c.get(`/api/assessments?assignmentId=${ctx.assignmentId}`)).body.find((x: any) => x.title === 'اختبار الوحدة');
    const [s1, s2] = ctx.roster.map((r: any) => r.student.id);
    await ctx.c.patch(`/api/assessments/${a.id}`, { date: '2026-09-10' });
    await ctx.c.put(`/api/assessments/${a.id}/results`, { results: [{ studentId: s1, score: 18 }, { studentId: s2, score: 6 }] });
    const d = buildDashboard(env.db.orm, userId, { date: SUNDAY, time: '08:30', weekday: 0 });
    expect(d.incomplete).toEqual([expect.objectContaining({ title: 'اختبار الوحدة', missing: 1, total: 3 })]);
    expect(d.attention).toEqual([expect.objectContaining({ percent: 30, sectionLabel: '10/3' })]); // 6 من 20
    expect(d.attention[0]!.studentId).toBe(s2);
  });

  it('endpoint لوحة التحكم يعمل ويعيد بنية سليمة', async () => {
    const r = await ctx.c.get('/api/dashboard');
    expect(r.status).toBe(200);
    expect(r.body.counts.sections).toBe(2);
    expect(Array.isArray(r.body.todaySlots)).toBe(true);
  });

  it('معلم جديد بلا بيانات يحصل على لوحة فارغة بدل خطأ', async () => {
    const e2 = await makeEnv();
    const c2 = new TestClient(e2.app);
    await c2.setupAdmin();
    const r = await c2.get('/api/dashboard');
    expect(r.status).toBe(200);
    expect(r.body.setup.hasYear).toBe(false);
    expect(r.body.todaySlots).toEqual([]);
    await e2.app.close();
  });
});
