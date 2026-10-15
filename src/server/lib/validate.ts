import type { z } from 'zod';
import { validationError } from './errors';

/** تحقق ورمي AppError(400) برسائل عربية عند الفشل */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data ?? {});
  if (!result.success) throw validationError(result.error);
  return result.data;
}
