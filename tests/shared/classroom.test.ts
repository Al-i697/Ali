import { describe, expect, it } from 'vitest';
import { CLASS_FLAGS } from '../../src/shared/constants';
import type { ClassRecordDto } from '../../src/shared/dto';
import {
  CLASS_FLAG_LABELS,
  classFlagHint,
  classFlags,
  compareSessionsDesc,
  countEntries,
  emptyCounts,
  groupSessions,
  participationRate,
  reasonBreakdown,
  sessionKey,
  sessionTotals,
  sumCounts,
  summarizeSessions,
  type ParticipationEntry,
} from '../../src/shared/classroom';

const part = (date: string, count: number, period: number | null = 1, studentId = 's1', assignmentId: string | null = 'a1'): ParticipationEntry => ({ studentId, assignmentId, date, period, count });
let n = 0;
const rec = (date: string, kind: ClassRecordDto['kind'], reason: string | null, extra: Partial<ClassRecordDto> = {}): ClassRecordDto => ({
  id: `r${++n}`,
  studentId: 's1',
  assignmentId: 'a1',
  date,
  period: 1,
  kind,
  reason,
  note: null,
  createdAt: `2026-10-01T08:00:${String(n).padStart(2, '0')}.000Z`,
  ...extra,
});

describe('نسبة المشاركة', () => {
  it('= حصص المشاركة ÷ (المشاركة + عدم المشاركة)، وتقريبها لخانة عشرية، وnull بلا تسجيل مشاركة', () => {
    expect(participationRate(4, 1)).toBe(80);
    expect(participationRate(1, 2)).toBe(33.3);
    expect(participationRate(2, 1)).toBe(66.7);
    expect(participationRate(0, 4)).toBe(0);
    expect(participationRate(5, 0)).toBe(100);
    expect(participationRate(0, 0)).toBeNull();
  });
});

describe('countEntries', () => {
  it('يعدّ الحصص والمشاركات والسلوك، ولا يحسب حصة سلوك فقط «عدم مشاركة»', () => {
    const c = countEntries(
      [part('2026-10-01', 2), part('2026-10-02', 0), part('2026-10-03', 1)],
      [rec('2026-10-02', 'negative', 'حديث جانبي'), rec('2026-10-04', 'positive', 'مبادرة'), rec('2026-10-04', 'note', 'متابعة')],
    );
    expect(c).toEqual({ sessions: 4, participatedSessions: 2, noParticipationSessions: 1, participations: 3, positive: 1, negative: 1, notes: 1, rate: 66.7 });
    // الحصة الرابعة سلوك فقط: دخلت في الحصص ولم تدخل في مقام النسبة
  });

  it('لا يعدّ الحصة مرتين لو تكرر صفها، ولا يخلط الحصة برقمها (1 غير 2 غير بلا رقم)', () => {
    const c = countEntries([part('2026-10-01', 2), part('2026-10-01', 5)], []);
    expect(c.sessions).toBe(1);
    expect(c.participations).toBe(5); // آخر قيمة
    const d = countEntries([part('2026-10-01', 1, 1), part('2026-10-01', 1, 2), part('2026-10-01', 1, null)], []);
    expect(d.sessions).toBe(3);
  });

  it('بلا صفوف: أصفار ونسبة null', () => {
    expect(countEntries([], [])).toEqual(emptyCounts());
  });
});

