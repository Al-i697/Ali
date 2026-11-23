/* ---------- every picture of this lesson is drawn in code (the teacher asked for that); only the three photographs of the book are real pictures.
   All are flat drawings, schematic and not to scale. Parts with data-s="n" appear when n points are showing (ptSync in helpers.js). ---------- */
var CL={sea1:'#2b84c6',sea2:'#0a2540',deep:'#06182d',ink:'#10202f',green:'#35c46f',blue:'#6fc6f2',gold:'#ffd966',red:'#ff8a7a',line:'#cfe6ef',land:'#6b8f4e',soil:'#8a6b45',box:'rgba(14,50,84,.96)'};

function svg(w,h,inner,cls,label){ return '<svg viewBox="0 0 '+w+' '+h+'" class="fgv dg'+(cls?' '+cls:'')+'" role="img" aria-label="'+(label||'رسم تخطيطي')+'" style="direction:ltr">'+inner+'</svg>' }
function mkr(id,c){ return '<marker id="'+id+'" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="15" markerHeight="15" orient="auto"><path d="M0 0L10 5L0 10z" fill="'+c+'"/></marker>' }
/* text: t is a string or an array of lines, centred on (x,y); c an optional class (lt = Latin, sm = smaller, dk = dark ink) */
function tt(x,y,t,c,fs){
  var a=Array.isArray(t)?t:[t], f=fs?Math.round(fs*1.28):0, g=f?f*1.2:20, s='';
  a.forEach(function(l,i){ s+='<text x="'+x+'" y="'+(y+(i-(a.length-1)/2)*g)+'"'+(c?' class="'+c+'"':'')+(f?' style="font-size:'+f+'px"':'')+'>'+l+'</text>' });
  return s;
}
function rc(x,y,w,h,f,s,rx){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx==null?10:rx)+'" fill="'+f+'"'+(s?' stroke="'+s+'" stroke-width="2"':'')+'/>' }
function bxl(x,y,w,h,t,o){ o=o||{}; return rc(x,y,w,h,o.f||CL.box,o.s||'#7fd4ff',o.rx)+tt(x+w/2,y+h/2,t,o.c,o.fs) }
function pth(d,c,w,m,dash,id){ return '<path'+(id?' id="'+id+'"':'')+' d="'+d+'" stroke="'+c+'" stroke-width="'+Math.min(w||3,6)+'" fill="none" stroke-linecap="round" stroke-linejoin="round"'+(m?' marker-end="url(#'+m+')"':'')+(dash?' stroke-dasharray="'+dash+'"':'')+'/>' }
function ci(x,y,r,f,o){ return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(o?' opacity="'+o+'"':'')+'/>' }
function pill(x,y,t,f,c,fs){ var w=Math.max(34,String(t).length*8+16); return rc(x-w/2,y-12,w,24,f||'rgba(255,255,255,.2)','rgba(255,255,255,.55)',12)+tt(x,y,t,'lt '+(c||''),fs||12) }
function grp(s,inner){ return '<g data-s="'+s+'">'+inner+'</g>' }
function fish(x,y,s,c,flip){ return '<g transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')"><ellipse rx="24" ry="11" fill="'+c+'"/><path d="M-22 0L-40 -11L-40 11z" fill="'+c+'"/><circle cx="12" cy="-3" r="2.6" fill="'+CL.ink+'"/></g>' }
function seaBg(w,h,y0){ return '<defs><linearGradient id="sbg'+w+h+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+CL.sea1+'"/><stop offset="1" stop-color="'+CL.deep+'"/></linearGradient></defs>'+rc(0,y0,w,h-y0,'url(#sbg'+w+h+')',null,0) }
function wave(x0,x1,y,c){ var d='M'+x0+' '+y, x; for(x=x0;x<x1;x+=40) d+=' q10 -8 20 0 t20 0'; return pth(d,c||'rgba(255,255,255,.7)',2.5) }

