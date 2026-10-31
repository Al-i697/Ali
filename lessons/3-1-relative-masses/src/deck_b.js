/* ---------- deck B: practice, table, isotopes, chlorine, molecules vs ionic, Mr flows ---------- */

/* 9 Question 3-2 and the phosphorus exercise */
slide({id:'q32',ch:2,title:'كم مرة أثقل من الهيدروجين؟',tag:'تمرين',
 html:function(){
  var rows=[['ذرة الهيليوم He','6.68 × 10<sup>−24</sup> g'],['ذرة الكربون C','1.99 × 10<sup>−23</sup> g'],['ذرة الأكسجين O','2.66 × 10<sup>−23</sup> g'],['ذرة اليورانيوم U','3.97 × 10<sup>−22</sup> g']];
  return '<div class="col grow" style="gap:12px;justify-content:flex-start"><p class="sm muted" style="font-size:21px">متوسط كتلة ذرة H = <span class="num">1.67 × 10<sup>−24</sup></span> g. قرّب إجابتك لأقرب عدد صحيح (السؤال ٣-٢).</p>'+
   rows.map(function(r,i){return '<div class="panel" style="display:flex;align-items:center;gap:18px;padding:12px 22px"><span style="font-size:26px;font-weight:700;width:200px">'+r[0]+'</span><span class="eq" style="font-size:28px;width:250px">'+r[1]+'</span>'+ninHTML('q'+i,'','sm')+'<div class="fb" style="flex:1;min-height:0;font-size:20px"></div></div>'}).join('')+'</div>'+
   '<div class="col" style="width:340px;flex:none;gap:12px"><div class="panel dark" style="padding:20px 22px"><p style="font-size:25px;line-height:1.6">من عرضك:<br>الكتلة الذرية للفسفور <b>٣١</b> ذ.ك.ذ، وللكربون <b>١٢</b>. <b>كم مرة الفسفور أثقل من ذرة الكربون؟</b></p></div>'+ninHTML('p','','')+'<div class="fb" id="pfb"></div></div>';
 },
 init:function(el){
  var rows=[[4,0.5,'٦٫٦٨ ÷ ١٫٦٧ ≈ ٤'],[12,0.6,'١١٫٩ ≈ ١٢'],[16,0.6,'١٥٫٩ ≈ ١٦'],[238,1.5,'٢٣٧٫٧ ≈ ٢٣٨']];
  $$('.panel',el).slice(0,4).forEach(function(p,i){
    var fb=$('.fb',p); bindNum($('.nin',p),rows[i][0],rows[i][1],function(ok){ if(ok) say(fb,'✓ '+rows[i][2],'ok'); else say(fb,'قسّم على ١٫٦٧×١٠⁻٢٤','bad') });
  });
  var fb=$('#pfb',el);
  bindNum($('.nin[data-n="p"]',el),2.58,0.08,function(ok){ if(ok) say(fb,'✓ ٣١ ÷ ١٢ ≈ ٢٫٥٨ مرة','ok'); else say(fb,'قسّم ٣١ على ١٢','bad') });
 },
 note:'<ul><li>إجابات السؤال ٣-٢ في الدليل: He ٤، C ١٢، O ١٦، U ٢٣٨. الفسفور: ٣١ ÷ ١٢ = ٢٫٥٨.</li><li>كتاب الطالب ص٥٨ السؤال ٣-٢: اقسم كتلة كل ذرة على كتلة ذرة الهيدروجين (1.67×10⁻²⁴ g) وقرّب لأقرب عدد صحيح، فتطابق النتائج قيم Ar تقريباً.</li></ul>'});

