const {chromium}=require('playwright');const path=require('path');
(async()=>{
 const b=await chromium.launch();
 const rows=[];
 const slides={atomic:1,reactions:3,periodic:10,bonds:16,organic:29};
 for(const tierClicks of [0,1,2]){ // 0 clicks=full, 1=calm, 2=still
  for(const [name,n] of Object.entries(slides)){
   const ctx=await b.newContext({viewport:{width:1920,height:1080}}); const p=await ctx.newPage();
   await p.goto('file://'+path.resolve('lesson31.html')+'#s'+n);
   for(let i=0;i<tierClicks;i++) await p.click('#bFx');
   await p.waitForTimeout(2200);
   const cdp=await ctx.newCDPSession(p); await cdp.send('Performance.enable');
   await p.evaluate(()=>{window.__f=0;(function t(){window.__f++;requestAnimationFrame(t)})()});
   const m0=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
   await p.waitForTimeout(5000);
   const m1=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
   const fps=(await p.evaluate(()=>window.__f))/5; const tier=await p.getAttribute('#bFx','data-tier');
   const d=k=>((m1[k]-m0[k])/5*1000).toFixed(0);
   rows.push({tier_click:tierClicks,theme:name,tier_end:tier,fps:fps.toFixed(0),script_ms_per_s:d('ScriptDuration'),task_ms_per_s:d('TaskDuration'),layout_ms_per_s:d('LayoutDuration'),style_ms_per_s:d('RecalcStyleDuration')});
   await ctx.close();
  }
 }
 console.table(rows); await b.close();
})();
