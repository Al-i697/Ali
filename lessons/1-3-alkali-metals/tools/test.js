/* Interaction tests for lesson 1-3: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson13.html';
const IDS=['goals','prior','lead','atoms','props','store','compare','dens','mp','predict','apply','act','lab','actq','water','formula','balance','ladder','myth','sum','q79','q1013','ex11','ws1','ws2','eou3','ex1','ex2','ex3','ex4','tk','hw'];
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
  /* the choices of every question are shuffled, so a multiple-choice question is answered by trying them until one is right (a wrong choice must not open the closing bar) */
  async function solve(p,box,sl){ const n=await box.locator('.opt').count(); for(let i=0;i<n;i++){ await box.locator('.opt').nth(i).click(); await p.waitForTimeout(120); if(await box.locator('.opt.ok-b').count()) return true; if(sl&&await vis(sl.locator('#gb'))) return false } return false }
  async function ticket(p,sl,seq){
    for(const a of seq){ const q=sl.locator('.tq.cur'); if(a.num!==undefined) await fill(q,'.nin',a.num); else if(!(await solve(p,q))) return false;
      await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    const s=sl.locator('.score'); if(!(await vis(s))) return false;
    return true;   /* choices are shuffled: a first wrong try is possible, so only completion is checked */
  }
  const gb=async(p,sl)=>{await p.waitForTimeout(300); return await vis(sl.locator('#gb'))};
  const cards=async(sl)=>{const n=await cnt(sl.locator('.rcard')); for(let i=0;i<n;i++) await sl.locator('.rcard').nth(i).click(); return (await cnt(sl.locator('.rcard.on')))===n};
  async function cls(p,sl,ans){ const r=sl.locator('.cls'); for(let i=0;i<ans.length;i++) await r.nth(i).locator('button[data-v="'+ans[i]+'"]').click(); return await gb(p,sl) }

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===6});
  await T('prior',async(p,sl)=>{ if(!await solve(p,sl.locator('#q'),sl)) return false; return await gb(p,sl)});
  await T('lead',async(p,sl)=>{
    if(!await solve(p,sl.locator('#q'),sl)) return false; if(await vis(sl.locator('#gb'))) return false;                 /* the group is not found yet */
    await sl.locator('.gbt[data-c="12"]').click(); if(await cnt(sl.locator('.pc.csel'))<5) return false; if(await vis(sl.locator('#gb'))) return false;
    await sl.locator('.gbt[data-c="0"]').click(); if(await cnt(sl.locator('.pc.csel'))!==6) return false;       /* Li Na K Rb Cs Fr: hydrogen is not coloured */
    if(!(await sl.locator('#rd').evaluate(e=>/هذه هي المجموعة/.test(e.textContent)))) return false; return await gb(p,sl)});
  await T('atoms',async(p,sl)=>{ for(let i=0;i<3;i++) await sl.locator('.at').nth(i).click(); await p.waitForTimeout(1100); if(await cnt(sl.locator('.at.gone'))!==3) return false;
    if(!await solve(p,sl.locator('#q'),sl)) return false; return await gb(p,sl)});
  await T('props',async(p,sl)=>{ if(await cnt(sl.locator('.rcard'))!==6) return false; if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('store',async(p,sl)=>{ if(!await solve(p,sl.locator('#q'),sl)) return false; if(await vis(sl.locator('#gb'))) return false; await sl.locator('#air').click(); await p.waitForTimeout(10200);
    const tl=await sl.locator('.tn .tl').allTextContents(); if(!tl.every(x=>/ثانية/.test(x))) return false; return await gb(p,sl)});
  await T('compare',async(p,sl)=>{ for(const k of ['very','less','float','sink','low','high','colourless','coloured']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('dens',async(p,sl)=>{ const w=await sl.locator('#db .bseg').first().evaluate(e=>e.getBoundingClientRect().width); if(!(w>0)) return false; if(!await solve(p,sl.locator('#q'),sl)) return false; return await gb(p,sl)});
  await T('mp',async(p,sl)=>{ await fill(sl,'.nin[data-n="cs"]',50); if(await vis(sl.locator('#gb'))) return false; await fill(sl,'.nin[data-n="cs"]',27); await p.waitForTimeout(1300);
    const w=await sl.locator('#mb .brow').last().locator('.bseg').evaluate(e=>e.getBoundingClientRect().width); if(!(w>0)) return false; return await gb(p,sl)});
  await T('predict',async(p,sl)=>{ await fill(sl,'.nin[data-n="rb"]',5); await fill(sl,'.nin[data-n="rb"]',1.5); await fill(sl,'.nin[data-n="cs"]',640); return await gb(p,sl)});
  await T('apply',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('act',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==8) return false; return await gb(p,sl)});
  await T('lab',async(p,sl)=>{
    const rows={li:['0','0','p'],na:['1','0','p'],k:['1','1','p']};
    for(const k of ['li','na','k']){
      await sl.locator('.dropb[data-k="'+k+'"]').click(); await p.waitForTimeout(4000);
      if(k==='li'){ await sl.locator('tr[data-k="li"] .yn[data-t="melt"] button[data-v="1"]').click(); if(await cnt(sl.locator('tr.ok'))!==0) return false }     /* a wrong observation is not accepted */
      const [m,i2,c]=rows[k]; await sl.locator('tr[data-k="'+k+'"] .yn[data-t="melt"] button[data-v="'+m+'"]').click(); await sl.locator('tr[data-k="'+k+'"] .yn[data-t="ign"] button[data-v="'+i2+'"]').click(); await sl.locator('tr[data-k="'+k+'"] .yn[data-t="col"] button[data-v="'+c+'"]').click();
    }
    return await cnt(sl.locator('tbody tr.ok'))===3&&await cnt(sl.locator('.sk.done'))===2&&await gb(p,sl)});
  await T('actq',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0}]));
  await T('water',async(p,sl)=>{ if(await cnt(sl.locator('.rcard'))!==3) return false; if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('formula',async(p,sl)=>{
    for(const [c,a] of [[0,0],[2,0],[0,1],[0,2],[1,2]]){ await sl.locator('.eqb-ion[data-k="c"][data-i="'+c+'"]').click(); await sl.locator('.eqb-ion[data-k="a"][data-i="'+a+'"]').click(); for(let k=0;k<3;k++) await sl.locator('#eqNext').click(); await p.waitForTimeout(150) }
    return await cnt(sl.locator('.tc.on'))===5&&await gb(p,sl)});
  await T('balance',async(p,sl)=>{
    const SOL=[[4,1,2],[2,2,2,1],[2,2,2,1],[2,2,2,1],[2,2,2,1]];
    await sl.locator('.eqx-lk').first().click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/الرقم السفلي لا يتغيّر/.test(e.textContent)))) return false;     /* subscripts are not coefficients */
    await sl.locator('[data-a="hint"]').click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/استراتيجية/.test(e.textContent)))) return false;
    for(let t=0;t<5;t++){
      await sl.locator('#eqt button[data-i="'+t+'"]').click(); await p.waitForTimeout(150);
      for(let i=0;i<SOL[t].length;i++) for(let k=1;k<SOL[t][i];k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
      await p.waitForTimeout(150); if(!(await sl.locator('.eqx-msg.ok').count())) return false;
    }
    return await cnt(sl.locator('#eqt button.solved'))===5&&await gb(p,sl)});
  await T('ladder',async(p,sl)=>{
    await sl.locator('.eqx-chip[data-w="أكسجين"]').click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/الهيدروجين/.test(e.textContent)))) return false;
    for(const w of ['بوتاسيوم','ماء','هيدروكسيد البوتاسيوم','هيدروجين']) await sl.locator('.eqx-chip[data-w="'+w+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [i,j] of [[0,0],[1,0],[2,0],[3,0],[3,1]]) await sl.locator('.eqx-opts[data-i="'+i+'"] .eqx-opt[data-j="'+j+'"]').click();     /* the first choice for hydrogen (H) is wrong and explained */
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [f,s] of [['K','s'],['H2O','l'],['KOH','aq'],['H2','g']]) await sl.locator('.eqx-opts[data-f="'+f+'"] .eqx-opt[data-s="'+s+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [i,n] of [[0,2],[1,2],[2,2]]) for(let k=1;k<n;k++) await sl.locator('.eqx-bal .eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
    await p.waitForTimeout(300); return await cnt(sl.locator('.eqx-pg.done'))===4});
  await T('myth',async(p,sl)=>cls(p,sl,['f','f','t','f','f','t']));
  await T('sum',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('q79',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0}]));
  await T('q1013',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('ex11',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('ws1',async(p,sl)=>{ const OK=[0,1,2,0,1,1]; const bl=sl.locator('.fb1'); await bl.nth(0).locator('.fopt[data-j="1"]').click();
    for(let i=0;i<6;i++) await bl.nth(i).locator('.fopt[data-j="'+OK[i]+'"]').click(); await p.waitForTimeout(300); return await cnt(sl.locator('.fb1.ok'))===6&&await gb(p,sl)});
  await T('ws2',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; for(const k of ['li','na','k']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('eou3',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('ex1',async(p,sl)=>ticket(p,sl,[{opt:0},{num:8},{opt:0},{opt:0}]));
  await T('ex2',async(p,sl)=>ticket(p,sl,[{opt:1},{opt:0}]));
  await T('ex3',async(p,sl)=>ticket(p,sl,[{opt:3},{opt:1},{opt:2},{opt:0}]));
  await T('ex4',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('tk',async(p,sl)=>ticket(p,sl,[{num:1},{opt:0},{opt:0},{opt:0}]));
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
