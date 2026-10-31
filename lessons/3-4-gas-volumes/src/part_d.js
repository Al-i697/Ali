/* ---------- gas volumes, part D: a mass and a gas in one reaction (book figure 3-4, question 3-15, end-of-unit question 4, worksheet 3-5) ---------- */

/* 17 the route map: given and wanted can each be a mass or a gas volume */
slide({id:'flow34',ch:4,title:'خريطة الحل: من المعطى إلى المطلوب',tag:'اختر المعطى والمطلوب',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:4px;justify-content:center">
   <div class="frow"><div class="rbx" id="fA">كتلة المادة (g) ÷ <span class="num">M<sub>r</sub></span></div><div class="rbx" id="fB">حجم الغاز (L) ÷ <span class="num">24</span></div><div class="rbx dim">حجم المحلول × التركيز <small>(الدرس ٣-٥)</small></div></div>
   <div class="fa">▼</div><div class="rbx wide" id="fN1">عدد مولات المادة المعطاة</div>
   <div class="fa">▼</div><div class="rbx wide red" id="fR">استخدم نسبة المولات من المعادلة الموزونة</div>
   <div class="fa">▼</div><div class="rbx wide" id="fN2">عدد مولات المادة المطلوبة</div>
   <div class="fa">▼</div>
   <div class="frow"><div class="rbx" id="fD">الكتلة (g) = n × <span class="num">M<sub>r</sub></span></div><div class="rbx" id="fE">حجم الغاز (L) = n × <span class="num">24</span></div><div class="rbx dim">التركيز = n ÷ V <small>(الدرس ٣-٥)</small></div></div></div>
  <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center">
   <div class="panel" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">المعطى في السؤال:</div><div class="chips" style="gap:10px"><button type="button" class="pill pk" data-g="m">كتلة (g)</button><button type="button" class="pill pk" data-g="v">حجم غاز</button></div>
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">المطلوب:</div><div class="chips" style="gap:10px"><button type="button" class="pill pw" data-w="m">كتلة (g)</button><button type="button" class="pill pw" data-w="v">حجم غاز</button></div></div>
   <div class="frm brk" id="fex" style="padding:12px 18px;gap:6px;min-height:150px;justify-content:center"><div style="font-size:21px;font-weight:800;color:var(--gold)" id="fext">اختر المعطى والمطلوب لترى المسار</div><div class="sm" id="fexd" style="font-size:20px;line-height:1.45"> </div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">دائماً نمرّ بـ<b>المولات</b>: المعطى ← n ← نسبة المعادلة ← n ← المطلوب.</div></div></div>`;},
 init:function(el){
  var g=null, w=null, seen={};
  var EX={mm:['كتلة ← كتلة','مثال: كتلة Mg المحترقة ← كتلة MgO الناتجة (الدرس ٣-٣). تمرّ عبر الكتلة المولية مرتين.'],mv:['كتلة ← حجم غاز','مثال: 0.5 g من Na ← حجم H₂ (سؤال ٣-١٥). نقسم على M<sub>r</sub> ثم نضرب في 24000 mL.'],vm:['حجم غاز ← كتلة','مثال: 82 mL من H₂ ← كتلة Mg (تمرين ٣-٤). نقسم على 24000 ثم نضرب في M<sub>r</sub>.'],vv:['حجم غاز ← حجم غاز','مثال: 24 L من NO₂ ← حجم H₂ (سؤال ٤ ب). اختصار: نسبة الحجوم مباشرة، بدون مولات.']};
  function paint(){
   ['fA','fB','fD','fE','fN1','fR','fN2'].forEach(function(i){$('#'+i,el).classList.remove('on')});
   if(g&&w){
    $('#'+(g==='m'?'fA':'fB'),el).classList.add('on'); $('#'+(w==='m'?'fD':'fE'),el).classList.add('on'); ['fN1','fR','fN2'].forEach(function(i){$('#'+i,el).classList.add('on')});
    var e=EX[g+w]; $('#fext',el).textContent=e[0]; $('#fexd',el).innerHTML=e[1]; seen[g+w]=1;
    if(Object.keys(seen).length===4){var b=$('#gb',el); b.classList.remove('hide'); b.classList.add('up')}
   }
  }
  $$('.pk',el).forEach(function(b){b.addEventListener('click',function(){g=b.getAttribute('data-g'); $$('.pk',el).forEach(function(x){x.classList.toggle('on',x===b)}); paint()})});
  $$('.pw',el).forEach(function(b){b.addEventListener('click',function(){w=b.getAttribute('data-w'); $$('.pw',el).forEach(function(x){x.classList.toggle('on',x===b)}); paint()})});
 },
 note:'<ul><li>كتاب الطالب الشكل ٣-٤ (ص٦٩) والشكل ٣-٨ (ص٧٦): الطريقة نفسها لأي معطى ومطلوب: نحوّل المعطى إلى مولات، نستخدم نسبة المعادلة، ثم نحوّل المولات إلى المطلوب.</li><li>الصف الأيمن في الأعلى للمواد الصلبة والسائلة، والأوسط للغازات فقط. الأيسر (المحاليل) نعود له في الدرس ٣-٥.</li><li>جرّبوا الحالات الأربع بالترتيب، فكل حالة منها هي سؤال سنحله في الشرائح التالية.</li></ul>'});

