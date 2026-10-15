import { cn } from '@/lib/cn';

type Tone = 'brand' | 'good' | 'info' | 'warn' | 'bad' | 'neutral';

const stroke: Record<Tone, string> = {
  brand: 'stroke-brand',
  good: 'stroke-good',
  info: 'stroke-info',
  warn: 'stroke-warn',
  bad: 'stroke-bad',
  neutral: 'stroke-muted',
};

/** حلقة نسبة مئوية: تُظهر الأداء بنظرة واحدة */
export function Ring({ value, size = 84, thickness = 9, tone = 'brand', children, label }: { value: number | null; size?: number; thickness?: number; tone?: Tone; children?: React.ReactNode; label?: string }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label ?? (value === null ? 'لا بيانات' : `${Math.round(pct)}%`)}>
      <svg width={size} height={size} className="-rotate-90 rtl:rotate-90 rtl:-scale-x-100" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-surface-3" />
        {value !== null ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * c} ${c}`}
            className={cn('transition-[stroke-dasharray] duration-700', stroke[tone])}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

const MASTERY_COLORS = ['bg-bad', 'bg-warn', 'bg-info', 'bg-good'];

/** شريط إتقان من 4 مراحل: يُضيء بقدر المتوسط */
export function MasteryBar({ value }: { value: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`مستوى الإتقان ${value} من 4`}>
      {[1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div className={cn('h-full rounded-full', MASTERY_COLORS[Math.min(3, Math.round(value) - 1 < 0 ? 0 : Math.round(value) - 1)])} style={{ width: `${fill * 100}%` }} />
          </div>
        );
      })}
    </div>
  );
}

/** أعمدة توزيع بسيطة (عدد الطلاب في كل مستوى) */
export function BarList({ items }: { items: { label: string; value: number; display?: string; tone?: Tone }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const fill: Record<Tone, string> = { brand: 'bg-brand', good: 'bg-good', info: 'bg-info', warn: 'bg-warn', bad: 'bg-bad', neutral: 'bg-muted' };
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-[14px]">
          <span className="truncate text-ink-2">{i.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-surface-3"><span className={cn('block h-full rounded-full', fill[i.tone ?? 'brand'])} style={{ width: `${(i.value / max) * 100}%` }} /></span>
          <span className="tnum text-end text-muted">{i.display ?? i.value}</span>
        </li>
      ))}
    </ul>
  );
}
