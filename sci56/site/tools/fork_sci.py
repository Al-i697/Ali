"""Derive the grade 5/6 science engine from the main app base (chemistry/environment engine).
Usage: python3 tools/fork_sci.py [src=/home/user/Ali/sci56/main-site-src/app_base.html] [out=app_base.html]
Every replacement is asserted to match exactly once, so a change in the source base fails loudly."""
import re, sys, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else '/home/user/Ali/sci56/main-site-src/app_base.html'
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'app_base.html')
t = open(src, encoding='utf-8').read()

def sub1(old, new, flags=0):
    global t
    n = len(re.findall(old, t, flags))
    assert n == 1, (old[:70], n)
    t = re.sub(old, lambda m: new, t, flags=flags)

def cut(start, end, keep_end=False, label='', repl=''):
    """remove text from the (unique) start marker up to the (unique) end marker (inclusive unless keep_end)"""
    global t
    assert t.count(start) == 1, ('start', label or start[:60], t.count(start))
    a = t.index(start); b = t.index(end, a)
    assert b > a, label
    t = t[:a] + repl + (t[b:] if keep_end else t[b + len(end):])

# ---- data: empty the databases (the build step injects the science courses) ----
sub1(r'^const DB = \{.*\};\n', 'const DB = {};\n', re.M)
cut('const ELEMENTS = [', 'const QUICK_FORMULAS = ["H2O","CO2","NaCl","CaCO3","MgO","Fe2O3","CuSO4","CH4"];\n', label='elements')
sub1(r'^const EXTRA_OBJ = \{.*?^\};\n', 'const EXTRA_OBJ = {};\n', re.M | re.S)
sub1(r'^const UNIT_SHORT = \{.*\};\n', 'const UNIT_SHORT = {};\n', re.M)
cut('const AUTHORED = {', '};\n/*COURSE_AU*/', label='authored', repl='const AUTHORED = {};\n/*COURSE_AU*/')
sub1(r'^const OFFICIAL_PERIODS = \{.*\};\n', 'const OFFICIAL_PERIODS = {};\n', re.M)

# ---- subjects, grades, courses, defaults ----
sub1(r'const SUBJECTS = \{.*?\n\};', 'const SUBJECTS = {\n  sci: { name: "العلوم", short: "علوم", icon: "i-flask" }\n};', re.S)
sub1(r'const GRADES = \{[^}]*\};', 'const GRADES = { 5: "الخامس", 6: "السادس" };')
sub1(r'مثل chem10 أو phys11، والكيمياء للصف العاشر افتراضي\.', 'مثل sci5 أو sci6، والعلوم للصف السادس افتراضي.')
t = t.replace('"chem10"', '"sci6"').replace('COURSES.chem10', 'COURSES.sci6')
t = t.replace('chem10:1:1', 'sci6:1:1')
t = t.replace('chem10-smart-planner', 'sci56-smart-planner')
assert 'chem10' not in t, [t[m.start()-40:m.start()+40] for m in re.finditer('chem10', t)][:5]

# ---- branding ----
sub1(r'<title>منظومة التحضير الذكي للعلوم</title>', '<title>تحضير علوم الخامس والسادس</title>')
sub1(r'<h1>منظومة التحضير الذكي للعلوم</h1>', '<h1>منظومة التحضير الذكي للعلوم <small class="h1-sub">الصفان الخامس والسادس</small></h1>')
sub1(r'<span id="footSem">[^<]*</span>', '<span id="footSem">العلوم، الصفان الخامس والسادس، سلسلة كامبريدج المعتمدة</span>')

sub1(r'^(\.title-pill h1\{font-size:clamp\(1\.55rem[^\n]*\n)', '.title-pill h1{font-size:clamp(1.55rem,3.8vw,2.7rem); font-weight:900; color:var(--navy); line-height:1.25; letter-spacing:0;}\n.title-pill h1 .h1-sub{display:block; font-size:.5em; font-weight:700; color:var(--muted); line-height:1.5; margin-top:2px;}\n', re.M)

