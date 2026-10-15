// تواريخ «التقويم المدرسي»: نصوص YYYY-MM-DD بلا مناطق زمنية. كل العمليات بتوقيت UTC لتفادي أخطاء التحويل.
import { APP_TIMEZONE } from './constants';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 86_400_000;

export function isISODate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return toISODate(d) === value;
}

export function isISOTime(value: unknown): value is string {
  return typeof value === 'string' && ISO_TIME.test(value);
}

export function parseISODate(iso: string): Date {
  const m = ISO_DATE.exec(iso);
  if (!m) throw new Error(`تاريخ غير صالح: ${iso}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function toISODate(date: Date): string {
  const y = String(date.getUTCFullYear()).padStart(4, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  return toISODate(new Date(parseISODate(iso).getTime() + days * DAY_MS));
}

/** الفرق بالأيام: b - a */
export function diffDays(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / DAY_MS);
}

/** 0 = الأحد … 6 = السبت */
export function weekdayOf(iso: string): number {
  return parseISODate(iso).getUTCDay();
}

/** بداية الأسبوع (الأحد افتراضيًا) */
export function startOfWeek(iso: string, weekStart = 0): string {
  const diff = (weekdayOf(iso) - weekStart + 7) % 7;
  return addDays(iso, -diff);
}

export function endOfWeek(iso: string, weekStart = 0): string {
  return addDays(startOfWeek(iso, weekStart), 6);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: string): string {
  const d = parseISODate(iso);
  return toISODate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

export function eachDay(from: string, to: string): string[] {
  const out: string[] = [];
  const n = diffDays(from, to);
  for (let i = 0; i <= n; i++) out.push(addDays(from, i));
  return out;
}

export function isBetween(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

type ZonedNow = { date: string; time: string; weekday: number };

/** التاريخ والوقت الحاليان بتوقيت التطبيق (مسقط افتراضيًا) بغض النظر عن توقيت الخادم */
export function nowInZone(tz: string = APP_TIMEZONE, at: Date = new Date()): ZonedNow {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  return { date, time: `${get('hour')}:${get('minute')}`, weekday: weekdayOf(date) };
}

export function todayISO(tz: string = APP_TIMEZONE): string {
  return nowInZone(tz).date;
}

/** رقم الأسبوع داخل فترة (يبدأ من 1) أو null إن كان التاريخ خارجها */
export function weekIndexIn(date: string, rangeStart: string, weekStart = 0): number | null {
  if (date < rangeStart) return null;
  const a = startOfWeek(rangeStart, weekStart);
  const b = startOfWeek(date, weekStart);
  return Math.floor(diffDays(a, b) / 7) + 1;
}

/** "HH:MM" → دقائق منذ منتصف الليل */
export function timeToMinutes(time: string): number {
  const m = ISO_TIME.exec(time);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ───────────── العرض (Intl) ─────────────
export type DigitStyle = 'latn' | 'arab';

function locale(digits: DigitStyle): string {
  return `ar-OM-u-nu-${digits === 'arab' ? 'arab' : 'latn'}`;
}

function utcNoon(iso: string): Date {
  // الظهيرة UTC تضمن بقاء اليوم نفسه عند التنسيق في أي منطقة زمنية
  const d = parseISODate(iso);
  d.setUTCHours(12);
  return d;
}

export function formatDate(
  iso: string | null | undefined,
  digits: DigitStyle = 'latn',
  style: 'short' | 'medium' | 'long' | 'full' = 'medium',
): string {
  if (!iso || !isISODate(iso)) return '—';
  const opts: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { day: 'numeric', month: 'numeric', year: 'numeric' }
      : style === 'medium'
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : style === 'long'
          ? { day: 'numeric', month: 'long', year: 'numeric' }
          : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(locale(digits), { ...opts, timeZone: 'UTC' }).format(utcNoon(iso));
}

export function formatMonthYear(iso: string, digits: DigitStyle = 'latn'): string {
  return new Intl.DateTimeFormat(locale(digits), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utcNoon(iso));
}

/** "13:05" → "1:05 م" */
export function formatTime(time: string | null | undefined, digits: DigitStyle = 'latn'): string {
  if (!time || !isISOTime(time)) return '—';
  const d = new Date(Date.UTC(2000, 0, 1, Number(time.slice(0, 2)), Number(time.slice(3, 5))));
  return new Intl.DateTimeFormat(locale(digits), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(d);
}
