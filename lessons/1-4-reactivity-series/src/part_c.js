/* ---------- lesson 1-4, part C: displacement with oxides and carbon, Activity 1-4 and displacement in solutions ---------- */

/* 12 displacement (student book p.27) */
slide({id:'disp',ch:3,title:'تفاعلات الإزاحة (الإحلال)',tag:'هل يحدث التفاعل؟',
 html:function(){
  var rows=[
   ['حديد + أكسيد النحاس (II): <b class="num">Fe + CuO</b>','y','الحديد أنشط من النحاس فيأخذ الأكسجين منه'],
   ['نحاس + أكسيد الحديد (II): <b class="num">Cu + FeO</b>','n','النحاس أقل نشاطاً من الحديد فلا ينتزع منه الأكسجين'],
   ['ماغنيسيوم + أكسيد الحديد (II): <b class="num">Mg + FeO</b>','y','الماغنيسيوم أنشط من الحديد: Mg + FeO → MgO + Fe']];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:530px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:10px 16px;gap:5px"><div style="font-size:21px;font-weight:800;color:var(--gold)">الإزاحة: فلز أنشط يحلّ محلّ فلز أقل نشاطاً في مركّبه</div>
     <div style="font-size:19px;line-height:1.4;direction:rtl">أكسيد النحاس (II) + حديد ← نحاس + أكسيد الحديد (II)</div>
     <div class="bigeq" style="font-size:27px;direction:ltr;text-align:center">${eqn('Fe(s) + CuO(s) → FeO(s) + Cu(s)')}</div>
     <div class="bigeq" style="font-size:21px;direction:ltr;text-align:center;color:var(--cyan)">${eqn('Fe(s) + (Cu^2+,O^2−)(s) → (Fe^2+,O^2−)(s) + Cu(s)')}</div>
     <div style="font-size:18px;line-height:1.4"><b style="color:var(--gold)">الاختزال:</b> نزع الأكسجين من مركّب (هنا نُزع من أكسيد النحاس).</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="clsw" style="max-width:none">${clsHTML(rows,[['y','يحدث تفاعل'],['n','لا يحدث']],20)}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div>
    <div class="gbar hide" id="gb" style="font-size:19px">كلما كان الفلز <b>أنشط</b> كان أقدر على تكوين أيون موجب، فيزيح الفلز الأقل نشاطاً.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٢٧: «الإزاحة (الإحلال) Displacement: تفاعل تتمّ فيه إزاحة فلز من مركّبه ليحلّ محلّه فلز آخر أكثر نشاطاً. الاختزال Reduction: تفاعل يتمّ فيه نزع الأكسجين من مركّب». المعادلة الأيونية: Fe(s) + (Cu²⁺,O²⁻)(s) → (Fe²⁺,O²⁻)(s) + Cu(s). ثم: «Mg(s) + FeO(s) → MgO(s) + Fe(s)» وتوضّح الأيونية أن أيونات Mg²⁺ تتكوّن «بشكل أسرع وأسهل من الحديد على النحاس».</li><li>نص الكتاب لحالة Cu + FeO: «لا نلاحظ حدوث أي تفاعل... لذا لا يكون النحاس قادراً على أخذ الأكسجين من أكسيد الحديد (II)».</li></ul>'});

/* 13 Table 1-5 (student book p.27): metals against oxides, then the order */
slide({id:'oxtab',ch:3,title:'الجدول ١-٥: الفلزات وأكاسيد الفلزات',tag:'افتح الخلايا ثم رتّب',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="sm" style="font-size:19px;background:rgba(6,20,44,.82);border-radius:10px;padding:2px 12px;align-self:flex-start">✓ يحدث تفاعل · ✗ لا يحدث تفاعل</div>
    <div class="panel" style="padding:8px 10px">${plateHTML('ox',OXP)}</div>
    <div class="fb" id="ofb" style="min-height:26px;text-align:center;font-size:20px"></div></div>
   <div class="col" style="width:370px;flex:none;gap:9px;justify-content:center">
    <div class="panel hide" id="ordp" style="padding:10px 14px;gap:7px"><div style="font-size:21px;font-weight:800;color:var(--gold)">عدّ علامات ✓ في كل صف ثم رتّب الفلزات:</div>
     <div class="ordl"><span>الأكثر نشاطاً</span>${[0,1,2,3].map(function(i){return '<div class="mslot" data-k="'+i+'"><span class="ph">'+ar(i+1)+'</span></div>'}).join('')}<span>الأقل نشاطاً</span></div>
     <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div><div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px">الفلز الأنشط يزيح الفلزات الأقل منه من أكاسيدها، فعدد علامات ✓ في صفّه هو الأكبر: <b class="num">Mg &gt; Al &gt; Fe &gt; Cu</b>.</div></div></div>`;},
 init:function(el){
  bindPlate(el,'ox',OXP,$('#ofb',el),function(){
    $('#ordp',el).classList.remove('hide');
    bindMatch(el,[['2','<span class="num">Fe</span>'],['0','<span class="num">Mg</span>'],['3','<span class="num">Cu</span>'],['1','<span class="num">Al</span>']],{css:'font-size:24px;padding:4px 16px;font-family:var(--font-display)',fb:'#ordp .fb',more:'صح! كمّل',done:'ممتاز: Mg ثم Al ثم Fe ثم Cu',bad:'عدّ علامات ✓ في صفّ هذا الفلز'});
  });
 },
 note:'<ul><li>كتاب الطالب ص٢٧–٢٨ (الجدول ١-٥: نتائج تفاعل الفلزات مع أكاسيد فلزات أخرى؛ ✓ يحدث تفاعل، ✗ لا يحدث). النحاس: لا يتفاعل مع أي أكسيد؛ الحديد: يتفاعل مع أكسيد النحاس (II) فقط؛ الألومنيوم: مع أكسيدي النحاس (II) والحديد (II)؛ الماغنيسيوم: مع الأكاسيد الثلاثة. «وكلما ازداد عدد علامات (✓) مقابل الفلز، يكون نشاطه الكيميائي أكبر... لذا نرتّب الفلزات الأربعة: ماغنيسيوم، ألومنيوم، حديد، نحاس».</li><li>الهدف ٥-٣ (استنتاج الترتيب من نتائج تجريبية): الطالب يفتح النتائج ثم يستنتج الترتيب بعدّ العلامات.</li></ul>'});

/* 14 carbon takes oxygen from the oxides of metals below it (student book p.28) */
slide({id:'carbon',ch:3,title:'الكربون يختزل أكاسيد الفلزات',tag:'نعم أم لا؟',
 html:function(){
  var rows=[
   ['أكسيد الخارصين + كربون: <b class="num">ZnO + C</b>','y','الخارصين تحت الكربون: يُختزل أكسيده'],
   ['أكسيد النحاس (II) + كربون: <b class="num">CuO + C</b>','y','النحاس تحت الكربون بكثير: يُختزل أكسيده'],
   ['أكسيد الألومنيوم + كربون: <b class="num">Al<sub>2</sub>O<sub>3</sub> + C</b>','n','الألومنيوم فوق الكربون: لا يستطيع الكربون انتزاع أكسجينه'],
   ['أكسيد الماغنيسيوم + كربون: <b class="num">MgO + C</b>','n','الماغنيسيوم فوق الكربون: لا يتفاعل']];
  return `<div class="col" style="flex:1;gap:9px;justify-content:center;min-height:0">
   <div style="display:flex;gap:16px;align-items:stretch">
    <div class="panel" style="padding:10px 18px;gap:5px;flex:1"><div style="font-size:19px;font-weight:800;color:var(--cyan)">أكسيد النحاس (II) + كربون ← ثاني أكسيد الكربون + نحاس</div><div class="bigeq" style="font-size:30px;direction:ltr;text-align:center">${eqn('2CuO(s) + C(s) → 2Cu(s) + CO2(g)')}</div></div>
    <div class="panel" style="padding:10px 14px;gap:6px;width:560px">${serStrip(['Mg','Al','C','Zn','Fe','Cu'],{cls:'mini',id:'ser3'})}<div class="sm" style="font-size:17px;text-align:center">الكربون يزيل الأكسجين من أكسيد فلز يقع <b>تحته</b> في السلسلة.</div></div></div>
   <div class="clsw">${clsHTML(rows,[['y','يتفاعل'],['n','لا يتفاعل']],20)}</div>
   <div class="fb" style="min-height:26px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الكربون يختزل فقط أكاسيد الفلزات <b>التي تقع تحته</b> في السلسلة: Zn وFe وCu.</div></div>`;},
 init:function(el){ $$('#ser3 .sc',el).forEach(function(b){ if(b.getAttribute('data-s')==='C') b.classList.add('sel') }); bindCls(el,$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٢٨: «تُعدّ الفلزّات موارد قيّمة، لذا غالباً ما يُستخدم الكربون لإزالة الأكسجين من أكاسيد الفلزّات للحصول على الفلزّات. وهذا يتم فقط مع الفلزّات التي تقع تحت الكربون في سلسلة النشاط الكيميائي، مثل الخارصين والحديد والنحاس. فعلى سبيل المثال: كربون + أكسيد النحاس (II) ← ثاني أكسيد الكربون + نحاس: ٢CuO(s) + C(s) → ٢Cu(s) + CO₂(g)». وهذا يغطي النقطة الثالثة من الهدف ٥-١ (اختزال الأكاسيد بالكربون).</li><li>ورقة العمل ١-٤ (س٥): تُخلط أكاسيد الفلزات مع الكربون وتُسخَّن بقوة، وتُلاحَظ علامات التفاعل (توهّج، تغيّر لون، غاز CO₂ يعكّر ماء الجير).</li></ul>'});

/* 15 how strong the reaction is, and an example of a violent displacement (student book p.28) */
slide({id:'gap',ch:3,title:'كلما اتّسع الفرق اشتدّ التفاعل',tag:'قارن',
 html:function(){
  return `<div class="col" style="flex:1;gap:8px;min-height:0;justify-content:center"><div style="display:flex;gap:16px;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div class="panel" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">شدّة تفاعل الكربون مع أكاسيد ثلاثة فلزات</div>
     ${serStrip(['C','Zn','Fe','Cu'],{cls:'mini'})}
     ${barsHTML('gb1',[{lab:'C + ZnO',parts:[[3,'used','']]},{lab:'C + FeO',parts:[[5,'used','']]},{lab:'C + CuO',parts:[[8,'used','']]}],8)}
     <div class="sm" style="font-size:16px">رسم توضيحي: طول الشريط يدل على شدّة التفاعل فقط، دون قياس.</div></div>
    <button type="button" class="btn acc" id="cmp" style="align-self:flex-start">قارن شدة التفاعل</button></div>
   <div class="col" style="width:430px;flex:none;gap:9px;justify-content:center">
    <div class="panel compact hide" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:21px;font-weight:800">أيّ الأكاسيد تتفاعل مع الكربون بأشد قوة؟</div>
     ${optsHTML([{t:'أكسيد النحاس CuO'},{t:'أكسيد الخارصين ZnO'},{t:'أكسيد الحديد FeO'}])}<div class="fb" style="min-height:26px"></div></div>
    <div class="panel hide" id="thm" style="padding:10px 14px;gap:5px"><div style="font-size:19px;font-weight:800;color:var(--gold)">مثال: إصلاح خط سكة حديد (الصورة ١-٧)</div><div style="font-size:17.5px;line-height:1.4">يختزل الألومنيوم أكسيد الحديد (III) تفاعلاً شديداً، فيتكوّن حديد منصهر يملأ الشقوق.</div><div class="bigeq" style="font-size:22px;direction:ltr;text-align:center">${eqn('2Al(s) + Fe2O3(s) → Al2O3(s) + 2Fe(l)')}</div></div>
  </div></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الفرق بين الكربون والنحاس أكبر منه بينه وبين الحديد أو الخارصين، فتفاعله مع <b>CuO</b> أشدّ.</div></div>`;},
 init:function(el){
  $('#cmp',el).addEventListener('click',function(){ this.disabled=true; $('#gb1',el).classList.add('go'); later(function(){ $('#q',el).classList.remove('hide') },1300) });
  bindMcq($('#q',el),[{t:'',ok:true,why:'النحاس أبعد عن الكربون في السلسلة، فالفرق في النشاط أكبر والتفاعل أشدّ'},{t:'',why:'الخارصين الأقرب إلى الكربون: أضعف الثلاثة'},{t:'',why:'الحديد في الوسط بين الخارصين والنحاس'}],$('.fb',el),function(){ $('#thm',el).classList.remove('hide'); unhide(el) });
 },
 note:'<ul><li>كتاب الطالب ص٢٨: «وسيُحدّد الاختلاف في النشاط الكيميائي بين الكربون والفلز مدى شدّة التفاعل. فعلى سبيل المثال، يكون الاختلاف في النشاط الكيميائي بين الكربون والنحاس أكبر مما عليه بين الكربون والحديد، لذلك سيكون متوقّعاً أن يكون التفاعل بين الكربون وأحد أكاسيد النحاس أكثر شدة من التفاعل بين الكربون وأحد أكاسيد الحديد». (هذه القاعدة <b>موجودة في الكتاب</b>، فلم أعتبرها إضافة.) والصورة ١-٧: «إصلاح خط سكة حديد باستخدام تفاعل الألومنيوم مع أكسيد الحديد (III)»؛ ويُشار إلى «تفاعلات الإزاحة الشديدة».</li><li>معادلة الألومنيوم مع أكسيد الحديد (III) من ورقة المراجعة وليست في الكتب (إثرائي)؛ والكتاب يذكر التطبيق فقط. الأشرطة رسم توضيحي بلا أرقام.</li></ul>'});

/* 16 Activity 1-4 (student book p.30-31): the text */
slide({id:'act14',ch:4,title:'نشاط ١-٤: تفاعلات إزاحة الفلزات',tag:'الطريقة',
 html:function(){
  var S=['باستخدام ماصة، أضف ١٠ نقاط من محلول كبريتات النحاس (II) إلى أربع من حفر طبق كومبو.','باستخدام الطرف المدبّب لملعقة كيمياويات صغيرة ونظيفة، أضف كمية صغيرة من كل من مساحيق الفلزات (النحاس، الحديد، الماغنيسيوم، الخارصين) على التوالي إلى الحفر من ١ إلى ٤.','كرّر الخطوة ٢ على محاليل كبريتات الحديد (II) وكبريتات الماغنيسيوم وكبريتات الخارصين.','سجّل ملاحظاتك في جدول النتائج.','رتّب الفلزات من الأقل نشاطاً إلى الأكثر نشاطاً.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:440px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--gold)">المهارات</div><div style="font-size:18px;line-height:1.35">ينجز التجربة ويسجّل الملاحظات والقياسات والتقديرات. يناقش الملاحظات التجريبية والبيانات ويقيّمها.</div></div>
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المواد والأدوات</div><div style="font-size:16.5px;line-height:1.35">طبق كومبو (أو طبق أبيض)، ٤ ماصات، ملعقة كيمياويات صغيرة، منديل ورقي. محاليل ٠٫٥ mol/L من كبريتات النحاس (II) والحديد (II) والماغنيسيوم والخارصين. مساحيق: نحاس، حديد، ماغنيسيوم، خارصين.</div></div>
    <div class="panel safe" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:#ffb3a8">⚠ احتياطات الأمان</div><ul style="margin:0;padding-inline-start:20px;font-size:16.5px;line-height:1.35"><li>ضع النظارة الواقية، وارتدِ معطف المختبر، والبس القفازين عند الضرورة.</li><li>مسحوق الماغنيسيوم والخارصين سريع الاشتعال.</li><li>كبريتات النحاس (II) مهيّجة للجلد.</li><li>اغسل يديك بعد التجربة.</li></ul></div></div>
   <div class="panel" style="flex:1;min-width:0;padding:10px 16px;gap:4px"><div style="font-size:22px;font-weight:800;color:var(--gold)">الطريقة</div><ol class="acts" style="font-size:20px;line-height:1.5">${S.map(function(s){return '<li>'+s+'</li>'}).join('')}</ol>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">نفتح الحفر افتراضياً في الشريحة التالية.</div></div></div>`;},
 init:function(el){ later(function(){ unhide(el) },400) },
 note:'<ul><li>نشاط ١-٤ في كتاب الطالب ص٣٠–٣١: المواد والطريقة والأمان منقولة بتصرّف قليل. «يُستخدم طبق كومبو ذو المقياس المجهري، أو أطباق خزفية بيضاء مربعات... يسمح هذا التمرين القائم على الملاحظة العملية بترتيب الفلزات وفقاً لنشاطها في سلسلة النشاط الكيميائي». المهارات من دليل المعلم (والكتاب يضيف مهارة الاستخدام الآمن للأدوات). الدليل: «يتيح هذا النشاط فرصة جيدة للطلاب ليُجروا ملاحظات دقيقة ويستنتجوا بأنفسهم ترتيب النشاط».</li><li>ملاحظات الدليل: إذا لم تتوفر أطباق كومبو فيُستخدم أنابيب اختبار؛ تُلاحظ التفاعلات بإضافة كمّيات صغيرة جداً من الفلزات؛ يمكن وضع الأطباق على ورقة بيضاء.</li></ul>'});

/* 17 virtual plate for Activity 1-4 */
slide({id:'lab14',ch:4,title:'نشاط ١-٤: افتح الحفر وسجّل',tag:'اضغط على كل خلية',cls:'labs',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="panel" style="padding:8px 10px">${plateHTML('pl',P14)}</div>
    <div class="fb" id="pfb" style="min-height:48px;text-align:center;font-size:20px"></div></div>
   <div class="col" style="width:330px;flex:none;gap:9px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:4px"><div style="font-size:19px;font-weight:800;color:var(--gold)">لون المحاليل في البداية</div><div style="font-size:17.5px;line-height:1.5">كبريتات النحاس (II): <b style="color:#9fd6ff">أزرق</b><br>كبريتات الحديد (II): <b style="color:#b8e0a8">أخضر فاتح</b><br>كبريتات الماغنيسيوم والخارصين: <b>عديمة اللون</b></div></div>
    <button type="button" class="btn" id="all">افتح كل الحفر</button>
    <div class="panel" style="padding:8px 14px;gap:4px"><div style="font-size:19px;font-weight:800;color:var(--gold)">معايير النجاح في النشاط</div>
     <div class="skills"><div class="sk" id="k1"><i>✓</i><span>أنفّذ التجربة وأسجّل الملاحظات.</span></div><div class="sk" id="k2"><i>✓</i><span>أناقش الملاحظات وأقيّمها.</span></div></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px">النحاس لم يتفاعل مع أي محلول، والماغنيسيوم أزاح الجميع. نرتّب الآن في الشريحة التالية.</div></div></div>`;},
 init:function(el){
  var pl=bindPlate(el,'pl',P14,$('#pfb',el),function(){ $('#k1',el).classList.add('done'); $('#k2',el).classList.add('done'); unhide(el) });
  $('#all',el).addEventListener('click',function(){ this.disabled=true; pl.open() });
 },
 note:'<ul><li>نتائج نشاط ١-٤ كما في دليل المعلم (ص٣٠): <b>النحاس</b> لا يتفاعل مع أي محلول؛ <b>الحديد</b> يتفاعل مع كبريتات النحاس فقط (يتلاشى اللون الأزرق ويتشكل راسب بنيّ محمرّ على الفلز)؛ <b>الماغنيسيوم</b> يتفاعل مع كبريتات النحاس والحديد والخارصين (مع الحديد: يتلاشى الأخضر ويتشكل راسب رمادي داكن؛ مع الخارصين: يبقى المحلول عديم اللون ويتشكل راسب رمادي)؛ <b>الخارصين</b> يتفاعل مع كبريتات النحاس والحديد فقط، ولا يتفاعل مع كبريتات الماغنيسيوم.</li><li>الرسم تخطيطي: لون المحلول بعد التفاعل ولون الراسب تقريبيان. الخلايا الرمادية (الفلز مع ملحه) لا تُجرى.</li></ul>'});

/* 18 the conclusion of Activity 1-4 and its questions (student book p.31) */
slide({id:'act14c',ch:4,title:'نشاط ١-٤: الاستنتاج والأسئلة',tag:'رتّب ثم أجب',
 html:function(){
  return `<div class="col" style="flex:1;gap:9px;justify-content:center;min-height:0">
   <div class="panel" style="padding:10px 16px;gap:7px"><div style="font-size:21px;font-weight:800;color:var(--gold)">رتّب الفلزات الأربعة من الأقل نشاطاً إلى الأكثر نشاطاً:</div>
    <div class="ordh"><span>الأقل نشاطاً</span>${[0,1,2,3].map(function(i){return '<div class="mslot" data-k="'+i+'"><span class="ph">'+ar(i+1)+'</span></div>'}).join('')}<span>الأكثر نشاطاً</span></div>
    <div id="tray" class="tray" style="display:flex;gap:10px;justify-content:center"></div><div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div id="qs" class="hide" style="display:flex;gap:14px;align-items:stretch">
    <div class="panel compact" id="q1" style="flex:1;padding:10px 14px;gap:6px"><div style="font-size:19px;font-weight:800">س١(ج): الكروم أنشط من النحاس وأقل نشاطاً من الماغنيسيوم. ماذا يحدث عند إضافته إلى كبريتات النحاس (II)؟</div>
     ${optsHTML([{t:'يزيح النحاس: كبريتات الكروم (III) + نحاس'},{t:'لا يحدث تفاعل'},{t:'يتكوّن ماغنيسيوم'}])}<div class="fb3" style="min-height:22px"></div></div>
    <div class="panel compact" id="q2" style="flex:1;padding:10px 14px;gap:6px"><div style="font-size:19px;font-weight:800">س٢: كيف نقارن نشاط الكروم بنشاط الحديد والخارصين؟</div>
     ${optsHTML([{t:'نضيف مسحوق الكروم إلى كبريتات الحديد (II) وكبريتات الخارصين ونلاحظ التفاعل'},{t:'نضيف الكروم إلى الماء فقط'},{t:'نقارن لون المساحيق'}])}<div class="fb4" style="min-height:22px"></div></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الأقل ← الأكثر: <b class="num">Cu &lt; Fe &lt; Zn &lt; Mg</b>. الفلز الأنشط يزيح الآخر من محلول ملحه.</div></div>`;},
 init:function(el){
  var a=false, b=false;
  function chk(){ if(a&&b) unhide(el) }
  bindMatch(el,[['1','<span class="num">Fe</span>'],['3','<span class="num">Mg</span>'],['0','<span class="num">Cu</span>'],['2','<span class="num">Zn</span>']],{css:'font-size:24px;padding:4px 18px;font-family:var(--font-display)',more:'صح! كمّل',done:'ممتاز: Cu ثم Fe ثم Zn ثم Mg',bad:'تذكّر: النحاس لم يتفاعل مع شيء، والماغنيسيوم أزاح الجميع',onDone:function(){ $('#qs',el).classList.remove('hide') }});
  bindMcq($('#q1',el),[{t:'',ok:true,why:'جواب الدليل: كبريتات النحاس (II) + كروم ← كبريتات الكروم (III) + نحاس'},{t:'',why:'الكروم أنشط من النحاس، فيزيحه'},{t:'',why:'الكروم أقل نشاطاً من الماغنيسيوم فلا يكوّنه'}],$('.fb3',el),function(){a=true; chk()});
  bindMcq($('#q2',el),[{t:'',ok:true,why:'هذا ما يقترحه دليل المعلم: نختبر تفاعل الكروم مع محلولي الحديد والخارصين'},{t:'',why:'الماء وحده لا يميّز بين فلزات معتدلة النشاط'},{t:'',why:'اللون لا يدلّ على النشاط'}],$('.fb4',el),function(){b=true; chk()});
 },
 note:'<ul><li>استنتاج نشاط ١-٤ (الدليل ص٣٠): من الأقل نشاطاً إلى الأكثر: النحاس، الحديد، الخارصين، الماغنيسيوم. أسئلة النشاط (الكتاب ص٣١): س١ أكمل المعادلات اللفظية (أ: لا يحدث تفاعل؛ ب: كبريتات الماغنيسيوم + كروم ← كبريتات الكروم (III) + ماغنيسيوم، أي «كبريتات الكروم (III) + ماغنيسيوم ← كبريتات الماغنيسيوم + كروم»؛ ج: كبريتات النحاس (II) + كروم ← كبريتات الكروم (III) + نحاس). س٢: «أضف مسحوق الكروم إلى محلولي كبريتات الخارصين وكبريتات الحديد (II)، أو أضف مسحوقي الحديد والخارصين إلى كبريتات الكروم (III)، ولاحظ هل سيحدث تفاعل، وأيهما أسرع». س٣ (المعادلات الأيونية) في الشريحة ٢١.</li></ul>'});

/* 19 Table 1-6 (student book p.29): metals with salt solutions */
slide({id:'tbl16',ch:4,title:'الجدول ١-٦: الفلزات ومحاليل الأملاح',tag:'افتح الخلايا ثم رتّب',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="panel" style="padding:8px 10px">${plateHTML('p16',P16)}</div>
    <div class="fb" id="p16fb" style="min-height:48px;text-align:center;font-size:20px"></div></div>
   <div class="col" style="width:350px;flex:none;gap:9px;justify-content:center">
    <button type="button" class="btn" id="all16">افتح كل الخلايا</button>
    <div class="panel compact hide" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:21px;font-weight:800">رتّب الفلزات الأربعة من الأنشط إلى الأقل:</div>
     ${optsHTML([{t:'Zn ثم Fe ثم Cu ثم Ag'},{t:'Ag ثم Cu ثم Fe ثم Zn'},{t:'Fe ثم Zn ثم Ag ثم Cu'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px">الفضة لا تزيح أحداً، والخارصين يزيح الجميع: <b class="num">Zn &gt; Fe &gt; Cu &gt; Ag</b>.</div></div></div>`;},
 init:function(el){
  var pl=bindPlate(el,'p16',P16,$('#p16fb',el),function(){ $('#q',el).classList.remove('hide') });
  $('#all16',el).addEventListener('click',function(){ this.disabled=true; pl.open() });
  bindMcq($('#q',el),[{t:'',ok:true,why:'الخارصين يزيح الثلاثة، والحديد يزيح النحاس والفضة، والنحاس يزيح الفضة، والفضة لا تزيح شيئاً'},{t:'',why:'هذا عكس الترتيب: الفضة لا تتفاعل مع أي محلول'},{t:'',why:'الخارصين يزيح الحديد، فهو الأنشط'}],$('.fb',$('#q',el)),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٢٩ (الجدول ١-٦): الخارصين مع كبريتات الحديد (II): يتلاشى اللون الأخضر ويتكوّن راسب رمادي داكن؛ مع كبريتات النحاس (II): يتلاشى الأزرق ويتكوّن راسب بنيّ محمرّ؛ مع نترات الفضة: يبقى المحلول عديم اللون ويتكوّن راسب رمادي-فضيّ. الحديد: لا يتفاعل مع كبريتات الخارصين؛ يزيح النحاس والفضة. النحاس: لا يتفاعل مع الخارصين والحديد؛ يزيح الفضة (يصبح المحلول أزرق). الفضة: لا تتفاعل مع أي منها. «يشير هذه النتائج إلى أن ترتيب الفلزات الأربعة وفقاً لنشاطها: خارصين، حديد، نحاس، فضة».</li><li>تمرين ١-٢ (د، هـ) في كتاب النشاط يطلب الجدول نفسه تقريباً (٥ أنابيب: Zn في FeSO₄، Zn في CuSO₄، Fe في CuSO₄، Cu في AgNO₃، Ag في CuSO₄) والترتيب Zn > Fe > Cu > Ag.</li></ul>'});

/* 20 Zn + CuSO4: the electrons move (student book pp.29-30, Figure 1-5) */
slide({id:'zncu',ch:4,title:'ماذا حدث بين الخارصين والنحاس؟',tag:'اضغط «الخطوة التالية»',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 12px;gap:6px">${xferSVG()}<div id="xt" style="font-size:21px;font-weight:700;text-align:center;min-height:62px;line-height:1.4;width:100%"></div>
     <div style="display:flex;gap:10px;justify-content:center"><button type="button" class="btn acc" id="xn">الخطوة التالية ▸</button><button type="button" class="btn" id="xr">من البداية</button></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الفلز <b>الأنشط</b> يفقد إلكتروناته بسهولة فيتحوّل إلى أيون، والأيون الأقل نشاطاً يكتسبها فيصير ذرّة.</div></div>
   <div class="col" style="width:420px;flex:none;gap:9px;justify-content:center">
    <div class="panel" style="padding:10px 14px;gap:5px"><div style="font-size:19px;font-weight:800;color:var(--cyan)">كبريتات النحاس (II) + خارصين ← نحاس + كبريتات الخارصين</div><div class="bigeq" style="font-size:24px;direction:ltr;text-align:center">${eqn('Zn(s) + CuSO4(aq) → ZnSO4(aq) + Cu(s)')}</div><div class="bigeq" style="font-size:25px;direction:ltr;text-align:center;color:var(--gold)">${eqn('Zn(s) + Cu^2+(aq) → Zn^2+(aq) + Cu(s)')}</div></div>
    <div class="panel compact hide" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:21px;font-weight:800">لماذا يزيح الخارصين النحاس؟</div>
     ${optsHTML([{t:'لأنه أنشط: أقدر على تكوين أيون موجب'},{t:'لأنه أثقل من النحاس'},{t:'لأنه يذوب في الماء'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){
  var st=0, T=['الخارصين ذرة متعادلة، وفي المحلول أيون النحاس Cu²⁺ (لون المحلول أزرق).','تفقد ذرة الخارصين إلكترونين وتصبح أيوناً موجباً Zn²⁺.','ينتقل الإلكترونان إلى أيون النحاس Cu²⁺.','يكتسب Cu²⁺ إلكترونين فيصير ذرة نحاس تترسّب على الخارصين (راسب بنيّ محمرّ)، ويتلاشى اللون الأزرق.'];
  var svg=$('#xf',el);
  function paint(){ svg.setAttribute('class','xf s'+st); $('#xt',el).textContent=T[st]; $('#xn',el).classList.toggle('hide',st===3); if(st===3) $('#q',el).classList.remove('hide') }
  $('#xn',el).addEventListener('click',function(){ if(st<3){st++; paint()} });
  $('#xr',el).addEventListener('click',function(){ st=0; paint() });
  paint();
  bindMcq($('#q',el),[{t:'',ok:true,why:'الأنشط أقدر على تكوين أيونات موجبة، لذلك يفقد الخارصين إلكترونيه ويكوّن Zn²⁺'},{t:'',why:'الكتلة لا تحدّد النشاط الكيميائي'},{t:'',why:'سبب التفاعل هو الفرق في النشاط'}],$('.fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٢٩–٣٠ (الصورة ١-٨ والشكل ١-٥): تُترك قطعة من الخارصين في محلول كبريتات النحاس (II): كبريتات النحاس (II) + خارصين ← نحاس + كبريتات الخارصين، Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s). يتلاشى اللون الأزرق ويتكوّن راسب بنيّ محمرّ. «بما أن الخارصين أكثر نشاطاً من النحاس، فهو قابلية لتكوين أيون موجب أكبر... ويفقد Zn إلكترونين ويصبح أيوناً موجباً Zn²⁺؛ ويكسب Cu²⁺ إلكترونين ويصبح ذرة Cu».</li><li>الرسم مرسوم لهذا العرض (الشكل ١-٥ نفسه غير منقول). الصورة الخلفية صورة قدمتها أنت (الخارصين في كبريتات النحاس).</li></ul>'});

/* 21 ionic equations: atoms and charges (student book p.30; worksheet 1-4) */
(function(){
  var items=[
   {q:'في تفاعل <span class="num">Zn + CuSO<sub>4</sub></span> لا يظهر أيون الكبريتات في المعادلة الأيونية. لماذا؟',opts:[{t:'لأنه يظهر في الطرفين دون تغيّر (أيون متفرّج)',ok:true,why:'الكبريتات SO₄²⁻ موجودة قبل التفاعل وبعده كما هي'},{t:'لأنه يتحوّل إلى غاز',why:'لا يتكوّن غاز في هذا التفاعل'},{t:'لأنه يترسّب',why:'الراسب هو النحاس'}]},
   {q:'اختر المعادلة الأيونية الصحيحة لتفاعل <b>Cu</b> مع نترات الفضة <span class="num">AgNO<sub>3</sub></span>:',opts:[{t:eqn('Cu(s) + 2Ag^+(aq) → Cu^2+(aq) + 2Ag(s)'),ok:true,why:'الشحنة +٢ في الطرفين، والذرات متساوية'},{t:eqn('Cu(s) + Ag^+(aq) → Cu^2+(aq) + Ag(s)'),why:'الشحنة +١ على اليسار و+٢ على اليمين: غير متساوية'},{t:eqn('Cu(s) + 2Ag^+(aq) → Cu^+(aq) + 2Ag(s)'),why:'أيون النحاس هنا Cu²⁺ (كبريتات النحاس II)، والشحنات غير متساوية'}]},
   {q:'اختر المعادلة الأيونية الصحيحة لتفاعل <b>Al</b> مع <span class="num">Cu<sup>2+</sup></span> (ورقة العمل ١-٤):',opts:[{t:eqn('2Al(s) + 3Cu^2+(aq) → 2Al^3+(aq) + 3Cu(s)'),ok:true,why:'الشحنة الكلية +٦ في الطرفين: ٢×٣ = ٣×٢'},{t:eqn('Al(s) + Cu^2+(aq) → Al^3+(aq) + Cu(s)'),why:'الشحنة +٢ على اليسار و+٣ على اليمين'},{t:eqn('2Al(s) + 3Cu^2+(aq) → 2Al^2+(aq) + 3Cu(s)'),why:'أيون الألومنيوم Al³⁺ لا Al²⁺'}]},
   {q:'<b>س٣ (الكتاب ص٣١):</b> أيّ هذه المعادلات الأيونية تمثّل تفاعل الماغنيسيوم مع كبريتات الحديد (II)؟',opts:[{t:eqn('Mg(s) + Fe^2+(aq) → Mg^2+(aq) + Fe(s)'),ok:true,why:'الماغنيسيوم أنشط من الحديد فيزيحه'},{t:eqn('Fe(s) + Mg^2+(aq) → Fe^2+(aq) + Mg(s)'),why:'هذا عكس التفاعل: الحديد لا يزيح الماغنيسيوم'},{t:eqn('Mg(s) + Fe^2+(aq) → Mg^+(aq) + Fe(s)'),why:'أيون الماغنيسيوم Mg²⁺ لا Mg⁺'}]}
  ];
  slide({id:'ionic',ch:4,title:'المعادلة الأيونية: الذرات والشحنات',tag:'سؤال في كل مرة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'ionic')},
   note:'<ul><li>كتاب الطالب ص٣٠: «يمكن تبسيط التفاعل في هيئة معادلة أيونية: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)» (أيون الكبريتات متفرّج لا يظهر). ومثال الفضة: «٢AgNO₃(aq) + Cu(s) → Cu(NO₃)₂(aq) + ٢Ag(s)» والأيونية «Cu(s) + ٢Ag⁺(aq) → Cu²⁺(aq) + ٢Ag(s)». وإجابات دليل المعلم لسؤال ٣ في النشاط ١-٤: ستّ معادلات أيونية (Fe/Cu²⁺، Mg/Cu²⁺، Mg/Zn²⁺، Mg/Fe²⁺، Zn/Cu²⁺، Zn/Fe²⁺). ورقة العمل ١-٤ (س٣): ٢Al + ٣Cu²⁺ → ٢Al³⁺ + ٣Cu.</li><li>الخطأ الشائع الذي تعالجه الأسئلة: عدم موازنة <b>الشحنات</b> في المعادلة الأيونية.</li></ul>'});
})();
