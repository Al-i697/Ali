import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { todayISO } from '@shared/dates';
import type { SessionRef } from '../use-session';
import { FLOAT_EMPTY, parseFloatState, type FloatPersisted } from './persist';
import { FLOAT_SIZE, openPipWindow, pipApi } from './pip';

const KEY = 'sijilli-class-float';

function load(): FloatPersisted {
  try {
    return parseFloatState(localStorage.getItem(KEY), todayISO());
  } catch {
    return FLOAT_EMPTY;
  }
}

/** نافذة متصفح عادية صغيرة للوحة (حيث لا يدعم المتصفح PiP): مسار /class/float بلا غلاف التطبيق */
function openFloatWindow(ref: SessionRef | null): boolean {
  const q = new URLSearchParams();
  if (ref) {
    q.set('assignment', ref.assignmentId);
    if (ref.period) q.set('period', String(ref.period));
  }
  const { width, height } = FLOAT_SIZE;
  const left = Math.max(0, window.screenX + window.outerWidth - width - 24);
  const win = window.open(`/class/float${q.size ? `?${q}` : ''}`, 'sijilli-float', `popup=yes,width=${width},height=${height},left=${left},top=${window.screenY + 80}`);
  // في المعاينة التفاعلية ترد الطبقة الوسيطة بإشعارها الخاص
  if (!win && !import.meta.env.VITE_DEMO) toast.error('تعذّر فتح النافذة. اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة.');
  return !!win;
}

type Ctx = {
  state: FloatPersisted;
  patch: (p: Partial<FloatPersisted>) => void;
  /** نافذة PiP المفتوحة حاليًا */
  pipWindow: Window | null;
  /** يفتح اللوحة داخل التطبيق (بحصة محددة اختياريًا) */
  openPanel: (ref?: SessionRef) => void;
  closePanel: () => void;
  /** يفتحها في نافذة منفصلة: PiP فوق البرامج إن أمكن، وإلا نافذة متصفح صغيرة */
  popOut: (ref?: SessionRef) => void;
  /** إغلاق نافذة PiP وإرجاع اللوحة إلى التطبيق */
  dock: () => void;
  /** إغلاق نافذة PiP نهائيًا */
  closePip: () => void;
  /** من يستلم التركيز بعد التبديل بين الزر العائم واللوحة (لمستعمل لوحة المفاتيح) */
  focusNext: { current: 'panel' | 'launcher' | null };
};

const FloatCtx = createContext<Ctx | null>(null);

export function FloatingClassProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FloatPersisted>(load);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* التخزين محجوب: تبقى الحالة لهذه الجلسة */
    }
  }, [state]);
  const patch = useCallback((p: Partial<FloatPersisted>) => setState((s) => ({ ...s, ...p })), []);

  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const pipRef = useRef<Window | null>(null);
  /** إغلاق مقصود (زر «إغلاق») لا يُرجع اللوحة إلى التطبيق، بخلاف إغلاق النافذة بزرها أو زر «العودة» */
  const intentional = useRef(false);
  const focusNext = useRef<'panel' | 'launcher' | null>(null);

  const closePip = useCallback(() => {
    intentional.current = true;
    pipRef.current?.close();
  }, []);
  const dock = useCallback(() => {
    intentional.current = false;
    pipRef.current?.close();
  }, []);
  useEffect(() => () => {
    intentional.current = true;
    pipRef.current?.close();
  }, []);

  const openPanel = useCallback(
    (ref?: SessionRef) => {
      closePip();
      focusNext.current = 'panel';
      patch({ open: true, ...(ref ? { ref } : {}) });
    },
    [closePip, patch],
  );
  const closePanel = useCallback(() => {
    focusNext.current = 'launcher';
    patch({ open: false });
  }, [patch]);

  const opening = useRef(false);
  const popOut = useCallback(
    (ref?: SessionRef) => {
      const target = ref ?? stateRef.current.ref;
      if (ref) patch({ ref });
      // نافذة مفتوحة أو قيد الفتح: لا نفتح ثانية (تبدّلت حصتها فتتبعها النافذة المفتوحة وتُرفَع للأمام)
      if (pipRef.current) return pipRef.current.focus();
      if (opening.current) return;
      const fallback = () => {
        if (openFloatWindow(target)) patch({ open: false });
      };
      if (!pipApi()) return fallback();
      // لا نؤخّر شيئًا قبل requestWindow: يشترط المتصفح إيماءة مستخدم حديثة
      opening.current = true;
      openPipWindow().then(
        (win) => {
          opening.current = false;
          intentional.current = false;
          pipRef.current = win;
          setPipWindow(win);
          patch({ open: false });
          win.addEventListener(
            'pagehide',
            () => {
              pipRef.current = null;
              setPipWindow(null);
              if (!intentional.current) patch({ open: true });
              intentional.current = false;
            },
            { once: true },
          );
        },
        () => {
          opening.current = false;
          fallback();
        },
      );
    },
    [patch],
  );

  const value = useMemo<Ctx>(() => ({ state, patch, pipWindow, openPanel, closePanel, popOut, dock, closePip, focusNext }), [state, patch, pipWindow, openPanel, closePanel, popOut, dock, closePip]);
  return <FloatCtx.Provider value={value}>{children}</FloatCtx.Provider>;
}

export function useFloatingClass(): Ctx {
  const ctx = useContext(FloatCtx);
  if (!ctx) throw new Error('useFloatingClass يُستعمل داخل FloatingClassProvider');
  return ctx;
}
