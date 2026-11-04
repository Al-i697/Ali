/* ---------- lesson 2-1, part C: Activity 2-1, recycling, the book questions ---------- */

/* 15 Activity 2-1: the method (student book p.38) */
slide({id:'act21',ch:4,title:'نشاط ٢-١: استخلاص فلز من أكسيده باستخدام الفحم',tag:'الطريقة',
 html:function(){
  var S=['ضع مقدار ملعقة كيماويات واحدة من مسحوق أكسيد النحاس (II) في أنبوبة تسخين.','أضف بعناية ملعقة كيماويات واحدة من مسحوق الفحم إلى أكسيد النحاس (II) دون أي خلط.','سخّن هاتين الطبقتين بقوة مدة ٥ دقائق في لهب بنزن.','دع الأنبوبة تبرد، ثم انظر عن قرب إلى حيث يلتقي المسحوقان في أنبوبة الاختبار.','استخدم ماصّة قطّارة لامتصاص بعض الغاز من داخل أنبوبة الاشتعال فوق الفحم، وانفخ هذا الغاز بشكل فقّاعات عبر حوالي ٢ mL من ماء الجير في أنبوبة اختبار ثانية.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:430px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--gold)">المهارات</div><div style="font-size:17px;line-height:1.35">يبيّن بطريقة عملية معرفته بكيفية الاستخدام الآمن للتقنيات والأجهزة والمواد. ينجز التجربة ويسجّل الملاحظات والقياسات والتقديرات. يناقش الملاحظات التجريبية والبيانات ويقيّمها.</div></div>
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المواد والأدوات</div><div style="font-size:16.5px;line-height:1.35">أنابيب اختبار زجاجية صغيرة (أو أنابيب تسخين)، موقد بنزن، مسحوق الفحم، أكسيد النحاس (II)، حامل ورف أنابيب اختبار، طبق وزن، ملعقة كيماويات، ماء الجير، ماصّة، حصيرة عازلة للحرارة.</div></div>
    <div class="panel safe" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:#ffb3a8">⚠ احتياطات الأمان</div><ul style="margin:0;padding-inline-start:20px;font-size:16.5px;line-height:1.35"><li>ضع النظارة الواقية لحماية عينيك، وارتدِ معطف المختبر.</li><li>البس القفازين عند الضرورة، واغسل يديك بعد التجربة.</li><li>كن حذراً مع الأدوات الساخنة ودعها تبرد قبل التعامل معها.</li><li>أكسيد النحاس (II) يسبب تهيّجاً للجلد.</li></ul></div></div>
   <div class="panel" style="flex:1;min-width:0;padding:10px 16px;gap:4px"><div style="font-size:22px;font-weight:800;color:var(--gold)">الطريقة</div><ol class="acts">${S.map(function(s){return '<li>'+s+'</li>'}).join('')}</ol>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">ننفّذ التجربة افتراضياً في الشريحة التالية.</div></div></div>`;},
 init:function(el){ later(function(){ unhide(el) },400) },
 note:'<ul><li>نشاط ٢-١ في كتاب الطالب ص٣٨: الخطوات والمواد والأمان منقولة بتصرّف قليل. المهارات الثلاث من دليل المعلم. دليل المعلم: يقوم الطلاب باستقصاء استخلاص النحاس من أكسيد النحاس (II) باستخدام الكربون (النشاط ٢-١).</li><li>أكسيد النحاس (II) من المواد المهيّجة للجلد: يُحذَّر الطلاب عند استخدامه (من الكتاب).</li></ul>'});

/* 16 Activity 2-1: the virtual experiment */
slide({id:'lab21',ch:4,title:'نشاط ٢-١: التجربة الافتراضية',tag:'اضغط «التالي»',
 html:function(){
  var L=['أكسيد النحاس (II) أسود، ومسحوق الفحم أسود فوقه.','نسخّن بقوة: يتوهّج المسحوق عند التقاء الطبقتين.','بعد أن تبرد الأنبوبة يظهر لون وردي–بني: النحاس.','نمرّر الغاز في ماء الجير فيتعكّر (يصير حليبياً).'];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;justify-content:center;gap:8px"><div class="panel" style="padding:10px 14px">${labSVG()}</div><div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">أكسيد النحاس (II) + كربون ← نحاس + ثاني أكسيد الكربون</div></div>
   <div class="col" style="width:440px;flex:none;gap:10px;justify-content:center">
    <ul class="labsteps" id="ls">${L.map(function(t,i){return '<li data-i="'+i+'" class="'+(i?'':'on')+'">'+t+'</li>'}).join('')}</ul>
    <button type="button" class="btn acc" id="xn" style="align-self:center">التالي ◂</button>
    <div class="panel compact hide" id="q" style="padding:10px 16px;gap:8px"><div style="font-size:21px;font-weight:800">ما النواتج التي تكوّنت؟</div>
     ${optsHTML([{t:'النحاس وثاني أكسيد الكربون'},{t:'الكربون وأكسجين'},{t:'أكسيد الكربون فقط'}])}<div class="fb" style="min-height:24px"></div></div>
  </div></div>`;},
 init:function(el){
  var svg=$('#lab',el), n=0;
  $('#xn',el).addEventListener('click',function(){
    if(n>=3) return; n++;
    svg.setAttribute('class','lab s'+n);
    $$('#ls li',el).forEach(function(li,i){li.classList.toggle('on',i<=n)});
    if(n===3){ this.disabled=true; later(function(){ $('#q',el).classList.remove('hide') },1800) }
  });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: النحاس (راسب وردي–بني) وثاني أكسيد الكربون (عكّر ماء الجير)'},{t:'',why:'الكربون والأكسجين موجودان في المتفاعلات، لا النواتج'},{t:'',why:'ماء الجير تعكّر بالغاز، والنحاس تكوّن أيضاً'}],$('.fb',el),function(){unhide(el)});
 },
 note:'<ul><li>نتائج النشاط في دليل المعلم: يصبح المخلوط أسود، وعند التسخين يتوهّج، ثم يتحوّل إلى لون وردي–بني (النحاس)، ويتعكّر ماء الجير (ثاني أكسيد الكربون). الاستنتاج: النحاس والغاز الناتج ثاني أكسيد الكربون.</li><li>رسمتُ أنبوبة توصيل بين أنبوبة التسخين وأنبوبة ماء الجير للتبسيط (هكذا يظهر الجهاز في أسئلة الامتحانات: ٢٠٢٤/٢٠٢٥ الدور الأول س١٢ و٢٠٢٥/٢٠٢٦ الدور الثاني س١٥)، أما الكتاب فيسحب الغاز بماصّة قطّارة وينفخه في ماء الجير.</li></ul>'});

/* 17 Activity 2-1: results and the six questions */
(function(){
  var items=[
   {q:'<b>س١:</b> ما الاسم الكيميائي لمسحوق الفحم؟',opts:[{t:'الكربون',ok:true,why:'جواب الدليل: الكربون'},{t:'الهيدروجين',why:'الفحم لا يحتوي الهيدروجين بصورة رئيسية'},{t:'ثاني أكسيد الكربون',why:'هذا غاز ناتج وليس الفحم'}]},
   {q:'<b>س٢:</b> المعادلة اللفظية لتفاعل مسحوق الفحم مع أكسيد النحاس (II):',opts:[{t:'أكسيد النحاس (II) + كربون ← نحاس + ثاني أكسيد الكربون',ok:true,why:'جواب الدليل بنصه'},{t:'نحاس + ثاني أكسيد الكربون ← أكسيد النحاس (II) + كربون',why:'هذا عكس التفاعل'},{t:'أكسيد النحاس (II) + كربون ← كبريتيد النحاس + أكسجين',why:'لا يوجد كبريت في هذا التفاعل'}]},
   {q:'<b>س٣:</b> المعادلة الرمزية الموزونة مع رموز الحالة:',opts:[{t:eqn('C(s) + 2CuO(s) → 2Cu(s) + CO2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('C(s) + CuO(s) → Cu(s) + CO2(g)'),why:'غير موزونة: الأكسجين ذرة في اليسار وذرتان في اليمين'},{t:eqn('C(s) + 2CuO(s) → 2Cu(s) + CO(g)'),why:'الناتج هو ثاني أكسيد الكربون CO₂ الذي عكّر ماء الجير'}]},
   {q:'<b>س٤:</b> ماذا تستنتج عن النشاط الكيميائي للنحاس مقارنةً بالكربون؟',opts:[{t:'النحاس أقل نشاطاً من الكربون',ok:true,why:'جواب الدليل: الكربون أخذ الأكسجين من أكسيد النحاس'},{t:'النحاس أنشط من الكربون',why:'لو كان أنشط لما استطاع الكربون أن يختزل أكسيده'},{t:'لهما النشاط نفسه',why:'حدث تفاعل، فالكربون أنشط'}]},
   {q:'<b>س٥:</b> اقترح أكسيدين لفلزّين آخرين يمكن اختزالهما بالفحم:',opts:[{t:'أكسيد الخارصين وأكسيد الحديد',ok:true,why:'فلزان أقل نشاطاً من الكربون (أي جواب موافق لجدول ٢-٢ مقبول: خارصين، حديد، قصدير، رصاص)'},{t:'أكسيد الصوديوم وأكسيد الألومنيوم',why:'هذان فلزان أنشط من الكربون'},{t:'أكسيد الماغنيسيوم وأكسيد الكالسيوم',why:'هذان فلزان أنشط من الكربون'}]},
   {q:'<b>س٦:</b> اقترح اسماً لأكسيد فلزّ لا يمكن اختزاله بالفحم:',opts:[{t:'أكسيد الماغنيسيوم',ok:true,why:'الماغنيسيوم أنشط من الكربون (أي أكسيد لفلز أعلى من الكربون مقبول)'},{t:'أكسيد الرصاص',why:'الرصاص أقل نشاطاً من الكربون: يُختزل أكسيده'},{t:'أكسيد القصدير',why:'القصدير أقل نشاطاً من الكربون: يُختزل أكسيده'}]}];
  slide({id:'res21',ch:4,title:'نشاط ٢-١: النتائج والأسئلة',tag:'الاستنتاج',
   html:function(){
    return `<div style="display:flex;gap:14px;flex:1;align-items:stretch">
     <div class="col" style="width:360px;flex:none;gap:10px;justify-content:center">
      <div class="panel" style="padding:10px 14px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--gold)">النتائج</div><div style="font-size:18px;line-height:1.4">المسحوق أسود، يتوهّج عند التسخين، ثم يظهر لون <b>وردي–بني</b> حيث التقى المسحوقان. ماء الجير <b>يتعكّر</b>.</div></div>
      <div class="panel" style="padding:10px 14px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">الاستنتاج</div><div style="font-size:18px;line-height:1.4">النواتج: <b>نحاس</b> وغاز <b>ثاني أكسيد الكربون</b>.</div></div></div>
     <div style="flex:1;min-width:0;display:flex;flex-direction:column">${ticketHTML(items)}</div></div>`;},
   init:function(el){bindTicket(el,items,'res21')},
   note:'<ul><li>أسئلة نشاط ٢-١ (كتاب الطالب ص٣٨) وإجاباتها من دليل المعلم: ١ الكربون؛ ٢ أكسيد النحاس (II) + كربون ← نحاس + ثاني أكسيد الكربون؛ ٣ <span class="num">C(s) + 2CuO(s) → 2Cu(s) + CO₂(g)</span>؛ ٤ النحاس أقل نشاطاً من الكربون؛ ٥ و٦ أي أكسيدين لفلزين أقل نشاطاً من الكربون، وأي أكسيد لفلز أنشط منه (من جدول ٢-٢). حوّلتُ الأسئلة المفتوحة إلى اختيار.</li></ul>'});
})();

/* 18 recycling: why */
slide({id:'recyc',ch:5,title:'لماذا نعيد تدوير الفلزات؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[
   ['نحافظ على الخامات','تحافظ على المواد الخام التي صُنعت هذه الأدوات منها.'],
   ['نوفّر الطاقة','تستهلك طاقة أقل من الطاقة اللازمة لاستخلاص هذه الفلزات من المواد الخام.'],
   ['نقلّل النفايات','تقلّل من دفن المواد في مردم النفايات، فلا يعود هناك تلوّث.']];
  return `<div class="col" style="flex:1;gap:9px;justify-content:center;min-height:0">
   <div class="panel" style="padding:8px 18px"><div style="font-size:21px;font-weight:800;line-height:1.35">خامات الفلزات <b style="color:var(--gold)">موارد محدودة</b> وغير قابلة للتجدّد بعد تعدينها واستخلاص الفلزات منها، لذلك نتعامل بحكمة مع الأشياء المصنوعة من الفلزات وعند التخلّص منها.</div></div>
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:9px 16px;gap:6px"><div style="font-size:22px;font-weight:800">أيّ هذه العبارات تفسّر الحاجة إلى إعادة تدوير الفلزات؟</div>
    ${optsHTML([{t:'خامات الفلزات موارد محدودة غير متجددة'},{t:'الفلزات تتكوّن بسرعة في الطبيعة'},{t:'إعادة التدوير تستهلك طاقة أكثر من الاستخلاص'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">ينتج الاستخلاص <b>موارد تنتهي</b>، وإعادة التدوير <b>تحفظها</b> وتوفّر الطاقة وتقلّل النفايات.</div></div>`;},
 init:function(el){
  var cards=false, q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: لذلك نحتاج إلى إعادة التدوير'},{t:'',why:'خامات الفلزات لا تتجدّد بعد تعدينها'},{t:'',why:'العكس: إعادة التدوير تستهلك طاقة أقل'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٣٧ (إعادة تدوير الفلزات): «تُعدّ خامات الفلزّات موارد محدودة غير قابلة للتجدّد بعد تعدينها واستخلاص الفلزّات منها»، والأسباب الثلاثة بنصها تقريباً. الهدف ٧-١٢. عرضك: «الفلزات: خامات الفلزات موارد محدودة وغير متجددة».</li></ul>'});

/* 19 aluminium and steel: the figures of the book */
slide({id:'alst',ch:5,title:'ألومنيوم أم فولاذ؟ ماذا يوفّر التدوير؟',tag:'قارن الأرقام',
 html:function(){
  function bars(id,rows,max){ return barsHTML(id,rows.map(function(r){return {lab:r[0],parts:[[r[1],r[2],r[3]]]}}),max) }
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">الطاقة التي يوفّرها تدوير الفلز (من الطاقة اللازمة للإنتاج الجديد)</div>${bars('b1',[['الألومنيوم',95,'used','٩٥٪'],['الفولاذ',66.7,'left','الثلثان']],100)}</div>
    <div class="panel" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">الخام الذي يوفّره تدوير طن واحد (بالأطنان)</div>${bars('b2',[['الألومنيوم',8,'used','٨'],['الفولاذ',1.1,'left','١٫١']],8)}</div></div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:10px 16px;gap:4px;font-size:18px;line-height:1.45"><b style="color:var(--gold)">الألومنيوم:</b> استخلاصه كلفته كبيرة جداً؛ علبة واحدة معاد تدويرها توفّر طاقة تشغّل تلفازاً <b>٣ ساعات</b>؛ حوالي <b>٥٠٪</b> مما يُستخدم في العالم يُعاد تدويره.</div>
    <div class="panel" style="padding:10px 16px;gap:4px;font-size:18px;line-height:1.45"><b style="color:var(--gold)">الفولاذ:</b> تدويره أقل كلفة من صناعته من الخام، لكن الفرق ليس كبيراً كالألومنيوم؛ حوالي <b>٤٠٪</b> من مواد إنتاجه من مصادر تعيد تدوير الحديد.</div>
    <div class="panel compact" id="q" style="padding:10px 16px;gap:8px"><div style="font-size:20px;font-weight:800">تدوير أيّ الفلزين يوفّر نسبة أكبر من الطاقة؟</div>${optsHTML([{t:'الألومنيوم'},{t:'الفولاذ'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">تدوير الألومنيوم <b>أجدى</b> اقتصادياً لأن استخلاصه من الخام مكلف جداً.</div></div></div>`;},
 init:function(el){
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: ٩٥٪ للألومنيوم مقابل ثلثي الطاقة للفولاذ'},{t:'',why:'الفولاذ يوفّر ثلثي الطاقة، والألومنيوم ٩٥٪'}],$('.fb',el),function(){unhide(el)});
 },
 enter:function(el){ later(function(){ $$('.bars',el).forEach(function(b){b.classList.add('go')}) },150) },
 note:'<ul><li>كتاب الطالب ص٣٧: الألومنيوم المعاد تدويره يوفّر ٩٥٪ من الطاقة اللازمة لصنع ألومنيوم جديد؛ علبة ألومنيوم تكفي لتشغيل تلفاز ٣ ساعات؛ حوالي ٥٠٪ من الألومنيوم المستخدم يُعاد تدويره؛ كل طن مُعاد تدويره يوفّر ٨ أطنان من الخام. الفولاذ: إعادة تدويره أقل كلفة، والفرق ليس كبيراً؛ حوالي ٤٠٪ من مواد إنتاجه من إعادة تدوير؛ الطاقة المتوفّرة تعادل ثلثي الطاقة المطلوبة لإنتاج الحديد من خاماته؛ كل طن يوفّر حوالي ١٫١ طن من الخام. الأرقام نفسها في عرضيك.</li><li>رسمتُ «الثلثين» بطول ٦٦٫٧٪ تقريباً.</li></ul>'});

/* 20 the magnet: why steel is easy to recycle */
slide({id:'magnet',ch:5,title:'لماذا يسهل تدوير الفولاذ؟',tag:'اضغط على القطعة لتجرّب المغناطيس',
 html:function(){
  return `<div class="col" style="flex:1;gap:14px;justify-content:center;min-height:0">
   <div class="magnet" aria-hidden="true">🧲</div>
   <div class="scrap" id="sc">${SCRAP.map(function(s,i){return '<button type="button" data-i="'+i+'">'+s[0]+'</button>'}).join('')}</div>
   <div class="fb" style="min-height:30px;text-align:center;font-size:21px"></div>
   <div><div style="font-size:19px;font-weight:800;color:#7be0a8;margin-bottom:4px">ما جذبه المغناطيس:</div><div class="pile" id="pl"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الفولاذ <b>مغناطيسي</b>، فيُفصل عن بقية النفايات بمغناطيس، ولهذا يسهل تدويره.</div></div>`;},
 init:function(el){
  var fb=$('.fb',el), left=SCRAP.filter(function(s){return s[1]}).length;
  $$('#sc button',el).forEach(function(b){b.addEventListener('click',function(){
    var s=SCRAP[+b.getAttribute('data-i')];
    if(s[1]){ b.classList.add('pulled'); var sp=document.createElement('span'); sp.textContent=s[0]; $('#pl',el).appendChild(sp); left--; say(fb,'✓ انجذب: '+s[0]+' من الفولاذ (حديد)','ok'); if(!left) unhide(el) }
    else{ b.classList.add('nope'); later(function(){b.classList.remove('nope')},400); say(fb,s[0]+' لا ينجذب إلى المغناطيس','bad') }
  })});
 },
 note:'<ul><li>كتاب الطالب ص٣٧ وإجابة ٢-٧ في الدليل: «يمكن إعادة تدوير الفولاذ بسهولة لأنه مغناطيسي، وبالتالي يمكن فصله بسهولة عن النفايات الأخرى». عرضك: «إعادة تدويره سهلة لأنه مغناطيسي ويمكن فصله عن بقية النفايات الأخرى».</li></ul>'});

/* 21 book questions 2-1 to 2-4 */
(function(){
  var items=[
   {q:'<b>٢-١:</b> ما المقصود بمصطلح طبيعي (native) أو نقي؟',opts:[{t:'يوجد في القشرة الأرضية كعنصر نقي غير مرتبط بعناصر أخرى',ok:true,why:'جواب الدليل: يوجد في القشرة الأرضية كعنصر نقي'},{t:'فلز نُقّي في المصنع بعد استخلاصه',why:'native معناها كما يوجد في الطبيعة، لا بعد التصنيع'},{t:'فلز يوجد متحداً مع الأكسجين',why:'هذا وصف المعدن (المركّب)'}]},
   {q:'<b>٢-٢:</b> ما العنصر المستخدم لاستخلاص الفلزات المعتدلة النشاط من خاماتها؟',opts:[{t:'الكربون',ok:true,why:'جواب الدليل: الكربون'},{t:'الأكسجين',why:'الأكسجين هو ما ننزعه من الأكسيد'},{t:'الصوديوم',why:'الصوديوم فلز شديد النشاط ويحتاج هو نفسه إلى الكهرباء'}]},
   {q:'<b>٢-٣:</b> سبب يفسّر استخدام الكربون في استخلاص الفلزات المعتدلة النشاط:',opts:[{t:'متوفر ورخيص، وناتجه ثاني أكسيد الكربون غاز يسهل فصله عن الفلز',ok:true,why:'جواب الدليل: متوفر وقليل التكلفة، وينتج غازاً يسهل فصله'},{t:'نادر وغالي الثمن ويعطي فلزاً نقياً',why:'الكربون متوفر ورخيص'},{t:'ينتج ناتجاً صلباً يسهل فصله',why:'الناتج CO₂ غاز لا صلب'}]},
   {q:'<b>٢-٤ (أ):</b> الجالينا خام الرصاص (PbS). المعادلة الرمزية الموزونة لتحويل كبريتيد الرصاص (II) إلى أكسيد الرصاص (II):',opts:[{t:eqn('2PbS(s) + 3O2(g) → 2PbO(s) + 2SO2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('PbS(s) + O2(g) → PbO(s) + SO2(g)'),why:'غير موزونة: الأكسجين ٢ في اليسار و٣ في اليمين'},{t:eqn('2PbS(s) + 3O2(g) → 2Pb(s) + 2SO3(g)'),why:'نحصل على الأكسيد لا الفلز، والناتج SO₂'}]},
   {q:'<b>٢-٤ (ب):</b> المعادلة الرمزية الموزونة لاختزال أكسيد الرصاص (II) إلى رصاص:',opts:[{t:eqn('2PbO(s) + C(s) → 2Pb(s) + CO2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('PbO(s) + C(s) → Pb(s) + CO2(g)'),why:'غير موزونة: الأكسجين ذرة في اليسار وذرتان في اليمين'},{t:eqn('2PbO(s) + C(s) → Pb(s) + 2CO2(g)'),why:'غير موزونة: ذرتا رصاص في اليسار وذرة واحدة في اليمين'}]}];
  slide({id:'q21',ch:6,title:'أسئلة الكتاب ٢-١ إلى ٢-٤',tag:'ص٣٨',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'q21')},
   note:'<ul><li>أسئلة كتاب الطالب ص٣٨ وإجاباتها من دليل المعلم: ٢-١ يوجد في القشرة الأرضية كعنصر نقي؛ ٢-٢ الكربون؛ ٢-٣ متوفر ورخيص وينتج غازاً CO₂ يسهل فصله؛ ٢-٤ (أ) <span class="num">2PbS + 3O₂ → 2PbO + 2SO₂</span> (ب) <span class="num">2PbO + C → 2Pb + CO₂</span>. حوّلتُ الأسئلة المفتوحة إلى اختيار مع إبقاء جواب الدليل خياراً صحيحاً.</li></ul>'});
})();

/* 22 book questions 2-5 to 2-8 */
(function(){
  var items=[
   {q:'<b>٢-٥:</b> كيف يُستخلص فلز شديد النشاط، مثل الصوديوم، من مركّباته؟',opts:[{t:'بالتحليل الكهربائي للمركّب المصهور',ok:true,why:'جواب الدليل: التحليل الكهربائي'},{t:'بتسخينه مع الكربون',why:'الصوديوم أنشط من الكربون'},{t:'بتسخين خامه في الهواء',why:'هذه طريقة خام الكبريتيد للنحاس'}]},
   {q:'<b>٢-٦:</b> لماذا تكون عملية إعادة تدوير الألومنيوم مجدية اقتصادياً بشكل خاص؟',opts:[{t:'لأنها توفّر كلفة تعدين الخام والطاقة اللازمة لاستخلاص الألومنيوم',ok:true,why:'جواب الدليل: توفّر كلفة التعدين والطاقة'},{t:'لأن الألومنيوم مغناطيسي',why:'الفولاذ هو المغناطيسي، لا الألومنيوم'},{t:'لأن خام الألومنيوم نادر جداً',why:'السبب هو كلفة الاستخلاص والطاقة'}]},
   {q:'<b>٢-٧:</b> ما الخاصّية التي يمتلكها الفولاذ وتجعله مادة تسهل إعادة تدويرها؟',opts:[{t:'الخاصية المغناطيسية',ok:true,why:'جواب الدليل: الخاصية المغناطيسية'},{t:'الكثافة المنخفضة',why:'الكثافة لا تساعد في الفصل عن النفايات'},{t:'اللون الفضي',why:'اللون لا يفصل الفولاذ عن غيره'}]},
   {q:'<b>٢-٨:</b> ما المقصود بمصطلح الاختزال؟',opts:[{t:'فقدان أو نزع الأكسجين من مركّب',ok:true,why:'جواب الدليل: فقدان أو نزع الأكسجين من مركّب'},{t:'اتحاد المادة مع الأكسجين',why:'هذا عكس الاختزال'},{t:'تحويل الغاز إلى سائل',why:'هذا تكثّف'}]}];
  slide({id:'q25',ch:6,title:'أسئلة الكتاب ٢-٥ إلى ٢-٨',tag:'ص٣٨',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'q25')},
   note:'<ul><li>أجوبة الدليل: ٢-٥ التحليل الكهربائي؛ ٢-٦ توفّر كلفة تعدين المادة الخام وتوفّر الطاقة اللازمة لاستخلاص الألومنيوم؛ ٢-٧ الخاصية المغناطيسية؛ ٢-٨ فقدان أو نزع الأكسجين من مركّب.</li></ul>'});
})();

/* 23 end-of-unit questions 1 and 2(b) */
(function(){
  var items=[
   {q:'<b>أسئلة نهاية الوحدة، س١:</b> ما أهمية إعادة تدوير أكبر عدد ممكن من المواد؟',opts:[{t:'الحفاظ على الموارد الطبيعية، وخاصة الموارد غير المتجددة من المعادن والوقود',ok:true,why:'جواب الدليل: الحفاظ على الموارد الطبيعية (المعادن والوقود)'},{t:'زيادة الحاجة إلى تعدين خامات جديدة',why:'إعادة التدوير تقلّل الحاجة إلى التعدين'},{t:'زيادة كمية النفايات المدفونة',why:'إعادة التدوير تقلّل دفن النفايات'}]},
   {q:'<b>س٢ (ب):</b> يمكن أن تصل درجة الحرارة في مركز الفرن العالي إلى °C 1300، ويُستخلص النحاس من أكسيد النحاس (II) في المختبر عند درجات أدنى. لماذا تحتاج هذه العملية إلى طاقة أقل من استخلاص الحديد من أكسيد الحديد (III)؟',opts:[{t:'النحاس أقل نشاطاً من الحديد، فالترابط في أكسيد النحاس أضعف، ويحتاج إلى طاقة أقل لتفكيك الروابط',ok:true,why:'جواب الدليل بنصه تقريباً'},{t:'النحاس أنشط من الحديد فيتفاعل بسرعة',why:'النحاس أقل نشاطاً من الحديد'},{t:'لأن أكسيد النحاس أخف وزناً',why:'الوزن لا يحدد الطاقة اللازمة، بل قوة الروابط'}]}];
  slide({id:'eou',ch:6,title:'أسئلة نهاية الوحدة: س١ وس٢(ب)',tag:'ص٥٠',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'eou')},
   note:'<ul><li>أسئلة نهاية الوحدة في كتاب الطالب ص٥٠ (السؤالان ١ و٢ب هما المقرران لهذا الموضوع في الدليل). إجابة س١: الحفاظ على الموارد الطبيعية خاصة غير المتجددة، وتقليل الضغط على التعدين والتلوث وتوفير الطاقة. إجابة س٢(ب): النحاس أقل نشاطاً من الحديد، لذا الترابط في أكسيد النحاس أضعف من الترابط في أكسيد الحديد، فيحتاج إلى طاقة أقل لتفكيك الروابط. (السؤال ٢أ والسؤال ٣ في الموضوع ٢-٢.)</li></ul>'});
})();
