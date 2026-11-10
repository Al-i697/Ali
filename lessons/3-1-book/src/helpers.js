/* helpers shared by the Mr slides (counting cards) */
/* ---- Mr flow blocks (deck slides 12 and 13) ---- */
function flowBlock(c,i,mode){
  var rows=c.parts.map(function(p,j){
    var tag=p[2]?'<small style="color:var(--muted);font-size:14px">'+p[2]+'</small>':'';
    var left=mode==='count'?'<input class="cin" inputmode="numeric" autocomplete="off" aria-label="عدد ذرات '+p[0]+'">':'<span class="num" style="font-weight:800">'+p[1]+'</span>';
    var right=mode==='count'?'<span class="res"></span>':'<input class="cin pw" inputmode="decimal" autocomplete="off" aria-label="الناتج" style="margin-inline-start:auto;width:88px">';
    return '<div class="fr" data-j="'+j+'">'+left+'<span class="arv">×</span><b>'+p[0]+'</b>'+tag+'<span class="arv num">('+AR_T[p[0]]+')</span><span class="arv">=</span>'+right+'</div>';
  }).join('');
  return '<div class="fblk" data-i="'+i+'"><div class="fsum gbox"><span class="mf" style="font-size:25px">M<sub>r</sub> =</span>'+ninHTML('m'+i,'','sm')+'<div class="fb" style="min-height:0;font-size:15px;line-height:1.2"></div></div><span class="arw">◀</span><div class="frows">'+rows+'</div><span class="arw">◀</span>'+
    '<div class="fcmp frm brk"><div class="ff">'+c.f+'</div><small>'+c.name+'</small>'+(c.note?'<small style="color:var(--cyan)">'+c.note+'</small>':'')+'</div></div>';
}
function bindFlow(el,C,mode){
  $$('.fblk',el).forEach(function(blk,i){
    var c=C[i];
    $$('.fr',blk).forEach(function(r,j){
      var inp=$('.cin',r), p=c.parts[j], want=mode==='count'?p[1]:p[1]*AR_T[p[0]], done=false;
      function ok(){ if(done) return; done=true; inp.classList.add('ok-b'); inp.readOnly=true; if(mode==='count'){var rs=$('.res',r); rs.textContent=p[1]*AR_T[p[0]]; rs.classList.add('pop')} }
      inp.addEventListener('input',function(){ var v=nz(inp.value); inp.classList.remove('bad-b'); if(v!==null&&Math.abs(v-want)<0.001) ok() });
      inp.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!done){var v=nz(inp.value); if(v===null||Math.abs(v-want)>=0.001){inp.classList.add('bad-b','shake'); later(function(){inp.classList.remove('shake')},340)}} });
    });
    var fb=$('.fsum .fb',blk);
    bindNum($('.nin',blk),c.mr,0.01,function(ok){ if(ok) say(fb,'✓','ok'); else say(fb,'اجمع الناتج','bad') });
  });
}

/* ---------- part B: Mr, formulas from models, tickets, homework ---------- */
var AR_T={H:1,C:12,N:14,O:16,F:19,Na:23,Mg:24,Al:27,S:32,Cl:35.5,Fe:56,Cu:63.5,Ca:40,K:39,Br:80};

function arSide(list){
  list=list||['H','C','N','O','F','Na','Mg','Al','S','Cl','Fe','Cu','Ca'];
  return '<div class="arside"><h4>الكتل الذرية Ar</h4><div class="g">'+list.map(function(s){return '<span><i style="font-style:normal">'+s+'</i><b>'+AR_T[s]+'</b></span>'}).join('')+'</div><p style="font-size:16px;margin-top:10px;opacity:.85">الجدول ٣-٢</p></div>';
}

/* one Mr card: count each element, then add */
function mrCardHTML(c,i,compact){
  var rows=c.parts.map(function(p,j){
    return '<div class="mrr" data-j="'+j+'"><div><b>'+p[0]+'</b>'+(p[2]?'<small>'+p[2]+'</small>':'')+'</div><input class="cin" inputmode="numeric" autocomplete="off" aria-label="عدد ذرات '+p[0]+'"><span class="num" style="white-space:nowrap">× '+AR_T[p[0]]+' <span class="res"></span></span></div>';
  }).join('');
  return '<div class="mrc" data-i="'+i+'"><h4><b class="eq">'+c.f+'</b><span>'+c.name+'</span></h4>'+
    (compact?'':'<div class="sm muted" style="font-size:18px">عدد الذرات في الصيغة × Ar</div>')+rows+
    '<div class="tot">M<sub>r</sub> = '+ninHTML('m'+i,'','sm')+'</div><div class="fb" style="min-height:24px;font-size:18px;text-align:center"></div></div>';
}
function bindMrCard(card,c){
  var rows=$$('.mrr',card), got=0;
  rows.forEach(function(r,j){
    var inp=$('.cin',r), res=$('.res',r), p=c.parts[j], done=false;
    function ok(){ if(done) return; done=true; inp.classList.add('ok-b'); inp.readOnly=true; res.textContent='= '+(p[1]*AR_T[p[0]]); res.style.color='var(--ok)'; res.classList.add('pop'); got++; }
    inp.addEventListener('input',function(){ var v=nz(inp.value); inp.classList.remove('bad-b'); if(v===p[1]) ok() });
    inp.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!done){var v=nz(inp.value); if(v!==p[1]){inp.classList.add('bad-b','shake'); later(function(){inp.classList.remove('shake')},340)}} });
  });
  var fb=$('.fb',card);
  bindNum($('.nin',card),c.mr,0.01,function(ok){ if(ok) say(fb,'✓ '+c.sum,'ok'); else say(fb,'اجمع النواتج: '+(got<rows.length?'أكمل عدّ الذرات أولاً':'اجمع القيم الظاهرة'),'bad') });
}
