/* ---------- gas volumes, part E: activity 3-3 (magnesium with acid, enrichment), exercise 3-4, and the class race ---------- */

/* the apparatus of activity 3-3: a flask with acid and a magnesium strip, a delivery tube, an inverted measuring cylinder in a trough.
   The cylinder scale runs 0 to 100 mL from the closed top; the gas pushes the water down. */
var LAB_Y0=50, LAB_PX=2.32;
function labSVG(o){
  o=o||{}; var i, t='', lab='';
  for(i=0;i<=10;i++) t+='<line x1="392" y1="'+(LAB_Y0+i*10*LAB_PX).toFixed(1)+'" x2="'+(i%5===0?'378':'384')+'" y2="'+(LAB_Y0+i*10*LAB_PX).toFixed(1)+'" stroke="rgba(255,255,255,.7)" stroke-width="'+(i%5===0?2:1.4)+'"/>'+(i%2===0?'<text x="372" y="'+(LAB_Y0+i*10*LAB_PX+5).toFixed(1)+'" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)" direction="ltr">'+(i*10)+'</text>':'');
  if(o.callouts) lab=
   '<text x="120" y="360" text-anchor="middle" font-size="17" font-weight="800" fill="var(--cyan)">دورق + حمض مخفف</text>'+
   '<text x="474" y="30" text-anchor="end" font-size="17" font-weight="800" fill="var(--cyan)">مخبار مدرج مقلوب</text>'+
   '<text x="212" y="84" text-anchor="middle" font-size="17" font-weight="800" fill="var(--cyan)">أنبوبة توصيل</text>'+
   '<text x="432" y="343" text-anchor="middle" font-size="16" font-weight="800" fill="var(--ink)">حوض ماء</text>'+
   '<text x="120" y="252" text-anchor="middle" font-size="15" font-weight="800" fill="#cfd8dc">Mg</text>';
  return '<svg id="'+(o.id||'lsvg')+'" viewBox="0 0 480 384" width="100%" style="max-height:'+(o.h||400)+'px" aria-hidden="true">'+
   '<rect x="240" y="300" width="230" height="60" rx="8" fill="rgba(95,149,198,.28)" stroke="rgba(var(--t2),.8)" stroke-width="3"/>'+
   '<rect x="242" y="312" width="226" height="46" rx="6" fill="rgba(95,149,198,.35)"/>'+
   '<rect x="330" y="'+LAB_Y0+'" width="62" height="272" rx="8" fill="rgba(95,149,198,.38)" stroke="rgba(var(--t2),.85)" stroke-width="3.5"/>'+
   '<rect id="'+(o.id||'lsvg')+'gas" x="333" y="'+(LAB_Y0+2)+'" width="56" height="0" fill="rgba(255,255,255,.2)"/>'+
   '<line id="'+(o.id||'lsvg')+'lev" x1="333" y1="'+LAB_Y0+'" x2="389" y2="'+LAB_Y0+'" stroke="var(--gold)" stroke-width="3" style="opacity:0"/>'+t+
   '<path d="M120 134V96H300V326H362V270" fill="none" stroke="rgba(var(--t2),.75)" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>'+
   '<path d="M100 150H140V208L202 322Q205 330 196 330H44Q35 330 38 322L100 208Z" fill="rgba(var(--t1),.10)" stroke="var(--cyan)" stroke-width="3.5" stroke-linejoin="round"/>'+
   '<path d="M52 276H188L202 322Q205 330 196 330H44Q35 330 38 322Z" fill="rgba(120,200,255,.28)"/>'+
   '<rect x="94" y="132" width="52" height="24" rx="6" fill="#a8742e" stroke="#6d4a1c" stroke-width="2"/>'+
   '<g id="'+(o.id||'lsvg')+'mg" style="transform-origin:120px 304px"><path d="M62 304q9-14 18 0t18 0t18 0t18 0t18 0" fill="none" stroke="#cfd8dc" stroke-width="6" stroke-linecap="round"/></g>'+
   '<g id="'+(o.id||'lsvg')+'bb" style="opacity:0">'+[0,1,2,3,4,5,6].map(function(k){return '<circle class="lbub" cx="'+(76+k*14)+'" cy="298" r="'+(4+k%3*2)+'" style="animation-delay:'+(k*.2).toFixed(2)+'s"/>'}).join('')+'</g>'+lab+'</svg>';
}
/* the simulated reading for a strip of L cm: about 16.4 mL per cm, with small scatter (the 5 cm strip gives the 85, 79, 82 of exercise 3-4) */
var LAB_NOISE={1:[17,16,16],2:[34,33,32],3:[50,49,48],4:[66,65,67],5:[85,79,82]};
function labVol(L,rep){return LAB_NOISE[L][rep%3]}

