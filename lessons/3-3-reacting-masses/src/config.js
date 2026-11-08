/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'كتل متفاعلة', brand:'الدرس ٣-٣ · كتل متفاعلة', home:'index.html',
  chapters:['مدخل','ماذا لو كان؟','استنباط الصيغة الكيميائية','المادة المحددة والفائضة','الكتلة من المعادلة','نشاط عملي (إثرائي)','تمارين وتدريب','أسئلة على نمط الامتحان','ختام'],
  /* Backgrounds (new look, as in the later lessons): the teacher's photographs mixed freely, each used once in this lesson, with plain palette backgrounds between them because he dislikes repeated pictures. */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a'],
  palCh:['emerald','gold','navy','ember','violet','navy','ember','gold','emerald'],
  bgId:{goals:'p_lab_equations',sand1:'p_plain_a',sand2:'p_plain_b',steps3:'p_plain_a',mgo:'p_plain_c',sio2:'p_plain_a',
        noo:'p_plain_d',bacl:'p_plain_a',tk1:'p_plain_b',si6:'p_molecules_circuit',conserve:'p_plain_c',fes:'p_m_samples',
        rule:'p_plain_d',cuo:'p_m_pour',fe48:'p_plain_a',ag:'p_glass_lab',parts:'p_plain_b',cls:'p_plain_c',
        tk2:'p_plain_d',scaleup:'p_periodic_purple',prop:'p_plain_a',method:'p_plain_c',ex32:'p_plain_b',ex33:'p_plain_c',
        q38:'p_plain_d',q39:'p_lab_pipettes',eou3:'p_plain_a',solv:'p_plain_b',lab:'p_lab_desk',labcalc:'p_plain_c',
        race:'p_plain_a',past1:'p_e_blue_lab',past2:'p_plain_d',final:'p_atom_bubbles',hw:'p_bulb_tree'},
  palId:{eou3:'gold',bacl:'violet',conserve:'ember',prop:'emerald',goals:'emerald',sand1:'gold',sand2:'ember',steps3:'navy',mgo:'navy',sio2:'violet',noo:'gold',tk1:'ember',si6:'ember',fes:'ember',rule:'gold',cuo:'violet',fe48:'ember',ag:'navy',parts:'emerald',cls:'gold',tk2:'ember',scaleup:'emerald',method:'violet',ex32:'violet',ex33:'violet',q38:'navy',q39:'navy',solv:'gold',lab:'navy',labcalc:'navy',race:'ember',past1:'gold',past2:'gold',final:'ember',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    bacl:[['m_flask',1130,556,100,5,1.0]], conserve:[['m_flame',40,556,100,-5,1.0]], prop:[['m_tube',1130,556,100,6,1.0]],
    sand1:[['m_flask',1130,556,100,5,1.0]], sand2:[['m_star',1130,556,90,6,1.0]], steps3:[['m_tube',1130,556,100,6,1.0]],
    mgo:[['m_flame',40,556,100,-5,1.0]], sio2:[['n_crystal',40,540,110,-5,1.0]], noo:[['m_atom',40,556,100,-5,1.0]], tk1:[['m_bulb',44,560,110,-5,1.0],['m_star',1130,560,90,7,1.25]],
    si6:[['m_star',1130,556,90,6,1.0]], fes:[['s_fe',40,540,110,-5,1.0]], rule:[['m_bulb',40,556,100,-5,1.0]], cuo:[['m_tube',1130,556,100,6,1.0]], fe48:[['n_hhe',40,500,90,-5,1.0]],
    ag:[['m_flask',1130,556,100,5,1.0]], parts:[['m_atom',1130,556,100,6,1.0]], cls:[['m_trophy',1130,540,110,5,1.0]], tk2:[['m_bulb',44,606,104,-5,1.0]],
    scaleup:[['m_flame',40,556,100,-5,1.0]], method:[['m_mole',1120,552,100,5,1.0]], ex32:[['m_flask',40,556,100,-5,1.0]], ex33:[['m_flame',1130,556,96,6,1.0]],
    q38:[['m_star',1130,556,90,6,1.0]], q39:[['m_tube',40,556,100,-5,1.0]], solv:[['m_atom',40,556,100,-5,1.0]],
    lab:[['saf_goggles',1060,600,110,-4,1.0]], labcalc:[['m_star',1130,556,90,6,1.0]], race:[['m_trophy',572,566,140,-3,1.0]],
    past1:[['n_notes',40,540,120,-5,1.0]], past2:[['m_star',1130,556,90,6,1.0]], final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
