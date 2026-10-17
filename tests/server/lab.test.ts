import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addDays, todayISO } from '../../src/shared/dates';
import * as lab from '../../src/server/modules/lab/service';
import { TestClient, makeEnv, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let other: TestClient;
let ownerId: string;
const TODAY = '2026-10-15'; // تاريخ مُحقَن للاختبارات التي تعتمد على «اليوم» (لا تعتمد على الساعة الحقيقية)
const page = (o: Partial<lab.LabFilter> = {}): lab.LabFilter => ({ limit: 200, offset: 0, ...o });

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
});
afterAll(async () => {
  await env.app.close();
});

const onion = () => ({
  assignmentId: ctx.assignmentId,
  date: '2026-10-01',
  period: 2,
  kind: 'experiment',
  title: 'فحص خلايا البصل بالمجهر',
  location: 'مختبر العلوم',
  objectives: ['أن يحضّر الطالب شريحة مجهرية'],
  materials: ['مجهر ضوئي', 'شرائح زجاجية'],
  safety: ['ارتداء النظارات الواقية'],
  procedure: 'يُفصل غشاء رقيق من البصل ويوضع على الشريحة.',
});

describe('الإنشاء والتحقق', () => {
  // كل مجموعة تبدأ من سجلّ نظيف كي لا تتأثر الأعداد في المجموعات اللاحقة بما أُنشئ هنا
  afterAll(() => {
    env.db.sqlite.prepare('delete from lab_activities where owner_id = ?').run(ownerId);
  });

  it('ينشئ نشاطًا «مخطَّطًا» افتراضيًا ويعيده بتفاصيله (201) ويسجّل الحدث في سجل العمليات بلا عنوانه', async () => {
    const r = await ctx.c.post('/api/lab-activities', onion());
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({
      sectionLabel: '10/3', subjectName: 'العلوم', kind: 'experiment', status: 'planned', period: 2, participants: null,
      location: 'مختبر العلوم', materials: ['مجهر ضوئي', 'شرائح زجاجية'], results: null, sourceId: null,
    });
    const logs = env.db.sqlite.prepare("select meta from audit_log where action='lab_activity_created'").all() as { meta: string }[];
    expect(logs).toHaveLength(1);
    expect(logs[0]!.meta).not.toMatch(/البصل|مجهر/);
  });

  it('النوع الافتراضي «تجربة عملية» والنشاط العام بلا شعبة مقبول', async () => {
    const r = await ctx.c.post('/api/lab-activities', { date: '2026-11-20', title: 'معرض العلوم المدرسي', kind: 'competition' });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ assignmentId: null, sectionLabel: null, subjectName: null, kind: 'competition' });
    const d = await ctx.c.post('/api/lab-activities', { date: '2026-11-21', title: 'بلا نوع' });
    expect(d.body.kind).toBe('experiment');
    await ctx.c.del(`/api/lab-activities/${d.body.id}`);
  });

  it('يرفض بأخطاء عربية مرتبطة بالحقول: عنوان فارغ، نوع غير معروف، مشاركون سالبون، حصة خارج النطاق، تاريخ غير صالح', async () => {
    const t = await ctx.c.post('/api/lab-activities', { ...onion(), title: '   ' });
    expect(t.status).toBe(400);
    expect(t.body.error.fields.title).toBeTruthy();
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), kind: 'magic' })).status).toBe(400);
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), participants: -1 })).status).toBe(400);
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), period: 13 })).status).toBe(400);
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), date: '2026-13-40' })).status).toBe(400);
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), date: undefined })).status).toBe(400);
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), status: 'finished' })).status).toBe(400);
  });

  it('لا يسجَّل «نُفِّذ» لتاريخ لم يحن بعد — عند الإنشاء ولا عند التعديل', async () => {
    const future = await ctx.c.post('/api/lab-activities', { ...onion(), date: '2999-01-01', status: 'done' });
    expect(future.status).toBe(400);
    expect(future.body.error.code).toBe('FUTURE_DONE');
    expect(future.body.error.fields.date).toBeTruthy();

    const planned = (await ctx.c.post('/api/lab-activities', { ...onion(), title: 'نشاط مستقبلي', date: '2999-01-01' })).body;
    const mark = await ctx.c.patch(`/api/lab-activities/${planned.id}`, { status: 'done' });
    expect(mark.status).toBe(400);
    expect(mark.body.error.code).toBe('FUTURE_DONE');
    // وبعد تصحيح التاريخ إلى الماضي يصح التسجيل في طلب واحد
    const ok = await ctx.c.patch(`/api/lab-activities/${planned.id}`, { status: 'done', date: '2026-10-02', participants: 3 });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ status: 'done', date: '2026-10-02', participants: 3 });
    // نقل نشاط منفَّذ إلى المستقبل ممنوع أيضًا
    const move = await ctx.c.patch(`/api/lab-activities/${planned.id}`, { date: '2999-01-01' });
    expect(move.status).toBe(400);
    await ctx.c.del(`/api/lab-activities/${planned.id}`);
  });

  it('الحارس باليوم المُحقَن: اليوم نفسه مسموح وغده ممنوع', () => {
    const db = env.db.orm;
    const asg = ctx.assignmentId;
    const ok = lab.createLab(db, ownerId, { assignmentId: asg, date: TODAY, title: 'اليوم', status: 'done' }, TODAY);
    expect(ok.status).toBe('done');
    expect(() => lab.createLab(db, ownerId, { assignmentId: asg, date: '2026-10-16', title: 'غدًا', status: 'done' }, TODAY)).toThrow(/لم يحن/);
    lab.deleteLab(db, ownerId, ok.id);
  });
});

