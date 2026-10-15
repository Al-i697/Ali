import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ApiError, errorMessage } from './api';

type ConfirmFn = (o: { title: string; description?: ReactNode; confirmLabel?: string; tone?: 'danger' | 'default'; requireText?: string }) => Promise<boolean>;

/**
 * حذف بخطوتين آمنتين: تأكيد أولي، ثم — إن كان للعنصر بيانات مرتبطة — يعرض الخادم ما سيُحذف معه
 * (CONFIRM_REQUIRED) فنطلب تأكيدًا ثانيًا قبل إعادة المحاولة بـ force.
 */
export async function deleteWithForce(
  confirm: ConfirmFn,
  call: (force: boolean) => Promise<unknown>,
  base: { title: string; description?: ReactNode; confirmLabel?: string },
): Promise<boolean> {
  const ok = await confirm({ title: base.title, description: base.description, confirmLabel: base.confirmLabel ?? 'حذف', tone: 'danger' });
  if (!ok) return false;
  try {
    await call(false);
    return true;
  } catch (e) {
    if (e instanceof ApiError && e.code === 'CONFIRM_REQUIRED') {
      const really = await confirm({ title: 'تأكيد الحذف النهائي', description: e.message, confirmLabel: 'احذف نهائيًا', tone: 'danger' });
      if (!really) return false;
      try {
        await call(true);
        return true;
      } catch (e2) {
        toast.error(errorMessage(e2));
        return false;
      }
    }
    toast.error(errorMessage(e));
    return false;
  }
}
