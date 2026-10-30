/* Do the stickers ever sit on text? Opens every slide of a lesson, waits for the stickers to settle and reports any sticker that overlaps a text line, field, picture or panel.
   node stk_check.js <lesson.html> <slides> [fx tier 0-2]                                                                                          */
const {chromium}=require('playwright'); const [,, file, count, tier]=process.argv;
const probe=()=>{
  const st=document.querySelector('.stage').getBoundingClientRect(), k=st.width/1280, sl=document.querySelector('.slide.on'), out={id:sl.getAttribute('data-id'),placed:0,hidden:0,hits:[]};
  const rg=document.createRange(), boxes=[], R=r=>({l:(r.left-st.left)/k,t:(r.top-st.top)/k,r:(r.right-st.left)/k,b:(r.bottom-st.top)/k});
  sl.querySelectorAll('*').forEach(e=>{
    if(e.closest('.stk,.stk-pop,.spk')||(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')) return;
    const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) return;
    const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return;
    for(let n=e.firstChild;n;n=n.nextSibling) if(n.nodeType===3&&n.nodeValue.trim()){ rg.selectNodeContents(n); [...rg.getClientRects()].forEach(q=>{ if(q.width>1) boxes.push(['text '+n.nodeValue.trim().slice(0,22),R(q)]) }) }
    const m=cs.backgroundColor.match(/[\d.]+/g), al=m&&m.length>3?+m[3]:(m?1:0);
    if(r.width*r.height<.55*st.width*st.height&&(al>.04||parseFloat(cs.borderTopWidth)>0||/^(img|svg|canvas|input|button)$/i.test(e.tagName)||cs.backgroundImage!=='none')) boxes.push(['box '+e.tagName+'.'+String(e.className&&e.className.baseVal!==undefined?'':e.className).slice(0,18),R(r)]);
  });
  sl.querySelectorAll('.stk').forEach(s=>{
    if(!s.classList.contains('placed')){ out.hidden++; return } out.placed++;
    const a=R(s.querySelector('.in').getBoundingClientRect());
    boxes.forEach(([what,b])=>{ const w=Math.min(a.r,b.r)-Math.max(a.l,b.l), h=Math.min(a.b,b.b)-Math.max(a.t,b.t); if(w>3&&h>3) out.hits.push(s.getAttribute('data-n')+' over '+what+' ('+Math.round(w)+'x'+Math.round(h)+')') });
  });
  return out;
};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:800}});
  await ctx.addInitScript(t=>{try{localStorage.setItem('l31fx',t)}catch(e){}},tier||'1');
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+file+'#s1'); await p.waitForTimeout(1500); let bad=0, tp=0, th=0;
  for(let i=1;i<=+count;i++){
    if(i>1) await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(3300);
    const o=await p.evaluate(probe); tp+=o.placed; th+=o.hidden;
    if(o.hits.length){ bad++; console.log(String(i).padStart(2),o.id.padEnd(9),'OVERLAP',o.hits.slice(0,4).join(' | ')) }
  }
  console.log('slides with overlap:',bad,' stickers placed:',tp,' left out (no room):',th,' errors:',errs.length?errs.join('; '):'none'); await b.close();
})();
