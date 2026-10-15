import { and, asc, count, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { round } from '../../../shared/gradebook';
import type {
  AssessmentDto,
  GradebookDto,
  GradebookStudentDto,
  ResultDto,
  SaveResultsResponse,
  SkillDto,
} from '../../../shared/dto';
import type { SaveResultsInput } from '../../../shared/schemas/assessments';
import { badRequest, conflict } from '../../lib/errors';
import {
  requireAssessment,
  requireAssignment,
  requireSkill,
  requireSubject,
  requireTerm,
} from '../_shared/owned';
import { getSettings } from '../settings/service';

const { assessments, assessmentSkills, assessmentResults, enrollments, students, skills, subjects } = schema;

type AssessmentRow = typeof assessments.$inferSelect;

function skillIdsFor(db: Db, ids: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (ids.length === 0) return map;
  for (const r of db.select().from(assessmentSkills).where(inArray(assessmentSkills.assessmentId, ids)).all()) {
    map.set(r.assessmentId, [...(map.get(r.assessmentId) ?? []), r.skillId]);
  }
  return map;
}

function toDto(a: AssessmentRow, skillIds: string[]): AssessmentDto {
  return {
    id: a.id,
    assignmentId: a.assignmentId,
    termId: a.termId,
    title: a.title,
    type: a.type,
    mode: a.mode,
    maxScore: a.maxScore,
    weight: a.weight,
    date: a.date,
    description: a.description,
    countsTowardTotal: a.countsTowardTotal,
    skillIds,
    createdAt: a.createdAt,
  };
}

/** ترتيب التقويمات: بالتاريخ ثم الإنشاء (غير المؤرَّخ في النهاية) */
function orderAssessments<T extends AssessmentRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
}

export function listAssessments(db: Db, ownerId: string, assignmentId: string, termId?: string): AssessmentDto[] {
  requireAssignment(db, ownerId, assignmentId);
  const conds = [eq(assessments.ownerId, ownerId), eq(assessments.assignmentId, assignmentId)];
  if (termId) conds.push(eq(assessments.termId, termId));
  const rows = orderAssessments(db.select().from(assessments).where(and(...conds)).all());
  const skillMap = skillIdsFor(db, rows.map((r) => r.id));
  return rows.map((r) => toDto(r, skillMap.get(r.id) ?? []));
}

export function getAssessment(db: Db, ownerId: string, id: string): AssessmentDto {
  const a = requireAssessment(db, ownerId, id);
  return toDto(a, skillIdsFor(db, [id]).get(id) ?? []);
}

type CreateInput = {
  assignmentId: string;
  termId: string;
  title: string;
  type: AssessmentRow['type'];
  mode: AssessmentRow['mode'];
  maxScore?: number | null;
  weight?: number | null;
  date?: string | null;
  description?: string | null;
  countsTowardTotal: boolean;
  skillIds: string[];
};

function checkTermBelongs(db: Db, ownerId: string, termId: string, assignmentYearId: string) {
  const term = requireTerm(db, ownerId, termId);
  if (term.yearId !== assignmentYearId) throw badRequest('الفصل المختار لا يتبع العام الدراسي لهذه الشعبة', 'TERM_MISMATCH');
  return term;
}

function checkSkills(db: Db, ownerId: string, skillIds: string[], subjectId: string) {
  for (const sid of skillIds) {
    const skill = requireSkill(db, ownerId, sid);
    if (skill.subjectId !== subjectId) throw badRequest('إحدى المهارات لا تتبع مادة هذا التقويم', 'SKILL_SUBJECT_MISMATCH');
  }
}

export function createAssessment(db: Db, ownerId: string, input: CreateInput): AssessmentDto {
  const assignment = requireAssignment(db, ownerId, input.assignmentId);
  checkTermBelongs(db, ownerId, input.termId, assignment.yearId);
  const skillIds = [...new Set(input.skillIds)];
  checkSkills(db, ownerId, skillIds, assignment.subjectId);

  const isScore = input.mode === 'score';
  const maxScore = isScore ? input.maxScore ?? null : null;
  const weight = isScore ? input.weight ?? maxScore ?? 0 : 0;
  const id = db.transaction((tx) => {
    const row = tx
      .insert(assessments)
      .values({
        ownerId,
        assignmentId: input.assignmentId,
        termId: input.termId,
        title: input.title,
        type: input.type,
        mode: input.mode,
        maxScore,
        weight,
        date: input.date ?? null,
        description: input.description ?? null,
        countsTowardTotal: isScore ? input.countsTowardTotal : false,
      })
      .returning()
      .get();
    for (const skillId of skillIds) tx.insert(assessmentSkills).values({ assessmentId: row.id, skillId }).run();
    return row.id;
  });
  return getAssessment(db, ownerId, id);
}

