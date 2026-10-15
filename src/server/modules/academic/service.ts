import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { conflict, badRequest, isUniqueViolation } from '../../lib/errors';
import { SUBJECT_COLORS, sectionLabel } from '../../../shared/constants';
import { splitYearIntoTerms } from '../../../shared/academic';
import { diffDays } from '../../../shared/dates';
import type {
  AssignmentDto,
  ImpactDto,
  SectionDto,
  SubjectDto,
  TermDto,
  YearDto,
} from '../../../shared/dto';
import type {
  CreateSectionInput,
} from '../../../shared/schemas/academic';
import {
  listAssignmentInfos,
  requireAssignment,
  requireSection,
  requireSubject,
  requireTerm,
  requireYear,
} from '../_shared/owned';

const {
  academicYears,
  terms,
  subjects,
  sections,
  assignments,
  enrollments,
  assessments,
  assessmentResults,
  lessonPlans,
  timetableSlots,
} = schema;

// ═════════════ السنوات والفصول ═════════════
const toTermDto = (t: typeof terms.$inferSelect): TermDto => ({
  id: t.id,
  yearId: t.yearId,
  number: t.number,
  name: t.name,
  startDate: t.startDate,
  endDate: t.endDate,
});

export function listYears(db: Db, ownerId: string): YearDto[] {
  const years = db
    .select()
    .from(academicYears)
    .where(eq(academicYears.ownerId, ownerId))
    .orderBy(desc(academicYears.startDate))
    .all();
  const allTerms = db.select().from(terms).where(eq(terms.ownerId, ownerId)).orderBy(asc(terms.number)).all();
  return years.map((y) => ({
    id: y.id,
    name: y.name,
    startDate: y.startDate,
    endDate: y.endDate,
    isCurrent: y.isCurrent,
    terms: allTerms.filter((t) => t.yearId === y.id).map(toTermDto),
  }));
}

export function getYear(db: Db, ownerId: string, id: string): YearDto {
  requireYear(db, ownerId, id);
  return listYears(db, ownerId).find((y) => y.id === id)!;
}

export function createYear(
  db: Db,
  ownerId: string,
  input: { name: string; startDate: string; endDate: string; makeCurrent: boolean },
): YearDto {
  if (diffDays(input.startDate, input.endDate) < 30) throw badRequest('يجب ألا تقل مدة العام الدراسي عن شهر', 'YEAR_TOO_SHORT');
  const dup = db
    .select({ id: academicYears.id })
    .from(academicYears)
    .where(and(eq(academicYears.ownerId, ownerId), eq(academicYears.name, input.name)))
    .get();
  if (dup) throw conflict('يوجد عام دراسي بهذا الاسم مسبقًا', 'YEAR_EXISTS');

  const id = db.transaction((tx) => {
    const existing = tx.select({ c: count() }).from(academicYears).where(eq(academicYears.ownerId, ownerId)).get()?.c ?? 0;
    const makeCurrent = input.makeCurrent || existing === 0;
    if (makeCurrent) tx.update(academicYears).set({ isCurrent: false }).where(eq(academicYears.ownerId, ownerId)).run();
    const year = tx
      .insert(academicYears)
      .values({ ownerId, name: input.name, startDate: input.startDate, endDate: input.endDate, isCurrent: makeCurrent })
      .returning()
      .get();
    for (const t of splitYearIntoTerms(input.startDate, input.endDate)) {
      tx.insert(terms).values({ ownerId, yearId: year.id, ...t }).run();
    }
    return year.id;
  });
  return getYear(db, ownerId, id);
}

export function updateYear(
  db: Db,
  ownerId: string,
  id: string,
  input: { name?: string; startDate?: string; endDate?: string },
): YearDto {
  const year = requireYear(db, ownerId, id);
  const startDate = input.startDate ?? year.startDate;
  const endDate = input.endDate ?? year.endDate;
  if (startDate >= endDate) throw badRequest('نهاية العام يجب أن تكون بعد بدايته');
  if (input.name && input.name !== year.name) {
    const dup = db
      .select({ id: academicYears.id })
      .from(academicYears)
      .where(and(eq(academicYears.ownerId, ownerId), eq(academicYears.name, input.name)))
      .get();
    if (dup) throw conflict('يوجد عام دراسي بهذا الاسم مسبقًا', 'YEAR_EXISTS');
  }
  db.update(academicYears).set({ name: input.name ?? year.name, startDate, endDate }).where(eq(academicYears.id, id)).run();
  return getYear(db, ownerId, id);
}

export function setCurrentYear(db: Db, ownerId: string, id: string): YearDto {
  requireYear(db, ownerId, id);
  db.transaction((tx) => {
    tx.update(academicYears).set({ isCurrent: false }).where(eq(academicYears.ownerId, ownerId)).run();
    tx.update(academicYears).set({ isCurrent: true }).where(eq(academicYears.id, id)).run();
  });
  return getYear(db, ownerId, id);
}

