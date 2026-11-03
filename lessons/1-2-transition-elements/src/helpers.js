/* ---------- helpers of lesson 1-2: the periodic table, small drawings (objects, test tubes, flasks, an energy profile), utilities ---------- */

/* rows of the periodic table, 18 columns; the two long placeholders stand for the lanthanides and the actinides */
var PT_ROWS=[
  ['H','','','','','','','','','','','','','','','','','He'],
  ['Li','Be','','','','','','','','','','','B','C','N','O','F','Ne'],
  ['Na','Mg','','','','','','','','','','','Al','Si','P','S','Cl','Ar'],
  ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
  ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
  ['Cs','Ba','٥٧–٧١','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
  ['Fr','Ra','٨٩–١٠٣','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']];
/* the names of the common transition elements of the book (Fe, Cu, Ni, Pt, Ti, Au, Cr, W) and of worksheet 1-1 (Zn, Mn, V) */
var PT_NAMES={Fe:'الحديد',Cu:'النحاس',Ni:'النيكل',Pt:'البلاتين',Ti:'التيتانيوم',Au:'الذهب',Cr:'الكروم',W:'التنغستن',Zn:'الخارصين',Mn:'المنغنيز',V:'الفاناديوم',Co:'الكوبالت'};
function ptIsTrans(r,c){ var s=PT_ROWS[r][c]; return r>=3 && c>=2 && c<=11 && s!=='' && s.length<=2 }
/* the cells of the table as html: .t = transition block, .cm = the common ones named in the book, .pl = the lanthanide and actinide placeholders */
function ptCellsHTML(){
  return PT_ROWS.map(function(r,ri){return r.map(function(s,ci){
    if(!s) return '<div class="pc gap"></div>';
    var pl=s.length>2, t=ptIsTrans(ri,ci);
    return '<div class="pc'+(t?' t':'')+(t&&PT_NAMES[s]?' cm':'')+(pl?' blk pl':'')+(ci===0&&ri>0?' g1':'')+'" data-s="'+s+'">'+s+'</div>';
  }).join('')}).join('');
}

/* a test tube with a coloured liquid: o {c: colour, id, w, fill (0..1, how full it starts), label} ; the liquid has class "liq" and grows from the bottom when its parent gets .go */
function tubeSVG(o){
  var id='tb'+o.id, w=o.w||70, f=o.fill==null?1:o.fill;
  return '<svg viewBox="0 0 70 150" width="'+w+'" aria-hidden="true" style="overflow:visible;direction:ltr"><defs><clipPath id="'+id+'"><path d="M16 12H54V116Q54 138 35 138Q16 138 16 116Z"/></clipPath></defs>'+
   '<g clip-path="url(#'+id+')"><rect class="liq" x="14" y="52" width="44" height="90" fill="'+o.c+'" style="'+(f?'':'transform:scaleY(0);')+'transform-box:fill-box;transform-origin:bottom;transition:transform 700ms ease, fill 600ms"/>'+(o.extra||'')+'</g>'+
   '<path d="M16 12H54V116Q54 138 35 138Q16 138 16 116Z" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.85)" stroke-width="2.4"/><path d="M12 12H58" stroke="rgba(255,255,255,.9)" stroke-width="3.4" stroke-linecap="round"/><path d="M22 24V104" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/></svg>';
}
/* a conical flask with a coloured liquid */
function flaskSVG(o){
  var w=o.w||64;
  return '<svg viewBox="0 0 80 100" width="'+w+'" aria-hidden="true" style="direction:ltr;overflow:visible"><defs><clipPath id="fl'+o.id+'"><path d="M30 8H50V36L72 82Q76 94 64 94H16Q4 94 8 82L30 36Z"/></clipPath></defs>'+
   '<g clip-path="url(#fl'+o.id+')"><rect x="0" y="50" width="80" height="50" fill="'+o.c+'"/></g>'+
   '<path d="M30 8H50V36L72 82Q76 94 64 94H16Q4 94 8 82L30 36Z" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.9)" stroke-width="2.6" stroke-linejoin="round"/><path d="M26 8H54" stroke="rgba(255,255,255,.9)" stroke-width="3.4" stroke-linecap="round"/></svg>';
}
/* small flat drawings of the objects of the prior-learning slide */
function objSVG(k){
  var g={fe:['#aeb7bf','#5b646c'],al:['#eef2f5','#a9b4bd'],cu:['#ffb27a','#b4561f']}[k];
  var d='<defs><linearGradient id="ob'+k+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+g[0]+'"/><stop offset="1" stop-color="'+g[1]+'"/></linearGradient></defs>';
  var b= k==='fe' ? '<rect x="14" y="52" width="92" height="12" rx="5" fill="url(#obfe)"/><rect x="4" y="44" width="16" height="28" rx="5" fill="url(#obfe)"/><path d="M106 52L128 58L106 64Z" fill="url(#obfe)"/>'
       : k==='al' ? '<path d="M10 40 Q34 24 58 40 T106 40 L106 76 Q82 92 58 76 T10 76Z" fill="url(#obal)"/><path d="M10 40 Q34 24 58 40 T106 40" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"/>'
       : '<path d="M14 34h96M14 46h96M14 58h96M14 70h96M14 82h96" stroke="url(#obcu)" stroke-width="8" stroke-linecap="round"/><path d="M110 34c14 0 14 12 0 12M14 70c-14 0 -14 12 0 12" stroke="url(#obcu)" stroke-width="8" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="0 0 136 116" width="150" aria-hidden="true">'+d+b+'</svg>';
}
/* a coin made of two metals: 75% copper and 25% nickel as two sectors of one disc */
function coinSVG(w){
  var r=64, cx=80, cy=80, a=Math.PI*2*.75;                       /* copper 75% starts at the top and runs clockwise */
  var x2=cx+r*Math.sin(a), y2=cy-r*Math.cos(a);
  return '<svg viewBox="0 0 160 160" width="'+(w||220)+'" aria-hidden="true" style="direction:ltr"><defs><radialGradient id="gCu" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#ffd0a8"/><stop offset="1" stop-color="#c0662a"/></radialGradient><radialGradient id="gNi" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#f4f7fa"/><stop offset="1" stop-color="#9aa6b1"/></radialGradient></defs>'+
   '<path d="M'+cx+' '+cy+' L'+cx+' '+(cy-r)+' A'+r+' '+r+' 0 1 1 '+x2.toFixed(1)+' '+y2.toFixed(1)+' Z" fill="url(#gCu)" stroke="#fff" stroke-width="3"/>'+
   '<path d="M'+cx+' '+cy+' L'+x2.toFixed(1)+' '+y2.toFixed(1)+' A'+r+' '+r+' 0 0 1 '+cx+' '+(cy-r)+' Z" fill="url(#gNi)" stroke="#fff" stroke-width="3"/>'+
   '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+8)+'" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>'+
   '<text x="62" y="96" text-anchor="middle" font-size="30" font-weight="800" fill="#3a1b06" font-family="Cairo,sans-serif">75%</text><text x="116" y="62" text-anchor="middle" font-size="19" font-weight="800" fill="#1d2630" font-family="Cairo,sans-serif">25%</text></svg>';
}
/* the energy profile of a reaction: s = 0 without a catalyst, 1 with a catalyst (the barrier gets lower) */
function profileSVG(s){
  var peak=44+s*58;
  return '<svg id="prof" viewBox="0 0 460 250" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible"><defs><marker id="pa" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto-start-reverse"><path d="M0 0L9 4.5L0 9z" fill="#ffd36a"/></marker></defs>'+
   '<path d="M30 14V214H440" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="3" stroke-linecap="round"/>'+
   '<text x="14" y="124" font-size="19" font-weight="800" fill="#fff" font-family="Cairo,sans-serif" transform="rotate(-90 14 124)" text-anchor="middle">الطاقة</text>'+
   '<text x="236" y="240" font-size="19" font-weight="800" fill="#fff" font-family="Cairo,sans-serif" text-anchor="middle">مسار التفاعل</text>'+
   '<line x1="40" y1="150" x2="236" y2="150" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-dasharray="5 5"/>'+
   '<path id="pcurve" d="M40 150 C120 150 150 '+peak.toFixed(1)+' 230 '+peak.toFixed(1)+' C310 '+peak.toFixed(1)+' 330 190 420 190" fill="none" stroke="#7fd4ff" stroke-width="5" stroke-linecap="round"/>'+
   '<line id="parr" x1="236" y1="150" x2="236" y2="'+peak.toFixed(1)+'" stroke="#ffd36a" stroke-width="3.2" marker-end="url(#pa)" marker-start="url(#pa)"/>'+
   '<text x="236" y="'+(peak-12).toFixed(1)+'" font-size="18" font-weight="800" fill="#ffd36a" font-family="Cairo,sans-serif" id="plab" text-anchor="middle">طاقة التنشيط</text>'+
   '<text x="60" y="172" font-size="18" font-weight="800" fill="#fff" font-family="Cairo,sans-serif">المتفاعلات</text>'+
   '<text x="372" y="214" font-size="18" font-weight="800" fill="#fff" font-family="Cairo,sans-serif" text-anchor="middle">النواتج</text></svg>';
}
/* a very small periodic table with a few lettered cells, for exam questions that show one. lettered: {row: 0-4, col: 0-17, t: letter} */
function miniPT(lettered,w){
  var cw=20, ch=18, g=2, s='', r, c, shape=[[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
  for(r=0;r<5;r++)for(c=0;c<18;c++){
    if(!shape[r][c]) continue;
    var L=lettered.filter(function(l){return l.row===r&&l.col===c})[0];
    s+='<rect x="'+(c*(cw+g))+'" y="'+(r*(ch+g))+'" width="'+cw+'" height="'+ch+'" rx="3" fill="'+(L?'#E4BC4B':'rgba(255,255,255,.22)')+'" stroke="rgba(255,255,255,.4)"/>'+(L?'<text x="'+(c*(cw+g)+cw/2)+'" y="'+(r*(ch+g)+ch-4)+'" text-anchor="middle" font-size="15" font-weight="800" fill="#241800" font-family="Cairo,sans-serif">'+L.t+'</text>':'');
  }
  return '<svg viewBox="0 0 '+(18*(cw+g))+' '+(5*(ch+g))+'" width="'+(w||380)+'" aria-hidden="true" style="direction:ltr;background:rgba(0,0,0,.22);border-radius:12px;padding:6px">'+s+'</svg>';
}
/* one small swatch of colour followed by its name */
function swatch(c,t){ return '<span style="display:inline-flex;align-items:center;gap:7px"><i style="display:inline-block;width:20px;height:20px;border-radius:50%;background:'+c+';border:2px solid rgba(255,255,255,.7)"></i>'+t+'</span>' }
