/* ---------- solutions, part D: the titration apparatus, the steps, activity 3-4 (virtual lab) ---------- */

/* the titration rig. The burette scale runs 0 at the top to 50 mL at the bottom: y = 52 + mL * 4.6 */
var TB_Y0=52, TB_PX=4.6;
function titrSVG(o){
  o=o||{}; var p=o.id||'tr', t='', i, y, lab='';
  for(i=0;i<=50;i++){ y=(TB_Y0+i*TB_PX).toFixed(1); t+='<line x1="170" y1="'+y+'" x2="'+(i%10===0?'154':(i%5===0?'160':'165'))+'" y2="'+y+'" stroke="rgba(255,255,255,.7)" stroke-width="'+(i%10===0?2.2:1.2)+'"/>'+(i%10===0?'<text x="148" y="'+(+y+5)+'" text-anchor="end" font-size="14" font-weight="700" fill="var(--ink)" direction="ltr">'+i+'</text>':'') }
  if(o.callouts) lab=
   '<text id="'+p+'tbur" x="226" y="96" text-anchor="end" font-size="17" font-weight="800" fill="var(--cyan)">سحاحة (حمض)</text>'+
   '<text id="'+p+'tfl" x="266" y="432" text-anchor="end" font-size="17" font-weight="800" fill="var(--cyan)">دورق + قاعدة</text>'+
   '<text id="'+p+'tpip" x="402" y="104" text-anchor="middle" font-size="17" font-weight="800" fill="var(--cyan)">ماصة 25 mL</text>'+
   '<text id="'+p+'tind" x="404" y="396" text-anchor="middle" font-size="17" font-weight="800" fill="var(--cyan)">كاشف</text>';
  return '<svg id="'+p+'" viewBox="0 0 460 456" width="100%" style="max-height:'+(o.h||420)+'px" aria-hidden="true">'+
   '<rect x="24" y="446" width="270" height="10" rx="4" fill="rgba(var(--t2),.5)"/><rect x="44" y="34" width="10" height="414" rx="3" fill="rgba(var(--t2),.55)"/><rect x="52" y="112" width="124" height="8" rx="3" fill="rgba(var(--t2),.55)"/>'+
   '<g id="'+p+'gB"><rect x="170" y="40" width="40" height="262" rx="6" fill="rgba(var(--t1),.10)" stroke="var(--cyan)" stroke-width="3.5"/>'+
   '<rect id="'+p+'ac" x="172" y="'+(TB_Y0+50*TB_PX)+'" width="36" height="0" fill="rgba(80,190,255,.38)"/>'+
   '<line id="'+p+'mn" x1="172" y1="'+TB_Y0+'" x2="208" y2="'+TB_Y0+'" stroke="rgba(255,255,255,.85)" stroke-width="2.5" style="opacity:0"/>'+t+
   '<path d="M170 296V304L186 318H194L210 304V296" fill="rgba(var(--t1),.10)" stroke="var(--cyan)" stroke-width="3.5" stroke-linejoin="round"/>'+
   '<rect x="186" y="314" width="8" height="26" fill="rgba(var(--t2),.6)"/><rect x="156" y="322" width="68" height="9" rx="4" fill="var(--gold)"/><path d="M186 340L190 362L194 340Z" fill="rgba(var(--t2),.6)"/></g>'+
   '<circle id="'+p+'dr" cx="190" cy="372" r="5" fill="rgba(80,190,255,.8)" style="opacity:0"/>'+
   '<g id="'+p+'gF"><path d="M168 384H212V404L262 440Q266 446 258 446H122Q114 446 118 440L168 404Z" fill="rgba(var(--t1),.08)" stroke="var(--cyan)" stroke-width="3.5" stroke-linejoin="round"/>'+
   '<path id="'+p+'fl" d="M138 418H242L262 440Q266 446 258 446H122Q114 446 118 440Z" fill="rgba(0,0,0,0)"/></g>'+
   '<rect x="96" y="447" width="190" height="7" rx="3" fill="#fff" opacity=".8"/>'+
   (o.extras?'<g id="'+p+'gP"><ellipse cx="356" cy="146" rx="19" ry="28" fill="rgba(var(--t1),.12)" stroke="var(--cyan)" stroke-width="3"/><rect x="351" y="172" width="10" height="180" fill="rgba(var(--t1),.12)" stroke="var(--cyan)" stroke-width="3"/><line x1="346" y1="222" x2="366" y2="222" stroke="var(--gold)" stroke-width="3"/><path d="M351 352L356 376L361 352Z" fill="rgba(var(--t2),.6)"/></g>'+
    '<g id="'+p+'gI"><rect x="384" y="424" width="40" height="30" rx="6" fill="rgba(var(--t1),.15)" stroke="var(--cyan)" stroke-width="3"/><rect x="396" y="404" width="16" height="20" rx="3" fill="var(--gold)"/></g>':'')+lab+'</svg>';
}
/* the colour of methyl orange for a given distance d (mL) from the end point: yellow, orange at the end point, red after */
function indColor(d){
  var h=d<=-1?52:(d<0?52+(24-52)*(1+d):(d<0.4?24-18*(d/0.4):6));
  return 'hsl('+h.toFixed(0)+',88%,52%)';
}

