// هيكل مشترك لنوافذ المساعد الذكي: ثلاث خطوات — إدخال ← جارٍ الإعداد ← مراجعة.
// يضمن في كل مكان: الإفصاح عن وجهة النص، وسمة «مقترح من مساعد آلي — راجعه»، وتأكيد الأسماء، والحصة اليومية،
// وعدم إدراج شيء إلا بقرار المعلم.
import { useState, type ReactNode } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { Alert, Badge, Button, Checkbox, EmptyState, Modal, PageLoader, QueryError } from '@/components/ui';
import type { AiRunState, useAiStatus } from './use-ai';

/** رمز خطأ الخادم حين يطابق النص اسمًا من أسماء طلاب المعلم */
export const NAME_CONFIRM_CODE = 'AI_NAME_CONFIRM_REQUIRED';

type Props = {
  title: string;
  description: string;
  status: ReturnType<typeof useAiStatus>;
  state: AiRunState;
  /** حقول الإدخال (الخطوة الأولى) */
  form: ReactNode;
  /** المدخلات مكتملة (مثل وجود عنوان) */
  canRun: boolean;
  /** مشكلة تمنع الإرسال وتُعرض للمعلم (تجاوز طول…) */
  problem: string | null;
  /** بصمة المدخلات: تعديلها يُسقط الخطأ السابق وتأكيد الأسماء */
  inputKey: string;
  onRun: (acknowledgeNames: boolean) => void;
  onCancel: () => void;
  onBack: () => void;
  onClose: () => void;
  /** خطوة المراجعة */
  review: ReactNode;
  applyLabel: string;
  canApply: boolean;
  onApply: () => void;
};

