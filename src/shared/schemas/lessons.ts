import { z } from 'zod';
import { ACTIVITY_PHASE, LESSON_STATUS, MAX_PERIODS } from '../constants';
import { dateSchema, idSchema, optText, requiredText, stringList } from './common';

export const activitySchema = z.object({
  id: z.string().max(40).optional(),
  phase: z.enum(ACTIVITY_PHASE.values),
  description: z.string().trim().min(1).max(2000),
  minutes: z.number().int().min(0).max(240).nullable().optional(),
});

export type LessonActivity = z.infer<typeof activitySchema>;

const periodSchema = z.number().int().min(1).max(MAX_PERIODS);

const lessonFields = {
  assignmentId: idSchema,
  termId: idSchema.nullable().optional(),
  date: dateSchema,
  period: periodSchema.nullable().optional(),
  title: requiredText(200),
  unitName: optText(200),
  lessonNumber: optText(30),
  durationMinutes: z.number().int().min(5).max(240).nullable().optional(),
  outcomes: stringList(),
  objectives: stringList(),
  concepts: stringList(),
  strategies: stringList(),
  resources: stringList(),
  activities: z.array(activitySchema).max(30),
  assessmentMethods: stringList(),
  assessmentNotes: optText(),
  homework: optText(),
  supportPlan: optText(),
  enrichmentPlan: optText(),
  notes: optText(),
  reflection: optText(),
  status: z.enum(LESSON_STATUS.values),
  isTemplate: z.boolean(),
};

export const createLessonSchema = z.object({
  ...lessonFields,
  outcomes: lessonFields.outcomes.default([]),
  objectives: lessonFields.objectives.default([]),
  concepts: lessonFields.concepts.default([]),
  strategies: lessonFields.strategies.default([]),
  resources: lessonFields.resources.default([]),
  activities: lessonFields.activities.default([]),
  assessmentMethods: lessonFields.assessmentMethods.default([]),
  status: lessonFields.status.default('draft'),
  isTemplate: lessonFields.isTemplate.default(false),
});

export const updateLessonSchema = z.object(lessonFields).partial();

export const copyLessonSchema = z.object({
  targets: z
    .array(
      z.object({
        assignmentId: idSchema,
        date: dateSchema,
        period: periodSchema.nullable().optional(),
      }),
    )
    .min(1, 'اختر وجهة واحدة على الأقل')
    .max(30),
  /** حفظ النسخة في مكتبة القوالب بدل جدولتها */
  asTemplate: z.boolean().default(false),
});

export const lessonsQuery = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  assignmentId: idSchema.optional(),
  sectionId: idSchema.optional(),
  subjectId: idSchema.optional(),
  termId: idSchema.optional(),
  status: z.enum(LESSON_STATUS.values).optional(),
  q: z.string().trim().max(100).optional(),
  templates: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateLessonInput = z.input<typeof createLessonSchema>;
export type UpdateLessonInput = z.input<typeof updateLessonSchema>;
export type CopyLessonInput = z.input<typeof copyLessonSchema>;
