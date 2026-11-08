/* ---------- mole lesson, part A: follows the NotebookLM deck order (slides 1 to 12), with interaction added ---------- */

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يعرّف المول بأنه كمية من مادة تحتوي على عدد ثابت من الجسيمات (6.02×10²³) يسمى عدد أفوجادرو.',
   'يعلّل استخدام المول في عدّ الذرات والجزيئات بدلاً من عدّها واحدة واحدة.',
   'يحسب الكتلة المولية لمادة (g/mol) من كتلة صيغتها النسبية.',
   'يحوّل بين الكتلة وعدد المولات: n = m ÷ M.',
   'يحسب عدد الجسيمات في كمية من المادة: N = n × 6.02×10²³.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:24px 30px 22px;justify-content:center;gap:10px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">تمهيد</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:64px;font-weight:800;line-height:1.05"><span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">المُول</span> <span class="num">3-2</span></h1>
    <p style="margin:0 0 4px;font-size:30px;font-weight:700;color:var(--muted)">حسابات المُول</p>
    <p style="font-size:24px;font-weight:700;line-height:1.4;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
    <img class="pic fade" src="${IMG.atomglow}" alt="" style="width:360px;max-width:none">
    <div class="bigeq" style="font-size:44px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5)">6.02×10<sup>23</sup></div>
    <div class="sm" style="font-size:22px">عدد أفوجادرو</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من دليل المعلم للموضوع ٣-٢ (٣-٤ و٣-٨) بصياغة مبسطة. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>دليل المعلم ص٥٤–٥٥: أفكار التدريس تقترح تشبيه الحسابات بعدّ العملات النقدية، ثم مسائل تحويل الكتلة إلى مولات وإلى عدد الجسيمات، وإعادة النظر في نتائج نشاط ٣-١ بالمولات (الشريحة act31).</li></ul>'});

