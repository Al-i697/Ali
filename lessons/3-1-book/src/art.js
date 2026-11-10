/* ---------- art: blueprint line drawings and shaded spheres (all code, no images) ---------- */
var CY='var(--cyan)', GD='#E4BC4B', INK='#f4fbf8';
function defsSVG(){
  function g(id,a,b){return '<radialGradient id="g'+id+'" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></radialGradient>'}
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+
    g('H','#FFFFFF','#9DB6CC')+g('C','#8C97A4','#1D232A')+g('N','#8FB0FF','#2A55C9')+g('O','#FF9A8C','#C62F22')+g('Cl','#A6F08F','#2E9B2C')+
    g('Br','#E09373','#7A2E17')+g('F','#CDF5AA','#5FA83A')+g('I','#BE97E6','#59307F')+g('Na','#D8B9FF','#8049D6')+g('Si','#C9D0D8','#68717B')+
    g('B','#FFCDC8','#D1736C')+g('Al','#D8E4F0','#7E96AE')+g('Mg','#D2E8FF','#4A8FDB')+g('He','#FFE4AE','#E88B16')+g('P','#FFDC96','#D98A12')+g('K','#E6CCFF','#8B54CF')+
    g('Gold','#FFEEB4','#C98A0A')+g('Cyan','#D6FFF0','#10B088')+g('Cyan_navy','#DCEEFF','#2A7FE0')+g('Cyan_ember','#FFE6CC','#E8731A')+g('Cyan_gold','#FFFFFF','#9A9AA8')+g('Cyan_violet','#EBDDFF','#7B4FD8')+g('Silver','#F4F8FC','#8798AB')+g('Red','#FF9E90','#D12B1F')+
    '</defs></svg>';
}
/* a shaded sphere, optionally with a label */
function ball(x,y,r,grad,label,ink,fs){
  return '<circle class="s" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#g'+grad+')" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/>'+
    (label?'<text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" direction="ltr" font-family="Cairo,Tajawal,sans-serif" font-weight="800" font-size="'+(fs||r*.9)+'" fill="'+(ink||'#0b1a2e')+'" style="pointer-events:none">'+label+'</text>':'');
}
var NUC=[[0,0],[22,6],[-20,10],[8,-22],[-6,24],[24,-16],[-24,-14],[2,2],[30,22],[-30,24],[14,34],[-14,-34],[32,-2],[-34,2],[12,-38],[-10,40]];
function nucleus(cx,cy,list,r){ /* list: array of gradient names */
  var s=''; list.forEach(function(g,i){var p=NUC[i%NUC.length]; s+=ball(cx+p[0]*r/15,cy+p[1]*r/15,r,g)}); return s;
}
function orbit(cx,cy,rx,ry,rot,op){return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+(rot||0)+' '+cx+' '+cy+')" fill="none" stroke="'+CY+'" stroke-opacity="'+(op||.75)+'" stroke-width="2.4"/>'}
function grid(w,h,step,op){var s='';for(var x=0;x<=w;x+=step)s+='M'+x+' 0V'+h;for(var y=0;y<=h;y+=step)s+='M0 '+y+'H'+w;return '<path d="'+s+'" stroke="'+CY+'" stroke-opacity="'+(op||.08)+'" stroke-width="1" fill="none"/>'}

