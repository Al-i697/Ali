/* ---------- part B: the formative group activity «Science Coffee» (the teacher's plan) and the questions of the book's activity 3-4 ---------- */

/* 6 the activity: materials and steps */
slide({id:'labA',ch:2,title:'نشاط تكويني (جماعي): Science Coffee',
 html:function(){
  var MAT=['محلول معلّق (ماء + قهوة)','كؤوس','قمع','ورق ترشيح','ورقة عمل'];
  var ST=['نحضّر المخلوط: نضع ١٠٠ mL ماء وملعقة صغيرة من القهوة في كأس ونحرّك.','نضع ورقة الترشيح في القمع فوق كأس آخر.','نصبّ المخلوط في القمع ونراقب.','نكتب في ورقة العمل: ماذا نزل في الكأس؟ ماذا بقي على الورقة؟'];
  return `<div class="row" style="flex:1;gap:26px;align-items:center">
   <div class="vstack" style="flex:1.3;gap:10px">
    <div style="font-size:26px;font-weight:800;color:var(--cyan)">المواد والأدوات</div>
    <div class="row" style="gap:10px;flex-wrap:wrap">${MAT.map(function(m){return '<span class="pill" style="min-height:42px;font-size:21px;padding:0 14px">'+m+'</span>'}).join('')}</div>
    <div style="font-size:26px;font-weight:800;color:var(--cyan);margin-top:2px">الإجراءات</div>
    ${ST.map(function(t,i){return '<div class="stp" style="font-size:23px;padding:7px 16px;gap:12px"><i>'+ar(i+1)+'</i><span>'+t+'</span></div>'}).join('')}
   </div>
   <div class="figbox" style="flex:.8;position:relative"><div style="height:360px">${ART.setup()}</div>
    <span class="tagc" style="position:absolute;top:18px;inset-inline-start:0">مخلوط</span>
    <span class="tagc dk" style="position:absolute;top:96px;inset-inline-start:0">ورقة ترشيح</span>
    <span class="tagc dk" style="position:absolute;top:176px;inset-inline-start:0">قمع</span>
    <span class="tagc" style="position:absolute;bottom:18px;inset-inline-start:0">كأس</span></div></div>`;},
 note:'<ul><li>النشاط التكويني الجماعي من خطتك (Science Coffee): المواد: محلول معلّق (ماء + قهوة)، كؤوس، قمع، ورق ترشيح، ورقة عمل. الإجراءات والرسم من خطتك أيضاً. هذا النشاط <b>من خطتك وليس من الكتاب</b>؛ أما نشاط الكتاب ٣-٤ (رمل، دقيق، طباشير) فنجرّبه في الشريحة التالية وتجد أسئلته بعد ذلك.</li><li>الإجراءات تتبع صياغة الكتاب: ١٠٠ مل ماء في كأس، ملعقة صغيرة من المادة الصلبة، تحريك، ثم قمع وورقة ترشيح لكل مخلوط في كأس آخر.</li><li>اطبع صفحة «ورقة عمل Science Coffee» من فهرس الدرس (أو اطلب من الطلبة الكتابة في دفاترهم).</li></ul>'});

/* 7 the virtual lab */
slide({id:'labB',ch:2,title:'نجرّب الترشيح: ماذا يبقى؟ وماذا يمرّ؟',
 html:function(){ return S6.flabHTML(['coffee','sand','flour','chalk','salt']) },
 init:function(el){ S6.bindFlab(el,['coffee','sand','flour','chalk','salt']) },
 note:'<ul><li>مختبر افتراضي يشغّل نشاطك (القهوة) ونشاط الكتاب (الرمل والدقيق والطباشير)، وأضفنا الملح لأنه جسر للنشاط الختامي. اختر المخلوط، ودع الطلبة يتوقّعون (يبقى شيء على الورقة أو يمرّ كله)، ثم اضغط «اسكب».</li><li>ماء القهوة بعد الترشيح يخرج <b>بنّياً</b> لأن جزءاً من القهوة يذوب في الماء ويمرّ؛ الذي يبقى هو حبيبات القهوة الصلبة فقط. وهذا يربطنا بسؤال «تحدّث عن» أكياس الشاي، وبالدرس القادم (المحاليل).</li><li>الدقيق والطباشير والرمل مواد صلبة غير قابلة للذوبان: تبقى على الورقة. الملح يذوب فيمرّ مع الماء: لا يفصله الترشيح وحده.</li></ul>'});

