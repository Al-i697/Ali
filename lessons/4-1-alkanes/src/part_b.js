/* ---------- alkanes, part B: hydrocarbons, the alkane family, naming, the general formula, drawing the structures ---------- */

/* 6 hydrocarbons: saturated or unsaturated */
slide({id:'hydro',ch:1,title:'الهيدروكربونات: مشبعة وغير مشبعة',tag:'صنّف',
 html:function(){
  var rows=[['CH4',alkSVG(1,{w:66}),'s'],['C2H6',alkSVG(2,{w:96}),'s'],['C2H4',ene2SVG(120),'u'],['C2H2',yne2SVG(150),'u']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:420px;flex:none;gap:12px;justify-content:center">
    <div class="frm brk" style="padding:18px 22px;gap:8px"><div style="font-size:23px;font-weight:800;color:var(--cyan)">المركّب الهيدروكربوني</div>
     <p style="margin:0;font-size:27px;font-weight:800;line-height:1.4">مركّب يحتوي على <span style="color:var(--gold)">الكربون والهيدروجين فقط</span>.</p></div>
    <div class="panel" style="padding:12px 18px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--ok)">مشبعة</div><div style="font-size:21px;line-height:1.4">كل الروابط بين ذرات الكربون <b>أحادية</b>.</div>
     <div style="font-size:22px;font-weight:800;color:var(--gold);margin-top:4px">غير مشبعة</div><div style="font-size:21px;line-height:1.4">فيها رابطة <b>ثنائية أو ثلاثية</b> على الأقل بين ذرتي كربون.</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">صنّف كل هيدروكربون:</div>
    ${rows.map(function(r,i){return '<div class="cls" data-a="'+r[2]+'" style="display:grid;grid-template-columns:200px auto 1fr;gap:14px;align-items:center;background:rgba(var(--d2),.55);border-radius:16px;padding:3px 14px"><div style="display:flex;justify-content:center">'+r[1]+'</div><b class="num" style="font-size:26px">'+sub(r[0])+'</b><div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="btn" data-v="s">مشبع</button><button type="button" class="btn" data-v="u">غير مشبع</button></div></div>'}).join('')}
    <div class="fb" style="min-height:26px;text-align:center"></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الألكانات من الهيدروكربونات <b>المشبعة</b>، والألكينات من <b>غير المشبعة</b>.</div></div></div>`;},
 init:function(el){
  var left=4, fb=$('.fb',el);
  $$('.cls',el).forEach(function(r){
    $$('button',r).forEach(function(b){b.addEventListener('click',function(){
      if(r.classList.contains('ok')) return;
      if(b.getAttribute('data-v')===r.getAttribute('data-a')){ r.classList.add('ok'); r.style.boxShadow='inset 0 0 0 3px var(--ok)'; b.classList.add('ok-b'); left--; say(fb,r.getAttribute('data-a')==='s'?'✓ كل روابط الكربون أحادية: مشبع':'✓ فيه رابطة ثنائية أو ثلاثية: غير مشبع','ok'); if(!left) unhide(el) }
      else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,'عدّ نوع الروابط بين ذرتي الكربون','bad') }
    })});
  });
 },
 note:'<ul><li>كتاب الطالب ص٨٠–٨١ (الهيدروكربونات مركبات من الكربون والهيدروجين فقط، وهي أبسط أنواع المركبات العضوية) وعرض NotebookLM شريحة ٨.</li><li>غير المشبعة تُدرس في الموضوع ٤-٢ (الألكينات)، والألكاينات (رابطة ثلاثية) للتعرّف على الرابطة فقط ولا تُطلب في المنهج.</li></ul>'});

/* 7 alkanes: the key term */
slide({id:'alk',ch:1,title:'الألكانات',tag:'مصطلح علمي',
 html:function(){
  var items=[['مركّبات هيدروكربونية مشبعة','تتكوّن من الكربون والهيدروجين فقط، ولا يمكن إضافة ذرات أخرى إلى سلسلتها.'],['روابط أحادية فقط','كل الروابط بين ذرات الكربون في السلسلة أحادية.'],['الصيغة العامة <span class="num">C<sub>n</sub>H<sub>2n+2</sub></span>','n هو عدد ذرات الكربون، وعدد ذرات الهيدروجين يساوي 2n + 2.'],['اسمها ينتهي بـ «آن»','ميث<b>ان</b>، إيث<b>ان</b>، بروب<b>ان</b>، بيوت<b>ان</b>…']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:470px;flex:none;gap:12px;justify-content:center">
    <div class="frm brk" style="padding:20px 24px;gap:8px"><div style="font-size:24px;font-weight:800;color:var(--cyan)">مصطلحات علمية · Alkanes</div>
     <p style="margin:0;font-size:27px;font-weight:800;line-height:1.5"><span style="color:var(--gold)">الألكانات</span>: مركّبات هيدروكربونية مُشبَعة، تحتوي جُزيئاتها على روابط أحادية فقط بين ذرّات الكربون، وصيغتها العامة <span class="num">C<sub>n</sub>H<sub>2n+2</sub></span>، واسمها ينتهي بـ «آن».</p></div>
    <div class="panel" style="padding:10px 14px;align-items:center">${alkSVG(4,{w:360})}</div></div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">فكّك التعريف إلى أربعة أجزاء، واضغط لتفهم كل جزء:</div>
    ${cardsHTML(items)}
    <div class="gbar hide" id="gb" style="font-size:21px">رسمنا البيوتان <b class="num">C<sub>4</sub>H<sub>10</sub></b>: ٤ كربون و٢×٤+٢ = <b>١٠</b> هيدروجين.</div></div></div>`;},
 init:function(el){ bindCards(el,function(){unhide(el)}) },
 note:'<ul><li>التعريف حرفياً من كتاب الطالب ص٨٣ (مصطلحات علمية). اطلب من الطلاب أن يذكروه بكلماتهم قبل أن تفتح البطاقات.</li><li>من دليل المعلم: ابدأ بالألكانات سلسلةً متجانسة من الهيدروكربونات المشبعة، ثم الصيغة العامة والصيغتين الجزيئية والبنائية وصولاً إلى أول ستة أفراد.</li></ul>'});

/* 8 naming builder */
slide({id:'names',ch:2,title:'تسمية الألكانات: بادئة + لاحقة',tag:'ابنِ الاسم',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="width:350px;flex:none;gap:12px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:10px;align-items:center"><div style="font-size:22px;font-weight:800;color:var(--cyan)">عدد ذرات الكربون</div>${stepHTML('n','n =',1)}</div>
    <div class="panel" style="padding:12px 16px;gap:8px"><div style="font-size:21px;font-weight:800">البادئة تدل على عدد ذرات الكربون:</div>
     <div id="pf" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${PREF.map(function(p,i){return '<div class="pf" data-i="'+(i+1)+'" style="padding:6px 10px;border-radius:12px;background:rgba(var(--d2),.6);font-size:22px;font-weight:800;display:flex;gap:8px"><span class="num" style="color:var(--gold)">'+(i+1)+'</span>'+p+'</div>'}).join('')}</div></div></div>
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div class="panel" style="padding:14px 18px;align-items:center;width:100%"><div id="nm" style="font-family:var(--font-display);font-size:60px;font-weight:800;line-height:1.05"></div>
     <div id="dr" style="min-height:130px;display:flex;align-items:center"></div>
     <div id="fm" style="font-size:44px;font-weight:800;color:var(--gold)"></div><div id="rl" class="sm" style="font-size:22px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">اسم الألكان = <b>بادئة</b> (عدد ذرات الكربون) + <b>«ان»</b> (لاحقة الألكانات).</div></div></div>`;},
 init:function(el){
  var seen={}, names=['mol_methane','mol_ethane','mol_propane','mol_butane','mol_pentane','mol_hexane'];
  var st=bindStep(el,'n',1,6,function(n){
    var a=ALK[n-1]; seen[n]=1;
    $('#nm',el).innerHTML='<span style="color:var(--gold)">'+PREF[n-1]+'</span>ان';
    $('#dr',el).innerHTML=alkSVG(n,{w:Math.min(560,130+n*70)});
    $('#fm',el).innerHTML=ff(a.f);
    $('#rl',el).innerHTML='<span class="num lbl">H = 2×'+n+' + 2 = '+(2*n+2)+'</span>';
    $$('.pf',el).forEach(function(p){p.style.boxShadow=+p.getAttribute('data-i')===n?'inset 0 0 0 3px var(--gold)':'none'});
    if(typeof BG!=='undefined') BG.go(names[n-1],'violet',1);
    if(Object.keys(seen).length===6) unhide(el);
  });
  st.set(1);
 },
 note:'<ul><li>الأسماء من كتاب الطالب ص٨٤ جدول ٤-٢: ميثان، إيثان، بروبان، بيوتان، بنتان، هكسان. الطلاب مطالبون بالأربعة الأولى (دليل المعلم ٢-٢).</li><li>اضغط + و− وانظر كيف تتغيّر الخلفية الثلاثية الأبعاد إلى نموذج الجزيء نفسه الذي رسمناه.</li><li>«ميث» تعني ١ كربون، و«إيث» ٢، و«بروب» ٣، و«بيوت» ٤.</li></ul>'});

/* 9 the general formula */
slide({id:'formula',ch:2,title:'الصيغة العامة للألكانات',tag:'احسب',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div class="frm brk" style="padding:8px 20px;align-items:center;gap:2px"><div class="bigeq" style="font-size:44px;color:var(--gold)">C<sub>n</sub>H<sub>2n+2</sub></div><div class="sm" style="font-size:20px">n = عدد ذرات الكربون ← عدد ذرات الهيدروجين = 2n + 2</div></div>
    ${qline('ألكان فيه <b>5</b> ذرات كربون. كم ذرة هيدروجين؟',[['h5','ذرة']])}
    ${qline('ألكان فيه <b>8</b> ذرات كربون. كم ذرة هيدروجين؟',[['h8','ذرة']])}
    ${qline('الألكان <span class="num">C<sub>10</sub>H<sub>x</sub></span>: كم قيمة x؟',[['h10','']])}
    ${qline('ألكان فيه <b>20</b> ذرة هيدروجين. كم ذرة كربون فيه؟',[['c20','ذرة']])}
    <div class="fb" style="min-height:24px;text-align:center"></div></div>
   <div class="col" style="width:430px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:24px;font-weight:800">أيّ هذه المركّبات <u>ليس</u> ألكاناً؟</div>
     ${optsHTML([{t:'<span class="num">C<sub>3</sub>H<sub>8</sub></span>'},{t:'<span class="num">C<sub>4</sub>H<sub>10</sub></span>'},{t:'<span class="num">C<sub>5</sub>H<sub>10</sub></span>'}])}<div class="fb2 fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">لكل ألكان <b>٢n + ٢</b> هيدروجين. المركب <span class="num">C<sub>5</sub>H<sub>10</sub></span> صيغته C<sub>n</sub>H<sub>2n</sub> وهو من عائلة أخرى (الألكينات).</div></div></div>`;},
 init:function(el){
  var n=0; function d(){ n++; if(n===2) unhide(el) }
  bindSeq(el,[{n:'h5',a:12,t:.01,w:'✓ 2×5+2 = 12: الصيغة C₅H₁₂',h:'ضاعف عدد الكربون ثم أضف 2'},{n:'h8',a:18,t:.01,w:'✓ 2×8+2 = 18: الصيغة C₈H₁₈',h:'2n + 2 حيث n = 8'},{n:'h10',a:22,t:.01,w:'✓ 2×10+2 = 22: الصيغة C₁₀H₂₂',h:'2n + 2 حيث n = 10'},{n:'c20',a:9,t:.01,w:'✓ 2n + 2 = 20 ← n = 9: الصيغة C₉H₂₀',h:'2n + 2 = 20، ثم احسب n'}],$('.fb',el),d);
  bindMcq($('.panel',el),[{t:'',why:'C₃H₈ = C₃H₂ₓ₃₊₂ ألكان (البروبان)'},{t:'',why:'C₄H₁₀ ألكان (البيوتان)'},{t:'',ok:true,why:'C₅H₁₀: عدد H = 2n فقط، وليس 2n+2، فهو ليس ألكاناً'}],$('.fb2',el),d);
 },
 note:'<ul><li>الصيغة العامة C<sub>n</sub>H<sub>2n+2</sub> من تعريف الألكانات في كتاب الطالب ص٨٣ وجدول ٤-٣. الإجابات: ١٢، ١٨، ٢٢، ٩.</li><li>المركب C₅H₁₀ فخ مقصود يمهّد للألكينات ذات الصيغة العامة C<sub>n</sub>H<sub>2n</sub> في الموضوع ٤-٢.</li></ul>'});

