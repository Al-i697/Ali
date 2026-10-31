/* ---------- helpers for the reacting-masses lesson: formulas, molar masses, answer rows, matching, tables ---------- */
var AR={H:1,C:12,N:14,O:16,F:19,Na:23,Mg:24,Al:27,Si:28,P:31,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Cu:63.5,Zn:65,Ag:108,Ba:137};
function parseF(f){
  var parts=f.replace(/·/g,'.').split('.'), tot={};
  function add(o,n,c){o[n]=(o[n]||0)+c}
  parts.forEach(function(p,i){
    var k=1, m=/^(\d+)(.*)$/.exec(p); if(i>0&&m){k=+m[1]; p=m[2]}
    var st=[{}], re=/([A-Z][a-z]?)(\d*)|(\()|\)(\d*)/g, mt, e;
    while((mt=re.exec(p))){
      if(mt[1]) add(st[st.length-1],mt[1],mt[2]?+mt[2]:1);
      else if(mt[3]) st.push({});
      else{var top=st.pop(), mult=mt[4]?+mt[4]:1; for(e in top) add(st[st.length-1],e,top[e]*mult)}
    }
    for(e in st[0]) add(tot,e,st[0][e]*k);
  });
  return tot;
}
function MR(f){var c=parseF(f), s=0, e; for(e in c) s+=AR[e]*c[e]; return Math.round(s*1000)/1000}
/* a formula as html: subscripts for the digits that follow a symbol or a bracket, a dot for water of crystallisation */
function fh(f){
  var o='', prev='', i, c, d;
  for(i=0;i<f.length;i++){
    c=f.charAt(i);
    if(c==='.'){o+='·'; prev='·'}
    else if(/\d/.test(c)&&/[A-Za-z)]/.test(prev)){d=c; while(/\d/.test(f.charAt(i+1))) d+=f.charAt(++i); o+='<sub>'+d+'</sub>'; prev='9'}
    else{o+=c; prev=c}
  }
  return '<span class="num fmla">'+o+'</span>';
}
function nin(id,unit){return ninHTML(id,unit||'','sm')}
/* a compact line of reference Ar values */
function arStrip(list){
  return '<div class="chips arstrip" style="gap:8px;direction:ltr;justify-content:center">'+list.map(function(s){return '<span class="pill" style="min-height:36px;padding:0 12px;font-size:20px;font-family:var(--font-display)">'+s+' = '+AR[s]+'</span>'}).join('')+'</div>';
}
function tolOf(a){return Math.max(1e-9,Math.abs(a)*0.008)}
/* rows of dependent answers: the next box of a row opens when the previous one is right.
   rows: [{a:[answers], w:[messages when right], h:[hints when wrong]}] */
function bindRows(el,rows,done){
  var left=rows.length;
  $$('.qr',el).forEach(function(r,i){
    var ins=$$('.nin',r), b=rows[i], fb=$('.fb',r)||$('.fbg',el);
    ins.forEach(function(n,j){ if(j>0){ $('input',n).disabled=true; n.classList.add('lock') } });
    ins.forEach(function(n,j){
      bindNum(n,b.a[j],b.t?b.t[j]:tolOf(b.a[j]),function(ok){
        if(ok){
          say(fb,(b.w&&b.w[j])||'✓','ok');
          if(j<ins.length-1){var nx=ins[j+1]; nx.classList.remove('lock'); $('input',nx).disabled=false; try{$('input',nx).focus()}catch(e){}}
          else{r.classList.add('ok'); left--; if(!left&&done) done()}
        }else say(fb,(b.h&&b.h[j])||'راجع الحساب وحاول مرة ثانية','bad');
      });
    });
  });
}
function fx3(v){ // 1.505e23 -> [1.505, 23]
  var e=Math.floor(Math.log10(Math.abs(v))+1e-12), c=v/Math.pow(10,e); return [Math.round(c*1e4)/1e4,e];
}
var NA=6.02e23;

