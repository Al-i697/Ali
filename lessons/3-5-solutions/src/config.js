/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
/* click-by-click points: T2 = the blocks of a two-column slide (problem first, then the work area), without feedback lines, hidden reveals, reference chips or nested columns; T1 = the same for a one-column slide */
var PT_T2='.body>div>.col>*:not(.fb):not(.hide):not(.gbar):not(.chips):not(.tkbar):not(.col)', PT_T1='.body>.col.grow>*:not(.fb):not(.hide):not(.chips):not(.arstrip)';
var LESSON={
  short:'محاليل ومعايرة', brand:'الدرس ٣-٥ · محاليل ومعايرة', home:'index.html',
  chapters:['مدخل','تركيز الكتلة','التركيز المولي','المعايرة','حسابات المعايرة','تطبيقات','الخريطة والامتحانات','ختام'],
  /* Backgrounds (new look, as in the later lessons): the teacher's photographs mixed freely, each used once in this lesson, with plain palette backgrounds between them because he dislikes repeated pictures. */
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c','p_plain_d'],
  palCh:['navy','emerald','violet','gold','ember','navy','gold','emerald'],
  bgId:{goals:'p_glass_lab',mix:'p_plain_a',vocab:'p_plain_b',cg:'p_blue_lab',tk1:'p_plain_c',ex37:'p_plain_d',
        q316:'p_plain_a',cm:'p_crystal_flask',ex36:'p_plain_b',tk2:'p_plain_c',ex38:'p_plain_d',ncv:'p_plain_a',
        q317:'p_plain_b',what:'p_plain_a',tsteps:'p_plain_c',lab0:'p_m_lab',lab:'p_plain_d',labq:'p_plain_a',
        method:'p_plain_c',ex39:'p_plain_b',ex310:'p_plain_c',q318:'p_plain_d',q319:'p_plain_a',q320:'p_plain_b',
        ws35:'p_plain_c',wsburette:'p_lab_desk',wsorg:'p_plain_d',map:'p_plain_b',q5:'p_plain_a',race:'p_plain_b',
        citric:'p_lab_equations',na2co3:'p_plain_b',past1:'p_e_blue_lab',past2:'p_plain_c',final:'p_lab_future',hw:'p_atom_bubbles'},
  palId:{mix:'violet',vocab:'gold',cg:'emerald',ex37:'emerald',q316:'navy',tk1:'ember',cm:'violet',ex38:'violet',ncv:'violet',q317:'navy',ex36:'emerald',tk2:'ember',what:'gold',tsteps:'navy',lab0:'navy',lab:'navy',labq:'violet',method:'gold',ex39:'ember',ex310:'ember',q318:'gold',q319:'gold',q320:'ember',ws35:'navy',citric:'violet',na2co3:'emerald',wsburette:'navy',wsorg:'gold',map:'violet',q5:'gold',race:'ember',past1:'gold',past2:'navy',final:'navy',hw:'emerald'},
  /* stickers: preferred spot [sticker, x, y, width, tilt, delay s]; the player moves them to free space and never onto text */
  pts:{goals:'.gi',
       ex37:PT_T2,
       q316:PT_T2,
       ex38:PT_T2,
       ncv:PT_T2,
       q317:PT_T2,
       ex36:'.sm.onpic, table.mtab tbody tr',
       what:PT_T2,
       lab0:PT_T2,
       ex39:PT_T2,
       ex310:PT_T2,
       q318:PT_T2,
       q319:PT_T2,
       q320:PT_T2,
       citric:PT_T2,
       na2co3:PT_T2,
       wsburette:PT_T2,
       wsorg:PT_T1,
       q5:'.frm.brk',
       past1:'.pq',
       past2:'.pq',
       hw:'.panel.dark li'},
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
