/* ---------- deck C: exercise 3-1 (a), the concept map (deck slides 14 and 15) ---------- */
slide({id:'ex31a',ch:4,title:'تمرين ٣-١ (أ): العلاقات النسبية للذرات',tag:'أكمل الفراغات',
 html:function(){
  var sents=[['C','يُستخدم نظير الكربون','12','كمقياس للكتلة الذرية النسبية.'],['C,He','تساوي كتلة ذرة الكربون','3','أضعاف كتلة ذرة الهيليوم.'],['He,H','تساوي كتلة ذرة الهيليوم','4','أضعاف كتلة ذرة الهيدروجين.'],['N,Li','تساوي كتلة ذرة النيتروجين','2','ضعفَي كتلة ذرة الليثيوم.']];
  return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div class="frm brk" style="padding:12px 14px"><svg id="nl" viewBox="0 0 1160 112" style="width:100%;height:auto" aria-label="خط أعداد من ١ إلى ١٤"></svg></div>'+
   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
   sents.map(function(s,i){return '<div class="frm brk sent" data-e="'+s[0]+'" style="padding:12px 16px;gap:8px;background:rgba(var(--t2),.08)"><div style="font-size:23px;line-height:1.6">'+s[1]+' <span style="display:inline-block;vertical-align:middle">'+ninHTML('s'+i,'','sm')+'</span> '+s[3]+'</div><div class="fb" style="min-height:24px;font-size:19px"></div></div>'}).join('')+'</div></div>';
 },
 init:function(el){
  var E=[['H',1],['He',4],['Li',7],['C',12],['N',14]], hl={};
  function line(){
    var s='<line x1="14" y1="74" x2="1148" y2="74" stroke="#f4fbf8" stroke-opacity=".8" stroke-width="2.4"/><path d="M14 74l12 -7M14 74l12 7M1148 74l-12 -7M1148 74l-12 7" stroke="#f4fbf8" stroke-opacity=".8" stroke-width="2.4" fill="none"/>';
    for(var n=1;n<=14;n++){var x=40+(n-1)*83; s+='<path d="M'+x+' 68V80" stroke="#f4fbf8" stroke-opacity=".8" stroke-width="2"/><text x="'+x+'" y="104" text-anchor="middle" direction="ltr" font-family="Cairo" font-weight="700" font-size="21" fill="#a9cdc2">'+n+'</text>'}
    E.forEach(function(e){var x=40+(e[1]-1)*83; s+=cubeBox(x-22,14,44,e[0],hl[e[0]]); s+='<path d="M'+x+' 62V'+(hl[e[0]]?58:60)+'" stroke="'+(hl[e[0]]?GD:CY)+'" stroke-width="3"/>'});
    $('#nl',el).innerHTML=s;
  }
  line();
  var ans=[12,3,4,2];
  $$('.sent',el).forEach(function(s,i){
    var fb=$('.fb',s);
    bindNum($('.nin',s),ans[i],0.01,function(ok){
      if(ok){say(fb,'✓','ok'); s.getAttribute('data-e').split(',').forEach(function(e){hl[e]=true}); line()}
      else say(fb,'✗ فكّر في الأرقام على خط الأعداد','bad');
    });
  });
 },
 note:'<ul><li>عرضك (شريحتا ١٤ و١٥) وكتاب النشاط ص٣٦: الإجابات ١٢، ٣، ٤، ٢.</li><li>الأرقام على خط الأعداد = Ar (H=١، He=٤، Li=٧، C=١٢، N=١٤).</li></ul>'});
