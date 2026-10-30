/* ---------- helpers for the mole lesson: formulas, molar masses, answer rows ---------- */
var AR={H:1,C:12,N:14,O:16,F:19,Na:23,Mg:24,Al:27,Si:28,P:31,S:32,Cl:35.5,K:39,Ca:40,Fe:56,Cu:63.5,Zn:65};
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
