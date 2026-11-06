/* ---------- lesson 2-2, part A: goals, the opening, the roadmap, and the blast furnace itself ---------- */
/* The template frames (title, roadmap, charge, anatomy) are the text-less pictures the teacher sent: the picture fills the stage and the live text sits in its empty boxes. */

/* 1 goals (teacher's guide p.40: goals 7-3 and 7-4, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var E=['C + O2 → CO2','C + CO2 → 2CO','Fe2O3 + 3CO → 2Fe + 3CO2','CaCO3 → CaO + CO2','CaO + SiO2 → CaSiO3'];
  var G=[['٧-٣','يصف ويشرح التفاعلات الأساسيّة في استخراج الحديد من الهيماتيت في الفرن العالي (فرن الصهر) وما تتضمّنه هذه العمليّة من إزالة الشوائب الحمضيّة كالخبث:'],
         ['٧-٤','يصف كيف تتغيّر خصائص الحديد عن طريق التحكم باستخدام الموادّ المضافة لتكوين سبائك الفولاذ، كالفولاذ العاديّ والفولاذ المقاوم للصدأ.']];
  var C=['أكتب معادلات الفرن العالي وأحدد مكان كل منها.','أشرح كيف يُزال الرمل ويتكوّن الخبث.','أبيّن كيف نحوّل الحديد الصب إلى فولاذ وكيف تغيّر الإضافات خصائصه.'];
  return `<div class="frm brk" style="flex:1;padding:20px 30px 18px;justify-content:center;gap:9px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الموضوع ٢-٢ · حصتان</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;line-height:1.1">إنتاج <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">الحديد والفولاذ</span></h1>
    <p style="font-size:21px;font-weight:700;line-height:1.3;margin:2px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:7px">
     <button type="button" class="gi" style="font-size:19px;line-height:1.45"><span class="ck" style="width:30px;height:30px;font-size:18px">✓</span><span><b style="color:var(--gold)">${G[0][0]}</b> ${G[0][1]}<span style="display:flex;gap:6px 18px;flex-wrap:wrap;margin-top:5px;font-size:19px;direction:ltr;justify-content:flex-end">${E.map(function(e){return '<span style="background:rgba(255,255,255,.12);padding:1px 10px;border-radius:9px">'+eqn(e)+'</span>'}).join('')}</span></span></button>
     <button type="button" class="gi" style="font-size:19px;line-height:1.45"><span class="ck" style="width:30px;height:30px;font-size:18px">✓</span><span><b style="color:var(--gold)">${G[1][0]}</b> ${G[1][1]}</span></button></div>
    <p style="font-size:20px;font-weight:800;color:var(--cyan);margin:4px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr 1fr;gap:6px 14px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:18px;line-height:1.35"><span class="ck" style="width:28px;height:28px;font-size:17px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الهدفان ٧-٣ و٧-٤ منقولان بنصهما من دليل المعلم (ص٤٠). موارد الموضوع: حصتان؛ كتاب الطالب الأسئلة ٢-٩ إلى ٢-١٤؛ كتاب النشاط: ورقة العمل ٢-١ «الفرن العالي»؛ أسئلة نهاية الوحدة: ٢ (أ، ج) و٣ و٦. الواجب كما في الدليل (السؤال ٦ غير موجود في كتاب الطالب: انظر README).</li><li>معايير النجاح الثلاثة صياغتي وليست من الدليل. الأهداف مأخوذة من الصفحة نفسها بالمعادلات الخمس كما كُتبت فيها.</li><li>عرضك المرجعي «من الصخر إلى الصلب»: الإطار والصور من القوالب التي أرسلتها، والنصوص كتبتُها حيّة فوقها.</li></ul>'});

/* 2 the opening: title frame + the hook question */
slide({id:'title',ch:0,bare:true,title:'من الصخر إلى الصلب',
 html:function(){
  var inner=tb(96,214,1088,292,`<div style="display:flex;flex-direction:column;gap:6px;width:100%;align-items:center" id="q">
     <div style="font-size:21px;font-weight:800;color:#8fd8ff">الدرس ٢-٢ · حصتان</div>
     <h1 style="margin:0;font-size:58px;font-weight:800;line-height:1.1;color:#ffd24a">من الصخر إلى الصلب</h1>
     <div style="font-size:26px;font-weight:700;line-height:1.3">الهندسة الكيميائية لاستخلاص الحديد وإنتاج الفولاذ</div>
     <div style="font-size:22px;font-weight:800;line-height:1.35;margin-top:6px;color:#fff">حوالي ٩٠٪ من الفلزات المستخدمة في العالم هي حديد. ما السبب الأرجح؟</div>
     ${optsHTML([{t:'خاماته وفيرة، واستخلاصه رخيص، وهو قوي'},{t:'يوجد في الطبيعة فلزاً منفرداً جاهزاً للاستخدام'},{t:'هو أخف الفلزات وزناً'}])}
     <div class="fb" style="min-height:26px"></div></div>`,'d','padding:10px 22px');
  return frame('title_forge',inner);},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: خامات الحديد وفيرة والكربون الرخيص يختزلها، لكنه يحتاج إلى معالجة ليصبح فولاذاً'},{t:'',why:'الحديد نشيط نسبياً فيوجد في خاماته (مثل الهيماتيت Fe₂O₃) لا منفرداً؛ المنفرد هو الذهب والفضة'},{t:'',why:'الحديد من الفلزات الكثيفة (الثقيلة)، وقوته هي ميزته'}],$('.fb',el)) },
 note:'<ul><li>كتاب الطالب ص٣٩: «يشكّل الحديد حوالي ٩٠٪ من جميع الفلزات المستخدمة»، وجسر آيرون بريدج (شروبشاير) الذي افتُتح عام ١٧٨١ أول جسر من الحديد الصب في العالم (الصورة ٢-٣). كتاب النشاط (تمرين ٢-١، جواب «أ»): الحديد وفير وقوي وكثافته عالية ورخيص واستخلاصه سهل.</li><li>الإطار من قالب أرسلته (خطّ الصهر والعارضة الفولاذية)؛ العنوان والسؤال كتبتُهما فوقه.</li></ul>'});

