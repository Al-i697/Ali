// أدوات النص العربي: تطبيع للبحث، تحويل الأرقام، قراءة الأعداد، اختصار الأسماء.

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_INDIC = '۰۱۲۳۴۵۶۷۸۹';

/** يحوّل الأرقام الهندية/الفارسية إلى لاتينية، وفواصل العربية إلى المقابلة اللاتينية */
export function toWesternDigits(input: string): string {
  let out = '';
  for (const ch of input) {
    const a = ARABIC_INDIC.indexOf(ch);
    if (a >= 0) {
      out += String(a);
      continue;
    }
    const p = PERSIAN_INDIC.indexOf(ch);
    if (p >= 0) {
      out += String(p);
      continue;
    }
    if (ch === '٫') out += '.';
    else if (ch === '٬') out += '';
    else if (ch === '،') out += ',';
    else out += ch;
  }
  return out;
}

/** يحوّل الأرقام اللاتينية داخل نص إلى هندية (للعرض عند اختيار المستخدم) */
export function toArabicIndicDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]!).replace(/\./g, '٫');
}

const TASHKEEL = /[ً-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;

/** تنظيف اسم: إزالة التطويل والمسافات الزائدة (دون المساس بالحروف) */
export function cleanName(input: string): string {
  return input.replace(TATWEEL, '').replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * تطبيع للبحث والترتيب والمطابقة: يوحّد الهمزات والألف والياء/الألف المقصورة والتاء المربوطة،
 * ويحذف التشكيل والتطويل، ويحوّل الأرقام للاتينية، ويصغّر الحروف اللاتينية.
 */
export function normalizeArabic(input: string): string {
  return toWesternDigits(input)
    .replace(TASHKEEL, '')
    .replace(TATWEEL, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** مقارنة أسماء عربية بترتيب أبجدي صحيح */
export function compareArabic(a: string, b: string): number {
  const na = normalizeArabic(a);
  const nb = normalizeArabic(b);
  return na < nb ? -1 : na > nb ? 1 : 0;
}

/**
 * يقرأ عددًا يكتبه المستخدم: يقبل الأرقام الهندية والفاصلة العشرية العربية.
 * يعيد null للنص الفارغ، و NaN لنص غير صالح.
 */
export function parseNumberInput(input: string): number | null {
  const s = toWesternDigits(input).trim().replace(/,/g, '.').replace(/\s+/g, '');
  if (s === '') return null;
  if (!/^-?\d+(\.\d+)?$/.test(s)) return Number.NaN;
  return Number(s);
}

/** أول حرفين من أول كلمتين — لصور الطلاب الرمزية */
export function initials(name: string): string {
  const parts = cleanName(name).split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return `${first}${second}`;
}

/** هل النص يحتوي حروفًا عربية؟ */
export function hasArabic(input: string): boolean {
  return /[؀-ۿ]/.test(input);
}
