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
 chev:'<path d="m15 18-6-6 6-6"/>', chevr:'<path d="m9 18 6-6-6-6"/>', home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>', play:'<path d="m6 4 14 8-14 8z"/>', close:'<path d="M18 6 6 18M6 6l12 12"/>',
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
  var o={id:l.id,code:l.code,title:l.title,course:cid,unit:u.num,sem:u.sem,page:l.page||'',hash:l.page?lessonHash(l.id):''}; LESSONS[l.id]=o; if(o.hash) BYHASH[o.hash]=o }) }) });
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

/* ---------- router and views: home (grades) -> grade (subjects) -> course (units and lessons) -> the lesson ---------- */
var VIEWS=['home','grade','term','course','classes','summary','student'], current='home', nav={grade:0,subject:'',sem:1}, pending=null, ctx={classId:'',date:'',period:0,lesson:'',slide:0};
function gradeHash(g){return 'grade-'+g}
function courseHash(g,s){return 'grade-'+g+'-'+s}
function termHash(g,s,t){return 'grade-'+g+'-'+s+'-'+t}
function parentHash(){ if(current==='course') return courseHash(nav.grade,nav.subject); if(current==='term') return gradeHash(nav.grade); return 'home' }
function go(v){ if(location.hash!=='#'+v){try{history.pushState(null,'','#'+v)}catch(e){location.hash=v}} route() }
function route(){
  var h=(location.hash||'#home').slice(1), L=BYHASH[h], m;
  if(L){ showLesson(L); return }
  hideLesson();
  if((m=/^grade-(\d+)-([a-z]+)-([12])$/.exec(h))&&CATALOG.grades[m[1]]&&CATALOG.subjects[m[2]]){ nav.grade=+m[1]; nav.subject=m[2]; nav.sem=+m[3]; current='course' }
  else if((m=/^grade-(\d+)-([a-z]+)$/.exec(h))&&CATALOG.grades[m[1]]&&CATALOG.subjects[m[2]]){ nav.grade=+m[1]; nav.subject=m[2]; current='term' }
  else if((m=/^grade-(\d+)$/.exec(h))&&CATALOG.grades[m[1]]){ nav.grade=+m[1]; current='grade' }
  else { current=VIEWS.indexOf(h)>=0&&h!=='grade'&&h!=='course'&&h!=='term'?h:'home' }
  showView(current);
}
var PAL={home:'emerald',grade:'emerald',term:'emerald',course:'emerald',classes:'gold',summary:'gold',student:'gold'};
function showView(v){
  $('#lv').classList.add('hide'); $('#pg').classList.remove('hide');
  VIEWS.forEach(function(k){$('#v-'+k).classList.toggle('hide',k!==v)});
  $$('[data-nav]').forEach(function(b){var k=b.getAttribute('data-nav'); b.classList.toggle('on',k===v||(k==='classes'&&(v==='summary'||v==='student'))||(k==='home'&&(v==='grade'||v==='course')))});
  $$('[data-sub]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-sub')===v)});
  var pal=PAL[v]||'emerald', bg=PAL[v]==='gold'?'hexes':'doodles'; $('.app').setAttribute('data-pal',pal); BG.go(bg,pal,1);
  renderView(v); window.scrollTo(0,0);
}
function renderView(v){ ({home:renderHome,grade:renderGrade,term:renderTerm,course:renderCourse,classes:renderClasses,summary:renderSummary,student:renderStudent})[v||current](); renderBanner() }

/* a banner for what must not be missed: data that can not be saved, or no backup for a long time */
function renderBanner(){
  var s=PStore.status(), d=D(), el=$('#banner'), has=Object.keys(d.sessions).length>0, days=d.lastBackup?Math.floor((Date.now()-d.lastBackup)/864e5):null, h='';
  if(!s.persists) h='<div class="banner bad">هذا المتصفح لا يسمح بحفظ البيانات، فستضيع عند إغلاق الصفحة. صدّر نسخة احتياطية بعد كل حصة. <button class="sbtn mini" type="button" data-act="export">تصدير نسخة</button></div>';
  else if(s.error) h='<div class="banner bad">'+esc(s.error)+' <button class="sbtn mini" type="button" data-act="export">تصدير نسخة</button></div>';
  else if(has&&(days===null||days>=14)) h='<div class="banner">'+(days===null?'لم تحفظ نسخة احتياطية بعد.':'آخر نسخة احتياطية قبل '+ar(days)+' يوماً.')+' بياناتك محفوظة في هذا المتصفح فقط، فاحفظ نسخة في مكان آمن. <button class="sbtn mini" type="button" data-act="export">تصدير نسخة</button></div>';
  el.innerHTML=h;
}