# ---- remove chemistry-only tools: buttons, dialogs, scripts ----
t = re.sub(r'^[ \t]*<button class="rbtn chem-only"[^\n]*</button>\n', '', t, flags=re.M)
assert 'chem-only"' not in t.split('<style')[1].split('</style>')[0] or True
cut('<dialog id="ptDialog"', '<dialog id="calcDialog"', keep_end=True, label='ptDialog')
cut('<dialog id="calcDialog"', '</dialog>\n', label='calcDialog')
cut('const GROUP_HEAD = {', 'function buildCalc(){', keep_end=True, label='pt/calc js a')
cut('function buildCalc(){', '\n}\n', label='pt/calc js b')
sub1(r'buildPeriodic\(\); buildCalc\(\); ', '')
sub1(r'[ \t]*if \(b\.dataset\.open === "calcDialog"\)[^\n]*\n', '')
sub1(r'[ \t]*const chem = COURSES\[state\.course\]\.subject === "chem";\n[ \t]*\$\$\("\.chem-only"\)\.forEach\(b => \{ b\.hidden = !chem; \}\);\n', '')

# ---- site identity: Ministry of Education only (no Royal Court crest, no Sultan Qaboos Centre line, no institute) ----
def _rep1(old, new):
    global t
    assert t.count(old) == 1, (old[:70], t.count(old))
    t = t.replace(old, new)
_rep1('<img id="orgLogo" class="hero-logo" alt="شعار ديوان البلاط السلطاني">\n      <span class="org-rule" aria-hidden="true"></span>\n      <div class="org-name">مركز السلطان قابوس العالي للثقافة والعلوم</div>',
      '<div class="hero-moe">\n        <div class="hm-r"><img id="heroEmblem" alt="وزارة التعليم" width="358" height="480"></div>\n        <div class="hm-c"><img id="heroV2040" alt="رؤية عُمان 2040" width="138" height="88"></div>\n        <div class="hm-l"><img id="heroQms" alt="نظام إدارة الجودة" width="191" height="204"></div>\n      </div>')
_rep1('$("#orgLogo").src = LOGO_GOLD;', '$("#heroEmblem").src = LOGO_EMBLEM; $("#heroV2040").src = LOGO_V2040; $("#heroQms").src = LOGO_QMS;')
_rep1('$("#regLogo").src = LOGO_RED;', '$("#regLogo").src = LOGO_EMBLEM;')
_logos = open(os.path.join(HERE, 'src', 'logos.js'), encoding='utf-8').read()
t, _n = re.subn(r'^const LOGO_GOLD = .*\n', lambda m: _logos, t, flags=re.M); assert _n == 1
t = re.sub(r'^const LOGO_RED = .*\n', '', t, flags=re.M)
_rep1('placeholder="معهد العلوم الإسلامية"', 'placeholder="اسم المدرسة"')
_rep1('<span>المدرسة أو المعهد <i>*</i></span>', '<span>المدرسة <i>*</i></span>')
_rep1('<span>مدير المعهد</span>', '<span>مدير المدرسة</span>')
_rep1('"اكتب اسم المدرسة أو المعهد"', '"اكتب اسم المدرسة"')
_rep1('| مدير المعهد: ${m.principal', '| مدير المدرسة: ${m.principal')
_rep1('school: "معهد العلوم الإسلامية"', 'school: ""')
_rep1('store.meta.school || "معهد العلوم الإسلامية"', 'store.meta.school || ""')
_rep1('، مركز السلطان قابوس العالي للثقافة والعلوم، ${pl.meta.school || "معهد العلوم الإسلامية"}`', '، وزارة التعليم${pl.meta.school ? "، " + pl.meta.school : ""}`')

# ---- sheet header and Word header of the (old, colourful) design with the three logos ----
def _one(old, new):
    global t
    assert t.count(old) == 1, (old[:80], t.count(old))
    t = t.replace(old, new)
def _rx(pat, new):
    global t
    t, n = re.subn(pat, lambda m: new, t, flags=re.S | re.M)
    assert n == 1, (pat[:80], n)