/* the picture beside the goals: a slice of sea with the nutrients the lesson is about */
function goalsSVG(){
  var s='<defs><linearGradient id="gsx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd4ff"/><stop offset=".4" stop-color="#1f6fa8"/><stop offset="1" stop-color="#06182d"/></linearGradient>'+mkr('gsa',CL.blue)+'</defs>';
  s+=rc(0,0,330,380,'url(#gsx)',null,22)+ci(272,46,25,CL.gold)+wave(0,330,84);
  var X=[40,95,150,215,265,70,190,120,240,30,170],Y=[102,126,110,140,108,150,158,176,170,186,92];
  X.forEach(function(x,i){ s+=ci(x,Y[i],3+(i%3),'#8fe26e',.9) });
  s+=pill(70,118,'NO₃⁻')+pill(205,98,'PO₄³⁻')+pill(268,150,'CO₂')+pill(150,176,'Mg²⁺');
  s+=pth('M40 340 L40 230',CL.blue,5,'gsa')+tt(40,205,['تيار','صاعد'],'sm',13);
  [[225,205],[232,235],[222,262],[236,290],[228,318]].forEach(function(p,i){ s+=ci(p[0],p[1],2.6+(i%2),'#fff',.85) });
  s+=tt(238,185,'ثلج بحري','sm',13);
  s+='<path d="M0 352 Q80 338 165 352 T330 348 L330 380 L0 380z" fill="#0b2a1c" opacity=".85"/>';
  s+='<path d="M268 352 l10 -34 l12 34z" fill="#3a2a1a"/>'+ci(279,312,5,'rgba(255,255,255,.5)')+ci(283,298,6,'rgba(255,255,255,.35)');
  return svg(330,380,s,'','مغذيات في طبقة سطحية من المحيط');
}

/* figure 3-8: a general nutrient cycle, the biotic phase (green) and the abiotic phase (blue); steps 1-3 follow the points */
function cycSVG(){
  var s='<defs>'+mkr('cyg','#35c46f')+mkr('cyb','#6fc6f2')+'</defs>';
  s+=grp(1,bxl(320,150,110,46,'منتجات',{f:'#1b7a43',s:'#35c46f'})+bxl(165,12,110,46,'مستهلكات',{f:'#1b7a43',s:'#35c46f'})+pth('M375 148 C375 70 330 36 280 36',CL.green,9,'cyg'));
  s+=grp(2,bxl(10,150,110,46,'محلّلات',{f:'#1b7a43',s:'#35c46f'})+pth('M160 36 C80 36 62 90 62 146',CL.green,9,'cyg')+pth('M316 173 L126 173',CL.green,9,'cyg')+tt(220,108,'الطور الحيوي','lt',17));
  s+=grp(3,rc(90,282,260,84,'#2a8fc7','#bfe8ff',8)+tt(220,324,['مغذيات غير عضوية','أيونات · غازات · رواسب وصخور'],'',16)+pth('M62 202 C62 260 80 300 98 318',CL.blue,9,'cyb')+pth('M344 322 C392 300 380 250 376 204',CL.blue,9,'cyb')+tt(220,232,'الطور غير الحيوي','lt',17));
  return svg(440,380,s,'','دورة عامة لمغذٍّ');
}

/* the surface reservoir of dissolved nutrients, filled by five processes (inputs 1-5 follow the points) */
function resSVG(){
  var s='<defs>'+mkr('rsa','#bfe8ff')+'</defs>';
  s+=rc(150,130,220,110,'#1f6fa8','#bfe8ff',16)+tt(260,170,['خزان المغذيات','الذائبة'],'',17)+tt(260,214,'الطبقة السطحية للمحيط','sm',13);
  s+=grp(1,bxl(170,8,180,44,['الغلاف الجوي','(غازات تذوب في الماء)'],{fs:13})+pth('M260 54 L260 126',CL.gold,6,'rsa')+tt(300,90,'1','lt',18));
  s+=grp(2,bxl(10,140,115,64,['الكائنات الحية','والمحلّلات'],{fs:14})+pth('M128 172 L146 172',CL.gold,6,'rsa')+tt(137,124,'2','lt',18)+tt(68,224,'إخراج وتحلل','sm',13));
  s+=grp(3,bxl(170,314,180,46,['المياه العميقة','(غنية بالمغذيات)'],{fs:13})+pth('M260 312 L260 246',CL.gold,6,'rsa')+tt(300,282,'3','lt',18));
  s+=grp(4,bxl(400,140,110,64,['اليابسة','والأنهار'],{fs:14})+pth('M396 172 L376 172',CL.gold,6,'rsa')+tt(387,124,'4','lt',18)+tt(455,224,'جريان سطحي','sm',13));
  s+=grp(5,bxl(380,276,130,64,['فوهات حرارية','وبراكين وصخور'],{fs:13})+pth('M400 274 L366 240',CL.gold,6,'rsa')+tt(398,252,'5','lt',18));
  return svg(520,372,s,'','العمليات التي تجدد مخزون المغذيات');
}

