// بيانات تجريبية لتوضيح طريقة الاستخدام — منفصلة تمامًا عن الحسابات الحقيقية:
//  • تُنشأ فقط بأمر صريح (npm run cli -- seed-demo) في حساب موسوم is_demo يظهر بشريط تنبيه في الواجهة.
//  • الأسماء مولَّدة عشوائيًا من قوائم أسماء شائعة، وليست لأشخاص حقيقيين.
//  • يمكن حذفها بالكامل بأمر purge-demo دون أن تمسّ أي بيانات حقيقية.
import { eq } from 'drizzle-orm';
import type { ScryptParams } from '../config';
import { schema, type Db } from '../db/client';
import { addDays, nowInZone, weekdayOf } from '../../shared/dates';
import { pickCurrentTerm } from '../../shared/academic';
import type { ActivityPhase } from '../../shared/constants';
import { createUser } from '../modules/users/service';
import { createSection, createSubject, createYear } from '../modules/academic/service';
import { addStudentsToSection } from '../modules/students/service';
import { createAssessment, createSkill, saveResults } from '../modules/assessments/service';
import { copyLab, createLab, updateLab } from '../modules/lab/service';
import { createLesson } from '../modules/lessons/service';
import { addNote as addSupportNote, createPlan, suggestions } from '../modules/support/service';
import { setSlot } from '../modules/timetable/service';
import { createTask } from '../modules/tasks/service';
import { createNote } from '../modules/students/service';
import { updateSettings } from '../modules/settings/service';

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MALE = ['أحمد', 'محمد', 'خالد', 'سالم', 'سعيد', 'ناصر', 'حمد', 'عبدالله', 'يوسف', 'إبراهيم', 'مازن', 'ماجد', 'راشد', 'سلطان', 'هلال', 'طلال', 'بدر', 'حمود', 'علي', 'عمر', 'زياد', 'فيصل', 'منذر', 'عيسى', 'مبارك', 'عادل'];
const FEMALE = ['فاطمة', 'مريم', 'عائشة', 'أسماء', 'نورة', 'هدى', 'ريم', 'سلمى', 'شيماء', 'لجين', 'آمنة', 'خولة', 'زينب', 'رقية', 'بشرى', 'جوخة', 'حليمة', 'سارة', 'لمياء', 'نجلاء', 'وفاء', 'أمل'];
const FAMILY = ['الحارثي', 'البلوشي', 'الهنائي', 'العبري', 'الكلباني', 'الراشدي', 'المعمري', 'الشكيلي', 'البوسعيدي', 'الرواحي', 'الغافري', 'السيابي', 'الفارسي', 'الريامي', 'المحروقي', 'الحجري', 'الصقري', 'الشبلي', 'الكندي', 'الوهيبي'];

const SCIENCE_LESSONS = [
  ['الوحدة الأولى: الخلية', 'تركيب الخلية ووظائف عضياتها', ['أن يسمّي الطالب أجزاء الخلية', 'أن يربط كل عضية بوظيفتها']],
  ['الوحدة الأولى: الخلية', 'الفرق بين الخلية النباتية والحيوانية', ['أن يقارن الطالب بين الخليتين', 'أن يرسم مخططًا لكل منهما']],
  ['الوحدة الأولى: الخلية', 'الانتشار والخاصية الأسموزية', ['أن يفسّر الطالب حركة الجزيئات عبر الغشاء', 'أن يميّز بين الانتشار والأسموزية']],
  ['الوحدة الثانية: الأنسجة', 'الأنسجة النباتية', ['أن يصنّف الطالب الأنسجة النباتية', 'أن يربط النسيج بوظيفته']],
  ['الوحدة الثانية: الأنسجة', 'الأنسجة الحيوانية', ['أن يعدّد الطالب أنواع الأنسجة الحيوانية', 'أن يعطي مثالًا لكل نوع']],
  ['الوحدة الثالثة: الطاقة', 'التنفس الخلوي', ['أن يكتب الطالب معادلة التنفس الخلوي', 'أن يحدّد مواقع حدوثه']],
  ['الوحدة الثالثة: الطاقة', 'البناء الضوئي', ['أن يفسّر الطالب كيف تصنع النباتات غذاءها', 'أن يحدّد عوامل تؤثر في البناء الضوئي']],
  ['الوحدة الثالثة: الطاقة', 'الإنزيمات وعمل الحفّازات', ['أن يعرّف الطالب الإنزيم', 'أن يستنتج أثر درجة الحرارة في نشاطه']],
] as const;

