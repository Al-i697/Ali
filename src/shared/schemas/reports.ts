import { z } from 'zod';
import { LAB_KIND, LAB_STATUS, REPORT_FORMAT, REPORT_TYPE, SUPPORT_KIND, SUPPORT_STATUS } from '../constants';
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
  planId: idSchema.optional(),
  kind: z.enum(SUPPORT_KIND.values).optional(),
  status: z.enum(SUPPORT_STATUS.values).optional(),
  labId: idSchema.optional(),
  labKind: z.enum(LAB_KIND.values).optional(),
  labStatus: z.enum(LAB_STATUS.values).optional(),
  /** كل الفترات: يتجاهل from/to (وإلا فالافتراضي الفصل الحالي) */
  labAll: bool.optional(),
  /** كل الفترات في تقارير إدارة الصف (وإلا فالافتراضي الفصل الحالي) */
  classAll: bool.optional(),
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
