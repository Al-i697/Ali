import { z } from 'zod';
import { SUPPORT_KIND, SUPPORT_STATUS } from '../constants';
import { dateSchema, idSchema, optText, requiredText, stringList } from './common';

const planFields = {
  studentId: idSchema,
  /** المقرر الذي تتعلق به الخطة (يُؤخذ منه خط الأساس للنسبة) — اختياري للخطط العامة */
  assignmentId: idSchema.nullable().optional(),
  kind: z.enum(SUPPORT_KIND.values),
  title: requiredText(200),
  reason: optText(2000),
  goal: requiredText(2000),
  strategies: stringList(),
  startDate: dateSchema,
  reviewDate: dateSchema.nullable().optional(),
  status: z.enum(SUPPORT_STATUS.values),
  outcome: optText(2000),
};

const reviewAfterStart = (v: { startDate?: string; reviewDate?: string | null }) =>
  !v.reviewDate || !v.startDate || v.reviewDate >= v.startDate;
const reviewMsg = { error: 'تاريخ المراجعة يجب ألا يسبق تاريخ البدء', path: ['reviewDate'] };

export const createSupportPlanSchema = z
  .object({ ...planFields, strategies: planFields.strategies.default([]), status: planFields.status.default('open') })
  .refine(reviewAfterStart, reviewMsg);

export const updateSupportPlanSchema = z.object(planFields).omit({ studentId: true }).partial().refine(reviewAfterStart, reviewMsg);

/** إنشاء خطط لعدة طلاب دفعة واحدة (من قائمة الاقتراحات): نفس العنوان والهدف والاستراتيجيات يُعدَّل لكل طالب لاحقًا */
export const bulkSupportPlansSchema = z
  .object({
    assignmentId: idSchema,
    termId: idSchema.optional(),
    studentIds: z.array(idSchema).min(1).max(100),
    kind: z.enum(SUPPORT_KIND.values),
    title: requiredText(200).optional(),
    goal: requiredText(2000).optional(),
    strategies: stringList().default([]),
    startDate: dateSchema.optional(),
    reviewDate: dateSchema.nullable().optional(),
  })
  .refine(reviewAfterStart, reviewMsg);

export const supportPlansQuery = z.object({
  studentId: idSchema.optional(),
  assignmentId: idSchema.optional(),
  sectionId: idSchema.optional(),
  kind: z.enum(SUPPORT_KIND.values).optional(),
  status: z.enum(SUPPORT_STATUS.values).optional(),
  /** open = مفتوحة فقط، due = مفتوحة وحان موعد مراجعتها */
  view: z.enum(['due']).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

export const supportSuggestionsQuery = z.object({
  assignmentId: idSchema.optional(),
  termId: idSchema.optional(),
});

export const supportNoteSchema = z.object({
  date: dateSchema,
  text: requiredText(2000),
});
export const updateSupportNoteSchema = supportNoteSchema.partial();

export type CreateSupportPlanInput = z.input<typeof createSupportPlanSchema>;
export type UpdateSupportPlanInput = z.input<typeof updateSupportPlanSchema>;
export type BulkSupportPlansInput = z.input<typeof bulkSupportPlansSchema>;
