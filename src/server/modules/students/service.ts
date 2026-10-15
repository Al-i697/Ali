import { and, asc, count, desc, eq, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { cleanName, normalizeArabic } from '../../../shared/arabic';
import { sectionLabel } from '../../../shared/constants';
import type {
  ImportPreviewDto,
  ImportRowDto,
  NoteDto,
  RosterEntryDto,
  StudentDto,
  StudentsPage,
} from '../../../shared/dto';
import type { StudentInput } from '../../../shared/schemas/students';
import { badRequest, conflict, isUniqueViolation } from '../../lib/errors';
import { likeContains } from '../../lib/sql';
import { assignmentMap, requireNote, requireSection, requireStudent } from '../_shared/owned';

const { students, enrollments, sections, studentNotes, assessmentResults } = schema;

type StudentRow = typeof students.$inferSelect;

export function toStudentBase(s: StudentRow): Omit<StudentDto, 'enrollment'> {
  return {
    id: s.id,
    fullName: s.fullName,
    studentNumber: s.studentNumber,
    gender: s.gender,
    birthDate: s.birthDate,
    guardianName: s.guardianName,
    guardianPhone: s.guardianPhone,
    notes: s.notes,
    status: s.status,
    createdAt: s.createdAt,
  };
}

export function currentYearId(db: Db, ownerId: string): string | null {
  return (
    db
      .select({ id: schema.academicYears.id })
      .from(schema.academicYears)
      .where(and(eq(schema.academicYears.ownerId, ownerId), eq(schema.academicYears.isCurrent, true)))
      .get()?.id ?? null
  );
}

// ═════════════ القوائم والبحث ═════════════
export type StudentsFilter = {
  q?: string;
  sectionId?: string;
  yearId?: string;
  status?: StudentRow['status'];
  unassigned?: boolean;
  limit: number;
  offset: number;
};

export function listStudents(db: Db, ownerId: string, f: StudentsFilter): StudentsPage {
  const yearId = f.yearId ?? currentYearId(db, ownerId);
  const conds: (SQL | undefined)[] = [eq(students.ownerId, ownerId)];
  if (f.status) conds.push(eq(students.status, f.status));
  if (f.q) {
    // كل كلمة في عبارة البحث يجب أن تظهر في الاسم أو الرقم (بأي ترتيب)، فيجد «أحمد الحارثي» الطالب «أحمد بن سالم الحارثي»
    const tokens = normalizeArabic(f.q).split(' ').filter(Boolean).slice(0, 6);
    for (const token of tokens) {
      conds.push(or(likeContains(students.nameNormalized, token), likeContains(students.studentNumber, token)));
    }
  }
  if (f.sectionId) conds.push(eq(enrollments.sectionId, f.sectionId));
  if (f.unassigned) conds.push(isNull(enrollments.id));
  const where = and(...conds);

  const rows = db
    .select({ student: students, enr: enrollments, sec: sections })
    .from(students)
    .leftJoin(enrollments, and(eq(enrollments.studentId, students.id), yearId ? eq(enrollments.yearId, yearId) : sql`0`))
    .leftJoin(sections, eq(sections.id, enrollments.sectionId))
    .where(where)
    .orderBy(asc(students.nameNormalized))
    .limit(f.limit)
    .offset(f.offset)
    .all();

  const total =
    db
      .select({ c: count() })
      .from(students)
      .leftJoin(enrollments, and(eq(enrollments.studentId, students.id), yearId ? eq(enrollments.yearId, yearId) : sql`0`))
      .where(where)
      .get()?.c ?? 0;

  return {
    total,
    items: rows.map((r) => ({
      ...toStudentBase(r.student),
      enrollment:
        r.enr && r.sec
          ? { sectionId: r.sec.id, sectionLabel: sectionLabel(r.sec.gradeLevel, r.sec.name), yearId: r.enr.yearId, rollNo: r.enr.rollNo }
          : null,
    })),
  };
}

export function getStudentDto(db: Db, ownerId: string, id: string, yearId?: string | null): StudentDto {
  const s = requireStudent(db, ownerId, id);
  const y = yearId ?? currentYearId(db, ownerId);
  const enr = y
    ? db
        .select({ enr: enrollments, sec: sections })
        .from(enrollments)
        .innerJoin(sections, eq(sections.id, enrollments.sectionId))
        .where(and(eq(enrollments.studentId, id), eq(enrollments.yearId, y)))
        .get()
    : undefined;
  return {
    ...toStudentBase(s),
    enrollment: enr
      ? { sectionId: enr.sec.id, sectionLabel: sectionLabel(enr.sec.gradeLevel, enr.sec.name), yearId: enr.enr.yearId, rollNo: enr.enr.rollNo }
      : null,
  };
}

// ═════════════ الإنشاء والتعديل ═════════════
function dupNumberMessage(name: string): string {
  return `الرقم التعريفي مستخدم لطالب آخر (${name})`;
}

function findByNumber(db: Db, ownerId: string, number: string) {
  return db.select().from(students).where(and(eq(students.ownerId, ownerId), eq(students.studentNumber, number))).get();
}

function insertStudent(db: Db, ownerId: string, input: StudentInput): StudentRow {
  const fullName = cleanName(input.fullName);
  const number = input.studentNumber?.trim() || null;
  if (number) {
    const dup = findByNumber(db, ownerId, number);
    if (dup) throw conflict(dupNumberMessage(dup.fullName), 'STUDENT_NUMBER_TAKEN');
  }
  return db
    .insert(students)
    .values({
      ownerId,
      fullName,
      nameNormalized: normalizeArabic(fullName),
      studentNumber: number,
      gender: input.gender ?? null,
      birthDate: input.birthDate ?? null,
      guardianName: input.guardianName ?? null,
      guardianPhone: input.guardianPhone ?? null,
      notes: input.notes ?? null,
    })
    .returning()
    .get();
}

export function createStudent(db: Db, ownerId: string, input: StudentInput): StudentDto {
  const row = insertStudent(db, ownerId, input);
  return getStudentDto(db, ownerId, row.id);
}

export function updateStudent(
  db: Db,
  ownerId: string,
  id: string,
  input: Partial<StudentInput> & { status?: StudentRow['status'] },
): StudentDto {
  const s = requireStudent(db, ownerId, id);
  const patch: Partial<typeof students.$inferInsert> = {};
  if (input.fullName !== undefined) {
    patch.fullName = cleanName(input.fullName);
    patch.nameNormalized = normalizeArabic(patch.fullName);
  }
  if (input.studentNumber !== undefined) {
    const number = input.studentNumber?.trim() || null;
    if (number && number !== s.studentNumber) {
      const dup = findByNumber(db, ownerId, number);
      if (dup && dup.id !== id) throw conflict(dupNumberMessage(dup.fullName), 'STUDENT_NUMBER_TAKEN');
    }
    patch.studentNumber = number;
  }
  for (const key of ['gender', 'birthDate', 'guardianName', 'guardianPhone', 'notes', 'status'] as const) {
    if (input[key] !== undefined) (patch as Record<string, unknown>)[key] = input[key];
  }
  if (Object.keys(patch).length) {
    try {
      db.update(students).set(patch).where(eq(students.id, id)).run();
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict('الرقم التعريفي مستخدم لطالب آخر', 'STUDENT_NUMBER_TAKEN');
      throw err;
    }
  }
  return getStudentDto(db, ownerId, id);
}

export function studentDataCount(db: Db, ownerId: string, id: string): number {
  requireStudent(db, ownerId, id);
  const results = db.select({ c: count() }).from(assessmentResults).where(eq(assessmentResults.studentId, id)).get()?.c ?? 0;
  const notes = db.select({ c: count() }).from(studentNotes).where(eq(studentNotes.studentId, id)).get()?.c ?? 0;
  return results + notes;
}

export function deleteStudent(db: Db, ownerId: string, id: string, force: boolean): void {
  const n = studentDataCount(db, ownerId, id);
  if (n > 0 && !force) throw conflict(`للطالب ${n} سجل (درجات/ملاحظات) سيُحذف معه نهائيًا. أكّد الحذف`, 'CONFIRM_REQUIRED');
  db.delete(students).where(eq(students.id, id)).run();
  renumberAll(db, ownerId);
}

// ═════════════ الشعب: القوائم والتسجيل ═════════════
function nextRollNo(db: Db, sectionId: string): number {
  const max = db
    .select({ m: sql<number | null>`max(${enrollments.rollNo})` })
    .from(enrollments)
    .where(eq(enrollments.sectionId, sectionId))
    .get()?.m;
  return (max ?? 0) + 1;
}

/** يعيد ترقيم كل شعب المعلم ترقيمًا متسلسلًا (1..n) بعد الحذف/الإزالة */
function renumberAll(db: Db, ownerId: string): void {
  const rows = db
    .select({ id: enrollments.id, sectionId: enrollments.sectionId, rollNo: enrollments.rollNo })
    .from(enrollments)
    .where(eq(enrollments.ownerId, ownerId))
    .orderBy(asc(enrollments.sectionId), asc(enrollments.rollNo))
    .all();
  let last = '';
  let n = 0;
  for (const r of rows) {
    if (r.sectionId !== last) {
      last = r.sectionId;
      n = 0;
    }
    n++;
    if (r.rollNo !== n) db.update(enrollments).set({ rollNo: n }).where(eq(enrollments.id, r.id)).run();
  }
}

export function getRoster(db: Db, ownerId: string, sectionId: string): RosterEntryDto[] {
  requireSection(db, ownerId, sectionId);
  return db
    .select({ rollNo: enrollments.rollNo, student: students })
    .from(enrollments)
    .innerJoin(students, eq(students.id, enrollments.studentId))
    .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.sectionId, sectionId)))
    .orderBy(asc(enrollments.rollNo))
    .all()
    .map((r) => ({ rollNo: r.rollNo, student: toStudentBase(r.student) }));
}

