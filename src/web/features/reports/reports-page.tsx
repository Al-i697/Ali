import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookOpenCheck, ClipboardList, Download, ExternalLink, FileBarChart, FileSpreadsheet, FileText, FlaskConical, HeartHandshake, Loader2, Printer, TrendingUp, UserRound } from 'lucide-react';
import { LAB_KIND, LAB_STATUS, REPORT_TYPE, SUPPORT_KIND, SUPPORT_STATUS, type LabKind, type LabStatus, type ReportType, type SupportKind, type SupportStatus } from '@shared/constants';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, downloadFile, errorMessage, getText } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useDebounced } from '@/lib/hooks';
import { qk, useAssignments, useSections } from '@/lib/queries';
import type { RosterEntryDto } from '@shared/dto';
import { Alert, Button, Card, Checkbox, EmptyState, Field, Input, PageHeader, PageLoader, Select } from '@/components/ui';

const TYPES: { value: ReportType; icon: typeof FileText; desc: string }[] = [
  { value: 'class-gradebook', icon: ClipboardList, desc: 'درجات كل طلاب الشعبة في كل التقويمات مع المجاميع والمستويات.' },
  { value: 'class-analysis', icon: TrendingUp, desc: 'توزيع المستويات، أداء كل تقويم، والطلاب المحتاجون للعلاج أو الإثراء.' },
  { value: 'student', icon: UserRound, desc: 'أداء طالب في كل مواده مع تفاصيل التقويمات والمهارات.' },
  { value: 'lessons', icon: BookOpenCheck, desc: 'جدول بدروس فترة زمنية وحالة تحضيرها وتنفيذها.' },
  { value: 'lesson-plan', icon: FileText, desc: 'أوراق تحضير مفصلة لفترة (كل درس في صفحة) جاهزة للطباعة.' },
  { value: 'support-plans', icon: HeartHandshake, desc: 'قائمة الخطط العلاجية والإثرائية بحالتها وأثرها على نسب الطلاب. (الخطة الفردية تُطبع من صفحتها).' },
  { value: 'lab-log', icon: FlaskConical, desc: 'سجل التجارب والأنشطة العملية لفترة: نوعها ومكانها وحالتها وعدد المشاركين. (ورقة النشاط الواحد تُطبع من صفحة المختبر).' },
];

type Params = {
  assignmentId: string;
  termId: string;
  sectionId: string;
  studentId: string;
  from: string;
  to: string;
  assignmentFilter: string;
  includeNotes: boolean;
  includeGuardian: boolean;
  supportKind: '' | SupportKind;
  supportStatus: '' | SupportStatus;
  labKind: '' | LabKind;
  labStatus: '' | LabStatus;
};

function ready(type: ReportType, p: Params): boolean {
  switch (type) {
    case 'class-gradebook':
    case 'class-analysis':
      return !!p.assignmentId && !!p.termId;
    case 'student':
      return !!p.studentId;
    case 'lessons':
      return !!p.from && !!p.to && p.to >= p.from;
    case 'lesson-plan':
      return !!p.from && !!p.to && p.to >= p.from;
    case 'support-plans':
      return true;
    case 'lab-log':
      return !!p.from && !!p.to && p.to >= p.from;
  }
}

function queryFor(type: ReportType, p: Params) {
  switch (type) {
    case 'class-gradebook':
    case 'class-analysis':
      return { assignmentId: p.assignmentId, termId: p.termId };
    case 'student':
      return { studentId: p.studentId, termId: p.termId || undefined, includeNotes: p.includeNotes, includeGuardian: p.includeGuardian };
    case 'lessons':
    case 'lesson-plan':
      return { from: p.from, to: p.to, assignmentId: p.assignmentFilter || undefined };
    case 'support-plans':
      return { assignmentId: p.assignmentFilter || undefined, kind: p.supportKind || undefined, status: p.supportStatus || undefined };
    case 'lab-log':
      return { from: p.from, to: p.to, assignmentId: p.assignmentFilter || undefined, labKind: p.labKind || undefined, labStatus: p.labStatus || undefined };
  }
}

const PAGE_PX = { portrait: 794, landscape: 1123 } as const; // عرض A4 بالبكسل عند 96 نقطة/بوصة

