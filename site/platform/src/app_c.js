/* ---------- teacher's records: my classes, summary, student report ---------- */
function subHead(title,desc){return '<header><h1 class="h1">'+title+'</h1><p class="sub">'+desc+'</p></header><div class="seg2" role="tablist"><button class="pill" type="button" data-sub="classes">شعبي</button><button class="pill" type="button" data-sub="summary">ملخص الشعبة</button><button class="pill" type="button" data-sub="student">تقرير الطالب</button></div>'}
function noClassesCard(){return '<div class="glass empty"><b class="h2">لا توجد شعب بعد</b><p>أضف شعبتك بلصق أسماء الطلاب، أو استورد نسخة من موقع «الإدارة الصفية» القديم.</p><div class="row"><button class="gbtn" type="button" data-act="newclass">'+ic('plus')+'إضافة شعبة</button><button class="sbtn" type="button" data-act="import">'+ic('up2')+'استيراد نسخة</button></div></div>'}
/* download names are plain ASCII: Arabic names are lost by some browsers and file systems; the Arabic text is inside the file */
function slug(s){return PL.normAr(s).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'class'}
function dateAr(iso){return ar(String(iso).replace(/-/g,'/'))}
function lastDate(d,cid){var m=''; Object.keys(d.sessions).forEach(function(k){var s=d.sessions[k]; if(s.classId===cid&&s.date>m) m=s.date}); return m}
function classOptions(sel){return D().classes.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===sel?' selected':'')+'>'+esc(c.name)+'</option>'}).join('')}

function renderClasses(){
  var d=D(), h=subHead('شعبي','الشعب والطلاب والجدول الأسبوعي في مكان واحد.');
  h+='<div class="cgrid">'+d.classes.map(function(c){
    var sum=PL.classSummary(d,c.id), last=lastDate(d,c.id), rate=sum.total.rate;
    return '<div class="glass ccard"><div class="ml"><span>'+ar(c.students.length)+' طالباً'+(c.course?' · '+courseLabel(c.course):'')+'</span><span class="tag">'+(last?'آخر حصة: '+dateAr(last):'لم تُسجَّل حصص')+'</span></div><div class="nm">'+lat(c.name)+'</div><div class="ml"><span>'+ar(sum.sessions)+' حصة مسجّلة</span><span>مشاركة '+(rate===null?'—':ar(Math.round(rate))+'٪')+'</span></div><div class="bar"><i style="width:'+(rate||0)+'%"></i></div>'+
     '<div class="row"><button class="gbtn" type="button" data-sumof="'+esc(c.id)+'">ملخص الشعبة</button><button class="sbtn" type="button" data-start="'+esc(c.id)+'" data-per="0">'+ic('play')+'ابدأ حصة</button><button class="sbtn" type="button" data-editc="'+esc(c.id)+'" aria-label="تعديل الشعبة">'+ic('edit')+'تعديل</button></div></div>'}).join('')+
   '<div class="glass ccard add" role="button" tabindex="0" data-act="newclass">'+ic('plus')+'<b style="font:800 22px var(--font-display);color:var(--ink)">شعبة جديدة</b><span>الصق الأسماء سطراً سطراً</span></div></div>';
  var days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'], idx={}; d.classes.forEach(function(c,i){idx[c.id]=i%3});
  var tt='<div></div>'; for(var p=1;p<=8;p++) tt+='<div class="ph">ح'+ar(p)+'</div>';
  days.forEach(function(dn,di){tt+='<div class="dy">'+dn+'</div>'; for(var p2=1;p2<=8;p2++){ var sl=d.timetable.filter(function(t){return t.day===di&&t.period===p2})[0], c=sl&&PL.findClass(d,sl.classId);
    tt+=c?'<button type="button" class="sl f k'+(idx[c.id]+1)+'" data-slot="'+di+'|'+p2+'" aria-label="'+dn+' الحصة '+ar(p2)+': '+esc(c.name)+'">'+lat(c.name)+'</button>':'<button type="button" class="sl" data-slot="'+di+'|'+p2+'" aria-label="'+dn+' الحصة '+ar(p2)+': فارغة">·</button>'}});
  h+='<div class="glass"><div class="row" style="margin-bottom:10px"><h2 class="h2">جدول الحصص</h2><span class="hint">اضغط خانة لتضع فيها شعبة. تظهر حصصك على الصفحة الرئيسية كل يوم.</span></div><div style="overflow-x:auto"><div class="ttab" style="min-width:620px">'+(d.classes.length?tt:'<p class="hint" style="grid-column:1/-1">أضف شعبة أولاً لتضعها في الجدول.</p>')+'</div></div></div>';
  var lb=d.lastBackup?'آخر نسخة احتياطية: '+dateAr(PL.todayISO(new Date(d.lastBackup))):'لم تحفظ نسخة احتياطية بعد';
  h+='<div class="glass"><h2 class="h2" style="margin-bottom:6px">بياناتك</h2><p class="hint" style="margin:0 0 12px">أسماء الطلاب وما سُجّل عليهم محفوظة في هذا المتصفح على هذا الجهاز فقط، ولا تُرسل لأي مكان. احفظ نسخة احتياطية في مكان آمن، وبها تنقل بياناتك لجهاز آخر.</p><div class="row"><button class="gbtn" type="button" data-act="export">'+ic('dl')+'تصدير نسخة احتياطية</button><button class="sbtn" type="button" data-act="import">'+ic('up2')+'استيراد نسخة</button><span class="hint">'+lb+'</span></div><p class="hint" id="diag" style="margin:12px 0 0"></p></div>';
  $('#v-classes').innerHTML=h; showDiag();
}
function showDiag(){
  var el=$('#diag'); if(!el) return; var s=PStore.status(), t='الحفظ: '+(s.persists?'على هذا الجهاز':'غير متاح في هذا المتصفح');
  if(typeof claude!=='undefined'&&claude&&claude.use){ t+=' · التنزيل: '+(CAN_DL===null?'يُفحص…':(CAN_DL?'مباشر':'بالنسخ واللصق')); if(CAN_DL===null) claude.use('downloads').then(function(x){CAN_DL=!!x; showDiag()},function(){CAN_DL=false; showDiag()}) }
  else t+=' · التنزيل: مباشر';
  el.textContent=t;
}

