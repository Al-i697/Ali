import { useQuery } from '@tanstack/react-query';
import { Activity, Globe, HardDrive, ShieldCheck, Sparkles } from 'lucide-react';
import type { AiSettingsDto, AiUsageDto } from '@shared/dto';
import { api } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Badge, Card, CardHeader, PageLoader, QueryError, Switch, useConfirm } from '@/components/ui';

const ERROR_LABEL: Record<string, string> = {
  auth: 'المفتاح مرفوض',
  rate_limit: 'بلغ الحساب حدّ المزوّد',
  timeout: 'انتهت مهلة المزوّد',
  network: 'تعذّر الاتصال بالمزوّد',
  bad_request: 'طلب مرفوض (تحقق من اسم النموذج)',
  server: 'خطأ من جهة المزوّد',
  refused: 'رفض المزوّد الإجابة',
  truncated: 'رد مقطوع',
  invalid_output: 'رد غير مطابق للبنية',
};

const Code = ({ children }: { children: string }) => (
  <code dir="ltr" className="rounded bg-surface-3 px-1 text-[13px]">
    {children}
  </code>
);

function UsageRow({ label, u, num }: { label: string; u: AiUsageDto; num: (n: number) => string }) {
  return (
    <tr className="border-t border-line">
      <th scope="row" className="py-2.5 pe-3 text-start font-medium text-ink">{label}</th>
      <td className="tnum px-2 py-2.5">{num(u.runs)}</td>
      <td className="tnum px-2 py-2.5">{num(u.blocked)}</td>
      <td className="tnum px-2 py-2.5">{num(u.failed)}</td>
      <td className="tnum px-2 py-2.5">{num(u.inputTokens)}</td>
      <td className="tnum px-2 py-2.5">{num(u.outputTokens)}</td>
    </tr>
  );
}

