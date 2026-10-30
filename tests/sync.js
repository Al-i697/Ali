/* اختبار الربط بين جهازين: متصفحان منفصلان (كل واحد له تخزينه) + خادم تجريبي يحاكي Supabase
   تشغيل: node tests/sync.js   (ومع PG_URL=postgres://... على Postgres حقيقي بعد تطبيق src/sync.sql) */
const H = require('./helpers'); const { ok, txt } = H; const S = require('./syncserver');
const STORES = ['invoices', 'shifts', 'custPays', 'expenses', 'purchases', 'suppPays', 'adjusts'];
const dump = p => p.evaluate(async st => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('cafe-pos'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const o = {}; for (const n of ['kv', ...st]) o[n] = await new Promise(r => { const q = db.transaction(n).objectStore(n).getAll(); q.onsuccess = () => r(q.result); });
  db.close(); return o;
}, STORES);
const byId = (a, b) => String(a.id) < String(b.id) ? -1 : 1;
const norm = d => {
  const o = {}; for (const n of STORES) o[n] = d[n].slice().sort(byId);
  for (const r of d.kv) { if (['users', 'customers', 'suppliers', 'stock'].includes(r.k)) o[r.k] = r.v.slice().sort(byId); else if (['products', 'store'].includes(r.k)) o[r.k] = r.v; }
  return JSON.stringify(o);
};
const syncNow = async (p, ms = 900) => { await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await p.waitForTimeout(ms); };
const chip = p => p.locator('#sync-chip').innerText().then(t => t.replace(/\s+/g, ' ').trim());
const closeShift = async (p, count) => { await H.nav(p, 'shift'); await p.fill('#c-count', String(count)); await p.click('[data-a="close-start"]'); await p.waitForTimeout(200); await p.click('[data-a="close-ok"]'); await p.waitForTimeout(700); if (await p.locator('#app-modal:not(.hidden)').count()) await p.click('[data-a="close-modal"]'); await p.waitForTimeout(200); };
const invIds = async p => (await dump(p)).invoices.map(i => i.id).sort((a, b) => a - b);