/* 14 what is a titration: tap the parts */
slide({id:'what',ch:3,title:'ما المعايرة؟ وما أدواتها؟',tag:'اضغط على كل جزء',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:470px;flex:none;gap:6px;justify-content:center"><div class="panel" style="padding:6px 8px;align-items:center">${titrSVG({id:'wt',extras:1,callouts:1,h:420})}</div></div>
  <div class="col" style="flex:1;min-width:0;gap:9px;justify-content:center">
   <div class="defc gold" style="flex:none"><b>المعايرة Titration</b><span>طريقة مخبرية لتحديد تركيز محلول مجهول بتفاعله مع محلول <b>قياسي</b> معلوم التركيز.</span></div>
   <div class="chips" style="gap:8px">${[['B','السحاحة'],['F','الدورق'],['P','الماصة'],['I','الكاشف']].map(function(x){return '<button type="button" class="pill pk" data-k="'+x[0]+'" style="min-height:44px;font-size:21px">'+x[1]+'</button>'}).join('')}</div>
   <div class="frm brk" style="padding:12px 18px;gap:6px;min-height:150px;justify-content:center"><div style="font-size:22px;font-weight:800;color:var(--gold)" id="wtn">اضغط على جزء من الجهاز</div><div style="font-size:21px;line-height:1.5" id="wtd"> </div></div>
   <div class="gbar hide" id="gb" style="font-size:20px">نضيف الحمض من السحاحة <b>بالتنقيط</b> حتى يتغير لون الكاشف: <b>نقطة النهاية</b>، وعندها نعرف حجم الحمض المستهلك.</div></div></div>`;},
 init:function(el){
  var D={B:['السحاحة Burette','تحتوي على محلول (غالباً الحمض) نضيفه بالتنقيط. تُقرأ منها الحجم الابتدائي والنهائي، والفرق بينهما هو الحجم المستهلك.'],F:['الدورق المخروطي','يحتوي على حجم محدد من المحلول القلوي (قياسي) مع الكاشف. نحرّكه برفق (دائرياً) أثناء الإضافة.'],P:['الماصة Pipette','تقيس حجماً محدداً بدقة (25 mL) من المحلول القلوي وتنقله إلى الدورق.'],I:['الكاشف Indicator','بضع قطرات تُضاف إلى الدورق: يتغير لونه عند نقطة النهاية (الميثيل البرتقالي: أصفر في القلوي ثم برتقالي).']}, seen={};
  $$('.pk',el).forEach(function(b){b.addEventListener('click',function(){
   var k=b.getAttribute('data-k'); $$('.pk',el).forEach(function(x){x.classList.toggle('on',x===b)});
   var TX={B:'tbur',F:'tfl',P:'tpip',I:'tind'};
   ['B','F','P','I'].forEach(function(z){var g=$('#wtg'+z,el), t=$('#wt'+TX[z],el); if(g) g.classList.toggle('hl',z===k); if(t) t.classList.toggle('hl',z===k)});
   $('#wtn',el).textContent=D[k][0]; $('#wtd',el).textContent=D[k][1]; seen[k]=1;
   if(Object.keys(seen).length===4){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')}
  })});
 },
 note:'<ul><li>كتاب الطالب ص٧١–٧٢ (الشكل ٣-٦): المعايرة تحديد تركيز حمض غير معروف التركيز بتفاعله مع مادة قلوية، والمحلول القياسي Standard solution محلول يُحضَّر بعناية ليكون تركيزه معروفاً بدقة. تُملأ السحاحة بالحمض، وتُستخدم ماصة لقياس حجم المحلول القلوي في دورق مخروطي مع الكاشف، ثم يُضاف الحمض بالتنقيط حتى نقطة النهاية.</li><li>الأسئلة في الامتحانات: تسمية الأدوات (السحاحة والماصة تقيسان الحجم بدقة)، ولماذا نستخدم الكاشف (لمعرفة نقطة نهاية المعايرة).</li></ul>'});

/* 15 the steps of a titration (book figure 3-7) */
slide({id:'tsteps',ch:3,title:'خطوات المعايرة بالترتيب',tag:'رتّب الخطوات',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:540px;flex:none;gap:8px;justify-content:flex-start">
   <div class="panel" style="padding:10px 16px"><p class="lead" style="margin:0;font-size:21px;line-height:1.45">الشكل ٣-٧ في كتاب الطالب: رتّب خطوات المعايرة من الأولى إلى الأخيرة.</p></div>
   <div class="imp-tray" id="tray" style="display:flex;flex-direction:column;gap:7px"></div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:flex-start">
   ${[0,1,2,3,4].map(function(i){return `<div style="display:flex;align-items:center;gap:10px"><div class="mk" style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:23px;flex:none">${ar(i+1)}</div><div class="mslot slot" data-k="${i}" style="flex:1;min-height:66px"><span class="ph" style="font-size:18px">اسحب الخطوة المناسبة</span></div></div>`}).join('')}
   <div class="fb" style="text-align:center;min-height:24px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">نكرر حتى تتقارب نتيجتان (فرق ≤ <b>0.1 mL</b>) ونأخذ <b>متوسطهما</b>.</div></div></div>`;},
 init:function(el){
  bindMatch(el,[[2,'أضف الحمض بتأنٍّ إلى الدورق حتى يتغير لون الكاشف. اقرأ الحجم النهائي وسجّله'],[0,'اسحب بالماصة 25 mL من محلول قلوي قياسي إلى دورق مخروطي وأضف الكاشف'],[4,'نظّف المعدات وكرّر حتى تحصل على معايرتين بفرق لا يزيد على 0.1 mL، ثم خذ متوسطهما'],[1,'ضع الحمض في السحاحة واقرأ الحجم الابتدائي وسجّله'],[3,'احسب الفرق بين الحجمين الابتدائي والنهائي لتجد حجم الحمض اللازم']],{css:'font-size:19px;padding:8px 14px;text-align:start',bad:'فكّر: ما الذي نجهزه في الدورق وفي السحاحة قبل أن نبدأ؟'});
 },
 note:'<ul><li>كتاب الطالب الشكل ٣-٧ (ص٧٢) وكراسة الأمثلة (ص٢٠): ١) ماصة 25 mL من محلول قلوي معروف التركيز في دورق مخروطي + الكاشف. ٢) الحمض في السحاحة والحجم الابتدائي. ٣) أضف الحمض حتى يتغير لون الكاشف والحجم النهائي. ٤) الفرق بين الحجمين. ٥) نظّف المعدات وكرر حتى معايرتين ضمن 0.1 mL ثم المتوسط.</li><li>أسئلة امتحانات مشابهة: ٢٠٢٢/٢٠٢٣ دور أول (سؤال ١٥: ترتيب الخطوات) و٢٠٢٣/٢٠٢٤ دور ثانٍ (سؤال ٢٥: اكتب خطوات المعايرة).</li></ul>'});

/* 16 activity 3-4: apparatus, safety and notes */
slide({id:'lab0',ch:3,title:'نشاط ٣-٤: الجهاز والسلامة',tag:'استقصاء',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:420px;flex:none;gap:6px;justify-content:center"><div class="panel" style="padding:6px 8px;align-items:center">${titrSVG({id:'l0',extras:1,h:350})}</div></div>
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
   <div class="panel" style="padding:9px 16px;gap:5px"><div style="font-size:21px;font-weight:800;color:var(--cyan)">المطلوب: تحديد تركيز محلول HCl بمعايرته بمحلول NaOH تركيزه 0.1 mol/L</div>
    <div class="bigeq" style="font-size:26px;color:var(--gold);text-align:start">NaOH(aq) + HCl(aq) → NaCl(aq) + H<sub>2</sub>O(l)</div></div>
   <div class="panel" style="padding:9px 16px;gap:6px"><div style="font-size:21px;font-weight:800">اختر احتياطات السلامة الصحيحة (٣):</div><div style="display:flex;flex-wrap:wrap;gap:8px" id="sf0"></div><div class="fb" id="sfb" style="min-height:22px"></div></div>
   <div class="panel" style="padding:8px 16px;gap:3px"><div style="font-size:20px;font-weight:800;color:var(--cyan)">ملاحظات الدليل</div><ul style="margin:0;padding-inline-start:24px;font-size:19px;line-height:1.45"><li>اغسل الماصة والسحاحة، وأزل فقاعات الهواء.</li><li>اقرأ الحجم عند أسفل سطح السائل (الهلالي) وعينك في مستواه.</li><li>أضف الحمض بالتنقيط عند اقتراب نقطة النهاية.</li></ul></div>
   <div class="gbar hide" id="gb" style="font-size:20px">جاهزون! في الشريحة التالية نجري المعايرة بأنفسنا.</div></div></div>`;},
 init:function(el){
  var items=[['نظارة واقية',1],['معطف المختبر',1],['قفازان واقيان عند الضرورة',1],['شفط المحلول بالماصة بالفم',0],['ترك أي انسكاب دون مسحه',0]], left=3, box=$('#sf0',el), fb=$('#sfb',el);
  box.innerHTML=items.map(function(it){return '<button type="button" class="opt sfc" data-ok="'+it[1]+'" style="font-size:19px;min-height:40px">'+it[0]+'</button>'}).join('');
  $$('.sfc',el).forEach(function(b){b.addEventListener('click',function(){
   if(b.classList.contains('ok-b')) return;
   if(b.getAttribute('data-ok')==='1'){ b.classList.add('ok-b'); left--; say(fb,left?'صح! بقي '+ar(left):'ممتاز! احتياطات التجربة كاملة','ok'); if(!left){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')} }
   else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,b.textContent.indexOf('بالفم')>=0?'لا نشفط المحاليل بالفم أبداً؛ نستخدم ماصة مزودة بمنفاخ':'نمسح أي انسكاب فوراً','bad') }
  })});
 },
 note:'<ul><li>نشاط ٣-٤ (كتاب الطالب ص٧٤–٧٥ ودليل المعلم): تحديد تركيز محلول HCl بمعايرة قياسية بمحلول NaOH تركيزه 0.1 mol/L. الأدوات: سحاحة 50 mL، ماصة 25 mL، قمع ترشيح صغير، دوارق مخروطية 250 mL، لوحة خزفية بيضاء، حامل، ماء مقطر، ماصة قطارة، HCl مخفف، NaOH، الميثيل البرتقالي.</li><li>الاحتياطات (الدليل): نظارة واقية، معطف، قفازان عند الضرورة، غسل اليدين بعد التجربة، المحلولان مهيّجان للجلد، مسح أي انسكاب.</li><li>ملاحظات الدليل: توضيح استخدام الأدوات قبل استخدامها، التعامل بعناية مع الزجاج، تنظيف الماصة والمعدات، إزالة فقاعات الهواء، أخذ القراءات عند أسفل السطح الهلالي، والإضافة بالتنقيط عند بدء المعايرة.</li></ul>'});

