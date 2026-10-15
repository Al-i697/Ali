import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClient, makeEnv, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let other: TestClient;

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
});
afterAll(async () => {
  await env.app.close();
});

const studentIds = () => ctx.roster.map((r: any) => r.student.id as string);

describe('التقويم المستمر: التعريف والرصد', () => {
  let quiz: any;
  let project: any;

  it('ينشئ تقويمًا بالدرجات (الوزن الافتراضي = الدرجة العظمى) وتقويم إتقان', async () => {
    const r = await ctx.c.post('/api/assessments', {
      assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'اختبار قصير 1', type: 'written', maxScore: 10, date: '2026-09-10',
    });
    expect(r.status).toBe(201);
    quiz = r.body;
    expect(quiz.weight).toBe(10);
    expect(quiz.mode).toBe('score');

    const p = await ctx.c.post('/api/assessments', {
      assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'مشروع الوحدة الأولى', type: 'project', maxScore: 20, weight: 10, date: '2026-09-20',
    });
    project = p.body;
    expect(project.weight).toBe(10);

    const m = await ctx.c.post('/api/assessments', {
      assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'مهارة استخدام المجهر', type: 'practical', mode: 'mastery',
    });
    expect(m.status).toBe(201);
    expect(m.body.maxScore).toBeNull();
    expect(m.body.weight).toBe(0);
    expect(m.body.countsTowardTotal).toBe(false);
  });

  it('يرفض تقويم بالدرجات بلا درجة عظمى أو بفصل من عام آخر', async () => {
    const noMax = await ctx.c.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'بلا درجة', type: 'written' });
    expect(noMax.status).toBe(400);
    const y2 = (await ctx.c.post('/api/years', { name: '2027/2028', startDate: '2027-08-22', endDate: '2028-06-15', makeCurrent: false })).body;
    const wrongTerm = await ctx.c.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: y2.terms[0].id, title: 'فصل خاطئ', type: 'written', maxScore: 10 });
    expect(wrongTerm.status).toBe(400);
    expect(wrongTerm.body.error.code).toBe('TERM_MISMATCH');
  });

  it('يرصد الدرجات ويحسب المجاميع بدقة (غائب = صفر، معذور = مستثنى)', async () => {
    const [s1, s2, s3] = studentIds();
    const q = await ctx.c.put(`/api/assessments/${quiz.id}/results`, {
      results: [
        { studentId: s1, score: 8 },
        { studentId: s2, status: 'absent' },
        { studentId: s3, status: 'excused' },
      ],
    });
    expect(q.status).toBe(200);
    expect(q.body.saved).toBe(3);
    await ctx.c.put(`/api/assessments/${project.id}/results`, {
      results: [{ studentId: s1, score: 15 }, { studentId: s2, score: 20 }],
    });

    const gb = (await ctx.c.get(`/api/gradebook?assignmentId=${ctx.assignmentId}&termId=${ctx.term1.id}`)).body;
    expect(gb.students).toHaveLength(3);
    expect(gb.assessments.map((a: any) => a.title)).toEqual(['اختبار قصير 1', 'مشروع الوحدة الأولى', 'مهارة استخدام المجهر']);
    const row = (id: string) => gb.students.find((s: any) => s.studentId === id);
    expect(row(s1).results[quiz.id]).toMatchObject({ score: 8, status: 'graded' });
    expect(row(s2).results[quiz.id]).toMatchObject({ score: null, status: 'absent' });
    expect(row(s3).results[project.id]).toBeUndefined();

    // الملف الشخصي يستخدم نفس دوال الحساب: s1 = 8/10*10 + 15/20*10 = 15.5 من 20 → 77.5%
    const p1 = (await ctx.c.get(`/api/students/${s1}/profile?termId=${ctx.term1.id}`)).body;
    expect(p1.subjects[0]).toMatchObject({ earned: 15.5, possible: 20, percent: 77.5, entered: 2 });
    // s2: الغائب صفر (10 مقام) + المشروع 20/20*10 → 10 من 20 = 50%
    const p2 = (await ctx.c.get(`/api/students/${s2}/profile?termId=${ctx.term1.id}`)).body;
    expect(p2.subjects[0]).toMatchObject({ earned: 10, possible: 20, percent: 50 });
    // s3: المعذور مستثنى والمشروع غير مرصود → لا نسبة
    const p3 = (await ctx.c.get(`/api/students/${s3}/profile?termId=${ctx.term1.id}`)).body;
    expect(p3.subjects[0].percent).toBeNull();
    expect(p3.subjects[0].pending).toBe(1);
    // متوسط الشعبة = (77.5 + 50) / 2
    expect(p1.subjects[0].classAverage).toBe(63.75);
  });

  it('يرفض الدرجات غير الصالحة ولا يحفظ شيئًا من الدفعة الفاسدة', async () => {
    const [s1, s2] = studentIds();
    const tooHigh = await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s2, score: 9 }, { studentId: s1, score: 11 }] });
    expect(tooHigh.status).toBe(400);
    expect(tooHigh.body.error.code).toBe('SCORE_TOO_HIGH');
    // s2 لم تُحفظ درجته (ما زال غائبًا) رغم أنه سبق s1 الفاسد في الدفعة
    const gb = (await ctx.c.get(`/api/gradebook?assignmentId=${ctx.assignmentId}&termId=${ctx.term1.id}`)).body;
    expect(gb.students.find((s: any) => s.studentId === s2).results[quiz.id].status).toBe('absent');

    expect((await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s1, score: 7.555 }] })).status).toBe(400);
    expect((await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s1, score: -1 }] })).status).toBe(400);
    expect((await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s1, level: 3 }] })).status).toBe(400);
    expect((await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s1, score: 5, status: 'absent' }] })).status).toBe(400);
    expect((await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: '00000000-0000-4000-8000-000000000001', score: 5 }] })).status).toBe(400);
  });

  it('يحدّث الدرجة نفسها ويُفرغ الخانة بإعادتها فارغة', async () => {
    const [s1] = studentIds();
    await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s1, score: 9.25 }] });
    let gb = (await ctx.c.get(`/api/gradebook?assignmentId=${ctx.assignmentId}&termId=${ctx.term1.id}`)).body;
    expect(gb.students.find((s: any) => s.studentId === s1).results[quiz.id].score).toBe(9.25);
    await ctx.c.put(`/api/assessments/${quiz.id}/results`, { results: [{ studentId: s1, score: null }] });
    gb = (await ctx.c.get(`/api/gradebook?assignmentId=${ctx.assignmentId}&termId=${ctx.term1.id}`)).body;
    expect(gb.students.find((s: any) => s.studentId === s1).results[quiz.id]).toBeUndefined();
    const rows = env.db.sqlite.prepare('select count(*) c from assessment_results where assessment_id = ?').get(quiz.id) as { c: number };
    expect(rows.c).toBe(2); // s2 غائب + s3 معذور فقط
  });

  it('يرصد مستوى الإتقان ويظهر في مهارات الطالب', async () => {
    const [s1] = studentIds();
    const sk = (await ctx.c.post('/api/skills', { subjectId: ctx.subject.id, title: 'استخدام المجهر الضوئي', code: 'ع-1' })).body;
    const m = (await ctx.c.post('/api/assessments', {
      assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'مهارة المجهر 2', type: 'practical', mode: 'mastery', skillIds: [sk.id],
    })).body;
    expect(m.skillIds).toEqual([sk.id]);
    expect((await ctx.c.put(`/api/assessments/${m.id}/results`, { results: [{ studentId: s1, level: 3 }] })).status).toBe(200);
    expect((await ctx.c.put(`/api/assessments/${m.id}/results`, { results: [{ studentId: s1, score: 5 }] })).status).toBe(400);
    const profile = (await ctx.c.get(`/api/students/${s1}/profile?termId=${ctx.term1.id}`)).body;
    expect(profile.skills).toEqual([expect.objectContaining({ title: 'استخدام المجهر الضوئي', average: 3, count: 1 })]);
  });

  it('يمنع خفض الدرجة العظمى تحت درجات مرصودة وتغيير النمط بعد الرصد', async () => {
    const [s1, s2] = studentIds();
    await ctx.c.put(`/api/assessments/${project.id}/results`, { results: [{ studentId: s1, score: 15 }, { studentId: s2, score: 20 }] });
    const low = await ctx.c.patch(`/api/assessments/${project.id}`, { maxScore: 12 });
    expect(low.status).toBe(409);
    expect(low.body.error.code).toBe('MAX_BELOW_SCORES');
    const mode = await ctx.c.patch(`/api/assessments/${project.id}`, { mode: 'mastery' });
    expect(mode.status).toBe(409);
    const ok = await ctx.c.patch(`/api/assessments/${project.id}`, { title: 'مشروع الوحدة الأولى (معدّل)', maxScore: 25 });
    expect(ok.status).toBe(200);
    expect(ok.body.maxScore).toBe(25);
  });

  it('يطلب تأكيدًا قبل حذف تقويم له نتائج، ثم يحذفها معه', async () => {
    const r = await ctx.c.del(`/api/assessments/${quiz.id}`);
    expect(r.status).toBe(409);
    expect(r.body.error.code).toBe('CONFIRM_REQUIRED');
    expect((await ctx.c.del(`/api/assessments/${quiz.id}?force=true`)).status).toBe(200);
    const left = env.db.sqlite.prepare('select count(*) c from assessment_results where assessment_id = ?').get(quiz.id) as { c: number };
    expect(left.c).toBe(0);
  });
});

