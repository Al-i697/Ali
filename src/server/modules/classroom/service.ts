// إدارة الصف: يسجّل المعلم أثناء الحصة مشاركة كل طالب (شارك / لم يشارك) وسلوكه (إيجابي / غير حسن) وملاحظاته بنقرة،
// فيجمع النظام ما سُجّل على كل طالب في تقرير كامل. الحصة = (مقرر × تاريخ × رقم حصة اختياري).
//  • المشاركة عدّاد بالحالة المطلوبة (لم يُسجَّل / لم يشارك / شارك n) فلا يفسد تكرار الطلب العدّ.
//  • السلوك والملاحظات تسجيلات مستقلة بسبب مختصر وتفاصيل اختيارية.
//  • هنا الجلب والتحقق من الملكية والكتابة فقط؛ تجميع الأرقام في الشاشات والتقارير بدوال نقية في
//    src/shared/classroom.ts وclassroom-views.ts (تستعملها المعاينة التفاعلية كذلك فتتطابق الأرقام).
import { and, asc, eq, gte, inArray, isNull, lte, or, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { sectionLabel } from '../../../shared/constants';
import { addDays, timeToMinutes } from '../../../shared/dates';
import type {
  AssignmentDto,
  ClassDashboardDto,
  ClassOverviewDto,
  ClassRecordDto,
  ClassSessionDto,
  ClassSessionStudentDto,
  ClassSlotDto,
  ClassStudentReportDto,
  ClassSummaryDto,
} from '../../../shared/dto';
import type { ParticipationEntry, SessionRef } from '../../../shared/classroom';
import {
  buildClassDashboard,
  buildOverview,
  buildSession,
  buildSessionStudents,
  buildStudentReport,
  buildSummary,
  groupRate,
  makeMetaResolver,
  recordedToday,
  type ClassRows,
  type LessonRef,
  type MetaResolver,
  type RosterEntry,
  type SlotInput,
} from '../../../shared/classroom-views';
import type { CreateClassRecordInput, FillRestInput, SetParticipationInput, UpdateClassRecordInput } from '../../../shared/schemas/classroom';
import { badRequest } from '../../lib/errors';
import { assignmentMap, listAssignmentInfos, requireAssignment, requireClassRecord, requireSection, requireStudent } from '../_shared/owned';
import { getSettings } from '../settings/service';
import { currentYearId, getStudentDto } from '../students/service';

const { classParticipation, classRecords, enrollments, students, lessonPlans, timetableSlots, academicYears, sections } = schema;

type PartRow = typeof classParticipation.$inferSelect;
type RecRow = typeof classRecords.$inferSelect;

// ───────────── تحويل الصفوف ─────────────
/** الحصة غير المحددة تُخزَّن 0 (انظر مخطط class_participation) وتظهر في الواجهة null */
const periodDto = (p: number): number | null => (p === 0 ? null : p);
const periodDb = (p: number | null | undefined): number => p ?? 0;

const toEntry = (r: PartRow): ParticipationEntry => ({ studentId: r.studentId, assignmentId: r.assignmentId, date: r.date, period: periodDto(r.period), count: r.count });

const toRecord = (r: RecRow): ClassRecordDto => ({
  id: r.id,
  studentId: r.studentId,
  assignmentId: r.assignmentId,
  date: r.date,
  period: periodDto(r.period),
  kind: r.kind,
  reason: r.reason,
  note: r.note,
  createdAt: r.createdAt,
});

const toRows = (part: readonly PartRow[], recs: readonly RecRow[]): ClassRows => ({ participation: part.map(toEntry), records: recs.map(toRecord) });

/** السجل وثيقة: لا تُدوَّن حصة لم تحن بعد */
function assertNotFuture(date: string, today: string): void {
  if (date > today) throw badRequest('لا يمكن التسجيل لحصة تاريخها لم يحن بعد. اختر تاريخ اليوم أو ما قبله.', 'FUTURE_DATE', { date: 'تاريخ مستقبلي' });
}

// ───────────── طلاب الشعبة ─────────────
type RosterRow = { rollNo: number; student: typeof students.$inferSelect };

const toRoster = (r: RosterRow): RosterEntry => ({ studentId: r.student.id, rollNo: r.rollNo, fullName: r.student.fullName, gender: r.student.gender });

/** طلاب الشعبة المقيَّدون على مقاعد الدراسة، بترتيب القائمة (المنقولون والمنسحبون لا يُسجَّل عليهم) */
function activeRoster(db: Db, ownerId: string, sectionId: string): RosterRow[] {
  return db
    .select({ rollNo: enrollments.rollNo, student: students })
    .from(enrollments)
    .innerJoin(students, eq(students.id, enrollments.studentId))
    .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.sectionId, sectionId), eq(students.status, 'active')))
    .orderBy(asc(enrollments.rollNo))
    .all();
}