/* ---- the pages of the curriculum: big cards, one choice per page ---- */
function courseId(g,s){return s+g}
function courseCounts(cid,sem){var c=CATALOG.courses[cid], tot=0, b=0; if(c) c.units.forEach(function(u){ if(sem&&u.sem!==sem) return; u.lessons.forEach(function(l){tot++; if(l.page) b++})}); return {tot:tot,built:b}}
function gradeCounts(g){var tot=0,b=0,subs=0; Object.keys(CATALOG.subjects).forEach(function(s){var k=courseCounts(courseId(g,s)); if(k.tot){subs++; tot+=k.tot; b+=k.built}}); return {tot:tot,built:b,subjects:subs}}
var GPAL={10:'emerald',11:'navy',12:'violet'}, SPAL={chem:'emerald',phys:'navy',bio:'ember',env:'violet'}, GSTK={10:'m_flask',11:'m_atom',12:'m_star'}, SSTK={chem:'m_flask',phys:'m_bulb',bio:'micro',env:'lens'};
function readyText(k){return k.built?ar(k.built)+' '+(k.built===1?'درس جاهز':(k.built>10?'درساً جاهزاً':'دروس جاهزة')):'قريباً'}
function countText(k){return k.built?readyText(k)+' من '+ar(k.tot):(k.tot?'قريباً · '+ar(k.tot)+' '+(k.tot>10?'درساً':'دروس'):'قريباً')}
function backBar(title,sub){return '<div class="backbar"><button class="sbtn big" type="button" data-back>'+ic('chevr')+'رجوع</button><div><h1 class="h1" style="font-size:42px">'+title+'</h1>'+(sub?'<p class="sub">'+sub+'</p>':'')+'</div></div>'}
function stk(name,css,w,r){return typeof STK!=='undefined'&&STK.has&&STK.has(name)!==false?STK.html(name,{css:css,w:w,r:r,d:.5,free:1}):''}

