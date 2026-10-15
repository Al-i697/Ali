import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded-ctl border border-line-strong bg-surface px-3 text-[15px] text-ink shadow-[inset_0_1px_0_rgb(0_0_0/0.02)] transition-[border-color,box-shadow] placeholder:text-muted/80 hover:border-muted/60 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/25 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-70 aria-[invalid=true]:border-bad aria-[invalid=true]:ring-bad/20';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(control, 'h-10', className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 3, ...rest },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(control, 'min-h-20 py-2 leading-7', className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, 'h-10 appearance-none pe-3 ps-9', className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
});

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
};

/** حقل نموذج: ربط الملصق بالعنصر (a11y) وعرض الخطأ والتلميح */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const descId = error || hint ? `${id}-d` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink-2">
          {label}
          {required ? <span className="ms-1 text-bad" aria-hidden>*</span> : null}
        </label>
      ) : null}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': descId })}
      {error ? (
        <p id={descId} role="alert" className="text-[13px] text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }>(function Checkbox(
  { className, label, ...rest },
  ref,
) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2.5 text-[15px]', rest.disabled && 'cursor-not-allowed opacity-60', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface transition-colors checked:border-brand checked:bg-brand checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222.4%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><path%20d=%22M3.5%208.5l3%203%206-7%22/></svg>')] checked:bg-center checked:bg-no-repeat"
        {...rest}
      />
      {label}
    </label>
  );
});

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-3 text-[15px]', disabled && 'cursor-not-allowed opacity-60')}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand' : 'bg-line-strong')}
      >
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start]', checked ? 'start-[22px]' : 'start-0.5')} />
      </button>
      {label}
    </label>
  );
}