describe('عزل بيانات المعلمين (حماية بيانات الطلاب)', () => {
  it('لا يرى معلم بيانات غيره في أي مورد — النتيجة 404 دائمًا', async () => {
    const sid = studentIds()[0]!;
    const aid = (await ctx.c.get(`/api/assessments?assignmentId=${ctx.assignmentId}`)).body[0].id;
    const targets = [
      `/api/sections/${ctx.section.id}`,
      `/api/sections/${ctx.section.id}/students`,
      `/api/sections/${ctx.section.id}/impact`,
      `/api/students/${sid}`,
      `/api/students/${sid}/profile`,
      `/api/students/${sid}/notes`,
      `/api/assessments/${aid}`,
      `/api/assessments?assignmentId=${ctx.assignmentId}`,
      `/api/gradebook?assignmentId=${ctx.assignmentId}&termId=${ctx.term1.id}`,
    ];
    for (const url of targets) {
      const r = await other.get(url);
      expect(r.status, url).toBe(404);
    }
  });

  it('لا يستطيع معلم التعديل أو الحذف أو الرصد على بيانات غيره', async () => {
    const sid = studentIds()[0]!;
    const aid = (await ctx.c.get(`/api/assessments?assignmentId=${ctx.assignmentId}`)).body[0].id;
    expect((await other.patch(`/api/students/${sid}`, { fullName: 'اسم مخترق' })).status).toBe(404);
    expect((await other.del(`/api/students/${sid}?force=true`)).status).toBe(404);
    expect((await other.put(`/api/assessments/${aid}/results`, { results: [{ studentId: sid, score: 1 }] })).status).toBe(404);
    expect((await other.del(`/api/sections/${ctx.section.id}?force=true`)).status).toBe(404);
    expect((await other.post(`/api/sections/${ctx.section.id}/students`, { students: [{ fullName: 'طالب دخيل' }] })).status).toBe(404);
    expect((await other.post('/api/assessments', { assignmentId: ctx.assignmentId, termId: ctx.term1.id, title: 'تقويم دخيل', type: 'written', maxScore: 5 })).status).toBe(404);
    // لا تأثير فعلي: الاسم كما هو
    expect((await ctx.c.get(`/api/students/${sid}`)).body.fullName).toBe('أحمد بن سالم الحارثي');
  });

  it('قوائم المعلم الآخر فارغة ولا تتسرب إليها بيانات', async () => {
    expect((await other.get('/api/years')).body).toEqual([]);
    expect((await other.get('/api/subjects')).body).toEqual([]);
    expect((await other.get('/api/students')).body.total).toBe(0);
  });

  it('لا يمكن ربط تقويم بمهارة أو مقرر لمعلم آخر', async () => {
    const sk = (await ctx.c.post('/api/skills', { subjectId: ctx.subject.id, title: 'مهارة خاصة' })).body;
    expect((await other.post('/api/skills', { subjectId: ctx.subject.id, title: 'x' })).status).toBe(404);
    expect((await other.patch(`/api/skills/${sk.id}`, { title: 'x' })).status).toBe(404);
  });
});
