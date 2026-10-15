import { describe, expect, it } from 'vitest';
import { DEFAULT_GRADING } from '../../src/shared/constants';
import {
  computeStudentTotals,
  distributionStats,
  hasAtMostDecimals,
  levelForPercent,
  masteryAverage,
  round,
  supportFlag,
  totalWeight,
  validateBands,
  type AssessmentLite,
  type ResultLite,
} from '../../src/shared/gradebook';

const A = (id: string, max: number, weight = max, over: Partial<AssessmentLite> = {}): AssessmentLite => ({
  id, mode: 'score', maxScore: max, weight, countsTowardTotal: true, ...over,
});
const R = (score: number | null, status: ResultLite['status'] = 'graded'): ResultLite => ({ score, level: null, status });

describe('computeStudentTotals', () => {
  const asm = [A('q1', 10), A('p1', 20, 10)];

  it('يحسب المجموع موزونًا: الدرجة ÷ العظمى × الوزن', () => {
    const t = computeStudentTotals(asm, { q1: R(8), p1: R(15) });
    expect(t).toMatchObject({ earned: 15.5, possible: 20, percent: 77.5, entered: 2, pending: 0 });
  });

  it('الغائب يُحتسب صفرًا والمعذور يُستثنى', () => {
    expect(computeStudentTotals(asm, { q1: R(null, 'absent'), p1: R(20) })).toMatchObject({ earned: 10, possible: 20, percent: 50, absent: 1 });
    expect(computeStudentTotals(asm, { q1: R(null, 'excused'), p1: R(20) })).toMatchObject({ earned: 10, possible: 10, percent: 100, excused: 1 });
  });

  it('غير المرصود لا يدخل المقام ويُعدّ ناقصًا', () => {
    const t = computeStudentTotals(asm, { q1: R(5) });
    expect(t).toMatchObject({ earned: 5, possible: 10, percent: 50, pending: 1 });
    expect(computeStudentTotals(asm, {})).toMatchObject({ percent: null, pending: 2 });
    expect(computeStudentTotals(asm, { q1: R(null) })).toMatchObject({ percent: null, pending: 2 });
  });

  it('يتجاهل تقويمات الإتقان وغير المحتسبة', () => {
    const list = [A('q1', 10), { ...A('m1', 0), mode: 'mastery' as const, maxScore: null, weight: 0 }, A('x', 10, 10, { countsTowardTotal: false })];
    const t = computeStudentTotals(list, { q1: R(9), m1: { score: null, level: 3, status: 'graded' }, x: R(0) });
    expect(t).toMatchObject({ earned: 9, possible: 10, percent: 90 });
  });

  it('الأوزان المختلفة عن الدرجة العظمى تُحتسب بنسبتها', () => {
    // اختبار من 25 بوزن 40: 20/25 → 32 من 40
    const t = computeStudentTotals([A('e', 25, 40)], { e: R(20) });
    expect(t).toMatchObject({ earned: 32, possible: 40, percent: 80 });
  });

  it('لا أخطاء تقريب عشرية (0.1 + 0.2)', () => {
    const t = computeStudentTotals([A('a', 1, 1), A('b', 1, 1), A('c', 1, 1)], { a: R(0.1), b: R(0.2), c: R(0.3) });
    expect(t.earned).toBe(0.6);
    expect(t.percent).toBe(20);
  });

  it('يقبل Map أو كائنًا عاديًا', () => {
    const m = new Map<string, ResultLite>([['q1', R(10)]]);
    expect(computeStudentTotals([A('q1', 10)], m).percent).toBe(100);
  });
});

describe('الدقة العشرية', () => {
  it('hasAtMostDecimals', () => {
    expect(hasAtMostDecimals(7.5)).toBe(true);
    expect(hasAtMostDecimals(7.25)).toBe(true);
    expect(hasAtMostDecimals(7.255)).toBe(false);
    expect(hasAtMostDecimals(0.1 + 0.2)).toBe(true); // 0.30000000000000004 ≈ 0.30
  });
  it('round', () => {
    expect(round(1.005)).toBe(1.01);
    expect(round(2.345, 1)).toBe(2.3);
  });
});

describe('مستويات الأداء والتحليل', () => {
  it('يحدد المستوى حسب الحد الأدنى بترتيب تنازلي', () => {
    const l = (p: number) => levelForPercent(p, DEFAULT_GRADING.bands)?.label;
    expect(l(95)).toBe('ممتاز');
    expect(l(90)).toBe('ممتاز');
    expect(l(89.99)).toBe('جيد جدًا');
    expect(l(50)).toBe('مقبول');
    expect(l(49.9)).toBe('يحتاج إلى دعم');
    expect(l(0)).toBe('يحتاج إلى دعم');
    expect(levelForPercent(null)).toBeNull();
  });

  it('يتحقق من صحة المستويات', () => {
    expect(validateBands(DEFAULT_GRADING.bands)).toBeNull();
    expect(validateBands([{ min: 50, label: 'x', tone: 'good' }])).toMatch(/0%/);
    expect(validateBands([{ min: 0, label: 'a', tone: 'bad' }, { min: 0, label: 'b', tone: 'good' }])).toMatch(/تكرار/);
  });

  it('يحدد الحاجة للعلاج أو الإثراء', () => {
    expect(supportFlag(49)).toBe('remedial');
    expect(supportFlag(50)).toBeNull();
    expect(supportFlag(90)).toBe('enrichment');
    expect(supportFlag(null)).toBeNull();
  });

  it('إحصاءات التوزيع', () => {
    const s = distributionStats([95, 80, 62, 50, 30, null]);
    expect(s).toMatchObject({ count: 5, mean: 63.4, median: 62, min: 30, max: 95, passCount: 4, passRate: 80 });
    expect(s.bands.map((b) => b.count)).toEqual([1, 1, 1, 1, 1]);
    expect(distributionStats([])).toMatchObject({ count: 0, mean: null, median: null, passRate: null });
    expect(distributionStats([10, 20]).median).toBe(15);
  });

  it('مجموع الأوزان ومتوسط الإتقان', () => {
    expect(totalWeight([A('a', 10), A('b', 20, 10), A('c', 5, 5, { countsTowardTotal: false })])).toBe(20);
    expect(masteryAverage([4, 3, null, 2])).toBe(3);
    expect(masteryAverage([null])).toBeNull();
  });
});
