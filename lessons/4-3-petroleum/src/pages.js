/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves (student book unit 4 pp80-103, activity book unit 4 pp57-73), not copied from the notes; the book's own glossary (student book pp101-103) gives the page of each term. Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  types:'كتاب الطالب ص90', form:'كتاب الطالب ص90', fields:'كتاب الطالب ص90', burn:'كتاب الطالب ص91',
  refine:'كتاب الطالب ص91', process:'كتاب الطالب ص91', tower:'كتاب الطالب ص92', order:'كتاب الطالب ص97',
  uses:'كتاب الطالب ص97', trend:'كتاب الطالب ص93', why:'كتاب الطالب ص93', lab:'كتاب الطالب ص93–94',
  labq:'كتاب الطالب ص94', need:'كتاب الطالب ص95', define:'كتاب الطالب ص95', crack1:'كتاب الطالب ص95',
  crack2:'كتاب الطالب ص95–96', octane:'كتاب الطالب ص96', labc:'كتاب الطالب ص97', labcq:'كتاب الطالب ص97 · كتاب النشاط ص63–66',
  ws43:'كتاب النشاط ص71–72', ex44:'كتاب النشاط ص63–66', eou4:'كتاب الطالب ص100'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=[];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={order:'ask', uses:'ask', why:'ask', labq:'act', labcq:'act'};
/* «توقّع ثم اكتشف»: the prediction asked before a lab slide (see _core/u4/predict.js). The questions are ours (من عندي); the answers are the ones the lab itself shows. */
var PREDICT={
  lab:{q:'نسخّن النفط الخام ببطء ونجمع المشتقات على التوالي. أي جزء يُجمع أولاً؟',opts:['الأخف (الأقل درجة غليان)','الأثقل (الأعلى درجة غليان)','كل الأجزاء معاً'],ok:0,why:'الجزء الأقل درجة غليان يتبخر أولاً فيُجمع أولاً، ثم الأثقل تدريجياً مع ارتفاع الحرارة.',when:'#gb'},
  labc:{q:'جُمع غاز من تكسير البارافين فوق الحفّاز الساخن. ماذا يحدث عند إضافة ماء البروم إلى هذا الغاز؟',opts:['يزول لون ماء البروم','لا يتغير لونه','يصبح لونه أغمق'],ok:0,why:'التكسير ينتج ألكينات غير مشبعة، فيزول لون ماء البروم بإضافة البروم على الرابطة الثنائية.',when:'#gb'}
};
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={crack2:1.25};
