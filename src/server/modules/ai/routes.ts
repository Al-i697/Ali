import type { FastifyPluginAsync } from 'fastify';
import { aiRunSchema, aiSettingsSchema } from '../../../shared/schemas/ai';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { AppError } from '../../lib/errors';
import { parse } from '../../lib/validate';
import * as svc from './service';

export const aiModule: FastifyPluginAsync = async (app) => {
  const admin = { config: { roles: ['admin' as const] } };

  /** حالة الميزة للمستخدم الحالي: هل هي جاهزة، ومن المزوّد، وكم تبقّى من حصته اليومية */
  app.get('/ai/status', async (req) => svc.status(app, getCtx(req)));

  /** تشغيل مهمة: المدخل نص المعلم فقط (بعد مراجعته في النافذة)، والرد «مقترح» لا يُحفظ آليًا */
  app.post('/ai/run', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req) => {
    const ctx = getCtx(req);
    const input = parse(aiRunSchema, req.body);
    return svc.runAi(app, ctx, input, (action, meta) => audit(req, { action, entityType: 'ai', meta }));
  });

  /** للمدير: حالة المزوّد والموافقة والاستخدام */
  app.get('/ai/settings', admin, async () => svc.settings(app));

  app.patch('/ai/settings', admin, async (req) => {
    const { db, user } = getCtx(req);
    const { enabled } = parse(aiSettingsSchema, req.body);
    if (enabled && !app.ai.configured) {
      throw new AppError(409, 'AI_NOT_CONFIGURED', 'لا مزوّد مضبوط على الخادم. اضبط AI_PROVIDER=anthropic وANTHROPIC_API_KEY في بيئة التشغيل ثم أعد تشغيل الخادم.');
    }
    svc.setAiEnabled(db, enabled, user.id);
    audit(req, { action: enabled ? 'ai_enabled' : 'ai_disabled', entityType: 'ai', meta: { provider: app.ai.info?.id ?? null } });
    return svc.settings(app);
  });
};
