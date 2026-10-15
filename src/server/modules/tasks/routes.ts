import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { idSchema } from '../../../shared/schemas/common';
import { calendarQuery, createTaskSchema, tasksQuery, updateTaskSchema } from '../../../shared/schemas/tasks';
import { diffDays } from '../../../shared/dates';
import { getCtx } from '../../lib/context';
import { badRequest } from '../../lib/errors';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });

export const tasksModule: FastifyPluginAsync = async (app) => {
  app.get('/tasks', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listTasks(db, ownerId, parse(tasksQuery, req.query));
  });

  app.post('/tasks', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    return reply.code(201).send(svc.createTask(db, ownerId, parse(createTaskSchema, req.body)));
  });

  app.patch('/tasks/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    return svc.updateTask(db, ownerId, id, parse(updateTaskSchema, req.body));
  });

  app.delete('/tasks/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    svc.deleteTask(db, ownerId, parse(idParam, req.params).id);
    return { ok: true };
  });

  app.get('/calendar', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { from, to } = parse(calendarQuery, req.query);
    if (to < from || diffDays(from, to) > 400) throw badRequest('نطاق التاريخ غير صالح');
    return svc.calendar(db, ownerId, from, to);
  });
};
