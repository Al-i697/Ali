/* ---------- alkanes, part C: physical properties, chemical properties and combustion ---------- */
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

/* 12 states at a chosen temperature */
slide({id:'states',ch:3,title:'درجة الغليان والحالة الفيزيائية',tag:'جرّب',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:8px"><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:23px;font-weight:800">درجة الحرارة</span><b class="num lbl" id="tv" style="font-size:44px;color:var(--gold)">25 °C</b><button type="button" class="btn" id="rt">درجة حرارة الغرفة</button></div>
     <input class="tr" id="tr" type="range" min="-180" max="100" step="1" value="-180" aria-label="درجة الحرارة"></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${ALK.map(function(a){return '<div class="tile" data-bp="'+a.bp+'"><b style="font-size:26px">'+a.name+'</b>'+ff(a.f)+'<span class="sm" style="font-size:19px">يغلي عند <span class="num lbl">'+a.bp+' °C</span></span><span class="st"></span></div>'}).join('')}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:340px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:23px;font-weight:800">الحالة عند درجة حرارة الغرفة</div>
     <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:22px;line-height:1.35"><span class="num" style="color:var(--gold);font-weight:800">C<sub>1</sub> – C<sub>4</sub></span><span>غازات</span><span class="num" style="color:var(--gold);font-weight:800">C<sub>5</sub> – C<sub>16</sub></span><span>سوائل</span><span class="num" style="color:var(--gold);font-weight:800">C<sub>17</sub> وأكثر</span><span>مواد صلبة شمعية</span></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">أول أربعة ألكانات غازات عند 25 °C لأن درجة غليانها أقل من 25. والبنتان والهكسان سائلان.</div></div></div>`;},
 init:function(el){
  var tr=$('#tr',el), seen=false;
  function upd(){
    var t=+tr.value; $('#tv',el).textContent=t+' °C';
    $$('.tile',el).forEach(function(c){var gas=t>=+c.getAttribute('data-bp'); c.classList.toggle('gas',gas); c.classList.toggle('liq',!gas); $('.st',c).textContent=gas?'غاز':'سائل'});
    if(t===25&&!seen){seen=true; unhide(el); say($('.fb',el),'عند 25 °C: ٤ غازات وسائلان، لأن درجة غليان البنتان 36 والهكسان 69','ok')}
  }
  tr.addEventListener('input',upd); $('#rt',el).addEventListener('click',function(){tr.value=25; upd()}); upd();
 },
 note:'<ul><li>الجدول ٤-٣ في كتاب الطالب ص٨٣: درجات الغليان −164، −87، −42، 0، 36، 69 °C. القاعدة: الألكانات من C₁ إلى C₄ غازات، ومن C₅ إلى C₁₆ سوائل، و C₁₇ فأكثر صلبة شمعية عند درجة حرارة الغرفة.</li><li>حرّك المؤشر ببطء من −180 وشاهد كل ألكان يتحوّل من سائل إلى غاز عند درجة غليانه. الرسم يبيّن الغليان فقط، أما الانصهار فلا يُطلب.</li></ul>'});

/* 13 plot boiling point against carbon number */
slide({id:'plot',ch:3,title:'التمثيل البياني لدرجات الغليان',tag:'ارسم',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div class="panel" style="padding:10px 16px;align-items:center"><div id="pl"></div></div>
    <div style="display:flex;gap:12px;align-items:center"><button type="button" class="btn acc" id="nx">ارسم النقطة التالية ▸</button><span class="sm" id="pn" style="font-size:20px"></span></div>
    <div class="gbar hide" id="gb" style="font-size:21px">كلما ازداد عدد ذرات الكربون في السلسلة ارتفعت درجة الغليان، لأن الجزيئات تصير أكبر.</div></div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel" id="qp" style="padding:14px 18px;gap:8px"><div style="font-size:23px;font-weight:800">سؤال ٤-٧ ← ماذا تلاحظ؟</div>
     ${optsHTML([{t:'ترتفع درجة الغليان تدريجياً بزيادة عدد ذرات الكربون'},{t:'تنخفض درجة الغليان بزيادة عدد ذرات الكربون'},{t:'تبقى درجة الغليان ثابتة'}])}<div class="fb" style="min-height:24px"></div></div></div></div>`;},
 init:function(el){
  var k=0, pts=ALK.map(function(a){return [a.n,a.bp]}), ready=false, ok=false;
  function draw(){ $('#pl',el).innerHTML=plotSVG(pts.slice(0,k),{w:520,h:330,xmin:0,xmax:7,ymin:-200,ymax:100,xl:'عدد ذرات الكربون',yl:'درجة الغليان (°C)',yt:6,xt:7}) }
  draw(); $('#pn',el).textContent='0 / 6 نقاط';
  $('#nx',el).addEventListener('click',function(){ if(k<6){k++; draw(); $('#pn',el).innerHTML='<span class="num lbl">'+k+' / 6 · '+ALK[k-1].name+' '+ALK[k-1].bp+' °C</span>'; if(k===6){this.classList.add('hide'); ready=true; if(ok) unhide(el)}} });
  bindMcq($('#qp',el),[{t:'',ok:true,why:'صح: النقاط تصعد تدريجياً من −164 إلى 69 °C'},{t:'',why:'انظر إلى اتجاه النقاط: صاعد'},{t:'',why:'النقاط ليست على خط أفقي'}],$('.fb',el),function(){ok=true; if(ready) unhide(el)});
 },
 note:'<ul><li>سؤال ٤-٧ (كتاب الطالب ص٨٦): ارسم تمثيلاً بيانياً لدرجات غليان أول ستة ألكانات مقابل عدد ذرات الكربون. اطلب من الطلاب رسمه على ورق بياني أولاً، ثم اضغط لتظهر النقاط.</li><li>جواب النص في ورقة العمل ٤-١: «بزيادة طول سلسلة الهيدروكربون تزداد درجة الغليان» (المنحنى يميل تدريجياً ولا يصعد خطاً مستقيماً تماماً).</li></ul>'});