/* dissolving of atmospheric gases: a sink (more dissolves), a balance, a source (more escapes) */
function gasSVG(){
  var s='<defs>'+mkr('gsd',CL.gold)+mkr('gsu',CL.red)+'</defs>';
  s+=rc(0,0,460,96,'rgba(127,212,255,.16)',null,12)+tt(230,16,'الغلاف الجوي','sm',13);
  [[40,44,'CO₂'],[110,60,'N₂'],[200,40,'CO₂'],[290,58,'N₂'],[370,42,'CO₂'],[425,64,'N₂']].forEach(function(m){ s+=ci(m[0],m[1],13,'rgba(255,255,255,.25)')+tt(m[0],m[1],m[2],'lt sm',11) });
  s+=rc(0,126,460,150,'#1f6fa8',null,12)+wave(0,460,126);
  var z=[[0,'مصرف','Sink',7,2.5,'#2c6fa6'],[153,'توازن','Equilibrium',4,4,'#2f7d57'],[306,'مصدر','Source',2.5,7,'#a8603c']];
  z.forEach(function(q){
    var cx=q[0]+77;
    s+=rc(q[0]+4,126,146,150,q[5],null,0)+'<g opacity=".95">'+pth('M'+(cx-26)+' 94 L'+(cx-26)+' 122',CL.gold,q[3],'gsd')+pth('M'+(cx+26)+' 122 L'+(cx+26)+' 98',CL.red,q[4],'gsu')+'</g>';
    s+=tt(cx,176,q[1],'',18)+tt(cx,200,q[2],'lt sm',12);
  });
  s+=tt(77,236,['يذوب أكثر','مما يعود'],'sm',13)+tt(230,236,['الكمية الذائبة','= الكمية العائدة'],'sm',13)+tt(383,236,['يعود أكثر','مما يذوب'],'sm',13);
  s+=tt(230,296,'السهم الأصفر: ذوبان في الماء · السهم الأحمر: انتشار عائد إلى الجو','sm',12);
  return svg(460,312,s,'','مصارف ومصادر الغازات الذائبة');
}

/* coastal upwelling and downwelling (figure 3-10): state 'up' (wind along the shore) or 'dn' (wind toward the shore); both are drawn, the class on the svg picks one */
function upwSVG(){
  var s='<defs>'+mkr('uwb','#8fd8ff')+mkr('uwo','#ffb36b')+'</defs>';
  s+=rc(0,70,460,250,'#12507a',null,10)+rc(0,200,460,120,'#0b3558',null,10);
  s+='<path d="M340 70 L460 70 L460 320 L300 320 Q340 250 340 70z" fill="#6b8f4e"/><path d="M340 70 Q352 200 300 320 L460 320 L460 70z" fill="#8a6b45" opacity=".55"/>';
  s+=wave(0,330,72)+tt(400,50,'اليابسة','',15);
  s+=tt(112,26,['الرياح بمحاذاة الشاطئ','(نحو الناظر)'],'sm up-only',13)+tt(112,26,['الرياح نحو الشاطئ','(تدفع الماء إلى اليابسة)'],'sm dn-only',13);
  s+='<g class="up-only"><circle cx="318" cy="40" r="13" fill="none" stroke="#fff" stroke-width="3"/>'+ci(318,40,4,'#fff')+pth('M250 100 L140 100','#ffb36b',7,'uwo')+tt(195,86,'ماء سطحي دافئ يُدفع بعيداً','sm',13)+pth('M310 295 L310 160 Q310 130 300 110','#8fd8ff',9,'uwb')+tt(222,262,['ماء عميق بارد','غني بالمغذيات يصعد'],'sm',14);
  [[290,260],[270,220],[300,200],[240,290],[330,250],[285,150],[298,125],[318,170]].forEach(function(p){ s+=ci(p[0],p[1],4,'#8fe26e') });
  s+=tt(130,170,'تيار صاعد','',18)+'</g>';
  s+='<g class="dn-only">'+'<circle cx="318" cy="40" r="13" fill="none" stroke="#fff" stroke-width="3"/><path d="M311 33 l14 14 M325 33 l-14 14" stroke="#fff" stroke-width="3"/>'+pth('M120 100 L250 100','#ffb36b',7,'uwo')+tt(185,86,'ماء سطحي يُدفع نحو الشاطئ','sm',13)+pth('M315 112 L315 270','#8fd8ff',9,'uwb')+tt(222,230,['المغذيات تُزال','من الطبقة السطحية'],'sm',14);
  [[300,110],[318,130],[308,170],[322,210],[300,250]].forEach(function(p){ s+=ci(p[0],p[1],4,'#8fe26e') });
  s+=tt(130,170,'تيار هابط','',18)+'</g>';
  return svg(460,330,s,'upw-svg','التيار الصاعد والتيار الهابط');
}

