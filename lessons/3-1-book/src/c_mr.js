/* ---------- relative formula / molecular mass Mr (book pp. 55-56) ---------- */

/* 12 Mr: formula mass and molecular mass (book p. 55, scientific terms) */
slide({id:'types',ch:3,title:'كتلة الصيغة النسبية والكتلة الجزيئية النسبية',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div style="display:flex;gap:16px">'+
  '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh">مركّب أيوني: كتلة الصيغة النسبية</div><div style="height:200px"><img class="pic fill" src="'+IMG.lattice+'" alt="شبكة أيونية"></div><div class="panel" style="margin:12px;padding:12px 16px"><p style="font-size:23px;line-height:1.5">تُؤخذ الصيغة (وحدة الصيغة) وحدةً أساسية، ونجمع كتل الذرّات أو الأيونات الموجودة فيها. مثل NaCl.</p></div></div>'+
  '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh">مادة من جُزيئات: الكتلة الجزيئية النسبية</div><div style="height:200px"><img class="pic fill" src="'+IMG.mol+'" alt="نموذج جزيء"></div><div class="panel" style="margin:12px;padding:12px 16px"><p style="font-size:23px;line-height:1.5">العناصر والمركّبات التساهمية التي تتكوّن من جُزيئات: نجمع كتل الذرّات الموجودة في الجُزيء. مثل H<sub>2</sub> وH<sub>2</sub>O.</p></div></div></div>'+
  '<div class="gbar">في الحالتين: M<sub>r</sub> = <b>حاصل جمع الكتل الذرّية النسبية</b> للعناصر الموجودة في الصيغة</div></div>';},
 note:'<ul><li>كتاب الطالب ص٥٥ (المصطلحات العلمية): كتلة الصيغة النسبية (Mr) هي حاصل جمع الكتل الذرّية النسبية للعناصر الموجودة في الصيغة الكيميائية للمادة. والكتلة الجزيئية النسبية (Mr) هي حاصل جمع الكتل الذرّية النسبية للعناصر الموجودة في جُزيء المادة أو في وحدة الصيغة.</li><li>الرمز واحد (Mr) في الحالتين. التطبيق في الشرائح التالية.</li></ul>'});

/* 13 Mr workshop: counting from a formula */
(function(){
  var C=[{f:'H<sub>2</sub>',name:'هيدروجين',parts:[['H',2]],mr:2,sum:'٢ × ١ = ٢'},{f:'H<sub>2</sub>O',name:'ماء',parts:[['H',2],['O',1]],mr:18,sum:'٢ + ١٦ = ١٨'},{f:'NaCl',name:'كلوريد الصوديوم',parts:[['Na',1],['Cl',1]],mr:58.5,sum:'٢٣ + ٣٥٫٥ = ٥٨٫٥'}];
  slide({id:'mr',ch:3,title:'كتلة الصيغة النسبية Mr: ورشة حساب',tag:'ورشة حساب',
   html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div class="panel flat" style="padding:12px 20px"><p style="font-size:24px;line-height:1.5"><b>M<sub>r</sub></b> = مجموع الكتل الذرية النسبية Ar لكل الذرات في الصيغة. اعدّ الذرات أولاً، ثم اضرب في Ar واجمع.</p></div><div style="display:flex;gap:14px;flex:1">'+C.map(function(c,i){return mrCardHTML(c,i,true)}).join('')+'</div></div>'+arSide(['H','O','Na','Cl','C','N','Mg','Ca']);},
   init:function(el){ $$('.mrc',el).forEach(function(c,i){bindMrCard(c,C[i])}) },
   note:'<ul><li>كتاب الطالب ص٥٥: H₂ ← M<sub>r</sub> = ٢ × ١ = ٢ · H₂O ← (٢ × ١) + ١٦ = ١٨ · NaCl ← ٢٣ + ٣٥٫٥ = ٥٨٫٥. الطالب يكتب عدد كل ذرة ثم المجموع.</li><li>الجزيء ← «الكتلة الجزيئية النسبية»، والمركب الأيوني (NaCl) ← «كتلة الصيغة النسبية»، وكلاهما M<sub>r</sub>.</li></ul>'});
})();

/* 14 simple compounds: CO2 and CaCO3 (Table 3-3) */
(function(){
  var C=[{f:'CO<sub>2</sub>',name:'ثاني أكسيد الكربون',parts:[['C',1],['O',2]],mr:44},{f:'CaCO<sub>3</sub>',name:'كربونات الكالسيوم',parts:[['Ca',1],['C',1],['O',3]],mr:100,note:'(أيون Ca²⁺ واحد، وأيون CO₃²⁻ واحد)'}];
  slide({id:'mr2',ch:3,cls:'roomy',title:'حساب Mr: مركبات بسيطة',tag:'أكمل الحساب',
   html:function(){return '<div class="col grow" style="gap:16px;justify-content:center">'+C.map(function(c,i){return flowBlock(c,i,'prod')}).join('')+'</div>'},
   init:function(el){bindFlow(el,C,'prod')},
   note:'<ul><li>كتاب الطالب ص٥٦، الجدول ٣-٣: CO₂ = ٤٤، CaCO₃ = ١٠٠. الطالب يحسب كل ناتج ثم المجموع.</li><li>تمرين كتاب النشاط ٣-١ (ب) في الشرائح الأخيرة يكرر العدّ والحساب على ثماني مواد.</li></ul>'});
})();

