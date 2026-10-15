// المساعد الذكي في محرر التحضير: «مسودة التحضير» و«أفكار التقويم». المعلم يكتب العنوان والأهداف (مُعبَّأة من تحضيره)،
// ويراجع الاقتراح ويختار الأقسام التي تُدرَج؛ والدمج إضافة فقط (انظر merge.ts).
import { useState } from 'react';
import { toast } from 'sonner';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { ACTIVITY_PHASE, AI_LIMITS, ASSESSMENT_TYPE, gradeLabel } from '@shared/constants';
import type { AiAssessmentIdea, AiLessonDraft } from '@shared/dto';
import { useFmt } from '@/lib/hooks';
import { Badge, Button, Card, Field, Input, ListEditor, Textarea } from '@/components/ui';
import { AiAssistShell, BulletList, ReviewSection } from './assist-shell';
import { SECTION_LABEL, SECTION_ORDER, defaultPicks, isTextSection, ownText, sectionHasContent, type LessonLike, type LessonPicks, type LessonSection } from './merge';
import { useAiRunner, useAiStatus } from './use-ai';

export type LessonAssistMode = 'draft' | 'assessment';

export type LessonSeed = {
  assignmentId: string;
  /** الصف والمادة اللذان يُرسَلان (من المقرر المحدد) */
  context: { gradeLevel: number; subjectName: string } | null;
  durationMinutes: number | null;
  /** التحضير الحالي: يُعبَّأ منه العنوان والأهداف، ويُحسب منه ما يُحدَّد افتراضيًا في المراجعة */
  current: LessonLike;
};

/** بطاقة الشريط الجانبي في محرر التحضير */
export function LessonAssistCard({ onOpen }: { onOpen: (mode: LessonAssistMode) => void }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Sparkles className="size-4" aria-hidden /></span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-5 text-ink">المساعد الذكي</h2>
          <p className="text-[12.5px] leading-4 text-muted">مسودات تراجعها قبل الاعتماد</p>
        </div>
      </div>
      <Button variant="soft" className="w-full justify-start" icon={<Sparkles className="size-4" />} onClick={() => onOpen('draft')}>اقترح مسودة التحضير</Button>
      <Button variant="secondary" className="w-full justify-start" icon={<ClipboardCheck className="size-4" />} onClick={() => onOpen('assessment')}>أفكار للتقويم</Button>
    </Card>
  );
}

export function LessonAssistDialog({
  mode,
  seed,
  onClose,
  onApplyDraft,
  onApplyIdeas,
}: {
  mode: LessonAssistMode | null;
  seed: LessonSeed;
  onClose: () => void;
  /** يُستدعى بالمقترح والأقسام المختارة والعنوان الذي كتبه المعلم في النافذة (لملء العنوان الفارغ) */
  onApplyDraft: (ai: AiLessonDraft, picks: LessonPicks, title: string) => void;
  onApplyIdeas: (ideas: AiAssessmentIdea[], title: string) => void;
}) {
  // الجسم لا يُركَّب إلا عند الفتح: كل فتح يبدأ من التحضير الحالي، وإغلاقه يُسقط أي طلب جارٍ
  if (!mode) return null;
  return <Body mode={mode} seed={seed} onClose={onClose} onApplyDraft={onApplyDraft} onApplyIdeas={onApplyIdeas} />;
}

