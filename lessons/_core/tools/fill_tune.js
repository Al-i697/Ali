/* Finds, for every slide of a lesson, whether its content is small for the stage and, if so, the largest CSS zoom at which it still fits.
   Measured at the slide's fullest: every hidden bar and reveal is shown first. A zoom is accepted when the content stays inside the body (bottom and sides) with a margin.
   node ../_core/tools/fill_tune.js lesson33.html      -> prints  var FILL={...};  for src/pages.js   (current FILL is ignored: it measures the slide without it) */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||'lesson33.html');
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:1600,height:900}});await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.goto('file://'+file+'?pts=all');await p.waitForTimeout(1400);
 const n=await p.evaluate(()=>document.querySelectorAll('#prog .seg').length), out={}, info=[];
 const SKIP=/^(tk\d*|final|hw|goals|past[A-D0-9]*|eou\w*|noo|exq\d*)$/;
 for(let i=0;i<n;i++){
  await p.evaluate(i=>document.querySelectorAll('#prog .seg')[i].click(),i);await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
   const s=document.querySelector('.slide.on'),body=s&&s.querySelector('.body'); if(!body) return null;
   const sc=document.getElementById('stage').getBoundingClientRect().height/720;
   body.style.zoom='';
   body.querySelectorAll('.hide').forEach(e=>{ if(!e.closest('.predbox')) e.classList.remove('hide') });
   // the feedback lines fill up when the student answers: measure with a two-line message in each
   body.querySelectorAll('.fb').forEach(e=>{ if(!e.textContent.trim()) e.innerHTML='✓ 0.1 × 0.020 = 0.002 mol · الخطوة التالية: اقسم على المعامل في المعادلة الموزونة ثم اضرب في الكتلة المولية للمادة المطلوبة' });
   function measure(){
     const bb=body.getBoundingClientRect(); let bot=0,top=1e9,right=-1e9,left=1e9;
     const add=r=>{ if(r.width<3||r.height<3) return; bot=Math.max(bot,r.bottom); top=Math.min(top,r.top); right=Math.max(right,r.right); left=Math.min(left,r.left) };
     const vis=e=>{const cs=getComputedStyle(e);return !(cs.visibility==='hidden'||cs.opacity==='0'||cs.display==='none')};
     const w=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);let t;
     while((t=w.nextNode())){ if(!t.nodeValue.trim()) continue; const el=t.parentElement; if(!vis(el)||el.closest('.stk,.sticker')) continue; const rg=document.createRange(); rg.selectNodeContents(t); Array.prototype.forEach.call(rg.getClientRects(),add) }
     body.querySelectorAll('svg,img,canvas,input,button,select,video').forEach(e=>{ if(!vis(e)||e.closest('.stk,.sticker')) return; if(e.closest('svg')&&e.tagName!=='svg') return; add(e.getBoundingClientRect()) });
     // anything (box) sticking out of the body sideways or below
     let out=0; body.querySelectorAll('*').forEach(e=>{ if(!vis(e)||e.closest('.stk,.sticker,svg')) return; const r=e.getBoundingClientRect(); if(r.width<3) return; if(r.right>bb.right+3||r.left<bb.left-3||r.bottom>bb.bottom+3) out++ });
     return {h:(bot-top)/sc,avail:bb.height/sc,out:out,sw:body.scrollWidth-body.clientWidth};
   }
   const base=measure(); const res={id:s.dataset.id,used:Math.round(base.h),avail:Math.round(base.avail),out0:base.out};
   if(base.h>0.66*base.avail){ body.style.zoom=''; return res }
   for(let z=1.25;z>=1.05;z-=0.03){
     body.style.zoom=z.toFixed(2); void body.offsetHeight; const m=measure();
     if(m.out<=base.out&&m.h<=0.93*m.avail&&m.sw<=base.sw+2){ res.z=+z.toFixed(2); res.after=Math.round(m.h); break }
   }
   body.style.zoom=''; return res;
  });
  if(!r) continue; if(!SKIP.test(r.id)&&r.z) out[r.id]=r.z; info.push(r);
 }
 console.error(info.filter(r=>r.z).map(r=>r.id+': '+r.used+' -> '+r.after+' of '+r.avail+' (zoom '+r.z+')').join('\n'));
 console.log('var FILL={'+Object.keys(out).map(k=>k+':'+out[k]).join(', ')+'};');
 await b.close()})();
