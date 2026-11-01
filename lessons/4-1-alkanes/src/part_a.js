/* ---------- alkanes, part A: cover, what organic chemistry is, carbon, the kinds of carbon bonding, review questions 4-1 to 4-4 ---------- */

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يصف الكيمياء العضوية والخصائص الفريدة لذرة الكربون.',
   'يميّز الهيدروكربونات المشبعة من غير المشبعة، ويعرّف الألكانات.',
   'يسمّي الألكانات الأربعة الأولى ويرسم صيغها الجزيئية والبنائية.',
   'يصف السلسلة المتجانسة للألكانات وصيغتها العامة CₙH₂ₙ₊₂.',
   'يفسّر ارتفاع درجة الغليان وتغيّر الحالة الفيزيائية بزيادة عدد ذرات الكربون.',
   'يفسّر قلة نشاط الألكانات كيميائياً، ويكتب معادلات احتراقها الكامل.',
   'يذكر الميثان مكوّناً رئيسياً للغاز الطبيعي، واستخدامات البروبان والبيوتان.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:22px 30px 20px;justify-content:center;gap:9px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">الموضوع ٤-١</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:60px;font-weight:800;line-height:1.1">ال<span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">ألكانات</span></h1>
    <p style="margin:0 0 2px;font-size:26px;font-weight:700;color:var(--muted)">مدخل إلى الكيمياء العضوية</p>
    <p style="font-size:23px;font-weight:700;line-height:1.35;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:14px 10px;align-items:center;gap:8px">${alkSVG(3,{w:290})}<div class="sm" style="font-size:19px;text-align:center">البروبان: ٣ ذرات كربون و٨ ذرات هيدروجين</div></div>
    <div class="bigeq" style="font-size:44px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5)">C<sub>n</sub>H<sub>2n+2</sub></div>
    <div class="sm" style="font-size:22px;text-align:center">قانون واحد يجمع الألكانات كلها</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من دليل المعلم للموضوع ٤-١ (٢-١، ٢-٢، ٢-٣، ٢-٤، ٣-١، ٣-٢، ٣-٣، ٣-٤)، مكتوبة بلغة الطالب. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>الدرس يغطي كتاب الطالب ص٨٠–٨٦ وأسئلة ٤-١ إلى ٤-١٠، وسؤالي نهاية الوحدة ١ و٢، وكتاب النشاط: تمرين ٤-١ وورقتا العمل ٤-١ و٤-٢.</li><li>تنبيه من دليل المعلم: هذا الموضوع تمهيدي، فاعرضه بمستوى يفهمه كل الطلاب. الصعوبة المتوقعة: عدّ الروابط والذرات عند رسم الصيغ البنائية، وتذكّر الأسماء، ونسيان الأكسجين في معادلات الاحتراق.</li></ul>'});

