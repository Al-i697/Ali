/* ---------- part D: energy along the food chain and the three pyramids (student book pp. 95-99; activity book Activity 3-3) ---------- */

/* 27 the fate of sunlight energy (student book p. 95, figure 3-2) */
scn('sun',3);

/* 28 respiration and net productivity (student book p. 96) */
explain({id:'resp',ch:3,title:'التنفس وصافي الإنتاجية',tag:'اكتشف',
 lead:{q:'ما الجزء من الكتلة الحيوية الذي يكون متاحاً للمستوى الغذائي التالي؟',
  opts:[{t:'صافي الإنتاجية فقط',ok:true,why:'صح: لأن جزءاً من الجلوكوز يُستخدم في التنفس'},{t:'إجمالي الإنتاجية كله',why:'جزء منه يُحرق في التنفس'},{t:'الكتلة التي تحللت',why:'تتحلل بفعل المحلّلات وتعود إلى البيئة'}],
  gbar:'صافي الإنتاجية = إجمالي الإنتاجية الأولية − ما يُستهلك في التنفس.'},
 pts:['يُستخدم بعض الجلوكوز الناتج من عملية التمثيل الضوئي في <b>التنفس</b>؛ وهذا يعني أن صافي الإنتاجية فقط من الكتلة الحيوية يكون متاحاً للمستوى الغذائي التالي.',
  'تمر الطاقة المخزّنة في الكتلة الحيوية إلى الكائنات غير ذاتية التغذية عندما تتناول وتهضم وتمتص المغذيات من المنتجات؛ وعندها يمكن أن يتم التمثيل الغذائي لهذه المغذيات في كتلة حيوية جديدة.',
  'يأكل المستهلك الأولي <b>الخلية كلها</b> عندما تكون المنتجات من العوالق النباتية، لذا تُنقل كل الطاقة المتاحة.',
  'بالمقابل توجد أجزاء لا تؤكل من الطحالب الكبيرة والنباتات الجذرية مثل الأعشاب البحرية (الجذور مثلاً)، فلن تكون الطاقة المخزنة فيها متاحة للمستوى الغذائي التالي، وإن كانت قد تعود إلى النظام البيئي بالتحلل عندما يموت النبات.'],
 fs:21,gap:9,
 note:'<ul><li>كتاب الطالب ص٩٦ (أول ثلاث فقرات). الهدف ٣-٧.</li></ul>'});

/* 29 secondary productivity (student book p. 96, figure 3-3) */
scn('sec',3);

/* 30 match the symbols of the energy equation (figure 3-3) */
slide({id:'cpruf',ch:3,title:'ماذا يمثل كل رمز في C = P + R + F + U؟',tag:'طابق',
 html:function(){
  var rows=[['C','الطاقة المستهلكة (الطاقة في الطعام المأكول)'],['R','الطاقة المستخدمة في التنفس'],['F','الطاقة الموجودة في البراز'],['U','الطاقة الموجودة في البول وفضلات عمليات الأيض الأخرى'],['P','الطاقة المتبقية لإنتاج كتلة حيوية جديدة بواسطة الحيوان']];
  return `<div class="col grow" style="gap:10px;justify-content:center">
   <div class="eqs" style="font-size:36px">C = P + R + F + U</div>
   <div style="display:flex;flex-direction:column;gap:8px">${rows.map(function(r){return '<div style="display:grid;grid-template-columns:1fr 210px;gap:12px;align-items:center"><div class="mslot slot" data-k="'+r[0]+'" style="min-height:52px;justify-content:center"><span class="ph" style="font-size:19px">'+r[1]+'</span></div><div class="mk" style="font:800 28px var(--font-display);text-align:center;direction:ltr">'+r[0]+'</div></div>'}).join('')}</div>
   <div id="tray" class="tray" style="min-height:60px;padding:6px 10px"></div>
   <div class="fb" style="min-height:26px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:21px">الطاقة المستهلكة تُفقد منها R و F و U، ويبقى P متاحاً للمستوى التالي.</div></div>`;},
 init:function(el){
  /* the chips carry the meanings, the slots carry the letters: tap a meaning, then the letter */
  var rows={C:'الطاقة المستهلكة',R:'الطاقة في التنفس',F:'الطاقة في البراز',U:'الطاقة في البول والفضلات',P:'الطاقة المتبقية للإنتاج'};
  $$('.mslot',el).forEach(function(s){ $('.ph',s).textContent='اسحب المعنى المناسب إلى هنا' });
  bindMatch(el,Object.keys(rows).map(function(k){return [k,rows[k]]}),{css:'font-size:19px;padding:8px 12px',more:'صح! كمّل',done:'✓ فهمت معنى كل رمز',bad:'فكّر: أين تذهب هذه الطاقة؟'});
 },
 note:'<ul><li>كتاب الطالب ص٩٦: الصيغة C = P + R + F + U وتفسير الرموز. نشاط المطابقة من عندي.</li></ul>'});

