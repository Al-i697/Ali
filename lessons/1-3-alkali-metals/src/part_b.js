/* ---------- lesson 1-3, part B: the gradation of the properties, Activity 1-1 and the reaction with water ---------- */

function eqn(s){ return '<bdi dir="ltr" class="num">'+sub(s)+'</bdi>' }

/* 8 density (activity book exercise 1-1: Na 0.97, K 0.86, Cs 1.88; the guide gives Rb 1.53; Li 0.53 is not in the three books) */
slide({id:'dens',ch:2,title:'تدرّج الكثافة',tag:'قارن',
 html:function(){
  var D=[['الماء','',1.0,'cao'],['Li','٠٫٥٣*',0.53,'left'],['Na','٠٫٩٧',0.97,'left'],['K','٠٫٨٦',0.86,'prod'],['Rb','١٫٥٣',1.53,'left'],['Cs','١٫٨٨',1.88,'left']];
  var rows=D.map(function(r){return {lab:'<span class="num">'+r[0]+'</span>'+(r[1]?'<small style="display:block;font-size:15px;color:var(--muted);font-weight:700">'+r[1]+'</small>':''),parts:[[r[2],r[3],'']]}});
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">الكثافة (g/mL):</div>
    <div class="panel" style="padding:12px 16px">${barsHTML('db',rows,2)}</div>
    <div class="sm" style="font-size:17px;background:rgba(6,20,44,.82);border-radius:10px;padding:2px 10px;align-self:flex-start">* قيمة الليثيوم معروفة وليست في الكتب الثلاثة. قيمة Rb من إجابة الدليل.</div></div>
   <div class="col" style="width:400px;flex:none;gap:12px;justify-content:center">
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">كثافة الفلزات القلوية تزداد نزولاً في المجموعة. أيّها خالف النمط؟</div>
     ${optsHTML([{t:'الصوديوم Na'},{t:'البوتاسيوم K'},{t:'السيزيوم Cs'}])}<div class="fb" style="min-height:26px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الكثافة <b>تميل إلى الازدياد</b> نزولاً، <b>باستثناء K</b> (أقل قليلاً من Na). وLi وNa وK <b>أخفّ من الماء</b> فتطفو.</div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',why:'Na ٠٫٩٧ أكبر من Li ٠٫٥٣: يتّبع النمط'},{t:'',ok:true,why:'صح: K ‏٠٫٨٦ أقل من Na ‏٠٫٩٧'},{t:'',why:'Cs ‏١٫٨٨ أكبر من Rb ‏١٫٥٣: يتّبع النمط'}],$('.fb',el),function(){unhide(el)}) },
 enter:function(el){ later(function(){$('#db',el).classList.add('go')},250) },
 note:'<ul><li>كتاب الطالب ص٢٠: «كثافة الفلزات القلوية تميل إلى الازدياد كلما نزلنا في المجموعة باستثناء البوتاسيوم لأن كثافته أقل قليلاً من كثافة الصوديوم». دليل المعلم: «زوّد الطلاب ببيانات عن الخصائص الفيزيائية للفلزات القلوية (درجات الانصهار والغليان والكثافة) واطلب إليهم تحديد التدرّج، وتوقّع الخصائص لعناصر أخرى في المجموعة».</li><li>الأرقام: تمرين ١-١ في كتاب النشاط (Na ‏٠٫٩٧، K ‏٠٫٨٦، Cs ‏١٫٨٨)، وإجابة الدليل (Rb ‏١٫٥٣). <b>الليثيوم ٠٫٥٣</b> ليس في كتبك الثلاثة (قيمة معروفة) وعليه نجمة. عرض NotebookLM (المصفوفة) يذكر أن K أقل من Na أيضاً.</li><li>الماء ١٫٠ g/mL (ورقة العمل ١-٣). الفلزات Li وNa وK أخفّ من الماء فتطفو.</li></ul>'});

/* 9 melting point and hardness; predict caesium (6-2) */
(function(){
  var M=[['Li',181,'صلد نوعاً ما'],['Na',98,'طري نوعاً ما'],['K',63,'طري'],['Rb',39,'طري جداً'],['Cs',null,'طري للغاية']];
  function bars(reveal){
    return barsHTML('mb',M.map(function(r){var v=r[1]==null?(reveal?28.5:0):r[1];
      return {lab:'<span class="num">'+r[0]+'</span><small style="display:block;font-size:15px;color:var(--muted);font-weight:700">'+(r[1]==null?(reveal?'٢٨٫٥ °C':'؟'):ar(r[1])+' °C')+'</small>',parts:[[v,r[1]==null?'used':'left','']]}}),200);
  }
  slide({id:'mp',ch:2,title:'تدرّج الانصهار والصلادة',tag:'توقّع',
   html:function(){
    return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
      <div style="font-size:22px;font-weight:800;color:var(--cyan)">درجة الانصهار (°C) وصلادة الفلز:</div>
      <div class="panel" style="padding:12px 16px" id="bw">${bars(false)}</div>
      <div class="hardrow">${M.map(function(r){return '<span><b class="num">'+r[0]+'</b> '+r[2]+'</span>'}).join('')}</div></div>
     <div class="col" style="width:410px;flex:none;gap:12px;justify-content:center">
      <div class="panel" style="padding:12px 16px;gap:8px"><div style="font-size:22px;font-weight:800">توقّع: ما درجة انصهار السيزيوم Cs؟</div>
       <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${ninHTML('cs','°C')}</div><div class="fb" style="min-height:26px"></div></div>
      <div class="gbar hide" id="gb" style="font-size:20px">الانصهار <b>يقلّ</b> والفلز <b>يزداد ليونة</b> نزولاً في المجموعة، لأن الرابطة الفلزية <b>تضعف</b>.</div></div></div>`;},
   init:function(el){
    bindNum($('.nin[data-n="cs"]',el),26.5,11.5,function(ok){
      if(ok){ $('#bw',el).innerHTML=bars(true); later(function(){$('#mb',el).classList.add('go')},30); say($('.fb',el),'✓ القيمة المرجعية ٢٨٫٥ °C تقريباً: أقل من ٣٩ لأن الانصهار يقلّ نزولاً','ok'); unhide(el) }
      else say($('.fb',el),'انظر إلى القيم: ١٨١ ثم ٩٨ ثم ٦٣ ثم ٣٩. الانصهار ينخفض، فالقيمة التالية أقل من ٣٩','bad');
    });
   },
   enter:function(el){ later(function(){$('#mb',el).classList.add('go')},250) },
   note:'<ul><li>كتاب الطالب ص٢٠ وسؤال نهاية الوحدة ٣(ج): جدول الفلزات: Li ‏١٨١ (صلد نوعاً ما)، Na ‏٩٨ (طري نوعاً ما)، K ‏٦٣ (طري)، Rb ‏٣٩ (طري جداً)، Cs (طري للغاية). والتفسير في الكتاب: «تقل قوة الرابطة الفلزية كلما انتقلنا من الأعلى إلى الأسفل، إذ تقل قوى التجاذب الكهروستاتيكي في شبكة الأيونات الموجبة وبحر الإلكترونات».</li><li>إجابة الدليل لس٣(ج١): ٢٨٫٥ °C أو أي إجابة معقولة أقل من ٣٩ (أقبل هنا القيم من ١٥ إلى ٣٨). دليل المعلم (المفاهيم الخاطئة): الصعوبة في اللغة المستخدمة لوصف التغيّر، فساعد الطلاب على استراتيجيات التقدير (المتوسطات وفروق التغيّرات).</li></ul>'});
})();

/* 10 predict from data: activity book exercise 1-1 (c) */
slide({id:'predict',ch:2,title:'تمرين ١-١ (ج): قدّر من البيانات',tag:'كتاب النشاط',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">أكمل الجدول لتقدير كثافة الروبيديوم ودرجة غليان السيزيوم:</div>
    <div class="panel" style="padding:10px 14px"><table class="prd"><thead><tr><th>فلزات المجموعة I</th><th>الكثافة (g/mL)</th><th>درجة الغليان (°C)</th></tr></thead><tbody>
     <tr><td><b class="num">Na</b> الصوديوم</td><td>٠٫٩٧</td><td>٨٨٣</td></tr>
     <tr><td><b class="num">K</b> البوتاسيوم</td><td>٠٫٨٦</td><td>٧٦٠</td></tr>
     <tr><td><b class="num">Rb</b> الروبيديوم</td><td>${ninHTML('rb','')}</td><td>٦٨٦</td></tr>
     <tr><td><b class="num">Cs</b> السيزيوم</td><td>١٫٨٨</td><td>${ninHTML('cs','')}</td></tr></tbody></table></div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:380px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800;color:var(--gold)">كيف تقدّر؟</div><div class="sm" style="font-size:20px;line-height:1.45">انظر إلى <b>فروق</b> القيم المتتالية وإلى اتجاهها. الكثافة <b>تزداد</b> نزولاً (من ٠٫٨٦ إلى ١٫٨٨)، والغليان <b>يقلّ</b> (٨٨٣ ثم ٧٦٠ ثم ٦٨٦).</div></div>
    <div class="gbar hide" id="gb" style="font-size:19px;line-height:1.4">تفاعل <b>K</b>: يتفاعل بسرعة ويفور ويشتعل، وقد يُطلق الهيدروجين بعنف. وتفاعل <b>Cs</b>: يتفاعل بسرعة وبعنف انفجاري.</div></div></div>`;},
 init:function(el){
  var ok={};
  function chk(){ if(ok.rb&&ok.cs) unhide(el) }
  bindNum($('.nin[data-n="rb"]',el),1.5,.3,function(g){
    if(g){ ok.rb=1; say($('.fb',el),'✓ كثافة Rb بين ٠٫٨٦ و١٫٨٨ (المرجع ١٫٥٣)','ok'); chk() } else say($('.fb',el),'الكثافة تزداد نزولاً: Rb بين K (٠٫٨٦) وCs (١٫٨٨)','bad');
  });
  bindNum($('.nin[data-n="cs"]',el),640,40,function(g){
    if(g){ ok.cs=1; say($('.fb',el),'✓ درجة غليان Cs أقل من ٦٨٦ (إجابة الدليل ٦٢٠–٦٥٠)','ok'); chk() } else say($('.fb',el),'الغليان يقلّ نزولاً: Cs أقل من ٦٨٦ بنحو ٤٠–٦٠','bad');
  });
 },
 note:'<ul><li>تمرين ١-١ (المجموعة I، الفلزات القلوية) في كتاب النشاط (ج): جدول Na (٠٫٩٧ و٨٨٣)، K (٠٫٨٦ و٧٦٠)، Rb (٦٨٦)، Cs (١٫٨٨): قدّر كثافة Rb ودرجة غليان Cs. إجابات الدليل: Rb ‏١٫٥٣؛ Cs ‏٦٢٠–٦٥٠ (القيمة الحقيقية نحو ٦٧١، ذكرها الدليل). أقبل ١٫٢–١٫٨ لـ Rb و٦٠٠–٦٨٠ لـ Cs.</li><li>الجزء المطلوب أيضاً: التعليق على تفاعل K وCs مع الماء (يظهر في الشريط الأخير بعد الإجابتين): K يتفاعل بسرعة ويفور ويشتعل وقد يُطلق الهيدروجين بعنف؛ Cs يتفاعل بسرعة وبعنف انفجاري. هدف ٦-٢: التنبؤ بخواص عناصر المجموعة من البيانات.</li></ul>'});

/* 11 apply the gradation (deck: questions on the periodic table; goal 6-2) */
(function(){
  var items=[
   {q:'أيهما أعلى كثافة: الليثيوم أم الصوديوم؟',opts:[{t:'الصوديوم',ok:true,why:'الكثافة تميل إلى الازدياد نزولاً في المجموعة'},{t:'الليثيوم',why:'الليثيوم في أعلى المجموعة، وكثافته أقل'}]},
   {q:'أيهما أكثر صلابة: البوتاسيوم أم السيزيوم؟',opts:[{t:'البوتاسيوم',ok:true,why:'الفلزات تصير أكثر ليونة نزولاً: السيزيوم طري للغاية'},{t:'السيزيوم',why:'السيزيوم أسفل البوتاسيوم، فهو ألين منه'}]},
   {q:'أيهما أعلى درجة انصهار: الصوديوم أم الروبيديوم؟',opts:[{t:'الصوديوم',ok:true,why:'٩٨ °C مقابل ٣٩ °C: الانصهار يقلّ نزولاً'},{t:'الروبيديوم',why:'الروبيديوم أسفل الصوديوم، فانصهاره أقل'}]},
   {q:'الفرانسيوم Fr تحت السيزيوم في المجموعة. ماذا تتوقع لانصهاره وليونته؟',opts:[{t:'انصهاره أقل من Cs وهو أليّن',ok:true,why:'تنبّؤ من النمط: الانصهار يقلّ والفلز يلين نزولاً'},{t:'انصهاره أعلى من Cs وهو أصلد',why:'هذا عكس النمط'},{t:'مثل Cs تماماً',why:'الخصائص تتدرّج ولا تتطابق'}]}
  ];
  slide({id:'apply',ch:2,title:'طبّق: توقّع الخصائص',tag:'هدف ٦-٢',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'apply')},
   note:'<ul><li>أسئلة التطبيق من عرضك وعرض NotebookLM (أيهما أعلى كثافة: Li أم Na؟ أيهما أكثر صلابة؟ أيهما أعلى انصهاراً؟ على الجدول الدوري). دليل المعلم: «اطلب إليهم توقّع الخصائص الفيزيائية لعناصر أخرى تقع ضمن المجموعة، هم أقل دراية بها، كالفرانسيوم». الفرانسيوم مشع وغير مستقر (كتاب الطالب ص٢١).</li></ul>'});
})();

/* 12 Activity 1-1: aim, skills, materials, safety and method (student book p.22) */
slide({id:'act',ch:3,title:'نشاط ١-١: تفاعل بعض الفلزات القلوية مع الماء',tag:'الطريقة',
 html:function(){
  var S=['املأ الحوض الزجاجي الكبير إلى نصفه تقريباً بالماء. يمكن إضافة قطعة من ورق الترشيح لتحسين مراقبة الليثيوم والصوديوم.','أضف محلول الكاشف العام إلى الماء في الحوض، واخلطه جيداً إلى أن يصبح اللون الأخضر مرئياً بشكل واضح.','ضع شاشة حماية صغيرة بين الحوض والطلبة.','أخرج قطعة ليثيوم صغيرة من العبوة بالملقط، وضعها على ورق ترشيح لتجفيفها من الزيت.','ضع قطعة الليثيوم الجافة على قطعة الخزف، واقطعها بالمشرط لتحصل على قطعة صغيرة بحيث لا تزيد سماكتها عن ٥ mm.','مستخدماً الملقط، أسقط قطعة من الفلز على سطح الماء في الحوض الزجاجي.','سجّل الملاحظات في جدول النتائج.','كرّر التجربة بحوض ماء نظيف مع الصوديوم ثم مع البوتاسيوم.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:440px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--gold)">المهارات</div><div style="font-size:18px;line-height:1.35">ينجز التجربة ويسجّل الملاحظات والقياسات والتقديرات. يناقش الملاحظات التجريبية والبيانات ويقيّمها.</div></div>
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المواد والأدوات</div><div style="font-size:17px;line-height:1.35">عبوات فيها ليثيوم وصوديوم وبوتاسيوم محفوظة في الزيت، حوض زجاجي كبير، محلول كاشف عام، شاشات واقية، ملاقط صغيرة، ورق ترشيح، مشرط، قطعة من الخزف (السيراميك).</div></div>
    <div class="panel safe" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:#ffb3a8">⚠ احتياطات الأمان</div><ul style="margin:0;padding-inline-start:20px;font-size:17px;line-height:1.35"><li>ضع النظارة الواقية لحماية عينيك.</li><li>ارتدِ معطف المختبر، والبس القفازين الواقيين عند الضرورة.</li><li>اغسل يديك بعد انتهاء التجربة.</li><li>احفظ الفلزات القلوية والكاشف العام بعيداً عن اللهب.</li></ul></div></div>
   <div class="panel" style="flex:1;min-width:0;padding:10px 16px;gap:4px"><div style="font-size:22px;font-weight:800;color:var(--gold)">الطريقة</div><ol class="acts">${S.map(function(s){return '<li>'+s+'</li>'}).join('')}</ol>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">ننفّذ التجربة افتراضياً في الشريحة التالية، ثم نجيب أسئلة النشاط.</div></div></div>`;},
 init:function(el){ later(function(){ unhide(el) },400) },
 note:'<ul><li>نشاط ١-١ في كتاب الطالب ص٢٢، والمهارات من دليل المعلم (ينجز التجربة ويسجّل الملاحظات والقياسات والتقديرات؛ يناقش الملاحظات التجريبية والبيانات ويقيّمها). الخطوات الثماني والمواد والأمان منقولة من الكتاب بتصرّف قليل.</li><li><b>ملاحظات الدليل للتنفيذ:</b> يمكن استخدام ورق الترشيح لرؤية احتراق الصوديوم (لهب أصفر) لكن لا يُستخدم مع البوتاسيوم. يُتخلّص من بقايا الليثيوم والصوديوم بتفاعلها مع الإيثانول، ومن بقايا البوتاسيوم بـ ٢-ميثيل بروبان-٢-أول. هذا النشاط تجربة عرض ينفّذها المعلم خلف شاشة حماية.</li><li>الخطوة الأخيرة (٨): كرّر التجربة بماء نظيف مع الصوديوم ثم البوتاسيوم.</li></ul>'});

/* 13 virtual lab for Activity 1-1 */
slide({id:'lab',ch:3,title:'نشاط ١-١: تجربة افتراضية',tag:'أسقط ولاحظ',cls:'labs',
 html:function(){
  var K=[['li','Li','الليثيوم'],['na','Na','الصوديوم'],['k','K','البوتاسيوم']];
  var row=function(k,sym,nm){return '<tr data-k="'+k+'"><td><b class="num">'+sym+'</b><div class="nm">'+nm+'</div></td>'+
    '<td><span class="yn" data-t="melt"><button type="button" data-v="1" disabled>نعم</button><button type="button" data-v="0" disabled>لا</button></span></td>'+
    '<td><span class="yn" data-t="ign"><button type="button" data-v="1" disabled>نعم</button><button type="button" data-v="0" disabled>لا</button></span></td>'+
    '<td><span class="yn" data-t="col"><button type="button" data-v="p" disabled>بنفسجي</button><button type="button" data-v="g" disabled>أخضر</button></span></td></tr>'};
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 12px">${troughSVG()}</div>
    <div class="chips" style="gap:8px;justify-content:center">${K.map(function(k){return '<button type="button" class="btn acc dropb" data-k="'+k[0]+'">أسقط <span class="num">'+k[1]+'</span></button>'}).join('')}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:450px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 12px"><table class="lab-t"><thead><tr><th>الفلز</th><th>ينصهر؟</th><th>يشتعل الغاز؟</th><th>لون الماء</th></tr></thead><tbody>${K.map(function(k){return row(k[0],k[1],k[2])}).join('')}</tbody></table></div>
    <div class="panel" style="padding:8px 14px;gap:4px"><div style="font-size:19px;font-weight:800;color:var(--gold)">معايير النجاح في النشاط</div>
     <div class="skills"><div class="sk" id="k1"><i>✓</i><span>أنفّذ التجربة وأسجّل الملاحظات.</span></div><div class="sk" id="k2"><i>✓</i><span>أناقش الملاحظات وأقيّمها.</span></div></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px"><b>Li</b> يتفاعل بثبات، و<b>Na</b> ينصهر ويتفاعل بشدة، و<b>K</b> ينصهر ويشتعل بلهب بنفسجي. وكلها تحوّل الكاشف إلى <b>بنفسجي</b>: المحلول قلوي.</div></div></div>`;},
 init:function(el){
  var tr=$('#tr',el), dropped={}, rowsOk=0;
  var ANS={li:{melt:'0',ign:'0',col:'p'},na:{melt:'1',ign:'0',col:'p'},k:{melt:'1',ign:'1',col:'p'}};
  var SAY={li:'الليثيوم يطفو ويتحرك ويتفاعل بثبات ولا ينصهر',na:'الصوديوم ينصهر ويتحرك بسرعة ويتفاعل بشدة',k:'البوتاسيوم ينصهر ويشتعل الهيدروجين بلهب بنفسجي'};
  $$('.dropb',el).forEach(function(b){b.addEventListener('click',function(){
    var k=b.getAttribute('data-k'); $$('.dropb',el).forEach(function(x){x.disabled=true});
    var w=$('.wtr',tr); w.style.transition='none'; tr.setAttribute('class','tr'); void tr.getBoundingClientRect(); w.style.transition=''; void tr.offsetWidth;
    tr.setAttribute('class','tr run '+k);
    say($('.fb',el),SAY[k],'ok');
    later(function(){ tr.classList.add('done') },3000);
    later(function(){ $$('.dropb',el).forEach(function(x){x.disabled=false}); if(!dropped[k]){ dropped[k]=1; $$('tr[data-k="'+k+'"] .yn button',el).forEach(function(x){x.disabled=false}) } },3600);
  })});
  $$('tbody tr',el).forEach(function(tr2){
    var k=tr2.getAttribute('data-k'), got={};
    $$('.yn',tr2).forEach(function(yn){ $$('button',yn).forEach(function(bt){bt.addEventListener('click',function(){
      var t=yn.getAttribute('data-t');
      if(bt.getAttribute('data-v')===ANS[k][t]){ $$('button',yn).forEach(function(x){x.disabled=true}); bt.classList.add('ok-b'); got[t]=1;
        if(got.melt&&got.ign&&got.col){ tr2.classList.add('ok'); rowsOk++; say($('.fb',el),'✓ سجّلتَ ملاحظات '+({li:'الليثيوم',na:'الصوديوم',k:'البوتاسيوم'})[k]+' كاملة','ok'); if(rowsOk===3){ $('#k1',el).classList.add('done'); $('#k2',el).classList.add('done'); unhide(el) } } }
      else{ bt.classList.add('bad-b','shake'); later(function(){bt.classList.remove('shake')},340); say($('.fb',el),'راجع ما رأيته في الحوض وأعد المحاولة','bad') }
    })})});
  });
 },
 note:'<ul><li>نشاط ١-١ (كتاب الطالب ص٢٢) بصيغة افتراضية: يُسقط الطالب قطعة Li ثم Na ثم K في ماء فيه كاشف عام (أخضر)، ويسجّل: هل انصهر الفلز؟ هل اشتعل الغاز؟ ولون الماء في النهاية. إجابات الدليل: «K الأنشط ثم Na ثم Li (تؤكدها زيادة الحركة والفوران والسرعة)، ولون الماء (الكاشف العام) يبيّن أن المحلول قلوي». جدول ١-٣ في الكتاب: Li يطفو ويتحرك ويتفاعل بثبات؛ Na يطفو ويتحرك وينصهر ويتفاعل بشدة؛ K يطفو ويتحرك وينصهر ويتفاعل مشتعلاً بلهب بنفسجي.</li><li>الصوديوم حر الحركة لا يشتعل غازه عادةً (كتاب الطالب ص٢١)، ولذلك عندي «لا» في عمود اشتعال Na. المحاكاة تخطيطية: الألوان والحركات تقريبية.</li><li>معيارا النجاح هما مهارتا الدليل نفسهما.</li></ul>'});

/* 14 the questions of Activity 1-1 */
(function(){
  var items=[
   {q:'<b>سؤال ١ (نشاط ١-١):</b> رتّب الفلزات الثلاثة من الأكثر نشاطاً إلى الأقل.',opts:[{t:'<span class="num">K &gt; Na &gt; Li</span>',ok:true,why:'يزداد الفوران والسرعة والعنف نزولاً: K ثم Na ثم Li'},{t:'<span class="num">Li &gt; Na &gt; K</span>',why:'هذا عكس الترتيب: الليثيوم الأقل نشاطاً'},{t:'<span class="num">Na &gt; K &gt; Li</span>',why:'K أنشط من Na: يشتعل غازه تلقائياً'}]},
   {q:'<b>سؤال ٢:</b> ما نوع وسط المحلول بعد انتهاء التفاعل؟ فسّر.',opts:[{t:'قلوي، لأن الكاشف العام صار بنفسجياً',ok:true,why:'تفاعل الفلز مع الماء يكوّن هيدروكسيداً ذائباً: محلولاً قلوياً'},{t:'حمضي، لأن الكاشف العام صار أحمر',why:'الكاشف صار بنفسجياً لا أحمر'},{t:'متعادل، لأن الكاشف بقي أخضر',why:'اللون تغيّر إلى البنفسجي'}]},
   {q:'<b>سؤال ٣:</b> أي معادلة صحيحة موزونة لتفاعل الصوديوم مع الماء؟',opts:[{t:eqn('2Na(s) + 2H2O(l) → 2NaOH(aq) + H2(g)'),ok:true,why:'موزونة: ٢ Na و٤ H و٢ O في الطرفين'},{t:eqn('Na(s) + H2O(l) → NaOH(aq) + H2(g)'),why:'غير موزونة: ذرتا H في المتفاعلات وثلاث في النواتج'},{t:eqn('2Na(s) + H2O(l) → Na2O(s) + H2(g)'),why:'الناتج هيدروكسيد الصوديوم لا أكسيده'}]}
  ];
  slide({id:'actq',ch:3,title:'أسئلة نشاط ١-١',tag:'ص٢٢',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'actq')},
   note:'<ul><li>أسئلة نشاط ١-١ في كتاب الطالب ص٢٢: (١) رتّب الفلزات الثلاثة وفقاً لنشاطها موضحاً كيف تثبت نتائجك هذا الترتيب؛ (٢) ما نوع وسط المحلول بعد انتهاء التفاعل؟ فسّر؛ (٣) اكتب معادلة كيميائية رمزية موزونة لكل تفاعل. إجابات الدليل: K ثم Na ثم Li؛ قلوي (الكاشف العام يتحول إلى البنفسجي)؛ المعادلات (سنبنيها بأيدينا في ميزان الموازنة بعد قليل). حوّلت الأسئلة المفتوحة إلى اختيار.</li></ul>'});
})();

/* 15 the reaction with water: table 1-3 and the general equation */
slide({id:'water',ch:3,title:'التفاعل مع الماء وتدرّج النشاط',tag:'جدول ١-٣',
 html:function(){
  var items=[
   ['الليثيوم <span class="num">Li</span> · الأقل نشاطاً','يطفو ويتحرك على سطح الماء ويتفاعل بشكل ثابت ومنتظم. '+eqn('2Li(s) + 2H2O(l) → 2LiOH(aq) + H2(g)')],
   ['الصوديوم <span class="num">Na</span>','يطفو ويتحرك وينصهر ويتفاعل بشدة. '+eqn('2Na(s) + 2H2O(l) → 2NaOH(aq) + H2(g)')],
   ['البوتاسيوم <span class="num">K</span> · الأكثر نشاطاً','يطفو ويتحرك وينصهر ويتفاعل مشتعلاً بشدة مكوّناً لهباً بنفسجي اللون. '+eqn('2K(s) + 2H2O(l) → 2KOH(aq) + H2(g)')]];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة: <span style="color:var(--gold)">↓ زيادة النشاط الكيميائي</span></div>
    ${cardsHTML(items,'tight')}
    <div class="gbar hide" id="gb" style="font-size:20px">كلما نزلنا في المجموعة <b>زاد النشاط الكيميائي</b>: الليثيوم الأقل نشاطاً والسيزيوم الأكثر نشاطاً (بين الفلزات الشائعة).</div></div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800;color:var(--gold)">في كل حالة</div><div style="font-size:24px;font-weight:700;line-height:1.5;text-align:center">فلز + ماء ← هيدروكسيد الفلز + هيدروجين</div></div>
    <div class="panel" style="padding:10px 16px;gap:4px"><ul class="wl"><li>التفاعل <b>طارد للحرارة</b>: تكفي لصهر Na وK.</li><li>Rb وCs <b>ينفجران</b> فور وضعهما في الماء.</li><li>الهيدروكسيد <b>يذوب</b> فيعطي محلولاً <b>قلوياً</b>.</li></ul></div></div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٢٠–٢١ وجدول ١-٣: Li يطفو ويتحرك ويتفاعل بشكل ثابت ومنتظم؛ Na يطفو ويتحرك وينصهر ويتفاعل بشدة؛ K يطفو ويتحرك وينصهر ويتفاعل مشتعلاً بشدة مكوّناً لهباً بنفسجياً. التفاعلات طاردة للحرارة والحرارة كافية لصهر Na وK، أما Li فلا ينصهر. Rb وCs ينفجران مباشرة. الفرانسيوم مشع وغير مستقر للاستخدامات الشائعة. هيدروكسيد الفلز يذوب مكوّناً محلولاً قلوياً.</li><li>دليل المعلم: «اعرض النشاط الكيميائي للفلزات القلوية باستخدام التفاعل مع الماء... وتوسّع في شرح فكرة تدرّج الخصائص... وتوقّع النشاط الكيميائي لبعض اللافلزات...».</li><li>سؤال ١-١٠ في كتاب الطالب: السيزيوم تحت البوتاسيوم، وضّح نشاطه مع الماء مقارنة بالبوتاسيوم (يتفاعل بعنف أكبر).</li></ul>'});
