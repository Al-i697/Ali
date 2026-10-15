import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';
import { Input } from './form';

// ───────────── النوافذ المنبثقة ─────────────
const sizeClass = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' } as const;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClass;
  dismissible?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-[2px] data-[state=open]:animate-[fade-in_0.15s_ease-out]" />
        <Dialog.Content
          onPointerDownOutside={(e) => !dismissible && e.preventDefault()}
          onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-modal outline-none',
            'data-[state=open]:animate-[pop-in_0.18s_ease-out]',
            'sm:inset-x-auto sm:bottom-auto sm:start-1/2 sm:top-1/2 sm:max-h-[88dvh] sm:-translate-y-1/2 sm:rounded-2xl sm:ltr:-translate-x-1/2 sm:rtl:translate-x-1/2',
            sizeClass[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-[18px] font-semibold leading-7 text-ink">{title}</Dialog.Title>
              <Dialog.Description className={cn('text-[14px] leading-6 text-muted', !description && 'sr-only')}>{description ?? title}</Dialog.Description>
            </div>
            {dismissible ? (
              <Dialog.Close className="-m-1 grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-ink" aria-label="إغلاق">
                <X className="size-5" />
              </Dialog.Close>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3 sm:rounded-b-2xl">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ───────────── التأكيد (وعد يُحلّ بنعم/لا) ─────────────
type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  /** يُطلب كتابة هذا النص حرفيًا للتأكيد (للعمليات المدمّرة جدًا) */
  requireText?: string;
};

const ConfirmContext = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [typed, setTyped] = useState('');
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setTyped('');
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  const ready = !opts?.requireText || typed.trim() === opts.requireText;
  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={!!opts}
        onOpenChange={(o) => !o && close(false)}
        title={opts?.title ?? ''}
        description={opts?.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              {opts?.cancelLabel ?? 'إلغاء'}
            </Button>
            <Button variant={opts?.tone === 'danger' ? 'danger' : 'primary'} disabled={!ready} onClick={() => close(true)}>
              {opts?.confirmLabel ?? 'تأكيد'}
            </Button>
          </>
        }
      >
        {opts?.requireText ? (
          <div className="space-y-2">
            <p className="text-[14.5px] text-ink-2">
              للتأكيد اكتب: <b className="select-all text-ink">{opts.requireText}</b>
            </p>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus dir="auto" aria-label="نص التأكيد" />
          </div>
        ) : null}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm يتطلب ConfirmProvider');
  return ctx;
}

// ───────────── القوائم المنسدلة ─────────────
export function Menu({ trigger, children, align = 'start' }: { trigger: ReactNode; children: ReactNode; align?: 'start' | 'end' | 'center' }) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align={align}
          sideOffset={6}
          collisionPadding={12}
          className="z-50 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-pop data-[state=open]:animate-[pop-in_0.14s_ease-out]"
        >
          {children}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export function MenuItem({
  children,
  icon,
  onSelect,
  danger,
  disabled,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Dropdown.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-[14.5px] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-3',
        danger ? 'text-bad data-[highlighted]:bg-bad-soft' : 'text-ink',
      )}
    >
      {icon ? <span className="grid size-4 place-items-center text-current opacity-80">{icon}</span> : null}
      {children}
    </Dropdown.Item>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <Dropdown.Label className="px-3 pb-1 pt-2 text-xs font-medium text-muted">{children}</Dropdown.Label>;
}

export function MenuSeparator() {
  return <Dropdown.Separator className="my-1.5 h-px bg-line" />;
}

export function MenuRadioGroup({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: ReactNode }) {
  return (
    <Dropdown.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </Dropdown.RadioGroup>
  );
}

export function MenuRadioItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <Dropdown.RadioItem
      value={value}
      className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pe-3 ps-8 text-[14.5px] outline-none data-[highlighted]:bg-surface-3 data-[state=checked]:font-semibold data-[state=checked]:text-brand"
    >
      <Dropdown.ItemIndicator className="absolute start-2.5 grid place-items-center">
        <span className="size-2 rounded-full bg-brand" />
      </Dropdown.ItemIndicator>
      {children}
    </Dropdown.RadioItem>
  );
}

// ───────────── تلميح ─────────────
export function Tip({ label, children, side = 'top' }: { label: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip.Root delayDuration={250}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={6} className="z-[60] max-w-xs rounded-lg bg-ink px-2.5 py-1.5 text-[13px] leading-5 text-bg shadow-pop data-[state=delayed-open]:animate-[fade-in_0.12s_ease-out]">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const TooltipProvider = Tooltip.Provider;
