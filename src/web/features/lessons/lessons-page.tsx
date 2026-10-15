import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookCopy, CalendarDays, ChevronLeft, ChevronRight, Copy, FileText, List, Library, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { LESSON_STATUS, weekdayName } from '@shared/constants';
import { addDays, endOfWeek, startOfWeek, todayISO, weekdayOf } from '@shared/dates';
import type { LessonSummaryDto, LessonsPage, SlotDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, withQuery } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useDebounced, useFmt, useLocalState } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments } from '@/lib/queries';
import { Badge, Button, ButtonLink, Card, EmptyState, IconButton, Input, PageHeader, PageLoader, QueryError, Segmented, Select, SubjectChip, useConfirm } from '@/components/ui';
import { LessonCopyDialog } from './copy-dialog';

type View = 'week' | 'list' | 'templates';

const statusTone = { draft: 'warn', ready: 'info', delivered: 'good' } as const;

function LessonCard({ l, compact, onCopy }: { l: LessonSummaryDto; compact?: boolean; onCopy: (l: LessonSummaryDto) => void }) {
  const fmt = useFmt();
  return (
    <div className={cn(`subj-${l.subjectColor} group relative rounded-xl border border-line bg-surface p-3 shadow-card transition-shadow hover:shadow-pop`)}>
      <span className="absolute inset-y-2 end-0 w-1 rounded-s-full bg-[var(--c)]" aria-hidden />
      <div className="mb-1.5 flex items-center gap-2 text-[13px]">
        {l.period ? <span className="grid size-6 place-items-center rounded-md bg-surface-3 text-[12.5px] font-bold tnum text-ink-2" title="الحصة">{fmt.num(l.period)}</span> : null}
        <span className="font-semibold tnum text-ink">{l.sectionLabel}</span>
        <span className="text-[var(--c)]">{l.subjectName}</span>
        <Badge tone={statusTone[l.status]} dot className="ms-auto px-2 text-[12px]">{LESSON_STATUS.labels[l.status]}</Badge>
      </div>
      <Link to={`/lessons/${l.id}`} className="line-clamp-2 text-[15px] font-medium leading-6 text-ink after:absolute after:inset-0 after:content-[''] hover:text-brand">{l.title}</Link>
      {!compact && l.unitName ? <div className="mt-0.5 truncate text-[12.5px] text-muted">{l.unitName}</div> : null}
      <button onClick={() => onCopy(l)} className="absolute bottom-2 start-2 z-10 grid size-7 place-items-center rounded-md text-muted opacity-0 transition hover:bg-surface-3 hover:text-ink focus:opacity-100 group-hover:opacity-100" aria-label="نسخ التحضير">
        <Copy className="size-3.5" />
      </button>
    </div>
  );
}

function WeekView({ weekStart, assignmentId, onCopy }: { weekStart: string; assignmentId: string; onCopy: (l: LessonSummaryDto) => void }) {
  const fmt = useFmt();
  const { year } = useAcademic();
  const { settings } = useAuth();
  const weekEnd = endOfWeek(weekStart);
  const today = todayISO();
  const lessonsQ = useQuery({
    queryKey: qk.lessons({ from: weekStart, to: weekEnd, assignmentId }),
    queryFn: () => api.get<LessonsPage>('/lessons', { from: weekStart, to: weekEnd, assignmentId: assignmentId || undefined, limit: 200 }),
  });
  const slotsQ = useQuery({ queryKey: qk.timetable(year?.id), queryFn: () => api.get<SlotDto[]>('/timetable', { yearId: year?.id }), enabled: !!year });

  if (lessonsQ.isPending) return <PageLoader />;
  if (lessonsQ.error) return <QueryError error={lessonsQ.error} onRetry={() => void lessonsQ.refetch()} />;
  const lessons = lessonsQ.data?.items ?? [];
  const slots = (slotsQ.data ?? []).filter((s) => !assignmentId || s.assignment.id === assignmentId);
  const work = new Set(settings?.schedule.workDays ?? [0, 1, 2, 3, 4]);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter((d) => work.has(weekdayOf(d)) || lessons.some((l) => l.date === d));

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
      {days.map((d) => {
        const dayLessons = lessons.filter((l) => l.date === d).sort((a, b) => (a.period ?? 99) - (b.period ?? 99));
        const ghosts = slots.filter((s) => s.weekday === weekdayOf(d) && !dayLessons.some((l) => l.assignmentId === s.assignment.id && (l.period === s.period || l.period === null)));
        const items = [
          ...dayLessons.map((l) => ({ key: l.id, period: l.period ?? 99, node: <LessonCard key={l.id} l={l} onCopy={onCopy} /> })),
          ...ghosts.map((s) => ({
            key: s.id,
            period: s.period,
            node: (
              <Link
                key={s.id}
                to={`/lessons/new?assignment=${s.assignment.id}&date=${d}&period=${s.period}`}
                className={cn(`subj-${s.assignment.subjectColor} flex items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-3 text-[13.5px] text-muted transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand`)}
              >
                <span className="grid size-6 place-items-center rounded-md bg-surface-3 text-[12.5px] font-bold tnum text-ink-2">{fmt.num(s.period)}</span>
                <span className="min-w-0 flex-1 truncate"><b className="tnum text-ink-2">{s.assignment.sectionLabel}</b> {s.assignment.subjectName}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium"><Plus className="size-3.5" /> تحضير</span>
              </Link>
            ),
          })),
        ].sort((a, b) => a.period - b.period);
        const isToday = d === today;
        return (
          <section key={d} className={cn('flex min-h-40 min-w-0 flex-col rounded-card border bg-surface-2/50 p-2.5', isToday ? 'border-brand/50 ring-1 ring-brand/30' : 'border-line')} aria-label={weekdayName(weekdayOf(d))}>
            <header className="mb-2 flex items-center justify-between px-1.5">
              <div>
                <div className={cn('text-[15px] font-semibold', isToday ? 'text-brand' : 'text-ink')}>{weekdayName(weekdayOf(d))}</div>
                <div className="text-[12.5px] text-muted tnum">{fmt.date(d, 'medium')}</div>
              </div>
              {isToday ? <Badge tone="brand">اليوم</Badge> : null}
            </header>
            <div className="flex flex-1 flex-col gap-2">
              {items.length ? items.map((i) => i.node) : <p className="px-2 py-6 text-center text-[13px] text-muted">لا تحضير</p>}
            </div>
            <Link to={`/lessons/new?date=${d}${assignmentId ? `&assignment=${assignmentId}` : ''}`} className="mt-2 inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-[13px] text-muted hover:bg-surface-3 hover:text-ink"><Plus className="size-4" /> إضافة</Link>
          </section>
        );
      })}
    </div>
  );
}

