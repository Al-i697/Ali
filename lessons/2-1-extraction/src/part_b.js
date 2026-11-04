/* ---------- lesson 2-1, part B: the methods of extraction, roasting, reduction by carbon ---------- */

/* 7 Table 2-2: sort the metals into the four bands */
slide({id:'tbl22',ch:2,title:'الجدول ٢-٢: كيف نستخلص كل فلز؟',tag:'اسحب الفلز إلى طريقته',
 html:function(){
  return `<div class="col" style="flex:1;gap:8px;min-height:0">
   <div class="sarrow" style="font-size:18px"><span>الأكثر نشاطاً</span><i></i><span>الأقل نشاطاً</span></div>
   <div class="bands">
    <div class="band" data-b="e"><h4>التحليل الكهربائي للمركّب المصهور</h4><small>للفلزات الأنشط من الكربون</small><div class="bchips"></div></div>
    <div class="band" data-b="c"><h4>اختزال الأكسيد بالكربون</h4><small>تُسخَّن خامات الكبريتيد أولاً لإنتاج الأكسيد</small><div class="bchips"></div></div>
    <div class="band" data-b="s"><h4>خام الكبريتيد مسخّن في الهواء</h4><small>يُستخلص بتسخين الخام في الهواء</small><div class="bchips"></div></div>
    <div class="band" data-b="n"><h4>توجد بصورة طبيعية نقية</h4><small>(غير مندمجة) في الأرض</small><div class="bchips"></div></div></div>
   <div id="tray" class="tray"></div>
   <div class="fb" style="min-height:26px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">كلما <b>قلّ نشاط الفلز</b> سهل استخلاصه: الأنشط يحتاج <b>كهرباء</b>، والمتوسط <b>كربوناً</b>، والخامل يوجد <b>منفرداً</b>.</div></div>`;},
 init:function(el){
  var E='أنشط من الكربون، فلا يختزل الكربون أكسيده: فكّر في طريقة تستخدم الكهرباء', C='أقل نشاطاً من الكربون وأنشط من النحاس: فكّر في طريقة تستخدم الكربون';
  bindBands(el,[
   ['Ag','Ag','n','الفضة قليلة النشاط فتوجد منفردة','الفضة خاملة: هل تحتاج إلى استخلاص؟'],
   ['Na','Na','e','الصوديوم شديد النشاط: يُستخلص بالتحليل الكهربائي لمركّبه المصهور',E],
   ['Zn','Zn','c','الخارصين أقل نشاطاً من الكربون: يختزل الكربون أكسيده',C],
   ['Cu','Cu','s','خام النحاس كبريتيد (CuFeS₂) يُسخَّن في الهواء','خام النحاس كبريتيد: فكّر في تسخينه في الهواء'],
   ['Mg','Mg','e','الماغنيسيوم أنشط من الكربون: التحليل الكهربائي',E],
   ['Fe','Fe','c','الحديد أقل نشاطاً من الكربون: يُستخلص بالكربون',C],
   ['Au','Au','n','الذهب خامل: يوجد منفرداً','الذهب خامل: هل تحتاج إلى استخلاص؟'],
   ['K','K','e','البوتاسيوم من أنشط الفلزات: التحليل الكهربائي',E],
   ['Pb','Pb','c','الرصاص يُستخلص من أكسيده بالكربون',C],
   ['Al','Al','e','الألومنيوم أنشط من الكربون: التحليل الكهربائي للمصهور',E],
   ['Ca','Ca','e','الكالسيوم أنشط من الكربون: التحليل الكهربائي',E],
   ['Sn','Sn','c','القصدير يُستخلص من أكسيده بالكربون',C]
  ],{css:'font-size:23px;padding:3px 16px;font-family:var(--font-display)'});
 },
 note:'<ul><li>كتاب الطالب ص٣٧ (الجدول ٢-٢ «طرائق استخلاص بعض الفلزات الشائعة وفقاً لنشاطها الكيميائي»): البوتاسيوم والصوديوم والكالسيوم والماغنيسيوم والألومنيوم: التحليل الكهربائي للمركّب المصهور؛ الخارصين والحديد والقصدير والرصاص: اختزال الأكاسيد بالكربون (تُسخَّن خامات الكبريتيد لإنتاج الأكسيد أولاً)؛ النحاس: خام الكبريتيد مسخّن في الهواء؛ الفضة والذهب: توجد بصورة طبيعية نقية (غير مندمجة) في الأرض. السهم: تناقص النشاط الكيميائي.</li><li>قرار: النحاس في الجدول فئة مستقلة، بينما عرضك وعرض NotebookLM يضعانه مع الفضة والذهب. اتبعتُ الكتاب. والفلزات الاثنا عشر كلها بترتيب جدول ٢-٢.</li></ul>'});

