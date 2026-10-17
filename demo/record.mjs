#!/usr/bin/env node
// يسجّل لقطة من التطبيق الحقيقي لتُبنى منها المعاينة التفاعلية (انظر demo/build.mjs و docs/DEMO.md):
//   npm run build && node demo/record.mjs
// 1) يبذر الحساب التجريبي (بيانات وهمية) في قاعدة مؤقتة والساعة مثبّتة على الثلاثاء 13 أكتوبر 2026 (يوم دراسي بحصص).
// 2) يشغّل الخادم الإنتاجي بالساعة نفسها، ويدخل ويتجوّل بمتصفح حقيقي في كل الصفحات (بحاسوب)،
//    ويسجّل كل استجابة GET ناجحة من /api — فتعيدها المعاينة لاحقًا بلا خادم.
// الناتج: dist-demo/data.json
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { demoKey } from './key.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist-demo');
const fakeNow = path.join(root, 'demo', 'fake-now.mjs');
export const DEMO_NOW = '2026-10-13T09:30:00+04:00'; // الثلاثاء: حصتان في الجدول الأسبوعي
const EMAIL = 'demo@sijilli.local';
const PASSWORD = 'Demo-Preview-2026';
const CONCURRENCY = 4;
const MAX_ROUTES = 400;

// ───────── بيئة التشغيل ─────────
for (const f of ['dist/server/index.js', 'dist/server/cli.js']) {
  if (!fs.existsSync(path.join(root, f))) {
    console.error(`✘ ${f} غير موجود. نفّذ أولًا:  npm run build`);
    process.exit(2);
  }
}

