#!/usr/bin/env python3
"""One-time identity change of the MAIN planner site (../main-site-src/app_base.html), requested by the user:
the site belongs to the Ministry of Education only (no Royal Court crest, no Sultan Qaboos Centre line, no institute name), with the
Ministry of Education, Oman Vision 2040 and QMS logos. Same logos/CSS as the science site (src/logos.js, src/brand_moe.css).
Idempotent: does nothing when the base already has the new header. Every replacement is asserted to match exactly once.
Usage: python3 tools/brand_main.py [path/to/app_base.html]"""
import os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), "main-site-src", "app_base.html")
t = open(path, encoding="utf-8").read()
PLATES = """
/* sheet header plates: the transparent logos need a white backing over the decorative waves */
.paper.sheet .sh-head .dr, .paper.sheet .sh-head .dl{background:#fff; border-radius:14px; padding:4px 10px; box-shadow:0 4px 12px -6px rgba(11,29,58,.35); align-self:center;}
.paper.pv .sh-head .dr, .paper.pv .sh-head .dl{padding:2px 6px; border-radius:8px;}
@media print{ .paper.sheet .sh-head .dr, .paper.sheet .sh-head .dl{padding:2px 6px; border-radius:8px;} }
"""
if 'class="hero-moe"' in t:
    if "sheet header plates" not in t:
        j = t.index("</style>", t.index("THE PREP SHEET")); t = t[:j] + PLATES + t[j:]
        open(path, "w", encoding="utf-8").write(t); print("added the sheet header plates:", path)
    else:
        print("already branded:", path)
    sys.exit(0)

def one(old, new):
    global t
    assert t.count(old) == 1, (old[:80], t.count(old))
    t = t.replace(old, new)
def rx(pat, new):
    global t
    t, n = re.subn(pat, lambda m: new, t, flags=re.S | re.M)
    assert n == 1, (pat[:80], n)

def rxg(pat, repl):
    global t
    t, n = re.subn(pat, repl, t, flags=re.S | re.M)
    assert n == 1, (pat[:80], n)

logos = open(os.path.join(HERE, "src", "logos.js"), encoding="utf-8").read()
css = open(os.path.join(HERE, "src", "brand_moe.css"), encoding="utf-8").read()
css += """
/* ---- sheet header of the main site: Ministry logo | title | Vision 2040 + QMS ---- */
.paper.sheet .sh-head{grid-template-columns:150px minmax(0,1fr) 240px;}
.paper.sheet .sh-head .dr{width:auto; justify-self:start; line-height:0;}
.paper.sheet .sh-head .dl{width:auto; justify-self:end; line-height:0; display:flex; align-items:center; gap:12px;}
.paper.sheet .sh-head img{display:block; width:auto; filter:none;}
.paper.sheet .sh-head .dr img{height:100px;} .paper.sheet .sh-head .dl .lg-v{height:66px;} .paper.sheet .sh-head .dl .lg-q{height:88px;}
.paper.pv .sh-head{grid-template-columns:62px minmax(0,1fr) 124px;}
.paper.pv .sh-head .dr{width:auto;} .paper.pv .sh-head .dl{width:auto; gap:6px;}
.paper.pv .sh-head .dr img{height:50px;} .paper.pv .sh-head .dl .lg-v{height:34px;} .paper.pv .sh-head .dl .lg-q{height:44px;}
@media print{
  .paper.sheet .sh-head{grid-template-columns:62px minmax(0,1fr) 124px;}
  .paper.sheet .sh-head .dl{gap:6px;}
  .paper.sheet .sh-head .dr img{height:50px;} .paper.sheet .sh-head .dl .lg-v{height:34px;} .paper.sheet .sh-head .dl .lg-q{height:44px;}
}
@media screen and (max-width:720px){
  .paper:not(.pv) .sh-head{grid-template-columns:70px minmax(0,1fr) 120px;}
  .paper:not(.pv) .sh-head .dr img{height:52px;} .paper:not(.pv) .sh-head .dl .lg-v{height:34px;} .paper:not(.pv) .sh-head .dl .lg-q{height:44px;}
}
"""