/** يتحقق أن الطالب مقيَّد في شعبة هذا المقرر وعلى مقاعد الدراسة، فلا يُسجَّل عليه ما ليس من حصته */
function requireRostered(db: Db, ownerId: string, asg: AssignmentDto, studentId: string): RosterRow {
  const student = requireStudent(db, ownerId, studentId);
  const enr = db.select({ rollNo: enrollments.rollNo }).from(enrollments).where(and(eq(enrollments.studentId, studentId), eq(enrollments.sectionId, asg.sectionId))).get();
  if (!enr) throw badRequest('الطالب غير مسجّل في شعبة هذه الحصة.', 'NOT_IN_SECTION', { studentId: 'ليس في الشعبة' });
  if (student.status !== 'active') throw badRequest('الطالب غير مقيَّد على مقاعد الدراسة (منقول أو منسحب).', 'STUDENT_INACTIVE', { studentId: 'غير مقيَّد' });
  return { rollNo: enr.rollNo, student };
}

// ───────────── جلب الصفوف ─────────────
type Range = { from?: string; to?: string };

function rangeConds(t: typeof classParticipation | typeof classRecords, r: Range): SQL[] {
  const c: SQL[] = [];
  if (r.from) c.push(gte(t.date, r.from));
  if (r.to) c.push(lte(t.date, r.to));
  return c;
}

/** صفوف مقرر (أو مقررات) لطلاب محددين ضمن نطاق تاريخ */
function fetchRows(db: Db, ownerId: string, f: { assignmentIds?: readonly string[]; studentIds: readonly string[] } & Range): ClassRows {
  if (f.studentIds.length === 0 || (f.assignmentIds && f.assignmentIds.length === 0)) return { participation: [], records: [] };
  const part = db
    .select()
    .from(classParticipation)
    .where(and(eq(classParticipation.ownerId, ownerId), ...(f.assignmentIds ? [inArray(classParticipation.assignmentId, [...f.assignmentIds])] : []), inArray(classParticipation.studentId, [...f.studentIds]), ...rangeConds(classParticipation, f)))
    .all();
  const recs = db
    .select()
    .from(classRecords)
    .where(and(eq(classRecords.ownerId, ownerId), ...(f.assignmentIds ? [inArray(classRecords.assignmentId, [...f.assignmentIds])] : []), inArray(classRecords.studentId, [...f.studentIds]), ...rangeConds(classRecords, f)))
    .all();
  return toRows(part, recs);
}

/** تحضيرات مقررات ضمن نطاق تواريخ — بنطاق لا بقائمة `IN` طويلة (عدد حصص العام قد يتجاوز حد متغيرات SQLite) */
function fetchLessons(db: Db, ownerId: string, assignmentIds: readonly string[], from: string, to: string): LessonRef[] {
  if (assignmentIds.length === 0 || !from || !to) return [];
  return db
    .select({ id: lessonPlans.id, assignmentId: lessonPlans.assignmentId, date: lessonPlans.date, period: lessonPlans.period, title: lessonPlans.title })
    .from(lessonPlans)
    .where(and(eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.isTemplate, false), inArray(lessonPlans.assignmentId, [...assignmentIds]), gte(lessonPlans.date, from), lte(lessonPlans.date, to)))
    .all();
}

/** وصف الحصص (الشعبة والمادة وعنوان الدرس) لمجموعة مراجع دفعة واحدة */
function metaFor(db: Db, ownerId: string, refs: readonly SessionRef[]): MetaResolver {
  const asgIds = [...new Set(refs.flatMap((r) => (r.assignmentId ? [r.assignmentId] : [])))];
  const dates = refs.map((r) => r.date).filter(Boolean).sort();
  return makeMetaResolver(assignmentMap(db, ownerId, asgIds), fetchLessons(db, ownerId, asgIds, dates[0] ?? '', dates.at(-1) ?? ''));
}

