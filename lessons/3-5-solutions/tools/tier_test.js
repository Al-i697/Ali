const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];
 const ctx=await b.newContext({viewport:{width:1366,height:768}});const p=await ctx.newPage();
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('file://'+path.resolve('lesson35.html')+'#s1');await p.waitForTimeout(1200);
 const read=async()=>({tier:await p.getAttribute('#bFx','data-tier'),label:(await p.textContent('#bFx span')).trim(),fx:await p.getAttribute('#view','data-fx'),ls:await p.evaluate(()=>{try{return localStorage.getItem('l31fx')}catch(e){return 'x'}})});
 console.log('start',JSON.stringify(await read()));
 for(let i=0;i<3;i++){await p.click('#bFx');await p.waitForTimeout(500);console.log('click',i+1,JSON.stringify(await read()))}
 // go to another theme while still (tier 0 after 2 clicks) and back to full
 await p.click('#bFx');await p.waitForTimeout(300); // tier 0
 for(let i=0;i<8;i++){await p.keyboard.press('ArrowLeft');await p.waitForTimeout(250)}
 console.log('still mode after nav',JSON.stringify(await read()));
 await p.click('#bFx');await p.waitForTimeout(1200);console.log('back to full',JSON.stringify(await read()));
 // persisted choice survives reload
 await p.reload();await p.waitForTimeout(1000);console.log('after reload',JSON.stringify(await read()));
 await ctx.close();
 // small / tablet viewports
 for(const [w,h] of [[1024,768],[800,1280]]){
  const c2=await b.newContext({viewport:{width:w,height:h}});const q=await c2.newPage();q.on('pageerror',e=>errs.push('PAGEERR '+e.message));
  await q.goto('file://'+path.resolve('lesson35.html')+'#s17');await q.waitForTimeout(1800);await q.screenshot({path:'shots/vp_'+w+'.png'});await c2.close()}
 console.log('errors:',errs.length?errs:'none');await b.close()})();
