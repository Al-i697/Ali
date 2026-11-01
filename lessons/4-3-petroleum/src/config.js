/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'البترول', brand:'الدرس ٤-٣ · البترول والوقود الأحفوري', home:'index.html',
  chapters:['مدخل: الوقود الأحفوري','التكوّن والاحتراق','التقطير التجزيئي','خصائص المشتقات النفطية','التكسير الحراري','أسئلة وامتحانات'],
  bgMap:['p_pump_sky','p_pump_head','p_ref_top','p_ref_mid','mol_crack','p_pipes_top'],
  palCh:['ember','ember','gold','navy','violet','gold'],
  bgId:{goals:'p_pump_sky',types:'nb_rig_s',form:'p_pump_head',fields:'p_pipes_sun',burn:'mol_burn',refine:'p_ref_top',process:'p_ref_mid',tower:'p_ref_low',order:'p_pipes_top',uses:'p_pump_base',trend:'mol_decane',why:'p_hands',lab:'nb_rig_o',labq:'p_ref_top',need:'p_pipes_sea',define:'pm_crack',crack1:'mol_crack',crack2:'pm_crack2',octane:'mol_decane',labc:'p_ref_low',labcq:'p_ref_low',ws43:'p_pipes_sun',ex44:'p_pump_sky',eou4:'p_ref_mid',pastA:'p_pump_head',pastB:'p_pipes_top',pastC:'p_hands',pastD:'p_ref_top',final:'mol_decane',hw:'p_earth_g'},
  palId:{goals:'ember',types:'gold',form:'ember',fields:'gold',burn:'ember',refine:'gold',process:'ember',tower:'gold',order:'navy',uses:'ember',trend:'violet',why:'emerald',lab:'gold',labq:'gold',need:'navy',define:'violet',crack1:'violet',crack2:'violet',octane:'violet',labc:'gold',labcq:'gold',ws43:'gold',ex44:'gold',eou4:'gold',pastA:'gold',pastB:'gold',pastC:'gold',pastD:'gold',final:'navy',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s] */
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], types:[['m_flame',1130,556,100,6,1.0]], form:[['m_mole',40,556,100,-5,1.0]], fields:[['m_star',1130,556,90,6,1.0]], burn:[['m_flame',1130,556,100,6,1.0]],
    refine:[['m_bulb',40,556,100,-5,1.0]], process:[['m_tube',1130,556,100,6,1.0]], tower:[['m_star',40,556,90,-6,1.0]], order:[['m_star',1130,556,90,6,1.0]], uses:[['m_bulb',40,556,100,-5,1.0]],
    trend:[['m_atom',1130,556,100,6,1.0]], why:[['m_mole',1120,552,100,5,1.0]], lab:[['saf_goggles',1070,590,110,-4,1.0]], labq:[['m_tube',40,556,100,-5,1.0]], need:[['m_star',1130,556,90,6,1.0]],
    define:[['m_atom',40,556,100,-5,1.0]], crack1:[['m_flask',1130,556,96,5,1.0]], crack2:[['m_star',40,556,90,-6,1.0]], octane:[['m_bulb',1130,556,100,6,1.0]], labc:[['saf_goggles',1070,590,110,-4,1.0]],
    labcq:[['m_tube',40,556,100,-5,1.0]], ws43:[['n_notes',40,540,120,-5,1.0]], ex44:[['m_flame',1130,556,100,6,1.0]], eou4:[['m_star',1130,556,90,6,1.0]], pastA:[['n_notes',40,540,120,-5,1.0]],
    pastB:[['m_star',1130,556,90,6,1.0]], pastC:[['m_mole',40,556,100,-5,1.0]], pastD:[['m_flame',1130,556,100,6,1.0]], final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
