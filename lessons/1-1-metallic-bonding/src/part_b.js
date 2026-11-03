/* ---------- lesson 1-1, part B: the structure of a metal and the metallic bond, then the properties it explains ---------- */

/* 5 where do the electrons go? (teacher's guide, teaching ideas: metals always form positive ions; where do the electrons go if no non-metal is there to take them?) */
(function(){
  function atom(i){
    var th=[-1.9,-1.2,-2.6,-.5,-1.55][i%5], ox=60+50*Math.cos(th), oy=60+50*Math.sin(th), tx=[-22,10,36,-40,4][i%5], ty=[140,150,136,146,152][i%5];
    var d='<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="sh3" cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/><circle cx="60" cy="60" r="36" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><circle cx="60" cy="60" r="22" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>';
    d+='<circle cx="60" cy="60" r="14" fill="url(#gIon)" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/><text x="60" y="65" text-anchor="middle" font-size="14" font-weight="800" fill="#2a1d00" font-family="Cairo,sans-serif" class="num">11+</text>';
    [0,3.14].forEach(function(a){d+='<circle cx="'+(60+22*Math.cos(a+.6))+'" cy="'+(60+22*Math.sin(a+.6))+'" r="4.2" fill="#7fd4ff"/>'});
    for(var k=0;k<8;k++){var a=k*Math.PI/4+.3; d+='<circle cx="'+(60+36*Math.cos(a))+'" cy="'+(60+36*Math.sin(a))+'" r="4.2" fill="#7fd4ff"/>'}
    d+='<g class="oe"><circle class="oec" cx="'+ox.toFixed(1)+'" cy="'+oy.toFixed(1)+'" r="6.4" fill="#ffe08a" stroke="#c0901a" stroke-width="1.5"/></g></svg>';
    return '<div class="na" data-i="'+i+'" style="--tx:'+tx+'px;--ty:'+ty+'px"><div style="direction:ltr;font-family:var(--font-display);font-size:26px;font-weight:800;min-height:34px"><span class="a0">Na</span><span class="chg hide a1">Na<sup>+</sup></span></div>'+d+'<div class="lbl2" style="color:var(--muted)"><span class="a0">ذرة (إلكترون خارجي واحد)</span><span class="a1 hide" style="color:var(--gold)">أيون موجب</span></div></div>';
  }
  slide({id:'where',ch:1,title:'أين تذهب الإلكترونات؟',tag:'اضغط الذرات',
   html:function(){
    return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
      <div style="font-size:23px;font-weight:800;color:var(--cyan)">ذرات الصوديوم: اضغط كل ذرة لتفقد إلكترونها الخارجي:</div>
      <div class="na-row">${[0,1,2,3,4].map(atom).join('')}</div>
      <div class="fb" style="min-height:26px;text-align:center"></div>
      <div class="gbar hide" id="gb" style="font-size:21px;padding:8px 18px">الإلكترونات التي تحرّرت صارت <b>حرة الحركة</b> بين الأيونات الموجبة: <b>بحر من الإلكترونات</b>.</div></div>
     <div class="col" style="width:370px;flex:none;gap:12px;justify-content:center">
      <div class="panel" id="qh" style="padding:12px 16px"><div style="font-size:22px;font-weight:800;color:var(--gold)">اضغط الذرات الخمس أولاً، ثم يظهر سؤال هنا.</div></div>
      <div class="panel compact hide" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">الفلزات تكوّن دائماً أيونات موجبة. وليس هنا لافلز يكتسب الإلكترونات. فأين تذهب؟</div>
       ${optsHTML([{t:'تبقى حرة تتحرك بين الأيونات الموجبة'},{t:'تختفي من الذرة'},{t:'تعود إلى النواة'}])}<div class="fb2" style="min-height:26px"></div></div></div></div>`;},
   init:function(el){
    var n=0, ans=false;
    function chk(){ if(ans&&n===5) unhide(el) }
    $$('.na',el).forEach(function(a){a.addEventListener('click',function(){
      if(a.classList.contains('gone')) return; a.classList.add('gone'); n++;
      $$('.a0',a).forEach(function(x){x.classList.add('hide')}); $$('.a1',a).forEach(function(x){x.classList.remove('hide')});
      var oec=$('.oec',a); oec.classList.add('el');
      say($('.fb',el),n<5?'الذرة فقدت إلكتروناً واحداً فأصبحت أيون Na⁺':'خمس ذرات فقدت خمسة إلكترونات. أين ذهبت؟','ok');
      if(n===5){ later(function(){ $('#qh',el).classList.add('hide'); $('#q',el).classList.remove('hide') },900) }
    })});
    bindMcq($('#q',el),[{t:'',ok:true,why:'صح: لا أحد يكتسبها فتبقى حرة بين الأيونات'},{t:'',why:'الإلكترونات لا تفنى: تنتقل من مكان إلى آخر'},{t:'',why:'الذرة فقدت الإلكترون ولا تسترده بلا سبب'}],$('.fb2',el),function(){ans=true; chk()});
   },
   note:'<ul><li>من أفكار التدريس في دليل المعلم: «تكوّن الأيونات الموجبة أمر بالغ الأهمية لفهم الترابط... يجب شرح ذلك بالتطرّق إلى فقدان الإلكترونات من مستوى الطاقة الخارجي للذرات، والإجابة عن السؤال التالي: أين تذهب الإلكترونات في حال عدم وجود عنصر لافلزّي لكسبها؟». هذه الشريحة هي ذلك السؤال.</li><li>كتاب الطالب ص١٥: الفلزات تفقد إلكترونات التكافؤ فتكوّن أيونات موجبة. الصوديوم في المستوى الأخير إلكترون واحد (٢، ٨، ١). الرسم ليس من الكتاب.</li><li>هذه الشريحة غير موجودة في عرضك ولا في عرض NotebookLM، وأضفتها من الدليل.</li></ul>'});
})();

/* 6 the structure of a metal */
slide({id:'struct',ch:1,title:'التركيب البنائي للفلز',tag:'اكتشف',
 html:function(){
  var items=[['أيونات موجبة منتظمة','تترتب الأيونات الموجبة في صفوف منتظمة تُسمّى <b>الشبكة</b> (البنية الشبكية).'],['بحر من الإلكترونات الحرة','إلكترونات التكافؤ التي فقدتها الذرات لا تخص ذرة بعينها: تتحرك بحرية بين الأيونات، ولذلك تُسمّى <b>غير متمركزة</b>.'],['قوى تجاذب كهروستاتيكية','الأيونات الموجبة تجذب بحر الإلكترونات السالب، فتمسك الشبكة الفلزية معاً.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div class="panel" style="padding:10px 16px;align-items:center;gap:8px">${latSVG({w:480,rows:5,cols:7,gap:50,r:17,el:26,seed:9,id:'sv'})}
     <div class="chips" style="gap:8px;justify-content:center" id="lg"><button type="button" class="pill on" data-h="" style="min-height:40px;font-size:19px;padding:0 14px">الكل</button><button type="button" class="pill" data-h="hl-ion" style="min-height:40px;font-size:19px;padding:0 14px">الأيونات الموجبة</button><button type="button" class="pill" data-h="hl-el" style="min-height:40px;font-size:19px;padding:0 14px">الإلكترونات الحرة</button></div></div>
    <div class="sm" style="font-size:17px;color:var(--muted)">رسم تخطيطي: الأيونات الموجبة (+) والإلكترونات الحرة (النقاط الزرقاء).</div>
    <div class="gbar hide" id="gb" style="font-size:20px;padding:8px 18px">في الفلز: <b>أيونات موجبة في شبكة منتظمة + بحر من الإلكترونات الحرة</b>.</div></div>
   <div class="col" style="width:520px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة لتظهر:</div>
    ${cardsHTML(items)}</div></div>`;},
 init:function(el){
  var s=$('#sv',el);
  $$('#lg button',el).forEach(function(b){b.addEventListener('click',function(){
    $$('#lg button',el).forEach(function(x){x.classList.toggle('on',x===b)}); s.classList.remove('hl-ion','hl-el'); var h=b.getAttribute('data-h'); if(h) s.classList.add(h);
  })});
  bindCards(el,function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص١٦ وشكل ١-١، وعرضك وعرض NotebookLM (التركيب البنائي للفلز): أيونات موجبة منتظمة في شبكة، وبحر من الإلكترونات غير المتمركزة، وقوة التجاذب الكهروستاتيكي بينهما. هدف ٤-٢ يستخدم «الإلكترونات الحرة» والكتاب يستخدم «غير المتمركزة»: المعنى واحد.</li><li>دليل المعلم: «اختر مخططاً أو شكلاً لتوضيح الترابط الفلزي والصيغة البنائية، وناقش أهمية الإلكترونات الحرة». الرسم هنا مرسوم لهذا الدرس وليس نسخة من الكتاب. في الخلفية مجسّم ثلاثي الأبعاد حي للشبكة: الإلكترونات الزرقاء تتحرك بين الأيونات.</li></ul>'});

/* 7 the metallic bond: the definition */
slide({id:'bond',ch:1,title:'الرابطة الفلزية',tag:'أكمل التعريف',
 html:function(){
  var P=BOND_PARTS;
  return `<div class="col" style="flex:1;gap:12px;justify-content:center">
   <div class="frm gold brk" style="padding:14px 26px 16px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">اختر الكلمة الصحيحة لكل فراغ:</div>${fillHTML(P)}</div>
   <div class="fb" style="min-height:26px;text-align:center"></div>
   <div class="bnote" style="display:flex;flex-direction:column;gap:8px">
    <div>الأيونات الموجبة ← تجذب الإلكترونات الحرة السالبة ← <b>قوى كهروستاتيكية قوية</b>.</div>
    <div>الإلكترونات <b>غير متمركزة</b>: لا تنتمي إلى ذرة محددة بل إلى الشبكة كلها.</div>
    <div>هذه الرابطة هي التي <b>تفسّر</b> انصهار الفلزات العالي ومرونتها وتوصيلها.</div></div></div>`;},
 init:function(el){ bindFill(el,BOND_PARTS,$('.fb',el),function(){ say($('.fb',el),'✓ هذا هو تعريف الرابطة الفلزية بنص الهدف ٤-٢','ok') }) },
 note:'<ul><li>تعريف الرابطة الفلزية بنص الهدف ٤-٢ في دليل المعلم: «قوى تجاذب بين الأيونات الموجبة والإلكترونات الحرّة في البنية الشبكية للفلزّ». كتاب الطالب ص١٦ وإجابة سؤال ١-١: «قوة تجاذب كهروستاتيكي قوية بين الأيونات الموجبة وبحر الإلكترونات المتحركة، تمسك الشبكة الفلزية معاً». اقبل الصياغتين من الطالب.</li><li>الامتحانات: ٢٠٢٤/٢٠٢٥ الدور الأول س٤ (أ) «عرّف الرابطة الفلزية»، و٢٠٢٣/٢٠٢٤ الدور الأول س٨ (مفهوم الرابطة الفلزية مع الرسم).</li></ul>'});
var BOND_PARTS=['الرابطة الفلزية: قوى',{o:['تنافر','تجاذب','تعادل'],ok:1,why:['لو كانت تنافراً لتفرّقت الأيونات','صح: التجاذب بين الشحنات المختلفة','هذه ليست قوة']},'بين الأيونات',{o:['السالبة','الموجبة','المتعادلة'],ok:1,why:['الأيونات في الفلز موجبة لأن الذرات فقدت إلكترونات','صح: فقدت الذرات الإلكترونات','لا تتجاذب الأجسام المتعادلة']},'و',{o:['البروتونات','النيوترونات','الإلكترونات الحرة'],ok:2,why:['البروتونات داخل النوى','النيوترونات متعادلة لا تتجاذب كهربائياً','صح: بحر الإلكترونات الحرة']},'في البنية',{o:['الجزيئية','الشبكية','الذرّية'],ok:1,why:['الفلز لا يتكوّن من جزيئات منفصلة','صح: أيونات في شبكة منتظمة','الأيونات هي التي تترتب في الشبكة']},'للفلز.'];

/* 8 comparing the three kinds of structure (teacher's guide: review ionic and giant covalent, to compare the kinds of bonding) */
slide({id:'compare',ch:1,title:'الفلزية، الأيونية، التساهمية الضخمة',tag:'قارن',
 html:function(){
  var items=[['أيونات موجبة تسبح في بحر من الإلكترونات الحرة','m','فلزية'],['أيونات موجبة وأيونات سالبة تتجاذب في شبكة','i','أيونية (مثل ملح الطعام)'],['كل ذرة مرتبطة بذرات مجاورة بروابط تساهمية قوية جداً (كالألماس)','c','تساهمية ضخمة'],['تنزلق طبقاتها فوق بعضها دون أن تنكسر','m','فلزية: لذلك تُطرق'],['هشّة: تتحطم عند الطرق عليها','i','أيونية: تتقابل شحنات متشابهة فتتنافر'],['لا يوجد فيها إلكترونات حرة، فلا توصل الكهرباء (كالألماس)','c','تساهمية ضخمة']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">أي نوع من الترابط يوصف بكل عبارة؟</div>
    <div class="clsw" style="max-width:none">${clsHTML(items,[['m','فلزية'],['i','أيونية'],['c','تساهمية ضخمة']],21)}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:300px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--gold)">انتبه</div><div class="sm" style="font-size:20px;line-height:1.45">الأيونات الموجبة موجودة في الفلزية والأيونية معاً. والقوة العظيمة موجودة في الفلزية والتساهمية الضخمة. التمييز بين الثلاثة هو المطلوب.</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الفلزية: أيونات موجبة + <b>إلكترونات حرة</b>. الأيونية: أيونات موجبة + <b>أيونات سالبة</b>.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'تذكّر ما الذي يربط الجسيمات في كل نوع') },
 note:'<ul><li>دليل المعلم (المفاهيم الخاطئة): «ومن الأفكار الخاطئة غالباً ما يحدث التباس بين مفهوم الترابط الفلزي والصيغة البنائية الأيونية الضخمة (بسبب وجود أيونات موجبة) أو الصيغة البنائية التساهمية الضخمة (لوصف القوّة والمتانة)». وفي أفكار التدريس: «راجع أنواع أخرى من التراكيب كالأيونية والتساهمية الضخمة لمقارنة أنواع الترابط».</li><li>الامتحانات: ٢٠٢٥/٢٠٢٦ الدور الثاني س٣ «أي البدائل تشير إلى قوة الجذب الكهروستاتيكية التي تربط بين ذرات النحاس؟» (الأيونية، التساهمية، الفلزية، الهيدروجينية).</li><li>الشريحة قابلة للتخطي إذا ضاق الوقت، لكنها تعالج أكثر مفهوم خاطئ تكراراً. الهشاشة في الأيونية ستعود في وحدة الترابط.</li></ul>'});

/* 9 density: packed atoms (book: dense because the atoms are close-packed; activity book worksheet 1-3 gives the densities) */
slide({id:'dens',ch:2,title:'الخاصية ١: الكثافة العالية',tag:'قارن وعدّ',
 html:function(){
  function dots(n,pack,seed){
    var R=rnd(seed), s='', i, x, y, r=11;
    for(i=0;i<n;i++){
      if(pack){ var row=Math.floor(i/6), col=i%6; x=30+col*24+(row%2?12:0); y=30+row*21 } else { x=20+R()*185; y=20+R()*92 }
      s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r+'" fill="'+(pack?'url(#gIon)':'#ffd9a0')+'" stroke="rgba(255,255,255,.5)" stroke-width="1"/>';
    }
    return s;
  }
  var box=function(t,n,pack,seed){return '<div class="col" style="align-items:center;gap:4px;flex:1"><div style="font-size:19px;font-weight:800">'+t+'</div><svg viewBox="0 0 230 135" width="230" style="background:rgba(0,0,0,.25);border-radius:12px;direction:ltr" aria-hidden="true"><defs><radialGradient id="gIon" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff2c9"/><stop offset=".45" stop-color="#dcb467"/><stop offset="1" stop-color="#8f6a2a"/></radialGradient></defs>'+dots(n,pack,seed)+'</svg></div>'};
  function L(n,v){return n+'<small style="display:block;font-size:15px;color:var(--muted);font-weight:700">'+v+'</small>'}
  var rows=[{lab:L('الماء','١٫٠'),parts:[[1.0,'left','']]},{lab:L('الصوديوم Na','٠٫٩٧'),parts:[[0.97,'left','']]},{lab:L('الألومنيوم Al','٢٫٧'),parts:[[2.7,'used','']]},{lab:L('الحديد Fe','٧٫٩'),parts:[[7.9,'used','']]},{lab:L('النحاس Cu','٨٫٩'),parts:[[8.9,'used','']]},{lab:L('الذهب Au','١٨٫٩'),parts:[[18.9,'used','']]}];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:520px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:10px 14px;gap:8px"><div style="display:flex;gap:12px">${box('ذرات متباعدة',10,false,4)}${box('ذرات الفلز المتراصة',30,true,1)}</div>
     <div style="display:flex;align-items:center;gap:12px;font-size:22px;font-weight:800;flex-wrap:wrap"><span>كم ضعفاً عدد الذرات في المربع الأيمن؟</span>${ninHTML('d1','×')}</div><div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الذرات (الأيونات) في الفلز <b>متراصة</b>: كتلة كبيرة في حجم صغير، فالكثافة <b>عالية</b>.</div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">الكثافة (g/mL):</div>
    <div class="panel" style="padding:12px 16px">${barsHTML('db',rows,19)}</div>
    <div class="sm" style="font-size:19px;line-height:1.4">معظم الفلزات أكثف من الماء بكثير. لكن <b>الصوديوم</b> أخف من الماء: ليست كل الفلزات كثيفة.</div></div></div>`;},
 init:function(el){
  bindNum($('.nin[data-n="d1"]',el),3,.01,function(ok){
    if(ok){ say($('.fb',el),'✓ ٣٠ ÷ ١٠ = ٣ أمثال','ok'); unhide(el) }
    else say($('.fb',el),'عدّ الذرات في كل مربع ثم اقسم','bad');
  });
 },
 enter:function(el){ later(function(){ $('#db',el).classList.add('go') },250) },
 note:'<ul><li>كتاب الطالب ص١٦: الفلزات «كثيفة لأن ذراتها متراصة»، والحديد قوي وصلب. عرضك: ألواح ألومنيوم وتراص الذرات. الامتحان: ٢٠٢٥/٢٠٢٦ الدور الأول س١ «أي مما يلي يفسّر كثافة الحديد المرتفعة حسب التركيب البنائي؟» والجواب: تقارب وتراص الذرات.</li><li>قيم الكثافة من جدول ورقة العمل ١-٣ في كتاب النشاط (Na ٠٫٩٧، Al ٢٫٧، Fe ٧٫٩، Cu ٨٫٩، Au ١٨٫٩ بالوحدة g/mL) والماء ١٫٠. الكثافة والشد ليستا في نص الهدف ٤-١ لكنها في الكتاب وفي عرضك، فأعلّمهما إثرائيتين.</li><li>الصوديوم أخف من الماء وهو فلز: هذا يعالج مفهوماً خاطئاً مذكوراً في الدليل (ليست كل الفلزات متينة وصلدة).</li></ul>'});

/* 10 melting and boiling points */
(function(){
  var MP=[['Li',181,1347],['Sn',232,2623],['Al',660,2467],['Ba',727,1850],['Ag',961,2155],['Cu',1084,2570]];   /* m.p. of Li (181) from the student book table of group I, Al (660) and Cu (1084) from activity-book worksheet 1-3; Sn, Ba, Ag and every b.p. come from the teacher's deck only */
  function bars(k){ return barsHTML('mb',MP.map(function(r){return {lab:'<span class="num">'+r[0]+'</span><small style="display:block;font-size:15px;color:var(--muted);font-weight:700">'+ar(r[k])+' °C</small>',parts:[[r[k],k===1?'used':'prod','']]}}),3000) }
  slide({id:'mpbp',ch:2,title:'الخاصية ٢: انصهار وغليان مرتفعان',tag:'اختر وتوقّع',
   html:function(){
    return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
      <div class="tabs2" id="tb"><button type="button" class="on" data-k="1">درجة الانصهار</button><button type="button" data-k="2">درجة الغليان</button></div>
      <div class="panel" style="padding:12px 16px" id="bw">${bars(1)}</div>
      <div class="sm" style="font-size:17px;color:var(--muted)">قيم تقريبية من عرض المعلم (°C). تختلف قليلاً بين المراجع.</div></div>
     <div class="col" style="width:400px;flex:none;gap:12px;justify-content:center">
      <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">أي هذه الفلزات يحتاج أكبر طاقة لينصهر؟</div>
       ${optsHTML([{t:'الليثيوم Li'},{t:'النحاس Cu'},{t:'القصدير Sn'}])}<div class="fb" style="min-height:26px"></div></div>
      <div class="gbar hide" id="gb" style="font-size:21px">الرابطة الفلزية <b>قوية</b>، فتحتاج طاقة كبيرة لكسرها: لذلك الفلزات <b>صلبة</b> في درجة حرارة الغرفة في الغالب.</div></div></div>`;},
   init:function(el){
    $$('#tb button',el).forEach(function(b){b.addEventListener('click',function(){
      $$('#tb button',el).forEach(function(x){x.classList.toggle('on',x===b)}); $('#bw',el).innerHTML=bars(+b.getAttribute('data-k')); later(function(){$('#mb',el).classList.add('go')},30);
    })});
    bindMcq($('#q',el),[{t:'',why:'انصهاره عند 181 °C فقط: الأقل بين الستة'},{t:'',ok:true,why:'صح: النحاس ينصهر عند نحو 1084 °C، أعلاها بين هذه الفلزات'},{t:'',why:'القصدير ينصهر عند 232 °C'}],$('.fb',el),function(){unhide(el)});
   },
   enter:function(el){ later(function(){$('#mb',el).classList.add('go')},120) },
   note:'<ul><li>كتاب الطالب ص١٦: الرابطة الفلزية القوية تعني درجات انصهار وغليان مرتفعة، ومعظم الفلزات صلبة في درجة حرارة الغرفة. سؤال ١-٢ (أ).</li><li>الأرقام: انصهار Li ‏١٨١ (جدول المجموعة I في كتاب الطالب) وAl ‏٦٦٠ وCu ‏١٠٨٤ (ورقة العمل ١-٣ في كتاب النشاط)، أما Sn ‏٢٣٢ وBa ‏٧٢٧ وAg ‏٩٦١ وكل درجات الغليان (Li ‏١٣٤٧، Sn ‏٢٦٢٣، Al ‏٢٤٦٧، Ba ‏١٨٥٠، Ag ‏٢١٥٥، Cu ‏٢٥٧٠) فمن جدول عرضك فقط وليست في كتبك الثلاثة. عرضك كان يكتب Li ‏١٨٠ وCu ‏١٠٨٣، وصحّحتهما حسب الكتب (قاعدتك: عند التعارض يُعتمد الكتاب). والأرقام عليها عبارة «قيم تقريبية».</li><li>الامتحانات: ٢٠٢٤/٢٠٢٥ الدور الثاني س١ (الكثافة والانصهار والتوصيل).</li></ul>'});
})();

/* 11 malleability: the hammer */
slide({id:'malle',ch:2,title:'الخاصية ٣: المرونة (الطرق والسحب)',tag:'اطرق',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div class="tabs2" id="tb"><button type="button" class="on" data-k="m">فلز</button><button type="button" data-k="i">مركّب أيوني (للمقارنة)</button></div>
    <div class="panel sim" style="padding:12px 18px;align-items:center;gap:8px"><div id="sm"></div>
     <div style="display:flex;gap:10px"><button type="button" class="btn acc" id="hm">اطرق 🔨</button><button type="button" class="btn" id="rs">من البداية</button></div></div></div>
   <div class="col" style="width:400px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px;min-height:150px"><div style="font-size:22px;font-weight:800;color:var(--gold)" id="mt">ماذا سيحدث عند الطرق؟</div><div class="sm" style="font-size:21px;line-height:1.5" id="mx">اضغط «اطرق» وراقب الطبقات.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الفلز <b>مرن</b>: تنزلق طبقاته فوق بعضها وتبقى الرابطة، فيُطرق ويُسحب دون أن يتحطم.</div></div></div>`;},
 init:function(el){
  var kind='m', hit=false, seen={m:false,i:false};
  function svg(){
    var rows=4, cols=6, g=56, r=18, W=(cols+1)*g, H=(rows+1)*g, R=rnd(6), s='<svg viewBox="0 0 '+W+' '+(H+20)+'" width="470" aria-hidden="true" style="direction:ltr;overflow:visible"><defs><radialGradient id="gIon" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff2c9"/><stop offset=".45" stop-color="#dcb467"/><stop offset="1" stop-color="#8f6a2a"/></radialGradient><radialGradient id="gAn" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#d9f1ff"/><stop offset=".5" stop-color="#6ca9e0"/><stop offset="1" stop-color="#2a5d95"/></radialGradient></defs>';
    var i,j;
    if(kind==='m'){ for(i=0;i<34;i++) s+='<circle class="el" cx="'+(g*.5+R()*(W-g))+'" cy="'+(g*.5+R()*(H-g))+'" r="5" fill="#7fd4ff" style="animation-delay:'+(R()*2).toFixed(2)+'s"/>' }
    for(i=0;i<rows;i++){
      s+='<g class="shiftrow" data-r="'+i+'">';
      for(j=0;j<cols;j++){
        var pos=kind==='m'||(i+j)%2===0, x=g*(j+1), y=g*(i+1);
        s+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(pos?'url(#gIon)':'url(#gAn)')+'" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/><text x="'+x+'" y="'+(y+r*.36)+'" text-anchor="middle" font-size="'+(r*1.05)+'" font-weight="800" fill="'+(pos?'#2a1d00':'#fff')+'" font-family="Cairo,sans-serif">'+(pos?'+':'−')+'</text>';
      }
      s+='</g>';
    }
    s+='<path class="crack" pathLength="100" d="M20 '+(g*2.5)+' L'+(W*.3)+' '+(g*2.5+10)+' L'+(W*.5)+' '+(g*2.5-8)+' L'+(W*.7)+' '+(g*2.5+12)+' L'+(W-20)+' '+(g*2.5)+'" fill="none"/>';
    return s+'</svg>';
  }
  function paint(){ hit=false; $('#sm',el).innerHTML=svg(); $('#sm',el).classList.remove('cracked'); $('#mt',el).textContent='ماذا سيحدث عند الطرق؟'; $('#mx',el).textContent='اضغط «اطرق» وراقب الطبقات.' }
  function hammer(){
    if(hit) return; hit=true;
    var g=56; $$('.shiftrow',el).forEach(function(r){ if(+r.getAttribute('data-r')<2) r.style.setProperty('--sh',g+'px') });
    if(kind==='m'){ $('#mt',el).textContent='الطبقات انزلقت وما انكسرت'; $('#mx',el).textContent='تنزلق طبقات الأيونات الموجبة فوق بعضها، وبحر الإلكترونات يظل يحيط بالأيونات، فتبقى الرابطة الفلزية قوية. الفلز يتشكّل ولا يتحطم.'; seen.m=true }
    else{ later(function(){ $('#sm',el).classList.add('cracked') },60); $('#mt',el).textContent='الطبقات انزلقت فتحطم البلّور'; $('#mx',el).textContent='بعد الانزلاق تتقابل أيونات متشابهة الشحنة فتتنافر، فينكسر البلّور: المركب الأيوني هش لا يُطرق.'; seen.i=true }
    if(seen.m&&seen.i) unhide(el);
  }
  $$('#tb button',el).forEach(function(b){b.addEventListener('click',function(){ $$('#tb button',el).forEach(function(x){x.classList.toggle('on',x===b)}); kind=b.getAttribute('data-k'); paint() })});
  $('#hm',el).addEventListener('click',hammer); $('#rs',el).addEventListener('click',paint); paint();
 },
 note:'<ul><li>كتاب الطالب ص١٦ وشكل ١-٢: عند التأثير بقوة تنزلق طبقات الأيونات الموجبة فوق بعضها دون أن تنكسر الرابطة، فالفلز قابل للطرق والسحب. إجابة سؤال ١-٢ (ب) في دليل المعلم. هدف ٤-١ يستعمل كلمة «مرنة».</li><li>مقارنة المركب الأيوني (الطبقة المنزلقة تقابل شحنات متشابهة فتتنافر) من أفكار الدليل: راجع الأيونية والتساهمية لمقارنة الترابط. الأيونية تُدرَّس في وحدة لاحقة، فاكتفِ هنا بالمقارنة السريعة.</li><li>الامتحانات: ٢٠٢٤/٢٠٢٥ الدور الثاني س٨ (فسّر قابلية النحاس للطرق مع رسم البنية الشبكية، ٤ درجات): «بسبب تحرك طبقات الأيونات المتماثلة الموجودة في النحاس بعضها فوق بعض دون أن يتفكك تركيبه البنائي، ولا يتفكك النحاس بسهولة بسبب قوة الرابطة الفلزية»؛ و٢٠٢٣/٢٠٢٤ الدور الأول س٨ (٥ درجات).</li></ul>'});

/* 12 conduction of electricity and heat */
slide({id:'cond',ch:2,title:'الخاصية ٤: التوصيل الكهربائي والحراري',tag:'أغلق الدائرة',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;align-items:center;justify-content:center">
    <div class="tabs2" id="tb"><button type="button" class="on" data-k="cu">سلك نحاس (فلز)</button><button type="button" data-k="s">كبريت (لافلز)</button></div>
    <div class="panel sim" style="padding:8px 14px;align-items:center;gap:6px"><svg id="cs" viewBox="0 0 720 300" width="700" aria-hidden="true" style="direction:ltr"></svg>
     <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn acc" id="sw1">أغلق الدائرة</button><button type="button" class="btn" id="ht">سخّن الطرف الأيسر 🔥</button></div></div></div>
   <div class="col" style="width:370px;flex:none;gap:10px;justify-content:center">
    <div class="panel compact" id="q" style="padding:10px 16px;gap:8px"><div style="font-size:21px;font-weight:800">ما الجسيمات التي تحمل الشحنة في الفلز؟</div>
     ${optsHTML([{t:'الإلكترونات الحرة'},{t:'الأيونات الموجبة'},{t:'الذرات المتعادلة'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الإلكترونات الحرة <b>تنقل الشحنة</b> (التيار) وتنقل <b>الطاقة الحرارية</b> بسرعة: لذلك الفلزات موصلة جيدة.</div></div></div>`;},
 init:function(el){
  var kind='cu', closed=false, heat=0, raf=0, last=0, E=[], t0=0, therm=0, seenOn=false, ans=false;
  var svg=$('#cs',el);
  function chk(){ if(ans&&seenOn&&heat>0) unhide(el) }
  function build(){
    var s='<defs><radialGradient id="gIon" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff2c9"/><stop offset=".45" stop-color="#dcb467"/><stop offset="1" stop-color="#8f6a2a"/></radialGradient><radialGradient id="gS" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff7b0"/><stop offset=".5" stop-color="#e6cf3a"/><stop offset="1" stop-color="#9a8a14"/></radialGradient></defs>';
    s+='<path d="M160 110H90V250H300 M420 250H630V215 M630 150V110H560" fill="none" stroke="#aebbc4" stroke-width="5" stroke-linecap="round"/>';
    s+='<rect x="160" y="62" width="400" height="96" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.4)" stroke-width="2"/>';
    var i,j;
    for(i=0;i<2;i++)for(j=0;j<9;j++){ s+= kind==='cu'?'<circle cx="'+(190+j*45)+'" cy="'+(92+i*40)+'" r="14" fill="url(#gIon)" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/><text x="'+(190+j*45)+'" y="'+(97+i*40)+'" text-anchor="middle" font-size="15" font-weight="800" fill="#2a1d00" font-family="Cairo,sans-serif">+</text>':'<circle cx="'+(190+j*45)+'" cy="'+(92+i*40)+'" r="15" fill="url(#gS)" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>'; }
    s+='<g id="els"></g>';
    s+='<rect x="300" y="232" width="120" height="36" rx="6" fill="#16355f" stroke="rgba(255,255,255,.6)" stroke-width="2"/><text x="318" y="258" fill="#ff9a85" font-size="24" font-weight="800" font-family="Cairo,sans-serif">−</text><text x="392" y="258" fill="#a6f28a" font-size="24" font-weight="800" font-family="Cairo,sans-serif">+</text><text x="360" y="256" text-anchor="middle" fill="#fff" font-size="14" font-family="Cairo,sans-serif">بطارية</text>';
    s+='<g id="bulb" class="bulb"><circle cx="630" cy="182" r="30" fill="#2a3a52" stroke="#cfd9e6" stroke-width="3" id="bc"/><path d="M618 190q12-22 24 0" fill="none" stroke="#cfd9e6" stroke-width="3"/></g>';
    s+='<text x="630" y="240" text-anchor="middle" font-size="15" fill="#cfe" font-family="Cairo,sans-serif">مصباح</text>';
    s+='<rect x="590" y="60" width="26" height="100" rx="13" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.5)" stroke-width="2"/><rect id="th" x="596" y="150" width="14" height="4" rx="6" fill="#ff6a55"/><text x="603" y="52" text-anchor="middle" font-size="13" fill="#fff" font-family="Cairo,sans-serif">ميزان حرارة</text>';
    svg.innerHTML=s;
    E=[]; var R=rnd(8); if(kind==='cu'){ for(i=0;i<22;i++){ E.push({x:175+R()*370,y:75+R()*70,ph:R()*6,vx:0}) } }
    var g=$('#els',svg); g.innerHTML=E.map(function(){return '<circle r="5" fill="#7fd4ff" stroke="rgba(0,0,0,.4)" stroke-width="1"/>'}).join('');
    paint(0);
  }
  function paint(dt){
    var g=$('#els',svg); if(!g) return; var cs=g.childNodes, k;
    for(k=0;k<E.length;k++){
      var e=E[k], hot=heat?(e.x<175+heat*390?1:.3):0, amp=1+hot*3.2;
      e.ph+=dt*(4+hot*5);
      if(closed&&kind==='cu') e.x+=dt*55; if(e.x>548) e.x=170;
      var px=e.x+Math.sin(e.ph)*3*amp, py=e.y+Math.cos(e.ph*1.3)*3*amp; py=Math.max(72,Math.min(148,py));
      cs[k].setAttribute('cx',px.toFixed(1)); cs[k].setAttribute('cy',py.toFixed(1));
    }
    var on=closed&&kind==='cu'; $('#bc',svg).setAttribute('fill',on?'#ffe08a':'#2a3a52'); $('#bulb',svg).classList.toggle('on',on); if(on) seenOn=true;
    if(heat){ heat=Math.min(1,heat+dt*.22); if(heat>.9) therm=Math.min(1,therm+dt*.4) }
    $('#th',svg).setAttribute('y',150-therm*80); $('#th',svg).setAttribute('height',4+therm*80);
    chk();
  }
  function loop(ts){ var dt=last?Math.min(.05,(ts-last)/1000):0; last=ts; paint(dt); raf=requestAnimationFrame(loop) }
  function start(){ if(!raf){ last=0; raf=requestAnimationFrame(loop) } }
  function stop(){ if(raf){ cancelAnimationFrame(raf); raf=0 } }
  el._start=start; el._stop=stop;
  $$('#tb button',el).forEach(function(b){b.addEventListener('click',function(){ $$('#tb button',el).forEach(function(x){x.classList.toggle('on',x===b)}); kind=b.getAttribute('data-k'); closed=false; heat=0; therm=0; $('#sw1',el).textContent='أغلق الدائرة'; build() })});
  $('#sw1',el).addEventListener('click',function(){ closed=!closed; this.textContent=closed?'افتح الدائرة':'أغلق الدائرة' });
  $('#ht',el).addEventListener('click',function(){ if(kind==='cu'&&!heat){ heat=.02; therm=0 } });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: الإلكترونات الحرة هي التي تتحرك'},{t:'',why:'الأيونات الموجبة ثابتة في أماكنها في الشبكة'},{t:'',why:'الفلز لا يتحرك فيه ذرات متعادلة منفصلة'}],$('.fb',el),function(){ans=true; chk()});
  build();
 },
 enter:function(el){ if(el._start) el._start() }, leave:function(el){ if(el._stop) el._stop() },
 note:'<ul><li>كتاب الطالب ص١٦ وشكل ١-٣ (دائرة اختبار التوصيل بنحاس): الإلكترونات غير المتمركزة تتحرك فتنقل الشحنة. النحاس موصل ممتاز للحرارة والكهرباء. إجابة سؤال ١-٢ (ج): الإلكترونات غير المتمركزة حرة الحركة وتنقل الشحنة عبر البنية.</li><li>دليل المعلم: أعد توضيح خاصية التوصيل الكهربائي للفلزات مقارنة باللافلزات. الكبريت لافلز لا إلكترونات حرة فيه، فلا يضيء المصباح.</li><li>الامتحانات: ٢٠٢٤/٢٠٢٥ الدور الأول س٤ (ب)، و٢٠٢٢/٢٠٢٣ الدور المسائي س٢ (ب): الإلكترونات الحرة تفسّر التوصيل. هذه المحاكاة تخطيطية.</li></ul>'});

/* 13 misconceptions: true or false (teacher's guide, misconceptions) */
slide({id:'myth',ch:2,title:'صح أم خطأ؟',tag:'مفاهيم خاطئة',
 html:function(){
  var items=[['كل الفلزات صلبة وقوية جداً','f','خطأ: الصوديوم لين يُقطع بالسكين، والزئبق سائل'],['تتحرك الأيونات الموجبة في الفلز فتحمل التيار الكهربائي','f','خطأ: الإلكترونات الحرة هي التي تتحرك، والأيونات ثابتة في الشبكة'],['الرابطة الفلزية هي الرابطة الأيونية نفسها','f','خطأ: الأيونية بين أيونات موجبة وسالبة، والفلزية بين أيونات موجبة وإلكترونات حرة'],['قطعة الفلز تحمل شحنة موجبة','f','خطأ: الفلز متعادل، فشحنة الإلكترونات السالبة تلغي شحنة الأيونات الموجبة'],['تحتاج الرابطة الفلزية طاقة كبيرة لتنكسر','t','صح: ولذلك ترتفع درجتا الانصهار والغليان']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="clsw">${clsHTML(items,[['t','صح'],['f','خطأ']],26)}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:300px;flex:none;gap:12px;justify-content:center"><div class="gbar hide" id="gb" style="font-size:21px">صحّحنا المفاهيم الخاطئة الشائعة عن الفلزات.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: ماذا تعلّمنا عن الإلكترونات الحرة؟') },
 note:'<ul><li>دليل المعلم (المفاهيم الخاطئة): «لا يُعدّ الفلزّات جميعها متينة وصلدة. لذلك أدر مناقشة شاملة... ومن الأفكار الخاطئة التباس مفهوم الترابط الفلزي بالصيغة البنائية الأيونية الضخمة». الصوديوم لين (كتاب الطالب ص٢٠). الزئبق فلز سائل في درجة الغرفة (ورقة العمل ١-٣ في كتاب النشاط).</li><li>العبارة الرابعة (الفلز متعادل) من صياغتي: تعالج التباساً شائعاً ولم أجدها نصاً في المصادر.</li></ul>'});

/* 14 summary: the property and its reason */
slide({id:'sum',ch:2,title:'خلاصة: الخاصية وسببها',tag:'اجمع',
 html:function(){
  var items=[['الكثافة العالية','الأيونات متراصة بجانب بعضها.'],['الانصهار والغليان المرتفعان','الرابطة الفلزية قوية وتحتاج طاقة كبيرة لكسرها.'],['المرونة (الطرق والسحب)','تنزلق الطبقات فوق بعضها وبحر الإلكترونات يحفظ الرابطة.'],['التوصيل الكهربائي','الإلكترونات الحرة تتحرك وتنقل الشحنة.'],['التوصيل الحراري','الإلكترونات الحرة تنقل الطاقة الحرارية بسرعة.'],['القوة والمتانة','الرابطة الفلزية القوية تمسك الشبكة معاً (مثل الحديد).']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:300px;flex:none;gap:10px;justify-content:center"><img class="pic" alt="خصائص الفلزات: الطرق والتوصيل الكهربائي والحراري وسحب الأسلاك" src="${pic('p_m_collage')}"><div class="sm" style="font-size:18px;color:var(--muted);text-align:center">صور تطبيقات خصائص الفلزات.</div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">اضغط على كل خاصية لتعرف سببها:</div>
    ${cardsHTML(items,'two')}
    <div class="gbar hide" id="gb" style="font-size:21px">السبب واحد: <b>أيونات موجبة في بحر من الإلكترونات الحرة</b>.</div></div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>جدول الخلاصة من عرض NotebookLM (مصفوفة الخاصية والسبب) ومن ملخص الصفحات السبع. الكثافة والمتانة (الشد) ليستا في نص هدف ٤-١، لكنهما في الكتاب وفي عرضك، وهما إثرائيتان.</li></ul>'});

/* 15 explain (علّل) */
(function(){
  var items=[
   {q:'<b>علّل:</b> يُستخدم النحاس في صنع الأسلاك الكهربائية.',opts:[{t:'لأنه موصل جيد للكهرباء (إلكتروناته الحرة تنقل الشحنة) وقابل للسحب أسلاكاً',ok:true,why:'التوصيل الجيد والقابلية للسحب'},{t:'لأنه يتحطم بسهولة عند الطرق',why:'الفلزات تُطرق ولا تتحطم'},{t:'لأن كثافته أقل من كل الفلزات',why:'الكثافة ليست سبب الاستخدام هنا'}]},
   {q:'<b>علّل:</b> يُستخدم النحاس في صنع أواني الطهي.',opts:[{t:'لأنه موصل جيد للحرارة',ok:true,why:'يوصل الحرارة من اللهب إلى الطعام بسرعة'},{t:'لأنه لا يوصل الحرارة',why:'الفلزات موصلة جيدة للحرارة'},{t:'لأنه لا ينصهر أبداً',why:'ينصهر عند نحو 1084 °C'}]},
   {q:'<b>علّل:</b> تُستخدم الأسلاك المصنوعة من الألومنيوم في خطوط نقل الكهرباء الهوائية.',opts:[{t:'لأنه موصل جيد وكثافته أقل من النحاس فهو أخف',ok:true,why:'أخف من النحاس، فتحمله الأبراج بسهولة'},{t:'لأنه لا يوصل الكهرباء فهو آمن',why:'الألومنيوم موصل جيد'},{t:'لأن كثافته أعلى من كثافة النحاس',why:'كثافته أقل: ٢٫٧ مقابل ٨٫٩'}]}
  ];
  slide({id:'why',ch:2,title:'علّل: استخدامات الفلزات',tag:'تطبيق',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'why')},
   note:'<ul><li>علّل في عرضك وعرض NotebookLM والصفحات السبع: النحاس في الأسلاك والأواني، والألومنيوم في خطوط الكهرباء الهوائية. كتاب الطالب ص١٦: النحاس موصل ممتاز للحرارة والكهرباء، والألومنيوم يُستخدم في الخطوط الهوائية لأن كثافته أقل من النحاس.</li><li>الأبراج في الصورة من الفولاذ، وأما الأسلاك التي بينها فمن الألومنيوم (غالباً بقلب من الفولاذ).</li></ul>'});
})();
