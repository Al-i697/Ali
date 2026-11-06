/* ---------- lesson 2-2, part B: the reactions in the blast furnace, the equation ladder, CO the reducer, limestone and slag ---------- */

/* 7 the three zones (the template with three empty bars and the furnace; book Fig 2-2) */
slide({id:'zones',ch:2,bare:true,title:'تفاعلات الفرن العالي',
 html:function(){
  var Z=[['منطقة اختزال الحديد (<span class="num">600 °C</span>)','Fe2O3 + 3CO → 2Fe(l) + 3CO2','أحادي أكسيد الكربون يختزل الأكسيد إلى حديد منصهر','#fff',111,163,205,330],
         ['منطقة إنتاج المختزِل (<span class="num">1000 °C</span>)','CO2 + C → 2CO','ثاني أكسيد الكربون يتحوّل إلى العامل المختزِل CO','#2b1000',295,347,330,470],
         ['منطقة الاحتراق (<span class="num">1900 °C</span>)','C + O2 → CO2','الكربون يحترق بشدة في الهواء الساخن','#2b1000',480,532,470,600]];
  var inner=tb(130,40,445,58,'<div style="font-size:30px;font-weight:800">تفاعلات الفرن العالي</div>','d');
  Z.forEach(function(z,i){
   inner+=tb(130,z[4],445,48,'<b style="font-size:23px;color:'+z[3]+';text-shadow:'+(z[3]==='#fff'?'0 1px 3px rgba(0,0,0,.6)':'none')+'">'+z[0]+'</b>','n','padding:0');
   inner+=tb(130,z[5],445,86,'<div class="eq rx hide" style="font-size:29px">'+eqn(z[1])+'</div><div class="rx hide" style="font-size:18px;line-height:1.3">'+z[2]+'</div><span class="veil">اضغط لتعرف التفاعل</span>','l hot','','data-i="'+i+'"');
   inner+=tb(808,z[6],150,z[7]-z[6],'','n zh','','data-z="'+i+'"');
  });
  inner+=tb(98,622,500,60,'الكوك يحترق ← CO₂ ← CO ← يختزل الحديد','d hide','font-size:23px;border-radius:12px','id="gb"');
  return frame('zones',inner);},
 init:function(el){
  var n=0; $$('.tb.hot',el).forEach(function(b){ b.addEventListener('click',function(){ if(b.classList.contains('on')) return;
   var i=b.getAttribute('data-i'); b.classList.add('on'); $$('.rx',b).forEach(function(x){x.classList.remove('hide')}); $('.veil',b).classList.add('hide'); $('.tb.zh[data-z="'+i+'"]',el).classList.add('on'); n++;
   if(n===3){ var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } }) });
 },
 note:'<ul><li>كتاب الطالب ص٤٠ (الشكل ٢-٢) والدليل (هدف ٧-٣): عند القاعدة (نحو <span class="num">1900 °C</span>) يحترق الكربون: <span class="num">C(s) + O₂(g) → CO₂(g)</span>؛ في الوسط (نحو <span class="num">1000 °C</span>): <span class="num">CO₂(g) + C(s) → 2CO(g)</span>؛ في الأعلى (نحو <span class="num">600 °C</span>): <span class="num">Fe₂O₃(s) + 3CO(g) → 2Fe(l) + 3CO₂(g)</span>. الغازات العادمة تصعد، والحديد المنصهر ينزل.</li><li>الأرقام والمعادلات هنا من الكتاب وعرضك المرجعي (الشريحة ٤). ملاحظة مقارنة: عرض Iron_and_Steel_Production يضع <span class="num">C + CO₂ → 2CO</span> عند ١٩٠٠ °C على المقياس نفسه مع احتراق الكربون، والكتاب يضعها عند ١٠٠٠ °C، فاتبعتُ الكتاب (انظر README).</li><li>الإطار قالب أرسلتَه (ثلاثة أشرطة ملوّنة فارغة بجانب الفرن)؛ النصوص حيّة.</li></ul>'});