function uniqueRefs(rows: ClassRows): SessionRef[] {
  const m = new Map<string, SessionRef>();
  for (const x of [...rows.participation, ...rows.records]) m.set(`${x.assignmentId}|${x.date}|${x.period}`, { assignmentId: x.assignmentId, date: x.date, period: x.period });
  return [...m.values()];
}

// ───────────── شاشة الحصة ─────────────
export type SessionQuery = { assignmentId: string; date: string; period?: number | null };

export function getSession(db: Db, ownerId: string, q: SessionQuery): ClassSessionDto {
  const asg = requireAssignment(db, ownerId, q.assignmentId);
  const roster = activeRoster(db, ownerId, asg.sectionId);
  return buildSession({
    assignment: asg,
    date: q.date,
    period: q.period ?? null,
    roster: roster.map(toRoster),
    rows: fetchRows(db, ownerId, { assignmentIds: [asg.id], studentIds: roster.map((r) => r.student.id), to: q.date }),
    lessons: fetchLessons(db, ownerId, [asg.id], q.date, q.date),
  });
}

function oneStudentRow(db: Db, ownerId: string, asg: AssignmentDto, date: string, period: number, row: RosterRow): ClassSessionStudentDto {
  const rows = fetchRows(db, ownerId, { assignmentIds: [asg.id], studentIds: [row.student.id], to: date });
  return buildSessionStudents({ assignmentId: asg.id, date, period: periodDto(period) }, [toRoster(row)], rows)[0]!;
}

// ───────────── الكتابة ─────────────
/** يضبط مشاركة طالب في حصة بالحالة المطلوبة (null = إلغاء التسجيل، 0 = لم يشارك، n = شارك n مرة) */
export function setParticipation(db: Db, ownerId: string, input: SetParticipationInput, today: string): ClassSessionStudentDto {
  assertNotFuture(input.date, today);
  const asg = requireAssignment(db, ownerId, input.assignmentId);
  const row = requireRostered(db, ownerId, asg, input.studentId);
  const period = periodDb(input.period);

  db.transaction((tx) => {
    const key = and(
      eq(classParticipation.ownerId, ownerId),
      eq(classParticipation.studentId, input.studentId),
      eq(classParticipation.assignmentId, asg.id),
      eq(classParticipation.date, input.date),
      eq(classParticipation.period, period),
    );
    const cur = tx.select().from(classParticipation).where(key).get();
    if (input.count === null) {
      if (cur) tx.delete(classParticipation).where(eq(classParticipation.id, cur.id)).run();
    } else if (cur) {
      if (cur.count !== input.count) tx.update(classParticipation).set({ count: input.count }).where(eq(classParticipation.id, cur.id)).run();
    } else {
      tx.insert(classParticipation).values({ ownerId, studentId: input.studentId, assignmentId: asg.id, date: input.date, period, count: input.count }).run();
    }
  });
  return oneStudentRow(db, ownerId, asg, input.date, period, row);
}

/** «لم يشارك» لكل طالب في الحصة لم تُسجَّل مشاركته بعد (لا يمسّ من شارك ولا من سُجّل له) — في معاملة واحدة */
export function fillRest(db: Db, ownerId: string, input: FillRestInput, today: string): { added: number; session: ClassSessionDto } {
  assertNotFuture(input.date, today);
  const asg = requireAssignment(db, ownerId, input.assignmentId);
  const period = periodDb(input.period);
  const roster = activeRoster(db, ownerId, asg.sectionId);
  let added = 0;
  db.transaction((tx) => {
    const ids = roster.map((r) => r.student.id);
    const done = new Set(
      ids.length
        ? tx
            .select({ studentId: classParticipation.studentId })
            .from(classParticipation)
            .where(and(eq(classParticipation.ownerId, ownerId), eq(classParticipation.assignmentId, asg.id), eq(classParticipation.date, input.date), eq(classParticipation.period, period), inArray(classParticipation.studentId, ids)))
            .all()
            .map((r) => r.studentId)
        : [],
    );
    for (const id of ids) {
      if (done.has(id)) continue;
      tx.insert(classParticipation).values({ ownerId, studentId: id, assignmentId: asg.id, date: input.date, period, count: 0 }).run();
      added++;
    }
  });
  return { added, session: getSession(db, ownerId, { assignmentId: asg.id, date: input.date, period: periodDto(period) }) };
}

