import { useQuery, type QueryClient } from '@tanstack/react-query';
import type {
  AssignmentDto,
  SectionDto,
  SettingsDto,
  SubjectDto,
  SystemInfo,
  AuthUserDto,
  YearDto,
} from '@shared/dto';
import { api } from './api';

// مفاتيح الاستعلام المركزية — تُستعمل أيضًا لإبطال الذاكرة المؤقتة بعد التعديلات
export const qk = {
  system: ['system'] as const,
  me: ['me'] as const,
  settings: ['settings'] as const,
  years: ['years'] as const,
  subjects: ['subjects'] as const,
  sections: (yearId?: string) => ['sections', yearId ?? 'none'] as const,
  section: (id: string) => ['section', id] as const,
  roster: (sectionId: string) => ['roster', sectionId] as const,
  assignments: (yearId?: string) => ['assignments', yearId ?? 'none'] as const,
  students: (params?: unknown) => ['students', params ?? {}] as const,
  student: (id: string) => ['student', id] as const,
  profile: (id: string, termId?: string) => ['profile', id, termId ?? 'current'] as const,
  notes: (id: string) => ['notes', id] as const,
  timetable: (yearId?: string) => ['timetable', yearId ?? 'none'] as const,
  lessons: (params?: unknown) => ['lessons', params ?? {}] as const,
  lesson: (id: string) => ['lesson', id] as const,
  gradebook: (assignmentId: string, termId: string) => ['gradebook', assignmentId, termId] as const,
  assessments: (assignmentId: string, termId?: string) => ['assessments', assignmentId, termId ?? 'all'] as const,
  skills: (subjectId?: string) => ['skills', subjectId ?? 'all'] as const,
  tasks: (params?: unknown) => ['tasks', params ?? {}] as const,
  // كل مفاتيح الدعم تبدأ بـ'support' فيكفي إبطال ['support'] لتحديثها معًا
  supportPlans: (params?: unknown) => ['support', 'plans', params ?? {}] as const,
  supportPlan: (id: string) => ['support', 'plan', id] as const,
  supportSuggestions: (assignmentId?: string) => ['support', 'suggestions', assignmentId ?? 'all'] as const,
  // كل مفاتيح المختبر تبدأ بـ'lab' فيكفي إبطال ['lab'] لتحديثها معًا
  lab: (params?: unknown) => ['lab', 'list', params ?? {}] as const,
  labItem: (id: string) => ['lab', 'item', id] as const,
  calendar: (from: string, to: string) => ['calendar', from, to] as const,
  dashboard: ['dashboard'] as const,
  users: ['users'] as const,
  backups: ['backups'] as const,
  sessions: ['sessions'] as const,
};

export const useSystemInfo = () => useQuery({ queryKey: qk.system, queryFn: () => api.get<SystemInfo>('/system/info'), staleTime: 60_000 });

/** المستخدم الحالي: null عند عدم تسجيل الدخول (الخادم يعيد 200 مع user:null) */
export const useMe = () =>
  useQuery({
    queryKey: qk.me,
    retry: false,
    staleTime: 5 * 60_000,
    queryFn: async () => (await api.get<{ user: AuthUserDto | null }>('/auth/me')).user,
  });

export const useSettings = (enabled = true) =>
  useQuery({ queryKey: qk.settings, queryFn: () => api.get<SettingsDto>('/settings'), enabled, staleTime: 60_000 });

export const useYears = () => useQuery({ queryKey: qk.years, queryFn: () => api.get<YearDto[]>('/years') });
export const useSubjects = () => useQuery({ queryKey: qk.subjects, queryFn: () => api.get<SubjectDto[]>('/subjects') });

export const useSections = (yearId?: string) =>
  useQuery({
    queryKey: qk.sections(yearId),
    queryFn: () => api.get<SectionDto[]>('/sections', { yearId }),
    enabled: !!yearId,
  });

export const useAssignments = (yearId?: string) =>
  useQuery({
    queryKey: qk.assignments(yearId),
    queryFn: () => api.get<AssignmentDto[]>('/assignments', { yearId }),
    enabled: !!yearId,
  });

/** يُبطل كل ما يتأثر بتغيير بنية الشعب/الطلاب/التقويم (أبسط وأأمن من إبطال انتقائي دقيق) */
export function invalidateAcademic(qc: QueryClient) {
  for (const key of ['sections', 'section', 'roster', 'assignments', 'students', 'student', 'profile', 'gradebook', 'assessments', 'dashboard', 'timetable', 'lessons', 'subjects', 'years', 'support', 'lab']) {
    void qc.invalidateQueries({ queryKey: [key] });
  }
}
