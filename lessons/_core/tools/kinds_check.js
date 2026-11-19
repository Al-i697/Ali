/* Slide-kind check (u4/kinds.js): every slide with a header shows exactly one kind pill with the word of its kind, the pill stays inside the stage and clear of the title and the page badge,
   every progress segment carries its kind, the footer starts with the kind word, the index has its colour key and a tag on every row, the 8 kind colours are all different,
   and every id listed in KINDS (src/pages.js) is a real slide.
   node ../_core/tools/kinds_check.js lesson33.html */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
(async()=>{const file=path.resolve(process.argv[2]||'lesson33.html');
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.goto('file://'+file+'?pts=all');await p.waitForTimeout(1500);
 const n=await p.evaluate(()=>document.querySelectorAll('#prog .seg').length), bad=[], ids=[], counts={}; let pills=0;
 const WORD={intro:'تمهيد',learn:'شرح',ex:'مثال',act:'نشاط',ask:'تدريب',exam:'امتحان',exit:'تذكرة خروج',hw:'الواجب'};
 for(let i=0;i<n;i++){
  await p.evaluate(i=>document.querySelectorAll('#prog .seg')[i].click(),i); await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
   const s=document.querySelector('.slide.on'); if(!s) return null;
   const hd=s.querySelector('.hd'), st=s.getBoundingClientRect();
   const kds=s.querySelectorAll('.hd .kd'), kd=kds[0], h2=s.querySelector('.hd h2'), pg=s.querySelector('.hd .pgb');
   const seg=document.querySelectorAll('#prog .seg')[CURI()];
   function CURI(){ var segs=[].slice.call(document.querySelectorAll('#prog .seg')); return segs.findIndex(function(x){return x.classList.contains('cur')}) }
   const foot=(document.querySelector('#where small')||{}).textContent||'';
   const out={id:s.dataset.id,hasHd:!!hd,n:kds.length,word:kd?kd.getAttribute('data-kd'):'',k:kd?kd.getAttribute('data-k'):'',segK:seg?seg.getAttribute('data-k'):null,foot:foot};
   if(kd){ const a=kd.getBoundingClientRect(); out.inside=a.left>=st.left-1&&a.top>=st.top-1&&a.right<=st.right+1&&a.bottom<=st.bottom+1;
     const rect=function(x){return x.getBoundingClientRect()}, hit=function(x,y){return !(x.right<=y.left||x.left>=y.right||x.bottom<=y.top||x.top>=y.bottom)};
     out.clearTitle=!h2||!hit(a,rect(h2)); out.clearBadge=!pg||!hit(a,rect(pg)); out.color=getComputedStyle(kd).borderTopColor }
   return out});
  if(!r) continue; ids.push(r.id);
  if(!r.hasHd) continue;
  if(r.n!==1){ bad.push(r.id+': '+r.n+' kind pills'); continue }
  pills++; counts[r.k]=(counts[r.k]||0)+1;
  if(WORD[r.k]!==r.word) bad.push(r.id+': pill word "'+r.word+'" does not match kind '+r.k);
  if(r.segK!==r.k) bad.push(r.id+': progress segment says '+r.segK+' but the slide is '+r.k);
  if(!r.foot.startsWith(WORD[r.k])) bad.push(r.id+': footer does not start with "'+WORD[r.k]+'" ('+r.foot.slice(0,20)+')');
  if(r.inside===false) bad.push(r.id+': kind pill outside the stage');
  if(r.clearTitle===false) bad.push(r.id+': kind pill overlaps the title');
  if(r.clearBadge===false) bad.push(r.id+': kind pill overlaps the page badge');
 }
 const idx=await p.evaluate(()=>{ const rows=[].slice.call(document.querySelectorAll('.idx .it')); return {rows:rows.length,tagged:rows.filter(r=>r.querySelector('.kl')&&r.getAttribute('data-k')).length,key:document.querySelectorAll('.idx .kkey span').length}});
 if(idx.rows!==n||idx.tagged!==n) bad.push('index: '+idx.tagged+' of '+idx.rows+' rows tagged (slides: '+n+')');
 if(!idx.key) bad.push('index: colour key missing');
 const cols=await p.evaluate(()=>{ const o={}; ['intro','learn','ex','act','ask','exam','exit','hw'].forEach(k=>{ const e=document.createElement('span'); e.setAttribute('data-k',k); e.className='kd'; e.style.cssText='position:fixed;left:-99px'; document.body.appendChild(e); o[k]=getComputedStyle(e).getPropertyValue('--k').trim(); e.remove() }); return o });
 const uniq=new Set(Object.values(cols)); if(uniq.size!==8) bad.push('the 8 kind colours are not all different: '+JSON.stringify(cols));
 // every id in KINDS is a real slide, and every value is a known kind
 const src=fs.readFileSync(path.join(path.dirname(file),'src','pages.js'),'utf8'), m=src.match(/var KINDS\s*=\s*\{([^}]*)\}/);
 let listed=0; if(m){ m[1].replace(/(\w+)\s*:\s*'(\w+)'/g,(x,k,v)=>{ listed++; if(!ids.includes(k)) bad.push('KINDS: "'+k+'" is not a slide id'); if(!WORD[v]) bad.push('KINDS: "'+k+'" has unknown kind "'+v+'"') }) }
 console.log('kind pills:',pills,'of',n,'slides ·',Object.keys(counts).sort().map(k=>k+' '+counts[k]).join(', '),'· overrides in pages.js:',listed);
 console.log(bad.length?bad.join('\n'):'slide kinds ok');
 console.log('errors',errs.length?errs:'none');
 await b.close(); process.exit(bad.length||errs.length?1:0)})();
