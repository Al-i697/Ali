/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'السبائك', brand:'الدرس ٢-٣ · السبائك', home:'index.html',
  chapters:['الأهداف والتمهيد','تركيب السبيكة','سبائك الحديد (الفولاذ)','سبائك أخرى','نشاط ٢-٢ وتمرين ٢-١','أسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: the teacher's earlier photographs where the slide is about them (metal samples, a blacksmith, gears, steel coils, coins, the Cu/Zn cubes, a circuit for solder, the lab, a pour of molten metal) and plain palette backgrounds elsewhere (he dislikes repeated pictures). */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c'],
  palCh:['navy','ember','gold','emerald','violet','navy','gold'],
  bgId:{goals:'p_plain_b',hook:'p_m_samples',defn:'p_plain_c',
        lay:'p_plain_d',idn:'p_plain_a',why:'p_w_circ2',
        steel:'p_m_smith',t23:'p_m_gears',ss:'p_plain_c',alst:'p_plain_d',steelq:'p_m_coils',cmp:'p_plain_a',
        brass:'p_e_cubes',bronze:'p_m_coins',dur:'p_plain_b',solder:'p_w_circ1',t25:'p_plain_c',t25c:'p_plain_a',
        act22:'p_m_lab',act22q:'p_e_pour',data21:'p_plain_d',ex21:'p_plain_b',
        q215:'p_plain_c',eou4:'p_plain_a',
        ex1:'p_plain_d',ex2:'p_plain_a',ex3:'p_plain_b',tk:'p_w_molten',hw:'p_m_pour'},
  palId:{goals:'navy',hook:'ember',defn:'gold',
         lay:'navy',idn:'violet',why:'emerald',
         steel:'ember',t23:'gold',ss:'violet',alst:'navy',steelq:'emerald',cmp:'gold',
         brass:'gold',bronze:'ember',dur:'navy',solder:'violet',t25:'emerald',t25c:'gold',
         act22:'emerald',act22q:'ember',data21:'navy',ex21:'violet',
         q215:'navy',eou4:'ember',
         ex1:'navy',ex2:'gold',ex3:'ember',tk:'violet',hw:'emerald'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', act22:'.acts li', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s] */
  stk:{
    goals:[['m_atom',1130,556,90,5,1.0]], defn:[['n_notes',40,540,120,-5,1.0]], why:[['m_bulb',1130,556,100,6,1.0]],
    steelq:[['m_star',1130,556,90,6,1.0]], cmp:[['n_notes',40,540,120,-5,1.0]], t25c:[['m_star',1130,556,90,6,1.0]],
    q215:[['n_notes',40,540,120,-5,1.0]], eou4:[['m_star',1130,556,90,6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
