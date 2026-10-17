// إدارة الصف: تجميع الصفوف الخام (المشاركة والتسجيلات) في كائنات الشاشات والتقارير بدوال نقية.
// يجلب الخادم الصفوف من القاعدة ثم يمرّرها إلى هذه الدوال، وتفعل المعاينة التفاعلية الشيء نفسه بصفوف في الذاكرة
// (demo/class-engine.ts) — فتتطابق الأرقام في الاثنين لأن الشيفرة واحدة لا نسختان.
import { CLASS_FLAGS } from './constants';
import type { Gender } from './constants';
import { addDays } from './dates';
import type {
  AssignmentDto,
  ClassAttentionDto,
  ClassDashboardDto,
  ClassOverviewDto,
  ClassRecordDto,
  ClassSessionDto,
  ClassSessionStudentDto,
  ClassSlotDto,
  ClassStudentReportDto,
  ClassStudentSubjectDto,
  ClassSummaryDto,
  StudentDto,
} from './dto';
import {
  classFlags,
  countEntries,
  groupSessions,
  participationRate,
  reasonBreakdown,
  sessionKey,
  sessionTotals,
  summarizeSessions,
  sumCounts,
  type ParticipationEntry,
  type SessionMeta,
  type SessionRef,
} from './classroom';

export type RosterEntry = { studentId: string; rollNo: number; fullName: string; gender: Gender | null };
export type ClassRows = { participation: readonly ParticipationEntry[]; records: readonly ClassRecordDto[] };
/** تحضير درس (لعنوانه في الحصة): يكفي منه ما يُربَط بالحصة */
export type LessonRef = { id: string; assignmentId: string; date: string; period: number | null; title: string };
export type MetaResolver = (ref: SessionRef) => SessionMeta;

export const isSameSession = (a: SessionRef, b: SessionRef): boolean => sessionKey(a) === sessionKey(b);

/**
 * تحضير الدرس المطابق لحصة: حصة محددة ← تحضيرها بالرقم نفسه أو تحضير اليوم العام (بلا رقم)؛
 * حصة غير محددة ← أول تحضير في اليوم.
 */
export function pickLesson(lessons: readonly LessonRef[], ref: SessionRef): LessonRef | undefined {
  const same = lessons.filter((l) => l.assignmentId === ref.assignmentId && l.date === ref.date);
  return ref.period ? (same.find((l) => l.period === ref.period) ?? same.find((l) => l.period === null)) : same[0];
}

/** وصف الحصص (الشعبة والمادة وعنوان الدرس) من المقررات والتحضيرات المتاحة */
export function makeMetaResolver(assignments: ReadonlyMap<string, AssignmentDto>, lessons: readonly LessonRef[]): MetaResolver {
  return (ref) => {
    const a = ref.assignmentId ? assignments.get(ref.assignmentId) : undefined;
    return { sectionLabel: a?.sectionLabel ?? null, subjectName: a?.subjectName ?? null, subjectColor: a?.subjectColor ?? null, lessonTitle: pickLesson(lessons, ref)?.title ?? null };
  };
}

const groupBy = <T extends { studentId: string }>(rows: readonly T[]): Map<string, T[]> => {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const list = m.get(r.studentId);
    if (list) list.push(r);
    else m.set(r.studentId, [r]);
  }
  return m;
};

