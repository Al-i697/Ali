/* checks the click-by-click points of every slide that has them:  node ../_core/tools/points_check.js lesson42.html
   on each slide the points start hidden; Next shows exactly one more each time and stays on the slide; one more Next moves on; Previous hides the last point */
const {chromium}=require('playwright'); const path=require('path');
(async()=>{
  const file=path.resolve(process.argv[2]); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}}); const errs=[]; let bad=0, slides=0, pts=0;
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+file+'#s1'); await p.waitForTimeout(1800);
  const total=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length);
  const st=()=>p.evaluate(()=>{const s=document.querySelector('.slide.on'); const a=[...s.querySelectorAll('.ptn')]; return {id:s.dataset.id,n:a.length,hid:a.filter(e=>e.classList.contains('pt-h')).length}});
  for(let i=1;i<=total;i++){
    await p.goto('file://'+file+'#s'+i); await p.reload(); await p.waitForTimeout(1300);
    let s=await st(); if(!s.n) continue; slides++; pts+=s.n;
    const id=s.id; let ok=s.hid===s.n;
    for(let k=1;k<=s.n&&ok;k++){ await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(120); const t=await st(); ok=t.id===id&&t.hid===s.n-k }
    if(ok){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120); const t=await st(); ok=t.id===id&&t.hid===1 }
    if(ok&&i<total){ await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1300); const t=await st(); ok=t.id!==id }
    if(!ok){ bad++; console.log('FAIL',id,JSON.stringify(s)) }
  }
  if(errs.length){bad++; console.log('page errors:',errs.join(' | '))}
  console.log(slides+' slides with points ('+pts+' points):',bad?('FAILED '+bad):'all ok');
  await b.close(); process.exit(bad?1:0);
})();
