// سجل التدقيق: من فعل ماذا ومتى. لا نسجّل أسماء الطلاب أو الدرجات — فقط نوع الحدث والمعرّفات.
import type { FastifyRequest } from 'fastify';
import { schema, type Db } from '../db/client';

export type AuditEvent = {
  action: string;
  entityType?: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
  userId?: string | null;
  userEmail?: string | null;
};

export function writeAudit(db: Db, event: AuditEvent, ip?: string | null): void {
  try {
    db.insert(schema.auditLog)
      .values({
        action: event.action,
        entityType: event.entityType ?? null,
        entityId: event.entityId ?? null,
        meta: event.meta ?? null,
        userId: event.userId ?? null,
        userEmail: event.userEmail ?? null,
        ip: ip ?? null,
      })
      .run();
  } catch {
    // التدقيق لا يجوز أن يُفشل العملية الأساسية
  }
}

export function audit(req: FastifyRequest, event: Omit<AuditEvent, 'userId' | 'userEmail'>): void {
  writeAudit(
    req.server.db.orm,
    { ...event, userId: req.auth?.user.id ?? null, userEmail: req.auth?.user.email ?? null },
    req.ip,
  );
}
