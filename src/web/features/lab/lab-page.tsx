import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, Ban, CalendarClock, CheckCheck, CircleCheck, Copy, Download, FileSpreadsheet, FileText, FlaskConical, MoreHorizontal, Pencil, Plus, Printer, RotateCcw, Search, Trash2, Users } from 'lucide-react';
import { LAB_KIND, LAB_STATUS, type LabKind, type LabStatus } from '@shared/constants';
import { addDays, todayISO } from '@shared/dates';
import type { LabActivitiesPage, LabActivitySummaryDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useDebounced, useFmt, useLocalState } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments } from '@/lib/queries';
import { Button, Card, EmptyState, IconButton, Input, Menu, MenuItem, MenuSeparator, PageHeader, PageLoader, QueryError, Segmented, Select, Stat, SubjectChip, useConfirm } from '@/components/ui';
import { CompleteDialog } from './complete-dialog';
import { LabCopyDialog } from './copy-dialog';
import { LabDialog, type LabTarget } from './lab-dialog';
import { DateBlock, KindBadge, StatusBadge } from './shared';

type Scope = 'term' | 'year' | 'all';
type StatusFilter = '' | LabStatus;

const isKind = (v: string | null): v is LabKind => !!v && (LAB_KIND.values as readonly string[]).includes(v);
const isStatus = (v: string | null): v is LabStatus => !!v && (LAB_STATUS.values as readonly string[]).includes(v);

// ───────────── صف النشاط ─────────────
function LabRow({
  a,
  today,
  pdf,
  onOpen,
  onComplete,
  onCopy,
  onDelete,
  onStatus,
}: {
  a: LabActivitySummaryDto;
  today: string;
  pdf: boolean;
  onOpen: (a: LabActivitySummaryDto) => void;
  onComplete: (a: LabActivitySummaryDto) => void;
  onCopy: (a: LabActivitySummaryDto) => void;
  onDelete: (a: LabActivitySummaryDto) => void;
  onStatus: (a: LabActivitySummaryDto, status: LabStatus) => void;
}) {
  const fmt = useFmt();
  const canComplete = a.status !== 'done' && a.date <= today;
  return (
    <Card className={cn('relative flex flex-wrap items-start gap-x-4 gap-y-3 p-4 transition-shadow hover:shadow-pop', a.subjectColor && `subj-${a.subjectColor}`)}>
      <DateBlock a={a} />
      <div className="min-w-0 flex-1 basis-56">
        <button type="button" onClick={() => onOpen(a)} className="block max-w-full truncate text-start text-[16px] font-semibold leading-6 text-ink after:absolute after:inset-0 after:content-[''] hover:text-brand" title={a.title}>
          {a.title}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
          <KindBadge kind={a.kind} />
          {a.sectionLabel ? <span className="tnum font-medium text-ink-2">{a.sectionLabel}</span> : <span>نشاط عام</span>}
          {a.subjectName && a.subjectColor ? <SubjectChip name={a.subjectName} color={a.subjectColor} /> : null}
          {a.period ? <span>الحصة <span className="tnum">{fmt.num(a.period, 0)}</span></span> : null}
          {a.location ? <span>{a.location}</span> : null}
          {a.status === 'done' && a.participants !== null ? <span><b className="tnum text-ink-2">{fmt.num(a.participants, 0)}</b> مشاركًا</span> : null}
        </div>
      </div>
      <div className="relative z-10 ms-auto flex items-center gap-2">
        <StatusBadge status={a.status} overdue={a.overdue} />
        {canComplete ? <Button variant="soft" size="sm" icon={<CheckCheck className="size-4" />} onClick={() => onComplete(a)}>تسجيل التنفيذ</Button> : null}
        <Menu align="end" trigger={<IconButton label={`خيارات «${a.title}»`} size="iconSm"><MoreHorizontal className="size-[18px]" /></IconButton>}>
          <MenuItem icon={<Pencil className="size-4" />} onSelect={() => onOpen(a)}>تعديل</MenuItem>
          <MenuItem icon={<Copy className="size-4" />} onSelect={() => onCopy(a)}>نسخ إلى شعب أو تواريخ أخرى</MenuItem>
          <MenuItem icon={<Printer className="size-4" />} onSelect={() => window.open(apiUrl('/reports/lab-log/html', { labId: a.id }), '_blank')}>طباعة ورقة النشاط</MenuItem>
          {pdf ? <MenuItem icon={<Download className="size-4" />} onSelect={() => { downloadFile('/reports/lab-log/pdf', { labId: a.id }, 'lab-activity.pdf').catch((e) => toast.error(errorMessage(e))); }}>تنزيل ورقة النشاط PDF</MenuItem> : null}
          <MenuSeparator />
          {a.status === 'planned' ? <MenuItem icon={<Ban className="size-4" />} onSelect={() => onStatus(a, 'cancelled')}>تعليم كملغى</MenuItem> : null}
          {a.status === 'cancelled' ? <MenuItem icon={<RotateCcw className="size-4" />} onSelect={() => onStatus(a, 'planned')}>إعادة التخطيط</MenuItem> : null}
          <MenuItem icon={<Trash2 className="size-4" />} danger onSelect={() => onDelete(a)}>حذف</MenuItem>
        </Menu>
      </div>
    </Card>
  );
}

