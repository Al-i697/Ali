import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  classOverviewQuery,
  classSessionQuery,
  classStudentQuery,
  classSummaryQuery,
  createClassRecordSchema,
  fillRestSchema,
  setParticipationSchema,
  updateClassRecordSchema,
} from '../../../shared/schemas/classroom';
import { idSchema } from '../../../shared/schemas/common';
import { nowInZone } from '../../../shared/dates';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });

// المشاركة والسلوك بيانات حساسة عن قاصرين: لا يُكتب في سجل العمليات اسم طالب ولا سبب ولا ملاحظة، فقط نوع الحدث وأعداده.
// ولا يُسجَّل كل ضغط مشاركة (عشرات في الحصة) — تُسجَّل العمليات الجماعية وتسجيلات السلوك وحذفها.
export const classroomModule: FastifyPluginAsync = async (app) => {
  // «اليوم» بتوقيت المعلم المُعدّ في الخادم (لا بتوقيت العميل): لا تُدوَّن حصة لم تحن بعد
  const zoned = () => nowInZone(app.config.timezone);

  app.get('/class/overview', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { recent } = parse(classOverviewQuery, req.query);
    return svc.getOverview(db, ownerId, zoned(), recent);
  });

  app.get('/class/session', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getSession(db, ownerId, parse(classSessionQuery, req.query));
  });

  /** يضبط مشاركة طالب بالحالة المطلوبة (null/0/n): تكرار الطلب أو تأخره لا يفسد العدّ */
  app.put('/class/participation', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.setParticipation(db, ownerId, parse(setParticipationSchema, req.body), zoned().date);
  });

  app.post('/class/session/mark-rest', async (req) => {
    const { db, ownerId } = getCtx(req);
    const body = parse(fillRestSchema, req.body);
    const result = svc.fillRest(db, ownerId, body, zoned().date);
    audit(req, { action: 'class_session_filled', entityType: 'assignment', entityId: body.assignmentId, meta: { added: result.added } });
    return result;
  });

  app.delete('/class/session', async (req) => {
    const { db, ownerId } = getCtx(req);
    const q = parse(classSessionQuery, req.query);
    const cleared = svc.clearSession(db, ownerId, q);
    audit(req, { action: 'class_session_cleared', entityType: 'assignment', entityId: q.assignmentId, meta: cleared });
    return { ok: true, ...cleared };
  });

  app.post('/class/records', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const record = svc.addRecord(db, ownerId, parse(createClassRecordSchema, req.body), zoned().date);
    audit(req, { action: 'class_record_created', entityType: 'class_record', entityId: record.id, meta: { kind: record.kind } });
    return reply.code(201).send(record);
  });

  app.patch<{ Params: { id: string } }>('/class/records/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateRecord(db, ownerId, id, parse(updateClassRecordSchema, req.body));
  });

  app.delete<{ Params: { id: string } }>('/class/records/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const removed = svc.deleteRecord(db, ownerId, id);
    audit(req, { action: 'class_record_deleted', entityType: 'class_record', entityId: id, meta: { kind: removed.kind } });
    return { ok: true };
  });

  app.get('/class/summary', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getSummary(db, ownerId, parse(classSummaryQuery, req.query));
  });

  app.get<{ Params: { id: string } }>('/class/students/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.getStudentReport(db, ownerId, id, parse(classStudentQuery, req.query));
  });
};
