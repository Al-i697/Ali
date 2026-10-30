/* ---------- mole lesson, part B: tickets, worked example, questions 3-5 to 3-7, practice ---------- */

/* 13 exit ticket 1: the idea */
(function(){
  var items=[
   {q:'المول الواحد من أي مادة يحتوي على:',opts:[{t:'6.02×10²³ جسيماً (ذرة أو جزيئاً أو وحدة صيغة)',ok:true,why:'صح: عدد أفوجادرو'},{t:'6.02×10²³ غراماً'},{t:'عدد يختلف باختلاف المادة'}]},
   {type:'num',q:'احسب كتلة مول واحد من CaCO<sub>3</sub> بالجرام (Ca = 40, C = 12, O = 16)',ans:100,tol:0.01,why:'40 + 12 + (3 × 16) = 100',hint:'اجمع: 40 + 12 + 3 × 16'},
   {q:'أي مادة كتلة مول واحد منها هي الأكبر؟ (H = 1, C = 12, O = 16)',opts:[{t:'H<sub>2</sub>O'},{t:'O<sub>2</sub>'},{t:'CO<sub>2</sub>',ok:true,why:'44 g أكبر من 32 g و18 g'}]},
   {q:'عدد جزيئات H<sub>2</sub> في 1 mol مقارنة بعدد جزيئات O<sub>2</sub> في 1 mol:',opts:[{t:'أقل لأن H<sub>2</sub> أخف'},{t:'متساوٍ',ok:true,why:'المول عدد ثابت من الجسيمات مهما اختلفت الكتلة'},{t:'أكثر لأن H<sub>2</sub> أصغر'}]}
  ];
  slide({id:'tk1',ch:3,title:'تذكرة خروج ١: فكرة المول',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk1')},
   note:'<ul><li>الإجابات: ٦٫٠٢×١٠²³ جسيماً، ١٠٠، CO₂، متساوٍ.</li><li>السؤال الأخير يعالج الخطأ الشائع: الكتلة تختلف والعدد يتساوى.</li></ul>'});
})();

/* 14 reference Ar values and a warm-up on molar mass */
slide({id:'ar',ch:4,title:'الكتل الذرية النسبية وكتلة الصيغة',tag:'أسخن بالحساب',
 html:function(){
  var W=[['HCl','كلوريد الهيدروجين'],['H2SO4','حمض الكبريتيك'],['C6H12O6','الجلوكوز']];
  return `<div class="col grow" style="gap:12px;justify-content:flex-start">
   <div class="frm brk" style="padding:8px 18px;gap:6px"><div class="sm" style="font-size:20px;text-align:center">مستخدماً الكتل الذرية النسبية الآتية، أجب عن الأسئلة ٣-٥ و٣-٦:</div>${arStrip(['P','O','C','H','S','N','Al','Cl','Na','Cu'])}</div>
   <p class="lead" style="margin:0;font-size:25px"><b>قبل ما نبدأ: كتلة مول واحد (الكتلة المولية) لكل مادة =</b></p>
   ${W.map(function(w,i){return `<div class="qr tight"><div class="qt">${w[1]} ${fh(w[0])}</div><div class="qa"><span class="ql">M =</span>${nin('w'+i,'g/mol')}</div><div class="fb"></div></div>`}).join('')}</div>`;},
 init:function(el){
  var F=['HCl','H2SO4','C6H12O6'], rows=F.map(function(f){return {a:[MR(f)],w:['✓ '+MR(f)+' g/mol'],h:['اجمع الكتل الذرية لكل ذرات الصيغة']}});
  bindRows(el,rows);
 },
 note:'<ul><li>عرضك (شريحة ١٢): قيم Ar للأسئلة. حذفت بطاقة «S = 27» لأنها خطأ (الكبريت 32 والألومنيوم 27).</li><li>الإجابات: ٣٦٫٥، ٩٨، ١٨٠. هي تحضير للسؤال ٣-٦.</li></ul>'});

