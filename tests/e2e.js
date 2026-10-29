const H = require('./helpers'); const fs = require('fs'); const { ok, txt, toast } = H;
(async () => {
  const browser = await H.launch(); const { ctx, errs } = await H.mkctx(browser); let p = await H.mkpage(ctx, errs);
  await p.goto(H.URL); await p.waitForTimeout(900);

  /* 1) أول تشغيل */
  ok(await p.locator('#setup-form').isVisible(), 'first run shows the setup form');
  ok(!(await p.locator('#login-form').isVisible()), 'login form hidden on first run');
  await p.click('#setup-form button[type=submit]'); console.log('  empty:', await p.locator('#reg-err').innerText());
  await p.fill('#reg-store', 'مقهى الجمر'); await p.fill('#reg-name', 'سالم'); await p.fill('#reg-phone', '99765432'); await p.fill('#reg-user', 'salem'); await p.fill('#reg-pass', '5678'); await p.fill('#reg-pass2', '0000');
  await p.click('#setup-form button[type=submit]'); console.log('  mismatch:', await p.locator('#reg-err').innerText());
  const acct = await H.setup(p); console.log('  recovery code:', acct.code);
  ok(/^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/.test(acct.code), 'recovery code format');
  ok((await txt(p)).includes('ابدأ من هنا'), 'empty store shows the start card');
  ok((await p.locator('#sidebar-store-title').innerText()) === 'مقهى الجمر', 'store name in sidebar');

  /* 2) أصناف + وردية + بيع */
  await H.nav(p, 'products');
  await H.addProd(p, { n: 'مشكاك لحم', p: '1', c: '0.45', stock: 10, icon: '🍢' });
  await H.addProd(p, { n: 'ريش غنم', p: '4.5', c: '2.2', svc: true, icon: '🍖' });
  await H.addProd(p, { n: 'بيتزا', svc: true, sizes: [4, 6, 8], icon: '🍕' });
  ok((await p.locator('#prod-grid > div').count()) === 3, '3 products added');
  await H.nav(p, 'pos'); console.log('  pos while no shift:', (await p.locator('#cart-items').innerText()).replace(/\s+/g, ' '));
  await H.openShift(p, '20');
  const r1 = await H.sell(p, 'مشكاك', { recv: '5' }); ok(r1.includes('#1001') && r1.includes('مشكاك لحم'), 'first invoice is #1001 : ' + r1.slice(0, 120));
  const r2 = await H.sell(p, 'ريش'); ok(r2.includes('#1002'), 'second invoice is #1002');
  await H.nav(p, 'inventory'); console.log('  inventory:', (await txt(p)).match(/مشكاك لحم[^ج]*جرد/)?.[0]);

  /* 3) كل شيء يبقى بعد التحديث */
  await H.nav(p, 'pos'); await p.fill('#pos-search', 'مشكاك'); await p.waitForTimeout(100);
  await p.locator('#pos-products-grid > button').first().dispatchEvent('click'); await p.waitForTimeout(100);
  const dump = () => p.evaluate(async () => { const o = {}; for (const n of ['kv', 'invoices', 'shifts', 'custPays', 'expenses', 'purchases', 'suppPays', 'adjusts']) o[n] = await new Promise(r => { const q = indexedDB.open('cafe-pos'); q.onsuccess = () => { const g = q.result.transaction(n).objectStore(n).getAll(); g.onsuccess = () => { q.result.close(); r(g.result.length); }; }; }); return o; });
  console.log('  idb counts before reload:', JSON.stringify(await dump()));
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.locator('#app-view').isVisible(), 'remembered session: straight into the app');
  ok((await p.locator('#cart-items').innerText()).includes('مشكاك'), 'unfinished cart survives reload');
  await H.nav(p, 'invoices'); const inv = await txt(p); ok(inv.includes('1001') && inv.includes('1002'), 'invoices persisted');
  await H.nav(p, 'products'); ok((await p.locator('#prod-grid > div').count()) === 3, 'products persisted');
  await H.nav(p, 'inventory'); ok((await txt(p)).includes('مشكاك لحم 9 حبة'), 'stock persisted (10-1=9) : ' + (await txt(p)).match(/مشكاك لحم[^ج]*جرد/)?.[0]);
  await H.nav(p, 'shift'); ok((await txt(p)).includes('حساب الصندوق'), 'open shift persisted');
  await H.nav(p, 'dashboard'); ok((await txt(p)).includes('12.500') || (await txt(p)).includes('5.500'), 'sales total visible : ' + (await txt(p)).match(/مبيعات الوردية[^ع]*ر\.ع/)?.[0]);

  /* 4) إلغاء فاتورة ويبقى بعد التحديث */
  await H.nav(p, 'invoices'); await p.locator('[data-a="inv"][data-id="1002"]').first().click(); await p.waitForTimeout(150);
  await p.click('[data-a="cancel-start"]'); await p.click('[data-a="reason"]'); await p.click('[data-a="cancel-ok"]'); await p.waitForTimeout(300);
  await p.reload(); await p.waitForTimeout(900); await H.nav(p, 'invoices');
  ok((await p.locator('#invoices-table-body tr', { hasText: '1002' }).innerText()).includes('ملغاة'), 'cancellation persisted');

  /* 5) الخروج والدخول والاسترجاع بالرمز */
  await p.click('[data-a="logout"]'); await p.waitForTimeout(200); ok(await p.locator('#login-form').isVisible(), 'logout -> login form');
  await H.login(p, 'salem', 'bad'); console.log('  bad:', await p.locator('#login-err').innerText());
  await H.login(p, 'salem', '5678'); ok(await p.locator('#app-view').isVisible(), 'login works after reload');
  await p.click('[data-a="logout"]'); await p.click('[data-a="auth-mode"][data-m="forgot"]');
  await p.fill('#fg-user', 'salem'); await p.fill('#fg-code', 'AAAA-AAAA-AAAA-AAAA'); await p.fill('#fg-pass', '9999'); await p.fill('#fg-pass2', '9999'); await p.click('#forgot-form button[type=submit]'); await p.waitForTimeout(500);
  console.log('  wrong recovery:', await p.locator('#fg-err').innerText());
  await p.fill('#fg-code', acct.code.toLowerCase().replace(/-/g, ' ')); await p.click('#forgot-form button[type=submit]'); await p.waitForSelector('#rec-code', { timeout: 5000 });
  const code2 = (await p.locator('#rec-code').innerText()).trim(); ok(code2 !== acct.code, 'recovery code rotated');
  await p.check('#rec-ack'); await p.click('#rec-done'); await p.waitForTimeout(300);
  await H.login(p, 'salem', '5678'); ok(await p.locator('#login-form').isVisible(), 'old password no longer works');
  await H.login(p, 'salem', '9999'); ok(await p.locator('#app-view').isVisible(), 'new password works');

  /* 6) كاشير: إضافة وحذف */
  await H.nav(p, 'settings'); await p.click('[data-a="user-new"]'); await p.fill('#un-n', 'ناصر'); await p.fill('#un-u', 'nasser'); await p.fill('#un-p', '4321'); await p.click('[data-a="user-new-ok"]'); await p.waitForTimeout(500);
  ok((await txt(p)).includes('nasser'), 'cashier added');

  /* 7) نسخة احتياطية ثم مسح كامل ثم استرجاع */
  /* مسار المشاركة (iPad): نتحقق أن الملف يُسلَّم لقائمة المشاركة */
  await p.evaluate(() => { window.__shared = null; navigator.canShare = () => true; navigator.share = async d => { window.__shared = { n: d.files[0].name, t: d.files[0].type, s: d.files[0].size }; }; });
  await p.click('#main-content-area [data-a="bk-save"]'); await p.waitForTimeout(500);
  const shared = await p.evaluate(() => window.__shared); ok(shared && /^cafe-backup-.*\.json$/.test(shared.n) && shared.s > 1000, 'share-sheet path gets a .json file: ' + JSON.stringify(shared));
  /* مسار التنزيل (احتياطي) */
  await p.evaluate(() => { navigator.canShare = undefined; });
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.click('#main-content-area [data-a="bk-save"]')]);
  const path = '/tmp/claude-0/backup-test.json'; await dl.saveAs(path); const bk = JSON.parse(fs.readFileSync(path, 'utf8'));
  ok(bk.app === 'cafe-pos' && bk.invoices.length === 2 && Object.keys(bk.kv.products).length === 3 && bk.kv.users.length === 2, 'backup file content: ' + dl.suggestedFilename() + ' invoices=' + bk.invoices.length);
  ok(!/5678|9999|4321/.test(fs.readFileSync(path, 'utf8')), 'backup has no plain password');
  await p.waitForTimeout(300); ok((await txt(p)).includes('آخر نسخة'), 'last backup recorded');
  await p.evaluate(() => new Promise(r => { const q = indexedDB.deleteDatabase('cafe-pos'); q.onsuccess = q.onerror = q.onblocked = () => r(); setTimeout(r, 1500); }));
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  ok(await p.locator('#setup-form').isVisible(), 'after wipe: setup form again');
  await p.setInputFiles('#bk-file-setup', path); await p.waitForTimeout(300); console.log('  restore dialog:', (await p.locator('#modal-box').innerText()).replace(/\s+/g, ' ').slice(0, 140));
  await p.click('[data-a="restore-ok"]'); await p.waitForTimeout(1500);
  ok(await p.locator('#login-form').isVisible(), 'after restore: login form'); await H.login(p, 'salem', '9999'); ok(await p.locator('#app-view').isVisible(), 'login with restored account');
  await H.nav(p, 'invoices'); ok((await txt(p)).includes('1001'), 'restored invoices'); await H.nav(p, 'products'); ok((await p.locator('#prod-grid > div').count()) === 3, 'restored products');
  const r3 = await H.sell(p, 'مشكاك'); ok(r3.includes('#1003'), 'numbering continues after restore (#1003)');

  /* 8) بدون إنترنت */
  await p.reload(); await p.waitForTimeout(1200);
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return { reg: !!r, ctl: !!navigator.serviceWorker.controller, keys: await caches.keys() }; }); console.log('  sw:', JSON.stringify(sw));
  ok(sw.reg && sw.ctl, 'service worker controls the page');
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1200);
  ok(await p.locator('#app-view').isVisible(), 'OFFLINE: app loads from cache and shows the app');
  const r4 = await H.sell(p, 'ريش'); ok(r4.includes('#1004'), 'OFFLINE: sale works (#1004)');
  await ctx.setOffline(false);

  console.log('\nERRORS:', JSON.stringify(errs)); await browser.close();
})().catch(e => { console.error('TESTFAIL', e.message.split('\n').slice(0, 8).join(' | ')); process.exit(1); });
