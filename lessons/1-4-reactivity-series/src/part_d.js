/* ---------- lesson 1-4, part D: equations, Activity 1-3, book questions, activity-book exercises and worksheets, end-of-unit questions ---------- */

/* 22 the equation ladder with the ionic step: Mg + CuSO4 (question 1-20) */
slide({id:'ladder4',ch:5,title:'سلّم المعادلة: الماغنيسيوم وكبريتات النحاس (II)',tag:'خمس خطوات',
 html:function(){ return `<div class="col" style="flex:1;gap:8px;min-height:0"><div class="panel" style="padding:8px 14px" id="ladhost"></div></div>`; },
 init:function(el){
  var d={word:{R:['ماغنيسيوم','كبريتات النحاس (II)'],P:['كبريتات الماغنيسيوم','نحاس'],bank:['أكسيد الماغنيسيوم','كبريتات النحاس (II)','نحاس','ماغنيسيوم','هيدروجين','كبريتات الماغنيسيوم'],
    why:{'أكسيد الماغنيسيوم':'لا يوجد أكسجين حرّ هنا: الفلز يزيح فلزاً آخر من ملحه.','هيدروجين':'لا يتصاعد غاز: يترسّب النحاس صلباً.'}},
   subs:[{n:'ماغنيسيوم',o:[['Mg',1],['Mg2',0,'الفلز يُكتب برمز العنصر وحده، دون رقم سفلي.']]},
    {n:'كبريتات النحاس (II)',o:[['CuSO4',1],['Cu2SO4',0,'Cu²⁺ و SO₄²⁻ شحنة كل منهما 2، فالنسبة ١ : ١.'],['CuS',0,'الكبريتات مجموعة كاملة SO₄ لا ذرة S فقط.']]},
    {n:'كبريتات الماغنيسيوم',o:[['MgSO4',1],['MgS',0,'الكبريتات مجموعة كاملة SO₄.'],['Mg2SO4',0,'Mg²⁺ و SO₄²⁻ شحنة كل منهما 2، فالنسبة ١ : ١.']]},
    {n:'نحاس',o:[['Cu',1],['Cu2',0,'الفلز يُكتب برمز العنصر وحده.']]}],
   stw:{Mg:['s','المغنيسيوم فلز صلب.'],CuSO4:['aq','ملح ذائب في الماء: محلول (aq).'],MgSO4:['aq','ملح ذائب في الماء: محلول (aq).'],Cu:['s','النحاس راسب صلب.']},
   eq:{l:[{f:'Mg',st:'s'},{f:'CuSO4',st:'aq'}],r:[{f:'MgSO4',st:'aq'},{f:'Cu',st:'s'}],co:[1,1,1,1],tip:'عدّ الذرات: ستجدها متساوية فعلاً.'},
   ion:{l:[{h:'Mg',st:'s'},{h:'Cu<sup>2+</sup>',st:'aq',k:'cu'},{h:'SO<sub>4</sub><sup>2−</sup>',st:'aq',k:'so4'}],r:[{h:'Mg<sup>2+</sup>',st:'aq',k:'mg'},{h:'SO<sub>4</sub><sup>2−</sup>',st:'aq',k:'so4'},{h:'Cu',st:'s'}],spect:'so4',
    nm:{so4:'أيون الكبريتات متفرّج: موجود قبل التفاعل وبعده كما هو، فنحذفه.',cu:'Cu²⁺ يتحوّل إلى ذرة نحاس، فهو يتغيّر.',mg:'Mg²⁺ أيون جديد يتكوّن في التفاعل، فهو يتغيّر.'},
    opts:[[eqn('Mg(s) + Cu^2+(aq) → Mg^2+(aq) + Cu(s)'),1,'الذرات والشحنات متساوية: +٢ في الطرفين.'],[eqn('Mg(s) + Cu^2+(aq) → Mg^+(aq) + Cu(s)'),0,'الشحنة +٢ على اليسار و+١ على اليمين: غير متساوية.'],[eqn('Mg(s) + CuSO4(aq) → Mg^2+(aq) + Cu(s)'),0,'الكبريتات بقيت في طرف واحد فقط: المتفرّج يُحذف من الطرفين.'],[eqn('Mg(s) + Cu(s) → Mg^2+(aq) + Cu^2+(aq)'),0,'عكسنا الأدوار: الفلز الأنشط (Mg) هو الذي يفقد الإلكترونات.']]}};
  EQL.ladder($('#ladhost',el),d,{});
 },
 note:'<ul><li>سؤال ١-٢٠ في كتاب الطالب ص٣٢: «اكتب المعادلة الكيميائية الرمزية الموزونة والمعادلة الأيونية للتفاعل الذي يحدث بين الماغنيسيوم ومحلول كبريتات النحاس (II)». الجواب (الدليل): Mg(s) + CuSO₄(aq) → MgSO₄(aq) + Cu(s)؛ Mg(s) + Cu²⁺(aq) → Mg²⁺(aq) + Cu(s). دليل المعلم: «كلّف الطلاب بكتابة معادلات رمزية وأيونية للتدرّب على هذه المهارات».</li><li>سلّم المعادلة (الأداة الثالثة من ورشة المعادلات) صار فيه هنا <b>خطوة خامسة: المعادلة الأيونية</b> كما وعدتُ في ١-٣: يضغط الطالب على الأيونات المتفرّجة فتُشطب، ثم يختار المعادلة الأيونية الصافية، وكل اختيار خاطئ يشرح خطأه (الشحنات أو الأيون المتفرّج أو عكس الأدوار).</li></ul>'});

/* 23 the atom balancer with the equations of the lesson */
(function(){
  var EQS=[
   {t:'Mg + HCl',l:[{f:'Mg',st:'s'},{f:'HCl',st:'aq'}],r:[{f:'MgCl2',st:'aq'},{f:'H2',st:'g'}],co:[1,2,1,1],tip:'وازن الكلور أولاً: Cl واحدة في HCl وذرتان في MgCl₂.'},
   {t:'Al + HCl',l:[{f:'Al',st:'s'},{f:'HCl',st:'aq'}],r:[{f:'AlCl3',st:'aq'},{f:'H2',st:'g'}],co:[2,6,2,3],tip:'ابدأ بالألومنيوم، ثم الكلور (٦)، والهيدروجين يتوازن بعدهما.'},
   {t:'Ca + H₂O',l:[{f:'Ca',st:'s'},{f:'H2O',st:'l'}],r:[{f:'Ca(OH)2',st:'aq'},{f:'H2',st:'g'}],co:[1,2,1,1],tip:'مجموعة OH تتكرر مرتين في Ca(OH)₂: عدّ الأكسجين والهيدروجين فيها.'},
   {t:'Fe + H₂O(g)',l:[{f:'Fe',st:'s'},{f:'H2O',st:'g'}],r:[{f:'Fe2O3',st:'s'},{f:'H2',st:'g'}],co:[2,3,1,3],tip:'ابدأ بالأكسجين: ٣ ذرات في Fe₂O₃ تحتاج ٣ جزيئات ماء.'},
   {t:'CuO + C',l:[{f:'CuO',st:'s'},{f:'C',st:'s'}],r:[{f:'Cu',st:'s'},{f:'CO2',st:'g'}],co:[2,1,2,1],tip:'الأكسجين: ذرتان في CO₂، فكم CuO تلزم؟'},
   {t:'Al + CuSO₄',l:[{f:'Al',st:'s'},{f:'CuSO4',st:'aq'}],r:[{f:'Al2(SO4)3',st:'aq'},{f:'Cu',st:'s'}],co:[2,3,1,3],tip:'ابدأ بمجموعة الكبريتات SO₄: ٣ في Al₂(SO₄)₃.'},
   {t:'Mg + Al₂O₃',l:[{f:'Mg',st:'s'},{f:'Al2O3',st:'s'}],r:[{f:'MgO',st:'s'},{f:'Al',st:'s'}],co:[3,1,3,2],tip:'الأكسجين: ٣ ذرات في Al₂O₃ تحتاج ٣ MgO.'}];
  slide({id:'balance4',ch:5,title:'ميزان الذرات: وازن معادلات الدرس',tag:'غيّر المعاملات فقط',
   html:function(){
    return `<div class="col" style="flex:1;gap:8px;min-height:0">
     <div class="tabs2 eqtabs" id="eqt">${EQS.map(function(q,i){return '<button type="button" class="'+(i?'':'on')+'" data-i="'+i+'"><span class="num">'+q.t+'</span><i class="tk"></i></button>'}).join('')}</div>
     <div class="panel" style="padding:8px 14px" id="balhost"></div>
     <div class="gbar hide" id="gb" style="font-size:20px">وازنتَ المعادلات السبع: غيّر <b>المعاملات</b> فقط، ولا تغيّر الأرقام السفلية أبداً.</div></div>`;},
   init:function(el){
    var solved={};
    function load(i){
      $$('#eqt button',el).forEach(function(b,j){b.classList.toggle('on',j===i)});
      EQL.balancer($('#balhost',el),EQS[i],{onSolved:function(){ solved[i]=1; $$('#eqt button',el)[i].classList.add('solved'); if(Object.keys(solved).length===EQS.length) unhide(el) }});
    }
    $$('#eqt button',el).forEach(function(b){b.addEventListener('click',function(){load(+b.getAttribute('data-i'))})});
    load(0);
   },
   note:'<ul><li>المعادلات من الكتب: Mg + 2HCl → MgCl₂ + H₂ (ص٢٥)؛ 2Al + 6HCl → 2AlCl₃ + 3H₂ (ص٢٦)؛ Ca + 2H₂O → Ca(OH)₂ + H₂ (سؤال نهاية الوحدة ٢ب)؛ 2Fe + 3H₂O(g) → Fe₂O₃ + 3H₂ (نشاط ١-٢، إجابة الدليل)؛ 2CuO + C → 2Cu + CO₂ (ص٢٨)؛ 2Al + 3CuSO₄ → Al₂(SO₄)₃ + 3Cu وMg + Al₂O₃: 3Mg + Al₂O₃ → 3MgO + 2Al (ورقة العمل ١-٤ في دليل المعلم).</li><li>ميزان الذرات يعدّ الذرات في الطرفين أمام الطالب. الأخطاء التي يعالجها (من القائمة التي أرسلتُها لك ولم تعتمدها بعد): تغيير الأرقام السفلية، نسيان البسط، ترك الموازنة عند أول تساوٍ جزئي.</li></ul>'});
})();

