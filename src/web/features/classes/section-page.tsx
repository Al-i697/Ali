import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDownAZ, ArrowRight, BookOpenCheck, ClipboardList, FileBarChart, FileUp, History, MoveRight, Pencil, Plus, Trash2, UserMinus, UserRound, Users, UserPlus } from 'lucide-react';
import { STUDENT_STATUS, gradeLabel } from '@shared/constants';
import type { RosterEntryDto, SectionDto, SubjectDto, YearDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { api } from '@/lib/api';
import { deleteWithForce } from '@/lib/destructive';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk, useSections, useSubjects, useYears } from '@/lib/queries';
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState, IconButton, Input, Menu, MenuItem, MenuSeparator, Modal, PageHeader, PageLoader, QueryError, Select, SubjectChip, Tabs, TabsContent, TabsList, TabsTrigger, useConfirm, Checkbox, Alert } from '@/components/ui';
import { StudentFormDialog } from '@/features/students/student-form';
import { SectionDialog } from './section-dialog';
import { ImportDialog } from './import-dialog';

// ───────────── نقل طالب إلى شعبة أخرى ─────────────
function MoveDialog({ student, section, onClose }: { student: RosterEntryDto['student'] | null; section: SectionDto; onClose: () => void }) {
  const sections = useSections(section.yearId);
  const [target, setTarget] = useState('');
  const others = (sections.data ?? []).filter((s) => s.id !== section.id);
  const move = useAppMutation(() => api.post(`/students/${student!.id}/move`, { sectionId: target }), {
    invalidate: ['academic'],
    success: 'نُقل الطالب إلى الشعبة الجديدة',
    onSuccess: onClose,
  });
  return (
    <Modal
      open={!!student}
      onOpenChange={(o) => !o && onClose()}
      size="sm"
      title="نقل إلى شعبة أخرى"
      description={student ? `نقل ${student.fullName} من ${section.label}` : undefined}
      footer={<><Button variant="ghost" onClick={onClose}>إلغاء</Button><Button variant="primary" disabled={!target} loading={move.isPending} onClick={() => move.mutate()}>نقل</Button></>}
    >
      <Select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="الشعبة المستهدفة">
        <option value="">اختر الشعبة…</option>
        {others.map((s) => <option key={s.id} value={s.id}>{s.label} — {gradeLabel(s.gradeLevel)}</option>)}
      </Select>
      <Alert tone="info" className="mt-4">درجات الطالب السابقة تبقى مرتبطة بمواد شعبته القديمة وتظهر في ملفه. التقويمات الجديدة تُرصد له في شعبته الجديدة.</Alert>
    </Modal>
  );
}

