/* ---------- reacting masses, part B: limiting and excess reactants (deck slides 6 to 13) ---------- */

/* answer line without its own feedback: the slide has one shared feedback line */
function qline(label,boxes){
  return '<div class="qr ql1"><div class="qt">'+label+'</div><div class="qa">'+boxes.map(function(b){return (b[2]?'<span class="ql">'+b[2]+'</span>':'')+nin(b[0],b[1])}).join('')+'</div></div>';
}
/* horizontal bars: rows [{lab, parts:[[grams, class]]}], the widest bar is `max` grams; the bars grow when the container gets .go */
function barsHTML(id,rows,max){
  return '<div class="bars" id="'+id+'">'+rows.map(function(r){
    return '<div class="brow"><div class="bl">'+r.lab+'</div><div class="btrack">'+r.parts.map(function(p){return p[0]>0?'<i class="bseg '+p[1]+'" style="--w:'+(p[0]/max*100).toFixed(1)+'%"><b class="num">'+p[2]+'</b></i>':''}).join('')+'</div></div>';
  }).join('')+'</div>';
}

/* 9 silicon with oxygen: what happens when the amounts are not in the right ratio */
slide({id:'si6',ch:3,title:'ماذا يحدث إذا لم تكن الكميات بنسبة الصيغة؟',tag:'توقّع',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:540px;flex:none;gap:10px;justify-content:flex-start">
   <div class="frm brk" style="padding:14px 20px;gap:8px"><p class="lead" style="margin:0;font-size:25px">افترض أننا تفاعلنا <b class="num" style="color:var(--gold)">6 g</b> من السيليكون Si مع <b class="num" style="color:var(--gold)">5.3 g</b> من الأكسجين O لتكوين <span class="num fmla">SiO<sub>2</sub></span>. ماذا يحدث؟</p>
    ${optsHTML([{t:'تتفاعل المادتان بالكامل'},{t:'يبقى 1.3 g من Si بلا تفاعل',ok:1},{t:'يبقى 1.3 g من O بلا تفاعل'},{t:'لا يحدث تفاعل'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="panel hide" id="qleft" style="padding:10px 18px;flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:24px;font-weight:700">كتلة Si التي تبقى =</span>${nin('left','g')}<div class="fb" style="flex:1;min-height:24px;min-width:200px"></div></div>
  </div>
  <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
   <div class="panel" style="padding:12px 20px;gap:8px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">من جدول SiO₂: 5.3 g من O تلزمها 4.7 g من Si</div>
    ${barsHTML('b6',[{lab:'Si',parts:[[4.7,'used','يتفاعل 4.7 g'],[1.3,'left','يبقى 1.3 g']]},{lab:'O',parts:[[5.3,'used','يتفاعل 5.3 g']]}],6)}</div>
   <div class="hide" id="defs" style="display:flex;gap:12px"><div class="defc gold"><b>المادة المحددة للتفاعل</b><span>تنتهي أولاً وتحدد كمية الناتج: هنا الأكسجين.</span></div><div class="defc blue"><b>المادة الفائضة</b><span>يبقى جزء منها بعد التفاعل: هنا السيليكون.</span></div></div></div></div>`;},
 init:function(el){
  var bars=$('#b6',el);
  bindMcq($('.frm',el),[{t:'',why:'الأكسجين لا يكفي لكل السيليكون'},{t:'',ok:true,why:'صح: 5.3 g من O تتفاعل مع 4.7 g من Si فقط'},{t:'',why:'المتبقي هو السيليكون لا الأكسجين'},{t:'',why:'المادتان تتفاعلان لكن ليس كلاهما بالكامل'}],$('.frm .fb',el),function(){
    bars.classList.add('go'); $('.frm .opts',el).classList.add('hide'); var q=$('#qleft',el); q.classList.remove('hide'); q.classList.add('up');
  });
  bindNum($('.nin',el),1.3,0.02,function(ok){
    var fb=$('#qleft .fb',el);
    if(ok){ say(fb,'✓ 6 − 4.7 = 1.3 g','ok'); var d=$('#defs',el); d.classList.remove('hide'); d.classList.add('up') } else say(fb,'6 − 4.7','bad');
  });
 },
 note:'<ul><li>عرضك (شريحة ٦): ٦ g Si مع ٥٫٣ g O. الأكسجين يُستهلك أولاً (المادة المحددة)، ويبقى ١٫٣ g Si (المادة الفائضة). وردت في الشريحة عبارة «Si مع Si» والصحيح ٦ g Si مع ٥٫٣ g O.</li><li>التعريفان من كتاب الطالب ص٦٣ (مصطلحات علمية).</li></ul>'});

/* 9b the equation as a ratio of moles and of masses, and conservation of mass (book p.62, summary p.4) */
slide({id:'conserve',ch:3,title:'المعادلة تعطي نسبة المولات ونسبة الكتل',tag:'أكمل الجدول',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:12px 20px;align-items:center;gap:6px"><div class="bigeq" style="font-size:40px;color:var(--gold)">Fe + S → FeS</div><div class="sm" style="font-size:20px;text-align:center">المعادلة تعني: <b class="num">1 mol</b> من Fe تتفاعل مع <b class="num">1 mol</b> من S وتعطي <b class="num">1 mol</b> من FeS (Fe = 56, S = 32)</div></div>
   <table class="mtab"><thead><tr><th></th><th><span class="bigeq" style="font-size:30px;color:var(--gold)">Fe</span></th><th><span class="bigeq" style="font-size:30px;color:var(--gold)">S</span></th><th><span class="bigeq" style="font-size:30px;color:var(--gold)">FeS</span></th></tr></thead><tbody>
    <tr><th>عدد المولات</th><td><span class="num">1 mol</span></td><td><span class="num">1 mol</span></td><td><span class="num">1 mol</span></td></tr>
    <tr><th>الكتلة المولية</th><td><span class="num">56 g/mol</span></td><td><span class="num">32 g/mol</span></td><td>${nin('k0','g/mol')}</td></tr>
    <tr><th>الكتلة</th><td>${nin('k1','g')}</td><td>${nin('k2','g')}</td><td>${nin('k3','g')}</td></tr></tbody></table>
   <div class="fb" style="text-align:center;min-height:26px"></div></div>
  <div class="col" style="width:430px;flex:none;gap:8px;justify-content:flex-start">
   <div class="panel hide" id="q1" style="padding:10px 16px;gap:6px"><div style="font-size:22px;font-weight:800">كتلة المواد الداخلة (56 + 32) مقارنة بكتلة FeS الناتجة:</div>${optsHTML([{t:'أكبر'},{t:'مساوية لها'},{t:'أقل'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:8px"')}<div class="fb q1fb" style="min-height:22px"></div></div>
   <div class="panel hide" id="q2" style="padding:10px 16px;gap:6px;flex-direction:row;align-items:center;flex-wrap:wrap"><span style="font-size:22px;font-weight:700">نصف الكمية: 28 g Fe تلزمها</span>${nin('half','g')}<span style="font-size:22px;font-weight:700">من S</span><div class="fb q2fb" style="flex:1 1 100%;min-height:22px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:21px;padding:8px 14px"><b>كتل المواد الداخلة = كتل المواد الناتجة</b> والنسبة <b class="num">56 : 32 : 88</b> ثابتة. وإذا اختلفت الكميات عنها يبقى جزء من إحدى المادتين.</div></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'k0',a:88,t:0.7,w:'✓ 56 + 32 = 88 g/mol',h:'اجمع كتلتي Fe وS'},{n:'k1',a:56,t:0.5,w:'✓ 1 mol × 56 = 56 g',h:'الكتلة = عدد المولات × الكتلة المولية'},{n:'k2',a:32,t:0.3,w:'✓ 1 mol × 32 = 32 g',h:'1 × 32'},{n:'k3',a:88,t:0.7,w:'✓ 1 mol × 88 = 88 g',h:'1 × 88'}],$('.fb',el),function(){ var q=$('#q1',el); q.classList.remove('hide'); q.classList.add('up') });
  bindMcq($('#q1',el),[{t:'',why:'مجموع 56 + 32 يساوي 88 تماماً'},{t:'',ok:true,why:'صح: 56 + 32 = 88 (حفظ الكتلة)'},{t:'',why:'لا تفنى المادة ولا تُخلق'}],$('.q1fb',el),function(){ $('#q1 .opts',el).classList.add('hide'); var q=$('#q2',el); q.classList.remove('hide'); q.classList.add('up') });
  bindNum($('.nin[data-n="half"]',el),16,0.2,function(ok){ var fb=$('.q2fb',el); if(ok){ say(fb,'✓ 28 ÷ 56 = 0.5 mol ← 0.5 mol S = 16 g ، والناتج 44 g','ok'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } else say(fb,'النسبة 56 : 32 ثابتة؛ 28 هي نصف 56','bad') });
 },
 note:'<ul><li>كتاب الطالب ص٦٢: المعادلة Fe + S → FeS تعني ١ mol : ١ mol : ١ mol أي ٥٦ g : ٣٢ g : ٨٨ g، والكتلة الكلية تُحفظ. ملخص الوحدة (الصفحة ٤): «كتل المواد الداخلة = كتل المواد الناتجة» مع Fe + S → FeS (١ mol، ٥٦ g، ٣٢ g، ٨٨ g).</li><li>هذه الشريحة مضافة من الكتاب والملخص (ليست في عرض NotebookLM)، وتمهّد لشريحة الحديد والكبريت.</li></ul>'});

/* 10 iron and sulfur: bars of used and left */
slide({id:'fes',ch:3,title:'الحديد والكبريت',tag:'أكمل الأرقام',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:520px;flex:none;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:12px 20px;gap:6px;align-items:center"><div class="bigeq" style="font-size:36px;color:var(--gold)">Fe + S → FeS</div><p class="lead" style="margin:0;font-size:23px;text-align:center">نفاعل <b class="num">5.6 g</b> من الحديد مع <b class="num">5 g</b> من الكبريت <span class="num">(Fe = 56, S = 32)</span></p></div>
   ${qline('كتلة S التي تتفاعل مع <span class="num">5.6 g</span> Fe',[['s1','g']])}
   ${qline('كتلة S المتبقية',[['s2','g']])}
   ${qline('كتلة FeS الناتجة',[['s3','g']])}
   <div class="fb" style="text-align:center;min-height:26px"></div>
   <div class="hide" id="pick"><div style="font-size:24px;font-weight:800;margin-bottom:6px">أيهما المادة المحددة للتفاعل؟</div>${optsHTML([{t:'الحديد Fe'},{t:'الكبريت S'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:10px"')}<div class="fb2 fb" style="min-height:24px"></div></div>
  </div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="panel" style="padding:14px 20px;gap:10px"><div style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:center;font-size:20px;color:var(--muted);font-weight:700"><span></span><span style="display:flex;gap:14px"><span><i class="lg used"></i><span>المستخدم في التفاعل</span></span><span><i class="lg left"></i><span>المتبقي</span></span></span></div>
    ${barsHTML('bfs',[{lab:'الحديد Fe',parts:[[5.6,'used','5.6 g']]},{lab:'الكبريت S',parts:[[3.2,'used','3.2 g'],[1.8,'left','1.8 g']]},{lab:'FeS',parts:[[8.8,'prod','8.8 g']]}],8.8)}</div>
   <div class="gbar hide" id="gb" style="font-size:21px">الكبريت <b>فائض</b> والحديد <b>محدد</b>. وبالقاعدة: n(Fe) = 5.6 ÷ 56 = 0.1 و n(S) = 5 ÷ 32 = 0.156 ← ÷ المعامل (1) ← الأقل 0.1 هو Fe.</div></div></div>`;},
 init:function(el){
  var fb=$('.fb',el), bars=$('#bfs',el);
  bindSeq(el,[{n:'s1',a:3.2,t:0.04,w:'✓ 5.6 ÷ 56 = 0.1 mol Fe ← 0.1 mol S ← 3.2 g',h:'n(Fe) = 5.6 ÷ 56 ثم m(S) = n × 32'},{n:'s2',a:1.8,t:0.03,w:'✓ 5 − 3.2 = 1.8 g من الكبريت تبقى',h:'اطرح ما تفاعل من الكبريت من 5 g'},{n:'s3',a:8.8,t:0.1,w:'✓ 5.6 + 3.2 = 8.8 g (حفظ الكتلة)',h:'جمع كتلتي المتفاعلين أو 0.1 × 88'}],fb,function(){
    bars.classList.add('go'); var p=$('#pick',el); p.classList.remove('hide'); p.classList.add('up');
  });
  bindMcq($('#pick',el),[{t:'',ok:true,why:'صح: الحديد انتهى كله'},{t:'',why:'الكبريت بقي منه ١٫٨ g، فهو الفائض'}],$('.fb2',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>عرضك (شريحة ٧): Fe + S → FeS (٥٫٦ g ← ٨٫٨ g). الكبريت: ٥ g بداية، ٣٫٢ g تفاعلت، ١٫٨ g بقيت (فائض). الحديد: ٥٫٦ g كلها تفاعلت (محدد).</li><li>كتاب الطالب ص٦٣: «يتفاعل ٣٫٢ g من الكبريت مع ٥٫٦ g من الحديد ويبقى ١٫٨ g».</li></ul>'});

/* 11 the rule */
slide({id:'rule',ch:3,title:'القاعدة الرياضية لتحديد المواد في التفاعل',tag:'طابِق',
 html:function(){return `<div class="col grow" style="gap:12px;justify-content:center">
  <div class="frm brk" style="padding:10px 26px;align-items:center;gap:4px"><div style="font-size:21px;font-weight:700;color:var(--muted)">لكل مادة متفاعلة احسب:</div>
   <div class="frac"><div class="fn">عدد المولات <small>(من الوزن)</small></div><div class="fline"></div><div class="fd">معامله <small>(في المعادلة الموزونة)</small></div></div></div>
  <div style="display:flex;gap:16px">
   <div class="mslot slot rs" data-k="min" style="flex:1;min-height:70px;flex-direction:column;gap:2px"><div class="slbl">الناتج الأقل</div><span class="ph" style="font-size:21px">اسحب الاسم المناسب</span></div>
   <div class="mslot slot rs" data-k="max" style="flex:1;min-height:70px;flex-direction:column;gap:2px"><div class="slbl">الناتج الأكثر</div><span class="ph" style="font-size:21px">اسحب الاسم المناسب</span></div></div>
  <div class="imp-tray" id="tray" style="display:flex;gap:14px;justify-content:center"></div>
  <div class="fb" style="text-align:center;min-height:26px"></div>
  <div class="panel hide" id="q2" style="padding:8px 18px;gap:4px"><p class="lead" style="margin:0;font-size:22px">وصفة السندويشة: <b class="num">2</b> خبز : <b class="num">1</b> جبن، ولديك <b class="num">3</b> خبز و<b class="num">2</b> جبن. ما المادة المحددة؟</p>
   ${optsHTML([{t:'الجبن'},{t:'الخبز'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:10px"')}<div class="fb2 fb" style="min-height:24px"></div></div>
  <div class="gbar hide" id="gb" style="font-size:21px;padding:8px 16px">نقسم <b>عدد المولات على المعامل</b>، والأقل هو <b>المحددة</b> والأكثر هو <b>الفائضة</b></div></div>`;},
 init:function(el){
  bindMatch(el,[['max','المادة الفائضة (الأكثر)','blue'],['min','المادة المحددة (الأقل)','gold']],{css:'font-size:24px;padding:12px 22px',bad:'الأقل عدد هو الذي ينتهي أولاً',done:'ممتاز! الآن جرّب القاعدة',onDone:function(){var q=$('#q2',el); q.classList.remove('hide'); q.classList.add('up'); var g=$('#gb',el); g.classList.add('hide')}});
  bindMcq($('#q2',el),[{t:'',why:'الجبن ٢ ÷ ١ = ٢ وهو الأكبر، فليس هو المحدد'},{t:'',ok:true,why:'صح: ٣ ÷ ٢ = ١٫٥ أقل من ٢ ÷ ١ = ٢'}],$('.fb2',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>عرضك (شريحة ٨): عدد المولات ÷ المعامل، والأقل هو المحددة والأكثر هو الفائضة.</li><li>السؤال الأخير يربط القاعدة بوصفة السندويشة (٢ خبز : ١ جبن).</li></ul>'});

/* the balance picture: two pans, the larger value hangs lower */
function balanceSVG(lSym,rSym){
  return `<svg class="bal" viewBox="0 0 340 230" width="100%" style="max-height:250px" aria-hidden="true">
   <path d="M170 60V196M120 206H220" stroke="rgba(var(--t2),.8)" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="170" cy="60" r="9" fill="var(--gold)"/>
   <g class="bm" style="transform-origin:170px 60px"><line x1="48" y1="60" x2="292" y2="60" stroke="var(--gold)" stroke-width="7" stroke-linecap="round"/></g>
   <g class="bp l"><line x1="48" y1="60" x2="22" y2="122" stroke="rgba(var(--t2),.7)" stroke-width="2.5"/><line x1="48" y1="60" x2="74" y2="122" stroke="rgba(var(--t2),.7)" stroke-width="2.5"/><path d="M12 122H84Q80 150 48 150Q16 150 12 122Z" fill="rgba(var(--t1),.28)" stroke="var(--cyan)" stroke-width="3"/><text x="48" y="141" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="22" fill="#fff">${lSym}</text></g>
   <g class="bp r"><line x1="292" y1="60" x2="266" y2="122" stroke="rgba(var(--t2),.7)" stroke-width="2.5"/><line x1="292" y1="60" x2="318" y2="122" stroke="rgba(var(--t2),.7)" stroke-width="2.5"/><path d="M256 122H328Q324 150 292 150Q260 150 256 122Z" fill="rgba(228,188,75,.3)" stroke="var(--gold)" stroke-width="3"/><text x="292" y="141" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="22" fill="#fff">${rSym}</text></g></svg>`;
}
function tiltBalance(svg,leftHeavier){
  var a=leftHeavier?-9:9, d=Math.round(244*Math.sin(Math.abs(a)*Math.PI/180)/2), bm=svg.querySelector('.bm'), l=svg.querySelector('.bp.l'), r=svg.querySelector('.bp.r');
  bm.style.transform='rotate('+a+'deg)'; l.style.transform='translateY('+(leftHeavier?d:-d)+'px)'; r.style.transform='translateY('+(leftHeavier?-d:d)+'px)';
}

/* 12 copper(II) oxide and carbon (question 3-11) */
slide({id:'cuo',ch:3,title:'السؤال ٣-١١: أكسيد النحاس (II) والكربون',tag:'أكمل ثم قارن',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:flex-start">
   <div class="frm brk" style="padding:10px 18px;gap:4px"><div class="bigeq" style="font-size:34px;color:var(--gold);text-align:center">2CuO + C → 2Cu + CO<sub>2</sub></div><p class="lead" style="margin:0;font-size:22px">استُخدم <b class="num">0.75 g</b> من الكربون و<b class="num">5.2 g</b> من أكسيد النحاس (II) <span class="num">(Cu = 63.5, O = 16, C = 12)</span></p></div>
   ${qline('عدد مولات الكربون <span class="num">0.75 ÷ 12</span>',[['c1','mol','n(C) =']])}
   ${qline('كتلة الصيغة النسبية لـ CuO',[['c2','g/mol','Mr =']])}
   ${qline('عدد مولات CuO',[['c3','mol','n(CuO) =']])}
   ${qline('CuO: عدد المولات ÷ المعامل (٢)',[['c4','','=']])}
   ${qline('C: عدد المولات ÷ المعامل (١)',[['c5','','=']])}
   <div class="fb" style="text-align:center;min-height:24px"></div></div>
  <div class="col" style="width:400px;flex:none;align-items:stretch;justify-content:flex-start;gap:8px">${balanceSVG('C','CuO')}
   <div class="hide" id="pick"><div style="font-size:21px;font-weight:800;margin-bottom:4px">أي المادتين المحددة للتفاعل؟ اشرح السبب.</div>${optsHTML([{t:'CuO: 0.0327 أقل من 0.0625'},{t:'C: كتلته أصغر'},{t:'C: عدد مولاته أكبر'}])}<div class="fb2 fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:21px;padding:8px 14px"><b>CuO</b> محددة (الأقل) و<b>C</b> فائضة (الأكثر)</div></div></div>`;},
 init:function(el){
  var fb=$('.fb',el), svg=$('.bal',el);
  bindSeq(el,[{n:'c1',a:0.0625,t:0.0008,w:'✓ 0.75 ÷ 12 = 0.0625 mol',h:'n = m ÷ M'},{n:'c2',a:79.5,t:0.8,w:'✓ 63.5 + 16 = 79.5 g/mol (وبـ Cu = 64 يصير 80)',h:'اجمع Ar للنحاس والأكسجين'},{n:'c3',a:5.2/79.5,t:0.0012,w:'✓ 5.2 ÷ 79.5 ≈ 0.0654 mol (0.065)',h:'n = 5.2 ÷ Mr'},{n:'c4',a:5.2/79.5/2,t:0.0007,w:'✓ 0.0654 ÷ 2 ≈ 0.0327',h:'اقسم عدد مولات CuO على معامله 2'},{n:'c5',a:0.0625,t:0.0008,w:'✓ 0.0625 ÷ 1 = 0.0625',h:'معامل C هو 1'}],fb,function(){
    var p=$('#pick',el); p.classList.remove('hide'); p.classList.add('up');
  });
  bindMcq($('#pick',el),[{t:'',ok:true,why:'صح: الأقل 0.0327 فهو المحدد'},{t:'',why:'نقارن (المولات ÷ المعامل) لا الكتل'},{t:'',why:'الأكبر هو الفائض لا المحدد'}],$('.fb2',el),function(){ tiltBalance(svg,true); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') });
 },
 note:'<ul><li>سؤال ٣-١١ من كتاب الطالب ص٦٥. عرضك (شريحتا ٩ و١٠): n(C) = ٠٫٠٦٢٥، Mr(CuO) = ٨٠ (بـ Cu = ٦٤) فـ n = ٠٫٠٦٥، ثم ٠٫٠٦٥ ÷ ٢ = ٠٫٠٣٢٥ أقل من ٠٫٠٦٢٥: CuO محددة وC فائضة.</li><li>الكتاب يعطي Cu = ٦٣٫٥ فنعتمده (٧٩٫٥، ٠٫٠٦٥٤، ٠٫٠٣٢٧)، ونقبل أيضاً ٨٠ و٠٫٠٦٥ و٠٫٠٣٢٥.</li><li>الميزان: الكفة الأثقل (القيمة الأكبر) أكثر نزولاً، والأقل هو المحدد.</li></ul>'});

/* 13 activity book p.48: iron and sulfur again, with the worksheet questions */
slide({id:'fe48',ch:3,title:'كتاب النشاط ص٤٨: الحديد والكبريت',tag:'ورقة العمل ٣-٣',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
   <div class="frm brk" style="padding:10px 18px;gap:4px"><div class="bigeq" style="font-size:34px;color:var(--gold);text-align:center">Fe + S → FeS</div><p class="lead" style="margin:0;font-size:22px">استُخدم <b class="num">7 g</b> من الحديد و<b class="num">10 g</b> من الكبريت <span class="num">(Fe = 56, S = 32)</span></p></div>
   ${qline('عدد مولات الحديد',[['f1','mol','n(Fe) =']])}
   ${qline('عدد مولات الكبريت',[['f2','mol','n(S) =']])}
   <div class="hide" id="pick"><div style="font-size:23px;font-weight:800;margin-bottom:4px">النسبة 1 : 1. ما المادة الفائضة؟</div>${optsHTML([{t:'الحديد'},{t:'الكبريت'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:10px"')}<div class="fb2 fb" style="min-height:24px"></div></div>
   <div class="fb" style="text-align:center;min-height:24px"></div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div class="panel" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">أسئلة الورقة</div>
   ${qline('أ. كتلة S التي تتفاعل مع <span class="num">56 g</span> Fe',[['w1','g']])}
   ${qline('ب. كتلة FeS بعد التفاعل',[['w2','g']])}
   ${qline('كتلة S المتبقية',[['w3','g']])}
   ${qline('ج. كتلة Fe اللازمة لـ <span class="num">10 g</span> S',[['w4','g']])}
   <div class="fb wfb" style="min-height:24px"></div></div></div></div>`;},
 init:function(el){
  var fb=$('.fb',el), wfb=$('.wfb',el), pk=$('#pick',el);
  bindSeq(el,[{n:'f1',a:0.125,t:0.002,w:'✓ 7 ÷ 56 = 0.125 mol',h:'n = m ÷ M'},{n:'f2',a:10/32,t:0.004,w:'✓ 10 ÷ 32 = 0.3125 mol (0.312)',h:'n = 10 ÷ 32'}],fb,function(){ pk.classList.remove('hide'); pk.classList.add('up') });
  bindMcq(pk,[{t:'',why:'الحديد 0.125 أقل من 0.3125 فهو المحدد'},{t:'',ok:true,why:'صح: 0.125 < 0.3125 فالكبريت فائض والحديد محدد'}],$('.fb2',el),function(){ say(fb,'الآن أسئلة الورقة ←','ok'); var i=$('.nin input',$('.nin[data-n="w1"]',el)); i.disabled=false; $('.nin[data-n="w1"]',el).classList.remove('lock') });
  bindSeq(el,[{n:'w1',a:32,t:0.3,w:'✓ 1 mol Fe يحتاج 1 mol S = 32 g',h:'56 g Fe = 1 mol ← 1 mol S'},{n:'w2',a:11,t:0.15,w:'✓ Fe كله (7 g) + 4 g S = 11 g',h:'0.125 mol من Fe تعطي 0.125 mol من FeS × 88'},{n:'w3',a:6,t:0.1,w:'✓ 10 − 4 = 6 g من الكبريت تبقى',h:'الكبريت المتفاعل 0.125 × 32 = 4 g'},{n:'w4',a:17.5,t:0.2,w:'✓ 10 ÷ 32 = 0.3125 mol Fe × 56 = 17.5 g',h:'n(S) × 56'}],wfb);
  var w1=$('.nin[data-n="w1"]',el); $('input',w1).disabled=true; w1.classList.add('lock');
 },
 note:'<ul><li>عرضك (شريحة ١١) وكتاب النشاط ص٤٨ سؤال ١: ٧ g Fe و١٠ g S ← n(Fe) = ٠٫١٢٥، n(S) = ٠٫٣١٢، الأقل Fe فهو المحدد والكبريت فائض.</li><li>أسئلة الورقة: أ) ٣٢ g، ب) FeS = ١١ g ويبقى ٦ g كبريت، ج) ١٧٫٥ g.</li></ul>'});

/* 14 copper and silver ions (page 78 of the student book) */
slide({id:'ag',ch:3,title:'كتاب الطالب ص٧٨: النحاس وأيونات الفضة',tag:'تحدٍّ',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:250px;flex:none;align-items:center;justify-content:center"><img class="pic" src="${IMG.flasks}" alt="" style="width:230px"></div>
  <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:flex-start">
   <div class="frm brk" style="padding:8px 18px;gap:2px"><div class="bigeq" style="font-size:30px;color:var(--gold);text-align:center">Cu + 2Ag<sup>+</sup> → Cu<sup>2+</sup> + 2Ag</div><p class="lead" style="margin:0;font-size:21px">أُضيف <b class="num">6.35 g</b> من فلز النحاس إلى محلول يحتوي على <b class="num">0.1 mol</b> من أيونات الفضة <span class="num">(Cu = 63.5)</span></p></div>
   ${qline('١. عدد مولات النحاس',[['g1','mol','n(Cu) =']])}
   ${qline('Cu: عدد المولات ÷ المعامل (١)',[['g2','','=']])}
   ${qline('Ag<sup>+</sup>: عدد المولات ÷ المعامل (٢)',[['g3','','=']])}
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="hide" id="pick"><div style="font-size:23px;font-weight:800;margin-bottom:4px">٢. ما المادة المحددة: النحاس أم أيونات الفضة؟</div>${optsHTML([{t:'النحاس لأن 0.1 أكبر من 0.05'},{t:'أيونات الفضة لأن 0.05 أقل من 0.1'},{t:'كلاهما لأن مولاتهما متساوية'}])}<div class="fb2 fb" style="min-height:24px"></div></div></div></div>`;},
 init:function(el){
  var fb=$('.fb',el);
  bindSeq(el,[{n:'g1',a:0.1,t:0.002,w:'✓ 6.35 ÷ 63.5 = 0.1 mol',h:'n = m ÷ M'},{n:'g2',a:0.1,t:0.002,w:'✓ 0.1 ÷ 1 = 0.1',h:'معامل Cu هو 1'},{n:'g3',a:0.05,t:0.001,w:'✓ 0.1 ÷ 2 = 0.05',h:'اقسم 0.1 على معامل Ag⁺ وهو 2'}],fb,function(){ var p=$('#pick',el); p.classList.remove('hide'); p.classList.add('up') });
  bindMcq($('#pick',el),[{t:'',why:'الأقل هو المحدد: 0.05 أقل من 0.1'},{t:'',ok:true,why:'صح: Ag⁺ المحددة (الأقل)، والنحاس هو الفائض'},{t:'',why:'بعد القسمة على المعامل لا يتساويان'}],$('.fb2',el),null);
 },
 note:'<ul><li>سؤال ص٧٨: «تمت إضافة ٦٫٣٥ g من فلز النحاس إلى محلول يحتوي على ٠٫١ mol من أيونات الفضة». الجزء ١: n(Cu) = ٠٫١ mol. الجزء ٢: المحددة Ag⁺ (٠٫١ ÷ ٢ = ٠٫٠٥ أقل من ٠٫١ ÷ ١).</li><li>عرضك (شريحة ١٢) يكتب النسبة Cu : 2Ag⁺ ثم يقارن ٠٫٠٥ بـ ٠٫١.</li></ul>'});

/* 15 particle picture: which substance is left over? */
function molN2(x,y,cls){return '<g class="mol '+cls+'"><circle cx="'+(x-15)+'" cy="'+y+'" r="17" fill="url(#gN)" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="'+(x+15)+'" cy="'+y+'" r="17" fill="url(#gN)" stroke="rgba(0,0,0,.35)" stroke-width="2"/></g>'}
function molH2(x,y,cls){return '<g class="mol '+cls+'"><circle cx="'+(x-10)+'" cy="'+y+'" r="11" fill="#F2F5F5" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="'+(x+10)+'" cy="'+y+'" r="11" fill="#F2F5F5" stroke="rgba(0,0,0,.35)" stroke-width="2"/></g>'}
function molNH3(x,y,cls){return '<g class="prod '+cls+'"><circle cx="'+(x-26)+'" cy="'+(y+16)+'" r="10" fill="#F2F5F5" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="'+(x+26)+'" cy="'+(y+16)+'" r="10" fill="#F2F5F5" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="'+x+'" cy="'+(y-26)+'" r="10" fill="#F2F5F5" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="'+x+'" cy="'+y+'" r="17" fill="url(#gN)" stroke="rgba(0,0,0,.35)" stroke-width="2"/></g>'}
slide({id:'parts',ch:3,title:'أشكال الجسيمات: ما المادة الفائضة؟',tag:'نفّذ التفاعل',
 html:function(){
  var n2='', h2='', pr='', i;
  for(i=0;i<3;i++) n2+=molN2(100+i*130,70,'n'+i);
  for(i=0;i<6;i++) h2+=molH2(100+(i%3)*130,172+Math.floor(i/3)*62,'h'+i);
  for(i=0;i<4;i++) pr+=molNH3(590+(i%2)*92,92+Math.floor(i/2)*120,'p'+i);
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:10px 18px;gap:6px;align-items:center"><div class="bigeq" style="font-size:36px;color:var(--gold)">N<sub>2</sub> + 3H<sub>2</sub> → 2NH<sub>3</sub></div>
    <svg id="psvg" viewBox="0 0 760 300" width="100%" style="max-height:320px" aria-hidden="true">
     <text x="230" y="26" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="22" fill="var(--cyan)">N₂ × 3</text><text x="230" y="128" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="22" fill="var(--cyan)">H₂ × 6</text>
     <path d="M440 150H500M486 134L502 150L486 166" stroke="var(--gold)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${n2}${h2}${pr}</svg>
    <button class="btn acc" type="button" id="run">نفّذ التفاعل</button></div></div>
  <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
   <div class="panel hide" id="pq" style="padding:12px 18px;gap:6px"><div style="font-size:24px;font-weight:800">ما المادة المحددة للتفاعل؟</div>${optsHTML([{t:'N₂'},{t:'H₂'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:10px"')}<div class="fb" style="min-height:24px"></div></div>
   <div class="panel hide" id="pq2" style="padding:12px 18px;flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:24px;font-weight:700">عدد جزيئات N₂ المتبقية =</span>${nin('left','')}<div class="fb f2" style="flex:1;min-height:24px;min-width:160px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:22px">H₂ <b>محددة</b> (6 ÷ 3 = 2) وN₂ <b>فائضة</b> (3 ÷ 1 = 3)، فبقي جزيء N₂ واحد.</div></div></div>`;},
 init:function(el){
  var svg=$('#psvg',el);
  $('#run',el).addEventListener('click',function(){
    this.classList.add('hide'); svg.classList.add('go');
    $$('.mol.n0,.mol.n1,.mol.h0,.mol.h1,.mol.h2,.mol.h3,.mol.h4,.mol.h5',svg).forEach(function(m){m.classList.add('gone')});
    $$('.prod',svg).forEach(function(p,i){later(function(){p.classList.add('on')},500+i*160)});
    later(function(){var q=$('#pq',el); q.classList.remove('hide'); q.classList.add('up')},1500);
  });
  bindMcq($('#pq',el),[{t:'',why:'N₂ بقي منه جزيء، فهو الفائض'},{t:'',ok:true,why:'صح: H₂ انتهى كله'}],$('#pq .fb',el),function(){var q=$('#pq2',el); q.classList.remove('hide'); q.classList.add('up')});
  bindNum($('#pq2 .nin',el),1,0.01,function(ok){ var fb=$('#pq2 .f2',el); if(ok){ say(fb,'✓ 3 − 2 = 1','ok'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } else say(fb,'عدّ الجزيء الذي لم يتفاعل','bad') });
 },
 note:'<ul><li>نمط سؤال امتحان ٢٠٢٥/٢٠٢٦ الدور الأول: شكل جزيئات ويُطلب تحديد المادة المحددة والفائضة (الشكل هنا من إعدادي على نمطه).</li><li>التفاعل: N₂ + 3H₂ → 2NH₃ مع ٣ جزيئات N₂ و٦ جزيئات H₂: يتفاعل جزيئان من N₂ و٦ من H₂ ويتكوّن ٤ جزيئات NH₃، ويبقى جزيء N₂.</li></ul>'});

/* 16 deck summary as a classification */
slide({id:'cls',ch:3,title:'الخلاصة: المادة المحددة والفائضة',tag:'صنّف بالسحب',
 html:function(){
  var R=[['CuO + C','CuO','C'],['Fe + S','Fe','S'],['Cu + 2Ag<sup>+</sup>','Ag','Cu']];
  return `<div class="col grow" style="gap:12px;justify-content:flex-start">
   <div class="clsgrid"><div class="ch"></div><div class="ch gold">المادة المحددة</div><div class="ch blue">المادة الفائضة</div>
    ${R.map(function(r){return `<div class="rx bigeq">${r[0]}</div><div class="mslot slot cs" data-k="${r[1]}" style="min-height:70px"><span class="ph" style="font-size:19px">اسحب</span></div><div class="mslot slot cs" data-k="${r[2]}" style="min-height:70px"><span class="ph" style="font-size:19px">اسحب</span></div>`}).join('')}</div>
   <div class="imp-tray" id="tray" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"></div>
   <div class="fb" style="text-align:center;min-height:26px"></div>
   <div class="gbar hide" id="gb">في كل تفاعل: نقارن <b>عدد المولات ÷ المعامل</b>، والأقل هو المحدد</div></div>`;},
 init:function(el){
  bindMatch(el,[['Cu','Cu','chipc'],['S','S','chipc'],['CuO','CuO','chipc'],['Ag','Ag<sup>+</sup>','chipc'],['C','C','chipc'],['Fe','Fe','chipc']],{css:'font-size:28px;min-width:110px;text-align:center;font-family:var(--font-display);padding:10px 18px',bad:'راجع القسمة على المعامل في هذا التفاعل'});
 },
 note:'<ul><li>جدول الخلاصة في عرضك (شريحة ١٣): CuO + C: المحددة CuO والفائضة C. Fe + S: المحددة Fe والفائضة S. Cu + 2Ag⁺: المحددة Ag⁺ والفائضة Cu.</li></ul>'});

/* 17 exit ticket 2 */
(function(){
  var items=[
   {q:'المادة المحددة للتفاعل هي:',opts:[{t:'المادة التي تنتهي أولاً وتحدد كمية الناتج',ok:true,why:'صح'},{t:'المادة التي يبقى منها فائض'},{t:'المادة الناتجة من التفاعل'}]},
   {q:'2Mg + O<sub>2</sub> → 2MgO. تفاعل 4.8 g من Mg مع 4.8 g من O<sub>2</sub> (Mg = 24, O = 32 للجزيء). المادة المحددة:',opts:[{t:'Mg',ok:true,why:'n(Mg) = 0.2 ÷ 2 = 0.1 ، n(O₂) = 0.15 ÷ 1 = 0.15 ← الأقل Mg'},{t:'O<sub>2</sub>'},{t:'لا يوجد محدد'}]},
   {q:'A + 2B → AB<sub>2</sub>. لديك 0.3 mol من A و0.5 mol من B. المادة المحددة:',opts:[{t:'A'},{t:'B',ok:true,why:'A: 0.3 ÷ 1 = 0.3 ، B: 0.5 ÷ 2 = 0.25 ← B هو الأقل'},{t:'كلاهما'}]},
   {type:'num',q:'في السؤال السابق، كم mol من A يبقى بعد التفاعل؟',unit:'mol',ans:0.05,tol:0.002,why:'B (0.5 mol) يتفاعل مع 0.25 mol من A ← 0.3 − 0.25 = 0.05 mol',hint:'B محددة: 0.25 mol من A تتفاعل'}
  ];
  slide({id:'tk2',ch:3,title:'تذكرة خروج ٢: المادة المحددة',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk2')},
   note:'<ul><li>الإجابات: تنتهي أولاً، Mg، B، ٠٫٠٥ mol.</li><li>السؤال الثالث فخ مقصود: B أكثر مولات لكنه المحدد بعد القسمة على المعامل.</li></ul>'});
})();
