/* ---------- shared "definition" card and "how to" strip (teacher's request, November 2026).
   A definition used to be one more sentence inside an ordinary panel, often in the same paragraph as the instructions for using it.
   Now it is its own card: a gold «تعريف» tag, the term in Arabic and English, and the book's wording on its own line; the steps for using it sit in a separate numbered strip.
     dfcHTML({t:'المُول', en:'Mole', h:'كمية من مادة …', sm:true})       -> definition card (sm: a smaller card for crowded slides)
     howHTML('طريقة الحساب', ['اعدّ الذرات','اضرب في Ar','اجمع'])          -> numbered steps, one chip per step
   Three more cards of the same family (teacher's request: one look for each kind of content), each with its own colour and tag:
     lawHTML({t:'قانون المول', eq:'n = m ÷ M<sub>r</sub>', h:'…', sm:true})   -> «قانون» (blue): the title, the equation large and on its own line, a line of explanation. body:'<html>' replaces eq+h (used where the equation is filled in by a click)
     warnHTML({t:'انتبه إلى الوحدات', h:'…'})                              -> «انتبه» (orange): a common slip; eq:'…' adds a large equation line
     remHTML({t:'…', items:['…','…']})                                 -> «تذكّر» (violet): a reminder, as one sentence (h) or a short list (items)
   The wording of a definition is the book's (student book «مصطلحات علمية» boxes, activity-book glossary), not ours; the page goes in BOOKPG. ---------- */
function dfcHTML(o){
  return '<div class="dfc'+(o.sm?' sm':'')+(o.cls?' '+o.cls:'')+'"><div class="dh"><span class="dt"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/></svg>تعريف</span>'+
    '<b class="dn">'+o.t+'</b>'+(o.en?'<i class="de" dir="ltr">'+o.en+'</i>':'')+'</div><p class="dx">'+o.h+'</p></div>';
}
function howHTML(label,steps,cls){
  return '<div class="how'+(cls?' '+cls:'')+'"><span class="hl">'+label+'</span>'+steps.map(function(s,i){return '<span class="hs"><i class="num">'+(i+1)+'</i><span class="ht">'+s+'</span></span>'+(i<steps.length-1?'<span class="ha" aria-hidden="true">◀</span>':'')}).join('')+'</div>';
}
var CARD_TAGS={
  law:['قانون','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14M5 15h14"/></svg>'],
  warn:['انتبه','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 2.8 20h18.4zM12 10v4.5M12 17.4v.1"/></svg>'],
  rem:['تذكّر','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16l-5-3.6L7 20z"/></svg>']
};
function cardHTML(kind,o){
  var tg=CARD_TAGS[kind], inner=o.body||((o.eq?'<div class="eqx" dir="ltr">'+o.eq+'</div>':'')+(o.items?'<ul class="dx">'+o.items.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>':(o.h?'<p class="dx">'+o.h+'</p>':'')));
  return '<div class="dfc '+kind+(o.xs?' xs':(o.sm?' sm':''))+(o.cls?' '+o.cls:'')+'"'+(o.id?' id="'+o.id+'"':'')+'><div class="dh"><span class="dt">'+tg[1]+tg[0]+'</span>'+(o.t?'<b class="dn">'+o.t+'</b>':'')+'</div>'+inner+'</div>';
}
function lawHTML(o){ return cardHTML('law',o) }
function warnHTML(o){ return cardHTML('warn',o) }
function remHTML(o){ return cardHTML('rem',o) }
