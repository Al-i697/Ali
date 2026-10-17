import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, Hand, History, MessagesSquare, Pencil, Play, Printer, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { CLASS_RECORD_KIND, weekdayName } from '@shared/constants';
import { todayISO, weekdayOf } from '@shared/dates';
import type { ClassRecordDto, ClassSessionGroupDto, ClassStudentReportDto } from '@shared/dto';
import { useAcademic } from '@/context/academic';
import { useAuth } from '@/context/auth';
import { api, apiUrl, downloadFile, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useFmt, useLocalState } from '@/lib/hooks';
import { useAppMutation } from '@/lib/mutation';
import { qk } from '@/lib/queries';
import { Badge, Button, ButtonLink, Card, CardHeader, EmptyState, IconButton, Menu, MenuItem, PageLoader, QueryError, Segmented, Select, Stat, SubjectChip, useConfirm } from '@/components/ui';
import { RecordDialog, type RecordTarget } from './record-dialog';
import { ParticipationBadge, RateMeter, recordIcon, recordText, recordTone, sessionHref } from './shared';

type Scope = 'term' | 'year' | 'all';
type KindFilter = 'all' | 'participation' | 'positive' | 'negative' | 'note';

const matches = (g: ClassSessionGroupDto, f: KindFilter): boolean => {
  if (f === 'all') return true;
  if (f === 'participation') return g.participation !== null;
  return g.records.some((r) => r.kind === f);
};

