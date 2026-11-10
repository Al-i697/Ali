/* ---------- questions: student book p. 58, activity book pp. 36-37 ---------- */

/* 21 question 3-1: formulas from diagrams */
(function(){
  var T='direction="ltr" font-family="Baloo Bhaijaan 2,Tajawal,sans-serif" font-weight="800" fill="#f4fbf8" text-anchor="middle" dominant-baseline="central"';
  function t(x,y,s,fs){return '<text x="'+x+'" y="'+y+'" '+T+' font-size="'+(fs||20)+'">'+s+'</text>'}
  function ln(x1,y1,x2,y2){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#f4fbf8" stroke-width="2"/>'}
  function ci(x,y,r,s,f){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(f||'rgba(255,255,255,.12)')+'" stroke="#f4fbf8" stroke-width="1.6"/>'+t(x,y,s,r*.7)}
  function lat(rows,fn){var s=''; for(var r=0;r<rows.length;r++)for(var c=0;c<rows[r].length;c++) s+=fn(rows[r][c],c,r); return s}
  var D=[
   {id:'A',svg:t(80,70,'H',24)+ln(98,70,128,70)+t(150,70,'Br',24),ans:'HBr',opts:['HBr','H<sub>2</sub>Br','HBr<sub>2</sub>'],type:'جزيء'},
   {id:'B',svg:t(120,75,'C',24)+ln(120,36,120,62)+ln(120,88,120,114)+ln(82,75,106,75)+ln(134,75,158,75)+t(120,24,'H')+t(120,126,'H')+t(70,75,'H')+t(170,75,'H'),ans:'CH₄',opts:['CH<sub>4</sub>','CH<sub>2</sub>','C<sub>4</sub>H'],type:'جزيء'},
   {id:'C',svg:lat(['AA','OOO','AA','OOO'],function(k,c,r){var x=(k==='A'?(c?160:80):(c*70+50)), y=22+r*34; return k==='A'?ci(x,y,17,'Al³⁺','rgba(20,150,118,.92)'):ci(x,y,17,'O²⁻','rgba(196,112,72,.92)')}),ans:'Al₂O₃',opts:['Al<sub>2</sub>O<sub>3</sub>','Al<sub>4</sub>O<sub>6</sub>','AlO'],type:'أيوني ضخم'},
   {id:'D',svg:t(120,56,'I',24)+ln(104,48,76,36)+ln(136,48,164,36)+ln(120,70,120,104)+t(62,32,'Cl')+t(178,32,'Cl')+t(120,118,'Cl'),ans:'ICl₃',opts:['I<sub>3</sub>Cl','ICl<sub>3</sub>','ICl'],type:'جزيء'},
   {id:'E',svg:t(120,75,'Br',24)+ln(120,40,120,62)+ln(120,88,120,110)+ln(86,60,106,68)+ln(86,92,106,82)+ln(136,75,160,75)+t(120,26,'F')+t(120,124,'F')+t(72,54,'F')+t(72,98,'F')+t(172,75,'F'),ans:'BrF₅',opts:['BrF<sub>4</sub>','Br<sub>5</sub>F','BrF<sub>5</sub>'],type:'جزيء'},
   {id:'F',svg:(function(){
      var s='',P=[],i;
      for(i=-1;i<=5;i++) P.push([40+i*40,(i%2===0)?70:92]);
      function sh(p,q,d){var dx=q[0]-p[0],dy=q[1]-p[1],l=Math.sqrt(dx*dx+dy*dy); return [p[0]+dx/l*d,p[1]+dy/l*d]}
      for(i=0;i<P.length-1;i++){var p=P[i],q=P[i+1], a=(i===0)?p:sh(p,q,13), b=(i===P.length-2)?q:sh(q,p,13); s+=ln(a[0],a[1],b[0],b[1])}
      for(i=1;i<=5;i++){var c=P[i]; s+=t(c[0],c[1],'C',20)+ln(c[0],c[1]-12,c[0],c[1]-26)+t(c[0],c[1]-36,'H',17)+ln(c[0],c[1]+12,c[0],c[1]+26)+t(c[0],c[1]+36,'H',17)}
      return s})(),ans:'CH₂',opts:['C<sub>5</sub>H<sub>10</sub>','CH<sub>2</sub>','C<sub>2</sub>H'],type:'جزيء'},
   {id:'G',svg:lat(['0101','1010','0101'],function(k,c,r){var x=36+c*56, y=26+r*49; return +k?ci(x,y,22,'Na⁺','rgba(120,96,196,.92)'):ci(x,y,22,'I⁻','rgba(206,150,52,.92)')}).replace(/font-size="[\d.]+"/g,function(){return 'font-size="14"'}),ans:'NaI',opts:['NaI<sub>2</sub>','Na<sub>6</sub>I<sub>6</sub>','NaI'],type:'أيوني ضخم'},
   {id:'H',svg:(function(){
      var s='',cx=120,cy=76,R=34,p=[],i; for(i=0;i<6;i++){var a=(-30+60*i)*Math.PI/180; p.push([cx+R*Math.cos(a),cy+R*Math.sin(a),a])}
      for(i=0;i<6;i++){var q=p[(i+1)%6]; s+=ln(p[i][0],p[i][1],q[0],q[1])}
      for(i=0;i<6;i+=2){var x2=cx+(R+34)*Math.cos(p[i][2]), y2=cy+(R+34)*Math.sin(p[i][2]); s+=ln(p[i][0],p[i][1],x2,y2)+t(x2+Math.cos(p[i][2])*6,y2+Math.sin(p[i][2])*6,'O',18)}
      for(i=0;i<6;i++){s+='<circle cx="'+p[i][0]+'" cy="'+p[i][1]+'" r="12" fill="#0a3f33"/>'+t(p[i][0],p[i][1],i%2===0?'B':'O',18)}
      return s})(),ans:'BO₂',opts:['B<sub>3</sub>O<sub>3</sub>','BO<sub>2</sub>','B<sub>3</sub>O<sub>6</sub>'],type:'جزيء'}
  ];
  var ORDER=[[0,1,2],[1,2,0],[2,0,1],[1,0,2],[0,2,1],[2,1,0],[1,2,0],[2,0,1]];
  slide({id:'q31',ch:6,title:'السؤال ٣-١: اكتب صيغة كل مخطط',tag:'اختر الصيغة',
   html:function(){return '<div class="col grow" style="gap:10px"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'+D.map(function(d,i){
      var order=ORDER[i], opts=order.map(function(k){return d.opts[k]});
      return '<div class="qd" data-i="'+i+'"><div class="id">'+d.id+'</div><svg viewBox="0 0 240 150">'+d.svg+'</svg><div class="sel">'+opts.map(function(o,j){return '<button type="button" data-j="'+j+'">'+o+'</button>'}).join('')+'</div></div>'}).join('')+
    '</div><div style="display:flex;gap:14px;align-items:center"><button class="btn acc sm" type="button" id="typ">ما نوع الجسيمات؟</button><div class="fb" style="flex:1;min-height:30px;font-size:21px"></div></div></div>';},
   init:function(el){
    var done=0;
    D.forEach(function(d,i){
      var card=$('.qd[data-i="'+i+'"]',el), order=ORDER[i];
      $$('.sel button',card).forEach(function(b){
        var plain=b.innerHTML.replace(/<\/?sub>/g,''); var ans=d.ans.replace(/[₀-₉]/g,function(c){return '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)});
        b.addEventListener('click',function(){
          if(plain===ans){b.classList.add('ok-b'); $$('.sel button',card).forEach(function(x){x.classList.add('locked')}); card.classList.add('ok'); done++; if(done===8) say($('.fb',el),'✓ ممتاز! حلّيت الثمانية','ok')}
          else{b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340)}
        });
      });
    });
    $('#typ',el).addEventListener('click',function(){
      D.forEach(function(d,i){var c=$('.qd[data-i="'+i+'"]',el); var tag=c.querySelector('.tg'); if(!tag){tag=document.createElement('div'); tag.className='tg pop'; tag.style.cssText='position:absolute;top:8px;inset-inline-end:10px;font-weight:800;font-size:15px;background:'+(d.type==='جزيء'?'var(--surface)':'var(--accent-soft)')+';border-radius:999px;padding:2px 10px'; tag.textContent=d.type; c.style.position='relative'; c.appendChild(tag)}});
      say($('.fb',el),'C و G تراكيب أيونية ضخمة، والباقي جزيئات.','ok'); this.classList.add('hide');
    });
   },
   note:'<ul><li>إجابات الدليل: A = HBr، B = CH₄، C = Al₂O₃، D = ICl₃، E = BrF₅، F = CH₂، G = NaI، H = BO₂.</li><li>(أ) C و G أيوني ضخم. (ب) الباقي جزيئات.</li><li>في C: ٤ Al و٦ O → ٢:٣. في H: ٣ B و٦ O → ١:٢.</li></ul>'});
})();

/* question 3-2 (book p. 58) */
slide({id:'q32',ch:6,title:'كم مرة أثقل من الهيدروجين؟',tag:'تمرين',
 html:function(){
  var rows=[['ذرة الهيليوم He','6.68 × 10<sup>−24</sup> g'],['ذرة الكربون C','1.99 × 10<sup>−23</sup> g'],['ذرة الأكسجين O','2.66 × 10<sup>−23</sup> g'],['ذرة اليورانيوم U','3.97 × 10<sup>−22</sup> g']];
  return '<div class="col grow" style="gap:12px;justify-content:flex-start"><p class="sm muted" style="font-size:21px">متوسط كتلة ذرة H = <span class="num">1.67 × 10<sup>−24</sup></span> g. قرّب إجابتك لأقرب عدد صحيح (السؤال ٣-٢).</p>'+
   rows.map(function(r,i){return '<div class="panel" style="display:flex;align-items:center;gap:18px;padding:12px 22px"><span style="font-size:26px;font-weight:700;width:200px">'+r[0]+'</span><span class="eq" style="font-size:28px;width:250px">'+r[1]+'</span>'+ninHTML('q'+i,'','sm')+'<div class="fb" style="flex:1;min-height:0;font-size:20px"></div></div>'}).join('')+'</div>';
 },
 init:function(el){
  var rows=[[4,0.5,'٦٫٦٨ ÷ ١٫٦٧ ≈ ٤'],[12,0.6,'١١٫٩ ≈ ١٢'],[16,0.6,'١٥٫٩ ≈ ١٦'],[238,1.5,'٢٣٧٫٧ ≈ ٢٣٨']];
  $$('.panel',el).slice(0,4).forEach(function(p,i){
    var fb=$('.fb',p); bindNum($('.nin',p),rows[i][0],rows[i][1],function(ok){ if(ok) say(fb,'✓ '+rows[i][2],'ok'); else say(fb,'قسّم على ١٫٦٧×١٠⁻٢٤','bad') });
  });
 },
 note:'<ul><li>كتاب الطالب ص٥٨ السؤال ٣-٢ (متوسط كتلة ذرّة H = ١٫٦٧×١٠⁻²⁴ g): اقسم كتلة كل ذرّة على كتلة ذرّة الهيدروجين وقرّب لأقرب عدد صحيح.</li><li>الإجابات: He ٤، C ١٢، O ١٦، U ٢٣٨ (وهي الكتل الذرّية النسبية في الجدول ٣-٢).</li></ul>'});

/* 17 race: question 3-3 */
(function(){
  var Q=[['أ','الأكسجين','O<sub>2</sub>',32],['ب','الأمونيا','NH<sub>3</sub>',17],['ج','ثاني أكسيد الكبريت','SO<sub>2</sub>',64],['د','الأوكتان','C<sub>8</sub>H<sub>18</sub>',114],
         ['هـ','حمض الكبريتيك','H<sub>2</sub>SO<sub>4</sub>',98],['و','بروميد البوتاسيوم','KBr',119],['ز','نترات النحاس (II)','Cu(NO<sub>3</sub>)<sub>2</sub>',187.5],['ح','كلوريد الألومنيوم','AlCl<sub>3</sub>',133.5]];
  slide({id:'race',ch:6,title:'سباق الفصل: احسب Mr',tag:'مسابقة',
   html:function(){return '<div class="col grow" style="gap:10px"><div class="chips" style="gap:8px;direction:ltr;justify-content:center">'+['H','C','N','O','S','Al','Cl','K','Br','Cu'].map(function(s){return '<span class="pill" style="min-height:38px;padding:0 12px;font-size:20px;font-family:var(--font-display)">'+s+' = '+AR_T[s]+'</span>'}).join('')+'</div>'+
    '<div class="rgrid">'+Q.map(function(q,i){return '<div class="rc" data-i="'+i+'"><div class="nm">'+q[0]+'. '+q[1]+'</div><div class="f">'+q[2]+'</div><div class="ans"></div>'+ninHTML('r'+i,'','sm')+'</div>'}).join('')+'</div></div>'+
    '<div class="teams"><div class="team"><div style="font-weight:700;font-size:21px">الفريق الأول</div><b class="num" id="tA">0</b><div class="pm"><button type="button" data-t="A" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="A" data-d="1" aria-label="زِد">+</button></div></div>'+
    '<div class="team b"><div style="font-weight:700;font-size:21px">الفريق الثاني</div><b class="num" id="tB">0</b><div class="pm"><button type="button" data-t="B" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="B" data-d="1" aria-label="زِد">+</button></div></div>'+
    '<p class="sm muted" id="left" style="text-align:center">٨ أسئلة متبقية</p></div>';},
   init:function(el){
    var sc={A:0,B:0}, left=8;
    $$('.team .pm button',el).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); sc[t]=Math.max(0,sc[t]+ +b.getAttribute('data-d')); $('#t'+t,el).textContent=sc[t]})});
    $$('.rc',el).forEach(function(c,i){
      bindNum($('.nin',c),Q[i][3],0.01,function(ok){ if(ok){c.classList.add('ok'); $('.ans',c).textContent='= '+Q[i][3]; left--; $('#left',el).textContent=left?ar(left)+' أسئلة متبقية':'انتهت الأسئلة!'} });
    });
   },
   note:'<ul><li>السؤال ٣-٣ (أ–ح). الإجابات: ٣٢، ١٧، ٦٤، ١١٤، ٩٨، ١١٩، ١٨٧٫٥، ١٣٣٫٥.</li><li>قسّم الصف فريقين: كل فريق يرسل طالباً. اضغط + للفريق الفائز بالنقطة.</li><li>تنبيه: Cu(NO₃)₂ → القوس يضاعف N و O.</li></ul>'});
})();

