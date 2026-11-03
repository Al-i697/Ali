/* Interaction tests for lesson 1-1: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson11.html';
const IDS=['goals','pt','samples','sort','where','struct','bond','compare','dens','mpbp','malle','cond','myth','sum','why','lab','formula','q11','q12','eou1','ex1','ex2','ex3','ex4','tk','hw'];
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

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===6});
  await T('pt',async(p,sl)=>{
    const nm=await cnt(sl.locator('.pc.m')), nn=await cnt(sl.locator('.pc.n')), ns=await cnt(sl.locator('.pc.s'));
    if(!(nm>nn*2&&nn===17&&ns===7)) return false;                      /* most elements are metals */
    await sl.locator('.pt-leg button[data-s="m"]').click(); await sl.locator('.pt-leg button[data-s="n"]').click(); await sl.locator('.pt-leg button[data-s="s"]').click();
    if(!(await sl.locator('#ptw').evaluate(e=>e.classList.contains('sh-m')&&e.classList.contains('sh-n')&&e.classList.contains('sh-s')))) return false;
    await sl.locator('.opt').nth(1).click(); if(await vis(sl.locator('#gb'))) return false;   /* wrong answer: no closing bar */
    await sl.locator('.opt').nth(0).click(); return await gb(p,sl)});
  await T('samples',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; for(let i=0;i<4;i++) await sl.locator('.rn1').nth(i).click(); await p.waitForTimeout(2600);
    if(await cnt(sl.locator('.cell.on'))!==20) return false; if(!(await vis(sl.locator('#q')))) return false; await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('sort',async(p,sl)=>cls(p,sl,['m','n','m','n','m','n']));
  await T('where',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; for(let i=0;i<5;i++) await sl.locator('.na').nth(i).click(); await p.waitForTimeout(1600);
    if(await cnt(sl.locator('.na.gone'))!==5||!(await vis(sl.locator('#q')))) return false; await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('struct',async(p,sl)=>{ await sl.locator('#lg button[data-h="hl-ion"]').click(); if(!(await sl.locator('#sv').evaluate(e=>e.classList.contains('hl-ion')))) return false; await sl.locator('#lg button[data-h="hl-el"]').click(); if(!(await sl.locator('#sv').evaluate(e=>e.classList.contains('hl-el')&&!e.classList.contains('hl-ion')))) return false; return (await cards(sl))&&await gb(p,sl)});
  await T('bond',async(p,sl)=>{ const OK=[1,1,2,1]; const bl=sl.locator('.fb1');
    await bl.nth(0).locator('.fopt[data-j="0"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/تنافر|لتفرّقت/.test(e.textContent)))) return false;   /* a wrong word is explained */
    for(let i=0;i<4;i++) await bl.nth(i).locator('.fopt[data-j="'+OK[i]+'"]').click(); await p.waitForTimeout(300);
    return await cnt(sl.locator('.fb1.ok'))===4&&/تعريف الرابطة/.test(await sl.locator('.fb').first().textContent())});
  await T('compare',async(p,sl)=>cls(p,sl,['m','i','c','m','i','c']));
  await T('dens',async(p,sl)=>{ await fill(sl,'.nin[data-n="d1"]',2); if(await vis(sl.locator('#gb'))) return false; await fill(sl,'.nin[data-n="d1"]',3); return await gb(p,sl)&&await sl.locator('#db').evaluate(e=>e.classList.contains('go'))});
  await T('mpbp',async(p,sl)=>{ const w0=await sl.locator('#mb .bseg').first().evaluate(e=>e.getBoundingClientRect().width); await sl.locator('#tb button[data-k="2"]').click(); await p.waitForTimeout(1300); const w1=await sl.locator('#mb .bseg').first().evaluate(e=>e.getBoundingClientRect().width); if(!(w1>w0)) return false; await sl.locator('#q .opt').nth(0).click(); await sl.locator('#q .opt').nth(1).click(); return await gb(p,sl)});
  await T('malle',async(p,sl)=>{ await sl.locator('#hm').click(); await p.waitForTimeout(1000); const moved=await sl.locator('.shiftrow').first().evaluate(e=>getComputedStyle(e).transform); if(moved==='none'||moved==='matrix(1, 0, 0, 1, 0, 0)') return false;
    if(await sl.locator('#sm.cracked').count()) return false;
    await sl.locator('#tb button[data-k="i"]').click(); await sl.locator('#hm').click(); await p.waitForTimeout(900); if(!(await cnt(sl.locator('#sm.cracked')))) return false; return await gb(p,sl)});
  await T('cond',async(p,sl)=>{ const on0=await cnt(sl.locator('#bulb.on')); await sl.locator('#sw1').click(); await p.waitForTimeout(700); if(on0||!(await cnt(sl.locator('#bulb.on')))) return false;
    await sl.locator('#tb button[data-k="s"]').click(); await sl.locator('#sw1').click(); await p.waitForTimeout(500); if(await cnt(sl.locator('#bulb.on'))) return false;   /* sulfur: the lamp stays off */
    await sl.locator('#tb button[data-k="cu"]').click(); await sl.locator('#sw1').click(); await sl.locator('#ht').click(); await p.waitForTimeout(6500);
    const th=+await sl.locator('#th').getAttribute('height'); if(!(th>40)) return false; await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('myth',async(p,sl)=>cls(p,sl,['f','f','f','f','t']));
  await T('sum',async(p,sl)=>{ if(!await cards(sl)) return false; const im=await sl.locator('.pic').evaluate(e=>e.naturalWidth); if(!(im>100)) return false; return await gb(p,sl)});
  await T('why',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0}]));
  await T('lab',async(p,sl)=>{ const bs=sl.locator('td[data-t] button'); const n=await cnt(bs); for(let i=0;i<n;i++) await sl.locator('td[data-t] button').first().click();
    for(const [i,v] of [[0,1],[1,0],[2,1],[3,0]]) await sl.locator('tbody tr').nth(i).locator('.cl button[data-v="'+v+'"]').click(); await p.waitForTimeout(300);
    return await cnt(sl.locator('tbody tr.ok'))===4&&await cnt(sl.locator('.sk.done'))===2&&await gb(p,sl)});
  await T('formula',async(p,sl)=>{
    for(const [c,a] of [[0,1],[1,1],[0,0],[2,1]]){ await sl.locator('.eqb-ion[data-k="c"][data-i="'+c+'"]').click(); await sl.locator('.eqb-ion[data-k="a"][data-i="'+a+'"]').click(); for(let k=0;k<3;k++) await sl.locator('#eqNext').click(); await p.waitForTimeout(150) }
    if(await cnt(sl.locator('.tc.on'))!==4) return false;
    /* try mode: the mistakes are named */
    await sl.locator('.eqb-ion[data-k="c"][data-i="1"]').click(); await sl.locator('.eqb-ion[data-k="a"][data-i="0"]').click(); await sl.locator('#eqTry').click();
    await sl.locator('.eqb-stepper button[data-s="1"][data-d="1"]').click(); await sl.locator('#eqCheck').click(); const m1=await sl.locator('#eqMsg').textContent(); if(!/على نفسه/.test(m1)) return false;   /* Mg2Cl: no crossing */
    await sl.locator('.eqb-stepper button[data-s="2"][data-d="1"]').click(); await sl.locator('#eqCheck').click(); return await gb(p,sl)});
  await T('q11',async(p,sl)=>{ await sl.locator('#q .opt').nth(1).click(); await sl.locator('#q .opt').nth(0).click(); return await gb(p,sl)});
  await T('q12',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0}]));
  await T('eou1',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('ex1',async(p,sl)=>ticket(p,sl,[{opt:3},{opt:3},{opt:2}]));
  await T('ex2',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:2},{opt:2}]));
  await T('ex3',async(p,sl)=>{ for(const k of ['a','b','c']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('ex4',async(p,sl)=>ticket(p,sl,[{opt:2},{opt:3}]));
  await T('tk',async(p,sl)=>ticket(p,sl,[{num:1},{opt:0},{opt:0},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

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
