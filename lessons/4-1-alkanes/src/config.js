/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الألكانات', brand:'الدرس ٤-١ · الألكانات', home:'index.html',
  chapters:['مدخل: الكيمياء العضوية','الهيدروكربونات والألكانات','التسمية والصيغ','الخصائص الفيزيائية','الاحتراق والاستخدامات','السلسلة المتجانسة','أسئلة وامتحانات'],
  bgMap:['mol_carbon','mol_methane','mol_propane','mol_chain','mol_burn','mol_family','mol_family'],
  palCh:['navy','emerald','violet','navy','ember','emerald','gold'],
  bgId:{goals:'p_leaf',what:'p_earth',carbon:'mol_carbon',bonds:'p_leaf_z',q1to4:'p_leaf_d',hydro:'mol_ethene',alk:'p_leaf_g',names:'mol_methane',formula:'p_leaf_v',draw:'mol_propane',names2:'p_table_v',states:'pm_family',plot:'mol_hexane',why:'p_leaf_z',exq26:'p_table',inert:'pm_ethane',burn:'mol_burn',uses2:'p_pump_head',q89:'p_ref_mid',dots:'mol_methane',homol:'pm_family',map:'p_leaf_v',ws41:'p_leaf',ws42:'p_ref_low',eou:'p_table_v',past1:'p_pipes_sun',past2:'p_leaf_d',final:'p_pump_base',hw:'mol_family'},
  palId:{goals:'navy',what:'navy',carbon:'gold',bonds:'violet',q1to4:'navy',hydro:'emerald',alk:'emerald',names:'violet',formula:'violet',draw:'violet',names2:'emerald',states:'navy',plot:'navy',why:'emerald',exq26:'gold',inert:'ember',burn:'ember',uses2:'ember',q89:'ember',dots:'ember',homol:'emerald',map:'emerald',ws41:'gold',ws42:'gold',eou:'gold',past1:'gold',past2:'gold',final:'navy',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], what:[['m_bulb',1130,556,96,5,1.0]], carbon:[['m_atom',40,556,100,-5,1.0]], bonds:[['m_star',1130,556,90,6,1.0]], q1to4:[['m_star',40,556,90,-6,1.0]],
    hydro:[['m_tube',40,556,100,-5,1.0]], alk:[['m_flask',1130,556,96,5,1.0]], names:[['m_atom',1130,556,100,6,1.0]], formula:[['m_mole',40,556,100,-5,1.0]], draw:[['m_bulb',1130,556,100,6,1.0]],
    names2:[['m_star',1130,556,90,6,1.0]], states:[['m_flame',1130,556,100,6,1.0]], plot:[['m_tube',40,556,100,-5,1.0]], why:[['m_mole',1120,552,100,5,1.0]], exq26:[['n_notes',40,540,120,-5,1.0]],
    inert:[['saf_goggles',1070,590,110,-4,1.0]], burn:[['m_flame',1130,556,100,6,1.0]], uses2:[['m_flame',40,556,100,-5,1.0]], q89:[['m_star',1130,556,90,6,1.0]], dots:[['m_atom',40,556,100,-5,1.0]],
    homol:[['m_mole',40,556,100,-5,1.0]], map:[['m_trophy',572,566,140,-3,1.0]], ws41:[['m_bulb',1130,556,100,6,1.0]], ws42:[['m_flame',40,556,100,-5,1.0]], eou:[['m_star',1130,556,90,6,1.0]],
    past1:[['n_notes',40,540,120,-5,1.0]], past2:[['m_star',1130,556,90,6,1.0]], final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
