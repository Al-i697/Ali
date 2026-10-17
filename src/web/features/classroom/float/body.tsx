import { memo, useCallback, useEffect, useMemo, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCheck, CircleSlash, Eye, EyeOff, Hand, MessageSquarePlus, Minus, Search, ThumbsDown, ThumbsUp, TriangleAlert, X } from 'lucide-react';
import { CLASS_LIMITS, CLASS_REASON_PRESETS, CLASS_RECORD_KIND, type ClassRecordKind } from '@shared/constants';
import { normalizeArabic } from '@shared/arabic';
import { todayISO } from '@shared/dates';
import type { ClassOverviewDto, ClassRecordDto, ClassSessionStudentDto, ClassSlotDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useFmt } from '@/lib/hooks';
import { qk, useAssignments } from '@/lib/queries';
import { Button, IconButton, Input, ProgressBar, Select } from '@/components/ui';
import { chipTone, recordIcon, recordText } from '../shared';
import { useClassSession, type Notice, type SessionRef } from '../use-session';

// جسم «لوحة المشاركة العائمة»: واجهة مدمجة لتسجيل المشاركة والسلوك أثناء الشرح. تُعرض كما هي في ثلاثة أماكن:
// بطاقة عائمة داخل التطبيق، ونافذة منفصلة فوق البرامج (PiP)، ونافذة متصفح صغيرة (/class/float).
// لذا لا تستعمل نوافذ Radix المنبثقة (قوائم، حوارات، تلميحات): تُرسم في نافذة التطبيق الرئيسية لا في النافذة المنفصلة.
export type FloatMode = 'inapp' | 'pip' | 'window';

export type FloatBodyProps = {
  mode: FloatMode;
  /** الحصة المثبّتة (null ⇒ تُحسب من جدول اليوم وتُثبَّت عند الفتح) */
  session: SessionRef | null;
  onSession: (ref: SessionRef) => void;
  hideBehavior: boolean;
  onHideBehavior: (hide: boolean) => void;
  /** ما يسبق العنوان (مقبض السحب) وما يليه (أزرار فتح النافذة المنفصلة والإغلاق…) */
  lead?: ReactNode;
  actions?: ReactNode;
  /** خصائص تُضاف إلى العنوان (يسحب به المعلم اللوحة داخل التطبيق) */
  titleProps?: HTMLAttributes<HTMLHeadingElement>;
  /** رابط «الصفحة الكاملة» (داخل التطبيق فقط) */
  onOpenFull?: (ref: SessionRef) => void;
};

const optKey = (assignmentId: string, period: number | null) => `${assignmentId}:${period ?? 0}`;

/** الحصة المناسبة الآن من جدول اليوم: الجارية، وإلا القادمة، وإلا آخر ما انتهى */
export function pickDefaultSlot(slots: readonly ClassSlotDto[]): ClassSlotDto | null {
  return slots.find((s) => s.state === 'current') ?? slots.find((s) => s.state === 'upcoming') ?? [...slots].reverse().find((s) => s.state === 'past') ?? slots[0] ?? null;
}

// ───────────── أزرار صغيرة ─────────────
type Tone = 'good' | 'warn' | 'info' | 'bad' | 'neutral';
const toneOn: Record<Tone, string> = {
  good: 'border-good/50 bg-good-soft text-good',
  warn: 'border-warn/50 bg-warn-soft text-warn',
  info: 'border-info/50 bg-info-soft text-info',
  bad: 'border-bad/50 bg-bad-soft text-bad',
  neutral: 'border-ink-2/40 bg-surface-3 text-ink',
};

