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
    root.innerHTML='<div class="pbl"></div><div class="pbl"></div><div class="pshade"></div>';
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
    key=k; root.classList.toggle('light',(LESSON.bgLight||[]).indexOf(k)>=0); root.classList.toggle('dim',(LESSON.bgDim||[]).indexOf(k)>=0);   /* a light picture (white frame) gets no dark shade */
    var n=cur<0?0:1-cur, o=cur<0?-1:cur;
    L[n].style.backgroundImage='url('+s+')'; L[n].style.zIndex=2; L[n].classList.add('on');
    if(o>=0){ L[o].style.zIndex=1; clearTimeout(tm); tm=setTimeout(function(){ L[o].classList.remove('on') },1000) }
    cur=n;
  }
  function cycle(){ on=!on; try{ localStorage.setItem('u4photo',on?'1':'0') }catch(e){} paint() }
  return {mount:mount,go:go,register:function(){},setTier:function(){},cycle:cycle,tier:function(){return 2},
          stats:function(){return {ema:0,frames:0,gl:false,tier:2,W:1280,H:720,S:1}},auto:function(){}};
})();