/* 21 activity 3-3: the apparatus, the safety and the notes */
slide({id:'lab0',ch:5,title:'نشاط ٣-٣ (إثرائي): الجهاز والسلامة',tag:'استقصاء',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:520px;flex:none;gap:6px;justify-content:center"><div class="panel" style="padding:8px 10px;align-items:center">${labSVG({id:'l0',callouts:1,h:345})}</div>
   <div class="frm brk" style="padding:8px 14px;gap:2px;align-items:center"><div class="bigeq" style="font-size:25px;color:var(--gold)">Mg(s) + H<sub>2</sub>SO<sub>4</sub>(aq) → MgSO<sub>4</sub>(aq) + H<sub>2</sub>(g)</div></div></div>
  <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
   <div class="panel" style="padding:10px 16px;gap:6px"><div style="font-size:22px;font-weight:800;color:var(--cyan)">المطلوب: كيف يتغيّر حجم H<sub>2</sub> إذا زادت كمية Mg؟</div>
    <div style="font-size:21px;font-weight:800;margin-top:2px">اختر احتياطات السلامة الصحيحة (٣):</div><div style="display:flex;flex-wrap:wrap;gap:8px" id="sf0"></div><div class="fb" id="sfb" style="min-height:24px"></div></div>
   <div class="panel" style="padding:10px 16px;gap:4px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">ملاحظات هامة</div>
    <ul style="margin:0;padding-inline-start:24px;font-size:20px;line-height:1.5"><li>نظّف شريط Mg بورق السنفرة قبل استخدامه.</li><li>أسقط الشريط في الحمض مباشرة وأغلق السدادة بسرعة لتقليل فقدان الغاز.</li><li>اقرأ حجم الغاز بعد توقف الفقاعات تماماً.</li></ul></div>
   <div class="gbar hide" id="gb" style="font-size:21px">جاهزون! في الشريحة التالية نجرّب بأنفسنا بأطوال مختلفة من الشريط.</div></div></div>`;},
 init:function(el){
  var items=[['نظارة واقية',1],['معطف المختبر',1],['قفازان واقيان عند الضرورة',1],['تقريب الشريط من اللهب',0],['تذوّق الحمض المخفف',0]], left=3, box=$('#sf0',el), fb=$('#sfb',el);
  box.innerHTML=items.map(function(it){return '<button type="button" class="opt sfc" data-ok="'+it[1]+'" style="font-size:20px;min-height:44px">'+it[0]+'</button>'}).join('');
  $$('.sfc',el).forEach(function(b){b.addEventListener('click',function(){
   if(b.classList.contains('ok-b')) return;
   if(b.getAttribute('data-ok')==='1'){ b.classList.add('ok-b'); left--; say(fb,left?'صح! بقي '+ar(left):'ممتاز! احتياطات التجربة كاملة','ok'); if(!left){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} }
   else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,b.textContent.indexOf('اللهب')>=0?'شريط Mg سريع الاشتعال: نبعده عن اللهب':'لا نتذوق المواد الكيميائية أبداً','bad') }
  })});
 },
 note:'<ul><li>نشاط ٣-٣ (إثرائي) في كتاب الطالب ص٦٨ ودليل المعلم ص٦٢: مادة الاستقصاء شريط ماغنيسيوم طوله 15 cm، وحمض كبريتيك مخفف (1 mol/L)، ومخبار مدرج، وأنبوبة توصيل بسدادة، وحوض ماء.</li><li>احتياطات الدليل: نظارة واقية، ومعطف، وقفازان عند الضرورة، وغسل اليدين بعد التجربة، والحمض المخفف مهيّج للجلد، وشريط Mg سريع الاشتعال فيُبعد عن اللهب، ويُمسح أي انسكاب.</li><li>ملاحظات الدليل: تنظيف الشريط بورق السنفرة، وإضافته إلى أنبوبة التسخين ليسقط مباشرة في الحمض وغلق السدادة بسرعة، وتمثيل النتائج بيانياً.</li></ul>'});

/* 22 the virtual lab: strips of different lengths, a reading each, a table and a graph */
slide({id:'lab',ch:5,title:'المختبر الافتراضي: طول الشريط وحجم الغاز',tag:'جرّب بنفسك',
 html:function(){return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
  <div class="col" style="width:470px;flex:none;gap:6px;justify-content:center"><div class="panel" style="padding:6px 8px;align-items:center">${labSVG({id:'lv',h:370})}</div>
   <div class="sm" id="lvmsg" style="font-size:20px;text-align:center;min-height:50px;line-height:1.35">اختر طول الشريط ثم اضغط «ابدأ التجربة».</div><div class="gbar hide" id="gb" style="font-size:20px">الحمض فائض فيتناسب حجم H<sub>2</sub> مع كمية Mg: <b>خط مستقيم يمرّ بالأصل</b>.</div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:flex-start">
   <div class="panel" style="padding:9px 14px;gap:7px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:21px;font-weight:800">طول الشريط:</span>${[1,2,3,4,5].map(function(n){return '<button type="button" class="pill lenb" data-l="'+n+'" style="min-height:44px;padding:0 16px;font-size:22px">'+ar(n)+' cm</button>'}).join('')}<button class="btn acc" type="button" id="lvgo" style="font-size:21px;margin-inline-start:auto">▶ ابدأ التجربة</button></div>
    <div id="lvread" style="display:none;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:21px;font-weight:800">اقرأ المخبار: حجم الغاز =</span>${nin('lvr','mL')}<span class="fb" id="lvfb" style="flex:1;min-width:150px;min-height:22px;font-size:19px"></span></div></div>
   <div style="display:flex;gap:10px;align-items:stretch">
    <div class="panel" style="width:200px;flex:none;padding:8px 10px;gap:4px"><table class="mtab" id="lvtab" style="border-spacing:0 3px"><thead><tr><th>الطول</th><th>الحجم</th></tr></thead><tbody></tbody></table><div class="sm" id="lvavg" style="font-size:17px;text-align:center;min-height:22px"> </div></div>
    <div class="panel" style="flex:1;min-width:0;padding:6px 8px;align-items:center"><svg id="lvplot" viewBox="0 0 330 220" width="100%" style="max-height:190px" aria-hidden="true"></svg></div></div>
   <div class="panel hide" id="lvq" style="padding:9px 14px;gap:5px"><div style="font-size:21px;font-weight:800">ما العلاقة بين طول الشريط (أي كتلة Mg) وحجم H<sub>2</sub>؟</div>${optsHTML([{t:'علاقة طردية'},{t:'علاقة عكسية'},{t:'لا علاقة'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:8px"')}<div class="fb" style="min-height:22px"></div></div>
  </div></div>`;},
 init:function(el){
  var sel=0, busy=false, runs=[], rep={1:0,2:0,3:0,4:0,5:0}, cur=null, id='lv';
  var gas=$('#'+id+'gas',el), lev=$('#'+id+'lev',el), mg=$('#'+id+'mg',el), bb=$('#'+id+'bb',el), msg=$('#lvmsg',el), rd=$('#lvread',el);
  function level(v){ gas.setAttribute('height',(v*LAB_PX).toFixed(1)); lev.setAttribute('y1',(LAB_Y0+v*LAB_PX).toFixed(1)); lev.setAttribute('y2',(LAB_Y0+v*LAB_PX).toFixed(1)) }
  function plot(){
   var W=330, H=220, x0=44, y0=190, sx=(W-x0-14)/5, sy=(y0-14)/100, s='', i, k=0, sxx=0, sxy=0;
   for(i=0;i<=5;i++){ s+='<line x1="'+(x0+i*sx)+'" y1="'+y0+'" x2="'+(x0+i*sx)+'" y2="'+(y0+5)+'" stroke="rgba(var(--t2),.8)"/><text x="'+(x0+i*sx)+'" y="'+(y0+20)+'" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)" direction="ltr">'+i+'</text>' }
   for(i=0;i<=100;i+=20){ s+='<line x1="'+(x0-5)+'" y1="'+(y0-i*sy)+'" x2="'+(W-14)+'" y2="'+(y0-i*sy)+'" stroke="rgba(var(--t2),'+(i?'.22':'.8')+')"/><text x="'+(x0-9)+'" y="'+(y0-i*sy+5)+'" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)" direction="ltr">'+i+'</text>' }
   s+='<line x1="'+x0+'" y1="14" x2="'+x0+'" y2="'+y0+'" stroke="rgba(var(--t2),.8)"/><text x="'+(W-12)+'" y="'+(y0+20)+'" text-anchor="end" font-size="13" font-weight="700" fill="var(--muted)">cm</text><text x="'+(x0+8)+'" y="12" font-size="13" font-weight="700" fill="var(--muted)">mL</text>';
   runs.forEach(function(r){ sxx+=r.L*r.L; sxy+=r.L*r.V });
   if(runs.length>=3){ k=sxy/sxx; s+='<line x1="'+x0+'" y1="'+y0+'" x2="'+(x0+5*sx)+'" y2="'+(y0-Math.min(100,5*k)*sy)+'" stroke="var(--gold)" stroke-width="3" stroke-dasharray="7 5"/>' }
   runs.forEach(function(r){ s+='<circle cx="'+(x0+r.L*sx)+'" cy="'+(y0-r.V*sy)+'" r="6" fill="var(--cyan)" stroke="#fff" stroke-width="1.5"/>' });
   $('#lvplot',el).innerHTML=s;
  }
  function table(){
   $('#lvtab tbody',el).innerHTML=runs.map(function(r){return '<tr><td><span class="num">'+r.L+' cm</span></td><td><span class="num">'+r.V+' mL</span></td></tr>'}).join('');
   var a=runs.length?runs.reduce(function(t,r){return t+r.V/r.L},0)/runs.length:0;
   $('#lvavg',el).innerHTML=runs.length>=2?'المتوسط: <span class="num">V ÷ L ≈ '+a.toFixed(1)+' mL/cm</span>':' ';
  }
  function reset(){ level(0); lev.style.opacity=0; mg.style.opacity=1; mg.style.transform='scaleX(1)'; bb.style.opacity=0 }
  function setBusy(b){ busy=b; $$('.lenb',el).forEach(function(x){x.disabled=b}); $('#lvgo',el).disabled=b }
  $$('.lenb',el).forEach(function(b){b.addEventListener('click',function(){ if(busy) return; sel=+b.getAttribute('data-l'); $$('.lenb',el).forEach(function(x){x.classList.toggle('on',x===b)}); msg.textContent='شريط Mg طوله '+ar(sel)+' cm. اضغط «ابدأ التجربة».'; mg.style.transform='scaleX('+(0.35+0.13*sel).toFixed(2)+')' })});
  $('#lvgo',el).addEventListener('click',function(){
   if(busy) return;
   if(!sel){ msg.textContent='اختر طول الشريط أولاً.'; return }
   if(runs.length>=6){ msg.textContent='سجّلنا ست تجارب، يكفي. أجب عن السؤال في الأسفل.'; return }
   setBusy(true); rd.style.display='none'; reset(); mg.style.transform='scaleX('+(0.35+0.13*sel).toFixed(2)+')';
   var L=sel, V=labVol(L,rep[L]++); cur={L:L,V:V};
   msg.textContent='أسقطنا الشريط في الحمض وأغلقنا السدادة…'; bb.style.opacity=1; lev.style.opacity=1;
   var t0=performance.now(), D=2600;
   (function tick(now){
    var k=Math.max(0,Math.min(1,(now-t0)/D)), e=1-Math.pow(1-k,2);
    level(V*e); mg.style.opacity=(1-0.9*e).toFixed(2);
    if(k<1) requestAnimationFrame(tick);
    else{ bb.style.opacity=0; msg.textContent='توقف تصاعد الغاز. اقرأ مستوى الماء على تدريج المخبار.'; rd.style.display='flex'; var inp=$('#lvread input',el); inp.value=''; inp.readOnly=false; inp.classList.remove('ok-b'); $('#lvread .go',el).classList.remove('hide'); try{inp.focus()}catch(x){} }
   })(t0);
  });
  (function(){
   var box=$('#lvread .nin',el), inp=$('input',box), go=$('.go',box), fb=$('#lvfb',el), tries=0;
   function chk(){
    if(!cur||inp.readOnly) return;
    var v=nz(inp.value); if(v===null){inp.classList.add('shake'); later(function(){inp.classList.remove('shake')},340); return}
    if(Math.abs(v-cur.V)<=2){
     inp.classList.add('ok-b'); inp.readOnly=true; go.classList.add('hide'); say(fb,'✓ '+cur.V+' mL','ok'); runs.push(cur); cur=null; table(); plot();
     later(function(){ reset(); rd.style.display='none'; setBusy(false); msg.textContent=runs.length>=6?'سجّلنا ست تجارب.':'اختر طولاً آخر وكرّر.' },900);
     if(runs.length>=4&&new Set(runs.map(function(r){return r.L})).size>=3){ var q=$('#lvq',el); if(q.classList.contains('hide')){q.classList.remove('hide'); q.classList.add('up')} }
    }else{ tries++; inp.classList.add('bad-b','shake'); later(function(){inp.classList.remove('shake')},340); say(fb,tries>1?'الخط الذهبي يقطع التدريج عند الرقم الذي تقرؤه':'اقرأ الرقم عند مستوى الماء','bad') }
   }
   go.addEventListener('click',chk);
   inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault(); chk()} });
   inp.addEventListener('input',function(){inp.classList.remove('bad-b')});
  })();
  bindMcq($('#lvq',el),[{t:'',ok:true,why:'صح: بتضاعف الطول يتضاعف الحجم تقريباً، والنقاط على خط مستقيم يمر بالأصل'},{t:'',why:'انظر إلى الرسم: النقاط تصعد مع الطول'},{t:'',why:'الرسم يبيّن علاقة واضحة'}],$('#lvq .fb',el),function(){$('#lvq .opts',el).classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
  reset(); plot();
 },
 note:'<ul><li>محاكاة نشاط ٣-٣: نقيس حجم H₂ الناتج من تفاعل أطوال مختلفة من شريط Mg مع فائض من الحمض. المنتج المتوقع: حوالي 16.4 mL لكل cm (شريط 5 cm يعطي نحو 82 mL كما في تمرين ٣-٤).</li><li>الأرقام المعروضة تقريبية ومولَّدة لتشبه نتائج الطلاب (فيها تفاوت صغير). تكرار نفس الطول يعطي قراءة مختلفة قليلاً، وهذا يرتبط بأسباب التفاوت في الشريحة التالية.</li><li>الاستنتاج المطلوب: العلاقة طردية لأن Mg والحمض الفائض يتفاعلان بنسب ثابتة. اطلب منهم تجربة ثلاثة أطوال مختلفة على الأقل.</li><li>التدريج على المخبار المقلوب يبدأ من الصفر في الأعلى لتسهيل قراءة حجم الغاز مباشرة.</li></ul>'});

