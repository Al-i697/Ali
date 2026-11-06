/* ---------- lesson 2-2 helpers: eqn() and the band sorter come from lesson 2-1; the template frames are new ---------- */
function eqn(s){ return '<bdi dir="ltr" class="num">'+sub(String(s).replace(/\^([0-9]*[+\-−]?)/g,'<sup>$1</sup>'))+'</bdi>' }

/* sorting chips into bands: chips [key, html, band key, message when right, message when wrong]; the bands are .band[data-b] boxes holding a .bchips line */
function bindBands(el,chips,o){
  o=o||{}; var tray=$('#tray',el), fb=$(o.fb||'.fb',el), left=chips.length, sel=null;
  function place(c,band){
    var it=chips.filter(function(x){return x[0]===c.getAttribute('data-k')})[0];
    if(it[2]===band.getAttribute('data-b')){
      $('.bchips',band).appendChild(c); c.classList.add('ok-b','locked'); c.style.cursor='default'; left--;
      say(fb,'✓ '+it[3],'ok');
      if(!left){ tray.classList.add('hide'); unhide(el); if(o.onDone) o.onDone() }
      return true;
    }
    band.classList.add('shake'); later(function(){band.classList.remove('shake')},340); say(fb,it[4],'bad'); return false;
  }
  chips.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'; c.setAttribute('data-k',it[0]); c.innerHTML=it[1]; if(o.css) c.style.cssText=o.css; tray.appendChild(c);
    drag(c,{zone:'.band',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.band',el).forEach(function(b){b.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,b); sel.style.outline=''; sel=null } })});
}

/* ---------- the template frames the teacher sent: the picture fills the stage (1280 x 720) and live text is laid over its empty boxes ---------- */
/* a frame: the picture and the boxes over it; flip mirrors the picture (only for text-less frames) */
function frame(name,inner,o){ o=o||{}; return '<div class="tpl'+(o.cls?' '+o.cls:'')+'"><img class="bgp'+(o.flip?' flip':'')+'" alt="" src="'+IMG[name]+'">'+inner+'</div>' }
/* a box over the picture: x, y, width, height are in stage pixels; kind: 'l' light panel, 'd' dark panel, 'n' no fill */
function tb(x,y,w,h,html,kind,st,at){
  var cl='tb '+(kind||'n'); at=(at||'').replace(/class="([^"]*)"/,function(m,c){ cl+=' '+c; return '' });   /* a class in the attributes joins the box's classes */
  return '<div class="'+cl+'" style="left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;'+(st||'')+'"'+(at.trim()?' '+at.trim():'')+'>'+html+'</div>';
}
/* a round numbered badge centred on x, y */
function bdg(x,y,t,at,cls){ return '<button type="button" class="bdg'+(cls?' '+cls:'')+'" style="left:'+x+'px;top:'+y+'px" '+(at||'')+'>'+t+'</button>' }
/* a part of a frame shown on its own, W pixels wide: (x, y, w, h) in frame pixels; marks [[fx, fy, html, class, attrs]] are placed in frame coordinates */
function crop(name,x,y,w,h,W,marks,cls){
  var k=W/w, H=Math.round(h*k);
  return '<div class="crop'+(cls?' '+cls:'')+'" style="width:'+W+'px;height:'+H+'px;background-image:url('+IMG[name]+');background-size:'+Math.round(1280*k)+'px '+Math.round(720*k)+'px;background-position:'+Math.round(-x*k)+'px '+Math.round(-y*k)+'px">'+
    (marks||[]).map(function(m){return '<span class="mk '+(m[3]||'')+'" style="left:'+Math.round((m[0]-x)*k)+'px;top:'+Math.round((m[1]-y)*k)+'px" '+(m[4]||'')+'>'+m[2]+'</span>'}).join('')+'</div>';
}
/* the cut-outs (real transparency): size of each picture, so that a half of it can be shown on its own */
var IMGD={pig_bof:[900,425],ladle_scrap:[670,985],ladles_pour:[900,646]};
/* a picture with a transparent background, w pixels wide; part 'l' or 'r' shows the left or the right half only */
function cut(name,w,part,cls){
  var pc=IMG[name], d=IMGD[name];
  if(!part) return '<img class="cut'+(cls?' '+cls:'')+'" alt="" src="'+pc+'" style="width:'+w+'px;height:'+Math.round(w*d[1]/d[0])+'px">';
  return '<div class="cut half'+(cls?' '+cls:'')+'" style="width:'+w+'px;height:'+Math.round(w*d[1]/(d[0]/2))+'px;background-image:url('+pc+');background-size:200% 100%;background-position:'+(part==='l'?'0':'100%')+' 50%"></div>';
}
