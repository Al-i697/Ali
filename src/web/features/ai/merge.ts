// دمج مقترحات المساعد الذكي في ما كتبه المعلم. القاعدة الثابتة: إضافة فقط — لا يُستبدل ولا يُحذف شيء كتبه المعلم.
//  • القوائم: تُضاف العناصر غير الموجودة (مقارنة مطبَّعة عربيًا) بعد عناصره.
//  • النصوص المفردة: إن كان الحقل فارغًا يُملأ، وإن كان فيه نص يُلحَق المقترح بعده في سطر جديد (ويبدأ غير محدَّد في المراجعة).
//  • سير الدرس: تُلحَق الأنشطة بعد أنشطته؛ والأنشطة الفارغة (هيكل جاهز لم يُكتب) تُستبدل لأنها بلا محتوى.
// دوال نقية بلا React لتُختبر مباشرة (tests/shared/ai-merge.test.ts).
import { normalizeArabic } from '@shared/arabic';
import { ASSESSMENT_TYPE, type ActivityPhase } from '@shared/constants';
import type { AiAssessmentIdea, AiLessonDraft, AiSupportIdeas } from '@shared/dto';

type Activity = { id?: string; phase: ActivityPhase; description: string; minutes: number | null };

/** الحقول التي يلمسها الدمج من نموذج التحضير في الواجهة */
export type LessonLike = {
  title: string;
  outcomes: string[];
  objectives: string[];
  concepts: string[];
  strategies: string[];
  resources: string[];
  activities: Activity[];
  assessmentMethods: string[];
  assessmentNotes: string;
  homework: string;
  supportPlan: string;
  enrichmentPlan: string;
};

export const LIST_SECTIONS = ['outcomes', 'objectives', 'concepts', 'strategies', 'resources', 'assessmentMethods'] as const;
export type ListSection = (typeof LIST_SECTIONS)[number];
export type LessonSection = ListSection | 'activities' | 'homework' | 'supportIdea' | 'enrichmentIdea';
export type LessonPicks = Record<LessonSection, boolean>;

/** ترتيب العرض في المراجعة */
export const SECTION_ORDER: readonly LessonSection[] = ['outcomes', 'objectives', 'concepts', 'strategies', 'resources', 'activities', 'assessmentMethods', 'homework', 'supportIdea', 'enrichmentIdea'];

export const SECTION_LABEL: Record<LessonSection, string> = {
  outcomes: 'نواتج التعلم',
  objectives: 'أهداف الدرس',
  concepts: 'المفاهيم والمصطلحات',
  strategies: 'استراتيجيات التدريس',
  resources: 'مصادر التعلم والوسائل',
  activities: 'سير الدرس والأنشطة',
  assessmentMethods: 'أساليب التقويم',
  homework: 'الواجب المنزلي',
  supportIdea: 'المعالجة',
  enrichmentIdea: 'الإثراء',
};

/** الحقل المقابل في نموذج التحضير لكل قسم نصي مفرد */
const TEXT_FIELD = { homework: 'homework', supportIdea: 'supportPlan', enrichmentIdea: 'enrichmentPlan' } as const;
type TextSection = keyof typeof TEXT_FIELD;
export const isTextSection = (s: LessonSection): s is TextSection => s in TEXT_FIELD;
/** ما كتبه المعلم سلفًا في الحقل المقابل لقسم نصي مفرد */
export const ownText = (cur: LessonLike, s: TextSection): string => cur[TEXT_FIELD[s]];

const key = (s: string) => normalizeArabic(s);
const blank = (s: string) => s.trim() === '';

/** يُلحق العناصر الجديدة فقط، ويُسقط الأسطر الفارغة المؤقتة من القائمة الحالية (عنصر نائب في محرر القوائم) */
export function appendUnique(current: readonly string[], add: readonly string[]): string[] {
  const out = current.filter((x) => !blank(x));
  const seen = new Set(out.map(key));
  for (const raw of add) {
    const v = raw.trim();
    if (!v || seen.has(key(v))) continue;
    seen.add(key(v));
    out.push(v);
  }
  return out;
}

