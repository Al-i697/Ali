/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الألكينات', brand:'الدرس ٤-٢ · الألكينات وتفاعلات الإضافة', home:'index.html',
  chapters:['مدخل: من الألكانات إلى الألكينات','التركيب والتسمية','الخصائص الفيزيائية','النشاط الكيميائي والاحتراق','ماء البروم: الكشف عن عدم التشبع','تفاعلات الإضافة','الاستخدامات والمقارنة','أسئلة وامتحانات'],
  bgMap:['s_lab_future','s_lab_desk','s_pump_red','s_refinery','s_lab_frame','s_plants_book','s_eco_hand','s_pump_blue'],   /* one still photograph per chapter (the 'photo' look); the teacher's high-resolution set */
  palCh:['violet','ember','emerald','navy','ember','violet','ember','violet'],
  bgId:{final:'s_lab_future', hw:'s_lab_future'},
  bgLight:['s_lab_frame'],
  palId:{final:'violet', hw:'violet'},
  /* points that appear one click at a time (slide id: selector) */
  pts:{goals:'.gi', what:'.rcard', whyE:'.rcard', uses:'.rcard', hw:'.panel.dark li'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  stk:{
    goals:[['m_flask',1130,556,96,5,1.0]], recall:[['m_star',1130,556,90,6,1.0]], what:[['m_bulb',1130,556,96,5,1.0]], bondE:[['m_atom',40,556,100,-5,1.0]], formula:[['m_mole',40,556,100,-5,1.0]],
    names:[['m_star',1130,556,90,6,1.0]], draw:[['m_bulb',1130,556,100,6,1.0]], states:[['m_flame',1130,556,100,6,1.0]], plotE:[['m_tube',40,556,100,-5,1.0]], whyE:[['m_mole',1120,552,100,5,1.0]],
    react:[['m_atom',40,556,100,-5,1.0]], burnE:[['m_flame',1130,556,100,6,1.0]], lab:[['saf_goggles',1070,590,110,-4,1.0]], labq:[['m_tube',40,556,100,-5,1.0]], br:[['m_flask',1130,556,96,5,1.0]],
    eqBr:[['m_star',1130,556,90,6,1.0]], hyd:[['m_atom',40,556,100,-5,1.0]], hydr:[['m_flask',1130,556,96,5,1.0]], conds:[['m_bulb',40,556,100,-5,1.0]], q20:[['m_star',1130,556,90,6,1.0]],
    uses:[['m_bulb',1130,556,100,6,1.0]], compare:[['m_mole',40,556,100,-5,1.0]], map:[['m_trophy',572,566,140,-3,1.0]], q1114:[['n_notes',40,540,120,-5,1.0]], q1520:[['m_star',1130,556,90,6,1.0]],
    ex42:[['m_tube',40,556,100,-5,1.0]], ex43:[['m_flame',1130,556,100,6,1.0]], eou3:[['m_star',1130,556,90,6,1.0]], past1:[['n_notes',40,540,120,-5,1.0]], past2:[['m_star',1130,556,90,6,1.0]],
    final:[['kids_duo',50,486,200,-3,1.0],['m_trophy',1090,550,140,5,1.25]], hw:[['m_mole',1120,552,110,5,1.0]]
  }
};
