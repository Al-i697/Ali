/* Interaction tests for the gas-volumes lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson34.html';
const IDS=['goals','who','predict','avog','rtp','tri','ex1','ex2','q312','q313','tk1','gasonly','shrink','matrix','q314','challenge','flow34','q315','zn','mgno3','lab0','lab','labq','ex34a','ex34b','ex34c','race','past1','past2','final','hw'];
const results=[]; const errs=[];
(async()=>{
  const b=await chromium.launch();
  async function open(id){
    const n=IDS.indexOf(id)+1; const p=await b.newPage({viewport:{width:1600,height:900}});
    p.on('console',m=>{if(m.type()==='error')errs.push('['+id+'] '+m.text())}); p.on('pageerror',e=>errs.push('['+id+'] PAGEERR '+e.message));
    await p.goto(URL+'#s'+n); await p.waitForTimeout(1900); return p;
  }
  async function fill(sl,sel,v){const i=sl.locator(sel+' input').first(); await i.fill(String(v)); await i.press('Enter'); await sl.page().waitForTimeout(120)}
  async function tap(p,sl,k,slotSel,chipSel){await sl.locator(chipSel+'[data-k="'+k+'"]').click(); await sl.locator(slotSel+'[data-k="'+k+'"]').click(); await p.waitForTimeout(150)}
  async function T(id,fn){
    let p; try{ p=await open(id); const sl=p.locator('.slide.on'); const r=await fn(p,sl); let fit=r===false?'':await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: nothing may leave the stage after the steps: '+fit:'ok')]) }catch(e){ results.push([id,'FAIL: '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  /* after the steps of a slide, no visible block may stick out of the stage (the stickers and sparkles do not count) */
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
    for(const a of seq){ const q=sl.locator('.tq.cur'); if(a.num!==undefined) await fill(q,'.nin',a.num); else await q.locator('.opt').nth(a.opt).click();
      await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    return await vis(sl.locator('.score'));
  }
  async function rows(sl,list){ for(const [sel,v] of list) await fill(sl,'.nin[data-n="'+sel+'"]',v) }
  const okIn=async(sl)=>await cnt(sl.locator('.nin input.ok-b'));
  const gb=async(p,sl)=>{await p.waitForTimeout(300); return await vis(sl.locator('#gb'))};

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('who',async(p,sl)=>{for(let i=0;i<3;i++) await sl.locator('.clue').nth(i).click(); if((await cnt(sl.locator('.clue.on')))!==3) return false; await sl.locator('.opt').nth(0).click(); await sl.locator('.opt').nth(1).click(); return await gb(p,sl)});
  await T('predict',async(p,sl)=>{await sl.locator('.opt').nth(0).click(); await sl.locator('.opt').nth(3).click(); await p.waitForTimeout(1500); const op=await sl.locator('.gfill').first().evaluate(e=>getComputedStyle(e).opacity); return +op===1 && await gb(p,sl)});
  await T('avog',async(p,sl)=>{await rows(sl,[['av1',44],['av2',30]]); return await gb(p,sl)});
  await T('rtp',async(p,sl)=>{await sl.locator('.tbtn2[data-k="2"]').click(); const hot=await sl.locator('#psvg.hot').count(); await sl.locator('.tbtn2[data-k="0"]').click(); const cold=await sl.locator('#psvg.cold').count(); await sl.locator('#pq .opt').nth(0).click(); return hot===1&&cold===1&&await gb(p,sl)});
  await T('tri',async(p,sl)=>{for(const k of ['V','n','M']) await sl.locator('.cv[data-k="'+k+'"]').click({force:true}); const t=await sl.locator('#tf').textContent(); return t.includes('V')&&await gb(p,sl)});
  await T('ex1',async(p,sl)=>{await rows(sl,[['v1',2.88],['v2',2880]]); return (await cnt(sl.locator('.ccell.on')))===3 && await gb(p,sl)});
  await T('ex2',async(p,sl)=>{await rows(sl,[['w1',0.2],['w2',0.0083]]); return (await cnt(sl.locator('.ccell.on')))===3 && await gb(p,sl)});
  await T('q312',async(p,sl)=>{await rows(sl,[['a',36000],['b',1440],['c',12000]]); return await gb(p,sl)});
  await T('q313',async(p,sl)=>{await rows(sl,[['a',0.02],['b',2],['c',0.07]]); return await gb(p,sl)});
  await T('tk1',async(p,sl)=>ticket(p,sl,[{num:12},{num:0.25},{opt:0},{num:0.005}]));
  await T('gasonly',async(p,sl)=>{await sl.locator('#gsl').evaluate(e=>{e.value=30; e.dispatchEvent(new Event('input'))}); const v=await sl.locator('#gsv').textContent(); await fill(sl,'.nin',30); return v==='30 mL'&&await gb(p,sl)});
  await T('shrink',async(p,sl)=>{await sl.locator('#srun').click(); await p.waitForTimeout(1500); if(!(await vis(sl.locator('#s1')))) return false; const g=await cnt(sl.locator('.mol.gone')), pr=await cnt(sl.locator('.prod.on')); await sl.locator('#s1 .opt').nth(0).click(); await sl.locator('#s1 .opt').nth(1).click(); await p.waitForTimeout(300); if(!(await vis(sl.locator('#s2')))) return false; await sl.locator('#s2 .opt').nth(0).click(); return g===3&&pr===2&&await gb(p,sl)});
  await T('matrix',async(p,sl)=>{await rows(sl,[['m1',48],['m2',15],['m3',15],['m4',200],['m5',12],['m6',6],['m7',75],['m8',60],['m9',4],['m10',20],['m11',16]]); return (await okIn(sl))===11&&await gb(p,sl)});
  await T('q314',async(p,sl)=>{await rows(sl,[['a1',1],['a2',2],['b1',80],['b2',50],['b3',60],['c1',4.29],['c2',8.57],['c3',12.86]]); return (await okIn(sl))===8&&await gb(p,sl)});
  await T('challenge',async(p,sl)=>{await sl.locator('.frm .opt').nth(1).click(); await sl.locator('.frm .opt').nth(0).click(); await p.waitForTimeout(300); if(!(await vis(sl.locator('#qn')))) return false; const go=await cnt(sl.locator('#cbars.go')); await rows(sl,[['n1',60],['n2',20]]); await p.waitForTimeout(300); return go===1&&await vis(sl.locator('#defs'))});
  await T('flow34',async(p,sl)=>{for(const g of ['m','v']) for(const w of ['m','v']){ await sl.locator('.pk[data-g="'+g+'"]').click(); await sl.locator('.pw[data-w="'+w+'"]').click(); await p.waitForTimeout(80) } const on=await cnt(sl.locator('.rbx.on')); return on===5&&await gb(p,sl)});
  await T('q315',async(p,sl)=>{await rows(sl,[['s1',0.0217],['s2',0.0109],['s3',261]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('zn',async(p,sl)=>{await rows(sl,[['z1',0.0615],['z2',0.0615],['z3',1477]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('mgno3',async(p,sl)=>{await rows(sl,[['g1',0.02],['g2',960],['g3',240],['h1',48],['h2',12]]); return (await okIn(sl))===5&&await gb(p,sl)});
  await T('lab0',async(p,sl)=>{await sl.locator('.sfc[data-ok="0"]').first().click(); for(let i=0;i<3;i++) await sl.locator('.sfc[data-ok="1"]').nth(i).click(); return await gb(p,sl)});
  await T('lab',async(p,sl)=>{
    const runs=[[5,85],[1,17],[2,34],[3,50]];
    for(const [L,v] of runs){
      await sl.locator('.lenb[data-l="'+L+'"]').click(); await sl.locator('#lvgo').click(); await p.waitForTimeout(3000);
      if(!(await vis(sl.locator('#lvread')))) return false;
      await fill(sl,'#lvread .nin',v); await p.waitForTimeout(1300);
    }
    const rowsN=await cnt(sl.locator('#lvtab tbody tr')), dots=await cnt(sl.locator('#lvplot circle'));
    if(!(await vis(sl.locator('#lvq')))) return false;
    await sl.locator('#lvq .opt').nth(0).click(); return rowsN===4&&dots===4&&await gb(p,sl)});
  await T('labq',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{num:0.0017},{num:0.041}]));
  await T('ex34a',async(p,sl)=>{await fill(sl,'.nin',82); await p.waitForTimeout(300); if(!(await vis(sl.locator('#rsn')))) return false; await sl.locator('.rsb[data-i="4"]').click(); for(const i of [0,1,2,3]) await sl.locator('.rsb[data-i="'+i+'"]').click(); return await gb(p,sl)});
  await T('ex34b',async(p,sl)=>{await rows(sl,[['b1',0.00342],['b2',0.082],['b3',0.41]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('ex34c',async(p,sl)=>{for(const k of [0,1,2,3,4,5]) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('race',async(p,sl)=>{
    const A=[12,0.05,15,20,2400,1200,1.3,7.2]; for(let i=0;i<8;i++) await fill(sl,'.nin[data-n="r'+i+'"]',A[i]);
    await sl.locator('.team .pm button[data-t="A"][data-d="1"]').click(); await p.waitForTimeout(200);
    return (await cnt(sl.locator('.rc.ok')))===8 && (await sl.locator('#tA').textContent())==='1'});
  await T('past1',async(p,sl)=>{
    await fill(sl,'.nin[data-n="p0_0"]',5); await fill(sl,'.nin[data-n="p1_0"]',209); await fill(sl,'.nin[data-n="p2_0"]',2.03); await fill(sl,'.nin[data-n="p3_0"]',500); await fill(sl,'.nin[data-n="p4_0"]',0.5); await sl.locator('.pq[data-i="5"] .sel button').nth(0).click();
    await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('past2',async(p,sl)=>{
    await sl.locator('.pq[data-i="0"] .sel button').nth(0).click(); await fill(sl,'.nin[data-n="p1_0"]',6); await fill(sl,'.nin[data-n="p2_0"]',0.1); await fill(sl,'.nin[data-n="p3_0"]',30); await fill(sl,'.nin[data-n="p3_1"]',20); await fill(sl,'.nin[data-n="p4_0"]',600); await sl.locator('.pq[data-i="5"] .sel button').nth(0).click();
    await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('final',async(p,sl)=>ticket(p,sl,[{num:120},{opt:0},{num:40},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