(async () => {
  const srv = await S.start(8130); const browser = await H.launch();
  const mA = await H.mkctx(browser), mB = await H.mkctx(browser);
  const A = await H.mkpage(mA.ctx, mA.errs), B = await H.mkpage(mB.ctx, mB.errs);
  await A.goto(H.URL); await A.waitForTimeout(900);

  /* ١) الجهاز الأول فيه بيانات قبل الربط (يختبر الرفع الأول) */
  const acct = await H.setup(A);
  await H.nav(A, 'products');
  await H.addProd(A, { n: 'مشكاك لحم', p: '1', c: '0.45', stock: 10, icon: '🍢' });
  await H.addProd(A, { n: 'ريش غنم', p: '4.5', c: '2.2', svc: true, icon: '🍖' });
  await H.openShift(A, '20');
  const r0 = await H.sell(A, 'مشكاك', { recv: '5' }); ok(r0.includes('#1001'), 'A: first invoice #1001 before linking');
  ok(!(await A.locator('#sync-chip').isVisible()), 'chip hidden while not linked');

  /* ٢) تفعيل الربط من الإعدادات */
  await H.nav(A, 'settings'); ok((await txt(A)).includes('ربط الأجهزة'), 'settings shows the linking card');
  await A.click('[data-a="sync-on"]'); await A.waitForSelector('#sy-url');
  await A.fill('#sy-url', 'http://127.0.0.1:1'); await A.fill('#sy-key', srv.KEY); await A.click('#sy-go'); await A.waitForTimeout(1500);
  ok((await A.locator('#sy-err').isVisible()) && !(await A.locator('#sy-code').count()), 'wrong URL: shows an error, no link');
  await A.fill('#sy-url', srv.url); await A.fill('#sy-key', 'bad-key'); await A.click('#sy-go'); await A.waitForTimeout(1000);
  ok((await A.locator('#sy-err').innerText()).includes('المفتاح'), 'wrong key: ' + (await A.locator('#sy-err').innerText()));
  await A.fill('#sy-key', 'sb_secret_abc'); await A.click('#sy-go'); await A.waitForTimeout(500); ok((await A.locator('#sy-err').innerText()).includes('مفتاح سري'), 'secret key refused');
  const jwt = h => 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify(h)).toString('base64url') + '.sig';
  await A.fill('#sy-key', jwt({ role: 'service_role' })); await A.click('#sy-go'); await A.waitForTimeout(500); ok((await A.locator('#sy-err').innerText()).includes('مفتاح سري'), 'service_role JWT refused');
  await A.fill('#sy-key', srv.KEY); await A.fill('#sy-name', 'جهاز المدير'); await A.click('#sy-go'); await A.waitForSelector('#sy-code', { timeout: 15000 });
  const code = await A.inputValue('#sy-code'); ok(/^CAFE1\.[A-Za-z0-9_-]{40,}$/.test(code), 'pairing code issued');
  await A.click('#app-modal [data-a="close-modal"]'); await A.waitForTimeout(1500);
  const rows = await srv.be.all(); console.log('  cloud rows after seed:', rows.length, 'keys:', rows.map(r => r.k).slice(0, 12).join(' '));
  ok(rows.length >= 8 && ['invoices:1001', 'users:1', 'shop:shop'].every(k => rows.some(r => r.k === k)), 'existing data uploaded (invoice, users, products...)');
  ok(!rows.some(r => /مشكاك|salem|مقهى|ريش/.test(Buffer.from(r.d, 'base64').toString('utf8'))), 'cloud payload is encrypted (no readable names)');
  ok(/متزامن/.test(await chip(A)), 'A chip: synced — ' + (await chip(A)));

  /* ٣) الجهاز الثاني: رمز خاطئ ثم الصحيح */
  await B.goto(H.URL); await B.waitForTimeout(900);
  await B.click('#setup-form [data-m="join"]'); await B.waitForSelector('#jn-code', { state: 'visible' });
  await B.fill('#jn-code', 'garbage'); await B.click('#jn-btn'); await B.waitForTimeout(400);
  ok((await B.locator('#jn-err').innerText()).includes('رمز الربط'), 'B: garbage code rejected');
  const bad = code.slice(0, -4) + (code.endsWith('AAAA') ? 'BBBB' : 'AAAA');
  await B.fill('#jn-code', bad); await B.click('#jn-btn'); await B.waitForTimeout(800);
  ok(await B.locator('#jn-err').isVisible(), 'B: tampered code rejected: ' + (await B.locator('#jn-err').innerText()));
  await B.fill('#jn-code', code); await B.fill('#jn-name', 'كاشير الصالة'); await B.click('#jn-btn');
  await B.waitForSelector('#login-form:not(.hidden)', { timeout: 20000 }); ok(true, 'B: joined and reached the login screen');
  await H.login(B, acct.user, acct.pass); await B.waitForSelector('#app-view:not(.hidden)', { timeout: 8000 }).catch(() => {}); ok(await B.locator('#app-view').isVisible(), 'B: manager account from A works on B');
  await H.nav(B, 'invoices'); ok((await txt(B)).includes('1001'), 'B sees invoice 1001 made on A before linking');
  await H.nav(B, 'products'); ok((await B.locator('#prod-grid > div').count()) === 2, 'B has the 2 products');
  await H.nav(B, 'inventory'); ok((await txt(B)).includes('مشكاك لحم 9 حبة'), 'B stock is 9 (10 − 1 sold on A)');
  await H.nav(B, 'settings'); ok((await txt(B)).includes('جهاز المدير') && (await txt(B)).includes('كاشير الصالة'), 'both devices listed on B');
  ok(/متزامن/.test(await chip(B)), 'B chip synced');

  /* ٤) بيع من الجهاز الثاني يظهر على الأول، برقم بحرف الجهاز */
  const rb = await H.sell(B, 'مشكاك', { recv: '5' }); ok(/#B1001/.test(rb), 'B invoice numbered B1001 : ' + rb.slice(0, 60));
  await H.nav(A, 'invoices'); await A.waitForTimeout(1200); await syncNow(A);
  ok((await txt(A)).includes('B1001'), 'A sees B1001 after sync');
  await H.nav(A, 'inventory'); ok((await txt(A)).includes('مشكاك لحم 8 حبة'), 'A stock is 8 after B sale');
  await A.fill('#pos-search', '').catch(() => {});

  /* ٥) بيع متزامن من الجهازين في نفس اللحظة */
  await Promise.all([H.sell(A, 'مشكاك'), H.sell(B, 'مشكاك')]); await A.waitForTimeout(1500);
  await syncNow(A); await syncNow(B);
  const ia = await invIds(A), ib = await invIds(B); console.log('  invoice ids A/B:', ia.join(','), '|', ib.join(','));
  ok(ia.length === 4 && JSON.stringify(ia) === JSON.stringify(ib), 'same 4 invoices on both after simultaneous sales');
  ok(new Set(ia).size === 4, 'no duplicate invoice ids');

  /* ٥ب) الشاشة تتحدث لوحدها، لكن ما تلمس سلة المبيعات ولا نافذة الدفع المفتوحة */
  await H.nav(A, 'dashboard'); await H.nav(B, 'dashboard'); const dash0 = await txt(A); await H.sell(B, 'مشكاك'); await H.nav(B, 'dashboard'); await B.waitForTimeout(1200); await syncNow(A, 800); await A.waitForTimeout(2500);
  const dashA = await txt(A), dashB = await txt(B); ok(dashA !== dash0, 'A dashboard refreshed by itself after remote sale'); ok(dashA === dashB, 'dashboards identical on both devices');
  await H.nav(A, 'pos'); await A.fill('#pos-search', 'مشكاك'); await A.waitForTimeout(150); await A.locator('#pos-products-grid > button').first().dispatchEvent('click'); await A.waitForTimeout(150);
  await A.click('#btn-pay'); await A.waitForSelector('#p-ok');
  await H.sell(B, 'مشكاك'); await B.waitForTimeout(1200); await syncNow(A, 800); await A.waitForTimeout(3000);
  ok(await A.locator('#p-ok').isVisible(), 'A payment modal not closed by incoming data');
  await A.click('#app-modal [data-a="close-modal"]'); await A.waitForTimeout(2200);
  ok((await A.locator('#cart-items').innerText()).includes('مشكاك'), 'A cart kept after incoming data');
  await A.click('#btn-pay'); await A.waitForTimeout(200); await A.click('#p-ok'); await A.waitForSelector('#invoice-preview-modal:not(.hidden)', { timeout: 5000 }); await A.click('[data-a="pv-close"]'); await A.fill('#pos-search', ''); await A.waitForTimeout(1200);
  await syncNow(B); await syncNow(A);

  /* ٦) إلغاء فاتورة على A يظهر على B */
  await H.nav(A, 'invoices'); await A.locator('#invoices-table-body tr').first().locator('[data-a="inv"]').click(); await A.waitForSelector('[data-a="cancel-start"]');
  await A.click('[data-a="cancel-start"]'); await A.click('[data-a="reason"] >> nth=0'); await A.click('#cancel-ok'); await A.waitForTimeout(1200); await syncNow(B);
  const dB = await dump(B); ok(dB.invoices.filter(i => i.status === 'cancelled').length === 1, 'cancellation reached B');
  await H.nav(B, 'inventory'); await H.nav(A, 'inventory'); ok((await txt(B)).match(/مشكاك لحم \d+ حبة/)[0] === (await txt(A)).match(/مشكاك لحم \d+ حبة/)[0] && /مشكاك لحم 4 حبة/.test(await txt(B)), 'stock equal on both after sales and cancel (10 − 7 sold + 1 cancelled = 4): ' + (await txt(B)).match(/مشكاك لحم \d+ حبة/));

  /* ٧) انقطاع الإنترنت: الجهاز يكمل شغله ويرسل لما يرجع */
  srv.st.fail = true;
  await H.sell(B, 'مشكاك'); await H.sell(B, 'مشكاك'); await B.waitForTimeout(1500); await syncNow(B);
  ok(/بدون اتصال/.test(await chip(B)), 'B chip shows offline: ' + (await chip(B)));
  ok(/\(\d+\)/.test(await chip(B)), 'B chip shows pending count');
  await B.reload(); await B.waitForTimeout(1200);
  ok(await B.locator('#app-view').isVisible(), 'B reloads offline straight into the app');
  const before = (await invIds(A)).length; srv.st.fail = false; await syncNow(B, 1500); await syncNow(A);
  const ia2 = await invIds(A), ib2 = await invIds(B);
  ok(ia2.length === before + 2 && JSON.stringify(ia2) === JSON.stringify(ib2), 'offline sales reached A after reconnect (survived reload): ' + ia2.length);
  ok(!/\(\d+\)/.test(await chip(B)), 'pending cleared on B');

  /* ٨) عميل جديد على B، فاتورة آجلة على A، ثم حذف العميل */
  await H.nav(B, 'customers'); await B.click('[data-a="newcust"]'); await B.fill('#nc-n', 'خالد'); await B.fill('#nc-p', '99111222'); await B.click('[data-a="nc-ok"]'); await B.waitForTimeout(1200);
  await syncNow(A); await H.nav(A, 'customers'); ok((await txt(A)).includes('خالد'), 'customer created on B appears on A');
  /* تعديل سعر صنف على A يصل B */
  await H.nav(A, 'products'); await A.locator('#prod-grid > div').first().click().catch(() => {});
  /* حذف العميل (رصيده صفر) */
  await H.nav(A, 'customers'); await A.locator('[data-a="cust-del"]').first().click(); await A.click('[data-a="cust-del-ok"]'); await A.waitForTimeout(1200); await syncNow(B);
  await H.nav(B, 'customers'); ok(!(await txt(B)).includes('خالد'), 'customer deletion reached B');

  /* ٩) إقفال الوردية على A يظهر على B، وفتح وردية من B يظهر على A */
  await closeShift(A, 30); await syncNow(B);
  await H.nav(B, 'shift'); ok(!(await txt(B)).includes('حساب الصندوق'), 'B sees the shift closed by A');
  await H.openShift(B, '15'); await B.waitForTimeout(1200); await syncNow(A);
  await H.nav(A, 'shift'); ok((await txt(A)).includes('حساب الصندوق'), 'A sees the shift opened on B');

  /* ١٠) فتح وردية في نفس اللحظة من جهازين (الجهازين بدون اتصال): وحدة بس تبقى مفتوحة */
  await closeShift(A, 15); await syncNow(B);
  srv.st.fail = true; await H.openShift(A, '10'); await H.openShift(B, '12'); srv.st.fail = false;
  await syncNow(A, 1500); await syncNow(B, 1500); await syncNow(A, 1500);
  const dA = await dump(A), dB2 = await dump(B), open = d => d.shifts.filter(s => !s.end);
  ok(open(dA).length === 1 && open(dB2).length === 1 && open(dA)[0].id === open(dB2)[0].id, 'after race exactly one shift stays open and it is the same on both: ' + open(dA).length + '/' + open(dB2).length);

  /* ١١) تطابق كامل بين قاعدتي الجهازين */
  await H.nav(A, 'dashboard'); await syncNow(A, 1500); await syncNow(B, 1500);
  const na = norm(await dump(A)), nb = norm(await dump(B));
  ok(na === nb, 'full database identical on both devices (' + na.length + ' bytes)');
  if (na !== nb) { const x = JSON.parse(na), y = JSON.parse(nb); for (const k in x) if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) console.log('  differs in', k, JSON.stringify(x[k]).length, JSON.stringify(y[k]).length); }

  /* ١١ب) المؤشر يتقدم لما تكبر السجلات، وسجل تالف في الخدمة ما يوقف المزامنة */
  srv.be.setSkew(60); await syncNow(A, 1200); await syncNow(A, 1200);
  const cur = async p => (await dump(p)).kv.find(r => r.k === 'sync').v.cursor; const c1 = await cur(A); ok(c1 > 0, 'sync cursor advanced past old records: ' + c1);
  const shop = (await srv.be.all())[0].shop; await srv.be.push(shop, [{ k: 'invoices:999', dev: 'X', d: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAA' }]);
  await H.sell(B, 'مشكاك'); await B.waitForTimeout(1200); await syncNow(A, 1500);
  const na2 = (await dump(A)).invoices.length, nb2 = (await dump(B)).invoices.length; ok(na2 === nb2, 'sync continues past a corrupted cloud record: ' + na2 + '/' + nb2);
  await H.nav(A, 'settings'); ok((await txt(A)).includes('تعذّرت قراءة 1 سجل'), 'A warns about the unreadable record');
  srv.be.setSkew(0);

  /* ١٢) الاسترجاع ممنوع أثناء الربط، وإيقاف الربط */
  await H.nav(A, 'settings'); await A.setInputFiles('#bk-file', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'cafe-pos', v: 1, kv: { meta: {}, users: [] }, invoices: [], shifts: [], custPays: [], expenses: [], purchases: [], suppPays: [], adjusts: [] })) });
  await A.waitForTimeout(500); ok(!(await A.locator('[data-a="restore-ok"]').count()), 'restore blocked while linked');
  await A.click('[data-a="sync-off"]'); await A.click('[data-a="sync-off-ok"]'); await A.waitForTimeout(500);
  ok(!(await A.locator('#sync-chip').isVisible()) && (await txt(A)).includes('تفعيل الربط'), 'unlinking works, data stays');
  await A.reload(); await A.waitForTimeout(1000); ok((await invIds(A)).length >= 9, 'A keeps its data after unlinking and reload');

  console.log('errors A:', mA.errs.slice(0, 5), 'B:', mB.errs.slice(0, 5));
  ok(mA.errs.length === 0 && mB.errs.length === 0, 'no page errors on either device');
  await browser.close(); await srv.close();
})().catch(e => { console.error(e); process.exit(1); });
