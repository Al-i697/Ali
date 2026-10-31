const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/lesson31.html';
const results=[]; const errs=[];
(async()=>{
  const b=await chromium.launch();
  async function open(n){
    const p=await b.newPage({viewport:{width:1600,height:900}});
    p.on('console',m=>{if(m.type()==='error')errs.push('[s'+n+'] '+m.text())}); p.on('pageerror',e=>errs.push('[s'+n+'] PAGEERR '+e.message));
    await p.goto(URL+'#s'+n); await p.waitForTimeout(1900); return p;
  }
  async function fill(sl,sel,v){const i=sl.locator(sel+' input').first(); await i.fill(String(v)); await i.press('Enter')}
  async function drag(p,from,to){const a=await from.boundingBox(), c=await to.boundingBox();
    await p.mouse.move(a.x+a.width/2,a.y+a.height/2); await p.mouse.down(); await p.mouse.move(a.x+a.width/2+12,a.y+a.height/2+12,{steps:3});
    await p.mouse.move(c.x+c.width/2,c.y+c.height/2,{steps:8}); await p.mouse.up(); await p.waitForTimeout(150)}
  async function T(name,n,fn){
    const p=await open(n); const sl=p.locator('.slide.on');
    try{ const r=await fn(p,sl); results.push([name,r===false?'FAIL':'ok']) }catch(e){ results.push([name,'FAIL: '+e.message.split('\n')[0]]) }
    await p.close();
  }
  const cnt=async(l)=>await l.count();

  await T('npk',3,async(p,sl)=>{
    await sl.locator('.pr[data-i="1"] button[data-d="1"]').click(); await sl.locator('.pr[data-i="1"] button[data-d="1"]').click();
    await sl.locator('#rv').click(); await p.waitForTimeout(300);
    if(!(await cnt(sl.locator('.pr.right')))) return false;
    await fill(sl,'.nin[data-n="n"]',1); await p.waitForTimeout(200);
    return (await sl.locator('#calc .fb').textContent()).includes('✓');
  });
  await T('imp drag',2,async(p,sl)=>{
    for(const k of ['med','agri','env']){ await drag(p,sl.locator('.mchip[data-k="'+k+'"]'),sl.locator('.mslot[data-k="'+k+'"]')) }
    await p.waitForTimeout(200); return (await cnt(sl.locator('.mslot .mchip')))===3 && await sl.locator('#gb').isVisible();
  });
  await T('imp wrong then tap',2,async(p,sl)=>{
    await drag(p,sl.locator('.mchip[data-k="med"]'),sl.locator('.mslot[data-k="agri"]'));
    const bad=(await sl.locator('.fb').textContent()).length>0 && (await cnt(sl.locator('.mslot .mchip')))===0;
    await sl.locator('.mchip[data-k="med"]').click(); await sl.locator('.mslot[data-k="med"]').click(); await p.waitForTimeout(150);
    return bad && (await cnt(sl.locator('.mslot[data-k="med"] .mchip')))===1;
  });
  await T('shop',4,async(p,sl)=>{
    await sl.locator('.yn button[data-a="y"]').click(); await sl.locator('.yn button[data-a="n"]').click(); await p.waitForTimeout(300);
    if(!(await sl.locator('#bt').isVisible())) return false;
    await sl.locator('#cnt').click(); await p.waitForTimeout(3000); return (await cnt(sl.locator('#zr .z')))>=27 && await sl.locator('#sci').isVisible()});
  await T('parts',5,async(p,sl)=>{
    await sl.locator('.spot[data-p="e"]').first().click(); await sl.locator('.spot[data-p="nuc"]').first().click(); await p.waitForTimeout(300);
    return !(await sl.locator('#cp').evaluate(e=>e.classList.contains('hid'))) && !(await sl.locator('#ce').evaluate(e=>e.classList.contains('hid')));
  });
  await T('balance',7,async(p,sl)=>{
    const H=sl.locator('#tr .chip');
    for(let i=0;i<11;i++) await H.click();
    if(await sl.locator('#nx').isVisible()) return false; // not balanced yet
    await drag(p,H,sl.locator('#zR')); await p.waitForTimeout(1600);
    if(!(await sl.locator('#bfb').textContent()).includes('توازنت')) return false;
    await sl.locator('#nx').click(); await p.waitForTimeout(300);
    for(let i=0;i<3;i++) await sl.locator('#tr .chip').click(); await p.waitForTimeout(1600);
    if(!(await sl.locator('#bfb').textContent()).includes('توازنت')) return false;
    await sl.locator('#nx').click(); await p.waitForTimeout(300);
    await sl.locator('#tr .chip').click(); await sl.locator('#tr .chip').click(); await p.waitForTimeout(1600);
    return (await sl.locator('#bfb').textContent()).includes('Ar');
  });
  await T('q32',9,async(p,sl)=>{
    const v=[4,12,16,238]; for(let i=0;i<4;i++) await fill(sl.locator('.panel').nth(i),'.nin',v[i]); await fill(sl,'.nin[data-n="p"]',2.58); await p.waitForTimeout(150);
    return (await cnt(sl.locator('.ok-b')))===5;
  });
  await T('ex31a',25,async(p,sl)=>{const v=[12,3,4,2]; for(let i=0;i<4;i++) await fill(sl.locator('.sent').nth(i),'.nin',v[i]); await p.waitForTimeout(150); return (await cnt(sl.locator('.sent .ok-b')))===4});
  await T('tk1',14,async(p,sl)=>{
    const pick=[1,1,1]; for(let i=0;i<3;i++){ await sl.locator('.tq.cur .opt').nth(pick[i]).click(); await sl.locator('#tkn').click(); await p.waitForTimeout(250) }
    await fill(sl,'.tq.cur .nin',10.2); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    return (await sl.locator('.score b').textContent()).trim()==='4 / 4';
  });
  await T('mr',16,async(p,sl)=>{
    const C=[[2],[2,1],[1,1]], M=[2,18,58.5];
    for(let c=0;c<3;c++){ const card=sl.locator('.mrc').nth(c); for(let r=0;r<C[c].length;r++) await card.locator('.cin').nth(r).fill(String(C[c][r])); await fill(card,'.nin',M[c]) }
    await p.waitForTimeout(200); return (await cnt(sl.locator('.mrc .nin input.ok-b')))===3 && (await cnt(sl.locator('.cin.ok-b')))===5;
  });
  await T('ex31b',19,async(p,sl)=>{const v=[44,18,17,100,40,80,60]; for(let i=1;i<8;i++) await fill(sl.locator('.xr').nth(i),'.nin',v[i-1]); await p.waitForTimeout(150); return (await cnt(sl.locator('.xr.done')))===8});
  await T('race',20,async(p,sl)=>{const v=[32,17,64,114,98,119,187.5,133.5]; for(let i=0;i<8;i++) await fill(sl.locator('.rc').nth(i),'.nin',v[i]); await p.waitForTimeout(150); return (await cnt(sl.locator('.rc.ok')))===8});
  await T('tk2',21,async(p,sl)=>{
    await fill(sl,'.tq.cur .nin',74); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    await sl.locator('.tq.cur .opt').nth(2).click(); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    await sl.locator('.tq.cur .opt').nth(2).click(); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    return (await sl.locator('.score b').textContent()).trim()==='3 / 3';
  });
  await T('models',22,async(p,sl)=>{
    const sph=[2,3,4,5,9], ok=[2,0,1,0,2]; // index of correct option per model: HCl:'HCl' is opts idx0? recompute below
    const correct=[0,2,1,0,2];
    for(let m=0;m<5;m++){
      const sp=sl.locator('#msvg .sph'); const n=await sp.count(); for(let i=0;i<n;i++) await sp.nth(i).locator('circle.s').click({force:true});
      const tl=(await sl.locator('#ty').textContent()); if(!/×/.test(tl)) return false;
      await sl.locator('#so button').nth(correct[m]).click(); await p.waitForTimeout(120);
      if(m<4){ await sl.locator('#mnx').click(); await p.waitForTimeout(250) }
    }
    return (await sl.locator('#mfb').textContent()).includes('ممتاز');
  });
  await T('lattice',23,async(p,sl)=>{
    const good=[1,2]; for(let i=0;i<2;i++){ const box=sl.locator('.mod').nth(i); const sp=box.locator('.sph'); const n=await sp.count(); for(let k=0;k<n;k++) await sp.nth(k).locator('circle.s').click({force:true}); await box.locator('.sel button').nth(i===0?1:2).click() }
    await p.waitForTimeout(150); return (await cnt(sl.locator('.sel .ok-b')))===2;
  });
  await T('q31',24,async(p,sl)=>{
    for(let i=0;i<8;i++){ const card=sl.locator('.qd').nth(i); const btns=card.locator('.sel button'); const nb=await btns.count(); for(let k=0;k<nb;k++){ const bt=btns.nth(k); const txt=(await bt.textContent()); const ans=['HBr','CH4','Al2O3','ICl3','BrF5','CH2','NaI','BO2'][i]; if(txt===ans){await bt.click(); break} } }
    const done=(await cnt(sl.locator('.qd.ok')))===8 && (await sl.locator('.fb').textContent()).includes('ممتاز');
    await sl.locator('#typ').click(); await p.waitForTimeout(200);
    return done && (await cnt(sl.locator('.qd .tg')))===8;
  });
  await T('lab full',26,async(p,sl)=>{
    for(const g of ['eye','coat','glove']) await sl.locator('.gear[data-g="'+g+'"]').click();
    await sl.locator('#go0').click();
    await sl.locator('button[data-i="3"]').click();           // piece 4: Mg 0.24
    for(let i=0;i<3;i++) await sl.locator('#rub').click();
    await sl.locator('#w1').waitFor({timeout:3000}); await sl.locator('#w1').click(); await sl.locator('#w2').click(); await sl.locator('#w3').click();
    await fill(sl,'.nin[data-n="m1"]',0.24);
    await sl.locator('#h1').waitFor({timeout:3000}); await sl.locator('#h1').click(); await sl.locator('#h2').click(); await sl.locator('#h3').click(); await sl.locator('#h4').click();
    await sl.locator('#h5').waitFor({timeout:6000}); await sl.locator('#h5').click();
    await sl.locator('#x1').waitFor({timeout:4000}); await sl.locator('#x1').click(); await sl.locator('#x2').click();
    await sl.locator('#x3').waitFor({timeout:4000}); await sl.locator('#x3').click();
    await sl.locator('.nin[data-n="m2"]').waitFor({timeout:4000}); await fill(sl,'.nin[data-n="m2"]',0.40);
    await sl.locator('.nin[data-n="m3"]').waitFor({timeout:4000}); await fill(sl,'.nin[data-n="m3"]',0.16);
    // pick a second piece (quick run), then import groups
    await sl.locator('button[data-i="0"]').waitFor({timeout:4000}); await sl.locator('button[data-i="0"]').click();
    await sl.locator('.nin[data-n="m3"]').waitFor({timeout:6000}); await fill(sl,'.nin[data-n="m3"]',0.04);
    await sl.locator('#grp').waitFor({timeout:4000}); await sl.locator('#grp').click();
    const rows=await cnt(sl.locator('#nb tbody tr:not(.fresh) td.q:nth-child(1)')); 
    await sl.locator('#toG').waitFor({timeout:3000}); await sl.locator('#toG').click();
    await sl.locator('#sl').evaluate(e=>{e.value=0.67; e.dispatchEvent(new Event('input'))}); await sl.locator('#ck').click();
    await sl.locator('.opt').first().waitFor({timeout:4000});
    await sl.locator('.opt').first().click(); 
    await sl.locator('.nin[data-n="a1"]').waitFor({timeout:4000}); await fill(sl,'.nin[data-n="a1"]',0.042); await fill(sl,'.nin[data-n="a2"]',0.042);
    await sl.locator('.opt').first().waitFor({timeout:5000}); await sl.locator('.opt').first().click();
    await sl.locator('.opt').first().waitFor({timeout:4000}); await sl.locator('.opt').first().click();
    await sl.locator('#bk').waitFor({timeout:4000});
    return true;
  });
  await T('final',30,async(p,sl)=>{
    await fill(sl,'.tq.cur .nin',58); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    await sl.locator('.tq.cur .opt').nth(1).click(); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    await sl.locator('.tq.cur .opt').nth(1).click(); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    await sl.locator('.tq.cur .opt').nth(0).click(); await sl.locator('#tkn').click(); await p.waitForTimeout(250);
    return (await sl.locator('.score b').textContent()).trim()==='4 / 4';
  });
  await T('isoH',12,async(p,sl)=>{ const v=[0,1,2]; for(let i=0;i<3;i++) await fill(sl.locator('.mod').nth(i),'.nin',v[i]); await p.waitForTimeout(200); return (await cnt(sl.locator('.mod .ok-b')))===3 });
  await T('eou1',27,async(p,sl)=>{await sl.locator('#eoa .opt').nth(1).click(); await sl.locator('#eoa .opt').nth(0).click(); await fill(sl,'.nin[data-n="b"]',8); await fill(sl,'.nin[data-n="c"]',98); await fill(sl,'.nin[data-n="d"]',13.2); await p.waitForTimeout(200); return (await cnt(sl.locator('.nin .ok-b, .nin input.ok-b')))===3 && (await sl.locator('#eoa .fb').textContent()).includes('أحسنت')});
  await T('past1',28,async(p,sl)=>{
    await fill(sl.locator('.pq').nth(0),'.nin',19); await fill(sl.locator('.pq').nth(1),'.nin',24);
    await sl.locator('.pq').nth(2).locator('.sel button').nth(1).click(); await fill(sl.locator('.pq').nth(3),'.nin',12);
    await fill(sl.locator('.pq').nth(4),'.nin',148); await fill(sl.locator('.pq').nth(5),'.nin',244); await p.waitForTimeout(150);
    return (await cnt(sl.locator('.pq.ok')))===6 });
  await T('past2',29,async(p,sl)=>{
    await sl.locator('.pq').nth(0).locator('.sel button').nth(1).click(); await sl.locator('.pq').nth(1).locator('.sel button').nth(1).click(); await sl.locator('.pq').nth(2).locator('.sel button').nth(2).click();
    await fill(sl.locator('.pq').nth(3),'.nin',44); const c=sl.locator('.pq').nth(4); await c.locator('.nin input').nth(0).fill('30'); await c.locator('.nin input').nth(0).press('Enter'); await c.locator('.nin input').nth(1).fill('68'); await c.locator('.nin input').nth(1).press('Enter');
    await fill(sl.locator('.pq').nth(5),'.nin',32); await p.waitForTimeout(150);
    return (await cnt(sl.locator('.pq.ok')))===6 });
  await T('goals',1,async(p,sl)=>{ await sl.locator('.gi').first().click(); return (await cnt(sl.locator('.gi.done')))===1 });
  await T('c12',6,async(p,sl)=>{ for(let i=0;i<5;i++){ await sl.locator('.stp2 button[data-k="p"][data-d="1"]').click(); await sl.locator('.stp2 button[data-k="n"][data-d="1"]').click() } await p.waitForTimeout(300); return await sl.locator('#c12b').isVisible() });
  await T('calc',8,async(p,sl)=>{ for(let i=0;i<3;i++) await sl.locator('#stn').click(); await p.waitForTimeout(300); await fill(sl,'.nin[data-n="f"]',18.9); await p.waitForTimeout(150); return (await sl.locator('.fb').textContent()).includes('✓') });
  await T('table',10,async(p,sl)=>{ await sl.locator('tr[data-n="0"]').first().click(); await sl.locator('tr[data-n="1"]').nth(0).click(); await sl.locator('tr[data-n="1"]').nth(1).click(); await p.waitForTimeout(300); return await sl.locator('#tn').isVisible() && (await cnt(sl.locator('tr.hit')))===2 });
  await T('iso',11,async(p,sl)=>{ await sl.locator('#rv').click(); await p.waitForTimeout(300); return await sl.locator('#fm').isVisible() });
  await T('cl',13,async(p,sl)=>{ await sl.locator('#rg').evaluate(e=>{e.value=75; e.dispatchEvent(new Event('input'))}); await p.waitForTimeout(150); return (await sl.locator('#rv').textContent()).trim()==='35.5' && await sl.locator('#res.ok-b').count()===1 });
  await T('mr2 flow',17,async(p,sl)=>{
    const P=[[12,32],[40,12,48]], M=[44,100];
    for(let b=0;b<2;b++){ const blk=sl.locator('.fblk').nth(b); for(let r=0;r<P[b].length;r++) await blk.locator('.fr').nth(r).locator('.cin').fill(String(P[b][r])); await fill(blk,'.nin',M[b]) }
    await p.waitForTimeout(200); return (await cnt(sl.locator('.fr .cin.ok-b')))===5 && (await cnt(sl.locator('.fsum .nin input.ok-b')))===2 });
  await T('mr3 flow',18,async(p,sl)=>{
    const C=[[2,8,1,4],[1,1,4,14,7]], M=[132,246];
    for(let b=0;b<2;b++){ const blk=sl.locator('.fblk').nth(b); for(let r=0;r<C[b].length;r++) await blk.locator('.fr').nth(r).locator('.cin').fill(String(C[b][r])); await fill(blk,'.nin',M[b]) }
    await sl.locator('.rule[data-r="paren"]').click(); const hl=await cnt(sl.locator('.seg.hl'));
    await p.waitForTimeout(200); return (await cnt(sl.locator('.fr .cin.ok-b')))===9 && (await cnt(sl.locator('.fsum .nin input.ok-b')))===2 && hl===1 });
  console.log(results.map(r=>r.join('  ')).join('\n')); console.log('ERRORS:',errs.join('\n')||'none');
  await b.close();
})();
