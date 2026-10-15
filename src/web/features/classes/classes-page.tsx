import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarPlus, GraduationCap, Plus, Search, Users } from 'lucide-react';
import { STUDENT_STATUS, gradeLabel } from '@shared/constants';
import type { SectionDto, StudentsPage } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { api, withQuery } from '@/lib/api';
import { useDebounced, useFmt } from '@/lib/hooks';
import { qk, useSections } from '@/lib/queries';
import { cn } from '@/lib/cn';
import { Avatar, Badge, Button, Card, EmptyState, Input, PageHeader, PageLoader, QueryError, Select, Skeleton, SubjectChip, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { CreateYearDialog } from '@/components/common/year-dialog';
import { SubjectManager } from '@/components/common/subject-manager';
import { SectionDialog } from './section-dialog';

function SectionCard({ s }: { s: SectionDto }) {
  const fmt = useFmt();
  const accent = s.assignments[0]?.subjectColor ?? 'teal';
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-pop">
      <div className={cn(`subj-${accent} h-1.5 bg-[var(--c)]`)} aria-hidden />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Link to={`/classes/${s.id}`} className="tnum text-[32px] font-bold leading-9 tracking-tight text-ink after:absolute after:inset-0 after:content-['']">{s.label}</Link>
            <div className="mt-0.5 text-[14px] text-muted">{gradeLabel(s.gradeLevel)}</div>
          </div>
          <Badge tone={s.studentCount ? 'brand' : 'warn'}>
            <Users className="size-3.5" /> {fmt.num(s.studentCount)} طالبًا
          </Badge>
        </div>
        <div className="flex min-h-7 flex-wrap gap-1.5">
          {s.assignments.length ? s.assignments.map((a) => <SubjectChip key={a.id} name={a.subjectName} color={a.subjectColor} />) : <span className="text-[13px] text-muted">لا مواد بعد</span>}
        </div>
        {s.notes ? <p className="mt-3 line-clamp-2 text-[13.5px] text-muted">{s.notes}</p> : null}
      </div>
    </Card>
  );
}

function AllStudents({ sections, yearId }: { sections: SectionDto[]; yearId: string }) {
  const navigate = useNavigate();
  const fmt = useFmt();
  const [q, setQ] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(100);
  const dq = useDebounced(q, 250);
  const params = { q: dq || undefined, yearId, limit, status: status || undefined, ...(sectionId === 'none' ? { unassigned: true } : sectionId ? { sectionId } : {}) };
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: qk.students(params),
    queryFn: () => api.get<StudentsPage>(withQuery('/students', params)),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الرقم…" className="ps-10" aria-label="بحث عن طالب" />
        </div>
        <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="w-44" aria-label="الشعبة">
          <option value="">كل الشعب</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          <option value="none">بدون شعبة</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40" aria-label="الحالة">
          <option value="">كل الحالات</option>
          {STUDENT_STATUS.items.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </div>

      {error ? <QueryError error={error} onRetry={() => void refetch()} /> : isPending ? <PageLoader /> : !data || data.items.length === 0 ? (
        <EmptyState icon={<Users className="size-6" />} title={q || sectionId || status ? 'لا نتائج مطابقة' : 'لا طلاب بعد'} description={q || sectionId || status ? 'جرّب تغيير البحث أو التصفية.' : 'افتح إحدى الشعب وأضف الطلاب بالإدخال المباشر أو الاستيراد من ملف.'} />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="scroll-x">
              <table className="w-full min-w-[620px] text-[15px]">
                <thead className="bg-surface-3 text-[13px] text-muted">
                  <tr>
                    <th className="w-14 px-4 py-2.5 text-start font-medium">#</th>
                    <th className="px-4 py-2.5 text-start font-medium">الطالب</th>
                    <th className="px-4 py-2.5 text-start font-medium">الرقم التعريفي</th>
                    <th className="px-4 py-2.5 text-start font-medium">الشعبة</th>
                    <th className="px-4 py-2.5 text-start font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((s, i) => (
                    <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)} className="cursor-pointer transition-colors hover:bg-surface-2">
                      <td className="px-4 py-2.5 text-muted tnum">{fmt.num(i + 1)}</td>
                      <td className="px-4 py-2.5">
                        <Link to={`/students/${s.id}`} className="flex items-center gap-3 font-medium text-ink hover:text-brand" onClick={(e) => e.stopPropagation()}>
                          <Avatar name={s.fullName} size={34} tone={s.gender} />
                          {s.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted tnum" dir="ltr"><span className="block text-start">{s.studentNumber ?? '—'}</span></td>
                      <td className="px-4 py-2.5">{s.enrollment ? <Badge tone="brand" className="tnum">{s.enrollment.sectionLabel}</Badge> : <span className="text-muted">—</span>}</td>
                      <td className="px-4 py-2.5">{s.status === 'active' ? <span className="text-muted">{STUDENT_STATUS.labels[s.status]}</span> : <Badge tone="warn">{STUDENT_STATUS.labels[s.status]}</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="mt-3 flex items-center justify-between text-[14px] text-muted">
            <span>عرض {fmt.num(data.items.length)} من {fmt.num(data.total)}</span>
            {data.items.length < data.total ? <Button variant="secondary" size="sm" loading={isFetching} onClick={() => setLimit(limit + 100)}>عرض المزيد</Button> : null}
          </div>
        </>
      )}
    </div>
  );
}