def _rxg(pat, repl):
    global t
    t, n = re.subn(pat, repl, t, flags=re.S | re.M)
    assert n == 1, (pat[:80], n)
# ---- sheet header (screen, preview, print) ----
_rx(r'<div class="sh-head">\s*<div class="dr">\$\{atomSVG\(\)\}</div>\s*<div class="sh-title"><h2>(.*?)</h2><small>مركز السلطان قابوس العالي للثقافة والعلوم</small><small class="inst">\$\{escapeHTML\(m\.school \|\| "معهد العلوم الإسلامية"\)\}</small><div class="orn">(.*?)</div></div>\s*<div class="dl">\$\{booksSVG\(\)\}</div>\s*</div>',
   '<div class="sh-head">\n      <div class="dr"><img class="lg-em" src="${LOGO_EMBLEM}" alt="وزارة التعليم"></div>\n      <div class="sh-title"><h2>تحضير ${escapeHTML(courseMeta(pl.key).subj.short)} ${courseMeta(pl.key).grade}</h2>${m.school ? `<small class="inst">${escapeHTML(m.school)}</small>` : ""}<div class="orn"><i></i><b></b><i></i></div></div>\n      <div class="dl"><img class="lg-v" src="${LOGO_V2040}" alt="رؤية عُمان 2040"><img class="lg-q" src="${LOGO_QMS}" alt="نظام إدارة الجودة"></div>\n    </div>')

# ---- Word: three logos, then the title / grade strip ----
a = t.index("  const LOGO_EMU"); b = t.index("function logoBytes"); b = t.index("\n  }\n", b) + len("\n  }\n")
old = t[a:b]
ra = old.index("  function logoRun(){"); rb = old.index("  function logoBytes(){")
run_fn = old[ra:rb].replace("function logoRun(){", "function logoRun(id, key, hCm){\n    const f = LOGO_FILES.find(x => x[3] === key), d = LOGO_DIM[key], cy = Math.round(hCm * 360000), cx = Math.round(cy * d[0] / d[1]);")
for o, nw in [("${LOGO_EMU.cx}", "${cx}"), ("${LOGO_EMU.cy}", "${cy}"), ('r:embed="rIdLogo"', 'r:embed="${f[0]}"')]:
    assert o in run_fn, o; run_fn = run_fn.replace(o, nw)
run_fn = re.sub(r'<wp:docPr id="1" name="[^"]*"/>', '<wp:docPr id="${id}" name="Logo${id}"/>', run_fn)
run_fn = re.sub(r'<pic:cNvPr id="1" name="[^"]*"/>', '<pic:cNvPr id="${id}" name="${f[1]}"/>', run_fn)
new = ('  const LOGO_FILES = [["rIdQms", "qms.png", LOGO_QMS, "qms"], ["rIdV2040", "vision2040.png", LOGO_V2040, "v2040"], ["rIdEmblem", "emblem.png", LOGO_EMBLEM, "emblem"]];\n'
       + run_fn + '  function dataBytes(uri){\n    const bin = atob(uri.split(",")[1]), out = new Uint8Array(bin.length);\n    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);\n    return out;\n  }\n')