/** يمسح كل تسجيلات الحصة (مشاركة وسلوك) — للتراجع عن حصة فُتحت أو سُجِّلت خطأً */
export function clearSession(db: Db, ownerId: string, q: SessionQuery): { participation: number; records: number } {
  const asg = requireAssignment(db, ownerId, q.assignmentId);
  const period = periodDb(q.period);
  let participation = 0;
  let records = 0;
  db.transaction((tx) => {
    participation = tx
      .delete(classParticipation)
      .where(and(eq(classParticipation.ownerId, ownerId), eq(classParticipation.assignmentId, asg.id), eq(classParticipation.date, q.date), eq(classParticipation.period, period)))
      .run().changes;
    records = tx
      .delete(classRecords)
      .where(and(eq(classRecords.ownerId, ownerId), eq(classRecords.assignmentId, asg.id), eq(classRecords.date, q.date), eq(classRecords.period, period)))
      .run().changes;
  });
  return { participation, records };
}

export function addRecord(db: Db, ownerId: string, input: CreateClassRecordInput, today: string): ClassRecordDto {
  assertNotFuture(input.date, today);
  const asg = requireAssignment(db, ownerId, input.assignmentId);
  requireRostered(db, ownerId, asg, input.studentId);
  const row = db
    .insert(classRecords)
    .values({
      ownerId,
      studentId: input.studentId,
      assignmentId: asg.id,
      date: input.date,
      period: periodDb(input.period),
      kind: input.kind,
      reason: input.reason ?? null,
      note: input.note ?? null,
    })
    .returning()
    .get();
  return toRecord(row);
}

export function updateRecord(db: Db, ownerId: string, id: string, input: UpdateClassRecordInput): ClassRecordDto {
  const cur = requireClassRecord(db, ownerId, id);
  const reason = input.reason !== undefined ? input.reason : cur.reason;
  const note = input.note !== undefined ? input.note : cur.note;
  // الفحص على الحالة بعد الدمج: حذف السبب جائز ما دامت الملاحظة باقية، لا العكس
  if (!reason && !note) throw badRequest('اختر سببًا أو اكتب ملاحظة', 'VALIDATION_ERROR', { reason: 'اختر سببًا أو اكتب ملاحظة' });
  const patch: Partial<typeof classRecords.$inferInsert> = { reason: reason || null, note: note || null };
  if (input.kind !== undefined) patch.kind = input.kind;
  return toRecord(db.update(classRecords).set(patch).where(eq(classRecords.id, id)).returning().get());
}

export function deleteRecord(db: Db, ownerId: string, id: string): ClassRecordDto {
  const cur = requireClassRecord(db, ownerId, id);
  db.delete(classRecords).where(and(eq(classRecords.id, id), eq(classRecords.ownerId, ownerId))).run();
  return toRecord(cur);
}

// ───────────── نظرة عامة: حصص اليوم وآخر الحصص ─────────────
function slotState(times: { start: string; end: string } | undefined, nowMin: number): ClassSlotDto['state'] {
  if (!times) return 'unknown';
  const start = timeToMinutes(times.start);
  const end = timeToMinutes(times.end);
  return nowMin >= end ? 'past' : nowMin >= start ? 'current' : 'upcoming';
}

/** شرط يطابق حصصًا محددة (مقرر + تاريخ + رقم) — يتحمّل المقرر المحذوف (NULL) */
function sessionsCond(t: typeof classParticipation | typeof classRecords, ownerId: string, refs: readonly SessionRef[]): SQL | undefined {
  if (refs.length === 0) return undefined;
  const any = or(...refs.map((r) => and(r.assignmentId ? eq(t.assignmentId, r.assignmentId) : isNull(t.assignmentId), eq(t.date, r.date), eq(t.period, periodDb(r.period)))));
  return and(eq(t.ownerId, ownerId), any);
}