export function addStudentsToSection(db: Db, ownerId: string, sectionId: string, inputs: StudentInput[]): RosterEntryDto[] {
  const section = requireSection(db, ownerId, sectionId);
  // أرقام مكررة داخل الدفعة نفسها
  const seen = new Set<string>();
  for (const i of inputs) {
    const n = i.studentNumber?.trim();
    if (!n) continue;
    if (seen.has(n)) throw conflict(`الرقم التعريفي ${n} مكرر في القائمة`, 'DUPLICATE_IN_BATCH');
    seen.add(n);
  }
  db.transaction((tx) => {
    let roll = nextRollNo(tx as unknown as Db, sectionId);
    for (const input of inputs) {
      const s = insertStudent(tx as unknown as Db, ownerId, input);
      tx.insert(enrollments).values({ ownerId, studentId: s.id, sectionId, yearId: section.yearId, rollNo: roll++ }).run();
    }
  });
  return getRoster(db, ownerId, sectionId);
}

/** تسجيل طلاب موجودين (مثلاً عند الترفيع من العام السابق). يتخطى من سُجّل مسبقًا هذا العام */
export function enrollExisting(
  db: Db,
  ownerId: string,
  sectionId: string,
  studentIds: string[],
): { enrolled: number; skipped: { studentId: string; fullName: string; reason: string }[] } {
  const section = requireSection(db, ownerId, sectionId);
  const unique = [...new Set(studentIds)];
  const rows = unique.length ? db.select().from(students).where(and(eq(students.ownerId, ownerId), inArray(students.id, unique))).all() : [];
  if (rows.length !== unique.length) throw badRequest('بعض الطلاب غير موجودين');
  const skipped: { studentId: string; fullName: string; reason: string }[] = [];
  let enrolled = 0;
  db.transaction((tx) => {
    let roll = nextRollNo(tx as unknown as Db, sectionId);
    for (const s of rows) {
      const existing = tx
        .select({ sectionId: enrollments.sectionId })
        .from(enrollments)
        .where(and(eq(enrollments.studentId, s.id), eq(enrollments.yearId, section.yearId)))
        .get();
      if (existing) {
        skipped.push({ studentId: s.id, fullName: s.fullName, reason: existing.sectionId === sectionId ? 'مسجّل في هذه الشعبة' : 'مسجّل في شعبة أخرى هذا العام' });
        continue;
      }
      tx.insert(enrollments).values({ ownerId, studentId: s.id, sectionId, yearId: section.yearId, rollNo: roll++ }).run();
      enrolled++;
    }
  });
  return { enrolled, skipped };
}

