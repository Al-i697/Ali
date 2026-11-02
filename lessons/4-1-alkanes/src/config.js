/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الألكانات', brand:'الدرس ٤-١ · الألكانات', home:'index.html',
  chapters:['مدخل: الكيمياء العضوية','الهيدروكربونات والألكانات','التسمية والصيغ','الخصائص الفيزيائية','الاحتراق والاستخدامات','السلسلة المتجانسة','أسئلة وامتحانات'],
  /* Backgrounds, chosen by one rule so the deck reads as a whole:
     - a live 3D molecule where the slide is about structure (mol_*: carbon, bonds, names, formulas, boiling points, the family);
     - one of the teacher's high-resolution photographs (p_lab_*, p_pump_*, p_eco_hand, p_refinery...) where the slide talks about the real world:
       the opening, the sources, the uses, burning, and the closing (the cover and the last two slides share the laboratory photograph);
     - the older quiet photographs (p_leaf*, p_table*, p_rig*) behind the exercise and exam slides.
     The card colour (palId) is picked to break the colour of the picture behind it. */
  bgMap:['mol_carbon','mol_methane','mol_propane','mol_chain','mol_burn','mol_family','p_leaf'],
  palCh:['navy','emerald','violet','navy','ember','emerald','gold'],
  bgId:{goals:'p_lab_future',what:'p_lab_desk',carbon:'mol_carbon',bonds:'p_table',q1to4:'p_plants_book',
        hydro:'mol_ethene',alk:'p_pump_blue',
        names:'mol_methane',formula:'mol_pentane',draw:'mol_propane',names2:'p_lab_frame',
        states:'mol_butane',plot:'mol_chain',why:'mol_hexane',exq26:'p_table_v',
        inert:'pm_ethane',burn:'mol_burn',uses2:'p_eco_hand',q89:'p_pump_red',dots:'mol_ethane',
        homol:'mol_family',map:'p_leaf_v',
        ws41:'p_leaf',ws42:'p_refinery',eou:'p_rig_o',past1:'p_rig',past2:'p_leaf_d',final:'p_lab_future',hw:'p_lab_future'},
  palId:{goals:'violet',what:'ember',carbon:'gold',bonds:'ember',q1to4:'violet',
         hydro:'emerald',alk:'violet',
         names:'violet',formula:'violet',draw:'violet',names2:'navy',
         states:'navy',plot:'navy',why:'emerald',exq26:'gold',
         inert:'ember',burn:'ember',uses2:'ember',q89:'navy',dots:'ember',
         homol:'emerald',map:'gold',
         ws41:'gold',ws42:'navy',eou:'navy',past1:'navy',past2:'gold',final:'violet',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', what:'.rcard', carbon:'.col[style*="420px"]>.panel', inert:'.rcard', alk:'.rcard', why:'.rcard', uses2:'.rcard', homol:'.rcard', hw:'.panel.dark li'},
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
