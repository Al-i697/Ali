// إدارة الصف: دوال تجميع نقية (بلا قاعدة بيانات ولا HTTP). الخادم يجلب الصفوف ويمرّرها إليها فتُبنى الملخصات والتقارير،
// وتُختبر بمفردها. كل الأعداد تُشتق من صفوف المشاركة والتسجيلات: لا مصدرين للحقيقة.
import { CLASS_FLAGS } from './constants';
import type {
  ClassCountsDto,
  ClassFlag,
  ClassReasonCount,
  ClassRecordDto,
  ClassSessionGroupDto,
  ClassSessionSummaryDto,
  ClassSessionTotals,
} from './dto';
import { round } from './gradebook';

/** مشاركة طالب في حصة: count = 0 ⇒ «لم يشارك»، وغياب الصف ⇒ لم تُسجَّل بعد */
export type ParticipationEntry = {
  studentId: string;
  assignmentId: string | null;
  date: string;
  /** null ⇒ لم تُحدَّد الحصة */
  period: number | null;
  count: number;
};

export type SessionRef = { assignmentId: string | null; date: string; period: number | null };

/** معرّف الحصة: المقرر + التاريخ + رقم الحصة (0 ⇒ غير محددة) */
export const sessionKey = (s: SessionRef): string => `${s.assignmentId ?? '-'}|${s.date}|${s.period ?? 0}`;

/** الأحدث أولًا: التاريخ ثم رقم الحصة */
export function compareSessionsDesc(a: SessionRef, b: SessionRef): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  const pa = a.period ?? 0;
  const pb = b.period ?? 0;
  if (pa !== pb) return pb - pa;
  return sessionKey(a) < sessionKey(b) ? -1 : 1;
}

/**
 * نسبة المشاركة = الحصص التي شارك فيها ÷ الحصص التي سُجّلت له فيها المشاركة (شارك + لم يشارك).
 * حصة سُجّل فيها سلوك فقط ولم تُسجَّل مشاركتها لا تدخل المقام، فلا تُحسب على الطالب «عدم مشاركة» لم يقرّها المعلم.
 */
export function participationRate(participatedSessions: number, noParticipationSessions: number): number | null {
  const total = participatedSessions + noParticipationSessions;
  return total > 0 ? round((participatedSessions / total) * 100, 1) : null;
}

export const emptyCounts = (): ClassCountsDto => ({
  sessions: 0,
  participatedSessions: 0,
  noParticipationSessions: 0,
  participations: 0,
  positive: 0,
  negative: 0,
  notes: 0,
  rate: null,
});

/** مجاميع طالب واحد من صفوفه (يفترض أن الصفوف كلها له) */
export function countEntries(participation: readonly ParticipationEntry[], records: readonly ClassRecordDto[]): ClassCountsDto {
  const c = emptyCounts();
  const sessions = new Set<string>();
  // صف المشاركة فريد لكل حصة؛ نحميه من التكرار مع ذلك فلا يُعدّ الطالب مرتين في حصة واحدة
  const perSession = new Map<string, number>();
  for (const p of participation) {
    const key = sessionKey(p);
    perSession.set(key, p.count);
    sessions.add(key);
  }
  for (const count of perSession.values()) {
    if (count > 0) c.participatedSessions++;
    else c.noParticipationSessions++;
    c.participations += count;
  }
  for (const r of records) {
    sessions.add(sessionKey(r));
    if (r.kind === 'positive') c.positive++;
    else if (r.kind === 'negative') c.negative++;
    else c.notes++;
  }
  c.sessions = sessions.size;
  c.rate = participationRate(c.participatedSessions, c.noParticipationSessions);
  return c;
}

export const CLASS_FLAG_LABELS: Record<ClassFlag, string> = {
  silent: 'لم يشارك مطلقًا',
  low: 'قليل المشاركة',
  concern: 'ملاحظات غير حسنة كثيرة',
};

/** معنى المؤشر بعتبته، يُعرض تلميحًا فيفهم المعلم لماذا ظهر */
export function classFlagHint(flag: ClassFlag): string {
  if (flag === 'silent') return `لم يشارك في أي حصة من ${CLASS_FLAGS.minSessions} حصص فأكثر سُجّلت مشاركتها`;
  if (flag === 'low') return `نسبة مشاركته أقل من ${CLASS_FLAGS.lowRate}% في ${CLASS_FLAGS.minSessions} حصص فأكثر سُجّلت مشاركتها`;
  return `سُجّلت عليه ${CLASS_FLAGS.concernNegative} ملاحظات «غير حسنة» أو أكثر في الفترة`;
}

/** مؤشرات المتابعة: ليست أحكامًا، بل ما يستحق نظرة المعلم (العتبات في CLASS_FLAGS) */
export function classFlags(c: ClassCountsDto): ClassFlag[] {
  const flags: ClassFlag[] = [];
  const recorded = c.participatedSessions + c.noParticipationSessions;
  if (c.participatedSessions === 0 && c.noParticipationSessions >= CLASS_FLAGS.minSessions) flags.push('silent');
  else if (c.rate !== null && recorded >= CLASS_FLAGS.minSessions && c.rate < CLASS_FLAGS.lowRate) flags.push('low');
  if (c.negative >= CLASS_FLAGS.concernNegative) flags.push('concern');
  return flags;
}

