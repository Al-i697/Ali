/* ---------- lesson 2-1, part A: goals, the opening, metals in nature, minerals and ores ---------- */

/* 1 goals (teacher's guide p.39: goals 5-1, 7-1, 7-2 and 7-12, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٥-١','يرتّب العناصر الآتية من حيث نشاطها الكيميائيّ: البوتاسيوم والصوديوم والكالسيوم والماغنيسيوم والألومنيوم والكربون والخارصين والحديد والهيدروجين والنحاس، وذلك بالإشارة إلى تفاعلات مثل هذه العناصر مع أيّ ممّا يأتي، إن وجدت: الماء أو بخار الماء، حمض الهيدروكلوريك المخفّف، اختزال أكسيديها بالكربون.'],
         ['٧-١','يربط طريقة استخلاص الفلزّ من مادّته الخام بموقعه في سلسلة النشاط الكيميائيّ للفلزّات الواردة في الموضوع رقم ٥ «سلسلة نشاط» وفلزّات أخرى، وذلك بناءً على المعلومات المعطاة.'],
         ['٧-٢','يصف استخدام الكربون في استخراج بعض الفلزّات من خاماتها.'],
         ['٧-١٢','يصف خامات الفلزّ بأنّها موارد محدودة، وبالتّالي يظهر الحاجة إلى إعادة تدوير الفلزّات.']];
  var C=['أربط طريقة الاستخلاص بموقع الفلز في سلسلة النشاط.','أكتب معادلات تحميص الكبريتيد واختزال الأكسيد بالكربون.','أفسّر لماذا نعيد تدوير الفلزات.'];
  return `<div class="frm brk" style="flex:1;padding:20px 30px 18px;justify-content:center;gap:9px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الموضوع ٢-١ · حصتان</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:56px;font-weight:800;line-height:1.1">استخلاص <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">الفلزات</span></h1>
    <p style="font-size:21px;font-weight:700;line-height:1.3;margin:2px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:7px">${G.map(function(g){return '<button type="button" class="gi" style="font-size:19px;line-height:1.45"><span class="ck" style="width:30px;height:30px;font-size:18px">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:20px;font-weight:800;color:var(--cyan);margin:4px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr 1fr;gap:6px 14px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:18px;line-height:1.35"><span class="ck" style="width:28px;height:28px;font-size:17px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف ٥-١ و٧-١ و٧-٢ و٧-١٢ منقولة بنصها من دليل المعلم (ص٣٩). موارد الموضوع: حصتان؛ نشاط ٢-١ (استخلاص فلز من الأكسيد باستخدام الفحم)؛ كتاب الطالب الأسئلة ٢-١ إلى ٢-٨؛ أسئلة نهاية الوحدة: السؤالان ١ و٢(ب)؛ ولا مصدر في كتاب النشاط. الواجب كما في الدليل.</li><li>الهدف ٥-١ مكرَّر من الدرس ١-٤ (سلسلة النشاط)، وهنا نضيف ارتباطها بالاستخلاص. معايير النجاح الثلاثة صياغتي أنا وليست من الدليل.</li><li>التمهيد من عرضك: «توقع عن ماذا يبحث الأولاد في الصورة؟» (صورة الأطفال وهم يغربلون الرمل)؛ لم أضع الصورة لأنها ليست من الصور التي أرسلتها، وجعلتُ التمهيد سؤال المقارنة بين الذهب والصوديوم.</li></ul>'});

/* 2 hook: why gold is found alone and sodium is not */
slide({id:'hook',ch:0,title:'من أين تأتي الفلزات؟',tag:'تمهيد',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:14px;justify-content:center">
    <div class="panel" style="padding:16px 22px;gap:10px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">سلسلة النشاط الكيميائي (من الدرس السابق)</div>
     ${serStrip(null,{})}
     <div class="sarrow"><span>الأكثر نشاطاً</span><i></i><span>الأقل نشاطاً</span></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px;padding:10px 18px">الفلز شديد النشاط يتحد مع غيره فيوجد في <b>مركّبات</b>، ولا نحصل عليه فلزاً إلا بـ<b>استخلاصه</b> من هذه المركّبات.</div></div>
   <div class="col" style="width:460px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:14px 18px;gap:9px"><div style="font-size:23px;font-weight:800;line-height:1.35">نجد الذهب في الطبيعة فلزاً منفرداً، أما الصوديوم فلا نجده إلا في مركّبات. لماذا؟</div>
     ${optsHTML([{t:'الذهب قليل النشاط والصوديوم شديد النشاط فيتحد بسهولة مع عناصر أخرى'},{t:'الذهب أثقل من الصوديوم'},{t:'الصوديوم نادر جداً في القشرة الأرضية'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: كلما زاد نشاط الفلز زاد ميله إلى الاتحاد مع عناصر أخرى'},{t:'',why:'الكثافة لا تحدد هل الفلز يوجد منفرداً أم لا'},{t:'',why:'الصوديوم من أكثر العناصر وفرة، لكنه يوجد في مركّبات مثل ملح الطعام'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٣٥: معظم الفلزات شديدة النشاط، ولذلك لا توجد حرّة بل متحدة في مركّبات؛ أما الفلزات غير النشطة كالذهب والفضة (وأحياناً النحاس) فتوجد منفردة. هذا الفرق أساس الدرس كله: موقع الفلز في سلسلة النشاط يحدد طريقة استخلاصه.</li><li>التمهيد في عرضك صورة أطفال يبحثون في الرمل ويسأل عمّا يبحثون؛ وضعتُ بدلها سؤال المقارنة لأن صورتهم ليست ضمن الصور المرسلة.</li></ul>'});

/* 3 metals in nature: native and combined */
slide({id:'natural',ch:1,title:'الفلزات في الطبيعة',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[
   ['فلزات غير نشطة','الذهب والفضة (وأحياناً النحاس) توجد في القشرة الأرضية <b>منفردة</b> غير مرتبطة بعناصر أخرى. نقول إنها توجد بصورة طبيعية نقية (native).'],
   ['فلزات نشطة','معظم الفلزات شديدة النشاط، فتوجد <b>متحدة</b> مع عناصر أخرى في مركّبات تسمّى <b>المعادن</b> (Minerals)، وهي غير نقية.'],
   ['كيف نصل إليها؟','المعادن توجد كترسبات ضمن الصخور؛ نستخرج الصخور ونستخلص منها الفلز.']];
  return `<div class="col" style="flex:1;gap:14px;justify-content:center;min-height:0">
   ${cardsHTML(items,'three')}
   <div class="panel compact" id="q" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">أيّ هذه الفلزات يمكن أن نجده منفرداً في الطبيعة؟</div>
    ${optsHTML([{t:'الفضة'},{t:'الصوديوم'},{t:'الكالسيوم'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">يوجد الفلز منفرداً إذا كان <b>قليل النشاط</b>، وفي مركّبات إذا كان <b>نشطاً</b>.</div></div>`;},
 init:function(el){
  var cards=false, q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الفضة قليلة النشاط فتوجد منفردة'},{t:'',why:'الصوديوم شديد النشاط ولا يوجد إلا في مركّبات'},{t:'',why:'الكالسيوم نشيط ويوجد في مركّبات'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٣٥ (الصورة ٢-١: قطعة من النحاس في صورتها الطبيعية). «المعادن» (Minerals) هي المركّبات التي توجد في الطبيعة، وهي غير نقية. عرضك: «توجد كعناصر منفردة (عناصر فلزية نقية)» و«توجد متحدة مع عناصر أخرى في هيئة مركّبات يُطلق عليها معادن (غير نقية)».</li><li>ملاحظة مقارنة بالعرضين: عرضك وعرض NotebookLM يضعان النحاس مع الفضة والذهب في «الفلزات غير النشطة التي توجد منفردة». كتاب الطالب يذكر النحاس «أحياناً» فقط، ويضعه في جدول ٢-٢ في فئة «خام الكبريتيد مسخّن في الهواء»، فاتبعتُ الكتاب (انظر شريحة ٧).</li></ul>'});

/* 4 mineral, ore, native: match the terms with their meanings */
slide({id:'minerals',ch:1,title:'المعدن والخام والوجود الطبيعي',tag:'اسحب أو اضغط ثم اختر',
 html:function(){
  var T=[['المعدن (Mineral)',0],['الخام (Ore)',1],['الوجود الطبيعي (native)',2]];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    ${T.map(function(t){return '<div style="display:grid;grid-template-columns:260px 1fr;gap:12px;align-items:center"><div class="panel" style="padding:10px 14px;font-size:24px;font-weight:800;color:var(--gold)">'+t[0]+'</div><div class="mslot" data-k="'+t[1]+'" style="min-height:78px;display:flex;align-items:center;justify-content:center;border-radius:14px;border:2px dashed rgba(255,255,255,.5)"><span class="ph" style="font-size:18px">ضع المعنى هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:28px"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الخام = صخر يحتوي <b>معدناً</b> بكمية تكفي لاستخلاص الفلز منه.</div></div>
   <div class="col" style="width:380px;flex:none;justify-content:center"><div id="tray" class="tray" style="display:flex;flex-direction:column;gap:10px"></div></div></div>`;},
 init:function(el){
  bindMatch(el,[['0','مركّب يحتوي الفلز، يوجد في الطبيعة وهو غير نقي'],['1','صخور مستخرجة تحتوي على معادن غير نقية بكمية كافية لاستخلاص الفلز'],['2','وجود الفلز في القشرة الأرضية نقياً غير مرتبط بعناصر أخرى']],{css:'font-size:19px;padding:6px 14px;line-height:1.35;text-align:center',more:'صح! كمّل',done:'ممتاز: عرفنا الفرق بين المصطلحات الثلاثة',bad:'فكّر في معنى كلمة المصطلح'});
 },
 note:'<ul><li>كتاب الطالب ص٣٥: «المعادن Minerals» مركّبات الفلزات التي توجد في الطبيعة؛ و«الخام Ore» صخر يحتوي على ما يكفي من المعدن لاستخلاص الفلز؛ و«الوجود الطبيعي native» لفلز نقي. عرضك: «المادة الخام: الصخور المستخرجة التي تحتوي على معادن غير نقية».</li><li>سؤال ٢-١ في الكتاب (ما المقصود بمصطلح native؟) في شريحة أسئلة الكتاب.</li></ul>'});

/* 5 Table 2-1: ore names */
slide({id:'tbl21',ch:1,title:'الجدول ٢-١: بعض الفلزات وخاماتها',tag:'اسحب اسم الخام',
 html:function(){
  var R=[['Al','Al2O3'],['Cu','CuFeS2'],['Fe','Fe2O3'],['Na','NaCl'],['Sn','SnO2'],['Zn','ZnS'],['Pb','PbS']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="width:640px;flex:none;gap:5px;justify-content:center">
    <div class="panel" style="padding:8px 12px;gap:4px"><div style="display:grid;grid-template-columns:90px 190px 1fr;gap:8px;font-size:17px;font-weight:800;color:var(--cyan);padding:0 6px"><span>الفلز</span><span>المركّب في الخام</span><span>اسم الخام</span></div>
    ${R.map(function(r,i){return '<div style="display:grid;grid-template-columns:90px 190px 1fr;gap:8px;align-items:center"><span class="num" style="font-size:25px;font-weight:800;color:var(--gold);padding:0 6px">'+r[0]+'</span><span style="font-size:23px;font-weight:700">'+eqn(r[1])+'</span><div class="mslot" data-k="'+i+'" style="min-height:44px;display:flex;align-items:center;justify-content:center;border-radius:11px;border:2px dashed rgba(255,255,255,.5)"><span class="ph" style="font-size:16px">؟</span></div></div>'}).join('')}</div>
    <div class="fb" style="min-height:26px"></div></div>
   <div class="col" style="flex:1;min-width:0;justify-content:center;gap:10px"><div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div>
    <div class="gbar hide" id="gb" style="font-size:19px">اسم <b>الخام</b> يختلف عن اسم <b>الفلز</b> وعن <b>صيغة المركّب</b>: الهيماتيت خام، وفيه المركّب Fe₂O₃، والفلز الحديد.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['0','البوكسيت'],['1','بيريت النحاس'],['2','الهيماتيت'],['3','الملح الصخري'],['4','حجر القصدير'],['5','بلند الخارصين'],['6','الجالينا']],{css:'font-size:20px;padding:4px 14px',more:'صح! كمّل',done:'ممتاز: كل فلز مع خامه',bad:'فكّر في المركّب الذي يحتوي هذا الفلز'});
 },
 note:'<ul><li>كتاب الطالب ص٣٦ (الجدول ٢-١): الألومنيوم: البوكسيت Al₂O₃؛ النحاس: بيريت النحاس CuFeS₂؛ الحديد: الهيماتيت Fe₂O₃؛ الصوديوم: الملح الصخري NaCl؛ القصدير: حجر القصدير SnO₂؛ الخارصين: بلند الخارصين ZnS؛ الرصاص: الجالينا PbS. صور خامات الحديد في الكتاب (الصورة ٢-٢): الليمونيت والهيماتيت والماجنتيت.</li><li>عرضك وعرض NotebookLM يعرضان هذه الخامات بالصور (الأكاسيد والكلوريدات والكبريتيدات)، وأرسلتَ صورة لوحة معادن بأسماء عربية لكنها تحمل علامة مائية لموقع صور وأسماء، فاستبعدتُها.</li></ul>'});

/* 6 compound type: oxide, chloride or sulfide */
slide({id:'cmpd',ch:1,title:'أكسيد أم كلوريد أم كبريتيد؟',tag:'صنّف المركّب',
 html:function(){
  var rows=[[eqn('Al2O3')+' (البوكسيت)','o','أكسيد الألومنيوم'],[eqn('CuFeS2')+' (بيريت النحاس)','s','كبريتيد الحديد والنحاس'],[eqn('Fe2O3')+' (الهيماتيت)','o','أكسيد الحديد (III)'],[eqn('NaCl')+' (الملح الصخري)','c','كلوريد الصوديوم'],[eqn('SnO2')+' (حجر القصدير)','o','أكسيد القصدير (IV)'],[eqn('ZnS')+' (بلند الخارصين)','s','كبريتيد الخارصين'],[eqn('PbS')+' (الجالينا)','s','كبريتيد الرصاص (II)']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:center">${clsHTML(rows,[['o','أكسيد'],['c','كلوريد'],['s','كبريتيد']],22)}<div class="fb" style="min-height:26px"></div></div>
   <div class="col" style="width:380px;flex:none;justify-content:center"><div class="gbar hide" id="gb" style="font-size:20px;line-height:1.45">تُوجد الخامات في الغالب على شكل <b>أكاسيد</b> (O²⁻) أو <b>كبريتيدات</b> (S²⁻)، وأقلّها <b>كلوريدات</b> مثل NaCl.<br>هذا يهمّنا لأن الكبريتيد يُحوَّل أولاً إلى أكسيد قبل اختزاله.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'تأمّل الأيون السالب في المركّب') },
 note:'<ul><li>جدول ٢-١ في الكتاب ص٣٦. عرضك: «توجد على شكل أكاسيد O²⁻ أو كبريتيدات S²⁻ في خاماتها» وتصنيف الخامات إلى أكاسيد وكلوريدات وكبريتيدات بالصور.</li><li>تسمية بيريت النحاس CuFeS₂ «كبريتيد الحديد والنحاس» اسم وصفي مني؛ الكتاب يكتفي بالاسم التجاري للخام وصيغته.</li></ul>'});
