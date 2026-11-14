/* ---------- deck A: follows the NotebookLM deck order (slides 1 to 7), with interaction added ---------- */

/* 1 goals */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يعلّل استخدام الكتلة النسبية للذرة بدلاً من كتلتها الفعلية بالجرام.','يحدد ما إذا كانت المادة عنصراً أو مركباً بالاستناد إلى صيغتها الكيميائية.',
   'يذكر العنصر المستخدم لتحديد الذرة المقياس، ويحدد الذرة التي تستخدم لمقارنة كتل بقية الذرات.','يذكر عناصر المركب وعدد ذرات كل عنصر بناءً على الصيغة الكيميائية.',
   'يعرّف مصطلحي الكتلة الذرية النسبية (Ar) والنظائر.','يصف كيف يتم حساب الكتلة الجزيئية النسبية (Mr) لمادة ما ويقوم بحسابها.',
   'يصف كيف يتم حساب الكتلة الذرية النسبية لعنصر ما.','يحدد عناصر مركب بسيط من نموذج أو تمثيل تخطيطي، ويحسب نسبة الجسيمات المختلفة فيه ويستنتج صيغته.'];
  return '<div style="display:flex;gap:20px;flex:1;align-items:stretch"><div class="frm brk" style="flex:1;padding:22px 28px 20px;justify-content:center;gap:10px">'+
   '<h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;color:var(--gold);line-height:1.1;text-shadow:0 0 26px rgba(228,188,75,.35)">(٣-١) الكتل النسبية</h1>'+
   '<p style="font-size:26px;font-weight:700;line-height:1.4">بنهاية الدرس، يُتوقع منك عزيزي الطالب أن تكون قادراً على:</p>'+
   '<div class="gl" style="margin-top:4px">'+L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')+'</div></div>'+
   '<div style="width:300px;flex:none;display:flex;align-items:center;justify-content:center"><img class="pic fade" src="'+IMG.goals_navy+'" alt="" style="width:340px;max-width:none"></div></div>';},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف من عرضك كما هي. اضغط على هدف لتظليل علامته أثناء مراجعته في نهاية الدرس.</li><li>دليل المعلم ص٥٤ (الموضوع ٣-١): ١-٨ يستنتج صيغة مركب بسيط من نموذج أو تمثيل تخطيطي، ٢-٨ يعرّف Ar، ٣-٨ يعرّف Mr. أهداف عرضك أوسع (١٤ هدفاً) وكلها مغطاة في شرائح الدرس.</li></ul>'});

/* 2 NPK poll: the fertiliser bag opens the lesson, as in the student book (Figure 3-1), then the importance of quantities */
slide({id:'npk',ch:1,title:'سماد على كيس... وأرقام',tag:'تصويت',
 html:function(){return ''+
  '<div class="frm brk" style="width:300px;flex:none;align-self:center;padding:14px">'+bagArt()+'</div>'+
  '<div class="col grow" style="gap:12px">'+
   '<p class="lead" style="font-size:28px"><b>ماذا تعني الأرقام ٥-١٠-٥ المطبوعة على الكيس؟</b></p>'+
   pollHTML(['عدد ذرات كل عنصر داخل الكيس','النسبة المئوية (بالكتلة) للنيتروجين N والفوسفور P والبوتاسيوم K في السماد','رقم الدفعة وتاريخ الإنتاج'])+
   '<div style="display:flex;gap:12px;align-items:center"><button class="btn acc sm" type="button" id="rv">اكشف الإجابة</button><span class="sm muted">اضغط + مقابل كل يد مرفوعة</span></div>'+
   '<div class="panel hide" id="calc" style="display:none"><p class="big" style="font-size:27px">لو كيس السماد <b class="num">20 kg</b>: كم كيلوجراماً من النيتروجين (٥٪) فيه؟</p><div style="display:flex;align-items:center;gap:18px;margin-top:8px">'+ninHTML('n','kg','sm')+'<div class="fb" style="flex:1"></div></div></div>'+
  '</div>';},
 init:function(el){
  var p=bindPoll($('.poll',el),1,function(){var c=$('#calc',el); c.style.display=''; c.classList.remove('hide'); c.classList.add('up')});
  $('#rv',el).addEventListener('click',function(){p.reveal(); this.classList.add('hide')});
  var fb=$('#calc .fb',el);
  bindNum($('#calc .nin',el),1,0.01,function(ok){ if(ok) say(fb,'✓ ٥٪ من ٢٠ kg = ١ kg. النسب تتحول لكميات حقيقية!','ok'); else say(fb,'ركّز: ٥٪ من ٢٠ kg','bad') });
 },
 note:'<ul><li>الإجابة (ب): ٥٪ نيتروجين، ١٠٪ فوسفور، ٥٪ بوتاسيوم (كتاب الطالب، الصورة ٣-١).</li><li>ثم سؤال عرضك: <b>ما أهمية هذه النسب للمزارع؟</b></li></ul>'});