/* 8 electrolysis: why not carbon */
slide({id:'electro',ch:2,title:'الفلزات النشطة: لماذا لا يكفي الكربون؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[
   ['الكربون أقل نشاطاً منها','الفلزات النشطة (البوتاسيوم والصوديوم والكالسيوم والماغنيسيوم والألومنيوم) أنشط من الكربون، فلا يستطيع الكربون أن ينزع الأكسجين من أكاسيدها.'],
   ['التحليل الكهربائي','يُمرَّر تيار كهربائي في المركّب <b>المصهور</b> فيتفكك ويتكوّن الفلز.'],
   ['الكلفة','هذه الطريقة تحتاج إلى <b>طاقة كهربائية كبيرة</b> لكسر الروابط القوية، لذلك يكلّف استخلاص هذه الفلزات أكثر.']];
  return `<div class="col" style="flex:1;gap:14px;justify-content:center;min-height:0">
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">لماذا لا يصلح الكربون لاستخلاص الألومنيوم من أكسيده؟</div>
    ${optsHTML([{t:'لأن الألومنيوم أنشط من الكربون'},{t:'لأن الكربون غير متوفر'},{t:'لأن الألومنيوم أثقل من الكربون'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الفلز <b>الأنشط من الكربون</b> ← التحليل الكهربائي لمركّبه <b>المصهور</b>.</div></div>`;},
 init:function(el){
  var cards=false, q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: لا يستطيع الكربون اختزال أكسيد فلز أنشط منه'},{t:'',why:'الكربون متوفر (فحم الكوك)، لكنه أقل نشاطاً من الألومنيوم'},{t:'',why:'الكثافة لا تحدد طريقة الاستخلاص'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٣٦–٣٧: الفلزات شديدة النشاط لا يمكن اختزالها بالكربون، فتُستخلص بالتحليل الكهربائي للمركّب المصهور، وهو يحتاج طاقة كبيرة (كهرباء). مثال: الألومنيوم والماغنيسيوم والصوديوم. دليل المعلم (إجابة ٢-٥): التحليل الكهربائي.</li><li>عرضك: «لا يمكن اختزالها بالكربون لأن الفلزات النشطة الموجودة في مركّباتها كأكاسيد أو كلوريدات تحتاج إلى الكثير من الطاقة لاستخلاصها، لذا يتم توفيرها بالكهرباء». لم أدخل تفاصيل القطبين (المصعد والمهبط) لأنها ليست في الكتاب هنا.</li></ul>'});

