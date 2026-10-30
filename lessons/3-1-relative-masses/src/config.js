/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الكتل النسبية', brand:'الدرس ٣-١ · الكتل النسبية', home:'index.html',
  chapters:['مدخل','لماذا نقيس الكميات؟','الكتلة الذرية النسبية Ar','كتلة الصيغة النسبية Mr','الصيغة من نموذج أو مخطط','نشاط عملي','أسئلة على نمط الامتحان','ختام'],
  bgMap:['atomic','reactions','atomic','bonds','bonds','reactions','periodic','organic'], bgId:{table:'periodic',balance:'periodic',q32:'periodic',final:'reactions'},
  palCh:['navy','emerald','navy','emerald','navy','ember','gold','violet'],
  palId:{imp:'emerald',npk:'ember',shop:'navy',c12:'violet',balance:'gold',q32:'gold',table:'gold',isoH:'violet',iso:'navy',tk1:'ember',race:'ember',tk2:'ember',final:'ember',hw:'violet'},
  /* stickers placed under the content, where the slide has room: [sticker, x, y, width, tilt, entrance delay s] */
  stk:{
    parts:[['m_atom',50,440,230,-6,1.0],['kid_flask',1060,410,140,4,1.25]],
    calc:[['m_tube',40,604,104,-5,1.0]],
    q32:[['m_flask',40,612,96,-5,1.0]],
    table:[['n_carbon',44,520,140,-5,1.0],['n_hhe',230,490,92,6,1.25]],
    iso:[['m_atom',40,588,124,-5,1.0]],
    cl:[['m_star',44,610,92,-8,1.0]],
    mr2:[['m_tube',1128,598,104,6,1.0]],
    race:[['m_trophy',40,550,150,-4,1.0]],
    tk2:[['m_bulb',44,590,120,-5,1.0],['m_star',1110,590,100,8,1.25]],
    models:[['s_mol',60,512,170,-5,1.0]],
    lab:[['m_flame',1010,604,104,5,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1080,560,140,5,1.25]],
    hw:[['n_check',1130,572,104,5,1.0]]
  }
};
