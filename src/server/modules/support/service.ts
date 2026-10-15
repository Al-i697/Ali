// الخطط العلاجية والإثرائية: خطة لكل طالب في مقرر، بخط أساس للنسبة لحظة الإنشاء يُقارَن بالنسبة الحالية،
// وملاحظات متابعة مؤرَّخة، واقتراحات تلقائية من دفتر الدرجات (بلا إدخال يدوي للطلاب المتعثرين).
import { and, asc, desc, eq, inArray, lte, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { pickCurrentTerm } from '../../../shared/academic';
import type { SupportKind } from '../../../shared/constants';
import { todayISO } from '../../../shared/dates';
import type {
  AssignmentDto,
  CalendarItemDto,
  SupportNoteDto,
  SupportPlanDetailDto,
  SupportPlanDto,
  SupportSuggestionDto,
} from '../../../shared/dto';
import { round } from '../../../shared/gradebook';
import type { BulkSupportPlansInput, CreateSupportPlanInput, UpdateSupportPlanInput } from '../../../shared/schemas/support';
import { badRequest } from '../../lib/errors';
import { assignmentMap, listAssignmentInfos, requireAssignment, requireStudent, requireSupportNote, requireSupportPlan, requireTerm } from '../_shared/owned';
import { getGradebook } from '../assessments/service';
import { summarizeGradebook } from '../assessments/summary';

const { supportPlans, supportPlanNotes, students, enrollments, terms, academicYears } = schema;

type PlanRow = typeof supportPlans.$inferSelect;
type NoteRow = typeof supportPlanNotes.$inferSelect;

// ───────────── نسب الطلاب (مع ذاكرة مؤقتة داخل الطلب الواحد) ─────────────
type PercentCache = Map<string, Map<string, number | null>>;

function studentPercent(db: Db, ownerId: string, cache: PercentCache, assignmentId: string, termId: string, studentId: string): number | null {
  const key = `${assignmentId}|${termId}`;
  let m = cache.get(key);
  if (!m) {
    const summary = summarizeGradebook(getGradebook(db, ownerId, assignmentId, termId));
    m = new Map(summary.students.map((s) => [s.studentId, s.totals.percent === null ? null : round(s.totals.percent, 1)]));
    cache.set(key, m);
  }
  return m.get(studentId) ?? null;
}

/** الفصل «الحالي» لعام معيّن (أو الأقرب) */
function currentTermId(db: Db, ownerId: string, yearId: string, today: string): string | null {
  const rows = db.select().from(terms).where(and(eq(terms.ownerId, ownerId), eq(terms.yearId, yearId))).all();
  return pickCurrentTerm(rows, today)?.id ?? null;
}

// ───────────── التحويل إلى DTO ─────────────
function toNoteDto(n: NoteRow): SupportNoteDto {
  return { id: n.id, planId: n.planId, date: n.date, text: n.text, createdAt: n.createdAt };
}

function toDtos(db: Db, ownerId: string, rows: PlanRow[], today: string, cache: PercentCache): SupportPlanDto[] {
  if (!rows.length) return [];
  const studentNames = new Map(
    db
      .select({ id: students.id, name: students.fullName })
      .from(students)
      .where(and(eq(students.ownerId, ownerId), inArray(students.id, [...new Set(rows.map((r) => r.studentId))])))
      .all()
      .map((s) => [s.id, s.name]),
  );
  const noteStats = new Map(
    db
      .select({ planId: supportPlanNotes.planId, n: sql<number>`count(*)`, last: sql<string | null>`max(${supportPlanNotes.date})` })
      .from(supportPlanNotes)
      .where(and(eq(supportPlanNotes.ownerId, ownerId), inArray(supportPlanNotes.planId, rows.map((r) => r.id))))
      .groupBy(supportPlanNotes.planId)
      .all()
      .map((r) => [r.planId, r]),
  );
  const infos = assignmentMap(db, ownerId, rows.map((r) => r.assignmentId).filter((x): x is string => !!x));

  return rows.map((r) => {
    const asg = r.assignmentId ? infos.get(r.assignmentId) : undefined;
    let currentPercent: number | null = null;
    if (asg) {
      const termId = currentTermId(db, ownerId, asg.yearId, today) ?? r.termId;
      if (termId) currentPercent = studentPercent(db, ownerId, cache, asg.id, termId, r.studentId);
    }
    const ns = noteStats.get(r.id);
    return {
      id: r.id,
      studentId: r.studentId,
      studentName: studentNames.get(r.studentId) ?? '—',
      sectionLabel: asg?.sectionLabel ?? null,
      assignmentId: r.assignmentId,
      subjectName: asg?.subjectName ?? null,
      subjectColor: asg?.subjectColor ?? null,
      kind: r.kind,
      title: r.title,
      reason: r.reason,
      goal: r.goal,
      strategies: r.strategies,
      startDate: r.startDate,
      reviewDate: r.reviewDate,
      status: r.status,
      outcome: r.outcome,
      baselinePercent: r.baselinePercent,
      currentPercent,
      closedAt: r.closedAt,
      notesCount: ns?.n ?? 0,
      lastNoteDate: ns?.last ?? null,
      due: r.status === 'open' && !!r.reviewDate && r.reviewDate <= today,
      createdAt: r.createdAt,
    };
  });
}

// ───────────── القراءة ─────────────
export type PlanFilters = {
  studentId?: string;
  assignmentId?: string;
  sectionId?: string;
  kind?: SupportKind;
  status?: PlanRow['status'];
  view?: 'due';
  limit: number;
};

export function listPlans(db: Db, ownerId: string, f: PlanFilters, today: string = todayISO()): SupportPlanDto[] {
  const conds: (SQL | undefined)[] = [eq(supportPlans.ownerId, ownerId)];
  if (f.studentId) conds.push(eq(supportPlans.studentId, f.studentId));
  if (f.assignmentId) conds.push(eq(supportPlans.assignmentId, f.assignmentId));
  if (f.kind) conds.push(eq(supportPlans.kind, f.kind));
  if (f.view === 'due') {
    conds.push(eq(supportPlans.status, 'open'), lte(supportPlans.reviewDate, today));
  } else if (f.status) {
    conds.push(eq(supportPlans.status, f.status));
  }
  if (f.sectionId) {
    const ids = listAssignmentInfos(db, ownerId, { sectionId: f.sectionId }).map((a) => a.id);
    if (!ids.length) return [];
    conds.push(inArray(supportPlans.assignmentId, ids));
  }
  // المفتوحة أولًا، ثم الأقرب مراجعةً، ثم الأحدث
  const rows = db
    .select()
    .from(supportPlans)
    .where(and(...conds))
    .orderBy(
      asc(sql`case ${supportPlans.status} when 'open' then 0 else 1 end`),
      asc(sql`coalesce(${supportPlans.reviewDate}, '9999-12-31')`),
      desc(supportPlans.createdAt),
    )
    .limit(f.limit)
    .all();
  return toDtos(db, ownerId, rows, today, new Map());
}

export function getPlan(db: Db, ownerId: string, id: string, today: string = todayISO()): SupportPlanDetailDto {
  const row = requireSupportPlan(db, ownerId, id);
  const [dto] = toDtos(db, ownerId, [row], today, new Map());
  const notes = db
    .select()
    .from(supportPlanNotes)
    .where(and(eq(supportPlanNotes.ownerId, ownerId), eq(supportPlanNotes.planId, id)))
    .orderBy(desc(supportPlanNotes.date), desc(supportPlanNotes.createdAt))
    .all();
  return { ...dto!, notes: notes.map(toNoteDto) };
}

// ───────────── الكتابة ─────────────
/** الطالب مسجَّل في شعبة المقرر؟ (لا خطة لطالب خارج شعبة المقرر المحدد) */
function assertEnrolled(db: Db, ownerId: string, studentId: string, sectionId: string): void {
  const row = db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.studentId, studentId), eq(enrollments.sectionId, sectionId)))
    .get();
  if (!row) throw badRequest('الطالب غير مسجّل في شعبة هذا المقرر', 'NOT_ENROLLED');
}

