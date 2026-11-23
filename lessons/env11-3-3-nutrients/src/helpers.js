/* ---------- helpers for the environmental science lesson 3-3: explanation slides, ions, photographs, pictures that follow the points ---------- */

/* a term: Arabic name with its English form (the book gives both) */
function tm(a,e){ return '<b>'+a+'</b>'+(e?' <span class="en">'+e+'</span>':'') }

/* an ion or a gas formula in running text: ion('NO3','−') -> NO3 with its subscript and charge; ion('Mg','2+') */
function ion(f,ch){ return '<span class="ion" dir="ltr">'+sub(f)+(ch?'<sup>'+ch+'</sup>':'')+'</span>' }

/* a photograph of the book inside a card, with its caption */
function phHTML(key,cap,w,h){ return '<figure class="phf"><img src="'+PHOTO[key]+'" alt="" style="width:'+(w||260)+'px'+(h?';height:'+h+'px':'')+'"><figcaption>'+cap+'</figcaption></figure>' }

/* a picture that follows the points: its parts carry data-s="n" and show when n points are showing (or fewer) */
function ptSync(el){
  var pts=$$('[data-pt]',el);
  function upd(){
    var n=pts.filter(function(p){return !p.classList.contains('pt-h')}).length;
    $$('[data-s]',el).forEach(function(g){ g.classList.toggle('on',+g.getAttribute('data-s')<=n) });
  }
  if(window.MutationObserver){ var mo=new MutationObserver(upd); pts.forEach(function(p){ mo.observe(p,{attributes:true,attributeFilter:['class']}) }) }
  upd();
}

/* show every part of a picture that follows the points (for slides where the points are not used) */
function allOn(el){ $$('[data-s]',el).forEach(function(g){ g.classList.add('on') }) }

/* Explanation slide, the way the teacher teaches it: a lead-in question first (right column), then the points one click at a time (middle column),
   and, when the slide has a picture, the picture in its own column on the left (it can follow the points: ptSync).
   o: {id,ch,title,tag,lead:{q,opts:[{t,ok,why}],gbar},fig:html under the question,fig2:html in the picture column,fw:its width,pts:[html or {html}],lw:width of the question column,sync:true,init,note} */
/* where the right choice of a lead-in question sits (first, middle or last): a fixed rotation so it is not always in the same place (teacher's rule); o.lead.at overrides */
var AT_SEQ=[1,2,0,0,2,1,2,0,1], AT_N=0;
function placeOk(root,opts,at){
  var box=$('.opts',root); if(!box) return;
  var ok=-1; opts.forEach(function(x,i){ if(x.ok) ok=i });
  var kids=Array.prototype.slice.call(box.children), me=kids.filter(function(k){return +k.getAttribute('data-i')===ok})[0];
  if(!me) return;
  box.removeChild(me); var rest=Array.prototype.slice.call(box.children);
  if(at>=rest.length) box.appendChild(me); else box.insertBefore(me,rest[at]);
  Array.prototype.slice.call(box.children).forEach(function(k,n){ var ix=k.querySelector('.ix'); if(ix) ix.textContent='أبجدهـ'[n] });
}
function explain(o){
  var at=(o.lead&&o.lead.at!=null)?o.lead.at:AT_SEQ[AT_N++%AT_SEQ.length];
  slide({id:o.id,ch:o.ch,title:o.title,tag:o.tag,
   html:function(){
    var L='';
    if(o.lead){
      L+='<div class="panel lq'+((o.fig||o.leadTop)?' cmp':'')+'" style="padding:14px 18px;gap:8px"><div class="q">'+o.lead.q+'</div>'+optsHTML(o.lead.opts)+'<div class="fb" style="min-height:26px"></div></div>';
      if(o.lead.gbar) L+='<div class="gbar hide" id="gb" style="font-size:21px">'+o.lead.gbar+'</div>';
    }
    if(o.fig) L+=o.fig;
    var P='<div class="col" style="flex:1;min-width:0;gap:'+(o.gap||10)+'px;justify-content:center">'+(o.leadTop?L:'')+o.pts.map(function(h){return typeof h==='string'?'<div class="panel pb" data-pt'+(o.fs?' style="font-size:'+o.fs+'px"':'')+'>'+h+'</div>':h.html}).join('')+'</div>';
    var F=o.fig2?'<div class="col" style="width:'+(o.fw||430)+'px;flex:none;gap:10px;justify-content:center">'+o.fig2+'</div>':'';
    return '<div style="display:flex;gap:20px;flex:1;align-items:stretch">'+(L&&!o.leadTop?'<div class="col" style="width:'+(o.lw||440)+'px;flex:none;gap:12px;justify-content:center">'+L+'</div>':'')+P+F+'</div>';
   },
   init:function(el){
    if(o.lead){ bindMcq($('.lq',el),o.lead.opts,$('.fb',el),function(){ unhide(el) }); placeOk($('.lq',el),o.lead.opts,at) }
    if(o.sync) ptSync(el);
    if(o.init) o.init(el);
   },
   note:o.note});
}

/* question cards: each card is a question; pressing it shows the model answer. items [question, answer] */
function qaHTML(items,x){ return cardsHTML(items,'qa'+(x?' '+x:'')) }

/* a row of answer boxes under a figure: items [[id,label,unit]] (uses the shared numeric boxes) */
function ansRow(items){ return items.map(function(it){return '<div style="display:flex;align-items:center;gap:10px;font-size:21px"><span style="min-width:150px;font-weight:700">'+it[1]+'</span>'+nin(it[0],it[2]||'')+'</div>'}).join('') }

/* the numbered list of a classification slide in two columns: items [html, right key, message] */
function clsCols(items,choices,fs){
  var h=Math.ceil(items.length/2);
  return '<div class="cls3" style="display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;direction:rtl"><div class="col" style="gap:6px">'+clsHTML(items.slice(0,h),choices,fs)+'</div><div class="col" style="gap:6px">'+clsHTML(items.slice(h),choices,fs)+'</div></div>';
}
