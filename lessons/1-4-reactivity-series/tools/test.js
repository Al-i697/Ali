/* Interaction tests for lesson 1-4: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson14.html';
const IDS=['goals','prior','hist','series','chh','tbl14','cold','steam','act12','lab12','acid','disp','oxtab','carbon','gap','act14','lab14','act14c','tbl16','zncu','ionic','ladder4','balance4','act13','q1417','q1820','ex12','ex13','ws13','ladderws','ws14','eou2','eou5','ex1','ex2','ex3','ex4','tk','hw'];
const ONLY=process.argv[2]?process.argv[2].split(','):null;
const results=[]; const errs=[];
(async()=>{
  const b=await chromium.launch();
  async function open(id){
    const n=IDS.indexOf(id)+1; const p=await b.newPage({viewport:{width:1600,height:900}});
    p.on('console',m=>{if(m.type()==='error')errs.push('['+id+'] '+m.text())}); p.on('pageerror',e=>errs.push('['+id+'] PAGEERR '+e.message));
    await p.goto(URL+'?pts=all#s'+n); await p.waitForTimeout(1900); return p;
  }
  async function T(id,fn){
    if(ONLY&&!ONLY.includes(id)) return;
    let p; try{ p=await open(id); const sl=p.locator('.slide.on'); const r=await fn(p,sl); let fit=r===false?'':await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: nothing may leave the stage: '+fit:'ok')]) }catch(e){ results.push([id,'FAIL '+String(e.message).split('\n')[0]]) }
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
  async function fill(sl,sel,v){const i=sl.locator(sel+' input').first(); await i.fill(String(v)); await i.press('Enter'); await sl.page().waitForTimeout(120)}
  async function tap(p,sl,k,slotSel,chipSel){await sl.locator(chipSel+'[data-k="'+k+'"]').click(); await sl.locator(slotSel+'[data-k="'+k+'"]').click(); await p.waitForTimeout(150)}
  /* the options are shuffled, so a multiple-choice question is answered by trying the choices until one is right */
  async function solve(p,box){ const n=await box.locator('.opt').count(); for(let i=0;i<n;i++){ await box.locator('.opt').nth(i).click(); await p.waitForTimeout(120); if(await box.locator('.opt.ok-b').count()) return true } return false }
  async function ticket(p,sl,n){
    for(let i=0;i<n;i++){ const q=sl.locator('.tq.cur'); if(!(await solve(p,q))) return false; await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    return await vis(sl.locator('.score')) }
  const gb=async(p,sl)=>{await p.waitForTimeout(300); return await vis(sl.locator('#gb'))};
  const cards=async(sl)=>{const n=await cnt(sl.locator('.rcard')); for(let i=0;i<n;i++) await sl.locator('.rcard').nth(i).click(); return (await cnt(sl.locator('.rcard.on')))===n};
  async function cls(p,sl,ans){ const r=sl.locator('.cls'); for(let i=0;i<ans.length;i++) await r.nth(i).locator('button[data-v="'+ans[i]+'"]').click(); return await gb(p,sl) }
  async function mcq(p,sl,sel){ return await solve(p,sl.locator(sel)) }

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===6&&await cnt(sl.locator('.ser .sc'))===14});
  await T('prior',async(p,sl)=>{ const o=sl.locator('#q .opt'); for(let i=0;i<3;i++){ await o.nth(i).click(); await p.waitForTimeout(100); if(await sl.locator('#q .opt.ok-b').count()) break } return await gb(p,sl) });
  await T('hist',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('series',async(p,sl)=>{ if(await cnt(sl.locator('#ser .sc'))!==14) return false; for(let i=0;i<4;i++) await sl.locator('#ser .sc').nth(i).click();
    if(!(await sl.locator('#rd').evaluate(e=>/المجموعة/.test(e.textContent)))) return false;
    await sl.locator('#vw button').nth(1).click(); if(!(await sl.locator('#ser.byg').count())) return false;
    if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('chh',async(p,sl)=>cls(p,sl,['y','n','y','n']));
  await T('tbl14',async(p,sl)=>{ for(const k of ['w1','a1','w2','a2','w3','a3']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('cold',async(p,sl)=>{ await sl.locator('#go').click(); await p.waitForTimeout(3600); if(!(await cnt(sl.locator('.rack.run')))) return false; if(!(await vis(sl.locator('#q')))) return false;
    if(await cnt(sl.locator('.rk.seen'))!==6) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('steam',async(p,sl)=>cls(p,sl,['c','s','c','s','s']));
  await T('act12',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==9) return false; return await gb(p,sl)});
  await T('lab12',async(p,sl)=>{
    const w=[1900,1300,1300,900]; for(let s=1;s<=4;s++){ await sl.locator('.lb[data-s="'+s+'"]').click(); await p.waitForTimeout(w[s-1]+100); if(s===1&&!(await p.locator('#ap.s1').count())) return false }
    return await cnt(sl.locator('.sk.done'))===2&&await cnt(sl.locator('#ap.s4'))===1&&await gb(p,sl)});
  await T('acid',async(p,sl)=>{ await sl.locator('#go2').click(); await p.waitForTimeout(3000); if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('disp',async(p,sl)=>cls(p,sl,['y','n','y']));
  await T('oxtab',async(p,sl)=>{ const cells=sl.locator('.pcl[data-r]'); const n=await cnt(cells); if(n!==12) return false; for(let i=0;i<n;i++) await cells.nth(i).click();
    if(await cnt(sl.locator('.pcl.yes'))!==6) return false; await p.waitForTimeout(300); if(!(await vis(sl.locator('#ordp')))) return false;
    for(const k of ['0','1','2','3']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('carbon',async(p,sl)=>cls(p,sl,['y','y','n','n']));
  await T('gap',async(p,sl)=>{ await sl.locator('#cmp').click(); await p.waitForTimeout(1700); const w=await sl.locator('#gb1 .bseg').last().evaluate(e=>e.getBoundingClientRect().width); if(!(w>0)) return false;
    if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; await p.waitForTimeout(300); return await vis(sl.locator('#thm'))&&await gb(p,sl)});
  await T('act14',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==5) return false; return await gb(p,sl)});
  await T('lab14',async(p,sl)=>{ await sl.locator('.pcl[data-r]').first().click(); if(await cnt(sl.locator('.pcl.on'))!==1) return false; await sl.locator('#all').click(); await p.waitForTimeout(400);
    return await cnt(sl.locator('.pcl.on'))===12&&await cnt(sl.locator('.pcl.yes'))===6&&await cnt(sl.locator('.sk.done'))===2&&await gb(p,sl)});
  await T('act14c',async(p,sl)=>{ await sl.locator('.mchip[data-k="1"]').click(); await sl.locator('.mslot[data-k="0"]').click(); if(await cnt(sl.locator('.mslot .mchip'))!==0) return false;       /* a wrong place is refused */
    for(const k of ['0','1','2','3']) await tap(p,sl,k,'.mslot','.mchip'); await p.waitForTimeout(300); if(!(await vis(sl.locator('#qs')))) return false;
    if(!await mcq(p,sl,'#q1')) return false; if(!await mcq(p,sl,'#q2')) return false; return await gb(p,sl)});
  await T('tbl16',async(p,sl)=>{ await sl.locator('#all16').click(); await p.waitForTimeout(400); if(await cnt(sl.locator('.pcl.on'))!==12) return false; if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('zncu',async(p,sl)=>{ for(let i=0;i<3;i++){ await sl.locator('#xn').click(); await p.waitForTimeout(250) } if(!(await sl.locator('#xf.s3').count())) return false;
    if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('ionic',async(p,sl)=>ticket(p,sl,4));
  await T('ladder4',async(p,sl)=>{
    await sl.locator('.eqx-chip[data-w="أكسيد الماغنيسيوم"]').click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/أكسجين/.test(e.textContent)))) return false;
    for(const w of ['ماغنيسيوم','كبريتات النحاس (II)','كبريتات الماغنيسيوم','نحاس']) await sl.locator('.eqx-chip[data-w="'+w+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [i,j] of [[0,0],[1,0],[2,0],[3,0]]) await sl.locator('.eqx-opts[data-i="'+i+'"] .eqx-opt[data-j="'+j+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [f,s] of [['Mg','s'],['CuSO4','aq'],['MgSO4','aq'],['Cu','s']]) await sl.locator('.eqx-opts[data-f="'+f+'"] .eqx-opt[data-s="'+s+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(250);
    if(!(await sl.locator('.eqx-msg.ok').count())) return false;          /* already balanced: the balancer says so */
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    await sl.locator('.eqx-tk[data-k="cu"]').first().click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/يتحوّل|يتغيّر/.test(e.textContent)))) return false;      /* a changing ion is not a spectator */
    await sl.locator('.eqx-tk[data-k="so4"]').nth(0).click(); await sl.locator('.eqx-tk[data-k="so4"]').nth(1).click(); await p.waitForTimeout(150);
    if(await cnt(sl.locator('.eqx-tk.out'))!==2) return false;
    const o=sl.locator('.eqx-ionopt'); const n=await o.count(); for(let i=0;i<n;i++){ await o.nth(i).click(); if(await sl.locator('.eqx-ionopt.okc').count()) break }
    await p.waitForTimeout(300); return await cnt(sl.locator('.eqx-pg.done'))===5});
  await T('balance4',async(p,sl)=>{
    const SOL=[[1,2,1,1],[2,6,2,3],[1,2,1,1],[2,3,1,3],[2,1,2,1],[2,3,1,3],[3,1,3,2]];
    await sl.locator('.eqx-lk').first().click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/الرقم السفلي لا يتغيّر/.test(e.textContent)))) return false;
    for(let t=0;t<7;t++){
      await sl.locator('#eqt button[data-i="'+t+'"]').click(); await p.waitForTimeout(150);
      for(let i=0;i<SOL[t].length;i++) for(let k=1;k<SOL[t][i];k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
      await p.waitForTimeout(150); if(!(await sl.locator('.eqx-msg.ok').count())) return false;
    }
    return await cnt(sl.locator('#eqt button.solved'))===7&&await gb(p,sl)});
  await T('act13',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==3) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('q1417',async(p,sl)=>ticket(p,sl,4));
  await T('q1820',async(p,sl)=>ticket(p,sl,3));
  await T('ex12',async(p,sl)=>ticket(p,sl,6));
  await T('ex13',async(p,sl)=>{
    const rect=await sl.locator('#ch').boundingBox(); const px=(i)=>rect.x+(62+i*79.33)/560*rect.width, py=(v)=>rect.y+(300-(v-20)*4.5)/330*rect.height;
    await p.mouse.click(px(2),py(30)); await p.waitForTimeout(150); if(!(await sl.locator('#cfb').evaluate(e=>/ليست قريبة/.test(e.textContent)))) return false;       /* a wrong reading is refused */
    const D={zn:[21,48,62,71,75,72,70],fe:[21,25,32,38,41,43,44]};
    for(const s of ['zn','fe']){ await sl.locator('#sers button[data-s="'+s+'"]').click(); for(let i=0;i<7;i++){ await p.mouse.click(px(i),py(D[s][i])); await p.waitForTimeout(80) } }
    await p.waitForTimeout(300); if(await cnt(sl.locator('#pts circle'))!==14) return false; if(!(await vis(sl.locator('#q')))) return false;
    if(!await mcq(p,sl,'#q')) return false; await p.waitForTimeout(1700); if(!(await vis(sl.locator('#q2')))) return false; if(!await mcq(p,sl,'#q2')) return false; await p.waitForTimeout(1700); return await gb(p,sl)});
  await T('ws13',async(p,sl)=>ticket(p,sl,8));
  await T('ladderws',async(p,sl)=>{
    await sl.locator('.eqx-chip[data-w="أكسيد الخارصين"]').click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/أكسجين/.test(e.textContent)))) return false;
    for(const w of ['ماغنيسيوم','كبريتات الخارصين','كبريتات الماغنيسيوم','خارصين']) await sl.locator('.eqx-chip[data-w="'+w+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [i,j] of [[0,0],[1,0],[2,0],[3,0]]) await sl.locator('.eqx-opts[data-i="'+i+'"] .eqx-opt[data-j="'+j+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [f,s] of [['Mg','s'],['ZnSO4','aq'],['MgSO4','aq'],['Zn','s']]) await sl.locator('.eqx-opts[data-f="'+f+'"] .eqx-opt[data-s="'+s+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(250);
    if(!(await sl.locator('.eqx-msg.ok').count())) return false;
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    await sl.locator('.eqx-tk[data-k="zn"]').first().click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/يتحوّل|يتغيّر/.test(e.textContent)))) return false;
    await sl.locator('.eqx-tk[data-k="so4"]').nth(0).click(); await sl.locator('.eqx-tk[data-k="so4"]').nth(1).click(); await p.waitForTimeout(150);
    if(await cnt(sl.locator('.eqx-tk.out'))!==2) return false;
    const o=sl.locator('.eqx-ionopt'); const n=await o.count(); for(let i=0;i<n;i++){ await o.nth(i).click(); if(await sl.locator('.eqx-ionopt.okc').count()) break }
    await p.waitForTimeout(300); return await cnt(sl.locator('.eqx-pg.done'))===5});
  await T('ws14',async(p,sl)=>{ await sl.locator('#all4').click(); await p.waitForTimeout(500); if(await cnt(sl.locator('.pcl.on'))!==20) return false; if(await cnt(sl.locator('.pcl.yes'))!==10) return false;
    if(!(await vis(sl.locator('#ordp')))) return false; for(const k of ['0','1','2','3','4']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('eou2',async(p,sl)=>ticket(p,sl,5));
  await T('eou5',async(p,sl)=>{ await sl.locator('#go5').click(); await p.waitForTimeout(2800); if(await cnt(sl.locator('.rk.seen'))!==3) return false; return await ticket(p,sl,4)});
  await T('ex1',async(p,sl)=>ticket(p,sl,5));
  await T('ex2',async(p,sl)=>ticket(p,sl,6));
  await T('ex3',async(p,sl)=>ticket(p,sl,5));
  await T('ex4',async(p,sl)=>ticket(p,sl,3));
  await T('tk',async(p,sl)=>ticket(p,sl,5));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1&&await cnt(sl.locator('.panel.dark li'))===6});

  /* the options of every question are shuffled: there must be no group in which the right answer is always first (checked over all the slides) */
  if(!ONLY||ONLY.includes('shuffle')){
    const p=await b.newPage({viewport:{width:1600,height:900}}); await p.goto(URL+'?pts=all'); await p.waitForTimeout(1500);
    const n=await p.evaluate(()=>document.querySelectorAll('#prog > *').length); results.push(['slides',n===39?'ok':'FAIL '+n]); await p.close();
  }
  /* the formula builder gives the right formula for every pair of ions (checked against an independent computation) */
  if(!ONLY||ONLY.includes('eqlab')){
    const p=await b.newPage(); await p.goto(URL); await p.waitForTimeout(1200);
    const bad=await p.evaluate(()=>{ const out=[]; function g(a,b){return b?g(b,a%b):a}
      Object.keys(EQL.CAT).forEach(c=>Object.keys(EQL.ANI).forEach(a=>{ const C=EQL.CAT[c],A=EQL.ANI[a], d=g(C.c,A.c), n1=A.c/d, n2=C.c/d;
        const exp=C.s+(n1>1?n1:'')+(A.poly&&n2>1?'('+A.s+')':A.s)+(n2>1?n2:''); const got=EQL.formulaT(C,A,EQL.right(C,A).n1,EQL.right(C,A).n2);
        const elec=(C.c*n1===A.c*n2); if(got!==exp||!elec) out.push(c+a+' '+got+' '+exp) })); return out });
    results.push(['eqlab pairs',bad.length?'FAIL '+bad.join(','):'ok']); await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(16),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
