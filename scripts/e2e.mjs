#!/usr/bin/env node
// اختبار شامل من الطرف إلى الطرف في متصفح حقيقي (Chromium) على النسخة المبنية من التطبيق.
//
//   npm run build && npm run test:e2e
//
// خيارات:  --only=first-run,demo,admin,visual   تشغيل مراحل محددة
//          --keep                                 إبقاء مجلد البيانات المؤقت بعد الانتهاء
//          --headed                               إظهار نافذة المتصفح
//
// يبدأ خادمًا حقيقيًا (dist/) على منفذ عشوائي وبقاعدة بيانات مؤقتة، فلا يمسّ بيانات حقيقية. المراحل:
//   first-run  رحلة معلّم جديد من الصفر: إعداد النظام ← عام ← شعبة ← طلاب ← تحضير ← تقويم ← درجات ← تقرير
//   demo       الحساب التجريبي: الشبكة بالكيبورد واللصق، المهام، الإعدادات، التقارير PDF/Excel، العزل
//   admin      المدير: المستخدمون، كلمة مرور مؤقتة، التعطيل، النسخ الاحتياطي والاستعادة، سجل العمليات
//   visual     مسح بصري: كل الصفحات × (فاتح/داكن) × (حاسوب/جوال) — لقطات + فحص التمرير الأفقي والأخطاء
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const only = (argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);
const keepData = argv.includes('--keep');
const headed = argv.includes('--headed');
const listArg = (name) => (argv.find((a) => a.startsWith(`--${name}=`)) ?? '').slice(name.length + 3).split(',').filter(Boolean);
const onlyPages = listArg('pages'); // للمرحلة visual: --pages=section,gradebook
const onlyCombos = listArg('combos'); // مثل: --combos=light-mobile
const shotsDir = path.join(root, 'e2e-output');

const PW = {
  admin: { email: 'admin@e2e.local', password: 'Admin-E2E-Pass-2026', name: 'مدير الاختبار' },
  demo: { email: 'demo@e2e.local', password: 'Demo-E2E-Pass-2026' },
  fresh: { name: 'سالم بن ناصر الهنائي', email: 'salim@e2e.local', password: 'Fresh-E2E-Pass-2026' },
};

// مدقّق إمكانية الوصول (axe-core): يُحقَن عبر CDP فلا تمنعه سياسة CSP. يغطي ما يمكن كشفه آليًا فقط
const axeSource = fs.existsSync(path.join(root, 'node_modules/axe-core/axe.min.js'))
  ? fs.readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8')
  : null;

const DESKTOP = { width: 1360, height: 860 };
const MOBILE = { width: 390, height: 844 };

// ───────────────────────── أدوات الاختبار ─────────────────────────
const results = [];
const problems = [];
const allowed = [];
const allowProblem = (re) => allowed.push(re);
let currentPhase = '';

class PhaseAbort extends Error {}

async function step(name, fn, { critical = false } = {}) {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ phase: currentPhase, name, ok: true });
    console.log(`  ✔ ${name}  (${Date.now() - t0}ms)`);
    return true;
  } catch (e) {
    const msg = String(e?.message ?? e).split('\n').slice(0, 3).join(' ⏎ ');
    results.push({ phase: currentPhase, name, ok: false, error: msg });
    console.log(`  ✘ ${name}\n      ${msg}`);
    if (critical) throw new PhaseAbort(`توقّفت المرحلة عند: ${name}`);
    return false;
  }
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

/** ينتظر (حتى 10ث) أن يطابق نص العنصر التعبير؛ الصفحات تُحمَّل بياناتها بعد ظهور الهيكل فلا نفحص لحظة الظهور فقط */
async function expectText(locator, re, what) {
  const deadline = Date.now() + 10_000;
  for (;;) {
    let text;
    try {
      text = (await locator.first().innerText({ timeout: 2000 })).replace(/\s+/g, ' ');
    } catch {
      text = '';
    }
    if (re.test(text)) return;
    if (Date.now() > deadline) throw new Error(`${what ?? 'النص'}: لم يطابق ${re} — «${text.slice(0, 120)}»`);
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function runPhase(name, fn) {
  if (only.length && !only.includes(name)) return;
  currentPhase = name;
  console.log(`\n━━ ${name} ━━`);
  try {
    await fn();
  } catch (e) {
    if (!(e instanceof PhaseAbort)) {
      results.push({ phase: name, name: 'خطأ غير متوقع في المرحلة', ok: false, error: String(e?.stack ?? e).split('\n').slice(0, 4).join(' ⏎ ') });
      console.log('  ✘ خطأ غير متوقع:', e?.message ?? e);
    }
  }
}

// ───────────────────────── الخادم المؤقت ─────────────────────────
function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

const tmpDirs = [];
const tmpFiles = [];
const servers = [];
let chromiumPath; // يُمرَّر أيضًا للخادم كي يجد Chromium لتصدير PDF أينما كان مثبّتًا

function cli(dataDir, args) {
  const r = spawnSync(process.execPath, [path.join(root, 'dist/server/cli.js'), ...args], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production', DATA_DIR: dataDir, LOG_LEVEL: 'error' },
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`فشل أمر CLI ${args[0]}: ${r.stderr || r.stdout}`);
  return r.stdout;
}

async function startServer(label, { seed = false } = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), `sijilli-e2e-${label}-`));
  tmpDirs.push(dataDir);
  if (seed) {
    cli(dataDir, ['create-admin', '--email', PW.admin.email, '--name', PW.admin.name, '--password', PW.admin.password]);
    cli(dataDir, ['seed-demo', '--email', PW.demo.email, '--password', PW.demo.password]);
  }
  const port = await freePort();
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    HOST: '127.0.0.1',
    PORT: String(port),
    DATA_DIR: dataDir,
    BACKUP_INTERVAL_HOURS: '0',
    LOG_LEVEL: 'warn',
    PDF_NO_SANDBOX: 'true',
    ...(chromiumPath ? { CHROMIUM_PATH: chromiumPath } : {}),
  };
  const proc = spawn(process.execPath, [path.join(root, 'dist/server/index.js')], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  proc.stdout.on('data', (d) => (log += d));
  proc.stderr.on('data', (d) => (log += d));
  const base = `http://127.0.0.1:${port}`;
  const started = Date.now();
  for (;;) {
    if (proc.exitCode !== null) throw new Error(`الخادم توقف عند البدء:\n${log}`);
    try {
      const r = await fetch(`${base}/api/health`);
      if (r.ok) break;
    } catch {
      /* لم يبدأ بعد */
    }
    if (Date.now() - started > 30_000) throw new Error(`انتهت مهلة بدء الخادم:\n${log}`);
    await new Promise((r) => setTimeout(r, 150));
  }
  const srv = {
    base,
    dataDir,
    log: () => log,
    stop: async () => {
      if (proc.exitCode === null) {
        proc.kill('SIGTERM');
        await new Promise((r) => {
          proc.once('exit', r);
          setTimeout(() => {
            proc.kill('SIGKILL');
            r();
          }, 4000);
        });
      }
    },
  };
  servers.push(srv);
  return srv;
}

// ───────────────────────── المتصفح ─────────────────────────
function findChromium() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
  ];
  const found = candidates.find((c) => c && fs.existsSync(c));
  if (found) return found;
  try {
    const p = chromium.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {
    /* تجاهل */
  }
  return undefined;
}

function watch(page, label) {
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // رسالة المتصفح العامة عن أي 4xx — نعتمد على سجل الاستجابات أدناه لأنه يحمل المسار
    if (/Failed to load resource/.test(t)) return;
    problems.push(`[${label}] console.error: ${t.slice(0, 220)}`);
  });
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${String(e.message).slice(0, 220)}`));
  page.on('requestfailed', (r) => {
    const t = r.failure()?.errorText ?? '';
    if (t.includes('ERR_ABORTED')) return; // إلغاء عند التنقل
    problems.push(`[${label}] requestfailed: ${r.method()} ${new URL(r.url()).pathname} ${t}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`[${label}] http ${r.status()}: ${r.request().method()} ${new URL(r.url()).pathname}`);
  });
}

