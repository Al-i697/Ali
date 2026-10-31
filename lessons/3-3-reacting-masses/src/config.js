/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'كتل متفاعلة', brand:'الدرس ٣-٣ · كتل متفاعلة', home:'index.html',
  chapters:['مدخل','ماذا لو كان؟','استنباط الصيغة الكيميائية','المادة المحددة والفائضة','الكتلة من المعادلة','نشاط عملي (إثرائي)','تمارين وتدريب','أسئلة على نمط الامتحان','ختام'],
  bgMap:['hexes','bubbles','doodles','waves','atomic','bubbles','bonds','periodic','doodles'],
  palCh:['emerald','gold','navy','ember','violet','navy','ember','gold','emerald'],
  bgId:{eou3:'bonds',bacl:'organic',conserve:'reactions',prop:'periodic',sand2:'bubbles',mgo:'reactions',sio2:'atomic',noo:'periodic',tk1:'doodles',si6:'waves',fes:'reactions',rule:'hexes',cuo:'waves',fe48:'bonds',ag:'bubbles',parts:'atomic',cls:'doodles',tk2:'doodles',scaleup:'reactions',method:'hexes',ex32:'bonds',ex33:'bonds',q38:'waves',q39:'periodic',solv:'organic',lab:'bubbles',labcalc:'waves',race:'doodles',past2:'hexes',final:'doodles',hw:'bubbles'},
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
