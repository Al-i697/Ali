// المساعد الذكي (منطق الأعمال): جاهزية الميزة، تنقية المدخلات، تشغيل المهمة، تحويل أخطاء المزوّد إلى رسائل عربية،
// وإحصاءات الاستخدام للمدير. لا يُسجَّل في التدقيق أي نص مُرسَل أو مُستلَم: أنواع ومقادير فقط.
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { AI_LIMITS } from '../../../shared/constants';
import type { AiRunResponse, AiSettingsDto, AiStatusDto, AiUsageDto } from '../../../shared/dto';
import type { AiRunParsed } from '../../../shared/schemas/ai';
import { schema, type Db } from '../../db/client';
import { AiError } from '../../ai/provider';
import { buildNameMatcher, CONTACT_MESSAGES, cleanFreeText, detectContactData, mentionsStudent, NAME_CONFIRM_MESSAGE } from '../../ai/sanitize';
import { planTask } from '../../ai/tasks';
import { AppError, badRequest } from '../../lib/errors';
import type { Ctx } from '../../lib/context';
import { requireAssignment } from '../_shared/owned';

const { appSettings, auditLog, students } = schema;

const AI_KEY = 'ai.enabled';
const DAY_MS = 24 * 3_600_000;

// ───────────── موافقة المدير ─────────────
export function getAiEnabled(db: Db): boolean {
  const row = db.select({ value: appSettings.value }).from(appSettings).where(eq(appSettings.key, AI_KEY)).get();
  return row?.value === true;
}

export function setAiEnabled(db: Db, enabled: boolean, userId: string): void {
  db.insert(appSettings)
    .values({ key: AI_KEY, value: enabled, updatedBy: userId })
    .onConflictDoUpdate({ target: appSettings.key, set: { value: enabled, updatedBy: userId, updatedAt: new Date().toISOString() } })
    .run();
}

/** الميزة ظاهرة للمعلمين فقط إن اجتمع: مزوّد مضبوط على الخادم + موافقة المدير */
export function aiReady(app: FastifyInstance): boolean {
  return app.ai.configured && getAiEnabled(app.db.orm);
}

// ───────────── الاستخدام ─────────────
function usedSince(db: Db, userId: string, sinceMs: number): number {
  const since = new Date(Date.now() - sinceMs).toISOString();
  const row = db
    .select({ c: sql<number>`count(*)` })
    .from(auditLog)
    .where(and(eq(auditLog.userId, userId), eq(auditLog.action, 'ai_run'), gte(auditLog.at, since)))
    .get();
  return row?.c ?? 0;
}

function usageSince(db: Db, sinceMs: number): AiUsageDto {
  const since = new Date(Date.now() - sinceMs).toISOString();
  const rows = db
    .select({ action: auditLog.action, meta: auditLog.meta })
    .from(auditLog)
    .where(and(inArray(auditLog.action, ['ai_run', 'ai_run_failed', 'ai_input_rejected']), gte(auditLog.at, since)))
    .limit(20_000)
    .all();
  const out: AiUsageDto = { runs: 0, blocked: 0, failed: 0, inputTokens: 0, outputTokens: 0 };
  for (const r of rows) {
    if (r.action === 'ai_run') {
      out.runs++;
      out.inputTokens += Number(r.meta?.inputTokens ?? 0) || 0;
      out.outputTokens += Number(r.meta?.outputTokens ?? 0) || 0;
    } else if (r.action === 'ai_run_failed') out.failed++;
    else out.blocked++;
  }
  return out;
}

export function status(app: FastifyInstance, ctx: Ctx): AiStatusDto {
  const ready = aiReady(app);
  return {
    ready,
    provider: ready ? app.ai.info : null,
    limits: { perDay: app.config.ai.dailyLimit, usedToday: usedSince(ctx.db, ctx.user.id, DAY_MS) },
  };
}

export function settings(app: FastifyInstance): AiSettingsDto {
  const db = app.db.orm;
  const err = app.ai.stats.lastError;
  return {
    configured: app.ai.configured,
    enabled: getAiEnabled(db),
    ready: aiReady(app),
    provider: app.ai.info,
    limits: { perDay: app.config.ai.dailyLimit, perMinute: app.ai.limits.perMinute, maxConcurrency: app.ai.limits.maxConcurrency },
    usage: { last24h: usageSince(db, DAY_MS), last7d: usageSince(db, 7 * DAY_MS) },
    lastError: err ? { at: err.at, kind: err.kind, status: err.status } : null,
  };
}

// ───────────── أخطاء المزوّد ← رسائل عربية ─────────────
export function mapAiError(e: AiError): AppError {
  switch (e.kind) {
    case 'auth':
      return new AppError(424, 'AI_PROVIDER_AUTH', 'تعذّر الاتصال بخدمة المساعد: مفتاح الخدمة غير صالح. أبلغ مدير النظام.');
    case 'bad_request':
      return new AppError(424, 'AI_PROVIDER_REJECTED', 'رفضت خدمة المساعد الطلب (قد يكون إعداد النموذج غير صحيح). أبلغ مدير النظام.');
    case 'rate_limit':
      return new AppError(429, 'AI_PROVIDER_BUSY', 'خدمة المساعد مزدحمة الآن. حاول بعد قليل.');
    case 'timeout':
      return new AppError(424, 'AI_TIMEOUT', 'تأخّر المساعد في الرد. حاول مجددًا أو اختصر المدخلات.');
    case 'network':
      return new AppError(424, 'AI_NETWORK', 'تعذّر الوصول إلى خدمة المساعد. تحقق من اتصال الخادم بالإنترنت.');
    case 'refused':
      return new AppError(422, 'AI_REFUSED', 'تعذّر على المساعد تلبية هذا الطلب. أعد صياغة المدخلات بوصف تعليمي عام وحاول مجددًا.');
    case 'truncated':
      return new AppError(424, 'AI_TRUNCATED', 'جاء رد المساعد ناقصًا. حاول مجددًا.');
    case 'invalid_output':
      return new AppError(424, 'AI_INVALID_OUTPUT', 'لم يُرجع المساعد نتيجة صالحة. حاول مجددًا.');
    default:
      return new AppError(424, 'AI_PROVIDER_ERROR', 'تعذّر الحصول على رد من المساعد الآن. حاول لاحقًا.');
  }
}

