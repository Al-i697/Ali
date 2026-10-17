import { z } from 'zod';
import { CLASS_LIMITS, CLASS_RECORD_KIND, MAX_PERIODS } from '../constants';
import { dateSchema, idSchema, optText } from './common';

const periodSchema = z.number().int().min(1).max(MAX_PERIODS);

/** تعريف الحصة: المقرر (شعبة × مادة) والتاريخ، والحصة اختيارية لمن لا يستعمل الجدول */
const sessionFields = {
  assignmentId: idSchema,
  date: dateSchema,
  period: periodSchema.nullable().optional(),
};

/** مفتاح الحصة في نص الاستعلام (GET/DELETE) */
export const classSessionQuery = z.object({
  assignmentId: idSchema,
  date: dateSchema,
  period: z.coerce.number().int().min(1).max(MAX_PERIODS).optional(),
});

/**
 * ضبط مشاركة طالب في حصة بالحالة المطلوبة لا بالزيادة (فيصير تكرار الطلب أو تأخره بلا أثر):
 * null = إلغاء التسجيل (لم يُسجَّل شيء)، 0 = لم يشارك، n = شارك n مرة.
 */
export const setParticipationSchema = z.object({
  ...sessionFields,
  studentId: idSchema,
  count: z.number().int().min(0).max(CLASS_LIMITS.maxParticipation).nullable(),
});

/** «لم يشارك» لكل من لم يُسجَّل له شيء في الحصة */
export const fillRestSchema = z.object(sessionFields);

const recordFields = {
  kind: z.enum(CLASS_RECORD_KIND.values),
  /** السبب المختصر: من القائمة الجاهزة أو يكتبه المعلم */
  reason: optText(CLASS_LIMITS.reason),
  /** تفاصيل إضافية */
  note: optText(CLASS_LIMITS.note),
};

export const NEEDS_TEXT_MESSAGE = 'اختر سببًا أو اكتب ملاحظة';

export const createClassRecordSchema = z
  .object({ ...sessionFields, studentId: idSchema, ...recordFields })
  .superRefine((v, ctx) => {
    if (!v.reason && !v.note) ctx.addIssue({ code: 'custom', path: ['reason'], message: NEEDS_TEXT_MESSAGE });
  });

/** PATCH: لا يغيّر الحصة ولا الطالب — عدّل النص أو النوع فقط (للنقل احذف وأنشئ) */
export const updateClassRecordSchema = z.object(recordFields).partial();

const range = {
  from: dateSchema.optional(),
  to: dateSchema.optional(),
};

const rangeOrdered = (v: { from?: string; to?: string }) => !v.from || !v.to || v.to >= v.from;
const rangeMessage = { message: 'تاريخ النهاية يجب أن يكون بعد البداية', path: ['to'] };

export const classOverviewQuery = z.object({
  /** عدد آخر الحصص المسجّلة المعروضة */
  recent: z.coerce.number().int().min(1).max(50).default(12),
});

export const classSummaryQuery = z
  .object({ assignmentId: idSchema.optional(), sectionId: idSchema.optional(), ...range })
  .refine((v) => !!v.assignmentId || !!v.sectionId, { message: 'حدّد الشعبة أو المقرر', path: ['assignmentId'] })
  .refine(rangeOrdered, rangeMessage);

export const classStudentQuery = z
  .object({
    assignmentId: idSchema.optional(),
    ...range,
    /** أقصى عدد حصص في الخط الزمني (الأحدث أولًا) */
    limit: z.coerce.number().int().min(1).max(500).default(200),
  })
  .refine(rangeOrdered, rangeMessage);

export type SetParticipationInput = z.input<typeof setParticipationSchema>;
export type FillRestInput = z.input<typeof fillRestSchema>;
export type CreateClassRecordInput = z.input<typeof createClassRecordSchema>;
export type UpdateClassRecordInput = z.input<typeof updateClassRecordSchema>;