/* 15 worked example 3-1 */
slide({id:'ex31',ch:4,title:'مثال ٣-١',tag:'خطوة بخطوة',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="frm brk" style="flex:1;padding:14px 18px;gap:12px"><p class="lead" style="margin:0;font-size:27px"><b>١. كم عدد المولات في <span class="num">60 g</span> من هيدروكسيد الصوديوم <span class="num">NaOH</span>؟</b></p>
   <div class="qr"><div class="qt" style="font-size:23px;white-space:normal">الخطوة ١: M(NaOH) = 23 + 16 + 1</div><div class="qa">${nin('a1','g/mol')}</div>
    <div class="qt" style="font-size:23px;white-space:normal">الخطوة ٢: n = m ÷ M = 60 ÷ M</div><div class="qa">${nin('a2','mol')}</div><div class="fb"></div></div></div>
  <div class="frm brk" style="flex:1;padding:14px 18px;gap:12px"><p class="lead" style="margin:0;font-size:27px"><b>٢. ما كتلة <span class="num">0.5 mol</span> من كبريتات النحاس (II) المائية <span class="num">CuSO<sub>4</sub>·5H<sub>2</sub>O</span>؟</b></p>
   <div class="qr"><div class="qt" style="font-size:23px;white-space:normal">الخطوة ١: M = 63.5 + 32 + (4 × 16) + 5 × (18)</div><div class="qa">${nin('b1','g/mol')}</div>
    <div class="qt" style="font-size:23px;white-space:normal">الخطوة ٢: m = n × M = 0.5 × M</div><div class="qa">${nin('b2','g')}</div><div class="fb"></div></div></div></div>`;},
 init:function(el){
  var cols=$$('.frm',el);
  bindRows(cols[0],[{a:[40,1.5],w:['✓ M = 40 g/mol','✓ n = 60 ÷ 40 = 1.5 mol'],h:['23 + 16 + 1','اقسم 60 على كتلة المول']}]);
  bindRows(cols[1],[{a:[249.5,124.75],w:['✓ M = 249.5 g/mol','✓ m = 0.5 × 249.5 = 124.75 g'],h:['اجمع كل ما في الصيغة بما فيها الماء','اضرب 0.5 في كتلة المول']}]);
 },
 note:'<ul><li>مثال ٣-١ في كتاب الطالب (ص٦٠). الإجابات: 40 ثم 1.5 mol؛ 249.5 ثم 124.75 g.</li><li>كل خطوة تفتح التي بعدها.</li></ul>'});

/* 16 question 3-5: mass from moles */
slide({id:'q35',ch:4,title:'السؤال ٣-٥: احسب الكتلة بالجرامات',tag:'أجب',
 html:function(){
  var Q=[['أ','2 mol من Na','Na'],['ب','0.5 mol من CuCO3','CuCO3'],['ج','4 mol من Al(NO3)3','Al(NO3)3'],['د','0.02 mol من CuSO4.5H2O','CuSO4.5H2O']];
  return `<div class="col grow" style="gap:9px;justify-content:flex-start">${arStrip(['Na','Cu','C','O','Al','N','S','H'])}
   ${Q.map(function(q,i){var t=q[1].split(' من ');return `<div class="qr"><div class="qt">${q[0]}. <span class="num">${t[0]}</span> من ${fh(t[1])}</div><div class="qa"><span class="ql">M =</span>${nin('m'+i,'g/mol')}<span class="ql">m =</span>${nin('g'+i,'g')}</div><div class="fb"></div></div>`}).join('')}</div>`;},
 init:function(el){
  var D=[['Na',2],['CuCO3',.5],['Al(NO3)3',4],['CuSO4.5H2O',.02]];
  bindRows(el,D.map(function(d){var M=MR(d[0]), m=Math.round(M*d[1]*1e4)/1e4; return {a:[M,m],t:[0.01,tolOf(m)*2],w:['✓ M = '+M+' g/mol','✓ m = '+d[1]+' × '+M+' = '+m+' g'],h:['اجمع Ar لكل ذرات الصيغة','m = n × M']}}));
 },
 note:'<ul><li>عرضك (شريحة ١٣). الإجابات: ٤٦ g، ٦١٫٧٥ g، ٨٥٢ g، ٤٫٩٩ g.</li><li>الخطوة الأولى كتلة المول (Mr) ثم نضرب في عدد المولات.</li></ul>'});

/* 17 question 3-6: moles from mass */
slide({id:'q36',ch:4,title:'السؤال ٣-٦: احسب عدد المولات',tag:'أجب',
 html:function(){
  var Q=[['أ','7.75 g من','P'],['ب','292 g من','HCl'],['ج','2.94 g من','H2SO4'],['د','0.126 g من','C6H12O6']];
  return `<div class="col grow" style="gap:10px;justify-content:flex-start">
   <div class="panel" style="padding:8px 18px;align-items:center"><div class="bigeq" style="font-size:34px;color:var(--gold)">n = m ÷ M</div></div>
   ${Q.map(function(q,i){return `<div class="qr"><div class="qt">${q[0]}. <span class="num">${q[1].split(' ')[0]} g</span> من ${fh(q[2])}</div><div class="qa"><span class="ql">n =</span>${nin('n'+i,'mol')}</div><div class="fb"></div></div>`}).join('')}
   <p class="sm muted" style="text-align:center;margin:0;font-size:20px">يمكنك كتابة الجواب بالصيغة العلمية، مثلاً 7e-4</p></div>`;},
 init:function(el){
  var D=[['P',7.75],['HCl',292],['H2SO4',2.94],['C6H12O6',0.126]];
  bindRows(el,D.map(function(d){var n=d[1]/MR(d[0]); return {a:[n],w:['✓ n = '+d[1]+' ÷ '+MR(d[0])+' = '+(+n.toPrecision(3))+' mol'],h:['n = m ÷ M ، وكتلة المول M = '+MR(d[0])+' g/mol']}}));
 },
 note:'<ul><li>عرضك (شريحة ١٤). الإجابات: ٠٫٢٥ mol، ٨ mol، ٠٫٠٣ mol، ٠٫٠٠٠٧ mol (7×10⁻⁴).</li><li>كتل الصيغ: P=31، HCl=36.5، H₂SO₄=98، C₆H₁₂O₆=180.</li></ul>'});

/* 18 question 3-7: number of particles */
slide({id:'q37',ch:4,title:'السؤال ٣-٧: احسب عدد الجسيمات',tag:'أجب',
 html:function(){
  var N=[['أ','0.25 mol',0.25],['ب','8 mol',8],['ج','0.03 mol',0.03],['د','0.0007 mol',0.0007]];
  return `<div class="col grow" style="gap:10px;justify-content:flex-start">
   <div class="panel" style="padding:10px 18px;align-items:center;gap:2px"><p class="lead" style="margin:0;font-size:27px">يحتوي المول الواحد من أي مادة على <b class="num" style="color:var(--gold)">6.02×10<sup>23</sup></b> من الجسيمات</p><div class="bigeq" style="font-size:32px">N = n × 6.02×10<sup style="font-size:.6em">23</sup></div></div>
   <p class="lead" style="margin:0;font-size:25px"><b>احسب عدد الجسيمات في كل من إجاباتك عن السؤال ٣-٦:</b></p>
   ${N.map(function(q,i){return `<div class="qr"><div class="qt">${q[0]}. <span class="num">${q[1]}</span></div><div class="qa"><span class="ql">N =</span>${nin('c'+i,'')}<span class="ql num">× 10</span>${nin('e'+i,'')}<span class="ql">جسيم</span></div><div class="fb"></div></div>`}).join('')}</div>`;},
 init:function(el){
  var D=[0.25,8,0.03,0.0007];
  bindRows(el,D.map(function(n){var f=fx3(n*NA); return {a:[f[0],f[1]],t:[tolOf(f[0])*1.5,0.01],w:['✓ المعامل '+f[0],'✓ N = '+f[0]+' × 10^'+f[1]],h:['اضرب n في 6.02 أولاً (والأس يتبع الصيغة العلمية)','كم أُسّ العشرة بعد أن يصير المعامل بين 1 و10؟']}}));
 },
 note:'<ul><li>عرضك (شريحة ١٥). الإجابات: 1.505×10²³، 4.816×10²⁴، 1.806×10²²، 4.214×10²⁰.</li><li>الطالب يكتب المعامل ثم أسّ العشرة (الصيغة العلمية).</li></ul>'});

/* 19 the conversion chain */
slide({id:'chain',ch:4,title:'من الكتلة إلى المولات إلى الجسيمات',tag:'رتّب السلسلة',
 html:function(){return `<div class="col grow" style="gap:14px;justify-content:flex-start">
  <div style="display:flex;align-items:center;gap:10px">
   <div class="mslot slot" data-k="0" style="flex:1;min-height:78px;justify-content:center"><span class="ph" style="font-size:21px">١</span></div>
   <div style="text-align:center;width:170px;flex:none"><div class="arw">⟵</div><div class="bigeq" style="font-size:24px;color:var(--gold)">÷ M</div></div>
   <div class="mslot slot" data-k="1" style="flex:1;min-height:78px;justify-content:center"><span class="ph" style="font-size:21px">٢</span></div>
   <div style="text-align:center;width:170px;flex:none"><div class="arw">⟵</div><div class="bigeq" style="font-size:22px;color:var(--gold)">× 6.02×10<sup style="font-size:.6em">23</sup></div></div>
   <div class="mslot slot" data-k="2" style="flex:1;min-height:78px;justify-content:center"><span class="ph" style="font-size:21px">٣</span></div></div>
  <div class="imp-tray" id="tray" style="display:flex;gap:14px;justify-content:center"></div>
  <div class="fb" style="text-align:center;min-height:28px" id="cfb"></div>
  <div class="frm brk gold hide" id="ex" style="padding:14px 22px;gap:10px;display:none"><p class="lead" style="margin:0;font-size:27px"><b>مثال: <span class="num">9 g</span> من الماء <span class="num">H<sub>2</sub>O</span> (H = 1، O = 16)</b></p>
   <div class="qr"><div class="qt" style="font-size:23px">عدد المولات n =</div><div class="qa">${nin('x1','mol')}<span class="ql">عدد الجزيئات N =</span>${nin('x2','')}<span class="ql num">× 10<sup>23</sup></span></div><div class="fb"></div></div></div></div>`;},
 init:function(el){
  var items=[[1,'عدد المولات (mol)'],[2,'عدد الجسيمات'],[0,'الكتلة (g)']], tray=$('#tray',el), fb=$('#cfb',el), left=3, sel=null;
  function place(chip,slot){
    if(+chip.getAttribute('data-k')===+slot.getAttribute('data-k')&&!slot.querySelector('.mchip')){
      var ph=$('.ph',slot); if(ph) ph.remove(); slot.appendChild(chip); chip.classList.add('ok-b','locked'); chip.style.cursor='default'; left--;
      say(fb,left?'صح! كمّل':'ممتاز! الآن جرّب مثالاً','ok');
      if(!left){tray.classList.add('hide'); var e=$('#ex',el); e.style.display='flex'; e.classList.remove('hide'); e.classList.add('up')} return true;
    }
    slot.classList.add('shake'); later(function(){slot.classList.remove('shake')},340); say(fb,'تذكّر: نقسم الكتلة على M فنصل إلى المولات','bad'); return false;
  }
  items.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'; c.setAttribute('data-k',it[0]); c.style.fontSize='24px'; c.textContent=it[1]; tray.appendChild(c);
    drag(c,{zone:'.mslot',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.mslot',el).forEach(function(s){s.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,s); sel.style.outline=''; sel=null } })});
  bindRows($('#ex',el),[{a:[0.5,3.01],w:['✓ n = 9 ÷ 18 = 0.5 mol','✓ N = 0.5 × 6.02×10²³ = 3.01×10²³ جزيئاً'],h:['M(H₂O) = 18 g/mol ، n = m ÷ M','اضرب n في 6.02 ثم اكتب المعامل']}]);
 },
 note:'<ul><li>الكتلة ← (÷ M) ← المولات ← (× 6.02×10²³) ← الجسيمات. والعكس بالعملية العكسية.</li><li>المثال: ٩ g ماء = ٠٫٥ mol = 3.01×10²³ جزيء.</li></ul>'});

/* 20 link back to activity 3-1: moles of Mg and O */
slide({id:'act31',ch:4,title:'نتائج نشاط ٣-١ بالمولات',tag:'ربط بالدرس السابق',
 html:function(){return `<div style="display:flex;gap:18px;flex:1;align-items:stretch">
  <div class="col" style="flex:1;gap:12px;justify-content:center">
   <div class="panel" style="padding:14px 20px;gap:6px"><p class="lead" style="margin:0;font-size:27px">عند حرق <b class="num">0.24 g</b> من الماغنيسيوم تكوّن <b class="num">0.40 g</b> من أكسيد الماغنيسيوم، أي اندمج معه <b class="num">0.16 g</b> من الأكسجين.</p></div>
   <div class="qr"><div class="qt">عدد مولات Mg (Ar = 24)</div><div class="qa">${nin('a','mol')}</div><div class="fb"></div></div>
   <div class="qr"><div class="qt">عدد مولات O (Ar = 16)</div><div class="qa">${nin('b','mol')}</div><div class="fb"></div></div></div>
  <div class="col" style="width:430px;flex:none;gap:12px;justify-content:center">
   <div class="panel" style="padding:14px 20px;gap:6px"><p class="lead" style="margin:0;font-size:26px"><b>نسبة مولات Mg : O =</b></p>${optsHTML([{t:'1 : 1'},{t:'2 : 1'},{t:'1 : 2'}])}<div class="fb" style="min-height:26px"></div></div>
   <div class="gbar hide" id="gb" style="font-size:25px">الصيغة <b class="num">MgO</b>: نسبة الذرات 1 : 1</div></div></div>`;},
 init:function(el){
  bindRows(el,[{a:[0.01],w:['✓ 0.24 ÷ 24 = 0.01 mol'],h:['n = m ÷ Ar']},{a:[0.01],w:['✓ 0.16 ÷ 16 = 0.01 mol'],h:['n = m ÷ Ar']}]);
  bindMcq($('.panel:last-child',el),[{t:'',ok:true,why:'0.01 : 0.01 = 1 : 1'},{t:'',why:'قارن 0.01 مع 0.01'},{t:'',why:'قارن 0.01 مع 0.01'}],$('.panel:last-child .fb',el),function(){var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up')});
 },
 note:'<ul><li>من دليل المعلم: أعد النظر في نتائج النشاط ٣-١ لحساب مولات Mg وO. (٠٫٢٤ g Mg + ٠٫١٦ g O → ٠٫٤٠ g MgO من كتاب الطالب، شكل ٣-٣).</li></ul>'});

/* 21 and 22: Exercise 3-3 (a) from the activity book */
(function(){
  var R={a:[['Cu','m',127],['Mg','n',0.5],['Cl2','m',35.5],['H2','m',4],['S8','n',2],['O3','m',1.6]],b:[['H2SO4','n',2.5],['CO2','n',0.4],['NH3','m',25.5],['CaCO3','m',100],['MgSO4.7H2O','m',82]]};
  function table(list){
    return `<div class="col grow" style="gap:6px;justify-content:flex-start">${arStrip(['H','C','N','O','Mg','S','Cl','Ca','Cu'])}
     <table class="mtab" style="margin-top:2px"><colgroup><col style="width:19%"><col style="width:27%"><col style="width:27%"><col style="width:27%"></colgroup>
      <thead><tr><th>المادة</th><th>A<sub>r</sub> أو M<sub>r</sub></th><th>عدد المولات (mol)</th><th>الكتلة (g)</th></tr></thead>
      <tbody>${list.map(function(r,i){var given=r[2]; return `<tr class="qr"><td>${fh(r[0])}</td><td><div style="display:flex;justify-content:center">${nin('r'+i,'')}</div></td><td>${r[1]==='n'?'<span class="num">'+given+'</span>':'<div style="display:flex;justify-content:center">'+nin('n'+i,'')+'</div>'}</td><td>${r[1]==='m'?'<span class="num">'+given+'</span>':'<div style="display:flex;justify-content:center">'+nin('m'+i,'')+'</div>'}</td></tr>`}).join('')}</tbody></table>
     <div class="fb fbg" style="text-align:center;min-height:26px"></div></div>`;
  }
  function bind(el,list){
    bindRows(el,list.map(function(r){var M=MR(r[0]), v=r[1]==='m'?r[2]/M:r[2]*M; return {a:[M,v],t:[0.01,Math.abs(v)*0.015],w:['✓ M = '+M,'✓ '+(r[1]==='m'?'n = '+r[2]+' ÷ '+M+' = ':'m = '+r[2]+' × '+M+' = ')+(+v.toPrecision(3))],h:['اجمع الكتل الذرية لكل ذرات الصيغة (أو Ar للعنصر)',r[1]==='m'?'n = m ÷ M':'m = n × M']}}));
  }
  slide({id:'tbl33a',ch:5,title:'تمرين ٣-٣ (أ): أكمل الجدول (١)',tag:'أكمل',
   html:function(){return table(R.a)},init:function(el){bind(el,R.a)},
   note:'<ul><li>من كتاب النشاط (تمرين ٣-٣ الازدياد النسبي، الجزئية أ). الإجابات: Cu 63.5 → 2 mol؛ Mg 24 → 12 g؛ Cl₂ 71 → 0.5 mol؛ H₂ 2 → 2 mol؛ S₈ 256 → 512 g؛ O₃ 48 → 0.033 mol.</li></ul>'});
  slide({id:'tbl33b',ch:5,title:'تمرين ٣-٣ (أ): أكمل الجدول (٢)',tag:'أكمل',
   html:function(){return table(R.b)},init:function(el){bind(el,R.b)},
   note:'<ul><li>الإجابات: H₂SO₄ 98 → 245 g؛ CO₂ 44 → 17.6 g؛ NH₃ 17 → 1.5 mol؛ CaCO₃ 100 → 1 mol؛ MgSO₄·7H₂O 246 → 0.333 mol.</li></ul>'});
})();

/* 23 class race */
slide({id:'race',ch:5,title:'سباق الفصل: حسابات المول',tag:'مسابقة',
 html:function(){
  var Q=[['أ','كتلة 2 mol من NaCl','g'],['ب','عدد مولات 36 g من H2O','mol'],['ج','كتلة 0.25 mol من H2SO4','g'],['د','عدد مولات 11 g من CO2','mol'],['هـ','كتلة 3 mol من CH4','g'],['و','عدد مولات 80 g من NaOH','mol'],['ز','كتلة 0.1 mol من CaCO3','g'],['ح','عدد جزيئات 0.5 mol من O2 (× 10²³)','']];
  return `<div class="col grow" style="gap:10px"><div class="chips" style="gap:8px;direction:ltr;justify-content:center">${['H','C','O','Na','S','Cl','Ca'].map(function(s){return '<span class="pill" style="min-height:36px;padding:0 12px;font-size:20px;font-family:var(--font-display)">'+s+' = '+AR[s]+'</span>'}).join('')}</div>
   <div class="rgrid">${Q.map(function(q,i){var p=q[1].split(' من '); return `<div class="rc" data-i="${i}"><div class="nm">${q[0]}. ${p[0]}${p[1]?' من '+fh(p[1].split(' (')[0])+(p[1].indexOf(' (')>0?' ('+p[1].split(' (')[1]:''):''}</div><div class="ans"></div>${ninHTML('r'+i,q[2],'sm')}</div>`}).join('')}</div></div>
   <div class="teams"><div class="team"><div style="font-weight:700;font-size:21px">الفريق الأول</div><b class="num" id="tA">0</b><div class="pm"><button type="button" data-t="A" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="A" data-d="1" aria-label="زِد">+</button></div></div>
   <div class="team b"><div style="font-weight:700;font-size:21px">الفريق الثاني</div><b class="num" id="tB">0</b><div class="pm"><button type="button" data-t="B" data-d="-1" aria-label="أنقص">−</button><button type="button" data-t="B" data-d="1" aria-label="زِد">+</button></div></div>
   <p class="sm muted" id="left" style="text-align:center">٨ أسئلة متبقية</p></div>`;},
 init:function(el){
  var A=[MR('NaCl')*2,36/MR('H2O'),MR('H2SO4')*0.25,11/MR('CO2'),MR('CH4')*3,80/MR('NaOH'),MR('CaCO3')*0.1,3.01], sc={A:0,B:0}, left=8;
  $$('.team .pm button',el).forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t'); sc[t]=Math.max(0,sc[t]+ +b.getAttribute('data-d')); $('#t'+t,el).textContent=sc[t]})});
  $$('.rc',el).forEach(function(c,i){
    bindNum($('.nin',c),A[i],tolOf(A[i])*1.5,function(ok){ if(ok){c.classList.add('ok'); $('.ans',c).textContent='= '+(+A[i].toPrecision(4)); left--; $('#left',el).textContent=left?ar(left)+' أسئلة متبقية':'انتهت الأسئلة!'} });
  });
 },
 note:'<ul><li>الإجابات: ١١٧ g، ٢ mol، ٢٤٫٥ g، ٠٫٢٥ mol، ٤٨ g، ٢ mol، ١٠ g، ٣٫٠١ (×١٠²³).</li><li>قسّم الصف فريقين، وكل فريق يرسل طالباً. اضغط + للفريق الفائز بالنقطة.</li></ul>'});

/* 24 exit ticket 2 */
(function(){
  var items=[
   {type:'num',q:'احسب كتلة 0.5 mol من هيدروكسيد الصوديوم NaOH (Na = 23, O = 16, H = 1)',unit:'g',ans:20,tol:0.01,why:'0.5 × 40 = 20 g',hint:'M = 40 ثم m = n × M'},
   {type:'num',q:'احسب عدد مولات 49 g من حمض الكبريتيك H<sub>2</sub>SO<sub>4</sub> (H = 1, S = 32, O = 16)',unit:'mol',ans:0.5,tol:0.005,why:'49 ÷ 98 = 0.5 mol',hint:'M = 98 ثم n = m ÷ M'},
   {q:'عدد الجسيمات في 2 mol من أي مادة:',opts:[{t:'6.02×10²³'},{t:'1.204×10²⁴',ok:true,why:'2 × 6.02×10²³ = 1.204×10²⁴'},{t:'3.01×10²³'}]},
   {q:'أي العبارات صحيحة؟',opts:[{t:'1 mol من الماء كتلته 18 g ويحتوي على 6.02×10²³ جزيء',ok:true,why:'صح: M(H₂O) = 18 g/mol'},{t:'1 mol من الماء كتلته 6.02×10²³ g'},{t:'1 mol من الماء يحتوي على 18 جزيئاً'}]}
  ];
  slide({id:'tk2',ch:5,title:'تذكرة خروج ٢: حسابات المول',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk2')},
   note:'<ul><li>الإجابات: ٢٠ g، ٠٫٥ mol، 1.204×10²⁴، العبارة الأولى.</li></ul>'});
})();
