/* Interaction tests for the petroleum lesson: every slide is driven the way a student would use it. Run from the lesson folder: node tools/test.js */
const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson43.html';
const IDS=['goals','types','form','fields','burn','refine','process','tower','order','uses','trend','why','lab','labq','need','define','crack1','crack2','octane','labc','labcq','ws43','ex44','eou4','pastA','pastB','pastC','pastD','final','hw'];
const ONLY=process.argv[2]?process.argv[2].split(','):null;   // node tools/test.js id1,id2 runs only those slides
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

  const O=(n)=>Array.from({length:n},()=>({opt:0}));
  await T('goals',async(p,sl)=>{await sl.locator('.gi').first().click(); return await sl.locator('.gi.done').count()===1});
  await T('types',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('form',async(p,sl)=>{ for(let i=0;i<5;i++) await sl.locator('#nx').click(); await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('fields',async(p,sl)=>{ if(!await cards(sl)) return false; await fill(sl,'.nin[data-n="yr"]',45); return await gb(p,sl)});
  await T('burn',async(p,sl)=>{const S=[[1,2,1,2],[1,5,3,4],[2,13,8,10]]; for(let i=0;i<3;i++){ await sl.locator('.tab[data-i="'+i+'"]').click(); for(let k=0;k<4;k++) for(let j=1;j<S[i][k];j++) await sl.locator('.coef button[data-k="'+k+'"][data-d="1"]').click(); await p.waitForTimeout(100); if(!(await sl.locator('.fb').first().textContent()).includes('✓')) return false } return await gb(p,sl)});
  await T('refine',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('process',async(p,sl)=>{ for(let i=0;i<5;i++) await sl.locator('#nx').click(); await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('tower',async(p,sl)=>{ for(let i=0;i<8;i++) await sl.locator('.lv').nth(i).click(); return await gb(p,sl)});
  await T('order',async(p,sl)=>{for(const k of ['1','2','3','4','5']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('uses',async(p,sl)=>{for(const k of ['gas','gasl','naph','kero','dies','fuel','lube','asph']) await tap(p,sl,k,'.mslot','.mchip'); return await gb(p,sl)});
  await T('trend',async(p,sl)=>{for(let i=0;i<7;i++) await sl.locator('[data-st="n"] button[data-d="1"]').click(); if(!await cards(sl)) return false; return await gb(p,sl)});
  await T('why',async(p,sl)=>ticket(p,sl,O(5)));
  await T('lab',async(p,sl)=>{ const seq=['h','h','h','s','h','h','s','h','h','s','h','h']; for(const a of seq){ await sl.locator(a==='h'?'#ht':'#sw').click(); await p.waitForTimeout(80) } return await gb(p,sl)});
  await T('labq',async(p,sl)=>ticket(p,sl,O(7)));
  await T('need',async(p,sl)=>{ await sl.locator('#sd').click(); for(let i=0;i<3;i++){ await sl.locator('.tq.cur .opt').nth(0).click(); await p.waitForTimeout(120); await sl.locator('#tkn').click(); await p.waitForTimeout(120) } return await gb(p,sl)});
  await T('define',async(p,sl)=>{ if(!await cards(sl)) return false; await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('crack1',async(p,sl)=>{ await sl.locator('[data-h="a"]').click({force:true}); await sl.locator('[data-h="b"]').click({force:true}); await sl.locator('#qp .opt').nth(0).click(); return await gb(p,sl)});
  await T('crack2',async(p,sl)=>{ for(let i=0;i<3;i++) await sl.locator('[data-st="n"] button[data-d="1"]').click(); await fill(sl,'.nin[data-n="c4"]',4); await fill(sl,'.nin[data-n="h8"]',8); return await gb(p,sl)});
  await T('octane',async(p,sl)=>{ for(let i=0;i<6;i++) await sl.locator('#ob .tab').nth(i).click(); await fill(sl,'.nin[data-n="tot"]',6); return await gb(p,sl)});
  await T('labc',async(p,sl)=>{ for(let k=0;k<8;k++){ await sl.locator('#sl button[data-k="'+k+'"]').click(); await p.waitForTimeout(80) } return await gb(p,sl)});
  await T('labcq',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0},{opt:0},{num:6}]));
  await T('ws43',async(p,sl)=>ticket(p,sl,O(7)));
  await T('ex44',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{num:11},{opt:0},{opt:0}]));
  await T('eou4',async(p,sl)=>ticket(p,sl,O(7)));
  await T('pastA',async(p,sl)=>ticket(p,sl,[{num:26},{num:10},{opt:0},{opt:0},{opt:0},{opt:0},{opt:0}]));
  await T('pastB',async(p,sl)=>ticket(p,sl,O(6)));
  await T('pastC',async(p,sl)=>ticket(p,sl,O(5)));
  await T('pastD',async(p,sl)=>ticket(p,sl,O(4)));
  await T('final',async(p,sl)=>ticket(p,sl,[{opt:0},{opt:0},{opt:0},{opt:0},{num:6}]));
  await T('hw',async(p,sl)=>{await sl.locator('.stp').first().click(); return await cnt(sl.locator('.stp.final'))===1});

  results.forEach(r=>console.log(r[0].padEnd(10),r[1]));
  console.log('ERRORS:',errs.length?errs.join('\n'):'none'); await b.close();
})();