describe('التعديل والقائمة والإحصاءات (بتاريخ مُحقَن)', () => {
  const ids: Record<string, string> = {};

  it('يجهّز أنشطة متنوعة بالخدمة', () => {
    const db = env.db.orm;
    const mk = (key: string, input: Parameters<typeof lab.createLab>[2]) => (ids[key] = lab.createLab(db, ownerId, input, TODAY).id);
    mk('doneA', { assignmentId: ctx.assignmentId, date: '2026-09-10', period: 1, kind: 'experiment', title: 'تجربة الأسموزية', location: 'مختبر الأحياء', status: 'done', participants: 20, materials: ['ميزان حساس'] });
    mk('doneB', { assignmentId: ctx.assignmentId, date: '2026-09-17', period: 3, kind: 'demo', title: 'عرض عملي للانتشار', status: 'done', participants: 18 });
    mk('doneNoCount', { assignmentId: ctx.assignmentId, date: '2026-09-18', kind: 'activity', title: 'نشاط بلا عدد مسجَّل', status: 'done' });
    mk('overdue', { assignmentId: ctx.assignmentId, date: '2026-10-10', period: 2, kind: 'project', title: 'مشروع الخلية', status: 'planned' });
    mk('today', { assignmentId: ctx.assignmentId, date: TODAY, kind: 'experiment', title: 'تجربة اليوم', status: 'planned' });
    mk('soon', { assignmentId: ctx.assignmentId, date: '2026-10-20', period: 4, kind: 'field_trip', title: 'زيارة ميدانية للمتحف', status: 'planned' });
    mk('cancelled', { assignmentId: ctx.assignmentId, date: '2026-10-05', kind: 'experiment', title: 'تجربة ملغاة', status: 'cancelled', participants: 99 });
    mk('general', { date: '2026-10-25', kind: 'competition', title: 'معرض العلوم', status: 'planned' });
  });

  it('الفرز: الأحدث تاريخًا أولًا ثم الحصة، والمُعلَّم «فات موعده» للمخطَّط الماضي فقط', () => {
    const r = lab.listLab(env.db.orm, ownerId, page({ assignmentId: ctx.assignmentId }), TODAY);
    const titles = r.items.map((i) => i.title);
    expect(titles.indexOf('زيارة ميدانية للمتحف')).toBeLessThan(titles.indexOf('تجربة اليوم'));
    expect(titles.indexOf('تجربة اليوم')).toBeLessThan(titles.indexOf('مشروع الخلية'));
    const byId = new Map(r.items.map((i) => [i.id, i]));
    expect(byId.get(ids.overdue!)!.overdue).toBe(true);
    expect(byId.get(ids.today!)!.overdue).toBe(false);
    expect(byId.get(ids.doneA!)!.overdue).toBe(false);
    expect(byId.get(ids.cancelled!)!.overdue).toBe(false);
  });

  it('الإحصاءات: لا يدخل الملغى في مجموع المشاركين ويُحسب المنفَّذ فقط، ولا تتأثر بتصفية الحالة', () => {
    const all = lab.listLab(env.db.orm, ownerId, page({ assignmentId: ctx.assignmentId }), TODAY);
    expect(all.stats).toMatchObject({ done: 3, planned: 3, cancelled: 1, overdue: 1, participants: 38 });
    const onlyDone = lab.listLab(env.db.orm, ownerId, page({ assignmentId: ctx.assignmentId, status: 'done' }), TODAY);
    expect(onlyDone.total).toBe(3);
    expect(onlyDone.items).toHaveLength(3);
    expect(onlyDone.stats).toEqual(all.stats); // الشرائح تبقى ظاهرة بأعدادها
  });

  it('الترشيح: المدى الزمني، النوع، الحالة، العرض overdue، والنشاط العام يُستثنى من تصفية الشعبة', () => {
    const db = env.db.orm;
    expect(lab.listLab(db, ownerId, page({ from: '2026-09-01', to: '2026-09-30' }), TODAY).items.map((i) => i.title).sort()).toEqual(['تجربة الأسموزية', 'عرض عملي للانتشار', 'نشاط بلا عدد مسجَّل'].sort());
    expect(lab.listLab(db, ownerId, page({ kind: 'field_trip' }), TODAY).items.map((i) => i.title)).toEqual(['زيارة ميدانية للمتحف']);
    expect(lab.listLab(db, ownerId, page({ view: 'overdue' }), TODAY).items.map((i) => i.title)).toEqual(['مشروع الخلية']);
    expect(lab.listLab(db, ownerId, page({ status: 'cancelled' }), TODAY).items.map((i) => i.title)).toEqual(['تجربة ملغاة']);
    // بحسب الشعبة/المادة: النشاط العام (بلا مقرر) لا يظهر
    const bySection = lab.listLab(db, ownerId, page({ sectionId: ctx.section.id }), TODAY);
    expect(bySection.items.some((i) => i.title === 'معرض العلوم')).toBe(false);
    const bySubject = lab.listLab(db, ownerId, page({ subjectId: ctx.subject.id }), TODAY);
    expect(bySubject.items.some((i) => i.title === 'معرض العلوم')).toBe(false);
    // بلا تصفية: يظهر مع بقية الأنشطة بوسم «عام»
    const general = lab.listLab(db, ownerId, page(), TODAY).items.find((i) => i.title === 'معرض العلوم')!;
    expect(general).toMatchObject({ assignmentId: null, sectionLabel: null });
  });

  it('البحث يطبّع العربية (ة/ه، الهمزات) ويشمل العنوان والمكان والمواد، ويعمل بعد التعديل', async () => {
    const db = env.db.orm;
    expect(lab.listLab(db, ownerId, page({ q: 'تجربه الاسموزيه' }), TODAY).items.map((i) => i.title)).toEqual(['تجربة الأسموزية']);
    expect(lab.listLab(db, ownerId, page({ q: 'ميزان' }), TODAY).items.map((i) => i.title)).toEqual(['تجربة الأسموزية']); // من المواد
    expect(lab.listLab(db, ownerId, page({ q: 'مختبر الاحياء' }), TODAY).items.map((i) => i.title)).toEqual(['تجربة الأسموزية']); // من المكان (الهمزة موحَّدة)
    const r = await ctx.c.patch(`/api/lab-activities/${ids.doneB}`, { title: 'عرض عملي للتبخر' });
    expect(r.status).toBe(200);
    expect(lab.listLab(db, ownerId, page({ q: 'تبخر' }), TODAY).items.map((i) => i.id)).toEqual([ids.doneB]);
    expect(lab.listLab(db, ownerId, page({ q: 'للانتشار' }), TODAY).total).toBe(0);
    await ctx.c.patch(`/api/lab-activities/${ids.doneB}`, { materials: ['مجهر ضوئي'] });
    expect(lab.listLab(db, ownerId, page({ q: 'مجهر' }), TODAY).items.map((i) => i.id)).toContain(ids.doneB);
  });

  it('الترقيم: limit/offset يقتطعان القائمة ويبقى total والإحصاءات كاملين', () => {
    const p1 = lab.listLab(env.db.orm, ownerId, page({ limit: 3, offset: 0 }), TODAY);
    const p2 = lab.listLab(env.db.orm, ownerId, page({ limit: 3, offset: 3 }), TODAY);
    expect(p1.items).toHaveLength(3);
    expect(p2.items.length).toBeGreaterThan(0);
    expect(p1.total).toBe(p2.total);
    expect(p1.items.map((i) => i.id)).not.toEqual(p2.items.map((i) => i.id));
    expect(p1.stats).toEqual(p2.stats);
  });

  it('تعديل جزئي (PATCH) لا يمس بقية الحقول، ومسح الحقل النصي بسلسلة فارغة يجعله null', async () => {
    const before = (await ctx.c.get(`/api/lab-activities/${ids.doneA}`)).body;
    const r = await ctx.c.patch(`/api/lab-activities/${ids.doneA}`, { results: 'انكمشت الشريحة في المحلول المركّز', procedure: '' });
    expect(r.status).toBe(200);
    expect(r.body.results).toBe('انكمشت الشريحة في المحلول المركّز');
    expect(r.body.procedure).toBeNull();
    expect(r.body).toMatchObject({ title: before.title, participants: before.participants, materials: before.materials, status: 'done' });
    // إعادة «مخطَّط» لا تمحو النتائج المسجَّلة
    const back = await ctx.c.patch(`/api/lab-activities/${ids.doneA}`, { status: 'planned' });
    expect(back.body.results).toBe('انكمشت الشريحة في المحلول المركّز');
    expect(back.body.participants).toBe(20);
    await ctx.c.patch(`/api/lab-activities/${ids.doneA}`, { status: 'done' });
  });

  it('ربط نشاط عام بمقرر وفكّ ارتباطه، وإسناده لمقرر معلم آخر مرفوض', async () => {
    const g = ids.general!;
    const linked = await ctx.c.patch(`/api/lab-activities/${g}`, { assignmentId: ctx.assignmentId });
    expect(linked.body).toMatchObject({ assignmentId: ctx.assignmentId, sectionLabel: '10/3' });
    const unlinked = await ctx.c.patch(`/api/lab-activities/${g}`, { assignmentId: null });
    expect(unlinked.body).toMatchObject({ assignmentId: null, sectionLabel: null });
    // مقرر لا وجود له عند هذا المعلم (يعامل كغير موجود)
    const otherYear = (await other.post('/api/years', { name: '2026/2027', startDate: '2026-08-23', endDate: '2027-06-17' })).body;
    const otherSubject = (await other.post('/api/subjects', { name: 'الفيزياء' })).body;
    const otherSection = (await other.post('/api/sections', { yearId: otherYear.id, gradeLevel: 11, name: '1', subjectIds: [otherSubject.id] })).body;
    const foreign = otherSection.assignments[0].id as string;
    expect((await ctx.c.patch(`/api/lab-activities/${g}`, { assignmentId: foreign })).status).toBe(404);
    expect((await ctx.c.post('/api/lab-activities', { ...onion(), assignmentId: foreign })).status).toBe(404);
  });
});

