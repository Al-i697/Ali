/* «توقّع ثم اكتشف» for the virtual labs and activities (teacher's request, November 2026).
   When a lab slide opens, a card asks for a prediction first (the class says it, the teacher taps it). The lab then runs as usual;
   when its result appears the card comes back with the verdict: the prediction, the right answer and the reason.
   A lesson lists its predictions in src/pages.js:
     var PREDICT={ lab:{q:'…؟', opts:['…','…','…'], ok:1, why:'…', when:'#gb'}, … }
   when: a selector of the element that appears (loses class "hide") when the result is ready, usually the green bar #gb; or the lab fires  el.dispatchEvent(new Event('pred:done'))  itself.
   Not shown in test mode (?pts=all), so the lesson test suites keep running the labs directly; add ?pred=1 to see it there.
   Shared by every lesson: build(..., predict=True) in _core/tools/u4build.py adds this file (it needs book=True: the card family lives in u4/defn.js and u4/book.css). */
(function(){
  var q=''; try{ q=location.search }catch(e){}
  var OFF=/[?&]pts=all/.test(q)&&!/[?&]pred=1/.test(q);
  var _s=slide;
  slide=function(o){
    var P=(typeof PREDICT!=='undefined')&&PREDICT[o.id];
    if(P&&!OFF){
      var oi=o.init, oe=o.enter;
      o.init=function(el){
        var r=oi?oi.apply(this,arguments):undefined;
        attach(el,P);
        return r;
      };
      o.enter=function(el){
        if(el._pred&&el._pred.state==='new') el._pred.open();
        if(oe) return oe.apply(this,arguments);
      };
    }
    _s(o);
  };
  function attach(el,P){
    var hd=el.querySelector('.hd');
    var S={state:'new',pick:-1};
    var box=null, ops=null, chipEl=null;
    /* the card is built on the first arrival, after the card skin has run over the slide (so its text is not wrapped in a reading plate) */
    function ensure(){
      if(box) return;
      box=document.createElement('div'); box.className='predbox'; box.hidden=true;
      box.innerHTML='<div class="dfc pred"><div class="dh"><span class="dt"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3zM9.5 20.5h5"/></svg>توقّع</span><b class="dn">قبل أن نبدأ</b></div>'+
        '<p class="dx pq">'+P.q+'</p><div class="pops"></div><div class="pfoot"><button type="button" class="pskip">تخطَّ</button></div></div>';
      ops=box.querySelector('.pops');
      P.opts.forEach(function(t,i){
        var b=document.createElement('button'); b.type='button'; b.className='pop'; b.setAttribute('data-i',i);
        b.innerHTML='<i>'+'أبجدهو'.charAt(i)+'</i><span>'+t+'</span>'; ops.appendChild(b);
        b.addEventListener('click',function(){ S.pick=i; S.state='asked'; close(); chip(); watch() });
      });
      box.querySelector('.pskip').addEventListener('click',function(){ S.state='skipped'; close() });
      el.appendChild(box);
    }
    function chip(){
      if(!hd) return; chipEl=hd.querySelector('.pdc'); if(!chipEl){ chipEl=document.createElement('span'); chipEl.className='pdc'; hd.appendChild(chipEl) }
      chipEl.setAttribute('data-s','asked'); chipEl.innerHTML='<i></i><span>توقّعك: '+short(P.opts[S.pick])+'</span>';
    }
    function short(t){ t=t.replace(/<[^>]+>/g,''); return t.length>26?t.slice(0,25)+'…':t }
    function open(){ if(S.state!=='new') return; ensure(); box.hidden=false; void box.offsetWidth; box.classList.add('on') }
    function close(){ box.classList.remove('on'); setTimeout(function(){ if(!box.classList.contains('on')) box.hidden=true },200) }
    function verdict(){
      if(S.state!=='asked') return; S.state='done';
      var good=S.pick===P.ok;
      if(chipEl){ chipEl.setAttribute('data-s',good?'ok':'no'); chipEl.innerHTML='<i></i><span>'+(good?'توقّعك صحيح':'الصحيح غير توقّعك')+'</span>' }
      box.classList.add('verdict'); box.querySelector('.dt').lastChild.nodeValue=good?'توقّعك صحيح':'النتيجة';
      box.querySelector('.dn').textContent=good?'أحسنت':'قارن مع توقّعك';
      box.querySelector('.pq').innerHTML=(good?'':'<b>توقّعت:</b> '+P.opts[S.pick]+'<br>')+'<b>النتيجة:</b> '+P.opts[P.ok]+'<span class="pwhy">'+P.why+'</span>';
      ops.style.display='none';
      var sk=box.querySelector('.pskip'); sk.textContent='حسناً'; sk.onclick=function(){ close() };
      box.hidden=false; void box.offsetWidth; box.classList.add('on');
    }
    function watch(){
      if(S.watching) return; S.watching=true;
      el.addEventListener('pred:done',verdict);
      var t=P.when&&el.querySelector(P.when);
      if(t) new MutationObserver(function(){ if(!t.classList.contains('hide')&&getComputedStyle(t).display!=='none') verdict() }).observe(t,{attributes:true,attributeFilter:['class','style']});
    }
    el._pred={get state(){return S.state},open:open,verdict:verdict};
    if(el.classList.contains('on')) open();
  }
})();