/* 17 the virtual lab: titrate, record, repeat, average */
slide({id:'lab',ch:3,title:'المختبر الافتراضي: معايرة HCl بـ NaOH',tag:'جرّب بنفسك',
 html:function(){return `<div style="display:flex;gap:14px;flex:1;align-items:stretch">
  <div class="col" style="width:380px;flex:none;gap:4px;justify-content:center"><div class="panel" style="padding:4px 6px;align-items:center">${titrSVG({id:'tl',h:380})}</div>
   <div class="panel" style="padding:5px 12px;flex-direction:row;align-items:center;justify-content:space-between"><span style="font-size:19px;font-weight:700">قراءة السحاحة</span><b class="num" id="tlrd" style="font-size:28px;color:var(--gold)">— mL</b></div></div>
  <div class="col" style="flex:1;min-width:0;gap:7px;justify-content:flex-start">
   <div class="panel" id="tact" style="padding:9px 14px;gap:7px;min-height:150px;justify-content:center"></div>
   <div class="panel" style="padding:6px 10px;gap:3px"><table class="mtab" id="ttab" style="border-spacing:0 3px"><thead><tr><th>المعايرة</th><th>الابتدائية</th><th>النهائية</th><th>حجم HCl</th></tr></thead><tbody></tbody></table></div>
   <div class="panel hide" id="tres" style="padding:9px 14px;gap:6px"></div>
   <div class="gbar hide" id="gb" style="font-size:20px"></div></div></div>`;},
 init:function(el){
  var P='tl', VEND=[24.9,24.6,24.5,24.5,24.6], R0=[0.0,0.4,1.1,0.7,0.5], runs=[], idx=0, u=0, init0=0, mode='idle';
  var acid=$('#'+P+'ac',el), mn=$('#'+P+'mn',el), fl=$('#'+P+'fl',el), rd=$('#tlrd',el), act=$('#tact',el), dr=$('#'+P+'dr',el);
  function fmt1(v){return (Math.round(v*100)/100).toFixed(2).replace(/0$/,'')}
  function reading(){return init0+u*0.05}
  function paint(){
   var r=reading(), y=TB_Y0+r*TB_PX;
   acid.setAttribute('y',y.toFixed(1)); acid.setAttribute('height',Math.max(0,(TB_Y0+50*TB_PX-y)).toFixed(1));
   mn.setAttribute('y1',y.toFixed(1)); mn.setAttribute('y2',y.toFixed(1));
   rd.textContent=(mode==='idle'||mode==='fill')?'— mL':fmt1(r)+' mL';
   if(mode==='titr'||mode==='fin'){ fl.setAttribute('fill',indColor(u*0.05-VEND[idx])) }
  }
  function setBox(h){ act.innerHTML=h }
  function table(){ $('#ttab tbody',el).innerHTML=runs.map(function(r,i){return '<tr'+(r.sel?' style="outline:2px solid var(--gold)"':'')+' data-i="'+i+'"><td>'+ar(i+1)+'</td><td><span class="num">'+fmt1(r.i)+'</span></td><td><span class="num">'+fmt1(r.f)+'</span></td><td><span class="num">'+fmt1(r.v)+' mL</span></td></tr>'}).join('') }
  function newRun(){
   mode='idle'; u=0; init0=0; acid.setAttribute('height',0); mn.style.opacity=0; fl.setAttribute('fill','rgba(0,0,0,0)'); paint();
   if(runs.length>=3&&!$('#tres',el).classList.contains('show')){ results(); return }
   setBox('<div style="font-size:21px;font-weight:700">المعايرة '+ar(runs.length+1)+': املأ السحاحة بحمض HCl (تركيزه غير معروف) وسجّل القراءة الابتدائية.</div><button class="btn acc" type="button" id="tb1" style="align-self:flex-start;font-size:22px">املأ السحاحة</button>');
   $('#tb1',el).addEventListener('click',fill);
  }
  function fill(){
   mode='fill'; init0=R0[idx]; u=0; acid.style.opacity=1; mode='fillshow'; paint(); rd.textContent=fmt1(init0)+' mL'; mn.style.opacity=1;
   setBox('<div style="font-size:21px;font-weight:700">اقرأ الحجم عند أسفل السطح الهلالي وسجّله:</div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:22px;font-weight:800">الابتدائية =</span>'+nin('i0','mL')+'<span class="fb" id="tfb" style="flex:1;min-width:140px;min-height:22px;font-size:19px"></span></div>');
   bindNum($('.nin[data-n="i0"]',act),init0,0.06,function(ok){ var fb=$('#tfb',act); if(ok){ say(fb,'✓ '+fmt1(init0)+' mL','ok'); later(pip,600) } else say(fb,'اقرأ الرقم عند مستوى السائل (الخط الأبيض)','bad') });
  }
  function pip(){
   mode='pip'; paint(); fl.setAttribute('fill',indColor(-3));
   setBox('<div style="font-size:21px;font-weight:700">انقل بالماصة <b class="num">25 mL</b> من NaOH (0.1 mol/L) إلى الدورق وأضف الكاشف (ميثيل برتقالي).</div><button class="btn acc" type="button" id="tb2" style="align-self:flex-start;font-size:22px">انقل وأضف الكاشف</button>');
   $('#tb2',el).addEventListener('click',function(){ mode='titr'; paint(); titr() });
  }
  function titr(){
   setBox('<div style="font-size:21px;font-weight:700">أضف الحمض من السحاحة حتى يتغير لون الكاشف (أصفر ← برتقالي). اقترب بالتنقيط!</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="pill tadd" type="button" data-u="20" style="min-height:44px;font-size:21px">+ 1 mL</button><button class="pill tadd" type="button" data-u="2" style="min-height:44px;font-size:21px">+ 0.1 mL</button><button class="pill tadd" type="button" data-u="1" style="min-height:44px;font-size:21px">قطرة</button><button class="btn acc" type="button" id="tstop" style="font-size:21px;margin-inline-start:auto">نقطة النهاية ✋</button></div><div class="fb" id="tfb" style="min-height:24px;font-size:20px"></div>');
   var fb=$('#tfb',act);
   $$('.tadd',act).forEach(function(b){b.addEventListener('click',function(){
    if(mode!=='titr') return; var add=+b.getAttribute('data-u'); if(init0+(u+add)*0.05>50) return; u+=add; paint();
    var d=u*0.05-VEND[idx]; dr.style.opacity=1; later(function(){dr.style.opacity=0},180);
    say(fb,d<-1?'ما زال الكاشف أصفر':(d<-0.15?'بدأ اللون يتغير: خفّف الإضافة':(d<=0.1?'برتقالي: ربما وصلت إلى نقطة النهاية':'تجاوزت: اللون أحمر')),d<=0.1?(d>=-0.1?'ok':''):'bad');
   })});
   $('#tstop',act).addEventListener('click',function(){
    if(mode!=='titr') return; var d=u*0.05-VEND[idx];
    if(d>0.1){ say(fb,'تجاوزت نقطة النهاية (أحمر). أعد المعايرة من جديد.','bad'); mode='over'; later(function(){ newRun() },1500) }
    else if(d<-0.1){ say(fb,'لم تصل بعد: الكاشف لم يصل إلى البرتقالي. أكمل الإضافة.','bad') }
    else{ mode='fin'; final() }
   });
  }
  function final(){
   var f=reading();
   setBox('<div style="font-size:21px;font-weight:700">وصلنا إلى نقطة النهاية. اقرأ الحجم النهائي ثم احسب حجم HCl المستهلك:</div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:22px;font-weight:800">النهائية =</span>'+nin('f0','mL')+'<span style="font-size:22px;font-weight:800">الحجم =</span>'+nin('v0','mL')+'</div><div class="fb" id="tfb" style="min-height:22px;font-size:19px"></div>');
   $('.nin[data-n="v0"]',act).classList.add('lock'); $('.nin[data-n="v0"] input',act).disabled=true;
   var fb=$('#tfb',act);
   bindNum($('.nin[data-n="f0"]',act),f,0.06,function(ok){ if(ok){ say(fb,'✓ '+fmt1(f)+' mL','ok'); var v=$('.nin[data-n="v0"]',act); v.classList.remove('lock'); $('input',v).disabled=false; try{$('input',v).focus()}catch(x){} } else say(fb,'اقرأ الرقم عند مستوى السائل','bad') });
   bindNum($('.nin[data-n="v0"]',act),u*0.05,0.06,function(ok){ if(ok){ runs.push({i:init0,f:f,v:u*0.05}); table(); say(fb,'✓ '+fmt1(u*0.05)+' = '+fmt1(f)+' − '+fmt1(init0),'ok'); idx++; later(newRun,900) } else say(fb,'الحجم = النهائية − الابتدائية','bad') });
  }
  function results(){
   var res=$('#tres',el); res.classList.remove('hide'); res.classList.add('show','up');
   setBox('<div style="font-size:21px;font-weight:700">أحسنت! لديك '+ar(runs.length)+' نتائج. اختر في الجدول نتيجتين متقاربتين (الفرق ≤ 0.1 mL).</div><div class="fb" id="tfb" style="min-height:22px;font-size:19px"></div>');
   var sel=[], fb=$('#tfb',act);
   $('#ttab tbody',el).addEventListener('click',function(e){
    var tr=e.target.closest?e.target.closest('tr'):null; if(!tr||mode==='picked') return;
    var i=+tr.getAttribute('data-i');
    if(sel.indexOf(i)>=0){ sel.splice(sel.indexOf(i),1) } else sel.push(i);
    runs.forEach(function(r,k){r.sel=sel.indexOf(k)>=0}); table();
    if(sel.length===2){
     var a=runs[sel[0]].v, b=runs[sel[1]].v;
     if(Math.abs(a-b)<=0.1001){ mode='picked'; say(fb,'✓ النتيجتان متقاربتان: '+fmt1(a)+' و'+fmt1(b),'ok'); mean(a,b) }
     else{ say(fb,'الفرق أكبر من 0.1 mL: اختر نتيجتين أقرب','bad'); sel=[]; later(function(){runs.forEach(function(r){r.sel=false}); table()},500) }
    }
   });
  }
  function mean(a,b){
   var m=(a+b)/2, c=0.1*25/m;
   var res=$('#tres',el);
   res.innerHTML='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:21px;font-weight:800">المتوسط =</span>'+nin('mv','mL')+'<span style="font-size:21px;font-weight:800">C(HCl) =</span>'+nin('cc','mol/L')+'</div><div class="fb" id="rfb" style="min-height:22px;font-size:19px"></div>';
   $('.nin[data-n="cc"]',res).classList.add('lock'); $('.nin[data-n="cc"] input',res).disabled=true;
   var fb=$('#rfb',res);
   bindNum($('.nin[data-n="mv"]',res),m,0.03,function(ok){ if(ok){ say(fb,'✓ متوسط حجم الحمض = '+fmt1(m)+' mL','ok'); var n=$('.nin[data-n="cc"]',res); n.classList.remove('lock'); $('input',n).disabled=false; try{$('input',n).focus()}catch(x){} } else say(fb,'اجمع النتيجتين واقسم على 2','bad') });
   bindNum($('.nin[data-n="cc"]',res),c,0.0015,function(ok){ if(ok){ say(fb,'✓ C(HCl) = 0.1 × 25 ÷ '+fmt1(m)+' = '+c.toFixed(3)+' mol/L','ok'); var g=$('#gb',el); g.innerHTML='تركيز الحمض <b class="num">'+c.toFixed(3)+' mol/L</b> = تركيز NaOH × حجمه ÷ متوسط حجم الحمض.'; g.classList.remove('hide'); g.classList.add('up'); setBox('<div style="font-size:23px;font-weight:800;color:var(--ok)">✓ اكتملت المعايرة</div><div class="sm" style="font-size:20px">القيمة الأقرب إلى 0.1 mol/L تعني أن تحضير الحمض كان دقيقاً.</div>') } else say(fb,'C(HCl) = C(NaOH) × V(NaOH) ÷ V(HCl): 0.1 × 25 ÷ المتوسط','bad') });
  }
  newRun(); paint();
 },
 note:'<ul><li>محاكاة النشاط ٣-٤: يملأ الطالب السحاحة ويقرأ الحجم الابتدائي، وينقل 25 mL من NaOH (0.1 mol/L) إلى الدورق مع الميثيل البرتقالي، ثم يضيف الحمض إلى أن يصبح اللون برتقالياً (نقطة النهاية). إذا تجاوزها (أحمر) تُعاد المعايرة.</li><li>الأرقام: حجم الحمض عند نقطة النهاية يتراوح بين 24.5 و24.9 mL (تركيز HCl الحقيقي نحو 0.102 mol/L)، ونتائج مولَّدة للعرض وليست قياسات حقيقية.</li><li>بعد ثلاث معايرات يختار الطالب نتيجتين متقاربتين (الفرق ≤ 0.1 mL)، ثم يحسب المتوسط وتركيز الحمض: C(HCl) = 0.1 × 25 ÷ المتوسط (دليل المعلم: التركيز المولي لـ HCl = 0.025 L × تركيز NaOH ÷ متوسط الحجم بالـ L).</li></ul>'});

