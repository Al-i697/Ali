/* ---------- alkenes, part A: cover, review, what the alkenes are, the double bond, the general formula, names, drawing ---------- */

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يعرّف الألكينات: هيدروكربونات غير مشبعة فيها رابطة ثنائية C=C، وصيغتها العامة CₙH₂ₙ.',
   'يسمّي أول ثلاثة ألكينات ويرسم صيغها الجزيئية والبنائية.',
   'يفسّر ارتفاع درجة الغليان وتغيّر الحالة الفيزيائية بزيادة عدد ذرات الكربون.',
   'يصف تفاعل الألكينات مع ماء البروم اختباراً للكشف عن عدم التشبع.',
   'يعرّف تفاعل الإضافة، ويكتب معادلات إضافة البروم والهيدروجين وبخار الماء.',
   'يذكر ظروف الهدرجة والإماهة: العامل الحفّاز ودرجة الحرارة والضغط.',
   'يقارن بين الألكانات والألكينات في الصيغة والنشاط الكيميائي.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:22px 30px 20px;justify-content:center;gap:9px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">الموضوع ٤-٢</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:60px;font-weight:800;line-height:1.1">ال<span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">ألكينات</span></h1>
    <p style="margin:0 0 2px;font-size:26px;font-weight:700;color:var(--muted)">الهيدروكربونات غير المشبعة وتفاعلات الإضافة</p>
    <p style="font-size:23px;font-weight:700;line-height:1.35;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:14px 10px;align-items:center;gap:8px">${eneSVG(3,{w:290})}<div class="sm" style="font-size:19px;text-align:center">البروبين: ٣ ذرات كربون و٦ ذرات هيدروجين</div></div>
    <div class="panel" style="padding:10px 18px;align-items:center;gap:4px"><div class="bigeq" style="font-size:44px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5)">C<sub>n</sub>H<sub>2n</sub></div>
    <div class="sm" style="font-size:22px;text-align:center">قانون واحد يجمع الألكينات كلها</div></div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من دليل المعلم للموضوع ٤-٢ (٣-٥، ٣-٦، ٣-٧، ٣-٨، ٣-٩، ٣-١٠...) ومن شريحتي «الأهداف» في عرض NotebookLM وعرضك القديم، مكتوبة بلغة الطالب. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>الدرس يغطي كتاب الطالب ص٨٦–٨٨ وأسئلة ٤-١١ إلى ٤-٢٠، والنشاط ٤-١، وسؤال نهاية الوحدة ٣، وكتاب النشاط: تمرينا ٤-٢ و٤-٣.</li><li>الصعوبة المتوقعة (دليل المعلم): رسم الصيغ البنائية بعدّ الروابط الصحيح، وإضافة الذرات في الموضع الصحيح على ذرتي الكربون C=C.</li></ul>'});

/* 2 review ticket from 4-1 */
ticketSlide({id:'recall',ch:0,title:'نراجع الألكانات أولاً',tag:'تذكرة المدخل',items:[
 {q:'ما المقصود بالمركّب الهيدروكربوني؟',opts:[{t:'مركّب يتكوّن من الكربون والهيدروجين فقط',ok:true,why:'هذا هو الهيدروكربون: كربون وهيدروجين فقط'},{t:'مركّب يتكوّن من الكربون والأكسجين',why:'هذا لا يسمّى هيدروكربوناً: لا بد من الهيدروجين فقط مع الكربون'},{t:'عنصر فلزي',why:'الهيدروكربون مركّب وليس عنصراً'}]},
 {q:'لماذا تُسمّى الألكانات هيدروكربونات «مشبعة»؟',opts:[{t:'لأن كل الروابط بين ذرات الكربون أحادية',ok:true,why:'لا يمكن إضافة ذرات أخرى إلى سلسلتها'},{t:'لأنها تحتوي رابطة ثنائية',why:'هذه صفة غير المشبعة'},{t:'لأنها تذوب في الماء',why:'ليست هذه علاقة التشبع'}]},
 {type:'num',q:'كم ذرة هيدروجين في الأوكتان الذي فيه ٨ ذرات كربون؟ (الصيغة العامة <span class="num">C<sub>n</sub>H<sub>2n+2</sub></span>)',unit:'ذرة',ans:18,tol:.01,why:'2×8 + 2 = 18: C₈H₁₈',hint:'2n + 2 حيث n = 8'},
 {q:'أي هذه المركّبات هيدروكربون غير مشبع؟',opts:[{t:'<span class="num">C<sub>2</sub>H<sub>6</sub></span>',why:'الإيثان: كل روابطه أحادية'},{t:'<span class="num">C<sub>2</sub>H<sub>4</sub></span>',ok:true,why:'الإيثين: فيه رابطة ثنائية C=C'},{t:'<span class="num">CH<sub>4</sub></span>',why:'الميثان: ألكان مشبع'}]}
 ],
 note:'<ul><li>مراجعة قصيرة لـ ٤-١ قبل الدخول في الألكينات: تعريف الهيدروكربون، التشبع، الصيغة العامة للألكانات، التمييز بين المشبع وغير المشبع.</li><li>إجاباتها: الكربون والهيدروجين فقط، كل الروابط أحادية، ١٨، C₂H₄.</li></ul>'});

