// مخطط قاعدة البيانات (SQLite). المبادئ:
//  • كل جدول بيانات يحمل owner_id (المعلم) — وكل استعلام يُقيَّد به: لا يرى معلم بيانات غيره.
//  • معرّفات UUID عشوائية (غير قابلة للتخمين)، التواريخ YYYY-MM-DD نصوص، الطوابع ISO-8601 نصوص.
//  • قيود فريدة وCHECK ومفاتيح أجنبية تحمي سلامة البيانات حتى لو أخطأ التطبيق.
//  • استخدمنا crypto العام (لا استيراد من node) ليبقى الملف صالحًا لاستيراد «الأنواع» في الواجهة.
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import type {
  AssessmentMode,
  AssessmentType,
  ClassRecordKind,
  GradingSettings,
  Gender,
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
} from '../../shared/constants';
import type { LessonActivity } from '../../shared/schemas/lessons';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const now = () => new Date().toISOString();

const timestamps = {
  createdAt: text('created_at').notNull().$defaultFn(now),
  updatedAt: text('updated_at').notNull().$defaultFn(now).$onUpdateFn(now),
};

const owner = () =>
  text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' });

// ═════════════ المستخدمون والجلسات ═════════════
export const users = sqliteTable(
  'users',
  {
    id: id(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    fullName: text('full_name').notNull(),
    role: text('role').$type<UserRole>().notNull().default('teacher'),
    status: text('status').$type<UserStatus>().notNull().default('active'),
    /** حساب تجريبي ببيانات وهمية (يُنشأ فقط بأمر CLI صريح) */
    isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(false),
    mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(false),
    failedLogins: integer('failed_logins').notNull().default(0),
    lockedUntil: text('locked_until'),
    lastLoginAt: text('last_login_at'),
    ...timestamps,
  },
  (t) => [check('users_role_chk', sql`${t.role} in ('admin','teacher')`)],
);

export const sessions = sqliteTable(
  'sessions',
  {
    /** SHA-256 لرمز الجلسة — لا يُخزَّن الرمز نفسه أبدًا */
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull().$defaultFn(now),
    lastSeenAt: text('last_seen_at').notNull().$defaultFn(now),
    expiresAt: text('expires_at').notNull(),
    remember: integer('remember', { mode: 'boolean' }).notNull().default(false),
    ip: text('ip'),
    userAgent: text('user_agent'),
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expires_idx').on(t.expiresAt)],
);

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  schoolName: text('school_name'),
  directorate: text('directorate'),
  jobTitle: text('job_title'),
  specialization: text('specialization'),
  seniorTeacherName: text('senior_teacher_name'),
  principalName: text('principal_name'),
  theme: text('theme').$type<'system' | 'light' | 'dark'>().notNull().default('system'),
  digits: text('digits').$type<'latn' | 'arab'>().notNull().default('latn'),
  grading: text('grading', { mode: 'json' }).$type<GradingSettings>(),
  schedule: text('schedule', { mode: 'json' }).$type<ScheduleSettings>(),
  updatedAt: text('updated_at').notNull().$defaultFn(now).$onUpdateFn(now),
});

// ═════════════ السنة الدراسية والفصول ═════════════
export const academicYears = sqliteTable(
  'academic_years',
  {
    id: id(),
    ownerId: owner(),
    name: text('name').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('years_owner_name_uq').on(t.ownerId, t.name),
    // عام حالي واحد فقط لكل معلم
    uniqueIndex('years_one_current_uq')
      .on(t.ownerId)
      .where(sql`${t.isCurrent} = 1`),
    check('years_dates_chk', sql`${t.startDate} < ${t.endDate}`),
  ],
);

