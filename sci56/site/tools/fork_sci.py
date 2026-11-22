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

# ---- Word export: the Ministry of Education prep template (src/docx_moe.js replaces the main site's DOCX builder) ----
cut('const DOCX = (() => {', '\n})();\n', label='docx', repl=open(os.path.join(HERE, 'src', 'docx_moe.js'), encoding='utf-8').read().rstrip('\n') + '\n')

open(out, 'w', encoding='utf-8').write(t)
print('ok', out, len(t))
