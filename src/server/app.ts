import fs from 'node:fs';
import path from 'node:path';
import Fastify, { type FastifyError, type FastifyInstance, type RouteOptions } from 'fastify';
import cookie from '@fastify/cookie';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { ZodError } from 'zod';
import { CLIENT_HEADER, CLIENT_HEADER_VALUE, LIMITS } from '../shared/constants';
import { installArabicZod } from '../shared/schemas/common';
import type { AppConfig } from './config';
import { createAnthropicProvider } from './ai/anthropic';
import { AiService, type AiProvider } from './ai/provider';
import { AppDatabase } from './db/client';
import { AppError, forbidden, unauthorized, validationError } from './lib/errors';
import { readSession } from './lib/session';
import { BackupService } from './modules/backup/service';
import { registerModules } from './modules';
import { PdfService } from './reports/pdf';
import './types';

export type BuildOptions = {
  config: AppConfig;
  /** قاعدة بيانات جاهزة (للاختبارات). إن لم تُمرَّر تُفتح من الإعدادات وتُطبَّق الهجرات */
  db?: AppDatabase;
  /** يُستدعى لكل مسار يُسجَّل — لتوليد التوثيق وفحوص الأمان الشاملة (لا يُستعمل في التشغيل العادي) */
  onRoute?: (route: RouteOptions) => void;
  /** مزوّد مساعد جاهز (للاختبارات). إن لم يُمرَّر يُنشأ من إعدادات AI_* إن كانت مضبوطة */
  aiProvider?: AiProvider;
};

export const sessionCookieName = (config: Pick<AppConfig, 'cookieSecure'>) =>
  config.cookieSecure ? '__Host-sijilli_sid' : 'sijilli_sid';

function loggerOptions(config: AppConfig) {
  if (config.env === 'test') return false;
  return {
    level: config.logLevel,
    redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
    ...(config.env === 'development'
      ? { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } }
      : {}),
  };
}

