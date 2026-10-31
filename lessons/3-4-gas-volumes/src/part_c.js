/* ---------- gas volumes, part C: reactions that involve gases only (book page 68, exercise 3-5, question 3-14) ---------- */

/* 12 gases only: the volumes follow the ratio of the equation */
slide({id:'gasonly',ch:3,title:'تفاعلات تحتوي على غازات فقط',tag:'حرّك المنزلق',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:12px 20px;gap:7px;align-items:center"><div class="bigeq" style="font-size:38px;color:var(--gold)">H<sub>2</sub>(g) + Cl<sub>2</sub>(g) → 2HCl(g)</div>
    <div class="chips" style="gap:10px;direction:ltr;font-family:var(--font-display);font-size:23px;font-weight:800"><span class="pill">1 mol</span><span class="pill">1 mol</span><span style="align-self:center">→</span><span class="pill">2 mol</span></div>
    <div class="chips" style="gap:10px;direction:ltr;font-family:var(--font-display);font-size:23px;font-weight:800"><span class="pill">24 L</span><span class="pill">24 L</span><span style="align-self:center">→</span><span class="pill">48 L</span></div></div>
   <div class="panel" style="padding:12px 20px;gap:8px"><div style="display:flex;align-items:center;gap:14px"><span style="font-size:23px;font-weight:700;flex:none">حجم H<sub>2</sub></span><input type="range" id="gsl" min="10" max="40" step="5" value="20" aria-label="حجم الهيدروجين بالمليلتر" style="flex:1"><b class="num" id="gsv" style="font-size:28px;min-width:96px;text-align:center"></b></div>
    ${barsHTML('gbars',[{lab:'H₂',parts:[[1,'cao','']]},{lab:'Cl₂',parts:[[1,'cao','']]},{lab:'HCl',parts:[[1,'made','']]}],80)}</div></div>
  <div class="col" style="width:390px;flex:none;gap:10px;justify-content:center">
   <div class="panel" style="padding:14px 18px;gap:8px"><p class="lead" style="margin:0;font-size:24px">نخلط <b class="num">15 mL</b> من غاز H<sub>2</sub> مع كمية كافية من Cl<sub>2</sub>. كم mL من HCl تتكوّن؟</p>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${nin('g1','mL')}</div><div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:21px">نسبة الحجوم = نسبة المعاملات <b>1 : 1 : 2</b>. لا نحتاج إلى تحويل الحجم إلى مولات.</div></div></div>`;},
 init:function(el){
  var sl=$('#gsl',el), bars=$('#gbars',el), segs=$$('.bseg',bars);
  function paint(){
   var v=+sl.value, vals=[v,v,2*v], names=['H₂','Cl₂','HCl'];
   $('#gsv',el).textContent=v+' mL';
   segs.forEach(function(s,i){ s.style.setProperty('--w',(vals[i]/80*100).toFixed(1)+'%'); $('b',s).textContent=vals[i]+' mL' });
  }
  bars.classList.add('go'); sl.addEventListener('input',paint); paint();
  bindNum($('.nin',el),30,0.3,function(ok){var fb=$('.panel .fb',el); if(ok){say(fb,'✓ 15 × 2 = 30 mL','ok'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} else say(fb,'HCl ضعف حجم H₂ (النسبة 1 : 2)','bad')});
 },
 note:'<ul><li>كتاب الطالب ص٦٨: في التفاعلات التي تحتوي غازات فقط تكون حجوم الغازات بنسبة المولات في المعادلة. مثال الكتاب: 20 mL من الهيدروجين تتفاعل مع كمية كافية من الكلور وتعطي 40 mL من كلوريد الهيدروجين.</li><li>عرضك القديم (شريحة ١٨) فيه المثال نفسه. حرّك المنزلق وقل: «الحجوم بنسبة 1 : 1 : 2 دائماً».</li><li>دليل المعلم: الهدف تعزيز أن التحويل إلى مولات ليس ضرورياً، وأن نوع الغاز لا يهم.</li></ul>'});

/* 13 why the total volume can change: 2H2 + O2 -> 2H2O (activity book exercise 3-5 a) */
slide({id:'shrink',ch:3,title:'لماذا ينقص الحجم الكلي؟',tag:'شاهد التفاعل',
 html:function(){
  function h2(x,y,cls){return '<g class="'+cls+'"><circle cx="'+x+'" cy="'+y+'" r="15" fill="url(#gH)" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><circle cx="'+(x+28)+'" cy="'+y+'" r="15" fill="url(#gH)" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/></g>'}
  function o2(x,y,cls){return '<g class="'+cls+'"><circle cx="'+x+'" cy="'+y+'" r="20" fill="url(#gO)" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><circle cx="'+(x+38)+'" cy="'+y+'" r="20" fill="url(#gO)" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/></g>'}
  function w(x,y,cls){return '<g class="'+cls+'"><circle cx="'+(x-15)+'" cy="'+(y+14)+'" r="11" fill="url(#gH)" stroke="rgba(0,0,0,.35)" stroke-width="1.3"/><circle cx="'+(x+15)+'" cy="'+(y+14)+'" r="11" fill="url(#gH)" stroke="rgba(0,0,0,.35)" stroke-width="1.3"/><circle cx="'+x+'" cy="'+y+'" r="20" fill="url(#gO)" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/></g>'}
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:10px 16px;gap:8px;align-items:center"><div class="bigeq" style="font-size:34px;color:var(--gold)">2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(g)</div>
    <svg id="ssvg" viewBox="0 0 580 150" width="100%" style="max-height:150px" aria-hidden="true">${h2(40,36,'mol')}${h2(40,104,'mol')}${o2(190,70,'mol')}<text x="290" y="82" text-anchor="middle" font-size="40" fill="var(--cyan)">→</text>${w(400,40,'prod')}${w(500,100,'prod')}</svg>
    <button class="btn acc" type="button" id="srun" style="font-size:22px">▶ تفاعل</button></div>
   <div class="panel" style="padding:10px 18px;gap:6px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">الحجوم عند درجة حرارة الغرفة والضغط القياسي</div>
    ${barsHTML('sbars',[{lab:'قبل',parts:[[48,'cao','H₂ 48 L'],[24,'left','O₂ 24 L']]},{lab:'بعد',parts:[[48,'made','H₂O 48 L']]}],72)}</div></div>
  <div class="col" style="width:430px;flex:none;gap:10px;justify-content:center">
   <div class="panel hide" id="s1" style="padding:12px 18px;gap:6px"><div style="font-size:22px;font-weight:800">١. ما المقصود بالحجم المولي للغاز؟</div>${optsHTML([{t:'كتلة 1 mol من الغاز'},{t:'حجم 1 mol من أي غاز: 24 L عند درجة حرارة الغرفة والضغط القياسي'},{t:'حجم 1 L من الغاز'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="panel hide" id="s2" style="padding:12px 18px;gap:6px"><div style="font-size:22px;font-weight:800">٢. لماذا نتج 48 L فقط من بخار الماء وليس 72 L؟</div>${optsHTML([{t:'لأن عدد مولات الغاز يتغير: 3 mol تعطي 2 mol'},{t:'لأن جزءاً من الأكسجين تسرّب'},{t:'لأن الحجم يجب أن يبقى ثابتاً، فالنتيجة خطأ'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الحجم يتبع <b>عدد المولات</b> لا الحجم الأصلي: 2 + 1 = 3 mol تعطي 2 mol، أي 72 L تعطي 48 L.</div></div></div>`;},
 init:function(el){
  var run=$('#srun',el);
  run.addEventListener('click',function(){
   run.disabled=true; $$('.mol',el).forEach(function(m){m.classList.add('gone')}); later(function(){ $$('.prod',el).forEach(function(p){p.classList.add('on')}); $('#sbars',el).classList.add('go'); var s=$('#s1',el); s.classList.remove('hide'); s.classList.add('up') },750);
  });
  bindMcq($('#s1',el),[{t:'',why:'الكتلة المولية شيء آخر'},{t:'',ok:true,why:'صح: الحجم المولي 24 L/mol'},{t:'',why:'ليس 1 L بل حجم 1 mol'}],$('#s1 .fb',el),function(){$('#s1 .opts',el).classList.add('hide'); var s=$('#s2',el); s.classList.remove('hide'); s.classList.add('up')});
  bindMcq($('#s2',el),[{t:'',ok:true,why:'صح: النسبة المولية 2 : 1 : 2 (3 mol تعطي 2 mol)'},{t:'',why:'لم يتسرب شيء؛ قارن عدد المولات قبل التفاعل وبعده'},{t:'',why:'الحجم لا يُحفظ في تفاعلات الغازات، بل تُحفظ الكتلة'}],$('#s2 .fb',el),function(){$('#s2 .opts',el).classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب النشاط تمرين ٣-٥ (أ): 48 L من H₂ مع 24 L من O₂ تعطي 48 L من بخار الماء. الإجابة ١: الحجم المولي هو حجم 1 mol من أي غاز؛ ٢: يعتمد حجم الغاز على عدد مولاته، والنسب المولية 2 : 1 : 2.</li><li>كتاب الطالب ص٦٨ فيه مثال مشابه: 2CO + O₂ → 2CO₂ (72 L ثم 48 L).</li><li>انتبه: الكتلة تُحفظ دائماً، أما الحجم الكلي فقد يتغير.</li></ul>'});

/* 14 a block of the reaction matrix: a header of species and two rows of volumes */
function mxBlock(sp,ops,rows){
  var n=sp.length, cols=[], h, i;
  for(i=0;i<n;i++){ cols.push('minmax(0,1fr)'); if(i<n-1) cols.push('30px') }
  h='<div class="mx" style="grid-template-columns:'+cols.join(' ')+'">';
  sp.forEach(function(s,i){ h+='<div class="mh bigeq">'+s+'</div>'+(i<n-1?'<div class="mop">'+ops[i]+'</div>':'') });
  rows.forEach(function(r){ r.forEach(function(c,i){ h+='<div class="mc">'+c+'</div>'+(i<n-1?'<div class="mop"></div>':'') }) });
  return h+'</div>';
}
function mv(t){return '<span class="num mv">'+t+'</span>'}
slide({id:'matrix',ch:3,title:'نسبة الحجوم في ثلاث معادلات',tag:'تمرين ٣-٥ (ب)',
 html:function(){return `<div class="col grow" style="gap:6px;justify-content:center">
  <div class="sm" style="font-size:20px;text-align:center;color:var(--muted)">التجارب تبيّن أن الغازات تتفاعل بحجوم نسبتها كنسبة المعادلة. أكمل الأحجام الناقصة.</div>
  ${mxBlock(['H<sub>2</sub>(g)','Cl<sub>2</sub>(g)','2HCl(g)'],['+','→'],[[mv('24 L'),mv('24 L'),nin('m1','L')],[nin('m2','mL'),nin('m3','mL'),mv('30 mL')]])}
  ${mxBlock(['2CO(g)','O<sub>2</sub>(g)','2CO<sub>2</sub>(g)'],['+','→'],[[mv('200 mL'),mv('100 mL'),nin('m4','mL')],[nin('m5','L'),nin('m6','L'),mv('12 L')]])}
  ${mxBlock(['C<sub>3</sub>H<sub>8</sub>(g)','5O<sub>2</sub>(g)','3CO<sub>2</sub>(g)','4H<sub>2</sub>O(g)'],['+','→','+'],[[mv('15 mL'),nin('m7','mL'),mv('45 mL'),nin('m8','mL')],[nin('m9','L'),nin('m10','L'),mv('12 L'),nin('m11','L')]])}
  <div class="fb" style="text-align:center;min-height:24px"></div>
  <div class="gbar hide" id="gb" style="font-size:20px">في كل معادلة: نسبة الحجوم = نسبة المعاملات. النسبة نفسها بالـ mL أو بالـ L.</div></div>`;},
 init:function(el){
  var A=[['m1',48,'✓ النسبة 1 : 1 : 2 فالناتج 2 × 24 = 48 L'],['m2',15,'✓ HCl = 30 mL فكل من H₂ وCl₂ نصفه = 15 mL'],['m3',15,'✓ 15 mL (النسبة 1 : 1)'],['m4',200,'✓ 2CO تعطي 2CO₂ بالحجم نفسه = 200 mL'],['m5',12,'✓ CO بحجم CO₂ نفسه = 12 L'],['m6',6,'✓ O₂ نصف حجم CO₂ = 6 L'],['m7',75,'✓ 15 × 5 = 75 mL من O₂'],['m8',60,'✓ 15 × 4 = 60 mL من H₂O'],['m9',4,'✓ 12 ÷ 3 = 4 L من C₃H₈'],['m10',20,'✓ 4 × 5 = 20 L من O₂'],['m11',16,'✓ 4 × 4 = 16 L من H₂O']];
  bindAll(el,A.map(function(a){return {n:a[0],a:a[1],t:a[1]*0.01,w:a[2],h:'قارن المعاملات: الحجوم بنسبة المعاملات'}}),$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب النشاط تمرين ٣-٥ (ب): ١) 48 L، 15 mL، 15 mL. ٢) 200 mL، 12 L، 6 L. ٣) 75 mL، 60 mL، 4 L، 20 L، 16 L (معادلة C₃H₈ + 5O₂ → 3CO₂ + 4H₂O).</li><li>الخانات مستقلة: يمكنهم البدء من أي معادلة. اطلب منهم كتابة النسبة قبل الحساب.</li></ul>'});

/* 15 question 3-14 */
slide({id:'q314',ch:3,title:'سؤال ٣-١٤: احسب حجوم الغازات',tag:'احسب',
 html:function(){
  var C=[['أ','2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(g)','معطى: <b class="num">2 L</b> من H<sub>2</sub>',[['a1','L','O₂ ='],['a2','L','H₂O =']]],
         ['ب','C<sub>5</sub>H<sub>12</sub>(g) + 8O<sub>2</sub>(g) → 5CO<sub>2</sub>(g) + 6H<sub>2</sub>O(g)','معطى: <b class="num">10 mL</b> من C<sub>5</sub>H<sub>12</sub>',[['b1','mL','O₂ ='],['b2','mL','CO₂ ='],['b3','mL','H₂O =']]],
         ['ج','2C<sub>2</sub>H<sub>6</sub>(g) + 7O<sub>2</sub>(g) → 4CO<sub>2</sub>(g) + 6H<sub>2</sub>O(g)','معطى: <b class="num">15 mL</b> من O<sub>2</sub>',[['c1','mL','C₂H₆ ='],['c2','mL','CO₂ ='],['c3','mL','H₂O =']]]];
  return `<div class="col grow" style="gap:8px;justify-content:center">
  ${C.map(function(c){return `<div class="frm brk" style="padding:10px 18px;gap:6px"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span style="font-size:24px;font-weight:800;color:var(--cyan)">${c[0]}</span><span class="bigeq" style="font-size:28px;color:var(--gold)">${c[1]}</span><span style="font-size:21px">${c[2]}</span></div>
    <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center">${c[3].map(function(b){return '<span style="display:flex;align-items:center;gap:8px"><span class="ql" style="font-size:21px;color:var(--muted);font-weight:700">'+b[2]+'</span>'+nin(b[0],b[1])+'</span>'}).join('')}</div></div>`}).join('')}
  <div class="fb" style="text-align:center;min-height:24px"></div>
  <div class="gbar hide" id="gb" style="font-size:20px">اقسم على معامل المعطى ثم اضرب في معامل المطلوب: <b>الحجم المطلوب = المعطى × (معامله ÷ معامل المعطى)</b></div></div>`;},
 init:function(el){
  var A=[['a1',1,'✓ 2 ÷ 2 × 1 = 1 L'],['a2',2,'✓ 2 ÷ 2 × 2 = 2 L'],['b1',80,'✓ 10 × 8 = 80 mL'],['b2',50,'✓ 10 × 5 = 50 mL'],['b3',60,'✓ 10 × 6 = 60 mL'],['c1',15*2/7,'✓ 15 ÷ 7 × 2 = 4.29 mL'],['c2',15*4/7,'✓ 15 ÷ 7 × 4 = 8.57 mL'],['c3',15*6/7,'✓ 15 ÷ 7 × 6 = 12.86 mL']];
  bindAll(el,A.map(function(a){return {n:a[0],a:a[1],t:Math.max(a[1]*0.01,0.03),w:a[2],h:'اقسم على معامل المعطى ثم اضرب في معامل المطلوب'}}),$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب الطالب سؤال ٣-١٤، وإجاباته في عرضك القديم (شريحة «إجابات ص٦٩»): أ) O₂ = 1 L و H₂O = 2 L. ب) 80 و 50 و 60 mL. ج) 4.29 و 8.57 و 12.86 mL.</li><li>في (ج) المعطى هو O₂، ولذلك نقسم على 7 أولاً.</li></ul>'});

/* 16 a limiting gas: NO with O2 (activity book exercise 3-5 c and a 2025/2026 exam item) */
slide({id:'challenge',ch:3,title:'التحدي: أي الغازين فائض؟',tag:'تمرين ٣-٥ (ج)',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:560px;flex:none;gap:10px;justify-content:flex-start">
   <div class="frm brk" style="padding:12px 20px;gap:8px"><div class="bigeq" style="font-size:34px;color:var(--gold);text-align:center">2NO(g) + O<sub>2</sub>(g) → 2NO<sub>2</sub>(g)</div>
    <p class="lead" style="margin:0;font-size:23px">خُلط كيميائياً <b class="num" style="color:var(--gold)">80 mL</b> من NO مع <b class="num" style="color:var(--gold)">30 mL</b> من O<sub>2</sub>. أي الغازين <b>فائض</b> في التفاعل؟</p>
    ${optsHTML([{t:'أحادي أكسيد النيتروجين NO'},{t:'الأكسجين O₂'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="panel hide" id="qn" style="padding:10px 18px;gap:8px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:23px;font-weight:700">أقصى حجم من NO<sub>2</sub> =</span>${nin('n1','mL')}</div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:23px;font-weight:700">حجم الغاز الذي لم يتفاعل =</span>${nin('n2','mL')}</div><div class="fb fq" style="min-height:24px"></div></div></div>
  <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
   <div class="panel" style="padding:12px 20px;gap:8px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">كم يلزم من كل غاز؟ النسبة 2 : 1 : 2</div>
    ${barsHTML('cbars',[{lab:'NO',parts:[[60,'used','يتفاعل 60 mL'],[20,'left','يبقى 20 mL']]},{lab:'O₂',parts:[[30,'used','يتفاعل 30 mL']]},{lab:'NO₂',parts:[[60,'made','يتكوّن 60 mL']]}],80)}</div>
   <div class="hide" id="defs" style="display:flex;gap:12px"><div class="defc gold"><b>المحدد</b><span>الأكسجين: ينتهي أولاً (30 mL تحتاج 60 mL من NO).</span></div><div class="defc blue"><b>الفائض</b><span>NO: يبقى منه 20 mL.</span></div></div></div></div>`;},
 init:function(el){
  var bars=$('#cbars',el);
  bindMcq($('.frm',el),[{t:'',ok:true,why:'صح: 30 mL من O₂ تحتاج 60 mL فقط من NO، ولدينا 80 mL'},{t:'',why:'O₂ يحتاج 2 × 30 = 60 mL من NO وهو متوفر؛ فالفائض هو الآخر'}],$('.frm .fb',el),function(){
   $('.frm .opts',el).classList.add('hide'); bars.classList.add('go'); var q=$('#qn',el); q.classList.remove('hide'); q.classList.add('up');
  });
  bindSeq(el,[{n:'n1',a:60,t:0.6,w:'✓ 30 × 2 = 60 mL من NO₂ (يحددها O₂)',h:'O₂ هو المحدد: 30 mL × 2'},{n:'n2',a:20,t:0.2,w:'✓ 80 − 60 = 20 mL من NO لم يتفاعل',h:'80 mL − ما تفاعل من NO'}],$('.fq',el),function(){var d=$('#defs',el); d.classList.remove('hide'); d.classList.add('up')});
 },
 note:'<ul><li>كتاب النشاط تمرين ٣-٥ (ج): ١) NO هو الفائض لأن 30 mL من O₂ تحتاج 60 mL فقط. ٢) أقصى حجم NO₂ = 60 mL. ٣) الذي لم يتفاعل 20 mL من NO.</li><li>سؤال مشابه في امتحان ٢٠٢٥/٢٠٢٦ الدور الأول (سؤال ٢٣): 25 mL من CO و10 mL من O₂ تعطي 20 mL من CO₂، فالباقي 25 − 20 = 5 mL من CO. سنراه في أسئلة الامتحانات.</li><li>نفس فكرة المحدد والفائض من الدرس ٣-٣ لكن بالحجوم.</li></ul>'});
