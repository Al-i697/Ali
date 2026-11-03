/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الترابط وخصائص الفلزات', brand:'الدرس ١-١ · الترابط وخصائص الفلزات', home:'index.html',
  chapters:['الأهداف والتمهيد','التركيب والرابطة الفلزية','خصائص الفلزات','أنشطة','أسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds (the teacher's metal photographs 43 to 49, Nov 2026, plus a live 3D model of the metal lattice):
     - the 3D lattice of positive ions with its free electrons stays behind the slides about the structure and the bond;
     - each property has its own photograph: the pour of molten metal (melting), the smith (malleability), the pylons (conduction), the ore (density);
     - the book questions share the gold-mine photograph; the exam slides and the sorting, comparing and true/false slides use the teacher's second batch of photographs (gears, steel coils, blurred coins, lab, bulb) and two lab photographs from the pool, as decoration.
     The card colour (palId) is picked to break the colour of the picture behind it. */
  bgMap:['p_m_samples','mol_metal','p_m_pour','p_m_samples','p_m_gold_mine','hexes'],
  palCh:['navy','violet','ember','emerald','gold','navy'],
  bgId:{goals:'p_m_smith',pt:'p_m_samples',samples:'p_m_samples',sort:'p_m_gears',
        where:'mol_metal_l',struct:'mol_metal',bond:'mol_metal_l',compare:'p_m_coils',
        dens:'p_m_gold_ore',mpbp:'p_m_pour',malle:'p_m_smith',cond:'p_m_pylons',myth:'p_m_coins',sum:'mol_metal',why:'p_m_pylons',
        lab:'p_m_samples',formula:'p_m_gold_mine',q11:'p_m_gold_mine',q12:'p_m_gold_mine',eou1:'p_m_gold_mine',
        ex1:'p_m_lab',ex2:'p_m_bulb',ex3:'p_glass_lab',ex4:'p_lab_desk',tk:'p_m_pour',hw:'p_m_gold_ore'},
  palId:{goals:'navy',pt:'emerald',samples:'ember',sort:'violet',where:'violet',struct:'violet',bond:'navy',compare:'gold',
         dens:'gold',mpbp:'ember',malle:'emerald',cond:'navy',myth:'ember',sum:'violet',why:'gold',
         lab:'emerald',formula:'navy',q11:'violet',q12:'violet',eou1:'violet',
         ex1:'navy',ex2:'gold',ex3:'emerald',ex4:'navy',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', struct:'.rcard', bond:'.bnote>div', sum:'.rcard', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_atom',1130,556,96,5,1.0]], pt:[['m_flask',40,556,96,-5,1.0]], samples:[['m_bulb',1130,556,96,5,1.0]], sort:[['m_star',40,556,90,-6,1.0]],
    where:[['m_mole',40,556,100,-5,1.0]], struct:[['m_flask',1130,556,96,5,1.0]], bond:[['m_star',1130,556,90,6,1.0]], compare:[['m_atom',40,556,100,-5,1.0]],
    dens:[['m_mole',1120,552,100,5,1.0]], mpbp:[['m_flame',1130,556,100,6,1.0]], malle:[['m_star',40,556,90,-6,1.0]], cond:[['m_bulb',40,556,100,-5,1.0]],
    myth:[['m_flask',1130,556,96,5,1.0]], sum:[['m_trophy',572,566,140,-3,1.0]], why:[['m_star',1130,556,90,6,1.0]], lab:[['saf_goggles',1070,590,110,-4,1.0]],
    formula:[['m_atom',40,556,100,-5,1.0]], q11:[['n_notes',40,540,120,-5,1.0]], q12:[['m_star',1130,556,90,6,1.0]], eou1:[['m_star',40,556,90,-6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
