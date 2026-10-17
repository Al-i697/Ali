import { MAX_PERIODS } from '@shared/constants';
import type { SessionRef } from '../use-session';

// ما تحفظه «لوحة المشاركة العائمة» في المتصفح: تفضيلات عرض فقط (مفتوحة؟ أين؟ أي حصة؟) — لا أسماء طلاب ولا تسجيلات.
export type FloatPos = { x: number; y: number };
export type FloatPersisted = {
  /** اللوحة ظاهرة داخل التطبيق */
  open: boolean;
  /** موضعها بعد سحبها (null ⇒ الزاوية الافتراضية) */
  pos: FloatPos | null;
  /** الحصة المثبّتة؛ لا تتبدّل وحدها عند انتهاء الحصة كي لا تُسجَّل ضغطة على حصة غير مقصودة */
  ref: SessionRef | null;
  /** إخفاء تسجيلات السلوك من اللوحة (حين تكون الشاشة معروضة للطلاب) */
  hideBehavior: boolean;
};

export const FLOAT_EMPTY: FloatPersisted = { open: false, pos: null, ref: null, hideBehavior: false };

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** يقرأ الحالة المحفوظة (نصًّا) ويتحقق من كل حقل: أي تلف يُهمَل، والحصة المحفوظة تخص يومها فقط */
export function parseFloatState(raw: string | null, today: string): FloatPersisted {
  try {
    const v = JSON.parse(raw ?? 'null') as Partial<FloatPersisted> | null;
    if (!v || typeof v !== 'object') return FLOAT_EMPTY;
    const r = v.ref;
    const refOk =
      !!r &&
      typeof r.assignmentId === 'string' &&
      r.assignmentId !== '' &&
      r.date === today &&
      (r.period === null || (Number.isInteger(r.period) && r.period >= 1 && r.period <= MAX_PERIODS));
    return {
      open: v.open === true,
      pos: v.pos && finite(v.pos.x) && finite(v.pos.y) ? { x: v.pos.x, y: v.pos.y } : null,
      ref: refOk ? { assignmentId: r.assignmentId, date: r.date, period: r.period } : null,
      hideBehavior: v.hideBehavior === true,
    };
  } catch {
    return FLOAT_EMPTY;
  }
}
