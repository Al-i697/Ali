/* ---------- lesson 1-2, part C: catalysts, misconceptions, summary, the worksheet and the questions of the student book ---------- */

/* 14 catalysts: the energy profile */
slide({id:'cat',ch:3,title:'العوامل الحفّازة',tag:'حرّك المنزلق',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="tabs2" id="tb"><button type="button" class="on" data-s="0">بدون حفّاز</button><button type="button" data-s="1">مع حفّاز</button></div>
    <div class="panel" style="padding:12px 16px">${profileSVG(0)}
     <div style="display:flex;align-items:center;gap:12px;margin-top:6px"><span style="font-size:19px;font-weight:800">أضف الحفّاز:</span><input type="range" id="sl" min="0" max="100" value="0" aria-label="كمية الحفّاز" style="flex:1"></div></div>
    <div class="fb" id="rd" style="min-height:28px;text-align:center;font-size:21px">بدون حفّاز: طاقة التنشيط كبيرة والتفاعل بطيء.</div></div>
   <div class="col" style="width:380px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">ما أثر الحفّاز في التفاعل؟</div>
     ${optsHTML([{t:'يخفض طاقة التنشيط فيسرّع التفاعل'},{t:'يرفع طاقة التنشيط'},{t:'يغيّر ناتج التفاعل'}])}<div class="fb2" style="min-height:26px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الحفّاز مادة <b>تسرّع</b> التفاعل ولا <b>تُستهلك</b> فيه: وكثير من العناصر الانتقالية ومركّباتها حفّازات.</div></div></div>`;},
 init:function(el){
  var moved=false, ans=false;
  function chk(){ if(ans&&moved) unhide(el) }
  function setS(s){
    var peak=44+s*58, d='M40 150 C120 150 150 '+peak.toFixed(1)+' 230 '+peak.toFixed(1)+' C310 '+peak.toFixed(1)+' 330 190 420 190';
    $('#pcurve',el).setAttribute('d',d); var a=$('#parr',el); a.setAttribute('y2',peak.toFixed(1)); var l=$('#plab',el); l.setAttribute('y',(peak-12).toFixed(1));
    $('#sl',el).value=Math.round(s*100);
    $$('#tb button',el).forEach(function(b){b.classList.toggle('on',(+b.getAttribute('data-s'))===(s>=.5?1:0))});
    say($('#rd',el), s<.15?'بدون حفّاز: طاقة التنشيط كبيرة والتفاعل بطيء.':(s>.85?'مع الحفّاز: طاقة التنشيط أقل فيصبح التفاعل أسرع.':'كلما زدنا الحفّاز انخفضت طاقة التنشيط.'),s>.85?'ok':'');
    if(s>.85){ moved=true; chk() }
  }
  $('#sl',el).addEventListener('input',function(){ setS(this.value/100) });
  $$('#tb button',el).forEach(function(b){b.addEventListener('click',function(){ setS(+b.getAttribute('data-s')) })});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: الطاقة اللازمة لبدء التفاعل أقل'},{t:'',why:'الحفّاز يخفضها ولا يرفعها'},{t:'',why:'النواتج نفسها: يتغيّر الزمن فقط'}],$('.fb2',el),function(){ans=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص١٩: أهمية العوامل الحفّازة. عرضك: «مواد تسرّع التفاعلات دون أن تُستهلك». عرض NotebookLM: مخطط الطاقة مع الحفّاز وبدونه. هدف ٤-٣: «غالباً ما تستخدم عناصرها ومركّباتها كعوامل حفّازة».</li><li>المخطط تخطيطي بلا أرقام: يبيّن أن الحفّاز يوفّر مساراً بطاقة تنشيط أقل ولا يغيّر طاقة المتفاعلات والنواتج. اسحب المنزلق أو اضغط «مع حفّاز».</li><li>الامتحان ٢٠٢٣/٢٠٢٤ الدور الثاني س٣: الحديد حفّاز في تصنيع الأمونيا.</li></ul>'});

/* 15 catalysts and their industrial processes (student book table 1-2) */
slide({id:'catm',ch:3,title:'حفّازات مألوفة',tag:'اسحب (جدول ١-٢)',
 html:function(){
  var R=[['fe','تصنيع <b>الأمونيا</b> (عملية هابر)'],['ni','هدرجة <b>الزيوت النباتية</b> لصنع المارغرين'],['pt','<b>المحوّلات الحفّازة</b> في عادم السيارات'],['ti','تصنيع <b>البولي إيثين</b>'],['v','تصنيع <b>حمض الكبريتيك</b> (طريقة التلامس)']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب الحفّاز إلى العملية التي يستخدمها:</div>
    ${R.map(function(r){return '<div class="whorow"><div class="whoc">'+r[1]+'</div><div class="mslot" data-k="'+r[0]+'"><span class="ph">الحفّاز</span></div></div>'}).join('')}
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:330px;flex:none;gap:12px;justify-content:center">
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">حفّازات الصناعة: <b>Fe وNi وPt/Rh وTiCl<sub>4</sub> وV<sub>2</sub>O<sub>5</sub></b>، وأغلبها عناصر انتقالية أو مركّباتها.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['fe','<b class="num">Fe</b> الحديد'],['ni','<b class="num">Ni</b> النيكل'],['pt','<b class="num">Pt</b> و<b class="num">Rh</b>'],['ti','<b class="num">TiCl<sub>4</sub></b>'],['v','<b class="num">V<sub>2</sub>O<sub>5</sub></b>']],{css:'font-size:21px;padding:8px 14px',more:'صح! كمّل',done:'ممتاز: عرفتَ الحفّازات الخمسة',bad:'فكّر: أي حفّاز يرتبط بهذه العملية؟'});
 },
 note:'<ul><li>كتاب الطالب ص١٩ جدول ١-٢: Fe (هابر: الأمونيا)، Ni (هدرجة الزيوت النباتية: المارغرين)، Pt وRh (المحوّل الحفّاز)، TiCl₄ (بولي إيثين)، V₂O₅ (طريقة التلامس: حمض الكبريتيك). سؤال ١-٦: الحديد في عملية هابر. دليل المعلم: «عرّف الطلاب بمركّبات حفّازة».</li><li>الامتحانات: ٢٠٢٥/٢٠٢٦ الدور الأول س٥ (النيكل ← الزبدة النباتية) والدور الثاني س٦، ٢٠٢٤/٢٠٢٥ الدور الثاني س٤ (الجدول)، ٢٠٢٣/٢٠٢٤ الدور الثاني س٣، ٢٠٢٢/٢٠٢٣ المسائي س١ (النيكل والبولي إيثين ← كلوريد التيتانيوم IV).</li><li>الجدول المدرسي «٧ صفحات» يذكر الصيغ أيضاً. TiCl₄ وV₂O₅ مركّبان للتيتانيوم والفاناديوم (عنصران انتقاليان).</li></ul>'});

/* 16 true or false: misconceptions */
slide({id:'myth',ch:3,title:'صح أم خطأ؟',tag:'مفاهيم خاطئة',
 html:function(){
  var items=[['كل الفلزات عناصر انتقالية','f','خطأ: الصوديوم والماغنيسيوم فلزات وليست انتقالية'],['العناصر الانتقالية تقع بين المجموعتين II وIII','t','صح: كتلة في وسط الجدول'],['مركّبات العناصر الانتقالية كلها بيضاء','f','خطأ: كثير منها ملوّن (Cu²⁺ أزرق)'],['يُستخدم الحديد حفّازاً في صنع الأمونيا','t','صح: عملية هابر'],['كثافة الحديد وانصهاره أقل من كثافة الصوديوم وانصهاره','f','خطأ: الحديد أعلى منه كثافةً وانصهاراً'],['يُستهلك الحفّاز بالكامل في التفاعل','f','خطأ: يسرّع التفاعل ولا يُستهلك']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="clsw">${clsHTML(items,[['t','صح'],['f','خطأ']],24)}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:300px;flex:none;gap:12px;justify-content:center"><div class="gbar hide" id="gb" style="font-size:21px">صحّحنا المفاهيم الخاطئة الشائعة عن العناصر الانتقالية.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: ما الذي يميّز العناصر الانتقالية؟') },
 note:'<ul><li>دليل المعلم (المفهوم الخاطئ): الطلاب يعتقدون أن العناصر الانتقالية هي كل الفلزات، ويذكرون الخصائص العامة بدل المميّزة. العبارتان الثالثة والخامسة من صياغتي من بيانات الكتاب (الألوان، والكثافة والانصهار).</li></ul>'});

/* 17 summary */
slide({id:'sum',ch:3,title:'خلاصة: ما يميّز العناصر الانتقالية',tag:'اجمع',
 html:function(){
  var items=[['موقعها','كتلة في الجدول بين المجموعتين II وIII، تبدأ من الدورة ٤.'],['كثافة عالية وانصهار مرتفع','أعلى بكثير من فلزات المجموعة I.'],['مركّبات ملوّنة','Cu²⁺ أزرق وFe²⁺ أخضر وCo²⁺ وردي. وأملاح المجموعات I–III بيضاء.'],['أكثر من حالة تكافؤ','Fe²⁺ وFe³⁺: راسباهما مع NaOH أخضر وبني محمر.'],['حفّازات','Fe وNi وPt/Rh وTiCl₄ وV₂O₅: تسرّع التفاعل ولا تُستهلك.'],['استخدامات','Ti رؤوس الحفر، Au تلامسات، Cr مقاومة التآكل، W فتائل، Cu-Ni عملات.']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:320px;flex:none;gap:10px;align-items:center;justify-content:center"><div class="panel" style="padding:14px 12px;align-items:center;gap:8px;width:100%"><div class="ptw sh-t mini" style="width:100%">${ptCellsHTML()}</div><div class="sm" style="font-size:19px;text-align:center">الكتلة الملوّنة: العناصر الانتقالية</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">اضغط على كل بند:</div>
    ${cardsHTML(items,'two')}
    <div class="gbar hide" id="gb" style="font-size:21px">العناصر الانتقالية: <b>تجمّع</b> من الفلزات تميّزها <b>الألوان</b> و<b>الحفّازية</b> و<b>تعدد التكافؤ</b>.</div></div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>الخلاصة من هدف ٤-٣ ومن مصفوفة المصادر: الموقع (الدليل والكتاب)، الكثافة والانصهار (الكتاب ص١٨)، الألوان (جدول ١-١)، تعدد التكافؤ (سؤال ١-٤)، الحفّازات (جدول ١-٢)، الاستخدامات (الكتاب ص١٧).</li></ul>'});

/* 18 activity-book worksheet 1-1 */
slide({id:'ws',ch:4,title:'ورقة العمل ١-١: العناصر الانتقالية',tag:'كتاب النشاط',
 html:function(){
  var E=[['٢١','Sc'],['٢٢','Ti'],['٢٣','V'],['٢٤','Cr'],['٢٥','Mn'],['٢٦','Fe'],['٢٧','Co'],['٢٨','Ni'],['٢٩','Cu'],['٣٠','Zn']];
  var Q=[['س١: ما اسم الصف بين العنصرين ذوي العددين الذريين ٢١ و٣٠؟','العناصر الانتقالية.'],['س٢: (أ) فلزات أم لافلزات؟ (ب) ثلاث خصائص فيزيائية نموذجية لها.','(أ) فلزات. (ب) توصل الكهرباء والحرارة، وتُطرق وتُسحب، ودرجات انصهارها مرتفعة.'],['س٣: خاصيتان تميّزانها عن غيرها من الفلزات.','مركّباتها ملوّنة، وفيها أكثر من أيون (حالة تكافؤ)، وعناصرها ومركّباتها غالباً حفّازات.']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">العناصر من ٢١ إلى ٣٠ في الجدول الدوري:</div>
    <div class="panel" style="padding:8px 10px"><div class="wst">${E.map(function(e){return '<div class="wsc"><small>'+e[0]+'</small><b class="num">'+e[1]+'</b></div>'}).join('')}</div></div>
    <div style="font-size:21px;font-weight:800;color:var(--gold)">س٤: اسحب الاسم الكيميائي إلى رمز كل عنصر:</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">${[['fe','Fe'],['cu','Cu'],['zn','Zn'],['mn','Mn'],['v','V']].map(function(r){return '<div class="whorow ion" style="grid-template-columns:50px 1fr"><div class="whoc num" style="font-size:25px;font-weight:800;text-align:center">'+r[1]+'</div><div class="mslot" data-k="'+r[0]+'"><span class="ph">الاسم</span></div></div>'}).join('')}</div>
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div><div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:470px;flex:none;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">اضغط على السؤال لتظهر الإجابة:</div>
    ${cardsHTML(Q,'tight')}
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">أنهيتَ ورقة العمل ١-١ ✓ العناصر: حديد ونحاس وخارصين ومنغنيز وفاناديوم.</div></div></div>`;},
 init:function(el){
  var a=false, b=false;
  function chk(){ if(a&&b) unhide(el) }
  bindCards(el,function(){a=true; chk()});
  bindMatch(el,[['fe','الحديد'],['cu','النحاس'],['zn','الخارصين'],['mn','المنغنيز'],['v','الفاناديوم']],{css:'font-size:20px;padding:6px 14px',more:'صح! كمّل',done:'ممتاز: أسماء العناصر',bad:'فكّر في اسم العنصر',onDone:function(){b=true; chk()}});
 },
 note:'<ul><li>ورقة العمل ١-١ في كتاب النشاط (ص٢١): جدول دوري جزئي للعناصر ١–٣٦؛ س١: اسم الصف بين ٢١ و٣٠؛ س٢ (أ) فلزات أم لافلزات (ب) ثلاث خصائص فيزيائية نموذجية؛ س٣ خاصيتان مميزتان؛ س٤: الأسماء الكيميائية لـ Fe وCu وZn وMn وV. الإجابات من دليل المعلم: العناصر الانتقالية؛ فلزات؛ توصل الكهرباء والحرارة وتُطرق وانصهارها مرتفع؛ مركّبات ملوّنة وأكثر من أيون وحفّازات؛ الأسماء. صياغة الأسئلة هنا مختصرة من صفحة الكتاب.</li><li>دليل المعلم يضيف Cr الكروم إلى إجابة س٤، والورقة تسأل عن خمسة عناصر في ما سجّلتُ: راجع نسختك.</li><li><b>تنبيه:</b> الخارصين Zn في التصنيف الدقيق ليس عنصراً انتقالياً نموذجياً (مركّباته بيضاء وتكافؤه ثابت)، لكن الورقة تعدّه ضمن العناصر ٢١–٣٠، فاتبعتُ الدليل.</li></ul>'});

/* 19 student book questions 1-3 to 1-6 */
(function(){
  var items=[
   {q:'<b>السؤال ١-٣:</b> اذكر ثلاث خصائص للعناصر الانتقالية.',opts:[{t:'قوية، كثافتها عالية، ودرجة انصهارها مرتفعة',ok:true,why:'ومن الخصائص أيضاً: مركّباتها ملوّنة، وأكثر من أيون، وحفّازات'},{t:'لينة، كثافتها منخفضة، ودرجة انصهارها منخفضة',why:'هذه خصائص فلزات المجموعة I'},{t:'مركّباتها بيضاء، ولها أيون واحد، وتتفاعل بعنف مع الماء',why:'هذه ليست خصائص العناصر الانتقالية'}]},
   {q:'<b>السؤال ١-٤:</b> ما أيونا الحديد الشائعان؟',opts:[{t:'Fe⁺ وFe²⁺',why:'ليس للحديد أيون Fe⁺ شائع'},{t:'Fe²⁺ وFe³⁺',ok:true,why:'الحديد (II) والحديد (III)'},{t:'Fe³⁺ وFe⁴⁺',why:'ليس للحديد أيون Fe⁴⁺ شائع'}]},
   {q:'<b>السؤال ١-٥:</b> ما لون مركّبات النحاس (II)؟',opts:[{t:'أزرق',ok:true,why:'أيون Cu²⁺ أزرق'},{t:'أخضر',why:'الأخضر لون Fe²⁺ وCr³⁺'},{t:'أبيض',why:'الأبيض لأملاح المجموعات I–III'}]},
   {q:'<b>السؤال ١-٦:</b> ما العملية الصناعية التي يُستخدم فيها الحديد عاملاً حفّازاً؟',opts:[{t:'عملية هابر (صنع الأمونيا)',ok:true,why:'Fe حفّاز في صنع الأمونيا'},{t:'هدرجة الزيوت النباتية',why:'حفّازها النيكل Ni'},{t:'طريقة التلامس (حمض الكبريتيك)',why:'حفّازها V₂O₅'}]}
  ];
  slide({id:'q13',ch:4,title:'أسئلة ١-٣ إلى ١-٦ من الكتاب',tag:'ص١٩',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'q13')},
   note:'<ul><li>أسئلة كتاب الطالب ص١٩. إجابات دليل المعلم: ١-٣ (أي ثلاث): قوية وصلبة؛ كثافة عالية؛ انصهار مرتفع؛ مركّبات ملوّنة؛ أكثر من نوع أيون؛ غالباً حفّازات. ١-٤: Fe²⁺ وFe³⁺. ١-٥: أزرق. ١-٦: عملية هابر (الأمونيا). حوّلتُ الأسئلة المفتوحة إلى اختيار من متعدد.</li><li>واجب منزلي حسب الدليل.</li></ul>'});
})();

/* 20 end-of-unit question 4 */
slide({id:'eou4',ch:4,title:'سؤال نهاية الوحدة ٤',tag:'كتاب الطالب ص٣٤',
 html:function(){
  var items=[['س٤(أ): اذكر ثلاث خصائص مميِّزة للعناصر الانتقالية لا توجد في معظم الفلزات الأخرى.','مركّباتها ملوّنة؛ تكوّن أكثر من أيون (حالة تكافؤ)؛ عناصرها ومركّباتها غالباً حفّازات.'],['س٤(ب): اختر استخداماً للنحاس (عنصر انتقالي) واذكر الأسباب التي تجعله مناسباً.','الأسلاك الكهربائية: لأن النحاس موصل جيد للكهرباء، وقابل للسحب (يُطرق)، وتكلفته أقل من فلزات موصلة أفضل منه.']];
  return `<div style="display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center">
   <div style="font-size:21px;font-weight:800;color:var(--cyan)">أجب في دفترك ثم اضغط على السؤال لتظهر الإجابة النموذجية:</div>
   ${cardsHTML(items,'two')}
   <div class="gbar hide" id="gb" style="font-size:21px">أحسنت! أنهيت أسئلة كتاب الطالب لهذا الدرس.</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>أسئلة نهاية الوحدة، السؤال ٤ (أ وب)، والإجابات من دليل المعلم ص٣٧–٣٨: (أ) مركّبات ملوّنة، تكوّن أكثر من أيون، غالباً حفّازات. (ب) أسلاك كهربائية لأن النحاس موصل جيد وقابل للطرق وتكلفته أقل من موصلات أفضل.</li><li>واجب منزلي حسب الدليل: الأسئلة ١-٣ إلى ١-٦ وورقة العمل ١-١ وسؤال نهاية الوحدة ٤.</li></ul>'});
