/* Interaction tests for lesson 2-4: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson24.html';
const IDS=['goals','hook','terms','rust','tubes','speed','ws22a','barrier','galv','galvlad','scratch','sacr','sacrq','cmp','al1','al2','act23','lab23','ws22b','ws22c','q220','eou5','ex1','ex2','ex3','ex4','ex5','tk','hw'];
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

  const clickAll=async(sl,sel)=>{ const n=await cnt(sl.locator(sel)); for(let i=0;i<n;i++) await sl.locator(sel).nth(i).click(); await sl.page().waitForTimeout(250); return n };
  const ladder=async(p,sl,chips,bank,forms,states)=>{
    await sl.locator('.eqx-chip[data-w="'+bank+'"]').click(); if(!(await sl.locator('.eqx-msg').first().evaluate(e=>e.textContent.length>5))) return false;   /* a wrong word is explained */
    for(const w of chips) await sl.locator('.eqx-chip[data-w="'+w+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [i,j] of forms) await sl.locator('.eqx-opts[data-i="'+i+'"] .eqx-opt[data-j="'+j+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(150);
    for(const [f,s] of states) await sl.locator('.eqx-opts[data-f="'+f+'"] .eqx-opt[data-s="'+s+'"]').click();
    await sl.locator('[data-a="next"]').click(); await p.waitForTimeout(200);
    return true };


  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===9});
  await T('hook',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('terms',async(p,sl)=>cls(p,sl,['c','r','r','c','r']));
  await T('rust',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('tubes',async(p,sl)=>{
    await sl.locator('#wk').click(); await p.waitForTimeout(200); if(await cnt(sl.locator('.tcol.done'))) return false;   /* nothing is revealed before every tube is predicted */
    const A=[1,0,0,2]; for(let i=0;i<4;i++) await sl.locator('.tcol[data-i="'+i+'"] .pb[data-v="'+A[i]+'"]').click();
    await sl.locator('#wk').click(); await p.waitForTimeout(1300);
    if(await cnt(sl.locator('.tcol.hit'))!==4||await cnt(sl.locator('.tcol.r2'))!==1) return false;
    if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('speed',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('ws22a',async(p,sl)=>{ await sl.locator('.tcol[data-i="0"] .pb[data-v="0"]').click(); if(!(await sl.locator('.tcol[data-i="0"] .tm').evaluate(e=>/هواء وماء/.test(e.textContent)))) return false;   /* a wrong choice is explained */
    const A=[1,0,0,1]; for(let i=0;i<4;i++) await sl.locator('.tcol[data-i="'+i+'"] .pb[data-v="'+A[i]+'"]').click(); return await gb(p,sl)});
  await T('barrier',async(p,sl)=>{ await sl.locator('.mchip[data-k="1"]').click(); await sl.locator('.mslot[data-k="0"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/فكّر/.test(e.textContent)))) return false;
    for(const k of ['0','1','2','3','4']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('galv',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('galvlad',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false;
    for(const [i,n] of [[0,2],[2,2]]) for(let k=1;k<n;k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
    await p.waitForTimeout(300); if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('scratch',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; await sl.locator('#b1').click(); await sl.locator('#b2').click(); await p.waitForTimeout(1300); if(!(await vis(sl.locator('#q')))) return false; if(!(await sl.locator('#scw.s2').count())) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('sacr',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; for(let i=0;i<3;i++){ await sl.locator('#sn').click(); await p.waitForTimeout(150) } if(!(await sl.locator('#shw.s3').count())) return false; return await gb(p,sl)});
  await T('sacrq',async(p,sl)=>cls(p,sl,['y','y','n','n','n']));
  await T('cmp',async(p,sl)=>cls(p,sl,['p','g','s','p','s']));
  await T('al1',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; await sl.locator('#gob').click(); await p.waitForTimeout(3000); if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('al2',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('act23',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==6) return false; return await gb(p,sl)});
  await T('lab23',async(p,sl)=>cls(p,sl,['n','n','n','n','m','n','n']));
  await T('ws22b',async(p,sl)=>ticket(p,sl,3));
  await T('ws22c',async(p,sl)=>{ for(const k of ['0','1','2']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('q220',async(p,sl)=>ticket(p,sl,5));
  await T('eou5',async(p,sl)=>ticket(p,sl,4));
  await T('ex1',async(p,sl)=>ticket(p,sl,5));
  await T('ex2',async(p,sl)=>ticket(p,sl,5));
  await T('ex3',async(p,sl)=>ticket(p,sl,5));
  await T('ex4',async(p,sl)=>ticket(p,sl,3));
  await T('ex5',async(p,sl)=>ticket(p,sl,3));
  await T('tk',async(p,sl)=>ticket(p,sl,5));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1&&await cnt(sl.locator('.panel.dark li'))===6});
  if(!ONLY||ONLY.includes('slides')){
    const p=await b.newPage({viewport:{width:1600,height:900}}); await p.goto(URL+'?pts=all'); await p.waitForTimeout(1500);
    const n=await p.evaluate(()=>document.querySelectorAll('#prog > *').length); results.push(['slides',n===29?'ok':'FAIL '+n]); await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(16),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
