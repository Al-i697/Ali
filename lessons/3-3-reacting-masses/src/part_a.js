/* ---------- reacting masses, part A: the cover, the sandwich idea, and finding a formula from masses (deck slides 1 to 5) ---------- */

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يستنبط الصيغة الكيميائية لمركب من كتل العناصر المندمجة: كتلة ثم مولات ثم أبسط نسبة.',
   'يحدد المادة المحددة للتفاعل والمادة الفائضة بمقارنة (عدد المولات ÷ المعامل).',
   'يحسب كتلة المادة الفائضة المتبقية وكتلة الناتج بعد التفاعل.',
   'يحسب كتلة مادة ناتجة أو متفاعلة من معادلة موزونة بثلاث خطوات.',
   'يفسّر نتائج نشاط ٣-٢: نسبة المولات بين كربونات الصوديوم وثاني أكسيد الكربون.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:24px 30px 22px;justify-content:center;gap:10px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">تمهيد</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;line-height:1.12"><span class="num" style="color:var(--gold)">3-3</span> حسابات تتضمن <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">كتلاً متفاعلة</span></h1>
    <p style="margin:0 0 4px;font-size:27px;font-weight:700;color:var(--muted)">تحديد الصيغة الكيميائية والمادة المحددة للتفاعل</p>
    <p style="font-size:24px;font-weight:700;line-height:1.4;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:340px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
    <img class="pic fade" src="${IMG.sandwich}" alt="" style="width:330px;max-width:none">
    <div class="bigeq" style="font-size:42px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5)">Fe + S → FeS</div>
    <div class="sm" style="font-size:22px;text-align:center">من أين نعرف كم يتفاعل وكم يبقى؟</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من دليل المعلم للموضوع ٣-٣ (٦-٨) بصياغة مبسطة، مع نشاط ٣-٢ الإثرائي. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li></ul>'});

