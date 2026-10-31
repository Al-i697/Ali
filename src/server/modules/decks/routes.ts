import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { DECK_LIMITS } from '../../../shared/constants';
import { idSchema } from '../../../shared/schemas/common';
import { createDeckSchema, decksQuery, updateDeckSchema } from '../../../shared/schemas/decks';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { AppError, badRequest } from '../../lib/errors';
import { parse } from '../../lib/validate';
import * as svc from './service';

const idParam = z.object({ id: idSchema });

/**
 * سياسة المحتوى المعزول. صفحة الدرس كود كتبه المعلم أو استورده، فلا تُنفَّذ أبدًا بصلاحيات التطبيق:
 *  • `sandbox` بلا allow-same-origin ⇒ أصل معتم: لا وصول لكوكي الجلسة ولا لتخزين التطبيق ولا لواجهته.
 *  • `connect-src 'none'` + `form-action 'none'` ⇒ لا تُرسل شيئًا لأي خادم.
 *  • السماح الوحيد خارجيًا: خطوط Google (CSS وملفات الخط فقط) لأن دروسنا تستعملها.
 * تُرسل على الاستجابة نفسها فتحمي حتى لو فُتح الرابط مباشرة لا داخل إطار.
 */
export const DECK_CONTENT_CSP = [
  'sandbox allow-scripts allow-downloads',
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  'font-src data: https://fonts.gstatic.com',
  'img-src data: blob:',
  'media-src data: blob:',
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join('; ');

/** حقول النموذج النصية + ملف الصفحة. الحقول تسبق الملف في الطلب فتكون جاهزة حين يُقرأ */
async function readUpload(req: FastifyRequest) {
  if (!req.isMultipart()) throw badRequest('أرسل الملف بصيغة multipart/form-data');
  const file = await req.file({ limits: { fileSize: DECK_LIMITS.maxBytes, files: 1, fields: 6 } });
  if (!file) throw badRequest('لم يُرفع أي ملف');
  const buffer = await file.toBuffer();
  if (file.file.truncated) throw new AppError(413, 'TOO_LARGE', `حجم الدرس أكبر من ${DECK_LIMITS.maxBytes / (1024 * 1024)} ميغابايت`);
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(file.fields)) {
    const part = Array.isArray(v) ? v[0] : v;
    if (part && 'value' in part && typeof part.value === 'string') fields[k] = part.value;
  }
  return { html: svc.readDeckHtml(buffer, file.filename), fields };
}

export const decksModule: FastifyPluginAsync = async (app) => {
  app.get('/decks', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listDecks(db, ownerId, parse(decksQuery, req.query));
  });

  app.get('/decks/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.getDeck(db, ownerId, parse(idParam, req.params).id);
  });

  app.post('/decks', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { html, fields } = await readUpload(req);
    const input = parse(createDeckSchema, {
      title: fields.title ?? '',
      description: fields.description || null,
      subjectId: fields.subjectId || null,
    });
    const deck = svc.createDeck(db, ownerId, input, html);
    audit(req, { action: 'deck_created', entityType: 'interactive_deck', entityId: deck.id, meta: { bytes: deck.bytes } });
    return reply.code(201).send(deck);
  });

  app.patch('/decks/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const deck = svc.updateDeck(db, ownerId, id, parse(updateDeckSchema, req.body));
    audit(req, { action: 'deck_updated', entityType: 'interactive_deck', entityId: id });
    return deck;
  });

  app.put('/decks/:id/file', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    const { html } = await readUpload(req);
    const deck = svc.replaceDeckHtml(db, ownerId, id, html);
    audit(req, { action: 'deck_file_replaced', entityType: 'interactive_deck', entityId: id, meta: { bytes: deck.bytes } });
    return deck;
  });

  app.delete('/decks/:id', async (req) => {
    const { db, ownerId } = getCtx(req);
    const { id } = parse(idParam, req.params);
    svc.deleteDeck(db, ownerId, id);
    audit(req, { action: 'deck_deleted', entityType: 'interactive_deck', entityId: id });
    return { ok: true };
  });

  // صفحة الدرس نفسها للإطار المعزول. المصادقة بالكوكي كسائر /api؛ ومعلم آخر يتلقى 404
  app.get('/decks/:id/content', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const { html } = svc.getDeckHtml(db, ownerId, parse(idParam, req.params).id);
    return reply
      .header('content-security-policy', DECK_CONTENT_CSP)
      .header('x-frame-options', 'SAMEORIGIN')
      .type('text/html; charset=utf-8')
      .send(html);
  });
};