describe('مؤشرات المتابعة (حدودها بالضبط)', () => {
  const counts = (yes: number, no: number, negative = 0) => ({ ...emptyCounts(), participatedSessions: yes, noParticipationSessions: no, negative, rate: participationRate(yes, no) });

  it('«لم يشارك مطلقًا» عند 4 حصص فأكثر دون مشاركة، لا قبلها', () => {
    expect(classFlags(counts(0, CLASS_FLAGS.minSessions - 1))).toEqual([]);
    expect(classFlags(counts(0, CLASS_FLAGS.minSessions))).toEqual(['silent']);
  });

  it('«قليل المشاركة» أقل من 25% بعد 4 حصص فأكثر: 25% بالضبط ليست قليلة، و3 حصص لا تكفي للحكم', () => {
    expect(classFlags(counts(1, 4))).toEqual(['low']); // 20%
    expect(classFlags(counts(1, 3))).toEqual([]); // 25% بالضبط
    expect(classFlags(counts(0, 2))).toEqual([]); // حصتان فقط
    expect(classFlags(counts(1, 2))).toEqual([]); // 3 حصص: أقل من الحد الأدنى
    expect(classFlags(counts(2, 6))).toEqual([]); // 25%
    expect(classFlags(counts(1, 9))).toEqual(['low']); // 10%
  });

  it('«ملاحظات كثيرة» عند 3 غير حسنة فأكثر، وقد تجتمع مع قلة المشاركة', () => {
    expect(classFlags(counts(5, 0, CLASS_FLAGS.concernNegative - 1))).toEqual([]);
    expect(classFlags(counts(5, 0, CLASS_FLAGS.concernNegative))).toEqual(['concern']);
    expect(classFlags(counts(1, 4, 3))).toEqual(['low', 'concern']);
    expect(classFlags(counts(0, 4, 3))).toEqual(['silent', 'concern']);
  });

  it('لكل مؤشر اسم عربي وتلميح يذكر عتبته الفعلية', () => {
    for (const f of ['silent', 'low', 'concern'] as const) expect(CLASS_FLAG_LABELS[f]).toMatch(/[؀-ۿ]/);
    expect(classFlagHint('silent')).toContain(String(CLASS_FLAGS.minSessions));
    expect(classFlagHint('low')).toContain(`${CLASS_FLAGS.lowRate}%`);
    expect(classFlagHint('concern')).toContain(String(CLASS_FLAGS.concernNegative));
  });
});

describe('sumCounts و sessionTotals', () => {
  it('المجموع الإجمالي للشعبة ونسبته من مجموع الحصص لا من متوسط النسب', () => {
    const a = countEntries([part('2026-10-01', 1), part('2026-10-02', 1)], []); // 100% (2/2)
    const b = countEntries([part('2026-10-01', 0), part('2026-10-02', 0), part('2026-10-03', 0), part('2026-10-04', 1)], []); // 25% (1/4)
    const t = sumCounts([a, b]);
    expect(t).toMatchObject({ participatedSessions: 3, noParticipationSessions: 3, participations: 3, rate: 50 }); // لا (100+25)/2 = 62.5
    expect(sumCounts([])).toMatchObject({ rate: null, participations: 0 });
  });

  it('مجاميع الحصة: لم يُسجَّل / لم يشارك / شارك، ومرات المشاركة، والسلوك', () => {
    const t = sessionTotals([
      { participation: null, records: [] },
      { participation: 0, records: [{ kind: 'negative' }] },
      { participation: 3, records: [{ kind: 'positive' }, { kind: 'note' }] },
      { participation: 1, records: [] },
    ]);
    expect(t).toEqual({ students: 4, participating: 2, didNotParticipate: 1, unrecorded: 1, participations: 4, positive: 1, negative: 1, notes: 1 });
    expect(sessionTotals([])).toMatchObject({ students: 0, unrecorded: 0 });
  });
});