/* 14 why: attraction forces grow with chain length */
slide({id:'why',ch:3,title:'لماذا ترتفع درجة الغليان؟',tag:'فسّر',
 html:function(){
  var items=[['أطول سلسلة ← جزيء أكبر','يزداد حجم الجزيء وكتلته المولية (Mr).'],['تزداد قوى التجاذب الضعيفة بين الجزيئات','القوى بين الجزيئات (Intermolecular forces) تقوى كلما كبرت الجزيئات.'],['تحتاج طاقة أكبر لفصل الجزيئات','فترتفع درجة الغليان.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;justify-content:center">
    <div class="panel" style="padding:12px 20px;gap:10px"><div style="display:flex;align-items:center;gap:16px"><span style="font-size:23px;font-weight:800">عدد ذرات الكربون</span>${stepHTML('n','n =',1)}<b id="an" style="font-size:30px;color:var(--gold)"></b></div>
     <div style="display:grid;grid-template-columns:200px 1fr 90px;gap:8px 14px;align-items:center;font-size:20px;font-weight:700"><span>الكتلة المولية Mr</span><div class="cbar"><i id="b1" style="width:0"></i></div><b class="num lbl" id="v1"></b><span>قوى التجاذب</span><div class="cbar b2"><i id="b2" style="width:0"></i></div><b class="num" id="v2" style="font-size:19px">ضعيفة</b><span>درجة الغليان</span><div class="cbar"><i id="b3" style="width:0"></i></div><b class="num lbl" id="v3"></b></div></div>
    ${cardsHTML(items)}</div>
   <div class="col" style="width:300px;flex:none;gap:10px;justify-content:center"><div class="panel" style="padding:12px 12px;align-items:center;gap:8px"><div id="mc"></div><div class="sm" style="font-size:19px;text-align:center">الجزيئات الكبيرة تتجاذب أكثر</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">سلسلة أطول ← قوى تجاذب أقوى ← طاقة أكبر لفصل الجزيئات ← درجة غليان أعلى.</div></div></div>`;},
 init:function(el){
  var seen={}, cards=false;
  bindCards(el,function(){cards=true; if(Object.keys(seen).length===6) unhide(el)});
  var st=bindStep(el,'n',1,6,function(n){
    var a=ALK[n-1]; seen[n]=1; var mr=14*n+2;
    $('#an',el).textContent=a.name; $('#v1',el).textContent=mr; $('#v3',el).textContent=a.bp+' °C';
    $('#b1',el).style.width=(mr/86*100)+'%'; $('#b2',el).style.width=(n/6*100)+'%'; $('#b3',el).style.width=((a.bp+200)/269*100)+'%';
    $('#v2',el).textContent=n<2?'ضعيفة':n<4?'أقوى':n<6?'قوية':'الأقوى';
    $('#mc',el).innerHTML=alkSVG(n,{w:Math.min(250,60+n*36)});
    if(cards&&Object.keys(seen).length===6) unhide(el);
  });
  st.set(1);
 },
 note:'<ul><li>من كتاب الطالب ص٨٣: كلما ازداد طول سلسلة الهيدروكربون تزداد قوى التجاذب بين الجزيئات (القوى بين الجزيئية) ونتيجة لذلك ترتفع درجتا الانصهار والغليان تدريجياً. وفي ورقة العمل ٤-١: بزيادة الكتلة المولية Mr (زيادة عدد ذرات الكربون) تزداد درجة الغليان بسبب زيادة قوى التجاذب الضعيفة بين الجزيئات.</li><li>التفسير بالتجاذب بين الجزيئات وليس بكسر الروابط داخل الجزيء: الروابط داخل الجزيء لا تُكسر عند الغليان.</li></ul>'});

/* 15 exam question: the right graph (2025/2026, first round, question 26) */
slide({id:'exq26',ch:3,title:'سؤال امتحان: أي رسم صحيح؟',tag:'امتحان ٢٠٢٥/٢٦',
 html:function(){
  var G=[ [[1,150],[2,120],[3,80],[4,50],[5,10],[6,-30],[7,-70],[8,-110],[9,-150]],
          [[1,-160],[2,-90],[3,-45],[4,0],[5,45],[6,70],[7,100],[8,135],[9,150]],
          [[1,150],[2,115],[3,70],[4,0],[5,-40],[6,-80],[7,50],[8,125],[9,200]],
          [[1,-160],[2,-130],[3,0],[4,160],[5,110],[6,70],[7,-30],[8,-90],[9,-120]] ];
  var o={w:300,h:190,xmin:0,xmax:10,ymin:-200,ymax:250,xt:5,yt:3,xl:'عدد ذرات الكربون',yl:'الغليان (°C)',sw:232};
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;line-height:1.35">ما التمثيل البياني الصحيح الذي يوضّح العلاقة بين عدد ذرات الكربون ودرجة غليان الألكانات؟</div>
    <div class="opts" id="gs" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${G.map(function(g,i){return '<button type="button" class="opt" data-i="'+i+'" style="flex-direction:column;align-items:center;padding:8px"><span class="ix">'+'أبجد'[i]+'</span>'+plotSVG(g,o)+'</button>'}).join('')}</div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:290px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">من الامتحان</div><div class="sm" style="font-size:19px;line-height:1.5">امتحان الكيمياء، الصف العاشر، الفصل الأول، الدور الأول ٢٠٢٥/٢٠٢٦، سؤال ٢٦ (درجة واحدة).</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">الرسم الصحيح: درجة الغليان تصعد تدريجياً وتقريباً بانتظام مع زيادة عدد ذرات الكربون.</div></div></div>`;},
 init:function(el){ bindMcq($('#gs',el).parentNode,[{t:'',why:'هذا المنحنى ينزل: الغليان لا ينخفض بزيادة السلسلة'},{t:'',ok:true,why:'صح: من −164 إلى نحو 150 °C بصعود تدريجي'},{t:'',why:'ليس هناك هبوط ثم صعود'},{t:'',why:'ليس هناك قمة ثم هبوط في الألكانات'}],$('.fb',el),function(){unhide(el)}) },
 note:'<ul><li>الاختيار من متعدّد من امتحان ٢٠٢٥/٢٠٢٦ الدور الأول (سؤال ٢٦): الرسم الصحيح فيه النقاط تصعد من الأسفل إلى الأعلى بانتظام (−160 إلى 150 °C). الخيارات الأخرى: هبوط، قمة ثم هبوط، وهبوط ثم صعود.</li><li>الرسوم أعيد رسمها هنا بالبيانات نفسها تقريباً، وليست نسخاً للأصل.</li></ul>'});

/* 16 alkanes are unreactive */
slide({id:'inert',ch:4,title:'الألكانات غير نشطة كيميائياً',tag:'جرّب',
 html:function(){
  var items=[['لأنها مشبعة','كل ذرة كربون فيها ٤ روابط، فلا مكان لإضافة ذرات أخرى إلى سلسلتها.'],['لأن الروابط الأحادية قوية','الروابط التساهمية الأحادية بين ذرات الكربون قوية جداً، وتحتاج إلى طاقة كبيرة لتنكسر.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:12px;align-items:center;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">حاول أن تضيف ذرة هيدروجين إلى الإيثان:</div>
    <div class="panel" style="padding:10px 18px;align-items:center;position:relative">${alkSVG(2,{w:360})}<button type="button" class="btn acc" id="try" style="margin-top:6px">أضف ذرة H ⊕</button></div>
    <div class="fb" style="min-height:30px;text-align:center;font-size:22px"></div></div>
   <div class="col" style="width:520px;flex:none;gap:12px;justify-content:center">
    <div style="font-size:23px;font-weight:800;color:var(--cyan)">علّل: لماذا الألكانات غير نشطة كيميائياً؟</div>
    ${cardsHTML(items)}
    <div class="gbar hide" id="gb" style="font-size:21px">تبقى الألكانات بلا تفاعل مع معظم المواد، <b>ولكنها تحترق جيداً</b> (الشريحة التالية).</div></div></div>`;},
 init:function(el){
  var cards=false,tried=0;
  $('#try',el).addEventListener('click',function(){ tried++; var s=$('svg',el); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); say($('.fb',el),tried<2?'❌ لا مكان! كل كربون مرتبط بأربع ذرات بالفعل':'❌ مشبع: لا يمكن إضافة ذرات إلى سلسلته الكربونية','bad'); if(tried>=2&&cards) unhide(el) });
  bindCards(el,function(){cards=true; if(tried>=2) unhide(el)});
 },
 note:'<ul><li>التعليل من كتاب الطالب ص٨٣ وعرضك القديم (شريحة ٢١) وعرض NotebookLM (شريحة ٥ في عرض الألكينات): ١- هيدروكربونات مشبعة غير قابلة لإضافة المزيد من الذرات إلى سلسلتها الكربونية. ٢- الروابط التساهمية الأحادية بين ذرات الكربون قوية جداً ولا تنكسر بسهولة.</li><li>الاستثناء الوحيد من عدم النشاط: الاحتراق.</li></ul>'});

/* 17 combustion: balance the equation */
slide({id:'burn',ch:4,title:'احتراق الألكانات',tag:'زِن المعادلة',
 html:function(){
  var RX=[['CH4',1,4],['C2H6',2,6],['C3H8',3,8],['C4H10',4,10]];
  return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
    <div style="display:flex;gap:8px;justify-content:center">${RX.map(function(r,i){return '<button type="button" class="btn tab" data-i="'+i+'">'+ALK[i].name+'</button>'}).join('')}</div>
    <div class="frm brk" style="padding:12px 16px;gap:8px;align-items:center"><div class="sm" style="font-size:20px;text-align:center">ألكان + أكسجين → ثاني أكسيد الكربون + ماء (بخار) + طاقة</div>
     <div style="display:flex;align-items:center;justify-content:center;gap:10px;direction:ltr;flex-wrap:nowrap" id="eq"></div></div>
    <div class="panel" style="padding:10px 16px;gap:2px"><div class="cnt3" id="ct" style="direction:ltr"></div></div>
    <div class="fb" style="min-height:26px;text-align:center;font-size:21px"></div></div>
   <div class="col" style="width:340px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px;gap:6px"><div style="font-size:22px;font-weight:800">شروط الاحتراق الكامل</div><ul style="margin:0;padding-inline-start:22px;font-size:21px;line-height:1.5"><li>وجود <b>الأكسجين</b> بوفرة</li><li>مصدر <b>إشعال</b></li></ul><div class="sm" style="font-size:19px">التفاعل <b>طارد للحرارة</b>: يطلق طاقة كبيرة، ولذلك الألكانات وقود ممتاز.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">النواتج دائماً: <b>ثاني أكسيد الكربون + ماء</b>، مهما اختلف الألكان.</div></div></div>`;},
 init:function(el){
  var RX=[{f:'CH4',c:1,h:4,s:[1,2,1,2]},{f:'C2H6',c:2,h:6,s:[2,7,4,6]},{f:'C3H8',c:3,h:8,s:[1,5,3,4]},{f:'C4H10',c:4,h:10,s:[2,13,8,10]}], cur=0, co=[1,1,1,1], done={}, fb=$('.fb',el);
  var NM=[null,'O2','CO2','H2O'];
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
    say(fb,'✓ موزونة بأبسط نسبة: '+co.join(' : '),'ok'); done[cur]=1; if(Object.keys(done).length===4) unhide(el);
  }
  $$('.tab',el).forEach(function(t){t.addEventListener('click',function(){load(+t.getAttribute('data-i'))})});
  load(0);
 },
 note:'<ul><li>الاحتراق الكامل (كتاب الطالب ص٨٣–٨٤): ألكان + أكسجين → ثاني أكسيد الكربون + ماء. أمثلة الكتاب: <span class="num">CH₄ + 2O₂ → CO₂ + 2H₂O</span> و <span class="num">2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O</span>.</li><li>جرّب أن تفتح الإيثان وتضع المعامل ٧/٢: سيطلب الإيثان بأبسط نسبة صحيحة (٢ : ٧ : ٤ : ٦). في كتاب النشاط جاء الحل بالمعامل ٧/٢ للأكسجين، وهو مقبول رياضياً.</li><li>حالة الماء (g) لأنه بخار عند حرارة الاحتراق، وهذا ما يظهر في نموذج إجابة امتحان ٢٠٢٢/٢٠٢٣ (سؤال ١٧): C₃H₈(g) + 5O₂(g) → 3CO₂(g) + 4H₂O(g). وفي إجابة سؤال ٤-٩ في دليل المعلم كتبت (l)، فاقبلها.</li></ul>'});

/* 18 uses of alkanes */
slide({id:'uses2',ch:4,title:'استخدامات الألكانات',tag:'اكتشف',
 html:function(){
  var items=[['الميثان <span class="num">CH<sub>4</sub></span>','المكوّن الرئيسي للغاز الطبيعي (يستخدم وقوداً للطاقة والتدفئة).'],['البروبان والبيوتان (LPG)','غاز البترول المسال: يُخزَّن سائلاً تحت الضغط ويتبخّر بسهولة عند إزالة الضغط. يحترق بلهب ساخن جداً.'],['البروبان <span class="num">C<sub>3</sub>H<sub>8</sub></span>','خزانات وقود لأنظمة التدفئة في المناطق التي لا يوجد بها غاز طبيعي.'],['البيوتان <span class="num">C<sub>4</sub>H<sub>10</sub></span>','أسطوانات المواقد المحمولة ومواقد التخييم ومشاعل اللحام وقدّاحات الغاز.']];
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">اضغط على كل بطاقة:</div>${cardsHTML(items)}</div>
   <div class="col" style="width:420px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:24px;font-weight:800">أيّ هذين الغازين يوجد في قدّاحة الجيب؟</div>
     ${optsHTML([{t:'الميثان'},{t:'البيوتان'}])}<div class="fb" style="min-height:24px"></div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">استخدامها الرئيسي: <b>وقود</b>، لأن احتراقها يطلق طاقة حرارية كبيرة.</div></div></div>`;},
 init:function(el){
  var c=false,m=false; function chk(){ if(c&&m) unhide(el) }
  bindCards(el,function(){c=true; chk()});
  bindMcq($('.panel',el),[{t:'',why:'الميثان يوجد في الغاز الطبيعي ولا يُسيَّل بسهولة في قدّاحة'},{t:'',ok:true,why:'البيوتان: يُسيَّل تحت الضغط الخفيف فيوضع سائلاً داخل القدّاحة'}],$('.fb',el),function(){m=true; chk()});
 },
 note:'<ul><li>كتاب الطالب ص٨٤: يُشكّل الميثان الجزء الرئيسي من الغاز الطبيعي. يحترق البروبان والبيوتان بلهب ساخن جداً ويباعان في هيئة غاز بترول مسال (LPG). خزانات البروبان خارج المنازل لأنظمة التدفئة، وأسطوانات البيوتان في المواقد المحمولة ومواقد التخييم ومشاعل اللحام وقدّاحات الغاز (الصورة ٤-١).</li></ul>'});

/* 19 questions 4-8 and 4-9 */
(function(){
  var items=[
   {q:'<b>٤-٨</b> ما المصدر الطبيعي الرئيسي للميثان؟',opts:[{t:'الغاز الطبيعي',ok:true,why:'الميثان هو المكوّن الرئيسي للغاز الطبيعي'},{t:'الفحم الحجري',why:'الفحم وقود صلب ومحتواه عالٍ بالكربون'},{t:'الأسفلت',why:'الأسفلت من مشتقات النفط الثقيلة'}]},
   {q:'<b>٤-٩ (أ)</b> المعادلة اللفظية لاحتراق البروبان في فائض من الأكسجين:',opts:[{t:'بروبان + أكسجين → ثاني أكسيد الكربون + ماء',ok:true,why:'ألكان + أكسجين ← ثاني أكسيد الكربون + ماء'},{t:'بروبان + هيدروجين → ماء',why:'لا يتفاعل البروبان مع الهيدروجين، والاحتراق يحتاج الأكسجين'},{t:'بروبان + أكسجين → كربون + هيدروجين',why:'الاحتراق الكامل ينتج ثاني أكسيد الكربون والماء'}]},
   {q:'<b>٤-٩ (ب)</b> المعادلة الرمزية الموزونة:',opts:[{t:'<span class="num lbl">C<sub>3</sub>H<sub>8</sub>(g) + 3O<sub>2</sub>(g) → 3CO<sub>2</sub>(g) + 4H<sub>2</sub>O(g)</span>',why:'غير موزونة: الأكسجين 6 ← 10 (3 + 3 + 4)'},{t:'<span class="num lbl">C<sub>3</sub>H<sub>8</sub>(g) + 5O<sub>2</sub>(g) → 3CO<sub>2</sub>(g) + 4H<sub>2</sub>O(g)</span>',ok:true,why:'موزونة: C = 3، H = 8، O = 10 على الطرفين'},{t:'<span class="num lbl">C<sub>3</sub>H<sub>8</sub>(g) + O<sub>2</sub>(g) → CO<sub>2</sub>(g) + H<sub>2</sub>O(g)</span>',why:'غير موزونة'}]}
  ];
  slide({id:'q89',ch:4,title:'أسئلة ٤-٨ و٤-٩',tag:'تذكرة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'q89')},
   note:'<ul><li>كتاب الطالب ص٨٦. ٤-٨: الغاز الطبيعي. ٤-٩ (أ): بروبان + أكسجين ← ثاني أكسيد الكربون + ماء. ٤-٩ (ب): C₃H₈(g) + 5O₂(g) → 3CO₂(g) + 4H₂O(g) (جاءت في دليل المعلم بـ H₂O(l) في موضع، وبـ H₂O(g) في آخر. المعتمد هنا (g).)</li></ul>'});
})();

/* 20 dot-and-cross diagrams (question 4-10) */
slide({id:'dots',ch:4,title:'المخطط النقطي للميثان والإيثان',tag:'سؤال ٤-١٠',
 html:function(){
  return `<div style="display:flex;gap:22px;flex:1;align-items:stretch">
   <div class="col" style="flex:1;min-width:0;gap:10px;align-items:center;justify-content:center">
    <div style="display:flex;gap:10px"><button type="button" class="btn tab" data-m="1">الميثان CH₄</button><button type="button" class="btn tab" data-m="2">الإيثان C₂H₆</button></div>
    <div class="panel" style="padding:6px 10px;align-items:center;width:100%"><div id="dg"></div></div>
    <div class="fb" style="min-height:26px;text-align:center"></div></div>
   <div class="col" style="width:360px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:14px 18px;gap:8px"><div style="font-size:23px;font-weight:800">اضغط على كل رابطة لتظهر الإلكترونات المشتركة</div><div style="font-size:20px;line-height:1.5"><span style="color:#ff9d8a;font-weight:800">×</span> إلكترونات الكربون، <span style="font-weight:800">•</span> إلكترونات الهيدروجين.</div></div>
    <div class="gbar hide" id="gb" style="font-size:21px">في الجزيء: كل <b>H</b> يشارك بإلكترون فيصير حوله <b>2</b>، وكل <b>C</b> يصير حوله <b>8</b> إلكترونات.</div></div></div>`;},
 init:function(el){
  var done={}, fb=$('.fb',el);
  function mk(m){
    var W=420,H=300,R=44,cx=[210],o=[], s='';
    var Cs=m===1?[[210,150]]:[[142,150],[278,150]], Hs=[], Bd=[]; // H places and the bonds (pairs)
    if(m===1){ Hs=[[210,52,0],[210,248,0],[114,150,0],[306,150,0]] } else { Hs=[[142,52,0],[142,248,0],[48,150,0],[278,52,1],[278,248,1],[372,150,1]]; }
    var bonds=[], i, k;
    Hs.forEach(function(h,i){ var c=Cs[m===1?0:h[2]]; bonds.push({x:(h[0]+c[0])/2,y:(h[1]+c[1])/2,hx:h[0],hy:h[1],cx:c[0],cy:c[1],t:'h'}) });
    if(m===2) bonds.push({x:210,y:150,t:'cc',cx:142,cy:150,hx:278,hy:150});
    Cs.forEach(function(c){ s+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+R+'" fill="rgba(58,63,69,.55)" stroke="#9fb4b8" stroke-width="2.5"/>' });
    Hs.forEach(function(h){ s+='<circle cx="'+h[0]+'" cy="'+h[1]+'" r="'+(R-14)+'" fill="rgba(238,244,244,.14)" stroke="#9fb4b8" stroke-width="2.5"/><text x="'+h[0]+'" y="'+(h[1]+7)+'" text-anchor="middle" font-size="22" font-weight="800" fill="#EEF4F4">H</text>' });
    Cs.forEach(function(c){ s+='<text x="'+c[0]+'" y="'+(c[1]+9)+'" text-anchor="middle" font-size="28" font-weight="800" fill="#fff">C</text>' });
    bonds.forEach(function(b,i){
      var dx=b.hx-b.cx, dy=b.hy-b.cy, L=Math.sqrt(dx*dx+dy*dy), ux=dx/L, uy=dy/L, px=-uy, py=ux, mx=b.x, my=b.y;
      s+='<g class="bd" data-i="'+i+'" style="cursor:pointer"><circle class="hit" cx="'+mx+'" cy="'+my+'" r="22" fill="rgba(228,188,75,.10)" stroke="var(--gold)" stroke-dasharray="5 5" stroke-width="2.5"/><g class="pair"><text x="'+(mx+px*9-5)+'" y="'+(my+py*9+6)+'" font-size="22" font-weight="800" fill="#ff9d8a">×</text><text x="'+(mx-px*9-4)+'" y="'+(my-py*9+6)+'" font-size="26" font-weight="800" fill="#fff">•</text></g></g>';
    });
    return {svg:'<svg viewBox="0 0 '+W+' '+H+'" width="'+(m===1?430:560)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+'</svg>',n:bonds.length};
  }
  function load(m){
    var d=mk(m), left=d.n; $('#dg',el).innerHTML=d.svg;
    $$('.tab',el).forEach(function(t){t.classList.toggle('acc',+t.getAttribute('data-m')===m)});
    say(fb,'','');
    $$('.bd',el).forEach(function(g){g.addEventListener('click',function(){
      if(g.classList.contains('on')) return; g.classList.add('on'); left--;
      if(!left){ done[m]=1; say(fb,m===1?'✓ الميثان: ٤ أزواج مشتركة، حول C ثمانية إلكترونات':'✓ الإيثان: ٧ أزواج مشتركة، حول كل C ثمانية إلكترونات','ok'); if(done[1]&&done[2]) unhide(el) }
    })});
  }
  $$('.tab',el).forEach(function(t){t.addEventListener('click',function(){load(+t.getAttribute('data-m'))})});
  load(1);
 },
 note:'<ul><li>سؤال ٤-١٠ في كتاب الطالب ص٨٦: ارسم مخططاً نقطياً لترتيب الإلكترونات في روابط الميثان (الإلكترونات الخارجية فقط). وتمرين ٤-١ في كتاب النشاط يطلب المخطط نفسه للميثان والإيثان.</li><li>في الإيثان ٧ أزواج مشتركة: ٦ بين C و H ورابطة واحدة بين C و C.</li><li>الصورة في عرضك القديم (شريحتا ٢٥ و٢٨) تعرضه بدوائر ملونة؛ هنا يضغط الطالب على كل رابطة.</li></ul>'});