// ───────────── ترفيع/استيراد طلاب من عام سابق ─────────────
function PromoteDialog({ open, onOpenChange, section }: { open: boolean; onOpenChange: (o: boolean) => void; section: SectionDto }) {
  const fmt = useFmt();
  const years = useYears();
  const [yearId, setYearId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const otherYears = (years.data ?? []).filter((y) => y.id !== section.yearId);
  const sources = useSections(yearId || undefined);
  const roster = useQuery({ queryKey: qk.roster(sourceId), queryFn: () => api.get<RosterEntryDto[]>(`/sections/${sourceId}/students`), enabled: !!sourceId });
  const students = roster.data ?? [];
  const chosen = picked ?? new Set(students.map((r) => r.student.id));

  const enroll = useAppMutation(() => api.post<{ enrolled: number; skipped: { fullName: string; reason: string }[] }>(`/sections/${section.id}/students/enroll`, { studentIds: [...chosen] }), {
    invalidate: ['academic'],
    onSuccess: (r) => {
      toast.success(`سُجّل ${fmt.num(r.enrolled)} طالبًا${r.skipped.length ? ` — تُخطّي ${fmt.num(r.skipped.length)} (مسجّلون مسبقًا)` : ''}`);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { onOpenChange(o); if (!o) { setYearId(''); setSourceId(''); setPicked(null); } }}
      size="md"
      title={`استيراد طلاب من عام سابق إلى ${section.label}`}
      description="يُسجَّل الطلاب بسجلاتهم القديمة نفسها، فيحتفظ كل طالب بتاريخه الأكاديمي عبر السنوات."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="primary" disabled={chosen.size === 0} loading={enroll.isPending} onClick={() => enroll.mutate()}>تسجيل {fmt.num(chosen.size)} طالبًا</Button></>}
    >
      {otherYears.length === 0 ? (
        <Alert tone="info">لا توجد أعوام دراسية سابقة. أنشئ عامًا سابقًا من الإعدادات أو أضف الطلاب مباشرة.</Alert>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={yearId} onChange={(e) => { setYearId(e.target.value); setSourceId(''); setPicked(null); }} aria-label="العام السابق">
              <option value="">اختر العام…</option>
              {otherYears.map((y: YearDto) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </Select>
            <Select value={sourceId} onChange={(e) => { setSourceId(e.target.value); setPicked(null); }} disabled={!yearId} aria-label="الشعبة السابقة">
              <option value="">اختر الشعبة…</option>
              {(sources.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.label} ({fmt.num(s.studentCount)})</option>)}
            </Select>
          </div>
          {sourceId ? (
            roster.isPending ? <PageLoader /> : (
              <div>
                <div className="mb-2 flex items-center justify-between text-[14px]">
                  <Checkbox label="تحديد الكل" checked={chosen.size === students.length} onChange={(e) => setPicked(e.target.checked ? new Set(students.map((r) => r.student.id)) : new Set())} />
                  <span className="text-muted">{fmt.num(chosen.size)} من {fmt.num(students.length)}</span>
                </div>
                <ul className="max-h-64 divide-y divide-line overflow-auto rounded-xl border border-line">
                  {students.map((r) => (
                    <li key={r.student.id} className="px-3 py-2">
                      <Checkbox label={r.student.fullName} checked={chosen.has(r.student.id)} onChange={(e) => { const n = new Set(chosen); if (e.target.checked) n.add(r.student.id); else n.delete(r.student.id); setPicked(n); }} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : null}
        </div>
      )}
    </Modal>
  );
}

// ───────────── تبويب المواد ─────────────
function SubjectsTab({ section }: { section: SectionDto }) {
  const confirm = useConfirm();
  const subjects = useSubjects();
  const [subjectId, setSubjectId] = useState('');
  const available = (subjects.data ?? []).filter((s: SubjectDto) => !s.isArchived && !section.assignments.some((a) => a.subjectId === s.id));

  const add = useAppMutation(() => api.post(`/sections/${section.id}/assignments`, { subjectId }), { invalidate: ['academic'], success: 'أُضيفت المادة للشعبة', onSuccess: () => setSubjectId('') });
  const periods = useAppMutation((v: { id: string; weeklyPeriods: number | null }) => api.patch(`/assignments/${v.id}`, { weeklyPeriods: v.weeklyPeriods }), { invalidate: ['academic'] });

  return (
    <div className="max-w-3xl space-y-4">
      <Card className="divide-y divide-line">
        {section.assignments.length === 0 ? (
          <div className="p-6"><EmptyState icon={<BookOpenCheck className="size-6" />} title="لا مواد في هذه الشعبة" description="أضف المادة التي تدرّسها لتتمكن من التحضير ورصد الدرجات." className="border-0 bg-transparent py-6" /></div>
        ) : (
          section.assignments.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <SubjectChip name={a.subjectName} color={a.subjectColor} className="text-[15px]" />
              <div className="flex items-center gap-2 text-[14px] text-muted">
                <label htmlFor={`wp-${a.id}`}>الحصص أسبوعيًا</label>
                <Input
                  id={`wp-${a.id}`}
                  type="number"
                  min={0}
                  max={40}
                  defaultValue={a.weeklyPeriods ?? ''}
                  className="h-8 w-16 text-center tnum"
                  onBlur={(e) => {
                    const v = e.target.value === '' ? null : Number(e.target.value);
                    if (v !== a.weeklyPeriods) periods.mutate({ id: a.id, weeklyPeriods: v });
                  }}
                />
              </div>
              <div className="ms-auto flex flex-wrap items-center gap-1.5">
                <ButtonLink to={`/lessons/new?assignment=${a.id}`} variant="ghost" size="sm" icon={<BookOpenCheck className="size-4" />}>تحضير</ButtonLink>
                <ButtonLink to={`/assessments/${a.id}`} variant="soft" size="sm" icon={<ClipboardList className="size-4" />}>الدرجات</ButtonLink>
                <IconButton
                  label="إزالة المادة من الشعبة"
                  size="iconSm"
                  className="hover:text-bad"
                  onClick={() =>
                    void deleteWithForce(confirm, (force) => api.del(`/assignments/${a.id}`, { force }), {
                      title: `إزالة «${a.subjectName}» من ${section.label}؟`,
                      description: 'ستُحذف تقويماتها ودرجاتها وتحضيراتها وحصصها في الجدول إن وُجدت. أما أنشطة المختبر والخطط العلاجية المرتبطة بها فتبقى في سجلاتك بلا شعبة.',
                    }).then((ok) => ok && toast.success('أُزيلت المادة') && void 0)
                  }
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </Card>
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-56 flex-1">
          <label htmlFor="add-subject" className="mb-1.5 block text-sm font-medium text-ink-2">إضافة مادة إلى الشعبة</label>
          <Select id="add-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">{available.length ? 'اختر المادة…' : 'لا مواد متاحة — أضف من «المواد» في صفحة الشعب'}</option>
            {available.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <Button variant="primary" icon={<Plus className="size-4" />} disabled={!subjectId} loading={add.isPending} onClick={() => add.mutate()}>إضافة</Button>
      </Card>
    </div>
  );
}

// ───────────── الصفحة ─────────────
export default function SectionPage() {
  const { sectionId = '' } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const fmt = useFmt();
  const { year } = useAcademic();
  const section = useQuery({ queryKey: qk.section(sectionId), queryFn: () => api.get<SectionDto>(`/sections/${sectionId}`) });
  const roster = useQuery({ queryKey: qk.roster(sectionId), queryFn: () => api.get<RosterEntryDto[]>(`/sections/${sectionId}/students`) });

  const [name, setName] = useState('');
  const [editSection, setEditSection] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [studentForm, setStudentForm] = useState<{ student: RosterEntryDto['student'] | null } | null>(null);
  const [moving, setMoving] = useState<RosterEntryDto['student'] | null>(null);

  const quickAdd = useAppMutation((fullName: string) => api.post(`/sections/${sectionId}/students`, { students: [{ fullName }] }), {
    invalidate: ['academic'],
    onSuccess: () => setName(''),
  });
  const sort = useAppMutation(() => api.post(`/sections/${sectionId}/students/reorder`, { sort: 'name' }), { invalidate: ['academic'], success: 'رُتّب الطلاب أبجديًا' });
  const unenroll = useAppMutation((studentId: string) => api.del(`/sections/${sectionId}/students/${studentId}`), { invalidate: ['academic'], success: 'أُزيل الطالب من الشعبة (سجله محفوظ)' });

  const list = useMemo(() => roster.data ?? [], [roster.data]);

  if (section.isPending) return <PageLoader />;
  if (section.error || !section.data) return <QueryError error={section.error} onRetry={() => void section.refetch()} />;
  const s = section.data;

  return (
    <>
      <PageHeader
        back={<Link to="/classes" className="mb-1 inline-flex items-center gap-1 text-[14px] text-muted hover:text-brand"><ArrowRight className="size-4 rtl:rotate-0 ltr:rotate-180" /> الشعب والطلاب</Link>}
        title={<span className="flex flex-wrap items-center gap-3"><span className="tnum">{s.label}</span><span className="text-[18px] font-medium text-muted">{gradeLabel(s.gradeLevel)}</span></span>}
        description={<span className="flex flex-wrap items-center gap-2 pt-1">{s.assignments.map((a) => <SubjectChip key={a.id} name={a.subjectName} color={a.subjectColor} />)}<span className="text-muted">· {fmt.num(s.studentCount)} طالبًا</span></span>}
        actions={
          <>
            {s.assignments[0] ? <ButtonLink to={`/reports?type=class-gradebook&assignment=${s.assignments[0].id}`} variant="secondary" icon={<FileBarChart className="size-4" />}>كشف الدرجات</ButtonLink> : null}
            <Button variant="secondary" icon={<Pencil className="size-4" />} onClick={() => setEditSection(true)}>تعديل</Button>
            <Button
              variant="dangerSoft"
              icon={<Trash2 className="size-4" />}
              onClick={async () => {
                const ok = await deleteWithForce(confirm, (force) => api.del(`/sections/${s.id}`, { force }), { title: `حذف الشعبة ${s.label}؟`, description: 'تُحذف الشعبة ومقرراتها. سجلات الطلاب أنفسهم تبقى في النظام، وكذلك أنشطة المختبر والخطط العلاجية المرتبطة بها (تصير بلا شعبة).' });
                if (ok) {
                  toast.success('حُذفت الشعبة');
                  void navigate('/classes');
                }
              }}
            >
              حذف
            </Button>
          </>
        }
      />

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students"><Users className="size-4" /> الطلاب <Badge className="tnum">{fmt.num(list.length)}</Badge></TabsTrigger>
          <TabsTrigger value="subjects"><BookOpenCheck className="size-4" /> المواد <Badge className="tnum">{fmt.num(s.assignments.length)}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <form
              className="flex min-w-72 flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim().length >= 2) quickAdd.mutate(name.trim());
              }}
            >
              <div className="relative flex-1">
                <UserPlus className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتب اسم طالب واضغط Enter لإضافته فورًا…" className="ps-10" aria-label="إضافة طالب سريعة" disabled={quickAdd.isPending} />
              </div>
              <Button type="submit" variant="primary" disabled={name.trim().length < 2} loading={quickAdd.isPending}>إضافة</Button>
            </form>
            <Button variant="secondary" icon={<FileUp className="size-4" />} onClick={() => setImportOpen(true)}>استيراد / لصق أسماء</Button>
            <Menu
              align="end"
              trigger={<Button variant="secondary">المزيد</Button>}
            >
              <MenuItem icon={<UserPlus className="size-4" />} onSelect={() => setStudentForm({ student: null })}>إضافة طالب بتفاصيله</MenuItem>
              <MenuItem icon={<History className="size-4" />} onSelect={() => setPromoteOpen(true)}>استيراد من عام سابق</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<ArrowDownAZ className="size-4" />} onSelect={() => sort.mutate()} disabled={list.length < 2}>ترتيب أبجدي</MenuItem>
            </Menu>
          </div>

          {roster.error ? <QueryError error={roster.error} onRetry={() => void roster.refetch()} /> : roster.isPending ? <PageLoader /> : list.length === 0 ? (
            <EmptyState
              icon={<Users className="size-7" />}
              title="لا طلاب في هذه الشعبة بعد"
              description="الصق قائمة الأسماء دفعة واحدة، أو ارفع ملف Excel من نظام المدرسة، أو أضف الطلاب واحدًا واحدًا من الحقل أعلاه."
              action={<Button variant="primary" size="lg" icon={<FileUp className="size-5" />} onClick={() => setImportOpen(true)}>لصق أسماء أو رفع ملف</Button>}
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="scroll-x">
                <table className="w-full min-w-[560px] text-[15px]">
                  <thead className="bg-surface-3 text-[13px] text-muted">
                    <tr>
                      <th className="w-14 px-4 py-2.5 text-start font-medium">م</th>
                      <th className="px-4 py-2.5 text-start font-medium">الطالب</th>
                      <th className="px-4 py-2.5 text-start font-medium">الرقم التعريفي</th>
                      <th className="px-4 py-2.5 text-start font-medium">الحالة</th>
                      <th className="w-14 px-2 py-2.5"><span className="sr-only">إجراءات</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {list.map((r, i) => (
                      <tr key={r.student.id} className="transition-colors hover:bg-surface-2">
                        <td className="px-4 py-2 text-muted tnum">{fmt.num(i + 1)}</td>
                        <td className="px-4 py-2">
                          <Link to={`/students/${r.student.id}`} className="flex items-center gap-3 font-medium text-ink hover:text-brand">
                            <Avatar name={r.student.fullName} size={34} tone={r.student.gender} />
                            {r.student.fullName}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-muted tnum" dir="ltr"><span className="block text-start">{r.student.studentNumber ?? '—'}</span></td>
                        <td className="px-4 py-2">{r.student.status === 'active' ? <span className="text-muted">—</span> : <Badge tone="warn">{STUDENT_STATUS.labels[r.student.status]}</Badge>}</td>
                        <td className="px-2 py-2">
                          <Menu align="end" trigger={<IconButton label={`إجراءات ${r.student.fullName}`} size="iconSm"><span className="text-xl leading-none">⋯</span></IconButton>}>
                            <MenuItem icon={<UserRound className="size-4" />} onSelect={() => navigate(`/students/${r.student.id}`)}>ملف الطالب</MenuItem>
                            <MenuItem icon={<Pencil className="size-4" />} onSelect={() => setStudentForm({ student: r.student })}>تعديل البيانات</MenuItem>
                            <MenuItem icon={<MoveRight className="size-4" />} onSelect={() => setMoving(r.student)}>نقل إلى شعبة أخرى</MenuItem>
                            <MenuSeparator />
                            <MenuItem
                              icon={<UserMinus className="size-4" />}
                              onSelect={async () => {
                                if (await confirm({ title: `إزالة ${r.student.fullName} من الشعبة؟`, description: 'يبقى سجل الطالب ودرجاته محفوظين، ويمكنك تسجيله في شعبة أخرى لاحقًا.', confirmLabel: 'إزالة', tone: 'danger' })) unenroll.mutate(r.student.id);
                              }}
                            >
                              إزالة من الشعبة
                            </MenuItem>
                            <MenuItem
                              icon={<Trash2 className="size-4" />}
                              danger
                              onSelect={() =>
                                void deleteWithForce(confirm, (force) => api.del(`/students/${r.student.id}`, { force }), { title: `حذف ${r.student.fullName} نهائيًا؟`, description: 'يُحذف الطالب من النظام كله.' }).then((ok) => {
                                  if (ok) {
                                    toast.success('حُذف الطالب');
                                    void roster.refetch();
                                    void section.refetch();
                                  }
                                })
                              }
                            >
                              حذف نهائيًا
                            </MenuItem>
                          </Menu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects"><SubjectsTab section={s} /></TabsContent>
      </Tabs>

      <SectionDialog open={editSection} onOpenChange={setEditSection} yearId={s.yearId} section={s} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} sectionId={s.id} sectionLabel={s.label} />
      <PromoteDialog open={promoteOpen} onOpenChange={setPromoteOpen} section={s} />
      <StudentFormDialog open={!!studentForm} onOpenChange={(o) => !o && setStudentForm(null)} sectionId={s.id} student={studentForm?.student ?? null} />
      <MoveDialog student={moving} section={s} onClose={() => setMoving(null)} />
      {year && year.id !== s.yearId ? <p className="mt-6 text-center text-[13px] text-muted">تعرض هذه الشعبة عامًا دراسيًا غير المختار حاليًا.</p> : null}
    </>
  );
}