function ListView({ assignmentId, templates, onCopy }: { assignmentId: string; templates: boolean; onCopy: (l: LessonSummaryDto) => void }) {
  const fmt = useFmt();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { term } = useAcademic();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState(term?.startDate ?? '');
  const [to, setTo] = useState(term?.endDate ?? '');
  const [limit, setLimit] = useState(100);
  const dq = useDebounced(q, 250);
  const params = { q: dq || undefined, status: status || undefined, assignmentId: assignmentId || undefined, templates: templates || undefined, ...(templates ? {} : { from: from || undefined, to: to || undefined }), limit };
  const query = useQuery({ queryKey: qk.lessons(params), queryFn: () => api.get<LessonsPage>(withQuery('/lessons', params)), placeholderData: (p) => p });
  const remove = useAppMutation((id: string) => api.del(`/lessons/${id}`), { invalidate: [['lessons'], ['dashboard']], success: 'حُذف التحضير' });
  const data = query.data;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في عناوين الدروس والوحدات…" className="ps-10" aria-label="بحث في التحضير" />
        </div>
        {!templates ? (
          <>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36" aria-label="الحالة">
              <option value="">كل الحالات</option>
              {LESSON_STATUS.items.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" aria-label="من تاريخ" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" aria-label="إلى تاريخ" />
          </>
        ) : null}
      </div>
      {query.error ? <QueryError error={query.error} onRetry={() => void query.refetch()} /> : !data ? <PageLoader /> : data.items.length === 0 ? (
        <EmptyState
          icon={templates ? <Library className="size-7" /> : <FileText className="size-7" />}
          title={templates ? 'مكتبة القوالب فارغة' : 'لا تحضير مطابق'}
          description={templates ? 'حوّل أي تحضير ناجح إلى قالب من محرر الدرس (زر «حفظ كقالب»)، فتعيد استخدامه لأي شعبة في دقيقة.' : 'غيّر الفترة أو التصفية، أو ابدأ تحضيرًا جديدًا.'}
          action={!templates ? <ButtonLink to="/lessons/new" variant="primary" icon={<Plus className="size-4" />}>تحضير جديد</ButtonLink> : undefined}
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="scroll-x">
              <table className="w-full min-w-[720px] text-[15px]">
                <thead className="bg-surface-3 text-[13px] text-muted">
                  <tr>
                    {!templates ? <th className="px-4 py-2.5 text-start font-medium">التاريخ</th> : null}
                    <th className="px-4 py-2.5 text-start font-medium">الشعبة / المادة</th>
                    <th className="px-4 py-2.5 text-start font-medium">عنوان الدرس</th>
                    <th className="px-4 py-2.5 text-start font-medium">الوحدة</th>
                    {!templates ? <th className="px-4 py-2.5 text-start font-medium">الحالة</th> : null}
                    <th className="w-24 px-2 py-2.5"><span className="sr-only">إجراءات</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((l) => (
                    <tr key={l.id} onClick={() => navigate(`/lessons/${l.id}`)} className="cursor-pointer hover:bg-surface-2">
                      {!templates ? <td className="whitespace-nowrap px-4 py-2.5 text-ink-2"><div className="tnum">{fmt.date(l.date, 'medium')}</div><div className="text-[12.5px] text-muted">{weekdayName(weekdayOf(l.date))}{l.period ? ` · الحصة ${fmt.num(l.period)}` : ''}</div></td> : null}
                      <td className="px-4 py-2.5"><div className="flex flex-wrap items-center gap-2"><b className="tnum">{l.sectionLabel}</b><SubjectChip name={l.subjectName} color={l.subjectColor} /></div></td>
                      <td className="px-4 py-2.5 font-medium text-ink">{l.title}</td>
                      <td className="px-4 py-2.5 text-muted">{l.unitName ?? '—'}</td>
                      {!templates ? <td className="px-4 py-2.5"><Badge tone={statusTone[l.status]} dot>{LESSON_STATUS.labels[l.status]}</Badge></td> : null}
                      <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <IconButton label="نسخ" size="iconSm" onClick={() => onCopy(l)}><Copy className="size-4" /></IconButton>
                          <IconButton label="حذف" size="iconSm" className="hover:text-bad" onClick={async () => { if (await confirm({ title: `حذف «${l.title}»؟`, description: 'لا يمكن التراجع عن الحذف.', confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(l.id); }}><Trash2 className="size-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="mt-3 flex items-center justify-between text-[14px] text-muted">
            <span>{fmt.num(data.items.length)} من {fmt.num(data.total)}</span>
            {data.items.length < data.total ? <Button variant="secondary" size="sm" onClick={() => setLimit(limit + 100)}>عرض المزيد</Button> : null}
          </div>
        </>
      )}
    </div>
  );
}

export default function LessonsPage() {
  const fmt = useFmt();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const [view, setView] = useLocalState<View>('sijilli-lessons-view', 'week');
  const [anchor, setAnchor] = useState(todayISO());
  const [assignmentId, setAssignmentId] = useState('');
  const [copying, setCopying] = useState<LessonSummaryDto | null>(null);
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekEnd = endOfWeek(weekStart);

  const printWeek = () => window.open(apiUrl('/reports/lesson-plan/html', { from: weekStart, to: weekEnd, assignmentId: assignmentId || undefined }), '_blank');

  return (
    <>
      <PageHeader
        title="التحضير الإلكتروني"
        description="خطّط دروسك، أعد استخدام ما حضّرته، واطبع دفتر التحضير جاهزًا."
        actions={
          <>
            {view === 'week' ? <Button variant="secondary" icon={<Printer className="size-4" />} onClick={printWeek}>طباعة الأسبوع</Button> : null}
            <ButtonLink to="/lessons/new" variant="primary" icon={<Plus className="size-4" />}>تحضير جديد</ButtonLink>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented<View>
          value={view}
          onChange={setView}
          label="طريقة العرض"
          options={[
            { value: 'week', label: 'أسبوعي', icon: <CalendarDays className="size-4" /> },
            { value: 'list', label: 'قائمة', icon: <List className="size-4" /> },
            { value: 'templates', label: 'القوالب', icon: <BookCopy className="size-4" /> },
          ]}
        />
        <Select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="w-52" aria-label="تصفية بالشعبة والمادة">
          <option value="">كل الشعب والمواد</option>
          {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
        </Select>
        {view === 'week' ? (
          <div className="ms-auto flex items-center gap-1.5">
            <IconButton label="الأسبوع السابق" variant="secondary" onClick={() => setAnchor(addDays(weekStart, -7))}><ChevronRight className="size-5" /></IconButton>
            <Button variant="secondary" onClick={() => setAnchor(todayISO())}>هذا الأسبوع</Button>
            <IconButton label="الأسبوع التالي" variant="secondary" onClick={() => setAnchor(addDays(weekStart, 7))}><ChevronLeft className="size-5" /></IconButton>
            <span className="ms-2 hidden text-[14px] text-muted sm:inline tnum">{fmt.date(weekStart, 'medium')} – {fmt.date(addDays(weekStart, 4), 'medium')}</span>
          </div>
        ) : null}
      </div>

      {view === 'week' ? <WeekView weekStart={weekStart} assignmentId={assignmentId} onCopy={setCopying} /> : <ListView key={view} assignmentId={assignmentId} templates={view === 'templates'} onCopy={setCopying} />}
      <LessonCopyDialog lesson={copying} onClose={() => setCopying(null)} />
    </>
  );
}

