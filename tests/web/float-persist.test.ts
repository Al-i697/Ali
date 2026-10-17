import { describe, expect, it } from 'vitest';
import { FLOAT_EMPTY, parseFloatState } from '../../src/web/features/classroom/float/persist';

const TODAY = '2026-10-13';
const AID = '11111111-1111-4111-8111-111111111111';
const save = (v: unknown) => JSON.stringify(v);

describe('حالة اللوحة العائمة المحفوظة في المتصفح', () => {
  it('لا شيء محفوظ أو نص تالف أو غير كائن ⇒ الحالة الافتراضية (مغلقة)', () => {
    for (const raw of [null, '', 'غير JSON', '{', 'null', '5', '"نص"', 'true']) expect(parseFloatState(raw, TODAY), String(raw)).toEqual(FLOAT_EMPTY);
    expect(FLOAT_EMPTY).toEqual({ open: false, pos: null, ref: null, hideBehavior: false });
  });

  it('حالة سليمة تُقرأ كما حُفظت، وما عداها من حقول يُهمَل', () => {
    const state = { open: true, pos: { x: 40, y: 120.5 }, ref: { assignmentId: AID, date: TODAY, period: 3 }, hideBehavior: true };
    expect(parseFloatState(save({ ...state, extra: 'x', students: ['أسماء'] }), TODAY)).toEqual(state);
    // حصة غير محددة (بلا رقم) صالحة
    expect(parseFloatState(save({ ...state, ref: { ...state.ref, period: null } }), TODAY).ref).toEqual({ assignmentId: AID, date: TODAY, period: null });
  });

  it('الحصة المحفوظة تخص يومها فقط، وبقية الحقول تبقى', () => {
    const got = parseFloatState(save({ open: true, pos: { x: 1, y: 2 }, hideBehavior: true, ref: { assignmentId: AID, date: '2026-10-12', period: 2 } }), TODAY);
    expect(got).toEqual({ open: true, pos: { x: 1, y: 2 }, ref: null, hideBehavior: true });
  });

  it('رقم الحصة والمعرّف يُتحقَّق منهما: خارج 1…12 أو كسر أو نص أو معرّف فارغ ⇒ تُهمَل الحصة', () => {
    const ref = (over: object) => parseFloatState(save({ ref: { assignmentId: AID, date: TODAY, period: 1, ...over } }), TODAY).ref;
    expect(ref({})).not.toBeNull();
    expect(ref({ period: 12 })).not.toBeNull();
    for (const period of [0, 13, -1, 2.5, '3', undefined, true]) expect(ref({ period }), String(period)).toBeNull(); // (NaN يُحفظ JSON كـnull أي «بلا رقم» وهو صالح)
    expect(ref({ assignmentId: '' })).toBeNull();
    expect(ref({ assignmentId: 7 })).toBeNull();
    expect(parseFloatState(save({ ref: 'نص' }), TODAY).ref).toBeNull();
  });

  it('الموضع والأعلام: قيم غير رقمية أو غير منطقية تُهمَل (لا تفتح اللوحة بتلف)', () => {
    expect(parseFloatState(save({ pos: { x: 'a', y: 1 } }), TODAY).pos).toBeNull();
    expect(parseFloatState(save({ pos: { x: 1 } }), TODAY).pos).toBeNull();
    expect(parseFloatState(save({ pos: { x: null, y: 2 } }), TODAY).pos).toBeNull();
    expect(parseFloatState(save({ open: 'true', hideBehavior: 1 }), TODAY)).toEqual(FLOAT_EMPTY);
  });
});