/* 10 Table 3-2: find the elements whose Ar is not a whole number */
slide({id:'table',ch:2,title:'الجدول ٣-٢: الكتل الذرية النسبية (Ar)',tag:'اضغط على الصفوف',
 html:function(){
  var T=[['الهيدروجين','H',1],['الكربون','C',12],['النيتروجين','N',14],['الأكسجين','O',16],['الفلور','F',19],['الصوديوم','Na',23],['الماغنيسيوم','Mg',24],['الألومنيوم','Al',27],['الكبريت','S',32],['الكلور','Cl',35.5],['الحديد','Fe',56],['النحاس','Cu',63.5]];
  return '<div class="frm brk" style="width:700px;flex:none;padding:10px 14px"><table class="atab"><thead><tr><th>العنصر</th><th>الرمز</th><th>الكتلة الذرية النسبية Ar</th></tr></thead><tbody>'+
   T.map(function(t){return '<tr data-n="'+(t[2]%1?1:0)+'"><td>'+t[0]+'</td><td class="s">'+t[1]+'</td><td class="v">'+t[2]+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="col grow" style="gap:16px;justify-content:center"><p class="lead" style="font-size:28px"><b>اضغط على العناصر اللي كتلتها الذرية النسبية <span class="k">ليست عدداً صحيحاً</span>.</b></p><div class="fb" id="tf" style="min-height:60px;font-size:24px"></div><div class="frm gold hide" id="tn" style="padding:14px 18px"><p style="font-size:25px;line-height:1.6">لماذا؟ لأن لمعظم العناصر <b>نظائر</b>. هذا موضوع الشريحة التالية.</p></div></div>';
 },
 init:function(el){
  var found=0, fb=$('#tf',el);
  $$('tr[data-n]',el).forEach(function(r){r.addEventListener('click',function(){
    if(r.classList.contains('hit')) return;
    if(r.getAttribute('data-n')==='1'){ r.classList.add('hit'); found++; say(fb,found<2?'✓ واحد... في الثاني؟':'✓ الكلور والنحاس','ok'); if(found===2){var n=$('#tn',el); n.classList.remove('hide'); n.classList.add('up')} }
    else { r.classList.add('miss'); later(function(){r.classList.remove('miss')},500); say(fb,'هذا عدد صحيح، جرّب صفاً ثانياً','bad') }
  })});
 },
 note:'<ul><li>عرضك (شريحة ٨). الكلور ٣٥٫٥ والنحاس ٦٣٫٥ فقط ليسا عددين صحيحين، بسبب النظائر.</li><li>كتاب الطالب ص٥٥: الجدول ٣-٢ هو مرجع قيم Ar في كل حسابات الوحدة، وتتكرر القيم نفسها في أسئلة الكتاب وكتاب النشاط.</li></ul>'});

/* 11 isotopes: definition and the formula */
slide({id:'iso',ch:2,title:'النظائر: لماذا ليست الكتل أعداداً صحيحة؟',tag:'اضغط ◂ للكشف',
 html:function(){return '<div style="display:flex;gap:18px;flex:1;align-items:center"><div class="col grow" style="gap:16px;justify-content:center">'+
  '<div class="frm brk" style="padding:24px 28px;gap:14px"><p style="font-size:31px;line-height:1.65"><b style="color:var(--gold)">النظائر:</b> ذرات للعنصر نفسه، تمتلك نفس العدد من البروتونات ولكنها تختلف في عدد النيوترونات.</p>'+
   '<div id="a2" class="hide"><p style="font-size:30px;line-height:1.65;border-top:1.5px solid var(--panel-line);padding-top:14px">لأن معظم العناصر لها نظائر، بالتالي يتم أخذ <span class="k">متوسط الكتلة النسبية</span> لذرات النظائر.</p></div></div>'+
  '<div class="frm brk gold hide" id="fm"><div class="fh">قانون حساب متوسط الكتلة الذرية النسبية</div><div style="padding:22px 20px;font-size:38px;line-height:1.7;text-align:center" class="mf">A<sub>r</sub> = (% × Am<sub>1</sub>X) + (% × Am<sub>2</sub>X) + …</div></div>'+
  '<div style="text-align:center"><button class="btn acc" type="button" id="rv">اكشف السبب والقانون ◂</button></div></div>'+
  '<div style="width:300px;flex:none"><img class="pic fade" src="'+IMG.goals_navy+'" alt="" style="width:330px;max-width:none"></div></div>';},
 init:function(el){
  $('#rv',el).addEventListener('click',function(){ ['#a2','#fm'].forEach(function(s){var e=$(s,el); e.classList.remove('hide'); e.classList.add('up')}); this.classList.add('hide') });
 },
 note:'<ul><li>عرضك (شريحة ٩): تعريف النظائر والقانون Ar = (% × كتلة النظير ١) + (% × كتلة النظير ٢) + …</li><li>اسأل الطلاب أولاً: لماذا ٣٥٫٥؟ ثم اكشف.</li></ul>'});

/* 12 hydrogen isotopes (from the school summary) */
slide({id:'isoH',ch:2,title:'نظائر الهيدروجين',tag:'احسب النيوترونات',
 html:function(){
  var T=[['بروتيوم',1,0],['ديوتيريوم',2,1],['تريتيوم',3,2]];
  return '<div class="col grow" style="gap:14px;justify-content:flex-start"><div class="panel flat" style="padding:10px 22px"><p style="font-size:23px;line-height:1.45"><b>العدد الكتلي</b> = عدد البروتونات + عدد النيوترونات. كلها هيدروجين لأن <span class="k">عدد البروتونات = ١</span>، لكن عدد النيوترونات يختلف.</p></div>'+
   '<div style="display:flex;gap:16px">'+T.map(function(t,i){
     return '<div class="mod" data-i="'+i+'" style="gap:4px;padding:8px 14px"><h3 style="margin:0;font-family:var(--font-display);font-size:28px;color:var(--gold)">'+t[0]+'</h3>'+
      '<div class="eq" style="font-size:50px;line-height:1;position:relative;padding-inline-start:24px"><span style="position:absolute;inset-inline-start:0;top:2px;font-size:26px;line-height:1">'+t[1]+'<br><span style="position:relative;top:6px">1</span></span>H</div>'+
      '<svg viewBox="0 0 160 90" width="104" height="59" aria-hidden="true"><g class="nu"></g></svg>'+
      '<div class="sm muted">بروتونات: <b class="num">1</b> · نيوترونات:</div>'+ninHTML('n'+i,'','sm')+'<div class="fb" style="min-height:22px;font-size:19px;text-align:center"></div></div>';}).join('')+'</div>'+
   '<div class="sm muted" style="text-align:center">الرقم الأعلى = العدد الكتلي · الرقم الأسفل = العدد الذري (عدد البروتونات)</div></div>';},
 init:function(el){
  var T=[0,1,2];
  $$('.mod',el).forEach(function(c,i){
    var g=$('.nu',c), fb=$('.fb',c);
    function draw(n){ var s=ball(n?62:80,45,17,'Cyan'); for(var k=0;k<n;k++) s+=ball(98,28+k*34,17,'Silver'); g.innerHTML=s }
    draw(0);
    bindNum($('.nin',c),T[i],0.01,function(ok){ if(ok){ say(fb,'✓ '+(i+1)+' − 1 = '+T[i],'ok'); draw(T[i]) } else say(fb,'انقص عدد البروتونات من العدد الكتلي','bad') });
  });
 },
 note:'<ul><li>من ملخص الوحدة (مدرسة مسندم): ¹H و²H و³H. ليست في كتاب الطالب ولا في عرضك، احذفها إن لم تناسبك.</li><li>الغرض: تثبيت أن النظائر ذرات للعنصر نفسه لها العدد نفسه من البروتونات وتختلف في عدد النيوترونات (كما في تعريف عرضك للنظائر).</li></ul>'});

/* 13 chlorine application: the slider drives the maths */
slide({id:'cl',ch:2,title:'تطبيق عملي: متوسط الكتلة النسبية للكلور',tag:'حرّك المؤشر',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start">'+
  '<div class="frm brk" style="padding:10px 20px;gap:2px"><b style="font-size:23px;color:var(--gold)">المشكلة</b><p style="font-size:23px;line-height:1.55">تحتوي عينة نموذجية من غاز الكلور على 75% من الكلور-35 و 25% من الكلور-37. أوجد متوسط الكتلة النسبية لذرة الكلور؟</p></div>'+
  '<div style="display:flex;gap:16px;align-items:stretch">'+
   '<div class="frm brk" style="flex:1"><div class="fh" style="font-size:21px">المعطيات (Given)</div><div style="padding:10px 16px;font-size:22px;line-height:1.9"><div>النظير الأول: الكتلة = 35، النسبة = <b class="num" id="p1">50</b>% (<span class="num" id="d1">0.50</span>)</div><div>النظير الثاني: الكتلة = 37، النسبة = <b class="num" id="p2">50</b>% (<span class="num" id="d2">0.50</span>)</div></div></div>'+
   '<div class="arw" style="align-self:center">⟵</div>'+
   '<div class="frm brk" style="flex:1"><div class="fh" style="font-size:21px">الحل (Calculation)</div><div class="mf" style="padding:10px 16px;font-size:26px;line-height:1.8;text-align:left;direction:ltr"><div>A<sub>r</sub> = (<span id="c1">0.50</span> × 35) + (<span id="c2">0.50</span> × 37)</div><div>A<sub>r</sub> = (<span id="e1">17.5</span>) + (<span id="e2">18.5</span>)</div></div></div></div>'+
  '<div style="display:flex;gap:18px;align-items:center"><div style="flex:1"><div class="sm" style="font-size:21px;margin-bottom:2px">اضبط نسبة الكلور-35 لين يصير A<sub>r</sub> = 35.5</div><input class="rng" id="rg" type="range" min="0" max="100" step="1" value="50" aria-label="نسبة كلور-35"></div>'+
   '<div class="gbox" id="res" style="min-width:300px"><div style="font-size:19px;font-weight:600">النتيجة (Result)</div><div class="mf" style="font-size:40px" >A<sub>r</sub> = <span id="rv">36.0</span></div></div></div>'+
  '<div class="fb" id="cfb" style="min-height:34px;font-size:22px"></div></div>';},
 init:function(el){
  var rg=$('#rg',el), cfb=$('#cfb',el), res=$('#res',el);
  function upd(){
    var p=+rg.value, q=100-p; rg.style.setProperty('--p',(100-p)+'%');
    var a=(35*p+37*q)/100;
    $('#p1',el).textContent=p; $('#p2',el).textContent=q; $('#d1',el).textContent=(p/100).toFixed(2); $('#d2',el).textContent=(q/100).toFixed(2);
    $('#c1',el).textContent=(p/100).toFixed(2); $('#c2',el).textContent=(q/100).toFixed(2); $('#e1',el).textContent=(35*p/100).toFixed(2); $('#e2',el).textContent=(37*q/100).toFixed(2);
    $('#rv',el).textContent=a.toFixed(2).replace(/0$/,''); var hit=Math.abs(a-35.5)<0.001; res.classList.toggle('ok-b',hit);
    if(hit) say(cfb,'✓ هذي النسبة الطبيعية: 75% كلور-35 و25% كلور-37. لذلك Ar(Cl) = 35.5 مو عدد صحيح','ok'); else say(cfb,'','');
  }
  rg.addEventListener('input',upd); upd();
 },
 note:'<ul><li>عرضك (شريحة ١٠): ٠٫٧٥×٣٥ + ٠٫٢٥×٣٧ = ٢٦٫٢٥ + ٩٫٢٥ = ٣٥٫٥. هنا الطالب يبحث عن النسبة بنفسه بالمؤشر.</li><li>كتاب الطالب ص٥٤: للكلور نظيران (الكلور-35 والكلور-37) ومتوسط كتلته النسبية 35.5، وكذلك النحاس 63.5 (الجدول ٣-٢).</li></ul>'});

/* 14 exit ticket 1 */
(function(){
  var items=[
   {q:'الذرة المستخدمة مقياساً للكتل الذرية النسبية هي:',opts:[{t:'هيدروجين-1'},{t:'كربون-12',ok:true,why:'صح: ١٢ ذ.ك.ذ بالتعريف'},{t:'أكسجين-16'}]},
   {q:'لماذا لا تكون معظم الكتل الذرية النسبية أعداداً صحيحة؟',opts:[{t:'لأن الذرات تتغير في التفاعل'},{t:'لأن لمعظم العناصر نظائر فنأخذ متوسط كتلها',ok:true,why:'صح: متوسط كتل النظائر حسب نسبتها'},{t:'لأن النيوترونات عديمة الكتلة'}]},
   {q:'لماذا نستخدم الكتلة النسبية بدل كتلة الذرة بالجرام؟',opts:[{t:'لأن الجرام وحدة غير صحيحة'},{t:'لأن كتلة الذرة بالجرام صغيرة جداً ويصعب قياسها',ok:true,why:'صح'},{t:'لأن الذرات كلها لها الكتلة نفسها'}]},
   {type:'num',q:'عنصر له نظيران: ٨٠٪ منهما كتلته ١٠ و٢٠٪ كتلته ١١. ما كتلته الذرية النسبية؟',ans:10.2,tol:0.02,why:'(١٠×٨٠ + ١١×٢٠) ÷ ١٠٠ = ١٠٫٢',hint:'خذ المتوسط حسب النسب'}
  ];
  slide({id:'tk1',ch:2,title:'تذكرة خروج ١: الكتلة الذرية النسبية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk1')},
   note:'<ul><li>٣ دقائق. الإجابات: كربون-١٢، متوسط النظائر، صغيرة جداً، ١٠٫٢.</li><li>الأسئلة: ١ الذرة المقياس، ٢ لماذا Ar ليست عدداً صحيحاً، ٣ لماذا نستخدم الكتلة النسبية بدل الجرام، ٤ حساب Ar لنظيرين. من إعدادي على أهداف دليل المعلم ٢-٨ لتقويم سريع قبل الانتقال إلى Mr.</li></ul>'});
})();

