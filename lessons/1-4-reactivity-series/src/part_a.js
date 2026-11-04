/* ---------- lesson 1-4, part A: goals, the opening, the reactivity series ---------- */

/* 1 goals (teacher's guide p.23: goals 5-1, 5-2 and 5-3, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٥-١','يرتّب العناصر الآتية من حيث نشاطها الكيميائيّ: البوتاسيوم والصوديوم والكالسيوم والماغنيسيوم والألومنيوم والكربون والخارصين والحديد والهيدروجين والنحاس، وذلك بالإشارة إلى تفاعلات مثل هذه العناصر مع أيّ ممّا يأتي، إن وجدت: الماء أو بخار الماء، حمض الهيدروكلوريك المُخفَّف، اختزال أكاسيدها بالكربون.'],
         ['٥-٢','يصف سلسلة النشاط الكيميائيّ في ضوء ميل الفلزّات إلى تكوين أيونات موجبة، والذي يتّضح من خلال تفاعُله، إن وجد، مع أيّ ممّا يأتي: المحاليل الأيونية لمركّبات الفلزّات الأخرى، أكاسيد الفلزّات الأخرى.'],
         ['٥-٣','يستنتج ترتيبًا للنشاط الكيميائيّ للفلزّات بناءً على مجموعة من النتائج التجريبيّة.']];
  var C=['أرتّب الفلزات بحسب تفاعلها مع الماء والحمض والكربون.','أفسّر الترتيب بميل الذرة إلى تكوين أيون موجب (الإزاحة).','أستنتج الترتيب من نتائج تجارب، وأكتب المعادلات الرمزية والأيونية.'];
  return `<div class="frm brk" style="flex:1;padding:18px 28px 16px;justify-content:center;gap:7px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الموضوع ١-٤ · خمس حصص</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;line-height:1.1">نشاط <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">الفلزات</span></h1>
    <p style="font-size:21px;font-weight:700;line-height:1.3;margin:2px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:6px">${G.map(function(g){return '<button type="button" class="gi" style="font-size:18.5px;line-height:1.4"><span class="ck" style="width:30px;height:30px;font-size:18px">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:20px;font-weight:800;color:var(--cyan);margin:2px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr 1fr;gap:6px 14px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:18px;line-height:1.35"><span class="ck" style="width:28px;height:28px;font-size:17px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
    <div class="sarrow" style="margin-top:4px"><span>الأنشط</span><i></i><span>الأقل نشاطاً</span></div>
    ${serStrip(null,{cls:'mini'})}
   </div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف ٥-١ و٥-٢ و٥-٣ منقولة بنصها من دليل المعلم (ص٢٣). موارد الموضوع في الدليل: ٥ حصص؛ أنشطة ١-٢ و١-٣ و١-٤؛ كتاب الطالب الأسئلة ١-١٤ إلى ١-٢٠ وسؤالا ٢ و٥ من نهاية الوحدة؛ كتاب النشاط: تمرين ١-٢ (سلسلة النشاط) وتمرين ١-٣ (الطاقة في تفاعلات الإزاحة) وورقتا العمل ١-٣ و١-٤.</li><li>معايير النجاح الثلاثة صياغتي من نص الأهداف (والمهارات المكتوبة في الدليل للأنشطة مذكورة في شرائح الأنشطة). اضغط على الهدف أو المعيار لتظليله في نهاية الدرس.</li><li>الشريط الملوّن هو سلسلة النشاط الكيميائي كما في الشكل ١-٤ بالكتاب (ص٢٣): من الأنشط (يمين) إلى الأقل.</li></ul>'});

/* 2 hook: the starter equation of the teacher's deck */
slide({id:'prior',ch:0,title:'هل يحدث هذا التفاعل؟',tag:'تمهيد',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:14px;align-items:center;justify-content:center">
    <div class="panel" style="padding:22px 28px;align-items:center;gap:10px;width:100%"><div style="font-size:21px;font-weight:800;color:var(--cyan)">معادلة اقترحها طالب:</div><div class="bigeq" style="font-size:50px;color:var(--gold);direction:ltr;text-align:center">${eqn('2NaCl + Cu → CuCl2 + 2Na')}</div><div class="sm" style="font-size:21px;text-align:center">النحاس الصلب يُوضع في ملح الطعام المنصهر</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px;width:100%">لنعرف أيّ الفلزين أنشط نقارنهما بثلاث طرق: <b>تفاعلهما مع الماء أو البخار</b>، و<b>مع الحمض المخفف</b>، و<b>بالإزاحة</b> (فلز يحلّ محلّ فلز آخر).</div></div>
   <div class="col" style="width:430px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">هل يمكن أن يحدث هذا التفاعل؟</div>
     ${optsHTML([{t:'نعم، فالمعادلة موزونة'},{t:'نعم، فالنحاس يحلّ محلّ الصوديوم'},{t:'لا، فالنحاس أقل نشاطاً من الصوديوم ولا يزيحه'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',why:'المعادلة موزونة، لكن كونها موزونة لا يعني أنها تحدث'},{t:'',why:'الفلز يزيح فلزاً آخر فقط إذا كان أنشط منه'},{t:'',ok:true,why:'الصوديوم أنشط من النحاس، فلا يستطيع النحاس إزاحته'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>التمهيد من عرضك: معادلة «٢NaCl + Cu → CuCl₂ + ٢Na» ويحدد الطلاب هل يحدث التفاعل أم لا (الجواب: لا). المعادلة موزونة فعلاً، والخطأ فيها كيميائي لا حسابي: النحاس أقل نشاطاً من الصوديوم. هذه الصياغة من عرضك وليست في الكتب.</li><li>كتاب الطالب ص٢٣: «يمكننا الحصول على معلومات حول النشاط الكيميائي للفلزّات عن طريق استقصاء النواحي الآتية: التفاعلات مع الماء، التفاعلات مع الأحماض المخفّفة، تفاعلات إزاحة الفلزات». ودليل المعلم: «رغم أن هذا الموضوع يستند إلى تفاعلات تمّ التطرُّق إليها سابقًا، فمن الأفضل الاستعانة بها مرّة أخرى».</li></ul>'});

/* 3 history of metals (student book p.23) */
slide({id:'hist',ch:0,title:'الفلزات عبر التاريخ',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[
   ['من الذهب إلى البرونز','استخدم الإنسان قديماً الفلزات التي وُجدت حرّة نقيّة، ثم صنع السبائك مثل البرونز، ثم استخدم الحديد لصناعة الأدوات.'],
   ['الحديد ثم الفلزات الأنشط','حتى بعد العصرين البرونزي والحديدي استُخدم قليل من الفلزات بشكل واسع. أما الفلزات الأخرى الأكثر نشاطاً فلم يُحصل عليها إلا في القرن التاسع عشر.'],
   ['السيف العماني (الصورة ١-٦)','سيف في المتحف الوطني العماني يعود إلى ما بين القرنين ٩ و١٣ هـ: يدل على اختلاف النشاط الكيميائي بين الحديد (النصل) والفولاذ والفضة (المقبض).']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   <div style="font-size:22px;font-weight:800;color:var(--cyan)">متى بدأ الإنسان يستخدم كل فلز؟</div>
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">لماذا تأخّر الحصول على الفلزات الأنشط (مثل الألومنيوم) إلى القرن التاسع عشر؟</div>
    ${optsHTML([{t:'لأنها شديدة النشاط، فلا توجد حرّة ويصعب انتزاعها من مركّباتها'},{t:'لأنها نادرة جداً في الطبيعة'},{t:'لأنها ثقيلة ولا تُحمل'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:18.5px;padding:5px 14px">كلما كان الفلز <b>أنشط</b> كان تفاعله أسهل وأشدّ، واستخلاصه من مركّباته أصعب: نرتّبه اليوم في <b>سلسلة النشاط الكيميائي</b>.</div></div>`;},
 init:function(el){
  var cards=false, ans=false;
  function chk(){ if(cards&&ans) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'الفلزات الأنشط تتحد مع الأكسجين وغيره بسهولة فلا توجد حرّة (ستدرس طرق استخلاصها في الوحدة الثانية)'},{t:'',why:'ليست السبب: السبب كيميائي'},{t:'',why:'الوزن لا علاقة له بصعوبة استخلاصها'}],$('.fb',el),function(){ans=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٢٣ (مدخل الموضوع): «قديمًا استخدم الإنسان الفلزّات التي تم العثور عليها في هيئتها الأصلية النقية (مثل الذهب)، ثم استخدمت السبائك كالبرونز، ثم الحديد... وحتى بعد العصرين البرونزي والحديدي، استُخدم قليل من الفلزّات بشكل واسع. أما الفلزّات الأخرى الأكثر نشاطًا فلم يتم الحصول عليها إلا في القرن التاسع عشر». والسيف في الصورة ١-٦: «يؤكد ... على اختلاف النشاط الكيميائي للفولاذ والفضة اللذين صنع منهما مقبض السيف عن نشاط الحديد الذي صنع منه النصل».</li><li>تعليل السؤال (لماذا تأخّر استخلاص الأنشط) تفسيري مني، وهو تمهيد للوحدة الثانية (استخلاص الفلزات)؛ الكتاب لا ينص عليه صراحة هنا. الصورة ١-٦ نفسها غير منقولة.</li></ul>'});

/* 4 the series itself (student book Figure 1-4) */
slide({id:'series',ch:1,title:'سلسلة النشاط الكيميائي للفلزات',tag:'اضغط على العناصر',
 html:function(){
  return `<div class="col" style="flex:1;gap:9px;justify-content:center;min-height:0">
   <div class="sarrow"><span>الأكثر نشاطاً</span><i></i><span>الأقل نشاطاً</span></div>
   ${serStrip(null,{id:'ser',names:true})}
   <div style="display:flex;gap:10px;align-items:center"><div class="tabs2" id="vw"><button type="button" class="on" data-v="">حسب النشاط</button><button type="button" data-v="byg">حسب المجموعة</button></div>
    <div class="glegend hide" id="gl"><span style="background:#b0312a">I</span><span style="background:#9a5a08">II</span><span style="background:#7d7410">III</span><span style="background:#20704f">انتقالي</span><span style="background:#2f6fb0">IV</span><span style="background:#4a505c">لافلز</span></div></div>
   <div class="fb" id="rd" style="min-height:34px;font-size:22px;text-align:center;background:rgba(6,20,44,.86);border-radius:12px;padding:3px 14px">اضغط على أيّ عنصر لتعرف مجموعته وترتيبه.</div>
   <div style="display:flex;gap:16px;align-items:stretch">
    <div class="panel compact" id="q" style="flex:1;padding:10px 16px;gap:7px"><div style="font-size:21px;font-weight:800">أيّ الفلزين أنشط كيميائياً: <span class="num">Mg</span> أم <span class="num">Fe</span>؟</div>
     ${optsHTML([{t:'الماغنيسيوم Mg'},{t:'الحديد Fe'}])}<div class="fb2" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="flex:1;font-size:19px;padding:8px 14px;margin:0">الأعلى في السلسلة <b>أنشط</b>: يفقد إلكتروناته ويكوّن أيوناً موجباً بسهولة أكبر. وترتيب المجموعات: <b>I ثم II ثم III</b> ثم الانتقالية و<b>IV</b> (الأقل).</div></div></div>`;},
 init:function(el){
  var seen={}, n=0, ans=false;
  function chk(){ if(ans&&n>=4) unhide(el) }
  $$('#ser .sc',el).forEach(function(b,i){b.addEventListener('click',function(){
    $$('#ser .sc',el).forEach(function(x){x.classList.toggle('sel',x===b)});
    var s=SER[i], nm=s[2]==='nm', t;
    t='<b class="num">'+s[0]+'</b> · '+s[1]+' · '+GRP[s[2]]+' · الترتيب '+ar(i+1)+' من ١٤';
    if(nm) t+=' — '+(s[0]==='C'?'الكربون لافلز يُدرج في السلسلة للمقارنة (يختزل أكاسيد ما تحته)':'الهيدروجين لافلز يُدرج للمقارنة (الفلزات فوقه تزيحه من الحمض)');
    var f=$('#rd',el); f.innerHTML=t; f.className='fb pop';
    if(!seen[s[0]]){ seen[s[0]]=1; n++; chk() }
  })});
  $$('#vw button',el).forEach(function(b){b.addEventListener('click',function(){
    $$('#vw button',el).forEach(function(x){x.classList.toggle('on',x===b)});
    var g=b.getAttribute('data-v')==='byg'; $('#ser',el).classList.toggle('byg',g); $('#gl',el).classList.toggle('hide',!g);
  })});
  bindMcq($('#q',el),[{t:'',ok:true,why:'Mg في المجموعة II فوق الحديد في السلسلة'},{t:'',why:'الحديد أسفل الماغنيسيوم في السلسلة: أقل نشاطاً'}],$('.fb2',el),function(){ans=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٢٣ (الشكل ١-٤): K Na Ca Mg Al C Zn Fe Sn Pb H Cu Ag Au، من الأكثر نشاطاً إلى الأقل. «بشكل عام يكون ترتيب النشاط الكيميائي للفلزات على النحو الآتي: المجموعة I (الأكثر نشاطاً)، المجموعة II، المجموعة III، العناصر الانتقالية والمجموعة IV (الأقل نشاطاً)». الكربون والهيدروجين لافلزان أُدرجا للمقارنة.</li><li>أهداف الدليل (٥-١) تذكر عشرة عناصر فقط (K Na Ca Mg Al C Zn Fe H Cu)؛ أما Sn وPb وAg وAu فمن سلسلة الكتاب وتظهر في أسئلة الكتاب (١-١٨ وجدول ١-٦)، فهي إضافة من الكتاب لا من الهدف.</li><li>اللون تدريجي رسم توضيحي (من الأحمر للأنشط إلى الأزرق للأقل) كما في شكل الكتاب، وزر «حسب المجموعة» يلوّنها بالمجموعات.</li></ul>'});

/* 5 why carbon and hydrogen are in the series (student book pp.23, 25 and 28) */
slide({id:'chh',ch:1,title:'لماذا الكربون والهيدروجين في السلسلة؟',tag:'نعم أم لا؟',
 html:function(){
  var rows=[
   ['هل يتفاعل <b class="num">Mg</b> مع حمض الهيدروكلوريك المخفف؟ (يقع فوق H)','y','فوق الهيدروجين: يزيحه من الحمض'],
   ['هل يتفاعل <b class="num">Cu</b> مع حمض الهيدروكلوريك المخفف؟ (يقع تحت H)','n','تحت الهيدروجين: لا يزيحه فلا يتفاعل مع الحمض'],
   ['هل يمكن اختزال أكسيد <b class="num">Fe</b> بالكربون؟ (يقع تحت C)','y','تحت الكربون: الكربون أنشط فيأخذ الأكسجين'],
   ['هل يمكن اختزال أكسيد <b class="num">Al</b> بالكربون؟ (يقع فوق C)','n','فوق الكربون: الألومنيوم أنشط فلا يتأثر']];
  return `<div class="col" style="flex:1;gap:9px;justify-content:center;min-height:0">
   <div style="display:flex;gap:14px;align-items:center">${serStrip(['Ca','Mg','Al','C','Zn','Fe','H','Cu','Ag'],{cls:'mini',id:'ser2'})}</div>
   <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><div class="pill" style="font-size:19px;background:rgba(6,20,44,.88);color:#fff">فوق <b class="num">H</b>: يزيح الهيدروجين من الحمض</div><div class="pill" style="font-size:19px;background:rgba(6,20,44,.88);color:#fff">تحت <b class="num">C</b>: يمكن اختزال أكسيده بالكربون</div></div>
   <div class="clsw">${clsHTML(rows,[['y','نعم'],['n','لا']],19.5)}</div>
   <div class="fb" style="min-height:26px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">موقع <b>H</b> يخبرنا هل يتفاعل الفلز مع الحمض، وموقع <b>C</b> يخبرنا هل يستخلصه الكربون من أكسيده.</div></div>`;},
 init:function(el){
  $$('#ser2 .sc',el).forEach(function(b){ var k=b.getAttribute('data-s'); if(k==='C'||k==='H') b.classList.add('sel') });
  bindCls(el,$('.fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٢٣: «غالباً ما يكون العنصران: الكربون والهيدروجين وهما من اللافلزات، مدرجين في سلسلة النشاط الكيميائي؛ وهما مُدرجان لأهميّة معرفة ما إذا كان فلز ما أكثر نشاطاً من هذين العنصرين أم أقلّ نشاطاً منهما». وص٢٦: «الفلزات التي تقع فوق الهيدروجين قادرة على إزاحة الهيدروجين من مركّباته». وص٢٨: يُستخدم الكربون لإزالة الأكسجين من أكاسيد الفلزات التي تقع تحته في السلسلة (مثل الخارصين والحديد والنحاس).</li><li>عرضك وعرض NotebookLM: «أهمية معرفة موقع C وH: لمعرفة هل الفلز أنشط منهما أو أقل، هل يزيح H، هل يمكن استخلاصه بالكربون».</li></ul>'});