/* runoff: nutrients and pollutants washed from the land to the sea */
function runSVG(){
  var s='<defs>'+mkr('rna',CL.gold)+'<linearGradient id="rng" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b84c6"/><stop offset="1" stop-color="#0a3558"/></linearGradient></defs>';
  s+=rc(0,0,460,300,'rgba(127,212,255,.14)',null,12);
  s+='<path d="M0 90 L250 90 Q300 150 340 175 L340 300 L0 300z" fill="#6b8f4e"/><path d="M0 210 L340 210 L340 300 L0 300z" fill="#8a6b45" opacity=".7"/>';
  s+='<path d="M250 90 Q300 150 340 175 L460 175 L460 300 L340 300 Q300 270 250 200z" fill="url(#rng)"/>'+wave(340,460,176);
  [30,70,110,150].forEach(function(x){ s+=pth('M'+x+' 130 L'+x+' 112',CL.green,3)+pth('M'+(x-6)+' 124 l6 -12 l6 12',CL.green,3) });
  s+=rc(180,52,40,38,'#cfd8dc',null,3)+rc(188,36,8,18,'#9aa9ac',null,2)+tt(200,22,'مصنع','sm',13)+tt(75,76,'مزارع','sm',14);
  s+=grp(1,pill(60,160,'أسمدة','rgba(143,226,110,.35)','',13)+pth('M85 168 Q160 190 250 160',CL.gold,5,'rna',6)+pill(150,198,'مياه صرف','rgba(255,255,255,.2)','',13));
  s+=grp(2,pill(235,128,'نفط ومعادن ثقيلة ومبيدات','rgba(255,138,122,.35)','',12)+pth('M262 140 Q300 175 340 185',CL.gold,5,'rna',6));
  s+=grp(3,pth('M345 190 L440 190',CL.gold,7,'rna')+tt(395,224,'نهر ← بحر','sm',14)+tt(395,252,'المغذيات الزائدة تسبب ازدهاراً للطحالب ومناطق ميتة','sm',12));
  return svg(460,300,s,'','الجريان السطحي نحو البحر');
}

