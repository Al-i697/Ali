// node site/platform/tests/e2e.js   (needs: python3 site/build.py first; serves site/dist over http because the lesson frame must be same-origin)
const {chromium}=require('playwright'), http=require('http'), fs=require('fs'), path=require('path'), assert=require('assert');
const PL=require('../src/logic.js'), DIST=path.resolve(__dirname,'../../dist');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json'};
const srv=http.createServer((q,r)=>{ const f=path.join(DIST,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+$/,'/index.html')); if(!f.startsWith(DIST)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return} r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'text/plain'}); r.end(fs.readFileSync(f)) });
let n=0, bad=0; const T=async(name,fn)=>{try{await fn(); n++; console.log('ok  ',name)}catch(e){bad++; console.log('FAIL',name,'\n    ',(e.message||e).split('\n')[0])}};
const SUN='2026-11-01T09:30:00';   // a Sunday: a teaching day in the school week
(async()=>{
  await new Promise(r=>srv.listen(0,r)); const URL=process.env.OFFLINE?'file://'+path.resolve(__dirname,'../../offline/platform-offline.html'):'http://127.0.0.1:'+srv.address().port+'/index.html';   // OFFLINE=1: the single-file copy opened straight from disk
  const b=await chromium.launch(); const errs=[];
  async function page(opts){
    opts=opts||{}; const ctx=await b.newContext({viewport:{width:1280,height:720},acceptDownloads:true}); const p=await ctx.newPage();
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_/.test(m.text())) errs.push(m.text())});
    await p.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
    await p.addInitScript(t=>{ const RD=Date, off=new RD(t).getTime()-RD.now(); window.Date=class extends RD{constructor(...a){ if(a.length===0) super(RD.now()+off); else super(...a)} static now(){return RD.now()+off}} }, opts.now||SUN);
    if(opts.state) await p.addInitScript(s=>{ if(!localStorage.getItem('platform:v1')) localStorage.setItem('platform:v1',s) }, JSON.stringify(opts.state));
    if(opts.raw!==undefined) await p.addInitScript(s=>{ localStorage.setItem('platform:v1',s) }, opts.raw);
    await p.goto(URL+(opts.hash||'')); await p.waitForTimeout(900); return p;
  }
  const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('platform:v1')||'null'));
  const addClass=async(p,name,names,course)=>{ await p.click('[data-act=newclass]'); await p.fill('#cdName',name); if(course) await p.selectOption('#cdCourse',course); await p.fill('#cdNames',names); await p.click('#cdSave'); await p.waitForTimeout(400) };
  const NAMES='أحمد\nسالم\nخالد\nمحمد\nيوسف\nسعيد';

  await T('pages: grades (big cards) -> subjects -> units and lessons -> the lesson opens on its slides; back buttons return one step',async()=>{
    const p=await page(); assert.strictEqual(await p.locator('#v-home .bcard').count(),4,'three grades and the teacher record'); assert.ok((await p.innerText('#v-home .strip')).includes('أضف شعبتك'));
    const box=await p.locator('#v-home .bcard').first().boundingBox(); assert.ok(box.height>=300&&box.width>=280,'cards are big: '+JSON.stringify(box));
    await p.click('a[href="#grade-10"]'); await p.waitForTimeout(300); assert.strictEqual(await p.evaluate(()=>location.hash),'#grade-10'); assert.ok(await p.isVisible('#v-grade'));
    assert.strictEqual(await p.locator('#v-grade .bcard').count(),4); assert.strictEqual(await p.locator('#v-grade .bcard.soon').count(),3); assert.ok((await p.innerText('#v-grade a.bcard')).includes('١٦ درساً جاهزاً من ٢٦'));
    await p.click('#v-grade a.bcard'); await p.waitForTimeout(300); assert.strictEqual(await p.evaluate(()=>location.hash),'#grade-10-chem'); assert.strictEqual(await p.locator('#v-term .bcard').count(),2,'first and second semester'); assert.ok((await p.innerText('#v-term')).includes('الفصل الأول')&&(await p.innerText('#v-term')).includes('الفصل الثاني')); assert.ok((await p.innerText('#v-term a.bcard >> nth=0')).includes('١٦ درساً جاهزاً من ١٦'));
    await p.click('#v-term a.bcard >> nth=0'); await p.waitForTimeout(300); assert.strictEqual(await p.evaluate(()=>location.hash),'#grade-10-chem-1'); assert.strictEqual(await p.locator('#v-course .lc.built').count(),16); assert.strictEqual(await p.locator('#v-course .unit').count(),4,'only the units of the first semester');
    await p.click('[data-back]:visible'); await p.waitForTimeout(200); assert.strictEqual(await p.evaluate(()=>location.hash),'#grade-10-chem'); await p.click('#v-term a.bcard >> nth=1'); await p.waitForTimeout(300); assert.strictEqual(await p.locator('#v-course .unit').count(),4,'four units in the second semester'); assert.strictEqual(await p.locator('#v-course .lc.built').count(),0);
    await p.click('[data-back]:visible'); await p.click('[data-back]:visible'); await p.waitForTimeout(200); assert.strictEqual(await p.evaluate(()=>location.hash),'#grade-10'); await p.click('[data-back]:visible'); await p.waitForTimeout(200); assert.strictEqual(await p.evaluate(()=>location.hash),'#home');
    await p.click('a[href="#grade-11"]'); await p.click('#v-grade a.bcard'); await p.click('#v-term a.bcard >> nth=0'); await p.waitForTimeout(200); assert.strictEqual(await p.locator('#v-course .lc.built').count(),0,'grade 11 chemistry has its lessons listed as coming soon');
    await p.goto(URL+'#grade-10-chem-1'); await p.waitForTimeout(500); await p.click('#v-course .lc.built >> nth=10'); await p.waitForTimeout(1500); assert.strictEqual(await p.evaluate(()=>location.hash),'#l-chem10-3-3'); assert.ok(await p.isVisible('#lf')); await p.context().close();
  });
  await T('add a class: names pasted with numbering, duplicates reported, stored in this browser',async()=>{
    const p=await page(); await addClass(p,'10/3','1. أحمد\n٢- سالم\nخالد\nأحمد\nمحمد\nيوسف\nسعيد','chem10');
    const s=await state(p); assert.strictEqual(s.classes.length,1); assert.strictEqual(s.classes[0].students.length,6); assert.strictEqual(s.classes[0].course,'chem10');
    assert.ok((await p.innerText('#toast')).includes('مكرراً'));
    await p.context().close();
  });
  await T('timetable: a slot puts today\'s lesson on the home page, and the class is remembered',async()=>{
    const p=await page(); await addClass(p,'10/3',NAMES,'chem10'); await p.click('[data-nav=classes]'); await p.waitForTimeout(300);
    await p.click('[data-slot="0|2"]'); await p.click('.menu button:has-text("10/3")'); await p.click('[data-nav=home]'); await p.waitForTimeout(300);
    const t=await p.innerText('#v-home .strip'); assert.ok(t.includes('حصصك اليوم')&&t.includes('الحصة ٢')&&t.includes('10/3'),t); await p.context().close();
  });