describe('النسخ إلى وجهات متعددة', () => {
  it('ينسخ الخطة دون النتائج والمشاركين والملاحظات كأنشطة مخطَّطة، ويربطها بالأصل', async () => {
    const src = (await ctx.c.post('/api/lab-activities', { ...onion(), date: '2026-09-20', title: 'تجربة قابلة للنسخ', status: 'done', participants: 22, results: 'نتائج الأصل', notes: 'ملاحظات الأصل' })).body;
    const r = await ctx.c.post(`/api/lab-activities/${src.id}/copy`, {
      targets: [
        { assignmentId: ctx.assignmentId, date: '2026-10-22', period: 3 },
        { assignmentId: null, date: '2026-10-23' },
      ],
    });
    expect(r.status).toBe(201);
    expect(r.body).toHaveLength(2);
    const [c1, c2] = r.body as { id: string }[];
    const d1 = (await ctx.c.get(`/api/lab-activities/${c1!.id}`)).body;
    expect(d1).toMatchObject({
      title: 'تجربة قابلة للنسخ', kind: 'experiment', status: 'planned', date: '2026-10-22', period: 3, sourceId: src.id,
      location: 'مختبر العلوم', materials: ['مجهر ضوئي', 'شرائح زجاجية'], safety: ['ارتداء النظارات الواقية'], procedure: 'يُفصل غشاء رقيق من البصل ويوضع على الشريحة.',
      results: null, participants: null, notes: null, sectionLabel: '10/3',
    });
    expect((await ctx.c.get(`/api/lab-activities/${c2!.id}`)).body).toMatchObject({ assignmentId: null, sectionLabel: null, status: 'planned', sourceId: src.id });
    // النسخة تُبحث كأصلها (searchText منسوخ)
    expect((await ctx.c.get(`/api/lab-activities?q=${encodeURIComponent('قابلة للنسخ')}`)).body.total).toBe(3);
    // الأصل لم يتغير
    expect((await ctx.c.get(`/api/lab-activities/${src.id}`)).body).toMatchObject({ status: 'done', participants: 22, results: 'نتائج الأصل', notes: 'ملاحظات الأصل' });
  });

  it('ذرّية: وجهة غير صالحة تُفشل الطلب كله ولا تُنشئ شيئًا', async () => {
    const before = (await ctx.c.get('/api/lab-activities')).body.total as number;
    const src = (await ctx.c.get('/api/lab-activities?limit=1')).body.items[0].id as string;
    const bad = await ctx.c.post(`/api/lab-activities/${src}/copy`, {
      targets: [{ assignmentId: ctx.assignmentId, date: '2026-12-01' }, { assignmentId: '00000000-0000-4000-8000-000000000000', date: '2026-12-02' }],
    });
    expect(bad.status).toBe(404);
    expect((await ctx.c.get('/api/lab-activities')).body.total).toBe(before);
    expect((await ctx.c.post(`/api/lab-activities/${src}/copy`, { targets: [] })).status).toBe(400);
    expect((await ctx.c.post(`/api/lab-activities/${src}/copy`, { targets: [{ date: 'غلط' }] })).status).toBe(400);
  });
});

