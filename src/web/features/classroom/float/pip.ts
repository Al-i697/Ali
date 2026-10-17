// النافذة المنفصلة للوحة المشاركة: Document Picture-in-Picture (كروم/إيدج 116+ على الحاسوب) نافذة صغيرة تبقى فوق كل البرامج
// الأخرى (عرض الدرس مثلًا)، وحيث لا يدعمها المتصفح نافذة عادية على المسار /class/float (انظر state.tsx).
// المحتوى في الحالتين هو نفسه (FloatPanelBody)؛ هنا ما يخص نافذة PiP فقط.

type PipApi = { requestWindow(options?: { width?: number; height?: number }): Promise<Window> };

export const FLOAT_SIZE = { width: 400, height: 680 } as const;

/** واجهة PiP إن توفرت (سياق آمن + متصفح يدعمها). المعاينة التفاعلية تعمل داخل إطار معزول فلا تحاولها أصلًا */
export function pipApi(): PipApi | null {
  if (import.meta.env.VITE_DEMO) return null;
  return (window as unknown as { documentPictureInPicture?: PipApi }).documentPictureInPicture ?? null;
}

/** ينسخ الأنماط إلى نافذة PiP: الروابط بعنوان مطلق كي لا يتعطل تحميلها (النافذة تبدأ بصفحة about:blank) */
function copyStyles(target: Document) {
  for (const node of document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style')) {
    const copy = node.cloneNode(true) as HTMLLinkElement | HTMLStyleElement;
    if (node instanceof HTMLLinkElement) (copy as HTMLLinkElement).href = node.href;
    target.head.appendChild(copy);
  }
}

/**
 * يفتح نافذة PiP جاهزة: الأنماط، اتجاه الصفحة، السمة الفاتحة/الداكنة (وتتبّع تبدّلها)، وعنصر الجذر #float-root.
 * يجب استدعاؤه من إيماءة مستخدم مباشرةً (نقرة) وإلا رفضه المتصفح.
 */
export async function openPipWindow(): Promise<Window> {
  const api = pipApi();
  if (!api) throw new Error('PiP غير مدعومة');
  const win = await api.requestWindow(FLOAT_SIZE);

  const src = document.documentElement;
  const dst = win.document.documentElement;
  dst.lang = 'ar';
  dst.dir = 'rtl';
  const syncTheme = () => {
    dst.dataset.theme = src.dataset.theme ?? 'light';
    dst.style.colorScheme = src.style.colorScheme;
  };
  syncTheme();
  const watch = new MutationObserver(syncTheme);
  watch.observe(src, { attributes: true, attributeFilter: ['data-theme', 'style'] });
  win.addEventListener('pagehide', () => watch.disconnect(), { once: true });

  copyStyles(win.document);
  win.document.title = 'المشاركة — سجلي';
  const root = win.document.createElement('div');
  root.id = 'float-root';
  win.document.body.appendChild(root);
  return win;
}