/* 2 what is organic chemistry */
slide({id:'what',ch:0,title:'ما هي الكيمياء العضوية؟',tag:'اكتشف',
 html:function(){
  var items=[['ذرة الكربون C','العدد الذري 6: ٦ بروتونات و٦ إلكترونات. هو العنصر الذي تدور حوله الكيمياء العضوية.'],
   ['مركبات عضوية في الكائنات الحية','الكربوهيدرات (مثل السكريات)، الدهون والأحماض الدهنية، البروتينات والأحماض الأمينية، والحمض النووي DNA.'],
   ['مجالات استخدام المركبات العضوية','وقود للحرارة والطاقة، صناعة البلاستيك، وصناعة الأدوية والأصباغ ومواد كيميائية أخرى.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:430px;flex:none;gap:14px;justify-content:center">
    <div class="frm brk" style="padding:16px 22px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">الكيمياء العضوية</div>
     <p style="margin:0;font-size:26px;font-weight:800;line-height:1.4">الفرع من الكيمياء الذي يدرس <span style="color:var(--gold)">بنية وخصائص وتفاعلات</span> المركّبات التي تحتوي على عنصر <span style="color:var(--gold)">الكربون</span>.</p></div>
    <div class="panel compact" style="padding:10px 16px"><div style="font-size:21px;font-weight:800;margin-bottom:2px">فكّر: لماذا يُلقَّب الكربون «ملك العناصر»؟</div>
     ${optsHTML([{t:'لأن مركباته أكثر بكثير من مركبات أي عنصر آخر'},{t:'لأنه أثقل عنصر في الجدول الدوري'},{t:'لأنه فلز يوصل الكهرباء'}])}<div class="fb" style="min-height:24px"></div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة لتظهر:</div>
    ${cardsHTML(items)}
    <div class="gbar hide" id="gb" style="font-size:22px">كل هذا يجمعه عنصر واحد: الكربون. فما الذي يميّز ذرته؟</div></div></div>`;},
 init:function(el){
  var cards=false,mc=false; function chk(){ if(cards&&mc) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('.panel',el),[{t:'',ok:true,why:'صح: الكربون يكوّن عدداً هائلاً من المركبات، ولذلك له فرع كامل هو الكيمياء العضوية'},{t:'',why:'الأثقل ليس هو الكربون (Cu وAu وPb أثقل منه بكثير)'},{t:'',why:'الكربون لا فلز في المجموعة IV، والجرافيت وحده يوصل الكهرباء'}],$('.fb',el),function(){mc=true; chk()});
 },
 enter:function(el){},
 note:'<ul><li>التعريف من كتاب الطالب ص٨٠ وعرض NotebookLM شريحة ٣. الصورة في العروض (الكربون في الجدول الدوري وعليه تاج): اسأل الطلاب «ما تعليقكم على الصورة؟» ليصلوا إلى أن الكربون يكوّن مركبات أكثر من أي عنصر.</li><li>الأمثلة والاستخدامات من جدول ٤-١ ومن شريحتي «أمثلة على مركبات عضوية» و«مجالات الاستخدام» في عرضك القديم.</li></ul>'});

/* 3 carbon: four bonds */
slide({id:'carbon',ch:0,title:'الخصائص الفريدة للكربون',tag:'ابنِ الميثان',
 html:function(){
  var arms=[[180,52],[180,248],[76,150],[284,150]];
  var svg='<svg viewBox="0 0 360 300" width="330" style="direction:ltr;overflow:visible" aria-hidden="true">'+
   arms.map(function(a,i){return '<g class="arm" data-i="'+i+'" style="cursor:pointer"><g class="hh">'+bnd(180,150,a[0],a[1],6)+atm(a[0],a[1],24,'H')+'</g><circle class="dot" cx="'+a[0]+'" cy="'+a[1]+'" r="24" fill="rgba(228,188,75,.10)" stroke="var(--gold)" stroke-width="3" stroke-dasharray="7 6"/><text class="dt" x="'+a[0]+'" y="'+(a[1]+8)+'" text-anchor="middle" font-size="22" font-weight="800" fill="var(--gold)">+H</text></g>'}).join('')+
   atm(180,150,40,'C')+'</svg>';
  var facts=[['لا فلز','عنصر غير فلزي'],['المجموعة IV','في الجدول الدوري'],['٤ روابط تساهمية','لأن إلكتروناته الأربعة متكافئة'],['أشكال مختلفة','الألماس والجرافيت']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">اضغط على الأماكن المتقطعة لتربط ذرات هيدروجين بالكربون:</div>
    <div class="panel" style="padding:8px 18px;align-items:center">${svg}</div>
    <div style="display:flex;align-items:center;gap:14px"><span style="font-size:24px;font-weight:800">عدد الروابط:</span><b class="num" id="cnt" style="font-size:40px;color:var(--gold)">0</b><span class="num" style="font-size:30px;font-weight:800">/ 4</span></div>
    <div class="gbar hide" id="gb" style="font-size:22px">ذرة الكربون تكوّن <b>٤ روابط تساهمية</b>. هنا ارتبطت بأربع ذرات هيدروجين فتكوّن الميثان <b class="num">CH<sub>4</sub></b>.</div></div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    ${facts.map(function(f){return '<div class="panel" style="padding:8px 16px;flex-direction:row;align-items:center;gap:14px"><span class="rn">✓</span><div><div style="font-size:25px;font-weight:800">'+f[0]+'</div><div class="sm" style="font-size:19px">'+f[1]+'</div></div></div>'}).join('')}</div></div>`;},
 init:function(el){
  var n=0;
  $$('.arm',el).forEach(function(g){g.addEventListener('click',function(){
    if(g.classList.contains('on')) return; g.classList.add('on'); n++; $('#cnt',el).textContent=n; if(n===4) unhide(el);
  })});
 },
 note:'<ul><li>الخصائص من عرض NotebookLM شريحة ٤ وعرضك القديم شريحة ٥: لا فلز، المجموعة الرابعة (IV)، يستطيع تكوين ٤ روابط تساهمية، ويوجد بأشكال مختلفة كالألماس والجرافيت (انظر الخلفية الثلاثية الأبعاد).</li><li>اترك الطلاب يضغطون على الأماكن الأربعة بأنفسهم، ثم اسأل: كم رابطاً تكوّنه ذرة الكربون؟ (سؤال ٤-٢ في الشريحة التالية).</li></ul>'});

/* 4 kinds of carbon bonding (book table 4-1) */
slide({id:'bonds',ch:0,title:'أنواع الترابط لدى الكربون',tag:'طابق',
 html:function(){
  function C(x,y,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+(r||9)+'" fill="#3A3F45" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>'}
  function L(x1,y1,x2,y2,w){return bnd(x1,y1,x2,y2,w||3.5)}
  var P={
   a:L(15,55,45,25)+L(45,25,75,55)+L(75,55,105,25)+L(105,25,135,55)+L(135,55,165,25)+C(15,55)+C(45,25)+C(75,55)+C(105,25)+C(135,55)+C(165,25),
   b:L(20,40,60,40)+L(60,40,100,40)+L(100,40,128,40)+C(20,40)+C(60,40)+C(100,40)+atm(136,40,15,'O')+'<circle cx="162" cy="40" r="9" fill="#EEF4F4"/>'+L(150,40,155,40),
   c:L(60,36,110,36,3.5)+L(60,44,110,44,3.5)+C(60,40,11)+C(110,40,11)+'<circle cx="34" cy="16" r="7" fill="#EEF4F4"/><circle cx="34" cy="64" r="7" fill="#EEF4F4"/><circle cx="136" cy="16" r="7" fill="#EEF4F4"/><circle cx="136" cy="64" r="7" fill="#EEF4F4"/>',
   d:[0,1,2,3,4,5].map(function(i){var a=i*Math.PI/3,b=(i+1)*Math.PI/3;return L(85+28*Math.cos(a),40+28*Math.sin(a),85+28*Math.cos(b),40+28*Math.sin(b))}).join('')+[0,1,2,3,4,5].map(function(i){var a=i*Math.PI/3;return C(85+28*Math.cos(a),40+28*Math.sin(a),8)}).join(''),
   e:L(15,40,155,40)+L(40,40,40,10)+L(70,40,70,70)+L(100,40,100,10)+L(130,40,130,70)+[15,40,70,100,130,155].map(function(x){return C(x,40,7)}).join('')+[[40,10],[70,70],[100,10],[130,70]].map(function(p){return C(p[0],p[1],7)}).join('')
  };
  var rows=[['a','سلاسل طويلة'],['b','ذرات أخرى محل H'],['c','روابط ثنائية'],['d','حلقات'],['e','جزيئات ضخمة']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    ${rows.map(function(r){return '<div style="display:grid;grid-template-columns:200px 1fr;gap:12px;align-items:center"><svg viewBox="0 0 175 80" width="200" aria-hidden="true" style="direction:ltr;background:rgba(var(--d2),.5);border-radius:14px">'+P[r[0]]+'</svg><div class="mslot" data-k="'+r[0]+'" style="min-height:66px"><span class="ph">ضع الوصف هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:380px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب الوصف إلى الرسم المناسب (أو اضغط ثم اضغط المكان):</div>
    <div id="tray" class="tray" style="display:flex;flex-direction:column;gap:8px"></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الكربون يكوّن سلاسل وحلقات وروابط متعددة، ولذلك مركباته لا تُحصى.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['a','أ. ترتبط ذراته في سلاسل طويلة'],['b','ب. تحلّ ذرات أخرى محل H فتتكوّن عائلات جديدة'],['c','ج. قد تتكوّن روابط ثنائية'],['d','د. ترتبط الذرات في حلقة'],['e','هـ. جزيئات متعددة السلاسل وضخمة']],{css:'font-size:20px;padding:10px 14px',more:'صح! كمّل',done:'ممتاز: عرفت أنواع الترابط الخمسة',bad:'ليس هذا الرسم، تأمّل الشكل مرة ثانية'});
 },
 note:'<ul><li>الجدول ٤-١ في كتاب الطالب (ص٨١): (أ) سلاسل طويلة، (ب) ذرات أخرى (O، Cl، Br…) تحل محل H فتتكوّن عائلات أخرى من المركبات العضوية، (ج) روابط ثنائية في الجزيئات البسيطة والسلاسل الطويلة، (د) حلقات، (هـ) جزيئات ضخمة مثل الدهون.</li><li>الرسوم هنا مبسّطة وليست نماذج دقيقة للجزيئات.</li></ul>'});

/* 5 review questions 4-1 to 4-4 */
(function(){
  var items=[
   {q:'<b>٤-١</b> ما نوع الرابطة التي تشارك بها ذرات الكربون عادة؟',opts:[{t:'رابطة أيونية',why:'الكربون لا يفقد إلكتروناته ولا يكتسبها عادة'},{t:'رابطة تساهمية',ok:true,why:'ذرات الكربون تتشارك الإلكترونات مع غيرها'},{t:'رابطة فلزية',why:'الرابطة الفلزية بين ذرات الفلزات'}]},
   {type:'num',q:'<b>٤-٢</b> ما العدد الأقصى للروابط التساهمية التي يمكن أن تكوّنها ذرة كربون واحدة؟',unit:'روابط',ans:4,tol:.01,why:'أربع روابط تساهمية',hint:'عدّ الأماكن التي ربطت فيها الهيدروجين في الشريحة السابقة'},
   {q:'<b>٤-٣</b> سمِّ شكلين لصيغ بنائية تحتوي على الكربون:',opts:[{t:'الألماس والجرافيت',ok:true,why:'ألماس وجرافيت: شكلان من الكربون النقي'},{t:'الأكسجين والأوزون',why:'هذان شكلان من الأكسجين'},{t:'الماء والجليد',why:'هذان شكلان للماء'}]},
   {q:'<b>٤-٤</b> سمِّ جزيئين مختلفين يحتويان على الكربون ولهما أهمية كبيرة للكائنات الحية:',opts:[{t:'ملح الطعام والماء',why:'ملح الطعام (NaCl) لا يحتوي على كربون'},{t:'البروتينات والكربوهيدرات',ok:true,why:'البروتينات والكربوهيدرات والدهون والأحماض النووية'},{t:'الأكسجين والنيتروجين',why:'هذان عنصران في الهواء، ولا يحتويان على كربون'}]}
  ];
  slide({id:'q1to4',ch:0,title:'أسئلة ٤-١ إلى ٤-٤',tag:'تذكرة المدخل',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'q1to4')},
   note:'<ul><li>أسئلة كتاب الطالب ص٨٢ (٤-١ إلى ٤-٤)، وإجاباتها: رابطة تساهمية، أربع روابط تساهمية، الألماس والجرافيت، البروتينات والكربوهيدرات والدهون والأحماض النووية.</li><li>الإجابات المرجعية من عرض NotebookLM شريحة ٧.</li></ul>'});
})();
