/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'إنتاج الحديد والفولاذ', brand:'الدرس ٢-٢ · إنتاج الحديد والفولاذ', home:'index.html',
  chapters:['الأهداف والتمهيد','الفرن العالي','تفاعلات الفرن','صناعة الفولاذ','ورقة العمل ٢-١','أسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: the teacher's circuit and molten-metal pictures once each (Nov 2026), the template frames he sent fill their own slides, and plain palette backgrounds elsewhere (he dislikes repeated pictures). */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c'],
  palCh:['navy','gold','ember','emerald','violet','gold','navy'],
  bgId:{goals:'p_w_circ1',title:'p_plain_d',roadmap:'p_plain_a',charge:'p_plain_b',anatomy:'p_plain_c',heat:'p_w_circ3',
        zones:'p_plain_a',zq:'p_plain_b',lad:'p_plain_c',co:'p_plain_d',slag:'p_plain_a',
        pig:'p_w_molten',bop:'p_plain_b',impur:'p_w_split',alloy:'p_plain_a',steels:'p_plain_d',journey:'p_w_circ2',
        ws21:'p_plain_c',ws21q2:'p_plain_a',ws21q3:'p_plain_b',
        q29:'p_plain_d',q212:'p_plain_c',eou2:'p_plain_a',eou3:'p_plain_b',
        ex1:'p_plain_c',ex2:'p_plain_d',ex3:'p_plain_a',ex4:'p_plain_b',tk:'p_plain_d',hw:'p_plain_a'},
  palId:{goals:'navy',title:'ember',roadmap:'gold',charge:'emerald',anatomy:'navy',heat:'emerald',
         zones:'ember',zq:'gold',lad:'violet',co:'violet',slag:'ember',
         pig:'ember',bop:'navy',impur:'gold',alloy:'emerald',steels:'violet',journey:'navy',
         ws21:'navy',ws21q2:'gold',ws21q3:'emerald',
         q29:'gold',q212:'violet',eou2:'emerald',eou3:'ember',
         ex1:'navy',ex2:'gold',ex3:'ember',ex4:'violet',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_atom',1130,556,90,5,1.0]], lad:[['m_flask',1130,556,96,6,1.0]], alloy:[['m_star',1130,556,90,6,1.0]],
    q29:[['n_notes',40,540,120,-5,1.0]], q212:[['m_star',1130,556,90,6,1.0]], eou2:[['n_notes',40,540,120,-5,1.0]], eou3:[['m_star',1130,556,90,6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
