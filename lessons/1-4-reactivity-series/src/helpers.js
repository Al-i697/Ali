/* ---------- helpers of lesson 1-4: the reactivity series, a rack of tubes that react, a plate of wells (or ticks) that open one by one ---------- */

/* the series of the student book (Figure 1-4), most reactive first: symbol, Arabic name, group ('nm' = a non-metal placed in the series for reference) */
var SER=[['K','بوتاسيوم','I'],['Na','صوديوم','I'],['Ca','كالسيوم','II'],['Mg','ماغنيسيوم','II'],['Al','ألومنيوم','III'],['C','كربون','nm'],['Zn','خارصين','T'],['Fe','حديد','T'],['Sn','قصدير','IV'],['Pb','رصاص','IV'],['H','هيدروجين','nm'],['Cu','نحاس','T'],['Ag','فضة','T'],['Au','ذهب','T']];
var GRP={I:'المجموعة I',II:'المجموعة II',III:'المجموعة III',T:'عنصر انتقالي',IV:'المجموعة IV',nm:'لافلز (للمقارنة)'};
function serCol(i){ return 'hsl('+Math.round(4+i*(208-4)/13)+',70%,27%)' }
/* a strip of the series, most reactive on the right. keys: which elements to show (default all). Each chip keeps its colour from its place in the full series. */
function serStrip(keys,o){
  o=o||{}; keys=keys||SER.map(function(s){return s[0]});
  return '<div class="ser'+(o.cls?' '+o.cls:'')+'"'+(o.id?' id="'+o.id+'"':'')+'>'+keys.map(function(k){
    var i=SER.map(function(s){return s[0]}).indexOf(k), s=SER[i];
    return '<button type="button" class="sc'+(s[2]==='nm'?' nm':'')+'" data-s="'+k+'" data-g="'+s[2]+'" style="--c:'+serCol(i)+'"><b class="num">'+k+'</b>'+(o.names?'<small>'+s[1]+'</small>':'')+'</button>';
  }).join('')+'</div>';
}

/* a rack of tubes that react when the metals are dropped in: items [{s symbol, nm name, rate 0 to 5 (bubbles), flame (a flame above the water), obs (what we see), col liquid colour}] */
function tubeSVG(it){
  var b='', i;
  for(i=0;i<7;i++) b+='<circle class="bub" cx="'+(30+(i*5)%30)+'" cy="168" r="'+(3+(i%3))+'" fill="rgba(255,255,255,.85)" style="animation-delay:'+(i*.23).toFixed(2)+'s"/>';
  var fl=it.flame?'<g class="fl"><path d="M45 74C34 62 38 48 45 32C52 48 56 62 45 74Z" fill="#c58cff" opacity=".95"/><path d="M45 72C39 64 41 55 45 46C49 55 51 64 45 72Z" fill="#f2e2ff"/></g>':'';
  return '<svg viewBox="0 0 90 196" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible"><defs><clipPath id="tc'+it.u+'"><path d="M18 78V160Q18 182 45 182Q72 182 72 160V78Z"/></clipPath></defs>'+
   '<g clip-path="url(#tc'+it.u+')"><rect x="14" y="80" width="62" height="106" fill="'+(it.col||'#cfe9ff')+'" opacity=".85"/><g class="bubs">'+b+'</g></g>'+
   '<path d="M18 14V160Q18 182 45 182Q72 182 72 160V14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.92)" stroke-width="4" stroke-linejoin="round"/>'+
   '<g class="st"><rect x="38" y="'+(it.strip||96)+'" width="14" height="52" rx="3" fill="'+(it.metal||'#c9d0d6')+'" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/></g>'+fl+'</svg>';
}
function rackHTML(id,items){
  return '<div class="rack" id="'+id+'">'+items.map(function(it,i){
    it.u=id+i;
    return '<div class="rk" data-i="'+i+'" style="--d:'+(it.rate?(2.9-it.rate*.45).toFixed(2):0)+'s">'+tubeSVG(it)+'<b class="num rs">'+it.s+'</b><span class="ro">&nbsp;</span></div>';
  }).join('')+'</div>';
}
function bindRack(el,id,items,btn,done){
  var rack=$('#'+id,el), fired=false;
  $(btn,el).addEventListener('click',function(){
    if(fired) return; fired=true; this.disabled=true; rack.classList.add('run');
    $$('.rk',rack).forEach(function(r,i){ later(function(){ $('.ro',r).textContent=items[i].obs; r.classList.add('seen') },1300+i*220) });
    later(function(){ if(done) done() },1500+items.length*220);
  });
}