type Baseline = { termId: string | null; percent: number | null };

function baselineFor(db: Db, ownerId: string, assignmentId: string, yearId: string, studentId: string, today: string, cache: PercentCache, termId?: string): Baseline {
  const tid = termId ?? currentTermId(db, ownerId, yearId, today);
  if (!tid) return { termId: null, percent: null };
  return { termId: tid, percent: studentPercent(db, ownerId, cache, assignmentId, tid, studentId) };
}

export function createPlan(db: Db, ownerId: string, input: CreateSupportPlanInput & { assignmentId: string }, today: string = todayISO()): SupportPlanDetailDto {
  requireStudent(db, ownerId, input.studentId);
  const asg = requireAssignment(db, ownerId, input.assignmentId);
  assertEnrolled(db, ownerId, input.studentId, asg.sectionId);
  const base = baselineFor(db, ownerId, asg.id, asg.yearId, input.studentId, today, new Map());
  const row = db
    .insert(supportPlans)
    .values({
      ownerId,
      studentId: input.studentId,
      assignmentId: asg.id,
      termId: base.termId,
      kind: input.kind,
      title: input.title,
      reason: input.reason ?? null,
      goal: input.goal,
      strategies: input.strategies ?? [],
      startDate: input.startDate,
      reviewDate: input.reviewDate ?? null,
      status: input.status ?? 'open',
      outcome: input.outcome ?? null,
      baselinePercent: base.percent,
      closedAt: input.status && input.status !== 'open' ? new Date().toISOString() : null,
    })
    .returning()
    .get();
  return getPlan(db, ownerId, row.id, today);
}