/* 3 importance of quantities (match by dragging) */
slide({id:'imp',ch:1,title:'أهمية تحديد كميات المواد في حياتنا',tag:'مطابقة بالسحب',
 html:function(){
  var C=[['agri','الزراعة','<img class="pic tile" src="'+IMG.agri+'" alt="" style="height:140px">'],['env','البيئة','<img class="pic tile" src="'+IMG.env+'" alt="" style="height:140px">'],['med','الغذاء والدواء','<img class="pic tile" src="'+IMG.med+'" alt="" style="height:140px">']];
  return '<div class="col grow" style="gap:14px;justify-content:flex-start"><div style="display:flex;gap:16px">'+
   C.map(function(c){return '<div class="frm brk icard">'+c[2]+'<h3>'+c[1]+'</h3><div class="mslot slot" data-k="'+c[0]+'"><span class="ph">اسحب السبب إلى هنا</span></div></div>'}).join('')+'</div>'+
   '<div class="imp-tray" id="tray"></div><div class="fb" style="text-align:center;min-height:30px"></div>'+
   '<div class="gbar hide" id="gb">من المهم التعرف على كميات المواد الكيميائية في الصناعات والمواد الغذائية... كيف يتم تحديدها؟</div></div>';
 },
 init:function(el){
  var items=[['med','ضرورية في الغذاء لمنع حدوث التلوث والتسمم، وفي الصناعات الدوائية لتحديد الجرعة الآمنة والآثار الجانبية.'],['agri','يتعرف من خلالها على كميات العناصر الثلاثة في السماد، وتحديد نسبها المناسبة للمزارع.'],['env','مهمة جداً لعلماء الكيمياء البيئية للتحقق من مستويات التلوث البيئي.']];
  var tray=$('#tray',el), fb=$('.fb',el), left=3, sel=null;
  function place(chip,slot){
    if(chip.getAttribute('data-k')===slot.getAttribute('data-k')&&!slot.querySelector('.mchip')){
      var ph=$('.ph',slot); if(ph) ph.remove(); slot.appendChild(chip); chip.classList.add('ok-b','locked'); chip.style.cursor='default'; left--;
      say(fb,left?'صح! كمّل':'ممتاز','ok'); if(!left){ tray.classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } return true;
    }
    slot.classList.add('shake'); later(function(){slot.classList.remove('shake')},340); say(fb,'مو هذا مكانه، فكّر في علاقته بالمجال','bad'); return false;
  }
  items.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'; c.setAttribute('data-k',it[0]); c.textContent=it[1]; tray.appendChild(c);
    drag(c,{zone:'.mslot',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.mslot',el).forEach(function(s){s.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,s); sel.style.outline=''; sel=null } })});
 },
 note:'<ul><li>عرضك (شريحة ٢): الزراعة، البيئة، الغذاء والدواء. الطلاب يطابقون السبب مع المجال قبل ما يظهر لهم السؤال في الشريط الذهبي.</li><li>اسحب أو اضغط على السبب ثم على البطاقة.</li></ul>'});

/* 4 shop + the size of an atom's mass */
slide({id:'shop',ch:1,title:'كيف يتم تحديد كميات الذرات؟',tag:'سؤال وعدّ',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start">'+
  '<div style="display:flex;gap:16px">'+
   '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh" style="font-size:22px">إذا ذهبت إلى مركز تسوق لشراء مجموعة خضار، ما الأداة المستخدمة للقياس؟</div><div style="position:relative;height:244px;cursor:pointer" id="sc"><img class="pic fill" src="'+IMG.shop_navy+'" alt=""><div id="scl" style="position:absolute;inset-inline:0;bottom:8px;margin-inline:auto;width:max-content;padding:1px 24px;border-radius:12px;background:rgba(var(--d2),.82);border:1.5px solid rgba(228,188,75,.55);text-align:center;font:800 26px var(--font-display);color:var(--gold)">اضغط على الصورة</div></div></div>'+
   '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh" style="font-size:22px">هل يمكننا أن نقيس كمية الذرات بنفس الطريقة؟</div><div style="height:244px"><img class="pic fill" src="'+IMG.atomq_navy+'" alt=""></div><div class="yn" style="padding:10px 14px"><button type="button" data-a="y">نعم</button><button type="button" data-a="n">لا</button></div></div>'+
  '</div>'+
  '<div class="frm brk gold hide" id="bt" style="padding:12px 22px 12px;gap:4px"><p style="font-size:23px;line-height:1.45;text-align:center">بما أن كتلة الذرة الواحدة صغيرة جداً، فهذا يجعل تحديد كتلتها صعباً جداً باستخدام الأجهزة التقليدية. على سبيل المثال، كتلة ذرة الهيدروجين:</p>'+
   '<div class="zr" id="zr"><span class="z" style="animation:none">0</span><span class="dt">.</span></div>'+
   '<div style="display:flex;gap:16px;align-items:center;justify-content:center;margin-top:4px"><button class="btn acc sm" type="button" id="cnt">اعدّ الأصفار</button><b class="num" id="zc" style="font:800 28px var(--font-display);color:var(--cyan)"></b><span class="eq hide" id="sci" style="font-size:32px;color:var(--gold)">= 1.67 × 10<sup>−24</sup> g</span></div></div>'+
  '</div>';},
init:function(el){
  $('#sc',el).addEventListener('click',function(){ $('#scl',el).textContent='الميزان' });
  var done=false;
  $$('.yn button',el).forEach(function(b){b.addEventListener('click',function(){
    if(done) return;
    if(b.getAttribute('data-a')==='n'){ done=true; b.classList.add('ok-b'); var t=$('#bt',el); t.classList.remove('hide'); t.classList.add('up'); $$('.yn button',el).forEach(function(x){x.classList.add('locked')}) }
    else { b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake','bad-b')},500) }
  })});
  var zr=$('#zr',el), zc=$('#zc',el), btn=$('#cnt',el), n=0, t=null;
  btn.addEventListener('click',function(){
    if(t) return; btn.disabled=true;
    t=setInterval(function(){
      n++; var z=document.createElement('span'); z.className='z'; z.textContent='0'; zr.appendChild(z); zc.textContent=ar(n)+' صفراً'; zc.style.direction='rtl';
      if(n===23){ clearInterval(t); ['1','6','7'].forEach(function(d,i){var s=document.createElement('span'); s.className='z d'; s.textContent=d; s.style.animationDelay=(i*90)+'ms'; zr.appendChild(s)}); later(function(){var s=$('#sci',el); s.classList.remove('hide'); s.classList.add('pop')},400) }
    },80);
  });
 },
 note:'<ul><li>عرضك (شريحة ٣): سؤال الخضار وسؤال الذرات. الجواب: لا.</li><li>الرقم ٠٫٠٠٠…٠١٦٧ g فيه <b>٢٣</b> صفراً بعد الفاصلة = ١٫٦٧×١٠⁻²⁴ g.</li></ul>'});

/* 5 atom components: tap the part that carries the mass */
slide({id:'parts',ch:2,title:'كيف يتم تحديد هذه الكميات كيميائياً؟',tag:'اضغط على الجواب',
 html:function(){
  var E=[[40.1,11.1],[95.6,24.6],[58.7,27.2],[10.3,54.7],[79.0,73.5],[38.1,73.6],[58.5,97.3]];
  var spots=E.map(function(e){return '<div class="spot" data-p="e" style="left:'+(e[0]-6)+'%;top:'+(e[1]-6)+'%;width:12%;height:12%"></div>'}).join('')+'<div class="spot" data-p="nuc" style="left:41.5%;top:37.5%;width:34%;height:34%"></div>';
  return '<div style="display:flex;gap:10px;flex:1;align-items:center">'+
  '<div class="callout frm hid" id="ce" style="padding:16px 18px;width:250px;font-size:25px;line-height:1.6"><h4 style="color:var(--cyan);font-size:28px">الإلكترونات (e⁻)</h4>كتلة الإلكترون صغيرة جداً وتُهمل.</div>'+
  '<div class="col grow" style="align-items:center;gap:4px"><div class="imgwrap" style="width:480px"><img class="pic fade" src="'+IMG.parts_navy+'" alt="ذرة: نواة ذهبية وإلكترونات حمراء" style="width:480px">'+spots+'</div><div class="fb" style="min-height:40px;text-align:center;font-size:26px">من خلال فهم مكونات الذرة: اضغط على الجزء اللي يحمل معظم كتلة الذرة</div></div>'+
  '<div class="callout frm gold hid" id="cp" style="padding:16px 18px;width:270px;font-size:25px;line-height:1.6"><h4 style="color:var(--gold);font-size:28px">البروتونات (p) والنيوترونات (n)</h4>معظم كتلة الذرة تتركز في النواة، وهي تساوي مجموع كتل البروتونات والنيوترونات.</div></div>';},
 init:function(el){
  var fb=$('.fb',el);
  $$('.spot',el).forEach(function(p){p.addEventListener('click',function(){
    if(p.getAttribute('data-p')==='nuc'){ $('#cp',el).classList.remove('hid'); say(fb,'✓ النواة تحمل معظم الكتلة','ok') }
    else { $('#ce',el).classList.remove('hid'); say(fb,'الإلكترونات كتلتها صغيرة جداً... جرّب النواة','bad') }
  })});
 },
 note:'<ul><li>عرضك (شريحة ٤): البروتونات والنيوترونات تحمل معظم الكتلة، والإلكترونات تُهمل.</li><li>كتاب الطالب ص٥٣: معظم كتلة الذرة في النواة، وكتلة الإلكترونات بالغة الصغر مقارنة بها، ولذلك نقارن كتل الذرات بعضها ببعض.</li></ul>'});

/* 6 carbon-12: build the nucleus */
slide({id:'c12',ch:2,title:'الذرة المقياس: لماذا الكربون-12؟',tag:'ابنِ النواة',
 html:function(){return '<div class="frm brk gold" style="width:370px;flex:none;align-self:stretch;justify-content:center;padding:22px 24px;gap:16px"><p style="font-size:29px;line-height:1.6;font-weight:700;text-align:center">تم اعتماد ذرة الكربون-12 لتكون وحدة قياس الكتل الذرية للذرات الأخرى.</p><p id="why" style="font-size:30px;line-height:1.55;font-weight:800;text-align:center;color:var(--gold)">لماذا؟</p><p class="hide" id="why2" style="font-size:24px;line-height:1.7;text-align:center">بنِ النواة وستعرف.</p></div>'+
  '<div class="col grow" style="gap:12px"><div class="frm brk" style="flex:none;padding:8px 14px"><div style="display:flex;align-items:center;gap:6px;height:310px"><div class="vline" style="color:#f4fbf8"><span>العدد الكتلي A = <b class="num" id="av">0</b></span><i></i></div><div style="flex:1;position:relative;height:310px" id="cwrap"><div id="cs" style="position:absolute;inset:0;transition:opacity 400ms var(--ease-out)">'+c12Svg(1,1)+'</div><img id="c12img" class="pic fade" src="'+IMG.c12_violet+'" alt="" style="position:absolute;inset:0;margin:auto;height:100%;width:auto;max-width:100%;opacity:0;transition:opacity 500ms var(--ease-out)"></div><div class="vline" style="color:var(--gold)"><span>العدد الذري Z = <b class="num" id="zv">0</b></span><i></i></div></div>'+
   '<div style="display:flex;gap:28px;justify-content:center;padding:6px 0 4px"><div class="stp2"><span style="font-weight:700;font-size:22px;color:var(--cyan)">بروتونات (p)</span><button type="button" data-k="p" data-d="-1">−</button><b class="num" id="pv">0</b><button type="button" data-k="p" data-d="1">+</button></div>'+
   '<div class="stp2"><span style="font-weight:700;font-size:22px">نيوترونات (n)</span><button type="button" data-k="n" data-d="-1">−</button><b class="num" id="nv">0</b><button type="button" data-k="n" data-d="1">+</button></div></div></div>'+
   '<div class="gbar hide" id="c12b" style="font-size:23px;padding:10px 20px">تمتلك ذرة الكربون-12: <b>6</b> بروتونات + <b>6</b> نيوترونات، مما يعطيها عدداً كتلياً يساوي <b>12</b> وحدة كتلة ذرية (ذ.ك.ذ).</div></div>';},
 init:function(el){
  var p=1,n=1, done=false;
  function upd(){
    if(!done) $('#cs',el).style.opacity='1';
    $('#pv',el).textContent=p; $('#nv',el).textContent=n; $('#av',el).textContent=p+n; $('#zv',el).textContent=p; $('#cs',el).innerHTML=c12Svg(p,n);
    if(!done&&p===6&&n===6){ done=true; $('#cs',el).style.opacity='0'; $('#c12img',el).style.opacity='1'; var b=$('#c12b',el); b.classList.remove('hide'); b.classList.add('up'); $('#why',el).textContent='لأن عددها الكتلي 12 بالضبط'; $('#why2',el).classList.remove('hide'); $('#why2',el).textContent='٦ بروتونات + ٦ نيوترونات = ١٢' }
  }
  $$('.stp2 button',el).forEach(function(b){b.addEventListener('click',function(){
    var k=b.getAttribute('data-k'), d=+b.getAttribute('data-d'); if(k==='p') p=Math.max(0,Math.min(10,p+d)); else n=Math.max(0,Math.min(10,n+d)); upd();
  })});
  upd();
 },
 note:'<ul><li>عرضك (شريحة ٥): ٦ بروتونات + ٦ نيوترونات = عدد كتلي ١٢. هنا الطالب يبني النواة بنفسه.</li><li>ملاحظة: شريحتك تقول «لأنها الأكثر استقراراً». هذي الجملة ليست في كتاب الطالب، فاستبدلتها بسبب الكتاب (العدد الكتلي ١٢). قل لي إذا تبي ترجعها.</li></ul>'});

/* 6b the reasons for choosing carbon-12: the teacher's slide (statement, question mark, his answer), point by point */
slide({id:'why12',ch:2,title:'أسباب اختيار ذرة الكربون',tag:'نقطة نقطة',
 html:function(){return '<div class="col grow" style="gap:16px;justify-content:flex-start">'+
  '<div class="frm brk" data-pt="1" style="padding:20px 30px"><p style="font-size:30px;line-height:1.8;text-align:center;margin:0"><b>اقترح العلماء كتلة ذرّة الكربون ككتلة ذرّيّة ثابتة، تُقاس بها كتل الذّرّات الأخرى نسبةً له</b></p></div>'+
  '<div class="gbar" data-pt="2" style="display:flex;align-items:center;justify-content:center;gap:18px;font-size:32px"><span style="font-size:64px;line-height:1;color:#ff6b5e;font-weight:800">؟</span><b>لماذا اختار العلماء ذرة الكربون؟</b></div>'+
  '<div style="display:flex;gap:16px;align-items:stretch">'+
   '<div class="frm brk gold" data-pt="3" style="flex:1;padding:22px 26px;justify-content:center;align-items:center"><p style="font-size:34px;line-height:1.6;text-align:center;margin:0"><b>لأنه مستقر</b></p></div>'+
   '<div class="frm brk gold" data-pt="4" style="flex:1.6;padding:22px 26px;justify-content:center;align-items:center"><p style="font-size:32px;line-height:1.6;text-align:center;margin:0"><b>ويحمل أعداداً صحيحة متساوية من البروتونات والنيوترونات</b><br><span style="font-size:26px" class="mf">6 p = 6 n</span></p></div></div></div>';},
 note:'<ul><li>من عرضك (صورتك): «اقترح العلماء كتلة ذرّة الكربون ككتلة ذرّيّة ثابتة، تُقاس بها كتل الذّرّات الأخرى نسبةً له» ثم «؟» ثم الجواب: «لأنه مستقر ويحمل أعداداً صحيحة متساوية من البروتونات والنيوترونات».</li><li>الكتاب (ص٥٤) لا يعلّل اختيار الكربون؛ يكتفي بأن كتلة ذرة الكربون-١٢ تساوي ١٢ تماماً. السبب هنا من عرضك كما هو.</li><li><b>من عندي:</b> تقسيم الجواب إلى بطاقتين، وإضافة «6 p = 6 n» (من بناء النواة في الشريحة السابقة)، وسؤال «لماذا اختار العلماء ذرة الكربون؟». النقاط: ١ العبارة ← ٢ السؤال ← ٣ مستقر ← ٤ أعداد صحيحة متساوية.</li></ul>'});

/* 7 relative atomic mass: the atom balance */
(function(){
  var M={C:12,H:1,He:4,Mg:24}, R={C:30,H:15,He:22,Mg:33};
  var ROUNDS=[
   {q:'كم ذرة <b>هيدروجين H</b> توازن ذرة <b>كربون-١٢</b>؟',fixedL:['C'],fixedR:[],add:'H',side:'R',res:'١٢ ذرة H = ذرة C-12 ⇒ كتلة H = <b class="num">1</b> ذ.ك.ذ',fig:'الشكل ٣-١ (أ)'},
   {q:'كم ذرة <b>هيليوم He</b> توازن ذرة <b>كربون-١٢</b>؟',fixedL:['C'],fixedR:[],add:'He',side:'R',res:'٣ ذرات He = ذرة C-12 ⇒ كتلة He = ١٢ ÷ ٣ = <b class="num">4</b> ذ.ك.ذ',fig:'الشكل ٣-١ (ب)'},
   {q:'كم ذرة <b>كربون-١٢</b> توازن ذرة <b>ماغنيسيوم Mg</b>؟',fixedL:[],fixedR:['Mg'],add:'C',side:'L',res:'ذرتا C-12 = ذرة Mg ⇒ كتلة Mg = ٢ × ١٢ = <b class="num">24</b> ذ.ك.ذ',fig:'الشكل ٣-١ (ج)'}
  ];
  function sum(a){return a.reduce(function(s,x){return s+M[x]},0)}
  function panAtoms(list,cx,cy){
    var rows=[], cur=[], w=0, cap=200;
    list.forEach(function(sym){var d=R[sym]*2+3; if(w+d>cap&&cur.length){rows.push(cur); cur=[]; w=0} cur.push(sym); w+=d});
    if(cur.length) rows.push(cur);
    var s='', y=cy;
    rows.forEach(function(r){
      var rw=r.reduce(function(a,x){return a+R[x]*2+3},0), x=cx-rw/2, rr=Math.max.apply(null,r.map(function(q){return R[q]}));
      y-=rr; r.forEach(function(sym){x+=R[sym]; s+=sph(x,y,R[sym],sym,{fs:R[sym]*.95}); x+=R[sym]+3}); y-=rr+2;
    });
    return s;
  }
  slide({id:'balance',ch:2,title:'الكتلة الذرية النسبية (Ar)',tag:'سحب وإفلات',
   html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div class="frm brk gold" style="padding:12px 24px"><p style="font-size:23px;line-height:1.55;text-align:center"><b>الكتلة الذرية النسبية (A<sub>r</sub>):</b> متوسط كتل ذرات العنصر التي توجد في الطبيعة وفقاً لمقياس تكون فيه كتلة ذرة الكربون-12 مساوية لـ 12 وحدة كتلة ذرية (ذ.ك.ذ).</p></div>'+
    '<div style="display:flex;gap:16px;flex:1;min-height:0">'+
    '<div class="frm brk" style="width:340px;flex:none;padding:10px 14px;gap:6px"><div class="rounds" id="rds">'+ROUNDS.map(function(r,i){return '<span class="rd" data-i="'+i+'">'+ar(i+1)+'</span>'}).join('')+'</div>'+
     '<p id="rq" style="font-size:22px;line-height:1.4"></p><div class="tray" id="tr"></div><div class="fb" id="bfb" style="font-size:18px;line-height:1.35"></div><button class="btn acc sm hide" type="button" id="nx">الجولة التالية</button></div>'+
    '<div class="bal" id="bal" style="flex:1"><svg viewBox="0 0 900 460" id="bsvg"></svg><div class="zone" id="zL" style="left:6%;top:38%;width:28%;height:46%"></div><div class="zone" id="zR" style="left:66%;top:38%;width:28%;height:46%"></div></div></div></div>';},
   init:function(el){
    var round=0, L=[], Rr=[], ang=0, tgt=0, vel=0, raf=0, locked=false, svg=$('#bsvg',el);
    var tr=$('#tr',el), fb=$('#bfb',el), nx=$('#nx',el);
    function target(){var d=sum(Rr)-sum(L); return Math.max(-13,Math.min(13,d*1.15))}
    function draw(){
      var th=ang*Math.PI/180, Lh=290, px=450, py=104;
      var lx=px-Lh*Math.cos(th), ly=py-Lh*Math.sin(th), rx=px+Lh*Math.cos(th), ry=py+Lh*Math.sin(th), drop=156;
      var s='<defs><linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#9FB6CE"/></linearGradient>'+
        '<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7B861"/><stop offset="1" stop-color="#A9742A"/></linearGradient>'+
        '<linearGradient id="gPan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FBFF"/><stop offset="1" stop-color="#7F9DBA"/></linearGradient></defs>';
      s+='<rect x="226" y="418" width="448" height="26" rx="5" fill="url(#gWood)"/><rect x="252" y="442" width="46" height="8" fill="#8E5E1F"/><rect x="602" y="442" width="46" height="8" fill="#8E5E1F"/>';
      s+='<path d="M258 418c0-24 14-36 40-36h304c26 0 40 12 40 36z" fill="url(#gWhite)" stroke="#d8f5ea" stroke-width="2"/><rect x="292" y="402" width="316" height="8" rx="4" fill="var(--cyan)" opacity=".9"/>';
      s+='<rect x="430" y="108" width="40" height="278" rx="10" fill="url(#gWhite)" stroke="#d8f5ea" stroke-width="2"/><rect x="446" y="134" width="8" height="216" rx="4" fill="var(--cyan)" opacity=".55"/>';
      s+='<path d="M450 62 l-13 -22 h26 z" fill="#E4BC4B"/>';
      [[lx,ly,L],[rx,ry,Rr]].forEach(function(p,i){
        var x=p[0], y=p[1]+drop;
        s+='<path d="M'+x+' '+p[1]+' L'+(x-112)+' '+y+' M'+x+' '+p[1]+' L'+(x+112)+' '+y+'" stroke="#DCEBFA" stroke-opacity=".8" stroke-width="2.2" fill="none"/>';
        s+='<ellipse cx="'+x+'" cy="'+(y+8)+'" rx="126" ry="15" fill="url(#gPan)" stroke="#fff" stroke-width="2"/><ellipse cx="'+x+'" cy="'+y+'" rx="126" ry="15" fill="rgba(var(--t1),.28)" stroke="#d8f5ea" stroke-width="2"/>';
        s+='<g data-side="'+(i?'R':'L')+'">'+panAtoms(p[2],x,y)+'</g>';
      });
      s+='<g transform="rotate('+ang+' '+px+' '+py+')"><rect x="'+(px-Lh)+'" y="'+(py-10)+'" width="'+(2*Lh)+'" height="20" rx="10" fill="url(#gWhite)" stroke="#d8f5ea" stroke-width="2"/><rect x="'+(px-Lh+16)+'" y="'+(py-2.5)+'" width="'+(2*Lh-32)+'" height="5" rx="2.5" fill="var(--cyan)" opacity=".75"/></g>';
      s+='<circle cx="450" cy="104" r="19" fill="#E4BC4B" stroke="#F8E39B" stroke-width="4"/><circle cx="450" cy="104" r="7" fill="#7A5A10"/>';
      svg.innerHTML=s;
    }
    function anim(){
      cancelAnimationFrame(raf);
      (function step(){ vel+=(tgt-ang)*0.11; vel*=0.80; ang+=vel; draw(); if(Math.abs(vel)>0.01||Math.abs(tgt-ang)>0.02) raf=requestAnimationFrame(step); else {ang=tgt; draw()} })();
    }
    function setRound(i){
      round=i; var r=ROUNDS[i]; locked=false; L=r.fixedL.slice(); Rr=r.fixedR.slice(); say(fb,''); nx.classList.add('hide');
      $('#rq',el).innerHTML=r.q;
      $$('.rd',el).forEach(function(d,j){d.className='rd'+(j<i?' done':(j===i?' cur':''))});
      tr.innerHTML=''; var a=document.createElement('div'); a.className='chip atom '+r.add; a.textContent=r.add; a.setAttribute('aria-label','ذرة '+r.add);
      if(r.add==='C'){a.style.width=a.style.height='62px'} tr.appendChild(a);
      var hint=document.createElement('span'); hint.className='sm muted'; hint.textContent='← اسحبها'; tr.appendChild(hint);
      drag(a,{zone:'.zone',drop:function(it,z){return put(z.id==='zR'?'R':'L')},tap:function(){put(r.side)}});
      $('#zL',el).className='zone'+(r.side==='L'?' show':''); $('#zR',el).className='zone'+(r.side==='R'?' show':'');
      tgt=target(); anim();
    }
    function put(side){
      var r=ROUNDS[round]; if(locked) return false;
      if(side!==r.side){say(fb,'هذي الكفة للذرة الثابتة','bad'); return false}
      var arr=side==='R'?Rr:L; if(arr.length>=22){say(fb,'الكفة امتلأت!','bad'); return false}
      arr.push(r.add); tgt=target(); anim(); check(); return true;
    }
    function check(){
      var r=ROUNDS[round];
      if(sum(L)===sum(Rr)){
        locked=true; tgt=0; anim();
        later(function(){
          say(fb,'⚖ توازنت!','ok'); var d=document.createElement('div'); d.className='panel pop'; d.style.cssText='margin-top:6px;padding:10px 14px;font-size:21px;line-height:1.5'; d.innerHTML=r.res+'<div class="sm muted" style="margin-top:4px;font-size:17px">'+r.fig+' في الكتاب</div>'; fb.appendChild(d);
          if(round<ROUNDS.length-1) nx.classList.remove('hide'); else { $$('.rd',el).forEach(function(x){x.className='rd done'}); var s=document.createElement('div'); s.className='panel dark pop'; s.style.cssText='margin-top:4px;padding:8px 12px;font-size:18px;line-height:1.4'; s.innerHTML='H = 1 · He = 4 · Mg = 24 ... هذي الكتل الذرية النسبية <b>Ar</b>'; fb.appendChild(s)}
        },520);
      }else{ var dd=sum(Rr)-sum(L); say(fb, dd>0?'الكفة اليمنى أثقل':'الكفة اليسرى أثقل','') }
    }
    svg.addEventListener('click',function(e){
      if(locked) return; var g=e.target.closest('.sph'); if(!g) return;
      var side=g.parentNode.getAttribute('data-side'), r=ROUNDS[round];
      if(side!==r.side) return; var arr=side==='R'?Rr:L; var fixed=side==='R'?r.fixedR.length:r.fixedL.length;
      if(arr.length>fixed){arr.pop(); tgt=target(); anim(); say(fb,'')}
    });
    nx.addEventListener('click',function(){setRound(round+1)});
    setRound(0);
   },
   note:'<ul><li><b>قلب الدرس.</b> اطلب توقّعاً قبل السحب: «كم ذرة H تحتاج؟»</li><li>الجولة ١: ١٢ H = C-12 · الجولة ٢: ٣ He = C-12 · الجولة ٣: ٢ C-12 = Mg (الشكل ٣-١). شريحتك (٦) تعرض الجولة الثالثة فقط.</li></ul>'});
})();

/* 8 the maths: C-12 vs H, and fluorine */
slide({id:'calc',ch:2,title:'المقارنة الرياضية ووحدة الكتل الذرية',tag:'أنت تحسب',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start">'+
  '<div class="frm brk"><div class="fh">المقارنة بين كتلة ذرة كربون-12 وذرة الهيدروجين</div><div class="flow"><div class="cbox mf" style="font-size:26px;direction:ltr">1.99 × 10<sup>−23</sup> g &nbsp;:&nbsp; 1.67 × 10<sup>−24</sup> g</div><div class="arw">⟶</div><div class="gbox mf" style="font-size:28px;direction:ltr">12 amu &nbsp;:&nbsp; 1 amu</div></div><div class="sm muted" style="text-align:center;padding:0 0 8px;font-size:19px">(بقسمة الطرفين على 1.67 × 10<sup>−24</sup>)</div></div>'+
  '<div class="frm brk"><div class="fh">إيجاد وحدة الكتل الذرية للفلور</div><div class="flow" id="fl">'+
   '<div class="cbox" style="font-size:20px">الكتلة الفعلية لذرة الفلور =<br><span class="mf" style="font-size:25px;color:var(--cyan)">3.16 × 10<sup>−23</sup> g</span></div>'+
   '<div class="arw s1 hide">⟶</div><div class="cbox s1 hide" style="font-size:20px">بما أن: <span class="mf">1 amu</span> =<br><span class="mf" style="font-size:25px;color:var(--cyan)">1.67 × 10<sup>−24</sup> g</span></div>'+
   '<div class="arw s2 hide">⟶</div><div class="cbox s2 hide" style="font-size:19px">(الكتلة النسبية للفلور) X<br><span class="mf" style="font-size:24px"><span class="frac"><span>3.16 × 10<sup>−23</sup></span><span>1.67 × 10<sup>−24</sup></span></span></span></div>'+
   '<div class="arw s3 hide">⟶</div><div class="gbox s3 hide" style="display:flex;align-items:center;justify-content:center;gap:8px;direction:ltr"><span>=</span>'+ninHTML('f','amu','sm')+'</div></div></div>'+
  '<div style="display:flex;gap:16px;align-items:center"><button class="btn acc sm" type="button" id="stn">التالي ▸</button><div class="fb" style="flex:1;font-size:21px;line-height:1.5"></div></div></div>';},
 init:function(el){
  var i=0, btn=$('#stn',el), fb=$('.fb',el);
  btn.addEventListener('click',function(){
    i++; $$('.s'+i,el).forEach(function(x){x.classList.remove('hide'); x.classList.add('pop')});
    if(i===3){ btn.classList.add('hide'); say(fb,'احسب الناتج وأدخله في المربع الذهبي (قرّب لأقرب عدد صحيح)','') }
  });
  bindNum($('.nin[data-n="f"]',el),19,0.6,function(ok){ if(ok) say(fb,'✓ 18.9 ≈ 19. طريقة ثانية (كما في الامتحان): 3.16÷1.99 = 1.587، ثم 1.587 × 12 ≈ 19','ok'); else say(fb,'اقسم 3.16 على 1.67 ثم اضرب في 10','bad') });
 },
 note:'<ul><li>عرضك (شريحة ٧). قيمة كتلة الفلور في عرضك ٣٫١٧×١٠⁻²³، وفي كتاب الطالب <b>٣٫١٦×١٠⁻²³</b> (استخدمت قيمة الكتاب). النتيجة ١٩ في الحالتين.</li><li>في الامتحانات تأتي الطريقة الثانية: كتلة الذرة ÷ كتلة C-12 (١٫٩٩×١٠⁻²³) ثم × ١٢.</li></ul>'});