/* 9 apply the rule (goal 7-1) */
(function(){
  var items=[
   {q:'يتفاعل الفلز <b>X</b> بعنف مع الماء البارد. ما أنسب طريقة لاستخلاصه من مركّبه؟',opts:[{t:'التحليل الكهربائي للمركّب المصهور',ok:true,why:'الفلز الذي يتفاعل بعنف مع الماء شديد النشاط، وأنشط من الكربون'},{t:'اختزال أكسيده بالكربون',why:'الكربون أقل نشاطاً من هذا الفلز، فلا يختزل أكسيده'},{t:'تسخين خامه في الهواء',why:'هذه طريقة النحاس الأقل نشاطاً'}]},
   {q:'الفلز <b>Y</b> يتفاعل ببطء مع بخار الماء، وهو أقل نشاطاً من الكربون. أين موقعه، وبأي طريقة يُستخلص؟',opts:[{t:'تحت الكربون وفوق النحاس، ويُختزل أكسيده بالكربون',ok:true,why:'مثل الخارصين والحديد والقصدير والرصاص'},{t:'فوق الكربون، ويُستخلص بالكهرباء',why:'هذا للفلزات الأنشط من الكربون'},{t:'في أسفل السلسلة، ويوجد منفرداً',why:'الفلز الذي يتفاعل مع البخار ليس خاملاً'}]},
   {q:'خام الفلز <b>Z</b> هو <span class="num">PbS</span> (كبريتيد). ماذا نفعل به أولاً قبل الاختزال؟',opts:[{t:'نسخّنه في الهواء ليتحول إلى أكسيد',ok:true,why:'<span class="num">2PbS + 3O₂ → 2PbO + 2SO₂</span> ثم يُختزل الأكسيد بالكربون'},{t:'نصهره ونمرّر فيه تياراً كهربائياً',why:'هذا للفلزات الأنشط من الكربون'},{t:'نضيف إليه الماء',why:'الماء لا يحوّل الكبريتيد إلى أكسيد'}]},
   {q:'يوجد الفلز <b>W</b> في الطبيعة منفرداً. ماذا نستنتج عن نشاطه؟',opts:[{t:'قليل النشاط جداً (خامل)',ok:true,why:'مثل الذهب والفضة'},{t:'شديد النشاط',why:'الفلز الشديد النشاط يتحد ولا يوجد منفرداً'},{t:'أنشط من الكربون',why:'الفلز الأنشط من الكربون يوجد في مركّبات'}]}];
  slide({id:'method',ch:2,title:'اربط الطريقة بموقع الفلز',tag:'تطبيق',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'method')},
   note:'<ul><li>الهدف ٧-١: ربط طريقة الاستخلاص بموقع الفلز في سلسلة النشاط «بناءً على المعلومات المعطاة». الأسئلة الأربعة تدريب من صياغتي مبني على جدول ٢-٢ في الكتاب (وليست أسئلة كتاب).</li></ul>'});
})();

/* 10 roasting a sulfide ore: the equation ladder */
slide({id:'roast',ch:3,title:'تحميص الكبريتيد: كبريتيد الخارصين',tag:'أربع خطوات',
 html:function(){ return `<div class="col" style="flex:1;gap:8px;min-height:0"><div class="panel" style="padding:8px 14px" id="ladhost"></div></div>`; },
 init:function(el){
  var d={word:{R:['كبريتيد الخارصين','أكسجين'],P:['أكسيد الخارصين','ثاني أكسيد الكبريت'],bank:['أكسيد الخارصين','كبريتيد الخارصين','ثاني أكسيد الكبريت','أكسجين','خارصين','ثاني أكسيد الكربون'],
    why:{'خارصين':'لا يتكوّن الفلز في هذه الخطوة: نحصل أولاً على الأكسيد.','ثاني أكسيد الكربون':'لا يوجد كربون في هذه الخطوة: التسخين يتم في الهواء.'}},
   subs:[{n:'كبريتيد الخارصين',o:[['ZnS',1],['Zn2S',0,'الخارصين +٢ والكبريتيد −٢: النسبة ١ : ١.'],['ZnSO4',0,'هذه كبريتات: الكبريتيد هو S فقط.']]},
    {n:'أكسجين',o:[['O2',1],['O',0,'الأكسجين الغازي جزيء ثنائي الذرّة O₂.']]},
    {n:'أكسيد الخارصين',o:[['ZnO',1],['Zn2O',0,'الخارصين +٢ والأكسيد −٢: النسبة ١ : ١.'],['ZnO2',0,'أيون الأكسيد O²⁻ ذرة واحدة.']]},
    {n:'ثاني أكسيد الكبريت',o:[['SO2',1],['SO3',0,'هذا ثالث أكسيد الكبريت.'],['S2O',0,'ثاني أكسيد الكبريت فيه ذرتا أكسجين وذرة كبريت.']]}],
   stw:{ZnS:['s','خام الكبريتيد صلب.'],O2:['g','الأكسجين غاز.'],ZnO:['s','أكسيد الخارصين صلب.'],SO2:['g','ثاني أكسيد الكبريت غاز يتصاعد.']},
   eq:{l:[{f:'ZnS',st:'s'},{f:'O2',st:'g'}],r:[{f:'ZnO',st:'s'},{f:'SO2',st:'g'}],co:[2,3,2,2],tip:'ابدأ بالكبريت، ثم الخارصين، وأخّر الأكسجين.'}};
  EQL.ladder($('#ladhost',el),d,{});
 },
 note:'<ul><li>كتاب الطالب ص٣٦: تحويل الكبريتيد إلى أكسيد بالتحميص في الهواء: <span class="num">2ZnS(s) + 3O₂(g) → 2ZnO(s) + 2SO₂(g)</span>. هذه الخطوة الأولى لاستخلاص الخارصين من بلند الخارصين، وتظهر في امتحان ٢٠٢٤/٢٠٢٥ الدور الثاني (مرحلتا استخلاص الخارصين).</li><li>سلّم المعادلة من ورشة المعادلات (الصيغ ثم الحالات ثم الوزن) كما في الدروس السابقة.</li></ul>'});