async function openByHash(p,h){ await p.evaluate(x=>{location.hash=x},h||'#l-chem10-3-1'); await p.waitForFunction(()=>{const f=document.getElementById('lf'); try{return f.contentDocument&&f.contentDocument.getElementById('bClass')}catch(e){return false}},null,{timeout:20000}); await p.waitForTimeout(500) }
  async function openLesson(p){ await p.click('[data-start]'); await p.waitForFunction(()=>{const f=document.getElementById('lf'); try{return f.contentDocument&&f.contentDocument.getElementById('bClass')}catch(e){return false}},null,{timeout:20000}); await p.waitForTimeout(500) }
  await T('lesson opens in a frame with the class button added to its top bar, drawer shows the roster',async()=>{
    const p=await page(); await addClass(p,'10/3',NAMES,'chem10'); await p.click('[data-nav=classes]'); await p.click('[data-slot="0|1"]'); await p.click('.menu button:has-text("10/3")'); await p.click('[data-nav=home]');
    await openLesson(p); assert.ok((await p.evaluate(()=>location.hash)).startsWith('#l-chem10-1-1')); assert.strictEqual(await p.locator('#slist .stu').count(),6);
    assert.ok((await p.innerText('#dLs')).includes('١-١')); await p.context().close();
  });
  await T('drawer: tap = participation, minus, skip, reasons, undo, "did not participate for the rest" needs a second click',async()=>{
    const p=await page({hash:''}); await addClass(p,'10/3',NAMES,'chem10'); await openByHash(p);
    const row=i=>p.locator('#slist .stu').nth(i);
    for(let k=0;k<3;k++) await row(0).locator('[data-a=tap]').click(); assert.strictEqual((await row(0).locator('.cnt').innerText()).trim(),'٣');
    await row(0).locator('[data-a=minus]').click(); assert.strictEqual((await row(0).locator('.cnt').innerText()).trim(),'٢');
    await row(1).locator('[data-a=skip]').click(); assert.strictEqual((await row(1).locator('.cnt').innerText()).trim(),'لا'); assert.ok((await row(1).getAttribute('class')).includes('zero'));
    await row(2).locator('[data-a=neg]').click(); await p.click('#slist .rs button >> nth=0'); await p.waitForTimeout(150); assert.ok((await row(2).locator('.recs').innerText()).includes('حديث جانبي'));
    await row(2).locator('[data-rm]').click(); await p.waitForTimeout(150); assert.strictEqual(await row(2).locator('[data-rm]').count(),0); await p.click('#toast button'); await p.waitForTimeout(150); assert.strictEqual(await row(2).locator('[data-rm]').count(),1,'undo brings it back');
    await row(3).locator('[data-a=pos]').click(); await p.fill('[data-cust]','سبب خاص'); await p.click('[data-cust-ok]'); await p.waitForTimeout(150); assert.ok((await row(3).locator('.recs').innerText()).includes('سبب خاص'));
    await p.click('#bRest'); assert.ok((await p.innerText('#bRest')).includes('تأكيد')); assert.strictEqual((await state(p)).sessions&&Object.values((await state(p)).sessions)[0].part[Object.keys(Object.values((await state(p)).sessions)[0].part)[0]]!==undefined,true);
    await p.click('#bRest'); await p.waitForTimeout(200); assert.strictEqual((await p.innerText('#sRest')).trim(),'٠');
    const sess=Object.values((await state(p)).sessions)[0]; assert.strictEqual(Object.keys(sess.part).length,6); assert.deepStrictEqual(sess.lessons,['chem10:3_1']);
    await p.context().close();
  });
  await T('drawer: search, hide behaviour, random picker only among unrecorded, focus returns to the lesson',async()=>{
    const p=await page(); await addClass(p,'10/3',NAMES,'chem10'); await openByHash(p);
    await p.fill('#dQ','احمد'); assert.strictEqual(await p.locator('#slist .stu').count(),1,'search ignores hamza'); await p.fill('#dQ','');
    await p.locator('#slist .stu').nth(2).locator('[data-a=neg]').click(); await p.click('#slist .rs button >> nth=0'); await p.click('#bEye'); await p.waitForTimeout(150);
    assert.strictEqual(await p.locator('#slist [data-rm]').count(),0,'behaviour hidden'); await p.click('#bEye');
    for(let i=0;i<5;i++) await p.locator('#slist .stu').nth(i).locator('[data-a=tap]').click();
    await p.click('#bRand'); await p.waitForSelector('#pickBtns:not(.hide)',{timeout:6000}); assert.strictEqual(await p.innerText('#who'),'سعيد','only the one not recorded yet can be picked'); await p.click('#pickYes'); await p.waitForTimeout(200);
    assert.strictEqual((await p.innerText('#sRest')).trim(),'٠');
    await p.locator('#slist .stu').nth(0).locator('[data-a=tap]').click(); const focused=await p.evaluate(()=>document.activeElement&&document.activeElement.id); assert.strictEqual(focused,'lf','keyboard goes back to the lesson after a tap');
    await p.context().close();
  });
  await T('the slide number follows the lesson, the lesson home button returns to the platform, leaving unloads the lesson',async()=>{
    const p=await page(); await addClass(p,'10/3',NAMES,'chem10'); await openByHash(p);
    /* the first slide shows its goals one click at a time (click-by-click points), so Next is pressed until the slide changes */
    for(let i=0;i<12&&!(await p.innerText('#dLs')).includes('شريحة ٢');i++){ await p.frameLocator('#lf').locator('#bNext').click(); await p.waitForTimeout(450) }
    await p.waitForTimeout(900); assert.ok((await p.innerText('#dLs')).includes('شريحة ٢'),await p.innerText('#dLs'));
    await p.frameLocator('#lf').locator('#bHome').click(); await p.waitForTimeout(500); assert.strictEqual(await p.evaluate(()=>location.hash),'#grade-10-chem-1','the lesson home button returns to the lessons page of its semester'); assert.strictEqual(await p.evaluate(()=>document.getElementById('lf').getAttribute('src')),'about:blank');
    await p.context().close();
  });
  await T('drawer closes and opens from the lesson top bar; with no class it offers to add one',async()=>{
    const p=await page(); await p.goto(URL+'#l-chem10-3-2'); await p.waitForTimeout(2200); assert.ok((await p.innerText('#drawer')).includes('ما أضفت شعبة'));
    await p.frameLocator('#lf').locator('#bClass').click(); await p.waitForTimeout(500); assert.ok(!(await p.getAttribute('#drawer','class')).includes('open')); await p.frameLocator('#lf').locator('#bClass').click(); assert.ok((await p.getAttribute('#drawer','class')).includes('open')); await p.context().close();
  });
  // ---- records: seeded data, numbers must equal the logic module's own results ----
  const seed=()=>{ const st=PL.emptyState(); const r=PL.addClass(st,{name:'10/3',course:'chem10',names:'أحمد\nسالم\nخالد\nمحمد\nيوسف\nهلال'}); const ids=r.cls.students.map(s=>s.id), c=i=>({classId:r.cls.id,date:PL.addDays('2026-11-01',-i),period:1,lesson:'chem10:3_2'});
    [[2,1,2,0,1,0],[1,0,1,1,0,0],[3,1,0,0,2,0],[1,0,1,0,0,0],[2,1,1,1,0,0]].forEach((row,i)=>row.forEach((n,j)=>{ if(n===0&&j!==5&&i%2) return; PL.setPart(st,c(i+1),ids[j],n) }));
    for(let i=1;i<=4;i++) PL.setPart(st,c(i),ids[5],0); for(let i=1;i<=3;i++) PL.addRec(st,c(i),ids[5],'negative','حديث جانبي'); PL.addRec(st,c(1),ids[0],'positive','مساعدة زميل'); PL.setSlot(st,0,1,r.cls.id); return st };
  await T('summary numbers equal the logic module; flags appear for the silent and the concerning student',async()=>{
    const st=seed(), cid=st.classes[0].id, sum=PL.classSummary(st,cid), p=await page({state:st,hash:'#summary'});
    const tiles=(await p.innerText('.tiles')).replace(/\s+/g,' '); const ar=x=>String(x).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
    assert.ok(tiles.includes(ar(sum.sessions)+' حصة'),tiles); assert.ok(tiles.includes(ar(Math.round(sum.total.rate))+'٪'),tiles); assert.ok(tiles.includes(ar(sum.total.negative)+' سلوك غير حسن'),tiles);
    const fl=await p.innerText('.fl'); assert.ok(fl.includes('هلال')&&fl.includes('لم يشارك مطلقاً')&&fl.includes('ملاحظات غير حسنة كثيرة'),fl);
    await p.click('th[data-k=name]'); const first=await p.locator('.rt tbody tr').first().innerText(); assert.ok(first.includes('أحمد')||first.includes('خالد'),first);
    await p.context().close();
  });
  await T('student report: comparison, reasons and a timeline with lesson names; clicking a flag opens the student',async()=>{
    const st=seed(), p=await page({state:st,hash:'#summary'}); await p.click('.fcard >> nth=0'); await p.waitForTimeout(400); assert.strictEqual(await p.evaluate(()=>location.hash),'#student');
    const t=await p.innerText('#v-student'); assert.ok(t.includes('هلال')&&t.includes('حديث جانبي (٣)')&&t.includes('٣-٢ المول وثابت أفوجادرو'),t.slice(0,400)); assert.ok(t.includes('متوسط الشعبة')); await p.context().close();
  });
  await T('exports: backup json, summary csv, student report txt download as files and the backup date is remembered',async()=>{
    const st=seed(), p=await page({state:st,hash:'#classes'});
    let [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=export] >> nth=0')]); const f=await dl.path(); const back=PL.parseBackup(fs.readFileSync(f,'utf8')); assert.strictEqual(back.state.classes[0].students.length,6); assert.ok(/^platform-backup-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()),'file name: '+dl.suggestedFilename());
    assert.ok((await state(p)).lastBackup>0,'backup date remembered'); await p.click('[data-sub=summary]'); [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=csv]')]); assert.ok(fs.readFileSync(await dl.path(),'utf8').startsWith('﻿الطالب'));
    await p.click('#v-summary [data-sub=student]'); [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=report]')]); {const t=fs.readFileSync(await dl.path(),'utf8'); assert.ok(t.includes('تقرير الطالب'),'report: '+t.slice(0,60))}
    await p.context().close();
  });
  await T('import: our own backup into an empty browser, and the old classroom site backup; importing twice adds nothing',async()=>{
    const st=seed(), file=path.join(require('os').tmpdir(),'plat-backup.json'); fs.writeFileSync(file,PL.exportBackup(st));
    const legacy={app:'chem10-smart-planner-class',version:1,classroom:{v:1,order:['g1'],groups:{g1:{id:'g1',course:'chem10',name:'10/9',at:1,students:[{id:'a1',name:'علي'},{id:'a2',name:'ماجد'}]}},sessions:{x:{gid:'g1',lesson:'3_3',date:'2026-10-20',part:{a1:2,a2:0},recs:[]}},tt:{days:[0,1,2,3,4],periods:[],slots:{'0|3':{gid:'g1',room:''}}}}};
    const lf=path.join(require('os').tmpdir(),'plat-legacy.json'); fs.writeFileSync(lf,JSON.stringify(legacy));
    const p=await page({hash:'#classes'}); await p.click('[data-act=import] >> nth=0'); await p.setInputFiles('#imFile',file); await p.waitForTimeout(300); assert.ok((await p.innerText('#imMsg')).includes('نسخة من هذا الموقع')); await p.click('#imGo'); await p.waitForTimeout(400);
    assert.strictEqual((await state(p)).classes.length,1);
    await p.click('[data-act=import] >> nth=0'); await p.setInputFiles('#imFile',lf); await p.waitForTimeout(300); assert.ok((await p.innerText('#imMsg')).includes('القديم')); await p.click('#imGo'); await p.waitForTimeout(400);
    let s=await state(p); assert.strictEqual(s.classes.length,2); assert.strictEqual(s.timetable.length,2); assert.deepStrictEqual(Object.values(s.sessions).filter(x=>x.classId==='g1')[0].lessons,['chem10:3_3']);
    await p.click('[data-act=import] >> nth=0'); await p.setInputFiles('#imFile',lf); await p.waitForTimeout(300); await p.click('#imGo'); await p.waitForTimeout(300); assert.strictEqual((await state(p)).classes.length,2);
    await p.click('[data-act=import] >> nth=0'); await p.fill('#imText','not a backup'); await p.waitForTimeout(200); assert.ok(await p.isDisabled('#imGo')); await p.context().close();
  });
  await T('edit a class: rename, add students, remove one with a second click, delete the class with a second click',async()=>{
    const st=seed(), p=await page({state:st,hash:'#classes'}); await p.click('[data-editc]'); await p.fill('#cdName','10/4'); await p.fill('#cdNames','فهد\nسالم'); await p.click('#cdSave'); await p.waitForTimeout(300);
    let s=await state(p); assert.strictEqual(s.classes[0].name,'10/4'); assert.strictEqual(s.classes[0].students.length,7,'a duplicate name is skipped');
    await p.click('[data-editc]'); const b=p.locator('[data-rmstu]').first(); await b.click(); assert.ok((await b.innerText()).includes('تأكيد')); await b.click(); await p.waitForTimeout(200); await p.click('[data-close]'); s=await state(p); assert.strictEqual(s.classes[0].students.length,6);
    await p.click('[data-editc]'); await p.click('#cdDel'); await p.click('#cdDel'); await p.waitForTimeout(300); s=await state(p); assert.strictEqual(s.classes.length,0); assert.deepStrictEqual(s.sessions,{}); await p.context().close();
  });
  await T('hostile text is shown as text: class and student names with markup run nothing',async()=>{
    const p=await page(); await p.evaluate(()=>{window.__x=0}); await addClass(p,'<b>10/3</b>','<img src=x onerror="window.__x=1">\n<script>window.__x=2</script>\nعلي','chem10');
    await p.click('[data-nav=classes]'); await p.click('#v-classes [data-start]'); await p.waitForTimeout(1500); assert.strictEqual(await p.evaluate(()=>window.__x),0); assert.strictEqual(await p.locator('#slist img, .ccard img').count(),0);
    assert.ok((await p.innerText('#slist')).includes('<img src=x')); await p.context().close();
  });
  await T('unreadable saved data is kept aside, the page still opens and says so',async()=>{
    const p=await page({raw:'{broken'}); const keys=await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('platform:v1:unreadable'))); assert.strictEqual(keys.length,1);
    assert.ok((await p.innerText('#banner')).includes('تعذّرت قراءة البيانات')); await p.context().close();
  });
  await T('no horizontal scroll at phone width on every screen',async()=>{
    const st=seed(), p=await page({state:st}); await p.setViewportSize({width:400,height:800});
    for(const v of ['home','grade-10','grade-10-chem','grade-10-chem-1','classes','summary','student']){ await p.goto(URL+'#'+v); await p.waitForTimeout(700); const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth); assert.ok(o<=1,v+' overflow '+o) } await p.context().close();
  });
  await T('weekend: the home page says it is a day off and still offers to start a lesson',async()=>{
    const st=seed(), p=await page({state:st,now:'2026-11-06T09:30:00'}); const t=await p.innerText('#v-home .strip'); assert.ok(t.includes('اليوم إجازة')&&t.includes('ابدأ حصة'),t); await p.context().close();
  });
  await T('lesson hash survives a reload: opening #l-chem10-3-4 directly shows lesson 3-4 with the drawer',async()=>{
    const st=seed(), p=await page({state:st,hash:'#l-chem10-3-4'}); await p.waitForTimeout(1500); assert.ok((await p.innerText('#dLs')).includes('٣-٤')); assert.strictEqual(await p.locator('#slist .stu').count(),6); await p.context().close();
  });
  await b.close(); srv.close();
  console.log('\n'+n+' passed, '+bad+' failed'+(errs.length?'\nconsole/page errors:\n  '+[...new Set(errs)].slice(0,8).join('\n  '):'\nno console or page errors')); process.exitCode=bad||errs.length?1:0;
})();
