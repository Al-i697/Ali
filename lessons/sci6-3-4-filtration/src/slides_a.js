/* ---------- Grade 6 science 3-4 «الترشيح», part A: the opening (goals, prior knowledge, lead-in) and the lesson (the filter paper, how to fold it) ----------
   The order is the teacher's own handwritten plan: التعلّم القبلي ← أستطيع أن ← التمهيد ← سير الدرس. */

/* 1 the cover and «أستطيع أن» */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['أصف كيف يمكن فصل المواد غير القابلة للذوبان في الماء.','أستكشف كيف تعمل ورقة الترشيح مثل الغربال.'];
  return `<div class="row" style="flex:1;gap:30px;align-items:center">
   <div class="vstack" style="flex:1.35;gap:14px;align-items:flex-start">
    <span class="tagc dk">الصف السادس · العلوم · الوحدة الثالثة: تغيّرات المادة</span>
    <div style="font-size:30px;font-weight:800;color:var(--cyan)">الموضوع ٣-٤</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:104px;line-height:1;font-weight:800">ال<span style="color:var(--gold)">ترشيح</span></h1>
    <p class="lead" style="margin:0">كيف نفصل المواد غير القابلة للذوبان عن الماء؟</p>
    <div class="cloud" style="margin:12px 0 22px;font-size:32px;padding:14px 40px">أستطيع أن…</div>
    <div class="gl" style="width:100%">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
    <div class="row" style="gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap"><span style="font-size:24px;font-weight:800">مفردات التعلّم:</span><span class="tagc">الترشيح</span><span class="tagc">المرشِّح</span><span class="tagc">الأرض الرطبة</span></div>
   </div>
   <div class="figbox" style="flex:.8;gap:0"><div style="height:330px">${ART.dallah()}</div><div style="height:230px;margin-top:-22px">${ART.setup()}</div></div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>«أستطيع أن» الأول من خطتك المكتوبة، والثاني من ناتج التعلّم ٦Cc٤ في دليل المعلم (يستكشف كيف يمكن فصل المواد الصلبة بالترشيح الذي يشبه الغربلة). اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>مفردات التعلّم من كتاب الطالب ص٦٠: الترشيح، المرشِّح، الأرض الرطبة.</li><li>الرسوم كلها من رسمنا (من عندي)، وليست من الكتاب.</li></ul>'});

/* 2 prior knowledge */
slide({id:'prior',ch:0,title:'نتذكّر: ما المخلوط المعلّق؟',
 html:function(){
  var M=[['sand','رمل + ماء'],['coffee','قهوة + ماء'],['flour','دقيق + ماء']];
  return `<div class="row" style="flex:1;gap:26px;align-items:center">
   <div class="vstack" style="flex:1;gap:18px;align-items:center">
    ${S6.cloud('ما المخلوط المعلّق؟','big2')}
    <div class="row" style="gap:18px;margin-top:34px;justify-content:center">${M.map(function(m){return '<div class="figbox" style="width:190px"><div style="height:200px">'+ART.mix(m[0])+'</div><div class="cap">'+m[1]+'</div></div>'}).join('')}</div>
   </div>
   <div class="vstack" style="flex:1;gap:20px">
    <div class="pt">${S6.nbox('المخلوط المعلّق يتكوّن من <b>مادة غير قابلة للذوبان</b> + <b>سائل</b>','key')}</div>
    <div class="pt">${S6.sticky('المادة الصلبة لا تذوب، فتبقى ظاهرة ومعلّقة في الماء.<br>هل نستطيع فصلها عن الماء؟ هذا ما نتعلمه اليوم!')}</div>
   </div></div>`;},
 note:'<ul><li>التعلّم القبلي من خطتك: «ما هو المحلول المعلّق؟» والإجابة «مادة غير قابلة للذوبان + سائل». كتبت «المخلوط المعلّق» في الشريحة لأن الكتاب يستخدم كلمة «مخلوط»، ولأن الدرس القادم (٣-٥) يعرّف «المحلول» بأنه مادة ذائبة في سائل، فتجنّباً لالتباس الطلبة بين الكلمتين. إن أردت كلمتك الأصلية غيّر الكلمة في العنوان والسحابة.</li><li>اضغط مرتين: الإجابة ثم السؤال الذي يقود إلى الدرس.</li></ul>'});

/* 3 the lead-in */
slide({id:'hook',ch:0,title:'تمهيد: كيف نصفّي القهوة بعد غليها؟',
 html:function(){
  return `<div class="row" style="flex:1;gap:22px;align-items:stretch">
   <div class="vstack" style="flex:.9;align-items:center;gap:6px"><div style="height:300px">${ART.dallah()}</div>${S6.cloud('كيف نصفّي القهوة بعد غليها؟')}</div>
   <div class="vstack hpt" style="flex:.9;align-items:center;gap:6px"><div style="height:210px">${ART.sieve()}</div><div class="nbox key" style="text-align:center">بالغربال</div></div>
   <div class="vstack" style="flex:1.35;align-items:center;gap:6px">
    <div class="hpt">${S6.cloud('ماذا لو كانت جزيئات القهوة صغيرة جداً وتمرّ من فتحات الغربال؟','med')}</div>
    <div class="hpt figbox" style="margin-top:8px"><div style="height:170px">${ART.setup()}</div><div class="nbox key" style="text-align:center">نستخدم ورقة الترشيح</div></div>
   </div></div>`;},
 note:'<ul><li>التمهيد من خطتك: كيف تُصفّى القهوة بعد غليها؟ ← بالغربال ← وماذا لو كانت الجزيئات أصغر من فتحاته؟ ← نستخدم ورقة الترشيح. اضغط ثلاث مرات.</li><li>كتاب الطالب ص٦٠ يشبّه المرشّح بالغربال: «يعمل المرشّح مثل الغربال».</li></ul>'});

/* 4 the filter paper and filtration */
slide({id:'paper',ch:1,title:'ورقة الترشيح والترشيح',
 html:function(){
  return `<div class="row" style="flex:1;gap:26px;align-items:center">
   <div class="figbox" style="flex:.95"><div style="height:330px">${ART.pores()}</div><div class="cap">الورقة وهي مكبّرة جداً<small>الجزيئات الصغيرة تمرّ، والكبيرة تبقى فوقها</small></div></div>
   <div class="vstack" style="flex:1.25;gap:16px">
    <div class="ppt">${S6.nbox('ورقة الترشيح: ورقة فيها <b>ثقوب صغيرة جداً</b> تسمح بمرور <b>الجزيئات الصغيرة فقط</b> من خلالها في عملية تسمى <b>الترشيح</b>')}</div>
    <div class="ppt">${dfcHTML({sm:true,t:'الترشيح',en:'Filtration',h:'طريقة تُستخدم لفصل المخاليط المكوّنة من مادة صلبة ومادة سائلة.'})}</div>
    <div class="ppt">${S6.sticky('المرشِّح يعمل مثل الغربال: يمرّ السائل والمواد الذائبة، وتبقى المواد غير القابلة للذوبان.')}</div>
   </div></div>`;},
 note:'<ul><li>الجملة الأولى من خطتك المكتوبة؛ بطاقة التعريف بكلام كتاب الطالب ص٦٠ («الترشيح طريقة تُستخدم لفصل المخاليط المكوّنة من مادة صلبة ومادة سائلة»)، وجملة «مثل الغربال» أيضاً منه. وعبارتك «طريقة لفصل المواد غير القابلة للذوبان عن المادة السائلة» تكمّل التعريف: يمكنك قولها شفهياً.</li><li>الرسم المتحرّك: النقاط الزرقاء الصغيرة (الماء) تعبر الثقوب، والكرات البنية الكبيرة لا تعبر.</li></ul>'});

/* 5 how to fold the filter paper */
slide({id:'fold',ch:1,title:'كيف نجهّز ورقة الترشيح؟',
 html:function(){
  var T=['ورقة الترشيح دائرية','اطوِها إلى نصفين','اطوِها مرة أخرى إلى نصفين','افتحها لتصير مخروطاً: ٣ طبقات من جهة وطبقة من الجهة الأخرى','ضعها في القمع وبلّلها بالماء لتلتصق'];
  return `<div class="col grow" style="gap:20px;justify-content:center"><div class="row" style="gap:16px;justify-content:center">${T.map(function(t,i){return '<div class="fs figbox" style="flex:1;max-width:222px;gap:10px"><div style="height:176px">'+ART.fold(i+1)+'</div><span class="tagc dk">'+ar(i+1)+'</span><div class="cap" style="font-size:23px;line-height:1.4">'+t+'</div></div>'}).join('')}</div>
   <div class="row" style="justify-content:center">${S6.sticky('بلّل الورقة قبل الصبّ: التبليل يجعلها تلتصق بالقمع فلا يتسرّب الماء من حولها.')}</div></div>`;},
 note:'<ul><li>من دليل المعلم ص٨١–٨٢ (ملاحظات حول الأنشطة العملية، نشاط ٣-٤): ورقة الترشيح تكون دائرية ← اطوِها إلى نصفين ثم إلى نصفين ← افتحها بشكل مخروط (ثلاث طبقات على جانب وطبقة على الجانب الآخر) ← بلّلها قبل وضعها في القمع ← ضعها داخل القمع لتدعمها.</li><li>اضغط خمس مرات، خطوة خطوة، وقد تطلب من طالب أن يطبّق على ورقة حقيقية.</li><li>الرسوم من رسمنا (من عندي).</li></ul>'});
