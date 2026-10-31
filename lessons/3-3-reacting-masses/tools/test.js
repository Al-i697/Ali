/* Interaction tests for the reacting-masses lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson33.html';
const IDS=['goals','sand1','sand2','steps3','mgo','sio2','noo','bacl','tk1','si6','conserve','fes','rule','cuo','fe48','ag','parts','cls','tk2','scaleup','prop','method','ex32','ex33','q38','q39','eou3','solv','lab','labcalc','race','past1','past2','final','hw'];
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

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('sand1',async(p,sl)=>{
    const t0=await sl.locator('.sandtxt').first().textContent();
    await sl.locator('.ctr button[data-t="c"][data-d="1"]').first().click(); const t1=await sl.locator('.sandtxt').first().textContent();
    await sl.locator('.opt').nth(1).click(); await p.waitForTimeout(300);
    return t0!==t1 && await vis(sl.locator('#gb')) && t0.includes('٢')});
  await T('sand2',async(p,sl)=>{
    const d=await sl.locator('.sanddiv').first().textContent();
    await sl.locator('.opt').nth(1).click(); await p.waitForTimeout(300);
    return d.includes('1.5') && await vis(sl.locator('#gb'))});
  await T('steps3',async(p,sl)=>{for(const k of [0,1,2]) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('mgo',async(p,sl)=>{await rows(sl,[['an0',0.01],['an1',0.01],['ar0',1],['ar1',1]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#afq')))) return false; await sl.locator('#afq .opt').nth(0).click(); await p.waitForTimeout(200); return (await sl.locator('.fb').first().textContent()).includes('✓')});
  await T('sio2',async(p,sl)=>{await rows(sl,[['bm1',5.3],['bn0',0.168],['bn1',0.331],['br0',1],['br1',2]]); await p.waitForTimeout(300); await sl.locator('#bfq .opt').nth(1).click(); await p.waitForTimeout(200); return (await sl.locator('.fb').first().textContent()).includes('✓')});
  await T('noo',async(p,sl)=>{await rows(sl,[['cn0',1.03],['cn1',2.03],['cr0',1],['cr1',2]]); await p.waitForTimeout(300); await sl.locator('#cfq .opt').nth(1).click(); await p.waitForTimeout(200); return (await sl.locator('.fb').first().textContent()).includes('✓')});
  await T('bacl',async(p,sl)=>{await rows(sl,[['w1',8.1],['w2',6.9],['w3',1.2],['w4',208],['w5',0.0332],['w6',0.0667],['w7',2]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#q2')))) return false; await sl.locator('#q2 .opt').nth(0).click(); await p.waitForTimeout(300); return (await sl.locator('#q2 .fb').textContent()).includes('✓')});
  await T('tk1',async(p,sl)=>ticket(p,sl,[{opt:1},{num:0.2},{opt:1},{opt:1}]));
  await T('si6',async(p,sl)=>{await sl.locator('.opt').nth(1).click(); await p.waitForTimeout(300); if(!(await vis(sl.locator('#qleft')))) return false; await fill(sl,'.nin',1.3); await p.waitForTimeout(300); return await vis(sl.locator('#defs')) && (await sl.locator('#b6.go').count())===1});
  await T('conserve',async(p,sl)=>{await rows(sl,[['k0',88],['k1',56],['k2',32],['k3',88]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#q1')))) return false; await sl.locator('#q1 .opt').nth(1).click(); await p.waitForTimeout(300); if(!(await vis(sl.locator('#q2')))) return false; await fill(sl,'.nin[data-n="half"]',16); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('fes',async(p,sl)=>{await rows(sl,[['s1',3.2],['s2',1.8],['s3',8.8]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#pick')))) return false; await sl.locator('#pick .opt').nth(0).click(); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('rule',async(p,sl)=>{for(const k of ['max','min']) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); if(!(await vis(sl.locator('#q2')))) return false; await sl.locator('#q2 .opt').nth(1).click(); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('cuo',async(p,sl)=>{await rows(sl,[['c1',0.0625],['c2',79.5],['c3',0.0654],['c4',0.0327],['c5',0.0625]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#pick')))) return false; await sl.locator('#pick .opt').nth(0).click(); await p.waitForTimeout(400); const tf=await sl.locator('.bal .bm').getAttribute('style'); return await vis(sl.locator('#gb')) && /rotate\(-9deg\)/.test(tf)});
  await T('fe48',async(p,sl)=>{await rows(sl,[['f1',0.125],['f2',0.312]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#pick')))) return false; await sl.locator('#pick .opt').nth(1).click(); await p.waitForTimeout(300); await rows(sl,[['w1',32],['w2',11],['w3',6],['w4',17.5]]); await p.waitForTimeout(200); return (await okIn(sl))===6});
  await T('ag',async(p,sl)=>{await rows(sl,[['g1',0.1],['g2',0.1],['g3',0.05]]); await p.waitForTimeout(300); if(!(await vis(sl.locator('#pick')))) return false; await sl.locator('#pick .opt').nth(1).click(); await p.waitForTimeout(300); return (await sl.locator('#pick .fb').textContent()).includes('✓')});
  await T('parts',async(p,sl)=>{await sl.locator('#run').click(); await p.waitForTimeout(2000); if(!(await vis(sl.locator('#pq')))) return false; const g=await cnt(sl.locator('.mol.gone')), pr=await cnt(sl.locator('.prod.on')); await sl.locator('#pq .opt').nth(1).click(); await p.waitForTimeout(300); await fill(sl,'#pq2 .nin',1); await p.waitForTimeout(300); return g===8 && pr===4 && await vis(sl.locator('#gb'))});
  await T('cls',async(p,sl)=>{for(const k of ['Cu','S','CuO','Ag','C','Fe']) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('tk2',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:1},{num:0.05}]));
  await T('scaleup',async(p,sl)=>{await sl.locator('#sl').evaluate(e=>{e.value=20; e.dispatchEvent(new Event('input'))}); const v=await sl.locator('#sv').textContent(); await fill(sl,'.nin',5.6); await p.waitForTimeout(300); return v==='20 t' && await vis(sl.locator('#gb'))});
  await T('prop',async(p,sl)=>{await rows(sl,[['p0',16],['p1',28],['p2',8.5]]); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('method',async(p,sl)=>{for(const k of [0,1,2,3]) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('ex32',async(p,sl)=>{await rows(sl,[['e1',0.34],['e2',0.17],['e3',102],['e4',17.3]]); await p.waitForTimeout(200); return (await okIn(sl))===4 && (await cnt(sl.locator('.ccell.on')))===4});
  await T('ex33',async(p,sl)=>{await rows(sl,[['x1',500],['x2',8.93],['x3',4.47],['x4',715],['x5',0.715]]); await p.waitForTimeout(200); return (await okIn(sl))===5});
  await T('q38',async(p,sl)=>{await rows(sl,[['q1',0.0741],['q2',2],['q3',4],['q4',0.037],['q5',102],['q6',3.78]]); await p.waitForTimeout(200); return (await okIn(sl))===6});
  await T('q39',async(p,sl)=>{await rows(sl,[['a1',35714],['a2',17857],['a3',2.86],['b1',0.162],['b2',0.324],['b3',17.35]]); await p.waitForTimeout(200); return (await okIn(sl))===6});
  await T('eou3',async(p,sl)=>{await rows(sl,[['e1',3],['e2',54],['f1',0.05],['f2',0.025],['f3',2.65]]); await p.waitForTimeout(200); return (await okIn(sl))===5});
  await T('solv',async(p,sl)=>{await rows(sl,[['s1',84],['s2',90],['s3',5265],['t1',45],['t2',4770]]); await p.waitForTimeout(200); return (await okIn(sl))===5});
  await T('lab',async(p,sl)=>{
    for(const i of [0,1,2]) await sl.locator('.sfc[data-ok="1"]').nth(i).click();
    await p.waitForTimeout(1100); await sl.locator('#bAct').click(); await p.waitForTimeout(250); await sl.locator('#bAct').click(); await p.waitForTimeout(250); await sl.locator('#bAct').click(); await p.waitForTimeout(250);
    await fill(sl,'.nin[data-n="m1"]',126.4); await p.waitForTimeout(1000); await sl.locator('#bAct').click(); await p.waitForTimeout(4300);
    const rd=await sl.locator('#lrd').textContent(); await fill(sl,'.nin[data-n="m2"]',125.75); await p.waitForTimeout(900);
    return rd.includes('125.75') && await vis(sl.locator('#gb')) && (await cnt(sl.locator('.lstep.done')))===6});
  await T('labcalc',async(p,sl)=>{await rows(sl,[['l1',0.65],['l2',0.0156],['l3',0.0148]]); await p.waitForTimeout(300); await sl.locator('#q1 .opt').nth(0).click(); await p.waitForTimeout(300); await sl.locator('#q2 .opt').nth(0).click(); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('race',async(p,sl)=>{
    const A=[0.2,1.5,0.4,5.6,10.2,17.6,1.6,20]; for(let i=0;i<8;i++) await fill(sl,'.nin[data-n="r'+i+'"]',A[i]);
    await sl.locator('.team .pm button[data-t="A"][data-d="1"]').click(); await p.waitForTimeout(200);
    return (await cnt(sl.locator('.rc.ok')))===8 && (await sl.locator('#tA').textContent())==='1'});
  await T('past1',async(p,sl)=>{
    await sl.locator('.pq[data-i="0"] .sel button').nth(0).click(); await fill(sl,'.nin[data-n="p1_0"]',1.03); await fill(sl,'.nin[data-n="p1_1"]',2.03); await sl.locator('.pq[data-i="1"] .sel button').nth(1).click();
    await fill(sl,'.nin[data-n="p2_0"]',1.78); await fill(sl,'.nin[data-n="p2_1"]',0.89); await fill(sl,'.nin[data-n="p2_2"]',142.4); await fill(sl,'.nin[data-n="p3_0"]',0.039); await fill(sl,'.nin[data-n="p4_0"]',3.1); await sl.locator('.pq[data-i="5"] .sel button').nth(0).click();
    await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('past2',async(p,sl)=>{
    await sl.locator('.pq[data-i="0"] .sel button').nth(0).click(); await fill(sl,'.nin[data-n="p1_0"]',0.2); await fill(sl,'.nin[data-n="p1_1"]',0.1); await sl.locator('.pq[data-i="1"] .sel button').nth(1).click();
    await fill(sl,'.nin[data-n="p2_0"]',10); await sl.locator('.pq[data-i="3"] .sel button').nth(1).click(); await fill(sl,'.nin[data-n="p4_0"]',1.6); await sl.locator('.pq[data-i="5"] .sel button').nth(0).click();
    await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('final',async(p,sl)=>ticket(p,sl,[{num:8},{opt:0},{num:0.2},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