async function newSession(browser, base, label, { viewport = DESKTOP, colorScheme = 'light' } = {}) {
  const ctx = await browser.newContext({ baseURL: base, viewport, colorScheme, locale: 'ar-OM', timezoneId: 'Asia/Muscat', acceptDownloads: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(12_000);
  watch(page, label);
  return { ctx, page };
}

async function login(page, { email, password }) {
  await page.goto('/login');
  await page.getByLabel('البريد الإلكتروني').fill(email);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'));
}

const apiGet = (page, p) => page.evaluate(async (u) => (await fetch(`/api${u}`, { credentials: 'same-origin' })).json(), p);
const apiStatus = (page, p, method = 'GET', body) =>
  page.evaluate(
    async ([u, m, b]) => {
      const r = await fetch(`/api${u}`, { method: m, credentials: 'same-origin', headers: { 'content-type': 'application/json', ...(m !== 'GET' ? { 'x-sijilli-client': 'web' } : {}) }, body: b ? JSON.stringify(b) : undefined });
      return r.status;
    },
    [p, method, body],
  );

/** حقول كلمة المرور الجديدة بالترتيب (0 = الجديدة، 1 = التأكيد): تسميات الحقول تحمل نجمة «مطلوب» فنعتمد autocomplete */
const newPw = (page, i) => page.locator('input[autocomplete="new-password"]').nth(i);
const toast = (page, re) => page.locator('[data-sonner-toast]').filter({ hasText: re }).first();

async function bytesOf(page, urlPath) {
  return page.evaluate(async (u) => {
    const r = await fetch(`/api${u}`, { credentials: 'same-origin' });
    const buf = new Uint8Array(await r.arrayBuffer());
    return { status: r.status, type: r.headers.get('content-type') ?? '', head: Array.from(buf.slice(0, 8)), size: buf.length };
  }, urlPath);
}
const asText = (head) => String.fromCharCode(...head);

// ═════════════════════════ المرحلة 1: رحلة معلّم جديد ═════════════════════════
async function phaseFirstRun(browser) {
  const srv = await startServer('first');
  const { ctx, page } = await newSession(browser, srv.base, 'first-run');
  try {
    await step('الصفحة الرئيسية تُحوِّل إلى «الإعداد لأول مرة» عند خلوّ النظام من مستخدمين', async () => {
      await page.goto('/');
      await page.waitForURL('**/setup');
      await expectText(page.locator('h1'), /إعداد سجلي لأول مرة/);
    }, { critical: true });

    await step('يرفض كلمة المرور الضعيفة ولا يُنشئ حسابًا', async () => {
      await page.getByLabel('الاسم الكامل').fill(PW.fresh.name);
      await page.getByLabel('البريد الإلكتروني').fill(PW.fresh.email);
      await newPw(page, 0).fill('12345678');
      await newPw(page, 1).fill('12345678');
      await page.getByRole('button', { name: 'إنشاء الحساب والبدء' }).click();
      await page.getByText(/أرقام فقط|شائعة/).first().waitFor();
      expect(new URL(page.url()).pathname === '/setup', 'يجب البقاء في صفحة الإعداد');
    });

    await step('يرفض تأكيد كلمة مرور غير مطابق', async () => {
      await newPw(page, 0).fill(PW.fresh.password);
      await newPw(page, 1).fill(PW.fresh.password + 'x');
      await page.getByRole('button', { name: 'إنشاء الحساب والبدء' }).click();
      await page.getByText('غير متطابقتين').first().waitFor();
    });

    await step('ينشئ حساب المدير ويدخل إلى لوحة التحكم مع خطوات البدء', async () => {
      await newPw(page, 1).fill(PW.fresh.password);
      await page.getByRole('button', { name: 'إنشاء الحساب والبدء' }).click();
      await page.waitForURL((u) => u.pathname === '/');
      await expectText(page.locator('h1'), /أ\. سالم/);
      await page.getByText('ابدأ مع سجلي في دقائق').waitFor();
      expect((await page.getByText('حساب تجريبي').count()) === 0, 'الحساب الحقيقي لا يجب أن يحمل شارة «تجريبي»');
    }, { critical: true });

    await step('خطوة «إعداد العام» تفتح تبويب الأعوام في الإعدادات', async () => {
      await page.getByRole('link', { name: 'إعداد العام' }).first().click();
      await page.waitForURL('**/settings?tab=academic');
      await page.getByRole('button', { name: 'إنشاء عام دراسي' }).first().waitFor();
    });

    await step('ينشئ العام الدراسي بفصليه', async () => {
      await page.getByRole('button', { name: 'إنشاء عام دراسي' }).first().click();
      const dlg = page.getByRole('dialog');
      await dlg.getByRole('button', { name: 'إنشاء', exact: true }).click();
      await toast(page, /أُنشئ العام الدراسي/).waitFor();
      await page.getByText('الفصل الدراسي الأول').first().waitFor();
      await page.getByText('الفصل الدراسي الثاني').first().waitFor();
    }, { critical: true });

    await step('ينشئ شعبة مع مادة جديدة ويدخل صفحتها', async () => {
      await page.goto('/classes');
      await page.getByRole('button', { name: 'إضافة أول شعبة' }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('الصف').selectOption({ label: 'الصف الثامن' });
      await dlg.getByLabel('رقم الشعبة').fill('2');
      await dlg.getByText(/ستظهر الشعبة باسم/).waitFor();
      await dlg.getByLabel('مادة جديدة').fill('العلوم');
      await dlg.getByLabel('مادة جديدة').press('Enter');
      await dlg.getByRole('button', { name: 'العلوم', exact: true }).waitFor();
      expect((await dlg.getByRole('button', { name: 'العلوم', exact: true }).getAttribute('aria-pressed')) === 'true', 'المادة الجديدة يجب أن تُحدَّد تلقائيًا');
      await dlg.getByRole('button', { name: 'إنشاء الشعبة' }).click();
      await page.waitForURL(/\/classes\/[^/]+$/);
      await page.waitForFunction(() => /8\/2|٨\/٢/.test(document.querySelector('h1')?.innerText ?? ''));
    }, { critical: true });

    await step('يضيف ثلاثة طلاب بالإدخال السريع (Enter) فتظهر في القائمة بالترتيب', async () => {
      const quick = page.getByLabel('إضافة طالب سريعة');
      for (const n of ['أحمد بن خالد الكلباني', 'خالد بن سعيد البلوشي', 'سعيد بن محمد الرواحي']) {
        await quick.fill(n);
        await quick.press('Enter');
        await page.getByRole('link', { name: n }).waitFor();
      }
      expect((await page.locator('tbody tr').count()) === 3, 'يجب أن يظهر 3 طلاب');
    }, { critical: true });

    await step('الاستيراد بلصق الأسماء: يتجاهل الترقيم (1. و2)) ويتخطّى المكرَّر ويعرض معاينة قبل الحفظ', async () => {
      await page.getByRole('button', { name: /استيراد \/ لصق أسماء/ }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('قائمة الأسماء').fill('1. محمد بن علي الهاشمي\n2) ناصر بن سعيد المقبالي\nأحمد بن خالد الكلباني');
      await dlg.getByRole('button', { name: 'معاينة' }).click();
      await dlg.getByText('معاينة الاستيراد').waitFor();
      await expectText(dlg, /2 جديد/);
      await expectText(dlg, /1 مُتخطّى/);
      expect((await dlg.getByText('1. محمد').count()) === 0, 'الترقيم لم يُحذف من الاسم');
      await dlg.getByRole('button', { name: /تأكيد استيراد 2 طالبًا/ }).click();
      await toast(page, /استُورد|أُضيف|أضيف/).waitFor();
      await page.getByRole('link', { name: 'محمد بن علي الهاشمي' }).waitFor();
      expect((await page.locator('tbody tr').count()) === 5, 'المتوقع 5 طلاب (3 + 2 جديدان، والمكرر تُخطّي)');
    });

    await step('الاستيراد من ملف Excel: يكتشف صف العناوين وعمودَي الاسم والرقم تلقائيًا', async () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('الطلاب');
      ws.addRow(['م', 'اسم الطالب', 'الرقم المدني']);
      ws.addRow([1, 'يوسف بن حمد الشكيلي', '60010001']);
      ws.addRow([2, 'خليفة بن راشد العلوي', '60010002']);
      const file = path.join(os.tmpdir(), `sijilli-e2e-students-${Date.now()}.xlsx`);
      tmpFiles.push(file);
      await wb.xlsx.writeFile(file);
      await page.getByRole('button', { name: /استيراد \/ لصق أسماء/ }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByRole('radio', { name: /ملف Excel/ }).click();
      await dlg.getByLabel('ملف الطلاب').setInputFiles(file);
      await dlg.getByRole('button', { name: 'معاينة' }).click();
      await dlg.getByText('معاينة الاستيراد').waitFor();
      await expectText(dlg, /2 جديد/);
      await expectText(dlg, /تم التعرف على الأعمدة/);
      await expectText(dlg, /60010001/);
      await dlg.getByRole('button', { name: /تأكيد استيراد 2 طالبًا/ }).click();
      await page.getByRole('link', { name: 'خليفة بن راشد العلوي' }).waitFor();
      expect((await page.locator('tbody tr').count()) === 7, 'المتوقع 7 طلاب');
    }, { critical: true });

    let lessonUrl = '';
    await step('ينشئ تحضير درس ويُحفظ تلقائيًا ويبقى بعد إعادة التحميل', async () => {
      await page.goto('/lessons/new');
      await page.getByLabel('عنوان الدرس').fill('الأنسجة النباتية');
      await page.getByLabel('هدف 1').fill('أن يُميّز الطالب بين الأنسجة النباتية الرئيسة');
      await page.getByRole('button', { name: 'إنشاء التحضير' }).click();
      await page.waitForURL(/\/lessons\/[^/]+$/);
      lessonUrl = page.url();
      await page.getByLabel('ناتج التعلم 1').fill('يفسّر وظيفة كل نسيج');
      await page.getByText('محفوظ تلقائيًا').waitFor();
      await page.waitForTimeout(1900); // مهلة الحفظ التلقائي 1.2 ثانية
      await page.getByText('محفوظ تلقائيًا').waitFor();
      await page.reload();
      await page.getByLabel('عنوان الدرس').waitFor();
      expect((await page.getByLabel('عنوان الدرس').inputValue()) === 'الأنسجة النباتية', 'العنوان لم يُحفظ');
      expect((await page.getByLabel('ناتج التعلم 1').inputValue()) === 'يفسّر وظيفة كل نسيج', 'ناتج التعلم لم يُحفظ بالحفظ التلقائي');
    }, { critical: true });

    await step('التحضير: انقطاع الاتصال أثناء الكتابة ← تنبيه «تعذّر الحفظ» ← يُحفظ تلقائيًا عند عودته', async () => {
      allowProblem(/requestfailed: PATCH \/api\/lessons\/.+ net::ERR_INTERNET_DISCONNECTED/);
      const ctx0 = page.context();
      await ctx0.setOffline(true);
      try {
        await page.getByLabel('هدف 1').fill('أن يُميّز الطالب بين الأنسجة النباتية الرئيسة (معدَّل دون اتصال)');
        await page.getByText(/تعذّر الحفظ/).first().waitFor({ timeout: 10_000 });
      } finally {
        await ctx0.setOffline(false);
      }
      await page.getByText('محفوظ تلقائيًا').waitFor({ timeout: 15_000 });
      const id = new URL(page.url()).pathname.split('/').pop();
      const saved = await apiGet(page, `/lessons/${id}`);
      expect(saved.objectives[0].includes('معدَّل دون اتصال'), 'التعديل لم يُحفظ بعد عودة الاتصال');
    });

    await step('يُنسخ التحضير إلى تاريخ آخر بنقرة (نسخ الدرس)', async () => {
      await page.getByRole('button', { name: /نسخ إلى شعب/ }).click();
      const dlg = page.getByRole('dialog');
      await dlg.waitFor();
      await dlg.getByRole('button', { name: /نسخ/ }).last().click();
      await toast(page, /نُسخ|نسخ/).waitFor();
      const list = await apiGet(page, '/lessons?limit=10');
      expect(list.items.length === 2, `بعد النسخ يجب أن يوجد درسان وجد ${list.items.length}`);
      expect(list.items.every((l) => l.title === 'الأنسجة النباتية'), 'عنوان النسخة يجب أن يطابق الأصل');
    });

    let assignmentUrl = '';
    await step('ينشئ تقويمًا جديدًا ويفتح شبكة الدرجات', async () => {
      await page.goto('/assessments');
      await page.getByRole('link', { name: /العلوم/ }).first().click();
      await page.waitForURL(/\/assessments\/[^/?]+/);
      assignmentUrl = page.url();
      await page.getByRole('button', { name: 'تقويم جديد' }).first().click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('عنوان التقويم').fill('اختبار قصير 1');
      await dlg.getByLabel('الدرجة العظمى').fill('10');
      await dlg.getByRole('button', { name: 'إنشاء التقويم' }).click();
      await toast(page, /أُنشئ التقويم/).waitFor();
      await page.locator('table input').first().waitFor();
    }, { critical: true });

    await step('يرصد درجة بالكيبورد وتُحفظ تلقائيًا وتبقى بعد إعادة التحميل', async () => {
      const first = page.locator('table input').first();
      await first.click();
      await first.fill('٩'); // رقم هندي يُحوَّل تلقائيًا
      const put = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/assessments\/.+\/results/.test(r.url()));
      await first.press('Enter');
      expect((await put).status() === 200, 'فشل حفظ الدرجة');
      await page.getByText(/محفوظة/).first().waitFor();
      await page.reload();
      await page.locator('table input').first().waitFor();
      expect((await page.locator('table input').first().inputValue()) === '9', 'الدرجة لم تبقَ بعد إعادة التحميل');
    }, { critical: true });

    await step('تقويم إتقان بمهارة جديدة: رصد مستوى 1–4 ثم «تعبئة الفراغات» للبقية (إتقان لا يدخل المجموع)', async () => {
      await page.getByRole('button', { name: 'تقويم جديد' }).first().click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('عنوان التقويم').fill('مهارة القياس');
      await dlg.getByRole('radio', { name: 'إتقان' }).click();
      await dlg.getByLabel('مهارة جديدة').fill('استخدام أدوات القياس');
      await dlg.getByLabel('مهارة جديدة').press('Enter');
      await dlg.getByRole('button', { name: /استخدام أدوات القياس/ }).waitFor();
      await dlg.getByRole('button', { name: 'إنشاء التقويم' }).click();
      await toast(page, /أُنشئ التقويم/).waitFor();
      const first = page.locator('table input[aria-label$="— مهارة القياس"]').first();
      await first.waitFor();
      await first.click();
      await first.fill('3');
      const put = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/results/.test(r.url()));
      await first.press('Enter');
      expect((await put).status() === 200, 'فشل حفظ مستوى الإتقان');
      // تعبئة الفراغات بالمستوى 4
      await page.getByRole('button', { name: /مهارة القياس/ }).first().click();
      await page.getByRole('menuitem', { name: /تعبئة الفراغات/ }).click();
      const fill = page.getByRole('dialog');
      await fill.getByLabel('المستوى').selectOption('4');
      await fill.getByRole('button', { name: 'تعبئة', exact: true }).click();
      await page.waitForFunction(() => Array.from(document.querySelectorAll('table input[aria-label$="— مهارة القياس"]')).every((i) => i.value !== ''));
      await page.getByText(/كل الدرجات محفوظة/).first().waitFor();
      const gb = await apiGet(page, `/gradebook?assignmentId=${new URL(page.url()).pathname.split('/').pop()}&termId=${(await apiGet(page, '/years'))[0].terms[0].id}`);
      const m = gb.assessments.find((a) => a.title === 'مهارة القياس');
      const levels = gb.students.map((s) => s.results[m.id]?.level);
      expect(m.mode === 'mastery', 'النمط يجب أن يكون إتقانًا');
      expect(levels.includes(3) && levels.filter((l) => l === 4).length === levels.length - 1, `المستويات المحفوظة: ${JSON.stringify(levels)}`);
    });

    await step('«إضافة سريعة» تُنشئ تقويمًا بقيم معتادة بنقرتين', async () => {
      const before = await page.locator('table thead th').count();
      await page.getByRole('button', { name: 'إضافة سريعة' }).click();
      await page.getByRole('menuitem').first().click();
      await toast(page, /أُنشئ|أضيف|أُضيف/).waitFor();
      await page.waitForFunction((n) => document.querySelectorAll('table thead th').length > n, before);
    });

    await step('تقرير كشف الدرجات يعرض الطالب ودرجته في المعاينة', async () => {
      await page.goto('/reports');
      const frame = page.frameLocator('iframe');
      await frame.getByText('أحمد بن خالد الكلباني').first().waitFor({ timeout: 20_000 });
      await frame.getByText('اختبار قصير 1').first().waitFor();
    });

    await step('يُنزّل كشف الدرجات PDF وExcel من الواجهة (ملفان حقيقيان)', async () => {
      const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'تنزيل PDF' }).click()]);
      const pdfPath = await pdf.path();
      expect(fs.readFileSync(pdfPath).subarray(0, 4).toString() === '%PDF', 'الملف ليس PDF');
      const [xl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Excel', exact: true }).click()]);
      const xlPath = await xl.path();
      expect(fs.readFileSync(xlPath).subarray(0, 2).toString() === 'PK', 'الملف ليس xlsx');
    });

    await step('لوحة التحكم تعكس البيانات الجديدة (7 طلاب)', async () => {
      await page.goto('/');
      await expectText(page.locator('main'), /الطلاب 7 في 1 شعبة/);
      void lessonUrl;
      void assignmentUrl;
    });

    await step('تسجيل الخروج يُنهي الجلسة ويمنع الوصول للبيانات', async () => {
      await page.getByRole('button', { name: 'قائمة الحساب' }).click();
      await page.getByRole('menuitem', { name: 'تسجيل الخروج' }).click();
      await page.waitForURL('**/login');
      allowProblem(/http 401: GET \/api\/years/);
      const status = await apiStatus(page, '/years');
      expect(status === 401, `كان متوقعًا 401 وجاء ${status}`);
    });
  } finally {
    await ctx.close();
    await srv.stop();
  }
}

