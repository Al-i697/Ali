/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'نشاط الفلزات', brand:'الدرس ١-٤ · نشاط الفلزات', home:'index.html',
  chapters:['الأهداف والتمهيد','سلسلة النشاط الكيميائي','الماء والبخار والحمض','الإزاحة والأكاسيد والكربون','الإزاحة في المحاليل','المعادلات','أنشطة وأسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: the teacher's photographs mixed freely (he asked for it, Nov 2026): a picture does not have to match its slide. */
  bgMap:['p_lab_pipettes','p_m_k_na_mg','p_glass_lab','p_m_gears','p_m_zn_cu','p_lab_equations','p_m_smith','p_blue_lab'],
  palCh:['navy','gold','emerald','ember','violet','navy','emerald','navy'],
  bgId:{goals:'p_lab_pipettes',prior:'p_atom_formulas',hist:'p_m_smith',series:'p_m_k_na_mg',chh:'p_periodic_purple',
        tbl14:'p_blue_lab',cold:'p_glass_lab',steam:'p_m_pour',act12:'p_lab_desk',lab12:'p_m_lab',acid:'p_crystal_flask',
        disp:'p_m_gears',oxtab:'p_molecules_circuit',carbon:'p_m_coils',gap:'p_m_pylons',
        act14:'p_m_samples',lab14:'p_m_bulb',act14c:'p_m_gold_mine',tbl16:'p_m_coins',zncu:'p_m_zn_cu',ionic:'p_atom_bubbles',
        ladder4:'p_lab_future',balance4:'p_lab_equations',
        act13:'p_m_gold_ore',q1417:'mol_metal',q1820:'p_periodic_neon',ex12:'p_m_samples',ex13:'p_lab_future',ws13:'p_m_smith',ws14:'p_m_pylons',eou2:'p_crystal_flask',eou5:'p_m_lab',
        ex1:'p_blue_lab',ex2:'p_m_gold_ore',ex3:'p_glass_lab',ex4:'p_atom_bubbles',tk:'p_m_pour',hw:'p_m_k_na_mg'},
  palId:{goals:'navy',prior:'ember',hist:'gold',series:'violet',chh:'emerald',
         tbl14:'navy',cold:'emerald',steam:'ember',act12:'gold',lab12:'violet',acid:'navy',
         disp:'emerald',oxtab:'gold',carbon:'violet',gap:'ember',
         act14:'navy',lab14:'emerald',act14c:'gold',tbl16:'violet',zncu:'ember',ionic:'navy',
         ladder4:'gold',balance4:'violet',
         act13:'ember',q1417:'navy',q1820:'emerald',ex12:'gold',ex13:'violet',ws13:'navy',ws14:'ember',eou2:'emerald',eou5:'gold',
         ex1:'navy',ex2:'gold',ex3:'emerald',ex4:'violet',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', act12:'.acts li', act14:'.acts li', act13:'.acts li', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_atom',1130,556,90,5,1.0]], prior:[['m_star',40,556,90,-6,1.0]], hist:[['m_flame',1130,556,100,6,1.0]],
    chh:[['m_star',1130,556,90,6,1.0]], disp:[['m_flask',40,556,96,-5,1.0]], carbon:[['m_flame',40,556,100,-5,1.0]],
    zncu:[['m_star',40,556,90,-6,1.0]], ionic:[['n_notes',40,540,120,-5,1.0]], q1417:[['n_notes',40,540,120,-5,1.0]], q1820:[['m_star',1130,556,90,6,1.0]],
    ex12:[['n_notes',40,540,120,-5,1.0]], ws13:[['m_bulb',40,556,100,-5,1.0]], eou2:[['m_star',1130,556,90,6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