/* 3 the roadmap: four stations (the picture is mirrored so that the journey reads from the right, as Arabic does) */
slide({id:'roadmap',ch:0,bare:true,title:'رحلة الحديد',
 html:function(){
  var S=[['الخامات','صخور الهيماتيت <span class="num">Fe₂O₃</span> وفحم الكوك والحجر الجيري.'],
         ['الاستخلاص','الفرن العالي: يُختزل الأكسيد إلى حديد (الحديد الصب).'],
         ['التنقية','محوّل الأكسجين الأساسي: نزع الكربون والشوائب.'],
         ['التحصين','سبائك الفولاذ: إضافات تعطي خصائص محددة.']];
  var cx=[1090,788,490,188], inner=tb(250,34,780,84,'<div style="font-size:40px;font-weight:800">رحلة الحديد: من الصخر إلى الصلب</div><div style="font-size:21px;font-weight:700;color:#8fd8ff">اضغط على كل محطة</div>','d');
  S.forEach(function(s,i){ inner+=tb(cx[i]-136,526,272,150,'<b style="font-size:27px">'+ar(i+1)+'. '+s[0]+'</b><span class="rx hide" style="font-size:19px;line-height:1.4">'+s[1]+'</span><span class="veil">اضغط لتظهر</span>','l','','class="hot" data-i="'+i+'"') });
  inner+=tb(150,672,980,40,'مواد خام ← فرن عالٍ ← محوّل أكسجين ← سبائك: كل محطة تقرّبنا من الفولاذ','d','font-size:21px;border-radius:10px','id="gb" class="hide"');
  return frame('roadmap4',inner,{flip:1});},
 init:function(el){
  var n=0; $$('.tb[data-i]',el).forEach(function(b){ b.classList.add('hot'); b.addEventListener('click',function(){ if(b.classList.contains('on')) return; b.classList.add('on'); $('.rx',b).classList.remove('hide'); $('.veil',b).classList.add('hide'); n++; if(n===4){ var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } }) });
 },
 note:'<ul><li>من عرضك المرجعي «من الصخر إلى الصلب» (الشريحة ٢): الخامات ← الاستخلاص ← التنقية ← التحصين. الصورة قالب أرسلتَه بلا نصوص؛ عكستُها أفقياً ليكون ترتيب المحطات من اليمين إلى اليسار كقراءة العربية (الصورة خالية من الكتابة فلا تتأثر).</li><li>في عرضك: «الحديد الغفل (الصب)»؛ اعتمدتُ تسمية كتاب الطالب ص٤١: «الحديد الصَّبّ Pig Iron».</li></ul>'});

