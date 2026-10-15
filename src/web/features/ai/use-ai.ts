import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AiRunResponse, AiStatusDto } from '@shared/dto';
import type { AiRunInput } from '@shared/schemas/ai';
import { ApiError, api, errorMessage } from '@/lib/api';
import { qk } from '@/lib/queries';

/** الجاهزية الفعلية (مزوّد + موافقة المدير) وحصة المعلم اليومية؛ تُجلب عند فتح نافذة المساعد فقط */
export const useAiStatus = (enabled = true) =>
  useQuery({ queryKey: qk.aiStatus, queryFn: () => api.get<AiStatusDto>('/ai/status'), enabled, staleTime: 15_000 });

/** `key` بصمة المدخلات وقت الإرسال: الخطأ لا يُعرض إلا ما دامت المدخلات كما أُرسلت (فتعديلها يُسقط الخطأ وتأكيد الأسماء) */
export type AiRunState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | { phase: 'error'; code: string; message: string; key: string }
  | { phase: 'done'; response: AiRunResponse };

/**
 * تشغيل مهمة واحدة في كل مرة. إلغاء الطلب أو إغلاق النافذة يتجاهل نتيجته إن وصلت متأخرة
 * (الخادم يكمل الطلب ويحتسبه من الحصة — لا يمكن سحب ما أُرسل).
 */
export function useAiRunner() {
  const qc = useQueryClient();
  const token = useRef(0);
  const [state, setState] = useState<AiRunState>({ phase: 'idle' });

  const run = useCallback(
    async (input: AiRunInput, key: string) => {
      const mine = ++token.current;
      setState({ phase: 'running' });
      try {
        const response = await api.post<AiRunResponse>('/ai/run', input);
        if (token.current === mine) setState({ phase: 'done', response });
      } catch (e) {
        if (token.current === mine) setState({ phase: 'error', code: e instanceof ApiError ? e.code : 'UNKNOWN', message: errorMessage(e), key });
      } finally {
        // الحصة اليومية تغيّرت (نجاحًا أو فشلًا بعد الإرسال)
        void qc.invalidateQueries({ queryKey: qk.aiStatus });
      }
    },
    [qc],
  );

  const reset = useCallback(() => {
    token.current++;
    setState({ phase: 'idle' });
  }, []);

  useEffect(
    () => () => {
      token.current++;
    },
    [],
  );

  return { state, run, reset };
}
