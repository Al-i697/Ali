import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toWesternDigits } from '@shared/arabic';
import { LAB_KIND, LAB_LOCATION_PRESETS, LAB_MATERIAL_PRESETS, LAB_SAFETY_PRESETS, LAB_STATUS, MAX_PERIODS, type LabKind, type LabStatus } from '@shared/constants';
import { todayISO, weekdayOf } from '@shared/dates';
import type { LabActivityDto, SlotDto } from '@shared/dto';
import { dateSchema, requiredText, stringList } from '@shared/schemas/common';
import { useAcademic } from '@/context/academic';
import { api } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useFmt, useLocalState } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useAssignments, useSections } from '@/lib/queries';
import { Alert, Button, Field, Input, ListEditor, Modal, PageLoader, QueryError, Segmented, Select, TagInput, Textarea, useConfirm } from '@/components/ui';

/** ينظّف عناصر القائمة (يحذف الفارغ) قبل التحقق: أسطر فارغة تركها المستخدم لا تُعدّ خطأً */
const cleanList = z
  .array(z.string())
  .max(50)
  .transform((a) => a.map((x) => x.trim()).filter(Boolean))
  .pipe(stringList());

const formSchema = z
  .object({
    assignmentId: z.string(),
    date: dateSchema,
    period: z.string(),
    kind: z.enum(LAB_KIND.values),
    title: requiredText(200),
    location: z.string().trim().max(120),
    objectives: cleanList,
    materials: cleanList,
    safety: cleanList,
    procedure: z.string().trim().max(5000),
    status: z.enum(LAB_STATUS.values),
    participants: z.string().trim(),
    results: z.string().trim().max(5000),
    notes: z.string().trim().max(5000),
  })
  .superRefine((v, ctx) => {
    if (v.status === 'done' && v.date > todayISO()) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'لا يمكن تسجيل «نُفِّذ» لتاريخ لم يحن بعد' });
    }
    if (v.participants) {
      const n = toWesternDigits(v.participants).trim();
      if (!/^\d{1,4}$/.test(n) || Number(n) > 2000) ctx.addIssue({ code: 'custom', path: ['participants'], message: 'أدخل عددًا صحيحًا بين 0 و2000' });
    }
  });

type FormValues = z.input<typeof formSchema>;

export type LabPrefill = { assignmentId?: string; date?: string; kind?: LabKind; status?: LabStatus };
export type LabTarget = { id?: string; prefill?: LabPrefill };

const toBody = (v: FormValues) => ({
  assignmentId: v.assignmentId || null,
  date: v.date,
  period: v.period ? Number(v.period) : null,
  kind: v.kind,
  title: v.title,
  location: v.location || null,
  objectives: v.objectives,
  materials: v.materials,
  safety: v.safety,
  procedure: v.procedure || null,
  status: v.status,
  participants: v.participants ? Number(toWesternDigits(v.participants).trim()) : null,
  results: v.results || null,
  notes: v.notes || null,
});

/** إنشاء نشاط جديد أو تعديل نشاط قائم. عند التعديل تُجلب النسخة الكاملة طازجةً (لا من الذاكرة المؤقتة) كي لا يُكتب فوق أحدث بياناتها */
export function LabDialog({ target, onClose, onSaved }: { target: LabTarget | null; onClose: () => void; onSaved?: (a: LabActivityDto) => void }) {
  const id = target?.id;
  const detail = useQuery({ queryKey: qk.labItem(id ?? ''), queryFn: () => api.get<LabActivityDto>(`/lab-activities/${id}`), enabled: !!id, gcTime: 0, staleTime: 0 });
  if (!target) return null;
  if (id && !detail.data) {
    return (
      <Modal open onOpenChange={(o) => !o && onClose()} title="تعديل النشاط" size="lg">
        {detail.error ? <QueryError error={detail.error} onRetry={() => void detail.refetch()} /> : <PageLoader />}
      </Modal>
    );
  }
  return <LabForm key={id ?? 'new'} activity={detail.data ?? null} prefill={target.prefill} onClose={onClose} onSaved={onSaved} />;
}

