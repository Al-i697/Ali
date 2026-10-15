import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { GENDER, STUDENT_STATUS } from '@shared/constants';
import type { RosterEntryDto, StudentDto } from '@shared/dto';
import { createStudentSchema, updateStudentSchema } from '@shared/schemas/students';
import { api } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useAppMutation } from '@/lib/mutation';
import { Alert, Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';

type FormValues = z.input<typeof updateStudentSchema>;

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** وضع الإضافة: الشعبة التي يُسجَّل فيها الطالب (اختياري) */
  sectionId?: string;
  /** وضع التعديل */
  student?: Omit<StudentDto, 'enrollment'> | null;
  onDone?: () => void;
};

const empty: FormValues = { fullName: '', studentNumber: '', gender: undefined, birthDate: undefined, guardianName: '', guardianPhone: '', notes: '', status: 'active' };

/** نموذج الطالب: إضافة (إلى شعبة أو مستقل) وتعديل */
export function StudentFormDialog({ open, onOpenChange, sectionId, student, onDone }: Props) {
  const editing = !!student;
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(editing ? updateStudentSchema : createStudentSchema) as never, defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    setError(null);
    form.reset(
      student
        ? {
            fullName: student.fullName,
            studentNumber: student.studentNumber ?? '',
            gender: student.gender ?? undefined,
            birthDate: student.birthDate ?? undefined,
            guardianName: student.guardianName ?? '',
            guardianPhone: student.guardianPhone ?? '',
            notes: student.notes ?? '',
            status: student.status,
          }
        : empty,
    );
  }, [open, student, form]);

  const save = useAppMutation(
    async (v: FormValues) => {
      const body = { ...v, gender: v.gender || null, birthDate: v.birthDate || null };
      if (student) return api.patch<StudentDto>(`/students/${student.id}`, body);
      if (sectionId) return api.post<RosterEntryDto[]>(`/sections/${sectionId}/students`, { students: [body] });
      return api.post<StudentDto>('/students', body);
    },
    {
      invalidate: ['academic'],
      success: editing ? 'حُفظت بيانات الطالب' : 'أُضيف الطالب',
      silentError: true,
      onSuccess: () => {
        onOpenChange(false);
        onDone?.();
      },
      onError: (e) => setError(applyApiError(form, e)),
    },
  );

  const submit = form.handleSubmit((v) => save.mutate(v));
  const e = form.formState.errors;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={editing ? 'تعديل بيانات الطالب' : 'إضافة طالب'}
      description="الاسم هو الحقل الوحيد المطلوب. باقي البيانات اختيارية، ولا تُعرض في التقارير إلا بموافقتك."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>{editing ? 'حفظ' : 'إضافة'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="اسم الطالب" required error={e.fullName?.message}>
          {(p) => <Input {...p} autoFocus placeholder="الاسم الرباعي" {...form.register('fullName')} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الرقم التعريفي" hint="الرقم المدني أو رقم الطالب" error={e.studentNumber?.message}>
            {(p) => <Input {...p} dir="ltr" className="text-start" inputMode="numeric" {...form.register('studentNumber')} />}
          </Field>
          <Field label="الجنس" error={e.gender?.message}>
            {(p) => (
              <Select {...p} {...form.register('gender')}>
                <option value="">غير محدد</option>
                {GENDER.items.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </Select>
            )}
          </Field>
          <Field label="تاريخ الميلاد" error={e.birthDate?.message}>
            {(p) => <Input {...p} type="date" {...form.register('birthDate')} />}
          </Field>
          {editing ? (
            <Field label="الحالة" error={e.status?.message}>
              {(p) => (
                <Select {...p} {...form.register('status')}>
                  {STUDENT_STATUS.items.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              )}
            </Field>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ولي الأمر" error={e.guardianName?.message}>
            {(p) => <Input {...p} {...form.register('guardianName')} />}
          </Field>
          <Field label="هاتف ولي الأمر" error={e.guardianPhone?.message}>
            {(p) => <Input {...p} dir="ltr" className="text-start" inputMode="tel" {...form.register('guardianPhone')} />}
          </Field>
        </div>
        <Field label="ملاحظات خاصة" hint="تظهر لك فقط" error={e.notes?.message}>
          {(p) => <Textarea {...p} rows={2} {...form.register('notes')} />}
        </Field>
      </form>
    </Modal>
  );
}
