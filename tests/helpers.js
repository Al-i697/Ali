const { chromium } = require('playwright');
exports.URL = process.env.APP_URL || 'http://localhost:8123/';
exports.launch = () => chromium.launch();
exports.mkctx = async (browser, o = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, serviceWorkers: 'allow', acceptDownloads: true, ...o });
  const errs = [];
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  return { ctx, errs };
};
exports.mkpage = async (ctx, errs) => {
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::ERR|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  return p;
};
exports.ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; return c; };
exports.txt = async (p, sel = '#main-content-area') => (await p.locator(sel).innerText()).replace(/\s+/g, ' ');
exports.toast = async p => (await p.locator('#toast-container').innerText()).replace(/\s+/g, ' ');
exports.login = async (p, u, pw) => { await p.fill('#login-user', u); await p.fill('#login-pass', pw); await p.click('#login-form button[type=submit]'); await p.waitForTimeout(500); };
exports.nav = async (p, id) => { if ((await p.evaluate(() => innerWidth)) < 1024) await p.evaluate(id => { location.hash = id; }, id); else await p.click(`#sidebar-nav [data-p="${id}"]`); await p.waitForTimeout(350); };
exports.setup = async (p, o = {}) => {
  const d = { store: 'مقهى الجمر', name: 'سالم', phone: '99765432', user: 'salem', pass: '5678', ...o };
  await p.fill('#reg-store', d.store); await p.fill('#reg-name', d.name); await p.fill('#reg-phone', d.phone); await p.fill('#reg-user', d.user); await p.fill('#reg-pass', d.pass); await p.fill('#reg-pass2', d.pass);
  await p.click('#setup-form button[type=submit]'); await p.waitForSelector('#rec-code', { timeout: 8000 });
  const code = (await p.locator('#rec-code').innerText()).trim();
  await p.check('#rec-ack'); await p.click('#rec-done'); await p.waitForSelector('#app-view:not(.hidden)'); await p.waitForTimeout(300);
  return { ...d, code };
};
exports.addProd = async (p, o) => {
  await p.click('[data-a="prod-new"]'); await p.waitForSelector('#pd-n');
  if (o.svc) await p.check('#pd-svc');
  await p.fill('#pd-n', o.n); if (o.stock != null && !o.svc) await p.fill('#pd-stock', String(o.stock));
  if (o.sizes) { await p.click('[data-a="v-preset"]'); const rows = p.locator('#pd-vlist .vrow'); for (let i = 0; i < 3; i++) await rows.nth(i).locator('.v-price').fill(String(o.sizes[i])); }
  else await p.fill('#pd-p', String(o.p)); if (o.c != null && !o.sizes) await p.fill('#pd-c', String(o.c)); if (o.icon) await p.fill('#pd-icon', o.icon);
  await p.click('[data-a="prod-save"]'); await p.waitForTimeout(250);
};
exports.openShift = async (p, fl = '20') => { await exports.nav(p, 'shift'); await p.fill('#fl', fl); await p.click('[data-a="open-shift"]'); await p.waitForTimeout(300); };
exports.sell = async (p, q, { recv } = {}) => {
  await exports.nav(p, 'pos'); await p.fill('#pos-search', q); await p.waitForTimeout(150);
  await p.locator('#pos-products-grid > button').first().dispatchEvent('click'); await p.waitForTimeout(100);
  await p.click('#btn-pay'); await p.waitForTimeout(200); if (recv) await p.fill('#p-recv', recv);
  await p.click('#p-ok'); await p.waitForSelector('#invoice-preview-modal:not(.hidden)', { timeout: 5000 });
  const t = await exports.txt(p, '#invoice-preview-content'); await p.click('[data-a="pv-close"]'); await p.fill('#pos-search', ''); await p.waitForTimeout(150); return t;
};
