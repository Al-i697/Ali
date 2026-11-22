/* ---------- flat drawn pictures for the light primary-school look (skin 'sci'). Every picture is inline SVG in one consistent style:
   a dark-coffee outline (4 px, round), flat colours, no gradients. They are ours («من عندي»), drawn from the books' descriptions, not copied from them.
   ART.name(opts) returns the <svg> markup; the size comes from the CSS of the box that holds it. ---------- */
var ART=(function(){
  var INK='#3A2418', S='stroke="'+INK+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  function svg(vb,inner,cls){ return '<svg class="art '+(cls||'')+'" viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+inner+'</svg>' }
  /* a glass beaker: x,y,w,h; liquid colour and level (0..1); dots = loose markup drawn inside (grains) */
  function beaker(x,y,w,h,col,lvl,dots,id){
    var ly=y+h*(1-lvl), r=14;
    var liq=lvl>0?'<path'+(id?' id="'+id+'"':'')+' d="M'+(x+3)+' '+ly+'H'+(x+w-3)+'V'+(y+h-r)+'Q'+(x+w-3)+' '+(y+h-3)+' '+(x+w-r)+' '+(y+h-3)+'H'+(x+r)+'Q'+(x+3)+' '+(y+h-3)+' '+(x+3)+' '+(y+h-r)+'Z" fill="'+col+'"/>':'';
    return liq+(dots||'')+'<path d="M'+(x-8)+' '+(y-6)+'L'+(x+2)+' '+y+'V'+(y+h-r)+'Q'+(x+2)+' '+(y+h)+' '+(x+r)+' '+(y+h)+'H'+(x+w-r)+'Q'+(x+w-2)+' '+(y+h)+' '+(x+w-2)+' '+(y+h-r)+'V'+y+'L'+(x+w+8)+' '+(y-6)+'" fill="none" '+S+'/>';
  }
  function grains(x,y,w,h,n,col,seed,r){
    var s=seed||7, o='', i; function rnd(){ s=(s*9301+49297)%233280; return s/233280 }
    for(i=0;i<n;i++) o+='<circle cx="'+(x+rnd()*w).toFixed(1)+'" cy="'+(y+rnd()*h).toFixed(1)+'" r="'+((r||5)*(.7+rnd()*.6)).toFixed(1)+'" fill="'+col+'"/>';
    return o;
  }
  var A={INK:INK,svg:svg,beaker:beaker,grains:grains};

  /* three beakers: a solid that does not dissolve + water (prior knowledge) */
  A.mix=function(kind){
    var M={sand:['#E8CF98','#CDEBF7','#C9A560'],coffee:['#5A3520','#D6B48A','#3B2113'],flour:['#FFFDF5','#EAF4F7','#E7DCC0']}[kind]||['#CCC','#CDEBF7','#999'];
    return svg('0 0 150 170',beaker(30,30,90,120,M[1],.72,grains(36,100,78,44,26,M[0],11,5.5)+grains(36,100,78,44,10,M[2],5,3.5))+'<path d="M52 78q10-8 20 0t20 0" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>','mixsvg');
  };
  /* a kitchen sieve over a pot: the coffee grounds stay, the liquid passes */
  A.sieve=function(){
    var mesh=''; for(var i=-3;i<=3;i++) mesh+='<path d="M'+(100+i*18)+' 92V132" stroke="'+INK+'" stroke-width="2" opacity=".6"/>';
    for(var j=0;j<3;j++) mesh+='<path d="M52 '+(100+j*12)+'H148" stroke="'+INK+'" stroke-width="2" opacity=".6"/>';
    return svg('0 0 220 210','<path d="M40 150H160V190Q160 198 152 198H48Q40 198 40 190Z" fill="#E9DCC6" '+S+'/><path d="M46 90H154Q154 140 100 146Q46 140 46 90Z" fill="#F6EDDA" '+S+'/>'+mesh+grains(60,76,80,14,12,'#4A2A17',3,5)+'<path d="M154 100L206 70" '+S+' stroke-width="9"/><path d="M80 150v14M100 154v16M120 150v12" stroke="#7A4A28" stroke-width="5" stroke-linecap="round"/>','sievesvg');
  };
  /* the filter paper seen very close: tiny holes; small bits pass, big bits stay on top (the dots move in CSS: .pores) */
  A.pores=function(){
    var big='', small='', i;
    for(i=0;i<5;i++) big+='<circle class="pb pb'+i+'" cx="'+(40+i*52)+'" cy="64" r="17" fill="#7A4A28" stroke="'+INK+'" stroke-width="3"/>';
    for(i=0;i<5;i++) small+='<circle class="ps ps'+i+'" cx="'+(66+i*52)+'" cy="46" r="6.5" fill="#46B6E8" stroke="#1D6C93" stroke-width="2"/>';
    var holes=''; for(i=0;i<5;i++) holes+='<rect x="'+(56+i*52-8)+'" y="104" width="16" height="30" rx="4" fill="#FBF3E4"/>';
    return svg('0 0 300 220','<rect x="14" y="104" width="272" height="30" rx="6" fill="#E8D5A8" '+S+'/>'+holes+'<g class="pores">'+small+big+'</g><path d="M66 150v50M118 150v50M170 150v50M222 150v50" stroke="#46B6E8" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" opacity=".8"/>','poresvg');
  };
  /* folding the filter paper: 1 circle, 2 half, 3 quarter, 4 open cone, 5 cone in the funnel */
  A.fold=function(n){
    var P='fill="#FFFDF5" '+S;
    var m={
      1:'<circle cx="100" cy="100" r="66" '+P+'/>',
      2:'<path d="M34 120A66 66 0 0 1 166 120Z" '+P+'/><path d="M100 120V60" stroke="#C9A560" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>',
      3:'<path d="M60 150V84A66 66 0 0 1 126 150Z" '+P+'/>',
      4:'<path d="M30 70L100 160L170 70Z" fill="#FFFDF5" '+S+'/><ellipse cx="100" cy="70" rx="70" ry="16" fill="#F6EDDA" '+S+'/><path d="M100 70L100 160" stroke="#C9A560" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>',
      5:'<path d="M26 60H174L116 130V160H84V130Z" fill="#DCEEF5" '+S+'/><path d="M38 60L100 132L162 60Z" fill="#FFFDF5" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/><ellipse cx="100" cy="60" rx="74" ry="9" fill="none" '+S+'/><path d="M100 166v14" stroke="#46B6E8" stroke-width="6" stroke-linecap="round"/>'
    }[n];
    return svg('0 0 200 200',m,'foldsvg');
  };
  A.mask=function(){
    return svg('0 0 220 150','<path d="M40 56C18 56 14 100 40 104M180 56C202 56 206 100 180 104" fill="none" '+S+'/><path d="M48 36Q110 14 172 36V108Q110 132 48 108Z" fill="#9ED7EE" '+S+'/><path d="M56 62Q110 46 164 62M56 78Q110 62 164 78M56 94Q110 78 164 94" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>','masksvg');
  };
  A.dripper=function(){
    return svg('0 0 220 230','<path d="M52 150H168L160 206Q158 218 146 218H74Q62 218 60 206Z" fill="#FFFDF5" '+S+'/><path d="M58 176H162L158 206Q156 214 146 214H74Q64 214 62 206Z" fill="#7A4A28"/><path d="M40 70H180L136 122H84Z" fill="#3A2418" '+S+'/><path d="M56 70L104 118L164 70Z" fill="#FFFDF5" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'+grains(76,74,56,14,9,'#4A2A17',4,4.5)+'<path d="M110 126v16" stroke="#7A4A28" stroke-width="6" stroke-linecap="round"/><path d="M168 168q26 0 26 22t-26 22" fill="none" '+S+'/>','drippersvg');
  };
  A.teabag=function(){
    return svg('0 0 220 200','<path d="M40 90H160V140Q160 180 120 180H80Q40 180 40 140Z" fill="#F2A33A" '+S+'/><path d="M160 104q36 0 36 26t-36 26" fill="none" '+S+'/><path d="M52 96H148V112Q148 118 140 118H60Q52 118 52 112Z" fill="#9A4F0E" opacity=".55"/><path d="M92 90V40" stroke="'+INK+'" stroke-width="3"/><path d="M76 20H108V40H76Z" fill="#FFFDF5" '+S+' transform="rotate(-6 92 30)"/><path d="M80 44H140V96H80Z" fill="#E8D5A8" '+S+'/><path d="M88 56h44M88 68h44M88 80h44" stroke="#7A5A2A" stroke-width="2.5" opacity=".6"/>','teabagsvg');
  };
  A.flamingo=function(){
    return svg('0 0 200 270','<path d="M96 188V252M118 186V254" fill="none" stroke="#E0527E" stroke-width="7" stroke-linecap="round"/><path d="M40 258H170" stroke="#46B6E8" stroke-width="6" stroke-linecap="round"/><path d="M82 140C26 128 30 62 82 54C106 50 120 64 114 84" fill="none" stroke="'+INK+'" stroke-width="22" stroke-linecap="round"/><path d="M82 140C26 128 30 62 82 54C106 50 120 64 114 84" fill="none" stroke="#F58FB0" stroke-width="14" stroke-linecap="round"/><ellipse cx="116" cy="170" rx="58" ry="34" fill="#F58FB0" '+S+'/><path d="M62 168q-24 4-32 22q26 2 40-8" fill="#F8B4CB" '+S+'/><circle cx="114" cy="92" r="11" fill="#F58FB0" '+S+'/><path d="M120 98q18 2 22 20" fill="none" stroke="'+INK+'" stroke-width="9" stroke-linecap="round"/><circle cx="111" cy="89" r="2.6" fill="'+INK+'"/>','flamingosvg');
  };
  A.dallah=function(){
    return svg('0 0 230 250','<path d="M156 160C192 150 204 120 214 84" fill="none" stroke="'+INK+'" stroke-width="18" stroke-linecap="round"/><path d="M156 160C192 150 204 120 214 84" fill="none" stroke="#D9A441" stroke-width="10" stroke-linecap="round"/><path d="M64 150C14 150 16 214 60 208" fill="none" '+S+'/><path d="M62 214C40 160 74 112 102 104H122C150 112 184 160 162 214Z" fill="#D9A441" '+S+'/><path d="M58 190H166M70 164H154" stroke="#9A6A14" stroke-width="4" stroke-linecap="round"/><path d="M96 104Q112 78 128 104Z" fill="#F2C75C" '+S+'/><circle cx="112" cy="76" r="8" fill="#F2C75C" '+S+'/><path d="M44 218H182" '+S+'/><path d="M92 40c-6-10 6-14 0-24M118 44c-6-10 6-14 0-24" fill="none" stroke="#B9A48C" stroke-width="4" stroke-linecap="round"/>','dallahsvg');
  };
  A.wetland=function(){
    var reeds=''; [30,56,84,214,236].forEach(function(x,i){ reeds+='<path d="M'+x+' 150C'+(x-6)+' 110 '+(x+6)+' 70 '+(x+(i%2?10:-8))+' 36" fill="none" stroke="#3E8F4F" stroke-width="5" stroke-linecap="round"/><ellipse cx="'+(x+(i%2?10:-8))+'" cy="40" rx="6" ry="16" fill="#8A5A34" '+S.replace('4"','3"')+'/>' });
    return svg('0 0 270 170','<rect x="0" y="100" width="270" height="70" rx="12" fill="#7FCBE0"/>'+reeds+'<ellipse cx="130" cy="128" rx="30" ry="9" fill="#5BAF5A" '+S.replace('4"','3"')+'/><ellipse cx="176" cy="146" rx="24" ry="7" fill="#6BBE62" '+S.replace('4"','3"')+'/><ellipse cx="96" cy="150" rx="20" ry="6" fill="#6BBE62" '+S.replace('4"','3"')+'/><circle cx="132" cy="120" r="7" fill="#F8B4CB" '+S.replace('4"','3"')+'/>','wetsvg');
  };
  /* the sand filter: dirty water, fine sand, coarse sand, gravel, clean water in a glass (the layers follow the student book's drawing) */
  A.sandfilter=function(){
    var gr=''; [[34,214],[66,222],[98,214],[130,224],[162,214],[48,240],[84,244],[118,242],[150,244]].forEach(function(p,i){ gr+='<ellipse cx="'+(p[0]+10)+'" cy="'+p[1]+'" rx="'+(13+(i%3)*2)+'" ry="10" fill="'+['#9A9A9A','#B5B0A6','#8C8C94'][i%3]+'" stroke="'+INK+'" stroke-width="2.5"/>' });
    return svg('0 0 250 340','<rect x="20" y="40" width="190" height="215" rx="8" fill="#FFFDF5"/><rect x="20" y="40" width="190" height="52" fill="#B38B57"/><rect x="20" y="92" width="190" height="50" fill="#F1E2B6"/><rect x="20" y="142" width="190" height="50" fill="#D7B574"/><rect x="20" y="192" width="190" height="63" fill="#E9E5DA"/>'+grains(28,148,174,38,22,'#B8914A',9,4)+gr+'<rect x="20" y="40" width="190" height="215" rx="8" fill="none" '+S+'/><path d="M94 255V292M118 255V292" '+S+'/><path d="M94 292H118" stroke="#CDEBF7" stroke-width="3"/><path d="M96 262v22M114 266v18" stroke="#46B6E8" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/><path d="M74 296H150V330Q150 336 144 336H80Q74 336 74 330Z" fill="#CDEBF7" '+S+'/><path d="M104 20v24" stroke="#46B6E8" stroke-width="6" stroke-linecap="round"/><path d="M88 22l16 18 16-18" fill="none" stroke="#46B6E8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>','sandsvg');
  };
  /* funnel with filter paper over a beaker (small icon) */
  A.setup=function(){
    return svg('0 0 200 220','<path d="M26 40H174L112 108V134H88V108Z" fill="#DCEEF5" '+S+'/><path d="M40 40L100 104L160 40Z" fill="#FFFDF5" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/><ellipse cx="100" cy="40" rx="74" ry="9" fill="none" '+S+'/>'+beaker(48,140,104,72,'#CDEBF7',.35),'setupsvg');
  };
  return A;
})();
