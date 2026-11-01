/* ---------- alkenes, part C: the bromine-water test (activity 4-1) and the addition reactions ---------- */

/* 13 virtual lab: test four liquid hydrocarbons with bromine water */
slide({id:'lab',ch:4,title:'نشاط ٤-١: اختبار الهيدروكربونات غير المشبعة',tag:'مختبر افتراضي',
 html:function(){
  var B=['A','B','C','D'];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">١) اختر عينة: يُضاف 1 mL منها إلى 4 mL من ماء البروم، ٢) ثم رُجّ الأنبوبة:</div>
    <div style="display:flex;gap:10px;justify-content:center">${B.map(function(b){return '<button type="button" class="bot" data-s="'+b+'"><b>'+b+'</b><span>عينة</span></button>'}).join('')}</div>
    <div class="panel" style="padding:6px 14px;align-items:center;gap:4px">
     <svg viewBox="0 0 300 232" width="215" style="direction:ltr;overflow:visible" aria-hidden="true"><defs><clipPath id="tc"><path d="M107 22 V176 a43 43 0 0 0 86 0 V22 Z"/></clipPath></defs>
      <g id="tube" style="transform-box:fill-box;transform-origin:50% 100%"><g clip-path="url(#tc)"><rect id="lq" x="100" y="96" width="100" height="140" style="fill:#E8751A;transition:fill 1.1s"/><rect id="hc" x="100" y="72" width="100" height="24" fill="rgba(255,245,170,.6)" opacity="0"/></g>
       <path d="M105 18 V176 a45 45 0 0 0 90 0 V18" fill="none" stroke="#cfe" stroke-width="4" stroke-linecap="round"/></g>
      <text x="215" y="150" font-size="17" font-weight="700" fill="#e8f" font-family="Cairo,sans-serif">ماء البروم</text><text x="215" y="168" font-size="15" fill="#cfe" font-family="Cairo,sans-serif">4 mL</text>
      <text id="hl" x="215" y="88" font-size="16" font-weight="700" fill="#F3D27A" font-family="Cairo,sans-serif" opacity="0">عينة 1 mL</text></svg>
     <button type="button" class="btn acc" id="shake">رُجّ الأنبوبة لمدة دقيقة ⟳</button></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div></div>
   <div class="col" style="width:430px;flex:none;gap:9px;justify-content:center">
    <div class="panel" style="padding:8px 14px;gap:2px"><div style="font-size:21px;font-weight:800">جدول الملاحظات والتصنيف</div>
     <table class="obs"><thead><tr><th>العينة</th><th>لون ماء البروم بعد الرج</th><th>التصنيف</th></tr></thead><tbody>${B.map(function(b){return '<tr data-s="'+b+'" data-a="'+(b==='B'||b==='D'?'u':'s')+'"><td>'+b+'</td><td class="rs">—</td><td class="cl"><div class="cb" style="visibility:hidden"><button type="button" class="btn" data-v="s">مشبعة</button><button type="button" class="btn" data-v="u">غير مشبعة</button></div></td></tr>'}).join('')}</tbody></table></div>
    <div class="panel" id="sf" style="padding:8px 14px;gap:2px"><div style="font-size:20px;font-weight:800;color:var(--gold)">السلامة</div><div style="font-size:17px;line-height:1.35">نظارة ومعطف وقفازان. ماء البروم ضارّ ومهيّج، والهيدروكربونات سريعة الاشتعال: لا لهب.</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px"></div></div></div>`;},
 init:function(el){
  var S={A:{n:'هكسان حلقي',u:0},B:{n:'هكسين حلقي',u:1},C:{n:'هكسان',u:0},D:{n:'هكسين',u:1}}, cur=null, added=false, busy=false, tested={}, fb=$('.fb',el), okn=0;
  var lq=$('#lq',el), hc=$('#hc',el), hl=$('#hl',el), shake=$('#shake',el);
  $$('.bot',el).forEach(function(b){b.addEventListener('click',function(){
    if(busy) return; var k=b.getAttribute('data-s'); if(tested[k]){ say(fb,'اختبرت هذه العينة، جرّب عينة أخرى','bad'); return }
    cur=k; added=true; lq.style.transition='none'; lq.style.fill='#E8751A'; void lq.getBoundingClientRect(); lq.style.transition='fill 1.1s'; hc.setAttribute('opacity','1'); hl.textContent='عينة '+k+' 1 mL'; hl.setAttribute('opacity','1');
    $$('.bot',el).forEach(function(x){x.classList.toggle('on',x===b)}); say(fb,'أُضيف 1 mL من العينة '+k+' إلى ماء البروم: الآن رُجّ الأنبوبة','ok');
  })});
  shake.addEventListener('click',function(){
    if(busy) return; if(!added||!cur){ say(fb,'اختر عينة أولاً لتضيفها إلى ماء البروم','bad'); return } busy=true; var k=cur, u=S[k].u, tube=$('#tube',el);
    tube.classList.add('shaking'); say(fb,'نرجّ الأنبوبة بلطف...','');
    later(function(){
      tube.classList.remove('shaking'); if(u){ lq.style.fill='rgba(225,240,240,.25)' }
      var row=$('tr[data-s="'+k+'"]',el); $('.rs',row).innerHTML=u?'<span class="dotc" style="background:#cfe;border:2px solid #9fb4b8"></span>عديم اللون':'<span class="dotc" style="background:#E8751A"></span>برتقالي'; $('.cb',row).style.visibility='visible';
      tested[k]=true; busy=false; $('.bot[data-s="'+k+'"]',el).classList.add('used'); added=false;
      say(fb,u?'اختفى لون ماء البروم البرتقالي! صنّف العينة من الجدول':'بقي ماء البروم برتقالياً: لم يحدث تفاعل. صنّف العينة من الجدول','ok');
    },1700);
  });
  $$('.obs tr[data-s]',el).forEach(function(r){ $$('.cb .btn',r).forEach(function(b){b.addEventListener('click',function(){
    if(r.classList.contains('ok')) return;
    if(b.getAttribute('data-v')===r.getAttribute('data-a')){ r.classList.add('ok'); b.classList.add('ok-b'); okn++; say(fb,r.getAttribute('data-a')==='u'?'✓ غير مشبعة: أزالت لون ماء البروم ← فيها رابطة ثنائية':'✓ مشبعة: لم تغيّر اللون ← روابطها أحادية','ok');
      if(okn===4){ $('#sf',el).classList.add('hide'); var g=$('#gb',el); g.innerHTML='A هكسان حلقي، B هكسين حلقي، C هكسان، D هكسين. <b>غير المشبعان</b> أزالا اللون.'; unhide(el) } }
    else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,'أزال لون ماء البروم؟ ← غير مشبعة','bad') }
  })})});
 },
 note:'<ul><li>نشاط ٤-١ (كتاب الطالب ص٨٩): «يقارن هذا النشاط تفاعل عدة ألكانات وألكينات سائلة مع ماء البروم، ويتم إثبات اختبار تحديد الهيدروكربونات غير المشبعة (اختبار اللاتشبّع)». المواد: هكسان حلقي، هكسين حلقي، هكسان، هكسين، ماء البروم (0.002 mol/L)، أنابيب اختبار وسدادات. الخطوات: ٤ mL من ماء البروم + ١ mL من العينة، سدادة، رجّ بلطف لمدة دقيقة تقريباً، ثم لاحظ التغيير.</li><li>تحديد العينات A–D في هذه المحاكاة اختيار من الدرس (الكتاب لا يعطي ترتيباً ثابتاً)، فبدّلها في تجربتك الصفية. الملاحظة المتوقعة: الهكسين والهكسين الحلقي يزيلان لون ماء البروم البرتقالي-البني، والهكسان والهكسان الحلقي لا يغيّران لونه.</li><li>السلامة من الكتاب: نظارة واقية، معطف، قفازان، هيدروكربونات قابلة للاشتعال فتجنّب اللهب المكشوف، وماء البروم ضارّ ومهيّج فاغسل اليدين فوراً إن انسكب.</li></ul>'});