/* a plate: a grid of cells opened one by one. P: {rows:[{k,lab,sub}], cols:[{k,lab,sub,col}], cell:function(r,c) -> null (same substance) or {y:1|0, t:text, end:colour of the liquid after, dep:colour of the solid that forms}, mode:'wells'|'tick'} */
function plateHTML(id,P){
  var h='<div class="plate '+(P.mode||'wells')+'" id="'+id+'" style="grid-template-columns:150px repeat('+P.cols.length+',1fr)"><div class="pcorner">'+(P.corner||'')+'</div>';
  P.cols.forEach(function(c){ h+='<div class="phd">'+c.lab+(c.sub?'<small>'+c.sub+'</small>':'')+'</div>' });
  P.rows.forEach(function(r,ri){
    h+='<div class="prw">'+r.lab+(r.sub?'<small>'+r.sub+'</small>':'')+'</div>';
    P.cols.forEach(function(c,ci){
      var x=P.cell(ri,ci);
      if(!x){ h+='<div class="pcl same"><i>—</i></div>'; return }
      h+='<button type="button" class="pcl" data-r="'+ri+'" data-c="'+ci+'">'+(P.mode==='tick'?'<span class="q">؟</span><span class="mk"></span>':
        '<svg viewBox="0 0 80 64" width="100%" aria-hidden="true"><ellipse cx="40" cy="34" rx="34" ry="26" fill="'+(c.col||'#e9f2f8')+'" class="liq" stroke="rgba(255,255,255,.8)" stroke-width="3"/><g class="dep" opacity="0"><circle cx="30" cy="42" r="4" fill="'+(x.dep||'#999')+'"/><circle cx="42" cy="46" r="5" fill="'+(x.dep||'#999')+'"/><circle cx="52" cy="40" r="4" fill="'+(x.dep||'#999')+'"/><circle cx="38" cy="34" r="3.5" fill="'+(x.dep||'#999')+'"/><circle cx="48" cy="30" r="3" fill="'+(x.dep||'#999')+'"/></g></svg><span class="mk"></span>')+'</button>';
    });
  });
  return h+'</div>';
}
function bindPlate(el,id,P,fb,done){
  var plate=$('#'+id,el), total=0, seen=0;
  $$('.pcl[data-r]',plate).forEach(function(b){ total++;
    b.addEventListener('click',function(){
      if(b.classList.contains('on')) return;
      var r=+b.getAttribute('data-r'), c=+b.getAttribute('data-c'), x=P.cell(r,c);
      b.classList.add('on',x.y?'yes':'no'); $('.mk',b).textContent=x.y?'✓':'✗';
      if(P.mode==='tick'){ $('.q',b).classList.add('hide') }
      else{ var liq=$('.liq',b); liq.style.transition='fill 1.6s'; if(x.end) liq.style.fill=x.end; if(x.y&&x.dep) $('.dep',b).setAttribute('opacity','1') }
      say(fb,(P.rows[r].lab.replace(/<[^>]+>/g,''))+' + '+(P.cols[c].lab.replace(/<[^>]+>/g,''))+': '+x.t,x.y?'ok':'');
      seen++; if(seen===total&&done) done();
    });
  });
  return {total:total, open:function(){ $$('.pcl[data-r]',plate).forEach(function(b){ b.click() }) }};
}

/* the tubes of the two racks */
var COLD=[
 {s:'K',rate:5,flame:1,obs:'يشتعل الهيدروجين بلهب بنفسجي',col:'#cfe9ff'},
 {s:'Na',rate:4,obs:'يذوب ويتفاعل بشدة',col:'#cfe9ff'},
 {s:'Ca',rate:3,obs:'فقاعات كثيرة ويتكوّن ماء الجير',col:'#cfe9ff'},
 {s:'Mg',rate:1,obs:'فقاعات قليلة: بطيء جداً',col:'#cfe9ff'},
 {s:'Zn',rate:0,obs:'لا يظهر تفاعل',col:'#cfe9ff'},
 {s:'Cu',rate:0,obs:'لا يتفاعل',col:'#cfe9ff',metal:'#c9783f'}];