/* ---- class dialog (new and edit) ---- */
function courseSelect(sel){return '<select class="inp" id="cdCourse"><option value="">غير محدد</option>'+COURSE_IDS.map(function(id){return '<option value="'+id+'"'+(id===sel?' selected':'')+'>'+courseLabel(id)+'</option>'}).join('')+'</select>'}
function classDialog(cid){
  var d=D(), cls=cid?PL.findClass(d,cid):null, edit=!!cls;
  var m=modal('<h2>'+(edit?'تعديل الشعبة':'شعبة جديدة')+'</h2>'+
   '<div class="fld"><label for="cdName">اسم الشعبة</label><input class="inp" id="cdName" maxlength="40" placeholder="مثال: 10/3" value="'+(edit?esc(cls.name):'')+'"></div>'+
   '<div class="fld"><label for="cdCourse">المقرر</label>'+courseSelect(edit?cls.course:(d.ui.course||''))+'</div>'+
   (edit?'<div class="fld"><label>الطلاب ('+ar(cls.students.length)+')</label><div class="stlist" id="cdList">'+cls.students.map(function(s){return '<div class="it"><span>'+esc(s.name)+'</span><button class="sbtn mini" type="button" data-rmstu="'+esc(s.id)+'" aria-label="حذف '+esc(s.name)+'">'+ic('trash')+'</button></div>'}).join('')+'</div></div>':'')+
   '<div class="fld"><label for="cdNames">'+(edit?'إضافة طلاب (الصق الأسماء سطراً سطراً)':'أسماء الطلاب (الصقها سطراً سطراً، ويقبل الترقيم)')+'</label><textarea class="inp" id="cdNames" placeholder="أحمد بن سالم&#10;خالد بن ناصر&#10;..."></textarea></div>'+
   '<p class="hint" id="cdErr" style="color:#ffb3a8;margin:0"></p>'+
   '<div class="acts2"><button class="gbtn" type="button" id="cdSave">'+(edit?'حفظ':'إضافة الشعبة')+'</button><button class="sbtn" type="button" data-close>إلغاء</button>'+(edit?'<span style="flex:1"></span><button class="sbtn" type="button" id="cdDel">'+ic('trash')+'حذف الشعبة</button>':'')+'</div>');
  $('[data-close]',m).addEventListener('click',closeModal);
  var err=function(t){$('#cdErr',m).textContent=t};
  $('#cdSave',m).addEventListener('click',function(){
    var name=$('#cdName',m).value, crs=$('#cdCourse',m).value, names=$('#cdNames',m).value, res=null, msg='';
    if(edit){
      if(!PL.clean(name,40)){err('اكتب اسم الشعبة'); return}
      var dupe=D().classes.some(function(c){return c.id!==cid&&PL.normAr(c.name)===PL.normAr(name)}); if(dupe){err('يوجد شعبة بهذا الاسم'); return}
      change(function(s){PL.renameClass(s,cid,name); var c=PL.findClass(s,cid); if(c) c.course=/^[a-z]+\d+$/.test(crs)?crs:''; if(names.trim()) res=PL.addStudents(s,cid,names)});
      if(res&&res.added) msg='أُضيف '+ar(res.added)+' طالباً'+(res.dups?' (تُجوهل '+ar(res.dups)+' مكرراً)':'');
    } else {
      change(function(s){res=PL.addClass(s,{name:name,course:crs,names:names}); if(!res.error&&crs) s.ui.course=crs});
      if(res.error){err(res.error); return}
      msg='أُضيفت الشعبة '+res.cls.name+' وفيها '+ar(res.cls.students.length)+' طالباً'+(res.dups?' (تُجوهل '+ar(res.dups)+' اسماً مكرراً)':'')+(res.over?' (تُرك '+ar(res.over)+' لتجاوز حد '+ar(PL.LIM.maxStudents)+')':'');
    }
    closeModal(); if(msg) toast(msg);
  });
  if(edit){
    $('#cdList',m).addEventListener('click',function(e){
      var b=e.target.closest('[data-rmstu]'); if(!b) return;
      if(b.getAttribute('data-sure')!=='1'){ b.setAttribute('data-sure','1'); b.textContent='تأكيد الحذف'; setTimeout(function(){ if(b.isConnected&&b.getAttribute('data-sure')==='1'){b.removeAttribute('data-sure'); b.innerHTML=ic('trash')} },3500); return }
      change(function(s){PL.removeStudent(s,cid,b.getAttribute('data-rmstu'))}); b.closest('.it').remove(); toast('حُذف الطالب وكل ما سُجّل عليه.');
    });
    $('#cdDel',m).addEventListener('click',function(){
      var b=$('#cdDel',m);
      if(b.getAttribute('data-sure')!=='1'){ b.setAttribute('data-sure','1'); b.textContent='تأكيد: احذف الشعبة وكل سجلاتها'; setTimeout(function(){ if(b.isConnected&&b.getAttribute('data-sure')==='1'){b.removeAttribute('data-sure'); b.innerHTML=ic('trash')+'حذف الشعبة'} },4000); return }
      change(function(s){PL.removeClass(s,cid)}); closeModal(); toast('حُذفت الشعبة.');
    });
  }
}

