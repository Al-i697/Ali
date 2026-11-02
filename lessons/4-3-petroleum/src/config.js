/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'البترول', brand:'الدرس ٤-٣ · البترول والوقود الأحفوري', home:'index.html',
  chapters:['مدخل: الوقود الأحفوري','التكوّن والاحتراق','التقطير التجزيئي','خصائص المشتقات النفطية','التكسير الحراري','أسئلة وامتحانات'],
  /* Backgrounds (same rule as lesson 4-1): a live 3D molecule where the slide is about structure or a reaction, one of the teacher's high-resolution photographs
     where it is about the real world, a lab or a question. A photograph is not repeated inside the lesson except the cover/closing pair; the general ones are shared
     with other lessons at most once (see _core/tools/photo_usage.py). The card colour (palId) is picked to break the colour of the picture behind it. */
  bgMap:['p_oil_city','p_earth_sad','p_pipes_refinery','p_glass_lab','mol_crack','p_oil_city'],
  palCh:['violet','emerald','navy','ember','violet','ember'],
  bgId:{goals:'p_oil_city',types:'p_pumps_silhouette',form:'p_hands_globe',fields:'p_platform_sea',burn:'p_earth_sad',refine:'p_tower',
        process:'p_pipes_refinery',tower:'p_pipes_refinery',order:'p_port_tanks',uses:'p_port_tanks',trend:'mol_decane',why:'mol_chain',
        lab:'p_glass_lab',labq:'p_glass_lab',need:'mol_hexane',define:'pm_crack',crack1:'mol_crack',crack2:'mol_crack',
        octane:'mol_decane',labc:'p_crystal_flask',labcq:'p_crystal_flask',ws43:'p_oil_city',ex44:'mol_decane',eou4:'mol_hexane',
        pastA:'mol_crack',pastB:'mol_decane',pastC:'mol_chain',pastD:'p_solar_farm',final:'p_bulb_tree',hw:'p_bulb_tree'},
  palId:{goals:'violet',types:'navy',form:'violet',fields:'violet',burn:'ember',refine:'navy',
        process:'violet',tower:'violet',order:'navy',uses:'navy',trend:'violet',why:'emerald',
        lab:'violet',labq:'violet',need:'navy',define:'violet',crack1:'violet',crack2:'violet',
        octane:'violet',labc:'gold',labcq:'gold',ws43:'navy',ex44:'gold',eou4:'gold',
        pastA:'gold',pastB:'gold',pastC:'gold',pastD:'ember',final:'violet',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', types:'.rcard', fields:'.rcard', refine:'.rcard', trend:'.rcard', define:'.rcard', hw:'.panel.dark li'},
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
