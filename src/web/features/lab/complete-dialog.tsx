import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toWesternDigits } from '@shared/arabic';
import { todayISO } from '@shared/dates';
import type { LabActivityDto, LabActivitySummaryDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { api, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments, useSections } from '@/lib/queries';
import { Alert, Button, Field, Input, Modal, PageLoader, QueryError, Textarea } from '@/components/ui';

/** تسجيل التنفيذ بسرعة بعد الحصة: التاريخ الفعلي وعدد المشاركين والنتائج — دون فتح النموذج الكامل */
export function CompleteDialog({ activity, onClose }: { activity: LabActivitySummaryDto | null; onClose: () => void }) {
  const detail = useQuery({ queryKey: qk.labItem(activity?.id ?? ''), queryFn: () => api.get<LabActivityDto>(`/lab-activities/${activity!.id}`), enabled: !!activity, gcTime: 0, staleTime: 0 });
  if (!activity) return null;
  if (!detail.data) {
    return (
      <Modal open onOpenChange={(o) => !o && onClose()} title="تسجيل التنفيذ" size="md">
        {detail.error ? <QueryError error={detail.error} onRetry={() => void detail.refetch()} /> : <PageLoader />}
      </Modal>
    );
  }
  return <CompleteForm key={activity.id} activity={detail.data} onClose={onClose} />;
}

function CompleteForm({ activity, onClose }: { activity: LabActivityDto; onClose: () => void }) {
  const fmt = useFmt();
  const today = todayISO();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const sections = useSections(year?.id);
  const sectionId = assignments.data?.find((a) => a.id === activity.assignmentId)?.sectionId;
  const studentCount = sections.data?.find((s) => s.id === sectionId)?.studentCount ?? 0;

  // الافتراضي: موعد النشاط المخطَّط، أو اليوم إن كان الموعد في المستقبل
  const [date, setDate] = useState(activity.date <= today ? activity.date : today);
  const [participants, setParticipants] = useState(activity.participants === null ? '' : String(activity.participants));
  const [results, setResults] = useState(activity.results ?? '');
  const [notes, setNotes] = useState(activity.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const count = participants.trim() ? Number(toWesternDigits(participants).trim()) : null;
  const countInvalid = count !== null && (!Number.isInteger(count) || count < 0 || count > 2000 || !/^\d+$/.test(toWesternDigits(participants).trim()));
  const dateInvalid = !date || date > today;

  const save = useAppMutation(
    () => api.patch<LabActivityDto>(`/lab-activities/${activity.id}`, { status: 'done', date, participants: count, results: results.trim() || null, notes: notes.trim() || null }),
    {
      invalidate: [['lab'], qk.dashboard, ['calendar']],
      success: 'سُجِّل تنفيذ النشاط',
      silentError: true,
      onSuccess: onClose,
      onError: (e) => setError(errorMessage(e)),
    },
  );

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      size="md"
      title="تسجيل التنفيذ"
      description={`${activity.title}${activity.sectionLabel ? ` — ${activity.sectionLabel}` : ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" loading={save.isPending} disabled={countInvalid || dateInvalid} onClick={() => { setError(null); save.mutate(); }}>تم التنفيذ</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="تاريخ التنفيذ الفعلي" required error={dateInvalid ? (date ? 'لا يمكن تسجيل تنفيذ بتاريخ لم يحن بعد' : 'مطلوب') : undefined}>
            {(p) => <Input {...p} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} />}
          </Field>
          <Field
            label="عدد الطلاب المشاركين"
            error={countInvalid ? 'أدخل عددًا صحيحًا بين 0 و2000' : undefined}
            hint={
              studentCount ? (
                <button type="button" className="font-medium text-brand underline underline-offset-2" onClick={() => setParticipants(String(studentCount))}>
                  كل طلاب الشعبة ({fmt.num(studentCount, 0)})
                </button>
              ) : undefined
            }
          >
            {(p) => <Input {...p} inputMode="numeric" placeholder="0" maxLength={4} autoFocus value={participants} onChange={(e) => setParticipants(e.target.value)} />}
          </Field>
        </div>
        <Field label="النتائج والملاحظات">{(p) => <Textarea {...p} rows={3} placeholder="ماذا لوحظ؟ هل تحققت الأهداف؟" value={results} onChange={(e) => setResults(e.target.value)} />}</Field>
        <Field label="معوّقات وتوصيات">{(p) => <Textarea {...p} rows={2} placeholder="ما الذي يُحسَّن في المرة القادمة؟" value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
      </div>
    </Modal>
  );
}
