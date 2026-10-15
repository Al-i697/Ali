import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { copyLabActivitySchema, createLabActivitySchema, labActivitiesQuery, updateLabActivitySchema } from '../../../shared/schemas/lab';
import { idSchema } from '../../../shared/schemas/common';
import { nowInZone } from '../../../shared/dates';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });

export const labModule: FastifyPluginAsync = async (app) => {
  // «اليوم» بتوقيت المعلم المُعدّ في الخادم (لا بتوقيت العميل) كي لا يختلف الحكم على تاريخ «نُفِّذ» بين الأجهزة
  const today = () => nowInZone(app.config.timezone).date;

  app.get('/lab-activities', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listLab(db, ownerId, parse(labActivitiesQuery, req.query), today());
  });

  app.post('/lab-activities', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const lab = svc.createLab(db, ownerId, parse(createLabActivitySchema, req.body), today());
    audit(req, { action: 'lab_activity_created', entityType: 'lab_activity', entityId: lab.id, meta: { kind: lab.kind, status: lab.status } });
    return reply.code(201).send(lab);
  });

  app.get<{ Params: { id: string } }>('/lab-activities/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getLab(db, ownerId, parse(idParam, req.params).id, today());
  });

  app.patch<{ Params: { id: string } }>('/lab-activities/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const body = parse(updateLabActivitySchema, req.body);
    const lab = svc.updateLab(db, ownerId, id, body, today());
    if (body.status) audit(req, { action: 'lab_activity_status', entityType: 'lab_activity', entityId: id, meta: { status: body.status } });
    return lab;
  });

  app.delete<{ Params: { id: string } }>('/lab-activities/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    svc.deleteLab(db, ownerId, id);
    audit(req, { action: 'lab_activity_deleted', entityType: 'lab_activity', entityId: id });
    return { ok: true };
  });

  app.post<{ Params: { id: string } }>('/lab-activities/:id/copy', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const created = svc.copyLab(db, ownerId, id, parse(copyLabActivitySchema, req.body), today());
    audit(req, { action: 'lab_activity_copied', entityType: 'lab_activity', entityId: id, meta: { copies: created.length } });
    return reply.code(201).send(created);
  });
};
