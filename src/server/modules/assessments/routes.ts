import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  assessmentsQuery,
  createAssessmentSchema,
  createSkillSchema,
  gradebookQuery,
  saveResultsSchema,
  updateAssessmentSchema,
  updateSkillSchema,
} from '../../../shared/schemas/assessments';
import { idSchema } from '../../../shared/schemas/common';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });
const forceQuery = z.object({ force: z.enum(['true', 'false']).optional() });
const copySchema = z.object({ assignmentIds: z.array(idSchema).min(1).max(30) });
const skillsQuery = z.object({
  subjectId: idSchema.optional(),
  includeArchived: z.enum(['true', 'false']).optional(),
});

export const assessmentsModule: FastifyPluginAsync = async (app) => {
  app.get('/assessments', async (req) => {
    const { db, ownerId } = getCtx(req);
    const q = parse(assessmentsQuery, req.query);
    return svc.listAssessments(db, ownerId, q.assignmentId, q.termId);
  });

  app.post('/assessments', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const a = svc.createAssessment(db, ownerId, parse(createAssessmentSchema, req.body));
    return reply.code(201).send(a);
  });

  app.get('/assessments/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getAssessment(db, ownerId, parse(idParam, req.params).id);
  });

  app.patch('/assessments/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateAssessment(db, ownerId, id, parse(updateAssessmentSchema, req.body));
  });

  app.delete('/assessments/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { force } = parse(forceQuery, req.query);
    svc.deleteAssessment(db, ownerId, id, force === 'true');
    audit(req, { action: 'assessment_deleted', entityType: 'assessment', entityId: id });
    return { ok: true };
  });

  app.post('/assessments/:id/copy', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { assignmentIds } = parse(copySchema, req.body);
    return reply.code(201).send(svc.copyAssessment(db, ownerId, id, assignmentIds));
  });

  /** رصد جماعي: يُستدعى تلقائيًا من شبكة الدرجات (حفظ تلقائي) */
  app.put('/assessments/:id/results', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.saveResults(db, ownerId, id, parse(saveResultsSchema, req.body));
  });

  app.get('/gradebook', async (req) => {
    const { db, ownerId } = getCtx(req);
    const q = parse(gradebookQuery, req.query);
    return svc.getGradebook(db, ownerId, q.assignmentId, q.termId);
  });

  // ───────── المهارات ─────────
  app.get('/skills', async (req) => {
    const { db, ownerId } = getCtx(req);
    const q = parse(skillsQuery, req.query);
    return svc.listSkills(db, ownerId, { subjectId: q.subjectId, includeArchived: q.includeArchived === 'true' });
  });

  app.post('/skills', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    return reply.code(201).send(svc.createSkill(db, ownerId, parse(createSkillSchema, req.body)));
  });

  app.patch('/skills/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateSkill(db, ownerId, id, parse(updateSkillSchema, req.body));
  });

  app.delete('/skills/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    svc.deleteSkill(db, ownerId, parse(idParam, req.params).id);
    return { ok: true };
  });
};
