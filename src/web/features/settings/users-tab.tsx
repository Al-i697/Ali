import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Ban, KeyRound, MoreVertical, Pencil, RefreshCw, ShieldCheck, Trash2, UserCheck, UserPlus } from 'lucide-react';
import { USER_ROLE, type UserRole } from '@shared/constants';
import { createUserSchema, passwordSchema } from '@shared/schemas/auth';
import type { UserDto } from '@shared/dto';
import { useAuth } from '@/context/auth';
import { api, errorMessage } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  IconButton,
  Input,
  Menu,
  MenuItem,
  MenuSeparator,
  Modal,
  PageLoader,
  QueryError,
  Select,
  useConfirm,
} from '@/components/ui';

/** كلمة مرور مؤقتة عشوائية قوية (بلا حروف ملتبسة مثل O/0 وl/1) */
function generatePassword(length = 12): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const alphabet = letters + digits;
  const limit = 256 - (256 % alphabet.length); // رفض العينات المنحازة
  for (;;) {
    const out: string[] = [];
    const buf = new Uint8Array(length * 2);
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b < limit) out.push(alphabet[b % alphabet.length]!);
      if (out.length === length) break;
    }
    const s = out.join('');
    if (s.length === length && /[A-Za-z]/.test(s) && /\d/.test(s)) return s;
  }
}

type CreateForm = { fullName: string; email: string; password: string; role: UserRole };

function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateForm>({
    resolver: zodResolver(createUserSchema) as never,
    defaultValues: { fullName: '', email: '', password: '', role: 'teacher' },
  });
  useEffect(() => {
    if (open) {
      setError(null);
      form.reset({ fullName: '', email: '', password: generatePassword(), role: 'teacher' });
    }
  }, [open, form]);
  const create = useAppMutation((v: CreateForm) => api.post<UserDto>('/users', v), {
    invalidate: [qk.users],
    silentError: true,
    onSuccess: (u) => {
      toast.success(`أُنشئ حساب ${u.fullName}. سلّمه كلمة المرور المؤقتة وسيُلزَم بتغييرها عند أول دخول.`, { duration: 8000 });
      onOpenChange(false);
    },
    onError: (e) => setError(applyApiError(form, e)),
  });
  const e = form.formState.errors;
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="إضافة مستخدم"
      description="ينشئ حسابًا مستقلًّا ببيانات منفصلة تمامًا عن بقية الحسابات."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button variant="primary" loading={create.isPending} onClick={form.handleSubmit((v) => create.mutate(v))}>إنشاء الحساب</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(ev) => { ev.preventDefault(); void form.handleSubmit((v) => create.mutate(v))(); }} noValidate>
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="الاسم الكامل" required error={e.fullName?.message}>{(f) => <Input {...f} autoFocus {...form.register('fullName')} />}</Field>
        <Field label="البريد الإلكتروني" required error={e.email?.message}>{(f) => <Input {...f} type="email" dir="ltr" className="text-start" autoComplete="off" placeholder="name@school.om" {...form.register('email')} />}</Field>
        <Field label="الدور" error={e.role?.message}>
          {(f) => (
            <Select {...f} {...form.register('role')}>
              {USER_ROLE.items.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          )}
        </Field>
        <Field label="كلمة المرور المؤقتة" required error={e.password?.message} hint="تُعرض هنا مرة واحدة فقط — انسخها وسلّمها للمستخدم. يُلزَم بتغييرها عند أول دخول.">
          {(f) => (
            <div className="flex gap-2">
              <Input {...f} dir="ltr" className="text-start font-mono" autoComplete="off" {...form.register('password')} />
              <Button type="button" variant="secondary" onClick={() => form.setValue('password', generatePassword(), { shouldValidate: true })}>
                <RefreshCw className="size-4" /> توليد
              </Button>
            </div>
          )}
        </Field>
      </form>
    </Modal>
  );
}

