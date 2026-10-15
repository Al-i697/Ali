import type { HTMLAttributes, ReactNode } from 'react';
import { AlertTriangle, CircleCheck, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-[spin_0.8s_linear_infinite] text-muted', className)} aria-hidden />;
}

export function PageLoader({ label = 'جارٍ التحميل…' }: { label?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Spinner className="size-7" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-[shimmer_1.6s_linear_infinite] rounded-lg bg-[linear-gradient(90deg,var(--surface-3)_25%,var(--surface-2)_37%,var(--surface-3)_63%)] bg-[length:400%_100%]', className)}
      aria-hidden
      {...rest}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong bg-surface-2 px-6 py-12 text-center', className)}>
      {icon ? <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">{icon}</div> : null}
      <div>
        <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
        {description ? <p className="mx-auto mt-1 max-w-md text-[15px] text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const alertTones = {
  info: { cls: 'border-info/30 bg-info-soft text-info', Icon: Info },
  warn: { cls: 'border-warn/30 bg-warn-soft text-warn', Icon: AlertTriangle },
  bad: { cls: 'border-bad/30 bg-bad-soft text-bad', Icon: AlertTriangle },
  good: { cls: 'border-good/30 bg-good-soft text-good', Icon: CircleCheck },
};

export function Alert({ tone = 'info', title, children, className, action }: { tone?: keyof typeof alertTones; title?: ReactNode; children?: ReactNode; className?: string; action?: ReactNode }) {
  const { cls, Icon } = alertTones[tone];
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', cls, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 text-[14.5px] leading-6">
        {title ? <div className="font-semibold">{title}</div> : null}
        {children ? <div>{children}</div> : null}
      </div>
      {action}
    </div>
  );
}

/** خطأ تحميل مع زر إعادة المحاولة */
export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : 'تعذّر تحميل البيانات';
  return (
    <Alert
      tone="bad"
      title="تعذّر تحميل البيانات"
      action={
        onRetry ? (
          <button onClick={onRetry} className="shrink-0 rounded-lg px-3 py-1 text-sm font-semibold underline-offset-4 hover:underline">
            إعادة المحاولة
          </button>
        ) : undefined
      }
    >
      {msg}
    </Alert>
  );
}
