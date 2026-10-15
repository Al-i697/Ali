import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileBarChart,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Plus,
  Rocket,
  Target,
  Users,
} from 'lucide-react';
import { nowInZone } from '@shared/dates';
import { weekdayName } from '@shared/constants';
import type { DashboardDto, DashboardTodaySlot, LessonSummaryDto, TaskDto } from '@shared/dto';
import { useUser } from '@/context/auth';
import { api, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { qk } from '@/lib/queries';
import { cn } from '@/lib/cn';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  ProgressBar,
  QueryError,
  Skeleton,
  Stat,
  SubjectChip,
} from '@/components/ui';

function greeting(time: string): string {
  const h = Number(time.slice(0, 2));
  return h < 12 ? 'صباح الخير' : 'مساء الخير';
}

// ───────────── قائمة الإعداد للمستخدم الجديد ─────────────
function Onboarding({ setup }: { setup: DashboardDto['setup'] }) {
  const steps = [
    { done: setup.hasYear, title: 'أنشئ العام الدراسي', hint: 'السنة والفصلان — تُنشأ الفصول تلقائيًا', to: '/settings?tab=academic', cta: 'إعداد العام' },
    { done: setup.hasSection, title: 'أضف شعبك ومواد التدريس', hint: 'مثل 10/3 للعلوم', to: '/classes', cta: 'إضافة شعبة' },
    { done: setup.hasStudents, title: 'أضف الطلاب', hint: 'ألصق الأسماء أو استورد ملف Excel', to: '/classes', cta: 'إضافة طلاب' },
    { done: setup.hasTimetable, title: 'ابنِ جدولك الأسبوعي', hint: 'ليعرض لك حصص اليوم تلقائيًا', to: '/timetable', cta: 'الجدول' },
    { done: setup.hasLesson, title: 'حضّر أول درس', hint: 'يمكنك نسخه لاحقًا لأي شعبة', to: '/lessons/new', cta: 'تحضير جديد' },
    { done: setup.hasAssessment, title: 'أنشئ أول تقويم وارصد الدرجات', hint: 'شبكة سريعة بحفظ تلقائي', to: '/assessments', cta: 'التقويم' },
  ];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  const next = steps.find((s) => !s.done)!;
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="paper-dots flex flex-wrap items-center justify-between gap-4 border-b border-line bg-brand-soft/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand text-brand-fg"><Rocket className="size-5" /></span>
          <div>
            <h2 className="text-[17px] font-semibold text-ink">ابدأ مع سجلي في دقائق</h2>
            <p className="text-[14px] text-muted">أكملت {done} من {steps.length} خطوات</p>
          </div>
        </div>
        <ButtonLink to={next.to} variant="primary" icon={<ArrowLeft className="size-4" />}>{next.cta}</ButtonLink>
      </div>
      <ProgressBar value={done} max={steps.length} className="h-1 rounded-none" label="تقدّم الإعداد" />
      <ol className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="bg-surface">
            <Link to={s.to} className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-2">
              <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold', s.done ? 'bg-good text-brand-fg' : 'bg-surface-3 text-muted')}>
                {s.done ? <Check className="size-4" /> : i + 1}
              </span>
              <span>
                <span className={cn('block text-[15px] font-medium', s.done ? 'text-muted line-through' : 'text-ink')}>{s.title}</span>
                <span className="text-[13px] text-muted">{s.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ───────────── حصص اليوم ─────────────
function TodaySlots({ data }: { data: DashboardDto }) {
  const fmt = useFmt();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const copy = useMutation({
    mutationFn: (slot: DashboardTodaySlot) =>
      api.post<LessonSummaryDto[]>(`/lessons/${slot.lastLesson!.id}/copy`, {
        targets: [{ assignmentId: slot.assignment.id, date: data.today, period: slot.period }],
      }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      toast.success('نُسخ التحضير إلى اليوم — راجعه وعدّله');
      void navigate(`/lessons/${res[0]!.id}`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const { planned, slots } = data.lessonsThisWeek;
  return (
    <Card>
      <CardHeader
        icon={<CalendarClock className="size-[18px]" />}
        title={`حصص ${weekdayName(data.weekday)}`}
        description={fmt.date(data.today, 'long')}
        action={
          slots > 0 ? (
            <div className="hidden text-end sm:block">
              <div className="text-[12.5px] text-muted">تحضير هذا الأسبوع</div>
              <div className="flex items-center gap-2">
                <ProgressBar value={planned} max={slots} tone={planned === slots ? 'good' : 'brand'} className="w-24" label="تحضير الأسبوع" />
                <span className="tnum text-[13px] font-semibold text-ink">{fmt.num(planned)}/{fmt.num(slots)}</span>
              </div>
            </div>
          ) : undefined
        }
      />
      {data.todaySlots.length === 0 ? (
        <div className="px-5 pb-6">
          <EmptyState
            icon={<CalendarClock className="size-6" />}
            title={data.setup.hasTimetable ? 'لا حصص مجدولة اليوم' : 'لم يُبنَ جدولك الأسبوعي بعد'}
            description={data.setup.hasTimetable ? 'استمتع بيومك، أو استغلّه في التحضير والتصحيح.' : 'أضف حصصك مرة واحدة وسيعرض لك سجلي حصص كل يوم مع حالة تحضيرها.'}
            action={!data.setup.hasTimetable ? <ButtonLink to="/timetable" variant="primary" icon={<Plus className="size-4" />}>بناء الجدول</ButtonLink> : undefined}
            className="py-8"
          />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {data.todaySlots.map((s) => (
            <li key={s.slotId} className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5', s.state === 'current' && 'bg-brand-soft/50')}>
              <div className="flex w-[104px] shrink-0 items-center gap-3">
                <span className={cn('grid size-10 place-items-center rounded-xl text-[17px] font-bold tnum', s.state === 'current' ? 'bg-brand text-brand-fg' : 'bg-surface-3 text-ink-2')}>{fmt.num(s.period)}</span>
                <span className="text-[12.5px] leading-5 text-muted">
                  {s.start ? <><span className="block tnum">{fmt.time(s.start)}</span><span className="block tnum">{fmt.time(s.end)}</span></> : 'الحصة'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[17px] font-semibold text-ink tnum">{s.assignment.sectionLabel}</span>
                  <SubjectChip name={s.assignment.subjectName} color={s.assignment.subjectColor} />
                  {s.state === 'current' ? <Badge tone="brand" dot>الآن</Badge> : null}
                </div>
                <div className="mt-1 text-[14px]">
                  {s.lesson ? (
                    <Link to={`/lessons/${s.lesson.id}`} className="inline-flex items-center gap-1.5 text-good hover:underline">
                      <CheckCircle2 className="size-4" /> {s.lesson.title}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-warn"><AlertTriangle className="size-4" /> لم يُحضَّر هذا الدرس بعد</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {s.lesson ? (
                  <ButtonLink to={`/lessons/${s.lesson.id}`} variant="secondary" size="sm" icon={<BookOpenCheck className="size-4" />}>فتح التحضير</ButtonLink>
                ) : (
                  <>
                    <ButtonLink to={`/lessons/new?assignment=${s.assignment.id}&date=${data.today}&period=${s.period}`} variant="primary" size="sm" icon={<Plus className="size-4" />}>تحضير</ButtonLink>
                    {s.lastLesson ? (
                      <Button variant="soft" size="sm" icon={<Copy className="size-4" />} loading={copy.isPending && copy.variables?.slotId === s.slotId} onClick={() => copy.mutate(s)} title={`نسخ: ${s.lastLesson.title}`}>
                        نسخ الأخير
                      </Button>
                    ) : null}
                  </>
                )}
                <ButtonLink to={`/assessments/${s.assignment.id}`} variant="ghost" size="sm" icon={<ClipboardList className="size-4" />}>الدرجات</ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ───────────── المهام ─────────────
/** أنشطة المختبر القادمة + تنبيه بما فات موعده دون تسجيل. تُخفى عمّن لم يستخدم السجل بعد كي لا تزدحم لوحته ببطاقة فارغة */
function LabCard({ data }: { data: DashboardDto }) {
  const fmt = useFmt();
  const { upcoming, overdue, total } = data.lab;
  if (total === 0) return null;
  return (
    <Card>
      <CardHeader
        icon={<FlaskConical className="size-[18px]" />}
        title="أنشطة المختبر"
        description="الأنشطة المخطَّطة من اليوم فصاعدًا"
        action={<ButtonLink to="/lab" variant="soft" size="sm">السجل</ButtonLink>}
      />
      <div className="px-5 pb-4">
        {overdue > 0 ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bad/30 bg-bad-soft px-3.5 py-2.5 text-[14px] text-bad" role="status">
            <span><b className="tnum">{fmt.num(overdue, 0)}</b> {overdue === 1 ? 'نشاط مضى موعده' : 'أنشطة مضى موعدها'} ولم يُسجَّل تنفيذه</span>
            <Link to="/lab?view=overdue" className="font-semibold underline underline-offset-2">تسجيل الآن</Link>
          </div>
        ) : null}
        {upcoming.length === 0 ? (
          <p className="py-3 text-center text-[14.5px] text-muted">لا أنشطة مخطَّطة قادمة.</p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map((a) => (
              <li key={a.id}>
                <Link to={`/lab?open=${a.id}`} className="flex items-center gap-3 rounded-lg hover:bg-surface-2">
                  <div className="grid w-12 shrink-0 place-items-center rounded-lg bg-info-soft py-1 text-info">
                    <span className="text-[17px] font-bold leading-5 tnum">{fmt.num(Number(a.date.slice(8, 10)), 0)}</span>
                    <span className="text-[11px] leading-4">{fmt.date(a.date, 'medium').split(' ')[1]}</span>
                  </div>
                  <div className="min-w-0 text-[14.5px]">
                    <div className="truncate font-medium text-ink">{a.title}</div>
                    <div className="truncate text-[12.5px] text-muted">
                      {a.sectionLabel ? <><span className="tnum">{a.sectionLabel}</span> — {a.subjectName}</> : 'نشاط عام'}
                      {a.period ? <> · الحصة <span className="tnum">{fmt.num(a.period, 0)}</span></> : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function TasksCard({ data }: { data: DashboardDto }) {
  const qc = useQueryClient();
  const fmt = useFmt();
  const toggle = useMutation({
    mutationFn: (t: TaskDto) => api.patch(`/tasks/${t.id}`, { status: t.status === 'done' ? 'open' : 'done' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      void qc.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const groups: { title: string; tone: 'bad' | 'warn' | 'info'; items: TaskDto[] }[] = [
    { title: 'متأخرة', tone: 'bad', items: data.tasks.overdue },
    { title: 'اليوم', tone: 'warn', items: data.tasks.today },
    { title: 'خلال 7 أيام', tone: 'info', items: data.tasks.upcoming },
  ];
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <Card>
      <CardHeader icon={<Target className="size-[18px]" />} title="المهام" action={<ButtonLink to="/tasks" variant="ghost" size="sm">الكل</ButtonLink>} />
      <div className="px-5 pb-4">
        {total === 0 ? (
          <p className="py-4 text-center text-[14.5px] text-muted">لا مهام مفتوحة قريبة. أحسنت!</p>
        ) : (
          <div className="space-y-3">
            {groups.filter((g) => g.items.length).map((g) => (
              <div key={g.title}>
                <div className="mb-1 flex items-center gap-2"><Badge tone={g.tone}>{g.title}</Badge></div>
                <ul className="space-y-1">
                  {g.items.map((t) => (
                    <li key={t.id} className="flex items-start gap-2.5 rounded-lg px-1 py-1 hover:bg-surface-2">
                      <button
                        onClick={() => toggle.mutate(t)}
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-line-strong text-transparent transition-colors hover:border-brand hover:text-brand"
                        aria-label={`إنجاز: ${t.title}`}
                      >
                        <Check className="size-3.5" />
                      </button>
                      <div className="min-w-0 flex-1 text-[14.5px] leading-6">
                        <span className="text-ink">{t.title}</span>
                        <span className="block text-[12.5px] text-muted">
                          {t.dueDate ? fmt.date(t.dueDate, 'medium') : ''}{t.dueTime ? ` · ${fmt.time(t.dueTime)}` : ''}{t.assignmentLabel ? ` · ${t.assignmentLabel}` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ───────────── الصفحة ─────────────
export default function DashboardPage() {
  const user = useUser();
  const fmt = useFmt();
  const { data, error, isPending, refetch } = useQuery({ queryKey: qk.dashboard, queryFn: () => api.get<DashboardDto>('/dashboard') });
  const now = nowInZone();
  const first = user.fullName.split(' ')[0] ?? user.fullName;

  if (isPending)
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  if (error || !data) return <QueryError error={error} onRetry={() => void refetch()} />;

  const incompleteCount = data.incomplete.reduce((n, i) => n + i.missing, 0);

  return (
    <div>
      <PageHeader
        title={`${greeting(now.time)}، أ. ${first}`}
        description={
          <>
            {fmt.date(data.today, 'full')}
            {data.term && data.weekNumber ? <> · الأسبوع <b className="tnum text-ink-2">{fmt.num(data.weekNumber)}</b> من {data.term.name}</> : null}
          </>
        }
        actions={
          <>
            <ButtonLink to="/lessons/new" variant="primary" icon={<Plus className="size-4" />}>تحضير جديد</ButtonLink>
            <ButtonLink to="/assessments" variant="secondary" icon={<GraduationCap className="size-4" />}>رصد الدرجات</ButtonLink>
            <ButtonLink to="/reports" variant="secondary" icon={<FileBarChart className="size-4" />}>التقارير</ButtonLink>
          </>
        }
      />

      <Onboarding setup={data.setup} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="الطلاب" value={fmt.num(data.counts.students)} hint={`في ${fmt.num(data.counts.sections)} شعبة`} icon={<Users className="size-5" />} tone="info" />
        <Stat label="المقررات" value={fmt.num(data.counts.assignments)} hint="شعبة × مادة" icon={<BookOpenCheck className="size-5" />} tone="brand" />
        <Stat
          label="تحضير هذا الأسبوع"
          value={data.lessonsThisWeek.slots ? `${fmt.num(data.lessonsThisWeek.planned)}/${fmt.num(data.lessonsThisWeek.slots)}` : '—'}
          hint={data.lessonsThisWeek.slots ? (data.lessonsThisWeek.planned === data.lessonsThisWeek.slots ? 'اكتمل تحضير الأسبوع' : 'حصص تنتظر التحضير') : 'أضف حصصك للجدول'}
          icon={<CalendarClock className="size-5" />}
          tone={data.lessonsThisWeek.slots && data.lessonsThisWeek.planned < data.lessonsThisWeek.slots ? 'warn' : 'good'}
        />
        <Stat
          label="درجات لم تُرصد"
          value={fmt.num(incompleteCount)}
          hint={incompleteCount ? `في ${fmt.num(data.incomplete.length)} تقويم` : 'كل السجلات مكتملة'}
          icon={<ClipboardList className="size-5" />}
          tone={incompleteCount ? 'warn' : 'good'}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <TodaySlots data={data} />

          <Card>
            <CardHeader icon={<ClipboardList className="size-[18px]" />} title="سجلات غير مكتملة" description="تقويمات مضى موعدها ولم تُرصد درجات كل الطلاب" />
            <div className="px-5 pb-4">
              {data.incomplete.length === 0 ? (
                <p className="py-4 text-center text-[14.5px] text-muted">لا توجد سجلات ناقصة. 👌</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.incomplete.map((i) => (
                    <li key={i.assessmentId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="font-medium text-ink">{i.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                          <span className="tnum font-medium text-ink-2">{i.assignment.sectionLabel}</span>
                          <SubjectChip name={i.assignment.subjectName} color={i.assignment.subjectColor} />
                          {i.date ? <span>{fmt.date(i.date, 'medium')}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32">
                          <div className="mb-1 flex justify-between text-[12.5px] text-muted"><span>مرصود</span><b className="tnum text-ink-2">{fmt.num(i.total - i.missing)}/{fmt.num(i.total)}</b></div>
                          <ProgressBar value={i.total - i.missing} max={i.total} tone={i.missing > i.total / 2 ? 'bad' : 'warn'} label="نسبة الإنجاز" />
                        </div>
                        <ButtonLink to={`/assessments/${i.assignment.id}`} variant="soft" size="sm">إكمال الرصد</ButtonLink>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <LabCard data={data} />
        </div>

        <div className="space-y-6">
          <TasksCard data={data} />

          <Card>
            <CardHeader icon={<ClipboardList className="size-[18px]" />} title="تقويمات قادمة" description="خلال 14 يومًا" />
            <div className="px-5 pb-4">
              {data.upcomingAssessments.length === 0 ? (
                <p className="py-3 text-center text-[14.5px] text-muted">لا تقويمات مجدولة قريبًا.</p>
              ) : (
                <ul className="space-y-2.5">
                  {data.upcomingAssessments.map((a) => (
                    <li key={a.assessmentId} className="flex items-center gap-3">
                      <div className="grid w-12 shrink-0 place-items-center rounded-lg bg-warn-soft py-1 text-warn">
                        <span className="text-[17px] font-bold leading-5 tnum">{fmt.date(a.date, 'short').split('/')[0]}</span>
                        <span className="text-[11px] leading-4">{fmt.date(a.date, 'medium').split(' ')[1]}</span>
                      </div>
                      <div className="min-w-0 text-[14.5px]">
                        <div className="truncate font-medium text-ink">{a.title}</div>
                        <div className="text-[12.5px] text-muted">{a.assignment.subjectName} — <span className="tnum">{a.assignment.sectionLabel}</span></div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={<AlertTriangle className="size-[18px]" />}
              title="طلاب يحتاجون متابعة"
              description="أقل من حد الدعم في هذا الفصل"
              action={
                <ButtonLink to="/support" variant="soft" size="sm" icon={<HeartHandshake className="size-4" />}>
                  الخطط ({fmt.num(data.support.open, 0)}){data.support.due ? <span className="text-bad"> · {fmt.num(data.support.due, 0)} للمراجعة</span> : null}
                </ButtonLink>
              }
            />
            <div className="px-5 pb-4">
              {data.attention.length === 0 ? (
                <p className="py-3 text-center text-[14.5px] text-muted">لا طلاب دون الحد حاليًا.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.attention.map((a) => (
                    <li key={`${a.assignmentId}-${a.studentId}`} className="flex items-center gap-2">
                      <Link to={`/students/${a.studentId}`} className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2.5 hover:text-brand">
                        <div className="min-w-0">
                          <div className="truncate text-[14.5px] font-medium">{a.fullName}</div>
                          <div className="text-[12.5px] text-muted">{a.subjectName} — <span className="tnum">{a.sectionLabel}</span></div>
                        </div>
                        <Badge tone="bad" className="tnum">{fmt.pct(a.percent)}</Badge>
                      </Link>
                      {a.hasPlan ? (
                        <Link to={`/support?assignment=${a.assignmentId}`} className="shrink-0 rounded-lg bg-good-soft px-2 py-1 text-[12.5px] font-medium text-good hover:underline" aria-label={`لـ${a.fullName} خطة علاجية مفتوحة`}>لها خطة</Link>
                      ) : (
                        <Link to={`/support?new=1&kind=remedial&student=${a.studentId}&assignment=${a.assignmentId}`} className="shrink-0 rounded-lg border border-line px-2 py-1 text-[12.5px] font-medium text-ink-2 hover:border-brand hover:text-brand" aria-label={`إنشاء خطة علاجية لـ${a.fullName}`}>+ خطة</Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
