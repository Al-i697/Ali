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

/* ---------- unit 4 helpers shared by the lessons 4-1, 4-2 and 4-3: formulas, flat atoms and bonds, steppers, reveal cards ---------- */
function ff(f){return '<span class="num fmla">'+sub(f)+'</span>'}   /* a formula with subscripts */
/* one atom of a flat structural drawing */
function atm(x,y,r,s){
  var c=s==='C'?['#3A3F45','#fff']:s==='H'?['#EEF4F4','#17383d']:(s==='O'||s==='OH')?['#E0453A','#fff']:s==='Br'?['#9B4A2F','#fff']:['#5CBF4A','#06290f'];
  return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c[0]+'" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><text x="'+x+'" y="'+(y+r*.36)+'" text-anchor="middle" font-size="'+(r*1.08)+'" font-weight="800" fill="'+c[1]+'" font-family="Cairo,sans-serif">'+s+'</text>';
}
function bnd(x1,y1,x2,y2,w,col){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#9fb4b8')+'" stroke-width="'+(w||4)+'" stroke-linecap="round"/>'}
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
  var r='<svg viewBox="0 0 150 90" width="'+(w||150)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+bnd(48,45,102,45,4)+bnd(48,38,102,38,4)+bnd(48,52,102,52,4)+bnd(48,45,20,18,4)+bnd(48,45,20,72,4)+bnd(102,45,130,18,4)+bnd(102,45,130,72,4)+atm(20,18,11,'H')+atm(20,72,11,'H')+atm(130,18,11,'H')+atm(130,72,11,'H')+atm(48,45,16,'C')+atm(102,45,16,'C')+'</svg>';
  return (w&&w<190)?noTxt(r):r;
}
function yne2SVG(w){
  return '<svg viewBox="0 0 170 60" width="'+(w||170)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+bnd(55,30,115,30,4)+bnd(55,23,115,23,4)+bnd(55,37,115,37,4)+bnd(55,30,22,30,4)+bnd(115,30,148,30,4)+atm(22,30,11,'H')+atm(148,30,11,'H')+atm(55,30,16,'C')+atm(115,30,16,'C')+'</svg>';
}

