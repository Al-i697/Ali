import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  bulkSupportPlansSchema,
  createSupportPlanSchema,
  supportNoteSchema,
  supportPlansQuery,
  supportSuggestionsQuery,
  updateSupportNoteSchema,
  updateSupportPlanSchema,
} from '../../../shared/schemas/support';
import { idSchema } from '../../../shared/schemas/common';
import { nowInZone } from '../../../shared/dates';
import { audit } from '../../lib/audit';
import { badRequest } from '../../lib/errors';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });
const noteParams = z.object({ id: idSchema, noteId: idSchema });

export const supportModule: FastifyPluginAsync = async (app) => {
  // «اليوم» بتوقيت الخادم المُعدّ (Asia/Muscat افتراضيًا) لا بتوقيت الجهاز
  const today = () => nowInZone(app.config.timezone).date;

  app.get('/support-plans', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listPlans(db, ownerId, parse(supportPlansQuery, req.query), today());
  });

  /** طلاب دون حد العلاج (أو فوق حد الإثراء) بلا خطة مفتوحة — لإنشاء الخطط بنقرة */
  app.get('/support-plans/suggestions', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.suggestions(db, ownerId, parse(supportSuggestionsQuery, req.query), today());
  });

  app.post('/support-plans', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const body = parse(createSupportPlanSchema, req.body);
    if (!body.assignmentId) throw badRequest('اختر المقرر (الشعبة والمادة) الذي تتعلق به الخطة', 'VALIDATION_ERROR', { assignmentId: 'مطلوب' });
    const plan = svc.createPlan(db, ownerId, { ...body, assignmentId: body.assignmentId }, today());
    audit(req, { action: 'support_plan_created', entityType: 'support_plan', entityId: plan.id, meta: { kind: plan.kind } });
    return reply.code(201).send(plan);
  });

  app.post('/support-plans/bulk', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const res = svc.bulkCreate(db, ownerId, parse(bulkSupportPlansSchema, req.body), today());
    audit(req, { action: 'support_plans_bulk_created', entityType: 'support_plan', meta: { created: res.created.length, skipped: res.skipped } });
    return reply.code(201).send(res);
  });

  app.get<{ Params: { id: string } }>('/support-plans/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getPlan(db, ownerId, parse(idParam, req.params).id, today());
  });

  app.patch<{ Params: { id: string } }>('/support-plans/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const body = parse(updateSupportPlanSchema, req.body);
    const plan = svc.updatePlan(db, ownerId, id, body, today());
    if (body.status) audit(req, { action: 'support_plan_status', entityType: 'support_plan', entityId: id, meta: { status: body.status } });
    return plan;
  });

  app.delete<{ Params: { id: string } }>('/support-plans/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    svc.deletePlan(db, ownerId, id);
    audit(req, { action: 'support_plan_deleted', entityType: 'support_plan', entityId: id });
    return { ok: true };
  });

  // ───────── ملاحظات المتابعة ─────────
  app.post<{ Params: { id: string } }>('/support-plans/:id/notes', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return reply.code(201).send(svc.addNote(db, ownerId, id, parse(supportNoteSchema, req.body)));
  });

  app.patch<{ Params: { id: string; noteId: string } }>('/support-plans/:id/notes/:noteId', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id, noteId } = parse(noteParams, req.params);
    return svc.updateNote(db, ownerId, id, noteId, parse(updateSupportNoteSchema, req.body));
  });

  app.delete<{ Params: { id: string; noteId: string } }>('/support-plans/:id/notes/:noteId', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id, noteId } = parse(noteParams, req.params);
    svc.deleteNote(db, ownerId, id, noteId);
    return { ok: true };
  });
};
