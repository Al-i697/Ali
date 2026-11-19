/* Student summary check (u4/summary.js): the «ملخص الطالب» button in the lesson index opens the sheet; it has goals, summary bullets, at least one definition or law, the homework and the book pages;
   nothing is empty, "undefined" or an unfilled placeholder; the printed version (A4, print media) fits on ONE page.
   node ../_core/tools/summary_check.js lesson33.html [outDir]   (writes <lesson>_summary.pdf and .png into outDir when given) */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
(async()=>{const file=path.resolve(process.argv[2]||'lesson33.html'), out=process.argv[3];
 const b=await chromium.launch(), p=await b.newPage({viewport:{width:1600,height:900}}), errs=[], bad=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort()); await p.goto('file://'+file); await p.waitForTimeout(1500);
 await p.click('#bIdx'); await p.waitForTimeout(400); if(!await p.$('#idx .sumbtn')){ console.log('no summary button in the index'); process.exit(1) }
 await p.click('#idx .sumbtn'); await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{ const sh=document.querySelector('#sumov.on .sheet2'); if(!sh) return null;
   const sec=n=>{ const s=sh.querySelector('.ss.'+n); return s?s.querySelectorAll('li,.sc').length:0 };
   return {goals:sec('goals'),bul:sec('bul'),defs:sec('defs'),laws:sec('laws'),tips:sec('tips'),prac:sec('prac'),pg:!!sh.querySelector('.spg'),txt:sh.innerText,html:sh.innerHTML,h:sh.getBoundingClientRect().height} });
 if(!r){ console.log('the sheet did not open'); process.exit(1) }
 if(!r.goals) bad.push('no goals'); if(!r.bul) bad.push('no summary bullets'); if(!(r.defs+r.laws)) bad.push('no definition or law'); if(!r.prac) bad.push('no homework items'); if(!r.pg) bad.push('no book pages line');
 if(/undefined|\[object|NaN/.test(r.txt)) bad.push('the sheet contains undefined / NaN text');
 if(/class="(ptn|fx)/.test(r.html)) bad.push('leftover animation classes in the sheet');
 if(/(^|\n)\s*؟\s*($|\n)/.test(r.txt)) bad.push('an unfilled "؟" placeholder reached the sheet');
 // Escape closes, S reopens
 await p.keyboard.press('Escape'); await p.waitForTimeout(250); let on=await p.evaluate(()=>document.querySelector('#sumov').classList.contains('on')); if(on) bad.push('Escape did not close the sheet');
 await p.keyboard.press('KeyS'); await p.waitForTimeout(300); on=await p.evaluate(()=>document.querySelector('#sumov').classList.contains('on')); if(!on) bad.push('key S did not open the sheet');
 // printed: one A4 page
 await p.emulateMedia({media:'print'}); const pdf=await p.pdf({format:'A4',printBackground:true,preferCSSPageSize:true});
 const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
 if(pages!==1) bad.push('printed summary is '+pages+' pages, not 1');
 if(out){ fs.mkdirSync(out,{recursive:true}); const nm=path.basename(file,'.html'); fs.writeFileSync(path.join(out,nm+'_summary.pdf'),pdf) }
 console.log('sections: goals',r.goals,'· bullets',r.bul,'· definitions',r.defs,'· laws',r.laws,'· tips',r.tips,'· homework',r.prac,'· printed pages',pages);
 console.log(bad.length?bad.join('\n'):'summary ok'); console.log('errors',errs.length?errs.slice(0,3):'none');
 await b.close(); process.exit(bad.length||errs.length?1:0)})();
