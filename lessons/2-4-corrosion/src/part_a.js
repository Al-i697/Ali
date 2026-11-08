/* ---------- lesson 2-4, part A: goals, the opening, corrosion and rust, what rust is, the conditions for rusting ---------- */

/* 1 goals (teacher's guide p.42: goals 7-6 to 7-11, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٧-٦','يذكر الظروف التي تؤدّي إلى صدأ الحديد (كالتعرّض للأكسجين والماء).'],
         ['٧-٧','يصف طرق منع الصدأ ويشرحها، ومنها الطلاء واستخدام الموادّ العازلة الأخرى.'],
         ['٧-٨','يصف الحماية المهبطية بأقطاب التضحية ويشرحها في ضوء سلسلة نشاط الفلزّات والجلفنة باعتبارها طريقة للوقاية من الصدأ.'],
         ['٧-٩','يشرح استخدامات الخارصين في جلفنة الفولاذ وفي صناعة النحاس الأصفر.'],
         ['٧-١٠','يصف استخدامات الألومنيوم في: أجزاء الطائرات بسبب قوّته وكثافته المنخفضة؛ حاويات الغذاء بسبب مقاومته للتآكل.'],
         ['٧-١١','يصف الخمول الظاهريّ للألومنيوم ودور طبقة الأكسيد الملتصقة على سطح الفلزّ.']];
  var C=['أذكر الشرطين اللازمين للصدأ وأفسّر ما يسرّعه.','أشرح الطلاء والجلفنة وقطب التضحية وأقارن بينها.','أفسّر لماذا لا يتآكل الألومنيوم رغم نشاطه.'];
  return `<div class="frm brk" style="flex:1;padding:18px 30px 16px;justify-content:center;gap:8px">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">الموضوع ٢-٤ · ثلاث حصص</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:52px;font-weight:800;line-height:1.1">تآكل <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">الفلزات</span> وحمايتها</h1>
    <p style="font-size:20px;font-weight:700;line-height:1.3;margin:2px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:5px">${G.map(function(g){return '<button type="button" class="gi" style="font-size:18px;line-height:1.4"><span class="ck" style="width:28px;height:28px;font-size:17px">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:19px;font-weight:800;color:var(--cyan);margin:2px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr 1fr;gap:5px 12px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:17px;line-height:1.35"><span class="ck" style="width:26px;height:26px;font-size:16px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف ٧-٦ إلى ٧-١١ منقولة بنصها من دليل المعلم (ص٤٢). موارد الموضوع: ثلاث حصص؛ النشاط ٢-٣ (منع الصدأ)؛ كتاب الطالب الأسئلة ٢-٢٠ إلى ٢-٢٤؛ أسئلة نهاية الوحدة: السؤال ٥؛ كتاب النشاط: ورقة العمل ٢-٢ «الصدأ».</li><li>الهدفان ٧-٩ و٧-١٠ مذكوران في الدليل مع الموضوعين ٢-٣ و٢-٤ معاً (تكرار في الدليل)؛ غطّيتُهما هنا: الخارصين في الجلفنة (الشريحتان ٩ و١٠)، والألومنيوم في الطائرات والحاويات (الشريحة ١٦). وأما «النحاس الأصفر» فمكانه الدرس ٢-٣ (السبائك).</li><li>معايير النجاح الثلاثة صياغتي وليست من الدليل.</li></ul>'});

/* 2 the opening: why do metals decay? */
slide({id:'hook',ch:0,title:'لماذا تتلف بعض الفلزات؟',tag:'تمهيد',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:14px;justify-content:center">
    <div class="panel" style="padding:16px 22px;gap:10px"><div style="font-size:23px;font-weight:800;color:var(--cyan)">من واقع حياتنا</div>
     <div style="font-size:22px;line-height:1.55">سيارة قديمة، وجسر حديدي، وأنبوب في البحر… كلها تتحوّل مع الزمن إلى مادة <b>بنية محمرّة</b> متقشّرة.</div>
     <div style="font-size:20px;line-height:1.5;color:#ffd9a8">وتُنفق مبالغ طائلة كل سنة في استبدال هياكل الحديد والفولاذ التالفة أو في حمايتها.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px;padding:10px 18px">الحديد يتفاعل مع ما حوله فيتلف: نسمّي ذلك <b>تآكلاً</b>، وفي الحديد والفولاذ نسمّيه <b>صدأً</b>.</div></div>
   <div class="col" style="width:470px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:14px 18px;gap:9px"><div style="font-size:23px;font-weight:800;line-height:1.35">ما سبب تحوّل الحديد إلى هذه المادة المتقشّرة برأيك؟</div>
     ${optsHTML([{t:'يتفاعل الحديد مع مواد في محيطه فتتكوّن مادة جديدة'},{t:'يتبخّر الحديد مع مرور الزمن'},{t:'يذوب الحديد في الهواء الجاف'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الحديد يتفاعل مع الأكسجين والماء فتتكوّن مادة جديدة هي الصدأ'},{t:'',why:'الحديد لا يتبخّر: هو يتغيّر كيميائياً فتتكوّن مادة جديدة'},{t:'',why:'الهواء الجاف وحده لا يصدّئ الحديد، وهو لا يذوب فيه'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>عرضك (شريحة التمهيد): «هل تساءلت يوماً عن سبب تلف بعض المعادن كما في الصور المقابلة؟» (سيارة قديمة وجسر وأنبوب). لم أضع صورك لأنها ليست من الصور التي أرسلتها لي، ووضعتُ مكانها وصفاً ثم سؤالاً.</li><li>كتاب الطالب ص٤٥: «تنفق مبالغ طائلة من المال سنوياً سواء في استبدال هياكل حديدية وفولاذية تالفة أو في حمايتها من التلف». الخلفية صورة المنصة البحرية من صورك السابقة.</li></ul>'});

/* 3 corrosion or rust? */
slide({id:'terms',ch:0,title:'التآكل والصدأ: ما الفرق؟',tag:'اختر لكل عبارة',
 html:function(){
  var items=[['تلف أي فلز بتفاعله مع الماء أو الهواء أو الحمض المحيط به','c','التآكل مفهوم أعمّ: يشمل أي فلز يتلف بتفاعله مع ما حوله'],
             ['مسمار حديدي صار لونه بنياً محمرّاً بعد تركه في الماء والهواء','r','هذا صدأ: تلف الحديد بتكوّن أكسيد الحديد (III) المائي'],
             ['تلف هيكل سفينة فولاذية بسبب ماء البحر','r','الفولاذ سبيكة من الحديد: تلفه يسمّى صدأً'],
             ['تلف صفيحة من فلز غير الحديد بفعل حمض محيط بها','c','تآكل، لكن لا نسمّيه صدأً لأن الفلز ليس حديداً'],
             ['المادة البنية المحمرّة <span class="num">Fe₂O₃·xH₂O</span>','r','هذه صيغة الصدأ: أكسيد الحديد (III) المائي']];
  return `<div class="col" style="flex:1;gap:7px;min-height:0;justify-content:center">${clsHTML(items,[['r','صدأ'],['c','تآكل فقط']],21)}
   <div class="fb" style="min-height:26px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px"><b>الصدأ</b> هو تآكل الحديد والفولاذ فقط. وكل <b>صدأ</b> تآكل، وليس كل تآكل صدأً.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: هل الفلز المذكور هو الحديد أو الفولاذ؟') },
 note:'<ul><li>كتاب الطالب ص٤٥: «قد تتلف وتتهالك بعض الفلزات نتيجة تفاعلها مع الماء أو الهواء أو الحمض المحيط بها، ويقال إنها تآكلت Corrode. وتُعرف هذه العملية في حالة فلزّي الحديد وسبيكة الفولاذ بالصدأ Rusting». وصندوق «تذكّر» ص٤٨: الصدأ هو تآكل الحديد والفولاذ؛ ومن الخطأ الإشارة إلى تآكل الفلزات الأخرى بالصدأ لأن الصدأ هو أكسيد الحديد (III) المائي.</li><li>الدليل (المفاهيم الخاطئة): قد يظن الطلاب أن التآكل يحدث لجميع الفلزات، وغالباً يشيرون إلى الصدأ عند وصف تآكل أي فلز؛ ويُوضَّح بالفرق بين الحديد والألومنيوم (شريحة ١٥).</li><li>عرضك وعرض NotebookLM (شريحة «الفرق بين التآكل والصدأ»): الجدول نفسه.</li></ul>'});

/* 4 what rust is */
slide({id:'rust',ch:1,title:'ما الصدأ؟ وكيف يتكوّن؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['المادة','الصدأ مادة <b>بنية محمرّة</b> تتكوّن أساساً من <b>أكسيد الحديد (III) المائي</b>.'],
             ['الصيغة','<span class="num" style="font-size:25px">Fe₂O₃·xH₂O</span><br>ترمز <span class="num">xH₂O</span> إلى الماء المرتبط بالأكسيد.'],
             ['كيف يتكوّن؟','يتأكسد الحديد أولاً إلى أيون الحديد (II) <span class="num">Fe²⁺</span>، ثم يتأكسد بشكل أكبر إلى أيون الحديد (III) <span class="num">Fe³⁺</span> الموجود في الصيغة.']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   ${cardsHTML(items,'three')}
   <div class="panel" style="padding:12px 18px;flex-direction:row;align-items:center;justify-content:center;gap:12px;direction:rtl"><span class="chip" style="font-size:25px;padding:6px 16px">${eqn('Fe')}</span><b style="font-size:30px">←</b><span class="chip" style="font-size:25px;padding:6px 16px">${eqn('Fe^2+')}</span><b style="font-size:30px">←</b><span class="chip" style="font-size:25px;padding:6px 16px">${eqn('Fe^3+')}</span><b style="font-size:30px">←</b><span class="chip" style="font-size:25px;padding:6px 16px;background:#8f3e1d">${eqn('Fe2O3.xH2O')}</span></div>
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">ما الاسم الكيميائي للصدأ؟</div>
    ${optsHTML([{t:'أكسيد الحديد (III) المائي'},{t:'كلوريد الحديد (II)'},{t:'هيدروكسيد الصوديوم'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الحديد <b>يتأكسد</b> بالأكسجين والماء، والناتج صدأ <span class="num">Fe₂O₃·xH₂O</span>.</div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: أكسيد الحديد (III) المائي <span class="num">Fe₂O₃·xH₂O</span>'},{t:'',why:'الحديد (II) هو الأيون الأول فقط؛ الصدأ فيه حديد (III) وأكسجين وماء'},{t:'',why:'الصدأ لا يحتوي على الصوديوم'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٤٥: «والصدأ مادة ذات لون بني محمرّ تتكوّن بشكل أساسي من أكسيد الحديد (III) المائي <span class="num">(Fe₂O₃.xH₂O)</span>. يحدث الصدأ بأن يتأكسد الحديد في البداية ليكوّن أيون الحديد (II) <span class="num">Fe²⁺</span>، الذي يتأكسد بشكل أكبر ليكوّن أيون الحديد (III) <span class="num">Fe³⁺</span>، الموجود في الصيغة الكيميائية <span class="num">Fe₂O₃.xH₂O</span>». سؤال ٢-٢١ وجوابه في الدليل: <span class="num">Fe₂O₃.xH₂O</span>.</li><li>تعارض بسيط: الملخص المدرسي يكتب الصيغة <span class="num">Fe₂O₃.H₂O</span> بلا <span class="num">x</span>؛ اعتمدتُ كتاب الطالب والدليل: <span class="num">Fe₂O₃.xH₂O</span>.</li></ul>'});

/* 5 Fig 2-5: what does rusting need? predict, then wait a week */
slide({id:'tubes',ch:1,title:'تجربة: ما الذي يلزم لحدوث الصدأ؟',tag:'توقّع ثم اضغط «مرّ أسبوع»',
 html:function(){
  var B=[[0,'لا يصدأ'],[1,'يصدأ'],[2,'يصدأ كثيراً']];
  var T=[{svg:tubeSVG({id:'f1',lq:'w'}),t:'الأنبوبة ١ (ضابطة)',d:'هواء + ماء مقطّر',btns:B},
         {svg:tubeSVG({id:'f2',lq:'n',dry:1,nail:[40,166]}),t:'الأنبوبة ٢',d:'هواء جاف + كلوريد الكالسيوم (عامل تجفيف)',btns:B},
         {svg:tubeSVG({id:'f3',lq:'o',top:82,nail:[44,196]}),t:'الأنبوبة ٣',d:'ماء مغلي (بلا هواء ذائب) + طبقة زيت',btns:B},
         {svg:tubeSVG({id:'f4',lq:'w',o2:1}),t:'الأنبوبة ٤',d:'أكسجين نقي + ماء مغلي',btns:B}];
  return `<div class="col" style="flex:1;gap:8px;min-height:0">${tubeCols(T,'')}
   <div style="display:flex;justify-content:center"><button type="button" class="btn acc" id="wk">مرّ أسبوع ▸</button></div>
   <div class="panel compact hide" id="q" style="padding:10px 18px;gap:7px"><div style="font-size:21px;font-weight:800">ما الشرطان اللازمان معاً لصدأ الحديد؟</div>
    ${optsHTML([{t:'الأكسجين (الهواء) والماء'},{t:'الأكسجين والزيت'},{t:'الماء وكلوريد الكالسيوم'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الحديد يصدأ عند تعرّضه للأكسجين <b>و</b>الماء معاً؛ ولا يكفي أحدهما.</div></div>`;},
 init:function(el){
  var ANS=[1,0,0,2], MSG=['تصدأ: يوجد هواء (أكسجين) وماء','لا تصدأ: لا يوجد ماء','لا تصدأ: لا يوجد أكسجين ذائب، والزيت يمنع وصوله','صدئة جداً: أكسجين نقي وماء'], pred={}, cols=$$('.tcol',el);
  cols.forEach(function(c,i){ $$('.pb',c).forEach(function(b){ b.addEventListener('click',function(){ if(c.classList.contains('done')) return; $$('.pb',c).forEach(function(x){x.classList.remove('sel')}); b.classList.add('sel'); pred[i]=+b.getAttribute('data-v'); }) }) });
  $('#wk',el).addEventListener('click',function(){
   if(Object.keys(pred).length<4){ $('#wk',el).classList.add('shake'); later(function(){$('#wk',el).classList.remove('shake')},340); return }
   $('#wk',el).classList.add('hide');
   cols.forEach(function(c,i){ c.classList.add('done','r'+ANS[i],pred[i]===ANS[i]?'hit':'miss'); var m=$('.tm',c); m.textContent=(pred[i]===ANS[i]?'✓ ':'✗ ')+MSG[i]; if(pred[i]!==ANS[i]) m.classList.add('no') });
   later(function(){ $('#q',el).classList.remove('hide') },900);
  });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: نحتاج الأكسجين والماء معاً (الأنبوبتان ٢ و٣ حُجب فيهما أحدهما)'},{t:'',why:'الزيت يمنع الصدأ ولا يسببه'},{t:'',why:'كلوريد الكالسيوم يجفّف فيمنع الصدأ'}],$('#q .fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٤٥ الشكل ٢-٥: الأنبوبة ١ (ضابطة): هواء + ماء مقطّر: يصدأ. الأنبوبة ٢: هواء جاف + كلوريد الكالسيوم (عامل تجفيف) وقطن: لا تصدأ. الأنبوبة ٣: ماء مغلي (أُزيل الهواء الذائب) + طبقة زيت: لا تصدأ. الأنبوبة ٤: أكسجين نقي + ماء مغلي: صدئة جداً. الاستنتاج: يحتاج الحديد إلى الأكسجين والماء معاً. جواب سؤال ٢-٢٠ في الدليل.</li><li>الدليل (ص٤٣): يوجّه المعلم الطلاب إلى استقصاء الطرق المستخدمة لمنع الصدأ. هذه الشريحة تمهيد افتراضي للنشاط ٢-٣.</li><li>تعارض مع العروض: عرضك وعرض NotebookLM يكتبان أن الصدأ ينتج عن «الماء <b>أو</b> الهواء <b>أو</b> الأحماض» (في جدول التآكل والصدأ). الكتاب والدليل ونماذج الامتحانات: الأكسجين <b>و</b>الماء معاً شرطان، والملح والحمض يسرّعان فقط. اتبعتُ الكتاب.</li></ul>'});

/* 6 what speeds rusting up */
slide({id:'speed',ch:1,title:'ما الذي يسرّع الصدأ؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['ماء البحر المالح','وجود الملح (ماء البحر) يزيد سرعة الصدأ كثيراً: انظر حطام سفينة تايتانيك الصدئة جداً.'],
             ['المطر الحمضي','المطر الحمضي يزيد من معدّل سرعة صدأ الأجسام الحديدية.'],
             ['الأكسجين والماء معاً','لا صدأ بلا هذين الشرطين معاً. الملح والحمض يسرّعان فقط ولا يغنيان عنهما.']];
  return `<div class="col" style="flex:1;gap:14px;justify-content:center;min-height:0">
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">أيّ هذه المسامير الحديدية يصدأ أسرع؟</div>
    ${optsHTML([{t:'مسمار في ماء البحر المالح'},{t:'مسمار في ماء مقطّر'},{t:'مسمار في هواء جاف'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الملح والحمض <b>يسرّعان</b> الصدأ؛ أما <b>سببه</b> فالأكسجين والماء.</div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الماء المالح يسرّع الصدأ'},{t:'',why:'الماء المقطّر يصدّئ، لكن أبطأ من الماء المالح'},{t:'',why:'في الهواء الجاف لا ماء، فلا يصدأ المسمار'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٤٥: «وتتفاقم المشكلة وتصبح أسوأ بوجود الملح؛ حيث يزيد ماء البحر من معدّل سرعة التآكل. وتُظهر الصور المُلتقطة من قاع البحر لحطام سفينة التايتانيك الصدئة كمّية ضخمة من الصدأ (الصورة ٢-٦). كذلك يزيد المطر الحمضي من مُعدّل سرعة صدأ الأجسام الحديدية». ورقة العمل ٢-٢ (الأنبوبة D ملحية) في الشريحة التالية.</li></ul>'});

/* 7 worksheet 2-2, the table of the tubes A to D (activity book p.34) */
slide({id:'ws22a',ch:1,title:'ورقة العمل ٢-٢: أيّ الأنابيب يصدأ؟',tag:'اختر لكل أنبوبة',
 html:function(){
  var B=[[1,'يصدأ'],[0,'لا يصدأ']];
  var T=[{svg:tubeSVG({id:'w1',lq:'w'}),t:'الأنبوبة A',d:'ماء مقطّر',btns:B,ans:1},
         {svg:tubeSVG({id:'w2',lq:'o',top:82,nail:[44,196]}),t:'الأنبوبة B',d:'ماء مغلي ومبرَّد + طبقة زيت',btns:B,ans:0},
         {svg:tubeSVG({id:'w3',lq:'n',dry:1,nail:[40,166]}),t:'الأنبوبة C',d:'قطن + كلوريد الكالسيوم (هواء جاف)',btns:B,ans:0},
         {svg:tubeSVG({id:'w4',lq:'s'}),t:'الأنبوبة D',d:'محلول ملحي',btns:B,ans:1}];
  return `<div class="col" style="flex:1;gap:8px;min-height:0">${tubeCols(T,'pick')}<div class="fb" style="min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">يصدأ المسمار في <b>A</b> و<b>D</b> (ماء وهواء)؛ ولا يصدأ في <b>B</b> (لا أكسجين) ولا في <b>C</b> (لا ماء).</div></div>`;},
 init:function(el){
  var A=[1,0,0,1], R=[1,0,0,2], OK=['يصدأ: يوجد ماء وهواء (أكسجين)','لا يصدأ: لا أكسجين (الماء مغلي) والزيت يمنع وصوله','لا يصدأ: لا ماء (كلوريد الكالسيوم يجفّف الهواء)','يصدأ، وبسرعة أكبر: الماء المالح يسرّع الصدأ'], NO=['في الأنبوبة هواء وماء معاً','الماء مغلي (أُزيل هواؤه) وعليه طبقة زيت','الهواء جاف: كلوريد الكالسيوم يمتص الماء','فيها ماء وهواء، والملح يزيد الأمر سوءاً'], left=4;
  $$('.tcol',el).forEach(function(c,i){ $$('.pb',c).forEach(function(b){ b.addEventListener('click',function(){
    if(c.classList.contains('done')) return;
    if(+b.getAttribute('data-v')===A[i]){ b.classList.add('ok-b'); c.classList.add('done','hit','r'+R[i]); $('.tm',c).textContent='✓ '+OK[i]; left--; if(!left) unhide(el) }
    else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); $('.tm',c).textContent='✗ '+NO[i]; $('.tm',c).classList.add('no') } }) }) });
 },
 note:'<ul><li>كتاب النشاط ورقة العمل ٢-٢ (ص٣٤): أربع أنابيب (A ماء مقطّر، B ماء مغلي مبرَّد وفوقه زيت، C كلوريد الكالسيوم وقطن، D محلول ملحي) ومسامير فولاذية؛ املأ الجدول: يصدأ / لا يصدأ ولماذا. إجابات الدليل: يصدأ في A وD؛ B لا يوجد أكسجين (لقد تم إطلاقه من الماء المغلي)؛ C لا يوجد ماء (عامل التجفيف كلوريد الكالسيوم يزيل أي ماء موجود).</li><li>الأسئلة الأربعة اللاحقة من الورقة في شريحتي ١٩ و٢٠.</li></ul>'});
