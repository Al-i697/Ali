/* ---------- lesson 2-1 helpers: the series strip and eqn() are the lesson 1-4 ones; the rest is new ---------- */
var SER=[['K','بوتاسيوم','I'],['Na','صوديوم','I'],['Ca','كالسيوم','II'],['Mg','ماغنيسيوم','II'],['Al','ألومنيوم','III'],['C','كربون','nm'],['Zn','خارصين','T'],['Fe','حديد','T'],['Sn','قصدير','IV'],['Pb','رصاص','IV'],['H','هيدروجين','nm'],['Cu','نحاس','T'],['Ag','فضة','T'],['Au','ذهب','T']];
var GRP={I:'المجموعة I',II:'المجموعة II',III:'المجموعة III',T:'عنصر انتقالي',IV:'المجموعة IV',nm:'لافلز (للمقارنة)'};
function serCol(i){ return 'hsl('+Math.round(4+i*(208-4)/13)+',70%,27%)' }
/* a strip of the series, most reactive on the right. keys: which elements to show (default all). Each chip keeps its colour from its place in the full series. */
function serStrip(keys,o){
  o=o||{}; keys=keys||SER.map(function(s){return s[0]});
  return '<div class="ser'+(o.cls?' '+o.cls:'')+'"'+(o.id?' id="'+o.id+'"':'')+'>'+keys.map(function(k){
    var i=SER.map(function(s){return s[0]}).indexOf(k), s=SER[i];
    return '<button type="button" class="sc'+(s[2]==='nm'?' nm':'')+'" data-s="'+k+'" data-g="'+s[2]+'" style="--c:'+serCol(i)+'"><b class="num">'+k+'</b>'+(o.names?'<small>'+s[1]+'</small>':'')+'</button>';
  }).join('')+'</div>';
}

function eqn(s){ return '<bdi dir="ltr" class="num">'+sub(String(s).replace(/\^([0-9]*[+\-−]?)/g,'<sup>$1</sup>'))+'</bdi>' }

/* ---------- lesson 2-1 only ---------- */

/* sorting chips into the bands of Table 2-2: chips [key, html, band key, message when right, message when wrong]; the bands are .band[data-b] boxes holding a .bchips line */
function bindBands(el,chips,o){
  o=o||{}; var tray=$('#tray',el), fb=$(o.fb||'.fb',el), left=chips.length, sel=null;
  function place(c,band){
    var it=chips.filter(function(x){return x[0]===c.getAttribute('data-k')})[0];
    if(it[2]===band.getAttribute('data-b')){
      $('.bchips',band).appendChild(c); c.classList.add('ok-b','locked'); c.style.cursor='default'; left--;
      say(fb,'✓ '+it[3],'ok');
      if(!left){ tray.classList.add('hide'); unhide(el); if(o.onDone) o.onDone() }
      return true;
    }
    band.classList.add('shake'); later(function(){band.classList.remove('shake')},340); say(fb,it[4],'bad'); return false;
  }
  chips.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'; c.setAttribute('data-k',it[0]); c.innerHTML=it[1]; if(o.css) c.style.cssText=o.css; tray.appendChild(c);
    drag(c,{zone:'.band',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.band',el).forEach(function(b){b.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,b); sel.style.outline=''; sel=null } })});
}

/* Activity 2-1: copper(II) oxide + charcoal heated in a tube; the gas is bubbled through limewater. Stages s0 (set up) to s3 (limewater milky); see lesson.css */
function labSVG(){
  var bub='', i;
  for(i=0;i<6;i++) bub+='<circle class="lb" cx="'+(486+(i%3)*14)+'" cy="'+(250-(i%2)*8)+'" r="'+(4+(i%3))+'" style="--d:'+(i*0.35)+'s"/>';
  return '<svg id="lab" class="lab s0" viewBox="0 0 640 330" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible">'+
   '<defs><linearGradient id="gl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f5ff" stop-opacity=".55"/><stop offset="1" stop-color="#bcdcf2" stop-opacity=".25"/></linearGradient></defs>'+
   /* stand and burner */
   '<rect x="40" y="296" width="560" height="10" rx="5" fill="#46546a"/>'+
   '<rect x="132" y="150" width="8" height="150" fill="#6c7b92"/><rect x="132" y="150" width="88" height="8" fill="#6c7b92"/>'+
   '<g class="burner"><rect x="86" y="252" width="30" height="44" rx="4" fill="#58657c"/><rect x="78" y="290" width="46" height="8" rx="3" fill="#38445a"/>'+
    '<g class="flame"><path d="M101 250C86 232 92 214 101 190C110 214 116 232 101 250Z" fill="#ff9a2e"/><path d="M101 246C94 234 97 224 101 210C105 224 108 234 101 246Z" fill="#ffe27a"/></g></g>'+
   /* heating tube, closed end at the left, delivery tube to the right */
   '<path d="M60 150h250v50H60a25 25 0 0 1 0-50z" fill="url(#gl1)" stroke="#d6ecff" stroke-width="3"/>'+
   '<g class="mix"><path d="M62 156h96v38H62a19 19 0 0 1 0-38z" class="cuo" fill="#1d1d22"/><path d="M158 156h58v38h-58z" class="chr" fill="#2b2b31"/>'+
    '<path d="M62 156h96v38H62a19 19 0 0 1 0-38z" class="cu" fill="#c46a3e" opacity="0"/><circle class="glow" cx="110" cy="175" r="44" fill="#ff7a2a" opacity="0"/></g>'+
   '<text x="104" y="144" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" stroke="rgba(0,0,0,.65)" stroke-width="3" paint-order="stroke" font-family="Cairo,sans-serif">CuO</text>'+
   '<text x="188" y="144" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" stroke="rgba(0,0,0,.65)" stroke-width="3" paint-order="stroke" font-family="Cairo,sans-serif">C</text>'+
   '<path d="M310 172h92a14 14 0 0 1 14 14v68" fill="none" stroke="#d6ecff" stroke-width="7" stroke-linecap="round" opacity=".9"/>'+
   /* limewater tube */
   '<path d="M440 196h92v102a46 46 0 0 1-92 0z" fill="url(#gl1)" stroke="#d6ecff" stroke-width="3"/>'+
   '<path d="M442 238h88v60a44 44 0 0 1-88 0z" class="lime" fill="#e8f4fa" opacity=".55"/><path d="M442 238h88v60a44 44 0 0 1-88 0z" class="milk" fill="#ffffff" opacity="0"/>'+
   '<g class="bubs">'+bub+'</g>'+
   '<text x="486" y="190" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" stroke="rgba(0,0,0,.65)" stroke-width="3" paint-order="stroke" font-family="Cairo,sans-serif">ماء الجير</text>'+
   '</svg>';
}

/* the scrap of Q2-7: [what it is, 1 if a magnet picks it up] */
var SCRAP=[['علبة فولاذية',1],['علبة ألومنيوم',0],['مسمار فولاذي',1],['سلك نحاسي',0],['قنينة بلاستيك',0],['صفيحة فولاذ',1]];