/* 2 count: three pictures, then the question that leads to weighing */
slide({id:'count',ch:1,title:'تمهيد: كم عدد…؟',tag:'سؤال',
 html:function(){
  var C=[['coins','كم عدد القطع المعدنية في الصورة؟'],['balloons','كم عدد البالونات في الصورة؟'],['rice','كم عدد حبات الأرز في الصورة؟']];
  return `<div class="col grow" style="gap:12px;justify-content:flex-start">
   <div style="display:flex;gap:16px">${C.map(function(c){return `<div class="frm brk" style="flex:1;align-items:center;padding:8px 12px 8px;gap:4px"><img class="pic" src="${IMG[c[0]]}" alt="" style="width:112px;height:112px"><h3 style="margin:0;font-family:var(--font-display);font-size:23px;text-align:center;line-height:1.25">${c[1]}</h3></div>`}).join('')}</div>
   <div class="panel" style="padding:12px 20px;gap:6px"><p class="lead" style="font-size:27px;margin:0"><b>لو كان عندنا كيس كامل من الأرز، ما أنسب طريقة لمعرفة عدد حباته؟</b></p>
    ${optsHTML([{t:'نعدّها حبة حبة'},{t:'نخمّن بالنظر فقط'},{t:'نزن الكتلة الكلية ثم نقسمها على كتلة الحبة الواحدة'}])}
    <div class="fb" style="min-height:28px"></div></div>
   <div class="gbar hide" id="gb">نعدّ الأشياء الكثيرة بوزنها! فهل نقدر نعدّ الذرات بنفس الفكرة؟</div></div>`;},
 init:function(el){
  bindMcq($('.panel',el),[{t:'',why:'ممكن، لكن يأخذ وقتاً طويلاً جداً وتنسى العدّ'},{t:'',why:'التخمين لا يعطي عدداً دقيقاً'},{t:'',ok:true,why:'صح: الوزن أسرع وأدق من العدّ'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>عرضك (شريحة ٢): القطع المعدنية والبالونات والأرز. اترك الطلاب يقدّرون أولاً ثم يختارون الطريقة.</li><li>الفكرة التي نبني عليها: العدّ بالوزن، وهي الجسر إلى المول.</li></ul>'});

/* 3 weigh: count coins by weighing the bag */
slide({id:'weigh',ch:1,title:'نعدّ العملات بالوزن',tag:'ضع الكيس على الميزان',
 html:function(){
  var bags=[['كيس ١',150],['كيس ٢',650],['كيس ٣',2000]];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:4px"><p class="lead" style="margin:0;font-size:27px">كتلة العملة الواحدة <b class="num" style="color:var(--gold)">5 g</b></p>
     <p class="sm" style="margin:0;font-size:23px">العدد = الكتلة الكلية ÷ كتلة العملة الواحدة</p></div>
    <div style="display:flex;gap:12px">${bags.map(function(b,i){return `<button type="button" class="btn bag" data-i="${i}" style="flex:1;font-size:25px">${b[0]}</button>`}).join('')}</div>
    <div class="frm brk" style="padding:14px 20px;gap:10px;min-height:150px" id="wbox"><p class="lead" style="margin:0;font-size:26px" id="wprompt">اختر كيساً لتضعه على الميزان</p>
     ${bags.map(function(b,i){return `<div class="wq" data-i="${i}" style="display:none;align-items:center;gap:14px;flex-wrap:wrap"><span style="font-size:26px;font-weight:700">عدد العملات في ${b[0]} =</span>${nin('w'+i,'عملة')}</div>`}).join('')}
     <div class="fb" style="min-height:28px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:24px">نفس الفكرة نستخدمها مع الذرات: نزن المادة فنعرف عدد جسيماتها</div>
   </div>
   <div style="width:430px;flex:none;display:flex;align-items:center;justify-content:center">
    <svg viewBox="0 0 420 380" width="430" height="389" style="max-width:100%" aria-hidden="true">
     <defs><radialGradient id="wcoin" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF0B8"/><stop offset="1" stop-color="#C98A0A"/></radialGradient></defs>
     <rect x="60" y="300" width="300" height="46" rx="12" fill="rgba(var(--t2),.18)" stroke="rgba(var(--t2),.7)" stroke-width="2.5"/>
     <rect x="150" y="260" width="120" height="44" rx="8" fill="rgba(var(--t2),.12)" stroke="rgba(var(--t2),.6)" stroke-width="2"/>
     <path d="M96 262 Q210 292 324 262" fill="none" stroke="rgba(var(--t2),.85)" stroke-width="5" stroke-linecap="round"/>
     <g id="pile"></g>
     <rect x="104" y="56" width="212" height="84" rx="14" fill="rgba(var(--d1),.9)" stroke="var(--cyan)" stroke-width="3"/>
     <text id="wdisp" x="210" y="112" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="48" fill="var(--gold)">0 g</text>
     <text x="210" y="168" text-anchor="middle" font-family="Cairo,sans-serif" font-weight="700" font-size="20" fill="var(--muted)">الكتلة على الميزان</text>
    </svg>
   </div></div>
`;},
 init:function(el){
  var bags=[150,650,2000], ans=[30,130,400], done=0, fb=$('.fb',el), pile=$('#pile',el), disp=$('#wdisp',el);
  function coins(n){
    var s='', k, r=function(i){var x=Math.sin(i*91.7)*43758.5453; return x-Math.floor(x)};
    for(k=0;k<n;k++){var cx=150+r(k+1)*120, cy=250-r(k+9)*40-Math.floor(k/9)*9; s+='<ellipse cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" rx="17" ry="7" fill="url(#wcoin)" stroke="#8a5a05" stroke-width="1.2"/>'}
    return s;
  }
  function pick(i){
    $$('.bag',el).forEach(function(b){b.classList.toggle('acc',+b.getAttribute('data-i')===i)});
    $$('.wq',el).forEach(function(q){var on=+q.getAttribute('data-i')===i; q.style.display=on?'flex':'none'});
    $('#wprompt',el).textContent='الميزان يقرأ '+bags[i]+' g. كم عملة في الكيس؟';
    disp.textContent=bags[i]+' g'; pile.innerHTML=coins([8,16,30][i]); say(fb,'');
  }
  $$('.bag',el).forEach(function(b){b.addEventListener('click',function(){pick(+b.getAttribute('data-i'))})});
  $$('.wq',el).forEach(function(q,i){
    bindNum($('.nin',q),ans[i],0.01,function(ok){
      if(ok){ say(fb,'✓ '+bags[i]+' ÷ 5 = '+ans[i],'ok'); $$('.bag',el)[i].classList.add('ok-b'); done++; if(done===3){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} }
      else say(fb,'اقسم الكتلة على 5','bad');
    });
  });
 },
 note:'<ul><li>الأكياس ١٥٠ و٦٥٠ و٢٠٠٠ g، وكتلة العملة ٥ g (أرقام تدريبية). الإجابات: ٣٠، ١٣٠، ٤٠٠.</li><li>هذا هو الجسر إلى فكرة المول: نعدّ بالوزن.</li></ul>'});

/* 4 graphite: why counting atoms one by one is hopeless */
slide({id:'graphite',ch:1,title:'كم عدد ذرات الكربون في الرصاص؟',tag:'سؤال',
 html:function(){return `<div class="col grow" style="gap:12px;justify-content:flex-start">
  <div style="display:flex;gap:16px;flex:1;min-height:0">
   <div class="frm brk" style="width:290px;flex:none;align-items:center;justify-content:center;padding:12px;gap:8px"><img class="pic fade" src="${IMG.coal}" alt="" style="width:260px"><div class="sm" style="text-align:center;font-size:22px">قطعة كربون (فحم / جرافيت)</div></div>
   <div class="frm brk" style="flex:1;align-items:center;justify-content:center;padding:10px;gap:6px"><img class="pic" src="${IMG.lat2d}" alt="" style="width:290px"><h3 style="margin:0;font-family:var(--font-display);font-size:25px">مادة ثنائية الأبعاد</h3><div class="sm" style="font-size:21px">طبقة واحدة من الذرات</div></div>
   <div class="frm brk" style="flex:1;align-items:center;justify-content:center;padding:10px;gap:6px"><img class="pic" src="${IMG.lat3d}" alt="" style="height:178px"><h3 style="margin:0;font-family:var(--font-display);font-size:25px">مادة ثلاثية الأبعاد</h3><div class="sm" style="font-size:21px">عدد كبير من الطبقات الذرية</div></div></div>
  <div class="panel" style="padding:12px 20px;gap:6px"><p class="lead" style="font-size:27px;margin:0"><b>هل نقدر نعدّ ذرات الكربون في القطعة ذرة بعد ذرة؟</b></p>
   ${optsHTML([{t:'نعم، لو صبرنا وعددنا بدقة'},{t:'لا، لأن عدد الذرات هائل جداً'}])}<div class="fb" style="min-height:26px"></div></div>
  <div class="gbar hide" id="gb">نحتاج «وحدة عدّ» مناسبة لجسيمات صغيرة جداً وبأعداد ضخمة</div></div>`;},
 init:function(el){
  bindMcq($('.panel',el),[{t:'',why:'مستحيل عملياً: في القطعة أعداد لا تخطر على البال'},{t:'',ok:true,why:'صح: العدّ المباشر غير ممكن'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>عرضك (شريحة ٣): الجرافيت طبقات سداسية؛ الطبقة الواحدة مادة ثنائية الأبعاد والجرافيت تراكم لعدد كبير من الطبقات.</li></ul>'});

/* 5 units: pair, dozen, ream, mole */
slide({id:'units',ch:1,title:'وحدات للعدّ',tag:'مطابقة بالسحب',
 html:function(){
  var U=[['pair','الزوج','shoes','2'],['dozen','الدرزن','eggs','12'],['ream','الرزمة','paper','500'],['mole','المول','atomglow','6.02×10²³']];
  return `<div class="col grow" style="gap:14px;justify-content:flex-start">
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${U.map(function(u){return `<div class="frm brk ${u[0]==='mole'?'gold':''}" style="flex-direction:row;align-items:center;gap:16px;padding:12px 18px"><img class="pic" src="${IMG[u[2]]}" alt="" style="height:${u[0]==='mole'?70:86}px;max-width:150px;object-fit:contain"><div style="flex:1"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:30px">${u[1]} =</h3><div class="mslot slot" data-k="${u[0]}" style="min-height:62px"><span class="ph" style="font-size:20px">اسحب العدد إلى هنا</span></div></div></div>`}).join('')}</div>
   <div class="imp-tray" id="tray" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap"></div>
   <div class="fb" style="text-align:center;min-height:30px"></div>
   <div class="gbar hide" id="gb">المول وحدة عدّ للذرات والجزيئات: <b class="num">6.02×10<sup>23</sup></b> وتسمى عدد أفوجادرو</div></div>`;},
 init:function(el){
  var items=[['mole','6.02×10²³'],['dozen','12'],['pair','2'],['ream','500']], tray=$('#tray',el), fb=$('.fb',el), left=4, sel=null;
  function place(chip,slot){
    if(chip.getAttribute('data-k')===slot.getAttribute('data-k')&&!slot.querySelector('.mchip')){
      var ph=$('.ph',slot); if(ph) ph.remove(); slot.appendChild(chip); chip.classList.add('ok-b','locked'); chip.style.cursor='default'; left--;
      say(fb,left?'صح! كمّل':'ممتاز','ok'); if(!left){tray.classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} return true;
    }
    slot.classList.add('shake'); later(function(){slot.classList.remove('shake')},340); say(fb,'مو هذا العدد لهذي الوحدة، حاول مرة ثانية','bad'); return false;
  }
  items.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip num'; c.setAttribute('data-k',it[0]); c.style.minWidth='150px'; c.style.textAlign='center'; c.style.fontSize='28px'; c.style.fontFamily='var(--font-display)'; c.textContent=it[1]; tray.appendChild(c);
    drag(c,{zone:'.mslot',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.mslot',el).forEach(function(s){s.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,s); sel.style.outline=''; sel=null } })});
 },
 note:'<ul><li>عرضك (شريحة ٤): الزوج ٢، الدرزن ١٢، الرزمة ٥٠٠، المول ٦٫٠٢×١٠²³ (عدد أفوجادرو).</li><li>اسحب العدد إلى الوحدة المناسبة أو اضغط العدد ثم الوحدة.</li></ul>'});

/* 6 the mole */
slide({id:'mole',ch:2,title:'المُول',tag:'اكشف العدد',
 html:function(){return `<div class="col grow" style="gap:14px;justify-content:center">
  <div class="frm brk" style="padding:14px 26px;align-items:center"><p class="lead" style="margin:0;font-size:31px;text-align:center"><b style="color:var(--gold)">المُول:</b> كمية من مادة تحتوي على <b class="num">6.02×10<sup>23</sup></b> ذرة أو جزيء أو وحدة صيغة.</p></div>
  <div class="bigeq" style="font-size:76px;text-align:center;line-height:1.05;text-shadow:0 0 28px rgba(228,188,75,.45)">1 mol = <b>6.02×10<sup style="font-size:.55em">23</sup></b></div>
  <div style="display:flex;gap:16px;align-items:stretch">
   <div class="panel" style="flex:1;padding:12px 20px;gap:8px"><button class="btn acc" type="button" id="rv" style="align-self:flex-start">اكتب العدد كاملاً</button>
    <div class="digits hide" id="dg" style="font-size:36px;line-height:1.2;display:none">602 <span class="z">000 000 000 000 000 000 000</span></div>
    <div class="hide" id="zq" style="display:none;align-items:center;gap:14px;flex-wrap:wrap"><span style="font-size:25px;font-weight:700">كم صفراً بعد 602؟</span>${nin('z','')}<div class="fb" style="flex:1;min-height:26px"></div></div></div>
   <div class="panel" style="width:430px;flex:none;padding:12px 20px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">من كتاب الطالب</div><p class="sm" style="margin:0;font-size:22px;line-height:1.55">لو رُصّت <b class="num">6.02×10<sup>23</sup></b> علبة مشروب غازي لغطّت سطح الأرض كله بارتفاع يصل إلى ٢٠٠ ميل. ويرمز لثابت أفوجادرو بالرمز <b class="num">L</b>.</p></div></div></div>`;},
 init:function(el){
  $('#rv',el).addEventListener('click',function(){this.classList.add('hide'); var d=$('#dg',el); d.style.display=''; d.classList.remove('hide'); d.classList.add('up'); var q=$('#zq',el); q.style.display='flex'; q.classList.remove('hide'); q.classList.add('up')});
  var fb=$('#zq .fb',el);
  bindNum($('#zq .nin',el),21,0.01,function(ok){ if(ok) say(fb,'✓ ٢١ صفراً: هذا العدد لا يمكن عدّه، لكن يمكن وزنه','ok'); else say(fb,'عدّ المجموعات: كل ٠٠٠ ثلاثة أصفار','bad') });
 },
 note:'<ul><li>عرضك (شريحة ٥): تعريف المول و1 mol = 6.02×10²³.</li><li>العدد كاملاً: ٦٠٢ ثم ٢١ صفراً. قيمة العلب والأرض من كتاب الطالب (ص٥٩).</li></ul>'});

/* 7 why not weigh one atom */
slide({id:'single',ch:2,title:'لماذا لا نزن ذرة واحدة؟',tag:'فكّر',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:center">
  <img class="pic fade" src="${IMG.device}" alt="" style="width:400px;flex:none">
  <div class="col" style="flex:1;gap:12px;justify-content:center">
   <div class="panel" style="padding:14px 22px;gap:8px"><p class="lead" style="margin:0;font-size:29px"><b>لماذا لا يستطيع الكيميائي أن يزن ذرة واحدة ثم يجعلها تتفاعل مع ذرة أخرى؟</b></p>
    ${optsHTML([{t:'لأن الذرات تتغير كتلتها كل لحظة'},{t:'لأن الذرات والجزيئات متناهية الصغر'},{t:'لأن الميزان يحتاج مادة سائلة'}])}<div class="fb" style="min-height:28px"></div></div>
   <div class="frm brk gold hide" id="ans" style="padding:14px 22px"><p class="big" style="margin:0;font-size:28px;line-height:1.55">لا يمكن وزن ذرة مفردة أو جزيء مفرد وجعله يتفاعل مع ذرة أخرى أو جزيء آخر لأن الذرات والجزيئات <b style="color:var(--gold)">متناهية الصغر</b>.</p></div></div></div>`;},
 init:function(el){
  bindMcq($('.panel',el),[{t:'',why:'كتلة الذرة ثابتة؛ المشكلة في صغرها'},{t:'',ok:true,why:'صح'},{t:'',why:'ما لها علاقة بحالة المادة'}],$('.fb',el),function(){var a=$('#ans',el); a.classList.remove('hide'); a.classList.add('up')});
 },
 note:'<ul><li>عرضك (شريحة ٦): لا يمكن وزن ذرة مفردة أو جزيء مفرد.</li><li>كتاب الطالب ص٥٩: لا يستطيع الكيميائي وزن ذرة مفردة أو جزيء مفرد وجعله يتفاعل مع ذرة أخرى، فنحتاج وحدة تربط الكتلة بالعدد، وهي المول.</li></ul>'});

/* 8 ways to count amounts: put the chain in order */
slide({id:'ways',ch:2,title:'طرق حساب كميات المواد',tag:'رتّب الخطوات',
 html:function(){
  var rows=['١','٢','٣','٤'];
  return `<div class="col grow" style="gap:12px;justify-content:flex-start">
   <div style="display:flex;flex-direction:column;gap:8px">${rows.map(function(n,i){return `<div style="display:flex;align-items:center;gap:12px"><div class="mk" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:24px;flex:none">${n}</div><div class="mslot slot" data-k="${i}" style="flex:1;min-height:58px"><span class="ph" style="font-size:20px">اسحب الخطوة المناسبة إلى هنا</span></div></div>`}).join('')}</div>
   <div class="imp-tray" id="tray" style="display:flex;flex-direction:column;gap:8px"></div>
   <div class="fb" style="text-align:center;min-height:28px"></div>
   <div class="gbar hide" id="gb">المول الواحد يمتلك نفس العدد من الذرات أو الجزيئات أو وحدات الصيغة ويساوي <b class="num">6.02×10<sup>23</sup></b></div></div>`;},
 init:function(el){
  var items=[[2,'كيف يُحصي الكيميائيون الذرات والجزيئات؟'],[0,'كيف يمكن أن نقدّر عدد ذرات الحديد في كتلته؟'],[3,'عن طريق وزنها، فالوحدة المعيارية لكمية المادة هي كتلة صيغتها النسبية بالجرام وتسمى المول'],[1,'عن طريق ربط الكتلة بعدد']],
      tray=$('#tray',el), fb=$('.fb',el), left=4, sel=null;
  function place(chip,slot){
    if(+chip.getAttribute('data-k')===+slot.getAttribute('data-k')&&!slot.querySelector('.mchip')){
      var ph=$('.ph',slot); if(ph) ph.remove(); slot.appendChild(chip); chip.classList.add('ok-b','locked'); chip.style.cursor='default'; chip.style.fontSize='22px'; left--;
      say(fb,left?'صح! كمّل':'ممتاز','ok'); if(!left){tray.classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} return true;
    }
    slot.classList.add('shake'); later(function(){slot.classList.remove('shake')},340); say(fb,'فكّر: السؤال يأتي قبل جوابه','bad'); return false;
  }
  items.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'; c.setAttribute('data-k',it[0]); c.style.fontSize='22px'; c.style.padding='9px 16px'; c.textContent=it[1]; tray.appendChild(c);
    drag(c,{zone:'.mslot',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.mslot',el).forEach(function(s){s.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,s); sel.style.outline=''; sel=null } })});
 },
 note:'<ul><li>عرضك (شريحة ٧): سؤال ← جواب ← سؤال ← جواب. الترتيب: كيف نقدّر عدد ذرات الحديد؟ ← بربط الكتلة بعدد ← كيف يحصي الكيميائيون الذرات؟ ← بوزنها.</li></ul>'});

/* 9 the mole triangle */
slide({id:'formula',ch:3,title:'المُول = الكتلة ÷ الكتلة المولية',tag:'غطِّ المجهول',
 html:function(){return `<div style="display:flex;gap:22px;flex:1;align-items:center">
  <div class="frm brk" style="width:400px;flex:none;align-items:center;padding:12px 16px;gap:10px">
   <svg class="tri" viewBox="0 0 300 250" style="width:330px" aria-hidden="true">
    <path d="M150 12 L288 238 H12 Z" fill="rgba(var(--t1),.07)" stroke="var(--cyan)" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M62 120 H238 M150 120 V238" stroke="var(--cyan)" stroke-width="3" fill="none"/>
    <g class="cell" data-c="m"><text x="150" y="100" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="46" fill="var(--gold)">m</text></g>
    <g class="cell" data-c="n"><text x="85" y="196" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="46" fill="var(--gold)">n</text></g>
    <g class="cell" data-c="M"><text x="214" y="196" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="46" fill="var(--gold)">M</text></g>
   </svg>
   <div class="sm" style="font-size:19px;line-height:1.5;text-align:center"><span class="num"><b style="color:var(--gold)">m</b></span> الكتلة (g) · <span class="num"><b style="color:var(--gold)">n</b></span> عدد المولات (mol) · <span class="num"><b style="color:var(--gold)">M</b></span> الكتلة المولية (g/mol)</div>
   <div style="display:flex;gap:8px;width:100%"><button type="button" class="btn sm cv" data-c="m" style="flex:1">غطِّ m</button><button type="button" class="btn sm cv" data-c="n" style="flex:1">غطِّ n</button><button type="button" class="btn sm cv" data-c="M" style="flex:1">غطِّ M</button></div>
  </div>
  <div class="col" style="flex:1;gap:12px;justify-content:center">
   <div class="panel" style="padding:12px 20px;align-items:center;gap:4px"><div class="sm" style="font-size:21px">المُول</div><div class="bigeq" id="eq" style="font-size:60px;line-height:1.1;color:var(--gold)">n = m ÷ M</div><div class="sm num" id="eqs" style="font-size:21px">mol = g ÷ (g/mol)</div></div>
   <div class="panel" style="padding:12px 20px;gap:10px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">جرّب</div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:24px;font-weight:700">كتلة <span class="num">2 mol</span> من مادة كتلتها المولية <span class="num">18 g/mol</span> =</span>${nin('a','g')}</div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:24px;font-weight:700">عدد مولات <span class="num">44 g</span> من مادة كتلتها المولية <span class="num">44 g/mol</span> =</span>${nin('b','mol')}</div>
    <div class="fb" style="min-height:26px"></div></div></div></div>`;},
 init:function(el){
  var F={m:['m = n × M','g = mol × (g/mol)'],n:['n = m ÷ M','mol = g ÷ (g/mol)'],M:['M = m ÷ n','g/mol = g ÷ mol']}, fb=$('.fb',el);
  function cover(c){
    $$('.tri .cell',el).forEach(function(g){g.classList.toggle('off',g.getAttribute('data-c')===c)});
    $$('.cv',el).forEach(function(b){b.classList.toggle('acc',b.getAttribute('data-c')===c)});
    $('#eq',el).textContent=F[c][0]; $('#eqs',el).textContent=F[c][1];
  }
  $$('.cv',el).forEach(function(b){b.addEventListener('click',function(){cover(b.getAttribute('data-c'))})});
  bindNum($('.nin[data-n="a"]',el),36,0.01,function(ok){ if(ok) say(fb,'✓ m = n × M = 2 × 18 = 36 g','ok'); else say(fb,'غطِّ m في المثلث: m = n × M','bad') });
  bindNum($('.nin[data-n="b"]',el),1,0.01,function(ok){ if(ok) say(fb,'✓ n = m ÷ M = 44 ÷ 44 = 1 mol','ok'); else say(fb,'غطِّ n في المثلث: n = m ÷ M','bad') });
 },
 note:'<ul><li>عرضك (شريحة ٨): المول = الكتلة ÷ الكتلة المولية. مثلث الحساب من كتاب الطالب وكتاب النشاط (تمرين ٣-٣).</li><li>اضغط «غطِّ» على المجهول فتظهر العلاقة. الإجابات: ٣٦ و١.</li></ul>'});

/* 10 and 11: Table 3-4, predict the molar mass before it is shown */
(function(){
  var NAMES={C:'الكربون',Fe:'الحديد',H2:'الهيدروجين',O2:'الأكسجين',H2O:'الماء',MgO:'أكسيد الماغنيسيوم',CaCO3:'كربونات الكالسيوم',SiO2:'ثنائي أكسيد السيليكون'};
  var CALC={C:'12',Fe:'56',H2:'2 × 1 = 2',O2:'2 × 16 = 32',H2O:'(2 × 1) + 16 = 18',MgO:'24 + 16 = 40',CaCO3:'40 + 12 + (3 × 16) = 100',SiO2:'28 + (2 × 16) = 60'};
  var WHAT={C:'ذرّة كربون',Fe:'ذرّة حديد',H2:'جُزيء '+fh('H2'),O2:'جُزيء '+fh('O2'),H2O:'جُزيء '+fh('H2O'),MgO:'وحدة صيغة '+fh('MgO'),CaCO3:'وحدة صيغة '+fh('CaCO3'),SiO2:'وحدة صيغة '+fh('SiO2')};
  function table(list,ref){
    return `<div class="col grow" style="gap:8px;justify-content:flex-start">${arStrip(ref)}
     <table class="mtab"><colgroup><col style="width:17%"><col style="width:10%"><col style="width:25%"><col style="width:14%"><col style="width:34%"></colgroup>
      <thead><tr><th>المادة</th><th>الصيغة</th><th>الكتلة الذرية / كتلة الصيغة النسبية M<sub>r</sub></th><th>كتلة مول واحد (الكتلة المولية)</th><th>تحتوي هذه الكتلة (مول واحد) على</th></tr></thead>
      <tbody>${list.map(function(f,i){return `<tr class="mr" data-i="${i}"><td style="font-size:22px">${NAMES[f]}</td><td>${fh(f)}</td><td><div style="display:flex;justify-content:center">${nin('r'+i,'')}</div><div class="rv num" style="font-size:19px;color:var(--muted);min-height:24px">${CALC[f]}</div></td><td class="num"><span class="rv" style="color:var(--gold)">${MR(f)} g</span></td><td style="font-size:21px"><span class="rv"><span class="num">6.02×10<sup>23</sup></span> ${WHAT[f]}</span></td></tr>`}).join('')}</tbody></table>
     <div class="fb" style="text-align:center;min-height:26px"></div></div>`;
  }
  function bindTable(el,list){
    var fb=$('.fb',el), left=list.length;
    $$('tr.mr',el).forEach(function(r,i){
      bindNum($('.nin',r),MR(list[i]),0.01,function(ok){
        if(ok){r.classList.add('ok'); left--; say(fb,left?'✓ المول الواحد = كتلة الصيغة النسبية بالجرام':'ممتاز! عدد الجسيمات في المول ثابت: 6.02×10²³','ok')}
        else say(fb,'اجمع الكتل الذرية النسبية لكل ذرات الصيغة','bad');
      });
    });
  }
  slide({id:'t34a',ch:3,title:'الجدول ٣-٤: كتلة مول واحد (الجزء الأول)',tag:'احسب M<sub>r</sub>',
   html:function(){return table(['C','Fe','H2','O2'],['H','C','O','Fe'])},
   init:function(el){bindTable(el,['C','Fe','H2','O2'])},
   note:'<ul><li>عرضك (شريحة ٩): الجدول ٣-٤ ص٦٠. الطالب يتوقع Mr قبل ظهور كتلة المول.</li><li>الكربون والحديد ذرات؛ H₂ وO₂ جزيئات (٢ × ١ = ٢ و٢ × ١٦ = ٣٢).</li></ul>'});
  slide({id:'t34b',ch:3,title:'الجدول ٣-٤: كتلة مول واحد (الجزء الثاني)',tag:'احسب M<sub>r</sub>',
   html:function(){return table(['H2O','MgO','CaCO3','SiO2'],['H','C','O','Mg','Si','Ca'])},
   init:function(el){bindTable(el,['H2O','MgO','CaCO3','SiO2'])},
   note:'<ul><li>عرضك (شريحة ١٠). الإجابات: ١٨، ٤٠، ١٠٠، ٦٠.</li><li>في الكتاب والعرض كُتب «جزيء» لـ MgO وCaCO₃ وSiO₂، وهي تراكيب ضخمة فالأدق «وحدة صيغة» كما في تعريف المول، فاعتمدتها هنا.</li></ul>'});
})();

/* 12 Avogadro's number stays the same */
slide({id:'avo',ch:3,title:'عدد أفوجادرو ثابت',tag:'اختر مادة',
 html:function(){
  var S=[['C','كربون','12'],['Fe','حديد','56'],['H2O','ماء','18'],['MgO','أكسيد الماغنيسيوم','40']];
  return `<div class="col grow" style="gap:10px;justify-content:flex-start">
   <div class="gbar" style="font-size:22px;padding:8px 20px">اختلاف الكتلة المولية واختلاف الصيغة يؤدي إلى أن عدد أفوجادرو يبقى ثابتاً رغم اختلاف الصيغة وكتلة المول الواحد</div>
   <div style="display:flex;gap:18px;flex:1;min-height:0;align-items:stretch">
    <div class="frm brk" style="flex:1;align-items:center;justify-content:center;padding:8px">
     <svg viewBox="0 0 640 300" style="width:100%;height:100%" aria-hidden="true">
      <defs><radialGradient id="aorb" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".95"/><stop offset="1" stop-color="#D9A92B" stop-opacity=".55"/></radialGradient></defs>
      <path d="M270 300 Q300 205 320 205 Q340 205 370 300 Z" fill="rgba(var(--t1),.25)" stroke="var(--cyan)" stroke-width="3"/>
      <rect x="60" y="188" width="520" height="8" rx="4" fill="var(--cyan)"/><circle cx="320" cy="192" r="12" fill="var(--gold)"/>
      <ellipse cx="150" cy="204" rx="110" ry="12" fill="rgba(var(--t2),.2)" stroke="rgba(var(--t2),.8)" stroke-width="2.5"/>
      <ellipse cx="490" cy="204" rx="110" ry="12" fill="rgba(var(--t2),.2)" stroke="rgba(var(--t2),.8)" stroke-width="2.5"/>
      <g id="cube"><rect x="86" y="86" width="128" height="112" rx="10" fill="rgba(var(--t1),.22)" stroke="var(--cyan)" stroke-width="3"/>
       <text id="cname" x="150" y="128" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="34" fill="var(--ink)">C</text>
       <text id="cmass" x="150" y="170" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="30" fill="var(--gold)">12 g</text></g>
      <circle cx="490" cy="132" r="68" fill="url(#aorb)" stroke="#FFE9A0" stroke-width="3" style="filter:drop-shadow(0 0 14px rgba(228,188,75,.8))"/>
      <text x="490" y="128" text-anchor="middle" direction="ltr" font-family="Cairo,sans-serif" font-weight="800" font-size="26" fill="#2a1a00">6.02×10²³</text>
      <text id="cwhat" x="490" y="158" text-anchor="middle" font-family="Cairo,sans-serif" font-weight="700" font-size="17" fill="#2a1a00">ذرة كربون</text>
     </svg></div>
    <div class="col" style="width:470px;flex:none;gap:8px;justify-content:center">
     <div class="panel" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">ضع مول واحد من:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${S.map(function(s,i){return `<button type="button" class="btn sm sb" data-i="${i}" style="font-size:20px">${s[1]}</button>`}).join('')}</div></div>
     <div class="panel" style="padding:10px 16px;gap:6px"><p class="lead" style="margin:0;font-size:22px"><b>عند الانتقال من مادة إلى أخرى:</b></p>${optsHTML([{t:'الكتلة تتغير وعدد الجسيمات ثابت'},{t:'الكتلة ثابتة وعدد الجسيمات يتغير'}])}<div class="fb" style="min-height:24px"></div></div></div></div></div>`;},
 init:function(el){
  var S=[['C','12','ذرة كربون'],['Fe','56','ذرة حديد'],['H₂O','18','جزيء H₂O'],['MgO','40','وحدة صيغة MgO']], seen={};
  function pick(i){
    $('#cname',el).textContent=S[i][0]; $('#cmass',el).textContent=S[i][1]+' g'; $('#cwhat',el).textContent=S[i][2];
    $$('.sb',el).forEach(function(b){b.classList.toggle('acc',+b.getAttribute('data-i')===i)}); seen[i]=1;
  }
  $$('.sb',el).forEach(function(b){b.addEventListener('click',function(){pick(+b.getAttribute('data-i'))})});
  pick(0);
  bindMcq($('.panel:last-child',el),[{t:'',ok:true,why:'صح: لكل مادة كتلة مولية مختلفة لكن عدد الجسيمات في المول واحد'},{t:'',why:'جرّب بنفسك: الكرة الذهبية لا تتغير'}],$('.panel:last-child .fb',el));
 },
 note:'<ul><li>عرضك (شريحة ١١): ميزان فيه مكعبات C (12 g) وFe (56 g) وH₂O (18 g) مقابل كرة 6.02×10²³.</li><li>اضغط على مادة فتتغير الكتلة والجسيم وتبقى الكرة الذهبية كما هي.</li></ul>'});