/** إنشاء خطط دفعة واحدة لطلاب مقترحين؛ يتخطى من لديه خطة مفتوحة من النوع نفسه في المقرر */
export function bulkCreate(db: Db, ownerId: string, input: BulkSupportPlansInput, today: string = todayISO()): { created: SupportPlanDto[]; skipped: number } {
  const asg = requireAssignment(db, ownerId, input.assignmentId);
  if (input.termId) {
    const t = requireTerm(db, ownerId, input.termId);
    if (t.yearId !== asg.yearId) throw badRequest('الفصل لا يتبع عام هذا المقرر');
  }
  const cache: PercentCache = new Map();
  const existing = new Set(
    db
      .select({ studentId: supportPlans.studentId })
      .from(supportPlans)
      .where(and(eq(supportPlans.ownerId, ownerId), eq(supportPlans.assignmentId, asg.id), eq(supportPlans.kind, input.kind), eq(supportPlans.status, 'open')))
      .all()
      .map((r) => r.studentId),
  );
  const ids = [...new Set(input.studentIds)];
  const title = input.title ?? (input.kind === 'remedial' ? `خطة علاجية — ${asg.subjectName}` : `خطة إثرائية — ${asg.subjectName}`);
  const goal = input.goal ?? (input.kind === 'remedial' ? 'رفع مستوى الطالب في المقرر إلى ما فوق حد الدعم' : 'تنمية قدرات الطالب المتميز بأنشطة إثرائية متقدمة');
  const startDate = input.startDate ?? today;

  return db.transaction((tx) => {
    const created: string[] = [];
    let skipped = 0;
    for (const sid of ids) {
      requireStudent(tx, ownerId, sid);
      assertEnrolled(tx, ownerId, sid, asg.sectionId);
      if (existing.has(sid)) {
        skipped++;
        continue;
      }
      const base = baselineFor(tx, ownerId, asg.id, asg.yearId, sid, today, cache, input.termId);
      const row = tx
        .insert(supportPlans)
        .values({
          ownerId,
          studentId: sid,
          assignmentId: asg.id,
          termId: base.termId,
          kind: input.kind,
          title,
          goal,
          strategies: input.strategies ?? [],
          startDate,
          reviewDate: input.reviewDate ?? null,
          baselinePercent: base.percent,
        })
        .returning({ id: supportPlans.id })
        .get();
      created.push(row.id);
    }
    const rows = created.length ? tx.select().from(supportPlans).where(inArray(supportPlans.id, created)).all() : [];
    return { created: toDtos(tx, ownerId, rows, today, cache), skipped };
  });
}