/* 23 the questions of the activity (teacher's guide answers) */
(function(){
  var items=[
   {q:'لماذا نغلق السدادة بسرعة؟ وما الطريقة البديلة لجمع الغاز وقياس حجمه؟',opts:[{t:'لئلا يضيع جزء من الغاز (وبعضه قد يذوب في الماء). البديل: محقنة غاز',ok:true,why:'صح: نمنع فقدان الغاز، والبديل محقنة غاز'},{t:'لئلا يتبخر الحمض. البديل: مخبار أصغر'},{t:'لتبريد الدورق. البديل: ميزان'}]},
   {q:'ماذا يعني أن شريط الماغنيسيوم تفاعل كلياً؟',opts:[{t:'أن حمض الكبريتيك مادة فائضة',ok:true,why:'صح: Mg هو المحدد والحمض فائض'},{t:'أن الحمض نفد'},{t:'أن الشريط ذاب في الماء'}]},
   {q:'كيف نستدل على التناسب بين كمية Mg وحجم H<sub>2</sub> الناتج؟',opts:[{t:'المواد تتفاعل وتنتج بنسب ثابتة، فيتناسب الحجم مع الكمية إذا كان الحمض فائضاً',ok:true,why:'صح: النسبة 1 : 1 بين Mg وH₂'},{t:'الحجم ثابت مهما تغيرت كتلة Mg'},{t:'الحجم يتناسب مع كتلة الحمض'}]},
   {type:'num',q:'جُمع <span class="num">41 mL</span> من H<sub>2</sub>. كم عدد مولات الهيدروجين؟ (n = الحجم بالـ mL ÷ 24000)',unit:'mol',ans:41/24000,tol:0.00003,why:'41 ÷ 24000 = 0.0017 mol',hint:'n = V(mL) ÷ 24000'},
   {type:'num',q:'ما كتلة Mg التي تفاعلت في السؤال السابق؟ (n(Mg) = n(H<sub>2</sub>) ، Mg = 24)',unit:'g',ans:0.041,tol:0.0006,why:'0.0017 × 24 = 0.041 g (أي 0.001 g لكل mL)',hint:'الكتلة = n × 24'}
  ];
  slide({id:'labq',ch:5,title:'أسئلة النشاط ٣-٣',tag:'تذكرة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'labq')},
   note:'<ul><li>إجابات دليل المعلم (ص٦٢): ١) لمنع فقدان الغاز لأن بعضه قد يذوب في الماء؛ البديل محقنة غاز. ٢) أن حمض الكبريتيك فائض. ٣) تتفاعل المواد وتنتج بنسب ثابتة فيتناسب حجم الهيدروجين مع كمية Mg. ٤) V(mL) ÷ 24000 = n(H₂). ٥) n × 24 = m(Mg).</li><li>الشريحة تضيف مثالاً عددياً للسؤالين ٤ و٥: 41 mL ← 0.0017 mol ← 0.041 g.</li></ul>'});
})();

