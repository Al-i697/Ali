const {chromium}=require('playwright');const path=require('path');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+path.resolve('lesson43.html')); await p.waitForTimeout(1500);
 const n=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length);
 const bad=[]; let tot=0, minAll=99;
 for(let i=1;i<=n;i++){
  await p.waitForTimeout(2900+(i%3)*600); // different phases of the animation
  const items=await p.evaluate(()=>{
    const out=[]; const root=document.querySelector('.slide.on'); if(!root) return out;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let t; const seen=new Set();
    while(t=w.nextNode()){
      if(!t.nodeValue.trim()||t.nodeValue.trim()==='✓') continue; const el=t.parentElement; if(!el||seen.has(el)) continue; seen.add(el);
      if(el.closest('svg')) continue;
      const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') continue;
      const r=el.getBoundingClientRect(); if(r.width<6||r.height<6||r.bottom<0||r.top>1080) continue;
      const m=cs.color.match(/[\d.]+/g).map(Number);
      out.push({t:t.nodeValue.trim().slice(0,28),x:r.left,y:r.top,w:r.width,h:r.height,c:m,fs:parseFloat(cs.fontSize),fw:+cs.fontWeight});
    }
    return out;
  });
  await p.addStyleTag({content:'.slide *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important} .slide svg text{fill:transparent!important}',});
  const shot=await p.screenshot(); 
  await p.evaluate(()=>{const s=[...document.querySelectorAll('style')].pop(); s.remove()});
  const res=await p.evaluate(async({img,items})=>{
    const im=new Image(); im.src='data:image/png;base64,'+img; await im.decode();
    const c=document.createElement('canvas'); c.width=1920;c.height=1080; const g=c.getContext('2d'); g.drawImage(im,0,0);
    const L=(r,gg,bb)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(gg)+.0722*f(bb)};
    return items.map(it=>{
      const ins=Math.max(5,Math.min(it.w,it.h)*.18); const x=Math.max(0,Math.floor(it.x+ins)),y=Math.max(0,Math.floor(it.y+ins)),w=Math.min(1920-x,Math.ceil(it.w-2*ins)),h=Math.min(1080-y,Math.ceil(it.h-2*ins));
      if(w<2||h<2) return null; const d=g.getImageData(x,y,w,h).data; const ls=[];
      for(let k=0;k<d.length;k+=4*7) ls.push(L(d[k],d[k+1],d[k+2])); ls.sort((a,b)=>a-b);
      const bg=ls[Math.floor(ls.length*.95)]; const lt=L(it.c[0],it.c[1],it.c[2]);
      const hi=Math.max(lt,bg),lo=Math.min(lt,bg); return {t:it.t,fs:it.fs,fw:it.fw,cr:(hi+.05)/(lo+.05),bgL:bg};
    }).filter(Boolean);
  },{img:shot.toString('base64'),items});
  for(const r of res){tot++; const large=r.fs>=24||(r.fs>=18.66&&r.fw>=700); const need=large?3:4.5; minAll=Math.min(minAll,r.cr); if(r.cr<need) bad.push({slide:i,txt:r.t,fs:r.fs,cr:+r.cr.toFixed(2),need,bgL:+r.bgL.toFixed(3)})}
  if(i<n) await p.keyboard.press('ArrowLeft');
 }
 console.log('text items',tot,'min contrast',minAll.toFixed(2),'below threshold',bad.length);
 console.table(bad.slice(0,40)); await b.close();
})();
