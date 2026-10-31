/* ---------- platform logic: pure functions, no page and no storage in here, so they can be tested alone ----------
   Rules follow the participation-and-behaviour model of the earlier record system:
   - a student's state in a session is: not recorded (no entry) -> did not participate (0) -> participated n times;
   - participation rate = sessions with participation / sessions whose participation was recorded (a session with only a behaviour record is not counted against the student);
   - flags are prompts for follow-up, not judgements. */
var PL=(function(){
'use strict';
var LIM={name:120, reason:80, note:500, maxStudents:150, maxClasses:40, maxPart:50, maxRecs:500, maxLessons:12};
var FLAGS={minSessions:4, lowRate:25, concernNeg:3};
var KINDS=['positive','negative','note'];
var REASONS={
  positive:['مشاركة متميزة','تعاون مع زملائه','مساعدة زميل','التزام بالهدوء والنظام','مبادرة وحماس','أداء الواجب بإتقان','احترام المعلم والزملاء','قيادة مجموعته'],
  negative:['حديث جانبي','عدم إحضار الكتاب أو الأدوات','عدم أداء الواجب','إزعاج الزملاء','استخدام الجوال','خروج من الصف دون إذن','عدم الانتباه','عدم احترام المعلم أو الزملاء','مشاجرة'],
  note:['يحتاج إلى متابعة','تحسّن ملحوظ','يحتاج إلى مساعدة في الفهم','تواصل مع ولي الأمر','ظروف خاصة']};
var BIDI=/[‎‏‪-‮⁦-⁩]/g, CTRL=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F￾￿]/g;
var LESSON_ID=/^[a-z]+\d+:[\w~-]{1,20}$/, ID_OK=/^[\w-]{1,48}$/, BAD_IDS={__proto__:1,constructor:1,prototype:1,tostring:1,valueof:1,hasownproperty:1};
var seq=0;
function idOk(s){return typeof s==='string'&&ID_OK.test(s)&&!BAD_IDS[s.toLowerCase()]}
function uid(p){
  seq=(seq+1)%1679616; var r='';
  try{var a=new Uint32Array(2); (typeof crypto!=='undefined'?crypto:require('crypto').webcrypto).getRandomValues(a); r=a[0].toString(36)+a[1].toString(36)}catch(e){r=Math.random().toString(36).slice(2)}
  return p+Date.now().toString(36).slice(-5)+seq.toString(36)+r.slice(0,6);
}
function str(v){try{return String(v==null?'':v)}catch(e){return ''}}
function clean(s,n){return str(s).replace(BIDI,'').replace(CTRL,'').replace(/\s+/g,' ').trim().slice(0,n).replace(/[\uD800-\uDBFF]$/,'').trim()}
function cleanText(s,n){return str(s).replace(BIDI,'').replace(CTRL,'').replace(/\r\n?/g,'\n').replace(/[ \t]+\n/g,'\n').trim().slice(0,n).replace(/[\uD800-\uDBFF]$/,'').trim()}
/* Arabic search: no diacritics or tatweel, one form of alef, ya and ta marbuta, Latin digits */
function normAr(s){return str(s).toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[آأإٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/\s+/g,' ').trim()}
function round1(x){return Math.round(x*10)/10}

/* ---------- dates ---------- */
function pad(n){return n<10?'0'+n:''+n}
function todayISO(d){d=d||new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function validDate(s){
  s=str(s); if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  var p=s.split('-').map(Number), t=new Date(Date.UTC(p[0],p[1]-1,p[2]));
  return t.getUTCFullYear()===p[0]&&t.getUTCMonth()===p[1]-1&&t.getUTCDate()===p[2]&&p[0]>=2000&&p[0]<=2100;
}
/* school week: Sunday=0 ... Thursday=4; Friday and Saturday are not teaching days (-1) */
function dayIndex(iso){var p=iso.split('-').map(Number), g=new Date(p[0],p[1]-1,p[2]).getDay(); return g<=4?g:-1}
function addDays(iso,n){var p=iso.split('-').map(Number), d=new Date(p[0],p[1]-1,p[2]+n); return todayISO(d)}

/* ---------- state ---------- */
function emptyState(){return {v:1, classes:[], timetable:[], sessions:{}, ui:{hideBehavior:false, course:'chem10', lastClass:'', lastLesson:{}}, updated:0, lastBackup:0}}
function findClass(st,id){for(var i=0;i<st.classes.length;i++) if(st.classes[i].id===id) return st.classes[i]; return null}
function findStudent(cls,sid){if(!cls) return null; for(var i=0;i<cls.students.length;i++) if(cls.students[i].id===sid) return cls.students[i]; return null}
function skey(classId,date,period){return classId+'|'+date+'|'+(period||0)}

/* names pasted one per line: numbering and bullets are dropped, repeats are ignored */
function parseNames(text){
  var out=[], seen={}, dups=0, over=0;
  str(text).split(/\r?\n/).forEach(function(line){
    var n=clean(line.replace(/^\s*(?:[\d٠-٩]+\s*[.\-)،:،]+\s*|[-•*·]+\s*)/,'').replace(/\t+/g,' '),LIM.name);
    if(!n) return; var k=normAr(n);
    if(seen[k]){dups++; return} seen[k]=1;
    if(out.length>=LIM.maxStudents){over++; return}
    out.push(n);
  });
  return {names:out, dups:dups, over:over};
}

/* ---------- classes and timetable (mutate the state they are given) ---------- */
function addClass(st,o){
  var name=clean(o&&o.name,40); if(!name) return {error:'اكتب اسم الشعبة'};
  if(st.classes.length>=LIM.maxClasses) return {error:'وصلت الحد الأقصى للشعب'};
  var nm=normAr(name); for(var i=0;i<st.classes.length;i++) if(normAr(st.classes[i].name)===nm) return {error:'يوجد شعبة بهذا الاسم'};
  var p=parseNames(o.names||''), cls={id:uid('c'), name:name, course:/^[a-z]+\d+$/.test(str(o.course))?o.course:'', students:p.names.map(function(n){return {id:uid('s'),name:n}})};
  st.classes.push(cls); st.ui.lastClass=cls.id; return {cls:cls, dups:p.dups, over:p.over};
}
function addStudents(st,classId,text){
  var cls=findClass(st,classId); if(!cls) return {error:'الشعبة غير موجودة'};
  var have={}; cls.students.forEach(function(s){have[normAr(s.name)]=1});
  var p=parseNames(text), added=0, dups=p.dups;
  p.names.forEach(function(n){ if(have[normAr(n)]){dups++; return} if(cls.students.length>=LIM.maxStudents) return; cls.students.push({id:uid('s'),name:n}); have[normAr(n)]=1; added++ });
  return {added:added, dups:dups};
}
function renameStudent(st,classId,sid,name){var s=findStudent(findClass(st,classId),sid), n=clean(name,LIM.name); if(!s||!n) return false; s.name=n; return true}
function removeStudent(st,classId,sid){
  var cls=findClass(st,classId); if(!findStudent(cls,sid)) return false;
  cls.students=cls.students.filter(function(s){return s.id!==sid});
  Object.keys(st.sessions).forEach(function(k){var s=st.sessions[k]; if(s.classId!==classId) return; delete s.part[sid]; s.recs=s.recs.filter(function(r){return r.sid!==sid}); prune(st,k)});
  return true;
}
function renameClass(st,id,name){var c=findClass(st,id), n=clean(name,40); if(!c||!n) return false; c.name=n; return true}
function removeClass(st,id){
  if(!findClass(st,id)) return false;
  st.classes=st.classes.filter(function(c){return c.id!==id}); st.timetable=st.timetable.filter(function(t){return t.classId!==id});
  Object.keys(st.sessions).forEach(function(k){if(st.sessions[k].classId===id) delete st.sessions[k]});
  delete st.ui.lastLesson[id]; if(st.ui.lastClass===id) st.ui.lastClass=st.classes.length?st.classes[0].id:''; return true;
}
function setLastLesson(st,classId,lessonId){ if(findClass(st,classId)&&LESSON_ID.test(str(lessonId))){st.ui.lastLesson[classId]=lessonId; return true} return false }
function setSlot(st,day,period,classId){
  if(!(day>=0&&day<=4&&period>=1&&period<=8)) return false;
  st.timetable=st.timetable.filter(function(t){return !(t.day===day&&t.period===period)});
  if(classId){ if(!findClass(st,classId)) return false; st.timetable.push({day:day,period:period,classId:classId}) }
  return true;
}
/* the lessons of a school day, in period order */
function todayList(st,iso){
  var d=dayIndex(iso); if(d<0) return [];
  return st.timetable.filter(function(t){return t.day===d&&findClass(st,t.classId)}).sort(function(a,b){return a.period-b.period});
}

/* ---------- sessions ---------- */
function prune(st,k){var s=st.sessions[k]; if(s&&!Object.keys(s.part).length&&!s.recs.length) delete st.sessions[k]}
function getSession(st,ctx,create){
  var k=skey(ctx.classId,ctx.date,ctx.period), s=st.sessions[k];
  if(!s&&create) s=st.sessions[k]={classId:ctx.classId, date:ctx.date, period:ctx.period||0, lessons:[], part:{}, recs:[]};
  return s||null;
}
function ctxOk(st,ctx){return !!(ctx&&findClass(st,ctx.classId)&&validDate(ctx.date)&&ctx.date<=todayISO()&&(!ctx.period||(ctx.period>=1&&ctx.period<=LIM.maxLessons)))}
function touchLesson(s,ctx){if(ctx.lesson&&s.lessons.indexOf(ctx.lesson)<0&&s.lessons.length<LIM.maxLessons) s.lessons.push(ctx.lesson)}
/* n: null = not recorded, 0 = did not participate, 1.. = participated n times. Returns the stored value. */
function setPart(st,ctx,sid,n){
  if(!ctxOk(st,ctx)||!findStudent(findClass(st,ctx.classId),sid)) return undefined;
  var k=skey(ctx.classId,ctx.date,ctx.period);
  if(n===null||n===undefined){var s0=st.sessions[k]; if(s0){delete s0.part[sid]; prune(st,k)} return null}
  n=Math.floor(Number(n)); if(!(n>=0)) return undefined; n=Math.min(n,LIM.maxPart);
  var s=getSession(st,ctx,true); s.part[sid]=n; touchLesson(s,ctx); return n;
}
function addRec(st,ctx,sid,kind,reason,note){
  if(!ctxOk(st,ctx)||KINDS.indexOf(kind)<0||!findStudent(findClass(st,ctx.classId),sid)) return null;
  var r=clean(reason,LIM.reason), t=cleanText(note,LIM.note); if(!r&&!t) return null;
  var s=getSession(st,ctx,true); if(s.recs.length>=LIM.maxRecs) return null;
  var rec={id:uid('r'), sid:sid, kind:kind, reason:r, note:t}; s.recs.push(rec); touchLesson(s,ctx); return rec;
}
function delRec(st,ctx,rid){
  var k=skey(ctx.classId,ctx.date,ctx.period), s=st.sessions[k]; if(!s) return false;
  var n=s.recs.length; s.recs=s.recs.filter(function(r){return r.id!==rid}); prune(st,k); return s.recs.length!==n||!st.sessions[k];
}
/* "did not participate" for everyone not recorded yet; students already recorded are not touched */
function markRest(st,ctx){
  if(!ctxOk(st,ctx)) return 0; var cls=findClass(st,ctx.classId), s=getSession(st,ctx,true), n=0;
  cls.students.forEach(function(x){ if(s.part[x.id]===undefined){s.part[x.id]=0; n++} });
  touchLesson(s,ctx); prune(st,skey(ctx.classId,ctx.date,ctx.period)); return n;
}
function clearSession(st,ctx){var k=skey(ctx.classId,ctx.date,ctx.period); if(!st.sessions[k]) return false; delete st.sessions[k]; return true}

/* the state of one session as the drawer shows it */
function sessionView(st,ctx){
  var cls=findClass(st,ctx.classId); if(!cls) return null; var s=getSession(st,ctx,false)||{part:{},recs:[],lessons:[]}, tot={students:cls.students.length,participating:0,didNot:0,unrecorded:0,participations:0};
  var rows=cls.students.map(function(x){
    var n=s.part[x.id]===undefined?null:s.part[x.id], recs=s.recs.filter(function(r){return r.sid===x.id});
    if(n===null) tot.unrecorded++; else if(n===0) tot.didNot++; else {tot.participating++; tot.participations+=n}
    return {student:x, n:n, recs:recs, before:countsBefore(st,ctx,x.id)};
  });
  return {cls:cls, rows:rows, totals:tot};
}
/* what was recorded for the student in this class before this session (never changes with what is recorded now) */
function countsBefore(st,ctx,sid){
  var p=0,z=0, cur=skey(ctx.classId,ctx.date,ctx.period);
  Object.keys(st.sessions).forEach(function(k){
    var s=st.sessions[k]; if(s.classId!==ctx.classId||k===cur) return;
    if(s.date>ctx.date||(s.date===ctx.date&&(s.period||0)>=(ctx.period||0))) return;
    if(s.part[sid]===undefined) return; if(s.part[sid]>0) p++; else z++;
  });
  return {participated:p, recorded:p+z};
}

/* ---------- counts, flags, summary, report ---------- */
function inRange(date,r){return !r||((!r.from||date>=r.from)&&(!r.to||date<=r.to))}
function rateOf(p,z){var t=p+z; return t>0?round1(p/t*100):null}
function studentCounts(st,classId,sid,range){
  var c={sessions:0,participatedSessions:0,noParticipationSessions:0,participations:0,positive:0,negative:0,notes:0,rate:null};
  Object.keys(st.sessions).forEach(function(k){
    var s=st.sessions[k]; if(s.classId!==classId||!inRange(s.date,range)) return; var any=false;
    if(s.part[sid]!==undefined){any=true; if(s.part[sid]>0) c.participatedSessions++; else c.noParticipationSessions++; c.participations+=s.part[sid]}
    s.recs.forEach(function(r){ if(r.sid!==sid) return; any=true; if(r.kind==='positive') c.positive++; else if(r.kind==='negative') c.negative++; else c.notes++ });
    if(any) c.sessions++;
  });
  c.rate=rateOf(c.participatedSessions,c.noParticipationSessions); return c;
}
function flagsOf(c){
  var f=[], rec=c.participatedSessions+c.noParticipationSessions;
  if(c.participatedSessions===0&&c.noParticipationSessions>=FLAGS.minSessions) f.push('silent');
  else if(c.rate!==null&&rec>=FLAGS.minSessions&&c.rate<FLAGS.lowRate) f.push('low');
  if(c.negative>=FLAGS.concernNeg) f.push('concern');
  return f;
}
var FLAG_TEXT={silent:'لم يشارك مطلقاً', low:'قليل المشاركة', concern:'ملاحظات غير حسنة كثيرة'};
function flagHint(f,c){
  if(f==='silent') return 'لم يشارك في أي من '+c.noParticipationSessions+' حصص سُجّلت مشاركتها';
  if(f==='low') return 'شارك في '+c.participatedSessions+' من '+(c.participatedSessions+c.noParticipationSessions)+' حصص سُجّلت مشاركتها';
  return c.negative+' تسجيلات «غير حسن» في الفترة';
}
function classSummary(st,classId,range){
  var cls=findClass(st,classId); if(!cls) return null;
  var rows=cls.students.map(function(x){var c=studentCounts(st,classId,x.id,range); return {student:x, counts:c, flags:flagsOf(c)}});
  var sess={}; Object.keys(st.sessions).forEach(function(k){var s=st.sessions[k]; if(s.classId===classId&&inRange(s.date,range)) sess[k]=1});
  var t={participated:0,noPart:0,positive:0,negative:0,notes:0,participations:0};
  rows.forEach(function(r){t.participated+=r.counts.participatedSessions; t.noPart+=r.counts.noParticipationSessions; t.positive+=r.counts.positive; t.negative+=r.counts.negative; t.notes+=r.counts.notes; t.participations+=r.counts.participations});
  return {cls:cls, rows:rows, sessions:Object.keys(sess).length, total:{participatedSessions:t.participated,noParticipationSessions:t.noPart,positive:t.positive,negative:t.negative,notes:t.notes,participations:t.participations,rate:rateOf(t.participated,t.noPart)}};
}
function studentReport(st,classId,sid,range){
  var cls=findClass(st,classId), stu=findStudent(cls,sid); if(!stu) return null;
  var c=studentCounts(st,classId,sid,range), sum=classSummary(st,classId,range), reasons={positive:{},negative:{},note:{}}, tl=[];
  Object.keys(st.sessions).forEach(function(k){
    var s=st.sessions[k]; if(s.classId!==classId||!inRange(s.date,range)) return;
    var recs=s.recs.filter(function(r){return r.sid===sid}), n=s.part[sid]===undefined?null:s.part[sid];
    if(n===null&&!recs.length) return;
    recs.forEach(function(r){var m=reasons[r.kind], key=r.reason||'ملاحظة'; m[key]=(m[key]||0)+1});
    tl.push({key:k, date:s.date, period:s.period||0, lessons:s.lessons.slice(), n:n, recs:recs});
  });
  tl.sort(function(a,b){return a.date!==b.date?(a.date<b.date?1:-1):(b.period-a.period)});
  return {student:stu, cls:cls, counts:c, flags:flagsOf(c), classRate:sum.total.rate, reasons:reasons, timeline:tl};
}
function csvCell(v){v=str(v); return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function summaryCSV(sum){
  var head=['الطالب','حصص مسجّلة','شارك في','لم يشارك في','مرات المشاركة','نسبة المشاركة %','سلوك إيجابي','سلوك غير حسن','ملاحظات','تنبيه'];
  var lines=[head].concat(sum.rows.map(function(r){var c=r.counts; return [r.student.name,c.sessions,c.participatedSessions,c.noParticipationSessions,c.participations,c.rate===null?'':c.rate,c.positive,c.negative,c.notes,r.flags.map(function(f){return FLAG_TEXT[f]}).join('، ')]}));
  return '﻿'+lines.map(function(l){return l.map(csvCell).join(',')}).join('\r\n');
}
function reportText(rep,lessonTitle){
  var c=rep.counts, L=['تقرير الطالب: '+rep.student.name+' · شعبة '+rep.cls.name, '',
   'حصص مسجّلة: '+c.sessions, 'شارك في '+c.participatedSessions+' ولم يشارك في '+c.noParticipationSessions+(c.rate===null?'':' (نسبة المشاركة '+c.rate+'% مقابل '+(rep.classRate===null?'—':rep.classRate+'%')+' متوسط الشعبة)'),
   'سلوك إيجابي: '+c.positive+' · غير حسن: '+c.negative+' · ملاحظات: '+c.notes, ''];
  rep.timeline.forEach(function(e){
    var ls=e.lessons.map(function(l){return lessonTitle?lessonTitle(l):l}).filter(Boolean).join('، ');
    L.push(e.date+(ls?' · '+ls:'')+' · '+(e.n===null?'لم تُسجَّل مشاركة':(e.n===0?'لم يشارك':'شارك ×'+e.n))+e.recs.map(function(r){return ' · '+({positive:'إيجابي',negative:'غير حسن',note:'ملاحظة'})[r.kind]+': '+(r.reason||r.note)}).join(''));
  });
  return L.join('\n');
}

/* ---------- backup: every value is rebuilt from scratch and checked, nothing from the file is trusted as is ---------- */
function normalizeState(d){
  var st=emptyState(), warn=0; if(!d||typeof d!=='object'||Array.isArray(d)) throw new Error('الملف ليس نسخة احتياطية صالحة');
  var cids={};
  (Array.isArray(d.classes)?d.classes:[]).slice(0,LIM.maxClasses).forEach(function(c){
    if(!c||!idOk(c.id)||cids[c.id]){warn++; return}
    var name=clean(c.name,40); if(!name){warn++; return}
    var sids={}, studs=[];
    (Array.isArray(c.students)?c.students:[]).slice(0,LIM.maxStudents).forEach(function(s){ if(!s||!idOk(s.id)||sids[s.id]){warn++; return} var n=clean(s.name,LIM.name); if(!n){warn++; return} sids[s.id]=1; studs.push({id:s.id,name:n}) });
    cids[c.id]=sids; st.classes.push({id:c.id,name:name,course:/^[a-z]+\d+$/.test(str(c.course))?c.course:'',students:studs});
  });
  (Array.isArray(d.timetable)?d.timetable:[]).forEach(function(t){ if(t&&cids[t.classId]&&t.day>=0&&t.day<=4&&t.period>=1&&t.period<=8&&!st.timetable.some(function(x){return x.day===t.day&&x.period===t.period})) st.timetable.push({day:t.day|0,period:t.period|0,classId:t.classId}); else warn++ });
  var src=d.sessions&&typeof d.sessions==='object'&&!Array.isArray(d.sessions)?d.sessions:{};
  Object.keys(src).slice(0,5000).forEach(function(k){
    var s=src[k]; if(!s||!cids[s.classId]||!validDate(s.date)){warn++; return}
    var per=s.period>=1&&s.period<=LIM.maxLessons?s.period|0:0, key=skey(s.classId,s.date,per), out={classId:s.classId,date:s.date,period:per,lessons:[],part:{},recs:[]}, sids=cids[s.classId];
    (Array.isArray(s.lessons)?s.lessons:[]).slice(0,LIM.maxLessons).forEach(function(l){ if(typeof l==='string'&&/^[\w:~-]{1,40}$/.test(l)) out.lessons.push(l) });
    var part=s.part&&typeof s.part==='object'?s.part:{};
    Object.keys(part).forEach(function(sid){ var n=Math.floor(Number(part[sid])); if(sids[sid]&&n>=0) out.part[sid]=Math.min(n,LIM.maxPart); else warn++ });
    (Array.isArray(s.recs)?s.recs:[]).slice(0,LIM.maxRecs).forEach(function(r){
      if(!r||!sids[r.sid]||KINDS.indexOf(r.kind)<0||!idOk(r.id)){warn++; return}
      var re=clean(r.reason,LIM.reason), no=cleanText(r.note,LIM.note); if(!re&&!no){warn++; return}
      out.recs.push({id:r.id,sid:r.sid,kind:r.kind,reason:re,note:no});
    });
    if(Object.keys(out.part).length||out.recs.length) st.sessions[key]=out;
  });
  var u=d.ui||{}; if(u.lastLesson&&typeof u.lastLesson==='object') Object.keys(u.lastLesson).forEach(function(c){ if(cids[c]&&LESSON_ID.test(str(u.lastLesson[c]))) st.ui.lastLesson[c]=u.lastLesson[c] }); st.ui.hideBehavior=u.hideBehavior===true; st.ui.course=/^[a-z]+\d+$/.test(str(u.course))?u.course:'chem10'; st.ui.lastClass=cids[u.lastClass]?u.lastClass:(st.classes[0]?st.classes[0].id:'');
  st.updated=Number(d.updated)>0?Number(d.updated):0; st.lastBackup=Number(d.lastBackup)>0?Number(d.lastBackup):0;
  return {state:st, warnings:warn};
}
function exportBackup(st){return JSON.stringify({app:'teacher-platform', v:1, exportedAt:new Date().toISOString(), data:st})}
/* the backup file of the earlier classroom site: {app:'chem10-smart-planner-class', classroom:{groups, order, sessions, tt}}.
   A session there is (class, lesson key, date); here it is (class, date, period) with the lesson kept inside, so two lessons of one day in one class become one session. */
function fromLegacy(raw){
  var d=raw&&raw.classroom?raw.classroom:raw, groups=d&&d.groups&&typeof d.groups==='object'?d.groups:{}, order=Array.isArray(d.order)?d.order:Object.keys(groups), classes=[], seen={};
  order.concat(Object.keys(groups)).forEach(function(id){ var g=groups[id]; if(!g||seen[id]) return; seen[id]=1; classes.push({id:str(g.id||id), name:g.name, course:g.course, students:Array.isArray(g.students)?g.students.map(function(s){return {id:s&&s.id,name:s&&s.name}}):[]}) });
  var tt=[], slots=d.tt&&d.tt.slots&&typeof d.tt.slots==='object'?d.tt.slots:{};
  Object.keys(slots).forEach(function(k){var m=/^([0-6])\|(\d{1,2})$/.exec(k); if(m&&slots[k]&&slots[k].gid) tt.push({day:+m[1],period:+m[2],classId:str(slots[k].gid)})});
  var sess={}, src=d.sessions&&typeof d.sessions==='object'?d.sessions:{};
  Object.keys(src).forEach(function(k){
    var s=src[k]; if(!s||!s.gid||!validDate(s.date)) return;
    var g=groups[s.gid], course=g&&g.course?g.course:'chem10', lesson=typeof s.lesson==='string'&&s.lesson?(s.lesson.indexOf('~')>0?s.lesson.replace('~',':'):course+':'+s.lesson):'';
    var key=skey(str(s.gid),s.date,0), t=sess[key]||(sess[key]={classId:str(s.gid),date:s.date,period:0,lessons:[],part:{},recs:[]});
    if(lesson&&t.lessons.indexOf(lesson)<0) t.lessons.push(lesson);
    var part=s.part&&typeof s.part==='object'?s.part:{}; Object.keys(part).forEach(function(sid){var n=Math.floor(Number(part[sid])); if(n>=0) t.part[sid]=t.part[sid]===undefined?n:Math.max(t.part[sid],n)});
    (Array.isArray(s.recs)?s.recs:[]).forEach(function(r){ if(r) t.recs.push({id:r.id,sid:r.st,kind:r.kind,reason:r.reason,note:r.note}) });
  });
  return normalizeState({classes:classes, timetable:tt, sessions:sess, ui:{}});
}
function parseBackup(text){
  var o; try{o=JSON.parse(str(text))}catch(e){throw new Error('الملف ليس نسخة احتياطية صالحة')}
  if(!o||typeof o!=='object'||Array.isArray(o)) throw new Error('الملف ليس نسخة احتياطية صالحة');
  if(o.app==='chem10-smart-planner-class'||(!o.app&&(o.classroom||(o.groups&&typeof o.groups==='object'&&!Array.isArray(o.groups))))){var r=fromLegacy(o); r.legacy=true; return r}
  if(o.app&&o.app!=='teacher-platform') throw new Error('هذه النسخة من برنامج آخر');
  return normalizeState(o.data?o.data:o);
}
/* import adds to what is there: classes whose id is already present are skipped, nothing is overwritten or deleted */
function mergeInto(st,other){
  var have={}; st.classes.forEach(function(c){have[c.id]=1}); var added=0, skipped=0;
  other.classes.forEach(function(c){ if(have[c.id]){skipped++; return} if(st.classes.length>=LIM.maxClasses){skipped++; return} st.classes.push(c); added++ });
  other.timetable.forEach(function(t){ if(!findClass(st,t.classId)||st.timetable.some(function(x){return x.day===t.day&&x.period===t.period})) return; st.timetable.push(t) });
  Object.keys(other.sessions).forEach(function(k){ var s=other.sessions[k]; if(!st.sessions[k]&&findClass(st,s.classId)) st.sessions[k]=s });
  if(!st.ui.lastClass&&st.classes[0]) st.ui.lastClass=st.classes[0].id;
  return {added:added, skipped:skipped};
}

return {LIM:LIM, FLAGS:FLAGS, KINDS:KINDS, REASONS:REASONS, FLAG_TEXT:FLAG_TEXT, uid:uid, clean:clean, normAr:normAr, todayISO:todayISO, validDate:validDate, dayIndex:dayIndex, addDays:addDays,
 emptyState:emptyState, findClass:findClass, findStudent:findStudent, skey:skey, parseNames:parseNames, addClass:addClass, addStudents:addStudents, renameStudent:renameStudent, removeStudent:removeStudent,
 renameClass:renameClass, removeClass:removeClass, setLastLesson:setLastLesson, setSlot:setSlot, todayList:todayList, getSession:getSession, setPart:setPart, addRec:addRec, delRec:delRec, markRest:markRest, clearSession:clearSession,
 sessionView:sessionView, studentCounts:studentCounts, flagsOf:flagsOf, flagHint:flagHint, classSummary:classSummary, studentReport:studentReport, summaryCSV:summaryCSV, reportText:reportText,
 fromLegacy:fromLegacy, normalizeState:normalizeState, exportBackup:exportBackup, parseBackup:parseBackup, mergeInto:mergeInto};
})();
if(typeof module!=='undefined'&&module.exports) module.exports=PL;