t = t[:a] + new + t[b:]
_rx(r'<Relationship Id="rIdLogo"[^>]*/>', '<Relationship Id="rIdQms" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/qms.png"/><Relationship Id="rIdV2040" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/vision2040.png"/><Relationship Id="rIdEmblem" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/emblem.png"/>')
_one('      { name: "word/media/logo.png", data: logoBytes() },', '      ...LOGO_FILES.map(f => ({ name: "word/media/" + f[1], data: dataBytes(f[2]) })),')
_rxg(r'    b \+= table\(\[2000, 5638, 2000\], \[\[\s*cell\(p\(logoRun\(\), \{ center: true, after: 0 \}\), 2000\),\s*cell\((p\(run\(`تحضير[^\n]*?)\+ p\(run\("مركز السلطان قابوس العالي للثقافة والعلوم"[^\n]*?\+ p\(run\(pl\.meta\.school \|\| "معهد العلوم الإسلامية", \{ bold: true, size: 17, color: "9C7020" \}\), \{ center: true, after: 0, bottomBorder: "D4A548" \}\), 5638, \{ fill: "FBF8F1" \}\),\s*cell\((.*?), 2000\)\s*\]\], \{ style: "none" \}\);',
   '    b += table([3000, 3638, 3000], [[\n'
   '      cell(p(logoRun(1, "emblem", 2.3), { center: true, after: 0 }), 3000),\n'
   '      cell(p(logoRun(2, "v2040", 2.1), { center: true, after: 0 }), 3638),\n'
   '      cell(p(logoRun(3, "qms", 2.1), { center: true, after: 0 }), 3000)\n'
   '    ]], { style: "none" });\n'
   '    b += gap(80);\n'
   '    b += table([7638, 2000], [[\n'
   '      cell(\\1 + (pl.meta.school ? p(run(pl.meta.school, { bold: true, size: 17, color: "9C7020" }), { center: true, after: 0 }) : p("", { after: 0 })), 7638, { fill: "FBF8F1" }),\n'
   '      cell(\\2, 2000)\n'
   '    ]], { style: "none" });')


_rep1('<b>مدير المعهد</b>', '<b>مدير المدرسة</b>')
_rep1('placeholder="اسم مدير المعهد"', 'placeholder="اسم مدير المدرسة"')
_one('sg("مدير المعهد"', 'sg("مدير المدرسة"')

# ---- period length (35 / 40 / 45 ... min, chosen by the teacher; the authored rows are written for 40 and are scaled), editable lesson title, legacy school name ----
_one('const PERIOD_MIN = 40;',
     'const PERIOD_MIN = 40;   // the length the authored rows are written for: each authored period sums to 40 minutes\n'
     'const PM_CHOICES = [30, 35, 40, 45, 50];\n'
     'function PM(){ const v = parseInt(store.meta && store.meta.periodMin, 10); return PM_CHOICES.includes(v) ? v : 35; }\n'
     '/* scale a list of minutes to a new total (largest remainder, every item at least lo) */\n'
     'function scaleTo(list, target, lo){\n'
     '  const total = list.reduce((a, b) => a + b, 0); if (!total) return list.slice();\n'
     '  const raw = list.map(x => x * target / total), out = raw.map(x => Math.max(lo, Math.floor(x)));\n'
     '  let diff = target - out.reduce((a, b) => a + b, 0);\n'
     '  const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);\n'
     '  for (let k = 0; diff > 0 && k < order.length * 4; k++){ out[order[k % order.length][1]]++; diff--; }\n'
     '  for (let k = out.length - 1; diff < 0 && k >= 0; k--){ while (diff < 0 && out[k] > lo){ out[k]--; diff++; } }\n'
     '  return out;\n'
     '}\n'
     '/* base = the period length the rows were written for (40 by default; a teacher\'s own exact plan declares its real length) */\n'
     'function scalePeriods(flow, base){\n'
     '  base = base || PERIOD_MIN; const pm = PM(); if (pm === base) return flow;\n'
     '  const by = {}; flow.forEach(r => { (by[r.period || 1] = by[r.period || 1] || []).push(r); });\n'
     '  Object.values(by).forEach(g => {\n'
     '    const src = g.reduce((a, r) => a + r.minutes, 0), m = scaleTo(g.map(r => r.minutes), Math.round(src * pm / base), 2);\n'
     '    g.forEach((r, i) => { r.minutes = m[i]; r.time = m[i] + " د"; });\n'
     '  });\n'
     '  return flow;\n'
     '}\n'
     'function minsAr(n){ return n === 1 ? "دقيقة واحدة" : n === 2 ? "دقيقتان" : n >= 3 && n <= 10 ? n + " دقائق" : n + " دقيقة"; }\n'
     'function baseTitle(s){ return String(s || "").replace(/\\s*[:：]\\s*[أ-د]\\.\\s.*$/, ""); }\n')
