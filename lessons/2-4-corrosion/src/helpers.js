/* ---------- lesson 2-4 helpers: test tubes with a nail, the rusting row, and the drawings of the protection methods ---------- */
function eqn(s){ return '<bdi dir="ltr" class="num">'+sub(String(s).replace(/\^([0-9]*[+\-−]?)/g,'<sup>$1</sup>'))+'</bdi>' }

/* a test tube with a nail (no letters: the labels are html under it). o: {id, lq:'n'|'w'|'s'|'o' (none, water, salt water, water under oil), top: where the liquid starts (y), dry: calcium chloride and cotton, o2: pure oxygen tint, nail:[y1,y2]} */
function tubeSVG(o){
  var top=o.top||118, ny=o.nail||[64,196], s='<svg class="tube" viewBox="0 0 100 230" aria-hidden="true" style="direction:ltr;display:block;width:100%;height:100%"><defs><clipPath id="tcl'+o.id+'"><path d="M30 14V190Q30 214 50 214Q70 214 70 190V14Z"/></clipPath></defs>';
  s+='<g clip-path="url(#tcl'+o.id+')">';
  if(o.o2) s+='<rect x="28" y="14" width="44" height="'+(top-14)+'" fill="rgba(255,150,120,.22)"/>';
  if(o.lq&&o.lq!=='n'){
    s+='<rect x="28" y="'+top+'" width="44" height="130" fill="'+(o.lq==='s'?'rgba(60,200,190,.72)':'rgba(110,190,255,.62)')+'"/>';
    if(o.lq==='o') s+='<rect x="28" y="'+(top-9)+'" width="44" height="11" fill="#e8c23b"/>';
    if(o.lq==='s') [[36,150],[48,170],[60,142],[42,196],[58,188],[52,128]].forEach(function(p){ s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.4" fill="#fff" opacity=".85"/>' });
  }
  if(o.dry){ s+='<rect x="28" y="188" width="44" height="30" fill="#f3f1ea"/>'; [[34,192],[44,196],[56,193],[64,198],[40,203],[52,205]].forEach(function(p){ s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.2" fill="#d5d1c4"/>' });
    [[40,172,9],[52,168,10],[60,174,8],[46,178,8]].forEach(function(p){ s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+p[2]+'" fill="#fbfbf7" stroke="#d5d1c4" stroke-width="1"/>' }); }
  s+='</g>';
  s+='<g class="nl"><line x1="43" y1="'+ny[0]+'" x2="55" y2="'+ny[1]+'" stroke="#9aa5b5" stroke-width="7" stroke-linecap="round"/><circle cx="42.5" cy="'+(ny[0]-1)+'" r="6" fill="#9aa5b5"/>'+
     '<line class="rs" x1="43" y1="'+ny[0]+'" x2="55" y2="'+ny[1]+'" stroke="#b5532a" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 5"/><circle class="rs" cx="42.5" cy="'+(ny[0]-1)+'" r="6.5" fill="#b5532a"/></g>';
  s+='<path d="M30 14V190Q30 214 50 214Q70 214 70 190V14" fill="rgba(235,245,255,.10)" stroke="#d6ecff" stroke-width="3"/><rect x="25" y="9" width="50" height="8" rx="3" fill="#d6ecff"/></svg>';
  return s;
}
/* a row of columns: each with a tube, a title, the conditions, buttons [[value, label]] and a place for the result. items: [{svg, t, d, ans, btns}] */
function tubeCols(items,cls){
  return '<div class="tcols'+(cls?' '+cls:'')+'">'+items.map(function(t,i){
    return '<div class="tcol" data-i="'+i+'"><div class="tv">'+t.svg+'</div><b class="tt">'+t.t+'</b><span class="td">'+t.d+'</span>'+
     '<div class="pr">'+t.btns.map(function(b){return '<button type="button" class="pb" data-v="'+b[0]+'">'+b[1]+'</button>'}).join('')+'</div><div class="tm"></div></div>';
  }).join('')+'</div>';
}

/* the drawing of a coating scratched on steel: kind 'tin' or 'zn'; the wrapper's class s1 = scratched, s2 = wetted and left for a while */
function scratchSVG(kind){
  var tin=kind==='tin', col=tin?'#dfe5ee':'#9db8d6';
  var s='<svg viewBox="0 0 320 170" aria-hidden="true" style="direction:ltr;display:block;width:100%;height:100%">'+
   '<rect x="14" y="78" width="292" height="62" rx="6" fill="#6b7585"/>'+
   '<rect x="14" y="54" width="292" height="24" rx="5" fill="'+col+'"/>'+
   '<g class="gap"><rect x="146" y="50" width="28" height="30" fill="#12284f"/><path d="M146 50L152 80M174 50L168 80" stroke="#12284f" stroke-width="2"/></g>';
  if(tin) s+='<g class="rust"><ellipse cx="160" cy="84" rx="40" ry="14" fill="#b5532a"/><ellipse cx="160" cy="92" rx="62" ry="10" fill="#8f3e1d" opacity=".85"/><circle cx="128" cy="80" r="5" fill="#c9683c"/><circle cx="196" cy="80" r="5" fill="#c9683c"/></g>';
  else s+='<g class="zni">'+[[130,36],[150,22],[170,30],[190,40],[160,12]].map(function(p,i){return '<circle class="zi" style="--d:'+(i*0.35)+'s" cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#bcd2ff" stroke="#fff" stroke-width="1.5"/>'}).join('')+'</g><g class="zfilm"><rect x="146" y="76" width="28" height="4" fill="#cfe0ff" opacity=".9"/></g>';
  s+='<g font-family="Cairo,sans-serif" font-weight="800" font-size="22" fill="#fff" stroke="rgba(0,0,0,.55)" stroke-width="3" paint-order="stroke" text-anchor="middle"><text x="60" y="118">Fe</text><text x="60" y="73">'+(tin?'Sn':'Zn')+'</text>'+(tin?'':'<text x="160" y="26" font-size="19" opacity="0" class="zl">Zn²⁺</text>')+'</g></svg>';
  return s;
}

/* the ship hull with a block of magnesium (Fig 2-6): the wrapper's class s1 = block attached, s2 = electrons flow, s3 = ions leave the block */
function shipSVG(){
  var e='',i;
  for(i=0;i<4;i++) e+='<circle class="el" style="--d:'+(i*0.45)+'s" cx="'+(268+i*10)+'" cy="196" r="6" fill="#ffe27a" stroke="#7a5a00" stroke-width="1.5"/>';
  var io='';
  [[318,214],[330,232],[342,214],[322,250]].forEach(function(p,j){ io+='<circle class="io" style="--d:'+(j*0.55)+'s" cx="'+p[0]+'" cy="'+p[1]+'" r="9" fill="#bde2ff" stroke="#fff" stroke-width="1.5"/>' });
  return '<svg viewBox="0 0 560 300" aria-hidden="true" style="direction:ltr;display:block;width:100%;height:100%">'+
   '<rect x="0" y="150" width="560" height="150" fill="rgba(40,110,190,.55)"/><path d="M0 150Q35 140 70 150T140 150T210 150T280 150T350 150T420 150T490 150T560 150" fill="none" stroke="#9fd3ff" stroke-width="3"/>'+
   '<rect x="205" y="58" width="90" height="56" rx="4" fill="#e9edf3" stroke="#8d99aa" stroke-width="2"/><rect x="225" y="36" width="50" height="26" rx="3" fill="#d7dde6"/><rect x="236" y="14" width="12" height="26" fill="#c0402e"/>'+
   '<path d="M60 112H500L450 196Q440 206 420 206H140Q120 206 110 196Z" fill="#b8352a" stroke="#6e1810" stroke-width="3"/>'+
   '<g font-family="Cairo,sans-serif" font-weight="800" font-size="24" fill="#fff" stroke="rgba(0,0,0,.55)" stroke-width="3" paint-order="stroke" text-anchor="middle"><text x="400" y="170">Fe</text></g>'+
   '<g class="blk"><rect x="268" y="206" width="72" height="30" rx="4" fill="#aab6c6" stroke="#fff" stroke-width="2"/><g font-family="Cairo,sans-serif" font-weight="800" font-size="22" fill="#10243f" text-anchor="middle"><text x="304" y="228">Mg</text></g></g>'+
   '<g class="els">'+e+'</g><g class="ios">'+io+'</g></svg>';
}

/* aluminium and iron exposed to air: iron rust flakes off and exposes new metal, the oxide of aluminium stays (Fig 2-7). the wrapper's class go starts it */
function oxideSVG(kind){
  var fe=kind==='fe', s='<svg viewBox="0 0 320 190" aria-hidden="true" style="direction:ltr;display:block;width:100%;height:100%">'+
   '<rect x="20" y="90" width="280" height="86" rx="6" fill="'+(fe?'#6b7585':'#b9c4d2')+'"/>';
  if(fe){
    s+='<g class="rl1"><rect x="20" y="70" width="280" height="22" fill="#b5532a"/></g><g class="rl2"><rect x="20" y="52" width="280" height="20" fill="#9c4423"/></g>';
    [[60,52],[130,56],[200,52],[258,58]].forEach(function(p,i){ s+='<polygon class="fl" style="--d:'+(i*0.25)+'s" points="'+p[0]+','+p[1]+' '+(p[0]+34)+','+(p[1]-4)+' '+(p[0]+28)+','+(p[1]+18)+' '+(p[0]+2)+','+(p[1]+20)+'" fill="#c9683c" stroke="#7a3016" stroke-width="1.5"/>' });
  }else{
    s+='<g class="ox"><rect x="20" y="84" width="280" height="7" fill="#7fd0ff"/></g>';
  }
  [[60,30],[140,22],[230,34],[290,26]].forEach(function(p,i){ s+='<circle class="o2" style="--d:'+(i*0.4)+'s" cx="'+p[0]+'" cy="'+p[1]+'" r="9" fill="#ff8a7a" stroke="#fff" stroke-width="1.5"/>' });
  return s+'</svg>';
}