function EditUserDialog({ user, onClose }: { user: UserDto | null; onClose: () => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      setName(user.fullName);
      setRole(user.role);
      setError(null);
    }
  }, [user]);
  const save = useAppMutation(() => api.patch(`/users/${user!.id}`, { fullName: name, role }), {
    invalidate: [qk.users],
    success: 'حُفظت بيانات المستخدم',
    silentError: true,
    onSuccess: onClose,
    onError: (e) => setError(errorMessage(e)),
  });
  return (
    <Modal
      open={!!user}
      onOpenChange={(o) => !o && onClose()}
      size="sm"
      title="تعديل المستخدم"
      description={user?.email}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" loading={save.isPending} disabled={!name.trim()} onClick={() => save.mutate()}>حفظ</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Field label="الاسم الكامل" required>{(f) => <Input {...f} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="الدور" hint="المدير يرى إعدادات النظام والنسخ الاحتياطي وسجل العمليات، لكنه لا يرى بيانات الطلاب لدى المعلمين.">
          {(f) => (
            <Select {...f} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {USER_ROLE.items.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          )}
        </Field>
      </div>
    </Modal>
  );
}

function ResetPasswordDialog({ user, onClose }: { user: UserDto | null; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      setPw(generatePassword());
      setError(null);
    }
  }, [user]);
  const reset = useAppMutation(() => api.post(`/users/${user!.id}/reset-password`, { newPassword: pw }), {
    invalidate: [qk.users],
    success: 'عُيّنت كلمة مرور مؤقتة وأُنهيت جلسات المستخدم',
    silentError: true,
    onSuccess: onClose,
    onError: (e) => setError(errorMessage(e)),
  });
  const check = passwordSchema.safeParse(pw);
  return (
    <Modal
      open={!!user}
      onOpenChange={(o) => !o && onClose()}
      size="sm"
      title="إعادة تعيين كلمة المرور"
      description={user ? `${user.fullName} — ${user.email}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" loading={reset.isPending} disabled={!check.success} onClick={() => reset.mutate()}>تعيين</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <Alert tone="warn">سيُنهى دخول المستخدم على كل أجهزته، ويُلزَم بتغيير كلمة المرور عند أول دخول.</Alert>
        <Field label="كلمة المرور المؤقتة" error={!check.success && pw ? check.error.issues[0]?.message : undefined} hint="انسخها وسلّمها للمستخدم الآن؛ لا تُعرض مرة أخرى.">
          {(f) => (
            <div className="flex gap-2">
              <Input {...f} dir="ltr" className="text-start font-mono" autoComplete="off" value={pw} onChange={(e) => setPw(e.target.value)} />
              <Button type="button" variant="secondary" onClick={() => setPw(generatePassword())}>
                <RefreshCw className="size-4" /> توليد
              </Button>
            </div>
          )}
        </Field>
      </div>
    </Modal>
  );
}

export function UsersTab() {
  const fmt = useFmt();
  const confirm = useConfirm();
  const { user: me } = useAuth();
  const q = useQuery({ queryKey: qk.users, queryFn: () => api.get<UserDto[]>('/users') });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [resetting, setResetting] = useState<UserDto | null>(null);

  const setStatus = useAppMutation((v: { id: string; status: 'active' | 'disabled' }) => api.patch(`/users/${v.id}`, { status: v.status }), {
    invalidate: [qk.users],
    success: (_d, v) => (v.status === 'disabled' ? 'عُطّل الحساب وأُنهيت جلساته' : 'فُعّل الحساب'),
  });
  const remove = useAppMutation((u: UserDto) => api.del(`/users/${u.id}`, { confirm: u.email }), {
    invalidate: [qk.users],
    success: 'حُذف الحساب وكل بياناته نهائيًا',
  });

  const disable = async (u: UserDto) => {
    const ok = await confirm({
      title: `تعطيل حساب ${u.fullName}؟`,
      description: 'سيُنهى دخوله فورًا ولن يستطيع تسجيل الدخول. بياناته تبقى محفوظة ويمكنك إعادة تفعيله لاحقًا.',
      confirmLabel: 'تعطيل الحساب',
      tone: 'danger',
    });
    if (ok) setStatus.mutate({ id: u.id, status: 'disabled' });
  };

  const del = async (u: UserDto) => {
    const ok = await confirm({
      title: `حذف حساب ${u.fullName} نهائيًا؟`,
      description: 'سيُحذف الحساب مع كل ما يملكه من شعب وطلاب ودروس ودرجات وملفات، ولا يمكن التراجع عن ذلك إلا باستعادة نسخة احتياطية.',
      confirmLabel: 'حذف نهائيًا',
      tone: 'danger',
      requireText: u.email,
    });
    if (ok) remove.mutate(u);
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader
        title="المستخدمون"
        description="لكل معلم حساب مستقل وبياناته معزولة عن الآخرين. لا يوجد تسجيل ذاتي: أنت من يُنشئ الحسابات."
        action={<Button variant="primary" size="sm" onClick={() => setCreating(true)}><UserPlus className="size-4" /> إضافة مستخدم</Button>}
      />
      <div className="px-5 pb-5">
        {q.isPending ? (
          <PageLoader />
        ) : q.error ? (
          <QueryError error={q.error} onRetry={() => void q.refetch()} />
        ) : q.data.length === 0 ? (
          <EmptyState title="لا مستخدمين" />
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {q.data.map((u) => {
              const self = u.id === me?.id;
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar name={u.fullName} />
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
                      {u.fullName}
                      {self ? <Badge tone="info">أنت</Badge> : null}
                      {u.isDemo ? <Badge tone="warn">تجريبي</Badge> : null}
                    </div>
                    <div className="truncate text-[13px] text-muted" dir="ltr" style={{ textAlign: 'start' }}>{u.email}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'}>{u.role === 'admin' ? <ShieldCheck className="size-3.5" /> : null}{USER_ROLE.labels[u.role]}</Badge>
                    <Badge tone={u.status === 'active' ? 'good' : 'bad'} dot>{u.status === 'active' ? 'نشط' : 'معطّل'}</Badge>
                    {u.mustChangePassword ? <Badge tone="warn">كلمة مؤقتة</Badge> : null}
                  </div>
                  <div className="w-full text-[12.5px] text-muted sm:w-auto sm:min-w-36">
                    آخر دخول: {u.lastLoginAt ? fmt.dateTime(u.lastLoginAt) : 'لم يدخل بعد'}
                  </div>
                  <Menu
                    align="end"
                    trigger={<IconButton label={`إجراءات ${u.fullName}`} variant="ghost" size="iconSm"><MoreVertical className="size-4" /></IconButton>}
                  >
                    <MenuItem icon={<Pencil className="size-4" />} onSelect={() => setEditing(u)}>تعديل الاسم والدور</MenuItem>
                    <MenuItem icon={<KeyRound className="size-4" />} onSelect={() => setResetting(u)}>إعادة تعيين كلمة المرور</MenuItem>
                    <MenuSeparator />
                    {u.status === 'active' ? (
                      <MenuItem icon={<Ban className="size-4" />} disabled={self} onSelect={() => void disable(u)}>تعطيل الحساب</MenuItem>
                    ) : (
                      <MenuItem icon={<UserCheck className="size-4" />} onSelect={() => setStatus.mutate({ id: u.id, status: 'active' })}>تفعيل الحساب</MenuItem>
                    )}
                    <MenuItem icon={<Trash2 className="size-4" />} danger disabled={self || u.status !== 'disabled'} onSelect={() => void del(u)}>
                      حذف نهائي {u.status !== 'disabled' && !self ? '(بعد التعطيل)' : ''}
                    </MenuItem>
                  </Menu>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <CreateUserDialog open={creating} onOpenChange={setCreating} />
      <EditUserDialog user={editing} onClose={() => setEditing(null)} />
      <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />
    </Card>
  );
}
