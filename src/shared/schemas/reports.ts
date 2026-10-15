import { z } from 'zod';
import { REPORT_FORMAT, REPORT_TYPE } from '../constants';
import { dateSchema, idSchema } from './common';

const bool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

/** معاملات التقارير تأتي في نص الاستعلام (GET) ليسهل تنزيلها وطباعتها */
export const reportQuery = z.object({
  assignmentId: idSchema.optional(),
  termId: idSchema.optional(),
  studentId: idSchema.optional(),
  lessonId: idSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  includeNotes: bool.optional(),
  includeGuardian: bool.optional(),
});

export const reportParamsSchema = z.object({
  type: z.enum(REPORT_TYPE.values),
  format: z.enum(REPORT_FORMAT),
});

export type ReportQuery = z.infer<typeof reportQuery>;
