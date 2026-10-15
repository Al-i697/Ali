import { z } from 'zod';
import { MAX_GRADE, MAX_PERIODS, MIN_GRADE, SUBJECT_COLORS } from '../constants';
import { dateSchema, idSchema, optText, requiredText } from './common';

// ───────────── العام الدراسي والفصول ─────────────
export const createYearSchema = z
  .object({
    name: z.string().trim().min(3).max(40),
    startDate: dateSchema,
    endDate: dateSchema,
    makeCurrent: z.boolean().default(true),
  })
  .refine((y) => y.startDate < y.endDate, {
    message: 'نهاية العام يجب أن تكون بعد بدايته',
    path: ['endDate'],
  });

export const updateYearSchema = z
  .object({
    name: z.string().trim().min(3).max(40).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .refine((y) => !y.startDate || !y.endDate || y.startDate < y.endDate, {
    message: 'نهاية العام يجب أن تكون بعد بدايته',
    path: ['endDate'],
  });

export const updateTermSchema = z
  .object({
    name: requiredText(60).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .refine((t) => !t.startDate || !t.endDate || t.startDate < t.endDate, {
    message: 'نهاية الفصل يجب أن تكون بعد بدايته',
    path: ['endDate'],
  });

// ───────────── المواد ─────────────
export const createSubjectSchema = z.object({
  name: requiredText(80),
  color: z.enum(SUBJECT_COLORS).optional(),
});

export const updateSubjectSchema = z.object({
  name: requiredText(80).optional(),
  color: z.enum(SUBJECT_COLORS).optional(),
  isArchived: z.boolean().optional(),
});

// ───────────── الشعب والمقررات ─────────────
export const gradeLevelSchema = z.number().int().min(MIN_GRADE).max(MAX_GRADE);

export const createSectionSchema = z.object({
  yearId: idSchema,
  gradeLevel: gradeLevelSchema,
  name: z.string().trim().min(1).max(20),
  subjectIds: z.array(idSchema).max(20).default([]),
  notes: optText(500),
});

export const updateSectionSchema = z.object({
  gradeLevel: gradeLevelSchema.optional(),
  name: z.string().trim().min(1).max(20).optional(),
  notes: optText(500),
  isArchived: z.boolean().optional(),
});

export const addAssignmentSchema = z.object({
  subjectId: idSchema,
  weeklyPeriods: z.number().int().min(0).max(MAX_PERIODS * 6).optional(),
});

export const updateAssignmentSchema = z.object({
  weeklyPeriods: z.number().int().min(0).max(MAX_PERIODS * 6).nullable().optional(),
});

/** نسخ بنية شعب العام السابق إلى عام جديد (دون الطلاب أو الدرجات) */
export const cloneStructureSchema = z.object({
  fromYearId: idSchema,
  toYearId: idSchema,
});

export type CreateYearInput = z.input<typeof createYearSchema>;
export type CreateSectionInput = z.input<typeof createSectionSchema>;
