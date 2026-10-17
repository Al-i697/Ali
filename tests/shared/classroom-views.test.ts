import { describe, expect, it } from 'vitest';
import type { AssignmentDto, ClassRecordDto } from '../../src/shared/dto';
import type { ParticipationEntry } from '../../src/shared/classroom';
import {
  buildClassDashboard,
  buildOverview,
  buildSession,
  buildSessionStudents,
  buildStudentReport,
  buildSummary,
  groupRate,
  makeMetaResolver,
  pickLesson,
  recordedToday,
  type LessonRef,
  type RosterEntry,
} from '../../src/shared/classroom-views';

const A1: AssignmentDto = { id: 'a1', sectionId: 'sec1', subjectId: 'sub1', yearId: 'y', gradeLevel: 10, sectionName: '3', sectionLabel: '10/3', subjectName: 'العلوم', subjectColor: 'teal', weeklyPeriods: null };
const A2: AssignmentDto = { ...A1, id: 'a2', subjectId: 'sub2', subjectName: 'الرياضيات', subjectColor: 'violet' };
const roster: RosterEntry[] = [
  { studentId: 's1', rollNo: 1, fullName: 'أحمد', gender: 'male' },
  { studentId: 's2', rollNo: 2, fullName: 'فاطمة', gender: 'female' },
];
const p = (studentId: string, date: string, count: number, period: number | null = 1, assignmentId: string | null = 'a1'): ParticipationEntry => ({ studentId, assignmentId, date, period, count });
let n = 0;
const r = (studentId: string, date: string, kind: ClassRecordDto['kind'], reason: string | null, period: number | null = 1, assignmentId: string | null = 'a1'): ClassRecordDto => ({
  id: `r${++n}`, studentId, assignmentId, date, period, kind, reason, note: null, createdAt: `2026-10-01T08:00:${String(n).padStart(2, '0')}.000Z`,
});
const lessons: LessonRef[] = [
  { id: 'l1', assignmentId: 'a1', date: '2026-10-05', period: 1, title: 'الخلية' },
  { id: 'l2', assignmentId: 'a1', date: '2026-10-06', period: null, title: 'تحضير اليوم' },
  { id: 'l3', assignmentId: 'a2', date: '2026-10-05', period: 3, title: 'المعادلات' },
];

describe('تحضير الدرس المطابق للحصة', () => {
  it('بالرقم نفسه أو العام بلا رقم، وأول تحضير لحصة غير محددة، ولا يخلط المقررات ولا التواريخ', () => {
    const pick = (assignmentId: string | null, date: string, period: number | null) => pickLesson(lessons, { assignmentId, date, period })?.id;
    expect(pick('a1', '2026-10-05', 1)).toBe('l1');
    expect(pick('a1', '2026-10-05', 2)).toBeUndefined(); // تحضير الحصة الأولى لا يخص الثانية
    expect(pick('a1', '2026-10-05', null)).toBe('l1');
    expect(pick('a1', '2026-10-06', 4)).toBe('l2'); // تحضير بلا رقم يخص أي حصة
    expect(pick('a2', '2026-10-05', 3)).toBe('l3');
    expect(pick('a2', '2026-10-05', 1)).toBeUndefined();
    expect(pick('a1', '2026-10-07', 1)).toBeUndefined();
    expect(pick(null, '2026-10-05', 1)).toBeUndefined();
  });

  it('واصف الحصة يجمع الشعبة والمادة واللون وعنوان الدرس، وبلا مقرر يعيد قيمًا فارغة', () => {
    const meta = makeMetaResolver(new Map([['a1', A1]]), lessons);
    expect(meta({ assignmentId: 'a1', date: '2026-10-05', period: 1 })).toEqual({ sectionLabel: '10/3', subjectName: 'العلوم', subjectColor: 'teal', lessonTitle: 'الخلية' });
    expect(meta({ assignmentId: null, date: '2026-10-05', period: 1 })).toEqual({ sectionLabel: null, subjectName: null, subjectColor: null, lessonTitle: null });
    expect(meta({ assignmentId: 'zzz', date: '', period: null }).sectionLabel).toBeNull();
  });
});