const MATH_LESSONS = [
  ['الوحدة الأولى: الأعداد النسبية', 'مقارنة الأعداد النسبية وترتيبها', ['أن يقارن الطالب بين عددين نسبيين', 'أن يرتّب مجموعة من الأعداد']],
  ['الوحدة الأولى: الأعداد النسبية', 'جمع الأعداد النسبية وطرحها', ['أن يجري الطالب عمليات الجمع والطرح', 'أن يحلّ مسائل لفظية']],
  ['الوحدة الثانية: المعادلات', 'حل المعادلات الخطية بمتغير واحد', ['أن يحلّ الطالب معادلة خطية', 'أن يتحقق من صحة الحل']],
  ['الوحدة الثانية: المعادلات', 'النسبة والتناسب', ['أن يوجد الطالب النسبة بين كميتين', 'أن يحلّ مسائل التناسب']],
  ['الوحدة الثالثة: الهندسة', 'الزوايا المتجاورة والمتقابلة بالرأس', ['أن يميّز الطالب أنواع الزوايا', 'أن يحسب قياس زاوية مجهولة']],
  ['الوحدة الثالثة: الهندسة', 'مساحة المثلث والمتوازي', ['أن يحسب الطالب مساحة مثلث', 'أن يحلّ مسائل تطبيقية']],
] as const;

const PHASES: ActivityPhase[] = ['intro', 'main', 'practice', 'closure'];

export type DemoOptions = { email: string; password: string; scrypt: ScryptParams; timezone: string };