// ═════════════════════════ المرحلة 2: الحساب التجريبي ═════════════════════════
async function phaseDemo(browser, srv) {
  const { ctx, page } = await newSession(browser, srv.base, 'demo');
  try {
    await step('دخول بكلمة مرور خاطئة يعرض رسالة عامة ولا يكشف وجود الحساب', async () => {
      allowProblem(/http 401: POST \/api\/auth\/login/);
      await page.goto('/login');
      await page.getByLabel('البريد الإلكتروني').fill(PW.demo.email);
      await page.locator('input[autocomplete="current-password"]').fill('Wrong-Password-1');
      await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
      await page.getByText('البريد الإلكتروني أو كلمة المرور غير صحيحة').waitFor();
    });

    await step('الدخول الصحيح يفتح لوحة التحكم مع شارة «حساب تجريبي»', async () => {
      await login(page, PW.demo);
      await page.getByText(/حساب تجريبي/).first().waitFor();
      await page.getByText('حصص').first().waitFor();
    }, { critical: true });

    await step('الحماية: طلب تعديل بلا رأس CSRF يُرفض (403)، وواجهات المدير ممنوعة على المعلم', async () => {
      allowProblem(/http 403: (POST|GET) \/api\/(tasks|users|backups|audit)/);
      const noHeader = await page.evaluate(async () => (await fetch('/api/tasks', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'x' }) })).status);
      expect(noHeader === 403, `بلا رأس CSRF: ${noHeader}`);
      for (const p of ['/users', '/backups', '/audit']) {
        const s = await apiStatus(page, p);
        expect(s === 403, `${p} للمعلم يجب أن يكون 403 وجاء ${s}`);
      }
    });

    await step('المعلم لا يرى تبويبات المدير في الإعدادات', async () => {
      await page.goto('/settings');
      await page.getByRole('tab', { name: 'الأمان' }).waitFor();
      for (const t of ['المستخدمون', 'النسخ الاحتياطي', 'سجل العمليات']) expect((await page.getByRole('tab', { name: t }).count()) === 0, `تبويب ${t} ظاهر للمعلم`);
    });

    // ───── شبكة الدرجات ─────
    const years = await apiGet(page, '/years');
    const termId = years[0].terms[0].id;
    const assignments = await apiGet(page, '/assignments');
    const asg = assignments.find((a) => a.sectionLabel === '10/1');
    const gb = await apiGet(page, `/gradebook?assignmentId=${asg.id}&termId=${termId}`);
    const quiz3 = gb.assessments.find((x) => x.title === 'اختبار قصير 3');
    const emptyStudent = gb.students.find((s) => !s.results[quiz3.id]);
    const idx = gb.students.indexOf(emptyStudent);
    const next = gb.students[idx + 1];
    const third = gb.students[idx + 2];
    const cell = (s, title = quiz3.title) => page.locator(`input[aria-label="${s.fullName} — ${title}"]`);
    const serverResult = async (s) => (await apiGet(page, `/gradebook?assignmentId=${asg.id}&termId=${termId}`)).students.find((x) => x.studentId === s.studentId).results[quiz3.id] ?? null;

    await step('الشبكة: عرض أكثر من 100 خلية إدخال لدفتر الشعبة', async () => {
      await page.goto(`/assessments/${asg.id}?term=${termId}`);
      await page.locator('table input').first().waitFor();
      expect((await page.locator('table input').count()) > 100, 'عدد الخلايا قليل');
    }, { critical: true });

    await step('الشبكة: رقم هندي + Enter ينقل للأسفل، والحفظ التلقائي ينجح، والمجموع يتغير لحظيًا', async () => {
      const total = async () => (await page.locator('tr', { has: cell(emptyStudent) }).locator('td').nth(2).innerText()).trim();
      const before = await total();
      await cell(emptyStudent).click();
      await cell(emptyStudent).fill('٩');
      const put = page.waitForResponse((r) => r.request().method() === 'PUT' && r.url().includes(`/assessments/${quiz3.id}/results`));
      await page.keyboard.press('Enter');
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      expect(focused === `${next.fullName} — ${quiz3.title}`, `التركيز بعد Enter: ${focused}`);
      expect((await put).status() === 200, 'فشل الحفظ');
      expect((await cell(emptyStudent).inputValue()) === '9', 'لم يُحوَّل الرقم الهندي');
      expect(before !== (await total()), 'المجموع لم يتغير');
    });

    await step('الشبكة: قيمة أكبر من الدرجة العظمى تُعلَّم غير صالحة ولا تصل للخادم', async () => {
      await cell(next).fill('11');
      expect((await cell(next).getAttribute('aria-invalid')) === 'true', 'لم تُعلَّم غير صالحة');
      await page.waitForTimeout(900);
      const r = await serverResult(next);
      expect(r === null || r.score !== 11, 'وصلت القيمة غير الصالحة للخادم');
    });

    await step('الشبكة: «غ» تُحفظ غيابًا، و«ع» تُحفظ بعذر', async () => {
      await cell(next).fill('غ');
      await page.waitForTimeout(1200);
      expect((await serverResult(next))?.status === 'absent', 'لم يُحفظ الغياب');
      await cell(next).fill('ع');
      await page.waitForTimeout(1200);
      expect((await serverResult(next))?.status === 'excused', 'لم يُحفظ الغياب بعذر');
    });

    await step('الشبكة: لصق عمود من Excel يحفظ كل القيم دفعة واحدة', async () => {
      await cell(third).click();
      await page.evaluate((label) => {
        const el = document.querySelector(`input[aria-label="${label}"]`);
        const dt = new DataTransfer();
        dt.setData('text', '7\n8.5\n6');
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      }, `${third.fullName} — ${quiz3.title}`);
      await page.waitForTimeout(1300);
      const vals = [];
      for (const s of [third, gb.students[idx + 3], gb.students[idx + 4]]) vals.push((await serverResult(s))?.score ?? null);
      expect(JSON.stringify(vals) === '[7,8.5,6]', `القيم المحفوظة: ${JSON.stringify(vals)}`);
    });

    await step('الشبكة: Esc يعيد آخر قيمة محفوظة، والأسهم تتنقل (مع مراعاة RTL)', async () => {
      await cell(third).fill('3');
      await page.keyboard.press('Escape');
      expect((await cell(third).inputValue()) === '7', 'Esc لم يعد القيمة');
      await cell(third).click();
      await page.keyboard.press('ArrowRight');
      const r = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      expect(r && r.startsWith(third.fullName) && !r.endsWith(quiz3.title), `ArrowRight → ${r}`);
      await page.keyboard.press('ArrowLeft');
      const l = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      expect(l === `${third.fullName} — ${quiz3.title}`, `ArrowLeft → ${l}`);
    });

    await step('الشبكة: البيانات ثابتة بعد إعادة تحميل الصفحة', async () => {
      await page.waitForTimeout(800);
      await page.reload();
      await page.locator('table input').first().waitFor();
      expect((await cell(emptyStudent).inputValue()) === '9', 'الدرجة 9 ضاعت');
      expect((await cell(next).inputValue()) === 'ع', 'العذر ضاع');
      expect((await cell(gb.students[idx + 3]).inputValue()) === '8.5', 'القيمة الملصوقة ضاعت');
    });

    await step('الشبكة: انقطاع الاتصال ← تبقى الدرجة «غير محفوظة» مع تنبيه ← تُحفظ تلقائيًا عند عودته (بلا فقدان)', async () => {
      allowProblem(/requestfailed: PUT \/api\/assessments\/.+\/results net::ERR_INTERNET_DISCONNECTED/);
      const target = gb.students[idx + 5];
      await page.context().setOffline(true);
      try {
        await cell(target).click();
        await cell(target).fill('4');
        await page.getByText(/تعذّر حفظ/).first().waitFor({ timeout: 8000 }); // المؤشر يُنبّه بعد فشل المحاولة
        expect((await cell(target).inputValue()) === '4', 'القيمة المكتوبة يجب أن تبقى ظاهرة');
      } finally {
        await page.context().setOffline(false);
      }
      await page.waitForFunction(async ([a, t, sid, aid]) => {
        const g = await (await fetch(`/api/gradebook?assignmentId=${a}&termId=${t}`)).json();
        return g.students.find((s) => s.studentId === sid)?.results[aid]?.score === 4;
      }, [asg.id, termId, target.studentId, quiz3.id], { timeout: 15_000 });
      await page.getByText(/كل الدرجات محفوظة/).first().waitFor();
    });

    await step('اتساق الأرقام: المجموع والنسبة على الشاشة = تقرير HTML = ملف Excel (لكل طلاب الشعبة)', async () => {
      await page.goto(`/assessments/${asg.id}?term=${termId}`);
      await page.locator('table input').first().waitFor();
      await page.getByText(/كل الدرجات محفوظة/).first().waitFor();
      const num = (t) => Number.parseFloat(String(t).replace(/[^\d.-]/g, ''));
      // 1) الشاشة
      const screen = await page.evaluate(() =>
        Object.fromEntries(
          Array.from(document.querySelectorAll('tbody tr'))
            .filter((tr) => tr.querySelector('input'))
            .map((tr) => {
              const td = tr.querySelectorAll('td');
              return [td[1].innerText.trim().split('\n')[0].trim(), { total: td[2].innerText.trim(), pct: td[3].innerText.trim() }];
            }),
        ),
      );
      const names = Object.keys(screen);
      expect(names.length >= 20, `عدد صفوف الشاشة ${names.length}`);
      // 2) تقرير HTML
      const q = `assignmentId=${asg.id}&termId=${termId}`;
      const html = await page.evaluate(async (u) => (await fetch(`/api${u}`, { credentials: 'same-origin' })).text(), `/reports/class-gradebook/html?${q}`);
      const fromHtml = await page.evaluate((h) => {
        const d = new DOMParser().parseFromString(h, 'text/html');
        const table = Array.from(d.querySelectorAll('table')).find((t) => t.textContent.includes('اسم الطالب'));
        const heads = Array.from(table.querySelectorAll('thead th')).map((x) => x.textContent.trim());
        const iT = heads.findIndex((x) => x.startsWith('المجموع'));
        const iP = heads.findIndex((x) => x.startsWith('النسبة'));
        return Object.fromEntries(Array.from(table.querySelectorAll('tbody tr')).map((tr) => { const c = Array.from(tr.children).map((x) => x.textContent.trim()); return [c[1], { total: c[iT], pct: c[iP] }]; }));
      }, html);
      // 3) ملف Excel (أرقام حقيقية)
      const res = await page.context().request.get(`/api/reports/class-gradebook/xlsx?${q}`);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await res.body());
      const ws = wb.worksheets[0];
      let hdr = 0;
      ws.eachRow((r, i) => { if (!hdr && String(r.getCell(2).value) === 'اسم الطالب') hdr = i; });
      const hv = ws.getRow(hdr).values;
      const iT = hv.findIndex((v) => typeof v === 'string' && v.startsWith('المجموع'));
      const iP = hv.findIndex((v) => v === 'النسبة');
      const bad = [];
      for (const n of names) {
        const s = screen[n];
        const h = fromHtml[n];
        const row = ws.getRows(hdr + 1, ws.rowCount - hdr)?.find((r) => r.getCell(2).value === n);
        if (!h || !row) { bad.push(`${n}: غير موجود في ${!h ? 'HTML' : 'Excel'}`); continue; }
        const xt = row.getCell(iT).value;
        const xp = row.getCell(iP).value;
        if (s.total === '—') { if (h.total !== '—' && h.total !== '') bad.push(`${n}: الشاشة — لكن HTML ${h.total}`); continue; }
        if (Math.abs(num(s.total) - num(h.total)) > 0.006) bad.push(`${n}: مجموع الشاشة ${s.total} ≠ HTML ${h.total}`);
        if (Math.abs(num(s.pct) - num(h.pct)) > 0.06) bad.push(`${n}: نسبة الشاشة ${s.pct} ≠ HTML ${h.pct}`);
        if (typeof xt !== 'number' || Math.abs(num(s.total) - xt) > 0.006) bad.push(`${n}: مجموع الشاشة ${s.total} ≠ Excel ${xt}`);
        if (typeof xp !== 'number' || Math.abs(num(s.pct) - xp) > 0.06) bad.push(`${n}: نسبة الشاشة ${s.pct} ≠ Excel ${xp}`);
      }
      expect(bad.length === 0, `تعارض أرقام (${bad.length}): ${bad.slice(0, 4).join(' ؛ ')}`);
    });

    // ───── تقارير بكل أنواعها ─────
    await step('التقارير: الأنواع الخمسة تُولَّد PDF وExcel صالحين', async () => {
      const st = gb.students[0];
      const lessons = await apiGet(page, '/lessons?limit=1');
      const lessonId = lessons.items[0]?.id;
      const term = years[0].terms[0];
      const cases = [
        ['class-gradebook', `assignmentId=${asg.id}&termId=${termId}`],
        ['class-analysis', `assignmentId=${asg.id}&termId=${termId}`],
        ['student', `studentId=${st.studentId}`],
        ['lessons', `from=${term.startDate}&to=${term.endDate}`],
        ['lesson-plan', `lessonId=${lessonId}`],
      ];
      for (const [type, q] of cases) {
        const pdf = await bytesOf(page, `/reports/${type}/pdf?${q}`);
        expect(pdf.status === 200 && asText(pdf.head).startsWith('%PDF') && pdf.size > 4000, `${type} PDF: status ${pdf.status}, size ${pdf.size}`);
        const xl = await bytesOf(page, `/reports/${type}/xlsx?${q}`);
        expect(xl.status === 200 && asText(xl.head).startsWith('PK'), `${type} xlsx: status ${xl.status}`);
        const html = await page.evaluate(async (u) => (await fetch(`/api${u}`, { credentials: 'same-origin' })).text(), `/reports/${type}/html?${q}`);
        expect(html.includes('<html') && html.includes('dir="rtl"'), `${type} HTML بلا RTL`);
      }
    });

    await step('التقارير من الواجهة: كل نوع يُعاين ويُنزَّل PDF حقيقيًا، وتقرير الطالب لا يطبع بياناته الشخصية إلا باختيارك', async () => {
      await page.goto('/reports');
      const frame = page.frameLocator('iframe');
      const waitDoc = async (title) => frame.getByText(title).first().waitFor({ timeout: 25_000 });
      const pdfOk = async () => {
        const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'تنزيل PDF' }).click()]);
        const head = fs.readFileSync(await dl.path()).subarray(0, 4).toString();
        expect(head === '%PDF', 'الملف المنزَّل ليس PDF');
      };
      // 1) كشف الدرجات (الافتراضي)
      await waitDoc('كشف درجات التقويم المستمر');
      await pdfOk();
      // 2) تحليل الأداء
      await page.getByRole('radio', { name: /تحليل أداء الشعبة/ }).click();
      await waitDoc('تحليل أداء الشعبة');
      await pdfOk();
      // 3) تقرير الطالب: بلا ملاحظات ولا بيانات ولي أمر افتراضيًا
      await page.getByRole('radio', { name: /تقرير الطالب/ }).click();
      await page.getByLabel('الشعبة', { exact: true }).selectOption({ index: 1 });
      await page.getByLabel(/^الطالب/).selectOption({ index: 1 });
      await waitDoc('تقرير أداء الطالب');
      // نضمن وجود بيانات ولي أمر فعلية كي يكون الفحص ذا معنى (وإلا فالغياب لا يثبت شيئًا)
      const studentId = await page.getByLabel(/^الطالب/).inputValue();
      expect((await apiStatus(page, `/students/${studentId}`, 'PATCH', { guardianName: 'والد الطالب التجريبي', guardianPhone: '99000000' })) === 200, 'تعذّر ضبط بيانات ولي الأمر');
      await page.getByLabel('تضمين ملاحظات المعلم').check();
      await page.getByLabel('تضمين ملاحظات المعلم').uncheck(); // يُعيد توليد المعاينة بالبيانات المحدَّثة
      await frame.getByText('تقرير أداء الطالب').first().waitFor();
      await page.waitForTimeout(800);
      const bodyBefore = await frame.locator('body').innerText();
      expect(!/والد الطالب التجريبي|99000000/.test(bodyBefore), 'ظهرت بيانات ولي الأمر دون اختيار المعلم');
      await page.getByLabel('تضمين بيانات ولي الأمر').check();
      await frame.getByText('والد الطالب التجريبي').first().waitFor({ timeout: 15_000 });
      await page.getByLabel('تضمين بيانات ولي الأمر').uncheck();
      await pdfOk();
      // 4) سجل التحضير
      await page.getByRole('radio', { name: /سجل التحضير/ }).click();
      await waitDoc('سجل التحضير');
      await pdfOk();
      // 5) ورقة تحضير الدرس (دفتر التحضير لفترة)
      await page.getByRole('radio', { name: /ورقة تحضير الدرس/ }).click();
      await waitDoc(/دفتر التحضير|ورقة تحضير الدرس/);
      await pdfOk();
      // 6) الخطط العلاجية والإثرائية
      await page.getByRole('radio', { name: /الخطط العلاجية والإثرائية/ }).click();
      await waitDoc('الخطط العلاجية والإثرائية');
      await pdfOk();
    });

    // ───── الخطط العلاجية والإثرائية ─────
    await step('الخطط: القائمة تعرض الخطط، ومتابعة تُضاف وتبقى بعد إعادة التحميل، ثم تُنجز الخطة بنتيجة', async () => {
      await page.goto('/support');
      await page.locator('a[href^="/support/"]').first().waitFor();
      expect((await page.locator('a[href^="/support/"]').count()) >= 5, 'الخطط المزروعة لا تظهر');
      await page.locator('a[href^="/support/"]').first().click();
      await page.waitForURL(/\/support\/[^/]+$/);
      await page.getByLabel('متابعة جديدة').fill('متابعة اختبار E2E');
      await page.getByRole('button', { name: 'إضافة', exact: true }).click();
      await page.getByText('متابعة اختبار E2E').first().waitFor();
      await page.reload();
      await page.getByText('متابعة اختبار E2E').first().waitFor();
      await page.getByRole('button', { name: 'إنجاز الخطة' }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('نتيجة الخطة').fill('تحقق الهدف وارتفعت نسبته');
      await dlg.getByRole('button', { name: 'تأكيد الإنجاز' }).click();
      await page.getByText('تحقق الهدف وارتفعت نسبته').first().waitFor();
      await page.getByRole('button', { name: 'إعادة فتح' }).waitFor();
    });

    await step('الاقتراحات: الطلاب دون الحد بلا خطة مفتوحة يُقترحون، وإنشاء جماعي بنقرتين يحفظ خطة لكل منهم', async () => {
      await page.goto('/support');
      const bulk = page.getByRole('button', { name: /إنشاء خطة علاجية للمحدّدين/ });
      await bulk.waitFor();
      const before = await apiGet(page, '/support-plans?status=open');
      await bulk.click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('الاستراتيجيات').fill('جلسة علاجية مصغّرة بعد الحصة');
      await dlg.getByLabel('الاستراتيجيات').press('Enter');
      await dlg.getByRole('button', { name: 'إنشاء الخطط' }).click();
      await toast(page, /أُنشئت \d+ خطة/).waitFor();
      const after = await apiGet(page, '/support-plans?status=open');
      expect(after.length > before.length, `لم تزد الخطط المفتوحة (${before.length} → ${after.length})`);
      const added = after.filter((p) => !before.some((b) => b.id === p.id));
      expect(added.every((p) => p.kind === 'remedial' && p.strategies.includes('جلسة علاجية مصغّرة بعد الحصة') && p.baselinePercent !== null), 'خطط الإنشاء الجماعي ناقصة (نوع/استراتيجية/خط أساس)');
    });

    await step('خطة جديدة من ملف الطالب: الشعبة والطالب مُعبَّآن مسبقًا، وتظهر في تبويب «الخطط» وفي لوحة التحكم والتقويم', async () => {
      const st = gb.students[5];
      const review = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10); // دائمًا بعد تاريخ البدء (اليوم)
      await page.goto(`/students/${st.studentId}`);
      await page.getByRole('tab', { name: 'الخطط' }).click();
      await page.getByRole('button', { name: 'خطة جديدة' }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('عنوان الخطة').fill('مشروع إثرائي اختباري');
      await dlg.getByRole('radio', { name: 'إثرائية' }).click();
      await dlg.getByLabel('الهدف').fill('إنجاز مشروع مصغّر');
      await dlg.getByLabel('موعد المراجعة').fill(review);
      await dlg.getByRole('button', { name: 'إنشاء الخطة' }).click();
      await toast(page, /أُنشئت الخطة/).waitFor();
      await page.getByText('مشروع إثرائي اختباري').first().waitFor();
      const dash = await apiGet(page, '/dashboard');
      expect(dash.support.open >= 6, `عدّاد الخطط في لوحة التحكم: ${dash.support.open}`);
      const cal = await apiGet(page, `/calendar?from=${review}&to=${review}`);
      expect(cal.some((i) => i.type === 'support' && i.date === review), 'موعد المراجعة لا يظهر في التقويم الدراسي');
    });

    await step('لوحة التحكم: «طلاب يحتاجون متابعة» تعلّم من لهم خطة وتعرض «+ خطة» لمن بلا خطة', async () => {
      await page.goto('/');
      await page.getByRole('link', { name: /^الخطط \(/ }).waitFor();
      const hasAny = (await page.getByText('لها خطة').count()) + (await page.getByRole('link', { name: /إنشاء خطة علاجية/ }).count());
      expect(hasAny > 0, 'لا عناصر خطة في بطاقة «يحتاجون متابعة»');
    });

    // ───── المهام ─────
    await step('المهام: إضافة سريعة ← إنجاز ← تظهر في «المنجزة» ← حذف بتأكيد', async () => {
      await page.goto('/tasks');
      const title = 'تجهيز أوراق عمل الوحدة الثالثة';
      const quick = page.getByLabel('مهمة سريعة');
      await quick.fill(title);
      await quick.press('Enter');
      await page.getByText(title).first().waitFor();
      await page.getByRole('button', { name: `إنجاز: ${title}` }).click();
      await page.waitForFunction((t) => !document.body.innerText.includes(t), title); // تغادر قائمة «المفتوحة»
      await page.getByRole('radio', { name: 'المنجزة' }).click();
      await page.getByRole('button', { name: `إعادة فتح: ${title}` }).waitFor();
      await page.getByRole('button', { name: `إعادة فتح: ${title}` }).locator('xpath=..').getByRole('button', { name: 'حذف', exact: true }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'حذف', exact: true }).click();
      await page.waitForFunction((t) => !document.body.innerText.includes(t), title);
    });

    // ───── الإعدادات ─────
    await step('الإعدادات: تغيير اسم مستوى التقدير يُحفظ ويبقى بعد إعادة التحميل', async () => {
      await page.goto('/settings?tab=grading');
      const name = page.locator('input[value="جيد جدًا"]').first();
      await name.fill('جيد جدًا (اختبار)');
      await page.getByRole('button', { name: 'حفظ' }).click();
      await toast(page, /حُفظ/).waitFor();
      await page.reload();
      await page.locator('input[value="جيد جدًا (اختبار)"]').first().waitFor();
      // إعادة القيمة الأصلية
      await page.locator('input[value="جيد جدًا (اختبار)"]').first().fill('جيد جدًا');
      await page.getByRole('button', { name: 'حفظ' }).click();
      await toast(page, /حُفظ/).waitFor();
    });

    await step('المظهر: السمة الداكنة تُطبَّق وتُحفظ في الحساب وتبقى بعد إعادة التحميل', async () => {
      await page.goto('/settings?tab=appearance');
      await page.getByRole('radio', { name: 'داكن' }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      await page.waitForTimeout(500);
      await page.reload();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      await page.getByRole('radio', { name: 'فاتح' }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
      await page.getByRole('radio', { name: 'حسب النظام' }).click(); // نُعيد الافتراضي كي لا يتأثر ما بعده
      await page.waitForTimeout(500);
    });

    await step('الأرقام الهندية: التفضيل يُحوّل أرقام الواجهة', async () => {
      await page.goto('/settings?tab=appearance');
      await page.getByRole('radio', { name: /هندية/ }).click();
      await page.goto('/');
      await page.waitForFunction(() => /[٠-٩]/.test(document.querySelector('main')?.innerText ?? ''));
      await page.goto('/settings?tab=appearance');
      await page.getByRole('radio', { name: /لاتينية|غربية/ }).click();
      await page.waitForTimeout(500);
    });

    await step('تغيير كلمة المرور: يرفض الحالية الخاطئة', async () => {
      allowProblem(/http 400: POST \/api\/auth\/password/);
      await page.goto('/settings?tab=security');
      await page.getByLabel('كلمة المرور الحالية').fill('Not-My-Password-1');
      await newPw(page, 0).fill('Brand-New-Pass-2026');
      await newPw(page, 1).fill('Brand-New-Pass-2026');
      await page.getByRole('button', { name: 'تغيير كلمة المرور' }).click();
      await page.getByText('كلمة المرور الحالية غير صحيحة').first().waitFor();
    });

    await step('الجدول الأسبوعي: ضع مقررًا في حصة فارغة ← يُحفظ فورًا ← أفرغها', async () => {
      await page.goto('/timetable');
      const empty = page.getByRole('button', { name: /فارغة/ }).first();
      await empty.waitFor();
      const label = (await empty.getAttribute('aria-label')) ?? '';
      await empty.click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('القاعة / المعمل (اختياري)').fill('معمل العلوم');
      await dlg.getByRole('button', { name: /الرياضيات|العلوم/ }).first().click();
      await dlg.waitFor({ state: 'hidden' });
      const base = label.replace(/ فارغة$/, '');
      await page.getByRole('button', { name: new RegExp(`^${base}: `) }).waitFor(); // الخلية تعرض المادة والشعبة الآن
      await page.reload();
      await page.getByRole('button', { name: new RegExp(`^${base}: `) }).click(); // باقية بعد إعادة التحميل
      await page.getByRole('dialog').getByRole('button', { name: 'إفراغ الحصة' }).click();
      await page.getByRole('button', { name: new RegExp(`^${base} فارغة`) }).waitFor();
    });

    await step('ملف الطالب: إضافة ملاحظة ← باقية بعد إعادة التحميل ← حذفها بتأكيد', async () => {
      const st = gb.students[3];
      await page.goto(`/students/${st.studentId}`);
      await page.getByRole('tab', { name: /الملاحظات/ }).click();
      await page.getByRole('button', { name: 'إضافة ملاحظة' }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('الملاحظة').fill('يحتاج متابعة في مهارة القياس — ملاحظة اختبار');
      await dlg.getByRole('button', { name: 'حفظ', exact: true }).click();
      await page.getByText('ملاحظة اختبار').first().waitFor();
      await page.reload();
      await page.getByRole('tab', { name: /الملاحظات/ }).click();
      await page.getByText('ملاحظة اختبار').first().waitFor(); // باقية بعد إعادة التحميل
      await page.getByRole('button', { name: 'حذف الملاحظة' }).first().click();
      await page.getByRole('dialog').getByRole('button', { name: 'حذف', exact: true }).click();
      await page.waitForFunction(() => !document.body.innerText.includes('ملاحظة اختبار'));
    });

    await step('الصفحات الأخرى تُفتح بلا أخطاء: الجدول الأسبوعي، ملف الطالب، التحضير', async () => {
      await page.goto('/timetable');
      await page.locator('h1').first().waitFor();
      await page.goto(`/students/${gb.students[0].studentId}`);
      await page.locator('h1').first().waitFor();
      await page.goto('/lessons');
      await page.locator('h1').first().waitFor();
    });
  } finally {
    await ctx.close();
  }
}

// ═════════════════════════ المرحلة 3: المدير ═════════════════════════
async function phaseAdmin(browser, srv) {
  const { ctx, page } = await newSession(browser, srv.base, 'admin');
  const userEmail = 'teacher.new@e2e.local';
  let tempPassword = '';
  try {
    await step('المدير يدخل ويرى تبويبات الإدارة', async () => {
      await login(page, PW.admin);
      await page.goto('/settings?tab=users');
      for (const t of ['المستخدمون', 'النسخ الاحتياطي', 'سجل العمليات']) await page.getByRole('tab', { name: t }).waitFor();
      await page.getByText(PW.demo.email).waitFor();
    }, { critical: true });

    await step('ينشئ مستخدمًا بكلمة مرور مؤقتة مُولَّدة', async () => {
      await page.getByRole('button', { name: 'إضافة مستخدم' }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByLabel('الاسم الكامل').fill('معلمة جديدة للاختبار');
      await dlg.getByLabel('البريد الإلكتروني').fill(userEmail);
      tempPassword = await dlg.getByLabel('كلمة المرور المؤقتة').inputValue();
      expect(tempPassword.length >= 10, 'لم تُولَّد كلمة مرور');
      await dlg.getByRole('button', { name: 'إنشاء الحساب' }).click();
      await toast(page, /أُنشئ حساب/).waitFor();
      await page.getByText(userEmail).waitFor();
      await page.getByText('كلمة مؤقتة').first().waitFor();
    }, { critical: true });

    // ───── المستخدم الجديد (سياق منفصل) ─────
    const other = await newSession(browser, srv.base, 'new-user');
    const op = other.page;
    try {
      await step('المستخدم الجديد مُلزَم بتغيير كلمة المرور قبل أي شيء', async () => {
        await login(op, { email: userEmail, password: tempPassword });
        await expectText(op.locator('h1'), /اختر كلمة مرور جديدة/);
        const blocked = await apiStatus(op, '/years');
        expect(blocked === 403, `قبل التغيير يجب منع الوصول (403) وجاء ${blocked}`);
        allowProblem(/http 403: GET \/api\/years/);
      });

      await step('يغيّر كلمة المرور فيدخل إلى لوحة نظيفة (بلا أي بيانات للآخرين)', async () => {
        await op.locator('input[autocomplete="current-password"]').fill(tempPassword);
        await newPw(op, 0).fill('Teacher-New-Pass-2026');
        await newPw(op, 1).fill('Teacher-New-Pass-2026');
        await op.getByRole('button', { name: 'حفظ والمتابعة' }).click();
        await op.waitForURL((u) => u.pathname === '/');
        await op.getByText('ابدأ مع سجلي في دقائق').waitFor();
        const students = await apiGet(op, '/students');
        expect((students.total ?? students.items?.length ?? 0) === 0, 'المعلم الجديد يرى طلابًا ليسوا له!');
      });

      await step('تعطيل المدير للحساب يُنهي جلسة المستخدم فورًا ويمنع دخوله', async () => {
        const row = page.locator('li', { hasText: userEmail });
        await row.getByRole('button', { name: /إجراءات/ }).click();
        await page.getByRole('menuitem', { name: 'تعطيل الحساب' }).click();
        await page.getByRole('dialog').getByRole('button', { name: 'تعطيل الحساب' }).click();
        await toast(page, /عُطّل الحساب/).waitFor();
        allowProblem(/http 401: GET \/api\/(auth\/me|years|dashboard|settings|sections)/);
        const s = await apiStatus(op, '/years');
        expect(s === 401, `بعد التعطيل: ${s}`);
        allowProblem(/http 403: POST \/api\/auth\/login/);
        await op.goto('/login');
        await op.getByLabel('البريد الإلكتروني').fill(userEmail);
        await op.locator('input[autocomplete="current-password"]').fill('Teacher-New-Pass-2026');
        await op.getByRole('button', { name: 'تسجيل الدخول' }).click();
        await op.getByText('معطّل').first().waitFor();
      });
    } finally {
      await other.ctx.close();
    }

    await step('إعادة تعيين كلمة المرور من المدير ثم الحذف النهائي يتطلب التعطيل وكتابة البريد', async () => {
      const row = page.locator('li', { hasText: userEmail });
      await row.getByRole('button', { name: /إجراءات/ }).click();
      await page.getByRole('menuitem', { name: 'إعادة تعيين كلمة المرور' }).click();
      const dlg = page.getByRole('dialog');
      await dlg.getByRole('button', { name: 'تعيين' }).click();
      await toast(page, /عُيّنت كلمة مرور مؤقتة/).waitFor();
      await row.getByRole('button', { name: /إجراءات/ }).click();
      await page.getByRole('menuitem', { name: /حذف نهائي/ }).click();
      const confirm = page.getByRole('dialog');
      const btn = confirm.getByRole('button', { name: 'حذف نهائيًا' });
      expect(await btn.isDisabled(), 'زر الحذف يجب أن يكون معطّلًا قبل كتابة البريد');
      await confirm.getByLabel('نص التأكيد').fill(userEmail);
      await btn.click();
      await toast(page, /حُذف الحساب/).waitFor();
      await page.waitForFunction((e) => !document.body.innerText.includes(e), userEmail);
    });

    await step('المدير لا يستطيع تعطيل حسابه أو حذفه', async () => {
      const row = page.locator('li', { hasText: PW.admin.email });
      await row.getByRole('button', { name: /إجراءات/ }).click();
      expect(await page.getByRole('menuitem', { name: 'تعطيل الحساب' }).isDisabled(), 'تعطيل الذات متاح!');
      expect(await page.getByRole('menuitem', { name: /حذف نهائي/ }).isDisabled(), 'حذف الذات متاح!');
      await page.keyboard.press('Escape');
    });

    // ───── النسخ الاحتياطي ─────
    await step('ينشئ نسخة احتياطية يدوية تظهر في القائمة', async () => {
      await page.goto('/settings?tab=backups');
      await page.getByRole('button', { name: 'نسخة احتياطية الآن' }).click();
      await toast(page, /أُنشئت نسخة احتياطية/).waitFor();
      await page.getByText('يدوية').first().waitFor();
    }, { critical: true });

    await step('تنزيل النسخة يعطي ملف SQLite حقيقيًا', async () => {
      const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /تنزيل النسخة/ }).first().click()]);
      const head = fs.readFileSync(await dl.path()).subarray(0, 15).toString();
      expect(head === 'SQLite format 3', `ترويسة الملف: ${JSON.stringify(head)}`);
    });

    // ───── استعادة حقيقية: ننشئ مستخدمًا بعد النسخة ثم نستعيد فيختفي ─────
    const ghost = 'ghost.after.backup@e2e.local';
    await step('الاستعادة تُرجع القاعدة لحالة النسخة (مستخدم أُنشئ بعدها يختفي) وتتطلب كتابة «استعادة»', async () => {
      const created = await page.evaluate(async (email) => (await fetch('/api/users', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-sijilli-client': 'web' }, body: JSON.stringify({ fullName: 'شبح', email, password: 'Ghost-E2E-Pass-2026', role: 'teacher' }) })).status, ghost);
      expect(created === 201, `إنشاء المستخدم الشبح: ${created}`);
      await page.reload();
      await page.getByRole('button', { name: /استعادة النسخة/ }).first().click();
      const dlg = page.getByRole('dialog');
      const btn = dlg.getByRole('button', { name: 'استعادة', exact: true });
      expect(await btn.isDisabled(), 'زر الاستعادة يجب أن يتعطل حتى تُكتب كلمة التأكيد');
      await dlg.getByLabel('نص التأكيد').fill('استعادة');
      await btn.click();
      // بعد الاستعادة يُعاد تحميل التطبيق كله (يرجع إلى «/»، أو إلى «/login» إن لم تكن الجلسة ضمن النسخة)
      await page.waitForURL((u) => !u.pathname.startsWith('/settings'), { timeout: 20_000 });
    });

    await step('بعد الاستعادة: الدخول يعمل والبيانات سليمة والمستخدم الشبح غير موجود', async () => {
      if (new URL(page.url()).pathname.startsWith('/login')) await login(page, PW.admin);
      await page.goto('/settings?tab=users');
      await page.getByText(PW.demo.email).waitFor();
      expect((await page.getByText(ghost).count()) === 0, 'المستخدم الشبح لا يزال موجودًا — لم تتم الاستعادة فعليًا');
      await page.goto('/settings?tab=backups');
      await page.getByText('احتياط قبل استعادة').first().waitFor(); // نسخة الأمان التلقائية قبل الاستعادة
    });

    await step('سجل العمليات يعرض الأحداث بالعربية بلا بيانات حساسة', async () => {
      await page.goto('/settings?tab=audit');
      await page.getByText('تسجيل دخول').first().waitFor();
      const text = await page.locator('main').innerText();
      expect(!/Wrong-Password|Pass-2026/.test(text), 'ظهرت كلمة مرور في سجل العمليات!');
    });
  } finally {
    await ctx.close();
  }
}

// ═════════════════════════ المرحلة 4: المسح البصري ═════════════════════════
async function phaseVisual(browser, srv) {
  if (!onlyPages.length && !onlyCombos.length) fs.rmSync(shotsDir, { recursive: true, force: true });
  fs.mkdirSync(shotsDir, { recursive: true });

  const boot = await newSession(browser, srv.base, 'visual-boot');
  await login(boot.page, PW.demo);
  const years = await apiGet(boot.page, '/years');
  const assignments = await apiGet(boot.page, '/assignments');
  const asg = assignments.find((a) => a.sectionLabel === '10/1');
  const sections = await apiGet(boot.page, `/sections?yearId=${years[0].id}`);
  const roster = await apiGet(boot.page, `/sections/${sections[0].id}/students`);
  const lessons = await apiGet(boot.page, '/lessons?limit=1');
  const plans = await apiGet(boot.page, '/support-plans');
  await boot.ctx.close();

  const pages = [
    ['dashboard', '/'],
    ['classes', '/classes'],
    ['section', `/classes/${sections[0].id}`],
    ['student', `/students/${roster[0].student.id}`],
    ['lessons', '/lessons'],
    ['lesson-editor', `/lessons/${lessons.items[0].id}`],
    ['assessments', '/assessments'],
    ['gradebook', `/assessments/${asg.id}?term=${years[0].terms[0].id}`],
    ['timetable', '/timetable'],
    ['tasks', '/tasks'],
    ['support', '/support'],
    ['support-plan', `/support/${plans[0].id}`],
    ['reports', '/reports'],
    ['settings', '/settings'],
  ];
  const combos = [
    ['light', 'desktop', DESKTOP],
    ['dark', 'desktop', DESKTOP],
    ['light', 'mobile', MOBILE],
    ['dark', 'mobile', MOBILE],
  ];

  for (const [theme, vp, viewport] of combos) {
    if (onlyCombos.length && !onlyCombos.includes(`${theme}-${vp}`)) continue;
    const { ctx, page } = await newSession(browser, srv.base, `visual-${theme}-${vp}`, { viewport, colorScheme: theme });
    // التفضيل المحفوظ في الحساب «حسب النظام» فتتبع الواجهة ‎prefers-color-scheme‎ الخاص بالسياق (الاختبار الطبيعي للسمة)
    await login(page, PW.demo);
    await page.evaluate(async () => { await fetch('/api/settings', { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-sijilli-client': 'web' }, body: JSON.stringify({ preferences: { theme: 'system' } }) }); });
    for (const [name, url] of pages) {
      if (onlyPages.length && !onlyPages.includes(name)) continue;
      await step(`${name} — ${theme}/${vp}: يُرسم بلا تمرير أفقي ولا مخالفات وصول (axe)`, async () => {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.locator('main :is(h1, h2, table, [role=tablist], input)').first().waitFor();
        await page.waitForTimeout(350);
        // اللقطة قبل الفحوص: حتى تبقى متاحة لدراسة الإخفاق
        await page.screenshot({ path: path.join(shotsDir, `${theme}-${vp}-${name}.png`), fullPage: false });
        const info = await page.evaluate(() => {
          const doc = document.documentElement;
          const overflow = doc.scrollWidth - doc.clientWidth;
          const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
          const nameOf = (el) =>
            (el.getAttribute('aria-label') ?? '').trim() ||
            (el.getAttribute('aria-labelledby') ? (document.getElementById(el.getAttribute('aria-labelledby'))?.textContent ?? '').trim() : '') ||
            (el.labels ? Array.from(el.labels).map((l) => l.textContent).join('').trim() : '') ||
            (el.textContent ?? '').trim() ||
            (el.getAttribute('title') ?? '').trim() ||
            (el.getAttribute('placeholder') ?? '').trim();
          const unnamed = Array.from(document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea'))
            .filter((el) => visible(el) && !el.closest('[aria-hidden=true]') && !nameOf(el))
            .map((el) => `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`);
          return { overflow, unnamed: unnamed.slice(0, 5), theme: doc.dataset.theme };
        });
        expect(info.overflow <= 1, `تمرير أفقي بمقدار ${info.overflow}px`);
        expect(info.unnamed.length === 0, `عناصر تفاعلية بلا اسم: ${info.unnamed.join(', ')}`);
        expect(info.theme === theme, `السمة المطبّقة ${info.theme} وليست ${theme}`);
        if (axeSource) {
          await page.evaluate(axeSource);
          const violations = await page.evaluate(async () => {
            const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } });
            return res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, first: v.nodes[0]?.target.join(' ').slice(0, 90) }));
          });
          expect(violations.length === 0, `مخالفات إمكانية الوصول (axe): ${violations.map((v) => `${v.id}[${v.impact}]×${v.nodes} ${v.first}`).join(' ؛ ')}`);
        }
      });
    }
    await ctx.close();
  }
}

// ═════════════════════════ التشغيل ═════════════════════════
async function main() {
  for (const f of ['dist/server/index.js', 'dist/server/cli.js', 'dist/web/index.html']) {
    if (!fs.existsSync(path.join(root, f))) {
      console.error(`✘ ${f} غير موجود. نفّذ أولًا:  npm run build`);
      process.exit(2);
    }
  }
  const executablePath = findChromium();
  if (!executablePath) {
    console.error('✘ لم يُعثر على Chromium. ثبّته أو اضبط CHROMIUM_PATH.');
    process.exit(2);
  }
  chromiumPath = executablePath;
  const browser = await chromium.launch({ executablePath, headless: !headed, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const t0 = Date.now();
  let shared;
  try {
    await runPhase('first-run', () => phaseFirstRun(browser));
    if (!only.length || only.some((o) => ['demo', 'admin', 'visual'].includes(o))) {
      shared = await startServer('shared', { seed: true });
      await runPhase('demo', () => phaseDemo(browser, shared));
      await runPhase('visual', () => phaseVisual(browser, shared));
      await runPhase('admin', () => phaseAdmin(browser, shared)); // أخيرًا: الاستعادة تغيّر القاعدة
    }
  } finally {
    await browser.close().catch(() => {});
    for (const s of servers) await s.stop();
    for (const f of tmpFiles) fs.rmSync(f, { force: true });
    if (!keepData) for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
    else console.log('\nمجلدات البيانات المؤقتة:', tmpDirs.join(', '));
  }

  // الأخطاء غير المتوقعة في الكونسول/الشبكة أثناء الرحلة كلها
  const unexpected = [...new Set(problems)].filter((p) => !allowed.some((re) => re.test(p)));
  if (!only.length || only.length > 0) {
    results.push({ phase: 'global', name: 'لا أخطاء كونسول أو استجابات HTTP غير متوقعة أثناء كل الاختبارات', ok: unexpected.length === 0, error: unexpected.slice(0, 8).join(' ⏎ ') });
    console.log(`\n${unexpected.length === 0 ? '  ✔' : '  ✘'} لا أخطاء كونسول أو استجابات HTTP غير متوقعة${unexpected.length ? '\n      ' + unexpected.slice(0, 12).join('\n      ') : ''}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n══════════════════════════════════════════`);
  console.log(`النتيجة: ${results.length - failed.length}/${results.length} نجح — ${Math.round((Date.now() - t0) / 1000)}ث`);
  if (failed.length) {
    console.log('\nالإخفاقات:');
    for (const f of failed) console.log(`  ✘ [${f.phase}] ${f.name}\n      ${f.error ?? ''}`);
  }
  if (fs.existsSync(shotsDir)) console.log(`\nلقطات الشاشة: ${path.relative(root, shotsDir)}/`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
