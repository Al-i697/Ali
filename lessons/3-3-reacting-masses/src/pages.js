/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves, not copied from the notes: student book p61–62 (the 0.24 g Mg / 0.40 g MgO text is on p61, figure 3-3 on p62), p62 (SiO2 figure 3-3b: 4.7 g Si / 5.3 g O, used by si6, which also takes its glossary from p63), p63 (limiting reactant and excess glossary, example 3-2), p64 (example 3-3, activity 3-2, question 3-8), p65 (questions 3-9 to 3-11), p78 (end-of-unit question 3);
   activity book p37–38 (exercise 3-2: parts b and c are on p38), teacher guide p60 (activity 3-2 data 1.65 g Na2CO3 / 0.65 g CO2, materials and safety), p39 (exercise 3-3 parts b, c), p48-49 (worksheet 3-3), p50-51 (worksheet 3-4). Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  mgo:'كتاب الطالب ص61–62', sio2:'كتاب الطالب ص62', conserve:'كتاب الطالب ص62', si6:'كتاب الطالب ص62–63', fes:'كتاب الطالب ص63', scaleup:'كتاب الطالب ص63', method:'كتاب الطالب ص63',
  bacl:'كتاب النشاط ص50–51', fe48:'كتاب النشاط ص48', solv:'كتاب النشاط ص48–49', prop:'كتاب النشاط ص37–38',
  ex32:'كتاب الطالب ص63', ex33:'كتاب الطالب ص64', q38:'كتاب الطالب ص64', q39:'كتاب الطالب ص65', cuo:'كتاب الطالب ص65',
  lab:'كتاب الطالب ص64 · دليل المعلم ص60', labcalc:'كتاب الطالب ص64 · دليل المعلم ص60', ag:'كتاب الطالب ص78', eou3:'كتاب الطالب ص78'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=['noo'];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={sand1:'intro', sand2:'intro', mgo:'ex', sio2:'ex', fes:'ex', bacl:'ask', fe48:'ask', cls:'ask', prop:'ask', solv:'ask', steps3:'learn', si6:'learn', conserve:'learn', rule:'learn', parts:'learn'};
/* «توقّع ثم اكتشف»: the prediction asked before a lab slide (see _core/u4/predict.js). The questions are ours (من عندي); the answers are the ones the lab itself shows. */
var PREDICT={
  lab:{q:'نضع كربونات الصوديوم وحمض الهيدروكلوريك في دورق مفتوح على الميزان ثم نقلب الأنبوبة. بعد توقف الفوران، قراءة الميزان:',opts:['تزيد عن القراءة قبل التفاعل','تنقص عن القراءة قبل التفاعل','تبقى كما هي'],ok:1,why:'خرج غاز CO₂ من الدورق المفتوح إلى الهواء، فنقصت الكتلة بمقدار كتلة CO₂ (0.65 g في هذه التجربة).',when:'#gb'}
};
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={prop:1.25};
