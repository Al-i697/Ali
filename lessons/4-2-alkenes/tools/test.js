/* Interaction tests for the alkenes lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson42.html';
const IDS=['goals','recall','what','bondE','formula','names','draw','states','plotE','whyE','react','burnE','lab','labq','br','eqBr','hyd','hydr','conds','q20','uses','compare','map','q1114','q1520','ex42','ex43','eou3','past1','past2','final','hw'];
const ONLY=process.argv[2]?process.argv[2].split(','):null;   // node tools/test.js id1,id2 runs only those slides
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
    if(ONLY&&!ONLY.includes(id)) return;
    let p; try{ p=await open(id); const sl=p.locator('.slide.on'); const r=await fn(p,sl); let fit=r===false?'':await fits(p); results.push([id,r===false?'FAIL':(fit?'FAIL: nothing may leave the stage after the steps: '+fit:'ok')]) }catch(e){ results.push([id,'FAIL: '+String(e.message).split('\n')[0]]) }
    if(p) await p.close();
  }
  /* after the steps of a slide, no visible block may stick out of the stage (the stickers and sparkles do not count) */
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


  const anim=async(p,sl)=>{ for(let i=0;i<2;i++){ await sl.locator('#ann').click(); await p.waitForTimeout(120) } };
  const cls=async(p,sl,A)=>{ const r=sl.locator('.cls'); for(let i=0;i<A.length;i++){ await r.nth(i).locator('button[data-v="'+A[i]+'"]').click(); await p.waitForTimeout(80) } };
  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('recall',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{num:18},{opt:1}]));
  await T('what',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('.opt').nth(0).click(); return await gb(p,sl)});
  await T('bondE',async(p,sl)=>{for(let i=0;i<6;i++) await sl.locator('.arm').nth(i).click(); const c=await sl.locator('#cnt').textContent(); return c.trim()==='6'&&await gb(p,sl)});
  await T('formula',async(p,sl)=>{for(let i=0;i<4;i++) await sl.locator('[data-st="n"] button[data-d="1"]').click(); const t=await sl.locator('#gf').textContent(); if(!t.includes('12')) return false; await fill(sl,'.nin[data-n="h4"]',8); await fill(sl,'.nin[data-n="h5"]',10); await fill(sl,'.nin[data-n="h10"]',20); return await gb(p,sl)});
  await T('names',async(p,sl)=>{for(const k of ['2','3','4']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('draw',async(p,sl)=>{for(let n=2;n<=4;n++){ await sl.locator('.tab[data-n="'+n+'"]').click(); const k=await cnt(sl.locator('.hslot')); for(let i=0;i<k;i++) await sl.locator('.hslot').nth(i).click({force:true}); if((await sl.locator('#hc').textContent()).trim()!==String(2*n)) return false } return await gb(p,sl)});
  await T('states',async(p,sl)=>{await sl.locator('#rt').click(); await p.waitForTimeout(200); const gas=await cnt(sl.locator('.tile.gas')), liq=await cnt(sl.locator('.tile.liq')); return gas===3&&liq===2&&await gb(p,sl)});
  await T('plotE',async(p,sl)=>{for(let i=0;i<5;i++) await sl.locator('#nx').click(); if((await cnt(sl.locator('#pl .pt')))!==5) return false; await sl.locator('.opt').nth(0).click(); return await gb(p,sl)});
  await T('whyE',async(p,sl)=>{for(let i=0;i<4;i++) await sl.locator('[data-st="n"] button[data-d="1"]').click(); if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('react',async(p,sl)=>{ await anim(p,sl); await cls(p,sl,['c','a','a','a']); return await gb(p,sl)});
  await T('burnE',async(p,sl)=>{const S=[[1,3,2,2],[2,9,6,6],[1,6,4,4]]; for(let i=0;i<3;i++){ await sl.locator('.tab[data-i="'+i+'"]').click(); for(let k=0;k<4;k++) for(let j=1;j<S[i][k];j++) await sl.locator('.coef button[data-k="'+k+'"][data-d="1"]').click(); await p.waitForTimeout(100); if(!(await sl.locator('.fb').first().textContent()).includes('✓')) return false } return await gb(p,sl)});
  await T('lab',async(p,sl)=>{ for(const k of ['A','B','C','D']){ await sl.locator('.bot[data-s="'+k+'"]').click(); await sl.locator('#shake').click(); await p.waitForTimeout(2000) } const A=['s','u','s','u']; for(let i=0;i<4;i++){ await sl.locator('.obs tr[data-s]').nth(i).locator('.cb .btn[data-v="'+A[i]+'"]').click(); await p.waitForTimeout(80) } return await gb(p,sl)});
  await T('labq',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{num:14},{num:12},{opt:0}]));
  await T('br',async(p,sl)=>{ await anim(p,sl); await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('eqBr',async(p,sl)=>{ for(const k of ['a','b','c']){ await tap(p,sl.locator('#st1'),k,'.mslot','.mchip'); await tap(p,sl.locator('#st2'),k,'.mslot','.mchip') } await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('hyd',async(p,sl)=>{ await anim(p,sl); await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('hydr',async(p,sl)=>{ await anim(p,sl); await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('conds',async(p,sl)=>{for(const k of ['c1','c2','c3','p1','p2','p3']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('q20',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0}]));
  await T('uses',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('compare',async(p,sl)=>{ await cls(p,sl,['a','e','e','a','e','b','e','b']); return await gb(p,sl)});
  await T('map',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('q1114',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:1},{opt:0},{opt:0}]));
  await T('q1520',async(p,sl)=>ticket(p,sl,[{num:4},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('ex42',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0},{num:2},{opt:0}]));
  await T('ex43',async(p,sl)=>ticket(p,sl,[{num:42},{opt:0},{num:12},{opt:0},{opt:0}]));
  await T('eou3',async(p,sl)=>ticket(p,sl,[{opt:3},{opt:1},{opt:0},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('past1',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('past2',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('final',async(p,sl)=>ticket(p,sl,[{num:10},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
