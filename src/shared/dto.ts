// عقود الاستجابة (DTO) بين الخادم والواجهة. ملف صرف بلا اعتماديات تشغيل ليُستورد من الجهتين.
// الخادم يعلّق دوال الخدمة بهذه الأنواع فيتحقق المترجم من مطابقتها، والواجهة تستهلكها كما هي.
import type {
  ActivityPhase,
  AiTaskName,
  AssessmentMode,
  AssessmentType,
  ClassRecordKind,
  Gender,
  GradingSettings,
  LabKind,
  LabStatus,
  LessonStatus,
  NoteCategory,
  ResultStatus,
  ScheduleSettings,
  StudentStatus,
  SupportKind,
  SupportStatus,
  TaskKind,
  TaskPriority,
  TaskStatus,
  UserRole,
  UserStatus,
} from './constants';
import type { LessonActivity } from './schemas/lessons';

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

// ───────────── النظام والمستخدم ─────────────
export type SystemInfo = {
  name: string;
  version: string;
  needsSetup: boolean;
  timezone: string;
  capabilities: { pdf: boolean; ai: boolean };
};

export type AuthUserDto = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isDemo: boolean;
  mustChangePassword: boolean;
};

export type UserDto = AuthUserDto & {
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

export type SessionDto = {
  id: string;
  current: boolean;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  ip: string | null;
  userAgent: string | null;
};

export type SettingsDto = {
  profile: {
    fullName: string;
    email: string;
    schoolName: string | null;
    directorate: string | null;
    jobTitle: string | null;
    specialization: string | null;
    seniorTeacherName: string | null;
    principalName: string | null;
  };
  preferences: { theme: 'system' | 'light' | 'dark'; digits: 'latn' | 'arab' };
  grading: GradingSettings;
  schedule: ScheduleSettings;
};

// ───────────── الأكاديمي ─────────────
export type TermDto = {
  id: string;
  yearId: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type YearDto = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: TermDto[];
};

export type SubjectDto = {
  id: string;
  name: string;
  color: string;
  isArchived: boolean;
  assignmentCount: number;
};

/** مقرر الشعبة: (شعبة × مادة) */
export type AssignmentDto = {
  id: string;
  sectionId: string;
  subjectId: string;
  yearId: string;
  gradeLevel: number;
  sectionName: string;
  /** مثل 10/3 */
  sectionLabel: string;
  subjectName: string;
  subjectColor: string;
  weeklyPeriods: number | null;
};

export type SectionDto = {
  id: string;
  yearId: string;
  gradeLevel: number;
  name: string;
  label: string;
  notes: string | null;
  isArchived: boolean;
  studentCount: number;
  assignments: AssignmentDto[];
};

export type ImpactDto = {
  students: number;
  assessments: number;
  results: number;
  lessons: number;
  slots: number;
};

// ───────────── الطلاب ─────────────
export type StudentDto = {
  id: string;
  fullName: string;
  studentNumber: string | null;
  gender: Gender | null;
  birthDate: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  notes: string | null;
  status: StudentStatus;
  createdAt: string;
  enrollment: { sectionId: string; sectionLabel: string; yearId: string; rollNo: number } | null;
};

export type RosterEntryDto = {
  rollNo: number;
  student: Omit<StudentDto, 'enrollment'>;
};

export type StudentsPage = { items: StudentDto[]; total: number };

export type ImportRowAction = 'create' | 'link' | 'skip';
export type ImportRowDto = {
  rowNumber: number;
  fullName: string;
  studentNumber: string | null;
  gender: Gender | null;
  action: ImportRowAction;
  linkStudentId: string | null;
  linkStudentName: string | null;
  /** تحذيرات/أخطاء تمنع الاستيراد أو تنبّه المعلم */
  issues: string[];
};
export type ImportPreviewDto = {
  rows: ImportRowDto[];
  detected: { name: string | null; number: string | null; gender: string | null; headerRow: number | null };
};

export type NoteDto = {
  id: string;
  studentId: string;
  assignmentId: string | null;
  assignmentLabel: string | null;
  date: string;
  category: NoteCategory;
  text: string;
  createdAt: string;
};

// ───────────── الجدول والتحضير ─────────────
export type SlotDto = {
  id: string;
  yearId: string;
  weekday: number;
  period: number;
  room: string | null;
  assignment: AssignmentDto;
};

export type LessonSummaryDto = {
  id: string;
  assignmentId: string;
  sectionLabel: string;
  subjectName: string;
  subjectColor: string;
  gradeLevel: number;
  date: string;
  period: number | null;
  title: string;
  unitName: string | null;
  status: LessonStatus;
  isTemplate: boolean;
  updatedAt: string;
};

export type LessonDto = LessonSummaryDto & {
  termId: string | null;
  lessonNumber: string | null;
  durationMinutes: number | null;
  outcomes: string[];
  objectives: string[];
  concepts: string[];
  strategies: string[];
  resources: string[];
  activities: LessonActivity[];
  assessmentMethods: string[];
  assessmentNotes: string | null;
  homework: string | null;
  supportPlan: string | null;
  enrichmentPlan: string | null;
  notes: string | null;
  reflection: string | null;
  sourceLessonId: string | null;
  createdAt: string;
};

export type LessonsPage = { items: LessonSummaryDto[]; total: number };

// ───────────── التقويم المستمر ─────────────
export type SkillDto = {
  id: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: number | null;
  code: string | null;
  title: string;
  description: string | null;
  isArchived: boolean;
};

export type AssessmentDto = {
  id: string;
  assignmentId: string;
  termId: string;
  title: string;
  type: AssessmentType;
  mode: AssessmentMode;
  maxScore: number | null;
  weight: number;
  date: string | null;
  description: string | null;
  countsTowardTotal: boolean;
  skillIds: string[];
  createdAt: string;
};

export type ResultDto = {
  studentId: string;
  score: number | null;
  level: number | null;
  status: ResultStatus;
  note: string | null;
};

export type GradebookStudentDto = {
  studentId: string;
  rollNo: number;
  fullName: string;
  studentNumber: string | null;
  gender: Gender | null;
  /** assessmentId → النتيجة */
  results: Record<string, ResultDto | undefined>;
};

export type GradebookDto = {
  assignment: AssignmentDto;
  term: TermDto;
  assessments: AssessmentDto[];
  students: GradebookStudentDto[];
  grading: GradingSettings;
};

export type SaveResultsResponse = { saved: number; updatedAt: string };

// ───────────── ملف الطالب ─────────────
export type StudentSubjectSummary = {
  assignment: AssignmentDto;
  termId: string;
  earned: number;
  possible: number;
  percent: number | null;
  entered: number;
  pending: number;
  classAverage: number | null;
  level: string | null;
  recent: { assessmentId: string; title: string; date: string | null; mode: AssessmentMode; max: number | null; score: number | null; level: number | null; status: ResultStatus }[];
};

export type StudentSkillSummary = {
  skillId: string;
  title: string;
  subjectName: string;
  average: number;
  count: number;
};

export type StudentProfileDto = {
  student: StudentDto;
  yearId: string;
  termId: string | null;
  subjects: StudentSubjectSummary[];
  skills: StudentSkillSummary[];
  notes: NoteDto[];
  overallPercent: number | null;
};

// ───────────── المهام ─────────────
export type TaskDto = {
  id: string;
  title: string;
  description: string | null;
  kind: TaskKind;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignmentId: string | null;
  assignmentLabel: string | null;
  completedAt: string | null;
};

export type CalendarItemDto = {
  id: string;
  type: 'task' | 'assessment' | 'lesson' | 'support' | 'lab';
  date: string;
  time: string | null;
  title: string;
  subtitle: string | null;
  tone: 'neutral' | 'info' | 'good' | 'warn' | 'bad';
  done: boolean;
  /** مسار الواجهة لفتح العنصر */
  href: string;
};

// ───────────── الخطط العلاجية والإثرائية ─────────────
export type SupportNoteDto = { id: string; planId: string; date: string; text: string; createdAt: string };

export type SupportPlanDto = {
  id: string;
  studentId: string;
  studentName: string;
  /** شعبة المقرر (أو شعبة الطالب الحالية إن لم تُربط الخطة بمقرر) */
  sectionLabel: string | null;
  assignmentId: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  kind: SupportKind;
  title: string;
  reason: string | null;
  goal: string;
  strategies: string[];
  startDate: string;
  reviewDate: string | null;
  status: SupportStatus;
  outcome: string | null;
  /** نسبة الطالب في المقرر لحظة إنشاء الخطة (خط الأساس) */
  baselinePercent: number | null;
  /** نسبته الحالية في الفصل الحالي — للمقارنة بخط الأساس */
  currentPercent: number | null;
  closedAt: string | null;
  notesCount: number;
  lastNoteDate: string | null;
  /** مفتوحة وحان (أو فات) موعد مراجعتها */
  due: boolean;
  createdAt: string;
};

export type SupportPlanDetailDto = SupportPlanDto & { notes: SupportNoteDto[] };

export type SupportSuggestionDto = {
  studentId: string;
  fullName: string;
  assignmentId: string;
  sectionLabel: string;
  subjectName: string;
  subjectColor: string;
  termId: string;
  percent: number;
  kind: SupportKind;
};

// ───────────── سجل المختبر والأنشطة ─────────────
export type LabActivitySummaryDto = {
  id: string;
  /** null ⇒ نشاط عام غير مرتبط بشعبة */
  assignmentId: string | null;
  sectionLabel: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  date: string;
  period: number | null;
  kind: LabKind;
  title: string;
  location: string | null;
  status: LabStatus;
  participants: number | null;
  /** مخطَّط وفات موعده دون تسجيل تنفيذه أو إلغائه */
  overdue: boolean;
  updatedAt: string;
};

export type LabActivityDto = LabActivitySummaryDto & {
  objectives: string[];
  materials: string[];
  safety: string[];
  procedure: string | null;
  results: string | null;
  notes: string | null;
  /** النشاط الذي نُسخ منه (للتتبع فقط) */
  sourceId: string | null;
  createdAt: string;
};

/** إحصاءات تُحسب على كل ما يطابق التصفية (عدا الحالة) ولا تتأثر بالترقيم */
export type LabStats = { planned: number; done: number; cancelled: number; overdue: number; participants: number };

export type LabActivitiesPage = { items: LabActivitySummaryDto[]; total: number; stats: LabStats };

// ───────────── إدارة الصف: المشاركة والسلوك داخل الحصة ─────────────
/** سلوك إيجابي / غير حسن / ملاحظة سُجّلت على طالب في حصة */
export type ClassRecordDto = {
  id: string;
  studentId: string;
  /** null ⇒ حُذف مقرر الحصة بعد التسجيل (يبقى التسجيل توثيقًا لما جرى) */
  assignmentId: string | null;
  date: string;
  /** null ⇒ لم تُحدَّد الحصة */
  period: number | null;
  kind: ClassRecordKind;
  reason: string | null;
  note: string | null;
  createdAt: string;
};

/** مجموع ما سُجّل لطالب (في حصة واحدة أو فترة أو مقرر) */
export type ClassCountsDto = {
  /** حصص فيها أي تسجيل لهذا الطالب */
  sessions: number;
  /** حصص شارك فيها */
  participatedSessions: number;
  /** حصص سُجّل له فيها «لم يشارك» */
  noParticipationSessions: number;
  /** مجموع مرات المشاركة */
  participations: number;
  positive: number;
  negative: number;
  notes: number;
  /** نسبة الحصص التي شارك فيها من الحصص التي سُجّلت له فيها المشاركة (شارك + لم يشارك)؛ null إن لم تُسجَّل مشاركة */
  rate: number | null;
};

/** تنبيهات المتابعة في الملخص: لم يشارك مطلقًا / قليل المشاركة / ملاحظات غير حسنة كثيرة */
export type ClassFlag = 'silent' | 'low' | 'concern';

export type ClassSessionStudentDto = {
  studentId: string;
  rollNo: number;
  fullName: string;
  gender: Gender | null;
  /** null ⇒ لم تُسجَّل بعد، 0 ⇒ لم يشارك، n ⇒ شارك n مرة */
  participation: number | null;
  /** تسجيلات هذه الحصة (الأقدم أولًا) */
  records: ClassRecordDto[];
  /** ما سُجّل له في هذا المقرر قبل هذه الحصة — سياق للمعلم أثناء الحصة، ولا يتغير بما يسجّله فيها */
  before: ClassCountsDto;
};

export type ClassSessionTotals = {
  students: number;
  /** شاركوا مرة فأكثر */
  participating: number;
  /** سُجّل لهم «لم يشارك» */
  didNotParticipate: number;
  /** لم يُسجَّل لهم شيء في المشاركة */
  unrecorded: number;
  participations: number;
  positive: number;
  negative: number;
  notes: number;
};

export type ClassSessionDto = {
  assignment: AssignmentDto;
  date: string;
  period: number | null;
  /** تحضير الدرس لهذه الحصة إن وُجد */
  lesson: { id: string; title: string } | null;
  students: ClassSessionStudentDto[];
  totals: ClassSessionTotals;
};

export type ClassSessionSummaryDto = {
  key: string;
  assignmentId: string | null;
  sectionLabel: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  date: string;
  period: number | null;
  lessonTitle: string | null;
  /** طلاب سُجّل لهم أي شيء في هذه الحصة */
  recordedStudents: number;
  participating: number;
  didNotParticipate: number;
  participations: number;
  positive: number;
  negative: number;
  notes: number;
};

export type ClassSlotDto = {
  slotId: string;
  period: number;
  start: string | null;
  end: string | null;
  assignment: AssignmentDto;
  room: string | null;
  /** طلاب الشعبة المقيَّدون */
  studentCount: number;
  /** ما سُجّل لهذه الحصة اليوم (null ⇒ لم يبدأ التسجيل) */
  session: ClassSessionSummaryDto | null;
  state: 'past' | 'current' | 'upcoming' | 'unknown';
};

export type ClassOverviewDto = {
  today: string;
  weekday: number;
  slots: ClassSlotDto[];
  /** آخر الحصص المسجّلة (الأحدث أولًا) */
  recent: ClassSessionSummaryDto[];
  /** إجمالي ما سُجّل — لإخفاء الإرشادات عمّن بدأ الاستعمال */
  total: number;
};

export type ClassSummaryRowDto = {
  studentId: string;
  rollNo: number;
  fullName: string;
  gender: Gender | null;
  counts: ClassCountsDto;
  flags: ClassFlag[];
  lastDate: string | null;
};

export type ClassSummaryDto = {
  sectionId: string;
  sectionLabel: string;
  /** null ⇒ كل مواد الشعبة */
  assignmentId: string | null;
  subjectName: string | null;
  from: string | null;
  to: string | null;
  /** حصص مختلفة سُجّل فيها شيء */
  sessions: number;
  totals: Omit<ClassCountsDto, 'sessions'>;
  rows: ClassSummaryRowDto[];
  recent: ClassSessionSummaryDto[];
};

export type ClassSessionGroupDto = {
  key: string;
  date: string;
  period: number | null;
  assignmentId: string | null;
  sectionLabel: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  lessonTitle: string | null;
  /** null ⇒ لم تُسجَّل مشاركة في هذه الحصة */
  participation: number | null;
  records: ClassRecordDto[];
};

export type ClassReasonCount = { kind: ClassRecordKind; reason: string; count: number };

export type ClassStudentSubjectDto = {
  assignmentId: string | null;
  sectionLabel: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  counts: ClassCountsDto;
};

export type ClassStudentReportDto = {
  student: StudentDto;
  assignmentId: string | null;
  from: string | null;
  to: string | null;
  counts: ClassCountsDto;
  /** نسبة مشاركة شعبته في الفترة نفسها للمقارنة (null ⇒ لا بيانات أو لا شعبة) */
  sectionRate: number | null;
  bySubject: ClassStudentSubjectDto[];
  /** كل المقررات التي سُجّل له فيها شيء في الفترة (لتصفية التقرير) */
  assignments: { id: string; label: string }[];
  reasons: ClassReasonCount[];
  /** الأحدث أولًا، بحد أقصى limit */
  sessions: ClassSessionGroupDto[];
  totalSessions: number;
};

export type ClassAttentionDto = {
  studentId: string;
  fullName: string;
  sectionLabel: string;
  /** عدد الملاحظات «غير الحسنة» (للسلوك) أو الحصص التي سُجّلت مشاركتها (لقلة المشاركة) */
  count: number;
  /** نسبة المشاركة (لقلة المشاركة فقط) */
  rate: number | null;
  /** أحدث سبب أو ملاحظة (للسلوك فقط) */
  reason: string | null;
};

export type ClassDashboardDto = {
  /** إجمالي ما سُجّل — لإخفاء البطاقة عمّن لم يستعمل الوحدة بعد */
  total: number;
  /** طلاب لهم ملاحظات «غير حسنة» في آخر 14 يومًا */
  negativeRecent: ClassAttentionDto[];
  /** قليلو المشاركة في آخر 30 يومًا */
  lowParticipation: ClassAttentionDto[];
};

// ───────────── المساعد الذكي ─────────────
export type AiProviderInfo = {
  id: string;
  label: string;
  model: string;
  /** مضيف الخدمة التي يُرسَل إليها النص (للشفافية: أين يذهب ما يُكتب؟) */
  host: string;
  /** يعمل على الجهاز/الشبكة المحلية نفسها (لا يخرج النص إلى الإنترنت) */
  local: boolean;
};

export type AiStatusDto = {
  /** مضبوط على الخادم ووافق المدير: تظهر الميزة للمعلمين */
  ready: boolean;
  provider: AiProviderInfo | null;
  limits: { perDay: number; usedToday: number };
};

export type AiLessonDraft = {
  outcomes: string[];
  objectives: string[];
  concepts: string[];
  strategies: string[];
  resources: string[];
  activities: { phase: ActivityPhase; description: string; minutes: number | null }[];
  assessmentMethods: string[];
  homework: string | null;
  supportIdea: string | null;
  enrichmentIdea: string | null;
};

export type AiAssessmentIdea = { title: string; type: AssessmentType; description: string; criteria: string[] };
export type AiAssessmentIdeas = { ideas: AiAssessmentIdea[] };
export type AiSupportIdeas = { reason: string | null; goal: string | null; strategies: string[] };

export type AiRunResponse = {
  source: AiProviderInfo;
  usage: { usedToday: number; perDay: number };
} & (
  | { task: Extract<AiTaskName, 'lesson-draft'>; result: AiLessonDraft }
  | { task: Extract<AiTaskName, 'assessment-ideas'>; result: AiAssessmentIdeas }
  | { task: Extract<AiTaskName, 'support-plan-ideas'>; result: AiSupportIdeas }
);

export type AiUsageDto = { runs: number; blocked: number; failed: number; inputTokens: number; outputTokens: number };

export type AiSettingsDto = {
  /** مزوّد مضبوط في بيئة الخادم (AI_PROVIDER + المفتاح) */
  configured: boolean;
  /** موافقة المدير على تفعيل الميزة للمعلمين */
  enabled: boolean;
  ready: boolean;
  provider: AiProviderInfo | null;
  limits: { perDay: number; perMinute: number; maxConcurrency: number };
  usage: { last24h: AiUsageDto; last7d: AiUsageDto };
  /** آخر خطأ من المزوّد منذ تشغيل الخادم (بلا نصوص أو مفاتيح) */
  lastError: { at: string; kind: string; status: number | null } | null;
};

// ───────────── لوحة التحكم ─────────────
export type DashboardTodaySlot = {
  slotId: string;
  period: number;
  start: string | null;
  end: string | null;
  assignment: AssignmentDto;
  room: string | null;
  lesson: { id: string; title: string; status: LessonStatus } | null;
  /** آخر تحضير سابق لنفس المقرر يمكن نسخه */
  lastLesson: { id: string; title: string; date: string } | null;
  /** طلاب سُجّل لهم شيء في إدارة الصف لهذه الحصة اليوم */
  classRecorded: number;
  state: 'past' | 'current' | 'upcoming' | 'unknown';
};

export type DashboardIncomplete = {
  assessmentId: string;
  title: string;
  date: string | null;
  assignment: AssignmentDto;
  missing: number;
  total: number;
};

export type DashboardAttention = {
  studentId: string;
  fullName: string;
  sectionLabel: string;
  subjectName: string;
  assignmentId: string;
  percent: number;
  /** لهذا الطالب خطة علاجية مفتوحة في هذا المقرر */
  hasPlan: boolean;
};

export type DashboardDto = {
  today: string;
  weekday: number;
  year: YearDto | null;
  term: TermDto | null;
  weekNumber: number | null;
  counts: { sections: number; students: number; assignments: number };
  setup: { hasYear: boolean; hasSection: boolean; hasStudents: boolean; hasTimetable: boolean; hasLesson: boolean; hasAssessment: boolean };
  todaySlots: DashboardTodaySlot[];
  lessonsThisWeek: { planned: number; slots: number };
  tasks: { overdue: TaskDto[]; today: TaskDto[]; upcoming: TaskDto[] };
  incomplete: DashboardIncomplete[];
  upcomingAssessments: { assessmentId: string; title: string; date: string; assignment: AssignmentDto }[];
  attention: DashboardAttention[];
  support: { open: number; due: number };
  /** أنشطة المختبر: القادمة (اليوم فما بعد)، وعدد ما فات موعده دون تسجيل تنفيذه، وإجمالي ما سُجِّل (لإخفاء البطاقة عمّن لا يستخدمها) */
  lab: { upcoming: LabActivitySummaryDto[]; overdue: number; total: number };
  classroom: ClassDashboardDto;
};

// ───────────── التقارير والنسخ الاحتياطي ─────────────
export type BackupReason = 'manual' | 'auto' | 'pre-migration' | 'pre-restore';

export type BackupDto = {
  name: string;
  size: number;
  createdAt: string;
  encrypted: boolean;
  /** يدوية، تلقائية، قبل ترقية القاعدة، أو احتياط قبل استعادة */
  reason: BackupReason;
};

export type AuditEntryDto = {
  id: number;
  at: string;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
};
