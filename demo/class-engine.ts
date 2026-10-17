// محرّك «إدارة الصف» في المعاينة التفاعلية: يخدم مسارات /api/class/* من صفوف في الذاكرة بدل الخادم، فيجرّب المعلم التسجيل فعلًا
// (شارك، لم يشارك، سلوك، ملخص، تقرير الطالب) ثم تُمحى تجربته عند إعادة تحميل الصفحة.
//  • الأرقام والشاشات تُبنى بالدوال النقية نفسها التي يستعملها الخادم (src/shared/classroom*.ts) فلا تتباعد النتائج.
//  • صفوفه الابتدائية تُستخرج من استجابات سُجّلت من التطبيق الحقيقي (تقرير كل طالب بلا نطاق)، لا من بيانات مصطنعة.
//  • يرفض ما يرفضه الخادم في الحالات الأساسية (تاريخ مستقبلي، تسجيل بلا سبب ولا ملاحظة، عدّاد خارج الحدود، حصة غير معروفة).
import { pickCurrentTerm } from '../src/shared/academic';
import { nowInZone } from '../src/shared/dates';
import type { Gender } from '../src/shared/constants';
import type {
  AssignmentDto,
  ClassRecordDto,
  ClassSessionStudentDto,
  ClassStudentReportDto,
  ClassSummaryDto,
  DashboardDto,
  NoteDto,
  RosterEntryDto,
  SectionDto,
  SettingsDto,
  SlotDto,
  StudentDto,
  YearDto,
} from '../src/shared/dto';
import type { ParticipationEntry, SessionRef } from '../src/shared/classroom';
import { compareSessionsDesc, sessionKey } from '../src/shared/classroom';
import {
  buildClassDashboard,
  buildOverview,
  buildSession,
  buildSessionStudents,
  buildStudentReport,
  buildSummary,
  groupRate,
  makeMetaResolver,
  recordedToday,
  type ClassRows,
  type LessonRef,
  type RosterEntry,
  type SlotInput,
} from '../src/shared/classroom-views';
import { createClassRecordSchema, fillRestSchema, setParticipationSchema, updateClassRecordSchema } from '../src/shared/schemas/classroom';
import { installArabicZod } from '../src/shared/schemas/common';
import { reportQuery } from '../src/shared/schemas/reports';
import { classSectionDoc, classStudentDoc, resolveClassRange } from '../src/server/reports/class-docs';
import { renderReportHtmlWith } from '../src/server/reports/render';
import type { Branding } from '../src/server/reports/types';
import type { ZodError } from 'zod';

type Reply = { status: number; body: unknown };
/** يقرأ استجابة مسجَّلة بمفتاحها (undefined إن لم تُسجَّل) */
export type RecordedGet = (key: string) => unknown;

const ok = (body: unknown, status = 200): Reply => ({ status, body });
const err = (status: number, code: string, message: string, fields?: Record<string, string>): Reply => ({ status, body: { error: { code, message, ...(fields ? { fields } : {}) } } });

function invalid(e: ZodError): Reply {
  const fields: Record<string, string> = {};
  for (const i of e.issues) fields[i.path.map(String).join('.') || '_'] ??= i.message;
  return err(400, 'VALIDATION_ERROR', e.issues.length === 1 ? e.issues[0]!.message : 'تحقق من الحقول المُدخلة', fields);
}

const periodDto = (p: number | null | undefined): number | null => (p ? p : null);
const slotState = (times: { start: string; end: string } | undefined, nowMin: number): SlotInput['state'] => {
  if (!times) return 'unknown';
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  return nowMin >= m(times.end) ? 'past' : nowMin >= m(times.start) ? 'current' : 'upcoming';
};

