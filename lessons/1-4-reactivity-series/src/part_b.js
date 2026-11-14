/* ---------- lesson 1-4, part B: reactions with water, steam and dilute acid; Activity 1-2 ---------- */

/* 6 Table 1-4 (student book p.25): which metals react with water and with dilute hydrochloric acid */
slide({id:'tbl14',ch:2,title:'الجدول ١-٤: التفاعل مع الماء والحمض المخفف',tag:'اسحب كل وصف إلى مكانه',
 html:function(){
  var G=[['K','Na','Ca','Mg'],['Al','Zn','Fe'],['Pb','Cu','Ag']], K=[['w1','w1'],['a1','a1']];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="t14"><div class="ch">الفلزات</div><div class="ch">التفاعل مع الماء</div><div class="ch">التفاعل مع حمض HCl المخفف</div>
     ${G.map(function(g,i){return '<div class="cl">'+serStrip(g,{cls:'mini'})+'</div><div class="mslot" data-k="w'+(i+1)+'"><span class="ph">...</span></div><div class="mslot" data-k="a'+(i+1)+'"><span class="ph">...</span></div>'}).join('')}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div>
    <div class="sm" style="font-size:16px;background:rgba(6,20,44,.82);border-radius:10px;padding:2px 12px;align-self:center">الألومنيوم: لا يظهر تفاعله إلا بعد إزالة طبقة أكسيده الواقية عن سطحه.</div></div>
   <div class="col" style="width:350px;flex:none;gap:10px;justify-content:center">
    <div id="tray" class="tray" style="display:flex;flex-direction:column;gap:7px;align-items:stretch"></div>
    <div class="gbar hide" id="gb" style="font-size:19px">كلما نزلنا في السلسلة <b>قلّ النشاط</b>. الفلزات الأنشط خطرة مع الحمض، فلا نجرّبها في المختبر.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['w1','تتفاعل مع الماء البارد وتنتج غاز الهيدروجين'],['a1','تتفاعل بشكل قوي جداً وتنتج غاز الهيدروجين'],['w2','تتفاعل مع بخار الماء عند تسخينها وتنتج الهيدروجين'],['a2','تتفاعل بشكل أقل قوة وتنتج غاز الهيدروجين'],['w3','لا تتفاعل مع الماء'],['a3','لا تتفاعل مع الحمض']],{css:'font-size:17px;padding:5px 10px;line-height:1.3',more:'صح! كمّل',done:'ممتاز: رتّبتَ الجدول ١-٤',bad:'فكّر: كم يبعد هذا الفلز عن أعلى السلسلة؟'});
 },
 note:'<ul><li>كتاب الطالب ص٢٥ (الجدول ١-٤): K وNa وCa وMg: تتفاعل مع الماء البارد، ومع HCl بشكل قوي جداً؛ Al وZn وFe: تتفاعل مع بخار الماء عند تسخينها، ومع الحمض بقوة أقل؛ Pb وCu وAg: لا تتفاعل. الهامش (١): تحدث تفاعلات الألومنيوم فقط بعد إزالة طبقة الحماية المكوّنة من أكسيد الألومنيوم عن سطح الفلز.</li><li>الكتاب (ص٢٥): تفاعل الفلزات القلوية مع الحمض «شديد جداً، لذا يُفضّل تجنّب إجراء مثل هذه التفاعلات». الجدول يبيّن أن الرصاص «لا يتفاعل» مع الماء والحمض، رغم أنه فوق الهيدروجين في السلسلة (يتفاعل ببطء شديد جداً): <b>تعارض</b> بين موقعه في السلسلة والجدول، اتبعتُ الجدول وأشرتُ إليه في README.</li></ul>'});

