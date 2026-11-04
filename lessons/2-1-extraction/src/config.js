/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'استخلاص الفلزات', brand:'الدرس ٢-١ · استخلاص الفلزات', home:'index.html',
  chapters:['الأهداف والتمهيد','الفلزات في الطبيعة','طرق الاستخلاص','الكربون والاختزال','نشاط ٢-١','إعادة التدوير','أسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: the teacher's new photographs (Nov 2026) once each, and plain palette backgrounds elsewhere, because he dislikes repeated pictures. */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c','p_plain_d'],
  palCh:['navy','gold','emerald','ember','violet','navy','emerald','navy'],
  bgId:{goals:'p_e_sunset',hook:'p_e_ptable',natural:'p_e_malachite',minerals:'p_plain_b',tbl21:'p_plain_c',cmpd:'p_plain_a',
        tbl22:'p_plain_d',electro:'p_e_electrolysis',method:'p_plain_b',
        roast:'p_plain_c',reduce:'p_e_pour',redox:'p_plain_a',whyc:'p_e_cubes',co:'p_plain_d',
        act21:'p_e_blue_lab',lab21:'p_plain_b',res21:'p_plain_c',
        recyc:'p_plain_a',alst:'p_plain_d',magnet:'p_plain_b',
        q21:'p_plain_c',q25:'p_plain_a',eou:'p_plain_d',
        ex1:'p_plain_b',ex2:'p_plain_c',ex3:'p_plain_a',ex4:'p_plain_d',tk:'p_plain_d',hw:'p_plain_a'},
  palId:{goals:'navy',hook:'violet',natural:'emerald',minerals:'gold',tbl21:'navy',cmpd:'ember',
         tbl22:'violet',electro:'ember',method:'emerald',
         roast:'gold',reduce:'navy',redox:'ember',whyc:'emerald',co:'violet',
         act21:'navy',lab21:'emerald',res21:'gold',
         recyc:'emerald',alst:'navy',magnet:'ember',
         q21:'gold',q25:'violet',eou:'emerald',
         ex1:'navy',ex2:'gold',ex3:'ember',ex4:'violet',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', act21:'.acts li', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_atom',1130,556,90,5,1.0]], natural:[['m_star',40,556,90,-6,1.0]], minerals:[['n_notes',40,540,120,-5,1.0]],
    tbl21:[['m_flask',1130,556,96,6,1.0]], roast:[['m_flame',40,556,100,-5,1.0]], reduce:[['m_flame',1130,556,100,6,1.0]],
    whyc:[['m_star',1130,556,90,6,1.0]], recyc:[['m_trophy',1090,550,120,5,1.0]], q21:[['n_notes',40,540,120,-5,1.0]], q25:[['m_star',1130,556,90,6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
