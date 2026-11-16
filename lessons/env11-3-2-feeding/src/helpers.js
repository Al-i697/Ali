/* ---------- helpers for the environmental science lesson: explanation slides, question cards, food webs, verbal equations ---------- */

/* a term: Arabic name with its English form (the book gives both) */
function tm(a,e){ return '<b>'+a+'</b>'+(e?' <span class="en">'+e+'</span>':'') }

/* an Arabic verbal equation must read from the right: the reactants on the right, the arrow pointing left (teacher's rule) */
function veq(a,b){ return '<span dir="rtl" style="unicode-bidi:isolate"><bdi dir="rtl">'+a+'</bdi> ← <bdi dir="rtl">'+b+'</bdi></span>' }

/* a photograph of the book inside a card, with its caption */
function phHTML(key,cap,w,h){ return '<figure class="phf"><img src="'+PHOTO[key]+'" alt="" style="width:'+(w||260)+'px'+(h?';height:'+h+'px':'')+'"><figcaption>'+cap+'</figcaption></figure>' }

/* Explanation slide, the way the teacher teaches it: a lead-in question first (right column), then the points one click at a time (left column).
   o: {id,ch,title,tag,lead:{q,opts:[{t,ok,why}],gbar},fig:html under the question,pts:[html or {html}],lw:width of the question column,init,note} */
function explain(o){
  slide({id:o.id,ch:o.ch,title:o.title,tag:o.tag,
   html:function(){
    var L='';
    if(o.lead){
      L+='<div class="panel lq'+(o.fig?' cmp':'')+'" style="padding:14px 18px;gap:8px"><div class="q">'+o.lead.q+'</div>'+optsHTML(o.lead.opts)+'<div class="fb" style="min-height:26px"></div></div>';
      if(o.lead.gbar) L+='<div class="gbar hide" id="gb" style="font-size:21px">'+o.lead.gbar+'</div>';
    }
    if(o.fig) L+=o.fig;
    var P='<div class="col" style="flex:1;min-width:0;gap:'+(o.gap||10)+'px;justify-content:center">'+o.pts.map(function(h){return typeof h==='string'?'<div class="panel pb" data-pt'+(o.fs?' style="font-size:'+o.fs+'px"':'')+'>'+h+'</div>':h.html}).join('')+'</div>';
    return '<div style="display:flex;gap:20px;flex:1;align-items:stretch"><div class="col" style="width:'+(o.lw||440)+'px;flex:none;gap:12px;justify-content:center">'+L+'</div>'+P+'</div>';
   },
   init:function(el){
    if(o.lead) bindMcq($('.lq',el),o.lead.opts,$('.fb',el),function(){ unhide(el) });
    if(o.init) o.init(el);
   },
   note:o.note});
}

/* question cards: each card is a question; pressing it shows the model answer. items [question, answer] */
function qaHTML(items,x){ return cardsHTML(items,'qa'+(x?' '+x:'')) }