/* 7 reactions with cold water (student book p.25) */
slide({id:'cold',ch:2,title:'الفلزات في الماء البارد',tag:'أسقط وقارن',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 6px">${rackHTML('rk1',COLD)}</div>
    <div class="fb" style="min-height:24px;text-align:center;font-size:20px"></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الأنشط يتفاعل مع الماء البارد: <b>K ثم Na ثم Ca</b>، و<b>Mg</b> بطيء جداً، أما <b>Zn</b> و<b>Cu</b> فلا يتفاعلان.</div></div>
   <div class="col" style="width:330px;flex:none;gap:10px;justify-content:center">
    <button type="button" class="btn acc" id="go">أسقط الفلزات في الماء البارد</button>
    <div class="panel compact hide" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:21px;font-weight:800">ما ناتجا تفاعل الكالسيوم مع الماء البارد؟</div>
     ${optsHTML([{t:'هيدروكسيد الكالسيوم والهيدروجين'},{t:'أكسيد الكالسيوم والهيدروجين'},{t:'هيدروكسيد الكالسيوم والأكسجين'}])}<div class="fb2" style="min-height:24px"></div></div></div></div>`;},
 init:function(el){
  bindRack(el,'rk1',COLD,'#go',function(){ $('#q',el).classList.remove('hide'); say($('.fb',el),'رتّب الفلزات بحسب عدد الفقاعات: أيّها الأنشط؟','') });
  bindMcq($('#q',el),[{t:'',ok:true,why:eqn('Ca(s) + 2H2O(l) → Ca(OH)2(aq) + H2(g)')},{t:'',why:'مع الماء البارد يتكوّن هيدروكسيد لا أكسيد'},{t:'',why:'الغاز الناتج هيدروجين لا أكسجين'}],$('.fb2',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٢٥: يتفاعل الكالسيوم مع الماء البارد بسرعة لإنتاج الهيدروجين: كالسيوم + ماء ← هيدروكسيد الكالسيوم + هيدروجين، «Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)». ويذوب الهيدروكسيد قليلاً في الماء (ماء الجير). «ورغم الشبه بين هذا التفاعل وتفاعل الفلزات القلوية مع الماء، إلا أنه ليس بذات الشدة». والماغنيسيوم يتفاعل «بشكل بطيء جداً عند وضعه في الماء البارد».</li><li>الرسم تخطيطي: عدد الفقاعات وسرعتها يدلّان على شدة التفاعل (K أشد ثم Na ثم Ca ثم Mg ثم لا شيء). لهب K البنفسجي من الكتاب ص٢١. <b>ملاحظة:</b> الخارصين والنحاس لا يظهر لهما تفاعل مع الماء البارد (الجدول ١-٤: الخارصين يتفاعل مع بخار الماء فقط).</li></ul>'});

/* 8 water or steam (student book p.25, questions 1-14 and 1-15) */
slide({id:'steam',ch:2,title:'الماء البارد أم بخار الماء؟',tag:'الناتج يتغيّر',
 html:function(){
  var rows=[
   ['يتكوّن <b>هيدروكسيد</b> الفلز مع غاز الهيدروجين','c','مع الماء البارد: هيدروكسيد الفلز + هيدروجين'],
   ['يتكوّن <b>أكسيد</b> الفلز مع غاز الهيدروجين','s','مع بخار الماء: أكسيد الفلز + هيدروجين'],
   ['الماغنيسيوم يتفاعل <b>ببطء شديد</b>','c','Mg في الماء البارد بطيء جداً'],
   ['الماغنيسيوم <b>يتوهّج</b> ويتفاعل بشدة','s','فوق الماغنيسيوم الساخن يتوهّج في البخار'],
   ['الخارصين والحديد يتفاعلان','s','لا يتفاعلان مع الماء البارد، ويتفاعلان مع البخار عند التسخين']];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:520px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:10px 14px;gap:6px"><div style="font-size:19px;font-weight:800;color:var(--cyan)">ماء بارد (بطيء جداً)</div><div class="bigeq" style="font-size:25px;direction:ltr;text-align:center">${eqn('Mg(s) + 2H2O(l) → Mg(OH)2(aq) + H2(g)')}</div></div>
    <div class="panel" style="padding:10px 14px;gap:6px"><div style="font-size:19px;font-weight:800;color:var(--gold)">بخار الماء (فلز ساخن)</div><div class="bigeq" style="font-size:25px;direction:ltr;text-align:center">${eqn('Mg(s) + H2O(g) → MgO(s) + H2(g)')}</div><div class="bigeq" style="font-size:25px;direction:ltr;text-align:center">${eqn('Zn(s) + H2O(g) → ZnO(s) + H2(g)')}</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="clsw" style="max-width:none">${clsHTML(rows,[['c','ماء بارد'],['s','بخار']],19)}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div>
    <div class="gbar hide" id="gb" style="font-size:19px">الماء البارد ← <b>هيدروكسيد</b>، والبخار الساخن ← <b>أكسيد</b>. وكلاهما يعطي الهيدروجين.</div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>كتاب الطالب ص٢٥: «ويمكن تسريع هذا التفاعل باستخدام الماء الساخن، أو الحصول على تفاعل أكثر شدة بتمرير بخار الماء فوق الماغنيسيوم الساخن، فيتوهج الماغنيسيوم لتكوين غاز الهيدروجين وأكسيد الماغنيسيوم»: Mg(s) + H₂O(g) → MgO(s) + H₂(g). وللخارصين: Zn(s) + H₂O(g) → ZnO(s) + H₂(g). السؤال ١-١٤ (Mg مع الماء) وجوابه في الدليل: Mg(s) + 2H₂O(l) → Mg(OH)₂(aq) + H₂(g)؛ والسؤال ١-١٥ (Mg مع البخار): أكسيد الماغنيسيوم والهيدروجين.</li><li><b>تعارض:</b> حالة Mg(OH)₂: الدليل يكتبها (aq) رغم أنه قليل الذوبان (الملخص يكتبها (s))؛ اتبعتُ الدليل.</li></ul>'});

/* 9 Activity 1-2: iron wool and steam (student book p.24): the text */
slide({id:'act12',ch:2,title:'نشاط ١-٢: تفاعل الصوف الحديدي مع بخار الماء',tag:'الطريقة',
 html:function(){
  var S=['ضع شاشات واقية (أو عازلة) لحماية الطلبة.','ضع الصوف المعدني في قاع أنبوبة التسخين وبلّله بالماء مستخدماً ماصة القطارة، ثم اربط الأنبوبة بشكل أفقي.','ضع الصوف الحديدي داخل الأنبوبة عند المنتصف تقريباً.','أدخل السدادة المزوّدة بأنبوبة التوصيل، وضع أنبوبة التوصيل في حوض الماء.','سخّن الصوف الحديدي بموقد بنزن إلى أن يتوهج.','انقل الموقد نحو الصوف المبلل حتى يتبخر الماء.','اجمع غاز الهيدروجين الناتج في أنبوبة اختبار مقلوبة مملوءة بالماء فوق أنبوبة التوصيل.','لإنهاء التجربة: أخرج أنبوبة التوصيل من الماء قبل التوقف عن التسخين.','اختبر غاز الهيدروجين الذي جمعته.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="width:430px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--gold)">المهارات</div><div style="font-size:18px;line-height:1.35">ينجز التجربة ويسجّل الملاحظات والقياسات والتقديرات. يناقش الملاحظات التجريبية والبيانات ويقيّمها.</div></div>
    <div class="panel" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المواد والأدوات</div><div style="font-size:16.5px;line-height:1.35">شاشات واقية، أنبوبة تسخين، سدادة بأنبوبة توصيل، موقد بنزن وأعواد خشبية، حامل معقوف مع مشبك، أنابيب اختبار وسدادات، حوض ماء، صوف صلب من الحديد، صوف معدني، ماصة قطارة.</div></div>
    <div class="panel safe" style="padding:8px 14px;gap:3px"><div style="font-size:20px;font-weight:800;color:#ffb3a8">⚠ احتياطات الأمان</div><ul style="margin:0;padding-inline-start:20px;font-size:16.5px;line-height:1.35"><li>ضع النظارة الواقية لحماية عينيك.</li><li>ارتدِ معطف المختبر، والبس القفازين عند الضرورة.</li><li>اغسل يديك بعد التجربة.</li><li>أزل أنبوبة التوصيل من الماء قبل التوقف عن التسخين.</li></ul></div></div>
   <div class="panel" style="flex:1;min-width:0;padding:10px 16px;gap:4px"><div style="font-size:22px;font-weight:800;color:var(--gold)">الطريقة</div><ol class="acts">${S.map(function(s){return '<li>'+s+'</li>'}).join('')}</ol>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">ننفّذ التجربة افتراضياً في الشريحة التالية.</div></div></div>`;},
 init:function(el){ later(function(){ unhide(el) },400) },
 note:'<ul><li>نشاط ١-٢ في كتاب الطالب ص٢٤: الخطوات الإحدى عشرة والمواد والأمان منقولة بتصرّف قليل (دمجتُ الخطوتين ٨ و٩ في خطوة واحدة). المهارات من دليل المعلم. دليل المعلم (فكرة تدريس): «اجعل من النشاط ١-٢ تفاعل الصوف الحديدي مع بخار الماء عرضاً لتوضّح كيف يتغيّر التفاعل وفقاً لظروف إجرائه»؛ فهو عرض يقوم به المعلم.</li><li>ملاحظات الدليل: يحتاج الصوف الحديدي إلى تسخين أطول؛ الغاز المجموع في البداية يكون في معظمه هواءً؛ وتُزال أنبوبة التوصيل قبل إيقاف التسخين (حتى لا يرتد الماء إلى الأنبوبة الساخنة).</li></ul>'});

