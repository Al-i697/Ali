/* ---------- reacting masses, part D: the virtual lab (activity 3-2, enrichment), its calculations and the class race ---------- */

/* 25 virtual lab: sodium carbonate with acid in a flask on a balance, the loss of mass is carbon dioxide */
slide({id:'lab',ch:5,title:'نشاط ٣-٢ (إثرائي): الكتلة المفقودة في التفاعل',tag:'اتبع الخطوات',
 html:function(){
  var steps=['السلامة','ضع 1.65 g من Na₂CO₃','علّق أنبوبة الحمض','زن المجموعة كلها','اقلب الأنبوبة','زن بعد توقف الفوران'];
  var bub=''; for(var i=0;i<9;i++) bub+='<circle class="lbub b'+(i%3)+'" cx="'+(205+i*12)+'" cy="298" r="'+(4+i%3*2)+'" style="animation-delay:'+(i*.22).toFixed(2)+'s"/>';
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="width:540px;flex:none;align-items:center;justify-content:center">
   <svg id="lsvg" viewBox="60 84 400 306" width="540" height="413" style="max-width:100%" aria-hidden="true">
    <rect x="70" y="332" width="380" height="46" rx="11" fill="rgba(var(--t2),.18)" stroke="rgba(var(--t2),.75)" stroke-width="3"/>
    <rect x="130" y="314" width="260" height="20" rx="7" fill="rgba(var(--t2),.3)" stroke="rgba(var(--t2),.75)" stroke-width="2.5"/>
    <rect x="300" y="340" width="130" height="30" rx="6" fill="#0b2a2f" stroke="rgba(var(--t2),.7)" stroke-width="2"/><text id="lrd" x="365" y="362" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="21" fill="#7EE0A8" direction="ltr">0.00 g</text>
    <g id="lfl"><path d="M236 150H284V216L352 312Q356 314 350 314H170Q164 314 168 312L236 216Z" fill="rgba(var(--t1),.10)" stroke="var(--cyan)" stroke-width="3.5" stroke-linejoin="round"/><path d="M230 150H290" stroke="var(--cyan)" stroke-width="5" stroke-linecap="round"/>
     <path id="lpw" class="hide" d="M196 300Q260 286 324 300L338 313H182Z" fill="#f4f1e8"/>
     <g id="ltb" class="hide" style="transform-origin:260px 192px"><line x1="260" y1="150" x2="260" y2="192" stroke="#d9b36a" stroke-width="2.5"/><rect x="248" y="192" width="24" height="68" rx="9" fill="rgba(255,255,255,.14)" stroke="var(--cyan)" stroke-width="3"/><rect id="lac" x="251" y="208" width="18" height="49" rx="7" fill="#ff7a6b"/></g>
     <g id="lbb" style="opacity:0">${bub}</g></g>
    <g id="lgas" style="opacity:0"><path d="M262 140Q276 118 262 98M290 138Q306 114 290 90" stroke="rgba(var(--t2),.8)" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="3 7"/></g>
   </svg></div>
  <div class="col" style="flex:1;min-width:0;gap:10px;justify-content:center">
   <div class="panel" style="padding:10px 14px;gap:6px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${steps.map(function(s,i){return `<div class="lstep" data-i="${i}"><span class="sn">${ar(i+1)}</span><span>${s}</span></div>`}).join('')}</div></div>
   <div class="panel" id="lact" style="padding:12px 18px;gap:8px;min-height:190px;justify-content:center"></div>
   <div class="gbar hide" id="gb" style="font-size:22px">فقدت المجموعة <b class="num">0.65 g</b>: هذه كتلة CO<sub>2</sub> التي خرجت. نحسب المولات في الشريحة التالية.</div></div></div>`;},
 init:function(el){
  var act=$('#lact',el), rd=$('#lrd',el), cur=0;
  function mark(){ $$('.lstep',el).forEach(function(s,i){ s.classList.toggle('done',i<cur); s.classList.toggle('cur',i===cur) }) }
  function setRead(v){ rd.textContent=(v==null?'0.00':v.toFixed(2))+' g' }
  function btn(t){ return '<button class="btn acc" type="button" id="bAct" style="align-self:flex-start;font-size:23px">'+t+'</button>' }
  function go(n){ cur=n; mark(); if(n===0) s0(); else if(n===1) s1(); else if(n===2) s2(); else if(n===3) s3(); else if(n===4) s4(); else if(n===5) s5(); else s6() }
  function s0(){
    var items=[['نظارة واقية',1],['معطف المختبر',1],['قفازان واقيان',1],['سدّ الدورق بالسدادة',0],['شرب الماء في المختبر',0]], left=3;
    act.innerHTML='<div style="font-size:22px;font-weight:800">اختر احتياطات السلامة الصحيحة (٣):</div><div style="display:flex;flex-wrap:wrap;gap:8px" id="sf">'+items.map(function(it,i){return '<button type="button" class="opt sfc" data-ok="'+it[1]+'" style="font-size:21px;min-height:46px">'+it[0]+'</button>'}).join('')+'</div><div class="fb" style="min-height:24px"></div>';
    var fb=$('.fb',act);
    $$('.sfc',act).forEach(function(b){b.addEventListener('click',function(){
      if(b.classList.contains('ok-b')) return;
      if(b.getAttribute('data-ok')==='1'){ b.classList.add('ok-b'); left--; say(fb,left?'صح! بقي '+ar(left):'ممتاز! جاهزون','ok'); if(!left) later(function(){go(1)},700) }
      else{ b.classList.add('bad-b','shake'); later(function(){b.classList.remove('shake')},340); say(fb,b.textContent.indexOf('سدّ')>=0?'لا نغلق الدورق بالسدادة أثناء التفاعل':'ليس من احتياطات هذه التجربة','bad') }
    })});
  }
  function s1(){ act.innerHTML='<div style="font-size:22px;font-weight:700">الميزان مُصفَّر على الدورق الفارغ.</div>'+btn('أضف 1.65 g من كربونات الصوديوم'); $('#bAct',act).addEventListener('click',function(){ $('#lpw',el).classList.remove('hide'); setRead(1.65); go(2) }) }
  function s2(){ act.innerHTML='<div style="font-size:22px;font-weight:700">ضع أنبوبة صغيرة فيها حمض الهيدروكلوريك (1 mol/L) بالخيط داخل الدورق، بدون سدادة.</div>'+btn('علّق الأنبوبة'); $('#bAct',act).addEventListener('click',function(){ $('#ltb',el).classList.remove('hide'); go(3) }) }
  function s3(){
    act.innerHTML='<div style="font-size:22px;font-weight:700">زن الدورق بما فيه الآن.</div><div id="w1row" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'+btn('اقرأ الميزان')+'</div>';
    $('#bAct',act).addEventListener('click',function(){
      setRead(126.40); $('#w1row',act).innerHTML='<span style="font-size:24px;font-weight:700">m₁ =</span>'+nin('m1','g')+'<div class="fb" style="flex:1;min-width:180px;min-height:24px"></div>';
      bindNum($('.nin[data-n="m1"]',act),126.4,0.01,function(ok){ var fb=$('.fb',act); if(ok){ say(fb,'✓ سجّلنا m₁ = 126.40 g','ok'); later(function(){go(4)},700) } else say(fb,'اكتب القراءة الظاهرة على الميزان','bad') });
    });
  }
  function s4(){
    act.innerHTML='<div style="font-size:22px;font-weight:700">اقلب الأنبوبة ليختلط الحمض بالكربونات، وراقب الميزان.</div>'+btn('اقلب الأنبوبة');
    $('#bAct',act).addEventListener('click',function(){
      this.disabled=true; $('#ltb',el).classList.add('tip'); $('#lbb',el).style.opacity=1; $('#lgas',el).style.opacity=1; $('#lsvg',el).classList.add('fizz');
      var t0=performance.now(), D=3600;
      (function tick(now){ var k=Math.min(1,(now-t0)/D), e=1-Math.pow(1-k,2); setRead(126.40-0.65*e); if(k<1) requestAnimationFrame(tick); else{ $('#lbb',el).style.opacity=0; $('#lgas',el).style.opacity=0; $('#lsvg',el).classList.remove('fizz'); go(5) } })(t0);
    });
  }
  function s5(){
    act.innerHTML='<div style="font-size:22px;font-weight:700">توقف الفوران. اقرأ الميزان مرة ثانية.</div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font-size:24px;font-weight:700">m₂ =</span>'+nin('m2','g')+'<div class="fb" style="flex:1;min-width:180px;min-height:24px"></div></div>';
    bindNum($('.nin[data-n="m2"]',act),125.75,0.01,function(ok){ var fb=$('.fb',act); if(ok){ say(fb,'✓ m₂ = 125.75 g','ok'); later(function(){go(6)},600) } else say(fb,'اقرأ الرقم على شاشة الميزان','bad') });
  }
  function s6(){ cur=6; mark(); act.innerHTML='<div style="font-size:24px;font-weight:800;color:var(--ok)">✓ اكتملت التجربة</div><div class="sm" style="font-size:21px">m₁ − m₂ = 126.40 − 125.75 = 0.65 g</div>'; var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') }
  go(0);
 },
 note:'<ul><li>نشاط ٣-٢ (إثرائي في دليل المعلم): Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂. كل mol من الكربونات يطلق mol من CO₂، ونقيس ذلك بنقص الكتلة. الكميات: ١٫٦٥ g كربونات، ٠٫٦٥ g CO₂.</li><li>الأرقام على الميزان (١٢٦٫٤٠ ثم ١٢٥٫٧٥ g) تقريبية للعرض وتعطي الفرق ٠٫٦٥ g.</li><li>الاحتياطات من الدليل: نظارة ومعطف وقفازان، ولا نغلق الدورق بالسدادة، ونغسل اليدين بعد التجربة.</li></ul>'});

/* 26 calculations of the lab */
slide({id:'labcalc',ch:5,title:'حسابات النشاط: نسبة المولات',tag:'احسب ثم استنتج',
 html:function(){return `<div style="display:flex;gap:20px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;min-width:0;gap:8px;justify-content:center">
   <div class="frm brk" style="padding:10px 18px;gap:4px;align-items:center"><div class="bigeq" style="font-size:28px;color:var(--gold)">Na<sub>2</sub>CO<sub>3</sub> + 2HCl → 2NaCl + H<sub>2</sub>O + CO<sub>2</sub></div><div class="sm" style="font-size:20px">كتلة Na₂CO₃ = 1.65 g ، m₁ = 126.40 g ، m₂ = 125.75 g (C = 12, O = 16, Na = 23)</div></div>
   ${qline('الكتلة المفقودة = كتلة CO<sub>2</sub>',[['l1','g','m₁ − m₂ =']])}
   ${qline('n(Na<sub>2</sub>CO<sub>3</sub>) = 1.65 ÷ 106',[['l2','mol','n =']])}
   ${qline('n(CO<sub>2</sub>) = كتلة CO<sub>2</sub> ÷ 44',[['l3','mol','n =']])}
   <div class="fb" style="text-align:center;min-height:24px"></div></div>
  <div class="col" style="width:460px;flex:none;gap:8px;justify-content:flex-start">
   <div class="panel hide" id="q1" style="padding:12px 18px;gap:6px"><div style="font-size:23px;font-weight:800">النسبة بين n(Na₂CO₃) وn(CO₂) تقريباً:</div>${optsHTML([{t:'1 : 1'},{t:'1 : 2'},{t:'2 : 1'}]).replace('class="opts"','class="opts" style="flex-direction:row;gap:10px"')}<div class="fb fq1" style="min-height:24px"></div></div>
   <div class="panel hide" id="q2" style="padding:12px 18px;gap:6px"><div style="font-size:22px;font-weight:800">لماذا خرجت n(CO₂) أقل قليلاً من n(Na₂CO₃)؟</div>${optsHTML([{t:'ذوبان جزء من CO₂ وأخطاء القياس'},{t:'زيادة كتلة المجموعة بالحمض'},{t:'عطل في الميزان'}])}<div class="fb fq2" style="min-height:24px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:21px">كل <b>1 mol</b> من الكربونات يعطي <b>1 mol</b> من CO<sub>2</sub>: نسبة التكافؤ في المعادلة</div></div></div>`;},
 init:function(el){
  bindSeq(el,[{n:'l1',a:0.65,t:0.01,w:'✓ 126.40 − 125.75 = 0.65 g',h:'m₁ − m₂'},{n:'l2',a:1.65/106,t:0.0003,w:'✓ 1.65 ÷ 106 = 0.0156 mol',h:'M(Na₂CO₃) = 106'},{n:'l3',a:0.65/44,t:0.0003,w:'✓ 0.65 ÷ 44 = 0.0148 mol',h:'M(CO₂) = 44'}],$('.fb',el),function(){ var q=$('#q1',el); q.classList.remove('hide'); q.classList.add('up') });
  bindMcq($('#q1',el),[{t:'',ok:true,why:'صح: 0.0156 : 0.0148 ≈ 1 : 1'},{t:'',why:'القيمتان متقاربتان جداً'},{t:'',why:'القيمتان متقاربتان جداً'}],$('.fq1',el),function(){ $('#q1 .opts',el).classList.add('hide'); var q=$('#q2',el); q.classList.remove('hide'); q.classList.add('up') });
  bindMcq($('#q2',el),[{t:'',ok:true,why:'صح: جزء من CO₂ يذوب في المحلول، مع أخطاء القياس'},{t:'',why:'الحمض داخل الدورق من البداية ولم يضف كتلة جديدة'},{t:'',why:'الميزان لا يتعطل، والفرق صغير يفسره ذوبان الغاز'}],$('.fq2',el),function(){ $('#q2 .opts',el).classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') });
 },
 note:'<ul><li>حسابات دليل المعلم: ١٫٦٥ ÷ ١٠٦ = ٠٫٠١٥٦ mol من كربونات الصوديوم، ٠٫٦٥ ÷ ٤٤ = ٠٫٠١٤٨ mol من CO₂ ← ارتباط وثيق ١ : ١.</li><li>الهدف: إثبات نسبة التكافؤ الكيميائي بين المادة المتفاعلة والمادة الناتجة.</li></ul>'});

/* 27 class race */
slide({id:'race',ch:6,title:'سباق الفصل: الصيغة والمحددة والكتلة',tag:'مسابقة',
 html:function(){
  var Q=[['أ','n(S) في 6.4 g من الكبريت','mol'],['ب','n(O) ÷ n(Fe) لـ 0.3 mol Fe و0.45 mol O',''],['ج','2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O: 0.4 mol H<sub>2</sub> و0.3 mol O<sub>2</sub> ← mol H<sub>2</sub>O','mol'],['د','10 t CaCO<sub>3</sub> ← ؟ t CaO (100 : 56)','t'],['هـ','4Al + 3O<sub>2</sub> → 2Al<sub>2</sub>O<sub>3</sub>: 5.4 g Al ← g Al<sub>2</sub>O<sub>3</sub>','g'],['و','Fe + S → FeS: 11.2 g Fe و8 g S ← g FeS','g'],['ز','كتلة S المتبقية في (و)','g'],['ح','2Mg + O<sub>2</sub> → 2MgO: 12 g Mg ← g MgO','g']];
  return `<div class="col grow" style="gap:8px"><div class="chips" style="gap:8px;direction:ltr;justify-content:center">${['H','O','Mg','Al','S','Fe','Ca'].map(function(s){return '<span class="pill" style="min-height:34px;padding:0 12px;font-size:19px;font-family:var(--font-display)">'+s+' = '+AR[s]+'</span>'}).join('')}</div>
   <div class="rgrid" style="grid-template-columns:repeat(4,1fr)">${Q.map(function(q,i){return `<div class="rc" data-i="${i}"><div class="nm" style="font-size:18px">${q[0]}. ${q[1]}</div><div class="ans"></div>${ninHTML('r'+i,q[2],'sm')}</div>`}).join('')}</div></div>
   <div class="teams"><div class="team"><div style="font-weight:700;font-size:21px">الفريق الأول</div><b class="num" id="tA">0</b><div class="pm"><button type="button" data-t="A" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="A" data-d="1" aria-label="زِد">+</button></div></div>
   <div class="team b"><div style="font-weight:700;font-size:21px">الفريق الثاني</div><b class="num" id="tB">0</b><div class="pm"><button type="button" data-t="B" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="B" data-d="1" aria-label="زِد">+</button></div></div>
   <p class="sm muted" id="left" style="text-align:center">٨ أسئلة متبقية</p></div>`;},
 init:function(el){
  var A=[6.4/32,1.5,0.4,5.6,10.2,17.6,1.6,20], sc={A:0,B:0}, left=8;
  $$('.team .pm button',el).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); sc[t]=Math.max(0,sc[t]+ +b.getAttribute('data-d')); $('#t'+t,el).textContent=sc[t]})});
  $$('.rc',el).forEach(function(c,i){
    bindNum($('.nin',c),A[i],Math.max(tolOf(A[i])*1.5,1e-6),function(ok){ if(ok){c.classList.add('ok'); $('.ans',c).textContent='= '+(+A[i].toPrecision(4)); left--; $('#left',el).textContent=left?ar(left)+' أسئلة متبقية':'انتهت الأسئلة!'} });
  });
 },
 note:'<ul><li>الإجابات: ٠٫٢ mol، ١٫٥، ٠٫٤ mol (H₂ هي المحددة)، ٥٫٦ t، ١٠٫٢ g، ١٧٫٦ g (Fe هي المحددة)، ١٫٦ g، ٢٠ g.</li><li>قسّم الصف فريقين، وكل فريق يرسل طالباً. اضغط + للفريق الفائز بالنقطة.</li></ul>'});
