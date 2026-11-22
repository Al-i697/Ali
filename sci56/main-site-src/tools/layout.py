"""Section and column heights (mm) in the print preview. Usage: layout.py KEY [KEY...]"""
import sys
from playwright.sync_api import sync_playwright
SEED='if(!localStorage.getItem("chem10-smart-planner:v2")){localStorage.setItem("chem10-smart-planner:v2", JSON.stringify({v:2, meta:{teacher:"", school:"معهد العلوم الإسلامية"}, lessons:{}, profile:{name:"أ. اختبار", school:"معهد العلوم الإسلامية", courses:["chem10","chem11"]}}))}'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1300,'height':1000}); pg.add_init_script(SEED)
    for key in sys.argv[1:]:
        pg.goto('file:///home/claude/work/app.html#'+key); pg.wait_for_timeout(500)
        pg.evaluate("state.preview=true; renderOutput()"); pg.wait_for_timeout(300)
        r=pg.evaluate("""(()=>{const paper=document.querySelector('.paper.pv'); const mm=96/25.4;
          const sec=Array.from(paper.children).filter(c=>c.offsetHeight&&!c.classList.contains('sh-wave')&&!c.classList.contains('pbreak')).map(c=>c.className.replace('sh-box ','').slice(0,12)+':'+Math.round(c.offsetHeight/mm));
          const cols={}; paper.querySelectorAll('.sh-bottom .col, .sh-cols .col').forEach((c,i)=>{const b=c.querySelector('.col-b'); let h=0; Array.from(b.children).forEach(x=>h+=x.offsetHeight); cols[(c.closest('.sh-bottom')?'B':'C')+i]=Math.round(h/mm)});
          const rows=Array.from(paper.querySelectorAll('.exec-tbl tbody tr')).map(tr=>Math.round(tr.offsetHeight/mm));
          return {sec:sec.join(' '), cols, rows, breaks: pageBreaks(paper).map(y=>Math.round(y/mm))}})()""")
        print(key, r)
    b.close()