const byCreated = (a: ClassRecordDto, b: ClassRecordDto) => (a.createdAt === b.createdAt ? (a.id < b.id ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1);

// ───────────── شاشة الحصة ─────────────
/**
 * صفوف طلاب الحصة. `rows` = صفوف المقرر لطلاب القائمة حتى تاريخ الحصة (وما بعده يُتجاهل):
 * ما كان لهذه الحصة نفسها يصير حالة الطالب فيها، وما قبلها يصير «قبل هذه الحصة» (سياق لا يتغير بما يُسجَّل فيها).
 */
export function buildSessionStudents(ref: SessionRef, roster: readonly RosterEntry[], rows: ClassRows): ClassSessionStudentDto[] {
  const part = groupBy(rows.participation.filter((p) => p.date <= ref.date));
  const recs = groupBy(rows.records.filter((r) => r.date <= ref.date));
  return roster.map((r) => {
    const parts = part.get(r.studentId) ?? [];
    const records = recs.get(r.studentId) ?? [];
    return {
      studentId: r.studentId,
      rollNo: r.rollNo,
      fullName: r.fullName,
      gender: r.gender,
      participation: parts.find((p) => isSameSession(p, ref))?.count ?? null,
      records: records.filter((x) => isSameSession(x, ref)).sort(byCreated),
      before: countEntries(parts.filter((p) => !isSameSession(p, ref)), records.filter((x) => !isSameSession(x, ref))),
    };
  });
}

export function buildSession(args: { assignment: AssignmentDto; date: string; period: number | null; roster: readonly RosterEntry[]; rows: ClassRows; lessons: readonly LessonRef[] }): ClassSessionDto {
  const ref: SessionRef = { assignmentId: args.assignment.id, date: args.date, period: args.period };
  const students = buildSessionStudents(ref, args.roster, args.rows);
  const lesson = pickLesson(args.lessons, ref);
  return {
    assignment: args.assignment,
    date: args.date,
    period: args.period,
    lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
    students,
    totals: sessionTotals(students),
  };
}

// ───────────── ملخص الشعبة ─────────────
export function buildSummary(args: {
  section: { id: string; label: string };
  assignment: AssignmentDto | null;
  from?: string | null;
  to?: string | null;
  roster: readonly RosterEntry[];
  rows: ClassRows;
  meta: MetaResolver;
  recentLimit: number;
}): ClassSummaryDto {
  const part = groupBy(args.rows.participation);
  const recs = groupBy(args.rows.records);
  const rows = args.roster.map((r) => {
    const mine = part.get(r.studentId) ?? [];
    const mineRecs = recs.get(r.studentId) ?? [];
    const counts = countEntries(mine, mineRecs);
    const dates = [...mine.map((p) => p.date), ...mineRecs.map((x) => x.date)].sort();
    return { studentId: r.studentId, rollNo: r.rollNo, fullName: r.fullName, gender: r.gender, counts, flags: classFlags(counts), lastDate: dates.at(-1) ?? null };
  });
  const sessions = summarizeSessions(args.rows.participation, args.rows.records, args.meta);
  return {
    sectionId: args.section.id,
    sectionLabel: args.section.label,
    assignmentId: args.assignment?.id ?? null,
    subjectName: args.assignment?.subjectName ?? null,
    from: args.from ?? null,
    to: args.to ?? null,
    sessions: sessions.length,
    totals: sumCounts(rows.map((r) => r.counts)),
    rows,
    recent: sessions.slice(0, args.recentLimit),
  };
}

/** نسبة مشاركة مجموعة صفوف (شعبة كاملة) — لمقارنة الطالب بزملائه */
export function groupRate(participation: readonly ParticipationEntry[]): number | null {
  let yes = 0;
  let no = 0;
  for (const p of participation) {
    if (p.count > 0) yes++;
    else no++;
  }
  return participationRate(yes, no);
}

// ───────────── تقرير الطالب الكامل ─────────────
export function buildStudentReport(args: {
  student: StudentDto;
  assignmentId: string | null;
  from?: string | null;
  to?: string | null;
  limit: number;
  /** كل صفوف الطالب في الفترة (كل المقررات): التصفية بالمقرر هنا */
  rows: ClassRows;
  meta: MetaResolver;
  sectionRate: number | null;
}): ClassStudentReportDto {
  const { rows, assignmentId } = args;
  const parts = assignmentId ? rows.participation.filter((p) => p.assignmentId === assignmentId) : rows.participation;
  const recs = assignmentId ? rows.records.filter((r) => r.assignmentId === assignmentId) : rows.records;

  const subjects = new Map<string | null, { parts: ParticipationEntry[]; recs: ClassRecordDto[] }>();
  const slot = (id: string | null) => subjects.get(id) ?? subjects.set(id, { parts: [], recs: [] }).get(id)!;
  for (const p of parts) slot(p.assignmentId).parts.push(p);
  for (const r of recs) slot(r.assignmentId).recs.push(r);
  const bySubject: ClassStudentSubjectDto[] = [...subjects.entries()]
    .map(([id, v]) => {
      const m = args.meta({ assignmentId: id, date: '', period: null });
      return { assignmentId: id, sectionLabel: m.sectionLabel, subjectName: m.subjectName, subjectColor: m.subjectColor, counts: countEntries(v.parts, v.recs) };
    })
    .sort((a, b) => b.counts.sessions - a.counts.sessions || (a.subjectName ?? '').localeCompare(b.subjectName ?? '', 'ar'));

  // كل مقررات الطالب في الفترة (قبل تصفية المقرر): لقائمة التصفية
  const available = new Map<string, string>();
  for (const x of [...rows.participation, ...rows.records]) {
    if (!x.assignmentId || available.has(x.assignmentId)) continue;
    const m = args.meta({ assignmentId: x.assignmentId, date: '', period: null });
    available.set(x.assignmentId, `${m.subjectName ?? '—'} — ${m.sectionLabel ?? '—'}`);
  }

  const groups = groupSessions(parts, [...recs].sort(byCreated), args.meta);
  return {
    student: args.student,
    assignmentId,
    from: args.from ?? null,
    to: args.to ?? null,
    counts: countEntries(parts, recs),
    sectionRate: args.sectionRate,
    bySubject,
    assignments: [...available.entries()].map(([id, label]) => ({ id, label })),
    reasons: reasonBreakdown(recs),
    sessions: groups.slice(0, args.limit),
    totalSessions: groups.length,
  };
}

// ───────────── النظرة العامة ─────────────
export type SlotInput = {
  slotId: string;
  period: number;
  start: string | null;
  end: string | null;
  room: string | null;
  assignment: AssignmentDto;
  studentCount: number;
  state: ClassSlotDto['state'];
};

/**
 * حصص اليوم من الجدول بما سُجّل لكل منها، وآخر الحصص المسجّلة.
 * حصة اليوم قد تُسجَّل بلا رقم (من «حصة أخرى») فتُنسب إلى حصة الجدول إن لم يوجد تسجيل بالرقم نفسه.
 */
export function buildOverview(args: {
  today: string;
  weekday: number;
  slots: readonly SlotInput[];
  recentRefs: readonly SessionRef[];
  rows: ClassRows;
  meta: MetaResolver;
  total: number;
}): ClassOverviewDto {
  const summaries = new Map(summarizeSessions(args.rows.participation, args.rows.records, args.meta).map((s) => [s.key, s]));
  const slots: ClassSlotDto[] = args.slots.map((s) => {
    const exact = summaries.get(sessionKey({ assignmentId: s.assignment.id, date: args.today, period: s.period }));
    const loose = summaries.get(sessionKey({ assignmentId: s.assignment.id, date: args.today, period: null }));
    return { ...s, session: exact ?? loose ?? null };
  });
  return {
    today: args.today,
    weekday: args.weekday,
    slots,
    recent: args.recentRefs.flatMap((r) => {
      const s = summaries.get(sessionKey(r));
      return s ? [s] : [];
    }),
    total: args.total,
  };
}

/** كم طالبًا سُجّل له شيء في كل حصة لتاريخ ما، بمفتاح «مقرر|رقم الحصة» (0 = بلا رقم) — لعدّاد زر «إدارة الصف» في لوحة التحكم */
export function recordedToday(rows: ClassRows, date: string): Map<string, number> {
  const sets = new Map<string, Set<string>>();
  for (const x of [...rows.participation, ...rows.records]) {
    if (x.date !== date || !x.assignmentId) continue;
    const key = `${x.assignmentId}|${x.period ?? 0}`;
    const set = sets.get(key) ?? new Set<string>();
    set.add(x.studentId);
    sets.set(key, set);
  }
  return new Map([...sets].map(([k, v]) => [k, v.size]));
}

// ───────────── لوحة التحكم ─────────────
/** من يحتاج نظرة: ملاحظات غير حسنة في آخر 14 يومًا، وقليلو المشاركة في آخر 30 يومًا (بعتبات CLASS_FLAGS) */
export function buildClassDashboard(args: {
  today: string;
  total: number;
  /** طلاب العام الحالي المقيَّدون فقط */
  students: ReadonlyMap<string, { fullName: string; sectionLabel: string }>;
  rows: ClassRows;
}): ClassDashboardDto {
  if (args.total === 0) return { total: 0, negativeRecent: [], lowParticipation: [] };
  const { students, today } = args;
  const arabic = (a: string, b: string) => a.localeCompare(b, 'ar');

  const negSince = addDays(today, -14);
  const neg = args.rows.records
    .filter((r) => r.kind === 'negative' && r.date >= negSince && r.date <= today && students.has(r.studentId))
    .sort((a, b) => (a.date === b.date ? byCreated(a, b) : a.date < b.date ? -1 : 1));
  const negBy = new Map<string, { count: number; reason: string | null }>();
  for (const r of neg) negBy.set(r.studentId, { count: (negBy.get(r.studentId)?.count ?? 0) + 1, reason: r.reason ?? r.note });
  const negativeRecent: ClassAttentionDto[] = [...negBy.entries()]
    .map(([studentId, v]) => ({ studentId, fullName: students.get(studentId)!.fullName, sectionLabel: students.get(studentId)!.sectionLabel, count: v.count, rate: null, reason: v.reason }))
    .sort((a, b) => b.count - a.count || arabic(a.fullName, b.fullName))
    .slice(0, 5);

  const partSince = addDays(today, -30);
  const partBy = new Map<string, { yes: number; no: number }>();
  for (const p of args.rows.participation) {
    if (p.date < partSince || p.date > today || !students.has(p.studentId)) continue;
    const cur = partBy.get(p.studentId) ?? { yes: 0, no: 0 };
    if (p.count > 0) cur.yes++;
    else cur.no++;
    partBy.set(p.studentId, cur);
  }
  const lowParticipation: ClassAttentionDto[] = [...partBy.entries()]
    .filter(([, v]) => v.yes + v.no >= CLASS_FLAGS.minSessions && (participationRate(v.yes, v.no) ?? 100) < CLASS_FLAGS.lowRate)
    .map(([studentId, v]) => ({ studentId, fullName: students.get(studentId)!.fullName, sectionLabel: students.get(studentId)!.sectionLabel, count: v.yes + v.no, rate: participationRate(v.yes, v.no), reason: null }))
    .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0) || b.count - a.count || arabic(a.fullName, b.fullName))
    .slice(0, 5);

  return { total: args.total, negativeRecent, lowParticipation };
}
