// ثوابت النطاق التعليمي (سلطنة عُمان). مصدر وحيد للقيم والتسميات يُستخدم في الخادم والواجهة.
// القيم الافتراضية هنا «قابلة للتعديل» من إعدادات المعلم — وليست لوائح رسمية.

export const APP_NAME = 'سجلي';
export const APP_TAGLINE = 'السجل الإلكتروني للمعلم';
export const APP_TIMEZONE = 'Asia/Muscat';

/** رأس يُرسله العميل مع كل طلب يغيّر البيانات (حماية CSRF) */
export const CLIENT_HEADER = 'x-sijilli-client';
export const CLIENT_HEADER_VALUE = 'web';

// ───────────── أدوات مساعدة لتعريف القوائم ─────────────
type Labeled<T extends string> = { readonly value: T; readonly label: string };

function defineEnum<const T extends readonly Labeled<string>[]>(items: T) {
  type V = T[number]['value'];
  const values = items.map((i) => i.value) as unknown as readonly [V, ...V[]];
  const labels = Object.fromEntries(items.map((i) => [i.value, i.label])) as Record<V, string>;
  return { items, values, labels };
}

// ───────────── المستخدمون ─────────────
export const USER_ROLE = defineEnum([
  { value: 'admin', label: 'مدير النظام' },
  { value: 'teacher', label: 'معلم' },
] as const);
export type UserRole = (typeof USER_ROLE.values)[number];

export const USER_STATUS = defineEnum([
  { value: 'active', label: 'نشط' },
  { value: 'disabled', label: 'معطّل' },
] as const);
export type UserStatus = (typeof USER_STATUS.values)[number];

// ───────────── الصفوف الدراسية ─────────────
export const GRADE_LEVELS = [
  { level: 1, name: 'الأول', cycle: 'cycle1' },
  { level: 2, name: 'الثاني', cycle: 'cycle1' },
  { level: 3, name: 'الثالث', cycle: 'cycle1' },
  { level: 4, name: 'الرابع', cycle: 'cycle1' },
  { level: 5, name: 'الخامس', cycle: 'cycle2' },
  { level: 6, name: 'السادس', cycle: 'cycle2' },
  { level: 7, name: 'السابع', cycle: 'cycle2' },
  { level: 8, name: 'الثامن', cycle: 'cycle2' },
  { level: 9, name: 'التاسع', cycle: 'cycle2' },
  { level: 10, name: 'العاشر', cycle: 'cycle2' },
  { level: 11, name: 'الحادي عشر', cycle: 'postBasic' },
  { level: 12, name: 'الثاني عشر', cycle: 'postBasic' },
] as const;

export const CYCLE_LABELS = {
  cycle1: 'الحلقة الأولى (1–4)',
  cycle2: 'الحلقة الثانية (5–10)',
  postBasic: 'ما بعد التعليم الأساسي (11–12)',
} as const;

export const MIN_GRADE = 1;
export const MAX_GRADE = 12;

export function gradeName(level: number): string {
  return GRADE_LEVELS.find((g) => g.level === level)?.name ?? String(level);
}

/** «الصف العاشر» */
export function gradeLabel(level: number): string {
  return `الصف ${gradeName(level)}`;
}

/** تسمية الشعبة المختصرة المتعارف عليها: 10/3 */
export function sectionLabel(gradeLevel: number, name: string): string {
  return `${gradeLevel}/${name}`;
}

/** تسمية الشعبة الطويلة: «الصف العاشر – شعبة 3» */
export function sectionLongLabel(gradeLevel: number, name: string): string {
  return `${gradeLabel(gradeLevel)} – شعبة ${name}`;
}

// ───────────── أيام الأسبوع (الأحد = 0 كما في JS) ─────────────
export const WEEKDAYS = [
  { value: 0, name: 'الأحد' },
  { value: 1, name: 'الاثنين' },
  { value: 2, name: 'الثلاثاء' },
  { value: 3, name: 'الأربعاء' },
  { value: 4, name: 'الخميس' },
  { value: 5, name: 'الجمعة' },
  { value: 6, name: 'السبت' },
] as const;

export function weekdayName(day: number): string {
  return WEEKDAYS[day]?.name ?? '';
}

/** أسبوع العمل في السلطنة: الأحد–الخميس */
export const DEFAULT_WORK_DAYS = [0, 1, 2, 3, 4];
export const MAX_PERIODS = 12;

// ───────────── الطلاب ─────────────
export const GENDER = defineEnum([
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
] as const);
export type Gender = (typeof GENDER.values)[number];