/* ---- backup: export and import ---- */
function exportBackup(){
  var d=D(); if(!d.classes.length){toast('لا بيانات لتصديرها بعد: أضف شعبة أولاً.'); return}
  saveFile('platform-backup-'+PL.todayISO()+'.json',PL.exportBackup(d),'application/json').then(function(ok){ if(ok){PStore.markBackup(); renderView()} });
}
/* ---- the single-file copy: built here, in the browser, from this site's own pages. One file with every lesson that opens by double-click on any device without a server or internet. The students' data is never part of it ---- */
function canOffline(){return !window.OFFLINE_LESSONS&&/^https?:$/.test(location.protocol)}
function saveBig(name,blob){   /* true saved, null declined, false not possible from this page */
  return new Promise(function(done){
    function plain(){try{var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove()},120000); done(true)}catch(e){done(false)}}
    if(typeof claude==='undefined'||!claude||!claude.use){plain(); return}
    claude.use('downloads').then(function(d){
      if(!d){done(false); return}
      d.save({filename:name,data:blob}).then(function(){done(true)},function(e){done(e&&e.code==='declined'?null:false)});
    },function(){done(false)});
  });
}
function buildOffline(pages,step,alive){
  var TAG='<script src="shared/stickers_assets.js"><\/script>', parts=[];
  function get(u){return fetch(u,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('http '+r.status+' '+u); return r.text() })}
  return Promise.all([get('index.html').catch(function(){return get(location.href.split('#')[0])}),get('shared/stickers_assets.js')]).then(function(a){
    var host=a[0], stk=a[1], i=host.indexOf(TAG); if(i<0) throw new Error('home page');
    parts.push(host.slice(0,i),'<script>',stk,'<\/script>\n<script>window.OFFLINE_LESSONS={');
    return pages.reduce(function(pr,p,idx){return pr.then(function(){
      if(!alive()) throw new Error('cancel');
      return get(p).then(function(t){
        if(t.indexOf(TAG)<0) throw new Error(p);
        t=t.split(TAG).join('<script>var STK_IMG=parent.STK_IMG,STK_WH=parent.STK_WH;<\/script>');
        parts.push(new Blob([JSON.stringify(p)+':'+JSON.stringify(t).replace(/<\//g,'<\\/').replace(/<!--/g,'<\\!--')+(idx<pages.length-1?',':'')]));
        step(idx+1);
      });
    })},Promise.resolve()).then(function(){ parts.push('};<\/script>',host.slice(i+TAG.length)); return new Blob(parts,{type:'text/html'}) });
  });
}
function offlineDialog(){
  var pages=[]; Object.keys(LESSONS).forEach(function(id){var p=LESSONS[id].page; if(p&&pages.indexOf(p)<0) pages.push(p)});
  var blob=null, running=false, NAME='platform-offline.html';
  var m=modal('<h2>نسخة بلا إنترنت</h2><p class="hint" style="margin:0">ملف واحد فيه كل الدروس ('+ar(pages.length)+') يُفتح بالنقر المزدوج على أي جهاز بلا إنترنت وبلا خادم. حجمه أكثر من ٦٠ ميغا. يُجهَّز هنا في متصفحك من صفحات هذا الموقع، وبيانات الطلاب لا تدخل فيه.</p>'+
   '<div class="bar" style="height:14px"><i id="ofBar" style="width:0"></i></div><p class="hint" id="ofMsg" style="margin:0" role="status" aria-live="polite">اضغط «جهّز الملف» وانتظر قليلاً.</p>'+
   '<div class="acts2"><button class="gbtn" type="button" id="ofGo">'+ic('dl')+'جهّز الملف</button><button class="sbtn" type="button" data-close>إغلاق</button></div>');
  var msg=function(t,bad){var e=$('#ofMsg',m); e.textContent=t; e.style.color=bad?'#ffb3a8':''};
  var go=$('#ofGo',m);
  go.addEventListener('click',function(){
    if(running) return;
    if(blob){ go.disabled=true; saveBig(NAME,blob).then(function(ok){ go.disabled=false;
      if(ok) msg('تم. افتح الملف «'+NAME+'» بالنقر المزدوج من مجلد التنزيلات. تقدر تنسخه على فلاشة أو ترسله لأي جهاز.');
      else if(ok===null) msg('أُلغي الحفظ. اضغط «احفظ على جهازك» لتجرب مرة ثانية.');
      else msg('التنزيل المباشر غير متاح من هذا العرض. افتح رابط الموقع في متصفح الجهاز نفسه وجرّب من هناك.',true) }); return }
    running=true; go.disabled=true; msg('جارٍ جمع الدروس: ٠ من '+ar(pages.length)); var bar=$('#ofBar',m);
    buildOffline(pages,function(n){ bar.style.width=Math.round(n/pages.length*100)+'%'; msg('جارٍ جمع الدروس: '+ar(n)+' من '+ar(pages.length)) },function(){return modalEl===m}).then(function(b){
      blob=b; running=false; go.disabled=false; go.innerHTML=ic('dl')+'احفظ على جهازك'; msg('الملف جاهز ('+ar(Math.round(b.size/1048576))+' ميغا). اضغط «احفظ على جهازك».'); go.focus();
    },function(e){ running=false; go.disabled=false; if(e&&e.message==='cancel') return; bar.style.width='0'; msg('تعذّر تجهيز الملف من هذه الصفحة ('+(e&&e.message||'خطأ')+'). تأكد من الاتصال وجرّب مرة ثانية.',true) });
  });
}
function importDialog(){
  var parsed=null;
  var m=modal('<h2>استيراد نسخة احتياطية</h2><p class="hint" style="margin:0">اختر ملف نسخة احتياطية من هذا الموقع أو من موقع «الإدارة الصفية» القديم. الاستيراد يضيف ولا يحذف شيئاً مما عندك.</p>'+
   '<div class="fld"><label for="imFile">الملف</label><input class="inp" id="imFile" type="file" accept=".json,application/json"></div>'+
   '<div class="fld"><label for="imText">أو الصق محتوى النسخة هنا</label><textarea class="inp" id="imText" style="min-height:110px;direction:ltr;text-align:left"></textarea></div>'+
   '<p class="hint" id="imMsg" style="margin:0"></p><div class="acts2"><button class="gbtn" type="button" id="imGo" disabled>'+ic('up2')+'دمج في بياناتي</button><button class="sbtn" type="button" data-close>إلغاء</button></div>');
  var msg=function(t,bad){var e=$('#imMsg',m); e.textContent=t; e.style.color=bad?'#ffb3a8':''};
  function preview(text){
    parsed=null; $('#imGo',m).disabled=true; if(!text.trim()){msg(''); return}
    try{ var r=PL.parseBackup(text), st=r.state, n=0; st.classes.forEach(function(c){n+=c.students.length});
      parsed=r; $('#imGo',m).disabled=false;
      msg((r.legacy?'نسخة من موقع «الإدارة الصفية» القديم: ':'نسخة من هذا الموقع: ')+ar(st.classes.length)+' شعبة، '+ar(n)+' طالباً، '+ar(Object.keys(st.sessions).length)+' حصة'+(r.warnings?'. سيُتجاهل '+ar(r.warnings)+' عنصراً غير صالح':'')+'.')
    }catch(e){ msg(e.message||'الملف غير صالح',true) }
  }
  $('#imText',m).addEventListener('input',function(e){preview(e.target.value)});
  $('#imFile',m).addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0]; if(!f) return; if(f.size>8*1024*1024){msg('الملف كبير جداً، ليس نسخة احتياطية.',true); return}
    var rd=new FileReader(); rd.onload=function(){ $('#imText',m).value=String(rd.result); preview(String(rd.result)) }; rd.onerror=function(){msg('تعذّرت قراءة الملف.',true)}; rd.readAsText(f);
  });
  $('#imGo',m).addEventListener('click',function(){
    if(!parsed) return; var r=null; change(function(s){r=PL.mergeInto(s,parsed.state)}); closeModal();
    toast(r.added?'تم الدمج: أُضيفت '+ar(r.added)+' شعبة'+(r.skipped?' (وتُركت '+ar(r.skipped)+' موجودة عندك)':''):(r.skipped?'كل الشعب موجودة عندك، وأُضيف ما ينقصها من الحصص فقط.':'لا جديد في الملف.'));
  });
  $('[data-close]',m).addEventListener('click',closeModal);
}

