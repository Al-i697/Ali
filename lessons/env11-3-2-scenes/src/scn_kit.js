/* ---------- scene kit: the infographic-style explanation slides, inside the lesson player.
   Each scene slide draws itself in a shadow root (so the player's CSS cannot touch it). The player's own "points" mechanism drives it:
   a scene with n steps has n invisible proxy points (.scp); pressing Next/Previous moves the step, and onpt() repaints the scene.
   Step 0 shows the lead-in question; steps 1..n bring in the labels, leader lines, caption, zoom or cards one by one.
   Slide kinds (d.k): 'scene' (full picture + labels + leader lines + caption), 'side' (picture beside ribbon cards), 'eq' (equation + cards),
   'board' (free layout of icon tiles, labels, bars and boxes). Pictures: SCN_IMG[name]; icon tiles: SCN_TL[set][i] (scn_assets.js, made by build.py). ---------- */
function mk(c){return '<i class="mk" style="background:'+c+'"></i>'}
function en(t){return '<span class="en">'+t+'</span>'}
function nm(t){return '<bdi dir="ltr">'+t+'</bdi>'}
/* the right answer must not always sit in the same place: move it to position `at` (0 first, 1 middle, 2 last); the wrong ones keep their order */
function scnPlace(opts,at){
  var o=opts.slice(), k=-1; o.forEach(function(x,i){ if(x[1]) k=i });
  if(k<0||at==null) return o;
  var c=o.splice(k,1)[0]; o.splice(Math.min(at,o.length),0,c); return o;
}
function scnTile(set,i){ return SCN_TL[set][i] }

function scnMarkup(d){
  var h='', i;
  if(d.k==='scene'){
    h+='<div class="zw"><img class="bg" alt="" src="'+SCN_IMG[d.img]+'"></div><svg class="ld" viewBox="0 0 1280 720"></svg><div class="ttl" style="'+(d.tl?'left:'+d.tl.x+'px;top:'+d.tl.y+'px':'')+'">'+d.title+'</div>';
    if(d.col) h+='<div class="col" style="left:'+d.col.x+'px;top:'+d.col.y+'px;width:'+d.col.w+'px"></div>';
    h+='<div class="cap" style="opacity:0"></div>';
  }else if(d.k==='board'){
    h+='<svg class="ld" viewBox="0 0 1280 720"></svg><h1 class="t3">'+d.title+'</h1>';
    if(d.col) h+='<div class="col" style="left:'+d.col.x+'px;top:'+d.col.y+'px;width:'+d.col.w+'px"></div>';
    h+='<div class="cap" style="opacity:0"></div>';
  }else if(d.k==='eq'){
    h+='<div class="t3"><h1>'+d.title+'</h1></div><div class="eqt"><i data-k="1">C</i> = <i data-k="2">P</i> + <i data-k="3">R</i> + <i data-k="4">F</i> + <i data-k="5">U</i></div>';
    h+='<div class="eqc">'+d.cards.map(function(c,j){return '<div class="ec" data-s="'+(j+1)+'"'+(d.extra?' data-e="6"':'')+'><div class="l" style="background:'+c.c+'"><b>'+c.l+'</b>'+c.n+'</div><img alt="" src="'+scnTile(c.set,c.i)+'"><p>'+c.d+'</p></div>'}).join('')+'</div>';
    h+='<div class="eqs" data-s="6"'+(d.extra?' data-e="6"':'')+'><h4>'+d.strip.h+'</h4><div class="tiles">'+d.strip.items.map(function(t){return '<div class="tile" style="width:210px"><img style="width:210px;height:104px;object-fit:contain;background:rgba(255,255,255,.06)" src="'+scnTile(t.set,t.i)+'" alt="">'+t.t+'</div>'}).join('')+'</div></div><div class="eqn" data-s="6"'+(d.extra?' data-e="6"':'')+'>'+d.note0+'</div>';
    if(d.extra) h+='<div class="eqs ext" data-s="7"><h4>'+d.extra.h+'</h4><p>'+d.extra.p+'</p><p><b>'+d.extra.lh+'</b></p><ul>'+d.extra.l.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><p class="f">'+d.extra.f+'</p></div>';
  }else{
    h+='<div class="t2"><h1>'+d.h1+'</h1><p>'+d.sub+'</p></div><div class="artw"><img alt="" src="'+SCN_IMG[d.img]+'"></div><div class="cards"></div><div class="endbar" data-s="'+d.n+'">'+d.end+'</div>';
  }
  if(d.lead){
    h+='<div class="lead"><span class="tag">اكتشف</span><div class="q">'+d.lead.q+'</div>'+scnPlace(d.lead.o,d.lead.at).map(function(o){return '<button type="button" class="o" data-ok="'+(o[1]?1:0)+'" data-w="'+o[2]+'">'+o[0]+'</button>'}).join('')+'<div class="fb">اختر إجابتك.</div></div>';
  }
  return '<div class="r '+(d.k==='side'?'side':d.k==='eq'?'eq':d.k==='board'?'board':'scene')+(d.big?' big':'')+'">'+h+'</div>';
}

