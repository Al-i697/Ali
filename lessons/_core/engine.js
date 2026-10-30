/* ---------- engine: helpers, interaction kit, navigation ---------- */
var SLIDES=[], CUR=-1, SC={};
/* lesson settings come from the lesson's config.js: chapters, a background scene and a colour palette per chapter (and per slide id) */
var CHAPTERS=LESSON.chapters, BGMAP=LESSON.bgMap, BGID=LESSON.bgId||{}, PALCH=LESSON.palCh, PALID=LESSON.palId||{};
function slide(o){SLIDES.push(o)}
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function later(fn,ms){return setTimeout(fn,ms)}
var AD='٠١٢٣٤٥٦٧٨٩';
function nz(s){
  s=String(s==null?'':s).replace(/[٠-٩]/g,function(d){return AD.indexOf(d)}).replace(/[٫,،]/g,'.').replace(/\s/g,'');
  var v=parseFloat(s); return isNaN(v)?null:v;
}
function ar(n){return String(n).replace(/[0-9]/g,function(d){return AD[+d]})}
function fmt(v,d){return (Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toFixed(d)}
function stageScale(){var st=$('.stage'); return st.getBoundingClientRect().width/1280 || 1}
function sub(f){return f.replace(/([A-Za-z\)])(\d+)/g,'$1<sub>$2</sub>')}