/* 11 reduction of the oxide by carbon: the equation ladder */
slide({id:'reduce',ch:3,title:'اختزال أكسيد الخارصين بالكربون',tag:'أربع خطوات',
 html:function(){ return `<div class="col" style="flex:1;gap:8px;min-height:0"><div class="panel" style="padding:8px 14px" id="ladhost"></div></div>`; },
 init:function(el){
  var d={word:{R:['أكسيد الخارصين','كربون'],P:['خارصين','ثاني أكسيد الكربون'],bank:['خارصين','أكسيد الخارصين','ثاني أكسيد الكربون','كربون','أكسجين','كبريتيد الخارصين'],
    why:{'أكسجين':'الأكسجين ليس مادة متفاعلة هنا: ينتقل من الأكسيد إلى الكربون.','كبريتيد الخارصين':'الكبريتيد حُوّل في الخطوة السابقة إلى أكسيد.'}},
   subs:[{n:'أكسيد الخارصين',o:[['ZnO',1],['Zn2O',0,'الخارصين +٢ والأكسيد −٢: النسبة ١ : ١.'],['ZnO2',0,'أيون الأكسيد O²⁻ ذرة واحدة.']]},
    {n:'كربون',o:[['C',1],['C2',0,'الكربون الصلب يُكتب C فقط.'],['CO',0,'هذا أحادي أكسيد الكربون وليس الكربون.']]},
    {n:'خارصين',o:[['Zn',1],['Zn2',0,'الفلز يُكتب برمز العنصر وحده.']]},
    {n:'ثاني أكسيد الكربون',o:[['CO2',1],['CO',0,'هذا أحادي أكسيد الكربون.'],['C2O',0,'ثاني أكسيد الكربون: ذرة كربون وذرتا أكسجين.']]}],
   stw:{ZnO:['s','أكسيد الخارصين صلب.'],C:['s','الكربون (الفحم) صلب.'],Zn:['s','الخارصين فلز صلب.'],CO2:['g','ثاني أكسيد الكربون غاز يتصاعد.']},
   eq:{l:[{f:'ZnO',st:'s'},{f:'C',st:'s'}],r:[{f:'Zn',st:'s'},{f:'CO2',st:'g'}],co:[2,1,2,1],tip:'الأكسجين: ذرتان في CO₂ فكم ZnO تلزم؟'}};
  EQL.ladder($('#ladhost',el),d,{});
 },
 note:'<ul><li>كتاب الطالب ص٣٦: <span class="num">2ZnO(s) + C(s) → 2Zn(s) + CO₂(g)</span>؛ الكربون رخيص (فحم الكوك) وناتجه CO₂ غاز يسهل فصله. عرضك ورد فيه الاسم «ثاني أكسيد الكربون + خارصين» للمعادلة اللفظية.</li></ul>'});

