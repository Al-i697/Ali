/* Interaction tests for the environmental-science lesson 3-3 (nutrient cycles): every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lessone33.html';
const IDS=["goals","lead1","lead2","nut","elem","tab33","forms","act41","cyc","bio","abio","phase","salm1","salm2","res","conc","proc5","gas","exc","upw","run","tect","procq","act44","uptake","snow","harv","q911","act44b","carbon","dz1","dz2","dz3","dz4","dz5","dz6","dzq","eou3","eou7","eou11","abq3","abq4","exam","tk","hw"];
const results=[]; const errs=[]; const ONLY=(process.env.ONLY||'').split(',').filter(Boolean);   /* ONLY=res,cyc node tools/test.js runs just those slides */
(async()=>{
  const b=await chromium.launch();
  await Promise.resolve();
  async function open(id,q){
    const n=IDS.indexOf(id)+1; const p=await b.newPage({viewport:{width:1600,height:900}});
    await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text()))errs.push('['+id+'] '+m.text())}); p.on('pageerror',e=>errs.push('['+id+'] PAGEERR '+e.message));
    await p.goto(URL+(q===undefined?'?pts=all':q)+'#s'+n); await p.waitForTimeout(1900); return p;
  }
  async function fill(sl,sel,v){const i=sl.locator(sel+' input').first(); await i.fill(String(v)); await i.press('Enter'); await sl.page().waitForTimeout(120)}
  async function T(id,fn,q){
    if(ONLY.length&&!ONLY.includes(id)) return;
    let p; try{ p=await open(id,q); const sl=p.locator('.slide.on'); const r=await fn(p,sl); let fit=r===false?'':await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: nothing may leave the stage: '+fit:'ok')]) }catch(e){ results.push([id,'FAIL: '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  /* after the steps of a slide, nothing may stick out of the stage */
  async function fits(p){ await p.waitForTimeout(500); return await p.evaluate(()=>{
    const st=document.querySelector('.stage').getBoundingClientRect(), k=st.width/1280, bad=[];
    document.querySelectorAll('.slide.on *').forEach(e=>{
      if(e.closest('.stk,.spk,.stk-pop')||(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')) return;
      const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) return;
      const r=e.getBoundingClientRect(); if(r.width<4||r.height<4) return;
      if(r.bottom>st.bottom+2||r.top<st.top-2) bad.push((e.className&&e.className.baseVal===undefined?String(e.className).slice(0,18):e.tagName)+' '+Math.round((r.top-st.top)/k)+'-'+Math.round((r.bottom-st.top)/k));
    }); return bad.slice(0,3).join(' | ') }) }
  const cnt=async(l)=>await l.count(), vis=async(l)=>await l.isVisible();
  async function ticket(p,sl,seq){
    for(const a of seq){ const q=sl.locator('.tq.cur'); if(a.num!==undefined) await fill(q,'.nin',a.num); else await q.locator('.opt[data-i="'+a.opt+'"]').click();
      await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    return (await sl.locator('.score').textContent()).includes(seq.length+' / '+seq.length);
  }
  async function mcqAll(p,sl,sel){ const o=sl.locator((sel||'.lq')+' .opt'); const n=await o.count(); for(let i=0;i<n;i++){ try{ await o.nth(i).click({timeout:700}) }catch(e){} await p.waitForTimeout(80) } await p.waitForTimeout(250) }
  async function clsAll(p,sl){ const rows=sl.locator('.cls'); const n=await rows.count(); for(let i=0;i<n;i++){ const r=rows.nth(i); const a=await r.getAttribute('data-a'); await r.locator('button[data-v="'+a+'"]').click(); await p.waitForTimeout(60) } await p.waitForTimeout(250); return n }
  async function cards(p,sl){ const c=sl.locator('.rcard'); const n=await c.count(); for(let i=0;i<n;i++){ await c.nth(i).click(); await p.waitForTimeout(40) } return n>0 && (await cnt(sl.locator('.rcard.on')))===n }
  async function matchAll(p,sl){ for(let g=0;g<30;g++){ const chip=sl.locator('#tray .mchip').first(); if(!(await chip.count())) break; const k=await chip.getAttribute('data-k'); const slots=sl.locator('.mslot[data-k="'+k+'"]'); const m=await slots.count(); let done=false; for(let j=0;j<m;j++){ if(!(await slots.nth(j).locator('.mchip').count())){ await chip.click(); await slots.nth(j).click(); await p.waitForTimeout(120); done=true; break } } if(!done) break } await p.waitForTimeout(300) }
  const gb=async(sl)=>await vis(sl.locator('#gb'));
  const fbOk=async(sl,sel)=>(await sl.locator(sel||'.lq .fb').first().textContent()).includes('✓');

  await T('goals',async(p,sl)=>{ await sl.locator('.gi').first().click(); return (await cnt(sl.locator('.gi')))===9 && await cnt(sl.locator('.gi.done'))===1 });
  /* slides that open with a question (right column) and then show points (and a picture that follows them) */
  for(const id of ['lead1','nut','tab33','cyc','res','conc','proc5','gas','exc','run','tect','harv','dz1','dz3'])
    await T(id,async(p,sl)=>{ await mcqAll(p,sl); return (await fbOk(sl)) && (await cnt(sl.locator('[data-pt]')))>=3 });
  await T('lead2',async(p,sl)=>{ const n=await clsAll(p,sl); return n===6 && await gb(sl) });
  await T('forms',async(p,sl)=>{ const n=await clsAll(p,sl); return n===12 && await gb(sl) });
  await T('phase',async(p,sl)=>{ const n=await clsAll(p,sl); return n===6 && await gb(sl) });
  await T('procq',async(p,sl)=>{ const n=await clsAll(p,sl); return n===6 && await gb(sl) });
  await T('elem',async(p,sl)=>{ await matchAll(p,sl); return (await cnt(sl.locator('.mslot .mchip')))===5 && await gb(sl) });
  await T('uptake',async(p,sl)=>{ await matchAll(p,sl); return (await cnt(sl.locator('.mslot .mchip')))===5 && await gb(sl) });
  await T('dz2',async(p,sl)=>{ await matchAll(p,sl); return (await cnt(sl.locator('.mslot .mchip')))===6 && await gb(sl) });
  for(const id of ['act41','salm2','act44','act44b','q911','dzq','eou7','eou11','abq3','abq4','exam']) await T(id,async(p,sl)=>cards(p,sl));
  for(const id of ['bio','abio','snow','dz4','dz5','dz6','salm1']) await T(id,async(p,sl)=>{ return (await cnt(sl.locator('[data-pt]')))>=4 });
  await T('eou3',async(p,sl)=>{ await mcqAll(p,sl,'.lq'); return (await fbOk(sl)) && await gb(sl) });
  /* the upwelling picture: both states, and the second one hides the first */
  await T('upw',async(p,sl)=>{
    const svg=sl.locator('.upw-svg'); const up1=await vis(sl.locator('.upw-svg .up-only').first());
    await sl.locator('.upb[data-st="dn"]').click(); await p.waitForTimeout(250);
    const dn=(await svg.getAttribute('class')).includes('dn'); const upHidden=!(await vis(sl.locator('.upw-svg .up-only').first()));
    await sl.locator('.upb[data-st="up"]').click(); await p.waitForTimeout(250);
    return up1 && dn && upHidden && !(await svg.getAttribute('class')).split(' ').includes('dn') && await gb(sl) });
  /* the carbon cycle: each row opens its answer and lights its arrow; an arrow can be pressed too */
  await T('carbon',async(p,sl)=>{
    const rows=sl.locator('.cyr'); const n=await rows.count();
    await sl.locator('.car[data-l="A"]').click({force:true}); await p.waitForTimeout(150);
    const lit=(await sl.locator('.car.hl').getAttribute('data-l'))==='A';
    for(let i=0;i<n;i++){ await rows.nth(i).click(); await p.waitForTimeout(40) }
    return n===11 && lit && (await cnt(sl.locator('.cyr.on')))===11 && await gb(sl) });
  await T('tk',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{num:500},{opt:0}]));
  await T('hw',async(p,sl)=>{ await sl.locator('.sab').first().click(); await sl.locator('.sab').first().click(); await sl.locator('.stp').first().click();
    return (await sl.locator('.sab').first().textContent()).trim()==='أقترب' && (await sl.locator('.stp.final').count())===1 && (await cnt(sl.locator('.sab')))===9 });

  /* the points: with no ?pts=all every slide that has points starts hidden and Next shows exactly one more; the pictures that follow the points change with them */
  for(const id of ['cyc','bio','abio','proc5','exc','run','tect','snow','harv','dz3','dz5','dz6']){
    if(ONLY.length&&!ONLY.includes(id)) continue;
    let p; try{
      p=await open(id,''); const sl=p.locator('.slide.on'); const total=await cnt(sl.locator('.ptn')); const syn=await cnt(sl.locator('[data-s]'));
      const shown=()=>sl.locator('[data-s].on').count(); const hid=()=>sl.locator('.ptn.pt-h').count();
      let ok=total>=3 && (await hid())===total; const s0=await shown();
      for(let i=1;i<=total;i++){ await p.click('#bNext'); await p.waitForTimeout(260); if((await hid())!==total-i) ok=false }
      const sEnd=await shown(); if(syn>0 && !(sEnd>s0)) ok=false;
      results.push([id+' (points)',ok?'ok':'FAIL: points '+total+', hidden at start '+(await hid())+', picture parts '+s0+'->'+sEnd]);
    }catch(e){ results.push([id+' (points)','FAIL: '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(16),r[1]));
  console.log('slides tested:',results.length,'(slides in the lesson:',IDS.length+')');
  console.log('FAILED:',results.filter(r=>r[1]!=='ok').length);
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
