/* Interaction tests for the alkanes lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson41.html';
const IDS=['goals','what','carbon','bonds','q1to4','hydro','alk','names','formula','draw','names2','states','plot','why','exq26','inert','burn','uses2','q89','dots','homol','map','ws41','ws42','eou','past1','past2','final','hw'];
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

  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('what',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('.opt').nth(0).click(); return await gb(p,sl)});
  await T('carbon',async(p,sl)=>{for(let i=0;i<4;i++) await sl.locator('.arm').nth(i).click(); const c=await sl.locator('#cnt').textContent(); return c.trim()==='4'&&await gb(p,sl)});
  await T('bonds',async(p,sl)=>{for(const k of ['a','b','c','d','e']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('q1to4',async(p,sl)=>ticket(p,sl,[{opt:1},{num:4},{opt:0},{opt:1}]));
  await T('hydro',async(p,sl)=>{const r=sl.locator('.cls'); const ans=['s','s','u','u']; for(let i=0;i<4;i++) await r.nth(i).locator('button[data-v="'+ans[i]+'"]').click(); return await gb(p,sl)});
  await T('alk',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('names',async(p,sl)=>{for(let i=0;i<5;i++) await sl.locator('[data-st="n"] button[data-d="1"]').click(); const t=await sl.locator('#nm').textContent(); return t.includes('هكس')&&(await sl.locator('#fm').textContent()).includes('14')&&await gb(p,sl)});
  await T('formula',async(p,sl)=>{await fill(sl,'.nin[data-n="h5"]',12); await fill(sl,'.nin[data-n="h8"]',18); await fill(sl,'.nin[data-n="h10"]',22); await fill(sl,'.nin[data-n="c20"]',9); await sl.locator('.opt').nth(2).click(); return await gb(p,sl)});
  await T('draw',async(p,sl)=>{for(let n=1;n<=4;n++){ await sl.locator('.tab[data-n="'+n+'"]').click(); const k=await cnt(sl.locator('.hslot')); for(let i=0;i<k;i++) await sl.locator('.hslot').nth(i).click({force:true}); if((await sl.locator('#hc').textContent()).trim()!==String(2*n+2)) return false } return await gb(p,sl)});
  await T('names2',async(p,sl)=>{for(const k of ['1','2','3','4']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('states',async(p,sl)=>{await sl.locator('#rt').click(); await p.waitForTimeout(200); const gas=await cnt(sl.locator('.tile.gas')), liq=await cnt(sl.locator('.tile.liq')); return gas===4&&liq===2&&await gb(p,sl)});
  await T('plot',async(p,sl)=>{for(let i=0;i<6;i++) await sl.locator('#nx').click(); if((await cnt(sl.locator('#pl .pt')))!==6) return false; await sl.locator('.opt').nth(0).click(); return await gb(p,sl)});
  await T('why',async(p,sl)=>{for(let i=0;i<5;i++) await sl.locator('[data-st="n"] button[data-d="1"]').click(); if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('exq26',async(p,sl)=>{await sl.locator('#gs .opt').nth(0).click(); await sl.locator('#gs .opt').nth(1).click(); return await gb(p,sl)});
  await T('inert',async(p,sl)=>{await sl.locator('#try').click(); await sl.locator('#try').click(); if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('burn',async(p,sl)=>{const S=[[1,2,1,2],[2,7,4,6],[1,5,3,4],[2,13,8,10]]; for(let i=0;i<4;i++){ await sl.locator('.tab[data-i="'+i+'"]').click(); for(let k=0;k<4;k++) for(let j=1;j<S[i][k];j++) await sl.locator('.coef button[data-k="'+k+'"][data-d="1"]').click(); await p.waitForTimeout(100); if(!(await sl.locator('.fb').first().textContent()).includes('✓')) return false } return await gb(p,sl)});
  await T('uses2',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('.opt').nth(0).click(); await sl.locator('.opt').nth(1).click(); return await gb(p,sl)});
  await T('q89',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:1}]));
  await T('dots',async(p,sl)=>{ for(const m of [1,2]){ await sl.locator('.tab[data-m="'+m+'"]').click(); const k=await cnt(sl.locator('.bd')); for(let i=0;i<k;i++) await sl.locator('.bd').nth(i).click({force:true}) } return await gb(p,sl)});
  await T('homol',async(p,sl)=>{for(let i=0;i<5;i++) await sl.locator('#ad').click(); await fill(sl,'.nin[data-n="d"]',14); if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('map',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('ws41',async(p,sl)=>ticket(p,sl,[{opt:0},{num:125},{opt:0},{opt:0},{opt:1}]));
  await T('ws42',async(p,sl)=>ticket(p,sl,[{opt:1},{opt:1},{opt:0},{opt:0},{opt:1},{opt:1}]));
  await T('eou',async(p,sl)=>{ if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('past1',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:1},{opt:0}]));
  await T('past2',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0},{opt:2},{opt:1}]));
  await T('final',async(p,sl)=>ticket(p,sl,[{num:14},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