export function deleteYear(db: Db, ownerId: string, id: string): void {
  requireYear(db, ownerId, id);
  const n = db.select({ c: count() }).from(sections).where(eq(sections.yearId, id)).get()?.c ?? 0;
  if (n > 0) throw conflict(`لا يمكن حذف عام دراسي يحتوي ${n} شعبة. احذف الشعب أولًا`, 'YEAR_NOT_EMPTY');
  db.delete(academicYears).where(eq(academicYears.id, id)).run();
  // إن كان الحالي: نرقّي أحدث عام متبقٍ ليبقى هناك عام حالي
  const hasCurrent = db.select({ id: academicYears.id }).from(academicYears).where(and(eq(academicYears.ownerId, ownerId), eq(academicYears.isCurrent, true))).get();
  if (!hasCurrent) {
    const latest = db.select().from(academicYears).where(eq(academicYears.ownerId, ownerId)).orderBy(desc(academicYears.startDate)).get();
    if (latest) db.update(academicYears).set({ isCurrent: true }).where(eq(academicYears.id, latest.id)).run();
  }
}

export function updateTerm(
  db: Db,
  ownerId: string,
  id: string,
  input: { name?: string; startDate?: string; endDate?: string },
): TermDto {
  const term = requireTerm(db, ownerId, id);
  const startDate = input.startDate ?? term.startDate;
  const endDate = input.endDate ?? term.endDate;
  if (startDate >= endDate) throw badRequest('نهاية الفصل يجب أن تكون بعد بدايته');
  const sibling = db
    .select()
    .from(terms)
    .where(and(eq(terms.yearId, term.yearId), eq(terms.number, term.number === 1 ? 2 : 1)))
    .get();
  if (sibling) {
    if (term.number === 1 && endDate >= sibling.startDate) throw badRequest('يجب أن ينتهي الفصل الأول قبل بداية الفصل الثاني');
    if (term.number === 2 && startDate <= sibling.endDate) throw badRequest('يجب أن يبدأ الفصل الثاني بعد نهاية الفصل الأول');
  }
  const row = db.update(terms).set({ name: input.name ?? term.name, startDate, endDate }).where(eq(terms.id, id)).returning().get();
  return toTermDto(row);
}

// ═════════════ المواد ═════════════
export function listSubjects(db: Db, ownerId: string): SubjectDto[] {
  const rows = db
    .select({
      id: subjects.id,
      name: subjects.name,
      color: subjects.color,
      isArchived: subjects.isArchived,
      assignmentCount: sql<number>`count(${assignments.id})`,
    })
    .from(subjects)
    .leftJoin(assignments, eq(assignments.subjectId, subjects.id))
    .where(eq(subjects.ownerId, ownerId))
    .groupBy(subjects.id)
    .orderBy(asc(subjects.name))
    .all();
  return rows.map((r) => ({ ...r, assignmentCount: Number(r.assignmentCount) }));
}

export function createSubject(db: Db, ownerId: string, input: { name: string; color?: string }): SubjectDto {
  const dup = db.select({ id: subjects.id }).from(subjects).where(and(eq(subjects.ownerId, ownerId), eq(subjects.name, input.name))).get();
  if (dup) throw conflict('هذه المادة موجودة مسبقًا', 'SUBJECT_EXISTS');
  const n = db.select({ c: count() }).from(subjects).where(eq(subjects.ownerId, ownerId)).get()?.c ?? 0;
  const color = input.color ?? SUBJECT_COLORS[n % SUBJECT_COLORS.length]!;
  const row = db.insert(subjects).values({ ownerId, name: input.name, color }).returning().get();
  return { id: row.id, name: row.name, color: row.color, isArchived: row.isArchived, assignmentCount: 0 };
}

export function updateSubject(
  db: Db,
  ownerId: string,
  id: string,
  input: { name?: string; color?: string; isArchived?: boolean },
): SubjectDto {
  const subject = requireSubject(db, ownerId, id);
  if (input.name && input.name !== subject.name) {
    const dup = db.select({ id: subjects.id }).from(subjects).where(and(eq(subjects.ownerId, ownerId), eq(subjects.name, input.name))).get();
    if (dup) throw conflict('هذه المادة موجودة مسبقًا', 'SUBJECT_EXISTS');
  }
  db.update(subjects).set(input).where(eq(subjects.id, id)).run();
  return listSubjects(db, ownerId).find((s) => s.id === id)!;
}