/* 24 exercise 3-4 (a): the three readings, their mean and why they differ */
slide({id:'ex34a',ch:5,title:'تمرين ٣-٤: معالجة البيانات',tag:'متوسط وتفسير',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="width:440px;flex:none;gap:10px;justify-content:center">
   <div class="panel" style="padding:12px 18px;gap:8px"><p class="lead" style="margin:0;font-size:22px">حصل طالب على النتائج الآتية عند قياس حجم H<sub>2</sub> الناتج من شريط Mg طوله <b class="num">5 cm</b>:</p>
    <table class="mtab"><thead><tr><th>رقم التجربة</th><th>حجم H₂ (mL)</th></tr></thead><tbody><tr><td>1</td><td><span class="num">85</span></td></tr><tr><td>2</td><td><span class="num">79</span></td></tr><tr><td>3</td><td><span class="num">82</span></td></tr><tr><td><b>المتوسط</b></td><td>${nin('mean','mL')}</td></tr></tbody></table><div class="fb fm" style="min-height:24px"></div></div></div>
 <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="panel" id="exsv" style="padding:8px 10px;align-items:center">${labSVG({id:'ea',callouts:1,h:400})}</div>
   <div class="panel hide" id="rsn" style="padding:12px 18px;gap:8px"><div style="font-size:22px;font-weight:800">اختر <b>الأسباب المحتملة</b> لعدم تطابق النتائج الثلاث (أ.٢):</div>
    <div style="display:flex;flex-direction:column;gap:8px" id="rsl"></div><div class="fb fr" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">نكرر التجربة <b>ثلاث مرات</b> ونأخذ <b>المتوسط</b> لتقليل أثر هذه الأخطاء، ثم نحسب بالمتوسط 82 mL.</div></div></div>`;},
 init:function(el){
  var R=[['صعوبة قص قطع من شريط Mg بأطوال متساوية تماماً',1,''],['سماكة الشريط وعرضه ليسا متساويين على طوله',1,''],['فقدان جزء من الغاز عند إسقاط الشريط في الدورق وإغلاق السدادة',1,''],['بقاء بعض الهواء داخل المخبار المقلوب قبل بدء التفاعل',1,''],['تغيّر الحجم المولي للغاز من تجربة لأخرى',0,'الظروف نفسها، فالحجم المولي واحد'],['نفاد الحمض قبل انتهاء التفاعل',0,'الحمض فائض في هذه التجربة']], left=4;
  $('#rsl',el).innerHTML=R.map(function(r,i){return '<button type="button" class="opt rsb" data-i="'+i+'" style="font-size:20px;min-height:46px;justify-content:flex-start">'+r[0]+'</button>'}).join('');
  var fb=$('.fr',el);
  $$('.rsb',el).forEach(function(b){b.addEventListener('click',function(){
   var r=R[+b.getAttribute('data-i')]; if(b.classList.contains('ok-b')||b.classList.contains('bad-b')) return;
   if(r[1]){ b.classList.add('ok-b'); left--; say(fb,left?'صح! بقي '+ar(left)+(left>1?' أسباب':' سبب'):'ممتاز! هذه الأسباب الأربعة كلها محتملة','ok'); if(!left){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} }
   else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,r[2],'bad') }
  })});
  bindNum($('.nin',el),82,0.5,function(ok){ var f=$('.fm',el); if(ok){ say(f,'✓ (85 + 79 + 82) ÷ 3 = 82 mL','ok'); var p=$('#rsn',el); $('#exsv',el).classList.add('hide'); p.classList.remove('hide'); p.classList.add('up') } else say(f,'اجمع القراءات الثلاث واقسم على 3','bad') });
 },
 note:'<ul><li>كتاب النشاط تمرين ٣-٤ (أ): القراءات 85 و79 و82 mL، والمتوسط 82 mL. الجزء (أ.٢): أسباب عدم التطابق، مثل صعوبة قص أطوال متساوية، وعدم تجانس سماكة الشريط، وفقدان الغاز عند إسقاط الشريط، ووجود هواء في المخبار.</li><li>في امتحان ٢٠٢٢/٢٠٢٣ (الدور الثاني) سؤال مشابه: ذكر سببين لتفاوت الحجم، والمتوسط 500 mL من 497 و503 و500.</li></ul>'});