/* 8 match each equation with its zone */
slide({id:'zq',ch:2,title:'أيّ معادلة في أيّ منطقة؟',tag:'اسحب المعادلة إلى منطقتها',
 html:function(){
  var Z=[['2','منطقة الاحتراق','القاعدة · نحو <span class="num">1900 °C</span>'],['1','منطقة إنتاج المختزِل','الوسط · نحو <span class="num">1000 °C</span>'],['0','منطقة اختزال الحديد','الأعلى · نحو <span class="num">600 °C</span>']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    ${Z.slice().reverse().map(function(z){return '<div style="display:grid;grid-template-columns:300px 1fr;gap:12px;align-items:center"><div class="panel" style="padding:10px 14px;gap:2px"><div style="font-size:23px;font-weight:800;color:var(--gold)">'+z[1]+'</div><div style="font-size:17px;font-weight:700">'+z[2]+'</div></div><div class="mslot" data-k="'+z[0]+'" style="min-height:74px;display:flex;align-items:center;justify-content:center;border-radius:14px;border:2px dashed rgba(255,255,255,.5)"><span class="ph" style="font-size:18px">ضع المعادلة هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:28px"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">كل ما يحدث في الفرن ينتج عن <b>الكربون</b>: يحترق، ثم يتحوّل إلى CO، ثم CO يختزل الحديد.</div></div>
   <div class="col" style="width:430px;flex:none;justify-content:center"><div id="tray" class="tray" style="display:flex;flex-direction:column;gap:10px"></div></div></div>`;},
 init:function(el){
  bindMatch(el,[['0',eqn('Fe2O3(s) + 3CO(g) → 2Fe(l) + 3CO2(g)')],['1',eqn('CO2(g) + C(s) → 2CO(g)')],['2',eqn('C(s) + O2(g) → CO2(g)')]],{css:'font-size:21px;padding:6px 14px;line-height:1.35;text-align:center;direction:ltr',more:'صح! كمّل',done:'ممتاز: عرفنا ما يحدث في كل منطقة',bad:'تذكّر: الأعلى أبرد، والكربون يحترق عند القاعدة'});
 },
 note:'<ul><li>كتاب الطالب ص٤٠ الشكل ٢-٢، وسؤال امتحان ٢٠٢٥/٢٠٢٦ الدور الأول س١٠ (موضع A عند ١٩٠٠ °C، وB عند ١٠٠٠ °C، وC عند ٦٠٠ °C؛ الإجابات: A: <span class="num">C + O₂ → CO₂</span>، B: <span class="num">CO₂ + C → 2CO</span>، C: <span class="num">Fe₂O₃ + 3CO → 2Fe(l) + 3CO₂</span>). النسخة الامتحانية في شريحة امتحانات (١).</li></ul>'});

/* 9 the equation ladder for the reduction of iron(III) oxide (worksheet 2-1, question 2c; book question 2-11) */
slide({id:'lad',ch:2,title:'معادلة الاختزال: خطوة بخطوة',tag:'أربع خطوات',
 html:function(){ return `<div class="col" style="flex:1;gap:8px;min-height:0"><div class="panel" style="padding:8px 14px" id="ladhost"></div></div>`; },
 init:function(el){
  var d={word:{R:['أكسيد الحديد (III)','أحادي أكسيد الكربون'],P:['حديد','ثاني أكسيد الكربون'],bank:['حديد','أكسيد الحديد (III)','ثاني أكسيد الكربون','أحادي أكسيد الكربون','كربون','أكسجين'],
    why:{'كربون':'الكربون يحترق أولاً عند القاعدة؛ الذي يختزل الأكسيد هنا هو أحادي أكسيد الكربون.','أكسجين':'الأكسجين ينتقل من الأكسيد إلى CO، فلا يكون مادة متفاعلة منفردة هنا.'}},
   subs:[{n:'أكسيد الحديد (III)',o:[['Fe2O3',1],['FeO3',0,'الحديد (III) +٣ والأكسيد −٢: الصيغة Fe₂O₃.'],['Fe3O2',0,'الأرقام معكوسة: ذرتا حديد وثلاث ذرات أكسجين.']]},
    {n:'أحادي أكسيد الكربون',o:[['CO',1],['CO2',0,'هذا ثاني أكسيد الكربون (الناتج).'],['C',0,'هذا الكربون وليس أحادي أكسيده.']]},
    {n:'حديد',o:[['Fe',1],['Fe2',0,'الفلز يُكتب برمز العنصر وحده.']]},
    {n:'ثاني أكسيد الكربون',o:[['CO2',1],['CO',0,'هذا أحادي أكسيد الكربون.'],['C2O',0,'ثاني أكسيد الكربون: ذرة كربون وذرتا أكسجين.']]}],
   stw:{Fe2O3:['s','خام الهيماتيت صلب.'],CO:['g','أحادي أكسيد الكربون غاز.'],Fe:['l','عند هذه الحرارة يكون الحديد منصهراً: يُكتب Fe(l) في كتاب الطالب.'],CO2:['g','ثاني أكسيد الكربون غاز يصعد مع الغازات العادمة.']},
   eq:{l:[{f:'Fe2O3',st:'s'},{f:'CO',st:'g'}],r:[{f:'Fe',st:'l'},{f:'CO2',st:'g'}],co:[1,3,2,3],tip:'ابدأ بالحديد (ذرتان في Fe₂O₃)، ثم وازن الأكسجين: ٣ في Fe₂O₃ تحتاج ٣ CO.'}};
  EQL.ladder($('#ladhost',el),d,{});
 },
 note:'<ul><li>كتاب الطالب ص٤٠ (الشكل ٢-٢) وسؤال ٢-١١ وورقة العمل ٢-١ (س٢ ج): <span class="num">Fe₂O₃(s) + 3CO(g) → 2Fe(l) + 3CO₂(g)</span>. حالة الحديد (l) كما في الكتاب وورقة العمل ونماذج إجابات الامتحانات (٢٠٢٥/٢٠٢٦ و٢٠٢٢/٢٠٢٣). جواب الدليل لسؤال ٢-١١ كُتب بحالة (s) (انظر README).</li><li>السلّم من ورشة المعادلات (الدرس ١-٤): معادلة لفظية ← صيغ ← حالات ← موازنة.</li></ul>'});

/* 10 CO is the hero: three stages on the template picture of particles */
slide({id:'co',ch:2,bare:true,title:'أحادي أكسيد الكربون: العامل المختزِل',
 html:function(){
  var T=['ذرات الحديد في <span class="num">Fe₂O₃</span> مرتبطة بالأكسجين، وجزيئات <span class="num">CO</span> تقترب منه.',
         'ينتزع CO ذرات الأكسجين: يتأكسد إلى <span class="num">CO₂</span>، ويُختزل الأكسيد.',
         'يصعد <span class="num">CO₂</span> مع الغازات العادمة، ويبقى الحديد وينزل إلى القاع.'];
  var inner=tb(262,44,756,78,'<div style="font-size:35px;font-weight:800">أحادي أكسيد الكربون (CO): العامل المختزِل</div>','l');
  inner+=tb(352,145,573,93,'<div id="st" style="font-size:23px;line-height:1.35;font-weight:700">اضغط على كل مرحلة من المراحل الثلاث (١ ثم ٢ ثم ٣)</div>','l');
  inner+=tb(96,168,206,72,'<b style="font-size:20px">خام الهيماتيت</b>'+eqn('Fe2O3').replace('class="num"','class="num" style="font-size:24px;font-weight:800"'),'l','padding:2px 6px');
  inner+=tb(96,592,222,70,'<b style="font-size:20px">العامل المختزِل</b><span class="num" style="font-size:24px;font-weight:800">CO</span>','l','padding:2px 6px');
  inner+=tb(984,163,202,75,'<b style="font-size:19px;line-height:1.3">غازات عادمة تصعد: <span class="num">CO₂</span></b>','l','padding:2px 6px');
  inner+=tb(962,592,220,70,'<b style="font-size:19px;line-height:1.3">حديد منصهر ينزل: <span class="num">Fe</span></b>','l','padding:2px 6px');
  [[64,272,444,286],[510,272,394,286],[906,272,312,286]].forEach(function(r,i){ inner+=tb(r[0],r[1],r[2],r[3],'','n hot','border-radius:14px;justify-content:flex-start;align-items:flex-start','data-i="'+i+'"')+bdg(r[0]+30,r[1]+30,ar(i+1),'data-b="'+i+'"') });
  return frame('co',inner);},
 init:function(el){
  var T=['ذرات الحديد في <span class="num">Fe₂O₃</span> مرتبطة بالأكسجين، وجزيئات <span class="num">CO</span> تقترب منه.',
         'ينتزع CO ذرات الأكسجين: يتأكسد إلى <span class="num">CO₂</span>، ويُختزل الأكسيد.',
         'يصعد <span class="num">CO₂</span> مع الغازات العادمة، ويبقى الحديد وينزل إلى القاع.'], seen={};
  function pick(i){ $$('.tb.hot',el).forEach(function(b){b.classList.toggle('on',+b.getAttribute('data-i')===i)}); $$('.bdg',el).forEach(function(b){b.classList.toggle('sel',+b.getAttribute('data-b')===i)});
   $('#st',el).innerHTML='<b>'+ar(i+1)+'.</b> '+T[i]; seen[i]=1; $$('.bdg',el)[i].classList.add('seen') }
  $$('.tb.hot,.bdg',el).forEach(function(b){ b.addEventListener('click',function(){ pick(+(b.getAttribute('data-i')||b.getAttribute('data-b'))) }) });
 },
 note:'<ul><li>كتاب الطالب ص٤٠: «يُختزل الحديد الخام بأحادي أكسيد الكربون»؛ وفي الدليل (سؤال أ في السؤال ٢): نوع التفاعلات التي تُزال فيها الأكسجين: اختزال؛ والغاز الذي يحوّل أكسيد الحديد إلى حديد: أحادي أكسيد الكربون. عرضك (الشريحة ٥): «CO هو العامل المختزِل الرئيسي: ينتزع ذرات الأكسجين من الخام ليترك الحديد النقي».</li><li>القالب صورة جسيمات بلا نصوص أرسلتَها؛ الأرقام ١–٣ والنصوص حيّة. تنبيه (الدليل): قد يخطئ الطلاب في تحديد المادة المُختزَلة: هنا Fe₂O₃ تُختزل (تفقد الأكسجين) وCO يتأكسد.</li></ul>'});

/* 11 limestone and slag: chemistry of purification + separation by density */
slide({id:'slag',ch:2,bare:true,title:'الحجر الجيري والخبث',
 html:function(){
  var inner=tb(50,50,550,70,'<div style="font-size:34px;font-weight:800">كيمياء التنقية</div>','d');
  inner+=tb(672,50,558,70,'<div style="font-size:31px;font-weight:800">الانفصال بالكثافة <span class="num" style="font-size:22px">(Density separation)</span></div>','d');
  inner+=tb(112,209,430,53,'<div style="font-size:22px;font-weight:800">التفكك الحراري للحجر الجيري (قاعدة)</div>','d','border-radius:8px','');
  inner+=tb(112,264,430,90,'<div class="eq rx hide" style="font-size:29px">'+eqn('CaCO3(s) → CaO(s) + CO2(g)')+'</div><div class="rx hide" style="font-size:18px">يتكوّن الجير الحي CaO وهو أكسيد قاعدي</div><span class="veil">اضغط لتظهر المعادلة</span>','l hot','','data-i="0"');
  inner+=tb(112,454,430,53,'<div style="font-size:22px;font-weight:800">تعادل: إزالة شوائب السيليكا (حمض)</div>','d','border-radius:8px','');
  inner+=tb(112,509,430,90,'<div class="eq rx hide" style="font-size:29px">'+eqn('CaO(s) + SiO2(s) → CaSiO3(l)')+'</div><div class="rx hide" style="font-size:18px">سيليكات الكالسيوم هي الخبث (Slag)</div><span class="veil">اضغط لتظهر المعادلة</span>','l hot','','data-i="1"');
  inner+=tb(948,187,255,109,'<div id="sb" style="font-size:19px;line-height:1.35;font-weight:700">اضغط على كل طبقة في قاع الفرن</div>','l');
  inner+=tb(740,346,360,76,'','n hot','border-radius:10px','data-i="2" data-l="s"');
  inner+=tb(755,432,336,126,'','n hot','border-radius:10px','data-i="3" data-l="f"');
  inner+=tb(70,618,500,56,'الحجر الجيري ← CaO ← يتّحد بالرمل ← خبث يطفو','d hide','font-size:22px;border-radius:12px','id="gb"');
  return frame('slag',inner);},
 init:function(el){
  var seen={}, MSG={s:'<b>طبقة الخبث:</b> كثافتها أقل فلا تختلط بالحديد، فتطفو فوقه وتُسحب بشكل منفصل.',f:'<b>الحديد المنصهر:</b> أعلى كثافة، فيتجمع في القاع ويُسحب من فتحة خاصة.'};
  $$('.tb.hot',el).forEach(function(b){ b.addEventListener('click',function(){ var i=b.getAttribute('data-i'); seen[i]=1;
   if(i==='0'||i==='1'){ b.classList.add('on'); $$('.rx',b).forEach(function(x){x.classList.remove('hide')}); $('.veil',b).classList.add('hide') }
   else { $$('.tb.hot[data-l]',el).forEach(function(x){x.classList.toggle('on',x===b)}); $('#sb',el).innerHTML=MSG[b.getAttribute('data-l')] }
   if(Object.keys(seen).length===4){ var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } }) });
 },
 note:'<ul><li>كتاب الطالب ص٤٠: يحتوي الحديد الخام على شوائب رئيسية أحدها الرمل (السيليكا <span class="num">SiO₂</span>) الذي يُزال بإضافة الحجر الجيري: <span class="num">CaCO₃(s) → CaO(s) + CO₂(g)</span> ثم <span class="num">CaO(s) + SiO₂(s) → CaSiO₃(l)</span>؛ وسيليكات الكالسيوم المنصهرة (الخبث) أقل كثافة فتطفو فوق الحديد ولا تختلط به وتُجمع بشكل منفصل. سؤال ٢-١٢ والدليل: يتفاعل مع ثاني أكسيد السيليكون (الرمل) فيكوّن سيليكات الكالسيوم (الخبث) التي تُزال بسهولة.</li><li>تصحيح من عرضك (Iron_and_Steel_Production وعرض «من الصخر إلى الصلب»): كُتبت السيليكات في أحد العرضين <span class="num">CaSiO₂</span> والصحيح <span class="num">CaSiO₃</span>؛ وهنا بالصيغة الصحيحة. وتسمية العرض «حمض» لـSiO₂ و«قاعدة» لـCaO من الكتاب.</li><li>الإطار قالب أرسلتَه (لوحتان ومقطع قاع الفرن)؛ الألواح والمعادلات حيّة. سؤالا امتحان ٢٠٢٢/٢٠٢٣ (الدور الأول صباحي س٧ ومسائي س٧) عن هذه المعادلات في شريحة امتحانات (٢).</li></ul>'});
