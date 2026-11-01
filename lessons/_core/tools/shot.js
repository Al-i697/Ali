/* screenshots of lesson slides for looking at the layout:  node shot.js lesson42.html 3,13,15 out_dir [--gb]   (--gb opens the closing bar of each slide, as it looks at the end; --all shows every click-by-click point) */
const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{
  const file=path.resolve(process.argv[2]), ids=process.argv[3].split(',').map(Number), out=process.argv[4]||'.', gb=process.argv.includes('--gb'), q=process.argv.includes('--all')?'?pts=all':'';
  fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}});
  for(const n of ids){
    await p.goto('file://'+file+q+'#s'+n); await p.reload(); await p.waitForTimeout(1900);
    if(gb) await p.evaluate(()=>{ document.querySelectorAll('.slide.on .hide').forEach(e=>{ if(e.id==='gb') {e.classList.remove('hide'); e.classList.add('up')} }) });
    await p.waitForTimeout(700);
    await p.screenshot({path:path.join(out,'s'+String(n).padStart(2,'0')+'.png')});
  }
  await b.close();
})();
