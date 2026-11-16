/* ---------- part E: worked examples, calculations and the practical investigations (student book pp. 100-101; activity book Activities 3-3, practical investigations 3-1 and 3-2) ---------- */

/* a slide of one calculation with an energy-flow figure on the left and the steps on the right */
function flowSlide(o){
  slide({id:o.id,ch:o.ch,title:o.title,tag:o.tag,
   html:function(){
    return '<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1.05;min-width:0;gap:8px;justify-content:center"><div class="panel" style="padding:6px 10px">'+eflow(o.flow)+'</div>'+(o.cap?'<div class="sm" style="font-size:16px;color:var(--muted);text-align:center">'+o.cap+'</div>':'')+'</div>'+
     '<div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">'+o.steps.map(function(h){return '<div class="panel pb" data-pt style="font-size:'+(o.fs||21)+'px">'+h+'</div>'}).join('')+'<div class="gbar hide" id="gb" style="font-size:21px">'+(o.gbar||'')+'</div></div></div>';
   },
   init:o.init,note:o.note});
}

/* 37 example, question 1: the energy lost in respiration by the secondary consumers (student book p. 100, figure 3-7) */
flowSlide({id:'exx',ch:5,title:'مثال: الطاقة المفقودة في التنفس',tag:'احسب X',
 flow:{top:'طاقة أشعة الشمس 1.6 × 10⁶',levels:[['الطاقة في المنتجات','72 567'],['الطاقة في المستهلكات الأولية',''],['الطاقة في المستهلكات الثانوية','']],down:['6421','598'],left:['23 009','2389','67'],right:['43 137','Y','X'],leftName:'المحلّلات',rightName:'التنفّس'},
 cap:'الشكل 3-7: مثال عملي (الوحدات kJ/m² year)',
 steps:['<b>السؤال 1:</b> ما مقدار الطاقة المفقودة في عملية التنفّس بواسطة المستهلكات الثانوية (السهم X)؟',
  'تذكّر: الطاقة التي تدخل المستهلكات الثانوية يجب أن تساوي الطاقة الخارجة منها. تدخل <b class="num">598</b> kJ/m² year، ويخرج <b class="num">67</b> منها إلى المحلّلات، والسهم الأخير هو سهم التنفّس X.',
  '<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">X = 598 − 67 = '+nin('x','kJ/m² year')+'</span><div class="fb" id="xfb" style="min-height:24px;font-size:19px"></div>',
  'تحقّق: سهما الخروج <b class="num">531</b> و<b class="num">67</b> مجموعهما <b class="num">598</b> = سهم الدخول، فالإجابة صحيحة.'],
 gbar:'X = 531 kJ/m² year',
 init:function(el){ bindNum($('.nin[data-n="x"]',el),531,.5,function(ok){ say($('#xfb',el),ok?'✓ 598 − 67 = 531 kJ/m² year':'اطرح ما يخرج إلى المحلّلات من الداخل',ok?'ok':'bad'); if(ok) unhide(el) }) },
 note:'<ul><li>كتاب الطالب ص١٠٠: المثال، السؤال 1 والشكل ٣-٧. الجواب X = 598 − 67 = 531 kJ/m² year (بنص الكتاب).</li></ul>'});