function Body({
  mode,
  seed,
  onClose,
  onApplyDraft,
  onApplyIdeas,
}: {
  mode: LessonAssistMode;
  seed: LessonSeed;
  onClose: () => void;
  onApplyDraft: (ai: AiLessonDraft, picks: LessonPicks, title: string) => void;
  onApplyIdeas: (ideas: AiAssessmentIdea[], title: string) => void;
}) {
  const fmt = useFmt();
  const status = useAiStatus();
  const runner = useAiRunner();
  const isDraft = mode === 'draft';

  const [title, setTitle] = useState(seed.current.title);
  const [objectives, setObjectives] = useState<string[]>(seed.current.objectives);
  const [notes, setNotes] = useState('');
  const [minutes, setMinutes] = useState<number | null>(seed.durationMinutes ?? 45);
  const [pickOverride, setPickOverride] = useState<Partial<LessonPicks>>({});
  const [ideasOff, setIdeasOff] = useState<ReadonlySet<number>>(new Set());

  const cleanObjectives = objectives.map((o) => o.trim()).filter(Boolean);
  const inputKey = JSON.stringify([isDraft, title, objectives, notes, minutes]);

  const total = [title.trim(), ...cleanObjectives, ...(notes.trim() ? [notes.trim()] : [])].join('\n').length;
  const longObjective = cleanObjectives.findIndex((o) => o.length > AI_LIMITS.objective);
  const problem =
    title.trim().length > AI_LIMITS.title ? `عنوان الدرس أطول من ${fmt.num(AI_LIMITS.title, 0)} حرفًا.`
    : cleanObjectives.length > AI_LIMITS.objectives ? `الحد الأقصى ${fmt.num(AI_LIMITS.objectives, 0)} أهداف في الطلب الواحد؛ احذف ما زاد.`
    : longObjective >= 0 ? `الهدف رقم ${fmt.num(longObjective + 1, 0)} أطول من ${fmt.num(AI_LIMITS.objective, 0)} حرفًا.`
    : notes.trim().length > AI_LIMITS.notes ? `الملاحظات أطول من ${fmt.num(AI_LIMITS.notes, 0)} حرفًا.`
    : total > AI_LIMITS.totalChars ? `مجموع النص ${fmt.num(total, 0)} حرفًا والحد ${fmt.num(AI_LIMITS.totalChars, 0)}؛ اختصر الأهداف أو الملاحظات.`
    : isDraft && (minutes === null || minutes < 10 || minutes > 180) ? 'مدة الحصة بين 10 و180 دقيقة.'
    : null;

  const run = (acknowledgeNames: boolean) => {
    setPickOverride({});
    setIdeasOff(new Set());
    const base = {
      title: title.trim(),
      objectives: cleanObjectives,
      notes: notes.trim() || null,
      assignmentId: seed.assignmentId || undefined,
      ...(acknowledgeNames ? { acknowledgeNames: true } : {}),
    };
    void runner.run(isDraft ? { task: 'lesson-draft', ...base, minutes: minutes ?? 45 } : { task: 'assessment-ideas', ...base }, inputKey);
  };

  const response = runner.state.phase === 'done' ? runner.state.response : null;
  const draft = response?.task === 'lesson-draft' ? response.result : null;
  const ideas = response?.task === 'assessment-ideas' ? response.result.ideas : null;
  const picks: LessonPicks | null = draft ? { ...defaultPicks(seed.current, draft), ...pickOverride } : null;
  const chosenIdeas = ideas ? ideas.filter((_, i) => !ideasOff.has(i)) : [];

  const apply = () => {
    if (draft && picks) onApplyDraft(draft, picks, title.trim());
    else if (ideas) onApplyIdeas(chosenIdeas, title.trim());
    else return;
    toast.success('أُدرج المحدد في التحضير. راجع الصياغة وعدّلها كما تشاء.');
    onClose();
  };

  const planned = draft ? draft.activities.reduce((n, a) => n + (a.minutes ?? 0), 0) : 0;

  const form = (
    <div className="space-y-4">
      {seed.context ? (
        <p className="text-[13px] text-muted">
          الصف والمادة المُرسَلان: <Badge className="ms-1">{gradeLabel(seed.context.gradeLevel)} · {seed.context.subjectName}</Badge>
        </p>
      ) : null}
      <Field label="عنوان الدرس" required>
        {(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={AI_LIMITS.title} placeholder="مثال: الانتشار والأسموزية" autoFocus />}
      </Field>
      <div>
        <div className="mb-1.5 text-sm font-medium text-ink-2">
          الأهداف التي كتبتها <span className="font-normal text-muted">(اختياري)</span>
        </div>
        <p className="mb-2 text-[13px] text-muted">{isDraft ? 'يبني المساعد الأنشطة عليها ويكمّلها ولا يكرّرها.' : 'تُبنى أفكار التقويم على قياس هذه الأهداف.'}</p>
        <ListEditor value={objectives} onChange={setObjectives} placeholder="أن يـ…" addLabel="إضافة هدف" aria-label="هدف" />
      </div>
      <Field label="ملاحظات للمساعد" hint="اختياري: مستوى الطلاب، نوع الأنشطة التي تفضّلها، الموارد المتاحة في مدرستك…">
        {(p) => <Textarea {...p} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={AI_LIMITS.notes} />}
      </Field>
      {isDraft ? (
        <Field label="مدة الحصة (دقيقة)" required>
          {(p) => (
            <Input {...p} type="number" min={10} max={180} value={minutes ?? ''} onChange={(e) => setMinutes(e.target.value === '' ? null : Number(e.target.value))} className="tnum w-32" />
          )}
        </Field>
      ) : null}
    </div>
  );

  const setPick = (s: LessonSection, v: boolean) => setPickOverride((o) => ({ ...o, [s]: v }));

  const review = draft && picks ? (
    <div className="space-y-3">
      {SECTION_ORDER.filter((s) => sectionHasContent(draft, s)).map((s) => {
        const hasOwnText = isTextSection(s) && ownText(seed.current, s).trim() !== '';
        return (
          <ReviewSection
            key={s}
            title={SECTION_LABEL[s]}
            checked={picks[s]}
            onChange={(v) => setPick(s, v)}
            note={hasOwnText ? 'لديك نص مكتوب في هذا الحقل. إن اخترت إدراج المقترح فسيُضاف بعد نصك دون استبداله.' : undefined}
          >
            {s === 'activities' ? (
              <>
                <ol className="space-y-1.5">
                  {draft.activities.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <Badge tone="info" className="mt-1 h-fit shrink-0">{ACTIVITY_PHASE.labels[a.phase]}{a.minutes ? <span className="tnum"> · {fmt.num(a.minutes, 0)} د</span> : null}</Badge>
                      <span>{a.description}</span>
                    </li>
                  ))}
                </ol>
                {planned > 0 ? (
                  <p className={planned > (seed.durationMinutes ?? 45) ? 'mt-1 text-[13px] font-semibold text-bad' : 'mt-1 text-[13px] text-muted'}>
                    مجموع الأزمنة المقترحة: <span className="tnum">{fmt.num(planned, 0)}</span> دقيقة (مدة الحصة <span className="tnum">{fmt.num(seed.durationMinutes ?? 45, 0)}</span>)
                  </p>
                ) : null}
              </>
            ) : s === 'homework' || s === 'supportIdea' || s === 'enrichmentIdea' ? (
              <p>{draft[s]}</p>
            ) : (
              <BulletList items={draft[s]} />
            )}
          </ReviewSection>
        );
      })}
      {SECTION_ORDER.every((s) => !sectionHasContent(draft, s)) ? <p className="text-[14px] text-muted">لم يُرجع المساعد محتوى قابلًا للإدراج. عدّل المدخلات وحاول مجددًا.</p> : null}
    </div>
  ) : ideas ? (
    <div className="space-y-3">
      {ideas.map((idea, i) => (
        <ReviewSection
          key={i}
          title={<>{idea.title} <Badge className="ms-1">{ASSESSMENT_TYPE.labels[idea.type]}</Badge></>}
          checked={!ideasOff.has(i)}
          onChange={(v) =>
            setIdeasOff((cur) => {
              const next = new Set(cur);
              if (v) next.delete(i);
              else next.add(i);
              return next;
            })
          }
        >
          <p>{idea.description}</p>
          {idea.criteria.length ? (
            <div className="mt-1">
              <div className="text-[13px] font-medium text-muted">معايير النجاح</div>
              <BulletList items={idea.criteria} />
            </div>
          ) : null}
        </ReviewSection>
      ))}
      {ideas.length === 0 ? <p className="text-[14px] text-muted">لم يُرجع المساعد أفكارًا قابلة للإدراج. عدّل المدخلات وحاول مجددًا.</p> : null}
      {ideas.length ? <p className="text-[12.5px] text-muted">تُضاف العناوين إلى «أساليب التقويم»، ويُلحَق الوصف والمعايير بـ«ملاحظات التقويم».</p> : null}
    </div>
  ) : null;

  return (
    <AiAssistShell
      title={isDraft ? 'مسودة تحضير بالمساعد الذكي' : 'أفكار تقويم بالمساعد الذكي'}
      description={isDraft ? 'اكتب عنوان الدرس وأهدافك ليقترح المساعد مسودة تراجعها وتختار ما يُدرَج.' : 'يقترح المساعد أساليب تقويم متنوعة بمعايير نجاح؛ تختار ما يناسبك.'}
      status={status}
      state={runner.state}
      form={form}
      canRun={title.trim().length > 0}
      problem={problem}
      inputKey={inputKey}
      onRun={run}
      onCancel={runner.reset}
      onBack={runner.reset}
      onClose={onClose}
      review={review}
      applyLabel={isDraft ? 'إدراج المحدد في التحضير' : 'إدراج المحدد في التقويم'}
      canApply={draft && picks ? Object.values(picks).some(Boolean) : chosenIdeas.length > 0}
      onApply={apply}
    />
  );
}
