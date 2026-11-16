/* ---------- part B: predation, food webs and the sea otter - sea urchin - kelp story (student book p. 92; activity book Activity 3-2, pp. 105-113) ---------- */

/* 10 Activity 3-2, question 1: producers, consumers and decomposers in a passage about manatees */
slide({id:'manatee',ch:1,title:'نشاط 3-2: خراف البحر',tag:'صنّف الكائنات',
 html:function(){
  var P='خراف البحر <span class="en">Manatees</span> نوع من بقر البحر تعيش في مياه الساحل، وتتغذى على مجموعة واسعة من الطحالب الكبيرة والنباتات البحرية مثل حشائش السلحفاة وحشائش خروف البحر وحشائش الضحل وأوراق المانجروف ونباتات ياسنت الماء. وهي عرضة قليلة للافتراس من عدد قليل من الحيوانات الكبيرة، ولكن أحياناً تستطيع النمور والتماسيح وأسماك القرش افتراسها. وعندما ينفق خروف البحر ويغرق إلى قاع المحيط، يمثّل سمك القرش وسمك الجريث ومزدوجات الأرجل الأولى التي تأكل جسمه المتحلّل. ثم تأكل السرطانات والقواقع والديدان بقايا الطعام العضوية الساقطة في الرواسب؛ أما الهيكل العظمي فتفكّك البكتيريا الزيوت الموجودة فيه لتتحول إلى رواسب غنية بالمغذيات غير العضوية.';
  var items=[['حشائش السلحفاة','p','منتج: نبات بحري يصنع غذاءه'],['أوراق المانجروف','p','منتج: نبات يصنع غذاءه'],['نباتات ياسنت الماء','p','منتج: نبات يصنع غذاءه'],['الطحالب الكبيرة','p','منتج: يقوم بالتمثيل الضوئي'],
   ['خروف البحر','c','مستهلك: يتغذى على المنتجات'],['التماسيح','c','مستهلك: تفترس خروف البحر'],['النمور','c','مستهلك: تفترس خروف البحر'],['سمك القرش','c','مستهلك: يفترس وهو أول من يأكل الجسم المتحلّل (رمّام)'],
   ['البكتيريا','d','محلل: تفكّك الزيوت والبقايا العضوية']];
  return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
   <div class="col" style="width:470px;flex:none;gap:10px;justify-content:center">
    <div class="panel" style="padding:12px 16px"><div style="font-size:19px;line-height:1.55">${P}</div></div>
    <div class="gbar hide" id="gb" style="font-size:20px">الرمّيات تتغذى على المواد الميتة والمتحلّلة: سمك القرش وسمك الجريث ومزدوجات الأرجل، ثم السرطانات والقواقع والديدان.</div></div>
   <div class="col" style="flex:1;min-width:0;gap:6px;justify-content:center">
    <div style="font-size:22px;font-weight:800;color:var(--cyan)">ما الإطار البيئي لكل كائن: منتج أم مستهلك أم محلل؟</div>
    <div class="clsw" style="max-width:none">${clsHTML(items,[['p','منتج'],['c','مستهلك'],['d','محلل']],19)}</div>
    <div class="fb" style="min-height:24px;text-align:center"></div></div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: هل يصنع غذاءه أم يتغذى على غيره أم يفكّك الميتات؟') },
 note:'<ul><li>كتاب الأنشطة ص١٠٥–١٠٦: نشاط ٣-٢ س١(ب) والفقرة عن خراف البحر. الإجابة على س١(ج): الرمّيات في الفقرة هي سمك القرش وسمك الجريث ومزدوجات الأرجل (ثم السرطانات والقواقع والديدان).</li><li>الكتاب بلا إجابات نموذجية، فالتصنيف من عندي.</li></ul>'});

/* 11 predation (student book p. 92, photo 3-4) */
explain({id:'pred',ch:1,title:'الافتراس',tag:'اكتشف',
 lead:{q:'ماذا يحدث لجماعة بلح البحر لو اختفى نجم البحر (مفترسها) من المنطقة؟',
  opts:[{t:'تتكاثر بشكل كبير لأنه لا مفترس يضبط أعدادها',ok:true,why:'صح: وقد تدمّر غابة طحلب الكِلْب فتتأثر الأنواع التي تتغذى عليه'},{t:'تقل أعدادها',why:'اختفاء المفترس يزيد الفريسة'},{t:'لا يتغير شيء',why:'العلاقة بين المفترس والفريسة تضبط التوازن'}],
  gbar:'العلاقة بين المفترس والفريسة مهمة للتوازن الصحي للجماعة الأحيائية.'},
 pts:['الافتراس من أهم العلاقات الغذائية بين '+tm('المفترس','Predator')+' و'+tm('الفريسة','Prey')+'.',
  'المفترس حيوان يصطاد ويقتل ويأكل حيوانات أخرى، وهو مستهلك ثانوي أو ثالثي أو رابعي. تشمل المفترسات البحرية القرش والأسماك آكلة اللحوم والعوالق الحيوانية التي تأكل العوالق الأخرى والأسماك.',
  'يتكيّف المفترس للصيد: سرعة ورشاقة، وتمويه، وأسنان كبيرة أو سم، أو الصيد في مجموعات.',
  'الفريسة حيوان تأكله المفترسات؛ وتتكيّف بالتمويه، والأشواك الدفاعية، والاختباء في أماكن آمنة، أو الهروب.',
  {html:'<div class="panel pb" data-pt style="display:flex;gap:14px;align-items:center">'+phHTML('star','الصورة 3-4: نجم البحر يأكل بلح البحر',210)+'<div style="flex:1">بدون المفترسات الطبيعية (كنجم البحر) تتكاثر جماعات بلح البحر وقنافذ البحر بشكل كبير وقد تدمّر غابة طحلب الكِلْب، فيتأثر سلباً كل ما يتغذى عليه أو يعيش فيه.</div></div>'}],
 fs:21,gap:8,
 note:'<ul><li>كتاب الطالب ص٩٢ (الافتراس) والصورة ٣-٤. المصطلحان: المفترس والفريسة.</li></ul>'});

/* 12 Activity 3-2, question 2: the Antarctic food web (figure 3-1 of the activity book, simplified) */
(function(){
  var N=[['leo','فقمات النمر',170,45],['orca','الحيتان القاتلة',480,45],
   ['bird','طيور بحرية',60,125],['peng','بطريق آديلي',195,125],['seal','فقمات',330,125],['minke','حيتان المنك',470,125],['col','السبيدج العملاق',620,125],
   ['lant','سمكة الفنار',300,210],['squid','الحبار',470,210],
   ['krill','الكريل',90,295],['salp','هلاميات برميلية',300,295],['bot','حيوانات القاع',560,295],
   ['ice','طحالب الجليد',90,380],['phy','عوالق نباتية',300,380],['det','فتات عضوي وبكتيريا',560,380]];
  var E=[['ice','krill'],['phy','salp'],['det','bot'],['bot','squid'],['krill','bird'],['krill','peng'],['krill','seal'],['krill','minke'],['lant','peng'],['lant','squid'],['lant','col'],['squid','seal'],['squid','orca'],['seal','leo'],['seal','orca'],['peng','leo'],['minke','orca']];
  slide({id:'antarctic',ch:1,title:'نشاط 3-2: شبكة القارة المتجمدة الجنوبية',tag:'اضغط على كائن',
   html:function(){
    var Q=[['ارسم سلسلة غذائية تحتوي على الكريل وعلى مستهلك ثالثي.','طحالب الجليد ← الكريل ← فقمات ← فقمات النمر'],
     ['اشرح تأثير انخفاض وفرة الكريل في الشبكة الغذائية.','تقل أعداد الفقمات والبطريق والطيور والحيتان التي تتغذى عليه، فتقل مفترساتها كالحيتان القاتلة وفقمات النمر.'],
     ['الحيتان القاتلة تفترس الحبّار: كيف ترتبط الجماعتان؟','زيادة الحبّار تزيد غذاء الحيتان القاتلة فتزيد أعدادها، وزيادتها تقلل الحبّار: يتبع كل نوع تغيّرَ الآخر.']];
    return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
     <div class="col" style="flex:1.45;min-width:0;gap:6px;justify-content:center"><div class="panel" style="padding:6px 8px">${webSVG('wA',N,E,700,420)}</div>
      <div class="fb" style="min-height:44px;font-size:20px;text-align:center">اضغط على أي كائن: الأخضر ما يأكله والأحمر من يأكله.</div></div>
     <div class="col" style="width:430px;flex:none;gap:8px;justify-content:center"><div style="font-size:19px;color:var(--muted)">مبسّطة من الشكل 3-1 في كتاب الأنشطة (السهم من الكائن المأكول إلى الآكل).</div>${qaHTML(Q)}</div></div>`;},
   init:function(el){ bindWeb(el,'wA',N,E,$('.fb',el)); bindCards(el,function(){}) },
   note:'<ul><li>كتاب الأنشطة ص١٠٧–١٠٨: نشاط ٣-٢ س٢(ب) وشكل ٣-١ (الشبكة الغذائية للقارة المتجمدة الجنوبية). رسمتها مبسّطة من الشكل بأسهم ظاهرة فيه، وقد تختلف تفاصيل بعض الأسهم عن الأصل.</li><li>الإجابات النموذجية للأسئلة الثلاثة من عندي (الكتاب بلا إجابات).</li></ul>'});
})();

/* 13 Activity 3-2, question 3 (a, b): the kelp forest food web (figure 3-2 of the activity book, simplified) */
(function(){
  var N=[['otter','ثعلب البحر',350,40],['eseal','فقمة الفيل',70,125],['star','نجم البحر',330,130],['bigf','سمكة كبيرة',620,125],
   ['shark','قرش القرن',70,215],['urch','قنفذ البحر',215,215],['crab','سرطان البحر الكِلبي',490,205],
   ['herb','أسماك آكلة أعشاب ولافقاريات',250,300],['abal','أذن البحر',510,300],['small','أسماك صغيرة',640,300],
   ['kelp','طحلب الكِلْب',100,385],['phy','عوالق نباتية',350,385],['zoo','عوالق حيوانية',590,385]];
  var E=[['kelp','urch'],['kelp','herb'],['kelp','crab'],['herb','star'],['herb','crab'],['herb','small'],['phy','zoo'],['zoo','abal'],['zoo','small'],['zoo','crab'],['small','crab'],['small','bigf'],['crab','bigf'],['crab','otter'],['abal','otter'],['abal','star'],['star','otter'],['star','crab'],['urch','otter'],['urch','shark'],['shark','eseal'],['bigf','otter']];
  slide({id:'kelp',ch:1,title:'نشاط 3-2: شبكة غابات طحلب الكِلْب',tag:'أكمل السلاسل',
   html:function(){
    var Q=[['ما المستوى الغذائي الذي يشغله طحلب الكِلْب؟','المستوى الأول: منتج.'],
     ['طحلب الكِلْب ← سمكة آكلة أعشاب ← سرطان البحر الكِلبي ← ؟ ← ثعلب البحر','سمكة كبيرة.'],
     ['طحلب الكِلْب ← حيوان لافقاري ← ؟ ← ثعلب البحر','نجم البحر.'],
     ['سرطان البحر الكِلبي ← ؟ ← ثعلب البحر','سمكة كبيرة.']];
    return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
     <div class="col" style="flex:1.45;min-width:0;gap:6px;justify-content:center"><div class="panel" style="padding:6px 8px">${webSVG('wK',N,E,700,425)}</div>
      <div class="fb" style="min-height:44px;font-size:20px;text-align:center">اضغط على أي كائن: الأخضر ما يأكله والأحمر من يأكله.</div></div>
     <div class="col" style="width:430px;flex:none;gap:8px;justify-content:center"><div style="font-size:19px;color:var(--muted)">أكمل السلاسل التي تربط طحلب الكِلْب بثعلب البحر (من الشكل 3-2). يُرقَّم المستوى الغذائي: المنتج 1، والمستهلك الأولي 2.</div>${qaHTML(Q)}</div></div>`;},
   init:function(el){ bindWeb(el,'wK',N,E,$('.fb',el)); bindCards(el,function(){}) },
   note:'<ul><li>كتاب الأنشطة ص١٠٩–١١٠: نشاط ٣-٢ س٣(أ) و(ب)، شكل ٣-٢ (شبكة غذائية لغابات طحلب الكِلْب). الشبكة مبسّطة من الشكل.</li><li>في س٣(ب)-٣ المطبوع «البحر الكلبي ← ... ← ثعلب البحر» ناقص الكلمة الأولى على الأرجح، وفهمته «سرطان البحر الكِلبي». الإجابات من عندي.</li></ul>'});
})();

/* 14 Activity 3-2, question 3 (c): quinary consumers */
explain({id:'quin',ch:1,title:'مستهلك خماسي: ثعلب البحر',tag:'احسب المستوى',
 lead:{q:'في سلسلة طحلب الكِلْب، توصف ثعالب البحر بأنها مستهلكات خماسية. ما رقم مستواها الغذائي؟',
  opts:[{t:'المستوى الخامس',why:'المنتج هو المستوى الأول، فالمستهلك الأولي في الثاني... تابع العدّ'},{t:'المستوى السادس',ok:true,why:'صح: منتج 1، أولي 2، ثانوي 3، ثالثي 4، رابعي 5، خماسي 6'},{t:'المستوى الرابع',why:'هذا المستهلك الثالثي'}],
  gbar:'المستهلك الخماسي هو المستوى الغذائي السادس.'},
 pts:['العوالق الحيوانية والأسماك آكلة الأعشاب والحيوانات اللافقارية <b>مستهلكات أولية</b> (المستوى الغذائي 2).',
  {html:'<div class="panel pb" data-pt style="padding:10px 12px"><div style="display:flex;align-items:stretch;gap:5px;direction:rtl">'+[['عوالق نباتية','1'],['عوالق حيوانية','2'],['أسماك صغيرة','3'],['سرطان البحر الكِلبي','4'],['سمكة كبيرة','5'],['ثعلب البحر','6']].map(function(l,i){return '<div style="flex:1;min-width:0;text-align:center;border-radius:10px;padding:6px 2px;background:rgba(var(--t1),.12)"><div style="font-size:15px;font-weight:700;line-height:1.25">'+l[0]+'</div><div style="font-size:14px;color:var(--cyan);font-weight:800">م '+l[1]+'</div></div>'+(i<5?'<div style="align-self:center;font-size:17px;color:var(--gold)">←</div>':'')}).join('')+'</div></div>'},
  'في هذه السلسلة من الشكل 3-2 يكون ثعلب البحر مستهلكاً <b>خماسياً</b> (المستوى 6)، وقد يكون في مستوى أدنى في سلاسل أقصر، كأن يأكل القنفذ مباشرة.'],
 fs:22,
 note:'<ul><li>كتاب الأنشطة ص١١٠: نشاط ٣-٢ س٣(ج). الجواب: المستوى السادس، وسلسلة من الشكل ٣-٢: عوالق نباتية ← عوالق حيوانية ← أسماك صغيرة ← سرطان البحر الكِلبي ← سمكة كبيرة ← ثعلب البحر (من عندي، بحسب أسهم الشكل).</li></ul>'});

/* 15 Activity 3-2, question 4: figure 3-3, sea otters, sea urchins and kelp over 13 years (values read from the figure, approximate) */
slide({id:'otter1',ch:1,title:'نشاط 3-2: ثعالب البحر وقنافذ البحر والكِلْب',tag:'حلّل البيانات',
 html:function(){
  function bars(t,u,a,b,mx,col){ var H=96; function h(v){return Math.max(2,v/mx*H)}
    return '<div class="panel" style="padding:6px 8px;gap:2px"><div class="sm" style="font-size:16px;font-weight:800;text-align:center;color:var(--cyan)">'+t+'</div><svg viewBox="0 0 220 130" class="fgv" aria-hidden="true"><line x1="30" y1="110" x2="210" y2="110" stroke="#9fb6c2"/><rect x="60" y="'+(110-h(a))+'" width="44" height="'+h(a)+'" fill="'+col+'" opacity=".6"/><rect x="140" y="'+(110-h(b))+'" width="44" height="'+h(b)+'" fill="'+col+'"/><text x="82" y="125" class="lbl" style="font-size:14px">2002</text><text x="162" y="125" class="lbl" style="font-size:14px">2012</text><text x="82" y="'+(104-h(a))+'" class="lbl" style="font-size:14px">≈'+a+'</text><text x="162" y="'+(104-h(b))+'" class="lbl" style="font-size:14px">≈'+b+'</text></svg><div class="sm" style="font-size:14px;text-align:center;color:var(--muted)">'+u+'</div></div>';
  }
  var Q=[['اشرح سبب زيادة كثافة الرعي في 2012 مقارنةً بـ2002.','زادت أعداد قنافذ البحر التي ترعى الكِلْب بعد انخفاض ثعالب البحر التي تفترسها.'],
   ['اقترح سبب انخفاض كتلة قنافذ البحر في 2002 رغم وفرة الكِلْب.','لأن ثعالب البحر كانت كثيرة وتفترس القنافذ فتُبقي أعدادها قليلة.'],
   ['اقترح إجراءً تتخذه المجتمعات الساحلية لزيادة ثعالب البحر المحلية.','منع صيدها وحماية موائلها وتقليل التلوث.'],
   ['اقترح أثر ارتفاع ثعالب البحر في جماعة قرش القرن.','تأكل الثعالب القنافذ التي يتغذى عليها القرش فيقل غذاؤه وتقل أعداده.']];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1.3;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:19px;color:var(--muted)">الشكل 3-3 (قيم تقريبية قُرئت من الرسم) · ثعلب البحر ← قنفذ البحر ← طحلب الكِلْب</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${bars('(ب) كثافة الرعي','فقدان 24% في الساعة',3,65,80,'#ff9c6e')}${bars('(ج) كتلة قنافذ البحر','g لكل 0.25 m²',30,325,360,'#c28bff')}${bars('(د) كثافة طحلب الكِلْب','عدد لكل 0.25 m²',10,0,12,'#8fe26e')}
     <div class="panel" style="padding:8px 12px;justify-content:center;gap:6px"><div class="sm" style="font-size:16px;font-weight:800;text-align:center;color:var(--cyan)">(أ) وفرة ثعلب البحر</div><div style="font-size:21px;font-weight:700;text-align:center;line-height:1.5">من ≈ 85% إلى ≈ 25% من الحد الأقصى على مدى 13 عاماً (2000-2012)</div></div></div></div>
   <div class="col" style="width:440px;flex:none;gap:8px;justify-content:center">${qaHTML(Q)}</div></div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١١١–١١٢: نشاط ٣-٢ س٤، شكل ٣-٣. القيم على الأعمدة تقريبية قرأتها من الرسم (الأصل رسم بياني بلا أرقام دقيقة).</li><li>الإجابات من عندي: القصة المتوقعة أن انخفاض الثعالب زاد القنافذ التي أفنت الكِلْب.</li></ul>'});

/* 16 Activity 3-2, question 5: figure 3-4, depth profiles on two islands */
slide({id:'otter2',ch:1,title:'نشاط 3-2: الكِلْب والقنافذ على جزيرتين',tag:'حلّل البيانات',
 html:function(){
  function chart(t,kelp,urch){
    function pl(pts,c,dash){return '<polyline points="'+pts.map(function(p){return (30+p[0]*1.5)+','+(14+p[1]*7)}).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="4"'+(dash?' stroke-dasharray="7 5"':'')+'/>'}
    return '<div class="panel" style="padding:6px 8px;gap:2px"><div class="sm" style="font-size:17px;font-weight:800;text-align:center;color:var(--cyan)">'+t+'</div><svg viewBox="0 0 190 190" class="fgv" aria-hidden="true"><rect x="30" y="14" width="150" height="168" fill="rgba(255,255,255,.06)"/><line x1="30" y1="14" x2="30" y2="182" stroke="#9fb6c2"/><line x1="30" y1="182" x2="180" y2="182" stroke="#9fb6c2"/>'+pl(kelp,'#8fe26e')+pl(urch,'#ff9c6e',true)+'<text x="105" y="12" class="lbl" style="font-size:12px">الوفرة (0–100)</text><text x="12" y="100" class="lbl" style="font-size:12px" transform="rotate(-90 12 100)">العمق 0–24 m</text></svg><div class="sm" style="font-size:15px;text-align:center"><span style="color:#8fe26e">— طحلب الكِلْب</span> · <span style="color:#ff9c6e">- - قنافذ البحر</span></div></div>';
  }
  var Q=[['في أمشيتكا: لماذا يقل طحلب الكِلْب مع زيادة العمق؟','لأن الضوء يقل مع العمق فيقل التمثيل الضوئي.'],
   ['قارن وفرة القنافذ والكِلْب على عمق 6 m في الجزيرتين.','أمشيتكا: قنافذ قليلة وكِلْب كثير. شيميا: قنافذ كثيرة وكِلْب قليل.'],
   ['ثعالب البحر كثيرة في أمشيتكا ونادرة في شيميا: فسّر الفرق.','في أمشيتكا تفترس الثعالب القنافذ فيكثر الكِلْب؛ وفي شيميا تتكاثر القنافذ بلا مفترس فتقضي على الكِلْب.'],
   ['توقّع الفرق في غذاء ثعالب البحر بين الجزيرتين.','أمشيتكا: غذاء متنوع لقلة القنافذ. شيميا: تعتمد على القنافذ الكثيرة.']];
  return `<div style="display:flex;gap:16px;flex:1;align-items:stretch">
   <div class="col" style="flex:1.25;min-width:0;gap:8px;justify-content:center">
    <div style="font-size:19px;color:var(--muted)">الشكل 3-4 (رسم تقريبي للمنحنيين)</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${chart('(أ) جزيرة أمشيتكا',[[100,0],[75,6],[50,12],[30,18],[15,24]],[[15,0],[25,3],[40,8],[45,12],[30,17],[20,22]])}${chart('(ب) جزيرة شيميا',[[10,0],[10,24]],[[100,0],[65,6],[30,12],[10,18],[5,24]])}</div></div>
   <div class="col" style="width:450px;flex:none;gap:8px;justify-content:center">${qaHTML(Q)}</div></div>`;},
 init:function(el){ bindCards(el,function(){}) },
 note:'<ul><li>كتاب الأنشطة ص١١٢–١١٣: نشاط ٣-٢ س٥، شكل ٣-٤ (أ: جزيرة أمشيتكا، ب: جزيرة شيميا في بحر بيرينغ). المنحنيان مرسومان تقريباً من الشكل.</li><li>الإجابات من عندي (الكتاب بلا إجابات). جمعتُ البندين ب وج في سؤال واحد.</li></ul>'});
