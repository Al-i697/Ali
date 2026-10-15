import { z } from 'zod';
import {
  ASSESSMENT_MODE,
  ASSESSMENT_TYPE,
  MAX_SCORE_LIMIT,
  RESULT_STATUS,
  SCORE_DECIMALS,
} from '../constants';
import { hasAtMostDecimals } from '../gradebook';
import { dateSchema, idSchema, optText, requiredText } from './common';

const decimalsMsg = `يُسمح بحد أقصى ${SCORE_DECIMALS} خانتين عشريتين`;

const assessmentFields = {
  assignmentId: idSchema,
  termId: idSchema,
  title: requiredText(200),
  type: z.enum(ASSESSMENT_TYPE.values),
  mode: z.enum(ASSESSMENT_MODE.values),
  maxScore: z
    .number()
    .positive('الدرجة العظمى يجب أن تكون أكبر من صفر')
    .max(MAX_SCORE_LIMIT)
    .refine((v) => hasAtMostDecimals(v), decimalsMsg)
    .nullable()
    .optional(),
  /** الدرجات التي يساهم بها في المجموع (افتراضيًا = الدرجة العظمى) */
  weight: z
    .number()
    .min(0)
    .max(MAX_SCORE_LIMIT)
    .refine((v) => hasAtMostDecimals(v), decimalsMsg)
    .nullable()
    .optional(),
  date: dateSchema.nullable().optional(),
  description: optText(2000),
  countsTowardTotal: z.boolean(),
  skillIds: z.array(idSchema).max(20),
};

export const createAssessmentSchema = z
  .object({
    ...assessmentFields,
    mode: assessmentFields.mode.default('score'),
    countsTowardTotal: assessmentFields.countsTowardTotal.default(true),
    skillIds: assessmentFields.skillIds.default([]),
  })
  .superRefine((a, ctx) => {
    if (a.mode === 'score' && (a.maxScore === null || a.maxScore === undefined))
      ctx.addIssue({ code: 'custom', message: 'حدّد الدرجة العظمى', path: ['maxScore'] });
  });

export const updateAssessmentSchema = z.object(assessmentFields).partial();

const resultEntry = z
  .object({
    studentId: idSchema,
    score: z
      .number()
      .min(0, 'الدرجة لا يمكن أن تكون سالبة')
      .refine((v) => hasAtMostDecimals(v), decimalsMsg)
      .nullable()
      .optional(),
    level: z.number().int().min(1).max(4).nullable().optional(),
    status: z.enum(RESULT_STATUS.values).default('graded'),
    note: optText(500),
  })
  .superRefine((r, ctx) => {
    if (r.status !== 'graded' && r.score !== null && r.score !== undefined)
      ctx.addIssue({
        code: 'custom',
        message: 'لا تُسجَّل درجة لطالب غائب أو معذور',
        path: ['score'],
      });
  });

export const saveResultsSchema = z.object({
  results: z.array(resultEntry).min(1).max(500),
});

export type ResultEntryInput = z.input<typeof resultEntry>;

export const assessmentsQuery = z.object({
  assignmentId: idSchema,
  termId: idSchema.optional(),
});

export const gradebookQuery = z.object({
  assignmentId: idSchema,
  termId: idSchema,
});

// ───────────── المهارات ─────────────
export const createSkillSchema = z.object({
  subjectId: idSchema,
  gradeLevel: z.number().int().min(1).max(12).nullable().optional(),
  code: optText(20),
  title: requiredText(200),
  description: optText(1000),
});

export const updateSkillSchema = createSkillSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type CreateAssessmentInput = z.input<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.input<typeof updateAssessmentSchema>;
export type SaveResultsInput = z.input<typeof saveResultsSchema>;