describe('شاشة الحصة', () => {
  const rows = {
    participation: [p('s1', '2026-10-01', 2), p('s1', '2026-10-02', 0), p('s1', '2026-10-05', 3), p('s1', '2026-10-05', 9, 2), p('s1', '2026-10-06', 1), p('s2', '2026-10-05', 0)],
    records: [r('s1', '2026-10-01', 'positive', 'مساعدة زميل'), r('s1', '2026-10-05', 'negative', 'حديث جانبي'), r('s1', '2026-10-05', 'note', 'ملاحظة', 2), r('s1', '2026-10-06', 'negative', 'لاحقة')],
  };
  const ref = { assignmentId: 'a1', date: '2026-10-05', period: 1 };

  it('حالة الطالب في الحصة من صفها هي، و«قبل» كل ما سبقها دونها ودون ما بعدها ودون حصة أخرى في اليوم نفسه', () => {
    const [s1, s2] = buildSessionStudents(ref, roster, rows);
    expect(s1).toMatchObject({ studentId: 's1', rollNo: 1, fullName: 'أحمد', participation: 3 });
    expect(s1!.records.map((x) => x.reason)).toEqual(['حديث جانبي']); // ملاحظة الحصة 2 ليست هنا
    // قبل: 01 (شارك 2 + إيجابي) و02 (لم يشارك) ثم حصة اليوم نفسه رقم 2 (شارك 9 + ملاحظة) = 3 حصص؛ لا حصة 06 ولا الحالية
    expect(s1!.before).toMatchObject({ sessions: 3, participatedSessions: 2, noParticipationSessions: 1, participations: 11, positive: 1, negative: 0, notes: 1 });
    expect(s2).toMatchObject({ participation: 0, records: [] });
    expect(s2!.before.sessions).toBe(0);
  });

  it('طالب بلا أي صف: لم يُسجَّل وأصفار، والمجاميع من الحالة الحالية', () => {
    const dto = buildSession({ assignment: A1, date: '2026-10-05', period: 1, roster: [...roster, { studentId: 's3', rollNo: 3, fullName: 'سعيد', gender: null }], rows, lessons });
    expect(dto.students[2]).toMatchObject({ participation: null, records: [], before: { sessions: 0, rate: null } });
    expect(dto.lesson).toEqual({ id: 'l1', title: 'الخلية' });
    expect(dto.totals).toMatchObject({ students: 3, participating: 1, didNotParticipate: 1, unrecorded: 1, participations: 3, negative: 1 });
  });
});