/* position of an element inside the stage-sized root (layout values, so a running slide transition does not disturb them) */
function scnPos(el,root){var x=0,y=0,w=el.offsetWidth,h=el.offsetHeight;while(el&&el!==root){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent}return{x:x,y:y,w:w,h:h}}

/* the pieces that need real DOM nodes: label chips (laid out in place or in a column), highlight ellipses, tile rows, board items, ribbon cards */
function scnBuildParts(d){
  var r=d.r, colEl=r.querySelector('.col'), svg=r.querySelector('.ld'), g='', i;
  function stepAttrs(e,c){ e.setAttribute('data-s',c.s); if(c.e!=null) e.setAttribute('data-e',c.e) }
  if(d.k==='scene'||d.k==='board'){
    (d.chips||[]).forEach(function(c){
      var e=document.createElement('div'); e.className='chip'+(c.one?' one':'')+(c.hot?' hot':''); stepAttrs(e,c); e.innerHTML=c.h;
      if(c.x!=null){ e.style.left=c.x+'px'; e.style.top=c.y+'px'; if(c.w) e.style.width=c.w+'px'; r.appendChild(e) } else if(colEl){ colEl.appendChild(e) }
      c.el=e;
    });
    (d.hl||[]).forEach(function(l){
      g+='<g data-s="'+l.s+'" data-e="'+l.e+'"><ellipse cx="'+l.cx+'" cy="'+l.cy+'" rx="'+l.rx+'" ry="'+l.ry+'" fill="#ffd66b" style="animation:glow 2.6s ease-in-out infinite"/><ellipse cx="'+l.cx+'" cy="'+l.cy+'" rx="'+l.rx+'" ry="'+l.ry+'" fill="none" stroke="#ffe27a" stroke-width="3.5" stroke-dasharray="12 10" class="march"/></g>';
    });
    (d.arrows||[]).forEach(function(a){
      var c=a.c||'#ffd66b', dx=a.x2-a.x1, dy=a.y2-a.y1, L=Math.sqrt(dx*dx+dy*dy)||1, ux=dx/L, uy=dy/L, hx=a.x2-ux*14, hy=a.y2-uy*14, nx=-uy*9, ny=ux*9;
      g+='<g data-s="'+a.s+'"'+(a.e!=null?' data-e="'+a.e+'"':'')+'><line x1="'+a.x1+'" y1="'+a.y1+'" x2="'+hx.toFixed(1)+'" y2="'+hy.toFixed(1)+'" stroke="'+c+'" stroke-width="6" stroke-linecap="round"/><path d="M'+a.x2+' '+a.y2+'L'+(hx+nx).toFixed(1)+' '+(hy+ny).toFixed(1)+'L'+(hx-nx).toFixed(1)+' '+(hy-ny).toFixed(1)+'z" fill="'+c+'"/></g>';
    });
    svg.innerHTML=g;
    (d.rows||[]).forEach(function(rw){
      var e=document.createElement('div'); e.className='rw'; stepAttrs(e,rw);
      e.innerHTML='<h4>'+rw.h+'</h4><div class="tiles">'+rw.items.map(function(t){return '<div class="tile"><img alt="" src="'+scnTile(t.set,t.i)+'">'+t.t+'</div>'}).join('')+'</div>'; r.appendChild(e);
    });
    (d.hl||[]).forEach(function(l){
      var e=document.createElement('div'); e.className='chip hot one'; stepAttrs(e,l); e.style.left=l.lx+'px'; e.style.top=(l.ly-20)+'px'; e.textContent=l.label; r.appendChild(e);
    });
  }
  if(d.k==='board'){
    (d.items||[]).forEach(function(t){
      var e=document.createElement('div'); if(t.s!=null) stepAttrs(e,t);
      if(t.t==='tile'){
        if(t.r!=null){ e.setAttribute('data-r',t.r); e.setAttribute('data-re',t.re!=null?t.re:99) }
        e.className='bi'+(t.cv?' cv':''); e.style.cssText='left:'+t.x+'px;top:'+t.y+'px;width:'+t.w+'px;height:'+t.h+'px'+(t.c?';box-shadow:0 0 0 2.5px '+t.c:'');
        e.innerHTML='<img alt="" src="'+(t.img?SCN_IMG[t.img]:scnTile(t.set,t.i))+'">'+(t.lab?'<div class="bl"'+(t.c?' style="border-top:2px solid '+t.c+'"':'')+'>'+t.lab+'</div>':'');
      }else if(t.t==='box'){
        e.className='bx'+(t.cls?' '+t.cls:''); e.style.cssText='left:'+t.x+'px;top:'+t.y+'px;width:'+t.w+'px'+(t.hh?';height:'+t.hh+'px':'');
        e.innerHTML=(t.hd?'<div class="h" style="background:'+(t.c||'#4b5fa0')+'">'+t.hd+'</div>':'')+'<div class="b">'+t.b+'</div>';
      }else if(t.t==='pyr'){
        e.className='pyr'+(t.top?' top':''); e.style.cssText='left:'+t.x+'px;top:'+t.y+'px;width:'+t.w+'px;height:'+t.hh+'px';
        e.innerHTML=t.levels.map(function(lv,j){
          return '<div class="pb" data-s="'+lv.s+'"'+(lv.e!=null?' data-e="'+lv.e+'"':'')+' style="width:'+Math.round(t.w*lv.f)+'px;height:'+(t.bh||44)+'px;background:'+lv.c+(lv.dl?';transition-delay:'+lv.dl+'ms':'')+'">'+(lv.ic?'<img alt="" src="'+scnTile(lv.ic[0],lv.ic[1])+'">':'')+'<span>'+lv.t+(lv.sm?'<small> '+lv.sm+'</small>':'')+'</span></div>';
        }).join('');
        r.appendChild(e); return;
      }else if(t.t==='txt'){
        e.className='pt'; e.style.cssText='left:'+t.x+'px;top:'+t.y+'px'+(t.w?';width:'+t.w+'px':'')+(t.fs?';font-size:'+t.fs+'px':'')+(t.col?';color:'+t.col:''); e.innerHTML=t.h;
      }
      r.appendChild(e); t.el=e;
    });
  }else if(d.k==='side'){
    var cw=r.querySelector('.cards');
    d.cards.forEach(function(c){ var e=document.createElement('div'); e.className='c'; e.setAttribute('data-s',c.s); e.innerHTML='<div class="h '+c.c+'">'+c.ic+c.h+'</div><div class="b">'+c.b+'</div>'; cw.appendChild(e) });
  }
}

