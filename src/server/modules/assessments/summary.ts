// تجميع دفتر الدرجات: مجاميع الطلاب ونسبهم وإحصاءات التقويمات — يعتمد على الدوال المشتركة نفسها التي تعمل في الواجهة.
import type { AssessmentDto, GradebookDto } from '../../../shared/dto';
import {
  computeStudentTotals,
  distributionStats,
  levelForPercent,
  masteryAverage,
  round,
  supportFlag,
  totalWeight,
  type AssessmentLite,
  type DistributionStats,
  type ResultLite,
  type StudentTotals,
  type SupportFlag,
} from '../../../shared/gradebook';
import type { GradeBand } from '../../../shared/constants';

export const toLite = (a: AssessmentDto): AssessmentLite => ({
  id: a.id,
  mode: a.mode,
  maxScore: a.maxScore,
  weight: a.weight,
  countsTowardTotal: a.countsTowardTotal,
});

export type StudentSummary = {
  studentId: string;
  rollNo: number;
  fullName: string;
  studentNumber: string | null;
  totals: StudentTotals;
  level: GradeBand | null;
  flag: SupportFlag;
  masteryAverage: number | null;
};

export type AssessmentStat = {
  assessmentId: string;
  mean: number | null;
  meanPercent: number | null;
  min: number | null;
  max: number | null;
  entered: number;
  missing: number;
};

export type GradebookSummary = {
  students: StudentSummary[];
  stats: DistributionStats;
  assessmentStats: AssessmentStat[];
  totalWeight: number;
};

export function summarizeGradebook(gb: GradebookDto): GradebookSummary {
  const lites = gb.assessments.map(toLite);
  const masteryIds = gb.assessments.filter((a) => a.mode === 'mastery').map((a) => a.id);

  const students: StudentSummary[] = gb.students.map((s) => {
    const results: Record<string, ResultLite> = {};
    for (const [aid, r] of Object.entries(s.results)) if (r) results[aid] = r;
    const totals = computeStudentTotals(lites, results);
    return {
      studentId: s.studentId,
      rollNo: s.rollNo,
      fullName: s.fullName,
      studentNumber: s.studentNumber,
      totals,
      level: levelForPercent(totals.percent, gb.grading.bands),
      flag: supportFlag(totals.percent, gb.grading),
      masteryAverage: masteryAverage(masteryIds.map((id) => s.results[id]?.level)),
    };
  });

  const assessmentStats: AssessmentStat[] = gb.assessments.map((a) => {
    const vals: number[] = [];
    let missing = 0;
    for (const s of gb.students) {
      const r = s.results[a.id];
      if (!r) {
        missing++;
        continue;
      }
      if (r.status !== 'graded') continue;
      const v = a.mode === 'score' ? r.score : r.level;
      if (v === null || v === undefined) missing++;
      else vals.push(v);
    }
    const mean = vals.length ? round(vals.reduce((x, y) => x + y, 0) / vals.length) : null;
    return {
      assessmentId: a.id,
      mean,
      meanPercent: mean !== null && a.mode === 'score' && a.maxScore ? round((mean / a.maxScore) * 100) : null,
      min: vals.length ? Math.min(...vals) : null,
      max: vals.length ? Math.max(...vals) : null,
      entered: vals.length,
      missing,
    };
  });

  return {
    students,
    stats: distributionStats(students.map((s) => s.totals.percent), gb.grading),
    assessmentStats,
    totalWeight: totalWeight(lites),
  };
}
