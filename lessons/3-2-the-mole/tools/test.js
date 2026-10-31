/* Interaction tests for the mole lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson32.html';
const IDS=['goals','count','weigh','graphite','units','mole','single','ways','formula','t34a','t34b','avo','tk1','ar','ex31','q35','q36','q37','chain','act31','tbl33a','tbl33b','race','tk2','eou2','past1','past2','final','hw'].filter(x=>!(process.env.NOPAST&&x.startsWith('past')));
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
    let p; try{ p=await open(id); const sl=p.locator('.slide.on'); const r=await fn(p,sl); results.push([id,r===false?'FAIL':'ok']) }catch(e){ results.push([id,'FAIL: '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  const cnt=async(l)=>await l.count(), vis=async(l)=>await l.isVisible();
  async function ticket(p,sl,seq){
    for(const a of seq){ const q=sl.locator('.tq.cur'); if(a.num!==undefined) await fill(q,'.nin',a.num); else await q.locator('.opt').nth(a.opt).click();
      await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    return (await sl.locator('.score').textContent()).includes(seq.length+' / '+seq.length)||(await vis(sl.locator('.score')));
  }
  async function rows(sl,list){ for(const [sel,v] of list) await fill(sl,'.nin[data-n="'+sel+'"]',v) }
  const MRx={Cu:63.5,Mg:24,Cl2:71,H2:2,S8:256,O3:48,H2SO4:98,CO2:44,NH3:17,CaCO3:100,'MgSO4.7H2O':246};

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('count',async(p,sl)=>{await sl.locator('.opt').nth(2).click(); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('weigh',async(p,sl)=>{
    for(const [i,a] of [[0,30],[1,130],[2,400]]){ await sl.locator('.bag[data-i="'+i+'"]').click(); await fill(sl,'.nin[data-n="w'+i+'"]',a) }
    await p.waitForTimeout(300); return await vis(sl.locator('#gb')) && (await sl.locator('.bag.ok-b').count())===3});
  await T('graphite',async(p,sl)=>{await sl.locator('.opt').nth(1).click(); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('units',async(p,sl)=>{for(const k of ['pair','dozen','ream','mole']) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('mole',async(p,sl)=>{await sl.locator('#rv').click(); await p.waitForTimeout(300); await fill(sl,'.nin[data-n="z"]',21); return (await sl.locator('#zq .fb').textContent()).includes('✓')});
  await T('single',async(p,sl)=>{await sl.locator('.opt').nth(1).click(); await p.waitForTimeout(300); return await vis(sl.locator('#ans'))});
  await T('ways',async(p,sl)=>{for(const k of [0,1,2,3]) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); return await vis(sl.locator('#gb'))});
  await T('formula',async(p,sl)=>{
    await sl.locator('.cv[data-c="m"]').click(); const e1=await sl.locator('#eq').textContent(); await sl.locator('.cv[data-c="M"]').click(); const e2=await sl.locator('#eq').textContent();
    await fill(sl,'.nin[data-n="a"]',36); await fill(sl,'.nin[data-n="b"]',1);
    return e1==='m = n × M' && e2==='M = m ÷ n' && (await sl.locator('.fb').textContent()).includes('✓')});
  await T('t34a',async(p,sl)=>{await rows(sl,[['r0',12],['r1',56],['r2',2],['r3',32]]); await p.waitForTimeout(300); return (await cnt(sl.locator('tr.mr.ok')))===4});
  await T('t34b',async(p,sl)=>{await rows(sl,[['r0',18],['r1',40],['r2',100],['r3',60]]); await p.waitForTimeout(300); return (await cnt(sl.locator('tr.mr.ok')))===4});
  await T('avo',async(p,sl)=>{await sl.locator('.sb[data-i="1"]').click(); const m=await sl.locator('#cmass').textContent(); await sl.locator('.opt').first().click(); await p.waitForTimeout(200); return m==='56 g' && (await cnt(sl.locator('.opt.ok-b')))===1});
  await T('tk1',async(p,sl)=>ticket(p,sl,[{opt:0},{num:100},{opt:2},{opt:1}]));
  await T('ar',async(p,sl)=>{await rows(sl,[['w0',36.5],['w1',98],['w2',180]]); await p.waitForTimeout(200); return (await cnt(sl.locator('.qr.ok')))===3});
  await T('ex31',async(p,sl)=>{await rows(sl,[['a1',40],['a2',1.5],['b1',249.5],['b2',124.75]]); await p.waitForTimeout(200); return (await cnt(sl.locator('.qr.ok')))===2});
  await T('q35',async(p,sl)=>{await rows(sl,[['m0',23],['g0',46],['m1',123.5],['g1',61.75],['m2',213],['g2',852],['m3',249.5],['g3',4.99]]); await p.waitForTimeout(200); return (await cnt(sl.locator('.qr.ok')))===4});
  await T('q36',async(p,sl)=>{await rows(sl,[['n0',0.25],['n1',8],['n2',0.03],['n3','7e-4']]); await p.waitForTimeout(200); return (await cnt(sl.locator('.qr.ok')))===4});
  await T('eou2',async(p,sl)=>{await sl.locator('.opt').nth(0).click(); await sl.locator('.opt').nth(1).click(); await p.waitForTimeout(150); const mc=await cnt(sl.locator('.opt.ok-b')); await rows(sl,[['a1',44],['a2',0.2],['a3',1.204],['a4',2.408]]); await p.waitForTimeout(200); return mc===1 && (await cnt(sl.locator('.qr.ok')))===1});
  await T('q37',async(p,sl)=>{await rows(sl,[['c0',1.505],['e0',23],['c1',4.816],['e1',24],['c2',1.806],['e2',22],['c3',4.214],['e3',20]]); await p.waitForTimeout(200); return (await cnt(sl.locator('.qr.ok')))===4});
  await T('chain',async(p,sl)=>{
    for(const k of [0,1,2]) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(400); if(!(await vis(sl.locator('#ex')))) return false;
    await rows(sl,[['x1',0.5],['x2',3.01]]); return (await cnt(sl.locator('#ex .qr.ok')))===1});
  await T('act31',async(p,sl)=>{await rows(sl,[['a',0.01],['b',0.01]]); await sl.locator('.opt').first().click(); await p.waitForTimeout(300); return await vis(sl.locator('#gb')) && (await cnt(sl.locator('.qr.ok')))===2});
  await T('tbl33a',async(p,sl)=>{
    const R=[['Cu','m',127],['Mg','n',.5],['Cl2','m',35.5],['H2','m',4],['S8','n',2],['O3','m',1.6]];
    for(let i=0;i<R.length;i++){const M=MRx[R[i][0]]; await fill(sl,'.nin[data-n="r'+i+'"]',M); if(R[i][1]==='m') await fill(sl,'.nin[data-n="n'+i+'"]',(R[i][2]/M).toFixed(4)); else await fill(sl,'.nin[data-n="m'+i+'"]',(R[i][2]*M).toFixed(3))}
    await p.waitForTimeout(200); return (await cnt(sl.locator('tr.qr.ok')))===6});
  await T('tbl33b',async(p,sl)=>{
    const R=[['H2SO4','n',2.5],['CO2','n',.4],['NH3','m',25.5],['CaCO3','m',100],['MgSO4.7H2O','m',82]];
    for(let i=0;i<R.length;i++){const M=MRx[R[i][0]]; await fill(sl,'.nin[data-n="r'+i+'"]',M); if(R[i][1]==='m') await fill(sl,'.nin[data-n="n'+i+'"]',(R[i][2]/M).toFixed(4)); else await fill(sl,'.nin[data-n="m'+i+'"]',(R[i][2]*M).toFixed(3))}
    await p.waitForTimeout(200); return (await cnt(sl.locator('tr.qr.ok')))===5});
  await T('race',async(p,sl)=>{
    const A=[117,2,24.5,0.25,48,2,10,3.01]; for(let i=0;i<8;i++) await fill(sl,'.nin[data-n="r'+i+'"]',A[i]);
    await sl.locator('.team .pm button[data-t="A"][data-d="1"]').click(); await p.waitForTimeout(200);
    return (await cnt(sl.locator('.rc.ok')))===8 && (await sl.locator('#tA').textContent())==='1'});
  await T('tk2',async(p,sl)=>ticket(p,sl,[{num:20},{num:0.5},{opt:1},{opt:0}]));
  await T('past1',async(p,sl)=>{await sl.locator('.pq[data-i="0"] .sel button').nth(2).click(); await fill(sl,'.nin[data-n="p1_0"]',1.78); await fill(sl,'.nin[data-n="p2_0"]',160); await fill(sl,'.nin[data-n="p3_0"]',2.03); await fill(sl,'.nin[data-n="p4_0"]',0.504); await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===5});
  await T('past2',async(p,sl)=>{await sl.locator('.pq[data-i="0"] .sel button').nth(0).click(); await sl.locator('.pq[data-i="1"] .sel button').nth(1).click(); await fill(sl,'.nin[data-n="p2_0"]',25); await fill(sl,'.nin[data-n="p3_0"]',0.1); await fill(sl,'.nin[data-n="p4_0"]',1.204); await sl.locator('.pq[data-i="5"] .sel button').nth(1).click(); await p.waitForTimeout(200); return (await cnt(sl.locator('.pq.ok')))===6});
  await T('final',async(p,sl)=>ticket(p,sl,[{num:80},{num:2},{opt:1},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
