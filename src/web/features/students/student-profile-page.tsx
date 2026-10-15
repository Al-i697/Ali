import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Download, FileText, Pencil, Phone, Plus, Printer, Trash2, UserRound } from 'lucide-react';
import { NOTE_CATEGORY, STUDENT_STATUS, GENDER, MASTERY_LEVELS, type NoteCategory } from '@shared/constants';
import { todayISO } from '@shared/dates';
import type { NoteDto, StudentProfileDto } from '@shared/dto';
import { createNoteSchema } from '@shared/schemas/students';
import { useAcademic } from '@/context/academic';
import { toast } from 'sonner';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { useFmt } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { cn } from '@/lib/cn';
import { Alert, Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, PageHeader, PageLoader, ProgressBar, QueryError, Select, SubjectChip, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, useConfirm, IconButton } from '@/components/ui';
import { MasteryBar, Ring } from '@/components/charts/charts';
import { useAuth } from '@/context/auth';
import { levelForPercent } from '@shared/gradebook';
import { StudentFormDialog } from './student-form';

const catTone: Record<NoteCategory, 'info' | 'warn' | 'good' | 'neutral' | 'bad'> = { academic: 'info', behavior: 'warn', positive: 'good', attendance: 'neutral', other: 'neutral' };

function ringTone(p: number | null, bands: { min: number; tone: string }[] | undefined): 'good' | 'info' | 'warn' | 'bad' | 'brand' {
  const t = levelForPercent(p, (bands ?? []) as never)?.tone;
  return t === 'good' || t === 'info' || t === 'warn' || t === 'bad' ? t : 'brand';
}

