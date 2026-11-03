/* ---------- helpers of lesson 1-1: the drawings of a metal (positive ions in a sea of electrons), blanks to fill, small utilities ---------- */

/* the picture to place inside a slide, taken from the pool of photographs (BGIMG keys are packed only for scenes named in the lesson: 'p_m_collage') */
function pic(scene){ var m={p_m_collage:'s_m_collage'}; return (typeof BGIMG!=='undefined'&&BGIMG[m[scene]])||'' }

/* a flat lattice of positive ions (rows x cols) with free electrons wandering between them.
   o: {w, rows, cols, gap, r, el (number of electrons), seed, id, label (print + and −), shift: [rowIndex, ...] rows pushed by half a step} */
function latSVG(o){
  o=o||{}; var rows=o.rows||4, cols=o.cols||6, gap=o.gap||56, r=o.r||19, W=(cols+1)*gap, H=(rows+1)*gap, R=rnd(o.seed||5), s='', i, j, e;
  for(i=0;i<rows;i++)for(j=0;j<cols;j++){
    var x=gap*(j+1)+((o.shift&&o.shift.indexOf(i)>-1)?(o.dx||0):0), y=gap*(i+1);
    s+='<g class="ion" data-r="'+i+'" data-c="'+j+'"><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#gIon)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/><text x="'+x+'" y="'+(y+r*.36)+'" text-anchor="middle" font-size="'+(r*1.05)+'" font-weight="800" fill="#2a1d00" font-family="Cairo,sans-serif">+</text></g>';
  }
  var n=o.el==null?Math.round(rows*cols*.9):o.el, es='';
  for(e=0;e<n;e++){
    var ex=gap*.6+R()*(W-gap*1.2), ey=gap*.6+R()*(H-gap*1.2);
    es+='<circle class="el" cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="'+(o.er||5.5)+'" fill="#7fd4ff" stroke="rgba(0,0,0,.4)" stroke-width="1" style="animation-delay:'+(R()*2).toFixed(2)+'s;animation-duration:'+(1.6+R()*1.8).toFixed(2)+'s"/>';
  }
  return '<svg viewBox="0 0 '+W+' '+H+'" width="'+(o.w||W)+'" aria-hidden="true" style="direction:ltr;overflow:visible"'+(o.id?' id="'+o.id+'"':'')+'><defs><radialGradient id="gIon" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff2c9"/><stop offset=".45" stop-color="#dcb467"/><stop offset="1" stop-color="#8f6a2a"/></radialGradient></defs><g class="ions">'+s.replace(/<g class="ion"/g,'<g class="ion"')+'</g><g class="els">'+es+'</g></svg>';
}

/* a sentence with blanks, each blank a small set of choices. parts: strings and {o:[options], ok:index, why:[message for each option]} */
function fillHTML(parts){
  return '<div class="fillp">'+parts.map(function(p,i){
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

/* one line of a table of tests: used by the lab slides */
function mark(v){ return v?'<span class="ok-t">✓</span>':'<span class="no-t">✗</span>' }