/* 15 from atoms to compounds: molecule and ionic (deck slide 11) */
slide({id:'types',ch:3,title:'من الذرات إلى المركبات: Mr',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div style="display:flex;gap:16px">'+
  '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh">جزيء (Molecule)</div><div style="height:230px"><img class="pic fill" src="'+IMG.mol+'" alt="نموذج جزيء"></div><div class="panel" style="margin:12px;padding:12px 16px"><p style="font-size:23px;line-height:1.5">من خلال عدد الكرات الملونة يمكن كتابة الصيغة الجزيئية.</p></div></div>'+
  '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh">مركب أيوني (Ionic Compound)</div><div style="height:230px"><img class="pic fill" src="'+IMG.lattice+'" alt="شبكة أيونية"></div><div class="panel" style="margin:12px;padding:12px 16px"><p style="font-size:23px;line-height:1.5">في الصيغة البنائية الضخمة نحصي عدد الذرات أو الأيونات المرتبطة بكل عنصر ونضعها في هيئة نسبة.</p></div></div></div>'+
  '<div class="gbar">اكتب الصيغة النسبية Mr لـ: <span class="eq" style="font-size:32px">H<sub>2</sub> &nbsp;،&nbsp; H<sub>2</sub>O &nbsp;،&nbsp; NaCl</span></div></div>';},
 note:'<ul><li>عرضك (شريحة ١١): الجزيء يُعدّ بالكرات الملونة، والتركيب الأيوني الضخم نحصي ذراته أو أيوناته ونكتب النسبة. العدّ التفاعلي في الشرائح التالية.</li></ul>'});

