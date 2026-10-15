import { describe, expect, it } from 'vitest';
import type { AiAssessmentIdea, AiLessonDraft, AiSupportIdeas } from '../../src/shared/dto';
import {
  appendText,
  appendUnique,
  applyAssessmentIdeas,
  applyLessonDraft,
  applySupportIdeas,
  defaultPicks,
  defaultSupportPicks,
  ideaText,
  sectionHasContent,
  type LessonLike,
} from '../../src/web/features/ai/merge';

const empty = (): LessonLike => ({
  title: '',
  outcomes: [], objectives: [], concepts: [], strategies: [], resources: [],
  activities: [], assessmentMethods: [], assessmentNotes: '', homework: '', supportPlan: '', enrichmentPlan: '',
});

const ai = (over: Partial<AiLessonDraft> = {}): AiLessonDraft => ({
  outcomes: ['يفسّر ظاهرة الانتشار'],
  objectives: ['أن يعرّف الطالب الانتشار', 'أن يقارن بين الانتشار والأسموزية'],
  concepts: ['الانتشار', 'الأسموزية'],
  strategies: ['التعلم التعاوني'],
  resources: ['شفافيات'],
  activities: [
    { phase: 'intro', description: 'سؤال تمهيدي', minutes: 5 },
    { phase: 'main', description: 'شرح مع تجربة', minutes: 20 },
  ],
  assessmentMethods: ['ملاحظة'],
  homework: 'حل تمارين الصفحة 40',
  supportIdea: 'مخطط توضيحي مبسّط',
  enrichmentIdea: 'بحث قصير',
  ...over,
});

describe('appendUnique', () => {
  it('يُبقي عناصر المعلم كما هي ويضيف الجديد فقط', () => {
    expect(appendUnique(['أ', 'ب'], ['ب', 'ج'])).toEqual(['أ', 'ب', 'ج']);
  });

  it('المقارنة مطبَّعة عربيًا: الهمزة والتاء المربوطة والتشكيل لا تصنع تكرارًا', () => {
    expect(appendUnique(['أهداف الدرس'], ['اهداف الدرس', 'الْمُدرِّسة'])).toEqual(['أهداف الدرس', 'الْمُدرِّسة']);
    expect(appendUnique(['المدرسة'], ['المدرسه'])).toEqual(['المدرسة']);
  });

  it('يُسقط الأسطر الفارغة النائبة من القائمة الحالية ولا يضيف فارغًا ولا مكررًا داخل المقترح', () => {
    expect(appendUnique(['', '  '], ['س', ' س ', '', 'ص'])).toEqual(['س', 'ص']);
  });

  it('لا يعدّل المصفوفة الأصلية', () => {
    const cur = ['أ'];
    appendUnique(cur, ['ب']);
    expect(cur).toEqual(['أ']);
  });
});

describe('appendText', () => {
  it('الحقل الفارغ يُملأ، والممتلئ يُلحَق به في سطر جديد دون تغيير نصه', () => {
    expect(appendText('', 'مقترح')).toBe('مقترح');
    expect(appendText('   ', 'مقترح')).toBe('مقترح');
    expect(appendText('نصي  ', 'مقترح')).toBe('نصي\nمقترح');
    expect(appendText('نصي', 'مقترح', '\n\n')).toBe('نصي\n\nمقترح');
  });

  it('لا يكرّر مقترحًا موجودًا في النص، ولا يفعل شيئًا بمقترح فارغ', () => {
    expect(appendText('حل تمارين الصفحة 40 غدًا', 'حل تمارين الصفحة 40')).toBe('حل تمارين الصفحة 40 غدًا');
    expect(appendText('نصي', null)).toBe('نصي');
    expect(appendText('نصي', '   ')).toBe('نصي');
  });
});

