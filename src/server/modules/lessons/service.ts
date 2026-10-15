import { and, asc, count, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { normalizeArabic } from '../../../shared/arabic';
import { pickCurrentTerm } from '../../../shared/academic';
import type { AssignmentDto, LessonDto, LessonSummaryDto, LessonsPage } from '../../../shared/dto';
import type { CopyLessonInput, CreateLessonInput, UpdateLessonInput } from '../../../shared/schemas/lessons';
import { badRequest } from '../../lib/errors';
import { likeContains } from '../../lib/sql';
import { assignmentMap, listAssignmentInfos, requireAssignment, requireLesson, requireTerm } from '../_shared/owned';

const { lessonPlans, assignments, sections, terms } = schema;

type LessonRow = typeof lessonPlans.$inferSelect;

const searchTextOf = (title: string, unit?: string | null, number?: string | null) =>
  normalizeArabic(`${title} ${unit ?? ''} ${number ?? ''}`);

function toSummary(l: LessonRow, a: AssignmentDto): LessonSummaryDto {
  return {
    id: l.id,
    assignmentId: l.assignmentId,
    sectionLabel: a.sectionLabel,
    subjectName: a.subjectName,
    subjectColor: a.subjectColor,
    gradeLevel: a.gradeLevel,
    date: l.date,
    period: l.period,
    title: l.title,
    unitName: l.unitName,
    status: l.status,
    isTemplate: l.isTemplate,
    updatedAt: l.updatedAt,
  };
}

function toDto(l: LessonRow, a: AssignmentDto): LessonDto {
  return {
    ...toSummary(l, a),
    termId: l.termId,
    lessonNumber: l.lessonNumber,
    durationMinutes: l.durationMinutes,
    outcomes: l.outcomes,
    objectives: l.objectives,
    concepts: l.concepts,
    strategies: l.strategies,
    resources: l.resources,
    activities: l.activities,
    assessmentMethods: l.assessmentMethods,
    assessmentNotes: l.assessmentNotes,
    homework: l.homework,
    supportPlan: l.supportPlan,
    enrichmentPlan: l.enrichmentPlan,
    notes: l.notes,
    reflection: l.reflection,
    sourceLessonId: l.sourceLessonId,
    createdAt: l.createdAt,
  };
}

export type LessonFilter = {
  from?: string;
  to?: string;
  assignmentId?: string;
  sectionId?: string;
  subjectId?: string;
  termId?: string;
  status?: LessonRow['status'];
  q?: string;
  templates?: boolean;
  limit: number;
  offset: number;
};

export function listLessons(db: Db, ownerId: string, f: LessonFilter): LessonsPage {
  const conds: (SQL | undefined)[] = [eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.isTemplate, f.templates ?? false)];
  if (f.from) conds.push(gte(lessonPlans.date, f.from));
  if (f.to) conds.push(lte(lessonPlans.date, f.to));
  if (f.assignmentId) conds.push(eq(lessonPlans.assignmentId, f.assignmentId));
  if (f.sectionId) conds.push(eq(assignments.sectionId, f.sectionId));
  if (f.subjectId) conds.push(eq(assignments.subjectId, f.subjectId));
  if (f.termId) conds.push(eq(lessonPlans.termId, f.termId));
  if (f.status) conds.push(eq(lessonPlans.status, f.status));
  if (f.q) {
    for (const token of normalizeArabic(f.q).split(' ').filter(Boolean).slice(0, 5)) {
      conds.push(likeContains(lessonPlans.searchText, token));
    }
  }
  const where = and(...conds);

  const rows = db
    .select({ l: lessonPlans })
    .from(lessonPlans)
    .innerJoin(assignments, eq(assignments.id, lessonPlans.assignmentId))
    .where(where)
    .orderBy(desc(lessonPlans.date), asc(lessonPlans.period))
    .limit(f.limit)
    .offset(f.offset)
    .all();
  const total =
    db
      .select({ c: count() })
      .from(lessonPlans)
      .innerJoin(assignments, eq(assignments.id, lessonPlans.assignmentId))
      .where(where)
      .get()?.c ?? 0;
  const infos = assignmentMap(db, ownerId, rows.map((r) => r.l.assignmentId));
  return {
    total,
    items: rows.flatMap((r) => {
      const a = infos.get(r.l.assignmentId);
      return a ? [toSummary(r.l, a)] : [];
    }),
  };
}

export function getLesson(db: Db, ownerId: string, id: string): LessonDto {
  const l = requireLesson(db, ownerId, id);
  return toDto(l, requireAssignment(db, ownerId, l.assignmentId));
}

/** الفصل الدراسي المناسب لتاريخ ضمن عام المقرر (إن لم يحدّده المعلم) */
function termForDate(db: Db, ownerId: string, yearId: string, date: string): string | null {
  const list = db.select().from(terms).where(and(eq(terms.ownerId, ownerId), eq(terms.yearId, yearId))).all();
  const inside = list.find((t) => date >= t.startDate && date <= t.endDate);
  return (inside ?? pickCurrentTerm(list, date))?.id ?? null;
}

