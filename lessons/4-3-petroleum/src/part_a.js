/* ---------- petroleum, part A: the fossil fuels, how they formed, the oil fields and combustion ---------- */

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يسمّي ثلاثة أنواع من الوقود الأحفوري، ويصف كيف تكوّن.',
   'يذكر المكوّن الرئيسي للغاز الطبيعي (الميثان).',
   'يكتب المعادلة اللفظية والرمزية الموزونة لاحتراق الهيدروكربونات احتراقاً كاملاً.',
   'يعرّف التقطير التجزيئي، ويصف كيف يفصل البترول إلى مشتقات.',
   'يربط خصائص المشتقات (درجة الغليان واللزوجة والتطاير والاشتعال) بعدد ذرات الكربون واستخداماتها.',
   'يعرّف التكسير الحراري ويفسّر الحاجة إليه، ويكتب معادلاته.',
   'يصف نواتج التكسير الحراري: ألكان أقصر وألكين، أو ألكين وهيدروجين.'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:22px 30px 20px;justify-content:center;gap:9px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">الموضوع ٤-٣</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;line-height:1.1">ال<span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">بترول</span> والوقود الأحفوري</h1>
    <p style="margin:0 0 2px;font-size:26px;font-weight:700;color:var(--muted)">النفط الخام وأنواع أخرى من الوقود الأحفوري</p>
    <p style="font-size:23px;font-weight:700;line-height:1.35;margin:0">بنهاية الدرس، يُتوقع منك أن تكون قادراً على:</p>
    <div class="gl">${L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div>
   </div>
   <div style="width:330px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:14px 14px;align-items:center;gap:10px"><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><span class="pill">الفحم</span><span class="pill">النفط</span><span class="pill">الغاز الطبيعي</span></div><div class="sm" style="font-size:19px;text-align:center">الوقود الأحفوري: ثلاثة أنواع</div></div>
    <div class="bigeq" style="font-size:34px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5);direction:ltr">C<sub>8</sub>H<sub>18</sub> → C<sub>2</sub>H<sub>4</sub> + C<sub>6</sub>H<sub>14</sub></div>
    <div class="sm" style="font-size:22px;text-align:center">وهذا هو التكسير الحراري</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من عرض NotebookLM (شريحة «معايير النجاح»، ٨ معايير) وعرضك القديم وأهداف دليل المعلم للموضوع ٤-٣، مكتوبة بلغة الطالب. اضغط على هدف لتظليله وأنت تراجع في نهاية الدرس.</li><li>الدرس يغطي كتاب الطالب ص٩٠–٩٧ وأسئلة ٤-٢١ إلى ٤-٢٤، والنشاطين ٤-٢ و٤-٣، وسؤال نهاية الوحدة ٤، وكتاب النشاط: تمرين ٤-٤ وورقة العمل ٤-٣.</li></ul>'});

/* 2 the three fossil fuels (question 4-21) */
slide({id:'types',ch:0,title:'أنواع الوقود الأحفوري',tag:'اكتشف · سؤال ٤-٢١',
 html:function(){
  var items=[['الفحم Coal','وقود أحفوري <b>صلب</b>، مركّبات عضوية فيها نسبة عالية من الكربون.'],['النفط (البترول، الزيت الخام) Petroleum','وقود أحفوري <b>سائل</b> لزج، مخلوط من هيدروكربونات كثيرة بأطوال سلاسل مختلفة.'],['الغاز الطبيعي Natural gas','وقود أحفوري <b>غازي</b>، مكوّنه الرئيسي غاز <b>الميثان</b>.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:440px;flex:none;gap:12px;justify-content:center">
    <div class="frm brk" style="padding:16px 22px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">مصطلحات علمية · Fossil fuel</div>
     <p style="margin:0;font-size:24px;font-weight:800;line-height:1.5"><span style="color:var(--gold)">الوقود الأحفوري</span>: وقود كربوني تكوَّن تحت الأرض نتيجة تحلّل مواد عضوية لبقايا كائنات حية، بتأثير درجة الحرارة والضغط المرتفعين، وبغياب الأكسجين على مدى أطوار (أزمنة) جيولوجية.</p></div>
    <div class="panel compact" id="qp" style="padding:10px 16px"><div style="font-size:21px;font-weight:800;margin-bottom:2px">٤-٢١ سمِّ ثلاثة أنواع من الوقود الأحفوري:</div>
     ${optsHTML([{t:'الفحم والنفط والغاز الطبيعي'},{t:'الفحم والحطب والغاز الطبيعي'},{t:'النفط والفحم النباتي والهيدروجين'}])}<div class="fb" style="min-height:24px"></div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة لتظهر:</div>${cardsHTML(items)}
    <div class="gbar hide" id="gb" style="font-size:21px">الأنواع الثلاثة <b>موارد غير متجددة ومحدودة</b>، لأن تكوّنها يحتاج ملايين السنين.</div></div></div>`;},
 init:function(el){
  var c=false,q=false; function chk(){ if(c&&q) unhide(el) }
  bindCards(el,function(){c=true; chk()});
  bindMcq($('#qp',el),[{t:'',ok:true,why:'الفحم والنفط (البترول) والغاز الطبيعي'},{t:'',why:'الحطب ليس وقوداً أحفورياً: لم يتكوّن تحت الأرض بملايين السنين'},{t:'',why:'الفحم النباتي والهيدروجين ليسا وقوداً أحفورياً'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩٠: «يُعدّ البترول (النفط الخام) والفحم والغاز الطبيعي أمثلة على أنواع الوقود الأحفوري»، والتعريف في «مصطلحات علمية». عرض NotebookLM شريحة ٣ وعرضك القديم: الفحم وقود أحفوري صلب مركبات عضوية فيها نسبة عالية من الكربون؛ النفط وقود سائل لزج مخلوط من هيدروكربونات متعددة؛ الغاز الطبيعي وقود غازي من الميثان.</li><li>سؤال ٤-٢١: الفحم والغاز الطبيعي والبترول (النفط الخام). «يُعدّ الوقود الأحفوري من الموارد غير المتجددة والمحدودة».</li></ul>'});

/* 3 how the fossil fuels formed */
slide({id:'form',ch:1,title:'كيف يتكوّن الوقود الأحفوري؟',tag:'تتبّع',
 html:function(){
  var S=['مواد عضوية كانت حيّة ذات يوم: كائنات بحرية دقيقة ونباتات','موتُ الكائنات العضوية الحية وطمرها تحت الرواسب والصخور في القشرة الأرضية','في غياب الهواء سبّبت البكتيريا تحلّل المواد وتفكّكها','طمر المواد عميقاً داخل القشرة الأرضية: درجة حرارة وضغط مرتفعان','عبر أطوار جيولوجية (عدة ملايين من السنين) تحوّلت إلى الوقود الأحفوري'];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="display:flex;gap:12px;align-items:center"><button type="button" class="btn acc" id="nx">الخطوة التالية ▸</button><span class="sm" id="pn" style="font-size:20px"></span></div>
    ${S.map(function(t,i){return '<div class="lstep fs" data-i="'+i+'" style="display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;padding:8px 16px;border-radius:16px;background:rgba(var(--d2),.55);opacity:.42;transition:opacity .4s"><span class="rn">'+ar(i+1)+'</span><span style="font-size:22px;font-weight:700;line-height:1.35">'+t+'</span></div>'}).join('')}
    <div class="fb" style="min-height:24px"></div></div>
   <div class="col" style="width:380px;flex:none;gap:10px;justify-content:center">
    <div class="panel compact" id="qp" style="padding:12px 16px;gap:6px"><div style="font-size:22px;font-weight:800">لماذا يوجد النفط والغاز الطبيعي معاً في العادة؟</div>
     ${optsHTML([{t:'لأنهما تكوّنا من أجسام كائنات بحرية دقيقة'},{t:'لأنهما يتكوّنان من الفحم'},{t:'لأن الغاز يذوب في النفط فقط'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الوقود الأحفوري مورد <b>غير متجدد ومحدود</b>: تكوّن عبر ملايين السنين.</div></div></div>`;},
 init:function(el){
  var k=0,d=false,q=false; function chk(){ if(d&&q) unhide(el) }
  function paint(){ $$('.fs',el).forEach(function(r,i){r.style.opacity=i<k?'1':'.42'}); $('#pn',el).innerHTML='<span class="num lbl">'+k+' / 5</span>'; if(k===5){$('#nx',el).classList.add('hide'); d=true; chk()} }
  $('#nx',el).addEventListener('click',function(){ if(k<5){k++; paint()} }); paint();
  bindMcq($('#qp',el),[{t:'',ok:true,why:'يوجدان معاً لأنهما تكوّنا من أجسام كائنات بحرية دقيقة، وتنتشر مكامنهما عبر صخور مسامية'},{t:'',why:'الفحم نوع مستقل من الوقود الأحفوري'},{t:'',why:'ليس هذا هو السبب'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩٠: «تكوّن الوقود الأحفوري في القشرة الأرضية من مواد عضوية كانت حيّة ذات يوم… عبر أطوار (أزمنة) جيولوجية (عدة ملايين من السنين)، كنتيجة لموت الكائنات العضوية الحية وطمرها تحت الرواسب والصخور. وفي غياب الهواء، سببت البكتيريا تحلل تلك المواد وتفككها. وقد أسهم طمر هذه المواد عميقاً داخل القشرة الأرضية، في تعرضها لدرجة حرارة وضغط مرتفعين، فتحولت إلى أحد الأشكال الثلاثة للوقود الأحفوري».</li><li>«يوجد النفط والغاز الطبيعي معاً في العادة، لأنهما تكوّنا من أجسام كائنات بحرية دقيقة. وتميل مكامن هذين النوعين إلى الانتشار عبر صخور مسامية مثل الحجر الرملي والحجر الجيري، ولكنها تكون محتجزة تحت طبقة من الصخور غير المسامية». (عرض NotebookLM شريحة ٤)</li></ul>'});

/* 4 oil fields */
slide({id:'fields',ch:1,title:'حقول النفط ومنصات الاستخراج',tag:'اكتشف',
 html:function(){
  var items=[['منصات النفط','تُبنى فوق المكامن لاستخراج النفط والغاز الطبيعي من الحقل النفطي (منصة في الخليج العربي).'],['العصر الطباشيري','تكوّنت فيه حقول النفط في الخليج العربي وشمال أفريقيا وخليج المكسيك، من 120 مليون سنة خلت إلى 75 مليون سنة.'],['نصف احتياطيات العالم','تحتوي هذه الحقول على نصف احتياطيات العالم المعروفة من النفط.'],['مصفاة ميناء الفحل','في سلطنة عُمان وحدة تكسير حراري (الصورة ٤-٥ في الكتاب).']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>${cardsHTML(items,'tight')}</div>
   <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:22px;font-weight:800">احسب بنفسك</div><div style="font-size:21px;line-height:1.5">استمر العصر الطباشيري من 120 إلى 75 مليون سنة خلت. كم مليون سنة استمر؟</div>
     <div style="display:flex;align-items:center;gap:12px">${nin('yr','مليون سنة')}</div><div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">حقول النفط في منطقتنا قديمة جداً: 45 مليون سنة من التكوّن، ولن تتجدد في زمننا.</div></div></div>`;},
 init:function(el){
  var c=false,n=false; function chk(){ if(c&&n) unhide(el) }
  bindCards(el,function(){c=true; chk()});
  bindAll(el,[{n:'yr',a:45,w:'✓ 120 − 75 = 45 مليون سنة',h:'اطرح 75 من 120'}],$('.fb',el),function(){n=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩٠–٩١: «تبنى منصات النفط فوق المكامن لاستخراج النفط والغاز الطبيعي من الحقل النفطي (الصورة ٤-٣). وقد تكوّنت حقول النفط التي يحتوي عليها الخليج العربي وشمال أفريقيا وخليج المكسيك جميعها في العصر الطباشيري، الممتد من 120 مليون سنة خلت إلى 75 مليون سنة. وتحتوي هذه الحقول على نصف احتياطيات العالم المعروفة من النفط». والصورة ٤-٥ في ص٩٥: وحدة تكسير حراري في مصفاة ميناء الفحل لتكرير النفط في سلطنة عُمان.</li><li>خلفية الشريحة صورة منصة/خطوط أنابيب من صورك.</li></ul>'});

/* 5 combustion of the fossil fuels */
slide({id:'burn',ch:1,title:'احتراق الوقود الأحفوري',tag:'زِن المعادلة',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div style="display:flex;gap:8px;justify-content:center"><button type="button" class="btn tab" data-i="0">الميثان (غاز طبيعي)</button><button type="button" class="btn tab" data-i="1">البروبان</button><button type="button" class="btn tab" data-i="2">البيوتان</button></div>
    <div class="frm brk" style="padding:12px 16px;gap:8px;align-items:center"><div class="sm" style="font-size:20px;text-align:center">هيدروكربون + أكسجين → ثاني أكسيد الكربون + ماء (بخار) + طاقة</div>
     <div style="display:flex;align-items:center;justify-content:center;gap:10px;direction:ltr;flex-wrap:nowrap" id="eq"></div></div>
    <div class="panel" style="padding:10px 16px;gap:2px"><div class="cnt3" id="ct" style="direction:ltr"></div></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div></div>
   <div class="col" style="width:340px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:22px;font-weight:800">لماذا يُحرق الوقود الأحفوري؟</div><div style="font-size:21px;line-height:1.5">لإنتاج <b>الحرارة</b> وتزويد المركبات بالطاقة. والهيدروكربونات هي النوع الرئيسي من مركّبات الوقود الأحفوري.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الاحتراق الكامل في الهواء ينتج دائماً <b>ثاني أكسيد الكربون + ماء</b> وتنطلق الطاقة.</div></div></div>`;},
 init:function(el){
  var RX=[{f:'CH4',c:1,h:4},{f:'C3H8',c:3,h:8},{f:'C4H10',c:4,h:10}], cur=0, co=[1,1,1,1], done={}, fb=$('.fb',el);
  function g(a,b){return b?g(b,a%b):a}
  function load(i){ cur=i; co=[1,1,1,1]; paint(); $$('.tab',el).forEach(function(t){t.classList.toggle('acc',+t.getAttribute('data-i')===i)}); say(fb,'','') }
  function paint(){
    var r=RX[cur], C0=co[0]*r.c, H0=co[0]*r.h, O0=2*co[1], C1=co[2], H1=2*co[3], O1=2*co[2]+co[3];
    function term(k,f,st){return '<div class="coef"><button type="button" data-k="'+k+'" data-d="1">+</button><b class="num lbl">'+co[k]+'</b><button type="button" data-k="'+k+'" data-d="-1">−</button></div><span class="num lbl" style="font-size:38px;font-weight:800">'+sub(f)+'<span style="font-size:22px">('+st+')</span></span>'}
    $('#eq',el).innerHTML=term(0,r.f,'g')+'<span style="font-size:36px">+</span>'+term(1,'O2','g')+'<span style="font-size:42px">→</span>'+term(2,'CO2','g')+'<span style="font-size:36px">+</span>'+term(3,'H2O','g');
    function row(n,a,b){var ok=a===b; return '<span>'+n+'</span><span class="num lbl">'+a+'</span><span class="num lbl">'+b+'</span><span class="'+(ok?'ok-t':'no-t')+'">'+(ok?'✓':'✗')+'</span>'}
    $('#ct',el).innerHTML='<span></span><span style="font-size:19px;color:var(--muted)">المتفاعلات</span><span style="font-size:19px;color:var(--muted)">النواتج</span><span></span>'+row('C',C0,C1)+row('H',H0,H1)+row('O',O0,O1);
    $$('.coef button',el).forEach(function(b){b.addEventListener('click',function(){var k=+b.getAttribute('data-k'); co[k]=Math.max(1,Math.min(16,co[k]+ +b.getAttribute('data-d'))); paint(); verdict()})});
  }
  function verdict(){
    var r=RX[cur], bal=co[0]*r.c===co[2]&&co[0]*r.h===2*co[3]&&2*co[1]===2*co[2]+co[3];
    if(!bal){ say(fb,'','') ; return }
    var d=g(g(co[0],co[1]),g(co[2],co[3]));
    if(d>1){ say(fb,'موزونة، لكن اكتبها بأبسط نسبة (اقسم على '+d+')','bad'); return }
    say(fb,'✓ موزونة بأبسط نسبة: '+co.join(' : '),'ok'); done[cur]=1; if(Object.keys(done).length===3) unhide(el);
  }
  $$('.tab',el).forEach(function(t){t.addEventListener('click',function(){load(+t.getAttribute('data-i'))})});
  load(0);
 },
 note:'<ul><li>كتاب الطالب ص٩١: «يتم حرق الوقود الأحفوري بشكل أساسي كوقود لإنتاج الحرارة وتزويد المركبات بالطاقة… عندما يتعرض الوقود الأحفوري للاحتراق الكامل في الهواء، سينتج عنه ثاني أكسيد الكربون والماء، إضافة إلى إطلاق الطاقة». المعادلة اللفظية العامة: هيدروكربون + أكسجين ← ثاني أكسيد الكربون + ماء. ومثال الكتاب: <span class="num">2C₄H₁₀(g) + 13O₂(g) → 8CO₂(g) + 10H₂O(g)</span>.</li><li>سؤال «اختبر فهمك» في عرضك القديم: غاز البروبان C₃H₈ أحد مكونات غاز الطبخ؛ معادلة احتراقه: <span class="num">C₃H₈ + 5O₂ → 3CO₂ + 4H₂O</span>. وفي إجابة الدليل ورقة العمل ٤-٢ البيوتان: 2C₄H₁₀(g) + 13O₂(g) → 8CO₂(g) + 10H₂O(g).</li><li>حالة الماء (g) (بخار) كما في الكتاب ونموذج الامتحان.</li></ul>'});
