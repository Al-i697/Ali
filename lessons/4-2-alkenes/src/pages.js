/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves (student book unit 4 pp80-103, activity book unit 4 pp57-73), not copied from the notes; the book's own glossary (student book pp101-103) gives the page of each term. Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  what:'كتاب الطالب ص86', bondE:'كتاب الطالب ص86', formula:'كتاب الطالب ص86', names:'كتاب الطالب ص90',
  draw:'كتاب الطالب ص90', states:'كتاب الطالب ص87', react:'كتاب الطالب ص87', burnE:'كتاب الطالب ص87',
  lab:'كتاب الطالب ص89', labq:'كتاب الطالب ص89', br:'كتاب الطالب ص87–88', hyd:'كتاب الطالب ص88',
  hydr:'كتاب الطالب ص88', conds:'كتاب الطالب ص87–88', q20:'كتاب الطالب ص90', uses:'كتاب الطالب ص88',
  q1114:'كتاب الطالب ص90', q1520:'كتاب الطالب ص90', ex42:'كتاب النشاط ص59–60', ex43:'كتاب النشاط ص61–62',
  eou3:'كتاب الطالب ص99'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=[];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={recall:'intro', names:'ask', draw:'ask', eqBr:'ask', compare:'ask', labq:'act'};
/* «توقّع ثم اكتشف»: the prediction asked before a lab slide (see _core/u4/predict.js). The questions are ours (من عندي); the answers are the ones the lab itself shows. */
var PREDICT={
  lab:{q:'نضيف ماء البروم (لونه برتقالي) إلى أنبوبة فيها ألكان وأنبوبة فيها ألكين ثم نرجّ. ماذا نلاحظ؟',opts:['يزول لون ماء البروم مع الألكين فقط','يزول لون ماء البروم مع الألكان فقط','يزول لونه مع الاثنين'],ok:0,why:'الألكين غير مشبع، فيُضاف البروم إلى الرابطة C=C ويزول اللون؛ أما الألكان المشبع فلا يتفاعل ويبقى اللون برتقالياً.',when:'#gb'}
};
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={};
