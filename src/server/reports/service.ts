import type { FastifyInstance } from 'fastify';
import type { ReportType } from '../../shared/constants';
import { nowInZone } from '../../shared/dates';
import type { ReportQuery } from '../../shared/schemas/reports';
import { badRequest } from '../lib/errors';
import { getSettings } from '../modules/settings/service';
import {
  buildClassAnalysis,
  buildClassGradebook,
  buildClassSectionReport,
  buildClassStudentReport,
  buildLabLog,
  buildLessonPlan,
  buildLessonsLog,
  buildStudentReport,
  buildSupportPlans,
  type BuildCtx,
} from './builders';
import { renderReportHtml } from './html';
import type { Branding, ReportDoc } from './types';
import { reportToXlsx } from './xlsx';

export function buildReport(app: FastifyInstance, ownerId: string, type: ReportType, q: ReportQuery): { doc: ReportDoc; brand: Branding } {
  const db = app.db.orm;
  const settings = getSettings(db, ownerId);
  const zoned = nowInZone(app.config.timezone);
  const ctx: BuildCtx = { db, ownerId, settings, today: zoned.date, now: new Date().toISOString() };
  const brand: Branding = {
    schoolName: settings.profile.schoolName,
    directorate: settings.profile.directorate,
    teacherName: settings.profile.fullName,
    jobTitle: settings.profile.jobTitle,
    specialization: settings.profile.specialization,
    seniorTeacherName: settings.profile.seniorTeacherName,
    principalName: settings.profile.principalName,
    digits: settings.preferences.digits,
  };

  const need = (value: string | undefined, label: string): string => {
    if (!value) throw badRequest(`حدّد ${label}`, 'MISSING_PARAM', { [label]: 'مطلوب' });
    return value;
  };

  let doc: ReportDoc;
  switch (type) {
    case 'class-gradebook':
      doc = buildClassGradebook(ctx, { assignmentId: need(q.assignmentId, 'الشعبة والمادة'), termId: need(q.termId, 'الفصل') });
      break;
    case 'class-analysis':
      doc = buildClassAnalysis(ctx, { assignmentId: need(q.assignmentId, 'الشعبة والمادة'), termId: need(q.termId, 'الفصل') });
      break;
    case 'student':
      doc = buildStudentReport(ctx, { studentId: need(q.studentId, 'الطالب'), termId: q.termId, includeNotes: q.includeNotes, includeGuardian: q.includeGuardian });
      break;
    case 'lessons':
      doc = buildLessonsLog(ctx, { from: q.from, to: q.to, assignmentId: q.assignmentId });
      break;
    case 'lesson-plan':
      doc = buildLessonPlan(ctx, { lessonId: q.lessonId, from: q.from, to: q.to, assignmentId: q.assignmentId });
      break;
    case 'support-plans':
      doc = buildSupportPlans(ctx, { planId: q.planId, assignmentId: q.assignmentId, from: q.from, to: q.to, kind: q.kind, status: q.status });
      break;
    case 'lab-log':
      doc = buildLabLog(ctx, { labId: q.labId, assignmentId: q.assignmentId, from: q.from, to: q.to, all: q.labAll, kind: q.labKind, status: q.labStatus });
      break;
    case 'class-student':
      doc = buildClassStudentReport(ctx, { studentId: need(q.studentId, 'الطالب'), assignmentId: q.assignmentId, from: q.from, to: q.to, all: q.classAll, includeNotes: q.includeNotes, includeGuardian: q.includeGuardian });
      break;
    case 'class-section':
      doc = buildClassSectionReport(ctx, { assignmentId: need(q.assignmentId, 'الشعبة والمادة'), from: q.from, to: q.to, all: q.classAll });
      break;
  }
  return { doc, brand };
}

export function reportHtml(app: FastifyInstance, doc: ReportDoc, brand: Branding): string {
  return renderReportHtml(doc, brand, app.config.assetsDir);
}

export async function reportPdf(app: FastifyInstance, doc: ReportDoc, brand: Branding): Promise<Buffer> {
  return app.pdf.render(reportHtml(app, doc, brand), { landscape: false });
}

export { reportToXlsx };
