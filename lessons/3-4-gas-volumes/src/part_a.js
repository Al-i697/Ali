/* ---------- gas volumes, part A: the cover, the "who am I" game, and the first prediction (old deck slides 1 to 3) ---------- */

/* two gas syringes with the same density of particles but different amounts */
function syringesSVG(){
  function syr(y,f,n,seed,col){
    var p=52+236*f;
    return '<g transform="translate(0,'+y+')">'+
     '<rect x="24" y="22" width="30" height="22" rx="5" fill="rgba(var(--t2),.45)"/>'+
     '<rect x="52" y="6" width="238" height="54" rx="10" fill="rgba(var(--t1),.12)" stroke="var(--cyan)" stroke-width="3"/>'+
     parts(58,10,p-62,46,n,col,6,seed)+
     '<rect x="'+p+'" y="10" width="12" height="46" rx="3" fill="var(--gold)"/>'+
     '<rect x="'+(p+12)+'" y="28" width="'+(300-p)+'" height="10" fill="rgba(var(--t2),.6)"/><rect x="298" y="14" width="10" height="38" rx="4" fill="var(--gold)"/></g>';
  }
  return '<svg viewBox="0 0 330 190" width="330" aria-hidden="true">'+syr(8,0.95,19,7,GC.H2)+syr(100,0.5,10,11,GC.H2)+'</svg>';
}

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يعرّف قانون أفوجادرو، ويستخدم الحجم المولي للغاز 24 L عند درجة حرارة الغرفة والضغط القياسي.',
   'يحسب عدد مولات حجم معيّن من غاز، ويحسب حجم عدد معيّن من المولات.',
   'يحسب حجوم الغازات المتفاعلة والناتجة من المعادلة الموزونة (تفاعلات الغازات فقط).',
   'يحسب كتلة مادة أو حجم غاز في تفاعل يجمع بين مواد صلبة وغازات.',
   'ينفّذ استقصاء النشاط ٣-٣: كتلة Mg وحجم H₂ الناتج (إثرائي).'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:24px 30px 22px;justify-content:center;gap:10px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">تمهيد</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;line-height:1.12"><span class="num" style="color:var(--gold)">3-4</span> حسابات تتضمن <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">حجوم الغازات</span></h1>
    <p style="margin:0 0 4px;font-size:27px;font-weight:700;color:var(--muted)">الحجم المولي وتفاعلات الغازات</p>
    <p style="font-size:24px;font-weight:700;line-height:1.4;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:340px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:12px 8px;align-items:center;gap:6px">${syringesSVG()}<div class="sm" style="font-size:19px;text-align:center">نفس الظروف: الكثافة واحدة، والحجم يتبع عدد الجسيمات</div></div>
    <div class="bigeq" style="font-size:40px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5)">V = n × 24</div>
    <div class="sm" style="font-size:22px;text-align:center">كم يشغل المول من الغاز؟</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من دليل المعلم للموضوع ٣-٤ (٤-٨، ٥-٨، ٦-٨) مع معايير النجاح في عرضك القديم. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>نشاط ٣-٣ (استقصاء كتلة Mg وحجم H₂) إثرائي في دليل المعلم.</li><li>الدرس هذا يغطي كتاب الطالب ص٦٥–٦٩ وأسئلة ٣-١٢ إلى ٣-١٥، وكتاب النشاط (تمرين ٣-٤، تمرين ٣-٥، ورقة العمل ٣-٥ سؤال ١ ج).</li></ul>'});

