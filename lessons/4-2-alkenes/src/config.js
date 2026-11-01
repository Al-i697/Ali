/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الألكينات', brand:'الدرس ٤-٢ · الألكينات وتفاعلات الإضافة', home:'index.html',
  chapters:['مدخل: من الألكانات إلى الألكينات','التركيب والتسمية','الخصائص الفيزيائية','النشاط الكيميائي والاحتراق','ماء البروم: الكشف عن عدم التشبع','تفاعلات الإضافة','الاستخدامات والمقارنة','أسئلة وامتحانات'],
  bgMap:['mol_ethene','mol_propene','mol_butene','mol_addn','mol_dibromo','mol_addn','mol_family','mol_family'],
  palCh:['navy','violet','navy','ember','gold','emerald','emerald','gold'],
  bgId:{goals:'pm_ene',recall:'p_leaf_v',what:'mol_ethene',bondE:'pm_ene2',formula:'mol_butene',names:'mol_propene',draw:'p_earth_top',states:'p_pump_sky',plotE:'mol_butene',whyE:'p_leaf_z',react:'mol_addn',burnE:'mol_burn',lab:'p_leaf_d',labq:'p_table',br:'mol_dibromo',eqBr:'p_leaf_g',hyd:'mol_addn',hydr:'pm_ethanol',conds:'p_leaf_g',q20:'p_earth',uses:'p_earth_g',compare:'p_hands',map:'p_leaf_v',q1114:'p_pump_head',q1520:'p_pipes_top',ex42:'p_ref_mid',ex43:'p_pipes_sun',eou3:'p_table',past1:'p_ref_top',past2:'p_pump_base',final:'p_earth_top',hw:'mol_family'},
  palId:{goals:'emerald',recall:'navy',what:'navy',bondE:'violet',formula:'violet',names:'violet',draw:'emerald',states:'navy',plotE:'navy',whyE:'emerald',react:'ember',burnE:'ember',lab:'gold',labq:'gold',br:'gold',eqBr:'emerald',hyd:'emerald',hydr:'ember',conds:'gold',q20:'emerald',uses:'emerald',compare:'violet',map:'emerald',q1114:'gold',q1520:'gold',ex42:'gold',ex43:'gold',eou3:'gold',past1:'gold',past2:'gold',final:'navy',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], recall:[['m_star',1130,556,90,6,1.0]], what:[['m_bulb',1130,556,96,5,1.0]], bondE:[['m_atom',40,556,100,-5,1.0]], formula:[['m_mole',40,556,100,-5,1.0]],
    names:[['m_star',1130,556,90,6,1.0]], draw:[['m_bulb',1130,556,100,6,1.0]], states:[['m_flame',1130,556,100,6,1.0]], plotE:[['m_tube',40,556,100,-5,1.0]], whyE:[['m_mole',1120,552,100,5,1.0]],
    react:[['m_atom',40,556,100,-5,1.0]], burnE:[['m_flame',1130,556,100,6,1.0]], lab:[['saf_goggles',1070,590,110,-4,1.0]], labq:[['m_tube',40,556,100,-5,1.0]], br:[['m_flask',1130,556,96,5,1.0]],
    eqBr:[['m_star',1130,556,90,6,1.0]], hyd:[['m_atom',40,556,100,-5,1.0]], hydr:[['m_flask',1130,556,96,5,1.0]], conds:[['m_bulb',40,556,100,-5,1.0]], q20:[['m_star',1130,556,90,6,1.0]],
    uses:[['m_bulb',1130,556,100,6,1.0]], compare:[['m_mole',40,556,100,-5,1.0]], map:[['m_trophy',572,566,140,-3,1.0]], q1114:[['n_notes',40,540,120,-5,1.0]], q1520:[['m_star',1130,556,90,6,1.0]],
    ex42:[['m_tube',40,556,100,-5,1.0]], ex43:[['m_flame',1130,556,100,6,1.0]], eou3:[['m_star',1130,556,90,6,1.0]], past1:[['n_notes',40,540,120,-5,1.0]], past2:[['m_star',1130,556,90,6,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
