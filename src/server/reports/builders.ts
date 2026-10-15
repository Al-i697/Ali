// بناة التقارير: يحوّل كل بناء بيانات المعلم إلى ReportDoc (بنفس دوال الحساب المشتركة التي يراها المعلم على الشاشة).
import type { Db } from '../db/client';
import { pickCurrentTerm } from '../../shared/academic';
import {
  ASSESSMENT_TYPE,
  LESSON_STATUS,
  MASTERY_LEVELS,
  masteryLabel,
  sectionLongLabel,
  weekdayName,
  type BandTone,
} from '../../shared/constants';
import { formatDate, weekdayOf, type DigitStyle } from '../../shared/dates';
import type { SettingsDto } from '../../shared/dto';
import { formatNumber } from '../../shared/format';
import { levelForPercent, masteryAverage, round } from '../../shared/gradebook';
import { badRequest } from '../lib/errors';
import { listYears } from '../modules/academic/service';
import { getGradebook, listSkills } from '../modules/assessments/service';
import { summarizeGradebook } from '../modules/assessments/summary';
import { listLessons } from '../modules/lessons/service';
import { requireAssignment, requireStudent, requireTerm, listAssignmentInfos } from '../modules/_shared/owned';
import { getStudentDto, listNotes } from '../modules/students/service';
import type { Cell, Column, ReportDoc, Tone } from './types';


export type BuildCtx = { db: Db; ownerId: string; settings: SettingsDto; today: string; now: string };

const tone = (t: BandTone | undefined): Tone => (t ?? 'neutral') as Tone;

function fmtFactory(digits: DigitStyle) {
  return (n: number | null | undefined, max = 2) => formatNumber(n ?? null, digits, max);
}

function yearOfTerm(ctx: BuildCtx, termId: string) {
  const term = requireTerm(ctx.db, ctx.ownerId, termId);
  const year = listYears(ctx.db, ctx.ownerId).find((y) => y.id === term.yearId)!;
  return { term, year };
}