export function unenroll(db: Db, ownerId: string, sectionId: string, studentId: string): void {
  requireSection(db, ownerId, sectionId);
  requireStudent(db, ownerId, studentId);
  db.delete(enrollments).where(and(eq(enrollments.sectionId, sectionId), eq(enrollments.studentId, studentId))).run();
  renumberAll(db, ownerId);
}

export function moveStudent(db: Db, ownerId: string, studentId: string, targetSectionId: string): void {
  requireStudent(db, ownerId, studentId);
  const target = requireSection(db, ownerId, targetSectionId);
  const current = db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.yearId, target.yearId)))
    .get();
  db.transaction((tx) => {
    const roll = nextRollNo(tx as unknown as Db, targetSectionId);
    if (current) {
      if (current.sectionId === targetSectionId) return;
      tx.update(enrollments).set({ sectionId: targetSectionId, rollNo: roll }).where(eq(enrollments.id, current.id)).run();
    } else {
      tx.insert(enrollments).values({ ownerId, studentId, sectionId: targetSectionId, yearId: target.yearId, rollNo: roll }).run();
    }
  });
  renumberAll(db, ownerId);
}

export function reorderSection(db: Db, ownerId: string, sectionId: string, spec: { sort: 'name' } | { order: string[] }): RosterEntryDto[] {
  requireSection(db, ownerId, sectionId);
  const rows = db
    .select({ id: enrollments.id, studentId: enrollments.studentId, norm: students.nameNormalized })
    .from(enrollments)
    .innerJoin(students, eq(students.id, enrollments.studentId))
    .where(eq(enrollments.sectionId, sectionId))
    .all();
  let ordered: string[];
  if ('sort' in spec) {
    ordered = [...rows].sort((a, b) => (a.norm < b.norm ? -1 : a.norm > b.norm ? 1 : 0)).map((r) => r.studentId);
  } else {
    const have = new Set(rows.map((r) => r.studentId));
    const want = new Set(spec.order);
    if (have.size !== want.size || [...have].some((id) => !want.has(id))) throw badRequest('قائمة الترتيب لا تطابق طلاب الشعبة');
    ordered = spec.order;
  }
  const byStudent = new Map(rows.map((r) => [r.studentId, r.id]));
  db.transaction((tx) => {
    ordered.forEach((studentId, i) => {
      tx.update(enrollments).set({ rollNo: i + 1 }).where(eq(enrollments.id, byStudent.get(studentId)!)).run();
    });
  });
  return getRoster(db, ownerId, sectionId);
}