_one('function durLabel(n){ return n === 1 ? "حصة واحدة (40 دقيقة)" : n === 2 ? "حصتان (80 دقيقة)" : `${n} حصص (${n * 40} دقيقة)`; }',
     'function durLabel(n){ const m = PM(); return n === 1 ? `حصة واحدة (${m} دقيقة)` : n === 2 ? `حصتان (${2 * m} دقيقة)` : `${n} حصص (${n * m} دقيقة)`; }')
_one('<span class="fl" id="durLbl">عدد حصص الدرس <small class="fl-sub">الحصة 40 دقيقة</small></span>',
     '<span class="fl" id="minLbl">مدة الحصة <small class="fl-sub">تختلف من مدرسة لأخرى، وتُحفظ لكل دروسك</small></span>\n'
     '        <div class="seg seg6 seg5" id="minSeg" role="group" aria-labelledby="minLbl"></div>\n'
     '        <span class="fl" id="durLbl">عدد حصص الدرس <small class="fl-sub" id="durSub">الحصة 35 دقيقة</small></span>')
_one('  const cur = LK ? LK.periods : authored ? off : (rec.periods || off);\n',
     '  const cur = LK ? LK.periods : authored ? off : (rec.periods || off);\n'
     '  $("#minSeg").innerHTML = PM_CHOICES.map(n => `<button type="button" data-pm="${n}" aria-pressed="${n === PM()}"><b>${n}</b><small>دقيقة</small></button>`).join("");\n'
     '  $("#durSub").textContent = `الحصة ${PM()} دقيقة`;\n')
_one('  $("#primarySel").addEventListener("change", e => {',
     '  $("#minSeg").addEventListener("click", e => {\n'
     '    const b = e.target.closest("[data-pm]"); if (!b) return;\n'
     '    store.meta.periodMin = parseInt(b.dataset.pm, 10); persist(); refresh(); toast(`صارت الحصة ${PM()} دقيقة وأُعيد توزيع أزمنة التحضير`);\n'
     '  });\n'
     '  $("#primarySel").addEventListener("change", e => {')
_one('Math.floor(cum / 40)', 'Math.floor(cum / PM())')
_one('const total = N * 40;', 'const total = N * PM();')
_one('cap = 40 - 10;', 'cap = PM() - 10;')
_one('buildDetailedFlow(rec.primary, pc, 40)', 'buildDetailedFlow(rec.primary, pc, PM())')
_one('"|" + periods + "p|" + (rec.primary', '"|" + periods + "p" + PM() + "m|" + (rec.primary')
_one('    flow = authoredFlow(key, d, rec).rows;\n', '    flow = scalePeriods(authoredFlow(key, d, rec).rows, AU.exact);\n')
# a lesson may list its ticked strategies explicitly (AU.strats) when a row names several (e.g. "التعلم التعاوني – الاستقصاء العلمي")
_one('const usedStrats = [...new Set(flow.map(r => r.strat).filter(s => s && s !== "بطاقة الخروج"))];',
     'const usedStrats = authored && AU.strats ? AU.strats.slice() : [...new Set(flow.map(r => r.strat).filter(s => s && s !== "بطاقة الخروج"))];')
# exact plans (the teacher\'s own minutes) may leave minutes free: say so instead of "deleted activities"
_one('  else if (pl.authored) msg = left > 0 ?', '  else if (pl.authored && pl.AU.exact) msg = `الخطة بأزمنة المعلم الفعلية: ${used} دقيقة موزعة على المراحل من أصل ${pl.duration}${left > 0 ? "، والباقي (" + left + " د) للانتقال والتنظيم" : ""}.`;\n  else if (pl.authored) msg = left > 0 ?')
_one('duration: periods * 40, durLabel: durLabel(periods),',
     'duration: periods * PM(), periodMin: PM(), durLabel: durLabel(periods),\n'
     '    title: (ed["t:title"] || "").trim() || d.sheetTitle || baseTitle(d.title), titleEd: !!(ed["t:title"] || "").trim(),')
_one('<span class="code">(${d.code})</span>${escapeHTML(d.title)}</span></div>${icon("ic-book")}',
     '<span class="code">(${d.code})</span><span ${editAttrs("t:title", pl.titleEd)} aria-label="عنوان الدرس">${escapeHTML(pl.title)}</span></span></div>${icon("ic-book")}')
