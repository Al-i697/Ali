/* Where does the right answer sit? Walks through every slide, finds every group of choices (the lesson's .opts groups and the scene slides' lead-in questions) and records the position of the right one.
   A right answer that always lands in the same place (the teacher noticed "always the middle") fails the check.   node tools/answers.js   (after python3 build.py) */
const {chromium}=require('playwright'); const path=require('path');
(async()=>{
  const file=path.resolve('lessone32s.html'); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}});
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await p.goto('file://'+file+'?pts=all'); await p.waitForTimeout(1500);
  const n=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length); const rows=[]; const hist={};
  for(let i=1;i<=n;i++){
    await p.goto('file://'+file+'?pts=all#s'+i); await p.reload(); await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{
      const s=document.querySelector('.slide.on'), id=s.getAttribute('data-id'), out=[];
      if(s.shadowRoot){ const o=Array.from(s.shadowRoot.querySelectorAll('.lead .o')); if(o.length) out.push({k:'lead',n:o.length,at:o.findIndex(x=>x.getAttribute('data-ok')==='1')}) }
      s.querySelectorAll('.opts').forEach(box=>{
        const kids=Array.from(box.querySelectorAll('.opt')); let at=-1;
        for(let j=0;j<kids.length&&at<0;j++){ kids[j].click(); if(kids[j].classList.contains('ok-b')) at=j }
        out.push({k:'opts',n:kids.length,at:at})
      });
      return {id:id,groups:out};
    });
    r.groups.forEach(g=>{ rows.push([r.id,g.k,g.at+1,g.n]); const key=g.n+' choices: place '+(g.at+1); hist[key]=(hist[key]||0)+1 });
  }
  const by={}; rows.forEach(r=>{ const k=r[3]; (by[k]=by[k]||[]).push(r[2]) });
  console.log('groups of choices:',rows.length);
  Object.keys(by).sort().forEach(k=>{ const c={}; by[k].forEach(v=>c[v]=(c[v]||0)+1); console.log(k+' choices ->',Object.keys(c).sort().map(v=>'place '+v+': '+c[v]).join(' | ')) });
  const worst=Object.keys(by).map(k=>{ const c={}; by[k].forEach(v=>c[v]=(c[v]||0)+1); return Math.max(...Object.values(c))/by[k].length }).reduce((a,b)=>Math.max(a,b),0);
  console.log('largest share of one place:',Math.round(worst*100)+'%'); 
  console.log(rows.map(r=>r[0]+':'+r[2]+'/'+r[3]).join('  '));
  await b.close();
})();