/* leader lines: a line from each chip's edge to its target, placed from the chip's real position (fonts may change its size) */
function scnLeaders(d){
  if(d.k!=='scene'&&d.k!=='board') return;
  var r=d.r, svg=r.querySelector('.ld'), keep=svg.innerHTML.split('<!--L-->')[0], g='';
  (d.chips||[]).forEach(function(c){
    if(c.tx==null||!c.el) return;
    var p=scnPos(c.el,r), cx=p.x+p.w/2, cy=p.y+p.h/2, dx=c.tx-cx, dy=c.ty-cy, t=Math.min((p.w/2)/(Math.abs(dx)||1e-9),(p.h/2)/(Math.abs(dy)||1e-9));
    var sx=cx+dx*t, sy=cy+dy*t;
    g+='<g data-s="'+c.s+'"'+(c.e!=null?' data-e="'+c.e+'"':'')+'><line x1="'+sx.toFixed(0)+'" y1="'+sy.toFixed(0)+'" x2="'+c.tx+'" y2="'+c.ty+'" stroke="rgba(255,255,255,.85)" stroke-width="2.2"/><circle cx="'+c.tx+'" cy="'+c.ty+'" r="6" fill="'+c.c+'" stroke="#fff" stroke-width="2"/></g>';
  });
  svg.innerHTML=keep+'<!--L-->'+g;
  scnApply(d);
}

