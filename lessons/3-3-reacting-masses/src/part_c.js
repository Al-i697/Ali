/* ---------- reacting masses, part C: the mass of a product or a reactant from a balanced equation (book pages 62 to 65) ---------- */

/* the conversion chain mass A -> moles A -> moles B -> mass B; cells fill in as the rows are answered */
function chainHTML(id,labels){
  return '<div class="cchain" id="'+id+'">'+labels.map(function(l,i){return (i?'<div class="carr">⟵</div>':'')+'<div class="ccell" data-i="'+i+'"><span class="cl">'+l[0]+'</span><b class="num cv"></b></div>'}).join('')+'</div>';
}
function chainFill(el,id,i,v){ var c=$('#'+id+' .ccell[data-i="'+i+'"]',el); if(c){ $('.cv',c).innerHTML=v; c.classList.add('on') } }

/* 18 scaling up: the ratio of masses stays, the amounts grow */
slide({id:'scaleup',ch:4,title:'الكميات تكبر والنسبة ثابتة',tag:'حرّك المنزلق',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:14px 20px;gap:8px;align-items:center"><div style="font-size:21px;font-weight:700;color:var(--muted)">التفكك الحراري للحجر الجيري</div>
    <div class="bigeq" style="font-size:38px;color:var(--gold)">CaCO<sub>3</sub> → CaO + CO<sub>2</sub></div>
    <div class="chips" style="gap:10px;direction:ltr;font-family:var(--font-display);font-size:25px;font-weight:800"><span class="pill">100 g</span><span style="align-self:center">→</span><span class="pill">56 g</span><span style="align-self:center">+</span><span class="pill">44 g</span></div>
    <div class="sm" style="font-size:19px">كتلة المول: 40 + 12 + 3×16 = 100 ، 40 + 16 = 56 ، 12 + 2×16 = 44 (g/mol)</div></div>
   <div class="panel" style="padding:12px 20px;gap:8px"><div style="display:flex;align-items:center;gap:14px"><span style="font-size:23px;font-weight:700;flex:none">كتلة CaCO<sub>3</sub></span><input type="range" id="sl" min="1" max="100" value="10" aria-label="كتلة كربونات الكالسيوم بالأطنان" style="flex:1"><b class="num" id="sv" style="font-size:28px;min-width:96px;text-align:center">10 t</b></div>
    <div class="stack"><i class="bseg cao" id="scao"><b class="num"></b></i><i class="bseg co2" id="sco2"><b class="num"></b></i></div>
    <div class="sm" style="font-size:19px;text-align:center">الشريط كله = كتلة CaCO<sub>3</sub> ، ينقسم إلى CaO و CO<sub>2</sub> (حفظ الكتلة)</div></div></div>
  <div class="col" style="width:380px;flex:none;gap:10px;justify-content:center">
   <div class="panel" style="padding:14px 18px;gap:8px"><p class="lead" style="margin:0;font-size:24px">عند تسخين <b class="num">10</b> أطنان من كربونات الكالسيوم، كم طناً من أكسيد الكالسيوم CaO يتكوّن؟</p>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${nin('t1','t')}</div><div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:21px">النسبة بين الكتل <b>ثابتة</b> مهما كبرت الكميات (g أو kg أو طن)</div></div></div>`;},
 init:function(el){
  var sl=$('#sl',el);
  function paint(){
    var v=+sl.value, a=v*0.56, b=v*0.44; $('#sv',el).textContent=v+' t';
    var c=$('#scao',el), d=$('#sco2',el); c.style.width='56%'; d.style.width='44%'; $('b',c).textContent='CaO '+(+a.toFixed(2))+' t'; $('b',d).textContent='CO₂ '+(+b.toFixed(2))+' t';
  }
  sl.addEventListener('input',paint); paint();
  bindNum($('.nin',el),5.6,0.06,function(ok){ var fb=$('.fb',el); if(ok){ say(fb,'✓ 10 × 56 ÷ 100 = 5.6 طن','ok'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } else say(fb,'النسبة 100 : 56، فكم يقابل 10؟','bad') });
 },
 note:'<ul><li>كتاب الطالب ص٦٣: CaCO₃ → CaO + CO₂ بالنسبة ١٠٠ : ٥٦ : ٤٤ (g)، ومن ١٠ أطنان كربونات الكالسيوم نتوقع ٥٫٦ أطنان من CaO.</li><li>الفكرة: المعادلة تعطينا نسباً ثابتة بين الكتل، والكتلة الكلية تُحفظ (٥٦ + ٤٤ = ١٠٠).</li></ul>'});

/* 18b proportion in chemical calculations (activity book exercise 3-2) */
slide({id:'prop',ch:4,title:'التناسب في الحسابات الكيميائية',tag:'كتاب النشاط تمرين ٣-٢',
 html:function(){
  var Q=[['أ','يلزم <b class="num">5 طن</b> من ZnO لإنتاج <b class="num">4 طن</b> من الخارصين. ما كتلة الخارصين الناتجة من <b class="num">20 طناً</b> من ZnO؟','t'],['ب','تحوّل <b class="num">14 طناً</b> من النيتروجين إلى <b class="num">17 طناً</b> من الأمونيا. ما كتلة النيتروجين اللازمة لإنتاج <b class="num">34 طناً</b> من الأمونيا؟','t'],['ج','<b class="num">27 g</b> من Al تعطي <b class="num">51 g</b> من Al<sub>2</sub>O<sub>3</sub>. كم g من Al<sub>2</sub>O<sub>3</sub> تنتج من <b class="num">4.5 g</b> من Al؟','g']];
  return `<div class="col grow" style="gap:12px;justify-content:center"><div style="display:flex;gap:14px">${Q.map(function(q,i){return `<div class="frm brk" style="flex:1;min-width:0;padding:14px 16px;gap:10px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">${q[0]}</div><p class="lead" style="margin:0;font-size:22px;line-height:1.5">${q[1]}</p>${nin('p'+i,q[2])}</div>`}).join('')}</div>
   <div class="fb" style="text-align:center;min-height:30px;font-size:23px"></div>
   <div class="gbar hide" id="gb" style="font-size:22px">النسبة بين الكتل <b>ثابتة</b>: نضرب في نسبة المعطى فقط، وتصلح للأطنان والجرامات</div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'p0',a:16,t:0.2,w:'✓ 20 × 4 ÷ 5 = 16 طن',h:'النسبة 4 : 5'},{n:'p1',a:28,t:0.3,w:'✓ 34 × 14 ÷ 17 = 28 طن',h:'النسبة 14 : 17'},{n:'p2',a:8.5,t:0.1,w:'✓ 4.5 × 51 ÷ 27 = 8.5 g',h:'النسبة 51 : 27'}],$('.fb',el),function(){ var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') });
 },
 note:'<ul><li>كتاب النشاط ص٣٧–٣٨ تمرين ٣-٢ «التناسب في الحسابات الكيميائية»: أ) ١٦ طن، ب) ٢٨ طن، ج) ٨٫٥ g.</li><li>هذه الأسئلة تُحَلّ بالنسبة والتناسب مباشرة، وهي مقدمة للطريقة الكاملة بالمولات في الشرائح التالية.</li></ul>'});

/* 19 the method */
slide({id:'method',ch:4,title:'كيف نحسب كتلة مادة من المعادلة؟',tag:'رتّب الخطوات',
 html:function(){return `<div class="col grow" style="gap:10px;justify-content:flex-start">
  <div class="cchain" style="margin:0"><div class="ccell on"><span class="cl">كتلة A</span><b class="num cv">g</b></div><div class="carr"><small>÷ M(A)</small>⟵</div><div class="ccell on"><span class="cl">مولات A</span><b class="num cv">mol</b></div><div class="carr"><small>نسبة المعادلة</small>⟵</div><div class="ccell on"><span class="cl">مولات B</span><b class="num cv">mol</b></div><div class="carr"><small>× M(B)</small>⟵</div><div class="ccell on"><span class="cl">كتلة B</span><b class="num cv">g</b></div></div>
  <div style="display:flex;flex-direction:column;gap:6px">${[1,2,3,4].map(function(n,i){return `<div style="display:flex;align-items:center;gap:12px"><div class="mk" style="width:40px;height:40px;border-radius:11px;display:grid;place-items:center;font-size:22px;flex:none">${ar(n)}</div><div class="mslot slot" data-k="${i}" style="flex:1;min-height:46px"><span class="ph" style="font-size:20px">اسحب الخطوة المناسبة إلى هنا</span></div></div>`}).join('')}</div>
  <div class="imp-tray" id="tray" style="display:flex;flex-direction:column;gap:7px"></div>
  <div class="fb" style="text-align:center;min-height:26px"></div>
  <div class="gbar hide" id="gb" style="font-size:22px">اقرأ السؤال بإمعان وخذ <b>المعاملات</b> في المعادلة الموزونة بالحسبان دائماً</div></div>`;},
 init:function(el){
  bindMatch(el,[[3,'حوّل مولات المادة المطلوبة إلى كتلة <span class="sm">(× الكتلة المولية)</span>'],[1,'حوّل الكتلة المعطاة إلى مولات <span class="sm">(÷ الكتلة المولية)</span>'],[0,'اكتب المعادلة الكيميائية الموزونة'],[2,'استخدم نسبة المعادلة لإيجاد مولات المادة المطلوبة']],{css:'font-size:21px;padding:8px 16px',bad:'ابدأ بما نكتبه قبل أي حساب'});
 },
 note:'<ul><li>كتاب الطالب ص٦٣ و٦٤: نكتب المعادلة الموزونة ثم ٣ خطوات: ١ حوّل الكتلة إلى مولات، ٢ استخدم النسبة من المعادلة، ٣ احسب الكتلة.</li><li>الشريط العلوي هو الخريطة: كتلة A ← مولات A ← مولات B ← كتلة B.</li></ul>'});

/* 20 example 3-2: aluminium oxide */
slide({id:'ex32',ch:4,title:'مثال ٣-٢: كتلة أكسيد الألومنيوم',tag:'خطوة بخطوة',
 html:function(){return `<div class="col grow" style="gap:10px;justify-content:flex-start">
  <div class="frm brk" style="padding:12px 20px;gap:6px;align-items:center"><p class="lead" style="margin:0;font-size:24px">كم تبلغ كتلة أكسيد الألومنيوم الناتجة عندما يتفاعل <b class="num">9.2 g</b> من فلز الألومنيوم بشكل كامل مع غاز الأكسجين؟ <span class="num">(Al = 27, O = 16)</span></p>
   <div class="bigeq" style="font-size:34px;color:var(--gold)">4Al + 3O<sub>2</sub> → 2Al<sub>2</sub>O<sub>3</sub> <span style="font-size:.6em;color:var(--muted)">(Al : Al<sub>2</sub>O<sub>3</sub> = 4 : 2)</span></div></div>
  ${chainHTML('c32',[['كتلة Al',''],['مولات Al',''],['مولات Al₂O₃',''],['كتلة Al₂O₃','']])}
  <div style="display:flex;gap:12px"><div class="col" style="flex:1;gap:7px">${qline('الخطوة ١: عدد مولات Al <span class="num">9.2 ÷ 27</span>',[['e1','mol','n =']])}${qline('الخطوة ٢: كل 4 mol Al تعطي 2 mol Al<sub>2</sub>O<sub>3</sub>',[['e2','mol','n =']])}</div>
   <div class="col" style="flex:1;gap:7px">${qline('الخطوة ٣: كتلة صيغة Al<sub>2</sub>O<sub>3</sub>',[['e3','g/mol','Mr =']])}${qline('كتلة Al<sub>2</sub>O<sub>3</sub> الناتجة',[['e4','g','m =']])}</div></div>
  <div class="fb" style="text-align:center;min-height:26px"></div></div>`;},
 init:function(el){
  chainFill(el,'c32',0,'9.2 g');
  bindSeq(el,[{n:'e1',a:9.2/27,t:0.004,w:'✓ 9.2 ÷ 27 = 0.34 mol',h:'n = m ÷ M',f:function(){chainFill(el,'c32',1,'0.34 mol')}},{n:'e2',a:0.17,t:0.003,w:'✓ 0.34 × 2 ÷ 4 = 0.17 mol',h:'اضرب في 2 واقسم على 4',f:function(){chainFill(el,'c32',2,'0.17 mol')}},{n:'e3',a:102,t:0.8,w:'✓ 2 × 27 + 3 × 16 = 102 g/mol',h:'(2 × 27) + (3 × 16)'},{n:'e4',a:17.36,t:0.14,w:'✓ 0.17 × 102 = 17.3 g',h:'m = n × M',f:function(){chainFill(el,'c32',3,'17.3 g')}}],$('.fb',el));
 },
 note:'<ul><li>مثال ٣-٢ في كتاب الطالب (ص٦٣): ٠٫٣٤ mol Al ← ٠٫١٧ mol Al₂O₃ ← ١٧٫٣ g.</li><li>بالحساب الدقيق تخرج ١٧٫٣٨ g؛ نقبل ١٧٫٣ إلى ١٧٫٥.</li></ul>'});

/* 21 example 3-3: iron(III) oxide for half a kilogram of iron */
slide({id:'ex33',ch:4,title:'مثال ٣-٣: كتلة أكسيد الحديد (III) اللازمة',tag:'خطوة بخطوة',
 html:function(){return `<div class="col grow" style="gap:10px;justify-content:flex-start">
  <div class="frm brk" style="padding:12px 20px;gap:6px;align-items:center"><p class="lead" style="margin:0;font-size:24px">ما كتلة أكسيد الحديد (III) اللازمة لإنتاج <b class="num">0.5 kg</b> من الحديد؟ <span class="num">(Fe = 56, O = 16)</span></p>
   <div class="bigeq" style="font-size:32px;color:var(--gold)">Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub> <span style="font-size:.6em;color:var(--muted)">(Fe<sub>2</sub>O<sub>3</sub> : Fe = 1 : 2)</span></div></div>
  ${chainHTML('c33',[['كتلة Fe',''],['مولات Fe',''],['مولات Fe₂O₃',''],['كتلة Fe₂O₃','']])}
  <div style="display:flex;gap:12px"><div class="col" style="flex:1;gap:7px">${qline('الخطوة ١: <span class="num">0.5 kg</span> بالجرامات',[['x1','g','m =']])}${qline('عدد مولات Fe',[['x2','mol','n =']])}${qline('الخطوة ٢: كل 1 mol Fe<sub>2</sub>O<sub>3</sub> تنتج 2 mol Fe',[['x3','mol','n =']])}</div>
   <div class="col" style="flex:1;gap:7px">${qline('الخطوة ٣: كتلة Fe<sub>2</sub>O<sub>3</sub> بالجرام',[['x4','g','m =']])}${qline('وبالكيلوجرام',[['x5','kg','m =']])}</div></div>
  <div class="fb" style="text-align:center;min-height:26px"></div></div>`;},
 init:function(el){
  chainFill(el,'c33',0,'500 g');
  bindSeq(el,[{n:'x1',a:500,t:1,w:'✓ 1 kg = 1000 g ← 0.5 kg = 500 g',h:'اضرب في 1000'},{n:'x2',a:500/56,t:0.1,w:'✓ 500 ÷ 56 = 8.93 mol',h:'n = m ÷ M',f:function(){chainFill(el,'c33',1,'8.93 mol')}},{n:'x3',a:4.465,t:0.06,w:'✓ 8.93 ÷ 2 = 4.47 mol',h:'اقسم على 2 (نسبة 1 : 2)',f:function(){chainFill(el,'c33',2,'4.47 mol')}},{n:'x4',a:715,t:5,w:'✓ 4.47 × 160 = 715 g',h:'M(Fe₂O₃) = 160 ثم m = n × M',f:function(){chainFill(el,'c33',3,'715 g')}},{n:'x5',a:0.715,t:0.006,w:'✓ 715 g = 0.715 kg',h:'اقسم على 1000'}],$('.fb',el));
 },
 note:'<ul><li>مثال ٣-٣ (ص٦٤): تحويل الوحدات أولاً (١ kg = ١٠٠٠ g)، ثم n(Fe) = ٨٫٩٣ mol، n(Fe₂O₃) = ٤٫٤٧ mol، الكتلة ٧١٥ g أي ٠٫٧١٥ kg.</li></ul>'});

/* 22 question 3-8 */
slide({id:'q38',ch:4,title:'السؤال ٣-٨: كتلة أكسيد الألومنيوم على الألومنيوم',tag:'أجب',
 html:function(){return `<div class="col grow" style="gap:9px;justify-content:flex-start">
  ${arStrip(['Al','O'])}
  <div class="frm brk" style="padding:10px 18px;gap:4px;align-items:center"><p class="lead" style="margin:0;font-size:23px">يكوّن الألومنيوم طبقة من أكسيد الألومنيوم عندما يتعرض للهواء. احسب كتلة Al<sub>2</sub>O<sub>3</sub> الممكن أن تتكون عند تفاعل <b class="num">2.0 g</b> من الألومنيوم بشكل كامل.</p><div class="bigeq" style="font-size:30px;color:var(--gold)">4Al(s) + 3O<sub>2</sub>(g) → 2Al<sub>2</sub>O<sub>3</sub>(s)</div></div>
  ${qline('أ. عدد مولات الألومنيوم',[['q1','mol','n(Al) =']])}
  ${qline('ب. النسبة Al<sub>2</sub>O<sub>3</sub> : Al من المعادلة',[['q2','','Al₂O₃'],['q3','',':  Al']])}
  ${qline('ج. عدد مولات Al<sub>2</sub>O<sub>3</sub> الناتجة',[['q4','mol','n =']])}
  ${qline('د. كتلة الصيغة النسبية لـ Al<sub>2</sub>O<sub>3</sub>',[['q5','g/mol','Mr =']])}
  ${qline('هـ. كتلة Al<sub>2</sub>O<sub>3</sub> الناتجة',[['q6','g','m =']])}
  <div class="fb" style="text-align:center;min-height:26px"></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'q1',a:2/27,t:0.001,w:'✓ 2.0 ÷ 27 = 0.0741 mol',h:'n = m ÷ M'},{n:'q2',a:2,t:0.01,w:'✓ 2',h:'اكتب المعاملين كما في المعادلة: 2 و 4'},{n:'q3',a:4,t:0.01,w:'✓ النسبة 2 : 4',h:'معامل Al هو 4'},{n:'q4',a:2/27/2,t:0.0006,w:'✓ 0.0741 × 2 ÷ 4 = 0.0370 mol',h:'اضرب في 2 واقسم على 4'},{n:'q5',a:102,t:0.8,w:'✓ 102 g/mol',h:'(2 × 27) + (3 × 16)'},{n:'q6',a:3.78,t:0.05,w:'✓ 0.0370 × 102 = 3.78 g',h:'m = n × M'}],$('.fb',el));
 },
 note:'<ul><li>الإجابات: ٠٫٠٧٤١ mol، ٢ : ٤، ٠٫٠٣٧٠ mol، ١٠٢ g/mol، ٣٫٧٨ g.</li><li>اكتب النسبة كما في المعادلة (٢ : ٤) حتى لو اختُصرت إلى ١ : ٢.</li></ul>'});