export const terms = sqliteTable(
  'terms',
  {
    id: id(),
    ownerId: owner(),
    yearId: text('year_id')
      .notNull()
      .references(() => academicYears.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
    name: text('name').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
  },
  (t) => [
    uniqueIndex('terms_year_number_uq').on(t.yearId, t.number),
    check('terms_number_chk', sql`${t.number} in (1, 2)`),
    check('terms_dates_chk', sql`${t.startDate} < ${t.endDate}`),
  ],
);

// ═════════════ المواد والشعب ═════════════
export const subjects = sqliteTable(
  'subjects',
  {
    id: id(),
    ownerId: owner(),
    name: text('name').notNull(),
    color: text('color').notNull().default('teal'),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex('subjects_owner_name_uq').on(t.ownerId, t.name)],
);

export const sections = sqliteTable(
  'sections',
  {
    id: id(),
    ownerId: owner(),
    yearId: text('year_id')
      .notNull()
      .references(() => academicYears.id, { onDelete: 'cascade' }),
    gradeLevel: integer('grade_level').notNull(),
    name: text('name').notNull(),
    notes: text('notes'),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('sections_unique_uq').on(t.ownerId, t.yearId, t.gradeLevel, t.name),
    index('sections_year_idx').on(t.ownerId, t.yearId),
    check('sections_grade_chk', sql`${t.gradeLevel} between 1 and 12`),
  ],
);

/** مقرر الشعبة: (شعبة × مادة) — وحدة التحضير والتقويم والجدول */
export const assignments = sqliteTable(
  'assignments',
  {
    id: id(),
    ownerId: owner(),
    sectionId: text('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),
    subjectId: text('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'restrict' }),
    weeklyPeriods: integer('weekly_periods'),
    createdAt: text('created_at').notNull().$defaultFn(now),
  },
  (t) => [
    uniqueIndex('assignments_section_subject_uq').on(t.sectionId, t.subjectId),
    index('assignments_owner_idx').on(t.ownerId),
    index('assignments_subject_idx').on(t.subjectId),
  ],
);

// ═════════════ الطلاب ═════════════
export const students = sqliteTable(
  'students',
  {
    id: id(),
    ownerId: owner(),
    fullName: text('full_name').notNull(),
    /** صيغة مطبّعة للبحث والترتيب (انظر normalizeArabic) */
    nameNormalized: text('name_normalized').notNull(),
    studentNumber: text('student_number'),
    gender: text('gender').$type<Gender>(),
    birthDate: text('birth_date'),
    guardianName: text('guardian_name'),
    guardianPhone: text('guardian_phone'),
    notes: text('notes'),
    status: text('status').$type<StudentStatus>().notNull().default('active'),
    ...timestamps,
  },
  (t) => [
    index('students_owner_name_idx').on(t.ownerId, t.nameNormalized),
    // الرقم التعريفي فريد لكل معلم عند وجوده
    uniqueIndex('students_owner_number_uq')
      .on(t.ownerId, t.studentNumber)
      .where(sql`${t.studentNumber} is not null`),
  ],
);

/** تسجيل الطالب في شعبة خلال عام دراسي (طالب واحد = شعبة واحدة في العام) */
export const enrollments = sqliteTable(
  'enrollments',
  {
    id: id(),
    ownerId: owner(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    sectionId: text('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),
    yearId: text('year_id')
      .notNull()
      .references(() => academicYears.id, { onDelete: 'cascade' }),
    rollNo: integer('roll_no').notNull(),
    createdAt: text('created_at').notNull().$defaultFn(now),
  },
  (t) => [
    uniqueIndex('enrollments_student_year_uq').on(t.studentId, t.yearId),
    index('enrollments_section_idx').on(t.sectionId, t.rollNo),
  ],
);

export const studentNotes = sqliteTable(
  'student_notes',
  {
    id: id(),
    ownerId: owner(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    category: text('category').$type<NoteCategory>().notNull().default('academic'),
    text: text('text').notNull(),
    ...timestamps,
  },
  (t) => [index('student_notes_student_idx').on(t.ownerId, t.studentId, t.date)],
);

// ═════════════ الجدول الأسبوعي ═════════════
export const timetableSlots = sqliteTable(
  'timetable_slots',
  {
    id: id(),
    ownerId: owner(),
    yearId: text('year_id')
      .notNull()
      .references(() => academicYears.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    weekday: integer('weekday').notNull(),
    period: integer('period').notNull(),
    room: text('room'),
    createdAt: text('created_at').notNull().$defaultFn(now),
  },
  (t) => [
    // لا يُدرِّس المعلم شعبتين في الحصة نفسها
    uniqueIndex('slots_unique_uq').on(t.ownerId, t.yearId, t.weekday, t.period),
    index('slots_assignment_idx').on(t.assignmentId),
    check('slots_weekday_chk', sql`${t.weekday} between 0 and 6`),
    check('slots_period_chk', sql`${t.period} between 1 and 12`),
  ],
);

// ═════════════ التحضير الإلكتروني ═════════════
export const lessonPlans = sqliteTable(
  'lesson_plans',
  {
    id: id(),
    ownerId: owner(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    termId: text('term_id').references(() => terms.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    period: integer('period'),
    title: text('title').notNull(),
    unitName: text('unit_name'),
    lessonNumber: text('lesson_number'),
    /** عنوان + وحدة + رقم الدرس بعد التطبيع العربي — للبحث */
    searchText: text('search_text').notNull().default(''),
    durationMinutes: integer('duration_minutes'),
    outcomes: text('outcomes', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    objectives: text('objectives', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    concepts: text('concepts', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    strategies: text('strategies', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    resources: text('resources', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    activities: text('activities', { mode: 'json' })
      .$type<LessonActivity[]>()
      .notNull()
      .default(sql`'[]'`),
    assessmentMethods: text('assessment_methods', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    assessmentNotes: text('assessment_notes'),
    homework: text('homework'),
    supportPlan: text('support_plan'),
    enrichmentPlan: text('enrichment_plan'),
    notes: text('notes'),
    reflection: text('reflection'),
    status: text('status').$type<LessonStatus>().notNull().default('draft'),
    isTemplate: integer('is_template', { mode: 'boolean' }).notNull().default(false),
    /** الدرس الذي نُسخ منه هذا التحضير (للتتبع فقط) */
    sourceLessonId: text('source_lesson_id'),
    ...timestamps,
  },
  (t) => [
    index('lessons_owner_date_idx').on(t.ownerId, t.date),
    index('lessons_assignment_date_idx').on(t.assignmentId, t.date),
    index('lessons_template_idx').on(t.ownerId, t.isTemplate),
  ],
);

// ═════════════ المهارات والتقويم المستمر ═════════════
export const skills = sqliteTable(
  'skills',
  {
    id: id(),
    ownerId: owner(),
    subjectId: text('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    gradeLevel: integer('grade_level'),
    code: text('code'),
    title: text('title').notNull(),
    description: text('description'),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (t) => [index('skills_subject_idx').on(t.ownerId, t.subjectId)],
);

export const assessments = sqliteTable(
  'assessments',
  {
    id: id(),
    ownerId: owner(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    termId: text('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: text('type').$type<AssessmentType>().notNull().default('written'),
    mode: text('mode').$type<AssessmentMode>().notNull().default('score'),
    maxScore: real('max_score'),
    weight: real('weight').notNull().default(0),
    date: text('date'),
    description: text('description'),
    countsTowardTotal: integer('counts_toward_total', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index('assessments_assignment_term_idx').on(t.assignmentId, t.termId, t.date),
    index('assessments_owner_date_idx').on(t.ownerId, t.date),
    check('assessments_max_chk', sql`${t.maxScore} is null or ${t.maxScore} > 0`),
    check('assessments_weight_chk', sql`${t.weight} >= 0`),
    check(
      'assessments_mode_chk',
      sql`(${t.mode} = 'score' and ${t.maxScore} is not null) or ${t.mode} = 'mastery'`,
    ),
  ],
);

export const assessmentSkills = sqliteTable(
  'assessment_skills',
  {
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.assessmentId, t.skillId] }), index('assessment_skills_skill_idx').on(t.skillId)],
);

export const assessmentResults = sqliteTable(
  'assessment_results',
  {
    id: id(),
    ownerId: owner(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    score: real('score'),
    level: integer('level'),
    status: text('status').$type<ResultStatus>().notNull().default('graded'),
    note: text('note'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('results_assessment_student_uq').on(t.assessmentId, t.studentId),
    index('results_student_idx').on(t.ownerId, t.studentId),
    check('results_score_chk', sql`${t.score} is null or ${t.score} >= 0`),
    check('results_level_chk', sql`${t.level} is null or ${t.level} between 1 and 4`),
  ],
);

// ═════════════ المهام والتقويم الدراسي ═════════════
export const tasks = sqliteTable(
  'tasks',
  {
    id: id(),
    ownerId: owner(),
    title: text('title').notNull(),
    description: text('description'),
    kind: text('kind').$type<TaskKind>().notNull().default('task'),
    dueDate: text('due_date'),
    dueTime: text('due_time'),
    priority: text('priority').$type<TaskPriority>().notNull().default('normal'),
    status: text('status').$type<TaskStatus>().notNull().default('open'),
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    completedAt: text('completed_at'),
    ...timestamps,
  },
  (t) => [index('tasks_owner_status_due_idx').on(t.ownerId, t.status, t.dueDate)],
);

// ═════════════ الخطط العلاجية والإثرائية ═════════════
export const supportPlans = sqliteTable(
  'support_plans',
  {
    id: id(),
    ownerId: owner(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    /** الفصل الذي أُخذ منه خط الأساس */
    termId: text('term_id').references(() => terms.id, { onDelete: 'set null' }),
    kind: text('kind').$type<SupportKind>().notNull(),
    title: text('title').notNull(),
    reason: text('reason'),
    goal: text('goal').notNull(),
    strategies: text('strategies', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    startDate: text('start_date').notNull(),
    reviewDate: text('review_date'),
    status: text('status').$type<SupportStatus>().notNull().default('open'),
    outcome: text('outcome'),
    /** نسبة الطالب في المقرر لحظة إنشاء الخطة — لقياس أثر الخطة لاحقًا */
    baselinePercent: real('baseline_percent'),
    closedAt: text('closed_at'),
    ...timestamps,
  },
  (t) => [
    index('support_plans_owner_status_idx').on(t.ownerId, t.status, t.reviewDate),
    index('support_plans_owner_student_idx').on(t.ownerId, t.studentId),
    index('support_plans_assignment_idx').on(t.assignmentId),
    check('support_plans_kind_chk', sql`${t.kind} in ('remedial','enrichment')`),
    check('support_plans_status_chk', sql`${t.status} in ('open','done','cancelled')`),
  ],
);

export const supportPlanNotes = sqliteTable(
  'support_plan_notes',
  {
    id: id(),
    ownerId: owner(),
    planId: text('plan_id')
      .notNull()
      .references(() => supportPlans.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    text: text('text').notNull(),
    ...timestamps,
  },
  (t) => [index('support_notes_plan_date_idx').on(t.planId, t.date)],
);

// ═════════════ سجل المختبر والأنشطة ═════════════
export const labActivities = sqliteTable(
  'lab_activities',
  {
    id: id(),
    ownerId: owner(),
    /** يبقى السجل بعد حذف المقرر (يصير «عامًا») — فهو توثيق لما نُفِّذ فعلًا */
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    period: integer('period'),
    kind: text('kind').$type<LabKind>().notNull().default('experiment'),
    title: text('title').notNull(),
    /** عنوان + مكان + مواد بعد التطبيع العربي — للبحث */
    searchText: text('search_text').notNull().default(''),
    location: text('location'),
    objectives: text('objectives', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    materials: text('materials', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    safety: text('safety', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    procedure: text('procedure'),
    results: text('results'),
    participants: integer('participants'),
    notes: text('notes'),
    status: text('status').$type<LabStatus>().notNull().default('planned'),
    /** النشاط الذي نُسخ منه هذا النشاط (للتتبع فقط) */
    sourceId: text('source_id'),
    ...timestamps,
  },
  (t) => [
    index('lab_owner_date_idx').on(t.ownerId, t.date),
    index('lab_assignment_date_idx').on(t.assignmentId, t.date),
    index('lab_owner_status_idx').on(t.ownerId, t.status, t.date),
    check('lab_kind_chk', sql`${t.kind} in ('experiment','demo','activity','project','field_trip','competition','other')`),
    check('lab_status_chk', sql`${t.status} in ('planned','done','cancelled')`),
    check('lab_period_chk', sql`${t.period} is null or ${t.period} between 1 and 12`),
    check('lab_participants_chk', sql`${t.participants} is null or ${t.participants} >= 0`),
  ],
);

// ═════════════ إدارة الصف: المشاركة والسلوك داخل الحصة ═════════════
/**
 * مشاركة الطالب في حصة: صف واحد لكل (طالب × مقرر × تاريخ × حصة).
 * count = 0 ⇒ «لم يشارك»، n ⇒ شارك n مرة، وغياب الصف ⇒ لم تُسجَّل مشاركته بعد.
 * يبقى السجل بعد حذف المقرر (يصير «حصة بلا مقرر») وبعد نقل الطالب: هو توثيق لما جرى فعلًا، ويُحذف مع الطالب نفسه.
 */
export const classParticipation = sqliteTable(
  'class_participation',
  {
    id: id(),
    ownerId: owner(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    /** 0 = لم تُحدَّد الحصة. تُخزَّن رقمًا لا NULL كي يعمل القيد الفريد (NULL يخالف كل NULL في SQLite) */
    period: integer('period').notNull().default(0),
    count: integer('count').notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('class_part_unique_uq').on(t.studentId, t.assignmentId, t.date, t.period),
    index('class_part_session_idx').on(t.ownerId, t.assignmentId, t.date),
    index('class_part_student_idx').on(t.ownerId, t.studentId, t.date),
    // الحد الأقصى يطابق CLASS_LIMITS.maxParticipation
    check('class_part_count_chk', sql`${t.count} between 0 and 50`),
    check('class_part_period_chk', sql`${t.period} between 0 and 12`),
  ],
);

/** سلوك إيجابي / غير حسن / ملاحظة على طالب في حصة. السبب المختصر هو ما يُجمَّع عليه في التقارير */
export const classRecords = sqliteTable(
  'class_records',
  {
    id: id(),
    ownerId: owner(),
    studentId: text('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    period: integer('period').notNull().default(0),
    kind: text('kind').$type<ClassRecordKind>().notNull(),
    reason: text('reason'),
    note: text('note'),
    ...timestamps,
  },
  (t) => [
    index('class_rec_session_idx').on(t.ownerId, t.assignmentId, t.date),
    index('class_rec_student_idx').on(t.ownerId, t.studentId, t.date),
    check('class_rec_kind_chk', sql`${t.kind} in ('positive','negative','note')`),
    check('class_rec_period_chk', sql`${t.period} between 0 and 12`),
    // تسجيل بلا سبب ولا ملاحظة بلا معنى
    check('class_rec_text_chk', sql`${t.reason} is not null or ${t.note} is not null`),
  ],
);

// ═════════════ إعدادات النظام (للنظام كله لا لمعلم بعينه) ═════════════
/** مفتاح/قيمة: مثل موافقة المدير على المساعد الذكي. بلا owner_id عمدًا — يديرها المدير فقط عبر واجهات مخصصة */
export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
  /** من غيّر القيمة (بلا مفتاح أجنبي: يبقى الأثر بعد حذف الحساب) */
  updatedBy: text('updated_by'),
  updatedAt: text('updated_at').notNull().$defaultFn(now).$onUpdateFn(now),
});

// ═════════════ سجل التدقيق ═════════════
/** لا مفتاح أجنبي للمستخدم عمدًا: يبقى السجل بعد حذف الحساب */
export const auditLog = sqliteTable(
  'audit_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    at: text('at').notNull().$defaultFn(now),
    userId: text('user_id'),
    userEmail: text('user_email'),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    meta: text('meta', { mode: 'json' }).$type<Record<string, unknown>>(),
    ip: text('ip'),
  },
  (t) => [index('audit_at_idx').on(t.at), index('audit_user_idx').on(t.userId)],
);
