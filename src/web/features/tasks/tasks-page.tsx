import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Flag, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { TASK_KIND, TASK_PRIORITY, weekdayName, type TaskKind, type TaskPriority } from '@shared/constants';
import { addDays, endOfMonth, formatMonthYear, isBetween, startOfMonth, startOfWeek, todayISO, weekdayOf } from '@shared/dates';
import type { CalendarItemDto, TaskDto } from '@shared/dto';
import { createTaskSchema } from '@shared/schemas/tasks';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments } from '@/lib/queries';
import { useAcademic } from '@/context/academic';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Field, IconButton, Input, Modal, PageHeader, PageLoader, QueryError, Segmented, Select, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, useConfirm } from '@/components/ui';

const kindTone: Record<TaskKind, 'info' | 'warn' | 'brand' | 'accent' | 'neutral'> = { task: 'info', exam: 'warn', meeting: 'brand', reminder: 'accent', event: 'neutral' };

// ───────────── نافذة المهمة ─────────────
function TaskDialog({ open, onOpenChange, task, defaultDate }: { open: boolean; onOpenChange: (o: boolean) => void; task: TaskDto | null; defaultDate?: string }) {
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const [v, setV] = useState({ title: '', description: '', kind: 'task' as TaskKind, dueDate: '', dueTime: '', priority: 'normal' as TaskPriority, assignmentId: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setV(task
      ? { title: task.title, description: task.description ?? '', kind: task.kind, dueDate: task.dueDate ?? '', dueTime: task.dueTime ?? '', priority: task.priority, assignmentId: task.assignmentId ?? '' }
      : { title: '', description: '', kind: 'task', dueDate: defaultDate ?? '', dueTime: '', priority: 'normal', assignmentId: '' });
  }, [open, task, defaultDate]);

  const body = { title: v.title.trim(), description: v.description.trim() || null, kind: v.kind, dueDate: v.dueDate || null, dueTime: v.dueDate && v.dueTime ? v.dueTime : null, priority: v.priority, assignmentId: v.assignmentId || null };
  const parsed = createTaskSchema.safeParse(body);
  const save = useAppMutation(() => (task ? api.patch(`/tasks/${task.id}`, body) : api.post('/tasks', body)), {
    invalidate: [['tasks'], ['calendar'], qk.dashboard],
    success: task ? 'حُفظت المهمة' : 'أُضيفت المهمة',
    silentError: true,
    onSuccess: () => onOpenChange(false),
    onError: (e) => setError(errorMessage(e)),
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={task ? 'تعديل المهمة' : 'مهمة جديدة'}
      description="مهمة أو اختبار أو اجتماع أو تذكير — يظهر في لوحة التحكم والتقويم."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="primary" disabled={!parsed.success} loading={save.isPending} onClick={() => save.mutate()}>{task ? 'حفظ' : 'إضافة'}</Button></>}
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (parsed.success) save.mutate(); }}>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="العنوان" required>{(p) => <Input {...p} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} autoFocus maxLength={200} placeholder="مثال: تصحيح الاختبار القصير" />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="النوع">{(p) => <Select {...p} value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value as TaskKind })}>{TASK_KIND.items.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</Select>}</Field>
          <Field label="الأولوية">{(p) => <Select {...p} value={v.priority} onChange={(e) => setV({ ...v, priority: e.target.value as TaskPriority })}>{TASK_PRIORITY.items.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</Select>}</Field>
          <Field label="الموعد">{(p) => <Input {...p} type="date" value={v.dueDate} onChange={(e) => setV({ ...v, dueDate: e.target.value })} />}</Field>
          <Field label="الوقت" hint={v.dueDate ? undefined : 'اختر الموعد أولًا'}>{(p) => <Input {...p} type="time" value={v.dueTime} disabled={!v.dueDate} onChange={(e) => setV({ ...v, dueTime: e.target.value })} />}</Field>
        </div>
        <Field label="مرتبطة بشعبة / مادة (اختياري)">{(p) => <Select {...p} value={v.assignmentId} onChange={(e) => setV({ ...v, assignmentId: e.target.value })}><option value="">غير مرتبطة</option>{(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}</Select>}</Field>
        <Field label="تفاصيل">{(p) => <Textarea {...p} rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />}</Field>
      </form>
    </Modal>
  );
}

