/* أداء الربط: جهاز عليه N فاتورة يرفعها لأول مرة، وجهاز ثاني يسحبها، ثم بيعة واحدة تنتقل بينهما — تحت إبطاء المعالج (آيباد تقريباً)
   تشغيل: node tests/syncperf.js [عدد الفواتير=20000] [الإبطاء=4]   (الشبكة هنا محلية، فزمن الإنترنت الحقيقي يُضاف) */
const H = require('./helpers'), S = require('./syncserver'), fs = require('fs');
const N = +process.argv[2] || 20000, RATE = +process.argv[3] || 4, file = `/tmp/claude-0/fixture-${N}.json`;
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(require('./fixture').make({ invoices: N })));
const dumpCounts = p => p.evaluate(async () => { const db = await new Promise(r => { const q = indexedDB.open('cafe-pos'); q.onsuccess = () => r(q.result); }); const o = {}; for (const n of ['invoices', 'shifts', 'custPays', 'expenses']) o[n] = await new Promise(r => { const q = db.transaction(n).objectStore(n).count(); q.onsuccess = () => r(q.result); }); db.close(); return o; });
(async () => {
  const srv = await S.start(8132); const browser = await H.launch();
  const mA = await H.mkctx(browser), mB = await H.mkctx(browser); const A = await H.mkpage(mA.ctx, mA.errs), B = await H.mkpage(mB.ctx, mB.errs);
  const T = async (label, fn) => { const t = Date.now(); const r = await fn(); console.log(`  ${label.padEnd(44)} ${String(Date.now() - t).padStart(7)} ms`); return r; };
  console.log(`── ${N} invoices, CPU x${RATE} ──`);
  await A.goto(H.URL); await A.waitForTimeout(800);
  await A.setInputFiles('#bk-file-setup', file); await A.waitForSelector('[data-a="restore-ok"]', { timeout: 180000 });
  await A.click('[data-a="restore-ok"]'); await A.waitForSelector('#login-form:not(.hidden)', { timeout: 300000 });
  await H.login(A, 'admin', '1234'); await A.waitForSelector('#app-view:not(.hidden)', { timeout: 60000 });
  const cdpA = await mA.ctx.newCDPSession(A); await cdpA.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await H.nav(A, 'settings'); await A.click('[data-a="sync-on"]'); await A.fill('#sy-url', srv.url); await A.fill('#sy-key', srv.KEY);
  const code = await T('A: first upload (encrypt + send everything)', async () => { await A.click('#sy-go'); await A.waitForSelector('#sy-code', { timeout: 900000 }); return A.inputValue('#sy-code'); });
  const rows = await srv.be.all(); console.log('  cloud rows:', rows.length, '| payload', Math.round(rows.reduce((a, r) => a + r.d.length, 0) / 1048576), 'MB');
  await A.click('#app-modal [data-a="close-modal"]');
  await B.goto(H.URL); await B.waitForTimeout(800); const cdpB = await mB.ctx.newCDPSession(B); await cdpB.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await B.click('#setup-form [data-m="join"]'); await B.fill('#jn-code', code);
  await T('B: join (download + decrypt + save everything)', async () => { await B.click('#jn-btn'); await B.waitForSelector('#login-form:not(.hidden)', { timeout: 900000 }); });
  await T('B: login', async () => { await H.login(B, 'admin', '1234'); await B.waitForSelector('#app-view:not(.hidden)', { timeout: 60000 }); });
  const ca = await dumpCounts(A), cb = await dumpCounts(B); console.log('  counts A', JSON.stringify(ca), 'B', JSON.stringify(cb));
  H.ok(JSON.stringify(ca) === JSON.stringify(cb) && ca.invoices > N * 0.99, 'B has every record A has');
  await T('B: reload (boot with link on)', async () => { await B.reload(); await B.waitForSelector('#app-view:not(.hidden)', { timeout: 120000 }); });
  await H.nav(B, 'pos'); await H.openShift(B, '5').catch(() => {});
  await H.nav(A, 'dashboard'); const before = await dumpCounts(A);
  await T('B: sale', async () => { await H.sell(B, 'مشكاك'); });
  await B.waitForTimeout(1500);
  await T('A: receive that sale (poll + decrypt + merge)', async () => { await A.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await A.waitForFunction(async n => { const db = await new Promise(r => { const q = indexedDB.open('cafe-pos'); q.onsuccess = () => r(q.result); }); const c = await new Promise(r => { const q = db.transaction('invoices').objectStore('invoices').count(); q.onsuccess = () => r(q.result); }); db.close(); return c > n; }, before.invoices, { timeout: 60000 }); });
  const heap = p => p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1); console.log('  JS heap A/B:', await heap(A), '/', await heap(B), 'MB');
  console.log('errors:', mA.errs.slice(0, 3), mB.errs.slice(0, 3));
  await browser.close(); await srv.close();
})().catch(e => { console.error(e); process.exit(1); });
