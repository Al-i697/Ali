/* ---------- lesson 1-1, part D: past exam questions (year and round only), exit ticket, homework ---------- */

/* small drawings for an option of a question: no letters, the signs are drawn as lines */
function plusP(x,y,r,c){ return '<line x1="'+(x-r*.5)+'" y1="'+y+'" x2="'+(x+r*.5)+'" y2="'+y+'" stroke="'+c+'" stroke-width="2.4" stroke-linecap="round"/><line x1="'+x+'" y1="'+(y-r*.5)+'" x2="'+x+'" y2="'+(y+r*.5)+'" stroke="'+c+'" stroke-width="2.4" stroke-linecap="round"/>' }
function minusP(x,y,r,c){ return '<line x1="'+(x-r*.5)+'" y1="'+y+'" x2="'+(x+r*.5)+'" y2="'+y+'" stroke="'+c+'" stroke-width="2.4" stroke-linecap="round"/>' }
function miniStruct(kind){
  var s='<svg viewBox="0 0 130 96" width="150" aria-hidden="true" style="direction:ltr;background:rgba(0,0,0,.22);border-radius:10px"><defs><radialGradient id="gMi" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff2c9"/><stop offset=".45" stop-color="#dcb467"/><stop offset="1" stop-color="#8f6a2a"/></radialGradient><radialGradient id="gMa" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#d9f1ff"/><stop offset=".5" stop-color="#6ca9e0"/><stop offset="1" stop-color="#2a5d95"/></radialGradient></defs>', i, j, x, y;
  for(i=0;i<2;i++)for(j=0;j<3;j++){
    x=30+j*35; y=30+i*38;
    if(kind==='ionic'){ var pos=(i+j)%2===0; s+='<circle cx="'+x+'" cy="'+y+'" r="15" fill="url(#'+(pos?'gMi':'gMa')+')" stroke="rgba(255,255,255,.5)"/>'+(pos?plusP(x,y,15,'#2a1d00'):minusP(x,y,15,'#fff')) }
    else if(kind==='atoms'){ s+='<circle cx="'+x+'" cy="'+y+'" r="14" fill="#aab4bd" stroke="rgba(255,255,255,.5)"/>' }
    else if(kind==='metal'){ s+='<circle cx="'+x+'" cy="'+y+'" r="13" fill="url(#gMi)" stroke="rgba(255,255,255,.5)"/>'+plusP(x,y,13,'#2a1d00') }
    else { s+='<circle cx="'+x+'" cy="'+y+'" r="13" fill="#aab4bd" stroke="rgba(255,255,255,.5)"/>' }
  }
  if(kind==='metal'){ [[47,48],[82,48],[12,48],[47,12],[82,84],[65,30],[30,66],[100,66],[104,30]].forEach(function(p){ s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4.2" fill="#7fd4ff" stroke="rgba(0,0,0,.4)"/>' }) }
  if(kind==='cov'){ [[47,30],[82,30],[47,68],[82,68]].forEach(function(p){ s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.6" fill="#7fd4ff" stroke="rgba(0,0,0,.4)"/><circle cx="'+(p[0]+7)+'" cy="'+p[1]+'" r="3.6" fill="#7fd4ff" stroke="rgba(0,0,0,.4)"/>' }) }
  return s+'</svg>';
}

/* 21 exams 2025/2026 */
(function(){
  var items=[
   {q:'<b>امتحان ٢٠٢٥/٢٠٢٦، الدور الأول، س١:</b> أي مما يلي يفسّر كثافة الحديد (Fe) المرتفعة حسب التركيب البنائي؟',opts:[{t:'مرونة التركيب الطبقي',why:'المرونة تفسّر الطرق والسحب لا الكثافة'},{t:'حرية حركة الإلكترونات غير المتمركزة',why:'هذه تفسّر التوصيل'},{t:'الترابط القوي بين الأيونات والإلكترونات',why:'هذا يفسّر الانصهار والمتانة'},{t:'تقارب وتراص الذرات',ok:true,why:'الذرات المتراصة تعني كتلة كبيرة في حجم صغير'}]},
   {q:'<b>٢٠٢٥/٢٠٢٦، الدور الثاني، س١:</b> ما الخاصية التي يتميز بها فلز الألومنيوم (Al)؟',opts:[{t:'لين وهش',why:'الفلزات لا تتحطم بالطرق'},{t:'موصل ردئ للتيار الكهربائي',why:'الألومنيوم موصل جيد'},{t:'درجة انصهاره منخفضة',why:'ينصهر عند نحو 660 °C'},{t:'مرن',ok:true,why:'يُطرق ويُسحب (يُصنع منه الرقائق والأسلاك)'}]},
   {q:'<b>٢٠٢٥/٢٠٢٦، الدور الثاني، س٣:</b> أي البدائل الآتية تشير إلى قوة الجذب الكهروستاتيكية التي تربط بين ذرات فلز النحاس (Cu)؟',opts:[{t:'الرابطة الأيونية',why:'الأيونية بين أيونات موجبة وسالبة'},{t:'الرابطة التساهمية',why:'التساهمية بمشاركة الإلكترونات بين ذرتين'},{t:'الرابطة الفلزية',ok:true,why:'تجاذب بين الأيونات الموجبة وبحر الإلكترونات'},{t:'الرابطة الهيدروجينية',why:'الهيدروجينية بين جزيئات'}]}
  ];
  slide({id:'ex1',ch:5,title:'أسئلة امتحانات ٢٠٢٥/٢٠٢٦',tag:'امتحانات سابقة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'ex1')},
   note:'<ul><li>من مجموعة أسئلة الوحدة الأولى: امتحان ٢٠٢٥/٢٠٢٦ (الدور الأول س١، الدور الثاني س١ وس٣). الإجابات النموذجية: تقارب وتراص الذرات؛ مرن؛ الرابطة الفلزية. الأسئلة منسوخة بنصها، وأضفت تعليل كل خيار.</li><li>ملاحظة: خيارا «لين وهش» و«مرن» في س١ الدور الثاني يعكسان تصحيح الخطأ الشائع بأن الفلزات تتحطم.</li></ul>'});
})();

/* 22 exams 2024/2025 */
(function(){
  var items=[
   {q:'<b>امتحان ٢٠٢٤/٢٠٢٥، الدور الأول، س٤ (أ):</b> ما التعريف الصحيح للرابطة الفلزية؟',opts:[{t:'قوى تجاذب بين الأيونات الموجبة والإلكترونات الحرة في البنية الشبكية للفلز',ok:true,why:'هذا نص الهدف ٤-٢'},{t:'قوى تجاذب بين أيونين مختلفين في الشحنة',why:'هذه الرابطة الأيونية'},{t:'مشاركة إلكترونات بين ذرتين لافلزيتين',why:'هذه الرابطة التساهمية'}]},
   {q:'<b>س٤ (ب):</b> في الشكل (٤-١) يمثّل X الإلكترونات (الدوائر الصغيرة السالبة) وY الأيونات الموجبة (الدوائر الكبيرة). ما العبارة التي تجعل الفلز موصلاً جيداً للكهرباء؟',opts:[{t:'X يرتبط بـ Y برابطة فلزية',why:'هذه الرابطة تمسك الشبكة، لكنها لا تفسّر التوصيل'},{t:'حرية حركة المادة X في بنية الفلز',ok:true,why:'الإلكترونات X الحرة هي التي تنقل الشحنة'},{t:'حرية حركة المادة Y في بنية الفلز',why:'الأيونات Y ثابتة في الشبكة'},{t:'انزلاق المادة X وحرية حركة Y',why:'الانزلاق يفسّر المرونة لا التوصيل'}]},
   {q:'<b>٢٠٢٤/٢٠٢٥، الدور الثاني، س١:</b> ما البديل الصحيح الذي يصف الخواص الفيزيائية للفلزات؟',opts:[{t:'الكثافة: منخفضة، الانصهار: منخفضة، التوصيل: جيدة',why:'كثافة الفلزات وانصهارها مرتفعان'},{t:'الكثافة: مرتفعة، الانصهار: منخفضة، التوصيل: رديئة',why:'التوصيل جيد'},{t:'الكثافة: مرتفعة، الانصهار: مرتفعة، التوصيل: جيدة',ok:true,why:'خواص الفلزات الثلاث'},{t:'الكثافة: منخفضة، الانصهار: مرتفعة، التوصيل: رديئة',why:'كثافة الفلزات مرتفعة وتوصيلها جيد'}]}
  ];
  slide({id:'ex2',ch:5,title:'أسئلة امتحانات ٢٠٢٤/٢٠٢٥',tag:'امتحانات سابقة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'ex2')},
   note:'<ul><li>امتحان ٢٠٢٤/٢٠٢٥: الدور الأول س٤ (الشكل ٤-١: تركيب الفلز، أ: عرّف الرابطة الفلزية، ب: ما العبارة الصحيحة التي تجعل الفلز موصلاً جيداً)، والدور الثاني س١ (جدول الكثافة والانصهار والتوصيل: مرتفعة، مرتفعة، جيدة).</li><li>الإجابة النموذجية لس٤ (ب) من صفحة الامتحان: «حرية حركة المادة X في بنية الفلز». في الشكل X سهم إلى إلكترون (دائرة صغيرة سالبة) وY سهم إلى أيون موجب (دائرة كبيرة). ملاحظة تصحيح: النسخة الأولى من هذه الشريحة كانت تعكس X وY (افترضتُ الجواب لأن الإجابة لم تظهر في القراءة الأولى)، وصُحّحت بعد قراءة الإجابة النموذجية.</li></ul>'});
})();

/* 23 exams: draw the lattice (2024/2025 R2 q8, 2023/2024 R1 q8) */
slide({id:'ex3',ch:5,title:'امتحان: ارسم البنية الشبكية وفسّر',tag:'٢٠٢٤/٢٠٢٥ و٢٠٢٣/٢٠٢٤',
 html:function(){
  var base=latSVG({w:330,rows:3,cols:5,gap:50,r:17,el:8,seed:4});
  var mk=function(x,y,t){return '<circle cx="'+x+'" cy="'+y+'" r="15" fill="#E4BC4B" stroke="#fff" stroke-width="2"/><text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" font-size="18" font-weight="800" fill="#241800" font-family="Cairo,sans-serif">'+t+'</text>'};
  var extra='<line x1="250" y1="50" x2="305" y2="50" stroke="#E4BC4B" stroke-width="3"/>'+mk(318,50,'أ')+'<circle cx="225" cy="125" r="8" fill="#7fd4ff" stroke="#E4BC4B" stroke-width="3"/><line x1="233" y1="125" x2="305" y2="125" stroke="#E4BC4B" stroke-width="3"/>'+mk(318,125,'ب')+'<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#E4BC4B"/></marker></defs><path d="M60 14 H150" stroke="#E4BC4B" stroke-width="4" marker-end="url(#ah)"/>'+mk(36,14,'ج');
  var svg=base.replace('</svg>',extra+'</svg>').replace('viewBox="0 0 300 200"','viewBox="0 0 345 200"').replace('width="330"','width="360"');
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="width:380px;flex:none;gap:8px;align-items:center;justify-content:center">
    <div class="panel" style="padding:10px 14px;align-items:center;gap:6px"><div style="font-size:20px;font-weight:800;color:var(--gold)">البنية الشبكية لفلز</div>${svg}</div>
    <div class="exq sm" style="font-size:19px;line-height:1.45">«فسّر قابلية النحاس للطرق، مع رسم مخطط البنية الشبكية وكتابة البيانات (الأيونات الموجبة والإلكترونات).» (٤ درجات)</div></div>
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">اسحب كل اسم إلى الحرف المناسب في الرسم:</div>
    ${[['a','أ'],['b','ب'],['c','ج']].map(function(r){return '<div style="display:grid;grid-template-columns:54px 1fr;gap:10px;align-items:center"><div class="rn">'+r[1]+'</div><div class="mslot" data-k="'+r[0]+'" style="min-height:58px"><span class="ph">ضع الاسم هنا</span></div></div>'}).join('')}
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px"></div><div class="fb" style="min-height:24px;text-align:center"></div>
    <div class="gbar hide" id="gb" style="font-size:19px;line-height:1.4"><b>الإجابة النموذجية:</b> تتحرك طبقات الأيونات الموجبة المتماثلة بعضها فوق بعض دون أن يتفكك التركيب البنائي، ولا يتفكك النحاس بسهولة بسبب قوة الرابطة الفلزية.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['a','أيون موجب'],['b','إلكترون حر (سالب)'],['c','اتجاه القوة (الطرق)']],{css:'font-size:20px;padding:8px 14px',more:'صح! كمّل',done:'ممتاز: أكملت بيانات الرسم',bad:'تأمّل الرسم: أي عنصر يشير إليه الحرف؟'});
 },
 note:'<ul><li>امتحان ٢٠٢٤/٢٠٢٥ الدور الثاني س٨ (٤ درجات): «يعتبر النحاس من الفلزات المرنة القابلة للطرق. فسّر ذلك مضمناً إجابتك رسم مخطط البنية الشبكية مع كتابة البيانات (الأيونات الموجبة والإلكترونات)». نموذج الإجابة: «بسبب تحرك طبقات الأيونات المتماثلة الموجودة في النحاس بعضها فوق بعض دون أن يتفكك تركيبه البنائي، ولا يتفكك النحاس بسهولة بسبب قوة الرابطة الفلزية» مع رسم يبيّن أيوناً موجباً وإلكتروناً سالباً وطرفاً شديداً (قوة).</li><li>امتحان ٢٠٢٣/٢٠٢٤ الدور الأول س٨ (٥ درجات): مفهوم الرابطة الفلزية (قوة كهروستاتيكية قوية بين الأيونات الموجبة وبحر الإلكترونات المتحركة المحيط بها، تؤمّن تماسك الشبكة)، ومخطط البنية الشبكية مع البيانات، وتفسير قابلية الفلزات للتوصيل الكهربائي.</li><li>اطلب من الطلاب رسم المخطط على السبورة قبل أن يبدأ النشاط.</li></ul>'});

/* 24 exams 2022/2023 */
(function(){
  var items=[
   {q:'<b>امتحان ٢٠٢٢/٢٠٢٣، الدور الأول (الصباحي)، س٤:</b> أي الأشكال الآتية يوضح التركيب البنائي لفلز الصوديوم؟',opts:[{t:miniStruct('ionic'),why:'هذا مركب أيوني: أيونات موجبة وسالبة متناوبة'},{t:miniStruct('atoms'),why:'ذرات متعادلة: ليس هذا تركيب الفلز'},{t:miniStruct('metal'),ok:true,why:'أيونات موجبة منتظمة وإلكترونات حرة بينها'},{t:miniStruct('cov'),why:'إلكترونات موضعية بين ذرتين: هذه رابطة تساهمية'}]},
   {q:'<b>٢٠٢٢/٢٠٢٣، الدور المسائي، س٢ (ب):</b> أي مما يأتي يفسّر قدرة فلز النحاس على التوصيل الكهربائي حسب التركيب البنائي؟',opts:[{t:'الترابط القوي بين ذرات الفلز',why:'هذا يفسّر الانصهار والمتانة'},{t:'تقارب وتراص الذرات',why:'هذا يفسّر الكثافة'},{t:'حركة طبقات الأيونات المتماثلة',why:'هذه تفسّر المرونة'},{t:'حرية حركة الإلكترونات غير المتمركزة',ok:true,why:'تنقل الشحنة عبر الفلز'}]}
  ];
  slide({id:'ex4',ch:5,title:'أسئلة امتحانات ٢٠٢٢/٢٠٢٣',tag:'امتحانات سابقة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'ex4')},
   note:'<ul><li>امتحان ٢٠٢٢/٢٠٢٣: الدور الأول (الصباحي) س٤ (أي الأشكال يوضح التركيب البنائي لفلز الصوديوم؟)، والدور المسائي س٢ (النحاس: ترتبط ذراته بقوى كهروستاتيكية بين الأيونات الموجبة والإلكترونات السالبة في شكل منتظم يسمى الشبكة؛ أ: ارسم المخطط، ب: أي مما يأتي يفسّر قدرة النحاس على التوصيل الكهربائي).</li><li>الرسوم الأربعة مرسومة لهذا العرض وليست نسخة من أشكال الامتحان.</li></ul>'});
})();

/* 25 exit ticket */
(function(){
  var items=[
   {type:'num',q:'كم إلكتروناً تفقد ذرة الصوديوم لتصبح أيون <span class="num">Na<sup>+</sup></span>؟',unit:'إلكترون',ans:1,tol:.01,why:'إلكتروناً واحداً: الذي في مستواها الخارجي',hint:'الشحنة +١ تعني فقد إلكترون واحد'},
   {q:'ما الجسيمات التي تتحرك بحرية في الفلز وتنقل الشحنة؟',opts:[{t:'الإلكترونات الحرة',ok:true,why:'بحر الإلكترونات غير المتمركزة'},{t:'الأيونات الموجبة',why:'ثابتة في الشبكة'},{t:'النيوترونات',why:'متعادلة ولا علاقة لها بالتوصيل'}]},
   {q:'لماذا يمكن طرق الفلزات وسحبها دون أن تتحطم؟',opts:[{t:'تنزلق طبقات الأيونات فوق بعضها وتبقى الرابطة الفلزية',ok:true,why:'الإلكترونات الحرة تحفظ الترابط أثناء الانزلاق'},{t:'لأن أيوناتها تتنافر',why:'هذا يحدث في البلّورات الأيونية فتتحطم'},{t:'لأنها مكوّنة من جزيئات صغيرة',why:'الفلز شبكة من الأيونات لا جزيئات'}]},
   {q:'لماذا درجتا انصهار وغليان معظم الفلزات مرتفعتان؟',opts:[{t:'الرابطة الفلزية قوية وتحتاج طاقة كبيرة لكسرها',ok:true,why:'ولذلك هي صلبة في درجة حرارة الغرفة في الغالب'},{t:'لأن الإلكترونات ثقيلة',why:'الإلكترونات خفيفة جداً'},{t:'لأن الأيونات متباعدة',why:'الأيونات متراصة'}]}
  ];
  slide({id:'tk',ch:5,title:'تذكرة الخروج',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk')},
   note:'<ul><li>الإجابات: ١، الإلكترونات الحرة، تنزلق طبقات الأيونات فوق بعضها وتبقى الرابطة الفلزية، الرابطة الفلزية قوية وتحتاج طاقة كبيرة لكسرها.</li><li>الأسئلة من صياغتي، وتغطي الهدفين ٤-١ و٤-٢.</li></ul>'});
})();

/* 26 summary and homework (teacher's guide: questions 1-1 and 1-2, end-of-unit question 1) */
slide({id:'hw',ch:5,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: السؤالان ١-١ و١-٢ (ص١٧)','كتاب الطالب: أسئلة نهاية الوحدة، السؤال ١'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:26px;line-height:1.6"><li>الفلز: <b>أيونات موجبة</b> منتظمة في <b>بحر من الإلكترونات الحرة</b>.</li><li><b>الرابطة الفلزية</b>: قوى تجاذب كهروستاتيكية بين الأيونات الموجبة والإلكترونات الحرة في الشبكة.</li><li>لذلك الفلزات <b>صلبة</b> ذات درجتَي <b>انصهار وغليان</b> مرتفعتين، لأن الرابطة قوية.</li><li>وهي <b>مرنة</b> (تُطرق وتُسحب) لأن الطبقات تنزلق دون كسر الرابطة.</li><li>وهي <b>موصلة</b> جيدة للكهرباء والحرارة بسبب الإلكترونات الحرة.</li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:19px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:20px;line-height:1.35">١-٢ العناصر الانتقالية</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب من دليل المعلم للموضوع ١-١: السؤالان ١-١ و١-٢ في كتاب الطالب، وسؤال نهاية الوحدة ١. ليس لهذا الموضوع مصدر في كتاب النشاط. اضغط على البند لتظليله.</li></ul>'});
