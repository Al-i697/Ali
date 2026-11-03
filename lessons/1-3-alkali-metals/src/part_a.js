/* ---------- lesson 1-3, part A: goals, the opening, the group and its common properties ---------- */

/* 1 goals (teacher's guide p.21: goals 6-1 and 6-2, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٦-١','يصف الليثيوم والصوديوم والبوتاسيوم من المجموعة الأولى باعتبارها مجموعة من الفلزّات الليّنة نسبيًّا التي تُظهر تدرُّجًا نمطيًّا في درجات الانصهار والكثافة والتفاعُل مع الماء.'],['٦-٢','يتنبّأ بخواصّ العناصر الأخرى في المجموعة الأولى وذلك في ضوء البيانات المُعطاة.']];
  var C=['أحدّد موقع الفلزات القلوية وأذكر خصائصها المشتركة.','أصف تدرّج الانصهار والكثافة والصلادة نزولاً في المجموعة.','أصف تفاعلها مع الماء وأكتب معادلته الموزونة.','أتنبأ بخواص عنصر آخر من المجموعة من البيانات.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:20px 28px 18px;justify-content:center;gap:8px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الموضوع ١-٣ · حصتان</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:56px;font-weight:800;line-height:1.1">الفلزات <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">القلوية</span></h1>
    <p style="font-size:22px;font-weight:700;line-height:1.3;margin:4px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على أن:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:8px">${G.map(function(g){return '<button type="button" class="gi"><span class="ck">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:20px;font-weight:800;color:var(--cyan);margin:4px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr;gap:6px 18px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:19px;line-height:1.4"><span class="ck" style="width:28px;height:28px;font-size:18px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:14px 12px;align-items:center;gap:8px;width:100%"><div class="ptw sh-g mini" style="width:100%">${ptCellsHTML()}</div><div class="sm" style="font-size:19px;text-align:center">العمود الأزرق: المجموعة I (الفلزات القلوية)</div></div>
    <div class="sm" style="font-size:22px;text-align:center;font-weight:700">ما الذي يجمعها؟ وكيف تتدرّج خصائصها؟</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الهدفان ٦-١ و٦-٢ منقولان بنصهما من دليل المعلم (ص٢١). الدرس حصتان، وموارده في الدليل: نشاط ١-١ (تفاعل بعض الفلزات القلوية مع الماء)، وأسئلة الكتاب ١-٧ إلى ١-١٣، وسؤال ٣ من نهاية الوحدة، وتمرين ١-١ (المجموعة I) وورقة العمل ١-٢ في كتاب النشاط.</li><li>معايير النجاح الأربعة صياغتي من نص الهدفين (والمهارات المكتوبة في الدليل للنشاط ١-١ مذكورة في شريحة النشاط). عدّلها كما تشاء.</li><li>اضغط على الهدف أو المعيار لتظليله وأنت تراجع في نهاية الدرس.</li></ul>'});

/* 2 prior learning: the transition elements of lesson 1-2 */
slide({id:'prior',ch:0,title:'التقويم القبلي',tag:'ماذا تذكّر؟',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;align-items:center;justify-content:center">
    <div class="panel" style="padding:14px 14px;align-items:center;gap:8px;width:100%;max-width:560px"><div class="ptw sh-t mini" style="width:100%">${ptCellsHTML()}</div><div class="sm" style="font-size:20px;text-align:center">الكتلة الملوّنة: العناصر الانتقالية (الدرس السابق)</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px;max-width:560px">اليوم ننتقل إلى مجموعة أخرى: <b>المجموعة I</b>، فلزات تختلف عن الانتقالية في كل ما ذكرناه.</div></div>
   <div class="col" style="width:440px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">ما الذي يميّز العناصر الانتقالية عن غيرها من الفلزات؟</div>
     ${optsHTML([{t:'مركّباتها ملوّنة وغالباً تعمل حفّازات'},{t:'تتفاعل بعنف مع الماء'},{t:'لينة وتُقطع بالسكين'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صح: ألوان مركّباتها وحفّازيتها وتعدد تكافؤها'},{t:'',why:'التفاعل العنيف مع الماء ليس من صفات الانتقالية'},{t:'',why:'الانتقالية صلبة وقوية، واللين صفة فلزات أخرى'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>التقويم القبلي من عرض NotebookLM (تقويم قبلي عن العناصر الانتقالية، وهو الدرس السابق ١-٢) وعرضك («حدّد العناصر الانتقالية في الجدول الدوري، وما الذي يميّزها؟»).</li></ul>'});

/* 3 lead-in: find the group of elements that lose one electron */
slide({id:'lead',ch:0,title:'أي مجموعة تفقد إلكتروناً واحداً؟',tag:'تمهيد',
 html:function(){
  var G=[[0,'I'],[1,'II'],[12,'III'],[13,'IV'],[14,'V'],[15,'VI'],[16,'VII'],[17,'VIII']];
  var head='<button type="button" class="gh gbt" data-c="0" data-n="١">I</button><button type="button" class="gh gbt" data-c="1" data-n="٢">II</button><div class="gh tb">العناصر الانتقالية</div>'+G.slice(2).map(function(g,i){return '<button type="button" class="gh gbt" data-c="'+g[0]+'" data-n="'+ar(i+3)+'">'+g[1]+'</button>'}).join('');
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:10px 12px;gap:6px"><div class="ptw" id="ptw">${head}${ptCellsHTML()}</div></div>
    <div class="fb" id="rd" style="min-height:30px;text-align:center;font-size:22px;background:rgba(6,20,44,.86);border-radius:12px;padding:3px 14px;align-self:center">اضغط على رقم مجموعة لتعرف عدد الإلكترونات في مستوى طاقتها الخارجي.</div>
    <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px">المجموعة I تُسمّى <b>الفلزات القلوية</b>: Li وNa وK وRb وCs وFr (الفرانسيوم مشع). كل ذرة فيها <b>إلكترون واحد</b> في مستواها الخارجي.</div></div>
   <div class="col" style="width:340px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:21px;font-weight:800;color:var(--gold)">ابحث عن مجموعة من العناصر النشطة جداً، تميل إلى فقد إلكترون واحد فقط.</div></div>
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">ماذا تُسمّى هذه المجموعة؟</div>
     ${optsHTML([{t:'الفلزات القلوية'},{t:'العناصر الانتقالية'},{t:'الغازات النبيلة'}])}<div class="fb2" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){
  var found=false, ans=false;
  function chk(){ if(found&&ans) unhide(el) }
  $$('.gbt',el).forEach(function(b){b.addEventListener('click',function(){
    var c=+b.getAttribute('data-c'); $$('.pc',el).forEach(function(p){p.classList.toggle('csel',+p.getAttribute('data-c')===c&&!p.classList.contains('gap')&&!(c===0&&p.textContent==='H'))});
    $$('.gbt',el).forEach(function(x){x.classList.toggle('on',x===b)});
    say($('#rd',el),'المجموعة '+b.textContent+': '+b.getAttribute('data-n')+' '+(b.getAttribute('data-n')==='١'?'إلكترون':'إلكترونات')+' في المستوى الخارجي'+(c===0?' ← هذه هي المجموعة!':''),c===0?'ok':'');
    if(c===0) found=true; chk();
  })});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: الفلزات القلوية'},{t:'',why:'الانتقالية في وسط الجدول ولها خصائص أخرى'},{t:'',why:'الغازات النبيلة في المجموعة VIII وهي غير نشطة'}],$('.fb2',el),function(){ans=true; chk()});
 },
 note:'<ul><li>التمهيد من عرضك وعرض NotebookLM: «ابحث عن مجموعة من العناصر النشطة جداً التي تميل إلى فقد إلكترون واحد فقط. ماذا تُسمّى؟». دليل المعلم: «حدّد موقع الفلزات القلوية في المجموعة I من الجدول الدوري، وذكّر الطلاب بأن عناصر مجموعة ما تمتلك عدد الإلكترونات نفسه في مستوى الطاقة الخارجي لذراتها، وهو ما يحدد رقم المجموعة».</li><li>كتاب الطالب ص١٩: «تسمّى الفلزات المميزة للمجموعة I الفلزات القلوية Alkali metals»، وفي الجدول Li وNa وK وRb وCs وFr. الجدول بالأرقام الرومانية كما في الكتاب. الهيدروجين H فوق المجموعة I لكنه ليس فلزاً قلوياً، فلم ألوّنه.</li></ul>'});

/* 4 atoms: one outer electron, an ion with charge +1 */
slide({id:'atoms',ch:1,title:'إلكترون واحد في المستوى الخارجي',tag:'اضغط الذرات',
 html:function(){
  var A=[['Li',[2,1],'٢ ، ١'],['Na',[2,8,1],'٢ ، ٨ ، ١'],['K',[2,8,8,1],'٢ ، ٨ ، ٨ ، ١']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل ذرة لتفقد إلكترونها الخارجي:</div>
    <div class="panel" style="padding:12px 12px"><div style="display:flex;gap:10px;width:100%;justify-content:space-around">${A.map(function(a,i){return '<button type="button" class="at" data-i="'+i+'">'+shellSVG(a[1],a[0])+'<div class="atl"><b class="num">'+a[0]+'</b><span class="ion hide"> ← <b class="num">'+a[0]+'<sup>+</sup></b></span></div><div class="atc">'+a[2]+'</div></button>'}).join('')}</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">كل ذرة فلز قلوي تفقد <b>إلكتروناً واحداً</b> فتصير أيوناً بشحنة <b>+١</b>.</div></div>
   <div class="col" style="width:360px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">ما شحنة أيون الفلز القلوي؟</div>
     ${optsHTML([{t:'+١'},{t:'+٢'},{t:'−١'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){
  var gone=0, ans=false;
  function chk(){ if(ans&&gone===3) unhide(el) }
  $$('.at',el).forEach(function(b){b.addEventListener('click',function(){
    if(b.classList.contains('gone')) return; b.classList.add('gone'); $('.ion',b).classList.remove('hide'); gone++; chk();
  })});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: Li⁺ وNa⁺ وK⁺'},{t:'',why:'ليس لها إلا إلكترون خارجي واحد'},{t:'',why:'الفلزات تفقد الإلكترونات فتصير أيونات موجبة'}],$('.fb',el),function(){ans=true; chk()});
 },
 note:'<ul><li>دليل المعلم: «اشرح النشاط الكيميائي للفلزات القلوية بالإشارة إلى قدرتها على تكوين أيونات موجبة ذات شحنة +١». كتاب الطالب ص٢٠: «تكوّن أيونات تحمل شحنة أحادية موجبة (مثل Li⁺ وNa⁺ وK⁺)».</li><li>الرسوم مرسومة لهذا الدرس: التوزيع الإلكتروني ٢،١ و٢،٨،١ و٢،٨،٨،١ (من الصف التاسع). الإلكترون الذهبي هو الخارجي.</li></ul>'});

/* 5 the properties of the alkali metals (student book p.20) */
slide({id:'props',ch:1,title:'خصائص الفلزات القلوية',tag:'اضغط وتعرّف',
 html:function(){
  var items=[
   ['تتفاعل بشدة مع الماء','ولذلك سُمّيت «القلوية»: تعطي غاز الهيدروجين ومحاليل قلوية.'],
   ['نشطة جداً','فتُخزَّن في الزيت لمنع تفاعلها مع الأكسجين وبخار الماء في الهواء.'],
   ['ليّنة وسهلة القطع','وكثافتها منخفضة نسبياً (الصورة ١-٤: عينة من الليثيوم).'],
   ['أيوناتها +١','تكوّن أيونات أحادية موجبة: Li⁺ وNa⁺ وK⁺.'],
   ['مركّبات متشابهة الصيغ','مثل الكربونات: Li₂CO₃ وNa₂CO₃ وK₂CO₃.'],
   ['أملاحها بيضاء','تتفاعل مع اللافلزات فتكوّن أملاحاً بيضاء بلورية صلبة تذوب في الماء.']];
  return `<div class="col" style="flex:1;gap:12px;justify-content:center;min-height:0">
   <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>
   ${cardsHTML(items,'three')}
   <div class="gbar hide" id="gb" style="font-size:21px">فلزات <b>نشطة ليّنة</b> متشابهة المظهر والسلوك، لكن خصائصها <b>تتدرّج</b> نزولاً في المجموعة. هذا ما سنتتبّعه.</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٢٠ (صندوق الخصائص المميزة للفلزات القلوية): تُعرف بالقلوية لأنها تتفاعل بشدة مع الماء لإنتاج الهيدروجين ومحاليل قلوية؛ جميعها نشطة فيجب تخزينها في الزيت لمنع تفاعلها مع الأكسجين وبخار الماء؛ ليّنة وسهلة القطع؛ تكوّن أيونات أحادية موجبة؛ مركّبات لها صيغ متشابهة (كربونات Li₂CO₃ وNa₂CO₃ وK₂CO₃)؛ تتفاعل بشدة مع اللافلزات لتكوين أملاح بيضاء بلورية، وهي مركّبات أيونية صلبة تذوب في الماء.</li><li>سؤال ١-٧: خاصيتان فيزيائيتان تميّز الفلزات القلوية (ليّنة، كثافة منخفضة، انصهارها منخفض نسبياً) — ويُحلّ في شريحة أسئلة الكتاب.</li></ul>'});

/* 6 why they are kept in oil: tarnishing (exam 2025/2026 round 1, question 2: seconds to lose the lustre) */
slide({id:'store',ch:1,title:'لماذا تُخزَّن في الزيت؟',tag:'عرّضها للهواء',
 html:function(){
  var M=[['Li','الليثيوم',92],['Na','الصوديوم',57],['K','البوتاسيوم',13]];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 12px"><div style="display:flex;gap:10px;width:100%;justify-content:space-around">${M.map(function(m,i){return '<div class="tn" data-t="'+m[2]+'"><svg viewBox="0 0 120 100" width="150" aria-hidden="true"><defs><radialGradient id="tg'+i+'" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d9dfe6"/><stop offset="1" stop-color="#9aa3ad"/></radialGradient></defs><ellipse cx="60" cy="52" rx="44" ry="30" fill="#5d636b"/><ellipse class="shn" cx="60" cy="52" rx="44" ry="30" fill="url(#tg'+i+')"/></svg><b class="num" style="font-size:30px">'+m[0]+'</b><span class="tl">&nbsp;</span></div>'}).join('')}</div></div>
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn acc" id="air">أخرج القطع من الزيت وعرّضها للهواء</button><span class="sm" style="font-size:18px;background:rgba(6,20,44,.82);border-radius:10px;padding:0 10px">الزمن مسرَّع ١٠ مرات</span></div>
    <div class="gbar hide" id="gb" style="font-size:20px">كلما نزلنا في المجموعة <b>زاد النشاط</b>: يفقد البوتاسيوم لمعانه أسرع الجميع. لذلك تُحفظ في <b>الزيت</b>.</div></div>
   <div class="col" style="width:380px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">لماذا يجب تخزين الفلزات القلوية داخل زيوت خاصة؟</div>
     ${optsHTML([{t:'لمنع تفاعلها مع الأكسجين وبخار الماء في الهواء'},{t:'لأنها تذوب في الزيت'},{t:'لتصبح أكثر لمعاناً'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){
  var run=false, ans=false;
  function chk(){ if(ans&&run) unhide(el) }
  $('#air',el).addEventListener('click',function(){
    if(run) return; this.disabled=true;
    $$('.tn',el).forEach(function(t){
      var s=+t.getAttribute('data-t'), sh=$('.shn',t);
      sh.style.transition='opacity '+(s/10).toFixed(1)+'s linear'; void sh.offsetWidth; sh.style.opacity=0;
      later(function(){ $('.tl',t).innerHTML='فقد لمعانه بعد <b>'+ar(s)+'</b> ثانية' },s*100);
    });
    later(function(){ run=true; chk() },9400);
  });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: الزيت يعزلها عن الأكسجين وبخار الماء'},{t:'',why:'لا تذوب في الزيت: تُحفظ فيه فقط'},{t:'',why:'بل تفقد لمعانها بسرعة في الهواء'}],$('.fb',el),function(){ans=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص١٩–٢٠ والسؤال ١-٩ (لماذا يجب تخزين الفلزات القلوية داخل زيوت خاصة؟): لمنع تفاعلها مع الأكسجين وبخار الماء الموجودين في الهواء. الإجابة من دليل المعلم: لمنع التفاعل مع الرطوبة والأكسجين في الهواء. الأرقام (الزمن اللازم لفقدان اللمعان: Li ‏٩٢ ثانية، Na ‏٥٧، K ‏١٣) من امتحان ٢٠٢٥/٢٠٢٦ الدور الأول س٢ وليست من الكتب.</li><li>الحركة مسرَّعة ١٠ مرات لتناسب الحصة.</li></ul>'});

/* 7 alkali metals against transition elements (activity book worksheet 1-3, question 2) */
slide({id:'compare',ch:1,title:'الفلزات القلوية والعناصر الانتقالية',tag:'قارن',
 html:function(){
  var R=[['النشاط الكيميائي','very','less'],['السلوك في الماء (حسب الكثافة)','float','sink'],['درجة الانصهار والغليان','low','high'],['لون الأملاح','colourless','coloured']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب كل وصف إلى مكانه في الجدول:</div>
    <div class="cmp"><div></div><div class="ch">الفلزات القلوية</div><div class="ch d">العناصر الانتقالية</div>${R.map(function(r){return '<div class="cl">'+r[0]+'</div><div class="mslot" data-k="'+r[1]+'"><span class="ph">...</span></div><div class="mslot" data-k="'+r[2]+'"><span class="ph">...</span></div>'}).join('')}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:330px;flex:none;gap:12px;justify-content:center">
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الفلزات القلوية <b>أنشط</b> وأخفّ وأقل انصهاراً وأملاحها <b>عديمة اللون</b>؛ والانتقالية العكس غالباً.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['very','نشطة جداً'],['less','أقل نشاطاً'],['float','تطفو على الماء'],['sink','تغوص في الماء'],['low','منخفضة'],['high','مرتفعة'],['colourless','عديمة اللون'],['coloured','غالباً ملوّنة']],{css:'font-size:20px;padding:6px 12px',more:'صح! كمّل',done:'ممتاز: ميّزتَ المجموعتين',bad:'فكّر: أيّ المجموعتين تنطبق عليها هذه الصفة؟'});
 },
 note:'<ul><li>ورقة العمل ١-٣ في كتاب النشاط (س٢): جدول مقارنة بين الفلزات القلوية والعناصر الانتقالية: النشاط الكيميائي (نشطة جداً / أقل نشاطاً)، سلوكها في الماء بحسب الكثافة (تطفو / تغوص)، درجة الانصهار والغليان (منخفضة / مرتفعة)، لون الأملاح (عديمة اللون / غالباً ملوّنة). الإجابات في دليل المعلم. الورقة ضمن موارد الدرس ١-٤، لكن المقارنة تخدم هذا الدرس. دليل المعلم (فكرة تدريس): «قارن تصنيف الفلزات القلوية كمجموعة من العناصر مع تصنيف الانتقالية كتجمّع».</li><li>الانتقالية «تغوص» لأن كثافتها أعلى من الماء (الدرس السابق).</li></ul>'});
