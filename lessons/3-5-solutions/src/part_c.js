/* ---------- solutions, part C: the molar concentration, mol/L (book pages 70-71, examples 3-8, question 3-17, exercise 3-6) ---------- */

/* 8 the molar concentration: the triangle */
slide({id:'cm',ch:2,title:'التركيز المولي: المثلث',tag:'اضغط على كل زاوية',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:400px;flex:none;align-items:center;justify-content:center;gap:10px">
   ${triSVG('n (mol)','C (mol/L)','V (L)',{cv:1,w:340})}
   <div class="sm" style="font-size:20px;text-align:center">n عدد المولات ، C التركيز المولي ، V الحجم باللتر</div></div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:14px 22px;gap:6px;align-items:center;min-height:130px;justify-content:center"><div class="bigeq" id="tf" style="font-size:44px;color:var(--gold)">؟</div><div class="sm" id="tfd" style="font-size:21px;text-align:center"> </div></div>
   <div class="panel" style="padding:10px 18px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">وقبل ذلك من الدرس ٣-٢:</div><div class="bigeq" style="font-size:30px;text-align:start;color:var(--gold)">n = m ÷ M<sub>r</sub></div></div>
   <div class="panel hide" id="mq" style="padding:10px 18px;gap:5px"><div style="font-size:21px;font-weight:800">محلول من NaOH تركيزه <span class="num">1 mol/L</span>. كم غراماً من NaOH في كل لتر؟ (Na = 23 ، O = 16 ، H = 1)</div>${optsHTML([{t:'1 g'},{t:'40 g'},{t:'23 g'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:8px"')}<div class="fb" style="min-height:22px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">التركيز المولي هو <b>عدد المولات في كل لتر</b>: 1 mol/L من NaOH = 40 g/L.</div></div></div>`;},
 init:function(el){
  var T={t:['n = C × V','عدد المولات = التركيز المولي × الحجم'],l:['C = n ÷ V','التركيز المولي (mol/L) = عدد المولات ÷ الحجم (L)'],r:['V = n ÷ C','الحجم = عدد المولات ÷ التركيز']}, seen={};
  $$('.cv',el).forEach(function(g){g.addEventListener('click',function(){
   var k=g.getAttribute('data-k'); $$('.cv',el).forEach(function(x){x.classList.toggle('hid',x===g)});
   $('#tf',el).innerHTML=T[k][0]; $('#tfd',el).textContent=T[k][1]; seen[k]=1;
   if(Object.keys(seen).length===3){var b=$('#mq',el); b.classList.remove('hide'); b.classList.add('up')}
  })});
  bindMcq($('#mq',el),[{t:'',why:'1 mol من NaOH كتلتها ليست 1 g'},{t:'',ok:true,why:'صح: M = 23 + 16 + 1 = 40 g/mol'},{t:'',why:'23 هي كتلة mol من Na فقط'}],$('#mq .fb',el),function(){$('#mq .opts',el).classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب الطالب ص٧٠: التركيز المولي (mol/L) = عدد المولات (mol) ÷ الحجم (L). يُفضَّل في حسابات التفاعل التعامل مع عدد المولات في المحلول بدلاً من الكتلة.</li><li>المثلث هو شكل الدائرتين في عرض NotebookLM (شريحة ٦): M = n ÷ V و n = M × V و n = m ÷ Mr.</li><li>الفرق بين التركيزين: تركيز الكتلة بالجرام لكل لتر g/L، والمولي بالمول لكل لتر mol/L (الكتلة المولية تربط بينهما).</li></ul>'});

/* 9 example 3-8 */
chainSlide({id:'ex38',ch:2,title:'مثال ٣-٨: التركيز المولي من الكتلة',
 eq:'C = n ÷ V',eqSize:46,data:'احسب التركيز المولي (mol/L) لمحلول من NaOH يحتوي على <b class="num">100 g</b> من NaOH في حجم نهائي <b class="num">2500 mL</b>.<br><span class="num">Na = 23 ، O = 16 ، H = 1</span>',
 labels:['المعطى','V بالـ L','n (mol)','C (mol/L)'],first:'m = 100 g<br>V = 2500 mL',
 steps:[{n:'e1',q:'حوّل الحجم إلى L',u:'L',lab:'V =',a:2.5,t:0.03,w:'✓ 2500 ÷ 1000 = 2.5 L',h:'mL ÷ 1000 = L',fill:'2.5 L'},{n:'e2',q:'n = m ÷ M<sub>r</sub>',u:'mol',lab:'n =',a:2.5,t:0.03,w:'✓ M = 40 ← 100 ÷ 40 = 2.5 mol',h:'M(NaOH) = 23 + 16 + 1 = 40',fill:'2.5 mol'},{n:'e3',q:'C = n ÷ V',u:'mol/L',lab:'C =',a:1,t:0.01,w:'✓ 2.5 ÷ 2.5 = 1 mol/L',h:'اقسم عدد المولات على الحجم باللتر',fill:'1 mol/L'}],
 side:'<div class="col" style="align-items:center">'+triSVG('2.5 mol','C = ؟','2.5 L',{w:290})+'</div>',
 gbar:'التركيز <b>1 mol/L</b>. ولو سألنا عن تركيز الكتلة: 100 ÷ 2.5 = 40 g/L.',
 note:'<ul><li>مثال ٣-٨ في كتاب الطالب (ص٧١): V = 2.5 L، n = 100 ÷ 40 = 2.5 mol، C = 1 mol/L. المثال ١٩ في كراسة الأمثلة.</li><li>ملاحظة: الأمثلة مطروحة بطريقة المثلث، ويمكن دمج الخطوات.</li></ul>'});

/* 10 n = C x V */
chainSlide({id:'ncv',ch:2,title:'عدد المولات من التركيز والحجم',
 eq:'n = C × V',eqSize:46,data:'كم عدد المولات في <b class="num">500 mL</b> من محلول السكر تركيزه <b class="num">3.0 mol/L</b>؟',
 labels:['المعطى','V بالـ L','n (mol)'],first:'C = 3.0 mol/L<br>V = 500 mL',
 steps:[{n:'e1',q:'حوّل الحجم إلى L',u:'L',lab:'V =',a:0.5,t:0.005,w:'✓ 500 ÷ 1000 = 0.5 L',h:'mL ÷ 1000 = L',fill:'0.5 L'},{n:'e2',q:'n = C × V',u:'mol',lab:'n =',a:1.5,t:0.02,w:'✓ 3.0 × 0.5 = 1.5 mol',h:'اضرب التركيز في الحجم باللتر',fill:'1.5 mol'}],
 side:'<div class="col" style="align-items:center">'+triSVG('n = ؟','3.0 mol/L','0.5 L',{w:290})+'</div>',
 gbar:'<b>n = C × V</b>: نستخدمها لنعرف كم مولاً من المذاب في أي حجم من المحلول.',
 note:'<ul><li>كتاب الطالب ص٧٠: مثال عدد مولات السكر في 500 mL تركيزه 3.0 mol/L = 1.5 mol.</li><li>هذه العلاقة هي أساس حسابات المعايرة: نحوّل حجم وتركيز المحلول المعلوم إلى مولات.</li></ul>'});

/* 11 question 3-17 */
rowsSlide({id:'q317',ch:2,title:'سؤال ٣-١٧: احسب التركيز المولي',
 intro:'احسب التركيز المولي (mol/L) لكل من المحاليل الآتية. <span class="num">Na = 23 ، O = 16 ، H = 1 ، Cl = 35.5 ، N = 14</span>',
 rows:[{n:'a',q:'أ. 1 mol من NaOH في 500 mL من المحلول',u:'mol/L',lab:'C =',a:2,t:0.02,w:'✓ 500 mL = 0.5 L ← 1 ÷ 0.5 = 2 mol/L',h:'حوّل 500 mL إلى L'},{n:'b',q:'ب. 0.2 mol من NaCl في 1000 mL من المحلول',u:'mol/L',lab:'C =',a:0.2,t:0.002,w:'✓ 1000 mL = 1 L ← 0.2 ÷ 1 = 0.2 mol/L',h:'حوّل 1000 mL إلى L'},{n:'c',q:'ج. 0.1 mol من NaNO<sub>3</sub> في 100 mL من المحلول',u:'mol/L',lab:'C =',a:1,t:0.01,w:'✓ 100 mL = 0.1 L ← 0.1 ÷ 0.1 = 1 mol/L',h:'حوّل 100 mL إلى L'},{n:'d',q:'د. 0.8 g من NaOH الصلب في محلول حجمه النهائي 1 L',u:'mol/L',lab:'C =',a:0.02,t:0.0003,w:'✓ n = 0.8 ÷ 40 = 0.02 mol ← 0.02 ÷ 1 = 0.02 mol/L',h:'n = m ÷ M ثم C = n ÷ V'}],
 side:'<div class="col" style="align-items:center">'+triSVG('n (mol)','C = ؟','V (L)',{w:270})+'</div>',
 gbar:'في (د) نبدأ بتحويل الكتلة إلى مولات: <b>n = m ÷ M<sub>r</sub></b> ثم نقسم على الحجم.',
 note:'<ul><li>كتاب الطالب سؤال ٣-١٧ (ص٧٦). الإجابات: ٢ و٠٫٢ و١ و٠٫٠٢ mol/L.</li><li><b>تصحيح:</b> في عرض NotebookLM (شريحة ٧) الجزء (د) مكتوب «0.8 g في 100 mL» فتصبح إجابته 0.2 mol/L، لكن الكتاب يقول إن الحجم النهائي <b>1 L</b> والإجابة <b>0.02 mol/L</b> فاعتمدت الكتاب. (إذا كانت طبعتكم تقول 100 mL فالإجابة 0.2.)</li></ul>'});

/* 12 exercise 3-6: the six rows */
slide({id:'ex36',ch:2,title:'تمرين ٣-٦: أكمل الجدول',tag:'كتاب النشاط',
 html:function(){
  var R=[['كلوريد الصوديوم','NaCl','0.5','1 L',['t1','mol']],['حمض الهيدروكلوريك','HCl','0.5','500 mL',['t2','mol']],['هيدروكسيد الصوديوم','NaOH',['t3','mol/L'],'2 L','1'],['حمض الكبريتيك','H<sub>2</sub>SO<sub>4</sub>',['t4','mol/L'],'250 mL','0.5'],['ثيوكبريتات الصوديوم','Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>','2',['t5','L'],'0.4'],['كبريتات النحاس (II)','CuSO<sub>4</sub>','0.1',['t6','L'],'0.75']];
  function cell(c){return Array.isArray(c)?nin(c[0],c[1]):'<span class="num">'+c+'</span>'}
  return `<div class="col grow" style="gap:6px;justify-content:center">
   <div class="sm" style="font-size:20px;text-align:center;color:var(--muted)">املأ الخانات الناقصة مستعيناً بالمثلث: n = C × V (الحجم باللتر).</div>
   <table class="mtab"><thead><tr><th>المذاب</th><th>التركيز (mol/L)</th><th>الحجم</th><th>عدد المولات (mol)</th></tr></thead><tbody>
   ${R.map(function(r){return `<tr><td style="text-align:start">${r[0]} <span class="num fmla">${r[1]}</span></td><td>${cell(r[2])}</td><td>${cell(r[3])}</td><td>${cell(r[4])}</td></tr>`}).join('')}</tbody></table>
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">ثلاث صيغ للعلاقة: <b>n = C × V</b> ، <b>C = n ÷ V</b> ، <b>V = n ÷ C</b>.</div></div>`;},
 init:function(el){
  bindAll(el,[{n:'t1',a:0.5,t:0.005,w:'✓ 0.5 × 1 = 0.5 mol',h:'n = C × V'},{n:'t2',a:0.25,t:0.003,w:'✓ 500 mL = 0.5 L ← 0.5 × 0.5 = 0.25 mol',h:'حوّل 500 mL إلى L ثم n = C × V'},{n:'t3',a:0.5,t:0.005,w:'✓ 1 ÷ 2 = 0.5 mol/L',h:'C = n ÷ V'},{n:'t4',a:2,t:0.02,w:'✓ 250 mL = 0.25 L ← 0.5 ÷ 0.25 = 2 mol/L',h:'حوّل 250 mL إلى L ثم C = n ÷ V'},{n:'t5',a:0.2,t:0.003,w:'✓ 0.4 ÷ 2 = 0.2 L (200 mL)',h:'V = n ÷ C'},{n:'t6',a:7.5,t:0.08,w:'✓ 0.75 ÷ 0.1 = 7.5 L',h:'V = n ÷ C'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب النشاط تمرين ٣-٦ (ص٤٤): الإجابات: ٠٫٥ mol، ٠٫٢٥ mol، ٠٫٥ mol/L، ٢ mol/L، ٠٫٢ L، ٧٫٥ L.</li><li>الدليل: «هذا التمرين يساعد على تطوير فهمك لفكرة المول وتطبيقها لحساب تراكيز المحاليل». الجزء (ب) (حمض الستريك) في شريحة لاحقة.</li></ul>'});

/* 13 ticket 2 */
(function(){
  var items=[
   {type:'num',q:'كم mol من المذاب في <span class="num">250 mL</span> من محلول تركيزه <span class="num">0.4 mol/L</span>؟',unit:'mol',ans:0.1,tol:0.002,why:'V = 0.25 L ← n = 0.4 × 0.25 = 0.1 mol',hint:'n = C × V (الحجم باللتر)'},
   {type:'num',q:'ما التركيز المولي لمحلول فيه <span class="num">0.05 mol</span> في <span class="num">200 mL</span>؟',unit:'mol/L',ans:0.25,tol:0.003,why:'V = 0.2 L ← 0.05 ÷ 0.2 = 0.25 mol/L',hint:'C = n ÷ V'},
   {type:'num',q:'أُذيب <span class="num">4 g</span> من NaOH في ماء ليصبح الحجم <span class="num">500 mL</span>. ما التركيز المولي؟ (M = 40 g/mol)',unit:'mol/L',ans:0.2,tol:0.003,why:'n = 4 ÷ 40 = 0.1 mol ← 0.1 ÷ 0.5 = 0.2 mol/L',hint:'n = m ÷ M ثم C = n ÷ V'},
   {q:'محلول NaOH تركيزه <span class="num">2 mol/L</span>. العبارة الصحيحة:',opts:[{t:'كل لتر منه يحتوي 2 mol (80 g) من NaOH',ok:true,why:'2 mol × 40 g/mol = 80 g في كل لتر'},{t:'كل لتر منه يحتوي 2 g'},{t:'كل 2 L منه تحتوي 1 mol'}]}
  ];
  slide({id:'tk2',ch:2,title:'تذكرة خروج (٢): التركيز المولي',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk2')},
   note:'<ul><li>الإجابات: ٠٫١ mol، ٠٫٢٥ mol/L، ٠٫٢ mol/L، كل لتر يحتوي 2 mol (80 g).</li></ul>'});
})();
