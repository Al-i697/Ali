/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves (student book unit 4 pp80-103, activity book unit 4 pp57-73), not copied from the notes; the book's own glossary (student book pp101-103) gives the page of each term. Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  what:'كتاب الطالب ص81', carbon:'كتاب الطالب ص81', bonds:'كتاب الطالب ص81', q1to4:'كتاب الطالب ص82',
  hydro:'كتاب الطالب ص82–83', alk:'كتاب الطالب ص83', names:'كتاب الطالب ص83', formula:'كتاب الطالب ص83',
  states:'كتاب الطالب ص83', plot:'كتاب الطالب ص86', why:'كتاب الطالب ص83', inert:'كتاب الطالب ص84',
  burn:'كتاب الطالب ص84', uses2:'كتاب الطالب ص84', q89:'كتاب الطالب ص86', dots:'كتاب الطالب ص86',
  homol:'كتاب الطالب ص85–86', ws41:'كتاب النشاط ص67–68', ws42:'كتاب النشاط ص69–70', eou:'كتاب الطالب ص99'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=[];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={carbon:'learn', bonds:'learn', hydro:'learn', alk:'learn', names:'learn', formula:'learn', q1to4:'ask', draw:'ask', names2:'ask', q89:'ask'};
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={};