/* 18 the questions of the activity */
(function(){
  var items=[
   {q:'اكتب المعادلة الموزونة لتفاعل HCl مع NaOH في النشاط:',opts:[{t:'NaOH + HCl → NaCl + H<sub>2</sub>O',ok:true,why:'صح: حمض + قاعدة ← ملح + ماء'},{t:'2NaOH + HCl → Na<sub>2</sub>Cl + H<sub>2</sub>O'},{t:'NaOH + HCl → NaCl + H<sub>2</sub>'}]},
   {q:'التركيز المولي لحمض HCl يساوي:',opts:[{t:'تركيز NaOH × 0.025 L ÷ متوسط حجم HCl (بالـ L)',ok:true,why:'صح: n(NaOH) = n(HCl) (النسبة 1 : 1) ثم C = n ÷ V'},{t:'تركيز NaOH × متوسط حجم HCl ÷ 0.025'},{t:'0.025 ÷ تركيز NaOH'}]},
   {type:'num',q:'كان متوسط حجم HCl <span class="num">24.8 mL</span> لمعايرة <span class="num">25.0 mL</span> من NaOH تركيزه <span class="num">0.100 mol/L</span>. احسب تركيز HCl.',unit:'mol/L',ans:0.1008,tol:0.0015,why:'n(NaOH) = 0.1 × 0.025 = 0.0025 mol = n(HCl) ← 0.0025 ÷ 0.0248 = 0.1008 mol/L',hint:'n(NaOH) ثم النسبة 1 : 1 ثم ÷ الحجم بالـ L'},
   {q:'لماذا نكرر المعايرة حتى نحصل على نتيجتين متقاربتين (فرق ≤ 0.1 mL) ونأخذ متوسطهما؟',opts:[{t:'لتقليل الأخطاء العشوائية وزيادة الثقة في النتيجة',ok:true,why:'صح: تكرار القياس يقلل أثر الأخطاء'},{t:'لأن الكاشف يتغير لونه في كل مرة بدرجة مختلفة'},{t:'لنستهلك كمية أكبر من الحمض'}]}
  ];
  slide({id:'labq',ch:3,title:'أسئلة النشاط ٣-٤',tag:'تذكرة',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'labq')},
   note:'<ul><li>أسئلة النشاط ٣-٤ في كتاب الطالب ودليل المعلم: ١) NaOH + HCl → NaCl + H₂O. ٢) التركيز المولي لـ HCl = 0.025 L × تركيز NaOH ÷ متوسط الحجم (L).</li><li>السؤال ٣ مثال عددي: 0.0025 ÷ 0.0248 = 0.1008 mol/L.</li></ul>'});
})();
