import type { FastifyPluginAsync } from 'fastify';
import { nowInZone } from '../../../shared/dates';
import { getCtx } from '../../lib/context';
import { buildDashboard } from './service';

export const dashboardModule: FastifyPluginAsync = async (app) => {
  app.get('/dashboard', async (req) => {
    const { db, ownerId } = getCtx(req);
    return buildDashboard(db, ownerId, nowInZone(app.config.timezone));
  });
};
