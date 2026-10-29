/* أداء: يرجّع نسخة بعدد فواتير معيّن ثم يقيس الإقلاع والصفحات والبيع تحت إبطاء المعالج (يحاكي آيباد الجيل السادس تقريباً) */
const H = require('./helpers');
const N = +process.argv[2] || 300, RATE = +process.argv[3] || 4, file = `/tmp/claude-0/fixture-${N}.json`;
(async () => {
  const browser = await H.launch(); const { ctx, errs } = await H.mkctx(browser); const p = await H.mkpage(ctx, errs); p.on('pageerror', e => console.log('  PAGEERROR', e.stack.split('\n').slice(0, 5).join(' | ')));
  const cdp = await ctx.newCDPSession(p);
  const frame = () => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const T = async (label, fn) => { const t = Date.now(); await fn(); await frame(); const ms = Date.now() - t; console.log(`  ${label.padEnd(34)} ${String(ms).padStart(6)} ms`); return ms; };
  await p.goto(H.URL); await p.waitForTimeout(800);
  console.log(`── ${N} invoices, CPU x${RATE} ──`);
  await p.setInputFiles('#bk-file-setup', file); await p.waitForSelector('[data-a="restore-ok"]', { timeout: 120000 });
  await T('restore (parse+write to IndexedDB)', async () => { await p.click('[data-a="restore-ok"]'); await p.waitForSelector('#login-form:not(.hidden)', { timeout: 300000 }); });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await T('boot (reload -> login form)', async () => { await p.reload(); await p.waitForSelector('#login-form:not(.hidden)', { timeout: 300000 }); });
  await T('login (PBKDF2 + render dashboard)', async () => { await p.fill('#login-user', 'admin'); await p.fill('#login-pass', '1234'); await p.click('#login-form button[type=submit]'); await p.waitForSelector('#app-view:not(.hidden)', { timeout: 60000 }); });
  const heap = await p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1); console.log('  JS heap after boot:', heap, 'MB');
  for (const [id, label] of [['pos', 'POS'], ['dashboard', 'dashboard'], ['invoices', 'invoices'], ['customers', 'customers'], ['products', 'products'], ['inventory', 'inventory'], ['suppliers', 'suppliers'], ['expenses', 'expenses'], ['profit', 'profit'], ['watch', 'watch'], ['shift', 'shift'], ['settings', 'settings']])
    await T('open page: ' + label, async () => { await p.click(`#sidebar-nav [data-p="${id}"]`); await p.waitForFunction(id => location.hash.slice(1) === (id === 'settings' ? 'store-settings' : id), id); });
  await p.click('#sidebar-nav [data-p="pos"]'); await p.waitForTimeout(400);
  const tile = p.locator('#pos-products-grid > button').first();
  await T('tap product tile (add to cart)', async () => { await tile.dispatchEvent('click'); });
  await T('tap product tile again', async () => { await tile.dispatchEvent('click'); });
  await T('search typing "مش"', async () => { await p.fill('#pos-search', 'مش'); });
  await p.fill('#pos-search', ''); await p.waitForTimeout(200);
  await p.click('#btn-pay'); await p.waitForTimeout(300);
  await T('confirm payment -> receipt shown', async () => { await p.click('#p-ok'); await p.waitForSelector('#invoice-preview-modal:not(.hidden)'); });
  await p.click('[data-a="pv-close"]'); await p.waitForTimeout(300);
  await T('first tap after a sale', async () => { await tile.dispatchEvent('click'); });
  await p.click('#btn-pay'); await p.waitForTimeout(300);
  await T('2nd payment -> receipt', async () => { await p.click('#p-ok'); await p.waitForSelector('#invoice-preview-modal:not(.hidden)'); });
  await p.click('[data-a="pv-close"]');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const sz = await p.evaluate(() => navigator.storage.estimate().then(e => Math.round(e.usage / 1048576)));
  console.log('  storage used:', sz, 'MB | errors:', JSON.stringify(errs));
  await browser.close();
})().catch(async e => { console.error('TESTFAIL', e.message.split('\n').slice(0, 6).join(' | ')); process.exit(1); });
