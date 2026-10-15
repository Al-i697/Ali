// المساعد الذكي: عقد المزوّد + خدمة تسجيله وضبط حدوده. المزوّد المنفَّذ حاليًا: Claude عبر الـSDK الرسمي (anthropic.ts).
// الضوابط الإلزامية (انظر docs/AI-EXTENSION.md): بيانات الطلاب لا تغادر الخادم، والمعلم يراجع ولا يُحفظ شيء تلقائيًا،
// والتفعيل صريح (بيئة الخادم + موافقة المدير)، والتدقيق بلا نصوص، وحدود للمعدل والتزامن والاستهلاك اليومي.
import type { ZodType } from 'zod';
import type { AiProviderInfo } from '../../shared/dto';
import { AppError } from '../lib/errors';

export type AiErrorKind =
  | 'auth' // مفتاح غير صالح/غير مصرّح
  | 'rate_limit' // حدّ المزوّد
  | 'timeout'
  | 'network'
  | 'bad_request' // طلب مرفوض (نموذج غير موجود/ميزة غير مفعّلة لحسابك…)
  | 'server'
  | 'refused' // رفض المزوّد الإجابة (مصنّفات السلامة)
  | 'truncated' // الرد تجاوز الحد
  | 'invalid_output'; // الرد لا يطابق البنية المطلوبة

/** خطأ مزوّد بلا نصوص حساسة: لا مفاتيح ولا مدخلات — يكفي النوع والحالة ومعرّف الطلب لدى المزوّد لتتبّع المشكلة */
export class AiError extends Error {
  constructor(
    readonly kind: AiErrorKind,
    message: string,
    readonly detail: { status?: number; requestId?: string | null; category?: string | null } = {},
  ) {
    super(message);
    this.name = 'AiError';
  }
}

export type AiCompletionRequest<T> = {
  /** تعليمات النظام (ثابتة لكل مهمة) */
  system: string;
  /** رسالة المعلم بعد التنقية */
  user: string;
  /** بنية الرد المطلوبة: يُلزَم بها المزوّد ويُتحقَّق منها عند الاستلام */
  schema: ZodType<T>;
};

export type AiCompletion<T> = {
  data: T;
  /** النموذج الذي أجاب فعلًا (قد يختلف عن المضبوط إن وقع تحويل عند الرفض) */
  model: string;
  usage: { inputTokens: number; outputTokens: number };
};

export interface AiProvider extends AiProviderInfo {
  isAvailable(): boolean;
  complete<T>(request: AiCompletionRequest<T>): Promise<AiCompletion<T>>;
}

export type AiLimits = { maxConcurrency: number; perMinute: number };

/**
 * سجل المزوّد + حدود المعدل (لكل مستخدم في الدقيقة) والتزامن (للخادم كله) + عدّادات تشغيل للمدير.
 * لا يعرف شيئًا عن المهام أو النصوص: يحجز مكانًا ثم ينفّذ ما يُمرَّر إليه.
 */
export class AiService {
  private provider: AiProvider | null = null;
  private inFlight = 0;
  private readonly recent = new Map<string, number[]>();
  readonly stats: { ok: number; failed: number; lastError: { at: string; kind: AiErrorKind; status: number | null } | null } = {
    ok: 0,
    failed: 0,
    lastError: null,
  };

  constructor(
    readonly limits: AiLimits = { maxConcurrency: 3, perMinute: 6 },
    private readonly now: () => number = Date.now,
  ) {}

  register(provider: AiProvider): void {
    this.provider = provider;
  }

  /** مزوّد مسجَّل وجاهز تقنيًا (لا يعني أن المدير وافق — انظر modules/ai/service.ts) */
  get configured(): boolean {
    return this.provider?.isAvailable() ?? false;
  }

  get info(): AiProviderInfo | null {
    const p = this.provider;
    return p ? { id: p.id, label: p.label, model: p.model, host: p.host, local: p.local } : null;
  }

  /** يحجز مكانًا للمستخدم (حد الدقيقة + التزامن) ثم ينفّذ الطلب على المزوّد */
  async run<T>(userId: string, call: (provider: AiProvider) => Promise<T>): Promise<T> {
    const provider = this.provider;
    if (!provider || !provider.isAvailable()) throw new AppError(501, 'AI_UNAVAILABLE', 'المساعد الذكي غير مفعّل على هذا الخادم');

    const t = this.now();
    const recent = (this.recent.get(userId) ?? []).filter((x) => t - x < 60_000);
    if (recent.length >= this.limits.perMinute) {
      this.recent.set(userId, recent);
      throw new AppError(429, 'AI_RATE_LIMITED', 'طلبات كثيرة للمساعد. انتظر دقيقة ثم حاول مجددًا');
    }
    if (this.inFlight >= this.limits.maxConcurrency) {
      throw new AppError(429, 'AI_BUSY', 'المساعد مشغول بطلبات أخرى الآن. حاول بعد لحظات');
    }
    recent.push(t);
    this.recent.set(userId, recent);

    this.inFlight++;
    try {
      const result = await call(provider);
      this.stats.ok++;
      return result;
    } catch (e) {
      this.stats.failed++;
      if (e instanceof AiError) this.stats.lastError = { at: new Date(this.now()).toISOString(), kind: e.kind, status: e.detail.status ?? null };
      throw e;
    } finally {
      this.inFlight--;
    }
  }
}
