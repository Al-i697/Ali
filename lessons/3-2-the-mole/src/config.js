/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'المول', brand:'الدرس ٣-٢ · المول', home:'index.html',
  chapters:['مدخل','تمهيد: كيف نعدّ الأشياء الكثيرة؟','المول وعدد أفوجادرو','الكتلة المولية','حسابات المول','تمارين وتدريب','أسئلة على نمط الامتحان','ختام'],
  /* Backgrounds (new look, as in the later lessons): the teacher's photographs mixed freely, each used once in this lesson, with plain palette backgrounds between them because he dislikes repeated pictures. */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c','p_plain_d'],
  palCh:['violet','navy','violet','gold','emerald','ember','gold','navy'],
  bgId:{goals:'p_atom_bubbles',count:'p_plain_a',weigh:'p_m_coins',graphite:'mol_carbon',units:'p_plain_b',mole:'p_molecules_circuit',
        single:'p_plain_c',ways:'p_plain_a',formula:'p_plain_d',t34a:'p_plain_b',t34b:'p_plain_a',avo:'p_plain_c',
        tk1:'p_plain_b',ar:'p_glass_lab',ex31:'p_plain_c',q35:'p_plain_d',q36:'p_lab_pipettes',q37:'p_plain_a',
        chain:'p_plain_b',act31:'p_m_lab',tbl33a:'p_plain_b',tbl33b:'p_plain_c',race:'p_plain_a',tk2:'p_plain_d',
        eou2:'p_plain_a',past1:'p_lab_desk',past2:'p_plain_b',final:'p_crystal_flask',hw:'p_hands_globe'},
  palId:{eou2:'gold',weigh:'gold',graphite:'navy',units:'navy',mole:'violet',single:'violet',ways:'violet',formula:'gold',t34a:'gold',t34b:'gold',avo:'gold',tk1:'ember',
         ar:'emerald',ex31:'emerald',q35:'emerald',q36:'navy',q37:'violet',chain:'emerald',act31:'ember',tbl33a:'navy',tbl33b:'navy',race:'ember',tk2:'ember',
         past1:'gold',past2:'gold',final:'ember',hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', hw:'.panel.dark li'},
  /* stickers placed under the content, where the slide has room: [sticker, x, y, width, tilt, entrance delay s] */
  stk:{
    goals:[['m_mole',40,505,190,-4,1.0],['m_flask',250,572,120,7,1.25],['m_star',372,612,86,-10,1.5]],
    count:[['m_flask',1130,556,110,5,1.0]],
    weigh:[['m_tube',44,612,92,-6,1.0]],
    graphite:[['m_atom',40,552,120,-5,1.0]],
    units:[['atom',1120,570,118,8,1.0]],
    mole:[['m_mole',1086,572,128,5,1.0]],
    single:[['m_star',1140,556,100,6,1.0]],
    ways:[['m_bulb',40,556,110,-5,1.0]],
    formula:[['m_tube',1140,556,100,6,1.0]],
    t34a:[['s_fe',40,520,110,-5,1.0]],
    t34b:[['n_carbon',40,520,110,-5,1.0]],
    avo:[['m_mole',40,552,110,-4,1.0]],
    tk1:[['m_bulb',44,560,110,-5,1.0],['m_star',1130,560,90,7,1.25]],
    ar:[['m_flask',1130,556,100,5,1.0]],
    ex31:[['m_tube',40,556,100,-5,1.0]],
    q35:[['m_star',1130,556,90,6,1.0]],
    q36:[['m_atom',40,556,100,-5,1.0]],
    q37:[['m_flame',1130,556,96,6,1.0]],
    chain:[['m_atom',46,520,140,-5,1.0]],
    act31:[['m_flame',44,606,104,-4,1.0]],
    tbl33a:[['m_mole',1130,560,96,5,1.0]],
    tbl33b:[['m_star',40,560,90,-6,1.0]],
    race:[['m_trophy',572,566,140,-3,1.0]],
    tk2:[['m_bulb',44,606,104,-5,1.0]],
    past1:[['n_notes',40,540,120,-5,1.0]],
    past2:[['m_star',1130,556,90,6,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25],['m_star',262,624,84,-8,1.5]],
    hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