/* 12 what is reduced? (the misconception named in the guide) */
slide({id:'redox',ch:3,title:'أيّ مادة اختُزلت؟',tag:'اضغط على المادة',
 html:function(){
  function row(id,l1,l2,r1,r2){ return '<div class="panel rxrow" data-r="'+id+'" style="padding:14px 20px;gap:8px;align-items:center"><div class="rxl" style="display:flex;gap:12px;align-items:center;direction:ltr;flex-wrap:wrap;justify-content:center">'+l1+'<span class="rop">+</span>'+l2+'<span class="rop">→</span>'+r1+'<span class="rop">+</span>'+r2+'</div></div>' }
  function tk(k,t){ return '<button type="button" class="rtk" data-k="'+k+'">'+sub(t)+'</button>' }
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط في كل معادلة على المادة التي <b>اختُزلت</b> (فقدت الأكسجين):</div>
    ${row('1',tk('zno','2ZnO'),tk('c','C'),tk('zn','2Zn'),tk('co2','CO2'))}
    ${row('2',tk('zno','ZnO'),tk('co','CO'),tk('zn','Zn'),tk('co2','CO2'))}
    <div class="fb" style="min-height:44px;font-size:20px;text-align:center"></div></div>
   <div class="col" style="width:380px;flex:none;justify-content:center"><div class="gbar hide" id="gb" style="font-size:20px;line-height:1.45"><b>الاختزال</b> هو فقدان الأكسجين أو نزعه من مركّب.<br>المادة المختزَلة هي <b>الأكسيد</b> الذي يفقد الأكسجين، أما الكربون (أو CO) فيأخذه.</div></div></div>`;},
 init:function(el){
  var M={c:'الكربون هو الذي أخذ الأكسجين من الأكسيد، فلم يُختزل هو',co:'أحادي أكسيد الكربون أخذ الأكسجين وتحوّل إلى CO₂، فلم يُختزل',zn:'الخارصين هو الناتج بعد أن فقد الأكسيد أكسجينه',co2:'ثاني أكسيد الكربون تكوّن عندما أخذ الكربون الأكسجين'};
  var left=2, fb=$('.fb',el);
  $$('.rxrow',el).forEach(function(r){
    $$('.rtk',r).forEach(function(b){b.addEventListener('click',function(){
      if(r.classList.contains('ok')) return;
      if(b.getAttribute('data-k')==='zno'){ b.classList.add('ok'); r.classList.add('ok'); left--; say(fb,'✓ صحيح: أكسيد الخارصين فقد الأكسجين فصار خارصيناً','ok'); if(!left) unhide(el) }
      else{ b.classList.add('bad','shake'); later(function(){b.classList.remove('shake','bad')},400); say(fb,M[b.getAttribute('data-k')]||'فكّر: أيّ مادة فقدت الأكسجين؟','bad') }
    })});
  });
 },
 note:'<ul><li>دليل المعلم (المفاهيم الخاطئة، ٢-١): «قد يُسيء الطلاب فهم أيّ مادة يتمّ اختزالها أثناء التفاعلات»، فيجب شرح كيفية التعرّف عليها بدقة. تعريف الاختزال من الكتاب: فقدان أو نزع الأكسجين من مركّب (سؤال ٢-٨). المعادلتان من الكتاب: <span class="num">2ZnO + C → 2Zn + CO₂</span> و<span class="num">ZnO + CO → Zn + CO₂</span>.</li><li>لم أستعمل مصطلح «الأكسدة» لأنه ليس في هذا الموضوع.</li></ul>'});

/* 13 why carbon? */
slide({id:'whyc',ch:3,title:'لماذا يُستخدم الكربون؟',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[
   ['متوفر نسبياً','الكربون (فحم الكوك) متوفر بكثرة.'],
   ['رخيص','تكلفته زهيدة، فهو يوفّر المال.'],
   ['ناتجه غاز','ينتج غاز ثاني أكسيد الكربون الذي يسهل فصله عن الفلز لأنه <b>غاز</b>.']];
  return `<div class="col" style="flex:1;gap:14px;justify-content:center;min-height:0">
   <div style="font-size:24px;font-weight:800;color:var(--cyan)">للفلزات معتدلة النشاط، الكربون هو العنصر المستخدم في الاستخلاص لثلاثة أسباب:</div>
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">ماذا يحدث لثاني أكسيد الكربون الناتج عن الاختزال؟</div>
    ${optsHTML([{t:'يتصاعد غازاً فيبقى الفلز وحده'},{t:'يبقى مختلطاً بالفلز ويصعب فصله'},{t:'يتحوّل إلى فلز'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الكربون: <b>متوفر</b>، <b>رخيص</b>، وناتجه <b>غاز</b> يسهل فصله.</div></div>`;},
 init:function(el){
  var cards=false, q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: لأنه غاز يخرج، فيبقى الفلز'},{t:'',why:'الغاز يتصاعد ولا يختلط بالفلز الصلب'},{t:'',why:'ثاني أكسيد الكربون مركّب غازي'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٣٦ وإجابة ٢-٣ في الدليل: الكربون متوفر ورخيص وناتجه CO₂ غاز يسهل فصله عن الفلز. عرضك: «متوفر نسبياً، تكلفته زهيدة كفحم الكوك، ينتج غاز ثاني أكسيد الكربون الذي يسهل فصله عن الفلز لأنه غاز».</li><li>سؤال ٢-٣ في الكتاب يطلب هذين السببين، وتجده في شريحة أسئلة الكتاب.</li></ul>'});

/* 14 the balancer: the equations of extraction */
(function(){
  var EQS=[
   {t:'2C + O₂',l:[{f:'C',st:'s'},{f:'O2',st:'g'}],r:[{f:'CO',st:'g'}],co:[2,1,2],tip:'الأكسجين: ذرتان في O₂، وذرة واحدة في كل CO.'},
   {t:'2PbS + 3O₂',l:[{f:'PbS',st:'s'},{f:'O2',st:'g'}],r:[{f:'PbO',st:'s'},{f:'SO2',st:'g'}],co:[2,3,2,2],tip:'ابدأ بالرصاص والكبريت، وأخّر الأكسجين.'},
   {t:'2PbO + C',l:[{f:'PbO',st:'s'},{f:'C',st:'s'}],r:[{f:'Pb',st:'s'},{f:'CO2',st:'g'}],co:[2,1,2,1],tip:'الأكسجين: ذرتان في CO₂، فكم PbO تلزم؟'}];
  slide({id:'co',ch:3,title:'ميزان الذرات: معادلات الاستخلاص',tag:'غيّر المعاملات فقط',
   html:function(){
    return `<div class="col" style="flex:1;gap:8px;min-height:0">
     <div class="tabs2 eqtabs" id="eqt">${EQS.map(function(q,i){return '<button type="button" class="'+(i?'':'on')+'" data-i="'+i+'"><span class="num">'+q.t+'</span><i class="tk"></i></button>'}).join('')}</div>
     <div class="panel" style="padding:8px 14px" id="balhost"></div>
     <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الكربون يحترق في الهواء أولاً فيعطي <b>CO</b>، وCO نفسه يختزل الأكسيد: <span class="num">ZnO + CO → Zn + CO₂</span>.</div></div>`;},
   init:function(el){
    var solved={};
    function load(i){
      $$('#eqt button',el).forEach(function(b,j){b.classList.toggle('on',j===i)});
      EQL.balancer($('#balhost',el),EQS[i],{onSolved:function(){ solved[i]=1; $$('#eqt button',el)[i].classList.add('solved'); if(Object.keys(solved).length===EQS.length) unhide(el) }});
    }
    $$('#eqt button',el).forEach(function(b){b.addEventListener('click',function(){load(+b.getAttribute('data-i'))})});
    load(0);
   },
   note:'<ul><li>معادلات من كتاب الطالب ص٣٦–٣٨: احتراق الكربون في الهواء <span class="num">2C + O₂ → 2CO</span> (عرضك وكتاب الطالب: قد يتحول الكربون بفعل الحرارة إلى CO)؛ وتحميص كبريتيد الرصاص وتحويل أكسيده إلى رصاص (سؤال ٢-٤ أ وب): <span class="num">2PbS + 3O₂ → 2PbO + 2SO₂</span> و<span class="num">2PbO + C → 2Pb + CO₂</span>.</li></ul>'});
})();
