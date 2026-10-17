import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarClock, ChevronLeft, Download, FileSpreadsheet, FileText, Hand, History, ListChecks, MessagesSquare, Play, Printer, Search, ThumbsDown, ThumbsUp, Users } from 'lucide-react';
import { MAX_PERIODS, weekdayName } from '@shared/constants';
import { CLASS_FLAG_LABELS, classFlagHint } from '@shared/classroom';
import { todayISO } from '@shared/dates';
import type { ClassFlag, ClassOverviewDto, ClassSessionSummaryDto, ClassSummaryDto, ClassSummaryRowDto } from '@shared/dto';
import { normalizeArabic } from '@shared/arabic';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useFmt, useLocalState } from '@/lib/hooks';
import { qk, useAssignments, useSettings } from '@/lib/queries';
import { Alert, Avatar, Badge, ButtonLink, Button, Card, CardHeader, EmptyState, Field, Input, Menu, MenuItem, PageHeader, PageLoader, ProgressBar, QueryError, Segmented, Select, Stat, SubjectChip, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { DateTile, FlagBadges, RateMeter, sessionHref } from './shared';

// ───────────── شريط ملخص حصة مسجّلة ─────────────
function SessionCounts({ s }: { s: Pick<ClassSessionSummaryDto, 'participating' | 'didNotParticipate' | 'positive' | 'negative' | 'notes' | 'participations'> }) {
  const fmt = useFmt();
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge tone="good">شاركوا <b className="tnum">{fmt.num(s.participating, 0)}</b></Badge>
      <Badge tone="warn">لم يشاركوا <b className="tnum">{fmt.num(s.didNotParticipate, 0)}</b></Badge>
      {s.positive ? <Badge tone="info">إيجابي <b className="tnum">{fmt.num(s.positive, 0)}</b></Badge> : null}
      {s.negative ? <Badge tone="bad">غير حسن <b className="tnum">{fmt.num(s.negative, 0)}</b></Badge> : null}
      {s.notes ? <Badge>ملاحظات <b className="tnum">{fmt.num(s.notes, 0)}</b></Badge> : null}
    </span>
  );
}

