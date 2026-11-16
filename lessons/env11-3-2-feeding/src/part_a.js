/* ---------- part A: goals, lead-in activities, producers and consumers (student book 3-2, pp. 87 and 90-92; activity book pp. 105-106) ---------- */

/* a small flat drawing of the sea: sun, layers of water, plankton, fish */
function seaSVG(){
  function fish(x,y,s,c){ return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse rx="24" ry="11" fill="'+c+'"/><path d="M-22 0L-40 -11L-40 11z" fill="'+c+'"/><circle cx="12" cy="-3" r="2.6" fill="#10202f"/></g>' }
  var dots='', i, X=[40,90,150,215,265,70,190,120,240,30], Y=[96,118,104,126,100,148,152,168,160,176];
  for(i=0;i<X.length;i++) dots+='<circle cx="'+X[i]+'" cy="'+Y[i]+'" r="'+(3+(i%3))+'" fill="#8fe26e" opacity=".9"/>';
  var rays='';
  for(i=0;i<6;i++) rays+='<line x1="'+(236+i*8)+'" y1="40" x2="'+(150+i*40)+'" y2="215" stroke="#fff" stroke-opacity=".12" stroke-width="10"/>';
  return '<svg viewBox="0 0 330 380" width="330" aria-hidden="true" style="direction:ltr"><defs><linearGradient id="sgx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd4ff"/><stop offset=".5" stop-color="#1f6fa8"/><stop offset="1" stop-color="#0a2540"/></linearGradient></defs>'+
   '<rect width="330" height="380" rx="22" fill="url(#sgx)"/>'+rays+'<circle cx="272" cy="50" r="26" fill="#ffd966"/>'+
   '<path d="M0 78 Q40 66 82 78 T165 78 T248 78 T330 78" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="3"/>'+dots+
   fish(105,226,.8,'#ffb98a')+fish(232,262,1.05,'#c7d6e2')+fish(120,318,1.5,'#8aa4bd')+
   '<path d="M20 372 q30 -40 60 0 q30 -34 60 0" fill="#173a29" opacity=".8"/></svg>';
}

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يشرح أن المنتجات يمكن أن تكون كائنات حية تقوم بالتمثيل الضوئي أو التمثيل الكيميائي. <b class="num">(3-5)</b>',
   'يعرّف الإنتاجية بأنها معدل إنتاج الكتلة الحيوية لكل وحدة مساحة أو حجم لكل وحدة زمنية، ويشرح كيف يمكن أن تؤثر الإنتاجية الأولية العالية على السلاسل الغذائية. <b class="num">(3-6)</b>',
   'يحسب ويفسّر فقدان الطاقة على طول السلسلة الغذائية. <b class="num">(3-7)</b>',
   'يرسم ويصف ويفسّر أهرامات الأعداد والكتلة الحيوية والطاقة، بما في ذلك تلك التي تحتوي على الطفيليات وفترات ازدهار العوالق النباتية مثل ازدهار الطحالب. <b class="num">(3-8)</b>'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:22px 28px 20px;justify-content:center;gap:10px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الوحدة 3 · التفاعلات في النظم البيئية البحرية</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:58px;font-weight:800;line-height:1.05"><span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">علاقات التغذية</span> <span class="num">3-2</span></h1>
    <p style="font-size:24px;font-weight:700;line-height:1.4;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:10px">${L.map(function(t){return '<button type="button" class="gi" style="font-size:21px"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;align-items:center;justify-content:center">${seaSVG()}</div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف ٣-٥ إلى ٣-٨ بنصها من كتاب الطالب ص٨٦. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>الدرس هو القسم ٣-٢ «علاقات التغذية» (كتاب الطالب ص٩٠–١٠١) ومعه أنشطة كتاب التجارب العملية (نشاط ٣-١ و٣-٢ و٣-٣ والاستقصاءان العمليان) وأسئلة نهاية الوحدة.</li><li>دليل المعلم غير متوفر: الإجابات النموذجية التي تظهر في الدرس كتبتها من نص الكتاب وأعلّمها «من عندي».</li></ul>'});

/* 2 lead-in: phytoplankton (student book p. 87, "Environmental science in context") */
explain({id:'lead1',ch:0,title:'تمهيد: العوالق النباتية',tag:'سؤال',
 lead:{q:'ما أهم ما تقدّمه العوالق النباتية للحياة في المحيط وعلى الأرض؟',
  opts:[{t:'تنتج أكثر من نصف أكسجين الهواء وهي أساس الغذاء في البحر',ok:true,why:'صح: أكثر من نصف الأكسجين الذي يتنفسه الإنسان يأتي من التمثيل الضوئي للعوالق النباتية'},{t:'تفترس الأسماك الكبيرة',why:'العوالق النباتية منتجات تصنع غذاءها بنفسها ولا تفترس'},{t:'تعيش في قاع المحيط المظلم',why:'تحتاج إلى الضوء، فتعيش في الطبقة العليا المضاءة'}],
  gbar:'السؤال للنقاش: ماذا يحدث للأكسجين ولغذاء الأسماك لو قلّت العوالق النباتية؟'},
 pts:['يعتمد نحو <b class="num">3</b> مليارات إنسان على النظم البيئية البحرية في غذائهم، وغالبية بروتينهم من أسماك البحار والمزارع البحرية.',
  tm('العوالق النباتية','Phytoplankton')+': كائنات حية مجهرية تطفو في الطبقات العليا من الماء التي يصلها ضوء الشمس، وتحتوي على الكلوروفيل.',
  'تقوم بالتمثيل الضوئي وتنتج ما يصل إلى <b class="num">160</b> مليار طن من الكربوهيدرات <span class="en">Carbohydrate</span> كل سنة.',
  'أكثر من <b>نصف الأكسجين</b> الذي يتنفسه الإنسان يأتي من التمثيل الضوئي الذي تقوم به العوالق النباتية.',
  'تراقب ناسا العوالق النباتية بصور الأقمار الاصطناعية (لون الماء)، ووجدت انخفاضاً في أعدادها خلال العقد الماضي، وقد يعود ذلك إلى ارتفاع حرارة سطح المحيطات.',
  tm('ازدهار الطحالب','Algal bloom')+': زيادة سريعة في أعداد الجماعة الأحيائية للطحالب.'],
 fs:21,gap:8,
 note:'<ul><li>كتاب الطالب ص٨٧ («العلوم البيئية ضمن سياقها: أهمية العوالق النباتية») وص٨٨ (أسئلة للمناقشة، السؤال ٢ عن مراقبة ناسا).</li><li>اترك الطلاب يجيبون على سؤال البداية قبل نزول النقاط.</li><li>المصطلحات: الكربوهيدرات، ازدهار الطحالب (مصطلحات علمية ص٨٧).</li></ul>'});

/* 3 lead-in: order a marine food chain (student book p. 92 example; "before you start", p. 87) */
slide({id:'lead2',ch:0,title:'تمهيد: رتّب السلسلة الغذائية',tag:'رتّب',
 html:function(){
  var slots=[1,2,3,4,5].map(function(i){return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1"><div class="mslot slot" data-k="'+i+'" style="width:100%;min-height:74px;justify-content:center"><span class="ph" style="font-size:21px">'+ar(i)+'</span></div><div class="sm lvl" style="font-size:19px;color:var(--cyan);font-weight:800;min-height:26px"></div></div>'+(i<5?'<div style="font-size:30px;color:var(--gold);align-self:flex-start;margin-top:18px">←</div>':'')}).join('');
  return `<div class="col grow" style="gap:12px;justify-content:center">
   <div class="panel" style="padding:12px 20px"><p class="lead" style="font-size:25px;margin:0 0 4px">ناقش مع زميلك ما تعرفه عن السلاسل الغذائية، ثم رتّب هذه الكائنات في سلسلة غذائية بحرية: من الكائن الذي يُؤكل أولاً إلى المفترس الأخير.</p><div class="sm" style="font-size:19px">اسحب كل كائن إلى مكانه، أو اضغط عليه ثم اضغط على المكان.</div></div>
   <div style="display:flex;gap:8px;direction:rtl;align-items:flex-start">${slots}</div>
   <div id="tray" class="tray"></div>
   <div class="fb" style="min-height:28px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:21px">السهم يشير إلى اتجاه انتقال الطاقة والكتلة الحيوية والمغذّيات: من الكائن الذي يُؤكل إلى الكائن الذي يأكله. البداية دائماً كائن ذاتي التغذية (منتج).</div></div>`;},
 init:function(el){
  var L=['منتج','مستهلك أولي','مستهلك ثانوي','مستهلك ثالثي','مستهلك رابعي'];
  bindMatch(el,[['3','سمك التونة'],['5','سمك القرش'],['1','سوطيات دوارة'],['4','سمك المارلين'],['2','جمبري']],{css:'font-size:21px;padding:10px 14px',more:'صح! كمّل',done:'✓ سلسلة غذائية بحرية صحيحة',bad:'فكّر: من يأكل من؟',onDone:function(){ $$('.lvl',el).forEach(function(d,i){d.textContent=L[i]}) }});
 },
 note:'<ul><li>السلسلة من كتاب الطالب ص٩٢: السوطيات الدوارة ← جمبري ← سمك التونة ← سمك المارلين ← سمك القرش. وسؤال «قبل أن تبدأ» ص٨٧: ناقش في مجموعة ثنائية ما تعرفه عن السلاسل الغذائية.</li><li>النشاط نفسه (الترتيب بالسحب) من عندي.</li></ul>'});

/* 4 autotrophs (student book pp. 90-91) */
explain({id:'auto',ch:1,title:'ذاتية التغذية: من يصنع الغذاء؟',tag:'اكتشف',
 lead:{q:'ما الذي يفعله الكائن ذاتي التغذية؟',
  opts:[{t:'يصنع غذاءه بنفسه من مواد غير عضوية بسيطة',ok:true,why:'صح: يبني مركبات عضوية من جزيئات بسيطة مثل ثاني أكسيد الكربون'},{t:'يأكل كائنات حية أخرى',why:'هذا غير ذاتي التغذية (المستهلك)'},{t:'يفكّك بقايا الكائنات الميتة',why:'هذه وظيفة المحلّلات'}],
  gbar:'المنتجات هي بداية كل سلسلة غذائية.'},
 pts:['تعتمد كل أشكال الحياة على الأرض على الطاقة التي تُثبَّت في الكربوهيدرات بواسطة <b>المنتجات</b>، وتسمى الكائنات الحية '+tm('ذاتية التغذية','Autotrophic')+'.',
  'الكائن ذاتي التغذية يصنع غذاءه بنفسه: يبني مركبات عضوية من جزيئات غير عضوية بسيطة، ويمتص طاقة الضوء أو المواد الكيميائية.',
  tm('التمثيل الضوئي','Photosynthesis')+': مصدر الطاقة هو ضوء الشمس، ويحدث في الطبقة العليا المضاءة من المحيط، ولذلك توجد فيها نحو <b class="num">90%</b> من الحياة البحرية.',
  tm('التمثيل الكيميائي','Chemosynthesis')+': مصدر الطاقة مواد كيميائية غير عضوية (مثل كبريتيد الهيدروجين)، وتقوم به بكتيريا قرب الفوهات المائية الحرارية في أعماق المحيط.',
  'قدرة هذه الكائنات على بناء الكربوهيدرات بالتمثيل الكيميائي تأقلم مهم للعيش في الظروف القاسية.'],
 fs:22,
 note:'<ul><li>كتاب الطالب ص٩٠–٩١ (المصطلحان: ذاتي التغذية، التمثيل الكيميائي). الهدف ٣-٥.</li><li>سنفصّل التمثيل الضوئي (الطبقة الضوئية) ثم التمثيل الكيميائي (الفوهات الحرارية) في فصل «الإنتاجية».</li></ul>'});

/* 5 heterotrophs and consumer levels (student book p. 91) */
(function(){
  function levels(){
    var L=[['منتج','سوطيات دوارة'],['مستهلك أولي','جمبري'],['مستهلك ثانوي','سمك التونة'],['مستهلك ثالثي','سمك المارلين'],['مستهلك رابعي','سمك القرش']];
    return '<div class="panel pb" data-pt style="padding:10px 12px"><div style="display:flex;align-items:stretch;gap:5px;direction:rtl">'+L.map(function(l,i){return '<div style="flex:1;text-align:center;border-radius:12px;padding:8px 4px;background:rgba(var(--t1),.12)"><div style="font-size:16px;color:var(--cyan);font-weight:800">'+l[0]+'</div><div style="font-size:19px;font-weight:700;line-height:1.3">'+l[1]+'</div><div style="font-size:15px;color:var(--muted)">المستوى '+ar(i+1)+'</div></div>'+(i<4?'<div style="align-self:center;font-size:22px;color:var(--gold)">←</div>':'')}).join('')+'</div></div>';
  }
  explain({id:'hetero',ch:1,title:'غير ذاتية التغذية: المستهلكات',tag:'اكتشف',
   lead:{q:'لماذا يندر وجود مستهلكات بعد المستوى الرابعي؟',
    opts:[{t:'لأن الطاقة المتاحة تقل كثيراً في كل مستوى غذائي',ok:true,why:'صح: الانخفاض في الطاقة المتاحة يحدّ من عدد المستويات'},{t:'لأن الكائنات الكبيرة لا تأكل',why:'الكائنات الكبيرة تأكل، لكن الطاقة المتاحة لها قليلة'},{t:'لأن المنتجات تختفي',why:'المنتجات موجودة في بداية السلسلة'}],
    gbar:'كلما ارتفعنا في السلسلة قلّت الطاقة المتاحة.'},
   pts:[tm('غير ذاتي التغذية','Heterotrophic')+': كائن لا يستطيع صنع غذائه بنفسه، بل يتغذى على كائنات حية أخرى. منها جميع الحيوانات والفطريات والأوليات الحيوانية ومعظم البكتيريا.',
    'تسمى هذه الكائنات <b>المستهلكات</b>: تحصل على طاقتها بالتغذي على الكائنات ذاتية التغذية (المنتجات).',
    {html:levels()},
    'المستهلك الأولي يتغذى مباشرة على المنتجات، والثانوي على الأولي، والثالثي على الثانوي، والرابعي على الثالثي.',
    'من النادر جداً العثور على مستهلكات بعد الرابعية، بسبب الانخفاض في مقدار الطاقة المتاحة في كل مستوى غذائي.'],
   fs:22,gap:8,
   note:'<ul><li>كتاب الطالب ص٩١ (مصطلح: غير ذاتي التغذية). ترقيم المستويات الغذائية من كتاب الأنشطة ص١١٠ (المستهلك الأولي في المستوى الغذائي الثاني).</li><li>السلسلة المرسومة هي مثال الكتاب ص٩٢.</li></ul>'});
})();

/* 6 Table 3-2: herbivore, omnivore, carnivore (student book p. 91) */
(function(){
  var R=[['آكل الأعشاب','أسماك الببغاء التي تتغذى على الطحالب في الشعاب المرجانية'],['القارت','نوع سرطان البحر الذي يأكل الطحالب وصغار الأسماك واللافقاريات الصغيرة'],['آكل اللحوم','الفقمات التي تصطاد وتأكل الحبار والروبيان والأسماك']];
  var T='<div class="panel" style="padding:10px 16px"><table class="tbl32"><thead><tr><th>النوع</th><th>أمثلة في النظم البيئية البحرية</th></tr></thead><tbody>'+R.map(function(r){return '<tr data-pt><td style="font-weight:800;color:var(--gold);white-space:nowrap">'+r[0]+'</td><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table></div>';
  explain({id:'tab32',ch:1,title:'الجدول 3-2: آكل أعشاب وقارت وآكل لحوم',tag:'جدول',
   lead:{q:'أي حيوان من الجدول يأكل النباتات (الطحالب) والحيوانات معاً؟',
    opts:[{t:'سمكة الببغاء',why:'تأكل الطحالب فقط: آكلة أعشاب'},{t:'نوع سرطان البحر الذي يأكل الطحالب وصغار الأسماك',ok:true,why:'صح: يأكل المنتجات والحيوانات معاً فهو قارت'},{t:'الفقمة',why:'تأكل الحيوانات فقط: آكلة لحوم'}],
    gbar:'يجب أن تعرف المصطلحات الثلاثة وأمثلتها.'},
   pts:[{html:T},{html:'<div class="panel pb" data-pt>المستهلكات الأولية قد تكون <b>آكلة أعشاب</b>، أما المستهلكات الثانوية فما فوق فقد تكون <b>آكلة لحوم</b> أو <b>قارتة</b> (تأكل المنتجات والحيوانات).</div>'}],
   lw:420,gap:12,
   note:'<ul><li>كتاب الطالب ص٩١: الجدول ٣-٢ بنصه (أمثلة آكل الأعشاب والقارت وآكل اللحوم). يجب أن يعرف الطالب المصطلحات الثلاثة.</li><li>الجملة الأخيرة (ربط المصطلحات بالمستويات الغذائية) من عندي بناءً على نص الكتاب.</li></ul>'});
})();

/* 7 classify consumers (Table 3-2 and activity book Activity 3-2) */
slide({id:'cls32',ch:1,title:'صنّف المستهلكات',tag:'صنّف',
 html:function(){
  var items=[['سمكة الببغاء التي تتغذى على الطحالب في الشعاب المرجانية','h','آكلة أعشاب: تأكل المنتجات (الطحالب) فقط'],
   ['نوع سرطان البحر الذي يأكل الطحالب وصغار الأسماك واللافقاريات','o','قارت: يأكل المنتجات والحيوانات'],
   ['الفقمة التي تصطاد الحبار والروبيان والأسماك','c','آكلة لحوم: تأكل الحيوانات فقط'],
   ['خروف البحر الذي يتغذى على حشائش الضحل وأوراق المانجروف','h','آكل أعشاب: يتغذى على النباتات البحرية'],
   ['سمك القرش الذي يفترس الفقمات','c','آكل لحوم']];
  return `<div class="col grow" style="gap:10px;justify-content:center">
   <div style="font-size:24px;font-weight:800;color:var(--cyan)">ما نوع كل مستهلك: آكل أعشاب أم قارت أم آكل لحوم؟</div>
   <div class="clsw" style="max-width:none">${clsHTML(items,[['h','آكل أعشاب'],['o','قارت'],['c','آكل لحوم']],22)}</div>
   <div class="fb" style="min-height:26px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:21px">آكل الأعشاب يأكل المنتجات فقط، وآكل اللحوم يأكل الحيوانات فقط، والقارت يأكل النوعين.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: ماذا يأكل هذا الحيوان؟') },
 note:'<ul><li>الأمثلة الثلاثة الأولى من الجدول ٣-٢ (كتاب الطالب ص٩١)، وخروف البحر من نشاط ٣-٢ (كتاب الأنشطة ص١٠٥). مثال القرش من عندي (ورد القرش مفترساً في كتاب الطالب ص٩٢).</li></ul>'});

/* 8 zooplankton and decomposers (student book p. 91) */
explain({id:'zoo',ch:1,title:'العوالق الحيوانية والمحلّلات',tag:'اكتشف',
 lead:{q:'ما المرحلة الأخيرة في أي علاقة غذائية؟',
  opts:[{t:'المحلّلات التي تفكّك المغذّيات العضوية في الأجسام الميتة',ok:true,why:'صح: وبذلك تعود المغذّيات إلى البيئة لتمتصها المنتجات'},{t:'المفترسات الكبيرة',why:'عند موتها تفكّكها المحلّلات'},{t:'العوالق الحيوانية',why:'هي مستهلكات في وسط السلسلة'}],
  gbar:'المحلّلات تُغلق الدائرة: المغذّيات تعود للمنتجات.'},
 pts:[tm('العوالق الحيوانية','Zooplankton')+' مستهلكات مهمة في النظم البحرية، وتشمل مجدافيات الأرجل <span class="en">Copepods</span> والمثقبات <span class="en">Foraminifera</span> والكريل <span class="en">Krill</span>.',
  'مجدافيات الأرجل غير الطفيلية آكلة أعشاب صغيرة تتغذى على الدياتومات <span class="en">Diatoms</span>.',
  'المثقبات حيوانات وحيدة الخلية بأصداف من كربونات الكالسيوم، وكثير منها قوارت تتغذى على الطحالب ومجدافيات الأرجل.',
  'الكريل قارت يشبه الروبيان، يتغذى على عوالق حيوانية ونباتية، وهو غذاء مهم للطيور والأسماك والفقمات والحيتان البالينية <span class="en">Baleen whales</span>.',
  tm('المحلّلات','Decomposers')+' (البكتيريا والفطريات) تفكّك المغذّيات العضوية في أجسام الكائنات الميتة؛ لذلك هي المرحلة الأخيرة في أي علاقة غذائية، وتعود المغذّيات إلى البيئة لتمتصها المنتجات.'],
 fs:21,gap:8,
 note:'<ul><li>كتاب الطالب ص٩١ (الفقرتان الأخيرتان قبل الافتراس).</li></ul>'});

/* 9 vocabulary of feeding relationships (activity book, Activity 3-2, pp. 105 and 125) */
slide({id:'terms',ch:1,title:'مفردات علاقات التغذية',tag:'اضغط وتعرّف',
 html:function(){
  var items=[['المنتج '+'<span class="en">Producer</span>','كائن حي ذاتي التغذية يصنع غذاءه بالتمثيل الضوئي أو الكيميائي، وهو بداية السلسلة الغذائية.'],
   ['المستهلك '+'<span class="en">Consumer</span>','كائن غير ذاتي التغذية يحصل على طاقته بالتغذي على كائنات حية أخرى (أولي، ثانوي، ثالثي، رابعي).'],
   ['المحلل '+'<span class="en">Decomposer</span>','بكتيريا وفطريات تفكّك المواد العضوية الميتة فتعود المغذّيات إلى البيئة.'],
   ['المستوى الغذائي '+'<span class="en">Trophic level</span>','الموقع الذي يشغله الكائن الحي في السلسلة الغذائية أو الشبكة الغذائية.'],
   ['الإطار البيئي '+'<span class="en">Niche</span>','الدور الذي يؤديه النوع في نظام بيئي معيّن.'],
   ['السلسلة والشبكة الغذائية','السلسلة الغذائية <span class="en">Food chain</span>: طريقة لوصف علاقات التغذية بين الكائنات الحية. الشبكة الغذائية <span class="en">Food web</span>: طريقة تبيّن جميع علاقات التغذية المختلفة في النظام البيئي.']];
  return `<div class="col grow" style="gap:10px;justify-content:center">
   <div style="font-size:24px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة لتظهر:</div>
   ${cardsHTML(items,'two qa')}</div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>المصطلحات: المستوى الغذائي والإطار البيئي (كتاب الأنشطة ص١٠٥ «مصطلحات علمية»)، والسلسلة والشبكة الغذائية (ص١٢٥). تعريفات المنتج والمستهلك والمحلل سؤال نشاط ٣-٢ س١(أ): صغتها من نص الكتاب (من عندي).</li></ul>'});