export const STUDENT_STATUS = defineEnum([
  { value: 'active', label: 'على مقاعد الدراسة' },
  { value: 'transferred', label: 'منقول' },
  { value: 'withdrawn', label: 'منسحب' },
] as const);
export type StudentStatus = (typeof STUDENT_STATUS.values)[number];

export const NOTE_CATEGORY = defineEnum([
  { value: 'academic', label: 'أكاديمية' },
  { value: 'behavior', label: 'سلوكية' },
  { value: 'positive', label: 'إيجابية / تميّز' },
  { value: 'attendance', label: 'حضور وانتظام' },
  { value: 'other', label: 'أخرى' },
] as const);
export type NoteCategory = (typeof NOTE_CATEGORY.values)[number];

// ───────────── المواد ─────────────
export const SUBJECT_PRESETS = [
  'التربية الإسلامية',
  'اللغة العربية',
  'اللغة الإنجليزية',
  'الرياضيات',
  'العلوم',
  'العلوم والحياة',
  'الأحياء',
  'الكيمياء',
  'الفيزياء',
  'علوم الأرض والبيئة',
  'الدراسات الاجتماعية',
  'الجغرافيا',
  'التاريخ',
  'تقنية المعلومات',
  'المهارات الحياتية',
  'التربية البدنية',
  'التربية الفنية',
  'التربية الموسيقية',
] as const;

/** ألوان المواد في الواجهة (مفاتيح تُحوَّل إلى ألوان في CSS) */
export const SUBJECT_COLORS = [
  'teal',
  'blue',
  'violet',
  'rose',
  'amber',
  'green',
  'orange',
  'slate',
] as const;
export type SubjectColor = (typeof SUBJECT_COLORS)[number];

// ───────────── التقويم المستمر ─────────────
export const ASSESSMENT_TYPE = defineEnum([
  { value: 'written', label: 'تحريري' },
  { value: 'oral', label: 'شفهي' },
  { value: 'practical', label: 'عملي' },
  { value: 'project', label: 'مشروع' },
  { value: 'homework', label: 'واجب' },
  { value: 'participation', label: 'مشاركة صفية' },
  { value: 'other', label: 'أخرى' },
] as const);
export type AssessmentType = (typeof ASSESSMENT_TYPE.values)[number];

export const ASSESSMENT_MODE = defineEnum([
  { value: 'score', label: 'درجة' },
  { value: 'mastery', label: 'مستوى إتقان' },
] as const);
export type AssessmentMode = (typeof ASSESSMENT_MODE.values)[number];

export const RESULT_STATUS = defineEnum([
  { value: 'graded', label: 'مرصود' },
  { value: 'absent', label: 'غائب' },
  { value: 'excused', label: 'معذور' },
] as const);
export type ResultStatus = (typeof RESULT_STATUS.values)[number];

export const MASTERY_LEVELS = [
  { value: 1, label: 'لم يتقن بعد', short: 'لم يتقن', tone: 'bad' },
  { value: 2, label: 'يحتاج إلى دعم', short: 'يحتاج دعمًا', tone: 'warn' },
  { value: 3, label: 'متقن جزئيًا', short: 'جزئيًا', tone: 'info' },
  { value: 4, label: 'متقن', short: 'متقن', tone: 'good' },
] as const;
export type MasteryLevel = 1 | 2 | 3 | 4;

export function masteryLabel(level: number | null | undefined): string {
  return MASTERY_LEVELS.find((m) => m.value === level)?.label ?? '—';
}

/** الحد الأقصى المسموح لعدد الخانات العشرية في الدرجات */
export const SCORE_DECIMALS = 2;
export const MAX_SCORE_LIMIT = 1000;

// ───────────── مستويات الأداء (قابلة للتعديل من الإعدادات) ─────────────
export const BAND_TONES = ['good', 'info', 'warn', 'bad', 'neutral'] as const;
export type BandTone = (typeof BAND_TONES)[number];

export type GradeBand = { min: number; label: string; tone: BandTone };

export type GradingSettings = {
  /** مرتبة تنازليًا حسب min، وآخر مستوى يجب أن يبدأ من 0 */
  bands: GradeBand[];
  /** أقل من هذه النسبة → يحتاج خطة علاجية */
  remedialBelow: number;
  /** من هذه النسبة فأكثر → مرشح للإثراء */
  enrichmentFrom: number;
  /** حد النجاح في التحليلات */
  passFrom: number;
};

export const DEFAULT_GRADING: GradingSettings = {
  bands: [
    { min: 90, label: 'ممتاز', tone: 'good' },
    { min: 75, label: 'جيد جدًا', tone: 'info' },
    { min: 60, label: 'جيد', tone: 'neutral' },
    { min: 50, label: 'مقبول', tone: 'warn' },
    { min: 0, label: 'يحتاج إلى دعم', tone: 'bad' },
  ],
  remedialBelow: 50,
  enrichmentFrom: 90,
  passFrom: 50,
};

