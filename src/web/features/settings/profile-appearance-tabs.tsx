import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { DIGITS_PREF, THEME_PREF, type DigitsPref, type ThemePref } from '@shared/constants';
import { formatDate } from '@shared/dates';
import { formatNumber } from '@shared/format';
import { profileSchema } from '@shared/schemas/settings';
import type { SettingsDto } from '@shared/dto';
import { api } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { applyTheme } from '@/lib/theme';
import { Alert, Button, Card, CardHeader, Field, Input, Segmented } from '@/components/ui';

type ProfileForm = z.input<typeof profileSchema>;

export function ProfileTab({ settings }: { settings: SettingsDto }) {
  const [error, setError] = useState<string | null>(null);
  const p = settings.profile;
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema) as never,
    defaultValues: { fullName: p.fullName, schoolName: p.schoolName ?? '', directorate: p.directorate ?? '', jobTitle: p.jobTitle ?? '', specialization: p.specialization ?? '', seniorTeacherName: p.seniorTeacherName ?? '', principalName: p.principalName ?? '' },
  });
  useEffect(() => {
    form.reset({ fullName: p.fullName, schoolName: p.schoolName ?? '', directorate: p.directorate ?? '', jobTitle: p.jobTitle ?? '', specialization: p.specialization ?? '', seniorTeacherName: p.seniorTeacherName ?? '', principalName: p.principalName ?? '' });
  }, [p, form]);
  const save = useAppMutation((v: ProfileForm) => api.patch<SettingsDto>('/settings', { profile: v }), {
    invalidate: [qk.settings, qk.me],
    success: 'حُفظ الملف الشخصي',
    silentError: true,
    onSuccess: () => setError(null),
    onError: (e) => setError(applyApiError(form, e)),
  });
  const e = form.formState.errors;
  return (
    <Card className="max-w-3xl">
      <CardHeader title="الملف الشخصي وبيانات المدرسة" description="تظهر في ترويسة التقارير المطبوعة وتواقيعها." />
      <form className="space-y-4 px-5 pb-5" onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم الكامل" required error={e.fullName?.message}>{(f) => <Input {...f} {...form.register('fullName')} />}</Field>
          <Field label="البريد الإلكتروني" hint="لا يمكن تغييره من هنا">{(f) => <Input {...f} value={p.email} readOnly disabled dir="ltr" className="text-start" />}</Field>
          <Field label="المدرسة" error={e.schoolName?.message}>{(f) => <Input {...f} placeholder="مدرسة الإمام الخليل للتعليم الأساسي" {...form.register('schoolName')} />}</Field>
          <Field label="المديرية / المحافظة" error={e.directorate?.message}>{(f) => <Input {...f} placeholder="المديرية العامة للتربية والتعليم بمحافظة مسقط" {...form.register('directorate')} />}</Field>
          <Field label="المسمى الوظيفي" error={e.jobTitle?.message}>{(f) => <Input {...f} placeholder="معلم" {...form.register('jobTitle')} />}</Field>
          <Field label="التخصص" error={e.specialization?.message}>{(f) => <Input {...f} placeholder="علوم" {...form.register('specialization')} />}</Field>
          <Field label="المعلم الأول" hint="للتوقيع في التقارير" error={e.seniorTeacherName?.message}>{(f) => <Input {...f} {...form.register('seniorTeacherName')} />}</Field>
          <Field label="مدير المدرسة" hint="للتوقيع في التقارير" error={e.principalName?.message}>{(f) => <Input {...f} {...form.register('principalName')} />}</Field>
        </div>
        <div className="flex justify-end"><Button type="submit" variant="primary" loading={save.isPending}>حفظ</Button></div>
      </form>
    </Card>
  );
}

export function AppearanceTab({ settings }: { settings: SettingsDto }) {
  const [theme, setTheme] = useState<ThemePref>(settings.preferences.theme);
  const [digits, setDigits] = useState<DigitsPref>(settings.preferences.digits);
  useEffect(() => { setTheme(settings.preferences.theme); setDigits(settings.preferences.digits); }, [settings]);
  const save = useAppMutation((prefs: { theme?: ThemePref; digits?: DigitsPref }) => api.patch('/settings', { preferences: prefs }), { invalidate: [qk.settings], success: 'حُفظ التفضيل' });
  return (
    <Card className="max-w-3xl">
      <CardHeader title="المظهر وتنسيق الأرقام" description="تُحفظ تفضيلاتك في حسابك فتتبعك على كل أجهزتك." />
      <div className="space-y-6 px-5 pb-5">
        <div>
          <div className="mb-2 text-sm font-medium text-ink-2">سمة الواجهة</div>
          <Segmented<ThemePref> value={theme} label="سمة الواجهة" onChange={(v) => { setTheme(v); applyTheme(v); save.mutate({ theme: v }); }} options={THEME_PREF.items.map((t) => ({ value: t.value, label: t.label }))} />
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-ink-2">شكل الأرقام</div>
          <Segmented<DigitsPref> value={digits} label="شكل الأرقام" onChange={(v) => { setDigits(v); save.mutate({ digits: v }); }} options={DIGITS_PREF.items.map((t) => ({ value: t.value, label: t.label }))} />
          <p className="mt-2 text-[13.5px] text-muted">
            مثال: <b className="tnum text-ink">{formatNumber(87.5, digits)}%</b> · {formatDate('2026-09-13', digits, 'long')}. يسري على الشاشات والتقارير المطبوعة.
          </p>
        </div>
      </div>
    </Card>
  );
}
