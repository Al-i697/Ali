"""Planner/dumper for per-period bookends.
Usage: python3 tools/pbplan.py KEY [KEY...] [--html=FILE]
Prints, for each multi-period lesson: objectives, the flat authored rows (index, minutes, phase/strategy, objective idx,
teacher/student first lines, tool, question, answer) and a proposed PB skeleton (cuts + mins) that makes every period
exactly 40 minutes once openers/closers (5 min each) are added. Edit the proposal by hand, then write the bookends."""
import sys, re, json
from playwright.sync_api import sync_playwright
args = [a for a in sys.argv[1:] if not a.startswith('--')]
html = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--html=')), '/home/claude/work/app.html')
raw = '--raw' in sys.argv
short = '--short' in sys.argv
def strip(s): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s or '')).strip()
def lines(x): return [strip(t) for t in (x if isinstance(x, list) else [x])]

def propose(mins, objs, N):
    """DP over cut points: period sizes S_p (35 / 30 / 35, or 40-5 for N=2 ends) with rows scaled to fit exactly."""
    n = len(mins); S = [40 - (5 if p > 0 else 0) - (5 if p < N - 1 else 0) for p in range(N)]
    f = sum(S) / sum(mins); sc = [m * f for m in mins]
    INF = 1e9; best = {}
    def go(p, i):
        if p == N - 1: return (abs(sum(sc[i:]) - S[p]), [])
        if (p, i) in best: return best[(p, i)]
        res = (INF, None); acc = 0
        for j in range(i + 1, n - (N - 1 - p) + 1):
            acc += sc[j - 1]
            cost = abs(acc - S[p]) + (3 if set(objs[j - 1]) == set(objs[j]) and objs[j] else 0)
            sub = go(p + 1, j)
            if sub[0] + cost < res[0]: res = (sub[0] + cost, [j] + sub[1])
        best[(p, i)] = res; return res
    cuts = go(0, 0)[1]
    bounds = [0] + cuts + [n]; out = []
    for p in range(N):
        seg = sc[bounds[p]:bounds[p + 1]]; tot = S[p]
        base = [max(2, int(x * tot / sum(seg))) for x in seg]
        # distribute remainder to the rows with the largest fractional part
        order = sorted(range(len(seg)), key=lambda k: -(seg[k] * tot / sum(seg) - base[k]))
        d = tot - sum(base); k = 0
        while d != 0 and order:
            i = order[k % len(order)]
            if d > 0: base[i] += 1; d -= 1
            elif base[i] > 2: base[i] -= 1; d += 1
            k += 1
            if k > 500: break
        out += base
    return cuts, out

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + html); pg.wait_for_timeout(600)
    for key in args:
        d = pg.evaluate(f"""(()=>{{const k={json.dumps(key)}, D=DB[k], A=AUTHORED[k];
          return {{title:D.title, N:OFFICIAL_PERIODS[k], obj:D.objectives.map(o=>o.text), au:A?{{prior:A.prior, warm:A.warm, exit:A.exit, periods:A.periods, pstart:A.pstart||null}}:null}} }})()""")
        print('=' * 100); print(key, '|', d['title'], '| periods:', d['N'])
        for i, t in enumerate(d['obj']): print(f'  هدف {i}: {strip(t)[:(90 if short else 150)]}')
        au = d['au']
        if not au: print('  (no authored plan)'); continue
        if not short: print('  prior:', strip(json.dumps(au['prior'], ensure_ascii=False))[:200]); print('  warm :', strip(json.dumps(au['warm'], ensure_ascii=False))[:200])
        rows = [r for P in au['periods'] for r in P['rows']]
        print('  authored periods (row counts):', [len(P['rows']) for P in au['periods']], '| pstart:', au['pstart'])
        cum = 0
        for i, r in enumerate(rows):
            ph, st, m, ob, te, su, ev = r
            cum += m
            print(f'  [{i:2}] {m:3}د Σ{cum:3} | {ph} / {st} | obj{ob}')
            print(f'        م: {" | ".join(lines(te))[:(110 if short else 230) if not raw else 900]}')
            if not short: print(f'        ط: {" | ".join(lines(su))[:150 if not raw else 600]}')
            if ev.get('q'): print(f'        ؟ [{ev.get("tool","")}] {strip(ev["q"])[:(140 if short else 200) if not raw else 600]}  ⟵ {strip(ev.get("ans",""))[:(90 if short else 140) if not raw else 500]}')
        print('  exit:', strip(au['exit'].get('q', ''))[:(150 if short else 200)], '⟵', strip(au['exit'].get('a', ''))[:(90 if short else 140)])
        N = d['N']
        if N and N > 1 and not au['pstart']:
            cuts, mins = propose([r[2] for r in rows], [r[3] for r in rows], N)
            print(f'  >>> proposal: cuts={cuts}, mins={mins}')