export class ClassEngine {
  private assignments = new Map<string, AssignmentDto>();
  private sections = new Map<string, { id: string; label: string }>();
  private roster = new Map<string, RosterEntry[]>(); // الشعبة ← طلابها المقيَّدون
  private students = new Map<string, StudentDto>();
  private sectionOf = new Map<string, string>(); // الطالب ← شعبته
  private lessons: LessonRef[] = [];
  private slots: SlotDto[] = [];
  private periods: { n: number; start: string; end: string }[] = [];
  private parts: ParticipationEntry[] = [];
  private records: ClassRecordDto[] = [];
  private years: YearDto[] = [];
  private recorded: RecordedGet = () => undefined;
  private seq = 0;

  /** يبني المحرّك من الاستجابات المسجَّلة؛ null إن لم تتوفر بيانات إدارة الصف (لا طلاب ولا مقررات) */
  static from(get: RecordedGet, keys: readonly string[]): ClassEngine | null {
    installArabicZod();
    const e = new ClassEngine();
    e.recorded = get;
    e.years = (get('/years') as YearDto[] | undefined) ?? [];
    const list = <T>(prefix: string): T[] => keys.filter((k) => k === prefix || k.startsWith(`${prefix}?`)).flatMap((k) => (get(k) as T[] | undefined) ?? []);

    for (const a of list<AssignmentDto>('/assignments')) e.assignments.set(a.id, a);
    for (const s of list<SectionDto>('/sections')) {
      e.sections.set(s.id, { id: s.id, label: s.label });
      for (const a of s.assignments ?? []) e.assignments.set(a.id, a);
    }
    for (const sectionId of e.sections.keys()) {
      const roster = get(`/sections/${sectionId}/students`) as RosterEntryDto[] | undefined;
      e.roster.set(
        sectionId,
        (roster ?? []).filter((r) => r.student.status === 'active').map((r) => ({ studentId: r.student.id, rollNo: r.rollNo, fullName: r.student.fullName, gender: (r.student.gender ?? null) as Gender | null })),
      );
    }
    const lessons = (get('/lessons?limit=500') as { items?: { id: string; assignmentId: string; date: string; period: number | null; title: string; isTemplate: boolean }[] } | undefined)?.items ?? [];
    e.lessons = lessons.filter((l) => !l.isTemplate).map((l) => ({ id: l.id, assignmentId: l.assignmentId, date: l.date, period: l.period, title: l.title }));
    e.slots = list<SlotDto>('/timetable');
    e.periods = (get('/settings') as SettingsDto | undefined)?.schedule.periods ?? [];

    // الصفوف الابتدائية: من تقرير كل طالب (بلا نطاق) — حصصه بمشاركتها وتسجيلاتها
    const seen = new Set<string>();
    for (const k of keys) {
      const m = /^\/class\/students\/([^/?]+)\?limit=500$/.exec(k);
      if (!m) continue;
      const rep = get(k) as ClassStudentReportDto | undefined;
      if (!rep) continue;
      e.students.set(rep.student.id, rep.student);
      if (rep.student.enrollment) e.sectionOf.set(rep.student.id, rep.student.enrollment.sectionId);
      for (const g of rep.sessions) {
        if (g.participation !== null) e.parts.push({ studentId: rep.student.id, assignmentId: g.assignmentId, date: g.date, period: g.period, count: g.participation });
        for (const r of g.records) {
          if (seen.has(r.id)) continue;
          seen.add(r.id);
          e.records.push(r);
        }
      }
    }
    return e.assignments.size && e.students.size ? e : null;
  }