/* 38 example, question 2: percentage of energy transferred */
slide({id:'exp',ch:5,title:'مثال: النسبة المئوية للطاقة المنتقلة',tag:'احسب',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
   <div class="panel pb" data-pt style="font-size:21px"><b>السؤال 2:</b> ما النسبة المئوية للطاقة التي تنتقل من الشمس إلى المنتجات؟</div>
   <div class="panel pb" data-pt style="font-size:21px">من المفيد حساب النسبة المئوية لأنها تتيح المقارنة بين النظم البيئية المختلفة، حيث تختلف مدخلات الطاقة الأولية.</div>
   <div class="panel pb" data-pt style="font-size:21px">النسبة المئوية = الطاقة المنتقلة ÷ طاقة المستوى السابق × 100. الطاقة المنقولة إلى المنتجات <b class="num">72567</b> kJ/m² year، وطاقة المستوى السابق (الشمس) <b class="num">1.6 × 10<sup>6</sup></b> kJ/m² year.</div>
   <div class="panel pb" data-pt style="font-size:23px;text-align:center"><span style="direction:ltr;display:inline-block;font-family:var(--font-display)">(72567 ÷ 1.6×10<sup>6</sup>) × 100 = </span> ${nin('pc','%')}<div class="fb" id="pfb" style="min-height:24px;font-size:19px"></div></div>
   <div class="panel pb" data-pt style="font-size:21px">وقد تُعطى معلومات مماثلة لشكل هرم الطاقة: في هذه الحالة تُستخدم الأعداد الموجودة في الهرم لحساب النسبة المئوية؛ اقسم الرقم لأي مستوى غذائي معيّن على الرقم الخاص بالمستوى الغذائي السابق ثم اضربه في 100.</div></div>
   <div class="col" style="width:380px;flex:none;gap:10px;justify-content:center"><div class="panel" style="padding:12px 16px"><div class="sm" style="font-size:18px;color:var(--cyan);font-weight:800">القاعدة</div><div class="eqs" style="font-size:25px;line-height:1.5">نسبة النقل % = <span style="color:#fff">الطاقة في المستوى n+1</span><br>÷ <span style="color:#fff">الطاقة في المستوى n</span> × 100</div></div>
   <div class="gbar hide" id="gb" style="font-size:22px">4.54% فقط من طاقة الشمس تنتقل إلى المنتجات.</div></div></div>`;},
 init:function(el){ bindNum($('.nin[data-n="pc"]',el),4.54,0.03,function(ok){ say($('#pfb',el),ok?'✓ 4.54%':'قسّم 72567 على 1 600 000 ثم اضرب في 100',ok?'ok':'bad'); if(ok) unhide(el) }) },
 note:'<ul><li>كتاب الطالب ص١٠٠: المثال، السؤال 2: 72567 ÷ (1.6×10⁶) × 100 = 4.54%.</li></ul>'});

/* 39 how to read and draw energy pyramids (student book pp. 100-101) */
explain({id:'howp',ch:5,title:'تفسير رسوم الطاقة ورسم هرم الطاقة',tag:'اكتشف',
 lead:{q:'ما القاعدة التي تحكم الأسهم الداخلة والخارجة من كل صندوق في رسم تدفق الطاقة؟',
  opts:[{t:'مجموع القيم على الأسهم الداخلة يساوي مجموع القيم على الأسهم الخارجة',ok:true,why:'صح: لأن الطاقة لا تفنى'},{t:'الأسهم الداخلة دائماً أكبر',why:'تتساوى الطاقة الداخلة والخارجة'},{t:'الأسهم الخارجة دائماً أكبر',why:'تتساوى'}],
  gbar:'استخدم هذه القاعدة للتحقق من إجابتك.'},
 pts:['تمثّل رسوم الطاقة التخطيطية طريقة أخرى لتوضيح تدفق الطاقة في النظام البيئي، وهي تبيّن دخول الطاقة وانتقالها عبر المنتجات وفقدانها نتيجة التنفّس والإخراج.',
  'النقطة الرئيسية التي يجب تذكّرها أن كل الأسهم التي تذهب إلى مكان ما يجب أن تكون قيمها مساوية لمجموع الأسهم التي تخرج منه.',
  'يمكن استخدام الوحدات (kJ/m² year) أو وحدات تقديرية. والوحدات التقديرية هي وحدات قياس نسبية تستخدم للمقارنة بين الكميات، ولا يلزم اتباع نظام قياس عالمي موحّد (مثل 5 و10 و50 و100).',
  'لرسم هرم الطاقة تقريبياً: لا حاجة إلى رسمه وفقاً لمقياس، بل تُرسم الأشرطة أكبر أو أصغر تبعاً للأعداد المتوافرة.',
  'تُرسم المنتجات على الشريط الأدنى، يليها المستهلكات الأولية ثم الثانوية وصولاً إلى قمة السلسلة الغذائية.',
  'اكتب في كل شريط مسمى الكائن الحي في السلسلة الغذائية التي ترسمها.'],
 fs:20,gap:7,
 note:'<ul><li>كتاب الطالب ص١٠٠–١٠١: «تفسير الرسوم التخطيطية للطاقة ورسم أهرامات الطاقة» وبند 3 من الأسئلة (رسم تقريبي لهرم الطاقة).</li></ul>'});

/* 40 practice, question 1 (student book p. 101) */
flowSlide({id:'prac1',ch:5,title:'تدريب 1: الطاقة المستخدمة في التنفس',tag:'احسب Y والنسبة',
 flow:{top:'طاقة أشعة الشمس 1.6 × 10⁶',levels:[['الطاقة في المنتجات','72 567'],['الطاقة في المستهلكات الأولية','6421'],['الطاقة في المستهلكات الثانوية','598']],down:['6421','598'],left:['23 009','2389','67'],right:['43 137','Y','531'],leftName:'المحلّلات',rightName:'التنفّس'},
 cap:'الشكل 3-7 (الوحدات kJ/m² year)',
 steps:['<b>1 (أ):</b> احسب كمّية الطاقة التي تستخدمها المستهلكات الأولية الواردة في الشكل 3-7 في التنفّس (Y).',
  '<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:22px">الداخل 6421 = 2389 + 598 + Y ⇒ Y = '+nin('y','kJ/m² year')+'</span><div class="fb" id="yfb" style="min-height:24px;font-size:19px"></div>',
  '<b>1 (ب):</b> احسب النسبة المئوية للطاقة المنقولة بين المنتجات والمستهلكات الأولية.',
  '<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:22px">(6421 ÷ 72567) × 100 = '+nin('r','%')+'</span><div class="fb" id="rfb" style="min-height:24px;font-size:19px"></div>'],
 gbar:'Y = 3434 kJ/m² year، والنسبة ≈ 8.85%.',
 init:function(el){
  var d=0; function chk(){ if(++d===2) unhide(el) }
  bindNum($('.nin[data-n="y"]',el),3434,.5,function(ok){ say($('#yfb',el),ok?'✓ Y = 6421 − 2389 − 598 = 3434':'اطرح الخارج الآخر من الداخل: 6421 − 2389 − 598',ok?'ok':'bad'); if(ok) chk() });
  bindNum($('.nin[data-n="r"]',el),8.85,.06,function(ok){ say($('#rfb',el),ok?'✓ 6421 ÷ 72567 × 100 ≈ 8.85%':'قسّم 6421 على 72567 ثم اضرب في 100',ok?'ok':'bad'); if(ok) chk() });
 },
 note:'<ul><li>كتاب الطالب ص١٠١: أسئلة 1 (أ) و(ب) على الشكل ٣-٧. الإجابة (من عندي، الكتاب بلا إجابات): Y = 6421 − (2389 + 598) = 3434، والنسبة = 6421 ÷ 72567 × 100 ≈ 8.85%. وتحقق من مجموع المنتجات: 23009 + 43137 + 6421 = 72567.</li></ul>'});

/* 41 practice, question 2 (student book p. 101): an energy pyramid from 86 / 912 / 8000 */
slide({id:'prac2',ch:5,title:'تدريب 2: ارسم هرم الطاقة',tag:'اختر الهرم',
 html:function(){
  var P=[['A',[['عوالق نباتية',8000],['عوالق حيوانية',912],['أسماك',86]]],['B',[['أسماك',8000],['عوالق حيوانية',912],['عوالق نباتية',86]]],['C',[['عوالق نباتية',86],['عوالق حيوانية',912],['أسماك',8000]]]];
  var ch=[['b','أسماك',0],['n','عوالق نباتية',0]];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1.35;min-width:0;gap:9px;justify-content:center">
   <div class="panel pb" data-pt style="font-size:21px"><b>2 (أ):</b> ارسم رسماً تقريبياً لهرم طاقة للبيانات الآتية: الأسماك 86 وحدة تقديرية، والعوالق الحيوانية 912 وحدة تقديرية، والعوالق النباتية 8000 وحدة تقديرية. أي رسم يمثل الهرم الصحيح؟</div>
   <div class="panel" data-pt style="padding:8px 12px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${P.map(function(p,i){return '<button type="button" class="opt pyo" data-i="'+i+'" style="flex-direction:column;padding:6px;gap:4px;min-height:0;height:auto"><span style="font-weight:800;font-size:19px">'+['أ','ب','ج'][i]+'</span>'+pyrSVG(p[1],{w:210,h:30,fs:12})+'</button>'}).join('')}</div><div class="fb" id="pyf" style="min-height:24px;font-size:19px;margin-top:6px"></div></div>
   <div class="panel pb" data-pt style="font-size:21px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b>2 (ب):</b> احسب النسبة المئوية للطاقة المنقولة من العوالق الحيوانية إلى الأسماك: 86 ÷ 912 × 100 = ${nin('s1','%')}<div class="fb" id="s1f" style="flex:1 1 100%;min-height:22px;font-size:19px"></div></div></div>
   <div class="col" style="width:390px;flex:none;gap:9px;justify-content:center">
    <div class="panel pb" data-pt style="font-size:20px"><b>2 (ج):</b> يبلغ متوسط النسبة المئوية للطاقة المنقولة بين المنتجات والمستهلكات الأولية 10%. اقترح: لماذا يكون الانتقال من العوالق النباتية إلى الحيوانية أعلى من ذلك؟</div>
    <div class="panel" style="padding:10px 14px;gap:6px"><div class="sm" style="font-size:17px;color:var(--cyan);font-weight:800">النسبة هنا: 912 ÷ 8000 × 100 = ${nin('s2','%')}</div><div class="fb" id="s2f" style="min-height:22px;font-size:18px"></div></div>
    <div data-pt>${qaHTML([['لماذا تكون الكفاءة أعلى من 10%؟','تؤكل العوالق النباتية كلها (خلية كاملة) وتُهضم بسهولة وليس فيها جذور أو أجزاء صلبة لا تؤكل، فتنتقل طاقة أكبر؛ كما أن العوالق الحيوانية صغيرة تنفق طاقة قليلة في الحركة.']])}</div></div></div>`;},
 init:function(el){
  var fb=$('#pyf',el);
  $$('.pyo',el).forEach(function(b){ b.addEventListener('click',function(){ if(b.classList.contains('locked')) return; var ok=b.getAttribute('data-i')==='0'; if(ok){ b.classList.add('ok-b'); $$('.pyo',el).forEach(function(x){x.classList.add('locked')}); say(fb,'✓ الرسم (أ): القاعدة العريضة للمنتجات (8000) ثم 912 ثم 86','ok') } else { b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340); say(fb,'المنتجات في القاع وأكبر شريط، والأسماك في القمة وأصغر شريط','bad') } }) });
  bindNum($('.nin[data-n="s1"]',el),9.43,.06,function(ok){ say($('#s1f',el),ok?'✓ 86 ÷ 912 × 100 ≈ 9.43%':'قسّم 86 على 912 ثم اضرب في 100',ok?'ok':'bad') });
  bindNum($('.nin[data-n="s2"]',el),11.4,.1,function(ok){ say($('#s2f',el),ok?'✓ 11.4%، أكبر من 10%':'قسّم 912 على 8000 ثم اضرب في 100',ok?'ok':'bad') });
  bindCards(el,function(){});
 },
 note:'<ul><li>كتاب الطالب ص١٠١: السؤال 2 (أ، ب، ج). الإجابات من عندي: الرسم أ؛ 86 ÷ 912 × 100 ≈ 9.43%؛ 912 ÷ 8000 × 100 = 11.4%؛ والتفسير من نص ص٩٦–٩٧ (العوالق النباتية تؤكل كلها وسهلة الهضم).</li></ul>'});