/* tectonic activity: three strips, a hydrothermal vent, weathering of rock, volcanic ash (strips 1-3 follow the points) */
function tectSVG(){
  var s='<defs>'+mkr('tca',CL.gold)+'</defs>';
  function strip(x,w,title){ return rc(x,0,w,330,'rgba(127,212,255,.12)','rgba(127,212,255,.35)',12)+tt(x+w/2,24,title,'',15) }
  /* 1 the vent */
  s+=grp(1,strip(0,148,'فوهة حرارية')+rc(4,150,140,176,'#0b3558',null,0)+'<path d="M4 300 L144 300 L144 326 L4 326z" fill="#3a2a1a"/><ellipse cx="74" cy="316" rx="48" ry="9" fill="#c4452b"/>'+
    '<path d="M60 300 L65 214 L83 214 L88 300z" fill="#4a4a50"/>'+ci(74,206,8,'#222')+ci(82,186,11,'#2b2b2f',.9)+ci(68,164,14,'#333',.8)+ci(78,140,15,'#3b3b40',.65)+
    tt(74,64,['معادن ذائبة','في الماء الحار'],'sm',12)+tt(74,286,'ماجما','sm',12)+pth('M30 290 Q18 250 28 214',CL.gold,3,'tca'));
  /* 2 weathering and erosion */
  s+=grp(2,strip(156,148,'تعرية وتجوية')+'<path d="M160 190 L200 90 L240 140 L270 100 L300 190z" fill="#8a7a65"/><path d="M160 190 L300 190 L300 326 L160 326z" fill="#8a6b45"/>'+
    pth('M190 50 L190 74',CL.blue,3,'tca')+pth('M216 46 L216 70',CL.blue,3,'tca')+pth('M244 52 L244 76',CL.blue,3,'tca')+tt(230,34+2,'','',1)+
    pth('M250 150 Q262 220 236 262 Q214 296 190 306',CL.blue,4,'tca')+tt(230,252,['مغذيات تذوب','وتجري إلى البحر'],'sm',12));
  /* 3 volcanic ash */
  s+=grp(3,strip(312,148,'رماد بركاني')+rc(316,214,140,112,'#12507a',null,0)+'<path d="M340 214 L380 110 L420 214z" fill="#5a4a3a"/>'+ci(380,100,12,'#cfc6b8',.75)+ci(402,84,10,'#b9b0a2',.65)+ci(362,82,9,'#b9b0a2',.6)+
    [0,1,2,3,4,5].map(function(i){ return pth('M'+(330+i*20)+' '+(120+(i%2)*14)+' L'+(330+i*20)+' '+(190+(i%2)*10),'#b9b0a2',2) }).join('')+tt(386,254,['فوسفات · حديد','مغنيسيوم'],'sm',12)+tt(386,296,'يذوب في الماء','sm',12));
  return svg(460,330,s,'','النشاط التكتوني يضيف المغذيات');
}

/* marine snow: particles fall from the surface to the deep sea (steps 1-4 follow the points) */
function snowSVG(){
  var s='<defs>'+mkr('sna','#ffffff')+'</defs>';
  s+=rc(0,0,460,360,'#0a3558',null,12)+rc(0,0,460,110,'#2b84c6',null,12)+wave(0,460,10)+tt(60,24,'الطبقة السطحية','sm',13);
  s+=grp(1,[40,100,160,230,300,380].map(function(x,i){return ci(x,48+(i%3)*14,4,'#8fe26e')}).join('')+fish(250,84,.7,'#ffb98a')+fish(90,88,.5,'#c7d6e2',1)+tt(330,92,'براز وبقايا ميتة','sm',12));
  s+=grp(3,[[120,130],[140,160],[210,150],[250,190],[300,140],[330,180],[180,210],[270,230],[360,210],[100,250],[230,260],[320,270]].map(function(p,i){return ci(p[0],p[1],2.2+(i%3)*.8,'#fff',.85)}).join('')+tt(230,128,'ثلج بحري يهبط','',15));
  s+=grp(4,fish(60,230,.8,'#9aa9ac')+'<path d="M380 240 q6 -22 12 0 q6 -26 12 0" stroke="#d9a0e8" stroke-width="3" fill="none"/>'+tt(70,266,['تتغذى عليه','كائنات الأعماق'],'sm',12)+tt(395,262,'متغذيات بالترشيح','sm',12));
  s+=grp(4,'<path d="M0 316 Q120 300 230 318 T460 310 L460 360 L0 360z" fill="#3a2a1a"/>'+tt(230,340,'رواسب القاع (تبقى سنوات طويلة)','',14));
  return svg(460,360,s,'','الثلج البحري');
}

/* the carbon cycle of activity 3-4 (figure 3-7): seven boxes, eleven arrows A-K; the arrow of the opened card lights up */
function carbonSVG(){
  var s='<defs>'+mkr('cca','#cfe6ef')+mkr('ccg','#ffd966')+'</defs>';
  function box(x,y,w,h,t){ return bxl(x,y,w,h,t,{fs:14}) }
  s+=box(0,24,140,50,['سلاسل غذائية','برية'])+box(170,24,120,50,'الغلاف الجوي')+box(340,24,160,50,'اليابسة');
  s+=box(250,150,190,70,['مخزون المغذيات الذائبة','في الطبقة السطحية للبحر'])+box(0,150,160,65,['سلاسل غذائية','بحرية']);
  s+=box(10,270,180,50,['رواسب على','قاع البحر'])+box(10,370,180,50,'صخور قاع البحر');
  var A=[['J','M70 24 L70 13 L420 13 L420 20'],['I','M140 49 L166 49'],['K','M340 49 L294 49'],['A','M400 74 L400 146'],['B','M280 74 L280 146'],['C','M250 185 L164 185'],['D','M70 150 L70 78'],['E','M70 215 L70 266'],['F','M190 295 L300 295 L300 224'],['G','M100 320 L100 366'],['H','M190 395 L475 395 L475 78']];
  var LP={J:[245,7],I:[153,34],K:[316,34],A:[418,112],B:[298,112],C:[207,170],D:[88,112],E:[88,244],F:[245,282],G:[118,344],H:[330,382]};
  A.forEach(function(a){ s+='<g class="car" data-l="'+a[0]+'">'+pth(a[1],'#cfe6ef',3,'cca')+'<g>'+ci(LP[a[0]][0],LP[a[0]][1]+6,12,'#0a2540')+tt(LP[a[0]][0],LP[a[0]][1]+6,a[0],'lt',15)+'</g></g>' });
  return svg(510,436,s,'car-svg','دورة الكربون');
}

