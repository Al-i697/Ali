/* ---------- helpers for the alkanes lesson: alkane data, structural-formula drawings, small widgets ---------- */
var ALK=[
 {n:1,f:'CH4',name:'ميثان',bp:-164,st:'غاز'},{n:2,f:'C2H6',name:'إيثان',bp:-87,st:'غاز'},{n:3,f:'C3H8',name:'بروبان',bp:-42,st:'غاز'},
 {n:4,f:'C4H10',name:'بيوتان',bp:0,st:'غاز'},{n:5,f:'C5H12',name:'بنتان',bp:36,st:'سائل'},{n:6,f:'C6H14',name:'هكسان',bp:69,st:'سائل'}
];
var PREF=['ميث','إيث','بروب','بيوت','بنت','هكس'];
/* the structural formula of the straight-chain alkane with n carbons (every atom and bond shown); o.w sets the width in px, o.hl colours one carbon */
function alkSVG(n,o){
  o=o||{}; var g=58, pad=54, W=2*pad+(n-1)*g, H=132, y0=66, s='', i, x;
  for(i=0;i<n;i++){ x=pad+i*g; if(i<n-1) s+=bnd(x,y0,x+g,y0,5); s+=bnd(x,y0,x,y0-40,4)+bnd(x,y0,x,y0+40,4); }
  s+=bnd(pad,y0,pad-36,y0,4)+bnd(pad+(n-1)*g,y0,pad+(n-1)*g+36,y0,4);
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0-40,12,'H')+atm(x,y0+40,12,'H'); }
  s+=atm(pad-36,y0,12,'H')+atm(pad+(n-1)*g+36,y0,12,'H');
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0,i===o.hl?19:17,'C'); }
  var out='<svg viewBox="0 0 '+W+' '+H+'" width="'+(o.w||W)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+'</svg>';
  return (o.w&&o.w<190)?noTxt(out):out;
}
/* the skeleton of the n-carbon alkane with every hydrogen as a dashed empty place the student fills by pressing it */
function fillSVG(n){
  var g=62, pad=62, W=2*pad+(n-1)*g, H=170, y0=85, s='', i, x, k=0, hs='';
  for(i=0;i<n;i++){ x=pad+i*g; if(i<n-1) s+=bnd(x,y0,x+g,y0,5); }
  function slot(sx,sy,x1,y1){ var id=k++; return '<g class="hslot" data-k="'+id+'" style="cursor:pointer">'+'<g class="hh">'+bnd(x1,y1,sx,sy,4)+atm(sx,sy,15,'H')+'</g><circle class="dot" cx="'+sx+'" cy="'+sy+'" r="15" fill="rgba(228,188,75,.10)" stroke="var(--gold)" stroke-width="2.5" stroke-dasharray="5 5"/></g>'; }
  for(i=0;i<n;i++){ x=pad+i*g; hs+=slot(x,y0-52,x,y0)+slot(x,y0+52,x,y0); }
  hs+=slot(pad-48,y0,pad,y0)+slot(pad+(n-1)*g+48,y0,pad+(n-1)*g,y0);
  for(i=0;i<n;i++){ x=pad+i*g; s+=atm(x,y0,20,'C'); }
  return {svg:'<svg viewBox="0 0 '+W+' '+H+'" width="'+Math.round(W*1.5)+'" aria-hidden="true" style="direction:ltr;overflow:visible">'+s+hs+'</svg>',count:k};
}