/* ---- Mr flow blocks (deck slides 12 and 13) ---- */
function flowBlock(c,i,mode){
  var rows=c.parts.map(function(p,j){
    var tag=p[2]?'<small style="color:var(--muted);font-size:14px">'+p[2]+'</small>':'';
    var left=mode==='count'?'<input class="cin" inputmode="numeric" autocomplete="off" aria-label="عدد ذرات '+p[0]+'">':'<span class="num" style="font-weight:800">'+p[1]+'</span>';
    var right=mode==='count'?'<span class="res"></span>':'<input class="cin pw" inputmode="decimal" autocomplete="off" aria-label="الناتج" style="margin-inline-start:auto;width:88px">';
    return '<div class="fr" data-j="'+j+'">'+left+'<span class="arv">×</span><b>'+p[0]+'</b>'+tag+'<span class="arv num">('+AR_T[p[0]]+')</span><span class="arv">=</span>'+right+'</div>';
  }).join('');
  return '<div class="fblk" data-i="'+i+'"><div class="fsum gbox"><span class="mf" style="font-size:25px">M<sub>r</sub> =</span>'+ninHTML('m'+i,'','sm')+'<div class="fb" style="min-height:0;font-size:15px;line-height:1.2"></div></div><span class="arw">◀</span><div class="frows">'+rows+'</div><span class="arw">◀</span>'+
    '<div class="fcmp frm brk"><div class="ff">'+c.f+'</div><small>'+c.name+'</small>'+(c.note?'<small style="color:var(--cyan)">'+c.note+'</small>':'')+'</div></div>';
}
function bindFlow(el,C,mode){
  $$('.fblk',el).forEach(function(blk,i){
    var c=C[i];
    $$('.fr',blk).forEach(function(r,j){
      var inp=$('.cin',r), p=c.parts[j], want=mode==='count'?p[1]:p[1]*AR_T[p[0]], done=false;
      function ok(){ if(done) return; done=true; inp.classList.add('ok-b'); inp.readOnly=true; if(mode==='count'){var rs=$('.res',r); rs.textContent=p[1]*AR_T[p[0]]; rs.classList.add('pop')} }
      inp.addEventListener('input',function(){ var v=nz(inp.value); inp.classList.remove('bad-b'); if(v!==null&&Math.abs(v-want)<0.001) ok() });
      inp.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!done){var v=nz(inp.value); if(v===null||Math.abs(v-want)>=0.001){inp.classList.add('bad-b','shake'); later(function(){inp.classList.remove('shake')},340)}} });
    });
    var fb=$('.fsum .fb',blk);
    bindNum($('.nin',blk),c.mr,0.01,function(ok){ if(ok) say(fb,'✓','ok'); else say(fb,'اجمع الناتج','bad') });
  });
}
/* 16 Mr workshop: counting from a formula */
(function(){
  var C=[{f:'H<sub>2</sub>',name:'هيدروجين',parts:[['H',2]],mr:2,sum:'٢ × ١ = ٢'},{f:'H<sub>2</sub>O',name:'ماء',parts:[['H',2],['O',1]],mr:18,sum:'٢ + ١٦ = ١٨'},{f:'NaCl',name:'كلوريد الصوديوم',parts:[['Na',1],['Cl',1]],mr:58.5,sum:'٢٣ + ٣٥٫٥ = ٥٨٫٥'}];
  slide({id:'mr',ch:3,title:'كتلة الصيغة النسبية Mr: ورشة حساب',tag:'ورشة حساب',
   html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div class="panel flat" style="padding:12px 20px"><p style="font-size:24px;line-height:1.5"><b>M<sub>r</sub></b> = مجموع الكتل الذرية النسبية Ar لكل الذرات في الصيغة. اعدّ الذرات أولاً، ثم اضرب في Ar واجمع.</p></div><div style="display:flex;gap:14px;flex:1">'+C.map(function(c,i){return mrCardHTML(c,i,true)}).join('')+'</div></div>'+arSide(['H','O','Na','Cl','C','N','Mg','Ca']);},
   init:function(el){ $$('.mrc',el).forEach(function(c,i){bindMrCard(c,C[i])}) },
   note:'<ul><li>عرضك (شريحة ١١، الشريط الذهبي): H₂ ، H₂O ، NaCl. الطالب يكتب عدد كل ذرة ثم المجموع.</li><li>الجزيء → «الكتلة الجزيئية النسبية»، والمركب الأيوني (NaCl) → «كتلة الصيغة النسبية»، وكلاهما M<sub>r</sub>.</li></ul>'});
})();
/* 17 simple molecules: CO2 and CaCO3 (deck slide 12) */
(function(){
  var C=[{f:'CO<sub>2</sub>',name:'ثاني أكسيد الكربون',parts:[['C',1],['O',2]],mr:44},{f:'CaCO<sub>3</sub>',name:'كربونات الكالسيوم',parts:[['Ca',1],['C',1],['O',3]],mr:100,note:'(أيون Ca²⁺ واحد، وأيون CO₃²⁻ واحد)'}];
  slide({id:'mr2',ch:3,cls:'roomy',title:'حساب Mr: مركبات بسيطة',tag:'أكمل الحساب',
   html:function(){return '<div class="col grow" style="gap:16px;justify-content:center">'+C.map(function(c,i){return flowBlock(c,i,'prod')}).join('')+'</div>'},
   init:function(el){bindFlow(el,C,'prod')},
   note:'<ul><li>عرضك (شريحة ١٢): CO₂ = ٤٤، CaCO₃ = ١٠٠. الطالب يحسب كل ناتج ثم المجموع.</li><li>كتاب الطالب ص٥٦: الجدول ٣-٣ فيه أمثلة على عدّ الذرات في الصيغة، وتمرين كتاب النشاط ٣-١ (ب) في الشريحة التالية يكرر العدّ والحساب على ثماني مواد.</li></ul>'});
})();
/* 18 complex compounds with brackets and dots (deck slide 13) */
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
   note:'<ul><li>عرضك (شريحة ١٣): (NH₄)₂SO₄ = ١٣٢، MgSO₄·7H₂O = ٢٤٦. هنا الطالب يعدّ الذرات بنفسه (القوس والنقطة هما الصعوبة).</li><li>اضغط على القاعدة لتظليل الجزء في الصيغة.</li></ul>'});
})();
/* 19 activity book exercise 3-1 (b), p.37: count the atoms or ions in each formula, then find Mr */
(function(){
  var R=[
   {name:'الأكسجين',f:'O<sub>2</sub>',cnt:[['2','O']],calc:'16 × 2',mr:32,ex:true},
   {name:'ثاني أكسيد الكربون',f:'CO<sub>2</sub>',cnt:[['1','C'],['2','O']],calc:'12 + (2 × 16)',mr:44},
   {name:'الماء',f:'H<sub>2</sub>O',cnt:[['2','H'],['1','O']],calc:'(2 × 1) + 16',mr:18},
   {name:'الأمونيا',f:'NH<sub>3</sub>',cnt:[['1','N'],['3','H']],calc:'14 + (3 × 1)',mr:17},
   {name:'كربونات الكالسيوم',f:'CaCO<sub>3</sub>',cnt:[['1','Ca²⁺'],['1','CO₃²⁻']],calc:'40 + 12 + (3 × 16)',mr:100},
   {name:'أكسيد الماغنيسيوم',f:'MgO',cnt:[['1','Mg²⁺'],['1','O²⁻']],calc:'24 + 16',mr:40},
   {name:'نترات الأمونيوم',f:'NH<sub>4</sub>NO<sub>3</sub>',cnt:[['1','NH₄⁺'],['1','NO₃⁻']],calc:'(2 × 14) + (4 × 1) + (3 × 16)',mr:80,hint:'NH₄⁺ فيه N و٤ H، و NO₃⁻ فيه N و٣ O'},
   {name:'البروبانول',f:'C<sub>3</sub>H<sub>7</sub>OH',cnt:[['3','C'],['8','H'],['1','O']],calc:'(3 × 12) + (8 × 1) + 16',mr:60,hint:'عدّ ذرات H: ٧ + ١ من OH'}
  ];
  function cntHTML(c){return c.map(function(x){return '<span class="xc"><b>'+x[0]+'</b> '+x[1]+'</span>'}).join('')}
  slide({id:'ex31b',ch:3,title:'تمرين ٣-١ (ب): أكمل الجدول',tag:'عدّ ثم احسب',
   html:function(){
    return '<style>.slide[data-id=ex31b] .xg{display:grid;grid-template-columns:318px 1fr 1fr 150px;gap:4px 10px;align-items:center;align-content:start;direction:rtl}'+
     '.slide[data-id=ex31b] .xh{font-size:16px;font-weight:800;color:var(--accent);padding:0 8px;line-height:1.1}'+
     '.slide[data-id=ex31b] .xr{display:contents}'+
     '.slide[data-id=ex31b] .xr>div{background:var(--paper);min-height:40px;padding:0 12px;display:flex;align-items:center;gap:8px}'+
     '.slide[data-id=ex31b] .xr>div:first-child{border-radius:0 14px 14px 0;justify-content:space-between}'+
     '.slide[data-id=ex31b] .xr>div:last-child{border-radius:14px 0 0 14px;justify-content:center}'+
     '.slide[data-id=ex31b] .xn{font-size:19px;white-space:nowrap}.slide[data-id=ex31b] .xf{font-family:var(--font-display);font-weight:800;font-size:25px;direction:ltr}'+
     '.slide[data-id=ex31b] .xc{display:inline-block;direction:ltr;background:rgba(255,255,255,.1);border-radius:8px;padding:1px 9px;font-size:20px;margin-inline-end:6px}.slide[data-id=ex31b] .xc b{color:var(--gold)}'+
     '.slide[data-id=ex31b] .xv{font-size:19px;direction:ltr}'+
     '.slide[data-id=ex31b] .rv{border:0;border-radius:10px;padding:4px 12px;font:700 17px var(--font-body);background:var(--field);color:var(--field-ink);cursor:pointer}'+
     '.slide[data-id=ex31b] .xr.done>div{box-shadow:inset 0 0 0 2px rgba(120,220,150,.45)}'+
     '.slide[data-id=ex31b] .ars{display:flex;gap:8px;justify-content:center;direction:ltr;margin-bottom:2px}.slide[data-id=ex31b] .ars span{background:var(--field);color:var(--field-ink);border-radius:10px;padding:0 12px;font-size:18px}.slide[data-id=ex31b] .ars b{font-family:var(--font-display);margin-inline-start:6px}</style>'+
     '<div class="col grow" style="gap:4px;justify-content:flex-start"><div class="ars">'+['H','C','N','O','Mg','Ca'].map(function(s){return '<span>'+s+'<b>'+AR_T[s]+'</b></span>'}).join('')+'</div>'+
     '<div class="xg"><div class="xh">المادة والصيغة</div><div class="xh">عدد الذرات أو الأيونات في الصيغة</div><div class="xh">الحساب</div><div class="xh" style="text-align:center">M<sub>r</sub></div>'+
     R.map(function(r,i){
       return '<div class="xr'+(r.ex?' done':'')+'" data-i="'+i+'"><div><span class="xn">'+r.name+'</span><span class="xf">'+r.f+'</span></div>'+
        '<div class="xcnt">'+(r.ex?cntHTML(r.cnt):'<button class="rv" type="button">اعدّ أولاً ثم اضغط للتحقق</button>')+'</div>'+
        '<div class="xv num xcalc">'+(r.ex?r.calc+' = '+r.mr:'')+'</div>'+
        '<div>'+(r.ex?'<b class="xf" style="color:var(--ok)">'+r.mr+'</b>':ninHTML('x'+i,'','sm'))+'</div></div>';
     }).join('')+'</div><div class="fb" style="min-height:24px;font-size:19px;text-align:center"></div></div>';
   },
   init:function(el){
    var fb=$('.fb',el), left=R.filter(function(r){return !r.ex}).length;
    $$('.xr',el).forEach(function(row,i){
      var r=R[i]; if(r.ex) return;
      var rv=$('.rv',row), cc=$('.xcnt',row);
      rv.addEventListener('click',function(){ cc.innerHTML=cntHTML(r.cnt) });
      bindNum($('.nin',row),r.mr,0.01,function(ok){
        if(ok){ cc.innerHTML=cntHTML(r.cnt); $('.xcalc',row).textContent=r.calc+' = '+r.mr; row.classList.add('done'); left--; say(fb,left?'✓ '+r.f.replace(/<[^>]+>/g,'')+' : '+r.mr+' — باقي '+ar(left):'✓ أحسنت! أكملت الجدول كله','ok') }
        else say(fb,r.hint?'عدّ الذرات بدقة: '+r.hint:'اعدّ الذرات ثم اضرب في Ar واجمع','bad');
      });
    });
   },
   note:'<ul><li>كتاب النشاط ص٣٧، تمرين ٣-١ (ب): «أكمل الفراغات في الجدول لمجموعة من المواد المختلفة» (Mg = 24، Ca = 40، N = 14، C = 12، H = 1، O = 16). الصف الأول (O₂ = ٣٢) مثال محلول في الكتاب.</li><li>الإجابات: CO₂ = ٤٤، H₂O = ١٨، NH₃ = ١٧، CaCO₃ = ١٠٠، MgO = ٤٠، NH₄NO₃ = ٨٠، C₃H₇OH = ٦٠.</li><li>CO₂ وH₂O وCaCO₃ سبق حسابها في الشرائح السابقة (عرضك ١١–١٢)؛ الجديد هنا NH₃ وMgO وNH₄NO₃ وC₃H₇OH. لاحظ الفرق بين عدّ «الأيونات» (CaCO₃: Ca²⁺ و CO₃²⁻) وعدّ «الذرات» عند حساب Mr.</li><li>زر «اعدّ أولاً» يكشف العدد بعد أن يحاول الطلاب. أخطاء متوقعة: NH₄NO₃ (٢ N لا ١)، وC₃H₇OH (٨ H لا ٧).</li></ul>'});
})();