/* 24 Activity 1-3: plan an investigation (student book p.26, teacher's guide) */
slide({id:'act13',ch:6,title:'نشاط ١-٣: خطّط لتحديد ترتيب النشاط',tag:'استقصاء من تصميمك',
 html:function(){
  var M=['<b>طريقة ١ (حمض):</b> أضف ملعقة من مسحوق الفلز (Mg ثم Fe ثم Cu) إلى ٢٠ mL من HCl تركيزه ٠٫٥ mol/L، وقِس الزمن حتى يتوقف الفوران.','<b>طريقة ٢ (إزاحة):</b> أضف مسحوق الفلز إلى محلول ملح فلز آخر (مثل CuSO₄ وFeSO₄ وMgSO₄)، وقِس تغيّر درجة الحرارة بميزان حرارة.','سجّل النتائج في جدول: الزمن أو درجة الحرارة الابتدائية والنهائية لكل فلز.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:470px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--gold)">المهارات</div><ul style="margin:0;padding-inline-start:20px;font-size:16.5px;line-height:1.35"><li>يبيّن بطريقة عملية معرفته بكيفية الاستخدام الآمن للتقنيات والأجهزة والمواد.</li><li>يخطط للتجارب والاستقصاءات.</li><li>ينجز التجربة ويسجّل الملاحظات والقياسات والتقديرات.</li><li>يناقش الملاحظات التجريبية والبيانات ويقيّمها.</li><li>يقيّم الطرائق ويقترح التحسينات المحتملة.</li></ul></div>
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المطلوب</div><div style="font-size:17.5px;line-height:1.4">رتّب Mg وFe وCu بحسب نشاطها. اكتب خطة: الأدوات والمواد وتبريرها، الطريقة، المخاطر وإجراءات السلامة، وجدول النتائج، ثم نفّذها بعد موافقة المعلم.</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:10px 16px;gap:4px"><div style="font-size:22px;font-weight:800;color:var(--gold)">طريقتان ممكنتان (دليل المعلم)</div><ul class="acts" style="font-size:19px;line-height:1.45">${M.map(function(s){return '<li>'+s+'</li>'}).join('')}</ul></div>
    <div class="panel compact" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:20px;font-weight:800">سؤال ١: ماذا تتوقع أن يكون الترتيب من الأنشط إلى الأقل؟</div>
     ${optsHTML([{t:'Mg ثم Fe ثم Cu'},{t:'Cu ثم Fe ثم Mg'},{t:'Fe ثم Mg ثم Cu'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:18px;padding:6px 14px">سؤال ٢ (الدليل): قد يكون التفاعل سريعاً جداً أو بطيئاً جداً؛ نحسّن بتغيير التركيز وبتكرار القياس. وكبريتات الحديد (II) تُحضَّر طازجة.</div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'جواب الدليل: Mg الأنشط ثم Fe ثم Cu'},{t:'',why:'هذا عكس الترتيب: النحاس أقل الثلاثة نشاطاً'},{t:'',why:'الماغنيسيوم أنشط من الحديد'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>نشاط ١-٣ (كتاب الطالب ص٢٦): «رتّب الفلزات الثلاثة وفقاً لنشاطها الكيميائي: الماغنيسيوم والحديد والنحاس»؛ المهارات الخمس من الكتاب (ودليل المعلم: يبيّن بطريقة عملية... يخطط... ينجز... يناقش... يقيّم). أسئلة النشاط: ١ رتّب الفلزات الثلاثة موضّحاً كيف تثبت نتائجك هذا الترتيب؛ ٢ اكتب تعليقاً يتناول صعوبات حدثت عند إجراء استقصائك، وآلية تحسين طريقتك.</li><li>دليل المعلم (ص٢٩): الطريقة الممكنة ١: الزمن اللازم لتوقف الفوران مع ٢٠ mL من HCl (٠٫٥ mol/L)؛ الطريقة ٢: تغيّر درجة الحرارة عند إضافة المسحوق إلى محلول ملح؛ الإجابات: Mg ثم Fe ثم Cu؛ الصعوبة: التفاعل سريع جداً أو بطيء جداً؛ التحسين: تغيير التركيز، التكرار؛ كبريتات الحديد (II) تُحضَّر طازجة.</li></ul>'});

/* 25 and 26 student book questions 1-14 to 1-20 (p.32) */
(function(){
  var a=[
   {q:'<b>سؤال ١-١٤:</b> اختر المعادلة الرمزية الموزونة (مع رموز الحالة) لتفاعل الماغنيسيوم مع الماء:',opts:[{t:eqn('Mg(s) + 2H2O(l) → Mg(OH)2(aq) + H2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('Mg(s) + H2O(l) → Mg(OH)2(aq) + H2(g)'),why:'غير موزونة: ذرتا الأكسجين والهيدروجين لا تتساويان'},{t:eqn('Mg(s) + H2O(l) → MgO(s) + H2(g)'),why:'الأكسيد يتكوّن مع بخار الماء لا مع الماء البارد'}]},
   {q:'<b>سؤال ١-١٥:</b> ما المواد الناتجة من تفاعل الماغنيسيوم مع بخار الماء؟',opts:[{t:'أكسيد الماغنيسيوم والهيدروجين',ok:true,why:'جواب الدليل: Mg + H₂O(g) → MgO + H₂'},{t:'هيدروكسيد الماغنيسيوم والهيدروجين',why:'هذا ناتج الماء البارد (ببطء شديد)'},{t:'أكسيد الماغنيسيوم والأكسجين',why:'الغاز الناتج هيدروجين'}]},
   {q:'<b>سؤال ١-١٦:</b> اختر المعادلة الرمزية الموزونة لتفاعل الخارصين مع حمض الهيدروكلوريك المخفف:',opts:[{t:eqn('Zn(s) + 2HCl(aq) → ZnCl2(aq) + H2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('Zn(s) + HCl(aq) → ZnCl2(aq) + H2(g)'),why:'غير موزونة: الكلور ذرة واحدة في اليسار وذرتان في اليمين'},{t:eqn('Zn(s) + 2HCl(aq) → ZnO(s) + H2(g)'),why:'مع الحمض يتكوّن كلوريد الخارصين لا أكسيد'}]},
   {q:'<b>سؤال ١-١٧:</b> اختر من الفلزات الثلاثة (Mg وFe وCu) الفلز الذي لا يتفاعل مع حمض الهيدروكلوريك المخفف لإنتاج غاز الهيدروجين.',opts:[{t:'النحاس <span class="num">Cu</span>',ok:true,why:'جواب الدليل: النحاس (تحت الهيدروجين في السلسلة)'},{t:'الحديد <span class="num">Fe</span>',why:'الحديد فوق الهيدروجين: يتفاعل ببطء'},{t:'الماغنيسيوم <span class="num">Mg</span>',why:'الماغنيسيوم يتفاعل بقوة'}]}];
  var b=[
   {q:'<b>سؤال ١-١٨:</b> أراد طالب استقصاء النحاس والرصاص والقصدير: وجد أن أكسيد الرصاص يتفاعل مع القصدير عند التسخين، ولا يتفاعل مع النحاس. رتّب الفلزات الثلاثة من الأنشط إلى الأقل.',opts:[{t:'القصدير ثم الرصاص ثم النحاس',ok:true,why:'جواب الدليل: القصدير الأنشط ثم الرصاص ثم النحاس'},{t:'النحاس ثم الرصاص ثم القصدير',why:'النحاس لا يزيح الرصاص: هو الأقل نشاطاً'},{t:'الرصاص ثم القصدير ثم النحاس',why:'القصدير يزيح الرصاص: فهو أنشط منه'}]},
   {q:'<b>سؤال ١-١٩:</b> اذكر ملاحظتين تشاهدهما عند وضع شريط ماغنيسيوم في محلول كبريتات النحاس (II).',opts:[{t:'يتكوّن راسب بنيّ محمرّ على الشريط، ويتلاشى اللون الأزرق تدريجياً',ok:true,why:'جواب الدليل بنصه تقريباً'},{t:'يتكوّن راسب أبيض، ويصبح المحلول أخضر',why:'الراسب نحاس بنيّ محمرّ، والمحلول يفقد لونه الأزرق'},{t:'لا يحدث شيء',why:'الماغنيسيوم أنشط من النحاس فيزيحه'}]},
   {q:'<b>سؤال ١-٢٠:</b> اختر المعادلتين (الرمزية والأيونية) للتفاعل بين الماغنيسيوم ومحلول كبريتات النحاس (II):',opts:[{t:eqn('Mg(s) + CuSO4(aq) → MgSO4(aq) + Cu(s)')+'<br>'+eqn('Mg(s) + Cu^2+(aq) → Mg^2+(aq) + Cu(s)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('Mg(s) + CuSO4(aq) → MgSO4(aq) + Cu(s)')+'<br>'+eqn('Mg(s) + Cu^2+(aq) → Mg^+(aq) + Cu(s)'),why:'الأيونية غير متساوية الشحنة: +٢ مقابل +١'},{t:eqn('Cu(s) + MgSO4(aq) → CuSO4(aq) + Mg(s)')+'<br>'+eqn('Cu(s) + Mg^2+(aq) → Cu^2+(aq) + Mg(s)'),why:'عكس التفاعل: النحاس لا يزيح الماغنيسيوم'}]}];
  slide({id:'q1417',ch:6,title:'أسئلة ١-١٤ إلى ١-١٧ من الكتاب',tag:'ص٣٢',html:function(){return ticketHTML(a)},init:function(el){bindTicket(el,a,'q1417')},
   note:'<ul><li>أسئلة كتاب الطالب ص٣٢ وإجاباتها من دليل المعلم (ص٣١–٣٢): ١-١٤: Mg(s) + 2H₂O(l) → Mg(OH)₂(aq) + H₂(g)؛ ١-١٥: أكسيد الماغنيسيوم والهيدروجين؛ ١-١٦: Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)؛ ١-١٧: النحاس. الأسئلة الأصلية مفتوحة، وحوّلتها إلى اختيار مع إبقاء الجواب بنصه.</li></ul>'});
  slide({id:'q1820',ch:6,title:'أسئلة ١-١٨ إلى ١-٢٠ من الكتاب',tag:'ص٣٢',html:function(){return ticketHTML(b)},init:function(el){bindTicket(el,b,'q1820')},
   note:'<ul><li>١-١٨: القصدير ثم الرصاص ثم النحاس؛ ١-١٩: يتكوّن مادة بنية محمرّة على شريط الماغنيسيوم ويتلاشى اللون الأزرق تدريجياً حتى يصبح محلول كبريتات النحاس عديم اللون؛ ١-٢٠: Mg(s) + CuSO₄(aq) → MgSO₄(aq) + Cu(s)؛ Mg(s) + Cu²⁺(aq) → Mg²⁺(aq) + Cu(s) (إجابات الدليل).</li></ul>'});
})();

/* 27 exercise 1-2 of the activity book (reactivity series) */
(function(){
  var items=[
   {q:'<b>تمرين ١-٢ (أ):</b> يتفاعل الماغنيسيوم ببطء شديد مع الماء البارد وبعنف مع البخار فيتكوّن MgO وH₂. اختر المعادلة الموزونة لتفاعله مع البخار:',opts:[{t:eqn('Mg(s) + H2O(g) → MgO(s) + H2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('Mg(s) + H2O(g) → Mg(OH)2(s) + H2(g)'),why:'مع البخار الناتج أكسيد لا هيدروكسيد'},{t:eqn('2Mg(s) + H2O(g) → 2MgO(s) + H2(g)'),why:'غير موزونة: الأكسجين ذرة واحدة في اليسار وذرتان في اليمين'}]},
   {q:'<b>(ب):</b> اختر فلزاً من سلسلة النشاط لا يتفاعل مع بخار الماء.',opts:[{t:'النحاس أو الفضة (تحت الهيدروجين)',ok:true,why:'جواب الدليل: النحاس والفضة أو أي فلز أسفل السلسلة'},{t:'الحديد',why:'الحديد يتفاعل مع بخار الماء الساخن'},{t:'الخارصين',why:'الخارصين يتفاعل مع بخار الماء'}]},
   {q:'<b>(ج):</b> اختر فلزاً يتفاعل مع الحمض المخفف بأمان.',opts:[{t:'الحديد أو الخارصين أو الماغنيسيوم',ok:true,why:'جواب الدليل: هذه الثلاثة آمنة نسبياً'},{t:'البوتاسيوم',why:'يتفاعل بعنف شديد: غير آمن'},{t:'الفضة',why:'لا تتفاعل مع الحمض'}]},
   {q:'<b>(د):</b> قطعة خارصين رمادية توضع في كبريتات الحديد (II) الخضراء الباهتة. ما الملاحظات المتوقعة؟',opts:[{t:'يغطّى الفلز ببلورات رمادية داكنة، ويصبح المحلول عديم اللون',ok:true,why:'جواب الدليل: الخارصين يزيح الحديد'},{t:'لا يتغيّر شيء',why:'الخارصين أنشط من الحديد فيزيحه'},{t:'يغطّى الفلز بمادة بنيّة محمرّة',why:'المادة البنية المحمرّة هي النحاس، وليس في المحلول نحاس'}]},
   {q:'<b>(هـ):</b> رتّب النحاس والحديد والفضة والخارصين من الأنشط إلى الأقل نشاطاً:',opts:[{t:'الخارصين ثم الحديد ثم النحاس ثم الفضة',ok:true,why:'جواب الدليل: Zn > Fe > Cu > Ag'},{t:'الفضة ثم النحاس ثم الحديد ثم الخارصين',why:'هذا الترتيب معكوس'},{t:'الحديد ثم الخارصين ثم الفضة ثم النحاس',why:'الخارصين يزيح الحديد، والنحاس يزيح الفضة'}]},
   {q:'<b>(و، ز، ح):</b> القائمة من الأنشط إلى الأقل: Ba* La* Al Zn Cr* Fe Cu Pd*. أيّ فلزين لا يتفاعلان مع HCl المخفف؟ وأيّ فلزين (*) يتفاعلان مع الماء البارد؟ وأيّ فلز (*) يزيحه الألومنيوم لا الحديد؟',opts:[{t:'Cu وPd؛ Ba وLa؛ Cr',ok:true,why:'جواب الدليل: النحاس والبالاديوم؛ الباريوم واللانثانوم؛ الكروم'},{t:'Fe وCu؛ Ba وCr؛ Pd',why:'الحديد فوق الهيدروجين فيتفاعل مع الحمض'},{t:'Cu وPd؛ Al وZn؛ La',why:'الألومنيوم والخارصين لا يتفاعلان مع الماء البارد'}]}];
  slide({id:'ex12',ch:6,title:'تمرين ١-٢: سلسلة النشاط الكيميائي للفلزات',tag:'كتاب النشاط ص١٦–١٧',html:function(){return ticketHTML(items)},init:function(el){bindTicket(el,items,'ex12')},
   note:'<ul><li>تمرين ١-٢ في كتاب النشاط (ص١٦–١٧) وإجاباته من دليل المعلم: أ: Mg(s) + H₂O(g) → MgO(s) + H₂(g)؛ ب: النحاس والفضة (أو أي فلز أسفل السلسلة)؛ ج: الحديد أو الخارصين أو الماغنيسيوم؛ د: جدول الملاحظات (Zn في FeSO₄: يغطّى بقطع رمادية داكنة والمحلول عديم اللون؛ Zn في CuSO₄: يغطّى بمادة صلبة بنيّة محمرّة؛ Fe في CuSO₄: مغطّى بمادة بنيّة محمرّة والمحلول أخضر باهت؛ Cu في AgNO₃: مغطّى ببلورات فضية والمحلول أزرق؛ Ag في CuSO₄: لا تغيّر)؛ هـ: Zn > Fe > Cu > Ag؛ و: النحاس والبالاديوم؛ ز: الباريوم واللانثانوم؛ ح: الكروم. جمعتُ الفقرات و وز وح في سؤال واحد.</li></ul>'});
})();

/* 28 exercise 1-3 of the activity book: energy from displacement reactions (the graph is plotted by the student) */
slide({id:'ex13',ch:6,title:'تمرين ١-٣: الطاقة من تفاعلات الإزاحة',tag:'ارسم المنحنى',
 html:function(){
  var T=[0,.5,1,1.5,2,2.5,3];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="panel" style="padding:8px 10px">${chartSVG()}</div>
    <div class="panel" style="padding:6px 14px;gap:2px"><div class="bigeq" style="font-size:21px;direction:ltr;text-align:center">${eqn('Zn(s) + CuSO4(aq) → Cu(s) + ZnSO4(aq)')}</div><div class="bigeq" style="font-size:21px;direction:ltr;text-align:center">${eqn('Fe(s) + Cu^2+(aq) → Fe^2+(aq) + Cu(s)')}</div></div></div>
   <div class="col" style="width:470px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 10px;gap:4px"><div style="font-size:17px;font-weight:700;line-height:1.35">٥ g من مسحوق الفلز + ٥٠ mL من CuSO₄ (٠٫٥ mol/L) في كوب بوليستيرين، وتُقاس الحرارة كل ٣٠ ثانية.</div>
     <table class="dtab"><thead><tr><th>الزمن (min)</th>${T.map(function(t){return '<th><span class="num">'+t.toFixed(1)+'</span></th>'}).join('')}</tr></thead><tbody><tr><th>١ خارصين °C</th>${CH.zn.map(function(v){return '<td><span class="num">'+v+'</span></td>'}).join('')}</tr><tr><th>٢ حديد °C</th>${CH.fe.map(function(v){return '<td><span class="num">'+v+'</span></td>'}).join('')}</tr></tbody></table></div>
    <div class="tabs2" id="sers"><button type="button" class="on" data-s="zn">ارسم الخارصين</button><button type="button" data-s="fe">ارسم الحديد</button></div>
    <div class="fb" id="cfb" style="min-height:40px;font-size:18.5px;line-height:1.35">اضغط على الشبكة عند الزمن ودرجة الحرارة لكل قراءة.</div>
    <div class="panel compact hide" id="q" style="padding:8px 14px;gap:6px"><div style="font-size:19px;font-weight:800">(ج) أيّ الفلزين رفع درجة الحرارة أكثر؟</div>
     ${optsHTML([{t:'الخارصين: لأنه أنشط من الحديد'},{t:'الحديد: لأنه أنشط من الخارصين'}])}<div class="fb2" style="min-height:22px"></div></div>
    <div class="panel compact hide" id="q2" style="padding:8px 14px;gap:6px"><div style="font-size:19px;font-weight:800">(د) هل التجربة عادلة؟</div>
     ${optsHTML([{t:'تبدو عادلة، لكن قد لا يكون المسحوقان بالنعومة نفسها'},{t:'عادلة تماماً دون أي صعوبة'}])}<div class="fb3" style="min-height:22px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:18px;padding:6px 14px">كلما كان الفلز <b>أنشط</b> كان تفاعل الإزاحة أسرع وأكثر إطلاقاً للطاقة.</div></div></div>`;},
 init:function(el){
  var cur='zn', done={zn:{},fe:{}}, drawn={}, svg=$('#ch',el), fb=$('#cfb',el), COL={zn:'#ff9d3a',fe:'#7fd4ff'};
  function X(i){ return 62+i*79.33 } function Y(v){ return 300-(v-20)*4.5 }
  $$('#sers button',el).forEach(function(b){b.addEventListener('click',function(){ cur=b.getAttribute('data-s'); $$('#sers button',el).forEach(function(x){x.classList.toggle('on',x===b)}) })});
  $('#hit',el).addEventListener('click',function(ev){
    var r=svg.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width*560, y=(ev.clientY-r.top)/r.height*330;
    var ti=Math.round((x-62)/79.33), T=20+(300-y)/4.5; if(ti<0||ti>6||drawn[cur]) return;
    var want=CH[cur][ti], nm=cur==='zn'?'الخارصين':'الحديد';
    if(Math.abs(T-want)<=3){
      if(done[cur][ti]) return; done[cur][ti]=1;
      $('#pts',el).insertAdjacentHTML('beforeend','<circle cx="'+X(ti).toFixed(1)+'" cy="'+Y(want).toFixed(1)+'" r="6" fill="'+COL[cur]+'" stroke="#fff" stroke-width="2"/>');
      say(fb,'✓ '+nm+': عند '+(ti*.5).toFixed(1)+' دقيقة = '+want+' °C','ok');
      if(Object.keys(done[cur]).length===7){
        drawn[cur]=1; $('#ln'+cur,el).setAttribute('d',CH[cur].map(function(v,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)}).join(''));
        $('#ln'+cur,el).classList.add('on');
        if(drawn.zn&&drawn.fe){ say(fb,'✓ رسمتَ المنحنيين. أجب عن السؤالين.','ok'); $('#q',el).classList.remove('hide') }
        else say(fb,'✓ اكتمل منحنى '+nm+'. اختر الفلز الآخر من الأعلى.','ok');
      }
    }else say(fb,'راجع الجدول: قراءة '+nm+' عند '+(ti*.5).toFixed(1)+' دقيقة ليست قريبة من هذه النقطة.','bad');
  });
  var a=false, b=false;
  bindMcq($('#q',el),[{t:'',ok:true,why:'جواب الدليل: الخارصين رفع الحرارة أكثر، لأنه أنشط'},{t:'',why:'الحديد ارتفعت حرارته أقل (٤٤ °C مقابل ٧٥ °C)'}],$('.fb2',el),function(){ later(function(){ $('#q',el).classList.add('hide'); $('#q2',el).classList.remove('hide') },1300) });
  bindMcq($('#q2',el),[{t:'',ok:true,why:'جواب الدليل: قد تبدو عادلة، لكن الصعوبة هي نعومة المسحوقين'},{t:'',why:'الكتلة والحجم متساويان، لكن نعومة المسحوق تغيّر سرعة التفاعل'}],$('.fb3',el),function(){ later(function(){ $('#q2',el).classList.add('hide'); unhide(el) },1400) });
 },
 note:'<ul><li>تمرين ١-٣ في كتاب النشاط (ص١٨–١٩): ٥ g من مسحوق الفلز تُضاف إلى ٥٠ mL من كبريتات النحاس (II) (٠٫٥ mol/L) في كوب بوليستيرين، وتُقاس درجة الحرارة كل ٣٠ ثانية لمدة ٣ دقائق. الخارصين: ٢١، ٤٨، ٦٢، ٧١، ٧٥، ٧٢، ٧٠ °C؛ الحديد: ٢١، ٢٥، ٣٢، ٣٨، ٤١، ٤٣، ٤٤ °C. الإجابات (دليل المعلم): الخارصين يبلغ ذروته نحو ٧٥ °C عند دقيقتين ثم ينخفض، والحديد يرتفع ببطء إلى نحو ٤٤ °C؛ ب١: Zn(s) + CuSO₄(aq) → Cu(s) + ZnSO₄(aq)؛ ب٢: Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)؛ ج: الخارصين لأنه أنشط؛ د: تبدو عادلة، والصعوبة نعومة المسحوقين.</li><li>الطالب يرسم النقاط بالضغط على الشبكة (يقبل التطبيق ±٣ °C)، ثم يظهر الخط. في الكتاب قائمة تقويم ذاتي للرسم (١٤ علامة) يمكنك استعمالها عند تصحيح رسم الطلبة على الورق.</li></ul>'});

/* 29 worksheet 1-3 (activity book pp.23-25): metals and reactivity */
(function(){
  var items=[
   {q:'<b>ورقة ١-٣ (أ):</b> أيّ هذه الفلزات هو <b>الأعلى كثافة</b> (انظر الجدول)؟',opts:[{t:'التنغستن (W) ١٩٫٤',ok:true,why:'جواب الدليل: التنغستن'},{t:'الذهب (Au) ١٨٫٩',why:'١٨٫٩ أقل من ١٩٫٤'},{t:'الزئبق (Hg) ١٣٫٦',why:'أقل كثافة من الذهب والتنغستن'}]},
   {q:'<b>(أ-٣):</b> أيّ الفلزات الأكثر قوة (مقاومة الشد)؟',opts:[{t:'التنغستن (W) ٤١١ GPa',ok:true,why:'جواب الدليل: التنغستن'},{t:'الحديد (Fe) ٢١١ GPa',why:'٢١١ أقل من ٤١١'},{t:'الألومنيوم (Al) ٧٠ GPa',why:'الأضعف بين الثلاثة'}]},
   {q:'<b>(ب):</b> ما الخاصية التي تمتلكها <b>جميع</b> الفلزات في الجدول؟',opts:[{t:'توصيل الكهرباء',ok:true,why:'جواب الدليل: كلها توصل الكهرباء'},{t:'انصهار أعلى من ١٠٠٠ °C',why:'الصوديوم ينصهر عند ٩٨ °C والزئبق عند −٣٩ °C'},{t:'كثافة أعلى من كثافة الماء',why:'كثافة الصوديوم ٠٫٩٧ g/mL، أي أخف من الماء'}]},
   {q:'<b>(ج):</b> أيّ هذه الفلزات سائل عند درجة حرارة الغرفة؟',opts:[{t:'الزئبق (انصهاره −٣٩ °C)',ok:true,why:'جواب الدليل: الزئبق'},{t:'الصوديوم (٩٨ °C)',why:'الصوديوم صلب في الغرفة'},{t:'الرصاص (٣٢٧ °C)',why:'الرصاص صلب'}]},
   {q:'<b>(د):</b> لماذا يُستخدم التنغستن في فتائل المصابيح؟',opts:[{t:'لأن درجة انصهاره مرتفعة جداً (٣٤٢٢ °C)',ok:true,why:'جواب الدليل: درجة انصهاره عالية جداً'},{t:'لأنه الأقل كثافة',why:'كثافته الأعلى'},{t:'لأنه سائل',why:'التنغستن صلب'}]},
   {q:'<b>(هـ):</b> أُسقطت قطعة ذهب في وعاء فيه زئبق. هل تطفو أم تغوص؟',opts:[{t:'تغوص: كثافة الذهب (١٨٫٩) أعلى من كثافة الزئبق (١٣٫٦)',ok:true,why:'جواب الدليل: ستغوص لأن الذهب أعلى كثافة'},{t:'تطفو: الذهب أخف',why:'الذهب أكثر كثافة من الزئبق'}]},
   {q:'<b>(و):</b> أيّ وصف يعبّر عن الترابط في فلز نموذجي وتركيبه البنائي؟',opts:[{t:'شبكة من الأيونات الموجبة في بحر من الإلكترونات الحرة (غير المتمركزة)، تمسكها قوى تجاذب كهروستاتيكية',ok:true,why:'جواب الدليل: شبكة فلزية من أيونات موجبة في بحر من الإلكترونات غير المتمركزة'},{t:'أيونات موجبة وأيونات سالبة تتناوب في الشبكة',why:'هذه الرابطة الأيونية لا الفلزية'},{t:'ذرات متعادلة تتشارك أزواج إلكترونات',why:'هذه الرابطة التساهمية'}]},
   {q:'<b>س٣ (د):</b> الخارصين يزيح النحاس من كبريتاته، والماغنيسيوم يزيح الخارصين. رتّب الفلزات الثلاثة بحسب ميلها إلى تكوين أيون موجب (من الأقل إلى الأكثر):',opts:[{t:'النحاس ثم الخارصين ثم الماغنيسيوم',ok:true,why:'جواب الدليل: النحاس < الخارصين < الماغنيسيوم'},{t:'الماغنيسيوم ثم الخارصين ثم النحاس',why:'هذا الترتيب من الأكثر إلى الأقل'}]}];
  slide({id:'ws13',ch:6,title:'ورقة العمل ١-٣: الفلزات والنشاط الكيميائي',tag:'كتاب النشاط ص٢٣–٢٥',
   html:function(){
    return `<div style="display:flex;gap:14px;flex:1;align-items:stretch">
     <div class="col" style="width:430px;flex:none;justify-content:center;align-self:center"><div class="panel" style="padding:8px 10px;flex:none"><table class="dtab wst3"><thead><tr><th>الفلز</th><th>الكثافة g/mL</th><th>الانصهار °C</th><th>قوة الشد GPa</th></tr></thead><tbody>${WS3.map(function(r){return '<tr><th><span class="num">'+r[0]+'</span></th>'+r.slice(1).map(function(v){return '<td><span class="num">'+v+'</span></td>'}).join('')+'</tr>'}).join('')}</tbody></table></div></div>
     <div style="flex:1;min-width:0;display:flex;flex-direction:column">${ticketHTML(items)}</div></div>`;},
   init:function(el){bindTicket(el,items,'ws13')},
   note:'<ul><li>ورقة العمل ١-٣ في كتاب النشاط (ص٢٣–٢٥) وإجاباتها من دليل المعلم (ص١٥-١٦ في الدليل): أ١ التنغستن، أ٢ الصوديوم، أ٣ التنغستن، ب: كلها توصل الكهرباء، ج: الزئبق، د: انصهاره عالٍ جداً، هـ: الذهب يغوص لأنه أعلى كثافة، و: شبكة من الأيونات الموجبة في بحر من الإلكترونات؛ س٢: مقارنة القلوية بالانتقالية (في الدرس ١-٣)؛ س٣: المعادلات اللفظية والرمزية والأيونية وترتيب النحاس < الخارصين < الماغنيسيوم. في الشريحة ثماني فقرات بترتيب الورقة: أ١ وأ٣ وب وج ود وهـ وو، ثم س٣(د) (أ٢ تتكرر مع أ١ فتُحلّ شفهياً، وس٢ في الدرس ١-٣). وفقرات س٣ (أ–ج) في الشريحة التالية (سلّم المعادلة للماغنيسيوم وكبريتات الخارصين). في (و) تجد الرسم التخطيطي المطلوب في شريحة التركيب البنائي من الدرس ١-١.</li><li>الجدول منقول من الكتاب (قيم Al ٢٫٧ وCu ٨٫٩ وAu ١٨٫٩ وFe ٧٫٩ وPb ١١٫٣ وHg ١٣٫٦ وNa ٠٫٩٧ وW ١٩٫٤).</li></ul>'});
})();

/* 29b worksheet 1-3 question 3 (a-c): word, symbol and ionic equations of Mg + ZnSO4 (the other reaction, Zn + CuSO4, is the lesson's own zncu/ionic slides) */
slide({id:'ladderws',ch:6,title:'س٣ (أ–ج): الماغنيسيوم وكبريتات الخارصين',tag:'ورقة ١-٣ · ثلاث معادلات',
 html:function(){ return `<div class="col" style="flex:1;gap:8px;min-height:0"><div class="panel" style="padding:8px 14px" id="ladhost"></div></div>`; },
 init:function(el){
  var d={word:{R:['ماغنيسيوم','كبريتات الخارصين'],P:['كبريتات الماغنيسيوم','خارصين'],bank:['كبريتات الماغنيسيوم','أكسيد الخارصين','خارصين','كبريتات الخارصين','ماغنيسيوم','هيدروجين'],
    why:{'أكسيد الخارصين':'لا يوجد أكسجين حرّ هنا: الفلز الأنشط يزيح فلزاً آخر من ملحه.','هيدروجين':'لا يتصاعد غاز: يترسّب الخارصين صلباً.'}},
   subs:[{n:'ماغنيسيوم',o:[['Mg',1],['Mg2',0,'الفلز يُكتب برمز العنصر وحده، دون رقم سفلي.']]},
    {n:'كبريتات الخارصين',o:[['ZnSO4',1],['Zn2SO4',0,'Zn²⁺ و SO₄²⁻ شحنة كل منهما 2، فالنسبة ١ : ١.'],['ZnS',0,'الكبريتات مجموعة كاملة SO₄ لا ذرة S فقط.']]},
    {n:'كبريتات الماغنيسيوم',o:[['MgSO4',1],['MgS',0,'الكبريتات مجموعة كاملة SO₄.'],['Mg2SO4',0,'Mg²⁺ و SO₄²⁻ شحنة كل منهما 2، فالنسبة ١ : ١.']]},
    {n:'خارصين',o:[['Zn',1],['Zn2',0,'الفلز يُكتب برمز العنصر وحده.']]}],
   stw:{Mg:['s','المغنيسيوم فلز صلب.'],ZnSO4:['aq','ملح ذائب في الماء: محلول (aq).'],MgSO4:['aq','ملح ذائب في الماء: محلول (aq).'],Zn:['s','الخارصين راسب صلب.']},
   eq:{l:[{f:'Mg',st:'s'},{f:'ZnSO4',st:'aq'}],r:[{f:'MgSO4',st:'aq'},{f:'Zn',st:'s'}],co:[1,1,1,1],tip:'عدّ الذرات: ستجدها متساوية فعلاً.'},
   ion:{l:[{h:'Mg',st:'s'},{h:'Zn<sup>2+</sup>',st:'aq',k:'zn'},{h:'SO<sub>4</sub><sup>2−</sup>',st:'aq',k:'so4'}],r:[{h:'Mg<sup>2+</sup>',st:'aq',k:'mg'},{h:'SO<sub>4</sub><sup>2−</sup>',st:'aq',k:'so4'},{h:'Zn',st:'s'}],spect:'so4',
    nm:{so4:'أيون الكبريتات متفرّج: موجود قبل التفاعل وبعده كما هو، فنحذفه.',zn:'Zn²⁺ يتحوّل إلى ذرة خارصين، فهو يتغيّر.',mg:'Mg²⁺ أيون جديد يتكوّن في التفاعل، فهو يتغيّر.'},
    opts:[[eqn('Mg(s) + Zn^2+(aq) → Mg^2+(aq) + Zn(s)'),1,'الذرات والشحنات متساوية: +٢ في الطرفين.'],[eqn('Mg(s) + Zn^2+(aq) → Mg^+(aq) + Zn(s)'),0,'الشحنة +٢ على اليسار و+١ على اليمين: غير متساوية.'],[eqn('Mg(s) + ZnSO4(aq) → Mg^2+(aq) + Zn(s)'),0,'الكبريتات بقيت في طرف واحد فقط: المتفرّج يُحذف من الطرفين.'],[eqn('Mg(s) + Zn(s) → Mg^2+(aq) + Zn^2+(aq)'),0,'عكسنا الأدوار: الفلز الأنشط (Mg) هو الذي يفقد الإلكترونات.']]}};
  EQL.ladder($('#ladhost',el),d,{});
 },
 note:'<ul><li>ورقة العمل ١-٣ س٣ في كتاب النشاط (ص٢٤–٢٥): «يزيح الخارصين النحاس في محلول كبريتات النحاس (II) ويحلّ محلّه، ويزيح الماغنيسيوم الخارصين في محلول كبريتات الخارصين ويحلّ محلّه. (أ) اكتب معادلة لفظية لكل من هذين التفاعلين. (ب) اكتب معادلة كيميائية كاملة وموزونة لكل منهما متضمنةً رموز الحالة الفيزيائية. (ج) يمكن اختصار المعادلات الكاملة إلى معادلات أيونية: اكتب معادلة أيونية لكل من هذين التفاعلين. (د) رتّب هذه الفلزات الثلاثة تصاعدياً وفقاً لقابليتها لتكوين أيون موجب».</li><li>التفاعل الأول (Zn مع CuSO₄) له شريحتا نقل الإلكترونات والمعادلة الأيونية قبل هذا، فهنا التفاعل الثاني بسلّم المعادلة نفسه: لفظية، ثم صيغ، ثم حالات، ثم وزن، ثم أيونية. الجواب: Mg(s) + ZnSO₄(aq) → MgSO₄(aq) + Zn(s)؛ Mg(s) + Zn²⁺(aq) → Mg²⁺(aq) + Zn(s). وجواب (د) في الشريحة السابقة: Cu &lt; Zn &lt; Mg.</li><li>الدليل (ص١٥–١٦) يذكر أن الجواب «معادلات لفظية ورمزية وأيونية» دون نصّ كامل للمعادلات، فصياغتها هنا من قواعد الكتاب (الخارصين أقل نشاطاً من الماغنيسيوم).</li></ul>'});

/* 30 worksheet 1-4 (activity book p.26): powdered metals with the oxides of other metals */
slide({id:'ws14',ch:6,title:'ورقة العمل ١-٤: مساحيق فلزات مع أكاسيد فلزات',tag:'افتح الخلايا ثم رتّب',
 html:function(){
  return `<div style="display:flex;gap:14px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:center">
    <div style="display:flex;gap:10px;align-items:center"><div class="sm" style="font-size:18px;background:rgba(6,20,44,.82);border-radius:10px;padding:2px 12px">✓ يحدث تفاعل · ✗ لا يحدث تفاعل</div><button type="button" class="btn" id="all4" style="min-height:40px;font-size:18px">افتح كل الخلايا</button></div>
    <div class="panel" style="padding:8px 10px">${plateHTML('w14',W14)}</div>
    <div class="fb" id="wfb" style="min-height:46px;text-align:center;font-size:19px;line-height:1.35"></div>
    <div class="gbar hide" id="gb" style="font-size:18px;padding:5px 14px">الترتيب: <b class="num">Mg &gt; Al &gt; Zn &gt; Fe &gt; Cu</b>. هذه التجربة بديل آمن لتجارب محلول الملح الخطرة.</div></div>
   <div class="col" style="width:330px;flex:none;gap:8px;justify-content:center">
    <div class="panel hide" id="ordp" style="padding:10px 12px;gap:6px"><div style="font-size:19px;font-weight:800;color:var(--gold)">عدّ علامات ✓ في كل عمود ثم رتّب المساحيق:</div>
     <div class="ordl"><span>الأكثر نشاطاً</span>${[0,1,2,3,4].map(function(i){return '<div class="mslot" data-k="'+i+'" style="min-height:40px"><span class="ph">'+ar(i+1)+'</span></div>'}).join('')}<span>الأقل نشاطاً</span></div>
     <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div><div class="fb" style="min-height:22px"></div></div></div></div>`;},
 init:function(el){
  var pl=bindPlate(el,'w14',W14,$('#wfb',el),function(){
    $('#ordp',el).classList.remove('hide');
    bindMatch(el,[['2','<span class="num">Zn</span>'],['4','<span class="num">Cu</span>'],['0','<span class="num">Mg</span>'],['3','<span class="num">Fe</span>'],['1','<span class="num">Al</span>']],{css:'font-size:22px;padding:3px 14px;font-family:var(--font-display)',fb:'#ordp .fb',more:'صح! كمّل',done:'ممتاز: Mg ثم Al ثم Zn ثم Fe ثم Cu',bad:'عدّ علامات ✓ في عمود هذا المسحوق'});
  });
  $('#all4',el).addEventListener('click',function(){ this.disabled=true; pl.open() });
 },
 note:'<ul><li>ورقة العمل ١-٤ في كتاب النشاط (ص٢٦): مساحيق الفلزات (Al وCu وFe وMg وZn) تُمزج بأكاسيد الفلزات وتُسخَّن، وتُسجَّل الملاحظات (ملاحظات الجدول من كتاب النشاط). الاستنتاج (الدليل): Mg > Al > Zn > Fe > Cu. الدليل: «تُغطّي ورقة العمل ١-٤ تفاعل فلزات مسحوقة مع أكاسيد فلزات مختلفة... تُعدّ بديلاً مفيداً لبعض التجارب التي قد يكون تنفيذها بالغ الخطورة في المختبر».</li><li>أسئلة الورقة (١: Mg + CuO → MgO + Cu و٣Mg + Al₂O₃ → ٣MgO + ٢Al؛ ٢: Zn + FeSO₄ → ZnSO₄ + Fe وأيونيتها؛ ٣: ٢Al + ٣CuSO₄ → Al₂(SO₄)₃ + ٣Cu وأيونيتها؛ ٤ و٥: استنتاج الترتيب بالبخار وبالكربون) مغطّاة في شرائح ميزان الذرات والسلّم والمعادلة الأيونية والكربون.</li></ul>'});

/* 31 end-of-unit question 2 (student book p.33) */
(function(){
  var items=[
   {q:'<b>س٢ (أ-١):</b> الكالسيوم يتفاعل بسرعة مع الماء البارد وبعنف مع البخار؛ الماغنيسيوم ببطء شديد مع الماء البارد وبسرعة مع البخار؛ الخارصين لا يتفاعل مع الماء البارد ويتفاعل مع البخار؛ النحاس لا يتفاعل. رتّب الفلزات من الأقل إلى الأكثر نشاطاً:',opts:[{t:'النحاس ثم الخارصين ثم الماغنيسيوم ثم الكالسيوم',ok:true,why:'جواب الدليل: Cu < Zn < Mg < Ca'},{t:'الكالسيوم ثم الماغنيسيوم ثم الخارصين ثم النحاس',why:'هذا الترتيب من الأكثر إلى الأقل'},{t:'النحاس ثم الماغنيسيوم ثم الخارصين ثم الكالسيوم',why:'الماغنيسيوم أنشط من الخارصين'}]},
   {q:'<b>(أ-٢):</b> يقع الحديد بين الخارصين والنحاس في السلسلة. توقّع تفاعله مع الماء البارد ومع البخار:',opts:[{t:'لا يتفاعل مع الماء البارد، ويتفاعل مع بخار الماء',ok:true,why:'جواب الدليل: لا يتفاعل مع البارد، ويتفاعل مع البخار عند التسخين'},{t:'يتفاعل مع الماء البارد ولا يتفاعل مع البخار',why:'النشاط يزداد صعوداً: لو تفاعل مع البارد لتفاعل الخارصين'},{t:'لا يتفاعل مع أيّ منهما',why:'الحديد أنشط من النحاس: يتفاعل مع البخار'}]},
   {q:'<b>(ب):</b> اختر المعادلة الرمزية الموزونة لتفاعل الكالسيوم مع الماء:',opts:[{t:eqn('Ca(s) + 2H2O(l) → Ca(OH)2(aq) + H2(g)'),ok:true,why:'جواب الدليل بنصه'},{t:eqn('Ca(s) + H2O(l) → Ca(OH)2(aq) + H2(g)'),why:'غير موزونة'},{t:eqn('Ca(s) + 2H2O(l) → CaO(s) + 2H2(g)'),why:'مع الماء البارد يتكوّن الهيدروكسيد'}]},
   {q:'<b>(ج):</b> في جدول ✓/✗ للفلزات (Ca وCu وMg وZn) مع أكاسيد الأربعة: ماذا تكتب في خلية الماغنيسيوم مع أكسيد الخارصين؟',opts:[{t:'✓ يحدث تفاعل',ok:true,why:'جواب الدليل: Mg أنشط من Zn فيزيح الخارصين من أكسيده'},{t:'✗ لا يحدث تفاعل',why:'الماغنيسيوم أنشط من الخارصين'}]},
   {q:'<b>(ج):</b> وماذا تكتب في خلية الخارصين مع أكسيد الماغنيسيوم؟',opts:[{t:'✗ لا يحدث تفاعل',ok:true,why:'جواب الدليل: الخارصين أقل نشاطاً من الماغنيسيوم'},{t:'✓ يحدث تفاعل',why:'الخارصين لا يزيح فلزاً أنشط منه'}]}];
  slide({id:'eou2',ch:6,title:'سؤال نهاية الوحدة ٢',tag:'كتاب الطالب ص٣٣',html:function(){return ticketHTML(items)},init:function(el){bindTicket(el,items,'eou2')},
   note:'<ul><li>سؤال ٢ في نهاية الوحدة (ص٣٣): جدول تفاعل Ca وCu وMg وZn مع الماء البارد والبخار. إجابات الدليل: أ١: النحاس < الخارصين < الماغنيسيوم < الكالسيوم (<b>تنبيه:</b> الدليل مطبوع فيه الرمز «>» بين الأسماء بترتيب النحاس ثم الخارصين...، ومعناه «يزداد النشاط»)؛ أ٢: الحديد لا يتفاعل مع الماء البارد ويتفاعل مع بخار الماء؛ ب: Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)؛ ج: جدول ✓/✗: Ca مع CuO وMgO وZnO ✓؛ Cu: كلها ✗؛ Mg مع CaO ✗ ومع CuO وZnO ✓؛ Zn مع CaO وMgO ✗ ومع CuO ✓. الجدول في الكتاب ١٢ خلية، وبدلته بخليتين نموذجيتين (عيّنتان) والباقي يُحلّ بالقاعدة نفسها (جدول ١-٥).</li></ul>'});
})();

/* 32 end-of-unit question 5 (student book p.34) */
(function(){
  var items=[
   {q:'<b>س٥ (أ-٢):</b> في أنابيب الاختبار الثلاثة (X وCu وMg مع HCl المخفف) خرجت فقاعات كثيرة من Mg وقليلة من X ولا شيء من Cu. رتّب الفلزات الثلاثة من الأكثر إلى الأقل نشاطاً:',opts:[{t:'<span class="num">Mg &gt; X &gt; Cu</span>',ok:true,why:'جواب الدليل: Mg > X > Cu'},{t:'<span class="num">X &gt; Mg &gt; Cu</span>',why:'الماغنيسيوم أعطى فقاعات أكثر من X: هو الأنشط'},{t:'<span class="num">Cu &gt; X &gt; Mg</span>',why:'النحاس لم يتفاعل أصلاً: هو الأقل نشاطاً'}]},
   {q:'<b>(ب-١):</b> وُضع الفلز X (رمادي) في محلول كلوريد النحاس (II) (أزرق مخضرّ). كيف سيتغيّر مظهر الأنبوبة بعد ساعة؟',opts:[{t:'يتحوّل المحلول إلى عديم اللون أو باهت، ويتكوّن راسب بنيّ محمرّ على X',ok:true,why:'جواب الدليل: X أنشط من Cu فيزيحه'},{t:'لا يتغيّر شيء',why:'X أنشط من النحاس (خرجت منه فقاعات مع الحمض)'},{t:'يتحوّل المحلول إلى أزرق داكن',why:'لون النحاس يتلاشى لا يزداد'}]},
   {q:'<b>(ب-٢):</b> وُضع X في محلول كلوريد الماغنيسيوم (عديم اللون). لماذا لا نتوقع تغيّراً كيميائياً؟',opts:[{t:'لأن X أقل نشاطاً من الماغنيسيوم فلا يزيحه',ok:true,why:'جواب الدليل: X أقل نشاطاً من Mg'},{t:'لأن المحلول عديم اللون',why:'عدم اللون لا يمنع التفاعل: السبب هو النشاط'},{t:'لأن X أنشط من الماغنيسيوم',why:'العكس: X أقل نشاطاً من Mg'}]},
   {q:'<b>(ج):</b> كيف تتوقع تفاعل X مع الماء البارد ومع بخار الماء؟ (X فلز ثنائي التكافؤ)',opts:[{t:'لا يتفاعل بوضوح مع البارد، ويتفاعل مع البخار: X(s) + H₂O(g) → XO(s) + H₂(g)',ok:true,why:'جواب الدليل: ببطء أو لا يتفاعل مع البارد، ويتفاعل مع البخار'},{t:'يتفاعل بعنف مع الماء البارد',why:'X أقل نشاطاً من Mg الذي يتفاعل ببطء شديد مع البارد'},{t:'لا يتفاعل مع أيّ منهما',why:'X فوق الهيدروجين: يتفاعل مع الحمض فيتفاعل مع البخار'}]}];
  slide({id:'eou5',ch:6,title:'سؤال نهاية الوحدة ٥',tag:'كتاب الطالب ص٣٤',
   html:function(){
    return `<div style="display:flex;gap:14px;flex:1;align-items:stretch">
     <div class="col" style="width:470px;flex:none;gap:8px;justify-content:center"><div class="panel" style="padding:8px 4px">${rackHTML('rk5',R5)}</div><button type="button" class="btn acc" id="go5">أضف حمض HCl المخفف</button><div class="fb" style="min-height:24px;text-align:center;font-size:19px"></div></div>
     <div style="flex:1;min-width:0;display:flex;flex-direction:column">${ticketHTML(items)}</div></div>`;},
   init:function(el){ bindRack(el,'rk5',R5,'#go5',function(){}); bindTicket(el,items,'eou5') },
   note:'<ul><li>سؤال ٥ في نهاية الوحدة (ص٣٤): طالب يحدّد نشاط فلز غير معروف X بالمقارنة مع النحاس والماغنيسيوم: ثلاثة أنابيب مع HCl المخفف؛ ثم X في محلول كلوريد النحاس (II) (الأنبوبة A) وفي محلول كلوريد الماغنيسيوم (الأنبوبة B). إجابات الدليل: أ١: Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)؛ أ٢: Mg > X > Cu؛ ب١: يتغيّر لون المحلول من الأزرق إلى عديم اللون أو باهت ويتكوّن راسب بنيّ محمرّ على X؛ ب٢: X أقل نشاطاً من Mg؛ ج: لا يتفاعل بوضوح مع الماء البارد أو يتفاعل ببطء، ويتفاعل مع بخار الماء: X(s) + H₂O(g) → XO(s) + H₂(g).</li><li>الرسم (الفقاعات) تخطيطي ومرسوم لهذا العرض؛ والسؤال (أ-١) لم أضعه لأن معادلة Mg مع HCl محلولة في شريحتي ميزان الذرات.</li></ul>'});
})();

/* 33 to 36 past exam questions (year and round only) */
(function(){
  var T25='<table class="dtab ex"><thead><tr><th>الفلز</th><th>مع الماء</th><th>مع HCl المخفف</th></tr></thead><tbody><tr><th>A</th><td>فقاعات كثيرة</td><td>فقاعات كثيرة وبسرعة</td></tr><tr><th>B</th><td>لا تفاعل</td><td>فقاعات بسيطة على السطح</td></tr><tr><th>C</th><td>لا تفاعل</td><td>لا تفاعل</td></tr><tr><th>D</th><td>كمية بسيطة</td><td>كمية كبيرة من الفقاعات</td></tr></tbody></table>';
  var Z7='<table class="dtab ex"><thead><tr><th></th><th>Fe</th><th>Cu</th><th>Zn</th></tr></thead><tbody><tr><th>FeO</th><td>—</td><td>✗</td><td>✓</td></tr><tr><th>CuO</th><td>✓</td><td>—</td><td>✓</td></tr><tr><th>ZnO</th><td>✗</td><td>✗</td><td>—</td></tr></tbody></table>';
  var e1=[
   {q:'<b>امتحان ٢٠٢٥/٢٠٢٦، الدور الأول، س٦ (أ):</b> الجدول ٦-١: Mg مع FeSO₄ يتكوّن راسب رمادي ومع CuSO₄ يتلاشى اللون الأزرق؛ Cu لا يتفاعل مع أيّ محلول؛ Fe يزيح Cu فقط. ما الفلز الذي يمتلك أكبر قابلية لتكوين أيون موجب؟',opts:[{t:'<span class="num">Mg</span>',ok:true,why:'جواب النموذج: Mg. يزيح جميع الفلزات الأخرى من محاليلها'},{t:'<span class="num">Fe</span>',why:'الحديد لا يزيح Mg'},{t:'<span class="num">Cu</span>',why:'النحاس لا يزيح أحداً: الأقل نشاطاً'}]},
   {q:'<b>س٦ (ب):</b> اكتب المعادلة الأيونية للتفاعل بين الحديد ومحلول كبريتات النحاس (II).',opts:[{t:eqn('Fe(s) + Cu^2+(aq) → Fe^2+(aq) + Cu(s)'),ok:true,why:'جواب النموذج بنصه'},{t:eqn('Fe(s) + Cu^2+(aq) → Fe^3+(aq) + Cu(s)'),why:'الحديد هنا Fe²⁺ (حديد II) والشحنات يجب أن تتساوى'},{t:eqn('Cu(s) + Fe^2+(aq) → Cu^2+(aq) + Fe(s)'),why:'عكس التفاعل: النحاس لا يزيح الحديد'}]},
   {q:'<b>٢٠٢٥/٢٠٢٦، الدور الثاني، س٤:</b> '+T25+' استنتج الرمز الدال على الفلز الافتراضي الذي يُزيح جميع أيونات الفلزات الأخرى من محاليلها.',opts:[{t:'<span class="num">A</span>',ok:true,why:'جواب النموذج: A (الأنشط: أكثر فقاعات مع الماء والحمض)'},{t:'<span class="num">B</span>',why:'B متوسط النشاط'},{t:'<span class="num">C</span>',why:'C لا يتفاعل: الأقل نشاطاً'},{t:'<span class="num">D</span>',why:'D أقل نشاطاً من A'}]},
   {q:'<b>س٤ (تابع):</b> وما الفلز الافتراضي الذي تتوقع أنه يمثّل النحاس (مستعيناً بسلسلة النشاط)؟',opts:[{t:'<span class="num">C</span>',ok:true,why:'جواب النموذج: C. النحاس لا يتفاعل مع الماء ولا مع الحمض'},{t:'<span class="num">A</span>',why:'A الأنشط'},{t:'<span class="num">B</span>',why:'B يتفاعل قليلاً مع الحمض: النحاس لا يتفاعل'}]},
   {q:'<b>٢٠٢٥/٢٠٢٦، الدور الثاني، س٧:</b> '+Z7+' ما الفلز الذي يمتلك أكبر قابلية لتكوين أيون موجب عند تفاعله مع أكاسيد الفلزات الأخرى؟ وما المعادلة الرمزية للتفاعل بين الخارصين ومسحوق أكسيد الحديد (II)؟',opts:[{t:'Zn؛ '+eqn('Zn(s) + FeO(s) → ZnO(s) + Fe(s)'),ok:true,why:'جواب النموذج: Zn؛ Zn(s) + FeO(s) → ZnO(s) + Fe(s)'},{t:'Cu؛ '+eqn('Cu(s) + FeO(s) → CuO(s) + Fe(s)'),why:'النحاس لا يتفاعل مع أي أكسيد'},{t:'Fe؛ '+eqn('Zn(s) + FeO(s) → Zn(s) + FeO(s)'),why:'Zn هو الأنشط، ولا بدّ أن تتغيّر المواد'}]}];
  slide({id:'ex1',ch:7,title:'أسئلة امتحانات ٢٠٢٥/٢٠٢٦',tag:'امتحانات سابقة',html:function(){return ticketHTML(e1)},init:function(el){bindTicket(el,e1,'ex1')},
   note:'<ul><li>من مجموعة أسئلة الوحدة الأولى: امتحان ٢٠٢٥/٢٠٢٦ الدور الأول س٦ (الجدول ٦-١: تفاعلات Mg وCu وFe مع أملاحها؛ (أ) Mg؛ (ب) Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s))؛ الدور الثاني س٤ (الجدول ٤-١ للفلزات الافتراضية A وB وC وD مع الماء والحمض؛ الإجابة: A ثم C) وس٧ (الجدول ٧-١: Zn وCu وFe مع أكاسيدها؛ الإجابة: Zn؛ Zn(s) + FeO(s) → ZnO(s) + Fe(s)).</li><li>الجداول في الشريحة مرسومة لهذا العرض من محتوى الأسئلة (الشكل نفسه غير منقول)، والأسئلة المفتوحة حوّلتها إلى اختيار.</li></ul>'});
  var X8=eqn('Mg(s) + H2O(g) → W + H2(g)')+' ؛ '+eqn('W + C(s) → Z')+' ؛ '+eqn('X + Cu(s) → Y')+' ؛ '+eqn('X → MgCl2(aq) + H2(g)');
  var e2=[
   {q:'<b>امتحان ٢٠٢٤/٢٠٢٥، الدور الأول، س٣ (أ):</b> تفاعل حمض HCl المخفف مع الألومنيوم (Al) لمدة ١٠ ثوانٍ يعطي حجماً من الغاز في الحقنة. ماذا يحدث لحجم الغاز إذا استُبدل Al بالكالسيوم (Ca)؟',opts:[{t:'يزيد، لأن الكالسيوم أنشط من الألومنيوم فيتفاعل بسرعة أكبر',ok:true,why:'جواب النموذج: يزيد، لأن الكالسيوم أكثر نشاطاً من الألومنيوم'},{t:'يقلّ، لأن الكالسيوم أقل نشاطاً',why:'الكالسيوم أعلى من الألومنيوم في السلسلة: أنشط'},{t:'لا يتغيّر',why:'سرعة التفاعل تعتمد على نشاط الفلز'}]},
   {q:'<b>٢٠٢٤/٢٠٢٥، الدور الأول، س٦:</b> الجدول ٦-١: C يتفاعل مع XO وYO ولا يتفاعل مع ZO؛ X يتفاعل مع YO فقط؛ Y لا يتفاعل مع أي أكسيد؛ Z يتفاعل مع XO وYO. أيّ الأكاسيد يتفاعل بشدة مع الكربون؟ وأيّ الفلزات أقدر على تكوين أيون موجب؟',opts:[{t:'<span class="num">YO</span>؛ <span class="num">Z</span>',ok:true,why:'جواب النموذج: YO وZ. YO أكسيد أقل الفلزات نشاطاً؛ وZ يزيح X وY'},{t:'<span class="num">ZO</span>؛ <span class="num">Y</span>',why:'ZO لا يتفاعل مع شيء، وY لا يزيح أحداً'},{t:'<span class="num">XO</span>؛ <span class="num">X</span>',why:'X لا يزيح Z، فليس الأنشط'}]},
   {q:'<b>٢٠٢٤/٢٠٢٥، الدور الأول، س٧:</b> ثلاث تجارب لـ X وY وZ مع كبريتات الحديد (II) الخضراء: X لم يتغيّر اللون؛ Y صار المحلول عديم اللون؛ Z لم يتغيّر. وعند إضافة Z إلى كبريتات X حدث تغيّر. رتّب الفلزات من الأقل إلى الأعلى نشاطاً:',opts:[{t:'<span class="num">X &lt; Z &lt; Y</span>',ok:true,why:'جواب النموذج: Y الأعلى؛ Z يزيح X فهو أنشط منه'},{t:'<span class="num">Y &lt; Z &lt; X</span>',why:'Y أزاح الحديد: الأنشط وليس الأقل'},{t:'<span class="num">Z &lt; X &lt; Y</span>',why:'Z أزاح X فهو أنشط منه'}]},
   {q:'<b>٢٠٢٤/٢٠٢٥، الدور الأول، س٨:</b> المخطط ٨-١ لنشاط Cu وMg: '+X8+' . أكمل (يحدث تفاعل / لا يحدث): W وX وY وZ.',opts:[{t:'W: MgO (يحدث)، X: HCl (يحدث)، Y: لا يحدث، Z: لا يحدث',ok:true,why:'جواب النموذج: W = MgO؛ X = HCl؛ Y وZ لا يحدث تفاعل (Cu تحت H؛ C لا يختزل MgO)'},{t:'W: Mg(OH)₂، X: H₂O، Y: يحدث، Z: يحدث',why:'مع البخار يتكوّن MgO، وMgCl₂ يعني الحمض HCl'},{t:'W: MgO، X: HCl، Y: يحدث، Z: لا يحدث',why:'النحاس تحت الهيدروجين: لا يتفاعل مع الحمض'}]},
   {q:'<b>٢٠٢٤/٢٠٢٥، الدور الثاني، س٣:</b> Y لا يتفاعل مع الماء؛ Z ببطء؛ W لا يتفاعل مع البارد ولكنه يتفاعل مع البخار؛ X بشدة يكوّن لهباً. ما الترتيب الصحيح لموقع الهيدروجين؟',opts:[{t:'بين <span class="num">W</span> و<span class="num">Y</span>',ok:true,why:'جواب النموذج: بين W وY. الفلزات فوق H تتفاعل مع البخار، وY لا يتفاعل'},{t:'أسفل <span class="num">Y</span>',why:'Y لا يتفاعل: هو تحت الهيدروجين أو قربه، لكن W يتفاعل مع البخار'},{t:'بين <span class="num">Z</span> و<span class="num">W</span>',why:'W يتفاعل مع البخار، فهو فوق الهيدروجين'}]},
   {q:'<b>٢٠٢٤/٢٠٢٥، الدور الثاني، س٧:</b> X: يتفاعل ببطء مع الماء البارد ويعطي H₂؛ Y: لا يتفاعل؛ Z: يتفاعل بسرعة. حدّد الفلز الأنشط، والفلز الذي يُستخدم الكربون لاستخلاصه من أكسيده:',opts:[{t:'الأنشط <span class="num">Z</span>؛ ويُستخلص <span class="num">Y</span> بالكربون',ok:true,why:'جواب النموذج: Z وY'},{t:'الأنشط <span class="num">Y</span>؛ ويُستخلص <span class="num">Z</span> بالكربون',why:'Y لا يتفاعل: الأقل نشاطاً، وZ الأنشط'},{t:'الأنشط <span class="num">X</span>؛ ويُستخلص <span class="num">Z</span> بالكربون',why:'Z يتفاعل بسرعة أكبر من X'}]}];
  slide({id:'ex2',ch:7,title:'أسئلة امتحانات ٢٠٢٤/٢٠٢٥',tag:'امتحانات سابقة',html:function(){return ticketHTML(e2)},init:function(el){bindTicket(el,e2,'ex2')},
   note:'<ul><li>امتحان ٢٠٢٤/٢٠٢٥: الدور الأول: س٣ (أ: يزيد لأن Ca أنشط، ب: كالسيوم + ماء ← هيدروكسيد الكالسيوم + هيدروجين)، س٦ (YO وZ)، س٧ (Y الأنشط؛ X < Z < Y)، س٨ (المخطط: W = MgO؛ X = HCl؛ Y وZ لا يحدث تفاعل)؛ الدور الثاني: س٣ (الهيدروجين بين W وY) وس٧ (Z الأنشط؛ Y يُستخلص بالكربون) وس٢ (ثلاثة تفاعلات تُستخدم لترتيب السلسلة: الماء، حمض HCl، اختزال الأكاسيد بالكربون؛ لم أضعه كسؤال).</li><li>الجداول والمخطط في الشريحة وصف موجز مني (الأشكال نفسها غير منقولة)، والأسئلة المفتوحة حوّلتها إلى اختيار.</li></ul>'});
  var e3=[
   {q:'<b>امتحان ٢٠٢٣/٢٠٢٤، الدور الأول، س٥:</b> الشكل البياني يبيّن الزمن اللازم لجمع ١٠٠ cm³ من الغاز من تفاعل أربع كتل متساوية من الفلزات A وB وC وD مع حمض HCl المخفف: الأزمنة D أطول ثم B ثم A ثم C أقصر. أكمل سلسلة النشاط من الأقل إلى الأكثر:',opts:[{t:'<span class="num">D ، B ، A ، C</span>',ok:true,why:'جواب النموذج: D، B، A، C. الأطول زمناً هو الأقل نشاطاً'},{t:'<span class="num">C ، A ، B ، D</span>',why:'هذا الترتيب معكوس: الأقصر زمناً (C) هو الأنشط'},{t:'<span class="num">A ، B ، C ، D</span>',why:'الترتيب يعتمد على الزمن: الأطول الأقل نشاطاً'}]},
   {q:'<b>٢٠٢٣/٢٠٢٤، الدور الأول، س٦:</b> الشكل: شريط ماغنيسيوم في محلول كبريتات النحاس. اكتب المعادلة الرمزية مع رموز الحالة:',opts:[{t:eqn('CuSO4(aq) + Mg(s) → MgSO4(aq) + Cu(s)'),ok:true,why:'جواب النموذج بنصه'},{t:eqn('CuSO4(aq) + Mg(s) → MgSO4(aq) + Cu(aq)'),why:'النحاس يترسّب صلباً (s)'},{t:eqn('MgSO4(aq) + Cu(s) → CuSO4(aq) + Mg(s)'),why:'عكس التفاعل: النحاس لا يزيح الماغنيسيوم'}]},
   {q:'<b>٢٠٢٣/٢٠٢٤، الدور الأول، س٧:</b> هل يمكن حفظ محلول كبريتات النحاس (II) في وعاء مصنوع من فلز الماغنيسيوم؟',opts:[{t:'لا، لأن الماغنيسيوم أنشط من أيونات النحاس فيزيحها',ok:true,why:'جواب النموذج: لا، لأن المغنيسيوم أكثر نشاطاً من أيون النحاس'},{t:'نعم، لأن الماغنيسيوم فلز',why:'الماغنيسيوم أنشط من النحاس فيتفاعل مع محلوله'}]},
   {q:'<b>٢٠٢٣/٢٠٢٤، الدور الثاني، س٦:</b> تجربتان (أ) صوف حديدي و(ب) صوف ماغنيسيوم مع بخار الماء بالطريقة نفسها. أيّ التجربتين يُتوقع أن يتكوّن فيها هيدروجين <b>أكثر</b> بعد ثلاث دقائق؟',opts:[{t:'التجربة (ب): الماغنيسيوم أنشط من الحديد',ok:true,why:'جواب النموذج: التجربة (ب)'},{t:'التجربة (أ): الحديد أنشط',why:'الماغنيسيوم أعلى من الحديد في السلسلة'}]},
   {q:'<b>٢٠٢٣/٢٠٢٤، الدور الثاني، س٨:</b> وضّح المقصود بتفاعل الإزاحة (الإحلال).',opts:[{t:'تفاعل تتمّ فيه إزاحة فلز من مركّبه ليحلّ محلّه فلز آخر أكثر نشاطاً',ok:true,why:'جواب النموذج بنصه تقريباً'},{t:'تفاعل يزيل الأكسجين من مركّب',why:'هذا تعريف الاختزال لا الإزاحة'},{t:'تفاعل يتحد فيه فلزان',why:'الإزاحة: فلز أنشط يحلّ محلّ أقل نشاطاً في مركّبه'}]}];
  slide({id:'ex3',ch:7,title:'أسئلة امتحانات ٢٠٢٣/٢٠٢٤',tag:'امتحانات سابقة',html:function(){return ticketHTML(e3)},init:function(el){bindTicket(el,e3,'ex3')},
   note:'<ul><li>امتحان ٢٠٢٣/٢٠٢٤: الدور الأول: س٥ (الرسم البياني لزمن جمع ١٠٠ cm³: D، B، A، C)، س٦ (CuSO₄(aq) + Mg(s) → MgSO₄(aq) + Cu(s))، س٧ (لا، لأن المغنيسيوم أنشط من أيون النحاس)؛ الدور الثاني: س٦ (التجربة ب)، س٧ (اختبار الغاز: شظية مشتعلة تُحدث فرقعة؛ لم أضعه كسؤال لأن الاختبار في شريحة نشاط ١-٢)، س٨ (تعريف الإزاحة).</li><li>الرسم البياني في س٥ وصف مني (الأطول زمناً D ثم B ثم A ثم C)، والأسئلة المفتوحة حوّلتها إلى اختيار.</li></ul>'});
  var e4=[
   {q:'<b>امتحان ٢٠٢٢/٢٠٢٣، الدور الثاني، س٣:</b> الجدول: مع HCl المخفف: W فوران، X فوران، Y فوران شديد، Z لا يتفاعل؛ أكسيد الفلز + كربون + حرارة: W لا يتفاعل، X ينتج فلز، Y لا يتفاعل، Z ينتج فلز. أيّ الفلزات أنشط كيميائياً؟',opts:[{t:'<span class="num">Y</span>',ok:true,why:'جواب النموذج: Y. فوران شديد مع الحمض، ولا يختزل الكربون أكسيده'},{t:'<span class="num">Z</span>',why:'Z لا يتفاعل مع الحمض: الأقل نشاطاً'},{t:'<span class="num">X</span>',why:'X يختزل الكربون أكسيده: أقل نشاطاً من الكربون'}]},
   {q:'<b>س٣ (ب):</b> أيّ الفلزات أنشط من الكربون؟',opts:[{t:'<span class="num">W</span> و<span class="num">Y</span>',ok:true,why:'جواب النموذج: W وY. أكسيداهما لا يختزلهما الكربون'},{t:'<span class="num">X</span> و<span class="num">Z</span>',why:'أكسيدا X وZ يختزلهما الكربون: فهما أقل نشاطاً منه'},{t:'<span class="num">Y</span> و<span class="num">Z</span>',why:'Z أقل نشاطاً من الكربون'}]},
   {q:'<b>٢٠٢٢/٢٠٢٣، الدور الثاني، س٥ (ج):</b> يستقصي طلاب تفاعل الحديد مع بخار الماء بوضع صوف حديدي وصوف معدني مبلل في أنبوبة تسخين. اشرح الإجراء المتّبع لاختبار غاز الهيدروجين الناتج.',opts:[{t:'تقريب شظية مشتعلة من فوهة الأنبوبة المقلوبة: يُسمع صوت فرقعة',ok:true,why:'اختبار الهيدروجين الذي في نشاط ١-٢: شظية مشتعلة تُحدث فرقعة'},{t:'إضافة ماء الجير: يتعكّر',why:'ماء الجير لاختبار ثاني أكسيد الكربون لا الهيدروجين'},{t:'تقريب ورقة كاشف زرقاء: تتحول إلى حمراء',why:'هذا اختبار الحمض أو الماء، لا الهيدروجين'}]}];
  slide({id:'ex4',ch:7,title:'أسئلة امتحانات ٢٠٢٢/٢٠٢٣',tag:'امتحانات سابقة',html:function(){return ticketHTML(e4)},init:function(el){bindTicket(el,e4,'ex4')},
   note:'<ul><li>امتحان ٢٠٢٢/٢٠٢٣ الدور الثاني: س٣ (الجدول: تفاعل W وX وY وZ مع HCl المخفف ومع الكربون؛ (أ) Y؛ (ب) W وY)، وس٥ (نشاط الصوف الحديدي مع البخار: الأسئلة أ-د).</li><li>جواب اختبار الغاز في س٥ (ج) <b>من عندي</b> (الاختبار نفسه في دليل نشاط ١-٢: الشظية المشتعلة تُحدث فرقعة)، لأن ورقة الإجابة النموذجية قُصّت في الصورة. راجع إجابته إن أردت.</li><li>باقي أسئلة العام (الدور الصباحي والمسائي) لم أجد فيها أسئلة جديدة للدرس ١-٤ غير المذكورة.</li></ul>'});
})();

/* 37 exit ticket */
(function(){
  var items=[
   {q:'أيّ هذه الفلزات يتفاعل مع الماء البارد؟',opts:[{t:'الكالسيوم',ok:true,why:'Ca فوق Mg: يتفاعل مع الماء البارد'},{t:'الخارصين',why:'الخارصين يتفاعل مع البخار فقط'},{t:'النحاس',why:'النحاس لا يتفاعل مع الماء'}]},
   {q:'ما اسم التفاعل الذي يحلّ فيه فلز أنشط محلّ فلز أقل نشاطاً في مركّبه؟',opts:[{t:'الإزاحة (الإحلال)',ok:true,why:'الفلز الأنشط يزيح الأقل نشاطاً'},{t:'الاختزال',why:'الاختزال نزع الأكسجين من مركّب'},{t:'التعادل',why:'التعادل بين حمض وقلوي'}]},
   {q:'أيّ هذه الأكاسيد يختزله الكربون عند التسخين؟',opts:[{t:'أكسيد الحديد FeO',ok:true,why:'الحديد تحت الكربون في السلسلة'},{t:'أكسيد الماغنيسيوم MgO',why:'الماغنيسيوم فوق الكربون'},{t:'أكسيد الألومنيوم Al₂O₃',why:'الألومنيوم فوق الكربون'}]},
   {q:'ماذا تلاحظ عند وضع الخارصين في محلول كبريتات النحاس (II)؟',opts:[{t:'يتلاشى اللون الأزرق ويترسّب نحاس بنيّ محمرّ',ok:true,why:'<span class="num">Zn + Cu²⁺ → Zn²⁺ + Cu</span>'},{t:'لا يحدث شيء',why:'الخارصين أنشط من النحاس'},{t:'يتحوّل المحلول إلى أخضر',why:'هذا لون محلول الحديد (II)'}]},
   {q:'هل يحدث تفاعل بين النحاس ومحلول كبريتات الخارصين؟',opts:[{t:'لا، النحاس أقل نشاطاً',ok:true,why:'الفلز الأقل نشاطاً لا يزيح الأنشط'},{t:'نعم، النحاس يزيح الخارصين',why:'العكس هو الصحيح'}]}];
  slide({id:'tk',ch:7,title:'تذكرة الخروج',tag:'تذكرة خروج',html:function(){return ticketHTML(items)},init:function(el){bindTicket(el,items,'tk')},
   note:'<ul><li>الإجابات: الكالسيوم، الإزاحة، أكسيد الحديد، يتلاشى الأزرق ويترسّب نحاس، لا. الأسئلة من صياغتي، وتغطي الأهداف ٥-١ و٥-٢ و٥-٣.</li></ul>'});
})();

/* 38 summary and homework (teacher's guide: homework ideas of topic 1-4) */
slide({id:'hw',ch:7,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب النشاط: تمرين ١-٢ (سلسلة النشاط الكيميائي)','كتاب النشاط: تمرين ١-٣ (إنتاج الطاقة من تفاعلات الإزاحة)','كتاب النشاط: ورقة العمل ١-٣ (الفلزات والنشاط الكيميائي)','كتاب النشاط: ورقة العمل ١-٤ (مساحيق فلزات مع أكاسيد)','كتاب الطالب: الأسئلة ١-١٤ إلى ١-٢٠ (ص٣٢)','أسئلة نهاية الوحدة: السؤالان ٢ و٥'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:18px 24px"><h3 style="margin:0 0 8px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:22px;line-height:1.5"><li>سلسلة النشاط: <b class="num">K Na Ca Mg Al C Zn Fe H Cu</b> (ثم Ag وAu).</li><li>الأنشط يتفاعل مع <b>الماء</b> (البارد أو البخار) ومع <b>الحمض</b>، وما تحت H لا يتفاعل.</li><li>الكربون يختزل أكاسيد الفلزات <b>التي تحته</b>.</li><li><b>الإزاحة:</b> الفلز الأنشط يزيح الأقل نشاطاً من محلول ملحه أو من أكسيده.</li><li>الأنشط أقدر على <b>تكوين أيون موجب</b>: <span class="num">Zn + Cu²⁺ → Zn²⁺ + Cu</span>.</li><li>نستنتج الترتيب من النتائج: من يزيح من؟</li></ul></div>
   <div class="col" style="width:470px;flex:none;gap:12px"><div class="panel" style="padding:10px 16px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:5px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:4px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">انتهت الوحدة الأولى</div><p style="margin:0;font-size:20px;line-height:1.35">مراجعة الوحدة، ثم الوحدة الثانية: استخلاص الفلزات.</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب من دليل المعلم للموضوع ١-٤: تمرين ١-٢ (سلسلة النشاط الكيميائي للفلزات) وتمرين ١-٣ (إنتاج الطاقة من تفاعلات الإزاحة) وورقة العمل ١-٣ (الفلزات والنشاط الكيميائي) وورقة العمل ١-٤ (تفاعل فلزات مسحوقة مع أكاسيد فلزات مختلفة) في كتاب النشاط، والأسئلة من ١-١٤ إلى ١-٢٠ في كتاب الطالب، وسؤالا ٢ و٥ من نهاية الوحدة. اضغط على البند لتظليله.</li><li>الدرس التالي حسب ما أرسلتَه: الوحدة الثانية (استخلاص الفلزات).</li></ul>'});
