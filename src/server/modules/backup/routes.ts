import fs from 'node:fs';
import path from 'node:path';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { LIMITS } from '../../../shared/constants';
import { audit } from '../../lib/audit';
import { AppError, badRequest } from '../../lib/errors';
import { parse } from '../../lib/validate';

const nameParam = z.object({ name: z.string().min(1).max(120) });
const confirmSchema = z.object({ confirm: z.literal(true, { error: 'أكّد الاستعادة صراحةً' }) });

/** النسخ الاحتياطي — للمدير فقط لأن القاعدة تحوي بيانات كل المعلمين */
export const backupModule: FastifyPluginAsync = async (app) => {
  const svc = app.backups;

  const admin = { config: { roles: ['admin' as const] } };

  app.get('/backups', admin, async () => ({
    items: svc.list(),
    settings: { encrypted: svc.encrypted, intervalHours: app.config.backupIntervalHours, keep: app.config.backupKeep },
  }));

  app.post('/backups', { ...admin, config: { roles: ['admin' as const], rateLimit: { max: 20, timeWindow: '1 hour' } } }, async (req, reply) => {
    const b = await svc.create('manual');
    audit(req, { action: 'backup_created', entityType: 'backup', entityId: b.name });
    return reply.code(201).send(b);
  });

  app.get<{ Params: { name: string } }>('/backups/:name/download', admin, async (req, reply) => {
    const { name } = parse(nameParam, req.params);
    const file = svc.resolve(name);
    audit(req, { action: 'backup_downloaded', entityType: 'backup', entityId: name });
    return reply
      .header('content-disposition', `attachment; filename="${name}"`)
      .type('application/octet-stream')
      .send(fs.createReadStream(file));
  });

  app.delete<{ Params: { name: string } }>('/backups/:name', admin, async (req) => {
    const { name } = parse(nameParam, req.params);
    svc.delete(name);
    audit(req, { action: 'backup_deleted', entityType: 'backup', entityId: name });
    return { ok: true };
  });

  /** استعادة من نسخة محفوظة على الخادم */
  app.post<{ Params: { name: string } }>('/backups/:name/restore', { config: { roles: ['admin' as const], rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (req) => {
    const { name } = parse(nameParam, req.params);
    parse(confirmSchema, req.body);
    const file = svc.resolve(name);
    const res = await svc.restoreFrom(file);
    // بعد الاستعادة قد لا توجد جلسة المدير الحالية في القاعدة المستعادة
    audit(req, { action: 'backup_restored', entityType: 'backup', entityId: name, meta: { safety: res.safety } });
    return { ok: true, ...res };
  });

  /** استعادة من ملف يرفعه المدير (من جهازه) */
  app.post('/backups/restore-upload', { config: { roles: ['admin' as const], rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (req) => {
    if (!req.isMultipart()) throw badRequest('أرفق ملف النسخة الاحتياطية');
    const upload = await req.file({ limits: { fileSize: LIMITS.backupMaxBytes, files: 1 } });
    if (!upload) throw badRequest('لم يُرفع أي ملف');
    const dir = path.join(app.config.backupDir);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const tmp = path.join(dir, `upload-${Date.now()}.tmp`);
    try {
      await new Promise<void>((resolve, reject) => {
        const out = fs.createWriteStream(tmp, { mode: 0o600 });
        upload.file.pipe(out);
        out.on('finish', resolve);
        out.on('error', reject);
        upload.file.on('error', reject);
      });
      if (upload.file.truncated) throw new AppError(413, 'TOO_LARGE', 'حجم الملف أكبر من المسموح');
      const res = await svc.restoreFrom(tmp);
      audit(req, { action: 'backup_restored_upload', meta: { safety: res.safety } });
      return { ok: true, ...res };
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  });

};
