/* ---------- alkenes, part B: physical properties, chemical activity, combustion ---------- */
var MX=function(a,b){return Math.max(a,b)};
/* a small graph with grid and axes: pts [[x,y]], options {w,h,xmin,xmax,ymin,ymax,xl,yl,line,dots} */
function plotSVG(pts,o){
  var w=o.w||400,h=o.h||260,pl=58,pr=14,pt=14,pb=44,x0=o.xmin,x1=o.xmax,y0=o.ymin,y1=o.ymax;
  function X(x){return pl+(x-x0)/(x1-x0)*(w-pl-pr)} function Y(y){return h-pb-(y-y0)/(y1-y0)*(h-pt-pb)}
  var s='',i,t;
  for(i=0;i<=(o.xt||(x1-x0));i++){t=x0+i*(x1-x0)/(o.xt||(x1-x0)); s+='<line x1="'+X(t)+'" y1="'+pt+'" x2="'+X(t)+'" y2="'+(h-pb)+'" stroke="rgba(255,255,255,.12)"/><text x="'+X(t)+'" y="'+(h-pb+18)+'" text-anchor="middle" font-size="15" fill="#cfe">'+Math.round(t*10)/10+'</text>'}
  for(i=0;i<=(o.yt||4);i++){t=y0+i*(y1-y0)/(o.yt||4); s+='<line x1="'+pl+'" y1="'+Y(t)+'" x2="'+(w-pr)+'" y2="'+Y(t)+'" stroke="rgba(255,255,255,.12)"/><text x="'+(pl-6)+'" y="'+(Y(t)+5)+'" text-anchor="end" font-size="15" fill="#cfe">'+Math.round(t)+'</text>'}
  s+='<line x1="'+pl+'" y1="'+(h-pb)+'" x2="'+(w-pr)+'" y2="'+(h-pb)+'" stroke="#9fb4b8" stroke-width="2"/><line x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(h-pb)+'" stroke="#9fb4b8" stroke-width="2"/>';
  s+='<text x="'+((pl+w-pr)/2)+'" y="'+(h-6)+'" text-anchor="middle" font-size="15" font-weight="700" fill="#e8f">'+(o.xl||'')+'</text><text transform="translate(14,'+((pt+h-pb)/2)+') rotate(-90)" text-anchor="middle" font-size="15" font-weight="700" fill="#e8f">'+(o.yl||'')+'</text>';
  if(o.line!==false&&pts.length>1) s+='<polyline fill="none" stroke="#E4BC4B" stroke-width="3" points="'+pts.map(function(p){return X(p[0])+','+Y(p[1])}).join(' ')+'"/>';
  pts.forEach(function(p,i){ s+='<circle class="pt" cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="6" fill="#fff" stroke="#E4BC4B" stroke-width="3"'+(o.ids?' data-i="'+i+'"':'')+'/>' });
  return '<svg viewBox="0 0 '+w+' '+h+'" width="'+(o.sw||w)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+'</svg>';
}

