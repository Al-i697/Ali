// نقطة التوسعة للمساعد الذكي (مستقبلًا). لا يوجد في هذه النسخة أي مزوّد مفعّل ولا أي زر في الواجهة:
// الخدمة هنا تحدد العقد فقط، وتبقي كل شيء معطّلًا (501) إلى أن يُسجَّل مزوّد صراحةً.
// القاعدة الأمنية: بيانات الطلاب لا تغادر الخادم إلى أي مزوّد خارجي. من يضيف مزوّدًا يمرّر له نصًّا
// اختاره المعلم بنفسه (مثل عنوان الدرس وأهدافه) بعد حذف الأسماء، ويوثّق ما يُرسَل. انظر docs/AI-EXTENSION.md
import { AppError } from '../lib/errors';

/** المهام المتوقعة للمساعد. كل مهمة تقبل نصًّا مجرّدًا وتعيد نصًّا مقترحًا يراجعه المعلم قبل اعتماده */
export type AiTask = 'lesson-draft' | 'assessment-ideas' | 'support-plan-ideas';

export type AiRequest = { task: AiTask; input: string; locale?: 'ar' };
export type AiResponse = { text: string; provider: string };

export interface AiProvider {
  /** معرّف قصير (مثل «local-llm») يُسجَّل في سجل العمليات */
  readonly id: string;
  /** هل المزوّد جاهز (مفتاح مضبوط/نموذج محلي يعمل)؟ */
  isAvailable(): boolean;
  complete(request: AiRequest): Promise<AiResponse>;
}

export class AiService {
  private provider: AiProvider | null = null;

  register(provider: AiProvider): void {
    this.provider = provider;
  }

  get available(): boolean {
    return this.provider?.isAvailable() ?? false;
  }

  async run(request: AiRequest): Promise<AiResponse> {
    if (!this.provider || !this.provider.isAvailable()) {
      throw new AppError(501, 'AI_UNAVAILABLE', 'المساعد الذكي غير مفعّل على هذا الخادم');
    }
    const input = request.input.trim();
    if (!input) throw new AppError(400, 'AI_EMPTY_INPUT', 'لا نص لإرساله إلى المساعد');
    if (input.length > 4000) throw new AppError(400, 'AI_INPUT_TOO_LONG', 'النص طويل جدًا (الحد 4000 حرف)');
    return this.provider.complete({ ...request, input });
  }
}
