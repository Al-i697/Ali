/* ---------- lesson 2-3, part A: goals, the opening, what an alloy is, the structure of an alloy and why it is harder ---------- */

/* 1 goals (teacher's guide p.41: goals 4-4, 4-5, 4-6, 7-5, 7-9, 7-10, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٤-٤','يصف السبائك، كالنحاس الأصفر، بأنها مخاليط من أحد الفلزّات مع عناصر أخرى.'],
         ['٤-٥','يشرح أسباب استخدام مثل هذه السبائك بدلاً من الفلزّات النقية، في ضوء خصائص السبائك.'],
         ['٤-٦','يحدّد تمثيل السبائك وفقاً لمخططات تركيبها.'],
         ['٧-٥','يذكر استخدامات الفولاذ العادي (كهياكل السيّارات والآلات) والفولاذ المقاوم للصدأ (في مصانع الكيماويات وأدوات المائدة).'],
         ['٧-٩','يشرح استخدامات الخارصين في جلفنة الفولاذ وفي صناعة النحاس الأصفر.'],
         ['٧-١٠','يصف استخدامات الألومنيوم في: أجزاء الطائرات بسبب قوّته وكثافته المنخفضة؛ حاويات الغذاء بسبب مقاومته للتآكل.']];
  var C=['أعرّف السبيكة وأميّزها عن الفلز النقي من رسم ذراتها.','أفسّر لماذا تكون السبيكة أصلد وأقل قابلية للطرق.','أختار السبيكة المناسبة لكل استخدام وأذكر السبب.'];
  return `<div class="frm brk" style="flex:1;padding:18px 30px 16px;justify-content:center;gap:8px">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">الموضوع ٢-٣ · حصتان</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:56px;font-weight:800;line-height:1.1"><span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">السبائك</span></h1>
    <p style="font-size:20px;font-weight:700;line-height:1.3;margin:2px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:5px">${G.map(function(g){return '<button type="button" class="gi" style="font-size:18px;line-height:1.4"><span class="ck" style="width:28px;height:28px;font-size:17px">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:19px;font-weight:800;color:var(--cyan);margin:2px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr 1fr;gap:5px 12px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:17px;line-height:1.35"><span class="ck" style="width:26px;height:26px;font-size:16px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف ٤-٤ و٤-٥ و٤-٦ و٧-٥ و٧-٩ و٧-١٠ منقولة بنصها من دليل المعلم (ص٤١). موارد الموضوع: حصتان؛ النشاط ٢-٢ «سبائك مثيرة للاهتمام!» (إثرائي)؛ كتاب الطالب الأسئلة ٢-١٥ إلى ٢-١٩ (ص٤٥)؛ أسئلة نهاية الوحدة: السؤال ٤ (ص٥١)؛ كتاب النشاط: التمرين ٢-١ «الفلزات والسبائك» (ص٢٩–٣٠).</li><li>الهدفان ٧-٩ و٧-١٠ مذكوران في الدليل مع الموضوعين ٢-٣ و٢-٤ معاً (تكرار في الدليل): هنا النحاس الأصفر (شريحة ١٣) والألومنيوم في الطائرات (شريحة ١٥)، وفي الدرس ٢-٤ الجلفنة وطبقة الأكسيد.</li><li>معايير النجاح الثلاثة صياغتي وليست من الدليل. عرضك (شريحة الأهداف) يذكر أهدافاً أوسع قليلاً صياغتها مختلفة، وأبقيتُ نص الدليل. وفيه خطأ مطبعي: «الفلزات أكثر صلادة من الفلزات النقية» والمقصود «السبائك».</li></ul>'});

/* 2 the opening: pure metals are soft, so what do we use for bridges and aircraft? */
slide({id:'hook',ch:0,title:'الفلزات حولنا: هل هي نقيّة؟',tag:'تمهيد',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:14px;justify-content:center">
    <div class="panel" style="padding:16px 22px;gap:10px"><div style="font-size:23px;font-weight:800;color:var(--cyan)">من واقع حياتنا</div>
     <div style="font-size:22px;line-height:1.55">ملعقة في يدك، وهيكل سيارة، وجزء من طائرة، وميدالية، وحلية ذهبية اللون… كلها <b>فلزّات</b> نستعملها كل يوم، وأغلبها ليست عناصر نقيّة.</div>
     <div style="font-size:20px;line-height:1.5;color:#ffd9a8">وتذكّر من الوحدة الأولى: الفلز النقي <b>لين</b> لأن طبقات ذراته تنزلق فوق بعضها.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px;padding:10px 18px">نخلط الفلز مع عنصر آخر فنحصل على <b>سبيكة</b> أصلد وأقوى، لها خصائص جديدة مفيدة.</div></div>
   <div class="col" style="width:470px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:14px 18px;gap:9px"><div style="font-size:23px;font-weight:800;line-height:1.35">الجسور والطائرات تحتاج فلزّات أقوى من الفلز النقي. ما الحل برأيك؟</div>
     ${optsHTML([{t:'نخلط الفلز وهو منصهر مع عنصر آخر'},{t:'نترك الفلز النقي في الهواء مدة أطول'},{t:'نذيب الفلز في الماء ثم نجففه'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: خلط الفلز مع عنصر آخر يعطي سبيكة بخصائص أفضل'},{t:'',why:'ترك الفلز في الهواء قد يؤدي إلى تآكله ولا يقوّيه'},{t:'',why:'الفلزّات لا تذوب في الماء، وهذا لا يغيّر قوتها'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>الدليل (أفكار للتدريس): «اعرض الموضوع من خلال مناقشة الأنواع المختلفة من الفلزّات التي يصادفها الطالب كل يوم من الحياة اليومية، والتي لا يدركون أنها عناصر». كتاب الطالب ص٤٢: الفولاذ سبيكة أكثر الفلزّات استخداماً: «فالمتانة وقوة المقاومة للشد والتكلفة المنخفضة تجعل الفولاذ القاعدة والأساس لصناعات لا حصر لها، تتدرّج من بناء السفن إلى صناعة الساعات».</li><li>الصورة الخلفية من صورك السابقة (عيّنات فلزّات). الفقرة الأخيرة تربط بدرس ١-١ (الفلزّات لينة لأن طبقات ذراتها تنزلق).</li></ul>'});

/* 3 what is an alloy? */
slide({id:'defn',ch:0,title:'ما السبيكة؟',tag:'اضغط على كل بطاقة ثم صنّف',
 html:function(){
  var items=[['التعريف','مخلوط يتكوّن من <b>فلزَّين على الأقل</b>، أو من <b>فلز ولافلز</b>.'],
             ['لماذا نصنعها؟','لتحسين <b>الخصائص الفيزيائية</b> للفلز: الصلادة والقوة ودرجة الانصهار.'],
             ['كيف تُصنع؟','تُخلط الفلزّات وهي <b>منصهرة</b> تماماً، ثم تُترك لتبرد وتتصلّب.']];
  var rows=[['الفولاذ: حديد مع قليل من الكربون','a','فلز ولافلز: سبيكة'],
            ['قطعة نحاس نقيّ','n','عنصر واحد فقط'],
            ['النحاس الأصفر: نحاس وخارصين','a','فلزّان ممتزجان: سبيكة'],
            ['ملح الطعام '+eqn('NaCl'),'n','مركّب كيميائي وليس مخلوطاً'],
            ['البرونز: نحاس وقصدير','a','فلزّان ممتزجان: سبيكة']];
  return `<div class="col" style="flex:1;gap:8px;min-height:0;justify-content:center">
   ${cardsHTML(items,'three')}
   ${clsHTML(rows,[['a','سبيكة'],['n','ليست سبيكة']],20)}
   <div class="fb" style="min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">السبيكة <b>مخلوط</b> من عناصر فلزية يُصنع صناعياً، وليست مركّباً كيميائياً يوجد في الطبيعة.</div></div>`;},
 init:function(el){
  var cards=false,cl=false; function chk(){ if(cards&&cl) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindCls(el,$('.fb',el),function(){cl=true; chk()},'فكّر: هل هي مخلوط من فلزّين أو من فلز ولافلز؟');
 },
 note:'<ul><li>كتاب الطالب ص٤٢–٤٣ ومصطلحات الوحدة (ص٢٩ كتاب النشاط): «السبيكة Alloy: مخلوط يتكوّن على الأقل من فلزّين أو من فلز ولافلز، وذلك لتحسين الخصائص الفيزيائية». وص٤٣: «وغالباً ما ينتج عن صناعة السبائك مواد أقوى بكثير من الفلزّات الأصلية المفردة. ويتم أيضاً تعديل خصائص الفلزّات... عن طريق خلط فلزّات مُنصهرة معاً بشكل تام، ثم تركها لتبرد وتشكّل مادة صلبة». جواب سؤال ٢-١٥: مخلوط يتكوّن من فلزّين على الأقل، أو من فلز ولافلز، بهدف تحسين الخصائص الفيزيائية لفلز ما.</li><li>الدليل (المفاهيم الخاطئة): السبائك مخاليط من عناصر فلزية يتم خلطها صناعياً وليست مركّبات توجد في الطبيعة.</li></ul>'});

/* 4 the structure: pure metal against alloy, apply a force */
slide({id:'lay',ch:1,title:'تركيب السبيكة: ماذا يحدث للذرّات؟',tag:'اضغط «طبّق قوة»',
 html:function(){
  return `<div class="col" style="flex:1;gap:8px;min-height:0">
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px" id="atw">
    <div class="panel" style="padding:8px 14px;gap:4px;align-items:stretch"><div style="font-size:23px;font-weight:800;color:var(--gold)">الفلز النقي</div>${atomsSVG(0)}<div style="font-size:18px;font-weight:600;line-height:1.4">ذرّات <b>متطابقة الحجم</b> في طبقات منتظمة: تنزلق الطبقات فوق بعضها بسهولة، فيكون الفلز لينّاً.</div></div>
    <div class="panel" style="padding:8px 14px;gap:4px;align-items:stretch"><div style="font-size:23px;font-weight:800;color:var(--gold)">السبيكة</div>${atomsSVG(1)}<div style="font-size:18px;font-weight:600;line-height:1.4">ذرّات عنصر <b>مختلف الحجم</b> تُخلّ بانتظام الطبقات، فلا تنزلق بسهولة: السبيكة أصلد.</div></div></div>
   <div style="display:flex;gap:12px;justify-content:center"><button type="button" class="btn acc" id="push">طبّق قوة ▸</button><button type="button" class="btn" id="rst">أعد الذرّات</button></div>
   <div class="panel compact hide" id="q" style="padding:10px 18px;gap:7px"><div style="font-size:21px;font-weight:800">بعد تطبيق القوة: ماذا نتوقّع للسبيكة مقارنةً بالفلز النقي؟</div>
    ${optsHTML([{t:'أصلد وأقل قابلية للطرق'},{t:'ألين وأسهل في الطرق'},{t:'لا يتغيّر شيء'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">وجود ذرّات <b>مختلفة الحجم</b> يمنع انزلاق الطبقات: لذلك السبيكة أصلد وأمتن.</div></div>`;},
 init:function(el){
  var w=$('#atw',el), pushed=false;
  $('#push',el).addEventListener('click',function(){ $$('.atoms',w).forEach(function(a){a.classList.add('push')}); if(!pushed){ pushed=true; later(function(){ $('#q',el).classList.remove('hide') },1100) } });
  $('#rst',el).addEventListener('click',function(){ $$('.atoms',w).forEach(function(a){a.classList.remove('push')}) });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الطبقات لا تنزلق بسهولة فتكون السبيكة أصلد وأقل قابلية للطرق'},{t:'',why:'العكس: الفلز النقي هو الأليَن لأن طبقاته تنزلق بسهولة'},{t:'',why:'التغيّر ظاهر: إحدى الطبقتين انزلقت والأخرى علقت'}],$('.fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٤٣ والشكل ٢-٤: «تكوّن طبقات الذرّات في فلز نقي قادرة على الانزلاق فوق بعضها البعض عند تطبيق قوّة، لأنّ الذرّات تمتلك الحجم نفسه ويكون لها ترتيب شبكي منتظم. أمّا السبيكة فليست فلزّاً نقيّاً… ويؤدّي وجود ذرّات عنصر مختلف داخل شبكة الفلزّ إلى خلل في الترتيب المنتظم للذرّات. ونتيجة لذلك لا يعود ممكناً لطبقات الذرّات الفلزّية أن تنزلق بسهولة فوق بعضها عند تطبيق قوّة عليها. وهذا يُقلّل من مرونة الفلزّ، ويزيد مقاومته». وعرضك (شريحة «تركيب السبيكة وخصائصها») بالمعنى نفسه.</li><li>الرسم تخطيطي: الذرّات البرتقالية الكبيرة والداكنة الصغيرة تمثّل عناصر مختلفة الحجم. (الشريحة نفسها ظهرت في الدرس ٢-٢ ضمن هدف ٧-٤؛ هنا التوسّع فيها.)</li></ul>'});

/* 5 identify the lattice from its drawing (goal 4-6) */
slide({id:'idn',ch:1,title:'تعرّف على السبيكة من الرسم',tag:'اختر لكل شكل',
 html:function(){
  var L=[['أ','pure','p','نوع واحد من الذرّات'],['ب','big','a','ذرّات عنصر آخر أكبر حجماً'],['ج','mix','a','نوعان من الذرّات ممتزجان'],['د','sep','n','فلزّان في كتلتين منفصلتين']];
  return `<div class="col" style="flex:1;gap:8px;min-height:0">
   <div class="panel" style="padding:7px 14px;font-size:19px;font-weight:700;line-height:1.35">كل شكل يمثّل قطعة صغيرة من مادة فلزية. الذرّات الرمادية فلز، والبرتقالية عنصر آخر. صنّف كل شكل.</div>
   <div class="lcols">${L.map(function(l,i){return '<div class="lcol" data-i="'+i+'" data-a="'+l[2]+'"><div class="lv">'+latSVG(l[1])+'</div><b class="lt">الشكل '+l[0]+'</b><div class="pr"><button type="button" class="pb" data-v="p">فلز نقي</button><button type="button" class="pb" data-v="a">سبيكة</button><button type="button" class="pb" data-v="n">ليست سبيكة</button></div><div class="lm"></div></div>'}).join('')}</div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">في <b>السبيكة</b> تمتزج ذرّات عنصرين أو أكثر في شبكة واحدة؛ وفي الفلز النقي نوع واحد من الذرّات.</div></div>`;},
 init:function(el){
  var M={p:'فلز نقي: كل الذرّات من نوع واحد',a:'سبيكة: ذرّات عنصر آخر ممتزجة في الشبكة',n:'ليست سبيكة: فلزّان متجاوران لم يمتزجا'}, left=4;
  $$('.lcol',el).forEach(function(c){
    var m=$('.lm',c);
    $$('.pb',c).forEach(function(b){b.addEventListener('click',function(){
      if(c.classList.contains('done')) return;
      if(b.getAttribute('data-v')===c.getAttribute('data-a')){ b.classList.add('ok-b'); c.classList.add('done'); m.textContent='✓ '+M[c.getAttribute('data-a')]; left--; if(!left) unhide(el) }
      else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); m.style.color='#ffc3b8'; m.textContent='فكّر: كم نوعاً من الذرّات في الشكل؟ وهل هي ممتزجة؟' }
    })});
  });
 },
 note:'<ul><li>الهدف ٤-٦ (يحدّد تمثيل السبائك وفقاً لمخططات تركيبها) والشكل ٢-٤ ص٤٣. الأشكال رسمتُها بنفسي على نمط أسئلة الامتحانات (السؤال ٤ أ ١ نهاية الوحدة؛ ٢٠٢٤/٢٠٢٥ الدور الثاني س١٤؛ ٢٠٢٣/٢٠٢٤ الدور الثاني س١١): اختيار الرسم الذي يمثّل سبيكة. أ: فلز نقي. ب: سبيكة بذرّات أكبر حجماً (كالشكل ٢-٤ ب في الكتاب). ج: سبيكة بنوعين متقاربين في الحجم (كالنحاس والخارصين في النحاس الأصفر). د: كتلتان منفصلتان من فلزّين: ليست سبيكة لأن الذرّات لم تمتزج.</li></ul>'});

/* 6 why is the alloy harder and less malleable? */
slide({id:'why',ch:1,title:'لماذا السبيكة أصلد وأقل قابلية للطرق؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['١. ذرّات مختلفة','تدخل ذرّات عنصر آخر <b>مختلفة الحجم</b> إلى شبكة الفلز.'],
             ['٢. خلل في الترتيب','يختلّ الترتيب <b>المنتظم</b> للذرّات في الطبقات.'],
             ['٣. لا انزلاق','لا تنزلق الطبقات فوق بعضها بسهولة عند تطبيق قوة.'],
             ['٤. النتيجة','سبيكة <b>أصلد وأمتن</b>، وأقل قابلية للطرق من الفلز النقي.']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   ${cardsHTML(items,'four')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800;line-height:1.35">لماذا يُصنع الجسر من الفولاذ (سبيكة) لا من الحديد النقي؟</div>
    ${optsHTML([{t:'لأن طبقات الفولاذ لا تنزلق بسهولة فيتحمّل الأوزان الثقيلة'},{t:'لأن الحديد النقي يتفاعل مع الفولاذ'},{t:'لأن الفولاذ مركّب كيميائي وليس مخلوطاً'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الليونة صفة مفيدة في التشكيل، لكنها غير مرغوبة حيث يجب أن يقاوم الفلز <b>ضغطاً مستمراً</b> ويحمل أوزاناً ثقيلة.</div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الطبقات لا تنزلق بسهولة فتقاوم السبيكة القوة'},{t:'',why:'الحديد النقي لا يتفاعل مع الفولاذ؛ السبب في تركيب الذرّات'},{t:'',why:'الفولاذ مخلوط (سبيكة) وليس مركّباً'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٤٣: «تُعدّ هذه الميزات (اللين وقابلية الطرق) غير مرغوبة في التطبيقات التي يجب أن تكون فيها المادة قادرة على مقاومة ضغط مستمر وتحمل أوزاناً ثقيلة، مثل جسر أو مبنى». أسئلة ٢-١٦ (قارن بين التركيب البنائي لسبيكة وفلز نقي) و٢-١٧. جواب الدليل لـ٢-١٦: الفلز النقي نوع واحد من الذرّات في طبقات منتظمة، أما السبيكة ففيها نوعان مختلفان من الذرّات بحجوم مختلفة مما يجعل ترتيب الطبقات غير منتظم.</li><li>الدليل (المفاهيم الخاطئة): قد يجد الطلاب صعوبة في التعبير عن سبب كون الفلز أقل قابلية للطرق عند إضافة كمية صغيرة من عنصر آخر؛ السلسلة ذات الأسهم أعلاه تجيب عن هذا. تمرين ٢-١ (و٤) في كتاب النشاط يطلب الشرح نفسه مع رسم.</li></ul>'});
