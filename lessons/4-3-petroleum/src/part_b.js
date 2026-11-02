/* ---------- petroleum, part B: refining, the fractionating tower, the properties of the fractions, the virtual distillation lab ---------- */

/* 6 why refine */
slide({id:'refine',ch:2,title:'لماذا نحتاج إلى التكرير؟',tag:'اكتشف',
 html:function(){
  var items=[['النفط مخلوط','يتكوّن من الكثير من الجزيئات الهيدروكربونية المختلفة.'],['حوالي 90% للوقود','يُستخدم معظم النفط المستخرج من الأرض لإنتاج الوقود.'],['حوالي 10% مواد أولية','يُستخدم كمواد خام (أولية) للصناعات الكيميائية.'],['التكرير','يتم قبل استخدامه فصل الجزيئات الهيدروكربونية المتنوعة بالتكرير، بالتقطير التجزيئي.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>${cardsHTML(items,'tight')}</div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;align-items:center;gap:6px"><div style="display:flex;align-items:center;gap:20px"><div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(#E4BC4B 0 90%,#5BA8E8 90% 100%);box-shadow:inset 0 0 0 3px rgba(255,255,255,.25)"></div><div style="font-size:20px;line-height:1.6"><span class="dotc" style="background:#E4BC4B"></span>90% وقود<br><span class="dotc" style="background:#5BA8E8"></span>10% مواد أولية</div></div></div>
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">أي خاصية تُستخدم لفصل هيدروكربونات النفط بالتقطير التجزيئي؟</div>
     ${optsHTML([{t:'درجة الغليان'},{t:'التوصيل الكهربائي'},{t:'النشاط الكيميائي'},{t:'درجة الانصهار'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">مشتقات النفط تُفصل بحسب <b>درجة الغليان</b>.</div></div></div>`;},
 init:function(el){
  var c=false,q=false; function chk(){ if(c&&q) unhide(el) }
  bindCards(el,function(){c=true; chk()});
  bindMcq($('#qp',el),[{t:'',ok:true,why:'تختلف درجات غليان المشتقات فتُفصل بالتقطير'},{t:'',why:'الهيدروكربونات لا توصل الكهرباء، فليست هذه خاصية للفصل'},{t:'',why:'التقطير فيزيائي ولا يعتمد على التفاعل الكيميائي'},{t:'',why:'التقطير يعتمد على الغليان لا الانصهار'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩١: «يتكوّن النفط من مخلوط يحتوي على الكثير من الجزيئات الهيدروكربونية المختلفة. ويتم استخدام معظم النفط المستخرج من الأرض لإنتاج الوقود، علماً بأن حوالي 10% منه يُستخدم كمواد خام، أو مواد أولية، للصناعات الكيميائية. ويتم قبل استخدامه فصل الجزيئات الهيدروكربونية المتنوعة بالتكرير». عرض NotebookLM شريحة ٦.</li><li>سؤال نهاية الوحدة ٤ (أ): الخاصية المستخدمة لفصل هيدروكربونات النفط: درجة الغليان.</li></ul>'});

/* 7 how the fractionating tower works, step by step */
slide({id:'process',ch:2,title:'كيف يعمل عمود التجزئة؟',tag:'شاهد',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:center">
   <div style="flex:none" id="tw">${towerHTML()}</div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:8px"><div id="st" style="font-size:24px;font-weight:700;line-height:1.5;min-height:112px"></div>
     <div style="display:flex;gap:10px;align-items:center"><button type="button" class="btn acc" id="nx">الخطوة التالية ▸</button><button type="button" class="btn" id="rs">من البداية</button><span class="sm" id="pn" style="font-size:20px"></span></div></div>
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">أي المشتقات يخرج من قمة العمود؟</div>
     ${optsHTML([{t:'الخفيفة: ذات درجات الغليان المنخفضة'},{t:'الثقيلة: ذات درجات الغليان المرتفعة'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الخفيفة تخرج من القمة، والثقيلة من القاعدة.</div></div></div>`;},
 init:function(el){
  var S=['يُسخَّن النفط في المرجل إلى درجة حرارة بين <b class="num">350 °C</b> و<b class="num">400 °C</b>.','ثم يُضخّ إلى <b>قاعدة</b> عمود التجزئة.','النفط يغلي، فيتصاعد <b>البخار</b> عبر العمود ويمرّ بسلسلة من كبسولات التبخير («قبعات الفقاعات»).','يبرد البخار تدريجياً كلما ارتفع نحو أعلى العمود: <b>الأسفل ساخن والأعلى بارد</b>.','تتكثف المشتقات المختلفة عند درجات حرارة مختلفة، على ارتفاعات مختلفة، وتُجمع في أوعية.'];
  var k=0, d=false, q=false, tw=$('.twrw',el); function chk(){ if(d&&q) unhide(el) }
  function paint(){
    $('#st',el).innerHTML=k?('<span class="rn" style="margin-inline-end:10px">'+ar(k)+'</span>'+S[k-1]):'اضغط «الخطوة التالية» لتبدأ.';
    $('#pn',el).innerHTML='<span class="num lbl">'+k+' / 5</span>';
    tw.setAttribute('data-step',k);
    $$('.tt',el).forEach(function(t){t.classList.toggle('hide',k<4)}); $$('.nm',el).forEach(function(t){t.classList.toggle('hide',k<5)});
    $$('.lv',el).forEach(function(b,i){b.style.filter=(k===3||k===4)?'brightness('+(0.75+i*.05)+')':''});
    $('#nx',el).classList.toggle('hide',k===5); if(k===5){d=true; chk()}
  }
  $('#nx',el).addEventListener('click',function(){ if(k<5){k++; paint()} }); $('#rs',el).addEventListener('click',function(){k=0; paint()}); paint();
  bindMcq($('#qp',el),[{t:'',ok:true,why:'الخفيفة (مثل غازات المصافي والجازولين) تخرج من القمة'},{t:'',why:'الثقيلة تخرج من القاعدة (مثل الأسفلت)'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩١: «في بداية عملية التقطير التجزيئي، يُسخَّن النفط إلى درجات حرارة تتراوح ما بين 350 °C و400 °C ثم يُضخ إلى قاعدة عمود التقطير. وبما أن النفط يغلي، فإن البخار يتصاعد عبر عمود التجزئة. فيمر عبر سلسلة من كبسولات التبخير «قبعات الفقاعات»، حيث يبرد البخار تدريجياً كلما ارتفع أكثر نحو أعلى العمود. تبرد المشتقات المختلفة وتتكثف عند درجات حرارة مختلفة، على ارتفاعات مختلفة من عمود التجزئة. ثم تجمع تلك المشتقات المتكثفة في أوعية».</li><li>«تسمّى المشتقات التي تخرج من قمة العمود بالخفيفة وتلك التي تخرج من قاعدته تُسمّى بالثقيلة».</li><li>عرض NotebookLM شريحة ٧ («آلية عمل التقطير التجزيئي خطوة بخطوة»): أعطت الشريحة في رسمها أرقاماً لدرجات حرارة المستويات تختلف عن الكتاب (وبعض الأسماء) فلم نعتمدها؛ الجدول ٤-٧ والشكل ٤-٣ في الكتاب هما المرجع.</li></ul>'});

/* 8 the interactive fractionating tower */
slide({id:'tower',ch:2,title:'عمود التجزئة: مشتقات النفط',tag:'تفاعل',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:center">
   <div style="flex:none">${towerHTML({names:true,temps:true})}</div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على أي مستوى في العمود:</div>
    <div class="panel" id="dt" style="padding:14px 18px;gap:8px;min-height:292px">
     <div id="dn" style="font-family:var(--font-display);font-size:30px;font-weight:800;color:var(--gold)">—</div>
     <div style="display:grid;grid-template-columns:150px 1fr;gap:8px 12px;align-items:center;font-size:20px;font-weight:700"><span>ذرات الكربون</span><div><b class="num lbl" id="dc" style="font-size:22px"></b></div><span>مدى الغليان</span><b class="num lbl" id="dbp" style="font-size:22px"></b><span>الاستخدام</span><span id="du" style="font-size:20px;line-height:1.35"></span></div>
     <div id="dch" style="margin-top:2px"></div>
     <div style="display:grid;grid-template-columns:130px 1fr;gap:5px 12px;align-items:center;font-size:18px;font-weight:700"><span>درجة الغليان</span><div class="cbar"><i id="p1" style="width:0"></i></div><span>اللزوجة</span><div class="cbar"><i id="p2" style="width:0"></i></div><span>التطاير</span><div class="cbar b2"><i id="p3" style="width:0"></i></div><span>قابلية الاشتعال</span><div class="cbar b2"><i id="p4" style="width:0"></i></div></div></div>
    <div style="display:flex;gap:12px;align-items:center"><span class="sm" id="pn" style="font-size:20px"><span class="num lbl">0 / 8</span> مستويات</span></div>
    <div class="gbar hide" id="gb" style="font-size:20px">كلما نزلنا نحو قاعدة العمود: ازداد طول السلسلة، وارتفعت درجة الغليان واللزوجة، وقلّ التطاير وقابلية الاشتعال.</div></div></div>`;},
 init:function(el){
  var seen={};
  $$('.lv',el).forEach(function(b){b.addEventListener('click',function(){
    var i=+b.getAttribute('data-i'), f=FR[i]; seen[i]=1; b.classList.add('seen');
    $$('.lv',el).forEach(function(x){x.classList.toggle('on',x===b)});
    $('#dn',el).textContent=f.n; $('#dc',el).textContent=cLabel(f); $('#dbp',el).textContent=f.t+' °C'; $('#du',el).textContent=f.u; $('#dch',el).innerHTML=chainBar(f);
    $('#p1',el).style.width=((i+1)/8*100)+'%'; $('#p2',el).style.width=((i+1)/8*100)+'%'; $('#p3',el).style.width=((8-i)/8*100)+'%'; $('#p4',el).style.width=((8-i)/8*100)+'%';
    var n=Object.keys(seen).length; $('#pn',el).innerHTML='<span class="num lbl">'+n+' / 8</span> مستويات'; if(n===8) unhide(el);
  })});
 },
 note:'<ul><li>الشكل ٤-٣ والجدول ٤-٧ (كتاب الطالب ص٩٢): غازات مصافي التكرير (C₁–C₄، أقل من 25 °C)؛ الجازولين (C₄–C₁₂، 40–100)؛ النفثا (C₇–C₁₄، 90–150)؛ الكيروسين (C₁₂–C₁₆، 150–240)؛ زيت الديزل/زيت الغاز (C₁₄–C₁₈، 220–300)؛ زيت الوقود (C₁₉–C₂₅، 250–320)؛ زيت التشحيم (C₂₀–C₄₀، 300–350)؛ الأسفلت (أكثر من C₇₀، أعلى من 350). السهم: ارتفاع درجة الغليان وازدياد اللزوجة وانخفاض قابلية التطاير والاشتعال.</li><li>تنبيه: الشكل ٤-٣ يكتب للأسفلت «> 340 °C» والجدول ٤-٧ «أعلى من 350»؛ ظهرت في عمود الدرجات هنا قيمة الشكل، وفي لوحة التفاصيل قيمة الجدول. وأرقام شريحة ٧ في عرض NotebookLM (برج بدرجات 50–930، 195–152…) تختلف عن الكتاب فلم تُعتمد. وفي كتاب النشاط (تمرين ٤-٤) الرسم يستخدم درجات تقريبية (40، 110، 180، 260، 340).</li><li>للمشتق نطاق (مدى) من درجات الغليان لا درجة غليان محددة، لأنه مخلوط من هيدروكربونات وليس مادة نقية.</li></ul>'});

/* 9 order by boiling point (question 4-22) */
slide({id:'order',ch:2,title:'رتّب المشتقات بحسب درجة الغليان',tag:'رتّب · سؤال ٤-٢٢',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="display:flex;justify-content:space-between;font-size:19px;font-weight:800;color:var(--muted)"><span>١ = أقل درجة غليان (أعلى العمود)</span><span>٥ = أعلى درجة غليان (أسفل العمود)</span></div>
    ${[1,2,3,4,5].map(function(n){return '<div style="display:grid;grid-template-columns:60px 1fr;gap:12px;align-items:center"><span class="rn" style="width:48px;height:48px;font-size:26px">'+ar(n)+'</span><div class="mslot" data-k="'+n+'" style="min-height:58px"><span class="ph">ضع المشتق هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب (أو اضغط ثم اضغط المكان):</div>
    <div id="tray" class="tray" style="display:flex;flex-direction:column;gap:8px"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">غازات المصافي ← الجازولين ← النفثا ← زيت الديزل ← الأسفلت: كلما نزلنا ارتفعت درجة الغليان.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['3','النفثا'],['5','الأسفلت'],['1','غازات مصافي التكرير'],['4','زيت الديزل'],['2','الجازولين']],{css:'font-size:21px;padding:10px 14px',more:'صح! كمّل',done:'الترتيب صحيح',bad:'فكّر: الأخف يخرج من القمة وله أقل درجة غليان'});
 },
 note:'<ul><li>سؤال ٤-٢٢ (كتاب الطالب ص٩٧): «رتّب المشتقات الآتية وفقاً لارتفاع درجات غليانها: زيت الديزل، الجازولين، غازات مصافي التكرير، الأسفلت، النفثا». إجابة الدليل: غازات مصافي التكرير والجازولين والنفثا وزيت الديزل والأسفلت.</li></ul>'});

/* 10 uses of the fractions (question 4-23) */
slide({id:'uses',ch:2,title:'استخدامات المشتقات النفطية',tag:'طابق · سؤال ٤-٢٣',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:4px;justify-content:center">
    ${FR.map(function(f,i){return '<div style="display:grid;grid-template-columns:230px 1fr;gap:10px;align-items:center"><b style="font-size:20px;color:'+lighten(LVC[i],.55)+';line-height:1.2">'+f.n+'</b><div class="mslot" data-k="'+f.k+'" style="min-height:42px;font-size:18px"><span class="ph" style="font-size:16px">الاستخدام</span></div></div>'}).join('')}
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:400px;flex:none;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">اسحب كل استخدام إلى مشتقه (أو اضغط ثم اضغط المكان):</div>
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:7px"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">لكل مشتق استخدام يناسب خصائصه: الجازولين وقود سيارات لأنه يسيل ويشتعل بسهولة، والأسفلت لزج لتعبيد الطرق.</div></div></div>`;},
 init:function(el){
  bindMatch(el,FR.map(function(f){return [f.k,f.u]}),{css:'font-size:17px;padding:7px 10px',more:'صح! كمّل',done:'ممتاز: عرفت استخدامات المشتقات الثمانية',bad:'ليس هذا المشتق: فكّر في خصائصه'});
 },
 note:'<ul><li>سؤال ٤-٢٣ (كتاب الطالب ص٩٧): اذكر استخداماً واحداً للمشتقات: الأسفلت، زيت الديزل، الجازولين، النفثا. إجابة الدليل: الأسفلت لتعبيد الطرق، زيت الديزل وقود للشاحنات، الجازولين (البنزين) وقود للسيارات، النفثا لصنع المواد الكيميائية. وسؤال نهاية الوحدة ٤ (ب) يُطلب فيه مطابقة المشتقات بالاستخدامات.</li><li>الاستخدامات الثمانية من الشكل ٤-٣.</li></ul>'});

/* 11 the trend of the properties down the tower */
slide({id:'trend',ch:3,title:'تدرّج خصائص المشتقات',tag:'جرّب',
 html:function(){
  var items=[['ارتفاع درجة الغليان','سلسلة أطول ← تجاذب أقوى بين الجزيئات ← طاقة أكبر لفصلها.'],['زيادة اللزوجة','الجزيئات الكبيرة تتشابك فتمنع بعضها من الحركة: الجازولين يتدفق بسهولة والأسفلت بطيء كالقطران.'],['انخفاض التطاير والاشتعال','يقلّ تبخّر الجزيئات الكبيرة فيقلّ البخار المختلط بأكسجين الهواء.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:8px 18px;gap:6px"><div style="display:flex;align-items:center;gap:16px"><span style="font-size:23px;font-weight:800">المشتق</span>${stepHTML('n','رقم',1)}<b id="an" style="font-size:26px;color:var(--gold)"></b></div>
     <div style="display:grid;grid-template-columns:170px 1fr;gap:5px 14px;align-items:center;font-size:19px;font-weight:700"><span>طول السلسلة</span><div id="dch"></div><span>درجة الغليان</span><div class="cbar"><i id="b1" style="width:0"></i></div><span>اللزوجة</span><div class="cbar"><i id="b2" style="width:0"></i></div><span>التطاير</span><div class="cbar b2"><i id="b3" style="width:0"></i></div><span>قابلية الاشتعال</span><div class="cbar b2"><i id="b4" style="width:0"></i></div></div></div>
    ${cardsHTML(items,'tight')}</div>
   <div class="col" style="width:290px;flex:none;gap:10px;justify-content:center"><div class="panel" style="padding:12px 14px;align-items:center;gap:8px"><div id="mc"></div><div class="sm" style="font-size:19px;text-align:center">طول سلسلة تقريبي</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">سلسلة أطول ← قوى تجاذب أقوى ← غليان ولزوجة أعلى، وتطاير واشتعال أقل.</div></div></div>`;},
 init:function(el){
  var seen={}, cards=false;
  bindCards(el,function(){cards=true; if(Object.keys(seen).length===8) unhide(el)});
  var st=bindStep(el,'n',1,8,function(n){
    var i=n-1, f=FR[i]; seen[n]=1; $('#an',el).textContent=f.n; $('#dch',el).innerHTML=chainBar(f);
    $('#b1',el).style.width=(n/8*100)+'%'; $('#b2',el).style.width=(n/8*100)+'%'; $('#b3',el).style.width=((9-n)/8*100)+'%'; $('#b4',el).style.width=((9-n)/8*100)+'%';
    var c=[1,4,7,12,14,19,20,30][i]; $('#mc',el).innerHTML=chainSVG(Math.min(8,Math.max(2,Math.round(c/2.2+1))),{u:Array(8).fill('H'),d:Array(8).fill('H'),l:'H',r:'H',w:Math.min(260,70+n*28)});
    if(cards&&Object.keys(seen).length===8) unhide(el);
  });
  st.set(1);
 },
 note:'<ul><li>كتاب الطالب ص٩٣: «كلما أصبحت السلاسل أطول، تصبح مشتقات النفط أكثر لزوجة… ويمكن تفسير ازدياد اللزوجة بازدياد حجم جزيئات مكونات مشتق التقطير وبازدياد القوى بين-الجزيئية الموجودة بين الجزيئات الكبيرة. أضف إلى ذلك أن ازدياد طول السلسلة الكربونية يجعل الجزيئات أكثر تشابكاً فتمنع بعضها البعض من التحرك بحرية». وبسبب الانخفاض في التطاير تصبح المشتقات أقل قابلية للاشتعال كلما نزلنا نحو أسفل العمود.</li><li>الأشرطة تبيّن الاتجاه (نسب تقريبية) وليست قياسات.</li></ul>'});

/* 12 explain the properties (the "why" questions) */
ticketSlide({id:'why',ch:3,title:'علّل: خصائص المشتقات واستخداماتها',tag:'تذكرة',items:[
 {q:'لماذا يحترق الأسفلت بلهب دخاني كثيف؟',opts:[{t:'لأنه غير متطاير وصعب الاشتعال، فتخرج ذرات الكربون غير محترقة',ok:true,why:'هذا النوع من الهيدروكربونات لا يحترق بسهولة أو بشكل كامل'},{t:'لأنه يحتوي على أكسجين كثير',why:'الهيدروكربونات لا تحتوي أكسجيناً'},{t:'لأنه غاز',why:'الأسفلت صلب لزج'}]},
 {q:'لماذا تزداد لزوجة المشتقات بزيادة عدد ذرات الكربون؟',opts:[{t:'تزداد قوى التجاذب، وتصبح الجزيئات الطويلة أكثر تشابكاً وتمنع بعضها من الحركة بحرية',ok:true,why:'السلاسل الطويلة تتشابك فتقلّ حركتها'},{t:'لأن الجزيئات تصبح أخف',why:'تصبح أثقل لا أخف'},{t:'لأن درجة الغليان تنخفض',why:'درجة الغليان ترتفع'}]},
 {q:'لماذا الجازولين وقود مثالي للسيارات؟',opts:[{t:'يمكن تخزينه وصبّه بسهولة، ويشتعل بسرعة وسهولة',ok:true,why:'سائل يسيل بسهولة ويتبخّر ويشتعل بسرعة'},{t:'لأنه لزج جداً',why:'اللزج هو الأسفلت'},{t:'لأنه صلب',why:'الجازولين سائل'}]},
 {q:'لماذا يُستخدم الأسفلت في تعبيد الطرق؟',opts:[{t:'لأنه لزج جداً (يربط حبيبات الحصى والرمل) ويصعب اشتعاله',ok:true,why:'لزوجته العالية وصعوبة اشتعاله تناسب تعبيد الطرق'},{t:'لأنه يشتعل بسهولة',why:'الأسفلت يصعب اشتعاله'},{t:'لأنه غاز',why:'الأسفلت لزج'}]},
 {q:'لماذا تُمنع كل أنواع اللهب المكشوف في محطات الوقود؟',opts:[{t:'لأن الجازولين يكوّن بخاراً سريع الاحتراق مع أكسجين الهواء',ok:true,why:'قابلية الجازولين العالية للتطاير والاشتعال'},{t:'لأن الجازولين لا يشتعل',why:'يشتعل بسهولة'},{t:'لأن الأسفلت يتبخر',why:'الأسفلت غير متطاير'}]}
 ],
 note:'<ul><li>كتاب الطالب ص٩٣: «فالجازولين مثلاً سائل يمكن تخزينه أو صبّه بسهولة، ويمكن أيضاً إشعاله بسرعة وسهولة. لذلك يُعدّ مثالياً كوقود للسيارات. أما الأسفلت فهو لزج جداً ومن الصعب إشعاله، مما يجعله خياراً جيداً لتعبيد الطرق… الأسفلت غير متطاير ومن الصعب جداً أن يشتعل، لكنه عندما يحترق فإنه يشتعل مع تكوّن لهب دخاني كثيف جداً، لأن هذا النوع من الهيدروكربونات لا يحترق بسهولة أو بشكل كامل». شريحة «خصائص الوقود الأحفوري (تفسيرات علمية)» في عرض NotebookLM.</li></ul>'});

/* 13 the virtual distillation of crude oil (activity 4-2) */
slide({id:'lab',ch:3,title:'نشاط ٤-٢: تقطير تجزيئي للبترول',tag:'مختبر افتراضي',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">سخّن ببطء، وبدّل أنبوبة الجمع عند 100 و150 و200 °C:</div>
    <div class="panel" style="padding:4px 10px;align-items:center"><div id="ap"></div></div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn acc" id="ht">سخّن ▸ +25 °C</button><button type="button" class="btn" id="sw">بدّل أنبوبة الجمع ⇄</button><button type="button" class="btn" id="rs">من البداية</button></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div></div>
   <div class="col" style="width:430px;flex:none;gap:9px;justify-content:center">
    <div class="panel" style="padding:4px 14px;gap:2px"><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:21px;font-weight:800">ميزان الحرارة</span><b class="num lbl" id="tv" style="font-size:40px;color:var(--gold)">25 °C</b></div></div>
    <div class="panel hide" id="rt" style="padding:8px 12px;gap:2px"><div style="font-size:20px;font-weight:800">ما لاحظناه</div>
     <table class="obs" style="font-size:16px;border-spacing:0 3px"><thead><tr><th>الأنبوبة</th><th>المشتق</th><th>اللون</th><th>اللزوجة</th><th>الاشتعال</th></tr></thead><tbody>
      <tr><td style="font-size:18px">١</td><td>الجازولين<br><span class="sm" style="font-size:13px">حتى 100 °C</span></td><td>أصفر فاتح</td><td>منخفضة</td><td>سريع</td></tr>
      <tr><td style="font-size:18px">٢</td><td>النفثا<br><span class="sm" style="font-size:13px">100–150</span></td><td>أصفر</td><td>أعلى قليلاً</td><td>أبطأ</td></tr>
      <tr><td style="font-size:18px">٣</td><td>الكيروسين<br><span class="sm" style="font-size:13px">150–200</span></td><td>برتقالي</td><td>متوسطة</td><td>أصعب</td></tr>
      <tr><td style="font-size:18px">٤</td><td>زيت الديزل<br><span class="sm" style="font-size:13px">200–250</span></td><td>بني داكن</td><td>عالية</td><td>الأصعب</td></tr></tbody></table></div>
    <div class="panel" id="sf" style="padding:8px 14px;gap:2px"><div style="font-size:20px;font-weight:800;color:var(--gold)">السلامة</div><div style="font-size:16px;line-height:1.35">شاشة واقية ونظارة ومعطف. المشتقات قابلة للاشتعال: لا لهب قرب النواتج.</div></div>
    <div class="gbar hide" id="gb" style="font-size:19px">الأخف يُجمع أولاً؛ وتزداد القتامة واللزوجة ويقل الاشتعال.</div></div></div>`;},
 init:function(el){
  var NM=['الجازولين','النفثا','الكيروسين','زيت الديزل'], BND=[100,150,200,250], COL=['#f4e7a2','#ecc14f','#d98a2c','#6b3a14'], T=25, cur=0, lv=[0,0,0,0], flame=false, fb=$('.fb',el), fin=false;
  function idx(t){return t<=100?0:t<=150?1:t<=200?2:3}
  function ap(){
    var s='', tx=[60,150,240,330][cur]+280-10;
    var xs=[330,400,470,540];
    xs.forEach(function(x,i){ var h=lv[i]*22; s+=(i===0&&cur===0?'<rect x="'+(x-34)+'" y="190" width="68" height="102" rx="8" fill="rgba(110,190,255,.28)" stroke="#8fd0ff" stroke-width="2"/>':'')+'<g><path d="M'+(x-18)+' 200 V270 a18 18 0 0 0 36 0 V200" fill="none" stroke="'+(i===cur?'#E4BC4B':'#cfe')+'" stroke-width="'+(i===cur?4:3)+'" stroke-linecap="round"/><clipPath id="k'+i+'"><path d="M'+(x-16)+' 202 V270 a16 16 0 0 0 32 0 V202 Z"/></clipPath><rect x="'+(x-18)+'" y="'+(290-h)+'" width="36" height="'+h+'" fill="'+COL[i]+'" clip-path="url(#k'+i+')"/><text x="'+x+'" y="310" text-anchor="middle" font-size="15" font-weight="800" fill="#e8f" font-family="Cairo,sans-serif">'+(i+1)+'</text></g>' });
    var ax=xs[cur];
    s+='<path d="M170 95 H'+ax+' V196" fill="none" stroke="#cfe" stroke-width="4" stroke-linecap="round"/>';
    s+='<path d="M90 60 V232 a38 38 0 0 0 76 0 V60 Z" fill="rgba(30,18,8,.35)" stroke="#cfe" stroke-width="4" stroke-linejoin="round"/>';
    var fl=Math.round(70-(T-25)/225*34); s+='<clipPath id="bt"><path d="M92 62 V232 a36 36 0 0 0 72 0 V62 Z"/></clipPath><rect x="90" y="'+(236-fl+34)+'" width="76" height="'+(fl+40)+'" fill="#25140a" clip-path="url(#bt)"/>';
    s+='<ellipse cx="128" cy="268" rx="26" ry="11" fill="#c8b48a" opacity=".55"/>';
    s+='<rect x="124" y="14" width="8" height="'+(86)+'" rx="4" fill="#f4f4f0" stroke="#9fb4b8" stroke-width="2"/><rect x="126" y="'+(100-Math.max(2,(T-25)/225*84))+'" width="4" height="'+Math.max(2,(T-25)/225*84)+'" fill="#e04a3c"/><circle cx="128" cy="101" r="7" fill="#e04a3c"/><text x="144" y="30" font-size="17" font-weight="800" fill="#E4BC4B" font-family="Cairo,sans-serif" direction="ltr">'+T+' °C</text>';
    s+='<rect x="84" y="56" width="88" height="10" rx="4" fill="#8a6a3a"/>';
    if(flame) s+='<path d="M128 330 q-24 -22 -8 -44 q8 12 16 0 q14 20 -8 44z" fill="#ff9a2e" opacity=".95" transform="translate(0,-30)"/><path d="M128 320 q-10 -12 -2 -24 q6 8 10 0 q6 14 -8 24z" fill="#ffe08a" transform="translate(0,-30)"/>';
    s+='<rect x="108" y="298" width="40" height="8" rx="3" fill="#6d7b82"/>';
    s+='<text x="205" y="85" font-size="14" fill="#cfe" font-family="Cairo,sans-serif" direction="rtl">أنبوبة بذراع جانبي</text><text x="40" y="150" font-size="13" fill="#F3D27A" font-family="Cairo,sans-serif" direction="rtl" text-anchor="end">ألياف خزفية + النفط</text>';
    $('#ap',el).innerHTML='<svg viewBox="0 0 600 330" width="500" style="direction:ltr;overflow:visible" aria-hidden="true">'+s+'</svg>';
    $('#tv',el).textContent=T+' °C';
  }
  $('#ht',el).addEventListener('click',function(){
    if(fin) return; var nt=T+25; if(idx(nt)!==cur){ say(fb,'بلغنا '+T+' °C: بدّل أنبوبة الجمع أولاً (⇄) قبل متابعة التسخين','bad'); $('#sw',el).classList.add('shake'); later(function(){$('#sw',el).classList.remove('shake')},340); return }
    T=nt; flame=true; lv[cur]=Math.min(3,lv[cur]+1); ap(); say(fb,'يتكثف '+NM[cur]+' في الأنبوبة '+(cur+1)+': الحرارة '+T+' °C','ok');
    if(T>=250){ fin=true; flame=false; ap(); $('#rt',el).classList.remove('hide'); $('#rt',el).classList.add('up'); $('#sf',el).classList.add('hide'); unhide(el); say(fb,'جمعنا المشتقات الأربعة: الأخف أولاً ثم الأثقل','ok') }
  });
  $('#sw',el).addEventListener('click',function(){
    if(fin||cur>=3) return; if(T<BND[cur]){ say(fb,'لم نبلغ '+BND[cur]+' °C بعد: تابع التسخين','bad'); return }
    cur++; ap(); say(fb,'وُضعت الأنبوبة '+(cur+1)+': ستتجمع فيها المشتقات الأثقل','ok');
  });
  $('#rs',el).addEventListener('click',function(){ T=25; cur=0; lv=[0,0,0,0]; flame=false; fin=false; $('#rt',el).classList.add('hide'); $('#sf',el).classList.remove('hide'); ap(); say(fb,'','') });
  ap();
 },
 note:'<ul><li>نشاط ٤-٢ (كتاب الطالب ص٩٣–٩٤): يحاكي التقطير التجزيئي الصناعي للبترول (أو بديله). تُوضع الألياف الخزفية في قاع أنبوبة بذراع جانبي ويُضاف 6 mL من النفط، يوضع ميزان الحرارة (0–360 °C) بحيث يكون خزّانه على مستوى الذراع الجانبي أو أدنى منه، ويُسخَّن بلطف. عند 100 °C تُستبدل أنبوبة الجمع (ولا حاجة بعدها لكأس الماء البارد)، ثم تُجمع ثلاثة مشتقات أخرى: من درجة حرارة الغرفة إلى 100 °C (الجازولين)، من 100 إلى 150 (النفثا)، من 150 إلى 200 (الكيروسين)، من 200 إلى 250 (زيت الديزل/زيت الغاز) كما في إجابة دليل المعلم.</li><li>الملاحظات المتوقعة (دليل المعلم): يصبح لون المشتقات أكثر قتامة، وتزداد لزوجتها مع ارتفاع درجة الغليان، وتقلّ قابليتها للاشتعال، والرواسب السوداء الأكثر لزوجة وأقل قابلية للاشتعال وأعلى درجات غليان. بعض الرواسب تبقى في الأنبوبة.</li><li>السلامة: شاشة واقية بين الجهاز والطالب، نظارة واقية، معطف، لا لهب قرب النواتج. وصف «بديل البترول» (٥ g بارافين سائل، ٢ g زيت البارافين، ١ g روح بيضاء، ثم أثير البترول بمدى 40–60 و60–80 و80–100 و100–120 °C بـ 0.5 g لكل منها) من دليل المعلم.</li></ul>'});
