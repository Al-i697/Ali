/* The student's one-page summary of the lesson, printable (teacher's request, November 2026).
   A «ملخص الطالب للطباعة» button in the lesson index (or the key S) opens the page; «طباعة» prints it on one A4 sheet.
   Nothing is written twice: the page is assembled from what the lesson already says —
     the goals (the goals slide), the lesson's own summary bullets («خلاصة الدرس» on the last slide), the definition / law / warning / reminder cards of the slides,
     the homework (last slide) and the pages of the books used (BOOKPG).
   Laws that appear only as a clickable triangle (no static card) are listed in src/pages.js:  var SUMLAWS=[['قانون المول','n = m ÷ M','…'],…]
   Shared by every lesson: build(..., summary=True) in _core/tools/u4build.py adds this file and u4/summary.css (it needs book=True for the cards). */
(function(){
  function parse(s){ var t=document.createElement('div'); try{ t.innerHTML=(typeof s.html==='function')?s.html():'' }catch(e){} return t }
  function clean(h){ return h.replace(/\sstyle="[^"]*"/g,'').replace(/\sclass="(ptn|num|fx[^"]*)"/g,'').replace(/<(button|span class="ck")[^>]*>/g,'').replace(/<\/button>/g,'') }
  function cardsOf(root,kind){
    var out=[]; root.querySelectorAll('.dfc.'+kind).forEach(function(c){
      var n=c.querySelector('.dn'), en=c.querySelector('.de'), eq=c.querySelector('.eqx'), xs=c.querySelectorAll('.dx'), tag=c.querySelector('.dt');
      if(!n&&!eq&&!xs.length) return;
      var items=[]; xs.forEach(function(x){ if(x.tagName==='UL') x.querySelectorAll('li').forEach(function(l){items.push(l.innerHTML)}); else items.push(x.innerHTML.replace(/<span class="eg">[\s\S]*?<\/span>/g,'')) });
      if(kind==='law'&&!eq&&!items.length) return;
      if(items.length===1&&/^\s*؟?\s*$/.test(items[0].replace(/<[^>]+>/g,''))) return;
      out.push({t:n?n.innerHTML:'',en:en?en.textContent:'',eq:eq?eq.innerHTML:'',items:items,tag:tag?tag.textContent.trim():''});
    });
    return out;
  }
  function collect(){
    var D={goals:[],bul:[],defs:[],laws:[],warn:[],rem:[],hw:[],pages:{sb:[],ab:[]}}, seen={};
    SLIDES.forEach(function(s){
      var r=parse(s), id=s.id;
      if(id==='goals') r.querySelectorAll('.gi').forEach(function(g){ var sp=g.querySelectorAll('span'); D.goals.push(clean((sp[sp.length-1]||g).innerHTML)) });
      if(id==='hw'){
        var pl=r.querySelectorAll('.panel'); if(pl[0]) pl[0].querySelectorAll('li').forEach(function(l){ D.bul.push(clean(l.innerHTML)) });
        r.querySelectorAll('.stp').forEach(function(p){ var sp=p.querySelectorAll('span'); D.hw.push(clean((sp[sp.length-1]||p).innerHTML)) });
      }
      [['def','defs'],['law','laws'],['warn','warn'],['rem','rem']].forEach(function(k){
        var cs=(k[0]==='def')?cardsOf(r,'dfc').filter(function(c){return c.tag==='تعريف'}):cardsOf(r,k[0]);
        cs.forEach(function(c){ var key=k[0]+'|'+c.t+'|'+c.eq+'|'+c.items.join('|'); if(!seen[key]){ seen[key]=1; D[k[1]].push(c) } });
      });
    });
    if(typeof SUMLAWS!=='undefined') SUMLAWS.forEach(function(l){ D.laws.push({t:l[0],en:'',eq:l[1],items:l[2]?[l[2]]:[],tag:'قانون'}) });
    if(typeof BOOKPG!=='undefined'){
      var set={sb:{},ab:{}};
      Object.keys(BOOKPG).forEach(function(k){
        var m=/(الطالب|النشاط)\s*ص\s*(\d+)(?:\s*[–-]\s*(\d+))?/.exec(BOOKPG[k].replace(/<[^>]+>/g,'')); if(!m) return;
        var t=set[m[1]==='الطالب'?'sb':'ab'], a=+m[2], b=+(m[3]||m[2]); for(var i=a;i<=b;i++) t[i]=1;
      });
      /* the pages used, merged into ranges: 62, 63, 64, 65 -> 62–65 */
      ['sb','ab'].forEach(function(w){
        var ps=Object.keys(set[w]).map(Number).sort(function(x,y){return x-y}), out=[], i=0;
        while(i<ps.length){ var j=i; while(j+1<ps.length&&ps[j+1]===ps[j]+1) j++; out.push(ps[i]===ps[j]?String(ps[i]):ps[i]+'–'+ps[j]); i=j+1 }
        D.pages[w]=out;
      });
    }
    return D;
  }
  function sec(title,cls,inner){ return inner?'<section class="ss '+cls+'"><h3>'+title+'</h3>'+inner+'</section>':'' }
  function cardHTML(c,kind){
    return '<div class="sc '+kind+'">'+(c.t?'<b class="st">'+c.t+(c.en?' <i dir="ltr">'+c.en+'</i>':'')+'</b>':'')+(c.eq?'<div class="se" dir="ltr">'+c.eq+'</div>':'')+c.items.map(function(x){return '<p>'+x+'</p>'}).join('')+'</div>';
  }
  function html(){
    var D=collect(), pg=function(a){ return a.map(function(x){return '<bdi dir="ltr">'+x+'</bdi>'}).join('، ') };
    var s='<div class="sbox"><header><div class="sh1">ملخص الطالب</div><div class="sh2">'+(LESSON.brand||LESSON.short||'')+'</div></header>';
    s+=sec('ماذا سأتعلّم؟','goals','<ul>'+D.goals.map(function(g){return '<li>'+g+'</li>'}).join('')+'</ul>');
    s+=sec('الخلاصة','bul','<ul>'+D.bul.map(function(g){return '<li>'+g+'</li>'}).join('')+'</ul>');
    s+=sec('التعريفات','defs','<div class="sg">'+D.defs.map(function(c){return cardHTML(c,'def')}).join('')+'</div>');
    s+=sec('القوانين','laws','<div class="sg">'+D.laws.map(function(c){return cardHTML(c,'law')}).join('')+'</div>');
    s+=sec('انتبه وتذكّر','tips','<div class="sg">'+D.warn.map(function(c){return cardHTML(c,'warn')}).join('')+D.rem.map(function(c){return cardHTML(c,'rem')}).join('')+'</div>');
    s+=sec('للتدرّب','prac','<ul>'+D.hw.map(function(g){return '<li>'+g+'</li>'}).join('')+'</ul>'+((D.pages.sb.length||D.pages.ab.length)?'<p class="spg">'+(D.pages.sb.length?'كتاب الطالب ص'+pg(D.pages.sb):'')+(D.pages.sb.length&&D.pages.ab.length?' · ':'')+(D.pages.ab.length?'كتاب النشاط ص'+pg(D.pages.ab):'')+'</p>':''));
    s+='<footer>الاسم: ................................. الشعبة: ........</footer></div>';
    return s;
  }
  function open(){
    var ov=document.getElementById('sumov');
    if(!ov){
      ov=document.createElement('div'); ov.id='sumov'; ov.className='sumov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label','ملخص الطالب');
      ov.innerHTML='<div class="sbar"><button type="button" class="sprint">طباعة</button><button type="button" class="sclose">إغلاق</button></div><div class="sheet2"></div>';
      document.body.appendChild(ov);
      ov.querySelector('.sclose').addEventListener('click',close);
      ov.querySelector('.sprint').addEventListener('click',function(){ try{ window.print() }catch(e){} });
      ov.addEventListener('click',function(e){ if(e.target===ov) close() });
    }
    ov.querySelector('.sheet2').innerHTML=html(); ov.classList.add('on'); document.documentElement.classList.add('sum-open');
  }
  function close(){ var ov=document.getElementById('sumov'); if(ov) ov.classList.remove('on'); document.documentElement.classList.remove('sum-open') }
  var _boot=boot;
  boot=function(){
    _boot.apply(this,arguments);
    /* the button is in the lesson index (the top bar has no room left at the width the platform gives a lesson beside the class drawer) and on the key S */
    var sh=document.querySelector('#idx .sheet'), h3=sh&&sh.querySelector('h3');
    if(h3){ h3.insertAdjacentHTML('afterend','<button class="sumbtn" id="bSum" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/></svg>ملخص الطالب للطباعة <kbd>S</kbd></button>'); document.getElementById('bSum').addEventListener('click',function(){ var ix=document.getElementById('idx'); if(ix) ix.classList.remove('open'); open() }) }
    document.addEventListener('keydown',function(e){
      var t=e.target&&e.target.tagName; if(t==='INPUT'||t==='TEXTAREA') return;
      if(e.ctrlKey||e.metaKey||e.altKey) return;
      if(e.code==='KeyS'){ var ov=document.getElementById('sumov'); if(ov&&ov.classList.contains('on')) close(); else open() }
      else if(e.key==='Escape') close();
    });
  };
  window.SUMMARY={html:html,open:open,close:close,collect:collect};
})();
