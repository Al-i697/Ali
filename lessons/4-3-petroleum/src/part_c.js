/* ---------- petroleum, part C: the questions of activity 4-2, demand and supply, thermal cracking and activity 4-3 ---------- */

/* 14 the questions of activity 4-2 */
ticketSlide({id:'labq',ch:3,title:'أسئلة النشاط ٤-٢',tag:'تذكرة',items:[
 {q:'<b>١أ)</b> ما الغرض من استخدام الألياف (أو القطع) الخزفية؟',opts:[{t:'تمتص النفط وتسمح بالتسخين المنتظم وتمنع تكوّن الرذاذ',ok:true,why:'لتسخين منتظم دون رذاذ'},{t:'تبرّد البخار',why:'التبريد يتم بالماء البارد'},{t:'تلوّن المشتقات',why:'ليس هذا غرضها'}]},
 {q:'<b>١ب)</b> ما الغرض من ميزان الحرارة وموقعه في أنبوبة الاختبار؟',opts:[{t:'يسجّل درجة غليان ناتج التقطير الذي يتكثّف، ويوضع خزّانه بمحاذاة مدخل أنبوبة التوصيل',ok:true,why:'ليُقاس بدقة مدى درجة غليان المشتق'},{t:'يقيس درجة حرارة اللهب',why:'يقيس حرارة البخار الذي يتكثف'},{t:'يبرّد الأنبوبة',why:'ليس لتبريدها'}]},
 {q:'<b>١ج)</b> لماذا نستخدم كأس الماء البارد لجمع المشتق الأول؟',opts:[{t:'لتكثيف ناتج التقطير',ok:true,why:'المشتق الأول خفيف ويتبخّر بسهولة فيحتاج إلى تبريد'},{t:'لتسخين الناتج',why:'الماء البارد للتبريد'},{t:'لتلوين المشتق',why:'ليس هذا غرضه'}]},
 {q:'<b>٢)</b> ما احتياطات السلامة المناسبة؟',opts:[{t:'التأكد من عدم وجود فجوات في الجهاز، وتهوئة جيدة، وعدم وضع لهب قرب النواتج',ok:true,why:'بدائل النفط ومشتقاته قابلة للاشتعال'},{t:'التسخين بلهب كبير بالقرب من النواتج',why:'هذا خطر'},{t:'إغلاق الجهاز تماماً بلا منفذ',why:'يجب ألا يُغلق إغلاقاً تاماً'}]},
 {q:'<b>٤)</b> ما النمط الذي تلاحظه في ألوان المشتقات المجموعة؟',opts:[{t:'يصبح لون المشتقات أكثر قتامة (غامقاً)',ok:true,why:'الأخف فاتحة والأثقل أغمق'},{t:'تصبح أفتح',why:'العكس'},{t:'لا تتغير',why:'يزداد الغمق'}]},
 {q:'<b>٥)</b> ما اختلاف لزوجة المشتقات، وما الخاصية الجزيئية المفسّرة؟',opts:[{t:'تزداد اللزوجة مع ارتفاع درجة الغليان لأن طول سلسلة الجزيئات يزداد فتتشابك أكثر',ok:true,why:'الجزيئات الأطول أكثر تشابكاً'},{t:'تقلّ اللزوجة مع ارتفاع درجة الغليان',why:'العكس'},{t:'اللزوجة ثابتة',why:'تتغير بتغير طول السلسلة'}]},
 {q:'<b>٧)</b> ما المتوقّع للرواسب السوداء المتبقية في أنبوبة الاختبار؟',opts:[{t:'الأكثر لزوجة والأقل قابلية للاشتعال والأعلى درجة غليان',ok:true,why:'لأنها تحتوي على أطول السلاسل الكربونية'},{t:'الأقل لزوجة والأسهل اشتعالاً',why:'هذا الجازولين'},{t:'تغلي عند أقل درجة',why:'هذه المشتقات الخفيفة'}]}
 ],
 note:'<ul><li>أسئلة نشاط ٤-٢ (كتاب الطالب ص٩٤) وإجابات دليل المعلم: ١أ) تمتص البترول أو بديله وتسمح بالتسخين المنتظم وتمنع تكوّن الرذاذ؛ ب) يسجل ميزان الحرارة درجة غليان ناتج التقطير الذي يتكثّف، ويوضع خزّانه بمحاذاة مدخل أنبوبة التوصيل؛ ج) الماء البارد يكثّف ناتج التقطير؛ ٢) قابلية الاشتعال: فحص الجهاز وتهوئة وعدم وضع لهب؛ ٣) المعدّات النموذجية: الدورق الكروي وعمود التجزئة والمكثّف؛ ٤) يصبح لون المشتقات أكثر قتامة؛ ٥) تزداد اللزوجة بزيادة طول السلسلة وتشابك الجزيئات؛ ٦) تقلّ قابلية الاشتعال كلما ازداد الحجم الجزيئي ودرجات الغليان؛ ٧) الرواسب السوداء الأكثر لزوجة والأقل اشتعالاً والأعلى غلياناً.</li></ul>'});