export function updatePlan(db: Db, ownerId: string, id: string, input: UpdateSupportPlanInput, today: string = todayISO()): SupportPlanDetailDto {
  const cur = requireSupportPlan(db, ownerId, id);
  const start = input.startDate ?? cur.startDate;
  const review = input.reviewDate === undefined ? cur.reviewDate : input.reviewDate;
  if (review && review < start) throw badRequest('تاريخ المراجعة يجب ألا يسبق تاريخ البدء', 'VALIDATION_ERROR', { reviewDate: 'تاريخ المراجعة يجب ألا يسبق تاريخ البدء' });

  const patch: Partial<typeof supportPlans.$inferInsert> = {};
  if (input.kind !== undefined) patch.kind = input.kind;
  if (input.title !== undefined) patch.title = input.title;
  if (input.reason !== undefined) patch.reason = input.reason;
  if (input.goal !== undefined) patch.goal = input.goal;
  if (input.strategies !== undefined) patch.strategies = input.strategies;
  if (input.startDate !== undefined) patch.startDate = input.startDate;
  if (input.reviewDate !== undefined) patch.reviewDate = input.reviewDate;
  if (input.outcome !== undefined) patch.outcome = input.outcome;
  if (input.status !== undefined && input.status !== cur.status) {
    patch.status = input.status;
    patch.closedAt = input.status === 'open' ? null : new Date().toISOString();
  }
  if (input.assignmentId !== undefined && input.assignmentId !== cur.assignmentId) {
    if (input.assignmentId === null) {
      patch.assignmentId = null;
    } else {
      const asg = requireAssignment(db, ownerId, input.assignmentId);
      assertEnrolled(db, ownerId, cur.studentId, asg.sectionId);
      patch.assignmentId = asg.id;
      // تغيّر المقرر ⇒ خط الأساس القديم لم يعد صالحًا للمقارنة
      const base = baselineFor(db, ownerId, asg.id, asg.yearId, cur.studentId, today, new Map());
      patch.termId = base.termId;
      patch.baselinePercent = base.percent;
    }
  }
  if (Object.keys(patch).length) db.update(supportPlans).set(patch).where(eq(supportPlans.id, id)).run();
  return getPlan(db, ownerId, id, today);
}

export function deletePlan(db: Db, ownerId: string, id: string): void {
  requireSupportPlan(db, ownerId, id);
  db.delete(supportPlans).where(and(eq(supportPlans.id, id), eq(supportPlans.ownerId, ownerId))).run();
}

// ───────────── ملاحظات المتابعة ─────────────
export function addNote(db: Db, ownerId: string, planId: string, input: { date: string; text: string }): SupportNoteDto {
  requireSupportPlan(db, ownerId, planId);
  const row = db.insert(supportPlanNotes).values({ ownerId, planId, date: input.date, text: input.text }).returning().get();
  return toNoteDto(row);
}

export function updateNote(db: Db, ownerId: string, planId: string, noteId: string, input: { date?: string; text?: string }): SupportNoteDto {
  requireSupportNote(db, ownerId, planId, noteId);
  const patch: Partial<typeof supportPlanNotes.$inferInsert> = {};
  if (input.date !== undefined) patch.date = input.date;
  if (input.text !== undefined) patch.text = input.text;
  const row = Object.keys(patch).length
    ? db.update(supportPlanNotes).set(patch).where(eq(supportPlanNotes.id, noteId)).returning().get()
    : requireSupportNote(db, ownerId, planId, noteId);
  return toNoteDto(row);
}

export function deleteNote(db: Db, ownerId: string, planId: string, noteId: string): void {
  requireSupportNote(db, ownerId, planId, noteId);
  db.delete(supportPlanNotes).where(eq(supportPlanNotes.id, noteId)).run();
}

