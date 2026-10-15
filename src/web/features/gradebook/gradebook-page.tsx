import { useCallback, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRight, Check, CircleAlert, Download, FileBarChart, FileSpreadsheet, Keyboard, Loader2, Plus, Printer, Target, Users, Zap } from 'lucide-react';
import { pickCurrentTerm } from '@shared/academic';
import { todayISO } from '@shared/dates';
import type { AssessmentDto, AssignmentDto, GradebookDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { api, apiUrl } from '@/lib/api';
import { deleteWithForce } from '@/lib/destructive';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Alert, Button, ButtonLink, Checkbox, EmptyState, Menu, MenuItem, MenuLabel, MenuSeparator, Modal, PageLoader, QueryError, Segmented, SubjectChip, useConfirm } from '@/components/ui';
import { AssessmentDialog } from './assessment-dialog';
import { GradeGrid, type SaveStatus } from './grid';
import { SkillsDialog } from './skills-dialog';

const QUICK = [
  { type: 'written', label: 'اختبار قصير', max: 10 },
  { type: 'homework', label: 'واجب', max: 5 },
  { type: 'participation', label: 'مشاركة صفية', max: 5 },
  { type: 'project', label: 'مشروع', max: 20 },
  { type: 'oral', label: 'تقويم شفهي', max: 10 },
  { type: 'practical', label: 'مهمة عملية', max: 10 },
] as const;

