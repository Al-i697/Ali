/* ---------- lesson 1-2, part B: melting points and densities, uses, "who am I?", coloured compounds, iron(II) and iron(III) ---------- */

function ion(s,c){ return '<span class="num">'+s+'<sup>'+c+'</sup></span>' }

/* 7 high density and high melting point, against group I */
(function(){
  /* activity book worksheet 1-3 (density g/mL, melting point °C): Na, Cu, Au, Fe, W; potassium: student book end-of-unit question 3 (63 °C) and activity book exercise 1-1 (0.86 g/mL) */
  var D=[['K','١',0.86,63,'left'],['Na','١',0.97,98,'left'],['Au','',18.9,1064,'used'],['Cu','',8.9,1084,'used'],['Fe','',7.9,1540,'used'],['W','',19.4,3422,'used']];
  function bars(k){
    return barsHTML('pb',D.map(function(r){return {lab:'<span class="num">'+r[0]+'</span><small style="display:block;font-size:15px;color:var(--muted);font-weight:700">'+ar(String(r[k]).replace('.','٫'))+(k===2?'':' °C')+'</small>',parts:[[r[k],r[4],'']]}}),k===2?20:3500);
  }
  slide({id:'mp',ch:1,title:'الكثافة والانصهار: مقارنة بالمجموعة I',tag:'قارن',
   html:function(){
    return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
      <div class="tabs2" id="tb"><button type="button" class="on" data-k="3">درجة الانصهار (°C)</button><button type="button" data-k="2">الكثافة (g/mL)</button></div>
      <div class="panel" style="padding:12px 16px" id="bw">${bars(3)}</div>
      <div style="display:flex;gap:16px;font-size:19px;font-weight:800;flex-wrap:wrap">${swatch('#3f78b0','المجموعة I: K وNa')}${swatch('#E4BC4B','عناصر انتقالية: Au وCu وFe وW')}</div></div>
     <div class="col" style="width:400px;flex:none;gap:12px;justify-content:center">
      <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">ماذا تلاحظ في الجدولين؟</div>
       ${optsHTML([{t:'الكثافة والانصهار أعلى بكثير في العناصر الانتقالية'},{t:'الصوديوم والبوتاسيوم أعلى انصهاراً'},{t:'لا فرق بين المجموعتين'}])}<div class="fb" style="min-height:26px"></div></div>
      <div class="gbar hide" id="gb" style="font-size:21px">العناصر الانتقالية <b>عالية الكثافة</b> و<b>مرتفعة الانصهار</b>، والتنغستن أعلاها انصهاراً: لذلك يُستخدم في فتائل المصابيح.</div></div></div>`;},
   init:function(el){
    $$('#tb button',el).forEach(function(b){b.addEventListener('click',function(){
      $$('#tb button',el).forEach(function(x){x.classList.toggle('on',x===b)}); $('#bw',el).innerHTML=bars(+b.getAttribute('data-k')); later(function(){$('#pb',el).classList.add('go')},30);
    })});
    bindMcq($('#q',el),[{t:'',ok:true,why:'صح: Fe كثافته ٧٫٩ مقابل ٠٫٩٧ لـ Na، وينصهر عند ١٥٤٠ °C مقابل ٩٨ °C'},{t:'',why:'انصهار Na ٩٨ °C فقط، وK ٦٣ °C'},{t:'',why:'الفرق كبير: قارن الأعمدة'}],$('.fb',el),function(){unhide(el)});
   },
   enter:function(el){ later(function(){$('#pb',el).classList.add('go')},120) },
   note:'<ul><li>هدف ٤-٣: «فلزات عالية الكثافة ذات درجات انصهار مرتفعة». دليل المعلم: «اذكر الخصائص العامة (توصيل، كثافة، قوة، انصهار) ثم الفريدة، وربطها بنموذج التركيب الفلزي». كتاب الطالب ص١٨: كثافة عالية وانصهار مرتفع.</li><li>الأرقام: ورقة العمل ١-٣ في كتاب النشاط (Na ٠٫٩٧ و٩٨، Cu ٨٫٩ و١٠٨٤، Au ١٨٫٩ و١٠٦٤، Fe ٧٫٩ و١٥٤٠، W ١٩٫٤ و٣٤٢٢). البوتاسيوم: انصهاره ٦٣ °C من جدول سؤال نهاية الوحدة ٣، وكثافته ٠٫٨٦ من تمرين ١-١ (كتاب النشاط). انصهار التنغستن في كتاب الطالب ص١٧ «٣٤١٤–٣٤٢٢» وفي كتاب النشاط ٣٤٢٢: اعتمدت ٣٤٢٢ وأذكر المدى. انصهار Cu في عرضك ١٠٨٣ وفي كتاب النشاط ١٠٨٤: اعتمدت كتاب النشاط. الذهب مذكور في الكتاب مثالاً للعناصر الانتقالية (تلامسات كهربائية).</li></ul>'});
})();

/* 8 uses of transition elements (student book p.17) */
slide({id:'uses',ch:1,title:'استخدامات العناصر الانتقالية',tag:'اضغط وتعرّف',
 html:function(){
  var items=[
   ['التيتانيوم <span class="num">Ti</span>','فلز متين جداً: يُستخدم في رؤوس معدات الحفر ذات السرعات العالية.'],
   ['الذهب <span class="num">Au</span>','قابلية عالية للتوصيل الكهربائي: يُستخدم في التوصيلات الكهربائية الداخلية للأجهزة الإلكترونية.'],
   ['الكروم <span class="num">Cr</span>','مقاومة ممتازة ضد التآكل: مثل سدادات العبوات المصنوعة منه.'],
   ['التنغستن <span class="num">W</span>','انصهاره مرتفع جداً (بين ٣٤١٤ و٣٤٢٢ °C): فتيل المصابيح الكهربائية.'],
   ['النحاس والنيكل','العملات المعدنية من مزيج النحاس–النيكل: ٧٥٪ نحاس و٢٥٪ نيكل.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:340px;flex:none;gap:10px;align-items:center;justify-content:center">
    <div class="panel" style="padding:14px 12px;align-items:center;gap:8px;width:100%">${coinSVG(230)}<div class="sm" style="font-size:19px;text-align:center">عملة معدنية: ٧٥٪ نحاس (برتقالي) و٢٥٪ نيكل (فضي)</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>
    ${cardsHTML(items,'tight')}
    <div class="gbar hide" id="gb" style="font-size:21px">لكل عنصر استخدام يناسب <b>خاصية</b> فيه: المتانة، التوصيل، مقاومة التآكل، ارتفاع الانصهار.</div></div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص١٧: Ti (قوي، رؤوس الحفر)، Au (تلامسات كهربائية)، Cr (مقاوم للتآكل)، W (انصهاره ٣٤١٤–٣٤٢٢ °C، فتائل المصابيح)، والعملات (Cu ٧٥٪ وNi ٢٥٪). عرضك: جدول الاستخدامات.  كل وصف هنا من نص الكتاب وصورة ١-١ (سدادات العبوات الكرومية، العملات من مزيج النحاس–النيكل).</li><li>سؤال نهاية الوحدة ٤(ب): استخدام للنحاس مع أسبابه (سنراه في شريحة أسئلة نهاية الوحدة). الامتحانات: ٢٠٢٤/٢٠٢٥ الدور الأول س١ (Ti ورؤوس الحفر)، ٢٠٢٥/٢٠٢٦ الدور الثاني س٥ (فتيل المصباح ← التنغستن)، ٢٠٢٣/٢٠٢٤ الدور الأول س٣ (W وAu)، ٢٠٢٢/٢٠٢٣ الصباحي س٢.</li><li>رسم العملة مرسوم لهذا الدرس وليس صورة عملة حقيقية.</li></ul>'});

/* 9 "who am I?": match each clue with its element */
slide({id:'who',ch:1,title:'نشاط: من أنا؟',tag:'اسحب',
 html:function(){
  var R=[['ti','أنا <b>متين جداً</b>، وأُستخدم في رؤوس معدات الحفر.'],['w','لا أنصهر إلا عند حرارة <b>عالية جداً</b>، وأُستخدم في فتائل المصابيح.'],['au','أوصّل الكهرباء <b>توصيلاً عالياً</b>، وأُستخدم في التوصيلات الداخلية للأجهزة.'],['cr','أقاوم <b>التآكل</b> مقاومة ممتازة، وتُصنع مني سدادات العبوات.'],['cuni','نحن معاً (٧٥٪ و٢٥٪) في صنع <b>العملات</b>.']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب كل عنصر إلى وصفه:</div>
    ${R.map(function(r){return '<div class="whorow"><div class="whoc">'+r[1]+'</div><div class="mslot" data-k="'+r[0]+'"><span class="ph">ضع العنصر هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:330px;flex:none;gap:12px;justify-content:center">
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">كل استخدام يرتبط بخاصية: <b>القوة، ارتفاع الانصهار، مقاومة التآكل</b>.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['ti','<b class="num">Ti</b> التيتانيوم'],['w','<b class="num">W</b> التنغستن'],['au','<b class="num">Au</b> الذهب'],['cr','<b class="num">Cr</b> الكروم'],['cuni','<b class="num">Cu</b> و<b class="num">Ni</b>']],{css:'font-size:21px;padding:8px 14px',more:'صح! كمّل',done:'ممتاز: عرفتَ استخدامات العناصر الانتقالية',bad:'فكّر في الخاصية المطلوبة في الاستخدام'});
 },
 note:'<ul><li>نشاط «من أنا؟» فكرته من عرض NotebookLM، وأوصاف الاستخدامات كلها من كتاب الطالب ص١٧ (وفي العرض كان الكروم «صنبوراً»، والكتاب يذكر سدادات العبوات المصنوعة من الكروم، فاتبعتُ الكتاب).</li><li>اسحب العنصر إلى الوصف أو اضغط العنصر ثم الوصف (للشاشات التي تعمل باللمس).</li></ul>'});

/* 10 coloured compounds: white salts of groups I to III against coloured salts of transition elements */
slide({id:'white',ch:2,title:'المركّبات الملوّنة',tag:'أضف الماء',
 html:function(){
  var T=[
   {f:'NaCl',n:'كلوريد الصوديوم',g:'I',c:'rgba(240,248,255,.62)',p:'#f4f6f8'},
   {f:'MgCl2',n:'كلوريد الماغنيسيوم',g:'II',c:'rgba(240,248,255,.62)',p:'#f4f6f8'},
   {f:'AlCl3',n:'كلوريد الألومنيوم',g:'III',c:'rgba(240,248,255,.62)',p:'#f4f6f8'},
   {f:'CuSO4',n:'كبريتات النحاس (II)',g:'',c:'#2f8fff',p:'#4aa3ff'},
   {f:'FeSO4',n:'كبريتات الحديد (II)',g:'',c:'#6fd06a',p:'#a8dca0'},
   {f:'CoCl2',n:'كلوريد الكوبالت (II)',g:'',c:'#f27ab0',p:'#e58ab4'},
   {f:'KMnO4',n:'برمنغنات البوتاسيوم',g:'',c:'#9b3fd1',p:'#5a1a7a'}];
  function pwd(p){ return '<g class="pwd" style="transition:opacity 500ms"><ellipse cx="35" cy="128" rx="17" ry="7" fill="'+p+'"/><ellipse cx="30" cy="123" rx="9" ry="5" fill="'+p+'"/><ellipse cx="42" cy="124" rx="8" ry="4.5" fill="'+p+'"/></g>' }
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button type="button" class="btn acc" id="addw">أضف الماء إلى كل الأنابيب</button><span style="font-size:20px;font-weight:800;color:var(--cyan)">أو اضغط على أنبوب واحد</span></div>
    <div class="panel" style="padding:12px 10px 8px"><div style="display:grid;grid-template-columns:3fr 4fr;gap:8px;margin-bottom:6px"><div class="tgrp">أملاح المجموعات I–III</div><div class="tgrp d">أملاح عناصر انتقالية</div></div>
     <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${T.map(function(t,i){return '<button type="button" class="tbx" data-i="'+i+'"><div class="tbw">'+tubeSVG({c:t.c,id:'w'+i,w:74,fill:0,extra:pwd(t.p)})+'</div><span class="tbf num">'+sub(t.f)+'</span><span class="tbn">'+t.n+'</span></button>'}).join('')}</div></div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:340px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact hide" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">ما لون محاليل أملاح المجموعات I–III؟</div>
     ${optsHTML([{t:'عديمة اللون'},{t:'زرقاء'},{t:'خضراء'}])}<div class="fb2" style="min-height:26px"></div></div>
    <div class="panel" id="qh" style="padding:12px 16px"><div style="font-size:22px;font-weight:800;color:var(--gold)">أذب الأملاح السبعة أولاً، ثم يظهر سؤال هنا.</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">أملاح المجموعات I–III <b>بيضاء ومحاليلها عديمة اللون</b>، أما مركّبات العناصر الانتقالية فكثير منها <b>ملوّن</b>.</div></div></div>`;},
 init:function(el){
  var on=0, N=$$('.tbx',el).length, ans=false;
  function chk(){ if(ans&&on===N) unhide(el) }
  function add(b){ if(b.classList.contains('on')) return; b.classList.add('on'); $('.liq',b).style.transform='scaleY(1)'; $('.pwd',b).style.opacity=0; on++;
    if(on===N){ say($('.fb',el),'أذبنا الأملاح السبعة: ماذا تلاحظ؟','ok'); later(function(){ $('#qh',el).classList.add('hide'); $('#q',el).classList.remove('hide') },900) } }
  $$('.tbx',el).forEach(function(b){b.addEventListener('click',function(){add(b)})});
  $('#addw',el).addEventListener('click',function(){ $$('.tbx',el).forEach(function(b,i){ later(function(){add(b)},i*180) }) });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صح: الملح الأبيض يعطي محلولاً عديم اللون'},{t:'',why:'الأزرق لون أيون النحاس (II) وهو انتقالي'},{t:'',why:'الأخضر لون أيون الحديد (II) وهو انتقالي'}],$('.fb2',el),function(){ans=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص١٨: مركّبات المجموعات I–III بيضاء ومحاليلها عديمة اللون، وكثير من مركّبات العناصر الانتقالية ملوّنة (جدول ١-١). عرضك وعرض NotebookLM: مقارنة أملاح المجموعات 1 و2 و3 (بيضاء) مع الدوارق الملوّنة.</li><li>الأنابيب افتراضية وألوانها تقريبية: Cu²⁺ أزرق، Fe²⁺ أخضر باهت، Co²⁺ وردي، MnO₄⁻ بنفسجي. الأملاح الصلبة في الأنابيب مرسومة بألوانها التقريبية أيضاً.</li><li>كلوريد الألومنيوم يتفاعل مع الماء جزئياً، لكن محلوله عديم اللون: يكفي ذلك للشريحة. امتحان: ٢٠٢٥/٢٠٢٦ الدور الأول س٣ (النحاس يكوّن مركّبات ملوّنة)، و٢٠٢٢/٢٠٢٣ الصباحي س١.</li></ul>'});

/* 11 table 1-1: the colour of ions */
slide({id:'ions',ch:2,title:'ألوان الأيونات (جدول ١-١)',tag:'اسحب',
 html:function(){
  var I=[['Cu','2+','blue'],['Fe','2+','green'],['Fe','3+','ybrown'],['Cr','3+','green'],['Co','2+','pink'],['MnO<sub>4</sub>','−','purple'],['CrO<sub>4</sub>','2−','yellow'],['Cr<sub>2</sub>O<sub>7</sub>','2−','orange']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب اللون الصحيح إلى كل أيون:</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px">${I.map(function(r){return '<div class="whorow ion"><div class="whoc" style="font-size:28px;font-weight:800;font-family:var(--font-display);direction:ltr;text-align:center">'+r[0]+'<sup>'+r[1]+'</sup></div><div class="mslot" data-k="'+r[2]+'"><span class="ph">اللون</span></div></div>'}).join('')}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:350px;flex:none;gap:12px;justify-content:center">
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div>
    <div class="gbar hide" id="gb" style="font-size:20px">اللون يدل على <b>الأيون الانتقالي</b>: يستعمله الكيميائيون في التحليل. وأيونات المجموعات I–III عديمة اللون.</div></div></div>`;},
 init:function(el){
  function chip(c,t){ return '<span style="display:inline-flex;align-items:center;gap:8px"><i style="display:inline-block;width:22px;height:22px;border-radius:50%;background:'+c+';border:2px solid rgba(255,255,255,.8)"></i><span style="background:rgba(6,20,44,.9);color:#fff;padding:0 9px;border-radius:8px">'+t+'</span></span>' }
  bindMatch(el,[['blue',chip('#3b8cff','أزرق')],['green',chip('#5cc15a','أخضر')],['ybrown',chip('#c9893a','أصفر مُحمرّ')],['green',chip('#5cc15a','أخضر')],['pink',chip('#f27ab0','وردي')],['purple',chip('#8f3fd0','بنفسجي')],['yellow',chip('#f3d33a','أصفر')],['orange',chip('#f08a2a','برتقالي')]],
   {css:'font-size:20px;padding:6px 12px;background:rgba(6,20,44,.9);color:#fff',more:'صح! كمّل',done:'ممتاز: ربطتَ كل أيون بلونه',bad:'راجع جدول ١-١: ما لون هذا الأيون في المحلول؟'});
 },
 note:'<ul><li>كتاب الطالب ص١٨ جدول ١-١: Cu²⁺ أزرق، Fe²⁺ أخضر، Fe³⁺ أصفر مُحمرّ، Cr³⁺ أخضر، Co²⁺ وردي، MnO₄⁻ بنفسجي، CrO₄²⁻ أصفر، Cr₂O₇²⁻ برتقالي. سؤال ١-٥: لون مركّبات النحاس (II): أزرق.</li><li><b>تعارض:</b> الجدول في عرضك (PDF) يكتب «Cr²⁺» بجانب اللون الوردي، والكتاب وعرض NotebookLM يقولان Co²⁺ وردي. اعتمدتُ Co²⁺. لون Fe³⁺: الكتاب «أصفر مُحمرّ»، وبعض العروض تكتب «أصفر بني»: اعتمدتُ الكتاب.</li><li>الأخضر مطلوب مرتين (Fe²⁺ وCr³⁺): اسحب أيّ لون أخضر إلى أي منهما.</li></ul>'});

/* 12 iron(II) and iron(III): the formula builder */
slide({id:'fe',ch:2,title:'الحديد: Fe²⁺ وFe³⁺',tag:'ورشة الصيغ · داعم',
 html:function(){
  var T=[['FeCl2','FeCl<sub>2</sub>'],['FeCl3','FeCl<sub>3</sub>'],['Fe(OH)2','Fe(OH)<sub>2</sub>'],['Fe(OH)3','Fe(OH)<sub>3</sub>']];
  return `<div class="col" style="flex:1;gap:10px;min-height:0">
   <div class="taskchips"><span>ابنِ هذه الصيغ بنفسك:</span>${T.map(function(t){return '<span class="tc" data-f="'+t[0]+'">'+t[1]+'</span>'}).join('')}</div>
   ${EQL.builderHTML()}
   <div class="gbar hide" id="gb" style="font-size:20px">للحديد أيونان شائعان: <b>Fe²⁺</b> و<b>Fe³⁺</b>. الاسم يحمل الرقم: حديد (II) وحديد (III)، فالصيغة تتغيّر.</div></div>`;},
 init:function(el){
  var got={};
  EQL.bindBuilder(el,{cats:['Fe2','Fe3','Cu'],anis:['Cl','OH','O'],startCat:'Fe2',startAni:'Cl',onDone:function(n,k){
    var c=$('.tc[data-f="'+k+'"]',el); if(c) c.classList.add('on'); got[k]=1;
    if(['FeCl2','FeCl3','Fe(OH)2','Fe(OH)3'].every(function(f){return got[f]})) unhide(el);
  }});
 },
 note:'<ul><li>سؤال ١-٤ في كتاب الطالب: أيونا الحديد الشائعان Fe²⁺ وFe³⁺. «أكثر من حالة تكافؤ» من خصائص العناصر الانتقالية (دليل المعلم: أفكار التدريس). الشريحة <b>داعمة</b>: ليست من نص هدف ٤-٣، لكنها تدرّب الطلاب على كتابة الصيغ قبل معادلات الدروس التالية.</li><li>ورشة الصيغ: اختر الأيون الموجب (Fe²⁺ أو Fe³⁺) والسالب، ثم «اشرح خطوة بخطوة» لترى تبادل التكافؤ (الطريقة التي فضّلتها)، أو «جرّب بنفسك». النوت والصفحات السبع تذكر FeCl₂ وFeCl₃ وFe(OH)₂ وFe(OH)₃.</li><li>امتحان ٢٠٢٢/٢٠٢٣ الصباحي س١: «له أكثر من حالة تكافؤ» خاصية للعنصر الانتقالي.</li></ul>'});

/* 13 the sodium hydroxide test */
slide({id:'naoh',ch:2,title:'اختبار هيدروكسيد الصوديوم',tag:'مختبر افتراضي · داعم',
 html:function(){
  function ppt(c,seed){ var R=rnd(seed), s='', i; for(i=0;i<26;i++){ s+='<circle cx="'+(20+R()*30).toFixed(1)+'" cy="'+(64+R()*70).toFixed(1)+'" r="'+(5+R()*5).toFixed(1)+'" fill="'+c+'" opacity="'+(.55+R()*.45).toFixed(2)+'"/>' } return '<g class="ppt">'+s+'</g>' }
  var T=[{k:'X',ok:'fe2',c:'#86c874',s:3},{k:'Y',ok:'fe3',c:'#dc9a35',s:8}];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">محلولان: أحدهما FeCl<sub>2</sub> والآخر FeCl<sub>3</sub>. أضف إليهما NaOH:</div>
    <div class="panel" style="padding:14px 16px"><div style="display:flex;justify-content:space-around;align-items:flex-start;gap:14px;width:100%">${T.map(function(t,i){return '<div class="nt" data-i="'+i+'" style="display:flex;flex-direction:column;align-items:center;gap:8px"><div class="tbw">'+tubeSVG({c:'rgba(226,240,246,.35)',id:'n'+i,w:92,extra:ppt(t.c,t.s)+'<circle class="dp" cx="35" cy="-6" r="5.5" fill="#dfefff"/>'})+'</div><b style="font-size:26px">المحلول '+t.k+'</b><button type="button" class="btn acc addn">أضف NaOH</button><div class="idr hide"><button type="button" class="btn" data-v="fe2">Fe<sup>2+</sup> (حديد II)</button><button type="button" class="btn" data-v="fe3">Fe<sup>3+</sup> (حديد III)</button></div></div>'}).join('')}</div></div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:340px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800;color:var(--gold)">ماذا تفعل؟</div><div class="sm" style="font-size:20px">أضف NaOH إلى كل محلول، وانظر لون الراسب، ثم حدّد أيون الحديد.</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px"><b>Fe(OH)<sub>2</sub></b> راسب أخضر فاتح (حديد II)، و<b>Fe(OH)<sub>3</sub></b> راسب أصفر مُحمرّ (حديد III).</div></div></div>`;},
 init:function(el){
  var done=0, T=['fe2','fe3'];
  $$('.nt',el).forEach(function(box,i){
    var tb=$('.addn',box), idr=$('.idr',box);
    tb.addEventListener('click',function(){
      tb.disabled=true; var dp=$('.dp',box); dp.style.transition='transform 600ms ease-in, opacity 600ms'; dp.style.transform='translateY(70px)'; dp.style.opacity='0';
      later(function(){ box.classList.add('on'); idr.classList.remove('hide'); say($('.fb',el),'لاحظ لون الراسب، ثم اختر أيون الحديد','ok') },620);
    });
    $$('button',idr).forEach(function(b){b.addEventListener('click',function(){
      if(box.classList.contains('ok')) return;
      if(b.getAttribute('data-v')===T[i]){ box.classList.add('ok'); $('.idr',box).innerHTML='<span class="ok-t" style="font-size:22px">✓ '+(i===0?'Fe²⁺: الراسب أخضر فاتح':'Fe³⁺: الراسب أصفر مُحمرّ')+'</span>'; done++; if(done===2){ say($('.fb',el),'✓ ميّزتَ ملحي الحديد (II) و(III) بالراسب','ok'); unhide(el) } }
      else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say($('.fb',el),'تذكّر: الأخضر الفاتح للحديد (II) والأصفر المُحمرّ للحديد (III)','bad') }
    })});
  });
 },
 note:'<ul><li>كتاب الطالب ص١٩ (التحليل الكيميائي): عند إضافة هيدروكسيد الصوديوم إلى محلول ملح عنصر انتقالي تتكوّن رواسب هيدروكسيدات ذات ألوان مميزة: هيدروكسيد الحديد (II) أخضر فاتح، وهيدروكسيد الحديد (III) أصفر مُحمرّ. استعملتُ ألفاظ الكتاب نفسها (الصفحات السبع والنوت يقولان «بني محمر»، وهذا من الأخطاء في العروض فصحّحته).</li><li>الشريحة <b>داعمة</b> (ليست في نص الهدف ٤-٣) وتُحذف دون أثر على الدرس. المحلولان مخفّفان فلا يظهر لونهما قبل الإضافة، ليكون الراسب هو الدليل.</li><li>لا أكتب المعادلة الأيونية هنا لأنها من أهداف الدرس ١-٤.</li></ul>'});
