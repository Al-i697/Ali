import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { MAX_PERIODS } from '@shared/constants';
import { todayISO } from '@shared/dates';
import { useLocalState } from '@/lib/hooks';
import type { SessionRef } from '../use-session';
import { FloatPanelBody } from './body';

/**
 * نافذة المشاركة المنفصلة لمتصفحات بلا PiP (وللشاشة الثانية): صفحة بلا غلاف التطبيق تعرض اللوحة وحدها.
 * الحصة في العنوان (?assignment=&period=) فتبقى عند إعادة التحميل، واليوم دائمًا هو تاريخها.
 */
export default function FloatPage() {
  const [sp, setSp] = useSearchParams();
  const today = todayISO();
  const assignmentId = sp.get('assignment') ?? '';
  const rawPeriod = Number(sp.get('period'));
  const period = Number.isInteger(rawPeriod) && rawPeriod >= 1 && rawPeriod <= MAX_PERIODS ? rawPeriod : null;
  const session = useMemo<SessionRef | null>(() => (assignmentId ? { assignmentId, date: today, period } : null), [assignmentId, period, today]);
  const [hide, setHide] = useLocalState('sijilli-class-float-window-hide', false);

  const onSession = useCallback(
    (r: SessionRef) =>
      setSp(
        (cur) => {
          const next = new URLSearchParams(cur);
          next.set('assignment', r.assignmentId);
          if (r.period) next.set('period', String(r.period));
          else next.delete('period');
          return next;
        },
        { replace: true },
      ),
    [setSp],
  );

  useEffect(() => {
    document.title = 'المشاركة — سجلي';
  }, []);

  return (
    <main className="flex h-dvh flex-col bg-bg">
      <FloatPanelBody mode="window" session={session} onSession={onSession} hideBehavior={hide} onHideBehavior={setHide} />
    </main>
  );
}
