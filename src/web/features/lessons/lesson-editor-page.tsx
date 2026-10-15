import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, BookCopy, Check, CircleAlert, Copy, Library, ListPlus, Loader2, Plus, Printer, Save, Search, Trash2, Wand2 } from 'lucide-react';
import { ACTIVITY_PHASE, ASSESSMENT_METHOD_PRESETS, LESSON_STATUS, MAX_PERIODS, RESOURCE_PRESETS, STRATEGY_PRESETS, type ActivityPhase, type LessonStatus } from '@shared/constants';
import { timeToMinutes, todayISO } from '@shared/dates';
import type { LessonDto, LessonSummaryDto, LessonsPage } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { deleteWithForce } from '@/lib/destructive';
import { cn } from '@/lib/cn';
import { useBeforeUnload, useDebounced, useFmt } from '@/lib/hooks';
import { qk, useAssignments } from '@/lib/queries';
import { LessonAssistCard, LessonAssistDialog, type LessonAssistMode } from '@/features/ai/lesson-assist-dialog';
import { applyAssessmentIdeas, applyLessonDraft } from '@/features/ai/merge';
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, ListEditor, Modal, PageLoader, ProgressBar, QueryError, Segmented, Select, SubjectChip, Switch, TagInput, Textarea, useConfirm } from '@/components/ui';
import { LessonCopyDialog } from './copy-dialog';

type DraftActivity = { id?: string; phase: ActivityPhase; description: string; minutes: number | null };

type Draft = {
  assignmentId: string;
  date: string;
  period: number | null;
  title: string;
  unitName: string;
  lessonNumber: string;
  durationMinutes: number | null;
  outcomes: string[];
  objectives: string[];
  concepts: string[];
  strategies: string[];
  resources: string[];
  activities: DraftActivity[];
  assessmentMethods: string[];
  assessmentNotes: string;
  homework: string;
  supportPlan: string;
  enrichmentPlan: string;
  notes: string;
  reflection: string;
  status: LessonStatus;
  isTemplate: boolean;
};

const CONTENT_KEYS = ['unitName', 'lessonNumber', 'durationMinutes', 'outcomes', 'objectives', 'concepts', 'strategies', 'resources', 'activities', 'assessmentMethods', 'assessmentNotes', 'homework', 'supportPlan', 'enrichmentPlan', 'notes', 'title'] as const;

const toDraft = (l: LessonDto): Draft => ({
  assignmentId: l.assignmentId,
  date: l.date,
  period: l.period,
  title: l.title,
  unitName: l.unitName ?? '',
  lessonNumber: l.lessonNumber ?? '',
  durationMinutes: l.durationMinutes,
  outcomes: l.outcomes,
  objectives: l.objectives,
  concepts: l.concepts,
  strategies: l.strategies,
  resources: l.resources,
  activities: l.activities.map((a) => ({ id: a.id, phase: a.phase, description: a.description, minutes: a.minutes ?? null })),
  assessmentMethods: l.assessmentMethods,
  assessmentNotes: l.assessmentNotes ?? '',
  homework: l.homework ?? '',
  supportPlan: l.supportPlan ?? '',
  enrichmentPlan: l.enrichmentPlan ?? '',
  notes: l.notes ?? '',
  reflection: l.reflection ?? '',
  status: l.status,
  isTemplate: l.isTemplate,
});

/** الحمولة المرسلة للخادم: نقصّ النصوص ونحذف القوائم الفارغة العناصر */
function toPayload(d: Draft) {
  const clean = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean);
  return {
    assignmentId: d.assignmentId,
    date: d.date,
    period: d.period,
    title: d.title.trim(),
    unitName: d.unitName.trim() || null,
    lessonNumber: d.lessonNumber.trim() || null,
    durationMinutes: d.durationMinutes,
    outcomes: clean(d.outcomes),
    objectives: clean(d.objectives),
    concepts: clean(d.concepts),
    strategies: clean(d.strategies),
    resources: clean(d.resources),
    activities: d.activities.filter((a) => a.description.trim()).map((a, i) => ({ id: a.id ?? `a${i + 1}`, phase: a.phase, description: a.description.trim(), minutes: a.minutes })),
    assessmentMethods: clean(d.assessmentMethods),
    assessmentNotes: d.assessmentNotes.trim() || null,
    homework: d.homework.trim() || null,
    supportPlan: d.supportPlan.trim() || null,
    enrichmentPlan: d.enrichmentPlan.trim() || null,
    notes: d.notes.trim() || null,
    reflection: d.reflection.trim() || null,
    status: d.status,
    isTemplate: d.isTemplate,
  };
}