/* 2 who am I: clues about the mole (from the old deck) */
slide({id:'who',ch:0,title:'من أنا؟',tag:'لعبة قبل الدرس',
 html:function(){
  var C=['أنا كمية من مادة.','في داخلي <span class="num">6.02 × 10<sup>23</sup></span> ذرة أو جزيء أو وحدة صيغة، حسب نوع المادة.','كتلتي بالغرام تساوي الكتلة الذرية أو الجزيئية النسبية: <span class="num">12 g</span> من الكربون، و<span class="num">18 g</span> من الماء.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">اضغط على الرقم لتظهر الدلائل:</div>
    ${C.map(function(t,i){return `<button type="button" class="clue" data-i="${i}"><span class="cn">${ar(i+1)}</span><span class="ct"><span class="q">؟</span><span class="tx hide">${t}</span></span></button>`}).join('')}
   </div>
   <div class="col" style="width:470px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:26px;font-weight:800">من أنا؟</div>
     ${optsHTML([{t:'الجزيء'},{t:'المول'},{t:'ثابت أفوجادرو'},{t:'وحدة الكتلة الذرية'}])}<div class="fb" style="min-height:26px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:22px">أنا <b>المول</b>. نعرف أن 1 mol من أي مادة فيه 6.02 × 10<sup>23</sup> جسيماً. فكم يشغل 1 mol إذا كانت المادة <b>غازاً</b>؟</div></div></div>`;},
 init:function(el){
  $$('.clue',el).forEach(function(b){b.addEventListener('click',function(){ b.classList.add('on'); $('.q',b).classList.add('hide'); $('.tx',b).classList.remove('hide') })});
  bindMcq($('.panel',el),[{t:'',why:'الجزيء جسيم واحد، ونحن نبحث عن كمية فيها عدد كبير من الجسيمات'},{t:'',ok:true,why:'المول: كمية المادة التي فيها 6.02 × 10²³ جسيماً'},{t:'',why:'ثابت أفوجادرو هو العدد نفسه، وليس كمية من المادة'},{t:'',why:'وحدة الكتلة الذرية وحدة للكتلة وليست كمية مادة'}],$('.panel .fb',el),function(){
   $$('.clue',el).forEach(function(b){ b.classList.add('on'); $('.q',b).classList.add('hide'); $('.tx',b).classList.remove('hide') });
   var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up');
  });
 },
 note:'<ul><li>لعبة «من أنا؟» من عرضك القديم (شريحة ١–٢): كمية من مادة تحتوي على 6.02×10²³ ذرة أو جزيئاً أو وحدة صيغة ← المول.</li><li>أضفت الدليل الثالث (الكتلة بالغرام = الكتلة النسبية) من كتاب الطالب. اضغط الأرقام واحداً واحداً قبل أن يجيبوا.</li></ul>'});

/* 3 the first prediction: one mole of three different gases */
slide({id:'predict',ch:0,title:'ماذا تتوقع؟',tag:'توقّع ثم تأكد',
 html:function(){
  var G=[['H2','H₂','2 g',5,GC.H2,70],['O2','O₂','32 g',7,GC.O2,250],['CO2','CO₂','44 g',9,GC.CO2,430]], cyl='';
  G.forEach(function(g,i){
   cyl+='<g class="gcyl" data-i="'+i+'"><rect x="'+g[5]+'" y="40" width="112" height="196" rx="10" fill="rgba(var(--t1),.08)" stroke="var(--cyan)" stroke-width="3"/>'+
    '<g class="gfill" style="opacity:0;transition:opacity 700ms ease '+(i*0.25)+'s">'+parts(g[5]+4,44,104,188,12,g[4],g[3],17+i*9)+'</g>'+
    '<line class="gline" x1="'+(g[5]-8)+'" y1="40" x2="'+(g[5]+120)+'" y2="40" stroke="var(--gold)" stroke-width="3" stroke-dasharray="6 6" style="opacity:0;transition:opacity 700ms ease '+(i*0.25)+'s"/>'+
    '<text class="gvol" x="'+(g[5]+56)+'" y="30" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="24" fill="var(--gold)" style="opacity:0;transition:opacity 700ms ease '+(0.6+i*0.25)+'s" direction="ltr">24 L</text>'+
    '<text x="'+(g[5]+56)+'" y="262" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="26" fill="var(--ink)" direction="ltr">'+g[1]+'</text>'+
    '<text x="'+(g[5]+56)+'" y="286" text-anchor="middle" font-size="20" font-weight="700" fill="var(--muted)" direction="ltr">1 mol = '+g[2]+'</text></g>';
  });
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:470px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:8px"><p class="lead" style="margin:0;font-size:25px">ثلاث أسطوانات متماثلة، في كل واحدة <b class="num">1 mol</b> من غاز مختلف، عند درجة حرارة الغرفة والضغط القياسي. أيها يشغل <b>أكبر حجماً</b>؟</p>
     ${optsHTML([{t:'الهيدروجين، لأنه الأخف'},{t:'ثاني أكسيد الكربون، لأن جزيئاته أكبر'},{t:'الأكسجين'},{t:'الثلاثة تشغل الحجم نفسه'}])}<div class="fb" style="min-height:26px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:22px">الحجم نفسه <b>24 L</b> لكل منها، مع أن الكتل مختلفة (2 و32 و44 g). هذا ما قرره <b>أفوجادرو</b>.</div></div>
   <div class="col" style="flex:1;min-width:0;align-items:center;justify-content:center"><svg id="gsvg" viewBox="0 0 612 300" width="100%" style="max-height:370px" aria-hidden="true">${cyl}</svg><div class="sm" id="gcap" style="font-size:21px;text-align:center;min-height:26px">في كل أسطوانة العدد نفسه من الجزيئات: <span class="num">6.02 × 10<sup>23</sup></span></div></div></div>`;},
 init:function(el){
  bindMcq($('.panel',el),[{t:'',why:'الأخف كتلة لا يعني الأصغر حجماً في الغازات، جرّب الاختيار الأخير'},{t:'',why:'الجزيء الأكبر لا يشغل حجماً أكبر؛ المسافات بين الجزيئات هي التي تهم'},{t:'',why:'جرّب الاختيار الأخير'},{t:'',ok:true,why:'صح: 1 mol من أي غاز يشغل الحجم نفسه في الظروف نفسها'}],$('.panel .fb',el),function(){
   $('.panel .opts',el).classList.add('hide'); $$('.gfill,.gline,.gvol',el).forEach(function(n){n.style.opacity=1});
   var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up');
  });
 },
 note:'<ul><li>الفكرة الرئيسية للدرس: الغازات المختلفة، بالعدد نفسه من الجزيئات وفي الظروف نفسها، تشغل الحجم نفسه (قانون أفوجادرو، كتاب الطالب ص٦٥).</li><li>الكتل: H₂ = ٢ g، O₂ = ٣٢ g، CO₂ = ٤٤ g (جدول ٣-٥). نسأل الطلاب أولاً، ثم نكشف الأسطوانات.</li><li>الرسم تمثيلي: في الحقيقة المسافات بين جزيئات الغاز كبيرة جداً مقارنة بحجم الجزيء، ولذلك لا يهم حجم الجزيء.</li></ul>'});
