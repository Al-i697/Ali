import { z } from 'zod';
import { GENDER, LIMITS, NOTE_CATEGORY, STUDENT_STATUS } from '../constants';
import { cleanName } from '../arabic';
import { dateSchema, idSchema, optText } from './common';

const fullName = z
  .string()
  .transform(cleanName)
  .pipe(z.string().min(2, 'الاسم قصير جدًا').max(LIMITS.nameMax));

export const studentFields = {
  fullName,
  studentNumber: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\p{L}\p{N}\-_/.]*$/u, 'الرقم يجب أن يتكوّن من حروف وأرقام فقط')
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v)),
  gender: z.enum(GENDER.values).nullable().optional(),
  birthDate: dateSchema.nullable().optional(),
  guardianName: optText(120),
  guardianPhone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s\-()]*$/, 'رقم الهاتف غير صالح')
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v)),
  notes: optText(2000),
};

export const createStudentSchema = z.object(studentFields);

export const updateStudentSchema = z.object({
  ...studentFields,
  fullName: fullName.optional(),
  status: z.enum(STUDENT_STATUS.values).optional(),
});

/** إضافة طلاب جدد إلى شعبة (يُنشأ سجل الطالب والتسجيل معًا) */
export const addStudentsSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(LIMITS.importMaxRows),
});

/** تسجيل طالب موجود في شعبة (مثلاً عند الترفيع لعام جديد) */
export const enrollExistingSchema = z.object({
  studentIds: z.array(idSchema).min(1).max(LIMITS.importMaxRows),
});

/** تأكيد استيراد معاين مسبقًا: كل صف إما جديد أو مرتبط بطالب موجود */
export const importCommitSchema = z.object({
  rows: z
    .array(
      z.object({
        ...studentFields,
        linkStudentId: idSchema.nullable().optional(),
      }),
    )
    .min(1)
    .max(LIMITS.importMaxRows),
});

export const reorderStudentsSchema = z.union([
  z.object({ sort: z.literal('name') }),
  z.object({ order: z.array(idSchema).min(1).max(LIMITS.importMaxRows) }),
]);

export const moveStudentSchema = z.object({ sectionId: idSchema });

export const studentsQuery = z.object({
  q: z.string().trim().max(100).optional(),
  sectionId: idSchema.optional(),
  yearId: idSchema.optional(),
  status: z.enum(STUDENT_STATUS.values).optional(),
  unassigned: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

// ───────────── ملاحظات الطالب ─────────────
export const createNoteSchema = z.object({
  assignmentId: idSchema.nullable().optional(),
  date: dateSchema,
  category: z.enum(NOTE_CATEGORY.values),
  text: z.string().trim().min(1).max(2000),
});

export const updateNoteSchema = createNoteSchema.partial();

export type StudentInput = z.input<typeof createStudentSchema>;
export type ImportCommitInput = z.input<typeof importCommitSchema>;
