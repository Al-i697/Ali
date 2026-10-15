import { Link } from 'react-router';
import { ArrowLeft, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { SUPPORT_KIND, SUPPORT_STATUS, type SupportKind, type SupportStatus } from '@shared/constants';
import type { SupportPlanDto } from '@shared/dto';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { Avatar, Badge, Card, SubjectChip } from '@/components/ui';

export const kindTone = { remedial: 'warn', enrichment: 'info' } as const;
export const statusTone = { open: 'info', done: 'good', cancelled: 'neutral' } as const;

export function KindBadge({ kind }: { kind: SupportKind }) {
  return <Badge tone={kindTone[kind]}>{SUPPORT_KIND.labels[kind]}</Badge>;
}

export function StatusBadge({ status, due }: { status: SupportStatus; due?: boolean }) {
  if (status === 'open' && due) return <Badge tone="bad" dot>حان موعد المراجعة</Badge>;
  return <Badge tone={statusTone[status]} dot>{SUPPORT_STATUS.labels[status]}</Badge>;
}

/** خط الأساس ← النسبة الحالية مع الفرق (أثر الخطة على مستوى الطالب) */
export function PlanProgress({ plan, size = 'sm' }: { plan: Pick<SupportPlanDto, 'baselinePercent' | 'currentPercent'>; size?: 'sm' | 'lg' }) {
  const fmt = useFmt();
  const { baselinePercent: b, currentPercent: c } = plan;
  if (b === null && c === null) return <span className="text-[13px] text-muted">لا درجات مرصودة بعد</span>;
  const delta = b !== null && c !== null ? Math.round((c - b) * 10) / 10 : null;
  const Icon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const tone = delta === null || delta === 0 ? 'text-muted' : delta > 0 ? 'text-good' : 'text-bad';
  return (
    <div className={cn('flex items-center gap-2 tnum', size === 'lg' ? 'text-[17px]' : 'text-[13.5px]')} aria-label={`من ${b ?? 'غير معروف'} إلى ${c ?? 'غير معروف'}`}>
      <span className="text-muted">{b === null ? '—' : fmt.pct(b)}</span>
      <ArrowLeft className="size-3.5 text-muted" aria-hidden />
      <b className="text-ink">{c === null ? '—' : fmt.pct(c)}</b>
      {delta !== null ? (
        <span className={cn('inline-flex items-center gap-0.5 font-medium', tone)}>
          <Icon className="size-3.5" aria-hidden /> {delta > 0 ? '+' : ''}{fmt.num(delta, 1)}
        </span>
      ) : null}
    </div>
  );
}

// ───────────── بطاقة الخطة (تُستعمل في صفحة الخطط وملف الطالب) ─────────────
export function PlanCard({ p }: { p: SupportPlanDto }) {
  const fmt = useFmt();
  return (
    <Card className={cn('relative p-4 transition-shadow hover:shadow-pop', p.subjectColor && `subj-${p.subjectColor}`)}>
      <div className="mb-3 flex items-start gap-3">
        <Avatar name={p.studentName} size={38} />
        <div className="min-w-0 flex-1">
          <Link to={`/support/${p.id}`} className="block truncate text-[16px] font-semibold text-ink after:absolute after:inset-0 after:content-[''] hover:text-brand">{p.studentName}</Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            {p.sectionLabel ? <span className="tnum font-medium text-ink-2">{p.sectionLabel}</span> : null}
            {p.subjectName && p.subjectColor ? <SubjectChip name={p.subjectName} color={p.subjectColor} /> : <span>مقرر محذوف</span>}
          </div>
        </div>
        <KindBadge kind={p.kind} />
      </div>
      <div className="text-[15px] font-medium leading-6 text-ink">{p.title}</div>
      <p className="mt-0.5 line-clamp-2 text-[14px] leading-6 text-ink-2">{p.goal}</p>
      {p.strategies.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.strategies.slice(0, 3).map((s) => <span key={s} className="rounded-md bg-surface-3 px-2 py-0.5 text-[12.5px] text-ink-2">{s}</span>)}
          {p.strategies.length > 3 ? <span className="px-1 text-[12.5px] text-muted">+{fmt.num(p.strategies.length - 3, 0)}</span> : null}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
        <PlanProgress plan={p} />
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
          <StatusBadge status={p.status} due={p.due} />
          {p.reviewDate && p.status === 'open' ? <span className="tnum">مراجعة {fmt.date(p.reviewDate, 'short')}</span> : null}
          <span title="ملاحظات المتابعة" className="tnum">{fmt.num(p.notesCount, 0)} متابعة</span>
        </div>
      </div>
    </Card>
  );
}