  // ───────────── أدوات ─────────────
  private asg(id: string): AssignmentDto | undefined {
    return this.assignments.get(id);
  }
  private rosterOf(a: AssignmentDto): RosterEntry[] {
    return this.roster.get(a.sectionId) ?? [];
  }
  private meta() {
    return makeMetaResolver(this.assignments, this.lessons);
  }
  private rowsFor(pred: { assignmentIds?: ReadonlySet<string>; studentIds?: ReadonlySet<string>; from?: string | null; to?: string | null }): ClassRows {
    const ok = (x: { assignmentId: string | null; studentId: string; date: string }) =>
      (!pred.assignmentIds || (x.assignmentId !== null && pred.assignmentIds.has(x.assignmentId))) && (!pred.studentIds || pred.studentIds.has(x.studentId)) && (!pred.from || x.date >= pred.from) && (!pred.to || x.date <= pred.to);
    return { participation: this.parts.filter(ok), records: this.records.filter(ok) };
  }
  private today() {
    return nowInZone();
  }
  private sessionRef(q: { assignmentId: string; date: string; period?: number | null }): SessionRef {
    return { assignmentId: q.assignmentId, date: q.date, period: periodDto(q.period) };
  }
  private studentRow(a: AssignmentDto, ref: SessionRef, studentId: string): ClassSessionStudentDto | undefined {
    const r = this.rosterOf(a).find((x) => x.studentId === studentId);
    if (!r) return undefined;
    return buildSessionStudents(ref, [r], this.rowsFor({ assignmentIds: new Set([a.id]), studentIds: new Set([studentId]), to: ref.date }))[0];
  }
  private sameSession(x: { assignmentId: string | null; date: string; period: number | null }, ref: SessionRef) {
    return sessionKey(x) === sessionKey(ref);
  }

  // ───────────── القراءة ─────────────
  read(path: string, p: URLSearchParams): Reply {
    if (path === '/class/overview') return ok(this.overview(Number(p.get('recent')) || 12));
    if (path === '/class/session') {
      const a = this.asg(p.get('assignmentId') ?? '');
      if (!a) return err(404, 'NOT_FOUND', 'مقرر الشعبة غير موجود');
      const ref = this.sessionRef({ assignmentId: a.id, date: p.get('date') ?? this.today().date, period: Number(p.get('period')) || null });
      const roster = this.rosterOf(a);
      return ok(
        buildSession({ assignment: a, date: ref.date, period: ref.period, roster, rows: this.rowsFor({ assignmentIds: new Set([a.id]), studentIds: new Set(roster.map((r) => r.studentId)), to: ref.date }), lessons: this.lessons.filter((l) => l.assignmentId === a.id && l.date === ref.date) }),
      );
    }
    if (path === '/class/summary') return this.summary(p);
    const m = /^\/class\/students\/([^/]+)$/.exec(path);
    if (m) return this.studentReport(m[1]!, p);
    return err(404, 'DEMO_NOT_RECORDED', 'هذه الصفحة غير مضمّنة في المعاينة.');
  }

  private overview(recent: number) {
    const now = this.today();
    const times = new Map(this.periods.map((x) => [x.n, x]));
    const nowMin = Number(now.time.slice(0, 2)) * 60 + Number(now.time.slice(3, 5));
    const all: ClassRows = { participation: this.parts, records: this.records };
    const refs = new Map<string, SessionRef>();
    for (const x of [...all.participation, ...all.records]) refs.set(sessionKey(x), { assignmentId: x.assignmentId, date: x.date, period: x.period });
    const recentRefs = [...refs.values()].sort(compareSessionsDesc).slice(0, recent);
    const slots: SlotInput[] = this.slots
      .filter((s) => s.weekday === now.weekday)
      .sort((a, b) => a.period - b.period)
      .map((s) => ({ slotId: s.id, period: s.period, start: times.get(s.period)?.start ?? null, end: times.get(s.period)?.end ?? null, room: s.room, assignment: s.assignment, studentCount: this.rosterOf(s.assignment).length, state: slotState(times.get(s.period), nowMin) }));
    return buildOverview({ today: now.date, weekday: now.weekday, slots, recentRefs, rows: all, meta: this.meta(), total: this.parts.length + this.records.length });
  }

