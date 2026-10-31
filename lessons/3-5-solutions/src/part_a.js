/* ---------- solutions, part A: the cover, making a solution, and the words of solutions (book page 69) ---------- */

/* 1 goals: the three groups of the success criteria (deck) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var G=[['المفاهيم',['يعرّف المول والكتلة المولية','يعرّف المذاب والمذيب والمحلول','يعرّف المحلول القياسي']],
         ['الحسابات',['يحسب تركيز الكتلة بوحدة g/L','يحسب التركيز المولي بوحدة mol/L','يحسب الكتلة أو عدد المولات أو الحجم من التركيز','يحوّل بين mL وL']],
         ['المعايرة',['يصف كيف تُجرى معايرة حمض وقاعدة','يحسب تركيز محلول من بيانات المعايرة']]];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="frm brk" style="flex:1;padding:22px 28px 20px;justify-content:center;gap:9px">
    <div style="font-size:24px;font-weight:800;color:var(--cyan)">تمهيد</div>
    <h1 style="margin:0;font-family:var(--font-display);font-size:50px;font-weight:800;line-height:1.12"><span class="num" style="color:var(--gold)">3-5</span> حسابات تتضمن <span style="color:var(--gold);text-shadow:0 0 26px rgba(228,188,75,.4)">محاليل متفاعلة</span></h1>
    <p style="margin:0 0 2px;font-size:26px;font-weight:700;color:var(--muted)">التركيز والمعايرة والتناسب الكيميائي</p>
    <p style="font-size:23px;font-weight:700;line-height:1.35;margin:0">بنهاية الدرس، يجب أن تتقن:</p>
    <div style="display:flex;flex-direction:column;gap:7px">${G.map(function(g){return `<div style="display:flex;gap:10px;align-items:flex-start"><div style="flex:none;width:96px;font-size:21px;font-weight:800;color:var(--gold);padding-top:6px">${g[0]}</div><div style="display:flex;flex-wrap:wrap;gap:6px;flex:1">${g[1].map(function(t){return '<button type="button" class="gi" style="width:auto;flex:1 1 44%;padding:5px 10px;font-size:19px;line-height:1.3;min-height:0"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')}</div></div>`}).join('')}</div>
   </div>
   <div style="width:300px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div class="panel" style="padding:10px 8px;align-items:center;gap:6px">${beakerSVG('gb0',1.4,0.7)}<div class="sm" style="font-size:19px;text-align:center">أي المحلولين أقوى؟ التركيز هو الجواب</div></div>
    <div class="bigeq" style="font-size:34px;color:var(--gold);text-shadow:0 0 22px rgba(228,188,75,.5)">C = n ÷ V</div>
   </div></div>`;},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>معايير النجاح من عرض NotebookLM (شريحة ٢) وأهداف دليل المعلم للموضوع ٣-٥ (٤-٨ و٦-٨). اضغط على هدف لتظليله وأنت تراجع في آخر الدرس.</li><li>روابط المراجعة في عرضك (نقلتها كما ظهرت في الصورة، تحقق منها قبل استخدامها): المعايرة https://youtu.be/86LpJQfX9p4 و https://youtu.be/mhvQYyQV1A ؛ حل أسئلة https://youtu.be/tsi0a7RVqsY ؛ مراجعة https://youtu.be/U3jlaK2Py_8</li><li>الدرس يغطي كتاب الطالب ص٦٩–٧٦، والنشاط ٣-٤، وتمرين ٣-٦، وأوراق العمل ٣-٥ و٣-٦، وأسئلة ٣-١٦ إلى ٣-٢٠، وسؤال ٥ نهاية الوحدة.</li></ul>'});

/* 2 make a solution: the same mass in different volumes (book figure 3-5) */
slide({id:'mix',ch:0,title:'حضّر محلولاً: كبريتات النحاس',tag:'حرّك المنزلقين',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:380px;flex:none;align-items:center;justify-content:center;gap:6px"><div id="mxb" style="width:100%"></div>
   <div class="panel" style="padding:8px 14px;gap:2px;align-items:center;width:100%"><div class="sm" style="font-size:19px;color:var(--muted)">تركيز الكتلة</div><div class="bigeq" id="mxc" style="font-size:36px;color:var(--gold)">100 g/L</div></div></div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="panel" style="padding:12px 18px;gap:10px">
    <div style="display:flex;align-items:center;gap:14px"><span style="font-size:22px;font-weight:700;flex:none;width:130px">كتلة CuSO<sub>4</sub></span><input type="range" id="mxm" min="0" max="200" step="10" value="100" aria-label="كتلة كبريتات النحاس بالغرام" style="flex:1"><b class="num" id="mxmv" style="font-size:26px;min-width:84px;text-align:center"></b></div>
    <div style="display:flex;align-items:center;gap:14px"><span style="font-size:22px;font-weight:700;flex:none;width:130px">حجم المحلول</span><input type="range" id="mxv" min="0.5" max="2" step="0.5" value="1" aria-label="حجم المحلول باللتر" style="flex:1"><b class="num" id="mxvv" style="font-size:26px;min-width:84px;text-align:center"></b></div></div>
   <div class="panel" id="mq" style="padding:12px 18px;gap:6px"><p class="lead" style="margin:0;font-size:22px">في الكأس الأولى <b class="num">100 g</b> من CuSO<sub>4</sub> في <b class="num">1 L</b> ماء، وفي الثانية <b class="num">200 g</b> في <b class="num">2 L</b>. أيّ المحلولين أكثر تركيزاً؟</p>
    ${optsHTML([{t:'الثاني، لأن فيه مذاباً أكثر'},{t:'الأول، لأن حجمه أقل'},{t:'لهما التركيز نفسه'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:21px">التركيز = <b>المذاب ÷ حجم المحلول</b> وليس كمية المذاب وحدها: كلاهما <b>100 g/L</b>.</div></div></div>`;},
 init:function(el){
  var m=$('#mxm',el), v=$('#mxv',el);
  function paint(){
   var M=+m.value, V=+v.value, C=M/V;
   $('#mxb',el).innerHTML=beakerSVG('mxsv',V,Math.min(1,C/200));
   $('#mxmv',el).textContent=M+' g'; $('#mxvv',el).textContent=V+' L'; $('#mxc',el).textContent=(+C.toFixed(1))+' g/L';
  }
  m.addEventListener('input',paint); v.addEventListener('input',paint); paint();
  bindMcq($('#mq',el),[{t:'',why:'الكتلة وحدها لا تكفي؛ جرّب المنزلقين: 200 g في 2 L'},{t:'',why:'الحجم الأقل لا يعني التركيز الأعلى؛ قارن 100 ÷ 1 مع 200 ÷ 2'},{t:'',ok:true,why:'صح: 100 ÷ 1 = 200 ÷ 2 = 100 g/L'}],$('#mq .fb',el),function(){$('#mq .opts',el).classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب الطالب الشكل ٣-٥ (ص٦٩): محاليل من كبريتات النحاس (II) بتراكيز مختلفة، فنفس كتلة المذاب في أحجام مختلفة تعطي تراكيز مختلفة، ونسبة كتلة إلى حجم واحدة تعطي التركيز نفسه (100 g في 1 L و200 g في 2 L: 100 g/L).</li><li>شدة اللون تمثل التركيز: جرّب مع الطلاب 100 g ثم زد الماء ولاحظ أن اللون يخفت.</li></ul>'});

/* 3 the words of solutions */
slide({id:'vocab',ch:0,title:'المذاب والمذيب والمحلول',tag:'اسحب إلى مكانه',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="panel" style="padding:12px 18px"><p class="lead" style="margin:0;font-size:23px">أُذيب <b class="num">58.5 g</b> من ملح الطعام <span class="num fmla">NaCl</span> في ماء ليصبح الحجم النهائي <b class="num">1 L</b>. ضع كل اسم مكانه:</p></div>
   ${[['s','المذاب'],['v','المذيب'],['m','المحلول']].map(function(x){return `<div style="display:flex;align-items:center;gap:12px"><div class="mk" style="min-width:104px;height:56px;border-radius:12px;display:grid;place-items:center;font-size:23px;flex:none;color:var(--gold);font-weight:800">${x[1]}</div><div class="mslot slot" data-k="${x[0]}" style="flex:1;min-height:60px"><span class="ph" style="font-size:19px">اسحب إلى هنا</span></div></div>`}).join('')}
   <div class="imp-tray" id="tray" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"></div>
   <div class="fb" style="text-align:center;min-height:26px"></div></div>
  <div class="col" style="width:430px;flex:none;gap:10px;justify-content:center">
   <div class="defc gold" style="flex:none"><b>المذيب</b><span>المادة التي تُذيب غيرها. في المحاليل المائية الماء هو المذيب العام.</span></div>
   <div class="defc blue" style="flex:none"><b>المذاب</b><span>المادة التي أُذيبت في المذيب.</span></div>
   <div class="gbar hide" id="gb" style="font-size:20px">لوصف محلول نحتاج <b>كمية المذاب</b> و<b>حجم المحلول</b> (باللتر). والمحلول <b>القياسي</b> تركيزه معروف بدقة.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[['m','محلول ملح الطعام'],['s','ملح الطعام NaCl'],['v','الماء']],{css:'font-size:21px;padding:9px 16px',bad:'فكّر: أيهما أُذيب في الآخر؟'});
 },
 note:'<ul><li>كتاب الطالب ص٦٩: عند إذابة مادة (المذاب Solute) في مادة أخرى (المذيب Solvent) نقيس كمية المذاب بالجرام أو بالمول وحجم المحلول النهائي باللتر. مثال: محلول NaCl تركيزه 58.5 g/L يحتوي 58.5 g في لتر من المحلول.</li><li>تعريف الامتحان (٢٠٢٢/٢٠٢٣ سؤال ١٤ أ و٢٠٢٣/٢٠٢٤ سؤال ٢٦): المحلول القياسي مخلوط متجانس من مذاب ومذيب يكوّنان محلولاً بتركيز معروف (يُحضّر بعناية ليكون تركيزه معروفاً بدقة).</li><li>الحجم النهائي للمحلول وليس حجم الماء المضاف: نذيب ثم نكمل بالماء حتى العلامة.</li></ul>'});
