// النموذج الوسيط للتقارير: يُبنى مرة واحدة من البيانات، ثم يُعرض HTML ويُصدَّر PDF وExcel بالأرقام نفسها.
import type { ReportType } from '../../shared/constants';
import type { DigitStyle } from '../../shared/dates';

export type Tone = 'good' | 'info' | 'warn' | 'bad' | 'neutral' | 'muted';

export type CellValue = string | number | null;
export type Cell = CellValue | { v: CellValue; tone?: Tone; bold?: boolean };

export type Column = {
  key: string;
  title: string;
  /** سطر صغير تحت العنوان، مثل (من 10) */
  sub?: string;
  align?: 'start' | 'center' | 'end';
  /** وزن نسبي للعرض */
  width?: number;
  kind?: 'text' | 'number' | 'percent';
};

export type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string; tone?: Tone }
  /** حقل نصي موسوم: عنوان صغير + نص (يحافظ على الأسطر) */
  | { type: 'field'; label: string; text: string }
  | { type: 'kv'; items: { label: string; value: string }[]; columns?: 2 | 3 | 4 }
  | { type: 'stats'; items: { label: string; value: string; hint?: string; tone?: Tone }[] }
  | { type: 'table'; title?: string; columns: Column[]; rows: Cell[][]; footer?: Cell[][]; compact?: boolean; empty?: string }
  | { type: 'bars'; title?: string; items: { label: string; value: number; display: string; tone?: Tone }[] }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'pagebreak' }
  /** بداية ورقة جديدة في Excel (تُتجاهل في HTML/PDF) */
  | { type: 'sheet'; name: string };

export type Branding = {
  schoolName: string | null;
  directorate: string | null;
  teacherName: string;
  jobTitle: string | null;
  specialization: string | null;
  seniorTeacherName: string | null;
  principalName: string | null;
  digits: DigitStyle;
};

export type ReportDoc = {
  type: ReportType;
  title: string;
  subtitle?: string;
  meta: { label: string; value: string }[];
  blocks: Block[];
  landscape?: boolean;
  /** اسم الملف بلا امتداد */
  filename: string;
  signatures?: boolean;
  generatedAt: string;
};

export const cellValue = (c: Cell): CellValue => (c !== null && typeof c === 'object' ? c.v : c);
export const cellTone = (c: Cell): Tone | undefined => (c !== null && typeof c === 'object' ? c.tone : undefined);
export const cellBold = (c: Cell): boolean => (c !== null && typeof c === 'object' ? Boolean(c.bold) : false);
