/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'محاليل ومعايرة', brand:'الدرس ٣-٥ · محاليل ومعايرة', home:'index.html',
  chapters:['مدخل','تركيز الكتلة','التركيز المولي','المعايرة','حسابات المعايرة','تطبيقات','الخريطة والامتحانات','ختام'],
  bgMap:['waves','hexes','bubbles','reactions','bonds','organic','periodic','doodles'],
  palCh:['navy','emerald','violet','gold','ember','navy','gold','emerald'],
  bgId:{mix:'bubbles',vocab:'doodles',cg:'hexes',ex37:'hexes',q316:'periodic',tk1:'doodles',cm:'atomic',ex38:'bubbles',ncv:'bubbles',q317:'periodic',ex36:'hexes',tk2:'doodles',what:'organic',tsteps:'waves',lab0:'waves',lab:'bubbles',labq:'doodles',method:'hexes',ex39:'bonds',ex310:'bonds',q318:'reactions',q319:'reactions',q320:'bonds',ws35:'periodic',citric:'organic',na2co3:'bubbles',wsburette:'waves',wsorg:'organic',map:'atomic',q5:'periodic',race:'doodles',past1:'periodic',past2:'hexes',final:'doodles',hw:'bubbles'},
  palId:{mix:'violet',vocab:'gold',cg:'emerald',ex37:'emerald',q316:'navy',tk1:'ember',cm:'violet',ex38:'violet',ncv:'violet',q317:'navy',ex36:'emerald',tk2:'ember',what:'gold',tsteps:'navy',lab0:'navy',lab:'navy',labq:'violet',method:'gold',ex39:'ember',ex310:'ember',q318:'gold',q319:'gold',q320:'ember',ws35:'navy',citric:'violet',na2co3:'emerald',wsburette:'navy',wsorg:'gold',map:'violet',q5:'gold',race:'ember',past1:'gold',past2:'navy',final:'navy',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], mix:[['m_tube',40,556,100,-5,1.0]], vocab:[['m_mole',1110,552,110,5,1.0]],
    cg:[['m_bulb',40,556,100,-5,1.0]], ex37:[['m_star',1130,556,90,6,1.0]], q316:[['m_atom',1130,556,100,6,1.0]],
    tk1:[['m_bulb',44,560,110,-5,1.0],['m_star',1130,560,90,7,1.25]], cm:[['m_flask',1130,556,100,5,1.0]], ex38:[['m_tube',40,556,100,-5,1.0]],
    ncv:[['m_star',40,556,90,-6,1.0]], q317:[['m_atom',40,556,100,-5,1.0]], ex36:[['m_flame',1130,556,100,6,1.0]],
    tk2:[['m_bulb',44,560,110,-5,1.0],['m_star',1130,560,90,7,1.25]], what:[['m_flask',40,556,100,-5,1.0]], tsteps:[['m_tube',1130,556,100,6,1.0]],
    lab0:[['saf_goggles',1070,590,110,-4,1.0]], lab:[['m_star',1130,556,90,6,1.0]], labq:[['m_bulb',1130,556,100,6,1.0]],
    method:[['m_mole',1120,552,100,5,1.0]], ex39:[['m_flame',40,556,100,-5,1.0]], ex310:[['m_atom',1130,556,100,6,1.0]],
    q318:[['m_tube',40,556,100,-5,1.0]], q319:[['m_star',1130,556,90,6,1.0]], q320:[['m_flame',1130,556,100,6,1.0]],
    ws35:[['m_flask',1130,556,100,5,1.0]], citric:[['m_atom',40,556,100,-5,1.0]], na2co3:[['m_tube',1130,556,100,6,1.0]],
    wsburette:[['m_star',40,556,90,-6,1.0]], wsorg:[['m_flask',40,556,100,-5,1.0]], map:[['m_mole',1120,552,100,5,1.0]], q5:[['m_atom',1130,556,100,6,1.0]],
    race:[['m_trophy',572,566,140,-3,1.0]], past1:[['n_notes',40,540,120,-5,1.0]], past2:[['m_star',1130,556,90,6,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
