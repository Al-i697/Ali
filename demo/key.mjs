// مفتاح الاستجابة المسجَّلة: المسار + المعاملات مرتّبة وبلا فارغ، ليتطابق ما سجّله المسجّل مع ما تطلبه الواجهة مهما اختلف الترتيب.
// يُستعمل في المسجّل (Node) وفي الطبقة الوسيطة داخل الصفحة (المتصفح): ملف واحد فلا ينحرفان.
export function demoKey(path, params) {
  const pairs = [];
  for (const [k, v] of params) if (v !== '' && v !== 'undefined' && v !== 'null') pairs.push([k, v]);
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  const qs = pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return qs ? `${path}?${qs}` : path;
}