const countAll = (db: Db, ownerId: string): number =>
  (db.select({ c: sql<number>`count(*)` }).from(classParticipation).where(eq(classParticipation.ownerId, ownerId)).get()?.c ?? 0) +
  (db.select({ c: sql<number>`count(*)` }).from(classRecords).where(eq(classRecords.ownerId, ownerId)).get()?.c ?? 0);

export function getOverview(db: Db, ownerId: string, now: { date: string; time: string; weekday: number }, recent = 12): ClassOverviewDto {
  const year = db.select().from(academicYears).where(and(eq(academicYears.ownerId, ownerId), eq(academicYears.isCurrent, true))).get();
  const times = new Map(getSettings(db, ownerId).schedule.periods.map((p) => [p.n, p]));
  const nowMin = timeToMinutes(now.time);

  // آخر الحصص: مفاتيحها أولًا (UNION يزيل التكرار) ثم صفوفها وحدها
  const keys = db.all<{ assignment_id: string | null; date: string; period: number }>(sql`
    select assignment_id, date, period from (
      select assignment_id, date, period from class_participation where owner_id = ${ownerId}
      union
      select assignment_id, date, period from class_records where owner_id = ${ownerId}
    ) order by date desc, period desc limit ${recent}`);
  const recentRefs: SessionRef[] = keys.map((k) => ({ assignmentId: k.assignment_id, date: k.date, period: periodDto(k.period) }));

  const daySlots = year
    ? db.select().from(timetableSlots).where(and(eq(timetableSlots.ownerId, ownerId), eq(timetableSlots.yearId, year.id), eq(timetableSlots.weekday, now.weekday))).orderBy(asc(timetableSlots.period)).all()
    : [];
  // حصة اليوم قد تكون سُجّلت بلا رقم حصة (من «حصة أخرى»): نبحث عن الاثنتين
  const slotRefs: SessionRef[] = daySlots.flatMap((s) => [
    { assignmentId: s.assignmentId, date: now.date, period: s.period },
    { assignmentId: s.assignmentId, date: now.date, period: null },
  ]);
  const wanted = [...recentRefs, ...slotRefs];
  const rows = wanted.length
    ? toRows(db.select().from(classParticipation).where(sessionsCond(classParticipation, ownerId, wanted)).all(), db.select().from(classRecords).where(sessionsCond(classRecords, ownerId, wanted)).all())
    : { participation: [], records: [] };

  const infos = assignmentMap(db, ownerId, daySlots.map((s) => s.assignmentId));
  const counts = new Map<string, number>();
  for (const id of new Set([...infos.values()].map((a) => a.sectionId))) counts.set(id, activeRoster(db, ownerId, id).length);
  const slots: SlotInput[] = daySlots.flatMap((s) => {
    const a = infos.get(s.assignmentId);
    if (!a) return [];
    return [{ slotId: s.id, period: s.period, start: times.get(s.period)?.start ?? null, end: times.get(s.period)?.end ?? null, room: s.room, assignment: a, studentCount: counts.get(a.sectionId) ?? 0, state: slotState(times.get(s.period), nowMin) }];
  });

  return buildOverview({ today: now.date, weekday: now.weekday, slots, recentRefs, rows, meta: metaFor(db, ownerId, wanted), total: countAll(db, ownerId) });
}

// ───────────── ملخص الشعبة ─────────────
export type SummaryQuery = { assignmentId?: string; sectionId?: string; from?: string; to?: string };

export function getSummary(db: Db, ownerId: string, q: SummaryQuery, recentLimit = 10): ClassSummaryDto {
  let asg: AssignmentDto | null = null;
  if (q.assignmentId) asg = requireAssignment(db, ownerId, q.assignmentId);
  const section = requireSection(db, ownerId, asg ? asg.sectionId : q.sectionId!);
  const roster = activeRoster(db, ownerId, section.id);
  const asgIds = asg ? [asg.id] : listAssignmentInfos(db, ownerId, { sectionId: section.id }).map((a) => a.id);
  const rows = fetchRows(db, ownerId, { assignmentIds: asgIds, studentIds: roster.map((r) => r.student.id), from: q.from, to: q.to });
  return buildSummary({
    section: { id: section.id, label: sectionLabel(section.gradeLevel, section.name) },
    assignment: asg,
    from: q.from,
    to: q.to,
    roster: roster.map(toRoster),
    rows,
    meta: metaFor(db, ownerId, uniqueRefs(rows)),
    recentLimit,
  });
}