function NoteDialog({ open, onOpenChange, studentId, note, assignments }: { open: boolean; onOpenChange: (o: boolean) => void; studentId: string; note: NoteDto | null; assignments: { id: string; label: string }[] }) {
  const [category, setCategory] = useState<NoteCategory>(note?.category ?? 'academic');
  const [date, setDate] = useState(note?.date ?? todayISO());
  const [text, setText] = useState(note?.text ?? '');
  const [assignmentId, setAssignmentId] = useState(note?.assignmentId ?? '');
  const valid = createNoteSchema.safeParse({ category, date, text, assignmentId: assignmentId || null }).success;
  const save = useAppMutation(
    () => {
      const body = { category, date, text: text.trim(), assignmentId: assignmentId || null };
      return note ? api.patch(`/notes/${note.id}`, body) : api.post(`/students/${studentId}/notes`, body);
    },
    { invalidate: [qk.notes(studentId), ['profile']], success: note ? 'حُدّثت الملاحظة' : 'أُضيفت الملاحظة', onSuccess: () => onOpenChange(false) },
  );
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={note ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
      description="ملاحظاتك عن الطالب خاصة بك ولا تُطبع إلا إن اخترت تضمينها في التقرير."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="primary" disabled={!valid} loading={save.isPending} onClick={() => save.mutate()}>حفظ</Button></>}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="النوع">{(p) => <Select {...p} value={category} onChange={(e) => setCategory(e.target.value as NoteCategory)}>{NOTE_CATEGORY.items.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</Select>}</Field>
          <Field label="التاريخ">{(p) => <Input {...p} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        </div>
        {assignments.length ? (
          <Field label="المادة (اختياري)">{(p) => <Select {...p} value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}><option value="">عامة</option>{assignments.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</Select>}</Field>
        ) : null}
        <Field label="الملاحظة" required>{(p) => <Textarea {...p} rows={4} value={text} onChange={(e) => setText(e.target.value)} autoFocus maxLength={2000} />}</Field>
      </div>
    </Modal>
  );
}

export default function StudentProfilePage() {
  const { studentId = '' } = useParams();
  const fmt = useFmt();
  const confirm = useConfirm();
  const { year, term } = useAcademic();
  const { settings } = useAuth();
  const q = useQuery({
    queryKey: qk.profile(studentId, term?.id),
    queryFn: () => api.get<StudentProfileDto>(`/students/${studentId}/profile`, { yearId: year?.id, termId: term?.id }),
  });
  const [editing, setEditing] = useState(false);
  const [noteDlg, setNoteDlg] = useState<{ note: NoteDto | null } | null>(null);
  const removeNote = useAppMutation((id: string) => api.del(`/notes/${id}`), { invalidate: [['profile']], success: 'حُذفت الملاحظة' });

  if (q.isPending) return <PageLoader />;
  if (q.error || !q.data) return <QueryError error={q.error} onRetry={() => void q.refetch()} />;
  const p = q.data;
  const s = p.student;
  const bands = settings?.grading.bands;
  const reportParams = { studentId: s.id, termId: p.termId ?? undefined };
  const assignments = p.subjects.map((x) => ({ id: x.assignment.id, label: `${x.assignment.subjectName} — ${x.assignment.sectionLabel}` }));

  return (
    <>
      <PageHeader
        back={<Link to={s.enrollment ? `/classes/${s.enrollment.sectionId}` : '/classes'} className="mb-1 inline-flex items-center gap-1 text-[14px] text-muted hover:text-brand"><ArrowRight className="size-4" /> {s.enrollment ? `الشعبة ${s.enrollment.sectionLabel}` : 'الشعب والطلاب'}</Link>}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={s.fullName} size={56} tone={s.gender} />
            <span>
              <span className="block">{s.fullName}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-[14px] font-normal">
                {s.enrollment ? <Badge tone="brand" className="tnum">{s.enrollment.sectionLabel}</Badge> : <Badge tone="warn">بدون شعبة</Badge>}
                {s.studentNumber ? <span className="tnum text-muted" dir="ltr">{s.studentNumber}</span> : null}
                {s.gender ? <span className="text-muted">{GENDER.labels[s.gender]}</span> : null}
                {s.status !== 'active' ? <Badge tone="warn">{STUDENT_STATUS.labels[s.status]}</Badge> : null}
              </span>
            </span>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={<Pencil className="size-4" />} onClick={() => setEditing(true)}>تعديل</Button>
            <Button variant="secondary" icon={<Printer className="size-4" />} onClick={() => window.open(apiUrl('/reports/student/html', { ...reportParams, includeNotes: true }), '_blank')}>طباعة</Button>
            <Button variant="primary" icon={<Download className="size-4" />} onClick={() => { downloadFile('/reports/student/pdf', { ...reportParams, includeNotes: true }, 'student-report.pdf').catch((e) => toast.error(errorMessage(e))); }}>تقرير PDF</Button>
          </>
        }
      />

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="skills">المهارات {p.skills.length ? <Badge className="tnum">{fmt.num(p.skills.length)}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="notes">الملاحظات {p.notes.length ? <Badge className="tnum">{fmt.num(p.notes.length)}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="info">البيانات</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          {!s.enrollment ? (
            <Alert tone="warn" title="الطالب غير مسجّل في شعبة هذا العام">سجّله في شعبة من صفحة الشعبة (استيراد من عام سابق) أو انقله من قائمة الطلاب.</Alert>
          ) : p.subjects.length === 0 ? (
            <EmptyState icon={<FileText className="size-6" />} title="لا مواد في شعبة الطالب" description="أضف المواد إلى الشعبة ليظهر أداؤه هنا." />
          ) : (
            <div className="space-y-5">
              <Card className="flex flex-wrap items-center gap-6 p-5">
                <Ring value={p.overallPercent} size={104} thickness={11} tone={ringTone(p.overallPercent, bands)}>
                  <div><div className="tnum text-[24px] font-bold leading-7">{p.overallPercent === null ? '—' : fmt.num(p.overallPercent, 1)}</div><div className="text-[12px] text-muted">النسبة العامة</div></div>
                </Ring>
                <div>
                  <div className="text-[13px] text-muted">{term?.name}</div>
                  <div className="text-[22px] font-semibold text-ink">{levelForPercent(p.overallPercent, bands)?.label ?? 'لا درجات مرصودة بعد'}</div>
                  <div className="text-[14px] text-muted">متوسط أداء الطالب في {fmt.num(p.subjects.length)} مادة</div>
                </div>
              </Card>
              <div className="grid gap-4 lg:grid-cols-2">
                {p.subjects.map((sub) => (
                  <Card key={sub.assignment.id} className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <SubjectChip name={sub.assignment.subjectName} color={sub.assignment.subjectColor} className="text-[15px]" />
                      <Link to={`/assessments/${sub.assignment.id}`} className="text-[13px] text-brand hover:underline">دفتر الدرجات</Link>
                    </div>
                    <div className="flex items-center gap-5">
                      <Ring value={sub.percent} tone={ringTone(sub.percent, bands)}>
                        <span className="tnum text-[19px] font-bold">{sub.percent === null ? '—' : fmt.num(sub.percent, 1)}</span>
                      </Ring>
                      <div className="min-w-0 flex-1 space-y-2 text-[14px]">
                        <div className="flex justify-between"><span className="text-muted">المجموع</span><b className="tnum">{sub.percent === null ? '—' : `${fmt.num(sub.earned)} / ${fmt.num(sub.possible)}`}</b></div>
                        <div className="flex justify-between"><span className="text-muted">المستوى</span><b>{sub.level ?? '—'}</b></div>
                        <div>
                          <div className="mb-1 flex justify-between"><span className="text-muted">مقارنة بمتوسط الشعبة</span><span className="tnum text-ink-2">{sub.classAverage === null ? '—' : fmt.pct(sub.classAverage)}</span></div>
                          <ProgressBar value={sub.percent ?? 0} tone={sub.percent !== null && sub.classAverage !== null && sub.percent < sub.classAverage ? 'warn' : 'good'} label="مقارنة" />
                        </div>
                        {sub.pending ? <div className="text-[13px] text-warn">{fmt.num(sub.pending)} تقويم لم يُرصد</div> : null}
                      </div>
                    </div>
                    {sub.recent.length ? (
                      <ul className="mt-4 divide-y divide-line border-t border-line pt-1 text-[14px]">
                        {sub.recent.map((r) => (
                          <li key={r.assessmentId} className="flex items-center justify-between gap-3 py-2">
                            <span className="truncate text-ink-2">{r.title}</span>
                            <span className="shrink-0 tnum font-semibold">
                              {r.status === 'absent' ? <Badge tone="bad">غائب</Badge> : r.status === 'excused' ? <Badge>معذور</Badge> : r.mode === 'mastery' ? (r.level ? <Badge tone={MASTERY_LEVELS.find((m) => m.value === r.level)?.tone as never}>{MASTERY_LEVELS.find((m) => m.value === r.level)?.short}</Badge> : '—') : `${fmt.num(r.score)} / ${fmt.num(r.max)}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills">
          {p.skills.length === 0 ? (
            <EmptyState icon={<UserRound className="size-6" />} title="لا مهارات مقيّمة بعد" description="أنشئ تقويمًا بنمط «مستوى إتقان» واربطه بمهارات المادة، فتظهر مهارات الطالب هنا وتتجمّع لتحديد من يحتاج علاجًا أو إثراءً." />
          ) : (
            <Card className="divide-y divide-line">
              {p.skills.map((k) => (
                <div key={k.skillId} className="grid items-center gap-3 px-5 py-3.5 sm:grid-cols-[1fr_14rem_5rem]">
                  <div><div className="font-medium text-ink">{k.title}</div><div className="text-[13px] text-muted">{k.subjectName} · {fmt.num(k.count)} تقييم</div></div>
                  <MasteryBar value={k.average} />
                  <div className="tnum text-end text-[14px] font-semibold">{fmt.num(k.average, 1)} / 4</div>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <div className="mb-4 flex justify-end"><Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setNoteDlg({ note: null })}>إضافة ملاحظة</Button></div>
          {p.notes.length === 0 ? (
            <EmptyState icon={<FileText className="size-6" />} title="لا ملاحظات" description="دوّن ملاحظاتك الأكاديمية والسلوكية والإيجابية لتبقى مرجعًا في تقارير الطالب واجتماعات أولياء الأمور." />
          ) : (
            <ol className="relative space-y-4 border-s-2 border-line ps-6">
              {p.notes.map((n) => (
                <li key={n.id} className="relative">
                  <span className="absolute -start-[31px] top-4 size-3 rounded-full border-2 border-surface bg-brand" aria-hidden />
                  <Card className="p-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone={catTone[n.category]}>{NOTE_CATEGORY.labels[n.category]}</Badge>
                      <span className="text-[13px] text-muted">{fmt.date(n.date, 'long')}</span>
                      {n.assignmentLabel ? <span className="text-[13px] text-muted">· {n.assignmentLabel}</span> : null}
                      <span className="ms-auto flex">
                        <IconButton label="تعديل الملاحظة" size="iconSm" onClick={() => setNoteDlg({ note: n })}><Pencil className="size-4" /></IconButton>
                        <IconButton label="حذف الملاحظة" size="iconSm" className="hover:text-bad" onClick={async () => { if (await confirm({ title: 'حذف الملاحظة؟', confirmLabel: 'حذف', tone: 'danger' })) removeNote.mutate(n.id); }}><Trash2 className="size-4" /></IconButton>
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-ink">{n.text}</p>
                  </Card>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="info">
          <Card className="max-w-3xl">
            <CardHeader title="بيانات الطالب" />
            <dl className="grid gap-x-8 gap-y-4 px-5 pb-5 sm:grid-cols-2">
              {[
                ['الاسم', s.fullName],
                ['الرقم التعريفي', s.studentNumber],
                ['الجنس', s.gender ? GENDER.labels[s.gender] : null],
                ['تاريخ الميلاد', s.birthDate ? fmt.date(s.birthDate, 'long') : null],
                ['ولي الأمر', s.guardianName],
                ['هاتف ولي الأمر', s.guardianPhone],
              ].map(([k, v]) => (
                <div key={k as string}><dt className="text-[13px] text-muted">{k}</dt><dd className={cn('text-[15.5px]', !v && 'text-muted')} dir={k === 'هاتف ولي الأمر' || k === 'الرقم التعريفي' ? 'ltr' : undefined}>{k === 'هاتف ولي الأمر' && v ? <a href={`tel:${v}`} className="inline-flex items-center gap-1.5 text-brand"><Phone className="size-4" />{v}</a> : ((v as string) || '—')}</dd></div>
              ))}
              {s.notes ? <div className="sm:col-span-2"><dt className="text-[13px] text-muted">ملاحظات خاصة</dt><dd className="whitespace-pre-wrap text-[15px]">{s.notes}</dd></div> : null}
            </dl>
          </Card>
        </TabsContent>
      </Tabs>

      <StudentFormDialog open={editing} onOpenChange={setEditing} student={s} />
      <NoteDialog key={noteDlg?.note?.id ?? 'new'} open={!!noteDlg} onOpenChange={(o) => !o && setNoteDlg(null)} studentId={s.id} note={noteDlg?.note ?? null} assignments={assignments} />
    </>
  );
}
