// يُحمَّل بـ`node --import`: يثبّت «الآن» في عملية الخادم أو الـCLI على اللحظة DEMO_NOW (ثم يمضي الزمن بعدها طبيعيًا).
// الغرض تسجيل المعاينة في يوم دراسي ثابت (الثلاثاء) مهما كان تاريخ تشغيل المسجّل.
const target = Date.parse(process.env.DEMO_NOW ?? '');
if (Number.isNaN(target)) throw new Error('DEMO_NOW غير صالح (مثل 2026-10-13T09:30:00+04:00)');
const RealDate = Date;
const offset = target - RealDate.now();
class FakeDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(RealDate.now() + offset);
    else super(...args);
  }
  static now() {
    return RealDate.now() + offset;
  }
}
globalThis.Date = FakeDate;