/* 8 the observations, the explanation and the conclusion */
slide({id:'obs',ch:2,title:'ماذا لاحظنا؟ ولماذا؟',
 html:function(){
  return `<div class="row" style="flex:1;gap:26px;align-items:center">
   <div class="vstack" style="flex:1.5;gap:12px">
    <div class="opt2">${S6.nbox('<b>الملاحظات</b><br>١ · الماء نزل في الكأس.<br>٢ · القهوة (المادة الصلبة) ترسّبت على ورقة الترشيح.','m')}</div>
    <div class="opt2">${S6.nbox('<b>التفسير: ما السبب؟</b><br>جزيئات الماء صغيرة فمرّت من ثقوب الورقة، أما جزيئات القهوة فكبيرة فلم تستطع المرور فبقيت على الورقة.','m')}</div>
    <div class="opt2">${S6.nbox('<b>الاستنتاج</b><br>الترشيح يفصل <b>المادة الصلبة غير القابلة للذوبان</b> عن السائل.','key m')}</div>
   </div>
   <div class="figbox" style="flex:.7"><div style="height:360px">${ART.pores()}</div></div></div>`;},
 note:'<ul><li>من خطتك: الملاحظات (١) الماء ينزل في الكأس (٢) ترسّب القهوة في ورقة الترشيح؛ ثم «التفسير؟ السبب؟»؛ ثم «الاستنتاج». اطلب من الطلبة أن يجيبوا قبل أن تضغط.</li><li>التفسير بكلام كتاب الطالب ودليل المعلم: جزيئات الماء الصغيرة تمرّ من ثقوب الورقة، والمادة الصلبة غير القابلة للذوبان لا تمرّ لأن جزيئاتها كبيرة.</li></ul>'});

/* 9 the book's questions 1 and 2 */
slide({id:'q12',ch:2,title:'أسئلة نشاط الكتاب: السؤالان الأول والثاني',
 html:function(){
  var Q=[['ماذا وجدتَ على ورقة الترشيح بعد فصل كل مخلوط؟','المادة الصلبة.'],['ما المواد التي مرّت عبر ورقة الترشيح إلى الكؤوس الزجاجية؟ لماذا حدث ذلك؟','الماء هو الذي مرّ من خلال ورقة الترشيح؛ لأن جزيئات الماء صغيرة بما يكفي لتمرّ من ثقوب ورقة الترشيح.']];
  return `<div class="col grow" style="gap:20px;justify-content:center">${Q.map(function(q,i){return '<div class="row" style="gap:20px;align-items:stretch"><div class="panel" style="flex:1.1;display:flex;gap:16px;align-items:center"><span class="tagc" style="flex:none;width:46px;justify-content:center;padding:0">'+ar(i+1)+'</span><span style="font-size:33px;font-weight:800;line-height:1.45">'+q[0]+'</span></div><div class="qa-a" style="flex:1;display:flex">'+S6.nbox(q[1],'key')+'</div></div>'}).join('')}</div>`;},
 note:'<ul><li>سؤالان من نشاط ٣-٤ (كتاب الطالب ص٦١). الإجابات من دليل المعلم ص٨٢: (١) المادة الصلبة. (٢) الماء الذي يمرّ من خلال ورقة الترشيح؛ جزيئات الماء صغيرة بما يكفي لتمرّ من خلال ثقوب ورقة الترشيح.</li><li>اطلب الإجابة من الطلبة ثم اضغط لتظهر.</li></ul>'});

/* 10 the book's questions 3 and 4 */
slide({id:'q34',ch:2,title:'أسئلة نشاط الكتاب: السؤالان الثالث والرابع',
 html:function(){
  var Q=[['هل يمكنك فصل المواد الصلبة عن السوائل في أحد المحاليل عن طريق الترشيح؟ ولماذا؟','لا؛ لأن جزيئات المادة الصلبة تذوب وتصبح جزءاً من السائل.'],['تنبّأ بنتيجة ترشيح مخلوط من الدقيق والماء. ما سبب تنبّؤك؟','يبقى الدقيق في ورقة الترشيح؛ لأنه مادة غير قابلة للذوبان، ولا يمرّ عبر ثقوب ورقة الترشيح لأن جزيئاته كبيرة.']];
  return `<div class="col grow" style="gap:20px;justify-content:center">${Q.map(function(q,i){return '<div class="row" style="gap:20px;align-items:stretch"><div class="panel" style="flex:1.1;display:flex;gap:16px;align-items:center"><span class="tagc" style="flex:none;width:46px;justify-content:center;padding:0">'+ar(i+3)+'</span><span style="font-size:31px;font-weight:800;line-height:1.45">'+q[0]+'</span></div><div class="qa-a" style="flex:1;display:flex">'+S6.nbox(q[1],'key')+'</div></div>'}).join('')}</div>`;},
 note:'<ul><li>السؤالان ٣ و٤ من نشاط ٣-٤ (كتاب الطالب ص٦١) وإجاباتهما من دليل المعلم ص٨٢. جرّب الملح والدقيق في المختبر الافتراضي لتؤكّد الإجابتين أمام الطلبة.</li></ul>'});
