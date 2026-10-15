import { z } from 'zod';
import { MAX_PERIODS, TASK_KIND, TASK_PRIORITY, TASK_STATUS } from '../constants';
import { dateSchema, idSchema, optText, requiredText, timeSchema } from './common';

const taskFields = {
  title: requiredText(200),
  description: optText(2000),
  kind: z.enum(TASK_KIND.values),
  dueDate: dateSchema.nullable().optional(),
  dueTime: timeSchema.nullable().optional(),
  priority: z.enum(TASK_PRIORITY.values),
  assignmentId: idSchema.nullable().optional(),
  status: z.enum(TASK_STATUS.values),
};

export const createTaskSchema = z.object({
  ...taskFields,
  kind: taskFields.kind.default('task'),
  priority: taskFields.priority.default('normal'),
  status: taskFields.status.default('open'),
});

export const updateTaskSchema = z.object(taskFields).partial();

export const tasksQuery = z.object({
  status: z.enum(TASK_STATUS.values).optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

export const calendarQuery = z.object({
  from: dateSchema,
  to: dateSchema,
});

// ───────────── الجدول الأسبوعي ─────────────
export const setSlotSchema = z.object({
  yearId: idSchema,
  weekday: z.number().int().min(0).max(6),
  period: z.number().int().min(1).max(MAX_PERIODS),
  /** null يعني إفراغ الخانة */
  assignmentId: idSchema.nullable(),
  room: optText(30),
});

export const timetableQuery = z.object({ yearId: idSchema });

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type SetSlotInput = z.input<typeof setSlotSchema>;
