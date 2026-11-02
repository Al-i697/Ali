/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'البترول', brand:'الدرس ٤-٣ · البترول والوقود الأحفوري', home:'index.html',
  chapters:['مدخل: الوقود الأحفوري','التكوّن والاحتراق','التقطير التجزيئي','خصائص المشتقات النفطية','التكسير الحراري','أسئلة وامتحانات'],
  bgMap:['s_pump_blue','s_pump_red','s_tower','s_lab_desk','s_lab_future','s_plants_book'],   /* one still photograph per chapter (the 'photo' look); the teacher's high-resolution set */
  palCh:['violet','emerald','navy','ember','violet','ember'],
  bgId:{goals:'s_eco_hand', form:'s_well_layers', burn:'s_earth_sad', refine:'s_refinery', labc:'s_lab_frame', labcq:'s_lab_frame', ws43:'s_pump_red', ex44:'s_pump_red', eou4:'s_pump_red', final:'s_eco_hand', hw:'s_eco_hand'},
  bgLight:['s_lab_frame'],
  bgDim:['s_well_layers'],
  palId:{goals:'ember', form:'navy', burn:'ember', refine:'violet', labc:'ember', labcq:'ember', ws43:'emerald', ex44:'emerald', eou4:'emerald', final:'ember', hw:'ember'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', types:'.rcard', fields:'.rcard', refine:'.rcard', trend:'.rcard', define:'.rcard', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s] */
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], types:[['m_flame',1130,556,100,6,1.0]], form:[['m_mole',40,556,100,-5,1.0]], fields:[['m_star',1130,556,90,6,1.0]], burn:[['m_flame',1130,556,100,6,1.0]],
    refine:[['m_bulb',40,556,100,-5,1.0]], process:[['m_tube',1130,556,100,6,1.0]], tower:[['m_star',40,556,90,-6,1.0]], order:[['m_star',1130,556,90,6,1.0]], uses:[['m_bulb',40,556,100,-5,1.0]],
    trend:[['m_atom',1130,556,100,6,1.0]], why:[['m_mole',1120,552,100,5,1.0]], lab:[['saf_goggles',1070,590,110,-4,1.0]], labq:[['m_tube',40,556,100,-5,1.0]], need:[['m_star',1130,556,90,6,1.0]],
    define:[['m_atom',40,556,100,-5,1.0]], crack1:[['m_flask',1130,556,96,5,1.0]], crack2:[['m_star',40,556,90,-6,1.0]], octane:[['m_bulb',1130,556,100,6,1.0]], labc:[['saf_goggles',1070,590,110,-4,1.0]],
    labcq:[['m_tube',40,556,100,-5,1.0]], ws43:[['n_notes',40,540,120,-5,1.0]], ex44:[['m_flame',1130,556,100,6,1.0]], eou4:[['m_star',1130,556,90,6,1.0]], pastA:[['n_notes',40,540,120,-5,1.0]],
    pastB:[['m_star',1130,556,90,6,1.0]], pastC:[['m_mole',40,556,100,-5,1.0]], pastD:[['m_flame',1130,556,100,6,1.0]], final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