export function deleteSubject(db: Db, ownerId: string, id: string): void {
  requireSubject(db, ownerId, id);
  const n = db.select({ c: count() }).from(assignments).where(eq(assignments.subjectId, id)).get()?.c ?? 0;
  if (n > 0) throw conflict(`المادة مرتبطة بـ ${n} شعبة. أزلها من الشعب أولًا أو أرشفها`, 'SUBJECT_IN_USE');
  db.delete(subjects).where(eq(subjects.id, id)).run();
}

// ═════════════ الشعب والمقررات ═════════════
export function listSections(db: Db, ownerId: string, yearId: string): SectionDto[] {
  const rows = db
    .select()
    .from(sections)
    .where(and(eq(sections.ownerId, ownerId), eq(sections.yearId, yearId)))
    .orderBy(asc(sections.gradeLevel), asc(sections.name))
    .all();
  const infos = listAssignmentInfos(db, ownerId, { yearId });
  const counts = new Map(
    db
      .select({ sectionId: enrollments.sectionId, c: count() })
      .from(enrollments)
      .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.yearId, yearId)))
      .groupBy(enrollments.sectionId)
      .all()
      .map((r) => [r.sectionId, r.c]),
  );
  return rows.map((s) => ({
    id: s.id,
    yearId: s.yearId,
    gradeLevel: s.gradeLevel,
    name: s.name,
    label: sectionLabel(s.gradeLevel, s.name),
    notes: s.notes,
    isArchived: s.isArchived,
    studentCount: counts.get(s.id) ?? 0,
    assignments: infos.filter((a) => a.sectionId === s.id),
  }));
}

export function getSection(db: Db, ownerId: string, id: string): SectionDto {
  const s = requireSection(db, ownerId, id);
  return listSections(db, ownerId, s.yearId).find((x) => x.id === id)!;
}

function ensureSectionUnique(db: Db, ownerId: string, yearId: string, gradeLevel: number, name: string, exceptId?: string) {
  const dup = db
    .select({ id: sections.id })
    .from(sections)
    .where(and(eq(sections.ownerId, ownerId), eq(sections.yearId, yearId), eq(sections.gradeLevel, gradeLevel), eq(sections.name, name)))
    .get();
  if (dup && dup.id !== exceptId) throw conflict('هذه الشعبة موجودة مسبقًا في هذا العام', 'SECTION_EXISTS');
}

export function createSection(db: Db, ownerId: string, input: CreateSectionInput): SectionDto {
  const year = requireYear(db, ownerId, input.yearId);
  const name = input.name.trim();
  ensureSectionUnique(db, ownerId, year.id, input.gradeLevel, name);
  const subjectIds = [...new Set(input.subjectIds ?? [])];
  for (const sid of subjectIds) requireSubject(db, ownerId, sid);

  const id = db.transaction((tx) => {
    const section = tx
      .insert(sections)
      .values({ ownerId, yearId: year.id, gradeLevel: input.gradeLevel, name, notes: input.notes ?? null })
      .returning()
      .get();
    for (const subjectId of subjectIds) {
      tx.insert(assignments).values({ ownerId, sectionId: section.id, subjectId }).run();
    }
    return section.id;
  });
  return getSection(db, ownerId, id);
}

export function updateSection(
  db: Db,
  ownerId: string,
  id: string,
  input: { gradeLevel?: number; name?: string; notes?: string | null; isArchived?: boolean },
): SectionDto {
  const s = requireSection(db, ownerId, id);
  const gradeLevel = input.gradeLevel ?? s.gradeLevel;
  const name = (input.name ?? s.name).trim();
  ensureSectionUnique(db, ownerId, s.yearId, gradeLevel, name, id);
  db.update(sections)
    .set({
      gradeLevel,
      name,
      notes: input.notes === undefined ? s.notes : input.notes,
      isArchived: input.isArchived ?? s.isArchived,
    })
    .where(eq(sections.id, id))
    .run();
  return getSection(db, ownerId, id);
}

/** ما الذي سيُحذف مع هذه الشعبة؟ — يُعرض للمعلم قبل التأكيد */
export function sectionImpact(db: Db, ownerId: string, id: string): ImpactDto {
  requireSection(db, ownerId, id);
  const asg = db.select({ id: assignments.id }).from(assignments).where(eq(assignments.sectionId, id)).all().map((a) => a.id);
  return impactFor(db, ownerId, { sectionId: id, assignmentIds: asg });
}

export function assignmentImpact(db: Db, ownerId: string, id: string): ImpactDto {
  requireAssignment(db, ownerId, id);
  return impactFor(db, ownerId, { assignmentIds: [id] });
}