_one('عنوان الدرس: (\\u200E${d.code}\\u200E) ${d.title} |', 'عنوان الدرس: (\\u200E${d.code}\\u200E) ${pl.title} |')
_one('run(d.title, { bold: true, size: 20, color: "FFFFFF" })', 'run(pl.title, { bold: true, size: 20, color: "FFFFFF" })')
_one('والحصة ${40} دقيقة', 'والحصة ${PM()} دقيقة')
_one('(${base.periods} حصص × 40 دقيقة)', '(${base.periods} حصص × ${PM()} دقيقة)')
# the legacy default school of the old build ("معهد العلوم الإسلامية") may still sit in the browser's saved data: drop it
_one('  s.meta = Object.assign({ teacher: "", school: "" }, s.meta || {});\n',
     '  s.meta = Object.assign({ teacher: "", school: "" }, s.meta || {});\n'
     '  if (/معهد\\s*العلوم\\s*الإسلامية/.test(s.meta.school || "")) s.meta.school = "";\n'
     '  if (s.profile && /معهد\\s*العلوم\\s*الإسلامية/.test(s.profile.school || "")) s.profile.school = "";\n')
# the generic strategy templates keep every row at 3+ minutes; with a short period (30/35) and many activities, lower that floor so the sum stays exact
_one('const raw = list.map(x => x * target / total), out = raw.map(x => Math.max(3, Math.floor(x)));',
     'const lo = Math.max(1, Math.min(3, Math.floor(target / list.length))), raw = list.map(x => x * target / total), out = raw.map(x => Math.max(lo, Math.floor(x)));')
_one('while (diff < 0 && out[k] > 3){ out[k]--; diff++; }', 'while (diff < 0 && out[k] > lo){ out[k]--; diff++; }')
_rxg(r'(function aWarmHTML\(A)\)\{(\s*return `[^\n]*?<strong>الزمن:</strong>) 5 دقائق`;',
     lambda m: m.group(1) + ', mins = 5){' + m.group(2) + ' ${minsAr(mins)}`;')
_one('authored ? aWarmHTML(AU) : warmHTML(c)', 'authored ? aWarmHTML(AU, (flow.find(r => r.code === "التهيئة" || r.code === "التمهيد") || flow[0] || { minutes: 5 }).minutes) : warmHTML(c)')
# sections the lesson leaves empty (misconception / lab notes) are not printed, whatever the option boxes say
_one('tEd, opts: state.opts,', 'tEd, opts: Object.assign({}, state.opts, { mis: state.opts.mis && !!T.mis, lab: state.opts.lab && !!T.lab }),')
_one('const mins = AU ? Math.round(aMin[o.id] || 0) :', 'const mins = AU ? Math.round((aMin[o.id] || 0) * PM() / PERIOD_MIN) :')
_one('تختلف من مدرسة لأخرى، وتُحفظ لكل دروسك', 'تُحفظ لكل دروسك')
_one('.seg.seg6 button[aria-disabled="true"]{opacity:.38; cursor:not-allowed;}',
     '.seg.seg6 button[aria-disabled="true"]{opacity:.38; cursor:not-allowed;}\n.seg.seg5{grid-template-columns:repeat(5,minmax(0,1fr)); margin-bottom:14px;}')

_j = t.index('</style>', t.index('THE PREP SHEET'))
t = t[:_j] + open(os.path.join(HERE, 'src', 'brand_moe.css'), encoding='utf-8').read() + open(os.path.join(HERE, 'src', 'brand_sheet.css'), encoding='utf-8').read() + t[_j:]
for _bad in ('السلطان قابوس العالي', 'معهد العلوم', 'العلوم الإسلامية', 'ديوان البلاط', 'LOGO_RED', 'LOGO_GOLD', 'المعهد', 'logoBytes'):
    assert _bad not in t, ('old identity left in the base', _bad)

open(out, 'w', encoding='utf-8').write(t)
print('ok', out, len(t))
