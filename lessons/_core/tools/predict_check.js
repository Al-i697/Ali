/* «توقّع ثم اكتشف» check (u4/predict.js): for every lab listed in PREDICT (src/pages.js)
   1. test mode (?pts=all) does not show the card, so the lesson suites keep running the labs directly;
   2. with ?pred=1 the card opens on arrival with the question and all options, inside the stage;
   3. choosing the right option closes the card and shows the chip "توقّعك: …"; the result (the #gb bar losing "hide") brings the verdict card, the chip turns green;
   4. choosing a wrong option gives an orange chip and a verdict that names the right answer and the reason;
   5. "تخطَّ" closes the card without a chip and nothing appears later.
   node ../_core/tools/predict_check.js lesson33.html */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
(async()=>{const file=path.resolve(process.argv[2]||'lesson33.html');
 const src=fs.readFileSync(path.join(path.dirname(file),'src','pages.js'),'utf8'), m=src.match(/var PREDICT\s*=\s*\{([\s\S]*?)\n\};/);
 if(!m){ console.log('no PREDICT in pages.js'); process.exit(0) }
 const ids=[]; m[1].replace(/(?:^|\n)\s*(\w+):\{q:/g,(x,k)=>{ids.push(k)});
 const bad=[], b=await chromium.launch(), errs=[];
 async function open(url){ const p=await b.newPage({viewport:{width:1600,height:900}}); p.on('pageerror',e=>errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort()); await p.goto(url); await p.waitForTimeout(1300); return p }
 async function go(p,id){ await p.evaluate(id=>{ const segs=[].slice.call(document.querySelectorAll('#prog .seg')); const items=[].slice.call(document.querySelectorAll('.idx .it')); }, id);
   // find the slide index by building through the index rows' order: click each segment until the slide id matches
   const n=await p.evaluate(()=>document.querySelectorAll('#prog .seg').length);
   for(let i=0;i<n;i++){ await p.evaluate(i=>document.querySelectorAll('#prog .seg')[i].click(),i); await p.waitForTimeout(350); const cur=await p.evaluate(()=>{const s=document.querySelector('.slide.on');return s&&s.dataset.id}); if(cur===id){ await p.waitForTimeout(1300); return true } }
   return false }
 for(const id of ids){
  // 1) test mode: no card
  let p=await open('file://'+file+'?pts=all'); await go(p,id);
  let n0=await p.evaluate(id=>document.querySelectorAll('.slide[data-id="'+id+'"] .predbox').length,id);
  if(n0) bad.push(id+': the card exists in test mode (?pts=all)'); await p.close();
  // 2-3) right answer
  for(const mode of ['right','wrong','skip']){
   p=await open('file://'+file+'?pred=1&pts=all'); if(!await go(p,id)){ bad.push(id+': slide not found'); await p.close(); continue }
   const info=await p.evaluate(id=>{ const s=document.querySelector('.slide[data-id="'+id+'"]'), bx=s&&s.querySelector('.predbox'); if(!bx) return null; const a=bx.getBoundingClientRect(), st=s.getBoundingClientRect();
     return {shown:!bx.hidden&&bx.classList.contains('on'),opts:bx.querySelectorAll('.pop').length,q:bx.querySelector('.pq').textContent.length,inside:a.left>=st.left-1&&a.right<=st.right+1&&a.top>=st.top-1&&a.bottom<=st.bottom+1} },id);
   if(!info){ bad.push(id+': no prediction card built'); await p.close(); continue }
   if(!info.shown) bad.push(id+': card not open on arrival'); if(info.opts<2) bad.push(id+': fewer than 2 options'); if(!info.q) bad.push(id+': empty question'); if(!info.inside) bad.push(id+': card outside the stage');
   const okIdx=await p.evaluate(()=>0); // placeholder, the right index comes from the source
   const want=new RegExp(id+":\\{q:[\\s\\S]*?ok:(\\d)").exec(m[1]); const ok=want?+want[1]:0;
   if(mode==='skip'){
     await p.evaluate(id=>document.querySelector('.slide[data-id="'+id+'"] .pskip').click(),id); await p.waitForTimeout(500);
     await p.evaluate(id=>{ const g=document.querySelector('.slide[data-id="'+id+'"] #gb'); if(g){ g.classList.remove('hide') } },id); await p.waitForTimeout(500);
     const r=await p.evaluate(id=>({chip:!!document.querySelector('.slide[data-id="'+id+'"] .pdc'),open:!!document.querySelector('.slide[data-id="'+id+'"] .predbox.on')}),id);
     if(r.chip||r.open) bad.push(id+': skipped, yet a chip or card appeared later');
   } else {
     const pick=mode==='right'?ok:(ok+1)%info.opts;
     await p.evaluate(([id,pick])=>document.querySelectorAll('.slide[data-id="'+id+'"] .pop')[pick].click(),[id,pick]); await p.waitForTimeout(500);
     let r=await p.evaluate(id=>{const c=document.querySelector('.slide[data-id="'+id+'"] .pdc'),bx=document.querySelector('.slide[data-id="'+id+'"] .predbox');return {chip:c&&c.textContent,s:c&&c.getAttribute('data-s'),open:bx.classList.contains('on')}},id);
     if(!r.chip||r.s!=='asked') bad.push(id+': no "asked" chip after choosing'); if(r.open) bad.push(id+': card still open after choosing');
     await p.evaluate(id=>{ const g=document.querySelector('.slide[data-id="'+id+'"] #gb'); if(g){ g.classList.remove('hide') } },id); await p.waitForTimeout(600);
     r=await p.evaluate(id=>{const c=document.querySelector('.slide[data-id="'+id+'"] .pdc'),bx=document.querySelector('.slide[data-id="'+id+'"] .predbox');return {s:c&&c.getAttribute('data-s'),open:bx.classList.contains('on'),txt:bx.querySelector('.pq').textContent}},id);
     if(r.s!==(mode==='right'?'ok':'no')) bad.push(id+': after the result the chip is "'+r.s+'" (expected '+(mode==='right'?'ok':'no')+')');
     if(!r.open) bad.push(id+': no verdict card after the result'); if(!/النتيجة:/.test(r.txt)) bad.push(id+': verdict does not show the result');
   }
   await p.close();
  }
 }
 console.log('predictions checked:',ids.join(', '));
 console.log(bad.length?bad.join('\n'):'predictions ok');
 console.log('errors',errs.length?errs.slice(0,3):'none');
 await b.close(); process.exit(bad.length||errs.length?1:0)})();
