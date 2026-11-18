/* ---------- the page of the book next to every activity, exercise, example or question taken from the books (teacher's request, November 2026).
   A small badge above the slide's title: «كتاب الطالب ص61» or «كتاب النشاط ص38–39».
   Each lesson lists its slides in src/pages.js:  var BOOKPG={ slideId:'كتاب الطالب ص61', ... };
   Slides of our own (explanations from the teacher's deck, exit tickets) carry none.  The numbers are checked against the books, never copied from a note.
   Pages are written with Western digits (one numeral style); bdi keeps "38–39" in reading order inside the Arabic line. ---------- */
(function(){
  var ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 18.3 4 17.5zM13 4h5.5c.8 0 1.5.7 1.5 1.5v12c0 .8-.7 1.5-1.5 1.5H13z"/></svg>';
  var _s=slide;
  slide=function(o){
    var oi=o.init;
    o.init=function(el){
      var pg=(typeof BOOKPG!=='undefined')&&BOOKPG[o.id];
      if(pg){ var hd=el.querySelector('.hd'); if(hd&&!hd.querySelector('.pgb')){ var b=document.createElement('span'); b.className='pgb'; b.setAttribute('data-pg',pg); b.innerHTML=ICON+pg.replace(/(\d+(?:–\d+)?)/g,'<bdi dir="ltr">$1</bdi>'); hd.appendChild(b) } }
      if(oi) return oi.apply(this,arguments);
    };
    _s(o);
  };
})();