describe('defaultPicks', () => {
  it('تحديد كل قسم له محتوى، وترك النصوص التي فيها كتابة للمعلم دون تحديد', () => {
    const cur = { ...empty(), homework: 'واجبي', supportPlan: '' };
    const p = defaultPicks(cur, ai());
    expect(p).toMatchObject({ outcomes: true, objectives: true, activities: true, assessmentMethods: true, homework: false, supportIdea: true, enrichmentIdea: true });
  });

  it('الأقسام الفارغة في رد المساعد غير محدَّدة', () => {
    const p = defaultPicks(empty(), ai({ concepts: [], homework: null, enrichmentIdea: '  ', activities: [] }));
    expect(p).toMatchObject({ concepts: false, homework: false, enrichmentIdea: false, activities: false, outcomes: true });
    expect(sectionHasContent(ai({ concepts: [] }), 'concepts')).toBe(false);
  });
});

describe('applyLessonDraft', () => {
  it('تحضير فارغ: يُملأ بالمحدد فقط', () => {
    const picks = { ...defaultPicks(empty(), ai()), concepts: false, resources: false };
    const out = applyLessonDraft(empty(), ai(), picks);
    expect(out.objectives).toEqual(ai().objectives);
    expect(out.concepts).toEqual([]);
    expect(out.resources).toEqual([]);
    expect(out.homework).toBe('حل تمارين الصفحة 40');
    expect(out.supportPlan).toBe('مخطط توضيحي مبسّط');
    expect(out.enrichmentPlan).toBe('بحث قصير');
    expect(out.activities.map((a) => [a.id, a.phase, a.minutes])).toEqual([['ai1', 'intro', 5], ['ai2', 'main', 20]]);
  });

  it('لا يستبدل ما كتبه المعلم: يضيف بعده، والنص المفرد يُلحَق عند التحديد الصريح فقط', () => {
    const cur: LessonLike = {
      ...empty(),
      title: 'درسي',
      objectives: ['هدفي'],
      homework: 'واجبي',
      activities: [{ id: 'a1', phase: 'main', description: 'نشاطي', minutes: 30 }],
    };
    const picks = defaultPicks(cur, ai()); // homework غير محدد
    const out = applyLessonDraft(cur, ai(), picks);
    expect(out.title).toBe('درسي');
    expect(out.objectives).toEqual(['هدفي', ...ai().objectives]);
    expect(out.homework).toBe('واجبي'); // لم يُحدَّد
    expect(out.activities.map((a) => a.id)).toEqual(['a1', 'ai1', 'ai2']);
    expect(out.activities[0]).toEqual(cur.activities[0]);

    const forced = applyLessonDraft(cur, ai(), { ...picks, homework: true });
    expect(forced.homework).toBe('واجبي\nحل تمارين الصفحة 40');
  });

  it('الأنشطة الفارغة (هيكل لم يُكتب) تُستبدل، ومعرّفات المقترح لا تصطدم بمعرّفات موجودة', () => {
    const cur: LessonLike = {
      ...empty(),
      activities: [
        { id: 'a1', phase: 'intro', description: '', minutes: 5 },
        { id: 'ai1', phase: 'main', description: 'نشاط كتبه المعلم', minutes: 10 },
      ],
    };
    const out = applyLessonDraft(cur, ai(), defaultPicks(cur, ai()));
    expect(out.activities.map((a) => a.id)).toEqual(['ai1', 'ai2', 'ai3']);
    expect(out.activities[0]!.description).toBe('نشاط كتبه المعلم');
    expect(new Set(out.activities.map((a) => a.id)).size).toBe(3);
  });

  it('لا يغيّر الكائن الأصلي ولا يلمس قسمًا لم يُحدَّد', () => {
    const cur = { ...empty(), objectives: ['هدفي'] };
    const snapshot = JSON.stringify(cur);
    const none = Object.fromEntries(Object.keys(defaultPicks(cur, ai())).map((k) => [k, false])) as ReturnType<typeof defaultPicks>;
    const out = applyLessonDraft(cur, ai(), none);
    expect(JSON.stringify(cur)).toBe(snapshot);
    expect(out).toEqual(cur);
  });

  it('يحافظ على حقول إضافية في كائن المعلم (التاريخ، الحالة…)', () => {
    const cur = { ...empty(), date: '2026-10-15', status: 'draft' as const };
    const out = applyLessonDraft(cur, ai(), defaultPicks(cur, ai()));
    expect(out.date).toBe('2026-10-15');
    expect(out.status).toBe('draft');
  });
});

