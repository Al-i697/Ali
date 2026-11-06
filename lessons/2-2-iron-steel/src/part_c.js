/* ---------- lesson 2-2, part C: from pig iron to steel (basic oxygen process), the impurities, the alloy and the steels ---------- */

/* 12 the problem of pig iron and the carbon meter (book p.41; Table 2-3 is in lesson 2-3, only used here to show how carbon changes the kind of iron) */
slide({id:'pig',ch:3,title:'الحديد الصبّ: ما المشكلة؟',tag:'حرّك مقياس الكربون',
 html:function(){
  return `<div class="col" style="flex:1;gap:10px;min-height:0">
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div class="panel" style="flex-direction:row;gap:14px;align-items:center;padding:10px 14px">${cut('pig_bof',150,'r','')}<div style="flex:1"><div style="font-size:25px;font-weight:800;color:var(--gold)">المشكلة: حديد هشّ</div><div style="font-size:19px;line-height:1.45;font-weight:600">الحديد الناتج عن الفرن العالي يُسمّى <b>الحديد الصبّ</b> (<span class="num">Pig Iron</span>) وليس نقياً: يحتوي نحو <b>٤٪ كربوناً</b> وشوائب أخرى، وهذه النسبة تجعله <b>هشّاً</b>.</div></div></div>
    <div class="panel" style="flex-direction:row;gap:14px;align-items:center;padding:10px 14px">${cut('pig_bof',150,'l','')}<div style="flex:1"><div style="font-size:25px;font-weight:800;color:var(--gold)">الحل: مسار الفولاذ</div><div style="font-size:19px;line-height:1.45;font-weight:600">نُزيل الكربون الزائد بـ<b>أكسدته</b> ونعالج الشوائب، فنحصل على الفولاذ: <b>أمتن وأكثر مرونة</b>.</div></div></div></div>
   <div class="panel cmeter" style="padding:12px 20px;gap:6px"><div style="font-size:22px;font-weight:800">حرّك المقياس لتُنقص نسبة الكربون في الحديد:</div>
    <input type="range" id="cr" min="0.1" max="4.5" step="0.05" value="4" aria-label="نسبة الكربون"><div class="cscale"><span>0.1 %</span><span>4.5 %</span></div>
    <div class="cval"><span id="cv">4.0</span> % C</div><div class="ckind" id="ck"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">كلما نزع المصنع كربوناً من الحديد الصبّ الهشّ صار <b>فولاذاً</b>: أقل كربوناً وأكثر متانة ومرونة.</div></div>`;},
 init:function(el){
  var r=$('#cr',el), v=$('#cv',el), k=$('#ck',el), hit=false;
  function kind(c){
   if(c>=2.5) return ['حديد صبّ: هشّ (كربون ٢٫٥–٤٫٥٪)','#ff9a7a'];
   if(c>1.5) return ['بين الحديد الصب والفولاذ: ما زال الكربون كثيراً','#ffd24a'];
   if(c>0.45) return ['فولاذ عالي الكربون: قاسٍ وهشّ (شفرات وأدوات قطع)','#ffd24a'];
   if(c>0.25) return ['فولاذ متوسط الكربون: نوابض ومحاور وجسور','#9be9a8'];
   return ['فولاذ طري (أقل من ٠٫٢٥٪): هياكل السيارات والآلات والأسلاك','#7be0a8'];
  }
  function upd(){ var c=+r.value, kk=kind(c); v.textContent=c.toFixed(c<1?2:1); k.textContent=kk[0]; k.style.color=kk[1]; if(c<0.25&&!hit){ hit=true; unhide(el) } }
  r.addEventListener('input',upd); upd();
 },
 note:'<ul><li>كتاب الطالب ص٤١: «يُعرف الحديد الناتج من الفرن العالي باسم الحديد الصَّبّ (Pig Iron) وهو ليس نقياً؛ فهو يحتوي على ٤٪ من الكربون تقريباً بالإضافة إلى شوائب أخرى، وهذه الكمية من الكربون تجعل الحديد هشّاً». عرضك (شريحة «معضلة الحديد الصب»): المشكلة: هشاشة المعدن؛ الحل: مسار الفولاذ (أكسدة وإزالة الكربون الزائد).</li><li>أنواع الفولاذ بحسب الكربون في المقياس من جدول ٢-٣ في كتاب الطالب ص٤٢ (الدرس ٢-٣): عالي الكربون ١٫٥–٠٫٤٥٪، متوسط ٠٫٤٥–٠٫٢٥٪، طري أقل من ٠٫٢٥٪، والحديد الصب/المطاوع ٢٫٥–٤٫٥٪. استعملتُ الجدول فقط لإظهار كيف يتغيّر نوع الحديد بنسبة الكربون (هدف ٧-٤)؛ تفاصيله في الدرس ٢-٣.</li><li>الصورة من صورك (بخلفية شفافة حقيقية): المحوّل المتوهج يرمز للحل والكتلة المتشققة للهشاشة.</li></ul>'});

