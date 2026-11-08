/* ---------- lesson 2-4, part B: the barrier methods, galvanising, sacrificial protection, comparing the methods ---------- */

/* 8 the barrier methods: match the method with the use (book p.46) */
slide({id:'barrier',ch:2,title:'طريقة الحاجز العازل',tag:'اسحب الطريقة إلى استخدامها',
 html:function(){
  var U=[['0','هياكل السفن والجسور وأبواب الحدائق'],['1','أجزاء الآلات المتحرّكة'],['2','الثلاجات وكراسي الحدائق'],['3','علب حفظ الأطعمة المصنوعة من الفولاذ'],['4','صناديق القمامة وسقوف الحظائر الحديدية المموجة']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    <div class="panel" style="padding:7px 14px;font-size:19px;font-weight:700;line-height:1.35">طبقة <b>عازلة</b> تمنع وصول الأكسجين والماء إلى الحديد أو الفولاذ. أيّ طريقة تناسب كل استخدام؟</div>
    ${U.map(function(u){return '<div style="display:grid;grid-template-columns:1fr 250px;gap:10px;align-items:center"><div class="panel" style="padding:6px 12px;font-size:20px;font-weight:800">'+u[1]+'</div><div class="mslot" data-k="'+u[0]+'" style="min-height:46px;display:flex;align-items:center;justify-content:center;border-radius:12px;border:2px dashed rgba(255,255,255,.5)"><span class="ph" style="font-size:16px">ضع الطريقة هنا</span></div></div>'}).join('')}
    <div class="fb" style="min-height:24px"></div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">كلها <b>حواجز عازلة</b>؛ وإذا تشقّقت الطبقة بدأ الحديد تحتها يصدأ، فتجب إعادتها.</div></div>
   <div class="col" style="width:300px;flex:none;justify-content:center"><div id="tray" class="tray" style="display:flex;flex-direction:column;gap:9px"></div></div></div>`;},
 init:function(el){
  bindMatch(el,[['0','الطلاء'],['1','التزييت والتشحيم'],['2','التغليف بالبلاستيك (PVC)'],['3','التصفيح بالقصدير'],['4','الجلفنة']],{css:'font-size:20px;padding:5px 12px;line-height:1.3;text-align:center',more:'صح! كمّل',done:'ممتاز: عرفنا الطريقة المناسبة لكل استخدام',bad:'فكّر في حجم الجسم ونوع استخدامه'});
 },
 note:'<ul><li>كتاب الطالب ص٤٦ «منع الصدأ» (طريقة الحاجز العازل): الطلاء (السفن والجسور وأبواب الحدائق، وتجب إعادته)؛ التزييت والتشحيم (أجزاء الآلات المتحرّكة، ويجب تكرار العملية)؛ التغليف بالبلاستيك (الثلاجات وكراسي الحدائق، غالباً بولي كلوريد الفينيل PVC)؛ التصفيح بالقصدير (علب القصدير من الفولاذ المُصفّح)؛ الجلفنة (صناديق القمامة وسقوف الحظائر المموجة). جواب سؤال ٢-٢٢ في الدليل: الطلاء والزيوت والشحوم والتغليف البلاستيكي.</li><li>الدليل (المفاهيم الخاطئة): قد يخلط الطلاب بين التصفيح بالقصدير والجلفنة على أنهما طريقتان متشابهتان، فكلاهما طبقة عازلة تحمي الحديد من الصدأ لكن بطريقة مختلفة: الشريحتان ١١ و١٤.</li></ul>'});

/* 9 galvanising */
slide({id:'galv',ch:2,title:'الجلفنة: الفولاذ في حوض الخارصين',tag:'اضغط على كل بطاقة',
 html:function(){
  var items=[['ما الجلفنة؟','غمس الحديد أو الفولاذ في حوض من <b>الخارصين المنصهر</b>، ثم إخراجه وتركه ليبرد فتتكوّن طبقة واقية على سطحه.'],
             ['لماذا الخارصين؟','الخارصين <b>أنشط</b> من الحديد، فيتفاعل هو أولاً مع الأكسجين والماء: <span class="num">2Zn + O₂ → 2ZnO</span> وتقوى طبقة الحماية.'],
             ['لو خُدشت الطبقة؟','تستمر الحماية: الخارصين له قابلية أكبر لتكوين الأيونات الموجبة <span class="num">Zn²⁺</span> فيمنع تكوّن <span class="num">Fe³⁺</span> ولا يصدأ الحديد.']];
  var svg='<svg viewBox="0 0 320 210" aria-hidden="true" style="direction:ltr;display:block;width:100%;height:100%"><rect x="30" y="126" width="260" height="66" rx="8" fill="#5a6a80" stroke="#c9d6e6" stroke-width="3"/><rect x="36" y="132" width="248" height="54" rx="5" fill="#a8c4e2"/>'+
   '<path d="M40 138Q70 130 100 138T160 138T220 138T280 138" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>'+
   '<rect x="140" y="14" width="42" height="150" rx="4" fill="#7a8596"/><rect x="132" y="150" width="58" height="22" fill="#c4d6ea" opacity=".9"/>'+
   '<path d="M161 4V-0" stroke="#fff"/><path d="M200 24V74" stroke="#ffe27a" stroke-width="5" marker-end="url(#a9)"/><defs><marker id="a9" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="22" refX="11" refY="11" orient="auto"><path d="M0 0L22 11L0 22z" fill="#ffe27a"/></marker></defs>'+
   '<g font-family="Cairo,sans-serif" font-weight="800" font-size="22" fill="#fff" stroke="rgba(0,0,0,.6)" stroke-width="3" paint-order="stroke" text-anchor="middle"><text x="161" y="78">Fe</text><text x="70" y="172">Zn(l)</text></g></svg>';
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="width:400px;flex:none;gap:10px;justify-content:center"><div class="panel" style="padding:10px 14px;height:250px">${svg}</div>
    <div class="panel compact" id="q" style="padding:10px 14px;gap:7px"><div style="font-size:20px;font-weight:800">لماذا نستعمل الخارصين تحديداً؟</div>${optsHTML([{t:'لأنه أنشط من الحديد'},{t:'لأنه أقل نشاطاً من الحديد'},{t:'لأنه أثقل من الحديد'}])}<div class="fb" style="min-height:22px"></div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">${cardsHTML(items,'')}
    <div class="gbar hide" id="gb" style="font-size:19px;padding:7px 14px">الجلفنة: غطاء <b>وقاية كيميائية</b>؛ الخارصين الأنشط يتفاعل بدلاً من الحديد.</div></div></div>`;},
 init:function(el){
  var cards=false,q=false; function chk(){ if(cards&&q) unhide(el) }
  bindCards(el,function(){cards=true; chk()});
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الخارصين الأنشط يتفاعل بدلاً من الحديد'},{t:'',why:'لو كان أقل نشاطاً لما تفاعل بدلاً من الحديد'},{t:'',why:'الثقل لا علاقة له بالحماية الكيميائية'}],$('#q .fb',el),function(){q=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٤٦: «يمكن لجسم مصنوع من الحديد أو الفولاذ أن يُغلَّف بطبقة من الخارصين؛ وهو فلز أكثر نشاطاً كيميائياً من الحديد. يتمّ ذلك بغمس الجسم في حوض من الخارصين (المنصهر)، ثم يُزال ويُترك ليبرد، فتتشكّل على سطحه طبقة واقية»؛ المعادلة <span class="num">2Zn(s) + O₂(g) → 2ZnO(s)</span>؛ ويؤدّي أكسيد الخارصين إلى تقوية الطبقة. «وتستمر الحماية بعملها حتى وإن كانت طبقة الخارصين مخدوشة، وذلك لأنّ الخارصين لديه قابلية أكبر لتشكيل أيونات موجبة من قابلية الحديد»؛ <span class="num">3Zn(s) + 2Fe³⁺ → 3Zn²⁺ + 2Fe(s)</span>. الأدوات المجلفنة: صناديق القمامة وسقوف الحظائر المموجة.</li><li>الدليل (سؤال ٢-٢٣): طريقة الجلفنة يُستخدم فيها الخارصين لتغطية الفولاذ أو الأجسام الحديدية بدلاً من الحديد، حيث يتفاعل عوضاً عن الفولاذ المراد حمايته. هدف ٧-٩ (جزء الخارصين في الجلفنة). والخارصين يُستخدم أيضاً في صناعة النحاس الأصفر (٢-٣، الجدول ٢-٥: Cu ٧٠٪ وZn ٣٠٪).</li><li>الصورة الخلفية أبراج فولاذية (من صورك السابقة).</li></ul>'});

/* 10 the equation of the protective layer, balanced by the student, and the ionic equation */
slide({id:'galvlad',ch:2,title:'معادلات الجلفنة',tag:'وازن ثم اختر',
 html:function(){
  return `<div class="col" style="flex:1;gap:8px;min-height:0">
   <div class="panel" style="padding:8px 14px" id="balhost"></div>
   <div class="panel compact hide" id="q" style="padding:10px 18px;gap:7px"><div style="font-size:21px;font-weight:800">إذا بقي الحديد على تماس مع الخارصين، أيّ معادلة تعبّر عن منع تكوّن أيون الحديد الموجب؟</div>
    ${optsHTML([{t:eqn('3Zn(s) + 2Fe^3+ → 3Zn^2+ + 2Fe(s)')},{t:eqn('3Fe(s) + 2Zn^3+ → 3Fe^2+ + 2Zn(s)')},{t:eqn('Zn(s) + 2Fe^3+ → Zn^2+ + 2Fe(s)')}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الخارصين <b>يمنح الإلكترونات</b> لأيونات الحديد فتعود ذرات حديد: لا صدأ.</div></div>`;},
 init:function(el){
  EQL.balancer($('#balhost',el),{l:[{f:'Zn',st:'s'},{f:'O2',st:'g'}],r:[{f:'ZnO',st:'s'}],co:[2,1,2],tip:'الأكسجين ذرتان في O₂، وفي كل ZnO ذرة واحدة.'},{onSolved:function(){ $('#q',el).classList.remove('hide') }});
  bindMcq($('#q',el),[{t:'',ok:true,why:'موزونة: الذرات والشحنات متساوية (+٦ في الطرفين)'},{t:'',why:'عكسنا الأدوار: الفلز الأنشط (Zn) هو الذي يفقد الإلكترونات لا الحديد'},{t:'',why:'غير موزونة: الشحنة +٦ على اليسار و+٢ على اليمين'}],$('#q .fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٤٦: <span class="num">2Zn(s) + O₂(g) → 2ZnO(s)</span> و<span class="num">3Zn(s) + 2Fe³⁺ → 3Zn²⁺ + 2Fe(s)</span>. والإجابات المماثلة في نماذج الامتحانات (٢٠٢٢/٢٠٢٣ الدور الثاني س٩؛ ٢٠٢٣/٢٠٢٤ الدور الثاني س١٦). ميزان الذرات من ورشة المعادلات.</li><li>الدرجة الأيونية الصافية للمعادلة الأخيرة مأخوذة من الكتاب كما هي.</li></ul>'});

/* 11 tin plating or galvanising: what happens when the coat is scratched */
slide({id:'scratch',ch:2,title:'خُدشت الطبقة: ماذا يحدث؟',tag:'اضغط الأزرار بالترتيب',
 html:function(){
  return `<div class="col" style="flex:1;gap:8px;min-height:0">
   <div class="scw" id="scw"><div class="scp"><h4>الفولاذ المصفّح بالقصدير</h4><div class="sv">${scratchSVG('tin')}</div><div class="cap" id="ct">طبقة القصدير (فلز <b>أقل</b> نشاطاً من الحديد) تغطي الفولاذ.</div></div>
    <div class="scp"><h4>الفولاذ المجلفن</h4><div class="sv">${scratchSVG('zn')}</div><div class="cap" id="cz">طبقة الخارصين (فلز <b>أنشط</b> من الحديد) تغطي الفولاذ.</div></div></div>
   <div style="display:flex;gap:12px;justify-content:center"><button type="button" class="btn acc" id="b1">١ · اخدش الطبقة</button><button type="button" class="btn acc" id="b2">٢ · عرّضها للماء والأكسجين</button></div>
   <div class="panel compact hide" id="q" style="padding:10px 18px;gap:7px"><div style="font-size:21px;font-weight:800">أيّ الطريقتين تستمر في حماية الحديد بعد الخدش؟</div>
    ${optsHTML([{t:'الجلفنة'},{t:'التصفيح بالقصدير'},{t:'الطريقتان معاً'}])}<div class="fb" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">القصدير <b>حاجز فقط</b>؛ أما الخارصين فحاجز <b>وحماية كيميائية</b>.</div></div>`;},
 init:function(el){
  var w=$('#scw',el);
  $('#b1',el).addEventListener('click',function(){ w.classList.add('s1'); $('#b1',el).disabled=true; $('#ct',el).innerHTML='الخدش كشف الحديد.'; $('#cz',el).innerHTML='الخدش كشف الحديد.' });
  $('#b2',el).addEventListener('click',function(){ if(!w.classList.contains('s1')||w.classList.contains('s2')) return; w.classList.add('s2'); $('#b2',el).disabled=true;
   $('#ct',el).innerHTML='الحديد <b>أنشط</b> من القصدير فيصدأ، والصدأ يتسع تحت الطبقة.'; $('#cz',el).innerHTML='الخارصين <b>الأنشط</b> يتفاعل أولاً (<span class="num">Zn → Zn²⁺</span>) فلا يصدأ الحديد.';
   later(function(){ $('#q',el).classList.remove('hide') },900) });
  bindMcq($('#q',el),[{t:'',ok:true,why:'صحيح: الخارصين يتفاعل بدلاً من الحديد حتى مع الخدش'},{t:'',why:'مع القصدير يصدأ الحديد عند الخدش: القصدير أقل نشاطاً من الحديد'},{t:'',why:'تفرق الطريقتان: واحدة فقط تستمر في الحماية'}],$('#q .fb',el),function(){unhide(el)});
 },
 note:'<ul><li>كتاب الطالب ص٤٦: التصفيح بالقصدير: «يُستخدم القصدير لأن نشاطه الكيميائي أقلّ بكثير من الحديد وهو غير سام. ومع ذلك، فإن استخدامه يثير مشكلة؛ فإذا تشقّقت الطبقة الواقية، سوف يبدأ الفولاذ الموجود تحت هذه الطبقة بالصدأ». أما الجلفنة فتستمر حمايتها وإن كانت طبقة الخارصين مخدوشة. في عرضك: «تستمر طبقة الحماية حتى وإن حدث خدش في طبقة الخارصين».</li><li>تعارض مع عرضك: شريحة التصفيح بالقصدير في عرضك وعرض NotebookLM تذكر القصدير «غير سام وأقل نشاطاً من الحديد» دون تحذير الخدش الذي ذكره الكتاب؛ أضفتُ التحذير لأنه سبب الفرق بين الطريقتين (وهو المفهوم الخاطئ المذكور في الدليل).</li><li>سؤال ٢٠٢٥/٢٠٢٦ الدور الأول س٩ (أنبوب مجلفن مخدوش لم تتغير كتلته) في شريحة امتحانات.</li></ul>'});

/* 12 sacrificial (cathodic) protection of a ship's hull (Fig 2-6) */
slide({id:'sacr',ch:2,title:'الحماية المهبطية بالتضحية',tag:'اضغط «التالي»',
 html:function(){
  var S=['هيكل السفينة من الفولاذ (الحديد بشكل رئيسي) ويتعرّض للماء والأكسجين والملح.','نربط بالهيكل كتلة أو قضيباً من فلز <b>أنشط</b> من الحديد، مثل الماغنيسيوم أو الخارصين.','تتحرّك <b>الإلكترونات</b> من الماغنيسيوم إلى الحديد، فلا يفقد الحديد إلكتروناته.','الماغنيسيوم هو الذي يتحوّل إلى أيونات موجبة <span class="num">Mg → Mg²⁺ + 2e⁻</span>: «يُضحّى» بالكتلة وتُستبدل عند استهلاكها.'];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch;min-height:0">
   <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center"><div class="panel shipw" id="shw" style="padding:8px 12px;height:290px">${shipSVG()}</div>
    <div class="gbar hide" id="gb" style="font-size:19px;padding:7px 14px">كتلة الفلز الأنشط تسمّى <b>قطب التضحية الأنودي</b>؛ <span class="num">Mg + Fe²⁺ → Mg²⁺ + Fe</span>.</div></div>
   <div class="col" style="width:440px;flex:none;gap:9px;justify-content:center"><div class="panel" style="padding:10px 12px"><ol class="sstep" id="ss">${S.map(function(s){return '<li>'+s+'</li>'}).join('')}</ol></div>
    <div style="display:flex;justify-content:center"><button type="button" class="btn acc" id="sn">التالي ◂</button></div></div></div>`;},
 init:function(el){
  var i=0, ss=$$('#ss li',el), w=$('#shw',el), btn=$('#sn',el);
  function show(){ ss.forEach(function(l,j){ l.classList.toggle('on',j===i) }); w.className='panel shipw'+(i?' s'+i:''); if(i===3){ btn.classList.add('hide'); unhide(el) } }
  btn.addEventListener('click',function(){ if(i<3){ i++; show() } }); show();
 },
 note:'<ul><li>كتاب الطالب ص٤٦–٤٧ (الشكل ٢-٦): هيكل السفينة من الفولاذ (الحديد بشكل رئيسي)؛ كتلة أو قضيب من الماغنيسيوم ربط بها؛ تتحرك الإلكترونات من قضيب الماغنيسيوم إلى هيكل السفينة؛ <span class="num">Mg + Fe²⁺ → Mg²⁺ + Fe</span>؛ «وبما أنّ الماغنيسيوم غالباً ما يكون على تماس مباشر مع الماء، فإن الأيونات التي يكوّنها يتم التخلص منها. أي تتمّ «التضحية» بفلز الماغنيسيوم بهدف حماية الفولاذ أو الحديد من الصدأ». وعند استهلاك الفلز يجب استبدال كتلته. تُسمّى الكتلة النشطة قطب التضحية الأنودية Sacrificial anode ويُسمّى الجسم المحمي مهبطاً Cathode (للتوسّع).</li><li>تنبيه لغوي: عرضك يقول «يتم التضحية بأيونات المغنيسيوم»؛ الكتاب يقول: يُضحّى بالفلز (ذرات Mg تتحوّل إلى أيونات). اتبعتُ الكتاب.</li><li>أنابيب الغاز والنفط تحت الأرض تُربط بكتل من الماغنيسيوم أيضاً، وكذلك منصات النفط. الصورة الخلفية أنابيب (من صورك السابقة).</li></ul>'});

/* 13 which metals can be the sacrificial block? */
slide({id:'sacrq',ch:2,title:'أيّ فلز يصلح قطب تضحية للحديد؟',tag:'يحمي أو لا يحمي',
 html:function(){
  var M=[['Mg','y','الماغنيسيوم أنشط من الحديد فيتفاعل بدلاً منه'],['Zn','y','الخارصين أنشط من الحديد فيتفاعل بدلاً منه'],['Cu','n','النحاس أقل نشاطاً من الحديد: لا يتفاعل بدلاً منه فلا يحميه'],['Sn','n','القصدير أقل نشاطاً من الحديد: لا يحمي إذا خُدش'],['Ag','n','الفضة أقل نشاطاً بكثير من الحديد']];
  var items=M.map(function(m){ return ['<span class="num" style="font-size:30px;font-weight:800;color:var(--gold)">'+m[0]+'</span>',m[1],m[2]] });
  return `<div class="col" style="flex:1;gap:8px;min-height:0;justify-content:center">
   <div class="panel" style="padding:8px 16px;text-align:center"><div style="font-size:19px;font-weight:700;color:var(--cyan)">ترتيب النشاط (من الأنشط إلى الأقل)</div><div style="font-size:30px;font-weight:800;direction:ltr">${eqn('Mg > Zn > Fe > Sn > Cu > Ag')}</div></div>
   ${clsHTML(items,[['y','يحمي'],['n','لا يحمي']],22)}
   <div class="fb" style="min-height:26px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">يحمي الحديد فقط الفلز <b>الأنشط</b> منه: ماغنيسيوم أو خارصين (مع ألومنيوم وغيرها).</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'قارن موقعه بموقع الحديد في سلسلة النشاط') },
 note:'<ul><li>الدليل (هدف ٧-٨): الحماية المهبطية بأقطاب التضحية «في ضوء سلسلة نشاط الفلزّات»؛ كتاب الطالب ص٤٦: «كتل من فلز نشط متصلة بسطح جسم مصنوع من الفولاذ أو الحديد»، مثل الماغنيسيوم والخارصين. وفي نموذج امتحان ٢٠٢٢/٢٠٢٣ الدور الأول (صباحي) س٨: أسلاك Zn وCu وMg ملفوفة على مسامير: الفشل في المسمار الملفوف بالنحاس فقط (شريحة امتحانات).</li><li>ترتيب النشاط المعروض من سلسلة النشاط في الدرسين ١-٤ و٢-١ (الكتاب ص٣٧: Zn وFe وSn)؛ موقع Sn أقل نشاطاً من Fe ورد في الكتاب ص٤٦ عند التصفيح بالقصدير.</li></ul>'});

/* 14 comparing the methods */
slide({id:'cmp',ch:2,title:'قارن بين طرق الحماية',tag:'اختر الطريقة',
 html:function(){
  var items=[['تحمي الحديد ما دامت الطبقة <b>غير مخدوشة</b> فقط','p','إذا تشقّقت الطبقة بدأ الحديد تحتها بالصدأ'],
             ['تستمر الحماية <b>حتى لو خُدشت</b> طبقة الفلز التي تغطي الحديد','g','الخارصين الأنشط يتفاعل بدلاً من الحديد'],
             ['يكفي أن تلامس كتلة <b>صغيرة</b> من فلز أنشط الجسم دون تغطيته كله','s','مثل السفن وأنابيب النفط: لا يغطي الفلز الجسم كاملاً'],
             ['يغطي الحديد بفلز <b>أقل نشاطاً</b> منه لأنه غير سام (علب الأطعمة)','p','القصدير: غير سام وأقل نشاطاً، لكن الخدش مشكلة'],
             ['يجب <b>استبدال</b> الكتلة عند استهلاكها','s','«التضحية» بالفلز الأنشط تستهلكه مع الزمن']];
  return `<div class="col" style="flex:1;gap:7px;min-height:0;justify-content:center">${clsHTML(items,[['p','طلاء أو قصدير'],['g','جلفنة'],['s','قطب تضحية']],20)}
   <div class="fb" style="min-height:26px"></div>
   <div class="gbar hide" id="gb" style="font-size:19px;padding:6px 14px">الطلاء والقصدير <b>حاجز</b>؛ الجلفنة <b>حاجز + حماية كيميائية</b>؛ قطب التضحية <b>حماية كيميائية</b> فقط.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'تذكّر: ماذا يحدث عند الخدش؟ وهل يغطي الفلز الجسم كله؟') },
 note:'<ul><li>كتاب الطالب ص٤٦–٤٧: الحاجز العازل (طلاء، شحم، بلاستيك، قصدير)، والجلفنة (طبقة خارصين أنشط)، والحماية بالتضحية (كتل صغيرة تلامس الجسم: «لا يحتاج الجسم إلى أن يكون مغطّى كلّياً بالفلز الواقي، بل يحتاج فقط أن يكون على تماس مع كمّية ضئيلة منه»). هذا يُسهم في ما ورد في المفاهيم الخاطئة في الدليل (الخلط بين التصفيح والجلفنة والحماية بالتضحية).</li><li>تقابل س٨ (أ) من امتحان ٢٠٢٢/٢٠٢٣ الدور الأول (صباحي): ميزة الحماية بالتضحية على الجلفنة.</li></ul>'});
