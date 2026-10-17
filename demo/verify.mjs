#!/usr/bin/env node
// يتحقق من المعاينة المبنية (dist-demo/sijilli-preview.html) كما ستُعرض: داخل إطار معزول (sandbox بلا allow-same-origin)
// وبسياسة CSP صارمة (لا شبكة، لا سكربتات خارجية، لا eval) — ثم يتجوّل في الصفحات ويجرّب المساعد والتعديل والسمة والجوال.
//   node demo/build.mjs && node demo/verify.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFile = path.join(root, 'dist-demo/sijilli-preview.html');
const shotsDir = path.join(root, 'dist-demo/shots');
if (!fs.existsSync(htmlFile)) {
  console.error('✘ شغّل أولًا: node demo/build.mjs');
  process.exit(2);
}
fs.mkdirSync(shotsDir, { recursive: true });

// الهيكل الذي تضيفه المنصة حول الصفحة (doctype + head مختصر + body)، وCSP تحاكي القيود المذكورة في عقد الصفحة
const skeleton = (body) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'self'; frame-src data: blob:";
const page = skeleton(fs.readFileSync(htmlFile, 'utf8'));
const host = `<!doctype html><html><body style="margin:0"><iframe id="f" src="/preview" sandbox="allow-scripts allow-forms allow-popups" style="border:0;width:100vw;height:100vh"></iframe></body></html>`;
const server = http.createServer((req, res) => {
  if (req.url === '/preview') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': CSP });
    res.end(page);
  } else if (req.url === '/direct') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page);
  } else {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(host);
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// ───────── أدوات ─────────
const results = [];
const problems = [];
async function step(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✔ ${name}  (${Date.now() - t0}ms)`);
  } catch (e) {
    const msg = String(e?.message ?? e).split('\n').slice(0, 3).join(' ⏎ ');
    results.push({ name, ok: false, error: msg });
    console.log(`  ✘ ${name}\n      ${msg}`);
  }
}
const expect = (c, m) => {
  if (!c) throw new Error(m);
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const executablePath = ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', process.env.CHROMIUM_PATH].find((p) => p && fs.existsSync(p));
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function open({ viewport = { width: 1360, height: 860 }, scheme = 'light', url = '/' } = {}) {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme, locale: 'ar-OM', timezoneId: 'Asia/Muscat', baseURL: base });
  const p = await ctx.newPage();
  p.setDefaultTimeout(12_000);
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource/.test(t)) return;
    problems.push(`console.error: ${t.slice(0, 240)}`);
  });
  p.on('pageerror', (e) => problems.push(`pageerror: ${String(e.message).slice(0, 240)}`));
  p.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url().slice(0, 120)}`));
  await p.goto(url);
  const f = url === '/direct' ? p : p.frameLocator('#f');
  return { ctx, p, f };
}

const BAD = ['تعذّر تحميل البيانات', 'غير مضمّنة في المعاينة', 'DEMO_NOT_RECORDED', 'Application error', 'خطأ غير متوقع'];
async function expectClean(f, what) {
  const text = (await f.locator('body').innerText()).replace(/\s+/g, ' ');
  for (const b of BAD) expect(!text.includes(b), `${what}: ظهر «${b}»`);
}

// ───────── 1) داخل إطار معزول (الحالة الأقسى) ─────────
const rawData = JSON.parse(fs.readFileSync(path.join(root, 'dist-demo/data.json'), 'utf8'));
const studentNames = JSON.parse(rawData.entries['/students?limit=500'].b).items.map((s) => s.fullName);
const text = async (f) => (await f.locator('body').innerText()).replace(/\s+/g, ' ');
/** استدعاء API المعاينة من داخل الإطار (يمرّ بالطبقة الوسيطة نفسها التي تخدم التطبيق) */
const apiGet = (f, u) => f.locator('html').evaluate(async (_, x) => (await fetch(`/api${x}`)).json(), u);

