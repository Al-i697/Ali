"""Flag operators/formula pieces left outside LTR spans. Usage: bidiaudit.py PREFIX [--bk] [--html=FILE]
--bk audits only the per-period bookend rows (openers/closers); default audits whole lessons."""
import sys
from playwright.sync_api import sync_playwright
pref = sys.argv[1]; BK = "--bk" in sys.argv
html = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--html=")), "/home/claude/work/app.html")
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + html); pg.wait_for_timeout(400)
    out = pg.evaluate("""([pref, BK])=>{
      const strs=[]; const walk=(o)=>{ if(typeof o==='string') strs.push(o); else if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object') Object.values(o).forEach(walk); };
      KEYS.filter(k=>k.startsWith(pref)).forEach(k=>{ if(!BK){ walk(DB[k]); walk(AUTHORED[k]); return; }
        const A=AUTHORED[k]; if(!A||!A.pstart) return; const rows=A.periods.flatMap(P=>P.rows);
        A.pstart.forEach((st,i)=>{ if(i){ walk(rows[st]); walk(rows[st-1]); } }); });
      const bad=[];
      strs.map(s=>s.replace(/<[^>]+>/g,' ')).forEach(s=>{ const m=ltrMarks(s); let rest=''; let pos=0; m.forEach(([a,b])=>{ rest+=s.slice(pos,a)+' ‖ '; pos=b; }); rest+=s.slice(pos);
        const segs=rest.split(' ‖ ');
        segs.forEach(seg=>{ if(/[=+−×÷→⇌]/.test(seg.replace(/[-–]/g,'')) || /\\d\\s+Δ|Δ\\S*\\[|[A-Za-z]\\)?\\s*[=<>]/.test(seg) || /\\d\\s?[-–]\\s?\\d/.test(seg)) bad.push(seg.trim().slice(0,90)+'   <<  '+s.slice(0,60)); }); });
      return [...new Set(bad)];
    }""", [pref, BK])
    print(len(out)); print('\n'.join(out))
    b.close()