/* 25 exercise 3-4 (b, c): the mass of the strip and the mass of magnesium sulfate it would give */
chainSlide({id:'ex34b',ch:5,title:'تمرين ٣-٤: كتلة الشريط وكتلة كبريتات Mg',
 eq:'Mg(s) + H<sub>2</sub>SO<sub>4</sub>(aq) → MgSO<sub>4</sub>(aq) + H<sub>2</sub>(g)',eqSize:30,
 data:'متوسط حجم <span class="num">H<sub>2</sub></span> الناتج من الشريط (<span class="num">5 cm</span>) = <b class="num">82 mL</b><br><span class="num">Mg = 24</span> ، <span class="num">M(MgSO<sub>4</sub>) = 24 + 32 + 4×16 = 120 g/mol</span>',
 labels:['المعطى','n(H₂) = n(Mg)','m(Mg)','m(MgSO₄)'],first:'V = 82 mL',
 steps:[{n:'b1',q:'n(H<sub>2</sub>) = V ÷ 24000',u:'mol',lab:'n =',a:82/24000,t:0.00003,w:'✓ 82 ÷ 24000 = 0.00342 mol',h:'اقسم 82 على 24000',fill:'0.00342 mol'},
        {n:'b2',q:'m(Mg) = n × 24 (النسبة 1 : 1)',u:'g',lab:'m =',a:0.082,t:0.0012,w:'✓ 0.00342 × 24 = 0.082 g من Mg',h:'n(Mg) = n(H₂) ثم × 24',fill:'0.082 g'},
        {n:'b3',q:'m(MgSO<sub>4</sub>) = n × 120',u:'g',lab:'m =',a:0.41,t:0.006,w:'✓ 0.00342 × 120 = 0.41 g من MgSO₄',h:'n(MgSO₄) = n(Mg) ثم × 120',fill:'0.41 g'}],
 side:'<div class="defc gold" style="flex:none"><b>اختصار للتحقق</b><span class="bigeq" style="font-size:20px;text-align:start">24 g Mg → 24000 mL H<sub>2</sub></span><span class="bigeq" style="font-size:20px;text-align:start">24 g Mg → 120 g MgSO<sub>4</sub></span><span class="bigeq" style="font-size:20px;color:var(--gold);text-align:start">1 mL H<sub>2</sub> ≙ 0.001 g Mg ≙ 0.005 g MgSO<sub>4</sub></span></div>',
 gbar:'تحقق: 82 × 0.001 = 0.082 g ، و82 × 0.005 = <b>0.41 g</b> من كبريتات المغنيسيوم.',
 note:'<ul><li>كتاب النشاط تمرين ٣-٤ (ب، ج): كتلة Mg = 82 ÷ 24000 × 24 = 0.082 g، وكتلة كبريتات Mg = 0.082 × 120 ÷ 24 = <b>0.41 g</b>.</li><li><b>تصحيح مهم:</b> في عرض NotebookLM (الشريحة ٩) كتب في المسار الأول 0.14 g لكتلة كبريتات المغنيسيوم، والصحيح 0.41 g (0.082 × 120 ÷ 24)، كما أن عنواني المسارين مقلوبان مقابل نتيجتيهما. اعتمدنا القيمة الصحيحة.</li><li>الدليل: يمكن الوصول للإجابات بطرق أخرى تتناسب مع المنهج.</li></ul>'});