// ───────────── تقرير الطالب الكامل ─────────────
export type StudentReportQuery = { assignmentId?: string; from?: string; to?: string; limit: number };

/** نسبة مشاركة شعبة كاملة في الفترة والمقرر نفسيهما — للمقارنة في تقرير الطالب */
function sectionRateOf(db: Db, ownerId: string, sectionId: string, assignmentId: string | undefined, r: Range): number | null {
  const ids = activeRoster(db, ownerId, sectionId).map((x) => x.student.id);
  const asgIds = assignmentId ? [assignmentId] : listAssignmentInfos(db, ownerId, { sectionId }).map((a) => a.id);
  if (ids.length === 0 || asgIds.length === 0) return null;
  const part = db
    .select()
    .from(classParticipation)
    .where(and(eq(classParticipation.ownerId, ownerId), inArray(classParticipation.assignmentId, asgIds), inArray(classParticipation.studentId, ids), ...rangeConds(classParticipation, r)))
    .all();
  return groupRate(part.map(toEntry));
}

export function getStudentReport(db: Db, ownerId: string, studentId: string, q: StudentReportQuery): ClassStudentReportDto {
  requireStudent(db, ownerId, studentId);
  const student = getStudentDto(db, ownerId, studentId, currentYearId(db, ownerId));
  if (q.assignmentId) requireAssignment(db, ownerId, q.assignmentId);
  // كل مقررات الطالب في الفترة (لتصفية التقرير)؛ التصفية بالمقرر داخل buildStudentReport
  const rows = fetchRows(db, ownerId, { studentIds: [studentId], from: q.from, to: q.to });
  return buildStudentReport({
    student,
    assignmentId: q.assignmentId ?? null,
    from: q.from,
    to: q.to,
    limit: q.limit,
    rows,
    meta: metaFor(db, ownerId, uniqueRefs(rows)),
    sectionRate: student.enrollment ? sectionRateOf(db, ownerId, student.enrollment.sectionId, q.assignmentId, q) : null,
  });
}

// ───────────── لوحة التحكم ─────────────
/** كم طالبًا سُجّل له شيء في كل حصة اليوم، بمفتاح (مقرر|حصة) — حصة بلا رقم تُنسب لأي حصة جدول لمقررها */
export function todayRecorded(db: Db, ownerId: string, date: string): Map<string, number> {
  const part = db.select().from(classParticipation).where(and(eq(classParticipation.ownerId, ownerId), eq(classParticipation.date, date))).all();
  const recs = db.select().from(classRecords).where(and(eq(classRecords.ownerId, ownerId), eq(classRecords.date, date))).all();
  return recordedToday(toRows(part, recs), date);
}

export function dashboardClass(db: Db, ownerId: string, today: string): ClassDashboardDto {
  const total = countAll(db, ownerId);
  if (total === 0) return { total: 0, negativeRecent: [], lowParticipation: [] };

  // طلاب العام الحالي المقيَّدون فقط، بشعبهم
  const yearId = currentYearId(db, ownerId);
  const enrolled = yearId
    ? db
        .select({ id: students.id, name: students.fullName, gradeLevel: sections.gradeLevel, section: sections.name })
        .from(enrollments)
        .innerJoin(students, eq(students.id, enrollments.studentId))
        .innerJoin(sections, eq(sections.id, enrollments.sectionId))
        .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.yearId, yearId), eq(students.status, 'active')))
        .all()
    : [];
  const studentMap = new Map(enrolled.map((e) => [e.id, { fullName: e.name, sectionLabel: sectionLabel(e.gradeLevel, e.section) }]));

  // النافذتان (14 و30 يومًا) تُجلَبان بمدى واحد هو الأوسع ثم تقصّها الدالة النقية بنفسها
  const since = addDays(today, -30);
  const rows = toRows(
    db.select().from(classParticipation).where(and(eq(classParticipation.ownerId, ownerId), gte(classParticipation.date, since), lte(classParticipation.date, today))).all(),
    db.select().from(classRecords).where(and(eq(classRecords.ownerId, ownerId), eq(classRecords.kind, 'negative'), gte(classRecords.date, since), lte(classRecords.date, today))).all(),
  );
  return buildClassDashboard({ today, total, students: studentMap, rows });
}