/* 10 draw the structures: every hydrogen is pressed into place */
slide({id:'draw',ch:2,title:'أكمل الصيغة البنائية',tag:'ارسم',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div style="display:flex;gap:10px" id="tabs">${[1,2,3,4].map(function(n){return '<button type="button" class="btn tab" data-n="'+n+'">'+ALK[n-1].name+'</button>'}).join('')}</div>
    <div class="panel" style="padding:8px 14px;align-items:center;width:100%;min-height:230px;justify-content:center" id="canvas"></div>
    <div style="display:flex;align-items:center;gap:14px"><span style="font-size:23px;font-weight:800">عدد الهيدروجين:</span><b class="num" id="hc" style="font-size:38px;color:var(--gold)">0</b><span class="num" style="font-size:26px;font-weight:800" id="hm"></span></div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:350px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:24px;font-weight:800">تذكّر</div>
     <ul style="margin:0;padding-inline-start:22px;font-size:21px;line-height:1.55"><li>أظهر كل الذرات وكل الروابط.</li><li>عدّ الروابط حول كل كربون: يجب أن تكون <b>أربعاً</b> فقط.</li><li>الصيغة الجزيئية تبيّن العدد الفعلي للذرات، والبنائية تبيّن كيف ترتبط.</li></ul></div>
    <div class="gbar hide" id="gb" style="font-size:21px">أنجزت الأربعة: كل كربون له 4 روابط، وعدد H = 2n + 2.</div></div></div>`;},
 init:function(el){
  var done={}, cur=1, fb=$('.fb',el), filled;
  function load(n){
    cur=n; var f=fillSVG(n); $('#canvas',el).innerHTML=f.svg; filled=0; $('#hc',el).textContent='0'; $('#hm',el).textContent='/ '+f.count;
    $$('.tab',el).forEach(function(t){t.classList.toggle('acc',+t.getAttribute('data-n')===n)});
    $$('.hslot',el).forEach(function(g){g.addEventListener('click',function(){
      if(g.classList.contains('on')) return; g.classList.add('on'); filled++; $('#hc',el).textContent=filled;
      if(filled===f.count){ done[n]=1; say(fb,'✓ '+ALK[n-1].name+' '+ALK[n-1].f.replace(/(\d+)/g,function(m){return {0:'₀',1:'₁',2:'₂',3:'₃',4:'₄',5:'₅',6:'₆',7:'₇',8:'₈',9:'₉'}[m]||m})+': '+f.count+' هيدروجين = 2×'+n+'+2','ok'); if(Object.keys(done).length===4) unhide(el) }
      else say(fb,'','')
    })});
  }
  $$('.tab',el).forEach(function(t){t.addEventListener('click',function(){load(+t.getAttribute('data-n'))})});
  load(1);
 },
 note:'<ul><li>كتاب الطالب ص٨٤–٨٥ وسؤالا ٤-٥ و٤-٦ (أسماء الألكانات الأربعة الأولى وصيغها، ورسم الصيغة البنائية للميثان والبيوتان). دليل المعلم: اطلب رسم مخططات نقطية أو استخدم نماذج الجزيئات لبناء السلاسل.</li><li>الخطأ الشائع (دليل المعلم): خطأ في عدّ الروابط أو الذرات عند رسم الصيغ البنائية.</li></ul>'});

/* 11 match names and structures */
slide({id:'names2',ch:2,title:'اسم الألكان وصيغته',tag:'طابق',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:center">
    ${[1,2,3,4].map(function(n){return '<div style="display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:12px;align-items:center"><div style="background:rgba(var(--d2),.5);border-radius:14px;padding:4px 8px;display:flex;justify-content:center">'+alkSVG(n,{w:Math.round((108+58*(n-1))*.75)})+'</div><div class="mslot" data-k="'+n+'" style="min-height:70px"><span class="ph">الاسم والصيغة</span></div></div>'}).join('')}
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:330px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اسحب الاسم إلى صيغته (أو اضغط ثم اضغط المكان):</div>
    <div id="tray" class="tray" style="display:flex;flex-direction:column;gap:8px"></div>
    <div class="gbar hide" id="gb" style="font-size:21px">ميثان، إيثان، بروبان، بيوتان: C<sub>n</sub>H<sub>2n+2</sub> بـ n = 1 إلى 4.</div></div></div>`;},
 init:function(el){ bindMatch(el,[1,2,3,4].map(function(n){return [String(n),'<b>'+ALK[n-1].name+'</b> '+ff(ALK[n-1].f)]}).sort(function(a,b){return (a[0]*7%5)-(b[0]*7%5)}),{css:'font-size:22px;padding:10px 14px',done:'ممتاز: الأربعة صحيحة',bad:'عدّ ذرات الكربون في الرسم'}) },
 note:'<ul><li>سؤالا ٤-٥ و٤-٦ في كتاب الطالب ص٨٦. إجابة ٤-٥: ميثان CH₄، إيثان C₂H₆، بروبان C₃H₈، بيوتان C₄H₁₀.</li></ul>'});