/* 8 states at a chosen temperature */
slide({id:'states',ch:2,title:'درجة الغليان والحالة الفيزيائية',tag:'جرّب',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:8px"><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:23px;font-weight:800">درجة الحرارة</span><b class="num lbl" id="tv" style="font-size:44px;color:var(--gold)">25 °C</b><button type="button" class="btn" id="rt">درجة حرارة الغرفة</button></div>
     <input class="tr" id="tr" type="range" min="-120" max="80" step="1" value="-120" aria-label="درجة الحرارة"></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${ENE.map(function(a){return '<div class="tile" data-bp="'+a.bp+'"><b style="font-size:26px">'+a.name+'</b>'+ff(a.f)+'<span class="sm" style="font-size:19px">يغلي عند <span class="num lbl">'+(a.n===6?'≈ ':'')+a.bp+' °C</span></span><span class="st"></span></div>'}).join('')}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:340px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:23px;font-weight:800">الجدول ٤-٦ في الكتاب</div>
     <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:22px;line-height:1.35"><span class="num" style="color:var(--gold);font-weight:800">C<sub>2</sub> – C<sub>4</sub></span><span>غازات عند 25 °C</span><span class="num" style="color:var(--gold);font-weight:800">C<sub>5</sub> فأكثر</span><span>سوائل</span></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الإيثين والبروبين والبيوتين غازات عند 25 °C لأن درجة غليانها أقل من 25. والبنتين والهكسين سائلان.</div></div></div>`;},
 init:function(el){
  var tr=$('#tr',el), seen=false;
  function upd(){
    var t=+tr.value; $('#tv',el).textContent=t+' °C';
    $$('.tile',el).forEach(function(c){var gas=t>=+c.getAttribute('data-bp'); c.classList.toggle('gas',gas); c.classList.toggle('liq',!gas); $('.st',c).textContent=gas?'غاز':'سائل'});
    if(t===25&&!seen){seen=true; unhide(el); say($('.fb',el),'عند 25 °C: ٣ غازات وسائلان، لأن درجة غليان البنتين 30 والهكسين ≈ 60','ok')}
  }
  tr.addEventListener('input',upd); $('#rt',el).addEventListener('click',function(){tr.value=25; upd()}); upd();
 },
 note:'<ul><li>الجدول ٤-٦ في كتاب الطالب ص٨٧: إيثين C₂H₄ (−104 °C، غاز)، بروبين C₃H₆ (−47 °C، غاز)، بيوتين C₄H₈ (−6 °C، غاز)، بنتين C₅H₁₀ (30 °C، سائل). الهكسين C₆H₁₂ ≈ 60 °C من إجابة تمرين ٤-٢ في دليل المعلم (بين 58 و62).</li><li>تنبيه: دليل المعلم (تمرين ٤-٢ ب) يكتب القيم −102، −48، −7، 30، 60 بدلاً من −104، −47، −6، 30. اعتمدنا أرقام كتاب الطالب لأنه المرجع، وكلتاهما تعطي الحالة نفسها عند 25 °C.</li></ul>'});

