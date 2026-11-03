/* ---------- helpers of lesson 1-3: the periodic table, atoms drawn with their shells, the trough of the activity, blanks to fill ---------- */

var PT_ROWS=[
  ['H','','','','','','','','','','','','','','','','','He'],
  ['Li','Be','','','','','','','','','','','B','C','N','O','F','Ne'],
  ['Na','Mg','','','','','','','','','','','Al','Si','P','S','Cl','Ar'],
  ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
  ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
  ['Cs','Ba','٥٧–٧١','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
  ['Fr','Ra','٨٩–١٠٣','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']];
/* the cells of the table: data-c is the column (0 to 17); .g1 = group I without hydrogen; .t = the transition block */
function ptCellsHTML(){
  return PT_ROWS.map(function(r,ri){return r.map(function(s,ci){
    if(!s) return '<div class="pc gap"></div>';
    var pl=s.length>2, t=ri>=3&&ci>=2&&ci<=11&&!pl;
    return '<div class="pc'+(t?' t':'')+(pl?' blk pl':'')+(ci===0&&ri>0?' g1':'')+'" data-c="'+ci+'" data-s="'+s+'">'+s+'</div>';
  }).join('')}).join('');
}

/* an atom drawn with its electron shells: counts = electrons per shell from the inside, e.g. [2,8,1]; the last electron of the outer shell is gold and has class "oe" */
function shellSVG(counts,sym,id){
  var n=counts.length, s='', i, j, k, R=[], cx=85, cy=85, rr=5.5;
  for(i=0;i<n;i++) R.push(76-(n-1-i)*18);
  for(i=0;i<n;i++) s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R[i]+'" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>';
  for(i=0;i<n;i++){
    k=counts[i];
    for(j=0;j<k;j++){
      var a=-Math.PI/2+i*.4+Math.PI*2*j/k, x=cx+R[i]*Math.cos(a), y=cy+R[i]*Math.sin(a), outer=(i===n-1&&k===1);
      if(outer){ a=-Math.PI/4; x=cx+R[i]*Math.cos(a); y=cy+R[i]*Math.sin(a) }
      s+='<circle class="'+(outer?'oe':'')+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+rr+'" fill="'+(outer?'#ffd36a':'#7fd4ff')+'" stroke="rgba(0,0,0,.45)" stroke-width="1"/>';
    }
  }
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="14" fill="#c9a24a" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/><text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" font-size="14" font-weight="800" fill="#2a1d00" font-family="Cairo,sans-serif">'+sym+'</text>';
  return '<svg viewBox="0 0 170 170" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible"'+(id?' id="'+id+'"':'')+'>'+s+'</svg>';
}

/* a sentence with blanks, each blank a small set of choices. parts: strings and {o:[options], ok:index, why:[message for each option]} */
function fillHTML(parts){
  return '<div class="fillp">'+parts.map(function(p){
    if(typeof p==='string') return '<span class="ft">'+p+'</span>';
    return '<span class="fb1" data-ok="'+p.ok+'"><span class="fq">؟</span><span class="fo">'+p.o.map(function(t,j){return '<button type="button" class="fopt" data-j="'+j+'">'+t+'</button>'}).join('')+'</span></span>';
  }).join(' ')+'</div>';
}
function bindFill(el,parts,fb,done){
  var blanks=parts.filter(function(p){return typeof p!=='string'}), left=blanks.length;
  $$('.fb1',el).forEach(function(b,k){
    var P=blanks[k];
    $$('.fopt',b).forEach(function(o){o.addEventListener('click',function(){
      if(b.classList.contains('ok')) return;
      var j=+o.getAttribute('data-j');
      if(j===P.ok){ b.classList.add('ok'); $('.fq',b).textContent=P.o[j]; $('.fo',b).classList.add('hide'); left--; say(fb,'✓ '+(P.why&&P.why[j]?P.why[j]:'صح'),'ok'); if(!left&&done) done() }
      else{ o.classList.add('bad-b','shake'); o.disabled=true; later(function(){o.classList.remove('shake')},340); say(fb,(P.why&&P.why[j])||'فكّر مرة ثانية','bad') }
    })});
  });
}

/* the glass trough of Activity 1-1: green indicator water, a shield, a piece of metal that moves and reacts when the trough gets the class li / na / k (and run) */
function troughSVG(){
  var b='', i;
  for(i=0;i<9;i++) b+='<circle class="bub" cx="'+(150+i*34)+'" cy="205" r="'+(4+(i%3)*1.5)+'" fill="rgba(255,255,255,.8)" style="animation-delay:'+(i*.27).toFixed(2)+'s"/>';
  return '<svg id="tr" class="tr" viewBox="0 0 520 300" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible"><defs><clipPath id="trc"><path d="M60 120H460V230Q460 262 428 262H92Q60 262 60 230Z"/></clipPath></defs>'+
   '<g clip-path="url(#trc)"><rect class="wtr" x="50" y="150" width="420" height="125" fill="#58c56a" opacity=".9"/><g class="bubs">'+b+'</g></g>'+
   '<path d="M60 108V230Q60 262 92 262H428Q460 262 460 230V108" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linejoin="round"/>'+
   '<g class="pcw"><g class="pc"><ellipse class="pcs" cx="140" cy="148" rx="17" ry="9" fill="#e9edf1" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>'+
   '<g transform="translate(140,140)"><g class="fl"><path d="M0 0C-14 -16 -10 -34 0 -54C10 -34 14 -16 0 0Z" fill="#b277ff" opacity=".95"/><path d="M0 -4C-7 -14 -5 -25 0 -37C5 -25 7 -14 0 -4Z" fill="#f0dcff"/></g>'+
   '<g class="sp"><circle cx="0" cy="-30" r="3" fill="#e5c6ff"/><circle cx="16" cy="-42" r="2.5" fill="#e5c6ff"/><circle cx="-16" cy="-44" r="2.5" fill="#e5c6ff"/></g></g></g></g>'+
   '<rect x="470" y="90" width="30" height="190" rx="6" fill="rgba(180,220,255,.25)" stroke="rgba(255,255,255,.8)" stroke-width="3"/><text x="485" y="195" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="Cairo,sans-serif" transform="rotate(-90 485 195)">شاشة حماية</text></svg>';
}