/* 10 virtual lab for Activity 1-2 */
slide({id:'lab12',ch:2,title:'نشاط ١-٢: تجربة افتراضية',tag:'اتبع الخطوات',cls:'labs',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 10px">${apparatusSVG()}</div>
    <div class="fb" style="min-height:48px;text-align:center;font-size:20px"></div></div>
   <div class="col" style="width:390px;flex:none;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 12px;gap:6px"><div style="font-size:20px;font-weight:800;color:var(--gold)">الخطوات (بالترتيب)</div>
     <button type="button" class="btn acc lb" data-s="1">١. سخّن الصوف الحديدي حتى يتوهج</button>
     <button type="button" class="btn acc lb" data-s="2" disabled>٢. انقل اللهب إلى الصوف المبلل</button>
     <button type="button" class="btn acc lb" data-s="3" disabled>٣. أخرج أنبوبة التوصيل من الماء ثم أطفئ الموقد</button>
     <button type="button" class="btn acc lb" data-s="4" disabled>٤. اختبر الغاز بشظية مشتعلة</button></div>
    <div class="panel" style="padding:8px 14px;gap:4px"><div style="font-size:19px;font-weight:800;color:var(--gold)">معايير النجاح في النشاط</div>
     <div class="skills"><div class="sk" id="k1"><i>✓</i><span>أنفّذ التجربة وأسجّل الملاحظات.</span></div><div class="sk" id="k2"><i>✓</i><span>أناقش الملاحظات وأقيّمها.</span></div></div></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">حديد + بخار الماء ← <b>أكسيد الحديد + هيدروجين</b>:<br>${eqn('Fe(s) + H2O(g) → FeO(s) + H2(g)')}<br>${eqn('2Fe(s) + 3H2O(g) → Fe2O3(s) + 3H2(g)')}</div></div></div>`;},
 init:function(el){
  var ap=$('#ap',el), fb=$('.fb',el), btn=$$('.lb',el);
  var MSG={1:'الصوف الحديدي يتوهج قليلاً ويتحوّل إلى الأسود.',2:'يتبخر الماء ويمرّ البخار فوق الحديد الساخن، ويتجمّع غاز في الأنبوبة المقلوبة.',3:'أخرجتَ الأنبوبة قبل إطفاء الموقد: هكذا لا يرتدّ الماء إلى الأنبوبة الساخنة.',4:'الغاز يُحدث فرقعة مع الشظية المشتعلة: إنه الهيدروجين.'};
  btn.forEach(function(b){b.addEventListener('click',function(){
    var s=+b.getAttribute('data-s'); b.disabled=true; b.classList.add('done');
    ap.classList.add('s'+s); say(fb,MSG[s],'ok');
    if(s<4){ var nx=btn[s]; later(function(){nx.disabled=false},s===1?1800:1200) }
    else{ $('#k1',el).classList.add('done'); $('#k2',el).classList.add('done'); later(function(){unhide(el)},600) }
  })});
 },
 note:'<ul><li>نشاط ١-٢ بصيغة افتراضية على خطواته (كتاب الطالب ص٢٤). إجابات دليل المعلم: «الصوف الحديدي يتوهج قليلاً ويتحول إلى الأسود؛ اختبار الهيدروجين بشظية مشتعلة يعطي فرقعة». سؤال ١ في النشاط: «حديد + بخار الماء ← أكسيد الحديد (II) + هيدروجين» أو «← أكسيد الحديد (III) + هيدروجين». سؤال ٢: Fe(s) + H₂O(g) → FeO(s) + H₂(g)؛ ٢Fe(s) + ٣H₂O(g) → Fe₂O₃(s) + ٣H₂(g). وكلاهما مقبول.</li><li>الغاز المجموع في البداية يكون في معظمه هواءً (ملاحظة الدليل)، والمحاكاة تخطيطية.</li><li>معيارا النجاح هما مهارتا الدليل نفسهما.</li></ul>'});

