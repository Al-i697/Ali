/* Interaction tests for lesson 2-2: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson22.html';
const IDS=['goals','title','roadmap','charge','anatomy','heat','zones','zq','lad','co','slag','pig','bop','impur','alloy','steels','journey','ws21','ws21q2','ws21q3','q29','q212','eou2','eou3','ex1','ex2','ex3','ex4','tk','hw'];
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

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1&&await cnt(sl.locator('.gi'))===5});
  await T('title',async(p,sl)=>{ if(!await mcq(p,sl,'#q')) return false; return await sl.locator('#q .fb').evaluate(e=>/صحيح/.test(e.textContent)) });
  await T('roadmap',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; if(await clickAll(sl,'.tb[data-i]')!==4) return false; return await gb(p,sl)});
  await T('charge',async(p,sl)=>{ if(await clickAll(sl,'.tb[data-i]')!==3) return false; return await sl.locator('#cn').evaluate(e=>/ثلاث مواد/.test(e.textContent)) });
  await T('anatomy',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; if(await cnt(sl.locator('.bdg'))!==7) return false; await sl.locator('.bdg[data-i="5"]').click(); if(!(await sl.locator('#dt').evaluate(e=>e.textContent==='الخبث'))) return false;
    for(let i=0;i<7;i++) await sl.locator('.tb.hot[data-i="'+i+'"]').click(); await p.waitForTimeout(200); return await gb(p,sl)});
  await T('heat',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('zones',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; for(let i=0;i<3;i++) await sl.locator('.tb.hot[data-i="'+i+'"]').click(); await p.waitForTimeout(300); if(await cnt(sl.locator('.tb.zh.on'))!==3) return false; return await gb(p,sl)});
  await T('zq',async(p,sl)=>{ await sl.locator('.mchip[data-k="0"]').click(); await sl.locator('.mslot[data-k="2"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/تذكّر/.test(e.textContent)))) return false;   /* a wrong zone is explained */
    for(const k of ['0','1','2']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('lad',async(p,sl)=>{
    if(!await ladder(p,sl,['أكسيد الحديد (III)','أحادي أكسيد الكربون','حديد','ثاني أكسيد الكربون'],'كربون',[[0,0],[1,0],[2,0],[3,0]],[['Fe2O3','s'],['CO','g'],['Fe','l'],['CO2','g']])) return false;
    for(const [i,n] of [[1,3],[2,2],[3,3]]) for(let k=1;k<n;k++) await sl.locator('.eqx-coef button[data-i="'+i+'"][data-d="1"]').click();
    await p.waitForTimeout(300); return await cnt(sl.locator('.eqx-msg.ok'))>=1});
  await T('co',async(p,sl)=>{ for(let i=0;i<3;i++) await sl.locator('.bdg[data-b="'+i+'"]').click(); await p.waitForTimeout(200); return await cnt(sl.locator('.bdg.seen'))===3&&await sl.locator('#st').evaluate(e=>/يصعد/.test(e.textContent)) });
  await T('slag',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; for(const i of [0,1,2,3]) await sl.locator('.tb.hot[data-i="'+i+'"]').click(); await p.waitForTimeout(250); return await gb(p,sl)});
  await T('pig',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; if(!(await sl.locator('#ck').evaluate(e=>/هشّ/.test(e.textContent)))) return false; await sl.locator('#cr').fill('0.2'); await p.waitForTimeout(250); return await sl.locator('#ck').evaluate(e=>/طري/.test(e.textContent))&&await gb(p,sl)});
  await T('bop',async(p,sl)=>{ for(let i=0;i<3;i++){ await sl.locator('.tb.hot[data-i="'+i+'"]').click(); await p.waitForTimeout(120) } return await sl.locator('#bt').evaluate(e=>/السكب/.test(e.textContent))&&await cnt(sl.locator('.tb.hot.on'))===1 });
  await T('impur',async(p,sl)=>{ await sl.locator('.mchip[data-k="c"]').click(); await sl.locator('.band[data-b="s"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/الكربون يحترق/.test(e.textContent)))) return false;
    const M={c:'g',s:'g',si:'s',p:'s'}; for(const k of Object.keys(M)){ await sl.locator('.mchip[data-k="'+k+'"]').click(); await sl.locator('.band[data-b="'+M[k]+'"]').click(); await p.waitForTimeout(80) }
    if(await cnt(sl.locator('.bchips .mchip'))!==4) return false; return await gb(p,sl)});
  await T('alloy',async(p,sl)=>{ if(await vis(sl.locator('#gb'))) return false; await sl.locator('#push').click(); await p.waitForTimeout(1600); if(await cnt(sl.locator('.atoms.push'))!==2) return false; return await gb(p,sl)});
  await T('steels',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('journey',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('ws21',async(p,sl)=>{ const r=sl.locator('.cls'); await r.nth(0).locator('button[data-v="A"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/راجع الرسم/.test(e.textContent)))) return false;   /* a wrong letter is explained */
    return await cls(p,sl,['E','F','B','C','A','D','G'])});
  await T('ws21q2',async(p,sl)=>ticket(p,sl,5));
  await T('ws21q3',async(p,sl)=>{ for(const k of ['0','1','2']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('q29',async(p,sl)=>ticket(p,sl,3));
  await T('q212',async(p,sl)=>ticket(p,sl,3));
  await T('eou2',async(p,sl)=>ticket(p,sl,4));
  await T('eou3',async(p,sl)=>ticket(p,sl,4));
  await T('ex1',async(p,sl)=>{ for(const k of ['A','B','C']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('ex2',async(p,sl)=>ticket(p,sl,5));
  await T('ex3',async(p,sl)=>ticket(p,sl,5));
  await T('ex4',async(p,sl)=>{ for(const k of ['0','1','2','3']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('tk',async(p,sl)=>{ for(let i=0;i<4;i++){ const q=sl.locator('.tq.cur'); if(i===0) await fill(q,'.nin',3); else if(!(await solve(p,q))) return false; await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) } return await vis(sl.locator('.score')) });
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1&&await cnt(sl.locator('.panel.dark li'))===5});

  if(!ONLY||ONLY.includes('slides')){
    const p=await b.newPage({viewport:{width:1600,height:900}}); await p.goto(URL+'?pts=all'); await p.waitForTimeout(1500);
    const n=await p.evaluate(()=>document.querySelectorAll('#prog > *').length); results.push(['slides',n===30?'ok':'FAIL '+n]); await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(16),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
