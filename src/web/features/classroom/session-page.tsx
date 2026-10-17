import { memo, useCallback, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCheck, CircleSlash, Eraser, FileBarChart, Hand, MessageSquarePlus, Minus, MoreHorizontal, PictureInPicture2, Search, ThumbsDown, ThumbsUp, UserRound, Users } from 'lucide-react';
import { MAX_PERIODS, weekdayName } from '@shared/constants';
import { isISODate, todayISO, weekdayOf } from '@shared/dates';
import { normalizeArabic } from '@shared/arabic';
import type { ClassRecordDto, ClassSessionStudentDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { useAssignments, useSettings } from '@/lib/queries';
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState, Field, IconButton, Input, Menu, MenuItem, MenuSeparator, PageHeader, PageLoader, ProgressBar, QueryError, Segmented, Select, Stat, SubjectChip, useConfirm } from '@/components/ui';
import { RecordDialog, type RecordTarget } from './record-dialog';
import { ActionButton, HistoryLine, ParticipationBadge, RecordChip } from './shared';
import { useFloatingClass } from './float/state';
import { useClassSession } from './use-session';

type Filter = 'all' | 'unrecorded' | 'participated' | 'silent' | 'behavior';

const periodOf = (v: string | null): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= MAX_PERIODS ? n : null;
};

// ───────────── صف الطالب ─────────────
type RowProps = {
  s: ClassSessionStudentDto;
  onSet: (studentId: string, count: number | null) => void;
  onOpen: (s: ClassSessionStudentDto, kind: RecordTarget['kind'], record?: ClassRecordDto) => void;
  onRemove: (r: ClassRecordDto) => void;
};

/** يُعاد رسمه عند تغيّر صفّه وحده (بقية الصفوف تحتفظ بهويتها)، فيبقى التسجيل سريعًا في الشعب الكبيرة */
const StudentRow = memo(function StudentRow({ s, onSet, onOpen, onRemove }: RowProps) {
  const fmt = useFmt();
  const navigate = useNavigate();
  const p = s.participation;
  return (
    <li className="rounded-card border border-line bg-surface p-3 shadow-card" data-student={s.studentId}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
        <div className="flex min-w-0 flex-1 basis-52 items-center gap-3">
          <span className="w-6 shrink-0 text-center text-[13px] text-muted tnum">{fmt.num(s.rollNo, 0)}</span>
          <Avatar name={s.fullName} size={38} tone={s.gender} />
          <div className="min-w-0">
            <Link to={`/students/${s.studentId}?tab=class`} className="block truncate text-[15.5px] font-semibold text-ink hover:text-brand" title="التقرير الكامل للطالب">
              {s.fullName}
            </Link>
            <HistoryLine before={s.before} />
          </div>
        </div>

        <div role="group" aria-label={`تسجيل ${s.fullName}`} className="flex flex-wrap items-center gap-1.5">
          <ActionButton tone="good" active={p !== null && p > 0} icon={<Hand className="size-4" aria-hidden />} aria-label={`شارك — ${s.fullName}`} onClick={() => onSet(s.studentId, (p ?? 0) + 1)}>
            شارك{p !== null && p > 1 ? <span className="tnum">×{fmt.num(p, 0)}</span> : null}
          </ActionButton>
          {p !== null && p > 0 ? (
            <IconButton label={`تراجع عن مشاركة — ${s.fullName}`} className="border border-line-strong" onClick={() => onSet(s.studentId, p > 1 ? p - 1 : null)}>
              <Minus className="size-4" />
            </IconButton>
          ) : null}
          <ActionButton
            tone="warn"
            active={p === 0}
            icon={<CircleSlash className="size-4" aria-hidden />}
            aria-label={`لم يشارك — ${s.fullName}`}
            disabled={p !== null && p > 0}
            title={p !== null && p > 0 ? 'سُجّلت له مشاركة في هذه الحصة؛ تراجع عنها أولًا' : undefined}
            onClick={() => onSet(s.studentId, p === 0 ? null : 0)}
          >
            لم يشارك
          </ActionButton>
          <ActionButton tone="info" icon={<ThumbsUp className="size-4" aria-hidden />} aria-label={`سلوك إيجابي — ${s.fullName}`} title="سلوك إيجابي" onClick={() => onOpen(s, 'positive')}>
            <span className="hidden sm:inline">إيجابي</span>
          </ActionButton>
          <ActionButton tone="bad" icon={<ThumbsDown className="size-4" aria-hidden />} aria-label={`سلوك غير حسن — ${s.fullName}`} title="سلوك غير حسن" onClick={() => onOpen(s, 'negative')}>
            <span className="hidden sm:inline">غير حسن</span>
          </ActionButton>
          <Menu align="end" trigger={<IconButton label={`المزيد — ${s.fullName}`} className="border border-line-strong"><MoreHorizontal className="size-[18px]" /></IconButton>}>
            <MenuItem icon={<MessageSquarePlus className="size-4" />} onSelect={() => onOpen(s, 'note')}>ملاحظة</MenuItem>
            <MenuItem icon={<UserRound className="size-4" />} onSelect={() => navigate(`/students/${s.studentId}?tab=class`)}>التقرير الكامل للطالب</MenuItem>
          </Menu>
        </div>
      </div>

      {s.records.length ? (
        <ul className="mt-2.5 flex flex-wrap gap-1.5 sm:ps-[4.5rem]" aria-label={`تسجيلات ${s.fullName} في هذه الحصة`}>
          {s.records.map((r) => (
            <RecordChip key={r.id} r={r} onOpen={() => onOpen(s, r.kind, r)} onRemove={() => onRemove(r)} />
          ))}
        </ul>
      ) : null}
    </li>
  );
});

