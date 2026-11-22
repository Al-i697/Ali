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
   <div class="phwrap" style="flex:.78;align-self:stretch;max-height:520px">${S6.pic('cover','','position:absolute;inset:0','30% 50%')}
    ${S6.st('st_funnel','','position:absolute;width:92px;left:-22px;bottom:-14px;transform:rotate(-8deg)')}${S6.st('st_papers','','position:absolute;width:118px;left:62px;bottom:-26px;transform:rotate(5deg)')}</div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>«أستطيع أن» الأول من خطتك المكتوبة، والثاني من ناتج التعلّم ٦Cc٤ في دليل المعلم (يستكشف كيف يمكن فصل المواد الصلبة بالترشيح الذي يشبه الغربلة). اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>مفردات التعلّم من كتاب الطالب ص٦٠: الترشيح، المرشِّح، الأرض الرطبة.</li><li>الصورة من الصور التي أرسلتها أنت (قصصنا منها الجزء المناسب)، وليست من الكتاب.</li></ul>'});

/* 2 prior knowledge */
slide({id:'prior',ch:0,title:'نتذكّر: ما المخلوط المعلّق؟',
 html:function(){
  var M=[['flour','دقيق + ماء'],['coffee','قهوة + ماء'],['sand','رمل + ماء']];   /* left to right, as in the picture */
  return `<div class="row" style="flex:1;gap:26px;align-items:center">
   <div class="vstack" style="flex:1.2;gap:14px;align-items:center">
    ${S6.cloud('ما المخلوط المعلّق؟','big2')}
    <div style="width:100%;margin-top:18px">${S6.pic('mix3','','aspect-ratio:1672/941;width:100%')}
     <div style="display:grid;grid-template-columns:repeat(3,1fr);direction:ltr;gap:10px;margin-top:12px;text-align:center">${M.map(function(m){return '<span class="tagc" style="justify-content:center;padding:0 6px;font-size:22px">'+m[1]+'</span>'}).join('')}</div></div>
   </div>
   <div class="vstack" style="flex:.95;gap:20px">
    <div class="pt">${S6.nbox('المخلوط المعلّق يتكوّن من <b>مادة غير قابلة للذوبان</b> + <b>سائل</b>','key')}</div>
    <div class="pt">${S6.sticky('المادة الصلبة لا تذوب، فتبقى ظاهرة ومعلّقة في الماء.<br>هل نستطيع فصلها عن الماء؟ هذا ما نتعلمه اليوم!')}</div>
   </div></div>`;},
 note:'<ul><li>التعلّم القبلي من خطتك: «ما هو المحلول المعلّق؟» والإجابة «مادة غير قابلة للذوبان + سائل». كتبت «المخلوط المعلّق» في الشريحة لأن الكتاب يستخدم كلمة «مخلوط»، ولأن الدرس القادم (٣-٥) يعرّف «المحلول» بأنه مادة ذائبة في سائل، فتجنّباً لالتباس الطلبة بين الكلمتين. إن أردت كلمتك الأصلية غيّر الكلمة في العنوان والسحابة.</li><li>اضغط مرتين: الإجابة ثم السؤال الذي يقود إلى الدرس.</li><li>الصورة من الصور التي أرسلتها أنت: ثلاثة كؤوس (دقيق، قهوة، رمل) مع الماء، وتحت كل كأس المادة الصلبة نفسها.</li></ul>'});

/* 3 the lead-in */
slide({id:'hook',ch:0,title:'تمهيد: كيف نصفّي القهوة بعد غليها؟',
 html:function(){
  return `<div class="row" style="flex:1;gap:22px;align-items:stretch">
   <div class="vstack" style="flex:.85;align-items:center;gap:14px">${S6.pic('hook_kettle','','width:100%;height:292px','50% 40%')}${S6.cloud('كيف نصفّي القهوة بعد غليها؟')}</div>
   <div class="vstack hpt" style="flex:.85;align-items:center;gap:14px">${S6.pic('hook_sieve','','width:100%;height:340px','50% 30%')}<div class="nbox key" style="text-align:center">بالغربال</div></div>
   <div class="vstack" style="flex:1.3;align-items:center;gap:10px">
    <div class="hpt">${S6.cloud('ماذا لو كانت جزيئات القهوة صغيرة جداً وتمرّ من فتحات الغربال؟','med')}</div>
    <div class="hpt row" style="align-items:center;gap:16px;margin-top:6px;width:100%">${S6.pic('hook_funnel','','flex:none;width:176px;height:262px','50% 30%')}<div class="nbox key" style="text-align:center;flex:1">نستخدم ورقة الترشيح</div></div>
   </div></div>`;},
 note:'<ul><li>التمهيد من خطتك: كيف تُصفّى القهوة بعد غليها؟ ← بالغربال ← وماذا لو كانت الجزيئات أصغر من فتحاته؟ ← نستخدم ورقة الترشيح. اضغط ثلاث مرات.</li><li>كتاب الطالب ص٦٠ يشبّه المرشّح بالغربال: «يعمل المرشّح مثل الغربال».</li><li>الصور الثلاث من الصور التي أرسلتها أنت (غلاية القهوة، الغربال، قمع الترشيح).</li></ul>'});

