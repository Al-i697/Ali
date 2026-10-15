import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileSpreadsheet, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { changePasswordSchema, loginSchema, setupSchema } from '@shared/schemas/auth';
import { APP_NAME } from '@shared/constants';
import { useAuth } from '@/context/auth';
import { applyApiError } from '@/lib/forms';
import { api } from '@/lib/api';
import { Alert, Button, Checkbox, Field, Input, PageLoader, PasswordInput } from '@/components/ui';
import { Wordmark } from '@/components/layout/logo';

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-[420px]">
          <Wordmark className="mb-10" />
          <h1 className="text-[28px] font-bold leading-10 tracking-tight text-ink">{title}</h1>
          <p className="mb-7 mt-1 text-[15px] text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
      <aside className="paper-dots relative hidden overflow-hidden bg-[#0b4a40] p-12 text-white lg:flex lg:flex-col lg:justify-between" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,164,65,0.18),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="ledger-rule absolute inset-x-0 bottom-0 h-1/3 opacity-[0.06] [--border:white] [mask-image:linear-gradient(to_top,black,transparent)]" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[13px]">
            <Sparkles className="size-4 text-[#e8c26a]" /> بديل رقمي للسجل المصاحب الورقي
          </div>
          <h2 className="max-w-md text-[34px] font-bold leading-[1.35]">كل أعمالك التعليمية في سجلٍّ واحد منظَّم.</h2>
        </div>
        <ul className="relative max-w-md space-y-5 text-[16px] text-white/90">
          {[
            { Icon: Zap, t: 'إدخال سريع', d: 'شبكة درجات بالكيبورد وحفظ تلقائي، ونسخ التحضير بنقرة.' },
            { Icon: FileSpreadsheet, t: 'تقارير جاهزة', d: 'كشوف ودرجات وتقارير الطلاب بصيغتي PDF وExcel.' },
            { Icon: ShieldCheck, t: 'بيانات محمية', d: 'حساب خاص لكل معلم، ونسخ احتياطية، وتشفير اختياري.' },
          ].map(({ Icon, t, d }) => (
            <li key={t} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10"><Icon className="size-5 text-[#e8c26a]" /></span>
              <span><b className="block font-semibold">{t}</b><span className="text-white/75">{d}</span></span>
            </li>
          ))}
        </ul>
        <div className="relative text-[13px] text-white/60">{APP_NAME} — السجل الإلكتروني للمعلم</div>
      </aside>
    </div>
  );
}

export function LoginPage() {
  const { user, system, login, booting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  if (booting) return <PageLoader />;
  if (system?.needsSetup) return <Navigate to="/setup" replace />;
  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/'} replace />;

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await login({ email: values.email, password: values.password, remember: values.remember ?? false });
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true });
    } catch (err) {
      setError(applyApiError(form, err));
    }
  });

  return (
    <AuthLayout title="مرحبًا بعودتك" subtitle="سجّل دخولك للمتابعة إلى سجلك.">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message} required>
          {(p) => <Input {...p} type="email" autoComplete="username" dir="ltr" autoFocus placeholder="name@school.om" {...form.register('email')} />}
        </Field>
        <Field label="كلمة المرور" error={form.formState.errors.password?.message} required>
          {(p) => <PasswordInput {...p} autoComplete="current-password" {...form.register('password')} />}
        </Field>
        <Checkbox label="تذكّرني على هذا الجهاز (30 يومًا)" {...form.register('remember')} />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={form.formState.isSubmitting}>
          تسجيل الدخول
        </Button>
        <p className="text-center text-[13px] text-muted">نسيت كلمة المرور؟ تواصل مع مدير النظام لإعادة تعيينها.</p>
      </form>
    </AuthLayout>
  );
}

export function SetupPage() {
  const { user, system, setup, booting } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.input<typeof setupSchema> & { confirm: string }>({
    resolver: zodResolver(
      setupSchema.extend({ confirm: z.string() }).refine((v) => v.password === v.confirm, { message: 'كلمتا المرور غير متطابقتين', path: ['confirm'] }),
    ),
    defaultValues: { fullName: '', email: '', password: '', confirm: '' },
  });

  if (booting) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  if (system && !system.needsSetup) return <Navigate to="/login" replace />;

  const onSubmit = form.handleSubmit(async ({ fullName, email, password }) => {
    setError(null);
    try {
      await setup({ fullName, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(applyApiError(form, err));
    }
  });

  return (
    <AuthLayout title="إعداد سجلي لأول مرة" subtitle="أنشئ حساب مدير النظام (وهو حسابك كمعلم أيضًا). يمكنك لاحقًا إضافة معلمين آخرين.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="الاسم الكامل" error={form.formState.errors.fullName?.message} required>
          {(p) => <Input {...p} autoComplete="name" autoFocus placeholder="مثال: فاطمة بنت سالم البلوشية" {...form.register('fullName')} />}
        </Field>
        <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message} required>
          {(p) => <Input {...p} type="email" autoComplete="username" dir="ltr" placeholder="name@school.om" {...form.register('email')} />}
        </Field>
        <Field label="كلمة المرور" hint="8 أحرف على الأقل. جملة طويلة سهلة التذكّر أفضل من كلمة قصيرة معقّدة." error={form.formState.errors.password?.message} required>
          {(p) => <PasswordInput {...p} autoComplete="new-password" {...form.register('password')} />}
        </Field>
        <Field label="تأكيد كلمة المرور" error={form.formState.errors.confirm?.message} required>
          {(p) => <PasswordInput {...p} autoComplete="new-password" {...form.register('confirm')} />}
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={form.formState.isSubmitting}>
          إنشاء الحساب والبدء
        </Button>
      </form>
    </AuthLayout>
  );
}

/** تُعرض للمستخدم الذي أنشأ له المدير كلمة مرور مؤقتة: لا وصول لأي شيء قبل تغييرها */
export function ForcePasswordChangePage() {
  const { logout, refreshUser, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.input<typeof changePasswordSchema> & { confirm: string }>({
    resolver: zodResolver(
      changePasswordSchema.extend({ confirm: z.string() }).refine((v) => v.newPassword === v.confirm, { message: 'كلمتا المرور غير متطابقتين', path: ['confirm'] }),
    ),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    setError(null);
    try {
      await api.post('/auth/password', { currentPassword, newPassword });
      await refreshUser();
    } catch (err) {
      setError(applyApiError(form, err));
    }
  });

  return (
    <AuthLayout title="اختر كلمة مرور جديدة" subtitle={`مرحبًا ${user?.fullName ?? ''}. كلمة المرور الحالية مؤقتة، ويلزم تغييرها قبل المتابعة.`}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="كلمة المرور المؤقتة" error={form.formState.errors.currentPassword?.message} required>
          {(p) => <PasswordInput {...p} autoComplete="current-password" autoFocus {...form.register('currentPassword')} />}
        </Field>
        <Field label="كلمة المرور الجديدة" error={form.formState.errors.newPassword?.message} required>
          {(p) => <PasswordInput {...p} autoComplete="new-password" {...form.register('newPassword')} />}
        </Field>
        <Field label="تأكيد كلمة المرور الجديدة" error={form.formState.errors.confirm?.message} required>
          {(p) => <PasswordInput {...p} autoComplete="new-password" {...form.register('confirm')} />}
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={form.formState.isSubmitting}>
          حفظ والمتابعة
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => void logout()}>
          تسجيل الخروج
        </Button>
      </form>
    </AuthLayout>
  );
}
