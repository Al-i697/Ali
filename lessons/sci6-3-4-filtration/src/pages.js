/* ---------- the page of the book next to every item taken from the books (teacher's request, November 2026). Checked against the two files the teacher sent (student book pp60-61, teacher's guide pp80-82);
   the activity-book exercise is known only from its answers in the guide (no page), so its slide carries no badge. ---------- */
var BOOKPG={
  paper:'كتاب الطالب ص60', fold:'دليل المعلم ص81–82', labB:'كتاب الطالب ص61', obs:'كتاب الطالب ص61',
  q12:'كتاب الطالب ص61', q34:'كتاب الطالب ص61', apps:'كتاب الطالب ص60–61', sand:'كتاب الطالب ص60 · دليل المعلم ص80',
  salt:'كتاب الطالب ص61 · دليل المعلم ص82'
};
/* slides whose title says exercise/question but which come from the teacher's own plan or have no page in the files we have */
var BOOKPG_OWN=['ex34','labA','prior','hook'];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js) */
var KINDS={prior:'intro', hook:'intro', q12:'ask', q34:'ask', ex34:'ask', salt:'act', obs:'learn'};
