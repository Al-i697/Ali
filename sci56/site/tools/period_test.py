"""Period length (30/35/40/45/50), exact-minute plans, editable lesson title and legacy school name.
   python3 tools/period_test.py [app.html]"""
import sys, json, os
from playwright.sync_api import sync_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app.html')
SEED = {"v": 2, "meta": {"teacher": "أ. اختبار", "school": "مدرسة تجريبية"}, "lessons": {}, "profile": {"name": "أ. اختبار", "school": "مدرسة تجريبية", "courses": ["sci6"]}}
LEGACY = {"v": 2, "meta": {"teacher": "معلم", "school": "معهد العلوم الإسلامية"}, "lessons": {}, "profile": {"name": "معلم", "school": "معهد العلوم الإسلامية", "courses": ["sci6"]}}
bad = []
def check(name, ok, info=""):
    print(("PASS " if ok else "FAIL ") + name, "" if ok else info)
    if not ok: bad.append(name)
def load(b, store, hash_="sci6~3-5"):
    pg = b.new_page(viewport={'width': 1400, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + HTML + '#' + hash_); pg.evaluate("s => localStorage.setItem('sci56-smart-planner:v2', s)", json.dumps(store))
    pg.reload(); pg.wait_for_timeout(900)
    return pg, errs
with sync_playwright() as p:
    b = p.chromium.launch()
    pg, errs = load(b, LEGACY)
    st = pg.evaluate("() => ({ s: store.meta.school, p: store.profile.school, inst: !!document.querySelector('.sh-title .inst'), html: document.documentElement.innerHTML.includes('معهد العلوم') })")
    check('legacy "معهد العلوم الإسلامية" is dropped from saved data', st['s'] == '' and st['p'] == '' and not st['inst'] and not st['html'], st)
    pg.close()
    pg, errs = load(b, SEED)
    keys = pg.evaluate("() => Object.keys(DB)")
    for pm in (30, 35, 40, 45, 50):
        res = pg.evaluate("""pm => { store.meta.periodMin = pm; const out = []; const keep = state.key;
          for (const k of Object.keys(DB)){ state.key = k; const pl = computePlan(), AU = AUTHORED[k], base = AU.exact || 40;
            const sums = {}; pl.flow.forEach(r => { sums[r.period] = (sums[r.period] || 0) + r.minutes; });
            const src = {}; AU.periods[0].rows.forEach((r, i) => { let q = 0; AU.pstart.forEach((st, j) => { if (i >= st) q = j + 1; }); src[q] = (src[q] || 0) + r[2]; });
            const badp = Object.entries(sums).filter(([q, v]) => v !== Math.round(src[q] * pm / base)).length, mn = Math.min(...pl.flow.map(r => r.minutes));
            if (badp || mn < 2 || pl.duration !== pl.periods * pm || pl.total > pl.duration) out.push([k, sums, src, mn, pl.total, pl.duration]); }
          state.key = keep; return out; }""", pm)
        check(f'{pm} min: all {len(keys)} lessons scaled from their own base (40, or an exact plan\'s real minutes), rows >= 2 min', not res, res[:3])
    ex = pg.evaluate("() => { store.meta.periodMin = 35; state.key = 'sci6~3_4'; const pl = computePlan(); return { mins: pl.flow.map(r => r.minutes), total: pl.total, dur: pl.duration, exact: pl.AU.exact, title: pl.title } }")
    check('3-4 (exact plan) at 35 min keeps the teacher\'s own minutes 3,4,4,10,5,5', ex['mins'] == [3, 4, 4, 10, 5, 5] and ex['total'] == 31 and ex['dur'] == 35 and ex['exact'] == 35, ex)
    res = pg.evaluate("""() => { const out = []; for (const pm of [30, 35, 40, 45, 50]){ store.meta.periodMin = pm;
        for (const k of Object.keys(DB)){ state.key = k; const pl = computePlan();
          const want = (pl.flow.find(r => r.code === 'التهيئة' || r.code === 'التمهيد') || pl.flow[0]).minutes; const txt = plainText(pl.t.warm);
          const ok = want === 2 ? /دقيقتان/.test(txt) : want >= 3 && want <= 10 ? txt.includes(want + ' دقائق') : txt.includes(want + ' دقيقة');
          if (!ok) out.push([pm, k, want, txt.slice(-30)]); } } return out; }""")
    check('the warm-up block states the minutes of its own row (all lengths, all lessons)', not res, res[:3])
    pg.evaluate("() => { store.meta.periodMin = 35; state.key = 'sci6~3_5'; refresh(); }")
    ui = pg.evaluate("() => ({ btn: [...document.querySelectorAll('#minSeg [data-pm]')].map(b => b.dataset.pm), on: document.querySelector('#minSeg [aria-pressed=true]').dataset.pm, sub: document.querySelector('#durSub').textContent })")
    check('selector shows 30/35/40/45/50 with 35 selected', ui['btn'] == ['30', '35', '40', '45', '50'] and ui['on'] == '35' and '35' in ui['sub'], ui)
    pg.click('#minSeg [data-pm="45"]'); pg.wait_for_timeout(500)
    st = pg.evaluate("() => { const pl = computePlan(); return { pm: PM(), saved: JSON.parse(localStorage.getItem('sci56-smart-planner:v2')).meta.periodMin, dur: pl.duration, meter: document.querySelector('#meterVal').textContent, per: pl.periods } }")
    check('clicking 45 applies and is saved', st['pm'] == 45 and st['saved'] == 45 and st['dur'] == st['per'] * 45 and str(st['dur']) in st['meter'], st)
    pg.reload(); pg.wait_for_timeout(900)
    check('45 survives a reload', pg.evaluate("() => PM()") == 45)
    tl = pg.evaluate("() => ({ t: computePlan().title, d: computePlan().d.title, shown: document.querySelector('[data-edit=\"t:title\"]').innerText })")
    check('sheet title = lesson title without the "أ./ب." part', tl['t'] == 'المحاليل' and tl['shown'] == tl['t'] and 'المحاليل: أ.' in tl['d'], tl)
    pg.click('[data-edit="t:title"]'); pg.keyboard.press('End'); pg.keyboard.type(' 2'); pg.wait_for_timeout(700)
    pg.reload(); pg.wait_for_timeout(900)
    check('edited title is kept after a reload', pg.evaluate("() => document.querySelector('[data-edit=\"t:title\"]').innerText") == 'المحاليل 2')
    pg.evaluate("() => { const r = getRec(state.key); delete r.edits['t:title']; touch(); refresh(); }")
    check('clearing the edit restores the default title', pg.evaluate("() => computePlan().title") == 'المحاليل')
    st34 = pg.evaluate("() => { state.key = 'sci6~3_4'; return computePlan().title }")
    check('3-4 shows the teacher\'s own title (sheet_title)', st34 == 'الترشيح – فصل المواد غير القابلة للذوبان', st34)
    check('no page errors', not errs, errs)
    b.close()
print('FAILED: ' + ', '.join(bad) if bad else 'ALL PASS'); sys.exit(1 if bad else 0)