/**
 * معاينة طباعة حقيقية: نعرض الصفحة بعرض الورقة الفعلي (A4 طولي/عرضي) ثم نصغّرها لتناسب المساحة،
 * فيرى المعلم التقرير كما سيُطبع (أعمدة الجداول بعرضها الحقيقي) بدل تضييقه إلى عرض النافذة.
 * على الشاشات الضيقة جدًا (الجوال) نبقي التدفق الطبيعي لأن التصغير يجعل النص غير مقروء.
 */
function PrintPreview({ html, title, frameRef }: { html: string; title: string; frameRef: React.RefObject<HTMLIFrameElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const landscape = /size:\s*A4\s+landscape/i.test(html);
  const pageW = landscape ? PAGE_PX.landscape : PAGE_PX.portrait;
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const scaled = width >= 560;
  const scale = scaled ? Math.min(1, width / pageW) : 1;
  const height = '80vh';
  return (
    <div ref={box} className="relative overflow-hidden rounded-card border border-line bg-[#e8ece9] shadow-card" style={scaled ? { height, minHeight: 420 } : undefined}>
      <iframe
        ref={frameRef}
        title={title}
        srcDoc={html}
        className="block border-0 bg-transparent"
        style={scaled ? { width: pageW, height: `calc(${height} / ${scale})`, transform: `scale(${scale})`, transformOrigin: 'top right', position: 'absolute', top: 0, right: 0 } : { width: '100%', height }}
        sandbox="allow-same-origin allow-modals"
      />
    </div>
  );
}

export default function ReportsPage() {
  const [sp] = useSearchParams();
  const { year, term } = useAcademic();
  const { system } = useAuth();
  const assignments = useAssignments(year?.id);
  const sections = useSections(year?.id);
  const frame = useRef<HTMLIFrameElement>(null);
  const initialType = (REPORT_TYPE.values as readonly string[]).includes(sp.get('type') ?? '') ? (sp.get('type') as ReportType) : 'class-gradebook';
  const [type, setType] = useState<ReportType>(initialType);
  const [busy, setBusy] = useState<'pdf' | 'xlsx' | null>(null);
  const [p, setP] = useState<Params>({
    assignmentId: sp.get('assignment') ?? '',
    termId: sp.get('term') ?? term?.id ?? '',
    sectionId: '',
    studentId: sp.get('student') ?? '',
    from: term?.startDate ?? '',
    to: term?.endDate ?? '',
    assignmentFilter: '',
    includeNotes: false,
    includeGuardian: false,
    supportKind: '',
    supportStatus: '',
    labKind: '',
    labStatus: '',
  });

  // قيم افتراضية عند وصول البيانات
  const firstAssignment = assignments.data?.[0]?.id;
  useEffect(() => {
    setP((cur) => ({
      ...cur,
      assignmentId: cur.assignmentId || firstAssignment || '',
      termId: cur.termId || term?.id || '',
      from: cur.from || term?.startDate || '',
      to: cur.to || term?.endDate || '',
    }));
  }, [firstAssignment, term]);

  const roster = useQuery({ queryKey: qk.roster(p.sectionId), queryFn: () => api.get<RosterEntryDto[]>(`/sections/${p.sectionId}/students`), enabled: type === 'student' && !!p.sectionId });
  const set = <K extends keyof Params>(k: K, v: Params[K]) => setP((c) => ({ ...c, [k]: v }));

  const isReady = ready(type, p);
  const query = useMemo(() => queryFor(type, p), [type, p]);
  // المعاينة تتأخر 350ms عن الإدخال (حتى لا يُولَّد تقرير عند كل ضغطة)، وتُفحص جاهزيتها على القيم المؤجَّلة نفسها
  const dp = useDebounced(p, 350);
  const previewQuery = useMemo(() => queryFor(type, dp), [type, dp]);
  const preview = useQuery({
    queryKey: ['report-preview', type, previewQuery],
    queryFn: () => getText(`/reports/${type}/html`, previewQuery as never),
    enabled: ready(type, dp),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    // أثناء تحديث المعايير نُبقي المعاينة السابقة (من النوع نفسه) بدل وميض شاشة التحميل
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[1] === type ? prev : undefined),
  });

  const download = async (format: 'pdf' | 'xlsx') => {
    setBusy(format);
    try {
      await downloadFile(`/reports/${type}/${format}`, query as never, `report.${format}`);
      toast.success(format === 'pdf' ? 'تم تنزيل ملف PDF' : 'تم تنزيل ملف Excel');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const print = () => frame.current?.contentWindow?.print();
  const pdfAvailable = system?.capabilities.pdf ?? false;
  const typeMeta = REPORT_TYPE.items.find((t) => t.value === type)!;

  // الشعب التي لها مقررات (لاختيار الطالب)
  const sectionOptions = sections.data ?? [];

  return (
    <>
      <PageHeader title="التقارير" description="اختر التقرير وحدّد معاييره، وراجع المعاينة ثم نزّله بصيغة PDF أو Excel أو اطبعه." />
      <div className="grid items-start gap-6 lg:grid-cols-[23rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="p-2">
            <div role="radiogroup" aria-label="نوع التقرير" className="space-y-1">
              {TYPES.map((t) => {
                const on = type === t.value;
                return (
                  <button key={t.value} role="radio" aria-checked={on} onClick={() => setType(t.value)} className={cn('flex w-full items-start gap-3 rounded-xl p-3 text-start transition-colors', on ? 'bg-brand-soft' : 'hover:bg-surface-2')}>
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', on ? 'bg-brand text-brand-fg' : 'bg-surface-3 text-muted')}><t.icon className="size-5" /></span>
                    <span>
                      <span className={cn('block text-[15px] font-semibold', on ? 'text-brand' : 'text-ink')}>{REPORT_TYPE.labels[t.value]}</span>
                      <span className="block text-[13px] leading-5 text-muted">{t.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="text-[15px] font-semibold text-ink">معايير التقرير</h2>
            {(type === 'class-gradebook' || type === 'class-analysis') && (
              <>
                <Field label="الشعبة والمادة" required>
                  {(f) => (
                    <Select {...f} value={p.assignmentId} onChange={(e) => set('assignmentId', e.target.value)}>
                      <option value="">اختر…</option>
                      {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                    </Select>
                  )}
                </Field>
                <Field label="الفصل الدراسي" required>
                  {(f) => (
                    <Select {...f} value={p.termId} onChange={(e) => set('termId', e.target.value)}>
                      {year?.terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                  )}
                </Field>
              </>
            )}
            {type === 'student' && (
              <>
                <Field label="الشعبة">
                  {(f) => (
                    <Select {...f} value={p.sectionId} onChange={(e) => { set('sectionId', e.target.value); set('studentId', ''); }}>
                      <option value="">اختر الشعبة…</option>
                      {sectionOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </Select>
                  )}
                </Field>
                <Field label="الطالب" required>
                  {(f) => (
                    <Select {...f} value={p.studentId} onChange={(e) => set('studentId', e.target.value)} disabled={!p.sectionId && !p.studentId}>
                      <option value="">{p.sectionId ? 'اختر الطالب…' : 'اختر الشعبة أولًا'}</option>
                      {p.studentId && !roster.data?.some((r) => r.student.id === p.studentId) ? <option value={p.studentId}>الطالب المحدد</option> : null}
                      {(roster.data ?? []).map((r) => <option key={r.student.id} value={r.student.id}>{r.student.fullName}</option>)}
                    </Select>
                  )}
                </Field>
                <Field label="الفصل الدراسي">
                  {(f) => (
                    <Select {...f} value={p.termId} onChange={(e) => set('termId', e.target.value)}>
                      {year?.terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                  )}
                </Field>
                <div className="space-y-2.5 rounded-xl bg-surface-2 p-3">
                  <Checkbox label="تضمين ملاحظات المعلم" checked={p.includeNotes} onChange={(e) => set('includeNotes', e.target.checked)} />
                  <Checkbox label="تضمين بيانات ولي الأمر" checked={p.includeGuardian} onChange={(e) => set('includeGuardian', e.target.checked)} />
                  <p className="text-[12.5px] text-muted">بيانات الطلاب الشخصية لا تُطبع إلا إن اخترت ذلك.</p>
                </div>
              </>
            )}
            {type === 'support-plans' && (
              <>
                <Field label="الشعبة والمادة">
                  {(f) => (
                    <Select {...f} value={p.assignmentFilter} onChange={(e) => set('assignmentFilter', e.target.value)}>
                      <option value="">الكل</option>
                      {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                    </Select>
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="النوع">
                    {(f) => (
                      <Select {...f} value={p.supportKind} onChange={(e) => set('supportKind', e.target.value as '' | SupportKind)}>
                        <option value="">الكل</option>
                        {SUPPORT_KIND.items.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                      </Select>
                    )}
                  </Field>
                  <Field label="الحالة">
                    {(f) => (
                      <Select {...f} value={p.supportStatus} onChange={(e) => set('supportStatus', e.target.value as '' | SupportStatus)}>
                        <option value="">الكل</option>
                        {SUPPORT_STATUS.items.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </Select>
                    )}
                  </Field>
                </div>
              </>
            )}
            {type === 'lab-log' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="من" required>{(f) => <Input {...f} type="date" value={p.from} onChange={(e) => set('from', e.target.value)} />}</Field>
                  <Field label="إلى" required>{(f) => <Input {...f} type="date" value={p.to} onChange={(e) => set('to', e.target.value)} />}</Field>
                </div>
                <Field label="الشعبة والمادة">
                  {(f) => (
                    <Select {...f} value={p.assignmentFilter} onChange={(e) => set('assignmentFilter', e.target.value)}>
                      <option value="">الكل</option>
                      {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                    </Select>
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="النوع">
                    {(f) => (
                      <Select {...f} value={p.labKind} onChange={(e) => set('labKind', e.target.value as '' | LabKind)}>
                        <option value="">الكل</option>
                        {LAB_KIND.items.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                      </Select>
                    )}
                  </Field>
                  <Field label="الحالة">
                    {(f) => (
                      <Select {...f} value={p.labStatus} onChange={(e) => set('labStatus', e.target.value as '' | LabStatus)}>
                        <option value="">الكل</option>
                        {LAB_STATUS.items.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </Select>
                    )}
                  </Field>
                </div>
              </>
            )}
            {(type === 'lessons' || type === 'lesson-plan') && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="من" required>{(f) => <Input {...f} type="date" value={p.from} onChange={(e) => set('from', e.target.value)} />}</Field>
                  <Field label="إلى" required>{(f) => <Input {...f} type="date" value={p.to} onChange={(e) => set('to', e.target.value)} />}</Field>
                </div>
                <Field label="الشعبة والمادة">
                  {(f) => (
                    <Select {...f} value={p.assignmentFilter} onChange={(e) => set('assignmentFilter', e.target.value)}>
                      <option value="">الكل</option>
                      {(assignments.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.sectionLabel} — {a.subjectName}</option>)}
                    </Select>
                  )}
                </Field>
                {type === 'lesson-plan' ? <p className="text-[13px] text-muted">يُطبع كل درس في صفحة مستقلة (حتى 100 درس). لطباعة درس واحد افتحه من التحضير.</p> : null}
              </>
            )}
          </Card>

          <Card className="space-y-2.5 p-4">
            <Button variant="primary" className="w-full" icon={busy === 'pdf' ? <Loader2 className="size-4 animate-[spin_0.8s_linear_infinite]" /> : <Download className="size-4" />} disabled={!isReady || !!busy} onClick={() => (pdfAvailable ? void download('pdf') : print())}>
              {pdfAvailable ? 'تنزيل PDF' : 'طباعة / حفظ PDF'}
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" icon={busy === 'xlsx' ? <Loader2 className="size-4 animate-[spin_0.8s_linear_infinite]" /> : <FileSpreadsheet className="size-4" />} disabled={!isReady || !!busy} onClick={() => void download('xlsx')}>Excel</Button>
              <Button variant="secondary" icon={<Printer className="size-4" />} disabled={!isReady || !preview.data} onClick={print}>طباعة</Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full" icon={<ExternalLink className="size-4" />} disabled={!isReady} onClick={() => window.open(apiUrl(`/reports/${type}/html`, query as never), '_blank')}>فتح في تبويب جديد</Button>
            {!pdfAvailable ? <Alert tone="info" className="!py-2 text-[13px]">تصدير PDF المباشر غير مفعّل على هذا الخادم (يحتاج Chromium). استخدم «طباعة» ثم اختر «حفظ كـ PDF».</Alert> : null}
          </Card>
        </div>

        <div className="min-w-0">
          {!isReady ? (
            <EmptyState icon={<FileBarChart className="size-7" />} title={`حدّد معايير «${typeMeta.label}»`} description="تظهر المعاينة هنا فور اكتمال المعايير المطلوبة." className="min-h-[60vh]" />
          ) : preview.isPending ? (
            <div className="grid min-h-[60vh] place-items-center rounded-card border border-line bg-surface"><PageLoader label="جارٍ إعداد التقرير…" /></div>
          ) : preview.error ? (
            <Alert tone="bad" title="تعذّر إعداد التقرير">{errorMessage(preview.error)}</Alert>
          ) : (
            <PrintPreview html={preview.data} title={`معاينة ${typeMeta.label}`} frameRef={frame} />
          )}
        </div>
      </div>
    </>
  );
}