/* 18 question 3-15: sodium with water */
chainSlide({id:'q315',ch:4,title:'سؤال ٣-١٥: كتلة ← حجم غاز',
 eq:'2Na(s) + 2H<sub>2</sub>O(l) → 2NaOH(aq) + H<sub>2</sub>(g)',eqSize:30,
 data:'أُضيف <b class="num">0.5 g</b> من فلز الصوديوم إلى فائض من الماء. كم mL من غاز H<sub>2</sub> ينتج عند درجة حرارة الغرفة والضغط القياسي؟ <span class="num">(Na = 23)</span>',
 labels:['المعطى','n(Na)','n(H₂)','V(H₂)'],first:'m = 0.5 g',
 steps:[{n:'s1',q:'n(Na) = الكتلة ÷ M<sub>r</sub>',u:'mol',lab:'n =',a:0.5/23,t:0.0002,w:'✓ 0.5 ÷ 23 = 0.0217 mol',h:'اقسم 0.5 على 23',fill:'0.0217 mol'},
        {n:'s2',q:'n(H<sub>2</sub>) من نسبة المعادلة (2 : 1)',u:'mol',lab:'n =',a:0.5/23/2,t:0.0001,w:'✓ 0.0217 ÷ 2 = 0.0109 mol',h:'2 mol من Na تعطي 1 mol من H₂',fill:'0.0109 mol'},
        {n:'s3',q:'V(H<sub>2</sub>) = n × 24000',u:'mL',lab:'V =',a:0.5/23/2*24000,t:4,w:'✓ 0.0109 × 24000 = 261 mL',h:'اضرب عدد المولات في 24000 mL/mol',fill:'261 mL'}],
 side:'<div class="defc gold" style="flex:none"><b>النسبة من المعادلة</b><span>2 mol من Na تعطي <b>1 mol</b> من H<sub>2</sub></span></div>',
 gbar:'كتلة ← مولات ← نسبة المعادلة ← حجم: <b>261 mL</b> من الهيدروجين.',
 note:'<ul><li>كتاب الطالب سؤال ٣-١٥، وإجابته ٢٦١ mL (من عرضك القديم، شريحة «إجابات ص٦٩»).</li><li>انتبه: 2Na تعطي H₂ واحداً. خطأ شائع أن يضربوا في 2 بدل أن يقسموا على 2.</li></ul>'});

/* 19 activity book worksheet 3-5, question 1 c: zinc with hydrochloric acid */
chainSlide({id:'zn',ch:4,title:'ورقة العمل ٣-٥ (١ ج): الخارصين مع الحمض',
 eq:'Zn(s) + 2HCl(aq) → ZnCl<sub>2</sub>(aq) + H<sub>2</sub>(g)',eqSize:30,
 data:'احسب حجم الهيدروجين المنبعث عند درجة حرارة الغرفة والضغط القياسي بعد إضافة فائض من حمض الهيدروكلوريك إلى <b class="num">4 g</b> من الخارصين. <span class="num">(Zn = 65)</span> ، و<span class="num">1 mol</span> من أي غاز يشغل <span class="num">24000 mL</span>',
 labels:['المعطى','n(Zn)','n(H₂)','V(H₂)'],first:'m = 4 g',
 steps:[{n:'z1',q:'n(Zn) = 4 ÷ 65',u:'mol',lab:'n =',a:4/65,t:0.0005,w:'✓ 4 ÷ 65 = 0.0615 mol',h:'اقسم الكتلة على 65',fill:'0.0615 mol'},
        {n:'z2',q:'n(H<sub>2</sub>) من نسبة المعادلة (1 : 1)',u:'mol',lab:'n =',a:4/65,t:0.0005,w:'✓ النسبة 1 : 1 فالعدد نفسه 0.0615 mol',h:'1 mol من Zn تعطي 1 mol من H₂',fill:'0.0615 mol'},
        {n:'z3',q:'V(H<sub>2</sub>) = n × 24000',u:'mL',lab:'V =',a:4/65*24000,t:14,w:'✓ 0.0615 × 24000 = 1477 mL',h:'اضرب في 24000 mL/mol',fill:'1477 mL'}],
 side:'<div class="defc blue" style="flex:none"><b>النسبة من المعادلة</b><span>1 mol من Zn تعطي <b>1 mol</b> من H<sub>2</sub>، فعدد المولات لا يتغير.</span></div>',
 gbar:'الحجم <b>1477 mL</b> تقريباً (1.48 L).',
 note:'<ul><li>كتاب النشاط ورقة العمل ٣-٥ سؤال ١ (ج). في عرض NotebookLM الإجابة نفسها: 0.06154 mol و1477 mL.</li><li>الدليل يضع سؤال ١ ضمن واجب الموضوع ٣-٤، وجزءا (أ) و(ب) فيه عن التركيز (الدرس ٣-٥).</li></ul>'});

