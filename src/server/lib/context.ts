import type { FastifyRequest } from 'fastify';
import type { Db } from '../db/client';
import type { AuthUser } from '../types';
import { unauthorized } from './errors';

export type Ctx = { db: Db; ownerId: string; user: AuthUser; ip: string };

/** سياق الطلب المصادَق: قاعدة البيانات + معرّف المعلم الذي تُقيَّد به كل الاستعلامات */
export function getCtx(req: FastifyRequest): Ctx {
  if (!req.auth) throw unauthorized();
  return { db: req.server.db.orm, ownerId: req.auth.user.id, user: req.auth.user, ip: req.ip };
}
