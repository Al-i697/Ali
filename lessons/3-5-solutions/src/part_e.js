/* ---------- solutions, part E: titration calculations (book pages 72-73, examples 3-9 and 3-10, questions 3-18 to 3-20) ---------- */

/* 19 the three-step method */
slide({id:'method',ch:4,title:'حسابات المعايرة: ثلاث خطوات',tag:'رتّب الخطوات',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:flex-start">
   ${[0,1,2].map(function(i){return `<div style="display:flex;align-items:center;gap:10px"><div class="mk" style="width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:25px;flex:none">${ar(i+1)}</div><div class="mslot slot" data-k="${i}" style="flex:1;min-height:72px"><span class="ph" style="font-size:19px">اسحب الخطوة المناسبة</span></div></div>`}).join('')}
   <div class="imp-tray" id="tray" style="display:flex;flex-direction:column;gap:8px"></div>
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">دائماً نمرّ بـ<b>المولات</b>: معلوم ← n ← نسبة المعادلة ← n ← مجهول.</div></div>
  <div class="col" style="width:430px;flex:none;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:12px 18px;gap:5px;align-items:center"><div style="font-size:20px;font-weight:800;color:var(--cyan)">نسبة المولات في تفاعل التعادل</div>
    <div class="bigeq" style="font-size:25px;color:var(--gold)">HCl + NaOH → NaCl + H<sub>2</sub>O</div><div class="pill" style="font-family:var(--font-display);font-weight:800;font-size:22px">1 : 1</div></div>
   <div class="frm brk" style="padding:12px 18px;gap:5px;align-items:center"><div class="bigeq" style="font-size:25px;color:var(--gold)">H<sub>2</sub>SO<sub>4</sub> + 2KOH → K<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</div><div class="pill" style="font-family:var(--font-display);font-weight:800;font-size:22px">1 : 2</div></div></div></div>`;},
 init:function(el){
  bindMatch(el,[[1,'استخدم نسبة المولات من المعادلة الكيميائية الموزونة لتجد عدد مولات المادة الأخرى'],[0,'حوّل حجم وتركيز المحلول المعلوم إلى مولات: n = C × V (الحجم باللتر)'],[2,'احسب التركيز أو الحجم المطلوب: C = n ÷ V أو V = n ÷ C']],{css:'font-size:20px;padding:9px 16px;text-align:start',bad:'فكّر: ما الذي نعرفه تماماً في البداية؟'});
 },
 note:'<ul><li>كتاب الطالب ص٧٢–٧٣ ودليل المعلم: «قد تكون الحسابات المتعلقة بعمليات المعايرة صعبة، ما يعني ضرورة تناولها بطريقة منهجية». الخطوات: ١) عدد مولات المادة القلوية من حجمها وتركيزها المولي، ٢) عدد مولات الحمض من المعادلة الموزونة، ٣) التركيز من عدد المولات والحجم.</li><li>عرض NotebookLM (شريحة ٩): الخطوات الثلاث بمثال CaCO₃ + 2HCl، وسنراه في سؤال ٣-٢٠.</li></ul>'});

/* 20 example 3-9 */
chainSlide({id:'ex39',ch:4,title:'مثال ٣-٩: تركيز الحمض من المعايرة',
 eq:'NaOH + HCl → NaCl + H<sub>2</sub>O',eqSize:34,data:'وُجد أن <b class="num">20 mL</b> من حمض HCl تعادل <b class="num">25 mL</b> من محلول NaOH تركيزه <b class="num">0.10 mol/L</b>. ما التركيز المولي لـ HCl؟',
 labels:['المعطى (NaOH)','n(NaOH)','n(HCl)','C(HCl)'],first:'C = 0.10<br>V = 25 mL',
 steps:[{n:'e1',q:'n(NaOH) = C × V',u:'mol',lab:'n =',a:0.0025,t:0.00003,w:'✓ 0.10 × 0.025 = 0.0025 mol',h:'حوّل 25 mL إلى 0.025 L ثم اضرب',fill:'0.0025 mol'},{n:'e2',q:'n(HCl) من النسبة 1 : 1',u:'mol',lab:'n =',a:0.0025,t:0.00003,w:'✓ النسبة 1 : 1 فالعدد نفسه 0.0025 mol',h:'1 mol من NaOH تعادل 1 mol من HCl',fill:'0.0025 mol'},{n:'e3',q:'C(HCl) = n ÷ V',u:'mol/L',lab:'C =',a:0.125,t:0.002,w:'✓ 0.0025 ÷ 0.020 = 0.125 mol/L',h:'اقسم على 0.020 L (حجم الحمض)',fill:'0.125 mol/L'}],
 side:'<div class="defc gold" style="flex:none"><b>النسبة من المعادلة</b><span>HCl : NaOH = <b>1 : 1</b></span></div>',
 gbar:'<b>0.125 mol/L</b>. انتبه: نقسم على حجم الحمض (20 mL) لا حجم القاعدة.',
 note:'<ul><li>مثال ٣-٩ في كتاب الطالب (ص٧٢)، ومثال ٢٠ في كراسة الأمثلة: 0.10 × 0.025 = 0.0025 mol من NaOH = 0.0025 mol من HCl، والتركيز = 0.0025 ÷ 0.020 = 0.125 mol/L.</li><li>ملاحظة: هذا المثال غير موجود في عرض NotebookLM (استُبدل بمثال CaCO₃)، وهو من كتاب الطالب.</li></ul>'});

/* 21 example 3-10: a 1 : 2 ratio */
chainSlide({id:'ex310',ch:4,title:'مثال ٣-١٠: نسبة ١ : ٢',
 eq:'H<sub>2</sub>SO<sub>4</sub> + 2KOH → K<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O',eqSize:30,data:'تمت معايرة <b class="num">16.7 mL</b> من H<sub>2</sub>SO<sub>4</sub> تركيزه <b class="num">0.015 mol/L</b> بمحلول KOH تركيزه <b class="num">0.05 mol/L</b>. ما حجم محلول KOH الذي عادل الحمض؟',
 labels:['المعطى (حمض)','n(H₂SO₄)','n(KOH)','V(KOH)'],first:'C = 0.015<br>V = 16.7 mL',
 steps:[{n:'e1',q:'n(H<sub>2</sub>SO<sub>4</sub>) = C × V',u:'mol',lab:'n =',a:0.015*0.0167,t:0.000004,w:'✓ 0.015 × 0.0167 = 0.00025 mol (2.51 × 10⁻⁴)',h:'حوّل 16.7 mL إلى L: 0.0167 ثم اضرب. اكتب 0.00025',fill:'2.51×10<sup>-4</sup>'},{n:'e2',q:'n(KOH) من النسبة 1 : 2',u:'mol',lab:'n =',a:0.015*0.0167*2,t:0.000008,w:'✓ × 2 = 0.0005 mol (5.02 × 10⁻⁴)',h:'1 mol من الحمض تعادل 2 mol من KOH. اكتب 0.0005',fill:'5.02×10<sup>-4</sup>'},{n:'e3',q:'V(KOH) = n ÷ C',u:'mL',lab:'V =',a:10.0,t:0.15,w:'✓ 5.02×10⁻⁴ ÷ 0.05 = 0.01 L = 10 mL',h:'اقسم على 0.05 ثم حوّل إلى mL',fill:'10 mL'}],
 side:'<div class="defc gold" style="flex:none"><b>النسبة من المعادلة</b><span>H<sub>2</sub>SO<sub>4</sub> : KOH = <b>1 : 2</b></span></div>',
 gbar:'القاعدة تحتاج <b>ضعف</b> مولات الحمض: <b>10 mL</b> من KOH.',
 note:'<ul><li>مثال ٣-١٠ في كتاب الطالب (ص٧٣) ومثال ٢١ في الكراسة: n = 2.51 × 10⁻⁴ mol، تعادل 5.02 × 10⁻⁴ mol من KOH، الحجم = 0.01 L = 10 mL.</li><li>خطأ شائع: نسيان نسبة 1 : 2 (الأولى مع الكبريتيك).</li></ul>'});

/* 22 question 3-18 */
rowsSlide({id:'q318',ch:4,title:'سؤال ٣-١٨: تركيز حمض الكبريتيك',
 intro:'تفاعل <b class="num">20 mL</b> من NaOH تركيزه <b class="num">0.1 mol/L</b> مع <b class="num">22.7 mL</b> من حمض الكبريتيك: <span class="num">2NaOH + H<sub>2</sub>SO<sub>4</sub> → Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</span>. احسب تركيز الحمض بالخطوات:',
 rows:[{n:'a',q:'أ. عدد مولات NaOH في 20 mL',u:'mol',lab:'n =',a:0.002,t:0.00003,w:'✓ 0.1 × 0.020 = 0.002 mol',h:'n = C × V (بالـ L)'},{n:'b',q:'ب. عدد مولات H<sub>2</sub>SO<sub>4</sub> لكل 1 mol من NaOH',u:'mol',lab:'=',a:0.5,t:0.005,w:'✓ النسبة H₂SO₄ : NaOH = 1 : 2 = 0.5',h:'انظر إلى المعاملات في المعادلة'},{n:'c',q:'ج. عدد مولات H<sub>2</sub>SO<sub>4</sub> المتفاعلة',u:'mol',lab:'n =',a:0.001,t:0.000015,w:'✓ 0.002 × 0.5 = 0.001 mol',h:'اضرب نتيجة (أ) في نتيجة (ب)'},{n:'d',q:'د. التركيز المولي لحمض الكبريتيك',u:'mol/L',lab:'C =',a:0.001/0.0227,t:0.0007,w:'✓ 0.001 ÷ 0.0227 = 0.044 mol/L',h:'اقسم على 22.7 mL = 0.0227 L'}],
 side:'<div class="defc gold" style="flex:none"><b>انتبه للنسبة</b><span>2NaOH : 1H<sub>2</sub>SO<sub>4</sub> ← عدد مولات الحمض <b>نصف</b> عدد مولات القاعدة.</span></div>',
 gbar:'<b>0.044 mol/L</b>. الخطوات: مولات القاعدة ← نسبة ← مولات الحمض ← ÷ الحجم.',
 note:'<ul><li>كتاب الطالب سؤال ٣-١٨ (ص٧٦). الإجابة: ٠٫٠٠٢ mol، ٠٫٥، ٠٫٠٠١ mol، ٠٫٠٤٤ mol/L.</li></ul>'});

/* 23 question 3-19: the volume of acid */
chainSlide({id:'q319',ch:4,title:'سؤال ٣-١٩: حجم الحمض',
 eq:'NaOH + HCl → NaCl + H<sub>2</sub>O',eqSize:34,data:'تمت معايرة <b class="num">25 mL</b> من NaOH تركيزه <b class="num">0.1 mol/L</b> مع HCl تركيزه <b class="num">0.2 mol/L</b>. احسب حجم الحمض المستخدم بالـ mL.',
 labels:['المعطى (NaOH)','n(NaOH)','n(HCl)','V(HCl)'],first:'C = 0.1<br>V = 25 mL',
 steps:[{n:'e1',q:'n(NaOH) = C × V',u:'mol',lab:'n =',a:0.0025,t:0.00003,w:'✓ 0.1 × 0.025 = 0.0025 mol',h:'حوّل 25 mL إلى 0.025 L',fill:'0.0025 mol'},{n:'e2',q:'n(HCl) من النسبة 1 : 1',u:'mol',lab:'n =',a:0.0025,t:0.00003,w:'✓ النسبة 1 : 1',h:'1 mol HCl لكل 1 mol NaOH',fill:'0.0025 mol'},{n:'e3',q:'V(HCl) = n ÷ C',u:'mL',lab:'V =',a:12.5,t:0.15,w:'✓ 0.0025 ÷ 0.2 = 0.0125 L = 12.5 mL',h:'V = n ÷ C ثم حوّل إلى mL',fill:'12.5 mL'}],
 side:'<div class="defc blue" style="flex:none"><b>تحقق من المنطق</b><span>الحمض أقوى تركيزاً (0.2 مقابل 0.1) فنحتاج حجماً <b>أقل</b> منه من القاعدة (12.5 &lt; 25).</span></div>',
 gbar:'الحجم <b>12.5 mL</b>: هنا نبحث عن <b>حجم</b> لا تركيز: <b>V = n ÷ C</b>.',
 note:'<ul><li>كتاب الطالب سؤال ٣-١٩ (ص٧٦). الإجابة: ١٢٫٥ mL.</li></ul>'});

/* 24 question 3-20: calcium carbonate with the acid (the deck's worked example) */
chainSlide({id:'q320',ch:4,title:'سؤال ٣-٢٠: مادة صلبة مع الحمض',
 eq:'CaCO<sub>3</sub>(s) + 2HCl(aq) → CaCl<sub>2</sub>(aq) + H<sub>2</sub>O(l) + CO<sub>2</sub>(g)',eqSize:26,data:'أذاب طالب <b class="num">10.0 g</b> من كربونات الكالسيوم في <b class="num">250 mL</b> من حمض HCl. احسب تركيز الحمض المستخدم في التفاعل. <span class="num">C = 12 ، O = 16 ، Ca = 40</span>',
 labels:['المعطى','n(CaCO₃)','n(HCl)','C(HCl)'],first:'m = 10.0 g<br>V = 250 mL',
 steps:[{n:'e1',q:'n(CaCO<sub>3</sub>) = m ÷ M<sub>r</sub>',u:'mol',lab:'n =',a:0.1,t:0.002,w:'✓ M = 100 ← 10.0 ÷ 100 = 0.1 mol',h:'M(CaCO₃) = 40 + 12 + 3 × 16 = 100',fill:'0.1 mol'},{n:'e2',q:'n(HCl) من النسبة 1 : 2',u:'mol',lab:'n =',a:0.2,t:0.003,w:'✓ 0.1 × 2 = 0.2 mol',h:'1 mol من CaCO₃ تتفاعل مع 2 mol من HCl',fill:'0.2 mol'},{n:'e3',q:'C(HCl) = n ÷ V',u:'mol/L',lab:'C =',a:0.8,t:0.01,w:'✓ 0.2 ÷ 0.25 = 0.8 mol/L',h:'اقسم على 0.25 L',fill:'0.8 mol/L'}],
 side:'<div class="defc gold" style="flex:none"><b>معطى صلب</b><span>نبدأ من الكتلة (n = m ÷ M<sub>r</sub>) بدل C × V، وبقية الخطوات نفسها.</span></div>',
 gbar:'<b>0.8 mol/L</b>. الطريقة نفسها وإن اختلف نوع المعطى.',
 note:'<ul><li>كتاب الطالب سؤال ٣-٢٠ (ص٧٦). هذا هو مثال الخطوات الثلاث في عرض NotebookLM (شريحة ٩): n = 0.1 mol، n(HCl) = 0.2 mol، C = 0.8 mol/L.</li><li>الفرق عن المعايرة السابقة: المعطى مادة صلبة (كتلة) لا محلول.</li></ul>'});
