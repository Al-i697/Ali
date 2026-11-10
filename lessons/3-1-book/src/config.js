/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الكتل النسبية', brand:'الدرس ٣-١ · الكتل النسبية (من الكتاب)', home:'index.html',
  chapters:['مدخل','لماذا نقيس الكميات؟','الكتلة الذرية النسبية Ar','كتلة الصيغة النسبية Mr','نشاط ٣-١','الصيغة من نموذج أو مخطط','تطبيقات وأسئلة الكتاب','امتحانات سابقة','ختام'],
  /* Backgrounds (new look, as in the later lessons): the teacher's photographs mixed freely, each used once in this lesson, with plain palette backgrounds between them because he dislikes repeated pictures. */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a'],
  palCh:['navy','emerald','navy','emerald','ember','navy','gold','ember','violet'],
  bgId:{goals:'p_atom_formulas',imp:'p_plain_a',tiny:'p_plain_b',parts:'p_plain_c',c12:'p_plain_d',calc:'p_blue_lab',
        balance:'p_plain_a',iso:'p_plain_b',cl:'p_plain_c',table:'p_periodic_purple',tk1:'p_plain_d',types:'p_plain_a',mr:'p_plain_b',mr2:'p_plain_c',mr3:'p_plain_d',
        tk2:'p_molecules_circuit',lab:'p_plain_a',models:'p_plain_b',lattice:'p_plain_c',npk:'p_plain_d',q31:'p_crystal_flask',q32:'p_plain_a',race:'p_plain_b',
        ex31a:'p_plain_c',ex31b:'p_plain_d',eou1:'p_plain_a',past1:'p_lab_desk',past2:'p_plain_b',final:'p_lab_future',hw:'p_bulb_tree'},
  palId:{eou1:'gold',imp:'emerald',npk:'ember',tiny:'navy',c12:'violet',balance:'gold',q32:'gold',table:'gold',iso:'navy',tk1:'ember',race:'ember',tk2:'ember',final:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', hw:'.panel.dark li'},
  /* stickers placed under the content, where the slide has room: [sticker, x, y, width, tilt, entrance delay s] */
  stk:{
    goals:[['m_star',1130,556,90,6,1.0]],
    imp:[['m_flask',40,556,100,-5,1.0]],
    npk:[['m_star',1130,556,90,6,1.0]],
    tiny:[['m_mole',1120,552,100,5,1.0]],
    parts:[['m_atom',50,440,230,-6,1.0],['kid_flask',1060,410,140,4,1.25]],
    c12:[['m_tube',40,556,100,-5,1.0]],
    balance:[['m_star',1130,556,90,6,1.0]],
    calc:[['m_tube',40,604,104,-5,1.0]],
    q32:[['m_flask',40,612,96,-5,1.0]],
    table:[['n_carbon',44,520,140,-5,1.0],['n_hhe',230,490,92,6,1.25]],
    iso:[['m_atom',40,588,124,-5,1.0]],
    cl:[['m_star',44,610,92,-8,1.0]],
    tk1:[['m_bulb',44,560,110,-5,1.0]],
    types:[['m_flask',1130,556,100,5,1.0]],
    mr:[['m_star',40,556,90,-6,1.0]],
    mr2:[['m_tube',1128,598,104,6,1.0]],
    mr3:[['m_flame',40,556,96,-5,1.0]],
    ex31a:[['m_star',1130,556,90,6,1.0]],
    race:[['m_trophy',40,550,150,-4,1.0]],
    tk2:[['m_bulb',44,590,120,-5,1.0],['m_star',1110,590,100,8,1.25]],
    models:[['s_mol',60,512,170,-5,1.0]],
    lattice:[['m_atom',40,556,110,-5,1.0]],
    q31:[['m_star',1130,556,90,6,1.0]],
    ex31b:[['m_tube',1130,556,100,6,1.0]],
    lab:[['saf_goggles',1000,606,110,-4,1.0],['m_flame',1140,606,100,5,1.25]],
    past1:[['n_notes',40,540,120,-5,1.0]],
    past2:[['m_star',1130,556,90,6,1.0]],
    final:[['sci_pipette',50,470,190,-3,1.0],['m_trophy',1080,560,140,5,1.25]],
    hw:[['n_check',1130,572,104,5,1.0]]
  }
};
