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

/* 17 race: question 3-3 */
(function(){
  var Q=[['أ','الأكسجين','O<sub>2</sub>',32],['ب','الأمونيا','NH<sub>3</sub>',17],['ج','ثاني أكسيد الكبريت','SO<sub>2</sub>',64],['د','الأوكتان','C<sub>8</sub>H<sub>18</sub>',114],
         ['هـ','حمض الكبريتيك','H<sub>2</sub>SO<sub>4</sub>',98],['و','بروميد البوتاسيوم','KBr',119],['ز','نترات النحاس (II)','Cu(NO<sub>3</sub>)<sub>2</sub>',187.5],['ح','كلوريد الألومنيوم','AlCl<sub>3</sub>',133.5]];
  slide({id:'race',ch:3,title:'سباق الفصل: احسب Mr',tag:'مسابقة',
   html:function(){return '<div class="col grow" style="gap:10px"><div class="chips" style="gap:8px;direction:ltr;justify-content:center">'+['H','C','N','O','S','Al','Cl','K','Br','Cu'].map(function(s){return '<span class="pill" style="min-height:38px;padding:0 12px;font-size:20px;font-family:var(--font-display)">'+s+' = '+AR_T[s]+'</span>'}).join('')+'</div>'+
    '<div class="rgrid">'+Q.map(function(q,i){return '<div class="rc" data-i="'+i+'"><div class="nm">'+q[0]+'. '+q[1]+'</div><div class="f">'+q[2]+'</div><div class="ans"></div>'+ninHTML('r'+i,'','sm')+'</div>'}).join('')+'</div></div>'+
    '<div class="teams"><div class="team"><div style="font-weight:700;font-size:21px">الفريق الأول</div><b class="num" id="tA">0</b><div class="pm"><button type="button" data-t="A" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="A" data-d="1" aria-label="زِد">+</button></div></div>'+
    '<div class="team b"><div style="font-weight:700;font-size:21px">الفريق الثاني</div><b class="num" id="tB">0</b><div class="pm"><button type="button" data-t="B" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="B" data-d="1" aria-label="زِد">+</button></div></div>'+
    '<p class="sm muted" id="left" style="text-align:center">٨ أسئلة متبقية</p></div>';},
   init:function(el){
    var sc={A:0,B:0}, left=8;
    $$('.team .pm button',el).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); sc[t]=Math.max(0,sc[t]+ +b.getAttribute('data-d')); $('#t'+t,el).textContent=sc[t]})});
    $$('.rc',el).forEach(function(c,i){
      bindNum($('.nin',c),Q[i][3],0.01,function(ok){ if(ok){c.classList.add('ok'); $('.ans',c).textContent='= '+Q[i][3]; left--; $('#left',el).textContent=left?ar(left)+' أسئلة متبقية':'انتهت الأسئلة!'} });
    });
   },
   note:'<ul><li>السؤال ٣-٣ (أ–ح). الإجابات: ٣٢، ١٧، ٦٤، ١١٤، ٩٨، ١١٩، ١٨٧٫٥، ١٣٣٫٥.</li><li>قسّم الصف فريقين: كل فريق يرسل طالباً. اضغط + للفريق الفائز بالنقطة.</li><li>تنبيه: Cu(NO₃)₂ → القوس يضاعف N و O.</li></ul>'});
})();

/* 18 exit ticket 2 */
(function(){
  var items=[
   {type:'num',q:'احسب M<sub>r</sub> لهيدروكسيد الكالسيوم Ca(OH)<sub>2</sub> (Ca = 40, O = 16, H = 1)',ans:74,tol:0.01,why:'٤٠ + ٢×(١٦+١) = ٧٤',hint:'القوس: ٢ × (O + H)'},
   {q:'كم ذرة أكسجين في الصيغة Mg(NO<sub>3</sub>)<sub>2</sub>؟',opts:[{t:'2'},{t:'3'},{t:'6',ok:true,why:'٣ × ٢ = ٦ (العدد ٢ يضاعف ما داخل القوس)'},{t:'8'}]},
   {q:'أي مادة نستخدم لها عادةً «كتلة الصيغة النسبية» (مركب أيوني)؟',opts:[{t:'H<sub>2</sub>O'},{t:'CO<sub>2</sub>'},{t:'NaCl',ok:true,why:'صح: وحدة صيغة، مو جزيء منفرد'}]}
  ];
  slide({id:'tk2',ch:3,title:'تذكرة خروج ٢: كتلة الصيغة النسبية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk2')},
   note:'<ul><li>الإجابات: ٧٤، ٦، NaCl.</li><li>الأسئلة من إعدادي: ١ القوس في Ca(OH)₂، ٢ عدّ ذرات O في Mg(NO₃)₂ (٣ × ٢ = ٦)، ٣ متى نقول كتلة الصيغة النسبية (مركب أيوني). تغطي هدف ٣-٨ في دليل المعلم.</li></ul>'});
})();

