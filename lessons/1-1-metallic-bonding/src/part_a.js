/* ---------- lesson 1-1, part A: goals and the opening (the periodic table, the samples, sorting) ---------- */

/* 1 goals (teacher's guide p.19: goals 4-1 and 4-2, quoted) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['٤-١','يصف الخواصّ الفيزيائية العامّة للفلزّات باعتبارها مواد صلبة ذات درجتَي انصهار وغليان مرتفعتَين، وأنّها مواد مرنة وموصِلة جيّدة للحرارة وللتيّار الكهربائي.'],
         ['٤-٢','يصف الرابطة الفلزّيّة بأنّها قوى تجاذب بين الأيونات الموجبة والإلكترونات الحرّة في البنية الشبكية للفلزّ، ويستخدمها لتفسير مرونة الفلزّات وجودة توصيلها للتيّار الكهربائي.']];
  var C=['أعدّد الخواص الفيزيائية العامة للفلزات.','أرسم البنية الشبكية للفلز وأسمّي أجزاءها.','أعرّف الرابطة الفلزية بجملة صحيحة.','أفسّر بها الانصهار العالي والمرونة والتوصيل.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:20px 28px 18px;justify-content:center;gap:8px">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">الموضوع ١-١</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:56px;font-weight:800;line-height:1.1">الترابط و<span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">خصائص الفلزات</span></h1>
    <p style="font-size:22px;font-weight:700;line-height:1.3;margin:4px 0 0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl" style="grid-template-columns:1fr;gap:8px">${G.map(function(g){return '<button type="button" class="gi"><span class="ck">✓</span><span><b style="color:var(--gold)">'+g[0]+'</b> '+g[1]+'</span></button>'}).join('')}</div>
    <p style="font-size:20px;font-weight:800;color:var(--cyan);margin:4px 0 0">معايير النجاح:</p>
    <div class="gl" style="grid-template-columns:1fr 1fr;gap:6px 18px">${C.map(function(t){return '<button type="button" class="gi" style="font-size:19px;line-height:1.4"><span class="ck" style="width:28px;height:28px;font-size:18px">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:14px 10px;align-items:center;gap:8px">${latSVG({w:290,rows:4,cols:5,gap:52,r:17,el:14,seed:3})}<div class="sm" style="font-size:19px;text-align:center">فلز: أيونات موجبة منتظمة وبحر من الإلكترونات الحرة</div></div>
    <div class="sm" style="font-size:22px;text-align:center;font-weight:700">سنرسم هذه البنية، ثم نفسّر بها الخواص</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الهدفان ٤-١ و٤-٢ منقولان بنصهما من دليل المعلم (ص١٩). الدرس حصة واحدة، وأسئلة الكتاب ١-١ و١-٢ وسؤال ١ من نهاية الوحدة، وليس له مصدر في كتاب النشاط (حسب جدول موارد الوحدة في الدليل).</li><li>معايير النجاح الأربعة صياغتي أنا من نص الهدفين لأنه لا توجد معايير مكتوبة لهذا الموضوع في الدليل (المهارات في الدليل مرتبطة بالأنشطة العملية). عدّلها كما تشاء.</li><li>اضغط على هدف أو معيار لتظليله وأنت تراجع في نهاية الدرس.</li></ul>'});

/* 2 the periodic table: metals, non-metals */
(function(){
  var ROWS=[
   ['H','','','','','','','','','','','','','','','','','He'],
   ['Li','Be','','','','','','','','','','','B','C','N','O','F','Ne'],
   ['Na','Mg','','','','','','','','','','','Al','Si','P','S','Cl','Ar'],
   ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
   ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
   ['Cs','Ba','٥٧–٧١','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
   ['Fr','Ra','٨٩–١٠٣','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']];
  var N='H He C N O F Ne P S Cl Ar Se Br Kr I Xe Rn'.split(' '), S='B Si Ge As Sb Te At'.split(' '), U='Ts Og'.split(' ');
  function cls(s){return N.indexOf(s)>-1?'n':S.indexOf(s)>-1?'s':U.indexOf(s)>-1?'u':'m'}
  slide({id:'pt',ch:0,title:'كيف نقسّم العناصر؟',tag:'لوّن الجدول',
   html:function(){
    var cells=ROWS.map(function(r){return r.map(function(s){return s?'<div class="pc '+cls(s)+(s.length>2?' blk':'')+'" title="'+s+'">'+s+'</div>':'<div class="pc gap"></div>'}).join('')}).join('');
    return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
      <div class="panel" style="padding:12px 14px;gap:8px"><div class="ptw" id="ptw">${cells}</div></div>
      <div class="pt-leg"><button type="button" data-s="m">فلزات</button><button type="button" data-s="n">لافلزات</button><button type="button" data-s="s">أشباه الفلزات (إثرائي)</button></div>
      <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px">معظم العناصر <b>فلزات</b>، وتقع إلى اليسار وفي الوسط. واللافلزات في أعلى يمين الجدول.</div>
      <div class="sm" style="font-size:16px;color:var(--muted)">الخانتان «٥٧–٧١» و«٨٩–١٠٣» للّانثانيدات والأكتينيدات (فلزات). التصنيف المؤكَّد للعنصرين Ts وOg غير متاح بعد.</div></div>
     <div class="col" style="width:340px;flex:none;gap:12px;justify-content:center">
      <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:23px;font-weight:800">اضغط الأزرار ولوّن العناصر، ثم أجب:</div>
       <div style="font-size:22px;font-weight:800;color:var(--gold)">ماذا تلاحظ؟</div>
       ${optsHTML([{t:'معظم العناصر فلزات'},{t:'معظم العناصر لافلزات'},{t:'عدد الفلزات يساوي عدد اللافلزات'}])}<div class="fb" style="min-height:26px"></div></div></div></div>`;},
   init:function(el){
    var w=$('#ptw',el), shown={}, ans=false;
    function chk(){ if(ans&&shown.m&&shown.n) unhide(el) }
    $$('.pt-leg button',el).forEach(function(b){b.addEventListener('click',function(){
      var k=b.getAttribute('data-s'); b.classList.toggle('on'); w.classList.toggle('sh-'+k,b.classList.contains('on')); if(b.classList.contains('on')) shown[k]=1; chk();
    })});
    bindMcq($('#q',el),[{t:'',ok:true,why:'صح: الفلزات أكثر العناصر عدداً'},{t:'',why:'عدّ الخانات الملوّنة: اللافلزات قليلة (أعلى اليمين)'},{t:'',why:'الفلزات أكثر بكثير من اللافلزات'}],$('.fb',el),function(){ans=true; chk()});
   },
   note:'<ul><li>التمهيد كما في عرضك: «ماذا تلاحظ؟ كيف يمكن أن نقسّم العناصر؟» ثم نراجع التقسيم إلى فلزات ولافلزات (دليل المعلم: ابدأ بمراجعة التقسيم الفرعي للعناصر ومواقعها في الجدول الدوري).</li><li>كتاب الطالب ص١٥: معظم العناصر فلزات. أشباه الفلزات (B وSi وGe وAs وSb وTe وAt) موجودة في خريطة المدرسة فقط وليست في هدفي ٤-١ و٤-٢، فهي إثرائية. الجدول مرسوم بقيم الدورات ١–٧.</li><li>تنبيه: الجدول مبسّط، وعدد الخانات ليس العدد الذري.</li></ul>'});
})();

/* 3 the samples: what do metals have in common? */
(function(){
  var S=[['حديد (مسمار)','fe'],['ألومنيوم (رقائق)','al'],['نحاس (سلك)','cu'],['ذهب (خاتم)','au']];
  var T=['لامع','صلب','يوصل الكهرباء','يوصل الحرارة','يُطرق ويُسحب'];
  function sw(k){
    var g={fe:['#9aa3ab','#5b646c'],al:['#e8edf1','#a9b4bd'],cu:['#ffb27a','#b4561f'],au:['#ffe08a','#c0901a']}[k];
    var body=k==='fe'?'<rect x="6" y="15" width="38" height="8" rx="3" fill="url(#sw'+k+')"/><rect x="2" y="11" width="9" height="16" rx="3" fill="url(#sw'+k+')"/>':
      k==='al'?'<path d="M6 10 Q16 4 26 10 T46 10 L46 28 Q36 34 26 28 T6 28Z" fill="url(#sw'+k+')"/>':
      k==='cu'?'<path d="M6 12h40M6 17h40M6 22h40M6 27h40" stroke="url(#sw'+k+')" stroke-width="4" stroke-linecap="round"/>':
      '<circle cx="26" cy="21" r="13" fill="none" stroke="url(#sw'+k+')" stroke-width="7"/><circle cx="26" cy="6" r="5" fill="#fff4c9" stroke="#c0901a" stroke-width="1.5"/>';
    return '<svg class="sw" viewBox="0 0 52 40" aria-hidden="true"><defs><linearGradient id="sw'+k+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+g[0]+'"/><stop offset="1" stop-color="'+g[1]+'"/></linearGradient></defs>'+body+'</svg>';
  }
  slide({id:'samples',ch:0,title:'نشاط: خواص مشتركة',tag:'اختبر العينات',
   html:function(){
    var h='<div class="smp"><div></div>'+T.map(function(t){return '<div class="h">'+t+'</div>'}).join('');
    S.forEach(function(s,i){ h+='<button type="button" class="rn1" data-i="'+i+'">'+sw(s[1])+'<span>'+s[0]+'</span></button>'+T.map(function(t,j){return '<div class="cell" data-i="'+i+'" data-j="'+j+'"><span class="t ok-t">✓</span></div>'}).join('') });
    h+='</div>';
    return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
      <div style="font-size:23px;font-weight:800;color:var(--cyan)">اضغط على كل عينة لتجري عليها الاختبارات:</div>
      <div class="panel" style="padding:14px 16px">${h}</div>
      <div class="fb" style="min-height:26px;text-align:center"></div>
      <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px">هذه الخواص تميّز <b>الفلزات</b> كلها. لماذا؟ سنعرف بعد أن نرى كيف تتركّب.</div></div>
     <div class="col" style="width:380px;flex:none;gap:12px;justify-content:center">
      <div class="panel" id="qh" style="padding:12px 16px"><div style="font-size:22px;font-weight:800;color:var(--gold)">اختبر العينات الأربع أولاً، ثم يظهر سؤال هنا.</div></div>
      <div class="panel compact hide" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:23px;font-weight:800">ما الذي تشترك فيه العينات الأربع؟</div>
       ${optsHTML([{t:'كلها لامعة صلبة، توصل الحرارة والكهرباء وتُطرق'},{t:'كلها هشة وتتحطم بالطرق'},{t:'كلها لا توصل الكهرباء'}])}<div class="fb2" style="min-height:26px"></div></div></div></div>`;},
   init:function(el){
    var tested=0, ans=false;
    function chk(){ if(ans&&tested===S.length) unhide(el) }
    $$('.rn1',el).forEach(function(b){b.addEventListener('click',function(){
      if(b.classList.contains('tested')) return; b.classList.add('tested'); var i=b.getAttribute('data-i');
      $$('.cell[data-i="'+i+'"]',el).forEach(function(c,j){ later(function(){c.classList.add('on')},j*260) });
      tested++; say($('.fb',el),tested<S.length?'اختبر العينة التالية':'اختبرنا العينات كلها: ماذا تلاحظ؟','ok');
      if(tested===S.length){ later(function(){ $('#qh',el).classList.add('hide'); $('#q',el).classList.remove('hide') },1300) }
    })});
    bindMcq($('#q',el),[{t:'',ok:true,why:'صح: كلها فلزات تشترك في هذه الخواص'},{t:'',why:'الفلزات تُطرق ولا تتحطم'},{t:'',why:'الفلزات موصلة جيدة للكهرباء'}],$('.fb2',el),function(){ans=true; chk()});
   },
   note:'<ul><li>نشاط التعرف على خواص الفلزات من عرضك وعرض NotebookLM (عيّنات من الحديد والألومنيوم والنحاس). كتاب الطالب ص١٥–١٦ وشكل ١-٣: الفلزات صلبة، لامعة، موصلة جيدة للحرارة والكهرباء، ومرنة (قابلة للطرق والسحب).</li><li>الجدول في الشريحة نتائج مقررة مسبقاً وليس قياساً فعلياً. إن توفرت العينات في المختبر فاعرضها وأجرِ اختبار التوصيل بدائرة بسيطة (شكل ١-٣).</li></ul>'});
})();

/* 4 sorting: metals and non-metals */
slide({id:'sort',ch:0,title:'نشاط التصنيف',tag:'فلز أم لافلز؟',
 html:function(){
  var items=[['<span class="num">Fe</span> الحديد','m','فلز: صلب لامع ويوصل الكهرباء'],['<span class="num">O<sub>2</sub></span> الأكسجين','n','لافلز: غاز لا يوصل الكهرباء'],['<span class="num">Al</span> الألومنيوم','m','فلز: خفيف ويوصل الكهرباء ويُسحب'],['<span class="num">C</span> الكربون','n','لافلز: صلب هش في الفحم (والجرافيت صورة خاصة منه)'],['<span class="num">Mg</span> الماغنيسيوم','m','فلز: يوصل الكهرباء ويُطرق'],['<span class="num">Cl<sub>2</sub></span> الكلور','n','لافلز: غاز لا يوصل الكهرباء']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">صنّف كل مادة: اضغط «فلز» أو «لافلز»:</div>
    <div class="clsw">${clsHTML(items,[['m','فلز'],['n','لافلز']],26)}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:340px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800;color:var(--gold)">اسأل نفسك</div><div class="sm" style="font-size:21px">ما الخواص التي تكشف أن المادة فلز؟ اللمعان؟ التوصيل؟ القدرة على الطرق؟</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الفلزات: Fe وAl وMg. واللافلزات: O₂ وC وCl₂.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر في توصيلها للكهرباء ولمعانها') },
 note:'<ul><li>نشاط التصنيف من عرضك وعرض NotebookLM: O₂ وFe وAl وC وMg وCl₂. دليل المعلم: ابدأ بمراجعة التقسيم الفرعي للعناصر إلى فلزات ولافلزات.</li><li>الكربون لافلز، لكن الجرافيت (صورة من صور الكربون) يوصل الكهرباء، وهو استثناء مشهور. اذكره شفهياً إن سأل أحد الطلاب ولا تفتح فيه نقاشاً طويلاً.</li></ul>'});