function LabForm({ activity, prefill, onClose, onSaved }: { activity: LabActivityDto | null; prefill?: LabPrefill; onClose: () => void; onSaved?: (a: LabActivityDto) => void }) {
  const editing = !!activity;
  const fmt = useFmt();
  const confirm = useConfirm();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const sections = useSections(year?.id);
  const [last, setLast] = useLocalState<string>('sijilli-lab-last-assignment', '');
  const [error, setError] = useState<string | null>(null);
  const locationsId = useId();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: activity
      ? {
          assignmentId: activity.assignmentId ?? '',
          date: activity.date,
          period: activity.period ? String(activity.period) : '',
          kind: activity.kind,
          title: activity.title,
          location: activity.location ?? '',
          objectives: activity.objectives,
          materials: activity.materials,
          safety: activity.safety,
          procedure: activity.procedure ?? '',
          status: activity.status,
          participants: activity.participants === null ? '' : String(activity.participants),
          results: activity.results ?? '',
          notes: activity.notes ?? '',
        }
      : {
          assignmentId: prefill?.assignmentId ?? last,
          date: prefill?.date ?? todayISO(),
          period: '',
          kind: prefill?.kind ?? 'experiment',
          title: '',
          location: '',
          objectives: [],
          materials: [],
          safety: [],
          procedure: '',
          status: prefill?.status ?? 'planned',
          participants: '',
          results: '',
          notes: '',
        },
  });
  // تُقرأ isDirty أثناء الرسم عمدًا: RHF لا يتتبّع الخاصية إلا إن قُرئت في الرسم، فقراءتها داخل معالج الإغلاق وحده تعيد دائمًا false
  const { errors: e, isDirty } = form.formState;
  const assignmentId = form.watch('assignmentId');
  const date = form.watch('date');
  const status = form.watch('status');
  const period = form.watch('period');

  // آخر مقرر استُعمل قد يكون من عام آخر أو محذوفًا: لا نفرضه إن لم يعد موجودًا
  useEffect(() => {
    if (editing || !assignments.data) return;
    const cur = form.getValues('assignmentId');
    if (cur && !assignments.data.some((a) => a.id === cur)) form.setValue('assignmentId', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- مرة واحدة عند وصول المقررات
  }, [assignments.data]);

  const asg = useMemo(() => assignments.data?.find((a) => a.id === assignmentId), [assignments.data, assignmentId]);
  const studentCount = useMemo(() => sections.data?.find((s) => s.id === asg?.sectionId)?.studentCount ?? 0, [sections.data, asg]);

  // اقتراح الحصة من الجدول الأسبوعي (للجديد فقط، ولا يُكتب فوق اختيار يدوي)
  const slots = useQuery({ queryKey: qk.timetable(year?.id), queryFn: () => api.get<SlotDto[]>('/timetable', { yearId: year?.id }), enabled: !editing && !!year });
  const auto = useRef('');
  useEffect(() => {
    if (editing || !asg || !date) return;
    const cur = form.getValues('period');
    if (cur !== '' && cur !== auto.current) return;
    const match = (slots.data ?? []).filter((s) => s.assignment.id === asg.id && s.weekday === weekdayOf(date)).sort((a, b) => a.period - b.period)[0];
    const next = match ? String(match.period) : '';
    auto.current = next;
    if (next !== cur) form.setValue('period', next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- نعيد الاقتراح عند تغيّر المقرر أو التاريخ أو وصول الجدول
  }, [editing, asg?.id, date, slots.data]);

  const save = useAppMutation((v: FormValues) => (editing ? api.patch<LabActivityDto>(`/lab-activities/${activity!.id}`, toBody(v)) : api.post<LabActivityDto>('/lab-activities', toBody(v))), {
    invalidate: [['lab'], qk.dashboard, ['calendar']],
    success: editing ? 'حُفظ النشاط' : 'أُضيف النشاط إلى السجل',
    silentError: true,
    onSuccess: (a) => {
      if (a.assignmentId) setLast(a.assignmentId);
      onClose();
      onSaved?.(a);
    },
    onError: (err) => setError(applyApiError(form, err)),
  });
  const submit = form.handleSubmit((v) => {
    setError(null);
    save.mutate(v);
  });

  // إغلاق النافذة (Esc أو النقر خارجها) وفيها تغييرات غير محفوظة يطلب تأكيدًا — لا يضيع ما كُتب بنقرة عرَضية
  const closing = useRef(false);
  const requestClose = async () => {
    if (closing.current) return;
    closing.current = true;
    try {
      if (!isDirty || (await confirm({ title: 'تجاهل التغييرات؟', description: 'لديك تغييرات لم تُحفظ بعد وستضيع إن أغلقت النافذة.', confirmLabel: 'تجاهل وإغلاق', cancelLabel: 'متابعة التحرير', tone: 'danger' }))) onClose();
    } finally {
      closing.current = false;
    }
  };

  const periodHint = !editing && period && period === auto.current ? 'اقتُرحت من الجدول الأسبوعي' : undefined;

  return (
    <Modal
      open
      onOpenChange={(o) => !o && void requestClose()}
      size="lg"
      title={editing ? 'تعديل النشاط' : 'نشاط جديد'}
      description={editing ? activity!.title : 'خطّط التجربة أو النشاط قبل الحصة، ثم افتحه بعدها لتسجّل التنفيذ والنتائج وعدد المشاركين.'}
      footer={
        <>
          <Button variant="ghost" onClick={() => void requestClose()}>إلغاء</Button>
          <Button variant="primary" loading={save.isPending} onClick={() => void submit()}>{editing ? 'حفظ' : 'إضافة إلى السجل'}</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(ev) => void submit(ev)} noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <Field label="نوع النشاط" required error={e.kind?.message}>
            {(p) => (
              <Select {...p} {...form.register('kind')}>
                {LAB_KIND.items.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
            )}
          </Field>
          <Controller control={form.control} name="status" render={({ field }) => (
            <div>
              <div className="mb-1.5 text-sm font-medium text-ink-2">الحالة</div>
              <Segmented<LabStatus> value={field.value} onChange={field.onChange} label="حالة النشاط" options={LAB_STATUS.items.map((s) => ({ value: s.value, label: s.label }))} />
            </div>
          )} />
        </div>

        <Field label="عنوان النشاط" required error={e.title?.message}>
          {(p) => <Input {...p} placeholder="مثال: فحص خلايا قشرة البصل بالمجهر" maxLength={200} autoFocus={!editing} {...form.register('title')} />}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الشعبة والمادة" error={e.assignmentId?.message} hint="اتركه «نشاطًا عامًا» لمعرض أو رحلة أو نشاط على مستوى المدرسة.">
            {(p) => (
              // حقل مضبوط (controlled): الخيارات تصل من الخادم بعد الرسم الأول، والحقل غير المضبوط لا يعيد تطبيق القيمة المحفوظة عند وصولها فيعرض «عامًّا» وهو مرتبط بشعبة
              <Controller control={form.control} name="assignmentId" render={({ field }) => (
                <Select {...p} name={field.name} ref={field.ref} value={field.value} onBlur={field.onBlur} onChange={(ev) => field.onChange(ev.target.value)}>
                  <option value="">نشاط عام (بلا شعبة)</option>
                  {/* نشاط من عام دراسي آخر: مقرره ليس في قائمة العام المختار، فنُبقيه خيارًا كي لا يُفكّ ارتباطه عند الحفظ بالخطأ */}
                  {activity?.assignmentId && !assignments.data?.some((a) => a.id === activity.assignmentId) ? (
                    <option value={activity.assignmentId}>{activity.sectionLabel} — {activity.subjectName}</option>
                  ) : null}
                  {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                </Select>
              )} />
            )}
          </Field>
          <Field label="المكان" error={e.location?.message}>
            {(p) => (
              <>
                <Input {...p} list={locationsId} placeholder="مثال: مختبر العلوم" maxLength={120} {...form.register('location')} />
                <datalist id={locationsId}>{LAB_LOCATION_PRESETS.map((l) => <option key={l} value={l} />)}</datalist>
              </>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="التاريخ" required error={e.date?.message}>{(p) => <Input {...p} type="date" {...form.register('date')} />}</Field>
          <Field label="الحصة" error={e.period?.message} hint={periodHint}>
            {(p) => (
              <Select {...p} {...form.register('period')}>
                <option value="">غير محددة</option>
                {Array.from({ length: MAX_PERIODS }, (_, k) => k + 1).map((n) => <option key={n} value={n}>الحصة {fmt.num(n, 0)}</option>)}
              </Select>
            )}
          </Field>
        </div>

        <Field label="الأهداف" error={e.objectives?.message as string | undefined}>
          {() => <Controller control={form.control} name="objectives" render={({ field }) => <ListEditor value={field.value ?? []} onChange={field.onChange} placeholder="أن يستنتج الطالب…" addLabel="إضافة هدف" aria-label="الهدف" />} />}
        </Field>
        <Field label="المواد والأدوات" error={e.materials?.message as string | undefined}>
          {() => <Controller control={form.control} name="materials" render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} presets={LAB_MATERIAL_PRESETS} aria-label="المواد والأدوات" placeholder="اكتب أداة ثم Enter" />} />}
        </Field>
        <Field label="احتياطات السلامة" error={e.safety?.message as string | undefined}>
          {() => <Controller control={form.control} name="safety" render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} presets={LAB_SAFETY_PRESETS} aria-label="احتياطات السلامة" placeholder="اكتب احتياطًا ثم Enter" />} />}
        </Field>
        <Field label="خطوات التنفيذ" error={e.procedure?.message}>
          {(p) => <Textarea {...p} rows={4} placeholder="اكتب الخطوات مرتّبة، كل خطوة في سطر." {...form.register('procedure')} />}
        </Field>

        {status === 'done' ? (
          <section className="space-y-4 rounded-xl border border-good/30 bg-good-soft/40 p-4" aria-label="التنفيذ والنتائج">
            <h3 className="text-[15px] font-semibold text-ink">التنفيذ والنتائج</h3>
            <Field
              label="عدد الطلاب المشاركين"
              error={e.participants?.message}
              hint={
                studentCount ? (
                  <>
                    الطلاب الذين شاركوا فعليًا.{' '}
                    <button type="button" className="font-medium text-brand underline underline-offset-2" onClick={() => form.setValue('participants', String(studentCount), { shouldDirty: true, shouldValidate: true })}>
                      كل طلاب الشعبة ({fmt.num(studentCount, 0)})
                    </button>
                  </>
                ) : (
                  'الطلاب الذين شاركوا فعليًا.'
                )
              }
            >
              {(p) => <Input {...p} inputMode="numeric" className="sm:max-w-40" placeholder="0" maxLength={4} {...form.register('participants')} />}
            </Field>
            <Field label="النتائج والملاحظات" error={e.results?.message}>
              {(p) => <Textarea {...p} rows={3} placeholder="ماذا لوحظ؟ هل تحققت الأهداف؟" {...form.register('results')} />}
            </Field>
            <Field label="معوّقات وتوصيات" error={e.notes?.message}>
              {(p) => <Textarea {...p} rows={2} placeholder="ما الذي يُحسَّن في المرة القادمة؟" {...form.register('notes')} />}
            </Field>
          </section>
        ) : null}
      </form>
    </Modal>
  );
}