/* 19 ball models: count the spheres */
(function(){
  var MODELS=[
   {n:'HCl',vb:'80 90 240 170',spheres:[['H',135,170,30],['Cl',245,170,54]],bonds:[[135,170,245,170]],opts:[['HCl',1],['H<sub>2</sub>Cl',0],['HCl<sub>2</sub>',0]]},
   {n:'H2O',vb:'60 50 280 230',spheres:[['O',200,115,50],['H',108,228,32],['H',292,228,32]],bonds:[[200,115,108,228],[200,115,292,228]],opts:[['HO<sub>2</sub>',0],['H<sub>2</sub>O<sub>2</sub>',0],['H<sub>2</sub>O',1]]},
   {n:'NH3',vb:'60 55 280 265',spheres:[['N',200,120,50],['H',104,214,30],['H',296,214,30],['H',200,272,30]],bonds:[[200,120,104,214],[200,120,296,214],[200,120,200,272]],opts:[['NH<sub>2</sub>',0],['NH<sub>3</sub>',1],['N<sub>3</sub>H',0]]},
   {n:'CH4',spheres:[['C',200,160,46],['H',200,52,28],['H',96,204,28],['H',304,204,28],['H',200,286,28]],bonds:[[200,160,200,52],[200,160,96,204],[200,160,304,204],[200,160,200,286]],opts:[['CH<sub>4</sub>',1],['CH<sub>2</sub>',0],['C<sub>4</sub>H',0]]},
   {n:'C2H6O',vb:'10 60 380 250',spheres:[['C',112,176,40],['C',218,176,40],['O',318,118,42],['H',46,122,24],['H',52,232,24],['H',116,268,24],['H',214,92,24],['H',238,268,24],['H',350,200,24]],bonds:[[112,176,218,176],[218,176,318,118],[112,176,46,122],[112,176,52,232],[112,176,116,268],[218,176,214,92],[218,176,238,268],[318,118,350,200]],opts:[['C<sub>2</sub>H<sub>5</sub>O',0],['CH<sub>3</sub>O',0],['C<sub>2</sub>H<sub>6</sub>O',1]]}
  ];
  var NAMES={H:'هيدروجين',C:'كربون',N:'نيتروجين',O:'أكسجين',Cl:'كلور'};
  slide({id:'models',ch:4,title:'نماذج الكرات: اقرأ الصيغة',tag:'عدّ واختر',
   html:function(){return ''+
    '<div class="col" style="width:560px;flex:none;gap:10px"><div class="mod"><svg id="msvg" viewBox="0 0 400 320" aria-label="نموذج كرات لجزيء"></svg></div><div class="chips" style="gap:5px;justify-content:center;flex-wrap:nowrap">'+['H','C','N','O','Cl'].map(function(s){var c=ELC[s]; return '<span class="pill" style="min-height:34px;padding:0 9px;font-size:16px;white-space:nowrap"><i style="width:16px;height:16px;border-radius:50%;background:'+c[0]+';box-shadow:inset 0 0 0 2px rgba(0,0,0,.25);display:inline-block;margin-inline-end:6px"></i>'+NAMES[s]+'</span>'}).join('')+'</div></div>'+
    '<div class="col grow" style="gap:14px"><div class="rounds" id="mrd"></div><p class="lead" style="font-size:27px"><b>اضغط على كل كرة لتعدّها</b>، ثم اختر الصيغة الصحيحة:</p><div class="tally" id="ty"></div><div class="sel" id="so"></div><div class="fb" id="mfb" style="min-height:40px"></div><div><button class="btn acc sm hide" type="button" id="mnx">النموذج التالي</button></div></div>';},
   init:function(el){
    var idx=0, svg=$('#msvg',el), counted;
    function tally(){
      var t={}; counted.forEach(function(g){var e=g.getAttribute('data-el'); t[e]=(t[e]||0)+1});
      $('#ty',el).innerHTML=Object.keys(t).map(function(e){return '<span><i style="background:'+ELC[e][0]+';box-shadow:inset 0 0 0 2px rgba(0,0,0,.25)"></i>'+e+' × '+t[e]+'</span>'}).join('')||'<span class="sm muted" style="background:none;font-family:var(--font-body)">لم تعدّ شيئاً بعد</span>';
    }
    function set(i){
      idx=i; var m=MODELS[i]; counted=[]; locked=false;
      var s=m.bonds.map(function(b){return bond(b[0],b[1],b[2],b[3],10)}).join('')+m.spheres.map(function(p,k){return sph(p[1],p[2],p[3],p[0],{id:k})}).join('');
      svg.setAttribute('viewBox',m.vb||'0 0 400 320'); svg.innerHTML=s; svg.className.baseVal='pop';
      $$('.sph',svg).forEach(function(g){g.addEventListener('click',function(){ var on=g.classList.toggle('cnt'); if(on) counted.push(g); else counted.splice(counted.indexOf(g),1); tally() })});
      $('#so',el).innerHTML=m.opts.map(function(o,j){return '<button type="button" data-j="'+j+'">'+o[0]+'</button>'}).join('');
      $$('#so button',el).forEach(function(b){b.addEventListener('click',function(){
        var o=m.opts[+b.getAttribute('data-j')];
        if(o[1]){ b.classList.add('ok-b'); $$('#so button',el).forEach(function(x){x.classList.add('locked')}); say($('#mfb',el),'✓ صحيح!','ok'); if(i<MODELS.length-1) $('#mnx',el).classList.remove('hide'); else say($('#mfb',el),'✓ ممتاز! أنهيت النماذج الخمسة','ok') }
        else { b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340); say($('#mfb',el),'عدّ الكرات مرة ثانية وقارن بالصيغة','bad') }
      })});
      $('#mrd',el).innerHTML=MODELS.map(function(_,j){return '<span class="rd '+(j<i?'done':(j===i?'cur':''))+'">'+ar(j+1)+'</span>'}).join('');
      say($('#mfb',el),''); $('#mnx',el).classList.add('hide'); tally();
    }
    var locked=false;
    $('#mnx',el).addEventListener('click',function(){set(idx+1)});
    set(0);
   },
   note:'<ul><li>كتاب الطالب ص٥٧: الكرة السوداء = كربون، الزرقاء = نيتروجين، الحمراء = أكسجين، الخضراء = كلور، البيضاء = هيدروجين.</li><li>النماذج: HCl، H₂O، NH₃، CH₄، C₂H₆O (الإيثانول).</li><li>عرضك: «من خلال عدد الكرات الملونة يمكن كتابة الصيغة الجزيئية».</li></ul>'});
})();

