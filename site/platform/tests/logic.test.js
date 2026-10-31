// node site/platform/tests/logic.test.js   (no framework: plain assert)
const assert=require('assert'), PL=require('../src/logic.js');
let n=0; const T=(name,fn)=>{try{fn(); n++; console.log('ok  ',name)}catch(e){console.log('FAIL',name,'\n    ',e.message); process.exitCode=1}};
const today=PL.todayISO(), past=d=>PL.addDays(today,-d);
function fresh(names){const st=PL.emptyState(); const r=PL.addClass(st,{name:'10/3',course:'chem10',names:names||'أحمد\nسالم\nخالد\nمحمد\nيوسف'}); return {st,cls:r.cls,ctx:{classId:r.cls.id,date:today,period:1,lesson:'chem10:3_3'}}}

T('parseNames drops numbering, bullets, blanks and repeats',()=>{
  const r=PL.parseNames('1. أحمد\n٢- سالم\n• خالد\n\n  \nاحمد\n3) يوسف   بن  علي');
  assert.deepStrictEqual(r.names,['أحمد','سالم','خالد','يوسف بن علي']); assert.strictEqual(r.dups,1);
});
T('parseNames limits the class size and strips bidi controls',()=>{
  const many=Array.from({length:160},(_,i)=>'طالب '+i).join('\n'); const r=PL.parseNames(many); assert.strictEqual(r.names.length,150); assert.strictEqual(r.over,10);
  assert.strictEqual(PL.parseNames('‮علي‬').names[0],'علي');
});
T('addClass: name required, no duplicate class names, lastClass follows',()=>{
  const st=PL.emptyState(); assert.ok(PL.addClass(st,{name:' ',names:'أ'}).error);
  const a=PL.addClass(st,{name:'10/3',names:'أحمد\nسالم'}); assert.strictEqual(a.cls.students.length,2); assert.strictEqual(st.ui.lastClass,a.cls.id);
  assert.ok(PL.addClass(st,{name:'١٠/٣',names:'x'}).error,'same name written with Arabic digits is the same class');
  assert.ok(PL.addClass(st,{name:'10/3',names:'x'}).error);
});
T('participation states: null -> 0 -> n, and back to null cleans the session',()=>{
  const {st,cls,ctx}=fresh(); const s=cls.students[0].id;
  assert.strictEqual(PL.setPart(st,ctx,s,1),1); assert.strictEqual(PL.setPart(st,ctx,s,2),2); assert.strictEqual(PL.setPart(st,ctx,s,0),0);
  assert.strictEqual(PL.getSession(st,ctx).part[s],0);
  assert.strictEqual(PL.setPart(st,ctx,s,null),null); assert.strictEqual(PL.getSession(st,ctx),null,'empty session is removed');
  assert.strictEqual(PL.setPart(st,ctx,s,999),50,'capped'); assert.strictEqual(PL.setPart(st,ctx,s,-3),undefined);
});
T('records can not be made for the future, for strangers or for another class',()=>{
  const {st,cls,ctx}=fresh(); const s=cls.students[0].id;
  assert.strictEqual(PL.setPart(st,Object.assign({},ctx,{date:PL.addDays(today,1)}),s,1),undefined);
  assert.strictEqual(PL.setPart(st,ctx,'nobody',1),undefined);
  assert.strictEqual(PL.setPart(st,Object.assign({},ctx,{classId:'zzz'}),s,1),undefined);
  assert.strictEqual(PL.addRec(st,ctx,s,'bad kind','x'),null);
  assert.strictEqual(PL.addRec(st,ctx,s,'positive','',''),null,'needs a reason or a note');
});
T('records: add, delete, session stays only while it has data',()=>{
  const {st,cls,ctx}=fresh(); const s=cls.students[1].id;
  const r=PL.addRec(st,ctx,s,'negative','حديث جانبي'); assert.ok(r&&r.id); assert.strictEqual(PL.getSession(st,ctx).recs.length,1);
  assert.strictEqual(PL.delRec(st,ctx,r.id),true); assert.strictEqual(PL.getSession(st,ctx),null);
});
T('markRest: only students with no entry, never touches recorded ones',()=>{
  const {st,cls,ctx}=fresh(); PL.setPart(st,ctx,cls.students[0].id,3); PL.setPart(st,ctx,cls.students[1].id,0);
  assert.strictEqual(PL.markRest(st,ctx),3); const p=PL.getSession(st,ctx).part;
  assert.strictEqual(p[cls.students[0].id],3); assert.strictEqual(p[cls.students[1].id],0); assert.strictEqual(p[cls.students[4].id],0);
  assert.strictEqual(PL.markRest(st,ctx),0);
});
T('rate counts only sessions whose participation was recorded',()=>{
  const {st,cls}=fresh(); const s=cls.students[0].id, c=d=>({classId:cls.id,date:past(d),period:1});
  PL.setPart(st,c(1),s,2); PL.setPart(st,c(2),s,0); PL.setPart(st,c(3),s,0); PL.addRec(st,c(4),s,'positive','مساعدة زميل');
  const k=PL.studentCounts(st,cls.id,s); assert.strictEqual(k.sessions,4); assert.strictEqual(k.participatedSessions,1); assert.strictEqual(k.noParticipationSessions,2);
  assert.strictEqual(k.rate,33.3); assert.strictEqual(k.positive,1); assert.strictEqual(k.participations,2);
});
T('flags: silent, low (needs 4 recorded sessions), concern (3 negatives); 25% is not low',()=>{
  const {st,cls}=fresh(); const [a,b,c,d]=cls.students.map(x=>x.id), at=i=>({classId:cls.id,date:past(i),period:1});
  for(let i=1;i<=4;i++) PL.setPart(st,at(i),a,0);                                  // silent
  [1,0,0,0].forEach((n,i)=>PL.setPart(st,at(i+1),b,n));                              // 1 of 4 = 25%: not low
  [1,0,0,0,0].forEach((n,i)=>PL.setPart(st,at(i+1),c,n));                            // 1 of 5 = 20%: low
  [0,0,0].forEach((n,i)=>PL.setPart(st,at(i+1),d,n));                                // only 3 sessions: no flag
  for(let i=1;i<=3;i++) PL.addRec(st,at(i),d,'negative','حديث جانبي');                // concern
  const f=id=>PL.flagsOf(PL.studentCounts(st,cls.id,id));
  assert.deepStrictEqual(f(a),['silent']); assert.deepStrictEqual(f(b),[]); assert.deepStrictEqual(f(c),['low']); assert.deepStrictEqual(f(d),['concern']);
});
T('summary: totals, range filter and CSV',()=>{
  const {st,cls}=fresh(); const s=cls.students[0].id;
  PL.setPart(st,{classId:cls.id,date:past(1),period:1},s,1); PL.setPart(st,{classId:cls.id,date:past(40),period:1},s,0);
  const all=PL.classSummary(st,cls.id), recent=PL.classSummary(st,cls.id,{from:past(30)});
  assert.strictEqual(all.sessions,2); assert.strictEqual(recent.sessions,1); assert.strictEqual(recent.total.rate,100); assert.strictEqual(all.total.rate,50);
  const csv=PL.summaryCSV(all); assert.ok(csv.startsWith('﻿الطالب')); assert.strictEqual(csv.split('\r\n').length,6);
});
T('student report: timeline newest first, reasons grouped, class rate',()=>{
  const {st,cls}=fresh(); const s=cls.students[0].id;
  PL.setPart(st,{classId:cls.id,date:past(2),period:2,lesson:'chem10:3_1'},s,1);
  PL.setPart(st,{classId:cls.id,date:past(1),period:1,lesson:'chem10:3_2'},s,0); PL.addRec(st,{classId:cls.id,date:past(1),period:1},s,'negative','حديث جانبي'); PL.addRec(st,{classId:cls.id,date:past(1),period:1},s,'negative','حديث جانبي');
  const r=PL.studentReport(st,cls.id,s); assert.strictEqual(r.timeline.length,2); assert.strictEqual(r.timeline[0].date,past(1)); assert.strictEqual(r.reasons.negative['حديث جانبي'],2);
  assert.deepStrictEqual(r.timeline[0].lessons,['chem10:3_2']); assert.strictEqual(r.classRate,50);
  assert.ok(PL.reportText(r,id=>id).includes('حديث جانبي'));
});
T('countsBefore: only earlier sessions of the class, never the current one',()=>{
  const {st,cls}=fresh(); const s=cls.students[0].id;
  PL.setPart(st,{classId:cls.id,date:past(3),period:1},s,1); PL.setPart(st,{classId:cls.id,date:past(2),period:1},s,0); PL.setPart(st,{classId:cls.id,date:today,period:1},s,2);
  const v=PL.sessionView(st,{classId:cls.id,date:today,period:1}); assert.deepStrictEqual(v.rows[0].before,{participated:1,recorded:2});
  assert.strictEqual(v.totals.participating,1); assert.strictEqual(v.totals.unrecorded,4);
});
T('removeStudent / removeClass clean every trace',()=>{
  const {st,cls,ctx}=fresh(); const s=cls.students[0].id; PL.setPart(st,ctx,s,1); PL.addRec(st,ctx,s,'positive','مساعدة زميل'); PL.setSlot(st,0,1,cls.id);
  assert.ok(PL.removeStudent(st,cls.id,s)); assert.strictEqual(PL.getSession(st,ctx),null);
  PL.setPart(st,ctx,cls.students[0].id,1); assert.ok(PL.removeClass(st,cls.id)); assert.strictEqual(Object.keys(st.sessions).length,0); assert.strictEqual(st.timetable.length,0);
});
T('timetable: a slot holds one class; today list follows the school week (Sun-Thu)',()=>{
  const {st,cls}=fresh(); PL.setSlot(st,0,3,cls.id); PL.setSlot(st,0,3,cls.id); assert.strictEqual(st.timetable.length,1);
  assert.strictEqual(PL.setSlot(st,5,1,cls.id),false); PL.setSlot(st,0,3,null); assert.strictEqual(st.timetable.length,0);
  assert.strictEqual(PL.dayIndex('2026-11-01'),0,'Sunday'); assert.strictEqual(PL.dayIndex('2026-11-05'),4,'Thursday'); assert.strictEqual(PL.dayIndex('2026-11-06'),-1,'Friday'); assert.strictEqual(PL.dayIndex('2026-11-07'),-1,'Saturday');
  PL.setSlot(st,0,2,cls.id); PL.setSlot(st,0,1,cls.id); assert.deepStrictEqual(PL.todayList(st,'2026-11-01').map(t=>t.period),[1,2]); assert.deepStrictEqual(PL.todayList(st,'2026-11-06'),[]);
});
T('backup round trip keeps everything',()=>{
  const {st,cls,ctx}=fresh(); PL.setPart(st,ctx,cls.students[0].id,2); PL.addRec(st,ctx,cls.students[1].id,'negative','حديث جانبي','ملاحظة'); PL.setSlot(st,1,2,cls.id);
  const back=PL.parseBackup(PL.exportBackup(st)); assert.deepStrictEqual(back.state.classes,st.classes); assert.deepStrictEqual(back.state.sessions,st.sessions); assert.deepStrictEqual(back.state.timetable,st.timetable); assert.strictEqual(back.warnings,0);
});
T('import rejects non-backups and hostile content',()=>{
  assert.throws(()=>PL.parseBackup('not json')); assert.throws(()=>PL.parseBackup('[1,2]')); assert.throws(()=>PL.parseBackup(JSON.stringify({app:'other',data:{}})));
  const evil=JSON.stringify({app:'teacher-platform',v:1,data:{classes:[{id:'__proto__',name:'x',students:[]},{id:'c1',name:'<b>10/1</b>',students:[{id:'constructor',name:'a'},{id:'s1',name:'علي'}]}],
    sessions:{'c1|2026-10-01|1':{classId:'c1',date:'2026-10-01',period:1,part:{s1:-5,s2:4,'__proto__':3},recs:[{id:'r1',sid:'s1',kind:'evil',reason:'x'},{id:'r2',sid:'s1',kind:'note',reason:'ok'}]},
    'c1|2099-99-99|1':{classId:'c1',date:'2099-99-99',part:{s1:1}}}}});
  const r=PL.parseBackup(evil); assert.strictEqual(r.state.classes.length,1); assert.strictEqual(r.state.classes[0].students.length,1); assert.ok(r.warnings>=4);
  const s=r.state.sessions['c1|2026-10-01|1']; assert.strictEqual(s.recs.length,1); assert.strictEqual(Object.keys(s.part).length,0); assert.strictEqual(Object.keys(r.state.sessions).length,1);
  assert.strictEqual(({}).polluted,undefined); assert.strictEqual(Object.getPrototypeOf(r.state.sessions),Object.prototype);
});
T('import of the earlier classroom site backup: classes, students, timetable, sessions and lesson ids',()=>{
  const legacy={app:'chem10-smart-planner-class',version:1,classroom:{v:1,order:['g1'],groups:{g1:{id:'g1',course:'chem10',name:'10/3',at:1,students:[{id:'a1',name:'أحمد'},{id:'a2',name:'سالم'}]}},
    sessions:{x:{gid:'g1',lesson:'3_3',date:'2026-10-20',part:{a1:2,a2:0},recs:[{id:'r1',st:'a2',kind:'negative',reason:'حديث جانبي',note:'',at:5}]},
              y:{gid:'g1',lesson:'3_2',date:'2026-10-20',part:{a1:1},recs:[]},
              z:{gid:'g1',lesson:'chem11~1_1',date:'2026-10-21',part:{a2:1},recs:[]}},
    tt:{days:[0,1,2,3,4],periods:[],slots:{'0|2':{gid:'g1',room:'12'},'6|1':{gid:'g1',room:''}}}}};
  const r=PL.parseBackup(JSON.stringify(legacy)); assert.ok(r.legacy); const st=r.state;
  assert.strictEqual(st.classes.length,1); assert.strictEqual(st.classes[0].course,'chem10'); assert.strictEqual(st.classes[0].students.length,2);
  assert.deepStrictEqual(st.timetable,[{day:0,period:2,classId:'g1'}],'Saturday slot is outside the school week and is dropped');
  const s=st.sessions['g1|2026-10-20|0']; assert.deepStrictEqual(s.lessons.sort(),['chem10:3_2','chem10:3_3']); assert.strictEqual(s.part.a1,2,'larger count wins when two lessons share a day'); assert.strictEqual(s.recs[0].sid,'a2');
  assert.deepStrictEqual(st.sessions['g1|2026-10-21|0'].lessons,['chem11:1_1']);
  assert.strictEqual(PL.parseBackup(JSON.stringify(legacy.classroom)).legacy,true,'the bare classroom object is accepted too');
});
T('merge adds classes and sessions, never overwrites or deletes',()=>{
  const a=fresh(), b=fresh(); const st=a.st; PL.setPart(st,a.ctx,a.cls.students[0].id,1);
  const other=PL.parseBackup(PL.exportBackup(b.st)).state; const r=PL.mergeInto(st,other);
  assert.strictEqual(r.added,1); assert.strictEqual(st.classes.length,2); assert.strictEqual(PL.getSession(st,a.ctx).part[a.cls.students[0].id],1);
  assert.strictEqual(PL.mergeInto(st,other).added,0);
});
T('last lesson per class survives a backup and is dropped with the class',()=>{
  const {st,cls}=fresh(); assert.ok(PL.setLastLesson(st,cls.id,'chem10:3_3')); assert.ok(!PL.setLastLesson(st,cls.id,'bad id'));
  const b=PL.parseBackup(PL.exportBackup(st)).state; assert.strictEqual(b.ui.lastLesson[cls.id],'chem10:3_3'); PL.removeClass(st,cls.id); assert.deepStrictEqual(st.ui.lastLesson,{});
});
T('normAr matches names typed differently',()=>{ assert.strictEqual(PL.normAr('أَحْمَد'),PL.normAr('احمد')); assert.strictEqual(PL.normAr('فاطمة'),PL.normAr('فاطمه')); assert.strictEqual(PL.normAr('١٠/٣'),'10/3'); });
console.log('\n'+n+' tests passed'+(process.exitCode?' (WITH FAILURES)':''));
