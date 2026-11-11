/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
/* click-by-click points: T2 = the blocks of a two-column slide (problem first, then the work area), without feedback lines, hidden reveals, reference chips or nested columns; T1 = the same for a one-column slide */
var PT_T2='.body>div>.col>*:not(.fb):not(.hide):not(.gbar):not(.chips):not(.tkbar):not(.col)', PT_T1='.body>.col.grow>*:not(.fb):not(.hide):not(.chips):not(.arstrip)';
var LESSON={
  short:'حجوم الغازات', brand:'الدرس ٣-٤ · حجوم الغازات', home:'index.html',
  chapters:['مدخل','أفوجادرو والحجم المولي','الحجم والمولات','تفاعلات الغازات فقط','كتلة وغاز في تفاعل','نشاط ٣-٣ (إثرائي)','أسئلة امتحانات','ختام'],
  /* Backgrounds (new look, as in the later lessons): the teacher's photographs mixed freely, each used once in this lesson, with plain palette backgrounds between them because he dislikes repeated pictures. */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c','p_plain_d'],
  palCh:['navy','violet','emerald','gold','ember','navy','gold','emerald'],
  bgId:{goals:'p_atom_formulas',who:'p_plain_a',predict:'p_plain_b',avog:'p_plain_a',rtp:'p_plain_c',tri:'p_plain_d',
        tk1:'p_plain_a',ex1:'p_plain_b',ex2:'p_plain_c',q312:'p_plain_d',q313:'p_plain_a',gasonly:'p_blue_lab',
        shrink:'p_plain_b',matrix:'p_plain_c',q314:'p_plain_d',challenge:'p_molecules_circuit',flow34:'p_plain_a',mgno3:'p_plain_b',
        q315:'p_plain_c',zn:'p_m_zn_cu',lab0:'p_m_lab',lab:'p_plain_d',labq:'p_plain_a',ex34a:'p_plain_b',
        ex34c:'p_plain_c',race:'p_plain_a',ex34b:'p_plain_d',past1:'p_plain_b',past2:'p_plain_a',final:'p_lab_future',
        hw:'p_hands_globe'},
  palId:{who:'gold',predict:'navy',avog:'violet',rtp:'ember',tri:'emerald',ex1:'emerald',ex2:'emerald',q312:'navy',q313:'navy',tk1:'ember',gasonly:'gold',shrink:'violet',matrix:'emerald',q314:'gold',challenge:'ember',flow34:'violet',q315:'ember',zn:'ember',mgno3:'gold',lab0:'navy',lab:'navy',labq:'violet',ex34a:'gold',ex34b:'emerald',ex34c:'violet',race:'ember',past1:'gold',past2:'gold',final:'navy',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  ptsLate:true,   /* points are marked after the card skin (see engine.js) */
  pts:{goals:'.gi',
       predict:PT_T2,
       avog:PT_T2,
       rtp:PT_T2,
       ex1:PT_T2,
       ex2:PT_T2,
       q312:PT_T2,
       q313:PT_T2,
       gasonly:PT_T2,
       matrix:'.sm.onpic, .mx',
       q314:'.frm.brk',
       challenge:PT_T2,
       q315:PT_T2,
       zn:PT_T2,
       mgno3:'.frm.brk',
       lab0:PT_T2,
       ex34a:PT_T2,
       ex34b:PT_T2,
       past1:'.pq',
       past2:'.pq',
       hw:'.panel.dark li'},
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], who:[['m_mole',1110,552,110,5,1.0]], predict:[['m_atom',40,556,100,-5,1.0]],
    avog:[['m_flask',40,556,100,-5,1.0]], rtp:[['m_flame',1130,556,100,6,1.0]], tri:[['m_bulb',1130,556,100,6,1.0]],
    ex1:[['m_star',1130,556,90,6,1.0]], ex2:[['m_tube',40,556,100,-5,1.0]], q312:[['m_atom',1130,556,100,6,1.0]], q313:[['m_star',40,556,90,-6,1.0]],
    tk1:[['m_bulb',44,560,110,-5,1.0],['m_star',1130,560,90,7,1.25]], gasonly:[['m_atom',1130,556,100,6,1.0]], shrink:[['m_tube',40,556,100,-5,1.0]],
    matrix:[['m_star',1130,556,90,6,1.0]], q314:[['m_flask',40,556,100,-5,1.0]], challenge:[['m_flame',1130,556,100,6,1.0]],
    flow34:[['m_mole',1120,552,100,5,1.0]], q315:[['m_flame',40,556,100,-5,1.0]], zn:[['m_tube',1130,556,100,6,1.0]], mgno3:[['m_atom',1130,556,100,6,1.0]],
    lab0:[['saf_goggles',1070,590,110,-4,1.0]], lab:[['m_star',1130,556,90,6,1.0]], labq:[['m_bulb',1130,556,100,6,1.0]],
    ex34a:[['m_tube',40,556,100,-5,1.0]], ex34b:[['m_star',1130,556,90,6,1.0]], ex34c:[['m_flask',1130,556,100,5,1.0]],
    race:[['m_trophy',572,566,140,-3,1.0]], past1:[['n_notes',40,540,120,-5,1.0]], past2:[['m_star',1130,556,90,6,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