/* 20 giant structures: count ions/atoms then simplify the ratio */
(function(){
  function ion(x,y,r,sym,ch,col,txt){var g={'Na':'Na','Cl':'Cl','Si':'Si','O':'O'}[sym]||'Silver'; return '<g class="sph" data-el="'+sym+'"><circle class="s" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#g'+g+')" stroke="rgba(0,0,0,.3)" stroke-width="1.6"/><text direction="ltr" x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-family="Cairo,Tajawal,sans-serif" font-weight="800" font-size="'+(r*.62)+'" fill="'+txt+'" style="pointer-events:none">'+sym+(ch?'<tspan dy="-'+(r*.22)+'" font-size="'+(r*.38)+'">'+ch+'</tspan>':'')+'</text></g>'}
  function nacl(){var s=''; for(var r=0;r<3;r++)for(var c=0;c<4;c++){var na=(r+c)%2===0; s+=ion(62+c*70,54+r*70,32,na?'Na':'Cl',na?'+':'−',na?'#A878E0':'#7CC96A',na?'#1e0a3a':'#06290f')} return s}
  function sio2(){var s=''; [[100,76],[270,76],[100,196],[270,196]].forEach(function(p){ s+=bond(p[0]-46,p[1],p[0],p[1],7)+bond(p[0],p[1],p[0]+46,p[1],7)+ion(p[0]-46,p[1],18,'O','','#E0453A','#fff')+ion(p[0]+46,p[1],18,'O','','#E0453A','#fff')+ion(p[0],p[1],30,'Si','','#8E959C','#fff')}); return s}
  var P=[{id:'a',name:'كلوريد الصوديوم',svg:nacl(),vb:'0 0 340 240',opts:[['٦ : ٦ ⇒ Na<sub>6</sub>Cl<sub>6</sub>',0],['١ : ١ ⇒ NaCl',1],['١ : ٢ ⇒ NaCl<sub>2</sub>',0]],why:'٦ : ٦ تتبسّط إلى ١ : ١ فالصيغة NaCl'},
         {id:'b',name:'ثاني أكسيد السيليكون (مخطط مبسّط)',svg:sio2(),vb:'0 0 370 270',opts:[['٤ : ٨ ⇒ Si<sub>4</sub>O<sub>8</sub>',0],['٢ : ١ ⇒ Si<sub>2</sub>O',0],['١ : ٢ ⇒ SiO<sub>2</sub>',1]],why:'٤ : ٨ تتبسّط إلى ١ : ٢ فالصيغة SiO₂'}];
  slide({id:'lattice',ch:4,title:'التراكيب الضخمة: نحصي ثم نبسّط النسبة',tag:'عدّ وبسّط',
   html:function(){return '<div style="display:flex;gap:20px;flex:1">'+P.map(function(p){return '<div class="mod" data-p="'+p.id+'"><h3 style="margin:0;font-family:var(--font-display);font-size:26px">'+p.name+'</h3><svg viewBox="'+p.vb+'" style="max-height:230px"><g>'+p.svg+'</g></svg><div class="tally"></div><div class="sel"></div><div class="fb" style="min-height:34px;font-size:20px;text-align:center"></div></div>'}).join('')+'</div>'+
    '';},
   init:function(el){
    P.forEach(function(p){
      var box=$('.mod[data-p="'+p.id+'"]',el), counted=[];
      function tally(){var t={}; counted.forEach(function(g){var e=g.getAttribute('data-el'); t[e]=(t[e]||0)+1}); $('.tally',box).innerHTML=Object.keys(t).map(function(e){return '<span>'+e+' × '+t[e]+'</span>'}).join('')||'<span class="sm muted" style="background:none;font-family:var(--font-body);font-size:18px">اضغط الجسيمات للعدّ</span>'}
      $$('.sph',box).forEach(function(g){g.addEventListener('click',function(){var on=g.classList.toggle('cnt'); if(on) counted.push(g); else counted.splice(counted.indexOf(g),1); tally()})});
      $('.sel',box).innerHTML=p.opts.map(function(o,j){return '<button type="button" data-j="'+j+'" style="font-size:22px;min-height:48px;padding:0 14px">'+o[0]+'</button>'}).join('');
      var fb=$('.fb',box);
      $$('.sel button',box).forEach(function(b){b.addEventListener('click',function(){
        var o=p.opts[+b.getAttribute('data-j')];
        if(o[1]){b.classList.add('ok-b'); $$('.sel button',box).forEach(function(x){x.classList.add('locked')}); say(fb,'✓ '+p.why,'ok')}
        else{b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340); say(fb,'بسّط النسبة بقسمتها على العامل المشترك','bad')}
      })});
      tally();
    });
   },
   note:'<ul><li>كتاب الطالب ص٥٧: NaCl نسبة ١:١، وSiO₂ نسبة ١:٢ (الضخمة نحصي ونبسّط).</li><li>الرسم تخطيطي: الهدف تدريب العدّ والتبسيط، لا شكل الارتباط الفعلي.</li></ul>'});
})();