// ═════════════ 1) كشف درجات الشعبة ═════════════
export function buildClassGradebook(ctx: BuildCtx, q: { assignmentId: string; termId: string }): ReportDoc {
  const d = ctx.settings.preferences.digits;
  const f = fmtFactory(d);
  const gb = getGradebook(ctx.db, ctx.ownerId, q.assignmentId, q.termId);
  const sum = summarizeGradebook(gb);
  const { year } = yearOfTerm(ctx, q.termId);
  const a = gb.assignment;

  const columns: Column[] = [
    { key: 'n', title: 'م', align: 'center', width: 0.45 },
    { key: 'name', title: 'اسم الطالب', width: 3 },
    ...gb.assessments.map<Column>((x) => ({
      key: x.id,
      title: x.title,
      sub:
        x.mode === 'mastery'
          ? 'إتقان'
          : `من ${f(x.maxScore)}${x.weight !== x.maxScore ? ` · وزن ${f(x.weight)}` : ''}${x.countsTowardTotal ? '' : ' · لا يُحتسب'}`,
      align: 'center',
      width: 1,
      kind: x.mode === 'score' ? 'number' : 'text',
    })),
    { key: 'total', title: 'المجموع', sub: `من ${f(sum.totalWeight)}`, align: 'center', width: 1, kind: 'number' },
    { key: 'pct', title: 'النسبة', align: 'center', width: 1, kind: 'percent' },
    { key: 'level', title: 'المستوى', align: 'center', width: 1.3 },
  ];

  const rows: Cell[][] = gb.students.map((s, i) => {
    const sm = sum.students[i]!;
    const cells: Cell[] = [s.rollNo, s.fullName];
    for (const x of gb.assessments) {
      const r = s.results[x.id];
      if (!r) cells.push({ v: null, tone: 'muted' });
      else if (r.status === 'absent') cells.push({ v: 'غ', tone: 'bad' });
      else if (r.status === 'excused') cells.push({ v: 'م', tone: 'muted' });
      else if (x.mode === 'mastery') cells.push(r.level ? { v: masteryLabel(r.level), tone: MASTERY_LEVELS.find((m) => m.value === r.level)?.tone as Tone } : null);
      else cells.push(r.score ?? null);
    }
    cells.push(sm.totals.percent === null ? null : { v: sm.totals.earned, bold: true });
    cells.push(sm.totals.percent === null ? null : { v: sm.totals.percent, bold: true, tone: tone(sm.level?.tone) });
    cells.push(sm.level ? { v: sm.level.label, tone: tone(sm.level.tone) } : null);
    return cells;
  });

  const footer: Cell[][] = [];
  if (rows.length) {
    const avg: Cell[] = ['', { v: 'متوسط الشعبة', bold: true }];
    for (const x of gb.assessments) {
      const st = sum.assessmentStats.find((s) => s.assessmentId === x.id)!;
      avg.push(st.mean);
    }
    const earnedVals = sum.students.filter((s) => s.totals.percent !== null).map((s) => s.totals.earned);
    avg.push(earnedVals.length ? round(earnedVals.reduce((x, y) => x + y, 0) / earnedVals.length) : null);
    avg.push(sum.stats.mean);
    avg.push(null);
    footer.push(avg);
  }

  const st = sum.stats;
  return {
    type: 'class-gradebook',
    title: 'كشف درجات التقويم المستمر',
    subtitle: `${a.subjectName} — ${sectionLongLabel(a.gradeLevel, a.sectionName)}`,
    meta: [
      { label: 'العام الدراسي', value: year.name },
      { label: 'الفصل', value: gb.term.name },
      { label: 'المادة', value: a.subjectName },
      { label: 'الشعبة', value: a.sectionLabel },
      { label: 'عدد الطلاب', value: f(gb.students.length) },
      { label: 'عدد التقويمات', value: f(gb.assessments.length) },
      { label: 'المعلم', value: ctx.settings.profile.fullName },
      { label: 'التاريخ', value: formatDate(ctx.today, d, 'long') },
    ],
    blocks: [
      {
        type: 'stats',
        items: [
          { label: 'متوسط الشعبة', value: st.mean === null ? '—' : `${f(st.mean, 1)}%` },
          { label: 'أعلى نسبة', value: st.max === null ? '—' : `${f(st.max, 1)}%` },
          { label: 'أدنى نسبة', value: st.min === null ? '—' : `${f(st.min, 1)}%` },
          { label: 'نسبة النجاح', value: st.passRate === null ? '—' : `${f(st.passRate, 1)}%`, hint: `حد النجاح ${f(ctx.settings.grading.passFrom)}%` },
        ],
      },
      {
        type: 'table',
        columns,
        rows,
        footer,
        compact: gb.assessments.length > 5,
        empty: 'لا يوجد طلاب في هذه الشعبة',
      },
      { type: 'paragraph', text: 'غ = غائب (يُحتسب صفرًا) — م = معذور (يُستثنى من المجموع). النسبة محسوبة على التقويمات المرصودة فقط، وغير المرصود لا يُحتسب.', tone: 'muted' },
    ],
    landscape: gb.assessments.length > 4,
    filename: `كشف-درجات-${a.subjectName}-${a.gradeLevel}-${a.sectionName}`,
    signatures: true,
    generatedAt: ctx.now,
  };
}

