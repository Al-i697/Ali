import { z } from 'zod';
import { LAB_KIND, LAB_STATUS, MAX_PERIODS } from '../constants';
import { dateSchema, idSchema, optText, requiredText, stringList } from './common';

const periodSchema = z.number().int().min(1).max(MAX_PERIODS);

const labFields = {
  /** المقرر (شعبة + مادة)؛ يُترك فارغًا للأنشطة العامة على مستوى المدرسة (معرض، رحلة…) */
  assignmentId: idSchema.nullable().optional(),
  date: dateSchema,
  period: periodSchema.nullable().optional(),
  kind: z.enum(LAB_KIND.values),
  title: requiredText(200),
  location: optText(120),
  objectives: stringList(),
  materials: stringList(),
  safety: stringList(),
  procedure: optText(),
  results: optText(),
  /** عدد الطلاب المشاركين فعليًا */
  participants: z.number().int().min(0).max(2000).nullable().optional(),
  notes: optText(),
  status: z.enum(LAB_STATUS.values),
};

export const createLabActivitySchema = z.object({
  ...labFields,
  kind: labFields.kind.default('experiment'),
  objectives: labFields.objectives.default([]),
  materials: labFields.materials.default([]),
  safety: labFields.safety.default([]),
  status: labFields.status.default('planned'),
});

export const updateLabActivitySchema = z.object(labFields).partial();

/** نسخ النشاط إلى شعب/تواريخ أخرى كأنشطة «مخطَّطة» جديدة (تُنسخ الخطة دون النتائج والمشاركين) */
export const copyLabActivitySchema = z.object({
  targets: z
    .array(
      z.object({
        assignmentId: idSchema.nullable().optional(),
        date: dateSchema,
        period: periodSchema.nullable().optional(),
      }),
    )
    .min(1, 'اختر وجهة واحدة على الأقل')
    .max(30),
});

export const labActivitiesQuery = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  assignmentId: idSchema.optional(),
  sectionId: idSchema.optional(),
  subjectId: idSchema.optional(),
  kind: z.enum(LAB_KIND.values).optional(),
  status: z.enum(LAB_STATUS.values).optional(),
  /** overdue = مخطَّط فات موعده ولم يُسجَّل تنفيذه ولا إلغاؤه */
  view: z.enum(['overdue']).optional(),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateLabActivityInput = z.input<typeof createLabActivitySchema>;
export type UpdateLabActivityInput = z.input<typeof updateLabActivitySchema>;
export type CopyLabActivityInput = z.input<typeof copyLabActivitySchema>;
