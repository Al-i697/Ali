/* ---------- 3-1 from the book (student book pp. 52-58, teacher's guide p. 54, activity book pp. 36-37): goals, why quantities matter, the size of an atom ---------- */

/* 1 goals (teacher's guide p. 54) */
slide({id:'goals',ch:0,bare:true,title:'أهداف الدرس',
 html:function(){
  var L=['يستنتج صيغة مركّب بسيط من نموذج أو تمثيل تخطيطي.',
   'يعرّف الكتلة الذرّية النسبية (Ar) بأنها متوسط كتل ذرّات العنصر التي توجد في الطبيعة وفقاً لمقياس تكون فيه كتلة ذرّة الكربون-12 مساوية تماماً لـ 12 وحدة كتلة.',
   'يعرّف الكتلة الجزيئية النسبية (Mr) بأنها مجموع الكتل الذرّية النسبية، وتُستخدم كتلة الصيغة النسبية أو الكتلة الجزيئية النسبية Mr في المركّبات الأيونية.'];
  return '<div style="display:flex;gap:20px;flex:1;align-items:stretch"><div class="frm brk" style="flex:1;padding:22px 28px 20px;justify-content:center;gap:10px">'+
   '<h1 style="margin:0;font-family:var(--font-display);font-size:54px;font-weight:800;color:var(--gold);line-height:1.1;text-shadow:0 0 26px rgba(228,188,75,.35)">(٣-١) الكتل النسبية</h1>'+
   '<p style="font-size:26px;font-weight:700;line-height:1.4">بنهاية الدرس تكون قادراً على أن:</p>'+
   '<div class="gl" style="margin-top:4px">'+L.map(function(t){return '<button type="button" class="gi"><span class="ck">✓</span><span>'+t+'</span></button>'}).join('')+'</div></div>'+
   '<div style="width:300px;flex:none;display:flex;align-items:center;justify-content:center"><img class="pic fade" src="'+IMG.goals_navy+'" alt="" style="width:340px;max-width:none"></div></div>';},
 init:function(el){ $$('.gi',el).forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('done')})}) },
 note:'<ul><li>الأهداف الثلاثة من دليل المعلم ص٥٤ (الموضوع ٣-١): ١-٨ و٢-٨ و٣-٨، بنصّها. اضغط على هدف لتظليل علامته أثناء مراجعته في نهاية الدرس.</li><li>ترتيب الدرس يتبع كتاب الطالب ص٥٢–٥٨: أهمية الكميات، حجم الذرة، Ar، Mr، النشاط ٣-١، الصيغة من نموذج أو مخطط، ثم الأسئلة ٣-١ إلى ٣-٤.</li></ul>'});

/* 2 importance of quantities (match by dragging) */
slide({id:'imp',ch:1,title:'أهمية تحديد كميات المواد في حياتنا',tag:'مطابقة بالسحب',
 html:function(){
  var C=[['agri','الزراعة','<img class="pic tile" src="'+IMG.agri+'" alt="" style="height:140px">'],['env','البيئة','<img class="pic tile" src="'+IMG.env+'" alt="" style="height:140px">'],['med','الغذاء والدواء','<img class="pic tile" src="'+IMG.med+'" alt="" style="height:140px">']];
  return '<div class="col grow" style="gap:14px;justify-content:flex-start"><div style="display:flex;gap:16px">'+
   C.map(function(c){return '<div class="frm brk icard">'+c[2]+'<h3>'+c[1]+'</h3><div class="mslot slot" data-k="'+c[0]+'"><span class="ph">اسحب السبب إلى هنا</span></div></div>'}).join('')+'</div>'+
   '<div class="imp-tray" id="tray"></div><div class="fb" style="text-align:center;min-height:30px"></div>'+
   '<div class="gbar hide" id="gb">لذلك نحتاج إلى توقّع كميّات المواد الداخلة في التفاعلات الكيميائية، وهذا يتطلّب فهماً جيداً لمفهوم الذرّة.</div></div>';
 },
 init:function(el){
  var items=[['med','تُكتب كميّات المواد على عبوات الغذاء، ويحدّد بها الباحثون جرعة آمنة لدواء تجريبي.'],['agri','تُعرِّف المزارعَ على العناصر الثلاثة الأساسية في السماد ونسبها المئوية.'],['env','يتحقّق بها علماء الكيمياء البيئية من مستويات الملوّثات في الهواء الناتجة عن حرق الوقود.']];
  var tray=$('#tray',el), fb=$('.fb',el), left=3, sel=null;
  function place(chip,slot){
    if(chip.getAttribute('data-k')===slot.getAttribute('data-k')&&!slot.querySelector('.mchip')){
      var ph=$('.ph',slot); if(ph) ph.remove(); slot.appendChild(chip); chip.classList.add('ok-b','locked'); chip.style.cursor='default'; left--;
      say(fb,left?'صح! كمّل':'ممتاز','ok'); if(!left){ tray.classList.add('hide'); var g=$('#gb',el); g.classList.remove('hide'); g.classList.add('up') } return true;
    }
    slot.classList.add('shake'); later(function(){slot.classList.remove('shake')},340); say(fb,'مو هذا مكانه، فكّر في علاقته بالمجال','bad'); return false;
  }
  items.forEach(function(it){
    var c=document.createElement('div'); c.className='chip mchip'; c.setAttribute('data-k',it[0]); c.textContent=it[1]; tray.appendChild(c);
    drag(c,{zone:'.mslot',drop:place,tap:function(x){ if(sel) sel.style.outline=''; sel=x; x.style.outline='3px solid var(--gold)' }});
  });
  $$('.mslot',el).forEach(function(s){s.addEventListener('click',function(){ if(sel&&sel.parentNode===tray){ place(sel,s); sel.style.outline=''; sel=null } })});
 },
 note:'<ul><li>كتاب الطالب ص٥٢–٥٣ (مقدمة الموضوع ٣-١): أكياس السماد عليها ثلاثة أرقام تُعرِّف المزارع بالعناصر الأساسية فيه، وعبوات الغذاء تكتب كميّات المواد، والباحثون الطبيون يحدّدون جرعة آمنة لدواء تجريبي، وعلماء الكيمياء البيئية يتحقّقون من مستويات الملوّثات في الهواء. الجملة الذهبية آخر المقدمة.</li><li>اسحب السبب أو اضغط عليه ثم على البطاقة.</li></ul>'});