// ───────────── الصفحة ─────────────
export default function LabPage() {
  const fmt = useFmt();
  const confirm = useConfirm();
  const { year, term } = useAcademic();
  const { system } = useAuth();
  const assignments = useAssignments(year?.id);
  const [sp, setSp] = useSearchParams();
  const [scope, setScope] = useLocalState<Scope>('sijilli-lab-scope', 'term');
  const [dialog, setDialog] = useState<LabTarget | null>(null);
  const [completing, setCompleting] = useState<LabActivitySummaryDto | null>(null);
  const [copying, setCopying] = useState<LabActivitySummaryDto | null>(null);
  const [limit, setLimit] = useState(100);
  const [q, setQ] = useState(sp.get('q') ?? '');
  const dq = useDebounced(q, 250);
  const today = todayISO();
  const pdf = system?.capabilities.pdf ?? false;

  const kind = isKind(sp.get('kind')) ? (sp.get('kind') as LabKind) : '';
  const overdueView = sp.get('view') === 'overdue';
  const status: StatusFilter = isStatus(sp.get('status')) ? (sp.get('status') as LabStatus) : '';
  const assignmentId = sp.get('assignment') ?? '';
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSp(next, { replace: true });
    setLimit(100);
  };

  // الروابط العميقة: ?open=<id> يفتح نافذة التعديل (من التقويم)، و?new=1 يفتح الإنشاء (من أي صفحة)
  useEffect(() => {
    const open = sp.get('open');
    const isNew = sp.get('new') === '1';
    if (!open && !isNew) return;
    setDialog(open ? { id: open } : { prefill: { assignmentId: sp.get('assignment') ?? undefined, date: sp.get('date') ?? undefined, kind: isKind(sp.get('kind')) ? (sp.get('kind') as LabKind) : undefined } });
    const next = new URLSearchParams(sp);
    next.delete('open');
    next.delete('new');
    next.delete('date');
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- عند الدخول فقط
  }, []);

  // «فات موعده» يُحسب على العام كله (كما في لوحة التحكم) فيتجاهل نطاق الفصل كي يتطابق العدد
  const range = useMemo(() => {
    if (overdueView) return year ? { from: year.startDate, to: year.endDate } : {};
    if (scope === 'term' && term) return { from: term.startDate, to: term.endDate };
    if ((scope === 'term' || scope === 'year') && year) return { from: year.startDate, to: year.endDate };
    return {};
  }, [overdueView, scope, term, year]);

  const params = { ...range, assignmentId: assignmentId || undefined, kind: kind || undefined, status: overdueView ? undefined : status || undefined, view: overdueView ? 'overdue' : undefined, q: dq || undefined, limit };
  const query = useQuery({ queryKey: qk.lab(params), queryFn: () => api.get<LabActivitiesPage>('/lab-activities', params), placeholderData: (p) => p });
  const data = query.data;

  const invalidate = [['lab'], qk.dashboard, ['calendar']] as const;
  const remove = useAppMutation((id: string) => api.del(`/lab-activities/${id}`), { invalidate: [...invalidate], success: 'حُذف النشاط' });
  const setStatus = useAppMutation(({ id, status: s }: { id: string; status: LabStatus }) => api.patch(`/lab-activities/${id}`, { status: s }), {
    invalidate: [...invalidate],
    success: (_d, v) => (v.status === 'cancelled' ? 'عُلِّم النشاط كملغى' : 'أُعيد النشاط إلى «مخطَّط»'),
  });

  const askDelete = async (a: LabActivitySummaryDto) => {
    const ok = await confirm({
      title: `حذف «${a.title}»؟`,
      description: a.status === 'done' ? 'سيُحذف معه ما سجّلته من نتائج وعدد مشاركين، ولا يمكن التراجع.' : 'لا يمكن التراجع عن الحذف.',
      confirmLabel: 'حذف',
      tone: 'danger',
    });
    if (ok) remove.mutate(a.id);
  };

  // التقرير يطابق ما تعرضه الصفحة: «الكل» = كل الفترات (لا الفصل الحالي الافتراضي)، و«فات موعده» = المخطَّط قبل اليوم
  const reportQuery = {
    ...range,
    ...(overdueView ? { to: addDays(today, -1) } : {}),
    labAll: scope === 'all' && !overdueView ? true : undefined,
    assignmentId: assignmentId || undefined,
    labKind: kind || undefined,
    labStatus: overdueView ? 'planned' : status || undefined,
  };
  const filtered = !!(q || kind || status || assignmentId || overdueView);

  return (
    <>
      <PageHeader
        title="المختبر والأنشطة"
        description="خطّط تجاربك وأنشطتك العملية، ثم وثّق تنفيذها ونتائجها وعدد المشاركين، وأعد استخدامها في شعب أخرى بنقرة."
        actions={
          <>
            <Menu align="end" trigger={<Button variant="secondary" icon={<FileText className="size-4" />}>تقرير السجل</Button>}>
              {pdf ? <MenuItem icon={<Download className="size-4" />} onSelect={() => { downloadFile('/reports/lab-log/pdf', reportQuery, 'lab-log.pdf').catch((e) => toast.error(errorMessage(e))); }}>تنزيل PDF</MenuItem> : null}
              <MenuItem icon={<FileSpreadsheet className="size-4" />} onSelect={() => { downloadFile('/reports/lab-log/xlsx', reportQuery, 'lab-log.xlsx').catch((e) => toast.error(errorMessage(e))); }}>تنزيل Excel</MenuItem>
              <MenuItem icon={<Printer className="size-4" />} onSelect={() => window.open(apiUrl('/reports/lab-log/html', reportQuery), '_blank')}>طباعة</MenuItem>
            </Menu>
            <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({ prefill: { assignmentId: assignmentId || undefined, kind: kind || undefined } })}>نشاط جديد</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="مخطَّطة" value={fmt.num(data?.stats.planned ?? 0, 0)} hint={data?.stats.overdue ? `منها ${fmt.num(data.stats.overdue, 0)} فات موعده` : 'لم تُنفَّذ بعد'} icon={<CalendarClock className="size-5" />} tone="info" />
        <Stat label="نُفِّذت" value={fmt.num(data?.stats.done ?? 0, 0)} hint="موثَّقة في السجل" icon={<CircleCheck className="size-5" />} tone="good" />
        <Stat
          label="فات موعدها"
          value={fmt.num(data?.stats.overdue ?? 0, 0)}
          hint={data?.stats.overdue ? 'لم يُسجَّل تنفيذها ولا إلغاؤها' : 'لا شيء معلّق'}
          icon={<AlertTriangle className="size-5" />}
          tone={data?.stats.overdue ? 'bad' : 'good'}
        />
        <Stat label="مشاركات الطلاب" value={fmt.num(data?.stats.participants ?? 0, 0)} hint="مجموع المشاركين في المنفَّذة" icon={<Users className="size-5" />} tone="accent" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented<StatusFilter>
          value={overdueView ? '' : status}
          onChange={(v) => set({ status: v, view: '' })}
          label="حالة النشاط"
          options={[{ value: '', label: 'الكل' }, ...LAB_STATUS.items.map((s) => ({ value: s.value as StatusFilter, label: s.label }))]}
        />
        {data?.stats.overdue || overdueView ? (
          <Button variant={overdueView ? 'danger' : 'secondary'} size="sm" aria-pressed={overdueView} icon={<AlertTriangle className="size-4" />} onClick={() => set({ view: overdueView ? '' : 'overdue', status: '' })}>
            فات موعده{data ? ` (${fmt.num(data.stats.overdue, 0)})` : ''}
          </Button>
        ) : null}
        <div className="w-44">
          <Select value={kind} onChange={(e) => set({ kind: e.target.value })} aria-label="تصفية بنوع النشاط">
            <option value="">كل الأنواع</option>
            {LAB_KIND.items.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </Select>
        </div>
        <div className="min-w-52">
          <Select value={assignmentId} onChange={(e) => set({ assignment: e.target.value })} aria-label="تصفية بالشعبة والمادة">
            <option value="">كل الشعب والمواد</option>
            {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
          </Select>
        </div>
        {!overdueView ? (
          <Segmented<Scope>
            value={scope}
            onChange={(v) => { setScope(v); setLimit(100); }}
            label="نطاق الفترة"
            options={[
              { value: 'term', label: term ? 'الفصل' : 'العام' },
              ...(term ? [{ value: 'year' as const, label: 'العام' }] : []),
              { value: 'all', label: 'الكل' },
            ]}
          />
        ) : (
          <span className="text-[13px] text-muted">العام الدراسي كله</span>
        )}
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setLimit(100); }} placeholder="ابحث بالعنوان أو المكان أو الأدوات…" className="ps-10" aria-label="بحث في الأنشطة" />
        </div>
      </div>

      {query.error ? (
        <QueryError error={query.error} onRetry={() => void query.refetch()} />
      ) : !data ? (
        <PageLoader />
      ) : data.items.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={<Search className="size-7" />}
            title="لا أنشطة مطابقة"
            description="غيّر التصفية أو وسّع نطاق الفترة."
            action={<Button variant="secondary" onClick={() => { setQ(''); setSp(new URLSearchParams(), { replace: true }); }}>إزالة التصفية</Button>}
          />
        ) : (
          <EmptyState
            icon={<FlaskConical className="size-7" />}
            title="لا أنشطة في هذه الفترة"
            description="سجّل تجاربك وعروضك وأنشطتك: خطّطها قبل الحصة، ووثّق نتائجها وعدد المشاركين بعدها، ثم انسخها إلى بقية الشعب."
            action={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({})}>نشاط جديد</Button>}
          />
        )
      ) : (
        <>
          <ul className="space-y-3" aria-label="الأنشطة">
            {data.items.map((a) => (
              <li key={a.id}>
                <LabRow
                  a={a}
                  today={today}
                  pdf={pdf}
                  onOpen={(x) => setDialog({ id: x.id })}
                  onComplete={setCompleting}
                  onCopy={setCopying}
                  onDelete={(x) => void askDelete(x)}
                  onStatus={(x, s) => setStatus.mutate({ id: x.id, status: s })}
                />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between text-[14px] text-muted">
            <span className="tnum">{fmt.num(data.items.length, 0)} من {fmt.num(data.total, 0)}</span>
            {data.items.length < data.total ? <Button variant="secondary" size="sm" onClick={() => setLimit(limit + 100)}>عرض المزيد</Button> : null}
          </div>
        </>
      )}

      <LabDialog target={dialog} onClose={() => setDialog(null)} />
      <CompleteDialog activity={completing} onClose={() => setCompleting(null)} />
      <LabCopyDialog activity={copying} onClose={() => setCopying(null)} />
    </>
  );
}
