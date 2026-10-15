import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarCheck, CalendarPlus, Copy, Pencil, Star, Trash2 } from 'lucide-react';
import type { TermDto, YearDto } from '@shared/dto';
import { api, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useYears } from '@/lib/queries';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Field, IconButton, Input, Modal, PageLoader, QueryError, Select, useConfirm } from '@/components/ui';
import { BookOpen } from 'lucide-react';
import { CreateYearDialog } from '@/components/common/year-dialog';
import { SubjectManager } from '@/components/common/subject-manager';

function EditYearDialog({ year, onClose }: { year: YearDto | null; onClose: () => void }) {
  const [v, setV] = useState({ name: '', startDate: '', endDate: '' });
  const [terms, setTerms] = useState<{ id: string; name: string; startDate: string; endDate: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!year) return;
    setError(null);
    setV({ name: year.name, startDate: year.startDate, endDate: year.endDate });
    setTerms(year.terms.map((t) => ({ id: t.id, name: t.name, startDate: t.startDate, endDate: t.endDate })));
  }, [year]);
  const save = useAppMutation(
    async () => {
      await api.patch(`/years/${year!.id}`, v);
      for (const t of terms) await api.patch(`/terms/${t.id}`, { name: t.name, startDate: t.startDate, endDate: t.endDate });
    },
    { invalidate: [qk.years, ['dashboard']], success: 'حُفظ العام الدراسي', silentError: true, onSuccess: onClose, onError: (e) => setError(errorMessage(e)) },
  );
  return (
    <Modal open={!!year} onOpenChange={(o) => !o && onClose()} size="md" title="تعديل العام والفصلين" description="تواريخ الفصول تحدد الفصل «الحالي» ورقم الأسبوع في لوحة التحكم."
      footer={<><Button variant="ghost" onClick={onClose}>إلغاء</Button><Button variant="primary" loading={save.isPending} onClick={() => save.mutate()}>حفظ</Button></>}>
      <div className="space-y-4">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="اسم العام" required>{(f) => <Input {...f} dir="ltr" className="text-start" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />}</Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="بداية العام">{(f) => <Input {...f} type="date" value={v.startDate} onChange={(e) => setV({ ...v, startDate: e.target.value })} />}</Field>
          <Field label="نهاية العام">{(f) => <Input {...f} type="date" value={v.endDate} onChange={(e) => setV({ ...v, endDate: e.target.value })} />}</Field>
        </div>
        {terms.map((t, i) => (
          <div key={t.id} className="rounded-xl border border-line p-3">
            <div className="mb-2 text-[14px] font-semibold text-ink">{t.name}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="البداية">{(f) => <Input {...f} type="date" value={t.startDate} onChange={(e) => setTerms(terms.map((x, j) => (j === i ? { ...x, startDate: e.target.value } : x)))} />}</Field>
              <Field label="النهاية">{(f) => <Input {...f} type="date" value={t.endDate} onChange={(e) => setTerms(terms.map((x, j) => (j === i ? { ...x, endDate: e.target.value } : x)))} />}</Field>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function CloneDialog({ open, onOpenChange, years }: { open: boolean; onOpenChange: (o: boolean) => void; years: YearDto[] }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  useEffect(() => { if (open) { setFrom(years[1]?.id ?? ''); setTo(years[0]?.id ?? ''); } }, [open, years]);
  const clone = useAppMutation(() => api.post<{ sections: number; assignments: number }>('/years/clone-structure', { fromYearId: from, toYearId: to }), {
    invalidate: ['academic'],
    onSuccess: (r) => { toast.success(`نُسخت ${r.sections} شعبة و${r.assignments} مقرر (بلا طلاب أو درجات)`); onOpenChange(false); },
  });
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="sm" title="نسخ بنية الشعب من عام سابق" description="ينسخ الشعب والمقررات فقط، دون الطلاب أو الدرجات — ثم تسجّل الطلاب بالترفيع من صفحة كل شعبة."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="primary" disabled={!from || !to || from === to} loading={clone.isPending} onClick={() => clone.mutate()}>نسخ</Button></>}>
      <div className="space-y-4">
        <Field label="من عام">{(f) => <Select {...f} value={from} onChange={(e) => setFrom(e.target.value)}>{years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</Select>}</Field>
        <Field label="إلى عام">{(f) => <Select {...f} value={to} onChange={(e) => setTo(e.target.value)}>{years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</Select>}</Field>
      </div>
    </Modal>
  );
}

export function AcademicTab() {
  const fmt = useFmt();
  const confirm = useConfirm();
  const { data, error, isPending, refetch } = useYears();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<YearDto | null>(null);
  const [cloning, setCloning] = useState(false);
  const [subjects, setSubjects] = useState(false);
  const current = useAppMutation((id: string) => api.post(`/years/${id}/current`), { invalidate: [qk.years, ['dashboard']], success: 'عُيّن العام الحالي' });
  const remove = useAppMutation((id: string) => api.del(`/years/${id}`), { invalidate: [qk.years], success: 'حُذف العام الدراسي' });

  if (isPending) return <PageLoader />;
  if (error) return <QueryError error={error} onRetry={() => void refetch()} />;
  const years = data ?? [];
  const termRow = (t: TermDto) => (
    <li key={t.id} className="flex items-center justify-between gap-3 text-[14px]">
      <span className="text-ink-2">{t.name}</span>
      <span className="tnum text-muted">{fmt.date(t.startDate, 'medium')} — {fmt.date(t.endDate, 'medium')}</span>
    </li>
  );

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" icon={<CalendarPlus className="size-4" />} onClick={() => setCreating(true)}>إنشاء عام دراسي</Button>
        {years.length > 1 ? <Button variant="secondary" icon={<Copy className="size-4" />} onClick={() => setCloning(true)}>نسخ بنية الشعب من عام سابق</Button> : null}
        <Button variant="secondary" icon={<BookOpen className="size-4" />} onClick={() => setSubjects(true)}>إدارة المواد</Button>
      </div>
      {years.length === 0 ? (
        <EmptyState icon={<CalendarPlus className="size-7" />} title="لا أعوام دراسية بعد" description="أنشئ العام الدراسي لتبدأ. يُقسَّم تلقائيًا إلى فصلين." />
      ) : (
        years.map((y) => (
          <Card key={y.id}>
            <CardHeader
              title={<span className="flex items-center gap-2 tnum">{y.name}{y.isCurrent ? <Badge tone="good" dot>الحالي</Badge> : null}</span>}
              description={`${fmt.date(y.startDate, 'long')} — ${fmt.date(y.endDate, 'long')}`}
              action={
                <div className="flex items-center gap-1">
                  {!y.isCurrent ? <Button variant="soft" size="sm" icon={<Star className="size-4" />} onClick={() => current.mutate(y.id)}>جعله الحالي</Button> : <CalendarCheck className="size-5 text-good" aria-label="العام الحالي" />}
                  <IconButton label="تعديل" size="iconSm" onClick={() => setEditing(y)}><Pencil className="size-4" /></IconButton>
                  <IconButton label="حذف" size="iconSm" className="hover:text-bad" onClick={async () => { if (await confirm({ title: `حذف العام ${y.name}؟`, description: 'لا يُحذف عام يحتوي شعبًا. احذف شعبه أولًا.', confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(y.id); }}><Trash2 className="size-4" /></IconButton>
                </div>
              }
            />
            <ul className="space-y-2 border-t border-line px-5 py-3">{y.terms.map(termRow)}</ul>
          </Card>
        ))
      )}
      <CreateYearDialog open={creating} onOpenChange={setCreating} />
      <EditYearDialog year={editing} onClose={() => setEditing(null)} />
      <CloneDialog open={cloning} onOpenChange={setCloning} years={years} />
      <SubjectManager open={subjects} onOpenChange={setSubjects} />
    </div>
  );
}
