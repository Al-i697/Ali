/* ---------- static photo backgrounds (the "photo" look): one picture per chapter or slide, a soft cross-fade between them, nothing zooms or drifts.
   It takes the place of bg.js in lessons built with skin 'photo' and keeps the same small interface the player uses (mount, go, tier, cycle...).
   The picture names are keys of BGIMG (see _core/tools/make_bg.py); LESSON.bgMap / LESSON.bgId give the key for each chapter / slide. ---------- */
var BG=(function(){
  var root=null,view=null,L=[],cur=-1,key='',on=true,tm=0;
  function src(k){ return (typeof BGIMG!=='undefined'&&BGIMG[k])||'' }
  function paint(){
    if(root) root.classList.toggle('off',!on);
    var b=document.getElementById('bFx'); if(!b) return;
    var s=b.querySelector('span'); if(s) s.textContent=on?'صورة':'سادة';
    b.setAttribute('aria-label','الخلفية: '+(on?'صورة':'لون سادة'));
  }
  function mount(v){
    view=v; root=document.createElement('div'); root.className='pbg'; root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="pl"></div><div class="pl"></div><div class="pshade"></div>';
    view.insertBefore(root,view.firstChild); L=[root.children[0],root.children[1]];
    var s=null; try{ s=localStorage.getItem('u4photo') }catch(e){}
    on=s!=='0';
    view.setAttribute('data-fx','2'); document.documentElement.setAttribute('data-fx','2');
    paint();
  }
  /* the new picture fades in on top of the old one; the old one is removed only when the new one is fully there (no dip in brightness) */
  function go(k,pal,dir){
    if(!root||k===key) return;
    var s=src(k); if(!s) return;
    key=k;
    var n=cur<0?0:1-cur, o=cur<0?-1:cur;
    L[n].style.backgroundImage='url('+s+')'; L[n].style.zIndex=2; L[n].classList.add('on');
    if(o>=0){ L[o].style.zIndex=1; clearTimeout(tm); tm=setTimeout(function(){ L[o].classList.remove('on') },1000) }
    cur=n;
  }
  function cycle(){ on=!on; try{ localStorage.setItem('u4photo',on?'1':'0') }catch(e){} paint() }
  return {mount:mount,go:go,register:function(){},setTier:function(){},cycle:cycle,tier:function(){return 2},
          stats:function(){return {ema:0,frames:0,gl:false,tier:2,W:1280,H:720,S:1}},auto:function(){}};
})();

/* text that sits straight on the photograph (not inside a card) gets a quiet dark plate, so it stays readable over any picture.
   Called by the player for every slide it builds; the class 'free' is styled in skin_photo.css (no padding, so nothing moves). */
var SKIN=(function(){
  var CARD='.panel,.frm,.mod,.qd,.rc,.mrc,.pq,.goal,.tq,.sent,.stp,.rcard,.tile,.opt,.btn,.qr,.cls,.tray,.mtray,.mslot,.pf,.zone,.pill,.chip,.callout,.gbar,.ls,.gi,.team,.score,.tag,.fb,.hd,.nav,.steps,.rd,button,input,select,table,svg,[data-pt]';
  function slide(el){
    /* the title gets a plate that hugs its text */
    var h=el.querySelector('.hd h2'); if(h&&!h.querySelector('.tp')) h.innerHTML='<span class="tp">'+h.innerHTML+'</span>';
    /* answer buttons that are not inside a card stand straight on the picture: they become solid cards themselves */
    var BOX='.panel,.frm,.mod,.qd,.rc,.mrc,.pq,.goal,.tq,.sent,.stp,.rcard,.tile,.qr,.cls,.tray,.mtray,.zone';
    Array.prototype.forEach.call(el.querySelectorAll('.opt'),function(o){ if(!o.parentElement.closest(BOX)) o.classList.add('solo') });
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),t,seen=[];
    while((t=w.nextNode())){
      if(!t.nodeValue.trim()) continue;
      var p0=t.parentElement; if(!p0||p0.closest(CARD)) continue;
      var p=p0;
      while(p&&p!==el&&/^(inline|inline-block|contents)$/.test(getComputedStyle(p).display)) p=p.parentElement;
      if(p&&p!==el&&p.querySelector(CARD)) p=p0;   /* the container also holds buttons or cards: plate only the text itself */
      if(!p||p===el||p.classList.contains('body')||seen.indexOf(p)>=0||(p!==p0&&p.querySelector(CARD))) continue;
      seen.push(p); p.classList.add('free');
    }
  }
  return {slide:slide};
})();