  private summaryDto(q: { assignmentId?: string | null; sectionId?: string | null; from?: string | null; to?: string | null }, recentLimit: number): ClassSummaryDto | Reply {
    const a = q.assignmentId ? this.asg(q.assignmentId) : undefined;
    const sectionId = a ? a.sectionId : (q.sectionId ?? '');
    const section = this.sections.get(sectionId);
    if ((q.assignmentId && !a) || !section) return err(404, 'NOT_FOUND', 'الشعبة غير موجودة');
    const roster = this.roster.get(sectionId) ?? [];
    const asgIds = a ? [a.id] : [...this.assignments.values()].filter((x) => x.sectionId === sectionId).map((x) => x.id);
    const rows = this.rowsFor({ assignmentIds: new Set(asgIds), studentIds: new Set(roster.map((r) => r.studentId)), from: q.from, to: q.to });
    return buildSummary({ section, assignment: a ?? null, from: q.from ?? null, to: q.to ?? null, roster, rows, meta: this.meta(), recentLimit });
  }

  private summary(p: URLSearchParams): Reply {
    const r = this.summaryDto({ assignmentId: p.get('assignmentId'), sectionId: p.get('sectionId'), from: p.get('from') || null, to: p.get('to') || null }, 10);
    return 'status' in r ? r : ok(r);
  }

  private studentReportDto(studentId: string, q: { assignmentId?: string | null; from?: string | null; to?: string | null; limit: number }): ClassStudentReportDto | Reply {
    const student = this.students.get(studentId);
    if (!student) return err(404, 'NOT_FOUND', 'الطالب غير موجود');
    const assignmentId = q.assignmentId || null;
    if (assignmentId && !this.asg(assignmentId)) return err(404, 'NOT_FOUND', 'مقرر الشعبة غير موجود');
    const from = q.from || null;
    const to = q.to || null;
    const sectionId = student.enrollment?.sectionId;
    let sectionRate: number | null = null;
    if (sectionId) {
      const ids = new Set((this.roster.get(sectionId) ?? []).map((r) => r.studentId));
      const asgIds = new Set(assignmentId ? [assignmentId] : [...this.assignments.values()].filter((x) => x.sectionId === sectionId).map((x) => x.id));
      sectionRate = groupRate(this.rowsFor({ assignmentIds: asgIds, studentIds: ids, from, to }).participation);
    }
    return buildStudentReport({ student, assignmentId, from, to, limit: q.limit, rows: this.rowsFor({ studentIds: new Set([studentId]), from, to }), meta: this.meta(), sectionRate });
  }

  private studentReport(studentId: string, p: URLSearchParams): Reply {
    const r = this.studentReportDto(studentId, { assignmentId: p.get('assignmentId'), from: p.get('from'), to: p.get('to'), limit: Math.min(500, Math.max(1, Number(p.get('limit')) || 200)) });
    return 'status' in r ? r : ok(r);
  }

