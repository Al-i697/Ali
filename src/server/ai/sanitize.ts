// تنقية ما يُرسَل إلى المساعد الذكي: بيانات الطلاب لا تغادر الخادم (docs/AI-EXTENSION.md، الضابط 1).
// لا يقرأ المساعد من قاعدة البيانات شيئًا: يصله فقط نص كتبه المعلم أو راجعه بنفسه في النافذة، بعد المرور من هنا:
//  • بيانات الاتصال (بريد، هاتف، أرقام طويلة) ← رفض قاطع.
//  • ما يطابق اسم أحد طلاب المعلم ← رفض ما لم يؤكد المعلم أنه اسم شخصية عامة/تاريخية (يُسجَّل التأكيد).
// حدود صريحة: لا يلتقط اسم طالب بمفرده (الاسم الأول وحده يلتبس بكلمات الدرس) — لذلك تعرض الواجهة تنبيهًا دائمًا
// وتُظهر النص كاملًا قبل الإرسال ليراجعه المعلم.
import { normalizeArabic, toWesternDigits } from '../../shared/arabic';

/** يوحّد النص ويزيل ما لا يلزم: محارف التحكم والاتجاه والأقواس الزاوية (حتى لا تكسر وسوم الرسالة) ويضغط الفراغات مع إبقاء الأسطر */
export function cleanFreeText(input: string): string {
  return input
    .normalize('NFC')
    .replace(/\p{Cf}/gu, '')
    .replace(/(?![\t\n\r])\p{Cc}/gu, '')
    .replace(/[<>]/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type ContactIssue = 'email' | 'phone' | 'long_number';

export const CONTACT_MESSAGES: Record<ContactIssue, string> = {
  email: 'النص يحوي بريدًا إلكترونيًا. احذفه قبل الإرسال: لا تُرسَل بيانات الاتصال إلى المساعد.',
  phone: 'النص يحوي ما يشبه رقم هاتف. احذفه قبل الإرسال: لا تُرسَل بيانات الاتصال إلى المساعد.',
  long_number: 'النص يحوي رقمًا طويلًا (8 خانات فأكثر) قد يكون رقمًا مدنيًا أو هاتفًا. احذفه أو اكتبه بصياغة عامة.',
};

export const NAME_CONFIRM_MESSAGE =
  'النص يطابق اسمًا من أسماء طلابك. لا تُرسَل أسماء الطلاب إلى المساعد: احذف الاسم، أو أكّد أنه اسم شخصية عامة أو تاريخية وليس اسم طالب.';

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/u;
/** مقدمة دولية لعُمان: +968 أو 00968 */
const INTL_PHONE = /(?<!\d)(?:\+|00)\s?968(?=[\s\-.]?\d)/;
/** جوال عُماني (يبدأ بـ7 أو 9) مكتوبًا بفاصل بين الأربعة الأولى والأربعة الأخيرة: 9123 4567 */
const SPLIT_PHONE = /(?<!\d)[79]\d{3}[\s\-.]\d{4}(?!\d)/;
/** ثمانية أرقام متصلة فأكثر: طول الهاتف والرقم المدني */
const LONG_NUMBER = /\d{8,}/;

/** بيانات اتصال أو أرقام تعريفية محتملة (بعد تحويل الأرقام الهندية إلى لاتينية) */
export function detectContactData(text: string): ContactIssue | null {
  const t = toWesternDigits(text);
  if (EMAIL.test(t)) return 'email';
  if (INTL_PHONE.test(t) || SPLIT_PHONE.test(t)) return 'phone';
  if (LONG_NUMBER.test(t)) return 'long_number';
  return null;
}

/** أدوات الربط في الأسماء لا تُعدّ اسمًا قائمًا بذاتها */
const CONNECTORS = new Set(['بن', 'بنت', 'ابن', 'ال', 'ولد']);

/**
 * بصمات اسم طالب (بعد التطبيع العربي): الاسم كاملًا، وكل مقطع متصل من 3 كلمات فأكثر،
 * والاسم الأول + اسم العائلة، وكل زوج متجاور من كلمتين حقيقيتين (غير أدوات الربط وبطول 3 حروف فأكثر).
 * الاسم المفرد لا بصمة له عمدًا (يلتبس بكلمات الدرس).
 */
export function nameSignatures(fullName: string): string[] {
  const tokens = normalizeArabic(fullName).split(' ').filter(Boolean);
  if (tokens.length < 2) return [];
  if (tokens.length === 2) return [tokens.join(' ')];
  const out = new Set<string>();
  for (let size = 3; size <= Math.min(tokens.length, 6); size++) {
    for (let i = 0; i + size <= tokens.length; i++) out.add(tokens.slice(i, i + size).join(' '));
  }
  const real = (t: string) => t.length >= 3 && !CONNECTORS.has(t);
  const first = tokens[0]!;
  const last = tokens[tokens.length - 1]!;
  if (real(first) && real(last)) out.add(`${first} ${last}`);
  for (let i = 0; i + 1 < tokens.length; i++) if (real(tokens[i]!) && real(tokens[i + 1]!)) out.add(`${tokens[i]} ${tokens[i + 1]}`);
  return [...out];
}

export type NameMatcher = { signatures: ReadonlySet<string> };

export function buildNameMatcher(fullNames: readonly string[]): NameMatcher {
  const signatures = new Set<string>();
  for (const n of fullNames) for (const s of nameSignatures(n)) signatures.add(s);
  return { signatures };
}

/** هل يحوي النص ما يطابق اسم أحد الطلاب؟ (مطابقة على النص المطبَّع؛ احتواء لا حدود كلمات — الأحوط) */
export function mentionsStudent(text: string, matcher: NameMatcher): boolean {
  if (matcher.signatures.size === 0) return false;
  const t = normalizeArabic(text);
  for (const s of matcher.signatures) if (t.includes(s)) return true;
  return false;
}
