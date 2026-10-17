import { useState } from 'react';
import { CLASS_LIMITS, CLASS_REASON_PRESETS, CLASS_RECORD_KIND, type ClassRecordKind } from '@shared/constants';
import type { ClassRecordDto } from '@shared/dto';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Button, Field, Input, Modal, Segmented, Textarea } from '@/components/ui';
import { recordIcon } from './shared';

export type RecordTarget = {
  studentId: string;
  studentName: string;
  /** النوع الابتدائي (يمكن تغييره داخل النافذة) */
  kind: ClassRecordKind;
  /** موجود ⇒ تعديل تسجيل قائم، وغيابه ⇒ تسجيل جديد في الحصة */
  record?: ClassRecordDto;
  session: { assignmentId: string | null; date: string; period: number | null };
};

const heading: Record<ClassRecordKind, string> = {
  negative: 'سلوك غير حسن',
  positive: 'سلوك إيجابي',
  note: 'ملاحظة',
};

function Form({ target, onClose }: { target: RecordTarget; onClose: () => void }) {
  const edit = target.record;
  const [kind, setKind] = useState<ClassRecordKind>(edit?.kind ?? target.kind);
  const [reason, setReason] = useState(edit?.reason ?? '');
  const [note, setNote] = useState(edit?.note ?? '');

  const presets = CLASS_REASON_PRESETS[kind];
  const isPreset = presets.includes(reason);
  const canSave = reason.trim().length > 0 || note.trim().length > 0;

  const changeKind = (next: ClassRecordKind) => {
    // سبب جاهز من نوع آخر لا يبقى؛ أما ما كتبه المعلم بنفسه فيبقى
    if (CLASS_REASON_PRESETS[kind].includes(reason)) setReason('');
    setKind(next);
  };

  const save = useAppMutation(
    () => {
      const body = { kind, reason: reason.trim() || null, note: note.trim() || null };
      if (edit) return api.patch<ClassRecordDto>(`/class/records/${edit.id}`, body);
      return api.post<ClassRecordDto>('/class/records', { ...body, studentId: target.studentId, assignmentId: target.session.assignmentId, date: target.session.date, period: target.session.period });
    },
    { invalidate: [['class'], qk.dashboard], success: edit ? 'حُدّث التسجيل' : 'سُجِّل', onSuccess: onClose },
  );

  const submit = () => {
    if (canSave && !save.isPending) save.mutate();
  };

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      size="md"
      title={edit ? `تعديل التسجيل — ${target.studentName}` : `${heading[target.kind]} — ${target.studentName}`}
      description="اختر سببًا جاهزًا أو اكتب ما حدث. يُحفظ على الطالب في هذه الحصة ويظهر في تقريره الكامل."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" disabled={!canSave} loading={save.isPending} onClick={submit}>حفظ</Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Segmented<ClassRecordKind>
          value={kind}
          onChange={changeKind}
          label="نوع التسجيل"
          options={CLASS_RECORD_KIND.items.map((k) => {
            const Icon = recordIcon[k.value];
            return { value: k.value, label: k.label, icon: <Icon className="size-4" aria-hidden /> };
          })}
        />

        <div>
          <div className="mb-2 text-sm font-medium text-ink-2">السبب</div>
          <div role="group" aria-label="أسباب جاهزة" className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const on = reason === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setReason(on ? '' : p)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[14px] transition-colors',
                    on ? 'border-brand bg-brand-soft font-medium text-brand' : 'border-dashed border-line-strong text-ink-2 hover:border-brand hover:bg-brand-soft/60 hover:text-brand',
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Field label="أو اكتب سببًا آخر">
              {(f) => (
                <Input {...f} value={isPreset ? '' : reason} onChange={(e) => setReason(e.target.value)} maxLength={CLASS_LIMITS.reason} placeholder="سبب مختصر، مثل: تأخّر في تسليم الورقة" />
              )}
            </Field>
          </div>
        </div>

        <Field label="تفاصيل (اختياري)" hint={`${note.length} / ${CLASS_LIMITS.note}`}>
          {(f) => <Textarea {...f} rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={CLASS_LIMITS.note} placeholder="ماذا حدث وكيف تصرّفت؟" />}
        </Field>
        {!canSave ? <p className="text-[13px] text-muted">اختر سببًا أو اكتب ملاحظة لحفظ التسجيل.</p> : null}
      </form>
    </Modal>
  );
}

/** نافذة تسجيل سلوك أو ملاحظة على طالب في حصة، أو تعديل تسجيل قائم */
export function RecordDialog({ target, onClose }: { target: RecordTarget | null; onClose: () => void }) {
  if (!target) return null;
  return <Form key={target.record?.id ?? `${target.studentId}-${target.kind}`} target={target} onClose={onClose} />;
}