/* 42 Activity 3-3, question 1: trophic level transfer efficiency (activity book p. 114) */
slide({id:'tlte',ch:5,title:'نشاط 3-3: كفاءة نقل المستوى الغذائي',tag:'احسب TLTE',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1.1;min-width:0;gap:7px;justify-content:center">
   <div class="panel pb" data-pt style="font-size:18px">${tm('كفاءة نقل المستوى الغذائي','Trophic level transfer efficiency (TLTE)')}: قياس كمّية الطاقة التي تنقل بين المستويات الغذائية.</div>
   <div class="panel pb" data-pt style="text-align:center"><div class="eqs" style="font-size:27px;line-height:1.6">TLTE = <span style="color:#fff">طاقة المستوى n+1</span> ÷ <span style="color:#fff">طاقة المستوى n</span> × 100%</div></div>
   <div class="panel pb" data-pt style="font-size:18px"><b>أ.</b> احسب كفاءة نقل المستوى الغذائي إذا كان لدى المستهلك الثاني 500 kcal وكان لدى المستهلك الأولي 4500 kcal: 500 ÷ 4500 × 100 = ${nin('a','%')}<div class="fb" id="af" style="min-height:22px;font-size:18px"></div></div>
   <div class="panel pb" data-pt style="font-size:18px"><b>ب.</b> الشكل 3-5: هرم الطاقة لنظام بيئي بحري (وحدات تقديرية): العوالق النباتية 10000 ← العوالق الحيوانية 2000 ← سمك الرنجة 200 ← سمكة الماكريل 20 ← التونة 1. احسب كفاءة النقل:
    <div style="display:grid;grid-template-columns:auto auto;gap:6px 10px;margin-top:6px;align-items:center"><span>العوالق النباتية ← العوالق الحيوانية:</span>${nin('b1','%')}<span>العوالق الحيوانية ← سمك الرنجة:</span>${nin('b2','%')}<span>سمكة الماكريل ← سمكة التونة:</span>${nin('b3','%')}</div><div class="fb" id="bf" style="min-height:22px;font-size:18px"></div></div></div>
   <div class="col" style="width:380px;flex:none;gap:7px;justify-content:center"><div class="panel" style="padding:8px 12px"><div class="sm" style="font-size:15px;text-align:center;color:var(--cyan)">الشكل 3-5: هرم الطاقة (وحدات تقديرية)</div>${pyrSVG([['عوالق نباتية 10000',10000],['عوالق حيوانية 2000',3800],['سمك الرنجة 200',1500],['سمكة الماكريل 20',700],['التونة 1',300]],{w:340,h:30,fs:13,cols:['#5fbf72','#f08fb0','#ef7b5a','#f1b24a','#9d8be0']})}</div>
    <div data-pt>${qaHTML([['(ج) باستخدام الأمثلة البحرية صف سبب اختلاف كفاءة النقل بين المستويات.','المقدار المأكول وسهولة الهضم: العوالق النباتية تؤكل كاملة فتبلغ الكفاءة 20%؛ وتنفق الأسماك الكبيرة (الماكريل ثم التونة) طاقة كبيرة في الحركة والصيد وتفلت منها فرائس كثيرة فتقل الكفاءة إلى 5%. وفي كل مستوى تُفقد طاقة في التنفس والفضلات.']])}</div></div></div>`;},
 init:function(el){
  bindNum($('.nin[data-n="a"]',el),11.1,.15,function(ok){ say($('#af',el),ok?'✓ 500 ÷ 4500 × 100 ≈ 11.1%':'قسّم 500 على 4500 ثم اضرب في 100',ok?'ok':'bad') });
  var A={b1:20,b2:10,b3:5}, d=0;
  Object.keys(A).forEach(function(k){ bindNum($('.nin[data-n="'+k+'"]',el),A[k],.3,function(ok){ say($('#bf',el),ok?'✓ '+A[k]+'%':'قسّم طاقة المستوى الأعلى على الأدنى ثم اضرب في 100',ok?'ok':'bad') }) });
  bindCards(el,function(){});
 },
 note:'<ul><li>كتاب الأنشطة ص١١٤–١١٥: نشاط ٣-٣ س١ (أ) و(ب) و(ج) والشكل ٣-٥. الحسابات: 500 ÷ 4500 × 100 ≈ 11.1%؛ 2000 ÷ 10000 = 20%؛ 200 ÷ 2000 = 10%؛ 1 ÷ 20 = 5%. الإجابة النموذجية لـ(ج) من عندي.</li></ul>'});

/* 43 Activity 3-3, question 2: figure 3-6, unknown flows */
slide({id:'act33a',ch:5,title:'نشاط 3-3: تدفق الطاقة في نظام بيئي بحري',tag:'احسب X وY وZ',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1.05;min-width:0;gap:8px;justify-content:center"><div class="panel" style="padding:6px 10px">${eflow({top:'ضوء الشمس 1 700 000',levels:[['منتجات','20000'],['مستهلكات أولية','3000'],['مستهلكات ثانوية','Y'],['مستهلكات ثالثية','30']],down:['',''],left:['X','2000','200','20'],right:['4000','700','70','Z'],leftName:'إجمالي التنفّس',rightName:'التحلّل الكلي'})}</div><div class="sm" style="font-size:16px;color:var(--muted);text-align:center">الشكل 3-6: رسم تخطيطي لتدفق الطاقة (الإجمالي: GPP = 20000)</div></div>
   <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:center">
    <div class="panel pb" data-pt style="font-size:19px"><b>أ.</b> احسب القيم المفقودة: <span style="display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:2px"><b style="color:#ff9c6e">X</b>${nin('x','')}<b style="color:#ff9c6e">Y</b>${nin('y','')}<b style="color:#ff9c6e">Z</b>${nin('z','')}</span><div class="fb" id="f1" style="min-height:18px;font-size:16px"></div></div>
    <div class="panel pb" data-pt style="font-size:19px"><b>ب.</b> احسب إجمالي الطاقة المستخدمة في التنفّس: <div style="margin-top:4px">${nin('r','kJ')}</div><div class="fb" id="f2" style="min-height:18px;font-size:16px"></div></div>
    <div class="panel pb" data-pt style="font-size:19px"><b>ج.</b> احسب كفاءة نقل المستوى الغذائي بين المستهلكات الأولية والثانوية: ${nin('t','%')}<div class="fb" id="f3" style="min-height:18px;font-size:16px"></div></div>
    <div class="panel pb" data-pt style="font-size:19px"><b>د.</b> احسب كفاءة عملية التمثيل الضوئي (إجمالي الإنتاجية الأولية ÷ ضوء الشمس): ${nin('p','%')}<div class="fb" id="f4" style="min-height:18px;font-size:16px"></div></div></div></div>`;},
 init:function(el){
  var T=[['x',13000,10,'f1','X = 20000 − 4000 − 3000'],['y',300,2,'f1','Y = 3000 − 2000 − 700'],['z',10,.2,'f1','Z = 30 − 20'],['r',15220,15,'f2','13000 + 2000 + 200 + 20 = 15220'],['t',10,.15,'f3','300 ÷ 3000 × 100 = 10%'],['p',1.18,.02,'f4','20000 ÷ 1 700 000 × 100 ≈ 1.18%']];
  T.forEach(function(t){ bindNum($('.nin[data-n="'+t[0]+'"]',el),t[1],t[2],function(ok){ say($('#'+t[3],el),ok?'✓ '+t[4]:'الداخل يساوي الخارج: أعد الحساب',ok?'ok':'bad') }) });
 },
 note:'<ul><li>كتاب الأنشطة ص١١٦–١١٧: نشاط ٣-٣ س٢ والشكل ٣-٦. الحسابات (من عندي): X = 20000 − (4000 + 3000) = 13000؛ Y = 3000 − (2000 + 700) = 300؛ Z = 30 − 20 = 10؛ التنفس الكلي = 13000 + 2000 + 200 + 20 = 15220؛ التحلل الكلي = 4000 + 700 + 70 + 10 = 4780 (وهو الرقم المكتوب في الشكل).</li><li>كفاءة التمثيل الضوئي = 20000 ÷ 1700000 × 100 ≈ 1.18%.</li></ul>'});

