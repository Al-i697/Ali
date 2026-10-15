import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { BAND_TONES, DEFAULT_GRADING, DEFAULT_SCHEDULE, MAX_PERIODS, WEEKDAYS, type GradeBand, type GradingSettings, type ScheduleSettings } from '@shared/constants';
import { minutesToTime, timeToMinutes } from '@shared/dates';
import { sortBands } from '@shared/gradebook';
import { gradingSchema, scheduleSchema } from '@shared/schemas/settings';
import type { SettingsDto } from '@shared/dto';
import { api, errorMessage } from '@/lib/api';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Badge, Button, Card, CardHeader, Checkbox, Field, IconButton, Input, Select, bandTone } from '@/components/ui';

const toneLabels: Record<GradeBand['tone'], string> = { good: 'أخضر (ممتاز)', info: 'أزرق', neutral: 'محايد', warn: 'أصفر (تنبيه)', bad: 'أحمر (دعم)' };

export function ScheduleTab({ settings }: { settings: SettingsDto }) {
  const [s, setS] = useState<ScheduleSettings>(settings.schedule);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setS(settings.schedule), [settings.schedule]);
  const parsed = scheduleSchema.safeParse(s);
  const save = useAppMutation(() => api.patch('/settings', { schedule: s }), { invalidate: [qk.settings, qk.dashboard, ['timetable']], success: 'حُفظ جدول الحصص', silentError: true, onSuccess: () => setError(null), onError: (e) => setError(errorMessage(e)) });
  const setPeriod = (i: number, patch: Partial<{ start: string; end: string }>) => setS({ ...s, periods: s.periods.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const addPeriod = () => {
    const last = s.periods[s.periods.length - 1];
    const start = last ? last.end : '07:30';
    setS({ ...s, periods: [...s.periods, { n: s.periods.length + 1, start, end: minutesToTime(Math.min(23 * 60 + 59, timeToMinutes(start) + 45)) }] });
  };
  return (
    <Card className="max-w-3xl">
      <CardHeader title="أيام العمل وأوقات الحصص" description="تُستخدم لعرض «حصص اليوم» وتحديد الحصة الحالية في لوحة التحكم، ولأعمدة الجدول الأسبوعي." />
      <div className="space-y-5 px-5 pb-5">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <div>
          <div className="mb-2 text-sm font-medium text-ink-2">أيام العمل</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {WEEKDAYS.map((d) => (
              <Checkbox key={d.value} label={d.name} checked={s.workDays.includes(d.value)} onChange={(e) => setS({ ...s, workDays: e.target.checked ? [...s.workDays, d.value].sort() : s.workDays.filter((x) => x !== d.value) })} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-ink-2">الحصص</div>
          <div className="space-y-2">
            {s.periods.map((p, i) => (
              <div key={p.n} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-[15px] font-bold tnum text-ink-2">{p.n}</span>
                <Input type="time" value={p.start} onChange={(e) => setPeriod(i, { start: e.target.value })} aria-label={`بداية الحصة ${p.n}`} className="max-w-36" />
                <span className="text-muted">إلى</span>
                <Input type="time" value={p.end} onChange={(e) => setPeriod(i, { end: e.target.value })} aria-label={`نهاية الحصة ${p.n}`} className="max-w-36" />
                {i === s.periods.length - 1 && s.periods.length > 1 ? <IconButton label="حذف الحصة الأخيرة" size="iconSm" className="hover:text-bad" onClick={() => setS({ ...s, periods: s.periods.slice(0, -1) })}><Trash2 className="size-4" /></IconButton> : null}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="soft" size="sm" icon={<Plus className="size-4" />} disabled={s.periods.length >= MAX_PERIODS} onClick={addPeriod}>إضافة حصة</Button>
            <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" />} onClick={() => setS(DEFAULT_SCHEDULE)}>القيم الافتراضية</Button>
          </div>
        </div>
        {!parsed.success ? <Alert tone="warn">{parsed.error.issues[0]?.message}</Alert> : null}
        <div className="flex justify-end"><Button variant="primary" disabled={!parsed.success} loading={save.isPending} onClick={() => save.mutate()}>حفظ</Button></div>
      </div>
    </Card>
  );
}

export function GradingTab({ settings }: { settings: SettingsDto }) {
  const [g, setG] = useState<GradingSettings>(settings.grading);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setG(settings.grading), [settings.grading]);
  const parsed = gradingSchema.safeParse(g);
  const save = useAppMutation(() => api.patch('/settings', { grading: { ...g, bands: sortBands(g.bands) } }), { invalidate: [qk.settings, qk.dashboard, ['gradebook'], ['profile']], success: 'حُفظت مستويات الأداء', silentError: true, onSuccess: () => setError(null), onError: (e) => setError(errorMessage(e)) });
  const setBand = (i: number, patch: Partial<GradeBand>) => setG({ ...g, bands: g.bands.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  return (
    <Card className="max-w-3xl">
      <CardHeader title="مستويات الأداء وحدود الدعم" description="قيم افتراضية قابلة للتعديل وفق تعليمات الوزارة المعمول بها. تُستخدم في الشبكة والتقارير وتحديد من يحتاج علاجًا أو إثراءً." />
      <div className="space-y-5 px-5 pb-5">
        {error ? <Alert tone="bad">{error}</Alert> : null}
        <div>
          <div className="mb-2 grid grid-cols-[6rem_1fr_9rem_2.25rem] gap-2 text-[13px] text-muted"><span>من نسبة %</span><span>اسم المستوى</span><span>اللون</span><span /></div>
          <div className="space-y-2">
            {sortBands(g.bands).map((b) => {
              const i = g.bands.indexOf(b);
              return (
                <div key={i} className="grid grid-cols-[6rem_1fr_9rem_2.25rem] items-center gap-2">
                  <Input type="number" min={0} max={100} value={b.min} onChange={(e) => setBand(i, { min: Number(e.target.value) })} className="tnum text-center" aria-label="الحد الأدنى" />
                  <Input value={b.label} onChange={(e) => setBand(i, { label: e.target.value })} aria-label="اسم المستوى" maxLength={40} />
                  <Select value={b.tone} onChange={(e) => setBand(i, { tone: e.target.value as GradeBand['tone'] })} aria-label="لون المستوى">{BAND_TONES.map((t) => <option key={t} value={t}>{toneLabels[t]}</option>)}</Select>
                  <IconButton label="حذف المستوى" size="iconSm" className="hover:text-bad" disabled={g.bands.length <= 2} onClick={() => setG({ ...g, bands: g.bands.filter((_, j) => j !== i) })}><Trash2 className="size-4" /></IconButton>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="soft" size="sm" icon={<Plus className="size-4" />} disabled={g.bands.length >= 8} onClick={() => setG({ ...g, bands: [...g.bands, { min: 5, label: 'مستوى جديد', tone: 'neutral' }] })}>إضافة مستوى</Button>
            <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" />} onClick={() => setG(DEFAULT_GRADING)}>القيم الافتراضية</Button>
            <span className="ms-auto flex flex-wrap gap-1.5">{sortBands(g.bands).map((b, k) => <Badge key={k} tone={bandTone(b.tone)}>{b.label}</Badge>)}</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="حد النجاح %" hint="لنسبة النجاح في التحليل">{(f) => <Input {...f} type="number" min={0} max={100} value={g.passFrom} onChange={(e) => setG({ ...g, passFrom: Number(e.target.value) })} className="tnum" />}</Field>
          <Field label="يحتاج علاجًا: أقل من %" hint="الطالب دون هذه النسبة">{(f) => <Input {...f} type="number" min={0} max={100} value={g.remedialBelow} onChange={(e) => setG({ ...g, remedialBelow: Number(e.target.value) })} className="tnum" />}</Field>
          <Field label="مرشح للإثراء: من %" hint="الطالب بهذه النسبة فأكثر">{(f) => <Input {...f} type="number" min={0} max={100} value={g.enrichmentFrom} onChange={(e) => setG({ ...g, enrichmentFrom: Number(e.target.value) })} className="tnum" />}</Field>
        </div>
        {!parsed.success ? <Alert tone="warn">{parsed.error.issues[0]?.message}</Alert> : null}
        <div className="flex justify-end"><Button variant="primary" disabled={!parsed.success} loading={save.isPending} onClick={() => save.mutate()}>حفظ</Button></div>
      </div>
    </Card>
  );
}
