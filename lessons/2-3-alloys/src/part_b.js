/* ---------- lesson 2-3, part B: steel and the alloy steels (goal 7-5, Tables 2-3 and 2-4) ---------- */

/* 7 steel: iron with a little carbon; the carbon scale of Table 2-3 */
slide({id:'steel',ch:2,title:'الفولاذ: حديد مع قليل من الكربون',tag:'اضغط على كل نوع',
 html:function(){
  return `<div class="col" style="flex:1;gap:8px;min-height:0">
   <div class="panel" style="padding:8px 16px;font-size:20px;font-weight:700;line-height:1.4">الفولاذ <b>سبيكة</b> من الحديد مع الكربون. والكربون يجعل الحديد أكثر <b>صلادة ومتانة</b>. رتّبنا الأنواع بحسب نسبة الكربون من الأقل إلى الأكثر:</div>
   <div class="csc" id="csc">
    <button type="button" data-i="0">الفولاذ الليّن<small>أقل من ٠٫٢٥٪</small></button>
    <button type="button" data-i="1">الفولاذ المتوسط<small>٠٫٢٥ – ٠٫٤٥٪</small></button>
    <button type="button" data-i="2">الفولاذ عالي الكربون<small>٠٫٤٥ – ١٫٥٪</small></button>
    <button type="button" data-i="3">الحديد الصلب<small>٢٫٥ – ٤٫٥٪</small></button></div>
   <div class="panel cdetail" id="cd" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:700;color:#ffe6a0">اضغط على نوع لتعرف خصائصه واستخداماته.</div></div>
   <div class="panel compact hide" id="q" style="padding:10px 18px;gap:7px"><div style="font-size:21px;font-weight:800">ماذا يحدث للفولاذ كلما زادت نسبة الكربون فيه؟</div>
    ${optsHTML([{t:'يصبح أصلد وأقل قابلية للطرق'},{t:'يصبح أليَن وأسهل في التشكيل'},{t:'تبقى خصائصه كما هي'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px;padding:6px 14px">كلما زاد <b>الكربون</b> زادت الصلادة وقلّت قابلية الطرق، حتى يصير الفلز <b>هشّاً</b>.</div></div>`;},
 init:function(el){
  var T=[{n:'الفولاذ الليّن',c:'أقل من ٠٫٢٥٪',p:'سهل التشكيل؛ ليس هشّاً',u:'هياكل السيارات، الآلات، السلاسل، أبراج الكهرباء (الأعمدة)',h:22,s:90},
         {n:'الفولاذ المتوسط (الصلادة)',c:'٠٫٢٥ – ٠٫٤٥٪',p:'أكثر صلادة من الفولاذ الليّن',u:'نوابض ومحاور السيارات، الجسور',h:48,s:68},
         {n:'الفولاذ عالي الكربون',c:'٠٫٤٥ – ١٫٥٪',p:'صلد وهش',u:'الأزاميل*، آلات القصّ، شفرات الحلاقة',h:88,s:28},
         {n:'الحديد الصلب (حديد الصبّ)',c:'٢٫٥ – ٤٫٥٪',p:'أرخص من الفولاذ؛ سهل الصبّ في قوالب',u:'صناديق ناقل الحركة (التروس)، قطع المحرّكات، أقراص المكابح',h:60,s:12}], seen=[0,0,0,0], cd=$('#cd',el);
  $$('#csc button',el).forEach(function(b){b.addEventListener('click',function(){
    var i=+b.getAttribute('data-i'), t=T[i]; $$('#csc button',el).forEach(function(x){x.classList.remove('sel')}); b.classList.add('sel','seen'); seen[i]=1;
    cd.innerHTML='<div style="font-size:23px;font-weight:800;color:var(--gold)">'+t.n+' <span style="font-size:19px;color:#ffe6a0">· كربون '+t.c+'</span></div>'+
     '<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:16px"><div style="font-size:20px;font-weight:700;line-height:1.5"><div><b>الخصائص:</b> '+t.p+'</div><div><b>الاستخدامات:</b> '+t.u+'</div>'+(i===2?'<div style="font-size:16px;color:#d9e6f5;margin-top:2px">* أدوات يستخدمها النجّار لنحت الخشب</div>':'')+'</div>'+
     '<div class="cbars" style="grid-template-columns:1fr"><div class="cmeter2"><span>الصلادة</span><div class="tr"><i style="width:'+t.h+'%"></i></div></div><div class="cmeter2 sf"><span>قابلية التشكيل</span><div class="tr"><i style="width:'+t.s+'%"></i></div></div></div></div>';
    if(seen.every(Boolean)) $('#q',el).classList.remove('hide');
  })});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: يزداد الكربون فتزداد الصلادة وتقل قابلية الطرق (جواب الدليل)'},{t:'',why:'العكس: زيادة الكربون تجعل الفولاذ أصلد'},{t:'',why:'الكربون هو الذي يغيّر خصائص الفولاذ'}],$('.fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٤٢: «ويُعدّ الفولاذ سبيكة مصنوعة بشكل رئيسي من الحديد مع ما نسبته من ٠٫٢ إلى ١٫٥٪ كربون. والكربون يجعل الحديد أكثر صلادة ومتانة. ويبيّن الجدول ٢-٣ هذه الأنواع». الجدول ٢-٣ (الحديد الصلب والفولاذ الكربوني): الحديد الصلب ٢٫٥–٤٫٥٪ (أرخص من الفولاذ؛ سهل الصبّ في قوالب: صناديق ناقل الحركة، قطع المحرّكات، أقراص المكابح)؛ الفولاذ الليّن أقل من ٠٫٢٥٪ (سهل التشكيل؛ ليس هشّاً: هياكل السيارات، الآلات، السلاسل، أبراج الكهرباء)؛ المتوسط ٠٫٢٥–٠٫٤٥٪ (أكثر صلادة من الليّن: نوابض ومحاور السيارات والجسور)؛ عالي الكربون ٠٫٤٥–١٫٥٪ (صلد وهش: الأزاميل وآلات القصّ وشفرات الحلاقة). سؤال ٢-١٧ وجوابه في الدليل: يجعل الفولاذ أكثر هشاشةً وصلادة وأقل قابلية للطرق.</li><li>اسم الصف الأول «الحديد الصلب» في الجدول، بينما نص الدرس ٢-٢ سمّاه «الحديد الصُّب/الزهر»؛ أبقيتُ اسم الجدول وأضفتُ «حديد الصبّ» بين قوسين. أعمدة الصلادة والقابلية للتشكيل رسم توضيحي نوعي (ليست قياسات).</li><li>عرضك (شريحة «الفولاذ») يذكر الاستخدام في صناعة السفن والساعات، والمتانة وقوة المقاومة للشد والتكلفة المنخفضة، وهي من الكتاب ص٤٢ أيضاً. الخلفية صورة الحدّاد من صورك السابقة.</li></ul>'});

/* 8 Table 2-3: match the use to its type */
slide({id:'t23',ch:2,title:'الجدول ٢-٣: لكل نوع استخدامه',tag:'اسحب الاستخدام إلى نوعه',
 html:function(){
  var R=[['0','الحديد الصلب','كربون ٢٫٥ – ٤٫٥٪ · أرخص من الفولاذ، سهل الصبّ'],['1','الفولاذ الليّن','كربون أقل من ٠٫٢٥٪ · سهل التشكيل، ليس هشّاً'],['2','الفولاذ المتوسط','كربون ٠٫٢٥ – ٠٫٤٥٪ · أكثر صلادة من الليّن'],['3','الفولاذ عالي الكربون','كربون ٠٫٤٥ – ١٫٥٪ · صلد وهش']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    ${R.map(function(r){return '<div style="display:grid;grid-template-columns:1fr 300px;gap:10px;align-items:center"><div class="panel" style="padding:7px 14px;gap:1px"><div style="font-size:22px;font-weight:800;color:var(--gold)">'+r[1]+'</div><div style="font-size:17.5px;font-weight:700;line-height:1.3">'+r[2]+'</div></div><div class="mslot" data-k="'+r[0]+'" style="min-height:62px;display:flex;align-items:center;justify-content:center;border-radius:12px;border:2px dashed rgba(255,255,255,.5)"><span class="ph" style="font-size:16px">ضع الاستخدام هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:24px"></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الخصائص تحدّد الاستخدام: الليّن للتشكيل، والمتوسط للقوة، وعالي الكربون للقطع، والصلب للصبّ.</div></div>
   <div class="col" style="width:330px;flex:none;justify-content:center"><div id="tray" class="tray" style="display:flex;flex-direction:column;gap:9px"></div></div></div>`;},
 init:function(el){
  bindMatch(el,[['0','صناديق ناقل الحركة وأقراص المكابح'],['1','هياكل السيارات وأبراج الكهرباء'],['2','نوابض ومحاور السيارات والجسور'],['3','الأزاميل وشفرات الحلاقة']],{css:'font-size:19px;padding:5px 12px;line-height:1.3;text-align:center',more:'صح! كمّل',done:'ممتاز: عرفنا الاستخدام المناسب لكل نوع',bad:'فكّر في خصائص النوع: هل هو ليّن أم صلد وهش؟'});
 },
 note:'<ul><li>الجدول ٢-٣ ص٤٢ (انظر الشريحة السابقة). اخترتُ من كل صف استخداماً أو اثنين لتناسب السحب. الأزاميل أدوات يستخدمها النجّار لنحت الخشب (حاشية الجدول).</li></ul>'});

/* 9 stainless steel */
slide({id:'ss',ch:2,title:'الفولاذ المقاوم للصدأ',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['العنصران الآخران','إضافة إلى الحديد: <b>الكروم</b> (<span class="num">Cr</span>) و<b>النيكل</b> (<span class="num">Ni</span>).'],
             ['الخصائص','متين؛ <b>لا يتآكل</b> (مقاوم للصدأ)؛ يكون لامعاً.'],
             ['الاستخدامات','أدوات المائدة، الأدوات الجراحية، أحواض المطابخ، <b>مصانع المواد الكيميائية</b>.']];
  return `<div class="col" style="flex:1;gap:10px;justify-content:center;min-height:0">
   <div class="panel" style="padding:10px 18px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--gold)">تركيب الفولاذ المقاوم للصدأ (الجدول ٢-٤)</div>${compBar([['Fe',74,CL.Fe],['Cr',18,CL.Cr],['Ni',8,CL.Ni]],['الحديد','الكروم','النيكل'])}</div>
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:10px 18px;gap:7px"><div style="font-size:21px;font-weight:800;line-height:1.35">لماذا يُفضَّل الفولاذ المقاوم للصدأ على الحديد النقي في أدوات المائدة؟</div>
    ${optsHTML([{t:'لأنه لا يصدأ بسهولة وهو أقوى وأمتن'},{t:'لأنه أرخص من أي فلز آخر'},{t:'لأنه لا يحتوي على حديد'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px;padding:6px 14px">الكروم والنيكل يمنحان الفولاذ <b>مقاومة التآكل</b>، لذلك يصلح لأدوات المائدة ومصانع الكيماويات.</div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: أقل عرضة للصدأ من الحديد وأقوى وأمتن (جواب الدليل لنهاية الوحدة ٤ أ ٣)'},{t:'',why:'السعر ليس سبب المقاومة للصدأ'},{t:'',why:'الحديد هو المكوّن الرئيسي (٧٤٪)'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٤٢: «يميل الفولاذ الكربوني إلى التآكل ما لم تتم حمايته. لذا تُضاف إليه فلزّات أخرى كالكروم والنيكل. ولا تقتصر وظيفة هذه الفلزّات على منع التآكل، بل تقوّي السبيكة التي تُسمّى الفولاذ المقاوم للصدأ (المقاوم للأكسدة) Stainless Steel». الجدول ٢-٤: الفولاذ المقاوم للصدأ: حديد ٧٤٪، كروم ١٨٪، نيكل ٨٪؛ خصائصه: متين؛ لا يتآكل؛ استخداماته: أدوات المائدة، الأدوات الجراحية، أحواض المطابخ، مصانع المواد الكيميائية. صندوق «تذكّر» ص٤٤ يوصي بمعرفة استخدامات الفولاذ الليّن (هياكل السيارات والآلات) والمقاوم للصدأ (مصانع الكيماويات وأدوات المائدة).</li><li>جواب الدليل لسؤال ٢-١٨ (لماذا يُضاف الكروم؟): لأنه يجعل الفولاذ أكثر مقاومة للتآكل ويحسّن مظهره بجعله أكثر لمعاناً. وجواب نهاية الوحدة ٤ أ ٢: الكروم والنيكل. عرضك (شريحة «سبائك الفولاذ»): «يضاف إليه فلزات كالكروم والنيكل لحمايته وتقويته».</li></ul>'});

/* 10 Table 2-4: tungsten steel and manganese steel */
slide({id:'alst',ch:2,title:'سبائك فولاذية أخرى',tag:'اضغط على كل بطاقة',
 html:function(){
  return `<div class="col" style="flex:1;gap:10px;justify-content:center;min-height:0">
   <div class="panel" style="padding:8px 16px;font-size:20px;font-weight:700;line-height:1.4">تُضاف كميات ضئيلة من عناصر انتقالية أخرى إلى الفولاذ فنحصل على <b>سبائك فولاذية</b>. كل نوع يعطي خصائص خاصة:</div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div class="col" style="gap:8px"><div class="panel" style="padding:8px 16px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--gold)">فولاذ التنغستن</div>${compBar([['Fe',95,CL.Fe],['W',5,CL.W]],['الحديد','التنغستن'])}</div>
     ${cardsHTML([['الخصائص والاستخدام','متين؛ <b>صلد</b> حتى عند درجات الحرارة المرتفعة: حواف أدوات القص ذات السرعات العالية.']],'')}</div>
    <div class="col" style="gap:8px"><div class="panel" style="padding:8px 16px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--gold)">فولاذ المنغنيز</div>${compBar([['Fe',87,CL.Fe],['Mn',13,CL.Mn]],['الحديد','المنغنيز'])}</div>
     ${cardsHTML([['الخصائص والاستخدام','متين؛ <b>مرن</b>: رؤوس المثاقب والنوابض.']],'')}</div></div>
   <div class="gbar hide" id="gb" style="font-size:20px;padding:6px 14px">بتغيير <b>العنصر المضاف</b> نتحكّم في خصائص الفولاذ. وهذه السبائك كلها تحتوي كربوناً قليلاً (أقل من ٠٫٤٥٪).</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٤٢ (الجدول ٢-٤ «بعض السبائك الفولاذية»): فولاذ التنغستن: حديد ٩٥٪، تنغستن ٥٪؛ متين؛ صلد حتى عند درجات الحرارة المرتفعة؛ حواف أدوات القص ذات السرعات العالية. فولاذ المنغنيز: حديد ٨٧٪، منغنيز ١٣٪؛ متين؛ مرن؛ رؤوس المثاقب والنوابض. حاشية الجدول: جميع هذه السبائك تحتوي على نسبة منخفضة من الكربون (أقل من ٠٫٤٥٪). والنص: «فعلى سبيل المثال، تجعل إضافة التنغستن الفولاذ أكثر صلادة وأكثر متانة عند درجات الحرارة المرتفعة، ليستخدم غالباً في أدوات الحفر وأدوات قطع أخرى ذات سرعات عالية».</li></ul>'});

/* 11 which steel for which job? (goal 7-5) */
slide({id:'steelq',ch:2,title:'أيّ فولاذ لأيّ عمل؟',tag:'اختر لكل استخدام',
 html:function(){
  var rows=[['هيكل سيارة','l','الفولاذ الليّن: سهل التشكيل وليس هشّاً'],
            ['ملاعق وشوك على مائدة الطعام','s','المقاوم للصدأ: لا يتآكل ولامع'],
            ['أوعية في مصنع للمواد الكيميائية','s','المقاوم للصدأ: لا يتآكل بالمواد الكيميائية'],
            ['حواف أدوات القص ذات السرعات العالية','t','فولاذ التنغستن: صلد حتى عند الحرارة العالية'],
            ['رؤوس المثاقب والنوابض','m','فولاذ المنغنيز: متين ومرن']];
  return `<div class="col" style="flex:1;gap:8px;min-height:0;justify-content:center">${clsHTML(rows,[['l','الليّن'],['s','المقاوم للصدأ'],['t','التنغستن'],['m','المنغنيز']],21)}
   <div class="fb" style="min-height:26px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px"><b>الفولاذ الليّن</b> لهياكل السيارات والآلات، و<b>المقاوم للصدأ</b> لأدوات المائدة ومصانع الكيماويات.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: ما الخاصية المطلوبة في هذا الاستخدام؟') },
 note:'<ul><li>الهدف ٧-٥ والجدولان ٢-٣ و٢-٤. سؤال ٢٠٢٢/٢٠٢٣ الدور الأول (مسائي) س٨ يطلب اسم السبيكة لهيكل السيارة (الفولاذ الليّن) ولأدوات المائدة (المقاوم للصدأ)، وهو في شريحة الامتحانات.</li></ul>'});

/* 12 compare the iron and steel types by property (the exam table) */
slide({id:'cmp',ch:2,title:'قارن بين الحديد الصلب وأنواع الفولاذ',tag:'اختر لكل خاصية',
 html:function(){
  var rows=[['أرخص من الفولاذ وسهل الصبّ في قوالب','c','الحديد الصلب (كربونه ٢٫٥–٤٫٥٪)'],
            ['سهل التشكيل وليس هشّاً','l','الفولاذ الليّن (كربونه أقل من ٠٫٢٥٪)'],
            ['صلد وهش، تُصنع منه شفرات الحلاقة','h','الفولاذ عالي الكربون (٠٫٤٥–١٫٥٪)'],
            ['متين ولا يتآكل (يحتوي الكروم والنيكل)','s','الفولاذ المقاوم للصدأ'],
            ['نسبة الكربون فيه أقل من ٠٫٢٥٪','l','الفولاذ الليّن']];
  return `<div class="col" style="flex:1;gap:8px;min-height:0;justify-content:center">${clsHTML(rows,[['c','الحديد الصلب'],['l','الفولاذ الليّن'],['h','عالي الكربون'],['s','المقاوم للصدأ']],21)}
   <div class="fb" style="min-height:26px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">كل نوع صُنع بنسبة كربون وعناصر مضافة تناسب <b>استخدامه</b>.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر في نسبة الكربون والعناصر المضافة') },
 note:'<ul><li>الجدولان ٢-٣ و٢-٤ ص٤٢. هذه المقارنة هي نفسها في أسئلة الامتحان (٢٠٢٤/٢٠٢٥ الدور الثاني س١٠؛ ٢٠٢٢/٢٠٢٣ الدور الأول المسائي س٨ ج). عرضك الأصلي (أهداف الدرس): «يقارن بين خصائص الحديد الصلب وخصائص سبائك الحديد، كالفولاذ الليّن والفولاذ المقاوم للصدأ».</li></ul>'});