/* 44 Activity 3-3, question 3: the three pyramids of the mangrove estuary (activity book pp. 117-118) */
slide({id:'act33b',ch:5,title:'نشاط 3-3 (س3): الأهرامات الثلاثة للمانجروف',tag:'اضغط لتظهر الرسوم',
 html:function(){
  var C=['#5fbf72','#f08fb0','#ef7b5a','#f1b24a'], o={w:250,h:26,fs:12,cols:C};
  var items=[['3 (أ) هرم الأعداد',pyrSVG([['مانجروف 1',1],['روبيان 31',31],['سمكة 7',7],['مالك الحزين 1',1]],o)+'<div class="sm" style="font-size:16px">الأعداد 1 · 31 · 7 · 1: الشريط الثاني هو الأعرض، فالهرم غير منتظم (المنتج واحد لكنه كبير).</div>'],
   ['3 (ب) هرم الكتلة الحيوية (g/m²)',pyrSVG([['مانجروف 800',800],['روبيان 40',40],['سمكة 10',10],['مالك الحزين 1',1]],o)+'<div class="sm" style="font-size:16px">800 · 40 · 10 · 1: يضيق الهرم كلما ارتفعنا.</div>'],
   ['3 (ج) هرم الطاقة التقريبي (كفاءة 10%)',pyrSVG([['مانجروف 8000',8000],['روبيان 800',800],['سمكة 80',80],['مالك الحزين 8',8]],o)+'<div class="sm" style="font-size:16px">نفترض كفاءة 10% فتقل الطاقة عشر مرات في كل مستوى (قيم تقديرية).</div>']];
  return `<div class="col grow" style="gap:8px;justify-content:center">
   <div class="panel pb" style="font-size:20px">بيانات مصب نهر المانجروف (السلسلة: مانجروف ← روبيان ← سمكة ← مالك الحزين): الأعداد 1 · 31 · 7 · 1، والكتلة الحيوية 800 · 40 · 10 · 1 g/m². ارسم تقريبياً: الأشرطة أفقية على شكل مستطيلات، المنتج في الأسفل، وتُكتب الأسماء والوحدات.</div>
   ${cardsHTML(items,'cols3 qa')}</div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١١٧–١١٨: نشاط ٣-٣ س٣ (أ: هرم الأعداد، ب: هرم الكتلة الحيوية، ج: رسم تقريبي لهرم الطاقة بافتراض كفاءة 10%) وخطواته الأربع: الشكل (مستطيلات)، المحور الصادي (مقياس يغطي 50% على الأقل)، المحور السيني، تسمية كل شريط.</li><li>الرسومات من عندي (الكتاب بلا إجابات): أحجام الأشرطة نسبية، وقيم هرم الطاقة تقديرية.</li></ul>'});

/* 44b Activity 3-3, question 4: the kelp forest data (activity book p. 119, table 3-3) */
slide({id:'act33c',ch:5,title:'نشاط 3-3 (س4): أهرامات سلسلة طحلب الكِلْب',tag:'اضغط لتظهر الرسوم',
 html:function(){
  var o={w:250,h:26,fs:12};
  var items=[['هرم الأعداد',pyrSVG([['طحلب الكِلْب 200',200],['الرخويات 50',50],['سمك القد 10',10],['سلمون شينوك 1',1]],o)+'<div class="sm" style="font-size:16px">200 · 50 · 10 · 1</div>'],
   ['هرم الكتلة الحيوية',pyrSVG([['طحلب الكِلْب 800',800],['الرخويات 40',40],['سمك القد 10',10],['سلمون شينوك 5',5]],o)+'<div class="sm" style="font-size:16px">800 · 40 · 10 · 5</div>'],
   ['هرم الطاقة',pyrSVG([['طحلب الكِلْب 20000',20000],['الرخويات 4000',4000],['سمك القد 400',400],['سلمون شينوك 50',50]],o)+'<div class="sm" style="font-size:16px">20000 · 4000 · 400 · 50</div>']];
  return `<div class="col grow" style="gap:8px;justify-content:center">
   <div class="panel pb" style="font-size:19px;padding:8px 14px">الجدول 3-3 (بيانات النظام البيئي لطحلب الكِلْب): منتج: طحلب الكِلْب (عدد 200، كتلة 800، طاقة 20000) · مستهلك أولي: الرخويات (50، 40، 4000) · مستهلك ثانوي: سمك القد الموحل (10، 10، 400) · مستهلك ثالثي: سلمون شينوك (1، 5، 50).</div>
   ${cardsHTML(items,'cols3 qa')}</div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١١٩: نشاط ٣-٣ س٤ والجدول ٣-٣ (سلمون شينوك 1 · 5 · 50؛ سمك القد الموحل 10 · 10 · 400؛ الرخويات 50 · 40 · 4000؛ طحلب الكِلْب 200 · 800 · 20000). كرر الخطوات من الأولى إلى الرابعة لكل نوع من الأهرامات.</li><li>الرسومات من عندي.</li></ul>'});

/* 45-47 practical investigation 3-1: pyramids of numbers and biomass (activity book pp. 125-128) */
slide({id:'inv1a',ch:5,title:'استقصاء عملي 3-1: أهرامات الأعداد والكتلة الحيوية',tag:'مقدّمة وأدوات',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
   <div class="panel pb" data-pt style="font-size:20px"><b>الأهداف:</b> جمع الملاحظات والقياسات والتقديرات وتسجيلها وتقديمها · تحليل البيانات الناتجة من التجارب للوصول إلى استنتاجات وتفسيرها.</div>
   <div class="panel pb" data-pt style="font-size:20px"><b>مقدمة:</b> تظهر ${tm('السلاسل الغذائية','Food chains')} و${tm('الشبكات الغذائية','Food webs')} علاقات بين الأنواع في مستويات غذائية مختلفة. المنتجات أساس جميع السلاسل الغذائية، وتخزن بعض الطاقة على شكل كتلة حيوية تنتقل إلى مستويات أعلى. يقيس الاستقصاء أعداد الكائنات وكتلتها الحيوية لكل مستوى غذائي في موطن بيئي ساحلي (شاطئ صخري أو رملي).</div>
   <div class="panel pb" data-pt style="font-size:20px"><b>المواد والأدوات:</b> مربع قياسي (1 m × 1 m أو 0.5 m × 0.5 m) · بوتر (قنينة لجمع اللافقاريات الصغيرة) · صينية فرز بيضاء كبيرة · مفتاح التعرف · عدسة يد مكبّرة · ميزان · كؤوس أو علب بلاستيكية · مجرفة صغيرة · ملقط · مقص.</div>
   <div class="panel pb" data-pt style="font-size:20px;border-inline-start:6px solid #ffd966"><b>احتياطات الأمان والسلامة:</b> تعاون دائماً في العمل الميداني، بخاصة على الشواطئ، مع زميل لك؛ فقد يتضمن الموطن مخاطر بسبب الموقع أو طبيعة الكائنات الحية. اتبع جميع تعليمات معلمك بدقة.</div></div>
   <div class="col" style="width:420px;flex:none;gap:9px;justify-content:center"><div class="panel" style="padding:8px 12px"><div class="sm" style="font-size:17px;color:var(--cyan);font-weight:800;margin-bottom:4px">التمهيد للاستقصاء</div>${qaHTML([['كيف يمكن أن يختلف موقع وجود الكائنات الحية على الشاطئ الصخري عن الشاطئ الرملي؟ وكيف سيغيّر ذلك طريقتك في جمعها؟','على الصخري تلتصق الكائنات بالصخور (طحالب، قواقع) وتختبئ في الشقوق، فتُجمع بالملقط من الأسطح؛ وعلى الرملي تختبئ في الرمل (ديدان، سرطانات) فنحفر ونُنخل أو نفحص العينة.'],['ما احتياطات الأمان عند التعامل مع كائنات حية غير معروفة؟','العمل مع زميل، ارتداء قفازات، عدم لمس ما لا نعرفه، اتباع تعليمات المعلم، وغسل اليدين بعد العمل.'],['لماذا يجب التعامل بحذر مع الكائنات الحية؟','لأنها قد تؤذينا (لسعات، شوك، سموم)، ونحن قد نؤذيها فنقلل فرص نجاتها، ويجب إعادتها إلى موطنها.']],'tn')}</div></div></div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١٢٥–١٢٦: استقصاء عملي ٣-١ (أهدافه، المقدمة، المواد والأدوات، احتياطات الأمان). الإجابات على أسئلة «التمهيد للاستقصاء» من عندي.</li></ul>'});

slide({id:'inv1b',ch:5,title:'استقصاء 3-1: الطريقة والنتائج',tag:'خطوة بخطوة',
 html:function(){
  var steps=['اختر موقعاً في الموطن البيئي يحتوي على مجموعة من الكائنات الحية. قد تحتاج إلى إزالة بعض الأعشاب البحرية أو الغطاء النباتي للكشف عما تغطيه.',
   'ضع المربع القياسي بعناية في المكان المحدد حتى لا تتعرض أي كائنات حية موجودة للأذى.',
   'اجمع كل الكائنات الحية في الموقع (اقطع أعشاب البحر من القاعدة وانزع العشب من الجذور)، ثم ضع كل ما تجمعه على الصينية البيضاء. عندما يكون سطح الموقع رخواً أو ليناً (الرمل أو التربة) يمكنك حفر الجزء العلوي بعمق (10-15 cm) لتحدد موقع أية كائنات حية أخرى تختبئ في الطبقة المركزة.',
   'استخدم الملقط لتفصل بحرص أي حيوانات عن المنتجات، ثم ضع كل نوع منها في وعاء (علبة أو كأس) بلاستيكي مستقل؛ قد يكون من الأسهل فصل الحيوانات الصغيرة جداً باستخدام البوتر.',
   'حاول التعرّف على الحيوانات باستخدام مفتاح التعرف، واكتب مسمياتها بحسب المستوى الغذائي الذي تشغله (مستهلكات أولية أو ثانوية).',
   'صمّم جدول نتائج لتسجيل جميع البيانات التي تجمعها.',
   'احسب عدد جميع المنتجات وسجّله في جدول النتائج.',
   'زن كتلة جميع المنتجات وسجّل الكتلة في جدول النتائج.',
   'كرر الخطوتين 7 و8 لكل مستوى غذائي (وليس الأنواع المنفردة) عثرت عليه.',
   'أعد جميع الكائنات الحية إلى مواطنها البيئية.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1.4;min-width:0;gap:5px;justify-content:center">${steps.map(function(t,i){return '<div class="panel pb" data-pt style="font-size:17px;padding:5px 12px;display:flex;gap:10px;align-items:flex-start"><span class="rn" style="width:30px;height:30px;font-size:16px">'+ar(i+1)+'</span><span>'+t+'</span></div>'}).join('')}</div>
   <div class="col" style="width:330px;flex:none;gap:9px;justify-content:center"><div class="panel" style="padding:10px 14px"><div class="sm" style="font-size:18px;color:var(--cyan);font-weight:800">النتائج</div><div style="font-size:20px;line-height:1.5">صمّم جدول نتائج لتسجيل جميع نتائجك (الخطوة 6). تأكد من احتواء الجدول على أعمدة لكل من عدد الكائنات الحية وكتلتها.</div></div>
    <div class="panel" style="padding:8px 12px"><table class="tbl32" style="border-spacing:0 2px"><thead><tr><th>المستوى الغذائي</th><th>العدد</th><th>الكتلة (g)</th></tr></thead><tbody><tr><td>منتجات</td><td>…</td><td>…</td></tr><tr><td>مستهلكات أولية</td><td>…</td><td>…</td></tr><tr><td>مستهلكات ثانوية</td><td>…</td><td>…</td></tr></tbody></table></div></div></div>`;},
 note:'<ul><li>كتاب الأنشطة ص١٢٦–١٢٧: طريقة استقصاء عملي ٣-١ (عشر خطوات) والنتائج. الجدول المقترح تنظيم من عندي.</li></ul>'});

slide({id:'inv1c',ch:5,title:'استقصاء 3-1: التحليل والتقويم والتأمل',tag:'اضغط لتظهر',
 html:function(){
  var Q=[['1. ارسم على ورق الرسم البياني هرم أعداد وهرم كتلة حيوية لنتائجك. استخدم الشبكة لرسم الشرائط على مقياس محدد، واكتب مسميات المستويات الغذائية وضمّن مقياساً مناسباً مع الوحدات.','تُرسم الأشرطة أفقية مستطيلة، المنتجات في الأسفل ثم المستهلكات الأولية فالثانوية؛ ويكون عرض كل شريط بمقياس رسم موحّد للأعداد (وللكتلة g)، مع كتابة اسم المستوى والوحدة على المحور.'],
   ['2. يمكن تكرار التجربة عدة مرات إذا توافر الوقت. ما ميزة ذلك؟ وما المشكلات البيئية التي قد تنتج؟','الميزة: نحصل على متوسط أدق ونكشف الشواذ. المشكلة: تكرار أخذ العينات من الموقع نفسه يؤذي الكائنات ويخل بتوازن الموطن.'],
   ['3. احسب فقدان الطاقة خلال هذه السلاسل بناءً على هرم الكتلة الحيوية الذي رسمته. اقترح أسباب فقدان الطاقة في السلاسل الغذائية.','نحسب النسبة بين كتلة كل مستوى والذي قبله (≈10% نظرياً). الأسباب: التنفس، الفضلات، أجزاء لا تؤكل، افتراس غير ناجح، الحركة.'],
   ['4. اقترح الأسباب التي تجعل البيانات التي جُمعت لا تعكس بدقة الكتلة الحيوية في كل مستوى غذائي.','ضياع الكائنات الصغيرة أو المختبئة، لم نستخدم الكتلة الجافة، اختلاف الماء في الأجسام، حركة الحيوانات، موسم واحد، عينة صغيرة.'],
   ['5. يمثّل هرم الأعداد أو الكتلة الحيوية عادة سلسلة غذائية مفردة. اقترح الأسباب التي تجعل من الصعب النظر في سلسلة غذائية مفردة.','معظم الكائنات تتغذى على أكثر من نوع (شبكة غذائية)، فلا يمكن فصل سلسلة واحدة.'],
   ['6. (تأمّل) إلى أي مدى تتطابق نتائج استقصائك مع النتائج التي كنت قد توقعتها؟ إذا كانت مختلفة تماماً فاقترح أسباب اختلافها.','تتطابق إن ظهر شكل هرم؛ وإن اختلفت فبسبب أخطاء العينة أو الفصل أو عدم الدقة في الوزن أو الصيد الانتقائي.']];
  return `<div class="col grow" style="gap:8px;justify-content:center"><div style="font-size:20px;color:var(--muted)">الإجابات النموذجية من عندي: غيّرها بما يناسب نتائج صفك.</div>${cardsHTML(Q,'two qa')}</div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١٢٨: «التحليل والاستنتاج والتقويم» (الأسئلة 1–5) و«تأمّل» (السؤال 6). الكتاب بلا إجابات نموذجية؛ كتبتها من عندي.</li></ul>'});

/* 48-50 practical investigation 3-2 (enrichment): estimating the productivity of an aquatic plant (activity book pp. 129-133) */
slide({id:'inv2a',ch:5,title:'استقصاء عملي 3-2 (إثرائي): إنتاجية نبات مائي',tag:'المقدمة والصيغة',
 html:function(){
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch"><div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
   <div class="panel pb" data-pt style="font-size:20px"><b>الأهداف:</b> تخطيط التجارب والاستقصاءات · جمع الملاحظات والقياسات وتسجيلها · تحليل البيانات · تقييم الأساليب واقتراح التحسينات.</div>
   <div class="panel pb" data-pt style="font-size:20px"><b>مقدمة:</b> خلال التمثيل الضوئي يُمتص الضوء وتتحول الطاقة إلى طاقة كيميائية تستخدمها المنتجات وتخزنها. تتراكم الطاقة المخزنة على شكل كتلة حيوية وتصبح متاحة لمستوى غذائي آخر. هنا تخطط وتنفذ استقصاء لتحديد صافي الإنتاجية والإنتاجية الكلية لنبات مائي. <small>(ملاحظة: الإنتاجية الكلية مقابل الإنتاجية نشاط إثرائي فقط)</small></div>
   <div class="panel pb" data-pt style="text-align:center"><div style="font-size:19px;margin-bottom:6px">يمكن تحديد الإنتاجية الأولية بهذه الصيغة:</div><div style="font-size:23px;font-weight:800;color:var(--gold);line-height:1.6">الإنتاجية الأولية الكلية = صافي الإنتاجية الأولية + التنفّس</div><div style="font-size:18px;margin-top:6px;line-height:1.5;text-align:start">الإنتاجية الأولية الكلية: إجمالي الطاقة التي يحصل عليها الكائن المنتج · صافي الإنتاجية الأولية: الطاقة المنتقلة إلى كتلة حيوية جديدة · التنفّس: الطاقة التي يستخدمها الكائن المنتج</div></div></div>
   <div class="col" style="width:420px;flex:none;gap:9px;justify-content:center"><div class="panel" style="padding:8px 12px"><div class="sm" style="font-size:17px;color:var(--cyan);font-weight:800;margin-bottom:4px">التمهيد للاستقصاء</div>${qaHTML([['هل تتوقّع أن تزيد الكتلة الحيوية للنبات أو تنقص عندما يقوم بعملية التمثيل الضوئي بسرعة أكبر من التنفّس؟','تزيد: لأن الجلوكوز المصنوع في التمثيل الضوئي أكثر مما يُستهلك في التنفس، فيزيد ما يُخزَّن من كتلة حيوية.'],['اقترح كيف يمكن قياس الزيادة أو النقصان في الكتلة الحيوية لكائن حي منتج.','نقيس كتلة النبات (الكتلة الجافة أدق) عند بداية الاستقصاء ونهايته، ونحسب الفرق ثم نقسمه على الزمن.']])}</div></div></div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١٢٩: استقصاء عملي ٣-٢ (إثرائي): الأهداف والمقدمة والتمهيد والصيغة: الإنتاجية الأولية الكلية = صافي الإنتاجية الأولية + التنفّس. الإجابات من عندي.</li></ul>'});

slide({id:'inv2b',ch:5,title:'استقصاء 3-2: المتغيرات (الجدول 3-5)',tag:'اضغط لتظهر',
 html:function(){
  var rows=[['شدة الضوء','الضوء مصدر الطاقة للتمثيل الضوئي','زيادته تزيد التمثيل الضوئي والنمو حتى حدّ معيّن','تغيير بعد المصباح أو عدد المصابيح'],
   ['درجة الحرارة','تؤثر في سرعة التفاعلات الأنزيمية','ترتفع الإنتاجية حتى درجة مثلى ثم تنخفض','حمّام مائي أو غرف بحرارات مختلفة'],
   ['مساحة سطح الماء','تحدد كمية الضوء وثاني أكسيد الكربون الممتصة','زيادتها تزيد الامتصاص والنمو','أحواض بمساحات مختلفة'],
   ['توافر المغذيات','ضرورية لبناء المركبات الحيوية','زيادتها تزيد النمو حتى حدّ معيّن','إضافة كميات مختلفة من السماد'],
   ['كتلة النبات في البداية','النبات الأكبر يمتص أكثر ويصنع أكثر','كتلة أكبر تعني نمواً مطلقاً أكبر','البدء بكتل مختلفة (أو ضبطها للتساوي)']];
  var Q=[['2 (أ) ما الذي تحتاج إلى قياسه لتحدد الإنتاجية الأولية الكلية (المتغير التابع)؟','التغير في الكتلة الحيوية (بالتمثيل الضوئي) والتنفس، أي صافي الإنتاجية والتنفس خلال زمن معين.'],
   ['2 (ب)/(ج) كيف تقيس المتغير التابع؟ وكم مرة ستكرّر كل قياس؟','نزن النبات (جافاً) قبل وبعد المدة الزمنية؛ ونكرر 3 مرات على الأقل ونأخذ المتوسط.'],
   ['2 (د)/(هـ) ما المتغير المستقل وكيف ستغيّره؟','مثلاً: شدة الضوء بتغيير بعد المصباح عن النبات (عدة مسافات).']];
  return `<div style="display:flex;gap:14px;flex:1;align-items:stretch"><div class="col" style="flex:1.6;min-width:0;gap:7px;justify-content:center">
   <div style="font-size:19px;color:var(--muted)">الجدول 3-5: العوامل المؤثرة على معدل نمو نبات مائي (من عندي، انقله وأكمله مع الطلاب)</div>
   <div class="panel" style="padding:6px 10px"><table class="tbl32" style="border-spacing:0 2px"><thead><tr><th>العامل</th><th>سبب تأثيره</th><th>مدى تأثير زيادته</th><th>كيف نغيّره عملياً</th></tr></thead><tbody>${rows.map(function(r){return '<tr data-pt>'+r.map(function(x,i){return '<td style="font-size:16px;padding:4px 8px;'+(i===0?'font-weight:800;color:var(--gold)':'')+'">'+x+'</td>'}).join('')+'</tr>'}).join('')}</tbody></table></div></div>
   <div class="col" style="width:420px;flex:none;gap:8px;justify-content:center">${qaHTML(Q)}</div></div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١٣٠–١٣١: «المتغيرات» (الجدول ٣-٥ والأسئلة 1 و2). صفوف الجدول (شدة الضوء، درجة الحرارة، مساحة سطح الماء، توافر المغذيات، كتلة النبات في البداية) بنصها، أما الخلايا الثلاث الأخرى فمن عندي لأن الكتاب يتركها فارغة.</li></ul>'});

slide({id:'inv2c',ch:5,title:'استقصاء 3-2: التخطيط والتحليل',tag:'خطّط ثم حلّل',
 html:function(){
  var Q=[['3. المتغيرات الضابطة (الجدول 3-6): حدّد ما يجب إبقاؤه ثابتاً وكيف.','نوع النبات وكتلته الابتدائية (نفس العينة) · شدة الضوء (نفس المصباح والمسافة) · درجة الحرارة (نفس الغرفة أو حمّام مائي) · حجم الماء والمغذيات · مدة التجربة.'],
   ['4. المواد والأدوات (الجدول 3-7).','نبات مائي (مثل نبات حوض الأسماك) · أحواض أو دوارق شفافة · ماء المحيط أو ماء مالح · ميزان حساس · مصباح · مسطرة · مؤقت · مادة معتمة لتغطية بعض الأوعية (لقياس التنفس).'],
   ['5. احتياطات الأمان (الجدول 3-8): المخاطر وكيف نقلل حدوثها.','كسر الزجاج: نستخدم أوعية بلاستيكية · الكهرباء قرب الماء: مصباح معزول بعيداً عن الماء · الأيدي: نغسلها بعد لمس النبات.'],
   ['6/7. اكتب طريقة مفصلة (الجهاز، المتغير المستقل والتابع، المتغيرات الضابطة) واعرضها على معلمك قبل التنفيذ.','يُحضَّر وعاءان لكل شدة ضوء: أحدهما معرّض للضوء (يعطي صافي الإنتاجية) والآخر معتم (يعطي التنفس). نزن النبات قبل وبعد المدة.'],
   ['التحليل: كيف نحسب الإنتاجية الأولية الكلية؟ وما تقديرك لها خلال السنة؟','الإنتاجية الكلية = صافي الإنتاجية (زيادة الكتلة في الضوء) + التنفس (نقص الكتلة في الظلام) ÷ الزمن. لا يمكن افتراض ثبات المعدل طوال السنة لأن الضوء والحرارة والمغذيات تتغير مع الفصول.'],
   ['تأمّل: كيف تحسّن طريقتك للحصول على تقدير أدق للإنتاجية خلال سنة كاملة؟','نكرر القياس في فصول مختلفة، ونزيد عدد التكرارات، ونستخدم الكتلة الجافة، ونتحكم أكثر في المتغيرات.']];
  return `<div class="col grow" style="gap:8px;justify-content:center"><div style="font-size:20px;color:var(--muted)">الإجابات من عندي: الكتاب يترك الجداول 3-6 و3-7 و3-8 فارغة لتملأها بنفسك.</div>${cardsHTML(Q,'two qa')}</div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١٣١–١٣٣: المتغيرات الضابطة (جدول ٣-٦)، المواد والأدوات (جدول ٣-٧)، احتياطات الأمان (جدول ٣-٨)، الطريقة والنتائج والتحليل والتأمل. الاستقصاء إثرائي. الإجابات والقوائم من عندي.</li></ul>'});