/* the Gulf of Mexico (figures 3-11, 3-13): a simplified map; the Mississippi brings nutrients, the dead zone lies off the coast (steps 2 and 3 follow the points) */
function gulfSVG(){
  var s='<defs>'+mkr('gfa',CL.gold)+'</defs>';
  s+=rc(0,0,460,330,'#a9d3ea',null,12);
  /* land: the US coast along the top (Texas, Louisiana, Florida), Mexico on the left, Yucatan at the bottom, Cuba */
  s+='<path d="M0 0 L460 0 L460 120 L440 118 Q424 190 408 196 Q398 150 380 102 Q340 82 304 94 L296 112 L284 98 Q240 82 190 86 Q130 92 92 124 Q56 162 56 212 Q60 262 100 292 Q150 318 206 306 L230 330 L0 330z" fill="#d8cfa4"/>';
  s+='<path d="M298 98 Q310 108 322 104 L316 118 Q300 120 292 112z" fill="#c9bf92"/>';
  s+='<ellipse cx="392" cy="292" rx="46" ry="11" fill="#d8cfa4"/>';
  s+=tt(150,40,'تكساس','dk',16)+tt(230,40,'لويزيانا','dk',16)+tt(410,48,'فلوريدا','dk',16)+tt(40,254,'المكسيك','dk',14)+tt(392,292,'كوبا','dk',15);
  s+='<path d="M292 0 L292 96" stroke="#2b84c6" stroke-width="5" fill="none" stroke-linecap="round"/>'+tt(358,16,'نهر المسيسيبي','dk',13);
  s+=grp(2,pth('M300 112 Q304 126 300 140',CL.gold,5,'gfa')+tt(180,128,['مغذيات من الأراضي الزراعية','1.7 مليون طن سنوياً'],'dk',11));
  s+=grp(3,'<ellipse cx="250" cy="170" rx="86" ry="30" fill="#c4452b" opacity=".75"/><ellipse cx="250" cy="170" rx="54" ry="18" fill="#7a1f12" opacity=".9"/>'+tt(250,170,'المنطقة الميتة','',14)+tt(250,214,'نحو 13 000 km² في المتوسط','dk',13));
  s+=tt(262,262,'خليج المكسيك','dk',20);
  return svg(460,330,s,'','المنطقة الميتة في خليج المكسيك (رسم تقريبي)');
}

/* figure 3-12: the cumulative number of dead zones, read from the book's bars (approximate) */
function deadBarsSVG(){
  var L=['< 1910','1920','1930','1940','1950','1960','1970','1980','1990','2000','2010'], V=[8,12,14,17,20,38,60,130,300,405,405], W=440, H=250, l=46, b=58, t=14, r=10, mx=450, n=V.length, bw=(W-l-r)/n-8;
  var s='<defs></defs>'+rc(l,t,W-l-r,H-b-t,'rgba(255,255,255,.07)',null,2);
  for(var g=0;g<=450;g+=50){ var y=H-b-(H-b-t)*g/mx; s+='<line x1="'+l+'" y1="'+y+'" x2="'+(W-r)+'" y2="'+y+'" stroke="rgba(255,255,255,.14)"/>'+'<text x="'+(l-6)+'" y="'+y+'" class="lt sm" style="text-anchor:end;font-size:11px">'+g+'</text>' }
  V.forEach(function(v,i){ var x=l+8+i*((W-l-r)/n), h=(H-b-t)*v/mx; s+='<rect x="'+x+'" y="'+(H-b-h)+'" width="'+bw+'" height="'+h+'" fill="#f2554a"/><text x="'+(x+bw/2)+'" y="'+(H-b+14)+'" transform="rotate(-50 '+(x+bw/2)+' '+(H-b+14)+')" class="lt sm" style="text-anchor:end;font-size:11px">'+L[i]+'</text>' });
  s+=tt(W/2,H-6,'السنة','sm',12)+'<text x="12" y="'+((H-b+t)/2)+'" transform="rotate(-90 12 '+((H-b+t)/2)+')" class="sm" style="font-size:12px">العدد التراكمي للأنظمة</text>';
  return svg(W,H,s,'','أعداد المناطق الميتة على امتداد العقود (قراءة تقريبية)');
}

