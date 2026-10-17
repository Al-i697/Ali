import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { GripHorizontal, Hand, Minimize2, PictureInPicture2, X } from 'lucide-react';
import { useAcademic } from '@/context/academic';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/lib/hooks';
import { useAssignments } from '@/lib/queries';
import { IconButton } from '@/components/ui';
import { sessionHref } from '../shared';
import type { SessionRef } from '../use-session';
import { FloatPanelBody } from './body';
import type { FloatPos } from './persist';
import { useFloatingClass } from './state';

// اللوحة العائمة داخل التطبيق: زر عائم في كل صفحة يفتح بطاقة قابلة للسحب تبقى مفتوحة أثناء التنقل بين الصفحات،
// أو نافذة منفصلة فوق البرامج الأخرى (PiP). المحتوى كله في FloatPanelBody.

const MARGIN = 8;
const STEP = 24;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/** سحب اللوحة بالمؤشر (ماوس ولمس) مع إبقائها داخل الشاشة؛ يُثبَّت الموضع عند رفع الإصبع */
function useDrag(root: RefObject<HTMLElement | null>, enabled: boolean, commit: (p: FloatPos) => void) {
  const start = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  const [live, setLive] = useState<FloatPos | null>(null);
  const place = (e: PointerEvent): FloatPos | null => {
    const el = root.current;
    if (!el || !start.current) return null;
    const r = el.getBoundingClientRect();
    return {
      x: clamp(e.clientX - start.current.dx, MARGIN, window.innerWidth - r.width - MARGIN),
      y: clamp(e.clientY - start.current.dy, MARGIN, window.innerHeight - r.height - MARGIN),
    };
  };
  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      const el = root.current;
      if (!enabled || !el || e.button !== 0) return;
      const r = el.getBoundingClientRect();
      start.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const p = place(e);
      if (!p || !start.current) return;
      start.current.moved = true;
      setLive(p);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const p = place(e);
      const moved = start.current?.moved;
      start.current = null;
      setLive(null);
      if (p && moved) commit(p);
    },
    onPointerCancel: () => {
      start.current = null;
      setLive(null);
    },
  };
  return { live, handlers };
}

function Launcher() {
  const f = useFloatingClass();
  const btn = useRef<HTMLButtonElement>(null);
  const { focusNext } = f;
  useEffect(() => {
    if (focusNext.current === 'launcher') {
      focusNext.current = null;
      btn.current?.focus();
    }
  }, [focusNext]);
  return (
    <button
      ref={btn}
      type="button"
      onClick={() => f.openPanel()}
      aria-label="فتح لوحة المشاركة العائمة"
      aria-expanded={false}
      className="no-print fixed bottom-[calc(96px+env(safe-area-inset-bottom))] end-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-4 text-[15px] font-semibold text-brand-fg shadow-modal transition-[background-color,transform] hover:bg-brand-hover active:scale-95 lg:bottom-6 lg:end-6"
    >
      <Hand className="size-5" aria-hidden />
      <span className="hidden sm:inline">المشاركة</span>
    </button>
  );
}