/* 13 the basic oxygen process (template with three empty panels) */
slide({id:'bop',ch:3,bare:true,title:'عملية الأكسجين الأساسية',
 html:function(){
  var X=[852,447,40];   /* panel left edges: a (right), b (middle), c (left) */
  var inner=tb(110,26,1060,96,'<div id="bt" style="font-size:29px;font-weight:800;line-height:1.3">محوّل الأكسجين الأساسي <span class="num" style="font-size:22px">(Basic Oxygen Process)</span></div><div id="bx" style="font-size:20px;font-weight:700;line-height:1.35;color:#34506f">اضغط على كل مرحلة من المراحل الثلاث</div>','l');
  [['أ. التعبئة'],['ب. النفخ والأكسدة'],['ج. السكب والفصل']].forEach(function(t,i){
   inner+=tb(X[i]+22,146,348,50,'<b style="font-size:24px">'+t[0]+'</b>','d','border-radius:10px;padding:2px 8px');
   inner+=tb(X[i],135,391,537,'','n hot','border-radius:18px','data-i="'+i+'"');
  });
  return frame('bof3',inner);},
 init:function(el){
  var D=[['أ. التعبئة','يُملأ المحوّل المائل أولاً بالحديد الصبّ المنصهر القادم من الفرن العالي، ثم تُضاف خردة الفولاذ لتذوب وتمتزج بالحديد غير النقي.'],
         ['ب. النفخ والأكسدة','يُضاف الجير الحي CaO وتُوضع خزانة جمع الأبخرة فوق المحوّل، ثم يُنفخ الأكسجين بسرعة عالية عبر خرطوم مبرَّد بالماء فتحترق الشوائب: الكربون والكبريت يخرجان غازات (CO وCO₂ وSO₂).'],
         ['ج. السكب والفصل','تحترق شوائب صغيرة أخرى (Si وP) إلى أكاسيد حمضية يعادلها CaO فتكوّن الخبث الطافي؛ يُمال المحوّل فيُسكب الفولاذ من جانب، ثم يُمال إلى الجانب الآخر فيُسكب الخبث.']];
  var seen={};
  $$('.tb.hot',el).forEach(function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'); $$('.tb.hot',el).forEach(function(x){x.classList.toggle('on',x===b)});
   $('#bt',el).textContent=D[i][0]; $('#bx',el).innerHTML=D[i][1]; $('#bx',el).style.color='#0e2747'; $('#bx',el).style.fontSize=(i===1?'18.5px':'19.5px'); seen[i]=1 }) });
 },
 note:'<ul><li>كتاب الطالب ص٤١ (الشكل ٢-٣): المرحلة (أ): تعبئة المحوّل بالحديد الخام المنصهر ثم إضافة خردة الفولاذ. المرحلة (ب): يُضاف الجير الحي (CaO)، ثم يُضخ الأكسجين بسرعة عالية عبر خرطوم مبرَّد بالماء لحرق الشوائب؛ الكربون على شكل <span class="num">CO</span> و<span class="num">CO₂</span> يخرجان عبر خزانة جمع الأبخرة. المرحلة (ج): السيليكون والفوسفور يكوّنان أكاسيد حمضية غير غازية تُعادَل بالجير فتتكوّن خبثاً يطفو؛ يُسكب الفولاذ من جانب ثم الخبث من الجانب الآخر. تعريف «عملية الأكسجين الأساسية» في صندوق المصطلحات.</li><li>عرضك (الشريحة ٩ «محوّل الأكسجين الأساسي»): التعبئة، النفخ والأكسدة، السكب والفصل: أي المراحل نفسها. ومرحلة التعبئة في عرضك «حديد خام منصهر + خردة». الصورة قالب أرسلتَه بلا نصوص (ثلاث لوحات) والنصوص حيّة.</li><li>سؤال امتحان وأسئلة نهاية الوحدة (٣) في الفصل السادس.</li></ul>'});

