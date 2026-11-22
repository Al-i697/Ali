/* ---------- part C: everyday uses and the sand filter, the activity-book exercise 3-4, the closing individual activity (salt and sand) ---------- */

/* 11 everyday uses */
slide({id:'apps',ch:3,title:'تطبيقات الترشيح من الحياة اليومية',
 html:function(){
  var A=[['ap_mask','50% 45%','الكمامة','تعمل كمرشّح: يمرّ الهواء ويُمنع مرور الجراثيم عبر فتحاتها.'],
         ['ap_dripper','50% 35%','القهوة المقطّرة','ورقة الترشيح في آلة القهوة تُمرّر الماء وتحتفظ بحبيبات القهوة.'],
         ['ap_flamingo','50% 28%','منقار الفلامنجو','فيه مرشّحات تلتقط الطحالب والأسماك الصغيرة عن طريق ترشيح الماء.'],
         ['ap_tea','50% 62%','أكياس الشاي','تحتجز الأوراق (لا تذوب) وتترك اللون والنكهة (ذائبان) في الماء.']];
  return `<div class="row" style="flex:1;gap:18px;align-items:stretch">${A.map(function(a,i){return '<div class="acard panel" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 12px 14px"><div class="phwrap" style="width:100%">'+S6.pic(a[0],'','width:100%;height:344px;box-shadow:none',a[1])+'<span class="tagc dk" style="top:-10px;inset-inline-start:-6px">'+ar(i+1)+'</span></div><div style="font-size:29px;font-weight:800;color:var(--gold)">'+a[2]+'</div><p style="font-size:23px;line-height:1.4;font-weight:600;text-align:center;margin:0">'+a[3]+'</p></div>'}).join('')}</div>`;},
 note:'<ul><li>التطبيقات الأربعة من خطتك: الكمامة، القهوة المقطّرة، منقار الفلامنجو، أكياس الشاي. اضغط أربع مرات.</li><li>القهوة وورقة الترشيح: كتاب الطالب ص٦٠. الفلامنجو: ص٦١. الشاي: «تحدّث عن» ص٦١، وإجابته في دليل المعلم ص٨٢ (المواد القابلة للذوبان تعطي الشاي لونه ونكهته، وأوراق الشاي غير قابلة للذوبان وكبيرة فلا تمرّ عبر ثقوب الكيس). الكمامة: من أفكار الدرس في الدليل ص٨٠.</li><li>اسأل: «كيف يترك كيس الشاي لونه ونكهته في الماء بينما يحتجز أوراقه؟»</li><li>الصور الأربع من الصور التي أرسلتها أنت.</li></ul>'});

