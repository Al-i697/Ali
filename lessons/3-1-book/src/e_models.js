/* ---------- formula from a model or a diagram (book p. 57) ---------- */

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
  slide({id:'models',ch:5,title:'نماذج الكرات: اقرأ الصيغة',tag:'عدّ واختر',
   html:function(){return ''+
    '<div class="col" style="width:560px;flex:none;gap:10px"><div class="mod"><svg id="msvg" viewBox="0 0 400 320" aria-label="نموذج كرات لجزيء"></svg></div><div class="chips" style="gap:5px;justify-content:center;flex-wrap:nowrap">'+['H','C','N','O','Cl'].map(function(s){var c=ELC[s]; return '<span class="pill" style="min-height:34px;padding:0 9px;font-size:16px;white-space:nowrap"><i style="width:16px;height:16px;border-radius:50%;background:'+c[0]+';box-shadow:inset 0 0 0 2px rgba(0,0,0,.25);display:inline-block;margin-inline-end:6px"></i><span>'+NAMES[s]+'</span></span>'}).join('')+'</div></div>'+
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
  slide({id:'lattice',ch:5,title:'التراكيب الضخمة: نحصي ثم نبسّط النسبة',tag:'عدّ وبسّط',
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
