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
