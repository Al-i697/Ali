/* ---------- stickers: cut-out stickers (stickers_assets.js) and drawn, animated ones.
   They never sit on text: each slide's free space is measured from the page itself, stickers go to the nearest free spot
   and glide away when content appears. Correct answers give sparkles and a praise sticker (also placed in free space). ---------- */
var STK=(function(){
  var KEY='l31stk', off=false, stage=null, ready=false, lastNav=0, lastPraise=0, bag=[], cur=null, tok=0, mo=null, rt=0, px=-1, py=-1, eyeRaf=0;
  var CELL=8, GW=160, GH=90, PAD=11, SCALES=[1,.86,.74,.62,.52];
  var PRAISE=['pr_student','pr_hero','pr_star','pr_great','pr_amazing','pr_space','pr_sciencestar','pr_genius','pr_bravo','pr_excellent','pr_superior','pr_creator'];
  var INK='#16303b', CHEEK='#ff9db4';
  /* how each sticker moves when idle */
  var MV={kid_lab:'sway',kid_flask:'sway',kids_duo:'hop',atom:'wiggle',micro:'sway',glass:'bob',lens:'sway',
    m_flask:'bob',m_tube:'bob',m_atom:'bob',m_star:'bob',m_trophy:'hop',m_bulb:'bob',m_flame:'bob',m_mole:'hop',
    flat_atom:'sway',sci_pipette:'sway',sci_clip:'sway',sci_tube:'sway',saf_goggles:'wiggle',saf_coat:'sway',saf_flasks:'bob',saf_kit:'hop',saf_tap:'wiggle',
    s_fe:'wiggle',s_planet:'sway',s_robot:'hop',s_moon:'bob',s_mol:'wiggle',s_globe:'sway',s_books:'breathe',s_petri:'breathe',s_jar:'bob',s_plant:'sway',s_micro:'sway',s_lens:'sway',
    n_carbon:'wiggle',n_hhe:'bob',n_check:'sway',n_notes:'sway',n_potion:'bob',n_flask:'bob',n_flask2:'bob',n_flask3:'bob',n_galaxy:'breathe',n_helmet:'bob',n_moon:'bob',n_saturn:'sway'};

  /* ---- drawn stickers: a white die-cut layer is made from `sil`, the art goes on top; classes carry the animation (see stickers.css) ---- */
  function face(x,y,s){
    s=s||1; var g=14*s, o='';
    [-1,1].forEach(function(k){
      o+='<g class="eg"><ellipse class="eye" cx="'+(x+k*g)+'" cy="'+y+'" rx="'+5*s+'" ry="'+6.2*s+'" fill="'+INK+'"/><circle cx="'+(x+k*g+1.6*s)+'" cy="'+(y-2.2*s)+'" r="'+1.9*s+'" fill="#fff"/></g>';
      o+='<ellipse cx="'+(x+k*(g+9*s))+'" cy="'+(y+9*s)+'" rx="'+6*s+'" ry="'+3.8*s+'" fill="'+CHEEK+'" opacity=".8"/>';
    });
    return '<g stroke="none">'+o+'</g><path d="M'+(x-7*s)+' '+(y+8*s)+' Q'+x+' '+(y+17*s)+' '+(x+7*s)+' '+(y+8*s)+'" fill="none" stroke="'+INK+'" stroke-width="'+3*s+'" stroke-linecap="round"/>';
  }
  function starPath(cx,cy,R,r){
    var p=[]; for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5, d=i%2?r:R; p.push((cx+Math.cos(a)*d).toFixed(1)+' '+(cy+Math.sin(a)*d).toFixed(1))}
    return 'M'+p.join('L')+'Z';
  }
  function glint(x,y,s,c,cls){ return '<path class="'+cls+'" stroke="none" fill="'+c+'" d="M'+x+' '+(y-s)+'Q'+x+' '+y+' '+(x+s)+' '+y+'Q'+x+' '+y+' '+x+' '+(y+s)+'Q'+x+' '+y+' '+(x-s)+' '+y+'Q'+x+' '+y+' '+x+' '+(y-s)+'Z" style="transform-origin:'+x+'px '+y+'px"/>' }
  var FLASK='M80 28H120V76L160 146Q170 170 146 172H54Q30 170 40 146L80 76Z';
  var DRAWN={
    m_flask:{w:200,h:200,sil:'<path d="'+FLASK+'"/><rect x="72" y="20" width="56" height="16" rx="7"/>',
      art:'<path d="'+FLASK+'" fill="#eaf8fc"/><path class="liq" d="M59 112Q80 103 100 112T141 112L160 146Q170 170 146 172H54Q30 170 40 146Z" fill="#3ec9e6" stroke="none"/>'+
          '<path d="'+FLASK+'" fill="none"/><rect x="72" y="20" width="56" height="16" rx="7" fill="#cfeaf2"/>'+
          '<g fill="#fff" stroke="#6fc6dc" stroke-width="2.5"><circle class="bu b1" cx="102" cy="100" r="6"/><circle class="bu b2" cx="114" cy="96" r="4.2"/><circle class="bu b3" cx="90" cy="102" r="3.2"/></g>'+face(100,142,1)},
    m_tube:{w:200,h:200,sil:'<path d="M70 24H130V150Q130 178 100 178Q70 178 70 150Z"/>',
      art:'<path d="M70 24H130V150Q130 178 100 178Q70 178 70 150Z" fill="#eaf8fc"/><path class="liq" d="M70 96H130V150Q130 178 100 178Q70 178 70 150Z" fill="#ff6f7d" stroke="none"/>'+
          '<path d="M70 24H130V150Q130 178 100 178Q70 178 70 150Z" fill="none"/><rect x="62" y="18" width="76" height="14" rx="7" fill="#cfeaf2"/>'+
          '<g fill="#fff" stroke="#ff9aa4" stroke-width="2.5"><circle class="bu b1" cx="96" cy="92" r="5"/><circle class="bu b2" cx="108" cy="90" r="3.6"/></g>'+face(100,128,.9)},
    m_atom:{w:200,h:200,sil:'<circle cx="100" cy="100" r="26"/><ellipse cx="100" cy="100" rx="84" ry="30"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(120 100 100)"/>',
      art:'<g class="orb" style="transform-origin:100px 100px"><g fill="none" stroke-width="3.5"><ellipse cx="100" cy="100" rx="84" ry="30"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(120 100 100)"/></g>'+
          '<circle cx="184" cy="100" r="9" fill="#ff5d73"/><circle cx="58" cy="173" r="9" fill="#3aa7ff"/><circle cx="58" cy="27" r="9" fill="#a470e8"/></g>'+
          '<circle cx="100" cy="100" r="27" fill="#ffd23f"/>'+face(100,98,.95)},
    m_star:{w:200,h:200,sil:'<path d="'+starPath(100,106,86,42)+'"/>',
      art:'<g class="pulse" style="transform-origin:100px 106px"><path d="'+starPath(100,106,86,42)+'" fill="#ffd23f" stroke-width="4"/><path d="M62 70L72 48" stroke="#fff" stroke-width="5" opacity=".7"/>'+face(100,106,1.05)+'</g>'},
    m_trophy:{w:200,h:200,sil:'<path d="M58 30H142V86Q142 130 100 134Q58 130 58 86Z"/><rect x="88" y="130" width="24" height="26"/><rect x="60" y="154" width="80" height="22" rx="6"/><path d="M58 46H34Q30 96 66 104M142 46H166Q170 96 134 104" fill="none"/>',
      art:'<path d="M58 46H34Q30 96 66 104M142 46H166Q170 96 134 104" fill="none" stroke-width="7"/><path d="M58 46H34Q30 96 66 104M142 46H166Q170 96 134 104" fill="none" stroke="#ffcf3d" stroke-width="2.5"/>'+
          '<path d="M58 30H142V86Q142 130 100 134Q58 130 58 86Z" fill="#ffcf3d"/><rect x="88" y="130" width="24" height="26" fill="#f0a826"/><rect x="60" y="154" width="80" height="22" rx="6" fill="#e0901b"/>'+
          '<path d="M72 42V86Q72 108 90 118" fill="none" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>'+face(102,80,.95)+
          glint(158,28,14,'#fff6c2','tw t1')+glint(40,22,9,'#fff6c2','tw t2')},
    m_bulb:{w:200,h:200,sil:'<circle cx="100" cy="86" r="52"/><rect x="78" y="124" width="44" height="46" rx="10"/><g stroke="#fff" stroke-width="6"><path d="M100 8V20M30 36L40 44M170 36L160 44M12 92H24M188 92H176"/></g>',
      art:'<g class="rays" stroke="#ffb703" stroke-width="5" stroke-linecap="round"><path d="M100 8V20M30 36L40 44M170 36L160 44M12 92H24M188 92H176"/></g><path class="glow" d="M78 118Q56 104 54 82Q54 40 100 36Q146 40 146 82Q144 104 122 118V130H78Z" fill="#ffe66b"/>'+
          '<rect x="78" y="128" width="44" height="14" rx="5" fill="#b8c4cc"/><rect x="82" y="142" width="36" height="14" rx="5" fill="#9aa8b2"/><path d="M90 156H110Q108 168 100 168Q92 168 90 156Z" fill="#5d6b75"/>'+
          '<path d="M70 70Q74 52 90 46" fill="none" stroke="#fff" stroke-width="5" opacity=".75" stroke-linecap="round"/>'+face(100,88,.95)},
    m_flame:{w:200,h:200,sil:'<path d="M100 14C122 52 156 74 156 118C156 156 132 182 100 182C68 182 44 156 44 118C44 94 60 80 68 58C80 70 86 80 88 90C92 64 96 40 100 14Z"/>',
      art:'<g class="fl" style="transform-origin:100px 182px"><path d="M100 14C122 52 156 74 156 118C156 156 132 182 100 182C68 182 44 156 44 118C44 94 60 80 68 58C80 70 86 80 88 90C92 64 96 40 100 14Z" fill="#ff8a3d"/>'+
          '<path class="fl2" d="M100 76C116 100 134 112 134 136C134 160 118 174 100 174C82 174 66 160 66 136C66 118 80 112 86 96C92 104 96 108 98 114C100 100 100 90 100 76Z" fill="#ffd23f" stroke="none" style="transform-origin:100px 174px"/>'+face(100,142,.9)+'</g>'},
    m_mole:{w:200,h:200,sil:'<ellipse cx="100" cy="112" rx="68" ry="62"/><circle cx="56" cy="54" r="15"/><circle cx="144" cy="54" r="15"/><ellipse cx="44" cy="146" rx="19" ry="15"/><ellipse cx="156" cy="146" rx="19" ry="15"/><ellipse cx="72" cy="174" rx="20" ry="11"/><ellipse cx="128" cy="174" rx="20" ry="11"/>',
      art:'<g class="ear" style="transform-origin:62px 66px"><circle cx="56" cy="54" r="15" fill="#8a5a3b"/><circle cx="56" cy="55" r="7" fill="#f4a9b8" stroke="none"/></g><g class="ear e2" style="transform-origin:138px 66px"><circle cx="144" cy="54" r="15" fill="#8a5a3b"/><circle cx="144" cy="55" r="7" fill="#f4a9b8" stroke="none"/></g>'+
          '<ellipse cx="72" cy="174" rx="20" ry="11" fill="#f0c8a0"/><ellipse cx="128" cy="174" rx="20" ry="11" fill="#f0c8a0"/>'+
          '<ellipse cx="100" cy="112" rx="68" ry="62" fill="#8a5a3b"/><ellipse cx="100" cy="136" rx="40" ry="32" fill="#e2bf98" stroke="none"/>'+
          '<g class="hand" style="transform-origin:56px 132px"><ellipse cx="44" cy="146" rx="19" ry="15" fill="#f0c8a0"/><g stroke-width="2.6" stroke-linecap="round"><path d="M34 138V146M44 136V146M54 138V146"/></g></g>'+
          '<g class="hand h2" style="transform-origin:144px 132px"><ellipse cx="156" cy="146" rx="19" ry="15" fill="#f0c8a0"/><g stroke-width="2.6" stroke-linecap="round"><path d="M146 138V146M156 136V146M166 138V146"/></g></g>'+
          '<ellipse cx="100" cy="102" rx="30" ry="22" fill="#e2bf98" stroke="none"/><g class="nose"><path d="M87 94Q100 85 113 94Q110 110 100 110Q90 110 87 94Z" fill="#f58fa8"/></g><path d="M95 118Q100 124 105 118" fill="none" stroke-width="3" stroke-linecap="round"/>'+
          '<g stroke="none"><g class="eg"><ellipse class="eye" cx="76" cy="84" rx="5" ry="5.6" fill="'+INK+'"/><circle cx="77.6" cy="82.2" r="1.8" fill="#fff"/></g><g class="eg"><ellipse class="eye" cx="124" cy="84" rx="5" ry="5.6" fill="'+INK+'"/><circle cx="125.6" cy="82.2" r="1.8" fill="#fff"/></g><ellipse cx="62" cy="104" rx="8" ry="5" fill="'+CHEEK+'" opacity=".8"/><ellipse cx="138" cy="104" rx="8" ry="5" fill="'+CHEEK+'" opacity=".8"/></g>'}
  };
  function svg(n){
    var d=DRAWN[n];
    return '<svg viewBox="0 0 '+d.w+' '+d.h+'" aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">'+d.sil+'</g><g stroke="'+INK+'" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">'+d.art+'</g></svg>';
  }
  function dims(n){ if(typeof STK_WH!=='undefined'&&STK_WH[n]) return STK_WH[n]; if(DRAWN[n]) return [DRAWN[n].w,DRAWN[n].h]; return null }
  function has(n){ return !!dims(n) }
  function inner(n){ return (typeof STK_IMG!=='undefined'&&STK_IMG[n])?'<img alt="" draggable="false" src="'+STK_IMG[n]+'">':svg(n) }

  /* one sticker as html; o: x,y (px in the 1280x720 stage; the preferred spot on slides), css (replaces the position), w width, r tilt, d entrance delay s, f float period s, mv movement, free (not placed by the engine) */
  function html(n,o){
    var wh=dims(n); if(!wh) return '';
    o=o||{}; var w=o.w||150, h=Math.round(w*wh[1]/wh[0]), dl=o.free?(o.d||0):Math.max(0,(o.d||1)-1);
    var st=(o.css!==undefined?o.css:'left:'+(o.x||0)+'px;top:'+(o.y||0)+'px;')+'width:'+w+'px;height:'+h+'px;--r:'+(o.r||0)+'deg;--sd:'+(o.d==null?.2:o.d)+'s;--fd:'+(o.f||(5+Math.random()*3).toFixed(1))+'s;--bd:-'+(Math.random()*4).toFixed(1)+'s;';
    return '<div class="stk'+(o.free?' free':'')+'" data-n="'+n+'" data-mv="'+(o.mv||MV[n]||'breathe')+'"'+(DRAWN[n]?' data-d="1"':'')+' data-w="'+w+'" data-h="'+h+'" data-px="'+(o.x||0)+'" data-py="'+(o.y||0)+'" style="'+st+'"><div class="in">'+inner(n)+'</div></div>';
  }
  /* put the stickers of one slide in: list of [name, x, y, width, tilt, delay, period, movement] */
  function deco(el,list){
    (list||[]).forEach(function(a){ el.insertAdjacentHTML('beforeend',html(a[0],{x:a[1],y:a[2],w:a[3],r:a[4],d:a[5],f:a[6],mv:a[7]})) });
  }

  /* ---- where is there room? a grid of the stage marking every text line, box, picture and field of the slide ---- */
  var LEAF=/^(img|svg|canvas|input|button|select|textarea|video)$/i;
  function occupancy(el,withStk){
    var sr=stage.getBoundingClientRect(), k=sr.width/1280||1, g=new Uint8Array(GW*GH), rg=document.createRange();
    function mark(l,t,r,b){
      var x0=Math.max(0,Math.floor((l-PAD)/CELL)), x1=Math.min(GW-1,Math.floor((r+PAD)/CELL)), y0=Math.max(0,Math.floor((t-PAD)/CELL)), y1=Math.min(GH-1,Math.floor((b+PAD)/CELL)), x, y;
      for(y=y0;y<=y1;y++)for(x=x0;x<=x1;x++)g[y*GW+x]=1;
    }
    function rect(r){ mark((r.left-sr.left)/k,(r.top-sr.top)/k,(r.right-sr.left)/k,(r.bottom-sr.top)/k) }
    var all=el.querySelectorAll('*'), i, e, cs, r, n, rs, j, m, al, big=.55*sr.width*sr.height;
    for(i=0;i<all.length;i++){
      e=all[i];
      if(e.classList&&(e.classList.contains('stk')||e.classList.contains('stk-pop')||e.classList.contains('spk'))){ if(withStk&&e.classList.contains('stk')&&e.classList.contains('placed')) rect(e.getBoundingClientRect()); continue }
      if(e.closest('.stk,.stk-pop,.spk')) continue;
      if(e.closest('svg')&&e.tagName.toLowerCase()!=='svg') continue;
      cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) continue;
      r=e.getBoundingClientRect(); if(r.width<2||r.height<2) continue;
      for(n=e.firstChild;n;n=n.nextSibling){
        if(n.nodeType===3&&n.nodeValue.trim()){ rg.selectNodeContents(n); rs=rg.getClientRects(); for(j=0;j<rs.length;j++) if(rs[j].width>1) rect(rs[j]) }
      }
      m=cs.backgroundColor.match(/[\d.]+/g); al=m&&m.length>3?+m[3]:(m?1:0);
      if(r.width*r.height<big&&(al>.04||parseFloat(cs.borderTopWidth)>0||parseFloat(cs.borderBottomWidth)>0||parseFloat(cs.borderLeftWidth)>0||LEAF.test(e.tagName)||cs.backgroundImage!=='none')) rect(r);
    }
    return g;
  }
  function integral(g){
    var I=new Int32Array((GW+1)*(GH+1)), x, y, row;
    for(y=1;y<=GH;y++){row=0;for(x=1;x<=GW;x++){row+=g[(y-1)*GW+x-1];I[y*(GW+1)+x]=I[(y-1)*(GW+1)+x]+row}}
    return I;
  }
  /* nearest free top-left (stage px) for a box of w x h around the preferred centre, or null (maxd: farthest allowed move, 0 = any) */
  function find(g,cx,cy,w,h,maxd){
    var I=integral(g), cw=Math.ceil(w/CELL), ch=Math.ceil(h/CELL), best=null, bd=1e12, x, y, s, dx, dy, d, W1=GW+1;
    for(y=0;y+ch<=GH;y++)for(x=0;x+cw<=GW;x++){
      s=I[(y+ch)*W1+x+cw]-I[y*W1+x+cw]-I[(y+ch)*W1+x]+I[y*W1+x];
      if(s) continue;
      dx=x*CELL+w/2-cx; dy=y*CELL+h/2-cy; d=dx*dx+dy*dy;
      if(d<bd){bd=d;best=[x*CELL,y*CELL]}
    }
    return best&&(!maxd||bd<=maxd*maxd)?best:null;
  }
  function fill(g,x,y,w,h){
    var x0=Math.floor(x/CELL), x1=Math.min(GW-1,Math.ceil((x+w)/CELL)), y0=Math.floor(y/CELL), y1=Math.min(GH-1,Math.ceil((y+h)/CELL)), i, j;
    for(j=y0;j<=y1;j++)for(i=x0;i<=x1;i++)g[j*GW+i]=1;
  }
  /* put each sticker of the slide at the nearest free spot; those with no room fade out */
  function arrange(el){
    if(!stage||off||!el||!el.classList.contains('on')) return;
    var list=Array.prototype.slice.call(el.querySelectorAll('.stk:not(.free)')); if(!list.length) return;
    var g=occupancy(el,false);
    list.forEach(function(s){
      var w0=+s.getAttribute('data-w'), h0=+s.getAttribute('data-h'), pcx=+s.getAttribute('data-px')+w0/2, pcy=+s.getAttribute('data-py')+h0/2, k, pos=null, w=w0, h=h0, m=0;
      for(k=0;k<SCALES.length&&!pos;k++){      /* the biggest size that still fits */
        w=Math.round(w0*SCALES[k]); h=Math.round(h0*SCALES[k]); m=Math.round(Math.max(w,h)*.05)+4;
        pos=find(g,pcx,pcy,w+2*m,h+2*m+8,520);
      }
      if(pos){
        fill(g,pos[0],pos[1],w+2*m,h+2*m+8);
        s.style.width=w+'px'; s.style.height=h+'px'; s.style.left=Math.round(pos[0]+m)+'px'; s.style.top=Math.round(pos[1]+m+8)+'px';
        s.classList.remove('nospot'); if(!s.classList.contains('placed')) void s.offsetWidth; s.classList.add('placed');
      }else{ s.classList.remove('placed'); s.classList.add('nospot') }
    });
  }
  function later(){ clearTimeout(rt); rt=setTimeout(function(){ if(cur) arrange(cur) },380) }
  function watchSlide(el){
    if(mo) mo.disconnect();
    mo=new MutationObserver(function(list){
      for(var i=0;i<list.length;i++){ var t=list[i].target, n=t.nodeType===1?t:t.parentElement; if(n&&n.closest&&!n.closest('.stk,.stk-pop,.spk')){ later(); return } }
    });
    mo.observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','hidden']});
  }
  /* the engine calls these when a slide is shown / left */
  function arrive(el){
    var t=++tok; cur=el;
    setTimeout(function(){ if(t===tok&&el.classList.contains('on')){ arrange(el); watchSlide(el) } },1900);
  }
  function leave(el){
    tok++; if(mo){mo.disconnect();mo=null}
    Array.prototype.forEach.call(el.querySelectorAll('.stk:not(.free)'),function(s){ s.classList.remove('placed','nospot') });
  }

  /* ---- sparkles, poke and praise ---- */
  var COL=['#ffd23f','#ffffff','#5ad8ff','#ff7aa8','#9be564','#c9a6ee'];
  function spark(x,y,n,spread,host){
    if(off||BG.tier()===0) return; host=host||stage; if(!host) return;
    var d=document.createElement('div'); d.className='spk'+(host===document.body?' fixed':''); d.style.left=x+'px'; d.style.top=y+'px'; var s='';
    for(var i=0;i<n;i++){
      var a=(i/n)*Math.PI*2+Math.random()*.6, r=spread*(.6+Math.random()*.6), z=9+Math.random()*10;
      s+='<i style="--dx:'+Math.round(Math.cos(a)*r)+'px;--dy:'+Math.round(Math.sin(a)*r)+'px;--z:'+z.toFixed(0)+'px;--c:'+COL[i%COL.length]+';--o:'+(i*18)+'ms"></i>';
    }
    d.innerHTML=s; host.appendChild(d); setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d) },1500);
  }
  function center(t){
    var r=t.getBoundingClientRect(), sr=stage.getBoundingClientRect(), k=sr.width/1280||1;
    return {x:(r.left+r.width/2-sr.left)/k, y:(r.top+r.height/2-sr.top)/k};
  }
  function poke(s){
    if(off) return; s.classList.remove('poked'); void s.offsetWidth; s.classList.add('poked'); setTimeout(function(){s.classList.remove('poked')},950);
    var r=s.getBoundingClientRect();
    if(s.classList.contains('free')||!stage) spark(r.left+r.width/2,r.top+r.height*.3,10,60,document.body);
    else{ var c=center(s); spark(c.x,c.y-s.offsetHeight*.2,10,60) }
  }
  function next(){
    if(!bag.length){ bag=PRAISE.filter(has); for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=bag[i];bag[i]=bag[j];bag[j]=t} }
    return bag.pop();
  }
  /* a praise sticker in free space (left or right of where the answer was given); no room, no sticker */
  function praise(at,big){
    if(off||!stage||!cur) return; var now=Date.now(); if(now-lastPraise<5200) return;
    var n=big||next(); if(!n) return; var c=at?center(at):{x:900,y:400}, wh=dims(n), sizes=big?[190,150,110]:[170,135,100], g=occupancy(cur,true), pos=null, w=0, h=0, i;
    for(i=0;i<sizes.length&&!pos;i++){ w=sizes[i]; h=Math.round(w*wh[1]/wh[0]); pos=find(g,c.x>640?120:1160,640,w+16,h+16,0) }
    if(!pos) return;
    lastPraise=now;
    var p=document.createElement('div'); p.className='stk-pop'; p.style.cssText='left:'+(pos[0]+8)+'px;top:'+(pos[1]+8)+'px;width:'+w+'px;height:'+h+'px;--r:'+((Math.random()*14-7).toFixed(1))+'deg';
    p.innerHTML=inner(n); stage.appendChild(p); spark(pos[0]+8+w/2,pos[1]+8+h/2,big?18:12,w*.75);
    setTimeout(function(){p.classList.add('out')},2900); setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p) },3500);
  }

  var ROW=/(^|\s)(qr|mr|rc|pq)(\s|$)/;
  function watch(){
    var m2=new MutationObserver(function(list){
      if(!ready||off||Date.now()-lastNav<900) return;
      for(var i=0;i<list.length;i++){
        var m=list[i], t=m.target, old=m.oldValue||'';
        if(t.nodeType!==1||!t.closest||!t.closest('.slide.on')) continue;
        var cl=t.className; if(typeof cl!=='string') continue;
        if(/(^|\s)ok-b(\s|$)/.test(cl)&&!/(^|\s)ok-b(\s|$)/.test(old)){ var c=center(t); spark(c.x,c.y,8,46) }
        if(/(^|\s)ok(\s|$)/.test(cl)&&!/(^|\s)ok(\s|$)/.test(old)&&ROW.test(cl)) praise(t);
        if(/(^|\s)score(\s|$)/.test(cl)&&/(^|\s)hide(\s|$)/.test(old)&&!/(^|\s)hide(\s|$)/.test(cl)){
          var b=t.querySelector('.msg'); if(b&&/ممتاز/.test(b.textContent)){ lastPraise=0; praise(t,'m_trophy') }
        }
      }
    });
    m2.observe(stage,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
  }

  /* ---- the faces of the drawn stickers look toward the pointer ---- */
  function eyes(){
    eyeRaf=0; if(off||px<0) return;
    Array.prototype.forEach.call(document.querySelectorAll('.stk[data-d]'),function(s){
      if(s.classList.contains('nospot')) return;
      var r=s.getBoundingClientRect(); if(!r.width) return;
      var dx=px-(r.left+r.width/2), dy=py-(r.top+r.height*.45), d=Math.sqrt(dx*dx+dy*dy)||1, k=Math.min(1,d/260)*3.4;
      s.style.setProperty('--ex',(dx/d*k).toFixed(2)+'px'); s.style.setProperty('--ey',(dy/d*k).toFixed(2)+'px');
    });
  }

  function btn(){
    return '<button class="tbtn" id="bStk" type="button" aria-label="الملصقات" aria-pressed="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.2 14.2Q12 18 15.8 14.2M9 9.6h.01M15 9.6h.01"/></svg><span>ملصقات</span></button>';
  }
  function set(v,save){
    off=!v; document.documentElement.classList.toggle('stk-off',off);
    var b=document.getElementById('bStk'); if(b){ b.setAttribute('aria-pressed',v?'true':'false'); var s=b.querySelector('span'); if(s) s.textContent=v?'ملصقات':'بدون'; }
    if(save){ try{localStorage.setItem(KEY,v?'1':'0')}catch(e){} }
    if(v&&cur) later();
  }
  function init(){ var v=true; try{ if(localStorage.getItem(KEY)==='0') v=false }catch(e){} set(v,false) }
  function mount(st){
    stage=st||null; init(); var b=document.getElementById('bStk'); if(b) b.addEventListener('click',function(){ set(off,true) });
    document.addEventListener('click',function(e){ var s=e.target.closest&&e.target.closest('.stk'); if(s&&!s.classList.contains('nospot')) poke(s) });
    document.addEventListener('pointermove',function(e){ px=e.clientX; py=e.clientY; if(!eyeRaf) eyeRaf=requestAnimationFrame(eyes) },{passive:true});
    if(stage){ watch(); setTimeout(function(){ready=true},400) }
  }
  return {html:html,deco:deco,btn:btn,mount:mount,init:init,spark:spark,praise:praise,has:has,arrive:arrive,leave:leave,
          navigated:function(){lastNav=Date.now()},toggle:function(){set(off,true)},_occ:function(el){return occupancy(el,false)}};
})();