/* 31 why only about 10% (student book p. 97) */
explain({id:'ten',ch:3,title:'لماذا تنتقل نحو 10% فقط؟',tag:'فسّر',
 lead:{q:'إذا كان في المستوى الغذائي 10000 وحدة طاقة وكانت الكفاءة 10%، فكم وحدة تنتقل إلى المستوى التالي؟',
  opts:[{t:'1000 وحدة',ok:true,why:'صح: 10000 × 10% = 1000'},{t:'100 وحدة',why:'هذه 1%'},{t:'9000 وحدة',why:'هذا ما يُفقد'}],
  gbar:'نحو 10% تنتقل ونحو 90% تُفقد (تنفس، فضلات، أجزاء لا تؤكل، افتراس غير ناجح).'},
 pts:['بشكل عام تبلغ كفاءة الانتقال بين المستويات الغذائية نحو <b class="num">10%</b> تقريباً، لكنها تختلف بحسب:',
  '<b>مقدار الطعام الذي يُؤكل</b>، و<b>مدى سهولة هضم</b> المستهلك للمغذيات والتمثيل الغذائي لها (أي تحويلها إلى طاقة).',
  '<b>مقدار الطاقة المستخدمة للحركة</b>، و<b>مقدار الفاقد في فضلات الأيض</b>.',
  'بعض الكائنات الحية أسهل في الهضم والتمثيل الغذائي من غيرها؛ ومن الأسهل للمستهلكات الاستفادة من الطاقة الموجودة في حيوانات أخرى عوضاً عن الاستفادة من الطاقة في المنتجات، لأن ذلك يوفّر انتقال المزيد من الطاقة إلى المستهلك التالي.',
  'بالإضافة إلى ذلك، بعض الكائنات الحية في كل مستوى غذائي <b>تفلت من الافتراس</b>، لذا لا تنتقل الطاقة المخزنة في كتلتها الحيوية إلى المستوى التالي مطلقاً.',
  'فقدان الطاقة عند كل مستوى هو السبب في أن السلاسل الغذائية قصيرة (4 إلى 6 مستويات).'],
 fs:20,gap:7,
 note:'<ul><li>كتاب الطالب ص٩٧ (أول فقرتين). الهدف ٣-٧. الجملة الأخيرة (قصر السلاسل الغذائية) من ص٩١ وص٩٣ في الكتاب.</li></ul>'});

/* 32 pyramids of numbers (student book p. 97, figure 3-4) */
scn('pnum',4);

/* 33 pyramids of biomass (student book p. 98, figure 3-5) */
scn('pbio',4);

/* 34 pyramids of energy (student book p. 99, figure 3-6) */
scn('pene',4);

/* 35 pyramids during an algal bloom (student book p. 99) */
scn('bloom',4);

/* 36 compare the three pyramids (made from the text of pp. 97-99) */
slide({id:'pcmp',ch:4,title:'قارن بين الأهرامات الثلاثة',tag:'اختر لكل عبارة',
 html:function(){
  var items=[['يبيّن عدد الكائنات الحية في كل مستوى غذائي','n','هرم الأعداد'],['يبيّن الكتلة الحيوية (الجافة) في كل مستوى','b','هرم الكتلة الحيوية'],['يقيس الطاقة بوحدات kJ/m² year على مدى سنة','e','هرم الطاقة'],
   ['قد يكون مقلوباً عندما تتغذى طفيليات صغيرة على سمكة كبيرة','n','هرم الأعداد'],['قد يكون مقلوباً لأن العوالق النباتية تتكاثر بسرعة وتُؤكل بسرعة','b','هرم الكتلة الحيوية'],['لا يُقلب أبداً (يكون دائماً على شكل هرم)','e','هرم الطاقة'],
   ['لا يأخذ حجم الكائنات بالاعتبار','n','هرم الأعداد'],['يحتاج إلى جداول تحويل أو كتلة جافة لعينة','b','هرم الكتلة الحيوية']];
  return `<div class="col grow" style="gap:8px;justify-content:center">
   <div style="font-size:23px;font-weight:800;color:var(--cyan)">لأي هرم تنتمي كل عبارة؟</div>
   <div class="clsw" style="max-width:none">${clsHTML(items,[['n','أعداد'],['b','كتلة'],['e','طاقة']],20)}</div>
   <div class="fb" style="min-height:24px;text-align:center"></div>
   <div class="gbar hide" id="gb" style="font-size:20px">الأعداد والكتلة قد تُقلبان في حالات خاصة، أما هرم الطاقة فلا يُقلب أبداً.</div></div>`;},
 init:function(el){ bindCls(el,$('.fb',el),function(){unhide(el)},'فكّر: ماذا يقيس هذا الهرم؟') },
 note:'<ul><li>العبارات من نص كتاب الطالب ص٩٧–٩٩. نشاط التصنيف من عندي.</li></ul>'});
