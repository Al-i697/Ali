/* ---------- the page of the book next to every activity, question or case study taken from the books (teacher's request, November 2026).
   Checked against the PDFs: student book p101-111 (section 3-3; p103 case study 3-1; p108 questions 9-11; p109-111 extended case study and its questions; p111 unit summary),
   end-of-unit questions p112 (3), p113 (7), p115 (11); activity book p120-124 (activity 3-4), p136 (end-of-unit 3), p137 (end-of-unit 4).
   Shown by u4/bookpg.js as a badge above the slide's title. Our own explanation slides, the ordering and classification games and the exit ticket carry none. ---------- */
var BOOKPG={
  elem:'كتاب النشاط ص120 · كتاب الطالب ص101', act41:'كتاب النشاط ص120', forms:'كتاب النشاط ص121', phase:'كتاب النشاط ص121',
  salm1:'كتاب الطالب ص103', salm2:'كتاب الطالب ص103', act44:'كتاب النشاط ص123–124', act44b:'كتاب النشاط ص124', q911:'كتاب الطالب ص108', carbon:'كتاب النشاط ص122',
  dz1:'كتاب الطالب ص109', dz3:'كتاب الطالب ص109–110', dz4:'كتاب الطالب ص110', dz5:'كتاب الطالب ص110', dz6:'كتاب الطالب ص110', dzq:'كتاب الطالب ص111',
  eou3:'كتاب الطالب ص112', eou7:'كتاب الطالب ص113', eou11:'كتاب الطالب ص115', abq3:'كتاب النشاط ص136', abq4:'كتاب النشاط ص137'
};
/* slides whose title says exercise/question but which come from past exams or the teacher's own deck (no page): checked by book_check.js */
var BOOKPG_OWN=[];
/* the kind of a slide when the title alone does not say it (see _core/u4/kinds.js): intro تمهيد · learn شرح · ex مثال · act نشاط · ask تدريب · exam امتحان · exit تذكرة خروج · hw الواجب */
var KINDS={lead2:'intro',elem:'act',forms:'act',phase:'act',procq:'act',uptake:'act',carbon:'act',dz2:'act',salm2:'ask',q911:'ask',dzq:'ask',abq3:'ask',abq4:'ask',act41:'ask',act44:'ask',act44b:'ask'};
/* «توقّع ثم اكتشف»: the prediction asked before the upwelling picture (see _core/u4/predict.js). The question is ours (من عندي); the answer is the one the picture shows. */
var PREDICT={
  upw:{q:'الرياح تهبّ بمحاذاة الشاطئ وتدفع الماء السطحي الدافئ بعيداً عنه. ما الذي يحلّ محلّه؟',opts:['ماء بارد غني بالمغذيات يصعد من الأعماق','ماء دافئ آتٍ من الشاطئ','لا شيء: يبقى مكانه فارغاً'],ok:0,why:'الماء الذي أُزيح يحلّ محلّه ماء بارد من الأعماق، وهو غني بالمغذيات لأن بقايا الكائنات الميتة تتحلل هناك؛ وهذا هو التيار الصاعد.',when:'#gb'}
};