/* 8b the teacher's second method for the fluorine mass: proportion (1 amu -> 1.67e-24 g, X -> 3.16e-23 g), shown point by point */
slide({id:'calc2',ch:2,title:'طريقة أخرى: التناسب (الفلور)',tag:'نقطة نقطة',
 html:function(){return '<div class="col grow" style="gap:16px;justify-content:flex-start">'+
  '<div class="frm brk" style="padding:12px 24px"><p style="font-size:28px;line-height:1.6;text-align:center;margin:0">الكتلة الفعلية لذرة الفلور = <span class="mf" style="color:var(--cyan);direction:ltr;display:inline-block">3.16 × 10<sup>−23</sup> g</span> &nbsp;— كم تساوي بوحدة الكتل الذرية (amu)؟</p></div>'+
  '<div style="display:flex;gap:16px;align-items:stretch">'+
   '<div class="cbox" data-pt="1" style="flex:none;width:290px;display:flex;flex-direction:column;justify-content:center;gap:12px;font-size:26px"><b style="color:var(--gold);font-size:30px">للعلم:</b><span class="mf" style="direction:ltr;font-size:26px;white-space:nowrap">1 amu = 1.67 × 10<sup>−24</sup> g</span></div>'+
   '<div class="frm brk" data-pt="2" style="flex:1.7;padding:20px 22px;justify-content:center;gap:14px"><div style="display:flex;align-items:center;gap:14px;direction:ltr;font-size:32px;white-space:nowrap" class="mf"><span style="color:var(--gold);width:112px">1 amu</span><span class="arw" style="font-size:44px">⟶</span><span>1.67 × 10<sup>−24</sup> g</span></div>'+
    '<div style="display:flex;align-items:center;gap:14px;direction:ltr;font-size:32px;white-space:nowrap" class="mf"><span style="color:var(--gold);width:112px">X</span><span class="arw" style="font-size:44px">⟶</span><span>3.16 × 10<sup>−23</sup> g</span></div></div>'+
   '<div class="frm brk" data-pt="3" style="flex:1.2;padding:20px 18px;justify-content:center;align-items:center"><div class="mf" style="font-size:30px;display:flex;align-items:center;justify-content:center;gap:6px;direction:ltr;white-space:nowrap">X =<span class="frac"><span>3.16 × 10<sup>−23</sup> g</span><span>1.67 × 10<sup>−24</sup> g</span></span></div></div></div>'+
  '<div class="gbox" data-pt="4" style="align-self:center;min-width:400px;font-size:48px;direction:ltr">X = 19 amu</div></div>';},
 note:'<ul><li><b>طريقة إضافية بطلب المعلم</b> (صورة من عرضك: «طريقة أخرى»): كل 1 amu يقابل 1.67×10⁻²⁴ g، فنسبة الكتلة الفعلية للفلور إلى هذه القيمة تعطي X = 19.</li><li>الحساب: ٣٫١٦×١٠⁻²³ ÷ ١٫٦٧×١٠⁻²⁴ = ١٨٫٩ ≈ ١٩. والقيمة ٣٫١٦×١٠⁻²³ من كتاب الطالب.</li><li>النقاط: ١ «للعلم» ← ٢ التناسب ← ٣ المعادلة ← ٤ الناتج. <b>من عندي:</b> ترتيب الظهور وتقريب الناتج إلى ١٩.</li></ul>'});