function Section({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          {hint ? <p className="text-[13px] text-muted">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

const DEFAULT_FLOW: DraftActivity[] = [
  { phase: 'intro', description: '', minutes: 5 },
  { phase: 'main', description: '', minutes: 20 },
  { phase: 'practice', description: '', minutes: 12 },
  { phase: 'closure', description: '', minutes: 8 },
];

function ActivitiesEditor({ value, onChange }: { value: DraftActivity[]; onChange: (v: DraftActivity[]) => void }) {
  const set = (i: number, patch: Partial<DraftActivity>) => onChange(value.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  return (
    <div className="space-y-3">
      {value.map((a, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-line bg-surface-2/50 p-3 sm:grid-cols-[11rem_1fr_5.5rem_2.25rem]">
          <Select value={a.phase} onChange={(e) => set(i, { phase: e.target.value as ActivityPhase })} aria-label={`مرحلة النشاط ${i + 1}`}>
            {ACTIVITY_PHASE.items.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Textarea rows={2} value={a.description} onChange={(e) => set(i, { description: e.target.value })} placeholder="وصف النشاط وما يفعله المعلم والطلاب…" aria-label={`وصف النشاط ${i + 1}`} className="min-h-[2.75rem]" />
          <div className="flex items-center gap-1.5">
            <Input type="number" min={0} max={240} value={a.minutes ?? ''} onChange={(e) => set(i, { minutes: e.target.value === '' ? null : Number(e.target.value) })} className="tnum text-center" aria-label={`دقائق النشاط ${i + 1}`} placeholder="د" />
          </div>
          <IconButton label="حذف النشاط" className="hover:text-bad" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="size-4" /></IconButton>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="soft" size="sm" icon={<Plus className="size-4" />} onClick={() => onChange([...value, { phase: value.length ? 'main' : 'intro', description: '', minutes: null }])}>إضافة نشاط</Button>
        {value.length === 0 ? <Button variant="secondary" size="sm" icon={<Wand2 className="size-4" />} onClick={() => onChange(DEFAULT_FLOW)}>إدراج الهيكل المعتاد (تمهيد ← عرض ← تطبيق ← ختام)</Button> : null}
      </div>
    </div>
  );
}

/** اختيار درس سابق أو قالب لبدء التحضير منه */
function LessonPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (l: LessonSummaryDto) => void }) {
  const [tab, setTab] = useState<'templates' | 'mine'>('templates');
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 250);
  const params = { q: dq || undefined, templates: tab === 'templates', limit: 40 };
  const query = useQuery({ queryKey: qk.lessons({ picker: params }), queryFn: () => api.get<LessonsPage>('/lessons', params), enabled: open });
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title="ابدأ من تحضير موجود" description="اختر قالبًا أو درسًا سابقًا؛ يُنسخ محتواه إلى هذا التحضير وتعدّله كما تشاء.">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'templates', label: 'القوالب', icon: <Library className="size-4" /> }, { value: 'mine', label: 'دروسي السابقة', icon: <BookCopy className="size-4" /> }]} />
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث…" className="ps-10" aria-label="بحث" />
        </div>
      </div>
      {query.isPending ? <PageLoader /> : query.data && query.data.items.length ? (
        <ul className="max-h-[50vh] divide-y divide-line overflow-auto rounded-xl border border-line">
          {query.data.items.map((l) => (
            <li key={l.id}>
              <button onClick={() => onPick(l)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-surface-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink">{l.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-muted"><SubjectChip name={l.subjectName} color={l.subjectColor} /><span className="tnum">{l.sectionLabel}</span>{l.unitName ? <span>· {l.unitName}</span> : null}</div>
                </div>
                <span className="shrink-0 text-[13px] font-medium text-brand">استخدام</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={<Library className="size-6" />} title="لا نتائج" description={tab === 'templates' ? 'لم تحفظ قوالب بعد. حوّل أي تحضير إلى قالب من خياراته.' : 'لا دروس مطابقة.'} className="py-8" />
      )}
    </Modal>
  );
}

export default function LessonEditorPage() {
  const { lessonId } = useParams();
  const isNew = !lessonId;
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const fmt = useFmt();
  const { year } = useAcademic();
  const { settings, system } = useAuth();
  const aiOn = system?.capabilities.ai ?? false;
  const assignmentsQ = useAssignments(year?.id);
  const assignments = useMemo(() => assignmentsQ.data ?? [], [assignmentsQ.data]);
  const lessonQ = useQuery({ queryKey: qk.lesson(lessonId ?? 'new'), queryFn: () => api.get<LessonDto>(`/lessons/${lessonId}`), enabled: !isNew });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [creating, setCreating] = useState(false);
  const [picker, setPicker] = useState(false);
  const [copying, setCopying] = useState<LessonSummaryDto | null>(null);
  const [aiMode, setAiMode] = useState<LessonAssistMode | null>(null);
  const savedJson = useRef('');
  const initFor = useRef<string | null>(null);
  const draftRef = useRef<Draft | null>(null);
  draftRef.current = draft;

  // ── التهيئة: درس موجود أو مسودة جديدة من معاملات الرابط ──
  useEffect(() => {
    if (!isNew && lessonQ.data && initFor.current !== lessonQ.data.id) {
      initFor.current = lessonQ.data.id;
      const d = toDraft(lessonQ.data);
      setDraft(d);
      savedJson.current = JSON.stringify(toPayload(d));
    }
  }, [isNew, lessonQ.data]);

  useEffect(() => {
    if (!isNew || initFor.current === 'new' || assignmentsQ.isPending) return;
    initFor.current = 'new';
    const wanted = sp.get('assignment');
    const assignmentId = assignments.find((a) => a.id === wanted)?.id ?? assignments[0]?.id ?? '';
    const period = Number(sp.get('period')) || null;
    const periodTimes = settings?.schedule.periods.find((p) => p.n === period);
    setDraft({
      assignmentId, date: sp.get('date') ?? todayISO(), period, title: '', unitName: '', lessonNumber: '',
      durationMinutes: periodTimes ? timeToMinutes(periodTimes.end) - timeToMinutes(periodTimes.start) : 45,
      outcomes: [], objectives: [], concepts: [], strategies: [], resources: [], activities: [], assessmentMethods: [],
      assessmentNotes: '', homework: '', supportPlan: '', enrichmentPlan: '', notes: '', reflection: '', status: 'draft', isTemplate: false,
    });
  }, [isNew, assignmentsQ.isPending, assignments, sp, settings]);

  const payloadJson = useMemo(() => (draft ? JSON.stringify(toPayload(draft)) : ''), [draft]);
  const dirty = !isNew && !!draft && payloadJson !== savedJson.current;
  const valid = !!draft && draft.title.trim().length > 0 && !!draft.assignmentId && !!draft.date;
  useBeforeUnload(dirty || saveState === 'saving');

  const save = useCallback(async () => {
    const d = draftRef.current;
    if (!d || !lessonId || !d.title.trim()) return;
    const payload = toPayload(d);
    const json = JSON.stringify(payload);
    if (json === savedJson.current) return;
    setSaveState('saving');
    try {
      const res = await api.patch<LessonDto>(`/lessons/${lessonId}`, payload);
      savedJson.current = json;
      qc.setQueryData(qk.lesson(lessonId), res);
      void qc.invalidateQueries({ queryKey: ['lessons'] });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      setSaveState('saved');
    } catch (e) {
      setSaveState('error');
      setSaveError(errorMessage(e));
    }
  }, [lessonId, qc]);

  // حفظ تلقائي بعد توقف الكتابة 1.2 ثانية
  useEffect(() => {
    if (!dirty || !valid) return;
    const t = setTimeout(() => void save(), 1200);
    return () => clearTimeout(t);
  }, [payloadJson, dirty, valid, save]);

  // عودة الاتصال بعد فشل حفظ: نعيد المحاولة تلقائيًا (التعديلات تبقى في الصفحة ولا تضيع)
  useEffect(() => {
    const onOnline = () => void save();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [save]);

  // حفظ فوري بالضغط على Ctrl/⌘+S، وحفظ أخير عند مغادرة الصفحة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isNew) return;
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (!isNew) void save();
    };
  }, [isNew, save]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const createLesson = async () => {
    if (!draft || !valid) return;
    setCreating(true);
    try {
      const res = await api.post<LessonDto>('/lessons', toPayload(draft));
      void qc.invalidateQueries({ queryKey: ['lessons'] });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      toast.success('أُنشئ التحضير — يُحفظ تلقائيًا أثناء الكتابة');
      void navigate(`/lessons/${res.id}`, { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const applyFrom = async (src: LessonSummaryDto) => {
    try {
      const full = await api.get<LessonDto>(`/lessons/${src.id}`);
      const d = toDraft(full);
      setDraft((cur) => {
        if (!cur) return cur;
        const next: Draft = { ...cur };
        for (const k of CONTENT_KEYS) (next as Record<string, unknown>)[k] = d[k];
        return next;
      });
      setPicker(false);
      toast.success(`استُخدم محتوى «${src.title}»`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (!isNew && lessonQ.isPending) return <PageLoader />;
  if (!isNew && (lessonQ.error || !lessonQ.data)) return <QueryError error={lessonQ.error} onRetry={() => void lessonQ.refetch()} />;
  if (!draft) return assignmentsQ.isPending ? <PageLoader /> : null;

  if (assignments.length === 0 && isNew)
    return (
      <EmptyState
        icon={<BookCopy className="size-7" />}
        title="أضف شعبة ومادة أولًا"
        description="يرتبط التحضير بشعبة ومادة. أنشئ شعبتك وحدّد المواد التي تدرّسها ثم عُد لتحضير دروسك."
        action={<Link to="/classes" className="inline-flex h-10 items-center rounded-ctl bg-brand px-4 font-medium text-brand-fg">الذهاب إلى الشعب</Link>}
      />
    );

  const planned = draft.activities.reduce((n, a) => n + (a.minutes ?? 0), 0);
  const duration = draft.durationMinutes ?? 45;
  const asg = assignments.find((a) => a.id === draft.assignmentId);
  const periods = Array.from({ length: Math.max(MAX_PERIODS, settings?.schedule.periods.length ?? 0) }, (_, i) => i + 1).slice(0, MAX_PERIODS);

  // الخطأ أولًا: وإلا بقي «جارٍ الحفظ…» ظاهرًا للأبد (التعديل ما زال غير محفوظ) وأخفى فشل الحفظ عن المعلم
  const statusBadge =
    saveState === 'error' && dirty ? (
      <button onClick={() => void save()} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-bad" title={saveError}><CircleAlert className="size-4" /> تعذّر الحفظ — إعادة المحاولة</button>
    ) : saveState === 'saving' || (dirty && valid) ? (
      <span className="inline-flex items-center gap-1.5 text-[13.5px] text-muted"><Loader2 className="size-4 animate-[spin_0.8s_linear_infinite]" /> جارٍ الحفظ…</span>
    ) : !isNew ? (
      <span className="inline-flex items-center gap-1.5 text-[13.5px] text-good"><Check className="size-4" /> محفوظ تلقائيًا</span>
    ) : null;

  return (
    <>
<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="sr-only">{isNew ? 'تحضير جديد' : `تحضير: ${draft.title || 'بلا عنوان'}`}</h1>
        <Link to="/lessons" className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-brand"><ArrowRight className="size-4" /> التحضير</Link>
        <div className="flex items-center gap-3">
          {statusBadge}
          {isNew ? (
            <>
              <Button variant="secondary" icon={<Library className="size-4" />} onClick={() => setPicker(true)}>ابدأ من تحضير سابق</Button>
              <Button variant="primary" icon={<Save className="size-4" />} loading={creating} disabled={!valid} onClick={() => void createLesson()}>إنشاء التحضير</Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <Field label="عنوان الدرس" required>
              {(p) => <Input {...p} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="مثال: الأنسجة النباتية" className="h-12 text-[18px] font-semibold" autoFocus={isNew} maxLength={200} />}
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_9rem]">
              <Field label="الوحدة">{(p) => <Input {...p} value={draft.unitName} onChange={(e) => set('unitName', e.target.value)} placeholder="مثال: الوحدة الثانية: الأنسجة" />}</Field>
              <Field label="رقم الدرس">{(p) => <Input {...p} value={draft.lessonNumber} onChange={(e) => set('lessonNumber', e.target.value)} placeholder="2-1" dir="ltr" className="text-start" />}</Field>
            </div>
          </Card>

          <Section title="نواتج التعلم" hint="ما يُتوقع أن يتمكن منه الطالب بعد الدرس.">
            <ListEditor value={draft.outcomes} onChange={(v) => set('outcomes', v)} placeholder="اكتب ناتج التعلم…" addLabel="إضافة ناتج" aria-label="ناتج التعلم" />
          </Section>
          <Section title="أهداف الدرس" hint="أهداف سلوكية قابلة للقياس. Enter يضيف هدفًا جديدًا.">
            <ListEditor value={draft.objectives} onChange={(v) => set('objectives', v)} placeholder="أن يـ…" addLabel="إضافة هدف" aria-label="هدف" />
          </Section>
          <Section title="المفاهيم والمصطلحات">
            <TagInput value={draft.concepts} onChange={(v) => set('concepts', v)} placeholder="اكتب مفهومًا ثم Enter" aria-label="المفاهيم" />
          </Section>
          <div className="grid gap-5 md:grid-cols-2">
            <Section title="استراتيجيات التدريس"><TagInput value={draft.strategies} onChange={(v) => set('strategies', v)} presets={STRATEGY_PRESETS} aria-label="استراتيجيات التدريس" /></Section>
            <Section title="مصادر التعلم والوسائل"><TagInput value={draft.resources} onChange={(v) => set('resources', v)} presets={RESOURCE_PRESETS} aria-label="مصادر التعلم" /></Section>
          </div>

          <Section
            title="سير الدرس والأنشطة"
            hint="رتّب مراحل الحصة وزمن كل مرحلة."
            action={draft.activities.length ? <span className={cn('text-[13px] tnum', planned > duration ? 'font-semibold text-bad' : 'text-muted')}>{fmt.num(planned)} / {fmt.num(duration)} دقيقة</span> : undefined}
          >
            <ActivitiesEditor value={draft.activities} onChange={(v) => set('activities', v)} />
          </Section>

          <Section title="التقويم">
            <div className="space-y-4">
              <TagInput value={draft.assessmentMethods} onChange={(v) => set('assessmentMethods', v)} presets={ASSESSMENT_METHOD_PRESETS} aria-label="أساليب التقويم" />
              <Field label="ملاحظات التقويم">{(p) => <Textarea {...p} rows={2} value={draft.assessmentNotes} onChange={(e) => set('assessmentNotes', e.target.value)} placeholder="أسئلة التقويم الختامي، معايير النجاح…" />}</Field>
            </div>
          </Section>

          <Section title="الواجب المنزلي"><Textarea rows={2} value={draft.homework} onChange={(e) => set('homework', e.target.value)} placeholder="مثال: حل تمارين الصفحة 40" aria-label="الواجب المنزلي" /></Section>
          <div className="grid gap-5 md:grid-cols-2">
            <Section title="المعالجة" hint="للطلاب الذين يحتاجون دعمًا."><Textarea rows={3} value={draft.supportPlan} onChange={(e) => set('supportPlan', e.target.value)} aria-label="المعالجة" /></Section>
            <Section title="الإثراء" hint="للطلاب المتميزين."><Textarea rows={3} value={draft.enrichmentPlan} onChange={(e) => set('enrichmentPlan', e.target.value)} aria-label="الإثراء" /></Section>
          </div>
          <Section title="ملاحظات والتأمل بعد التنفيذ">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ملاحظات">{(p) => <Textarea {...p} rows={3} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />}</Field>
              <Field label="كيف سارت الحصة؟" hint="تُدوَّن بعد التنفيذ ولا تُنسخ مع الدرس.">{(p) => <Textarea {...p} rows={3} value={draft.reflection} onChange={(e) => set('reflection', e.target.value)} />}</Field>
            </div>
          </Section>
        </div>

        {/* الشريط الجانبي: بيانات الحصة والإجراءات */}
        <aside aria-label="بيانات الحصة والإجراءات" className="space-y-4 lg:sticky lg:top-24">
          <Card className="space-y-4 p-5">
            <Field label="الشعبة والمادة" required>
              {(p) => (
                <Select {...p} value={draft.assignmentId} onChange={(e) => set('assignmentId', e.target.value)}>
                  {assignments.map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                </Select>
              )}
            </Field>
            {asg ? <SubjectChip name={asg.subjectName} color={asg.subjectColor} /> : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="التاريخ" required>{(p) => <Input {...p} type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} />}</Field>
              <Field label="الحصة">
                {(p) => (
                  <Select {...p} value={draft.period ?? ''} onChange={(e) => set('period', e.target.value ? Number(e.target.value) : null)}>
                    <option value="">—</option>
                    {periods.map((n) => <option key={n} value={n}>{fmt.num(n)}</option>)}
                  </Select>
                )}
              </Field>
            </div>
            <Field label="مدة الحصة (دقيقة)">{(p) => <Input {...p} type="number" min={5} max={240} value={draft.durationMinutes ?? ''} onChange={(e) => set('durationMinutes', e.target.value === '' ? null : Number(e.target.value))} className="tnum" />}</Field>
            {draft.activities.length ? (
              <div>
                <div className="mb-1 flex justify-between text-[13px]"><span className="text-muted">توزيع الزمن</span><span className={cn('tnum', planned > duration && 'font-semibold text-bad')}>{fmt.num(planned)} / {fmt.num(duration)}</span></div>
                <ProgressBar value={planned} max={duration} tone={planned > duration ? 'bad' : planned === duration ? 'good' : 'brand'} label="توزيع زمن الحصة" />
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <div className="mb-1.5 text-sm font-medium text-ink-2">حالة التحضير</div>
              <Segmented<LessonStatus> value={draft.status} onChange={(v) => set('status', v)} size="sm" label="حالة التحضير" options={LESSON_STATUS.items.map((s) => ({ value: s.value, label: s.label }))} />
            </div>
            <Switch checked={draft.isTemplate} onChange={(v) => set('isTemplate', v)} label={<span className="text-[14.5px]">حفظ في مكتبة القوالب</span>} />
            {draft.isTemplate ? <p className="-mt-2 text-[12.5px] text-muted">القالب لا يظهر في جدول الحصص، ويُستخدم لبدء تحضير جديد بنقرة.</p> : null}
          </Card>

          {aiOn ? <LessonAssistCard onOpen={setAiMode} /> : null}

          {!isNew && lessonQ.data ? (
            <Card className="space-y-2 p-4">
              <Button variant="secondary" className="w-full justify-start" icon={<Copy className="size-4" />} onClick={() => setCopying({ ...lessonQ.data, sectionLabel: asg?.sectionLabel ?? lessonQ.data.sectionLabel, subjectName: asg?.subjectName ?? lessonQ.data.subjectName } as LessonSummaryDto)}>نسخ إلى شعب / تواريخ أخرى</Button>
              <Button variant="secondary" className="w-full justify-start" icon={<Printer className="size-4" />} onClick={() => { void save().then(() => window.open(apiUrl('/reports/lesson-plan/html', { lessonId }), '_blank')); }}>طباعة ورقة التحضير</Button>
              <Button variant="secondary" className="w-full justify-start" icon={<ListPlus className="size-4" />} onClick={() => { void save().then(() => downloadFile('/reports/lesson-plan/pdf', { lessonId }, 'lesson-plan.pdf')).catch((e) => toast.error(errorMessage(e))); }}>تنزيل PDF</Button>
              <Button
                variant="dangerSoft"
                className="w-full justify-start"
                icon={<Trash2 className="size-4" />}
                onClick={async () => {
                  const ok = await deleteWithForce(confirm, () => api.del(`/lessons/${lessonId}`), { title: 'حذف هذا التحضير؟', description: 'لا يمكن التراجع عن الحذف.' });
                  if (ok) {
                    initFor.current = null;
                    savedJson.current = JSON.stringify(toPayload(draft));
                    void qc.invalidateQueries({ queryKey: ['lessons'] });
                    void qc.invalidateQueries({ queryKey: qk.dashboard });
                    toast.success('حُذف التحضير');
                    void navigate('/lessons', { replace: true });
                  }
                }}
              >
                حذف التحضير
              </Button>
            </Card>
          ) : (
            <Badge className="w-full justify-center py-2 text-[13px]">أنشئ التحضير أولًا لتفعيل الحفظ التلقائي والنسخ والطباعة</Badge>
          )}
        </aside>
      </div>

      <LessonPicker open={picker} onOpenChange={setPicker} onPick={(l) => void applyFrom(l)} />
      <LessonCopyDialog lesson={copying} onClose={() => setCopying(null)} defaultDate={draft.date} />
      {aiOn ? (
        <LessonAssistDialog
          mode={aiMode}
          seed={{
            assignmentId: draft.assignmentId,
            context: asg ? { gradeLevel: asg.gradeLevel, subjectName: asg.subjectName } : null,
            durationMinutes: draft.durationMinutes,
            current: draft,
          }}
          onClose={() => setAiMode(null)}
          onApplyDraft={(ai, picks, t) => setDraft((d) => (d ? applyLessonDraft({ ...d, title: d.title.trim() ? d.title : t }, ai, picks) : d))}
          onApplyIdeas={(ideas, t) => setDraft((d) => (d ? applyAssessmentIdeas({ ...d, title: d.title.trim() ? d.title : t }, ideas) : d))}
        />
      ) : null}
    </>
  );
}