describe('تجميع الأسباب', () => {
  it('الأكثر تكرارًا أولًا، وتعادل العدد بالأبجدية، وبلا سبب تحت اسم موحّد، ونوعا السلوك لا يختلطان', () => {
    const r = reasonBreakdown([
      rec('2026-10-01', 'negative', 'حديث جانبي'),
      rec('2026-10-02', 'negative', 'حديث جانبي'),
      rec('2026-10-03', 'negative', 'استخدام الجوال'),
      rec('2026-10-04', 'negative', 'إزعاج الزملاء'),
      rec('2026-10-05', 'positive', 'حديث جانبي'), // الاسم نفسه لكن النوع مختلف
      rec('2026-10-06', 'note', null, { note: 'نص حر' }),
    ]);
    expect(r).toEqual([
      { kind: 'negative', reason: 'حديث جانبي', count: 2 },
      { kind: 'negative', reason: 'إزعاج الزملاء', count: 1 },
      { kind: 'note', reason: 'بلا سبب محدد', count: 1 },
      { kind: 'negative', reason: 'استخدام الجوال', count: 1 },
      { kind: 'positive', reason: 'حديث جانبي', count: 1 },
    ].sort((a, b) => b.count - a.count || (a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0)));
    expect(reasonBreakdown([])).toEqual([]);
  });
});

describe('تجميع الحصص', () => {
  const meta = () => ({ sectionLabel: '10/3', subjectName: 'العلوم', subjectColor: 'teal', lessonTitle: null });

  it('الأحدث أولًا بالتاريخ ثم بالحصة، والحصة بلا رقم قبل الأولى في اليوم نفسه', () => {
    const refs = [
      { assignmentId: 'a1', date: '2026-10-01', period: 2 },
      { assignmentId: 'a1', date: '2026-10-02', period: null },
      { assignmentId: 'a1', date: '2026-10-01', period: 1 },
      { assignmentId: 'a1', date: '2026-10-02', period: 3 },
      { assignmentId: 'a1', date: '2026-10-01', period: null },
    ];
    expect([...refs].sort(compareSessionsDesc).map((r) => `${r.date}/${r.period ?? '-'}`)).toEqual(['2026-10-02/3', '2026-10-02/-', '2026-10-01/2', '2026-10-01/1', '2026-10-01/-']);
    expect(sessionKey({ assignmentId: null, date: '2026-10-01', period: null })).toBe('-|2026-10-01|0');
  });

  it('الخط الزمني لطالب: حصة لكل عنصر بمشاركتها وتسجيلاتها مرتبة بزمن الإنشاء', () => {
    const g = groupSessions(
      [part('2026-10-01', 2), part('2026-10-03', 0)],
      [rec('2026-10-03', 'negative', 'ب', { createdAt: '2026-10-03T09:00:00.000Z' }), rec('2026-10-03', 'positive', 'أ', { createdAt: '2026-10-03T08:00:00.000Z' }), rec('2026-10-02', 'note', 'ج')],
      meta,
    );
    expect(g.map((x) => [x.date, x.participation, x.records.map((r) => r.reason)])).toEqual([
      ['2026-10-03', 0, ['أ', 'ب']],
      ['2026-10-02', null, ['ج']],
      ['2026-10-01', 2, []],
    ]);
    expect(g[0]).toMatchObject({ sectionLabel: '10/3', subjectName: 'العلوم', subjectColor: 'teal', key: sessionKey({ assignmentId: 'a1', date: '2026-10-03', period: 1 }) });
  });

  it('ملخص كل حصة عبر طلابها: عدد من سُجّل لهم ومن شارك ومن لم يشارك ومرات المشاركة والسلوك', () => {
    const s = summarizeSessions(
      [part('2026-10-01', 2, 1, 's1'), part('2026-10-01', 0, 1, 's2'), part('2026-10-01', 1, 1, 's3'), part('2026-10-02', 0, 1, 's1')],
      [rec('2026-10-01', 'negative', 'x', { studentId: 's2' }), rec('2026-10-01', 'positive', 'y', { studentId: 's4' }), rec('2026-10-01', 'note', 'z', { studentId: 's4' })],
      meta,
    );
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ date: '2026-10-02', recordedStudents: 1, participating: 0, didNotParticipate: 1 });
    expect(s[1]).toMatchObject({ date: '2026-10-01', recordedStudents: 4, participating: 2, didNotParticipate: 1, participations: 3, negative: 1, positive: 1, notes: 1 });
  });
});
