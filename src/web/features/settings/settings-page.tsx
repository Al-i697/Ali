import { useEffect, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { CalendarRange, Clock, DatabaseBackup, Gauge, Palette, ScrollText, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useSettings } from '@/lib/queries';
import { PageHeader, PageLoader, QueryError, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { AcademicTab } from './academic-tab';
import { AuditTab } from './audit-tab';
import { BackupsTab } from './backups-tab';
import { AppearanceTab, ProfileTab } from './profile-appearance-tabs';
import { GradingTab, ScheduleTab } from './schedule-grading-tabs';
import { SecurityTab } from './security-tab';
import { UsersTab } from './users-tab';

type TabDef = { id: string; label: string; icon: ReactNode; adminOnly?: boolean };

const TABS: TabDef[] = [
  { id: 'profile', label: 'الملف الشخصي', icon: <UserRound className="size-4" /> },
  { id: 'academic', label: 'الأعوام والمواد', icon: <CalendarRange className="size-4" /> },
  { id: 'schedule', label: 'الحصص', icon: <Clock className="size-4" /> },
  { id: 'grading', label: 'المستويات', icon: <Gauge className="size-4" /> },
  { id: 'appearance', label: 'المظهر', icon: <Palette className="size-4" /> },
  { id: 'security', label: 'الأمان', icon: <ShieldCheck className="size-4" /> },
  { id: 'users', label: 'المستخدمون', icon: <Users className="size-4" />, adminOnly: true },
  { id: 'backups', label: 'النسخ الاحتياطي', icon: <DatabaseBackup className="size-4" />, adminOnly: true },
  { id: 'audit', label: 'سجل العمليات', icon: <ScrollText className="size-4" />, adminOnly: true },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const settings = useSettings();
  const [params, setParams] = useSearchParams();
  const isAdmin = user?.role === 'admin';
  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin);
  const requested = params.get('tab');
  const active = tabs.some((t) => t.id === requested) ? (requested as string) : 'profile';

  // على الشاشات الضيقة تُمرَّر قائمة التبويبات أفقيًا: نُظهر التبويب النشط دائمًا (مثلًا عند الوصول بـ ?tab=audit)
  const listWrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listWrap.current?.querySelector('[data-state=active]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [active]);

  return (
    <div>
      <PageHeader title="الإعدادات" description="ملفك الشخصي، أعوامك الدراسية، جدول الحصص، مستويات التقدير، والأمان." />
      <Tabs value={active} onValueChange={(tab) => setParams({ tab }, { replace: true })}>
        <div ref={listWrap}>
          <TabsList aria-label="أقسام الإعدادات">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="px-3.5">
                {t.icon}
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {settings.isPending ? (
          <PageLoader />
        ) : settings.error ? (
          <QueryError error={settings.error} onRetry={() => void settings.refetch()} />
        ) : (
          <>
            <TabsContent value="profile"><ProfileTab settings={settings.data} /></TabsContent>
            <TabsContent value="academic"><AcademicTab /></TabsContent>
            <TabsContent value="schedule"><ScheduleTab settings={settings.data} /></TabsContent>
            <TabsContent value="grading"><GradingTab settings={settings.data} /></TabsContent>
            <TabsContent value="appearance"><AppearanceTab settings={settings.data} /></TabsContent>
            <TabsContent value="security"><SecurityTab /></TabsContent>
            {isAdmin ? (
              <>
                <TabsContent value="users"><UsersTab /></TabsContent>
                <TabsContent value="backups"><BackupsTab /></TabsContent>
                <TabsContent value="audit"><AuditTab /></TabsContent>
              </>
            ) : null}
          </>
        )}
      </Tabs>
    </div>
  );
}
