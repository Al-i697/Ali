/* ---------- the platform page: shell, router, home ---------- */
function ar(x){return String(x).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})}
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lat(s){return '<span class="num">'+esc(s)+'</span>'}
var PATH={
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
 dice:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/><circle cx="8.5" cy="15.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/><circle cx="12" cy="12" r="1"/>',
 up:'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
 minus:'<path d="M5 12h14"/>', plus:'<path d="M5 12h14M12 5v14"/>',
 skip:'<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff:'<path d="M17.9 17.9A10.4 10.4 0 0 1 12 19C5.5 19 2 12 2 12a18 18 0 0 1 4.1-5.1M9.9 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2"/><path d="m2 2 20 20"/>',
 dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
 up2:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
 chev:'<path d="m15 18-6-6 6-6"/>', home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>', play:'<path d="m6 4 14 8-14 8z"/>', close:'<path d="M18 6 6 18M6 6l12 12"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', trash:'<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>'
};
function ic(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+PATH[n]+'</svg>'}
function D(){return PStore.data()}
function change(fn){return PStore.change(fn)}

/* ---------- toast (with an optional undo) ---------- */
var toastT=0;
function toast(m,undo){
  var t=$('#toast'); if(!t){t=document.createElement('div'); t.id='toast'; t.className='toast'; t.setAttribute('role','status'); document.body.appendChild(t)}
  t.textContent=m; t.classList.remove('hide');
  if(undo){var b=document.createElement('button'); b.type='button'; b.textContent='تراجع'; b.addEventListener('click',function(){t.classList.add('hide'); undo()}); t.appendChild(b)}
  clearTimeout(toastT); toastT=setTimeout(function(){t.classList.add('hide')},undo?6000:3400);
}

/* ---------- the curriculum index (catalog.json): lessons, courses, hashes ---------- */
var LESSONS={}, BYHASH={}, COURSE_IDS=Object.keys(CATALOG.courses);
function lessonHash(id){return 'l-'+id.replace(/[:_~]/g,'-')}
COURSE_IDS.forEach(function(cid){ CATALOG.courses[cid].units.forEach(function(u){ u.lessons.forEach(function(l){
  var o={id:l.id,code:l.code,title:l.title,course:cid,unit:u.num,page:l.page||'',hash:l.page?lessonHash(l.id):''}; LESSONS[l.id]=o; if(o.hash) BYHASH[o.hash]=o }) }) });
function courseLabel(id){var c=CATALOG.courses[id]; return c?CATALOG.subjects[c.subject].short+' '+ar(c.grade):''}
function lessonTitle(id){var l=LESSONS[id]; return l?ar(l.code)+' '+l.title:''}
function firstBuilt(course){var c=CATALOG.courses[course]; if(!c) return ''; for(var i=0;i<c.units.length;i++) for(var j=0;j<c.units[i].lessons.length;j++) if(c.units[i].lessons[j].page) return c.units[i].lessons[j].id; return ''}
function lessonFor(classId){var cls=PL.findClass(D(),classId); if(!cls) return ''; var l=D().ui.lastLesson[classId]; if(l&&LESSONS[l]&&LESSONS[l].page) return l; return firstBuilt(cls.course)}

/* ---------- saving files: the download capability when the site has it, a plain download when opened as a file, else a copy box ---------- */
var CAN_DL=null;
function saveFile(name,text,mime){
  return new Promise(function(done){
    function box(){showTextBox(name,text); done(false)}
    function plain(){try{var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type:(mime||'text/plain')+';charset=utf-8'})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove()},4000); done(true)}catch(e){box()}}
    if(typeof claude==='undefined'||!claude||!claude.use){plain(); return}
    claude.use('downloads').then(function(d){
      if(!d){box(); return}
      d.save({filename:name,data:text}).then(function(){toast('تم الحفظ'); done(true)},function(e){ if(e&&e.code==='declined'){done(false); return} box() });
    },function(){box()});
  });
}
function copyText(t){
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function(){return true},function(){return false}) }catch(e){}
  return Promise.resolve(false);
}

