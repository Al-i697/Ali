import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { idSchema } from '../../../shared/schemas/common';
import { copyLessonSchema, createLessonSchema, lessonsQuery, updateLessonSchema } from '../../../shared/schemas/lessons';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });

export const lessonsModule: FastifyPluginAsync = async (app) => {
  app.get('/lessons', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listLessons(db, ownerId, parse(lessonsQuery, req.query));
  });

  app.post('/lessons', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    return reply.code(201).send(svc.createLesson(db, ownerId, parse(createLessonSchema, req.body)));
  });

  app.get('/lessons/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getLesson(db, ownerId, parse(idParam, req.params).id);
  });

  app.patch('/lessons/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateLesson(db, ownerId, id, parse(updateLessonSchema, req.body));
  });

  app.delete('/lessons/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    svc.deleteLesson(db, ownerId, parse(idParam, req.params).id);
    return { ok: true };
  });

  app.post('/lessons/:id/copy', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return reply.code(201).send(svc.copyLesson(db, ownerId, id, parse(copyLessonSchema, req.body)));
  });
};