/* ---- summary of a class ---- */
var sumSt={classId:'',range:'all',key:'rate',dir:1}, stSt={classId:'',sid:'',range:'all'};
function rangeOf(r){var t=PL.todayISO(); return r==='30'?{from:PL.addDays(t,-30)}:(r==='7'?{from:PL.addDays(t,-7)}:null)}
function pickClass(st){var d=D(); if(!PL.findClass(d,st.classId)) st.classId=d.ui.lastClass&&PL.findClass(d,d.ui.lastClass)?d.ui.lastClass:(d.classes[0]?d.classes[0].id:''); return st.classId}
function rangeSel(id,v){return '<select class="inp" id="'+id+'" style="width:auto"><option value="all"'+(v==='all'?' selected':'')+'>كل الفترة</option><option value="30"'+(v==='30'?' selected':'')+'>آخر ٣٠ يوماً</option><option value="7"'+(v==='7'?' selected':'')+'>آخر ٧ أيام</option></select>'}
function renderSummary(){
  var d=D(), h=subHead('ملخص الشعبة','نسبة المشاركة والسلوك، ومن يحتاج متابعة.');
  if(!d.classes.length){$('#v-summary').innerHTML=h+noClassesCard(); return}
  var cid=pickClass(sumSt), sum=PL.classSummary(d,cid,rangeOf(sumSt.range)), t=sum.total;
  h+='<div class="row"><label class="hint" for="sClass">الشعبة</label><select class="inp" id="sClass" style="width:auto">'+classOptions(cid)+'</select>'+rangeSel('sRange',sumSt.range)+'</div>';
  if(!sum.sessions){
    h+='<div class="glass empty"><b class="h2">لا حصص مسجّلة في هذه الفترة</b><p>ابدأ حصة وسجّل المشاركة من لوحة الصف داخل الدرس، فيظهر الملخص هنا.</p><div><button class="gbtn" type="button" data-start="'+esc(cid)+'" data-per="0">'+ic('play')+'ابدأ حصة</button></div></div>';
    $('#v-summary').innerHTML=h; return;
  }
  h+='<div class="tiles"><div class="glass tile"><b>'+ar(sum.sessions)+'</b><span>حصة مسجّلة</span></div><div class="glass tile"><b>'+(t.rate===null?'—':ar(Math.round(t.rate))+'٪')+'</b><span>نسبة المشاركة العامة</span></div><div class="glass tile g"><b>'+ar(t.positive)+'</b><span>سلوك إيجابي</span></div><div class="glass tile r"><b>'+ar(t.negative)+'</b><span>سلوك غير حسن</span></div></div>';
  var fl=[]; sum.rows.forEach(function(r){r.flags.forEach(function(f){fl.push({r:r,f:f})})});
  h+='<div><div class="row" style="margin-bottom:10px"><h2 class="h2">يحتاجون متابعة</h2><span class="hint">تنبيه للمتابعة وليس حكماً على الطالب</span></div>'+(fl.length?'<div class="fl">'+fl.map(function(x){var k=x.f==='low'?'warn':'bad'; return '<button class="fcard" type="button" data-stu="'+esc(x.r.student.id)+'"><span class="tag '+k+'">'+PL.FLAG_TEXT[x.f]+'</span><div><b>'+esc(x.r.student.name)+'</b><span>'+ar(PL.flagHint(x.f,x.r.counts))+'</span></div></button>'}).join('')+'</div>':'<p class="hint" style="margin:0">لا أحد يحتاج متابعة في هذه الفترة.</p>')+'</div>';
  var rows=sum.rows.map(function(r){return {id:r.student.id,name:r.student.name,ses:r.counts.sessions,rate:r.counts.rate===null?-1:r.counts.rate,po:r.counts.positive,ne:r.counts.negative}});
  rows.sort(function(a,b){var A=a[sumSt.key],B=b[sumSt.key],c=typeof A==='string'?A.localeCompare(B,'ar'):A-B; return (c||a.name.localeCompare(b.name,'ar'))*sumSt.dir});
  h+='<div class="glass"><div class="row" style="margin-bottom:6px"><h2 class="h2">كل الطلاب</h2><div style="flex:1"></div><button class="sbtn" type="button" data-act="csv">'+ic('dl')+'تصدير Excel (CSV)</button></div><div style="overflow-x:auto"><table class="rt"><thead><tr><th data-k="name">الطالب</th><th data-k="ses">حصص</th><th data-k="rate">المشاركة</th><th data-k="po">إيجابي</th><th data-k="ne">غير حسن</th></tr></thead><tbody>'+
   rows.map(function(r){return '<tr class="lk" data-stu="'+esc(r.id)+'" tabindex="0"><td>'+esc(r.name)+'</td><td>'+ar(r.ses)+'</td><td>'+(r.rate<0?'—':ar(Math.round(r.rate))+'٪<span class="bar"><i style="width:'+r.rate+'%"></i></span>')+'</td><td>'+ar(r.po)+'</td><td>'+ar(r.ne)+'</td></tr>'}).join('')+'</tbody></table></div></div>';
  $('#v-summary').innerHTML=h;
}

