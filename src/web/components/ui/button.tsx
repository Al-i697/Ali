import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'dangerSoft';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'iconSm';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-ctl font-medium whitespace-nowrap select-none transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg shadow-card hover:bg-brand-hover',
  secondary: 'border border-line-strong bg-surface text-ink shadow-card hover:bg-surface-3',
  ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
  soft: 'bg-brand-soft text-brand hover:brightness-95 dark:hover:brightness-125',
  danger: 'bg-bad text-brand-fg shadow-card hover:brightness-95',
  dangerSoft: 'bg-bad-soft text-bad hover:brightness-95 dark:hover:brightness-125',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
  iconSm: 'h-8 w-8',
};

export function buttonClasses(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[opts.variant ?? 'secondary'], sizes[opts.size ?? 'md'], opts.className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, icon, children, className, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonClasses({ variant, size, className })} {...rest}>
      {loading ? <Loader2 className="size-4 animate-[spin_0.8s_linear_infinite]" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  variant,
  size,
  icon,
  children,
  className,
  ...rest
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode }) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

/** زر أيقونة بلا نص: يجب تمرير aria-label */
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { label: string }>(function IconButton(
  { label, variant = 'ghost', size = 'icon', children, ...rest },
  ref,
) {
  return (
    <Button ref={ref} variant={variant} size={size} aria-label={label} title={label} {...rest}>
      {children}
    </Button>
  );
});