// ═════════════ 2) تحليل أداء الشعبة ═════════════
export function buildClassAnalysis(ctx: BuildCtx, q: { assignmentId: string; termId: string }): ReportDoc {
  const d = ctx.settings.preferences.digits;
  const f = fmtFactory(d);
  const grading = ctx.settings.grading;
  const gb = getGradebook(ctx.db, ctx.ownerId, q.assignmentId, q.termId);
  const sum = summarizeGradebook(gb);
  const { year } = yearOfTerm(ctx, q.termId);
  const a = gb.assignment;
  const st = sum.stats;

  const blocks: ReportDoc['blocks'] = [
    {
      type: 'stats',
      items: [
        { label: 'طلاب بنتائج', value: `${f(st.count)} / ${f(gb.students.length)}` },
        { label: 'المتوسط', value: st.mean === null ? '—' : `${f(st.mean, 1)}%` },
        { label: 'الوسيط', value: st.median === null ? '—' : `${f(st.median, 1)}%` },
        { label: 'نسبة النجاح', value: st.passRate === null ? '—' : `${f(st.passRate, 1)}%`, tone: st.passRate !== null && st.passRate < 60 ? 'bad' : undefined },
      ],
    },
    { type: 'heading', text: 'توزيع الطلاب حسب مستوى الأداء' },
    {
      type: 'bars',
      // صياغة لفظية بدل «≥» لأن الرمز ينعكس في السياق العربي (RTL) فيُقرأ خطأً
      items: st.bands.map((b, i) => ({
        label: b.min === 0 && i > 0 ? `${b.label} (أقل من ${f(st.bands[i - 1]!.min)}%)` : `${b.label} (${f(b.min)}% فأكثر)`,
        value: b.count,
        display: `${f(b.count)}${st.count ? ` · ${f(round((b.count / st.count) * 100, 0))}%` : ''}`,
        tone: tone(b.tone),
      })),
    },
    { type: 'heading', text: 'أداء كل تقويم' },
    {
      type: 'table',
      compact: true,
      empty: 'لا توجد تقويمات في هذا الفصل',
      columns: [
        { key: 't', title: 'التقويم', width: 3 },
        { key: 'ty', title: 'النوع', width: 1.2, align: 'center' },
        { key: 'mx', title: 'العظمى', width: 1, align: 'center', kind: 'number' },
        { key: 'mean', title: 'المتوسط', width: 1, align: 'center', kind: 'number' },
        { key: 'pct', title: 'النسبة', width: 1, align: 'center', kind: 'percent' },
        { key: 'hi', title: 'الأعلى', width: 1, align: 'center', kind: 'number' },
        { key: 'lo', title: 'الأدنى', width: 1, align: 'center', kind: 'number' },
        { key: 'en', title: 'المرصود', width: 1, align: 'center', kind: 'number' },
        { key: 'ms', title: 'غير مرصود', width: 1, align: 'center', kind: 'number' },
      ],
      rows: gb.assessments.map((x) => {
        const s = sum.assessmentStats.find((y) => y.assessmentId === x.id)!;
        return [
          x.title,
          ASSESSMENT_TYPE.labels[x.type],
          x.mode === 'score' ? x.maxScore : 'إتقان',
          s.mean,
          { v: s.meanPercent, tone: s.meanPercent !== null ? tone(levelForPercent(s.meanPercent, grading.bands)?.tone) : undefined },
          s.max,
          s.min,
          s.entered,
          { v: s.missing, tone: s.missing > 0 ? 'warn' : undefined },
        ];
      }),
    },
  ];

  const remedial = sum.students.filter((s) => s.flag === 'remedial').sort((x, y) => (x.totals.percent ?? 0) - (y.totals.percent ?? 0));
  const enrich = sum.students.filter((s) => s.flag === 'enrichment').sort((x, y) => (y.totals.percent ?? 0) - (x.totals.percent ?? 0));
  const studentCols = (): Column[] => [
    { key: 'n', title: 'م', width: 0.5, align: 'center' },
    { key: 'name', title: 'اسم الطالب', width: 3 },
    { key: 'pct', title: 'النسبة', width: 1, align: 'center', kind: 'percent' },
    { key: 'lvl', title: 'المستوى', width: 1.3, align: 'center' },
    { key: 'pend', title: 'تقويمات غير مرصودة', width: 1.3, align: 'center', kind: 'number' },
  ];
  const studentRow = (s: (typeof sum.students)[number], i: number): Cell[] => [
    i + 1,
    s.fullName,
    { v: s.totals.percent, bold: true, tone: tone(s.level?.tone) },
    s.level ? { v: s.level.label, tone: tone(s.level.tone) } : null,
    s.totals.pending,
  ];
  blocks.push(
    { type: 'heading', text: `طلاب يحتاجون إلى خطة علاجية (أقل من ${f(grading.remedialBelow)}%)` },
    { type: 'table', compact: true, columns: studentCols(), rows: remedial.map(studentRow), empty: 'لا يوجد طلاب دون الحد حاليًا' },
    { type: 'heading', text: `طلاب مرشحون للإثراء (${f(grading.enrichmentFrom)}% فأكثر)` },
    { type: 'table', compact: true, columns: studentCols(), rows: enrich.map(studentRow), empty: 'لا يوجد طلاب في هذا النطاق حاليًا' },
  );

  // مهارات الإتقان: متوسط الشعبة لكل مهارة (يدعم تحديد الطلاب المستهدفين للعلاج)
  const skillList = listSkills(ctx.db, ctx.ownerId, { subjectId: a.subjectId, includeArchived: true });
  const bySkill = new Map<string, number[]>();
  for (const asm of gb.assessments.filter((x) => x.mode === 'mastery')) {
    for (const sid of asm.skillIds) {
      const arr = bySkill.get(sid) ?? [];
      for (const s of gb.students) {
        const r = s.results[asm.id];
        if (r?.status === 'graded' && r.level) arr.push(r.level);
      }
      bySkill.set(sid, arr);
    }
  }
  const skillRows: Cell[][] = [...bySkill.entries()]
    .filter(([, lv]) => lv.length > 0)
    .map(([sid, lv]) => {
      const sk = skillList.find((s) => s.id === sid);
      const avg = masteryAverage(lv)!;
      const below = lv.filter((l) => l < 3).length;
      return [sk ? `${sk.code ? sk.code + ' — ' : ''}${sk.title}` : '—', { v: avg, tone: avg >= 3.5 ? 'good' : avg >= 2.5 ? 'info' : avg >= 1.5 ? 'warn' : 'bad' }, `${f(below)} من ${f(lv.length)}`] as Cell[];
    })
    .sort((x, y) => Number((x[1] as { v: number }).v) - Number((y[1] as { v: number }).v));
  if (skillRows.length) {
    blocks.push(
      { type: 'heading', text: 'إتقان المهارات (الأقل إتقانًا أولًا)' },
      {
        type: 'table',
        compact: true,
        columns: [
          { key: 's', title: 'المهارة', width: 4 },
          { key: 'a', title: 'متوسط الإتقان (من 4)', width: 1.4, align: 'center', kind: 'number' },
          { key: 'b', title: 'دون «متقن جزئيًا»', width: 1.4, align: 'center' },
        ],
        rows: skillRows,
      },
    );
  }

  return {
    type: 'class-analysis',
    title: 'تحليل أداء الشعبة',
    subtitle: `${a.subjectName} — ${sectionLongLabel(a.gradeLevel, a.sectionName)}`,
    meta: [
      { label: 'العام الدراسي', value: year.name },
      { label: 'الفصل', value: gb.term.name },
      { label: 'المادة', value: a.subjectName },
      { label: 'الشعبة', value: a.sectionLabel },
      { label: 'المعلم', value: ctx.settings.profile.fullName },
      { label: 'التاريخ', value: formatDate(ctx.today, d, 'long') },
    ],
    blocks,
    filename: `تحليل-أداء-${a.subjectName}-${a.gradeLevel}-${a.sectionName}`,
    signatures: true,
    generatedAt: ctx.now,
  };
}