// ═════════════ الاستيراد ═════════════
export type RawImportRow = { rowNumber: number; fullName: string; studentNumber: string | null; gender: 'male' | 'female' | null };

/** يصنّف صفوف الاستيراد (جديد / ربط بطالب موجود / تخطّي) دون أي كتابة */
export function previewImport(db: Db, ownerId: string, sectionId: string, raw: RawImportRow[], detected: ImportPreviewDto['detected']): ImportPreviewDto {
  const section = requireSection(db, ownerId, sectionId);
  const all = db.select().from(students).where(eq(students.ownerId, ownerId)).all();
  const byNumber = new Map(all.filter((s) => s.studentNumber).map((s) => [s.studentNumber!, s]));
  const byName = new Map<string, StudentRow[]>();
  for (const s of all) byName.set(s.nameNormalized, [...(byName.get(s.nameNormalized) ?? []), s]);
  const enrolledThisYear = new Map(
    db
      .select({ studentId: enrollments.studentId, sectionId: enrollments.sectionId })
      .from(enrollments)
      .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.yearId, section.yearId)))
      .all()
      .map((e) => [e.studentId, e.sectionId]),
  );

  const seenKeys = new Set<string>();
  const rows: ImportRowDto[] = raw.map((r) => {
    const issues: string[] = [];
    const norm = normalizeArabic(r.fullName);
    let action: ImportRowDto['action'] = 'create';
    let link: StudentRow | null = null;

    if (norm.length < 2) {
      issues.push('اسم غير صالح');
      action = 'skip';
    }
    const key = r.studentNumber ? `n:${r.studentNumber}` : `m:${norm}`;
    if (action !== 'skip' && seenKeys.has(key)) {
      issues.push('مكرر داخل الملف');
      action = 'skip';
    }
    seenKeys.add(key);

    if (action !== 'skip') {
      const candidate = r.studentNumber ? byNumber.get(r.studentNumber) : byName.get(norm)?.length === 1 ? byName.get(norm)![0] : undefined;
      if (candidate) {
        const where = enrolledThisYear.get(candidate.id);
        if (where === sectionId) {
          issues.push('موجود في هذه الشعبة');
          action = 'skip';
        } else if (where) {
          issues.push('مسجّل في شعبة أخرى هذا العام');
          action = 'skip';
        } else {
          link = candidate;
          action = 'link';
          issues.push('طالب موجود سابقًا — سيُربط بالشعبة دون إنشاء نسخة جديدة');
        }
      } else if (!r.studentNumber && (byName.get(norm)?.length ?? 0) > 1) {
        issues.push('الاسم يطابق أكثر من طالب سابق — سيُنشأ كطالب جديد');
      }
    }
    return {
      rowNumber: r.rowNumber,
      fullName: r.fullName,
      studentNumber: r.studentNumber,
      gender: r.gender,
      action,
      linkStudentId: link?.id ?? null,
      linkStudentName: link?.fullName ?? null,
      issues,
    };
  });
  return { rows, detected };
}