/* 3 how small an atom's mass is (book pp. 52-53, Table 3-1) */
slide({id:'tiny',ch:1,title:'كتلة الذرّة الواحدة',tag:'اعدّ الأصفار',
 html:function(){
  var T=[['الهيدروجين H','1.67 × 10<sup>−24</sup>'],['الكربون-12 C','1.99 × 10<sup>−23</sup>'],['الفلور F','3.16 × 10<sup>−23</sup>'],['الأكسجين O','2.66 × 10<sup>−23</sup>']];
  return '<div class="col grow" style="gap:14px;justify-content:flex-start">'+
   '<div class="frm brk" style="padding:14px 24px;gap:8px;justify-content:center"><p style="font-size:25px;line-height:1.5;text-align:center">كتلة ذرّة هيدروجين واحدة بالجرام:</p>'+
    '<div class="zr" id="zr"><span class="z" style="animation:none">0</span><span class="dt">.</span></div>'+
    '<div style="display:flex;gap:16px;align-items:center;justify-content:center;margin-top:4px"><button class="btn acc sm" type="button" id="cnt">اعدّ الأصفار</button><b class="num" id="zc" style="font:800 28px var(--font-display);color:var(--cyan)"></b><span class="eq hide" id="sci" style="font-size:32px;color:var(--gold)">= 1.67 × 10<sup>−24</sup> g</span></div></div>'+
   '<div style="display:flex;gap:16px;align-items:stretch">'+
    '<div class="frm brk" style="flex:1;overflow:hidden"><div class="fh" style="font-size:22px">الجدول ٣-١: الكتل الفعلية لبعض الذرّات</div><table class="atab"><thead><tr><th>الذرّة</th><th>الكتلة (g)</th></tr></thead><tbody>'+
     T.map(function(r){return '<tr><td>'+r[0]+'</td><td class="mf" style="direction:ltr">'+r[1]+'</td></tr>'}).join('')+'</tbody></table></div>'+
    '<div class="frm brk gold hide" id="bt" style="flex:1;padding:16px 26px;justify-content:center"><p style="font-size:27px;line-height:1.6;text-align:center">استخدام مثل هذه الأرقام ليس عملياً، فطوّر الكيميائيون طريقة أبسط: <b>تُقاس كتل الذرّات بمقارنة بعضها مع بعض</b>.</p></div>'+
   '</div>'+
  '</div>';},
 init:function(el){
  var zr=$('#zr',el), zc=$('#zc',el), btn=$('#cnt',el), n=0, t=null;
  btn.addEventListener('click',function(){
    if(t) return; btn.disabled=true;
    t=setInterval(function(){
      n++; var z=document.createElement('span'); z.className='z'; z.textContent='0'; zr.appendChild(z); zc.textContent=ar(n)+' صفراً'; zc.style.direction='rtl';
      if(n===23){ clearInterval(t); ['1','6','7'].forEach(function(d,i){var s=document.createElement('span'); s.className='z d'; s.textContent=d; s.style.animationDelay=(i*90)+'ms'; zr.appendChild(s)});
        later(function(){var s=$('#sci',el); s.classList.remove('hide'); s.classList.add('pop')},400);
        later(function(){var b=$('#bt',el); b.classList.remove('hide'); b.classList.add('up')},1100) }
    },80);
  });
 },
 note:'<ul><li>كتاب الطالب ص٥٢–٥٣: كتلة ذرّة هيدروجين واحدة ٠٫٠٠٠…٠١٦٧ g (فيها <b>٢٣</b> صفراً بعد الفاصلة) = ١٫٦٧×١٠⁻²⁴ g، والجدول ٣-١ فيه كتل أربع ذرّات.</li><li>«بما أن استخدام مثل تلك الأرقام ليس عملياً، فقد طوّر الكيميائيون طريقة أبسط للقياس» (الكتاب). الشريحة التالية تحسب المقارنة.</li></ul>'});
