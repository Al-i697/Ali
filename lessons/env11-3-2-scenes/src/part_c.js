/* ---------- part C: productivity - photosynthesis, chemosynthesis, what limits them, Activity 3-1 (student book pp. 92-95; activity book pp. 101-104) ---------- */

/* 17 productivity (student book p. 92) */
scn('prod',2);

/* 18 photosynthesis and the photic zone (student book p. 93, figure 3-1, photo 3-5) */
slide({id:'photic',ch:2,title:'التمثيل الضوئي والمنطقة الضوئية',tag:'اضغط على طبقة',
 html:function(){
  var Ls=[['photic','المنطقة الضوئية',0,36,'#ffd966','#3a2b00','200 m','المنطقة الضوئية: الطبقة السطحية التي تتلقى ضوء الشمس (حتى نحو 200 m)، وفيها التمثيل الضوئي وغالبية الكتلة الحيوية.'],
   ['thermo','المنحدر الحراري',36,70,'#7ccf6b','#06290f','1000 m','المنحدر الحراري: بين نحو 200 و1000 m، وتتغير فيه الكثافة والحرارة ويقلّ الضوء.'],
   ['deep','المياه العميقة',106,110,'#4f7fbf','#fff','5000 m','المياه العميقة: بين نحو 1000 و5000 m، مظلمة وباردة وغنية بالمغذّيات.']];
  var svg='<svg viewBox="0 0 380 270" class="fgv" style="max-height:208px" aria-label="طبقات الماء في المحيط">'+Ls.map(function(l){return '<g class="lay" data-k="'+l[0]+'"><rect x="20" y="'+(l[2]+6)+'" width="250" height="'+l[3]+'" fill="'+l[4]+'" stroke="rgba(0,0,0,.3)" rx="4"/><text x="145" y="'+(l[2]+6+l[3]/2)+'" class="lbl" style="fill:'+l[5]+';dominant-baseline:central">'+l[1]+'</text><text x="272" y="'+(l[2]+10+l[3])+'" style="fill:#fff;font:700 15px Cairo,sans-serif;direction:ltr">'+l[6]+'</text></g>'}).join('')+
   '<rect x="20" y="222" width="250" height="26" fill="#6b4a2f" stroke="rgba(0,0,0,.3)" rx="4"/><text x="145" y="235" class="lbl" style="dominant-baseline:central">قاع المحيط</text><text x="344" y="14" style="fill:#fff;font:700 14px Cairo,sans-serif;text-anchor:middle">العمق</text><line x1="345" y1="22" x2="345" y2="244" stroke="#fff" stroke-width="2.4"/><path d="M339 236L345 248L351 236z" fill="#fff"/></svg>';
  var ph='<div class="panel pb" data-pt style="display:flex;gap:12px;align-items:flex-start;padding:10px 12px">'+phHTML('phyto','(أ) عوالق نباتية',150,104)+phHTML('kelp','(ب) طحلب الكِلْب',150,104)+phHTML('grass','(ج) حشائش البحر',150,104)+'</div>';
  var P1='كائنات التمثيل الضوئي <span class="en">Photoautotrophs</span> (ذاتية التغذية الضوئية) تستخدم طاقة الضوء لصنع مركبات عضوية. تشمل العوالق النباتية والطحالب الكبيرة <span class="en">Macroalgae</span> مثل طحلب الكِلْب وحشائش البحر <span class="en">Seagrasses</span>.';
  var P3='لا يحدث التمثيل الضوئي إلا في '+tm('المنطقة الضوئية','Photic zone')+' من المحيط، لأن الضوء لا يستطيع اختراق الماء إلى أعماق كبيرة.';
  var P4='تصل المنطقة الضوئية إلى نحو <b class="num">200</b> m من سطح الماء، ولذلك توجد غالبية الكتلة الحيوية في الطبقة العليا المضاءة.';
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="width:420px;flex:none;gap:8px;justify-content:center">
    <div class="panel lq" style="padding:8px 12px;gap:4px"><div class="q" style="font-size:20px">إلى أي عمق يصل الضوء الكافي للتمثيل الضوئي؟</div><div class="opts" style="grid-template-columns:repeat(3,1fr);display:grid;gap:6px">${[['نحو 200 m',0],['نحو 1000 m',1],['نحو 5000 m',2]].map(function(o){return '<button type="button" class="opt" data-i="'+o[1]+'" style="font-size:17px;padding:6px 8px;min-height:40px"><span>'+o[0]+'</span></button>'}).join('')}</div><div class="fb" style="min-height:20px;font-size:18px"></div></div>
    <div class="panel" style="padding:4px 8px"><div style="max-height:208px">${svg}</div></div>
    <div class="fb" id="fl" style="min-height:40px;font-size:18px;text-align:center">الشكل 3-1: اضغط على طبقة.</div></div>
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div class="panel pb" data-pt style="font-size:21px">${P1}</div>
    ${ph}
    <div class="panel pb" data-pt style="font-size:21px">${P3}</div>
    <div class="panel pb" data-pt style="font-size:21px">${P4}</div></div></div>`;},
 init:function(el){
  bindMcq($('.lq',el),[{t:'',ok:true,why:'صح: المنطقة الضوئية حتى نحو 200 m'},{t:'',why:'عند 1000 m لا يصل ضوء كافٍ للتمثيل الضوئي'},{t:'',why:'عند 5000 m (قاع المحيط) ظلام تام'}],$('.lq .fb',el));
  var F={photic:'المنطقة الضوئية: الطبقة السطحية التي تتلقى ضوء الشمس (حتى نحو 200 m)، وفيها التمثيل الضوئي وغالبية الكتلة الحيوية.',thermo:'المنحدر الحراري: بين نحو 200 و1000 m، تتغير فيه الكثافة والحرارة ويقلّ الضوء كثيراً.',deep:'المياه العميقة: بين نحو 1000 و5000 m، مظلمة وباردة وغنية بالمغذّيات.'};
  $$('.lay',el).forEach(function(g){ g.addEventListener('click',function(){ $$('.lay',el).forEach(function(x){x.classList.remove('sel')}); g.classList.add('sel'); say($('#fl',el),F[g.getAttribute('data-k')],'ok') }) });
 },
 note:'<ul><li>كتاب الطالب ص٩٣: التمثيل الضوئي، الشكل ٣-١ (طبقات الماء في المحيط: المنطقة الضوئية حتى ٢٠٠ m، المنحدر الحراري حتى ١٠٠٠ m، المياه العميقة حتى ٥٠٠٠ m) والصورة ٣-٥ (أ عوالق نباتية، ب طحلب الكِلْب، ج حشائش البحر). المصطلحان: ذاتية التغذية الضوئية، المنطقة الضوئية.</li><li>الأسماك والحيوانات في الشكل ٣-١ غير مرسومة بمقياس.</li></ul>'});

/* 19 what limits primary productivity (student book pp. 93-94) */
scn('factors',2);

/* 20-21 the word equations of photosynthesis and respiration (activity book Activity 3-1, question 2 a, c, d) */
function eqGroup(title,sym,extra,names){
  return '<div class="panel eg" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">'+title+'</div>'+
   '<div class="eqw"><div class="mslot slot" data-k="R"><span class="ph">متفاعل</span></div><span>+</span><div class="mslot slot" data-k="R"><span class="ph">متفاعل</span></div><span style="color:#fff3c4">←</span><div class="mslot slot" data-k="P"><span class="ph">ناتج</span></div><span>+</span><div class="mslot slot" data-k="P"><span class="ph">ناتج</span></div>'+(extra?'<span>+</span><span style="color:var(--gold)">'+extra+'</span>':'')+'</div>'+
   '<div class="eqs">'+sym+'</div><div id="tray" class="tray" style="min-height:62px;padding:6px 10px"></div><div class="fb" style="min-height:26px;text-align:center"></div></div>';
}
slide({id:'eq1',ch:2,title:'معادلة التمثيل الضوئي',tag:'ركّب المعادلة',
 html:function(){
  return `<div class="col grow" style="gap:12px;justify-content:center">
   <div class="panel" style="padding:12px 20px"><p class="lead" style="font-size:25px;margin:0">تستخدم المنتجات البحرية الضوئية طاقة الضوء لتحويل المواد غير العضوية إلى جلوكوز (مادة عضوية). اكتب المعادلة اللفظية للتمثيل الضوئي:</p></div>
   ${eqGroup('التمثيل الضوئي (بطاقة الضوء وبوجود الكلوروفيل)','6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂','',null)}
   <div class="gbar hide" id="gb" style="font-size:22px">${veq('ثاني أكسيد الكربون + ماء','جلوكوز + أكسجين')} بوجود طاقة الضوء والكلوروفيل.</div></div>`;},
 init:function(el){
  var g=$('.eg',el);
  bindMatch(g,[['P','جلوكوز'],['R','ماء'],['P','أكسجين'],['R','ثاني أكسيد الكربون']],{css:'font-size:21px;padding:8px 14px',more:'صح! كمّل',done:'✓ المعادلة اللفظية للتمثيل الضوئي',bad:'المتفاعلات يمين السهم والنواتج يساره',onDone:function(){ unhide(el) }});
 },
 note:'<ul><li>كتاب الأنشطة ص١٠٤: نشاط ٣-١ س٢(أ). المعادلة الرمزية: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (معطاة في الكتاب).</li><li>المعادلة اللفظية العربية تُكتب من اليمين: المتفاعلات على اليمين والسهم باتجاه اليسار.</li></ul>'});

slide({id:'eq2',ch:2,title:'التنفس الهوائي والإنتاجية الأولية',tag:'ركّب المعادلة',
 html:function(){
  return `<div class="col grow" style="gap:10px;justify-content:center">
   <div class="panel" style="padding:10px 20px"><p class="lead" style="font-size:24px;margin:0">يستخدم الجلوكوز الناتج من التمثيل الضوئي والتمثيل الكيميائي في التنفس الهوائي ليوفّر طاقة الأيض على شكل ATP. أكمل المعادلة اللفظية:</p></div>
   ${eqGroup('التنفس الهوائي','C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + cell energy (32 ATP)','<b>طاقة خلوية</b> <span class="en">32 ATP</span>',null)}
   <div class="gbar hide" id="gb" style="font-size:21px">${veq('جلوكوز + أكسجين','ثاني أكسيد الكربون + ماء')} + طاقة خلوية. (المنتجات تتنفس أيضاً فتستهلك جزءاً من الجلوكوز الذي صنعته).</div>
   <div class="hide" id="qd">${qaHTML([['اشرح كيف يمكن أن تؤدي زيادة التمثيل الضوئي إلى إنتاجية أولية أعلى.','كلما زاد التمثيل الضوئي زاد الجلوكوز المصنوع الذي تُبنى منه كتلة حيوية جديدة، فيرتفع معدل إنتاج الكتلة الحيوية.']])}</div></div>`;},
 init:function(el){
  var g=$('.eg',el);
  bindMatch(g,[['R','أكسجين'],['P','ماء'],['R','جلوكوز'],['P','ثاني أكسيد الكربون']],{css:'font-size:21px;padding:8px 14px',more:'صح! كمّل',done:'✓ المعادلة اللفظية للتنفس الهوائي',bad:'المتفاعلات يمين السهم والنواتج يساره',onDone:function(){ unhide(el); $('#qd',el).classList.remove('hide') }});
  bindCards(el,function(){});
 },
 note:'<ul><li>كتاب الأنشطة ص١٠٤: نشاط ٣-١ س٢(ج) (معادلة التنفس الهوائي وطاقة 32 ATP كما في الكتاب) وس٢(د) (علاقة التمثيل الضوئي بالإنتاجية الأولية). الإجابة النموذجية لس٢(د) من عندي.</li></ul>'});

/* 22 chemosynthesis (student book pp. 93-94) */
scn('chemo',2);

/* 23 compare photosynthesis and chemosynthesis (activity book Activity 3-1, question 2 b) */
slide({id:'cmp',ch:2,title:'قارن: التمثيل الضوئي والتمثيل الكيميائي',tag:'اختر لكل خاصية',
 html:function(){
  var items=[['مصدر الطاقة: ضوء الشمس','p','تمثيل ضوئي'],['مصدر الطاقة: مواد كيميائية غير عضوية مثل كبريتيد الهيدروجين','c','تمثيل كيميائي'],
   ['يحدث في المنطقة الضوئية القريبة من السطح','p','تمثيل ضوئي'],['يحدث قرب الفوهات المائية الحرارية في قاع المحيط','c','تمثيل كيميائي'],
   ['تقوم به العوالق النباتية وطحلب الكِلْب وحشائش البحر','p','تمثيل ضوئي'],['تقوم به بكتيريا ذاتية التغذية الكيميائية','c','تمثيل كيميائي'],
   ['ينتج جزيئات عضوية (كربوهيدرات) من جزيئات غير عضوية بسيطة','b','كلاهما'],['الكائن الذي يقوم به منتج في بداية السلسلة الغذائية','b','كلاهما']];
  return `<div class="col grow" style="gap:8px;justify-content:center">
   <div style="font-size:23px;font-weight:800;color:var(--cyan)">لأي عملية تنتمي كل خاصية؟</div>
   <div class="clsw" style="max-width:none">${clsHTML(items,[['p','ضوئي'],['c','كيميائي'],['b','كلاهما']],20)}</div>
   <div class="fb" style="min-height:24px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الفرق: مصدر الطاقة (ضوء أم مواد كيميائية) ومكان الحدوث والكائنات؛ والنتيجة واحدة: جزيئات عضوية وكتلة حيوية جديدة.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: ما مصدر الطاقة؟ وأين يحدث؟') },
 note:'<ul><li>كتاب الأنشطة ص١٠٤: نشاط ٣-١ س٢(ب) (ما الاختلافات بين عمليتي التمثيل الضوئي والتمثيل الكيميائي؟) وملاحظة «مهم»: صمّم جدولاً يعكس الاختلافات بين مصادر الطاقة والمواد المتفاعلة والنواتج والكائنات الحية والمواطن البيئية. صغتها نشاط تصنيف (من عندي).</li></ul>'});

/* 24 changes in productivity: net primary productivity and secondary productivity (student book p. 94) */
scn('net',2);

/* 24b algal bloom (student book pp. 94-95) */
scn('abloom',2);

/* 25 Activity 3-1, question 1 (a, b): the productivity of marine habitats, table 3-1 */
slide({id:'hab',ch:2,title:'نشاط 3-1: إنتاجية المواطن البيئية البحرية',tag:'احسب الإنتاجية',
 html:function(){
  function c(id){ return '<span class="nin sm" data-n="'+id+'" style="display:inline-flex"><input inputmode="decimal" autocomplete="off" aria-label="الإجابة" style="width:104px"><button class="go" type="button" aria-label="تحقق">✓</button></span>' }
  var rows=[['الشعاب المرجانية','100','0.1','1000'],['مفتوح: استوائي','11400','190',c('p0')],['مفتوح: معتدل','22000','100',c('p1')],['مفتوح: قطبي','1560','52',c('p2')],['جرف بلا تيارات','b0','27','400'],['جرف مع تيارات','b1','0.4','980']];
  var Q=[['اقترح سبب انخفاض إنتاجية المياه القطبية شتاءً مقارنةً بالمعتدلة.','قلة ضوء الشمس شتاءً في المناطق القطبية فتقل شدة الضوء اللازمة للتمثيل الضوئي.'],
   ['لماذا ليست الشعاب المرجانية الأعلى كتلة حيوية سنوية رغم أنها الأعلى إنتاجية؟','لأن مساحتها صغيرة جداً (0.1×10⁶ km²) فكتلتها السنوية الكلية صغيرة (100).'],
   ['اقترح سبب ارتفاع إنتاجية الجروف القارية ذات التيارات الصاعدة.','تجلب التيارات الصاعدة مغذّيات من الأعماق إلى الطبقة المضاءة فتزيد الإنتاجية الأولية.']];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1.5;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 12px"><table class="tbl32" style="border-spacing:0 2px"><thead><tr><th>الموطن البيئي</th><th>الكتلة الحيوية<br>(×10⁶ t/yr)</th><th>المنطقة<br>(×10⁶ km²)</th><th>الإنتاجية<br>(t/km²/yr)</th></tr></thead><tbody>${rows.map(function(r){var d=r.slice(); if(d[1]==='b0') d[1]=c('b0'); if(d[1]==='b1') d[1]=c('b1'); return '<tr>'+d.map(function(x,i){return '<td style="font-size:19px;padding:3px 8px;white-space:nowrap;'+(i===0?'font-weight:800;color:var(--gold)':'')+'">'+x+'</td>'}).join('')+'</tr>'}).join('')}</tbody></table></div>
    <div class="fb" style="min-height:34px;font-size:19px;text-align:center">الإنتاجية = الكتلة الحيوية ÷ المساحة، والكتلة = الإنتاجية × المساحة. أكمل الخلايا الخمس.</div>
    <div class="panel" style="padding:8px 14px;font-size:17px;line-height:1.4"><b style="color:var(--gold)">الجرف القاري <span class="en">Continental shelf</span>:</b> منطقة ضحلة نسبياً من البحر تحيط بكتلة أو بمساحة كبيرة من اليابسة؛ يتكوّن قاع البحر فيها من قشرة قارية وليس من قشرة محيطية.</div></div>
   <div class="col" style="width:400px;flex:none;gap:8px;justify-content:center">${qaHTML(Q)}</div></div>`;},
 init:function(el){
  var fb=$('.fb',el), A={p0:60,p1:220,p2:30,b0:10800,b1:392};
  Object.keys(A).forEach(function(k){ bindNum($('.nin[data-n="'+k+'"]',el),A[k],Math.max(.5,A[k]*0.01),function(ok){ say(fb,ok?'✓ صحيح':'راجع القسمة أو الضرب',ok?'ok':'bad') }) });
  bindCards(el,function(){});
 },
 note:'<ul><li>كتاب الأنشطة ص١٠١–١٠٣: نشاط ٣-١ س١(أ) و(ب) والجدول ٣-١. النتائج: استوائي 11400 ÷ 190 = 60، معتدل 22000 ÷ 100 = 220، قطبي 1560 ÷ 52 = 30 (t/km²/yr)؛ وكتلة الجرف القاري: 400 × 27 = 10800 و980 × 0.4 = 392 (×10⁶ t).</li><li>الإجابات النموذجية للأسئلة من عندي.</li></ul>'});

/* 26 Activity 3-1, question 1 (c): nursery habitats, table 3-2 of the activity book */
explain({id:'nursery',ch:2,title:'نشاط 3-1: مواطن الحضانة البيئية',tag:'احسب المتوسط',
 lead:{q:'ما مواطن الحضانة البيئية <span class="en">Nursery habitats</span>؟',
  opts:[{t:'مواطن تتغذى فيها صغار الحيوانات حتى تصبح كبيرة بما يكفي للعيش في المحيط المفتوح',ok:true,why:'صح: Nursery habitats'},{t:'مواطن تعيش فيها الحيوانات البالغة فقط',why:'هي للصغار'},{t:'مواطن في قاع المحيط المظلم',why:'ليس بالضرورة؛ مثل مروج الحشائش ومصبات الأنهار'}],
  gbar:'مواطن الحضانة تُخرّج كائنات بالغة للمحيط المفتوح.'},
 pts:[{html:(function(){
    var D=[['مصبات الأنهار',27],['مروج الحشائش البحرية',31],['الشاطئ الموحل',11],['الشاطئ الرملي',3],['الشاطئ الصخري',4],['الشاطئ المرجاني',24]];
    return '<div class="panel pb" data-pt style="padding:8px 14px;gap:3px"><div class="sm" style="font-size:18px;font-weight:800;color:var(--cyan)">الجدول 3-2: النسبة المئوية لمساهمة مواطن الحضانة في إنتاجية الكائنات الحية البالغة</div>'+D.map(function(d){return '<div style="display:grid;grid-template-columns:170px 1fr 44px;gap:8px;align-items:center;font-size:18px"><span>'+d[0]+'</span><span style="display:block;height:16px;border-radius:8px;background:linear-gradient(90deg,#8fe26e,#3aa86a);width:'+(d[1]*2.6)+'px;max-width:100%"></span><b class="num">'+d[1]+'%</b></div>'}).join('')+'</div>'
   })()},
  {html:'<div class="panel pb" data-pt style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:22px"><span>احسب متوسط النسبة المئوية للمساهمة:</span>'+nin('m','%')+'<div class="fb" id="nfb" style="flex:1 1 100%;min-height:24px;font-size:19px"></div></div>'},
  {html:'<div data-pt>'+qaHTML([['ناقش: لماذا تساهم مواطن الحضانة ذات الإنتاجية الأولية العالية بشكل كبير في إنتاجية البالغين؟','إنتاجيتها الأولية العالية توفر غذاءً وفيراً لصغار الحيوانات فتنمو وتنجو، ثم تنتقل إلى المحيط المفتوح فتزيد أعداد البالغين.']])+'</div>'}],
 lw:420,gap:8,
 init:function(el){
  bindNum($('.nin[data-n="m"]',el),16.67,0.15,function(ok){ say($('#nfb',el),ok?'✓ المجموع 100 ÷ 6 ≈ 16.7%':'اجمع النسب الست ثم اقسم على 6',ok?'ok':'bad') });
  bindCards(el,function(){});
 },
 note:'<ul><li>كتاب الأنشطة ص١٠٣–١٠٤: نشاط ٣-١ س١(ج) والجدول ٣-٢: 27 + 31 + 11 + 3 + 4 + 24 = 100، والمتوسط 100 ÷ 6 ≈ 16.7٪. تعريف مواطن الحضانة بنص الكتاب. إجابة النقاش من عندي.</li></ul>'});