/* figure 3-11 of the activity book (end-of-unit question 4): five arrows A-E around a coast */
function fig311SVG(){
  var s='<defs>'+mkr('f3a','#101820')+'</defs>';
  s+=rc(0,0,460,340,'#dfe7ec',null,12)+rc(0,150,460,190,'#9cc3dc',null,0)+'<path d="M0 150 L150 150 Q200 170 230 200 Q300 230 460 235 L460 340 L0 340z" fill="#7a8b6a"/><path d="M0 150 L120 150 L150 175 L0 175z" fill="#8f9f7e"/>';
  s+=rc(70,86,60,64,'#b8c2c8',null,2)+rc(94,54,12,34,'#9aa9ac',null,2)+rc(40,110,20,40,'#a9b4ba',null,2)+'<path d="M16 150 l8 -40 l8 40z M30 150 l8 -34 l8 34z" fill="#2f6f3a"/>';
  s+='<path d="M330 214 L400 214 L394 228 L336 228z" fill="#5a4a3a"/><path d="M365 214 L365 190" stroke="#333" stroke-width="3"/>'+fish(300,262,.5,'#e9eef2')+fish(330,276,.45,'#e9eef2',1)+fish(280,282,.4,'#e9eef2');
  s+='<path d="M220 310 Q330 292 460 312 L460 340 L220 340z" fill="#4a3a2a"/>'+tt(380,326,'رواسب القاع','',14);
  s+='<path d="M360 30 q20 -18 46 -6 q22 -10 36 8 q14 10 -6 20 l-76 0 q-16 -4 0 -22z" fill="#8a96a0"/>';
  var AR=[['E','M110 52 L350 44'],['D','M416 82 L416 190'],['A','M130 130 L230 215'],['B','M300 262 L400 306'],['C','M440 300 L440 200']];
  var LP={E:[240,34],D:[432,136],A:[160,162],B:[340,300],C:[452,250]};
  AR.forEach(function(a){ s+=pth(a[1],'#101820',3.5,'f3a')+ci(LP[a[0]][0],LP[a[0]][1],12,'#101820')+tt(LP[a[0]][0],LP[a[0]][1],a[0],'lt',15) });
  s+=tt(230,320,'','',1);
  return svg(460,340,s,'','دورة الكربون: الشكل 3-11');
}

/* the salmon and the forest: a loop of five links (steps follow the points) */
function salmSVG(){
  var s='<defs>'+mkr('sma','#ffd966')+'</defs>';
  function n(x,y,w,t,st){ return grp(st,bxl(x-w/2,y-27,w,54,t,{fs:11})) }
  s+=n(230,34,250,['السلمون يعيش في المحيط ويعود','إلى المياه العذبة للتكاثر'],1);
  s+=n(380,126,150,['الدببة والنسور','تأكله وتنقل بقاياه'],2)+grp(2,pth('M300 44 Q380 52 384 96',CL.gold,5,'sma'));
  s+=n(340,238,200,['تحلل بقاياه ← نترات','تمتصها جذور الأشجار'],3)+grp(3,pth('M384 154 Q392 200 372 208',CL.gold,5,'sma'));
  s+=n(120,238,200,['الأشجار تنمو أسرع','نحو 3 مرات'],4)+grp(4,pth('M240 238 L222 238',CL.gold,5,'sma'));
  s+=n(80,126,150,['ظلّ وماء صافٍ','وحشرات للصغار'],5)+grp(5,pth('M90 210 Q70 190 76 154',CL.gold,5,'sma'));
  s+=grp(5,pth('M96 98 Q130 60 124 40',CL.gold,5,'sma'));
  return svg(460,290,s,'','حلقة تغذية راجعة إيجابية');
}

