/* Unit-1 lessons: the right answer must not always be the first choice.
   Every group of choices (.opts) is shuffled when its slide is built, the same way every time (seeded by the slide id and the group's place),
   and the letters (أ ب ج د هـ) are renumbered. The answers are bound by data-i, so only the order on screen changes. */
function shuffleOpts(el,id){
  var R=rnd(id.split('').reduce(function(a,c){return (a*31+c.charCodeAt(0))%2147483000},7)+1), L='أبجدهـ';
  $$('.opts',el).forEach(function(box){
    var kids=Array.prototype.slice.call(box.children), i, j, t;
    if(kids.length<2) return;
    for(i=kids.length-1;i>0;i--){ j=Math.floor(R()*(i+1)); t=kids[i]; kids[i]=kids[j]; kids[j]=t }
    kids.forEach(function(k,n){ box.appendChild(k); var ix=k.querySelector('.ix'); if(ix) ix.textContent=L[n] });
  });
}
var _slide=slide;
slide=function(o){ var oi=o.init; o.init=function(el){ shuffleOpts(el,o.id); if(oi) oi.apply(this,arguments) }; _slide(o) };