  /**
   * تقرير HTML حيّ لنوعَي تقارير الصف من حالة المحرّك الحالية (يظهر فيه ما سجّله المعلم للتو)، بالدوال النقية نفسها التي يبني بها الخادم
   * مستند PDF وExcel. يُعيد نص الصفحة، أو ردّ خطأ بالصيغة نفسها لو رفض الخادم الطلب.
   */
  report(type: 'class-student' | 'class-section', params: URLSearchParams, env: { settings: SettingsDto; fontCss: string }): { html: string } | Reply {
    const parsed = reportQuery.safeParse(Object.fromEntries(params));
    if (!parsed.success) return invalid(parsed.error);
    const q = parsed.data;
    const now = new Date().toISOString();
    const today = this.today().date;
    const year = this.years.find((y) => y.isCurrent) ?? this.years[0];
    const range = resolveClassRange({ from: q.from, to: q.to, all: q.classAll }, year ? pickCurrentTerm(year.terms, today) : null, today);
    if (!range.everything && range.to! < range.from!) return err(400, 'BAD_REQUEST', 'تاريخ النهاية يجب أن يكون بعد البداية');
    const s = env.settings;
    const brand: Branding = {
      schoolName: s.profile.schoolName,
      directorate: s.profile.directorate,
      teacherName: s.profile.fullName,
      jobTitle: s.profile.jobTitle,
      specialization: s.profile.specialization,
      seniorTeacherName: s.profile.seniorTeacherName,
      principalName: s.profile.principalName,
      digits: s.preferences.digits,
    };
    const common = { range, digits: s.preferences.digits, teacherName: s.profile.fullName, now };

    if (type === 'class-section') {
      if (!q.assignmentId) return err(400, 'MISSING_PARAM', 'حدّد الشعبة والمادة', { 'الشعبة والمادة': 'مطلوب' });
      const sum = this.summaryDto({ assignmentId: q.assignmentId, from: range.from, to: range.to }, 500);
      if ('status' in sum) return sum;
      return { html: renderReportHtmlWith(classSectionDoc({ ...common, sum }), brand, env.fontCss) };
    }

    if (!q.studentId) return err(400, 'MISSING_PARAM', 'حدّد الطالب', { 'الطالب': 'مطلوب' });
    const rep = this.studentReportDto(q.studentId, { assignmentId: q.assignmentId, from: range.from, to: range.to, limit: 500 });
    if ('status' in rep) return rep;
    const subjectScope = q.assignmentId ? (rep.assignments.find((a) => a.id === q.assignmentId)?.label ?? this.asg(q.assignmentId)?.subjectName ?? '—') : 'كل المواد';
    const notes = q.includeNotes ? (this.recorded(`/students/${q.studentId}/notes`) as NoteDto[] | undefined) : undefined;
    return { html: renderReportHtmlWith(classStudentDoc({ ...common, rep, subjectScope, includeGuardian: q.includeGuardian, notes }), brand, env.fontCss) };
  }

  /** لوحة التحكم المسجَّلة بعد تحديث ما يخص إدارة الصف فيها بحسب ما سُجّل في الجلسة */
  patchDashboard(dash: DashboardDto): DashboardDto {
    const rows: ClassRows = { participation: this.parts, records: this.records };
    const counts = recordedToday(rows, dash.today);
    const students = new Map<string, { fullName: string; sectionLabel: string }>();
    for (const [id, s] of this.students) if (s.status === 'active' && s.enrollment) students.set(id, { fullName: s.fullName, sectionLabel: s.enrollment.sectionLabel });
    return {
      ...dash,
      todaySlots: dash.todaySlots.map((s) => ({ ...s, classRecorded: counts.get(`${s.assignment.id}|${s.period}`) ?? counts.get(`${s.assignment.id}|0`) ?? 0 })),
      classroom: buildClassDashboard({ today: dash.today, total: this.parts.length + this.records.length, students, rows }),
    };
  }

