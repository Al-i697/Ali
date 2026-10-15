// عناصر التحقق المشتركة + رسائل الأخطاء العربية الودّية.
import { z } from 'zod';
import { LIMITS } from '../constants';

function chars(n: number): string {
  if (n === 1) return 'حرف واحد';
  if (n === 2) return 'حرفين';
  if (n >= 3 && n <= 10) return `${n} أحرف`;
  return `${n} حرفًا`;
}

function items(n: number): string {
  if (n === 1) return 'عنصر واحد';
  if (n === 2) return 'عنصرين';
  if (n >= 3 && n <= 10) return `${n} عناصر`;
  return `${n} عنصرًا`;
}

/** خريطة أخطاء Zod العامة بالعربية — تُفعَّل مرة واحدة عند بدء الخادم والواجهة */
export function installArabicZod(): void {
  z.config({
    localeError: (iss) => {
      switch (iss.code) {
        case 'invalid_type':
          if (iss.input === undefined || iss.input === null) return 'هذا الحقل مطلوب';
          if (iss.expected === 'int') return 'يجب أن تكون القيمة عددًا صحيحًا';
          if (iss.expected === 'number') return 'يجب إدخال رقم صالح';
          if (iss.expected === 'boolean') return 'يجب أن تكون القيمة نعم أو لا';
          if (iss.expected === 'string') return 'يجب إدخال نص';
          if (iss.expected === 'array') return 'قائمة غير صالحة';
          return 'قيمة غير صالحة';
        case 'too_small': {
          const min = Number(iss.minimum);
          if (iss.origin === 'string') return min <= 1 ? 'هذا الحقل مطلوب' : `يجب ألا يقل عن ${chars(min)}`;
          if (iss.origin === 'array') return min <= 1 ? 'يجب اختيار عنصر واحد على الأقل' : `يجب ألا يقل عن ${items(min)}`;
          return iss.inclusive === false
            ? `يجب أن تكون القيمة أكبر من ${min}`
            : `يجب ألا تقل القيمة عن ${min}`;
        }
        case 'too_big': {
          const max = Number(iss.maximum);
          if (iss.origin === 'string') return `يجب ألا يزيد عن ${chars(max)}`;
          if (iss.origin === 'array') return `يجب ألا يزيد عن ${items(max)}`;
          return iss.inclusive === false
            ? `يجب أن تكون القيمة أقل من ${max}`
            : `يجب ألا تزيد القيمة عن ${max}`;
        }
        case 'invalid_format':
          if (iss.format === 'email') return 'البريد الإلكتروني غير صالح';
          if (iss.format === 'date') return 'التاريخ غير صالح';
          if (iss.format === 'uuid') return 'معرّف غير صالح';
          return 'الصيغة غير صالحة';
        case 'invalid_value':
          return 'قيمة غير مسموحة';
        case 'not_multiple_of':
          return 'القيمة غير صالحة';
        case 'unrecognized_keys':
          return 'حقول غير مسموحة';
        default:
          return 'قيمة غير صالحة';
      }
    },
  });
}

export const idSchema = z.uuid({ error: 'معرّف غير صالح' });
export const dateSchema = z.iso.date({ error: 'التاريخ غير صالح' });
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'الوقت غير صالح (مثال: 07:30)');

/** نص مقصوص مطلوب */
export const requiredText = (max: number = LIMITS.nameMax) => z.string().trim().min(1).max(max);

/** نص اختياري: الفراغ يتحول إلى null، وغيابه يبقى undefined (مهم لدلالة PATCH) */
export const optText = (max: number = LIMITS.textMax) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v));

export const stringList = (maxItems: number = LIMITS.listMax, maxLen: number = LIMITS.listItemMax) =>
  z.array(z.string().trim().min(1).max(maxLen)).max(maxItems);

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