export function commitImport(
  db: Db,
  ownerId: string,
  sectionId: string,
  rows: (StudentInput & { linkStudentId?: string | null })[],
): { created: number; linked: number; roster: RosterEntryDto[] } {
  const section = requireSection(db, ownerId, sectionId);
  let created = 0;
  let linked = 0;
  db.transaction((tx) => {
    const t = tx as unknown as Db;
    let roll = nextRollNo(t, sectionId);
    for (const row of rows) {
      let studentId: string;
      if (row.linkStudentId) {
        const s = requireStudent(t, ownerId, row.linkStudentId);
        const existing = tx
          .select({ id: enrollments.id })
          .from(enrollments)
          .where(and(eq(enrollments.studentId, s.id), eq(enrollments.yearId, section.yearId)))
          .get();
        if (existing) continue; // سُجّل بالفعل: نتجاوزه بدل الفشل الكلي
        studentId = s.id;
        linked++;
      } else {
        studentId = insertStudent(t, ownerId, row).id;
        created++;
      }
      tx.insert(enrollments).values({ ownerId, studentId, sectionId, yearId: section.yearId, rollNo: roll++ }).run();
    }
  });
  return { created, linked, roster: getRoster(db, ownerId, sectionId) };
}

// ═════════════ ملاحظات الطالب ═════════════
export function listNotes(db: Db, ownerId: string, studentId: string): NoteDto[] {
  requireStudent(db, ownerId, studentId);
  const rows = db
    .select()
    .from(studentNotes)
    .where(and(eq(studentNotes.ownerId, ownerId), eq(studentNotes.studentId, studentId)))
    .orderBy(desc(studentNotes.date), desc(studentNotes.createdAt))
    .all();
  const infos = assignmentMap(db, ownerId, rows.map((r) => r.assignmentId).filter((x): x is string => !!x));
  return rows.map((n) => {
    const a = n.assignmentId ? infos.get(n.assignmentId) : undefined;
    return {
      id: n.id,
      studentId: n.studentId,
      assignmentId: n.assignmentId,
      assignmentLabel: a ? `${a.subjectName} — ${a.sectionLabel}` : null,
      date: n.date,
      category: n.category,
      text: n.text,
      createdAt: n.createdAt,
    };
  });
}

export function createNote(
  db: Db,
  ownerId: string,
  studentId: string,
  input: { assignmentId?: string | null; date: string; category: NoteDto['category']; text: string },
): NoteDto {
  requireStudent(db, ownerId, studentId);
  if (input.assignmentId) assignmentMap(db, ownerId, [input.assignmentId]).get(input.assignmentId) ?? (() => { throw badRequest('المقرر غير صالح'); })();
  const row = db
    .insert(studentNotes)
    .values({ ownerId, studentId, assignmentId: input.assignmentId ?? null, date: input.date, category: input.category, text: input.text })
    .returning()
    .get();
  return listNotes(db, ownerId, studentId).find((n) => n.id === row.id)!;
}

export function updateNote(
  db: Db,
  ownerId: string,
  id: string,
  input: Partial<{ assignmentId: string | null; date: string; category: NoteDto['category']; text: string }>,
): NoteDto {
  const note = requireNote(db, ownerId, id);
  if (input.assignmentId) assignmentMap(db, ownerId, [input.assignmentId]).get(input.assignmentId) ?? (() => { throw badRequest('المقرر غير صالح'); })();
  db.update(studentNotes).set(input).where(eq(studentNotes.id, id)).run();
  return listNotes(db, ownerId, note.studentId).find((n) => n.id === id)!;
}

export function deleteNote(db: Db, ownerId: string, id: string): void {
  requireNote(db, ownerId, id);
  db.delete(studentNotes).where(eq(studentNotes.id, id)).run();
}
