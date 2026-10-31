/* ---------- gas volumes, part B: Avogadro's law, the molar volume, and volume <-> moles (book pages 65 to 69) ---------- */

/* a generic slide of independent answer rows; o: {id,ch,title,tag,intro,rows:[{n,q,u,lab,a,t,w,h}],side,gbar,note} */
function rowsSlide(o){
  slide({id:o.id,ch:o.ch,title:o.title,tag:o.tag||'احسب',
   html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
    <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
     <div class="panel" style="padding:12px 18px"><p class="lead" style="margin:0;font-size:24px">${o.intro}</p></div>
     ${o.rows.map(function(r){return qline(r.q,[[r.n,r.u,r.lab]])}).join('')}
     <div class="fb" style="text-align:center;min-height:26px"></div></div>
    <div class="col" style="width:${o.sideW||360}px;flex:none;gap:10px;justify-content:center">${o.side||''}<div class="gbar hide" id="gb" style="font-size:21px">${o.gbar}</div></div></div>`;},
   init:function(el){
    bindAll(el,o.rows.map(function(r){return {n:r.n,a:r.a,t:r.t,w:r.w,h:r.h}}),$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
   },
   note:o.note});
}

/* the formula triangle: top = volume, bottom left = moles, bottom right = the molar volume; cv adds the tap targets */
function triSVG(t,l,r,o){
  o=o||{};
  var FILL={V:'rgba(228,188,75,.55)',n:'rgba(95,200,140,.55)',M:'rgba(95,149,198,.62)'};
  function cell(k,pts,x,y,txt,fs){
    return '<g class="cv'+(o.cv?' tap':'')+'" data-k="'+k+'"><polygon class="cell" points="'+pts+'" fill="'+FILL[k]+'" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linejoin="round"/>'+
     '<text class="tt" x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-family="var(--font-display)" font-weight="800" font-size="'+fs+'" fill="var(--ink)" direction="ltr">'+txt+'</text></g>';
  }
  return '<svg class="tri" viewBox="0 0 320 280" width="'+(o.w||260)+'" aria-hidden="true">'+
   cell('V','160,18 88,140 232,140',160,100,t,30)+cell('n','88,140 160,140 160,262 18,262',98,206,l,26)+cell('M','160,140 232,140 302,262 160,262',222,206,r,(r.length>9?15:22))+'</svg>';
}

/* 4 Avogadro's law and the molar volume (book page 65, table 3-5) */
slide({id:'avog',ch:1,title:'قانون أفوجادرو والحجم المولي',tag:'أكمل الجدول',
 html:function(){
  var rows=[['الهيدروجين','H<sub>2</sub>',2,null],['الأكسجين','O<sub>2</sub>',32,null],['ثاني أكسيد الكربون','CO<sub>2</sub>',null,'av1'],['الإيثان','C<sub>2</sub>H<sub>6</sub>',null,'av2']];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:430px;flex:none;gap:12px;justify-content:center">
    <div class="defc gold" style="flex:none"><b>قانون أفوجادرو</b><span>الحجوم المتساوية من الغازات المختلفة، عند درجة الحرارة والضغط نفسيهما، تحتوي على العدد نفسه من الجسيمات.</span></div>
    <div class="defc blue" style="flex:none"><b>الحجم المولي</b><span>الحجم الذي يشغله 1 mol من الغاز: يساوي <span class="num">24 L</span> عند درجة حرارة الغرفة والضغط القياسي.</span></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الكتل مختلفة (2 و32 و44 و30 g) لكن الحجم المولي <b>واحد</b>: لا يعتمد على نوع الغاز.</div></div>
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
    <table class="mtab"><thead><tr><th>الغاز</th><th>الكتلة المولية (g/mol)</th><th>الحجم المولي (L/mol)</th><th>عدد الجزيئات</th></tr></thead><tbody>
    ${rows.map(function(r){return `<tr><td style="text-align:start">${r[0]} <span class="num fmla">${r[1]}</span></td><td>${r[3]?nin(r[3],'g/mol'):'<span class="num">'+r[2]+'</span>'}</td><td><span class="num">24</span></td><td><span class="num" style="font-size:21px">6.02 × 10<sup>23</sup></span></td></tr>`}).join('')}
    </tbody></table>
    <div class="fb" style="text-align:center;min-height:26px"></div>
    <div class="sm" style="font-size:19px;text-align:center;color:var(--muted)">الجدول ٣-٥ في كتاب الطالب. الكتل الذرية: <span class="num">C = 12 ، O = 16 ، H = 1</span></div></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'av1',a:44,t:0.5,w:'✓ 12 + 2×16 = 44 g/mol',h:'M(CO₂) = 12 + 2 × 16'},{n:'av2',a:30,t:0.5,w:'✓ 2×12 + 6×1 = 30 g/mol',h:'M(C₂H₆) = 2 × 12 + 6 × 1'}],$('.fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب الطالب ص٦٥: قانون أفوجادرو، والحجم المولي ٢٤ L/mol عند درجة حرارة الغرفة والضغط القياسي، وجدول ٣-٥ (H₂ ٢، O₂ ٣٢، CO₂ ٤٤، C₂H₆ ٣٠ g/mol).</li><li>عرضك القديم (شريحة ٥) فيه الجدول نفسه وقانون أفوجادرو.</li><li>نقاط للنقاش: هل يعني الحجم المولي الواحد أن الجزيئات بالحجم نفسه؟ لا، فالمسافات بينها كبيرة.</li></ul>'});

/* 5 the molar volume depends on temperature and pressure (book page 68, "تذكّر") */
slide({id:'rtp',ch:1,title:'تذكّر: 24 L لها شروط',tag:'جرّب الحرارة',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:420px;flex:none;align-items:center;justify-content:center;gap:8px">
   <svg id="psvg" viewBox="0 0 280 300" width="300" aria-hidden="true"><rect x="40" y="20" width="200" height="250" rx="8" fill="rgba(var(--t1),.06)" stroke="var(--cyan)" stroke-width="3"/><g id="pgas"></g><g id="ppis"></g></svg>
   <div class="chips" style="gap:10px;justify-content:center"><button type="button" class="pill tbtn2" data-k="0">تبريد</button><button type="button" class="pill tbtn2 on" data-k="1">درجة حرارة الغرفة</button><button type="button" class="pill tbtn2" data-k="2">تسخين</button></div></div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="frm brk" style="padding:14px 20px;gap:6px;align-items:center"><div style="font-size:21px;font-weight:700;color:var(--muted)">حجم 1 mol من الغاز (الضغط ثابت)</div><div class="bigeq" id="pv" style="font-size:42px;color:var(--gold)">24 L</div><div class="sm" id="pt" style="font-size:21px;text-align:center">درجة حرارة الغرفة والضغط القياسي</div></div>
   <div class="panel" id="pq" style="padding:12px 18px;gap:6px"><div style="font-size:22px;font-weight:800">إذا ارتفعت درجة الحرارة والضغط ثابت، فإن حجم 1 mol من الغاز:</div>${optsHTML([{t:'يصبح أكبر من 24 L'},{t:'يصبح أقل من 24 L'},{t:'يبقى 24 L'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">القيمة <b>24 L/mol</b> تصح عند درجة حرارة الغرفة والضغط القياسي <b>وللغازات فقط</b>. لا نستخدمها للمواد الصلبة أو السائلة.</div></div></div>`;},
 init:function(el){
  var F=[0.9,1,1.25], VT=['أقل من 24 L','24 L','أكبر من 24 L'], TT=['حرارة أقل: الجزيئات أبطأ والحجم أقل','درجة حرارة الغرفة والضغط القياسي','حرارة أعلى: الجزيئات أسرع والحجم أكبر'];
  function set(k){
   var h=190*F[k], y0=262-h, svg=$('#psvg',el);
   $('#pgas',el).innerHTML=parts(46,y0+14,188,h-18,14,GC.N2,7,31);
   $('#ppis',el).innerHTML='<rect x="38" y="'+(y0-8)+'" width="204" height="14" rx="5" fill="var(--gold)"/><rect x="132" y="'+(y0-48)+'" width="16" height="42" fill="rgba(var(--t2),.7)"/><rect x="108" y="'+(y0-60)+'" width="64" height="14" rx="5" fill="var(--gold)"/>';
   svg.classList.toggle('hot',k===2); svg.classList.toggle('cold',k===0);
   $('#pv',el).textContent=(k===1?'24 L':(k===2?'> 24 L':'< 24 L')); $('#pt',el).textContent=TT[k];
   $$('.tbtn2',el).forEach(function(b,i){b.classList.toggle('on',i===k)});
  }
  $$('.tbtn2',el).forEach(function(b){b.addEventListener('click',function(){set(+b.getAttribute('data-k'))})});
  set(1);
  bindMcq($('#pq',el),[{t:'',ok:true,why:'صح: الجزيئات تتحرك أسرع وتتباعد، فيزداد الحجم المولي'},{t:'',why:'جرّب زر «تسخين» وراقب الحجم'},{t:'',why:'القيمة 24 L ثابتة فقط عند درجة حرارة الغرفة والضغط القياسي'}],$('#pq .fb',el),function(){$('#pq .opts',el).classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>كتاب الطالب ص٦٨ («تذكّر»): تُستخدم العلاقة 24 L = 1 mol عند درجة حرارة الغرفة والضغط القياسي فقط، ولحساب عدد مولات الغازات لا المواد الصلبة أو السائلة. وإذا ارتفعت الحرارة (أو انخفض الضغط) يزداد الحجم المولي.</li><li>الرسم نوعي: لا نعطي أرقاماً للحجم عند درجات الحرارة الأخرى لأن المنهج يعتمد 24 L فقط.</li></ul>'});

/* 6 the formula triangle for volume and moles */
slide({id:'tri',ch:2,title:'الحجم والمولات: المثلث',tag:'اضغط على كل زاوية',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:400px;flex:none;align-items:center;justify-content:center;gap:10px">
   ${triSVG('V (L)','n (mol)','24 L/mol',{cv:1,w:340})}
   <div class="sm" style="font-size:20px;text-align:center">اضغط على أي زاوية لتخفيها وترى العلاقة</div></div>
  <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
   <div class="frm brk" style="padding:16px 22px;gap:8px;align-items:center;min-height:150px;justify-content:center"><div class="bigeq" id="tf" style="font-size:46px;color:var(--gold)">؟</div><div class="sm" id="tfd" style="font-size:22px;text-align:center"> </div></div>
   <div class="panel" style="padding:12px 20px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">انتبه إلى الوحدات</div>
    <div class="bigeq" style="font-size:28px;direction:ltr;text-align:start">1 L = 1000 mL ، 24 L = 24000 mL</div>
    <p class="lead" style="margin:0;font-size:22px">إذا كان الحجم بوحدة <span class="num">L</span> نستخدم <b class="num">24 L/mol</b> ، وإذا كان بوحدة <span class="num">mL</span> نستخدم <b class="num">24000 mL/mol</b></p></div>
   <div class="gbar hide" id="gb" style="font-size:21px">ثلاث علاقات من مثلث واحد: <b>V = n × 24</b> ، <b>n = V ÷ 24</b> ، <b>V<sub>m</sub> = V ÷ n</b></div></div></div>`;},
 init:function(el){
  var T={V:['V = n × 24','الحجم = عدد المولات × الحجم المولي'],n:['n = V ÷ 24','عدد المولات = الحجم ÷ الحجم المولي'],M:['V<sub>m</sub> = V ÷ n','الحجم المولي = الحجم ÷ عدد المولات']}, seen={};
  $$('.cv',el).forEach(function(g){g.addEventListener('click',function(){
   var k=g.getAttribute('data-k'); $$('.cv',el).forEach(function(x){x.classList.toggle('hid',x===g)});
   $('#tf',el).innerHTML=T[k][0]; $('#tfd',el).textContent=T[k][1]; seen[k]=1;
   if(Object.keys(seen).length===3){var b=$('#gb',el); b.classList.remove('hide'); b.classList.add('up')}
  })});
 },
 note:'<ul><li>كتاب الطالب ص٦٦: عدد المولات = الحجم (L) ÷ الحجم المولي (L/mol)، والحجم المولي = 24 L/mol. المثلث نفسه في عرضك القديم (شريحة ٧).</li><li>نخفي الزاوية المطلوبة: V = n × 24 ، n = V ÷ 24. تذكير: 1000 mL = 1 L.</li></ul>'});

/* 7 example 3-4 (1): the volume of 0.12 mol of nitrogen */
chainSlide({id:'ex1',ch:2,title:'مثال ٣-٤ (١): حجم عدد معلوم من المولات',
 eq:'V = n × 24',data:'ما حجم <b class="num">0.12 mol</b> من غاز النيتروجين عند درجة حرارة الغرفة والضغط القياسي؟',
 labels:['المعطى','V بالـ L','V بالـ mL'],first:'n = 0.12 mol',eqSize:46,
 steps:[{n:'v1',q:'V = n × 24',u:'L',lab:'V =',a:2.88,t:0.03,w:'✓ 0.12 × 24 = 2.88 L',h:'اضرب عدد المولات في 24 L/mol',fill:'2.88 L'},{n:'v2',q:'حوّل إلى mL (× 1000)',u:'mL',lab:'V =',a:2880,t:30,w:'✓ 2.88 × 1000 = 2880 mL',h:'1 L = 1000 mL',fill:'2880 mL'}],
 side:'<div class="col" style="align-items:center">'+triSVG('V = ؟','0.12 mol','24 L/mol',{w:290})+'</div>',
 gbar:'الغاز نيتروجين، لكنه لا يهم: <b>1 mol</b> من أي غاز يشغل <b>24 L</b>.',
 note:'<ul><li>مثال ٣-٤ (١) في كتاب الطالب ص٦٦: V = 0.12 × 24 L/mol = 2.88 L.</li><li>نوع الغاز لا يؤثر في الحساب، وهذا ما تأكدنا منه في قانون أفوجادرو.</li></ul>'});

/* 8 example 3-4 (2): the moles in 200 mL of methane */
chainSlide({id:'ex2',ch:2,title:'مثال ٣-٤ (٢): عدد المولات من الحجم',
 eq:'n = V ÷ 24',data:'ما عدد المولات في <b class="num">200 mL</b> من غاز الميثان عند درجة حرارة الغرفة والضغط القياسي؟',
 labels:['المعطى','V بالـ L','n (mol)'],first:'V = 200 mL',eqSize:46,
 steps:[{n:'w1',q:'حوّل الحجم إلى L (÷ 1000)',u:'L',lab:'V =',a:0.2,t:0.002,w:'✓ 200 ÷ 1000 = 0.2 L',h:'mL ÷ 1000 = L',fill:'0.2 L'},{n:'w2',q:'n = V ÷ 24',u:'mol',lab:'n =',a:0.2/24,t:0.00007,w:'✓ 0.2 ÷ 24 = 0.0083 mol',h:'اقسم الحجم بالـ L على 24',fill:'0.0083 mol'}],
 side:'<div class="col" style="align-items:center">'+triSVG('0.2 L','n = ؟','24 L/mol',{w:290})+'</div>',
 gbar:'اختصار: <b>200 ÷ 24000</b> مباشرة بالـ mL تعطي النتيجة نفسها <b>0.0083 mol</b>.',
 note:'<ul><li>مثال ٣-٤ (٢) في كتاب الطالب ص٦٦: 0.2 ÷ 24 = 0.0083 mol.</li><li>يمكن أيضاً القسمة على 24000 مباشرة إذا بقي الحجم بالـ mL.</li></ul>'});

/* 9 question 3-12: the volume of given moles */
rowsSlide({id:'q312',ch:2,title:'سؤال ٣-١٢: احسب الحجم بالـ mL',
 intro:'احسب حجم كل من المواد الغازية الآتية بوحدة mL عند درجة حرارة الغرفة والضغط القياسي.',
 rows:[{n:'a',q:'أ. 1.5 mol من النيتروجين N<sub>2</sub>',u:'mL',lab:'V =',a:36000,t:300,w:'✓ 1.5 × 24000 = 36000 mL',h:'V = n × 24000 mL/mol'},{n:'b',q:'ب. 0.06 mol من الأمونيا NH<sub>3</sub>',u:'mL',lab:'V =',a:1440,t:12,w:'✓ 0.06 × 24000 = 1440 mL',h:'V = n × 24000 mL/mol'},{n:'c',q:'ج. 0.5 mol من الكلور Cl<sub>2</sub>',u:'mL',lab:'V =',a:12000,t:100,w:'✓ 0.5 × 24000 = 12000 mL',h:'V = n × 24000 mL/mol'}],
 side:'<div class="col" style="align-items:center">'+triSVG('V','n','24000 mL/mol',{w:290})+'</div>',
 gbar:'لا فرق بين النيتروجين والأمونيا والكلور: <b>V = n × 24000</b> بالـ mL.',
 note:'<ul><li>إجابات «شغل عقلك (١)» في عرضك القديم: ٣٦٠٠٠ و١٤٤٠ و١٢٠٠٠ mL.</li></ul>'});

/* 10 question 3-13: the moles of given volumes */
rowsSlide({id:'q313',ch:2,title:'سؤال ٣-١٣: احسب عدد المولات',
 intro:'احسب عدد مولات الغاز في كل من الآتي عند درجة حرارة الغرفة والضغط القياسي. انتبه إلى الوحدات.',
 rows:[{n:'a',q:'أ. 480 mL من الأرغون Ar',u:'mol',lab:'n =',a:0.02,t:0.0002,w:'✓ 480 ÷ 24000 = 0.02 mol',h:'n = V(mL) ÷ 24000'},{n:'b',q:'ب. 48 L من ثاني أكسيد الكربون CO<sub>2</sub>',u:'mol',lab:'n =',a:2,t:0.02,w:'✓ 48 ÷ 24 = 2 mol',h:'n = V(L) ÷ 24'},{n:'c',q:'ج. 1689 mL من الأكسجين O<sub>2</sub>',u:'mol',lab:'n =',a:0.0704,t:0.0006,w:'✓ 1689 ÷ 24000 = 0.0704 ≈ 0.07 mol',h:'n = V(mL) ÷ 24000'}],
 side:'<div class="col" style="align-items:center">'+triSVG('V','n = ؟','24 L/mol',{w:290})+'</div>',
 gbar:'القاعدة: <b>L ÷ 24</b> أو <b>mL ÷ 24000</b>. لا تخلط بين الوحدتين.',
 note:'<ul><li>إجابات «شغل عقلك (٢)» في عرضك القديم: ٠٫٠٢ و٢ و٠٫٠٧ mol (٠٫٠٧٠٤ تقريباً).</li><li>مطلوب في الامتحان: كتابة الوحدة، وعدد المولات بوحدة mol.</li></ul>'});

/* 11 ticket 1 */
(function(){
  var items=[
   {type:'num',q:'ما حجم <span class="num">0.5 mol</span> من غاز CO<sub>2</sub> عند درجة حرارة الغرفة والضغط القياسي؟',unit:'L',ans:12,tol:0.15,why:'0.5 × 24 = 12 L',hint:'V = n × 24'},
   {type:'num',q:'ما عدد مولات <span class="num">6 L</span> من غاز الهيدروجين H<sub>2</sub>؟',unit:'mol',ans:0.25,tol:0.003,why:'6 ÷ 24 = 0.25 mol',hint:'n = V ÷ 24'},
   {q:'<span class="num">1 mol</span> من الهيليوم و<span class="num">1 mol</span> من الأمونيا عند الظروف نفسها. حجماهما:',opts:[{t:'متساويان (24 L لكل منهما)',ok:true,why:'صح: قانون أفوجادرو'},{t:'حجم الهيليوم أكبر لأنه أخف'},{t:'حجم الأمونيا أكبر لأن كتلتها أكبر'}]},
   {type:'num',q:'ما عدد مولات <span class="num">120 mL</span> من غاز النيتروجين؟',unit:'mol',ans:0.005,tol:0.00006,why:'120 ÷ 24000 = 0.005 mol',hint:'n = V(mL) ÷ 24000'}
  ];
  slide({id:'tk1',ch:2,title:'تذكرة خروج (١): الحجم والمولات',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk1')},
   note:'<ul><li>الإجابات: ١٢ L، ٠٫٢٥ mol، متساويان، ٠٫٠٠٥ mol.</li></ul>'});
})();
