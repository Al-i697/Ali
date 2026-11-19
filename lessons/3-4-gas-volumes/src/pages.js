/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves, not copied from the notes: student book p65 (Avogadro's law and molar volume, table 3-5), p66 (example 3-4), p68 (figure 3-4, gases-only reactions, activity 3-3), p69 (questions 3-12 to 3-15), p79 (end-of-unit question 4);
   activity book p40-41 (exercise 3-4), p52 (worksheet 3-5 question 1). Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  predict:'كتاب الطالب ص65', avog:'كتاب الطالب ص65', rtp:'كتاب الطالب ص68', tri:'كتاب الطالب ص66', ex1:'كتاب الطالب ص66', ex2:'كتاب الطالب ص66',
  q312:'كتاب الطالب ص69', q313:'كتاب الطالب ص69', gasonly:'كتاب الطالب ص68', shrink:'كتاب الطالب ص68', q314:'كتاب الطالب ص69', flow34:'كتاب الطالب ص68', q315:'كتاب الطالب ص69',
  zn:'كتاب النشاط ص52', mgno3:'كتاب الطالب ص79', lab0:'كتاب الطالب ص68',
  ex34a:'كتاب النشاط ص40–41', ex34b:'كتاب النشاط ص40–41', ex34c:'كتاب النشاط ص40–41'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=['labq'];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={matrix:'ask', challenge:'ask', avog:'learn', rtp:'learn', tri:'learn', flow34:'learn', labq:'act'};
/* «توقّع ثم اكتشف»: the prediction asked before a lab slide (see _core/u4/predict.js). The questions are ours (من عندي); the answers are the ones the lab itself shows. */
var PREDICT={
  lab:{q:'نضيف حمض الهيدروكلوريك الزائد إلى شريط ماغنيسيوم ونجمع غاز الهيدروجين. إذا ضاعفنا طول الشريط (وكتلته)، فإن حجم الغاز:',opts:['يتضاعف تقريباً','يبقى كما هو','يتناقص'],ok:0,why:'عدد مولات Mg يتضاعف فيتضاعف عدد مولات H₂ (النسبة 1 : 1)، والحجم يتناسب مع عدد المولات.',when:'#gb'}
};
/* laws that appear only as a clickable triangle in the lesson (no static card): listed for the student's one-page summary (_core/u4/summary.js) */
var SUMLAWS=[['الحجم المولي','V = n × 24','الحجم (L) = عدد المولات × 24 L/mol عند درجة حرارة الغرفة والضغط القياسي'],['عدد المولات','n = V ÷ 24','V (L) ÷ 24 L/mol، أو V (mL) ÷ 24000']];
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={q312:1.25, q313:1.25};