// ───────────── الاقتراحات التلقائية من دفتر الدرجات ─────────────
/** طلاب دون حد العلاج (أو من فوق حد الإثراء) ممن لا خطة مفتوحة لهم من النوع نفسه في المقرر */
export function suggestions(db: Db, ownerId: string, q: { assignmentId?: string; termId?: string }, today: string = todayISO()): SupportSuggestionDto[] {
  let infos: AssignmentDto[];
  if (q.assignmentId) {
    infos = [requireAssignment(db, ownerId, q.assignmentId)];
  } else {
    // بلا تحديد مقرر: مقررات العام الحالي فقط (الأعوام القديمة لا تُقترح لها خطط)
    const cur = db.select({ id: academicYears.id }).from(academicYears).where(and(eq(academicYears.ownerId, ownerId), eq(academicYears.isCurrent, true))).get();
    infos = cur ? listAssignmentInfos(db, ownerId, { yearId: cur.id }) : [];
  }
  const out: SupportSuggestionDto[] = [];
  for (const asg of infos) {
    const termId = q.termId ?? currentTermId(db, ownerId, asg.yearId, today);
    if (!termId) continue;
    const open = db
      .select({ studentId: supportPlans.studentId, kind: supportPlans.kind })
      .from(supportPlans)
      .where(and(eq(supportPlans.ownerId, ownerId), eq(supportPlans.assignmentId, asg.id), eq(supportPlans.status, 'open')))
      .all();
    const has = new Set(open.map((o) => `${o.studentId}|${o.kind}`));
    const summary = summarizeGradebook(getGradebook(db, ownerId, asg.id, termId));
    for (const s of summary.students) {
      if (s.totals.percent === null) continue;
      const kind: SupportKind | null = s.flag === 'remedial' ? 'remedial' : s.flag === 'enrichment' ? 'enrichment' : null;
      if (!kind || has.has(`${s.studentId}|${kind}`)) continue;
      out.push({
        studentId: s.studentId,
        fullName: s.fullName,
        assignmentId: asg.id,
        sectionLabel: asg.sectionLabel,
        subjectName: asg.subjectName,
        subjectColor: asg.subjectColor,
        termId,
        percent: round(s.totals.percent, 1),
        kind,
      });
    }
  }
  return out.sort((a, b) => (a.kind === b.kind ? a.percent - b.percent : a.kind === 'remedial' ? -1 : 1));
}

// ───────────── تكامل مع لوحة التحكم والتقويم ─────────────
export function dashboardCounts(db: Db, ownerId: string, today: string): { open: number; due: number } {
  const row = db
    .select({
      open: sql<number>`count(*)`,
      due: sql<number>`coalesce(sum(case when ${supportPlans.reviewDate} is not null and ${supportPlans.reviewDate} <= ${today} then 1 else 0 end), 0)`,
    })
    .from(supportPlans)
    .where(and(eq(supportPlans.ownerId, ownerId), eq(supportPlans.status, 'open')))
    .get();
  return { open: row?.open ?? 0, due: row?.due ?? 0 };
}

/** مواعيد مراجعة الخطط المفتوحة ضمن نطاق تاريخ — تظهر في التقويم الدراسي */
export function calendarItems(db: Db, ownerId: string, from: string, to: string): CalendarItemDto[] {
  const rows = db
    .select()
    .from(supportPlans)
    .where(and(eq(supportPlans.ownerId, ownerId), eq(supportPlans.status, 'open'), sql`${supportPlans.reviewDate} >= ${from}`, sql`${supportPlans.reviewDate} <= ${to}`))
    .all();
  if (!rows.length) return [];
  const names = new Map(
    db.select({ id: students.id, name: students.fullName }).from(students).where(and(eq(students.ownerId, ownerId), inArray(students.id, [...new Set(rows.map((r) => r.studentId))]))).all().map((s) => [s.id, s.name]),
  );
  return rows.map((r) => ({
    id: `support-${r.id}`,
    type: 'support' as const,
    date: r.reviewDate!,
    time: null,
    title: `مراجعة خطة ${r.kind === 'remedial' ? 'علاجية' : 'إثرائية'}: ${names.get(r.studentId) ?? ''}`,
    subtitle: r.title,
    tone: r.kind === 'remedial' ? 'warn' : 'info',
    done: false,
    href: `/support/${r.id}`,
  }));
}