  // ───────────── الكتابة ─────────────
  write(method: string, path: string, body: unknown, query: URLSearchParams): Reply {
    const today = this.today().date;
    const future = (date: string) => (date > today ? err(400, 'FUTURE_DATE', 'لا يمكن التسجيل لحصة تاريخها لم يحن بعد. اختر تاريخ اليوم أو ما قبله.', { date: 'تاريخ مستقبلي' }) : null);

    if (method === 'PUT' && path === '/class/participation') {
      const v = setParticipationSchema.safeParse(body);
      if (!v.success) return invalid(v.error);
      const { assignmentId, studentId, date, count } = v.data;
      const f = future(date);
      if (f) return f;
      const a = this.asg(assignmentId);
      if (!a || !this.students.has(studentId)) return err(404, 'NOT_FOUND', 'العنصر المطلوب غير موجود');
      if (!this.rosterOf(a).some((r) => r.studentId === studentId)) return err(400, 'NOT_IN_SECTION', 'الطالب غير مسجّل في شعبة هذه الحصة.', { studentId: 'ليس في الشعبة' });
      const ref = this.sessionRef(v.data);
      this.parts = this.parts.filter((x) => !(x.studentId === studentId && this.sameSession(x, ref)));
      if (count !== null) this.parts.push({ studentId, assignmentId, date, period: ref.period, count });
      return ok(this.studentRow(a, ref, studentId));
    }

    if (method === 'POST' && path === '/class/session/mark-rest') {
      const v = fillRestSchema.safeParse(body);
      if (!v.success) return invalid(v.error);
      const f = future(v.data.date);
      if (f) return f;
      const a = this.asg(v.data.assignmentId);
      if (!a) return err(404, 'NOT_FOUND', 'مقرر الشعبة غير موجود');
      const ref = this.sessionRef(v.data);
      let added = 0;
      for (const r of this.rosterOf(a)) {
        if (this.parts.some((x) => x.studentId === r.studentId && this.sameSession(x, ref))) continue;
        this.parts.push({ studentId: r.studentId, assignmentId: a.id, date: ref.date, period: ref.period, count: 0 });
        added++;
      }
      return ok({ added, session: (this.read('/class/session', new URLSearchParams({ assignmentId: a.id, date: ref.date, ...(ref.period ? { period: String(ref.period) } : {}) })).body) });
    }

    if (method === 'DELETE' && path === '/class/session') {
      const a = this.asg(query.get('assignmentId') ?? '');
      if (!a) return err(404, 'NOT_FOUND', 'مقرر الشعبة غير موجود');
      const ref = this.sessionRef({ assignmentId: a.id, date: query.get('date') ?? today, period: Number(query.get('period')) || null });
      const before = [this.parts.length, this.records.length];
      this.parts = this.parts.filter((x) => !this.sameSession(x, ref));
      this.records = this.records.filter((x) => !this.sameSession(x, ref));
      return ok({ ok: true, participation: before[0]! - this.parts.length, records: before[1]! - this.records.length });
    }

    if (method === 'POST' && path === '/class/records') {
      const v = createClassRecordSchema.safeParse(body);
      if (!v.success) return invalid(v.error);
      const f = future(v.data.date);
      if (f) return f;
      const a = this.asg(v.data.assignmentId);
      if (!a || !this.students.has(v.data.studentId)) return err(404, 'NOT_FOUND', 'العنصر المطلوب غير موجود');
      if (!this.rosterOf(a).some((r) => r.studentId === v.data.studentId)) return err(400, 'NOT_IN_SECTION', 'الطالب غير مسجّل في شعبة هذه الحصة.', { studentId: 'ليس في الشعبة' });
      const rec: ClassRecordDto = { id: `demo-${++this.seq}`, studentId: v.data.studentId, assignmentId: a.id, date: v.data.date, period: periodDto(v.data.period), kind: v.data.kind, reason: v.data.reason ?? null, note: v.data.note ?? null, createdAt: new Date().toISOString() };
      this.records.push(rec);
      return ok(rec, 201);
    }

    const m = /^\/class\/records\/([^/]+)$/.exec(path);
    if (m && (method === 'PATCH' || method === 'DELETE')) {
      const i = this.records.findIndex((x) => x.id === m[1]);
      if (i < 0) return err(404, 'NOT_FOUND', 'التسجيل غير موجود');
      if (method === 'DELETE') {
        this.records.splice(i, 1);
        return ok({ ok: true });
      }
      const v = updateClassRecordSchema.safeParse(body);
      if (!v.success) return invalid(v.error);
      const cur = this.records[i]!;
      const reason = v.data.reason !== undefined ? v.data.reason : cur.reason;
      const note = v.data.note !== undefined ? v.data.note : cur.note;
      if (!reason && !note) return err(400, 'VALIDATION_ERROR', 'اختر سببًا أو اكتب ملاحظة', { reason: 'اختر سببًا أو اكتب ملاحظة' });
      const next: ClassRecordDto = { ...cur, reason: reason || null, note: note || null, kind: v.data.kind ?? cur.kind };
      this.records[i] = next;
      return ok(next);
    }
    return err(404, 'DEMO_NOT_RECORDED', 'هذه العملية غير مضمّنة في المعاينة.');
  }
}