function CopyAssessmentDialog({ source, assignments, onClose }: { source: AssessmentDto | null; assignments: AssignmentDto[]; onClose: () => void }) {
  const fmt = useFmt();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const copy = useAppMutation(() => api.post(`/assessments/${source!.id}/copy`, { assignmentIds: [...picked] }), {
    invalidate: [['gradebook'], ['assessments']],
    success: `نُسخ التقويم إلى ${fmt.num(picked.size)} شعبة (بلا درجات)`,
    onSuccess: () => { setPicked(new Set()); onClose(); },
  });
  return (
    <Modal
      open={!!source}
      onOpenChange={(o) => !o && onClose()}
      size="sm"
      title="نسخ التقويم إلى شعب أخرى"
      description={source ? `«${source.title}» — يُنسخ التعريف (النوع والدرجة والوزن) دون الدرجات.` : undefined}
      footer={<><Button variant="ghost" onClick={onClose}>إلغاء</Button><Button variant="primary" disabled={picked.size === 0} loading={copy.isPending} onClick={() => copy.mutate()}>نسخ إلى {fmt.num(picked.size)}</Button></>}
    >
      {assignments.length === 0 ? <p className="text-[14.5px] text-muted">لا شعب أخرى في هذا العام.</p> : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li key={a.id} className="rounded-lg border border-line px-3 py-2.5">
              <Checkbox label={<span className="flex items-center gap-2"><b className="tnum">{a.sectionLabel}</b><SubjectChip name={a.subjectName} color={a.subjectColor} /></span>} checked={picked.has(a.id)} onChange={(e) => setPicked((s) => { const n = new Set(s); if (e.target.checked) n.add(a.id); else n.delete(a.id); return n; })} />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function SaveIndicator({ s, onRetry }: { s: SaveStatus; onRetry: () => void }) {
  if (s.failed > 0)
    return <button onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg bg-bad-soft px-3 py-1.5 text-[13.5px] font-medium text-bad"><CircleAlert className="size-4" /> تعذّر حفظ {s.failed} — إعادة المحاولة</button>;
  if (s.invalid > 0)
    return <span className="inline-flex items-center gap-1.5 rounded-lg bg-warn-soft px-3 py-1.5 text-[13.5px] font-medium text-warn"><AlertTriangle className="size-4" /> {s.invalid} قيمة غير صالحة لم تُحفظ</span>;
  if (s.pending > 0 || s.saving)
    return <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-3 px-3 py-1.5 text-[13.5px] text-muted"><Loader2 className="size-4 animate-[spin_0.8s_linear_infinite]" /> جارٍ الحفظ…</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-lg bg-good-soft px-3 py-1.5 text-[13.5px] font-medium text-good"><Check className="size-4" /> كل الدرجات محفوظة</span>;
}

export default function GradebookPage() {
  const { assignmentId = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const confirm = useConfirm();
  const fmt = useFmt();
  const { years } = useAcademic();
  const [assessmentDlg, setAssessmentDlg] = useState<{ assessment: AssessmentDto | null } | null>(null);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [copying, setCopying] = useState<AssessmentDto | null>(null);
  const [status, setStatus] = useState<SaveStatus>({ pending: 0, saving: false, failed: 0, invalid: 0 });
  const api2 = useRef<{ flush: () => Promise<void>; retry: () => Promise<void> } | null>(null);

  const all = useQuery({ queryKey: ['assignments', 'all'], queryFn: () => api.get<AssignmentDto[]>('/assignments') });
  const asg = all.data?.find((a) => a.id === assignmentId);
  const year = years.find((y) => y.id === asg?.yearId);
  const termId = sp.get('term') ?? (year ? pickCurrentTerm(year.terms, todayISO())?.id : undefined);

  const gbQ = useQuery({
    queryKey: qk.gradebook(assignmentId, termId ?? ''),
    queryFn: () => api.get<GradebookDto>('/gradebook', { assignmentId, termId }),
    enabled: !!termId,
    // الدرجات تتغير باستمرار: نعيد جلبها دائمًا عند فتح الصفحة (لا نعتمد على ذاكرة قديمة)
    staleTime: 0,
  });

  const registerApi = useCallback((a: { flush: () => Promise<void>; retry: () => Promise<void> }) => { api2.current = a; }, []);
  const onStatus = useCallback((s: SaveStatus) => setStatus(s), []);

  const quick = useAppMutation(
    (q: (typeof QUICK)[number]) => {
      const n = (gbQ.data?.assessments.filter((a) => a.type === q.type).length ?? 0) + 1;
      return api.post('/assessments', { assignmentId, termId, title: `${q.label} ${fmt.num(n)}`, type: q.type, mode: 'score', maxScore: q.max, weight: q.max, countsTowardTotal: true, skillIds: [], date: todayISO() });
    },
    { invalidate: [['gradebook'], ['assessments'], qk.dashboard], success: 'أُضيف التقويم — اكتب الدرجات مباشرة في الشبكة' },
  );

  if (all.isPending) return <PageLoader />;
  if (!asg) return <QueryError error={new Error('المقرر غير موجود أو حُذف')} />;
  if (!termId || !year) return <PageLoader />;
  const gb = gbQ.data;
  const reportQuery = { assignmentId, termId };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/assessments" className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-brand"><ArrowRight className="size-4" /> التقويم المستمر</Link>
      </div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-[26px] font-bold leading-9 text-ink"><span className="tnum">{asg.sectionLabel}</span><SubjectChip name={asg.subjectName} color={asg.subjectColor} className="text-[15px]" /></h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[14px] text-muted">
            <Link to={`/classes/${asg.sectionId}`} className="inline-flex items-center gap-1 hover:text-brand"><Users className="size-4" /> {fmt.num(gb?.students.length ?? 0)} طالبًا</Link>
            <span>· العام {year.name}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented value={termId} onChange={(v) => setSp({ term: v }, { replace: true })} label="الفصل الدراسي" options={year.terms.map((t) => ({ value: t.id, label: t.name.replace('الفصل الدراسي ', 'الفصل ') }))} />
        </div>
      </header>

      <div className="sticky top-[68px] z-20 -mx-4 mb-4 flex flex-wrap items-center gap-2 border-b border-line bg-bg/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setAssessmentDlg({ assessment: null })}>تقويم جديد</Button>
        <Menu trigger={<Button variant="secondary" icon={<Zap className="size-4" />}>إضافة سريعة</Button>}>
          <MenuLabel>يُنشأ بقيم معتادة وتعدّلها لاحقًا</MenuLabel>
          {QUICK.map((q) => <MenuItem key={q.type} onSelect={() => quick.mutate(q)}>{q.label} (من {fmt.num(q.max)})</MenuItem>)}
        </Menu>
        <Button variant="secondary" icon={<Target className="size-4" />} onClick={() => setSkillsOpen(true)}>المهارات</Button>
        <Menu align="end" trigger={<Button variant="secondary" icon={<FileBarChart className="size-4" />}>التقارير</Button>}>
          <MenuLabel>كشف الدرجات</MenuLabel>
          <MenuItem icon={<Download className="size-4" />} onSelect={() => { void api2.current?.flush().then(() => window.location.assign(apiUrl('/reports/class-gradebook/pdf', reportQuery))); }}>تنزيل PDF</MenuItem>
          <MenuItem icon={<FileSpreadsheet className="size-4" />} onSelect={() => { void api2.current?.flush().then(() => window.location.assign(apiUrl('/reports/class-gradebook/xlsx', reportQuery))); }}>تنزيل Excel</MenuItem>
          <MenuItem icon={<Printer className="size-4" />} onSelect={() => { void api2.current?.flush().then(() => window.open(apiUrl('/reports/class-gradebook/html', reportQuery), '_blank')); }}>طباعة</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<FileBarChart className="size-4" />} onSelect={() => window.open(apiUrl('/reports/class-analysis/html', reportQuery), '_blank')}>تحليل أداء الشعبة</MenuItem>
        </Menu>
        <div className="ms-auto"><SaveIndicator s={status} onRetry={() => void api2.current?.retry()} /></div>
      </div>

      {gbQ.error ? <QueryError error={gbQ.error} onRetry={() => void gbQ.refetch()} /> : !gb ? <PageLoader /> : gb.students.length === 0 ? (
        <EmptyState icon={<Users className="size-7" />} title="لا طلاب في هذه الشعبة" description="أضف الطلاب إلى الشعبة أولًا ثم عُد لرصد الدرجات." action={<ButtonLink to={`/classes/${asg.sectionId}`} variant="primary">إضافة الطلاب</ButtonLink>} />
      ) : gb.assessments.length === 0 ? (
        <EmptyState
          icon={<Zap className="size-7" />}
          title="ابدأ بإضافة أول تقويم"
          description="اختر نوعًا معتادًا لإنشائه فورًا، أو أنشئ تقويمًا مخصصًا بدرجته ووزنه ومهاراته."
          action={
            <div className="flex max-w-xl flex-wrap justify-center gap-2">
              {QUICK.map((q) => <Button key={q.type} variant="secondary" loading={quick.isPending && quick.variables?.type === q.type} onClick={() => quick.mutate(q)}>{q.label} · {fmt.num(q.max)}</Button>)}
              <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setAssessmentDlg({ assessment: null })}>تقويم مخصص</Button>
            </div>
          }
        />
      ) : (
        <>
          <GradeGrid
            gb={gb}
            onStatus={onStatus}
            registerApi={registerApi}
            onEdit={(a) => setAssessmentDlg({ assessment: a })}
            onCopy={setCopying}
            onDelete={(a) =>
              void deleteWithForce(confirm, (force) => api.del(`/assessments/${a.id}`, { force }), { title: `حذف «${a.title}»؟`, description: 'تُحذف معه كل درجاته.' }).then((ok) => {
                if (ok) {
                  toast.success('حُذف التقويم');
                  void gbQ.refetch();
                }
              })
            }
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5"><Keyboard className="size-4" /> <b>Enter</b> للأسفل · <b>Tab</b>/الأسهم للتنقل · <b>Esc</b> للتراجع</span>
            <span><b className="text-bad">غ</b> غائب (صفر) · <b>ع</b> معذور (مستثنى) · الصق من Excel مباشرة</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-bad" /> يحتاج دعمًا <span className="size-2 rounded-full bg-good" /> إثراء</span>
          </div>
          {gb.assessments.some((a) => a.mode === 'score' && a.countsTowardTotal) ? null : <Alert tone="info" className="mt-4">لا توجد تقويمات تُحتسب في مجموع الدرجات؛ لن تظهر نسبة الطالب حتى تضيف تقويمًا بالدرجات.</Alert>}
        </>
      )}

      <AssessmentDialog
        open={!!assessmentDlg}
        onOpenChange={(o) => !o && setAssessmentDlg(null)}
        assignmentId={assignmentId}
        subjectId={asg.subjectId}
        termId={termId}
        assessment={assessmentDlg?.assessment ?? null}
        existing={gb?.assessments ?? []}
        hasResults={!!assessmentDlg?.assessment && !!gb?.students.some((s) => s.results[assessmentDlg.assessment!.id])}
      />
      <SkillsDialog open={skillsOpen} onOpenChange={setSkillsOpen} subjectId={asg.subjectId} subjectName={asg.subjectName} />
      <CopyAssessmentDialog source={copying} assignments={(all.data ?? []).filter((a) => a.yearId === asg.yearId && a.id !== asg.id)} onClose={() => setCopying(null)} />
    </>
  );
}
