// مستندا تقريرَي إدارة الصف (ReportDoc) من نتائج الخدمة: دوال نقية بلا قاعدة بيانات ولا Node،
// يبنيهما الخادم من الاستعلام (builders.ts) وتبنيهما المعاينة التفاعلية في المتصفح من حالتها بالأرقام والجداول نفسها.
import { CLASS_FLAG_LABELS } from '../../shared/classroom';
import { CLASS_RECORD_KIND, weekdayName } from '../../shared/constants';
import { formatDate, weekdayOf, type DigitStyle } from '../../shared/dates';
import type { ClassStudentReportDto, ClassSummaryDto } from '../../shared/dto';
import { formatNumber } from '../../shared/format';
import type { Cell, ReportDoc, Tone } from './types';

/** الفترة المطلوبة لتقرير الصف: «كل الفترات» أو من–إلى */
export type ClassRange = { everything: boolean; from?: string; to?: string };

/**
 * الفترة الافتراضية: الفصل الحالي (أو اليوم إن لم يوجد)، أو «كل الفترات» صراحةً (كسجل المختبر).
 * التحقق من ترتيب التاريخين يبقى عند المستدعي لأن خطأه من نوع خطأ الطبقة التي تستدعي.
 */
export function resolveClassRange(q: { from?: string; to?: string; all?: boolean }, term: { startDate: string; endDate: string } | null, today: string): ClassRange {
  if (q.all === true) return { everything: true };
  return { everything: false, from: q.from ?? term?.startDate ?? today, to: q.to ?? term?.endDate ?? today };
}

const fmtFactory = (digits: DigitStyle) => (n: number | null | undefined, max = 2) => formatNumber(n ?? null, digits, max);

const classPeriodMeta = (digits: DigitStyle, r: ClassRange): ReportDoc['meta'] =>
  r.everything
    ? [{ label: 'الفترة', value: 'كل الفترات' }]
    : [
        { label: 'من', value: formatDate(r.from, digits, 'long') },
        { label: 'إلى', value: formatDate(r.to, digits, 'long') },
      ];

export type ClassStudentDocInput = {
  /** تقرير الطالب بالفترة والمادة المطلوبتين وبحدّ 500 حصة (حد التقرير المطبوع) */
  rep: ClassStudentReportDto;
  /** اسم المادة المعروضة في رأس التقرير («كل المواد» عند عدم التصفية) */
  subjectScope: string;
  range: ClassRange;
  digits: DigitStyle;
  teacherName: string;
  now: string;
  includeGuardian?: boolean;
  /** ملاحظات ملف الطالب العامة، تُضاف عند طلبها (تُرشَّح بالفترة وتقتصر على 30) */
  notes?: readonly { date: string; text: string }[];
};

