import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, HeartHandshake, LifeBuoy, Plus, Printer, Sprout, Users } from 'lucide-react';
import { SUPPORT_KIND, SUPPORT_STRATEGY_PRESETS, type SupportKind } from '@shared/constants';
import { addDays, todayISO } from '@shared/dates';
import type { SupportPlanDto, SupportSuggestionDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { qk, useAssignments } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Menu,
  MenuItem,
  Modal,
  PageHeader,
  PageLoader,
  QueryError,
  Segmented,
  Select,
  TagInput,
  Textarea,
} from '@/components/ui';
import { PlanDialog, type PlanPrefill } from './plan-dialog';
import { PlanCard } from './shared';

type StatusFilter = 'open' | 'done' | 'all';

// ───────────── الإنشاء الجماعي من الاقتراحات ─────────────
function BulkDialog({ open, onOpenChange, kind, items }: { open: boolean; onOpenChange: (o: boolean) => void; kind: SupportKind; items: SupportSuggestionDto[] }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [review, setReview] = useState('');
  const [strategies, setStrategies] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setTitle('');
      setGoal('');
      setReview(addDays(todayISO(), 14));
      setStrategies([]);
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const groups = new Map<string, SupportSuggestionDto[]>();
      for (const s of items) groups.set(s.assignmentId, [...(groups.get(s.assignmentId) ?? []), s]);
      let created = 0;
      let skipped = 0;
      for (const [assignmentId, list] of groups) {
        const res = await api.post<{ created: unknown[]; skipped: number }>('/support-plans/bulk', {
          assignmentId,
          termId: list[0]!.termId,
          studentIds: list.map((s) => s.studentId),
          kind,
          title: title.trim() || undefined,
          goal: goal.trim() || undefined,
          strategies,
          startDate: todayISO(),
          reviewDate: review || null,
        });
        created += res.created.length;
        skipped += res.skipped;
      }
      toast.success(`أُنشئت ${created} خطة${skipped ? ` (تُخطّي ${skipped} لوجود خطة مفتوحة)` : ''}. افتح كل خطة لتخصيصها.`);
      void qc.invalidateQueries({ queryKey: ['support'] });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      void qc.invalidateQueries({ queryKey: ['calendar'] });
      onOpenChange(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={`إنشاء ${items.length} خطة ${SUPPORT_KIND.labels[kind]}`}
      description="تُنشأ خطة مستقلة لكل طالب بالبيانات أدناه، وتُسجَّل نسبة كل طالب الحالية كخط أساس. يمكنك تخصيص كل خطة لاحقًا."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" loading={busy} onClick={() => void submit()}>إنشاء الخطط</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="عنوان الخطة" hint="اتركه فارغًا لعنوان تلقائي («خطة علاجية — المادة»)">{(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />}</Field>
        <Field label="الهدف" hint="اتركه فارغًا لهدف افتراضي">{(p) => <Textarea {...p} rows={2} value={goal} onChange={(e) => setGoal(e.target.value)} />}</Field>
        <Field label="الاستراتيجيات والإجراءات">{() => <TagInput value={strategies} onChange={setStrategies} presets={SUPPORT_STRATEGY_PRESETS[kind]} aria-label="الاستراتيجيات" />}</Field>
        <Field label="موعد المراجعة">{(p) => <Input {...p} type="date" value={review} onChange={(e) => setReview(e.target.value)} />}</Field>
        <ul className="max-h-40 space-y-1 overflow-auto rounded-xl border border-line bg-surface-2 p-3 text-[14px]">
          {items.map((s) => <li key={`${s.assignmentId}-${s.studentId}`} className="flex justify-between gap-3"><span>{s.fullName}</span><span className="tnum text-muted">{s.sectionLabel} — {s.subjectName}</span></li>)}
        </ul>
      </div>
    </Modal>
  );
}

