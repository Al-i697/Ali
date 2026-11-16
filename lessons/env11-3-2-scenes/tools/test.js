/* Interaction tests for the environmental-science lesson 3-2 (feeding relationships): every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lessone32s.html';
const IDS=["goals", "lead1", "lead2", "auto", "hetero", "tab32", "cls32", "zoo", "terms", "manatee", "pred", "antarctic", "kelp", "quin", "otter1", "otter2", "prod", "photic", "factors", "eq1", "eq2", "chemo", "cmp", "net", "abloom", "hab", "nursery", "sun", "resp", "sec", "cpruf", "ten", "pnum", "pbio", "pene", "bloom", "pcmp", "exx", "exp", "howp", "prac1", "prac2", "tlte", "act33a", "act33b", "act33c", "inv1a", "inv1b", "inv1c", "inv2a", "inv2b", "inv2c", "q48", "eou1", "eou2", "eou3", "eou4", "eou5", "abq1", "abq2", "abq3", "exam1", "exam2", "exam3", "tk", "hw"];
const results=[]; const errs=[];
(async()=>{
  const b=await chromium.launch();
  async function open(id){
    const n=IDS.indexOf(id)+1; const p=await b.newPage({viewport:{width:1600,height:900}});
    p.on('console',m=>{if(m.type()==='error')errs.push('['+id+'] '+m.text())}); p.on('pageerror',e=>errs.push('['+id+'] PAGEERR '+e.message));
    await p.goto(URL+'?pts=all#s'+n); await p.waitForTimeout(1900); return p;
  }
  async function fill(sl,sel,v){const i=sl.locator(sel+' input').first(); await i.fill(String(v)); await i.press('Enter'); await sl.page().waitForTimeout(120)}
  async function tap(p,sl,k,slotSel,chipSel){await sl.locator(chipSel+'[data-k="'+k+'"]').click(); await sl.locator(slotSel+'[data-k="'+k+'"]').click(); await p.waitForTimeout(150)}
  async function T(id,fn){
    let p; try{ p=await open(id); const sl=p.locator('.slide.on'); const r=await fn(p,sl); let fit=r===false?'':await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: nothing may leave the stage: '+fit:'ok')]) }catch(e){ results.push([id,'FAIL: '+e.message.split('\n')[0]]) }
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
    return (await sl.locator('.score').textContent()).includes(seq.length+' / '+seq.length)||(await vis(sl.locator('.score')));
  }
  async function rows(sl,list){ for(const [sel,v] of list) await fill(sl,'.nin[data-n="'+sel+'"]',v) }
  const MRx={Cu:63.5,Mg:24,Cl2:71,H2:2,S8:256,O3:48,H2SO4:98,CO2:44,NH3:17,CaCO3:100,'MgSO4.7H2O':246};


  /* helpers specific to this lesson */
  async function mcqAll(p,sl,sel){ const o=sl.locator((sel||'.lq')+' .opt'); const n=await o.count(); for(let i=0;i<n;i++){ try{ await o.nth(i).click({timeout:700}) }catch(e){} await p.waitForTimeout(80) } await p.waitForTimeout(250) }
  async function clsAll(p,sl){ const rows=sl.locator('.cls'); const n=await rows.count(); for(let i=0;i<n;i++){ const r=rows.nth(i); const a=await r.getAttribute('data-a'); await r.locator('button[data-v="'+a+'"]').click(); await p.waitForTimeout(60) } await p.waitForTimeout(250) }
  async function cards(p,sl){ const c=sl.locator('.rcard'); const n=await c.count(); for(let i=0;i<n;i++){ await c.nth(i).click(); await p.waitForTimeout(40) } return (await cnt(sl.locator('.rcard.on')))===n }
  async function matchAll(p,sl){ for(let g=0;g<30;g++){ const chip=sl.locator('#tray .mchip').first(); if(!(await chip.count())) break; const k=await chip.getAttribute('data-k'); const slots=sl.locator('.mslot[data-k="'+k+'"]'); const m=await slots.count(); let done=false; for(let j=0;j<m;j++){ if(!(await slots.nth(j).locator('.mchip').count())){ await chip.click(); await slots.nth(j).click(); await p.waitForTimeout(120); done=true; break } } if(!done) break } await p.waitForTimeout(300) }
  const gb=async(sl)=>await vis(sl.locator('#gb'));
  const num=async(p,sl,id,v)=>{ await fill(sl,'.nin[data-n="'+id+'"]',v) };
  const okc=async(sl,sel)=>(await sl.locator(sel).textContent()).includes('✓');

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  for(const id of ['lead1','tab32','ten','howp','quin'])
    await T(id,async(p,sl)=>{ await mcqAll(p,sl); return await gb(sl) });
  await T('lead2',async(p,sl)=>{ await matchAll(p,sl); return (await gb(sl)) && (await cnt(sl.locator('.mslot .mchip')))===5 });
  for(const id of ['cls32','manatee','cmp','pcmp']) await T(id,async(p,sl)=>{ await clsAll(p,sl); return await gb(sl) });
  await T('terms',async(p,sl)=>cards(p,sl));
  for(const [id,svg] of [['antarctic','#wA'],['kelp','#wK']]) await T(id,async(p,sl)=>{ const k=await cards(p,sl); await sl.locator(svg+' .wn').first().click(); await p.waitForTimeout(150); return k && (await sl.locator('.fb').first().textContent()).includes('يتغذى') });
  for(const id of ['otter1','otter2','act33b','act33c','inv1c','inv2c','q48','eou1','eou2','eou3','eou4','abq1','abq2','abq3','exam2','exam3']) await T(id,async(p,sl)=>cards(p,sl));
  await T('photic',async(p,sl)=>{ await mcqAll(p,sl,'.lq'); await sl.locator('.lay[data-k="deep"]').click(); await p.waitForTimeout(150); return (await sl.locator('#fl').textContent()).includes('المياه العميقة') });
  await T('eq1',async(p,sl)=>{ await matchAll(p,sl); return (await cnt(sl.locator('.mslot .mchip')))===4 && await gb(sl) });
  await T('eq2',async(p,sl)=>{ await matchAll(p,sl); return (await cnt(sl.locator('.mslot .mchip')))===4 && await gb(sl) });
  await T('cpruf',async(p,sl)=>{ await matchAll(p,sl); return (await cnt(sl.locator('.mslot .mchip')))===5 && await gb(sl) });
  await T('hab',async(p,sl)=>{ for(const [k,v] of [['p0',60],['p1',220],['p2',30],['b0',10800],['b1',392]]) await num(p,sl,k,v); return (await cnt(sl.locator('.nin input.ok-b')))===5 && await cards(p,sl) });
  await T('exx',async(p,sl)=>{ await num(p,sl,'x',531); return (await gb(sl)) && await okc(sl,'#xfb') });
  await T('exp',async(p,sl)=>{ await num(p,sl,'pc',4.54); return (await gb(sl)) && await okc(sl,'#pfb') });
  await T('prac1',async(p,sl)=>{ await num(p,sl,'y',3434); await num(p,sl,'r',8.85); return await gb(sl) });
  await T('prac2',async(p,sl)=>{ await sl.locator('.pyo[data-i="0"]').click(); await num(p,sl,'s1',9.43); await num(p,sl,'s2',11.4); await p.waitForTimeout(200); return (await cnt(sl.locator('.nin input.ok-b')))===2 && await okc(sl,'#pyf') && await cards(p,sl) });
  await T('tlte',async(p,sl)=>{ await num(p,sl,'a',11.1); for(const [k,v] of [['b1',20],['b2',10],['b3',5]]) await num(p,sl,k,v); return (await cnt(sl.locator('.nin input.ok-b')))===4 && await cards(p,sl) });
  await T('act33a',async(p,sl)=>{ for(const [k,v] of [['x',13000],['y',300],['z',10],['r',15220],['t',10],['p',1.18]]) await num(p,sl,k,v); return (await cnt(sl.locator('.nin input.ok-b')))===6 });
  await T('inv1a',async(p,sl)=>cards(p,sl)); await T('inv1b',async(p,sl)=>(await cnt(sl.locator('.panel[data-pt]')))===10); await T('inv2a',async(p,sl)=>cards(p,sl)); await T('inv2b',async(p,sl)=>(await cards(p,sl)) && (await cnt(sl.locator('tr[data-pt]')))===5);
  await T('eou5',async(p,sl)=>{ await num(p,sl,'e',11.78); return (await okc(sl,'#ef')) && await cards(p,sl) });
  await T('nursery',async(p,sl)=>{ await mcqAll(p,sl); await num(p,sl,'m',16.67); return (await gb(sl)) && await okc(sl,'#nfb') && await cards(p,sl) });
  await T('exam1',async(p,sl)=>ticket(p,sl,[{opt:3},{num:1.17},{opt:0},{opt:0}]));
  await T('tk',async(p,sl)=>ticket(p,sl,[{opt:1},{num:10},{opt:0},{opt:2}]));
  await T('hw',async(p,sl)=>{ await sl.locator('.sab').first().click(); await sl.locator('.sab').first().click(); return (await sl.locator('.sab').first().textContent()).trim()==='أقترب' });


  /* the infographic-style scene slides: question first (step 0), then every click must change something, the last click shows the whole scene, Previous walks back; nothing may leave the 1280x720 scene */
  const SCENES=['auto','hetero','zoo','pred','prod','factors','chemo','net','abloom','sun','resp','sec','pnum','pbio','pene','bloom'];
  async function openStep(id){ const n=IDS.indexOf(id)+1; const p=await b.newPage({viewport:{width:1600,height:900}}); p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text()))errs.push('['+id+'] '+m.text())}); p.on('pageerror',e=>errs.push('['+id+'] PAGEERR '+e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort()); await p.goto(URL+'#s'+n); await p.waitForTimeout(1500); return p }
  const sig=(p)=>p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot; return Array.from(r.querySelectorAll('[data-s].on')).length+'|'+(r.querySelector('.cap')?r.querySelector('.cap').getAttribute('data-t')||'':'')+'|'+(r.querySelector('.zw')?r.querySelector('.zw').style.transform:'')+'|'+(r.querySelector('.lead.gone')?'g':'') });
  for(const id of SCENES){
    let p; try{
      p=await openStep(id);
      const info=await p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot; const o=Array.from(r.querySelectorAll('.lead .o')); return {n:o.length, ok:o.findIndex(x=>x.getAttribute('data-ok')==='1'), lead:!!r.querySelector('.lead:not(.gone)')} });
      let msg='ok'; if(!info.lead) msg='FAIL: no lead-in question at step 0';
      /* wrong answer, then the right one */
      await p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot; const o=Array.from(r.querySelectorAll('.lead .o')); o.filter(x=>x.getAttribute('data-ok')!=='1')[0].click(); o.filter(x=>x.getAttribute('data-ok')==='1')[0].click() });
      const fb=await p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot; return r.querySelector('.lead .fb').className+'|'+r.querySelector('.lead .o.ok')+'|'+r.querySelectorAll('.lead .o.bad').length });
      if(!/ok\|/.test(fb)||!/\|1$/.test(fb)) msg='FAIL: question feedback '+fb;
      const m=(await p.locator('#where').textContent()).replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).match(/النقاط (\d+)\/(\d+)/); const N=+m[2];
      let prev=await sig(p), same=[];
      for(let i=1;i<=N;i++){ await p.click('#bNext'); await p.waitForTimeout(700); const s2=await sig(p); if(s2===prev) same.push(i); prev=s2 }
      if(same.length) msg='FAIL: clicks that change nothing: '+same.join(',');
      const bad=await p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot, root=r.querySelector('.r'), rb=root.getBoundingClientRect(), k=rb.width/1280, out=[];
        r.querySelectorAll('[data-s].on,.cap,.ttl,.t2,.t3,.cards,.endbar').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width<2||q.height<2||e.closest('.zw')||e.closest('svg')) return; if(q.left<rb.left-2||q.right>rb.right+2||q.top<rb.top-2||q.bottom>rb.bottom+2) out.push((e.className+'').slice(0,20)+' '+Math.round((q.left-rb.left)/k)+','+Math.round((q.top-rb.top)/k)+'-'+Math.round((q.right-rb.left)/k)+','+Math.round((q.bottom-rb.top)/k)) });
        return out.slice(0,3).join(' | ') });
      if(bad) msg='FAIL: leaves the scene: '+bad;
      const cnt2=await p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot; return r.querySelectorAll('.lead.gone').length });
      if(!cnt2) msg='FAIL: question still shown at the last step';
      for(let i=0;i<N;i++){ await p.click('#bPrev'); await p.waitForTimeout(120) }
      const back=await p.evaluate(()=>!!document.querySelector('.slide.on').shadowRoot.querySelector('.lead:not(.gone)'));
      if(!back) msg='FAIL: Previous did not return to the question';
      results.push([id,msg+' (steps '+N+', right answer at '+(info.ok+1)+' of '+info.n+')']);
    }catch(e){ results.push([id,'FAIL: '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('slides tested:',results.length,'of',IDS.length);
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