export function classStudentDoc(i: ClassStudentDocInput): ReportDoc {
  const { rep, range } = i;
  const d = i.digits;
  const f = fmtFactory(d);
  const { student, counts } = rep;

  const blocks: ReportDoc['blocks'] = [
    {
      type: 'kv',
      columns: 2,
      items: [
        { label: 'اسم الطالب', value: student.fullName },
        ...(student.studentNumber ? [{ label: 'الرقم التعريفي', value: student.studentNumber }] : []),
        { label: 'الشعبة', value: student.enrollment?.sectionLabel ?? 'غير مسجّل هذا العام' },
        { label: 'المادة', value: i.subjectScope },
        ...(i.includeGuardian && student.guardianName ? [{ label: 'ولي الأمر', value: student.guardianName }] : []),
        ...(i.includeGuardian && student.guardianPhone ? [{ label: 'هاتف ولي الأمر', value: student.guardianPhone }] : []),
      ],
    },
    {
      type: 'stats',
      items: [
        { label: 'حصص سُجّل فيها شيء', value: f(counts.sessions) },
        { label: 'شارك في', value: f(counts.participatedSessions), hint: `بإجمالي ${f(counts.participations)} مشاركة`, tone: 'good' },
        { label: 'لم يشارك في', value: f(counts.noParticipationSessions), tone: counts.noParticipationSessions ? 'warn' : undefined },
        {
          label: 'نسبة المشاركة',
          value: counts.rate === null ? '—' : `${f(counts.rate, 1)}%`,
          hint: rep.sectionRate === null ? undefined : `متوسط الشعبة ${f(rep.sectionRate, 1)}%`,
        },
        { label: 'سلوك إيجابي', value: f(counts.positive), tone: 'info' },
        { label: 'سلوك غير حسن', value: f(counts.negative), hint: counts.notes ? `و${f(counts.notes)} ملاحظة` : undefined, tone: counts.negative ? 'bad' : undefined },
      ],
    },
  ];

  if (rep.bySubject.length > 1) {
    blocks.push({
      type: 'table',
      title: 'حسب المادة',
      compact: true,
      columns: [
        { key: 's', title: 'المادة', width: 2 },
        { key: 'c', title: 'الشعبة', width: 1, align: 'center' },
        { key: 'n', title: 'حصص', width: 0.8, align: 'center', kind: 'number' },
        { key: 'y', title: 'شارك', width: 0.8, align: 'center', kind: 'number' },
        { key: 'x', title: 'لم يشارك', width: 0.9, align: 'center', kind: 'number' },
        { key: 'r', title: 'النسبة', width: 0.9, align: 'center', kind: 'percent' },
        { key: 'p', title: 'إيجابي', width: 0.8, align: 'center', kind: 'number' },
        { key: 'b', title: 'غير حسن', width: 0.9, align: 'center', kind: 'number' },
        { key: 'o', title: 'ملاحظات', width: 0.9, align: 'center', kind: 'number' },
      ],
      rows: rep.bySubject.map((x) => [x.subjectName ?? 'حصة بلا مقرر', x.sectionLabel ?? '—', x.counts.sessions, x.counts.participatedSessions, x.counts.noParticipationSessions, x.counts.rate, x.counts.positive, { v: x.counts.negative, tone: x.counts.negative ? 'bad' : undefined }, x.counts.notes]),
    });
  }

  const bars = (kind: 'positive' | 'negative' | 'note', title: string, t: Tone) => {
    const items = rep.reasons.filter((r) => r.kind === kind);
    if (items.length) blocks.push({ type: 'bars', title, items: items.map((r) => ({ label: r.reason, value: r.count, display: f(r.count), tone: t })) });
  };
  bars('negative', 'أسباب السلوك غير الحسن', 'bad');
  bars('positive', 'السلوك الإيجابي', 'info');
  bars('note', 'الملاحظات', 'neutral');

  // الخط الزمني بتسلسله الزمني (الأقدم أولًا) كبقية السجلات المطبوعة
  const groups = [...rep.sessions].reverse();
  if (rep.totalSessions > groups.length) {
    blocks.push({ type: 'paragraph', tone: 'warn', text: `عُرض أحدث ${f(groups.length)} حصة من ${f(rep.totalSessions)} في هذه الفترة. ضيّق الفترة أو المادة لعرض الباقي. (الأعداد أعلاه تشمل كل الحصص.)` });
  }
  blocks.push({
    type: 'table',
    title: 'الخط الزمني',
    compact: true,
    empty: 'لا تسجيلات لهذا الطالب في الفترة',
    columns: [
      { key: 'n', title: 'م', width: 0.45, align: 'center' },
      { key: 'd', title: 'التاريخ', width: 1.2, align: 'center' },
      { key: 'w', title: 'اليوم', width: 0.9, align: 'center' },
      { key: 'p', title: 'الحصة', width: 0.6, align: 'center', kind: 'number' },
      { key: 's', title: 'المادة', width: 1.3 },
      { key: 'l', title: 'الدرس', width: 2 },
      { key: 'pa', title: 'المشاركة', width: 1.1, align: 'center' },
      { key: 'b', title: 'السلوك والملاحظات', width: 3.4 },
    ],
    rows: groups.map((g, n) => {
      const part: Cell = g.participation === null ? null : g.participation === 0 ? { v: 'لم يشارك', tone: 'warn' } : { v: g.participation === 1 ? 'شارك' : `شارك ×${f(g.participation)}`, tone: 'good' };
      const text = g.records.map((r) => `${CLASS_RECORD_KIND.labels[r.kind]}: ${[r.reason, r.note].filter(Boolean).join(' — ')}`).join('؛ ');
      const bTone: Tone | undefined = g.records.some((r) => r.kind === 'negative') ? 'bad' : g.records.some((r) => r.kind === 'positive') ? 'info' : undefined;
      return [n + 1, formatDate(g.date, d, 'short'), weekdayName(weekdayOf(g.date)), g.period, g.subjectName ?? '—', g.lessonTitle, part, text ? { v: text, tone: bTone } : null];
    }),
  });

  if (i.notes) {
    const inRange = (date: string) => range.everything || ((!range.from || date >= range.from) && (!range.to || date <= range.to));
    const notes = i.notes.filter((n) => inRange(n.date));
    if (notes.length) blocks.push({ type: 'list', title: 'ملاحظات عامة من ملف الطالب', items: notes.slice(0, 30).map((n) => `${formatDate(n.date, d, 'medium')}: ${n.text}`) });
  }

  return {
    type: 'class-student',
    title: 'تقرير المشاركة والسلوك الصفي',
    subtitle: student.fullName,
    meta: [...classPeriodMeta(d, range), { label: 'المعلم', value: i.teacherName }],
    blocks,
    filename: `مشاركة-وسلوك-${student.fullName.split(' ').slice(0, 2).join('-')}`,
    signatures: true,
    generatedAt: i.now,
  };
}