console.log('\n━━ إطار معزول + CSP صارمة ━━');
{
  const { ctx, p, f } = await open();
  const goto = async (href) => {
    await f.locator(`nav[aria-label="التنقل الرئيسي"] a[href="${href}"]`).click();
    await f.locator('main').first().waitFor();
    await pause(450);
  };
  try {
    await step('تُقلع المعاينة على لوحة التحكم بتاريخ اللقطة (الثلاثاء 13 أكتوبر 2026)', async () => {
      await f.locator('h1').first().waitFor();
      const h = await text(f);
      expect(/صباح الخير/.test(h), 'لا تحية الصباح (الساعة لم تُثبَّت)');
      expect(/13 أكتوبر 2026|١٣ أكتوبر ٢٠٢٦/.test(h), 'تاريخ اليوم ليس تاريخ اللقطة');
      expect(/معاينة تفاعلية/.test(h), 'لافتة المعاينة غائبة');
      await expectClean(f, 'لوحة التحكم');
      await p.screenshot({ path: path.join(shotsDir, 'dashboard.png') });
    });

    const nav = f.locator('nav[aria-label="التنقل الرئيسي"]');
    const items = await nav.locator('a').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })));
    for (const it of items) {
      await step(`التنقل: «${it.text}» يُحمَّل بلا أخطاء`, async () => {
        await goto(it.href);
        await expectClean(f, it.text);
        await p.screenshot({ path: path.join(shotsDir, `nav-${it.href.replace(/\//g, '') || 'home'}.png`) });
      });
    }

    await step('الشعب: صفحة شعبة ← ملف طالب بتبويباته كلها بلا أخطاء', async () => {
      await goto('/classes');
      await f.locator('main a[href^="/classes/"]').first().click();
      await f.locator('main a[href^="/students/"]').first().waitFor();
      await expectClean(f, 'الشعبة');
      await f.locator('main a[href^="/students/"]').first().click();
      await f.getByRole('tab', { name: 'الصف' }).waitFor(); // تبويب خاص بملف الطالب (صفحة الشعبة نفسها بها تبويبات فلا يصحّ الانتظار على أي تبويب)
      const tabs = await f.getByRole('tab').count();
      expect(tabs >= 3, `تبويبات ملف الطالب ${tabs}`);
      for (let i = 0; i < tabs; i++) {
        await f.getByRole('tab').nth(i).click();
        await pause(250);
        await expectClean(f, `تبويب ${i + 1} من ملف الطالب`);
      }
      await p.screenshot({ path: path.join(shotsDir, 'student.png') });
    });

    // ───── إدارة الصف: تسجيل فعلي في الذاكرة ─────
    const cls = { ref: null, names: [], ids: [] };
    const classRow = (name) => f.locator('[data-student]').filter({ has: f.getByRole('link', { name, exact: true }) });
    const act = (name, label) => classRow(name).getByRole('button', { name: `${label} — ${name}`, exact: true });

    await step('إدارة الصف: حصة اليوم من الجدول ← «شارك» مرتين ← «تراجع» ← «لم يشارك» ← سلوك غير حسن بسبب جاهز — والواجهة تعكس ما سُجّل', async () => {
      await goto('/class');
      await f.getByRole('heading', { name: 'إدارة الصف', level: 1 }).waitFor();
      await f.getByText('آخر الحصص المسجّلة').waitFor();
      await expectClean(f, 'إدارة الصف');
      const ov = await apiGet(f, '/class/overview');
      expect(ov.slots.length >= 1, `لا حصص اليوم في جدول المعاينة (${ov.slots.length})`);
      // حصة لم يُسجَّل فيها شيء بعد (البذرة تسجّل حصص الصباح)؛ يُرجع «ابدأ التسجيل» لها
      const slot = ov.slots.find((x) => !x.session);
      expect(!!slot, `كل حصص اليوم مسجَّلة سلفًا: ${JSON.stringify(ov.slots.map((x) => x.period))}`);
      cls.ref = { assignmentId: slot.assignment.id, date: ov.today, period: slot.period };
      await f.getByRole('link', { name: 'ابدأ التسجيل' }).first().click();
      await f.locator('[data-student]').first().waitFor();

      // ثلاثة طلاب لم يُسجَّل لهم شيء في هذه الحصة
      const q = `assignmentId=${cls.ref.assignmentId}&date=${cls.ref.date}&period=${cls.ref.period}`;
      const before = await apiGet(f, `/class/session?${q}`);
      const fresh = before.students.filter((x) => x.participation === null && x.records.length === 0);
      expect(fresh.length >= 3, `طلاب بلا تسجيل في الحصة: ${fresh.length}`);
      const [a, b, c] = fresh;
      cls.names = [a.fullName, b.fullName, c.fullName];
      cls.ids = [a.studentId, b.studentId, c.studentId];
      const part = async (id) => (await apiGet(f, `/class/session?${q}`)).students.find((x) => x.studentId === id);

      await act(a.fullName, 'شارك').click();
      await act(a.fullName, 'شارك').click();
      await act(a.fullName, 'شارك').filter({ hasText: '2' }).waitFor();
      expect((await part(a.studentId)).participation === 2, 'مشاركتان لم تُحسبا في المحرّك');
      expect(await act(a.fullName, 'لم يشارك').isDisabled(), '«لم يشارك» يجب أن يُعطَّل لمن شارك');
      await act(a.fullName, 'تراجع عن مشاركة').click();
      await pause(250);
      expect((await part(a.studentId)).participation === 1, 'التراجع لم يُنقص المشاركة');

      await act(b.fullName, 'لم يشارك').click();
      await pause(250);
      expect((await part(b.studentId)).participation === 0, '«لم يشارك» لم يُسجَّل');
      expect((await act(b.fullName, 'لم يشارك').getAttribute('aria-pressed')) === 'true', 'الزر لا يعكس الحالة');

      await act(c.fullName, 'سلوك غير حسن').click();
      const dlg = f.getByRole('dialog');
      await dlg.getByText('سلوك غير حسن —').first().waitFor();
      expect(await dlg.getByRole('button', { name: 'حفظ', exact: true }).isDisabled(), '«حفظ» يجب أن يُعطَّل بلا سبب ولا ملاحظة');
      await dlg.getByRole('button', { name: 'حديث جانبي', exact: true }).click();
      await dlg.getByLabel('تفاصيل (اختياري)').fill('تكرر أثناء الشرح');
      await dlg.getByRole('button', { name: 'حفظ', exact: true }).click();
      await classRow(c.fullName).getByRole('button', { name: /^تعديل: .*حديث جانبي/ }).waitFor();
      const rec = (await part(c.studentId)).records[0];
      expect(rec?.kind === 'negative' && rec.reason === 'حديث جانبي' && rec.note === 'تكرر أثناء الشرح', `التسجيل المحفوظ: ${JSON.stringify(rec)}`);
      await expectClean(f, 'شاشة الحصة');
      await p.screenshot({ path: path.join(shotsDir, 'class-session.png') });

      // «لم يشارك» لمن تبقّى بتأكيد: لا يمسّ من سُجّل له
      await f.getByRole('button', { name: /لمن تبقّى/ }).click();
      await f.getByRole('dialog').getByRole('button', { name: 'تسجيل', exact: true }).click();
      await f.getByText(/سُجِّل «لم يشارك»/).first().waitFor();
      const after = await apiGet(f, `/class/session?${q}`);
      expect(after.students.every((x) => x.participation !== null), 'بقي طلاب بلا تسجيل');
      expect(after.students.find((x) => x.studentId === a.studentId).participation === 1, 'مُسّت مشاركة من شارك');
    });

    await step('إدارة الصف: ملخص الشعبة وملف الطالب (تبويب «الصف») وبطاقة لوحة التحكم تعكس ما سُجّل للتو', async () => {
      await goto('/class');
      await f.getByRole('tab', { name: /ملخص الشعبة/ }).click();
      await f.getByRole('button', { name: 'تقرير الشعبة' }).waitFor();
      await f.getByLabel('الشعبة والمادة').selectOption(cls.ref.assignmentId);
      const sum = await apiGet(f, `/class/summary?assignmentId=${cls.ref.assignmentId}`);
      const rowA = sum.rows.find((r) => r.studentId === cls.ids[0]);
      const rowC = sum.rows.find((r) => r.studentId === cls.ids[2]);
      expect(rowA.counts.participations >= 1 && rowC.counts.negative >= 1, `الملخص لا يعكس التسجيل: ${JSON.stringify([rowA.counts, rowC.counts])}`);
      await f.locator('tbody tr').filter({ hasText: cls.names[2] }).first().waitFor();
      await expectClean(f, 'ملخص الشعبة');
      await p.screenshot({ path: path.join(shotsDir, 'class-summary.png') });

      // ملف الطالب ← «الصف»: السبب في ملخص الأسباب والخط الزمني
      await f.locator('tbody tr').filter({ hasText: cls.names[2] }).getByRole('link').first().click();
      await f.getByRole('tab', { name: 'الصف', selected: true }).waitFor();
      await f.getByText('الخط الزمني').waitFor();
      await f.getByText('حديث جانبي').first().waitFor();
      const rep = await apiGet(f, `/class/students/${cls.ids[2]}`);
      expect(rep.counts.negative >= 1 && rep.sessions.some((g) => g.date === cls.ref.date && g.records.length), 'تقرير الطالب لا يحوي حصة اليوم');
      await expectClean(f, 'تبويب الصف');
      await p.screenshot({ path: path.join(shotsDir, 'class-student.png') });

      // لوحة التحكم: عدد المسجّل لهم في حصة اليوم
      await goto('/');
      const dash = await apiGet(f, '/dashboard');
      expect(dash.todaySlots.find((s) => s.assignment.id === cls.ref.assignmentId && s.period === cls.ref.period).classRecorded >= 3, 'لوحة التحكم لا تعدّ المسجّل لهم');
      await f.getByRole('heading', { name: 'متابعة الصف' }).waitFor();
      await expectClean(f, 'لوحة التحكم بعد التسجيل');
    });

    await step('إدارة الصف: تجاوز الحدود يُرفض كما في الخادم (حصة مستقبلية، تسجيل بلا سبب، عدّاد زائد، طالب خارج الشعبة)', async () => {
      const call = (method, u, body) =>
        f.locator('html').evaluate(async (_, [m, x, b]) => {
          const r = await fetch(`/api${x}`, { method: m, headers: { 'content-type': 'application/json', 'x-sijilli-client': 'web' }, body: b ? JSON.stringify(b) : undefined });
          return { status: r.status, body: await r.json() };
        }, [method, u, body]);
      const base = { assignmentId: cls.ref.assignmentId, studentId: cls.ids[0], date: cls.ref.date };
      const fut = await call('PUT', '/class/participation', { ...base, date: '2099-01-01', count: 1 });
      expect(fut.status === 400 && fut.body.error.code === 'FUTURE_DATE', `حصة مستقبلية: ${JSON.stringify(fut)}`);
      const noText = await call('POST', '/class/records', { ...base, kind: 'negative' });
      expect(noText.status === 400, `تسجيل بلا نص: ${noText.status}`);
      const big = await call('PUT', '/class/participation', { ...base, count: 99 });
      expect(big.status === 400, `عدّاد زائد: ${big.status}`);
      const foreign = await call('PUT', '/class/participation', { ...base, studentId: '00000000-0000-4000-8000-000000000000', count: 1 });
      expect(foreign.status === 404, `طالب مجهول: ${foreign.status}`);
      const malformed = await call('PUT', '/class/participation', { ...base, studentId: 'not-a-student', count: 1 });
      expect(malformed.status === 400, `معرّف غير صالح: ${malformed.status}`);
    });

    await step('تقارير الصف حيّة: تقرير الطالب وتقرير الشعبة يحويان ما سجّلتَه للتو (الاسم والسبب والمشاركة)', async () => {
      await goto('/reports');
      const sum = await apiGet(f, `/class/summary?assignmentId=${cls.ref.assignmentId}`);
      const frameText = async () => (await f.frameLocator('main iframe').first().locator('body').innerText()).replace(/\s+/g, ' ');

      await f.getByRole('radio', { name: /تقرير المشاركة والسلوك للطالب/ }).click();
      await f.getByLabel('الشعبة', { exact: true }).selectOption(sum.sectionId);
      await f.getByLabel(/^الطالب/).selectOption(cls.ids[2]);
      await f.getByLabel('كل الفترات').check();
      await f.frameLocator('main iframe').first().getByText('تقرير المشاركة والسلوك الصفي').first().waitFor();
      const student = await frameText();
      expect(student.includes(cls.names[2]) && student.includes('حديث جانبي') && student.includes('تكرر أثناء الشرح'), `تقرير الطالب لا يحوي تسجيلك: ${student.slice(0, 300)}`);
      expect(/الخط الزمني/.test(student) && /سلوك غير حسن/.test(student), 'تقرير الطالب ناقص الأقسام');
      await p.screenshot({ path: path.join(shotsDir, 'class-report-student.png') });

      // طالب شارك مرتين ثم تراجع (مشاركة واحدة) ← «شارك» في الخط الزمني
      await f.getByLabel(/^الطالب/).selectOption(cls.ids[0]);
      await f.frameLocator('main iframe').first().getByText(cls.names[0]).first().waitFor();
      expect(/شارك/.test(await frameText()), 'مشاركة الطالب الأول غائبة عن تقريره');

      await f.getByRole('radio', { name: /سجل المشاركة والسلوك للشعبة/ }).click();
      await f.getByLabel('الشعبة والمادة').selectOption(cls.ref.assignmentId);
      await f.getByLabel('كل الفترات').check();
      await f.frameLocator('main iframe').first().getByText('سجل المشاركة والسلوك الصفي').first().waitFor();
      await f.frameLocator('main iframe').first().getByText(cls.names[2]).first().waitFor();
      const section = await frameText();
      expect(section.includes(cls.names[0]) && section.includes('الحصص المسجّلة'), 'تقرير الشعبة ناقص');
      await p.screenshot({ path: path.join(shotsDir, 'class-report-section.png') });
    });

    await step('التقويم المستمر: شبكة الدرجات تُعرض، وتعديل خلية يُرفض برسالة المعاينة دون تعطّل', async () => {
      await goto('/assessments');
      await f.locator('main a[href^="/assessments/"]').first().click();
      await f.locator('table input').first().waitFor();
      const n = await f.locator('table input').count();
      expect(n > 100, `خلايا الشبكة ${n}`);
      const cell = f.locator('table input').first();
      await cell.fill('7');
      await cell.press('Tab');
      await f.getByText('هذه معاينة للتصفح فقط').first().waitFor();
      await expectClean(f, 'الشبكة');
      await p.screenshot({ path: path.join(shotsDir, 'gradebook.png') });
    });

    await step('التحضير ← محرر الدرس ← مسودة المساعد (ردود جاهزة): إدخال ← جارٍ الإعداد ← مراجعة ← إدراج', async () => {
      await goto('/lessons');
      await f.locator('main a[href^="/lessons/"]:not([href="/lessons/new"])').first().click();
      await f.getByLabel('عنوان الدرس').first().waitFor();
      await f.getByRole('heading', { name: 'المساعد الذكي' }).waitFor();
      await f.getByRole('button', { name: 'اقترح مسودة التحضير' }).click();
      const dlg = f.getByRole('dialog', { name: 'مسودة تحضير بالمساعد الذكي' });
      await dlg.waitFor();
      await dlg.getByText('ماذا يُرسَل إلى المساعد؟').waitFor(); // الجاهزية تُجلب أولًا (جارٍ التحقق…)
      expect(/مساعد المعاينة/.test(await dlg.innerText()), 'اسم مزوّد المعاينة غير ظاهر في الإفصاح');
      await dlg.getByRole('button', { name: 'اقترح', exact: true }).click();
      await dlg.getByText('جارٍ إعداد المقترح').waitFor();
      await dlg.getByText('مقترح من مساعد آلي — راجعه').waitFor();
      await p.screenshot({ path: path.join(shotsDir, 'ai-review.png') });
      await dlg.getByRole('button', { name: 'إدراج المحدد في التحضير' }).click();
      await dlg.waitFor({ state: 'detached' });
      expect(/وصف النشاط 1/.test(await f.locator('body').innerHTML()), 'الأنشطة لم تُدرج في المحرر');
    });

    await step('حماية المساعد في المعاينة: رقم هاتف يُرفض، واسم طالب يتطلب تأكيدًا', async () => {
      await f.getByRole('button', { name: 'أفكار للتقويم' }).click();
      const dlg = f.getByRole('dialog', { name: 'أفكار تقويم بالمساعد الذكي' });
      await dlg.waitFor();
      await dlg.getByLabel('ملاحظات للمساعد').fill('اتصل على 91234567');
      await dlg.getByRole('button', { name: 'اقترح', exact: true }).click();
      await dlg.getByText('تعذّر الحصول على اقتراح').waitFor();
      await dlg.getByLabel('ملاحظات للمساعد').fill(`الطالب ${studentNames[0]} متفوق`);
      await dlg.getByRole('button', { name: 'اقترح', exact: true }).click();
      await dlg.getByText('تنبيه: النص يطابق اسمًا من أسماء طلابك').waitFor();
      await dlg.getByRole('checkbox', { name: /أؤكد أن الاسم/ }).check();
      await dlg.getByRole('button', { name: 'أرسل بعد التأكيد' }).click();
      await dlg.getByText('مقترح من مساعد آلي — راجعه').waitFor();
      await dlg.getByRole('button', { name: 'إغلاق دون إدراج' }).click();
    });

    await step('الخطط والمختبر: صفحة خطة، ونافذة نشاط، ومساعد الخطة داخل نموذج «خطة جديدة»', async () => {
      await goto('/support');
      await f.locator('main a[href^="/support/"]').first().click();
      await f.locator('main h1').first().waitFor();
      await pause(400);
      await expectClean(f, 'صفحة الخطة');
      await goto('/support');
      await f.getByRole('button', { name: 'خطة جديدة' }).first().click();
      const plan = f.getByRole('dialog', { name: 'خطة جديدة' });
      await plan.waitFor();
      await plan.getByLabel('عنوان الخطة').fill('علاج مهارة قراءة الرسوم البيانية');
      await plan.getByRole('button', { name: 'اقترح أفكارًا بالمساعد الذكي' }).click();
      const sup = f.getByRole('dialog', { name: 'أفكار خطة علاجية بالمساعد الذكي' });
      await sup.getByRole('button', { name: 'اقترح', exact: true }).click();
      await sup.getByText('مقترح من مساعد آلي — راجعه').waitFor();
      await sup.getByRole('button', { name: 'إدراج المحدد في الخطة' }).click();
      await sup.waitFor({ state: 'detached' });
      expect((await plan.getByLabel('الهدف').inputValue()).includes('70%'), 'الهدف لم يُدرج');
      await plan.getByRole('button', { name: 'إلغاء' }).click();
      await goto('/lab');
      await f.locator('main').getByRole('button', { name: /فحص خلايا قشرة البصل/ }).first().click({ timeout: 4000 }).catch(() => f.getByText('فحص خلايا قشرة البصل').first().click());
      await pause(500);
      await expectClean(f, 'المختبر');
      await p.keyboard.press('Escape');
      await pause(200);
    });

    await step('التقارير: كل نوع يعرض معاينة حقيقية داخل إطارها، والتنزيل والطباعة يشرحان أنهما في التطبيق الكامل', async () => {
      await goto('/reports');
      const radios = f.getByRole('radiogroup', { name: 'نوع التقرير' }).getByRole('radio');
      const n = await radios.count();
      expect(n === 9, `أنواع التقارير ${n}`);
      for (let i = 0; i < n; i++) {
        await radios.nth(i).click();
        await pause(900);
        // تقرير الطالب يتطلب اختيار الشعبة ثم الطالب قبل ظهور المعاينة
        if ((await f.locator('main iframe').count()) === 0) {
          const selects = f.locator('main select');
          for (let k = 0; k < (await selects.count()); k++) {
            const first = await selects.nth(k).locator('option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean)[0]);
            if (first) await selects.nth(k).selectOption(first);
            await pause(700);
          }
        }
        await f.locator('main iframe').first().waitFor();
        const len = (await f.frameLocator('main iframe').first().locator('body').innerText()).length;
        expect(len > 80, `معاينة التقرير ${i + 1} فارغة (${len})`);
      }
      await radios.nth(0).click();
      await pause(700);
      await f.getByRole('button', { name: /PDF/ }).first().click();
      await f.getByText('تنزيل ملفات PDF وExcel يعمل في التطبيق الكامل').first().waitFor();
      await f.getByRole('button', { name: /طباعة/ }).first().click();
      await f.getByText('الطباعة تعمل في التطبيق الكامل').first().waitFor();
      await p.screenshot({ path: path.join(shotsDir, 'reports.png') });
    });

    await step('المهام: إضافة مهمة تُرفض برسالة المعاينة، والتقويم الدراسي يتنقل بين الأشهر', async () => {
      await goto('/tasks');
      await f.getByRole('button', { name: /مهمة جديدة/ }).first().click();
      const dlg = f.getByRole('dialog', { name: 'مهمة جديدة' });
      await dlg.getByLabel('العنوان').fill('مهمة اختبار');
      await dlg.getByRole('button', { name: 'إضافة', exact: true }).click();
      await f.getByText('هذه معاينة للتصفح فقط').first().waitFor();
      await dlg.getByRole('button', { name: 'إلغاء' }).click();
      await f.getByRole('tab', { name: 'التقويم الدراسي' }).click();
      await pause(400);
      for (let i = 0; i < 3; i++) {
        await f.getByRole('button', { name: 'الشهر التالي' }).click();
        await pause(250);
      }
      await expectClean(f, 'التقويم الدراسي');
    });

    await step('الإعدادات: التبويبات كلها، وتفضيل الأرقام يعمل أثناء الجلسة', async () => {
      await goto('/settings');
      const tabs = await f.getByRole('tab').count();
      expect(tabs >= 6, `تبويبات الإعدادات ${tabs}`);
      for (let i = 0; i < tabs; i++) {
        await f.getByRole('tab').nth(i).click();
        await pause(250);
        await expectClean(f, `تبويب الإعدادات ${i + 1}`);
      }
    });

    await step('تبديل الفصل الدراسي من الرأس: الصفحات التي تعتمد عليه تبقى سليمة', async () => {
      await f.getByRole('button', { name: 'تغيير العام والفصل' }).click();
      await f.getByRole('menuitemradio', { name: /الثاني/ }).first().click();
      await pause(400);
      for (const href of ['/', '/assessments', '/reports']) {
        await goto(href);
        await pause(300);
        await expectClean(f, `الصفحة ${href} بعد تبديل الفصل`);
      }
      await goto('/assessments');
      await f.locator('main a[href^="/assessments/"]').first().click();
      await f.locator('main h1, main h2, main h3').first().waitFor();
      await pause(600);
      await expectClean(f, 'شبكة الدرجات للفصل الثاني'); // الفصل الثاني بلا تقويمات في البيانات المزروعة: حالة فارغة سليمة لا خطأ
      await p.screenshot({ path: path.join(shotsDir, 'term2.png') });
    });

    await step('السمة: التحويل إلى الداكن يعمل داخل الإطار', async () => {
      await f.getByRole('button', { name: 'تغيير السمة' }).click();
      await f.getByRole('menuitemradio', { name: 'داكن' }).click();
      await pause(300);
      expect((await f.locator('html').getAttribute('data-theme')) === 'dark', 'لم تتحول السمة إلى الداكن');
      await p.screenshot({ path: path.join(shotsDir, 'dark.png') });
    });
  } finally {
    await ctx.close();
  }
}