/* 26 exercise 3-4 (d): plan a check of the prediction */
slide({id:'ex34c',ch:5,title:'تمرين ٣-٤ (د): خطّط تجربة للتحقق',tag:'رتّب الخطوات',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:520px;flex:none;gap:8px;justify-content:flex-start">
   <div class="panel" style="padding:10px 16px"><p class="lead" style="margin:0;font-size:21px;line-height:1.45">توقّعنا أن شريطاً طوله 5 cm يُنتج <b class="num">0.41 g</b> من كبريتات المغنيسيوم. رتّب خطوات التجربة للتحقق من ذلك:</p></div>
   <div class="imp-tray" id="tray" style="display:flex;flex-direction:column;gap:7px"></div></div>
  <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:flex-start">
   ${[0,1,2,3,4,5].map(function(i){return `<div style="display:flex;align-items:center;gap:10px"><div class="mk" style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:23px;flex:none">${ar(i+1)}</div><div class="mslot slot" data-k="${i}" style="flex:1;min-height:60px"><span class="ph" style="font-size:18px">اسحب الخطوة المناسبة</span></div></div>`}).join('')}
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">إذا تطابقت كتلة البلورات مع <b>0.41 g</b> (بعد تعديل طول الشريط) فتوقعنا صحيح.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[[3,'سخّن المحلول بلطف حتى يجف تماماً دون تناثر'],[0,'زن شريط ماغنيسيوم كتلته معروفة'],[5,'اطرح كتلة الكأس لتجد كتلة البلورات وقارنها بالكتلة المحسوبة'],[1,'دع الشريط يتفاعل مع فائض من الحمض حتى يتوقف خروج الغاز ويختفي الشريط'],[4,'اترك الكأس تبرد ثم زنها مع البقايا الصلبة'],[2,'انقل المحلول إلى كأس زجاجية كتلتها معروفة']],{css:'font-size:19px;padding:8px 14px;text-align:start',bad:'فكّر: ما الذي نحتاجه أولاً لنعرف كتلة الشريط؟'});
 },
 note:'<ul><li>كتاب النشاط تمرين ٣-٤ (د): خطّط تجربة للتحقق من صحة توقّعك. الفكرة (من عرض NotebookLM): وزن شريط معلوم الكتلة، تفاعله مع فائض من الحمض، نقل المحلول إلى كأس معلومة الكتلة، تسخين حتى الجفاف دون تناثر، تبريد ووزن البقايا، ثم حساب كتلة البلورات ومقارنتها بالتوقع.</li><li>العامل الرئيسي: 24 g من Mg تُنتج 120 g من كبريتات المغنيسيوم اللامائية المجففة.</li><li>تعديل منّي: وحّدت الخطوتين الأخيرتين في العرض في خطوة واحدة.</li></ul>'});

