import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { pickCurrentTerm } from '../../../shared/academic';
import { todayISO } from '../../../shared/dates';
import type { StudentProfileDto, StudentSkillSummary, StudentSubjectSummary } from '../../../shared/dto';
import { levelForPercent, masteryAverage, round } from '../../../shared/gradebook';
import { badRequest } from '../../lib/errors';
import { getGradebook } from '../assessments/service';
import { summarizeGradebook } from '../assessments/summary';
import { listAssignmentInfos, requireStudent, requireTerm, requireYear } from '../_shared/owned';
import { currentYearId, getStudentDto, listNotes } from './service';
import { getSettings } from '../settings/service';

const { terms, assessments, assessmentResults, assessmentSkills, skills, subjects } = schema;

/** ملف الطالب: أداؤه في كل مواد شعبته للفصل المحدد، مهاراته، وملاحظاته */
export function buildStudentProfile(
  db: Db,
  ownerId: string,
  studentId: string,
  q: { yearId?: string; termId?: string },
  today: string = todayISO(),
): StudentProfileDto {
  requireStudent(db, ownerId, studentId);
  const yearId = q.yearId ?? currentYearId(db, ownerId);
  const student = getStudentDto(db, ownerId, studentId, yearId);
  const notes = listNotes(db, ownerId, studentId).slice(0, 30);

  if (!yearId) return { student, yearId: '', termId: null, subjects: [], skills: [], notes, overallPercent: null };
  requireYear(db, ownerId, yearId);

  const yearTerms = db.select().from(terms).where(and(eq(terms.ownerId, ownerId), eq(terms.yearId, yearId))).all();
  let term = pickCurrentTerm(yearTerms, today);
  if (q.termId) {
    const t = requireTerm(db, ownerId, q.termId);
    if (t.yearId !== yearId) throw badRequest('الفصل لا يتبع العام المحدد');
    term = t;
  }

  const subjectsSummary: StudentSubjectSummary[] = [];
  if (student.enrollment && term) {
    const grading = getSettings(db, ownerId).grading;
    for (const asg of listAssignmentInfos(db, ownerId, { sectionId: student.enrollment.sectionId })) {
      const gb = getGradebook(db, ownerId, asg.id, term.id);
      const summary = summarizeGradebook(gb);
      const mine = summary.students.find((s) => s.studentId === studentId);
      if (!mine) continue;
      const row = gb.students.find((s) => s.studentId === studentId)!;
      const recent = gb.assessments
        .filter((a) => row.results[a.id])
        .sort((a, b) => ((b.date ?? '') > (a.date ?? '') ? 1 : -1))
        .slice(0, 5)
        .map((a) => {
          const r = row.results[a.id]!;
          return { assessmentId: a.id, title: a.title, date: a.date, mode: a.mode, max: a.maxScore, score: r.score, level: r.level, status: r.status };
        });
      subjectsSummary.push({
        assignment: asg,
        termId: term.id,
        earned: mine.totals.earned,
        possible: mine.totals.possible,
        percent: mine.totals.percent,
        entered: mine.totals.entered,
        pending: mine.totals.pending,
        classAverage: summary.stats.mean,
        level: levelForPercent(mine.totals.percent, grading.bands)?.label ?? null,
        recent,
      });
    }
  }

  // مهارات الإتقان: متوسط مستوى الطالب لكل مهارة خلال العام
  const termIds = yearTerms.map((t) => t.id);
  const skillRows = termIds.length
    ? db
        .select({
          skillId: skills.id,
          title: skills.title,
          subjectName: subjects.name,
          level: assessmentResults.level,
        })
        .from(assessmentResults)
        .innerJoin(assessments, eq(assessments.id, assessmentResults.assessmentId))
        .innerJoin(assessmentSkills, eq(assessmentSkills.assessmentId, assessments.id))
        .innerJoin(skills, eq(skills.id, assessmentSkills.skillId))
        .innerJoin(subjects, eq(subjects.id, skills.subjectId))
        .where(
          and(
            eq(assessmentResults.studentId, studentId),
            eq(assessmentResults.ownerId, ownerId),
            eq(assessments.mode, 'mastery'),
            inArray(assessments.termId, termIds),
          ),
        )
        .all()
    : [];
  const bySkill = new Map<string, { title: string; subjectName: string; levels: number[] }>();
  for (const r of skillRows) {
    if (r.level === null) continue;
    const e = bySkill.get(r.skillId) ?? { title: r.title, subjectName: r.subjectName, levels: [] };
    e.levels.push(r.level);
    bySkill.set(r.skillId, e);
  }
  const skillSummary: StudentSkillSummary[] = [...bySkill.entries()]
    .map(([skillId, e]) => ({ skillId, title: e.title, subjectName: e.subjectName, average: masteryAverage(e.levels) ?? 0, count: e.levels.length }))
    .sort((a, b) => a.average - b.average);

  const percents = subjectsSummary.map((s) => s.percent).filter((p): p is number => p !== null);
  return {
    student,
    yearId,
    termId: term?.id ?? null,
    subjects: subjectsSummary,
    skills: skillSummary,
    notes,
    overallPercent: percents.length ? round(percents.reduce((a, b) => a + b, 0) / percents.length) : null,
  };
}