// ───────────── تبويب المهام ─────────────
function TasksTab({ onEdit, onNew }: { onEdit: (t: TaskDto) => void; onNew: () => void }) {
  const fmt = useFmt();
  const confirm = useConfirm();
  const today = todayISO();
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open');
  const [quick, setQuick] = useState('');
  const q = useQuery({ queryKey: qk.tasks({ filter }), queryFn: () => api.get<TaskDto[]>('/tasks', { status: filter === 'all' ? undefined : filter, limit: 300 }) });
  const toggle = useAppMutation((t: TaskDto) => api.patch(`/tasks/${t.id}`, { status: t.status === 'done' ? 'open' : 'done' }), { invalidate: [['tasks'], ['calendar'], qk.dashboard] });
  const remove = useAppMutation((id: string) => api.del(`/tasks/${id}`), { invalidate: [['tasks'], ['calendar'], qk.dashboard], success: 'حُذفت المهمة' });
  const add = useAppMutation((title: string) => api.post('/tasks', { title, kind: 'task', priority: 'normal', status: 'open' }), { invalidate: [['tasks'], qk.dashboard], onSuccess: () => setQuick('') });

  const groups = useMemo(() => {
    const list = q.data ?? [];
    const open = list.filter((t) => t.status === 'open');
    return [
      { key: 'overdue', title: 'متأخرة', tone: 'bad' as const, items: open.filter((t) => t.dueDate && t.dueDate < today) },
      { key: 'today', title: 'اليوم', tone: 'warn' as const, items: open.filter((t) => t.dueDate === today) },
      { key: 'upcoming', title: 'قادمة', tone: 'info' as const, items: open.filter((t) => t.dueDate && t.dueDate > today) },
      { key: 'nodate', title: 'بلا موعد', tone: 'neutral' as const, items: open.filter((t) => !t.dueDate) },
      { key: 'done', title: 'منجزة', tone: 'good' as const, items: list.filter((t) => t.status === 'done') },
    ].filter((g) => g.items.length);
  }, [q.data, today]);

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form className="flex min-w-72 flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); if (quick.trim()) add.mutate(quick.trim()); }}>
          <Input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="أضف مهمة سريعة واضغط Enter…" aria-label="مهمة سريعة" disabled={add.isPending} />
          <Button type="submit" variant="primary" disabled={!quick.trim()} loading={add.isPending}>إضافة</Button>
        </form>
        <Button variant="secondary" icon={<Plus className="size-4" />} onClick={onNew}>مهمة بتفاصيلها</Button>
        <Segmented value={filter} onChange={setFilter} label="تصفية" size="sm" options={[{ value: 'open', label: 'المفتوحة' }, { value: 'done', label: 'المنجزة' }, { value: 'all', label: 'الكل' }]} />
      </div>
      {q.error ? <QueryError error={q.error} onRetry={() => void q.refetch()} /> : q.isPending ? <PageLoader /> : groups.length === 0 ? (
        <EmptyState icon={<ListChecks className="size-7" />} title={filter === 'done' ? 'لا مهام منجزة بعد' : 'لا مهام مفتوحة'} description="أضف مهامك ومواعيدك هنا لتظهر في لوحة التحكم والتقويم الدراسي." />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.key}>
              <div className="mb-2 flex items-center gap-2"><Badge tone={g.tone}>{g.title}</Badge><span className="text-[13px] text-muted tnum">{fmt.num(g.items.length)}</span></div>
              <Card className="divide-y divide-line">
                {g.items.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 px-4 py-3">
                    <button
                      onClick={() => toggle.mutate(t)}
                      className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border transition-colors', t.status === 'done' ? 'border-good bg-good text-brand-fg' : 'border-line-strong text-transparent hover:border-brand hover:text-brand')}
                      aria-label={t.status === 'done' ? `إعادة فتح: ${t.title}` : `إنجاز: ${t.title}`}
                    >
                      <Check className="size-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={cn('text-[15.5px] font-medium', t.status === 'done' ? 'text-muted line-through' : 'text-ink')}>{t.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                        <Badge tone={kindTone[t.kind]} className="px-2 py-0 text-[12px]">{TASK_KIND.labels[t.kind]}</Badge>
                        {t.dueDate ? <span className="tnum">{weekdayName(weekdayOf(t.dueDate))} {fmt.date(t.dueDate, 'medium')}{t.dueTime ? ` · ${fmt.time(t.dueTime)}` : ''}</span> : null}
                        {t.assignmentLabel ? <span>{t.assignmentLabel}</span> : null}
                        {t.priority === 'high' ? <span className="inline-flex items-center gap-1 text-bad"><Flag className="size-3.5" /> أولوية مرتفعة</span> : null}
                      </div>
                      {t.description ? <p className="mt-1 text-[14px] text-ink-2">{t.description}</p> : null}
                    </div>
                    <div className="flex shrink-0">
                      <IconButton label="تعديل" size="iconSm" onClick={() => onEdit(t)}><Pencil className="size-4" /></IconButton>
                      <IconButton label="حذف" size="iconSm" className="hover:text-bad" onClick={async () => { if (await confirm({ title: `حذف «${t.title}»؟`, confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(t.id); }}><Trash2 className="size-4" /></IconButton>
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────── التقويم الشهري ─────────────
const itemTone: Record<CalendarItemDto['tone'], string> = {
  neutral: 'bg-surface-3 text-ink-2',
  info: 'bg-info-soft text-info',
  good: 'bg-good-soft text-good',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
};

function CalendarTab({ onNewOn }: { onNewOn: (date: string) => void }) {
  const fmt = useFmt();
  const today = todayISO();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const gridStart = startOfWeek(month);
  const weeks = Math.ceil((((new Date(`${endOfMonth(month)}T00:00:00Z`).getTime() - new Date(`${gridStart}T00:00:00Z`).getTime()) / 86_400_000) + 1) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const from = days[0]!;
  const to = days[days.length - 1]!;
  const q = useQuery({ queryKey: qk.calendar(from, to), queryFn: () => api.get<CalendarItemDto[]>('/calendar', { from, to }) });
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarItemDto[]>();
    for (const it of q.data ?? []) m.set(it.date, [...(m.get(it.date) ?? []), it]);
    return m;
  }, [q.data]);
  const dayItems = byDay.get(selected) ?? [];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-[18px] font-semibold text-ink">{formatMonthYear(month, fmt.digits)}</h2>
          <div className="flex items-center gap-1.5">
            <IconButton label="الشهر السابق" variant="secondary" size="iconSm" onClick={() => setMonth(startOfMonth(addDays(month, -1)))}><ChevronRight className="size-4" /></IconButton>
            <Button variant="secondary" size="sm" onClick={() => { setMonth(startOfMonth(today)); setSelected(today); }}>اليوم</Button>
            <IconButton label="الشهر التالي" variant="secondary" size="iconSm" onClick={() => setMonth(startOfMonth(addDays(endOfMonth(month), 1)))}><ChevronLeft className="size-4" /></IconButton>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-line bg-surface-3 text-center text-[13px] font-medium text-muted">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className={cn('py-2', (i === 5 || i === 6) && 'text-muted')}>{weekdayName(i)}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const items = byDay.get(d) ?? [];
            const inMonth = isBetween(d, month, endOfMonth(month));
            const weekend = weekdayOf(d) === 5 || weekdayOf(d) === 6;
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                aria-label={`${fmt.date(d, 'long')}${items.length ? `، ${items.length} عناصر` : ''}`}
                aria-pressed={selected === d}
                className={cn('min-h-[92px] border-b border-s border-line p-1.5 text-start align-top transition-colors hover:bg-surface-2', i % 7 === 0 && 'border-s-0', !inMonth && 'bg-surface-2/60 text-muted/60', weekend && inMonth && 'bg-surface-2/40', selected === d && 'ring-2 ring-inset ring-brand')}
              >
                <span className={cn('mb-1 inline-grid size-6 place-items-center rounded-full text-[13px] tnum', d === today ? 'bg-brand font-bold text-brand-fg' : 'text-ink-2')}>{fmt.num(Number(d.slice(8)))}</span>
                <div className="space-y-0.5">
                  {items.slice(0, 3).map((it) => <div key={it.id} className={cn('truncate rounded px-1.5 py-px text-[11.5px] leading-4', itemTone[it.tone], it.done && 'line-through')}>{it.title}</div>)}
                  {items.length > 3 ? <div className="px-1 text-[11px] text-muted">+{fmt.num(items.length - 3)} أخرى</div> : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title={fmt.date(selected, 'full')} action={<Button variant="soft" size="sm" icon={<Plus className="size-4" />} onClick={() => onNewOn(selected)}>مهمة</Button>} />
        <div className="px-5 pb-5">
          {q.isPending ? <PageLoader /> : dayItems.length === 0 ? <p className="py-6 text-center text-[14.5px] text-muted">لا شيء في هذا اليوم.</p> : (
            <ul className="space-y-2">
              {dayItems.map((it) => (
                <li key={it.id}>
                  <Link to={it.href} className="flex items-start gap-2.5 rounded-xl border border-line p-3 transition-colors hover:bg-surface-2">
                    <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', { neutral: 'bg-muted', info: 'bg-info', good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad' }[it.tone])} />
                    <span className="min-w-0 text-[14.5px]">
                      <span className={cn('block font-medium', it.done ? 'text-muted line-through' : 'text-ink')}>{it.title}</span>
                      <span className="block text-[12.5px] text-muted">{{ task: 'مهمة', assessment: 'تقويم', lesson: 'تحضير', support: 'متابعة خطة' }[it.type]}{it.time ? ` · ${fmt.time(it.time)}` : ''}{it.subtitle ? ` · ${it.subtitle}` : ''}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function TasksPage() {
  const [dialog, setDialog] = useState<{ task: TaskDto | null; date?: string } | null>(null);
  return (
    <>
      <PageHeader title="المهام والتقويم الدراسي" description="نظّم مهامك ومواعيدك، وشاهد الاختبارات والتحضير والتقويمات في تقويم واحد." actions={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setDialog({ task: null })}>مهمة جديدة</Button>} />
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks"><ListChecks className="size-4" /> المهام</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="size-4" /> التقويم الدراسي</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks"><TasksTab onEdit={(t) => setDialog({ task: t })} onNew={() => setDialog({ task: null })} /></TabsContent>
        <TabsContent value="calendar"><CalendarTab onNewOn={(date) => setDialog({ task: null, date })} /></TabsContent>
      </Tabs>
      <TaskDialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)} task={dialog?.task ?? null} defaultDate={dialog?.date} />
    </>
  );
}