type UpdateInput = Partial<Omit<CreateInput, 'assignmentId'>> & { assignmentId?: string };

export function updateAssessment(db: Db, ownerId: string, id: string, input: UpdateInput): AssessmentDto {
  const current = requireAssessment(db, ownerId, id);
  const assignment = requireAssignment(db, ownerId, current.assignmentId);
  if (input.assignmentId && input.assignmentId !== current.assignmentId)
    throw badRequest('لا يمكن نقل التقويم إلى مقرر آخر. انسخه بدلًا من ذلك', 'ASSIGNMENT_IMMUTABLE');

  const resultsCount = db.select({ c: count() }).from(assessmentResults).where(eq(assessmentResults.assessmentId, id)).get()?.c ?? 0;
  if (input.mode && input.mode !== current.mode && resultsCount > 0)
    throw conflict('لا يمكن تغيير نمط التقويم (درجة/إتقان) بعد رصد نتائج له', 'MODE_LOCKED');
  if (input.termId && input.termId !== current.termId) checkTermBelongs(db, ownerId, input.termId, assignment.yearId);

  const mode = input.mode ?? current.mode;
  const patch: Partial<typeof assessments.$inferInsert> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.type !== undefined) patch.type = input.type;
  if (input.mode !== undefined) patch.mode = input.mode;
  if (input.termId !== undefined) patch.termId = input.termId;
  if (input.date !== undefined) patch.date = input.date;
  if (input.description !== undefined) patch.description = input.description;

  if (mode === 'score') {
    const maxScore = input.maxScore !== undefined ? input.maxScore : current.maxScore;
    if (maxScore === null || maxScore === undefined) throw badRequest('حدّد الدرجة العظمى', 'MAX_REQUIRED', { maxScore: 'حدّد الدرجة العظمى' });
    if (maxScore < current.maxScore! || input.maxScore !== undefined) {
      const over = db
        .select({ c: count() })
        .from(assessmentResults)
        .where(and(eq(assessmentResults.assessmentId, id), sql`${assessmentResults.score} > ${maxScore}`))
        .get()?.c ?? 0;
      if (over > 0)
        throw conflict(`لا يمكن خفض الدرجة العظمى: لدى ${over} طالب درجة أعلى منها. عدّل الدرجات أولًا`, 'MAX_BELOW_SCORES');
    }
    patch.maxScore = maxScore;
    // إن تغيّرت الدرجة العظمى ولم يُحدَّد الوزن صراحة: يتبع الوزن العظمى فقط إذا كان مساويًا للقديمة
    if (input.weight !== undefined && input.weight !== null) patch.weight = input.weight;
    else if (input.weight === null || (input.maxScore !== undefined && current.weight === current.maxScore)) patch.weight = maxScore;
    if (input.countsTowardTotal !== undefined) patch.countsTowardTotal = input.countsTowardTotal;
  } else {
    patch.maxScore = null;
    patch.weight = 0;
    patch.countsTowardTotal = false;
  }

  db.transaction((tx) => {
    if (Object.keys(patch).length) tx.update(assessments).set(patch).where(eq(assessments.id, id)).run();
    if (input.skillIds) {
      const skillIds = [...new Set(input.skillIds)];
      checkSkills(tx as unknown as Db, ownerId, skillIds, assignment.subjectId);
      tx.delete(assessmentSkills).where(eq(assessmentSkills.assessmentId, id)).run();
      for (const skillId of skillIds) tx.insert(assessmentSkills).values({ assessmentId: id, skillId }).run();
    }
  });
  return getAssessment(db, ownerId, id);
}

export function deleteAssessment(db: Db, ownerId: string, id: string, force: boolean): void {
  requireAssessment(db, ownerId, id);
  const n = db.select({ c: count() }).from(assessmentResults).where(eq(assessmentResults.assessmentId, id)).get()?.c ?? 0;
  if (n > 0 && !force) throw conflict(`لهذا التقويم ${n} نتيجة مرصودة ستُحذف معه نهائيًا. أكّد الحذف`, 'CONFIRM_REQUIRED');
  db.delete(assessments).where(eq(assessments.id, id)).run();
}