/* ---- report of one student ---- */
function renderStudent(){
  var d=D(), h=subHead('تقرير الطالب','كل ما سُجّل على الطالب في الحصص، مع الدرس الذي كان يُشرح.');
  if(!d.classes.length){$('#v-student').innerHTML=h+noClassesCard(); return}
  var cid=pickClass(stSt), cls=PL.findClass(d,cid); if(!PL.findStudent(cls,stSt.sid)) stSt.sid=cls.students[0]?cls.students[0].id:'';
  h+='<div class="row"><label class="hint" for="tClass">الشعبة</label><select class="inp" id="tClass" style="width:auto">'+classOptions(cid)+'</select><label class="hint" for="tStu">الطالب</label><select class="inp" id="tStu" style="width:auto;max-width:300px">'+cls.students.map(function(s){return '<option value="'+esc(s.id)+'"'+(s.id===stSt.sid?' selected':'')+'>'+esc(s.name)+'</option>'}).join('')+'</select>'+rangeSel('tRange',stSt.range)+'<div style="flex:1"></div><button class="gbtn" type="button" data-act="report">'+ic('dl')+'تصدير التقرير</button></div>';
  var rep=stSt.sid?PL.studentReport(d,cid,stSt.sid,rangeOf(stSt.range)):null;
  if(!rep){$('#v-student').innerHTML=h+'<div class="glass empty"><p>لا طلاب في هذه الشعبة بعد.</p></div>'; return}
  var c=rep.counts, rate=c.rate;
  h+='<div class="row"><span class="h2">'+esc(rep.student.name)+'</span><span class="tag">'+lat(cls.name)+'</span>'+rep.flags.map(function(f){return '<span class="tag '+(f==='low'?'warn':'bad')+'">'+PL.FLAG_TEXT[f]+'</span>'}).join('')+'</div>';
  function rl(k){var m=rep.reasons[k], ks=Object.keys(m); return ks.length?ks.map(function(x){return esc(x)+(m[x]>1?' ('+ar(m[x])+')':'')}).join('، '):''}
  h+='<div class="hd2"><div class="glass"><h2 class="h2" style="margin-bottom:10px">المشاركة</h2><div class="cmp"><div class="ln me"><span>'+esc(rep.student.name.split(' ')[0])+'</span><div class="bar"><i style="width:'+(rate||0)+'%"></i></div><b>'+(rate===null?'—':ar(Math.round(rate))+'٪')+'</b></div><div class="ln"><span>متوسط الشعبة</span><div class="bar"><i style="width:'+(rep.classRate||0)+'%"></i></div><b>'+(rep.classRate===null?'—':ar(Math.round(rep.classRate))+'٪')+'</b></div><p class="hint" style="margin:4px 0 0">شارك في '+ar(c.participatedSessions)+' من '+ar(c.participatedSessions+c.noParticipationSessions)+' حصة سُجّلت مشاركتها.</p></div></div>'+
   '<div class="glass"><h2 class="h2" style="margin-bottom:10px">السلوك</h2><div class="row"><span class="tag good">'+ar(c.positive)+' إيجابي</span><span class="tag bad">'+ar(c.negative)+' غير حسن</span><span class="tag">'+ar(c.notes)+' ملاحظة</span></div><p class="hint" style="margin:8px 0 0">'+(rl('negative')?'غير الحسن: '+rl('negative')+'. ':'')+(rl('positive')?'الإيجابي: '+rl('positive')+'.':'')+(!rl('negative')&&!rl('positive')?'لا تسجيلات سلوك في الفترة.':'')+'</p></div></div>';
  h+='<div><h2 class="h2" style="margin-bottom:10px">الحصص</h2><div class="tl">'+(rep.timeline.length?rep.timeline.map(function(e){
    var ls=e.lessons.map(lessonTitle).filter(Boolean).join('، ');
    return '<div class="ev"><div class="dt">'+dateAr(e.date)+(e.period?'<br><span class="hint">الحصة '+ar(e.period)+'</span>':'')+'</div><div><div class="lsn">'+(ls?esc(ls):'<span class="hint">درس غير محدد</span>')+'</div><div class="ch">'+(e.n===null?'':'<span class="tag '+(e.n?'good':'warn')+'">'+(e.n?'شارك ×'+ar(e.n):'لم يشارك')+'</span>')+e.recs.map(function(r){return '<span class="tag '+(r.kind==='positive'?'good':r.kind==='negative'?'bad':'')+'">'+esc(r.reason||r.note)+'</span>'}).join('')+'</div></div></div>'}).join(''):'<p class="hint">لا حصص مسجّلة لهذا الطالب في الفترة.</p>')+'</div></div>';
  $('#v-student').innerHTML=h;
}

