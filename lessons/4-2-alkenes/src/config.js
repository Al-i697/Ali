/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
var LESSON={
  short:'الألكينات', brand:'الدرس ٤-٢ · الألكينات وتفاعلات الإضافة', home:'index.html',
  chapters:['مدخل: من الألكانات إلى الألكينات','التركيب والتسمية','الخصائص الفيزيائية','النشاط الكيميائي والاحتراق','ماء البروم: الكشف عن عدم التشبع','تفاعلات الإضافة','الاستخدامات والمقارنة','أسئلة وامتحانات'],
  /* Backgrounds (same rule as lesson 4-1): a live 3D molecule where the slide is about structure or a reaction, one of the teacher's high-resolution photographs
     where it is about the real world, a lab or a question. A photograph is not repeated inside the lesson except the cover/closing pair; the general ones are shared
     with other lessons at most once (see _core/tools/photo_usage.py). The card colour (palId) is picked to break the colour of the picture behind it. */
  bgMap:['p_blue_lab','mol_propene','mol_butene','mol_addn','p_crystal_flask','mol_addn','mol_ethene','mol_family'],
  palCh:['violet','ember','emerald','navy','ember','violet','ember','violet'],
  bgId:{goals:'p_blue_lab',recall:'mol_family',what:'mol_ethene',bondE:'pm_ene',formula:'mol_butene',names:'mol_propene',
        draw:'p_molecules_circuit',states:'mol_propene',plotE:'mol_butene',whyE:'mol_chain',react:'mol_addn',burnE:'mol_burn',
        lab:'p_crystal_flask',labq:'p_crystal_flask',br:'mol_dibromo',eqBr:'p_lab_equations',hyd:'mol_addn',hydr:'pm_ethanol',
        conds:'mol_addn',q20:'mol_dibromo',uses:'p_biofuel_pump',compare:'mol_ethene',map:'mol_family',q1114:'p_lab_frame',
        q1520:'mol_propene',ex42:'mol_butene',ex43:'mol_burn',eou3:'mol_ethanol',past1:'mol_dibromo',past2:'mol_addn',
        final:'p_blue_lab',hw:'p_blue_lab'},
  palId:{goals:'ember',recall:'navy',what:'navy',bondE:'violet',formula:'violet',names:'violet',
        draw:'ember',states:'navy',plotE:'navy',whyE:'emerald',react:'ember',burnE:'ember',
        lab:'ember',labq:'ember',br:'gold',eqBr:'emerald',hyd:'emerald',hydr:'ember',
        conds:'gold',q20:'emerald',uses:'violet',compare:'violet',map:'emerald',q1114:'navy',
        q1520:'gold',ex42:'emerald',ex43:'ember',eou3:'violet',past1:'gold',past2:'gold',
        final:'violet',hw:'violet'},
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