// ───────────── الصفحة ─────────────
export default function ClassSessionPage() {
  const [sp, setSp] = useSearchParams();
  const fmt = useFmt();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const floating = useFloatingClass();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const settings = useSettings();
  const today = todayISO();

  const assignmentId = sp.get('assignment') ?? '';
  const rawDate = sp.get('date') ?? '';
  const date = isISODate(rawDate) && rawDate <= today ? rawDate : today;
  const period = periodOf(sp.get('period'));

  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [picker, setPicker] = useState(false);
  const [dialog, setDialog] = useState<RecordTarget | null>(null);

  // الاستعلام والمشاركة المتسلسلة وحذف التسجيلات واستعادتها و«لم يشارك» لمن تبقّى والمسح: في الخطّاف المشترك مع اللوحة العائمة
  const session = useClassSession(assignmentId ? { assignmentId, date, period } : null);
  const { query, data, students, totals, fill, clear } = session;
  const onSet = session.setParticipation;
  const onRemove = session.removeRecord;

  const onOpen = useCallback(
    (s: ClassSessionStudentDto, kind: RecordTarget['kind'], record?: ClassRecordDto) =>
      setDialog({ studentId: s.studentId, studentName: s.fullName, kind, record, session: { assignmentId, date, period } }),
    [assignmentId, date, period],
  );

  const counts = useMemo(
    () => ({
      unrecorded: totals.unrecorded,
      participated: totals.participating,
      silent: totals.didNotParticipate,
      behavior: students.filter((s) => s.records.length > 0).length,
    }),
    [students, totals],
  );
  const shown = useMemo(() => {
    const needle = normalizeArabic(q);
    return students.filter((s) => {
      if (needle && !normalizeArabic(s.fullName).includes(needle)) return false;
      switch (filter) {
        case 'unrecorded':
          return s.participation === null;
        case 'participated':
          return s.participation !== null && s.participation > 0;
        case 'silent':
          return s.participation === 0;
        case 'behavior':
          return s.records.length > 0;
        default:
          return true;
      }
    });
  }, [students, filter, q]);

  if (!assignmentId) return <Navigate to="/class" replace />;

  const setParam = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSp(next, { replace: true });
  };

  const asg = data?.assignment;
  const recorded = students.length - totals.unrecorded;
  const periodOptions = (settings.data?.schedule.periods.map((p) => p.n) ?? Array.from({ length: 8 }, (_, i) => i + 1)).filter((n) => n <= MAX_PERIODS);
  const options = assignments.data ?? [];
  const confirmFill = async () => {
    const ok = await confirm({
      title: `تسجيل «لم يشارك» لـ ${fmt.num(totals.unrecorded, 0)} ${totals.unrecorded === 1 ? 'طالب' : 'طلاب'}؟`,
      description: 'يُسجَّل على من لم تُسجَّل مشاركته بعد في هذه الحصة. لا يمسّ من شارك أو سُجّل له، ويمكنك التراجع عن أي طالب منهم بنقرة.',
      confirmLabel: 'تسجيل',
    });
    if (ok) fill.mutate();
  };
  const confirmClear = async () => {
    const n = students.reduce((a, s) => a + (s.participation !== null ? 1 : 0) + s.records.length, 0);
    const ok = await confirm({
      title: 'مسح كل تسجيلات هذه الحصة؟',
      description: `سيُمحى ما سُجّل فيها من مشاركة وسلوك وملاحظات (${fmt.num(n, 0)} تسجيل)، ولا يمكن التراجع.`,
      confirmLabel: 'مسح',
      tone: 'danger',
    });
    if (ok) clear.mutate();
  };

  return (
    <>
      <PageHeader
        back={<Link to="/class" className="mb-1 inline-flex items-center gap-1 text-[14px] text-muted hover:text-brand"><ArrowRight className="size-4" /> إدارة الصف</Link>}
        title={
          asg ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="tnum">{asg.sectionLabel}</span>
              <SubjectChip name={asg.subjectName} color={asg.subjectColor} className="text-[15px]" />
            </span>
          ) : (
            'الحصة'
          )
        }
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{period ? <>الحصة <span className="tnum">{fmt.num(period, 0)}</span> · </> : null}{weekdayName(weekdayOf(date))} {fmt.date(date, 'long')}</span>
            {date === today ? <Badge tone="brand" dot>اليوم</Badge> : null}
            {data?.lesson ? (
              <Link to={`/lessons/${data.lesson.id}`} className="inline-flex items-center gap-1 text-brand hover:underline"><BookOpenCheck className="size-4" /> {data.lesson.title}</Link>
            ) : null}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={<CalendarDays className="size-4" />} aria-expanded={picker} onClick={() => setPicker((v) => !v)}>تغيير الحصة</Button>
            <Button variant="secondary" className="hidden sm:inline-flex" icon={<PictureInPicture2 className="size-4" />} onClick={() => floating.popOut({ assignmentId, date, period })} title="نافذة صغيرة تبقى فوق البرامج الأخرى، فتسجّل المشاركة وأنت تعرض الدرس">
              نافذة عائمة
            </Button>
            <Menu align="end" trigger={<Button variant="secondary" icon={<MoreHorizontal className="size-4" />}>المزيد</Button>}>
              <MenuItem icon={<FileBarChart className="size-4" />} onSelect={() => navigate(`/class?tab=summary&assignment=${assignmentId}`)}>ملخص الشعبة والتقرير</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Eraser className="size-4" />} danger disabled={!data || (recorded === 0 && students.every((s) => s.records.length === 0))} onSelect={() => void confirmClear()}>مسح تسجيلات هذه الحصة</MenuItem>
            </Menu>
          </>
        }
      />

      {picker ? (
        <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_11rem_8rem_auto] sm:items-end">
          <Field label="الشعبة والمادة">
            {(f) => (
              <Select {...f} value={assignmentId} onChange={(e) => setParam({ assignment: e.target.value })}>
                {asg && !options.some((o) => o.id === asg.id) ? <option value={asg.id}>{asg.sectionLabel} — {asg.subjectName}</option> : null}
                {options.map((o) => <option key={o.id} value={o.id}>{o.sectionLabel} — {o.subjectName}</option>)}
              </Select>
            )}
          </Field>
          <Field label="التاريخ">{(f) => <Input {...f} type="date" max={today} value={date} onChange={(e) => e.target.value && setParam({ date: e.target.value })} />}</Field>
          <Field label="الحصة">
            {(f) => (
              <Select {...f} value={period ? String(period) : ''} onChange={(e) => setParam({ period: e.target.value })}>
                <option value="">غير محددة</option>
                {periodOptions.map((n) => <option key={n} value={n}>{fmt.num(n, 0)}</option>)}
              </Select>
            )}
          </Field>
          <Button variant="soft" onClick={() => setParam({ date: today })} disabled={date === today}>اليوم</Button>
        </Card>
      ) : null}

      {query.error ? (
        <QueryError error={query.error} onRetry={() => void query.refetch()} />
      ) : !data ? (
        <PageLoader />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Users className="size-7" />}
          title="لا طلاب في هذه الشعبة"
          description="أضف الطلاب إلى الشعبة أولًا (لصق الأسماء أو رفع ملف)، ثم عُد لتسجيل مشاركتهم وسلوكهم."
          action={<ButtonLink to={`/classes/${data.assignment.sectionId}`} variant="primary" icon={<Users className="size-4" />}>فتح الشعبة</ButtonLink>}
        />
      ) : (
        <>
          <div className="mb-3 grid grid-cols-4 gap-px overflow-hidden rounded-card border border-line bg-line sm:hidden" aria-label="ملخص الحصة">
            {[
              { label: 'شاركوا', value: totals.participating, tone: 'text-good' },
              { label: 'لم يشاركوا', value: totals.didNotParticipate, tone: 'text-warn' },
              { label: 'لم تُسجَّل', value: totals.unrecorded, tone: 'text-ink' },
              { label: 'سلوك', value: totals.positive + totals.negative + totals.notes, tone: totals.negative ? 'text-bad' : 'text-info' },
            ].map((c) => (
              <div key={c.label} className="bg-surface px-1 py-2 text-center">
                <div className={cn('tnum text-[19px] font-bold leading-6', c.tone)}>{fmt.num(c.value, 0)}</div>
                <div className="text-[11.5px] leading-4 text-muted">{c.label}</div>
              </div>
            ))}
          </div>
          <div className="mb-4 hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-4">
            <Stat label="شاركوا" value={<span className="tnum">{fmt.num(totals.participating, 0)}</span>} hint={`${fmt.num(totals.participations, 0)} مشاركة`} icon={<Hand className="size-5" />} tone="good" />
            <Stat label="لم يشاركوا" value={<span className="tnum">{fmt.num(totals.didNotParticipate, 0)}</span>} hint="سُجّل عليهم" icon={<CircleSlash className="size-5" />} tone="warn" />
            <Stat label="لم تُسجَّل مشاركتهم" value={<span className="tnum">{fmt.num(totals.unrecorded, 0)}</span>} hint={`من ${fmt.num(totals.students, 0)} طالبًا`} icon={<Users className="size-5" />} tone="brand" />
            <Stat
              label="السلوك"
              value={<span className="tnum">{fmt.num(totals.positive + totals.negative + totals.notes, 0)}</span>}
              hint={`${fmt.num(totals.positive, 0)} إيجابي · ${fmt.num(totals.negative, 0)} غير حسن`}
              icon={<ThumbsDown className="size-5" />}
              tone={totals.negative ? 'bad' : 'info'}
            />
          </div>

          <div className="mb-1 flex items-center gap-3">
            <ProgressBar value={recorded} max={students.length} tone={recorded === students.length ? 'good' : 'brand'} className="flex-1" label="اكتمال تسجيل المشاركة" />
            <span className="shrink-0 text-[13px] text-muted">سُجّلت مشاركة <b className="tnum text-ink-2">{fmt.num(recorded, 0)}</b> من <b className="tnum text-ink-2">{fmt.num(students.length, 0)}</b></span>
          </div>

          <div className="mb-4 mt-3 flex flex-wrap items-center gap-3">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              size="sm"
              label="تصفية الطلاب"
              options={[
                { value: 'all', label: 'الكل' },
                { value: 'unrecorded', label: <>لم تُسجَّل <span className="tnum">({fmt.num(counts.unrecorded, 0)})</span></> },
                { value: 'participated', label: <>شاركوا <span className="tnum">({fmt.num(counts.participated, 0)})</span></> },
                { value: 'silent', label: <>لم يشاركوا <span className="tnum">({fmt.num(counts.silent, 0)})</span></> },
                { value: 'behavior', label: <>سلوك <span className="tnum">({fmt.num(counts.behavior, 0)})</span></> },
              ]}
            />
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الطالب…" className="ps-10" aria-label="بحث في طلاب الحصة" />
            </div>
            <Button variant="soft" icon={<CheckCheck className="size-4" />} disabled={totals.unrecorded === 0} loading={fill.isPending} onClick={() => void confirmFill()}>
              «لم يشارك» لمن تبقّى{totals.unrecorded ? <span className="tnum"> ({fmt.num(totals.unrecorded, 0)})</span> : null}
            </Button>
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon={<Search className="size-7" />}
              title="لا طلاب مطابقون"
              description="غيّر التصفية أو البحث."
              action={<Button variant="secondary" onClick={() => { setQ(''); setFilter('all'); }}>إزالة التصفية</Button>}
            />
          ) : (
            <ul className="grid gap-3 xl:grid-cols-2" aria-label="طلاب الحصة">
              {shown.map((s) => (
                <StudentRow key={s.studentId} s={s} onSet={onSet} onOpen={onOpen} onRemove={onRemove} />
              ))}
            </ul>
          )}
          <p className="mt-4 text-[13px] text-muted sm:hidden">
            <ThumbsUp className="inline size-3.5 text-info" aria-hidden /> سلوك إيجابي · <ThumbsDown className="inline size-3.5 text-bad" aria-hidden /> سلوك غير حسن · <MoreHorizontal className="inline size-3.5" aria-hidden /> ملاحظة وتقرير الطالب
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <ParticipationBadge value={null} /> تعني أنك لم تحدّد بعد هل شارك الطالب. «لم يشارك» تسجيل صريح منك، ويدخل في حساب نسبة مشاركته.
          </p>
        </>
      )}

      <RecordDialog target={dialog} onClose={() => setDialog(null)} />
    </>
  );
}