/* 4 the charge: three bulbs into a funnel */
slide({id:'charge',ch:1,bare:true,title:'الحمولة: ماذا يدخل الفرن؟',
 html:function(){
  var B=[['Fe2O3','خام الحديد (الهيماتيت)','مصدر الحديد: أكسيد الحديد (III) <span class="num">Fe₂O₃</span> يُختزل فيصبح حديداً.',1046],
         ['C','فحم الكوك (كربون)','وقود يحترق فيعطي الحرارة، ثم يتحوّل إلى <span class="num">CO</span> العامل المختزِل.',640],
         ['CaCO3','الحجر الجيري','يتفكك بالحرارة إلى <span class="num">CaO</span> الذي يزيل الرمل <span class="num">SiO₂</span> على هيئة خبث.',232]];
  var inner=tb(330,26,620,64,'<div style="font-size:34px;font-weight:800">الحمولة: ماذا يدخل الفرن؟</div>','d');
  B.forEach(function(b,i){
   inner+=tb(b[3]-62,228,124,124,'<span style="font-size:'+(b[0]==='C'?'60':'34')+'px;font-weight:800;color:#fff;line-height:1">'+eqn(b[0])+'</span>','d','border-radius:50%;padding:0');
   inner+=tb(b[3]-168,392,336,150,'<b style="font-size:25px">'+b[1]+'</b><span class="rx hide" style="font-size:19px;line-height:1.4">'+b[2]+'</span><span class="veil">اضغط لتعرف دوره</span>','l','','data-i="'+i+'"');
  });
  inner+=tb(790,570,450,96,'<span id="cn" style="font-size:21px;line-height:1.4">تدخل الحمولة من <b>أعلى</b> الفرن، ويُنفخ الهواء الساخن من <b>أسفله</b>.</span>','d','border-radius:14px');
  return frame('funnel3',inner);},
 init:function(el){
  var n=0; $$('.tb[data-i]',el).forEach(function(b){ b.classList.add('hot'); b.addEventListener('click',function(){ if(b.classList.contains('on')) return; b.classList.add('on'); $('.rx',b).classList.remove('hide'); $('.veil',b).classList.add('hide'); n++; if(n===3){ $('#cn',el).innerHTML='ثلاث مواد: <b>خام</b> للحديد، و<b>وقود</b> للحرارة وCO، و<b>حجر جيري</b> لإزالة الرمل.' } }) });
 },
 note:'<ul><li>كتاب الطالب ص٣٩–٤٠: يُستخدم في الفرن العالي خام الحديد وفحم الكوك والحجر الجيري والهواء الساخن. الخام الرئيسي: الهيماتيت (سؤال ٢-٩). عرضك (الشريحة «مكوّنات الحمولة»): خام الحديد، فحم الكوك، الحجر الجيري.</li><li>الإطار قالب أرسلتَه (ثلاث كرات زجاجية تصبّ في قمع)، والنصوص حيّة فوقه.</li></ul>'});

