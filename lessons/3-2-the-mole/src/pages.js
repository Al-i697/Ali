/* ---------- the page of the book next to every example, activity, exercise or question taken from the books (teacher's request, November 2026).
   Checked against the books themselves (student book unit 3, activity book unit 3), not copied from the notes: student book p56 (activity 3-1), p59-60 (mole, Avogadro constant, table 3-4, molar mass),
   p61 (example 3-1, questions 3-5 to 3-7), p62 (figure 3-3), p78 (end-of-unit question 2); activity book p38-39 (exercise 3-3 part a). Shown by u4/bookpg.js as a badge above the slide's title. ---------- */
var BOOKPG={
  mole:'كتاب الطالب ص59–60', single:'كتاب الطالب ص59', formula:'كتاب الطالب ص60 · كتاب النشاط ص36', t34a:'كتاب الطالب ص60', t34b:'كتاب الطالب ص60', avo:'كتاب الطالب ص59–60',
  ar:'كتاب الطالب ص61', ex31:'كتاب الطالب ص61', q35:'كتاب الطالب ص61', q36:'كتاب الطالب ص61', q37:'كتاب الطالب ص61',
  act31:'كتاب الطالب ص56 و62', tbl33a:'كتاب النشاط ص38–39', tbl33b:'كتاب النشاط ص38–39', eou2:'كتاب الطالب ص78'
};
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={count:'intro', weigh:'intro', graphite:'intro', t34a:'ask', t34b:'ask', ar:'ask', chain:'learn', act31:'learn', ways:'learn'};
/* laws that appear only as a clickable triangle in the lesson (no static card): listed for the student's one-page summary (_core/u4/summary.js) */
var SUMLAWS=[['قانون المول','n = m ÷ M','عدد المولات = الكتلة ÷ الكتلة المولية (g/mol)'],['عدد الجسيمات','N = n × 6.02 × 10²³','كل 1 mol يحتوي على 6.02 × 10²³ جسيم']];
/* slides whose content is small for the stage: enlarged with CSS zoom by the factor that still fits everything that appears later (made by _core/tools/fill_tune.js, applied by _core/u4/fill.js) */
var FILL={ex31:1.25, chain:1.25};
