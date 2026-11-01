/* ---------- helpers for the petroleum lesson: the eight fractions of the fractionating tower (book table 4-7 and figure 4-3) ---------- */
var FR=[
 {k:'gas',  n:'غازات مصافي التكرير',  c:'1–4',   t:'أقل من 25',  tf:'25 °C',     u:'غازات معبّأة للتدفئة والطبخ'},
 {k:'gasl', n:'الجازولين (بنزين السيارات)', c:'4–12',  t:'40–100',  tf:'40–100 °C',  u:'وقود للسيارات'},
 {k:'naph', n:'النفثا',               c:'7–14',  t:'90–150',   tf:'90–150 °C',  u:'صنع المواد الكيميائية'},
 {k:'kero', n:'الكيروسين (البارافين)', c:'12–16', t:'150–240',  tf:'150–240 °C', u:'وقود المحركات النفاثة وزيت التسخين'},
 {k:'dies', n:'زيت الديزل / زيت الغاز', c:'14–18', t:'220–300',  tf:'220–300 °C', u:'وقود محركات الديزل (الشاحنات)'},
 {k:'fuel', n:'زيت الوقود',           c:'19–25', t:'250–320',  tf:'250–320 °C', u:'وقود للسفن'},
 {k:'lube', n:'زيت التشحيم',          c:'20–40', t:'300–350',  tf:'300–350 °C', u:'التشميع والتلميع'},
 {k:'asph', n:'الأسفلت',              c:'أكثر من 70', t:'أعلى من 350', tf:'> 340 °C', u:'صنع القطران (القار) لتعبيد الطرق'}
];
var LVC=['#6fd3ef','#7fc6e8','#9fd0a8','#d8d36a','#f0b24f','#ee8a3f','#e1613a','#b43a2c'];   /* the colour of each level: cool at the top, hot at the bottom */
/* the fractionating tower: the furnace, the column of 8 bands and the temperatures; o.names shows the names on the bands, o.temps the temperatures */
function towerHTML(o){
  o=o||{};
  var rows=FR.map(function(f,i){
    return '<div class="twrow"><button type="button" class="lv" data-i="'+i+'" style="'+(i>=7?'color:#fff;':'')+'background:linear-gradient(180deg,'+LVC[i]+','+LVC[i]+'dd)'+(i===0?';border-radius:26px 26px 4px 4px':i===7?';border-radius:4px 4px 12px 12px':'')+'"><span class="nm'+(o.names?'':' hide')+'">'+f.n+'</span></button><span class="tt num lbl'+(o.temps?'':' hide')+'">'+f.tf+'</span></div>';
  }).join('');
  var furn='<svg viewBox="0 0 120 150" width="118" aria-hidden="true" style="direction:ltr;overflow:visible"><path d="M30 138 L30 84 Q60 30 90 84 L90 138 Z" fill="#c85a2f" stroke="#ffcf8b" stroke-width="3"/><path d="M42 138 Q42 100 60 90 Q78 100 78 138 Z" fill="#ffb347"/><path d="M12 118 H34" stroke="#7c5a2a" stroke-width="9" stroke-linecap="round"/><path d="M92 112 H118" stroke="#e8b04a" stroke-width="7" stroke-linecap="round"/></svg><div class="furl">مرجل (وحدة تسخين)</div>';
  return '<div class="twrw"><div class="furn">'+furn+'<div class="cru">البترول (النفط الخام)</div></div><div class="twcol">'+rows+'</div></div>';
}
/* a row of dots: the length of the carbon chain of a fraction (the range is C1 .. C70) */
function chainBar(f){
  var a=f.c.replace(/[^0-9–]/g,'').split('–'), lo=+a[0]||70, hi=+a[1]||70, W=300, x0=lo/70*W, x1=hi/70*W;
  return '<div style="position:relative;height:26px;background:rgba(var(--d2),.7);border-radius:13px;box-shadow:inset 0 0 0 2px var(--line);overflow:hidden"><i style="position:absolute;top:0;bottom:0;right:'+(W-x1)+'px;width:'+Math.max(10,x1-x0)+'px;background:linear-gradient(90deg,#F3D27A,#D9A92B);border-radius:13px;direction:ltr"></i></div>';
}
function bp2(f){return f.t}

/* the carbon range of a fraction as a label: C4–C12, > C70 */
function cLabel(f){return /^أكثر/.test(f.c)?'> C70':'C'+f.c.replace('–','–C')}
