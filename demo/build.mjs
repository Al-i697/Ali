#!/usr/bin/env node
// يبني المعاينة التفاعلية: ملف HTML واحد مكتفٍ بذاته (التطبيق + الأنماط + الخطوط + البيانات المسجَّلة) يُنشر كصفحة Artifact.
//   node demo/record.mjs     (مرة واحدة أو عند تغيّر الواجهة)  ← dist-demo/data.json
//   node demo/build.mjs                                          ← dist-demo/sijilli-preview.html
// لماذا ملف واحد؟ بيئة العرض تمنع أي طلب خارجي، وتمنع تغيير عنوان الصفحة، فكل شيء مضمَّن والتنقل في الذاكرة.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist-demo');
const dataFile = path.join(outDir, 'data.json');
const r = (...p) => path.join(root, ...p);

if (!fs.existsSync(dataFile)) {
  console.error('✘ dist-demo/data.json غير موجود. نفّذ أولًا:  npm run build && node demo/record.mjs');
  process.exit(2);
}

// خطوط fontsource تأتي بصيغتي woff2 وwoff؛ نكتفي بـwoff2 (كل المتصفحات الحالية) فيصغر الملف بنحو الثلث
const dropLegacyFonts = () => ({
  name: 'demo-drop-legacy-fonts',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource') || !id.endsWith('.css')) return null;
    return code.replace(/,\s*url\([^)]*\.woff\)\s*format\(["']woff["']\)/g, '');
  },
});

// ───────────── 1) بناء التطبيق بنمط المعاينة ─────────────
await viteBuild({
  configFile: false,
  root: r('src/web'),
  publicDir: false,
  logLevel: 'warn',
  plugins: [react(), tailwindcss(), dropLegacyFonts()],
  resolve: { alias: { '@shared': r('src/shared'), '@': r('src/web') } },
  define: { 'import.meta.env.VITE_DEMO': '"1"' },
  build: {
    outDir: path.join(outDir, 'app'),
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 100_000_000, // الخطوط والصور تُضمَّن data URI
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: { format: 'iife', entryFileNames: 'app.js', assetFileNames: 'app.[ext]' },
      // مساعد التحميل المسبق في Vite يذكر import.meta ولا يُستعمل هنا (لا فصل شيفرة)؛ نُسكت تحذيره
      onLog(level, log, handler) {
        if (log.code === 'EMPTY_IMPORT_META') return;
        handler(level, log);
      },
    },
  },
});
const appJs = fs.readFileSync(path.join(outDir, 'app/app.js'), 'utf8');
const appCss = fs.readFileSync(path.join(outDir, 'app/app.css'), 'utf8');

// ───────────── 2) البيانات المسجَّلة (تصغير + إزالة تكرار الخطوط في التقارير) ─────────────
const raw = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const FONT_RUN = /(?:@font-face\{font-family:'Plex'[^}]*\}\s*)+/;
let plexCss = '';
const entries = {};
for (const [key, e] of Object.entries(raw.entries)) {
  let b = e.b;
  if (e.t === 'h') {
    const m = FONT_RUN.exec(b);
    if (m) {
      plexCss ||= m[0];
      b = b.replace(FONT_RUN, '@@PLEX@@');
    }
  }
  if (e.t === 'j') {
    // JSON مصغَّر (الخادم يرسله مضغوطًا أصلًا، لكن نضمن ذلك)
    try {
      b = JSON.stringify(JSON.parse(b));
    } catch {
      /* يبقى كما هو */
    }
  }
  entries[key] = { t: e.t, b };
}
// التفضيل الظاهر في المعاينة يتبع نظام المشاهد (فاتح/داكن) لا ما كان محفوظًا وقت التسجيل
if (entries['/settings']) {
  const s = JSON.parse(entries['/settings'].b);
  s.preferences = { ...s.preferences, theme: 'system' };
  entries['/settings'].b = JSON.stringify(s);
}
const payload = { now: raw.now, plexCss, entries };
const payloadJson = JSON.stringify(payload);

// ───────────── 3) الطبقة الوسيطة ─────────────
const shim = await esbuild({
  entryPoints: [r('demo/shim.ts')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  platform: 'browser',
  write: false,
  define: { __DEMO_DATA__: JSON.stringify(payloadJson) },
  logLevel: 'warning',
});
const shimJs = shim.outputFiles[0].text;

// ───────────── 4) التركيب ─────────────
// داخل <script> يجب ألا يظهر ما يغلق الوسم أو يبدأ تعليق HTML
// وكذلك لا يظهر وسم html/head/body أو doctype حرفيًا: المنصة تلفّ الصفحة بهيكلها الخاص، والبيانات (أمثلة HTML التقارير) تحويها نصوصًا
const safeScript = (js) =>
  js
    .replace(/<\/(script)/gi, '<\\/$1')
    .replace(/<!--/g, '<\\x21--')
    .replace(/<(\/?)(html|head|body)\b/gi, '\\u003c$1$2')
    .replace(/<!doctype/gi, '\\u003c!doctype');
const init = `(function(){var d=document.documentElement;d.lang='ar';d.dir='rtl';var t=d.getAttribute('data-theme');var dark=t==='dark'||(t!=='light'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',dark?'dark':'light');d.style.colorScheme=dark?'dark':'light';})();`;

const html = `<title>سجلي | السجل الإلكتروني للمعلم</title>
<style>${appCss}</style>
<div id="root"><p style="padding:64px 16px;text-align:center;color:var(--muted);font-size:15px;line-height:1.8">جارٍ تحميل سجلي…</p></div>
<script>${init}</script>
<script>${safeScript(shimJs)}</script>
<script>${safeScript(appJs)}</script>
`;
const out = path.join(outDir, 'sijilli-preview.html');
const forbidden = /<\/?(html|head|body)\b|<!doctype/i.exec(html);
if (forbidden) {
  console.error(`✘ الصفحة تحوي وسمًا ممنوعًا في ملف المنصة: ${forbidden[0]}`);
  process.exit(1);
}
fs.writeFileSync(out, html);

const kb = (n) => `${(n / 1024).toFixed(0)} ك.ب`;
console.log(`✔ ${path.relative(root, out)} — ${kb(html.length)} (تطبيق ${kb(appJs.length)} · أنماط وخطوط ${kb(appCss.length)} · بيانات وطبقة وسيطة ${kb(shimJs.length)})`);
console.log(`  ${Object.keys(entries).length} استجابة مسجَّلة${plexCss ? ` · خط التقارير ${kb(plexCss.length)} مرة واحدة` : ''}`);
if (html.length > 15 * 1024 * 1024) {
  console.error('✘ الصفحة أكبر من 15 م.ب (الحد 16 م.ب)');
  process.exit(1);
}