/* the sandwich playground, shared by the two sandwich slides: b bread, c cheese, a sandwich takes rb bread and rc cheese */
function sandState(b,c,rb,rc){
  var s=Math.min(Math.floor(b/rb),Math.floor(c/rc)), x=b/rb, y=c/rc;
  return {s:s,lb:b-rb*s,lc:c-rc*s,x:x,y:y,lim:x<y?'b':(y<x?'c':'')};
}
function sandSVG(b,c,rb,rc){
  var st=sandState(b,c,rb,rc), o='', i, j, seq, x, y, nb, nc;
  function bread(x,y){return '<rect x="'+x+'" y="'+y+'" width="62" height="21" rx="9" fill="#F0D4A0" stroke="#A8742E" stroke-width="2.5"/><path d="M'+(x+9)+' '+(y+7)+'H'+(x+53)+'" stroke="#fff4d8" stroke-width="3" stroke-linecap="round" opacity=".75"/>'}
  function cheese(x,y){return '<rect x="'+(x+2)+'" y="'+y+'" width="58" height="12" rx="3" fill="#FFD23F" stroke="#C99A00" stroke-width="2"/><circle cx="'+(x+16)+'" cy="'+(y+6)+'" r="2.4" fill="#C99A00"/><circle cx="'+(x+42)+'" cy="'+(y+6)+'" r="2.4" fill="#C99A00"/>'}
  for(i=0;i<st.s;i++){
    x=470-(i+1)*72+4; y=168; nb=rb; nc=rc; seq=[];
    while(nb>0||nc>0){ if(nb>0){seq.push('b'); nb--} if(nc>0){seq.push('c'); nc--} }
    for(j=0;j<seq.length;j++){ y-=(seq[j]==='b'?23:14); o+=seq[j]==='b'?bread(x,y):cheese(x,y) }
  }
  for(i=0;i<st.lb;i++) o+=bread(8,168-(i+1)*23);
  for(i=0;i<st.lc;i++) o+=cheese(80,168-(i+1)*14);
  return '<svg viewBox="0 24 470 154" width="100%" style="max-height:160px" aria-hidden="true"><line x1="4" y1="172" x2="466" y2="172" stroke="rgba(var(--t2),.5)" stroke-width="2"/>'+o+'</svg>';
}
function sandPlay(id,rb,rc,b0,c0){
  var div=rb>1||rc>1;
  return `<div class="frm brk" id="${id}" style="padding:12px 22px 12px;gap:8px">
   <div style="display:flex;gap:30px;justify-content:center;align-items:center;flex-wrap:wrap">
    ${[['b','خبز'],['c','جبن']].map(function(t){return `<div class="ctr"><span class="ctl">${t[1]}</span><button type="button" data-t="${t[0]}" data-d="-1" aria-label="أنقص ${t[1]}">−</button><b class="num" data-v="${t[0]}">${t[0]==='b'?b0:c0}</b><button type="button" data-t="${t[0]}" data-d="1" aria-label="زِد ${t[1]}">+</button></div>`}).join('')}
   </div>
   <div class="sandsvg"></div>
   <div class="sandtxt lead" style="margin:0;font-size:25px;text-align:center"></div>
   ${div?'<div class="sanddiv" style="display:flex;gap:16px;justify-content:center;font-size:24px;font-weight:700;direction:ltr"></div>':''}
   <div class="chips" style="justify-content:center;gap:12px"><span class="chip sandtag lim">المحددة (الأقل): <b></b></span><span class="chip sandtag exc">الفائضة (الأكثر): <b></b></span></div>
  </div>`;
}
function bindSand(el,id,rb,rc,b0,c0){
  var root=$('#'+id,el), v={b:b0,c:c0};
  function paint(){
    var st=sandState(v.b,v.c,rb,rc), nm={b:'الخبز',c:'الجبن'};
    $('.sandsvg',root).innerHTML=sandSVG(v.b,v.c,rb,rc);
    $$('b[data-v]',root).forEach(function(n){n.textContent=v[n.getAttribute('data-v')]});
    var lo=[]; if(st.lb) lo.push(ar(st.lb)+' خبز'); if(st.lc) lo.push(ar(st.lc)+' جبن');
    $('.sandtxt',root).innerHTML='نصنع <b class="num" style="color:var(--gold)">'+ar(st.s)+'</b> '+(st.s===1?'سندويشة':'سندويشات')+(lo.length?' ويبقى: '+lo.join(' و'):' ولا يبقى شيء');
    var dv=$('.sanddiv',root); if(dv) dv.innerHTML='<span'+(st.lim==='b'?' style="color:var(--gold)"':'')+'>'+v.b+' ÷ '+rb+' = '+(+st.x.toFixed(2))+'</span><span'+(st.lim==='c'?' style="color:var(--gold)"':'')+'>'+v.c+' ÷ '+rc+' = '+(+st.y.toFixed(2))+'</span>';
    var L=$('.sandtag.lim b',root), E=$('.sandtag.exc b',root);
    L.textContent=st.lim?nm[st.lim]:'لا يوجد'; E.textContent=st.lim?nm[st.lim==='b'?'c':'b']:'لا يوجد';
  }
  $$('.ctr button',root).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); v[t]=Math.max(0,Math.min(6,v[t]+ +b.getAttribute('data-d'))); paint()})});
  paint();
}

