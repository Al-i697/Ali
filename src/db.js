/* ───────── التخزين على الآيباد (IndexedDB) — بدون سيرفر ─────────
   • السجلات الكبيرة (فواتير، سدادات، مصروفات...) تُحفظ كل سجل لوحده، فيُكتب الجديد فقط ولا يُعاد كتابة كل شيء
   • القوائم الصغيرة (الأصناف، العملاء، الحسابات...) تُكتب كاملة عند أي تغيير فيها
   • persist() تُستدعى بعد كل عملية، وتنتظرها عمليات الدفع قبل إظهار الفاتورة */
const DB=(()=>{
  const NAME='cafe-pos',VER=1,APPEND=['invoices','custPays','expenses','purchases','suppPays','adjusts','shifts'];
  let db=null;
  const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
  function open(){return new Promise((res,rej)=>{
    if(!window.indexedDB)return rej(new Error('هذا المتصفح لا يدعم التخزين المحلي'));
    let r;try{r=indexedDB.open(NAME,VER);}catch(e){return rej(e);}
    r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('kv',{keyPath:'k'});APPEND.forEach(n=>d.createObjectStore(n,{keyPath:'id'}));};
    r.onsuccess=()=>{db=r.result;db.onversionchange=()=>db.close();res(db);};
    r.onerror=()=>rej(r.error||new Error('تعذّر فتح التخزين'));r.onblocked=()=>rej(new Error('التخزين مشغول بتبويب آخر'));});}
  const all=name=>req(db.transaction(name).objectStore(name).getAll());
  function putMany(ops){return new Promise((res,rej)=>{
    const names=[...new Set(ops.map(o=>o[0]))],tx=db.transaction(names,'readwrite');
    ops.forEach(([n,o])=>tx.objectStore(n).put(o));
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('فشل الحفظ'));});}
  function clearAll(){return new Promise((res,rej)=>{const names=['kv',...APPEND],tx=db.transaction(names,'readwrite');names.forEach(n=>tx.objectStore(n).clear());tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});}
  return {open,all,putMany,clearAll,APPEND};
})();

const PS={lens:{},kv:{},err:null};
const imgFp=(k,v)=>k==='img'&&typeof v==='string'?v.length+':'+v.slice(-24):v;
const kvVals=()=>({
  meta:{uid:S.meta.uid,nextInv:S.nextInv,vat:S.vat,created:S.meta.created,lastBackup:S.meta.lastBackup,rec:S.meta.rec,v:1},
  store:S.store,users:S.users,customers:S.customers,suppliers:S.suppliers,products:PROD,stock:STOCK});

function applyKV(K){
  const m=K.meta;S.meta={uid:m.uid||1,created:m.created||0,lastBackup:m.lastBackup||0,rec:m.rec||null};S.nextInv=m.nextInv||1001;S.vat=!!m.vat;
  Object.assign(S.store,K.store||{});S.users=K.users||[];S.customers=K.customers||[];S.suppliers=K.suppliers||[];
  Object.keys(PROD).forEach(k=>delete PROD[k]);Object.assign(PROD,K.products||{});STOCK.length=0;(K.stock||[]).forEach(x=>STOCK.push(x));
}
async function loadState(){
  await DB.open();
  const rows=await DB.all('kv'),K={};rows.forEach(r=>K[r.k]=r.v);
  const had=!!K.meta;
  if(had){applyKV(K);for(const c of DB.APPEND)S[c]=(await DB.all(c)).sort((a,b)=>a.id-b.id);S.ui.close.float=S.store.float||'0.000';
    const v=kvVals();for(const k in v)PS.kv[k]=JSON.stringify(v[k],imgFp);}
  for(const c of DB.APPEND)PS.lens[c]=S[c].length;
  return had;
}
let pchain=Promise.resolve(),FROZEN=false;
function persist(){
  if(FROZEN)return pchain;   /* أثناء الاسترجاع: ما نكتب حالة الذاكرة القديمة فوق النسخة */
  const ops=[];
  for(const c of DB.APPEND){const a=S[c],n=PS.lens[c]||0;if(a.length>n){for(let i=n;i<a.length;i++)ops.push([c,a[i]]);PS.lens[c]=a.length;}}
  while(TOUCH.length)ops.push(TOUCH.shift());
  const v=kvVals();for(const k in v){const j=JSON.stringify(v[k],imgFp);if(j!==PS.kv[k]){PS.kv[k]=j;ops.push(['kv',{k,v:v[k]}]);}}
  if(!ops.length)return pchain;
  pchain=pchain.then(()=>DB.putMany(ops)).then(()=>{PS.err=null;},e=>{PS.err=e;if(window.onPersistError)window.onPersistError(e);});
  return pchain;
}

/* ───────── نسخة احتياطية واسترجاع ───────── */
function buildBackup(){const b={app:'cafe-pos',v:1,at:Date.now(),kv:kvVals()};DB.APPEND.forEach(c=>b[c]=S[c]);return b;}
function backupOk(b){return !!b&&b.app==='cafe-pos'&&b.kv&&b.kv.meta&&Array.isArray(b.kv.users)&&DB.APPEND.every(c=>Array.isArray(b[c]));}
async function restoreBackup(b){
  if(!backupOk(b))throw new Error('هذا الملف ليس نسخة احتياطية من هذا البرنامج');
  FROZEN=true;await pchain;
  try{await DB.clearAll();
  const ops=Object.entries(b.kv).map(([k,v])=>['kv',{k,v}]);
  for(const c of DB.APPEND)b[c].forEach(o=>ops.push([c,o]));
  for(let i=0;i<ops.length;i+=3000)await DB.putMany(ops.slice(i,i+3000));
  }catch(e){FROZEN=false;throw e;}
}
