import { Link } from 'react-router';
import { ClipboardList, GraduationCap, Plus, Users } from 'lucide-react';
import { useAcademic } from '@/context/academic';
import { useFmt } from '@/lib/hooks';
import { useSections } from '@/lib/queries';
import { Badge, ButtonLink, Card, EmptyState, PageHeader, PageLoader, QueryError, SubjectChip } from '@/components/ui';

/** اختيار المقرر (شعبة × مادة) لفتح دفتر درجاته */
export default function AssessmentsPage() {
  const fmt = useFmt();
  const { year, term } = useAcademic();
  const sections = useSections(year?.id);

  if (!year)
    return (
      <>
        <PageHeader title="التقويم المستمر" />
        <EmptyState icon={<GraduationCap className="size-7" />} title="أنشئ عامًا دراسيًا أولًا" description="يرتبط التقويم المستمر بشعب العام الدراسي وفصوله." action={<ButtonLink to="/classes" variant="primary">البدء من الشعب</ButtonLink>} />
      </>
    );
  if (sections.isPending) return <PageLoader />;
  if (sections.error) return <QueryError error={sections.error} onRetry={() => void sections.refetch()} />;
  const list = sections.data.filter((s) => s.assignments.length > 0);

  return (
    <>
      <PageHeader title="التقويم المستمر" description={<>اختر الشعبة والمادة لرصد الدرجات ومتابعة المهارات — {term?.name}</>} />
      {list.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-7" />} title="لا مقررات للتقويم بعد" description="أضف شعبة واختر المواد التي تدرّسها فيها، ثم أضف طلابها لتبدأ رصد الدرجات." action={<ButtonLink to="/classes" variant="primary" icon={<Plus className="size-4" />}>إضافة شعبة</ButtonLink>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <Link to={`/classes/${s.id}`} className="tnum text-[28px] font-bold leading-8 text-ink hover:text-brand">{s.label}</Link>
                <Badge tone={s.studentCount ? 'brand' : 'warn'}><Users className="size-3.5" /> {fmt.num(s.studentCount)}</Badge>
              </div>
              <ul className="space-y-2">
                {s.assignments.map((a) => (
                  <li key={a.id}>
                    <Link to={`/assessments/${a.id}${term ? `?term=${term.id}` : ''}`} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3 transition-colors hover:border-brand/50 hover:bg-brand-soft/40">
                      <SubjectChip name={a.subjectName} color={a.subjectColor} className="text-[15px]" />
                      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-brand"><ClipboardList className="size-4" /> دفتر الدرجات</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {s.studentCount === 0 ? <p className="mt-3 text-[13px] text-warn">لا طلاب في هذه الشعبة بعد.</p> : null}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