// ───────────── جدول الحصص ─────────────
export type PeriodTime = { n: number; start: string; end: string };
export type ScheduleSettings = { workDays: number[]; periods: PeriodTime[] };

export const DEFAULT_SCHEDULE: ScheduleSettings = {
  workDays: DEFAULT_WORK_DAYS,
  periods: [
    { n: 1, start: '07:30', end: '08:15' },
    { n: 2, start: '08:15', end: '09:00' },
    { n: 3, start: '09:00', end: '09:45' },
    { n: 4, start: '10:05', end: '10:50' },
    { n: 5, start: '10:50', end: '11:35' },
    { n: 6, start: '11:35', end: '12:20' },
    { n: 7, start: '12:20', end: '13:05' },
    { n: 8, start: '13:05', end: '13:50' },
  ],
};

// ───────────── التحضير الإلكتروني ─────────────
export const LESSON_STATUS = defineEnum([
  { value: 'draft', label: 'مسودة' },
  { value: 'ready', label: 'جاهز' },
  { value: 'delivered', label: 'نُفّذ' },
] as const);
export type LessonStatus = (typeof LESSON_STATUS.values)[number];

export const ACTIVITY_PHASE = defineEnum([
  { value: 'intro', label: 'تمهيد' },
  { value: 'main', label: 'عرض وبناء المفهوم' },
  { value: 'practice', label: 'تدريب وتطبيق' },
  { value: 'closure', label: 'ختام وتقويم' },
] as const);
export type ActivityPhase = (typeof ACTIVITY_PHASE.values)[number];

export const STRATEGY_PRESETS = [
  'التعلم التعاوني',
  'العصف الذهني',
  'حل المشكلات',
  'الاستقصاء والاكتشاف',
  'المناقشة والحوار',
  'لعب الأدوار',
  'التعلم باللعب',
  'الخرائط الذهنية',
  'التعلم بالمشاريع',
  'التدريس المباشر',
  'التعلم الذاتي',
  'التعلم المقلوب',
  'المحاكاة والنمذجة',
  'القصة',
] as const;

export const RESOURCE_PRESETS = [
  'الكتاب المدرسي',
  'كتاب النشاط',
  'السبورة',
  'جهاز العرض',
  'أوراق عمل',
  'بطاقات تعليمية',
  'نماذج ومجسمات',
  'مواد المختبر',
  'الحاسوب والإنترنت',
  'مقاطع فيديو',
  'خرائط وصور',
] as const;

export const ASSESSMENT_METHOD_PRESETS = [
  'أسئلة شفهية',
  'ورقة عمل',
  'اختبار قصير',
  'ملاحظة',
  'مهمة أدائية',
  'عرض شفهي',
  'تقويم الأقران',
  'تقويم ذاتي',
  'سجل متابعة',
  'ملف الإنجاز',
] as const;

// ───────────── المهام والتقويم الدراسي ─────────────
export const TASK_KIND = defineEnum([
  { value: 'task', label: 'مهمة' },
  { value: 'exam', label: 'اختبار' },
  { value: 'meeting', label: 'اجتماع' },
  { value: 'reminder', label: 'تذكير' },
  { value: 'event', label: 'فعالية' },
] as const);
export type TaskKind = (typeof TASK_KIND.values)[number];

export const TASK_PRIORITY = defineEnum([
  { value: 'low', label: 'منخفضة' },
  { value: 'normal', label: 'عادية' },
  { value: 'high', label: 'مرتفعة' },
] as const);
export type TaskPriority = (typeof TASK_PRIORITY.values)[number];

export const TASK_STATUS = defineEnum([
  { value: 'open', label: 'مفتوحة' },
  { value: 'done', label: 'منجزة' },
] as const);
export type TaskStatus = (typeof TASK_STATUS.values)[number];

