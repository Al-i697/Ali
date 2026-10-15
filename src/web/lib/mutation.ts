import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { errorMessage } from './api';
import { invalidateAcademic } from './queries';

type Options<TData, TVars> = {
  /** رسالة نجاح (نص أو دالة) — تُعرض كإشعار */
  success?: string | ((data: TData, vars: TVars) => string);
  /** مفاتيح تُبطَل بعد النجاح؛ 'academic' تُبطل كل ما يتأثر ببنية الشعب والطلاب والتقويم */
  invalidate?: (QueryKey | 'academic')[];
  onSuccess?: (data: TData, vars: TVars) => void;
  onError?: (error: unknown, vars: TVars) => void;
  /** لا تعرض إشعار الخطأ تلقائيًا (إن كان النموذج يعرضه بنفسه) */
  silentError?: boolean;
};

/** طفرة موحّدة: إبطال الذاكرة المؤقتة + إشعار نجاح/خطأ بالعربية */
export function useAppMutation<TData = unknown, TVars = void>(fn: (vars: TVars) => Promise<TData>, opts: Options<TData, TVars> = {}) {
  const qc = useQueryClient();
  return useMutation<TData, unknown, TVars>({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      for (const key of opts.invalidate ?? []) {
        if (key === 'academic') invalidateAcademic(qc);
        else void qc.invalidateQueries({ queryKey: key });
      }
      if (opts.success) toast.success(typeof opts.success === 'function' ? opts.success(data, vars) : opts.success);
      opts.onSuccess?.(data, vars);
    },
    onError: (error, vars) => {
      if (!opts.silentError) toast.error(errorMessage(error));
      opts.onError?.(error, vars);
    },
  });
}