/* 21 question 3-1: formulas from diagrams */
(function(){
  var T='direction="ltr" font-family="Baloo Bhaijaan 2,Tajawal,sans-serif" font-weight="800" fill="#f4fbf8" text-anchor="middle" dominant-baseline="central"';
  function t(x,y,s,fs){return '<text x="'+x+'" y="'+y+'" '+T+' font-size="'+(fs||20)+'">'+s+'</text>'}
  function ln(x1,y1,x2,y2){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#f4fbf8" stroke-width="2"/>'}
  function ci(x,y,r,s,f){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(f||'rgba(255,255,255,.12)')+'" stroke="#f4fbf8" stroke-width="1.6"/>'+t(x,y,s,r*.7)}
  function lat(rows,fn){var s=''; for(var r=0;r<rows.length;r++)for(var c=0;c<rows[r].length;c++) s+=fn(rows[r][c],c,r); return s}
  var D=[
   {id:'A',svg:t(80,70,'H',24)+ln(98,70,128,70)+t(150,70,'Br',24),ans:'HBr',opts:['HBr','H<sub>2</sub>Br','HBr<sub>2</sub>'],type:'جزيء'},
   {id:'B',svg:t(120,75,'C',24)+ln(120,36,120,62)+ln(120,88,120,114)+ln(82,75,106,75)+ln(134,75,158,75)+t(120,24,'H')+t(120,126,'H')+t(70,75,'H')+t(170,75,'H'),ans:'CH₄',opts:['CH<sub>4</sub>','CH<sub>2</sub>','C<sub>4</sub>H'],type:'جزيء'},
   {id:'C',svg:lat(['AA','OOO','AA','OOO'],function(k,c,r){var x=(k==='A'?(c?160:80):(c*70+50)), y=22+r*34; return k==='A'?ci(x,y,17,'Al³⁺','rgba(20,150,118,.92)'):ci(x,y,17,'O²⁻','rgba(196,112,72,.92)')}),ans:'Al₂O₃',opts:['Al<sub>2</sub>O<sub>3</sub>','Al<sub>4</sub>O<sub>6</sub>','AlO'],type:'أيوني ضخم'},
   {id:'D',svg:t(120,56,'I',24)+ln(104,48,76,36)+ln(136,48,164,36)+ln(120,70,120,104)+t(62,32,'Cl')+t(178,32,'Cl')+t(120,118,'Cl'),ans:'ICl₃',opts:['I<sub>3</sub>Cl','ICl<sub>3</sub>','ICl'],type:'جزيء'},
   {id:'E',svg:t(120,75,'Br',24)+ln(120,40,120,62)+ln(120,88,120,110)+ln(86,60,106,68)+ln(86,92,106,82)+ln(136,75,160,75)+t(120,26,'F')+t(120,124,'F')+t(72,54,'F')+t(72,98,'F')+t(172,75,'F'),ans:'BrF₅',opts:['BrF<sub>4</sub>','Br<sub>5</sub>F','BrF<sub>5</sub>'],type:'جزيء'},
   {id:'F',svg:(function(){
      var s='',P=[],i;
      for(i=-1;i<=5;i++) P.push([40+i*40,(i%2===0)?70:92]);
      function sh(p,q,d){var dx=q[0]-p[0],dy=q[1]-p[1],l=Math.sqrt(dx*dx+dy*dy); return [p[0]+dx/l*d,p[1]+dy/l*d]}
      for(i=0;i<P.length-1;i++){var p=P[i],q=P[i+1], a=(i===0)?p:sh(p,q,13), b=(i===P.length-2)?q:sh(q,p,13); s+=ln(a[0],a[1],b[0],b[1])}
      for(i=1;i<=5;i++){var c=P[i]; s+=t(c[0],c[1],'C',20)+ln(c[0],c[1]-12,c[0],c[1]-26)+t(c[0],c[1]-36,'H',17)+ln(c[0],c[1]+12,c[0],c[1]+26)+t(c[0],c[1]+36,'H',17)}
      return s})(),ans:'CH₂',opts:['C<sub>5</sub>H<sub>10</sub>','CH<sub>2</sub>','C<sub>2</sub>H'],type:'جزيء'},
   {id:'G',svg:lat(['0101','1010','0101'],function(k,c,r){var x=36+c*56, y=26+r*49; return +k?ci(x,y,22,'Na⁺','rgba(120,96,196,.92)'):ci(x,y,22,'I⁻','rgba(206,150,52,.92)')}).replace(/font-size="[\d.]+"/g,function(){return 'font-size="14"'}),ans:'NaI',opts:['NaI<sub>2</sub>','Na<sub>6</sub>I<sub>6</sub>','NaI'],type:'أيوني ضخم'},
   {id:'H',svg:(function(){
      var s='',cx=120,cy=76,R=34,p=[],i; for(i=0;i<6;i++){var a=(-30+60*i)*Math.PI/180; p.push([cx+R*Math.cos(a),cy+R*Math.sin(a),a])}
      for(i=0;i<6;i++){var q=p[(i+1)%6]; s+=ln(p[i][0],p[i][1],q[0],q[1])}
      for(i=0;i<6;i+=2){var x2=cx+(R+34)*Math.cos(p[i][2]), y2=cy+(R+34)*Math.sin(p[i][2]); s+=ln(p[i][0],p[i][1],x2,y2)+t(x2+Math.cos(p[i][2])*6,y2+Math.sin(p[i][2])*6,'O',18)}
      for(i=0;i<6;i++){s+='<circle cx="'+p[i][0]+'" cy="'+p[i][1]+'" r="12" fill="#0a3f33"/>'+t(p[i][0],p[i][1],i%2===0?'B':'O',18)}
      return s})(),ans:'BO₂',opts:['B<sub>3</sub>O<sub>3</sub>','BO<sub>2</sub>','B<sub>3</sub>O<sub>6</sub>'],type:'جزيء'}
  ];
  var ORDER=[[0,1,2],[1,2,0],[2,0,1],[1,0,2],[0,2,1],[2,1,0],[1,2,0],[2,0,1]];
  slide({id:'q31',ch:4,title:'السؤال ٣-١: اكتب صيغة كل مخطط',tag:'اختر الصيغة',
   html:function(){return '<div class="col grow" style="gap:10px"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'+D.map(function(d,i){
      var order=ORDER[i], opts=order.map(function(k){return d.opts[k]});
      return '<div class="qd" data-i="'+i+'"><div class="id">'+d.id+'</div><svg viewBox="0 0 240 150">'+d.svg+'</svg><div class="sel">'+opts.map(function(o,j){return '<button type="button" data-j="'+j+'">'+o+'</button>'}).join('')+'</div></div>'}).join('')+
    '</div><div style="display:flex;gap:14px;align-items:center"><button class="btn acc sm" type="button" id="typ">ما نوع الجسيمات؟</button><div class="fb" style="flex:1;min-height:30px;font-size:21px"></div></div></div>';},
   init:function(el){
    var done=0;
    D.forEach(function(d,i){
      var card=$('.qd[data-i="'+i+'"]',el), order=ORDER[i];
      $$('.sel button',card).forEach(function(b){
        var plain=b.innerHTML.replace(/<\/?sub>/g,''); var ans=d.ans.replace(/[₀-₉]/g,function(c){return '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)});
        b.addEventListener('click',function(){
          if(plain===ans){b.classList.add('ok-b'); $$('.sel button',card).forEach(function(x){x.classList.add('locked')}); card.classList.add('ok'); done++; if(done===8) say($('.fb',el),'✓ ممتاز! حلّيت الثمانية','ok')}
          else{b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340)}
        });
      });
    });
    $('#typ',el).addEventListener('click',function(){
      D.forEach(function(d,i){var c=$('.qd[data-i="'+i+'"]',el); var tag=c.querySelector('.tg'); if(!tag){tag=document.createElement('div'); tag.className='tg pop'; tag.style.cssText='position:absolute;top:8px;inset-inline-end:10px;font-weight:800;font-size:15px;background:'+(d.type==='جزيء'?'var(--surface)':'var(--accent-soft)')+';border-radius:999px;padding:2px 10px'; tag.textContent=d.type; c.style.position='relative'; c.appendChild(tag)}});
      say($('.fb',el),'C و G تراكيب أيونية ضخمة، والباقي جزيئات.','ok'); this.classList.add('hide');
    });
   },
   note:'<ul><li>إجابات الدليل: A = HBr، B = CH₄، C = Al₂O₃، D = ICl₃، E = BrF₅، F = CH₂، G = NaI، H = BO₂.</li><li>(أ) C و G أيوني ضخم. (ب) الباقي جزيئات.</li><li>في C: ٤ Al و٦ O → ٢:٣. في H: ٣ B و٦ O → ١:٢.</li></ul>'});
})();