/* 9 plot boiling point against carbon number */
slide({id:'plotE',ch:2,title:'التمثيل البياني لدرجات الغليان',tag:'ارسم',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div class="panel" style="padding:10px 16px;align-items:center"><div id="pl"></div></div>
    <div style="display:flex;gap:12px;align-items:center"><button type="button" class="btn acc" id="nx">ارسم النقطة التالية ▸</button><span class="sm" id="pn" style="font-size:20px"></span></div>
    <div class="gbar hide" id="gb" style="font-size:21px">كلما ازداد عدد ذرات الكربون في السلسلة ارتفعت درجة الغليان، لأن الجزيئات تصير أكبر.</div></div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel" id="qp" style="padding:14px 18px;gap:8px"><div style="font-size:23px;font-weight:800">ماذا تلاحظ على درجات الغليان؟</div>
     ${optsHTML([{t:'ترتفع تدريجياً بزيادة عدد ذرات الكربون'},{t:'تنخفض بزيادة عدد ذرات الكربون'},{t:'تبقى ثابتة'}])}<div class="fb" style="min-height:24px"></div></div></div></div>`;},
 init:function(el){
  var k=0, pts=ENE.map(function(a){return [a.n,a.bp]}), ready=false, ok=false;
  function draw(){ $('#pl',el).innerHTML=plotSVG(pts.slice(0,k),{w:520,h:330,xmin:0,xmax:7,ymin:-150,ymax:100,xl:'عدد ذرات الكربون',yl:'درجة الغليان (°C)',yt:5,xt:7}) }
  draw(); $('#pn',el).textContent='0 / 5 نقاط';
  $('#nx',el).addEventListener('click',function(){ if(k<5){k++; draw(); $('#pn',el).innerHTML='<span class="num lbl">'+k+' / 5 · '+ENE[k-1].name+' '+ENE[k-1].bp+' °C</span>'; if(k===5){this.classList.add('hide'); ready=true; if(ok) unhide(el)}} });
  bindMcq($('#qp',el),[{t:'',ok:true,why:'صح: النقاط تصعد تدريجياً من −104 إلى 60 °C'},{t:'',why:'انظر إلى اتجاه النقاط: صاعد'},{t:'',why:'النقاط ليست على خط أفقي'}],$('.fb',el),function(){ok=true; if(ready) unhide(el)});
 },
 note:'<ul><li>اطلب من الطلاب أولاً رسم النقاط على ورق بياني (مثل سؤال ٤-٧ للألكانات) ثم اضغط لتظهر. التمثيل البياني: درجة الغليان مقابل عدد ذرات الكربون.</li><li>النمط نفسه في الألكانات (٤-١): ارتفاع تدريجي بزيادة طول السلسلة.</li></ul>'});

/* 10 why the boiling point rises */
slide({id:'whyE',ch:2,title:'لماذا ترتفع درجة الغليان؟',tag:'فسّر',
 html:function(){
  var items=[['أطول سلسلة ← جزيء أكبر','يزداد حجم الجزيء وكتلته المولية (Mr).'],['تزداد قوى التجاذب بين الجزيئات','القوى بين الجزيئات (Intermolecular forces) تقوى كلما كبرت الجزيئات.'],['تحتاج طاقة أكبر لفصل الجزيئات','فترتفع درجة الغليان.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:10px"><div style="display:flex;align-items:center;gap:16px"><span style="font-size:23px;font-weight:800">عدد ذرات الكربون</span>${stepHTML('n','n =',2)}<b id="an" style="font-size:30px;color:var(--gold)"></b></div>
     <div style="display:grid;grid-template-columns:200px 1fr 90px;gap:8px 14px;align-items:center;font-size:20px;font-weight:700"><span>الكتلة المولية Mr</span><div class="cbar"><i id="b1" style="width:0"></i></div><b class="num lbl" id="v1"></b><span>قوى التجاذب</span><div class="cbar b2"><i id="b2" style="width:0"></i></div><b class="num" id="v2" style="font-size:19px">ضعيفة</b><span>درجة الغليان</span><div class="cbar"><i id="b3" style="width:0"></i></div><b class="num lbl" id="v3"></b></div></div>
    ${cardsHTML(items)}</div>
   <div class="col" style="width:300px;flex:none;gap:10px;justify-content:center"><div class="panel" style="padding:12px 12px;align-items:center;gap:8px"><div id="mc"></div><div class="sm" style="font-size:19px;text-align:center">الجزيئات الكبيرة تتجاذب أكثر</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">سلسلة أطول ← قوى تجاذب أقوى ← طاقة أكبر لفصل الجزيئات ← درجة غليان أعلى.</div></div></div>`;},
 init:function(el){
  var seen={}, cards=false;
  bindCards(el,function(){cards=true; if(Object.keys(seen).length===5) unhide(el)});
  var st=bindStep(el,'n',2,6,function(n){
    var a=ENE[n-2]; seen[n]=1; var mr=14*n;
    $('#an',el).textContent=a.name; $('#v1',el).textContent=mr; $('#v3',el).textContent=(n===6?'≈ ':'')+a.bp+' °C';
    $('#b1',el).style.width=(mr/84*100)+'%'; $('#b2',el).style.width=(n/6*100)+'%'; $('#b3',el).style.width=((a.bp+150)/210*100)+'%';
    $('#v2',el).textContent=n<3?'ضعيفة':n<5?'أقوى':'قوية';
    $('#mc',el).innerHTML=eneSVG(n,{w:Math.min(250,60+n*36)});
    if(cards&&Object.keys(seen).length===5) unhide(el);
  });
  st.set(2);
 },
 note:'<ul><li>كتاب الطالب ص٨٦ والتفسير نفسه في الألكانات: كلما كبرت الجزيئات ازدادت قوى التجاذب بين الجزيئات، فيلزم طاقة أكبر لفصلها، فترتفع درجة الغليان. (شريحة «قوى التجاذب بين الجزيئات» في عرض NotebookLM وعرضك القديم: سلسلة قصيرة ← تجاذب ضعيف، سلسلة طويلة ← تجاذب قوي.)</li><li>التفسير بالتجاذب بين الجزيئات وليس بكسر الروابط داخل الجزيء.</li></ul>'});

