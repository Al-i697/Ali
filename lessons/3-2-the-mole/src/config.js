/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'المول', brand:'الدرس ٣-٢ · المول', home:'index.html',
  chapters:['مدخل','تمهيد: كيف نعدّ الأشياء الكثيرة؟','المول وعدد أفوجادرو','الكتلة المولية','حسابات المول','تمارين وتدريب','أسئلة على نمط الامتحان','ختام'],
  bgMap:['atomic','reactions','atomic','periodic','bonds','reactions','periodic','organic'],
  palCh:['violet','navy','violet','gold','emerald','ember','gold','navy'],
  bgId:{graphite:'atomic',weigh:'periodic',avo:'bonds',act31:'reactions',tbl33a:'bonds',tbl33b:'bonds',q37:'organic',final:'reactions'},
  palId:{weigh:'gold',graphite:'navy',units:'navy',mole:'violet',single:'violet',ways:'violet',formula:'gold',t34a:'gold',t34b:'gold',avo:'gold',tk1:'ember',
         ar:'emerald',ex31:'emerald',q35:'emerald',q36:'navy',q37:'violet',chain:'emerald',act31:'ember',tbl33a:'navy',tbl33b:'navy',race:'ember',tk2:'ember',
         past1:'gold',past2:'gold',final:'ember',hw:'violet'},
  /* stickers placed under the content, where the slide has room: [sticker, x, y, width, tilt, entrance delay s] */
  stk:{
    goals:[['m_mole',40,505,190,-4,1.0],['m_flask',250,572,120,7,1.25],['m_star',372,612,86,-10,1.5]],
    weigh:[['m_tube',44,612,92,-6,1.0]],
    units:[['atom',1120,570,118,8,1.0]],
    mole:[['m_mole',1086,572,128,5,1.0]],
    chain:[['m_atom',46,520,140,-5,1.0]],
    act31:[['m_flame',44,606,104,-4,1.0]],
    race:[['m_trophy',572,566,140,-3,1.0]],
    tk2:[['m_bulb',44,606,104,-5,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25],['m_star',262,624,84,-8,1.5]]
  }
};
