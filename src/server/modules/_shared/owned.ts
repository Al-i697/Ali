// جلب الكيانات مع التحقق من ملكية المعلم لها. عدم الملكية = «غير موجود» (404) كي لا نكشف وجود بيانات غيره.
import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { notFound } from '../../lib/errors';
import { sectionLabel } from '../../../shared/constants';
import type { AssignmentDto } from '../../../shared/dto';

const { academicYears, terms, subjects, sections, assignments, students, assessments, lessonPlans, skills, tasks, studentNotes, supportPlans, supportPlanNotes, labActivities } = schema;

export function requireYear(db: Db, ownerId: string, id: string) {
  const row = db.select().from(academicYears).where(and(eq(academicYears.id, id), eq(academicYears.ownerId, ownerId))).get();
  if (!row) throw notFound('العام الدراسي');
  return row;
}

export function requireTerm(db: Db, ownerId: string, id: string) {
  const row = db.select().from(terms).where(and(eq(terms.id, id), eq(terms.ownerId, ownerId))).get();
  if (!row) throw notFound('الفصل الدراسي');
  return row;
}

export function requireSubject(db: Db, ownerId: string, id: string) {
  const row = db.select().from(subjects).where(and(eq(subjects.id, id), eq(subjects.ownerId, ownerId))).get();
  if (!row) throw notFound('المادة');
  return row;
}

export function requireSection(db: Db, ownerId: string, id: string) {
  const row = db.select().from(sections).where(and(eq(sections.id, id), eq(sections.ownerId, ownerId))).get();
  if (!row) throw notFound('الشعبة');
  return row;
}

export function requireStudent(db: Db, ownerId: string, id: string) {
  const row = db.select().from(students).where(and(eq(students.id, id), eq(students.ownerId, ownerId))).get();
  if (!row) throw notFound('الطالب');
  return row;
}

export function requireAssessment(db: Db, ownerId: string, id: string) {
  const row = db.select().from(assessments).where(and(eq(assessments.id, id), eq(assessments.ownerId, ownerId))).get();
  if (!row) throw notFound('التقويم');
  return row;
}

export function requireLesson(db: Db, ownerId: string, id: string) {
  const row = db.select().from(lessonPlans).where(and(eq(lessonPlans.id, id), eq(lessonPlans.ownerId, ownerId))).get();
  if (!row) throw notFound('التحضير');
  return row;
}

export function requireSkill(db: Db, ownerId: string, id: string) {
  const row = db.select().from(skills).where(and(eq(skills.id, id), eq(skills.ownerId, ownerId))).get();
  if (!row) throw notFound('المهارة');
  return row;
}

export function requireTask(db: Db, ownerId: string, id: string) {
  const row = db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.ownerId, ownerId))).get();
  if (!row) throw notFound('المهمة');
  return row;
}

export function requireNote(db: Db, ownerId: string, id: string) {
  const row = db.select().from(studentNotes).where(and(eq(studentNotes.id, id), eq(studentNotes.ownerId, ownerId))).get();
  if (!row) throw notFound('الملاحظة');
  return row;
}

export function requireSupportPlan(db: Db, ownerId: string, id: string) {
  const row = db.select().from(supportPlans).where(and(eq(supportPlans.id, id), eq(supportPlans.ownerId, ownerId))).get();
  if (!row) throw notFound('الخطة');
  return row;
}

export function requireSupportNote(db: Db, ownerId: string, planId: string, id: string) {
  const row = db
    .select()
    .from(supportPlanNotes)
    .where(and(eq(supportPlanNotes.id, id), eq(supportPlanNotes.planId, planId), eq(supportPlanNotes.ownerId, ownerId)))
    .get();
  if (!row) throw notFound('ملاحظة المتابعة');
  return row;
}

export function requireLabActivity(db: Db, ownerId: string, id: string) {
  const row = db.select().from(labActivities).where(and(eq(labActivities.id, id), eq(labActivities.ownerId, ownerId))).get();
  if (!row) throw notFound('النشاط');
  return row;
}

// ───────────── مقررات الشعب ─────────────
type AssignmentFilter = { yearId?: string; sectionId?: string; ids?: readonly string[] };

export function listAssignmentInfos(db: Db, ownerId: string, filter: AssignmentFilter = {}): AssignmentDto[] {
  if (filter.ids && filter.ids.length === 0) return [];
  const conds = [eq(assignments.ownerId, ownerId)];
  if (filter.yearId) conds.push(eq(sections.yearId, filter.yearId));
  if (filter.sectionId) conds.push(eq(assignments.sectionId, filter.sectionId));
  if (filter.ids) conds.push(inArray(assignments.id, [...filter.ids]));
  const rows = db
    .select({
      id: assignments.id,
      sectionId: assignments.sectionId,
      subjectId: assignments.subjectId,
      weeklyPeriods: assignments.weeklyPeriods,
      yearId: sections.yearId,
      gradeLevel: sections.gradeLevel,
      sectionName: sections.name,
      subjectName: subjects.name,
      subjectColor: subjects.color,
    })
    .from(assignments)
    .innerJoin(sections, eq(sections.id, assignments.sectionId))
    .innerJoin(subjects, eq(subjects.id, assignments.subjectId))
    .where(and(...conds))
    .orderBy(sections.gradeLevel, sections.name, subjects.name)
    .all();
  return rows.map((r) => ({ ...r, sectionLabel: sectionLabel(r.gradeLevel, r.sectionName) }));
}

export function requireAssignment(db: Db, ownerId: string, id: string): AssignmentDto {
  const [row] = listAssignmentInfos(db, ownerId, { ids: [id] });
  if (!row) throw notFound('مقرر الشعبة');
  return row;
}

export function assignmentMap(db: Db, ownerId: string, ids: readonly string[]): Map<string, AssignmentDto> {
  return new Map(listAssignmentInfos(db, ownerId, { ids: [...new Set(ids)] }).map((a) => [a.id, a]));
}