/* paint step d.sl.pn: which labels are in, caption, zoom, equation letter, lead-in question */
function scnApply(d){
  var r=d.r, step=d.sl.pn;
  Array.prototype.forEach.call(r.querySelectorAll('[data-s]'),function(e){
    var a=+e.getAttribute('data-s'), b=e.getAttribute('data-e'); e.classList.toggle('on',step>=a&&(b==null||step<=+b));
  });
  Array.prototype.forEach.call(r.querySelectorAll('[data-r]'),function(e){ e.classList.toggle('hl',step>=+e.getAttribute('data-r')&&step<=+e.getAttribute('data-re')) });
  var lead=r.querySelector('.lead'); if(lead) lead.classList.toggle('gone',step>0);
  var cp=r.querySelector('.cap');
  if(cp){ var t=d.caps[Math.min(step,d.caps.length-1)]; cp.style.opacity=step?1:0; if(cp.getAttribute('data-t')!==t){ cp.setAttribute('data-t',t); cp.innerHTML='<div>'+t+'</div>' } }
  if(d.zoom){ var zq=d.zoom[Math.min(step,d.zoom.length-1)]; r.querySelector('.zw').style.transform=zq?('translate('+zq[0]+'px,'+zq[1]+'px) scale('+zq[2]+')'):'none' }
  if(d.k==='eq') Array.prototype.forEach.call(r.querySelectorAll('.eqt i'),function(i){ i.classList.toggle('act',+i.getAttribute('data-k')===step) });
}

/* patch the player: the points mechanism repaints a scene whenever its step changes (the hook is optional, other slides are untouched) */
(function(){
  var rv=ptReveal, hd=ptHide, rs=ptReset;
  ptReveal=function(s){ rv(s); if(s.onpt) s.onpt(s) };
  ptHide=function(s){ hd(s); if(s.onpt) s.onpt(s) };
  ptReset=function(s,dir){ rs(s,dir); if(s.onpt) s.onpt(s) };
})();

var SCN_DEF={};   /* slide data, filled in scn_data.js */
function scn(id,ch){
  var d=SCN_DEF[id]; if(!d) throw new Error('no scene data for '+id);
  d.id=id; var n=d.n||(d.caps?d.caps.length-1:1); d.n=n;
  if(!LESSON.pts) LESSON.pts={}; LESSON.pts[id]='.scp';
  slide({id:id,ch:ch,title:(d.stitle||d.title||d.h1).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),tag:'اكتشف',bare:true,cls:'scn',
    html:function(){ var h=''; for(var i=0;i<n;i++) h+='<i class="scp" aria-hidden="true"></i>'; return h },
    init:function(el,s){
      d.sl=s; s.onpt=function(){ scnApply(d) };
      var sh=el.attachShadow({mode:'open'});
      sh.innerHTML='<style>'+SCN_CSS+'</style>'+scnMarkup(d);
      d.r=sh.querySelector('.r');
      scnBuildParts(d);
      if(d.lead){
        Array.prototype.forEach.call(d.r.querySelectorAll('.lead .o'),function(b){
          b.addEventListener('click',function(ev){ ev.stopPropagation(); var ok=b.getAttribute('data-ok')==='1', f=d.r.querySelector('.lead .fb'); b.classList.add(ok?'ok':'bad'); f.textContent=b.getAttribute('data-w'); f.className='fb '+(ok?'ok':'bad') });
        });
      }
      scnLeaders(d);
      if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ scnLeaders(d) });
    },
    enter:function(){ scnLeaders(d) },
    note:'<ul>'+d.note.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'});
}