/* ---------- modal and menu ---------- */
var modalEl=null, lastFocus=null;
function modal(html){
  closeModal(); lastFocus=document.activeElement;
  var m=document.createElement('div'); m.className='mdl'; m.innerHTML='<div class="glass box" role="dialog" aria-modal="true">'+html+'</div>'; document.body.appendChild(m); modalEl=m;
  m.addEventListener('mousedown',function(e){if(e.target===m) closeModal()});
  var f=$('input,textarea,select',m); if(f) setTimeout(function(){f.focus()},30);
  return m;
}
function closeModal(){if(modalEl){modalEl.remove(); modalEl=null; try{lastFocus&&lastFocus.focus&&lastFocus.focus()}catch(e){}}}
function showTextBox(name,text){
  var m=modal('<h2>انسخ المحتوى</h2><p class="hint">تعذّر الحفظ كملف من هذه الصفحة. انسخ النص والصقه في ملف على جهازك باسم «'+esc(name)+'».</p><textarea class="inp" id="tb" readonly style="min-height:220px;direction:ltr;text-align:left"></textarea><div class="acts2"><button class="gbtn" type="button" id="tbCopy">'+ic('dl')+'نسخ</button><button class="sbtn" type="button" data-close>إغلاق</button></div>');
  $('#tb',m).value=text; $('#tb',m).select();
  $('#tbCopy',m).addEventListener('click',function(){copyText(text).then(function(ok){ if(ok){toast('تم النسخ'); if(/\.json$/.test(name)) PStore.markBackup()} else {$('#tb',m).select(); toast('حدّد النص وانسخه بالضغط على Ctrl+C')} })});
  $('[data-close]',m).addEventListener('click',closeModal);
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ if(modalEl) closeModal(); closeMenu() } });
var menuEl=null;
function closeMenu(){if(menuEl){menuEl.remove(); menuEl=null}}
function openMenu(anchor,items){
  closeMenu(); var m=document.createElement('div'); m.className='menu'; m.setAttribute('role','menu');
  items.forEach(function(it){var b=document.createElement('button'); b.type='button'; b.textContent=it.t; b.addEventListener('click',function(){closeMenu(); it.f()}); m.appendChild(b)});
  document.body.appendChild(m); var r=anchor.getBoundingClientRect(); var w=m.offsetWidth, h=m.offsetHeight;
  m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'; m.style.top=(r.bottom+6+h>innerHeight?Math.max(8,r.top-h-6):r.bottom+6)+'px'; menuEl=m;
  var f=$('button',m); if(f) f.focus();
  setTimeout(function(){document.addEventListener('mousedown',function h(e){ if(menuEl&&!menuEl.contains(e.target)){closeMenu()} document.removeEventListener('mousedown',h)})},0);
}

/* ---------- router and views ---------- */
var VIEWS=['home','classes','summary','student'], current='home', pending=null, ctx={classId:'',date:'',period:0,lesson:'',slide:0};
function go(v){ if(location.hash!=='#'+v){try{history.pushState(null,'','#'+v)}catch(e){location.hash=v}} route() }
function route(){
  var h=(location.hash||'#home').slice(1), L=BYHASH[h];
  if(L){ showLesson(L); return }
  hideLesson(); if(VIEWS.indexOf(h)<0) h='home'; current=h; showView(h);
}
function showView(v){
  $('#lv').classList.add('hide'); $('#pg').classList.remove('hide');
  VIEWS.forEach(function(k){$('#v-'+k).classList.toggle('hide',k!==v)});
  $$('[data-nav]').forEach(function(b){var k=b.getAttribute('data-nav'); b.classList.toggle('on',k===v||(k==='classes'&&v!=='home'))});
  $$('[data-sub]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-sub')===v)});
  var pal=v==='home'?'emerald':'gold', bg=v==='home'?'doodles':'hexes'; $('.app').setAttribute('data-pal',pal); BG.go(bg,pal,1);
  renderView(v); window.scrollTo(0,0);
}
function renderView(v){ ({home:renderHome,classes:renderClasses,summary:renderSummary,student:renderStudent})[v||current](); renderBanner() }

/* a banner for what must not be missed: data that can not be saved, or no backup for a long time */
function renderBanner(){
  var s=PStore.status(), d=D(), el=$('#banner'), has=d.classes.length>0, days=d.lastBackup?Math.floor((Date.now()-d.lastBackup)/864e5):null, h='';
  if(!s.persists) h='<div class="banner bad">هذا المتصفح لا يسمح بحفظ البيانات، فستضيع عند إغلاق الصفحة. صدّر نسخة احتياطية بعد كل حصة. <button class="sbtn mini" type="button" data-act="export">تصدير نسخة</button></div>';
  else if(s.error) h='<div class="banner bad">'+esc(s.error)+' <button class="sbtn mini" type="button" data-act="export">تصدير نسخة</button></div>';
  else if(has&&(days===null||days>=14)) h='<div class="banner">'+(days===null?'لم تحفظ نسخة احتياطية بعد.':'آخر نسخة احتياطية قبل '+ar(days)+' يوماً.')+' بياناتك محفوظة في هذا المتصفح فقط، فاحفظ نسخة في مكان آمن. <button class="sbtn mini" type="button" data-act="export">تصدير نسخة</button></div>';
  el.innerHTML=h;
}

