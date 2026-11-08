/* Interaction tests for the solutions lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson35.html';
const IDS=['goals','mix','vocab','cg','ex37','q316','tk1','cm','ex38','ncv','q317','ex36','tk2','what','tsteps','lab0','lab','labq','method','ex39','ex310','q318','q319','q320','ws35','citric','na2co3','wsburette','wsorg','map','q5','race','past1','past2','final','hw'];
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
    for(const a of seq){ const q=sl.locator('.tq.cur'); if(a.num!==undefined) await fill(q,'.nin',a.num); else await q.locator('.opt[data-i="'+a.opt+'"]').click();
      await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    return await vis(sl.locator('.score'));
  }
  async function rows(sl,list){ for(const [sel,v] of list) await fill(sl,'.nin[data-n="'+sel+'"]',v) }
  const okIn=async(sl)=>await cnt(sl.locator('.nin input.ok-b'));
  const gb=async(p,sl)=>{await p.waitForTimeout(300); return await vis(sl.locator('#gb'))};


  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('mix',async(p,sl)=>{await sl.locator('#mxm').evaluate(e=>{e.value=200; e.dispatchEvent(new Event('input'))}); await sl.locator('#mxv').evaluate(e=>{e.value=2; e.dispatchEvent(new Event('input'))}); const c=await sl.locator('#mxc').textContent(); await sl.locator('#mq .opt[data-i="0"]').click(); await sl.locator('#mq .opt[data-i="2"]').click(); return c.includes('100')&&await gb(p,sl)});
  await T('vocab',async(p,sl)=>{for(const k of ['s','v','m']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('cg',async(p,sl)=>{for(const k of ['t','l','r']) await sl.locator('.cv[data-k="'+k+'"]').click({force:true}); const t=await sl.locator('#tf').textContent(); return t.includes('C')&&await gb(p,sl)});
  await T('ex37',async(p,sl)=>{await rows(sl,[['e1',0.25],['e2',40]]); return (await cnt(sl.locator('.ccell.on')))===3&&await gb(p,sl)});
  await T('q316',async(p,sl)=>{await rows(sl,[['a',2.5],['b',50],['c',0.02]]); return await gb(p,sl)});
  await T('tk1',async(p,sl)=>ticket(p,sl,[{num:40},{opt:0},{num:10},{num:0.5}]));
  await T('cm',async(p,sl)=>{for(const k of ['t','l','r']) await sl.locator('.cv[data-k="'+k+'"]').click({force:true}); if(!(await vis(sl.locator('#mq')))) return false; await sl.locator('#mq .opt[data-i="0"]').click(); await sl.locator('#mq .opt[data-i="1"]').click(); return await gb(p,sl)});
  await T('ex38',async(p,sl)=>{await rows(sl,[['e1',2.5],['e2',2.5],['e3',1]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('ncv',async(p,sl)=>{await rows(sl,[['e1',0.5],['e2',1.5]]); return (await cnt(sl.locator('.ccell.on')))===3&&await gb(p,sl)});
  await T('q317',async(p,sl)=>{await rows(sl,[['a',2],['b',0.2],['c',1],['d',0.02]]); return await gb(p,sl)});
  await T('ex36',async(p,sl)=>{await rows(sl,[['t1',0.5],['t2',0.25],['t3',0.5],['t4',2],['t5',0.2],['t6',7.5]]); return (await okIn(sl))===6&&await gb(p,sl)});
  await T('tk2',async(p,sl)=>ticket(p,sl,[{num:0.1},{num:0.25},{num:0.2},{opt:0}]));
  await T('what',async(p,sl)=>{for(const k of ['B','F','P','I']){ await sl.locator('.pk[data-k="'+k+'"]').click(); } const hl=await cnt(sl.locator('#wtgI.hl')); return hl===1&&await gb(p,sl)});
  await T('tsteps',async(p,sl)=>{for(const k of [0,1,2,3,4]) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('lab0',async(p,sl)=>{await sl.locator('.sfc[data-ok="0"]').first().click(); for(let i=0;i<3;i++) await sl.locator('.sfc[data-ok="1"]').nth(i).click(); return await gb(p,sl)});
  await T('lab',async(p,sl)=>{
    const R0=[0.0,0.4,1.1], VE=[24.9,24.6,24.5];
    for(let r=0;r<3;r++){
      await sl.locator('#tb1').click(); await fill(sl,'.nin[data-n="i0"]',R0[r]); await p.waitForTimeout(900);
      if(!(await vis(sl.locator('#tb2')))) return false;
      await sl.locator('#tb2').click(); await p.waitForTimeout(150);
      for(let i=0;i<24;i++) await sl.locator('.tadd[data-u="20"]').click();
      const k=Math.round((VE[r]-24)*10); for(let i=0;i<k;i++) await sl.locator('.tadd[data-u="2"]').click();
      await sl.locator('#tstop').click(); await p.waitForTimeout(150);
      await fill(sl,'.nin[data-n="f0"]',(R0[r]+VE[r]).toFixed(2)); await fill(sl,'.nin[data-n="v0"]',VE[r]); await p.waitForTimeout(1300);
    }
    if(!(await vis(sl.locator('#tres')))) return false;
    const rowsN=await cnt(sl.locator('#ttab tbody tr'));
    await sl.locator('#ttab tbody tr').nth(0).click(); await sl.locator('#ttab tbody tr').nth(1).click(); await p.waitForTimeout(900);
    await sl.locator('#ttab tbody tr').nth(1).click(); await sl.locator('#ttab tbody tr').nth(2).click(); await p.waitForTimeout(300);
    await fill(sl,'.nin[data-n="mv"]',24.55); await fill(sl,'.nin[data-n="cc"]',0.1018); return rowsN===3&&await gb(p,sl)});
  await T('labq',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{num:0.1008},{opt:0}]));
  await T('method',async(p,sl)=>{for(const k of [0,1,2]) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('ex39',async(p,sl)=>{await rows(sl,[['e1',0.0025],['e2',0.0025],['e3',0.125]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('ex310',async(p,sl)=>{await rows(sl,[['e1',0.00025],['e2',0.0005],['e3',10]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('q318',async(p,sl)=>{await rows(sl,[['a',0.002],['b',0.5],['c',0.001],['d',0.0441]]); return await gb(p,sl)});
  await T('q319',async(p,sl)=>{await rows(sl,[['e1',0.0025],['e2',0.0025],['e3',12.5]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('q320',async(p,sl)=>{await rows(sl,[['e1',0.1],['e2',0.2],['e3',0.8]]); return (await cnt(sl.locator('.ccell.on')))===4&&await gb(p,sl)});
  await T('ws35',async(p,sl)=>{await rows(sl,[['w1',1.5],['w2',40],['w3',1],['w4',0.01],['w5',0.4],['w6',0.0015],['w7',0.15]]); return (await okIn(sl))===7&&await gb(p,sl)});
  await T('citric',async(p,sl)=>{await rows(sl,[['e1',15],['e2',0.0075],['e3',0.0025],['e4',192]]); return (await cnt(sl.locator('.ccell.on')))===5&&await gb(p,sl)});
  await T('na2co3',async(p,sl)=>{await rows(sl,[['a',0.0175],['b',0.00875],['c',0.9275],['d',1.5725],['e',0.0874],['f',10]]); return (await okIn(sl))===6&&await gb(p,sl)});
  await T('wsburette',async(p,sl)=>{await rows(sl,[['v1',26.5],['v2',25.7],['v3',25.6]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#pk')))) return false; await sl.locator('.pn[data-i="1"]').click(); await sl.locator('.pn[data-i="2"]').click(); await p.waitForTimeout(800); await sl.locator('.pn[data-i="2"]').click(); await sl.locator('.pn[data-i="3"]').click(); await p.waitForTimeout(300); await fill(sl,'#pm .nin',25.65); return await gb(p,sl)});
  await T('wsorg',async(p,sl)=>{await rows(sl,[['a',0.002565],['b',0.002565],['c',0.02565],['d',0.05],['e',0.02435],['f',0.012175],['g',124],['h',2]]); return (await okIn(sl))===8&&await gb(p,sl)});
  await T('map',async(p,sl)=>{for(const g of ['m','v','c']) for(const w of ['m','v','c']){ await sl.locator('.pk[data-g="'+g+'"]').click(); await sl.locator('.pw[data-w="'+w+'"]').click(); await p.waitForTimeout(60) } const on=await cnt(sl.locator('.rbx.on')); return on===5&&await gb(p,sl)});
  await T('q5',async(p,sl)=>{await rows(sl,[['p1',8],['p2',0.2]]); await sl.locator('#x1 .sel button[data-ok="0"]').first().click(); await sl.locator('#x1 .sel button[data-ok="1"]').click(); await sl.locator('#x2 .sel button[data-ok="1"]').click(); await rows(sl,[['p3',0.00236],['p4',0.00472],['p5',0.1888]]); return (await okIn(sl))===5&&await gb(p,sl)});
  await T('race',async(p,sl)=>{
    const A=[16,2,0.01,2,500,0.08,25,1]; for(let i=0;i<8;i++) await fill(sl,'.nin[data-n="r'+i+'"]',A[i]);
    await sl.locator('.team .pm button[data-t="A"][data-d="1"]').click(); await p.waitForTimeout(200);
    return (await cnt(sl.locator('.rc.ok')))===8 && (await sl.locator('#tA').textContent())==='1'});
  await T('past1',async(p,sl)=>{
    await fill(sl,'.nin[data-n="p0_0"]',0.001); await fill(sl,'.nin[data-n="p0_1"]',0.04); await fill(sl,'.nin[data-n="p1_0"]',0.375); await fill(sl,'.nin[data-n="p1_1"]',0.75); await fill(sl,'.nin[data-n="p2_0"]',0.2);
    await sl.locator('.pq[data-i="3"] .sel button').nth(2).click(); await sl.locator('.pq[data-i="4"] .sel button').nth(0).click(); await sl.locator('.pq[data-i="5"] .sel button').nth(1).click();
    await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('past2',async(p,sl)=>{
    await fill(sl,'.nin[data-n="p0_0"]',10); await fill(sl,'.nin[data-n="p1_0"]',2); await fill(sl,'.nin[data-n="p2_0"]',0.08); await sl.locator('.pq[data-i="3"] .sel button').nth(0).click(); await fill(sl,'.nin[data-n="p4_0"]',40); await sl.locator('.pq[data-i="5"] .sel button').nth(0).click();
    await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('final',async(p,sl)=>ticket(p,sl,[{num:0.4},{opt:0},{num:0.125},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
