/* ---------- the page of the book next to every activity, exercise or question taken from the books (teacher's request).
   A small badge above the slide's title: «كتاب الطالب ص91» or «كتاب الأنشطة ص105–106». Slides that are our own (the scene explanations, the exit ticket) carry none. ---------- */
var BOOKPG={
  lead1:'كتاب الطالب ص87', lead2:'كتاب الطالب ص87 و92', tab32:'كتاب الطالب ص91', cls32:'كتاب الطالب ص91 · كتاب الأنشطة ص105',
  terms:'كتاب الأنشطة ص105 و125', manatee:'كتاب الأنشطة ص105–106', antarctic:'كتاب الأنشطة ص106–108', kelp:'كتاب الأنشطة ص109–110', quin:'كتاب الأنشطة ص110',
  otter1:'كتاب الأنشطة ص111–112', otter2:'كتاب الأنشطة ص112–113',
  eq1:'كتاب الأنشطة ص104', eq2:'كتاب الأنشطة ص104', cmp:'كتاب الأنشطة ص104', hab:'كتاب الأنشطة ص101–103', nursery:'كتاب الأنشطة ص103–104',
  exx:'كتاب الطالب ص100', exp:'كتاب الطالب ص100', howp:'كتاب الطالب ص100–101', prac1:'كتاب الطالب ص101', prac2:'كتاب الطالب ص101',
  tlte:'كتاب الأنشطة ص114–115', act33a:'كتاب الأنشطة ص116–117', act33b:'كتاب الأنشطة ص117–118', act33c:'كتاب الأنشطة ص119',
  inv1a:'كتاب الأنشطة ص125–126', inv1b:'كتاب الأنشطة ص126–127', inv1c:'كتاب الأنشطة ص128', inv2a:'كتاب الأنشطة ص129', inv2b:'كتاب الأنشطة ص130–131', inv2c:'كتاب الأنشطة ص131–133',
  q48:'كتاب الطالب ص99', eou1:'كتاب الطالب ص112', eou2:'كتاب الطالب ص113', eou3:'كتاب الطالب ص114', eou4:'كتاب الطالب ص114', eou5:'كتاب الطالب ص115',
  abq1:'كتاب الأنشطة ص134', abq2:'كتاب الأنشطة ص135', abq3:'كتاب الأنشطة ص136', hw:'كتاب الطالب ص111 و116'
};
(function(){
  var _s=slide, ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 18.3 4 17.5zM13 4h5.5c.8 0 1.5.7 1.5 1.5v12c0 .8-.7 1.5-1.5 1.5H13z"/></svg>';
  slide=function(o){
    var pg=BOOKPG[o.id], oi=o.init;
    if(pg) o.init=function(el){ var hd=el.querySelector('.hd'); if(hd){ var b=document.createElement('span'); b.className='pgb'; b.innerHTML=ICON+pg.replace(/(\d+(?:–\d+)?)/g,'<bdi dir="ltr">$1</bdi>'); hd.appendChild(b) } if(oi) oi.apply(this,arguments) };
    _s(o);
  };
})();
