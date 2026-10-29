/* مسارات الواجهة على بيانات جاهزة (نسخة fixture-300): تمرير نقطة البيع، الدفع بأنواعه، الفاتورة، العملاء، الموردين، الوردية، الإعدادات */
const H = require('./helpers'); const fs = require('fs'); const { ok, txt, toast } = H;
const used = new Set();
(async () => {
  const browser = await H.launch(); const { ctx, errs } = await H.mkctx(browser);
  const grab = async p => (await p.evaluate(() => { const s = new Set(); document.querySelectorAll('[class]').forEach(e => { const c = e.getAttribute('class'); if (typeof c === 'string') c.split(/\s+/).forEach(x => x && s.add(x)); }); return [...s]; })).forEach(c => used.add(c));
  const reqs = []; ctx.on('request', r => { const u = r.url(); if (!u.startsWith(H.URL) && !u.startsWith('data:') && !u.startsWith('blob:') && !/fonts\.g/.test(u)) reqs.push(u); });
  const restore = async p => { await p.goto(H.URL); await p.waitForTimeout(800); await p.setInputFiles('#bk-file-setup', '/tmp/claude-0/fixture-300.json'); await p.waitForSelector('[data-a="restore-ok"]'); await p.click('[data-a="restore-ok"]'); await p.waitForSelector('#login-form:not(.hidden)', { timeout: 60000 }); };
  const M = p => p.evaluate(() => { const q = s => document.querySelector(s); const g = q('#pos-products-grid'), c = q('#cart-items'), m = q('#main-content-area');
    return { win: [Math.round(scrollY), document.documentElement.scrollHeight - innerHeight], main: [Math.round(m.scrollTop), m.scrollHeight - m.clientHeight], grid: [Math.round(g.scrollTop), g.scrollHeight - g.clientHeight], cart: [Math.round(c.scrollTop), c.scrollHeight - c.clientHeight] }; });

  let p = await H.mkpage(ctx, errs); await restore(p); await H.login(p, 'admin', '1234'); await grab(p);
  ok((await p.locator('#page-title').innerText()) === 'الرئيسية', 'admin lands on dashboard'); console.log('  dashboard:', (await txt(p)).slice(0, 160));

  /* ── 1) تمرير نقطة البيع: الصفحة ثابتة، المنتجات والسلة كلٌّ لوحدها ── */
  for (const [w, h, tag] of [[1024, 768, 'ipad-land'], [768, 1024, 'ipad-port'], [1366, 1024, 'pro-land'], [390, 844, 'phone']]) {
    const q = await H.mkpage(ctx, errs); await q.setViewportSize({ width: w, height: h }); await q.goto(H.URL); await q.waitForTimeout(900);
    if (await q.locator('#login-form').isVisible()) await H.login(q, 'khaled', '1111'); await q.waitForTimeout(300);
    await q.evaluate(() => { location.hash = 'pos'; }); await q.waitForTimeout(400);
    for (let i = 0; i < 30; i++) await q.locator('#pos-products-grid > button').nth(i % 17).dispatchEvent('click');
    await q.waitForTimeout(200);
    const g = q.locator('#pos-products-grid'), c = q.locator('#cart-items'); const gb = await g.boundingBox();
    const st = await M(q); await q.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await q.mouse.wheel(0, 400); await q.waitForTimeout(200); const a = await M(q);
    if (w < 1024) { await q.click('#mobile-fab'); await q.waitForTimeout(500); }
    const cb = await c.boundingBox(); await q.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await q.mouse.wheel(0, 300); await q.waitForTimeout(200);
    const b = await M(q);
    const fixedPage = b.win[0] === 0 && b.main[0] === 0, gridScrolls = a.grid[0] > 0 || a.grid[1] === 0, cartScrolls = b.cart[0] > 0 || b.cart[1] === 0;
    ok(fixedPage && gridScrolls && cartScrolls, `[${tag} ${w}x${h}] page fixed, grid + cart scroll separately ${JSON.stringify({ start: st.grid, afterGrid: a.grid, afterCart: b.cart, win: b.win, main: b.main })}`);
    await q.close();
  }

  /* ── 2) الدفع: كاش مع خصم ومستلم وباقي، سيارة وملاحظة، ثم آجل بدون عميل ثم بعميل، ثم فيزا ── */
  await H.nav(p, 'pos'); await grab(p);
  const add = async q => { await p.fill('#pos-search', q); await p.waitForTimeout(120); await p.locator('#pos-products-grid > button').first().dispatchEvent('click'); await p.waitForTimeout(80); };
  await add('مشكاك لحم'); await add('كباب'); await add('شاي');
  await p.locator('#cart-items > div').first().locator('input[id^="ctot"]').fill('0.500'); await p.waitForTimeout(100);
  console.log('  cart:', await txt(p, '#cart-items')); ok((await p.locator('#cart-items > div').first().locator('input[id^="cqty"]').inputValue()) === '0.5', 'sell-by-amount: 0.500 ر.ع = 0.5 qty');
  await p.fill('#pos-search', ''); await p.click('#btn-pay'); await p.waitForTimeout(200); await grab(p);
  await p.click('[data-a="otype"][data-k="car"]'); await p.fill('#oref', '12345 أ'); await p.fill('#odisc', '0.300'); await p.fill('#onote', 'بدون بصل'); await p.fill('#p-recv', '10');
  console.log('  checkout:', (await txt(p, '#modal-box')).slice(0, 200));
  await p.click('[data-a="pq"][data-k="credit"]'); await p.click('#p-ok'); await p.waitForTimeout(200); console.log('  credit w/o customer:', await toast(p));
  await p.selectOption('#p-cust', { index: 1 }); const custName = await p.locator('#p-cust option:checked').innerText();
  await p.click('#p-ok'); await p.waitForSelector('#invoice-preview-modal:not(.hidden)');
  const rc = await txt(p, '#invoice-preview-content'); ok(rc.includes('12345 أ') && rc.includes('بدون بصل') && rc.includes('الخصم') && rc.includes(custName), 'receipt: car, note, discount, customer'); console.log('  receipt:', rc.slice(0, 260));
  ok((await p.locator('#invoice-preview-content img').count()) >= 1, 'receipt has QR image (local library)');
  /* واتساب / مشاركة PDF / طباعة */
  await p.click('[data-a="pv-wa"]'); await p.waitForTimeout(150); await p.fill('#wa-phone', '99123456'); const href = await p.getAttribute('#wa-send', 'href'); ok(/^https:\/\/wa\.me\/96899123456\?text=/.test(href), 'WhatsApp link: ' + href.slice(0, 50)); await p.click('[data-a="wa-close"]');
  await p.evaluate(() => { window.__f = null; navigator.canShare = () => true; navigator.share = async d => { window.__f = { n: d.files[0].name, t: d.files[0].type, s: d.files[0].size }; }; });
  await p.waitForTimeout(2500);   /* التجهيز المسبق */
  const t0 = Date.now(); await p.click('[data-a="pv-share"]'); await p.waitForFunction(() => window.__f, null, { timeout: 30000 }); console.log('  share latency after prepare:', Date.now() - t0, 'ms'); const f = await p.evaluate(() => window.__f); ok(f.t === 'application/pdf' && f.s > 3000, 'PDF made with local html2pdf and handed to share sheet: ' + JSON.stringify(f));
  await p.click('[data-a="pv-close"]'); await H.nav(p, 'settings'); await p.selectOption('#st-share', 'png'); await p.click('[data-a="set-save"]'); await p.waitForTimeout(200); await H.nav(p, 'invoices'); await p.locator('[data-a="inv-prev"]').first().click(); await p.waitForTimeout(2500);
  await p.evaluate(() => { window.__f = null; }); await p.click('[data-a="pv-share"]'); await p.waitForFunction(() => window.__f, null, { timeout: 30000 }); const f2 = await p.evaluate(() => window.__f); ok(f2.t === 'image/png' && f2.s > 5000, 'PNG share for printer apps: ' + JSON.stringify(f2));
  await p.click('[data-a="pv-close"]'); await H.nav(p, 'settings'); await p.selectOption('#st-share', 'pdf'); await p.click('[data-a="set-save"]'); await p.waitForTimeout(200); await H.nav(p, 'invoices'); await p.locator('[data-a="inv-prev"]').first().click(); await p.waitForTimeout(500);
  await p.evaluate(() => { const o = document.createElement; window.__ifr = null; const ap = document.body.appendChild.bind(document.body); document.body.appendChild = n => { if (n.tagName === 'IFRAME') window.__ifr = n; return ap(n); }; });
  await p.click('[data-a="pv-print"]'); await p.waitForTimeout(300); const pr = await p.evaluate(() => { const f = window.__ifr; if (!f) return null; const h = f.contentDocument.documentElement.outerHTML; return { page72: h.includes('72mm'), hasPrint: h.includes('print()') }; }); ok(pr && pr.page72 && pr.hasPrint, 'print page 72mm: ' + JSON.stringify(pr));
  await p.click('[data-a="pv-close"]'); await H.nav(p, 'pos');
  await add('بيتزا'); console.log('  size picker:', (await p.locator('#modal-box').innerText()).replace(/\s+/g, ' ')); await p.locator('[data-a="vpick"]').nth(2).click(); await p.waitForTimeout(100);
  console.log('  cart:', await txt(p, '#cart-items')); await p.fill('#pos-search', ''); await p.click('#btn-pay'); await p.waitForTimeout(200); await p.click('[data-a="pq"][data-k="visa"]'); await p.click('#p-ok'); await p.waitForSelector('#invoice-preview-modal:not(.hidden)');
  ok((await txt(p, '#invoice-preview-content')).includes('بيتزا (كبير)') && (await txt(p, '#invoice-preview-content')).includes('فيزا'), 'visa sale with size on the receipt'); await p.click('[data-a="pv-close"]');
  await H.nav(p, 'invoices'); await grab(p); const body = await txt(p); ok(body.includes('آجل') && body.includes('فيزا'), 'invoices list shows credit + visa');
  /* بحث برقم فاتورة قديمة من وردية أخرى */
  await p.fill('#inv-search', '1005'); await p.waitForTimeout(200); ok((await p.locator('#invoices-table-body tr').count()) === 1, 'invoice number search crosses shifts');
  await p.fill('#inv-search', ''); await p.waitForTimeout(100);

  /* ── 3) العملاء: سداد، رد، حذف ── */
  await H.nav(p, 'customers'); await grab(p);
  const row = p.locator('#customers-table-body tr', { hasText: custName }); await row.locator('[data-a="custpay"]').click(); await p.waitForTimeout(150); await p.click('[data-a="cp-full"]'); await p.click('#cp-ok'); await p.waitForTimeout(300);
  ok((await txt(p)).includes('مسدّد'), 'customer paid in full -> مسدّد');
  await p.click('[data-a="newcust"]'); await p.fill('#nc-n', 'عميل حذف'); await p.fill('#nc-p', '99000001'); await p.click('[data-a="nc-ok"]'); await p.waitForTimeout(250);
  await p.locator('#customers-table-body tr', { hasText: 'عميل حذف' }).locator('[data-a="cust-del"]').click(); await p.click('[data-a="cust-del-ok"]'); await p.waitForTimeout(250); ok(!(await txt(p)).includes('عميل حذف'), 'customer deleted');

  /* ── 4) الموردين والمصروفات والمخزون والوردية ── */
  await H.nav(p, 'suppliers'); await grab(p); await p.fill('#sp-name', 'مورد تجربة'); await p.fill('#sp-phone', '99111222'); await p.click('[data-a="newsupp"]'); await p.waitForTimeout(250); ok((await txt(p)).includes('مورد تجربة'), 'supplier added');
  await p.click('[data-a="newpur"]'); await p.waitForTimeout(150); await p.selectOption('[data-in="pursup"]', { label: 'مورد تجربة' }); await p.selectOption('[data-f="stockId"]', { label: 'مشكاك لحم غنم' }); await p.fill('[data-f="qty"]', '50'); await p.fill('[data-f="cost"]', '12'); await p.click('[data-a="purpay"][data-k="credit"]'); await p.click('#pur-ok'); await p.waitForTimeout(300);
  console.log('  purchase:', (await toast(p))); ok((await p.locator('tbody tr', { hasText: 'مورد تجربة' }).first().innerText()).includes('12.000'), 'credit purchase -> supplier owed 12.000');
  await p.locator('tbody tr', { hasText: 'مورد تجربة' }).first().locator('[data-a="supp-del"]').click(); await p.waitForTimeout(150); console.log('  delete supplier with debt:', (await p.locator('#modal-box').innerText()).replace(/\s+/g, ' ').slice(0, 120)); await p.click('#modal-box [data-a="close-modal"]');
  await H.nav(p, 'expenses'); await grab(p); await p.fill('#e-amount', '3.5'); await p.click('[data-a="exp-ok"]'); await p.waitForTimeout(250); ok((await txt(p)).includes('3.500'), 'expense recorded');
  await H.nav(p, 'inventory'); await grab(p); await p.locator('[data-a="count"]').first().click(); await p.waitForTimeout(150); await p.fill('#c-qty', '5'); await p.click('#c-ok'); await p.waitForTimeout(250); console.log('  count:', await toast(p));
  await H.nav(p, 'profit'); await grab(p); console.log('  profit:', (await txt(p)).slice(0, 150)); await H.nav(p, 'watch'); await grab(p);
  await H.nav(p, 'shift'); await grab(p); const exp = (await txt(p)).match(/المتوقع بالصندوق ([\d.]+)/); await p.fill('#c-count', '1'); await p.click('#c-btn'); await p.waitForTimeout(200); console.log('  close dialog:', (await p.locator('#modal-box').innerText()).replace(/\s+/g, ' ').slice(0, 130));
  await p.click('[data-a="close-ok"]'); await p.waitForTimeout(900); ok((await p.locator('#modal-box').innerText()).includes('نسخة احتياطية'), 'backup prompt after closing the shift'); await p.click('#modal-box [data-a="close-modal"]');
  ok((await txt(p)).includes('فتح وردية جديدة'), 'shift closed -> open form'); await H.nav(p, 'pos'); await p.fill('#pos-search', 'شاي'); await p.waitForTimeout(100); await p.locator('#pos-products-grid > button').first().dispatchEvent('click'); ok(await p.locator('#btn-pay').isDisabled(), 'POS cannot charge while the shift is closed');
  await H.openShift(p, '15'); await H.nav(p, 'pos'); ok(!(await p.locator('#btn-pay').isDisabled()), 'new shift opened -> can charge');

  /* ── 5) الأصناف: تعديل وحذف ── */
  await H.nav(p, 'products'); await grab(p); await p.click('[data-a="prod-new"]'); await grab(p); await p.click('[data-a="v-preset"]'); await grab(p); await p.click('#modal-box [data-a="close-modal"]');
  await H.addProd(p, { n: 'كيك', p: '1.2', stock: 4, icon: '🍰' }); await p.locator('#prod-grid > div', { hasText: 'كيك' }).locator('[data-a="prod-del"]').click(); await p.click('[data-a="prod-del-ok"]'); await p.waitForTimeout(250); ok(!(await txt(p)).includes('كيك'), 'product deleted (history kept)');
  await H.nav(p, 'invoices'); ok((await p.locator('#invoices-table-body tr').count()) > 0, 'invoices page still fine after deleting a product');

  /* ── 6) الكاشير: صلاحيات + حذف حساب + الإعدادات ── */
  await H.nav(p, 'settings'); await grab(p); console.log('  settings:', (await txt(p)).slice(0, 220));
  await p.fill('#st-name', 'مقهى الجمر'); await p.fill('#st-float', '25'); await p.click('[data-a="set-save"]'); await p.waitForTimeout(250); ok((await p.locator('#sidebar-store-title').innerText()) === 'مقهى الجمر', 'store name saved');
  await p.click('[data-a="user-new"]'); await p.fill('#un-n', 'ناصر'); await p.fill('#un-u', 'nasser'); await p.fill('#un-p', '4321'); await p.click('[data-a="user-new-ok"]'); await p.waitForTimeout(500);
  await p.locator('tr', { hasText: 'nasser' }).locator('[data-a="user-del"]').click(); await p.click('[data-a="user-del-ok"]'); await p.waitForTimeout(250); ok(!(await txt(p)).includes('nasser'), 'cashier deleted');
  await p.click('[data-a="logout"]'); await H.login(p, 'khaled', '1111'); ok((await p.locator('#page-title').innerText()) === 'نقطة البيع', 'cashier lands on POS'); const nav = await p.locator('#sidebar-nav button').count(); ok(nav === 4, 'cashier sees 4 pages (got ' + nav + ')');
  await p.evaluate(() => { location.hash = 'settings'; }); await p.waitForTimeout(300); ok((await p.locator('#page-title').innerText()) !== 'الإعدادات', 'cashier cannot open settings');

  /* ── 7) استيراد من البرنامج القديم ── */
  await p.click('[data-a="logout"]'); await H.login(p, 'admin', '1234'); await H.nav(p, 'settings');
  const old = { products: [{ id: 1, name: 'بيتزا قديمة', price: 3.5, cost: 1.2, media: '🍕', isService: false, stock: 7, variants: [{ id: 'a', name: 'صغيرة', price: 3.5, cost: 1.2 }, { id: 'b', name: 'كبيرة', price: 5.25, cost: 2 }] }, { id: 2, name: 'عصير قديم', price: 0.8, cost: 0.3, media: '🥭', isService: true }], customers: [{ id: 1, name: 'عميل قديم', phone: '99887766', debt: 3 }], suppliers: [{ name: 'مورد قديم' }] };
  fs.writeFileSync('/tmp/claude-0/old-export.json', JSON.stringify(old)); await p.setInputFiles('#old-file', '/tmp/claude-0/old-export.json'); await p.waitForTimeout(500); console.log('  import toast:', await toast(p));
  await H.nav(p, 'products'); ok((await txt(p)).includes('بيتزا قديمة') && (await txt(p)).includes('عصير قديم'), 'old products imported'); ok((await txt(p)).includes('من 3.500'), 'old sizes imported (from 3.500)');
  await H.nav(p, 'customers'); ok((await txt(p)).includes('عميل قديم'), 'old customer imported');

  /* ── 8) مظهر ليلي + جوال بلا تمرير أفقي ── */
  const ph = await H.mkpage(ctx, errs); await ph.setViewportSize({ width: 390, height: 844 }); await ph.emulateMedia({ colorScheme: 'dark' }); await ph.goto(H.URL); await ph.waitForTimeout(900);
  if (await ph.locator('#login-form').isVisible()) await H.login(ph, 'admin', '1234'); await ph.waitForTimeout(300);
  for (const pg of ['dashboard', 'pos', 'invoices', 'customers', 'products', 'inventory', 'suppliers', 'expenses', 'profit', 'watch', 'shift', 'settings']) { await ph.evaluate(id => { location.hash = id === 'settings' ? 'store-settings' : id; }, pg); await ph.waitForTimeout(250); await grab(ph); const ov = await ph.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (ov > 0) console.log('  OVERFLOW on phone page', pg, ov); }
  ok(true, 'phone dark: visited all pages'); await ph.screenshot({ path: '/tmp/claude-0/phone-settings.png' });

  const missing = await p.evaluate(used => { const have = new Set(); for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch (e) { continue; } const walk = rs => { for (const r of rs) { if (r.cssRules) walk(r.cssRules); if (r.selectorText) (r.selectorText.match(/\.(?:\\.|[A-Za-z0-9_-])+/g) || []).forEach(x => have.add(x.slice(1).replace(/\\(.)/g, '$1'))); } }; walk(rules); } return used.filter(c => !have.has(c)); }, [...used]);
  console.log('\nMISSING CLASSES (' + missing.length + '):', missing.join(' ')); console.log('EXTERNAL REQUESTS:', JSON.stringify(reqs)); console.log('ERRORS:', JSON.stringify(errs)); await browser.close();
})().catch(e => { console.error('TESTFAIL', e.message.split('\n').slice(0, 8).join(' | ')); process.exit(1); });
