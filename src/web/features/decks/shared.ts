import { DECK_LIMITS } from '@shared/constants';

/** حجم مقروء بالعربية: «1.4 ميغابايت» — الأرقام عبر تنسيق التطبيق لتحترم تفضيل المعلم */
export function sizeLabel(bytes: number, num: (n: number, max?: number) => string): string {
  if (bytes >= 1024 * 1024) return `${num(bytes / (1024 * 1024), 1)} ميغابايت`;
  return `${num(Math.max(1, Math.round(bytes / 1024)), 0)} كيلوبايت`;
}

/** عنوان مقترح للدرس من وسم <title> في الصفحة، وإلا من اسم الملف. لا يُنفَّذ شيء: قراءة نصية فقط */
export async function suggestTitle(file: File): Promise<string> {
  const fromName = file.name.replace(/\.html?$/i, '').replace(/[_-]+/g, ' ').trim();
  try {
    // العنوان في أول الصفحة؛ يكفي مقطع صغير حتى لا نقرأ ميغابايتات
    const head = await file.slice(0, 64 * 1024).text();
    const m = /<title[^>]*>([^<]{1,200})<\/title>/i.exec(head);
    const t = m?.[1]?.replace(/\s+/g, ' ').trim();
    if (t) return t.slice(0, DECK_LIMITS.title);
  } catch {
    /* نكتفي باسم الملف */
  }
  return fromName.slice(0, DECK_LIMITS.title);
}