export type ClassSectionDocInput = {
  /** ملخص الشعبة بالفترة المطلوبة وبحدّ 500 حصة في «آخر الحصص» */
  sum: ClassSummaryDto;
  range: ClassRange;
  digits: DigitStyle;
  teacherName: string;
  now: string;
};

export function classSectionDoc(i: ClassSectionDocInput): ReportDoc {
  const { sum, range } = i;
  const d = i.digits;
  const f = fmtFactory(d);
  const t = sum.totals;
  const flagText = (flags: string[]) => flags.map((x) => CLASS_FLAG_LABELS[x as keyof typeof CLASS_FLAG_LABELS]).join('، ');

  const blocks: ReportDoc['blocks'] = [
    {
      type: 'stats',
      items: [
        { label: 'حصص مسجّلة', value: f(sum.sessions) },
        { label: 'مرات المشاركة', value: f(t.participations), tone: 'good' },
        { label: 'نسبة المشاركة', value: t.rate === null ? '—' : `${f(t.rate, 1)}%`, hint: 'من حصص سُجّلت مشاركتها' },
        { label: 'سلوك إيجابي', value: f(t.positive), tone: 'info' },
        { label: 'سلوك غير حسن', value: f(t.negative), tone: t.negative ? 'bad' : undefined },
        { label: 'ملاحظات', value: f(t.notes) },
      ],
    },
    {
      type: 'table',
      title: 'الطلاب',
      compact: true,
      empty: 'لا طلاب في هذه الشعبة',
      columns: [
        { key: 'n', title: 'م', width: 0.45, align: 'center', kind: 'number' },
        { key: 's', title: 'الطالب', width: 3 },
        { key: 'a', title: 'حصص مسجّلة', width: 1, align: 'center', kind: 'number' },
        { key: 'y', title: 'شارك (حصص)', width: 1, align: 'center', kind: 'number' },
        { key: 'x', title: 'لم يشارك (حصص)', width: 1.1, align: 'center', kind: 'number' },
        { key: 'r', title: 'النسبة', width: 0.9, align: 'center', kind: 'percent' },
        { key: 'm', title: 'مرات المشاركة', width: 1, align: 'center', kind: 'number' },
        { key: 'p', title: 'إيجابي', width: 0.8, align: 'center', kind: 'number' },
        { key: 'b', title: 'غير حسن', width: 0.9, align: 'center', kind: 'number' },
        { key: 'o', title: 'ملاحظات', width: 0.9, align: 'center', kind: 'number' },
        { key: 'f', title: 'تنبيه', width: 1.8 },
      ],
      rows: sum.rows.map((r) => [
        r.rollNo,
        r.fullName,
        r.counts.sessions,
        r.counts.participatedSessions,
        r.counts.noParticipationSessions,
        r.counts.rate === null ? null : { v: r.counts.rate, tone: r.flags.includes('silent') || r.flags.includes('low') ? 'warn' : undefined },
        r.counts.participations,
        r.counts.positive,
        { v: r.counts.negative, tone: r.counts.negative ? 'bad' : undefined },
        r.counts.notes,
        r.flags.length ? { v: flagText(r.flags), tone: 'warn' } : null,
      ]),
    },
  ];

  // الحصص في ورقة مستقلة بـExcel (وتتبع الجدول أعلاه في HTML وPDF)، الأقدم أولًا
  const sessions = [...sum.recent].reverse();
  blocks.push({ type: 'sheet', name: 'الحصص' });
  if (sum.sessions > sessions.length) {
    blocks.push({ type: 'paragraph', tone: 'warn', text: `عُرض أحدث ${f(sessions.length)} حصة من ${f(sum.sessions)}. ضيّق الفترة لعرض الباقي.` });
  }
  blocks.push({
    type: 'table',
    title: 'الحصص المسجّلة',
    compact: true,
    empty: 'لا حصص مسجّلة في هذه الفترة',
    columns: [
      { key: 'n', title: 'م', width: 0.45, align: 'center' },
      { key: 'd', title: 'التاريخ', width: 1.2, align: 'center' },
      { key: 'w', title: 'اليوم', width: 0.9, align: 'center' },
      { key: 'p', title: 'الحصة', width: 0.6, align: 'center', kind: 'number' },
      { key: 'l', title: 'الدرس', width: 3 },
      { key: 'y', title: 'شاركوا', width: 0.9, align: 'center', kind: 'number' },
      { key: 'x', title: 'لم يشاركوا', width: 1, align: 'center', kind: 'number' },
      { key: 'm', title: 'مرات المشاركة', width: 1, align: 'center', kind: 'number' },
      { key: 'po', title: 'إيجابي', width: 0.8, align: 'center', kind: 'number' },
      { key: 'ne', title: 'غير حسن', width: 0.9, align: 'center', kind: 'number' },
      { key: 'no', title: 'ملاحظات', width: 0.9, align: 'center', kind: 'number' },
    ],
    rows: sessions.map((x, n) => [n + 1, formatDate(x.date, d, 'short'), weekdayName(weekdayOf(x.date)), x.period, x.lessonTitle, x.participating, x.didNotParticipate, x.participations, x.positive, { v: x.negative, tone: x.negative ? 'bad' : undefined }, x.notes]),
  });

  const scope = sum.subjectName ? `${sum.subjectName} — ${sum.sectionLabel}` : sum.sectionLabel;
  return {
    type: 'class-section',
    title: 'سجل المشاركة والسلوك الصفي',
    subtitle: scope,
    meta: [...classPeriodMeta(d, range), { label: 'الشعبة', value: sum.sectionLabel }, { label: 'المعلم', value: i.teacherName }],
    blocks,
    landscape: true,
    filename: range.everything ? `مشاركة-وسلوك-${sum.sectionLabel.replace('/', '-')}-كل-الفترات` : `مشاركة-وسلوك-${sum.sectionLabel.replace('/', '-')}-${range.from}-${range.to}`,
    signatures: true,
    generatedAt: i.now,
  };
}
