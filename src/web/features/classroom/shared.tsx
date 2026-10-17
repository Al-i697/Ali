import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Hand, MessageSquareText, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { CLASS_FLAGS, CLASS_RECORD_KIND, type ClassRecordKind } from '@shared/constants';
import { CLASS_FLAG_LABELS, classFlagHint } from '@shared/classroom';
import type { ClassCountsDto, ClassFlag, ClassRecordDto } from '@shared/dto';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { Badge, ProgressBar } from '@/components/ui';

// ألوان الأنواع ثابتة في كل صفحات الوحدة: أخضر = شارك، كهرماني = لم يشارك، أزرق = إيجابي، أحمر = غير حسن، رمادي = ملاحظة
export const recordIcon: Record<ClassRecordKind, LucideIcon> = { positive: ThumbsUp, negative: ThumbsDown, note: MessageSquareText };
export const recordTone = { positive: 'info', negative: 'bad', note: 'neutral' } as const;

const chipTone = {
  positive: 'border-info/30 bg-info-soft text-info',
  negative: 'border-bad/30 bg-bad-soft text-bad',
  note: 'border-line-strong bg-surface-3 text-ink-2',
} as const;

/** الوصف النصي لتسجيل: السبب ثم التفاصيل */
export const recordText = (r: Pick<ClassRecordDto, 'reason' | 'note'>) => [r.reason, r.note].filter(Boolean).join(' — ');

/** شارة المشاركة: شارك ×n / لم يشارك / لم تُسجَّل */
export function ParticipationBadge({ value }: { value: number | null }) {
  const fmt = useFmt();
  if (value === null) return <Badge tone="neutral">لم تُسجَّل</Badge>;
  if (value === 0) return <Badge tone="warn" dot>لم يشارك</Badge>;
  return (
    <Badge tone="good" dot>
      شارك{value > 1 ? <span className="tnum"> ×{fmt.num(value, 0)}</span> : null}
    </Badge>
  );
}

/** تسجيل سلوك أو ملاحظة بشكل شريحة: يُفتح للتعديل، وزر × يحذفه (مع تراجع) */
export function RecordChip({ r, onOpen, onRemove, disabled }: { r: ClassRecordDto; onOpen: () => void; onRemove: () => void; disabled?: boolean }) {
  const Icon = recordIcon[r.kind];
  const text = recordText(r);
  const label = `${CLASS_RECORD_KIND.labels[r.kind]}: ${text}`;
  return (
    <li className={cn('inline-flex max-w-full items-center rounded-full border text-[13.5px]', chipTone[r.kind])}>
      <button type="button" onClick={onOpen} disabled={disabled} className="inline-flex min-w-0 items-center gap-1.5 rounded-full py-1 pe-2 ps-2.5 hover:brightness-95" aria-label={`تعديل: ${label}`} title={label}>
        <Icon className="size-3.5 shrink-0" aria-hidden />
        <span className="max-w-[15rem] truncate sm:max-w-[22rem]">{text}</span>
      </button>
      <button type="button" onClick={onRemove} disabled={disabled} className="me-0.5 grid size-6 shrink-0 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label={`حذف: ${label}`}>
        <X className="size-3.5" aria-hidden />
      </button>
    </li>
  );
}

type ActionTone = 'good' | 'warn' | 'info' | 'bad';
const actionOn: Record<ActionTone, string> = {
  good: 'border-good/40 bg-good-soft text-good',
  warn: 'border-warn/40 bg-warn-soft text-warn',
  info: 'border-info/40 bg-info-soft text-info',
  bad: 'border-bad/40 bg-bad-soft text-bad',
};

/** زر التسجيل السريع في صف الطالب: كبير للمس، ويبدّل لونه عند التفعيل */
export function ActionButton({
  tone,
  active,
  icon,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone: ActionTone; active?: boolean; icon: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 min-w-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-ctl border px-3 text-[14px] font-medium transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        active ? actionOn[tone] : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-3 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export const ParticipateIcon = Hand;

/** نسبة المشاركة بنص وشريط (نبرة الشريط تنبّه عند الانخفاض) */
export function RateMeter({ rate, className }: { rate: number | null; className?: string }) {
  const fmt = useFmt();
  if (rate === null) return <span className="text-muted">—</span>;
  const tone = rate < CLASS_FLAGS.lowRate ? 'warn' : rate >= 60 ? 'good' : 'brand';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ProgressBar value={rate} tone={tone} className="w-16 shrink-0" label="نسبة المشاركة" />
      <span className="tnum min-w-[3.2rem] text-[14px] font-semibold text-ink">{fmt.pct(rate)}</span>
    </div>
  );
}

const flagTone: Record<ClassFlag, 'warn' | 'bad'> = { silent: 'warn', low: 'warn', concern: 'bad' };

export function FlagBadges({ flags }: { flags: readonly ClassFlag[] }) {
  if (flags.length === 0) return <span className="text-muted">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <Badge key={f} tone={flagTone[f]} className="text-[12.5px]">
          <span title={classFlagHint(f)}>{CLASS_FLAG_LABELS[f]}</span>
        </Badge>
      ))}
    </span>
  );
}

/** سطر «ما سُجّل سابقًا» تحت اسم الطالب في شاشة الحصة */
export function HistoryLine({ before }: { before: ClassCountsDto }) {
  const fmt = useFmt();
  if (before.sessions === 0) return <span className="block text-[12.5px] text-muted">أول تسجيل له في هذا المقرر</span>;
  return (
    <span className="block truncate text-[12.5px] text-muted">
      سابقًا: شارك في <b className="tnum font-semibold text-ink-2">{fmt.num(before.participatedSessions, 0)}</b> · لم يشارك في <b className="tnum font-semibold text-ink-2">{fmt.num(before.noParticipationSessions, 0)}</b>
      {before.negative ? <> · <span className="text-bad">غير حسن <b className="tnum">{fmt.num(before.negative, 0)}</b></span></> : null}
    </span>
  );
}

/** كتلة التاريخ المصغّرة */
export function DateTile({ date, className }: { date: string; className?: string }) {
  const fmt = useFmt();
  const medium = fmt.date(date, 'medium');
  return (
    <div className={cn('grid w-12 shrink-0 place-items-center rounded-lg bg-surface-3 py-1 text-ink-2', className)} title={fmt.date(date, 'full')}>
      <span className="text-[17px] font-bold leading-5 tnum">{fmt.num(Number(date.slice(8, 10)), 0)}</span>
      <span className="text-[11px] leading-4">{medium.split(' ')[1] ?? ''}</span>
    </div>
  );
}

/** رابط الحصة في صفحة التسجيل */
export const sessionHref = (assignmentId: string, date: string, period: number | null) =>
  `/class/session?assignment=${assignmentId}&date=${date}${period ? `&period=${period}` : ''}`;
