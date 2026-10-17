import { and, count, desc, eq, inArray, lt, lte, ne, or, sql } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { pickCurrentTerm } from '../../../shared/academic';
import { addDays, endOfWeek, startOfWeek, timeToMinutes, weekIndexIn, weekdayOf, eachDay } from '../../../shared/dates';
import type {
  AssignmentDto,
  DashboardAttention,
  DashboardDto,
  DashboardIncomplete,
  DashboardTodaySlot,
  TaskDto,
} from '../../../shared/dto';
import { listAssignmentInfos } from '../_shared/owned';
import { getGradebook } from '../assessments/service';
import { summarizeGradebook } from '../assessments/summary';
import { listSections, listYears } from '../academic/service';
import { getSettings } from '../settings/service';
import { dashboardClass, todayRecorded } from '../classroom/service';
import { dashboardLab } from '../lab/service';
import { dashboardCounts as supportCounts } from '../support/service';
import { listTasks } from '../tasks/service';

const { timetableSlots, lessonPlans, assessments, assessmentResults, enrollments, assignments } = schema;

export function buildDashboard(db: Db, ownerId: string, now: { date: string; time: string; weekday: number }): DashboardDto {
  const today = now.date;
  const years = listYears(db, ownerId);
  const year = years.find((y) => y.isCurrent) ?? years[0] ?? null;
  const term = year ? pickCurrentTerm(year.terms, today) : null;
  const weekNumber = term ? weekIndexIn(today, term.startDate) : null;
  const settings = getSettings(db, ownerId);

  const sections = year ? listSections(db, ownerId, year.id) : [];
  const counts = {
    sections: sections.length,
    students: sections.reduce((n, s) => n + s.studentCount, 0),
    assignments: sections.reduce((n, s) => n + s.assignments.length, 0),
  };

  const slots = year ? db.select().from(timetableSlots).where(and(eq(timetableSlots.ownerId, ownerId), eq(timetableSlots.yearId, year.id))).all() : [];
  const lessonCount = db.select({ c: count() }).from(lessonPlans).where(and(eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.isTemplate, false))).get()?.c ?? 0;
  const assessmentCount = db.select({ c: count() }).from(assessments).where(eq(assessments.ownerId, ownerId)).get()?.c ?? 0;

  const infos = year ? new Map(listAssignmentInfos(db, ownerId, { yearId: year.id }).map((a) => [a.id, a])) : new Map<string, AssignmentDto>();

  // ───────── حصص اليوم ─────────
  const periodTimes = new Map(settings.schedule.periods.map((p) => [p.n, p]));
  const todayLessons = db
    .select()
    .from(lessonPlans)
    .where(and(eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.isTemplate, false), eq(lessonPlans.date, today)))
    .all();
  const nowMin = timeToMinutes(now.time);
  // طلاب سُجّل لهم شيء في إدارة الصف اليوم: بمطابقة رقم الحصة، وإلا بما سُجّل لمقررها بلا رقم حصة
  const classToday = todayRecorded(db, ownerId, today);
  const todaySlots: DashboardTodaySlot[] = slots
    .filter((s) => s.weekday === now.weekday)
    .sort((a, b) => a.period - b.period)
    .flatMap((s) => {
      const assignment = infos.get(s.assignmentId);
      if (!assignment) return [];
      const times = periodTimes.get(s.period);
      const lesson =
        todayLessons.find((l) => l.assignmentId === s.assignmentId && l.period === s.period) ??
        todayLessons.find((l) => l.assignmentId === s.assignmentId && l.period === null);
      const last = lesson
        ? null
        : db
            .select({ id: lessonPlans.id, title: lessonPlans.title, date: lessonPlans.date })
            .from(lessonPlans)
            .where(and(eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.assignmentId, s.assignmentId), eq(lessonPlans.isTemplate, false), lt(lessonPlans.date, today)))
            .orderBy(desc(lessonPlans.date))
            .get() ?? null;
      let state: DashboardTodaySlot['state'] = 'unknown';
      if (times) {
        const start = timeToMinutes(times.start);
        const end = timeToMinutes(times.end);
        state = nowMin >= end ? 'past' : nowMin >= start ? 'current' : 'upcoming';
      }
      return [
        {
          slotId: s.id,
          period: s.period,
          start: times?.start ?? null,
          end: times?.end ?? null,
          assignment,
          room: s.room,
          lesson: lesson ? { id: lesson.id, title: lesson.title, status: lesson.status } : null,
          lastLesson: last,
          classRecorded: classToday.get(`${s.assignmentId}|${s.period}`) ?? classToday.get(`${s.assignmentId}|0`) ?? 0,
          state,
        },
      ];
    });

  // ───────── تحضير هذا الأسبوع: كم حصة لها تحضير؟ ─────────
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekLessons = db
    .select()
    .from(lessonPlans)
    .where(and(eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.isTemplate, false), lte(lessonPlans.date, weekEnd), sql`${lessonPlans.date} >= ${weekStart}`))
    .all();
  let plannedSlots = 0;
  let weekSlots = 0;
  for (const day of eachDay(weekStart, weekEnd)) {
    if (!settings.schedule.workDays.includes(weekdayOf(day))) continue;
    for (const s of slots.filter((x) => x.weekday === weekdayOf(day))) {
      weekSlots++;
      if (weekLessons.some((l) => l.date === day && l.assignmentId === s.assignmentId && (l.period === s.period || l.period === null))) plannedSlots++;
    }
  }

  // ───────── المهام ─────────
  const open = listTasks(db, ownerId, { status: 'open', limit: 200 });
  const dated = open.filter((t): t is TaskDto & { dueDate: string } => !!t.dueDate);
  const weekAhead = addDays(today, 7);
  const taskGroups = {
    overdue: dated.filter((t) => t.dueDate < today).slice(0, 8),
    today: dated.filter((t) => t.dueDate === today).slice(0, 8),
    upcoming: dated.filter((t) => t.dueDate > today && t.dueDate <= weekAhead).slice(0, 8),
  };

  // ───────── تقويمات غير مكتملة / قادمة ─────────
  const incomplete: DashboardIncomplete[] = [];
  const upcomingAssessments: DashboardDto['upcomingAssessments'] = [];
  if (year && term) {
    const asm = db
      .select({ a: assessments, sectionId: assignments.sectionId })
      .from(assessments)
      .innerJoin(assignments, eq(assignments.id, assessments.assignmentId))
      .where(and(eq(assessments.ownerId, ownerId), eq(assessments.termId, term.id)))
      .all();
    const enrolled = new Map(
      db
        .select({ sectionId: enrollments.sectionId, c: count() })
        .from(enrollments)
        .where(and(eq(enrollments.ownerId, ownerId), eq(enrollments.yearId, year.id)))
        .groupBy(enrollments.sectionId)
        .all()
        .map((r) => [r.sectionId, r.c]),
    );
    const ids = asm.map((r) => r.a.id);
    const recorded = new Map(
      ids.length
        ? db
            .select({ assessmentId: assessmentResults.assessmentId, c: count() })
            .from(assessmentResults)
            .where(
              and(
                inArray(assessmentResults.assessmentId, ids),
                or(ne(assessmentResults.status, 'graded'), sql`${assessmentResults.score} is not null`, sql`${assessmentResults.level} is not null`),
              ),
            )
            .groupBy(assessmentResults.assessmentId)
            .all()
            .map((r) => [r.assessmentId, r.c])
        : [],
    );
    for (const { a, sectionId } of asm) {
      const total = enrolled.get(sectionId) ?? 0;
      const done = recorded.get(a.id) ?? 0;
      const assignment = infos.get(a.assignmentId);
      if (!assignment) continue;
      if (total > 0 && done < total && (!a.date || a.date <= today)) {
        incomplete.push({ assessmentId: a.id, title: a.title, date: a.date, assignment, missing: total - done, total });
      }
      if (a.date && a.date > today && a.date <= addDays(today, 14)) {
        upcomingAssessments.push({ assessmentId: a.id, title: a.title, date: a.date, assignment });
      }
    }
    incomplete.sort((x, y) => ((y.date ?? '') > (x.date ?? '') ? 1 : -1));
    upcomingAssessments.sort((x, y) => (x.date < y.date ? -1 : 1));
  }

  // ───────── طلاب يحتاجون متابعة (نسبة أقل من حد العلاج) ─────────
  const attention: DashboardAttention[] = [];
  if (term && year) {
    const withPlan = new Set(
      db
        .select({ studentId: schema.supportPlans.studentId, assignmentId: schema.supportPlans.assignmentId })
        .from(schema.supportPlans)
        .where(and(eq(schema.supportPlans.ownerId, ownerId), eq(schema.supportPlans.status, 'open'), eq(schema.supportPlans.kind, 'remedial')))
        .all()
        .map((r) => `${r.studentId}|${r.assignmentId}`),
    );
    for (const asg of infos.values()) {
      const summary = summarizeGradebook(getGradebook(db, ownerId, asg.id, term.id));
      for (const s of summary.students) {
        if (s.flag === 'remedial' && s.totals.percent !== null) {
          attention.push({ studentId: s.studentId, fullName: s.fullName, sectionLabel: asg.sectionLabel, subjectName: asg.subjectName, assignmentId: asg.id, percent: s.totals.percent, hasPlan: withPlan.has(`${s.studentId}|${asg.id}`) });
        }
      }
    }
    // من لا خطة له أولًا (هو من يحتاج إجراءً)، ثم الأدنى نسبة
    attention.sort((a, b) => Number(a.hasPlan) - Number(b.hasPlan) || a.percent - b.percent);
  }

  return {
    today,
    weekday: now.weekday,
    year,
    term,
    weekNumber,
    counts,
    setup: {
      hasYear: years.length > 0,
      hasSection: sections.length > 0,
      hasStudents: counts.students > 0,
      hasTimetable: slots.length > 0,
      hasLesson: lessonCount > 0,
      hasAssessment: assessmentCount > 0,
    },
    todaySlots,
    lessonsThisWeek: { planned: plannedSlots, slots: weekSlots },
    tasks: taskGroups,
    incomplete: incomplete.slice(0, 8),
    upcomingAssessments: upcomingAssessments.slice(0, 6),
    attention: attention.slice(0, 8),
    support: supportCounts(db, ownerId, today),
    lab: dashboardLab(db, ownerId, today, year?.startDate),
    classroom: dashboardClass(db, ownerId, today),
  };
}

