import { describe, expect, it } from 'vitest';
import { cleanName, compareArabic, initials, normalizeArabic, parseNumberInput, toArabicIndicDigits, toWesternDigits } from '../../src/shared/arabic';
import { addDays, diffDays, endOfMonth, formatDate, formatTime, isISODate, nowInZone, startOfWeek, timeToMinutes, todayISO, weekIndexIn, weekdayOf } from '../../src/shared/dates';
import { formatNumber, formatPercent } from '../../src/shared/format';
import { pickCurrentTerm, splitYearIntoTerms } from '../../src/shared/academic';
import { sectionLabel, sectionLongLabel, gradeLabel } from '../../src/shared/constants';
import { createStudentSchema, createAssessmentSchema, installArabicZod, saveResultsSchema, createYearSchema, passwordSchema } from '../../src/shared/schemas';

describe('النص العربي', () => {
  it('يطبّع الهمزات والياء والتاء المربوطة والتشكيل والتطويل', () => {
    expect(normalizeArabic('أَحْمَد')).toBe('احمد');
    expect(normalizeArabic('إبراهيم')).toBe('ابراهيم');
    expect(normalizeArabic('فاطمة')).toBe(normalizeArabic('فاطمه'));
    expect(normalizeArabic('علـــي')).toBe('علي');
    expect(normalizeArabic('موسى')).toBe(normalizeArabic('موسي'));
    expect(normalizeArabic('  مُؤَمَّن   الحارثيّ ')).toBe('مومن الحارثي');
  });

  it('يحوّل الأرقام بين اللاتينية والهندية', () => {
    expect(toWesternDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    expect(toWesternDigits('۱۲۳')).toBe('123');
    expect(toWesternDigits('٧٫٥')).toBe('7.5');
    expect(toArabicIndicDigits('12.5')).toBe('١٢٫٥');
  });

  it('يقرأ الأعداد المكتوبة بأي أسلوب', () => {
    expect(parseNumberInput('8.5')).toBe(8.5);
    expect(parseNumberInput('٨٫٥')).toBe(8.5);
    expect(parseNumberInput('8,5')).toBe(8.5);
    expect(parseNumberInput(' 10 ')).toBe(10);
    expect(parseNumberInput('')).toBeNull();
    expect(parseNumberInput('abc')).toBeNaN();
    expect(parseNumberInput('1.2.3')).toBeNaN();
  });

  it('يرتب الأسماء أبجديًا بصرف النظر عن الهمزات', () => {
    const names = ['سالم', 'أحمد', 'إبراهيم', 'بدر', 'آمنة'];
    // بعد التطبيع: ابراهيم < احمد < امنه (الباء قبل الحاء قبل الميم) < بدر < سالم
    expect([...names].sort(compareArabic)).toEqual(['إبراهيم', 'أحمد', 'آمنة', 'بدر', 'سالم']);
  });

  it('ينظّف الأسماء ويستخرج الأحرف الأولى', () => {
    expect(cleanName('  أحمد   بن‏ سالم ')).toBe('أحمد بن سالم');
    expect(initials('فاطمة بنت خالد')).toBe('فب');
    expect(initials('علي')).toBe('ع');
  });
});

describe('التواريخ', () => {
  it('يتحقق من صحة التاريخ', () => {
    expect(isISODate('2026-02-28')).toBe(true);
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('26-1-1')).toBe(false);
    expect(isISODate(20260101)).toBe(false);
  });

  it('عمليات الأيام والأسابيع (الأحد بداية الأسبوع)', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(diffDays('2026-09-01', '2026-09-13')).toBe(12);
    expect(weekdayOf('2026-09-13')).toBe(0); // أحد
    expect(startOfWeek('2026-09-17')).toBe('2026-09-13'); // الخميس → الأحد السابق
    expect(startOfWeek('2026-09-13')).toBe('2026-09-13');
    expect(endOfMonth('2028-02-10')).toBe('2028-02-29');
    expect(weekIndexIn('2026-09-13', '2026-08-23')).toBe(4);
    expect(weekIndexIn('2026-08-10', '2026-08-23')).toBeNull();
  });

  it('يحسب التاريخ بتوقيت مسقط لا بتوقيت الخادم', () => {
    // 21:30 UTC = 01:30 اليوم التالي في مسقط (UTC+4)
    const z = nowInZone('Asia/Muscat', new Date('2026-09-12T21:30:00Z'));
    expect(z).toMatchObject({ date: '2026-09-13', time: '01:30', weekday: 0 });
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('يعرض التواريخ والأوقات بالعربية', () => {
    expect(formatDate('2026-09-13', 'latn', 'long')).toMatch(/13/);
    expect(formatDate('2026-09-13', 'arab', 'long')).toMatch(/١٣/);
    expect(formatDate('2026-09-13', 'latn', 'full')).toContain('الأحد');
    expect(formatDate(null)).toBe('—');
    expect(formatTime('13:05')).toMatch(/1:05/);
    expect(timeToMinutes('08:15')).toBe(495);
  });

  it('يقسم العام إلى فصلين متتاليين ويحدد الفصل الحالي', () => {
    const [t1, t2] = splitYearIntoTerms('2026-08-23', '2027-06-17');
    expect(t1.startDate).toBe('2026-08-23');
    expect(addDays(t1.endDate, 1)).toBe(t2.startDate);
    expect(t2.endDate).toBe('2027-06-17');
    const terms = [{ id: 'a', number: 1, startDate: t1.startDate, endDate: t1.endDate }, { id: 'b', number: 2, startDate: t2.startDate, endDate: t2.endDate }];
    expect(pickCurrentTerm(terms, '2026-09-13')?.id).toBe('a');
    expect(pickCurrentTerm(terms, '2027-03-01')?.id).toBe('b');
    expect(pickCurrentTerm(terms, '2026-07-01')?.id).toBe('a'); // قبل البداية → القادم
    expect(pickCurrentTerm(terms, '2027-08-01')?.id).toBe('b'); // بعد النهاية → الأخير
    expect(pickCurrentTerm([], '2026-01-01')).toBeNull();
  });
});

describe('التنسيق والتسميات', () => {
  it('الأعداد والنسب', () => {
    expect(formatNumber(77.5)).toBe('77.5');
    expect(formatNumber(77.5, 'arab')).toBe('٧٧٫٥');
    expect(formatNumber(null)).toBe('—');
    expect(formatPercent(85)).toBe('85%');
    expect(formatPercent(66.666, 'latn', 1)).toBe('66.7%');
  });
  it('تسميات الشعب', () => {
    expect(sectionLabel(10, '3')).toBe('10/3');
    expect(gradeLabel(11)).toBe('الصف الحادي عشر');
    expect(sectionLongLabel(10, '3')).toBe('الصف العاشر – شعبة 3');
  });
});

describe('مخططات التحقق ورسائلها العربية', () => {
  installArabicZod();
  const firstMessage = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

  it('رسائل ودّية للحقول الناقصة والأرقام', () => {
    expect(firstMessage(createStudentSchema.safeParse({}))).toBe('هذا الحقل مطلوب');
    const bad = createAssessmentSchema.safeParse({ assignmentId: crypto.randomUUID(), termId: crypto.randomUUID(), title: 'x', type: 'written', maxScore: -3 });
    expect(firstMessage(bad)).toContain('أكبر من صفر');
  });

  it('يرفض الدرجات بأكثر من خانتين عشريتين ويشترط الدرجة العظمى للنمط الدرجي', () => {
    const base = { assignmentId: crypto.randomUUID(), termId: crypto.randomUUID(), title: 'اختبار', type: 'written' as const };
    expect(createAssessmentSchema.safeParse({ ...base, maxScore: 10.123 }).success).toBe(false);
    expect(createAssessmentSchema.safeParse({ ...base }).success).toBe(false);
    expect(createAssessmentSchema.safeParse({ ...base, mode: 'mastery' }).success).toBe(true);
    expect(createAssessmentSchema.safeParse({ ...base, maxScore: 10 }).data?.countsTowardTotal).toBe(true);
  });

  it('الدرجة مع غائب مرفوضة والفارغ يصبح null', () => {
    const sid = crypto.randomUUID();
    expect(saveResultsSchema.safeParse({ results: [{ studentId: sid, score: 5, status: 'absent' }] }).success).toBe(false);
    expect(saveResultsSchema.safeParse({ results: [{ studentId: sid, score: 5 }] }).success).toBe(true);
    expect(createStudentSchema.parse({ fullName: ' أحمد   علي ', studentNumber: '' }).studentNumber).toBeNull();
    expect(createStudentSchema.parse({ fullName: 'أحمد علي' }).studentNumber).toBeUndefined();
  });

  it('العام الدراسي وكلمة المرور', () => {
    expect(createYearSchema.safeParse({ name: '2026/2027', startDate: '2027-01-01', endDate: '2026-01-01' }).success).toBe(false);
    expect(passwordSchema.safeParse('abc').success).toBe(false);
    expect(passwordSchema.safeParse('12345678').success).toBe(false);
    expect(passwordSchema.safeParse('password123').success).toBe(false);
    expect(passwordSchema.safeParse('Tr0ub4dor&3x').success).toBe(true);
  });
});