/* 12 the sand filter and the wetlands */
slide({id:'sand',ch:3,title:'مرشّح الرمل والأرض الرطبة',
 html:function(){
  var L=[['st_beaker_mix','ماء غير نقي','يدخل المرشّح وفيه جزيئات'],['st_sand','رمل ناعم','يرشّح الجزيئات الصغيرة جداً'],['st_gravel','رمل خشن','يزيل الحبيبات الصغيرة'],['st_stones','حصى','يحتجز الجزيئات الكبيرة'],['st_beaker_clear','ماء أنقى','يخرج من المرشّح']];
  return `<div class="row" style="flex:1;gap:22px;align-items:center">
   <div class="figbox" style="flex:0 0 250px"><div style="height:470px">${ART.sandfilter()}</div></div>
   <div class="vstack" style="flex:1.2;gap:10px">${L.map(function(l){return '<div class="lyr panel" style="display:flex;align-items:center;gap:14px;padding:8px 16px;box-shadow:4px 4px 0 var(--edge)">'+S6.st(l[0],'','flex:none;width:48px;height:42px')+'<b style="font-size:27px;flex:none;min-width:150px">'+l[1]+'</b><span style="font-size:23px;line-height:1.35">'+l[2]+'</span></div>'}).join('')}</div>
   <div class="figbox" style="flex:.95;gap:10px">${S6.pic('wetland','','width:100%;height:176px')}<div class="cap" style="font-size:26px">الأرض الرطبة <small>الأهوار والمستنقعات تعمل مثل المرشّحات: التربة مع الحصى تنقّي الماء من جزيئات مواد ضارة (مثل المواد الكيميائية والفضلات)، فتجعل الماء أنقى.</small></div></div></div>`;},
 note:'<ul><li>كتاب الطالب ص٦٠: مرشّحات الرمل تستخدم طبقات من الحصى والرمال الناعمة لفصل جزيئات المواد الصلبة عن الماء (الرسم: رمال ناعمة ثم رمال خشنة ثم حصى). وظيفة كل طبقة من دليل المعلم ص٨٠: يحتجز الحصى الجزيئات الكبيرة، ويزيل الرمل الخشن الحبيبات الصغيرة، ويعمل الرمل الناعم على ترشيح الجزيئات الصغيرة جداً.</li><li>لم أحدّد اتجاه مرور الماء أو ترتيب مروره بالطبقات لأن الكتاب والدليل يذكران الطبقات والوظائف دون ترتيب المرور؛ اتّبع الرسم.</li><li>الأرض الرطبة (الأهوار والمستنقعات) نموذج للمرشّحات: عندما يمرّ الماء عبرها يصبح أبطأ، والتربة مع الحصى تنقّيه (كتاب الطالب ص٦٠). قد تكون بعض المواد ضارة كالمواد الكيميائية والفضلات البشرية.</li><li>اضغط خمس مرات لإظهار الطبقات من الأعلى إلى الأسفل.</li><li>أيقونات الطبقات (الرمل والحصى والكؤوس) وصورة الأرض الرطبة من الصور التي أرسلتها أنت. الأيقونات للتوضيح فقط: ترتيب الطبقات ووظائفها من الكتاب والدليل.</li></ul>'});

/* 13 activity-book exercise 3-4: name the parts */
slide({id:'ex34',ch:4,title:'تمرين ٣-٤: نسمّي أجزاء الجهاز',
 html:function(){
  var I=[{t:'ورقة ترشيح',x:'12%',y:'22.7%',tx:'12%',ty:'31.8%'},{t:'قمع ترشيح',x:'12%',y:'38.6%',tx:'12%',ty:'47.7%'},{t:'ماء غير نقي',x:'88%',y:'27.3%',tx:'88%',ty:'36.4%'},{t:'كأس زجاجية',x:'88%',y:'75%',tx:'88%',ty:'84%'},{t:'ماء نظيف',x:'12%',y:'86.4%',tx:'12%',ty:'95%'}];
  var svg=ART.svg('0 0 600 440','<path d="M150 60H450L342 190V250H308V190Z" fill="#DCEEF5" stroke="#3A2418" stroke-width="4" stroke-linejoin="round"/><path d="M170 66H430L325 180Z" fill="#FFFDF5" stroke="#3A2418" stroke-width="3" stroke-linejoin="round"/><clipPath id="exc"><path d="M170 66H430L325 180Z"/></clipPath><rect x="170" y="100" width="260" height="90" fill="#B98A55" clip-path="url(#exc)"/><path d="M170 66H430L325 180Z" fill="none" stroke="#3A2418" stroke-width="3" stroke-linejoin="round"/><path d="M315 190V250M335 190V250" stroke="#3A2418" stroke-width="4"/><path d="M325 262v14" stroke="#46B6E8" stroke-width="6" stroke-linecap="round"/><rect x="234" y="350" width="182" height="64" fill="#CDEBF7"/><path d="M222 280L232 286V400Q232 416 248 416H402Q418 416 418 400V286L428 280" fill="none" stroke="#3A2418" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g stroke="#3A2418" stroke-width="2.5" stroke-dasharray="5 6" fill="none"><path d="M72 100H216"/><path d="M72 170H284"/><path d="M528 120H380"/><path d="M528 330H418"/><path d="M72 380H260"/></g>','exsvg');
  return S6.labelHTML(svg,I,'سمِّ الأجزاء: اضغط الاسم ثم اضغط رقمه');},
 init:function(el){
  var I=[0,1,2,3,4].map(function(i){return {t:i}});
  S6.bindLabel(el,I,function(){
    var d=$('.lside',el), b=document.createElement('div'); b.className='nbox key up'; b.style.fontSize='25px'; b.style.padding='10px 20px';
    b.innerHTML='<b>أ)</b> طريقة الفصل: <b>الترشيح</b>.<br><b>ب)</b> الرمل لا يذوب وجزيئاته كبيرة فلا تمرّ من ثقوب الورقة فتبقى عليها، بينما تمرّ المواد القابلة للذوبان.';
    d.appendChild(b);
  });
 },
 note:'<ul><li>تمرين ٣-٤ في كتاب النشاط (واجب الدرس في دليل المعلم). لم يصلني نص الأسئلة بل إجاباتها في دليل المعلم ص٨٢، وهي: (١) رسم الجهاز: ورقة ترشيح، قمع ترشيح، ماء غير نقي، كأس زجاجية، ماء نظيف. (٢) أ- الترشيح. ب- المواد غير القابلة للذوبان مثل الرمل تكون كبيرة جداً فلا تتمكن من المرور عبر ثقوب ورقة الترشيح وتظل عليها، بينما تمرّ المواد القابلة للذوبان.</li><li>صياغة التمرين هنا (تسمية الأجزاء ثم السؤال) <b>من عندي</b> مبنية على تلك الإجابات؛ أرسل لي صفحة كتاب النشاط إن أردت مطابقتها حرفياً.</li></ul>'});