/* 15 supply and demand (exercise 4-4, the table of the activity book) */
slide({id:'need',ch:4,title:'العرض والطلب على المشتقات',tag:'اقرأ الرسم',
 html:function(){
  var G=['C₁–C₄','C₅–C₉','C₁₀–C₁₄','C₁₄–C₂₀','أكثر من C₂₀'], A=[4,11,12,18,23], D=[11,22,20,15,4];
  var W=560,H=330,pl=44,pb=46,pt=14,bw=34,gw=(W-pl-10)/5, s='', i, y=function(v){return H-pb-v/25*(H-pb-pt)};
  for(i=0;i<=5;i++){ s+='<line x1="'+pl+'" y1="'+y(i*5)+'" x2="'+(W-10)+'" y2="'+y(i*5)+'" stroke="rgba(255,255,255,.14)"/><text x="'+(pl-6)+'" y="'+(y(i*5)+5)+'" text-anchor="end" font-size="14" fill="#cfe">'+(i*5)+'</text>' }
  s+='<line x1="'+pl+'" y1="'+(H-pb)+'" x2="'+(W-10)+'" y2="'+(H-pb)+'" stroke="#9fb4b8" stroke-width="2"/><line x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(H-pb)+'" stroke="#9fb4b8" stroke-width="2"/>';
  G.forEach(function(g,k){ var cx=pl+gw*(k+.5);
    s+='<rect x="'+(cx-bw-2)+'" y="'+y(A[k])+'" width="'+bw+'" height="'+(H-pb-y(A[k]))+'" fill="#E4BC4B" rx="3"/><text x="'+(cx-bw/2-2)+'" y="'+(y(A[k])-4)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#F3D27A">'+A[k]+'</text>';
    s+='<g class="dem" opacity="0" style="transition:opacity .6s"><rect x="'+(cx+2)+'" y="'+y(D[k])+'" width="'+bw+'" height="'+(H-pb-y(D[k]))+'" fill="#5BA8E8" rx="3"/><text x="'+(cx+bw/2+2)+'" y="'+(y(D[k])-4)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#9fd0ff">'+D[k]+'</text></g>';
    s+='<text x="'+cx+'" y="'+(H-pb+20)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#e8f" font-family="Cairo,sans-serif">'+g+'</text>';
  });
  s+='<text x="'+((pl+W)/2)+'" y="'+(H-6)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#cfe" font-family="Cairo,sans-serif">عدد ذرات الكربون في الجزيء</text><text transform="translate(12,'+((pt+H-pb)/2)+') rotate(-90)" text-anchor="middle" font-size="14" font-weight="700" fill="#cfe" font-family="Cairo,sans-serif">النسبة المئوية %</text>';
  var items=[{q:'أي المجموعات الأكثر طلباً؟',opts:[{t:'C₅–C₉ (الجازولين)',ok:true,why:'الطلب عليها 22% وهو الأكبر'},{t:'أكثر من C₂₀ (الشمع والأسفلت)',why:'طلبها 4% فقط'},{t:'C₁–C₄',why:'طلبها 11%'}]},
   {q:'أي المجموعات الأقل طلباً؟',opts:[{t:'أكثر من C₂₀ (الشمع والأسفلت)',ok:true,why:'الطلب عليها 4% فقط'},{t:'C₅–C₉',why:'هذه الأكثر طلباً'},{t:'C₁₀–C₁₄',why:'طلبها 20%'}]},
   {q:'أي المجموعتين يزيد المعروض منها على الطلب؟',opts:[{t:'C₁₄–C₂₀ وأكثر من C₂₀',ok:true,why:'المعروض 18 و23 والطلب 15 و4'},{t:'C₁–C₄ وC₅–C₉',why:'الطلب عليهما أكبر من المعروض (11 و22 مقابل 4 و11)'},{t:'C₁₀–C₁₄ فقط',why:'الطلب 20 والمعروض 12'}]}];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:600px;flex:none;gap:8px;justify-content:center;align-items:center">
    <div class="panel" style="padding:8px 12px;align-items:center"><svg viewBox="0 0 ${W} ${H}" width="560" style="direction:ltr;overflow:visible" aria-hidden="true">${s}</svg></div>
    <div style="display:flex;gap:18px;align-items:center;font-size:19px;font-weight:700"><span><span class="dotc" style="background:#E4BC4B"></span>النسبة في البترول %</span><span><span class="dotc" style="background:#5BA8E8"></span>النسبة المطلوبة لتلبية الطلب %</span></div>
    <button type="button" class="btn acc" id="sd">أظهر الطلب ▸</button></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div id="tk">${ticketHTML(items)}</div>
    <div class="gbar hide" id="gb" style="font-size:20px">يزيد المعروض من المشتقات الثقيلة على الطلب، ويقلّ المعروض من الخفيفة: لذلك نحتاج إلى <b>التكسير الحراري</b>.</div></div></div>`;},
 init:function(el){
  var items=[{q:'',opts:[{ok:1},{},{}]},{q:'',opts:[{ok:1},{},{}]},{q:'',opts:[{ok:1},{},{}]}];
  var q=[{q:'',opts:[{t:'',ok:true,why:'الطلب عليها 22% وهو الأكبر'},{t:'',why:'طلبها 4% فقط'},{t:'',why:'طلبها 11%'}]},{q:'',opts:[{t:'',ok:true,why:'الطلب عليها 4% فقط'},{t:'',why:'هذه الأكثر طلباً'},{t:'',why:'طلبها 20%'}]},{q:'',opts:[{t:'',ok:true,why:'المعروض 18 و23 والطلب 15 و4'},{t:'',why:'الطلب عليهما أكبر من المعروض'},{t:'',why:'الطلب 20 والمعروض 12'}]}];
  bindTicket($('#tk',el),q,'need');
  $('#sd',el).addEventListener('click',function(){ $$('.dem',el).forEach(function(g){g.setAttribute('opacity','1')}); this.classList.add('hide'); unhide(el) });
 },
 note:'<ul><li>تمرين ٤-٤ (ب) في كتاب النشاط ص٦٤: جدول النسب المئوية الكتلية لبعض المشتقات وحجم الطلب عليها: C₁–C₄: 4% في البترول و11% للطلب؛ C₅–C₉: 11% و22%؛ C₁₀–C₁₄: 12% و20%؛ C₁₄–C₂₀ (الكيروسين): 18% و15%؛ أكثر من C₂₀ (الشمع والأسفلت): 23% و4%. المطلوب رسم مخططين شريطيين ثم أسئلة (ج): الأكثر طلباً B وC (يشمل الجازولين والنفثا)، والأقل طلباً الشمع والمشتق E (الأسفلت).</li><li>كتاب الطالب ص٩٦ (الصورة ٤-٤): يختلف الطلب الاقتصادي على المشتقات؛ المشتقات الخفيفة كالجازولين يكون الطلب عليها أكبر من العرض، والعكس للثقيلة كالديزل والكيروسين.</li></ul>'});

/* 16 what is thermal cracking */
slide({id:'define',ch:4,title:'ما هو التكسير الحراري؟',tag:'مصطلح علمي',
 html:function(){
  var items=[['المشكلة','الطلب على المشتقات الخفيفة (الجازولين) أكبر من المعروض، والعكس للثقيلة (الديزل والكيروسين).'],['الحل: التكسير الحراري','تكسير الجزيئات الكبيرة في المشتقات الثقيلة إلى جزيئات أصغر وأكبر قيمة.'],['الشرط: حرارة مرتفعة','الطاقة ضرورية لتكسير الروابط، فيصبح ممكناً تكسير جزيئات كبيرة إلى جزيئات أصغر.'],['النواتج دائماً','ألكان أقصر وألكين قصير السلسلة، أو ألكين واحد أو أكثر وهيدروجين.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:440px;flex:none;gap:12px;justify-content:center">
    <div class="frm brk" style="padding:16px 22px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">مصطلحات علمية · Thermal cracking</div>
     <p style="margin:0;font-size:24px;font-weight:800;line-height:1.5"><span style="color:var(--gold)">التكسير الحراري</span>: تفكّك هيدروكربونات ذات سلاسل طويلة إلى ألكانات وألكينات ذات سلاسل أقصر، أو هيدروجين.</p></div>
    <div class="panel compact" id="qp" style="padding:10px 16px"><div style="font-size:21px;font-weight:800;margin-bottom:2px">لماذا تُجرى هذه العملية في المصفاة؟</div>
     ${optsHTML([{t:'لتلبية الطلب على المشتقات الخفيفة الأكثر فائدة'},{t:'لإنتاج الأسفلت'},{t:'لتبريد النفط'}])}<div class="fb" style="min-height:24px"></div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>${cardsHTML(items,'tight')}
    <div class="gbar hide" id="gb" style="font-size:21px">نكسّر الثقيل ← خفيف أكثر قيمة: ألكان أقصر + ألكين.</div></div></div>`;},
 init:function(el){
  var c=false,q=false; function chk(){ if(c&&q) unhide(el) }
  bindCards(el,function(){c=true; chk()});
  bindMcq($('#qp',el),[{t:'',ok:true,why:'تُكسَّر الجزيئات الكبيرة إلى جزيئات أصغر وأكثر قيمة'},{t:'',why:'الأسفلت من الجزيئات الكبيرة، لا من التكسير'},{t:'',why:'التكسير يحتاج إلى حرارة عالية'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩٦: «لا يتطابق الطلب على مشتقات محددة من مصفاة تكرير النفط بالضرورة مع ما توفره عملية التقطير التجزيئي للنفط (الصورة ٤-٤)… ويمكن تكسير الجزيئات الكبيرة الموجودة في هذه المشتقات الثقيلة إلى جزيئات أصغر، وأكبر قيمة. تُسمّى هذه العملية التكسير الحراري. تتم عملية التكسير الحراري عند درجات حرارة مرتفعة، لأن الطاقة ضرورية لتكسير الروابط».</li><li>التعريف في «مصطلحات علمية» ص٩٧: تفكّك هيدروكربونات ذات سلاسل طويلة إلى ألكانات وألكينات ذات سلاسل أقصر أو هيدروجين. عرض NotebookLM شريحة ١٠ («العرض والطلب: الحاجة إلى التكسير الحراري»).</li></ul>'});

/* 17 cracking of ethane: break two C-H bonds */
slide({id:'crack1',ch:4,title:'تكسير الإيثان بالبخار',tag:'اكسر الروابط',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center;align-items:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على ذرتَي الهيدروجين المحاطتين بدائرة ذهبية لتكسر الرابطتين C–H:</div>
    <div class="panel" style="padding:6px 14px;align-items:center"><div id="sv"></div></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div></div>
   <div class="col" style="width:430px;flex:none;gap:10px;justify-content:center">
    <div class="frm brk" style="padding:12px 16px;gap:6px;align-items:center"><div class="sm" style="font-size:20px;text-align:center">إيثان ← هيدروجين + إيثين</div>
     <div class="eqrow" style="font-size:24px"><span class="num lbl">C<sub>2</sub>H<sub>6</sub>(g)</span>${arr('بخار','> 800 °C')}<span class="num lbl">C<sub>2</sub>H<sub>4</sub>(g) + H<sub>2</sub>(g)</span></div></div>
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">ما نواتج تكسير الإيثان؟</div>
     ${optsHTML([{t:'إيثين وهيدروجين'},{t:'إيثان وماء'},{t:'ميثان وكربون'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">كُسرت رابطتان C–H، فتكوّنت رابطة ثنائية بين الكربونين (إيثين)، واتحدت ذرتا H فكوّنتا H<sub>2</sub>.</div></div></div>`;},
 init:function(el){
  var a=false,b=false,q=false,fb=$('.fb',el);
  function chk(){ if(a&&b&&q) unhide(el) }
  function svg(){
    var s='', both=a&&b, c1=[150,125], c2=[240,125];
    function H(x,y,fx,fy,id,gone){ return gone?'':bnd(fx,fy,x,y,4)+atm(x,y,15,'H')+(!both?'<circle data-h="'+id+'" cx="'+x+'" cy="'+y+'" r="22" fill="rgba(228,188,75,.12)" stroke="var(--gold)" stroke-width="3" stroke-dasharray="6 5" style="cursor:pointer"/>':'') }
    if(both){ s+=bnd(c1[0],c1[1]-4,c2[0],c2[1]-4,5)+bnd(c1[0],c1[1]+4,c2[0],c2[1]+4,5) } else { s+=bnd(c1[0],c1[1],c2[0],c2[1],5) }
    s+=bnd(c1[0],c1[1],c1[0],c1[1]+60,4)+atm(c1[0],c1[1]+60,15,'H')+bnd(c2[0],c2[1],c2[0],c2[1]+60,4)+atm(c2[0],c2[1]+60,15,'H')+bnd(c1[0],c1[1],c1[0]-56,c1[1],4)+atm(c1[0]-56,c1[1],15,'H')+bnd(c2[0],c2[1],c2[0]+56,c2[1],4)+atm(c2[0]+56,c2[1],15,'H');
    s+=H(c1[0],c1[1]-62,c1[0],c1[1],'a',a)+H(c2[0],c2[1]-62,c2[0],c2[1],'b',b);
    if(both){ s+=bnd(180,34,210,34,4)+atm(180,34,15,'H')+atm(210,34,15,'H')+'<text x="260" y="40" font-size="20" font-weight="800" fill="#E4BC4B" font-family="Cairo,sans-serif" direction="ltr">H₂</text>' }
    else{ if(a) s+=atm(170,28,15,'H')+'<circle cx="170" cy="28" r="22" fill="none" stroke="#E4BC4B" stroke-width="2"/>'; if(b) s+=atm(220,28,15,'H') }
    s+=atm(c1[0],c1[1],21,'C')+atm(c2[0],c2[1],21,'C');
    $('#sv',el).innerHTML='<svg viewBox="0 0 400 230" width="470" style="direction:ltr;overflow:visible" aria-hidden="true">'+s+'</svg>';
    $$('[data-h]',el).forEach(function(c){c.addEventListener('click',function(){ var k=c.getAttribute('data-h'); if(k==='a') a=true; else b=true; svg();
      if(a&&b){ say(fb,'✓ تكوّن إيثين (C=C) وهيدروجين H₂','ok'); chk() } else say(fb,'كُسرت رابطة C–H. اكسر الأخرى','ok') })});
  }
  svg();
  bindMcq($('#qp',el),[{t:'',ok:true,why:'C₂H₆ ← C₂H₄ + H₂'},{t:'',why:'لا يتكوّن ماء في التكسير'},{t:'',why:'التكسير لا يعطي هذه النواتج'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٩٥: «يمكن مثلاً تكسير الإيثان (وهو من غازات مصافي التكرير) إلى إيثين وهيدروجين. ويتم توفير الحرارة اللازمة لهذا التفاعل عن طريق البخار عند درجة حرارة تزيد على 800 °C». المعادلة: <span class="num">C₂H₆(g) → C₂H₄(g) + H₂(g)</span>. «يمكننا من هذا المثال ملاحظة أن رابطتين أحاديتين C–H في جزيء الإيثان قد كُسرتا، وتكوّنت بدلاً منهما رابطة ثنائية بين ذرتي الكربون، ونتج ألكين هو (الإيثين في هذا المثال). أما ذرتا الهيدروجين اللتان فقدهما الإيثان، فقد اتحدتا لتكوين جزيء هيدروجين». عرض NotebookLM شريحة ١١.</li></ul>'});

/* 18 catalytic cracking of decane */
slide({id:'crack2',ch:4,title:'التكسير الحراري بوجود عامل حفّاز',tag:'جرّب',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:8px"><div style="display:flex;align-items:center;gap:16px"><span style="font-size:22px;font-weight:800">عدد ذرات الكربون في الألكين الناتج</span>${stepHTML('n','n =',2)}</div>
     <div class="eqrow" style="font-size:25px" id="eq"></div><div id="nm" style="font-size:21px;font-weight:700;text-align:center;color:var(--gold)"></div></div>
    <div class="panel" style="padding:10px 16px;gap:8px"><div style="font-size:21px;font-weight:800">أكمل: تكسير الديكان إلى هكسان <span class="num">C<sub>6</sub>H<sub>14</sub></span> وألكين:</div>
     <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;font-size:22px;font-weight:700"><span class="num" style="direction:ltr;display:inline-flex;align-items:center;gap:6px">C<sub>10</sub>H<sub>22</sub> → C<sub>6</sub>H<sub>14</sub> + C ${nin('c4','')} H ${nin('h8','')}</span></div><div class="fb" style="min-height:24px"></div></div></div>
   <div class="col" style="width:380px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:21px;font-weight:800">نوع التفاعل</div><div style="font-size:20px;line-height:1.5">عامل حفّاز: <b>الزيوليت</b> (أو السيليكا أو أكسيد الألومنيوم) عند <b class="num">500 °C</b> تقريباً، بدلاً من أكثر من 800 °C.</div></div>
    <div class="panel" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--gold)">أكثر من ألكين</div><div class="num" style="font-size:20px;direction:ltr;line-height:1.5">C<sub>10</sub>H<sub>22</sub> → C<sub>5</sub>H<sub>12</sub> + C<sub>3</sub>H<sub>6</sub> + C<sub>2</sub>H<sub>4</sub></div><div class="sm" style="font-size:18px">البنتان يُضاف إلى الجازولين، والإيثين والبروبين لصنع البلاستيك.</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">في كل تكسير: عدد الكربون وعدد الهيدروجين يبقيان في الطرفين.</div></div></div>`;},
 init:function(el){
  var AN=['','ميثان','إيثان','بروبان','بيوتان','بنتان','هكسان','هبتان','أوكتان'], EN=['','','إيثين','بروبين','بيوتين','بنتين'], seen={}, nums=false;
  var st=bindStep(el,'n',2,5,function(n){
    seen[n]=1; var c=10-n, h=22-2*n;
    $('#eq',el).innerHTML='<span class="num lbl">C<sub>10</sub>H<sub>22</sub>(g)</span>'+arr('زيوليت','500 °C')+'<span class="num lbl">C<sub>'+c+'</sub>H<sub>'+h+'</sub>(g) + C<sub>'+n+'</sub>H<sub>'+2*n+'</sub>(g)</span>';
    $('#nm',el).textContent='ديكان ← '+AN[c]+' + '+EN[n];
    if(nums&&Object.keys(seen).length===4) unhide(el);
  });
  bindAll(el,[{n:'c4',a:4,w:'✓ 10 − 6 = 4 ذرات كربون',h:'عدد C قبل وبعد: 10 = 6 + ؟'},{n:'h8',a:8,w:'✓ 22 − 14 = 8 ذرات هيدروجين: C₄H₈ (بيوتين)',h:'عدد H قبل وبعد: 22 = 14 + ؟'}],$('.fb',el),function(){nums=true; if(Object.keys(seen).length===4) unhide(el)});
  st.set(2);
 },
 note:'<ul><li>كتاب الطالب ص٩٥–٩٦: «يمكن خفض درجة الحرارة اللازمة لعملية التكسير الحراري باستخدام عامل حفّاز. ففي المفاعل الضخم، تدخل مشتقات الهيدروكربونات وتُخلط مع مسحوق العامل الحفّاز الذي يتكوّن عادة من معادن مثل السيليكا والألومينا والزيوليت عند درجة حرارة أدنى، حوالي 500 °C».</li><li>مثال الكتاب: تكسير الديكان C₁₀H₂₂ (من مشتق النفثا): <span class="num">C₁₀H₂₂ → C₅H₁₂ + C₃H₆ + C₂H₄</span> وأيضاً <span class="num">C₁₀H₂₂ → C₆H₁₄ + C₄H₈</span>. «ينتج عن تفاعلات التكسير الحراري جميعها: ألكان له سلسلة أقصر من سلسلة الألكان الأصلي وألكين له سلسلة قصيرة، أو ألكين واحد أو أكثر وهيدروجين». «البنتان مطلوب أكثر بكثير من الديكان ويوجد عادة في مشتق الجازولين فيمكن خلطه معه لإثراء وقود السيارات».</li><li>لا ينكسر جزيء الديكان دائماً في الموقع نفسه من سلسلته الكربونية.</li></ul>'});

/* 19 octane: example 4-1 */
slide({id:'octane',ch:4,title:'مثال ٤-١: تكسير الأوكتان',tag:'اكتشف',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اكتب معادلة تكسير الأوكتان <span class="num">C<sub>8</sub>H<sub>18</sub></span> إلى ألكين وناتج واحد آخر. اختر الألكين:</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center" id="ob">${[2,3,4,5,6,7].map(function(n){return '<button type="button" class="btn tab" data-n="'+n+'"><span class="num lbl">C<sub>'+n+'</sub>H<sub>'+2*n+'</sub></span></button>'}).join('')}</div>
    <div class="frm brk" style="padding:12px 16px;gap:6px;align-items:center;min-height:130px;justify-content:center"><div class="eqrow" style="font-size:28px" id="eq"></div><div class="sm" id="ck" style="font-size:20px;text-align:center"></div></div>
    <div class="panel" style="padding:4px 18px;flex-direction:row;align-items:center;gap:14px;justify-content:center"><span style="font-size:22px;font-weight:800">وجدت</span><b class="num" id="fc" style="font-size:36px;color:var(--gold)">0</b><span class="num" style="font-size:26px;font-weight:800">/ 6</span></div>
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:21px;font-weight:800">قاعدة الموازنة</div><div style="font-size:20px;line-height:1.5">إذا فقد <span class="num">C<sub>8</sub>H<sub>18</sub></span> ألكيناً <span class="num">C<sub>n</sub>H<sub>2n</sub></span>، بقي <span class="num">C<sub>8−n</sub>H<sub>18−2n</sub></span>.</div></div>
    <div class="panel" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">كم احتمالاً للتكسير؟</div><div style="display:flex;gap:10px;align-items:center">${nin('tot','احتمالاً')}</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الأوكتان يتكسّر بطرق كثيرة؛ الكتاب يعطي اثنتين: إيثين + هكسان، وبروبين + بنتان.</div></div></div>`;},
 init:function(el){
  var AN=['','ميثان','إيثان','بروبان','بيوتان','بنتان','هكسان','هبتان'], EN=['','','إيثين','بروبين','بيوتين','بنتين','هكسين','هبتين'], found={}, num=false;
  function sh(n){ var c=8-n,h=18-2*n; return '<span class="num lbl">C<sub>8</sub>H<sub>18</sub>(g)</span><span style="font-size:32px">→</span><span class="num lbl">C<sub>'+n+'</sub>H<sub>'+2*n+'</sub>(g)</span><span>+</span><span class="num lbl">'+(c===1?'CH<sub>'+h+'</sub>':'C<sub>'+c+'</sub>H<sub>'+h+'</sub>')+'(g)</span>' }
  $$('#ob .tab',el).forEach(function(b){b.addEventListener('click',function(){
    var n=+b.getAttribute('data-n'); found[n]=1; $$('#ob .tab',el).forEach(function(x){x.classList.toggle('acc',x===b)}); b.classList.add('ok-b');
    $('#eq',el).innerHTML=sh(n); $('#ck',el).innerHTML='C: 8 = '+n+' + '+(8-n)+' ✓ &nbsp; H: 18 = '+2*n+' + '+(18-2*n)+' ✓ &nbsp; ('+EN[n]+' + '+AN[8-n]+')';
    var k=Object.keys(found).length; $('#fc',el).textContent=k; if(k===6&&num) unhide(el);
  })});
  bindAll(el,[{n:'tot',a:6,w:'✓ ستة احتمالات (من الإيثين حتى الهبتين)',h:'جرّب كل الأزرار وعدّ الأزواج'}],$('.fb',el),function(){num=true; if(Object.keys(found).length===6) unhide(el)});
 },
 note:'<ul><li>مثال ٤-١ (كتاب الطالب ص٩٦): «اكتب المعادلة الرمزية الموزونة لتكسير الهيدروكربون الأوكتان C₈H₁₈ حيث يتكوّن فقط ألكين واحد ومادة ناتجة أخرى واحدة». حل الكتاب: ألكين = الإيثين C₂H₄ فيبقى C₆H₁₄، أو ألكين = البروبين C₃H₆ فيبقى C₅H₁₂. «يجب عند التعامل مع معادلة كيميائية لعملية تكسير حراري أن تتأكد من أنها موزونة».</li><li>عرض NotebookLM شريحة ١٣ («تعدد احتمالات التكسير: تكسير الأوكتان») يضع ستة أزواج (من الإيثين + هكسان حتى هبتين + ميثان). الأزواج كلها موزونة، والكتاب يكتفي بمثالين.</li></ul>'});

/* 20 virtual lab: thermal cracking of paraffin (activity 4-3) */
slide({id:'labc',ch:4,title:'نشاط ٤-٣: التكسير الحراري للبارافين',tag:'مختبر افتراضي · إثرائي',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:520px;flex:none;gap:8px;justify-content:center;align-items:center">
    <div class="panel" style="padding:6px 10px;align-items:center"><svg viewBox="0 0 520 250" width="500" style="direction:ltr;overflow:visible" aria-hidden="true">
     <rect x="30" y="102" width="160" height="26" rx="13" fill="rgba(255,255,255,.1)" stroke="#cfe" stroke-width="3"/><ellipse cx="62" cy="115" rx="20" ry="9" fill="#d8c9a4"/><rect x="100" y="106" width="44" height="18" fill="#cfd2d4" opacity=".85"/><path d="M190 108 H260 V160" fill="none" stroke="#cfe" stroke-width="4" stroke-linecap="round"/>
     <path d="M230 160 H320 V230 H230 Z" fill="rgba(110,190,255,.22)" stroke="#8fd0ff" stroke-width="3"/><path d="M250 200 V150 Q250 130 270 130 Q290 130 290 150 V200" fill="rgba(255,255,255,.12)" stroke="#cfe" stroke-width="3"/>
     <path d="M70 150 q-12 -22 0 -40 q6 12 12 0 q10 20 -12 40z" fill="#ff9a2e" transform="translate(0,14)"/><path d="M122 150 q-12 -22 0 -40 q6 12 12 0 q10 20 -12 40z" fill="#ff9a2e" transform="translate(0,14)"/>
     <text x="60" y="88" font-size="14" fill="#F3D27A" font-family="Cairo,sans-serif" direction="rtl">صوف مبلّل بالبارافين</text><text x="100" y="196" font-size="14" fill="#F3D27A" font-family="Cairo,sans-serif" direction="rtl">عامل حفّاز Al₂O₃</text><text x="206" y="88" font-size="14" fill="#cfe" font-family="Cairo,sans-serif" direction="rtl">أنبوبة توصيل</text><text x="236" y="246" font-size="14" fill="#8fd0ff" font-family="Cairo,sans-serif" direction="rtl">حمّام ماء</text>
     <g id="g1" transform="translate(350,120)"><text x="0" y="-30" font-size="15" font-weight="700" fill="#e8f" font-family="Cairo,sans-serif" direction="rtl" text-anchor="middle">اختبار الغاز</text><path d="M-30 -20 V60 a30 30 0 0 0 60 0 V-20" fill="none" stroke="#cfe" stroke-width="3"/><clipPath id="c1"><path d="M-28 -2 V60 a28 28 0 0 0 56 0 V-2 Z"/></clipPath><rect id="t1" x="-30" y="-2" width="60" height="100" clip-path="url(#c1)" style="fill:#E8751A;transition:fill 1.4s"/></g>
     <g id="g2" transform="translate(440,120)"><text x="0" y="-30" font-size="15" font-weight="700" fill="#e8f" font-family="Cairo,sans-serif" direction="rtl" text-anchor="middle">اختبار البارافين</text><path d="M-30 -20 V60 a30 30 0 0 0 60 0 V-20" fill="none" stroke="#cfe" stroke-width="3"/><clipPath id="c2"><path d="M-28 -2 V60 a28 28 0 0 0 56 0 V-2 Z"/></clipPath><rect id="t2" x="-30" y="-2" width="60" height="100" clip-path="url(#c2)" style="fill:#E8751A;transition:fill 1.4s"/></g></svg></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div>
    <div class="panel" style="padding:4px 12px"><div class="sm" style="font-size:18px;text-align:center">أنبوبتا الاختبار تتفاعلان مع ماء البروم في الخطوتين ٧ و٨</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:center">
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">رتّب خطوات التجربة: اضغط الخطوة التي تأتي <b>التالية</b>:</div>
    <div id="sl" style="display:flex;flex-direction:column;gap:6px"></div>
    <div class="gbar hide" id="gb" style="font-size:20px"></div></div></div>`;},
 init:function(el){
  var ST=['ضع صوفاً معدنياً مبلّلاً بالبارافين السائل في قاع أنبوبة التسخين','ضع العامل الحفّاز (أكسيد الألومنيوم) في وسط الأنبوبة، وركّب أنبوبة التوصيل وأنابيب جمع الغاز فوق الماء','سخّن العامل الحفّاز بشدة حتى يحمرّ الزجاج قليلاً','حرّك اللهب نحو البارافين ليتبخّر، واجمع الغاز الناتج في الأنابيب','أخرج أنبوبة التوصيل من الماء','أوقف التسخين','اختبر الغاز الناتج بماء البروم','أجرِ الاختبار نفسه على البارافين'];
  var order=[3,6,1,7,0,4,2,5], next=0, fb=$('.fb',el), box=$('#sl',el);
  order.forEach(function(k){ var b=document.createElement('button'); b.type='button'; b.className='btn'; b.style.cssText='justify-content:flex-start;text-align:start;font-size:19px;padding:6px 14px;min-height:0;line-height:1.35;gap:10px;background:rgba(var(--d2),.9)'; b.setAttribute('data-k',k); b.innerHTML='<span class="rn" style="width:30px;height:30px;font-size:17px;flex:none">؟</span><span>'+ST[k]+'</span>'; box.appendChild(b);
    b.addEventListener('click',function(){
      if(b.classList.contains('ok-b')) return;
      if(k===next){ b.classList.add('ok-b'); $('.rn',b).textContent=ar(next+1); next++; say(fb,'✓ '+(k===4?'ممتاز! يُخرج أنبوبة التوصيل من الماء أولاً حتى لا يرتد الماء البارد':'صح'),'ok');
        if(k===6){ $('#t1',el).style.fill='rgba(225,240,240,.25)' }
        if(k===7){ $('#t2',el).style.fill='#E8751A'; var g=$('#gb',el); g.innerHTML='الغاز الناتج أزال لون ماء البروم (<b>غير مشبع</b>)، أما البارافين فلم يغيّر لونه (<b>مشبع</b>).'; unhide(el) } }
      else if(k===5&&next===4){ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,'خطر! إيقاف التسخين قبل إخراج أنبوبة التوصيل من الماء يسحب الماء البارد إلى الأنبوبة الساخنة (ارتداد)','bad') }
      else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake'); b.classList.remove('bad-b')},700); say(fb,'ليست هذه الخطوة التالية: فكّر في ترتيب العمل','bad') }
    }); });
 },
 note:'<ul><li>نشاط ٤-٣ (كتاب الطالب ص٩٧، إثرائي) والطريقة البديلة في دليل المعلم ص٨٧–٨٨: ١) ضع سدادة من الصوف المعدني في قاع أنبوبة التسخين وأضف بارافين سائلاً يكفي لتبليلها. ٢) ثبّت الأنبوبة مائلة ميلاناً خفيفاً إلى أعلى، وضع العامل الحفّاز (أكسيد الألومنيوم أو الخزف) في الوسط وركّب أنبوبة التوصيل. ٣) أكمل الجهاز وأنابيب جمع الغاز. ٤) سخّن العامل الحفّاز بشدة لبضع دقائق. ٥) حرّك اللهب نحو البارافين من وقت إلى آخر. ٦) اجمع الأنابيب الممتلئة بالغاز. ٧) عند الانتهاء أخرج أولاً أنبوبة التوصيل من الماء ثم أوقف التسخين. ٨) اختبر الغاز مع ماء البروم. ٩) أجرِ الاختبار نفسه على البارافين.</li><li>التنبيه الأمني المهم: «من الضروري تفادي الإرجاع (suck-back) عند نهاية التجربة»، فتُركّب فخّ أمان أو صمام بنزن. الملاحظة المتوقعة: يفقد ماء البروم لونه مع الغاز ولا يتغير مع البارافين.</li></ul>'});

/* 21 the questions of activity 4-3 */
ticketSlide({id:'labcq',ch:4,title:'أسئلة النشاط ٤-٣ والتمرين ٤-٤',tag:'تذكرة',items:[
 {q:'<b>و٣)</b> ما الغرض من استخدام أكسيد الألومنيوم؟',opts:[{t:'عامل حفّاز',ok:true,why:'يخفض درجة الحرارة اللازمة للتكسير الحراري'},{t:'مبرّد',why:'ليس هذا دوره'},{t:'مذيب',why:'ليس مذيباً'}]},
 {q:'<b>و٤)</b> عند توقف التسخين تُزال أنبوبة التوصيل من الماء. لماذا؟',opts:[{t:'لمنع الارتداد، فقد يُسحب الماء البارد إلى داخل الجهاز الساخن',ok:true,why:'ارتداد الماء البارد على الزجاج الساخن خطير'},{t:'لتوفير الماء',why:'ليست مسألة توفير'},{t:'لتبريد الغاز أسرع',why:'الخطر هو الارتداد'}]},
 {q:'<b>و٥)</b> <span class="num">C<sub>10</sub>H<sub>22</sub> → C<sub>8</sub>H<sub>18</sub> + ...</span> ما الغاز الناتج؟',opts:[{t:'إيثين <span class="num">C<sub>2</sub>H<sub>4</sub></span>',ok:true,why:'C₁₀H₂₂ − C₈H₁₈ = C₂H₄'},{t:'إيثان <span class="num">C<sub>2</sub>H<sub>6</sub></span>',why:'عدد H لا يوازن'},{t:'هيدروجين',why:'عدد C لا يوازن'}]},
 {q:'<b>و٦)</b> اختُبر الغاز الناتج بماء البروم فتحوّل إلى عديم اللون. إلى ماذا يشير ذلك؟',opts:[{t:'أن الغاز ألكين (غير مشبع)',ok:true,why:'الألكينات تزيل لون ماء البروم'},{t:'أن الغاز ألكان',why:'الألكان لا يغيّر لون ماء البروم'},{t:'أن الغاز هيدروجين',why:'ليس هذا اختباراً للهيدروجين'}]},
 {q:'<b>و٧)</b> ما نوع التفاعل الذي يحدث خلال اختبار هذا الغاز؟',opts:[{t:'تفاعل إضافة',ok:true,why:'يتفاعل الألكين مع البروم بالإضافة'},{t:'احتراق',why:'لا يحدث احتراق'},{t:'تكسير حراري',why:'هذا ما حدث للبارافين قبل الاختبار'}]},
 {type:'num',q:'<b>ز)</b> <span class="num">C<sub>15</sub>H<sub>32</sub> → C<sub>2</sub>H<sub>4</sub> + C<sub>3</sub>H<sub>6</sub> + C<sub>4</sub>H<sub>8</sub> + C<sub>x</sub>H<sub>14</sub></span> كم ذرة كربون x في الهيدروكربون الآخر؟',unit:'ذرات',ans:6,tol:.01,why:'15 − (2+3+4) = 6، فالناتج الآخر C₆H₁₄ (هكسان)',hint:'اطرح عدد ذرات الكربون في النواتج الثلاثة من 15'}
 ],
 note:'<ul><li>أسئلة النشاط ٤-٣ في تمرين ٤-٤ (و) من كتاب النشاط (ص٦٥–٦٦) وإجابات دليل المعلم: ٣) أكسيد الألومنيوم عامل حفّاز؛ ٤) لمنع «الإرجاع» فقد يُسحب الماء البارد إلى داخل الجهاز الساخن؛ ٥) C₁₀H₂₂ → C₈H₁₈ + C₂H₄ (إيثين)؛ ٦) يُعدّ هذا الاختبار إيجابياً لألكين (عدم التشبع)؛ ٧) تفاعل إضافة؛ (ز) C₁₅H₃₂ → C₂H₄ + C₃H₆ + C₄H₈ + C₆H₁₄.</li></ul>'});