/* 14 the activity questions as a ticket */
ticketSlide({id:'labq',ch:4,title:'أسئلة النشاط ٤-١',tag:'تذكرة',items:[
 {q:'<b>١)</b> ما الاختلاف الذي لاحظته في النشاط الكيميائي؟',opts:[{t:'الهكسين والهكسين الحلقي أزالا لون ماء البروم، أما الهكسان والهكسان الحلقي فلم يغيّرا لونه',ok:true,why:'غير المشبعة فقط (التي فيها C=C) تتفاعل مع البروم'},{t:'كل العينات أزالت لون ماء البروم',why:'المشبعة (الألكانات) لا تتفاعل مع ماء البروم'},{t:'لم تتغير أي عينة',why:'العينتان B وD أزالتا اللون'}]},
 {q:'<b>٢)</b> إلى أي سلسلتين متجانستين ينتمي الهكسان والهكسين؟',opts:[{t:'الألكانات والألكينات',ok:true,why:'الهكسان ألكان (مشبع)، والهكسين ألكين (غير مشبع)'},{t:'الألكينات والكحولات',why:'الهكسان ليس ألكيناً'},{t:'الألكانات والكحولات',why:'الهكسين ليس كحولاً'}]},
 {type:'num',q:'<b>٣أ)</b> للهكسان والهكسين ٦ ذرات كربون. كم ذرة هيدروجين في الهكسان (ألكان)؟',unit:'ذرة',ans:14,tol:.01,why:'2×6 + 2 = 14: C₆H₁₄',hint:'الألكان: 2n + 2'},
 {type:'num',q:'<b>٣ب)</b> وكم ذرة هيدروجين في الهكسين (ألكين)؟',unit:'ذرة',ans:12,tol:.01,why:'2×6 = 12: C₆H₁₂',hint:'الألكين: 2n'},
 {q:'<b>٤ب)</b> المعادلة الرمزية الموزونة لتفاعل الهكسين مع البروم:',opts:[{t:'<span class="num lbl">C<sub>6</sub>H<sub>12</sub> + Br<sub>2</sub> → C<sub>6</sub>H<sub>12</sub>Br<sub>2</sub></span>',ok:true,why:'تفاعل إضافة: ذرتا بروم تُضافان إلى C=C'},{t:'<span class="num lbl">C<sub>6</sub>H<sub>14</sub> + Br<sub>2</sub> → C<sub>6</sub>H<sub>14</sub>Br<sub>2</sub></span>',why:'هذه صيغة الهكسان (ألكان) لا الهكسين'},{t:'<span class="num lbl">C<sub>6</sub>H<sub>12</sub> + Br<sub>2</sub> → C<sub>6</sub>H<sub>12</sub>Br</span>',why:'ذرتا بروم تُضافان: الناتج C₆H₁₂Br₂'}]}
 ],
 note:'<ul><li>أسئلة نشاط ٤-١ (كتاب الطالب ص٨٩): ١) استخلص النتائج واشرح الاختلافات، ٢) السلسلتان المتجانستان للهكسان والهكسين، ٣) توقّع الصيغة الجزيئية لكل منهما (ست ذرات كربون)، ٤) تفاعل الهكسين مع البروم: (أ) المعادلة اللفظية: هكسين + بروم ← ١،٢-ثنائي برومو هكسان، (ب) الرمزية الموزونة، (ج) رسم الصيغة البنائية للناتج.</li><li>الإجابات: الهكسان C₆H₁₄ والهكسين C₆H₁₂؛ C₆H₁₂ + Br₂ → C₆H₁₂Br₂.</li></ul>'});

