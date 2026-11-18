/* ---------- teacher tools in the player (teacher's request, November 2026): pen, highlighter, eraser, laser pointer, timer, blank screen.
   The «أدوات» button in the top bar opens a small dock on the left edge of the slide; every tool also has a key (physical keys, so the Arabic layout works too):
     P pen · H highlighter · E eraser · L laser · T timer · B blank screen · C clear the slide's drawing · Ctrl+Z undo · Esc leave the tool
   Drawings belong to the slide they were made on (kept in memory until the page is closed) and are stored in stage coordinates (1280×720), so they scale with the stage.
   While the pen, highlighter or eraser is on, the slide itself is not clickable; press Esc or the same tool again to go back to the slide. The laser and the timer never block the slide. ---------- */
var TOOLS=(function(){
  var COLS=['#FFD54A','#FF5A4E','#4DD0FF','#6BE58A','#FFFFFF'], COLN=['أصفر','أحمر','أزرق','أخضر','أبيض'];
  var S={tool:'',col:0,open:false}, strokes={}, undone={}, cv,cx,dock,dot,tmr,blank,toast,btn, cur=0, live=null, tt=0;
  var T={total:180,left:180,end:0,iv:0,run:false,over:false};
  var NAMES={pen:'القلم',hl:'التظليل',er:'الممحاة',laser:'المؤشر الليزري'};
  var IC={
    pen:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
    hl:'<path d="M9 15l7.5-7.5 3 3L12 18H9z"/><path d="M5 21h7"/>',
    er:'<path d="M7 18l-3-3 9.5-9.5 6 6L12 18z"/><path d="M12 18h8"/>',
    laser:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h9a6 6 0 0 1 0 12h-3"/>',
    clear:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    timer:'<circle cx="12" cy="13.5" r="7"/><path d="M12 9.5v4l2.6 2M9 3h6"/>',
    blank:'<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    tools:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>'
  };
  function svg(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[k]+'</svg>'}
  function el(h){var d=document.createElement('div'); d.innerHTML=h; return d.firstElementChild}
  function pad(n){return (n<10?'0':'')+n}
  function say(t){ toast.textContent=t; toast.classList.add('on'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('on')},2600) }

  /* ----- drawing ----- */
  function list(){return strokes[cur]||(strokes[cur]=[])}
  function paint(){
    cx.clearRect(0,0,1280,720);
    var all=list().concat(live&&!live.er?[live]:[]);
    all.forEach(function(s){
      if(!s.p.length) return;
      cx.save(); cx.lineCap='round'; cx.lineJoin='round'; cx.strokeStyle=s.c; cx.lineWidth=s.w; cx.globalAlpha=s.h?0.38:1;
      cx.beginPath(); cx.moveTo(s.p[0][0],s.p[0][1]);
      if(s.p.length===1) cx.lineTo(s.p[0][0]+0.01,s.p[0][1]);
      for(var i=1;i<s.p.length-1;i++){ var a=s.p[i], b=s.p[i+1]; cx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2) }
      if(s.p.length>1){ var z=s.p[s.p.length-1]; cx.lineTo(z[0],z[1]) }
      cx.stroke(); cx.restore();
    });
  }
  function pt(e){var r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*1280/r.width,(e.clientY-r.top)*720/r.height]}
  function down(e){
    if(!S.tool||S.tool==='laser'||e.button>0) return;
    e.preventDefault(); try{cv.setPointerCapture(e.pointerId)}catch(x){}
    var p=pt(e);
    if(S.tool==='er'){ live={er:true}; erase(p); return }
    live={c:COLS[S.col],w:S.tool==='hl'?30:5,h:S.tool==='hl',p:[p]}; paint();
  }
  function move(e){
    if(!live) return;
    var p=pt(e);
    if(live.er){ erase(p); return }
    var q=live.p[live.p.length-1]; if(Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])<1.5) return;
    live.p.push(p); paint();
  }
  function up(){
    if(!live) return;
    if(!live.er) list().push(live);
    live=null; paint(); syncBtns();
  }
  function erase(p){
    var l=list(), n=l.length;
    strokes[cur]=l.filter(function(s){ return !s.p.some(function(q){var dx=q[0]-p[0], dy=q[1]-p[1]; return dx*dx+dy*dy<(s.h?24*24:16*16)}) });
    if(strokes[cur].length!==n){ paint(); syncBtns() }
  }
  function undo(){
    var l=list();
    if(l.length){ l.pop(); paint() }
    else if(undone[cur]&&undone[cur].cleared){ strokes[cur]=undone[cur].cleared; undone[cur]=null; paint() }
    syncBtns();
  }
  function clearAll(){
    var l=list(); if(!l.length) return;
    undone[cur]={cleared:l.slice()}; strokes[cur]=[]; paint(); syncBtns(); say('تم مسح الرسم · Ctrl+Z للتراجع');
  }

  /* ----- tools on / off ----- */
  function setTool(t){
    if(S.tool===t) t='';
    S.tool=t; live=null;
    var draw=t==='pen'||t==='hl'||t==='er';
    cv.classList.toggle('on',draw); cv.setAttribute('data-tool',t);
    document.body.classList.toggle('tl-laser',t==='laser'); document.body.classList.toggle('tl-draw',draw);
    dot.classList.remove('on');
    if(t&&!S.open) openDock(true);
    if(t) say(NAMES[t]+(t==='laser'?' · حرّك المؤشر فوق الشريحة':' · اضغط Esc أو الأداة نفسها للرجوع إلى الشريحة'));
    syncBtns();
  }
  function openDock(on){
    S.open=on; dock.hidden=!on; btn.setAttribute('aria-pressed',on?'true':'false'); btn.classList.toggle('acc',on);
    if(!on&&S.tool) setTool(S.tool);
  }
  function syncBtns(){
    ['pen','hl','er','laser'].forEach(function(k){var b=dock.querySelector('[data-t="'+k+'"]'); b.classList.toggle('act',S.tool===k); b.setAttribute('aria-pressed',S.tool===k?'true':'false')});
    dock.querySelector('[data-t="undo"]').disabled=!(list().length||(undone[cur]&&undone[cur].cleared));
    dock.querySelector('[data-t="clear"]').disabled=!list().length;
    dock.querySelector('[data-t="timer"]').classList.toggle('act',!tmr.hidden);
    dock.querySelectorAll('.sw').forEach(function(s,i){s.classList.toggle('act',i===S.col)});
  }

  /* ----- laser ----- */
  function laserMove(e){
    if(S.tool!=='laser') return;
    var r=dot.parentNode.getBoundingClientRect();
    dot.style.transform='translate('+(e.clientX-r.left)+'px,'+(e.clientY-r.top)+'px)'; dot.classList.add('on');
  }

  /* ----- timer ----- */
  function showT(){
    var m=Math.floor(T.left/60), s=T.left%60;
    tmr.querySelector('.tt').textContent=pad(m)+':'+pad(s);
    tmr.classList.toggle('low',T.left<=10&&T.left>0&&T.run); tmr.classList.toggle('over',T.over);
    tmr.querySelector('[data-a="go"]').innerHTML=svgPlay(T.run);
    tmr.querySelector('.tl').textContent=T.over?'انتهى الوقت':(T.run?'جارٍ العدّ':'المؤقت');
  }
  function svgPlay(run){return run?'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>'}
  function tick(){
    var left=Math.max(0,Math.ceil((T.end-Date.now())/1000));
    if(left!==T.left){ T.left=left; showT() }
    if(left<=0){ stopT(); T.over=true; showT(); beep() }
  }
  function startT(){
    if(T.left<=0){ T.left=T.total } T.over=false; T.end=Date.now()+T.left*1000; T.run=true; clearInterval(T.iv); T.iv=setInterval(tick,200); showT();
  }
  function stopT(){ T.run=false; clearInterval(T.iv); showT() }
  function setT(sec){ stopT(); T.total=T.left=sec; T.over=false; showT() }
  function beep(){
    try{
      var A=window.AudioContext||window.webkitAudioContext; if(!A) return; var c=new A();
      [0,0.38,0.76].forEach(function(d){var o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=880; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(0.0001,c.currentTime+d); g.gain.exponentialRampToValueAtTime(0.35,c.currentTime+d+0.03); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+d+0.3); o.start(c.currentTime+d); o.stop(c.currentTime+d+0.32)});
      setTimeout(function(){try{c.close()}catch(x){}},1600);
    }catch(x){}
  }
  function toggleTimer(){
    tmr.hidden=!tmr.hidden; if(tmr.hidden){ stopT() } else { showT(); if(!S.open) openDock(true) }
    syncBtns();
  }
  function dragTimer(e){
    if(e.target.closest('button')) return;
    var r=tmr.getBoundingClientRect(), pr=tmr.parentNode.getBoundingClientRect(), ox=e.clientX-r.left, oy=e.clientY-r.top;
    tmr.setPointerCapture(e.pointerId);
    function mv(ev){ tmr.style.left=Math.max(0,Math.min(pr.width-r.width,ev.clientX-pr.left-ox))+'px'; tmr.style.top=Math.max(0,Math.min(pr.height-r.height,ev.clientY-pr.top-oy))+'px'; tmr.style.bottom='auto' }
    function en(){ tmr.removeEventListener('pointermove',mv); tmr.removeEventListener('pointerup',en) }
    tmr.addEventListener('pointermove',mv); tmr.addEventListener('pointerup',en);
  }

  /* ----- blank screen ----- */
  function setBlank(on){ blank.hidden=!on; document.body.classList.toggle('tl-blank',on) }

  /* ----- keys: physical keys, in the capture phase so the player's own handler does not also act on them ----- */
  function key(e){
    var t=e.target&&e.target.tagName; if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT') return;
    if(e.altKey||e.metaKey) return;
    if(!blank.hidden){ if(/^(Shift|Control|Alt|Meta|CapsLock)/.test(e.key)) return; e.preventDefault(); e.stopImmediatePropagation(); setBlank(false); return }
    var c=e.code, hit=true;
    if(e.ctrlKey){ if(c==='KeyZ'){ e.preventDefault(); e.stopImmediatePropagation(); undo() } return }
    if(c==='KeyP') setTool('pen'); else if(c==='KeyH') setTool('hl'); else if(c==='KeyE') setTool('er'); else if(c==='KeyL') setTool('laser');
    else if(c==='KeyT') toggleTimer(); else if(c==='KeyB') setBlank(true); else if(c==='KeyC') clearAll();
    else if(c==='Escape'&&S.tool) setTool(S.tool); else hit=false;
    if(hit){ e.preventDefault(); e.stopImmediatePropagation() }
  }

  /* ----- build ----- */
  function init(){
    var view=document.getElementById('view'), stage=document.getElementById('stage'); if(!view||!stage) return;
    cv=el('<canvas class="tcv" width="2560" height="1440" aria-hidden="true"></canvas>'); cx=cv.getContext('2d'); cx.scale(2,2); stage.appendChild(cv);
    dot=el('<div class="tlaser" aria-hidden="true"></div>'); view.appendChild(dot);
    toast=el('<div class="ttoast" role="status" aria-live="polite"></div>'); view.appendChild(toast);
    blank=el('<div class="tblank" hidden><span>اضغط أي مفتاح أو انقر للعودة</span></div>'); view.appendChild(blank);
    var tb=function(k,lab,key){return '<button type="button" class="tb" data-t="'+k+'" title="'+lab+(key?' ('+key+')':'')+'" aria-label="'+lab+'">'+svg(k)+'<span>'+lab+'</span></button>'};
    dock=el('<div class="tdock" hidden role="toolbar" aria-label="أدوات المعلم">'+tb('pen','قلم','P')+tb('hl','تظليل','H')+tb('er','ممحاة','E')+tb('laser','ليزر','L')+
      '<div class="sws" role="group" aria-label="اللون">'+COLS.map(function(c,i){return '<button type="button" class="sw" data-c="'+i+'" style="--c:'+c+'" title="'+COLN[i]+'" aria-label="'+COLN[i]+'"></button>'}).join('')+'</div>'+
      tb('undo','تراجع','Ctrl+Z')+tb('clear','مسح','C')+'<hr>'+tb('timer','مؤقت','T')+tb('blank','فارغة','B')+'</div>'); view.appendChild(dock);
    tmr=el('<div class="ttmr" hidden role="timer" aria-label="مؤقت"><div class="tl">المؤقت</div><div class="tt" dir="ltr">03:00</div>'+
      '<div class="tr"><button type="button" data-a="m" title="دقيقة أقل" aria-label="دقيقة أقل">−</button><button type="button" data-a="go" class="go" aria-label="ابدأ أو أوقف"></button><button type="button" data-a="p" title="دقيقة أكثر" aria-label="دقيقة أكثر">+</button><button type="button" data-a="rs" title="إعادة" aria-label="إعادة">↺</button><button type="button" data-a="x" title="إغلاق" aria-label="إغلاق">×</button></div>'+
      '<div class="tp">'+[1,3,5,10].map(function(m){return '<button type="button" data-m="'+m+'">'+m+'</button>'}).join('')+'<small>دقائق</small></div></div>'); view.appendChild(tmr);
    btn=el('<button class="tbtn" id="bTools" type="button" aria-label="أدوات المعلم" aria-pressed="false">'+svg('tools')+'<span>أدوات</span></button>');
    var nb=document.getElementById('bNote'); nb.parentNode.insertBefore(btn,nb);
    btn.addEventListener('click',function(){openDock(!S.open)});
    dock.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.classList.contains('sw')){ S.col=+b.getAttribute('data-c'); if(S.tool==='er'||!S.tool) setTool('pen'); syncBtns(); return }
      var t=b.getAttribute('data-t');
      if(t==='pen'||t==='hl'||t==='er'||t==='laser') setTool(t); else if(t==='undo') undo(); else if(t==='clear') clearAll(); else if(t==='timer') toggleTimer(); else if(t==='blank') setBlank(true);
    });
    tmr.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      var a=b.getAttribute('data-a'), m=b.getAttribute('data-m');
      if(m) setT(+m*60);
      else if(a==='go'){ if(T.run) stopT(); else startT() }
      else if(a==='p') setT(Math.min(99*60,T.total+60)); else if(a==='m') setT(Math.max(60,T.total-60));
      else if(a==='rs') setT(T.total); else if(a==='x') toggleTimer();
    });
    tmr.addEventListener('pointerdown',dragTimer);
    blank.addEventListener('click',function(){setBlank(false)});
    cv.addEventListener('pointerdown',down); cv.addEventListener('pointermove',move); cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    view.addEventListener('pointermove',laserMove); view.addEventListener('pointerleave',function(){dot.classList.remove('on')});
    window.addEventListener('keydown',key,true);
    showT(); syncBtns();
  }
  function slideChanged(i){ cur=i; if(cv){ live=null; paint(); syncBtns() } }
  return {init:init, slide:slideChanged, state:S};
})();
/* hooks: build the tools after the player is built, and swap the drawing whenever the slide changes */
(function(){
  var _b=boot, _p=paintChrome;
  boot=function(){ _b(); TOOLS.init(); TOOLS.slide(CUR) };
  paintChrome=function(){ _p(); TOOLS.slide(CUR) };
})();
