/* Interaction tests for lesson 2-1: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson21.html';
const IDS=['goals','hook','natural','minerals','tbl21','cmpd','tbl22','electro','method','roast','reduce','redox','whyc','co','act21','lab21','res21','recyc','alst','magnet','q21','q25','eou','ex1','ex2','ex3','ex4','tk','hw'];
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

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===7});
  await T('hook',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; if(await cnt(sl.locator('.ser .sc'))!==14) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('natural',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('minerals',async(p,sl)=>{ for(const k of ['0','1','2']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('tbl21',async(p,sl)=>{ await sl.locator('.mchip[data-k="1"]').click(); await sl.locator('.mslot[data-k="0"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/المركّب|فكّر/.test(e.textContent)))) return false;   /* a wrong ore is explained */
    for(let k=0;k<7;k++) await tap(p,sl,String(k),'.mslot','.mchip'); return await gb(p,sl)});
  await T('cmpd',async(p,sl)=>cls(p,sl,['o','s','o','c','o','s','s']));
  await T('tbl22',async(p,sl)=>{
    await sl.locator('.mchip[data-k="Na"]').click(); await sl.locator('.band[data-b="c"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/أنشط من الكربون/.test(e.textContent)))) return false;   /* a wrong band is explained */
    const M={Ag:'n',Na:'e',Zn:'c',Cu:'s',Mg:'e',Fe:'c',Au:'n',K:'e',Pb:'c',Al:'e',Ca:'e',Sn:'c'};
    for(const k of Object.keys(M)){ await sl.locator('.mchip[data-k="'+k+'"]').click(); await sl.locator('.band[data-b="'+M[k]+'"]').click(); await p.waitForTimeout(80) }
    if(await cnt(sl.locator('.bchips .mchip'))!==12) return false; return await gb(p,sl)});
  await T('electro',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('method',async(p,sl)=>ticket(p,sl,4));
  const ladder=async(p,sl,chips,bank,forms,states)=>{
    await sl.locator('.eqx-chip[data-w="'+bank+'"]').click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>e.textContent.length>5))) return false;   /* a wrong word is explained */
    for(const w of chips) await sl.locator('.eqx-chip[data-w="'+w+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [i,j] of forms) await sl.locator('.eqx-opts[data-i="'+i+'"] .eqx-opt[data-j="'+j+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [f,s] of states) await sl.locator('.eqx-opts[data-f="'+f+'"] .eqx-opt[data-s="'+s+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(200);
    return true };
  await T('roast',async(p,sl)=>{
    if(!await ladder(p,sl,['كبريتيد الخارصين','أكسجين','أكسيد الخارصين','ثاني أكسيد الكبريت'],'خارصين',[[0,0],[1,0],[2,0],[3,0]],[['ZnS','s'],['O2','g'],['ZnO','s'],['SO2','g']])) return false;
    for(const [i,n] of [[0,2],[1,3],[2,2],[3,2]]) for(let k=1;k<n;k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
    await p.waitForTimeout(300); return await cnt(sl.locator('.eqx-msg.ok'))>=1});
  await T('reduce',async(p,sl)=>{
    if(!await ladder(p,sl,['أكسيد الخارصين','كربون','خارصين','ثاني أكسيد الكربون'],'أكسجين',[[0,0],[1,0],[2,0],[3,0]],[['ZnO','s'],['C','s'],['Zn','s'],['CO2','g']])) return false;
    for(const [i,n] of [[0,2],[2,2]]) for(let k=1;k<n;k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
    await p.waitForTimeout(300); return await cnt(sl.locator('.eqx-msg.ok'))>=1});
  await T('redox',async(p,sl)=>{
    await sl.locator('.rxrow[data-r="1"] .rtk[data-k="c"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/أخذ الأكسجين/.test(e.textContent)))) return false;   /* the carbon is not the reduced one */
    if(await vis(sl.locator('#gb'))) return false;
    await sl.locator('.rxrow[data-r="1"] .rtk[data-k="zno"]').click(); if(await vis(sl.locator('#gb'))) return false;
    await sl.locator('.rxrow[data-r="2"] .rtk[data-k="zno"]').click(); return await gb(p,sl)});
  await T('whyc',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('co',async(p,sl)=>{
    const SOL=[[2,1,2],[2,3,2,2],[2,1,2,1]];
    await sl.locator('.eqx-lk').first().click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>/الرقم السفلي لا يتغيّر/.test(e.textContent)))) return false;
    for(let t=0;t<3;t++){
      await sl.locator('#eqt button[data-i="'+t+'"]').click(); await p.waitForTimeout(150);
      for(let i=0;i<SOL[t].length;i++) for(let k=1;k<SOL[t][i];k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
      await p.waitForTimeout(150); if(!(await sl.locator('.eqx-msg.ok').count())) return false;
    }
    return await cnt(sl.locator('#eqt button.solved'))===3&&await gb(p,sl)});
  await T('act21',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==5) return false; return await gb(p,sl)});
  await T('lab21',async(p,sl)=>{
    if(await vis(sl.locator('#q'))) return false;
    for(let i=0;i<3;i++){ await sl.locator('#xn').click(); await p.waitForTimeout(250) }
    if(!(await sl.locator('#lab.s3').count())) return false;
    if(!(await sl.locator('#ls li.on').count()===4)) return false;
    await p.waitForTimeout(2200); if(!(await vis(sl.locator('#q')))) return false;
    if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('res21',async(p,sl)=>ticket(p,sl,6));
  await T('recyc',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('alst',async(p,sl)=>{ await p.waitForTimeout(1500); const w=await sl.locator('#b1 .bseg').evaluateAll(a=>a.map(e=>e.getBoundingClientRect().width)); if(w.length!==2||!(w[0]>w[1])) return false;
    const v=await sl.locator('#b2 .bseg').evaluateAll(a=>a.map(e=>e.getBoundingClientRect().width)); if(v.length!==2||!(v[0]>v[1]*5)) return false;
    if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('magnet',async(p,sl)=>{
    await sl.locator('#sc button[data-i="1"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/لا ينجذب/.test(e.textContent)))) return false;   /* aluminium is not magnetic */
    if(await vis(sl.locator('#gb'))) return false;
    for(const i of [0,2,5]) await sl.locator('#sc button[data-i="'+i+'"]').click();
    if(await cnt(sl.locator('#pl span'))!==3) return false; return await gb(p,sl)});
  await T('q21',async(p,sl)=>ticket(p,sl,5));
  await T('q25',async(p,sl)=>ticket(p,sl,4));
  await T('eou',async(p,sl)=>ticket(p,sl,2));
  await T('ex1',async(p,sl)=>ticket(p,sl,4));
  await T('ex2',async(p,sl)=>ticket(p,sl,5));
  await T('ex3',async(p,sl)=>ticket(p,sl,5));
  await T('ex4',async(p,sl)=>ticket(p,sl,4));
  await T('tk',async(p,sl)=>{ for(let i=0;i<5;i++){ const q=sl.locator('.tq.cur'); if(i===3) await fill(q,'.nin',8); else if(!(await solve(p,q))) return false; await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) } return await vis(sl.locator('.score')) });
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1&&await cnt(sl.locator('.panel.dark li'))===5});

  if(!ONLY||ONLY.includes('shuffle')){
    const p=await b.newPage({viewport:{width:1600,height:900}}); await p.goto(URL+'?pts=all'); await p.waitForTimeout(1500);
    const n=await p.evaluate(()=>document.querySelectorAll('#prog > *').length); results.push(['slides',n===29?'ok':'FAIL '+n]); await p.close();
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