/* 20 end-of-unit question 4: magnesium nitrate */
slide({id:'mgno3',ch:4,title:'سؤال ٤ نهاية الوحدة: نترات الماغنيسيوم',tag:'كتلة ← غاز وغاز ← غاز',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="frm brk" style="flex:1;min-width:0;padding:12px 20px;gap:8px;justify-content:flex-start"><div style="font-size:23px;font-weight:800;color:var(--cyan)">أ</div>
   <div class="bigeq" style="font-size:25px;color:var(--gold)">2Mg(NO<sub>3</sub>)<sub>2</sub>(s) → 2MgO(s) + 4NO<sub>2</sub>(g) + O<sub>2</sub>(g)</div>
   <p class="lead" style="margin:0;font-size:21px;line-height:1.5">تفككت عينة من نترات الماغنيسيوم كتلتها <b class="num">2.96 g</b> <span class="num">(Mg = 24 ، N = 14 ، O = 16)</span>.</p>
   ${qline('١. عدد مولات Mg(NO<sub>3</sub>)<sub>2</sub>',[['g1','mol','n =']])}${qline('٢. حجم NO<sub>2</sub> الناتج',[['g2','mL','V =']])}${qline('٣. حجم O<sub>2</sub> الناتج',[['g3','mL','V =']])}<div class="fb fa1" style="min-height:24px;text-align:center"></div></div>
  <div class="frm brk" style="width:430px;flex:none;padding:12px 20px;gap:8px;justify-content:flex-start"><div style="font-size:23px;font-weight:800;color:var(--cyan)">ب</div>
   <div class="bigeq" style="font-size:25px;color:var(--gold)">2NO<sub>2</sub> + 4H<sub>2</sub> → N<sub>2</sub> + 4H<sub>2</sub>O</div>
   <p class="lead" style="margin:0;font-size:21px;line-height:1.5">إذا تم تحويل <b class="num">24 L</b> من NO<sub>2</sub> بهذه الطريقة:</p>
   ${qline('١. حجم H<sub>2</sub> اللازم',[['h1','L','V =']])}${qline('٢. حجم N<sub>2</sub> الناتج',[['h2','L','V =']])}<div class="fb fa2" style="min-height:24px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:19px">(أ) كتلة ← مولات ← نسبة ← حجم. (ب) غازات فقط: <b>نسبة الحجوم</b> مباشرة.</div></div></div>`;},
 init:function(el){
  var d1=false, d2=false;
  function chk(){ if(d1&&d2){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} }
  bindSeq(el,[{n:'g1',a:0.02,t:0.0002,w:'✓ M = 24 + 2×(14 + 48) = 148 ← 2.96 ÷ 148 = 0.02 mol',h:'M(Mg(NO₃)₂) = 24 + 2 × (14 + 3 × 16) = 148'},{n:'g2',a:960,t:8,w:'✓ n(NO₂) = 0.02 × 4 ÷ 2 = 0.04 mol ← × 24000 = 960 mL',h:'4 mol من NO₂ لكل 2 mol من النترات ثم × 24000'},{n:'g3',a:240,t:2,w:'✓ n(O₂) = 0.02 ÷ 2 = 0.01 mol ← × 24000 = 240 mL',h:'1 mol من O₂ لكل 2 mol من النترات ثم × 24000'}],$('.fa1',el),function(){d1=true; chk()});
  bindSeq(el,[{n:'h1',a:48,t:0.5,w:'✓ النسبة 2 : 4 ← 24 × 2 = 48 L',h:'H₂ ضعف حجم NO₂ (4 : 2)'},{n:'h2',a:12,t:0.2,w:'✓ النسبة 2 : 1 ← 24 ÷ 2 = 12 L',h:'N₂ نصف حجم NO₂ (1 : 2)'}],$('.fa2',el),function(){d2=true; chk()});
 },
 note:'<ul><li>كتاب الطالب أسئلة نهاية الوحدة سؤال ٤ (ص٧٩) وإجابته في عرضك القديم: ٠٫٠٢ mol، ٩٦٠ mL (٠٫٩٦ L)، ٢٤٠ mL؛ و٤٨ L، ١٢ L.</li><li>الجزء (ب) غازات فقط، فنستخدم نسبة الحجوم مباشرة دون مولات.</li></ul>'});