// ───────────── المظهر والأرقام ─────────────
export const THEME_PREF = defineEnum([
  { value: 'system', label: 'حسب النظام' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
] as const);
export type ThemePref = (typeof THEME_PREF.values)[number];

export const DIGITS_PREF = defineEnum([
  { value: 'latn', label: 'أرقام لاتينية (0 1 2 3)' },
  { value: 'arab', label: 'أرقام هندية (٠ ١ ٢ ٣)' },
] as const);
export type DigitsPref = (typeof DIGITS_PREF.values)[number];

// ───────────── الخطط العلاجية والإثرائية ─────────────
export const SUPPORT_KIND = defineEnum([
  { value: 'remedial', label: 'علاجية' },
  { value: 'enrichment', label: 'إثرائية' },
] as const);
export type SupportKind = (typeof SUPPORT_KIND.values)[number];

export const SUPPORT_STATUS = defineEnum([
  { value: 'open', label: 'مفتوحة' },
  { value: 'done', label: 'منجزة' },
  { value: 'cancelled', label: 'ملغاة' },
] as const);
export type SupportStatus = (typeof SUPPORT_STATUS.values)[number];

/** استراتيجيات جاهزة تُقترح عند كتابة الخطة (تُضاف بنقرة ويمكن كتابة غيرها) */
export const SUPPORT_STRATEGY_PRESETS: Record<'remedial' | 'enrichment', string[]> = {
  remedial: ['تبسيط المفهوم بأمثلة محسوسة', 'التعلّم بالأقران', 'تدريبات إضافية متدرجة', 'جلسة علاجية مصغّرة بعد الحصة', 'استخدام وسائل بصرية', 'متابعة أسبوعية مع ولي الأمر'],
  enrichment: ['مشروع بحثي مصغّر', 'مسائل تحدٍّ متقدمة', 'قيادة مجموعة تعاونية', 'مصادر إثرائية إضافية', 'تصميم تجربة أو نشاط للزملاء'],
};

// ───────────── سجل المختبر والأنشطة ─────────────
export const LAB_KIND = defineEnum([
  { value: 'experiment', label: 'تجربة عملية' },
  { value: 'demo', label: 'عرض عملي' },
  { value: 'activity', label: 'نشاط صفّي' },
  { value: 'project', label: 'مشروع' },
  { value: 'field_trip', label: 'زيارة ميدانية' },
  { value: 'competition', label: 'مسابقة أو معرض' },
  { value: 'other', label: 'أخرى' },
] as const);
export type LabKind = (typeof LAB_KIND.values)[number];

export const LAB_STATUS = defineEnum([
  { value: 'planned', label: 'مخطَّط' },
  { value: 'done', label: 'نُفِّذ' },
  { value: 'cancelled', label: 'ملغى' },
] as const);
export type LabStatus = (typeof LAB_STATUS.values)[number];

/** اقتراحات جاهزة تُضاف بنقرة ويمكن كتابة غيرها (لا تقيّد المعلم) */
export const LAB_MATERIAL_PRESETS = [
  'مجهر ضوئي',
  'أنابيب اختبار',
  'كؤوس مدرَّجة',
  'ميزان حساس',
  'مصدر حرارة',
  'مواد كيميائية',
  'أدوات قياس',
  'عينات',
  'نماذج ومجسمات',
  'جهاز عرض',
  'حاسوب',
] as const;

export const LAB_SAFETY_PRESETS = [
  'ارتداء المعطف والنظارات الواقية',
  'ارتداء القفازات',
  'عدم تذوّق أي مادة أو شمّها مباشرة',
  'تهوية المكان جيدًا',
  'الحذر من الأسطح الساخنة',
  'التخلص الآمن من المخلفات',
  'غسل اليدين بعد التجربة',
  'الإشراف المباشر من المعلم',
] as const;

export const LAB_LOCATION_PRESETS = ['مختبر العلوم', 'مختبر الحاسوب', 'غرفة مصادر التعلم', 'الساحة المدرسية', 'الفصل'] as const;

// ───────────── التقارير ─────────────
export const REPORT_TYPE = defineEnum([
  { value: 'class-gradebook', label: 'كشف درجات الشعبة' },
  { value: 'class-analysis', label: 'تحليل أداء الشعبة' },
  { value: 'student', label: 'تقرير الطالب' },
  { value: 'lessons', label: 'سجل التحضير' },
  { value: 'lesson-plan', label: 'ورقة تحضير الدرس' },
  { value: 'support-plans', label: 'الخطط العلاجية والإثرائية' },
  { value: 'lab-log', label: 'سجل المختبر والأنشطة' },
] as const);
export type ReportType = (typeof REPORT_TYPE.values)[number];

export const REPORT_FORMAT = ['html', 'pdf', 'xlsx'] as const;
export type ReportFormat = (typeof REPORT_FORMAT)[number];

// ───────────── إعدادات عامة ─────────────
export const LIMITS = {
  nameMax: 120,
  titleMax: 200,
  textMax: 5000,
  listItemMax: 500,
  listMax: 50,
  importMaxRows: 1000,
  importMaxBytes: 5 * 1024 * 1024,
  backupMaxBytes: 512 * 1024 * 1024,
} as const;

export { defineEnum };
