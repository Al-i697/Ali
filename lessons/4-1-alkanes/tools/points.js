/* click-by-click points: Next shows one point at a time, then moves on; Previous hides the last point; coming back shows them all. Run: node tools/points.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson41.html';
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}}); const errs=[]; let bad=0;
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const ck=(name,ok,info)=>{ if(!ok) bad++; console.log((ok?'ok  ':'FAIL')+' '+name+(info?'  '+info:'')) };
  const st=()=>p.evaluate(()=>{const s=document.querySelector('.slide.on'); const pts=[...s.querySelectorAll('.pt')]; return {id:s.dataset.id,n:pts.length,hid:pts.filter(e=>e.classList.contains('pt-h')).length,vis:pts.filter(e=>getComputedStyle(e).visibility!=='hidden').length,where:document.querySelector('#where small').textContent}});
  await p.goto(URL+'#s1'); await p.waitForTimeout(1800);
  let s=await st(); ck('goals starts with all points hidden',s.id==='goals'&&s.n===7&&s.hid===7&&s.vis===0,JSON.stringify(s));
  for(let i=1;i<=7;i++){ await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); s=await st(); if(!(s.id==='goals'&&s.hid===7-i)) ck('next #'+i+' reveals one point',false,JSON.stringify(s)) }
  ck('after 7 presses all points visible, still on goals',s.id==='goals'&&s.hid===0&&/النقاط/.test(s.where),s.where);
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1500); s=await st(); ck('8th press moves to the next slide (what, 3 hidden points)',s.id==='what'&&s.n===3&&s.hid===3,JSON.stringify(s));
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); s=await st(); ck('one point shown on what',s.hid===2);
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); s=await st(); ck('Previous hides it again, stays on the slide',s.id==='what'&&s.hid===3,JSON.stringify(s));
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1500); s=await st(); ck('Previous with nothing shown goes back; the earlier slide shows all its points',s.id==='goals'&&s.hid===0,JSON.stringify(s));
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); s=await st(); ck('Previous on goals hides the last point first',s.id==='goals'&&s.hid===1,JSON.stringify(s));
  const dis=await p.evaluate(()=>[document.querySelector('#bPrev').disabled,document.querySelector('#bNext').disabled]);
  ck('buttons enabled in the middle',!dis[0]&&!dis[1],JSON.stringify(dis));
  /* last slide: Next stays enabled while points remain */
  await p.evaluate(()=>{location.hash='#s29'}); await p.reload(); await p.waitForTimeout(1800); s=await st();
  const nd=await p.evaluate(()=>document.querySelector('#bNext').disabled); ck('last slide: Next enabled while points remain',s.id==='hw'&&s.n===5&&s.hid===5&&nd===false,JSON.stringify(s));
  for(let i=0;i<5;i++){ await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(120) }
  const nd2=await p.evaluate(()=>document.querySelector('#bNext').disabled); s=await st(); ck('last slide: all points shown, Next disabled',s.hid===0&&nd2===true,JSON.stringify(s));
  ck('no page errors',errs.length===0,errs.join(' | '));
  await b.close(); console.log(bad?('FAILED '+bad):'ALL OK'); process.exit(bad?1:0);
})();
