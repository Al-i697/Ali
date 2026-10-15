// عقود الاستجابة (DTO) بين الخادم والواجهة. ملف صرف بلا اعتماديات تشغيل ليُستورد من الجهتين.
// الخادم يعلّق دوال الخدمة بهذه الأنواع فيتحقق المترجم من مطابقتها، والواجهة تستهلكها كما هي.
import type {
  AssessmentMode,
  AssessmentType,
  Gender,
  GradingSettings,
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
  type: 'task' | 'assessment' | 'lesson' | 'support';
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