/* ---------- events, boot ---------- */
function onDocClick(e){
  var t=e.target, b=t.closest('[data-act],[data-start],[data-back],[data-nav],[data-nav2],[data-sub],[data-sumof],[data-editc],[data-slot],[data-stu],th[data-k],.unit>button');
  if(!b) return;
  var act=b.getAttribute('data-act');
  if(act==='newclass') classDialog(); else if(act==='import') importDialog(); else if(act==='export') exportBackup();
  else if(act==='offline') offlineDialog();
  else if(act==='csv'){ var sm=PL.classSummary(D(),sumSt.classId,rangeOf(sumSt.range)); if(sm) saveFile('class-summary-'+slug(sm.cls.name)+'.csv',PL.summaryCSV(sm),'text/csv') }
  else if(act==='report'){ var rp=PL.studentReport(D(),stSt.classId,stSt.sid,rangeOf(stSt.range)); if(rp) saveFile('student-report-'+slug(rp.cls.name)+'-'+PL.todayISO()+'.txt',PL.reportText(rp,lessonTitle),'text/plain') }
  else if(b.hasAttribute('data-start')) startLesson(b.getAttribute('data-start'),+b.getAttribute('data-per')||0);
  else if(b.hasAttribute('data-nav')) go(b.getAttribute('data-nav'));
  else if(b.hasAttribute('data-nav2')) go(b.getAttribute('data-nav2'));
  else if(b.hasAttribute('data-sub')) go(b.getAttribute('data-sub'));
  else if(b.hasAttribute('data-back')) go(parentHash());
  else if(b.hasAttribute('data-sumof')){ sumSt.classId=b.getAttribute('data-sumof'); go('summary') }
  else if(b.hasAttribute('data-editc')) classDialog(b.getAttribute('data-editc'));
  else if(b.hasAttribute('data-slot')){
    var p=b.getAttribute('data-slot').split('|'), day=+p[0], per=+p[1], d=D(); if(!d.classes.length){toast('أضف شعبة أولاً.'); return}
    openMenu(b,d.classes.map(function(c){return {t:c.name,f:function(){change(function(s){PL.setSlot(s,day,per,c.id)})}}}).concat([{t:'إفراغ الخانة',f:function(){change(function(s){PL.setSlot(s,day,per,null)})}}]));
  }
  else if(b.hasAttribute('data-stu')){ stSt.classId=sumSt.classId||stSt.classId; stSt.sid=b.getAttribute('data-stu'); go('student') }
  else if(b.hasAttribute('data-k')){ var k=b.getAttribute('data-k'); if(sumSt.key===k) sumSt.dir=-sumSt.dir; else {sumSt.key=k; sumSt.dir=(k==='name'?1:-1)} renderSummary() }
  else if(b.matches('.unit>button')){ var u=b.parentNode, o=!u.classList.contains('open'); u.classList.toggle('open',o); b.setAttribute('aria-expanded',o) }
}
function onDocChange(e){
  var t=e.target; if(!t.id) return;
  if(t.id==='sClass'){sumSt.classId=t.value; renderSummary()} else if(t.id==='sRange'){sumSt.range=t.value; renderSummary()}
  else if(t.id==='tClass'){stSt.classId=t.value; stSt.sid=''; renderStudent()} else if(t.id==='tStu'){stSt.sid=t.value; renderStudent()} else if(t.id==='tRange'){stSt.range=t.value; renderStudent()}
}
function boot(){
  document.body.insertAdjacentHTML('afterbegin',
  '<div class="app" data-pal="emerald"><main class="view" id="view"></main>'+
  '<div class="page" id="pg"><div class="top2"><div class="brand"><i><small>6</small>C</i><span>منصة الدروس</span></div>'+
   '<nav class="row" aria-label="الأقسام"><button class="pill on" type="button" data-nav="home">'+ic('home')+'الرئيسية</button><button class="pill" type="button" data-nav="classes">'+ic('users')+'سجل المعلم</button></nav><div class="sp"></div></div>'+
   '<div id="banner"></div>'+
   '<section id="v-home" style="display:flex;flex-direction:column;gap:24px"></section><section id="v-grade" class="hide" style="display:flex;flex-direction:column;gap:24px"></section><section id="v-term" class="hide" style="display:flex;flex-direction:column;gap:24px"></section><section id="v-course" class="hide" style="display:flex;flex-direction:column;gap:24px"></section>'+
   '<section id="v-classes" class="hide" style="display:flex;flex-direction:column;gap:22px"></section><section id="v-summary" class="hide" style="display:flex;flex-direction:column;gap:22px"></section><section id="v-student" class="hide" style="display:flex;flex-direction:column;gap:22px"></section></div>'+
  '<div class="lv hide" id="lv"><div id="lfWrap"><iframe id="lf" title="الدرس" allow="fullscreen" referrerpolicy="no-referrer"></iframe>'+
   '<div class="pick hide" id="pick"><div class="glass box"><div class="hint" style="font:700 22px var(--font-display)">الطالب المختار</div><div class="who" id="who"></div><div class="row" id="pickBtns" style="justify-content:center"><button class="gbtn" id="pickYes" type="button">شارك</button><button class="sbtn" id="pickNo" type="button">اختر آخر</button><button class="sbtn" id="pickX" type="button">'+ic('close')+'إغلاق</button></div></div></div></div>'+
   '<aside class="drawer open" id="drawer" aria-label="لوحة الصف"></aside></div></div>');
  $('#lf').addEventListener('load',patchLesson); bindPick(); if(window.ResizeObserver) new ResizeObserver(layoutFrame).observe($('#lfWrap')); window.addEventListener('resize',layoutFrame);
  document.addEventListener('click',onDocClick); document.addEventListener('change',onDocChange);
  document.addEventListener('keydown',function(e){ if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.ccard.add,tr.lk')){e.preventDefault(); e.target.click()} });
  PStore.subscribe(function(){ if(!$('#lv').classList.contains('hide')) renderDrawer(); else renderView() });
  BG.mount($('#view')); BG.go('doodles','emerald',1); STK.mount(null);
  window.addEventListener('hashchange',route); route();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
