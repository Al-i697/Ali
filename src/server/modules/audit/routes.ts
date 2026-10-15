import type { FastifyPluginAsync } from 'fastify';
import { count, desc } from 'drizzle-orm';
import { z } from 'zod';
import type { AuditEntryDto } from '../../../shared/dto';
import { schema } from '../../db/client';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';

const query = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

/** سجل العمليات — للمدير فقط. يسجّل من فعل ماذا ومتى (بلا أسماء طلاب أو درجات) */
export const auditModule: FastifyPluginAsync = async (app) => {
  app.get('/audit', { config: { roles: ['admin'] } }, async (req) => {
    const { db } = getCtx(req);
    const q = parse(query, req.query);
    const rows = db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.id)).limit(q.limit).offset(q.offset).all();
    const total = db.select({ c: count() }).from(schema.auditLog).get()?.c ?? 0;
    const items: AuditEntryDto[] = rows.map((r) => ({
      id: r.id,
      at: r.at,
      userEmail: r.userEmail,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      ip: r.ip,
      meta: r.meta,
    }));
    return { items, total };
  });
};