/** ينسخ تعريف التقويم (دون النتائج) إلى مقررات أخرى في العام نفسه — لتقليل إعادة الإدخال بين الشعب */
export function copyAssessment(db: Db, ownerId: string, id: string, targetAssignmentIds: string[]): AssessmentDto[] {
  const src = requireAssessment(db, ownerId, id);
  const srcAssignment = requireAssignment(db, ownerId, src.assignmentId);
  const srcSkills = skillIdsFor(db, [id]).get(id) ?? [];
  const created: string[] = [];
  db.transaction((tx) => {
    for (const targetId of [...new Set(targetAssignmentIds)]) {
      if (targetId === src.assignmentId) continue;
      const target = requireAssignment(tx as unknown as Db, ownerId, targetId);
      if (target.yearId !== srcAssignment.yearId) throw badRequest('يمكن النسخ إلى شعب العام نفسه فقط');
      const row = tx
        .insert(assessments)
        .values({
          ownerId,
          assignmentId: targetId,
          termId: src.termId,
          title: src.title,
          type: src.type,
          mode: src.mode,
          maxScore: src.maxScore,
          weight: src.weight,
          date: src.date,
          description: src.description,
          countsTowardTotal: src.countsTowardTotal,
        })
        .returning()
        .get();
      if (target.subjectId === srcAssignment.subjectId) {
        for (const skillId of srcSkills) tx.insert(assessmentSkills).values({ assessmentId: row.id, skillId }).run();
      }
      created.push(row.id);
    }
  });
  return created.map((cid) => getAssessment(db, ownerId, cid));
}

// ═════════════ رصد النتائج ═════════════
export function saveResults(db: Db, ownerId: string, assessmentId: string, input: SaveResultsInput): SaveResultsResponse {
  const a = requireAssessment(db, ownerId, assessmentId);
  const assignment = requireAssignment(db, ownerId, a.assignmentId);
  const enrolled = new Set(
    db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.sectionId, assignment.sectionId)))
      .all()
      .map((e) => e.studentId),
  );

  // تحقق كامل قبل أي كتابة: لا نحفظ جزءًا ونرفض الباقي
  const seen = new Set<string>();
  const clean = (input.results ?? []).map((r, i) => {
    const where = `results.${i}`;
    if (!enrolled.has(r.studentId)) throw badRequest('أحد الطلاب غير مسجّل في هذه الشعبة', 'NOT_ENROLLED', { [`${where}.studentId`]: 'الطالب غير مسجّل في هذه الشعبة' });
    if (seen.has(r.studentId)) throw badRequest('طالب مكرر في الدفعة نفسها', 'DUPLICATE_STUDENT');
    seen.add(r.studentId);
    const status = r.status ?? 'graded';
    let score = r.score ?? null;
    let level = r.level ?? null;
    if (status !== 'graded') {
      score = null;
      level = null;
    } else if (a.mode === 'score') {
      if (level !== null) throw badRequest('هذا التقويم يُرصد بالدرجات لا بمستوى الإتقان', 'MODE_MISMATCH', { [`${where}.level`]: 'غير مسموح' });
      if (score !== null && score > a.maxScore!)
        throw badRequest(`الدرجة لا يمكن أن تزيد عن ${a.maxScore}`, 'SCORE_TOO_HIGH', { [`${where}.score`]: `الدرجة لا يمكن أن تزيد عن ${a.maxScore}` });
    } else {
      if (score !== null) throw badRequest('هذا التقويم يُرصد بمستوى الإتقان لا بالدرجات', 'MODE_MISMATCH', { [`${where}.score`]: 'غير مسموح' });
    }
    return { studentId: r.studentId, status, score: score === null ? null : round(score), level, note: r.note ?? null };
  });

  const now = new Date().toISOString();
  db.transaction((tx) => {
    for (const r of clean) {
      const isEmpty = r.status === 'graded' && r.score === null && r.level === null && !r.note;
      if (isEmpty) {
        // إفراغ الخانة = حذف السجل (يعود «غير مرصود»)
        tx.delete(assessmentResults).where(and(eq(assessmentResults.assessmentId, assessmentId), eq(assessmentResults.studentId, r.studentId))).run();
        continue;
      }
      tx.insert(assessmentResults)
        .values({ ownerId, assessmentId, studentId: r.studentId, score: r.score, level: r.level, status: r.status, note: r.note })
        .onConflictDoUpdate({
          target: [assessmentResults.assessmentId, assessmentResults.studentId],
          set: { score: r.score, level: r.level, status: r.status, note: r.note, updatedAt: now },
        })
        .run();
    }
  });
  return { saved: clean.length, updatedAt: now };
}