/* ---- numeric answer box: <span class="nin"><input><button class="go"></span><div class="fb"> ---- */
function ninHTML(id,unit,cls){
  return '<span class="nin '+(cls||'')+'" data-n="'+id+'"><input inputmode="decimal" autocomplete="off" aria-label="الإجابة"><button class="go" type="button" aria-label="تحقق">✓</button>'+(unit?'<span class="u">'+unit+'</span>':'')+'</span>';
}
function bindNum(box,ans,tol,res){
  var inp=$('input',box), go=$('.go',box), done=false, tries=0;
  function chk(){
    if(done) return;
    var v=nz(inp.value);
    if(v===null){inp.classList.add('shake'); later(function(){inp.classList.remove('shake')},340); return}
    var ok=Math.abs(v-ans)<=tol;
    inp.classList.remove('ok-b','bad-b'); void inp.offsetWidth;
    if(ok){done=true; inp.classList.add('ok-b'); inp.readOnly=true; go.classList.add('hide')}
    else{tries++; inp.classList.add('bad-b','shake'); later(function(){inp.classList.remove('shake')},340)}
    if(res) res(ok,v,tries);
  }
  go.addEventListener('click',chk);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault(); chk()}});
  inp.addEventListener('input',function(){inp.classList.remove('bad-b')});
  return {check:chk,reveal:function(){inp.value=String(ans); done=true; inp.classList.add('ok-b'); inp.readOnly=true; go.classList.add('hide')}};
}
function say(el,msg,kind){ if(!el) return; el.textContent=msg||''; el.className='fb'+(kind?' '+kind:''); if(msg){el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop')} }

/* ---- multiple choice ---- */
function optsHTML(opts,inline){
  var L='أبجدهـ';
  return '<div class="opts">'+opts.map(function(o,i){return '<button type="button" class="opt" data-i="'+i+'"><span class="ix">'+L[i]+'</span><span>'+o.t+'</span></button>'}).join('')+'</div>';
}
function bindMcq(root,opts,fb,onDone){
  var tries=0, done=false;
  $$('.opt',root).forEach(function(b){
    b.addEventListener('click',function(){
      if(done||b.classList.contains('locked')) return;
      var o=opts[+b.getAttribute('data-i')];
      if(o.ok){
        done=true; b.classList.add('ok-b'); $$('.opt',root).forEach(function(x){x.classList.add('locked')});
        say(fb,'✓ '+(o.why||'صح'),'ok'); if(onDone) onDone(tries===0);
      }else{
        tries++; b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340);
        say(fb,o.why||'حاول مرة ثانية','bad');
      }
    });
  });
}

/* ---- class poll: teacher or students tap + for each raised hand ---- */
function pollHTML(opts){
  var L='أبجد';
  return '<div class="poll">'+opts.map(function(o,i){
    return '<div class="pr" data-i="'+i+'"><div class="bar"></div><div class="t"><span class="ix">'+L[i]+'</span><span>'+o+'</span></div><div class="cnt"><button type="button" data-d="-1" aria-label="أنقص">−</button><b>0</b><button type="button" data-d="1" aria-label="زِد">+</button></div></div>';
  }).join('')+'</div>';
}
function bindPoll(root,right,onReveal){
  var rows=$$('.pr',root), n=rows.map(function(){return 0});
  function paint(){
    var t=n.reduce(function(a,b){return a+b},0);
    rows.forEach(function(r,i){ $('b',r).textContent=n[i]; $('.bar',r).style.width=(t?Math.round(n[i]/t*100):0)+'%'; });
  }
  rows.forEach(function(r,i){
    $$('button',r).forEach(function(b){b.addEventListener('click',function(){
      var d=+b.getAttribute('data-d'); n[i]=Math.max(0,n[i]+d); paint();
    })});
  });
  return {reveal:function(){
    rows.forEach(function(r,i){r.classList.toggle('right',i===right); r.classList.toggle('dim',i!==right)});
    if(onReveal) onReveal();
  }};
}

/* ---- drag & drop (pointer events; works with mouse, pen and touch whiteboards) ---- */
function drag(item,o){
  var sx=0, sy=0, moved=false, S=1, hot=null;
  function zoneAt(e){
    item.style.pointerEvents='none';
    var el=document.elementFromPoint(e.clientX,e.clientY);
    item.style.pointerEvents='';
    return el&&el.closest?el.closest(o.zone):null;
  }
  item.addEventListener('pointerdown',function(e){
    if(e.button>0||item.classList.contains('locked')) return;
    e.preventDefault();
    try{item.setPointerCapture(e.pointerId)}catch(x){}
    S=stageScale(); sx=e.clientX; sy=e.clientY; moved=false;
    item.classList.remove('back'); item.classList.add('drag');
  });
  item.addEventListener('pointermove',function(e){
    if(!item.classList.contains('drag')) return;
    var dx=(e.clientX-sx)/S, dy=(e.clientY-sy)/S;
    if(Math.abs(dx)+Math.abs(dy)>6) moved=true;
    item.style.transform='translate('+dx+'px,'+dy+'px)';
    var z=zoneAt(e); if(z!==hot){ if(hot) hot.classList.remove('hot'); hot=z; if(hot) hot.classList.add('hot') }
  });
  function end(e){
    if(!item.classList.contains('drag')) return;
    item.classList.remove('drag');
    var z=moved?zoneAt(e):null;
    if(hot){hot.classList.remove('hot'); hot=null}
    if(!moved){ item.style.transform=''; if(o.tap) o.tap(item); return }
    var ok=false;
    if(z&&o.drop) ok=o.drop(item,z);
    if(ok){item.style.transform=''}
    else{item.classList.add('back'); item.style.transform=''; later(function(){item.classList.remove('back')},300)}
  }
  item.addEventListener('pointerup',end);
  item.addEventListener('pointercancel',end);
}

/* ---- ticket: a few quick questions, one at a time, with a score ---- */
function ticketHTML(items){
  return '<div class="tk"><div class="tkbar"><div class="rounds">'+items.map(function(_,i){return '<span class="rd">'+ar(i+1)+'</span>'}).join('')+'</div><span class="sm muted">سؤال واحد في كل مرة</span></div>'+
    items.map(function(it,i){
      var body = it.type==='num'
        ? '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">'+ninHTML('t'+i,it.unit)+'</div>'
        : optsHTML(it.opts);
      return '<div class="tq" data-i="'+i+'"><h4><i>'+ar(i+1)+'</i><span>'+it.q+'</span></h4>'+body+'<div class="fb"></div></div>';
    }).join('')+
    '<div><button class="btn acc hide" type="button" id="tkn">السؤال التالي ▸</button></div>'+
    '<div class="score hide"><span>نتيجتك</span><b class="num"></b><span class="msg"></span></div></div>';
}
function bindTicket(el,items,key){
  var got=0, idx=0, qs=$$('.tq',el), rds=$$('.rd',el), nb=$('#tkn',el);
  function show(i){
    idx=i; qs.forEach(function(q,j){q.classList.toggle('cur',j===i)});
    rds.forEach(function(r,j){r.className='rd'+(j<i?' done':(j===i?' cur':''))});
    nb.classList.add('hide');
  }
  function finish(first){
    if(first) got++;
    SC[key]={got:got,total:items.length};
    if(idx<items.length-1){ nb.textContent='السؤال التالي ▸'; nb.classList.remove('hide'); nb.classList.add('pop') }
    else { nb.textContent='اعرض النتيجة ▸'; nb.classList.remove('hide'); nb.classList.add('pop') }
  }
  nb.addEventListener('click',function(){
    if(idx<items.length-1){ show(idx+1) }
    else{
      qs.forEach(function(q){q.classList.remove('cur')}); nb.classList.add('hide'); rds.forEach(function(r){r.className='rd done'});
      var s=$('.score',el); s.classList.remove('hide'); s.classList.add('pop');
      $('b',s).textContent=got+' / '+items.length;
      $('.msg',s).textContent = got===items.length?'ممتاز! الفكرة واضحة 🎉':(got>=items.length-1?'قريب جداً 👏':'نراجع النقاط اللي أخطأنا فيها 💪');
    }
  });
  qs.forEach(function(q,i){
    var it=items[i], fb=$('.fb',q);
    if(it.type==='num'){
      bindNum($('.nin',q),it.ans,it.tol||0.01,function(ok,v,tries){
        if(ok){say(fb,'✓ '+(it.why||'صح'),'ok'); finish(tries===0)}
        else say(fb,it.hint||'راجع الحساب وحاول مرة ثانية','bad');
      });
    }else bindMcq(q,it.opts,fb,finish);
  });
  show(0);
}

/* ---- sphere helpers for SVG models ---- */
var ELC={P:['#E8A33D','#3a2300'],K:['#C9A6EE','#2a0e4a'],H:['#F2F5F5','#243b3f'],C:['#3A3F45','#fff'],N:['#3F6FD8','#fff'],O:['#E0453A','#fff'],Cl:['#5CBF4A','#06290f'],Br:['#9B4A2F','#fff'],F:['#8ED26B','#10300a'],I:['#7B4FA3','#fff'],Na:['#A878E0','#1e0a3a'],Si:['#8E959C','#fff'],B:['#E9A4A0','#40100c'],Al:['#9FB4C7','#0b1e30'],Mg:['#6FA8E4','#06223d'],He:['#F5A93A','#4a2a00']};
var GR={H:1,C:1,N:1,O:1,Cl:1,Br:1,F:1,I:1,Na:1,Si:1,B:1,Al:1,Mg:1,He:1,P:1,K:1};
function sph(x,y,r,sym,o){
  o=o||{}; var c=ELC[sym]||['#ccc','#000'], fs=o.fs||Math.max(14,r*.9);
  return '<g class="sph" data-el="'+sym+'" '+(o.id?'data-id="'+o.id+'" ':'')+'><circle class="s" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(GR[sym]?'url(#g'+sym+')':c[0])+'" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>'+(o.label===false?'':'<text direction="ltr" x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-family="Baloo Bhaijaan 2,Tajawal,sans-serif" font-weight="800" font-size="'+fs+'" fill="'+c[1]+'" style="pointer-events:none">'+(o.text||sym)+'</text>')+'</g>';
}
function bond(x1,y1,x2,y2,w){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#9aa9ac" stroke-width="'+(w||9)+'" stroke-linecap="round"/>'}

/* ---- navigation ---- */
var APP, STAGE, VIEW, NOTE, IDX, PROG, BTN_N, BTN_P, WHERE;
function build(i){
  var s=SLIDES[i]; if(s.el) return s.el;
  var el=document.createElement('section'); el.className='slide'; el.setAttribute('data-id',s.id); el.setAttribute('data-pal',PALID[s.id]||PALCH[s.ch]||'emerald');
  var head = s.bare ? '' : '<div class="hd"><span class="chip">'+CHAPTERS[s.ch]+'</span><h2>'+s.title+'</h2>'+(s.tag?'<span class="tag"><svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'+s.tag+'</span>':'')+'</div>';
  el.innerHTML=head+(s.bare?s.html():'<div class="body">'+s.html()+'</div>');
  if(s.cls) el.classList.add(s.cls);
  if(typeof STK!=='undefined'&&LESSON.stk) STK.deco(el,LESSON.stk[s.id]);
  STAGE.appendChild(el); s.el=el;
  if(s.init) s.init(el,s);
  return el;
}
function show(i,dir){
  if(i<0||i>=SLIDES.length||i===CUR) return;
  if(typeof STK!=='undefined') STK.navigated();
  var prev=CUR, s=SLIDES[i], el=build(i), pl=MOT.plan(i,prev,BG.tier());
  el.classList.remove('off');
  if(prev>=0){
    var pe=SLIDES[prev].el; pe.classList.remove('on'); pe.classList.add('off'); MOT.mark(pe,pl,dir);
    (function(p){var t=p._tk=(p._tk||0)+1; later(function(){if(p._tk===t){p.classList.remove('off'); MOT.unmark(p)}},pl.ms)})(pe);
    if(SLIDES[prev].leave) SLIDES[prev].leave(pe);
  }
  MOT.mark(el,pl,dir); void el.offsetWidth; el.classList.add('on');
  (function(e){var t=e._tk=(e._tk||0)+1; later(function(){if(e._tk===t) MOT.unmark(e)},pl.ms+60)})(el);
  CUR=i;
  STAGE.classList.toggle('lab',s.theme==='lab');
  var pal=PALID[s.id]||PALCH[s.ch]||'emerald';
  BG.go(BGID[s.id]||BGMAP[s.ch]||'atomic',pal,dir);
  APP.setAttribute('data-pal',pal);
  MOT.enter(el,pl);
  if(s.enter) s.enter(el);
  paintChrome();
  try{history.replaceState(null,'','#s'+(i+1))}catch(e){}
}
function next(){ if(CUR<SLIDES.length-1) show(CUR+1,1) }
function prevS(){ if(CUR>0) show(CUR-1,-1) }
function paintChrome(){
  var s=SLIDES[CUR];
  $$('.seg',PROG).forEach(function(b,j){b.classList.toggle('cur',j===CUR); b.classList.toggle('done',j<CUR); b.classList.toggle('act',!!SLIDES[j].tag && j!==CUR)});
  BTN_P.disabled=CUR===0; BTN_N.disabled=CUR===SLIDES.length-1;
  WHERE.innerHTML='<b>'+(s.title||LESSON.short)+'</b><small>'+CHAPTERS[s.ch]+' · '+ar(CUR+1)+' من '+ar(SLIDES.length)+'</small>';
  NOTE.innerHTML='<h4>ملاحظة المعلم</h4>'+(s.note||'<p>لا توجد ملاحظة لهذه الشريحة.</p>');
  $$('.it',IDX).forEach(function(b,j){b.classList.toggle('cur',j===CUR)});
}
function fit(){
  var w=VIEW.clientWidth, h=VIEW.clientHeight;
  STAGE.style.setProperty('--s',Math.min(w/1280,h/720).toFixed(4));
}
function boot(){
  document.body.insertAdjacentHTML('afterbegin',
   '<div class="app">'+
    '<header class="top"><div class="brand"><i><small>6</small>C</i><span>كيمياء<em>'+LESSON.brand+'</em></span></div>'+
    '<div class="prog" id="prog" role="tablist" aria-label="شرائح الدرس"></div>'+
    (LESSON.home?'<a class="tbtn" id="bHome" href="'+LESSON.home+'" aria-label="كل الدروس"><svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg><span>الدروس</span></a>':'')+
    '<button class="tbtn" id="bFx" type="button" aria-label="الخلفية"><svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/></svg><span>كاملة</span></button>'+
    (typeof STK!=='undefined'?STK.btn():'')+
    '<button class="tbtn" id="bNote" type="button" aria-label="ملاحظة المعلم"><svg viewBox="0 0 24 24"><path d="M5 4h14v12H9l-4 4z"/></svg><span>المعلم</span></button>'+
    '<button class="tbtn" id="bIdx" type="button" aria-label="فهرس الدرس"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>'+
    '<button class="tbtn" id="bFs" type="button" aria-label="ملء الشاشة"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></header>'+
    '<main class="view" id="view"><div class="stage" id="stage"></div><aside class="note" id="note" aria-live="polite"></aside><div class="idx" id="idx"><div class="sheet"></div></div><div class="rot">للحصول على أفضل عرض، أدر الجهاز أفقياً</div></main>'+
    '<footer class="bot"><button class="nav prev" id="bPrev" type="button"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>السابق</button><div class="where" id="where"></div><button class="nav next" id="bNext" type="button">التالي<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button></footer>'+
   '</div>');
  document.body.insertAdjacentHTML('afterbegin',defsSVG());
  APP=$('.app'); STAGE=$('#stage'); VIEW=$('#view'); BG.mount(VIEW); if(typeof STK!=='undefined') STK.mount(STAGE); NOTE=$('#note'); IDX=$('#idx'); PROG=$('#prog'); BTN_N=$('#bNext'); BTN_P=$('#bPrev'); WHERE=$('#where');
  var lastCh=-1;
  SLIDES.forEach(function(s,i){
    var b=document.createElement('button'); b.type='button'; b.className='seg'+(s.ch!==lastCh&&i>0?' gap':''); b.setAttribute('aria-label',s.title||'الغلاف');
    b.title=(s.title||'الغلاف'); lastCh=s.ch; b.addEventListener('click',function(){show(i,i>CUR?1:-1)}); PROG.appendChild(b);
  });
  var sh=$('.sheet',IDX), html='<h3>فهرس الدرس</h3>', lc=-1;
  SLIDES.forEach(function(s,i){
    if(s.ch!==lc){html+='<div class="grp">'+CHAPTERS[s.ch]+'</div>'; lc=s.ch}
    html+='<button type="button" class="it" data-i="'+i+'"><i>'+ar(i+1)+'</i>'+(s.title||'الغلاف')+'</button>';
  });
  sh.innerHTML=html;
  $$('.it',sh).forEach(function(b){b.addEventListener('click',function(){var i=+b.getAttribute('data-i'); IDX.classList.remove('open'); show(i,i>CUR?1:-1)})});
  IDX.addEventListener('click',function(e){if(e.target===IDX) IDX.classList.remove('open')});
  BTN_N.addEventListener('click',next); BTN_P.addEventListener('click',prevS);
  $('#bFx').addEventListener('click',function(){BG.cycle()});
  $('#bNote').addEventListener('click',function(){NOTE.classList.toggle('open')});
  $('#bIdx').addEventListener('click',function(){IDX.classList.toggle('open')});
  $('#bFs').addEventListener('click',function(){
    try{ var pr=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen(); if(pr&&pr.catch) pr.catch(function(){}) }catch(x){}
  });
  document.addEventListener('keydown',function(e){
    var t=e.target&&e.target.tagName; if(t==='INPUT'||t==='TEXTAREA') return;
    var k=e.key;
    if(k==='ArrowLeft'||k==='PageDown'||k===' '){e.preventDefault(); next()}
    else if(k==='ArrowRight'||k==='PageUp'){e.preventDefault(); prevS()}
    else if(k==='Home'){show(0,-1)} else if(k==='End'){show(SLIDES.length-1,1)}
    else if(k==='n'||k==='N'||k==='ن'){NOTE.classList.toggle('open')}
    else if(k==='g'||k==='G'||k==='ل'){IDX.classList.toggle('open')}
    else if(k==='f'||k==='F'||k==='ب'){$('#bFs').click()}
    else if(k==='Escape'){IDX.classList.remove('open'); NOTE.classList.remove('open')}
  });
  window.addEventListener('resize',fit); fit();
  var h=0; try{ var m=/^#s(\d+)$/.exec(location.hash); if(m) h=Math.min(SLIDES.length,Math.max(1,+m[1]))-1 }catch(e){}
  show(h,1);
}