/* 27 class race */
slide({id:'race',ch:6,title:'سباق الفصل: حجوم وكتل وغازات',tag:'مسابقة',
 html:function(){
  var Q=[['أ','حجم 0.5 mol من CO<sub>2</sub>','L'],['ب','n في 1.2 L من H<sub>2</sub>','mol'],['ج','2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O: 30 mL H<sub>2</sub> ← mL O<sub>2</sub>','mL'],['د','N<sub>2</sub> + 3H<sub>2</sub> → 2NH<sub>3</sub>: 10 L N<sub>2</sub> ← L NH<sub>3</sub>','L'],['هـ','2.4 g Mg مع حمض فائض ← mL H<sub>2</sub>','mL'],['و','CaCO<sub>3</sub> + 2HCl → CaCl<sub>2</sub> + H<sub>2</sub>O + CO<sub>2</sub>: 5 g CaCO<sub>3</sub> ← mL CO<sub>2</sub>','mL'],['ز','Zn + 2HCl → ZnCl<sub>2</sub> + H<sub>2</sub>: 480 mL H<sub>2</sub> ← g Zn','g'],['ح','2KClO<sub>3</sub> → 2KCl + 3O<sub>2</sub>: 0.2 mol KClO<sub>3</sub> ← L O<sub>2</sub>','L']];
  return `<div class="col grow" style="gap:8px"><div class="chips" style="gap:8px;direction:ltr;justify-content:center">${['H','C','O','Mg','Ca','Zn'].map(function(s){return '<span class="pill" style="min-height:34px;padding:0 12px;font-size:19px;font-family:var(--font-display)">'+s+' = '+AR[s]+'</span>'}).join('')}<span class="pill" style="min-height:34px;padding:0 12px;font-size:19px;font-family:var(--font-display)">1 mol = 24 L</span></div>
   <div class="rgrid" style="grid-template-columns:repeat(4,1fr)">${Q.map(function(q,i){return `<div class="rc" data-i="${i}"><div class="nm" style="font-size:18px">${q[0]}. ${q[1]}</div><div class="ans"></div>${ninHTML('r'+i,q[2],'sm')}</div>`}).join('')}</div></div>
   <div class="teams"><div class="team"><div style="font-weight:700;font-size:21px">الفريق الأول</div><b class="num" id="tA">0</b><div class="pm"><button type="button" data-t="A" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="A" data-d="1" aria-label="زِد">+</button></div></div>
   <div class="team b"><div style="font-weight:700;font-size:21px">الفريق الثاني</div><b class="num" id="tB">0</b><div class="pm"><button type="button" data-t="B" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="B" data-d="1" aria-label="زِد">+</button></div></div>
   <p class="sm muted" id="left" style="text-align:center">٨ أسئلة متبقية</p></div>`;},
 init:function(el){
  var A=[12,0.05,15,20,2400,1200,1.3,7.2], sc={A:0,B:0}, left=8;
  $$('.team .pm button',el).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); sc[t]=Math.max(0,sc[t]+ +b.getAttribute('data-d')); $('#t'+t,el).textContent=sc[t]})});
  $$('.rc',el).forEach(function(c,i){
   bindNum($('.nin',c),A[i],Math.max(tolOf(A[i])*1.5,1e-6),function(ok){ if(ok){c.classList.add('ok'); $('.ans',c).textContent='= '+(+A[i].toPrecision(4)); left--; $('#left',el).textContent=left?ar(left)+' أسئلة متبقية':'انتهت الأسئلة!'} });
  });
 },
 note:'<ul><li>الإجابات: ١٢ L، ٠٫٠٥ mol، ١٥ mL، ٢٠ L، ٢٤٠٠ mL، ١٢٠٠ mL، ١٫٣ g، ٧٫٢ L.</li><li>قسّم الصف فريقين، وكل فريق يرسل طالباً. اضغط + للفريق الفائز بالنقطة. الأسئلة من إعدادي.</li></ul>'});
