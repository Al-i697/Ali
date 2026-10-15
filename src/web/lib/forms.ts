import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ApiError, errorMessage } from './api';

/**
 * يوزّع أخطاء الخادم على حقول النموذج، ويُرجع رسالة عامة تُعرض أعلى النموذج
 * عندما لا يرتبط الخطأ بحقل محدد (مثل «البريد مسجّل مسبقًا»).
 */
export function applyApiError<T extends FieldValues>(form: UseFormReturn<T>, err: unknown): string | null {
  if (err instanceof ApiError && err.fields) {
    let any = false;
    for (const [path, message] of Object.entries(err.fields)) {
      if (path === '_') continue;
      form.setError(path as Path<T>, { type: 'server', message });
      any = true;
    }
    if (any && err.code === 'VALIDATION_ERROR') return null;
  }
  return errorMessage(err);
}
