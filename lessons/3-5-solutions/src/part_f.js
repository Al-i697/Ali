/* ---------- solutions, part F: applications (worksheets 3-5 and 3-6, exercise 3-6 b), the route map, end-of-unit question 5, the race ---------- */

/* 25 worksheet 3-5 (questions 1 to 3) */
slide({id:'ws35',ch:5,title:'ورقة العمل ٣-٥: تراكيز ومعايرة',tag:'كتاب النشاط ص٥٢',
 html:function(){
  var C=[['١ أ','أُذيب <b class="num">60 g</b> من NaOH في ماء لتكوين <b class="num">1 L</b> من المحلول.',[['w1','mol/L','C =']]],
         ['١ ب','أُضيف <b class="num">20 g</b> من NaOH إلى ماء لتحضير <b class="num">500 mL</b> من المحلول.',[['w2','g/L','تركيز الكتلة ='],['w3','mol/L','التركيز المولي =']]],
         ['٢','25 mL من NaOH مجهول التركيز عادلها <b class="num">20 mL</b> من HCl تركيزه <b class="num">0.50 mol/L</b>.',[['w4','mol','n(HCl) ='],['w5','mol/L','C(NaOH) =']]],
         ['٣','تفاعل <b class="num">15.0 mL</b> من HCl تركيزه <b class="num">0.10 mol/L</b> بالضبط مع <b class="num">10.0 mL</b> من NaOH.',[['w6','mol','n(HCl) ='],['w7','mol/L','C(NaOH) =']]]];
  return `<div class="col grow" style="gap:8px;justify-content:center"><div class="sm" style="font-size:19px;text-align:center;color:var(--muted)"><span class="num">Na = 23 ، O = 16 ، H = 1</span></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${C.map(function(c){return `<div class="frm brk" style="padding:10px 16px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">${c[0]}</div><p class="lead" style="margin:0;font-size:20px;line-height:1.45">${c[1]}</p>${c[2].map(function(b){return '<div style="display:flex;align-items:center;gap:10px"><span class="ql" style="font-size:19px;color:var(--muted);font-weight:700;min-width:104px">'+b[2]+'</span>'+nin(b[0],b[1])+'</div>'}).join('')}</div>`}).join('')}</div>
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الخطوات نفسها: مولات المعلوم ← نسبة المعادلة (1 : 1) ← تركيز أو حجم المجهول.</div></div>`;},
 init:function(el){
  bindAll(el,[{n:'w1',a:1.5,t:0.015,w:'✓ n = 60 ÷ 40 = 1.5 mol ← 1.5 ÷ 1 = 1.5 mol/L',h:'n = m ÷ M ثم C = n ÷ V'},{n:'w2',a:40,t:0.4,w:'✓ 20 ÷ 0.5 = 40 g/L',h:'C = m ÷ V (الحجم باللتر)'},{n:'w3',a:1,t:0.01,w:'✓ n = 0.5 mol ← 0.5 ÷ 0.5 = 1 mol/L',h:'n = 20 ÷ 40 = 0.5 ثم ÷ 0.5 L'},{n:'w4',a:0.01,t:0.0002,w:'✓ 0.50 × 0.020 = 0.01 mol',h:'n = C × V (20 mL = 0.020 L)'},{n:'w5',a:0.4,t:0.006,w:'✓ n(NaOH) = 0.01 (1 : 1) ← 0.01 ÷ 0.025 = 0.4 mol/L',h:'نسبة 1 : 1 ثم ÷ 0.025 L'},{n:'w6',a:0.0015,t:0.00002,w:'✓ 0.10 × 0.0150 = 0.0015 mol',h:'n = C × V (15.0 mL = 0.0150 L)'},{n:'w7',a:0.15,t:0.002,w:'✓ 0.0015 ÷ 0.0100 = 0.15 mol/L',h:'نسبة 1 : 1 ثم ÷ 0.0100 L'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب النشاط ورقة العمل ٣-٥ (ص٥٢): ١ أ) 1.5 mol/L. ١ ب) 40 g/L و1.0 mol/L. ٢) 0.4 mol/L. ٣) المعادلة NaOH + HCl → NaCl + H₂O، وعدد مولات HCl = 0.0015 mol. وجزء ١ ج (الخارصين وحجم الهيدروجين) حللناه في الدرس ٣-٤.</li><li>في سؤال ٣ عرض NotebookLM يعرض الجزأين (أ) و(ب) فقط؛ أضفت إليه حساب تركيز NaOH (0.15 mol/L) تتميماً للخطوات.</li></ul>'});

/* 26 exercise 3-6 b: citric acid */
chainSlide({id:'citric',ch:5,title:'تمرين ٣-٦ (ب): كتلة المول من المعايرة',
 eq:'H<sub>3</sub>A + 3NaOH → Na<sub>3</sub>A + 3H<sub>2</sub>O',eqSize:30,data:'أُذيبت <b class="num">0.48 g</b> من حمض الستريك في 50 mL ماء ومعايرتها بـ NaOH تركيزه <b class="num">0.50 mol/L</b>: القراءة الابتدائية <b class="num">1.10 mL</b> والنهائية <b class="num">16.10 mL</b>. كل 1 mol من الحمض يتفاعل مع <b class="num">3 mol</b> من NaOH.',
 labels:['المعطى','V(NaOH)','n(NaOH)','n(الحمض)','M<sub>r</sub>'],first:'m = 0.48 g',
 steps:[{n:'e1',q:'حجم NaOH = النهائية − الابتدائية',u:'mL',lab:'P =',a:15,t:0.1,w:'✓ 16.10 − 1.10 = 15.00 mL',h:'اطرح القراءتين',fill:'15.00 mL'},{n:'e2',q:'n(NaOH) = C × V',u:'mol',lab:'Q =',a:0.0075,t:0.0001,w:'✓ 0.50 × 0.01500 = 0.0075 mol',h:'حوّل 15.00 mL إلى L',fill:'0.0075 mol'},{n:'e3',q:'n(الحمض) = Q ÷ 3',u:'mol',lab:'R =',a:0.0025,t:0.00004,w:'✓ 0.0075 ÷ 3 = 0.0025 mol',h:'3 mol من NaOH لكل 1 mol من الحمض',fill:'0.0025 mol'},{n:'e4',q:'M<sub>r</sub> = الكتلة ÷ R',u:'g/mol',lab:'M =',a:192,t:2,w:'✓ 0.48 ÷ 0.0025 = 192 g/mol',h:'M = m ÷ n',fill:'192 g/mol'}],
 side:'<div class="defc blue" style="flex:none"><b>تحقق من الصيغة</b><span>الصيغة C<sub>6</sub>H<sub>8</sub>O<sub>7</sub>: <span class="num">6×12 + 8×1 + 7×16 = 192</span> ✓ نفس النتيجة.</span></div>',
 gbar:'المعايرة تعطي <b>الكتلة المولية</b> فنتحقق من صيغة المادة: 192 g/mol.',
 sideW:360,
 note:'<ul><li>كتاب النشاط تمرين ٣-٦ (ب) (ص٤٥): حمض الستريك عضوي صلب أبيض يذوب بسهولة، الخطوات: 0.48 g في 50 mL ماء، كاشف ثيمول فثالين، معايرة بـ NaOH (0.5 mol/L): 1.10 و16.10 mL، فـ P = 15.00 mL، Q = 0.0075 mol، R = 0.0025 mol، M = 192 g/mol وهي تساوي كتلة C₆H₈O₇.</li><li>العلاقة المهمة: 1 mol من الحمض (3 مجموعات COOH) مع 3 mol من NaOH.</li></ul>'});

/* 27 worksheet 3-5 question 4: the water of crystallisation of sodium carbonate */
rowsSlide({id:'na2co3',ch:5,title:'ورقة العمل ٣-٥ (٤): ماء التبلور بالمعايرة',
 intro:'أُذيب <b class="num">2.5 g</b> من Na<sub>2</sub>CO<sub>3</sub>·xH<sub>2</sub>O في الماء، ووُجد بالمعايرة أن <b class="num">17.5 mL</b> من HCl تركيزه <b class="num">1.0 mol/L</b> تفاعلت معه بالضبط: <span class="num">Na<sub>2</sub>CO<sub>3</sub> + 2HCl → 2NaCl + H<sub>2</sub>O + CO<sub>2</sub></span> <span class="num">(Na = 23 ، C = 12 ، O = 16 ، H = 1)</span>',
 rows:[{n:'a',q:'١. n(HCl) = C × V',u:'mol',lab:'n =',a:0.0175,t:0.0003,w:'✓ 1.0 × 0.0175 = 0.0175 mol',h:'حوّل 17.5 mL إلى L'},{n:'b',q:'٢. n(Na<sub>2</sub>CO<sub>3</sub>) (النسبة 1 : 2)',u:'mol',lab:'n =',a:0.00875,t:0.00015,w:'✓ 0.0175 ÷ 2 = 0.00875 mol',h:'1 mol من Na₂CO₃ لكل 2 mol من HCl'},{n:'c',q:'٣. كتلة Na<sub>2</sub>CO<sub>3</sub> في العينة',u:'g',lab:'m =',a:0.9275,t:0.012,w:'✓ 0.00875 × 106 = 0.9275 g',h:'M(Na₂CO₃) = 106'},{n:'d',q:'٤. كتلة الماء في العينة',u:'g',lab:'m =',a:1.5725,t:0.02,w:'✓ 2.5 − 0.9275 = 1.5725 g',h:'اطرح كتلة Na₂CO₃ من 2.5 g'},{n:'e',q:'٥. عدد مولات الماء',u:'mol',lab:'n =',a:0.08736,t:0.0012,w:'✓ 1.5725 ÷ 18 = 0.0874 mol',h:'M(H₂O) = 18'},{n:'f',q:'٦. قيمة x = n(H₂O) ÷ n(Na₂CO₃)',u:'',lab:'x =',a:10,t:0.3,w:'✓ 0.0874 ÷ 0.00875 ≈ 10 ← Na₂CO₃·10H₂O',h:'اقسم عدد مولات الماء على عدد مولات الكربونات'}],
 side:'<div class="defc gold" style="flex:none"><b>الفكرة</b><span>نفس طريقة ٣-٣ في استنباط الصيغة: مولات الماء ÷ مولات الملح = <b>x</b>، لكن مولات الملح هنا جاءت من <b>المعايرة</b>.</span></div>',
 gbar:'الصيغة <b>Na<sub>2</sub>CO<sub>3</sub>·10H<sub>2</sub>O</b> (x = 10).',
 note:'<ul><li>كتاب النشاط ورقة العمل ٣-٥ سؤال ٤ (ص٥٣) وإجابته في عرض NotebookLM (شريحة ١٣): n(HCl) = 0.0175، n(Na₂CO₃) = 0.00875، الكتلة 0.9275 g، كتلة الماء 1.5725 g، n(H₂O) = 0.08736، x ≈ 10.</li><li>دليل المعلم: ورقة العمل ٣-٥ الأسئلة ٢ و٣ و٤ واجب للموضوع ٣-٥.</li></ul>'});

/* 28 worksheet 3-6: the readings of three burettes */
slide({id:'wsburette',ch:5,title:'ورقة العمل ٣-٦: قراءات السحاحة',tag:'كتاب النشاط ص٥٥',
 html:function(){
  var B=[[0.0,26.5],[6.0,31.7],[23.0,48.6]], s='', i, k, y0=24, px=6;
  B.forEach(function(b,i){
   var x=60+i*168, ya=y0+b[0]*px, yb=y0+b[1]*px;
   s+='<rect x="'+x+'" y="14" width="34" height="'+(50*px+16)+'" rx="5" fill="rgba(var(--t1),.10)" stroke="var(--cyan)" stroke-width="3"/>'+
     '<rect x="'+(x+2)+'" y="'+ya+'" width="30" height="'+(yb-ya)+'" fill="rgba(228,188,75,.30)"/>';
   for(k=0;k<=50;k+=5) s+='<line x1="'+x+'" y1="'+(y0+k*px)+'" x2="'+(x+(k%10===0?14:8))+'" y2="'+(y0+k*px)+'" stroke="rgba(255,255,255,.7)" stroke-width="'+(k%10===0?2:1.2)+'"/>'+(k%10===0?'<text x="'+(x-5)+'" y="'+(y0+k*px+5)+'" text-anchor="end" font-size="13" font-weight="700" fill="var(--ink)" direction="ltr">'+k+'</text>':'');
   s+='<line x1="'+(x-2)+'" y1="'+ya+'" x2="'+(x+60)+'" y2="'+ya+'" stroke="var(--cyan)" stroke-width="3"/><text x="'+(x+64)+'" y="'+(ya+5)+'" font-size="15" font-weight="800" fill="var(--ink)" direction="ltr">'+b[0].toFixed(1)+' mL</text>'+
     '<line x1="'+(x-2)+'" y1="'+yb+'" x2="'+(x+60)+'" y2="'+yb+'" stroke="var(--gold)" stroke-width="3"/><text x="'+(x+64)+'" y="'+(yb+5)+'" font-size="15" font-weight="800" fill="var(--gold)" direction="ltr">'+b[1].toFixed(1)+' mL</text>'+
     '<text x="'+(x+17)+'" y="'+(y0+50*px+34)+'" text-anchor="middle" font-size="17" font-weight="800" fill="var(--cyan)">المعايرة '+(i+1)+'</text>';
  });
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:560px;flex:none;align-items:center;justify-content:center"><div class="panel" style="padding:6px 8px;align-items:center;width:100%"><svg viewBox="0 0 560 372" width="100%" style="max-height:400px" aria-hidden="true">${s}</svg></div><div class="sm" style="font-size:19px;text-align:center;color:var(--muted)">الخط الأزرق: القراءة الابتدائية ، الخط الذهبي: القراءة النهائية</div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
   ${qline('المعايرة ١: 26.5 − 0.0',[['v1','mL','V =']])}${qline('المعايرة ٢: 31.7 − 6.0',[['v2','mL','V =']])}${qline('المعايرة ٣: 48.6 − 23.0',[['v3','mL','V =']])}
   <div class="panel hide" id="pk" style="padding:10px 16px;gap:7px"><div style="font-size:21px;font-weight:800">اختر النتيجتين الأفضل (الفرق ≤ 0.1 mL):</div><div class="chips" style="gap:8px">${[1,2,3].map(function(n){return '<button type="button" class="pill pn" data-i="'+n+'" style="min-height:44px;font-size:22px">'+ar(n)+'</button>'}).join('')}</div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap" id="pm" class="hide"><span style="font-size:21px;font-weight:800">المتوسط =</span>${nin('mn','mL')}</div></div>
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">متوسط حجم HCl = <b class="num">25.65 mL</b>. نستخدمه في الشريحة التالية لإيجاد صيغة الحمض.</div></div></div>`;},
 init:function(el){
  var fb=$('.fb',el), sel=[];
  bindAll(el,[{n:'v1',a:26.5,t:0.06,w:'✓ 26.5 mL',h:'النهائية − الابتدائية'},{n:'v2',a:25.7,t:0.06,w:'✓ 25.7 mL',h:'النهائية − الابتدائية'},{n:'v3',a:25.6,t:0.06,w:'✓ 25.6 mL',h:'النهائية − الابتدائية'}],fb,function(){var p=$('#pk',el); p.classList.remove('hide'); p.classList.add('up')});
  var V={1:26.5,2:25.7,3:25.6};
  $$('.pn',el).forEach(function(b){b.addEventListener('click',function(){
   var i=+b.getAttribute('data-i'); if($('#pm',el)&&!$('#pm',el).classList.contains('hide')) return;
   if(sel.indexOf(i)>=0){sel.splice(sel.indexOf(i),1)} else sel.push(i);
   $$('.pn',el).forEach(function(x){x.classList.toggle('on',sel.indexOf(+x.getAttribute('data-i'))>=0)});
   if(sel.length===2){
    if(Math.abs(V[sel[0]]-V[sel[1]])<=0.1001){ say(fb,'✓ النتيجتان '+V[sel[0]]+' و'+V[sel[1]]+' متقاربتان','ok'); $('#pm',el).classList.remove('hide'); $('#pm',el).classList.add('up'); $('#pm',el).style.display='flex'; bindNum($('#pm .nin',el),(V[sel[0]]+V[sel[1]])/2,0.03,function(ok){ if(ok){ say(fb,'✓ المتوسط = 25.65 mL','ok'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } else say(fb,'اجمع النتيجتين واقسم على 2','bad') }) }
    else{ say(fb,'الفرق بينهما أكبر من 0.1 mL: اختر نتيجتين أقرب','bad'); sel=[]; later(function(){$$('.pn',el).forEach(function(x){x.classList.remove('on')})},500) }
   }
  })});
 },
 note:'<ul><li>كتاب النشاط ورقة العمل ٣-٦ (ص٥٥): القراءات من الرسم: (0.0 ← 26.5) و(6.0 ← 31.7) و(23.0 ← 48.6) فتكون الأحجام 26.5 و25.7 و25.6 mL. أفضل نتيجتين: ٢ و٣ (الفرق 0.1 mL) ومتوسطهما 25.65 mL.</li><li>في امتحان ٢٠٢٣/٢٠٢٤ (سؤال ٢٤) يُطلب نفس الشيء: قراءة ثلاث سحاحات واختيار أفضل نتيجتين (القراءات 25.2 و24.2 و24.5 mL وأفضلهما الثانية والثالثة).</li></ul>'});

/* 29 worksheet 3-6: the molar mass and the formula of an organic acid */
slide({id:'wsorg',ch:5,title:'ورقة العمل ٣-٦: صيغة حمض عضوي',tag:'احسب بالترتيب',
 html:function(){
  var R=[['a','٤. n(HCl) في المتوسط (25.65 mL)','mol','n =',0.002565,0.00004,'✓ 0.1 × 0.02565 = 0.002565 mol','n = C × V'],
         ['b','٥. n(NaOH) في 25 mL من المحلول B','mol','n =',0.002565,0.00004,'✓ النسبة 1 : 1 فالعدد نفسه','HCl : NaOH = 1 : 1'],
         ['c','٦. n(NaOH) في 250 mL من B','mol','n =',0.02565,0.0004,'✓ × 10 = 0.02565 mol','250 ÷ 25 = 10'],
         ['d','٧. n(NaOH) الأصلية في 50 mL (1 mol/L)','mol','n =',0.05,0.001,'✓ 1 × 0.050 = 0.05 mol','n = C × V'],
         ['e','٨. n(NaOH) التي تفاعلت مع الحمض A','mol','n =',0.02435,0.0004,'✓ 0.05 − 0.02565 = 0.02435 mol','الأصلية − الباقية'],
         ['f','٩. n(A) (1 mol من A تتفاعل مع 2 mol NaOH)','mol','n =',0.012175,0.0002,'✓ 0.02435 ÷ 2 = 0.012175 mol','اقسم على 2'],
         ['g','١٠. M<sub>r</sub>(A) = الكتلة ÷ n','g/mol','M =',124,1.5,'✓ 1.51 ÷ 0.012175 ≈ 124 g/mol','الكتلة 1.51 g'],
         ['h','١١. x في C<sub>x</sub>H<sub>2x</sub>(COOH)<sub>2</sub> (عدد صحيح)','','x =',2,0.1,'✓ 14x + 90 = 124 ← x ≈ 2.4 ← 2: C₂H₄(COOH)₂','14x + 90 = M']];
  return `<div class="col grow" style="gap:6px;justify-content:center">
   <div class="frm brk" style="padding:8px 16px;gap:2px"><p class="lead" style="margin:0;font-size:19px;line-height:1.5">الحمض العضوي A (له مجموعتا COOH): كتلته <b class="num">10.27 − 8.76 = 1.51 g</b>. أُضيف إليه <b class="num">50 mL</b> من NaOH (1 mol/L) ونُقل إلى <b class="num">250 mL</b> (المحلول B). عُويرت <b class="num">25 mL</b> من B بـ HCl (0.1 mol/L) فكان المتوسط <b class="num">25.65 mL</b> (كاشف ثيمول فثالين). <span class="num">C = 12 ، O = 16 ، H = 1</span></p></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px">${R.map(function(r){return qline(r[1],[[r[0],r[2],r[3]]])}).join('')}</div>
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:19px">الحمض A: <b>C<sub>2</sub>H<sub>4</sub>(COOH)<sub>2</sub></b> (حمض السكسينيك). المعايرة أعطت كتلته المولية ثم صيغته.</div></div>`;},
 init:function(el){
  bindSeq(el,[['a',0.002565,0.00004,'n = C × V'],['b',0.002565,0.00004,'HCl : NaOH = 1 : 1'],['c',0.02565,0.0004,'250 ÷ 25 = 10'],['d',0.05,0.001,'n = C × V'],['e',0.02435,0.0004,'الأصلية − الباقية'],['f',0.012175,0.0002,'اقسم على 2'],['g',124,1.5,'الكتلة 1.51 g'],['h',2,0.1,'14x + 90 = M']].map(function(r,i){var W=['✓ 0.1 × 0.02565 = 0.002565 mol','✓ النسبة 1 : 1 فالعدد نفسه','✓ × 10 = 0.02565 mol','✓ 1 × 0.050 = 0.05 mol','✓ 0.05 − 0.02565 = 0.02435 mol','✓ 0.02435 ÷ 2 = 0.012175 mol','✓ 1.51 ÷ 0.012175 ≈ 124 g/mol','✓ 14x + 90 = 124 ← x ≈ 2.4 ← 2: C₂H₄(COOH)₂'];return {n:r[0],a:r[1],t:r[2],w:W[i],h:r[3]}}),$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب النشاط ورقة العمل ٣-٦ (ص٥٤–٥٦): كتلة الحمض = 10.27 − 8.76 = 1.51 g؛ 50 mL من NaOH (1 mol/L) أُضيفت للعينة ثم نُقلت إلى دورق حجمي 250 mL (المحلول B)؛ ماصة 25 mL؛ الكاشف ثيمول فثالين (عديم اللون في الحمضي، أزرق في القلوي): قبل إضافة الحمض أزرق، وعند نقطة التكافؤ عديم اللون.</li><li>الخطوات ٧ إلى ١٢ في الورقة: n(NaOH) في 250 mL، n الأصلية = 0.05 mol، الفرق = المتفاعل مع A، n(A) = ½ ذلك، M = 1.51 ÷ n ≈ 124، الصيغة C<sub>x</sub>H<sub>2x</sub>(COOH)<sub>2</sub> ← x ≈ 2.4 فيُقرَّب إلى 2 (الفرق عن 118 g/mol يعود إلى الأخطاء التجريبية).</li><li>أسئلة الورقة الأولى: ٢) الأداة لقياس 25 mL بدقة: الماصة. ٣) لون المحلول: أ) أزرق، ب) عديم اللون.</li></ul>'});

/* 30 the route map (book figure 3-8): mass, gas volume or solution to mass, gas volume or concentration */
slide({id:'map',ch:6,title:'الخريطة الكبرى: كل حسابات الوحدة',tag:'اختر المعطى والمطلوب',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:4px;justify-content:center">
   <div class="frow"><div class="rbx" id="mA">كتلة المادة (g) ÷ <span class="num">M<sub>r</sub></span></div><div class="rbx" id="mB">حجم الغاز (L) ÷ <span class="num">24</span></div><div class="rbx" id="mC">التركيز (mol/L) × الحجم (L)</div></div>
   <div class="fa">▼</div><div class="rbx wide" id="mN1">عدد مولات المادة المعطاة</div>
   <div class="fa">▼</div><div class="rbx wide red" id="mR">استخدم نسبة المولات من المعادلة الموزونة</div>
   <div class="fa">▼</div><div class="rbx wide" id="mN2">عدد مولات المادة المطلوبة</div>
   <div class="fa">▼</div>
   <div class="frow"><div class="rbx" id="mD">الكتلة (g) = n × <span class="num">M<sub>r</sub></span></div><div class="rbx" id="mE">حجم الغاز (L) = n × <span class="num">24</span></div><div class="rbx" id="mF">التركيز = n ÷ V (L)</div></div></div>
  <div class="col" style="width:400px;flex:none;gap:9px;justify-content:center">
   <div class="panel" style="padding:10px 16px;gap:7px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">المعطى:</div><div class="chips" style="gap:8px"><button type="button" class="pill pk" data-g="m" style="font-size:20px">كتلة</button><button type="button" class="pill pk" data-g="v" style="font-size:20px">غاز</button><button type="button" class="pill pk" data-g="c" style="font-size:20px">محلول</button></div>
    <div style="font-size:21px;font-weight:800;color:var(--cyan)">المطلوب:</div><div class="chips" style="gap:8px"><button type="button" class="pill pw" data-w="m" style="font-size:20px">كتلة</button><button type="button" class="pill pw" data-w="v" style="font-size:20px">غاز</button><button type="button" class="pill pw" data-w="c" style="font-size:20px">محلول</button></div></div>
   <div class="frm brk" style="padding:12px 16px;gap:6px;min-height:150px;justify-content:center"><div style="font-size:21px;font-weight:800;color:var(--gold)" id="mext">اختر المعطى والمطلوب لترى المسار</div><div class="sm" id="mexd" style="font-size:19px;line-height:1.45"> </div></div>
   <div class="gbar hide" id="gb" style="font-size:19px">تسع حالات والطريقة واحدة: <b>معطى ← مولات ← نسبة ← مولات ← مطلوب</b>.</div></div></div>`;},
 init:function(el){
  var g=null, w=null, seen={};
  var EX={mm:['كتلة ← كتلة','كتلة Mg المحترقة ← كتلة MgO (الدرس ٣-٣).'],mv:['كتلة ← غاز','0.5 g من Na ← حجم H₂ (سؤال ٣-١٥).'],mc:['كتلة ← تركيز محلول','10 g من CaCO₃ ← تركيز HCl (سؤال ٣-٢٠).'],vm:['غاز ← كتلة','82 mL من H₂ ← كتلة Mg (تمرين ٣-٤).'],vv:['غاز ← غاز','NO₂ ← H₂ (سؤال ٤ ب): نسبة الحجوم مباشرة.'],vc:['غاز ← تركيز','حجم من HCl الغازي يُذاب في الماء ← تركيز الحمض: V ÷ 24 ثم ÷ حجم المحلول.'],cm:['محلول ← كتلة','حجم وتركيز HCl ← كتلة CaCO₃ المتفاعلة: n = C × V ثم × M.'],cv:['محلول ← غاز','محلول HCl مع Zn ← حجم H₂: n = C × V ثم × 24.'],cc:['محلول ← محلول','المعايرة: حجم وتركيز محلول ← تركيز محلول آخر (مثالا ٣-٩ و٣-١٠).']};
  function paint(){
   ['mA','mB','mC','mD','mE','mF','mN1','mR','mN2'].forEach(function(i){$('#'+i,el).classList.remove('on')});
   if(g&&w){
    $('#m'+{m:'A',v:'B',c:'C'}[g],el).classList.add('on'); $('#m'+{m:'D',v:'E',c:'F'}[w],el).classList.add('on'); ['mN1','mR','mN2'].forEach(function(i){$('#'+i,el).classList.add('on')});
    var e=EX[g+w]; $('#mext',el).textContent=e[0]; $('#mexd',el).innerHTML=e[1]; seen[g+w]=1;
    if(Object.keys(seen).length>=5){var b=$('#gb',el); b.classList.remove('hide'); b.classList.add('up')}
   }
  }
  $$('.pk',el).forEach(function(b){b.addEventListener('click',function(){g=b.getAttribute('data-g'); $$('.pk',el).forEach(function(x){x.classList.toggle('on',x===b)}); paint()})});
  $$('.pw',el).forEach(function(b){b.addEventListener('click',function(){w=b.getAttribute('data-w'); $$('.pw',el).forEach(function(x){x.classList.toggle('on',x===b)}); paint()})});
 },
 note:'<ul><li>كتاب الطالب الشكل ٣-٨ (ص٧٦) وملخص الوحدة: ثلاث طرق للحصول على عدد المولات (كتلة ÷ M للمواد الصلبة والسائلة، حجم ÷ 24 للغازات فقط، تركيز × حجم للمحلول)، ثم نسبة المعادلة، ثم ثلاث طرق للمطلوب (n × M، n × 24، n ÷ V).</li><li>الشكل نفسه ظهر في الدرس ٣-٤ بدون المحلول. جرّبوا الحالات التسع، وكل واحدة منها سؤال حللناه في الوحدة.</li></ul>'});

/* 31 end-of-unit question 5 */
slide({id:'q5',ch:6,title:'سؤال ٥ نهاية الوحدة',tag:'كتاب الطالب ص٧٩',
 html:function(){return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
  <div class="frm brk" style="width:470px;flex:none;padding:12px 18px;gap:7px;justify-content:flex-start"><div style="font-size:23px;font-weight:800;color:var(--cyan)">أ</div>
   <p class="lead" style="margin:0;font-size:21px;line-height:1.5">أُذيب <b class="num">2 g</b> من NaOH في الماء لتحضير محلول حجمه النهائي <b class="num">250 mL</b>. <span class="num">Na = 23 ، H = 1 ، O = 16</span></p>
   ${qline('١. تركيز المحلول بالـ g/L',[['p1','g/L','C =']])}${qline('٢. تركيزه بالـ mol/L',[['p2','mol/L','C =']])}<div class="fb fa1" style="min-height:24px;text-align:center"></div></div>
  <div class="frm brk" style="flex:1;min-width:0;padding:12px 18px;gap:7px;justify-content:flex-start"><div style="font-size:23px;font-weight:800;color:var(--cyan)">ب: معايرة KOH بحمض الكبريتيك</div>
   <p class="lead" style="margin:0;font-size:20px;line-height:1.45">وُضعت <b class="num">25 mL</b> من KOH في دورق مخروطي مع الكاشف، وتمت معادلتها بـ <b class="num">23.6 mL</b> من H<sub>2</sub>SO<sub>4</sub> تركيزه <b class="num">0.1 mol/L</b>.</p>
   <div class="pqx" id="x1"><div style="font-size:19px;font-weight:700">١. الأداة التي قاست 25 mL بدقة:</div><div class="sel"><button type="button" data-ok="1">الماصة</button><button type="button" data-ok="0">السحاحة</button><button type="button" data-ok="0">المخبار المدرج</button></div></div>
   <div class="pqx" id="x2"><div style="font-size:19px;font-weight:700">٢. الأداة التي أضافت الحمض بدقة:</div><div class="sel"><button type="button" data-ok="0">الماصة</button><button type="button" data-ok="1">السحاحة</button><button type="button" data-ok="0">القارورة الحجمية</button></div></div>
   ${qline('٣. n(H<sub>2</sub>SO<sub>4</sub>)',[['p3','mol','n =']])}${qline('n(KOH) (النسبة 1 : 2)',[['p4','mol','n =']])}${qline('C(KOH)',[['p5','mol/L','C =']])}<div class="fb fa2" style="min-height:24px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:19px">(أ) 8 g/L و0.2 mol/L. (ب) C(KOH) = <b class="num">0.189 mol/L</b>.</div></div></div>`;},
 init:function(el){
  var d1=false, d2=false, d3=0;
  function chk(){ if(d1&&d2&&d3===2){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} }
  bindSeq(el,[{n:'p1',a:8,t:0.1,w:'✓ 2 ÷ 0.25 = 8 g/L',h:'C = m ÷ V (V = 0.25 L)'},{n:'p2',a:0.2,t:0.003,w:'✓ n = 2 ÷ 40 = 0.05 mol ← 0.05 ÷ 0.25 = 0.2 mol/L',h:'n = m ÷ M ثم C = n ÷ V'}],$('.fa1',el),function(){d1=true; chk()});
  bindSeq(el,[{n:'p3',a:0.00236,t:0.00003,w:'✓ 0.1 × 0.0236 = 0.00236 mol',h:'حوّل 23.6 mL إلى L'},{n:'p4',a:0.00472,t:0.00007,w:'✓ × 2 = 0.00472 mol',h:'1 mol من الحمض تعادل 2 mol من KOH'},{n:'p5',a:0.1888,t:0.003,w:'✓ 0.00472 ÷ 0.025 = 0.189 mol/L',h:'اقسم على 0.025 L'}],$('.fa2',el),function(){d2=true; chk()});
  ['x1','x2'].forEach(function(id){
   var box=$('#'+id,el);
   $$('.sel button',box).forEach(function(b){b.addEventListener('click',function(){
    if(b.classList.contains('locked')) return;
    if(b.getAttribute('data-ok')==='1'){ b.classList.add('ok-b'); $$('.sel button',box).forEach(function(x){x.classList.add('locked')}); d3++; chk() }
    else{ b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340) }
   })});
  });
 },
 note:'<ul><li>كتاب الطالب أسئلة نهاية الوحدة سؤال ٥ (ص٧٩) (في عرض NotebookLM مكتوب «ص٧١»). أ) 8 g/L و0.2 mol/L. ب) ١) الماصة. ٢) السحاحة. ٣) n(H₂SO₄) = 0.00236 mol، n(KOH) = 0.00472 mol، التركيز = 0.189 mol/L.</li></ul>'});

/* 32 class race */
slide({id:'race',ch:6,title:'سباق الفصل: محاليل ومعايرة',tag:'مسابقة',
 html:function(){
  var Q=[['أ','4 g من NaOH في 250 mL: تركيز الكتلة','g/L'],['ب','0.5 mol في 250 mL: التركيز المولي','mol/L'],['ج','n في 50 mL من محلول 0.2 mol/L','mol'],['د','كتلة NaOH في 500 mL من محلول 0.1 mol/L','g'],['هـ','حجم محلول 0.6 mol/L فيه 0.3 mol','mL'],['و','20 mL من NaOH (0.1 mol/L) تعادل 25 mL من HCl: C(HCl)','mol/L'],['ز','25 mL من H<sub>2</sub>SO<sub>4</sub> (0.1 mol/L) مع NaOH (0.2 mol/L): V(NaOH)','mL'],['ح','5 g من CaCO<sub>3</sub> مع 100 mL من HCl كافٍ: C(HCl)','mol/L']];
  return `<div class="col grow" style="gap:8px"><div class="chips" style="gap:8px;direction:ltr;justify-content:center">${['H','C','O','Na','Ca'].map(function(s){return '<span class="pill" style="min-height:34px;padding:0 12px;font-size:19px;font-family:var(--font-display)">'+s+' = '+AR[s]+'</span>'}).join('')}</div>
   <div class="rgrid" style="grid-template-columns:repeat(4,1fr)">${Q.map(function(q,i){return `<div class="rc" data-i="${i}"><div class="nm" style="font-size:18px">${q[0]}. ${q[1]}</div><div class="ans"></div>${ninHTML('r'+i,q[2],'sm')}</div>`}).join('')}</div></div>
   <div class="teams"><div class="team"><div style="font-weight:700;font-size:21px">الفريق الأول</div><b class="num" id="tA">0</b><div class="pm"><button type="button" data-t="A" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="A" data-d="1" aria-label="زِد">+</button></div></div>
   <div class="team b"><div style="font-weight:700;font-size:21px">الفريق الثاني</div><b class="num" id="tB">0</b><div class="pm"><button type="button" data-t="B" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="B" data-d="1" aria-label="زِد">+</button></div></div>
   <p class="sm muted" id="left" style="text-align:center">٨ أسئلة متبقية</p></div>`;},
 init:function(el){
  var A=[16,2,0.01,2,500,0.08,25,1], sc={A:0,B:0}, left=8;
  $$('.team .pm button',el).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); sc[t]=Math.max(0,sc[t]+ +b.getAttribute('data-d')); $('#t'+t,el).textContent=sc[t]})});
  $$('.rc',el).forEach(function(c,i){
   bindNum($('.nin',c),A[i],Math.max(tolOf(A[i])*1.5,1e-6),function(ok){ if(ok){c.classList.add('ok'); $('.ans',c).textContent='= '+(+A[i].toPrecision(4)); left--; $('#left',el).textContent=left?ar(left)+' أسئلة متبقية':'انتهت الأسئلة!'} });
  });
 },
 note:'<ul><li>الإجابات: ١٦ g/L، ٢ mol/L، ٠٫٠١ mol، ٢ g، ٥٠٠ mL، ٠٫٠٨ mol/L، ٢٥ mL، ١ mol/L.</li><li>قسّم الصف فريقين، وكل فريق يرسل طالباً. اضغط + للفريق الفائز بالنقطة. الأسئلة من إعدادي.</li></ul>'});