describe('العزل بين المعلمين', () => {
  it('معلم آخر لا يرى الأنشطة ولا يعدّلها ولا ينسخها ولا يحذفها (404) ولا تظهر في تقاريره', async () => {
    const mine = (await ctx.c.get('/api/lab-activities?limit=1')).body.items[0].id as string;
    const o = await other.get('/api/lab-activities');
    expect(o.body).toMatchObject({ total: 0, items: [], stats: { planned: 0, done: 0, cancelled: 0, overdue: 0, participants: 0 } });
    expect((await other.get(`/api/lab-activities/${mine}`)).status).toBe(404);
    expect((await other.patch(`/api/lab-activities/${mine}`, { title: 'اختراق' })).status).toBe(404);
    expect((await other.post(`/api/lab-activities/${mine}/copy`, { targets: [{ date: '2026-12-01' }] })).status).toBe(404);
    expect((await other.del(`/api/lab-activities/${mine}`)).status).toBe(404);
    expect((await other.get(`/api/reports/lab-log/html?labId=${mine}`)).status).toBe(404);
    const rep = await other.get('/api/reports/lab-log/html?from=2026-01-01&to=2027-12-31');
    expect(rep.body).not.toContain('فحص خلايا البصل');
    expect((await ctx.c.get(`/api/lab-activities/${mine}`)).body.title).not.toBe('اختراق');
  });
});

