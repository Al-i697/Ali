/* Interaction tests for lesson 1-2: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson12.html';
const IDS=['goals','prior','where','group','props','sort','mp','uses','who','white','ions','fe','naoh','cat','catm','myth','sum','ws','q13','eou4','ex1','ex2','ex3','ex4','tk','hw'];
const ONLY=process.argv[2]?process.argv[2].split(','):null;
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
    if(ONLY&&!ONLY.includes(id)) return;
    let p; try{ p=await open(id); const sl=p.locator('.slide.on'); const r=await fn(p,sl); let fit=r===false?'':await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: nothing may leave the stage after the steps: '+fit:'ok')]) }catch(e){ results.push([id,'FAIL: '+String(e.message).split('\n')[0]]) }
    if(p) await p.close();
  }
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
    const s=sl.locator('.score'); if(!(await vis(s))) return false;
    const t=await s.locator('b').textContent(); return t.split('/')[0].trim()===t.split('/')[1].trim();
  }
  const gb=async(p,sl)=>{await p.waitForTimeout(300); return await vis(sl.locator('#gb'))};
  const cards=async(sl)=>{const n=await cnt(sl.locator('.rcard')); for(let i=0;i<n;i++) await sl.locator('.rcard').nth(i).click(); return (await cnt(sl.locator('.rcard.on')))===n};
  async function cls(p,sl,ans){ const r=sl.locator('.cls'); for(let i=0;i<ans.length;i++) await r.nth(i).locator('button[data-v="'+ans[i]+'"]').click(); return await gb(p,sl) }

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===5});
  await T('prior',async(p,sl)=>{ await sl.locator('#q .opt').nth(1).click(); if(await vis(sl.locator('#gb'))) return false; await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('where',async(p,sl)=>{
    if(await cnt(sl.locator('.pc.t'))!==38||await cnt(sl.locator('.pc.cm'))!==12) return false;            /* the block: 10 + 10 + 9 + 9 cells, 12 named common elements */
    await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); if(await vis(sl.locator('#gb'))) return false;   /* the block is not coloured yet: no closing bar */
    await sl.locator('.pt-leg button[data-s="cm"]').click(); await sl.locator('.pt-leg button[data-s="t"]').click();
    if(!(await sl.locator('#ptw').evaluate(e=>e.classList.contains('sh-t')&&e.classList.contains('sh-cm')))) return false;
    await sl.locator('.pc[data-s="Fe"]').click(); if(!(await sl.locator('#pfb').evaluate(e=>/الحديد/.test(e.textContent)&&/انتقالي/.test(e.textContent)))) return false;
    await sl.locator('.pc[data-s="Na"]').click(); if(!(await sl.locator('#pfb').evaluate(e=>/ليس انتقالياً/.test(e.textContent)))) return false;
    return await gb(p,sl)});
  await T('group',async(p,sl)=>{ if(await cnt(sl.locator('.pc.g1'))!==6) return false; if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('props',async(p,sl)=>{ if(await cnt(sl.locator('.rcard'))!==9) return false; if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('sort',async(p,sl)=>cls(p,sl,['s','d','s','d','d','s']));
  await T('mp',async(p,sl)=>{ const w0=await sl.locator('#pb .bseg').first().evaluate(e=>e.getBoundingClientRect().width); await sl.locator('#tb button[data-k="2"]').click(); await p.waitForTimeout(1300); const w1=await sl.locator('#pb .bseg').first().evaluate(e=>e.getBoundingClientRect().width);
    if(!(w0>0&&w1>0)) return false; await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('uses',async(p,sl)=>{ if(!await cards(sl)) return false; if(!(await sl.locator('svg text').first().evaluate(e=>/75/.test(e.textContent)))) return false; return await gb(p,sl)});
  await T('who',async(p,sl)=>{ for(const k of ['ti','w','au','cr','cuni']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('white',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; await sl.locator('#addw').click(); await p.waitForTimeout(3200);
    if(await cnt(sl.locator('.tbx.on'))!==7||!(await vis(sl.locator('#q')))) return false; await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('ions',async(p,sl)=>{ const order=['blue','green','ybrown','green','pink','purple','yellow','orange'];
    await sl.locator('#tray .mchip[data-k="blue"]').first().click(); await sl.locator('.mslot[data-k="pink"]').click(); if(await cnt(sl.locator('.mslot .mchip'))!==0) return false;   /* a wrong colour does not stay */
    for(const k of order){ await sl.locator('#tray .mchip[data-k="'+k+'"]').first().click(); await sl.locator('.mslot[data-k="'+k+'"]:not(:has(.mchip))').first().click(); await p.waitForTimeout(150) }
    return await cnt(sl.locator('.mslot .mchip'))===8&&await gb(p,sl)});
  await T('fe',async(p,sl)=>{
    for(const [c,a] of [[0,0],[1,0],[0,1],[1,1]]){ await sl.locator('.eqb-ion[data-k="c"][data-i="'+c+'"]').click(); await sl.locator('.eqb-ion[data-k="a"][data-i="'+a+'"]').click(); for(let k=0;k<3;k++) await sl.locator('#eqNext').click(); await p.waitForTimeout(150) }
    return await cnt(sl.locator('.tc.on'))===4&&await gb(p,sl)});
  await T('naoh',async(p,sl)=>{ const nt=sl.locator('.nt');
    await nt.nth(0).locator('.addn').click(); await p.waitForTimeout(900); await nt.nth(1).locator('.addn').click(); await p.waitForTimeout(900);
    if(await cnt(sl.locator('.nt.on'))!==2) return false;
    await nt.nth(0).locator('.idr button[data-v="fe3"]').click(); if(await cnt(sl.locator('.nt.ok'))!==0) return false;                 /* wrong answer: explained, not accepted */
    await nt.nth(0).locator('.idr button[data-v="fe2"]').click(); await nt.nth(1).locator('.idr button[data-v="fe3"]').click(); return await cnt(sl.locator('.nt.ok'))===2&&await gb(p,sl)});
  await T('cat',async(p,sl)=>{ const d0=await sl.locator('#pcurve').getAttribute('d'); await sl.locator('#tb button[data-s="1"]').click(); const d1=await sl.locator('#pcurve').getAttribute('d'); if(d0===d1) return false;
    await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('catm',async(p,sl)=>{ for(const k of ['fe','ni','pt','ti','v']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('myth',async(p,sl)=>cls(p,sl,['f','t','f','t','f','f']));
  await T('sum',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('ws',async(p,sl)=>{ if(await cnt(sl.locator('.wsc'))!==10) return false; if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false;   /* both the cards and the names are needed */
    for(const k of ['fe','cu','zn','mn','v']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('q13',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:1},{opt:0},{opt:0}]));
  await T('eou4',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('ex1',async(p,sl)=>ticket(p,sl,[{opt:2},{opt:1},{opt:1},{opt:0}]));
  await T('ex2',async(p,sl)=>ticket(p,sl,[{opt:3},{opt:0},{opt:0},{opt:1}]));
  await T('ex3',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:2},{opt:0}]));
  await T('ex4',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:1}]));
  await T('tk',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1&&await cnt(sl.locator('.panel.dark li'))===5});

  /* the formula builder gives the right formula for every pair of ions (checked against an independent computation) */
  if(!ONLY||ONLY.includes('eqlab')){
    const p=await b.newPage(); await p.goto(URL); await p.waitForTimeout(1200);
    const bad=await p.evaluate(()=>{ const out=[]; function g(a,b){return b?g(b,a%b):a}
      Object.keys(EQL.CAT).forEach(c=>Object.keys(EQL.ANI).forEach(a=>{ const C=EQL.CAT[c],A=EQL.ANI[a], d=g(C.c,A.c), n1=A.c/d, n2=C.c/d;
        const exp=C.s+(n1>1?n1:'')+(A.poly&&n2>1?'('+A.s+')':A.s)+(n2>1?n2:''); const got=EQL.formulaT(C,A,EQL.right(C,A).n1,EQL.right(C,A).n2);
        const elec=(C.c*n1===A.c*n2); if(got!==exp||!elec) out.push(c+a+' '+got+' '+exp) })); return out });
    results.push(['eqlab 66 pairs',bad.length?'FAIL '+bad.join(','):'ok']); await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(16),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