function InAppPanel() {
  const f = useFloatingClass();
  const navigate = useNavigate();
  const sheet = useMediaQuery('(max-width: 639px)');
  const root = useRef<HTMLDivElement>(null);
  const { pos, ref, hideBehavior } = f.state;
  const { patch, focusNext } = f;
  const { live, handlers } = useDrag(root, !sheet, (p) => patch({ pos: p }));
  const at = sheet ? null : (live ?? pos);

  useEffect(() => {
    if (focusNext.current === 'panel') {
      focusNext.current = null;
      root.current?.focus();
    }
  }, [focusNext]);

  // الموضع المحفوظ يبقى داخل الشاشة إن صغرت النافذة أو تغيّر اتجاه الجهاز
  useEffect(() => {
    if (!pos || sheet) return;
    const fit = () => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = clamp(pos.x, MARGIN, window.innerWidth - r.width - MARGIN);
      const y = clamp(pos.y, MARGIN, window.innerHeight - r.height - MARGIN);
      if (x !== pos.x || y !== pos.y) patch({ pos: { x, y } });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [pos, sheet, patch]);

  // مفاتيح الأسهم على مقبض السحب بديلٌ لمن لا يستعمل المؤشر (Shift = خطوة أكبر)
  const nudge = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    const el = root.current;
    if (!dir || !el) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    const k = e.shiftKey ? STEP * 4 : STEP;
    patch({
      pos: {
        x: clamp(r.left + dir[0]! * k, MARGIN, window.innerWidth - r.width - MARGIN),
        y: clamp(r.top + dir[1]! * k, MARGIN, window.innerHeight - r.height - MARGIN),
      },
    });
  };

  const onSession = useCallback((r: SessionRef) => patch({ ref: r }), [patch]);
  const onHide = useCallback((v: boolean) => patch({ hideBehavior: v }), [patch]);
  const onOpenFull = useCallback((r: SessionRef) => navigate(sessionHref(r.assignmentId, r.date, r.period)), [navigate]);

  return (
    <div
      ref={root}
      role="region"
      aria-label="لوحة المشاركة العائمة"
      tabIndex={-1}
      className={cn(
        'no-print fixed z-40 flex flex-col overflow-hidden border border-line-strong bg-surface shadow-modal outline-none animate-[pop-in_0.18s_ease-out]',
        sheet
          ? 'inset-x-2 bottom-[calc(92px+env(safe-area-inset-bottom))] max-h-[min(70dvh,600px)] rounded-2xl'
          : cn('w-[408px] max-w-[calc(100vw-16px)] rounded-2xl', !at && 'bottom-6 end-6 max-h-[min(680px,calc(100dvh-48px))]'),
      )}
      style={at ? { left: at.x, top: at.y, maxHeight: `min(680px, calc(100dvh - ${at.y + MARGIN}px))` } : undefined}
    >
      <FloatPanelBody
        mode="inapp"
        session={ref}
        onSession={onSession}
        hideBehavior={hideBehavior}
        onHideBehavior={onHide}
        onOpenFull={onOpenFull}
        titleProps={sheet ? undefined : { ...handlers, className: 'cursor-grab touch-none select-none active:cursor-grabbing' }}
        lead={
          sheet ? null : (
            <button
              type="button"
              {...handlers}
              onKeyDown={nudge}
              aria-label="تحريك اللوحة: اسحبها أو استعمل مفاتيح الأسهم"
              title="اسحب لتحريك اللوحة"
              className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-ink active:cursor-grabbing"
            >
              <GripHorizontal className="size-[18px]" aria-hidden />
            </button>
          )
        }
        actions={
          <>
            {sheet ? null : (
              <IconButton label="فتح في نافذة منفصلة تبقى فوق البرامج الأخرى" size="iconSm" onClick={() => f.popOut()}>
                <PictureInPicture2 className="size-[18px]" aria-hidden />
              </IconButton>
            )}
            <IconButton label="إغلاق اللوحة" size="iconSm" onClick={f.closePanel}>
              <X className="size-[18px]" aria-hidden />
            </IconButton>
          </>
        }
      />
    </div>
  );
}

/** المحتوى نفسه في نافذة PiP: نفس شجرة React (فتبقى الذاكرة المؤقتة والسياقات واحدة) لكن يُرسم في مستند النافذة المنفصلة */
function PipPortal({ win }: { win: Window }) {
  const f = useFloatingClass();
  const { patch } = f;
  const root = win.document.getElementById('float-root');
  const onSession = useCallback((r: SessionRef) => patch({ ref: r }), [patch]);
  const onHide = useCallback((v: boolean) => patch({ hideBehavior: v }), [patch]);
  if (!root) return null;
  return createPortal(
    <FloatPanelBody
      mode="pip"
      session={f.state.ref}
      onSession={onSession}
      hideBehavior={f.state.hideBehavior}
      onHideBehavior={onHide}
      actions={
        <>
          <IconButton label="العودة إلى التطبيق" size="iconSm" onClick={f.dock}>
            <Minimize2 className="size-[18px]" aria-hidden />
          </IconButton>
          <IconButton label="إغلاق النافذة" size="iconSm" onClick={f.closePip}>
            <X className="size-[18px]" aria-hidden />
          </IconButton>
        </>
      }
    />,
    root,
  );
}

/** يُركَّب مرة واحدة في غلاف التطبيق: الزر العائم أو اللوحة أو نافذة PiP */
export function FloatingClass() {
  const f = useFloatingClass();
  const { pathname } = useLocation();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const hasCourses = (assignments.data?.length ?? 0) > 0;
  // صفحة الحصة الكاملة تغني عن الزر العائم (وفيها زر «نافذة عائمة»)؛ أما لوحة فتحها المعلم أو أعادها من PiP فتبقى حيث هي
  const showLauncher = hasCourses && pathname !== '/class/session' && !f.state.open && !f.pipWindow;
  return (
    <>
      {showLauncher ? <Launcher /> : null}
      {hasCourses && f.state.open && !f.pipWindow ? <InAppPanel /> : null}
      {f.pipWindow ? <PipPortal win={f.pipWindow} /> : null}
    </>
  );
}
