import type { FastifyPluginAsync } from 'fastify';
import { updateSettingsSchema } from '../../../shared/schemas/settings';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import { getSettings, updateSettings } from './service';

export const settingsModule: FastifyPluginAsync = async (app) => {
  app.get('/settings', async (req) => {
    const { db, ownerId } = getCtx(req);
    return getSettings(db, ownerId);
  });

  app.patch('/settings', async (req) => {
    const { db, ownerId } = getCtx(req);
    return updateSettings(db, ownerId, parse(updateSettingsSchema, req.body));
  });
};
