/* ---------- shared "definition" card and "how to" strip (teacher's request, November 2026).
   A definition used to be one more sentence inside an ordinary panel, often in the same paragraph as the instructions for using it.
   Now it is its own card: a gold «تعريف» tag, the term in Arabic and English, and the book's wording on its own line; the steps for using it sit in a separate numbered strip.
     dfcHTML({t:'المُول', en:'Mole', h:'كمية من مادة …', sm:true})       -> definition card (sm: a smaller card for crowded slides)
     howHTML('طريقة الحساب', ['اعدّ الذرات','اضرب في Ar','اجمع'])          -> numbered steps, one chip per step
   The wording of a definition is the book's (student book «مصطلحات علمية» boxes, activity-book glossary), not ours; the page goes in BOOKPG. ---------- */
function dfcHTML(o){
  return '<div class="dfc'+(o.sm?' sm':'')+(o.cls?' '+o.cls:'')+'"><div class="dh"><span class="dt"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/></svg>تعريف</span>'+
    '<b class="dn">'+o.t+'</b>'+(o.en?'<i class="de" dir="ltr">'+o.en+'</i>':'')+'</div><p class="dx">'+o.h+'</p></div>';
}
function howHTML(label,steps,cls){
  return '<div class="how'+(cls?' '+cls:'')+'"><span class="hl">'+label+'</span>'+steps.map(function(s,i){return '<span class="hs"><i class="num">'+(i+1)+'</i><span class="ht">'+s+'</span></span>'+(i<steps.length-1?'<span class="ha" aria-hidden="true">◀</span>':'')}).join('')+'</div>';
}
