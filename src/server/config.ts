// إعدادات التشغيل من متغيرات البيئة (مع تحقق صارم عند البدء).
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import pkg from '../../package.json' with { type: 'json' };

export const VERSION: string = pkg.version;

const here = path.dirname(fileURLToPath(import.meta.url));

export type ScryptParams = { N: number; r: number; p: number };

/** المساعد الذكي: معطّل ما لم يُضبط AI_PROVIDER ومفتاحه، ويبقى بعدها بحاجة إلى موافقة المدير من الإعدادات */
export type AiConfig = {
  provider: 'none' | 'anthropic';
  apiKey: string | null;
  baseUrl: string | null;
  model: string;
  effort: 'low' | 'medium' | 'high';
  timeoutMs: number;
  dailyLimit: number;
  perMinute: number;
  maxConcurrency: number;
};

export type AppConfig = {
  env: 'development' | 'production' | 'test';
  host: string;
  port: number;
  dataDir: string;
  databaseFile: string;
  backupDir: string;
  backupIntervalHours: number;
  backupKeep: number;
  backupPassphrase: string | null;
  appUrl: string | null;
  trustProxy: boolean;
  cookieSecure: boolean;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  chromiumPath: string | null;
  pdfNoSandbox: boolean;
  timezone: string;
  webRoot: string;
  migrationsDir: string;
  assetsDir: string;
  scrypt: ScryptParams;
  /** حد الطلبات العام لكل عنوان IP في الدقيقة */
  rateLimitPerMinute: number;
  sessionHours: number;
  rememberDays: number;
  ai: AiConfig;
  version: string;
};

const bool = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'boolean' ? v : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATA_DIR: z.string().default('./data'),
  DATABASE_FILE: z.string().optional(),
  BACKUP_DIR: z.string().optional(),
  BACKUP_INTERVAL_HOURS: z.coerce.number().min(0).default(24),
  BACKUP_KEEP: z.coerce.number().int().min(1).max(365).default(14),
  BACKUP_PASSPHRASE: z.string().optional(),
  APP_URL: z.string().url().optional().or(z.literal('')),
  TRUST_PROXY: bool.default(false),
  COOKIE_SECURE: z.enum(['auto', 'true', 'false']).default('auto'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CHROMIUM_PATH: z.string().optional(),
  PDF_NO_SANDBOX: bool.default(false),
  TZ_NAME: z.string().default('Asia/Muscat'),
  WEB_ROOT: z.string().optional(),
  SCRYPT_LOG_N: z.coerce.number().int().min(10).max(20).optional(),
  // حد الطلبات العام لكل IP في الدقيقة. ارفعه إن كان كل المستخدمين يظهرون بعنوان واحد (وكيل عكسي بلا TRUST_PROXY، أو شبكة مدرسة خلف NAT)
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(60).max(1_000_000).default(600),
  // ── المساعد الذكي (اختياري، معطّل افتراضيًا) ──
  AI_PROVIDER: z.enum(['none', 'anthropic']).default('none'),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().url().optional().or(z.literal('')),
  AI_MODEL: z.string().trim().min(1).default('claude-opus-5-5'),
  AI_EFFORT: z.enum(['low', 'medium', 'high']).default('low'),
  AI_TIMEOUT_MS: z.coerce.number().int().min(5_000).max(300_000).default(90_000),
  AI_DAILY_LIMIT: z.coerce.number().int().min(1).max(10_000).default(30),
  AI_RATE_PER_MINUTE: z.coerce.number().int().min(1).max(120).default(6),
  AI_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(3),
});

function firstExisting(candidates: (string | undefined)[], what: string): string {
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  // نعيد أول مرشح غير فارغ ليظهر في رسالة الخطأ لاحقًا (قد لا يكون مطلوبًا في الاختبارات)
  return candidates.find(Boolean) ?? path.join(here, what);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`);
    throw new Error(`إعدادات البيئة غير صالحة:\n${lines.join('\n')}`);
  }
  const e = parsed.data;
  if (e.AI_PROVIDER === 'anthropic' && !e.ANTHROPIC_API_KEY?.trim()) {
    throw new Error('إعدادات البيئة غير صالحة:\n  • AI_PROVIDER=anthropic يتطلب ضبط ANTHROPIC_API_KEY (أو اجعل AI_PROVIDER=none)');
  }
  const dataDir = path.resolve(e.DATA_DIR);
  const appUrl = e.APP_URL ? e.APP_URL.replace(/\/+$/, '') : null;
  const cookieSecure =
    e.COOKIE_SECURE === 'auto' ? Boolean(appUrl?.startsWith('https://')) : e.COOKIE_SECURE === 'true';
  // تكلفة scrypt: 2^16 في الإنتاج (64MiB)، وأقل في الاختبارات لتسريعها
  const logN = e.SCRYPT_LOG_N ?? (e.NODE_ENV === 'test' ? 10 : 16);

  return {
    env: e.NODE_ENV,
    host: e.HOST,
    port: e.PORT,
    dataDir,
    databaseFile: path.resolve(e.DATABASE_FILE ?? path.join(dataDir, 'sijilli.sqlite')),
    backupDir: path.resolve(e.BACKUP_DIR ?? path.join(dataDir, 'backups')),
    backupIntervalHours: e.BACKUP_INTERVAL_HOURS,
    backupKeep: e.BACKUP_KEEP,
    backupPassphrase: e.BACKUP_PASSPHRASE ? e.BACKUP_PASSPHRASE : null,
    appUrl,
    trustProxy: e.TRUST_PROXY,
    cookieSecure,
    logLevel: e.LOG_LEVEL,
    chromiumPath: e.CHROMIUM_PATH || null,
    pdfNoSandbox: e.PDF_NO_SANDBOX,
    timezone: e.TZ_NAME,
    // مخرجات الواجهة المبنية فقط (dist/web). نفس المسار النسبي يصح في التطوير (src/server) وفي الحزمة (dist/server)،
    // ولا نقبل src/web أبدًا حتى لا تُخدَّم ملفات المصدر الخام.
    webRoot: path.resolve(firstExisting([e.WEB_ROOT, path.join(here, '../../dist/web')], '../../dist/web')),
    migrationsDir: firstExisting(
      [path.join(here, 'migrations'), path.join(here, 'db/migrations')],
      'migrations',
    ),
    assetsDir: firstExisting([path.join(here, 'assets')], 'assets'),
    scrypt: { N: 2 ** logN, r: 8, p: 1 },
    rateLimitPerMinute: e.RATE_LIMIT_PER_MINUTE,
    sessionHours: 12,
    rememberDays: 30,
    ai: {
      provider: e.AI_PROVIDER,
      apiKey: e.ANTHROPIC_API_KEY?.trim() || null,
      baseUrl: e.AI_BASE_URL ? e.AI_BASE_URL.replace(/\/+$/, '') : null,
      model: e.AI_MODEL,
      effort: e.AI_EFFORT,
      timeoutMs: e.AI_TIMEOUT_MS,
      dailyLimit: e.AI_DAILY_LIMIT,
      perMinute: e.AI_RATE_PER_MINUTE,
      maxConcurrency: e.AI_MAX_CONCURRENCY,
    },
    version: VERSION,
  };
}