describe('التكامل: لوحة التحكم والتقويم والتقارير والحذف', () => {
  it('لوحة التحكم تعرض القادم من الأنشطة المخطَّطة وعدد ما فات موعده', async () => {
    const t = todayISO();
    const soon = (await ctx.c.post('/api/lab-activities', { ...onion(), title: 'قادم غدًا', date: addDays(t, 1), period: 1 })).body;
    const later = (await ctx.c.post('/api/lab-activities', { ...onion(), title: 'قادم بعد أسبوع', date: addDays(t, 7), period: null })).body;
    const past = (await ctx.c.post('/api/lab-activities', { ...onion(), title: 'فاتَ ولم يُسجَّل', date: addDays(t, -3) })).body;
    const d = (await ctx.c.get('/api/dashboard')).body;
    const upcoming = d.lab.upcoming.map((i: any) => i.title) as string[];
    expect(upcoming).toContain('قادم غدًا');
    // مرتّبة بالتاريخ تصاعديًا. (لا نشترط ظهور «قادم بعد أسبوع»: القائمة خمسة عناصر كحد أقصى، وفي القاعدة أنشطة أخرى بتواريخ مطلقة
    // قد تسبقه كلما اقترب اليوم الحقيقي منها — فكان الاختبار ينكسر في أيام دون أيام)
    const dates = d.lab.upcoming.map((i: any) => i.date) as string[];
    expect(dates).toEqual([...dates].sort());
    expect(upcoming).not.toContain('فاتَ ولم يُسجَّل');
    expect(d.lab.upcoming.length).toBeLessThanOrEqual(5);
    expect(d.lab.overdue).toBeGreaterThanOrEqual(1);
    // بعد تسجيل ما فات يخرج من العدّاد
    const before = d.lab.overdue as number;
    await ctx.c.patch(`/api/lab-activities/${past.id}`, { status: 'done', participants: 10 });
    expect((await ctx.c.get('/api/dashboard')).body.lab.overdue).toBe(before - 1);
    for (const x of [soon, later, past]) await ctx.c.del(`/api/lab-activities/${x.id}`);
  });

  it('التقويم الدراسي يعرض الأنشطة (عدا الملغاة) بنوع lab ورابط يفتح النشاط', async () => {
    const cal = (await ctx.c.get('/api/calendar?from=2026-09-01&to=2026-10-31')).body as { id: string; type: string; title: string; subtitle: string; done: boolean; href: string }[];
    const items = cal.filter((i) => i.type === 'lab');
    expect(items.some((i) => i.title === 'تجربة ملغاة')).toBe(false);
    const done = items.find((i) => i.title === 'تجربة الأسموزية')!;
    expect(done).toMatchObject({ done: true });
    expect(done.subtitle).toMatch(/تجربة عملية/);
    expect(done.subtitle).toMatch(/العلوم/);
    expect(done.href).toMatch(/^\/lab\?open=/);
    expect(items.find((i) => i.title === 'زيارة ميدانية للمتحف')!.done).toBe(false);
  });

  it('التقرير: القائمة (HTML/Excel) بمرشّحات، وورقة النشاط الواحد بتفاصيله', async () => {
    const list = await ctx.c.get('/api/reports/lab-log/html?from=2026-09-01&to=2026-10-31');
    expect(list.status).toBe(200);
    expect(list.body).toContain('سجل المختبر والأنشطة');
    expect(list.body).toContain('تجربة الأسموزية');
    expect(list.body).toContain('زيارة ميدانية للمتحف');
    expect(list.body).toContain('مشاركات الطلاب');
    const onlyDone = await ctx.c.get('/api/reports/lab-log/html?from=2026-09-01&to=2026-10-31&labStatus=done');
    expect(onlyDone.body).toContain('تجربة الأسموزية');
    expect(onlyDone.body).not.toContain('زيارة ميدانية للمتحف');
    const byKind = await ctx.c.get('/api/reports/lab-log/html?from=2026-09-01&to=2026-10-31&labKind=field_trip');
    expect(byKind.body).toContain('زيارة ميدانية للمتحف');
    expect(byKind.body).not.toContain('تجربة الأسموزية');
    expect((await ctx.c.get('/api/reports/lab-log/html?from=2026-10-31&to=2026-09-01')).status).toBe(400);
    const xl = await ctx.c.get('/api/reports/lab-log/xlsx?from=2026-09-01&to=2026-10-31');
    expect(xl.status).toBe(200);
    expect(xl.raw.subarray(0, 2).toString()).toBe('PK');

    const id = (await ctx.c.get('/api/lab-activities?q=' + encodeURIComponent('الأسموزية'))).body.items[0].id as string;
    const one = await ctx.c.get(`/api/reports/lab-log/html?labId=${id}`);
    expect(one.status).toBe(200);
    expect(one.body).toContain('تقرير تجربة عملية');
    expect(one.body).toContain('تجربة الأسموزية');
    expect(one.body).toContain('انكمشت الشريحة في المحلول المركّز');
    expect(one.body).toContain('ميزان حساس');
  });

  it('«كل الفترات» صريحة: تشمل ما قبل الفصل الحالي، وغيابها مع غياب التاريخين يعني الفصل الحالي', async () => {
    const old = (await ctx.c.post('/api/lab-activities', { date: '2019-03-01', title: 'نشاط قديم جدًا', status: 'done', participants: 5 })).body;
    const all = await ctx.c.get('/api/reports/lab-log/html?labAll=true');
    expect(all.status).toBe(200);
    expect(all.body).toContain('نشاط قديم جدًا');
    expect(all.body).toContain('كل الفترات');
    expect((await ctx.c.get('/api/reports/lab-log/html')).body).not.toContain('نشاط قديم جدًا');
    expect((await ctx.c.get('/api/reports/lab-log/html?from=2019-01-01&to=2019-12-31')).body).toContain('نشاط قديم جدًا');
    expect((await ctx.c.get('/api/reports/lab-log/xlsx?labAll=true')).raw.subarray(0, 2).toString()).toBe('PK');
    await ctx.c.del(`/api/lab-activities/${old.id}`);
  });

  it('التقرير لا يقتطع بصمت: فوق 500 نشاط يعرض أحدثها مع تنبيه بالعدد الكلي', async () => {
    env.db.orm.transaction((tx) => {
      for (let i = 0; i < 505; i++) lab.createLab(tx as never, ownerId, { date: `2031-01-${String((i % 28) + 1).padStart(2, '0')}`, title: `نشاط كثير ${i}` }, TODAY);
    });
    const rep = await ctx.c.get('/api/reports/lab-log/html?from=2031-01-01&to=2031-12-31');
    expect(rep.status).toBe(200);
    expect(rep.body).toContain('عُرض أحدث 500 نشاطًا من 505');
    expect((await ctx.c.get('/api/lab-activities?from=2031-01-01&to=2031-12-31&limit=1')).body.total).toBe(505);
    env.db.sqlite.prepare("delete from lab_activities where owner_id = ? and title like 'نشاط كثير %'").run(ownerId);
  });

  it('حذف المقرر يُبقي النشاط (يصير عامًا)، وحذف النشاط نهائي', async () => {
    const subj2 = (await ctx.c.post('/api/subjects', { name: 'الأحياء' })).body;
    const section2 = (await ctx.c.post('/api/sections', { yearId: ctx.year.id, gradeLevel: 10, name: '9', subjectIds: [subj2.id] })).body;
    const asg2 = section2.assignments[0].id as string;
    const made = (await ctx.c.post('/api/lab-activities', { ...onion(), assignmentId: asg2, title: 'نشاط مقرر سيُحذف' })).body;
    expect((await ctx.c.del(`/api/assignments/${asg2}?force=true`)).status).toBe(200);
    const kept = (await ctx.c.get(`/api/lab-activities/${made.id}`)).body;
    expect(kept).toMatchObject({ assignmentId: null, sectionLabel: null, subjectName: null, title: 'نشاط مقرر سيُحذف' });
    expect((await ctx.c.del(`/api/lab-activities/${made.id}`)).status).toBe(200);
    expect((await ctx.c.get(`/api/lab-activities/${made.id}`)).status).toBe(404);
  });

  it('حذف حساب المعلم يمحو أنشطته (حق المحو)', async () => {
    const admin = new TestClient(env.app);
    await admin.login('admin@school.om', 'Str0ng-Pass!');
    const victim = await newTeacher(admin, 'erase@school.om');
    await victim.post('/api/lab-activities', { date: '2026-10-01', title: 'سيُمحى' });
    const uid = (await victim.get('/api/auth/me')).body.user.id as string;
    expect((env.db.sqlite.prepare('select count(*) c from lab_activities where owner_id = ?').get(uid) as { c: number }).c).toBe(1);
    expect((await admin.patch(`/api/users/${uid}`, { status: 'disabled' })).status).toBe(200);
    expect((await admin.del(`/api/users/${uid}?confirm=erase@school.om`)).status).toBe(200);
    expect((env.db.sqlite.prepare('select count(*) c from lab_activities where owner_id = ?').get(uid) as { c: number }).c).toBe(0);
  });
});
