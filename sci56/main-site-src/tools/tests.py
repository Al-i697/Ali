"""Regression tests. Usage: python3 tools/tests.py [--pages] [--only=PREFIX] [file.html]
--only filters lesson keys by prefix(es), comma-separated (e.g. --only=chem11~6_,chem11~7_ or --only=5_). --noengine skips the engine loop."""
import sys, subprocess, re
from playwright.sync_api import sync_playwright
html = next((a for a in sys.argv[1:] if a.endswith('.html')), '/home/claude/work/app.html')
only = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--only=')), '')
URL = 'file://' + html
STRATS = ['', 'e5', 'poe', 'tps', 'inquiry', 'coop', 'problem']
SEED = 'localStorage.setItem("chem10-smart-planner:v2", JSON.stringify({v:2, meta:{teacher:"أ. اختبار", school:"معهد العلوم الإسلامية"}, lessons:{}, profile:{name:"أ. اختبار", school:"معهد العلوم الإسلامية", courses:["chem10","chem11"]}}))'
INIT = 'if(!localStorage.getItem("chem10-smart-planner:v2")){' + SEED + '}'

def pdf_pages(path):
    out = subprocess.run(['pdfinfo', path], capture_output=True, text=True).stdout
    return int(re.search(r'Pages:\s+(\d+)', out).group(1))

with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1400, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script(INIT)
    pg.goto(URL); pg.wait_for_timeout(700)
    keys = [k for k in pg.evaluate('KEYS') if any(k.startswith(o) for o in only.split(','))]
    print('lessons:', len(keys), '| courses:', sorted(set(pg.evaluate('KEYS.map(courseOf)'))))
    bad = []
    for k in ([] if '--noengine' in sys.argv else keys):
        for s in STRATS:
            for n in [1, 3, 6]:
                r = pg.evaluate(f"""(()=>{{state.key='{k}'; const rec=getRec('{k}'); rec.primary='{s}'; rec.periods={n};
                  const p=computePlan(); const norm=x=>plainText(x||'').replace(/[؟?.،:«»\\s]+/g,' ').trim();
                  const qs=p.flow.map(r=>norm((r.eval.match(/<strong>السؤال:<\\/strong>\\s*([^<]*)/)||[])[1])).filter(Boolean);
                  return [p.authored, p.total, p.duration, qs.length-new Set(qs).size,
                    p.flow.some(x=>/\bundefined\b|\bnull\b|\bNaN\b/.test(x.teacher+x.student+x.eval+x.time)), p.flow.length]}})()""")
                authored, total, dur, dup, badtxt, rows = r
                if authored and n > 1: continue
                if badtxt or dup or total != dur or not rows: bad.append((k, s, n, r))
    print('engine problems:', len(bad), bad[:5])
    au = pg.evaluate('KEYS.filter(k=>AUTHORED[k])')
    print('written plans:', len([k for k in au if k in keys]), 'of', len(keys))
    if '--pages' in sys.argv:
        mism = []; res = []
        variants = [('', 0), ('problem', 6)] if '--variants' in sys.argv else [('', 0)]
        for k0 in keys:
          for prim, per in variants:
            k = k0
            pg.evaluate(f"(()=>{{delete temp['{k}']; delete store.lessons['{k}']; const r=getRec('{k}'); if('{prim}'){{r.primary='{prim}'; r.periods={per};}}}})()")
            pg.goto(URL + '#' + k.replace('_', '-')); pg.wait_for_timeout(350); pg.evaluate("renderOutput()"); pg.wait_for_timeout(150)
            pg.emulate_media(media='print'); pg.pdf(path='/home/claude/work/tools/_p.pdf', format='A4', print_background=True); pg.emulate_media(media='screen')
            real = pdf_pages('/home/claude/work/tools/_p.pdf')
            pg.evaluate("state.preview=true; renderOutput()"); pg.wait_for_timeout(250)
            est = pg.evaluate("pageBreaks(document.querySelector('.paper.pv')).length+1")
            pg.evaluate("state.preview=false; renderOutput()")
            tag = k + ('/' + prim if prim else '')
            res.append((tag, real, est))
            if real != est: mism.append((tag, real, est))
        print('pages (real, estimate):', res)
        print('page mismatches:', mism)
        print('over 3 pages:', [x for x in res if x[1] > 3])
    m = b.new_page(viewport={'width': 390, 'height': 844}); m.on('pageerror', lambda e: errs.append(str(e)))
    m.add_init_script(INIT); m.goto(URL); m.wait_for_timeout(500)
    print('mobile width:', m.evaluate('document.documentElement.scrollWidth'))
    print('page errors:', errs)
    b.close()