export function createLesson(db: Db, ownerId: string, input: CreateLessonInput): LessonDto {
  const a = requireAssignment(db, ownerId, input.assignmentId);
  let termId = input.termId ?? null;
  if (termId) {
    if (requireTerm(db, ownerId, termId).yearId !== a.yearId) throw badRequest('الفصل لا يتبع عام هذه الشعبة', 'TERM_MISMATCH');
  } else termId = termForDate(db, ownerId, a.yearId, input.date);

  const row = db
    .insert(lessonPlans)
    .values({
      ownerId,
      assignmentId: input.assignmentId,
      termId,
      date: input.date,
      period: input.period ?? null,
      title: input.title,
      unitName: input.unitName ?? null,
      lessonNumber: input.lessonNumber ?? null,
      searchText: searchTextOf(input.title, input.unitName, input.lessonNumber),
      durationMinutes: input.durationMinutes ?? null,
      outcomes: input.outcomes ?? [],
      objectives: input.objectives ?? [],
      concepts: input.concepts ?? [],
      strategies: input.strategies ?? [],
      resources: input.resources ?? [],
      activities: (input.activities ?? []).map((x, i) => ({ ...x, id: x.id ?? `a${i + 1}` })),
      assessmentMethods: input.assessmentMethods ?? [],
      assessmentNotes: input.assessmentNotes ?? null,
      homework: input.homework ?? null,
      supportPlan: input.supportPlan ?? null,
      enrichmentPlan: input.enrichmentPlan ?? null,
      notes: input.notes ?? null,
      reflection: input.reflection ?? null,
      status: input.status ?? 'draft',
      isTemplate: input.isTemplate ?? false,
    })
    .returning()
    .get();
  return toDto(row, a);
}

export function updateLesson(db: Db, ownerId: string, id: string, input: UpdateLessonInput): LessonDto {
  const current = requireLesson(db, ownerId, id);
  const patch: Partial<typeof lessonPlans.$inferInsert> = {};
  let assignment = requireAssignment(db, ownerId, current.assignmentId);

  if (input.assignmentId && input.assignmentId !== current.assignmentId) {
    assignment = requireAssignment(db, ownerId, input.assignmentId);
    patch.assignmentId = input.assignmentId;
  }
  const date = input.date ?? current.date;
  if (input.date !== undefined) patch.date = input.date;
  if (input.termId !== undefined) {
    if (input.termId && requireTerm(db, ownerId, input.termId).yearId !== assignment.yearId)
      throw badRequest('الفصل لا يتبع عام هذه الشعبة', 'TERM_MISMATCH');
    patch.termId = input.termId;
  } else if (patch.assignmentId || input.date !== undefined) {
    patch.termId = termForDate(db, ownerId, assignment.yearId, date);
  }

  const copy = ['period', 'title', 'unitName', 'lessonNumber', 'durationMinutes', 'outcomes', 'objectives', 'concepts', 'strategies', 'resources', 'assessmentMethods', 'assessmentNotes', 'homework', 'supportPlan', 'enrichmentPlan', 'notes', 'reflection', 'status', 'isTemplate'] as const;
  for (const key of copy) {
    if (input[key] !== undefined) (patch as Record<string, unknown>)[key] = input[key];
  }
  if (input.title !== undefined || input.unitName !== undefined || input.lessonNumber !== undefined) {
    patch.searchText = searchTextOf(
      input.title ?? current.title,
      input.unitName !== undefined ? input.unitName : current.unitName,
      input.lessonNumber !== undefined ? input.lessonNumber : current.lessonNumber,
    );
  }
  if (input.activities !== undefined) patch.activities = input.activities.map((x, i) => ({ ...x, id: x.id ?? `a${i + 1}` }));

  if (Object.keys(patch).length) db.update(lessonPlans).set(patch).where(eq(lessonPlans.id, id)).run();
  return getLesson(db, ownerId, id);
}

export function deleteLesson(db: Db, ownerId: string, id: string): void {
  requireLesson(db, ownerId, id);
  db.delete(lessonPlans).where(eq(lessonPlans.id, id)).run();
}

/**
 * نسخ التحضير وإعادة استخدامه: ينسخ المحتوى كله إلى وجهات متعددة (شعب/تواريخ) كمسودات جديدة.
 * ما يخص «التنفيذ» (التأمل بعد الحصة) لا يُنسخ لأنه يخص الحصة الأصلية.
 */
export function copyLesson(db: Db, ownerId: string, id: string, input: CopyLessonInput): LessonSummaryDto[] {
  const src = requireLesson(db, ownerId, id);
  const created: LessonRow[] = [];
  db.transaction((tx) => {
    for (const t of input.targets) {
      const asg = requireAssignment(tx as unknown as Db, ownerId, t.assignmentId);
      const row = tx
        .insert(lessonPlans)
        .values({
          ownerId,
          assignmentId: t.assignmentId,
          termId: termForDate(tx as unknown as Db, ownerId, asg.yearId, t.date),
          date: t.date,
          period: t.period ?? null,
          title: src.title,
          unitName: src.unitName,
          lessonNumber: src.lessonNumber,
          searchText: src.searchText,
          durationMinutes: src.durationMinutes,
          outcomes: src.outcomes,
          objectives: src.objectives,
          concepts: src.concepts,
          strategies: src.strategies,
          resources: src.resources,
          activities: src.activities,
          assessmentMethods: src.assessmentMethods,
          assessmentNotes: src.assessmentNotes,
          homework: src.homework,
          supportPlan: src.supportPlan,
          enrichmentPlan: src.enrichmentPlan,
          notes: src.notes,
          reflection: null,
          status: 'draft',
          isTemplate: input.asTemplate ?? false,
          sourceLessonId: src.id,
        })
        .returning()
        .get();
      created.push(row);
    }
  });
  const infos = new Map(listAssignmentInfos(db, ownerId, { ids: created.map((c) => c.assignmentId) }).map((a) => [a.id, a]));
  return created.map((c) => toSummary(c, infos.get(c.assignmentId)!));
}
