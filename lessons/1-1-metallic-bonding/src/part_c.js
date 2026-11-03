/* ---------- lesson 1-1, part C: activities (the lab, the formula workshop) and the questions of the student book ---------- */

/* 16 virtual lab: is this substance a metal? (the end-of-unit question 1(a) asks how to test it) */
(function(){
  var S=[
   {k:'A',n:'نحاسية اللون',lus:[1,'لامعة'],con:[1,'يضيء المصباح'],ham:[1,'يتشكّل ولا يتحطم'],m:1,id:'نحاس'},
   {k:'B',n:'صفراء باهتة',lus:[0,'معتمة'],con:[0,'المصباح مطفأ'],ham:[0,'يتفتّت إلى قطع'],m:0,id:'كبريت'},
   {k:'C',n:'فضية',lus:[1,'لامعة'],con:[1,'يضيء المصباح'],ham:[1,'يتشكّل ولا يتحطم'],m:1,id:'ألومنيوم'},
   {k:'D',n:'سوداء',lus:[0,'معتمة'],con:[0,'المصباح مطفأ'],ham:[0,'يتفتّت إلى قطع'],m:0,id:'فحم'}];
  slide({id:'lab',ch:3,title:'مختبر افتراضي: هل هذه المادة فلز؟',tag:'نفّذ وسجّل',cls:'labs',
   html:function(){
    var rows=S.map(function(s,i){
      return '<tr data-i="'+i+'"><td>'+s.k+'<div style="font-size:15px;color:var(--muted);font-weight:600;font-family:var(--font-body)">'+s.n+'</div></td>'+
        ['lus','con','ham'].map(function(t){return '<td data-t="'+t+'"><button type="button">اختبر</button></td>'}).join('')+
        '<td class="cl"><span class="chips" style="gap:6px;justify-content:center"><button type="button" data-v="1" disabled>فلز</button><button type="button" data-v="0" disabled>لافلز</button></span></td></tr>';
    }).join('');
    return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
     <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
      <div class="panel" style="padding:10px 14px"><table class="lab-t"><thead><tr><th>المادة</th><th>اللمعان</th><th>التوصيل (دائرة)</th><th>الطرق</th><th>التصنيف</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="fb" style="min-height:26px;text-align:center"></div></div>
     <div class="col" style="width:330px;flex:none;gap:10px;justify-content:center">
      <div class="panel" style="padding:12px 16px;gap:8px"><div style="font-size:21px;font-weight:800;color:var(--gold)">معايير النجاح في هذا النشاط</div>
       <div class="skills"><div class="sk" id="k1"><i>✓</i><span>أنفّذ الاختبارات وأسجّل الملاحظات.</span></div><div class="sk" id="k2"><i>✓</i><span>أناقش ملاحظاتي وأستنتج: فلز أم لا؟</span></div></div></div>
      <div class="gbar hide" id="gb" style="font-size:20px">اختبار الفلز: <b>دائرة كهربائية</b> (يضيء المصباح) + <b>الطرق</b> (يتشكّل ولا يتحطم) + <b>اللمعان</b>.</div></div></div>`;},
   init:function(el){
    var done=0, cls=0, tests={};
    function fb(m,k){say($('.fb',el),m,k)}
    $$('tbody tr',el).forEach(function(tr){
      var i=+tr.getAttribute('data-i'), s=S[i], c=0;
      $$('td[data-t]',tr).forEach(function(td){ $('button',td).addEventListener('click',function(){
        var t=td.getAttribute('data-t'), r=s[t]; td.innerHTML='<span class="'+(r[0]?'ok-t':'no-t')+'">'+(r[0]?'✓ ':'✗ ')+r[1]+'</span>'; c++; done++;
        if(c===3) $$('.cl button',tr).forEach(function(b){b.disabled=false});
        if(done===12) $('#k1',el).classList.add('done');
      })});
      $$('.cl button',tr).forEach(function(b){ b.addEventListener('click',function(){
        var v=+b.getAttribute('data-v'); if(tr.classList.contains('ok')) return;
        if(v===s.m){ tr.classList.add('ok'); $$('.cl button',tr).forEach(function(x){x.disabled=true}); $('.cl',tr).innerHTML='<span class="ok-t">✓ '+(v?'فلز':'لافلز')+' ('+s.id+')</span>'; cls++; fb('✓ المادة '+s.k+': '+(v?'فلز':'لافلز')+' لأنها '+(v?'تضيء المصباح وتُطرق':'لا توصل ولا تُطرق'),'ok'); if(cls===4){ $('#k2',el).classList.add('done'); unhide(el) } }
        else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); fb('راجع نتائج الاختبارات الثلاثة لهذه المادة','bad') }
      })});
    });
   },
   note:'<ul><li>نشاط تعرّف الفلزات من عرضك وعرض NotebookLM، وسؤال نهاية الوحدة ١(أ) «اشرح كيف تختبر أن عنصراً ما فلز»: دائرة كهربائية من بطارية وأسلاك ومصباح، يضيء المصباح إذا كانت المادة فلزاً (إجابة دليل المعلم). كتاب الطالب شكل ١-٣.</li><li>معايير النجاح: في الدليل تُكتب مهارات الأنشطة العملية هكذا: «ينجز التجربة ويسجّل الملاحظات والقياسات ... ويناقش الملاحظات التجريبية ويقيّمها» (أنشطة ١-١ و١-٢ و١-٤). طبّقت الصياغة نفسها هنا لأن هذا النشاط مبني على عروضك وليس في الكتاب.</li><li>المواد الأربع افتراضية (A نحاس، B كبريت، C ألومنيوم، D فحم) ونتائجها مقررة مسبقاً. الفحم هنا غير الجرافيت.</li></ul>'});
})();

/* 17 formulas workshop: build the formulas of the compounds that metals make (book p.15: metals form ionic compounds; metal oxides are basic) */
slide({id:'formula',ch:3,title:'ورشة الصيغ: مركّبات الفلزات',tag:'ورشة الصيغ',
 html:function(){
  var T=[['Na2O','Na<sub>2</sub>O'],['MgO','MgO'],['NaCl','NaCl'],['Al2O3','Al<sub>2</sub>O<sub>3</sub>']];
  return `<div class="col" style="flex:1;gap:10px;min-height:0">
   <div class="taskchips"><span>ابنِ هذه الصيغ بنفسك:</span>${T.map(function(t){return '<span class="tc" data-f="'+t[0]+'">'+t[1]+'</span>'}).join('')}</div>
   ${EQL.builderHTML()}
   <div class="gbar hide" id="gb" style="font-size:20px">الفلزات تفقد إلكترونات فتكوّن أيونات موجبة تتحد مع أيونات اللافلزات: وأكاسيد الفلزات <b>قاعدية</b>.</div></div>`;},
 init:function(el){
  var got={};
  EQL.bindBuilder(el,{cats:['Na','Mg','Al','K','Ca'],anis:['Cl','O','OH'],startCat:'Na',startAni:'O',onDone:function(n,k){
    var c=$('.tc[data-f="'+k+'"]',el); if(c) c.classList.add('on'); got[k]=1;
    if(['Na2O','MgO','NaCl','Al2O3'].every(function(f){return got[f]})) unhide(el);
  }});
 },
 note:'<ul><li>ورشة الصيغ: أداة تتكرر في كل درس من الوحدة. هنا الصيغ البسيطة لمركبات الفلزات: اختر الكاتيون والأنيون ثم «اشرح خطوة بخطوة» لترى تبادل التكافؤ والتبسيط والتحقق من الشحنات، أو «جرّب بنفسك» ليختار الطالب الرقمين ويحصل على تصحيح محدد لخطئه.</li><li>الأيونات: Na⁺ وMg²⁺ وAl³⁺ وK⁺ وCa²⁺ مع Cl⁻ وO²⁻ وOH⁻. كتاب الطالب ص١٥: الفلزات تكوّن مركبات أيونية مع اللافلزات وأكاسيدها قاعدية. التبادل بين التكافؤين هو الطريقة المعتمدة (أخبرتني أنك تفضّل تبادل الشحنات مع التكافؤ).</li><li>الشريحة إثرائية ويمكن تخطيها. هي ليست من هدفي ٤-١ و٤-٢، وهدفها تدريب الطلاب على كتابة الصيغ قبل معادلات الدروس التالية.</li></ul>'});

/* 18 student book question 1-1 */
slide({id:'q11',ch:4,title:'سؤال ١-١ من الكتاب',tag:'ص١٧',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div class="frm gold brk" style="padding:16px 24px;gap:8px"><div style="font-size:23px;font-weight:800;color:var(--cyan)">السؤال ١-١</div><div style="font-size:34px;font-weight:800;line-height:1.4">ما المقصود بالرابطة الفلزية؟</div></div>
    <div class="panel compact" id="q" style="padding:12px 16px;gap:8px">${optsHTML([{t:'قوى تجاذب كهروستاتيكية قوية بين الأيونات الموجبة وبحر الإلكترونات المتحركة، تمسك الشبكة الفلزية معاً'},{t:'تجاذب بين أيونات موجبة وأيونات سالبة في بلّور'},{t:'مشاركة أزواج من الإلكترونات بين ذرتين'}])}<div class="fb" style="min-height:26px"></div></div></div>
   <div class="col" style="width:330px;flex:none;gap:12px;justify-content:center"><div class="gbar hide" id="gb" style="font-size:21px">الإجابة النموذجية: قوة تجاذب كهروستاتيكي قوية بين الأيونات الموجبة وبحر الإلكترونات المتحركة، تمسك الشبكة الفلزية معاً.</div></div></div>`;},
 init:function(el){ bindMcq($('#q',el),[{t:'',ok:true,why:'صح: هذا تعريف الرابطة الفلزية'},{t:'',why:'هذه الرابطة الأيونية'},{t:'',why:'هذه الرابطة التساهمية'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>سؤال ١-١ في كتاب الطالب (ص١٧). الإجابة من دليل المعلم: «قوة تجاذب كهروستاتيكي قوية بين الأيونات الموجبة وبحر الإلكترونات المتحركة، تمسك الشبكة الفلزية معاً». حوّلت السؤال المفتوح إلى اختيار بين تعريفات الروابط الثلاثة. اطلب من الطلاب كتابة الإجابة بأنفسهم أولاً.</li><li>واجب منزلي حسب الدليل.</li></ul>'});

/* 19 student book question 1-2 (a, b, c) */
(function(){
  var items=[
   {q:'<b>١-٢ (أ):</b> فسّر لماذا لمعظم الفلزات درجات انصهار وغليان مرتفعة.',opts:[{t:'الرابطة الفلزية قوية جداً وتحتاج إلى طاقة كبيرة لكسرها',ok:true,why:'ولذلك تبقى صلبة في الغالب'},{t:'لأن الفلزات تتكوّن من جزيئات صغيرة',why:'الفلز لا يتكوّن من جزيئات صغيرة منفصلة'},{t:'لأن الأيونات الموجبة تتنافر فتتباعد',why:'الأيونات الموجبة تمسكها الإلكترونات الحرة'}]},
   {q:'<b>١-٢ (ب):</b> فسّر لماذا الفلزات قابلة للطرق والسحب.',opts:[{t:'عند التأثير بقوة تنزلق طبقات الأيونات الموجبة فوق بعضها دون أن تنكسر الرابطة',ok:true,why:'فيمكن تشكيلها دون تحطم'},{t:'لأن الإلكترونات تتحول إلى أيونات',why:'الإلكترونات تبقى حرة في بحر الإلكترونات'},{t:'لأن الأيونات تتنافر عند الطرق',why:'هذا يحدث في البلّورات الأيونية فتتحطم'}]},
   {q:'<b>١-٢ (ج):</b> فسّر لماذا توصل الفلزات الكهرباء.',opts:[{t:'الإلكترونات غير المتمركزة حرة الحركة وتنقل الشحنة عبر التركيب',ok:true,why:'تتحرك نحو القطب الموجب فيمرّ التيار'},{t:'الأيونات الموجبة تتحرك في الفلز',why:'الأيونات ثابتة في الشبكة'},{t:'الذرات المتعادلة تنتقل بين القطبين',why:'لا تنتقل ذرات في السلك'}]}
  ];
  slide({id:'q12',ch:4,title:'سؤال ١-٢ من الكتاب',tag:'ص١٧',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'q12')},
   note:'<ul><li>سؤال ١-٢ في كتاب الطالب (ص١٧): فسّر (أ) ارتفاع انصهار وغليان معظم الفلزات (ب) قابلية الفلزات للطرق والسحب (ج) توصيلها للكهرباء. إجابات دليل المعلم: (أ) الرابطة الفلزية قوية جداً وتحتاج إلى طاقة كبيرة لكسرها (ب) عند التأثير بقوة تنزلق طبقات الأيونات الموجبة فوق بعضها دون كسر الرابطة (ج) الإلكترونات غير المتمركزة حرة الحركة وتنقل الشحنة عبر التركيب.</li><li>واجب منزلي حسب الدليل.</li></ul>'});
})();

/* 20 end-of-unit question 1 */
slide({id:'eou1',ch:4,title:'سؤال نهاية الوحدة ١',tag:'كتاب الطالب ص٣٣',
 html:function(){
  var items=[['س١(أ): اشرح كيف تختبر أن عنصراً ما فلز.','نبني دائرة كهربائية من بطارية وأسلاك ومصباح ونضع العنصر فيها: يضيء المصباح إذا كان العنصر فلزاً.'],['س١(ب): صف الرابطة داخل الفلز.','قوة تجاذب كهروستاتيكية قوية بين الأيونات الموجبة والإلكترونات غير المتمركزة في الشبكة الفلزية.'],['س١(ج): لماذا لمعظم الفلزات درجتا انصهار وغليان مرتفعتان؟','الرابطة الفلزية القوية تحتاج إلى طاقة كبيرة لكسرها.'],['س١(د): الفلزات قابلة للطرق والسحب. اشرح ذلك.','تترتب الأيونات الموجبة في طبقات يمكن أن تنزلق فوق بعضها دون أن تنكسر الرابطة الفلزية، فيمكن تشكيل الفلز.']];
  return `<div style="display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center">
   <div style="font-size:21px;font-weight:800;color:var(--cyan)">أجب في دفترك ثم اضغط على السؤال لتظهر الإجابة النموذجية:</div>
   ${cardsHTML(items,'two')}
   <div class="gbar hide" id="gb" style="font-size:21px">أحسنت! أنهيت أسئلة كتاب الطالب لهذا الدرس.</div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>أسئلة نهاية الوحدة، السؤال ١ (أ–د)، والإجابات من دليل المعلم ص٣٧–٣٨. السؤال ٢ يخص الدرس ١-٤، والسؤال ٣ الدرس ١-٣، والسؤال ٤ الدرس ١-٢.</li><li>واجب منزلي حسب الدليل: الأسئلة ١-١ و١-٢ وسؤال نهاية الوحدة ١.</li></ul>'});