/* 4 the filter paper and filtration */
slide({id:'paper',ch:1,title:'ورقة الترشيح والترشيح',
 html:function(){
  return `<div class="row" style="flex:1;gap:26px;align-items:center">
   <div class="figbox" style="flex:1.05;gap:12px">${S6.pic('paper_xsec','','width:100%;aspect-ratio:1672/941')}<div class="cap">الورقة وهي مكبّرة جداً<small>الجزيئات الصغيرة تمرّ، والكبيرة تبقى فوقها</small></div></div>
   <div class="vstack" style="flex:1.25;gap:16px">
    <div class="ppt">${S6.nbox('ورقة الترشيح: ورقة فيها <b>ثقوب صغيرة جداً</b> تسمح بمرور <b>الجزيئات الصغيرة فقط</b> من خلالها في عملية تسمى <b>الترشيح</b>')}</div>
    <div class="ppt">${dfcHTML({sm:true,t:'الترشيح',en:'Filtration',h:'طريقة تُستخدم لفصل المخاليط المكوّنة من مادة صلبة غير قابلة للذوبان ومادة سائلة.'})}</div>
    <div class="ppt row" style="gap:16px;align-items:center">${S6.sticky('المرشِّح يعمل مثل الغربال: يمرّ السائل والمواد الذائبة، وتبقى المواد غير القابلة للذوبان.')}${S6.pic('sieve_zoom','round','flex:none;width:150px;height:157px')}</div>
   </div></div>`;},
 note:'<ul><li>الجملة الأولى من خطتك المكتوبة؛ بطاقة التعريف من كتاب الطالب ص٦٠ («الترشيح طريقة تُستخدم لفصل المخاليط المكوّنة من مادة صلبة ومادة سائلة»)، وقد <b>أضفنا «غير قابلة للذوبان» بطلبك</b> (الإضافة منك وليست حرفياً من الكتاب)، وجملة «مثل الغربال» أيضاً من الكتاب.</li><li>الصورتان من الصور التي أرسلتها أنت: مقطع مكبّر في ورقة الترشيح (قطرات الماء تمرّ وحبيبات التراب تبقى)، وغربال مكبّر (نفس الفكرة).</li></ul>'});

/* 5 how to fold the filter paper */
slide({id:'fold',ch:1,title:'كيف نجهّز ورقة الترشيح؟',
 html:function(){
  var T=['ورقة الترشيح دائرية','اطوِها إلى نصفين','اطوِها مرة أخرى إلى نصفين','افتحها مخروطاً: ٣ طبقات من جهة وطبقة من الجهة الأخرى','ضعها في القمع وبلّلها بالماء لتلتصق'];
  return `<div class="col grow" style="gap:20px;justify-content:center"><div class="row" style="gap:16px;justify-content:center;align-items:flex-start">${T.map(function(t,i){return '<div class="fs figbox" style="flex:1;max-width:222px;gap:10px;justify-content:flex-start"><div class="phwrap">'+S6.pic('fold'+(i+1),'','width:100%;height:236px','50% 60%')+'<span class="tagc dk" style="top:-14px;inset-inline-start:-8px">'+ar(i+1)+'</span></div><div class="cap" style="font-size:22px;line-height:1.4;margin-top:6px">'+t+'</div></div>'}).join('')}</div>
   <div class="row" style="justify-content:center">${S6.sticky('بلّل الورقة قبل الصبّ: التبليل يجعلها تلتصق بالقمع فلا يتسرّب الماء من حولها.')}</div></div>`;},
 note:'<ul><li>من دليل المعلم ص٨١–٨٢ (ملاحظات حول الأنشطة العملية، نشاط ٣-٤): ورقة الترشيح تكون دائرية ← اطوِها إلى نصفين ثم إلى نصفين ← افتحها بشكل مخروط (ثلاث طبقات على جانب وطبقة على الجانب الآخر) ← بلّلها قبل وضعها في القمع ← ضعها داخل القمع لتدعمها.</li><li>اضغط خمس مرات، خطوة خطوة، وقد تطلب من طالب أن يطبّق على ورقة حقيقية.</li><li>الصور من الصور التي أرسلتها أنت (ورقة دائرية ← نصفان ← ربع ← مخروط ← في القمع).</li></ul>'});