function MiniButton({ tone, active, label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { tone: Tone; active?: boolean; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-lg border transition-[background-color,color,border-color,transform] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
        active ? toneOn[tone] : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-3 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** شريحة تسجيل مصغّرة: النص وزر حذف (الحذف يُعرض معه «تراجع» أسفل اللوحة) */
function MiniChip({ r, name, onRemove }: { r: ClassRecordDto; name: string; onRemove: (r: ClassRecordDto) => void }) {
  const Icon = recordIcon[r.kind];
  const text = recordText(r);
  return (
    <li className={cn('inline-flex max-w-full items-center rounded-full border text-[13px]', chipTone[r.kind])}>
      <span className="inline-flex min-w-0 items-center gap-1.5 py-0.5 pe-1.5 ps-2.5" title={`${CLASS_RECORD_KIND.labels[r.kind]}: ${text}`}>
        <Icon className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{text}</span>
      </span>
      <button type="button" onClick={() => onRemove(r)} className="me-0.5 grid size-6 shrink-0 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label={`حذف تسجيل ${CLASS_RECORD_KIND.labels[r.kind]} — ${name}`}>
        <X className="size-3.5" aria-hidden />
      </button>
    </li>
  );
}

/** تسجيل سلوك بنقرتين: النوع (من الزر) ثم سبب جاهز، أو سبب يكتبه المعلم. التفاصيل الطويلة من الصفحة الكاملة */
function InlineRecordPicker({ name, kind, busy, onSave, onClose }: { name: string; kind: ClassRecordKind; busy: boolean; onSave: (reason: string) => void; onClose: () => void }) {
  const [text, setText] = useState('');
  const Icon = recordIcon[kind];
  return (
    <div role="group" aria-label={`${CLASS_RECORD_KIND.labels[kind]} — ${name}`} className="border-t border-line/70 px-2.5 pb-2.5 pt-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-2">
        <Icon className="size-4" aria-hidden />
        <span className="flex-1">{CLASS_RECORD_KIND.labels[kind]}</span>
        <IconButton label={`إغلاق — ${name}`} size="iconSm" onClick={onClose}>
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CLASS_REASON_PRESETS[kind].map((r) => (
          <button
            key={r}
            type="button"
            disabled={busy}
            onClick={() => onSave(r)}
            className="rounded-full border border-dashed border-line-strong bg-surface px-3 py-1.5 text-[13.5px] text-ink-2 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-50"
          >
            {r}
          </button>
        ))}
      </div>
      <form
        className="mt-2 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim() && !busy) onSave(text.trim());
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={CLASS_LIMITS.reason} placeholder="أو اكتب سببًا آخر" aria-label={`سبب آخر — ${name}`} className="h-9 text-[14px]" />
        <Button type="submit" variant="soft" size="sm" disabled={busy || !text.trim()}>
          حفظ
        </Button>
      </form>
    </div>
  );
}

// ───────────── صف الطالب ─────────────
type RowProps = {
  s: ClassSessionStudentDto;
  hideBehavior: boolean;
  /** نوع المنتقي المفتوح تحت هذا الطالب (null ⇒ مغلق) */
  pickerKind: ClassRecordKind | null;
  busy: boolean;
  onSet: (studentId: string, count: number | null) => void;
  onPick: (studentId: string, kind: ClassRecordKind | null) => void;
  onSave: (studentId: string, kind: ClassRecordKind, reason: string) => void;
  onRemove: (r: ClassRecordDto) => void;
};

/** النقر على الاسم = «شارك» (كل نقرة مشاركة)؛ يُعاد رسمه عند تغيّر صفّه وحده فيبقى سريعًا في الشعب الكبيرة */
const FloatRow = memo(function FloatRow({ s, hideBehavior, pickerKind, busy, onSet, onPick, onSave, onRemove }: RowProps) {
  const fmt = useFmt();
  const p = s.participation;
  const toggle = (kind: ClassRecordKind) => onPick(s.studentId, pickerKind === kind ? null : kind);
  return (
    <li data-float-student={s.studentId} className={cn('rounded-xl border', p === null ? 'border-line bg-surface' : p > 0 ? 'border-good/40 bg-good-soft/60' : 'border-warn/40 bg-warn-soft/60')}>
      {/* الاسم يحتفظ بعرض مقروء (≈3 كلمات): إن ضاق المكان (الجوال) نزلت الأزرار إلى سطر تحته بدل اقتطاع الاسم */}
      <div className="flex flex-wrap items-center gap-1 p-1">
        <button
          type="button"
          aria-label={`شارك — ${s.fullName}`}
          aria-pressed={p !== null && p > 0}
          onClick={() => onSet(s.studentId, (p ?? 0) + 1)}
          className="flex min-h-10 min-w-[11.5rem] flex-1 items-center gap-2 rounded-lg px-2 text-start transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10"
        >
          {/* موضع الرقم التسلسلي يحمل حالة الطالب بعد التسجيل (عدد مشاركاته أو «لم يشارك») فيبقى للاسم أوسع مكان */}
          {p === null ? (
            <span className="w-7 shrink-0 text-center text-[12.5px] text-muted tnum">{fmt.num(s.rollNo, 0)}</span>
          ) : p > 0 ? (
            <span className="inline-flex h-6 min-w-7 shrink-0 items-center justify-center gap-0.5 rounded-full border border-good/40 bg-surface px-1.5 text-[12.5px] font-semibold text-good tnum" title={`شارك ${fmt.num(p, 0)} ${p === 1 ? 'مرة' : 'مرات'}`}>
              <Hand className="size-3" aria-hidden />
              {fmt.num(p, 0)}
            </span>
          ) : (
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-warn/40 bg-surface text-warn" title="لم يشارك">
              <CircleSlash className="size-3.5" aria-hidden />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-ink">{s.fullName}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {p !== null && p > 0 ? (
            <MiniButton tone="good" label={`تراجع عن مشاركة — ${s.fullName}`} onClick={() => onSet(s.studentId, p > 1 ? p - 1 : null)}>
              <Minus className="size-4" aria-hidden />
            </MiniButton>
          ) : (
            <MiniButton tone="warn" active={p === 0} aria-pressed={p === 0} label={`لم يشارك — ${s.fullName}`} onClick={() => onSet(s.studentId, p === 0 ? null : 0)}>
              <CircleSlash className="size-4" aria-hidden />
            </MiniButton>
          )}
          <MiniButton tone="info" active={pickerKind === 'positive'} aria-expanded={pickerKind === 'positive'} label={`سلوك إيجابي — ${s.fullName}`} onClick={() => toggle('positive')}>
            <ThumbsUp className="size-4" aria-hidden />
          </MiniButton>
          <MiniButton tone="bad" active={pickerKind === 'negative'} aria-expanded={pickerKind === 'negative'} label={`سلوك غير حسن — ${s.fullName}`} onClick={() => toggle('negative')}>
            <ThumbsDown className="size-4" aria-hidden />
          </MiniButton>
          <MiniButton tone="neutral" active={pickerKind === 'note'} aria-expanded={pickerKind === 'note'} label={`ملاحظة — ${s.fullName}`} onClick={() => toggle('note')}>
            <MessageSquarePlus className="size-4" aria-hidden />
          </MiniButton>
        </div>
      </div>
      {!hideBehavior && s.records.length ? (
        <ul className="flex flex-wrap gap-1 px-2 pb-2" aria-label={`تسجيلات ${s.fullName} في هذه الحصة`}>
          {s.records.map((r) => (
            <MiniChip key={r.id} r={r} name={s.fullName} onRemove={onRemove} />
          ))}
        </ul>
      ) : null}
      {pickerKind ? <InlineRecordPicker name={s.fullName} kind={pickerKind} busy={busy} onSave={(reason) => onSave(s.studentId, pickerKind, reason)} onClose={() => onPick(s.studentId, null)} /> : null}
    </li>
  );
});

// ───────────── الجسم ─────────────
const noticeTone = { good: 'bg-good-soft text-good', info: 'bg-surface-3 text-ink-2', bad: 'bg-bad-soft text-bad' } as const;

export function FloatPanelBody({ mode, session, onSession, hideBehavior, onHideBehavior, lead, actions, titleProps, onOpenFull }: FloatBodyProps) {
  const fmt = useFmt();
  const today = todayISO();
  const { year } = useAcademic();
  const assignments = useAssignments(year?.id);
  const overview = useQuery({ queryKey: qk.classOverview, queryFn: () => api.get<ClassOverviewDto>('/class/overview') });
  const slots = useMemo(() => overview.data?.slots ?? [], [overview.data]);

  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    if (!notice || notice.tone === 'bad') return; // الخطأ يبقى حتى يُغلَق أو تنجح عملية تالية
    const t = setTimeout(() => setNotice(null), notice.action ? 8000 : 4000);
    return () => clearTimeout(t);
  }, [notice]);
  const notify = useCallback((n: Notice) => setNotice(n), []);
  const s = useClassSession(session, { notify });
  const { students, totals } = s;

  // تثبيت حصة الجدول عند الفتح: لا تنتقل اللوحة وحدها إلى الحصة التالية فتُسجَّل ضغطة على غير ما يراه المعلم
  const defaultRef = useMemo<SessionRef | null>(() => {
    const slot = pickDefaultSlot(slots);
    return slot ? { assignmentId: slot.assignment.id, date: today, period: slot.period } : null;
  }, [slots, today]);
  useEffect(() => {
    if (!session && defaultRef) onSession(defaultRef);
  }, [session, defaultRef, onSession]);

  // خيارات الحصة: حصص اليوم من الجدول، ثم أي شعبة أخرى بحصة غير محددة
  const options = useMemo(() => {
    const fromSlots = slots.map((sl) => ({
      value: optKey(sl.assignment.id, sl.period),
      label: `الحصة ${fmt.num(sl.period, 0)} · ${sl.assignment.sectionLabel} ${sl.assignment.subjectName}${sl.state === 'current' ? ' (الآن)' : ''}`,
      ref: { assignmentId: sl.assignment.id, date: today, period: sl.period } satisfies SessionRef,
    }));
    const inSlots = new Set(slots.map((sl) => sl.assignment.id));
    const others = (assignments.data ?? [])
      .filter((a) => !inSlots.has(a.id))
      .map((a) => ({ value: optKey(a.id, null), label: `${a.sectionLabel} — ${a.subjectName}`, ref: { assignmentId: a.id, date: today, period: null } satisfies SessionRef }));
    return { fromSlots, others };
  }, [slots, assignments.data, today, fmt]);
  const current = session ? optKey(session.assignmentId, session.period) : '';
  const known = [...options.fromSlots, ...options.others].some((o) => o.value === current);
  const asg = s.data?.assignment;
  const dateNote = session && session.date !== today ? ` — ${fmt.date(session.date, 'medium')}` : '';
  const nowSlot = slots.find((sl) => sl.state === 'current');
  const suggestion = nowSlot && optKey(nowSlot.assignment.id, nowSlot.period) !== current ? nowSlot : null;

  const [q, setQ] = useState('');
  const [unrecordedOnly, setUnrecordedOnly] = useState(false);
  const [picker, setPicker] = useState<{ studentId: string; kind: ClassRecordKind } | null>(null);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    setPicker(null);
    setConfirming(false);
  }, [current, session?.date]);

  const shown = useMemo(() => {
    const needle = normalizeArabic(q);
    return students.filter((st) => (!needle || normalizeArabic(st.fullName).includes(needle)) && (!unrecordedOnly || st.participation === null));
  }, [students, q, unrecordedOnly]);

  const onPick = useCallback((studentId: string, kind: ClassRecordKind | null) => setPicker(kind ? { studentId, kind } : null), []);
  const { mutate: addMutate, isPending: adding } = s.addRecord;
  const onSave = useCallback(
    (studentId: string, kind: ClassRecordKind, reason: string) => addMutate({ studentId, kind, reason }, { onSuccess: () => setPicker(null) }),
    [addMutate],
  );

  const recorded = students.length - totals.unrecorded;
  const unrecorded = totals.unrecorded;
  const loadError = s.query.error;

  // نافذة PiP صفحة مستقلة: تحتاج معلمًا رئيسيًا وعنوانًا من المستوى الأول (وفي التطبيق العنوان للصفحة وهذا عنوان فرعي)
  const Root = mode === 'pip' ? 'main' : 'div';
  const Title = mode === 'inapp' ? 'h2' : 'h1';
  return (
    <Root className={cn('flex min-h-0 flex-1 flex-col bg-surface text-ink', mode !== 'inapp' && 'h-dvh')}>
      <div className="shrink-0 border-b border-line px-3 pb-2.5 pt-2">
        <div className="flex items-center gap-1.5">
          {lead}
          <Title {...titleProps} className={cn('min-w-0 flex-1 truncate text-[15px] font-bold text-ink', titleProps?.className)}>المشاركة</Title>
          <IconButton label={hideBehavior ? 'إظهار تسجيلات السلوك' : 'إخفاء تسجيلات السلوك (للشاشة المعروضة للطلاب)'} size="iconSm" aria-pressed={hideBehavior} onClick={() => onHideBehavior(!hideBehavior)}>
            {hideBehavior ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
          </IconButton>
          {actions}
        </div>
        <div className="mt-2">
          <Select
            aria-label="الحصة"
            value={current}
            onChange={(e) => {
              const o = [...options.fromSlots, ...options.others].find((x) => x.value === e.target.value);
              if (o) onSession(o.ref);
            }}
          >
            {!session ? <option value="">اختر الحصة…</option> : null}
            {session && !known ? (
              <option value={current}>{asg ? `${asg.sectionLabel} ${asg.subjectName}${session.period ? ` · الحصة ${fmt.num(session.period, 0)}` : ' — حصة غير محددة'}${dateNote}` : 'الحصة المحددة'}</option>
            ) : null}
            {options.fromSlots.length ? (
              <optgroup label="حصص اليوم">
                {options.fromSlots.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ) : null}
            {options.others.length ? (
              <optgroup label="شعب أخرى (حصة غير محددة)">
                {options.others.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ) : null}
          </Select>
        </div>
        {suggestion ? (
          <button
            type="button"
            onClick={() => onSession({ assignmentId: suggestion.assignment.id, date: today, period: suggestion.period })}
            className="mt-1.5 w-full rounded-lg bg-brand-soft px-3 py-1.5 text-start text-[13px] text-brand hover:brightness-95 dark:hover:brightness-125"
          >
            حصة الآن: <span className="tnum">{fmt.num(suggestion.period, 0)}</span> · {suggestion.assignment.sectionLabel} {suggestion.assignment.subjectName} — <b>انتقل إليها</b>
          </button>
        ) : null}
        {students.length ? (
          <>
            <div role="group" className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]" aria-label="ملخص الحصة">
              <span className="text-good"><b className="tnum text-[15px]">{fmt.num(totals.participating, 0)}</b> شاركوا</span>
              <span className="text-warn"><b className="tnum text-[15px]">{fmt.num(totals.didNotParticipate, 0)}</b> لم يشاركوا</span>
              <span className="text-muted"><b className="tnum text-[15px] text-ink-2">{fmt.num(unrecorded, 0)}</b> لم تُسجَّل</span>
            </div>
            <ProgressBar value={recorded} max={students.length} tone={unrecorded === 0 ? 'good' : 'brand'} className="mt-1.5 h-1.5" label="اكتمال تسجيل المشاركة" />
          </>
        ) : null}
      </div>

      {students.length ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الطالب…" aria-label="بحث في طلاب اللوحة" className="h-9 ps-8 text-[14px]" />
          </div>
          <button
            type="button"
            aria-pressed={unrecordedOnly}
            onClick={() => setUnrecordedOnly((v) => !v)}
            className={cn('h-9 shrink-0 rounded-ctl border px-2.5 text-[13px] font-medium transition-colors', unrecordedOnly ? 'border-brand bg-brand-soft text-brand' : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-3')}
          >
            لم تُسجَّل <span className="tnum">({fmt.num(unrecorded, 0)})</span>
          </button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5">
        {loadError ? (
          <div role="alert" className="rounded-xl bg-bad-soft p-3 text-[13.5px] text-bad">
            <div className="flex items-start gap-2"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /><span>{errorMessage(loadError)}</span></div>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => void s.query.refetch()}>إعادة المحاولة</Button>
          </div>
        ) : !session ? (
          <p className="px-2 py-8 text-center text-[14px] text-muted">{overview.isPending || assignments.isPending ? 'جارٍ التحميل…' : (assignments.data?.length ?? 0) === 0 ? 'أضف شعبة ومادة أولًا من «الشعب والطلاب».' : 'اختر الحصة من القائمة أعلاه لتبدأ التسجيل.'}</p>
        ) : !s.data ? (
          <p className="px-2 py-8 text-center text-[14px] text-muted">جارٍ تحميل الطلاب…</p>
        ) : students.length === 0 ? (
          <p className="px-2 py-8 text-center text-[14px] text-muted">لا طلاب في هذه الشعبة. أضفهم من «الشعب والطلاب».</p>
        ) : shown.length === 0 ? (
          <p className="px-2 py-8 text-center text-[14px] text-muted">{unrecordedOnly && !q ? 'سُجّلت مشاركة كل الطلاب.' : 'لا طلاب مطابقون.'}</p>
        ) : (
          <ul className="space-y-1.5" aria-label="طلاب الحصة">
            {shown.map((st) => (
              <FloatRow
                key={st.studentId}
                s={st}
                hideBehavior={hideBehavior}
                pickerKind={picker?.studentId === st.studentId ? picker.kind : null}
                busy={adding}
                onSet={s.setParticipation}
                onPick={onPick}
                onSave={onSave}
                onRemove={s.removeRecord}
              />
            ))}
          </ul>
        )}
      </div>

      {students.length ? (
        <div className="shrink-0 border-t border-line bg-surface-2 px-3 py-2">
          {confirming ? (
            <div role="group" aria-label="تأكيد تسجيل «لم يشارك» لمن تبقّى" className="flex items-center gap-2 text-[13.5px]">
              <span className="min-w-0 flex-1">
                تسجيل «لم يشارك» لـ <b className="tnum">{fmt.num(unrecorded, 0)}</b> {unrecorded === 1 ? 'طالب' : 'طلاب'} لم تُسجَّل مشاركتهم؟
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setConfirming(false);
                  s.fill.mutate();
                }}
              >
                تسجيل
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>إلغاء</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="soft" icon={<CheckCheck className="size-4" aria-hidden />} disabled={unrecorded === 0} loading={s.fill.isPending} onClick={() => setConfirming(true)}>
                «لم يشارك» لمن تبقّى{unrecorded ? <span className="tnum"> ({fmt.num(unrecorded, 0)})</span> : null}
              </Button>
              <span className="flex-1" />
              {onOpenFull && session ? (
                <Button size="sm" variant="ghost" onClick={() => onOpenFull(session)}>
                  الصفحة الكاملة
                </Button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {notice ? (
        <div role={notice.tone === 'bad' ? 'alert' : 'status'} className={cn('flex shrink-0 items-center gap-2 px-3 py-2 text-[13.5px]', noticeTone[notice.tone])}>
          <span className="min-w-0 flex-1">{notice.text}</span>
          {notice.action ? (
            <button
              type="button"
              className="shrink-0 font-semibold underline underline-offset-2"
              onClick={() => {
                notice.action?.run();
                setNotice(null);
              }}
            >
              {notice.action.label}
            </button>
          ) : null}
          <button type="button" aria-label="إخفاء الرسالة" className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10" onClick={() => setNotice(null)}>
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
    </Root>
  );
}
