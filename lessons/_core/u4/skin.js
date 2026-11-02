/* ---------- the card look: helper that keeps loose text readable over any background (photo or live scene).
   Used by lessons built with skin 'photo' (still pictures) or 'cards' (the living background engine). ---------- */
/* text that sits straight on the photograph (not inside a card) gets a quiet dark plate, so it stays readable over any picture.
   Called by the player for every slide it builds; the class 'onpic' is styled in skin_photo.css (no padding, so nothing moves). */
var SKIN=(function(){
  var CARD='.panel,.frm,.mod,.qd,.rc,.mrc,.pq,.goal,.tq,.sent,.stp,.rcard,.tile,.opt,.btn,.qr,.cls,.tray,.mtray,.mslot,.pf,.zone,.pill,.chip,.callout,.gbar,.ls,.gi,.team,.score,.tag,.fb,.hd,.nav,.steps,.rd,button,input,select,table,svg,.ptn';
  /* text that already sits on a surface with its own colour (a card, a badge, a band) must not get a plate */
  function opaque(e){
    var c=getComputedStyle(e); if(c.backgroundImage&&c.backgroundImage!=='none') return true;
    var m=/rgba?\(([^)]+)\)/.exec(c.backgroundColor); if(!m) return false; var v=m[1].split(','); return (v.length>3?+v[3]:1)>=.45;
  }
  function onSurface(p,top){ for(var e=p;e&&e!==top;e=e.parentElement) if(opaque(e)) return true; return false }
  function slide(el){
    /* the title gets a plate that hugs its text */
    var h=el.querySelector('.hd h2'); if(h&&!h.querySelector('.tp')) h.innerHTML='<span class="tp">'+h.innerHTML+'</span>';
    /* answer buttons that are not inside a card stand straight on the picture: they become solid cards themselves */
    var BOX='.panel,.frm,.mod,.qd,.rc,.mrc,.pq,.goal,.tq,.sent,.stp,.rcard,.tile,.qr,.cls,.tray,.mtray,.zone';
    Array.prototype.forEach.call(el.querySelectorAll('.opt'),function(o){ if(!o.parentElement.closest(BOX)) o.classList.add('solo') });
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),t,seen=[];
    while((t=w.nextNode())){
      if(!t.nodeValue.trim()) continue;
      var p0=t.parentElement; if(!p0||p0.closest(CARD)||onSurface(p0,el)) continue;
      var p=p0;
      while(p&&p!==el&&/^(inline|inline-block|contents)$/.test(getComputedStyle(p).display)) p=p.parentElement;
      if(p&&p!==el&&p.querySelector(CARD)) p=p0;   /* the container also holds buttons or cards: plate only the text itself */
      if(!p||p===el||p.classList.contains('body')||seen.indexOf(p)>=0||(p!==p0&&p.querySelector(CARD))) continue;
      seen.push(p); p.classList.add('onpic');
    }
  }
  return {slide:slide};
})();
