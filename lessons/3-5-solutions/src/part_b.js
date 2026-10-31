/* ---------- solutions, part B: the mass concentration, g/L (book page 69, example 3-7, question 3-16) ---------- */

/* 4 the formula triangle of the mass concentration */
slide({id:'cg',ch:1,title:'تركيز الكتلة: المثلث',tag:'اضغط على كل زاوية',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:400px;flex:none;align-items:center;justify-content:center;gap:10px">
   ${triSVG('m (g)','V (L)','C (g/L)',{cv:1,w:340})}
   <div class="sm" style="font-size:20px;text-align:center">m كتلة المذاب ، V حجم المحلول ، C تركيز الكتلة</div></div>
  <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
   <div class="frm brk" style="padding:16px 22px;gap:8px;align-items:center;min-height:150px;justify-content:center"><div class="bigeq" id="tf" style="font-size:46px;color:var(--gold)">؟</div><div class="sm" id="tfd" style="font-size:22px;text-align:center"> </div></div>
   <div class="panel" style="padding:12px 20px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">انتبه إلى الوحدات</div>
    <p class="lead" style="margin:0;font-size:22px">الحجم في المحاليل يُقاس غالباً بالـ <span class="num">mL</span> ، لكن التركيز يحتاجه باللتر <span class="num">L</span>:</p><div class="bigeq" style="font-size:30px;text-align:start;color:var(--gold)">V (L) = V (mL) ÷ 1000</div></div>
   <div class="gbar hide" id="gb" style="font-size:21px">ثلاث علاقات من مثلث واحد: <b>C = m ÷ V</b> ، <b>m = C × V</b> ، <b>V = m ÷ C</b></div></div></div>`;},
 init:function(el){
  var T={r:['C = m ÷ V','تركيز الكتلة (g/L) = كتلة المذاب (g) ÷ حجم المحلول (L)'],t:['m = C × V','كتلة المذاب = التركيز × الحجم'],l:['V = m ÷ C','حجم المحلول = كتلة المذاب ÷ التركيز']}, seen={};
  $$('.cv',el).forEach(function(g){g.addEventListener('click',function(){
   var k=g.getAttribute('data-k'); $$('.cv',el).forEach(function(x){x.classList.toggle('hid',x===g)});
   $('#tf',el).innerHTML=T[k][0]; $('#tfd',el).textContent=T[k][1]; seen[k]=1;
   if(Object.keys(seen).length===3){var b=$('#gb',el); b.classList.remove('hide'); b.classList.add('up')}
  })});
 },
 note:'<ul><li>كتاب الطالب ص٦٩: عند قياس كتلة المذاب بالجرام وحجم المحلول النهائي باللتر نحصل على تركيز الكتلة بوحدة g/L، ومعادلته: تركيز الكتلة (g/L) = كتلة المذاب (g) ÷ حجم المحلول (L).</li><li>المثلث نفسه في كتاب الطالب وفي ملخص الوحدة وفي عرض NotebookLM (شريحة ٤).</li></ul>'});

/* 5 example 3-7 */
chainSlide({id:'ex37',ch:1,title:'مثال ٣-٧: تركيز الكتلة',
 eq:'C = m ÷ V',eqSize:46,data:'احسب تركيز الكتلة (g/L) لمحلول من هيدروكسيد الصوديوم NaOH يحتوي على <b class="num">10 g</b> من NaOH في حجم نهائي مقداره <b class="num">250 mL</b>.',
 labels:['المعطى','V بالـ L','C (g/L)'],first:'m = 10 g<br>V = 250 mL',
 steps:[{n:'e1',q:'حوّل الحجم إلى L (÷ 1000)',u:'L',lab:'V =',a:0.25,t:0.003,w:'✓ 250 ÷ 1000 = 0.25 L',h:'mL ÷ 1000 = L',fill:'0.25 L'},{n:'e2',q:'C = m ÷ V',u:'g/L',lab:'C =',a:40,t:0.4,w:'✓ 10 ÷ 0.25 = 40 g/L',h:'اقسم 10 على 0.25',fill:'40 g/L'}],
 side:'<div class="col" style="align-items:center">'+triSVG('10 g','0.25 L','C = ؟',{w:290})+'</div>',
 gbar:'تركيز المحلول <b>40 g/L</b>: كل لتر منه يحتوي 40 g من NaOH.',
 note:'<ul><li>مثال ٣-٧ في كتاب الطالب (ص٧١): 10 g ÷ 0.25 L = 40 g/L. وهو نفسه في كراسة الأمثلة (مثال ١٨) وعرض NotebookLM.</li><li>الخطوة الأولى دائماً: تحويل الحجم من mL إلى L.</li></ul>'});

/* 6 question 3-16 */
rowsSlide({id:'q316',ch:1,title:'سؤال ٣-١٦: احسب تركيز الكتلة',
 intro:'احسب تركيز الكتلة بالـ g/L لكل من المحاليل الآتية. انتبه إلى وحدة الحجم.',
 rows:[{n:'a',q:'أ. 5 g من الملح في محلول حجمه 2 L',u:'g/L',lab:'C =',a:2.5,t:0.03,w:'✓ 5 ÷ 2 = 2.5 g/L',h:'C = m ÷ V'},{n:'b',q:'ب. 5 g من السكر في محلول حجمه 100 mL',u:'g/L',lab:'C =',a:50,t:0.5,w:'✓ V = 0.1 L ← 5 ÷ 0.1 = 50 g/L',h:'حوّل 100 mL إلى L أولاً'},{n:'c',q:'ج. 0.1 g من Na<sub>2</sub>CO<sub>3</sub> في محلول حجمه 5000 mL',u:'g/L',lab:'C =',a:0.02,t:0.0003,w:'✓ V = 5 L ← 0.1 ÷ 5 = 0.02 g/L',h:'حوّل 5000 mL إلى L أولاً'}],
 side:'<div class="col" style="align-items:center">'+triSVG('m (g)','V (L)','C = ؟',{w:290})+'</div>',
 gbar:'اقسم دائماً على الحجم <b>باللتر</b>: 100 mL = 0.1 L و5000 mL = 5 L.',
 note:'<ul><li>كتاب الطالب سؤال ٣-١٦ (ص٧٦). الإجابات: ٢٫٥ و٥٠ و٠٫٠٢ g/L (عرض NotebookLM شريحة ٥ كتب «ص٦٩» والصحيح ص٧٦).</li></ul>'});

/* 7 ticket 1 */
(function(){
  var items=[
   {type:'num',q:'احسب تركيز الكتلة لمحلول فيه <span class="num">20 g</span> من السكر في <span class="num">500 mL</span> من المحلول.',unit:'g/L',ans:40,tol:0.4,why:'V = 0.5 L ← 20 ÷ 0.5 = 40 g/L',hint:'حوّل 500 mL إلى L ثم اقسم'},
   {q:'محلولان: الأول <span class="num">10 g</span> في <span class="num">100 mL</span>، والثاني <span class="num">10 g</span> في <span class="num">1 L</span>. الأكثر تركيزاً:',opts:[{t:'الأول (100 g/L)',ok:true,why:'10 ÷ 0.1 = 100 g/L أكبر من 10 ÷ 1 = 10 g/L'},{t:'الثاني (10 g/L)'},{t:'متساويان'}]},
   {type:'num',q:'كم غراماً من الملح في <span class="num">2 L</span> من محلول تركيزه <span class="num">5 g/L</span>؟',unit:'g',ans:10,tol:0.1,why:'m = C × V = 5 × 2 = 10 g',hint:'m = C × V'},
   {type:'num',q:'ما حجم محلول (L) فيه <span class="num">15 g</span> من مذاب وتركيزه <span class="num">30 g/L</span>؟',unit:'L',ans:0.5,tol:0.01,why:'V = m ÷ C = 15 ÷ 30 = 0.5 L',hint:'V = m ÷ C'}
  ];
  slide({id:'tk1',ch:1,title:'تذكرة خروج (١): تركيز الكتلة',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk1')},
   note:'<ul><li>الإجابات: ٤٠ g/L، الأول، ١٠ g، ٠٫٥ L.</li></ul>'});
})();