/** يلحق نصًا بنص موجود دون المساس به؛ لا يكرّر ما هو موجود فيه */
export function appendText(current: string, add: string | null | undefined, separator = '\n'): string {
  const a = add?.trim();
  if (!a) return current;
  if (blank(current)) return a;
  if (key(current).includes(key(a))) return current;
  return `${current.replace(/\s+$/, '')}${separator}${a}`;
}

export function sectionHasContent(ai: AiLessonDraft, s: LessonSection): boolean {
  if (s === 'activities') return ai.activities.length > 0;
  if (isTextSection(s)) return !!ai[s]?.trim();
  return ai[s].length > 0;
}

/** القيم الأولية لخيارات المراجعة: كل قسم له محتوى محدَّد، عدا النصوص التي فيها كتابة للمعلم (لا تُلحَق إلا بقراره) */
export function defaultPicks(cur: LessonLike, ai: AiLessonDraft): LessonPicks {
  const picks = {} as LessonPicks;
  for (const s of SECTION_ORDER) {
    picks[s] = sectionHasContent(ai, s) && (!isTextSection(s) || blank(cur[TEXT_FIELD[s]]));
  }
  return picks;
}

export function applyLessonDraft<T extends LessonLike>(cur: T, ai: AiLessonDraft, picks: LessonPicks): T {
  const patch: Partial<LessonLike> = {};
  for (const s of LIST_SECTIONS) if (picks[s]) patch[s] = appendUnique(cur[s], ai[s]);
  for (const s of ['homework', 'supportIdea', 'enrichmentIdea'] as const) {
    if (picks[s]) patch[TEXT_FIELD[s]] = appendText(cur[TEXT_FIELD[s]], ai[s]);
  }
  if (picks.activities && ai.activities.length) {
    const base = cur.activities.filter((a) => !blank(a.description));
    const used = new Set(base.flatMap((a) => (a.id ? [a.id] : [])));
    let n = 0;
    const fresh = ai.activities.map((a) => {
      let id: string;
      do id = `ai${++n}`;
      while (used.has(id));
      used.add(id);
      return { id, phase: a.phase, description: a.description, minutes: a.minutes };
    });
    patch.activities = [...base, ...fresh];
  }
  return { ...cur, ...patch };
}

// ───────────── أفكار التقويم ─────────────
export function ideaText(i: AiAssessmentIdea): string {
  const type = ASSESSMENT_TYPE.labels[i.type];
  const head = type ? `«${i.title}» (${type})` : `«${i.title}»`;
  const criteria = i.criteria.length ? `\nمعايير النجاح: ${i.criteria.join('، ')}` : '';
  return `${head}: ${i.description}${criteria}`;
}

/** العناوين تدخل «أساليب التقويم»، والوصف والمعايير تُلحَق بملاحظات التقويم */
export function applyAssessmentIdeas<T extends LessonLike>(cur: T, ideas: readonly AiAssessmentIdea[]): T {
  if (!ideas.length) return cur;
  return {
    ...cur,
    assessmentMethods: appendUnique(cur.assessmentMethods, ideas.map((i) => i.title)),
    assessmentNotes: appendText(cur.assessmentNotes, ideas.map(ideaText).join('\n\n'), '\n\n'),
  };
}

// ───────────── أفكار الخطط العلاجية والإثرائية ─────────────
export type SupportLike = { reason: string; goal: string; strategies: string[] };
export type SupportPicks = { reason: boolean; goal: boolean; strategies: boolean };

export function defaultSupportPicks(cur: SupportLike, ai: AiSupportIdeas): SupportPicks {
  return { reason: !!ai.reason && blank(cur.reason), goal: !!ai.goal && blank(cur.goal), strategies: ai.strategies.length > 0 };
}

export function applySupportIdeas(cur: SupportLike, ai: AiSupportIdeas, picks: SupportPicks): SupportLike {
  return {
    reason: picks.reason ? appendText(cur.reason, ai.reason) : cur.reason,
    goal: picks.goal ? appendText(cur.goal, ai.goal) : cur.goal,
    strategies: picks.strategies ? appendUnique(cur.strategies, ai.strategies) : cur.strategies,
  };
}
