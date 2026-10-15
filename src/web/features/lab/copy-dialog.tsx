import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus, Plus, Trash2 } from 'lucide-react';
import { MAX_PERIODS } from '@shared/constants';
import { addDays, todayISO, weekdayOf } from '@shared/dates';
import type { LabActivitySummaryDto, SlotDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { api } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments } from '@/lib/queries';
import { Button, IconButton, Input, Modal, Select } from '@/components/ui';

type Target = { assignmentId: string; date: string; period: string };

/** أول تاريخ في أو بعد `from` يوافق يوم الأسبوع المعطى */
function nextOccurrence(from: string, weekday: number): string {
  for (let i = 0; i < 7; i++) {
    const d = addDays(from, i);
    if (weekdayOf(d) === weekday) return d;
  }
  return from;
}

/**
 * نسخ خطة النشاط إلى شعب وتواريخ أخرى (كأنشطة «مخطَّطة»). الاقتراح الذكي يستخدم الجدول الأسبوعي:
 * لكل شعبة موازية (الصف والمادة نفسهما) يقترح أقرب حصة قادمة فعلًا في جدولها، فلا يكتب المعلم التواريخ يدويًا.
 */
export function LabCopyDialog({ activity, onClose }: { activity: LabActivitySummaryDto | null; onClose: () => void }) {
  const { year } = useAcademic();
  const fmt = useFmt();
  const assignments = useAssignments(year?.id);
  const slots = useQuery({ queryKey: qk.timetable(year?.id), queryFn: () => api.get<SlotDto[]>('/timetable', { yearId: year?.id }), enabled: !!activity && !!year });
  const [targets, setTargets] = useState<Target[]>([]);

  const today = todayISO();
  const from = activity ? (activity.date >= today ? activity.date : today) : today;

  useEffect(() => {
    if (activity) setTargets([{ assignmentId: activity.assignmentId ?? '', date: addDays(from, 7), period: '' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- عند فتح النافذة لنشاط جديد فقط
  }, [activity?.id]);

  const all = useMemo(() => assignments.data ?? [], [assignments.data]);
  const mine = all.find((a) => a.id === activity?.assignmentId);
  const parallel = useMemo(() => (mine ? all.filter((a) => a.id !== mine.id && a.subjectId === mine.subjectId && a.gradeLevel === mine.gradeLevel) : []), [all, mine]);

  const suggest = () => {
    const rows = parallel.map((a): Target => {
      const own = (slots.data ?? []).filter((s) => s.assignment.id === a.id);
      const best = own
        .map((s) => ({ date: nextOccurrence(from, s.weekday), period: s.period }))
        .sort((x, y) => (x.date === y.date ? x.period - y.period : x.date < y.date ? -1 : 1))[0];
      return { assignmentId: a.id, date: best?.date ?? from, period: best ? String(best.period) : '' };
    });
    setTargets(rows.sort((x, y) => (x.date === y.date ? Number(x.period || 99) - Number(y.period || 99) : x.date < y.date ? -1 : 1)));
  };

  const update = (i: number, patch: Partial<Target>) => setTargets((t) => t.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const copy = useAppMutation(
    () =>
      api.post<LabActivitySummaryDto[]>(`/lab-activities/${activity!.id}/copy`, {
        targets: targets.map((t) => ({ assignmentId: t.assignmentId || null, date: t.date, period: t.period ? Number(t.period) : null })),
      }),
    {
      invalidate: [['lab'], ['dashboard'], ['calendar']],
      success: (r) => `نُسخ النشاط إلى ${fmt.num(r.length, 0)} ${r.length === 1 ? 'وجهة' : 'وجهات'} كأنشطة مخطَّطة`,
      onSuccess: onClose,
    },
  );

  const valid = targets.length > 0 && targets.every((t) => !!t.date);

  return (
    <Modal
      open={!!activity}
      onOpenChange={(o) => !o && onClose()}
      size="lg"
      title="نسخ النشاط"
      description={activity ? `«${activity.title}» — تُنسخ خطته (الأهداف والمواد والسلامة والخطوات) كأنشطة مخطَّطة جديدة، دون النتائج والمشاركين.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" disabled={!valid} loading={copy.isPending} onClick={() => copy.mutate()}>نسخ إلى {fmt.num(targets.length, 0)} {targets.length === 1 ? 'وجهة' : 'وجهات'}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="hidden grid-cols-[1.4fr_1fr_6rem_2.25rem] gap-2 px-1 text-[13px] text-muted sm:grid"><span>الشعبة والمادة</span><span>التاريخ</span><span>الحصة</span><span /></div>
        {targets.map((t, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-line p-2.5 sm:grid-cols-[1.4fr_1fr_6rem_2.25rem] sm:border-0 sm:p-0" data-testid="lab-copy-target">
            <Select value={t.assignmentId} onChange={(e) => update(i, { assignmentId: e.target.value })} aria-label="الشعبة والمادة" className="col-span-2 sm:col-span-1">
              <option value="">نشاط عام (بلا شعبة)</option>
              {/* مصدر من عام دراسي آخر: نُبقي مقرره خيارًا كي لا يظهر «عامًّا» وهو مرتبط بشعبة */}
              {activity?.assignmentId && !mine ? <option value={activity.assignmentId}>{activity.sectionLabel} — {activity.subjectName}</option> : null}
              {all.map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
            </Select>
            <Input type="date" value={t.date} onChange={(e) => update(i, { date: e.target.value })} aria-label="التاريخ" />
            <Select value={t.period} onChange={(e) => update(i, { period: e.target.value })} aria-label="الحصة">
              <option value="">الحصة…</option>
              {Array.from({ length: MAX_PERIODS }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{fmt.num(n, 0)}</option>)}
            </Select>
            <IconButton label="إزالة الوجهة" className="hover:text-bad" onClick={() => setTargets((x) => x.filter((_, j) => j !== i))} disabled={targets.length === 1}><Trash2 className="size-4" /></IconButton>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="soft" size="sm" icon={<Plus className="size-4" />} onClick={() => setTargets((t) => [...t, { assignmentId: activity?.assignmentId ?? '', date: t[t.length - 1]?.date ?? from, period: '' }])}>إضافة وجهة</Button>
          {parallel.length ? (
            <Button variant="soft" size="sm" icon={<CalendarPlus className="size-4" />} loading={slots.isPending} onClick={suggest}>
              اقتراح من الجدول: شعب الصف {fmt.num(mine!.gradeLevel, 0)} في {mine!.subjectName} ({fmt.num(parallel.length, 0)})
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
