/* Page-of-the-book check (u4/bookpg.js): every slide listed in the lesson's BOOKPG shows its badge with exactly that text, the badge stays inside the stage and clear of the title,
   and no slide that is an activity, exercise, example, worksheet, book question or end-of-unit question is left without one (exams and tickets are exempt: their source is the year and round).
   node ../_core/tools/book_check.js lesson32.html */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.goto('file://'+path.resolve(process.argv[2]||'lesson32.html')+'?pts=all');await p.waitForTimeout(1500);
 const n=await p.evaluate(()=>document.querySelectorAll('#prog .seg').length), bad=[], shown={}, missing=[]; let withBadge=0, need=0;
 const NEED=/(نشاط|تمرين|مثال|ورقة العمل|ورقة عمل|(?:السؤال|سؤال|الأسئلة|أسئلة)\s*[0-9٠-٩]|نهاية الوحدة)/, EXEMPT=/(امتحان|تذكرة|سباق|الواجب)/;
 for(let i=0;i<n;i++){
  await p.evaluate(i=>document.querySelectorAll('#prog .seg')[i].click(),i); await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{
   const s=document.querySelector('.slide.on'); if(!s) return null;
   const h2=s.querySelector('.hd h2'), pg=s.querySelector('.hd .pgb'), st=document.getElementById('stage').getBoundingClientRect();
   const out={id:s.dataset.id,title:h2?h2.textContent:'',pg:pg?pg.getAttribute('data-pg'):''};
   if(pg){ const a=pg.getBoundingClientRect(), t=h2.getBoundingClientRect(); out.inside=a.left>=st.left-1&&a.top>=st.top-1&&a.right<=st.right+1&&a.bottom<=st.bottom+1; out.clear=a.bottom<=t.top+4||a.top>=t.bottom||a.right<=t.left||a.left>=t.right; out.txt=pg.textContent }
   return out});
  if(!r) continue;
  if(r.pg){ withBadge++; shown[r.id]=r.pg; if(r.inside===false) bad.push(r.id+': badge outside the stage'); if(r.clear===false) bad.push(r.id+': badge overlaps the title') }
  else if(NEED.test(r.title)&&!EXEMPT.test(r.title)){ need++; missing.push([r.id,r.title]) }
 }
 // every id listed in src/pages.js exists as a slide and got exactly its badge
 const src=fs.readFileSync(path.join(path.dirname(path.resolve(process.argv[2]||'lesson32.html')),'src','pages.js'),'utf8'), body=src.slice(src.indexOf('BOOKPG={'));
 const own=(src.match(/BOOKPG_OWN\s*=\s*\[([^\]]*)\]/)||[0,''])[1].match(/\w+/g)||[];
 const want={}; body.replace(/(\w+)\s*:\s*'([^']+)'/g,(m,k,v)=>{want[k]=v});

 missing.forEach(m=>{ if(!own.includes(m[0])) bad.push(m[0]+' ('+m[1]+'): book-derived slide without a page badge (if it is the teacher\'s own, list it in BOOKPG_OWN)') });
 console.log('badges shown:',withBadge,'· listed in pages.js:',Object.keys(want).length);
 Object.keys(want).forEach(k=>{ if(!(k in shown)) bad.push(k+': listed in pages.js but no badge shown'); else if(shown[k]!==want[k]) bad.push(k+': badge says "'+shown[k]+'" but pages.js says "'+want[k]+'"') });
 console.log(bad.length?bad.join('\n'):'page badges ok');
 await b.close(); process.exit(bad.length?1:0)})();
