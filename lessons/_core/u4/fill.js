/* A few slides leave a lot of empty stage around small content (found by measuring every slide at its fullest, with the hidden bars and feedback lines shown).
   Their content is enlarged with CSS zoom, by a factor chosen per slide so that it still fits, including everything that appears later:
     var FILL={slideId:1.18,…}   in src/pages.js  (made by _core/tools/fill_tune.js, which measures each slide and finds the largest factor that fits)
   Only the body of the slide is zoomed; the header, the badges and the stickers are not.
   Shared by every lesson: build(..., fill=True) in _core/tools/u4build.py adds this file. */
(function(){
  var _s=slide;
  slide=function(o){
    var z=(typeof FILL!=='undefined')&&FILL[o.id];
    if(z){
      var oi=o.init;
      o.init=function(el){ var b=el.querySelector('.body'); if(b) b.style.zoom=z; return oi?oi.apply(this,arguments):undefined };
    }
    _s(o);
  };
})();
