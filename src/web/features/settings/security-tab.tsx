import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Laptop, LogOut, Smartphone, Tablet } from 'lucide-react';
import { passwordSchema } from '@shared/schemas/auth';
import type { SessionDto } from '@shared/dto';
import { api } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Field, PageLoader, PasswordInput, QueryError, useConfirm } from '@/components/ui';

const formSchema = z
  .object({
    currentPassword: z.string().min(1, 'أدخل كلمة المرور الحالية'),
    newPassword: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { error: 'كلمتا المرور غير متطابقتين', path: ['confirm'] });

type PasswordForm = z.input<typeof formSchema>;

function PasswordCard() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PasswordForm>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });
  const change = useAppMutation(
    (v: PasswordForm) => api.post('/auth/password', { currentPassword: v.currentPassword, newPassword: v.newPassword }),
    {
      invalidate: [qk.sessions],
      success: 'تم تغيير كلمة المرور وإنهاء الجلسات الأخرى',
      silentError: true,
      onSuccess: () => {
        setError(null);
        form.reset();
      },
      onError: (e) => setError(applyApiError(form, e)),
    },
  );
  const e = form.formState.errors;
  return (
    <Card className="max-w-3xl">
      <CardHeader title="تغيير كلمة المرور" description="بعد التغيير تُنهى جلساتك على الأجهزة الأخرى تلقائيًا." />
      <form className="space-y-4 px-5 pb-5" onSubmit={form.handleSubmit((v) => change.mutate(v))} noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="كلمة المرور الحالية" required error={e.currentPassword?.message}>
          {(f) => <PasswordInput {...f} autoComplete="current-password" {...form.register('currentPassword')} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="كلمة المرور الجديدة" required error={e.newPassword?.message} hint="8 أحرف فأكثر، وليست أرقامًا فقط ولا من الكلمات الشائعة.">
            {(f) => <PasswordInput {...f} autoComplete="new-password" {...form.register('newPassword')} />}
          </Field>
          <Field label="تأكيد كلمة المرور الجديدة" required error={e.confirm?.message}>
            {(f) => <PasswordInput {...f} autoComplete="new-password" {...form.register('confirm')} />}
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={change.isPending}>
            تغيير كلمة المرور
          </Button>
        </div>
      </form>
    </Card>
  );
}

/** وصف مبسّط للجهاز من User-Agent (تقدير للعرض فقط، لا يُعتمد عليه أمنيًا) */
function describeAgent(ua: string | null): { label: string; kind: 'phone' | 'tablet' | 'desktop' } {
  if (!ua) return { label: 'جهاز غير معروف', kind: 'desktop' };
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /iPhone|iPad|iPod/i.test(ua)
      ? 'iOS'
      : /Android/i.test(ua)
        ? 'Android'
        : /Mac OS X|Macintosh/i.test(ua)
          ? 'macOS'
          : /CrOS/i.test(ua)
            ? 'ChromeOS'
            : /Linux/i.test(ua)
              ? 'Linux'
              : null;
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/i.test(ua)
      ? 'Opera'
      : /Firefox\//i.test(ua)
        ? 'Firefox'
        : /Chrome\/|CriOS/i.test(ua)
          ? 'Chrome'
          : /Safari\//i.test(ua)
            ? 'Safari'
            : null;
  const kind = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet' : /iPhone|Android.*Mobile|Mobile/i.test(ua) ? 'phone' : 'desktop';
  const parts = [browser, os].filter(Boolean);
  return { label: parts.length ? parts.join(' على ') : 'متصفح غير معروف', kind };
}

const KindIcon = { phone: Smartphone, tablet: Tablet, desktop: Laptop } as const;

function SessionsCard() {
  const fmt = useFmt();
  const confirm = useConfirm();
  const q = useQuery({ queryKey: qk.sessions, queryFn: () => api.get<SessionDto[]>('/auth/sessions') });
  const revoke = useAppMutation((id: string) => api.del(`/auth/sessions/${id}`), { invalidate: [qk.sessions], success: 'أُنهيت الجلسة' });
  const revokeOthers = useAppMutation(() => api.post('/auth/logout-others'), { invalidate: [qk.sessions], success: 'أُنهيت كل الجلسات الأخرى' });

  const others = q.data?.filter((s) => !s.current) ?? [];

  return (
    <Card className="max-w-3xl">
      <CardHeader
        title="الأجهزة المتصلة بحسابك"
        description="إن لم تتعرف على جلسة فأنهِها وغيّر كلمة المرور."
        action={
          others.length > 0 ? (
            <Button
              size="sm"
              variant="dangerSoft"
              loading={revokeOthers.isPending}
              onClick={async () => {
                if (await confirm({ title: 'إنهاء كل الجلسات الأخرى؟', description: 'ستحتاج الأجهزة الأخرى إلى تسجيل الدخول من جديد. جلستك الحالية تبقى كما هي.', confirmLabel: 'إنهاء الجلسات', tone: 'danger' }))
                  revokeOthers.mutate();
              }}
            >
              <LogOut className="size-4" /> إنهاء الأخرى
            </Button>
          ) : null
        }
      />
      <div className="px-5 pb-5">
        {q.isPending ? (
          <PageLoader />
        ) : q.error ? (
          <QueryError error={q.error} onRetry={() => void q.refetch()} />
        ) : q.data.length === 0 ? (
          <EmptyState title="لا جلسات" />
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {q.data.map((s) => {
              const d = describeAgent(s.userAgent);
              const Icon = KindIcon[d.kind];
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-ink-2">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
                      {d.label}
                      {s.current ? <Badge tone="good" dot>هذا الجهاز</Badge> : null}
                    </div>
                    <div className="text-[13px] text-muted">
                      آخر نشاط: {fmt.dateTime(s.lastSeenAt)}
                      {s.ip ? <> · <span dir="ltr" className="tnum">{s.ip}</span></> : null}
                    </div>
                  </div>
                  {!s.current ? (
                    <Button size="sm" variant="ghost" loading={revoke.isPending && revoke.variables === s.id} onClick={() => revoke.mutate(s.id)}>
                      إنهاء
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

export function SecurityTab() {
  return (
    <div className="space-y-5">
      <PasswordCard />
      <SessionsCard />
    </div>
  );
}
