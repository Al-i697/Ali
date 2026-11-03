/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الفلزات القلوية', brand:'الدرس ١-٣ · الفلزات القلوية', home:'index.html',
  chapters:['الأهداف والتمهيد','المجموعة I وخصائصها','التدرّج في الخصائص','التفاعل مع الماء','المعادلات','أنشطة وأسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: the teacher's photographs mixed freely (he asked for it, Nov 2026): a picture does not have to match its slide. */
  bgMap:['p_periodic_neon','p_m_samples','p_m_pour','p_glass_lab','p_lab_equations','p_m_smith','p_blue_lab'],
  palCh:['navy','violet','gold','emerald','navy','ember','navy'],
  bgId:{goals:'p_periodic_neon',prior:'p_atom_formulas',lead:'p_periodic_purple',
        atoms:'p_atom_bubbles',props:'p_m_samples',store:'p_m_gears',compare:'p_m_coils',
        dens:'p_m_gold_ore',mp:'p_m_pour',predict:'p_m_bulb',apply:'p_lab_desk',
        act:'p_blue_lab',lab:'p_glass_lab',actq:'p_crystal_flask',water:'p_molecules_circuit',
        formula:'p_lab_equations',balance:'p_lab_future',ladder:'p_m_lab',myth:'p_m_coins',sum:'mol_metal',
        q79:'p_m_smith',q1013:'p_m_gold_mine',ex11:'p_m_pylons',ws1:'p_lab_desk',ws2:'p_m_samples',eou3:'p_m_gears',
        ex1:'p_blue_lab',ex2:'p_m_gold_ore',ex3:'p_glass_lab',ex4:'p_atom_bubbles',tk:'p_m_pour',hw:'p_periodic_neon'},
  palId:{goals:'navy',prior:'ember',lead:'emerald',atoms:'gold',props:'violet',store:'navy',compare:'emerald',
         dens:'violet',mp:'emerald',predict:'violet',apply:'gold',act:'ember',lab:'violet',actq:'gold',water:'ember',
         formula:'navy',balance:'violet',ladder:'gold',myth:'ember',sum:'violet',
         q79:'emerald',q1013:'violet',ex11:'gold',ws1:'violet',ws2:'ember',eou3:'navy',
         ex1:'navy',ex2:'gold',ex3:'emerald',ex4:'violet',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', props:'.rcard', act:'.acts li', sum:'.rcard', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_atom',1130,556,96,5,1.0]], prior:[['m_star',40,556,90,-6,1.0]], lead:[['m_flask',40,556,96,-5,1.0]], atoms:[['m_star',1130,556,90,6,1.0]],
    props:[['m_atom',1130,556,96,5,1.0]], store:[['m_flame',40,556,100,-5,1.0]], compare:[['m_star',1130,556,90,6,1.0]], dens:[['m_mole',1120,552,100,5,1.0]],
    mp:[['m_flame',40,556,100,-5,1.0]], predict:[['m_star',1130,556,90,6,1.0]], apply:[['m_bulb',40,556,100,-5,1.0]],
    lab:[['saf_goggles',40,590,110,-4,1.0]], actq:[['m_star',1130,556,90,6,1.0]], water:[['m_flame',1130,556,100,6,1.0]], formula:[['m_atom',40,556,100,-5,1.0]],
    balance:[['m_flask',1130,556,96,5,1.0]], ladder:[['m_star',40,556,90,-6,1.0]], myth:[['m_flask',1130,556,96,5,1.0]], sum:[['m_trophy',572,566,140,-3,1.0]],
    q79:[['n_notes',40,540,120,-5,1.0]], q1013:[['m_star',1130,556,90,6,1.0]], ex11:[['n_notes',40,540,120,-5,1.0]], ws1:[['n_notes',40,540,120,-5,1.0]],
    ws2:[['m_star',1130,556,90,6,1.0]], eou3:[['m_star',40,556,90,-6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