/* ---------- activity book p. 36, exercise 3-1 (a) ---------- */
slide({id:'ex31a',ch:6,title:'تمرين ٣-١ (أ): العلاقات النسبية للذرات',tag:'أكمل الفراغات',
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
 note:'<ul><li>كتاب النشاط ص٣٦، تمرين ٣-١ (أ): الإجابات ١٢، ٣، ٤، ٢ (الجمل عن الكربون-12 وHe وLi وN على خط الأعداد).</li><li>الأرقام على خط الأعداد = Ar (H=١، He=٤، Li=٧، C=١٢، N=١٤).</li></ul>'});

/* 19 activity book exercise 3-1 (b), p.37: count the atoms or ions in each formula, then find Mr */
(function(){
  var R=[
   {name:'الأكسجين',f:'O<sub>2</sub>',cnt:[['2','O']],calc:'16 × 2',mr:32,ex:true},
   {name:'ثاني أكسيد الكربون',f:'CO<sub>2</sub>',cnt:[['1','C'],['2','O']],calc:'12 + (2 × 16)',mr:44},
   {name:'الماء',f:'H<sub>2</sub>O',cnt:[['2','H'],['1','O']],calc:'(2 × 1) + 16',mr:18},
   {name:'الأمونيا',f:'NH<sub>3</sub>',cnt:[['1','N'],['3','H']],calc:'14 + (3 × 1)',mr:17},
   {name:'كربونات الكالسيوم',f:'CaCO<sub>3</sub>',cnt:[['1','Ca²⁺'],['1','CO₃²⁻']],calc:'40 + 12 + (3 × 16)',mr:100},
   {name:'أكسيد الماغنيسيوم',f:'MgO',cnt:[['1','Mg²⁺'],['1','O²⁻']],calc:'24 + 16',mr:40},
   {name:'نترات الأمونيوم',f:'NH<sub>4</sub>NO<sub>3</sub>',cnt:[['1','NH₄⁺'],['1','NO₃⁻']],calc:'(2 × 14) + (4 × 1) + (3 × 16)',mr:80,hint:'NH₄⁺ فيه N و٤ H، و NO₃⁻ فيه N و٣ O'},
   {name:'البروبانول',f:'C<sub>3</sub>H<sub>7</sub>OH',cnt:[['3','C'],['8','H'],['1','O']],calc:'(3 × 12) + (8 × 1) + 16',mr:60,hint:'عدّ ذرات H: ٧ + ١ من OH'}
  ];
  function cntHTML(c){return c.map(function(x){return '<span class="xc"><b>'+x[0]+'</b> '+x[1]+'</span>'}).join('')}
  slide({id:'ex31b',ch:6,title:'تمرين ٣-١ (ب): أكمل الجدول',tag:'عدّ ثم احسب',
   html:function(){
    return '<style>.slide[data-id=ex31b] .xg{display:grid;grid-template-columns:318px 1fr 1fr 150px;gap:4px 10px;align-items:center;align-content:start;direction:rtl}'+
     '.slide[data-id=ex31b] .xh{font-size:16px;font-weight:800;color:var(--accent);padding:0 8px;line-height:1.1}'+
     '.slide[data-id=ex31b] .xr{display:contents}'+
     '.slide[data-id=ex31b] .xr>div{background:var(--paper);min-height:40px;padding:0 12px;display:flex;align-items:center;gap:8px}'+
     '.slide[data-id=ex31b] .xr>div:first-child{border-radius:0 14px 14px 0;justify-content:space-between}'+
     '.slide[data-id=ex31b] .xr>div:last-child{border-radius:14px 0 0 14px;justify-content:center}'+
     '.slide[data-id=ex31b] .xn{font-size:19px;white-space:nowrap}.slide[data-id=ex31b] .xf{font-family:var(--font-display);font-weight:800;font-size:25px;direction:ltr}'+
     '.slide[data-id=ex31b] .xc{display:inline-block;direction:ltr;background:rgba(10,24,52,.92);color:#fff;border-radius:8px;padding:1px 9px;font-size:20px;margin-inline-end:6px}.slide[data-id=ex31b] .xc b{color:var(--gold)}'+
     '.slide[data-id=ex31b] .xv{font-size:19px;direction:ltr}'+
     '.slide[data-id=ex31b] .rv{border:0;border-radius:10px;padding:4px 12px;font:700 17px var(--font-body);background:var(--field);color:var(--field-ink);cursor:pointer}'+
     '.slide[data-id=ex31b] .xr.done>div{box-shadow:inset 0 0 0 2px rgba(120,220,150,.45)}'+
     '.slide[data-id=ex31b] .ars{display:flex;gap:8px;justify-content:center;direction:ltr;margin-bottom:2px}.slide[data-id=ex31b] .ars span{background:var(--field);color:var(--field-ink);border-radius:10px;padding:0 12px;font-size:18px}.slide[data-id=ex31b] .ars b{font-family:var(--font-display);margin-inline-start:6px}</style>'+
     '<div class="col grow" style="gap:4px;justify-content:flex-start"><div class="ars">'+['H','C','N','O','Mg','Ca'].map(function(s){return '<span>'+s+'<b>'+AR_T[s]+'</b></span>'}).join('')+'</div>'+
     '<div class="xg"><div class="xh">المادة والصيغة</div><div class="xh">عدد الذرات أو الأيونات في الصيغة</div><div class="xh">الحساب</div><div class="xh" style="text-align:center">M<sub>r</sub></div>'+
     R.map(function(r,i){
       return '<div class="xr'+(r.ex?' done':'')+'" data-i="'+i+'"><div><span class="xn">'+r.name+'</span><span class="xf">'+r.f+'</span></div>'+
        '<div class="xcnt">'+(r.ex?cntHTML(r.cnt):'<button class="rv" type="button">اعدّ أولاً ثم اضغط للتحقق</button>')+'</div>'+
        '<div class="xv num xcalc">'+(r.ex?r.calc+' = '+r.mr:'')+'</div>'+
        '<div>'+(r.ex?'<b class="xf" style="color:var(--ok)">'+r.mr+'</b>':ninHTML('x'+i,'','sm'))+'</div></div>';
     }).join('')+'</div><div class="fb" style="min-height:24px;font-size:19px;text-align:center"></div></div>';
   },
   init:function(el){
    var fb=$('.fb',el), left=R.filter(function(r){return !r.ex}).length;
    $$('.xr',el).forEach(function(row,i){
      var r=R[i]; if(r.ex) return;
      var rv=$('.rv',row), cc=$('.xcnt',row);
      rv.addEventListener('click',function(){ cc.innerHTML=cntHTML(r.cnt) });
      bindNum($('.nin',row),r.mr,0.01,function(ok){
        if(ok){ cc.innerHTML=cntHTML(r.cnt); $('.xcalc',row).textContent=r.calc+' = '+r.mr; row.classList.add('done'); left--; say(fb,left?'✓ '+r.f.replace(/<[^>]+>/g,'')+' : '+r.mr+' — باقي '+ar(left):'✓ أحسنت! أكملت الجدول كله','ok') }
        else say(fb,r.hint?'عدّ الذرات بدقة: '+r.hint:'اعدّ الذرات ثم اضرب في Ar واجمع','bad');
      });
    });
   },
   note:'<ul><li>كتاب النشاط ص٣٧، تمرين ٣-١ (ب): «أكمل الفراغات في الجدول لمجموعة من المواد المختلفة» (Mg = 24، Ca = 40، N = 14، C = 12، H = 1، O = 16). الصف الأول (O₂ = ٣٢) مثال محلول في الكتاب.</li><li>الإجابات: CO₂ = ٤٤، H₂O = ١٨، NH₃ = ١٧، CaCO₃ = ١٠٠، MgO = ٤٠، NH₄NO₃ = ٨٠، C₃H₇OH = ٦٠.</li><li>CO₂ وH₂O وCaCO₃ سبق حسابها في الشرائح السابقة (عرضك ١١–١٢)؛ الجديد هنا NH₃ وMgO وNH₄NO₃ وC₃H₇OH. لاحظ الفرق بين عدّ «الأيونات» (CaCO₃: Ca²⁺ و CO₃²⁻) وعدّ «الذرات» عند حساب Mr.</li><li>زر «اعدّ أولاً» يكشف العدد بعد أن يحاول الطلاب. أخطاء متوقعة: NH₄NO₃ (٢ N لا ١)، وC₃H₇OH (٨ H لا ٧).</li></ul>'});
})();
