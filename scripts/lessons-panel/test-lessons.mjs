// اختبار وظيفي للوحة الصف داخل صفحات الدروس (متصفح حقيقي). يتطلب خادمًا ساكنًا يقدّم مجلد الخرج:
//   (cd <مجلد الخرج> && python3 -m http.server 8099 --bind 127.0.0.1) &
//   node scripts/lessons-panel/test-lessons.mjs [http://127.0.0.1:8099]
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://127.0.0.1:8099';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'ar' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(m.location().url)) errs.push('console: ' + m.text().slice(0, 200)); });
  let fails = 0;
  const ok = (c, msg) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + msg); };
  const where = () => page.locator('#where').innerText().then((t) => t.replace(/\s+/g, ' ').trim());
  const listText = () => page.evaluate(() => document.getElementById('class-panel-host').shadowRoot.querySelector('#clsPanel [data-r=list]')?.innerText.replace(/\s+/g, ' ').trim() || '');
  const name = (n) => page.locator('#clsPanel .cls-name', { hasText: n }).first();

  await page.goto(BASE + '/lesson34.html', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.locator('#clsFab').click();
  await page.getByRole('button', { name: /إضافة شعبة وطلابها/ }).click();
  await page.locator('input[name=name]').fill('10/1');
  await page.locator('textarea[name=names]').fill('أحمد بن سالم البلوشي\nخالد بن ناصر الهنائي\nسعيد بن محمد الراشدي\nيوسف بن علي الكندي\nمحمد بن حمد الرواحي');
  await page.getByRole('button', { name: 'حفظ الشعبة' }).click();
  await page.waitForTimeout(400);
  await page.locator('dialog[open] button[aria-label="إغلاق"]').click();
  await page.waitForTimeout(400);

  // A) التسجيل
  await name('أحمد').click(); await name('أحمد').click(); await name('خالد').click();
  await page.locator('#clsPanel [aria-label="لم يشارك — سعيد بن محمد الراشدي"]').click();
  await page.waitForTimeout(300);
  const t1 = await listText();
  ok(/أحمد[^|]*×?\s*2|شارك\s*×\s*2/.test(t1) || /2/.test(t1), 'تسجيل المشاركة (أحمد مرتين): ' + t1.slice(0, 140));

  // B) الكتابة في حقل البحث لا تقلّب الشرائح
  const w0 = await where();
  await page.locator('#clsPanel input[placeholder^="ابحث"]').first().click();
  await page.keyboard.type('أحمد خالد');           // فيه مسافة
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Home'); await page.keyboard.press('End'); await page.keyboard.press('PageDown');
  ok((await where()) === w0, 'الكتابة والأسهم داخل حقل البحث لا تقلّب الشرائح (' + w0 + ')');
  const typed = await page.locator('#clsPanel input[placeholder^="ابحث"]').first().inputValue();
  ok(typed === 'أحمد خالد', 'المسافة تُكتب داخل الحقل: "' + typed + '"');
  await page.locator('#clsPanel input[placeholder^="ابحث"]').first().fill('');

  // C) بعد نقرة بالمؤشر: الأسهم تنقل الشرائح
  await name('يوسف').click(); await page.waitForTimeout(200);
  const beforeCount = await listText();
  const w1 = await where();
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(700);
  const w2 = await where();
  ok(w2 !== w1, 'ArrowLeft بعد نقرة على اللوحة يقدّم الشريحة: ' + w1 + ' ← ' + w2);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(700);
  ok((await where()) === w1, 'ArrowRight يرجّع الشريحة');
  // المسافة: تقدّم الشريحة ولا تضغط زر «شارك» مرة ثانية
  await page.keyboard.press('Space'); await page.waitForTimeout(700);
  const w3 = await where();
  const afterSpace = await listText();
  ok(w3 !== w1, 'المسافة تقدّم الشريحة بعد نقرة بالمؤشر');
  ok(afterSpace === beforeCount, 'المسافة لم تضاعف تسجيل المشاركة');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);

  // D) نافذة مفتوحة: لا تتحرك الشرائح خلفها
  await page.locator('#clsPanel button', { hasText: 'التقارير' }).click().catch(() => {});
  await page.waitForTimeout(500);
  const dlgOpen = await page.evaluate(() => !!document.getElementById('class-panel-host').shadowRoot.querySelector('dialog[open]'));
  const w4 = await where();
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Space'); await page.waitForTimeout(500);
  ok(dlgOpen && (await where()) === w4, 'نافذة مفتوحة: الأسهم والمسافة لا تقلّب الشرائح خلفها');
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(() => { const d = document.getElementById('class-panel-host').shadowRoot.querySelector('dialog[open]'); if (d) d.close(); });

  // E) البيانات تبقى بين الدروس وبعد إعادة التحميل
  const stored = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('smart-planner')));
  ok(stored.length >= 1, 'مفاتيح التخزين: ' + stored.join(', '));
  if (await page.evaluate(() => document.getElementById('class-panel-host').shadowRoot.getElementById('clsPanel').hidden)) { await page.locator('#clsFab').click(); await page.waitForTimeout(300); }
  await page.goto(BASE + '/lesson35.html', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const openAfterNav = await page.evaluate(() => !document.getElementById('class-panel-host').shadowRoot.getElementById('clsPanel').hidden);
  ok(openAfterNav, 'اللوحة تبقى مفتوحة عند الانتقال إلى الدرس التالي (مثل التطبيق)');
  const t2 = await listText();
  ok(/أحمد/.test(t2), 'قائمة الطلاب نفسها في الدرس 3-5');
  const sess = await page.evaluate(() => { const o = JSON.parse(localStorage.getItem('chem10-smart-planner:class:v1') || '{}'); return Object.keys(o.sessions || {}); });
  ok(sess.some((k) => k.includes('|3_4|')), 'جلسة الدرس 3_4 محفوظة: ' + sess.join(' ; '));
  await name('خالد').click(); await page.waitForTimeout(300);
  const sess2 = await page.evaluate(() => { const o = JSON.parse(localStorage.getItem('chem10-smart-planner:class:v1') || '{}'); return Object.keys(o.sessions || {}); });
  ok(sess2.some((k) => k.includes('|3_5|')), 'التسجيل في الدرس 3-5 يُحفظ على حصة 3_5 تلقائيًا: ' + sess2.join(' ; '));

  // F) Esc يغلق اللوحة
  await page.locator('#clsPanel').focus().catch(() => {});
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const closed = await page.evaluate(() => document.getElementById('class-panel-host').shadowRoot.getElementById('clsPanel').hidden);
  ok(closed, 'Esc يغلق اللوحة');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  await browser.close();
  process.exitCode = fails ? 1 : 0;
}
