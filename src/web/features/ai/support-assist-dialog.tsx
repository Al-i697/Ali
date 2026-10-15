// المساعد الذكي في الخطط العلاجية والإثرائية. يصف المعلم المهارة أو الصعوبة بصياغة عامة (دون اسم الطالب)،
// فيقترح المساعد أسبابًا محتملة وهدفًا وإجراءات؛ ويُدرَج المختار في نموذج الخطة دون استبدال ما كتبه المعلم.
import { useState } from 'react';
import { toast } from 'sonner';
import { AI_LIMITS, SUPPORT_KIND, gradeLabel, type SupportKind } from '@shared/constants';
import type { AiSupportIdeas } from '@shared/dto';
import { useFmt } from '@/lib/hooks';
import { Badge, Field, Textarea } from '@/components/ui';
import { AiAssistShell, BulletList, ReviewSection } from './assist-shell';
import { defaultSupportPicks, type SupportLike, type SupportPicks } from './merge';
import { useAiRunner, useAiStatus } from './use-ai';

export type SupportSeed = {
  kind: SupportKind;
  assignmentId: string;
  context: { gradeLevel: number; subjectName: string } | null;
  /** عنوان الخطة الحالي: يُعبَّأ منه وصف المهارة (يعدّله المعلم). لا يُؤخذ شيء آخر من الخطة أو الطالب */
  title: string;
  current: SupportLike;
};

export function SupportAssistDialog({
  open,
  seed,
  onClose,
  onApply,
}: {
  open: boolean;
  seed: SupportSeed;
  onClose: () => void;
  onApply: (ai: AiSupportIdeas, picks: SupportPicks) => void;
}) {
  if (!open) return null;
  return <Body seed={seed} onClose={onClose} onApply={onApply} />;
}

function Body({ seed, onClose, onApply }: { seed: SupportSeed; onClose: () => void; onApply: (ai: AiSupportIdeas, picks: SupportPicks) => void }) {
  const fmt = useFmt();
  const status = useAiStatus();
  const runner = useAiRunner();
  const [focus, setFocus] = useState(seed.title);
  const [override, setOverride] = useState<Partial<SupportPicks>>({});

  const trimmed = focus.trim();
  const inputKey = JSON.stringify([seed.kind, focus]);
  const problem = trimmed.length > AI_LIMITS.focus ? `الوصف أطول من ${fmt.num(AI_LIMITS.focus, 0)} حرفًا.` : null;
  const remedial = seed.kind === 'remedial';

  const run = (acknowledgeNames: boolean) => {
    setOverride({});
    void runner.run(
      { task: 'support-plan-ideas', kind: seed.kind, focus: trimmed, assignmentId: seed.assignmentId || undefined, ...(acknowledgeNames ? { acknowledgeNames: true } : {}) },
      inputKey,
    );
  };

  const response = runner.state.phase === 'done' ? runner.state.response : null;
  const ideas = response?.task === 'support-plan-ideas' ? response.result : null;
  const picks: SupportPicks | null = ideas ? { ...defaultSupportPicks(seed.current, ideas), ...override } : null;

  const form = (
    <div className="space-y-4">
      <p className="text-[13px] text-muted">
        نوع الخطة: <Badge tone="brand" className="ms-1">{SUPPORT_KIND.labels[seed.kind]}</Badge>
        {seed.context ? <Badge className="ms-2">{gradeLabel(seed.context.gradeLevel)} · {seed.context.subjectName}</Badge> : null}
      </p>
      <Field
        label={remedial ? 'وصف المهارة أو الصعوبة' : 'وصف المهارة أو مجال التميّز'}
        required
        hint="اكتبه بصياغة عامة تصلح لأي طالب بالحالة نفسها، مثل «ضعف في قراءة الرسوم البيانية». لا تكتب اسم الطالب ولا بياناته."
      >
        {(p) => <Textarea {...p} rows={4} value={focus} onChange={(e) => setFocus(e.target.value)} maxLength={AI_LIMITS.focus} autoFocus />}
      </Field>
    </div>
  );

  const review = ideas && picks ? (
    <div className="space-y-3">
      {ideas.reason ? (
        <ReviewSection
          title={remedial ? 'أسباب محتملة (التشخيص)' : 'مبرر الخطة'}
          checked={picks.reason}
          onChange={(v) => setOverride((o) => ({ ...o, reason: v }))}
          note={seed.current.reason.trim() ? 'لديك نص مكتوب في هذا الحقل. إن اخترت الإدراج فسيُضاف بعد نصك دون استبداله.' : undefined}
        >
          <p>{ideas.reason}</p>
        </ReviewSection>
      ) : null}
      {ideas.goal ? (
        <ReviewSection
          title="الهدف"
          checked={picks.goal}
          onChange={(v) => setOverride((o) => ({ ...o, goal: v }))}
          note={seed.current.goal.trim() ? 'لديك نص مكتوب في هذا الحقل. إن اخترت الإدراج فسيُضاف بعد نصك دون استبداله.' : undefined}
        >
          <p>{ideas.goal}</p>
        </ReviewSection>
      ) : null}
      {ideas.strategies.length ? (
        <ReviewSection title="الاستراتيجيات والإجراءات" checked={picks.strategies} onChange={(v) => setOverride((o) => ({ ...o, strategies: v }))}>
          <BulletList items={ideas.strategies} />
        </ReviewSection>
      ) : null}
      {!ideas.reason && !ideas.goal && !ideas.strategies.length ? <p className="text-[14px] text-muted">لم يُرجع المساعد محتوى قابلًا للإدراج. عدّل الوصف وحاول مجددًا.</p> : null}
    </div>
  ) : null;

  return (
    <AiAssistShell
      title={remedial ? 'أفكار خطة علاجية بالمساعد الذكي' : 'أفكار خطة إثرائية بالمساعد الذكي'}
      description="يقترح المساعد أسبابًا محتملة وهدفًا وإجراءات بصياغة عامة؛ تراجعها وتعدّلها لتناسب الطالب."
      status={status}
      state={runner.state}
      form={form}
      canRun={trimmed.length > 0}
      problem={problem}
      inputKey={inputKey}
      onRun={run}
      onCancel={runner.reset}
      onBack={runner.reset}
      onClose={onClose}
      review={review}
      applyLabel="إدراج المحدد في الخطة"
      canApply={!!picks && (picks.reason || picks.goal || picks.strategies)}
      onApply={() => {
        if (!ideas || !picks) return;
        onApply(ideas, picks);
        toast.success('أُدرج المحدد في الخطة. راجع الصياغة وعدّلها لتناسب الطالب.');
        onClose();
      }}
    />
  );
}