export async function seedDemo(db: Db, opts: DemoOptions): Promise<{ userId: string; email: string }> {
  const rand = rng(20260915);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;
  const normal = () => (rand() + rand() + rand() + rand() - 2) / 0.58; // ≈ N(0,1)
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  const user = await createUser(db, opts.scrypt, {
    email: opts.email,
    password: opts.password,
    fullName: 'معلم تجريبي',
    role: 'teacher',
    isDemo: true,
  });
  const owner = user.id;
  updateSettings(db, owner, {
    profile: { schoolName: 'مدرسة تجريبية للتعليم الأساسي (بيانات وهمية)', directorate: 'المديرية العامة للتربية والتعليم — تجريبي', jobTitle: 'معلم', specialization: 'علوم' },
  });

  const now = nowInZone(opts.timezone);
  const today = now.date;
  const startYear = Number(today.slice(5, 7)) >= 8 ? Number(today.slice(0, 4)) : Number(today.slice(0, 4)) - 1;
  const year = createYear(db, owner, {
    name: `${startYear}/${startYear + 1}`,
    startDate: `${startYear}-08-23`,
    endDate: `${startYear + 1}-06-18`,
    makeCurrent: true,
  });
  const term = pickCurrentTerm(year.terms, today)!;

  const science = createSubject(db, owner, { name: 'العلوم', color: 'teal' });
  const math = createSubject(db, owner, { name: 'الرياضيات', color: 'violet' });

  const groups = [
    { grade: 10, name: '1', subject: science, gender: 'male' as const, size: 24, lessons: SCIENCE_LESSONS },
    { grade: 10, name: '2', subject: science, gender: 'female' as const, size: 26, lessons: SCIENCE_LESSONS },
    { grade: 8, name: '3', subject: math, gender: 'female' as const, size: 22, lessons: MATH_LESSONS },
  ];

  const skills = [
    'استخدام المجهر الضوئي',
    'تصميم تجربة علمية',
    'تسجيل الملاحظات والبيانات',
    'تفسير الرسوم البيانية',
    'تطبيق إجراءات السلامة في المختبر',
  ].map((title, i) => createSkill(db, owner, { subjectId: science.id, title, code: `ع-${i + 1}`, gradeLevel: 10 }));

  let serial = 90_000_000;
  const slots: { assignmentId: string; weekday: number; period: number; lessons: readonly (readonly [string, string, readonly string[]])[] }[] = [];
  const timetablePlan: Record<string, [number, number][]> = {
    '10/1': [[0, 2], [2, 1], [4, 3]],
    '10/2': [[0, 4], [1, 2], [3, 5]],
    '8/3': [[1, 1], [2, 4], [3, 2]],
  };

  const created: { assignmentId: string; ability: Map<string, number>; students: string[]; isScience: boolean }[] = [];

  for (const g of groups) {
    const section = createSection(db, owner, { yearId: year.id, gradeLevel: g.grade, name: g.name, subjectIds: [g.subject.id] });
    const used = new Set<string>();
    const students = Array.from({ length: g.size }, () => {
      let name: string;
      do {
        const first = pick(g.gender === 'male' ? MALE : FEMALE);
        const father = pick(MALE);
        const fam = pick(FAMILY);
        const nisba = g.gender === 'male' ? fam : fam.replace(/ي$/, 'ية');
        name = `${first} ${g.gender === 'male' ? 'بن' : 'بنت'} ${father} ${nisba}`;
      } while (used.has(name));
      used.add(name);
      return { fullName: name, studentNumber: String(serial++), gender: g.gender };
    });
    const roster = addStudentsToSection(db, owner, section.id, students);
    const asg = section.assignments[0]!;
    const ability = new Map(roster.map((r) => [r.student.id, clamp(0.72 + normal() * 0.14, 0.25, 0.98)]));
    created.push({ assignmentId: asg.id, ability, students: roster.map((r) => r.student.id), isScience: g.subject.id === science.id });

    for (const [weekday, period] of timetablePlan[section.label] ?? []) {
      setSlot(db, owner, { yearId: year.id, weekday, period, assignmentId: asg.id });
      slots.push({ assignmentId: asg.id, weekday, period, lessons: g.lessons });
    }
  }

  // ───────── تحضير: من أسبوعين مضيا إلى أسبوع قادم ─────────
  const lessonCursor = new Map<string, number>();
  for (let offset = -14; offset <= 7; offset++) {
    const date = addDays(today, offset);
    for (const slot of slots.filter((s) => s.weekday === weekdayOf(date))) {
      const idx = lessonCursor.get(slot.assignmentId) ?? 0;
      lessonCursor.set(slot.assignmentId, idx + 1);
      const [unit, title, objectives] = slot.lessons[idx % slot.lessons.length]!;
      // نترك حصة اليوم الأخيرة بلا تحضير ليظهر اقتراح «النسخ» في لوحة التحكم
      if (date === today && slot.period >= 4) continue;
      const past = date < today;
      createLesson(db, owner, {
        assignmentId: slot.assignmentId,
        date,
        period: slot.period,
        title,
        unitName: unit,
        durationMinutes: 45,
        outcomes: [`يوظّف الطالب مفاهيم «${title}» في مواقف جديدة`],
        objectives: [...objectives],
        concepts: [],
        strategies: [pick(['التعلم التعاوني', 'العصف الذهني', 'حل المشكلات', 'المناقشة والحوار'])],
        resources: ['الكتاب المدرسي', 'السبورة', 'أوراق عمل'],
        activities: PHASES.map((phase, i) => ({
          phase,
          description: ['سؤال تمهيدي يستثير تفكير الطلاب', 'عرض المفهوم وشرحه بالأمثلة', 'تدريب جماعي على أوراق العمل', 'تلخيص الدرس وتقويم ختامي سريع'][i]!,
          minutes: [5, 15, 15, 10][i]!,
        })),
        assessmentMethods: ['أسئلة شفهية', 'ورقة عمل'],
        homework: 'حل تمارين الكتاب الصفحة المحددة',
        status: past ? (rand() < 0.85 ? 'delivered' : 'ready') : date === today ? 'ready' : rand() < 0.5 ? 'ready' : 'draft',
        isTemplate: false,
        reflection: past && rand() < 0.4 ? 'تفاعل الطلاب جيدًا؛ يحتاج بعضهم إلى تعزيز إضافي.' : null,
      });
    }
  }

  // ───────── تقويمات ونتائج في الفصل الحالي ─────────
  const defs = [
    { title: 'اختبار قصير 1', type: 'written', max: 10, weight: 10, ago: 35 },
    { title: 'واجب منزلي 1', type: 'homework', max: 5, weight: 5, ago: 28 },
    { title: 'مشاركة صفية', type: 'participation', max: 5, weight: 5, ago: 21 },
    { title: 'اختبار قصير 2', type: 'written', max: 10, weight: 10, ago: 14 },
    { title: 'مشروع الوحدة الأولى', type: 'project', max: 20, weight: 10, ago: 7 },
    { title: 'اختبار قصير 3', type: 'written', max: 10, weight: 10, ago: 2, partial: true },
  ] as const;

  for (const c of created) {
    for (const def of defs) {
      const date = addDays(today, -def.ago);
      const clampedDate = date < term.startDate ? term.startDate : date;
      const a = createAssessment(db, owner, {
        assignmentId: c.assignmentId,
        termId: term.id,
        title: def.title,
        type: def.type,
        mode: 'score',
        maxScore: def.max,
        weight: def.weight,
        date: clampedDate,
        countsTowardTotal: true,
        skillIds: [],
      });
      const entries = c.students
        .filter((_, i) => !('partial' in def) || i % 5 !== 0 ? true : false) // الأخير مرصود جزئيًا (يبقى كل خامس طالب بلا رصد)
        .map((studentId) => {
          const roll = rand();
          if (roll < 0.03) return { studentId, status: 'absent' as const, score: null };
          if (roll < 0.04) return { studentId, status: 'excused' as const, score: null };
          const p = clamp(c.ability.get(studentId)! + normal() * 0.08, 0.1, 1);
          return { studentId, status: 'graded' as const, score: Math.round(p * def.max * 2) / 2 };
        });
      saveResults(db, owner, a.id, { results: entries });
    }
    if (c.isScience) {
      for (const [i, title] of ['مهارة استخدام المجهر', 'مهارة تصميم التجارب'].entries()) {
        const m = createAssessment(db, owner, {
          assignmentId: c.assignmentId,
          termId: term.id,
          title,
          type: 'practical',
          mode: 'mastery',
          date: addDays(today, -(12 - i * 4)),
          countsTowardTotal: false,
          skillIds: [skills[i]!.id],
        });
        saveResults(db, owner, m.id, {
          results: c.students.map((studentId) => {
            const p = clamp(c.ability.get(studentId)! + normal() * 0.1, 0.1, 1);
            return { studentId, status: 'graded' as const, level: p >= 0.85 ? 4 : p >= 0.68 ? 3 : p >= 0.5 ? 2 : 1 };
          }),
        });
      }
    }
  }

  // ───────── مهام وملاحظات ─────────
  const t = (title: string, offset: number, kind: 'task' | 'exam' | 'meeting' | 'reminder', priority: 'low' | 'normal' | 'high', time?: string) =>
    createTask(db, owner, { title, kind, dueDate: addDays(today, offset), dueTime: time ?? null, priority, status: 'open', description: null, assignmentId: null });
  t('تصحيح أوراق الاختبار القصير 3', 0, 'task', 'high');
  t('تجهيز مواد تجربة المختبر', 1, 'task', 'normal');
  t('اجتماع المعلمين الأوائل', 2, 'meeting', 'normal', '12:30');
  t('اختبار الوحدة الأولى', 6, 'exam', 'high');
  t('تسليم تقرير متابعة الطلاب', -2, 'task', 'normal');

  const first = created[0]!;
  const sid = first.students[0]!;
  createNote(db, owner, sid, { assignmentId: first.assignmentId, date: addDays(today, -5), category: 'positive', text: 'قدّم عرضًا متميزًا في الحصة وساعد زملاءه في التجربة العملية.' });
  createNote(db, owner, first.students[1]!, { assignmentId: first.assignmentId, date: addDays(today, -3), category: 'academic', text: 'يحتاج إلى متابعة في مهارة تفسير الرسوم البيانية.' });

  // ───────── خطط علاجية وإثرائية (من الاقتراحات التلقائية لكل شعب العام الحالي) ─────────
  const sug = suggestions(db, owner, {}, today);
  const remedial = sug.filter((s) => s.kind === 'remedial').slice(0, 3);
  const enrich = sug.filter((s) => s.kind === 'enrichment').slice(0, 2);
  const remedialSpecs = [
    (sub: string) => ({ title: `علاج الأخطاء المتكررة في ${sub}`, reason: 'تدنٍّ في الاختبارات القصيرة وأخطاء متكررة في الأسئلة التطبيقية.', goal: `رفع نسبته في ${sub} إلى 60% فأكثر بنهاية الفصل`, strategies: ['تبسيط المفهوم بأمثلة محسوسة', 'التعلّم بالأقران', 'تدريبات إضافية متدرجة'] }),
    (sub: string) => ({ title: `تقوية أساسيات ${sub}`, reason: 'ضعف في المفاهيم الأساسية للوحدة الأولى.', goal: 'إتقان المفاهيم الأساسية وحل 4 من 5 أسئلة تطبيقية بصورة صحيحة', strategies: ['استخدام وسائل بصرية', 'جلسة علاجية مصغّرة بعد الحصة'] }),
    (sub: string) => ({ title: `خطة دعم عامة في ${sub}`, reason: 'نسبة منخفضة في معظم التقويمات هذا الفصل.', goal: 'رفع المستوى إلى «مقبول» فأعلى', strategies: ['متابعة أسبوعية مع ولي الأمر', 'تدريبات إضافية متدرجة'] }),
  ];
  remedial.forEach((s, i) => {
    const plan = createPlan(db, owner, { studentId: s.studentId, assignmentId: s.assignmentId, kind: 'remedial', ...remedialSpecs[i]!(s.subjectName), startDate: addDays(today, -14 + i * 3), reviewDate: addDays(today, i === 0 ? -1 : 9 + i * 4) }, today);
    addSupportNote(db, owner, plan.id, { date: addDays(today, -10 + i), text: 'جلسة علاجية أولى: عُرضت عليه أمثلة محلولة وتدرّب على مسائل مشابهة.' });
    if (i === 0) {
      addSupportNote(db, owner, plan.id, { date: addDays(today, -4), text: 'تحسّن ملحوظ في التمارين الصفية؛ يلزم تثبيت المهارة بتمارين منزلية.' });
      // قصة تحسّن توضيحية في البيانات الوهمية: خط الأساس أدنى من نسبته الحالية
      if (plan.currentPercent !== null) db.update(schema.supportPlans).set({ baselinePercent: Math.max(0, Math.round((plan.currentPercent - 7.5) * 10) / 10) }).where(eq(schema.supportPlans.id, plan.id)).run();
    }
  });
  enrich.forEach((s, i) => {
    const plan = createPlan(db, owner, {
      studentId: s.studentId, assignmentId: s.assignmentId, kind: 'enrichment',
      title: i === 0 ? `مشروع بحثي إثرائي في ${s.subjectName}` : `مسائل تحدٍّ في ${s.subjectName}`,
      reason: 'أداء مرتفع باستمرار ويحتاج إلى ما يتجاوز المنهج الأساسي.',
      goal: i === 0 ? 'إنجاز مشروع بحثي مصغّر وعرضه على الشعبة' : 'حل 5 مسائل تحدٍّ وتفسير الحلول لزملائه',
      strategies: ['مشروع بحثي مصغّر', 'مسائل تحدٍّ متقدمة'], startDate: addDays(today, -7), reviewDate: addDays(today, 14),
    }, today);
    addSupportNote(db, owner, plan.id, { date: addDays(today, -3), text: 'اختار موضوع المشروع وجمع المراجع الأولية.' });
  });

  // ───────── سجل المختبر والأنشطة ─────────
  const sci1 = created[0]!.assignmentId;
  const sci2 = created[1]!.assignmentId;
  const onion = createLab(db, owner, {
    assignmentId: sci1, date: addDays(today, -18), period: 2, kind: 'experiment', title: 'فحص خلايا قشرة البصل بالمجهر الضوئي', location: 'مختبر العلوم',
    objectives: ['أن يحضّر الطالب شريحة مجهرية مبلّلة', 'أن يحدّد الجدار الخلوي والنواة تحت المجهر'],
    materials: ['مجهر ضوئي', 'شرائح وأغطية زجاجية', 'بصلة', 'محلول اليود', 'ملقط'],
    safety: ['ارتداء المعطف والنظارات الواقية', 'الحذر عند حمل الشرائح الزجاجية', 'غسل اليدين بعد التجربة'],
    procedure: '١) فصل طبقة رقيقة من قشرة البصل.\n٢) وضعها على الشريحة وإضافة قطرة من اليود.\n٣) تغطيتها بالغطاء بحذر لتجنّب فقاعات الهواء.\n٤) الفحص بقوة التكبير الصغرى ثم الكبرى ورسم ما يُلاحَظ.',
    results: 'ظهرت الخلايا مستطيلة متراصّة بجدران واضحة ونوى مصبوغة. نجح معظم الطلاب في تحضير الشريحة، وأخطأ عدد قليل بتكوّن فقاعات هواء.',
    participants: 24, notes: 'يلزم توفير مجهرين إضافيين لتقليل الازدحام.', status: 'done',
  }, today);
  // نسخ الخطة إلى الشعبة الثانية ثم تسجيل تنفيذها (يوضّح دورة: نسخ ← تنفيذ ← تسجيل النتائج)
  const [onion2] = copyLab(db, owner, onion.id, { targets: [{ assignmentId: sci2, date: addDays(today, -16), period: 4 }] }, today);
  updateLab(db, owner, onion2!.id, { status: 'done', participants: 25, results: 'تكررت الملاحظات نفسها؛ كان أداء المجموعة أسرع بفضل تجربة الشعبة الأولى.' }, today);
  createLab(db, owner, {
    assignmentId: sci1, date: addDays(today, -9), period: 3, kind: 'demo', title: 'عرض عملي: الانتشار بقطرة حبر في الماء', location: 'مختبر العلوم',
    objectives: ['أن يلاحظ الطالب انتشار الجزيئات من التركيز الأعلى إلى الأقل'],
    materials: ['كؤوس مدرّجة', 'ماء بدرجات حرارة مختلفة', 'حبر ملوّن'],
    safety: ['الحذر من الماء الساخن'],
    results: 'انتشر الحبر أسرع في الماء الدافئ. استخدم الطلاب النتيجة لتفسير أثر الحرارة في سرعة الانتشار.',
    participants: 24, status: 'done',
  }, today);
  // نشاط مخطَّط فات موعده دون تسجيل — يظهر في «بحاجة إلى إجراء» بلوحة التحكم
  createLab(db, owner, {
    assignmentId: sci2, date: addDays(today, -2), period: 5, kind: 'activity', title: 'نشاط: مقارنة الخلية النباتية والحيوانية بالنماذج',
    objectives: ['أن يقارن الطالب بين الخليتين من خلال نماذج مجسّمة'], materials: ['نماذج ومجسمات', 'أوراق عمل'],
  }, today);
  const osmosis = createLab(db, owner, {
    assignmentId: sci1, date: addDays(today, 3), period: 2, kind: 'experiment', title: 'تجربة الأسموزية بشرائح البطاطس', location: 'مختبر العلوم',
    objectives: ['أن يستنتج الطالب أثر تركيز المحلول في كتلة شريحة البطاطس', 'أن يسجّل القياسات في جدول ويمثّلها بيانيًا'],
    materials: ['كؤوس مدرّجة', 'ميزان حساس', 'محاليل ملحية بتراكيز مختلفة', 'شرائح بطاطس متساوية'],
    safety: ['ارتداء المعطف والنظارات الواقية', 'التخلص الآمن من المخلفات'],
    procedure: 'تُوزن الشرائح قبل التجربة وتُغمر في المحاليل 30 دقيقة ثم تُجفَّف وتُوزن مرة أخرى، وتُحسب نسبة التغيّر في الكتلة.',
  }, today);
  copyLab(db, owner, osmosis.id, { targets: [{ assignmentId: sci2, date: addDays(today, 4), period: 4 }] }, today);
  createLab(db, owner, { assignmentId: null, date: addDays(today, 12), kind: 'competition', title: 'معرض العلوم المدرسي', location: 'الساحة المدرسية', objectives: ['عرض مشاريع الطلاب العلمية أمام المجتمع المدرسي'] }, today);

  return { userId: owner, email: opts.email };
}