/* 14 the closing individual activity */
slide({id:'salt',ch:4,title:'نشاط ختامي (فردي): مخلوط الملح والرمل',
 html:function(){
  var ST=['نضيف كمية كافية من الماء إلى المخلوط ونحرّك حتى يذوب الملح تماماً.','نرشّح: يمرّ الماء مع الملح الذائب ويبقى الرمل على ورقة الترشيح.','نسخّن الماء المالح فوق مصدر حرارة لتبخير الماء.','يبقى الملح في قاع الإناء بعد تبخّر الماء.'];
  return `<div class="col grow" style="gap:12px"><div class="row" style="gap:18px;align-items:center">${S6.nbox('كيف يمكن فصل مخلوط الملح والرمل؟','key')}<span class="sticky" style="font-size:23px;padding:10px 18px">اكتب الخطوات في دفترك ثم رتّبها هنا</span></div>${S6.orderHTML(ST,[2,0,3,1],'اضغط الخطوات بالترتيب الصحيح')}</div>`;},
 init:function(el){ S6.bindOrder(el,['نضيف كمية كافية من الماء إلى المخلوط ونحرّك حتى يذوب الملح تماماً.','نرشّح: يمرّ الماء مع الملح الذائب ويبقى الرمل على ورقة الترشيح.','نسخّن الماء المالح فوق مصدر حرارة لتبخير الماء.','يبقى الملح في قاع الإناء بعد تبخّر الماء.']) },
 note:'<ul><li>النشاط الختامي الفردي من خطتك: «كيف يمكن فصل مخلوط الملح والرمل؟». هو أيضاً «التحدّي» في كتاب الطالب ص٦١ وإجابته في دليل المعلم ص٨٢: نضيف كمية كافية من الماء ونحرّك الملح والرمل حتى يذوب الملح بشكل كامل، ثم نرشّح فيمرّ الماء والملح الذائب ويبقى الرمل، وأخيراً نسخّن الماء فوق مصدر حرارة ليتبخر فيترسب الملح في قاع الإناء.</li><li>الخطوات الأربع مبعثرة عمداً: يضغط الطالب الخطوة الأولى ثم الثانية وهكذا.</li></ul>'});