/* 23 questions 3-9 and 3-10 */
slide({id:'q39',ch:4,title:'السؤالان ٣-٩ و٣-١٠',tag:'أجب',
 html:function(){return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div class="frm brk" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">٣-٩</div><p class="lead" style="margin:0;font-size:22px">احسب كتلة أكسيد الحديد (III) اللازمة لإنتاج <b class="num">2 طن</b> من الحديد.</p><div class="bigeq" style="font-size:25px;color:var(--gold)">Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub></div></div>
   ${qline('n(Fe) في 2 طن (2×10⁶ g)',[['a1','mol','n =']])}${qline('n(Fe<sub>2</sub>O<sub>3</sub>) اللازمة',[['a2','mol','n =']])}${qline('كتلة Fe<sub>2</sub>O<sub>3</sub>',[['a3','طن','m =']])}<div class="fb fa" style="min-height:24px;text-align:center"></div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div class="frm brk" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">٣-١٠ (Ca = 40, O = 16, H = 1, N = 14, Cl = 35.5)</div><p class="lead" style="margin:0;font-size:22px">احسب كتلة NH<sub>4</sub>Cl اللازمة للتفاعل مع <b class="num">12 g</b> من Ca(OH)<sub>2</sub>.</p><div class="bigeq" style="font-size:22px;color:var(--gold)">Ca(OH)<sub>2</sub> + 2NH<sub>4</sub>Cl → CaCl<sub>2</sub> + 2H<sub>2</sub>O + 2NH<sub>3</sub></div></div>
   ${qline('n(Ca(OH)<sub>2</sub>)',[['b1','mol','n =']])}${qline('n(NH<sub>4</sub>Cl) اللازمة',[['b2','mol','n =']])}${qline('كتلة NH<sub>4</sub>Cl',[['b3','g','m =']])}<div class="fb fb2x" style="min-height:24px;text-align:center"></div></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'a1',a:2e6/56,t:400,w:'✓ 2×10⁶ ÷ 56 ≈ 35714 mol',h:'2 طن = 2 000 000 g ثم ÷ 56'},{n:'a2',a:2e6/56/2,t:200,w:'✓ 35714 ÷ 2 ≈ 17857 mol',h:'النسبة Fe₂O₃ : Fe = 1 : 2'},{n:'a3',a:2.857,t:0.03,w:'✓ 17857 × 160 ≈ 2.86×10⁶ g = 2.86 طن',h:'M(Fe₂O₃) = 160 ثم حوّل إلى طن'}],$('.fa',el));
  bindSeq(el,[{n:'b1',a:12/74,t:0.002,w:'✓ Mr = 74 ← 12 ÷ 74 = 0.162 mol',h:'Mr(Ca(OH)₂) = 40 + 2 × 17 = 74'},{n:'b2',a:12/74*2,t:0.004,w:'✓ 0.162 × 2 = 0.324 mol',h:'النسبة 1 : 2'},{n:'b3',a:17.35,t:0.2,w:'✓ 0.324 × 53.5 = 17.35 g',h:'Mr(NH₄Cl) = 14 + 4 + 35.5 = 53.5'}],$('.fb2x',el));
 },
 note:'<ul><li>٣-٩: ٢٫٨٦ طن Fe₂O₃. ٣-١٠: ١٧٫٣٥ g (في عرضك ١٧٫٣٣ من تقريب الخطوات؛ نقبل الاثنين).</li><li>في ٣-٩ المعطى بالأطنان: نحوّله إلى g (٢ طن = ٢٬٠٠٠٬٠٠٠ g) ثم نرجع إلى الأطنان.</li></ul>'});

