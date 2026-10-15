import { useEffect, useState } from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { addDays, todayISO } from '@shared/dates';
import type { LessonSummaryDto } from '@shared/dto';
import { MAX_PERIODS } from '@shared/constants';
import { useNavigate } from 'react-router';
import { useAcademic } from '@/context/academic';
import { api } from '@/lib/api';
import { useAppMutation } from '@/lib/mutation';
import { useFmt } from '@/lib/hooks';
import { useAssignments } from '@/lib/queries';
import { Button, IconButton, Input, Modal, Select } from '@/components/ui';

type Target = { assignmentId: string; date: string; period: string };

/** نسخ التحضير: إلى شعب وتواريخ وحصص متعددة دفعة واحدة (كمسودات جديدة) */
export function LessonCopyDialog({ lesson, onClose, defaultDate }: { lesson: LessonSummaryDto | null; onClose: () => void; defaultDate?: string }) {
  const { year } = useAcademic();
  const fmt = useFmt();
  const navigate = useNavigate();
  const assignments = useAssignments(year?.id);
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    if (lesson) setTargets([{ assignmentId: lesson.assignmentId, date: defaultDate ?? addDays(todayISO(), 7), period: '' }]);
  }, [lesson, defaultDate]);

  const all = assignments.data ?? [];
  const mine = all.find((a) => a.id === lesson?.assignmentId);
  const sameSubject = all.filter((a) => mine && a.subjectId === mine.subjectId);
  const update = (i: number, patch: Partial<Target>) => setTargets((t) => t.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const copy = useAppMutation(
    () => api.post<LessonSummaryDto[]>(`/lessons/${lesson!.id}/copy`, { targets: targets.map((t) => ({ assignmentId: t.assignmentId, date: t.date, period: t.period ? Number(t.period) : null })) }),
    {
      invalidate: [['lessons'], ['dashboard']],
      success: (r) => `نُسخ التحضير إلى ${fmt.num(r.length)} ${r.length === 1 ? 'وجهة' : 'وجهات'} كمسودات`,
      onSuccess: (r) => {
        onClose();
        if (r.length === 1) void navigate(`/lessons/${r[0]!.id}`);
      },
    },
  );

  const valid = targets.length > 0 && targets.every((t) => t.assignmentId && t.date);

  return (
    <Modal
      open={!!lesson}
      onOpenChange={(o) => !o && onClose()}
      size="lg"
      title="نسخ التحضير"
      description={lesson ? `«${lesson.title}» — تُنسخ كل محتوياته كمسودات جديدة، دون التأمل بعد التنفيذ.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" disabled={!valid} loading={copy.isPending} onClick={() => copy.mutate()}>نسخ إلى {fmt.num(targets.length)} {targets.length === 1 ? 'وجهة' : 'وجهات'}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="hidden grid-cols-[1.4fr_1fr_6rem_2.25rem] gap-2 px-1 text-[13px] text-muted sm:grid"><span>الشعبة والمادة</span><span>التاريخ</span><span>الحصة</span><span /></div>
        {targets.map((t, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-line p-2.5 sm:grid-cols-[1.4fr_1fr_6rem_2.25rem] sm:border-0 sm:p-0">
            <Select value={t.assignmentId} onChange={(e) => update(i, { assignmentId: e.target.value })} aria-label="الشعبة والمادة" className="col-span-2 sm:col-span-1">
              {all.map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
            </Select>
            <Input type="date" value={t.date} onChange={(e) => update(i, { date: e.target.value })} aria-label="التاريخ" />
            <Select value={t.period} onChange={(e) => update(i, { period: e.target.value })} aria-label="الحصة">
              <option value="">الحصة…</option>
              {Array.from({ length: MAX_PERIODS }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{fmt.num(n)}</option>)}
            </Select>
            <IconButton label="إزالة" className="hover:text-bad" onClick={() => setTargets((x) => x.filter((_, j) => j !== i))} disabled={targets.length === 1}><Trash2 className="size-4" /></IconButton>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="soft" size="sm" icon={<Plus className="size-4" />} onClick={() => setTargets((t) => [...t, { assignmentId: lesson!.assignmentId, date: t[t.length - 1]?.date ?? todayISO(), period: '' }])}>إضافة وجهة</Button>
          {sameSubject.length > 1 ? (
            <Button
              variant="soft"
              size="sm"
              icon={<Layers className="size-4" />}
              onClick={() => setTargets(sameSubject.map((a) => ({ assignmentId: a.id, date: targets[0]?.date ?? todayISO(), period: '' })))}
            >
              كل شعب مادة {mine?.subjectName} ({fmt.num(sameSubject.length)})
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