/* horizontal bars on a log scale: rows [label, value, text, highlight] ; from..to are powers of ten */
function logBars(rows,from,to,o){
  o=o||{}; var W=o.w||440, lw=o.lw||120, rh=o.rh||32, H=rows.length*rh+34, s='';
  rows.forEach(function(r,i){
    var y=i*rh+8, w=Math.max(6,(Math.log10(r[1])-from)/(to-from)*(W-lw-70));
    s+='<text x="'+(lw-8)+'" y="'+(y+rh/2-3)+'" style="text-anchor:start;font-size:15px">'+r[0]+'</text>';
    s+='<rect x="'+lw+'" y="'+y+'" width="'+w+'" height="'+(rh-8)+'" rx="5" fill="'+(r[3]?'#ffd966':'#4aa8e0')+'"/>'+'<text x="'+(lw+w+6)+'" y="'+(y+rh/2-3)+'" class="lt" style="text-anchor:start;font-size:13px">'+r[2]+'</text>';
  });
  s+='<text x="'+(W/2)+'" y="'+(H-8)+'" class="sm">'+(o.axis||'')+'</text>';
  return svg(W,H,s,'','مقارنة بمقياس لوغاريتمي');
}

/* the abiotic phase: ions in the water, gases in the air, sediments and rock on the sea floor (the three parts follow the points 2-4) */
function abioSVG(){
  var s=rc(0,0,440,330,'rgba(127,212,255,.1)',null,12);
  s+=rc(0,0,440,90,'rgba(190,225,255,.22)',null,12)+tt(220,14,'الغلاف الجوي','sm',13)+rc(0,90,440,130,'#1f6fa8',null,0)+wave(0,440,90)+tt(220,106,'الماء','sm',13)+rc(0,220,440,110,'#4a3626',null,12);
  s+=grp(3,[[60,50,'CO₂'],[150,62,'N₂'],[240,44,'CO₂'],[330,60,'N₂'],[395,40,'CO₂']].map(function(m){return ci(m[0],m[1],15,'rgba(255,255,255,.3)')+tt(m[0],m[1],m[2],'lt sm',12)}).join('')+tt(220,78,'غازات','',15));
  s+=grp(2,pill(70,140,'NO₃⁻')+pill(190,160,'PO₄³⁻')+pill(310,138,'Mg²⁺')+pill(380,184,'CO₃²⁻')+pill(120,196,'Ca²⁺')+tt(250,206,'أيونات ذائبة','',15));
  s+=grp(4,'<path d="M0 262 Q110 250 220 264 T440 258 L440 330 L0 330z" fill="#6a4e36"/><path d="M0 296 Q110 286 220 298 T440 292 L440 330 L0 330z" fill="#85634a"/><path d="M0 318 Q110 310 220 320 T440 314 L440 330 L0 330z" fill="#9aa0a6"/>'+tt(220,246,'رواسب','',15)+tt(220,312,'صخور','sm dk',14));
  return svg(440,330,s,'','أشكال المغذيات في الطور غير الحيوي');
}

/* horizontal bars on a linear scale: rows [label, value, text, highlight] */
function linBars(rows,max,o){
  o=o||{}; var W=o.w||440, lw=o.lw||150, rh=o.rh||40, H=rows.length*rh+30, s='';
  rows.forEach(function(r,i){
    var y=i*rh+8, w=Math.max(6,r[1]/max*(W-lw-80));
    s+='<text x="'+(lw-8)+'" y="'+(y+rh/2-6)+'" style="text-anchor:start;font-size:15px">'+r[0]+'</text>';
    s+='<rect x="'+lw+'" y="'+y+'" width="'+w+'" height="'+(rh-12)+'" rx="5" fill="'+(r[3]?'#ffd966':'#f2554a')+'"/>'+'<text x="'+(lw+w+6)+'" y="'+(y+rh/2-6)+'" class="lt" style="text-anchor:start;font-size:14px">'+r[2]+'</text>';
  });
  s+='<text x="'+(W/2)+'" y="'+(H-8)+'" class="sm">'+(o.axis||'')+'</text>';
  return svg(W,H,s,'','مقارنة بمقياس خطي');
}
