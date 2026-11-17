/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
/* Environmental science, grade 11, unit 3 "Interactions in marine ecosystems", section 3-2 "Feeding relationships".
   Plain palette backgrounds only (the teacher has no photographs for this subject); the four photographs of the book sit inside the explanation cards. */
var LESSON={
  short:'علاقات التغذية', brand:'الدرس ٣-٢ · علاقات التغذية', subject:'علوم بيئية', mark:'<small>11</small>ع', home:'',
  chapters:['الأهداف والتمهيد','المنتجات والمستهلكات','الإنتاجية','الطاقة في السلسلة الغذائية','الأهرامات','الحساب والاستقصاء','الأسئلة والامتحانات'],
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c'],
  palCh:['navy','emerald','navy','violet','gold','emerald','ember'],
  bgId:{goals:'p_plain_a',lead1:'p_plain_b',lead2:'p_plain_c',
        auto:'p_plain_b',hetero:'p_plain_c',tab32:'p_plain_d',cls32:'p_plain_a',zoo:'p_plain_b',decomp:'p_plain_c',terms:'p_plain_c',manatee:'p_plain_d',pred:'p_plain_a',antarctic:'p_plain_b',kelp:'p_plain_c',quin:'p_plain_a',otter1:'p_plain_d',otter2:'p_plain_a',
        prod:'p_plain_c',photic:'p_plain_d',factors:'p_plain_a',eq1:'p_plain_b',eq2:'p_plain_c',chemo:'p_plain_c',cmp:'p_plain_d',net:'p_plain_a',abloom:'p_plain_d',hab:'p_plain_b',nursery:'p_plain_c',sun:'p_plain_a',resp:'p_plain_b',sec:'p_plain_c',cpruf:'p_plain_d',ten:'p_plain_a',pnum:'p_plain_b',pbio:'p_plain_c',pene:'p_plain_d',bloom0:'p_plain_a',bloom:'p_plain_a',pcmp:'p_plain_b',exx:'p_plain_c',exp:'p_plain_d',howp:'p_plain_a',prac1:'p_plain_b',prac2:'p_plain_c',tlte:'p_plain_d',act33a:'p_plain_a',act33b:'p_plain_b',act33c:'p_plain_c',inv1a:'p_plain_c',inv1b:'p_plain_d',inv1c:'p_plain_a',inv2a:'p_plain_b',inv2b:'p_plain_c',inv2c:'p_plain_d',q48:'p_plain_a',eou1:'p_plain_b',eou2:'p_plain_c',eou3:'p_plain_d',eou4:'p_plain_a',eou5:'p_plain_b',abq1:'p_plain_b',abq2:'p_plain_c',abq3:'p_plain_d',exam1:'p_plain_c',exam2:'p_plain_d',exam3:'p_plain_a',tk:'p_plain_b',hw:'p_plain_c'},
  palId:{goals:'navy',lead1:'emerald',lead2:'gold',
         auto:'emerald',hetero:'violet',tab32:'emerald',cls32:'gold',zoo:'navy',decomp:'emerald',terms:'violet',manatee:'emerald',pred:'ember',antarctic:'navy',kelp:'emerald',quin:'gold',otter1:'gold',otter2:'violet',
         prod:'navy',photic:'emerald',factors:'gold',eq1:'violet',eq2:'emerald',chemo:'ember',cmp:'navy',net:'ember',abloom:'violet',hab:'gold',nursery:'emerald',sun:'gold',resp:'violet',sec:'ember',cpruf:'navy',ten:'emerald',pnum:'gold',pbio:'violet',pene:'ember',bloom0:'navy',bloom:'navy',pcmp:'emerald',exx:'gold',exp:'violet',howp:'ember',prac1:'navy',prac2:'emerald',tlte:'gold',act33a:'violet',act33b:'ember',act33c:'gold',inv1a:'navy',inv1b:'emerald',inv1c:'gold',inv2a:'violet',inv2b:'ember',inv2c:'navy',q48:'emerald',eou1:'gold',eou2:'violet',eou3:'ember',eou4:'navy',eou5:'emerald',abq1:'emerald',abq2:'navy',abq3:'gold',exam1:'gold',exam2:'violet',exam3:'ember',tk:'navy',hw:'emerald'},
  /* points that appear one click at a time (slide id: selector); [data-pt] marks them in teaching order inside each slide */
  ptsLate:true,
  pts:{goals:'.gi',
       lead1:'[data-pt]',auto:'[data-pt]',hetero:'[data-pt]',tab32:'[data-pt]',zoo:'[data-pt]',terms:'.rcard',pred:'[data-pt]',antarctic:'.rcard',kelp:'.rcard',quin:'[data-pt]',otter1:'.rcard',otter2:'.rcard',
       prod:'[data-pt]',photic:'[data-pt]',factors:'[data-pt]',chemo:'[data-pt]',net:'[data-pt]',abloom:'[data-pt]',hab:'.rcard',nursery:'[data-pt]',sun:'[data-pt]',resp:'[data-pt]',sec:'[data-pt]',ten:'[data-pt]',pnum:'[data-pt]',pbio:'[data-pt]',pene:'[data-pt]',bloom:'[data-pt]',exx:'[data-pt]',exp:'[data-pt]',howp:'[data-pt]',prac1:'[data-pt]',prac2:'[data-pt]',tlte:'[data-pt]',act33a:'[data-pt]',act33b:'.rcard',act33c:'.rcard',inv1a:'[data-pt]',inv1b:'[data-pt]',inv1c:'.rcard',inv2a:'[data-pt]',inv2b:'[data-pt]',inv2c:'.rcard',q48:'.rcard',eou1:'.rcard',eou2:'.rcard',eou3:'.rcard',eou4:'.rcard',eou5:'[data-pt]',abq1:'.rcard',abq2:'.rcard',abq3:'.rcard',exam2:'.rcard',exam3:'.rcard',hw:'.panel.dark li'},
  stk:{}
};
