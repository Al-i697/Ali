import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, MapPin, Plus, X } from 'lucide-react';
import { WEEKDAYS, weekdayName } from '@shared/constants';
import type { AssignmentDto, SlotDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments } from '@/lib/queries';
import { Badge, Button, Card, CardHeader, EmptyState, Input, Modal, PageHeader, PageLoader, QueryError, SubjectChip } from '@/components/ui';

type Cell = { weekday: number; period: number } | null;

function SlotModal({ cell, slot, assignments, yearId, onClose }: { cell: Cell; slot: SlotDto | undefined; assignments: AssignmentDto[]; yearId: string; onClose: () => void }) {
  const fmt = useFmt();
  const [room, setRoom] = useState(slot?.room ?? '');
  const put = useAppMutation(
    (assignmentId: string | null) => api.put('/timetable/slot', { yearId, weekday: cell!.weekday, period: cell!.period, assignmentId, room: assignmentId ? room.trim() || null : null }),
    { invalidate: [qk.timetable(yearId), qk.dashboard, ['lessons']], onSuccess: onClose },
  );
  return (
    <Modal
      open={!!cell}
      onOpenChange={(o) => !o && onClose()}
      size="md"
      title={cell ? `${weekdayName(cell.weekday)} — الحصة ${fmt.num(cell.period)}` : ''}
      description="اختر المقرر الذي تدرّسه في هذه الحصة. يُحفظ فور الاختيار."
      footer={slot ? <Button variant="dangerSoft" loading={put.isPending} onClick={() => put.mutate(null)} icon={<X className="size-4" />}>إفراغ الحصة</Button> : undefined}
    >
      <div className="mb-4">
        <label htmlFor="room" className="mb-1.5 block text-sm font-medium text-ink-2">القاعة / المعمل (اختياري)</label>
        <div className="relative"><MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="مثال: معمل العلوم" className="ps-9" maxLength={30} /></div>
      </div>
      {assignments.length === 0 ? (
        <EmptyState icon={<CalendarClock className="size-6" />} title="لا مقررات بعد" description="أضف شعبة ومادة أولًا." className="py-8" action={<Link to="/classes" className="text-brand underline">الذهاب إلى الشعب</Link>} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {assignments.map((a) => {
            const on = slot?.assignment.id === a.id;
            return (
              <button
                key={a.id}
                disabled={put.isPending}
                onClick={() => put.mutate(a.id)}
                className={cn(`subj-${a.subjectColor} flex items-center gap-3 rounded-xl border p-3 text-start transition-colors`, on ? 'border-[var(--c)] bg-[var(--c-soft)]' : 'border-line hover:border-line-strong hover:bg-surface-2')}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-[var(--c-soft)] text-[15px] font-bold text-[var(--c)] tnum">{a.sectionLabel}</span>
                <span className="min-w-0"><span className="block font-medium text-ink">{a.subjectName}</span><span className="text-[12.5px] text-muted">{a.sectionLabel}</span></span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default function TimetablePage() {
  const fmt = useFmt();
  const { year } = useAcademic();
  const { settings } = useAuth();
  const assignmentsQ = useAssignments(year?.id);
  const q = useQuery({ queryKey: qk.timetable(year?.id), queryFn: () => api.get<SlotDto[]>('/timetable', { yearId: year!.id }), enabled: !!year });
  const [cell, setCell] = useState<Cell>(null);

  if (!year) return <><PageHeader title="الجدول الأسبوعي" /><EmptyState icon={<CalendarClock className="size-7" />} title="أنشئ عامًا دراسيًا أولًا" description="يرتبط الجدول بالعام الدراسي." action={<Link to="/classes" className="text-brand underline">الذهاب إلى الشعب</Link>} /></>;
  if (q.isPending || assignmentsQ.isPending) return <PageLoader />;
  if (q.error) return <QueryError error={q.error} onRetry={() => void q.refetch()} />;

  const slots = q.data ?? [];
  const assignments = assignmentsQ.data ?? [];
  const periodsCfg = settings?.schedule.periods ?? [];
  const workDays = settings?.schedule.workDays ?? [0, 1, 2, 3, 4];
  const days = [...new Set([...workDays, ...slots.map((s) => s.weekday)])].sort((a, b) => a - b);
  const periodCount = Math.max(periodsCfg.length || 8, ...slots.map((s) => s.period));
  const periods = Array.from({ length: periodCount }, (_, i) => i + 1);
  const slotAt = (weekday: number, period: number) => slots.find((s) => s.weekday === weekday && s.period === period);
  const placed = new Map<string, number>();
  for (const s of slots) placed.set(s.assignment.id, (placed.get(s.assignment.id) ?? 0) + 1);

  return (
    <>
      <PageHeader title="الجدول الأسبوعي" description={<>جدول حصصك للعام الدراسي <b className="tnum text-ink-2">{year.name}</b>. يعتمد عليه عرض «حصص اليوم» وتحضير الأسبوع في لوحة التحكم.</>} />
      {slots.length === 0 ? <Card className="mb-5 flex items-center gap-3 border-brand/30 bg-brand-soft/50 p-4 text-[14.5px] text-brand"><CalendarClock className="size-5 shrink-0" />انقر على أي خانة لإضافة حصة. تُحفظ فورًا.</Card> : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="overflow-hidden">
          <div className="scroll-x">
            <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0 text-[14px]">
              <thead>
                <tr className="bg-surface-3">
                  <th className="w-36 border-b border-line px-3 py-3 text-start text-[13px] font-medium text-muted">الحصة</th>
                  {days.map((d) => <th key={d} className="border-b border-s border-line px-3 py-3 text-center text-[14.5px] font-semibold text-ink">{WEEKDAYS[d]!.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => {
                  const t = periodsCfg.find((x) => x.n === p);
                  return (
                    <tr key={p}>
                      <th scope="row" className="border-b border-line bg-surface-2 px-3 py-2 text-start align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-lg bg-surface-3 text-[15px] font-bold tnum text-ink-2">{fmt.num(p)}</span>
                          {t ? <span className="whitespace-nowrap text-[12px] font-normal leading-4 text-muted tnum"><span className="block">{fmt.time(t.start)}</span><span className="block">{fmt.time(t.end)}</span></span> : null}
                        </div>
                      </th>
                      {days.map((d) => {
                        const s = slotAt(d, p);
                        return (
                          <td key={d} className="h-[76px] border-b border-s border-line p-1.5">
                            <button
                              onClick={() => setCell({ weekday: d, period: p })}
                              aria-label={`${WEEKDAYS[d]!.name} الحصة ${p}${s ? `: ${s.assignment.subjectName} ${s.assignment.sectionLabel}` : ' فارغة'}`}
                              className={cn(
                                'flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 text-center transition-colors',
                                s ? `subj-${s.assignment.subjectColor} bg-[var(--c-soft)] hover:brightness-95 dark:hover:brightness-125` : 'border border-dashed border-transparent text-transparent hover:border-line-strong hover:bg-surface-2 hover:text-muted focus-visible:border-line-strong focus-visible:text-muted',
                              )}
                            >
                              {s ? (
                                <>
                                  <span className="text-[16px] font-bold leading-5 text-[var(--c)] tnum">{s.assignment.sectionLabel}</span>
                                  <span className="max-w-full truncate text-[12.5px] leading-4 text-[var(--c)]">{s.assignment.subjectName}</span>
                                  {s.room ? <span className="flex items-center gap-0.5 text-[11.5px] text-muted"><MapPin className="size-3" />{s.room}</span> : null}
                                </>
                              ) : <Plus className="size-5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="توزيع الحصص" description="الحصص الموضوعة مقابل المخطط لها أسبوعيًا" />
          <ul className="space-y-2.5 px-5 pb-5">
            {assignments.length === 0 ? <li className="text-[14px] text-muted">لا مقررات.</li> : assignments.map((a) => {
              const n = placed.get(a.id) ?? 0;
              const target = a.weeklyPeriods;
              return (
                <li key={a.id} className="flex items-center justify-between gap-2 text-[14px]">
                  <span className="flex min-w-0 items-center gap-2"><b className="tnum">{a.sectionLabel}</b><SubjectChip name={a.subjectName} color={a.subjectColor} /></span>
                  <Badge tone={target == null ? 'neutral' : n === target ? 'good' : n > target ? 'warn' : 'info'} className="tnum">{fmt.num(n)}{target != null ? ` / ${fmt.num(target)}` : ''}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <SlotModal key={cell ? `${cell.weekday}-${cell.period}` : 'x'} cell={cell} slot={cell ? slotAt(cell.weekday, cell.period) : undefined} assignments={assignments} yearId={year.id} onClose={() => setCell(null)} />
    </>
  );
}