/* a line of answers that open one after the other: list [{n:'data-n', a:answer, t:tolerance, w:message when right, h:hint when wrong}] */
function bindSeq(el,list,fb,done){
  var boxes=list.map(function(b){return $('.nin[data-n="'+b.n+'"]',el)});
  boxes.forEach(function(n,i){ if(i>0){ $('input',n).disabled=true; n.classList.add('lock') } });
  list.forEach(function(b,i){
    bindNum(boxes[i],b.a,b.t!=null?b.t:tolOf(b.a),function(ok){
      if(ok){
        say(fb,b.w||'✓','ok'); if(b.f) b.f(); var nx=boxes[i+1];
        if(nx){nx.classList.remove('lock'); $('input',nx).disabled=false; try{$('input',nx).focus()}catch(e){}}
        else if(done) done();
      }else say(fb,b.h||'راجع الحساب وحاول مرة ثانية','bad');
    });
  });
}
/* chips dragged (or tapped, then the slot tapped) into slots: items [[key, html, extra class]], slots carry data-k, the tray is #tray */
function bindMatch(el,items,o){
  o=o||{}; var tray=$('#tray',el), fb=$(o.fb||'.fb',el), left=items.length, sel=null;
  function place(chip,slot){
    if(chip.getAttribute('data-k')===slot.getAttribute('data-k')&&!slot.querySelector('.mchip')){
      var ph=$('.ph',slot); if(ph) ph.remove(); slot.appendChild(chip); chip.classList.add('ok-b','locked'); chip.style.cursor='default'; left--;
      say(fb,left?(o.more||'صح! كمّل'):(o.done||'ممتاز'),'ok');
      if(!left){ tray.classList.add('hide'); var g=$('#gb',el); if(g){g.classList.remove('hide'); g.classList.add('up')} if(o.onDone) o.onDone() }
      return true;
    }
    slot.classList.add('shake'); later(function(){slot.classList.remove('shake')},340); say(fb,o.bad||'حاول مرة ثانية','bad'); return false;
  }
  items.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'+(it[2]?' '+it[2]:''); c.setAttribute('data-k',it[0]); c.innerHTML=it[1]; if(o.css) c.style.cssText=o.css; tray.appendChild(c);
    drag(c,{zone:'.mslot',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.mslot',el).forEach(function(s){s.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,s); sel.style.outline=''; sel=null } })});
}
/* a row of one answer line: label, boxes (id, unit) and a feedback line */
function qrow(label,boxes){
  return '<div class="qr"><div class="qt">'+label+'</div><div class="qa">'+boxes.map(function(b){return (b[2]?'<span class="ql">'+b[2]+'</span>':'')+nin(b[0],b[1])}).join('')+'</div><div class="fb"></div></div>';
}
/* the table of a formula from masses: columns [{sym, mass (number, or null when the student finds it), M, n, r}], returns html; bindFormula opens the boxes in order */
function formulaTable(id,cols,formulas,massUnit){
  function td(c){return '<td>'+c+'</td>'}
  var h='<table class="mtab"><thead><tr><th></th>'+cols.map(function(c){return '<th><span class="bigeq" style="font-size:34px;color:var(--gold)">'+c.sym+'</span></th>'}).join('')+'</tr></thead><tbody>';
  h+='<tr><th>الكتلة المندمجة</th>'+cols.map(function(c,i){return td(c.mass==null?nin(id+'m'+i,'g'):'<span class="num">'+c.mass+' g</span>')}).join('')+'</tr>';
  h+='<tr><th>الكتلة المولية</th>'+cols.map(function(c){return td('<span class="num">'+AR[c.sym]+' g/mol</span>')}).join('')+'</tr>';
  h+='<tr><th>عدد المولات</th>'+cols.map(function(c,i){return td(nin(id+'n'+i,'mol'))}).join('')+'</tr>';
  h+='<tr><th>أبسط نسبة</th>'+cols.map(function(c,i){return td(nin(id+'r'+i,''))}).join('')+'</tr></tbody></table>';
  h+='<div class="fb" style="min-height:26px;text-align:center"></div>';
  h+='<div style="display:flex;align-items:center;gap:14px;justify-content:center;flex-wrap:wrap" class="hide" id="'+id+'fq"><span style="font-size:26px;font-weight:800">الصيغة الكيميائية:</span>'+optsHTML(formulas.map(function(f){return {t:fh(f[0])}})).replace('class="opts"','class="opts" style="flex-direction:row;gap:10px"')+'</div>';
  return h;
}
function bindFormula(el,id,cols,formulas,done){
  var list=[], fb=$('.fb',el);
  cols.forEach(function(c,i){ if(c.mass==null) list.push({n:id+'m'+i,a:c.mass2,t:0.02,w:'✓ '+c.msg,h:c.hint}) });
  cols.forEach(function(c,i){ var m=c.mass==null?c.mass2:c.mass; var n=m/AR[c.sym]; list.push({n:id+'n'+i,a:n,t:Math.max(n*0.012,0.0004),w:'✓ n = '+m+' ÷ '+AR[c.sym]+' = '+(+n.toPrecision(3))+' mol',h:'n = m ÷ M'}) });
  var ns=cols.map(function(c){var m=c.mass==null?c.mass2:c.mass; return m/AR[c.sym]}), mn=Math.min.apply(null,ns);
  cols.forEach(function(c,i){ var r=Math.round(ns[i]/mn*10)/10; list.push({n:id+'r'+i,a:r,t:0.12,w:'✓ '+(+ns[i].toPrecision(3))+' ÷ '+(+mn.toPrecision(3))+' ≈ '+Math.round(r),h:'اقسم عدد المولات على أقل عدد مولات'}) });
  bindSeq(el,list,fb,function(){
    var q=$('#'+id+'fq',el); q.classList.remove('hide'); q.classList.add('up');
    bindMcq(q,formulas.map(function(f){return {t:'',ok:!!f[1],why:f[2]||''}}),$('.fb',el),function(){ if(done) done() });
  });
}

/* ---------- gas-volume lesson: answer lines, bars, conversion chains, particles ---------- */
/* answer line without its own feedback: the slide has one shared feedback line */
function qline(label,boxes){
  return '<div class="qr ql1"><div class="qt">'+label+'</div><div class="qa">'+boxes.map(function(b){return (b[2]?'<span class="ql">'+b[2]+'</span>':'')+nin(b[0],b[1])}).join('')+'</div></div>';
}
/* horizontal bars: rows [{lab, parts:[[value, class, text]]}], the widest bar is `max`; the bars grow when the container gets .go */
function barsHTML(id,rows,max){
  return '<div class="bars" id="'+id+'">'+rows.map(function(r){
    return '<div class="brow"><div class="bl">'+r.lab+'</div><div class="btrack">'+r.parts.map(function(p){return p[0]>0?'<i class="bseg '+p[1]+'" style="--w:'+(p[0]/max*100).toFixed(1)+'%"><b class="num">'+p[2]+'</b></i>':''}).join('')+'</div></div>';
  }).join('')+'</div>';
}
/* the conversion chain given -> moles -> moles -> wanted; the cells fill in as the rows are answered */
function chainHTML(id,labels){
  return '<div class="cchain" id="'+id+'">'+labels.map(function(l,i){return (i?'<div class="carr">⟵</div>':'')+'<div class="ccell" data-i="'+i+'"><span class="cl">'+l[0]+'</span><b class="num cv"></b></div>'}).join('')+'</div>';
}
function chainFill(el,id,i,v){ var c=$('#'+id+' .ccell[data-i="'+i+'"]',el); if(c){ $('.cv',c).innerHTML=v; c.classList.add('on') } }
/* independent answers: each box is checked on its own, done() when all are right. list [{n,a,t,w,h,f}] */
function bindAll(el,list,fb,done){
  var left=list.length;
  list.forEach(function(b){
    bindNum($('.nin[data-n="'+b.n+'"]',el),b.a,b.t!=null?b.t:tolOf(b.a),function(ok){
      if(ok){ say(fb,b.w||'✓','ok'); if(b.f) b.f(); left--; if(!left&&done) done() }
      else say(fb,b.h||'راجع الحساب وحاول مرة ثانية','bad');
    });
  });
}
/* a conversion-chain slide: equation + data on top, the chain, one answer line per step; o: {id,ch,title,eq,data,labels,first,steps:[{n,q,u,lab,a,t,w,h,fill}],side,gbar,note} */
function chainSlide(o){
  slide({id:o.id,ch:o.ch,title:o.title,tag:o.tag||'احسب بالترتيب',
   html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
    <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
     <div class="frm brk" style="padding:12px 20px;gap:6px;align-items:center"><div class="bigeq" style="font-size:${o.eqSize||34}px;color:var(--gold)">${o.eq}</div><div class="sm" style="font-size:21px;text-align:center;line-height:1.4">${o.data}</div></div>
     ${chainHTML(o.id+'c',o.labels.map(function(l){return [l]}))}
     ${o.steps.map(function(s){return qline(s.q,[[s.n,s.u,s.lab]])}).join('')}
     <div class="fb" style="text-align:center;min-height:26px"></div></div>
    <div class="col" style="width:${o.sideW||350}px;flex:none;gap:10px;justify-content:center">${o.side||''}<div class="gbar hide" id="gb" style="font-size:21px">${o.gbar}</div></div></div>`;},
   init:function(el){
    var list=o.steps.map(function(s,i){return {n:s.n,a:s.a,t:s.t,w:s.w,h:s.h,f:function(){chainFill(el,o.id+'c',i+1,s.fill||'')}}});
    chainFill(el,o.id+'c',0,o.first||'');
    bindSeq(el,list,$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up'); if(o.done) o.done(el)});
   },
   note:o.note});
}
/* seeded random numbers, so the drawn particles keep their places */
function rnd(seed){ var s=seed||1; return function(){ s=(s*16807)%2147483647; return (s-1)/2147483646 } }
/* n particles of one colour spread over the box x,y,w,h (svg) */
function parts(x,y,w,h,n,col,r,seed){
  var R=rnd(seed), o='', i, px, py;
  for(i=0;i<n;i++){
    px=x+r+R()*(w-2*r); py=y+r+R()*(h-2*r);
    o+='<circle class="gp" cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+r+'" fill="'+col+'" stroke="rgba(0,0,0,.35)" stroke-width="1.2" style="animation-delay:'+(R()*2).toFixed(2)+'s;animation-duration:'+(2+R()*2).toFixed(2)+'s"/>';
  }
  return o;
}
/* the standard noble-gas style colours of the lesson */
var GC={H2:'#5CA8F0', O2:'#EE6A5C', CO2:'#8a949c', N2:'#6E7FE8', Cl2:'#79D06A', HCl:'#E4BC4B', C2H6:'#C79AF0'};

/* ---------- solutions lesson: generic answer rows slide, formula triangle, beaker ---------- */
/* a generic slide of independent answer rows; o: {id,ch,title,tag,intro,rows:[{n,q,u,lab,a,t,w,h}],side,gbar,note} */
function rowsSlide(o){
  slide({id:o.id,ch:o.ch,title:o.title,tag:o.tag||'احسب',
   html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
    <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
     <div class="panel" style="padding:12px 18px"><p class="lead" style="margin:0;font-size:24px">${o.intro}</p></div>
     ${o.rows.map(function(r){return qline(r.q,[[r.n,r.u,r.lab]])}).join('')}
     <div class="fb" style="text-align:center;min-height:26px"></div></div>
    <div class="col" style="width:${o.sideW||360}px;flex:none;gap:10px;justify-content:center">${o.side||''}<div class="gbar hide" id="gb" style="font-size:21px">${o.gbar}</div></div></div>`;},
   init:function(el){
    bindAll(el,o.rows.map(function(r){return {n:r.n,a:r.a,t:r.t,w:r.w,h:r.h}}),$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up'); if(o.done) o.done(el)});
   },
   note:o.note});
}
/* the formula triangle: top (t), bottom left (l), bottom right (r); o.cv adds tap targets; font sizes shrink for long labels */
function triSVG(t,l,r,o){
  o=o||{};
  var FILL={t:'rgba(228,188,75,.55)',l:'rgba(95,200,140,.55)',r:'rgba(95,149,198,.62)'};
  function fs(s,b){var n=s.replace(/<[^>]*>/g,'').length; if(b>=30) return n>5?20:26; return n>11?b-8:(n>7?b-4:b)}
  function cell(k,pts,x,y,txt,b){
    return '<g class="cv'+(o.cv?' tap':'')+'" data-k="'+k+'"><polygon class="cell" points="'+pts+'" fill="'+FILL[k]+'" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linejoin="round"/>'+
     '<text class="tt" x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-family="var(--font-display)" font-weight="800" font-size="'+fs(txt,b)+'" fill="var(--ink)" direction="ltr">'+txt+'</text></g>';
  }
  return '<svg class="tri" viewBox="0 0 320 280" width="'+(o.w||260)+'" aria-hidden="true">'+
   cell('t','160,18 88,140 232,140',160,100,t,30)+cell('l','88,140 160,140 160,262 18,262',98,206,l,24)+cell('r','160,140 232,140 302,262 160,262',222,206,r,24)+'</svg>';
}
/* a beaker of coloured solution: v litres (0 to 2), alpha = how strong the colour is (0 to 1) */
function beakerSVG(id,v,alpha){
  var top=24, bot=244, hh=(bot-top)*(v/2), y=bot-hh, t='', i;
  for(i=1;i<=4;i++){ var yy=bot-(bot-top)*(i/4); t+='<line x1="52" y1="'+yy+'" x2="'+(i%2?70:84)+'" y2="'+yy+'" stroke="rgba(255,255,255,.75)" stroke-width="2"/>'+(i%2===0?'<text x="92" y="'+(yy+5)+'" font-size="15" font-weight="700" fill="var(--ink)" direction="ltr">'+(i/2)+' L</text>':'') }
  return '<svg id="'+id+'" viewBox="0 0 260 270" width="100%" style="max-height:300px" aria-hidden="true">'+
   '<rect x="50" y="'+y+'" width="160" height="'+hh+'" rx="4" fill="rgba(40,120,230,'+(0.08+0.8*alpha).toFixed(2)+')"/>'+
   '<path d="M50 20V244Q50 252 58 252H202Q210 252 210 244V20" fill="none" stroke="var(--cyan)" stroke-width="4" stroke-linejoin="round"/>'+t+
   '<line x1="50" y1="'+y+'" x2="210" y2="'+y+'" stroke="rgba(255,255,255,.65)" stroke-width="2.5"/></svg>';
}
/* a titration-style burette drawing helper is in part_d */
