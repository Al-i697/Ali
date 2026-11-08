/* ---------- lesson 2-3 helpers: composition bars, drawings of the metal lattices, the carbon scale ---------- */
function eqn(s){ return '<bdi dir="ltr" class="num">'+sub(String(s).replace(/\^([0-9]*[+\-−]?)/g,'<sup>$1</sup>'))+'</bdi>' }

/* composition bar of an alloy: parts [[symbol, percent, colour, ink]]; a part under 6 % has no label inside (it is named in the legend under the bar), names [arabic names] go in the legend */
function compBar(parts,names){
  var bar='<div class="cbar">'+parts.map(function(p){
    return '<span class="cseg" style="flex:'+p[1]+' 1 0;background:'+p[2]+';color:'+(p[3]||'#10243f')+'">'+(p[1]>=6?'<bdi dir="ltr">'+p[0]+'</bdi>':'')+'</span>'}).join('')+'</div>';
  var leg='<div class="cleg">'+parts.map(function(p,i){
    return '<span class="cl"><i style="background:'+p[2]+'"></i><span>'+(names&&names[i]?names[i]:p[0])+'</span> <b>'+ar(String(p[1]).replace('.','٫'))+'٪</b></span>'}).join('')+'</div>';
  return '<div class="comp">'+bar+leg+'</div>';
}
/* the usual colours of the elements in the drawings */
var CL={Cu:'#d58b43',Zn:'#9db8d6',Sn:'#d9dde4',Fe:'#8e9aab',Cr:'#3fbfb0',Ni:'#e6e0a0',Al:'#cfd6e0',Mg:'#9fe0a8',Mn:'#e08fb0',C:'#3a3d45',W:'#c9a0ff',Pb:'#7d8794'};

/* rows of atoms (the pure metal slides, the alloy jams when a force is applied): the wrapper's class push moves the top rows */
function atomsSVG(alloy){
  var s='<svg class="atoms" viewBox="0 0 400 230" width="100%" aria-hidden="true" style="direction:ltr;display:block"><g class="'+(alloy?'alloy':'pure')+'">', r, c, x, y, big, small;
  for(r=0;r<5;r++){
   s+='<g class="row'+(r<2?' t':'')+'">';
   for(c=0;c<10;c++){
    x=22+c*38+(r%2?19:0); y=28+r*38; big=alloy&&((r===1&&(c===2||c===6))||(r===2&&(c===4||c===8))); small=alloy&&((r===1&&c===4)||(r===2&&c===1));
    if(big) s+='<circle cx="'+x+'" cy="'+(y+(r===1?6:-6))+'" r="23" fill="#e8a33d" stroke="#6b4700" stroke-width="2"/>';
    else if(small) s+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="#2a2d33" stroke="#fff" stroke-width="1.5"/>';
    else s+='<circle cx="'+x+'" cy="'+y+'" r="17" fill="#aeb9c7" stroke="#5a6678" stroke-width="2"/>';
   }
   s+='</g>';
  }
  return s+'</g></svg>';
}

/* a small patch of a metal lattice (no letters inside: the labels are html). kind: 'pure' one kind of atom; 'big' a few larger atoms of another element (Fig 2-4 b);
   'mix' two kinds of similar size mixed in one lattice (like brass); 'sep' two metals as two separate blocks (not an alloy) */
function latSVG(kind){
  var s='<svg viewBox="0 0 300 190" aria-hidden="true" style="direction:ltr;display:block;width:100%;height:100%">', r, c, x, y, o, R=rnd(kind==='mix'?7:3), big=[];
  for(r=0;r<5;r++) for(c=0;c<8;c++){
    x=24+c*36+(r%2?18:0); y=26+r*35; o='a';
    if(kind==='mix') o=R()<.34?'b':'a';
    if(kind==='sep') o=r>=3?'b':'a';
    if(kind==='big'&&((r===1&&c===2)||(r===3&&c===5)||(r===2&&c===0))){ big.push([x,y]); continue }
    s+='<circle cx="'+x+'" cy="'+y+'" r="'+(kind==='mix'?15:14)+'" fill="'+(o==='b'?'#e8a33d':'#aeb9c7')+'" stroke="'+(o==='b'?'#6b4700':'#5a6678')+'" stroke-width="2"/>';
  }
  big.forEach(function(p){ s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="21" fill="#e8a33d" stroke="#6b4700" stroke-width="2.5"/>' });
  return s+'</svg>';
}

/* the drawing of an alloy lattice for an exam option (small, no letters): kind 'pure' | 'alloy' | 'layers' | 'rand' */
function miniLat(kind){
  var s='<svg viewBox="0 0 128 60" aria-hidden="true" style="direction:ltr;display:inline-block;width:200px;height:94px;vertical-align:middle">', r, c, x, y, o, R=rnd(kind==='rand'?11:5);
  for(r=0;r<4;r++) for(c=0;c<9;c++){
    x=9+c*13+(r%2?6.5:0); y=8+r*14; o=0;
    if(kind==='alloy') o=R()<.17?1:0;
    if(kind==='rand') o=R()<.5?1:0;
    if(kind==='layers') o=r>=2?1:0;
    s+='<circle cx="'+x+'" cy="'+y+'" r="6" fill="'+(o?'#2a2d33':'#fff')+'" stroke="#2a2d33" stroke-width="1"/>';
  }
  return s+'</svg>';
}
