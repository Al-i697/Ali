import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SUPPORT_KIND, SUPPORT_STRATEGY_PRESETS, type SupportKind } from '@shared/constants';
import { addDays, todayISO } from '@shared/dates';
import type { RosterEntryDto, SupportPlanDetailDto } from '@shared/dto';
import { dateSchema, idSchema, requiredText, stringList } from '@shared/schemas/common';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { applySupportIdeas } from '@/features/ai/merge';
import { SupportAssistDialog, type SupportSeed } from '@/features/ai/support-assist-dialog';
import { api } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments } from '@/lib/queries';
import { Alert, Button, Field, Input, Modal, Segmented, Select, TagInput, Textarea } from '@/components/ui';

const formSchema = z
  .object({
    assignmentId: idSchema,
    studentId: idSchema,
    kind: z.enum(SUPPORT_KIND.values),
    title: requiredText(200),
    reason: z.string().trim().max(2000),
    goal: requiredText(2000),
    strategies: stringList(),
    startDate: dateSchema,
    reviewDate: z.union([dateSchema, z.literal('')]),
  })
  .refine((v) => !v.reviewDate || v.reviewDate >= v.startDate, { error: 'تاريخ المراجعة يجب ألا يسبق تاريخ البدء', path: ['reviewDate'] });

type FormValues = z.input<typeof formSchema>;

export type PlanPrefill = { assignmentId?: string; studentId?: string; kind?: SupportKind };

