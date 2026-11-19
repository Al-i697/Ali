/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves (student book unit 3, activity book unit 3), not copied from the notes:
   student book p53 (image 3-1, table 3-1, why carbon-12), p54 (isotopes, Ar, figure 3-1, glossary), p55 (table 3-2, Mr glossary), p56 (table 3-3, activity 3-1), p57 (models and giant structures), p58 (questions 3-1 to 3-4), p78 (end-of-unit question 1);
   activity book p36 (glossary, exercise 3-1 part a), p37 (exercise 3-1 part b). Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  npk:'كتاب الطالب ص53', parts:'كتاب الطالب ص53', c12:'كتاب الطالب ص53', why12:'كتاب الطالب ص53', calc:'كتاب الطالب ص53', calc2:'كتاب الطالب ص53',
  balance:'كتاب الطالب ص54 · كتاب النشاط ص36', iso:'كتاب الطالب ص54', cl:'كتاب الطالب ص54',
  table:'كتاب الطالب ص55', mr:'كتاب الطالب ص55 · كتاب النشاط ص36', mr2:'كتاب الطالب ص56', mr3:'كتاب الطالب ص56',
  models:'كتاب الطالب ص57', lattice:'كتاب الطالب ص57',
  q31:'كتاب الطالب ص58', q32:'كتاب الطالب ص58', race:'كتاب الطالب ص58',
  ex31a:'كتاب النشاط ص36', ex31b:'كتاب النشاط ص37', lab:'كتاب الطالب ص56 و58', eou1:'كتاب الطالب ص78'
};
/* slides whose title says exercise but which come from the teacher's own deck, not from a book (no page): checked by book_check.js */
var BOOKPG_OWN=['pc'];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={npk:'intro', imp:'intro', shop:'intro', q32:'ask', isoH:'ask', mr2:'ask', mr3:'ask', models:'ask', lattice:'ask', mr:'learn', table:'learn', cl:'learn', calc:'learn', calc2:'learn', parts:'learn', lab:'act'};
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={calc2:1.16};
