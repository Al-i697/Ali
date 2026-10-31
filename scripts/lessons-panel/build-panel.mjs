// يبني class-panel.js: محرّك «لوحة الصف» من موقع الإدارة الصفية داخل Shadow DOM ليُضمَّ إلى صفحات الدروس
// دون أن تتعارض أنماط الطرفين (أسماء مثل .btn و.chip و.ok موجودة عند الاثنين).
//   node scripts/lessons-panel/build-panel.mjs <ملف موقع الإدارة الصفية> <مجلد الدروس المنزّلة> <مجلد الخرج>
//   (التفاصيل والنشر والاختبار: scripts/lessons-panel/README.md)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../package.json', import.meta.url));
const postcss = require('postcss');

const [, , SRC, LESSONS_DIR, OUT] = process.argv;
if (!SRC || !LESSONS_DIR || !OUT) throw new Error('الاستعمال: build-panel.mjs <موقع الإدارة الصفية.html> <مجلد الدروس> <مجلد الخرج>');
fs.mkdirSync(OUT, { recursive: true });

const text = fs.readFileSync(SRC, 'utf8');
const doc = text.slice(text.indexOf('<!DOCTYPE html>'));

// ───────── 1) تقسيم الصفحة ─────────
const cssRaw = doc.match(/<style>([\s\S]*?)<\/style>/)[1];
const bodyStart = doc.indexOf('<body>') + '<body>'.length;
const firstScript = doc.indexOf('<script>', bodyStart);
let shell = doc.slice(bodyStart, firstScript);
const scripts = [...doc.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (scripts.length !== 4) throw new Error('توقّعت 4 سكربتات (JSZip، الربط، الرئيسي، الزخارف) ووجدت ' + scripts.length);
const [jszip, hostRaw, mainRaw, decorRaw] = scripts;

function replaceExactly(src, from, to, expected, label) {
  const parts = src.split(from);
  const n = parts.length - 1;
  if (n !== expected) throw new Error(`${label}: توقّعت ${expected} موضعًا ووجدت ${n}: ${from.slice(0, 70)}`);
  return parts.join(to);
}

// ───────── 2) الأنماط ─────────
const root = postcss.parse(cssRaw);
root.walkComments((c) => c.remove());
root.walkAtRules('media', (at) => { if (/print/.test(at.params)) at.remove(); });
const dropped = [];
root.walkRules((rule) => {
  if (rule.parent && rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
  const keep = [];
  for (const s of rule.selectors) {
    if (/^(html|body)(\s|$|,)/.test(s.trim()) && !/^(html|body)\s*[.#[:>+~]/.test(s.trim())) { dropped.push(s.trim()); continue; }
    keep.push(s.replace(/^:root\b/, ':host').replace(/^html\b/, ':host').replace(/^body\b/, ':host'));
  }
  if (!keep.length) rule.remove(); else rule.selectors = keep;
});
let css = root.toString().replace(/\s+/g, ' ');
css += `
:host{all:initial; display:contents; direction:rtl; text-align:start; font-family:'Tajawal','Cairo','Segoe UI',Tahoma,sans-serif; font-size:16px; line-height:1.75; color:#14213D; -webkit-font-smoothing:antialiased}
#kpPage{display:none!important}
.cls-fab{bottom:calc(84px + env(safe-area-inset-bottom,0px))}
.cls-fp:not(.is-moved){bottom:calc(84px + env(safe-area-inset-bottom,0px)); max-height:min(650px, calc(100dvh - 164px))}
@media (max-height:460px){ .cls-fp:not(.is-moved){max-height:calc(100dvh - 92px - env(safe-area-inset-bottom,0px)) !important} }
`;

// ───────── 3) الهيكل (HTML) ─────────
const chromeStart = shell.indexOf('<header class="top no-print">');
const chromeEnd = shell.indexOf('</footer>') + '</footer>'.length;
if (chromeStart < 0 || chromeEnd < chromeStart) throw new Error('لم أجد ترويسة الصفحة/تذييلها');
const layerStart = shell.indexOf('<!-- إدارة الصف: المشاركة والسلوك -->');
if (layerStart < 0) throw new Error('لم أجد بداية عناصر إدارة الصف');
shell =
  shell.slice(0, chromeStart) +
  '<div id="kpPage" hidden>' + shell.slice(chromeStart, chromeEnd) + '</div>' +
  '<div id="kpLayer">' + shell.slice(layerStart) + '</div>';

// ───────── 4) سكربت الربط (كان يقدّمه موقع التحضير) ─────────
let host = hostRaw;
host = replaceExactly(host, 'document.addEventListener("click", e => {', 'SR.addEventListener("click", e => {', 1, 'host.click');
host = replaceExactly(host, 'document.getElementById("toastMsg")', 'SR.getElementById("toastMsg")', 1, 'host.toastMsg');
host = replaceExactly(host, 'document.getElementById("toast")', 'SR.getElementById("toast")', 1, 'host.toast');
host += `
/* في صفحة الدرس: الدرس المعروض هو الدرس الافتراضي للتسجيل (حصة = شعبة + درس + تاريخ) */
if (KP_LESSON && Object.prototype.hasOwnProperty.call(DB, KP_LESSON)) state.key = KP_LESSON;
`;

// ───────── 5) السكربت الرئيسي ─────────
let main = mainRaw;
main = replaceExactly(main, 'const q = (s, r) => (r || document).querySelector(s);', 'const q = (s, r) => (r || SR).querySelector(s);', 1, 'main.q');
main = replaceExactly(main, 'const qa = (s, r) => Array.from((r || document).querySelectorAll(s));', 'const qa = (s, r) => Array.from((r || SR).querySelectorAll(s));', 1, 'main.qa');
main = replaceExactly(main, 'document.activeElement', 'SR.activeElement', 13, 'main.activeElement');
main = replaceExactly(main, 'const h = inPres() ? pres : document.body;', 'const h = inPres() ? pres : SH;', 1, 'main.host()');
main = replaceExactly(main, 'document.addEventListener("keydown", e => {\n    // Esc', 'SR.addEventListener("keydown", e => {\n    // Esc', 1, 'main.esc');
main = replaceExactly(main, 'var h = document.getElementById("home");', 'var h = SR.getElementById("home");', 1, 'main.home');
main = replaceExactly(
  main,
  'if (!store.profile) setTimeout(() => { if (!store.profile && !dlg.open && !Dlg.isOpen()) open(true); }, 450);',
  '/* في صفحة الدرس لا نقاطع العرض بنموذج التسجيل: يُفتح من «بياناتي» عند الحاجة */',
  1,
  'main.firstRun',
);
main = replaceExactly(
  main,
  '{ const hp = q("#heroPanel"); if (hp) hp.addEventListener("click", () => Panel.open({ expand: true })); }',
  `{ const hp = q("#heroPanel"); if (hp) hp.addEventListener("click", () => Panel.open({ expand: true })); }
/* صفحة درس: حصة التسجيل تتبع الدرس المعروض (تُثبَّت الحصة عمدًا في الموقع الأصلي كي لا تُسجَّل ضغطة على غير ما يراه المعلم،
   أما هنا فالدرس المعروض هو ما يشرحه). نغيّر الدرس وحده: لا الشعبة ولا التاريخ، ولشعبة من مقرر هذا الدرس فقط */
if (KP_LESSON && Object.prototype.hasOwnProperty.call(DB, KP_LESSON)) {
  const kc = C.ui().cur, kg = kc && C.group(kc.gid);
  if (kg && kg.course === courseOf(KP_LESSON) && kc.lesson !== KP_LESSON) setCur({ lesson: KP_LESSON });
}`,
  1,
  'main.followLesson',
);
// لا يبقى أي لمس مباشر للصفحة المضيفة عدا ما اخترناه (تنزيل الملفات ونسخ النص)
const stray = [...main.matchAll(/document\.(querySelector(All)?|getElementById|getElementsBy\w+|forms|title|head|documentElement)\b/g)];
if (stray.length) throw new Error('لمس مباشر للصفحة بقي: ' + stray.map((m) => m[0]).join(', '));

// ───────── 6) ذيل الزخارف: الشعار فقط (تُخفى الترويسة هنا) ─────────
const decor = 'SR.getElementById("orgLogo").src = LOGO_GOLD; SR.getElementById("regLogo").src = LOGO_RED;';
if (!/orgLogo/.test(decorRaw)) throw new Error('ذيل الزخارف تغيّر');

// ───────── 7) التجميع ─────────
const out = `/* class-panel.js — لوحة الصف العائمة (المشاركة والسلوك والجدول) لصفحات الدروس التفاعلية.
   مولَّد من موقع «الإدارة الصفية» بالمحرّك نفسه (بلا نسخة ثانية من المنطق)، ومعزول داخل Shadow DOM
   فلا تتأثر الدروس بأنماطه ولا يتأثر بأنماطها. يُحمَّل من كل درس بوسم:
   <script defer src="class-panel.js" data-lesson="3_4"></script>  ← مفتاح الدرس في فهرس المقررات.
   البيانات تُحفظ على هذا الجهاز في localStorage لموقع الدروس (مفتاحاها: chem10-smart-planner:class:v1 و:class-ui:v1). */
${jszip}
;(function(){
if (window.__kpClassPanel) return;
window.__kpClassPanel = true;
var KP_SCRIPT = document.currentScript;
var KP_LESSON = (KP_SCRIPT && KP_SCRIPT.getAttribute("data-lesson")) || "";
var KP_CSS = ${JSON.stringify(css)};
var KP_SHELL = ${JSON.stringify(shell)};

function kpStart(){
  if (!document.getElementById("kp-font")) {
    var l = document.createElement("link"); l.id = "kp-font"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;800;900&display=swap";
    document.head.appendChild(l);
  }
  var HOST = document.createElement("div");
  HOST.id = "class-panel-host";
  document.body.appendChild(HOST);
  var SR = HOST.attachShadow({ mode: "open" });
  SR.innerHTML = "<style>" + KP_CSS + "</style>" + KP_SHELL;
  var SH = SR.getElementById("kpLayer");

  /* لوحة المفاتيح: الدرس يقلّب الشرائح بالأسهم والمسافة وغيرها على document، والأحداث التي تخرج من الظل تُعاد توجيهها إلى المضيف.
     - الكتابة (حقل/قائمة) والنوافذ المفتوحة: لا شيء يصل الدرس أبدًا (لا تتقلّب الشرائح وأنت تكتب اسمًا).
     - بعد نقرة بالمؤشر على زر في اللوحة: مفاتيح التنقل تصل الدرس، فلا يعلق المعلم بعد تسجيل مشاركة ولا يستطيع المتابعة بالمؤشّر/الأسهم.
     - استعمال لوحة المفاتيح داخل اللوحة نفسها (Tab وأسهم الألسنة…) يبقى لها. */
  var pointerMode = false;
  var NAV_KEYS = { ArrowLeft: 1, ArrowRight: 1, PageUp: 1, PageDown: 1, Home: 1, End: 1, " ": 1 };
  SR.addEventListener("pointerdown", function(){ pointerMode = true; }, true);
  SR.addEventListener("keydown", function(e){
    var t = (e.composedPath && e.composedPath()[0]) || e.target, tag = t && t.tagName;
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable);
    var modal = !!SR.querySelector("dialog[open]");
    if (!typing && !modal && pointerMode && NAV_KEYS[e.key]) {
      if (e.key === " ") e.preventDefault();   // لا يضغط الزرَّ المركَّز: المسافة هنا للتنقل
      return;                                   // يصل الدرس
    }
    if (e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Meta") pointerMode = false;
    e.stopPropagation();
  });
  SR.addEventListener("keyup", function(e){ if (e.key === " " && pointerMode) e.preventDefault(); e.stopPropagation(); });
  SR.addEventListener("keypress", function(e){ e.stopPropagation(); });

${host}

${main}

${decor}
}

if (document.body) kpStart(); else document.addEventListener("DOMContentLoaded", kpStart);
})();
`;
fs.writeFileSync(path.join(OUT, 'class-panel.js'), out);
console.log('class-panel.js', (out.length / 1024).toFixed(0) + ' KB', '| css', (css.length / 1024).toFixed(0) + ' KB', '| dropped selectors:', [...new Set(dropped)].join(' ; ') || '-');

// ───────── 8) إضافة الوسم إلى الدروس ─────────
const map = { 'lesson31.html': '3_1', 'lesson32.html': '3_2', 'lesson33.html': '3_3', 'lesson34.html': '3_4', 'lesson35.html': '3_5' };
for (const [file, key] of Object.entries(map)) {
  let html = fs.readFileSync(path.join(LESSONS_DIR, file), 'utf8');
  if (html.includes('class-panel.js')) throw new Error(file + ' فيه الوسم أصلًا');
  const tag = `<script defer src="class-panel.js" data-lesson="${key}"></script>`;
  html = replaceExactly(html, '</head><body></body></html>', tag + '</head><body></body></html>', 1, file);
  fs.writeFileSync(path.join(OUT, file), html);
}
console.log('patched', Object.keys(map).join(', '));
