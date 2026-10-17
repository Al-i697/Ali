import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';
import { Textarea } from './form';

/** مفتاح اختيار مقسّم (مثل: أسبوعي | قائمة | قوالب) */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex max-w-full overflow-x-auto rounded-xl bg-surface-3 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors',
            size === 'sm' ? 'px-2.5 py-1 text-[13px]' : 'px-3.5 py-1.5 text-[14.5px]',
            value === o.value ? 'bg-surface text-brand shadow-card' : 'text-muted hover:text-ink',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** حقل وسوم: Enter أو فاصلة تضيف وسمًا، مع اقتراحات جاهزة بنقرة واحدة */
export function TagInput({
  value,
  onChange,
  presets = [],
  placeholder = 'اكتب ثم اضغط Enter',
  max = 30,
  'aria-label': ariaLabel,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  presets?: readonly string[];
  placeholder?: string;
  max?: number;
  'aria-label'?: string;
}) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || value.includes(v) || value.length >= max) return;
    onChange([...value, v]);
  };
  const remove = (v: string) => onChange(value.filter((x) => x !== v));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '،') {
      e.preventDefault();
      add(text);
      setText('');
    } else if (e.key === 'Backspace' && !text && value.length) remove(value[value.length - 1]!);
  };
  const suggestions = presets.filter((p) => !value.includes(p));

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-ctl border border-line-strong bg-surface px-2 py-1.5 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/25"
      >
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md bg-brand-soft py-0.5 pe-1 ps-2.5 text-[14px] text-brand">
            {v}
            <button type="button" onClick={() => remove(v)} className="grid size-5 place-items-center rounded hover:bg-brand/15" aria-label={`إزالة ${v}`}>
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          aria-label={ariaLabel}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => {
            if (text.trim()) {
              add(text);
              setText('');
            }
          }}
          placeholder={value.length ? '' : placeholder}
          className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-[15px] outline-none placeholder:text-muted/80"
        />
      </div>
      {suggestions.length ? (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => add(p)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2.5 py-0.5 text-[13px] text-muted transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
            >
              <Plus className="size-3" /> {p}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** قائمة نصوص مرتّبة قابلة للإضافة والحذف والتحريك (أهداف الدرس، نواتج التعلم…) */
export function ListEditor({
  value,
  onChange,
  placeholder,
  addLabel = 'إضافة',
  'aria-label': ariaLabel,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  'aria-label'?: string;
}) {
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  // القائمة الفارغة تعرض سطرًا واحدًا جاهزًا للكتابة (لا حاجة للنقر على «إضافة» أولًا)؛ لا يُحفظ شيء حتى تُكتب قيمة
  const items = value.length ? value : [''];
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const insertAfter = (i: number) => {
    const next = [...items.slice(0, i + 1), '', ...items.slice(i + 1)];
    onChange(next);
    setTimeout(() => refs.current[i + 1]?.focus(), 0);
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-[12px] font-semibold text-muted tnum">{i + 1}</span>
          <Textarea
            ref={(el) => {
              refs.current[i] = el;
            }}
            rows={1}
            value={item}
            aria-label={ariaLabel ? `${ariaLabel} ${i + 1}` : undefined}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                insertAfter(i);
              } else if (e.key === 'Backspace' && item === '' && items.length > 1) {
                e.preventDefault();
                onChange(items.filter((_, j) => j !== i));
                setTimeout(() => refs.current[Math.max(0, i - 1)]?.focus(), 0);
              }
            }}
            className="min-h-10 flex-1 resize-y"
          />
          <div className="mt-0.5 flex shrink-0 flex-col sm:flex-row">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-3 disabled:opacity-30" aria-label="تحريك للأعلى">
              <ArrowUp className="size-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-3 disabled:opacity-30" aria-label="تحريك للأسفل">
              <ArrowDown className="size-4" />
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid size-8 place-items-center rounded-md text-muted hover:bg-bad-soft hover:text-bad" aria-label="حذف">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <Button variant="soft" size="sm" icon={<Plus className="size-4" />} onClick={() => insertAfter(items.length - 1)}>
        {addLabel}
      </Button>
    </div>
  );
}