export default function ClassesPage() {
  const { year, isLoading: yearsLoading } = useAcademic();
  const sections = useSections(year?.id);
  const [creating, setCreating] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const navigate = useNavigate();
  const list = useMemo(() => sections.data ?? [], [sections.data]);

  if (yearsLoading) return <PageLoader />;
  if (!year)
    return (
      <>
        <PageHeader title="الشعب والطلاب" description="ابدأ بإنشاء العام الدراسي، ثم أضف شعبك وطلابك." />
        <EmptyState icon={<CalendarPlus className="size-7" />} title="أنشئ العام الدراسي أولًا" description="يرتبط كل شيء — الشعب والتحضير والدرجات — بعام دراسي وفصلين. ننشئها لك بنقرة ويمكنك تعديل التواريخ لاحقًا." action={<Button variant="primary" size="lg" icon={<Plus className="size-5" />} onClick={() => setYearOpen(true)}>إنشاء عام دراسي</Button>} />
        <CreateYearDialog open={yearOpen} onOpenChange={setYearOpen} />
      </>
    );

  return (
    <>
      <PageHeader
        title="الشعب والطلاب"
        description={<>العام الدراسي <b className="tnum text-ink-2">{year.name}</b></>}
        actions={
          <>
            <Button variant="secondary" icon={<BookOpen className="size-4" />} onClick={() => setSubjectsOpen(true)}>المواد</Button>
            <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>إضافة شعبة</Button>
          </>
        }
      />
      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections"><GraduationCap className="size-4" /> الشعب</TabsTrigger>
          <TabsTrigger value="students"><Users className="size-4" /> كل الطلاب</TabsTrigger>
        </TabsList>
        <TabsContent value="sections">
          {sections.error ? <QueryError error={sections.error} onRetry={() => void sections.refetch()} /> : sections.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
          ) : list.length === 0 ? (
            <EmptyState icon={<GraduationCap className="size-7" />} title="لا شعب في هذا العام" description="أضف شعبة (مثل 10/3) واختر المواد التي تدرّسها فيها. ثم أضف طلابها بلصق الأسماء أو برفع ملف Excel." action={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>إضافة أول شعبة</Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((s) => <SectionCard key={s.id} s={s} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="students"><AllStudents sections={list} yearId={year.id} /></TabsContent>
      </Tabs>

      <SectionDialog open={creating} onOpenChange={setCreating} yearId={year.id} onSaved={(s) => navigate(`/classes/${s.id}`)} />
      <SubjectManager open={subjectsOpen} onOpenChange={setSubjectsOpen} />
    </>
  );
}

