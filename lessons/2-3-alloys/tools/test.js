/* Interaction tests for lesson 2-3: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson23.html';
const IDS=['goals','hook','defn','lay','idn','why','steel','t23','ss','alst','steelq','cmp','brass','bronze','dur','solder','t25','t25c','act22','act22q','data21','ex21','q215','eou4','ex1','ex2','ex3','tk','hw'];
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
  await T('defn',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; return await cls(p,sl,['a','n','a','n','a'])});
  await T('lay',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; await sl.locator('#push').click(); await p.waitForTimeout(1500); if(!(await vis(sl.locator('#q')))) return false; if(!(await sl.locator('.atoms.push').count())) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('idn',async(p,sl)=>{ await sl.locator('.lcol[data-i="0"] .pb[data-v="a"]').click(); if(!(await sl.locator('.lcol[data-i="0"] .lm').evaluate(e=>/فكّر/.test(e.textContent)))) return false;   /* a wrong choice is explained */
    const A=['p','a','a','n']; for(let i=0;i<4;i++) await sl.locator('.lcol[data-i="'+i+'"] .pb[data-v="'+A[i]+'"]').click(); return await gb(p,sl)});
  await T('why',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('steel',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; for(let i=0;i<4;i++){ await sl.locator('#csc button[data-i="'+i+'"]').click(); await p.waitForTimeout(120); if(!(await sl.locator('#cd .cmeter2').count())) return false }
    if(!(await vis(sl.locator('#q')))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('t23',async(p,sl)=>{ await sl.locator('.mchip[data-k="1"]').click(); await sl.locator('.mslot[data-k="0"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/فكّر/.test(e.textContent)))) return false;
    for(const k of ['0','1','2','3']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('ss',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('alst',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('steelq',async(p,sl)=>cls(p,sl,['l','s','s','t','m']));
  await T('cmp',async(p,sl)=>cls(p,sl,['c','l','h','s','l']));
  await T('brass',async(p,sl)=>{ await sl.locator('#bgo').click(); await p.waitForTimeout(200); if(await vis(sl.locator('#q'))) return false;   /* nothing happens before both metals are added */
    await sl.locator('#bcu').click(); await sl.locator('#bzn').click(); await sl.locator('#bgo').click(); await p.waitForTimeout(1600); if(!(await sl.locator('#cr.alloy').count())||!(await vis(sl.locator('#q')))) return false;
    if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('bronze',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('dur',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('solder',async(p,sl)=>{ if(!await cards(sl)) return false; if(await vis(sl.locator('#gb'))) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('t25',async(p,sl)=>{ await sl.locator('.mchip[data-k="1"]').click(); await sl.locator('.mslot[data-k="0"]').click(); if(!(await sl.locator('.fb').first().evaluate(e=>/فكّر/.test(e.textContent)))) return false;
    for(const k of ['0','1','2','3']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('t25c',async(p,sl)=>cls(p,sl,['b','d','s','z','t']));
  await T('act22',async(p,sl)=>{ if(await cnt(sl.locator('.acts li'))!==6) return false; return await gb(p,sl)});
  await T('act22q',async(p,sl)=>{ if(await vis(sl.locator('#q'))) return false; await sl.locator('#mpb').click(); await p.waitForTimeout(1900); if(!(await vis(sl.locator('#q')))) return false; if(!(await sl.locator('#mp.go').count())) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('data21',async(p,sl)=>{ if(await cnt(sl.locator('.dt tbody tr'))!==7) return false; if(!await mcq(p,sl,'#q')) return false; return await gb(p,sl)});
  await T('ex21',async(p,sl)=>ticket(p,sl,5));
  await T('q215',async(p,sl)=>ticket(p,sl,5));
  await T('eou4',async(p,sl)=>ticket(p,sl,6));
  await T('ex1',async(p,sl)=>ticket(p,sl,5));
  await T('ex2',async(p,sl)=>ticket(p,sl,5));
  await T('ex3',async(p,sl)=>ticket(p,sl,4));
  await T('tk',async(p,sl)=>ticket(p,sl,5));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1&&await cnt(sl.locator('.panel.dark li'))===5});
  if(!ONLY||ONLY.includes('slides')){
    const p=await b.newPage({viewport:{width:1600,height:900}}); await p.goto(URL+'?pts=all'); await p.waitForTimeout(1500);
    const n=await p.evaluate(()=>document.querySelectorAll('#prog > *').length); results.push(['slides',n===29?'ok':'FAIL '+n]); await p.close();
  }
  results.forEach(r=>console.log(r[0].padEnd(16),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
