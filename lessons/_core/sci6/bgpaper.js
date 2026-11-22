/* ---------- the background of the light primary-school look (skin 'sci'): none to load, the stage paints its own cream notebook paper (sci6.css).
   Keeps the small interface the player and the stickers expect from the background engine (mount, go, tier, cycle...). tier 1 = the calm set of slide transitions. ---------- */
var BG=(function(){
  return {
    mount:function(v){ if(v) v.setAttribute('data-fx','1'); document.documentElement.setAttribute('data-fx','1') },
    go:function(){}, register:function(){}, setTier:function(){}, cycle:function(){}, auto:function(){},
    tier:function(){ return 1 },
    stats:function(){ return {ema:0,frames:0,gl:false,tier:1,W:1280,H:720,S:1} }
  };
})();
