/* Interaction tests for the Grade-6 filtration lesson: every slide is driven the way a student or the teacher would use it. Run from the lesson folder: node tools/test.js [id1,id2] */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lessons634.html';
const IDS=['goals','prior','hook','paper','fold','labA','labB','obs','q12','q34','apps','sand','ex34','salt','final','hw'];
const ONLY=process.argv[2]?process.argv[2].split(','):null;
const results=[]; const errs=[];
(async()=>{
  const b=await chromium.launch();
  async function open(id,all){
    const n=IDS.indexOf(id)+1; const p=await b.newPage({viewport:{width:1600,height:900}});
    p.on('console',m=>{if(m.type()==='error')errs.push('['+id+'] '+m.text())}); p.on('pageerror',e=>errs.push('['+id+'] PAGEERR '+e.message));
    await p.goto(URL+(all===false?'':'?pts=all')+'#s'+n); await p.waitForTimeout(1900); return p;
  }
  async function fits(p){ await p.waitForTimeout(400); return await p.evaluate(()=>{
    const st=document.querySelector('.stage').getBoundingClientRect(), k=st.width/1280, bad=[];
    document.querySelectorAll('.slide.on *').forEach(e=>{
      if(e.closest('.stk,.spk,.stk-pop')||(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')) return;
      const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||e.closest('.pt-h')) return;
      const r=e.getBoundingClientRect(); if(r.width<4||r.height<4) return;
      if(r.bottom>st.bottom+2||r.top<st.top-2||r.left<st.left-2||r.right>st.right+2) bad.push((String(e.className).slice(0,18)||e.tagName)+' '+Math.round((r.top-st.top)/k)+'-'+Math.round((r.bottom-st.top)/k));
    }); return bad.slice(0,3).join(' | ') }) }
  async function T(id,fn,all){
    if(ONLY&&!ONLY.includes(id)) return;
    let p; try{ p=await open(id,all); const sl=p.locator('.slide.on'); const r=await fn(p,sl); const fit=await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: leaves the stage: '+fit:'ok')]) }catch(e){ results.push([id,'ERR '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  const cnt=async l=>await l.count(), vis=async l=>await l.isVisible();
  /* slides whose points appear one click at a time: all hidden first, the Next button reveals them one by one, then goes on */
  async function points(p,sl,n){
    const hid=await cnt(sl.locator('.pt-h')); if(hid!==n) return false;
    for(let i=0;i<n;i++){ await p.locator('#bNext').click(); await p.waitForTimeout(250) }
    return (await cnt(sl.locator('.pt-h')))===0;
  }
  await T('goals',async(p,sl)=>{ const g=sl.locator('.gi'); if(await cnt(g)!==2) return false; await g.first().click(); return await cnt(sl.locator('.gi.done'))===1 });
  await T('prior',async(p,sl)=>await points(p,sl,2),false);
  await T('hook',async(p,sl)=>await points(p,sl,3),false);
  await T('paper',async(p,sl)=>await points(p,sl,3),false);
  await T('fold',async(p,sl)=>await points(p,sl,5),false);
  await T('labA',async(p,sl)=>await points(p,sl,4),false);
  await T('labB',async(p,sl)=>{
    /* every mixture: choose, predict, pour; the result says what stays; salt leaves nothing on the paper */
    const want={coffee:true,sand:true,flour:true,chalk:true,salt:false};
    for(const k of Object.keys(want)){
      await sl.locator('.fchip[data-m="'+k+'"]').click(); await p.waitForTimeout(150);
      if(await sl.locator('#fPour').isDisabled()) return false;
      await sl.locator('.fp[data-p="'+(want[k]?'stay':'pass')+'"]').click();
      await sl.locator('#fPour').click(); await p.waitForTimeout(5300);
      const res=sl.locator('#fRes'); if(!(await vis(res))) return false;
      const txt=await res.textContent(); if(!/توقّعك صحيح/.test(txt)) return false;
      const grains=await p.evaluate(()=>document.querySelector('#fPap circle')!==null&&document.querySelector('#fPap').getAttribute('opacity')==='1');
      if(grains!==want[k]) return false;
      await sl.locator('#fAgain').click(); await p.waitForTimeout(250);
    }
    /* a wrong prediction is named as different from the result */
    await sl.locator('.fchip[data-m="salt"]').click(); await sl.locator('.fp[data-p="stay"]').click(); await sl.locator('#fPour').click(); await p.waitForTimeout(5300);
    return /مختلف/.test(await sl.locator('#fRes').textContent());
  });
  await T('obs',async(p,sl)=>await points(p,sl,3),false);
  await T('q12',async(p,sl)=>await points(p,sl,2),false);
  await T('q34',async(p,sl)=>await points(p,sl,2),false);
  await T('apps',async(p,sl)=>await points(p,sl,4),false);
  await T('sand',async(p,sl)=>await points(p,sl,5),false);
  await T('ex34',async(p,sl)=>{
    /* a wrong pair shakes, the right pairs name the part; the answers to the exercise appear at the end */
    await sl.locator('.lchip[data-k="0"]').click(); await sl.locator('.lmk[data-k="1"]').click(); await p.waitForTimeout(150);
    if(await cnt(sl.locator('.lmk.done'))!==0) return false;
    for(let k=0;k<5;k++){ await sl.locator('.lchip[data-k="'+k+'"]').click(); await sl.locator('.lmk[data-k="'+k+'"]').click(); await p.waitForTimeout(120) }
    return (await cnt(sl.locator('.lmk.done')))===5&&(await cnt(sl.locator('.lside .nbox')))===1;
  });
  await T('salt',async(p,sl)=>{
    await sl.locator('.ocard[data-k="2"]').click(); await p.waitForTimeout(150);   /* a wrong first step is refused */
    if(await cnt(sl.locator('.oslot.on'))!==0) return false;
    for(let k=0;k<4;k++){ await sl.locator('.ocard[data-k="'+k+'"]').click(); await p.waitForTimeout(150) }
    return (await cnt(sl.locator('.oslot.on')))===4&&/ممتاز/.test(await sl.locator('.fb').first().textContent());
  });
  await T('final',async(p,sl)=>{
    const seq=[0,2,1,0];
    for(const o of seq){ const q=sl.locator('.tq.cur'); await q.locator('.opt').nth(o).click(); await p.waitForTimeout(150); await sl.locator('#tkn').click(); await p.waitForTimeout(150) }
    const s=sl.locator('.score'); if(!(await vis(s))) return false; return (await s.locator('b').textContent()).replace(/\s/g,'')==='4/4';
  });
  await T('hw',async(p,sl)=>await cnt(sl.locator('.stp'))===2&&await cnt(sl.locator('.panel li'))===5);
  /* the printable worksheet and the student summary open from the lesson index */
  if(!ONLY||ONLY.includes('print')){
    let p; try{ p=await open('goals'); await p.locator('#bIdx').click(); await p.waitForTimeout(300);
      await p.locator('#bWs').click(); await p.waitForTimeout(300); const ws=await p.locator('#wsov.on').count()&&(await p.locator('.wt tbody tr').count())===4;
      await p.locator('.wclose').click(); await p.locator('#bIdx').click(); await p.locator('#bSum').click(); await p.waitForTimeout(300);
      const sm=await p.locator('#sumov.on .sc.def').count(); const goals=await p.locator('#sumov .ss.goals li').count();
      results.push(['print',ws&&goals===2&&sm>=1?'ok':'FAIL ws='+ws+' goals='+goals+' defs='+sm]) }catch(e){ results.push(['print','ERR '+e.message.split('\n')[0]]) }
    if(p) await p.close();
  }
  console.table(results); console.log('errors',errs.length?errs:'none'); console.log(results.every(r=>r[1]==='ok')&&!errs.length?'ALL OK':'SOME FAILED');
  await b.close();
})();
