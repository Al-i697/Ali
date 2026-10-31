import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import type { DeckDto } from '@shared/dto';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { FloatingClass } from '@/features/classroom/float/host';
import { IconButton, PageLoader, QueryError } from '@/components/ui';

/** عناصر يُقصد بالكتابة أو الاختيار فيها: لا يُسحب التركيز منها أبدًا */
const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]';

/**
 * شاشة عرض الدرس: الصفحة في إطار معزول بملء الشاشة، وفوقها لوحة المشاركة العائمة الحقيقية نفسها (من غلاف التطبيق)،
 * فتُسجَّل المشاركة في قاعدة البيانات مباشرةً وبالحصة المثبّتة من جدولك، كما لو سجّلتها من أي صفحة أخرى.
 *
 * التركيز: لوحة مفاتيح الدرس (الأسهم والمسافة) تعمل فقط والتركيز داخل الإطار. نقرة بالماوس أو اللمس على اللوحة تنقل
 * التركيز إلى زرها، فنعيده إلى الإطار بعد النقرة إلا إن فتحت النقرة حقل إدخال أو نافذة. من يتنقل بلوحة المفاتيح لا يتأثر.
 */
export default function DeckPresentPage() {
  const { deckId = '' } = useParams();
  const frame = useRef<HTMLIFrameElement>(null);
  const [full, setFull] = useState(false);
  const deck = useQuery({ queryKey: qk.deck(deckId), queryFn: () => api.get<DeckDto>(`/decks/${deckId}`) });

  // المعاينة التفاعلية تعمل بلا خادم وفي إطار معزول: الصفحة تُجلب بـfetch (تعيدها الطبقة الوسيطة) وتُعرض srcdoc بدل مسار الخادم
  const demoHtml = useQuery({
    queryKey: ['decks', 'demo-html', deckId],
    queryFn: async () => {
      const res = await fetch(`/api/decks/${deckId}/content`);
      if (!res.ok) throw new Error('تعذّر تحميل الدرس');
      return res.text();
    },
    enabled: !!import.meta.env.VITE_DEMO && !!deck.data,
    staleTime: Infinity,
  });

  const failure = deck.isError ? deck : import.meta.env.VITE_DEMO && demoHtml.isError ? demoHtml : null;

  const focusFrame = useCallback(() => frame.current?.contentWindow?.focus(), []);

  useEffect(() => {
    let timer = 0;
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      window.clearTimeout(timer);
      // بعد انتهاء معالجات النقرة وفتح ما قد تفتحه (حقل سبب، نافذة تأكيد): بضعة إطارات تكفي
      timer = window.setTimeout(() => {
        const a = document.activeElement;
        if (a instanceof Element && a.closest(EDITABLE)) return;
        if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
        focusFrame();
      }, 60);
    };
    document.addEventListener('pointerup', onPointerUp);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [focusFrame]);

  useEffect(() => {
    const sync = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  return (
    <main aria-label="عرض الدرس" className="fixed inset-0 z-30 flex flex-col bg-[#05070d] text-white">
      <header className="no-print flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-[#0b1020] px-3">
        <Link to="/decks" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[14px] text-white/80 hover:bg-white/10 hover:text-white">
          <ArrowRight className="size-4" aria-hidden />
          المكتبة
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-[14.5px] font-semibold" title={deck.data?.title}>
          {deck.data?.title ?? ''}
        </h1>
        <IconButton label={full ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'} size="iconSm" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={toggleFull}>
          {full ? <Minimize2 className="size-[18px]" /> : <Maximize2 className="size-[18px]" />}
        </IconButton>
      </header>

      <div className="relative min-h-0 flex-1">
        {failure ? (
          <div className="mx-auto max-w-lg p-8 text-ink"><QueryError error={failure.error} onRetry={() => void failure.refetch()} /></div>
        ) : deck.isPending || (import.meta.env.VITE_DEMO && demoHtml.isPending) ? (
          <div className="grid h-full place-items-center"><PageLoader /></div>
        ) : deck.data ? (
          <iframe
            ref={frame}
            title={deck.data.title}
            {...(import.meta.env.VITE_DEMO ? { srcDoc: demoHtml.data } : { src: `/api/decks/${deck.data.id}/content?v=${encodeURIComponent(deck.data.updatedAt)}` })}
            // أصل معتم: لا allow-same-origin، فلا يصل الدرس إلى الكوكي ولا إلى واجهة التطبيق (يعزز الترويسة الصادرة من الخادم)
            sandbox="allow-scripts allow-downloads"
            allow="fullscreen"
            referrerPolicy="no-referrer"
            className="size-full border-0 bg-white"
            onLoad={focusFrame}
          />
        ) : null}
      </div>
      <FloatingClass lift />
    </main>
  );
}
