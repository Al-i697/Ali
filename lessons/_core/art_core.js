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
