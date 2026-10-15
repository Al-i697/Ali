import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { createYearSchema } from '@shared/schemas/academic';
import { todayISO } from '@shared/dates';
import type { YearDto } from '@shared/dto';
import { api } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Button, Checkbox, Field, Input, Modal } from '@/components/ui';
import { useState } from 'react';

type FormValues = z.input<typeof createYearSchema>;

/** اقتراح عام دراسي: يبدأ أواخر أغسطس وينتهي منتصف يونيو (قابل للتعديل) */
export function suggestYear(today = todayISO()) {
  const y = Number(today.slice(0, 4));
  const start = Number(today.slice(5, 7)) >= 8 ? y : y - 1;
  return { name: `${start}/${start + 1}`, startDate: `${start}-08-23`, endDate: `${start + 1}-06-18` };
}

export function CreateYearDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated?: (y: YearDto) => void }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(createYearSchema),
    defaultValues: { ...suggestYear(), makeCurrent: true },
  });
  useEffect(() => {
    if (open) {
      form.reset({ ...suggestYear(), makeCurrent: true });
      setError(null);
    }
  }, [open, form]);

  const create = useAppMutation((v: FormValues) => api.post<YearDto>('/years', v), {
    invalidate: [qk.years, ['sections'], qk.dashboard],
    success: 'أُنشئ العام الدراسي بفصليه',
    silentError: true,
    onSuccess: (y) => {
      onOpenChange(false);
      onCreated?.(y);
    },
    onError: (e) => setError(applyApiError(form, e)),
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء عام دراسي"
      description="يُقسَّم العام تلقائيًا إلى فصلين متتاليين يمكنك تعديل تواريخهما لاحقًا من الإعدادات."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" loading={create.isPending} onClick={form.handleSubmit((v) => create.mutate(v))}>إنشاء</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit((v) => create.mutate(v))} noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="اسم العام" required error={form.formState.errors.name?.message} hint="مثل 2026/2027">
          {(p) => <Input {...p} dir="ltr" className="text-start" {...form.register('name')} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="بداية العام" required error={form.formState.errors.startDate?.message}>
            {(p) => <Input {...p} type="date" {...form.register('startDate')} />}
          </Field>
          <Field label="نهاية العام" required error={form.formState.errors.endDate?.message}>
            {(p) => <Input {...p} type="date" {...form.register('endDate')} />}
          </Field>
        </div>
        <Checkbox label="اجعله العام الحالي" {...form.register('makeCurrent')} />
      </form>
    </Modal>
  );
}