export async function buildApp(opts: BuildOptions): Promise<FastifyInstance> {
  const { config } = opts;
  installArabicZod();

  const app = Fastify({
    logger: loggerOptions(config),
    trustProxy: config.trustProxy,
    bodyLimit: 2 * 1024 * 1024,
    routerOptions: { maxParamLength: 200 },
  });

  if (opts.onRoute) app.addHook('onRoute', opts.onRoute);

  const db = opts.db ?? AppDatabase.open(config.databaseFile);
  const backups = new BackupService(db, config, app.log);
  if (!opts.db) {
    // قبل تطبيق أي هجرة على بيانات موجودة نأخذ نسخة أمان — الترقية لا تُجرى على بيانات بلا شبكة أمان
    if (db.pendingMigrations(config.migrationsDir) > 0 && db.hasUserData()) {
      const b = await backups.create('pre-migration');
      app.log.info({ backup: b.name }, 'pre-migration backup created');
    }
    db.migrate(config.migrationsDir);
  }

  app.decorate('config', config);
  app.decorate('db', db);
  app.decorate('pdf', new PdfService(config));
  app.decorate('backups', backups);
  const ai = new AiService({ maxConcurrency: config.ai.maxConcurrency, perMinute: config.ai.perMinute });
  if (opts.aiProvider) ai.register(opts.aiProvider);
  else if (config.ai.provider === 'anthropic' && config.ai.apiKey) {
    ai.register(createAnthropicProvider({ apiKey: config.ai.apiKey, baseUrl: config.ai.baseUrl, model: config.ai.model, effort: config.ai.effort, timeoutMs: config.ai.timeoutMs }));
  }
  app.decorate('ai', ai);
  app.decorateRequest('auth', null);

  app.addHook('onReady', async () => backups.start());
  app.addHook('onClose', async () => {
    backups.stop();
    await app.pdf.close();
    if (!opts.db) db.close();
  });

  // ───────── الأمان: ترويسات المتصفح ─────────
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'no-referrer' },
    hsts: config.cookieSecure ? { maxAge: 15_552_000, includeSubDomains: true } : false,
  });

  app.addHook('onSend', async (req, reply, payload) => {
    reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    // بيانات الطلاب لا تُخزَّن مؤقتًا في المتصفحات أو الوسطاء
    if (req.url.startsWith('/api/')) reply.header('cache-control', 'no-store');
    return payload;
  });

  await app.register(compress, { threshold: 1024 });
  await app.register(cookie);
  await app.register(rateLimit, {
    global: true,
    max: config.env === 'test' ? 100_000 : 600,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, ctx) => {
      const err = new AppError(429, 'TOO_MANY_REQUESTS', 'طلبات كثيرة جدًا. انتظر قليلًا ثم حاول مجددًا');
      (err as AppError & { retryAfter?: string }).retryAfter = ctx.after;
      return err;
    },
  });
  await app.register(multipart, { limits: { fileSize: LIMITS.backupMaxBytes, files: 1, fields: 10 } });

  // ───────── حماية CSRF: رأس مخصص + فحص Origin لكل طلب يغيّر البيانات ─────────
  const allowedHosts = new Set<string>();
  if (config.appUrl) allowedHosts.add(new URL(config.appUrl).host);
  app.addHook('onRequest', async (req) => {
    if (!req.url.startsWith('/api/')) return;
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
    if (req.headers[CLIENT_HEADER] !== CLIENT_HEADER_VALUE) throw forbidden('طلب غير مصرّح به');
    const origin = req.headers.origin;
    if (origin && origin !== 'null') {
      let originUrl: URL;
      try {
        originUrl = new URL(origin);
      } catch {
        throw forbidden('طلب غير مصرّح به');
      }
      // نطبّع Host بنفس بروتوكول Origin ليتساوى حذف المنفذ الافتراضي (:80/:443) في الطرفين
      const hostHeader = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '');
      let requestHost = '';
      try {
        requestHost = new URL(`${originUrl.protocol}//${hostHeader}`).host;
      } catch {
        /* يبقى فارغًا فيفشل التطابق */
      }
      if (originUrl.host !== requestHost && !allowedHosts.has(originUrl.host)) throw forbidden('طلب غير مصرّح به');
    }
  });

  // ───────── المصادقة ─────────
  const cookieName = sessionCookieName(config);
  app.addHook('preHandler', async (req) => {
    if (!req.url.startsWith('/api/')) return;
    const cfg = req.routeOptions.config ?? {};
    const token = req.cookies[cookieName];
    req.auth = token ? readSession(db.orm, token, config) : null;
    if (cfg.public) return;
    if (!req.auth) throw unauthorized();
    if (req.auth.user.mustChangePassword && !cfg.allowMustChange)
      throw new AppError(403, 'PASSWORD_CHANGE_REQUIRED', 'يجب تغيير كلمة المرور قبل المتابعة');
    if (cfg.roles && !cfg.roles.includes(req.auth.user.role)) throw forbidden();
  });

  // ───────── معالجة الأخطاء ─────────
  app.setErrorHandler((error: FastifyError | AppError | ZodError, req, reply) => {
    if (error instanceof ZodError) error = validationError(error);
    if (error instanceof AppError) {
      const retryAfter = (error as AppError & { retryAfter?: string }).retryAfter;
      if (retryAfter) reply.header('retry-after', retryAfter);
      return reply.code(error.status).send({
        error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) },
      });
    }
    const fe = error as FastifyError;
    if (fe.statusCode === 429) {
      return reply.code(429).send({
        error: { code: 'TOO_MANY_REQUESTS', message: 'طلبات كثيرة جدًا. انتظر قليلًا ثم حاول مجددًا' },
      });
    }
    if (fe.statusCode === 413 || fe.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.code(413).send({ error: { code: 'TOO_LARGE', message: 'حجم الملف أكبر من المسموح' } });
    }
    if (fe.statusCode && fe.statusCode >= 400 && fe.statusCode < 500) {
      return reply.code(fe.statusCode).send({
        error: { code: 'BAD_REQUEST', message: 'الطلب غير صالح' },
      });
    }
    req.log.error({ err: error }, 'unhandled error');
    return reply
      .code(500)
      .send({ error: { code: 'INTERNAL', message: 'حدث خطأ غير متوقع. حاول مرة أخرى' } });
  });

  // ───────── الواجهات البرمجية ─────────
  await app.register(registerModules, { prefix: '/api' });
  app.all('/api/*', async (_req, reply) =>
    reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'المسار غير موجود' } }),
  );

  // ───────── الواجهة (SPA) ─────────
  const indexFile = path.join(config.webRoot, 'index.html');
  if (fs.existsSync(indexFile)) {
    const indexHtml = fs.readFileSync(indexFile);
    await app.register(fastifyStatic, {
      root: config.webRoot,
      wildcard: false,
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.header('cache-control', 'public, max-age=31536000, immutable');
        } else {
          res.header('cache-control', 'no-cache');
        }
      },
    });
    app.setNotFoundHandler(async (req, reply) => {
      if (req.method !== 'GET' || req.url.startsWith('/api/')) {
        return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'المسار غير موجود' } });
      }
      return reply.type('text/html; charset=utf-8').header('cache-control', 'no-cache').send(indexHtml);
    });
  }

  return app;
}
