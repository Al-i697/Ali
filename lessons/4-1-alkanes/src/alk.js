/* ---------- helpers for the alkanes lesson: alkane data, structural-formula drawings, small widgets ---------- */
var ALK=[
 {n:1,f:'CH4',name:'ميثان',bp:-164,st:'غاز'},{n:2,f:'C2H6',name:'إيثان',bp:-87,st:'غاز'},{n:3,f:'C3H8',name:'بروبان',bp:-42,st:'غاز'},
 {n:4,f:'C4H10',name:'بيوتان',bp:0,st:'غاز'},{n:5,f:'C5H12',name:'بنتان',bp:36,st:'سائل'},{n:6,f:'C6H14',name:'هكسان',bp:69,st:'سائل'}
];
var PREF=['ميث','إيث','بروب','بيوت','بنت','هكس'];
function ff(f){return '<span class="num fmla">'+sub(f)+'</span>'}   /* a formula with subscripts */
/* one atom of a flat structural drawing */
function atm(x,y,r,s){
  var c=s==='C'?['#3A3F45','#fff']:s==='H'?['#EEF4F4','#17383d']:s==='O'?['#E0453A','#fff']:s==='Br'?['#9B4A2F','#fff']:['#5CBF4A','#06290f'];
  return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c[0]+'" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><text x="'+x+'" y="'+(y+r*.36)+'" text-anchor="middle" font-size="'+(r*1.08)+'" font-weight="800" fill="'+c[1]+'" font-family="Cairo,sans-serif">'+s+'</text>';
}
function bnd(x1,y1,x2,y2,w,col){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#9fb4b8')+'" stroke-width="'+(w||4)+'" stroke-linecap="round"/>'}
/* the structural formula of the straight-chain alkane with n carbons (every atom and bond shown); o.w sets the width in px, o.hl colours one carbon */
function alkSVG(n,o){
  o=o||{}; var g=58, pad=54, W=2*pad+(n-1)*g, H=132, y0=66, s='', i, x;
  for(i=0;i<n;i++){ x=pad+i*g; if(i<n-1) s+=bnd(x,y0,x+g,y0,5); s+=bnd(x,y0,x,y0-40,4)+bnd(x,y0,x,y0+40,4); }
  s+=bnd(pad,y0,pad-36,y0,4)+bnd(pad+(n-1)*g,y0,pad+(n-1)*g+36,y0,4);
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0-40,12,'H')+atm(x,y0+40,12,'H'); }
  s+=atm(pad-36,y0,12,'H')+atm(pad+(n-1)*g+36,y0,12,'H');
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0,i===o.hl?19:17,'C'); }
  return '<svg viewBox="0 0 '+W+' '+H+'" width="'+(o.w||W)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+'</svg>';
}
/* a compact stepper: label, -/+ buttons and a value; returns html, bindStep wires it (min, max, on change) */
function stepHTML(id,label,v){return '<div class="ctr" data-st="'+id+'"><span class="ctl">'+label+'</span><button type="button" data-d="-1" aria-label="أنقص">−</button><b class="num">'+v+'</b><button type="button" data-d="1" aria-label="زِد">+</button></div>'}
function bindStep(el,id,min,max,fn){
  var box=$('[data-st="'+id+'"]',el), b=$('b',box), v=+b.textContent;
  function set(x){v=Math.max(min,Math.min(max,x)); b.textContent=v; fn(v)}
  $$('button',box).forEach(function(bt){bt.addEventListener('click',function(){set(v+ +bt.getAttribute('data-d'))})});
  return {set:set,get:function(){return v}};
}
/* reveal cards: items [title, text]; the card opens when pressed; done() when all are open */
function cardsHTML(items,cls){
  return '<div class="rcards '+(cls||'')+'">'+items.map(function(it,i){return '<button type="button" class="rcard" data-i="'+i+'"><span class="rn">'+ar(i+1)+'</span><span class="rt"><b>'+it[0]+'</b><span class="rx hide">'+it[1]+'</span><span class="rq">اضغط لتظهر</span></span></button>'}).join('')+'</div>';
}
function bindCards(el,done){
  var left=$$('.rcard',el).length;
  $$('.rcard',el).forEach(function(b){b.addEventListener('click',function(){ if(b.classList.contains('on'))return; b.classList.add('on'); $('.rx',b).classList.remove('hide'); $('.rq',b).classList.add('hide'); left--; if(!left&&done)done() })});
}
function revealAll(el){ $$('.rcard',el).forEach(function(b){b.classList.add('on'); $('.rx',b).classList.remove('hide'); $('.rq',b).classList.add('hide')}) }
function unhide(el,sel){ var g=$(sel||'#gb',el); if(g){g.classList.remove('hide'); g.classList.add('up')} }

/* small flat drawings of ethene (C=C) and ethyne (C≡C) */
function ene2SVG(w){
  return '<svg viewBox="0 0 150 90" width="'+(w||150)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+bnd(48,45,102,45,4)+bnd(48,38,102,38,4)+bnd(48,52,102,52,4)+bnd(48,45,20,18,4)+bnd(48,45,20,72,4)+bnd(102,45,130,18,4)+bnd(102,45,130,72,4)+atm(20,18,11,'H')+atm(20,72,11,'H')+atm(130,18,11,'H')+atm(130,72,11,'H')+atm(48,45,16,'C')+atm(102,45,16,'C')+'</svg>';
}
function yne2SVG(w){
  return '<svg viewBox="0 0 170 60" width="'+(w||170)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+bnd(55,30,115,30,4)+bnd(55,23,115,23,4)+bnd(55,37,115,37,4)+bnd(55,30,22,30,4)+bnd(115,30,148,30,4)+atm(22,30,11,'H')+atm(148,30,11,'H')+atm(55,30,16,'C')+atm(115,30,16,'C')+'</svg>';
}
/* the skeleton of the n-carbon alkane with every hydrogen as a dashed empty place the student fills by pressing it */
function fillSVG(n){
  var g=62, pad=62, W=2*pad+(n-1)*g, H=170, y0=85, s='', i, x, k=0, hs='';
  for(i=0;i<n;i++){ x=pad+i*g; if(i<n-1) s+=bnd(x,y0,x+g,y0,5); }
  function slot(sx,sy,x1,y1){ var id=k++; return '<g class="hslot" data-k="'+id+'" style="cursor:pointer">'+'<g class="hh">'+bnd(x1,y1,sx,sy,4)+atm(sx,sy,15,'H')+'</g><circle class="dot" cx="'+sx+'" cy="'+sy+'" r="15" fill="rgba(228,188,75,.10)" stroke="var(--gold)" stroke-width="2.5" stroke-dasharray="5 5"/></g>'; }
  for(i=0;i<n;i++){ x=pad+i*g; hs+=slot(x,y0-52,x,y0)+slot(x,y0+52,x,y0); }
  hs+=slot(pad-48,y0,pad,y0)+slot(pad+(n-1)*g+48,y0,pad+(n-1)*g,y0);
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0,20,'C'); }
  return {svg:'<svg viewBox="0 0 '+W+' '+H+'" width="'+Math.round(W*1.5)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+hs+'</svg>',count:k};
}