// ───────── 2) الجوال ─────────
console.log('\n━━ الجوال (390×844) ━━');
{
  const { ctx, p, f } = await open({ viewport: { width: 390, height: 844 } });
  try {
    await step('الجوال: كل الصفحات تُفتح (من الشريط السفلي أو «المزيد») بلا تمرير أفقي ولا أخطاء', async () => {
      await f.locator('h1').first().waitFor();
      const labels = ['لوحة التحكم', 'الشعب والطلاب', 'إدارة الصف', 'التحضير', 'التقويم المستمر', 'الخطط العلاجية والإثرائية', 'المختبر والأنشطة', 'الجدول الأسبوعي', 'المهام والتقويم', 'التقارير', 'الإعدادات'];
      const bottom = f.locator('nav[aria-label="تنقل سريع"]');
      for (const label of labels) {
        const inBottom = await bottom.getByRole('link', { name: label, exact: false }).count();
        if (inBottom) await bottom.getByRole('link', { name: label, exact: false }).first().click();
        else {
          await f.getByRole('button', { name: 'المزيد من الأقسام' }).click();
          await f.getByRole('dialog').getByRole('link', { name: label }).click();
        }
        await f.locator('main').first().waitFor();
        await pause(550);
        const overflow = await f.locator('html').evaluate((e) => e.scrollWidth - e.clientWidth);
        expect(overflow <= 1, `«${label}»: تمرير أفقي ${overflow}px`);
        await expectClean(f, label);
      }
      await p.screenshot({ path: path.join(shotsDir, 'mobile.png') });
    });
  } finally {
    await ctx.close();
  }
}

