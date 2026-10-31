/* ---------- the data store: one state object for the whole site, kept in this browser (localStorage) ----------
   The whole platform is one site (one origin), so the lessons, the class drawer and the records screens all read the same data.
   Storage can be cleared by the browser, so the site reminds the teacher to keep a backup file. */
var PStore=(function(){
'use strict';
var KEY='platform:v1', st=PL.emptyState(), subs=[], timer=0, status={persists:true, saved:true, error:'', loaded:'new', warnings:0};
function probe(){try{var k=KEY+':probe'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true}catch(e){return false}}
function load(){
  var raw=null; status.persists=probe();
  try{raw=localStorage.getItem(KEY)}catch(e){}
  if(!raw){st=PL.emptyState(); return}
  try{var r=PL.normalizeState(JSON.parse(raw)); st=r.state; status.loaded='storage'; status.warnings=r.warnings}
  catch(e){ /* unreadable: keep the raw text aside, never overwrite it */
    try{localStorage.setItem(KEY+':unreadable:'+Date.now(),raw)}catch(e2){}
    st=PL.emptyState(); status.loaded='unreadable'; status.error='تعذّرت قراءة البيانات المحفوظة. حُفظت نسخة منها جانباً وبدأت بيانات جديدة.';
  }
}
function emit(){subs.slice().forEach(function(f){try{f(st,status)}catch(e){console.error(e)}})}
function flush(){
  clearTimeout(timer); timer=0; if(status.saved) return true;
  try{localStorage.setItem(KEY,JSON.stringify(st)); status.saved=true; status.error=''; emit(); return true}
  catch(e){status.error='تعذّر الحفظ على هذا الجهاز. صدّر نسخة احتياطية حتى لا تضيع بياناتك.'; emit(); return false}
}
/* every change goes through here: mutate a copy-in-place, stamp, save soon, tell the screens */
function change(fn){var r=fn(st); st.updated=Date.now(); status.saved=false; clearTimeout(timer); timer=setTimeout(flush,200); emit(); return r}
function markBackup(){st.lastBackup=Date.now(); status.saved=false; flush()}
function reload(){load(); emit()}
load();
if(typeof window!=='undefined'){
  window.addEventListener('pagehide',flush); document.addEventListener('visibilitychange',function(){if(document.hidden) flush()});
  window.addEventListener('storage',function(e){ if(e.key===KEY){ if(!status.saved) return; load(); emit() } });  // another tab changed the data
}
return {data:function(){return st}, status:function(){return status}, change:change, flush:flush, reload:reload, markBackup:markBackup, subscribe:function(f){subs.push(f); return function(){subs=subs.filter(function(x){return x!==f})}}};
})();
