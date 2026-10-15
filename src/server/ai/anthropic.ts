// مزوّد Claude عبر الـSDK الرسمي (@anthropic-ai/sdk). لا يعرف شيئًا عن المهام: يستلم تعليمات النظام ورسالة المعلم
// وبنية الرد، ويعيد الرد المنظَّم المتحقَّق منه. لا يُسجِّل ولا يُعيد أي نص من المدخلات أو المفتاح في أخطائه.
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { AiError, type AiCompletion, type AiCompletionRequest, type AiProvider } from './provider';

export type AnthropicProviderConfig = {
  apiKey: string;
  /** عنوان بديل (بوابة/وكيل مؤسسي). الافتراضي api.anthropic.com */
  baseUrl?: string | null;
  model: string;
  effort: 'low' | 'medium' | 'high';
  timeoutMs: number;
  /** إعادة محاولة الـSDK عند 429/5xx/الشبكة (الافتراضي 1: نحدّ زمن انتظار المعلم) */
  maxRetries?: number;
};

/** سقف الرد: التفكير يُحتسب منه أيضًا، فنتركه واسعًا (ما يُدفع هو ما يُولَّد فعلًا) */
const MAX_TOKENS = 16_000;

/** نُفعّل الرجوع التلقائي (fallbacks) كي لا يضيع طلب مشروع رفضه مصنّف السلامة خطأً (مثل بعض موضوعات الأحياء والكيمياء) */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

/** نماذج Haiku بلا رجوع تلقائي من جهة الخدمة: لا نرسل المعامل لها أصلًا */
const supportsFallbacks = (model: string) => !/haiku/i.test(model);

const isLoopback = (host: string) => /^(localhost|127\.|\[::1\]|::1)/.test(host);

function toAiError(e: unknown): AiError {
  if (e instanceof AiError) return e;
  const requestId = e instanceof Anthropic.APIError ? (e.requestID ?? null) : null;
  const status = e instanceof Anthropic.APIError ? e.status : undefined;
  const detail = { status, requestId };
  if (e instanceof Anthropic.APIConnectionTimeoutError) return new AiError('timeout', 'انتهت مهلة المزوّد', detail);
  if (e instanceof Anthropic.APIConnectionError) return new AiError('network', 'تعذّر الاتصال بالمزوّد', detail);
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return new AiError('auth', 'المفتاح مرفوض', detail);
  if (e instanceof Anthropic.RateLimitError) return new AiError('rate_limit', 'حدّ المزوّد', detail);
  if (e instanceof Anthropic.NotFoundError || e instanceof Anthropic.BadRequestError) return new AiError('bad_request', 'الطلب مرفوض من المزوّد', detail);
  if (e instanceof Anthropic.APIError) return new AiError('server', 'خطأ من المزوّد', detail);
  if (e instanceof Anthropic.AnthropicError && /Failed to parse structured output/i.test(e.message)) return new AiError('invalid_output', 'رد غير مطابق للبنية', detail);
  return new AiError('server', 'خطأ غير متوقع في المزوّد', detail);
}

export function createAnthropicProvider(cfg: AnthropicProviderConfig): AiProvider {
  const client = new Anthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseUrl ?? undefined, timeout: cfg.timeoutMs, maxRetries: cfg.maxRetries ?? 1 });
  const host = new URL(cfg.baseUrl ?? 'https://api.anthropic.com').host;
  // الرجوع التلقائي اختياري تحسينيًا: إن رفضه الحساب أو النموذج أو البوابة (400) نكمل بدونه، ونتذكر ذلك متى نجح الطلب بدونه
  let useFallbacks = supportsFallbacks(cfg.model);

  return {
    id: 'anthropic',
    label: 'Claude (Anthropic)',
    model: cfg.model,
    host,
    local: isLoopback(host),
    isAvailable: () => true,

    async complete<T>({ system, user, schema }: AiCompletionRequest<T>): Promise<AiCompletion<T>> {
      const format = zodOutputFormat(schema);
      const send = (withFallbacks: boolean) =>
        client.beta.messages.create({
          model: cfg.model,
          max_tokens: MAX_TOKENS,
          system,
          messages: [{ role: 'user', content: user }],
          // لا نمرّر thinking: التفكير تكيّفي افتراضيًا على Claude 5. العمق يُضبط بـeffort (الافتراضي low لسرعة المسودات)
          output_config: { effort: cfg.effort, format: { type: 'json_schema', schema: format.schema } },
          ...(withFallbacks ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const } : {}),
        });

      let res: Awaited<ReturnType<typeof send>>;
      try {
        try {
          res = await send(useFallbacks);
        } catch (e) {
          if (useFallbacks && e instanceof Anthropic.BadRequestError) {
            // نعيد مرة واحدة بلا الرجوع التلقائي. إن فشلت أيضًا فالعلة ليست فيه: يبقى مفعّلًا للطلبات اللاحقة
            res = await send(false);
            useFallbacks = false;
          } else throw e;
        }
      } catch (e) {
        throw toAiError(e);
      }

      const detail = { requestId: res._request_id ?? null };
      // نفحص سبب التوقف قبل قراءة المحتوى: الرفض يعيد HTTP 200
      if (res.stop_reason === 'refusal') throw new AiError('refused', 'رفض المزوّد الإجابة', { ...detail, category: res.stop_details?.category ?? null });
      if (res.stop_reason === 'max_tokens') throw new AiError('truncated', 'الرد تجاوز الحد', detail);

      const text = res.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
      let data: T;
      try {
        data = format.parse(text) as T;
      } catch {
        throw new AiError('invalid_output', 'رد غير مطابق للبنية', detail);
      }
      return { data, model: res.model, usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens } };
    },
  };
}
