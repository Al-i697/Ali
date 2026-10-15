// فحص اتصال المساعد الذكي من سطر الأوامر (npm run cli -- ai-check): يرسل طلبًا صغيرًا جدًا بلا أي بيانات حقيقية
// ليتأكد المدير من المفتاح والنموذج والوصول إلى المزوّد قبل تفعيل الميزة للمعلمين. لا يطبع المفتاح ولا أي نص حسّاس.
import { z } from 'zod';
import type { AiConfig } from '../config';
import { createAnthropicProvider } from './anthropic';
import { AiError, type AiErrorKind } from './provider';

export type AiCheckResult =
  | { ok: true; provider: string; host: string; model: string; answeredBy: string; durationMs: number; inputTokens: number; outputTokens: number }
  | { ok: false; kind: 'not_configured' | AiErrorKind; message: string; status: number | null; requestId: string | null };

/** إرشاد للمدير (تقني) لكل نوع خطأ — يختلف عن رسائل المعلم العامة */
const HINTS: Record<AiErrorKind, string> = {
  auth: 'رفض المزوّد المفتاح (401/403). تحقق من ANTHROPIC_API_KEY ومن أن له صلاحية استدعاء النموذج.',
  bad_request: 'رفض المزوّد الطلب. غالبًا AI_MODEL غير صحيح أو غير متاح لحسابك، أو AI_BASE_URL يشير إلى بوابة لا تدعم الواجهة.',
  rate_limit: 'بلغ الحساب حدّ المزوّد (429). حاول بعد قليل أو راجع حدود الحساب.',
  timeout: 'انتهت المهلة. زد AI_TIMEOUT_MS أو افحص اتصال الخادم بالمزوّد.',
  network: 'تعذّر الاتصال بالمزوّد. افحص الشبكة والوكيل الصادر (HTTPS_PROXY) وAI_BASE_URL.',
  server: 'أعاد المزوّد خطأً من جهته (5xx). أعد المحاولة لاحقًا.',
  refused: 'رفض المزوّد الإجابة على طلب الاختبار نفسه (مصنّف السلامة).',
  truncated: 'جاء الرد مقطوعًا قبل اكتماله.',
  invalid_output: 'جاء الرد لا يطابق البنية المطلوبة.',
};

const probeSchema = z.object({ ok: z.boolean() });

export async function runAiCheck(cfg: AiConfig): Promise<AiCheckResult> {
  if (cfg.provider !== 'anthropic' || !cfg.apiKey) {
    return {
      ok: false,
      kind: 'not_configured',
      message: 'المساعد غير مضبوط: اضبط AI_PROVIDER=anthropic و ANTHROPIC_API_KEY في بيئة الخادم.',
      status: null,
      requestId: null,
    };
  }
  // maxRetries=0: الفحص يُظهر الحقيقة من أول محاولة بدل إخفائها بإعادات صامتة
  const provider = createAnthropicProvider({
    apiKey: cfg.apiKey,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    effort: cfg.effort,
    timeoutMs: cfg.timeoutMs,
    maxRetries: 0,
  });
  const started = Date.now();
  try {
    const res = await provider.complete({
      system: 'أنت أداة فحص اتصال. أعد JSON مطابقًا للبنية المطلوبة فقط.',
      user: 'فحص اتصال: أعد ok=true.',
      schema: probeSchema,
    });
    return {
      ok: true,
      provider: provider.label,
      host: provider.host,
      model: cfg.model,
      answeredBy: res.model,
      durationMs: Date.now() - started,
      inputTokens: res.usage.inputTokens,
      outputTokens: res.usage.outputTokens,
    };
  } catch (e) {
    if (e instanceof AiError) {
      return { ok: false, kind: e.kind, message: HINTS[e.kind], status: e.detail.status ?? null, requestId: e.detail.requestId ?? null };
    }
    return { ok: false, kind: 'server', message: HINTS.server, status: null, requestId: null };
  }
}
