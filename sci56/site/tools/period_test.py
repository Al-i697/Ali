"""Period length (30/35/40/45/50), editable lesson title and legacy school name.
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
def load(b, store, hash_="sci6~3-4"):
    pg = b.new_page(viewport={'width': 1400, 'height': 1000}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + HTML + '#' + hash_); pg.evaluate("s => localStorage.setItem('sci56-smart-planner:v2', s)", json.dumps(store))
    pg.reload(); pg.wait_for_timeout(900)
    return pg, errs
with sync_playwright() as p:
    b = p.chromium.launch()
    # legacy school
    pg, errs = load(b, LEGACY)
    st = pg.evaluate("() => ({ s: store.meta.school, p: store.profile.school, inst: !!document.querySelector('.sh-title .inst'), html: document.documentElement.innerHTML.includes('معهد العلوم') })")
    check('legacy "معهد العلوم الإسلامية" is dropped from saved data', st['s'] == '' and st['p'] == '' and not st['inst'] and not st['html'], st)
    pg.close()
    # period lengths over every lesson
    pg, errs = load(b, SEED)
    keys = pg.evaluate("() => Object.keys(DB)")
    for pm in (30, 35, 40, 45, 50):
        res = pg.evaluate("""pm => { store.meta.periodMin = pm; const out = []; const keep = state.key;
          for (const k of Object.keys(DB)){ state.key = k; const pl = computePlan(); const sums = {}; pl.flow.forEach(r => { sums[r.period] = (sums[r.period] || 0) + r.minutes; });
            const bad = Object.entries(sums).filter(([p, v]) => v !== pm).length, mn = Math.min(...pl.flow.map(r => r.minutes));
            if (bad || mn < 2 || pl.total !== pl.periods * pm || pl.duration !== pl.periods * pm) out.push([k, sums, mn, pl.total, pl.duration]); }
          state.key = keep; return out; }""", pm)
        check(f'{pm} min: every period of all {len(keys)} lessons sums to {pm}, rows >= 2 min', not res, res[:3])
    res = pg.evaluate("""() => { const out = []; for (const pm of [30, 35, 40, 45, 50]){ store.meta.periodMin = pm;
        for (const k of Object.keys(DB)){ state.key = k; const pl = computePlan(); const m = /الزمن:<\\/strong>\\s*(\\S+)/.exec(pl.t.warm);
          const want = pl.flow[0].minutes; const txt = plainText(pl.t.warm); const ok = want === 2 ? /دقيقتان/.test(txt) : want >= 3 && want <= 10 ? txt.includes(want + ' دقائق') : txt.includes(want + ' دقيقة');
          if (!ok) out.push([pm, k, want, txt.slice(-30)]); } } return out; }""")
    check('the warm-up block states the minutes of the opening row (all lengths, all lessons)', not res, res[:3])
    pg.evaluate("() => { store.meta.periodMin = 35; state.key = 'sci6~3_4'; refresh(); }")
    ui = pg.evaluate("() => ({ btn: [...document.querySelectorAll('#minSeg [data-pm]')].map(b => b.dataset.pm), on: document.querySelector('#minSeg [aria-pressed=true]').dataset.pm, sub: document.querySelector('#durSub').textContent })")
    check('selector shows 30/35/40/45/50 with 35 selected', ui['btn'] == ['30', '35', '40', '45', '50'] and ui['on'] == '35' and '35' in ui['sub'], ui)
    pg.click('#minSeg [data-pm="45"]'); pg.wait_for_timeout(500)
    st = pg.evaluate("() => { const pl = computePlan(); return { pm: PM(), saved: JSON.parse(localStorage.getItem('sci56-smart-planner:v2')).meta.periodMin, dur: pl.duration, meter: document.querySelector('#meterVal').textContent, firstMin: document.querySelector('.exec-tbl tbody tr td') && 1 } }")
    check('clicking 45 applies and is saved', st['pm'] == 45 and st['saved'] == 45 and st['dur'] == 90 and '90' in st['meter'], st)
    pg.reload(); pg.wait_for_timeout(900)
    check('45 survives a reload', pg.evaluate("() => PM()") == 45)
    # title
    tl = pg.evaluate("() => ({ t: computePlan().title, d: computePlan().d.title, shown: document.querySelector('[data-edit=\"t:title\"]').innerText })")
    check('sheet title = lesson title without the "أ./ب." part', tl['t'] == 'فصل المواد غير القابلة للذوبان' and tl['shown'] == tl['t'] and 'الترشيح' in tl['d'], tl)
    pg.click('[data-edit="t:title"]'); pg.keyboard.press('End'); pg.keyboard.type(' 2'); pg.wait_for_timeout(700)
    pg.reload(); pg.wait_for_timeout(900)
    check('edited title is kept after a reload', pg.evaluate("() => document.querySelector('[data-edit=\"t:title\"]').innerText") == 'فصل المواد غير القابلة للذوبان 2')
    pg.evaluate("() => { const r = getRec(state.key); delete r.edits['t:title']; touch(); refresh(); }")
    check('clearing the edit restores the default title', pg.evaluate("() => computePlan().title") == 'فصل المواد غير القابلة للذوبان')
    check('no page errors', not errs, errs)
    b.close()
print('FAILED: ' + ', '.join(bad) if bad else 'ALL PASS'); sys.exit(1 if bad else 0)