// ───────────── التشغيل ─────────────
export type AiAudit = (action: string, meta: Record<string, unknown>) => void;

/** يُنقّي كل نص حرّ في المدخل (ويُسقط الأسطر الفارغة) قبل أي فحص أو إرسال */
function cleanInput(input: AiRunParsed): AiRunParsed {
  const need = (s: string, field: string) => {
    const v = cleanFreeText(s);
    if (!v) throw badRequest('هذا الحقل مطلوب', 'VALIDATION_ERROR', { [field]: 'هذا الحقل مطلوب' });
    return v;
  };
  const opt = (s: string | null | undefined) => (s ? cleanFreeText(s) || null : null);
  switch (input.task) {
    case 'lesson-draft':
      return { ...input, title: need(input.title, 'title'), objectives: input.objectives.map(cleanFreeText).filter(Boolean), notes: opt(input.notes) };
    case 'assessment-ideas':
      return { ...input, title: need(input.title, 'title'), objectives: input.objectives.map(cleanFreeText).filter(Boolean), notes: opt(input.notes) };
    case 'support-plan-ideas':
      return { ...input, focus: need(input.focus, 'focus') };
  }
}

const textsOf = (i: AiRunParsed): string[] =>
  i.task === 'support-plan-ideas' ? [i.focus] : [i.title, ...i.objectives, ...(i.notes ? [i.notes] : [])];

export async function runAi(app: FastifyInstance, ctx: Ctx, raw: AiRunParsed, audit: AiAudit): Promise<AiRunResponse> {
  const db = ctx.db;
  if (!app.ai.configured) throw new AppError(501, 'AI_UNAVAILABLE', 'المساعد الذكي غير مفعّل على هذا الخادم');
  if (!getAiEnabled(db)) throw new AppError(501, 'AI_NOT_APPROVED', 'لم يوافق مدير النظام على تفعيل المساعد الذكي بعد');

  const perDay = app.config.ai.dailyLimit;
  const used = usedSince(db, ctx.user.id, DAY_MS);
  if (used >= perDay) throw new AppError(429, 'AI_DAILY_LIMIT', `بلغتَ الحد اليومي للمساعد (${perDay} طلبًا خلال 24 ساعة). حاول لاحقًا.`);

  // الصف والمادة فقط من المقرر المملوك للمعلم — لا شيء آخر من قاعدة البيانات يدخل الرسالة
  const asg = raw.assignmentId ? requireAssignment(db, ctx.ownerId, raw.assignmentId) : null;

  const input = cleanInput(raw);
  const joined = textsOf(input).join('\n');
  if (joined.length > AI_LIMITS.totalChars) {
    throw badRequest(`النص طويل جدًا (${joined.length} حرفًا). الحد ${AI_LIMITS.totalChars} حرف.`, 'AI_INPUT_TOO_LONG');
  }
  const contact = detectContactData(joined);
  if (contact) {
    audit('ai_input_rejected', { task: input.task, reason: contact });
    throw badRequest(CONTACT_MESSAGES[contact], 'AI_INPUT_REJECTED');
  }
  const names = db.select({ n: students.fullName }).from(students).where(eq(students.ownerId, ctx.ownerId)).all().map((r) => r.n);
  let nameOverride = false;
  if (mentionsStudent(joined, buildNameMatcher(names))) {
    if (!input.acknowledgeNames) {
      audit('ai_input_rejected', { task: input.task, reason: 'student_name' });
      throw new AppError(422, 'AI_NAME_CONFIRM_REQUIRED', NAME_CONFIRM_MESSAGE);
    }
    nameOverride = true;
  }

  const plan = planTask(input, { gradeLevel: asg?.gradeLevel ?? null, subject: asg?.subjectName ?? null });
  const t0 = Date.now();
  let completion;
  try {
    completion = await app.ai.run(ctx.user.id, (p) => p.complete({ system: plan.system, user: plan.user, schema: plan.schema }));
  } catch (e) {
    if (e instanceof AiError) {
      app.log.warn({ kind: e.kind, status: e.detail.status, requestId: e.detail.requestId, task: input.task }, 'ai provider error');
      audit('ai_run_failed', { task: input.task, provider: app.ai.info?.id, kind: e.kind, status: e.detail.status ?? null });
      throw mapAiError(e);
    }
    throw e; // حدود المعدل/التزامن (AppError جاهز)
  }

  const result = plan.finish(completion.data);
  audit('ai_run', {
    task: input.task,
    provider: app.ai.info?.id,
    model: completion.model,
    inputChars: plan.chars,
    inputTokens: completion.usage.inputTokens,
    outputTokens: completion.usage.outputTokens,
    durationMs: Date.now() - t0,
    ...(nameOverride ? { nameOverride: true } : {}),
  });
  return { task: input.task, result, source: app.ai.info!, usage: { usedToday: used + 1, perDay } } as AiRunResponse;
}
