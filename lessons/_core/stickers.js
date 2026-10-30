/* ---------- stickers: cut-out stickers (stickers_assets.js) and drawn ones, slide decoration, praise pop-ups and sparkles ---------- */
var STK=(function(){
  var KEY='l31stk', off=false, stage=null, app=null, ready=false, lastNav=0, lastPraise=0, bag=[];
  var PRAISE=['pr_student','pr_hero','pr_star','pr_great','pr_amazing','pr_space','pr_sciencestar','pr_genius','pr_bravo','pr_excellent','pr_superior','pr_creator'];
  var INK='#16303b', CHEEK='#ff9db4';

  /* ---- drawn stickers: a white die-cut layer is made from `sil`, the art goes on top ---- */
  function face(x,y,s){
    s=s||1; var g=14*s, o='';
    [-1,1].forEach(function(k){
      o+='<ellipse cx="'+(x+k*g)+'" cy="'+y+'" rx="'+5*s+'" ry="'+6.2*s+'" fill="'+INK+'"/><circle cx="'+(x+k*g+1.6*s)+'" cy="'+(y-2.2*s)+'" r="'+1.9*s+'" fill="#fff"/>';
      o+='<ellipse cx="'+(x+k*(g+9*s))+'" cy="'+(y+9*s)+'" rx="'+6*s+'" ry="'+3.8*s+'" fill="'+CHEEK+'" opacity=".8"/>';
    });
    return '<g stroke="none">'+o+'</g><path d="M'+(x-7*s)+' '+(y+8*s)+' Q'+x+' '+(y+17*s)+' '+(x+7*s)+' '+(y+8*s)+'" fill="none" stroke="'+INK+'" stroke-width="'+3*s+'" stroke-linecap="round"/>';
  }
  function starPath(cx,cy,R,r){
    var p=[]; for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5, d=i%2?r:R; p.push((cx+Math.cos(a)*d).toFixed(1)+' '+(cy+Math.sin(a)*d).toFixed(1))}
    return 'M'+p.join('L')+'Z';
  }
  var FLASK='M80 28H120V76L160 146Q170 170 146 172H54Q30 170 40 146L80 76Z';
  var DRAWN={
    m_flask:{w:200,h:200,sil:'<path d="'+FLASK+'"/><rect x="72" y="20" width="56" height="16" rx="7"/>',
      art:'<path d="'+FLASK+'" fill="#eaf8fc"/><path d="M59 112Q80 103 100 112T141 112L160 146Q170 170 146 172H54Q30 170 40 146Z" fill="#3ec9e6" stroke="none"/>'+
          '<path d="'+FLASK+'" fill="none"/><rect x="72" y="20" width="56" height="16" rx="7" fill="#cfeaf2"/>'+
          '<g fill="#fff" stroke="#6fc6dc" stroke-width="2.5"><circle cx="102" cy="58" r="6"/><circle cx="114" cy="42" r="4.2"/><circle cx="90" cy="46" r="3.2"/></g>'+face(100,142,1)},
    m_tube:{w:200,h:200,sil:'<path d="M70 24H130V150Q130 178 100 178Q70 178 70 150Z"/>',
      art:'<path d="M70 24H130V150Q130 178 100 178Q70 178 70 150Z" fill="#eaf8fc"/><path d="M70 96H130V150Q130 178 100 178Q70 178 70 150Z" fill="#ff6f7d" stroke="none"/>'+
          '<path d="M70 24H130V150Q130 178 100 178Q70 178 70 150Z" fill="none"/><rect x="62" y="18" width="76" height="14" rx="7" fill="#cfeaf2"/>'+
          '<g fill="#fff" stroke="#ff9aa4" stroke-width="2.5"><circle cx="96" cy="76" r="5"/><circle cx="108" cy="60" r="3.6"/></g>'+face(100,128,.9)},
    m_atom:{w:200,h:200,sil:'<circle cx="100" cy="100" r="26"/><ellipse cx="100" cy="100" rx="84" ry="30"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(120 100 100)"/>',
      art:'<g fill="none" stroke-width="3.5"><ellipse cx="100" cy="100" rx="84" ry="30"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="84" ry="30" transform="rotate(120 100 100)"/></g>'+
          '<circle cx="100" cy="100" r="27" fill="#ffd23f"/><circle cx="184" cy="100" r="9" fill="#ff5d73"/><circle cx="58" cy="173" r="9" fill="#3aa7ff"/><circle cx="58" cy="27" r="9" fill="#a470e8"/>'+face(100,98,.95)},
    m_star:{w:200,h:200,sil:'<path d="'+starPath(100,106,86,42)+'"/>',
      art:'<path d="'+starPath(100,106,86,42)+'" fill="#ffd23f" stroke-width="4"/><path d="M62 70L72 48" stroke="#fff" stroke-width="5" opacity=".7"/>'+face(100,106,1.05)},
    m_trophy:{w:200,h:200,sil:'<path d="M58 30H142V86Q142 130 100 134Q58 130 58 86Z"/><rect x="88" y="130" width="24" height="26"/><rect x="60" y="154" width="80" height="22" rx="6"/><path d="M58 46H34Q30 96 66 104M142 46H166Q170 96 134 104" fill="none"/>',
      art:'<path d="M58 46H34Q30 96 66 104M142 46H166Q170 96 134 104" fill="none" stroke-width="7"/><path d="M58 46H34Q30 96 66 104M142 46H166Q170 96 134 104" fill="none" stroke="#ffcf3d" stroke-width="2.5"/>'+
          '<path d="M58 30H142V86Q142 130 100 134Q58 130 58 86Z" fill="#ffcf3d"/><rect x="88" y="130" width="24" height="26" fill="#f0a826"/><rect x="60" y="154" width="80" height="22" rx="6" fill="#e0901b"/>'+
          '<path d="M72 42V86Q72 108 90 118" fill="none" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>'+face(102,80,.95)},
    m_bulb:{w:200,h:200,sil:'<circle cx="100" cy="86" r="52"/><rect x="78" y="124" width="44" height="46" rx="10"/><g stroke="#fff" stroke-width="6"><path d="M100 8V20M30 36L40 44M170 36L160 44M12 92H24M188 92H176"/></g>',
      art:'<g stroke="#ffb703" stroke-width="5" stroke-linecap="round"><path d="M100 8V20M30 36L40 44M170 36L160 44M12 92H24M188 92H176"/></g><path d="M78 118Q56 104 54 82Q54 40 100 36Q146 40 146 82Q144 104 122 118V130H78Z" fill="#ffe66b"/>'+
          '<rect x="78" y="128" width="44" height="14" rx="5" fill="#b8c4cc"/><rect x="82" y="142" width="36" height="14" rx="5" fill="#9aa8b2"/><path d="M90 156H110Q108 168 100 168Q92 168 90 156Z" fill="#5d6b75"/>'+
          '<path d="M70 70Q74 52 90 46" fill="none" stroke="#fff" stroke-width="5" opacity=".75" stroke-linecap="round"/>'+face(100,88,.95)},
    m_flame:{w:200,h:200,sil:'<path d="M100 14C122 52 156 74 156 118C156 156 132 182 100 182C68 182 44 156 44 118C44 94 60 80 68 58C80 70 86 80 88 90C92 64 96 40 100 14Z"/>',
      art:'<path d="M100 14C122 52 156 74 156 118C156 156 132 182 100 182C68 182 44 156 44 118C44 94 60 80 68 58C80 70 86 80 88 90C92 64 96 40 100 14Z" fill="#ff8a3d"/>'+
          '<path d="M100 76C116 100 134 112 134 136C134 160 118 174 100 174C82 174 66 160 66 136C66 118 80 112 86 96C92 104 96 108 98 114C100 100 100 90 100 76Z" fill="#ffd23f" stroke="none"/>'+face(100,142,.9)},
    m_mole:{w:200,h:200,sil:'<ellipse cx="100" cy="112" rx="68" ry="62"/><circle cx="56" cy="54" r="15"/><circle cx="144" cy="54" r="15"/><ellipse cx="44" cy="146" rx="19" ry="15"/><ellipse cx="156" cy="146" rx="19" ry="15"/><ellipse cx="72" cy="174" rx="20" ry="11"/><ellipse cx="128" cy="174" rx="20" ry="11"/>',
      art:'<circle cx="56" cy="54" r="15" fill="#8a5a3b"/><circle cx="144" cy="54" r="15" fill="#8a5a3b"/><circle cx="56" cy="55" r="7" fill="#f4a9b8" stroke="none"/><circle cx="144" cy="55" r="7" fill="#f4a9b8" stroke="none"/>'+
          '<ellipse cx="72" cy="174" rx="20" ry="11" fill="#f0c8a0"/><ellipse cx="128" cy="174" rx="20" ry="11" fill="#f0c8a0"/>'+
          '<ellipse cx="100" cy="112" rx="68" ry="62" fill="#8a5a3b"/><ellipse cx="100" cy="136" rx="40" ry="32" fill="#e2bf98" stroke="none"/>'+
          '<ellipse cx="44" cy="146" rx="19" ry="15" fill="#f0c8a0"/><ellipse cx="156" cy="146" rx="19" ry="15" fill="#f0c8a0"/><g stroke-width="2.6" stroke-linecap="round"><path d="M34 138V146M44 136V146M54 138V146M146 138V146M156 136V146M166 138V146"/></g>'+
          '<ellipse cx="100" cy="102" rx="30" ry="22" fill="#e2bf98" stroke="none"/><path d="M87 94Q100 85 113 94Q110 110 100 110Q90 110 87 94Z" fill="#f58fa8"/><path d="M95 118Q100 124 105 118" fill="none" stroke-width="3" stroke-linecap="round"/>'+
          '<g stroke="none"><circle cx="76" cy="84" r="5" fill="'+INK+'"/><circle cx="124" cy="84" r="5" fill="'+INK+'"/><circle cx="77.6" cy="82.2" r="1.8" fill="#fff"/><circle cx="125.6" cy="82.2" r="1.8" fill="#fff"/><ellipse cx="62" cy="104" rx="8" ry="5" fill="'+CHEEK+'" opacity=".8"/><ellipse cx="138" cy="104" rx="8" ry="5" fill="'+CHEEK+'" opacity=".8"/></g>'}
  };
  function svg(n){
    var d=DRAWN[n];
    return '<svg viewBox="0 0 '+d.w+' '+d.h+'" aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">'+d.sil+'</g><g stroke="'+INK+'" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">'+d.art+'</g></svg>';
  }
  function dims(n){ if(typeof STK_WH!=='undefined'&&STK_WH[n]) return STK_WH[n]; if(DRAWN[n]) return [DRAWN[n].w,DRAWN[n].h]; return null }
  function has(n){ return !!dims(n) }

  /* one sticker as html; o: x,y (px in the 1280x720 stage) or css (replaces the position), w width, r tilt, d entrance delay s, f float period s */
  function html(n,o){
    var wh=dims(n); if(!wh) return '';
    o=o||{}; var w=o.w||150, h=Math.round(w*wh[1]/wh[0]);
    var st=(o.css!==undefined?o.css:'left:'+(o.x||0)+'px;top:'+(o.y||0)+'px;')+'width:'+w+'px;height:'+h+'px;--r:'+(o.r||0)+'deg;--sd:'+(o.d==null?.9:o.d)+'s;--fd:'+(o.f||(5+Math.random()*3).toFixed(1))+'s;';
    var cl='stk'+(o.free?' free':'');
    if(typeof STK_IMG!=='undefined'&&STK_IMG[n]) return '<img class="'+cl+'" alt="" draggable="false" src="'+STK_IMG[n]+'" style="'+st+'">';
    return '<div class="'+cl+'" style="'+st+'">'+svg(n)+'</div>';
  }
  /* put the stickers of one slide in: list of [name, x, y, width, tilt, delay, period] */
  function deco(el,list){
    (list||[]).forEach(function(a){ el.insertAdjacentHTML('beforeend',html(a[0],{x:a[1],y:a[2],w:a[3],r:a[4],d:a[5],f:a[6]})) });
  }

  /* ---- sparkles and praise ---- */
  var COL=['#ffd23f','#ffffff','#5ad8ff','#ff7aa8','#9be564','#c9a6ee'];
  function spark(x,y,n,spread){
    if(off||!stage||BG.tier()===0) return;
    var d=document.createElement('div'); d.className='spk'; d.style.left=x+'px'; d.style.top=y+'px'; var s='';
    for(var i=0;i<n;i++){
      var a=(i/n)*Math.PI*2+Math.random()*.6, r=spread*(.6+Math.random()*.6), z=9+Math.random()*10;
      s+='<i style="--dx:'+Math.round(Math.cos(a)*r)+'px;--dy:'+Math.round(Math.sin(a)*r)+'px;--z:'+z.toFixed(0)+'px;--c:'+COL[i%COL.length]+';--o:'+(i*18)+'ms;--k:'+(i%3)+'"></i>';
    }
    d.innerHTML=s; stage.appendChild(d); setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d) },1500);
  }
  function center(t){
    var r=t.getBoundingClientRect(), sr=stage.getBoundingClientRect(), k=sr.width/1280||1;
    return {x:(r.left+r.width/2-sr.left)/k, y:(r.top+r.height/2-sr.top)/k};
  }
  function next(){
    if(!bag.length){ bag=PRAISE.filter(has); for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=bag[i];bag[i]=bag[j];bag[j]=t} }
    return bag.pop();
  }
  function praise(at,big){
    if(off||!stage) return; var now=Date.now(); if(now-lastPraise<5200) return; lastPraise=now;
    var n=big||next(); if(!n) return; var c=at?center(at):{x:900,y:400}, left=c.x>640;
    var w=big?190:170, wh=dims(n), h=Math.round(w*wh[1]/wh[0]);
    var p=document.createElement('div'); p.className='stk-pop'; p.style.cssText=(left?'left:34px;':'left:'+(1280-w-34)+'px;')+'top:'+(720-h-52)+'px;width:'+w+'px;height:'+h+'px;--r:'+((Math.random()*14-7).toFixed(1))+'deg';
    p.innerHTML=(typeof STK_IMG!=='undefined'&&STK_IMG[n])?'<img alt="" src="'+STK_IMG[n]+'">':svg(n);
    stage.appendChild(p); spark(parseFloat(p.style.left)+w/2,720-h/2-52,big?18:12,w*.8);
    setTimeout(function(){p.classList.add('out')},2900); setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p) },3500);
  }

  var ROW=/(^|\s)(qr|mr|rc|pq)(\s|$)/;
  function watch(){
    var mo=new MutationObserver(function(list){
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
    mo.observe(stage,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
  }
  function btn(){
    return '<button class="tbtn" id="bStk" type="button" aria-label="الملصقات" aria-pressed="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.2 14.2Q12 18 15.8 14.2M9 9.6h.01M15 9.6h.01"/></svg><span>ملصقات</span></button>';
  }
  function set(v,save){
    off=!v; document.documentElement.classList.toggle('stk-off',off);
    var b=document.getElementById('bStk'); if(b){ b.setAttribute('aria-pressed',v?'true':'false'); var s=b.querySelector('span'); if(s) s.textContent=v?'ملصقات':'بدون'; }
    if(save){ try{localStorage.setItem(KEY,v?'1':'0')}catch(e){} }
  }
  function init(){ var v=true; try{ if(localStorage.getItem(KEY)==='0') v=false }catch(e){} set(v,false) }
  function mount(st){
    stage=st||null; init(); var b=document.getElementById('bStk'); if(b) b.addEventListener('click',function(){ set(off,true) });
    if(stage){ watch(); setTimeout(function(){ready=true},400) }
  }
  return {html:html,deco:deco,btn:btn,mount:mount,init:init,spark:spark,praise:praise,has:has,navigated:function(){lastNav=Date.now()},toggle:function(){set(off,true)}};
})();
