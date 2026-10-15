import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Toaster } from 'sonner';
import { ApiError } from '@/lib/api';
import { AuthProvider, useAuth } from '@/context/auth';
import { AcademicProvider } from '@/context/academic';
import { AppShell } from '@/components/layout/app-shell';
import { Alert, ConfirmProvider, PageLoader, TooltipProvider } from '@/components/ui';
import { ForcePasswordChangePage, LoginPage, SetupPage } from '@/features/auth/auth-pages';

const DashboardPage = lazy(() => import('@/features/dashboard/dashboard-page'));
const ClassesPage = lazy(() => import('@/features/classes/classes-page'));
const SectionPage = lazy(() => import('@/features/classes/section-page'));
const StudentProfilePage = lazy(() => import('@/features/students/student-profile-page'));
const LessonsPage = lazy(() => import('@/features/lessons/lessons-page'));
const LessonEditorPage = lazy(() => import('@/features/lessons/lesson-editor-page'));
const AssessmentsPage = lazy(() => import('@/features/gradebook/assessments-page'));
const GradebookPage = lazy(() => import('@/features/gradebook/gradebook-page'));
const TimetablePage = lazy(() => import('@/features/timetable/timetable-page'));
const TasksPage = lazy(() => import('@/features/tasks/tasks-page'));
const SupportPage = lazy(() => import('@/features/support/support-page'));
const SupportPlanPage = lazy(() => import('@/features/support/plan-page'));
const ReportsPage = lazy(() => import('@/features/reports/reports-page'));
const SettingsPage = lazy(() => import('@/features/settings/settings-page'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
    },
  },
});

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, system, booting, bootError } = useAuth();
  const location = useLocation();
  if (booting) return <PageLoader label="جارٍ تحميل سجلي…" />;
  if (bootError) return <div className="mx-auto max-w-lg p-8"><Alert tone="bad" title="تعذّر الاتصال بالخادم">تأكد أن الخادم يعمل ثم أعد تحميل الصفحة.</Alert></div>;
  if (system?.needsSetup) return <Navigate to="/setup" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (user.mustChangePassword) return <ForcePasswordChangePage />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <div className="mb-2 text-[56px] font-bold text-brand">404</div>
        <p className="mb-4 text-lg text-muted">الصفحة التي تبحث عنها غير موجودة.</p>
        <a href="/" className="text-brand underline underline-offset-4">العودة للوحة التحكم</a>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider dir="rtl">
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <AuthProvider>
              <ConfirmProvider>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/setup" element={<SetupPage />} />
                    <Route
                      element={
                        <RequireAuth>
                          <AcademicProvider>
                            <AppShell />
                          </AcademicProvider>
                        </RequireAuth>
                      }
                    >
                      <Route index element={<DashboardPage />} />
                      <Route path="classes" element={<ClassesPage />} />
                      <Route path="classes/:sectionId" element={<SectionPage />} />
                      <Route path="students/:studentId" element={<StudentProfilePage />} />
                      <Route path="lessons" element={<LessonsPage />} />
                      <Route path="lessons/new" element={<LessonEditorPage />} />
                      <Route path="lessons/:lessonId" element={<LessonEditorPage />} />
                      <Route path="assessments" element={<AssessmentsPage />} />
                      <Route path="assessments/:assignmentId" element={<GradebookPage />} />
                      <Route path="timetable" element={<TimetablePage />} />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="support" element={<SupportPage />} />
                      <Route path="support/:planId" element={<SupportPlanPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </ConfirmProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
        <Toaster position="bottom-center" dir="rtl" richColors closeButton toastOptions={{ classNames: { toast: 'font-sans' } }} />
      </DirectionProvider>
    </QueryClientProvider>
  );
}
