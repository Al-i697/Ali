/* ---------- alkanes, part D: the homologous series, the concept map, worksheets 4-1 and 4-2, end-of-unit questions ---------- */

/* 21 homologous series */
slide({id:'homol',ch:5,title:'السلسلة المتجانسة',tag:'اكتشف',
 html:function(){
  var items=[['الصيغة العامة نفسها','C<sub>n</sub>H<sub>2n+2</sub>'],['يختلف كل فرد عن الذي قبله بوحدة <span class="num">CH<sub>2</sub></span>','مثل: CH₄ ثم C₂H₆ ثم C₃H₈ …'],['خصائص كيميائية متشابهة','كلها غير نشطة وتحترق جيداً.'],['خصائص فيزيائية تتدرّج','ترتفع درجتا الانصهار والغليان تدريجياً بزيادة طول السلسلة.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:8px 16px;gap:6px"><div style="display:flex;align-items:center;gap:14px"><button type="button" class="btn acc" id="ad">أضف <span class="num">CH<sub>2</sub></span> ⊕</button><span class="sm" style="font-size:20px" id="df"></span></div>
     <div id="row" style="display:flex;flex-wrap:wrap;gap:8px;direction:ltr"></div></div>
    <div class="panel" style="padding:12px 16px;gap:8px"><div style="font-size:23px;font-weight:800">الفرق بين الكتلة المولية لألكانين متتاليين:</div>${qline('Mr(C₂H₆) − Mr(CH₄) = 30 − 16 =',[['d','g/mol']])}<div class="fb" style="min-height:22px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الفرق دائماً 14 = Mr(<span class="num">CH<sub>2</sub></span>) = 12 + 2.</div></div>
   <div class="col" style="width:440px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">علّل: لماذا تُعدّ الألكانات سلسلة متجانسة؟</div>${cardsHTML(items)}</div></div>`;},
 init:function(el){
  var n=1, a=false, b=false; function chk(){ if(a&&b) unhide(el) }
  function paint(){
    $('#row',el).innerHTML=ALK.slice(0,n).map(function(x,i){return (i?'<span class="num" style="align-self:center;color:var(--gold);font-size:20px">+CH₂ →</span>':'')+'<div style="padding:8px 12px;border-radius:14px;background:rgba(var(--d2),.65);box-shadow:inset 0 0 0 2px var(--line);text-align:center"><div class="num" style="font-size:26px;font-weight:800">'+sub(x.f)+'</div><div style="font-size:17px;color:var(--muted)">Mr = '+(14*x.n+2)+'</div></div>'}).join('');
    $('#df',el).textContent=n<6?'اضغط لتضيف وحدة CH₂ وتحصل على الألكان التالي':'وصلنا إلى الهكسان: كل خطوة أضافت CH₂ (14)';
    if(n>=6) $('#ad',el).classList.add('hide');
  }
  paint(); $('#ad',el).addEventListener('click',function(){ if(n<6){n++; paint()} });
  bindCards(el,function(){a=true; chk()});
  bindSeq(el,[{n:'d',a:14,t:.01,w:'✓ 14 = Mr(CH₂)',h:'30 − 16'}],$('.fb',el),function(){b=true; chk()});
 },
 note:'<ul><li>السلسلة المتجانسة (كتاب الطالب ص٨٣ ودليل المعلم): مركبات تمتلك الصيغة العامة نفسها، وتختلف بوحدة –CH₂– بين الصيغة الجزيئية لمركّب لاحق والصيغة الجزيئية لمركّب سابق، وتتشابه في الخصائص الكيميائية، وتُظهر تغيّراً تدريجياً في الخصائص الفيزيائية مثل درجتي الانصهار والغليان عند زيادة كتلتها المولية.</li><li>علل «لماذا تُعدّ الألكانات سلسلة متجانسة؟» من عرضك القديم (شريحة ٢٩) وعرض NotebookLM (شريحة ٥ في عرض الألكينات).</li></ul>'});

/* 22 concept map */
slide({id:'map',ch:5,title:'خريطة مفاهيم: الألكانات',tag:'ملخص الدرس',
 html:function(){
  var items=[['التعريف','هيدروكربونات مشبعة: روابطها أحادية فقط.'],['الصيغة العامة','C<sub>n</sub>H<sub>2n+2</sub>، واسمها ينتهي بـ «آن».'],['أبسط مركباتها','الميثان CH₄ والإيثان C₂H₆.'],['الحالات الفيزيائية','غازات C₁–C₄، سوائل C₅–C₁₆، صلبة شمعية C₁₇ فأكثر.'],['نشاطها الكيميائي','غير نشطة كيميائياً (مشبعة، وروابطها قوية).'],['الاحتراق','ألكان + أكسجين ← CO₂ + H₂O + طاقة.'],['استخدامها','وقود: الغاز الطبيعي (ميثان)، وغاز LPG (بروبان وبيوتان).'],['السلسلة المتجانسة','الصيغة العامة نفسها، تختلف بوحدة CH₂.']];
  return `<div style="display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center">
   <div style="text-align:center"><span style="display:inline-block;padding:8px 40px;border-radius:30px;background:linear-gradient(145deg,#7BD6A8,#2e9a6c);color:#06281a;font-size:40px;font-weight:800">الألكانات</span></div>
   ${cardsHTML(items,'two')}
   <div class="gbar hide" id="gb" style="font-size:21px">هذه خلاصة الدرس. انتقل إلى أسئلة ورقتي العمل.</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>خريطة المفاهيم في عرضك القديم (شريحة ٣٠): التعريف، الصيغة العامة، أبسط مركباتها، حالاتها الفيزيائية، نشاطها الكيميائي، احتراقها، استخداماتها. أضفت «السلسلة المتجانسة».</li></ul>'});

/* 23 worksheet 4-1 */
(function(){
  var pts=[[5,36],[6,69],[7,99],[9,151],[10,174]];
  var graph=plotSVG(pts,{w:360,h:210,xmin:4,xmax:11,ymin:0,ymax:200,xt:7,yt:4,xl:'عدد ذرات الكربون',yl:'الغليان (°C)',sw:340});
  var items=[
   {q:'<b>ورقة العمل ٤-١ س١(ب):</b> ماذا يحدث لدرجة الغليان كلما ازداد عدد ذرات الكربون؟',opts:[{t:'ترتفع بانتظام',ok:true,why:'ترتفع درجات الغليان بانتظام مع ازدياد عدد ذرات الكربون'},{t:'تنخفض',why:'من 36 إلى 174: ترتفع'},{t:'لا تتغير',why:'القيم مختلفة ومتزايدة'}]},
   {type:'num',q:'<b>س١(ج):</b> استخدم الرسم لتتوقّع درجة غليان الأوكتان C<sub>8</sub>H<sub>18</sub> (8 ذرات كربون):<div style="display:flex;justify-content:center;margin-top:6px">'+graph+'</div>',unit:'°C',ans:125,tol:10,why:'نحو 125 °C (بين 99 عند 7 و151 عند 9)',hint:'اقرأ القيمة بين نقطتي 7 و9'},
   {q:'<b>س١(د):</b> جمع طالب ثلاثة مشتقات من البترول: A: 50–90، B: 100–140، C: 150–200 °C. أيها يصلح جازولين؟',opts:[{t:'A',ok:true,why:'مدى غليانه يناسب طول جزيئات الجازولين (C₄–C₁₂ ، 40–100 °C)'},{t:'B',why:'هذا أقرب إلى النفثا والكيروسين'},{t:'C',why:'هذا أقرب إلى الكيروسين وزيت الديزل'}]},
   {q:'<b>س٢(أ):</b> كيف تعرف أن هيدروكربوناً ينتمي إلى الألكانات؟',opts:[{t:'تفحص صيغته: كل روابط C–C أحادية وصيغته CₙH₂ₙ₊₂',ok:true,why:'الألكان هيدروكربون مشبع، كل روابط C–C فيه أحادية، وصيغته العامة CₙH₂ₙ₊₂'},{t:'تعدّ ذرات الأكسجين فيه',why:'الهيدروكربون لا يحتوي أكسجيناً'},{t:'تقيس لونه فقط',why:'الألكانات عديمة اللون لكن هذا لا يميّزها'}]},
   {q:'<b>س٢(د):</b> المعادلة الموزونة لاحتراق الإيثان في وفرة من الأكسجين:',opts:[{t:'<span class="num lbl">C<sub>2</sub>H<sub>6</sub>(g) + O<sub>2</sub>(g) → CO<sub>2</sub>(g) + H<sub>2</sub>O(g)</span>',why:'غير موزونة'},{t:'<span class="num lbl">2C<sub>2</sub>H<sub>6</sub>(g) + 7O<sub>2</sub>(g) → 4CO<sub>2</sub>(g) + 6H<sub>2</sub>O(g)</span>',ok:true,why:'موزونة: C = 4، H = 12، O = 14'},{t:'<span class="num lbl">2C<sub>2</sub>H<sub>6</sub>(g) + 5O<sub>2</sub>(g) → 4CO<sub>2</sub>(g) + 6H<sub>2</sub>O(g)</span>',why:'الأكسجين: 10 ≠ 14'}]}
  ];
  slide({id:'ws41',ch:6,title:'ورقة العمل ٤-١: الألكانات',tag:'كتاب النشاط',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'ws41')},
   note:'<ul><li>كتاب النشاط ص٦٧–٦٨. الإجابات حسب دليل المعلم: (ب) ترتفع درجات الغليان بانتظام (يمكن رسم منحنى منتظم يجمع النقاط)، (ج) حوالي 125 °C، (د) A لأن مدى غليانه يتناسب مع طول جزيئات الجازولين.</li><li>س٢: (أ) الألكان هيدروكربون مشبع تكون فيه كل روابط C–C أحادية وله الصيغة العامة CₙH₂ₙ₊₂. (ب) المخطط النقطي والصيغة البنائية للميثان والإيثان (شريحة المخطط النقطي). (ج) ثاني أكسيد الكربون والماء. (د) المعادلة أعلاه.</li></ul>'});
})();

/* 24 worksheet 4-2: burning hydrocarbons */
(function(){
  var items=[
   {q:'<b>ورقة العمل ٤-٢ س١:</b> متى يكون لهب موقد بنزن (الميثان) أكثر سخونة؟',opts:[{t:'عندما تكون فتحة الهواء مغلقة',why:'الإغلاق يقلّل الأكسجين فيصير الاحتراق غير كامل وأقل سخونة'},{t:'عندما تكون فتحة الهواء مفتوحة',ok:true,why:'تُوفّر كمية أكبر من الأكسجين، فيكون الحرق أكثر كفاءة وتنتج درجات حرارة أعلى'}]},
   {q:'<b>س١(ج):</b> ما العنصران المكوّنان للميثان؟',opts:[{t:'الكربون والأكسجين',why:'الأكسجين لا يدخل في تركيب الميثان'},{t:'الكربون والهيدروجين',ok:true,why:'الميثان CH₄ هيدروكربون'},{t:'الهيدروجين والأكسجين',why:'هذا الماء'}]},
   {q:'<b>س٢(أ):</b> أي مما يلي <u>ميزة</u> للبيوتان مقارنة بالفحم كمصدر للحرارة؟',opts:[{t:'سهولة اشتعاله',ok:true,why:'يشتعل بسهولة بضغطة شرارة، أما الفحم فيحتاج وقتاً'},{t:'لا يحتاج إلى تخزين تحت ضغط',why:'هذا عيب البيوتان: يُخزَّن سائلاً في حاوية مغلقة تحت ضغط'},{t:'يشتعل بصعوبة',why:'هذه ليست ميزة'}]},
   {q:'<b>س٢(ب):</b> قارن البروبان بالبيوتان: أيهما أكثر قابلية للتطاير والاشتعال؟',opts:[{t:'البروبان',ok:true,why:'جزيئه أصغر، وقوى التجاذب أضعف، ودرجة غليانه أقل، فهو أكثر تطايراً وأسهل اشتعالاً'},{t:'البيوتان',why:'جزيء البيوتان أكبر، فقوى التجاذب أقوى وتطايره أقل'}]},
   {q:'<b>س٢(ج):</b> ما المصطلح الذي يصف تحوّل السائل إلى غاز؟',opts:[{t:'التكثّف',why:'التكثّف هو تحوّل الغاز إلى سائل'},{t:'التبخّر',ok:true,why:'التبخّر: تحوّل المادة من الحالة السائلة إلى الغازية'},{t:'التجمّد',why:'التجمّد هو تحوّل السائل إلى صلب'}]},
   {q:'<b>س٢(هـ):</b> المعادلة الموزونة لاحتراق البيوتان:',opts:[{t:'<span class="num lbl">C<sub>4</sub>H<sub>10</sub>(g) + 13O<sub>2</sub>(g) → 8CO<sub>2</sub>(g) + 10H<sub>2</sub>O(g)</span>',why:'غير موزونة: C = 4 ثم 8'},{t:'<span class="num lbl">2C<sub>4</sub>H<sub>10</sub>(g) + 13O<sub>2</sub>(g) → 8CO<sub>2</sub>(g) + 10H<sub>2</sub>O(g)</span>',ok:true,why:'موزونة: C = 8، H = 20، O = 26'},{t:'<span class="num lbl">2C<sub>4</sub>H<sub>10</sub>(g) + 9O<sub>2</sub>(g) → 8CO<sub>2</sub>(g) + 10H<sub>2</sub>O(g)</span>',why:'الأكسجين: 18 ≠ 26'}]}
  ];
  slide({id:'ws42',ch:6,title:'ورقة العمل ٤-٢: حرق الهيدروكربونات',tag:'كتاب النشاط',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'ws42')},
   note:'<ul><li>كتاب النشاط ص٦٩–٧٠. الإجابات من دليل المعلم ص٩٦: س١: (أ) مفتوحة، (ب) كمية أكبر من الأكسجين ← حرق أكثر كفاءة ← درجات حرارة أعلى، (ج) الكربون والهيدروجين.</li><li>س٢: (أ) ميزة البيوتان سهولة اشتعاله، وعيبه ضرورة تخزينه تحت ضغط. (ب) البروبان أكثر قابلية للتطاير وللاشتعال. (ج) التبخّر. (د) الصيغة البنائية للبيوتان (في شريحة «أكمل الصيغة البنائية»). (هـ) ماء + ثاني أكسيد الكربون ← أكسجين + بيوتان، و 2C₄H₁₀(g) + 13O₂(g) → 8CO₂(g) + 10H₂O(g).</li></ul>'});
})();

/* 25 end-of-unit questions 1 and 2 */
slide({id:'eou',ch:6,title:'أسئلة نهاية الوحدة ١ و٢',tag:'كتاب الطالب ص٩٩',
 html:function(){
  var items=[['س١(أ): اذكر ثلاثة أسباب تفسّر قدرة الكربون على تكوين مركّبات أكثر من أي عنصر آخر','سلاسل أو حلقات، وروابط متعددة مع ذرات كربون أخرى، وروابط مع ذرات عناصر أخرى.'],['س١(ب): ما المقصود بالهيدروكربون المشبع؟','مركّب من الهيدروجين والكربون فقط، روابطه أحادية فقط، ولا يمكنه إضافة المزيد من الذرات إلى سلسلته الكربونية.'],['س١(ب): ما المصدر الطبيعي الرئيسي للميثان؟','الغاز الطبيعي.'],['س٢(أ، ب، ج): الشكل لألكان صيغته الجزيئية C₂H₆: ما اسمه؟ وصيغته العامة؟ واسم الرابع في السلسلة؟','إيثان. الصيغة العامة CₙH₂ₙ₊₂. الرابع هو البيوتان C₄H₁₀.'],['س٢(د): ارسم المخطط النقطي للإيثان','انظر شريحة المخطط النقطي: ٧ أزواج مشتركة، ٦ منها C–H وواحد C–C.'],['س٢(هـ): فسّر ارتفاع درجات غليان الألكانات مع زيادة حجم الجزيء','كلما كبر الجزيء ازدادت قوى التجاذب بين الجزيئات، فيلزم طاقة أكثر للتغلب عليها.']];
  return `<div style="display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center">
   <div style="font-size:21px;font-weight:800;color:var(--cyan)">أجب في دفترك ثم اضغط على السؤال لتظهر الإجابة النموذجية:</div>
   ${cardsHTML(items,'two')}
   <div class="gbar hide" id="gb" style="font-size:21px">أحسنت! انتهينا من أسئلة نهاية الوحدة الخاصة بالألكانات.</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>أسئلة نهاية الوحدة ١ و٢ في كتاب الطالب ص٩٩. الإجابات من دليل المعلم ص٩٨.</li><li>السؤال ٣ (الألكينات) في الدرس ٤-٢، والسؤال ٤ (البترول) في الدرس ٤-٣.</li></ul>'});