/* 11 reactions with dilute hydrochloric acid (student book p.25, questions 1-16 and 1-17) */
slide({id:'acid',ch:2,title:'الفلزات وحمض الهيدروكلوريك المخفف',tag:'أضف الحمض وقارن',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div class="panel" style="padding:8px 6px">${rackHTML('rk2',ACID)}</div>
    <div class="panel" style="padding:8px 14px;gap:4px"><div class="bigeq" style="font-size:25px;direction:ltr;text-align:center">${eqn('Mg(s) + 2HCl(aq) → MgCl2(aq) + H2(g)')}</div><div class="bigeq" style="font-size:25px;direction:ltr;text-align:center">${eqn('Zn(s) + 2HCl(aq) → ZnCl2(aq) + H2(g)')}</div></div>
    <div class="fb" style="min-height:24px;text-align:center;font-size:20px"></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">فلز + حمض HCl ← <b>كلوريد الفلز + هيدروجين</b>. الفلزات <b>فوق H</b> تتفاعل، ويقلّ العنف نزولاً، والنحاس (تحت H) لا يتفاعل.</div></div>
   <div class="col" style="width:350px;flex:none;gap:10px;justify-content:center">
    <button type="button" class="btn acc" id="go2">أسقط الفلزات في الحمض</button>
    <div class="panel compact hide" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:21px;font-weight:800">رتّب <span class="num">Mg</span> و<span class="num">Zn</span> و<span class="num">Fe</span> من الأنشط إلى الأقل:</div>
     ${optsHTML([{t:'Mg ثم Zn ثم Fe'},{t:'Fe ثم Zn ثم Mg'},{t:'Zn ثم Mg ثم Fe'}])}<div class="fb2" style="min-height:24px"></div></div></div></div>`;},
 init:function(el){
  bindRack(el,'rk2',ACID,'#go2',function(){ $('#q',el).classList.remove('hide'); say($('.fb',el),'الفلز الأنشط يعطي فقاعات أكثر وأسرع.','') });
  bindMcq($('#q',el),[{t:'',ok:true,why:'Mg أكثر فقاعات، ثم Zn، ثم Fe الأبطأ'},{t:'',why:'هذا عكس الترتيب: الحديد أبطأ الثلاثة'},{t:'',why:'الماغنيسيوم أنشط من الخارصين'}],$('.fb2',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٢٥: «ويصبح تفاعل فلز الماغنيسيوم مع الأحماض المُخفّفة آمناً بما يكفي وفقاً للآتي: ماغنيسيوم + حمض الهيدروكلوريك ← كلوريد الماغنيسيوم + هيدروجين». «تعدّ فلزات الألومنيوم والخارصين والحديد معتدلة النشاط، فهي لا تتفاعل بشكل ملحوظ مع الماء البارد، وتُعطي فقط دلالات على حدوث تفاعل... ». «وتقلّ شدة التفاعلات عند الانتقال من الأعلى إلى الأسفل في سلسلة النشاط». المعادلات: ٢Al + ٦HCl → ٢AlCl₃ + ٣H₂ (في شريحة الموازنة)، و١-١٦: Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g).</li><li>الرسم تخطيطي: عدد الفقاعات وسرعتها يدلّان على شدة التفاعل.</li></ul>'});
