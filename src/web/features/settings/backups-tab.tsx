import { useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DatabaseBackup, Download, FileUp, History, Lock, LockOpen, RotateCcw, Trash2 } from 'lucide-react';
import type { BackupDto, BackupReason } from '@shared/dto';
import { api, downloadFile, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, IconButton, PageLoader, QueryError, Tip, useConfirm } from '@/components/ui';

type BackupsResponse = { items: BackupDto[]; settings: { encrypted: boolean; intervalHours: number; keep: number } };

const REASON_LABEL: Record<BackupReason, string> = {
  manual: 'يدوية',
  auto: 'تلقائية',
  'pre-migration': 'قبل ترقية القاعدة',
  'pre-restore': 'احتياط قبل استعادة',
};

function formatSize(bytes: number, num: (n: number, max?: number) => string): string {
  if (bytes < 1024) return `${num(bytes, 0)} بايت`;
  if (bytes < 1024 * 1024) return `${num(bytes / 1024, 1)} ك.ب`;
  return `${num(bytes / (1024 * 1024), 1)} م.ب`;
}

export function BackupsTab() {
  const fmt = useFmt();
  const confirm = useConfirm();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const q = useQuery({ queryKey: qk.backups, queryFn: () => api.get<BackupsResponse>('/backups') });

  // بعد الاستعادة تتغيّر القاعدة كلها (حتى الجلسات): نفرّغ الذاكرة المؤقتة ونعيد تحميل التطبيق
  const afterRestore = (r: { safety: string }) => {
    toast.success(`اكتملت الاستعادة. حُفظت نسخة احتياط من الوضع السابق باسم ${r.safety}. سيُعاد تحميل التطبيق…`, { duration: 6000 });
    qc.clear();
    setTimeout(() => window.location.assign('/'), 1800);
  };

  const create = useAppMutation(() => api.post<BackupDto>('/backups'), { invalidate: [qk.backups], success: 'أُنشئت نسخة احتياطية وفُحصت سلامتها' });
  const remove = useAppMutation((name: string) => api.del(`/backups/${encodeURIComponent(name)}`), { invalidate: [qk.backups], success: 'حُذفت النسخة' });
  const restore = useAppMutation((name: string) => api.post<{ safety: string }>(`/backups/${encodeURIComponent(name)}/restore`, { confirm: true }), { onSuccess: afterRestore });
  const restoreUpload = useAppMutation(
    (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.upload<{ safety: string }>('/backups/restore-upload', form);
    },
    { onSuccess: afterRestore },
  );

  const askRestore = (title: string, subject: string) =>
    confirm({
      title,
      description: (
        <>
          ستُستبدل <b>كل بيانات النظام الحالية</b> (جميع المعلمين) بمحتوى {subject}. قبل ذلك تُحفظ تلقائيًا نسخة احتياط من الوضع الحالي حتى تستطيع التراجع. ستحتاج إلى تسجيل الدخول من جديد.
        </>
      ),
      confirmLabel: 'استعادة',
      tone: 'danger',
      requireText: 'استعادة',
    });

  const onRestoreFromList = async (b: BackupDto) => {
    if (await askRestore('استعادة هذه النسخة؟', `النسخة المأخوذة في ${fmt.dateTime(b.createdAt)}`)) restore.mutate(b.name);
  };

  const onPickFile = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    if (await askRestore('استعادة من الملف المرفوع؟', `الملف «${file.name}»`)) restoreUpload.mutate(file);
  };

  const onDownload = (b: BackupDto) => downloadFile(`/backups/${encodeURIComponent(b.name)}/download`, undefined, b.name).catch((e) => toast.error(errorMessage(e)));

  const onDelete = async (b: BackupDto) => {
    if (await confirm({ title: 'حذف هذه النسخة؟', description: `النسخة المأخوذة في ${fmt.dateTime(b.createdAt)} ستُحذف نهائيًا من الخادم.`, confirmLabel: 'حذف', tone: 'danger' })) remove.mutate(b.name);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <Card>
        <CardHeader
          icon={<DatabaseBackup className="size-5" />}
          title="النسخ الاحتياطي والاستعادة"
          description="نسخة كاملة متسقة من قاعدة البيانات تُفحص سلامتها فور إنشائها."
          action={
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept=".sqlite,.enc,application/octet-stream" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0])} aria-label="ملف نسخة احتياطية للاستعادة" />
              <Button size="sm" variant="secondary" loading={restoreUpload.isPending} onClick={() => fileRef.current?.click()}>
                <FileUp className="size-4" /> استعادة من ملف
              </Button>
              <Button size="sm" variant="primary" loading={create.isPending} onClick={() => create.mutate()}>
                <DatabaseBackup className="size-4" /> نسخة احتياطية الآن
              </Button>
            </div>
          }
        />
        <div className="space-y-3 px-5 pb-5">
          {q.isPending ? (
            <PageLoader />
          ) : q.error ? (
            <QueryError error={q.error} onRetry={() => void q.refetch()} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 text-[14px] text-ink-2">
                <Badge tone={q.data.settings.encrypted ? 'good' : 'warn'}>
                  {q.data.settings.encrypted ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
                  {q.data.settings.encrypted ? 'النسخ مشفّرة (AES-256)' : 'النسخ غير مشفّرة'}
                </Badge>
                <Badge tone={q.data.settings.intervalHours > 0 ? 'info' : 'neutral'}>
                  <History className="size-3.5" />
                  {q.data.settings.intervalHours > 0 ? `نسخة تلقائية كل ${fmt.num(q.data.settings.intervalHours, 0)} ساعة` : 'النسخ التلقائي متوقف'}
                </Badge>
                <span className="text-muted">تُحفظ آخر {fmt.num(q.data.settings.keep, 0)} نسخة تلقائية، والنسخ اليدوية لا تُحذف تلقائيًا.</span>
              </div>
              {!q.data.settings.encrypted ? (
                <Alert tone="warn" title="نسخ غير مشفّرة">
                  النسخ تحوي بيانات الطلاب. لتشفيرها عيّن المتغير <code dir="ltr" className="rounded bg-surface-3 px-1">BACKUP_PASSPHRASE</code> في إعدادات الخادم ثم أعد تشغيله. (احتفظ بالعبارة في مكان آمن: لا تُستعاد النسخ المشفّرة بدونها.)
                </Alert>
              ) : null}
              {q.data.items.length === 0 ? (
                <EmptyState icon={<DatabaseBackup className="size-6" />} title="لا نسخ بعد" description="أنشئ أول نسخة الآن، وسيأخذ النظام نسخًا تلقائية بعدها." />
              ) : (
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {q.data.items.map((b) => (
                    <li key={b.name} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1 basis-56">
                        <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
                          {fmt.dateTime(b.createdAt)}
                          <Badge tone={b.reason === 'manual' ? 'brand' : b.reason === 'auto' ? 'neutral' : 'accent'}>{REASON_LABEL[b.reason]}</Badge>
                          {b.encrypted ? <Badge tone="good"><Lock className="size-3.5" />مشفّرة</Badge> : null}
                        </div>
                        <div className="flex items-center gap-2 text-[12.5px] text-muted">
                          <span className="shrink-0">{formatSize(b.size, fmt.num)}</span>
                          <span aria-hidden>·</span>
                          <span className="truncate" dir="ltr">{b.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tip label="تنزيل"><IconButton label={`تنزيل النسخة ${b.name}`} size="iconSm" onClick={() => void onDownload(b)}><Download className="size-4" /></IconButton></Tip>
                        <Tip label="استعادة"><IconButton label={`استعادة النسخة ${b.name}`} size="iconSm" disabled={restore.isPending} onClick={() => void onRestoreFromList(b)}><RotateCcw className="size-4" /></IconButton></Tip>
                        <Tip label="حذف"><IconButton label={`حذف النسخة ${b.name}`} size="iconSm" className="text-bad hover:bg-bad-soft" onClick={() => void onDelete(b)}><Trash2 className="size-4" /></IconButton></Tip>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </Card>
      <Alert tone="info" title="نصيحة للأمان">
        نزّل نسخة دورية إلى جهاز آخر أو وسيط خارجي: النسخ المحفوظة على الخادم نفسه لا تحميك من فقدان القرص بالكامل.
      </Alert>
    </div>
  );
}