/* start a lesson for a class: its last lesson, else the first ready lesson of its course, else the page of that course to choose from */
function startLesson(classId,period){
  var lid=lessonFor(classId); pending={classId:classId,period:period||0};
  if(lid){ go(LESSONS[lid].hash); return }
  var cl=PL.findClass(D(),classId), m=cl&&/^([a-z]+)(\d+)$/.exec(cl.course||''); toast('اختر الدرس الذي تبدأ به.'); go(m?courseHash(m[2],m[1]):'home');
}
function renderHome(){
  var d=D(), today=PL.todayISO(), list=PL.todayList(d,today), h='';
  if(list.length){
    h+='<div class="glass strip"><b class="h2" style="font-size:24px">حصصك اليوم</b>'+list.map(function(t){var c=PL.findClass(d,t.classId), lid=lessonFor(t.classId);
      return '<button class="gbtn" type="button" data-start="'+esc(c.id)+'" data-per="'+t.period+'">'+ic('play')+'الحصة '+ar(t.period)+' · '+lat(c.name)+(lid?' · '+esc(ar(LESSONS[lid].code)):'')+'</button>'}).join('')+'</div>';
  } else if(!d.classes.length){
    h+='<div class="glass strip"><span class="hint" style="font-size:20px">أضف شعبتك لتسجيل مشاركة الطلاب داخل الدروس.</span><button class="sbtn" type="button" data-act="newclass">'+ic('plus')+'إضافة شعبة</button><button class="sbtn" type="button" data-act="import">'+ic('up2')+'استيراد نسخة</button></div>';
  } else if(PL.dayIndex(today)<0){ h+='<div class="glass strip"><span class="hint" style="font-size:20px">اليوم إجازة.</span>'+d.classes.map(function(c){return '<button class="sbtn" type="button" data-start="'+esc(c.id)+'" data-per="0">'+ic('play')+'ابدأ حصة '+lat(c.name)+'</button>'}).join('')+'</div>' }
  h+='<div class="bigcards three">'+Object.keys(CATALOG.grades).map(function(g){var k=gradeCounts(g);
    return '<a class="bcard" href="#'+gradeHash(g)+'" data-pal="'+(GPAL[g]||'emerald')+'" data-pick="'+(GPAL[g]||'emerald')+'"><span class="bnum">'+ar(g)+'</span><span class="bname">'+esc(CATALOG.grades[g].replace(/^الصف\s*/,''))+'</span><span class="bmeta">'+(k.subjects?ar(k.subjects)+' '+(k.subjects>2?'مواد':'مادة')+' · '+readyText(k):'قريباً')+'</span>'+stk(GSTK[g]||'m_star','left:14px;top:-34px;',104,-6)+'</a>'}).join('')+
   '</div><a class="bcard wide" href="#classes" data-pal="gold" data-pick="gold"><span class="bnum">'+ic('users')+'</span><span><span class="bname" style="display:block">سجل المعلم</span><span class="bmeta">شعبي · ملخص الشعبة · تقرير الطالب</span></span></a>';
  $('#v-home').innerHTML='<header class="hero" style="position:relative"><h1 class="h1">اختر <b>الصف</b></h1><p class="sub">ثم المادة، ثم الدرس، فيفتح الشرح مباشرة</p><div class="hrule"></div></header>'+h;
  $$('#v-home [data-pick]').forEach(function(c){c.addEventListener('mouseenter',function(){$('.app').setAttribute('data-pal',c.getAttribute('data-pick')); BG.go('doodles',c.getAttribute('data-pick'),1)})});
}
function renderGrade(){
  var g=nav.grade, name=CATALOG.grades[g];
  var cards=Object.keys(CATALOG.subjects).map(function(s){var cid=courseId(g,s), k=courseCounts(cid), s0=CATALOG.subjects[s];
    var body='<span class="bname">'+esc(s0.name)+'</span><span class="bmeta">'+countText(k)+'</span>'+(k.tot?'<span class="bar"><i style="width:'+Math.round(k.built/k.tot*100)+'%"></i></span>':'')+stk(SSTK[s]||'m_star','left:14px;top:-34px;',100,-6);
    return k.tot?'<a class="bcard sub2" href="#'+courseHash(g,s)+'" data-pal="'+(SPAL[s]||'emerald')+'" data-pick="'+(SPAL[s]||'emerald')+'">'+body+'</a>':'<div class="bcard sub2 soon" data-pal="'+(SPAL[s]||'emerald')+'">'+body+'</div>'}).join('');
  $('#v-grade').innerHTML=backBar('الصف '+esc(name),'اختر المادة')+'<div class="bigcards two">'+cards+'</div>';
}
function renderTerm(){
  var g=nav.grade, s=nav.subject, cid=courseId(g,s), c=CATALOG.courses[cid], title=esc(CATALOG.subjects[s].name)+' · الصف '+esc(CATALOG.grades[g]);
  if(!c){ $('#v-term').innerHTML=backBar(title,'')+'<div class="glass empty"><p>لا توجد دروس لهذه المادة بعد.</p></div>'; return }
  var cards=[1,2].map(function(t){var k=courseCounts(cid,t), pal=t===1?'emerald':'navy',
    body='<span class="bnum">'+ar(t)+'</span><span class="bname">'+(t===1?'الفصل الأول':'الفصل الثاني')+'</span><span class="bmeta">'+countText(k)+'</span>'+(k.tot?'<span class="bar"><i style="width:'+Math.round(k.built/k.tot*100)+'%"></i></span>':'');
    return k.tot?'<a class="bcard sub2" href="#'+termHash(g,s,t)+'" data-pal="'+pal+'" data-pick="'+pal+'">'+body+'</a>':'<div class="bcard sub2 soon" data-pal="'+pal+'">'+body+'</div>'}).join('');
  $('#v-term').innerHTML=backBar(title,'اختر الفصل الدراسي')+'<div class="bigcards two">'+cards+'</div>';
}
function renderCourse(){
  var g=nav.grade, s=nav.subject, t=nav.sem, cid=courseId(g,s), c=CATALOG.courses[cid], k=courseCounts(cid,t), title=esc(CATALOG.subjects[s].name)+' · الصف '+esc(CATALOG.grades[g])+' · '+(t===1?'الفصل الأول':'الفصل الثاني');
  if(!c||!k.tot){ $('#v-course').innerHTML=backBar(title,'')+'<div class="glass empty"><p>لا توجد دروس في هذا الفصل بعد.</p></div>'; return }
  var h=backBar(title,ar(k.built)+' من '+ar(k.tot)+' درساً جاهزاً');
  h+='<div id="units" style="display:flex;flex-direction:column;gap:16px">'+c.units.filter(function(u){return u.sem===t}).map(function(u){
    var parts=u.title.split(':'), nm=parts[0].trim(), tt=(parts[1]||parts[0]).trim(), nb=u.lessons.filter(function(l){return l.page}).length;
    return '<div class="glass unit'+(nb?' open':'')+'"><button type="button" aria-expanded="'+(nb>0)+'"><span class="un">'+esc(nm)+'</span><span class="ut">'+esc(tt)+'</span><span class="tag'+(nb?' good':'')+'">'+(nb?ar(nb)+' من '+ar(u.lessons.length)+' جاهزة':'قريباً')+'</span><svg class="ic cv" viewBox="0 0 24 24">'+PATH.chev+'</svg></button><div class="lgrid">'+
     u.lessons.map(function(l){var cd=ar(l.code); return l.page?'<a class="lc built" href="#'+lessonHash(l.id)+'"><span class="cd">'+cd+'</span><span class="tt">'+esc(l.title)+'</span><span class="st">افتح الشرح ←</span></a>':'<div class="lc"><span class="cd">'+cd+'</span><span class="tt">'+esc(l.title)+'</span><span class="st">قريباً</span></div>'}).join('')+'</div></div>'}).join('')+'</div>';
  $('#v-course').innerHTML=h;
}