// ═════════════ 3) تقرير الطالب ═════════════
export function buildStudentReport(
  ctx: BuildCtx,
  q: { studentId: string; termId?: string; includeNotes?: boolean; includeGuardian?: boolean },
): ReportDoc {
  const d = ctx.settings.preferences.digits;
  const f = fmtFactory(d);
  const grading = ctx.settings.grading;
  const studentRow = requireStudent(ctx.db, ctx.ownerId, q.studentId);
  const years = listYears(ctx.db, ctx.ownerId);
  let year = years.find((y) => y.isCurrent) ?? years[0];
  let termId = q.termId;
  if (termId) year = yearOfTerm(ctx, termId).year;
  if (!year) throw badRequest('لا يوجد عام دراسي. أنشئ عامًا دراسيًا أولًا');
  const term = termId ? year.terms.find((t) => t.id === termId)! : pickCurrentTerm(year.terms, ctx.today)!;
  termId = term.id;
  const student = getStudentDto(ctx.db, ctx.ownerId, studentRow.id, year.id);
  if (!student.enrollment) throw badRequest('الطالب غير مسجّل في أي شعبة في هذا العام الدراسي');

  const assignmentsList = listAssignmentInfos(ctx.db, ctx.ownerId, { sectionId: student.enrollment.sectionId });
  const summaryRows: Cell[][] = [];
  const detailBlocks: ReportDoc['blocks'] = [];
  const percents: number[] = [];

  for (const asg of assignmentsList) {
    const gb = getGradebook(ctx.db, ctx.ownerId, asg.id, termId);
    const sum = summarizeGradebook(gb);
    const mine = sum.students.find((s) => s.studentId === student.id);
    const row = gb.students.find((s) => s.studentId === student.id);
    if (!mine || !row) continue;
    if (mine.totals.percent !== null) percents.push(mine.totals.percent);
    summaryRows.push([
      asg.subjectName,
      mine.totals.percent === null ? null : { v: mine.totals.earned, bold: true },
      mine.totals.percent === null ? null : mine.totals.possible,
      mine.totals.percent === null ? null : { v: mine.totals.percent, bold: true, tone: tone(mine.level?.tone) },
      mine.level ? { v: mine.level.label, tone: tone(mine.level.tone) } : null,
      sum.stats.mean,
    ]);
    if (gb.assessments.length) {
      detailBlocks.push({
        type: 'table',
        title: `تفاصيل ${asg.subjectName}`,
        compact: true,
        columns: [
          { key: 't', title: 'التقويم', width: 3 },
          { key: 'ty', title: 'النوع', width: 1.2, align: 'center' },
          { key: 'dt', title: 'التاريخ', width: 1.4, align: 'center' },
          { key: 'r', title: 'الدرجة / المستوى', width: 1.4, align: 'center', kind: 'number' },
          { key: 'm', title: 'من', width: 0.8, align: 'center', kind: 'number' },
        ],
        rows: gb.assessments.map((x) => {
          const r = row.results[x.id];
          let value: Cell = null;
          if (r?.status === 'absent') value = { v: 'غائب', tone: 'bad' };
          else if (r?.status === 'excused') value = { v: 'معذور', tone: 'muted' };
          else if (r) value = x.mode === 'mastery' ? (r.level ? { v: masteryLabel(r.level), tone: MASTERY_LEVELS.find((m) => m.value === r.level)?.tone as Tone } : null) : r.score;
          return [x.title, ASSESSMENT_TYPE.labels[x.type], x.date ? formatDate(x.date, d, 'medium') : '—', value, x.mode === 'score' ? x.maxScore : null];
        }),
      });
    }
  }

  const overall = percents.length ? round(percents.reduce((a, b) => a + b, 0) / percents.length) : null;
  const blocks: ReportDoc['blocks'] = [
    {
      type: 'kv',
      columns: 2,
      items: [
        { label: 'اسم الطالب', value: student.fullName },
        ...(student.studentNumber ? [{ label: 'الرقم التعريفي', value: student.studentNumber }] : []),
        ...(q.includeGuardian && student.guardianName ? [{ label: 'ولي الأمر', value: student.guardianName }] : []),
        ...(q.includeGuardian && student.guardianPhone ? [{ label: 'هاتف ولي الأمر', value: student.guardianPhone }] : []),
      ],
    },
    {
      type: 'stats',
      items: [
        { label: 'النسبة العامة', value: overall === null ? '—' : `${f(overall, 1)}%`, tone: overall === null ? undefined : tone(levelForPercent(overall, grading.bands)?.tone) },
        { label: 'المستوى', value: overall === null ? '—' : (levelForPercent(overall, grading.bands)?.label ?? '—') },
        { label: 'عدد المواد', value: f(summaryRows.length) },
      ],
    },
    { type: 'heading', text: 'ملخص الأداء بالمواد' },
    {
      type: 'table',
      columns: [
        { key: 's', title: 'المادة', width: 2.5 },
        { key: 'e', title: 'المجموع', width: 1, align: 'center', kind: 'number' },
        { key: 'p', title: 'من', width: 0.8, align: 'center', kind: 'number' },
        { key: 'pc', title: 'النسبة', width: 1, align: 'center', kind: 'percent' },
        { key: 'l', title: 'المستوى', width: 1.3, align: 'center' },
        { key: 'c', title: 'متوسط الشعبة', width: 1.2, align: 'center', kind: 'percent' },
      ],
      rows: summaryRows,
      empty: 'لا توجد مواد مسجّلة للشعبة',
    },
    ...detailBlocks,
  ];

  // المهارات: متوسط مستوى الإتقان لكل مهارة
  const skillMap = new Map(listSkills(ctx.db, ctx.ownerId, { includeArchived: true }).map((s) => [s.id, s]));
  const levelsBySkill = new Map<string, number[]>();
  for (const asg of assignmentsList) {
    const gb = getGradebook(ctx.db, ctx.ownerId, asg.id, termId);
    const row = gb.students.find((s) => s.studentId === student.id);
    for (const asm of gb.assessments.filter((x) => x.mode === 'mastery')) {
      const r = row?.results[asm.id];
      if (r?.status === 'graded' && r.level) for (const sid of asm.skillIds) levelsBySkill.set(sid, [...(levelsBySkill.get(sid) ?? []), r.level]);
    }
  }
  if (levelsBySkill.size) {
    blocks.push({
      type: 'table',
      title: 'المهارات',
      compact: true,
      columns: [
        { key: 's', title: 'المهارة', width: 4 },
        { key: 'm', title: 'المادة', width: 1.6 },
        { key: 'a', title: 'متوسط الإتقان (من 4)', width: 1.4, align: 'center', kind: 'number' },
      ],
      rows: [...levelsBySkill.entries()].map(([sid, lv]) => {
        const sk = skillMap.get(sid);
        const avg = masteryAverage(lv)!;
        return [sk?.title ?? '—', sk?.subjectName ?? '—', { v: avg, tone: avg >= 3.5 ? 'good' : avg >= 2.5 ? 'info' : avg >= 1.5 ? 'warn' : 'bad' }] as Cell[];
      }),
    });
  }

  if (q.includeNotes) {
    const notes = listNotes(ctx.db, ctx.ownerId, student.id);
    if (notes.length) {
      blocks.push({ type: 'list', title: 'ملاحظات المعلم', items: notes.slice(0, 20).map((n) => `${formatDate(n.date, d, 'medium')}: ${n.text}`) });
    }
  }

  return {
    type: 'student',
    title: 'تقرير أداء الطالب',
    subtitle: student.fullName,
    meta: [
      { label: 'العام الدراسي', value: year.name },
      { label: 'الفصل', value: term.name },
      { label: 'الشعبة', value: student.enrollment.sectionLabel },
      { label: 'المعلم', value: ctx.settings.profile.fullName },
    ],
    blocks,
    filename: `تقرير-الطالب-${student.fullName.split(' ').slice(0, 2).join('-')}`,
    signatures: true,
    generatedAt: ctx.now,
  };
}

