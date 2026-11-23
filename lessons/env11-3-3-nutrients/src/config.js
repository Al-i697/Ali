/* ---------- lesson settings: chapters, a background scene and a colour palette for each chapter or slide ---------- */
/* Environmental science, grade 11, unit 3 "Interactions in marine ecosystems", section 3-3 "Nutrient cycles" (objectives 3-9 to 3-17).
   Plain palette backgrounds only; every picture is drawn in code (src/svgs.js) except the three photographs of the book (src/photos.js). */
var LESSON={
  short:'دورات المغذيات', brand:'الدرس ٣-٣ · دورات المغذيات', subject:'علوم بيئية', mark:'<small>11</small>ع', home:'index.html',
  chapters:['الأهداف والتمهيد','ما المغذيات؟','دورة المغذيات والطوران','الخزان وتجديده','إزالة المغذيات ودورة الكربون','المنطقة الميتة (دراسة حالة)','الأسئلة والامتحانات'],
  bgMap:['p_plain_a','p_plain_b','p_plain_c','p_plain_d','p_plain_a','p_plain_b','p_plain_c'],
  palCh:['navy','emerald','navy','violet','gold','emerald','ember'],
  bgId:{}, palId:{},
  /* points that appear one click at a time (slide id: selector); [data-pt] marks them in teaching order inside each slide */
  ptsLate:true,
  pts:{
       lead1:'[data-pt]',nut:'[data-pt]',tab33:'[data-pt]',act41:'.rcard',
       cyc:'[data-pt]',bio:'[data-pt]',abio:'[data-pt]',salm1:'[data-pt]',salm2:'.rcard',
       res:'[data-pt]',conc:'[data-pt]',proc5:'[data-pt]',gas:'[data-pt]',exc:'[data-pt]',upw:'[data-pt]',run:'[data-pt]',tect:'[data-pt]',act44:'.rcard',
       snow:'[data-pt]',harv:'[data-pt]',q911:'.rcard',act44b:'.rcard',
       dz1:'[data-pt]',dz3:'[data-pt]',dz4:'[data-pt]',dz5:'[data-pt]',dz6:'[data-pt]',dzq:'.rcard',
       eou7:'.rcard',eou11:'.rcard',abq3:'.rcard',abq4:'.rcard',exam:'.rcard',hw:'.panel.dark li'},
  stk:{}
};
(function(){
  /* one plain background and one palette per slide, rotating so that neighbouring slides differ */
  var ids=('goals lead1 lead2 nut elem tab33 forms act41 cyc bio abio phase salm1 salm2 res conc proc5 gas exc upw run tect procq act44 uptake snow harv q911 act44b carbon dz1 dz2 dz3 dz4 dz5 dz6 dzq eou3 eou7 eou11 abq3 abq4 exam tk hw').split(' ');
  var bg=['p_plain_a','p_plain_b','p_plain_c','p_plain_d'], pal=['navy','emerald','violet','gold','ember'];
  ids.forEach(function(id,i){ LESSON.bgId[id]=bg[i%4]; LESSON.palId[id]=pal[i%5] });
})();