describe('ملخص الشعبة وتقرير الطالب', () => {
  const rows = {
    participation: [p('s1', '2026-10-01', 2), p('s1', '2026-10-02', 0, 1, 'a2'), p('s2', '2026-10-01', 0)],
    records: [r('s1', '2026-10-01', 'negative', 'حديث جانبي'), r('s1', '2026-10-02', 'positive', 'مبادرة', 1, 'a2')],
  };
  const meta = makeMetaResolver(new Map([['a1', A1], ['a2', A2]]), []);

  it('الملخص: صف لكل طالب بالقائمة (حتى بلا تسجيل)، وإجمالي بنسبة الحصص لا متوسط النسب، وآخر الحصص محدودة', () => {
    const sum = buildSummary({ section: { id: 'sec1', label: '10/3' }, assignment: null, roster: [...roster, { studentId: 's3', rollNo: 3, fullName: 'سعيد', gender: null }], rows, meta, recentLimit: 2 });
    expect(sum.rows.map((x) => [x.fullName, x.counts.sessions])).toEqual([['أحمد', 2], ['فاطمة', 1], ['سعيد', 0]]);
    expect(sum.rows[2]).toMatchObject({ lastDate: null, flags: [] });
    expect(sum.sessions).toBe(2);
    expect(sum.recent).toHaveLength(2);
    expect(sum.totals).toMatchObject({ participatedSessions: 1, noParticipationSessions: 2, participations: 2, rate: 33.3 });
    expect(sum.assignmentId).toBeNull();
  });

  it('تقرير الطالب: التصفية بالمقرر تغيّر الأعداد لا قائمة المقررات المتاحة، والمقارنة بالشعبة تُمرَّر كما هي', () => {
    const student = { id: 's1', fullName: 'أحمد' } as never;
    // صفوف الطالب وحده (الدالة تفترض أن الصفوف كلها له؛ التصفية بالطالب تتم عند الجلب)
    const mine = { participation: rows.participation.filter((x) => x.studentId === 's1'), records: rows.records };
    const all = buildStudentReport({ student, assignmentId: null, limit: 10, rows: mine, meta, sectionRate: 33.3 });
    expect(all.counts).toMatchObject({ sessions: 2, participatedSessions: 1, noParticipationSessions: 1, positive: 1, negative: 1 });
    expect(all.assignments.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect(all.bySubject.map((b) => b.subjectName).sort()).toEqual(['الرياضيات', 'العلوم']);
    expect(all.sectionRate).toBe(33.3);
    const only = buildStudentReport({ student, assignmentId: 'a2', limit: 10, rows: mine, meta, sectionRate: null });
    expect(only.counts).toMatchObject({ sessions: 1, noParticipationSessions: 1, positive: 1, negative: 0 });
    expect(only.assignments.map((a) => a.id)).toEqual(['a1', 'a2']); // القائمة لا تضيق بالتصفية
    expect(only.sessions).toHaveLength(1);
    expect(only.totalSessions).toBe(1);
  });

  it('نسبة المجموعة = الحصص الشاركة ÷ (الشاركة + غير الشاركة)', () => {
    expect(groupRate([p('s1', 'd', 1), p('s2', 'd', 0), p('s3', 'd', 5), p('s4', 'd', 0)])).toBe(50);
    expect(groupRate([])).toBeNull();
  });
});

describe('النظرة العامة ولوحة التحكم', () => {
  it('حصة الجدول تأخذ تسجيلها بالرقم، وإلا ما سُجّل بلا رقم، وآخر الحصص بترتيب المراجع', () => {
    const rows = { participation: [p('s1', '2026-10-05', 1, 1), p('s2', '2026-10-05', 0, null, 'a2'), p('s1', '2026-10-04', 1, 2)], records: [] };
    const meta = makeMetaResolver(new Map([['a1', A1], ['a2', A2]]), []);
    const o = buildOverview({
      today: '2026-10-05',
      weekday: 1,
      slots: [
        { slotId: 'x1', period: 1, start: '07:30', end: '08:15', room: null, assignment: A1, studentCount: 2, state: 'past' },
        { slotId: 'x2', period: 3, start: null, end: null, room: null, assignment: A2, studentCount: 2, state: 'unknown' },
        { slotId: 'x3', period: 5, start: null, end: null, room: null, assignment: A1, studentCount: 2, state: 'upcoming' },
      ],
      recentRefs: [{ assignmentId: 'a1', date: '2026-10-05', period: 1 }, { assignmentId: 'a1', date: '2026-10-04', period: 2 }, { assignmentId: 'a1', date: '2026-09-01', period: 1 }],
      rows,
      meta,
      total: 3,
    });
    expect(o.slots[0]!.session).toMatchObject({ participating: 1 });
    expect(o.slots[1]!.session).toMatchObject({ didNotParticipate: 1 }); // سُجّلت بلا رقم فنُسبت لحصة الجدول
    expect(o.slots[2]!.session).toBeNull();
    expect(o.recent.map((s) => s.date)).toEqual(['2026-10-05', '2026-10-04']); // المرجع الثالث بلا صفوف
    expect(o.total).toBe(3);
  });

  it('عدّاد اليوم لكل حصة: طلاب مميَّزون من المشاركة والتسجيلات معًا، ويتجاهل غير اليوم وبلا المقرر', () => {
    const m = recordedToday(
      { participation: [p('s1', '2026-10-05', 1), p('s2', '2026-10-05', 0), p('s3', '2026-10-04', 1), p('s4', '2026-10-05', 1, 1, null)], records: [r('s1', '2026-10-05', 'negative', 'x'), r('s5', '2026-10-05', 'note', 'y', null)] },
      '2026-10-05',
    );
    expect([...m.entries()].sort()).toEqual([['a1|0', 1], ['a1|1', 2]]);
  });

  it('لوحة التحكم: نوافذ 14 و30 يومًا، وحد أدنى للحصص، وطلاب العام الحالي فقط، والأعلى عددًا أولًا', () => {
    const students = new Map([['s1', { fullName: 'أحمد', sectionLabel: '10/3' }], ['s2', { fullName: 'فاطمة', sectionLabel: '10/3' }]]);
    const today = '2026-10-20';
    const rows = {
      participation: [
        // s1: 5 حصص كلها «لم يشارك» في آخر 30 يومًا ← 0% ← قليل المشاركة
        p('s1', '2026-10-19', 0), p('s1', '2026-10-15', 0), p('s1', '2026-10-10', 0), p('s1', '2026-10-05', 0), p('s1', '2026-09-25', 0),
        // s2: 3 حصص فقط ← دون الحد الأدنى
        p('s2', '2026-10-19', 0), p('s2', '2026-10-18', 0), p('s2', '2026-10-17', 0),
        // خارج النافذة (أقدم من 30 يومًا) وطالب غير مقيَّد
        p('s1', '2026-09-01', 1), p('zz', '2026-10-19', 0),
      ],
      records: [
        r('s2', '2026-10-19', 'negative', 'حديث جانبي'), r('s2', '2026-10-18', 'negative', 'استخدام الجوال'), r('s1', '2026-10-17', 'negative', 'مشاجرة'),
        r('s2', '2026-10-01', 'negative', 'خارج نافذة 14 يومًا'), r('s1', '2026-10-19', 'positive', 'ليس سلبيًا'), r('zz', '2026-10-19', 'negative', 'غير مقيَّد'),
      ],
    };
    const d = buildClassDashboard({ today, total: 99, students, rows });
    expect(d.total).toBe(99);
    expect(d.negativeRecent.map((x) => [x.fullName, x.count, x.reason])).toEqual([['فاطمة', 2, 'حديث جانبي'], ['أحمد', 1, 'مشاجرة']]); // السبب = الأحدث تاريخًا لا الأقدم
    expect(d.lowParticipation.map((x) => [x.fullName, x.count, x.rate])).toEqual([['أحمد', 5, 0]]); // 5 حصص داخل 30 يومًا (حصة 1 سبتمبر خارجها، وفاطمة دون الحد الأدنى)
    expect(buildClassDashboard({ today, total: 0, students, rows })).toEqual({ total: 0, negativeRecent: [], lowParticipation: [] });
  });
});