/* ---------- more unit 4 helpers (alkenes, petroleum): generic slides, structural-formula drawings, the addition animator ---------- */
function ticketSlide(o){ slide({cls:o.cls,id:o.id,ch:o.ch,title:o.title,tag:o.tag||'تذكرة',html:function(){return ticketHTML(o.items)},init:function(el){bindTicket(el,o.items,o.id)},note:o.note}) }
/* rows of statements, each answered with one of the buttons: items [[html, right key, message]], choices [[key, label]] */
function clsHTML(items,choices,fs){
  return items.map(function(r){return '<div class="cls sm" data-a="'+r[1]+'" data-m="'+String(r[2]||'').replace(/"/g,'&quot;')+'" style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;background:rgba(var(--d2),.55);border-radius:16px;padding:2px 14px"><div style="font-size:'+(fs||21)+'px;font-weight:700;line-height:1.3">'+r[0]+'</div><div style="display:flex;gap:8px">'+choices.map(function(c){return '<button type="button" class="btn" data-v="'+c[0]+'">'+c[1]+'</button>'}).join('')+'</div></div>'}).join('');
}
function bindCls(el,fb,done,bad){
  var left=$$('.cls',el).length;
  $$('.cls',el).forEach(function(r){
    $$('button',r).forEach(function(b){b.addEventListener('click',function(){
      if(r.classList.contains('ok')) return;
      if(b.getAttribute('data-v')===r.getAttribute('data-a')){ r.classList.add('ok'); r.style.boxShadow='inset 0 0 0 3px var(--ok)'; b.classList.add('ok-b'); left--; say(fb,'✓ '+(r.getAttribute('data-m')||'صح'),'ok'); if(!left&&done) done() }
      else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,bad||'فكّر مرة ثانية','bad') }
    })});
  });
}
/* tiny drawings (inside the options of a question) have no letters: they are unreadable at that size and the browser draws scaled SVG text in the wrong place there */
function noTxt(svg){return svg.replace(/<text[^>]*>[^<]*<\/text>/g,'')}
/* the structural formula of a straight chain of n carbons: o.b bond orders (n-1), o.u / o.d atoms above / below each carbon (null = none), o.l / o.r atom at the left / right end; every atom and bond is drawn */
function chainSVG(n,o){
  o=o||{}; var g=58, pad=54, W=2*pad+(n-1)*g, H=132, y0=66, s='', i, x, A=function(t){return t==='H'?12:(t==='Br'||t==='OH')?16:12};
  for(i=0;i<n-1;i++){ x=pad+i*g; var b=(o.b&&o.b[i])||1; s+= b===2?bnd(x,y0-3.5,x+g,y0-3.5,4)+bnd(x,y0+3.5,x+g,y0+3.5,4):bnd(x,y0,x+g,y0,5) }
  for(i=0;i<n;i++){ x=pad+i*g; if(o.u&&o.u[i]) s+=bnd(x,y0,x,y0-42,4); if(o.d&&o.d[i]) s+=bnd(x,y0,x,y0+42,4) }
  if(o.l) s+=bnd(pad,y0,pad-38,y0,4); if(o.r) s+=bnd(pad+(n-1)*g,y0,pad+(n-1)*g+38,y0,4);
  for(i=0;i<n;i++){ x=pad+i*g; if(o.u&&o.u[i]) s+=atm(x,y0-42,A(o.u[i]),o.u[i]); if(o.d&&o.d[i]) s+=atm(x,y0+42,A(o.d[i]),o.d[i]) }
  if(o.l) s+=atm(pad-38,y0,A(o.l),o.l); if(o.r) s+=atm(pad+(n-1)*g+38,y0,A(o.r),o.r);
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0,17,'C') }
  var out='<svg viewBox="0 0 '+W+' '+H+'" width="'+(o.w||W)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+'</svg>';
  return (o.w&&o.w<190)?noTxt(out):out;
}
/* hydrogens of the straight-chain 1-alkene with n carbons (C1=C2): the places [carbon index, 'u'|'d'|'r'] */
function eneH(n){
  var o=[], i, nh;
  for(i=0;i<n;i++){
    nh=4-((i>0?1:0)+(i<n-1?1:0)+(i<2?1:0));
    if(nh>=1) o.push([i,'u']); if(nh>=2) o.push([i,'d']); if(nh>=3) o.push([i,'r']);
  }
  return o;
}
function eneSVG(n,o){
  var u=[],d=[],r=null,b=[],i; for(i=0;i<n;i++){u.push(null);d.push(null)} for(i=0;i<n-1;i++) b.push(i===0?2:1);
  eneH(n).forEach(function(h){ if(h[1]==='u') u[h[0]]='H'; else if(h[1]==='d') d[h[0]]='H'; else r='H' });
  return chainSVG(n,{b:b,u:u,d:d,r:r,w:o&&o.w});
}
/* the skeleton of the n-carbon 1-alkene with every hydrogen as an empty dashed place that the student fills by pressing it */
function fillEneSVG(n){
  var g=62, pad=62, W=2*pad+(n-1)*g, H=170, y0=85, s='', i, x, k=0, hs='';
  for(i=0;i<n-1;i++){ x=pad+i*g; s+= i===0?bnd(x,y0-3.5,x+g,y0-3.5,5)+bnd(x,y0+3.5,x+g,y0+3.5,5):bnd(x,y0,x+g,y0,5) }
  eneH(n).forEach(function(h){
    x=pad+h[0]*g; var sx=x, sy=y0, id=k++;
    if(h[1]==='u') sy=y0-52; else if(h[1]==='d') sy=y0+52; else sx=x+48;
    hs+='<g class="hslot" data-k="'+id+'" style="cursor:pointer"><g class="hh">'+bnd(x,y0,sx,sy,4)+atm(sx,sy,15,'H')+'</g><circle class="dot" cx="'+sx+'" cy="'+sy+'" r="15" fill="rgba(228,188,75,.10)" stroke="var(--gold)" stroke-width="2.5" stroke-dasharray="5 5"/></g>';
  });
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0,20,'C') }
  return {svg:'<svg viewBox="0 0 '+W+' '+H+'" width="'+Math.round(W*1.5)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+hs+'</svg>',count:k};
}
/* a reaction arrow with the conditions above and below it */
function arr(top,bot){ return '<span class="rarr"><i>'+(top||'')+'</i><b>→</b><i>'+(bot||'')+'</i></span>'; }
/* the animation of an addition to C=C: step 0 the molecules, step 1 the double bond opens, step 2 the product; X goes above the first carbon, Y below the second */
function addSVG(step,X,Y,w){
  var c1=190,c2=270,cy=100,s='',rad=function(t){return t==='H'?13:18};
  [[140,62,c1],[140,138,c1],[320,62,c2],[320,138,c2]].forEach(function(h){ s+=bnd(h[2],cy,h[0],h[1],4) });
  var gold='#E4BC4B';
  if(step===0) s+=bnd(c1,cy-6,c2,cy-6,4)+bnd(c1,cy+6,c2,cy+6,4);
  else if(step===1) s+=bnd(c1,cy-6,c2,cy-6,4)+'<line x1="'+c1+'" y1="'+(cy+6)+'" x2="'+c2+'" y2="'+(cy+6)+'" stroke="'+gold+'" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"/>';
  else s+=bnd(c1,cy,c2,cy,5);
  if(step===0) s+=bnd(c1,32,c2,32,4);
  else if(step===1) s+='<line x1="'+c1+'" y1="32" x2="'+c2+'" y2="32" stroke="'+gold+'" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"/><path d="M'+(c1+10)+' '+(cy-26)+' Q'+c1+' '+(cy-56)+' '+c1+' 54" fill="none" stroke="'+gold+'" stroke-width="2.5" stroke-dasharray="4 4"/>';
  else s+=bnd(c1,cy,c1,48,4)+bnd(c2,cy,c2,152,4);
  s+=[[140,62],[140,138],[320,62],[320,138]].map(function(h){return atm(h[0],h[1],13,'H')}).join('');
  s+=atm(c1,cy,20,'C')+atm(c2,cy,20,'C');
  if(step<2) s+=atm(c1,32,rad(X),X)+atm(c2,32,rad(Y),Y); else s+=atm(c1,46,rad(X),X)+atm(c2,154,rad(Y),Y);
  return '<svg viewBox="0 0 460 190" width="'+(w||440)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+'</svg>';
}
function animHTML(id){
  return '<div class="panel" style="padding:8px 14px;align-items:center;gap:6px"><div id="'+id+'v"></div><div id="'+id+'t" style="font-size:21px;font-weight:700;text-align:center;min-height:58px;line-height:1.4;width:100%"></div><div style="display:flex;gap:10px"><button type="button" class="btn acc" id="'+id+'n">الخطوة التالية ▸</button><button type="button" class="btn" id="'+id+'r">من البداية</button></div></div>';
}
function bindAnim(el,id,X,Y,texts,done,w){
  var st=0;
  function paint(){ $('#'+id+'v',el).innerHTML=addSVG(st,X,Y,w); $('#'+id+'t',el).innerHTML=texts[st]; $('#'+id+'n',el).classList.toggle('hide',st===2); if(st===2&&done) done() }
  $('#'+id+'n',el).addEventListener('click',function(){ if(st<2){st++; paint()} });
  $('#'+id+'r',el).addEventListener('click',function(){ st=0; paint() });
  paint();
}

/* the straight-chain alkane with n carbons, every atom drawn */
function ch2(n,o){ o=o||{}; var u=[],d=[],i; for(i=0;i<n;i++){u.push('H');d.push('H')} return chainSVG(n,{u:u,d:d,l:'H',r:'H',w:o.w}) }
