/* يولّد ملف نسخة احتياطية جاهز بأصناف وعملاء وفواتير (لاختبار الأداء والمسارات) بنفس صيغة النسخة الحقيقية */
const crypto = require('crypto'), fs = require('fs');
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hash = (salt, pw) => 'p' + crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256').toString('hex');
function make({ invoices = 300, perShift = 40, seed = 11 } = {}) {
  const r = rng(seed), ri = (a, b) => a + Math.floor(r() * (b - a + 1)), pick = a => a[Math.floor(r() * a.length)];
  let uid = 1; const U = () => uid++;
  const P = {}, STOCK = [];
  const own = (id, n, icon, p, c, q, min) => { const sid = 'o_' + id; STOCK.push({ id: sid, n, unit: 'حبة', scale: 1, min, start: q, own: id }); P[id] = { n, icon, p, c, bc: 'SKU' + id, own: sid, uses: { [sid]: 1 } }; };
  const svc = (id, n, icon, p, c) => { P[id] = { n, icon, p, c, bc: 'SKU' + id, svc: true }; };
  own('m1', 'مشكاك لحم غنم', '🍢', 1000, 450, 1e7, 12); own('m2', 'مشكاك دجاج', '🍗', 600, 250, 1e7, 12); own('m3', 'مشكاك كبدة', '🍢', 700, 280, 1e7, 12); own('m4', 'مشكاك مشكل 3 أعواد', '🍢', 2500, 1000, 1e7, 10);
  svc('g1', 'نصف دجاجة مشوية', '🍗', 2500, 1100); svc('g2', 'ريش غنم', '🍖', 4500, 2200); svc('g3', 'كباب لحم', '🥩', 1800, 800); svc('g4', 'طبق مشاوي مشكل', '🍽️', 6500, 3000);
  svc('a1', 'خبز رخال', '🫓', 100, 30); svc('a2', 'حمص', '🥣', 600, 180); svc('a3', 'سلطة عربية', '🥗', 500, 150); svc('a4', 'بطاطس مقلية', '🍟', 700, 200);
  svc('d1', 'شاي كرك', '☕', 200, 50); svc('d2', 'قهوة عربية', '☕', 300, 80); own('d3', 'ماء', '💧', 100, 40, 1e7, 48); own('d4', 'مشروب غازي', '🥤', 300, 130, 1e7, 48); svc('d5', 'ليمون بالنعناع', '🍋', 800, 250);
  P.p1 = { n: 'بيتزا', icon: '🍕', p: 4000, c: 1500, bc: 'SKUp1', svc: true, vars: [{ id: 'v1', n: 'صغير', p: 4000, c: 1500 }, { id: 'v2', n: 'وسط', p: 6000, c: 2000 }, { id: 'v3', n: 'كبير', p: 8000, c: 3000 }] };
  STOCK.push({ id: 'charcoal', n: 'فحم', unit: 'كيس', scale: 1, min: 4, start: 20 });
  const users = [['المدير', 'admin', 'manager', '1234'], ['خالد', 'khaled', 'cashier', '1111'], ['سعود', 'saud', 'cashier', '2222']].map(([name, user, role, pw]) => { const salt = 'salt' + user; return { id: U(), name, user, role, on: true, salt, hash: hash(salt, pw) }; });
  const customers = ['أبو سالم', 'مكتب الفجر للمقاولات', 'حمد البلوشي', 'شركة النور', 'سعيد الريامي', 'مطعم الأصيل'].map((n, i) => ({ id: U(), n, ph: '9' + (210000 + i * 1111) }));
  const suppliers = ['مسلخ الواحة', 'مؤسسة الجمر للفحم', 'الخليج للمشروبات'].map(n => ({ id: U(), n, ph: '' }));
  const ids = Object.keys(P), weights = ids.map(() => 1);
  const shifts = [{ id: U(), start: Date.now() - 4000 * 864e5, end: Date.now() - 4000 * 864e5, float: 0, expected: 0, counted: 0, diff: 0, init: true }];
  const inv = [], custPays = [], expenses = [], purchases = [], adjusts = [];
  const nShifts = Math.max(2, Math.ceil(invoices / perShift)); let nextInv = 1001, left = invoices;
  const day0 = new Date(); day0.setHours(18, 0, 0, 0); const D = day0.getTime();
  for (let k = nShifts; k >= 1; k--) {
    const closed = k > 1, start = D - (k - 1) * 864e5 + ri(0, 10) * 6e4, end = closed ? start + 8 * 36e5 : null;
    const sh = { id: U(), start, end, float: 20000, expected: null, counted: null, diff: null }; shifts.push(sh);
    const n = closed ? Math.min(left, perShift) : Math.min(left, Math.max(5, perShift >> 1)); left -= n;
    for (let j = 0; j < n; j++) {
      const lines = []; for (let q = ri(1, 4); q > 0; q--) { const pid = pick(ids); if (lines.find(l => l.pid === pid)) continue; const p = P[pid], v = p.vars ? pick(p.vars) : null, qty = pid[0] === 'm' ? ri(2, 6) : ri(1, 2), price = v ? v.p : p.p; lines.push({ pid, vid: v ? v.id : '', name: p.n + (v ? ' (' + v.n + ')' : ''), qty, price, cost: v ? v.c : p.c, amt: price * qty }); }
      const sub = lines.reduce((a, l) => a + l.amt, 0), disc = r() < .05 ? Math.min(Math.round(sub * .12 / 500) * 500, sub) : 0, total = sub - disc, x = r(), pay = { cash: 0, visa: 0, credit: 0 }; let cid = null;
      if (x < .68) pay.cash = total; else if (x < .86) pay.visa = total; else { pay.credit = total; cid = pick(customers.slice(0, 5)).id; }
      const type = pick(['table', 'table', 'car']), t = start + 12 * 6e4 + Math.floor(r() * 7 * 36e5);
      inv.push({ id: nextInv++, t, shift: sh.id, type, ref: type === 'table' ? String(ri(1, 14)) : String(ri(1000, 9999)), lines, sub, discount: disc, total, vat: 0, pay, customerId: cid, status: 'ok', by: pick(['خالد', 'سعود']), note: '' });
    }
    if (closed) { expenses.push({ id: U(), t: start + 36e5, shift: sh.id, cat: 'ثلج', amount: 3000, note: '', from: 'cash' }); sh.expected = 20000; sh.counted = 20000; sh.diff = 0; }
  }
  const cur = shifts[shifts.length - 1]; cur.end = null;
  inv.sort((a, b) => a.id - b.id);
  return { app: 'cafe-pos', v: 1, at: Date.now(), kv: { meta: { uid, nextInv, vat: false, created: Date.now(), lastBackup: Date.now(), rec: null, v: 1 }, store: { name: 'مقهى الاختبار', desc: 'مشاكيك ومشاوي', phone: '99000000', qr: 'https://instagram.com/test_cafe', logo: '', float: '20.000' }, users, customers, suppliers, products: P, stock: STOCK }, invoices: inv, custPays, expenses, purchases, suppPays: [], adjusts, shifts };
}
module.exports = { make };
if (require.main === module) { const n = +process.argv[2] || 300; const f = process.argv[3] || '/tmp/claude-0/fixture-' + n + '.json'; const b = make({ invoices: n }); fs.writeFileSync(f, JSON.stringify(b)); console.log(f, (fs.statSync(f).size / 1048576).toFixed(1) + ' MB', 'invoices', b.invoices.length, 'shifts', b.shifts.length); }
