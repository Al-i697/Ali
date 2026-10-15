import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus } from 'lucide-react';
import type { z } from 'zod';
import { ASSESSMENT_MODE, ASSESSMENT_TYPE } from '@shared/constants';
import { totalWeight } from '@shared/gradebook';
import type { AssessmentDto, SkillDto } from '@shared/dto';
import { createAssessmentSchema } from '@shared/schemas/assessments';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { applyApiError } from '@/lib/forms';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Button, Field, Input, Modal, Segmented, Select, Switch, Textarea } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';

type FormValues = z.input<typeof createAssessmentSchema>;

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  assignmentId: string;
  subjectId: string;
  termId: string;
  assessment?: AssessmentDto | null;
  existing: AssessmentDto[];
  hasResults?: boolean;
  onSaved?: (a: AssessmentDto) => void;
};

/** إنشاء/تعديل تقويم: نوعه، نمطه (درجة أو إتقان)، درجته العظمى وإسهامه في المجموع، والمهارات المرتبطة */
export function AssessmentDialog({ open, onOpenChange, assignmentId, subjectId, termId, assessment, existing, hasResults, onSaved }: Props) {
  const editing = !!assessment;
  const fmt = useFmt();
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const skills = useQuery({ queryKey: qk.skills(subjectId), queryFn: () => api.get<SkillDto[]>('/skills', { subjectId }), enabled: open });
  const form = useForm<FormValues>({
    resolver: zodResolver(createAssessmentSchema) as never,
    defaultValues: { assignmentId, termId, title: '', type: 'written', mode: 'score', maxScore: 10, weight: 10, date: null, description: '', countsTowardTotal: true, skillIds: [] },
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNewSkill('');
    form.reset(
      assessment
        ? { assignmentId, termId: assessment.termId, title: assessment.title, type: assessment.type, mode: assessment.mode, maxScore: assessment.maxScore, weight: assessment.weight, date: assessment.date, description: assessment.description ?? '', countsTowardTotal: assessment.countsTowardTotal, skillIds: assessment.skillIds }
        : { assignmentId, termId, title: '', type: 'written', mode: 'score', maxScore: 10, weight: 10, date: null, description: '', countsTowardTotal: true, skillIds: [] },
    );
  }, [open, assessment, assignmentId, termId, form]);

  const mode = form.watch('mode');
  const max = form.watch('maxScore');
  const weight = form.watch('weight');
  const counts = form.watch('countsTowardTotal');
  const others = existing.filter((a) => a.id !== assessment?.id);
  const currentTotal = totalWeight(others.map((a) => ({ id: a.id, mode: a.mode, maxScore: a.maxScore, weight: a.weight, countsTowardTotal: a.countsTowardTotal })));

  const addSkill = useAppMutation((title: string) => api.post<SkillDto>('/skills', { subjectId, title }), {
    invalidate: [qk.skills(subjectId)],
    onSuccess: (s) => {
      form.setValue('skillIds', [...(form.getValues('skillIds') ?? []), s.id]);
      setNewSkill('');
    },
  });

  const save = useAppMutation(
    (v: FormValues) => {
      const body = { ...v, maxScore: v.mode === 'score' ? v.maxScore : null, weight: v.mode === 'score' ? (v.weight ?? v.maxScore) : null, date: v.date || null };
      return assessment ? api.patch<AssessmentDto>(`/assessments/${assessment.id}`, { ...body, assignmentId: undefined }) : api.post<AssessmentDto>('/assessments', body);
    },
    {
      invalidate: [['gradebook'], ['assessments'], qk.dashboard, ['profile']],
      success: editing ? 'حُفظ التقويم' : 'أُنشئ التقويم — يمكنك رصد الدرجات في الشبكة',
      silentError: true,
      onSuccess: (a) => {
        onOpenChange(false);
        onSaved?.(a);
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
      size="lg"
      title={editing ? 'تعديل التقويم' : 'تقويم جديد'}
      description="حدّد نوع التقويم وطريقة رصده. الدرجة تُحسب ضمن المجموع بحسب «الوزن»."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="primary" loading={save.isPending} onClick={submit}>{editing ? 'حفظ' : 'إنشاء التقويم'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="عنوان التقويم" required error={e.title?.message}>
          {(p) => <Input {...p} autoFocus placeholder="مثال: اختبار قصير 1" maxLength={200} {...form.register('title')} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="النوع" error={e.type?.message}>
            {(p) => <Select {...p} {...form.register('type')}>{ASSESSMENT_TYPE.items.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>}
          </Field>
          <Field label="التاريخ" error={e.date?.message}>
            {(p) => <Input {...p} type="date" {...form.register('date', { setValueAs: (v) => v || null })} />}
          </Field>
          <Field label="طريقة الرصد">
            {() => (
              <Controller
                control={form.control}
                name="mode"
                render={({ field }) => <Segmented value={field.value ?? 'score'} onChange={field.onChange} label="طريقة الرصد" size="sm" options={ASSESSMENT_MODE.items.map((m) => ({ value: m.value, label: m.label }))} />}
              />
            )}
          </Field>
        </div>
        {hasResults && editing ? <Alert tone="info">لهذا التقويم نتائج مرصودة: لا يمكن تغيير نمط الرصد، ولا خفض الدرجة العظمى تحت درجة مرصودة.</Alert> : null}

        {mode === 'score' ? (
          <div className="rounded-xl border border-line bg-surface-2/60 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الدرجة العظمى" required error={e.maxScore?.message} hint="الدرجة التي يُصحَّح عليها الطالب">
                {(p) => <Input {...p} type="number" step="any" min={0} inputMode="decimal" className="tnum" {...form.register('maxScore', { valueAsNumber: true, onChange: (ev) => { const w = form.getValues('weight'); if (!editing || w === form.getValues('maxScore')) form.setValue('weight', Number(ev.target.value)); } })} />}
              </Field>
              <Field label="الوزن في المجموع" error={e.weight?.message} hint="الدرجات التي يساهم بها في مجموع التقويم المستمر">
                {(p) => <Input {...p} type="number" step="any" min={0} inputMode="decimal" className="tnum" {...form.register('weight', { valueAsNumber: true })} />}
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <Controller control={form.control} name="countsTowardTotal" render={({ field }) => <Switch checked={field.value ?? true} onChange={field.onChange} label={<span className="text-[14.5px]">يُحتسب في المجموع</span>} />} />
              {counts !== false ? (
                <span className="text-[13.5px] text-muted">
                  مجموع الأوزان: <b className="tnum text-ink-2">{fmt.num(currentTotal)}</b> + <b className="tnum text-ink-2">{fmt.num(Number(weight) || 0)}</b> = <b className="tnum text-brand">{fmt.num(currentTotal + (Number(weight) || 0))}</b>
                  {Number(max) && Number(weight) !== Number(max) ? <span> (تُحوَّل الدرجة من {fmt.num(Number(max))} إلى {fmt.num(Number(weight) || 0)})</span> : null}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <Alert tone="info" title="رصد بمستوى الإتقان">يُرصد لكل طالب مستوى من 1 إلى 4 (لم يتقن ← متقن). لا يدخل في مجموع الدرجات، لكنه يغذّي مهارات الطالب وتقارير العلاج والإثراء.</Alert>
        )}

        <Field label="المهارات المرتبطة" hint="اربط التقويم بمهارات المادة لتتبّع إتقان كل طالب لها.">
          {() => (
            <Controller
              control={form.control}
              name="skillIds"
              render={({ field }) => (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-2">
                    {(skills.data ?? []).map((s) => {
                      const on = (field.value ?? []).includes(s.id);
                      return (
                        <button key={s.id} type="button" aria-pressed={on} onClick={() => field.onChange(on ? (field.value ?? []).filter((x) => x !== s.id) : [...(field.value ?? []), s.id])} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13.5px] transition-colors', on ? 'border-brand bg-brand-soft text-brand' : 'border-line-strong text-ink-2 hover:bg-surface-3')}>
                          {on ? <Check className="size-3.5" /> : null}{s.code ? <b className="tnum">{s.code}</b> : null} {s.title}
                        </button>
                      );
                    })}
                    {skills.data?.length === 0 ? <span className="text-[13.5px] text-muted">لا مهارات لهذه المادة بعد.</span> : null}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(ev) => setNewSkill(ev.target.value)} onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); if (newSkill.trim()) addSkill.mutate(newSkill.trim()); } }} placeholder="مهارة جديدة للمادة…" aria-label="مهارة جديدة" className="h-9" />
                    <Button size="sm" variant="soft" icon={<Plus className="size-4" />} disabled={!newSkill.trim()} loading={addSkill.isPending} onClick={() => addSkill.mutate(newSkill.trim())}>إضافة</Button>
                  </div>
                </div>
              )}
            />
          )}
        </Field>
        <Field label="وصف / ملاحظات" error={e.description?.message}>
          {(p) => <Textarea {...p} rows={2} {...form.register('description')} />}
        </Field>
      </form>
    </Modal>
  );
}
