// منطق التقويم المستمر (دوال نقية): يُستخدم في الخادم (التقارير) وفي الواجهة (الحساب اللحظي أثناء الإدخال)
// لضمان أن الرقم الذي يراه المعلم على الشاشة هو نفسه الذي يُطبع في التقرير.
import {
  DEFAULT_GRADING,
  type AssessmentMode,
  type BandTone,
  type GradeBand,
  type GradingSettings,
  type ResultStatus,
  SCORE_DECIMALS,
} from './constants';

export type AssessmentLite = {
  id: string;
  mode: AssessmentMode;
  maxScore: number | null;
  /** عدد الدرجات التي يساهم بها التقويم في المجموع (الافتراضي = الدرجة العظمى) */
  weight: number;
  countsTowardTotal: boolean;
};

export type ResultLite = {
  score: number | null;
  level: number | null;
  status: ResultStatus;
};

export function round(value: number, decimals = SCORE_DECIMALS): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** هل لقيمة ما عدد خانات عشرية ضمن الحد؟ (تفادي 0.1+0.2 بتحويل صحيح) */
export function hasAtMostDecimals(value: number, decimals = SCORE_DECIMALS): boolean {
  const f = 10 ** decimals;
  return Math.abs(Math.round(value * f) - value * f) < 1e-7;
}

export type StudentTotals = {
  /** الدرجة المحققة من مجموع الأوزان المرصودة */
  earned: number;
  /** مجموع الأوزان المحتسبة لهذا الطالب (المرصودة + الغياب) */
  possible: number;
  /** earned / possible × 100 — null إن لم يُرصد شيء */
  percent: number | null;
  /** عدد التقويمات المرصودة بدرجة */
  entered: number;
  /** عدد التقويمات التي لم تُرصد بعد */
  pending: number;
  absent: number;
  excused: number;
};

/**
 * مجموع الطالب في المادة:
 *  - تقويم مرصود: يضيف (الدرجة ÷ العظمى × الوزن) إلى earned والوزن إلى possible.
 *  - غائب: يُحتسب صفرًا (الوزن إلى possible فقط).
 *  - معذور: يُستثنى من المجموع والمقام.
 *  - بلا رصد: يُستثنى ويُعدّ «غير مكتمل».
 *  - تقويمات الإتقان (mastery) وغير المحتسبة لا تدخل المجموع.
 */
export function computeStudentTotals(
  assessments: readonly AssessmentLite[],
  results: ReadonlyMap<string, ResultLite> | Record<string, ResultLite | undefined>,
): StudentTotals {
  const get = (id: string): ResultLite | undefined =>
    results instanceof Map ? results.get(id) : (results as Record<string, ResultLite | undefined>)[id];

  let earned = 0;
  let possible = 0;
  let entered = 0;
  let pending = 0;
  let absent = 0;
  let excused = 0;

  for (const a of assessments) {
    if (a.mode !== 'score' || !a.countsTowardTotal || !a.maxScore || a.maxScore <= 0) continue;
    const r = get(a.id);
    if (!r) {
      pending++;
      continue;
    }
    if (r.status === 'excused') {
      excused++;
      continue;
    }
    if (r.status === 'absent') {
      possible += a.weight;
      absent++;
      continue;
    }
    if (r.score === null || r.score === undefined) {
      pending++;
      continue;
    }
    earned += (r.score / a.maxScore) * a.weight;
    possible += a.weight;
    entered++;
  }

  return {
    earned: round(earned),
    possible: round(possible),
    percent: possible > 0 ? round((earned / possible) * 100) : null,
    entered,
    pending,
    absent,
    excused,
  };
}

/** مجموع الأوزان المحتسبة لكل التقويمات (المقام النظري للمادة) */
export function totalWeight(assessments: readonly AssessmentLite[]): number {
  return round(
    assessments
      .filter((a) => a.mode === 'score' && a.countsTowardTotal)
      .reduce((sum, a) => sum + a.weight, 0),
  );
}

/** متوسط مستوى الإتقان (1–4) لتقويمات الإتقان المرصودة — null إن لم يوجد */
export function masteryAverage(levels: readonly (number | null | undefined)[]): number | null {
  const valid = levels.filter((l): l is number => typeof l === 'number');
  if (valid.length === 0) return null;
  return round(valid.reduce((s, l) => s + l, 0) / valid.length, 1);
}

// ───────────── مستويات الأداء ─────────────
export function sortBands(bands: readonly GradeBand[]): GradeBand[] {
  return [...bands].sort((a, b) => b.min - a.min);
}

export function levelForPercent(
  percent: number | null | undefined,
  bands: readonly GradeBand[] = DEFAULT_GRADING.bands,
): GradeBand | null {
  if (percent === null || percent === undefined || Number.isNaN(percent)) return null;
  const sorted = sortBands(bands);
  return sorted.find((b) => percent >= b.min) ?? sorted[sorted.length - 1] ?? null;
}

export function toneForPercent(
  percent: number | null | undefined,
  grading: GradingSettings = DEFAULT_GRADING,
): BandTone {
  return levelForPercent(percent, grading.bands)?.tone ?? 'neutral';
}

/** التحقق من صحة إعدادات المستويات: تنازلي، آخرها 0، بلا تكرار */
export function validateBands(bands: readonly GradeBand[]): string | null {
  if (bands.length === 0) return 'يجب تعريف مستوى واحد على الأقل';
  const sorted = sortBands(bands);
  if (sorted[sorted.length - 1]!.min !== 0) return 'يجب أن يبدأ أدنى مستوى من 0%';
  const mins = new Set(sorted.map((b) => b.min));
  if (mins.size !== sorted.length) return 'لا يجوز تكرار الحد الأدنى لمستويين';
  return null;
}

// ───────────── إحصاءات ─────────────
export type DistributionStats = {
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  passCount: number;
  passRate: number | null;
  bands: { label: string; tone: BandTone; min: number; count: number }[];
};

/** إحصاءات توزيع نسب مئوية لمجموعة طلاب */
export function distributionStats(
  percents: readonly (number | null)[],
  grading: GradingSettings = DEFAULT_GRADING,
): DistributionStats {
  const valid = percents.filter((p): p is number => typeof p === 'number');
  const sorted = [...valid].sort((a, b) => a - b);
  const bands = sortBands(grading.bands).map((b) => ({
    label: b.label,
    tone: b.tone,
    min: b.min,
    count: 0,
  }));
  for (const p of valid) {
    const band = bands.find((b) => p >= b.min) ?? bands[bands.length - 1];
    if (band) band.count++;
  }
  const count = valid.length;
  const mid = Math.floor(count / 2);
  const median =
    count === 0 ? null : count % 2 ? sorted[mid]! : round((sorted[mid - 1]! + sorted[mid]!) / 2);
  const passCount = valid.filter((p) => p >= grading.passFrom).length;
  return {
    count,
    mean: count ? round(valid.reduce((s, p) => s + p, 0) / count) : null,
    median,
    min: count ? sorted[0]! : null,
    max: count ? sorted[count - 1]! : null,
    passCount,
    passRate: count ? round((passCount / count) * 100) : null,
    bands,
  };
}

export type SupportFlag = 'remedial' | 'enrichment' | null;

export function supportFlag(
  percent: number | null | undefined,
  grading: GradingSettings = DEFAULT_GRADING,
): SupportFlag {
  if (percent === null || percent === undefined) return null;
  if (percent < grading.remedialBelow) return 'remedial';
  if (percent >= grading.enrichmentFrom) return 'enrichment';
  return null;
}