/* 3 what are alkenes */
slide({id:'what',ch:1,title:'ما هي الألكينات؟',tag:'اكتشف',
 html:function(){
  var items=[['هيدروكربونات غير مشبعة','تتكوّن من الكربون والهيدروجين فقط، وفي جزيئاتها رابطة ثنائية واحدة على الأقل C=C.'],['الصيغة العامة <span class="num">C<sub>n</sub>H<sub>2n</sub></span>','n عدد ذرات الكربون، وعدد ذرات الهيدروجين يساوي 2n، أي أقل بذرتين من الألكان المقابل.'],['أبسط ألكين: الإيثين','صيغته <span class="num">CH<sub>2</sub>=CH<sub>2</sub></span>، ويلزم ذرتا كربون على الأقل لتكوين الرابطة الثنائية.'],['اسمها ينتهي بـ «ين»','إيث<b>ين</b>، بروب<b>ين</b>، بيوت<b>ين</b>…']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:440px;flex:none;gap:12px;justify-content:center">
    <div class="frm brk" style="padding:16px 22px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">مصطلحات علمية · Alkenes</div>
     <p style="margin:0;font-size:25px;font-weight:800;line-height:1.45"><span style="color:var(--gold)">الألكينات</span>: مركّبات هيدروكربونية غير مُشبَعة، تحتوي جُزيئاتها على رابطة ثنائية <span class="num">C=C</span> واحدة على الأقل، وصيغتها العامة <span class="num">C<sub>n</sub>H<sub>2n</sub></span>.</p></div>
    <div class="panel compact" style="padding:10px 16px"><div style="font-size:21px;font-weight:800;margin-bottom:2px">فكّر: لماذا لا يوجد ألكين بذرة كربون واحدة؟</div>
     ${optsHTML([{t:'لأن الرابطة الثنائية تكون بين ذرتي كربون'},{t:'لأن الهيدروجين يكوّن رابطة ثنائية مع الكربون'},{t:'لأن الكربون لا يكوّن روابط'}])}<div class="fb" style="min-height:24px"></div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة لتظهر:</div>
    ${cardsHTML(items,'tight')}
    <div class="gbar hide" id="gb" style="font-size:21px">الرابطة الثنائية <b class="num">C=C</b> هي سر الألكينات: منها يأتي نشاطها الكيميائي.</div></div></div>`;},
 init:function(el){
  var cards=false,mc=false; function chk(){ if(cards&&mc) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('.panel',el),[{t:'',ok:true,why:'صح: الرابطة الثنائية بين ذرتي كربون، فلا بد من ذرتين على الأقل'},{t:'',why:'الهيدروجين يكوّن رابطة أحادية واحدة فقط'},{t:'',why:'الكربون يكوّن أربع روابط تساهمية'}],$('.fb',el),function(){mc=true; chk()});
 },
 note:'<ul><li>التعريف من كتاب الطالب ص٨٦ (الألكينات: مركبات هيدروكربونية غير مشبعة الجزيئية، تحتوي جزيئاتها على الأقل على رابطة ثنائية C=C واحدة في السلسلة، وتمتلك الصيغة العامة CₙH₂ₙ، واسمها ينتهي بـ «ين») وعرض NotebookLM شريحة ٦.</li><li>السؤال في اللوحة من كتاب النشاط (تمرين ٤-٢ أ٣ ب): «لماذا لا يمكن تكوين ألكين من ذرة كربون واحدة فقط؟» الجواب: لأن الألكينات تكوّن رابطة ثنائية بين ذرتي (كربون-كربون)، ولا يمكن للهيدروجين تكوين رابطة ثنائية مع الكربون.</li></ul>'});

/* 4 the double bond: shared electrons (question 4-15) */
slide({id:'bondE',ch:1,title:'الرابطة الثنائية: إلكترونات مشتركة',tag:'سؤال ٤-١٥',
 html:function(){
  var C=[[150,130],[270,130]], H=[[78,62],[78,198],[342,62],[342,198]], s='';
  C.forEach(function(c){s+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="62" fill="rgba(58,63,69,.45)" stroke="#9fb4b8" stroke-width="2.5"/><text x="'+c[0]+'" y="'+(c[1]+9)+'" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" opacity=".55" font-family="Cairo,sans-serif">C</text>'});
  H.forEach(function(h){s+='<circle cx="'+h[0]+'" cy="'+h[1]+'" r="38" fill="rgba(238,244,244,.14)" stroke="#9fb4b8" stroke-width="2.5"/><text x="'+h[0]+'" y="'+(h[1]+9)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" opacity=".55" font-family="Cairo,sans-serif">H</text>'});
  var P=[[114,96],[114,164],[306,96],[306,164],[210,112],[210,148]];
  P.forEach(function(p,i){ s+='<g class="arm" data-i="'+i+'" style="cursor:pointer"><g class="hh"><text x="'+(p[0]-8)+'" y="'+(p[1]+6)+'" text-anchor="middle" font-size="22" font-weight="800" fill="#E4BC4B">●</text><text x="'+(p[0]+9)+'" y="'+(p[1]+7)+'" text-anchor="middle" font-size="24" font-weight="800" fill="#7fd6ee">×</text></g><circle class="dot" cx="'+p[0]+'" cy="'+p[1]+'" r="17" fill="rgba(228,188,75,.10)" stroke="var(--gold)" stroke-width="2.5" stroke-dasharray="5 5"/></g>' });
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">اضغط على كل مكان متقطع لتُظهر زوج الإلكترونات المشترك:</div>
    <div class="panel" style="padding:6px 16px;align-items:center"><svg viewBox="0 0 420 260" width="470" style="direction:ltr;overflow:visible" aria-hidden="true">${s}</svg></div>
    <div style="display:flex;align-items:center;gap:14px"><span style="font-size:24px;font-weight:800">أزواج الإلكترونات المشتركة:</span><b class="num" id="cnt" style="font-size:40px;color:var(--gold)">0</b><span class="num" style="font-size:30px;font-weight:800">/ 6</span></div>
    <div class="gbar hide" id="gb" style="font-size:21px">بين الكربونين <b>زوجان</b> مشتركان (٤ إلكترونات) = <b>رابطة ثنائية</b>، ولكل هيدروجين زوج مشترك مع الكربون.</div></div>
   <div class="col" style="width:380px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800;margin-bottom:2px">الإلكترونات الخارجية فقط</div>
     ${ul(['<span style="color:var(--gold)">●</span> إلكترون من ذرة الهيدروجين','<span style="color:#7fd6ee">×</span> إلكترون من ذرة الكربون','كل ذرة كربون لها ٤ إلكترونات خارجية: اثنان مع الكربون المجاور وواحد مع كل هيدروجين'])}</div>
    <div class="panel" style="padding:12px 18px;gap:4px"><div class="num" style="font-size:30px;font-weight:800;text-align:center;direction:ltr">H<sub>2</sub>C = CH<sub>2</sub></div><div class="sm" style="font-size:19px;text-align:center">الإيثين: ٦ أزواج مشتركة، منها زوجان بين الكربونين</div></div></div></div>`;},
 init:function(el){
  var n=0;
  $$('.arm',el).forEach(function(g){g.addEventListener('click',function(){
    if(g.classList.contains('on')) return; g.classList.add('on'); n++; $('#cnt',el).textContent=n; if(n===6) unhide(el);
  })});
 },
 note:'<ul><li>سؤال ٤-١٥ (كتاب الطالب ص٩٠): «ارسم مخططاً يبيّن ترتيب الإلكترونات في روابط الإيثين. بيّن الإلكترونات الخارجية فقط». الإجابة (دليل المعلم): ذرتا كربون بينهما زوجان مشتركان، وعلى كل كربون ذرتا هيدروجين، كل منها تشارك بزوج إلكترونات.</li><li>الشكل ٤-١(أ) في الكتاب: «زوجان مشتركان من الإلكترونات (رابطة ثنائية)» بين ذرتي الكربون.</li></ul>'});

/* 5 the general formula */
slide({id:'formula',ch:1,title:'الصيغة العامة للألكينات',tag:'جرّب',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:8px"><div style="display:flex;align-items:center;gap:16px"><span style="font-size:23px;font-weight:800">عدد ذرات الكربون</span>${stepHTML('n','n =',2)}<b id="nm" style="font-size:30px;color:var(--gold)"></b></div>
     <div style="display:flex;align-items:baseline;justify-content:center;gap:16px;direction:ltr"><span class="bigeq" id="gf" style="font-size:46px;color:var(--gold)"></span><span class="num lbl" id="gc" style="font-size:24px;color:var(--muted)"></span></div></div>
    <div class="panel" style="padding:10px 16px;align-items:center;min-height:170px;justify-content:center"><div id="mc"></div></div>
    <div class="panel" style="padding:10px 16px;gap:6px"><div style="font-size:22px;font-weight:800">أكمل:</div>
     <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;font-size:23px;font-weight:700">${[['h4','C₄: عدد H =',8],['h5','C₅: عدد H =',10],['h10','C₁₀: عدد H =',20]].map(function(r){return '<span style="display:inline-flex;align-items:center;gap:8px">'+r[1]+' '+nin(r[0],'')+'</span>'}).join('')}</div><div class="fb" style="min-height:24px"></div></div></div>
   <div class="col" style="width:320px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:22px;font-weight:800">قارن بالألكان</div><div style="font-size:21px;line-height:1.5">ألكان: <span class="num">C<sub>n</sub>H<sub>2n+2</sub></span><br>ألكين: <span class="num">C<sub>n</sub>H<sub>2n</sub></span></div><div class="sm" style="font-size:19px">الألكين أقل بذرتين من الهيدروجين، لأن كربونين فيه يتشاركان رابطة ثنائية.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">عدد ذرات الهيدروجين في الألكين = 2n، أي ضعف عدد ذرات الكربون.</div></div></div>`;},
 init:function(el){
  var seen={}, ans=false;
  var st=bindStep(el,'n',2,6,function(n){
    var a=ENE[n-2]; seen[n]=1; $('#nm',el).textContent=a.name;
    $('#gf',el).innerHTML='C<sub>'+n+'</sub>H<sub>'+2*n+'</sub>'; $('#gc',el).textContent='2 × '+n+' = '+2*n;
    $('#mc',el).innerHTML=eneSVG(n,{w:Math.min(420,100+n*62)});
    if(ans&&Object.keys(seen).length>=5) unhide(el);
  });
  bindAll(el,[{n:'h4',a:8,w:'✓ 2×4 = 8: C₄H₈ (بيوتين)',h:'عدد H = 2 × عدد C'},{n:'h5',a:10,w:'✓ 2×5 = 10: C₅H₁₀ (بنتين)',h:'عدد H = 2 × عدد C'},{n:'h10',a:20,w:'✓ 2×10 = 20: C₁₀H₂₀',h:'عدد H = 2 × عدد C'}],$('.fb',el),function(){ans=true; if(Object.keys(seen).length>=5) unhide(el)});
  st.set(2);
 },
 note:'<ul><li>الصيغة العامة CₙH₂ₙ من كتاب الطالب ص٨٦ (الجدول ٤-٦: C₂H₄، C₃H₆، C₄H₈، C₅H₁₀). اضغط + ببطء حتى n = 6 ثم أجب عن الأسئلة الثلاثة.</li><li>في تمرين ٤-٢ (ب) في كتاب النشاط: يجب أن يمتلك الألكين الذي يحتوي على ١٠ ذرات كربون الصيغة C₁₀H₂₀، في حين أن الليمونين له الصيغة C₁₀H₁₆، فلا يطابق الصيغة العامة.</li></ul>'});

/* 6 names: match the names to the structures */
slide({id:'names',ch:1,title:'اسم الألكين وصيغته',tag:'طابق · سؤال ٤-١١',
 html:function(){
  var rows=[[2,'ethene'],[3,'propene'],[4,'butene']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    ${rows.map(function(r){return '<div style="display:grid;grid-template-columns:1fr 240px;gap:12px;align-items:center"><div class="panel" style="padding:6px 12px;align-items:center">'+eneSVG(r[0],{w:Math.round((108+58*(r[0]-1))*.62)})+'</div><div class="mslot" data-k="'+r[0]+'" style="min-height:70px"><span class="ph">ضع الاسم والصيغة</span></div></div>'}).join('')}
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:4px"><div style="font-size:22px;font-weight:800">كيف نسمّي الألكين؟</div><div style="font-size:21px;line-height:1.55"><b style="color:var(--gold)">بادئة</b> تدل على عدد ذرات الكربون + <b style="color:var(--gold)">لاحقة «ين»</b><br><span class="sm" style="font-size:19px">إيث (٢) · بروب (٣) · بيوت (٤) · بنت (٥) · هكس (٦)</span></div></div>
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب البطاقة إلى الرسم المناسب (أو اضغط ثم اضغط المكان):</div>
    <div id="tray" class="tray" style="display:flex;flex-direction:column;gap:8px"></div>
    <div class="gbar hide" id="gb" style="font-size:21px">إيثين C₂H₄، بروبين C₃H₆، بيوتين C₄H₈: أول ثلاثة ألكينات.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[[2,'إيثين <span class="num lbl">C<sub>2</sub>H<sub>4</sub></span>'],[3,'بروبين <span class="num lbl">C<sub>3</sub>H<sub>6</sub></span>'],[4,'بيوتين <span class="num lbl">C<sub>4</sub>H<sub>8</sub></span>']].map(function(a){return [String(a[0]),a[1]]}),{css:'font-size:21px;padding:10px 14px',more:'صح! كمّل',done:'ممتاز: عرفت أسماء أول ثلاثة ألكينات',bad:'عدّ ذرات الكربون في الرسم'});
 },
 note:'<ul><li>سؤال ٤-١١ (كتاب الطالب ص٩٠): «اكتب أسماء أول ثلاثة ألكينات وصيغها الجزيئية.» الإجابة: إيثين C₂H₄، بروبين C₃H₆، بيوتين C₄H₈. الجدول ٤-٦ في الكتاب يضيف البنتين C₅H₁₀.</li><li>رسم البيوتين في الكتاب والنموذج: الرابطة الثنائية عند طرف السلسلة (بيوت-١-ين)، وهو الرسم المعتمد في الدرس.</li></ul>'});

/* 7 draw the structural formulas (question 4-12) */
slide({id:'draw',ch:1,title:'أكمل الصيغة البنائية',tag:'ارسم · سؤال ٤-١٢',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div style="display:flex;gap:10px" id="tabs">${[2,3,4].map(function(n){return '<button type="button" class="btn tab" data-n="'+n+'">'+ENE[n-2].name+'</button>'}).join('')}</div>
    <div class="panel" style="padding:8px 14px;align-items:center;width:100%;min-height:230px;justify-content:center" id="canvas"></div>
    <div style="display:flex;align-items:center;gap:14px"><span style="font-size:23px;font-weight:800">عدد الهيدروجين:</span><b class="num" id="hc" style="font-size:38px;color:var(--gold)">0</b><span class="num" style="font-size:26px;font-weight:800" id="hm"></span></div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:350px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:24px;font-weight:800">تذكّر</div>
     ${ul(['الرابطة الثنائية بين أول ذرتي كربون، ارسمها <b>خطين</b>.','حول كل كربون <b>٤ روابط</b>: الخطان المزدوجان يُحسبان اثنتين.','عدد H = 2n'])}</div>
    <div class="gbar hide" id="gb" style="font-size:21px">أنجزت الثلاثة: لكل كربون ٤ روابط، وعدد H = 2n.</div></div></div>`;},
 init:function(el){
  var done={}, fb=$('.fb',el), filled;
  function load(n){
    var f=fillEneSVG(n); $('#canvas',el).innerHTML=f.svg; filled=0; $('#hc',el).textContent='0'; $('#hm',el).textContent='/ '+f.count;
    $$('.tab',el).forEach(function(t){t.classList.toggle('acc',+t.getAttribute('data-n')===n)});
    $$('.hslot',el).forEach(function(g){g.addEventListener('click',function(){
      if(g.classList.contains('on')) return; g.classList.add('on'); filled++; $('#hc',el).textContent=filled;
      if(filled===f.count){ done[n]=1; say(fb,'✓ '+ENE[n-2].name+': '+f.count+' هيدروجين = 2×'+n,'ok'); if(Object.keys(done).length===3) unhide(el) }
      else say(fb,'','')
    })});
  }
  $$('.tab',el).forEach(function(t){t.addEventListener('click',function(){load(+t.getAttribute('data-n'))})});
  load(2);
 },
 note:'<ul><li>سؤال ٤-١٢ (كتاب الطالب ص٩٠): «ارسم الصيغ البنائية لكل من الإيثين والبيوتين». الخطأ الشائع (دليل المعلم): رسم الرابطة الثنائية على أنها أحادية أو نسيان ذرات الهيدروجين، فيزيد أو ينقص عدد الروابط حول الكربون.</li><li>الشكل ٤-١(ب) في الكتاب: الصيغ البنائية والنماذج الجزيئية لأول ثلاثة ألكينات.</li></ul>'});