function ReasonChips({ reasons }: { reasons: ClassStudentReportDto['reasons'] }) {
  const fmt = useFmt();
  const group = (kind: 'negative' | 'positive' | 'note', title: string, tone: string) => {
    const items = reasons.filter((r) => r.kind === kind);
    if (items.length === 0) return null;
    return (
      <div>
        <h3 className="mb-1.5 text-[13.5px] font-medium text-muted">{title}</h3>
        <ul className="flex flex-wrap gap-1.5">
          {items.map((r) => (
            <li key={r.reason} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13.5px]', tone)}>
              {r.reason}
              <b className="tnum rounded-full bg-black/10 px-1.5 text-[12px] dark:bg-white/10">×{fmt.num(r.count, 0)}</b>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div className="space-y-3">
      {group('negative', 'أسباب السلوك غير الحسن', 'border-bad/30 bg-bad-soft text-bad')}
      {group('positive', 'السلوك الإيجابي', 'border-info/30 bg-info-soft text-info')}
      {group('note', 'الملاحظات', 'border-line-strong bg-surface-3 text-ink-2')}
    </div>
  );
}

/** تبويب «الصف» في ملف الطالب: كل ما سُجّل عليه في الحصص — مشاركته وسلوكه وملاحظاته — بأعدادها وخطها الزمني */
export function StudentClassTab({ studentId }: { studentId: string }) {
  const fmt = useFmt();
  const confirm = useConfirm();
  const { year, term } = useAcademic();
  const { system } = useAuth();
  const [scope, setScope] = useLocalState<Scope>('sijilli-class-scope', 'term');
  const [assignmentId, setAssignmentId] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [limit, setLimit] = useState(100);
  const [dialog, setDialog] = useState<RecordTarget | null>(null);
  const pdf = system?.capabilities.pdf ?? false;

  const range = useMemo(() => {
    if (scope === 'term' && term) return { from: term.startDate, to: term.endDate };
    if ((scope === 'term' || scope === 'year') && year) return { from: year.startDate, to: year.endDate };
    return {};
  }, [scope, term, year]);
  const params = { assignmentId: assignmentId || undefined, ...range, limit };
  const query = useQuery({
    queryKey: qk.classStudent(studentId, params),
    queryFn: () => api.get<ClassStudentReportDto>(`/class/students/${studentId}`, params),
    placeholderData: (p) => p,
  });
  const data = query.data;
  const reportQuery = { studentId, assignmentId: assignmentId || undefined, ...range, classAll: scope === 'all' ? true : undefined, includeNotes: true };

  const remove = useAppMutation((id: string) => api.del(`/class/records/${id}`), { invalidate: [['class'], qk.dashboard], success: 'حُذف التسجيل' });
  const askRemove = async (r: ClassRecordDto) => {
    const ok = await confirm({ title: 'حذف هذا التسجيل؟', description: `«${recordText(r)}» — لا يمكن التراجع عن الحذف.`, confirmLabel: 'حذف', tone: 'danger' });
    if (ok) remove.mutate(r.id);
  };

  const groups = useMemo(() => (data?.sessions ?? []).filter((g) => matches(g, kind)), [data, kind]);
  if (query.error) return <QueryError error={query.error} onRetry={() => void query.refetch()} />;
  if (!data) return <PageLoader />;
  const c = data.counts;
  const empty = data.totalSessions === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented<Scope>
          value={scope}
          onChange={(v) => { setScope(v); setLimit(100); }}
          label="نطاق الفترة"
          options={[{ value: 'term', label: term ? 'الفصل' : 'العام' }, ...(term ? [{ value: 'year' as const, label: 'العام' }] : []), { value: 'all', label: 'الكل' }]}
        />
        {data.assignments.length > 1 || assignmentId ? (
          <div className="min-w-48">
            <Select value={assignmentId} onChange={(e) => { setAssignmentId(e.target.value); setLimit(100); }} aria-label="تصفية بالمادة">
              <option value="">كل المواد</option>
              {data.assignments.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </div>
        ) : null}
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <Menu align="end" trigger={<Button variant="secondary" icon={<FileText className="size-4" />}>تقرير المشاركة والسلوك</Button>}>
            {pdf ? <MenuItem icon={<Download className="size-4" />} onSelect={() => { downloadFile('/reports/class-student/pdf', reportQuery, 'class-student.pdf').catch((e) => toast.error(errorMessage(e))); }}>تنزيل PDF</MenuItem> : null}
            <MenuItem icon={<FileSpreadsheet className="size-4" />} onSelect={() => { downloadFile('/reports/class-student/xlsx', reportQuery, 'class-student.xlsx').catch((e) => toast.error(errorMessage(e))); }}>تنزيل Excel</MenuItem>
            <MenuItem icon={<Printer className="size-4" />} onSelect={() => window.open(apiUrl('/reports/class-student/html', reportQuery), '_blank')}>طباعة</MenuItem>
          </Menu>
        </div>
      </div>

      {empty ? (
        <EmptyState
          icon={<MessagesSquare className="size-7" />}
          title="لا تسجيلات لهذا الطالب في هذه الفترة"
          description="سجّل مشاركته وسلوكه أثناء الحصص من «إدارة الصف»، وسيتجمّع هنا كل ما فعله في تقرير كامل."
          action={<ButtonLink to="/class" variant="primary" icon={<Play className="size-4" />}>فتح إدارة الصف</ButtonLink>}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <Stat label="حصص مسجّلة" value={<span className="tnum">{fmt.num(c.sessions, 0)}</span>} icon={<History className="size-5" />} tone="brand" />
            <Stat label="شارك في" value={<span className="tnum">{fmt.num(c.participatedSessions, 0)}</span>} hint={`${fmt.num(c.participations, 0)} مشاركة`} icon={<Hand className="size-5" />} tone="good" />
            <Stat label="لم يشارك في" value={<span className="tnum">{fmt.num(c.noParticipationSessions, 0)}</span>} hint="حصة" icon={<Hand className="size-5" />} tone={c.noParticipationSessions ? 'warn' : 'good'} />
            <Stat label="نسبة المشاركة" value={<span className="tnum">{c.rate === null ? '—' : fmt.pct(c.rate)}</span>} hint={data.sectionRate === null ? undefined : `متوسط الشعبة ${fmt.pct(data.sectionRate)}`} icon={<MessagesSquare className="size-5" />} tone="info" />
            <Stat label="سلوك إيجابي" value={<span className="tnum">{fmt.num(c.positive, 0)}</span>} icon={<ThumbsUp className="size-5" />} tone="info" />
            <Stat label="سلوك غير حسن" value={<span className="tnum">{fmt.num(c.negative, 0)}</span>} hint={c.notes ? `و${fmt.num(c.notes, 0)} ملاحظة` : undefined} icon={<ThumbsDown className="size-5" />} tone={c.negative ? 'bad' : 'good'} />
          </div>

          {data.bySubject.length > 1 ? (
            <Card>
              <CardHeader title="حسب المادة" />
              <div className="scroll-x px-2 pb-3">
                <table className="w-full min-w-[560px] text-[14.5px]">
                  <thead className="text-[13px] text-muted">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-start font-medium">المادة</th>
                      <th scope="col" className="px-3 py-2 text-start font-medium">الحصص</th>
                      <th scope="col" className="px-3 py-2 text-start font-medium">نسبة المشاركة</th>
                      <th scope="col" className="px-3 py-2 text-start font-medium">إيجابي</th>
                      <th scope="col" className="px-3 py-2 text-start font-medium">غير حسن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.bySubject.map((s) => (
                      <tr key={s.assignmentId ?? 'none'}>
                        <td className="px-3 py-2">{s.subjectName && s.subjectColor ? <SubjectChip name={s.subjectName} color={s.subjectColor} /> : <span className="text-muted">حصة بلا مقرر</span>} <span className="tnum text-muted">{s.sectionLabel}</span></td>
                        <td className="px-3 py-2 tnum">{fmt.num(s.counts.sessions, 0)}</td>
                        <td className="px-3 py-2"><RateMeter rate={s.counts.rate} /></td>
                        <td className="px-3 py-2 tnum">{fmt.num(s.counts.positive, 0)}</td>
                        <td className="px-3 py-2 tnum">{s.counts.negative ? <b className="text-bad">{fmt.num(s.counts.negative, 0)}</b> : '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {data.reasons.length ? (
            <Card className="p-5">
              <ReasonChips reasons={data.reasons} />
            </Card>
          ) : null}

          <section aria-labelledby="timeline-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="timeline-title" className="text-[17px] font-semibold text-ink">الخط الزمني</h2>
              <Segmented<KindFilter>
                value={kind}
                onChange={setKind}
                size="sm"
                label="تصفية الخط الزمني"
                options={[
                  { value: 'all', label: 'الكل' },
                  { value: 'participation', label: 'المشاركة' },
                  { value: 'positive', label: 'إيجابي' },
                  { value: 'negative', label: 'غير حسن' },
                  { value: 'note', label: 'ملاحظات' },
                ]}
              />
            </div>
            {groups.length === 0 ? (
              <EmptyState icon={<History className="size-7" />} title="لا شيء من هذا النوع" description="غيّر التصفية لعرض بقية الحصص." action={<Button variant="secondary" onClick={() => setKind('all')}>عرض الكل</Button>} />
            ) : (
              <ol className="relative space-y-4 border-s-2 border-line ps-6">
                {groups.map((g) => (
                  <li key={g.key} className="relative">
                    <span className="absolute -start-[31px] top-5 size-3 rounded-full border-2 border-surface bg-brand" aria-hidden />
                    <Card className="p-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <b className="text-[15.5px] text-ink">{weekdayName(weekdayOf(g.date))} {fmt.date(g.date, 'medium')}</b>
                        {g.period ? <span className="text-[13px] text-muted">الحصة <span className="tnum">{fmt.num(g.period, 0)}</span></span> : null}
                        {g.subjectName && g.subjectColor ? <SubjectChip name={g.subjectName} color={g.subjectColor} /> : <Badge>حصة بلا مقرر</Badge>}
                        {g.sectionLabel ? <span className="tnum text-[13px] text-muted">{g.sectionLabel}</span> : null}
                        <ParticipationBadge value={g.participation} />
                        {g.assignmentId && g.date <= todayISO() ? (
                          <Link to={sessionHref(g.assignmentId, g.date, g.period)} className="ms-auto text-[13px] text-brand hover:underline">فتح الحصة</Link>
                        ) : null}
                      </div>
                      {g.lessonTitle ? <div className="mt-1 text-[13.5px] text-muted">الدرس: {g.lessonTitle}</div> : null}
                      {kind !== 'participation' && g.records.some((r) => kind === 'all' || r.kind === kind) ? (
                        <ul className="mt-2.5 space-y-1.5">
                          {g.records.filter((r) => kind === 'all' || r.kind === kind).map((r) => {
                            const Icon = recordIcon[r.kind];
                            return (
                              <li key={r.id} className="flex items-start gap-2.5">
                                <Badge tone={recordTone[r.kind]} className="mt-0.5 shrink-0"><Icon className="size-3.5" aria-hidden />{CLASS_RECORD_KIND.labels[r.kind]}</Badge>
                                <p className="min-w-0 flex-1 text-[14.5px] leading-7 text-ink">
                                  {r.reason ? <b>{r.reason}</b> : null}{r.reason && r.note ? ' — ' : ''}{r.note}
                                </p>
                                <span className="flex shrink-0">
                                  <IconButton label={`تعديل: ${recordText(r)}`} size="iconSm" onClick={() => setDialog({ studentId, studentName: data.student.fullName, kind: r.kind, record: r, session: { assignmentId: r.assignmentId, date: r.date, period: r.period } })}><Pencil className="size-4" /></IconButton>
                                  <IconButton label={`حذف: ${recordText(r)}`} size="iconSm" className="hover:text-bad" onClick={() => void askRemove(r)}><Trash2 className="size-4" /></IconButton>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </Card>
                  </li>
                ))}
              </ol>
            )}
            {data.totalSessions > data.sessions.length ? (
              <div className="mt-4 flex items-center justify-between text-[14px] text-muted">
                <span className="tnum">{fmt.num(data.sessions.length, 0)} من {fmt.num(data.totalSessions, 0)} حصة</span>
                <Button variant="secondary" size="sm" onClick={() => setLimit(limit + 100)}>عرض المزيد</Button>
              </div>
            ) : null}
          </section>
        </>
      )}

      <RecordDialog target={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