function impactFor(db: Db, ownerId: string, opts: { sectionId?: string; assignmentIds: string[] }): ImpactDto {
  const ids = opts.assignmentIds;
  const students = opts.sectionId
    ? (db.select({ c: count() }).from(enrollments).where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.sectionId, opts.sectionId))).get()?.c ?? 0)
    : 0;
  if (ids.length === 0) return { students, assessments: 0, results: 0, lessons: 0, slots: 0 };
  const asm = db.select({ id: assessments.id }).from(assessments).where(inArray(assessments.assignmentId, ids)).all().map((a) => a.id);
  const results = asm.length
    ? (db.select({ c: count() }).from(assessmentResults).where(inArray(assessmentResults.assessmentId, asm)).get()?.c ?? 0)
    : 0;
  const lessons = db.select({ c: count() }).from(lessonPlans).where(inArray(lessonPlans.assignmentId, ids)).get()?.c ?? 0;
  const slots = db.select({ c: count() }).from(timetableSlots).where(inArray(timetableSlots.assignmentId, ids)).get()?.c ?? 0;
  return { students, assessments: asm.length, results, lessons, slots };
}

function hasContent(i: ImpactDto): boolean {
  return i.assessments + i.lessons + i.slots + i.students > 0;
}

export function deleteSection(db: Db, ownerId: string, id: string, force: boolean): void {
  const impact = sectionImpact(db, ownerId, id);
  if (hasContent(impact) && !force)
    throw conflict('الشعبة تحتوي بيانات مرتبطة. أكّد الحذف لإزالتها نهائيًا', 'CONFIRM_REQUIRED');
  db.delete(sections).where(eq(sections.id, id)).run();
}

export function addAssignment(db: Db, ownerId: string, sectionId: string, input: { subjectId: string; weeklyPeriods?: number }): AssignmentDto {
  requireSection(db, ownerId, sectionId);
  requireSubject(db, ownerId, input.subjectId);
  try {
    const row = db
      .insert(assignments)
      .values({ ownerId, sectionId, subjectId: input.subjectId, weeklyPeriods: input.weeklyPeriods ?? null })
      .returning()
      .get();
    return requireAssignment(db, ownerId, row.id);
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('المادة مضافة مسبقًا لهذه الشعبة', 'ASSIGNMENT_EXISTS');
    throw err;
  }
}

export function updateAssignment(db: Db, ownerId: string, id: string, input: { weeklyPeriods?: number | null }): AssignmentDto {
  requireAssignment(db, ownerId, id);
  if (input.weeklyPeriods !== undefined) {
    db.update(assignments).set({ weeklyPeriods: input.weeklyPeriods }).where(eq(assignments.id, id)).run();
  }
  return requireAssignment(db, ownerId, id);
}

export function deleteAssignment(db: Db, ownerId: string, id: string, force: boolean): void {
  const impact = assignmentImpact(db, ownerId, id);
  if (hasContent({ ...impact, students: 0 }) && !force)
    throw conflict('للمقرر تقويمات أو تحضيرات أو حصص مرتبطة. أكّد الحذف لإزالتها نهائيًا', 'CONFIRM_REQUIRED');
  db.delete(assignments).where(eq(assignments.id, id)).run();
}

/** ينسخ بنية الشعب والمقررات من عام إلى عام (دون طلاب أو درجات) — يوفّر إعادة الإدخال في بداية العام */
export function cloneStructure(db: Db, ownerId: string, fromYearId: string, toYearId: string): { sections: number; assignments: number } {
  requireYear(db, ownerId, fromYearId);
  requireYear(db, ownerId, toYearId);
  if (fromYearId === toYearId) throw badRequest('اختر عامين مختلفين');
  let createdSections = 0;
  let createdAssignments = 0;
  db.transaction((tx) => {
    const source = tx.select().from(sections).where(and(eq(sections.ownerId, ownerId), eq(sections.yearId, fromYearId))).all();
    for (const s of source) {
      let target = tx
        .select()
        .from(sections)
        .where(and(eq(sections.ownerId, ownerId), eq(sections.yearId, toYearId), eq(sections.gradeLevel, s.gradeLevel), eq(sections.name, s.name)))
        .get();
      if (!target) {
        target = tx.insert(sections).values({ ownerId, yearId: toYearId, gradeLevel: s.gradeLevel, name: s.name, notes: s.notes }).returning().get();
        createdSections++;
      }
      const srcAsg = tx.select().from(assignments).where(eq(assignments.sectionId, s.id)).all();
      for (const a of srcAsg) {
        const exists = tx
          .select({ id: assignments.id })
          .from(assignments)
          .where(and(eq(assignments.sectionId, target.id), eq(assignments.subjectId, a.subjectId)))
          .get();
        if (!exists) {
          tx.insert(assignments).values({ ownerId, sectionId: target.id, subjectId: a.subjectId, weeklyPeriods: a.weeklyPeriods }).run();
          createdAssignments++;
        }
      }
    }
  });
  return { sections: createdSections, assignments: createdAssignments };
}

export { listAssignmentInfos };