/* 14 what leaves the converter as a gas and what becomes slag */
slide({id:'impur',ch:3,title:'الشوائب في المحوّل: غاز أم خبث؟',tag:'اسحب الشائبة إلى مكانها',
 html:function(){
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="flex:1;min-width:0;gap:10px">
    <div class="panel" style="padding:8px 16px;font-size:20px;font-weight:700;line-height:1.4">يُنفخ الأكسجين في الحديد المنصهر فتتحوّل الشوائب إلى <b>أكاسيد</b>. إلى أين يذهب كل أكسيد؟</div>
    <div class="bands" style="flex:1"><div class="band gas" data-b="g"><h4>غاز: يخرج عبر خزانة جمع الأبخرة</h4><small>أكسيد غازي لا يبقى في الفولاذ</small><div class="bchips"></div></div>
     <div class="band slg" data-b="s"><h4>خبث: يطفو فوق الفولاذ</h4><small>أكسيد حمضي صلب يعادله CaO</small><div class="bchips"></div></div></div>
    <div class="fb" style="min-height:28px"></div>
    <div class="gbar hide" id="gb" style="font-size:19px">الأكاسيد الغازية (<span class="num">CO₂</span>، <span class="num">SO₂</span>) تخرج؛ والأكاسيد الحمضية (<span class="num">SiO₂</span>، <span class="num">P₄O₁₀</span>) يعادلها <span class="num">CaO</span> القاعدي فتكوّن الخبث.</div></div>
   <div class="col" style="width:320px;flex:none;gap:10px;justify-content:center;align-items:center"><div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div>
    ${cut('ladles_pour',300,null,'')}<div style="font-size:17px;font-weight:700;text-align:center;line-height:1.35">يُسكب الخبث (الداكن) بعيداً عن الفولاذ المنصهر</div></div></div>`;},
 init:function(el){
  bindBands(el,[
   ['c','الكربون '+eqn('C'),'g','يحترق إلى '+eqn('CO / CO2')+' غازين فيخرجان','الكربون يحترق إلى أكاسيد غازية'],
   ['s','الكبريت '+eqn('S'),'g','يصبح '+eqn('SO2')+' غازاً يسهل فصله','أكسيد الكبريت غاز يخرج مع الأبخرة'],
   ['si','السيليكون '+eqn('Si'),'s','يتحوّل إلى '+eqn('SiO2')+' أكسيد حمضي صلب يعادله '+eqn('CaO')+' فيكوّن خبثاً','أكسيد السيليكون صلب لا يتصاعد: يعادله الجير ويكوّن خبثاً'],
   ['p','الفوسفور '+eqn('P'),'s','يصبح '+eqn('P4O10')+' أكسيداً حمضياً صلباً يعادله '+eqn('CaO')+' فيكوّن الخبث','أكسيد الفوسفور صلب لا يتصاعد: يعادله الجير ويكوّن خبثاً']],{css:'font-size:23px;padding:5px 18px'});
 },
 note:'<ul><li>كتاب الطالب ص٤١ المرحلتان (ب) و(ج) وسؤال نهاية الوحدة ٣ (ب): يتحوّل الكبريت والكربون والفوسفور إلى أكاسيد؛ <span class="num">SO₂</span> و<span class="num">CO₂</span> غازان يسهل فصلهما عن الفولاذ المنصهر، أما <span class="num">CaO</span> (أكسيد قاعدي) فيتفاعل مع الأكسيد الحمضي <span class="num">P₄O₁₀</span> فيكوّن فوسفات الكالسيوم (جواب الدليل). عرضك المرجعي (شريحتا «الهجوم بالأكسجين»): الكربون ← CO وCO₂؛ الكبريت ← SO₂؛ السيليكون والفوسفور ← أكاسيد حمضية صلبة + CaO ← خبث.</li><li>تنبيه: كتبتُ الأكسيد <span class="num">P₄O₁₀</span> كما في كتاب الطالب وسؤاله (الورقة الملخّصة تكتبه <span class="num">P₂O₅</span>: الصيغة الأبسط لكنها غير مستخدمة في الكتاب). صورة القدرين من صورك (خلفية شفافة حقيقية).</li></ul>'});

/* 15 alloying: the layers of atoms slide in pure iron and jam in steel */
function atomsSVG(alloy){
  var s='<svg class="atoms'+'" viewBox="0 0 400 230" width="100%" aria-hidden="true" style="direction:ltr;display:block"><g class="'+(alloy?'alloy':'pure')+'">', r, c, x, y, big, small;
  for(r=0;r<5;r++){
   s+='<g class="row'+(r<2?' t':'')+'">';
   for(c=0;c<10;c++){
    x=22+c*38+(r%2?19:0); y=28+r*38; big=alloy&&((r===1&&(c===2||c===6))||(r===2&&(c===4||c===8))); small=alloy&&((r===1&&c===4)||(r===2&&c===1));
    if(big) s+='<circle cx="'+x+'" cy="'+(y+(r===1?6:-6))+'" r="23" fill="#e8a33d" stroke="#6b4700" stroke-width="2"/>';
    else if(small) s+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="#2a2d33" stroke="#fff" stroke-width="1.5"/>';
    else s+='<circle cx="'+x+'" cy="'+y+'" r="17" fill="#aeb9c7" stroke="#5a6678" stroke-width="2"/>';
   }
   s+='</g>';
  }
  return s+'</g></svg>';
}
slide({id:'alloy',ch:3,title:'السبيكة: لماذا الفولاذ أمتن؟',tag:'اضغط «طبّق قوة»',
 html:function(){
  return `<div class="col" style="flex:1;gap:10px;min-height:0">
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;min-height:0" id="atw">
    <div class="panel" style="padding:10px 14px;gap:6px;align-items:stretch"><div style="font-size:23px;font-weight:800;color:var(--gold)">الحديد النقي</div>${atomsSVG(0)}<div style="font-size:18px;font-weight:600;line-height:1.4">ذرات <b>متطابقة الحجم</b> في طبقات منتظمة: تنزلق الطبقات بسهولة، فالحديد النقي ضعيف وقابل للتشكيل.</div></div>
    <div class="panel" style="padding:10px 14px;gap:6px;align-items:stretch"><div style="font-size:23px;font-weight:800;color:var(--gold)">سبيكة الفولاذ</div>${atomsSVG(1)}<div style="font-size:18px;font-weight:600;line-height:1.4">إضافة ذرات <b>مختلفة الأحجام</b> (مثل الكربون) تعيق انزلاق الطبقات، فتصبح السبيكة أصلب وأمتن.</div></div></div>
   <div style="display:flex;gap:12px;justify-content:center"><button type="button" class="btn acc" id="push">طبّق قوة ▸</button><button type="button" class="btn" id="rst">أعد الذرات</button></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الفولاذ <b>سبيكة</b>: حديد مع كمية قليلة من عناصر أخرى تغيّر خصائصه.</div></div>`;},
 init:function(el){
  var w=$('#atw',el);
  $('#push',el).addEventListener('click',function(){ $$('.atoms',w).forEach(function(a){a.classList.add('push')}); later(function(){ unhide(el) },1100) });
  $('#rst',el).addEventListener('click',function(){ $$('.atoms',w).forEach(function(a){a.classList.remove('push')}) });
 },
 note:'<ul><li>كتاب الطالب ص٤٣ (الشكل ٢-٤) وسؤال ٢-١٦ (الدرس ٢-٣): في الفلز النقي ذرات من نوع واحد بالحجم نفسه في طبقات منتظمة فتنزلق، وفي السبيكة ذرات مختلفة الأحجام تُخلّ بانتظام الطبقات فلا تنزلق بسهولة، فتكون أصلب وأقل قابلية للطرق. عرضك (شريحة «هندسة السبائك»): الحديد النقي (ضعيف وقابل للتشكيل) مقابل سبيكة الفولاذ (صلبة ومتينة).</li><li>وضعتُ الفكرة هنا لأنها مرتبطة بهدف ٧-٤ (تغيّر خصائص الحديد بالمواد المضافة)، ويتوسع فيها الدرس ٢-٣ (السبائك). الرسم تخطيطي: الذرات الصغيرة الداكنة تمثّل الكربون، والكبيرة البرتقالية عنصراً أكبر.</li></ul>'});

/* 16 the steels: mild, stainless, and the hard steels */
slide({id:'steels',ch:3,title:'أنواع الفولاذ: ماذا نضيف ولماذا؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['الفولاذ الطري (العادي)','كربون أقل من ٠٫٢٥٪: هياكل السيارات والآلات والأسلاك.'],
             ['الفولاذ المقاوم للصدأ','حديد مع <b>الكروم</b> و<b>النيكل</b>: مقاوم للصدأ ولامع، لأدوات المائدة وأحواض المطابخ ومصانع المواد الكيميائية.'],
             ['فولاذ التنغستن والمنغنيز','عناصر انتقالية تعطي <b>صلابة عالية</b>: أدوات القطع السريعة ورؤوس الحفر وكسّارات الصخور.']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">لماذا يُضاف الكروم إلى بعض أنواع الفولاذ؟</div>
    ${optsHTML([{t:'ليصبح الفولاذ أكثر مقاومة للصدأ'},{t:'ليصبح الفولاذ أخف وزناً'},{t:'ليتحوّل الفولاذ إلى حديد صبّ'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">بتغيير <b>المواد المضافة</b> نتحكم في خصائص الفولاذ: الصلابة، والمقاومة للصدأ، والمتانة.</div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الكروم (مع النيكل) يعطي فولاذاً مقاوماً للصدأ'},{t:'',why:'الكروم لا يخفف الفولاذ؛ فائدته مقاومة الصدأ'},{t:'',why:'الفولاذ يبقى فولاذاً؛ الحديد الصبّ يحتوي كربوناً أكثر'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>الدليل (هدف ٧-٤): الفولاذ العادي (الطري) والفولاذ المقاوم للصدأ. كتاب الطالب ص٤٣ (جدول ٢-٣ و٢-٤، الدرس ٢-٣): الطري كربونه أقل من ٠٫٢٥٪ (هياكل السيارات، الآلات، الأسلاك)؛ المقاوم للصدأ (Fe ٧٤٪، Cr ١٨٪، Ni ٨٪)؛ فولاذ التنغستن (Fe ٩٥٪، W ٥٪) لأدوات القطع السريعة؛ فولاذ المنغنيز (Fe ٨٧٪، Mn ١٣٪) لرؤوس الحفر وكسّارات الصخور. ص٤١: «تُضاف عناصر انتقالية مثل الكروم والنيكل والتنغستن إلى الفولاذ وهو منصهر».</li><li>سؤال ٢-١٨ (لماذا يُضاف الكروم إلى بعض أنواع الفولاذ؟): جواب الدليل: يجعل الفولاذ المقاوم للصدأ أكثر مقاومة للتآكل وأكثر لمعاناً. عرضك (شريحة «وصفات الفولاذ الحديث»): الفولاذ المقاوم للتآكل (Cr وNi)، والصلابة والمتانة القصوى (W وMn).</li></ul>'});

/* 17 the journey of purification: a summary */
slide({id:'journey',ch:3,title:'رحلة التنقية: من الخام الهشّ إلى السبيكة',tag:'اضغط على كل مرحلة',
 html:function(){
  var items=[['١. خام الحديد','صخر الهيماتيت: شوائب كثيرة ونسبة أكسجين عالية جداً (<span class="num">Fe₂O₃</span>).'],
             ['٢. الحديد الصبّ','من الفرن العالي: كربون نحو ٤٪ وشوائب، هشّ.'],
             ['٣. الفولاذ','من محوّل الأكسجين: ينخفض الكربون كثيراً وتُزال الشوائب.'],
             ['٤. فولاذ السبائك','إضافة عناصر مثل Cr وNi وW وMn لخصائص محددة.']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   ${cardsHTML(items,'four')}
   <div class="panel" style="padding:10px 18px;gap:6px"><div style="font-size:20px;font-weight:800;color:var(--gold)">مستوى الشوائب والكربون</div>
    <div style="display:flex;align-items:center;gap:8px;direction:rtl"><span style="font-size:18px;font-weight:700">أعلى</span><i style="flex:1;height:14px;border-radius:7px;background:linear-gradient(270deg,#e24b3a,#e8c23b,#4cbf6a,#3e8fe0)"></i><span style="font-size:18px;font-weight:700">أقل</span></div></div>
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">أيّ مرحلة تحوّل الحديد الصبّ الهشّ إلى فولاذ؟</div>
    ${optsHTML([{t:'نفخ الأكسجين في المحوّل (عملية الأكسجين الأساسية)'},{t:'تسخين الحجر الجيري في الفرن العالي'},{t:'إضافة خام جديد إلى الحمولة'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الرحلة: خام ← <b>اختزال</b> في الفرن العالي ← <b>أكسدة الشوائب</b> في المحوّل ← <b>سبائك</b> بخصائص مضبوطة.</div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الأكسجين يحرق الكربون الزائد والشوائب ويحوّل الحديد الصبّ إلى فولاذ'},{t:'',why:'هذا يحدث في الفرن العالي، حيث يتكوّن الحديد الصبّ نفسه'},{t:'',why:'الخام يدخل الفرن العالي ولا علاقة له بتحويل الحديد إلى فولاذ'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>عرضك (الشريحة ١٤ «رحلة التنقية: من الخام الهش إلى السبيكة الهندسية»): المرحلة ١ خام الحديد، ٢ الحديد الصب (الفرن العالي)، ٣ الفولاذ النقي (محوّل الأكسجين)، ٤ الفولاذ المخصص (السبائك)، مع تدرّج في «مستوى الشوائب والكربون». هذه شريحة تلخيص.</li><li>«الفولاذ المخصص» في عرضك: فولاذ السبائك. وفي عرضك الشريحة الأخيرة (الإرث والحاضر): جسر آيرون بريدج (١٧٨١) والحديد ٩٠٪ من الفلزات؛ وردتا في شريحة العنوان.</li></ul>'});
