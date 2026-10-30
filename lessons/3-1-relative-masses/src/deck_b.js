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
 note:'<ul><li>إجابات السؤال ٣-٢ في الدليل: He ٤، C ١٢، O ١٦، U ٢٣٨. الفسفور: ٣١ ÷ ١٢ = ٢٫٥٨.</li></ul>'});

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
 note:'<ul><li>عرضك (شريحة ٨). الكلور ٣٥٫٥ والنحاس ٦٣٫٥ فقط ليسا عددين صحيحين، بسبب النظائر.</li></ul>'});

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
 note:'<ul><li>من ملخص الوحدة (مدرسة مسندم): ¹H و²H و³H. ليست في كتاب الطالب ولا في عرضك، احذفها إن لم تناسبك.</li></ul>'});

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
 note:'<ul><li>عرضك (شريحة ١٠): ٠٫٧٥×٣٥ + ٠٫٢٥×٣٧ = ٢٦٫٢٥ + ٩٫٢٥ = ٣٥٫٥. هنا الطالب يبحث عن النسبة بنفسه بالمؤشر.</li></ul>'});

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
   note:'<ul><li>٣ دقائق. الإجابات: كربون-١٢، متوسط النظائر، صغيرة جداً، ١٠٫٢.</li></ul>'});
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
   note:'<ul><li>عرضك (شريحة ١٢): CO₂ = ٤٤، CaCO₃ = ١٠٠. الطالب يحسب كل ناتج ثم المجموع.</li></ul>'});
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
