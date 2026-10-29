/* تحديث البرنامج: نبني نسخة جديدة والآيباد يفتح القديمة؛ يظهر شريط التحديث ثم يتحدث بدون فقدان البيانات */
const H = require('./helpers'); const { execSync } = require('child_process'); const fs = require('fs'); const { ok } = H;
(async () => {
  const browser = await H.launch(); const { ctx, errs } = await H.mkctx(browser); const p = await H.mkpage(ctx, errs);
  await p.goto(H.URL); await p.waitForTimeout(900); await H.setup(p); await H.nav(p, 'products'); await H.addProd(p, { n: 'صنف قبل التحديث', p: '1', svc: true });
  await p.reload(); await p.waitForTimeout(1200);
  const v1 = await p.evaluate(async () => (await caches.keys())[0]); console.log('  cache v1:', v1);
  fs.appendFileSync('/home/user/Ali/src/css/extra.css', '\n/* update-test */\n'); execSync('python3 /home/user/Ali/tools/build.py', { stdio: 'pipe' });
  await p.reload(); await p.waitForTimeout(2500);
  ok(!(await p.locator('#update-banner').evaluate(e => e.classList.contains('hidden'))), 'update banner appears when a new build is published');
  const keys = await p.evaluate(async () => (await caches.keys())); console.log('  caches now:', keys.join(', ')); ok(keys.length === 1 && keys[0] !== v1, 'old cache removed, new cache active');
  await p.click('[data-a="reload"]'); await p.waitForTimeout(1500);
  ok(await p.locator('#app-view').isVisible(), 'after update: still logged in'); await H.nav(p, 'products'); ok((await p.locator('#prod-grid').innerText()).includes('صنف قبل التحديث'), 'data survived the update');
  console.log('ERRORS:', JSON.stringify(errs)); await browser.close();
  /* نرجّع الملف كما كان */
  let s = fs.readFileSync('/home/user/Ali/src/css/extra.css', 'utf8'); fs.writeFileSync('/home/user/Ali/src/css/extra.css', s.replace('\n/* update-test */\n', '')); execSync('python3 /home/user/Ali/tools/build.py', { stdio: 'pipe' });
})().catch(e => { console.error('TESTFAIL', e.message.split('\n').slice(0, 6).join(' | ')); process.exit(1); });