function RecentSessions({ items, empty }: { items: ClassSessionSummaryDto[]; empty: string }) {
  const fmt = useFmt();
  if (items.length === 0) return <p className="px-5 pb-5 text-center text-[14.5px] text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map((s) => {
        const body = (
          <>
            <DateTile date={s.date} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tnum text-[15.5px] font-semibold text-ink">{s.sectionLabel ?? 'حصة بلا مقرر'}</span>
                {s.subjectName && s.subjectColor ? <SubjectChip name={s.subjectName} color={s.subjectColor} /> : null}
                <span className="text-[13px] text-muted">{weekdayName(new Date(`${s.date}T12:00:00Z`).getUTCDay())}{s.period ? <> · الحصة <span className="tnum">{fmt.num(s.period, 0)}</span></> : null}</span>
              </div>
              {s.lessonTitle ? <div className="mt-0.5 truncate text-[13.5px] text-muted">الدرس: {s.lessonTitle}</div> : null}
              <div className="mt-1.5"><SessionCounts s={s} /></div>
            </div>
          </>
        );
        return (
          <li key={s.key}>
            {s.assignmentId ? (
              <Link to={sessionHref(s.assignmentId, s.date, s.period)} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                {body}
                <ChevronLeft className="mt-3 size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            ) : (
              <div className="flex items-start gap-3 px-5 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ───────────── تبويب «الحصص» ─────────────
function HowItWorks() {
  const steps = [
    { icon: Play, title: 'افتح حصتك', text: 'من حصص اليوم أدناه، أو اختر أي حصة وتاريخ.' },
    { icon: Hand, title: 'سجّل بنقرة', text: '«شارك» عند كل مشاركة، «لم يشارك» لمن لم يشارك، و«إيجابي / غير حسن» مع سبب جاهز.' },
    { icon: ListChecks, title: 'اقرأ التقرير الكامل', text: 'يجمع سجلي ما سُجّل على كل طالب في تقرير يمكنك طباعته أو تنزيله.' },
  ];
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="paper-dots border-b border-line bg-brand-soft/60 px-5 py-4">
        <h2 className="text-[17px] font-semibold text-ink">كيف تعمل إدارة الصف؟</h2>
        <p className="text-[14px] text-muted">بدل الاكتفاء بتسجيل الحضور: وثّق مشاركة كل طالب وسلوكه في كل حصة، لتبقى لك صورة كاملة عنه.</p>
      </div>
      <ol className="grid gap-px bg-line sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-start gap-3 bg-surface p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><s.icon className="size-[18px]" aria-hidden /></span>
            <span>
              <span className="block text-[15px] font-semibold text-ink"><span className="tnum">{i + 1}.</span> {s.title}</span>
              <span className="text-[13.5px] leading-6 text-muted">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function OtherLesson() {
  const fmt = useFmt();
  const navigate = useNavigate();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const settings = useSettings();
  const today = todayISO();
  const [assignmentId, setAssignmentId] = useState('');
  const [date, setDate] = useState(today);
  const [period, setPeriod] = useState('');
  const options = assignments.data ?? [];
  const chosen = assignmentId || options[0]?.id || '';
  const periods = (settings.data?.schedule.periods.map((p) => p.n) ?? Array.from({ length: 8 }, (_, i) => i + 1)).filter((n) => n <= MAX_PERIODS);
  return (
    <Card>
      <CardHeader icon={<History className="size-[18px]" />} title="حصة أخرى" description="حصة تعويضية، أو يوم سابق لم تسجّل فيه" />
      <form
        className="grid gap-3 px-5 pb-5 sm:grid-cols-[minmax(0,1fr)_11rem_8rem_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (chosen && date) void navigate(sessionHref(chosen, date, period ? Number(period) : null));
        }}
      >
        <Field label="الشعبة والمادة">
          {(f) => (
            <Select {...f} value={chosen} onChange={(e) => setAssignmentId(e.target.value)} disabled={options.length === 0}>
              {options.length === 0 ? <option value="">لا مقررات — أضف شعبة ومادة أولًا</option> : null}
              {options.map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
            </Select>
          )}
        </Field>
        <Field label="التاريخ">{(f) => <Input {...f} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="الحصة">
          {(f) => (
            <Select {...f} value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="">غير محددة</option>
              {periods.map((n) => <option key={n} value={n}>{fmt.num(n, 0)}</option>)}
            </Select>
          )}
        </Field>
        <Button type="submit" variant="primary" disabled={!chosen || !date || date > today}>فتح الحصة</Button>
      </form>
    </Card>
  );
}

function LessonsTab() {
  const fmt = useFmt();
  const overview = useQuery({ queryKey: qk.classOverview, queryFn: () => api.get<ClassOverviewDto>('/class/overview') });
  const data = overview.data;
  if (overview.error) return <QueryError error={overview.error} onRetry={() => void overview.refetch()} />;
  if (!data) return <PageLoader />;

  return (
    <div className="space-y-6">
      {data.total === 0 ? <HowItWorks /> : null}

      <Card>
        <CardHeader icon={<CalendarClock className="size-[18px]" />} title={`حصص ${weekdayName(data.weekday)}`} description={fmt.date(data.today, 'long')} />
        {data.slots.length === 0 ? (
          <div className="px-5 pb-6">
            <EmptyState
              icon={<CalendarClock className="size-6" />}
              title="لا حصص مجدولة اليوم"
              description="تظهر هنا حصص جدولك لهذا اليوم. وإن كان لديك حصة غير مجدولة فافتحها من «حصة أخرى» أدناه."
              className="py-8"
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {data.slots.map((s) => {
              const done = s.session?.recordedStudents ?? 0;
              return (
                <li key={s.slotId} className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5', s.state === 'current' && 'bg-brand-soft/50')}>
                  <div className="flex w-[104px] shrink-0 items-center gap-3">
                    <span className={cn('grid size-10 place-items-center rounded-xl text-[17px] font-bold tnum', s.state === 'current' ? 'bg-brand text-brand-fg' : 'bg-surface-3 text-ink-2')}>{fmt.num(s.period, 0)}</span>
                    <span className="text-[12.5px] leading-5 text-muted">{s.start ? <><span className="block tnum">{fmt.time(s.start)}</span><span className="block tnum">{fmt.time(s.end)}</span></> : 'الحصة'}</span>
                  </div>
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[17px] font-semibold text-ink tnum">{s.assignment.sectionLabel}</span>
                      <SubjectChip name={s.assignment.subjectName} color={s.assignment.subjectColor} />
                      {s.state === 'current' ? <Badge tone="brand" dot>الآن</Badge> : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
                      {s.session ? (
                        <>
                          <span className="text-muted">سُجّل لـ <b className="tnum text-ink-2">{fmt.num(done, 0)}</b> من <b className="tnum text-ink-2">{fmt.num(s.studentCount, 0)}</b> طالبًا</span>
                          <SessionCounts s={s.session} />
                        </>
                      ) : (
                        <span className="text-muted">لم يبدأ التسجيل · <span className="tnum">{fmt.num(s.studentCount, 0)}</span> طالبًا</span>
                      )}
                    </div>
                    {s.session && s.studentCount > 0 ? <ProgressBar value={done} max={s.studentCount} tone={done >= s.studentCount ? 'good' : 'brand'} className="mt-2 h-1.5 max-w-xs" label="اكتمال التسجيل" /> : null}
                  </div>
                  <ButtonLink to={sessionHref(s.assignment.id, data.today, s.period)} variant={s.session ? 'secondary' : 'primary'} icon={<Play className="size-4" />}>
                    {s.session ? 'تابع التسجيل' : 'ابدأ التسجيل'}
                  </ButtonLink>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <OtherLesson />

      <Card>
        <CardHeader icon={<History className="size-[18px]" />} title="آخر الحصص المسجّلة" description="اضغط على حصة لمراجعتها أو إكمال تسجيلها" />
        <RecentSessions items={data.recent} empty="لم تُسجَّل أي حصة بعد. ابدأ من حصة اليوم أعلاه." />
      </Card>
    </div>
  );
}

// ───────────── تبويب «ملخص الشعبة» ─────────────
type Scope = 'term' | 'year' | 'all';
type SortKey = 'roll' | 'name' | 'sessions' | 'rate' | 'yes' | 'no' | 'times' | 'positive' | 'negative' | 'notes';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

const sortValue = (r: ClassSummaryRowDto, k: SortKey): number | string | null => {
  switch (k) {
    case 'roll':
      return r.rollNo;
    case 'name':
      return r.fullName;
    case 'sessions':
      return r.counts.sessions;
    case 'rate':
      return r.counts.rate;
    case 'yes':
      return r.counts.participatedSessions;
    case 'no':
      return r.counts.noParticipationSessions;
    case 'times':
      return r.counts.participations;
    case 'positive':
      return r.counts.positive;
    case 'negative':
      return r.counts.negative;
    case 'notes':
      return r.counts.notes;
  }
};

function SortHead({ k, sort, onSort, children, className }: { k: SortKey; sort: Sort; onSort: (k: SortKey) => void; children: string; className?: string }) {
  const on = sort.key === k;
  const Icon = !on ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-3 py-2.5 text-start font-medium', className)}>
      <button type="button" onClick={() => onSort(k)} className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-md hover:text-ink', on && 'text-brand')}>
        {children}
        <Icon className="size-3.5" aria-hidden />
      </button>
    </th>
  );
}

const FLAGS: ClassFlag[] = ['silent', 'low', 'concern'];

function SummaryTab() {
  const fmt = useFmt();
  const { year, term } = useAcademic();
  const { system } = useAuth();
  const assignments = useAssignments(year?.id);
  const [sp, setSp] = useSearchParams();
  const [scope, setScope] = useLocalState<Scope>('sijilli-class-scope', 'term');
  const [q, setQ] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>({ key: 'roll', dir: 'asc' });
  const pdf = system?.capabilities.pdf ?? false;
  const options = assignments.data ?? [];
  const assignmentId = sp.get('assignment') && options.some((o) => o.id === sp.get('assignment')) ? (sp.get('assignment') as string) : (options[0]?.id ?? '');

  const range = useMemo(() => {
    if (scope === 'term' && term) return { from: term.startDate, to: term.endDate };
    if ((scope === 'term' || scope === 'year') && year) return { from: year.startDate, to: year.endDate };
    return {};
  }, [scope, term, year]);
  const params = { assignmentId, ...range };
  const query = useQuery({
    queryKey: qk.classSummary(params),
    queryFn: () => api.get<ClassSummaryDto>('/class/summary', params),
    enabled: !!assignmentId,
    placeholderData: (p) => p,
  });
  const data = query.data;
  const reportQuery = { assignmentId, ...range, classAll: scope === 'all' ? true : undefined };

  const onSort = (key: SortKey) => setSort((cur) => (cur.key === key ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' || key === 'roll' ? 'asc' : 'desc' }));
  const rows = useMemo(() => {
    const needle = normalizeArabic(q);
    const list = (data?.rows ?? []).filter((r) => (!needle || normalizeArabic(r.fullName).includes(needle)) && (!flaggedOnly || r.flags.length > 0));
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const x = sortValue(a, sort.key);
      const y = sortValue(b, sort.key);
      if (x === y) return a.rollNo - b.rollNo;
      if (x === null) return 1; // بلا قيمة (نسبة غير محسوبة) يذهب أخيرًا في الاتجاهين
      if (y === null) return -1;
      return (typeof x === 'string' ? x.localeCompare(y as string, 'ar') : (x as number) - (y as number)) * dir;
    });
  }, [data, q, flaggedOnly, sort]);
  const flagged = data?.rows.filter((r) => r.flags.length > 0).length ?? 0;

  if (assignments.isPending) return <PageLoader />;
  if (options.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-7" />}
        title="لا شعب بعد"
        description="أضف شعبك ومواد التدريس وطلابك أولًا، ثم ابدأ تسجيل المشاركة والسلوك."
        action={<ButtonLink to="/classes" variant="primary" icon={<Users className="size-4" />}>الشعب والطلاب</ButtonLink>}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-56">
          <Select value={assignmentId} onChange={(e) => { const next = new URLSearchParams(sp); next.set('assignment', e.target.value); setSp(next, { replace: true }); }} aria-label="الشعبة والمادة">
            {options.map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
          </Select>
        </div>
        <Segmented<Scope>
          value={scope}
          onChange={setScope}
          label="نطاق الفترة"
          options={[{ value: 'term', label: term ? 'الفصل' : 'العام' }, ...(term ? [{ value: 'year' as const, label: 'العام' }] : []), { value: 'all', label: 'الكل' }]}
        />
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الطالب…" className="ps-10" aria-label="بحث في طلاب الشعبة" />
        </div>
        <Menu align="end" trigger={<Button variant="secondary" icon={<FileText className="size-4" />}>تقرير الشعبة</Button>}>
          {pdf ? <MenuItem icon={<Download className="size-4" />} onSelect={() => { downloadFile('/reports/class-section/pdf', reportQuery, 'class-section.pdf').catch((e) => toast.error(errorMessage(e))); }}>تنزيل PDF</MenuItem> : null}
          <MenuItem icon={<FileSpreadsheet className="size-4" />} onSelect={() => { downloadFile('/reports/class-section/xlsx', reportQuery, 'class-section.xlsx').catch((e) => toast.error(errorMessage(e))); }}>تنزيل Excel</MenuItem>
          <MenuItem icon={<Printer className="size-4" />} onSelect={() => window.open(apiUrl('/reports/class-section/html', reportQuery), '_blank')}>طباعة</MenuItem>
        </Menu>
        <ButtonLink to={sessionHref(assignmentId, todayISO(), null)} variant="primary" icon={<Play className="size-4" />}>تسجيل حصة</ButtonLink>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => void query.refetch()} />
      ) : !data ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat label="حصص مسجّلة" value={<span className="tnum">{fmt.num(data.sessions, 0)}</span>} hint={`${fmt.num(data.rows.length, 0)} طالبًا`} icon={<History className="size-5" />} tone="brand" />
            <Stat label="نسبة المشاركة" value={<span className="tnum">{data.totals.rate === null ? '—' : fmt.pct(data.totals.rate)}</span>} hint="من حصص سُجّلت مشاركتها" icon={<Hand className="size-5" />} tone="good" />
            <Stat label="مرات المشاركة" value={<span className="tnum">{fmt.num(data.totals.participations, 0)}</span>} hint="مجموع ما سُجّل" icon={<MessagesSquare className="size-5" />} tone="info" />
            <Stat label="السلوك" value={<span className="tnum">{fmt.num(data.totals.positive + data.totals.negative + data.totals.notes, 0)}</span>} hint={`${fmt.num(data.totals.positive, 0)} إيجابي · ${fmt.num(data.totals.negative, 0)} غير حسن`} icon={<ThumbsDown className="size-5" />} tone={data.totals.negative ? 'bad' : 'accent'} />
          </div>

          {data.sessions === 0 ? (
            <EmptyState
              icon={<MessagesSquare className="size-7" />}
              title="لا تسجيلات في هذه الفترة"
              description="ابدأ بتسجيل مشاركة الطلاب وسلوكهم في حصة، وسيتجمّع هنا ملخص لكل طالب بنسبة مشاركته وملاحظاته."
              action={<ButtonLink to={sessionHref(assignmentId, todayISO(), null)} variant="primary" icon={<Play className="size-4" />}>تسجيل حصة اليوم</ButtonLink>}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Segmented<'all' | 'flagged'>
                  value={flaggedOnly ? 'flagged' : 'all'}
                  onChange={(v) => setFlaggedOnly(v === 'flagged')}
                  size="sm"
                  label="تصفية الطلاب"
                  options={[{ value: 'all', label: 'كل الطلاب' }, { value: 'flagged', label: <>يحتاجون متابعة <span className="tnum">({fmt.num(flagged, 0)})</span></> }]}
                />
                <span className="text-[13px] text-muted"><span className="tnum">{fmt.num(rows.length, 0)}</span> من <span className="tnum">{fmt.num(data.rows.length, 0)}</span></span>
              </div>

              <Card className="overflow-hidden">
                <div className="scroll-x">
                  <table className="w-full min-w-[1040px] text-[14.5px]">
                    <caption className="sr-only">ملخص مشاركة وسلوك طلاب الشعبة</caption>
                    <thead className="bg-surface-3 text-[13px] text-muted">
                      <tr>
                        <SortHead k="roll" sort={sort} onSort={onSort} className="w-14">م</SortHead>
                        <SortHead k="name" sort={sort} onSort={onSort}>الطالب</SortHead>
                        <SortHead k="sessions" sort={sort} onSort={onSort}>الحصص</SortHead>
                        <SortHead k="rate" sort={sort} onSort={onSort}>نسبة المشاركة</SortHead>
                        <SortHead k="yes" sort={sort} onSort={onSort}>شارك</SortHead>
                        <SortHead k="no" sort={sort} onSort={onSort}>لم يشارك</SortHead>
                        <SortHead k="times" sort={sort} onSort={onSort}>مرات</SortHead>
                        <SortHead k="positive" sort={sort} onSort={onSort}>إيجابي</SortHead>
                        <SortHead k="negative" sort={sort} onSort={onSort}>غير حسن</SortHead>
                        <SortHead k="notes" sort={sort} onSort={onSort}>ملاحظات</SortHead>
                        <th scope="col" className="px-3 py-2.5 text-start font-medium">تنبيه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((r) => (
                        <tr key={r.studentId} className="transition-colors hover:bg-surface-2">
                          <td className="px-3 py-2 text-muted tnum">{fmt.num(r.rollNo, 0)}</td>
                          <td className="px-3 py-2">
                            <Link to={`/students/${r.studentId}?tab=class`} className="flex items-center gap-2.5 font-medium text-ink hover:text-brand" title="التقرير الكامل للطالب">
                              <Avatar name={r.fullName} size={32} tone={r.gender} />
                              <span className="whitespace-nowrap">{r.fullName}</span>
                            </Link>
                          </td>
                          <td className="px-3 py-2 tnum">{fmt.num(r.counts.sessions, 0)}</td>
                          <td className="px-3 py-2"><RateMeter rate={r.counts.rate} /></td>
                          <td className="px-3 py-2 tnum">{fmt.num(r.counts.participatedSessions, 0)}</td>
                          <td className="px-3 py-2 tnum">{fmt.num(r.counts.noParticipationSessions, 0)}</td>
                          <td className="px-3 py-2 tnum">{fmt.num(r.counts.participations, 0)}</td>
                          <td className="px-3 py-2 tnum">{r.counts.positive ? <span className="inline-flex items-center gap-1 text-info"><ThumbsUp className="size-3.5" aria-hidden />{fmt.num(r.counts.positive, 0)}</span> : <span className="text-muted">0</span>}</td>
                          <td className="px-3 py-2 tnum">{r.counts.negative ? <span className="inline-flex items-center gap-1 font-semibold text-bad"><ThumbsDown className="size-3.5" aria-hidden />{fmt.num(r.counts.negative, 0)}</span> : <span className="text-muted">0</span>}</td>
                          <td className="px-3 py-2 tnum">{r.counts.notes ? fmt.num(r.counts.notes, 0) : <span className="text-muted">0</span>}</td>
                          <td className="px-3 py-2"><FlagBadges flags={r.flags} /></td>
                        </tr>
                      ))}
                      {rows.length === 0 ? (
                        <tr><td colSpan={11} className="px-3 py-8 text-center text-muted">لا طلاب مطابقون.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Alert tone="info" title="كيف تُقرأ المؤشرات؟">
                <ul className="mt-1 list-disc space-y-0.5 ps-5">
                  {FLAGS.map((f) => <li key={f}><b>{CLASS_FLAG_LABELS[f]}:</b> {classFlagHint(f)}.</li>)}
                  <li>نسبة المشاركة = الحصص التي شارك فيها ÷ الحصص التي سجّلتَ مشاركتها (شارك أو لم يشارك). المؤشرات مجرد تنبيه للمتابعة لا حكم على الطالب.</li>
                </ul>
              </Alert>

              <Card>
                <CardHeader icon={<History className="size-[18px]" />} title="آخر الحصص في هذه الفترة" />
                <RecentSessions items={data.recent} empty="لا حصص." />
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ───────────── الصفحة ─────────────
export default function ClassPage() {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') === 'summary' ? 'summary' : 'lessons';
  return (
    <>
      <PageHeader title="إدارة الصف" description="سجّل مشاركة كل طالب وسلوكه في الحصة بنقرة، ويجمع سجلي ما سُجّل عليه في تقرير كامل." />
      <Tabs
        value={tab}
        onValueChange={(v) => {
          const next = new URLSearchParams(sp);
          next.set('tab', v);
          setSp(next, { replace: true });
        }}
      >
        <TabsList>
          <TabsTrigger value="lessons"><Play className="size-4" /> الحصص</TabsTrigger>
          <TabsTrigger value="summary"><ListChecks className="size-4" /> ملخص الشعبة</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons"><LessonsTab /></TabsContent>
        <TabsContent value="summary"><SummaryTab /></TabsContent>
      </Tabs>
    </>
  );
}
