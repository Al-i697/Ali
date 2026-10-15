import type { ZodError } from 'zod';

/** خطأ متوقع يُعرض للمستخدم برسالة عربية واضحة */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string, code = 'BAD_REQUEST', fields?: Record<string, string>) =>
  new AppError(400, code, message, fields);
export const unauthorized = (message = 'يلزم تسجيل الدخول') => new AppError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'لا تملك صلاحية تنفيذ هذا الإجراء') =>
  new AppError(403, 'FORBIDDEN', message);
/** نستخدم 404 (لا 403) عند الوصول لمورد معلم آخر كي لا نكشف وجوده */
export const notFound = (what = 'العنصر المطلوب') => new AppError(404, 'NOT_FOUND', `${what} غير موجود`);
export const conflict = (message: string, code = 'CONFLICT') => new AppError(409, code, message);
export const tooMany = (message = 'محاولات كثيرة. حاول لاحقًا') =>
  new AppError(429, 'TOO_MANY_REQUESTS', message);

export function validationError(error: ZodError): AppError {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.') || '_';
    if (!(key in fields)) fields[key] = issue.message;
  }
  const first = error.issues[0];
  const message =
    error.issues.length === 1 && first
      ? first.path.length
        ? first.message
        : first.message
      : 'تحقق من الحقول المُدخلة';
  return new AppError(400, 'VALIDATION_ERROR', message, fields);
}

/** هل الخطأ انتهاك قيد فريد في SQLite؟ (احتياط للسباقات بعد الفحص المسبق) */
export function isUniqueViolation(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return typeof code === 'string' && code.startsWith('SQLITE_CONSTRAINT') && /UNIQUE|PRIMARYKEY/.test(code);
}

export function isForeignKeyViolation(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY';
}