/* ---- home: today's lessons and the curriculum ---- */
var course='';
function startLesson(classId,period){
  var lid=lessonFor(classId);
  if(lid){ pending={classId:classId,period:period||0}; go(LESSONS[lid].hash) }
  else { pending={classId:classId,period:period||0}; toast('اختر الدرس الذي تبدأ به من المقررات.'); go('home'); setTimeout(function(){var e=$('#cat'); if(e) e.scrollIntoView({behavior:'smooth'})},80) }
}
function renderHome(){
  var d=D(), today=PL.todayISO(), list=PL.todayList(d,today), h='';
  if(!d.classes.length){
    h='<div class="glass empty"><b class="h2">ابدأ بإضافة شعبتك</b><p>الصق أسماء طلابك مرة واحدة، فتجد لوحة الصف جاهزة داخل كل درس. تقدر أيضاً تستورد نسخة من موقع «الإدارة الصفية» القديم.</p><div class="row"><button class="gbtn" type="button" data-act="newclass">'+ic('plus')+'إضافة شعبة</button><button class="sbtn" type="button" data-act="import">'+ic('up2')+'استيراد نسخة</button></div></div>';
  } else if(list.length){
    h=list.map(function(t){var c=PL.findClass(d,t.classId), lid=lessonFor(t.classId), L=lid&&LESSONS[lid];
      return '<div class="glass tcard"><div class="pn">الحصة '+ar(t.period)+'</div><div class="cl">'+lat(c.name)+'</div><div class="lsn">'+(L?'الدرس '+esc(lessonTitle(lid)):'لم تحدّد درساً لهذه الشعبة بعد')+'</div><div><button class="gbtn" type="button" data-start="'+c.id+'" data-per="'+t.period+'">'+ic('play')+(L?'ابدأ الحصة':'اختر درساً')+'</button></div></div>'}).join('');
  } else {
    h='<div class="glass empty"><b class="h2">'+(PL.dayIndex(today)<0?'اليوم إجازة':'لا حصص في جدولك اليوم')+'</b><p>تقدر تبدأ حصة لأي شعبة مباشرة، أو تضع جدولك الأسبوعي من «سجل المعلم» فتظهر حصصك هنا كل يوم.</p><div class="row">'+d.classes.map(function(c){return '<button class="gbtn" type="button" data-start="'+c.id+'" data-per="0">'+ic('play')+'ابدأ حصة '+lat(c.name)+'</button>'}).join('')+'<button class="sbtn" type="button" data-nav2="classes">الجدول الأسبوعي</button></div></div>';
  }
  $('#today').innerHTML=h;
  $('#todayT').textContent=d.classes.length&&list.length?'حصصك اليوم':'مرحباً بك';
  if(!course||!CATALOG.courses[course]) course=d.ui.course&&CATALOG.courses[d.ui.course]?d.ui.course:COURSE_IDS[0];
  $('#cchips').innerHTML=COURSE_IDS.map(function(id){var c=CATALOG.courses[id],tot=0,b=0; c.units.forEach(function(u){u.lessons.forEach(function(l){tot++; if(l.page)b++})}); return '<button class="pill'+(id===course?' on':'')+'" type="button" data-c="'+id+'">'+courseLabel(id)+' <small style="opacity:.75">'+ar(b)+'/'+ar(tot)+'</small></button>'}).join('');
  var c=CATALOG.courses[course], tot=0, built=0; c.units.forEach(function(u){u.lessons.forEach(function(l){tot++; if(l.page)built++})});
  $('#cprog').innerHTML='<span>'+ar(built)+' من '+ar(tot)+' درساً جاهزاً</span><div class="bar"><i style="width:'+Math.round(built/tot*100)+'%"></i></div>';
  $('#units').innerHTML=c.units.map(function(u){
    var parts=u.title.split(':'), nm=parts[0].trim(), tt=(parts[1]||parts[0]).trim(), nb=u.lessons.filter(function(l){return l.page}).length;
    return '<div class="glass unit'+(nb?' open':'')+'"><button type="button" aria-expanded="'+(nb>0)+'"><span class="un">'+esc(nm)+'</span><span class="ut">'+esc(tt)+'</span><span class="tag">'+(u.sem===1?'الفصل الأول':'الفصل الثاني')+'</span><span class="tag'+(nb?' good':'')+'">'+ar(nb)+'/'+ar(u.lessons.length)+'</span><svg class="ic cv" viewBox="0 0 24 24">'+PATH.chev+'</svg></button><div class="lgrid">'+
     u.lessons.map(function(l){var cd=ar(l.code); return l.page?'<a class="lc built" href="#'+lessonHash(l.id)+'" data-open="'+l.id+'"><span class="cd">'+cd+'</span><span class="tt">'+esc(l.title)+'</span><span class="st">افتح الدرس ←</span></a>':'<div class="lc"><span class="cd">'+cd+'</span><span class="tt">'+esc(l.title)+'</span><span class="st">قريباً</span></div>'}).join('')+'</div></div>'}).join('');
}