function findChromium() {
  const candidates = [process.env.CHROMIUM_PATH, process.env.CHROME_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
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

const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sijilli-demo-'));
// حدّ الطلبات مرفوع: الجولة تُرسل مئات الطلبات في الدقيقة من متصفحات متوازية (خادم مؤقت لا يصله أحد)
const baseEnv = { ...process.env, NODE_ENV: 'production', DATA_DIR: dataDir, LOG_LEVEL: 'error', DEMO_NOW, AI_PROVIDER: 'none', BACKUP_INTERVAL_HOURS: '0', RATE_LIMIT_PER_MINUTE: '100000' };
let server;
const cleanup = async () => {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    await new Promise((r) => {
      server.once('exit', r);
      setTimeout(() => {
        server.kill('SIGKILL');
        r();
      }, 3000);
    });
  }
  fs.rmSync(dataDir, { recursive: true, force: true });
};

async function main() {
  const t0 = Date.now();
  // 1) بذر الحساب التجريبي بساعة مثبّتة
  const seed = spawnSync(process.execPath, ['--import', fakeNow, path.join(root, 'dist/server/cli.js'), 'seed-demo', '--email', EMAIL, '--password', PASSWORD], { env: baseEnv, encoding: 'utf8' });
  if (seed.status !== 0) throw new Error(`فشل بذر الحساب التجريبي: ${seed.stderr || seed.stdout}`);

  // 2) الخادم الإنتاجي بالساعة نفسها
  const port = await freePort();
  server = spawn(process.execPath, ['--import', fakeNow, path.join(root, 'dist/server/index.js')], {
    cwd: root,
    env: { ...baseEnv, HOST: '127.0.0.1', PORT: String(port), LOG_LEVEL: 'warn' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  server.stdout.on('data', (d) => (log += d));
  server.stderr.on('data', (d) => (log += d));
  const base = `http://127.0.0.1:${port}`;
  for (const started = Date.now(); ; ) {
    if (server.exitCode !== null) throw new Error(`الخادم توقف عند البدء:\n${log}`);
    try {
      if ((await fetch(`${base}/api/health`)).ok) break;
    } catch {
      /* لم يبدأ بعد */
    }
    if (Date.now() - started > 30_000) throw new Error(`انتهت مهلة بدء الخادم:\n${log}`);
    await new Promise((r) => setTimeout(r, 150));
  }

  // 3) المتصفح: الساعة ثابتة على اللحظة نفسها كي تتطابق التواريخ التي يحسبها العميل مع ما سجّله الخادم
  const executablePath = findChromium();
  if (!executablePath) throw new Error('لم يُعثر على Chromium. اضبط CHROMIUM_PATH.');
  const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1360, height: 860 },
    locale: 'ar-OM',
    timezoneId: 'Asia/Muscat',
    colorScheme: 'light',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  await context.clock.setFixedTime(new Date(DEMO_NOW));
  const pages = await Promise.all(Array.from({ length: CONCURRENCY }, () => context.newPage()));
  pages.forEach((p) => p.setDefaultTimeout(15_000));

  // 4) التسجيل: كل GET ناجح من /api
  const entries = new Map(); // المفتاح ← { t: 'j' | 'h', b: النص }
  const failed = [];
  const inflight = new Set();
  const appErrors = [];
  const track = new WeakMap(); // الصفحة ← { open: طلبات /api جارية، last: وقت آخر طلب }
  const stateOf = (page) => track.get(page) ?? track.set(page, { open: 0, last: 0 }).get(page);
  const listen = (page) => {
    const st = stateOf(page);
    const isApi = (r) => new URL(r.url()).pathname.startsWith('/api/');
    page.on('request', (r) => {
      if (!isApi(r)) return;
      st.open++;
      st.last = Date.now();
    });
    page.on('requestfinished', (r) => {
      if (isApi(r)) st.open--;
    });
    page.on('requestfailed', (r) => {
      if (isApi(r)) st.open--;
    });
    page.on('response', (res) => {
      const req = res.request();
      const u = new URL(res.url());
      if (!u.pathname.startsWith('/api/')) return;
      const p = (async () => {
        if (req.method() !== 'GET') return;
        if (res.status() !== 200) {
          failed.push(`${res.status()} ${u.pathname}${u.search}`);
          return;
        }
        let body;
        try {
          body = await res.text();
        } catch {
          return;
        }
        const type = (res.headers()['content-type'] ?? '').includes('text/html') ? 'h' : 'j';
        entries.set(demoKey(u.pathname.slice(4), u.searchParams), { t: type, b: body });
      })();
      inflight.add(p);
      p.finally(() => inflight.delete(p));
    });
    page.on('pageerror', (e) => appErrors.push(`pageerror: ${String(e.message).slice(0, 200)}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) appErrors.push(`console: ${m.text().slice(0, 200)}`);
    });
  };
  pages.forEach(listen);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // «هدوء» الصفحة: لا طلبات /api جارية ولا قراءة جسم استجابة معلّقة، ومضى زمن قصير على آخر طلب (تتولّد طلبات تابعة بعد الرسم)
  const settle = async (page, gap = 280) => {
    const st = stateOf(page);
    for (;;) {
      while (inflight.size) await Promise.allSettled([...inflight]);
      if (st.open <= 0 && Date.now() - st.last >= gap) return;
      await sleep(40);
    }
  };
  // التنقل داخل التطبيق دون إعادة تحميل الحزمة (أسرع بكثير)؛ التحميل الكامل في المرة الأولى فقط
  const go = async (page, route) => {
    if (page.url().startsWith(base) && !page.url().includes('/login')) {
      await page.evaluate((r) => {
        window.history.pushState({}, '', r);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, route);
    } else {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
    }
    await page.locator('main').first().waitFor();
    await settle(page);
  };

  // 5) الدخول
  const [main] = pages;
  await main.goto('/login');
  await main.getByLabel('البريد الإلكتروني').fill(EMAIL);
  await main.locator('input[autocomplete="current-password"]').fill(PASSWORD);
  await main.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await main.waitForURL((u) => !u.pathname.startsWith('/login'));
  await settle(main);

  const api = (page, p) => page.evaluate(async (u) => (await fetch(`/api${u}`, { credentials: 'same-origin' })).json(), p);
  const years = await api(main, '/years');
  const year = years.find((y) => y.isCurrent) ?? years[0];
  const assignments = await api(main, `/assignments?yearId=${year.id}`);
  const students = (await api(main, '/students?limit=500')).items;
  const lessons = (await api(main, '/lessons?limit=500')).items;
  const plans = await api(main, '/support-plans');
  const labs = (await api(main, '/lab-activities?limit=200')).items;
  const sections = await api(main, `/sections?yearId=${year.id}`);
  console.log(`البذرة: ${sections.length} شعبة · ${assignments.length} مقرر · ${students.length} طالبًا · ${lessons.length} تحضيرًا · ${plans.length} خطة · ${labs.length} نشاط مختبر`);

  // ───── أ) جولة على الصفحات: كل رابط داخلي، وكل تبويب/خيار/قائمة مختارة ─────
  const visited = new Set();
  const normalize = (href) => {
    const u = new URL(href, 'http://x');
    let p = u.pathname.replace(/\/+$/, '') || '/';
    if (p === '/lessons/new') return p; // تتعدد روابطه بالتاريخ والحصة دون بيانات مختلفة
    if (/^\/students\/[^/]+$/.test(p)) return p; // تبويبات ملف الطالب تُنقَر كلها في الجولة، فلا حاجة لرابط لكل تبويب
    return p + u.search;
  };
  // شاشات الحصص يخدمها محرّك المعاينة من الذاكرة (استجاباتها تُسقَط عند الكتابة)، فلا تُزار حصة حصة
  const skip = (r) => r.startsWith('/login') || r.startsWith('/setup') || r.startsWith('/api') || r.startsWith('/class/session');

  async function exploreRoute(page, route) {
    await go(page, route);
    const isSettings = route.startsWith('/settings');
    // تبويبات وخيارات مقسّمة (طرق العرض، أنواع التقارير، حالات التصفية…)
    for (const role of ['tab', 'radio']) {
      const n = await page.getByRole(role).count();
      for (let i = 0; i < n; i++) {
        await page.getByRole(role).nth(i).click({ timeout: 3000 }).catch(() => undefined);
        await settle(page);
      }
    }
    // قوائم الاختيار: نجرّب كل خيار (تصفية بالشعبة، الفصل…) — لا في الإعدادات حتى لا نغيّر التفضيلات
    if (!isSettings) {
      const n = await page.locator('main select').count();
      for (let i = 0; i < n; i++) {
        const sel = page.locator('main select').nth(i);
        const values = await sel.locator('option').evaluateAll((os) => os.map((o) => o.value));
        for (const v of values.slice(0, 12)) {
          await sel.selectOption(v, { timeout: 3000 }).catch(() => undefined);
          await settle(page);
        }
      }
    }
    return page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
  }

  let frontier = ['/'];
  while (frontier.length && visited.size < MAX_ROUTES) {
    const batch = frontier.filter((r) => !visited.has(r) && !skip(r)).slice(0, MAX_ROUTES - visited.size);
    frontier = [];
    batch.forEach((r) => visited.add(r));
    let cursor = 0;
    await Promise.all(
      pages.map(async (page) => {
        for (;;) {
          const route = batch[cursor++];
          if (route === undefined) return;
          try {
            const links = await exploreRoute(page, route);
            for (const h of links) frontier.push(normalize(h));
          } catch (e) {
            appErrors.push(`route ${route}: ${String(e.message).split('\n')[0]}`);
          }
        }
      }),
    );
    console.log(`  … ${visited.size} مسارًا، ${entries.size} استجابة (${Math.round((Date.now() - t0) / 1000)}ث)`);
  }

  // ───── ب) صفحات بمعرّفات لم تظهر في أي رابط ─────
  const extra = [
    ...sections.map((s) => `/classes/${s.id}`),
    ...students.map((s) => `/students/${s.id}`),
    ...lessons.map((l) => `/lessons/${l.id}`),
    ...plans.map((p) => `/support/${p.id}`),
    ...assignments.flatMap((a) => year.terms.map((t) => `/assessments/${a.id}?term=${t.id}`)),
  ].filter((r) => !visited.has(r));
  let cursor = 0;
  await Promise.all(
    pages.map(async (page) => {
      for (;;) {
        const route = extra[cursor++];
        if (route === undefined) return;
        visited.add(route);
        try {
          await go(page, route);
        } catch (e) {
          appErrors.push(`route ${route}: ${String(e.message).split('\n')[0]}`);
        }
      }
    }),
  );
  console.log(`  … ${visited.size} مسارًا، ${entries.size} استجابة (بعد المعرّفات)`);

  // ───── ج) نقاط نهاية لا تضمن الجولة وصولها (تبويبات كسولة) ─────
  for (const u of ['/auth/me', '/auth/sessions', '/settings', '/subjects', '/years', '/system/info', '/dashboard']) await api(main, u);

  // ───── ج-2) تفاصيل نشاط المختبر (تُفتح في نافذة) والمهارات ─────
  for (const l of labs) await api(main, `/lab-activities/${l.id}`);
  // إدارة الصف: تقرير كل طالب بكل حصصه (بلا نطاق) — منه تُبذر صفوف محرّك المعاينة (demo/class-engine.ts)
  for (const s of students) await api(main, `/class/students/${s.id}?limit=500`);
  for (const subject of [...new Set(assignments.map((a) => a.subjectId))]) {
    await api(main, `/skills?subjectId=${subject}`);
    await api(main, `/skills?subjectId=${subject}&includeArchived=true`);
  }
  await settle(main);

  // ───── د) التنقل بين الأسابيع والأشهر ─────
  async function stepper(route, tabName, prev, next, backs, forwards) {
    const page = pages[1];
    await go(page, route);
    if (tabName) await page.getByRole('tab', { name: tabName }).click();
    if (route === '/lessons') await page.getByRole('radio', { name: 'أسبوعي' }).click(); // الاختيار الأخير محفوظ في المتصفح من جولة الخيارات
    await settle(page);
    for (let i = 0; i < backs; i++) {
      await page.getByRole('button', { name: prev }).click();
      await settle(page);
    }
    for (let i = 0; i < backs + forwards; i++) {
      await page.getByRole('button', { name: next }).click();
      await settle(page);
    }
  }
  await stepper('/lessons', null, 'الأسبوع السابق', 'الأسبوع التالي', 6, 6);
  await stepper('/tasks', 'التقويم الدراسي', 'الشهر السابق', 'الشهر التالي', 3, 3);

  // ───── هـ) التقارير: كل نوع × الخيارات الأساسية، ثم المصفوفة الكاملة (مقرر × فصل، وكل طالب) مباشرةً ─────
  {
    const apiText = (page, u) => page.evaluate(async (x) => (await fetch(`/api${x}`, { credentials: 'same-origin' })).text(), u);
    const todayIso = DEMO_NOW.slice(0, 10);
    const current = year.terms.find((x) => x.startDate <= todayIso && todayIso <= x.endDate) ?? year.terms[0]; // الفصل الحالي يُحسب من التواريخ كما في الواجهة
    for (const a of assignments) {
      for (const tm of year.terms) {
        await apiText(main, `/reports/class-gradebook/html?assignmentId=${a.id}&termId=${tm.id}`);
        await apiText(main, `/reports/class-analysis/html?assignmentId=${a.id}&termId=${tm.id}`);
      }
    }
    // تقرير الطالب (بالمعاملات الافتراضية للواجهة: الفصل الحالي بلا ملاحظات ولا بيانات ولي الأمر)
    for (const s of students) await apiText(main, `/reports/student/html?studentId=${s.id}&termId=${current.id}&includeNotes=false&includeGuardian=false`);
    await settle(main);
  }
  {
    const page = pages[2];
    await go(page, '/reports');
    const types = await page.getByRole('radiogroup', { name: 'نوع التقرير' }).getByRole('radio').count();
    for (let i = 0; i < types; i++) {
      await page.getByRole('radiogroup', { name: 'نوع التقرير' }).getByRole('radio').nth(i).click();
      await sleep(500);
      await settle(page);
      // الطالب: نختار الشعبة ثم أول طالب
      const sectionSel = page.locator('main select').filter({ has: page.locator('option', { hasText: /^\d+\/\d+/ }) });
      const selects = page.locator('main select');
      const n = await selects.count();
      for (let k = 0; k < n; k++) {
        const sel = selects.nth(k);
        const values = await sel.locator('option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
        for (const v of values.slice(0, 6)) {
          await sel.selectOption(v).catch(() => undefined);
          await sleep(500);
          await settle(page);
        }
      }
      void sectionSel;
    }
  }

  await Promise.all(pages.map((p) => settle(p)));
  await browser.close();

  // ───── و) تنقية وكتابة ─────
  // إدارة الصف: يخدمها محرّك المعاينة من صفوف في الذاكرة (وتقاريرها تُولَّد حيّة)، فلا نحتفظ من الجولة إلا بتقارير الطلاب الخام التي يُبذر منها
  const RAW_CLASS = /^\/class\/students\/[^/?]+\?limit=500$/;
  for (const k of [...entries.keys()]) {
    if ((k.startsWith('/class/') && !RAW_CLASS.test(k)) || /^\/reports\/class-(student|section)\//.test(k)) entries.delete(k);
  }
  // الجلسات: عنوان IP ومتصفح المسجّل لا فائدة لهما في المعاينة
  for (const [k, v] of entries) {
    if (k === '/auth/sessions') {
      const list = JSON.parse(v.b);
      v.b = JSON.stringify(list.map((s) => ({ ...s, ip: null })));
    }
  }
  fs.mkdirSync(outDir, { recursive: true });
  const out = { now: DEMO_NOW, email: EMAIL, entries: Object.fromEntries(entries) };
  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(out));

  const bytes = [...entries.values()].reduce((n, e) => n + e.b.length, 0);
  const classKeys = [...entries.keys()].filter((k) => RAW_CLASS.test(k));
  const classBytes = classKeys.reduce((n, k) => n + entries.get(k).b.length, 0);
  console.log(`\n✔ سُجّلت ${entries.size} استجابة (${(bytes / 1024).toFixed(0)} ك.ب نصًا) من ${visited.size} مسارًا في ${Math.round((Date.now() - t0) / 1000)}ث`);
  console.log(`  إدارة الصف: ${classKeys.length} تقرير طالب خام (${(classBytes / 1024).toFixed(0)} ك.ب) لبذر المحرّك`);
  const uniqFailed = [...new Set(failed)];
  if (uniqFailed.length) console.log(`استجابات غير ناجحة (غير مسجّلة): ${uniqFailed.length}\n  ${uniqFailed.slice(0, 15).join('\n  ')}`);
  const uniqErrors = [...new Set(appErrors)];
  if (uniqErrors.length) console.log(`تنبيهات أثناء الجولة: ${uniqErrors.length}\n  ${uniqErrors.slice(0, 15).join('\n  ')}`);
}

main()
  .catch((e) => {
    console.error('✘', e?.message ?? e);
    process.exitCode = 1;
  })
  .finally(cleanup);
