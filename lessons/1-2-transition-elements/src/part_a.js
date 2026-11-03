/* ---------- lesson 1-2, part A: goals, the opening (prior learning, the periodic table) and what the transition elements are ---------- */

/* 1 goals (teacher's guide p.20: goal 4-3, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٤-٣','يصف العناصر الانتقاليّة بأنها تجمع من الفلزّات عالية الكثافة ذات درجات انصهار مرتفعة، وتُكوّن مركّبات ملوّنة، وغالبًا ما تستخدم عناصرها ومركّباتها كعوامل حفّازة للتفاعلات الكيميائية.']];
  var C=['أحدّد موقع العناصر الانتقالية في الجدول الدوري وأسمّي عناصر شائعة منها.','أذكر خصائصها وأميّز المميِّزة لها عن خصائص الفلزات العامة.','أربط لون المركّب بالأيون الانتقالي فيه.','أذكر عوامل حفّازة شائعة والعمليات التي تستخدمها.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:20px 28px 18px;justify-content:center;gap:8px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الموضوع ١-٢</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:56px;font-weight:800;line-height:1.1">العناصر <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">الانتقالية</span></h1>
    <p style="font-size:22px;font-weight:700;line-height:1.3;margin:4px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:8px">${G.map(function(g){return '<button type="button" class="gi"><span class="ck">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:20px;font-weight:800;color:var(--cyan);margin:4px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr;gap:6px 18px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:19px;line-height:1.4"><span class="ck" style="width:28px;height:28px;font-size:18px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:14px 12px;align-items:center;gap:8px;width:100%"><div class="ptw sh-t mini" style="width:100%">${ptCellsHTML()}</div><div class="sm" style="font-size:19px;text-align:center">الكتلة الملوّنة: العناصر الانتقالية</div></div>
    <div class="sm" style="font-size:22px;text-align:center;font-weight:700">أين تقع؟ وما الذي يميّزها؟</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الهدف ٤-٣ منقول بنصه من دليل المعلم (ص٢٠). الدرس حصة واحدة، وأسئلة الكتاب ١-٣ إلى ١-٦، وسؤال ٤ من نهاية الوحدة، وورقة العمل ١-١ في كتاب النشاط.</li><li>معايير النجاح الأربعة صياغتي أنا من نص الهدف لأن الدليل لا يكتب معايير لهذا الموضوع (المهارات في الدليل مرتبطة بالأنشطة العملية). عدّلها كما تشاء.</li><li>اضغط على الهدف أو المعيار لتظليله وأنت تراجع في نهاية الدرس.</li></ul>'});

/* 2 prior learning: nail, foil, copper coil */
slide({id:'prior',ch:0,title:'التقويم القبلي',tag:'ماذا نعرف؟',
 html:function(){
  var S=[['fe','مسمار حديد'],['al','رقائق ألومنيوم'],['cu','ملف نحاس']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">ثلاثة أشياء من حولنا:</div>
    <div class="panel" style="padding:14px 16px"><div style="display:flex;justify-content:space-around;align-items:flex-end;gap:10px;width:100%">${S.map(function(s){return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">'+objSVG(s[0])+'<b style="font-size:22px">'+s[1]+'</b></div>'}).join('')}</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px">هذه <b>الخصائص العامة للفلزات</b>. اليوم نبحث عمّا <b>يميّز</b> مجموعة منها: العناصر الانتقالية.</div></div>
   <div class="col" style="width:430px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">كلها فلزات. ما الذي تشترك فيه؟</div>
     ${optsHTML([{t:'صلبة وتوصل الكهرباء والحرارة وتُطرق وتُسحب'},{t:'كلها تتحطم عند الطرق'},{t:'كلها لا توصل الكهرباء'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صح: هذه خصائص الفلزات (الحديد والألومنيوم والنحاس)'},{t:'',why:'الفلزات تُطرق ولا تتحطم'},{t:'',why:'الفلزات موصلة جيدة للكهرباء'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>التقويم القبلي من عرضك وعرض NotebookLM: مسامير حديد ورقائق ألومنيوم وملف نحاس: «كم خاصية فلزية؟» (كثافة عالية وقوة، انصهار مرتفع، توصيل، طرق وسحب). حوّلته إلى سؤال اختيار من متعدد.</li><li>الهدف تهيئة للدرس: الخصائص العامة التي درسناها في ١-١، ثم ننتقل إلى ما يميّز العناصر الانتقالية.</li></ul>'});

/* 3 where are they: the periodic table with groups I to VIII */
slide({id:'where',ch:0,title:'أين تقع العناصر الانتقالية؟',tag:'لوّن الكتلة',
 html:function(){
  var head='<div class="gh">I</div><div class="gh">II</div><div class="gh tb">العناصر الانتقالية</div>'+['III','IV','V','VI','VII','VIII'].map(function(g){return '<div class="gh">'+g+'</div>'}).join('');
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:10px 12px;gap:6px"><div class="ptw" id="ptw">${head}${ptCellsHTML()}</div></div>
    <div class="pt-leg"><button type="button" data-s="t">لوّن العناصر الانتقالية</button><button type="button" data-s="cm">أبرز العناصر الشائعة</button></div>
    <div class="fb" id="pfb" style="min-height:28px;text-align:center;font-size:21px;background:rgba(6,20,44,.86);border-radius:12px;padding:3px 14px;align-self:center">اضغط على أي عنصر لتعرف اسمه.</div>
    <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px">العناصر الانتقالية <b>كتلة في وسط الجدول بين المجموعتين II وIII</b>، تبدأ من الدورة ٤: الحديد والنحاس والنيكل والبلاتين وغيرها.</div></div>
   <div class="col" style="width:330px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">لوّن الكتلة أولاً، ثم أجب: أين تقع العناصر الانتقالية؟</div>
     ${optsHTML([{t:'بين المجموعتين II وIII'},{t:'في أقصى يسار الجدول (المجموعة I)'},{t:'في أقصى يمين الجدول (المجموعة VIII)'}])}<div class="fb2" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){
  var w=$('#ptw',el), shown={}, ans=false;
  function chk(){ if(ans&&shown.t) unhide(el) }
  $$('.pt-leg button',el).forEach(function(b){b.addEventListener('click',function(){
    var k=b.getAttribute('data-s'); b.classList.toggle('on'); w.classList.toggle('sh-'+k,b.classList.contains('on')); if(b.classList.contains('on')) shown[k]=1; chk();
  })});
  $$('.pc',w).forEach(function(c){c.addEventListener('click',function(){
    var s=c.getAttribute('data-s'); if(c.classList.contains('gap')) return;
    $$('.pc.sel',w).forEach(function(x){x.classList.remove('sel')}); c.classList.add('sel');
    say($('#pfb',el), c.classList.contains('pl')?'الخانة تمثّل اللانثانيدات أو الأكتينيدات':(s+(PT_NAMES[s]?': '+PT_NAMES[s]:'')+(c.classList.contains('t')?' (عنصر انتقالي)':' (ليس انتقالياً)')));
  })});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: كتلة بين المجموعتين II وIII'},{t:'',why:'المجموعة I هي الفلزات القلوية: الليثيوم والصوديوم والبوتاسيوم'},{t:'',why:'المجموعة VIII هي الغازات النبيلة'}],$('.fb2',el),function(){ans=true; chk()});
 },
 note:'<ul><li>دليل المعلم: «حدّد مواقع العناصر الانتقالية واطلب تسمية فلزات شائعة، وتقع بين المجموعتين 2 و3». كتاب الطالب ص١٧: «بين المجموعتين II وIII» (Fe وCu وNi وPt). النوت: «بين 2A و3A، تبدأ من الدورة ٤». المعنى واحد، وكتبتُ الجدول بأرقام الكتاب الرومانية I–VIII. في الترقيم الحديث تكون «III» هي العمود ١٣، لأن الطلاب سيرون الترقيمين.</li><li>الكتلة الملوّنة من Sc إلى Zn في الدورة ٤، وما يقابلها في الدورات ٥–٧ (الخانتان «٥٧–٧١» و«٨٩–١٠٣» للّانثانيدات والأكتينيدات ولم ألوّنهما). ورقة العمل ١-١ تُسمّي العناصر من ٢١ إلى ٣٠ انتقالية، ومنها Zn.</li><li>الامتحان ٢٠٢٣/٢٠٢٤ الدور الثاني س١: رمز العنصر الانتقالي في الجدول (سنراه في شريحة الامتحانات).</li></ul>'});

/* 4 a block, not a group: what makes them different from group I */
slide({id:'group',ch:0,title:'تجمّع وليس مجموعة',tag:'ما الذي يميّزها؟',
 html:function(){
  var items=[
   ['ليست مجموعة واحدة','العناصر الانتقالية <b>تجمّع</b> بين المجموعتين II وIII، وليست عموداً واحداً مثل المجموعة I.'],
   ['ليست كل الفلزات انتقالية','الصوديوم والماغنيسيوم والألومنيوم <b>فلزات</b>، لكنها <b>ليست</b> عناصر انتقالية.'],
   ['قارن: الصوديوم (I) والحديد','الكثافة: Na ٠٫٩٧ مقابل Fe ٧٫٩ g/mL. الانصهار: Na ٩٨ مقابل Fe ١٥٤٠ °C. الصوديوم لين يُقطع بالسكين، والحديد قوي وصلب.'],
   ['ليست متطابقة تماماً','تختلف في ألوان مركّباتها واستخداماتها، وتشترك في الخصائص التي سنراها.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:420px;flex:none;gap:10px;align-items:center;justify-content:center">
    <div class="panel" style="padding:12px 14px;align-items:center;gap:8px;width:100%"><div class="ptw sh-t sh-g mini" style="width:100%">${ptCellsHTML()}</div>
     <div class="sm" style="font-size:19px;text-align:center">المجموعة I (عمود واحد) والكتلة الانتقالية (تجمّع)</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة لتظهر:</div>
    ${cardsHTML(items,'tight')}
    <div class="gbar hide" id="gb" style="font-size:21px">لا نحفظ «كل الفلزات»: نحفظ ما <b>يميّز</b> العناصر الانتقالية.</div></div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>دليل المعلم (أفكار التدريس): «هي كتلة بين المجموعتين II وIII. ليست كل العناصر الانتقالية متشابهة». المفهوم الخاطئ: «يعتقد الطلاب أن العناصر الانتقالية هي كل الفلزات». لذلك أركّز على ما يميّزها.</li><li>أرقام الكثافة والانصهار من ورقة العمل ١-٣ في كتاب النشاط (Na: ٠٫٩٧ و٩٨، Fe: ٧٫٩ و١٥٤٠). كتاب الطالب ص٢٠: الصوديوم لين ويُقطع بسهولة.</li></ul>'});

/* 5 the properties: nine cards from the box on p.18 of the student book */
slide({id:'props',ch:1,title:'خصائص العناصر الانتقالية',tag:'اضغط وتعرّف',
 html:function(){
  var items=[
   ['صلبة وقوية','قوتها كبيرة: مثل الحديد.'],
   ['انصهار مرتفع','معظمها صلب في درجة حرارة الغرفة.'],
   ['كثافة عالية','تغوص في الماء خلافاً لـ Na وK.'],
   ['موصلة جيدة','توصل الحرارة والكهرباء: مثل النحاس.'],
   ['تُطرق وتُسحب','تُشكَّل صفائح وأسلاكاً.'],
   ['مركّباتها ملوّنة','Cu²⁺ أزرق وFe²⁺ أخضر.'],
   ['أكثر من حالة تكافؤ','Fe²⁺ وFe³⁺.'],
   ['غالباً حفّازات','Fe في صنع الأمونيا.'],
   ['بعضها مغناطيسي','Fe وCo وNi.']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>
   ${cardsHTML(items,'three')}
   <div class="gbar hide" id="gb" style="font-size:21px">منها <b>خصائص عامة للفلزات</b>، ومنها ما <b>يميّز</b> العناصر الانتقالية. أيّها؟ هذا ما سنصنّفه الآن.</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص١٨ (صندوق الخصائص): صلبة وقوية، انصهار مرتفع، كثافة عالية، موصلة جيدة، تُطرق وتُسحب، كثير من مركّباتها ملوّنة، أكثر من حالة تكافؤ (Fe²⁺ وFe³⁺)، غالباً حفّازات، وبعضها مغناطيسي (Fe وCo وNi). هي <b>تسع خصائص</b> في الكتاب والصفحات السبع، و<b>ثماني</b> في عرضك وعرض NotebookLM (الحفّازية في شريحة مستقلة). اتبعتُ الكتاب.</li><li>الخصائص المميزة في هدف ٤-٣: كثافة عالية، انصهار مرتفع، مركّبات ملوّنة، حفّازات. سؤال ١-٣ في الكتاب يطلب ثلاثاً منها.</li><li>امتحانات: ٢٠٢٤/٢٠٢٥ الدور الأول س٢، و٢٠٢٣/٢٠٢٤ الدور الأول س٢ والدور الثاني س٢، و٢٠٢٢/٢٠٢٣ (الصباحي س١، والدور الثاني س٢).</li></ul>'});

/* 6 sort: shared with all metals, or distinctive of the transition elements? */
slide({id:'sort',ch:1,title:'مشتركة أم مميِّزة؟',tag:'صنّف',
 html:function(){
  var items=[['يوصل الكهرباء والحرارة','s','مشتركة: كل الفلزات توصل (دائرة ١-١)'],['كثير من مركّباته <b>ملوّنة</b>','d','مميِّزة: أملاح المجموعات I–III بيضاء'],['قابل للطرق والسحب','s','مشتركة: تفسّرها الرابطة الفلزية'],['غالباً يعمل <b>حفّازاً</b>','d','مميِّزة: مثل Fe في صنع الأمونيا'],['له <b>أكثر من حالة تكافؤ</b> (Fe²⁺ وFe³⁺)','d','مميِّزة: الصوديوم له +١ فقط'],['صلب ولامع (معظمها)','s','مشتركة: الفلزات عموماً صلبة لامعة']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">لكل خاصية: اضغط «مشتركة» أو «مميِّزة»:</div>
    <div class="clsw">${clsHTML(items,[['s','مشتركة'],['d','مميِّزة']],24)}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:340px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800;color:var(--gold)">انتبه</div><div class="sm" style="font-size:21px">في الإجابة اذكر ما <b>يميّز</b> العناصر الانتقالية، لا ما تشترك فيه مع كل الفلزات.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">المميِّزة: <b>مركّبات ملوّنة، أكثر من حالة تكافؤ، حفّازات</b> (والكثافة والانصهار العاليان مقارنةً بالمجموعة I).</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: هل تنطبق على الصوديوم أيضاً؟') },
 note:'<ul><li>دليل المعلم (المفهوم الخاطئ): الطلاب يذكرون الخصائص العامة للفلزات بدل المميِّزة للانتقالية، «فيجب التركيز على قدرتها على تحفيز التفاعلات وتكوين مركّبات ملوّنة». الأسئلة ٢٠٢٤/٢٠٢٥ الدور الأول س٢ و٢٠٢٣/٢٠٢٤ الدور الثاني س٢ (خاصيتان كيميائيتان) تقيس ذلك.</li><li>الكثافة العالية والانصهار المرتفع في نص الهدف ٤-٣ تُقارن فيها العناصر الانتقالية بفلزات المجموعة I (انظر الشريحة التالية). والبنود الستة هنا من صياغتي.</li></ul>'});
