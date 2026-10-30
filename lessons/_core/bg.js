/* ---------- living backgrounds: a WebGL light field plus one canvas scene per chemistry theme ----------
   tier 2 = full, tier 1 = calm (fewer particles, lower frame rate), tier 0 = a single still frame.
   Everything is vanilla: no libraries, no per-frame allocations, paused when the tab is hidden. */
var BG=(function(){
  var view,root,glc,c2,ctx,gl,wipe,uni={};
  var W=0,H=0,S=1,U=1,tier=2,Q=1,auto=true,raf=0,last=0,lastGL=0,T=0,started=false,sa=1;
  var cur='atomic',prev=null,mix=1,mixT0=0,MIXMS=1100,ox=0,vx=0,oy=0,vy=0;
  var st={ema:0,n:0,frames:0,gl:false,iv:0,ivn:0,pf:0};
  var PI2=Math.PI*2, SC={};

  function hx(s){return [parseInt(s.substr(1,2),16)/255,parseInt(s.substr(3,2),16)/255,parseInt(s.substr(5,2),16)/255]}
  /* shader shape per scene, colours per palette */
  var SCN={atomic:[2.0,.040,1.7],reactions:[2.4,.055,2.0],periodic:[1.7,.030,1.2],bonds:[2.2,.045,1.8],organic:[2.0,.038,1.5],bubbles:[2.2,.050,1.9],doodles:[1.5,.028,1.1],waves:[2.0,.040,1.6],hexes:[1.8,.035,1.3]};
  var PAL={
    emerald:{a:'#032419',b:'#08563f',c:'#1bab82',m:'90,240,190',s:'190,255,230',s2:'120,235,225'},
    navy:   {a:'#030c20',b:'#0a2a5c',c:'#1d62bd',m:'96,190,255',s:'190,225,255',s2:'130,210,255'},
    ember:  {a:'#0d0603',b:'#3a1606',c:'#b95a1b',m:'255,150,70',s:'255,214,180',s2:'255,190,110'},
    gold:   {a:'#050608',b:'#14161b',c:'#41391f',m:'236,236,244',s:'235,235,242',s2:'240,214,130'},
    violet: {a:'#0b0620',b:'#2a1259',c:'#6c3fc4',m:'190,150,255',s:'222,205,255',s2:'170,140,255'}
  };
  Object.keys(PAL).forEach(function(k){var p=PAL[k]; p.A=hx(p.a); p.B=hx(p.b); p.C=hx(p.c)});
  var PC=PAL.emerald,curPal='emerald',prevPal=null;
  function rng(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function lerp(a,b,m){return a+(b-a)*m}

  /* ---- cached sprites ---- */
  var SPR={};
  function glow(rgb){var k='g'+rgb;if(SPR[k])return SPR[k];var c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d');var r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba('+rgb+',1)');r.addColorStop(.22,'rgba('+rgb+',.42)');r.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=r;g.fillRect(0,0,64,64);return SPR[k]=c}
  function ballSpr(rgb){var k='b'+rgb;if(SPR[k])return SPR[k];var c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d');var p=rgb.split(',').map(Number);var r=g.createRadialGradient(24,22,2,32,32,30);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(.35,'rgba('+rgb+',.95)');r.addColorStop(1,'rgba('+Math.round(p[0]*.35)+','+Math.round(p[1]*.4)+','+Math.round(p[2]*.4)+',.9)');g.fillStyle=r;g.beginPath();g.arc(32,32,30,0,PI2);g.fill();return SPR[k]=c}
  function txtSpr(str,px,rgb,blur){
    var c=document.createElement('canvas'),g=c.getContext('2d'),f='italic 600 '+px+'px "STIX Two Text",Georgia,serif';
    g.font=f; var w=Math.ceil(g.measureText(str).width+px*.8),h=Math.ceil(px*1.7);
    c.width=Math.ceil(w*S);c.height=Math.ceil(h*S); g=c.getContext('2d'); g.scale(S,S);
    if(blur&&'filter' in g) g.filter='blur('+blur.toFixed(1)+'px)';
    g.font=f; g.fillStyle='rgb('+rgb+')'; g.textBaseline='middle'; g.fillText(str,px*.4,h/2);
    return {c:c,w:w,h:h};
  }
  function G(x,y,r,rgb,al){ctx.globalAlpha=al*sa;ctx.drawImage(glow(rgb),x-r,y-r,r*2,r*2)}
  function B(x,y,r,rgb,al){ctx.globalAlpha=al*sa;ctx.drawImage(ballSpr(rgb),x-r,y-r,r*2,r*2)}

  /* ---- drifting sparkles shared by every scene ---- */
  function mkDust(r,n){
    var p=[],i; n=Math.round(n*Q);
    for(i=0;i<n;i++)p.push({x:r()*W,y:r()*H,s:(.6+r()*1.5)*U,v:3+r()*9,tw:.6+r()*1.6,ph:r()*6,g:r()<.25});
    return {
      step:function(dt){for(var i=0;i<p.length;i++){var q=p[i];q.y-=q.v*dt*U;if(q.y<-4){q.y=H+4;q.x=Math.random()*W}}},
      draw:function(){for(var i=0;i<p.length;i++){var q=p[i];ctx.globalAlpha=sa*(.10+.34*(.5+.5*Math.sin(T*q.tw+q.ph)));ctx.fillStyle=q.g?'#ffe39a':'rgb('+PC.s+')';ctx.beginPath();ctx.arc(q.x+ox*.1,q.y,q.s,0,PI2);ctx.fill()}}
    };
  }

  /* ================= scene 1: atomic structure ================= */
  SC.atomic=(function(){
    var atoms=[],dust;
    function init(){
      var r=rng(11),def=[[.90,.74,300],[.05,.16,200],[.48,1.04,170]],i,j;
      dust=mkDust(r,34); atoms=[];
      for(i=0;i<def.length;i++){
        var a={x:def[i][0]*W,y:def[i][1]*H,R:def[i][2]*U,k:.22+.12*i,ph:r()*6,o:[]},n=Math.max(2,Math.round(4*Q));
        for(j=0;j<n;j++)a.o.push({rx:a.R*(.5+.13*j+r()*.08),ry:a.R*(.16+.07*j+r()*.05),rot:r()*3.14,rs:(r()-.5)*.07,f:r()*PI2,sp:(.45+r()*.35)*(j%2?-1:1),gold:j%3===1});
        atoms.push(a);
      }
    }
    function step(dt){for(var i=0;i<atoms.length;i++){var a=atoms[i];for(var j=0;j<a.o.length;j++){var o=a.o[j];o.rot+=o.rs*dt;o.f+=o.sp*dt}}dust.step(dt)}
    function draw(){
      var i,j,k,b,l;
      for(i=0;i<atoms.length;i++){
        var a=atoms[i],cx=a.x+ox*a.k,cy=a.y+oy*a.k,br=.8+.2*Math.sin(T*1.3+a.ph);
        G(cx,cy,a.R*.62,'255,205,110',.26*br); G(cx,cy,a.R*.16,'255,236,190',.7*br); G(cx,cy,a.R*.05,'255,255,255',.9);
        ctx.globalAlpha=1; ctx.lineWidth=1.1*U; ctx.strokeStyle='rgba(255,226,150,'+(.16*br*sa).toFixed(3)+')'; ctx.beginPath();
        for(k=0;k<6;k++){var ang=T*.03+k*Math.PI/3,len=a.R*(k%2?.38:.55);ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ang)*len,cy+Math.sin(ang)*len)} ctx.stroke();
        for(j=0;j<a.o.length;j++){
          var o=a.o[j],cr=Math.cos(o.rot),sr=Math.sin(o.rot);
          ctx.globalAlpha=1; ctx.strokeStyle='rgba('+PC.s+','+(.12*sa).toFixed(3)+')'; ctx.lineWidth=1.2*U; ctx.beginPath(); ctx.ellipse(cx,cy,o.rx,o.ry,o.rot,0,PI2); ctx.stroke();
          var dir=o.sp>0?1:-1,span=Math.abs(o.sp)*.9/14,col=o.gold?'255,214,128':'255,255,255';
          ctx.strokeStyle='rgba('+col+','+(.5*sa).toFixed(3)+')'; ctx.lineWidth=1.8*U;
          for(b=0;b<4;b++){
            ctx.globalAlpha=(1-b*.25); ctx.beginPath();
            for(l=0;l<=4;l++){var f=o.f-dir*(b*4+l)*span,ex=o.rx*Math.cos(f),ey=o.ry*Math.sin(f),px=cx+ex*cr-ey*sr,py=cy+ex*sr+ey*cr;l?ctx.lineTo(px,py):ctx.moveTo(px,py)}
            ctx.stroke();
          }
          var hx_=o.rx*Math.cos(o.f),hy_=o.ry*Math.sin(o.f);
          G(cx+hx_*cr-hy_*sr,cy+hx_*sr+hy_*cr,9*U,col,.85);
        }
      }
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 2: chemical reactions ================= */
  SC.reactions=(function(){
    var bub,mol,fl,sp,eq,dust,COL,
        EQS=['2Mg + O₂ → 2MgO','2H₂ + O₂ → 2H₂O','CH₄ + 2O₂ → CO₂ + 2H₂O','N₂ + 3H₂ → 2NH₃','Zn + 2HCl → ZnCl₂ + H₂','CaCO₃ → CaO + CO₂'];
    function init(){
      var r=rng(23),i; COL=[PC.m,'255,255,255','255,205,110',PC.s2]; dust=mkDust(r,26); bub=[]; mol=[]; eq=[]; fl=[]; sp=[];
      for(i=0;i<Math.round(22*Q);i++)bub.push({x:r()*W,y:r()*H,r:(4+r()*14)*U,v:(14+r()*34)*U,sw:(6+r()*14)*U,f:r()*6,s:.4+r()*.8});
      for(i=0;i<Math.round(12*Q);i++)mol.push({x:W*(.1+.8*r()),y:H*(.1+.8*r()),vx:(r()-.5)*40*U,vy:(r()-.5)*40*U,a:r()*6,w:(r()-.5)*.5,k:r()<.5?2:3,c:Math.floor(r()*4),s:(9+r()*5)*U,cd:0});
      for(i=0;i<5;i++){var d=.5+r()*.5;eq.push({s:txtSpr(EQS[i],Math.round(24+d*26),PC.s,(1-d)*3),x:r()*W,y:H*(.12+.76*r()),v:(5+d*9)*U*(r()<.5?1:-1),d:d,al:.035+d*.05})}
    }
    function atomsOf(m){
      if(m.k===2){var c=Math.cos(m.a)*m.s*.95,s=Math.sin(m.a)*m.s*.95;return [[m.x-c,m.y-s,m.s],[m.x+c,m.y+s,m.s]]}
      var u1=m.a+.9,u2=m.a-.9,L=m.s*1.5;
      return [[m.x,m.y,m.s*1.15],[m.x+Math.cos(u1)*L,m.y+Math.sin(u1)*L,m.s*.7],[m.x+Math.cos(u2)*L,m.y+Math.sin(u2)*L,m.s*.7]];
    }
    function step(dt){
      var i,j,m,n,q;
      for(i=0;i<bub.length;i++){q=bub[i];q.y-=q.v*dt;q.f+=dt*q.s;if(q.y<-q.r*2){q.y=H+q.r*2;q.x=Math.random()*W}}
      for(i=0;i<mol.length;i++){m=mol[i];m.x+=m.vx*dt;m.y+=m.vy*dt;m.a+=m.w*dt;m.cd=Math.max(0,m.cd-dt);
        if(m.x<W*.04||m.x>W*.96)m.vx*=-1; if(m.y<H*.06||m.y>H*.92)m.vy*=-1}
      for(i=0;i<mol.length;i++)for(j=i+1;j<mol.length;j++){
        m=mol[i];n=mol[j];var dx=m.x-n.x,dy=m.y-n.y,R=(m.s+n.s)*1.7;
        if(dx*dx+dy*dy<R*R&&m.cd<=0&&n.cd<=0){
          var tx=m.vx,ty=m.vy;m.vx=n.vx;m.vy=n.vy;n.vx=tx;n.vy=ty;m.cd=n.cd=1.2;
          var cx=(m.x+n.x)/2,cy=(m.y+n.y)/2;fl.push({x:cx,y:cy,a:0});
          for(q=0;q<7;q++){var an=Math.random()*PI2,v=(30+Math.random()*60)*U;sp.push({x:cx,y:cy,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:0})}
        }
      }
      for(i=fl.length-1;i>=0;i--){fl[i].a+=dt/1.0;if(fl[i].a>=1)fl.splice(i,1)}
      for(i=sp.length-1;i>=0;i--){q=sp[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.97;q.vy*=.97;q.l+=dt/.9;if(q.l>=1)sp.splice(i,1)}
      for(i=0;i<eq.length;i++){q=eq[i];q.x+=q.v*dt;if(q.x>W+q.s.w)q.x=-q.s.w;else if(q.x<-q.s.w)q.x=W}
      dust.step(dt);
    }
    function wave(yb,amp,ph,al,col){
      ctx.beginPath();ctx.moveTo(0,H);
      for(var x=0;x<=W+20;x+=20)ctx.lineTo(x,yb+amp*Math.sin(x*.006/U+T*ph)+amp*.5*Math.sin(x*.013/U-T*ph*1.3));
      ctx.lineTo(W+20,H);ctx.closePath();
      var g=ctx.createLinearGradient(0,yb-amp,0,H);g.addColorStop(0,'rgba('+col+','+(al*sa).toFixed(3)+')');g.addColorStop(1,'rgba('+col+',0)');ctx.fillStyle=g;ctx.globalAlpha=1;ctx.fill();
    }
    function draw(){
      var i,j,m,q,e;
      for(i=0;i<eq.length;i++){e=eq[i];ctx.globalAlpha=e.al*sa;ctx.drawImage(e.s.c,e.x+ox*e.d*.3,e.y+oy*e.d*.3,e.s.w,e.s.h)}
      wave(H*.90,10*U,.7,.20,PC.m); wave(H*.93,8*U,-.5,.09,'255,205,110');
      ctx.lineWidth=1.3*U;
      for(i=0;i<bub.length;i++){q=bub[i];var bx=q.x+Math.sin(q.f)*q.sw+ox*.15;
        ctx.globalAlpha=.20*sa;ctx.strokeStyle='rgb('+PC.s+')';ctx.beginPath();ctx.arc(bx,q.y,q.r,0,PI2);ctx.stroke();
        ctx.globalAlpha=.32*sa;ctx.beginPath();ctx.arc(bx,q.y,q.r*.72,3.6,4.5);ctx.stroke()}
      for(i=0;i<mol.length;i++){
        m=mol[i];var at=atomsOf(m),col=COL[m.c];
        ctx.globalAlpha=.5*sa;ctx.strokeStyle='rgb('+col+')';ctx.lineWidth=2*U;ctx.beginPath();
        for(j=1;j<at.length;j++){ctx.moveTo(at[0][0]+ox*.2,at[0][1]);ctx.lineTo(at[j][0]+ox*.2,at[j][1])}ctx.stroke();
        for(j=0;j<at.length;j++){G(at[j][0]+ox*.2,at[j][1],at[j][2]*2.6,col,.22);B(at[j][0]+ox*.2,at[j][1],at[j][2],j?COL[(m.c+1)%4]:col,.62)}
      }
      for(i=0;i<fl.length;i++){q=fl[i];var e2=1-Math.pow(1-q.a,2);
        G(q.x,q.y,(30+60*e2)*U,'255,215,130',.55*(1-q.a));
        ctx.globalAlpha=.55*(1-q.a)*sa;ctx.strokeStyle='#ffe6a6';ctx.lineWidth=2*U;ctx.beginPath();ctx.arc(q.x,q.y,(10+70*e2)*U,0,PI2);ctx.stroke()}
      for(i=0;i<sp.length;i++){q=sp[i];G(q.x,q.y,5*U,'255,225,150',.9*(1-q.l))}
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 3: the periodic table ================= */
  SC.periodic=(function(){
    var cells=[],base,bright,cw,ch,gx,gy,dust,shim=[],nextShim=0;
    var ROWS=[
     [[1,'H',1],[18,'He',2]],
     [[1,'Li',3],[2,'Be',4],[13,'B',5],[14,'C',6],[15,'N',7],[16,'O',8],[17,'F',9],[18,'Ne',10]],
     [[1,'Na',11],[2,'Mg',12],[13,'Al',13],[14,'Si',14],[15,'P',15],[16,'S',16],[17,'Cl',17],[18,'Ar',18]],
     'K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' ').map(function(s,i){return [i+1,s,19+i]}),
     'Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe'.split(' ').map(function(s,i){return [i+1,s,37+i]}),
     'Cs Ba La Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn'.split(' ').map(function(s,i){return [i+1,s,i<3?55+i:69+i]}),
     'Fr Ra Ac Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ').map(function(s,i){return [i+1,s,i<3?87+i:101+i]})
    ];
    function tint(c){return c<=2?'255,205,110':c<=12?PC.m:c<=16?PC.s:c===17?PC.s2:PC.s}
    function paint(cv,bri){
      var g=cv.getContext('2d'),i,e;g.setTransform(S,0,0,S,0,0);g.clearRect(0,0,W,H);
      g.textAlign='center';g.textBaseline='middle';
      for(i=0;i<cells.length;i++){e=cells[i];
        g.fillStyle='rgba('+tint(e.c)+','+(bri?.20:.07)+')';g.strokeStyle=bri?'rgba(255,236,180,.95)':'rgba('+PC.s+',.8)';g.lineWidth=1.2*U;
        g.beginPath();g.roundRect?g.roundRect(e.x,e.y,cw-4*U,ch-4*U,6*U):g.rect(e.x,e.y,cw-4*U,ch-4*U);g.fill();g.stroke();
        g.fillStyle=bri?'#fff':'rgba('+PC.s+',.9)';g.font='700 '+Math.round(ch*.36)+'px Cairo,Arial,sans-serif';g.fillText(e.s,e.x+(cw-4*U)/2,e.y+(ch-4*U)*.55);
        g.font='600 '+Math.round(ch*.15)+'px Cairo,Arial,sans-serif';g.textAlign='left';g.fillText(e.z,e.x+7*U,e.y+13*U);g.textAlign='center';
      }
    }
    function init(){
      var r=rng(5),i,j; cells=[]; dust=mkDust(r,18); shim=[]; nextShim=0;
      cw=W/18.4; ch=H/7.7; gx=(W-cw*18)/2; gy=(H-ch*7)/2;
      for(i=0;i<ROWS.length;i++)for(j=0;j<ROWS[i].length;j++){var e=ROWS[i][j];cells.push({c:e[0],s:e[1],z:e[2],x:gx+(e[0]-1)*cw+2*U,y:gy+i*ch+2*U,cx:gx+(e[0]-.5)*cw,cy:gy+(i+.5)*ch})}
      base=document.createElement('canvas');bright=document.createElement('canvas');
      base.width=bright.width=Math.ceil(W*S);base.height=bright.height=Math.ceil(H*S);
      paint(base,0);paint(bright,1);
    }
    function step(dt){
      dust.step(dt);
      nextShim-=dt; if(nextShim<=0){nextShim=.45;shim.push({i:Math.floor(Math.random()*cells.length),a:0})}
      for(var i=shim.length-1;i>=0;i--){shim[i].a+=dt/2.2;if(shim[i].a>=1)shim.splice(i,1)}
    }
    function hl(i,a){var e=cells[i],dx=(e.x+ox*.2),dy=(e.y+oy*.2),w=(cw-4*U),h=(ch-4*U);
      ctx.globalAlpha=a*sa;ctx.drawImage(bright,e.x*S,e.y*S,w*S,h*S,dx,dy,w,h)}
    function draw(){
      var i,R,d,I,a;
      ctx.globalAlpha=.16*sa;ctx.drawImage(base,ox*.2,oy*.2,W,H);
      /* two light waves crossing the table */
      var cx1=W*(.5+.38*Math.sin(T*.11)),cy1=H*(.5+.3*Math.cos(T*.083));
      R=((T*95*U)%(Math.max(W,H)*.9));
      for(i=0;i<cells.length;i++){
        d=Math.sqrt((cells[i].cx-cx1)*(cells[i].cx-cx1)+(cells[i].cy-cy1)*(cells[i].cy-cy1));
        I=Math.exp(-Math.pow((d-R)/(60*U),2)); if(I>.05)hl(i,I*.7);
      }
      for(i=0;i<shim.length;i++){a=Math.sin(shim[i].a*Math.PI);hl(shim[i].i,a*.55)}
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 4: chemical bonds ================= */
  SC.bonds=(function(){
    var at,dust,COL,DM=150;
    function init(){
      var r=rng(41),i; COL=[PC.m,'255,255,255','255,205,110',PC.s2]; dust=mkDust(r,22); at=[];
      for(i=0;i<Math.round(26*Q);i++){var sp=(6+r()*12)*U,an=r()*PI2;at.push({x:r()*W,y:r()*H,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,r:(5+r()*7)*U,c:Math.floor(r()*4),ph:r()*6})}
    }
    function step(dt){
      for(var i=0;i<at.length;i++){var a=at[i];a.x+=a.vx*dt;a.y+=a.vy*dt;
        if(a.x<-20*U||a.x>W+20*U)a.vx*=-1; if(a.y<-20*U||a.y>H+20*U)a.vy*=-1}
      dust.step(dt);
    }
    function draw(){
      var i,j,a,b,dx,dy,d,D=DM*U,k,tt;
      ctx.lineCap='round';
      for(i=0;i<at.length;i++)for(j=i+1;j<at.length;j++){
        a=at[i];b=at[j];dx=b.x-a.x;dy=b.y-a.y;d=Math.sqrt(dx*dx+dy*dy);
        if(d>D)continue;
        k=1-d/D; var ax=a.x+ox*.2,bx=b.x+ox*.2;
        ctx.strokeStyle='rgba('+PC.s+','+(.40*k*sa).toFixed(3)+')';ctx.globalAlpha=1;ctx.lineWidth=(1+1.6*k)*U;
        if(k<.35){ctx.setLineDash([4*U,6*U])}else{ctx.setLineDash([])}
        ctx.beginPath();ctx.moveTo(ax,a.y);ctx.lineTo(bx,b.y);ctx.stroke();
        if(k>.6){var nx=-dy/d*3.5*U,ny=dx/d*3.5*U;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(ax+nx,a.y+ny);ctx.lineTo(bx+nx,b.y+ny);ctx.stroke()}
        if(k>.3){tt=((T*.35+i*.37+j*.11)%1);G(ax+(bx-ax)*tt,a.y+(b.y-a.y)*tt,6*U,'255,214,128',.85*k)}
      }
      ctx.setLineDash([]);
      for(i=0;i<at.length;i++){a=at[i];var pl=.85+.15*Math.sin(T*1.1+a.ph);G(a.x+ox*.2,a.y,a.r*3,COL[a.c],.20*pl);B(a.x+ox*.2,a.y,a.r,COL[a.c],.7)}
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 5: organic chemistry ================= */
  SC.organic=(function(){
    var rings,chains,hexc,dust;
    function init(){
      var r=rng(77),i,def=[[.12,.30,95],[.88,.26,70],[.80,.80,115],[.22,.86,60],[.52,.12,45],[.50,.62,150],[.95,.55,40]];
      dust=mkDust(r,20); rings=[]; chains=[];
      for(i=0;i<def.length;i++)rings.push({x:def[i][0]*W,y:def[i][1]*H,R:def[i][2]*U,rot:r()*1.05,w:(r()-.5)*.07,vx:(r()-.5)*5*U,vy:(r()-.5)*5*U,k:.12+r()*.2,g:i%3===1});
      var cd=[[.04,.55,-.15],[.30,.95,-.35],[.60,.06,.28],[.70,.50,.12]];
      for(i=0;i<Math.round(4*Q);i++)chains.push({x:cd[i][0]*W,y:cd[i][1]*H,a:cd[i][2],n:9,L:44*U,off:i*4.5});
      hexc=document.createElement('canvas');var hw=60*U,hh=hw*Math.sqrt(3)/2;hexc.width=Math.ceil(W+hw*2);hexc.height=Math.ceil(H+hh*4);
      var g=hexc.getContext('2d'),x,y,k;g.strokeStyle='rgba('+PC.s+',1)';g.lineWidth=1;
      for(y=0;y<hexc.height+hh;y+=hh*2)for(x=0;x<hexc.width+hw;x+=hw*3){
        for(k=0;k<2;k++){var cx=x+(k?hw*1.5:0),cy=y+(k?hh:0);g.beginPath();
          for(var q=0;q<6;q++){var an=q*Math.PI/3;q?g.lineTo(cx+hw*.5*Math.cos(an)*1.0,cy+hw*.5*Math.sin(an)):g.moveTo(cx+hw*.5*Math.cos(an),cy+hw*.5*Math.sin(an))}
          g.closePath();g.stroke()}
      }
      hexc._p=hw*3;
    }
    function step(dt){
      for(var i=0;i<rings.length;i++){var q=rings[i];q.rot+=q.w*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
        if(q.x<-q.R||q.x>W+q.R)q.vx*=-1; if(q.y<-q.R||q.y>H+q.R)q.vy*=-1}
      dust.step(dt);
    }
    function ring(q){
      var cx=q.x+ox*q.k,cy=q.y+oy*q.k,R=q.R,k,a,px=[],py=[];
      for(k=0;k<6;k++){a=q.rot+k*Math.PI/3;px.push(cx+R*Math.cos(a));py.push(cy+R*Math.sin(a))}
      ctx.strokeStyle=q.g?'rgba(255,214,128,.9)':'rgba('+PC.s+',.9)';ctx.globalAlpha=(q.g?.20:.17)*sa;ctx.lineWidth=2*U;
      ctx.beginPath();for(k=0;k<6;k++)k?ctx.lineTo(px[k],py[k]):ctx.moveTo(px[k],py[k]);ctx.closePath();ctx.stroke();
      ctx.lineWidth=1.5*U;ctx.beginPath();
      for(k=0;k<6;k+=2){var k2=(k+1)%6,ax=cx+(px[k]-cx)*.74,ay=cy+(py[k]-cy)*.74,bx=cx+(px[k2]-cx)*.74,by=cy+(py[k2]-cy)*.74,sx=(bx-ax)*.16,sy=(by-ay)*.16;ctx.moveTo(ax+sx,ay+sy);ctx.lineTo(bx-sx,by-sy)}
      ctx.stroke();
      for(k=0;k<6;k++)G(px[k],py[k],7*U,q.g?'255,214,128':PC.m,.55);
    }
    function chain(c){
      var tt=(T+c.off)%18,p=Math.min(1,tt/9),al=tt<13?1:Math.max(0,1-(tt-13)/4),n=c.n,i,x=c.x+ox*.2,y=c.y,pts=[[x,y]];
      for(i=0;i<n;i++){var an=c.a+(i%2?.52:-.52);x+=Math.cos(an)*c.L;y+=Math.sin(an)*c.L;pts.push([x,y])}
      var seg=p*n,full=Math.floor(seg),fr=seg-full;
      ctx.strokeStyle='rgba('+PC.s+','+(.30*al*sa).toFixed(3)+')';ctx.globalAlpha=1;ctx.lineWidth=2.2*U;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
      for(i=1;i<=full&&i<=n;i++)ctx.lineTo(pts[i][0],pts[i][1]);
      var hx_=pts[Math.min(full,n)][0],hy_=pts[Math.min(full,n)][1];
      if(full<n){hx_+=(pts[full+1][0]-hx_)*fr;hy_+=(pts[full+1][1]-hy_)*fr;ctx.lineTo(hx_,hy_)}
      ctx.stroke();
      for(i=0;i<=Math.min(full,n);i++)G(pts[i][0],pts[i][1],7*U,i%3===1?'255,214,128':PC.m,.7*al);
      if(full<n)G(hx_,hy_,12*U,'255,240,190',.9*al);
    }
    function draw(){
      var i,hp=hexc._p,hx_=((T*3*U)%hp)-hp+ox*.1;
      ctx.globalAlpha=.05*sa;ctx.drawImage(hexc,hx_,((T*1.5*U)%(hp*.5))-hp*.5+oy*.1);
      for(i=0;i<rings.length;i++)ring(rings[i]);
      for(i=0;i<chains.length;i++)chain(chains[i]);
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 6: bubbles rising in a liquid ================= */
  SC.bubbles=(function(){
    var bb,dust;
    function init(){
      var r=rng(61),i; dust=mkDust(r,14); bb=[];
      for(i=0;i<Math.round(34*Q);i++)bb.push({x:r()*W,y:r()*H*1.1,r:(5+Math.pow(r(),2)*30)*U,v:(14+r()*34)*U,ph:r()*6,wa:(6+r()*16)*U,ws:.5+r()*1.1,gold:r()<.18});
    }
    function step(dt){
      for(var i=0;i<bb.length;i++){var b=bb[i];b.y-=b.v*dt;if(b.y<-b.r*2){b.y=H+b.r*2+Math.random()*60*U;b.x=Math.random()*W}}
      dust.step(dt);
    }
    function wave(y0,amp,k,sp,ph,rgb,al){
      ctx.beginPath();ctx.moveTo(0,H);
      for(var x=0;x<=W+16;x+=16)ctx.lineTo(x+ox*.15,y0+Math.sin(x*k+T*sp+ph)*amp+Math.sin(x*k*2.3-T*sp*.7)*amp*.35);
      ctx.lineTo(W+16,H);ctx.closePath();ctx.globalAlpha=al*sa;ctx.fillStyle='rgb('+rgb+')';ctx.fill();
    }
    function draw(){
      var i,b,x,y,c;
      wave(H*.90,16*U,.006/U,.8,0,PC.m,.07);wave(H*.935,12*U,.008/U,-.6,2,PC.s2,.07);
      ctx.lineWidth=1.6*U;
      for(i=0;i<bb.length;i++){
        b=bb[i];x=b.x+Math.sin(T*b.ws+b.ph)*b.wa+ox*.2;y=b.y;c=b.gold?'255,214,128':PC.s;
        ctx.globalAlpha=sa*.30;ctx.strokeStyle='rgb('+c+')';ctx.beginPath();ctx.arc(x,y,b.r,0,PI2);ctx.stroke();
        G(x,y,b.r*1.6,b.gold?'255,214,128':PC.m,.10);
        ctx.globalAlpha=sa*.55;ctx.beginPath();ctx.arc(x,y,b.r*.68,3.5,4.4);ctx.stroke();
      }
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 7: flat line doodles (flasks, atoms, DNA) over soft flat discs ================= */
  var ICONS={
    flask:function(g){g.beginPath();g.moveTo(38,10);g.lineTo(58,10);g.moveTo(41,10);g.lineTo(41,38);g.lineTo(18,78);g.quadraticCurveTo(14,88,26,88);g.lineTo(70,88);g.quadraticCurveTo(82,88,78,78);g.lineTo(55,38);g.lineTo(55,10);g.moveTo(25,66);g.lineTo(71,66);g.stroke()},
    tube:function(g){g.beginPath();g.moveTo(32,12);g.lineTo(64,12);g.moveTo(36,12);g.lineTo(36,72);g.arc(48,72,12,Math.PI,0,true);g.lineTo(60,12);g.moveTo(36,50);g.lineTo(60,50);g.stroke()},
    beaker:function(g){g.beginPath();g.moveTo(24,14);g.lineTo(28,84);g.lineTo(68,84);g.lineTo(72,14);g.moveTo(20,14);g.lineTo(76,14);g.moveTo(27,40);g.lineTo(40,40);g.moveTo(27,56);g.lineTo(36,56);g.moveTo(27,72);g.lineTo(40,72);g.stroke()},
    atom:function(g){var i;for(i=0;i<3;i++){g.beginPath();g.ellipse(48,48,40,14,i*Math.PI/3,0,Math.PI*2);g.stroke()}g.beginPath();g.arc(48,48,5,0,Math.PI*2);g.fill()},
    hex:function(g){var k;g.beginPath();for(k=0;k<6;k++){var a=k*Math.PI/3+Math.PI/6;g.lineTo(48+34*Math.cos(a),48+34*Math.sin(a))}g.closePath();g.stroke();g.beginPath();g.arc(48,48,19,0,Math.PI*2);g.stroke()},
    dna:function(g){var t,i;for(i=0;i<2;i++){g.beginPath();for(t=0;t<=1.001;t+=.03){var x=48+(i?-1:1)*16*Math.sin(t*Math.PI*3),y=6+t*84;if(t===0)g.moveTo(x,y);else g.lineTo(x,y)}g.stroke()}
      g.lineWidth=2;for(t=.08;t<1;t+=.166){var xx=16*Math.sin(t*Math.PI*3);g.beginPath();g.moveTo(48-xx,6+t*84);g.lineTo(48+xx,6+t*84);g.stroke()}},
    mol:function(g){g.beginPath();g.moveTo(22,66);g.lineTo(48,28);g.lineTo(76,62);g.stroke();[[22,66,9],[48,28,12],[76,62,8]].forEach(function(b){g.beginPath();g.arc(b[0],b[1],b[2],0,Math.PI*2);g.fillStyle='rgba(0,0,0,0)';g.stroke()})},
    drop:function(g){g.beginPath();g.moveTo(48,10);g.quadraticCurveTo(80,52,68,72);g.quadraticCurveTo(48,96,28,72);g.quadraticCurveTo(16,52,48,10);g.stroke()},
    plus:function(g){g.beginPath();g.moveTo(48,26);g.lineTo(48,70);g.moveTo(26,48);g.lineTo(70,48);g.stroke()},
    ring:function(g){g.beginPath();g.arc(48,48,14,0,Math.PI*2);g.stroke()}
  };
  var IK=Object.keys(ICONS);
  function iconSpr(kind,rgb){
    var k='i'+kind+rgb;if(SPR[k])return SPR[k];
    var c=document.createElement('canvas');c.width=c.height=Math.ceil(96*S);var g=c.getContext('2d');g.scale(S,S);
    g.strokeStyle=g.fillStyle='rgb('+rgb+')';g.lineWidth=3.4;g.lineCap=g.lineJoin='round';ICONS[kind](g);
    return SPR[k]=c;
  }
  SC.doodles=(function(){
    var ic,ds,dust;
    function init(){
      var r=rng(71),i; dust=mkDust(r,10); ic=[]; ds=[];
      for(i=0;i<4;i++)ds.push({x:r()*W,y:r()*H,r:(110+r()*130)*U,ph:r()*6,sp:.05+r()*.06,gold:i===1});
      for(i=0;i<Math.round(20*Q);i++)ic.push({k:IK[i%IK.length],x:r()*W,y:r()*H,s:(34+r()*40)*U,vx:(r()-.5)*14*U,vy:(-3-r()*9)*U,rot:r()*6.28,rs:(r()-.5)*.35,ph:r()*6,gold:r()<.2});
    }
    function step(dt){
      for(var i=0;i<ic.length;i++){var q=ic[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.rs*dt;
        if(q.y<-q.s)q.y=H+q.s;if(q.x<-q.s)q.x=W+q.s;if(q.x>W+q.s)q.x=-q.s}
      dust.step(dt);
    }
    function draw(){
      var i,q,d,al;
      for(i=0;i<ds.length;i++){d=ds[i];var x=d.x+Math.sin(T*d.sp+d.ph)*60*U+ox*.1,y=d.y+Math.cos(T*d.sp*.8+d.ph)*30*U;
        ctx.globalAlpha=sa*.055;ctx.fillStyle='rgb('+(d.gold?'255,214,128':PC.m)+')';ctx.beginPath();ctx.arc(x,y,d.r,0,PI2);ctx.fill();
        ctx.globalAlpha=sa*.14;ctx.strokeStyle='rgb('+(d.gold?'255,214,128':PC.s)+')';ctx.lineWidth=2*U;ctx.beginPath();ctx.arc(x,y,d.r*1.12,0,PI2);ctx.stroke()}
      for(i=0;i<ic.length;i++){q=ic[i];al=.20+.12*Math.sin(T*.8+q.ph);ctx.globalAlpha=sa*al;
        ctx.save();ctx.translate(q.x+ox*.2,q.y);ctx.rotate(q.rot);ctx.drawImage(iconSpr(q.k,q.gold?'255,214,128':PC.s),-q.s/2,-q.s/2,q.s,q.s);ctx.restore()}
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 8: flowing waves with travelling electrons ================= */
  SC.waves=(function(){
    var L,dust;
    function wy(w,x){return w.y+Math.sin(x*w.k+T*w.sp+w.ph)*w.a+Math.sin(x*w.k*2.1-T*w.sp*.8)*w.a*.4}
    function init(){
      var r=rng(91),i,n=Math.max(3,Math.round(5*Q)); dust=mkDust(r,16); L=[];
      for(i=0;i<n;i++)L.push({y:H*(.2+.13*i+r()*.04),a:(22+r()*40)*U,k:(.004+r()*.004)/U,sp:(.5+r()*.7)*(i%2?-1:1),ph:r()*6,c:i%3===1?'255,214,128':(i%2?PC.s2:PC.m),w:(1.6+r()*2.2)*U,v:(40+r()*50)*U*(i%2?-1:1),o:r()*W});
    }
    function step(dt){dust.step(dt)}
    function draw(){
      var i,w,x,first,ex,ey;
      ctx.lineCap='round';ctx.lineJoin='round';
      for(i=0;i<L.length;i++){
        w=L[i];first=true;ctx.beginPath();
        for(x=-10;x<=W+10;x+=14){var px=x+ox*.2*(1+i*.2),py=wy(w,x);if(first){ctx.moveTo(px,py);first=false}else ctx.lineTo(px,py)}
        ctx.globalAlpha=sa*.22;ctx.strokeStyle='rgb('+w.c+')';ctx.lineWidth=w.w;ctx.stroke();
        ctx.globalAlpha=sa*.06;ctx.lineWidth=w.w*5;ctx.stroke();
        ex=((w.o+T*w.v)%(W+60)+(W+60))%(W+60)-30;ey=wy(w,ex);
        G(ex+ox*.2,ey,14*U,w.c,.55);B(ex+ox*.2,ey,3.4*U,'255,255,255',.8);
      }
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= scene 9: a honeycomb lattice with a travelling pulse and glowing rings ================= */
  SC.hexes=(function(){
    var cells,dust,R;
    function init(){
      var r=rng(81),c,rr,dx,dy; dust=mkDust(r,12); R=44*U; cells=[]; dx=R*1.5; dy=R*Math.sqrt(3);
      for(c=-1;c*dx<W+R*2;c++)for(rr=-1;rr*dy<H+R*2;rr++)cells.push({x:c*dx,y:rr*dy+(c&1?dy/2:0),ph:r()*6,ben:r()<.07});
    }
    function step(dt){dust.step(dt)}
    function hex(x,y,r){ctx.moveTo(x+r,y);for(var k=1;k<6;k++)ctx.lineTo(x+r*Math.cos(k*Math.PI/3),y+r*Math.sin(k*Math.PI/3));ctx.closePath()}
    function draw(){
      var i,c,a,q,B4=[[],[],[],[]],AL=[.05,.09,.15,.26],ofx=ox*.15;
      for(i=0;i<cells.length;i++){c=cells[i];a=Math.max(0,Math.sin((c.x*.006+c.y*.004)/U-T*.9+c.ph*.25));q=a>.75?3:a>.45?2:a>.15?1:0;B4[q].push(c)}
      ctx.lineWidth=1.2*U;
      for(q=0;q<4;q++){ctx.globalAlpha=sa*AL[q];ctx.strokeStyle='rgb('+(q===3?PC.s2:PC.s)+')';ctx.beginPath();for(i=0;i<B4[q].length;i++)hex(B4[q][i].x+ofx,B4[q][i].y,R*.92);ctx.stroke()}
      for(i=0;i<cells.length;i++){c=cells[i];if(c.ben){var p=.5+.5*Math.sin(T*.8+c.ph);G(c.x+ofx,c.y,R*1.5,PC.m,.10+.12*p);ctx.globalAlpha=sa*(.25+.2*p);ctx.strokeStyle='rgb('+PC.s+')';ctx.lineWidth=2*U;ctx.beginPath();ctx.arc(c.x+ofx,c.y,R*.45,0,PI2);ctx.stroke()}}
      dust.draw();
    }
    return {init:init,step:step,draw:draw};
  })();

  /* ================= WebGL light field ================= */
  var FS='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'+
  'varying vec2 v;uniform vec2 uR,uO;uniform float uT;uniform vec3 uA,uB,uC;uniform vec3 uP;\n'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}\n'+
  'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.02+vec2(17.,9.);a*=.5;}return s;}\n'+
  'void main(){float asp=uR.x/uR.y;vec2 p=(v-.5)*vec2(asp,1.)*uP.x+uO*.35;float t=uT*uP.y;\n'+
  ' vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t*.8));\n'+
  ' float f=fbm(p+uP.z*q+vec2(t*.3,0.));\n'+
  ' vec3 c=mix(uA,uB,smoothstep(.15,.7,f));\n'+
  ' c=mix(c,uC,pow(smoothstep(.35,.9,f),2.)*.7);\n'+
  ' float g=smoothstep(.60,.64,f)*smoothstep(.70,.64,f);c+=vec3(.9,.72,.28)*g*.07;\n'+
  ' float r=length((v-.5)*vec2(asp*.55,1.));c*=1.-.42*smoothstep(.3,.95,r);\n'+
  ' c+=(h(gl_FragCoord.xy+uT)-.5)/255.*1.6;gl_FragColor=vec4(c,1.);}';
  function initGL(){
    try{gl=glc.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'low-power'})}catch(e){gl=null}
    if(!gl)return false;
    function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null}
    var vs=sh(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}'),fs=sh(gl.FRAGMENT_SHADER,FS);
    if(!vs||!fs){gl=null;return false}
    var pg=gl.createProgram();gl.attachShader(pg,vs);gl.attachShader(pg,fs);gl.linkProgram(pg);
    if(!gl.getProgramParameter(pg,gl.LINK_STATUS)){gl=null;return false}
    gl.useProgram(pg);
    var bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(pg,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    ['uR','uO','uT','uA','uB','uC','uP'].forEach(function(k){uni[k]=gl.getUniformLocation(pg,k)});
    glc.addEventListener('webglcontextlost',function(e){e.preventDefault();gl=null;st.gl=false;root.classList.add('nogl')});
    return true;
  }
  var TMP=[0,0,0];
  function mx3(a,b,m){TMP[0]=lerp(a[0],b[0],m);TMP[1]=lerp(a[1],b[1],m);TMP[2]=lerp(a[2],b[2],m);return TMP}
  function drawGL(m){
    if(!gl)return;
    var A=PAL[curPal],P=prev?PAL[prevPal]:A,k=prev?m:1,SA=SCN[cur],SP=prev?SCN[prev]:SA;
    gl.uniform2f(uni.uR,glc.width,glc.height);gl.uniform2f(uni.uO,ox/H,oy/H);gl.uniform1f(uni.uT,T);
    var t=mx3(P.A,A.A,k);gl.uniform3f(uni.uA,t[0],t[1],t[2]);
    t=mx3(P.B,A.B,k);gl.uniform3f(uni.uB,t[0],t[1],t[2]);
    t=mx3(P.C,A.C,k);gl.uniform3f(uni.uC,t[0],t[1],t[2]);
    t=mx3(SP,SA,k);gl.uniform3f(uni.uP,t[0],t[1],t[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }

  /* ---- 2D layer ---- */
  function draw2D(dt,m){
    ctx.setTransform(S,0,0,S,0,0);ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    if(prev){sa=1-m;PC=PAL[prevPal];SC[prev].step(dt);SC[prev].draw()}
    sa=prev?m:1;PC=PAL[curPal];SC[cur].step(dt);SC[cur].draw();
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;sa=1;
  }

  /* ---- loop, sizing, tiers ---- */
  function size(){
    if(!view)return;
    W=Math.max(320,view.clientWidth);H=Math.max(200,view.clientHeight);U=H/720;
    S=Math.min(window.devicePixelRatio||1,1.5);while(W*S*H*S>2.4e6)S*=.9;
    c2.width=Math.ceil(W*S);c2.height=Math.ceil(H*S);
    var gs=tier===1?.3:.38;glc.width=Math.ceil(W*gs);glc.height=Math.ceil(H*gs);
    if(gl)gl.viewport(0,0,glc.width,glc.height);
    rebuild();
  }
  function rebuild(){
    Q=tier===2?1:.55;
    for(var k in SC)SC[k]._ready=false;
    PC=PAL[curPal];SC[cur].init();SC[cur]._ready=true;
    if(prev){PC=PAL[prevPal];SC[prev].init();SC[prev]._ready=true}
    if(tier===0||!raf)still();
  }
  function still(){drawGL(1);draw2D(0,1)}
  function frame(now){
    raf=requestAnimationFrame(frame);
    if(tier===1&&now-last<30)return;
    var dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;T+=dt;
    if(st.pf){st.iv=st.iv?st.iv*.97+(now-st.pf)*.03:(now-st.pf);st.ivn++}st.pf=now;
    var w0=performance.now();
    vx+=(-6*ox-3.4*vx)*dt;ox+=vx*dt;vy+=(-6*oy-3.4*vy)*dt;oy+=vy*dt;
    var m=1;
    if(prev){mix=Math.min(1,(now-mixT0)/MIXMS);m=ease(mix);if(mix>=1){prev=null;m=1}}
    var gi=tier===2?33:66;
    if(gl&&now-lastGL>=gi){lastGL=now;drawGL(m)}
    draw2D(dt,m);
    var w=performance.now()-w0;st.ema=st.ema?st.ema*.95+w*.05:w;st.n++;st.frames++;
    if(auto&&((st.n>150&&st.ema>11)||(st.ivn>240&&st.iv>(tier===2?45:90)))){st.n=0;st.ema=0;st.iv=0;st.ivn=0;st.pf=0;setTier(tier-1,true)}
  }
  function start(){if(tier===0||raf||document.hidden||!root)return;last=performance.now();st.pf=0;raf=requestAnimationFrame(frame)}
  function stop(){if(raf){cancelAnimationFrame(raf);raf=0}st.pf=0}
  function label(){var b=document.getElementById('bFx');if(b){var s=b.querySelector('span');if(s)s.textContent=['ثابتة','هادئة','كاملة'][tier];b.setAttribute('aria-label','الخلفية: '+['ثابتة','هادئة','كاملة'][tier]);b.setAttribute('data-tier',tier)}}
  function setTier(t,fromAuto){
    t=Math.max(0,Math.min(2,t));if(t===tier&&started)return;
    tier=t;if(!fromAuto){auto=false;try{localStorage.setItem('l31fx',String(t))}catch(e){}}
    if(view)view.setAttribute('data-fx',String(tier));document.documentElement.setAttribute('data-fx',String(tier));
    stop();st.n=0;st.ema=0;st.iv=0;st.ivn=0;st.pf=0;
    if(view)size();
    if(tier>0)start();
    label();
  }
  function mount(v){
    view=v;root=document.createElement('div');root.className='bgfx';root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="bgb b1"></div><div class="bgb b2"></div><canvas class="bgc gl"></canvas><div class="bgl"></div><canvas class="bgc c2"></canvas><div class="bgwipe"></div><div class="bgscrim"></div>';
    view.insertBefore(root,view.firstChild);
    glc=root.querySelector('.gl');c2=root.querySelector('.c2');ctx=c2.getContext('2d');wipe=root.querySelector('.bgwipe');
    wipe.addEventListener('animationend',function(){wipe.classList.remove('go')});
    st.gl=initGL();if(!st.gl)root.classList.add('nogl');
    var saved=null;try{saved=localStorage.getItem('l31fx')}catch(e){}
    var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    tier=saved!==null&&/^[012]$/.test(saved)?+saved:(rm?1:2);auto=saved===null;
    view.setAttribute('data-fx',String(tier));document.documentElement.setAttribute('data-fx',String(tier));
    size();started=true;label();if(tier>0)start();
    var rt=0;function onr(){cancelAnimationFrame(rt);rt=requestAnimationFrame(size)}
    if(window.ResizeObserver)new ResizeObserver(onr).observe(view);else window.addEventListener('resize',onr);
    document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else start()});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){SPR={};if(view)rebuild()});
  }
  function go(k,pal,dir){
    if(!root||!SCN[k]||!PAL[pal])return;
    if(k!==cur||pal!==curPal){
      if(started&&tier>0){prev=cur;prevPal=curPal;mix=0;mixT0=performance.now();cur=k;curPal=pal;PC=PAL[pal];SC[cur].init();SC[cur]._ready=true;
        wipe.classList.remove('go');void wipe.offsetWidth;wipe.classList.add('go')}
      else{cur=k;curPal=pal;prev=null;mix=1;PC=PAL[pal];SC[cur].init();SC[cur]._ready=true;if(tier===0)still()}
    }
    if(tier>0)vx=(dir||1)*-240;
  }
  return {mount:mount,go:go,setTier:function(t){setTier(t,false)},cycle:function(){setTier(tier===0?2:tier-1,false)},
          tier:function(){return tier},stats:function(){return {ema:st.ema,frames:st.frames,gl:st.gl,tier:tier,W:W,H:H,S:S}},
          auto:function(v){auto=!!v}};
})();
