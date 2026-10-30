const {chromium}=require('playwright');
const path=require('path');require('fs').mkdirSync('shots',{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];
 const idx=process.argv.slice(2).map(Number); // slide numbers
 for(const n of idx){
  const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('console',m=>{if(m.type()==='error')errs.push(n+': '+m.text())});
  p.on('pageerror',e=>errs.push(n+' PAGEERR: '+e.message));
  await p.goto('file://'+path.resolve('lesson32.html')+'#s'+n);
  await p.evaluate(()=>{window.__bg=1});
  await p.waitForTimeout(2600);
  await p.screenshot({path:'shots/bg_'+String(n).padStart(2,'0')+'.png'});
  await p.close();
 }
 console.log('errors:',errs.length?errs:'none');
 await b.close();
})();
