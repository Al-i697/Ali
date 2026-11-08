const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+path.resolve('lesson23.html'));await p.waitForTimeout(1500);
 const n=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length);const bad=[];let totalFx=0;
 for(let i=1;i<=n;i++){
   const fx=await p.evaluate(()=>document.querySelectorAll('.slide.on .fx').length); totalFx+=fx;
   await p.waitForTimeout(2600);
   const r=await p.evaluate(()=>({fx:document.querySelectorAll('.fx').length,tr:[...document.querySelectorAll('.slide')].filter(e=>/\btr-/.test(e.className)).length,off:document.querySelectorAll('.slide.off').length,ons:document.querySelectorAll('.slide.on').length}));
   if(r.fx||r.tr||r.off||r.ons!==1) bad.push(Object.assign({slide:i},r));
   if(i<n) await p.keyboard.press('ArrowLeft');
 }
 // rapid navigation: 10 quick next/prev presses, then settle
 for(let k=0;k<12;k++){await p.keyboard.press(k%3===2?'ArrowRight':'ArrowLeft');await p.waitForTimeout(90)}
 await p.waitForTimeout(2500);
 const r2=await p.evaluate(()=>({fx:document.querySelectorAll('.fx').length,tr:[...document.querySelectorAll('.slide')].filter(e=>/\btr-/.test(e.className)).length,off:document.querySelectorAll('.slide.off').length,ons:document.querySelectorAll('.slide.on').length,hidden:[...document.querySelectorAll('.slide.on *')].filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().width>8).length}));
 console.log('animated blocks seen on arrival (sum of first frames):',totalFx);
 console.log('residue per slide:',bad.length?JSON.stringify(bad):'none');console.log('after rapid navigation:',JSON.stringify(r2));
 console.log('errors',errs.length?errs:'none');await b.close()})();
