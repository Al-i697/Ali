/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'العناصر الانتقالية', brand:'الدرس ١-٢ · العناصر الانتقالية', home:'index.html',
  chapters:['الأهداف والتمهيد','الموقع والخصائص','المركّبات الملوّنة','الحفّازات والاستخدامات','أنشطة وأسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: the teacher's photographs (Nov 2026) are used as decoration, a picture does not have to match its slide.
     The first batch (43 to 49) was used in 1-1: here only a few of them come back (smith, gold mine, samples, pylons, gold ore, pour), one slide each.
     New in this lesson: the bulb filament, the gears, the steel coils, the colourful lab and the coins (blurred on purpose: the coin legends stay unreadable).
     The card colour (palId) is picked to break the colour of the picture behind it. */
  bgMap:['p_periodic_neon','p_m_gears','p_crystal_flask','p_molecules_circuit','p_m_gold_mine','p_m_lab'],
  palCh:['navy','violet','navy','ember','gold','navy'],
  bgId:{goals:'p_periodic_neon',prior:'mol_metal',where:'p_periodic_purple',group:'p_m_coins',
        props:'p_m_gears',sort:'p_m_lab',mp:'p_m_bulb',uses:'p_m_coils',who:'p_m_smith',
        white:'p_crystal_flask',ions:'p_atom_bubbles',fe:'p_lab_equations',naoh:'p_glass_lab',
        cat:'p_molecules_circuit',catm:'p_pipes_refinery',myth:'p_blue_lab',sum:'mol_metal_l',
        ws:'p_lab_future',q13:'p_m_gold_mine',eou4:'p_m_samples',
        ex1:'p_lab_desk',ex2:'p_m_pylons',ex3:'p_m_gold_ore',ex4:'p_atom_formulas',tk:'p_m_pour',hw:'p_periodic_neon'},
  palId:{goals:'navy',prior:'violet',where:'emerald',group:'navy',
         props:'violet',sort:'gold',mp:'emerald',uses:'ember',who:'violet',
         white:'ember',ions:'navy',fe:'gold',naoh:'violet',
         cat:'emerald',catm:'gold',myth:'ember',sum:'violet',
         ws:'ember',q13:'violet',eou4:'navy',
         ex1:'navy',ex2:'gold',ex3:'emerald',ex4:'navy',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', group:'.rcard', props:'.rcard', uses:'.rcard', sum:'.rcard', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_atom',1130,556,96,5,1.0]], prior:[['m_star',40,556,90,-6,1.0]], where:[['m_flask',40,556,96,-5,1.0]], group:[['m_mole',1130,556,100,5,1.0]],
    props:[['m_atom',1130,556,96,5,1.0]], sort:[['m_star',40,556,90,-6,1.0]], mp:[['m_flame',40,556,100,-5,1.0]], uses:[['m_bulb',1130,556,100,6,1.0]],
    who:[['m_star',1130,556,90,6,1.0]], white:[['m_flask',1130,556,96,5,1.0]], ions:[['m_tube',40,556,96,-5,1.0]], fe:[['m_atom',40,556,100,-5,1.0]],
    naoh:[['saf_goggles',1070,590,110,-4,1.0]], cat:[['m_flame',1130,556,100,6,1.0]], catm:[['m_star',40,556,90,-6,1.0]], myth:[['m_flask',1130,556,96,5,1.0]],
    sum:[['m_trophy',572,566,140,-3,1.0]], ws:[['n_notes',40,540,120,-5,1.0]], q13:[['n_notes',40,540,120,-5,1.0]], eou4:[['m_star',1130,556,90,6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
