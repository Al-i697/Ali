/* ---------- 3D molecule backgrounds ----------
   Real 3D, drawn live on the 2D canvas: ball-and-stick models turn slowly in perspective, with shaded spheres, tube bonds,
   depth fog and soft bokeh at different depths. Used through BG.register(name, MOL3D.scene(spec)).
   spec = {mols:[{m:'methane', x:.72, y:.5, s:1.2, spin:.3, pitch:.35, ph:0, roll:0}], dust:34}
   x, y are fractions of the stage; s scales the model; spin is radians per second. */
var MOL3D=(function(){
  var EL={C:{r:.60,c:[118,132,158]},H:{r:.36,c:[244,247,252]},O:{r:.56,c:[240,72,64]},Br:{r:.76,c:[196,96,38]},N:{r:.56,c:[84,126,245]},Cl:{r:.68,c:[70,204,104]},M:{r:.62,c:[205,176,122]},E:{r:.17,c:[110,205,255]}};   /* M: a metal cation (bronze), E: a free electron */
  function add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]]}
  function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
  function mul(a,k){return[a[0]*k,a[1]*k,a[2]*k]}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
  function crs(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
  function len(a){return Math.sqrt(dot(a,a))}
  function nrm(a){var l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]}
  function rot(v,axis,t){var c=Math.cos(t),s=Math.sin(t);return add(add(mul(v,c),mul(crs(axis,v),s)),mul(axis,dot(axis,v)*(1-c)))}

  /* directions of the missing hydrogens around a carbon, from the unit vectors to its neighbours */
  function hdirs(nb,sp2){
    var n=nb.length,a,p,b,k,out=[];
    if(n===0){return [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(nrm)}
    if(n===1){
      a=mul(nb[0],-1);
      if(sp2){p=nrm(crs([0,0,1],a));return [add(mul(a,.5),mul(p,.866)),add(mul(a,.5),mul(p,-.866))]}
      p=nrm(crs(a,Math.abs(a[2])<.9?[0,0,1]:[0,1,0]));
      for(k=0;k<3;k++)out.push(add(mul(a,.333),mul(rot(p,a,k*2.0944),.943)));
      return out;
    }
    if(n===2){
      b=nrm(mul(add(nb[0],nb[1]),-1));
      if(sp2)return [b];
      var nn=nrm(crs(nb[0],nb[1]));
      return [add(mul(b,.577),mul(nn,.816)),add(mul(b,.577),mul(nn,-.816))];
    }
    if(n===3)return [nrm(mul(add(add(nb[0],nb[1]),nb[2]),-1))];
    return [];
  }

  /* chain: n carbons in a zig-zag; dbl = index of the first carbon of a C=C (or -1); subs = {carbon:[element, sign]} */
  function chain(n,dbl,subs,tail){
    subs=subs||{};
    var at=[],bd=[],C=[],i,x=0,y=0,phi=31*Math.PI/180,sg=1,tailAtom=tail;
    var pos=[[0,0,0]];
    for(i=0;i<n-1;i++){var L=i===dbl?1.34:1.52;pos.push([pos[i][0]+L*Math.cos(phi),pos[i][1]+sg*L*Math.sin(phi),0]);sg=-sg}
    pos.forEach(function(p){at.push({e:'C',p:p});C.push(at.length-1)});
    for(i=0;i<n-1;i++)bd.push([C[i],C[i+1],i===dbl?2:1]);
    for(i=0;i<n;i++){
      var nb=[];if(i>0)nb.push(nrm(sub(pos[i-1],pos[i])));if(i<n-1)nb.push(nrm(sub(pos[i+1],pos[i])));
      var sp2=(i===dbl||i===dbl+1)&&dbl>=0, hd=hdirs(nb,sp2), sb=subs[i];
      if(sb){
        var pick=0,best=-9,k;for(k=0;k<hd.length;k++){var sc=hd[k][2]*sb[1]+hd[k][1]*.01;if(sc>best){best=sc;pick=k}}
        var d=hd.splice(pick,1)[0],el=sb[0];
        if(el==='OH'){
          var o=add(pos[i],mul(d,1.43));at.push({e:'O',p:o});var oi=at.length-1;bd.push([C[i],oi,1]);
          var side=nrm(crs(d,[0,0,1]));if(len(side)<.2)side=[0,1,0];
          at.push({e:'H',p:add(o,mul(nrm(add(mul(d,.34),mul(side,.94))),.96))});bd.push([oi,at.length-1,1]);
        }else{at.push({e:el,p:add(pos[i],mul(d,el==='Br'?1.94:1.77))});bd.push([C[i],at.length-1,1])}
      }
      hd.forEach(function(h){at.push({e:'H',p:add(pos[i],mul(h,1.09))});bd.push([C[i],at.length-1,1])});
    }
    return {at:at,bd:bd};
  }
  function ring6(){
    var at=[],bd=[],i,C=[];
    for(i=0;i<6;i++){var t=i*Math.PI/3,z=i%2?.26:-.26;at.push({e:'C',p:[1.45*Math.cos(t),1.45*Math.sin(t),z]});C.push(i)}
    for(i=0;i<6;i++)bd.push([i,(i+1)%6,1]);
    for(i=0;i<6;i++){
      var c=at[i].p,s=i%2?1:-1,rad=nrm([c[0],c[1],0]);
      at.push({e:'H',p:add(c,[0,0,1.09*s])});bd.push([i,at.length-1,1]);
      at.push({e:'H',p:add(c,mul(add(mul(rad,.94),[0,0,-.33*s]),1.09))});bd.push([i,at.length-1,1]);
    }
    return {at:at,bd:bd};
  }
  function lattice(at,dmin,dmax){
    var bd=[],i,j;
    for(i=0;i<at.length;i++)for(j=i+1;j<at.length;j++){var d=len(sub(at[i].p,at[j].p));if(d>dmin&&d<dmax)bd.push([i,j,1])}
    return {at:at,bd:bd};
  }
  function graphite(){
    var at=[],seen={},a=1.42,layer,q,r,k;
    for(layer=0;layer<2;layer++)for(q=-2;q<=2;q++)for(r=-2;r<=2;r++){
      if(Math.abs(q+r)>2)continue;
      var cx=a*1.5*q,cy=a*Math.sqrt(3)*(r+q/2);
      for(k=0;k<6;k++){var t=k*Math.PI/3,px=cx+a*Math.cos(t)+(layer?a:0),py=cy+a*Math.sin(t),key=layer+':'+px.toFixed(2)+':'+py.toFixed(2);if(!seen[key]){seen[key]=1;at.push({e:'C',p:[px,py,layer?1.55:-1.55]})}}
    }
    return lattice(at,1.3,1.55);
  }
  function diamond(){
    var at=[],a=3.57,F=[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]],i,j,k,f,b;
    for(i=-2;i<=2;i++)for(j=-2;j<=2;j++)for(k=-2;k<=2;k++)for(f=0;f<4;f++)for(b=0;b<2;b++){
      var p=[(i+F[f][0]+b*.25)*a,(j+F[f][1]+b*.25)*a,(k+F[f][2]+b*.25)*a];
      if(len(p)<4.0)at.push({e:'C',p:p});
    }
    return lattice(at,1.4,1.65);
  }
  /* a block of metal: a regular lattice of positive ions (M) with free electrons (E) wandering between them (they jitter in draw()) */
  function metal(){
    var at=[],i,j,k,a=2.05,s=11,n=0,tries=0;
    function r(){s=(s*16807)%2147483647;return (s-1)/2147483646}
    for(i=0;i<4;i++)for(j=0;j<3;j++)for(k=0;k<3;k++)at.push({e:'M',p:[(i-1.5)*a,(j-1)*a,(k-1)*a]});
    var ions=at.slice();
    while(n<46&&tries<4000){
      tries++;
      var p=[(r()-.5)*8.2,(r()-.5)*6.2,(r()-.5)*6.2],ok=true;
      for(i=0;i<ions.length;i++){if(len(sub(ions[i].p,p))<1.0){ok=false;break}}
      if(ok){at.push({e:'E',p:p,j:.5,ph:r()*6.28});n++}
    }
    return {at:at,bd:[]};
  }
  var BUILD={
    methane:function(){return chain(1,-1)},
    ethane:function(){return chain(2,-1)},
    propane:function(){return chain(3,-1)},
    butane:function(){return chain(4,-1)},
    pentane:function(){return chain(5,-1)},
    hexane:function(){return chain(6,-1)},
    chain8:function(){return chain(8,-1)},
    chain10:function(){return chain(10,-1)},
    chain12:function(){return chain(12,-1)},
    ethene:function(){return chain(2,0)},
    propene:function(){return chain(3,0)},
    butene:function(){return chain(4,0)},
    ethanol:function(){return chain(2,-1,{1:['OH',1]})},
    dibromoethane:function(){return chain(2,-1,{0:['Br',1],1:['Br',-1]})},
    ethyne:function(){return {at:[{e:'C',p:[-.6,0,0]},{e:'C',p:[.6,0,0]},{e:'H',p:[-1.66,0,0]},{e:'H',p:[1.66,0,0]}],bd:[[0,1,3],[0,2,1],[1,3,1]]}},
    co2:function(){return {at:[{e:'O',p:[-1.6,0,0]},{e:'C',p:[0,0,0]},{e:'O',p:[1.6,0,0]}],bd:[[0,1,2],[1,2,2]]}},
    h2o:function(){return {at:[{e:'O',p:[0,0,0]},{e:'H',p:[.76,.59,0]},{e:'H',p:[-.76,.59,0]}],bd:[[0,1,1],[0,2,1]]}},
    o2:function(){return {at:[{e:'O',p:[-.65,0,0]},{e:'O',p:[.65,0,0]}],bd:[[0,1,2]]}},
    h2:function(){return {at:[{e:'H',p:[-.4,0,0]},{e:'H',p:[.4,0,0]}],bd:[[0,1,1]]}},
    br2:function(){return {at:[{e:'Br',p:[-1.1,0,0]},{e:'Br',p:[1.1,0,0]}],bd:[[0,1,1]]}},
    ring:ring6, graphite:graphite, diamond:diamond, metal:metal
  };
  var DEFPX={methane:140,ethane:120,propane:104,butane:92,pentane:80,hexane:70,chain8:58,chain10:50,chain12:44,ethene:140,propene:112,butene:96,ethyne:120,ethanol:104,dibromoethane:92,co2:100,h2o:120,o2:110,h2:130,br2:100,ring:92,graphite:50,diamond:52,metal:46};
  var CACHE={};
  function build(name){
    if(CACHE[name])return CACHE[name];
    var m=BUILD[name](),c=[0,0,0];
    m.at.forEach(function(a){c=add(c,a.p)});c=mul(c,1/m.at.length);
    m.at.forEach(function(a){a.p=sub(a.p,c)});
    var R=0;m.at.forEach(function(a){R=Math.max(R,len(a.p)+EL[a.e].r)});m.R=R;
    return CACHE[name]=m;
  }

  /* shaded sphere sprites, one per element and palette accent */
  var SPR={};
  function ball(e,rim){
    var k=e+rim;if(SPR[k])return SPR[k];
    var c=document.createElement('canvas');c.width=c.height=112;var g=c.getContext('2d'),col=EL[e].c,rr=rim.split(',').map(Number);
    function mix(a,b,t){return Math.round(a+(b-a)*t)}
    function rgb(t,w){return 'rgb('+mix(col[0]*t,255,w)+','+mix(col[1]*t,255,w)+','+mix(col[2]*t,255,w)+')'}
    var gr=g.createRadialGradient(40,34,4,56,56,54);
    gr.addColorStop(0,rgb(1,.78));gr.addColorStop(.25,rgb(1,.28));gr.addColorStop(.62,rgb(.80,0));gr.addColorStop(1,rgb(.30,0));
    g.beginPath();g.arc(56,56,54,0,6.2832);g.fillStyle=gr;g.fill();
    g.save();g.beginPath();g.arc(56,56,54,0,6.2832);g.clip();
    var rl=g.createLinearGradient(100,104,40,40);rl.addColorStop(0,'rgba('+rr[0]+','+rr[1]+','+rr[2]+',.55)');rl.addColorStop(.55,'rgba('+rr[0]+','+rr[1]+','+rr[2]+',0)');
    g.fillStyle=rl;g.fillRect(0,0,112,112);
    var sp=g.createRadialGradient(38,32,0,38,32,15);sp.addColorStop(0,'rgba(255,255,255,.95)');sp.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sp;g.fillRect(0,0,112,112);
    g.restore();
    return SPR[k]=c;
  }
  function rgbStr(a,t){return 'rgb('+Math.round(a[0]*t)+','+Math.round(a[1]*t)+','+Math.round(a[2]*t)+')'}

  /* photo backgrounds (BGIMG, made by tools/make_bg.py): loaded once, drawn cover-fit with a slow drift and a dark scrim for the text */
  var IM={};
  function getImg(n,redraw){
    if(IM[n]) return IM[n];
    var im=new Image(); im.onload=function(){ if(redraw) redraw() };
    im.src=(typeof BGIMG!=='undefined'&&BGIMG[n])||''; return IM[n]=im;
  }
  function photo(A,spec,T,ox,oy,sa){
    var ctx=A.ctx(),W=A.W(),H=A.H(),im=getImg(spec.bg,A.redraw);
    if(!(im.complete&&im.naturalWidth)) return;
    var s=Math.max(W/im.naturalWidth,H/im.naturalHeight)*(1.09+.03*Math.sin(T*.05+(spec.ph||0))), iw=im.naturalWidth*s, ih=im.naturalHeight*s;
    var px=(W-iw)/2+ox*.1+Math.sin(T*.045+(spec.ph||0))*W*.011, py=(H-ih)/2+oy*.05+Math.cos(T*.037)*H*.009;
    px=Math.max(W-iw,Math.min(0,px)); py=Math.max(H-ih,Math.min(0,py));
    ctx.globalAlpha=sa; ctx.drawImage(im,px,py,iw,ih);
    ctx.fillStyle='rgba(2,9,16,'+(spec.dim==null?.4:spec.dim)+')'; ctx.fillRect(0,0,W,H);
    var g=ctx.createRadialGradient(W/2,H/2,H*.34,W/2,H/2,W*.66); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.36)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }
  function scene(spec){
    return function(A){
      var items=[],dust=[],T0=0,F=16,MV=[];
      function init(){
        var r=A.rng(spec.seed||7),n=Math.round((spec.dust==null?30:spec.dust)*(A.tier()===2?1:.5)),i;
        dust=[];for(i=0;i<n;i++)dust.push({x:r(),y:r(),z:.15+r()*1.6,v:.006+r()*.014,ph:r()*6,g:r()<.3});
        MV=(spec.mols||[]).map(function(m){var b=build(m.m);return {b:b,m:m}});
      }
      function step(dt){T0+=dt;for(var i=0;i<dust.length;i++){var d=dust[i];d.y-=d.v*dt;if(d.y<-.05){d.y=1.05;d.x=Math.random()}}}
      function draw(){
        var ctx=A.ctx(),W=A.W(),H=A.H(),U=A.U(),T=A.T(),PC=A.pal(),sa=A.sa(),ox=A.ox(),oy=A.oy(),rim=PC.m,i,j,k;
        var prevOp=ctx.globalCompositeOperation;ctx.globalCompositeOperation='source-over';
        if(spec.bg) photo(A,spec,T,ox,oy,sa);
        /* soft bokeh behind and in front of the model */
        for(i=0;i<dust.length;i++){
          var d=dust[i],px=(d.x*1.1-.05)*W+ox*(.25/d.z)*.3,py=d.y*H+oy*.04,rad=(d.z<.5?46:d.z<1?26:14)*U*(.6+.5/d.z);
          ctx.globalAlpha=sa*(d.z<.5?.09:d.z<1?.14:.24)*(.6+.4*Math.sin(T*.6+d.ph));
          ctx.drawImage(A.glow(d.g?'255,214,150':PC.s),px-rad,py-rad,rad*2,rad*2);
        }
        /* a soft halo under the models so they sit in the light */
        ctx.globalCompositeOperation='lighter';
        for(k=0;k<MV.length;k++){var m2=MV[k].m,hr=(MV[k].b.R*(m2.px||DEFPX[m2.m]||90)*(m2.s||1)*U)*1.15;ctx.globalAlpha=sa*.16;ctx.drawImage(A.glow(PC.m),(m2.x==null?.5:m2.x)*W+ox*.12-hr,(m2.y==null?.5:m2.y)*H-hr,hr*2,hr*2)}
        ctx.globalCompositeOperation='source-over';
        items.length=0;
        for(k=0;k<MV.length;k++){
          var mv=MV[k],m=mv.m,b=mv.b,cx=(m.x==null?.5:m.x)*W+ox*.12,cy=(m.y==null?.5:m.y)*H+oy*.06,u=U*(m.px||DEFPX[m.m]||90)*(m.s||1);
          var yaw=(m.ph||0)+(m.spin==null?.3:m.spin)*T+ox*.0022,pit=(m.pitch==null?.4:m.pitch)+.1*Math.sin(T*.37+(m.ph||0))+oy*.0016,roll=m.roll||0;
          var cy1=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pit),sp=Math.sin(pit),cr=Math.cos(roll),sr=Math.sin(roll);
          var P=b.at.map(function(a){
            var x=a.p[0],y=a.p[1],z=a.p[2],t;
            if(a.j){x+=a.j*Math.sin(T*1.3+a.ph);y+=a.j*Math.sin(T*1.7+a.ph*1.7);z+=a.j*Math.cos(T*1.1+a.ph)}   /* free electrons wander */
            t=x*cy1+z*sy;z=-x*sy+z*cy1;x=t;
            t=y*cp-z*sp;z=y*sp+z*cp;y=t;
            t=x*cr-y*sr;y=x*sr+y*cr;x=t;
            var f=F/(F+z+b.R*.4),e=EL[a.e];
            return {x:cx+x*u*f,y:cy-y*u*f,z:z,f:f,e:a.e,r:e.r*u*f*1.0,u:u*f,X:x,Y:y};
          });
          var zmin=-b.R,zmax=b.R;
          b.bd.forEach(function(bn){
            var A1=P[bn[0]],B1=P[bn[1]],mz=(A1.z+B1.z)/2,order=bn[2]||1;
            items.push({z:mz,bond:true,a:A1,b:B1,o:order,zr:[zmin,zmax]});
          });
          P.forEach(function(p){items.push({z:p.z,atom:true,p:p,zr:[zmin,zmax]})});
        }
        items.sort(function(a,b){return b.z-a.z});
        for(i=0;i<items.length;i++){
          var it=items[i],fog;
          if(it.atom){
            var p=it.p;fog=1-.38*Math.max(0,Math.min(1,(p.z-it.zr[0])/(it.zr[1]-it.zr[0]+1e-6)));
            ctx.globalAlpha=sa*fog;var spr=ball(p.e,rim),rr=p.r;ctx.drawImage(spr,p.x-rr,p.y-rr,rr*2,rr*2);
          }else{
            var a=it.a,bb=it.b,dx=bb.x-a.x,dy=bb.y-a.y,L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L;
            fog=1-.38*Math.max(0,Math.min(1,(it.z-it.zr[0])/(it.zr[1]-it.zr[0]+1e-6)));
            var wd=Math.max(2,.2*a.u*(it.o>1?.62:1)),offs=it.o===1?[0]:it.o===2?[-.5,.5]:[-1,0,1],mx=(a.x+bb.x)/2,my=(a.y+bb.y)/2;
            for(j=0;j<offs.length;j++){
              var o=offs[j]*wd*1.25,ex=nx*o,ey=ny*o;
              [[a,a.x,a.y],[bb,bb.x,bb.y]].forEach(function(h){
                var col=EL[h[0].e].c;
                ctx.lineCap='round';ctx.globalAlpha=sa*fog;
                ctx.lineWidth=wd;ctx.strokeStyle=rgbStr(col,.42);ctx.beginPath();ctx.moveTo(h[1]+ex,h[2]+ey);ctx.lineTo(mx+ex,my+ey);ctx.stroke();
                ctx.lineWidth=wd*.62;ctx.strokeStyle=rgbStr(col,.9);ctx.beginPath();ctx.moveTo(h[1]+ex-wd*.12,h[2]+ey-wd*.14);ctx.lineTo(mx+ex-wd*.12,my+ey-wd*.14);ctx.stroke();
                ctx.lineWidth=wd*.2;ctx.strokeStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(h[1]+ex-wd*.2,h[2]+ey-wd*.24);ctx.lineTo(mx+ex-wd*.2,my+ey-wd*.24);ctx.stroke();
              });
            }
          }
        }
        ctx.globalCompositeOperation=prevOp;ctx.globalAlpha=1;
      }
      return {init:init,step:step,draw:draw};
    };
  }
  return {scene:scene,build:build,names:Object.keys(BUILD)};
})();