// ═════════════ دفتر الدرجات ═════════════
export function getGradebook(db: Db, ownerId: string, assignmentId: string, termId: string): GradebookDto {
  const assignment = requireAssignment(db, ownerId, assignmentId);
  const termRow = checkTermBelongs(db, ownerId, termId, assignment.yearId);
  const list = listAssessments(db, ownerId, assignmentId, termId);

  const roster = db
    .select({ rollNo: enrollments.rollNo, student: students })
    .from(enrollments)
    .innerJoin(students, eq(students.id, enrollments.studentId))
    .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.sectionId, assignment.sectionId)))
    .orderBy(asc(enrollments.rollNo))
    .all();

  const resultRows = list.length
    ? db
        .select()
        .from(assessmentResults)
        .where(and(eq(assessmentResults.ownerId, ownerId), inArray(assessmentResults.assessmentId, list.map((a) => a.id))))
        .all()
    : [];
  const byStudent = new Map<string, Record<string, ResultDto>>();
  for (const r of resultRows) {
    const rec = byStudent.get(r.studentId) ?? {};
    rec[r.assessmentId] = { studentId: r.studentId, score: r.score, level: r.level, status: r.status, note: r.note };
    byStudent.set(r.studentId, rec);
  }

  const gradebookStudents: GradebookStudentDto[] = roster.map((r) => ({
    studentId: r.student.id,
    rollNo: r.rollNo,
    fullName: r.student.fullName,
    studentNumber: r.student.studentNumber,
    gender: r.student.gender,
    results: byStudent.get(r.student.id) ?? {},
  }));

  return {
    assignment,
    term: {
      id: termRow.id,
      yearId: termRow.yearId,
      number: termRow.number,
      name: termRow.name,
      startDate: termRow.startDate,
      endDate: termRow.endDate,
    },
    assessments: list,
    students: gradebookStudents,
    grading: getSettings(db, ownerId).grading,
  };
}

// ═════════════ المهارات ═════════════
export function listSkills(db: Db, ownerId: string, opts: { subjectId?: string; includeArchived?: boolean } = {}): SkillDto[] {
  const conds = [eq(skills.ownerId, ownerId)];
  if (opts.subjectId) conds.push(eq(skills.subjectId, opts.subjectId));
  if (!opts.includeArchived) conds.push(eq(skills.isArchived, false));
  return db
    .select({ s: skills, subjectName: subjects.name })
    .from(skills)
    .innerJoin(subjects, eq(subjects.id, skills.subjectId))
    .where(and(...conds))
    .orderBy(asc(subjects.name), asc(skills.code), asc(skills.title))
    .all()
    .map((r) => ({
      id: r.s.id,
      subjectId: r.s.subjectId,
      subjectName: r.subjectName,
      gradeLevel: r.s.gradeLevel,
      code: r.s.code,
      title: r.s.title,
      description: r.s.description,
      isArchived: r.s.isArchived,
    }));
}

export function createSkill(
  db: Db,
  ownerId: string,
  input: { subjectId: string; gradeLevel?: number | null; code?: string | null; title: string; description?: string | null },
): SkillDto {
  requireSubject(db, ownerId, input.subjectId);
  const row = db
    .insert(skills)
    .values({ ownerId, subjectId: input.subjectId, gradeLevel: input.gradeLevel ?? null, code: input.code ?? null, title: input.title, description: input.description ?? null })
    .returning()
    .get();
  return listSkills(db, ownerId, { includeArchived: true }).find((s) => s.id === row.id)!;
}

export function updateSkill(
  db: Db,
  ownerId: string,
  id: string,
  input: { gradeLevel?: number | null; code?: string | null; title?: string; description?: string | null; isArchived?: boolean },
): SkillDto {
  requireSkill(db, ownerId, id);
  db.update(skills).set(input).where(eq(skills.id, id)).run();
  return listSkills(db, ownerId, { includeArchived: true }).find((s) => s.id === id)!;
}

export function deleteSkill(db: Db, ownerId: string, id: string): void {
  requireSkill(db, ownerId, id);
  db.delete(skills).where(eq(skills.id, id)).run();
}

