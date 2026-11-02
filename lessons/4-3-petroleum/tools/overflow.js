const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+path.resolve(process.argv[2]||'lesson43.html')+'?pts=all');await p.waitForTimeout(1200);
 const n=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length);const bad=[];
 for(let i=1;i<=n;i++){await p.waitForTimeout(3000);
  const r=await p.evaluate(()=>{const s=document.querySelector('.slide.on');const st=document.getElementById('stage').getBoundingClientRect();const sc=st.height/720;
   const b=s.querySelector('.body');let maxB=0,minT=1e9;s.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;const cs=getComputedStyle(e);if(cs.position==='absolute'&&e.closest('.cwrap,.pic,svg'))return;maxB=Math.max(maxB,(r.bottom-st.top)/sc)});
   return {id:s.dataset.id,sh:s.scrollHeight,bodyOver:b?b.scrollHeight-b.clientHeight:0,maxBottom:Math.round(maxB)}});
  if(r.sh>720||r.bodyOver>1||r.maxBottom>716)bad.push(Object.assign({n:i},r));
  if(i<n)await p.keyboard.press('ArrowLeft')}
 console.table(bad);console.log(bad.length?'overflow on '+bad.length+' slides':'no overflow');await b.close()})();