/** إجمالي عدّة طلاب (لصف الإجمالي في الملخص)؛ `sessions` يُمرَّر منفصلًا لأنه ليس مجموعًا */
export function sumCounts(all: readonly ClassCountsDto[]): Omit<ClassCountsDto, 'sessions'> {
  let participatedSessions = 0;
  let noParticipationSessions = 0;
  let participations = 0;
  let positive = 0;
  let negative = 0;
  let notes = 0;
  for (const c of all) {
    participatedSessions += c.participatedSessions;
    noParticipationSessions += c.noParticipationSessions;
    participations += c.participations;
    positive += c.positive;
    negative += c.negative;
    notes += c.notes;
  }
  return {
    participatedSessions,
    noParticipationSessions,
    participations,
    positive,
    negative,
    notes,
    rate: participationRate(participatedSessions, noParticipationSessions),
  };
}

/** مجاميع شاشة الحصة من حالة طلابها الحالية (تُعاد حسابها محليًا عند كل تعديل فلا تتأخر عن الصفوف) */
export function sessionTotals(students: readonly { participation: number | null; records: readonly Pick<ClassRecordDto, 'kind'>[] }[]): ClassSessionTotals {
  const t: ClassSessionTotals = { students: students.length, participating: 0, didNotParticipate: 0, unrecorded: 0, participations: 0, positive: 0, negative: 0, notes: 0 };
  for (const s of students) {
    if (s.participation === null) t.unrecorded++;
    else if (s.participation === 0) t.didNotParticipate++;
    else {
      t.participating++;
      t.participations += s.participation;
    }
    for (const r of s.records) {
      if (r.kind === 'positive') t.positive++;
      else if (r.kind === 'negative') t.negative++;
      else t.notes++;
    }
  }
  return t;
}

export const NO_REASON_LABEL = 'بلا سبب محدد';

/** الأسباب المسجّلة مجمّعةً بعددها (الأكثر تكرارًا أولًا) */
export function reasonBreakdown(records: readonly ClassRecordDto[]): ClassReasonCount[] {
  const map = new Map<string, ClassReasonCount>();
  for (const r of records) {
    const reason = r.reason ?? NO_REASON_LABEL;
    const key = `${r.kind}|${reason}`;
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { kind: r.kind, reason, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || (a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0));
}

// ───────────── تجميع الصفوف في حصص ─────────────
export type SessionMeta = {
  sectionLabel: string | null;
  subjectName: string | null;
  subjectColor: string | null;
  lessonTitle: string | null;
};

type Bucket = { ref: SessionRef; participation: ParticipationEntry[]; records: ClassRecordDto[] };

function bucketize(participation: readonly ParticipationEntry[], records: readonly ClassRecordDto[]): Bucket[] {
  const map = new Map<string, Bucket>();
  const bucket = (ref: SessionRef): Bucket => {
    const key = sessionKey(ref);
    let b = map.get(key);
    if (!b) {
      b = { ref: { assignmentId: ref.assignmentId, date: ref.date, period: ref.period }, participation: [], records: [] };
      map.set(key, b);
    }
    return b;
  };
  for (const p of participation) bucket(p).participation.push(p);
  for (const r of records) bucket(r).records.push(r);
  return [...map.values()].sort((a, b) => compareSessionsDesc(a.ref, b.ref));
}

const byCreated = (a: ClassRecordDto, b: ClassRecordDto) => (a.createdAt === b.createdAt ? (a.id < b.id ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1);

/** الخط الزمني لطالب واحد: حصة لكل عنصر، الأحدث أولًا */
export function groupSessions(
  participation: readonly ParticipationEntry[],
  records: readonly ClassRecordDto[],
  meta: (ref: SessionRef) => SessionMeta,
): ClassSessionGroupDto[] {
  return bucketize(participation, records).map((b) => {
    const m = meta(b.ref);
    return {
      key: sessionKey(b.ref),
      date: b.ref.date,
      period: b.ref.period,
      assignmentId: b.ref.assignmentId,
      sectionLabel: m.sectionLabel,
      subjectName: m.subjectName,
      subjectColor: m.subjectColor,
      lessonTitle: m.lessonTitle,
      participation: b.participation[0]?.count ?? null,
      records: [...b.records].sort(byCreated),
    };
  });
}

/** ملخص كل حصة عبر كل طلابها: الأحدث أولًا */
export function summarizeSessions(
  participation: readonly ParticipationEntry[],
  records: readonly ClassRecordDto[],
  meta: (ref: SessionRef) => SessionMeta,
): ClassSessionSummaryDto[] {
  return bucketize(participation, records).map((b) => {
    const m = meta(b.ref);
    const students = new Set<string>();
    let participating = 0;
    let didNotParticipate = 0;
    let participations = 0;
    for (const p of b.participation) {
      students.add(p.studentId);
      if (p.count > 0) {
        participating++;
        participations += p.count;
      } else didNotParticipate++;
    }
    let positive = 0;
    let negative = 0;
    let notes = 0;
    for (const r of b.records) {
      students.add(r.studentId);
      if (r.kind === 'positive') positive++;
      else if (r.kind === 'negative') negative++;
      else notes++;
    }
    return {
      key: sessionKey(b.ref),
      assignmentId: b.ref.assignmentId,
      sectionLabel: m.sectionLabel,
      subjectName: m.subjectName,
      subjectColor: m.subjectColor,
      date: b.ref.date,
      period: b.ref.period,
      lessonTitle: m.lessonTitle,
      recordedStudents: students.size,
      participating,
      didNotParticipate,
      participations,
      positive,
      negative,
      notes,
    };
  });
}