/* 24 the activity book worksheet, mass parts of the Solvay process */
slide({id:'solv',ch:4,title:'كتاب النشاط: عملية سولفاي (الكتل)',tag:'ورقة العمل ٣-٣ سؤال ٢',
 html:function(){return `<div class="col grow" style="gap:8px;justify-content:flex-start">
  ${arStrip(['H','C','N','O','Na','Cl'])}
  <div style="display:flex;gap:16px;flex:1">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div class="frm brk" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المرحلة ١ (أ.١)</div><div class="bigeq" style="font-size:19px;color:var(--gold)">NaCl + NH<sub>3</sub> + H<sub>2</sub>O + CO<sub>2</sub> → NaHCO<sub>3</sub> + NH<sub>4</sub>Cl</div><p class="lead" style="margin:0;font-size:21px">ما كتلة NaCl اللازمة لإنتاج <b class="num">7560 g</b> من NaHCO<sub>3</sub>؟</p></div>
    ${qline('Mr لـ NaHCO<sub>3</sub>',[['s1','g/mol','Mr =']])}${qline('n(NaHCO<sub>3</sub>) (نسبة 1 : 1 مع NaCl)',[['s2','mol','n =']])}${qline('كتلة NaCl',[['s3','g','m =']])}<div class="fb fa" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div class="frm brk" style="padding:10px 16px;gap:4px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">المرحلة ٢ (ب.١)</div><div class="bigeq" style="font-size:21px;color:var(--gold)">2NaHCO<sub>3</sub> → Na<sub>2</sub>CO<sub>3</sub> + CO<sub>2</sub> + H<sub>2</sub>O</div><p class="lead" style="margin:0;font-size:21px">ما كتلة Na<sub>2</sub>CO<sub>3</sub> الممكن إنتاجها من <b class="num">7560 g</b> من NaHCO<sub>3</sub>؟</p></div>
    ${qline('n(Na<sub>2</sub>CO<sub>3</sub>) (نسبة 2 : 1)',[['t1','mol','n =']])}${qline('كتلة Na<sub>2</sub>CO<sub>3</sub>',[['t2','g','m =']])}<div class="fb fb2x" style="min-height:24px;text-align:center"></div>
    <div class="sm" style="font-size:18px;color:var(--muted);text-align:center">أجزاء الحجم (أ.٢ و ب.٢) نكملها في الدرس ٣-٤</div></div></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'s1',a:84,t:0.7,w:'✓ 23 + 1 + 12 + 3 × 16 = 84 g/mol',h:'اجمع Ar لكل الذرات'},{n:'s2',a:90,t:0.8,w:'✓ 7560 ÷ 84 = 90 mol',h:'n = m ÷ M'},{n:'s3',a:5265,t:45,w:'✓ 90 × 58.5 = 5265 g',h:'M(NaCl) = 58.5'}],$('.fa',el));
  bindSeq(el,[{n:'t1',a:45,t:0.4,w:'✓ 90 ÷ 2 = 45 mol',h:'كل 2 mol NaHCO₃ تعطي 1 mol Na₂CO₃'},{n:'t2',a:4770,t:40,w:'✓ 45 × 106 = 4770 g',h:'M(Na₂CO₃) = 106'}],$('.fb2x',el));
 },
 note:'<ul><li>كتاب النشاط ص٤٨ سؤال ٢: أ.١ ٥٢٦٥ g NaCl، وب.١ ٤٧٧٠ g Na₂CO₃. الجزءان أ.٢ و ب.٢ يطلبان حجم غاز (نضيفهما في ٣-٤ بعد الحجم المولي).</li></ul>'});