function SuggestionsCard({ assignmentId }: { assignmentId: string }) {
  const fmt = useFmt();
  const { settings } = useAuth();
  const q = useQuery({ queryKey: qk.supportSuggestions(assignmentId), queryFn: () => api.get<SupportSuggestionDto[]>('/support-plans/suggestions', { assignmentId: assignmentId || undefined }) });
  const [tab, setTab] = useState<SupportKind>('remedial');
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState(false);
  const all = useMemo(() => q.data ?? [], [q.data]);
  const counts = useMemo(() => ({ remedial: all.filter((s) => s.kind === 'remedial').length, enrichment: all.filter((s) => s.kind === 'enrichment').length }), [all]);
  // ننتقل تلقائيًا إلى التبويب الذي فيه اقتراحات إن كان الحالي فارغًا
  useEffect(() => {
    if (all.length && counts[tab] === 0) setTab(counts.remedial ? 'remedial' : 'enrichment');
  }, [all.length, counts, tab]);
  const list = all.filter((s) => s.kind === tab);
  const key = (s: SupportSuggestionDto) => `${s.assignmentId}|${s.studentId}`;
  const chosen = list.filter((s) => !skipped.has(key(s)));
  const g = settings?.grading;

  if (q.isPending || !all.length) return null;
  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader
        icon={<LifeBuoy className="size-[18px]" />}
        title="اقتراحات من دفتر الدرجات"
        description={g ? `طلاب دون ${fmt.num(g.remedialBelow, 0)}% (علاج) أو من ${fmt.num(g.enrichmentFrom, 0)}% فأكثر (إثراء) ولا خطة مفتوحة لهم` : undefined}
        action={<Segmented<SupportKind> value={tab} onChange={setTab} size="sm" label="نوع الاقتراحات" options={SUPPORT_KIND.items.map((k) => ({ value: k.value, label: `${k.label} (${fmt.num(counts[k.value], 0)})` }))} />}
      />
      <div className="px-5 pb-4">
        {list.length === 0 ? (
          <p className="py-3 text-center text-[14.5px] text-muted">لا اقتراحات {SUPPORT_KIND.labels[tab]} حاليًا.</p>
        ) : (
          <>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {list.map((s) => (
                <li key={key(s)} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Checkbox
                    aria-label={`تحديد ${s.fullName}`}
                    checked={!skipped.has(key(s))}
                    onChange={(e) => setSkipped((cur) => { const n = new Set(cur); if (e.target.checked) n.delete(key(s)); else n.add(key(s)); return n; })}
                  />
                  <Avatar name={s.fullName} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-medium text-ink">{s.fullName}</div>
                    <div className="text-[12.5px] text-muted"><span className="tnum">{s.sectionLabel}</span> — {s.subjectName}</div>
                  </div>
                  <Badge tone={s.kind === 'remedial' ? 'bad' : 'good'} className="tnum">{fmt.pct(s.percent)}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13.5px] text-muted">{fmt.num(chosen.length, 0)} محدّد من {fmt.num(list.length, 0)}</span>
              <Button variant="primary" size="sm" disabled={!chosen.length} icon={tab === 'remedial' ? <HeartHandshake className="size-4" /> : <Sprout className="size-4" />} onClick={() => setBulk(true)}>
                إنشاء خطة {SUPPORT_KIND.labels[tab]} للمحدّدين
              </Button>
            </div>
          </>
        )}
      </div>
      <BulkDialog open={bulk} onOpenChange={setBulk} kind={tab} items={chosen} />
    </Card>
  );
}

// ───────────── الصفحة ─────────────
export default function SupportPage() {
  const { year } = useAcademic();
  const [sp, setSp] = useSearchParams();
  const assignments = useAssignments(year?.id);
  const [dialog, setDialog] = useState<PlanPrefill | null>(null);

  const kind = (SUPPORT_KIND.values as readonly string[]).includes(sp.get('kind') ?? '') ? (sp.get('kind') as SupportKind) : '';
  const status: StatusFilter = sp.get('status') === 'done' ? 'done' : sp.get('status') === 'all' ? 'all' : 'open';
  const assignmentId = sp.get('assignment') ?? '';
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSp(next, { replace: true });
  };

  // فتح نافذة الإنشاء مسبقة التعبئة عند القدوم من ملف الطالب أو لوحة التحكم (?new=1&student=…&assignment=…&kind=…)
  useEffect(() => {
    if (sp.get('new') !== '1') return;
    setDialog({ studentId: sp.get('student') ?? undefined, assignmentId: sp.get('assignment') ?? undefined, kind: kind || undefined });
    const next = new URLSearchParams(sp);
    next.delete('new');
    next.delete('student');
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- عند الدخول فقط
  }, []);

  const params = { kind: kind || undefined, status: status === 'all' ? undefined : status, assignmentId: assignmentId || undefined };
  const plans = useQuery({ queryKey: qk.supportPlans(params), queryFn: () => api.get<SupportPlanDto[]>('/support-plans', params) });
  const reportQuery = { assignmentId: assignmentId || undefined, kind: kind || undefined, status: status === 'all' ? undefined : status };

  if (!year) {
    return (
      <>
        <PageHeader title="الخطط العلاجية والإثرائية" />
        <EmptyState icon={<HeartHandshake className="size-7" />} title="أنشئ عامًا دراسيًا أولًا" description="ترتبط الخطط بطلاب شعبك ومقرراتك." action={<Link to="/classes" className="text-brand underline">الذهاب إلى الشعب</Link>} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="الخطط العلاجية والإثرائية"
        description="خطة فردية لكل طالب متعثر أو متميز، تُقاس نتيجتها بمقارنة نسبته الحالية بنسبته عند بدء الخطة."
        actions={
          <>
            <Menu align="end" trigger={<Button variant="secondary" icon={<FileText className="size-4" />}>تقرير الخطط</Button>}>
              <MenuItem icon={<Download className="size-4" />} onSelect={() => { downloadFile('/reports/support-plans/pdf', reportQuery, 'support-plans.pdf').catch((e) => toast.error(errorMessage(e))); }}>تنزيل PDF</MenuItem>
              <MenuItem icon={<FileSpreadsheet className="size-4" />} onSelect={() => { downloadFile('/reports/support-plans/xlsx', reportQuery, 'support-plans.xlsx').catch((e) => toast.error(errorMessage(e))); }}>تنزيل Excel</MenuItem>
              <MenuItem icon={<Printer className="size-4" />} onSelect={() => window.open(apiUrl('/reports/support-plans/html', reportQuery), '_blank')}>طباعة</MenuItem>
            </Menu>
            <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({ assignmentId: assignmentId || undefined, kind: kind || undefined })}>خطة جديدة</Button>
          </>
        }
      />

      <SuggestionsCard assignmentId={assignmentId} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented<'' | SupportKind> value={kind} onChange={(v) => set({ kind: v })} label="نوع الخطة" options={[{ value: '', label: 'الكل' }, ...SUPPORT_KIND.items.map((k) => ({ value: k.value, label: k.label }))]} />
        <Segmented<StatusFilter> value={status} onChange={(v) => set({ status: v === 'open' ? '' : v })} label="حالة الخطة" options={[{ value: 'open', label: 'المفتوحة' }, { value: 'done', label: 'المنجزة' }, { value: 'all', label: 'الكل' }]} />
        <div className="min-w-56">
          <Select value={assignmentId} onChange={(e) => set({ assignment: e.target.value })} aria-label="تصفية بالشعبة والمادة">
            <option value="">كل الشعب والمواد</option>
            {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
          </Select>
        </div>
        {plans.data ? <span className="ms-auto text-[13.5px] text-muted tnum">{plans.data.length} خطة</span> : null}
      </div>

      {plans.error ? (
        <QueryError error={plans.error} onRetry={() => void plans.refetch()} />
      ) : plans.isPending ? (
        <PageLoader />
      ) : plans.data.length === 0 ? (
        <EmptyState
          icon={<Users className="size-7" />}
          title={status === 'done' ? 'لا خطط منجزة بعد' : 'لا خطط مفتوحة'}
          description="ابدأ من «الاقتراحات» أعلاه إن وُجدت، أو أنشئ خطة لطالب بعينه."
          action={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({})}>خطة جديدة</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.data.map((p) => <PlanCard key={p.id} p={p} />)}</div>
      )}

      <PlanDialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)} prefill={dialog ?? undefined} />
    </>
  );
}
