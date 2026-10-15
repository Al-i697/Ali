import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9', className)} fill="none" aria-hidden>
      <rect width="40" height="40" rx="10" fill="var(--brand)" />
      <path d="M20 12.5c-3-2-7-2.3-10-1.4v17c3-.9 7-.6 10 1.4 3-2 7-2.3 10-1.4v-17c-3-.9-7-.6-10 1.4z" fill="var(--brand-contrast)" fillOpacity=".96" />
      <path d="M20 12.5v17" stroke="var(--brand)" strokeWidth="1.6" />
      <path d="M26.5 9.5v9l2.2-1.8 2.2 1.8v-9z" fill="#d9a441" />
    </svg>
  );
}

export function Wordmark({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[19px] font-bold tracking-tight text-ink">سجلي</div>
        {subtitle ? <div className="text-[12px] text-muted">السجل الإلكتروني للمعلم</div> : null}
      </div>
    </div>
  );
}
