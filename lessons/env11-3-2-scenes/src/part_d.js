/* ---------- part D: energy along the food chain and the three pyramids (student book pp. 95-99; activity book Activity 3-3) ---------- */

/* 27 the fate of sunlight energy (student book p. 95, figure 3-2) */
scn('sun',3);

/* 28 respiration and net productivity (student book p. 96) */
scn('resp',3);

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

/* 31 why only about 10% (student book p. 97): scene with the loss routes (icons 10a) */
scn('ten',3);

/* 32 pyramids of numbers (student book p. 97, figure 3-4) */
scn('pnum',4);

/* 33 pyramids of biomass (student book p. 98, figure 3-5) */
scn('pbio',4);

/* 34 pyramids of energy (student book p. 99, figure 3-6) */
scn('pene',4);

/* 35 pyramids during an algal bloom (student book p. 99) */
scn('bloom0',4);
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