describe('applyAssessmentIdeas', () => {
  const ideas: AiAssessmentIdea[] = [
    { title: 'اختبار قصير', type: 'written', description: 'خمسة أسئلة موضوعية', criteria: ['صحة الإجابة', 'وضوح الخط'] },
    { title: 'عرض شفهي', type: 'oral', description: 'يشرح الطالب المفهوم', criteria: [] },
  ];

  it('العناوين إلى الأساليب والوصف والمعايير إلى الملاحظات', () => {
    const out = applyAssessmentIdeas(empty(), ideas);
    expect(out.assessmentMethods).toEqual(['اختبار قصير', 'عرض شفهي']);
    expect(out.assessmentNotes).toBe(
      '«اختبار قصير» (تحريري): خمسة أسئلة موضوعية\nمعايير النجاح: صحة الإجابة، وضوح الخط\n\n«عرض شفهي» (شفهي): يشرح الطالب المفهوم',
    );
  });

  it('يُلحَق بملاحظات المعلم بسطر فارغ ولا يكرر أسلوبًا موجودًا', () => {
    const cur = { ...empty(), assessmentMethods: ['اختبار قصير'], assessmentNotes: 'ملاحظتي' };
    const out = applyAssessmentIdeas(cur, ideas);
    expect(out.assessmentMethods).toEqual(['اختبار قصير', 'عرض شفهي']);
    expect(out.assessmentNotes.startsWith('ملاحظتي\n\n«اختبار قصير»')).toBe(true);
  });

  it('بلا أفكار لا تغيير', () => {
    const cur = empty();
    expect(applyAssessmentIdeas(cur, [])).toBe(cur);
  });

  it('ideaText يتعامل مع نوع غير معروف دون كسر', () => {
    expect(ideaText({ title: 'ت', type: 'other', description: 'و', criteria: [] })).toBe('«ت» (أخرى): و');
    expect(ideaText({ title: 'ت', type: 'zzz' as never, description: 'و', criteria: [] })).toBe('«ت»: و');
  });
});

describe('خطط الدعم', () => {
  const sup: AiSupportIdeas = { reason: 'ضعف في قراءة المحاور', goal: 'يقرأ الرسوم بدقة 70%', strategies: ['نماذج محلولة', 'تدريب متدرج'] };

  it('الافتراضي: الحقول الفارغة والاستراتيجيات محدَّدة، والمكتوب يدويًا غير محدَّد', () => {
    expect(defaultSupportPicks({ reason: '', goal: '', strategies: [] }, sup)).toEqual({ reason: true, goal: true, strategies: true });
    expect(defaultSupportPicks({ reason: 'سبب', goal: '', strategies: ['س'] }, sup)).toEqual({ reason: false, goal: true, strategies: true });
    expect(defaultSupportPicks({ reason: '', goal: '', strategies: [] }, { reason: null, goal: null, strategies: [] })).toEqual({ reason: false, goal: false, strategies: false });
  });

  it('يدمج دون استبدال', () => {
    const cur = { reason: 'سبب كتبه المعلم', goal: '', strategies: ['نماذج محلولة', 'إجراء ثالث'] };
    const out = applySupportIdeas(cur, sup, { reason: false, goal: true, strategies: true });
    expect(out).toEqual({ reason: 'سبب كتبه المعلم', goal: 'يقرأ الرسوم بدقة 70%', strategies: ['نماذج محلولة', 'إجراء ثالث', 'تدريب متدرج'] });
    const forced = applySupportIdeas(cur, sup, { reason: true, goal: false, strategies: false });
    expect(forced.reason).toBe('سبب كتبه المعلم\nضعف في قراءة المحاور');
    expect(forced.strategies).toEqual(cur.strategies);
  });
});
