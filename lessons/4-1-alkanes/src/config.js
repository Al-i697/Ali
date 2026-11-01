/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الألكانات', brand:'الدرس ٤-١ · الألكانات', home:'index.html',
  chapters:['مدخل: الكيمياء العضوية','الهيدروكربونات والألكانات','التسمية والصيغ','الخصائص الفيزيائية','الاحتراق والاستخدامات','السلسلة المتجانسة','أسئلة وامتحانات'],
  bgMap:['u_earth','nb_leaf','nb_rig','u_pump_head','u_ref_mid','u_pipes_sun','u_hands'],   /* one still photograph per chapter (the 'photo' look) */
  palCh:['violet','ember','violet','navy','emerald','violet','ember'],
  bgId:{},
  palId:{},
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