/* 11 chemical activity: the addition reaction */
slide({id:'react',ch:3,title:'لماذا الألكينات نشطة؟ تفاعل الإضافة',tag:'شاهد',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="width:500px;flex:none;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط «الخطوة التالية» وراقب الرابطة الثنائية:</div>
    ${animHTML('an')}</div>
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div class="frm brk" style="padding:12px 18px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">مصطلحات علمية · Addition reaction</div>
     <p style="margin:0;font-size:23px;font-weight:800;line-height:1.45"><span style="color:var(--gold)">تفاعل الإضافة</span>: تفاعل يتم فيه دمج مادتين معاً لتكوين <b>مادة ناتجة واحدة فقط</b>، مثل التفاعل بين الألكينات والبروم.</p></div>
    <div class="panel" style="padding:10px 14px;gap:6px"><div style="font-size:21px;font-weight:800">أي هذه تفاعل إضافة؟</div>
     ${clsHTML([['<span class="num lbl" style="direction:ltr;display:inline-block">C<sub>2</sub>H<sub>4</sub> + 3O<sub>2</sub> → 2CO<sub>2</sub> + 2H<sub>2</sub>O</span>','c','نواتجه اثنان (CO₂ وH₂O): هذا احتراق'],['<span class="num lbl" style="direction:ltr;display:inline-block">C<sub>2</sub>H<sub>4</sub> + Br<sub>2</sub> → C<sub>2</sub>H<sub>4</sub>Br<sub>2</sub></span>','a','مادتان تعطيان ناتجاً واحداً'],['<span class="num lbl" style="direction:ltr;display:inline-block">C<sub>2</sub>H<sub>4</sub> + H<sub>2</sub> → C<sub>2</sub>H<sub>6</sub></span>','a','مادتان تعطيان ناتجاً واحداً'],['<span class="num lbl" style="direction:ltr;display:inline-block">C<sub>2</sub>H<sub>4</sub> + H<sub>2</sub>O → C<sub>2</sub>H<sub>5</sub>OH</span>','a','مادتان تعطيان ناتجاً واحداً']],[['a','إضافة'],['c','احتراق']],20)}
     <div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الرابطة الثنائية تجعل الألكينات <b>أنشط</b> من الألكانات: تنكسر إحدى الرابطتين فتُضاف ذرتان جديدتان.</div></div></div>`;},
 init:function(el){
  var a=false,c=false; function chk(){ if(a&&c) unhide(el) }
  bindAnim(el,'an','X','Y',['جزيء ألكين فيه رابطة ثنائية <b class="num">C=C</b>، وجزيء <b class="num">X–Y</b> يقترب منه.','تنكسر <b>إحدى</b> الرابطتين في C=C، وتنكسر الرابطة X–Y.','تتكوّن <b>رابطتان أحاديتان جديدتان</b>: X مع كربون وY مع الكربون الآخر. ناتج واحد فقط.'],function(){a=true; chk()},400);
  bindCls(el,$('.fb',el),function(){c=true; chk()},'تفاعل الإضافة ناتجه واحد فقط');
 },
 note:'<ul><li>كتاب الطالب ص٨٧ (الشكل ٤-٢): «تخضع الألكينات لمدى واسع من التفاعلات الكيميائية الأخرى بسبب وجود الرابطة الثنائية C=C… بإضافة ذرتين جديدتين». عرض NotebookLM شريحة ٨ («سر النشاط: التفاعلات الكيميائية للألكينات»).</li><li>X–Y جزيء عام: يمكن أن يكون Br₂ أو H₂ أو H₂O (H–OH). الحالات الثلاث في الشرائح التالية.</li></ul>'});

/* 12 combustion of alkenes */
slide({id:'burnE',ch:3,title:'احتراق الألكينات',tag:'زِن المعادلة',
 html:function(){
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div style="display:flex;gap:8px;justify-content:center">${ENE.slice(0,3).map(function(a,i){return '<button type="button" class="btn tab" data-i="'+i+'">'+a.name+'</button>'}).join('')}</div>
    <div class="frm brk" style="padding:12px 16px;gap:8px;align-items:center"><div class="sm" style="font-size:20px;text-align:center">ألكين + أكسجين → ثاني أكسيد الكربون + ماء (بخار) + طاقة</div>
     <div style="display:flex;align-items:center;justify-content:center;gap:10px;direction:ltr;flex-wrap:nowrap" id="eq"></div></div>
    <div class="panel" style="padding:10px 16px;gap:2px"><div class="cnt3" id="ct" style="direction:ltr"></div></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div></div>
   <div class="col" style="width:340px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:22px;font-weight:800">الألكينات تشبه الألكانات في الاحتراق</div><div style="font-size:21px;line-height:1.5">عند توفر كمية كافية من الأكسجين تُطلق <b>حرارة</b> و<b>CO<sub>2</sub></b> و<b>بخار الماء</b>.</div><div class="sm" style="font-size:19px">لكنها تُستخدم في صناعات أخرى أكثر قيمة بدلاً من حرقها وقوداً، بسبب الرابطة الثنائية.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">النواتج دائماً: <b>ثاني أكسيد الكربون + ماء</b>، كما في الألكانات.</div></div></div>`;},
 init:function(el){
  var RX=[{f:'C2H4',c:2,h:4},{f:'C3H6',c:3,h:6},{f:'C4H8',c:4,h:8}], cur=0, co=[1,1,1,1], done={}, fb=$('.fb',el);
  function g(a,b){return b?g(b,a%b):a}
  function load(i){ cur=i; co=[1,1,1,1]; paint(); $$('.tab',el).forEach(function(t){t.classList.toggle('acc',+t.getAttribute('data-i')===i)}); say(fb,'','') }
  function paint(){
    var r=RX[cur], C0=co[0]*r.c, H0=co[0]*r.h, O0=2*co[1], C1=co[2], H1=2*co[3], O1=2*co[2]+co[3];
    function term(k,f,st){return '<div class="coef"><button type="button" data-k="'+k+'" data-d="1">+</button><b class="num lbl">'+co[k]+'</b><button type="button" data-k="'+k+'" data-d="-1">−</button></div><span class="num lbl" style="font-size:38px;font-weight:800">'+sub(f)+'<span style="font-size:22px">('+st+')</span></span>'}
    $('#eq',el).innerHTML=term(0,r.f,'g')+'<span style="font-size:36px">+</span>'+term(1,'O2','g')+'<span style="font-size:42px">→</span>'+term(2,'CO2','g')+'<span style="font-size:36px">+</span>'+term(3,'H2O','g');
    function row(n,a,b){var ok=a===b; return '<span>'+n+'</span><span class="num lbl">'+a+'</span><span class="num lbl">'+b+'</span><span class="'+(ok?'ok-t':'no-t')+'">'+(ok?'✓':'✗')+'</span>'}
    $('#ct',el).innerHTML='<span></span><span style="font-size:19px;color:var(--muted)">المتفاعلات</span><span style="font-size:19px;color:var(--muted)">النواتج</span><span></span>'+row('C',C0,C1)+row('H',H0,H1)+row('O',O0,O1);
    $$('.coef button',el).forEach(function(b){b.addEventListener('click',function(){var k=+b.getAttribute('data-k'); co[k]=Math.max(1,Math.min(16,co[k]+ +b.getAttribute('data-d'))); paint(); verdict()})});
  }
  function verdict(){
    var r=RX[cur], bal=co[0]*r.c===co[2]&&co[0]*r.h===2*co[3]&&2*co[1]===2*co[2]+co[3];
    if(!bal){ say(fb,'','') ; return }
    var d=g(g(co[0],co[1]),g(co[2],co[3]));
    if(d>1){ say(fb,'موزونة، لكن اكتبها بأبسط نسبة (اقسم على '+d+')','bad'); return }
    say(fb,'✓ موزونة بأبسط نسبة: '+co.join(' : '),'ok'); done[cur]=1; if(Object.keys(done).length===3) unhide(el);
  }
  $$('.tab',el).forEach(function(t){t.addEventListener('click',function(){load(+t.getAttribute('data-i'))})});
  load(0);
 },
 note:'<ul><li>كتاب الطالب ص٨٧: «تتشابه الألكينات والألكانات وهيدروكربونات أخرى عندما تحترق، فهي تطلق حرارة وثاني أكسيد الكربون وبخار الماء عند توفّر كمية كافية من الأكسجين»، ومثاله: <span class="num">C₂H₄(g) + 3O₂(g) → 2CO₂(g) + 2H₂O(g)</span>.</li><li>البروبين: 2C₃H₆ + 9O₂ → 6CO₂ + 6H₂O (بأبسط نسبة صحيحة)، والبيوتين: C₄H₈ + 6O₂ → 4CO₂ + 4H₂O. الأمثلة الإضافية للتدريب.</li></ul>'});
