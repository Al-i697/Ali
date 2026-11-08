/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'تآكل الفلزات وحمايتها', brand:'الدرس ٢-٤ · تآكل الفلزات وحمايتها', home:'index.html',
  chapters:['الأهداف والتمهيد','الصدأ وشروطه','طرق منع الصدأ','الألومنيوم','نشاط ٢-٣','ورقة العمل وأسئلة الكتاب','امتحانات وتقويم'],
  /* Backgrounds: three of the teacher's earlier pictures (an offshore platform, steel pylons, pipes) where the slide is about them, and plain palette backgrounds elsewhere (he dislikes repeated pictures). */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c'],
  palCh:['navy','ember','gold','emerald','violet','navy','gold'],
  bgId:{goals:'p_plain_b',hook:'p_platform_sea',terms:'p_plain_c',rust:'p_plain_a',tubes:'p_plain_d',speed:'p_plain_b',ws22a:'p_plain_c',
        barrier:'p_plain_a',galv:'p_m_pylons',galvlad:'p_plain_d',scratch:'p_plain_b',sacr:'p_pipes_refinery',sacrq:'p_plain_c',cmp:'p_plain_a',
        al1:'p_plain_d',al2:'p_plain_b',act23:'p_plain_a',lab23:'p_plain_c',
        ws22b:'p_plain_d',ws22c:'p_plain_b',q220:'p_plain_a',eou5:'p_plain_c',
        ex1:'p_plain_d',ex2:'p_plain_a',ex3:'p_plain_b',ex4:'p_plain_c',ex5:'p_plain_d',tk:'p_plain_a',hw:'p_plain_b'},
  palId:{goals:'navy',hook:'ember',terms:'gold',rust:'ember',tubes:'navy',speed:'gold',ws22a:'violet',
         barrier:'gold',galv:'emerald',galvlad:'violet',scratch:'ember',sacr:'navy',sacrq:'gold',cmp:'violet',
         al1:'emerald',al2:'navy',act23:'violet',lab23:'emerald',
         ws22b:'navy',ws22c:'gold',q220:'ember',eou5:'emerald',
         ex1:'navy',ex2:'gold',ex3:'ember',ex4:'violet',ex5:'emerald',tk:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', act23:'.acts li', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s] */
  stk:{
    goals:[['m_atom',1130,556,90,5,1.0]], terms:[['n_notes',40,540,120,-5,1.0]], rust:[['m_flask',1130,556,96,6,1.0]],
    barrier:[['m_star',1130,556,90,6,1.0]], sacrq:[['m_star',1130,556,90,6,1.0]], al2:[['m_bulb',1130,556,100,6,1.0]],
    q220:[['n_notes',40,540,120,-5,1.0]], eou5:[['m_star',1130,556,90,6,1.0]],
    ex1:[['n_notes',40,540,120,-5,1.0]], ex2:[['m_star',1130,556,90,6,1.0]], ex3:[['m_bulb',1130,556,100,6,1.0]], ex4:[['n_notes',40,540,120,-5,1.0]], ex5:[['m_star',1130,556,90,6,1.0]],
    tk:[['kids_duo',50,486,200,-3,1.0]], hw:[['m_trophy',1090,550,140,5,1.0]]
  }
};
