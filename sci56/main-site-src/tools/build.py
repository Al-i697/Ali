"""Build the app: inject all course data (data/*.json, data/*.py) into app_base.html.
Usage: python3 tools/build.py [base] [out]"""
import sys, json, glob, os, importlib.util
W = '/home/claude/work'
base = sys.argv[1] if len(sys.argv) > 1 else f'{W}/app_base.html'
out = sys.argv[2] if len(sys.argv) > 2 else f'{W}/app.html'
t = open(base, encoding='utf-8').read()
DB, AU, PER = {}, {}, {}
def check(name, db, au, per):
    for k, a in au.items():
        mins = sum(r[2] for P in a['periods'] for r in P['rows'])
        assert mins == per[k] * 40, (name, k, 'minutes', mins, per[k] * 40)
        n = len(db[k]['objectives'])
        used = set()
        for P in a['periods']:
            for r in P['rows']:
                assert all(0 <= i < n for i in r[3]), (name, k, r[0], 'bad objective index')
                used |= set(r[3])
        assert used == set(range(n)), (name, k, 'objectives not covered', set(range(n)) - used)
        for f in ('prior', 'warm', 'exit', 'homework', 'support', 'enrich'):
            assert f in a, (name, k, 'missing', f)
        if 'pstart' in a:   # lessons that carry their own per-period bookends: every period sums to 40 minutes and has an objective row
            rows = [r for P in a['periods'] for r in P['rows']]; ps = a['pstart']
            assert len(ps) == per[k] and ps[0] == 0, (name, k, 'pstart count')
            for p in range(len(ps)):
                seg = rows[ps[p]:(ps[p + 1] if p < len(ps) - 1 else len(rows))]
                assert sum(r[2] for r in seg) == 40, (name, k, 'period', p + 1, 'minutes', sum(r[2] for r in seg))
                assert any(r[3] for r in seg), (name, k, 'period', p + 1, 'no objective row')
for f in sorted(glob.glob(f'{W}/data/*.json')) + sorted(x for x in glob.glob(f'{W}/data/*.py') if not os.path.basename(x).startswith('pb_')):
    if f.endswith('.json'):
        d = json.load(open(f, encoding='utf-8')); db, au, per = d['DB'], d['AUTHORED'], d['PERIODS']
    else:
        spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        db, au, per = m.DB, m.AUTHORED, m.PERIODS
    check(os.path.basename(f), db, au, per)
    dup = set(DB) & set(db); assert not dup, ('duplicate lesson keys', dup)
    DB.update(db); AU.update(au); PER.update(per)
# ---- per-period bookends (data/pb_*.py): each 40-minute period gets its own opener and closer ----
def apply_pb(key, au, pb, N):
    """Re-time the continuous rows and insert, per period: an opener (prior learning + warm-up) and a closer (assessment).
    Row 0 (lesson warm-up) is the opener of period 1; the last row (exit ticket) is the closer of the last period."""
    assert len(au['periods']) == 1, (key, 'pb needs a single continuous row list')
    rows = au['periods'][0]['rows']
    cuts, opens, closes, mins = pb['cuts'], pb['open'], pb['close'], pb.get('mins')
    assert len(cuts) == N - 1 and len(opens) == N - 1 and len(closes) == N - 1, (key, 'pb counts', N)
    assert mins is None or len(mins) == len(rows), (key, 'mins length', len(mins), len(rows))
    assert all(0 < c < len(rows) for c in cuts) and cuts == sorted(cuts), (key, 'cuts')
    bounds = [0] + list(cuts) + [len(rows)]
    new, pstart = [], []
    for p in range(N):
        pstart.append(len(new))
        if p: new.append(list(opens[p - 1]))
        for i in range(bounds[p], bounds[p + 1]):
            r = list(rows[i])
            if mins: r[2] = mins[i]
            new.append(r)
        if p < N - 1: new.append(list(closes[p]))
    for p in range(N):
        seg = new[pstart[p]:(pstart[p + 1] if p < N - 1 else len(new))]
        s = sum(r[2] for r in seg)
        assert s == 40, (key, 'period', p + 1, 'minutes', s, [r[2] for r in seg])
        assert any(r[3] for r in seg), (key, 'period', p + 1, 'has no objective rows')
    au['periods'][0]['rows'] = new; au['pstart'] = pstart
    for f, v in pb.get('trim', {}).items():   # optional text trims (support / enrich / homework ...) to keep the print within its page budget
        assert f in au, (key, 'trim field', f); au[f] = v

PB_BASE = {}   # lessons defined inside app_base.html itself: patched in the browser at load time (same rules, see applyPBBase)
for f in sorted(glob.glob(f'{W}/data/pb_*.py')):
    spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    for k, pb in m.PB.items():
        if k in AU:
            apply_pb(k, AU[k], pb, PER[k])
        else:
            PB_BASE[k] = pb
    check(os.path.basename(f), DB, {k: AU[k] for k in m.PB if k in AU}, PER)

j = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
assert t.count('/*COURSE_DB*/') == 1 and t.count('/*COURSE_AU*/') == 1
t = t.replace('/*COURSE_DB*/', '/*COURSE_DB*/Object.assign(DB, ' + j(DB) + ');/*COURSE_DB_END*/')
JS_PB = '''
function applyPBBase(PB){
  for (const k in PB){
    const pb = PB[k], a = AUTHORED[k], N = OFFICIAL_PERIODS[k];
    if (!a || !N) throw new Error("PB unknown lesson " + k);
    if (pb.pstart){   // the lesson already carries its own closing / opening rows: just mark them as the period bands
      const rows0 = a.periods.flatMap(P => P.rows).map(r => r.slice()), objs0 = [...new Set(a.periods.flatMap(P => P.objs))].sort((x, y) => x - y), ps = pb.pstart;
      if (ps.length !== N) throw new Error("PB pstart count " + k);
      for (let p = 0; p < N; p++){
        const seg = rows0.slice(ps[p], p < N - 1 ? ps[p + 1] : rows0.length), s = seg.reduce((t, r) => t + r[2], 0);
        if (s !== 40) throw new Error("PB " + k + " period " + (p + 1) + " minutes " + s);
        if (!seg.some(r => r[3].length)) throw new Error("PB " + k + " period " + (p + 1) + " has no objective rows");
        if (p < N - 1 && seg[seg.length - 1][3].length) throw new Error("PB " + k + " period " + (p + 1) + " closing row carries objectives");
      }
      a.periods = [{ objs: objs0, rows: rows0 }]; a.pstart = ps.slice();
      if (pb.trim) for (const f in pb.trim) a[f] = pb.trim[f];
      continue;
    }
    const rows = a.periods.flatMap(P => P.rows), objs = [...new Set(a.periods.flatMap(P => P.objs))].sort((x, y) => x - y);
    const { cuts, open, close, mins } = pb;
    if (cuts.length !== N - 1 || open.length !== N - 1 || close.length !== N - 1) throw new Error("PB counts " + k);
    if (mins && mins.length !== rows.length) throw new Error("PB mins length " + k + " " + mins.length + " vs " + rows.length);
    const bounds = [0, ...cuts, rows.length], out = [], pstart = [];
    for (let p = 0; p < N; p++){
      pstart.push(out.length);
      if (p) out.push(open[p - 1].slice());
      for (let i = bounds[p]; i < bounds[p + 1]; i++){ const r = rows[i].slice(); if (mins) r[2] = mins[i]; out.push(r); }
      if (p < N - 1) out.push(close[p].slice());
    }
    for (let p = 0; p < N; p++){
      const seg = out.slice(pstart[p], p < N - 1 ? pstart[p + 1] : out.length), s = seg.reduce((t, r) => t + r[2], 0);
      if (s !== 40) throw new Error("PB " + k + " period " + (p + 1) + " minutes " + s);
      if (!seg.some(r => r[3].length)) throw new Error("PB " + k + " period " + (p + 1) + " has no objective rows");
    }
    a.periods = [{ objs, rows: out }]; a.pstart = pstart;
    if (pb.trim) for (const f in pb.trim) a[f] = pb.trim[f];
  }
}
'''
t = t.replace('/*COURSE_AU*/', '/*COURSE_AU*/Object.assign(AUTHORED, ' + j(AU) + ');\nObject.assign(OFFICIAL_PERIODS, ' + j(PER) + ');' + JS_PB + 'applyPBBase(' + j(PB_BASE) + ');/*COURSE_AU_END*/')
# ---- floating assistant: src/assistant.{css,html,js}, src/assistant_ppt.js and inlined vendor libraries (JSZip, PptxGenJS) ----
def rd(path): return open(f'{W}/{path}', encoding='utf-8').read()
def inject(tag, text):
    global t
    assert t.count(tag) == 1, ('placeholder', tag, t.count(tag))
    t = t.replace(tag, text)
inject('/*ASSISTANT_CSS*/', rd('src/assistant.css'))
inject('<!--ASSISTANT_HTML-->', rd('src/assistant.html'))
inject('/*ASSISTANT_JS*/', rd('src/assistant.js') + '\n' + rd('src/assistant_ppt.js') + '\n' + rd('src/assistant_direct.js'))
vend = ''.join('<script>' + rd(f'vendor/{n}').replace('</script', '<\\/script') + '</script>\n' for n in ('jszip.min.js', 'pptxgen.min.js'))
inject('<!--VENDOR-->', vend)
open(out, 'w', encoding='utf-8').write(t)
by = {}
for k, v in DB.items(): by.setdefault((v.get('course', 'chem10'), v.get('sem', 1)), []).append(k)
print('injected:', {f'{c}/s{s}': len(v) for (c, s), v in sorted(by.items())}, '| per-period bookends:', sum(1 for a in AU.values() if a.get('pstart')))
