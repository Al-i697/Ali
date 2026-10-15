import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus } from 'lucide-react';
import type { z } from 'zod';
import { CYCLE_LABELS, GRADE_LEVELS, sectionLabel } from '@shared/constants';
import type { SectionDto, SubjectDto } from '@shared/dto';
import { createSectionSchema } from '@shared/schemas/academic';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { applyApiError } from '@/lib/forms';
import { useAppMutation } from '@/lib/mutation';
import { qk, useSubjects } from '@/lib/queries';
import { Alert, Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';

type FormValues = z.input<typeof createSectionSchema>;

export function GradeSelect(props: React.ComponentProps<typeof Select>) {
  const cycles = ['cycle1', 'cycle2', 'postBasic'] as const;
  return (
    <Select {...props}>
      {cycles.map((c) => (
        <optgroup key={c} label={CYCLE_LABELS[c]}>
          {GRADE_LEVELS.filter((g) => g.cycle === c).map((g) => (
            <option key={g.level} value={g.level}>الصف {g.name}</option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}

/** إنشاء شعبة (مع اختيار مواد تدريسها) أو تعديل بياناتها الأساسية */
export function SectionDialog({ open, onOpenChange, yearId, section, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; yearId: string; section?: SectionDto | null; onSaved?: (s: SectionDto) => void }) {
  const editing = !!section;
  const { data: subjects } = useSubjects();
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const form = useForm<FormValues>({
    resolver: zodResolver(createSectionSchema) as never,
    defaultValues: { yearId, gradeLevel: 10, name: '', subjectIds: [], notes: '' },
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNewSubject('');
    form.reset(
      section
        ? { yearId, gradeLevel: section.gradeLevel, name: section.name, subjectIds: section.assignments.map((a) => a.subjectId), notes: section.notes ?? '' }
        : { yearId, gradeLevel: 10, name: '', subjectIds: [], notes: '' },
    );
  }, [open, section, yearId, form]);

  const addSubject = useAppMutation((name: string) => api.post<SubjectDto>('/subjects', { name }), {
    invalidate: [qk.subjects],
    onSuccess: (s) => {
      form.setValue('subjectIds', [...(form.getValues('subjectIds') ?? []), s.id]);
      setNewSubject('');
    },
  });

  const save = useAppMutation(
    (v: FormValues) =>
      section
        ? api.patch<SectionDto>(`/sections/${section.id}`, { gradeLevel: v.gradeLevel, name: v.name, notes: v.notes })
        : api.post<SectionDto>('/sections', v),
    {
      invalidate: ['academic'],
      success: editing ? 'حُفظت بيانات الشعبة' : 'أُنشئت الشعبة',
      silentError: true,
      onSuccess: (s) => {
        onOpenChange(false);
        onSaved?.(s);
      },
      onError: (e) => setError(applyApiError(form, e)),
    },
  );
  const submit = form.handleSubmit((v) => save.mutate(v));
  const e = form.formState.errors;
  const grade = form.watch('gradeLevel');
  const name = form.watch('name');
  const active = (subjects ?? []).filter((s) => !s.isArchived);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'تعديل الشعبة' : 'إضافة شعبة'}
      description={editing ? 'لتغيير المواد افتح تبويب «المواد» في صفحة الشعبة.' : 'اختر الصف ورقم الشعبة والمواد التي تدرّسها فيها.'}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>{editing ? 'حفظ' : 'إنشاء الشعبة'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <Field label="الصف" required error={e.gradeLevel?.message}>
            {(p) => <GradeSelect {...p} {...form.register('gradeLevel', { valueAsNumber: true })} />}
          </Field>
          <Field label="رقم الشعبة" required error={e.name?.message} hint="مثل 3 أو أ">
            {(p) => <Input {...p} maxLength={20} {...form.register('name')} />}
          </Field>
        </div>
        {name?.trim() ? (
          <div className="flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-[14.5px] text-brand">
            ستظهر الشعبة باسم <b className="tnum text-[17px]">{sectionLabel(Number(grade) || 0, name.trim())}</b>
          </div>
        ) : null}

        {!editing ? (
          <Field label="المواد التي تدرّسها في هذه الشعبة" error={e.subjectIds?.message as string | undefined}>
            {() => (
              <Controller
                control={form.control}
                name="subjectIds"
                render={({ field }) => (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap gap-2">
                      {active.map((s) => {
                        const on = (field.value ?? []).includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => field.onChange(on ? (field.value ?? []).filter((x) => x !== s.id) : [...(field.value ?? []), s.id])}
                            className={cn(`subj-${s.color} inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[14.5px] font-medium transition-colors`, on ? 'border-[var(--c)] bg-[var(--c-soft)] text-[var(--c)]' : 'border-line-strong text-ink-2 hover:bg-surface-3')}
                          >
                            {on ? <Check className="size-4" /> : <span className="size-4" />}
                            {s.name}
                          </button>
                        );
                      })}
                      {active.length === 0 ? <span className="text-[14px] text-muted">لا مواد بعد — أضف مادتك الأولى بالأسفل.</span> : null}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSubject}
                        onChange={(ev) => setNewSubject(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter') {
                            ev.preventDefault();
                            if (newSubject.trim()) addSubject.mutate(newSubject.trim());
                          }
                        }}
                        placeholder="مادة جديدة…"
                        aria-label="مادة جديدة"
                        className="h-9"
                      />
                      <Button size="sm" variant="soft" icon={<Plus className="size-4" />} disabled={!newSubject.trim()} loading={addSubject.isPending} onClick={() => addSubject.mutate(newSubject.trim())}>إضافة</Button>
                    </div>
                  </div>
                )}
              />
            )}
          </Field>
        ) : null}

        <Field label="ملاحظات" error={e.notes?.message}>
          {(p) => <Textarea {...p} rows={2} {...form.register('notes')} />}
        </Field>
      </form>
    </Modal>
  );
}