/* goals slide: concentric rings around a small nucleus */
function atomHero(){
  var s='<svg viewBox="0 0 360 360" aria-hidden="true"><g class="glow">';
  [70,105,140,172].forEach(function(r,i){s+='<circle cx="180" cy="180" r="'+r+'" fill="none" stroke="'+CY+'" stroke-opacity="'+(.85-i*.12)+'" stroke-width="'+(i%2?2:3)+'"/>'});
  [[180,8,'Silver'],[180,352,'Silver'],[8,180,'Silver'],[352,180,'Silver'],[75,75,'Cyan'],[285,285,'Cyan'],[108,255,'Silver'],[252,105,'Silver']].forEach(function(b){s+=ball(b[0],b[1],10,b[2])});
  s+='</g>'+nucleus(180,180,['Silver','Cyan','Silver','Cyan','Silver','Cyan','Silver','Cyan','Silver'],16)+'</svg>';
  return s;
}
/* atom with gold nucleus and red electrons on three tilted orbits (deck slide 4) */
function atomParts(){
  var s='<svg viewBox="0 0 520 440" aria-label="ذرة: نواة ذهبية وإلكترونات حمراء تدور حولها">';
  s+='<g class="glow">'+orbit(260,220,230,84,0)+orbit(260,220,230,84,60,.6)+orbit(260,220,230,84,-60,.6)+'</g>';
  s+='<g class="part" data-p="e">';
  [[486,220],[88,92],[88,352],[372,82],[148,360],[318,370]].forEach(function(e){s+=ball(e[0],e[1],11,'Red')+'<circle cx="'+e[0]+'" cy="'+e[1]+'" r="26" fill="transparent"/>'});
  s+='</g><g class="part glowg" data-p="nuc"><circle cx="260" cy="220" r="76" fill="transparent"/>'+nucleus(260,220,['Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold','Gold'],17)+'</g></svg>';
  return s;
}
/* line icons (deck slide 2) */
function iconAgri(){return '<svg viewBox="0 0 200 140" class="glow" aria-hidden="true"><g fill="none" stroke="'+CY+'" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="58" cy="100" r="26"/><circle cx="58" cy="100" r="11"/><circle cx="132" cy="108" r="17"/><path d="M58 74V52h52l18 24h14v14"/><path d="M84 52V30h30v22"/><path d="M150 96c8-26 26-34 40-30-4 18-18 30-40 30z"/><path d="M150 96c0 14-4 24-10 32M170 110c4 6 6 12 6 18"/></g><text x="150" y="132" fill="'+GD+'" font-family="Cairo" font-weight="800" font-size="15" text-anchor="middle" direction="ltr">N-P-K</text></svg>'}
function iconEnv(){return '<svg viewBox="0 0 200 140" class="glow" aria-hidden="true"><g fill="none" stroke="'+CY+'" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="64" r="48"/><ellipse cx="100" cy="64" rx="22" ry="48"/><path d="M52 64h96M62 40h76M62 88h76"/><path d="M100 36c18 8 22 26 4 44-18-14-22-34-4-44z" stroke="'+GD+'"/><path d="M26 124c20-8 36 6 74-2s58 6 74-2"/><path d="M170 28c8-4 14 0 18 6M168 44c10-3 16 2 20 8"/></g></svg>'}
function iconMed(){return '<svg viewBox="0 0 200 140" class="glow" aria-hidden="true"><g fill="none" stroke="'+CY+'" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M70 14h28v26h26v28H98v26H70V68H44V40h26z"/><circle cx="84" cy="54" r="9" stroke="'+GD+'"/><path d="M118 100h64l-8 28h-48z"/><path d="M150 100l22-26"/><rect x="26" y="100" width="46" height="22" rx="11"/><path d="M49 100v22"/></g></svg>'}
/* shop scale with vegetables (deck slide 3) */
function shopScale(){
  var s='<svg viewBox="0 0 330 250" class="glow" aria-label="ميزان في مركز تسوق عليه خضار"><g fill="none" stroke="'+CY+'" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">';
  s+='<path d="M26 238h196v-18H26z"/><path d="M44 220c2-46 14-74 34-96h72c20 22 32 50 34 96"/>';
  s+='<path d="M60 124c6-36 28-58 68-58s62 22 68 58"/><path d="M128 124V84"/><path d="M92 112l-14-10M164 112l14-10M128 70v14M100 78l6 10M156 78l-6 10"/>';
  s+='<circle cx="128" cy="168" r="26"/><circle cx="128" cy="168" r="10"/><path d="M128 168l12-10" stroke="'+GD+'"/>';
  s+='<path d="M226 190c0-18 80-18 80 0"/><path d="M226 190h80"/><path d="M266 190v28"/><path d="M246 220h40"/>';
  s+='<circle cx="246" cy="172" r="15" stroke="'+GD+'"/><circle cx="276" cy="168" r="13"/><path d="M280 146c6-5 9-12 6-20-9 3-13 9-13 17"/><path d="M296 176l22-16" stroke-width="5"/>';
  s+='</g></svg>'; return s;
}
function atomQ(){
  var s='<svg viewBox="0 0 330 250" class="glow" aria-label="ذرة وعلامة استفهام"><g fill="none" stroke="'+CY+'" stroke-width="3" stroke-linecap="round">';
  s+='<ellipse cx="86" cy="130" rx="74" ry="28"/><ellipse cx="86" cy="130" rx="74" ry="28" transform="rotate(60 86 130)"/><ellipse cx="86" cy="130" rx="74" ry="28" transform="rotate(120 86 130)"/></g>';
  s+=ball(86,130,11,'Gold')+ball(150,112,7,'Silver')+ball(30,156,7,'Silver')+ball(110,60,7,'Silver');
  s+='<g fill="none" stroke="'+CY+'" stroke-width="3" stroke-linecap="round"><path d="M166 130h20M176 120v20"/><path d="M166 176h20"/></g>';
  s+='<path d="M224 96c0-26 22-36 44-30s30 30 8 50c-14 12-22 20-22 34" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round"/><circle cx="252" cy="190" r="13" fill="#fff"/></svg>';
  return s;
}
/* NPK bag in line style */
function bagArt(){
  return '<svg viewBox="0 0 280 330" class="glow" aria-label="كيس سماد مكتوب عليه ٥-١٠-٥"><g fill="none" stroke="'+CY+'" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"><path d="M52 70h176l16 232q-104 22-208 0z"/><path d="M52 70q88-28 176 0"/><path d="M84 40h112l32 30H52z"/></g><rect x="70" y="124" width="140" height="126" rx="10" fill="rgba(228,188,75,.12)" stroke="'+GD+'" stroke-width="3"/><text x="140" y="154" text-anchor="middle" font-family="Cairo" font-weight="700" font-size="18" fill="'+CY+'" direction="ltr">N – P – K</text><text x="140" y="214" text-anchor="middle" font-family="Cairo" font-weight="800" font-size="44" fill="'+GD+'" direction="ltr">5-10-5</text><text x="140" y="240" text-anchor="middle" font-family="Cairo" font-weight="700" font-size="16" fill="#f4fbf8">FERTILISER</text></svg>';
}
/* carbon-12 builder art: nucleus from counts, electrons, mass-number arrows */
function c12Svg(p,n){
  var s='<svg viewBox="0 0 400 330" aria-label="نواة ذرة">';
  s+='<g class="glow"><circle cx="200" cy="165" r="62" fill="none" stroke="'+CY+'" stroke-opacity=".8" stroke-width="2.4"/><circle cx="200" cy="165" r="108" fill="none" stroke="'+CY+'" stroke-opacity=".55" stroke-width="2.4"/></g>';
  var list=[]; for(var i=0;i<Math.max(p,n);i++){ if(i<p) list.push('Cyan'); if(i<n) list.push('Silver') }
  s+=nucleus(200,165,list,15);
  var inner=Math.min(p,2), outer=Math.max(0,Math.min(p-2,4));
  for(var k=0;k<inner;k++){var a=k*Math.PI+Math.PI/2; s+=ball(200+62*Math.cos(a),165-62*Math.sin(a),11,'Cyan','−','#06303a',16)}
  for(var j=0;j<outer;j++){var b=j*Math.PI/2+Math.PI/4; s+=ball(200+108*Math.cos(b),165-108*Math.sin(b),11,'Cyan','−','#06303a',16)}
  s+='</svg>'; return s;
}
/* cube box (number line, deck slide 14) */
function cubeBox(x,y,w,txt,hl){
  var d=9, c=hl?GD:INK;
  return '<g stroke="'+c+'" stroke-width="2" fill="rgba(var(--t2),.08)" stroke-opacity=".9"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+w+'" rx="3"/><path d="M'+x+' '+y+'l'+d+' -'+d+'h'+w+'l-'+d+' '+d+'M'+(x+w)+' '+y+'l'+d+' -'+d+'v'+w+'l-'+d+' '+d+'" fill="none"/></g>'+
    '<text x="'+(x+w/2)+'" y="'+(y+w/2)+'" text-anchor="middle" dominant-baseline="central" direction="ltr" font-family="Cairo" font-weight="800" font-size="24" fill="'+(hl?GD:CY)+'">'+txt+'</text>';
}
/* water-like molecule and ionic lattice (deck slide 11) */
function moleculeArt(){
  return '<svg viewBox="0 0 300 220" aria-label="نموذج جزيء">'+bond(150,76,92,150,8)+bond(150,76,208,150,8)+
    '<g class="sph" data-el="O">'+ball(150,76,38,'Cyan')+'</g><g class="sph" data-el="H">'+ball(92,150,28,'Gold')+'</g><g class="sph" data-el="H">'+ball(208,150,28,'Gold')+'</g></svg>';
}
function latticeArt(){
  var s='<svg viewBox="0 0 400 250" aria-label="تركيب أيوني ضخم"><g stroke="'+INK+'" stroke-opacity=".35" stroke-width="1.6" fill="none">', P=[], r, c, k;
  for(r=0;r<3;r++)for(c=0;c<4;c++){ P.push([60+c*84+r*36, 52+r*72, (r+c)%2]) }
  for(r=0;r<3;r++)for(c=0;c<4;c++){ var i=r*4+c; if(c<3) s+='M'+P[i][0]+' '+P[i][1]+'L'+P[i+1][0]+' '+P[i+1][1]; if(r<2) s+='M'+P[i][0]+' '+P[i][1]+'L'+P[i+4][0]+' '+P[i+4][1] }
  s=s.replace(/M/g,'M'); s+='</g>';
  var path=''; /* build line path properly */
  s='<svg viewBox="0 0 400 250" aria-label="تركيب أيوني ضخم"><path d="';
  for(r=0;r<3;r++)for(c=0;c<4;c++){ var q=r*4+c; if(c<3) s+='M'+P[q][0]+' '+P[q][1]+'L'+P[q+1][0]+' '+P[q+1][1]; if(r<2) s+='M'+P[q][0]+' '+P[q][1]+'L'+P[q+4][0]+' '+P[q+4][1] }
  s+='" stroke="'+INK+'" stroke-opacity=".4" stroke-width="2" fill="none"/>';
  P.forEach(function(p){ s+='<g class="sph" data-el="'+(p[2]?'Na':'Cl')+'">'+ball(p[0],p[1],p[2]?17:23,p[2]?'Gold':'Cyan')+'</g>' });
  return s+'</svg>';
}