export function AiAssistShell(p: Props) {
  const fmt = useFmt();
  const [confirmFor, setConfirmFor] = useState<string | null>(null);
  const st = p.status.data;
  const ready = !!st?.ready;
  const left = st ? Math.max(0, st.limits.perDay - st.limits.usedToday) : null;
  const quotaOut = left === 0;
  const running = p.state.phase === 'running';
  const done = p.state.phase === 'done' ? p.state : null;
  const err = p.state.phase === 'error' && p.state.key === p.inputKey ? p.state : null;
  const needsNames = err?.code === NAME_CONFIRM_CODE;
  const confirmed = confirmFor === p.inputKey;
  const runDisabled = !ready || quotaOut || !p.canRun || !!p.problem || (needsNames && !confirmed);

  const footer = running ? (
    <Button variant="ghost" onClick={p.onCancel}>إلغاء الطلب</Button>
  ) : done ? (
    <>
      <Button variant="ghost" onClick={p.onClose}>إغلاق دون إدراج</Button>
      <Button variant="secondary" onClick={p.onBack}>تعديل المدخلات</Button>
      <Button variant="primary" icon={<Check className="size-4" />} disabled={!p.canApply} onClick={p.onApply}>{p.applyLabel}</Button>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={p.onClose}>إغلاق</Button>
      {ready ? (
        <Button variant="primary" icon={<Sparkles className="size-4" />} disabled={runDisabled} onClick={() => p.onRun(needsNames && confirmed)}>
          {needsNames ? 'أرسل بعد التأكيد' : err ? 'حاول مجددًا' : 'اقترح'}
        </Button>
      ) : null}
    </>
  );

  let body: ReactNode;
  if (p.status.isPending) {
    body = <PageLoader label="جارٍ التحقق من توفر المساعد…" />;
  } else if (p.status.error) {
    body = <QueryError error={p.status.error} onRetry={() => void p.status.refetch()} />;
  } else if (!ready) {
    body = <EmptyState icon={<Sparkles className="size-6" />} title="المساعد الذكي غير متاح حاليًا" description="أُوقف أو لم يعد مفعّلًا على هذا الخادم. تواصل مع مدير النظام." />;
  } else if (running) {
    body = (
      <div role="status" aria-live="polite" className="grid min-h-52 place-items-center text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-[spin_0.8s_linear_infinite] text-brand" aria-hidden />
          <div className="text-[16px] font-semibold text-ink">جارٍ إعداد المقترح…</div>
          <p className="max-w-sm text-[14px] text-muted">قد يستغرق ذلك من بضع ثوانٍ إلى دقيقة. يمكنك إلغاء الطلب؛ وما يصل بعد الإلغاء يُتجاهل.</p>
        </div>
      </div>
    );
  } else if (done) {
    body = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent"><Sparkles className="size-3.5" aria-hidden /> مقترح من مساعد آلي — راجعه</Badge>
          <span className="text-[13px] text-muted">{done.response.source.label}</span>
        </div>
        <p className="text-[14px] text-muted">اختر ما تريد إدراجه. لن يُستبدل شيء مما كتبته، وبعد الإدراج تعدّله كما تشاء. تأكد من صحة المعلومات العلمية والمنهجية قبل الاعتماد.</p>
        {p.review}
      </div>
    );
  } else {
    const prov = st?.provider;
    body = (
      <div className="space-y-4">
        <Alert tone="info" title="ماذا يُرسَل إلى المساعد؟">
          <p>
            نص الحقول أدناه فقط (مع الصف والمادة إن حُدّدا) يُرسَل إلى <b>{prov?.label}</b> <span dir="ltr" className="text-muted">({prov?.host})</span>
            {prov?.local ? ' الذي يعمل على شبكتك المحلية' : ''}. لا تكتب أسماء طلاب أو أرقام هواتف أو أي بيانات شخصية. المقترح مسودة تراجعها وتختار ما يُدرَج منها؛ ولا يُحفظ شيء تلقائيًا.
          </p>
        </Alert>
        {quotaOut ? (
          <Alert tone="warn" title="بلغتَ حصتك اليومية">
            استنفدتَ {fmt.num(st!.limits.perDay, 0)} طلبًا خلال آخر 24 ساعة. يتجدد الرصيد تدريجيًا.
          </Alert>
        ) : null}
        {err ? (
          needsNames ? (
            <Alert tone="warn" title="تنبيه: النص يطابق اسمًا من أسماء طلابك">
              <p>{err.message}</p>
              <div className="mt-2">
                <Checkbox
                  checked={confirmed}
                  onChange={(e) => setConfirmFor(e.target.checked ? p.inputKey : null)}
                  label={<span className="text-[14.5px] font-medium">أؤكد أن الاسم الوارد ليس اسم أحد طلابي (شخصية عامة أو تاريخية مثلًا)</span>}
                />
              </div>
            </Alert>
          ) : (
            <Alert tone="bad" title="تعذّر الحصول على اقتراح">{err.message}</Alert>
          )
        ) : null}
        {p.form}
        {p.problem ? <p role="alert" className="text-[13px] text-bad">{p.problem}</p> : null}
        {left !== null && !quotaOut ? (
          <p className="text-[12.5px] text-muted">المتبقي من حصتك اليوم: <span className="tnum">{fmt.num(left, 0)}</span> من <span className="tnum">{fmt.num(st!.limits.perDay, 0)}</span> طلبًا.</p>
        ) : null}
      </div>
    );
  }

  return (
    <Modal open onOpenChange={(o) => !o && p.onClose()} size="lg" title={p.title} description={p.description} footer={footer} dismissible={!running && !done}>
      {body}
    </Modal>
  );
}

/** قسم في خطوة المراجعة: خانة اختيار للقسم كله وعناصره تحتها */
export function ReviewSection({
  title,
  checked,
  onChange,
  note,
  children,
}: {
  title: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={cn('rounded-xl border p-3.5 transition-colors', checked ? 'border-brand/40 bg-brand-soft/30' : 'border-line')}>
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} label={<span className="text-[15px] font-semibold text-ink">{title}</span>} />
      {note ? <p className="ms-7 mt-1 text-[12.5px] text-warn">{note}</p> : null}
      <div className="ms-7 mt-2 text-[14.5px] leading-7 text-ink-2">{children}</div>
    </section>
  );
}

/** قائمة نقطية بسيطة لعناصر المقترح */
export function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-0.5 ps-5">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}