/* 15 brackets and dots: (NH4)2SO4 and MgSO4.7H2O (Table 3-3) */
(function(){
  var C=[{f:'<span class="seg" data-r="paren">(NH<sub>4</sub>)<sub>2</sub></span>SO<sub>4</sub>',name:'كبريتات الأمونيوم',parts:[['N',2],['H',8],['S',1],['O',4]],mr:132,note:'(أيونان NH₄⁺ وأيون SO₄²⁻ واحد)'},
         {f:'MgSO<sub>4</sub><span class="seg" data-r="dot">·7H<sub>2</sub>O</span>',name:'كبريتات الماغنيسيوم المميهة',parts:[['Mg',1],['S',1],['O',4,'من SO₄'],['H',14],['O',7,'من 7H₂O']],mr:246}];
  slide({id:'mr3',ch:3,title:'حساب Mr: مركبات معقدة',tag:'اعدّ ثم احسب',
   html:function(){return '<div class="col grow" style="gap:8px;justify-content:flex-start"><div style="display:flex;gap:12px">'+
     '<div class="rule" data-r="paren" style="flex:1;padding:6px 12px;font-size:19px"><i style="width:40px;height:40px;font-size:20px">( )</i><div>العدد ٢ خارج القوسين <b>يضاعف</b> كل ما بداخلهما</div></div>'+
     '<div class="rule" data-r="dot" style="flex:1;padding:6px 12px;font-size:19px"><i style="width:40px;height:40px;font-size:20px">·7</i><div>الرقم ٧ قبل H<sub>2</sub>O يعني <b>٧ جزيئات ماء</b></div></div></div>'+
     C.map(function(c,i){return flowBlock(c,i,'count')}).join('')+'</div>'},
   init:function(el){
    bindFlow(el,C,'count');
    $$('.rule',el).forEach(function(r){r.addEventListener('click',function(){
      var on=!r.classList.contains('on'); $$('.rule',el).forEach(function(x){x.classList.remove('on')}); $$('.seg',el).forEach(function(s){s.classList.remove('hl')});
      if(on){r.classList.add('on'); $$('.seg[data-r="'+r.getAttribute('data-r')+'"]',el).forEach(function(s){s.classList.add('hl')})}
    })});
   },
   note:'<ul><li>كتاب الطالب ص٥٦، الجدول ٣-٣ وصندوق «تذكّر»: (NH₄)₂SO₄ = ١٣٢ (العدد ٢ خارج القوسين يضاعف ما في القوسين: ٢N و٨H)، وMgSO₄·٧H₂O = ٢٤٦ (العدد ٧ قبل H₂O يعني سبع جُزيئات ماء: ١٤H و٧O).</li><li>القوس والنقطة هما الصعوبة. اضغط على القاعدة لتظليل الجزء في الصيغة.</li></ul>'});
})();

/* 18 exit ticket 2 */
(function(){
  var items=[
   {type:'num',q:'احسب M<sub>r</sub> لهيدروكسيد الكالسيوم Ca(OH)<sub>2</sub> (Ca = 40, O = 16, H = 1)',ans:74,tol:0.01,why:'٤٠ + ٢×(١٦+١) = ٧٤',hint:'القوس: ٢ × (O + H)'},
   {q:'كم ذرة أكسجين في الصيغة Mg(NO<sub>3</sub>)<sub>2</sub>؟',opts:[{t:'2'},{t:'3'},{t:'6',ok:true,why:'٣ × ٢ = ٦ (العدد ٢ يضاعف ما داخل القوس)'},{t:'8'}]},
   {q:'أي مادة نستخدم لها عادةً «كتلة الصيغة النسبية» (مركب أيوني)؟',opts:[{t:'H<sub>2</sub>O'},{t:'CO<sub>2</sub>'},{t:'NaCl',ok:true,why:'صح: وحدة صيغة، مو جزيء منفرد'}]}
  ];
  slide({id:'tk2',ch:3,title:'تذكرة خروج ٢: كتلة الصيغة النسبية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk2')},
   note:'<ul><li>الإجابات: ٧٤، ٦، NaCl.</li><li>الأسئلة من إعدادي: ١ القوس في Ca(OH)₂، ٢ عدّ ذرات O في Mg(NO₃)₂ (٣ × ٢ = ٦)، ٣ متى نقول كتلة الصيغة النسبية (مركب أيوني). تغطي هدف ٣-٨ في دليل المعلم.</li></ul>'});
})();