/* 15 bromine addition */
slide({id:'br',ch:4,title:'إضافة البروم: لماذا يختفي اللون؟',tag:'شاهد',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:500px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">إيثين + بروم: اضغط الخطوة التالية:</div>
    ${animHTML('an')}</div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="frm brk" style="padding:10px 16px;gap:4px;align-items:center"><div style="font-size:22px;font-weight:800;text-align:center;line-height:1.4">إيثين + بروم ← ١،٢-ثنائي برومو إيثان</div>
     <div class="eqrow" style="font-size:26px"><span class="num lbl">C<sub>2</sub>H<sub>4</sub>(g)</span><span class="pl">+</span><span class="num lbl">Br<sub>2</sub>(aq)</span><span style="font-size:34px">→</span><span class="num lbl">C<sub>2</sub>H<sub>4</sub>Br<sub>2</sub>(l)</span></div>
     <div style="display:flex;gap:18px;font-size:19px;font-weight:700"><span><span class="dotc" style="background:#E8751A"></span>برتقالي مائل إلى البني</span><span>←</span><span><span class="dotc" style="background:#cfe;border:2px solid #9fb4b8"></span>عديم اللون</span></div></div>
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">سؤال ٤-١٣ · لماذا يفقد ماء البروم لونه مع الإيثين؟</div>
     ${optsHTML([{t:'يتفاعل البروم مع الإيثين ويتكوّن ناتج عديم اللون'},{t:'يتبخّر البروم عند الرج'},{t:'يذوب الإيثين في الماء'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">يُستخدم هذا التفاعل <b>كاختبار كيميائي</b> للتمييز بين الهيدروكربونات غير المشبعة والمشبعة.</div></div></div>`;},
 init:function(el){
  var a=false,q=false; function chk(){ if(a&&q) unhide(el) }
  bindAnim(el,'an','Br','Br',['جزيء الإيثين <b class="num">C=C</b> وجزيء البروم <b class="num">Br–Br</b> (برتقالي) يقتربان.','تنكسر إحدى الرابطتين في C=C، وتنكسر الرابطة Br–Br.','ذرتا البروم ارتبطتا بالكربونين: ١،٢-ثنائي برومو إيثان <b>عديم اللون</b>.'],function(){a=true; chk()},400);
  bindMcq($('#qp',el),[{t:'',ok:true,why:'صح: البروم يُزاح من المحلول فيتكوّن مركّب عديم اللون'},{t:'',why:'البروم يتفاعل ولا يتبخر هنا'},{t:'',why:'اللون يختفي لأن البروم يتفاعل مع المركّب غير المشبع'}],$('.fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٨٧–٨٨ (إضافة البروم): «تتفاعل الألكينات بسهولة مع البروم عند درجة حرارة الغرفة والضغط القياسي. تنكسر الرابطة الثنائية وتكوّن رابطتين أحاديتين جديدتين مع ذرتي بروم». المعادلة: إيثين + بروم ← ١،٢-ثنائي برومو إيثان؛ <span class="num">C₂H₄(g) + Br₂(aq) → C₂H₄Br₂(l)</span>.</li><li>«يُستخدم هذا التفاعل الخاص كاختبار كيميائي للتمييز بين الهيدروكربونات غير المشبعة والمشبعة»: ماء البروم برتقالي مائل إلى البني ← عديم اللون. الصورة ٤-٢ في الكتاب: أنبوبتان: (أ) ألكان لا يتفاعل، و(ب) ألكين ويصبح عديم اللون.</li></ul>'});

/* 16 write the equation of bromine addition (question 4-14) */
slide({id:'eqBr',ch:5,title:'اكتب معادلة إضافة البروم',tag:'ركّب · سؤال ٤-١٤',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="panel" id="st1" style="padding:10px 14px;gap:8px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">١) المعادلة اللفظية للتفاعل بين الإيثين والبروم:</div>
     <div class="eqrow"><div class="mslot" data-k="a"><span class="ph">؟</span></div><span class="pl">+</span><div class="mslot" data-k="b"><span class="ph">؟</span></div><span style="font-size:34px">→</span><div class="mslot" data-k="c"><span class="ph">؟</span></div></div>
     <div id="tray" class="tray" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"></div><div class="fb" style="min-height:22px;text-align:center"></div></div>
    <div class="panel" id="st2" style="padding:10px 14px;gap:8px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">٢) المعادلة الرمزية مع رموز الحالة الفيزيائية:</div>
     <div class="eqrow"><div class="mslot" data-k="a"><span class="ph">؟</span></div><span class="pl">+</span><div class="mslot" data-k="b"><span class="ph">؟</span></div><span style="font-size:34px">→</span><div class="mslot" data-k="c"><span class="ph">؟</span></div></div>
     <div id="tray" class="tray" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"></div><div class="fb" style="min-height:22px;text-align:center"></div></div></div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">سؤال ٤-١٤ · البروبين مع ماء البروم، الناتج:</div>
     ${optsHTML([{t:'<span class="num lbl">C<sub>3</sub>H<sub>6</sub>Br<sub>2</sub>(l)</span>'},{t:'<span class="num lbl">C<sub>3</sub>H<sub>6</sub>Br(l)</span>'},{t:'<span class="num lbl">C<sub>3</sub>H<sub>8</sub>Br<sub>2</sub>(l)</span>'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="panel" style="padding:10px 14px;gap:4px;align-items:center"><div style="font-size:20px;font-weight:800;color:var(--gold)">تذكّر</div>${chainSVG(3,{b:[2,1],u:['H','H','H'],d:['H',null,'H'],l:null,r:'H',w:118})}<div style="font-size:18px;line-height:1.4;text-align:center">تُضاف ذرتا البروم إلى <b>ذرتي الكربون المرتبطتين بـ C=C</b>، وليس إلى طرفي السلسلة.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">إضافة البروم: ألكين + Br<sub>2</sub> ← ناتج واحد فيه ذرتا بروم على كربونين متجاورين.</div></div></div>`;},
 init:function(el){
  var d1=false,d2=false,q=false; function chk(){ if(d1&&d2&&q) unhide(el) }
  bindMatch($('#st1',el),[['a','إيثين'],['b','بروم'],['c','١،٢-ثنائي برومو إيثان']],{css:'font-size:19px;padding:8px 12px',more:'صح! كمّل',done:'المعادلة اللفظية صحيحة',bad:'ليس هنا: المتفاعلان أولاً ثم الناتج',onDone:function(){d1=true; chk()}});
  bindMatch($('#st2',el),[['a','C₂H₄(g)'],['b','Br₂(aq)'],['c','C₂H₄Br₂(l)']].map(function(x){return [x[0],'<span class="num lbl">'+x[1]+'</span>']}),{css:'font-size:20px;padding:8px 12px',more:'صح! كمّل',done:'المعادلة الرمزية موزونة وفيها رموز الحالة',bad:'تأكد من الرموز: الناتج سائل (l)',onDone:function(){d2=true; chk()}});
  bindMcq($('#qp',el),[{t:'',ok:true,why:'C₃H₆(g) + Br₂(aq) → C₃H₆Br₂(l): ذرتا بروم تُضافان'},{t:'',why:'تُضاف ذرتا بروم، فالناتج C₃H₆Br₂'},{t:'',why:'عدد ذرات H لا يتغير في الإضافة: C₃H₆'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>سؤال ٤-١٤ (كتاب الطالب ص٩٠): «اكتب المعادلة الرمزية الموزونة، مع رموز الحالة الفيزيائية، للتفاعل بين البروبين وماء البروم». الإجابة (دليل المعلم): C₃H₆(g) + Br₂(aq) → C₃H₆Br₂(l).</li><li>«تذكّر» من الكتاب ص٨٨: عند إضافة جزيء إلى الألكين تذكّر أن ذرات الجزيء تُضاف إلى ذرتي الكربون المشاركتين في الرابطة الثنائية؛ فخلال إضافة البروم إلى البروبين مثلاً تُضاف ذرتا البروم إلى ذرتي الكربون المشاركتين في الرابطة الثنائية C=C وليس إلى أي من طرفي السلسلة الكربونية.</li></ul>'});

/* 17 hydrogenation */
slide({id:'hyd',ch:5,title:'إضافة الهيدروجين: الهدرجة',tag:'شاهد · سؤالا ٤-١٦ و٤-١٧',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:500px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">إيثين + هيدروجين:</div>
    ${animHTML('an')}</div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="frm brk" style="padding:12px 16px;gap:6px;align-items:center"><div class="sm" style="font-size:20px;text-align:center">هيدروجين + إيثين ← إيثان</div>
     <div class="eqrow" style="font-size:26px"><span class="num lbl">C<sub>2</sub>H<sub>4</sub>(g) + H<sub>2</sub>(g)</span>${arr('العامل الحفّاز: النيكل','150–300 °C')}<span class="num lbl">C<sub>2</sub>H<sub>6</sub>(g)</span></div>
     <div class="sm" style="font-size:19px;text-align:center">يتفاعل الإيثين مع الهيدروجين عند تمرير الغازين الساخنين معاً فوق عامل حفّاز ساخن</div></div>
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">سؤال ٤-١٧ · ما العامل الحفّاز ومدى درجات الحرارة في الهدرجة؟</div>
     ${optsHTML([{t:'النيكل، من 150 إلى 300 °C'},{t:'حمض الفوسفوريك، 300 °C'},{t:'الزيوليت، حوالي 500 °C'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:18px">الهدرجة: ألكين + H<sub>2</sub> ← ألكان (نيكل، 150–300 °C). وبها يُصنع السمن من الزيوت النباتية.</div></div></div>`;},
 init:function(el){
  var a=false,q=false; function chk(){ if(a&&q) unhide(el) }
  bindAnim(el,'an','H','H',['جزيء الإيثين <b class="num">C=C</b> وجزيء الهيدروجين <b class="num">H–H</b> يقتربان فوق النيكل الساخن.','تنكسر إحدى الرابطتين في C=C، وتنكسر الرابطة H–H.','ذرتا الهيدروجين ارتبطتا بالكربونين: تكوّن <b>الإيثان</b> المشبع (روابط أحادية فقط).'],function(){a=true; chk()},400);
  bindMcq($('#qp',el),[{t:'',ok:true,why:'عامل حفّاز من النيكل (مسحوق ناعم)، ودرجة حرارة بين 150 و300 °C'},{t:'',why:'هذه ظروف الإماهة (إضافة بخار الماء)'},{t:'',why:'هذه ظروف التكسير الحراري بوجود الزيوليت'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٨٨ (إضافة الهيدروجين): «يُطلق على تفاعل إضافة الهيدروجين إلى الرابطة الثنائية C=C تسمية الهدرجة Hydrogenation. فالإيثين مثلاً يتفاعل مع الهيدروجين عند تمرير هذين الغازين الساخنين معاً فوق عامل حفّاز ساخن». <span class="num">C₂H₄(g) + H₂(g) → C₂H₆(g)</span>، النيكل، 150–300 °C.</li><li>سؤالا ٤-١٦ و٤-١٧: الإجابة: إيثين + هيدروجين ← إيثان؛ العامل الحفّاز نيكل في شكل مسحوق ناعم ودرجة حرارة بين 150 °C و300 °C.</li><li>«تُستخدم تفاعلات الهدرجة المماثلة للتفاعل الذي يحدث مع الإيثين في تصنيع السمن من الزيوت النباتية غير المشبعة» (الكتاب ص٨٨).</li></ul>'});

/* 18 hydration */
slide({id:'hydr',ch:5,title:'إضافة بخار الماء: الإماهة',tag:'شاهد · أسئلة ٤-١٨ و٤-١٩',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:500px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">إيثين + بخار الماء H–OH:</div>
    ${animHTML('an')}</div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="frm brk" style="padding:12px 16px;gap:6px;align-items:center"><div class="sm" style="font-size:20px;text-align:center">بخار الماء + إيثين ← إيثانول</div>
     <div class="eqrow" style="font-size:24px"><span class="num lbl">C<sub>2</sub>H<sub>4</sub>(g) + H<sub>2</sub>O(g)</span>${arr('العامل الحفّاز: حمض الفوسفوريك','300 °C ، 60 atm')}<span class="num lbl">C<sub>2</sub>H<sub>5</sub>OH(g)</span></div></div>
    <div class="panel compact" id="qp" style="padding:10px 16px;gap:6px"><div style="font-size:21px;font-weight:800">سؤال ٤-١٩ · ظروف تفاعل إماهة الإيثين:</div>
     ${optsHTML([{t:'حمض الفوسفوريك، 300 °C، ضغط 60 atm'},{t:'النيكل، 150–300 °C، ضغط عادي'},{t:'درجة حرارة الغرفة بلا عامل حفّاز'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الإماهة: ألكين + بخار الماء ← كحول، بحمض الفوسفوريك عند 300 °C وضغط 60 atm. والإيثانول مادة صناعية مهمة ومذيب مهم.</div></div></div>`;},
 init:function(el){
  var a=false,q=false; function chk(){ if(a&&q) unhide(el) }
  bindAnim(el,'an','H','OH',['جزيء الإيثين <b class="num">C=C</b> وجزيء الماء <b class="num">H–OH</b> (بخار) يقتربان.','تنكسر إحدى الرابطتين في C=C، وتنكسر الرابطة H–OH.','تُضاف H إلى كربون وOH إلى الكربون الآخر: تكوّن <b>الإيثانول</b> (كحول).'],function(){a=true; chk()},400);
  bindMcq($('#qp',el),[{t:'',ok:true,why:'حمض الفوسفوريك عامل حفّاز، ودرجة الحرارة 300 °C، والضغط 60 atm'},{t:'',why:'هذه ظروف الهدرجة'},{t:'',why:'الإماهة تحتاج عاملاً حفّازاً وحرارة وضغطاً مرتفعين'}],$('.fb',$('#qp',el)),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٨٨ (إضافة بخار الماء): «تُستخدم عملية إضافة بخار الماء إلى الإيثين أو تفاعل تميّؤ الإيثين (الإماهة Hydration) في تصنيع الإيثانول. ويُعدّ الإيثانول مادة كيميائية صناعية مهمّة ومذيباً مهمّاً أيضاً. ويتكوّن الإيثانول عند تمرير مخلوط من بخار الماء والإيثين عبر عامل حفّاز من حمض الفوسفوريك المثبّت على حامل صلب (حبيبات سيليكا) عند درجة حرارة 300 °C وضغط 60 وحدة ضغط جوي».</li><li>«الظروف المستخدمة (درجة حرارة وضغط مرتفعان وعامل حفّاز) هي عوامل بالغة الأهمية للحصول على عائد مقبول من الإيثانول». أسئلة ٤-١٨ و٤-١٩: C₂H₄(g) + H₂O(g) → C₂H₅OH(g)؛ حمض الفوسفوريك، 300 °C، 60 atm.</li></ul>'});

/* 19 the three addition reactions side by side */
slide({id:'conds',ch:5,title:'تفاعلات الإضافة الثلاثة',tag:'طابق',
 html:function(){
  var R=[['إضافة البروم','Br<sub>2</sub> (ماء البروم)','3'],['الهدرجة','H<sub>2</sub> (غاز)','1'],['الإماهة','H<sub>2</sub>O (بخار)','2']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <div style="display:grid;grid-template-columns:150px 150px 1fr 1fr;gap:6px 10px;align-items:center;font-size:19px;font-weight:800;color:var(--muted)"><span>التفاعل</span><span>المتفاعل مع الإيثين</span><span>الظروف</span><span>الناتج</span></div>
    ${R.map(function(r){return '<div style="display:grid;grid-template-columns:150px 150px 1fr 1fr;gap:6px 10px;align-items:center"><b style="font-size:24px;color:var(--gold)">'+r[0]+'</b><span class="num" style="font-size:22px;font-weight:800">'+r[1]+'</span><div class="mslot" data-k="c'+r[2]+'" style="min-height:62px"><span class="ph">الظروف</span></div><div class="mslot" data-k="p'+r[2]+'" style="min-height:62px"><span class="ph">الناتج</span></div></div>'}).join('')}
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب كل بطاقة إلى مكانها (أو اضغط ثم اضغط المكان):</div>
    <div id="tray" class="tray" style="display:flex;flex-wrap:wrap;gap:8px"></div>
    <div class="gbar hide" id="gb" style="font-size:21px">في الأنواع الثلاثة ينكسر C=C، وتُضاف ذرتان، ويتكوّن ناتج واحد.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['c1','نيكل · 150–300 °C'],['c2','حمض الفوسفوريك · 300 °C · 60 atm'],['c3','درجة حرارة الغرفة والضغط القياسي'],['p1','إيثان <span class="num lbl">C<sub>2</sub>H<sub>6</sub></span>'],['p2','إيثانول <span class="num lbl">C<sub>2</sub>H<sub>5</sub>OH</span>'],['p3','١،٢-ثنائي برومو إيثان']],{css:'font-size:19px;padding:9px 12px',more:'صح! كمّل',done:'ممتاز: عرفت ظروف التفاعلات الثلاثة وناتج كل منها',bad:'ليس هنا: فكّر في الظروف أو الناتج'});
 },
 note:'<ul><li>ملخص كتاب الطالب ص٨٧–٨٨: البروم عند درجة حرارة الغرفة والضغط القياسي ← ١،٢-ثنائي برومو إيثان؛ الهيدروجين بوجود النيكل عند 150–300 °C ← إيثان؛ بخار الماء بوجود حمض الفوسفوريك عند 300 °C و60 atm ← إيثانول.</li><li>عرض NotebookLM شريحتا ٩ و١٠ (إضافة البروم، الهدرجة والإماهة) وعرضك القديم شرائح «إضافة البروم» و«إضافة الهيدروجين» و«إضافة الماء».</li></ul>'});

/* 20 question 4-20: structural formulas of the products */
ticketSlide({cls:'tightq',id:'q20',ch:5,title:'سؤال ٤-٢٠: الصيغ البنائية للنواتج',tag:'تذكرة',items:[
 {q:'<b>٤-٢٠ (أ)</b> ما الصيغة البنائية للناتج عند تفاعل البروبين مع بخار الماء؟ (الإماهة)',opts:[
   {t:sfe(chainSVG(3,{u:['H','H','H'],d:['H','H','H'],l:'H',r:'OH',w:150})),ok:true,why:'بروبانول: أُضيفت H وOH إلى ذرتي الكربون المرتبطتين بالرابطة الثنائية'},
   {t:sfe(chainSVG(3,{u:['H','OH','H'],d:['H','H','H'],l:'H',r:'H',w:150})),ok:true,why:'بروبانول أيضاً (OH على الكربون الوسطى): يُقبل لأن OH أُضيفت إلى إحدى ذرتي الكربون C=C'},
   {t:sfe(chainSVG(3,{u:['H','H','H'],d:['H','H','H'],l:'H',r:'H',w:150})),why:'هذا البروبان: ناتج الهدرجة وليس الإماهة'}]},
 {q:'<b>٤-٢٠ (ب)</b> ما الصيغة البنائية للناتج عند تفاعل البيوتين مع البروم؟',opts:[
   {t:sfe(chainSVG(4,{u:['H','H','H','H'],d:['Br','Br','H','H'],l:'H',r:'H',w:160})),ok:true,why:'١،٢-ثنائي برومو بيوتان: ذرتا البروم على ذرتي الكربون C=C'},
   {t:sfe(chainSVG(4,{u:['H','H','H','H'],d:['Br','H','H','Br'],l:'H',r:'H',w:160})),why:'البروم يُضاف إلى ذرتي كربون الرابطة الثنائية وليس إلى طرفي السلسلة'},
   {t:sfe(chainSVG(4,{u:['H','H','H','H'],d:['H','H','H','H'],l:'H',r:'H',w:160})),why:'هذا البيوتان (ناتج الهدرجة)'}]}
 ],
 note:'<ul><li>سؤال ٤-٢٠ (كتاب الطالب ص٩٠): أ) باستخدام الصيغ البنائية اكتب معادلة للتفاعل بين البروبين وبخار الماء، ب) اكتب معادلة للتفاعل بين البيوتين والبروم. يضع دليل المعلم صيغتين (أو) للبروبانول: OH على الطرف أو على الكربون الوسطى، وكلتاهما مقبولة لأن الشرط أن تُضاف الذرتان إلى ذرتي كربون الرابطة الثنائية.</li><li>البيوتين في الكتاب: الرابطة الثنائية عند الطرف (بيوت-١-ين) فالناتج ١،٢-ثنائي برومو بيوتان.</li></ul>'});
