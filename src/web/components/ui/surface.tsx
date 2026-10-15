import type { HTMLAttributes, ReactNode } from 'react';
import { initials } from '@shared/arabic';
import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-line bg-surface shadow-card', className)} {...rest} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pb-3 pt-4', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-semibold leading-6 text-ink">{title}</h2>
          {description ? <p className="text-[13px] leading-5 text-muted">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3', className)}>
      <div className="min-w-0">
        {back}
        <h1 className="text-[26px] font-bold leading-9 tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-0.5 max-w-3xl text-[15px] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

type Tone = 'neutral' | 'brand' | 'good' | 'info' | 'warn' | 'bad' | 'accent';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-ink-2',
  brand: 'bg-brand-soft text-brand',
  good: 'bg-good-soft text-good',
  info: 'bg-info-soft text-info',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  accent: 'bg-accent-soft text-accent',
};

export function Badge({ tone = 'neutral', dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-medium leading-5', toneClass[tone], className)}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

/** نبرة المستوى القادمة من إعدادات المعلم إلى لون العرض */
export function bandTone(tone: string | undefined): Tone {
  return tone === 'good' || tone === 'info' || tone === 'warn' || tone === 'bad' ? tone : 'neutral';
}

/** شريحة مادة بلونها المميز */
export function SubjectChip({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      className={cn(`subj-${color} inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[var(--c-soft)] px-2 py-0.5 text-[13px] font-medium text-[var(--c)]`, className)}
    >
      <span className="size-1.5 rounded-full bg-[var(--c)]" aria-hidden />
      {name}
    </span>
  );
}

export function Avatar({ name, size = 36, tone }: { name: string; size?: number; tone?: 'male' | 'female' | null }) {
  const bg = tone === 'female' ? 'bg-accent-soft text-accent' : tone === 'male' ? 'bg-info-soft text-info' : 'bg-brand-soft text-brand';
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-semibold', bg)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function ProgressBar({ value, max = 100, tone = 'brand', className, label }: { value: number; max?: number; tone?: 'brand' | 'good' | 'warn' | 'bad' | 'info'; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  const fill = { brand: 'bg-brand', good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-info' }[tone];
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-surface-3', className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn('h-full rounded-full transition-[width] duration-500', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'brand' | 'good' | 'info' | 'warn' | 'bad' | 'accent';
  className?: string;
}) {
  const t = { brand: 'bg-brand-soft text-brand', good: 'bg-good-soft text-good', info: 'bg-info-soft text-info', warn: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-bad', accent: 'bg-accent-soft text-accent' }[tone];
  return (
    <Card className={cn('flex items-center gap-3 p-3.5 sm:gap-3.5 sm:p-4', className)}>
      {icon ? <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl sm:size-11', t)}>{icon}</span> : null}
      <div className="min-w-0">
        <div className="text-[13px] leading-5 text-muted">{label}</div>
        <div className="tnum text-[22px] font-bold leading-8 text-ink sm:text-[24px]">{value}</div>
        {hint ? <div className="text-[12.5px] leading-4 text-muted">{hint}</div> : null}
      </div>
    </Card>
  );
}
