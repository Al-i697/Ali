import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';
import type { AuditEntryDto } from '@shared/dto';
import { api } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { Badge, Button, Card, CardHeader, EmptyState, PageLoader, QueryError } from '@/components/ui';

type Tone = 'neutral' | 'brand' | 'good' | 'info' | 'warn' | 'bad' | 'accent';

const ACTIONS: Record<string, { label: string; tone: Tone }> = {
  setup: { label: 'الإعداد الأولي للنظام', tone: 'brand' },
  login: { label: 'تسجيل دخول', tone: 'good' },
  login_failed: { label: 'محاولة دخول فاشلة', tone: 'bad' },
  logout: { label: 'تسجيل خروج', tone: 'neutral' },
  password_changed: { label: 'تغيير كلمة المرور', tone: 'info' },
  password_reset: { label: 'إعادة تعيين كلمة مرور', tone: 'warn' },
  session_revoked: { label: 'إنهاء جلسة', tone: 'neutral' },
  sessions_revoked_all: { label: 'إنهاء كل الجلسات الأخرى', tone: 'neutral' },
  user_created: { label: 'إنشاء مستخدم', tone: 'brand' },
  user_updated: { label: 'تعديل مستخدم', tone: 'info' },
  user_deleted: { label: 'حذف مستخدم نهائيًا', tone: 'bad' },
  year_created: { label: 'إنشاء عام دراسي', tone: 'brand' },
  year_deleted: { label: 'حذف عام دراسي', tone: 'bad' },
  structure_cloned: { label: 'نسخ بنية عام سابق', tone: 'info' },
  section_created: { label: 'إنشاء شعبة', tone: 'brand' },
  section_deleted: { label: 'حذف شعبة', tone: 'bad' },
  assignment_deleted: { label: 'حذف مقرر من شعبة', tone: 'bad' },
  assessment_deleted: { label: 'حذف تقويم', tone: 'bad' },
  students_added: { label: 'إضافة طلاب', tone: 'brand' },
  students_imported: { label: 'استيراد طلاب', tone: 'brand' },
  students_enrolled: { label: 'تسجيل طلاب في شعبة', tone: 'info' },
  student_moved: { label: 'نقل طالب', tone: 'info' },
  student_deleted: { label: 'حذف طالب', tone: 'bad' },
  report_exported: { label: 'تصدير تقرير', tone: 'neutral' },
  backup_created: { label: 'إنشاء نسخة احتياطية', tone: 'good' },
  backup_downloaded: { label: 'تنزيل نسخة احتياطية', tone: 'warn' },
  backup_deleted: { label: 'حذف نسخة احتياطية', tone: 'bad' },
  backup_restored: { label: 'استعادة نسخة احتياطية', tone: 'warn' },
  backup_restored_upload: { label: 'استعادة من ملف مرفوع', tone: 'warn' },
  ai_enabled: { label: 'تفعيل المساعد الذكي للمعلمين', tone: 'good' },
  ai_disabled: { label: 'إيقاف المساعد الذكي', tone: 'neutral' },
  ai_run: { label: 'طلب إلى المساعد الذكي', tone: 'accent' },
  ai_run_failed: { label: 'فشل طلب المساعد الذكي', tone: 'bad' },
  ai_input_rejected: { label: 'نص رُفض قبل إرساله للمساعد', tone: 'warn' },
};

const PAGE = 50;

export function AuditTab() {
  const fmt = useFmt();
  const [page, setPage] = useState(0);
  const q = useQuery({
    queryKey: ['audit', page],
    queryFn: () => api.get<{ items: AuditEntryDto[]; total: number }>('/audit', { limit: PAGE, offset: page * PAGE }),
    placeholderData: keepPreviousData,
  });
  const pages = q.data ? Math.max(1, Math.ceil(q.data.total / PAGE)) : 1;

  return (
    <Card className="max-w-5xl">
      <CardHeader
        icon={<ScrollText className="size-5" />}
        title="سجل العمليات"
        description="من فعل ماذا ومتى. لا يُسجَّل أي اسم طالب أو درجة، فقط نوع الحدث والحساب والعنوان."
      />
      <div className="px-5 pb-5">
        {q.isPending ? (
          <PageLoader />
        ) : q.error ? (
          <QueryError error={q.error} onRetry={() => void q.refetch()} />
        ) : q.data.items.length === 0 ? (
          <EmptyState icon={<ScrollText className="size-6" />} title="السجل فارغ" />
        ) : (
          <>
            <div className="relative overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[640px] text-[14px]">
                <thead className="bg-surface-2 text-start text-[13px] text-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-start font-medium">الوقت</th>
                    <th className="px-4 py-2.5 text-start font-medium">الحدث</th>
                    <th className="px-4 py-2.5 text-start font-medium">الحساب</th>
                    <th className="px-4 py-2.5 text-start font-medium">العنوان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {q.data.items.map((r) => {
                    const a = ACTIONS[r.action] ?? { label: r.action, tone: 'neutral' as Tone };
                    return (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap px-4 py-2.5 text-ink-2">{fmt.dateTime(r.at)}</td>
                        <td className="px-4 py-2.5">
                          <Badge tone={a.tone}>{a.label}</Badge>
                          {r.action === 'login_failed' && r.meta && typeof r.meta.reason === 'string' ? (
                            <span className="ms-2 text-[12.5px] text-muted">({failReason(r.meta.reason)})</span>
                          ) : null}
                          {r.action === 'ai_input_rejected' && r.meta && typeof r.meta.reason === 'string' ? (
                            <span className="ms-2 text-[12.5px] text-muted">({rejectReason(r.meta.reason)})</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5 text-ink-2" dir="ltr" style={{ textAlign: 'start' }}>{r.userEmail ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted tnum" dir="ltr" style={{ textAlign: 'start' }}>{r.ip ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[14px] text-muted">
              <span>
                {fmt.num(q.data.total, 0)} حدثًا · صفحة {fmt.num(page + 1, 0)} من {fmt.num(pages, 0)}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 0 || q.isFetching} onClick={() => setPage((p) => p - 1)}>
                  <ChevronRight className="size-4" /> الأحدث
                </Button>
                <Button size="sm" variant="secondary" disabled={page + 1 >= pages || q.isFetching} onClick={() => setPage((p) => p + 1)}>
                  الأقدم <ChevronLeft className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function rejectReason(reason: string): string {
  switch (reason) {
    case 'email':
      return 'بريد إلكتروني';
    case 'phone':
      return 'رقم هاتف';
    case 'long_number':
      return 'رقم طويل';
    case 'student_name':
      return 'اسم يطابق طالبًا';
    default:
      return reason;
  }
}

function failReason(reason: string): string {
  switch (reason) {
    case 'unknown_user':
      return 'بريد غير مسجّل';
    case 'bad_password':
      return 'كلمة مرور خاطئة';
    case 'locked':
      return 'الحساب موقوف مؤقتًا';
    case 'disabled':
      return 'حساب معطّل';
    default:
      return reason;
  }
}
