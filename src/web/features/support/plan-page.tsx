import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, CalendarClock, CircleCheck, CircleX, Download, MoreVertical, Pencil, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { todayISO } from '@shared/dates';
import type { SupportNoteDto, SupportPlanDetailDto } from '@shared/dto';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  IconButton,
  Input,
  Menu,
  MenuItem,
  MenuSeparator,
  Modal,
  PageHeader,
  PageLoader,
  QueryError,
  SubjectChip,
  Textarea,
  useConfirm,
} from '@/components/ui';
import { PlanDialog } from './plan-dialog';
import { KindBadge, PlanProgress, StatusBadge } from './shared';

const invalidateAll = [['support'], ['dashboard'], ['calendar']] as never[];

// ───────────── إغلاق الخطة (إنجاز/إلغاء) ─────────────
function CloseDialog({ plan, mode, onClose }: { plan: SupportPlanDetailDto; mode: 'done' | 'cancelled' | null; onClose: () => void }) {
  const [outcome, setOutcome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const save = useAppMutation(() => api.patch(`/support-plans/${plan.id}`, { status: mode, outcome: outcome.trim() || null }), {
    invalidate: invalidateAll,
    success: mode === 'done' ? 'أُنجزت الخطة' : 'أُلغيت الخطة',
    silentError: true,
    onSuccess: onClose,
    onError: (e) => setError(errorMessage(e)),
  });
  return (
    <Modal
      open={mode !== null}
      onOpenChange={(o) => !o && onClose()}
      size="sm"
      title={mode === 'done' ? 'إنجاز الخطة' : 'إلغاء الخطة'}
      description={mode === 'done' ? 'دوّن نتيجة الخطة: هل تحقق الهدف؟ وما الذي تغيّر في مستوى الطالب؟' : 'اذكر سبب الإلغاء ليبقى في السجل.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>رجوع</Button>
          <Button variant={mode === 'done' ? 'primary' : 'danger'} loading={save.isPending} onClick={() => { setError(null); save.mutate(); }}>
            {mode === 'done' ? 'تأكيد الإنجاز' : 'تأكيد الإلغاء'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        {mode === 'done' ? <div className="rounded-xl bg-surface-2 p-3"><PlanProgress plan={plan} /></div> : null}
        <Field label={mode === 'done' ? 'نتيجة الخطة' : 'سبب الإلغاء'}>
          {(p) => <Textarea {...p} rows={4} value={outcome} onChange={(e) => setOutcome(e.target.value)} autoFocus maxLength={2000} />}
        </Field>
      </div>
    </Modal>
  );
}

// ───────────── سجل المتابعة ─────────────
function NoteItem({ planId, note }: { planId: string; note: SupportNoteDto }) {
  const fmt = useFmt();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const update = useAppMutation(() => api.patch(`/support-plans/${planId}/notes/${note.id}`, { text }), { invalidate: invalidateAll, success: 'حُفظت المتابعة', onSuccess: () => setEditing(false) });
  const remove = useAppMutation(() => api.del(`/support-plans/${planId}/notes/${note.id}`), { invalidate: invalidateAll, success: 'حُذفت المتابعة' });
  return (
    <li className="relative ps-6">
      <span className="absolute start-0 top-2 size-3 rounded-full border-2 border-brand bg-surface" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-muted tnum">{fmt.date(note.date, 'full')}</div>
          {editing ? (
            <div className="mt-1.5 space-y-2">
              <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-label="نص المتابعة" autoFocus />
              <div className="flex gap-2">
                <Button size="sm" variant="primary" disabled={!text.trim()} loading={update.isPending} onClick={() => update.mutate()}>حفظ</Button>
                <Button size="sm" variant="ghost" onClick={() => { setText(note.text); setEditing(false); }}>إلغاء</Button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-7 text-ink">{note.text}</p>
          )}
        </div>
        {!editing ? (
          <div className="flex shrink-0">
            <IconButton label="تعديل المتابعة" size="iconSm" onClick={() => setEditing(true)}><Pencil className="size-4" /></IconButton>
            <IconButton label="حذف المتابعة" size="iconSm" className="hover:text-bad" onClick={async () => { if (await confirm({ title: 'حذف هذه المتابعة؟', confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(); }}><Trash2 className="size-4" /></IconButton>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function FollowUps({ plan }: { plan: SupportPlanDetailDto }) {
  const [date, setDate] = useState(todayISO());
  const [text, setText] = useState('');
  const add = useAppMutation(() => api.post(`/support-plans/${plan.id}/notes`, { date, text: text.trim() }), {
    invalidate: invalidateAll,
    success: 'أُضيفت المتابعة',
    onSuccess: () => setText(''),
  });
  return (
    <Card>
      <CardHeader title="سجل المتابعة" description="دوّن ما حدث بعد كل جلسة أو مراجعة؛ يظهر في تقرير الخطة المطبوع." />
      <div className="space-y-5 px-5 pb-5">
        <form
          className="grid gap-3 rounded-xl border border-line bg-surface-2 p-3 sm:grid-cols-[10rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) add.mutate();
          }}
        >
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="تاريخ المتابعة" />
          <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب متابعة جديدة…" aria-label="متابعة جديدة" />
          <Button type="submit" variant="primary" icon={<Plus className="size-4" />} disabled={!text.trim() || !date} loading={add.isPending}>إضافة</Button>
        </form>
        {plan.notes.length === 0 ? (
          <p className="py-2 text-center text-[14.5px] text-muted">لا متابعات مسجّلة بعد.</p>
        ) : (
          <ol className="relative space-y-5 before:absolute before:inset-y-3 before:start-[5px] before:w-px before:bg-line">
            {plan.notes.map((n) => <NoteItem key={n.id} planId={plan.id} note={n} />)}
          </ol>
        )}
      </div>
    </Card>
  );
}

// ───────────── الصفحة ─────────────
export default function SupportPlanPage() {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const fmt = useFmt();
  const confirm = useConfirm();
  const q = useQuery({ queryKey: qk.supportPlan(planId), queryFn: () => api.get<SupportPlanDetailDto>(`/support-plans/${planId}`) });
  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState<'done' | 'cancelled' | null>(null);

  const reopen = useAppMutation(() => api.patch(`/support-plans/${planId}`, { status: 'open' }), { invalidate: invalidateAll, success: 'أُعيد فتح الخطة' });
  const remove = useAppMutation(() => api.del(`/support-plans/${planId}`), {
    invalidate: invalidateAll,
    success: 'حُذفت الخطة',
    onSuccess: () => void navigate('/support', { replace: true }),
  });

  if (q.isPending) return <PageLoader />;
  if (q.error || !q.data) return <QueryError error={q.error} onRetry={() => void q.refetch()} />;
  const p = q.data;
  const open = p.status === 'open';

  return (
    <>
      <PageHeader
        back={<Link to="/support" className="mb-1 inline-flex items-center gap-1 text-[14px] text-muted hover:text-brand"><ArrowRight className="size-4" /> الخطط العلاجية والإثرائية</Link>}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <Avatar name={p.studentName} size={44} />
            <Link to={`/students/${p.studentId}`} className="hover:text-brand">{p.studentName}</Link>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2 pt-1">
            <KindBadge kind={p.kind} />
            <StatusBadge status={p.status} due={p.due} />
            {p.subjectName && p.subjectColor ? <SubjectChip name={p.subjectName} color={p.subjectColor} /> : null}
            {p.sectionLabel ? <span className="tnum text-muted">· {p.sectionLabel}</span> : null}
          </span>
        }
        actions={
          <>
            {open ? <Button variant="primary" icon={<CircleCheck className="size-4" />} onClick={() => setClosing('done')}>إنجاز الخطة</Button> : <Button variant="secondary" icon={<RotateCcw className="size-4" />} loading={reopen.isPending} onClick={() => reopen.mutate()}>إعادة فتح</Button>}
            <Button variant="secondary" icon={<Pencil className="size-4" />} onClick={() => setEditing(true)}>تعديل</Button>
            <Menu align="end" trigger={<IconButton label="المزيد" variant="secondary"><MoreVertical className="size-5" /></IconButton>}>
              <MenuItem icon={<Printer className="size-4" />} onSelect={() => window.open(apiUrl('/reports/support-plans/html', { planId }), '_blank')}>طباعة الخطة</MenuItem>
              <MenuItem icon={<Download className="size-4" />} onSelect={() => { downloadFile('/reports/support-plans/pdf', { planId }, 'support-plan.pdf').catch((e) => toast.error(errorMessage(e))); }}>تنزيل PDF</MenuItem>
              <MenuSeparator />
              {open ? <MenuItem icon={<CircleX className="size-4" />} onSelect={() => setClosing('cancelled')}>إلغاء الخطة</MenuItem> : null}
              <MenuItem
                icon={<Trash2 className="size-4" />}
                danger
                onSelect={async () => {
                  if (await confirm({ title: 'حذف الخطة نهائيًا؟', description: 'تُحذف الخطة مع كل متابعاتها. إن كنت تريد الاحتفاظ بسجلها فاستعمل «إنجاز» أو «إلغاء» بدل الحذف.', confirmLabel: 'حذف', tone: 'danger' })) remove.mutate();
                }}
              >
                حذف الخطة
              </MenuItem>
            </Menu>
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="text-[19px] font-semibold text-ink">{p.title}</h2>
            {p.reason ? <div className="mt-3"><div className="text-[13px] font-medium text-muted">{p.kind === 'remedial' ? 'التشخيص / سبب الخطة' : 'مبرر الخطة'}</div><p className="whitespace-pre-wrap text-[15px] leading-7 text-ink">{p.reason}</p></div> : null}
            <div className="mt-3"><div className="text-[13px] font-medium text-muted">الهدف</div><p className="whitespace-pre-wrap text-[15px] leading-7 text-ink">{p.goal}</p></div>
            {p.strategies.length ? (
              <div className="mt-3">
                <div className="mb-1.5 text-[13px] font-medium text-muted">الاستراتيجيات والإجراءات</div>
                <ul className="flex flex-wrap gap-2">{p.strategies.map((s) => <li key={s} className="rounded-lg bg-brand-soft px-3 py-1 text-[14px] text-brand">{s}</li>)}</ul>
              </div>
            ) : null}
            {p.outcome ? <Alert tone={p.status === 'done' ? 'good' : 'warn'} className="mt-4" title={p.status === 'done' ? 'نتيجة الخطة' : 'سبب الإلغاء'}>{p.outcome}</Alert> : null}
          </Card>

          <FollowUps plan={p} />
        </div>

        <aside aria-label="ملخص الخطة" className="space-y-4 lg:sticky lg:top-24">
          <Card className="space-y-4 p-5">
            <div>
              <div className="mb-1 text-[13px] font-medium text-muted">أثر الخطة على مستوى الطالب</div>
              <PlanProgress plan={p} size="lg" />
              <p className="mt-1 text-[12.5px] text-muted">نسبته في المقرر: عند بدء الخطة ← الآن (الفصل الحالي).</p>
            </div>
            <dl className="space-y-2.5 text-[14.5px]">
              <div className="flex justify-between gap-3"><dt className="text-muted">تاريخ البدء</dt><dd className="tnum font-medium text-ink">{fmt.date(p.startDate, 'medium')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">موعد المراجعة</dt><dd className={`tnum font-medium ${p.due ? 'text-bad' : 'text-ink'}`}>{p.reviewDate ? fmt.date(p.reviewDate, 'medium') : '—'}</dd></div>
              {p.closedAt ? <div className="flex justify-between gap-3"><dt className="text-muted">أُغلقت في</dt><dd className="tnum font-medium text-ink">{fmt.dateTime(p.closedAt)}</dd></div> : null}
              <div className="flex justify-between gap-3"><dt className="text-muted">المتابعات</dt><dd className="tnum font-medium text-ink">{fmt.num(p.notesCount, 0)}</dd></div>
            </dl>
          </Card>
          {p.assignmentId ? (
            <Link to={`/assessments/${p.assignmentId}`} className="flex items-center gap-2 rounded-card border border-line bg-surface p-4 text-[14.5px] font-medium text-ink shadow-card transition-colors hover:border-brand hover:text-brand">
              <CalendarClock className="size-4 text-brand" /> فتح دفتر درجات المقرر
            </Link>
          ) : (
            <EmptyState title="المقرر محذوف" description="حُذف المقرر المرتبط بهذه الخطة؛ بقيت الخطة وسجل متابعتها دون نسبة حالية." className="py-6" />
          )}
        </aside>
      </div>

      <PlanDialog open={editing} onOpenChange={setEditing} plan={p} />
      <CloseDialog plan={p} mode={closing} onClose={() => setClosing(null)} />
    </>
  );
}
