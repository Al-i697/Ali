/* one numeral style on the slides: Western digits (as in the answer boxes, the formulas and the student book). The slide sources and the
   feedback lines still contain Arabic-Indic digits in many places, so every text node that appears inside the stage is converted as it arrives;
   the player's own bar and the teacher notes (outside the stage) keep their style. Teacher's request: "الأرقام لازم متماثلة". */
(function(){
  var RE=/[٠-٩]/;
  function conv(s){return s.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632})}
  function fix(n){
    if(n.nodeType===3){ if(RE.test(n.nodeValue)) n.nodeValue=conv(n.nodeValue); return }
    if(n.nodeType!==1) return;
    var w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT), t;
    while((t=w.nextNode())){ if(RE.test(t.nodeValue)) t.nodeValue=conv(t.nodeValue) }
  }
  function start(){
    var st=document.getElementById('stage'); if(!st){ setTimeout(start,50); return }
    fix(st);
    new MutationObserver(function(ms){ ms.forEach(function(m){ if(m.type==='characterData') fix(m.target); else Array.prototype.forEach.call(m.addedNodes,fix) }) })
      .observe(st,{childList:true,characterData:true,subtree:true});
  }
  start();
})();