// ═════════════ 4) سجل التحضير ═════════════
export function buildLessonsLog(ctx: BuildCtx, q: { from?: string; to?: string; assignmentId?: string }): ReportDoc {
  const d = ctx.settings.preferences.digits;
  const f = fmtFactory(d);
  const years = listYears(ctx.db, ctx.ownerId);
  const year = years.find((y) => y.isCurrent) ?? years[0];
  const cur = year ? pickCurrentTerm(year.terms, ctx.today) : null;
  const from = q.from ?? cur?.startDate ?? ctx.today;
  const to = q.to ?? cur?.endDate ?? ctx.today;
  if (to < from) throw badRequest('تاريخ النهاية يجب أن يكون بعد البداية');
  if (q.assignmentId) requireAssignment(ctx.db, ctx.ownerId, q.assignmentId);

  const page = listLessons(ctx.db, ctx.ownerId, { from, to, assignmentId: q.assignmentId, limit: 500, offset: 0 });
  const items = [...page.items].sort((a, b) => (a.date === b.date ? (a.period ?? 0) - (b.period ?? 0) : a.date < b.date ? -1 : 1));
  const count = (s: string) => items.filter((l) => l.status === s).length;
  const scope = q.assignmentId ? (() => { const a = requireAssignment(ctx.db, ctx.ownerId, q.assignmentId!); return `${a.subjectName} — ${a.sectionLabel}`; })() : 'كل الشعب والمواد';

  return {
    type: 'lessons',
    title: 'سجل التحضير',
    subtitle: scope,
    meta: [
      { label: 'من', value: formatDate(from, d, 'long') },
      { label: 'إلى', value: formatDate(to, d, 'long') },
      { label: 'عدد الدروس', value: f(items.length) },
      { label: 'المعلم', value: ctx.settings.profile.fullName },
    ],
    blocks: [
      {
        type: 'stats',
        items: [
          { label: 'إجمالي التحضير', value: f(items.length) },
          { label: 'نُفّذ', value: f(count('delivered')), tone: 'good' },
          { label: 'جاهز', value: f(count('ready')), tone: 'info' },
          { label: 'مسودة', value: f(count('draft')), tone: 'warn' },
        ],
      },
      {
        type: 'table',
        compact: true,
        empty: 'لا يوجد تحضير في هذه الفترة',
        columns: [
          { key: 'd', title: 'التاريخ', width: 1.5, align: 'center' },
          { key: 'w', title: 'اليوم', width: 1.1, align: 'center' },
          { key: 'p', title: 'الحصة', width: 0.7, align: 'center', kind: 'number' },
          { key: 's', title: 'الشعبة', width: 0.9, align: 'center' },
          { key: 'sub', title: 'المادة', width: 1.5 },
          { key: 'u', title: 'الوحدة', width: 2 },
          { key: 't', title: 'عنوان الدرس', width: 3 },
          { key: 'st', title: 'الحالة', width: 1, align: 'center' },
        ],
        rows: items.map((l) => [
          formatDate(l.date, d, 'short'),
          weekdayName(weekdayOf(l.date)),
          l.period,
          l.sectionLabel,
          l.subjectName,
          l.unitName,
          l.title,
          { v: LESSON_STATUS.labels[l.status], tone: l.status === 'delivered' ? 'good' : l.status === 'ready' ? 'info' : 'warn' },
        ]),
      },
    ],
    filename: `سجل-التحضير-${from}-${to}`,
    signatures: true,
    generatedAt: ctx.now,
  };
}