// ───────── 3) تحميل مباشر (بلا إطار): التخزين المحلي متاح ─────────
console.log('\n━━ تحميل مباشر ━━');
{
  const { ctx, p, f } = await open({ url: '/direct' });
  try {
    await step('تحميل مباشر: تُقلع بلا أخطاء ويعمل التنقل', async () => {
      await f.locator('h1').first().waitFor();
      await f.locator('nav[aria-label="التنقل الرئيسي"] a[href="/lessons"]').click();
      await f.locator('main').first().waitFor();
      await expectClean(f, 'التحضير');
      void p;
    });

    await step('تحميل جديد = بذرة نظيفة: ما سجّلتَه في تحميل سابق لا يبقى (لا تخزين دائم)', async () => {
      const ov = await apiGet(f, '/class/overview');
      expect(ov.slots.some((x) => !x.session), 'حصة اليوم التي سُجّلت في الجلسة السابقة ظهرت مسجَّلة');
    });
  } finally {
    await ctx.close();
  }
}

await browser.close();
server.close();
const failed = results.filter((r) => !r.ok);
const uniq = [...new Set(problems)];
console.log(`\n${uniq.length ? '✘' : '✔'} أخطاء الكونسول/الشبكة: ${uniq.length}${uniq.length ? '\n  ' + uniq.slice(0, 15).join('\n  ') : ''}`);
console.log(`النتيجة: ${results.length - failed.length}/${results.length}`);
process.exit(failed.length || uniq.length ? 1 : 0);