/* ---- food webs: nodes [id,label,x,y], edges [prey,predator] (the arrow points from the eaten to the eater) ---- */
function webSVG(id,nodes,edges,W,H){
  var pos={}, wd={};
  nodes.forEach(function(n){ wd[n[0]]=Math.max(78,n[1].length*9+26); pos[n[0]]=[n[2],n[3]] });
  var HH=32;
  function edge(a,b){   /* a line between the borders of two boxes */
    var ax=pos[a][0], ay=pos[a][1], bx=pos[b][0], by=pos[b][1], dx=bx-ax, dy=by-ay;
    function cut(w,x,y,sx,sy){ var t=Math.min(Math.abs(w/2/(sx||1e-9)),Math.abs(HH/2/(sy||1e-9))); return [x+sx*t, y+sy*t] }
    var p=cut(wd[a]+6,ax,ay,dx,dy), q=cut(wd[b]+10,bx,by,-dx,-dy);
    return '<line class="we" data-f="'+a+'" data-t="'+b+'" x1="'+p[0].toFixed(1)+'" y1="'+p[1].toFixed(1)+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" marker-end="url(#'+id+'ah)"/>';
  }
  return '<svg class="fgv" id="'+id+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="شبكة غذائية"><defs><marker id="'+id+'ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#cfe6ef"/></marker></defs>'+
    edges.map(function(e){return edge(e[0],e[1])}).join('')+
    nodes.map(function(n){var w=wd[n[0]]; return '<g class="wn" data-id="'+n[0]+'"><rect x="'+(n[2]-w/2)+'" y="'+(n[3]-HH/2)+'" width="'+w+'" height="'+HH+'" rx="10"/><text x="'+n[2]+'" y="'+n[3]+'">'+n[1]+'</text></g>'}).join('')+'</svg>';
}
/* pressing a node shows what it eats (green) and who eats it (red) */
function bindWeb(el,id,nodes,edges,fb){
  var name={}; nodes.forEach(function(n){name[n[0]]=n[1]});
  var svg=$('#'+id,el);
  $$('.wn',svg).forEach(function(g){ g.addEventListener('click',function(){
    var k=g.getAttribute('data-id'), eats=[], eaten=[];
    $$('.wn',svg).forEach(function(x){x.classList.remove('sel','pr','pd')}); $$('.we',svg).forEach(function(x){x.classList.remove('in','out')});
    g.classList.add('sel');
    edges.forEach(function(e,i){
      var ln=$$('.we',svg)[i];
      if(e[1]===k){ eats.push(name[e[0]]); ln.classList.add('in'); $('.wn[data-id="'+e[0]+'"]',svg).classList.add('pr') }
      if(e[0]===k){ eaten.push(name[e[1]]); ln.classList.add('out'); $('.wn[data-id="'+e[1]+'"]',svg).classList.add('pd') }
    });
    say(fb,name[k]+': '+(eats.length?'يتغذى على ← '+eats.join('، '):'منتج أو مصدر غذاء (لا يتغذى على كائن آخر في الشكل)')+(eaten.length?' · يفترسه ← '+eaten.join('، '):' · لا مفترس له في الشكل'),'ok');
  })});
}

/* ---- pyramids: bars [[label,value]] from the bottom (producers) to the top; width is proportional to the value (never narrower than 26px) ---- */
function pyrSVG(bars,o){
  o=o||{}; var W=o.w||300, H=o.h||34, G=3, mx=Math.max.apply(null,bars.map(function(b){return b[1]})), n=bars.length, h=n*(H+G)+6;
  var col=o.cols||['#5fbf72','#f08fb0','#ef7b5a','#f1b24a','#9d8be0'];
  var s='<svg viewBox="0 0 '+W+' '+h+'" class="fgv" style="max-width:'+W+'px" role="img" aria-label="هرم">';
  bars.forEach(function(b,i){
    var w=Math.max(26,Math.round(b[1]/mx*(W-8))), y=h-6-(i+1)*(H+G)+G;
    s+='<rect x="'+((W-w)/2)+'" y="'+y+'" width="'+w+'" height="'+H+'" rx="3" fill="'+col[i%col.length]+'" stroke="rgba(0,0,0,.25)"/>'+
       '<text x="'+(W/2)+'" y="'+(y+H/2)+'" class="lbl" style="fill:#10202f;dominant-baseline:central;font-size:'+(o.fs||14)+'px">'+b[0]+(o.vals?' ('+b[1]+')':'')+'</text>';
  });
  return s+'</svg>';
}

/* ---- an energy-flow box diagram (student book figure 3-7, activity book figure 3-6) ----
   o: {top:'text above', levels:[[name,value]], down:[labels between levels], left:[labels], right:[labels], leftName, rightName, unk:['X','Y']} */
function eflow(o){
  var W=600, n=o.levels.length, y0=78, dy=78, bw=250, bh=46, cx=300, H=y0+n*dy+70, L=95, R=505;
  function box(x,y,w,h,t,v,hl){ return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="8" fill="rgba(20,56,92,.95)" stroke="'+(hl?'#ffd966':'#7fd4ff')+'" stroke-width="'+(hl?3:1.6)+'"/><text x="'+x+'" y="'+(y-(v!==''&&v!=null?8:0))+'" class="lbl" style="dominant-baseline:central;font-size:14px">'+t+'</text>'+(v!==''&&v!=null?'<text x="'+x+'" y="'+(y+12)+'" class="lbl" style="font-size:16px;fill:#ffd966;direction:ltr">'+v+'</text>':'') }
  function lab(x,y,t){ var u=/^[XYZ]$/.test(t); return '<text x="'+x+'" y="'+y+'" class="lbl" style="font-size:'+(u?22:16)+'px;direction:ltr;fill:'+(u?'#ff9c6e':'#fff')+';font-weight:800">'+t+'</text>' }
  function arr(x1,y1,x2,y2){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#cfe6ef" stroke-width="2.2" marker-end="url(#efa)"/>' }
  var s='<svg viewBox="0 0 '+W+' '+H+'" class="fgv" role="img" aria-label="تدفق الطاقة"><defs><marker id="efa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#cfe6ef"/></marker></defs>';
  s+='<text x="'+cx+'" y="16" class="lbl" style="font-size:16px">'+o.top+'</text>'+arr(cx,26,cx,y0-bh/2-2);
  o.levels.forEach(function(l,i){
    var y=y0+i*dy;
    s+=box(cx,y,bw,bh,l[0],l[1],/^[XYZ]$/.test(String(l[1])));
    if(i<n-1){ s+=arr(cx,y+bh/2,cx,y+dy-bh/2-2); if(o.down&&o.down[i]) s+=lab(cx+34,y+dy/2,o.down[i]) }
    if(o.left&&o.left[i]!=null){ s+='<line x1="'+(cx-bw/2)+'" y1="'+y+'" x2="'+L+'" y2="'+y+'" stroke="#cfe6ef" stroke-width="2.2"/>'+lab((cx-bw/2+L)/2,y-12,o.left[i]) }
    if(o.right&&o.right[i]!=null){ s+='<line x1="'+(cx+bw/2)+'" y1="'+y+'" x2="'+R+'" y2="'+y+'" stroke="#cfe6ef" stroke-width="2.2"/>'+lab((cx+bw/2+R)/2,y-12,o.right[i]) }
  });
  var yb=y0+(n-1)*dy+50;
  s+='<line x1="'+L+'" y1="'+y0+'" x2="'+L+'" y2="'+(yb+26)+'" stroke="#cfe6ef" stroke-width="2.2" marker-end="url(#efa)"/><line x1="'+R+'" y1="'+y0+'" x2="'+R+'" y2="'+(yb+26)+'" stroke="#cfe6ef" stroke-width="2.2" marker-end="url(#efa)"/>';
  s+=box(L,yb+46,150,40,o.leftName,'')+box(R,yb+46,150,40,o.rightName,'');
  return s+'</svg>';
}

/* a row of answer boxes under a figure: items [[id,label,unit]] (uses the shared numeric boxes) */
function ansRow(items){ return items.map(function(it){return '<div style="display:flex;align-items:center;gap:10px;font-size:21px"><span style="min-width:150px;font-weight:700">'+it[1]+'</span>'+nin(it[0],it[2]||'')+'</div>'}).join('') }