export function AiTab() {
  const fmt = useFmt();
  const confirm = useConfirm();
  const q = useQuery({ queryKey: qk.aiSettings, queryFn: () => api.get<AiSettingsDto>('/ai/settings') });

  const toggle = useAppMutation((enabled: boolean) => api.patch<AiSettingsDto>('/ai/settings', { enabled }), {
    // system: أيقونة/أزرار المساعد عند المعلمين تعتمد عليه
    invalidate: [qk.aiSettings, qk.aiStatus, qk.system],
    success: (d) => (d.enabled ? 'فُعّل المساعد الذكي للمعلمين' : 'أُوقف المساعد الذكي'),
  });

  const onToggle = async (next: boolean) => {
    if (next) {
      const p = q.data?.provider;
      const ok = await confirm({
        title: 'تفعيل المساعد الذكي للمعلمين؟',
        description: (
          <>
            سيتمكن كل معلم من إرسال نص يكتبه بنفسه (عنوان درس، أهداف، ملاحظات، وصف مهارة) إلى <b>{p?.label}</b>{' '}
            <span dir="ltr">({p?.host})</span> للحصول على مقترحات. لا تُرسَل أسماء الطلاب ولا درجاتهم ولا بياناتهم، ولا يُحفظ شيء من المقترحات إلا بعد مراجعة المعلم.
            {p && !p.local ? ' الخدمة خارجية: يخرج النص من خادمك إلى الإنترنت، وتتحمّل مؤسستك تكلفة الاستخدام لدى المزوّد.' : ''} يمكنك الإيقاف في أي وقت.
          </>
        ),
        confirmLabel: 'تفعيل',
      });
      if (!ok) return;
    }
    toggle.mutate(next);
  };

  const num = (n: number) => fmt.num(n, 0);

  return (
    <div className="max-w-4xl space-y-5">
      <Card>
        <CardHeader
          icon={<Sparkles className="size-5" />}
          title="المساعد الذكي"
          description="مسودات تحضير وأفكار تقويم وخطط يقترحها نموذج لغوي، ويراجعها المعلم ويختار ما يُدرَج منها."
        />
        <div className="space-y-4 px-5 pb-5">
          {q.isPending ? (
            <PageLoader />
          ) : q.error ? (
            <QueryError error={q.error} onRetry={() => void q.refetch()} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={q.data.configured ? 'good' : 'neutral'} dot>{q.data.configured ? 'مزوّد مضبوط على الخادم' : 'لا مزوّد مضبوط على الخادم'}</Badge>
                <Badge tone={q.data.enabled ? 'good' : 'neutral'} dot>{q.data.enabled ? 'مفعّل للمعلمين' : 'غير مفعّل للمعلمين'}</Badge>
              </div>

              {!q.data.configured ? (
                <Alert tone="info" title="الميزة معطّلة حتى تضبط مزوّدًا على الخادم">
                  <ol className="mt-1 list-decimal space-y-1 ps-5">
                    <li>
                      في بيئة تشغيل الخادم اضبط <Code>AI_PROVIDER=anthropic</Code> و<Code>ANTHROPIC_API_KEY=…</Code>، ويمكنك اختيار النموذج بـ<Code>AI_MODEL</Code>.
                    </li>
                    <li>
                      أعد تشغيل الخادم ثم تحقق من الاتصال بالأمر <Code>npm run cli -- ai-check</Code>.
                    </li>
                    <li>عُد إلى هذه الصفحة وفعّل المساعد للمعلمين.</li>
                  </ol>
                </Alert>
              ) : (
                <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-line bg-surface-2 p-4 text-[14.5px] sm:grid-cols-2">
                  <div>
                    <dt className="text-[13px] text-muted">المزوّد</dt>
                    <dd className="font-medium text-ink">{q.data.provider?.label}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-muted">النموذج</dt>
                    <dd className="font-medium text-ink" dir="ltr">{q.data.provider?.model}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-muted">وجهة النص</dt>
                    <dd className="flex flex-wrap items-center gap-2 font-medium text-ink">
                      <span dir="ltr">{q.data.provider?.host}</span>
                      {q.data.provider?.local ? (
                        <Badge tone="good"><HardDrive className="size-3.5" aria-hidden /> شبكة محلية</Badge>
                      ) : (
                        <Badge tone="warn"><Globe className="size-3.5" aria-hidden /> خدمة خارجية عبر الإنترنت</Badge>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-muted">حدود الاستخدام</dt>
                    <dd className="text-ink">
                      <span className="tnum">{num(q.data.limits.perDay)}</span> طلبًا يوميًا لكل معلم · <span className="tnum">{num(q.data.limits.perMinute)}</span> في الدقيقة · <span className="tnum">{num(q.data.limits.maxConcurrency)}</span> متزامنة
                    </dd>
                  </div>
                </dl>
              )}

              <div className="rounded-xl border border-line p-4">
                <Switch
                  checked={q.data.enabled}
                  onChange={(v) => void onToggle(v)}
                  disabled={!q.data.configured || toggle.isPending}
                  label={<span className="font-medium text-ink">تفعيل المساعد للمعلمين</span>}
                />
                <p className="mt-1.5 text-[13px] text-muted">
                  {q.data.enabled
                    ? 'تظهر أدوات المساعد للمعلمين في التحضير والخطط العلاجية والإثرائية. الإيقاف فوري.'
                    : 'لن يرى المعلمون أي أداة للمساعد حتى توافق هنا.'}
                </p>
              </div>

              {q.data.lastError ? (
                <Alert tone="warn" title="آخر خطأ من المزوّد منذ تشغيل الخادم">
                  {ERROR_LABEL[q.data.lastError.kind] ?? q.data.lastError.kind}
                  {q.data.lastError.status ? ` (HTTP ${q.data.lastError.status})` : ''} — {fmt.dateTime(q.data.lastError.at)}. للتشخيص نفّذ <Code>npm run cli -- ai-check</Code>.
                </Alert>
              ) : null}
            </>
          )}
        </div>
      </Card>

      {q.data?.configured ? (
        <Card>
          <CardHeader icon={<Activity className="size-5" />} title="الاستخدام" description="أرقام مجمّعة من سجل العمليات؛ لا يُحفظ أي نص مُرسَل أو مُستلَم." />
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full min-w-[34rem] text-[14.5px]">
              <thead>
                <tr className="text-[13px] text-muted">
                  <th scope="col" className="pb-2 pe-3 text-start font-medium"><span className="sr-only">الفترة</span></th>
                  <th scope="col" className="px-2 pb-2 text-start font-medium">طلبات ناجحة</th>
                  <th scope="col" className="px-2 pb-2 text-start font-medium">رُفضت قبل الإرسال</th>
                  <th scope="col" className="px-2 pb-2 text-start font-medium">فشلت</th>
                  <th scope="col" className="px-2 pb-2 text-start font-medium">رموز الدخل</th>
                  <th scope="col" className="px-2 pb-2 text-start font-medium">رموز الخرج</th>
                </tr>
              </thead>
              <tbody>
                <UsageRow label="آخر 24 ساعة" u={q.data.usage.last24h} num={num} />
                <UsageRow label="آخر 7 أيام" u={q.data.usage.last7d} num={num} />
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <Alert tone="info" title="حماية بيانات الطلاب">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-1 size-4 shrink-0" aria-hidden />
          <ul className="list-disc space-y-0.5 ps-4">
            <li>لا يقرأ المساعد شيئًا من قاعدة البيانات: يصله فقط نص يكتبه المعلم ويراجعه في النافذة، مع الصف واسم المادة.</li>
            <li>يُرفض أي نص فيه بريد إلكتروني أو رقم هاتف أو رقم طويل، ويُنبَّه المعلم إن طابق النص اسم أحد طلابه.</li>
            <li>لا يُحفظ شيء من المقترحات آليًا؛ يختار المعلم ما يُدرَج ويعدّله، ويظهر المقترح موسومًا «مقترح من مساعد آلي — راجعه».</li>
            <li>سجل العمليات يحفظ نوع الطلب وأعداد الرموز فقط، دون أي نص مُرسَل أو مُستلَم.</li>
          </ul>
        </div>
      </Alert>
    </div>
  );
}
