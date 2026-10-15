import type { LucideIcon } from 'lucide-react';
import { Bus, FlaskConical, Hammer, Presentation, Puzzle, Sparkles, Trophy } from 'lucide-react';
import { LAB_KIND, LAB_STATUS, weekdayName, type LabKind, type LabStatus } from '@shared/constants';
import { weekdayOf } from '@shared/dates';
import type { LabActivitySummaryDto } from '@shared/dto';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { Badge } from '@/components/ui';

export const kindIcon: Record<LabKind, LucideIcon> = {
  experiment: FlaskConical,
  demo: Presentation,
  activity: Puzzle,
  project: Hammer,
  field_trip: Bus,
  competition: Trophy,
  other: Sparkles,
};

export function KindBadge({ kind }: { kind: LabKind }) {
  const Icon = kindIcon[kind];
  return (
    <Badge tone="neutral" className="gap-1">
      <Icon className="size-3.5" aria-hidden /> {LAB_KIND.labels[kind]}
    </Badge>
  );
}

const statusTone = { planned: 'info', done: 'good', cancelled: 'neutral' } as const;

/** «فات موعده» يطغى على «مخطَّط»: مخطَّط في الماضي لم يُسجَّل تنفيذه ولا إلغاؤه */
export function StatusBadge({ status, overdue }: { status: LabStatus; overdue?: boolean }) {
  if (status === 'planned' && overdue) return <Badge tone="bad" dot>فات موعده</Badge>;
  return <Badge tone={statusTone[status]} dot>{LAB_STATUS.labels[status]}</Badge>;
}

const blockTone = {
  info: 'bg-info-soft text-info',
  good: 'bg-good-soft text-good',
  bad: 'bg-bad-soft text-bad',
  neutral: 'bg-surface-3 text-muted',
} as const;

/** كتلة التاريخ: اليوم والشهر ولونها يدل على الحالة */
export function DateBlock({ a }: { a: Pick<LabActivitySummaryDto, 'date' | 'status' | 'overdue'> }) {
  const fmt = useFmt();
  const tone = a.status === 'done' ? 'good' : a.status === 'cancelled' ? 'neutral' : a.overdue ? 'bad' : 'info';
  const medium = fmt.date(a.date, 'medium');
  return (
    <div className={cn('grid w-[3.75rem] shrink-0 place-items-center rounded-xl px-1 py-1.5 text-center', blockTone[tone])} title={medium}>
      <span className="text-[11.5px] leading-4">{weekdayName(weekdayOf(a.date))}</span>
      <span className="text-[21px] font-bold leading-6 tnum">{fmt.num(Number(a.date.slice(8, 10)), 0)}</span>
      <span className="text-[11.5px] leading-4">{medium.split(' ')[1] ?? ''}</span>
    </div>
  );
}
