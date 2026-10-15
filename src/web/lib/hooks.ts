import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDate, formatDateTime, formatTime, type DigitStyle } from '@shared/dates';
import { formatNumber, formatPercent } from '@shared/format';
import { useSettings } from './queries';

export function useDebounced<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** تنسيق الأرقام والتواريخ حسب تفضيل المعلم (أرقام لاتينية أو هندية) */
export function useFmt() {
  const { data } = useSettings();
  const digits: DigitStyle = data?.preferences.digits ?? 'latn';
  return useMemo(
    () => ({
      digits,
      num: (n: number | null | undefined, max = 2) => formatNumber(n ?? null, digits, max),
      pct: (n: number | null | undefined, max = 1) => formatPercent(n ?? null, digits, max),
      date: (iso: string | null | undefined, style: 'short' | 'medium' | 'long' | 'full' = 'medium') => formatDate(iso, digits, style),
      time: (t: string | null | undefined) => formatTime(t, digits),
      dateTime: (ts: string | null | undefined) => formatDateTime(ts, digits),
    }),
    [digits],
  );
}

/** حالة محفوظة في localStorage (للتفضيلات الخفيفة فقط، مع تحمّل منع التخزين) */
export function useLocalState<T>(key: string, initial: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T) => {
      setState(v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        /* تجاهل */
      }
    },
    [key],
  );
  return [state, set];
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setMatch(mq.matches);
    h();
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [query]);
  return match;
}

/** يحذّر المستخدم قبل مغادرة الصفحة وفيها تغييرات غير محفوظة */
export function useBeforeUnload(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [active]);
}

export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
