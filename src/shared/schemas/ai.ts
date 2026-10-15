import { z } from 'zod';
import { AI_LIMITS, SUPPORT_KIND } from '../constants';
import { idSchema, optText, requiredText } from './common';

const objectives = z.array(z.string().trim().min(1).max(AI_LIMITS.objective)).max(AI_LIMITS.objectives);

/** كل حقل نصي هنا يكتبه المعلم أو يراجعه بنفسه قبل الإرسال؛ لا يقرأ الخادم شيئًا آخر من بياناته ليُرسله (عدا اسم المادة والصف) */
const base = {
  /** المقرر (للصف والمادة فقط) — يتحقق الخادم من ملكيته */
  assignmentId: idSchema.optional(),
  /** المعلم يؤكد أن ما يطابق اسم أحد طلابه في النص ليس اسم طالب (شخصية عامة/تاريخية مثلًا) */
  acknowledgeNames: z.boolean().optional(),
};

export const aiLessonInput = z.object({
  ...base,
  task: z.literal('lesson-draft'),
  title: requiredText(AI_LIMITS.title),
  objectives: objectives.default([]),
  notes: optText(AI_LIMITS.notes),
  minutes: z.number().int().min(10).max(180).optional(),
});

export const aiAssessmentInput = z.object({
  ...base,
  task: z.literal('assessment-ideas'),
  title: requiredText(AI_LIMITS.title),
  objectives: objectives.default([]),
  notes: optText(AI_LIMITS.notes),
});

export const aiSupportInput = z.object({
  ...base,
  task: z.literal('support-plan-ideas'),
  kind: z.enum(SUPPORT_KIND.values),
  /** وصف عام للمهارة أو الصعوبة — دون اسم الطالب */
  focus: requiredText(AI_LIMITS.focus),
});

export const aiRunSchema = z.discriminatedUnion('task', [aiLessonInput, aiAssessmentInput, aiSupportInput]);

export const aiSettingsSchema = z.object({ enabled: z.boolean() });

export type AiRunInput = z.input<typeof aiRunSchema>;
export type AiRunParsed = z.output<typeof aiRunSchema>;
