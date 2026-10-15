import type { FastifyPluginAsync } from 'fastify';
import { setSlotSchema, timetableQuery } from '../../../shared/schemas/tasks';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

export const timetableModule: FastifyPluginAsync = async (app) => {
  app.get('/timetable', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getTimetable(db, ownerId, parse(timetableQuery, req.query).yearId);
  });

  /** وضع/إفراغ خانة واحدة — يُستدعى عند كل تعديل في الجدول فيُحفظ فورًا */
  app.put('/timetable/slot', async (req) => {
    const { db, ownerId } = getCtx(req);
    return { slot: svc.setSlot(db, ownerId, parse(setSlotSchema, req.body)) };
  });
};