/** إنشاء خطة جديدة أو تعديل بيانات خطة قائمة (الطالب والمقرر لا يتغيّران عند التعديل) */
export function PlanDialog({
  open,
  onOpenChange,
  plan,
  prefill,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  plan?: SupportPlanDetailDto | null;
  prefill?: PlanPrefill;
  onSaved?: (p: SupportPlanDetailDto) => void;
}) {
  const editing = !!plan;
  const { year } = useAcademic();
  const { system } = useAuth();
  const aiOn = system?.capabilities.ai ?? false;
  const assignments = useAssignments(year?.id);
  const [error, setError] = useState<string | null>(null);
  const [assistSeed, setAssistSeed] = useState<SupportSeed | null>(null);
  const empty = (): FormValues => ({
    assignmentId: prefill?.assignmentId ?? '',
    studentId: prefill?.studentId ?? '',
    kind: prefill?.kind ?? 'remedial',
    title: '',
    reason: '',
    goal: '',
    strategies: [],
    startDate: todayISO(),
    reviewDate: addDays(todayISO(), 14),
  });
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) as never, defaultValues: empty() });

  useEffect(() => {
    if (!open) return;
    setError(null);
    form.reset(
      plan
        ? { assignmentId: plan.assignmentId ?? '', studentId: plan.studentId, kind: plan.kind, title: plan.title, reason: plan.reason ?? '', goal: plan.goal, strategies: plan.strategies, startDate: plan.startDate, reviewDate: plan.reviewDate ?? '' }
        : empty(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- نعيد التهيئة عند فتح النافذة أو تغيّر الخطة فقط
  }, [open, plan]);

  const assignmentId = form.watch('assignmentId');
  const kind = form.watch('kind');
  const asg = useMemo(() => assignments.data?.find((a) => a.id === assignmentId), [assignments.data, assignmentId]);
  const roster = useQuery({
    queryKey: qk.roster(asg?.sectionId ?? ''),
    queryFn: () => api.get<RosterEntryDto[]>(`/sections/${asg!.sectionId}/students`),
    enabled: open && !!asg && !editing,
  });

  const save = useAppMutation(
    (v: FormValues) => {
      const body = { ...v, reason: v.reason || null, reviewDate: v.reviewDate || null };
      return editing
        ? api.patch<SupportPlanDetailDto>(`/support-plans/${plan!.id}`, { kind: body.kind, title: body.title, reason: body.reason, goal: body.goal, strategies: body.strategies, startDate: body.startDate, reviewDate: body.reviewDate })
        : api.post<SupportPlanDetailDto>('/support-plans', body);
    },
    {
      invalidate: [['support'], qk.dashboard, ['calendar']],
      success: editing ? 'حُفظت الخطة' : 'أُنشئت الخطة',
      silentError: true,
      onSuccess: (p) => {
        onOpenChange(false);
        onSaved?.(p);
      },
      onError: (e) => setError(applyApiError(form, e)),
    },
  );
  const submit = form.handleSubmit((v) => save.mutate(v));
  const e = form.formState.errors;

  // نلتقط قيم النموذج لحظة النقر (لا عند كل رسم): تُعبَّأ منها نافذة المساعد ويُحسب ما يُحدَّد افتراضيًا
  const openAssist = () => {
    const v = form.getValues();
    setAssistSeed({
      kind: v.kind,
      assignmentId: v.assignmentId,
      context: asg ? { gradeLevel: asg.gradeLevel, subjectName: asg.subjectName } : null,
      title: v.title,
      current: { reason: v.reason ?? '', goal: v.goal ?? '', strategies: v.strategies ?? [] },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={editing ? 'تعديل الخطة' : 'خطة جديدة'}
      description={editing ? `${plan!.studentName} — ${plan!.subjectName ?? ''}` : 'حدّد الطالب والمقرر ثم اكتب هدف الخطة. تُسجَّل نسبته الحالية كخط أساس لقياس الأثر لاحقًا.'}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>{editing ? 'حفظ' : 'إنشاء الخطة'}</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}

        <Controller control={form.control} name="kind" render={({ field }) => (
          <div>
            <div className="mb-1.5 text-sm font-medium text-ink-2">نوع الخطة</div>
            <Segmented<SupportKind> value={field.value} onChange={field.onChange} label="نوع الخطة" options={SUPPORT_KIND.items.map((k) => ({ value: k.value, label: k.label }))} />
          </div>
        )} />

        {aiOn ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-dashed border-line-strong bg-surface-2 px-3 py-2.5">
            <Button variant="soft" size="sm" icon={<Sparkles className="size-4" />} onClick={openAssist}>اقترح أفكارًا بالمساعد الذكي</Button>
            <span className="text-[13px] text-muted">أسباب محتملة وهدف وإجراءات بصياغة عامة، تراجعها قبل الإدراج.</span>
          </div>
        ) : null}

        {!editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الشعبة والمادة" required error={e.assignmentId?.message}>
              {(p) => (
                <Select {...p} {...form.register('assignmentId', { onChange: () => form.setValue('studentId', '') })}>
                  <option value="">اختر…</option>
                  {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                </Select>
              )}
            </Field>
            <Field label="الطالب" required error={e.studentId?.message}>
              {(p) => (
                <Select {...p} {...form.register('studentId')} disabled={!assignmentId}>
                  <option value="">{assignmentId ? 'اختر الطالب…' : 'اختر الشعبة أولًا'}</option>
                  {prefill?.studentId && !roster.data?.some((r) => r.student.id === prefill.studentId) ? <option value={prefill.studentId}>الطالب المحدد</option> : null}
                  {(roster.data ?? []).map((r) => <option key={r.student.id} value={r.student.id}>{r.student.fullName}</option>)}
                </Select>
              )}
            </Field>
          </div>
        ) : null}

        <Field label="عنوان الخطة" required error={e.title?.message}>
          {(p) => <Input {...p} placeholder={kind === 'remedial' ? 'مثال: علاج مهارة تفسير الرسوم البيانية' : 'مثال: مشروع بحثي في الخلية'} maxLength={200} autoFocus={!editing} {...form.register('title')} />}
        </Field>
        <Field label={kind === 'remedial' ? 'التشخيص / سبب الخطة' : 'مبرر الخطة'} error={e.reason?.message} hint={kind === 'remedial' ? 'ما الذي يحتاج الطالب إلى علاجه تحديدًا؟' : 'لماذا يحتاج الطالب إلى إثراء؟'}>
          {(p) => <Textarea {...p} rows={2} {...form.register('reason')} />}
        </Field>
        <Field label="الهدف" required error={e.goal?.message} hint="هدف قابل للقياس، مثل: رفع نسبته إلى 60% فأكثر بنهاية الفصل.">
          {(p) => <Textarea {...p} rows={2} {...form.register('goal')} />}
        </Field>
        <Field label="الاستراتيجيات والإجراءات" error={e.strategies?.message as string | undefined}>
          {() => (
            <Controller control={form.control} name="strategies" render={({ field }) => (
              <TagInput value={field.value ?? []} onChange={field.onChange} presets={SUPPORT_STRATEGY_PRESETS[kind]} aria-label="الاستراتيجيات والإجراءات" placeholder="اكتب إجراءً ثم Enter" />
            )} />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="تاريخ البدء" required error={e.startDate?.message}>{(p) => <Input {...p} type="date" {...form.register('startDate')} />}</Field>
          <Field label="موعد المراجعة" error={e.reviewDate?.message} hint="يظهر في التقويم الدراسي ولوحة التحكم">{(p) => <Input {...p} type="date" {...form.register('reviewDate')} />}</Field>
        </div>
      </form>

      {/* خارج النموذج عمدًا: أحداث React تصعد عبر البوابات فلا نريدها أن تبلغ onSubmit */}
      {aiOn && assistSeed ? (
        <SupportAssistDialog
          open
          seed={assistSeed}
          onClose={() => setAssistSeed(null)}
          onApply={(ideas, picks) => {
            const v = form.getValues();
            const next = applySupportIdeas({ reason: v.reason ?? '', goal: v.goal ?? '', strategies: v.strategies ?? [] }, ideas, picks);
            const opts = { shouldDirty: true, shouldValidate: true } as const;
            form.setValue('reason', next.reason, opts);
            form.setValue('goal', next.goal, opts);
            form.setValue('strategies', next.strategies, opts);
          }}
        />
      ) : null}
    </Modal>
  );
}
