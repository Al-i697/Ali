/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves, not copied from the notes: student book p69 (solute, solvent, mass concentration), p70 (molar concentration, example 3-7), p71 (example 3-8, titration, figure 3-6), p72-73 (figure 3-7, examples 3-9 and 3-10),
   p74-75 (activity 3-4), p76 (questions 3-16 to 3-20), p77 (figure 3-8, the map of calculations), p79 (end-of-unit question 5);
   activity book p44-45 (exercise 3-6), p52-53 (worksheet 3-5), p54-55 (worksheet 3-6). Note: the older notes put example 3-7 on p71 and the map on p76; the book has them on p70 and p77.
   Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  mix:'كتاب الطالب ص69', vocab:'كتاب الطالب ص69', cg:'كتاب الطالب ص69', ex37:'كتاب الطالب ص70', q316:'كتاب الطالب ص76', cm:'كتاب الطالب ص70', ex38:'كتاب الطالب ص71',
  ncv:'كتاب الطالب ص70', q317:'كتاب الطالب ص76', ex36:'كتاب النشاط ص44–45', what:'كتاب الطالب ص71', tsteps:'كتاب الطالب ص71', lab0:'كتاب الطالب ص74–75', labq:'كتاب الطالب ص75',
  method:'كتاب الطالب ص72–73', ex39:'كتاب الطالب ص72–73', ex310:'كتاب الطالب ص73', q318:'كتاب الطالب ص76', q319:'كتاب الطالب ص76', q320:'كتاب الطالب ص76',
  ws35:'كتاب النشاط ص52–53', citric:'كتاب النشاط ص44–45', na2co3:'كتاب النشاط ص53', wsburette:'كتاب النشاط ص55', wsorg:'كتاب النشاط ص54–55', map:'كتاب الطالب ص77', q5:'كتاب الطالب ص79'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=[];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={vocab:'learn', cg:'learn', cm:'learn', ncv:'learn', what:'learn', tsteps:'learn', method:'learn', map:'learn', labq:'act'};
/* «توقّع ثم اكتشف»: the prediction asked before a lab slide (see _core/u4/predict.js). The questions are ours (من عندي); the answers are the ones the lab itself shows. */
var PREDICT={
  lab:{q:'نضيف الحمض من السحاحة إلى القاعدة (مع الكاشف) نقطة نقطة. كيف يتغير لون الكاشف عند نقطة النهاية؟',opts:['يتغير فجأة بقطرة واحدة تقريباً','يتغير تدريجياً على مدى عدة mL','لا يتغير أبداً'],ok:0,why:'قرب نقطة النهاية تكفي قطرة واحدة لتغيير اللون، لذلك نقترب بالتنقيط ونقرأ الحجم بدقة.',when:'#gb'}
};
/* laws that appear only as a clickable triangle in the lesson (no static card): listed for the student's one-page summary (_core/u4/summary.js) */
var SUMLAWS=[['تركيز الكتلة','C = m ÷ V','الوحدة g/L: كتلة المذاب (g) ÷ حجم المحلول (L)'],['التركيز المولي','C = n ÷ V','الوحدة mol/L: عدد مولات المذاب ÷ حجم المحلول (L)'],['عدد المولات من التركيز','n = C × V','الحجم V بالـ L']];
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={cg:1.25, q316:1.25};