/* 2 sandwich: one slice of bread and one of cheese make a sandwich */
slide({id:'sand1',ch:1,title:'ماذا لو كان…؟',tag:'توقّع ثم جرّب',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:470px;flex:none;gap:10px;justify-content:center">
   <div style="display:flex;gap:14px;align-items:center;justify-content:center"><img class="pic" src="${IMG.bread3}" alt="" style="height:104px"><img class="pic" src="${IMG.cheese2}" alt="" style="height:88px"></div>
   <div class="panel" style="padding:12px 18px;gap:6px"><p class="lead" style="margin:0;font-size:25px">لديك <b class="num">3</b> قطع خبز وقطعتان من الجبن. السندويشة = قطعة خبز + قطعة جبن. كم سندويشة تصنع؟</p>
    ${optsHTML([{t:'سندويشة واحدة'},{t:'سندويشتان'},{t:'ثلاث سندويشات'},{t:'خمس سندويشات'}])}<div class="fb" style="min-height:26px"></div></div>
  </div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">${sandPlay('pg1',1,1,3,2)}
   <div class="gbar hide" id="gb" style="font-size:23px">الجبن <b>أقل</b> فهو يحدد عدد السندويشات: <b>المادة المحددة</b>. والخبز يزيد: <b>المادة الفائضة</b>.</div></div></div>`;},
 init:function(el){
  bindSand(el,'pg1',1,1,3,2);
  bindMcq($('.panel',el),[{t:'',why:'جرّب على اليمين: الجبن ينتهي بعد سندويشتين'},{t:'',ok:true,why:'صح: كل سندويشة تحتاج قطعة جبن، ولا يوجد إلا قطعتان'},{t:'',why:'لا يكفي الجبن لثلاث سندويشات'},{t:'',why:'عدد القطع الكلي ليس هو المهم'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>عرضك (شريحة ٢): ٣ خبز وقطعتا جبن. الجواب سندويشتان ويبقى خبز واحد: الكمية الفائضة = ٣ − ٢ = ١.</li><li>في عرضك ورد «٤ − ٣ = ١» بجانب سؤال زيادة قطعة، وهو لا يطابق المسألة؛ هنا يُغيَّر العدد بالأزرار ويظهر الفائض مباشرة.</li><li>جرّب مع الطلاب: ٣ خبز و٣ جبن، ثم ٠ جبن.</li></ul>'});

/* 3 sandwich again, but a real sandwich needs two slices of bread: counting is not enough */
slide({id:'sand2',ch:1,title:'وإذا كانت الوصفة مختلفة؟',tag:'فكّر',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:470px;flex:none;gap:10px;justify-content:center">
   <img class="pic" src="${IMG.sandwich}" alt="" style="height:120px;align-self:center">
   <div class="panel" style="padding:12px 18px;gap:6px"><p class="lead" style="margin:0;font-size:25px">السندويشة الحقيقية = <b class="num">2</b> خبز + <b class="num">1</b> جبن. لديك <b class="num">3</b> خبز و<b class="num">2</b> جبن. ما المادة المحددة؟</p>
    ${optsHTML([{t:'الجبن لأنه الأقل عدداً'},{t:'الخبز'},{t:'كلاهما'}])}<div class="fb" style="min-height:26px"></div></div>
  </div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">${sandPlay('pg2',2,1,3,2)}
   <div class="gbar hide" id="gb" style="font-size:23px">لا ننظر إلى عدد القطع فقط. نقسم كل عدد على <b>معامله</b> في الوصفة، والأقل هو <b>المحدد</b>. وهذا ما سنفعله مع المعادلات.</div></div></div>`;},
 init:function(el){
  bindSand(el,'pg2',2,1,3,2);
  bindMcq($('.panel',el),[{t:'',why:'جرّب: الخبز هنا يكفي لسندويشة واحدة فقط (٣ ÷ ٢ = ١٫٥)'},{t:'',ok:true,why:'صح: ٣ ÷ ٢ = ١٫٥ أقل من ٢ ÷ ١ = ٢'},{t:'',why:'ليس لهما نفس الحدّ؛ قارن الأرقام الذهبية على اليمين'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>إضافة مني لتبرير القسمة على المعامل: الوصفة ٢ خبز : ١ جبن مثل المعامل ٢ : ١ في المعادلة. الخبز أكثر عدداً (٣) لكنه المحدد.</li><li>اجعلهم يغيّرون الأعداد ويراقبون أي رقم يصير ذهبياً: هو المحدد.</li></ul>'});

/* 4 the three steps of finding a formula */
slide({id:'steps3',ch:2,title:'تحديد الصيغة الكيميائية باستخدام الكتل المتفاعلة',tag:'رتّب الخطوات',
 html:function(){return `<div class="col grow" style="gap:12px;justify-content:flex-start">
  <div style="display:flex;flex-direction:column;gap:10px">${[1,2,3].map(function(n,i){return `<div style="display:flex;align-items:center;gap:12px"><div class="mk" style="width:50px;height:50px;border-radius:14px;display:grid;place-items:center;font-size:27px;flex:none">${ar(n)}</div><div class="mslot slot" data-k="${i}" style="flex:1;min-height:76px"><span class="ph" style="font-size:21px">اسحب الخطوة المناسبة إلى هنا</span></div></div>`}).join('')}</div>
  <div class="imp-tray" id="tray" style="display:flex;flex-direction:column;gap:8px"></div>
  <div class="fb" style="text-align:center;min-height:28px"></div>
  <div class="gbar hide" id="gb">كتل العناصر ← <b>مولات</b> (÷ M) ← <b>أبسط نسبة</b> (÷ الأقل) ← الصيغة</div></div>`;},
 init:function(el){
  bindMatch(el,[[2,'جد أبسط نسبة أعداد صحيحة <span class="sm">(بالقسمة على أقل عدد مولات)</span>'],[0,'جد كتل العناصر التي تندمج <span class="sm">(تُعطى أو تُطلب من السؤال)</span>'],[1,'جد عدد مولات الذرات لكل عنصر يندمج <span class="sm">(بقسمة الكتلة على الكتلة المولية)</span>']],{css:'font-size:23px;padding:10px 18px',bad:'فكّر: ماذا نحتاج أولاً قبل أن نحسب المولات؟'});
 },
 note:'<ul><li>عرضك (شريحة ٣): ١ كتل العناصر التي تندمج، ٢ مولات كل عنصر، ٣ أبسط نسبة أعداد صحيحة.</li><li>بعد الترتيب نطبّقها على Mg/O ثم Si/O ثم سؤال امتحان.</li></ul>'});

/* 5 magnesium oxide */
slide({id:'mgo',ch:2,title:'صيغة أكسيد الماغنيسيوم',tag:'أكمل الجدول',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="panel" style="padding:12px 18px"><p class="lead" style="margin:0;font-size:24px">عند حرق <b class="num">0.24 g</b> من الماغنيسيوم تكوّن <b class="num">0.40 g</b> من أكسيد الماغنيسيوم، فاندمج معه <b class="num">0.16 g</b> من الأكسجين (نشاط ٣-١).</p></div>
   ${formulaTable('a',[{sym:'Mg',mass:0.24},{sym:'O',mass:0.16}],[['MgO',1,'MgO: ذرة Mg مقابل ذرة O'],['Mg2O',0,'النسبة ١ : ١ وليست ٢ : ١'],['MgO2',0,'النسبة ١ : ١ وليست ١ : ٢']])}</div>
  <div class="col" style="width:300px;flex:none;align-items:center;justify-content:center;gap:12px"><svg viewBox="0 0 220 220" width="250" aria-hidden="true"><g class="sph"><circle cx="75" cy="110" r="46" fill="url(#gMg)" stroke="rgba(0,0,0,.3)" stroke-width="2"/><text x="75" y="118" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="30" fill="#06223d">Mg</text></g><g class="sph"><circle cx="150" cy="110" r="32" fill="url(#gO)" stroke="rgba(0,0,0,.3)" stroke-width="2"/><text x="150" y="119" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="28" fill="#fff">O</text></g></svg>
   <div class="bigeq" style="font-size:44px;color:var(--gold)">1 : 1</div></div></div>`;},
 init:function(el){
  bindFormula(el,'a',[{sym:'Mg',mass:0.24},{sym:'O',mass:0.16}],[['MgO',1,'MgO: ذرة Mg مقابل ذرة O'],['Mg2O',0,'النسبة ١ : ١ وليست ٢ : ١'],['MgO2',0,'النسبة ١ : ١ وليست ١ : ٢']]);
 },
 note:'<ul><li>عرضك (شريحة ٤): ٠٫٢٤ g Mg و٠٫١٦ g O، الكتلة المولية ٢٤ و١٦، المولات ٠٫٠١ و٠٫٠١، النسبة ١ : ١، الصيغة MgO.</li><li>الخانات تُفتح بالترتيب: مولات Mg ثم O ثم النسبة ثم الصيغة.</li></ul>'});

/* 6 silicon dioxide: the mass of oxygen is found by subtraction */
slide({id:'sio2',ch:2,title:'صيغة ثنائي أكسيد السيليكون',tag:'أكمل الجدول',
 html:function(){return `<div class="col grow" style="gap:10px;justify-content:center">
  <div class="panel" style="padding:12px 18px"><p class="lead" style="margin:0;font-size:24px">عينة كتلتها <b class="num">10.0 g</b> من ثنائي أكسيد السيليكون تحتوي على <b class="num">4.7 g</b> من السيليكون. جد كتلة الأكسجين أولاً.</p></div>
  ${formulaTable('b',[{sym:'Si',mass:4.7},{sym:'O',mass:null}],[['SiO',0,'النسبة ١ : ٢ وليست ١ : ١'],['SiO2',1,'SiO₂ تركيب جزيئي ضخم، والصيغة هي الأبسط'],['Si2O',0,'النسبة ١ : ٢ وليست ٢ : ١']])}</div>`;},
 init:function(el){
  bindFormula(el,'b',[{sym:'Si',mass:4.7},{sym:'O',mass:null,mass2:5.3,msg:'10.0 − 4.7 = 5.3 g',hint:'اطرح كتلة السيليكون من كتلة العينة'}],[['SiO',0,'النسبة ١ : ٢ وليست ١ : ١'],['SiO2',1,'SiO₂ تركيب جزيئي ضخم، والصيغة هي الأبسط'],['Si2O',0,'النسبة ١ : ٢ وليست ٢ : ١']]);
 },
 note:'<ul><li>عرضك (شريحة ٥): كتلة O = ١٠٫٠ − ٤٫٧ = ٥٫٣ g، المولات ٠٫١٦٨ و٠٫٣٣١، النسبة ١ : ٢ (٠٫٣٣١ ÷ ٠٫١٦٨ ≈ ١٫٩٧)، الصيغة SiO₂.</li><li>كتاب الطالب (ص٦٢): ثنائي أكسيد السيليكون تركيب جزيئي ضخم نكتب صيغته بأبسط نسبة.</li></ul>'});

/* 7 exam item: nitrogen and oxygen */
slide({id:'noo',ch:2,title:'سؤال امتحان: صيغة مركب النيتروجين والأكسجين',tag:'من امتحان 2023/2024',
 html:function(){return `<div class="col grow" style="gap:10px;justify-content:center">
  <div class="panel" style="padding:12px 18px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">2023/2024 · الدور الأول · السؤال ٢٢</div><p class="lead" style="margin:4px 0 0;font-size:25px">استنتج الصيغة الكيميائية لمركب يحتوي على <b class="num">32.5 g</b> من الأكسجين و<b class="num">14.45 g</b> من النيتروجين.</p></div>
  ${formulaTable('c',[{sym:'N',mass:14.45},{sym:'O',mass:32.5}],[['NO',0,'النسبة ١ : ٢ وليست ١ : ١'],['NO2',1,'NO₂: ذرة N مقابل ذرتي O'],['N2O',0,'النسبة ١ : ٢ وليست ٢ : ١']])}</div>`;},
 init:function(el){
  bindFormula(el,'c',[{sym:'N',mass:14.45},{sym:'O',mass:32.5}],[['NO',0,'النسبة ١ : ٢ وليست ١ : ١'],['NO2',1,'NO₂: ذرة N مقابل ذرتي O'],['N2O',0,'النسبة ١ : ٢ وليست ٢ : ١']]);
 },
 note:'<ul><li>سؤال حقيقي من امتحان ٢٠٢٣/٢٠٢٤ الدور الأول (سؤال ٢٢). نموذج الإجابة: المولات ١٫٠٣ و٢٫٠٣، أبسط نسبة ١ : ٢، الصيغة NO₂.</li><li>الدرجة تُمنح بخطوات الحل لا بالناتج وحده.</li></ul>'});

/* 7b water of crystallisation: the same three steps with the masses of a heated salt (activity book worksheet 3-4) */
slide({id:'bacl',ch:2,title:'ماء التبلور: قيمة x في BaCl₂·xH₂O',tag:'ورقة العمل ٣-٤',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:flex-start">
   <div class="frm brk" style="padding:10px 16px;gap:4px"><p class="lead" style="margin:0;font-size:21px">سُخّنت بلورات كلوريد الباريوم المميهة في بوتقة خزفية حتى فقدت ماءها:</p>
    <div style="display:grid;grid-template-columns:1fr auto;gap:2px 14px;font-size:20px;font-weight:700"><span>كتلة البوتقة الفارغة</span><span class="num">117.8 g</span><span>البوتقة مع BaCl₂·xH₂O</span><span class="num">125.9 g</span><span>البوتقة بعد التسخين</span><span class="num">124.7 g</span></div></div>
   ${qline('كتلة BaCl<sub>2</sub>·xH<sub>2</sub>O قبل التسخين',[['w1','g','m =']])}
   ${qline('كتلة BaCl<sub>2</sub> بعد التسخين',[['w2','g','m =']])}
   ${qline('كتلة الماء المفقودة',[['w3','g','m =']])}
   <div class="fb" style="text-align:center;min-height:24px"></div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:flex-start">
   ${arStrip(['Ba','Cl','H','O'])}
   ${qline('Mr لـ BaCl<sub>2</sub> (Ba = 137, Cl = 35.5)',[['w4','g/mol','Mr =']])}
   ${qline('n(BaCl<sub>2</sub>)',[['w5','mol','n =']])}
   ${qline('n(H<sub>2</sub>O) (Mr = 18)',[['w6','mol','n =']])}
   ${qline('x = n(H<sub>2</sub>O) ÷ n(BaCl<sub>2</sub>)',[['w7','','x =']])}
   <div class="panel hide" id="q2" style="padding:8px 14px;gap:4px"><div style="font-size:21px;font-weight:800">كيف نتأكد أن كل الماء فُقد؟</div>${optsHTML([{t:'نسخّن ثانية ونزن حتى تثبت الكتلة'},{t:'نزيد كمية الملح'},{t:'نبرّد البوتقة فقط'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:6px"')}<div class="fb q2fb" style="min-height:20px"></div></div></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'w1',a:8.1,t:0.05,w:'✓ 125.9 − 117.8 = 8.1 g',h:'اطرح كتلة البوتقة الفارغة'},{n:'w2',a:6.9,t:0.05,w:'✓ 124.7 − 117.8 = 6.9 g',h:'البوتقة بعد التسخين ناقص الفارغة'},{n:'w3',a:1.2,t:0.03,w:'✓ 8.1 − 6.9 = 1.2 g (أو 125.9 − 124.7)',h:'الفرق بين الكتلتين'},{n:'w4',a:208,t:1.7,w:'✓ 137 + 2 × 35.5 = 208 g/mol',h:'137 + (2 × 35.5)'},{n:'w5',a:6.9/208,t:0.0004,w:'✓ 6.9 ÷ 208 = 0.0332 mol',h:'n = m ÷ Mr'},{n:'w6',a:1.2/18,t:0.0008,w:'✓ 1.2 ÷ 18 = 0.0667 mol',h:'Mr(H₂O) = 18'},{n:'w7',a:2,t:0.1,w:'✓ 0.0667 ÷ 0.0332 ≈ 2 ← BaCl₂·2H₂O',h:'اقسم عدد مولات الماء على عدد مولات BaCl₂'}],$('.fb',el),function(){ var q=$('#q2',el); q.classList.remove('hide'); q.classList.add('up') });
  bindMcq($('#q2',el),[{t:'',ok:true,why:'صح: إذا ثبتت الكتلة فلم يبق ماء'},{t:'',why:'لا علاقة لذلك بفقد الماء'},{t:'',why:'التبريد وحده لا يؤكد فقد كل الماء'}],$('.q2fb',el),null);
 },
 note:'<ul><li>كتاب النشاط ص٥٠ (ورقة العمل ٣-٤): ١١٧٫٨ g و١٢٥٫٩ g و١٢٤٫٧ g. الإجابات: ٨٫١ g، ٦٫٩ g، ١٫٢ g، Mr(BaCl₂) = ٢٠٨، x = ٢. هي نفس خطوات استنباط الصيغة لكن بالتسخين بدل الاندماج.</li><li>في ورقة النشاط كُتب Cl = ٣٥٫٣ والصحيح ٣٥٫٥ (كما في الامتحانات)، واعتمدنا ٣٥٫٥.</li><li>سؤال امتحان ٢٠٢٥/٢٠٢٦ الدور الأول (١٦) يطلب Mr لـ BaCl₂·2H₂O.</li></ul>'});

/* 8 exit ticket 1: finding a formula */
(function(){
  var items=[
   {q:'ما الخطوة الثانية في استنباط الصيغة من الكتل؟',opts:[{t:'القسمة على أقل عدد مولات'},{t:'تحويل كتلة كل عنصر إلى مولات (÷ الكتلة المولية)',ok:true,why:'صح: الخطوة ١ الكتل، ٢ المولات، ٣ النسبة'},{t:'كتابة الصيغة مباشرة'}]},
   {type:'num',q:'احسب عدد مولات 3.2 g من ذرات الأكسجين O (O = 16)',unit:'mol',ans:0.2,tol:0.004,why:'3.2 ÷ 16 = 0.2 mol',hint:'n = m ÷ M'},
   {q:'2.7 g من Al مع 2.4 g من O (Al = 27, O = 16). الصيغة:',opts:[{t:'AlO'},{t:'Al<sub>2</sub>O<sub>3</sub>',ok:true,why:'Al: 0.1 mol ، O: 0.15 mol ← النسبة 1 : 1.5 = 2 : 3'},{t:'Al<sub>3</sub>O<sub>2</sub>'}]},
   {q:'إذا خرجت النسبة 1 : 1.5 فماذا نفعل؟',opts:[{t:'نقرّبها إلى 1 : 1'},{t:'نضربها في 2 لنحصل على أعداد صحيحة',ok:true,why:'1 : 1.5 ← 2 : 3'},{t:'نتجاهل الكسر'}]}
  ];
  slide({id:'tk1',ch:2,title:'تذكرة خروج ١: استنباط الصيغة',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk1')},
   note:'<ul><li>الإجابات: تحويل الكتل إلى مولات، ٠٫٢ mol، Al₂O₃، نضرب في ٢.</li><li>السؤال الثالث يعالج النسبة التي ليست عدداً صحيحاً.</li></ul>'});
})();