/* 5 anatomy of the blast furnace */
slide({id:'anatomy',ch:1,bare:true,title:'تشريح الفرن العالي',
 html:function(){
  var P=[['الحمولة','خليط من خام الحديد وفحم الكوك والحجر الجيري يُلقى من أعلى الفرن باستمرار.',640,128],
         ['الغازات العادمة الساخنة','تخرج من أعلى الفرن وتمرّ في مبادلات حرارية لتسخين الهواء الداخل إلى الفرن.',712,72],
         ['جدران الفرن','برج فولاذي مبطّن بطوب مقاوم للحرارة (أكسيد الماغنيسيوم) ومبرَّد بالماء.',574,330],
         ['ارتفاع الفرن','نحو ٣٠ متراً: تزداد الحرارة كلما نزلت المواد، حتى نحو ١٩٠٠ °C عند القاعدة.',416,350],
         ['الهواء الساخن','يُنفخ بقوة عند قاعدة الفرن عبر فتحات ليحرق فحم الكوك.',472,452],
         ['الخبث','بقايا الخام المنصهرة (سيليكات الكالسيوم)؛ كثافتها أقل فتطفو على الحديد وتُسحب من فتحة منفصلة.',500,512],
         ['الحديد المنصهر','يتجمع في قاع الفرن لأن كثافته أعلى، ويُسحب من فتحة خاصة: هذا هو الحديد الصب.',790,512]];
  var inner=tb(30,36,372,70,'<div style="font-size:30px;font-weight:800">أجزاء الفرن العالي</div>','d');
  P.forEach(function(p,i){
   inner+=tb(30,122+i*68,372,58,'<b style="font-size:23px">'+ar(i+1)+'. '+p[0]+'</b>','l','','data-i="'+i+'" class="hot"');
   inner+=bdg(p[2],p[3],ar(i+1),'data-i="'+i+'"');
  });
  inner+=tb(880,122,372,310,'<b id="dt" style="font-size:26px;color:#8a1f10">اضغط على رقم أو على اسم</b><span id="dx" style="font-size:21px;line-height:1.5">لنتعرف على أجزاء الفرن العالي واحداً بعد الآخر.</span>','l');
  inner+=tb(150,656,980,46,'الفرن العالي: حمولة من الأعلى، هواء ساخن من الأسفل، وحديد وخبث من الأسفل أيضاً.','d','font-size:21px;border-radius:10px','id="gb" class="hide"');
  return frame('furnace',inner);},
 init:function(el){
  var seen={}, P=el.__P;
  var D=[['الحمولة','خليط من خام الحديد وفحم الكوك والحجر الجيري يُلقى من أعلى الفرن باستمرار.'],
         ['الغازات العادمة الساخنة','تخرج من أعلى الفرن وتمرّ في مبادلات حرارية لتسخين الهواء الداخل إلى الفرن.'],
         ['جدران الفرن','برج فولاذي مبطّن بطوب مقاوم للحرارة (أكسيد الماغنيسيوم) ومبرَّد بالماء.'],
         ['ارتفاع الفرن','نحو ٣٠ متراً: تزداد الحرارة كلما نزلت المواد، حتى نحو ١٩٠٠ °C عند القاعدة.'],
         ['الهواء الساخن','يُنفخ بقوة عند قاعدة الفرن عبر فتحات ليحرق فحم الكوك.'],
         ['الخبث','بقايا الخام المنصهرة (سيليكات الكالسيوم)؛ كثافتها أقل فتطفو على الحديد وتُسحب من فتحة منفصلة.'],
         ['الحديد المنصهر','يتجمع في قاع الفرن لأن كثافته أعلى، ويُسحب من فتحة خاصة: هذا هو الحديد الصب.']];
  function pick(i){
   $$('.bdg',el).forEach(function(b){b.classList.toggle('sel',+b.getAttribute('data-i')===i)});
   $$('.tb.hot',el).forEach(function(b){b.classList.toggle('on',+b.getAttribute('data-i')===i)});
   $('#dt',el).textContent=D[i][0]; $('#dx',el).textContent=D[i][1]; seen[i]=1;
   $$('.bdg',el)[i].classList.add('seen');
   if(Object.keys(seen).length===7){ var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') }
  }
  $$('.bdg,.tb.hot',el).forEach(function(b){ b.addEventListener('click',function(){ pick(+b.getAttribute('data-i')) }) });
 },
 note:'<ul><li>كتاب الطالب ص٤٠ (الصورة ٢-٤ وصندوق «الفرن العالي»): برج فولاذي ارتفاعه نحو ٣٠ م، مبطّن بطوب أكسيد الماغنيسيوم؛ يُدخل الهواء الساخن بقوة من الأسفل عبر فتحات؛ الغازات العادمة الساخنة تسخّن الهواء الداخل (مبادلات حرارية)؛ الحديد المنصهر والخبث يخرجان من فتحتين منفصلتين؛ والعملية متواصلة. يُسمّى في بعض المراجع «فرن الصهر» أو «الفرن اللافح».</li><li>النقطة ٤ (الارتفاع ٣٠ م) من عرضك المرجعي (الشريحة ٣)، وهي من كتاب الطالب أيضاً. وهذه الشريحة تمهيد لورقة العمل ٢-١ (A إلى G) في الفصل الخامس.</li><li>الصورة قالب أرسلتَه بلا نصوص؛ الأرقام والنصوص حيّة. مواضع الفتحتين: اليسار للخبث (الدكن) واليمين للحديد (المتوهّج) كما في صورتك.</li></ul>'});

/* 6 saving energy and materials */
slide({id:'heat',ch:1,title:'الاستدامة: كيف نوفّر الطاقة والمواد؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['المبادلات الحرارية','الغازات العادمة الساخنة لا تُهدَر: تمرّ في مبادلات حرارية وتسخّن الهواء الداخل إلى الفرن، فتقلّ تكاليف الطاقة.'],
             ['خردة الفولاذ','عند صناعة الفولاذ تُضاف خردة الفولاذ إلى الحديد الصب المنصهر فتذوب وتمتزج به: نعيد تدوير المادة ونوفّر الخام.'],
             ['عملية متواصلة','يعمل الفرن بلا توقف؛ تُضاف الحمولة من الأعلى وتُسحب المنتجات من الأسفل.']];
  var svg='<svg class="hx" viewBox="0 0 640 400" aria-hidden="true" style="direction:ltr;display:block;width:100%;max-height:290px">'+
   '<defs><marker id="ar1" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" refX="12" refY="12" orient="auto"><path d="M0 0L24 12L0 24z" fill="#ff7a5a"/></marker><marker id="ar2" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" refX="12" refY="12" orient="auto"><path d="M0 0L24 12L0 24z" fill="#ffb347"/></marker><marker id="ar3" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" refX="12" refY="12" orient="auto"><path d="M0 0L24 12L0 24z" fill="#7fd0ff"/></marker></defs>'+
   '<path d="M100 96L180 96L208 330L72 330Z" fill="#5a4034" stroke="#d6e3f0" stroke-width="4"/>'+
   '<path d="M118 330C108 290 128 262 140 232C152 262 172 290 162 330Z" fill="#ff8a2a"/><path d="M128 330C124 306 136 288 140 270C144 288 156 306 152 330Z" fill="#ffe27a"/>'+
   '<rect x="86" y="330" width="108" height="16" rx="4" fill="#44546a"/>'+
   '<path class="flow" d="M140 92V34H398" fill="none" stroke="#ff7a5a" stroke-width="8" marker-end="url(#ar1)"/>'+
   '<rect x="402" y="8" width="176" height="116" rx="14" fill="#274a73" stroke="#8fd8ff" stroke-width="3"/>'+
   '<path d="M420 40h140M420 66h140M420 92h140" stroke="#8fd8ff" stroke-width="3" stroke-dasharray="3 7" opacity=".6"/>'+
   '<path class="flow" d="M636 96H582" fill="none" stroke="#7fd0ff" stroke-width="8" marker-end="url(#ar3)"/>'+
   '<path class="flow" d="M490 128V300H210" fill="none" stroke="#ffb347" stroke-width="8" marker-end="url(#ar2)"/>'+
   '<g font-family="Cairo,sans-serif" font-weight="800" font-size="19" fill="#fff" stroke="rgba(0,0,0,.75)" stroke-width="3.5" paint-order="stroke" text-anchor="middle">'+
   '<text x="490" y="72" font-size="21">مبادل حراري</text><text x="270" y="22">غازات عادمة ساخنة</text><text x="598" y="148">هواء بارد</text><text x="560" y="222">هواء ساخن</text><text x="140" y="376">الفرن العالي</text></g></svg>';
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:10px 16px;align-items:center">${svg}</div>
    <div style="display:flex;align-items:center;gap:16px;justify-content:center">${cut('ladle_scrap',92,null,'')}<div style="font-size:19px;font-weight:700;line-height:1.4;max-width:330px">قطع الخردة تُصبّ عليها حديد منصهر في المحوّل</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الطاقة تُسترد من <b>الغازات العادمة</b>، والمادة من <b>الخردة</b>.</div></div>
   <div class="col" style="width:470px;flex:none;gap:10px;justify-content:center">${cardsHTML(items,'')}</div></div>`;},
 init:function(el){ bindCards(el,function(){ unhide(el) }) },
 note:'<ul><li>كتاب الطالب ص٤٠–٤١: الغازات العادمة الساخنة تُستخدم في مبادلات حرارية لتسخين الهواء الداخل إلى الفرن العالي فتقلّ تكاليف الطاقة، واستخلاص الحديد عملية متواصلة. ص٤١ المرحلة (أ): تُضاف مخلّفات (خردة) الفولاذ إلى الحديد الصب المنصهر لإعادة تدويرها. جواب سؤال ٢-١٤ في الدليل: الغازات الساخنة تسخّن الهواء الداخل؛ وإضافة خردة الفولاذ إلى الحديد المنصهر.</li><li>سؤال امتحان ٢٠٢٣/٢٠٢٤ الدور الثاني س١٨ (كيف يمكن الاستفادة من الغازات المنبعثة؟): «تُستخدم كمحوّلات (مبادلات) حرارية لتسخين الهواء الداخل إلى الفرن العالي». عرضك المرجعي (شريحة «الاستدامة واسترداد الطاقة») يعرض دورة الغازات والمبادل والهواء.</li><li>صورة القدر مع الخردة من صورك (بخلفية شفافة حقيقية).</li></ul>'});