# ---- logos: the old gold/red Royal Court pictures go, the three logos come (marked so the science fork can drop them) ----
rx(r'^const LOGO_GOLD = [^\n]*\n', "/*LOGOS*/\n" + logos + "/*END LOGOS*/\n")
rx(r'^const LOGO_RED = [^\n]*\n', "")

# ---- site home header ----
one('<img id="orgLogo" class="hero-logo" alt="شعار ديوان البلاط السلطاني">\n      <span class="org-rule" aria-hidden="true"></span>\n      <div class="org-name">مركز السلطان قابوس العالي للثقافة والعلوم</div>',
    '<div class="hero-moe">\n        <div class="hm-r"><img id="heroEmblem" alt="وزارة التعليم" width="254" height="340"></div>\n        <div class="hm-c"><img id="heroV2040" alt="رؤية عُمان 2040" width="460" height="258"></div>\n        <div class="hm-l"><img id="heroQms" alt="نظام إدارة الجودة" width="291" height="320"></div>\n      </div>')
one('$("#orgLogo").src = LOGO_GOLD;', '$("#heroEmblem").src = LOGO_EMBLEM; $("#heroV2040").src = LOGO_V2040; $("#heroQms").src = LOGO_QMS;')
one('$("#regLogo").src = LOGO_RED;', '$("#regLogo").src = LOGO_EMBLEM;')

# ---- no default institute ----
one('placeholder="معهد العلوم الإسلامية"', 'placeholder="اسم المدرسة"')
one('school: "معهد العلوم الإسلامية"', 'school: ""')
one('store.meta.school || "معهد العلوم الإسلامية"', 'store.meta.school || ""')
one('، مركز السلطان قابوس العالي للثقافة والعلوم، ${pl.meta.school || "معهد العلوم الإسلامية"}`', '، وزارة التعليم${pl.meta.school ? "، " + pl.meta.school : ""}`')

# ---- sheet header (screen, preview, print) ----
rx(r'<div class="sh-head">\s*<div class="dr">\$\{atomSVG\(\)\}</div>\s*<div class="sh-title"><h2>(.*?)</h2><small>مركز السلطان قابوس العالي للثقافة والعلوم</small><small class="inst">\$\{escapeHTML\(m\.school \|\| "معهد العلوم الإسلامية"\)\}</small><div class="orn">(.*?)</div></div>\s*<div class="dl">\$\{booksSVG\(\)\}</div>\s*</div>',
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
rx(r'<Relationship Id="rIdLogo"[^>]*/>', '<Relationship Id="rIdQms" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/qms.png"/><Relationship Id="rIdV2040" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/vision2040.png"/><Relationship Id="rIdEmblem" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/emblem.png"/>')
one('      { name: "word/media/logo.png", data: logoBytes() },', '      ...LOGO_FILES.map(f => ({ name: "word/media/" + f[1], data: dataBytes(f[2]) })),')
rxg(r'    b \+= table\(\[2000, 5638, 2000\], \[\[\s*cell\(p\(logoRun\(\), \{ center: true, after: 0 \}\), 2000\),\s*cell\((p\(run\(`تحضير[^\n]*?)\+ p\(run\("مركز السلطان قابوس العالي للثقافة والعلوم"[^\n]*?\+ p\(run\(pl\.meta\.school \|\| "معهد العلوم الإسلامية", \{ bold: true, size: 17, color: "9C7020" \}\), \{ center: true, after: 0, bottomBorder: "D4A548" \}\), 5638, \{ fill: "FBF8F1" \}\),\s*cell\((.*?), 2000\)\s*\]\], \{ style: "none" \}\);',
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

# ---- css ----
j = t.index("</style>", t.index("THE PREP SHEET"))
t = t[:j] + css + PLATES + t[j:]
for bad in ("السلطان قابوس العالي", "معهد العلوم", "ديوان البلاط", "LOGO_RED", "LOGO_GOLD", "logoBytes", "atomSVG()}</div>\n      <div class=\"sh-title\""):
    assert bad not in t, ("old identity left", bad)
open(path, "w", encoding="utf-8").write(t)
print("branded:", path, len(t))