var ACID=[
 {s:'Mg',rate:5,obs:'فقاعات كثيرة وسريعة',col:'#e4f1f7'},
 {s:'Zn',rate:3,obs:'فقاعات متوسطة',col:'#e4f1f7'},
 {s:'Fe',rate:2,obs:'فقاعات قليلة وأبطأ',col:'#e4f1f7',metal:'#8e939a'},
 {s:'Cu',rate:0,obs:'لا يتفاعل',col:'#e4f1f7',metal:'#c9783f'}];

/* the apparatus of Activity 1-2: a tube laid flat with wet mineral wool and iron wool, a burner, the delivery tube and an upside-down tube of water in a trough.
   The classes s1 to s4 on the svg switch the stages on (see lesson.css). */
function apparatusSVG(){
  var b='', i;
  for(i=0;i<6;i++) b+='<circle class="abub" cx="'+(462+(i*7)%22)+'" cy="206" r="'+(3+(i%2))+'" fill="rgba(255,255,255,.92)" style="animation-delay:'+(i*.3).toFixed(1)+'s"/>';
  function lab(x,y,t){ return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Cairo,sans-serif" stroke="rgba(0,0,0,.55)" stroke-width="3" paint-order="stroke">'+t+'</text>' }
  return '<svg id="ap" class="ap" viewBox="0 0 560 300" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible">'+
   '<path d="M300 112H70Q40 112 40 137Q40 162 70 162H300" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.92)" stroke-width="4" stroke-linejoin="round"/>'+
   '<rect x="58" y="121" width="56" height="32" rx="6" fill="#c7ccd2" stroke="rgba(0,0,0,.3)"/><circle cx="72" cy="142" r="3" fill="#4fa3e0"/><circle cx="88" cy="133" r="3" fill="#4fa3e0"/><circle cx="100" cy="144" r="3" fill="#4fa3e0"/>'+
   '<rect class="wool" x="168" y="120" width="50" height="34" rx="8" fill="#8b9098" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/><path d="M172 130Q184 124 196 132T216 130M172 142Q184 136 196 144T216 142" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>'+
   '<g class="stm"><path d="M120 128Q128 120 136 128T152 128"/><path d="M118 140Q126 132 134 140T150 140"/><path d="M122 150Q130 142 138 150T154 150"/></g>'+
   '<rect x="298" y="116" width="26" height="42" rx="5" fill="#9a6a3a"/>'+
   '<path d="M324 137H410V212" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linejoin="round"/>'+
   '<path d="M380 212V274Q380 286 392 286H528Q540 286 540 274V212" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.92)" stroke-width="4" stroke-linejoin="round"/>'+
   '<rect x="383" y="240" width="154" height="44" fill="#5aaeea" opacity=".6"/>'+
   '<path class="dte" d="M410 212V262H470V212" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linejoin="round"/>'+
   '<rect x="449" y="66" width="42" height="178" fill="#5aaeea" opacity=".6"/><rect class="gs" x="449" y="66" width="42" height="178"/>'+
   '<path d="M446 74Q446 62 458 62H482Q494 62 494 74V246H446Z" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.92)" stroke-width="4" stroke-linejoin="round"/>'+b+
   '<g class="bn"><path d="M176 264H204L208 292H172Z" fill="#59616b"/><rect x="186" y="228" width="8" height="38" fill="#7b838d"/><g class="flm"><path d="M190 226C177 209 181 192 190 170C199 192 203 209 190 226Z" fill="#ff9d3a"/><path d="M190 222C184 212 186 201 190 190C194 201 196 212 190 222Z" fill="#ffe07a"/></g></g>'+
   '<g transform="translate(40,-10)"><g class="pop"><path d="M520 30L528 48L546 40L538 58L556 66L536 72L540 90L524 80L510 94L508 74L488 72L504 60L494 44L512 46Z" fill="#ffd36a" stroke="#fff" stroke-width="2"/>'+lab(522,64,'فرقعة!')+'</g></g>'+
   lab(86,100,'صوف معدني مبلل')+lab(193,100,'صوف حديدي')+lab(300,190,'أنبوبة التوصيل')+lab(470,50,'هيدروجين')+lab(470,305,'ماء')+
   '</svg>';
}

/* a formula or an equation in a left-to-right box: digits after a symbol become subscripts, ^2+ becomes a superscript charge */
function eqn(s){ return '<bdi dir="ltr" class="num">'+sub(String(s).replace(/\^([0-9]*[+\-−]?)/g,'<sup>$1</sup>'))+'</bdi>' }

/* Table 1-5 (metals with the oxides of other metals): rows and columns in the book's order; the number is the place in the series (0 = most active) */
var OXR=[['Cu',3],['Fe',2],['Al',1],['Mg',0]];
var OXC=[['CuO','Cu',3],['FeO','Fe',2],['Al2O3','Al',1],['MgO','Mg',0]];
var OXP={mode:'tick',corner:'الفلز ↓ · الأكسيد →',
 rows:OXR.map(function(r){return {k:r[0],lab:'<span class="num">'+r[0]+'</span>'}}),
 cols:OXC.map(function(c){return {k:c[1],lab:eqn(c[0])}}),
 cell:function(r,c){ var a=OXR[r], o=OXC[c]; if(a[0]===o[1]) return null; var y=a[1]<o[2]; return {y:y?1:0,t:y?'يحدث تفاعل: '+a[0]+' أنشط من '+o[1]:'لا يحدث تفاعل: '+a[0]+' أقل نشاطاً من '+o[1]} }};

/* the plates of Activity 1-4 (powders in sulfate solutions) and of Table 1-6 (metals in salt solutions) */
var CBLUE='#6fb8f2', CGREEN='#d9efd2', CCLEAR='#eef6fa', CRED='#a5502c';
var P14={mode:'wells',corner:'الفلز المضاف ↓ · المحلول →',
 rows:['Cu','Fe','Mg','Zn'].map(function(k){return {k:k,lab:'<span class="num">'+k+'</span>'}}),
 cols:[{k:'Cu',lab:eqn('CuSO4'),col:CBLUE},{k:'Fe',lab:eqn('FeSO4'),col:'#cfe8c4'},{k:'Mg',lab:eqn('MgSO4'),col:CCLEAR},{k:'Zn',lab:eqn('ZnSO4'),col:CCLEAR}],
 cell:function(r,c){
  var A={Mg:0,Zn:1,Fe:2,Cu:3}, m=this.rows[r].k, s=this.cols[c].k;
  if(m===s) return null;
  if(A[m]>A[s]) return {y:0,t:'لا يحدث تفاعل'};
  if(s==='Cu') return {y:1,t:'يتلاشى اللون الأزرق للمحلول ويتشكّل راسب بنيّ محمرّ على الفلز',end:m==='Fe'?CGREEN:CCLEAR,dep:CRED};
  if(s==='Fe') return {y:1,t:'يتلاشى اللون الأخضر للمحلول ويتشكّل راسب رمادي داكن على الفلز',end:CCLEAR,dep:'#4a4f55'};
  return {y:1,t:'يبقى المحلول عديم اللون ويتشكّل راسب رمادي على الفلز',end:CCLEAR,dep:'#8a8f95'};
 }};
var P16={mode:'wells',corner:'الفلز ↓ · المحلول →',
 rows:['Zn','Fe','Cu','Ag'].map(function(k){return {k:k,lab:'<span class="num">'+k+'</span>'}}),
 cols:[{k:'Zn',lab:eqn('ZnSO4'),col:CCLEAR},{k:'Fe',lab:eqn('FeSO4'),col:'#cfe8c4'},{k:'Cu',lab:eqn('CuSO4'),col:CBLUE},{k:'Ag',lab:eqn('AgNO3'),col:CCLEAR}],
 cell:function(r,c){
  var A={Zn:0,Fe:1,Cu:2,Ag:3}, m=this.rows[r].k, s=this.cols[c].k;
  if(m===s) return null;
  if(A[m]>A[s]) return {y:0,t:'لا يحدث تفاعل'};
  if(s==='Fe') return {y:1,t:'يتلاشى لون المحلول الأخضر ويتكوّن راسب رمادي داكن على الفلز',end:CCLEAR,dep:'#4a4f55'};
  if(s==='Cu') return {y:1,t:'يتلاشى اللون الأزرق ويتكوّن راسب بنيّ محمرّ على الفلز',end:m==='Fe'?CGREEN:CCLEAR,dep:CRED};
  if(m==='Zn') return {y:1,t:'يبقى المحلول عديم اللون ويتكوّن على الفلز راسب رمادي–فضيّ',end:CCLEAR,dep:'#c8ccd0'};
  if(m==='Fe') return {y:1,t:'يصبح لون المحلول أخضر فاتحاً ويتكوّن على الفلز راسب رمادي–فضيّ',end:CGREEN,dep:'#c8ccd0'};
  return {y:1,t:'يصبح لون المحلول أزرق ويتكوّن على الفلز راسب رمادي–فضيّ',end:CBLUE,dep:'#c8ccd0'};
 }};

/* Zn + Cu2+: a zinc atom, a copper ion and two electrons that move from one to the other (stages s0 to s3 on the svg, see lesson.css) */
function xferSVG(){
  function e(cls,x,y){ return '<g class="'+cls+'"><circle cx="'+x+'" cy="'+y+'" r="11" fill="#ffd36a" stroke="#7a5a00" stroke-width="2"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#4a3600" font-family="Cairo,sans-serif">e⁻</text></g>' }
  function t(cls,x,y,a,b){ return '<text class="'+cls+'" x="'+x+'" y="'+y+'" text-anchor="middle" font-size="30" font-weight="800" fill="#10202e" font-family="Cairo,sans-serif" stroke="rgba(255,255,255,.6)" stroke-width="3" paint-order="stroke">'+a+(b?'<tspan dy="-13" font-size="17">'+b+'</tspan>':'')+'</text>' }
  return '<svg id="xf" class="xf s0" viewBox="0 0 560 250" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible">'+
   '<defs><radialGradient id="gz" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f1f4f7"/><stop offset="1" stop-color="#7d8792"/></radialGradient><radialGradient id="gcu" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#9ad5ff"/><stop offset="1" stop-color="#1f77c0"/></radialGradient><radialGradient id="gc0" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f4b27c"/><stop offset="1" stop-color="#a5502c"/></radialGradient></defs>'+
   '<rect class="soln" x="14" y="24" width="532" height="206" rx="26"/>'+
   '<circle class="zb" cx="120" cy="130" r="50" fill="url(#gz)" stroke="rgba(0,0,0,.4)" stroke-width="2"/>'+t('zl0',120,141,'Zn')+t('zl1',120,141,'Zn','2+')+
   '<circle class="cb0" cx="440" cy="130" r="42" fill="url(#gcu)" stroke="rgba(0,0,0,.4)" stroke-width="2"/><circle class="cb1" cx="440" cy="130" r="42" fill="url(#gc0)" stroke="rgba(0,0,0,.4)" stroke-width="2"/>'+t('cl0',440,141,'Cu','2+')+t('cl1',440,141,'Cu')+
   e('e1',158,104)+e('e2',158,158)+
   '</svg>';
}

/* exercise 1-3 (activity book p.18): temperature against time for 5 g of zinc and of iron powder in 50 mL of copper(II) sulfate */
var CH={zn:[21,48,62,71,75,72,70],fe:[21,25,32,38,41,43,44]};
function chartSVG(){
  var s='', i, T, x, y;
  function tx(x,y,t,a){ return '<text x="'+x+'" y="'+y+'" text-anchor="'+(a||'middle')+'" font-size="14" font-weight="700" fill="#fff" font-family="Cairo,sans-serif" stroke="rgba(0,0,0,.5)" stroke-width="2.5" paint-order="stroke">'+t+'</text>' }
  for(T=20;T<=80;T+=10){ y=300-(T-20)*4.5; s+='<line x1="62" y1="'+y+'" x2="538" y2="'+y+'" stroke="rgba(255,255,255,.38)" stroke-width="1"/>'+tx(54,y+5,T,'end') }
  for(i=0;i<=6;i++){ x=62+i*79.33; s+='<line x1="'+x.toFixed(1)+'" y1="30" x2="'+x.toFixed(1)+'" y2="300" stroke="rgba(255,255,255,.3)" stroke-width="1"/>'+tx(x.toFixed(1),318,(i*.5).toFixed(1)) }
  return '<svg id="ch" viewBox="0 0 560 330" width="100%" aria-hidden="true" style="direction:ltr;overflow:visible;display:block"><rect x="62" y="30" width="476" height="270" fill="rgba(6,20,44,.55)"/>'+s+
   '<path d="M62 24V300H546" fill="none" stroke="#fff" stroke-width="3"/>'+tx(66,18,'°C','start')+tx(548,318,'min','start')+
   '<circle cx="330" cy="16" r="6" fill="#ff9d3a"/>'+tx(344,21,'Zn','start')+'<circle cx="410" cy="16" r="6" fill="#7fd4ff"/>'+tx(424,21,'Fe','start')+
   '<path id="lnzn" fill="none" stroke="#ff9d3a" stroke-width="4" stroke-linejoin="round"/><path id="lnfe" fill="none" stroke="#7fd4ff" stroke-width="4" stroke-linejoin="round"/><g id="pts"></g>'+
   '<rect id="hit" x="30" y="30" width="520" height="270" fill="rgba(255,255,255,.001)" style="cursor:crosshair"/></svg>';
}

/* worksheet 1-3: properties of some metals (activity book p.23) */
var WS3=[['Al','2.7','660','70'],['Cu','8.9','1084','130'],['Au','18.9','1064','78'],['Fe','7.9','1540','211'],['Pb','11.3','327','16'],['Hg','13.6','−39','—'],['Na','0.97','98','—'],['W','19.4','3422','411']];

/* worksheet 1-4: powders of five metals with five oxides (activity book p.26): the observations */
var W14D={
 Al2O3:{Al:null,Cu:'لا يحدث تفاعل',Fe:'لا يحدث تفاعل',Mg:'يتوهج الخليط بضوء أبيض ساطع',Zn:'لا يحدث تفاعل'},
 CuO:{Al:'ومضة بيضاء وشرر ساطع في الهواء',Cu:null,Fe:'يتوهج الخليط بلون أحمر برتقالي',Mg:'ومضة بيضاء قوية ودخان كثير',Zn:'يخرج بخار أخضر ولهب'},
 Fe2O3:{Al:'يحترق بقوة مع حرارة وبخار أبيض',Cu:'لا يحدث تفاعل',Fe:null,Mg:'لهب أبيض ساطع وحرارة عالية',Zn:'يتوهج بلون أحمر برتقالي'},
 MgO:{Al:'لا يحدث تفاعل',Cu:'لا يحدث تفاعل',Fe:'لا يحدث تفاعل',Mg:null,Zn:'لا يحدث تفاعل'},
 ZnO:{Al:'تفاعل ضعيف جداً: توهّج فقط',Cu:'لا يحدث تفاعل',Fe:'لا يحدث تفاعل',Mg:'ضوء ساطع ينتشر بسرعة ودخان أبيض',Zn:null}};
var W14={mode:'tick',corner:'الأكسيد ↓ · المسحوق →',
 rows:['Al2O3','CuO','Fe2O3','MgO','ZnO'].map(function(k){return {k:k,lab:eqn(k)}}),
 cols:['Al','Cu','Fe','Mg','Zn'].map(function(k){return {k:k,lab:'<span class="num">'+k+'</span>'}}),
 cell:function(r,c){ var t=W14D[this.rows[r].k][this.cols[c].k]; if(t===null) return null; return {y:t==='لا يحدث تفاعل'?0:1,t:t} }};

/* question 5 of the end-of-unit questions: three tubes with dilute acid */
var R5=[{s:'X',rate:2,obs:'فقاعات قليلة',col:'#e4f1f7'},{s:'Cu',rate:0,obs:'لا يتفاعل',col:'#e4f1f7',metal:'#c9783f'},{s:'Mg',rate:5,obs:'فقاعات كثيرة وسريعة',col:'#e4f1f7'}];

