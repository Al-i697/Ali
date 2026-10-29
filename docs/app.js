(function(){
'use strict';
/* ───────── أدوات ───────── */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
/* كل المبالغ أعداد صحيحة بالبيسة (1 ر.ع = 1000 بيسة) */
const fmt=b=>{const n=Math.abs(Math.round(b));return (b<0?'−':'')+Math.floor(n/1000)+'.'+String(n%1000).padStart(3,'0')};
const money=b=>`<span class="num">${fmt(b)}</span> <small>ر.ع</small>`;
const parseB=v=>{v=String(v==null?'':v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(',','.').trim();if(!v||!/^\d*\.?\d*$/.test(v))return 0;const [a,b='']=v.split('.');return (parseInt(a||'0',10)||0)*1000+(parseInt((b+'000').slice(0,3),10)||0)};
const DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const hm=ms=>{const d=new Date(ms);let h=d.getHours();const ap=h>=12?'م':'ص';h=h%12||12;return `${h}:${pad(d.getMinutes())} ${ap}`};
const dm=ms=>{const d=new Date(ms);return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`};
const dur=ms=>{const m=Math.max(0,Math.round(ms/60000));return `${Math.floor(m/60)} س ${m%60} د`};

/* ───────── البيانات الثابتة ───────── */
const EXP_CATS=['ثلج','غاز','نظافة','مواصلات','صيانة','أخرى'];
const PAYL={cash:'كاش',visa:'فيزا',credit:'آجل'};
const TYPEL=t=>t==='table'?'طاولة':t==='car'?'سيارة':'سفري';

/* الصنف: n الاسم، p/c السعر والتكلفة، svc تحضيري بلا مخزون (مثل المشاوي)، own مخزونه الخاص بالحبة (يُنشأ من "الكمية الافتتاحية")،
   vars أحجام بأسعار مختلفة، bc باركود، icon إيموجي أو img صورة مصغّرة، gone محذوف (يبقى لأجل الفواتير القديمة) */
const PROD={};
const STOCK=[];   /* {id,n,unit,scale,min,start,own?} — الكميات بالحبة */
const prodIds=()=>Object.keys(PROD).filter(id=>!PROD[id].gone);
const prodVar=(pid,vid)=>vid?((PROD[pid].vars||[]).find(v=>v.id===vid)||null):null;
const unitPrice=l=>{const v=prodVar(l.pid,l.vid);return v?v.p:PROD[l.pid].p;};

/* ───────── الحالة ───────── */
const S={
 user:null,page:'dashboard',vat:false,nextInv:1001,rev:0,
 store:{name:'',desc:'',phone:'',qr:'',logo:'',float:'0.000'},
 meta:{uid:1,created:0,lastBackup:0,rec:null},
 users:[],shifts:[],invoices:[],custPays:[],expenses:[],purchases:[],suppPays:[],adjusts:[],customers:[],suppliers:[],
 cart:{lines:[],type:'table',ref:'',disc:'',note:''},posQ:'',
 ui:{exp:{amount:'',cat:'ثلج',note:'',from:'cash'},close:{counted:'',float:'0.000'},inv:{shift:'cur',f:'all',q:''},cust:{sel:null,q:''},pur:{tab:'inv'},profit:{range:'cur'},prod:{q:''}},
 m:null
};
const uid=()=>S.meta.uid++;
const curShift=()=>S.shifts[S.shifts.length-1];
const shiftOpen=()=>{const s=curShift();return !!s&&!s.end;};
const realShifts=()=>S.shifts.filter(s=>!s.init);
const roleName=()=>S.user?S.user.name:'—';
const tick=()=>Date.now();
/* تعديل سجل موجود (مثل إلغاء فاتورة): يُكتب في القاعدة مع التغييرات التالية */
const TOUCH=[];
const touch=(store,obj)=>{TOUCH.push([store,obj]);S.rev++;};

/* ───────── العمليات (كل شيء يتسجّل كحركة، لا أرصدة مخزّنة) ───────── */
const lineAmt=l=>l.amt!=null?l.amt:Math.round(l.price*l.qty);
function createInvoice(o){
  const sub=o.lines.reduce((a,l)=>a+lineAmt(l),0), total=sub-o.discount;
  const vat=S.vat?Math.round(total*5/105):0;
  const inv={id:S.nextInv++,t:o.t,shift:o.shift,type:o.type,ref:o.ref,
    lines:o.lines.map(l=>{const p=PROD[l.pid],v=prodVar(l.pid,l.vid);return {pid:l.pid,vid:l.vid||'',name:p.n+(v?' ('+v.n+')':''),qty:l.qty,price:l.price,cost:v?v.c:p.c,amt:lineAmt(l)};}),
    sub,discount:o.discount,total,vat,pay:o.pay,customerId:o.customerId,status:'ok',by:o.by,note:o.note||''};
  S.invoices.push(inv);return inv;
}
function createPurchase(o){const p={id:uid(),t:o.t,shift:o.shift,supplierId:o.supplierId,lines:o.lines,total:o.lines.reduce((a,l)=>a+l.cost,0),pay:o.pay,no:'م-'+(201+S.purchases.length)};S.purchases.push(p);return p;}
function cancelInvoice(id,reason,by,t){const i=ix().inv.get(id);i.status='cancelled';i.cancel={t,by,reason};touch('invoices',i);}

/* ───────── الحسابات المشتقة ─────────
   تُحسب مرة وحدة لكل تغيير في البيانات (فهرس)، فتبقى سريعة حتى مع عشرات الآلاف من الفواتير */
const ok=i=>i.status==='ok';
let _ix=null,_base='';
const grp=(map,k,v)=>{let a=map.get(k);if(!a){a=[];map.set(k,a);}a.push(v);};
const add=(map,k,v)=>map.set(k,(map.get(k)||0)+v);
function addInvoices(o,from){
  for(let n=from;n<S.invoices.length;n++){const i=S.invoices[n];o.inv.set(i.id,i);grp(o.invBy,i.shift,i);
    if(i.status!=='ok')continue;
    if(i.customerId!=null&&i.pay.credit)add(o.credit,i.customerId,i.pay.credit);
    for(const l of i.lines){const p=PROD[l.pid],u=p&&p.uses;if(u)for(const k in u)add(o.sold,k,Math.round(u[k]*l.qty));}}
  o.n=S.invoices.length;
}
function ix(){
  const base=S.custPays.length+'|'+S.purchases.length+'|'+S.suppPays.length+'|'+S.adjusts.length+'|'+S.expenses.length+'|'+S.shifts.length+'|'+S.rev+'|'+STOCK.length;
  if(_ix&&base===_base){   /* فاتورة جديدة فقط: نضيفها للفهرس بدون إعادة حساب كل شيء */
    if(S.invoices.length===_ix.n)return _ix;
    if(S.invoices.length>_ix.n){addInvoices(_ix,_ix.n);return _ix;}
  }
  _base=base;
  const o={n:0,inv:new Map(),invBy:new Map(),credit:new Map(),paid:new Map(),supCredit:new Map(),supPaid:new Map(),sold:new Map(),stockIn:new Map(),stockAdj:new Map(),cpBy:new Map(),purBy:new Map(),spBy:new Map(),expBy:new Map()};
  addInvoices(o,0);
  for(const p of S.custPays){add(o.paid,p.customerId,p.amount);grp(o.cpBy,p.shift,p);}
  for(const p of S.purchases){add(o.supCredit,p.supplierId,p.pay.credit);grp(o.purBy,p.shift,p);for(const l of p.lines)if(l.stockId)add(o.stockIn,l.stockId,l.qty);}
  for(const p of S.suppPays){add(o.supPaid,p.supplierId,p.amount);grp(o.spBy,p.shift,p);}
  for(const a of S.adjusts)add(o.stockAdj,a.stockId,a.delta);
  for(const e of S.expenses)grp(o.expBy,e.shift,e);
  return (_ix=o);
}
function shiftStats(id){
  const o=ix(),r={n:0,total:0,net:0,vat:0,cogs:0,cash:0,visa:0,credit:0,exp:0,disc:0};
  for(const i of (o.invBy.get(id)||[])){if(!ok(i))continue;r.n++;r.total+=i.total;r.vat+=i.vat;r.net+=i.total-i.vat;r.cash+=i.pay.cash;r.visa+=i.pay.visa;r.credit+=i.pay.credit;r.disc+=i.discount;
    for(const l of i.lines)r.cogs+=Math.round(l.cost*l.qty);}
  for(const e of (o.expBy.get(id)||[]))r.exp+=e.amount;
  r.profit=r.net-r.cogs-r.exp;return r;
}
function drawerRows(id){
  const o=ix(),sh=S.shifts.find(s=>s.id===id),sum=(arr,f)=>(arr||[]).reduce((a,x)=>a+f(x),0);
  return [['رصيد الافتتاح',sh.float,1],
   ['مبيعات كاش',sum(o.invBy.get(id),i=>ok(i)?i.pay.cash:0),1],
   ['سداد عملاء كاش',sum(o.cpBy.get(id),p=>p.method==='cash'?p.amount:0),1],
   ['مصروفات من الصندوق',sum(o.expBy.get(id),e=>e.from==='cash'?e.amount:0),-1],
   ['مشتريات كاش',sum(o.purBy.get(id),p=>p.pay.cash),-1],
   ['دفعات موردين كاش',sum(o.spBy.get(id),p=>p.method==='cash'?p.amount:0),-1]];
}
const drawer=id=>drawerRows(id).reduce((a,r)=>a+r[1]*r[2],0);
const custBal=id=>(ix().credit.get(id)||0)-(ix().paid.get(id)||0);
const suppBal=id=>(ix().supCredit.get(id)||0)-(ix().supPaid.get(id)||0);
function stockQty(id){
  const it=STOCK.find(s=>s.id===id);if(!it)return 0;const o=ix();
  return it.start+(o.stockIn.get(id)||0)+(o.stockAdj.get(id)||0)-(o.sold.get(id)||0);
}
const stockState=it=>{const q=stockQty(it.id);return q<=0?'out':q<=it.min?'low':'ok'};
const lowStock=()=>STOCK.filter(it=>stockState(it)!=='ok');
const qtyText=(it,b)=>{const v=b/it.scale;return (it.scale>1?(Math.round(v*10)/10).toFixed(1):String(Math.round(v)))+' '+it.unit};
function journal(inv){
  const L=[],net=inv.total-inv.vat;
  if(inv.pay.cash)L.push(['الصندوق','dr',inv.pay.cash]);
  if(inv.pay.visa)L.push(['البنك / الفيزا','dr',inv.pay.visa]);
  if(inv.pay.credit)L.push(['ذمم العملاء','dr',inv.pay.credit]);
  L.push(['المبيعات','cr',net]);
  if(inv.vat)L.push(['ضريبة القيمة المضافة المستحقة','cr',inv.vat]);
  const c=inv.lines.reduce((a,l)=>a+Math.round(l.cost*l.qty),0);
  L.push(['تكلفة المبيعات','dr',c]);L.push(['المخزون','cr',c]);return L;
}

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

/* ───────── واجهة بنفس تصميم برنامجك القديم (نفس الكلاسات ونفس القوالب) ───────── */
const CARD='bg-white dark:bg-darkCard rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-sm';
const INP='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold outline-none';
const SRCH='w-full pr-10 pl-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold outline-none';
const BTN='bg-primary hover:bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2';
const BTN_GREEN='bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md hover:bg-emerald-600 transition-all flex items-center justify-center gap-2';
const BTN_DARK='bg-gray-800 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2';
const BTN_GRAY='bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 py-3.5 rounded-2xl font-bold text-xs';
const TOOLBAR=CARD+' p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3';
const LBL='block text-[11px] font-bold text-gray-400 mb-1.5';
const SEGON='bg-blue-50 dark:bg-blue-900/40 text-primary border-2 border-primary shadow-md scale-[1.02] transition-all';
const SEGOFF='text-gray-500 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-all';
const m=b=>`<span class="num">${fmt(b)}</span> ر.ع`;
const mt=b=>fmt(b)+' ر.ع';
const ic=(n,c='')=>`<i class="fas ${n} ${c}"></i>`;

const NAV=[
 {id:'dashboard',t:'الرئيسية',sub:'ملخص الوردية الحالية',icon:'fa-chart-line',roles:'m'},
 {id:'pos',t:'نقطة البيع',sub:'إدارة ومتابعة نقطة البيع',icon:'fa-cash-register',roles:'mc'},
 {id:'invoices',t:'الفواتير',sub:'إدارة ومتابعة الفواتير',icon:'fa-receipt',roles:'mc'},
 {id:'customers',t:'العملاء',sub:'أرصدة العملاء وسندات القبض',icon:'fa-users',roles:'mc'},
 {id:'products',t:'المنتجات',sub:'إدارة ومتابعة المنتجات',icon:'fa-box',roles:'m'},
 {id:'inventory',t:'المخزون',sub:'المشاكيك والمشروبات والفحم',icon:'fa-boxes text-amber-500',roles:'m'},
 {id:'suppliers',t:'الموردين',sub:'فواتير المشتريات وحسابات الموردين',icon:'fa-truck text-emerald-500',roles:'m'},
 {id:'expenses',t:'المصروفات',sub:'تسجيل الصرف ومتابعته',icon:'fa-wallet',roles:'m'},
 {id:'profit',t:'الأرباح',sub:'الربح وأين فلوسك الآن',icon:'fa-coins text-blue-500',roles:'m'},
 {id:'watch',t:'المراقبة',sub:'الإلغاءات والخصومات وفروقات الصندوق',icon:'fa-eye text-purple-500',roles:'m'},
 {id:'shift',t:'الوردية',sub:'فتح الوردية وإقفالها',icon:'fa-clock text-blue-500',roles:'mc'},
 {id:'settings',t:'الإعدادات',sub:'إعدادات المتجر',icon:'fa-cogs',roles:'m'}
];
const isMgr=()=>!!S.user&&S.user.role==='manager';
const allowed=id=>NAV.some(n=>n.id===id&&n.roles.includes(isMgr()?'m':'c'));
const hashOf=id=>id==='settings'?'store-settings':id,pageOf=h=>h==='store-settings'?'settings':h;
const homePage=()=>isMgr()?'dashboard':'pos';
const typeText=i=>TYPEL(i.type)+(i.ref?' '+i.ref:'');
const custName=id=>(S.customers.find(c=>c.id===id)||{n:'—'}).n;
const suppName=id=>(S.suppliers.find(c=>c.id===id)||{n:'—'}).n;
const payBadges=i=>Object.keys(PAYL).filter(k=>i.pay[k]>0).map(k=>`<span class="${k==='credit'?'bg-amber-50 text-amber-700':'bg-blue-50 text-primary'} px-3 rounded-xl">${PAYL[k]}${Object.keys(PAYL).filter(z=>i.pay[z]>0).length>1?' '+fmt(i.pay[k]):''}</span>`).join(' ');
const tbl=(cols,rows)=>`<div class="${CARD} overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-right text-xs"><thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-bold border-b dark:border-gray-800"><tr>${cols.map(c=>`<th class="p-4 ${c[1]||''}">${c[0]}</th>`).join('')}</tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-800">${rows}</tbody></table></div></div>`;
const empty=(n,t)=>`<tr><td colspan="${n}" class="p-8 text-center text-gray-400 font-bold">${t}</td></tr>`;
const stat=(label,val,color)=>`<div class="${CARD} p-5"><p class="text-xs text-gray-400 font-bold mb-1">${label}</p><h3 class="text-lg lg:text-2xl font-black ${color}">${val}</h3></div>`;
const tile=(label,val,sub='')=>`<div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4"><p class="text-[11px] text-gray-400 font-bold mb-1">${label}</p><p class="text-lg font-black text-gray-800 dark:text-white">${val}</p>${sub?`<p class="text-[10px] text-gray-400 mt-0.5">${sub}</p>`:''}</div>`;
const infoBox=t=>`<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-3.5 text-[11px] font-bold text-primary leading-6">${ic('fa-info-circle','ml-1.5')}${t}</div>`;
const iconBtn=(a,id,icon,cls,title)=>`<button data-a="${a}" data-id="${id}" title="${title}" class="${cls} p-2 rounded-lg transition-colors">${icon}</button>`;

let toastN=0;
function showToast(message,type='success'){const c=$('#toast-container');const t=document.createElement('div');t.className=`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 ${type==='success'?'bg-emerald-50 border-emerald-100 text-emerald-500':'bg-red-50 border-red-100 text-red-500'}`;t.innerHTML=`<i class="fas ${type==='success'?'fa-check-circle':'fa-exclamation-circle'} text-base"></i><span>${esc(message)}</span>`;c.appendChild(t);setTimeout(()=>{t.classList.add('opacity-0','translate-y-[-10px]');setTimeout(()=>t.remove(),300);},2800);}
window.addEventListener('error',ev=>{if(ev.message&&ev.message!=='Script error.')try{showToast('خطأ غير متوقع: '+String(ev.message).slice(0,90),'error');}catch(e){}});
window.addEventListener('unhandledrejection',ev=>{try{showToast('خطأ غير متوقع: '+String((ev.reason&&ev.reason.message)||ev.reason||'').slice(0,90),'error');}catch(e){}});
function modal(html,size='max-w-md'){const b=$('#modal-box');b.className=`bg-white dark:bg-darkCard rounded-3xl shadow-2xl w-full ${size} p-6 max-h-[90dvh] overflow-y-auto`;b.innerHTML=html;$('#app-modal').classList.remove('hidden');}
function closeModal(){$('#app-modal').classList.add('hidden');$('#modal-box').innerHTML='';S.m=null;unstickSoon();}
const mHead=(icon,title)=>`<div class="flex justify-between items-center mb-4"><h3 class="text-lg font-black text-gray-800 dark:text-white">${icon}${title}</h3><button data-a="close-modal" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fas fa-times text-xl"></i></button></div>`;
const mActions=(ok,okLabel,okCls=BTN)=>`<div class="flex gap-3 pt-2"><button ${ok} class="flex-1 ${okCls}">${okLabel}</button><button data-a="close-modal" class="flex-1 ${BTN_GRAY}">إلغاء</button></div>`;

/* ── الشريط الجانبي والترويسة ── */
function renderChrome(){
  const items=NAV.filter(n=>n.roles.includes(isMgr()?'m':'c')),low=lowStock().length;
  $('#sidebar-nav').innerHTML=items.map(t=>{const act=t.id===S.page;
    const badge=(t.id==='inventory'&&low>0)?`<span class="stock-badge absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-darkCard">${low}</span>`:'';
    return `<button data-a="go" data-p="${t.id}" title="${t.t}" class="menu-btn group relative flex items-center gap-3 w-full px-3 py-2 rounded-2xl font-bold transition-all text-xs ${act?'text-primary dark:text-blue-300':'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}">${act?'<span class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full"></span>':''}<span class="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${act?'bg-primary text-white shadow-md shadow-primary/30':'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}"><i class="fas ${t.icon} menu-icon text-sm"></i>${badge}</span><span class="sidebar-text truncate">${t.t}</span></button>`;}).join('');
  const cur=NAV.find(n=>n.id===S.page);
  $('#page-title').textContent=cur.t;$('#page-subtitle').textContent=cur.sub;
  $('#profile-name').textContent=S.user.name;$('#profile-badge').textContent=isMgr()?'صلاحية مدير':'صلاحية كاشير';setAvatar($('#profile-avatar'));$('#sidebar-store-title').textContent=S.store.name;$('#auth-title').textContent=S.store.name;
  const sh=curShift(),open=!sh.end;
  $('#shift-chip').innerHTML=`<span class="w-1.5 h-1.5 ${open?'bg-emerald-500':'bg-red-500'} rounded-full"></span>${open?'وردية مفتوحة منذ '+hm(sh.start):'لا توجد وردية'}`;
  const nb=(id,icon,label,cls='')=>`<button data-a="go" data-p="${id}" class="flex flex-col items-center p-2 ${S.page===id?'text-primary':'text-gray-400 hover:text-primary'} transition-colors"><i class="fas ${icon} text-xl mb-1"></i><span class="text-[10px] font-bold">${label}</span></button>`;
  $('#mobile-bottom-nav').innerHTML=(isMgr()?nb('dashboard','fa-chart-pie','الرئيسية')+nb('products','fa-box','الأصناف'):nb('customers','fa-users','العملاء')+nb('shift','fa-clock','الوردية'))
   +`<div class="relative -top-6"><button data-a="go" data-p="pos" class="w-16 h-16 bg-primary text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-gray-50 dark:border-darkBg hover:scale-105 active:scale-95 transition-all"><i class="fas fa-cash-register text-2xl"></i></button></div>`
   +nb('invoices','fa-receipt','المبيعات')+`<button data-a="sidebar" class="flex flex-col items-center p-2 text-gray-400 hover:text-primary transition-colors"><i class="fas fa-bars text-xl mb-1"></i><span class="text-[10px] font-bold">المزيد</span></button>`;
}
function setAvatar(el){if(S.store.logo){el.innerHTML=`<img src="${S.store.logo}" class="w-full h-full object-cover rounded-full">`;el.classList.add('overflow-hidden');}else{el.textContent=(S.user.name||'م').charAt(0);el.classList.remove('overflow-hidden');}}
function sidebar(open){const s=$('#app-sidebar'),o=$('#sidebar-overlay');if(window.innerWidth<1024){s.classList.toggle('translate-x-full',!open);o.classList.toggle('hidden',!open);}}
function toggleSidebar(){const s=$('#app-sidebar');if(window.innerWidth<1024){sidebar(s.classList.contains('translate-x-full'));}else{s.classList.toggle('collapsed');S.sbCollapsed=s.classList.contains('collapsed');}}
function fitSidebar(){const s=$('#app-sidebar');if(window.innerWidth<1024)return;s.classList.toggle('collapsed',S.page==='pos'&&window.innerWidth<1280?true:!!S.sbCollapsed);}

/* ── الرئيسية ── */
function pgDashboard(){
  const sh=curShift(),st=shiftStats(sh.id),open=!sh.end&&!sh.init,hasP=prodIds().length>0;
  const crossed=open&&new Date().getDate()!==new Date(sh.start).getDate();
  const AL={red:'bg-red-50 dark:bg-red-950/40 text-red-500',emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',amber:'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'};
  const al=[];
  const bk=S.meta.lastBackup,days=bk?Math.floor((Date.now()-bk)/864e5):null;
  if(S.invoices.length&&(bk===0||days>=2))al.push(['fa-download',bk===0?'red':'amber',bk===0?'ما أخذت نسخة احتياطية للبيانات بعد':'آخر نسخة احتياطية قبل '+days+' أيام','البيانات محفوظة على هذا الآيباد فقط. خذ نسخة من الإعدادات']);
  lowStock().forEach(it=>al.push(['fa-triangle-exclamation','red',`${esc(it.n)} ${stockState(it)==='out'?'خلص':'قرب يخلص'}`,qtyText(it,stockQty(it.id))]));
  S.customers.forEach(c=>{if(c.gone)return;const b=custBal(c.id);if(b<0)al.push(['fa-hand-holding-usd','emerald',`${esc(c.n)}: له عندنا ${mt(-b)}`,'رصيد دائن بعد إلغاء فاتورة آجلة']);});
  const lc=[...S.shifts].reverse().find(s=>s.end&&s.diff);if(lc)al.push(['fa-clock',lc.diff<0?'red':'amber',`فرق صندوق ${mt(lc.diff)}`,'وردية '+dm(lc.start)]);
  const last=(ix().invBy.get(sh.id)||[]).slice(-6).reverse();
  const start=!hasP?`<div class="${CARD} p-5 space-y-3"><h4 class="font-black text-sm text-gray-800 dark:text-white">${ic('fa-flag-checkered','text-primary ml-2')} ابدأ من هنا</h4><p class="text-xs text-gray-500 font-bold leading-6">البرنامج جاهز وفاضي. أول شيء أضف أصنافك، بعدها افتح وردية وابدأ البيع.</p><div class="flex flex-wrap gap-2"><button data-a="go" data-p="products" class="${BTN}">${ic('fa-box')}<span>إضافة الأصناف</span></button><button data-a="go" data-p="shift" class="${BTN_DARK}">${ic('fa-clock')}<span>فتح وردية</span></button></div></div>`:'';
  return `<div class="tab-content active space-y-6">
   ${start}
   <div class="${TOOLBAR}"><div><h4 class="font-black text-sm text-gray-800 dark:text-white">${open?'الوردية الحالية':'لا توجد وردية مفتوحة'}</h4><p class="text-[11px] text-gray-400 mt-1">${open?`فُتحت ${dm(sh.start)} الساعة ${hm(sh.start)} · مضى عليها ${dur(Date.now()-sh.start)}${crossed?' · امتدت بعد منتصف الليل وما زالت نفس الوردية':''}`:'افتح وردية جديدة قبل البيع'}</p></div>
    <button data-a="go" data-p="shift" class="${open?BTN_DARK:BTN}">${ic('fa-clock')}<span>${open?'إقفال الوردية':'فتح وردية'}</span></button></div>
   <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">${stat('مبيعات الوردية',mt(st.total),'text-emerald-500')}${stat('عدد الفواتير',st.n+' فاتورة','text-blue-500')}${stat('المصروفات',mt(st.exp),'text-red-500')}${stat('صافي الربح حتى الآن',mt(st.profit),'text-amber-500')}</div>
   <div class="${CARD} p-5"><h4 class="font-bold text-xs mb-3 text-gray-600 dark:text-gray-300">${ic('fa-coins','ml-1.5 text-primary')} تفصيل الوردية</h4><div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${tile('كاش',mt(st.cash))}${tile('فيزا',mt(st.visa))}${tile('آجل',mt(st.credit),'على العملاء')}${tile('الكاش المتوقع بالصندوق',mt(drawer(sh.id)),'يشمل رصيد الافتتاح')}</div></div>
   <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="${CARD} p-5 lg:col-span-2"><h4 class="font-black text-xs text-red-500 mb-3 flex items-center gap-1.5">${ic('fa-triangle-exclamation')} تحتاج انتباهك</h4><div class="space-y-2">${al.map(a=>`<div class="flex items-center gap-3 p-3 rounded-2xl text-xs font-bold ${AL[a[1]]}">${ic(a[0])}<span class="flex-1">${a[2]}</span><span class="text-[10px] opacity-80">${a[3]}</span></div>`).join('')||'<p class="text-xs text-gray-400">لا شيء الآن.</p>'}</div></div>
    <div class="${CARD} p-5"><h4 class="font-bold text-xs mb-3 text-gray-600 dark:text-gray-300">${ic('fa-receipt','ml-1.5 text-primary')} آخر الفواتير</h4><table class="w-full text-right text-xs"><tbody class="divide-y divide-gray-100 dark:divide-gray-800">${last.map(i=>`<tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" data-a="inv" data-id="${i.id}"><td class="py-2.5 font-bold text-primary">${i.id}</td><td class="py-2.5 text-gray-500">${hm(i.t)}</td><td class="py-2.5 text-left font-black ${ok(i)?'text-emerald-500':'text-gray-400 line-through'}">${fmt(i.total)}</td></tr>`).join('')||`<tr><td class="py-6 text-center text-gray-400 font-bold">لا فواتير بعد</td></tr>`}</tbody></table></div>
   </div></div>`;
}

/* ── نقطة البيع (نفس تخطيط شاشتك) ──
   الصفحة نفسها ثابتة لا تتحرك: المنتجات تتمرر داخل بطاقتها فقط، والسلة داخل لوحتها فقط،
   وزر الدفع والإجمالي ثابتان. (القواعد في CSS: #main-content-area.pos-mode) */
const qtyStr=q=>Number.isInteger(q)?String(q):String(Math.round(q*1000)/1000);
const cartLineAmt=l=>l.amt!=null?l.amt:Math.round(unitPrice(l)*l.qty);
/* الصنف ذو المخزون الخاص لا يُباع أكثر من الموجود (مثل برنامجك القديم) */
const ownMax=l=>{const p=PROD[l.pid];if(!p.own)return Infinity;return Math.max(0,stockQty(p.own)-S.cart.lines.reduce((a,x)=>x!==l&&x.pid===l.pid?a+x.qty:a,0));};
const pic=p=>p.img?`<img src="${p.img}" alt="" class="w-full h-full object-cover">`:esc(p.icon||'📦');
const cartSub=()=>S.cart.lines.reduce((a,l)=>a+cartLineAmt(l),0);
const cartDisc=()=>Math.min(parseB(S.cart.disc),cartSub());
const cartTotal=()=>cartSub()-cartDisc();
const cartQtyMap=()=>{const mp=new Map();S.cart.lines.forEach(l=>mp.set(l.pid,(mp.get(l.pid)||0)+l.qty));return mp;};

function pgPos(){
  return `<div id="view-pos" class="tab-content active h-full relative"><div id="pos-layout" class="flex flex-col lg:flex-row gap-4 min-h-full pb-20 lg:pb-0 items-stretch">
   <div id="pos-products-card" class="flex-1 flex flex-col bg-white dark:bg-darkCard rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden h-[80vh] lg:h-full shrink-0 relative z-10">
    <div class="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800/80 flex gap-2 shrink-0"><div class="relative flex-1"><input type="text" id="pos-search" placeholder="ابحث باسم الصنف للبيع الفوري..." value="${esc(S.posQ)}" data-in="posq" class="${SRCH}"><i class="fas fa-search absolute right-3.5 top-3.5 text-gray-400 text-xs"></i></div></div>
    <div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start pb-32 lg:pb-4" id="pos-products-grid" style="-webkit-overflow-scrolling:touch"></div></div>
   <div id="cart-panel-container" class="fixed inset-x-0 bottom-0 z-[60] transform translate-y-full lg:translate-y-0 lg:relative lg:inset-auto lg:w-[410px] flex flex-col bg-white dark:bg-darkCard rounded-t-[2rem] lg:rounded-3xl border border-gray-200 dark:border-gray-700 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] lg:shadow-lg shrink-0 overflow-hidden h-[85vh] lg:h-full transition-transform duration-300">
    <div class="lg:hidden flex flex-col items-center pt-3 pb-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 shrink-0"><button data-a="cart-toggle" class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mb-3"></button><div class="w-full flex justify-between items-center px-5"><h3 class="font-black text-sm text-gray-700 dark:text-gray-200">سلة المبيعات</h3><button data-a="clear" class="text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-xl text-xs font-bold">${ic('fa-trash','ml-1')} تفريغ</button></div></div>
    <div class="hidden lg:flex p-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/30 items-center justify-between shrink-0"><div class="flex items-center gap-2">${ic('fa-shopping-basket','text-primary text-sm')}<h3 class="font-black text-xs text-gray-700 dark:text-gray-200">سلة المبيعات الفورية</h3></div><div class="flex items-center gap-2"><span class="bg-primary/10 text-primary px-2.5 py-1 rounded-xl text-[10px] font-extrabold" id="cart-count">0 صنف</span><button data-a="clear" class="bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors">${ic('fa-trash')} تفريغ</button></div></div>
    <div class="flex-1 overflow-y-auto p-3 space-y-2.5 scroll-smooth" id="cart-items" style="-webkit-overflow-scrolling:touch"></div>
    <div class="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/30 dark:bg-gray-800/10 space-y-3.5 shrink-0"><div class="flex items-center justify-between py-1"><span class="text-xs font-black text-gray-500">الإجمالي:</span><span class="text-2xl font-black text-emerald-500" id="cart-total">0.000 ر.ع</span></div><button data-a="pay" id="btn-pay" disabled class="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">متابعة الدفع</button></div>
   </div></div>
   <div id="mobile-cart-overlay" data-a="cart-toggle" class="lg:hidden fixed inset-0 bg-slate-900/60 z-[55] hidden"></div>
   <div class="lg:hidden fixed bottom-20 left-0 right-0 px-4 z-40 pointer-events-none flex justify-center"><button data-a="cart-toggle" id="mobile-fab" class="pointer-events-none w-full max-w-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-2xl rounded-2xl py-3.5 px-5 flex items-center justify-between font-black text-sm transition-all transform active:scale-95 translate-y-20 opacity-0"><div class="flex items-center gap-3"><div class="bg-white/20 dark:bg-black/10 w-8 h-8 rounded-full flex items-center justify-center text-xs" id="fab-count">0</div><span>إتمام الدفع</span></div><span id="fab-total" class="text-emerald-400 dark:text-emerald-600">0.000 ر.ع</span></button></div></div>`;
}

/* بطاقات الأصناف تُبنى مرة وحدة وتُحدَّث الشارة فقط عند تغيّر السلة (بدون إعادة رسم الشبكة) */
let posTiles=new Map(),posKey='';
const CHIP0='text-[9px] font-bold mt-1.5 block px-1 py-1 rounded-md ';
const nVars=p=>p.vars&&p.vars.length?' · '+p.vars.length+' أحجام':'';
const prodChip=id=>{const p=PROD[id],nv=nVars(p);
  if(p.svc)return ['خدمة فورية'+nv,'text-blue-500 bg-blue-50 dark:bg-blue-900/30',0];
  if(p.own){const q=stockQty(p.own),it=STOCK.find(x=>x.id===p.own);
    if(q<=0)return ['نفد المخزون'+nv,'text-red-500 bg-red-50 dark:bg-red-900/30',1];
    return ['مخزون: '+q+nv,q<=it.min?'text-amber-700 bg-amber-50 dark:bg-amber-900/20':'text-gray-500 bg-gray-100 dark:bg-gray-800',0];}
  return [((CATS.find(c=>c[0]===p.cat)||[])[1]||'')+nv,'text-gray-500 bg-gray-100 dark:bg-gray-800',0];};
function tileHTML(id,q,ch){const p=PROD[id];
  return `<button data-a="add" data-id="${id}" class="relative bg-white dark:bg-darkCard p-2.5 rounded-[1.25rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center overflow-visible active:scale-95 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900${ch[2]?' opacity-50 grayscale':''}">
   <div data-badge class="${q>0?'':'hidden '}absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-white dark:border-darkCard z-10">${q>0?qtyStr(q):''}</div>
   <div class="w-full aspect-square max-h-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-4xl mb-2 overflow-hidden">${pic(p)}</div>
   <div class="w-full flex flex-col justify-between flex-1 px-1"><span class="font-bold text-xs line-clamp-2 w-full mb-1 leading-snug text-gray-700 dark:text-gray-200">${esc(p.n)}</span>
    <div class="mt-auto pt-1 w-full border-t border-gray-50 dark:border-gray-700/50"><span class="text-xs sm:text-sm font-black text-emerald-500 block mt-1">${p.vars&&p.vars.length?'من ':''}<span class="num">${fmt(p.p)}</span> ر.ع</span><span data-chip class="${CHIP0}${ch[1]}">${esc(ch[0])}</span></div></div></button>`;}
function drawGrid(){
  const q=S.posQ.trim().toLowerCase(),g=$('#pos-products-grid');if(!g)return;
  const ids=prodIds().filter(id=>!q||PROD[id].n.toLowerCase().includes(q)||(PROD[id].bc||'').toLowerCase().includes(q));
  const key=q+'#'+ids.map(id=>{const p=PROD[id];return [id,p.n,p.p,p.icon,p.img?p.img.length+p.img.slice(-12):'',(p.vars||[]).length].join('|');}).join(',');
  if(key===posKey&&ids.length&&ids.every(id=>{const t=posTiles.get(id);return t&&t.el.isConnected;})){syncTiles();refreshChips();return;}
  posKey=key;posTiles.clear();
  if(!ids.length){g.innerHTML=`<p class="col-span-full text-center text-xs text-gray-400 font-bold py-12">${S.posQ.trim()?'لا نتائج':'لا توجد أصناف بعد — '+(isMgr()?'<button data-a="go" data-p="products" class="text-primary underline">أضف أصنافك</button>':'اطلب من المدير إضافتها')}</p>`;return;}
  const qty=cartQtyMap(),chips=ids.map(prodChip);g.innerHTML=ids.map((id,i)=>tileHTML(id,qty.get(id)||0,chips[i])).join('');
  [...g.children].forEach((el,i)=>posTiles.set(ids[i],{el,badge:el.querySelector('[data-badge]'),chip:el.querySelector('[data-chip]'),q:qty.get(ids[i])||0,cs:chips[i].join('|')}));
}
/* بعد البيع: يتغيّر نص المخزون على البطاقة فقط، بدون إعادة رسم الشبكة (حتى لا يرجع التمرير لفوق) */
function refreshChips(){posTiles.forEach((t,id)=>{const ch=prodChip(id),cs=ch.join('|');if(cs===t.cs)return;t.cs=cs;t.chip.textContent=ch[0];t.chip.className=CHIP0+ch[1];t.el.classList.toggle('opacity-50',!!ch[2]);t.el.classList.toggle('grayscale',!!ch[2]);});}
function syncTiles(){
  if(!posTiles.size)return;const qty=cartQtyMap();
  posTiles.forEach((t,id)=>{const q=qty.get(id)||0;if(q===t.q)return;t.q=q;const b=t.badge;
    if(q>0){b.textContent=qtyStr(q);b.classList.remove('hidden','animate-pop');void b.offsetWidth;b.classList.add('animate-pop');}else b.classList.add('hidden');});
}
/* تحديث الإجماليات وزر الدفع بدون إعادة رسم الأسطر (حتى لا يضيع مؤشر الكتابة) */
const CART_KEY='cafe-cart';
function saveCart(){try{const c=S.cart;if(c.lines.length)localStorage.setItem(CART_KEY,JSON.stringify(c));else localStorage.removeItem(CART_KEY);}catch(e){}}
function loadCart(){try{const c=JSON.parse(localStorage.getItem(CART_KEY)||'null');if(c&&Array.isArray(c.lines)){c.lines=c.lines.filter(l=>PROD[l.pid]&&!PROD[l.pid].gone&&l.qty>0);if(c.lines.length)S.cart=Object.assign({type:'table',ref:'',disc:'',note:''},c);}}catch(e){}}
function cartSync(){
  saveCart();
  const c=S.cart,t=cartTotal(),n=c.lines.reduce((a,l)=>a+l.qty,0),open=shiftOpen();
  $('#cart-count').textContent=qtyStr(Math.round(n*10)/10)+' صنف';$('#cart-total').innerHTML=m(t);
  $('#btn-pay').disabled=!(c.lines.length&&open&&t>0);
  const fab=$('#mobile-fab');if(fab){const show=c.lines.length&&$('#cart-panel-container').classList.contains('translate-y-full');
    fab.classList.toggle('translate-y-20',!show);fab.classList.toggle('opacity-0',!show);fab.classList.toggle('pointer-events-none',!show);fab.classList.toggle('pointer-events-auto',!!show);$('#fab-count').textContent=qtyStr(Math.round(n*10)/10);$('#fab-total').textContent=mt(t);}
  syncTiles();
}
function drawCart(){
  const c=S.cart,open=shiftOpen();
  $('#cart-items').innerHTML=c.lines.length?c.lines.map((l,ix)=>{const p=PROD[l.pid],v=prodVar(l.pid,l.vid);
    return `<div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl flex items-center justify-between border dark:border-gray-700 relative"><div class="flex items-center gap-3 flex-1 min-w-0"><div class="w-10 h-10 bg-white dark:bg-darkCard rounded-xl flex items-center justify-center text-2xl overflow-hidden shrink-0">${pic(p)}</div><div class="min-w-0 flex-1"><p class="font-bold text-xs leading-snug line-clamp-2 break-words">${esc(p.n)}${v?` <span class="text-gray-400 font-semibold">(${esc(v.n)})</span>`:''}</p><span class="text-xs font-black text-emerald-500"><span class="num">${fmt(unitPrice(l))}</span></span></div></div><div class="flex items-center gap-2"><div class="flex items-center bg-white dark:bg-darkCard rounded-xl shadow-sm h-8 border dark:border-gray-600"><button data-a="inc" data-ix="${ix}" class="w-8 text-primary hover:bg-gray-100 dark:hover:bg-gray-700 font-bold">+</button><input type="number" id="cqty-${ix}" data-in="cqty" data-ix="${ix}" value="${qtyStr(Math.round(l.qty*1000)/1000)}" step="any" inputmode="decimal" class="w-12 bg-transparent text-center font-black text-xs outline-none"><button data-a="dec" data-ix="${ix}" class="w-8 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold">-</button></div><input type="number" id="ctot-${ix}" data-in="ctot" data-ix="${ix}" step="0.001" inputmode="decimal" value="${fmt(cartLineAmt(l))}" class="w-16 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 text-center font-black text-xs p-1.5 rounded-lg outline-none text-primary"><button data-a="rm" data-ix="${ix}" class="text-gray-300 hover:text-red-500"><i class="fas fa-times-circle text-sm"></i></button></div></div>`;}).join('')
   :`<div class="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 pt-16"><i class="fas fa-shopping-basket text-4xl mb-3"></i><p class="font-bold text-xs">${open?'السلة فارغة':'الوردية مقفلة، افتح وردية جديدة'}</p></div>`;
  cartSync();
}
function cartAdd(id,vid){vid=vid||'';const p=PROD[id];
  if(p.own){const q=stockQty(p.own),used=S.cart.lines.reduce((a,x)=>x.pid===id?a+x.qty:a,0);if(used+1>q+1e-9){showToast(q<=0?'نفد المخزون':'تجاوزت الكمية المتوفرة!','error');return;}}
  const l=S.cart.lines.find(x=>x.pid===id&&(x.vid||'')===vid);if(l){l.qty++;delete l.amt;}else S.cart.lines.push(vid?{pid:id,vid,qty:1}:{pid:id,qty:1});drawCart();
  setTimeout(()=>{const ci=$('#cart-items');if(ci)ci.scrollTo({top:9999,behavior:'smooth'});},100);}

/* صنف بأحجام (صغير / وسط / كبير): تظهر نافذة اختيار الحجم قبل الإضافة للسلة */
function tapProduct(id){const p=PROD[id];if(p.vars&&p.vars.length)sizePicker(id);else cartAdd(id);}
function sizePicker(id){const p=PROD[id],q=new Map();S.cart.lines.forEach(l=>{if(l.pid===id&&l.vid)q.set(l.vid,(q.get(l.vid)||0)+l.qty);});S.m={type:'vp',id};
  modal(`${mHead('',esc(p.n))}<div class="space-y-2.5">${p.vars.map(v=>`<button data-a="vpick" data-id="${id}" data-v="${v.id}" class="flex items-center justify-between gap-3 w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 active:scale-[0.98] hover:border-primary transition-all"><span class="font-black text-sm text-gray-700 dark:text-gray-100">${esc(v.n)}${q.get(v.id)?` <span class="text-[10px] text-red-500 font-black">(بالسلة ${qtyStr(q.get(v.id))})</span>`:''}</span><span class="font-black text-sm text-emerald-500"><span class="num">${fmt(v.p)}</span> ر.ع</span></button>`).join('')}</div>`,'max-w-sm');}

/* ── نافذة إتمام البيع (نفس نافذتك: نوع الطلب، طريقة الدفع، العميل، الخصم، ملاحظة، المستلم والباقي) ── */
function openCheckout(){
  const c=S.cart;S.m={type:'pay',mode:'cash'};
  modal(`${mHead('','إتمام عملية البيع')}<div class="space-y-4">
   <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-2">
    <div class="flex justify-between text-[11px] font-bold text-gray-500"><span>المجموع قبل الخصم:</span><span id="ck-sub"></span></div>
    <div id="ck-disc-row" class="hidden flex justify-between text-[11px] font-bold text-gray-500"><span>الخصم:</span><span id="ck-disc"></span></div>
    <div id="ck-vat-row" class="hidden flex justify-between text-[11px] font-bold text-gray-500"><span>منها ضريبة القيمة المضافة (5%):</span><span id="ck-vat"></span></div>
    <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700"><span class="text-xs font-black text-gray-800 dark:text-gray-300">الإجمالي النهائي:</span><span class="text-2xl font-black text-emerald-500" id="ck-total"></span></div></div>
   <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl" id="order-types">${[['table','🍽️ طاولة'],['car','🚗 سيارة']].map(([k,n])=>`<button data-a="otype" data-k="${k}" class="py-3 rounded-xl text-xs ${c.type===k?'font-black '+SEGON:'font-bold '+SEGOFF}">${n}</button>`).join('')}</div>
   <div id="car-row" class="${c.type==='car'?'':'hidden'}"><label class="${LBL}">${ic('fa-car','ml-1 text-primary')} رقم السيارة</label><input type="text" id="oref" data-in="oref" value="${esc(c.ref)}" autocomplete="off" placeholder="مثال: 12345 أ" class="w-full px-4 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800/50 text-sm font-black outline-none focus:border-primary text-center tracking-wide"></div>
   <div class="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl" id="pay-modes">${[['cash','💵 كاش'],['visa','💳 فيزا'],['credit','📝 آجل / دين']].map(([k,n])=>`<button data-a="pq" data-k="${k}" class="py-2.5 rounded-xl text-[11px] ${k==='cash'?'font-black '+SEGON:'font-bold '+SEGOFF}">${n}</button>`).join('')}</div>
   <div class="grid grid-cols-2 gap-2"><select id="p-cust" data-in="pay" class="hidden w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl text-[11px] font-bold outline-none"><option value="">-- اختر العميل --</option>${S.customers.filter(x=>!x.gone).map(x=>`<option value="${x.id}">${esc(x.n)}</option>`).join('')}</select><input type="text" inputmode="decimal" id="odisc" data-in="odisc" value="${esc(c.disc)}" placeholder="خصم فوري ر.ع" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl text-xs font-bold outline-none"></div>
   <div><label class="${LBL}" for="onote">📝 ملاحظات على الطلب <span class="font-semibold">(اختياري)</span></label><textarea id="onote" rows="2" maxlength="300" autocomplete="off" placeholder="مثال: بدون بصل، تغليف منفصل، الاسم..." class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold outline-none focus:border-primary resize-none">${esc(c.note||'')}</textarea></div>
   <div id="cash-calc" class="bg-blue-50 dark:bg-blue-900/20 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/50 space-y-2.5 transition-all"><div class="flex items-center justify-between gap-2"><label class="text-xs font-black text-gray-700 dark:text-gray-300" for="p-recv">المبلغ المستلم:</label><input type="number" id="p-recv" data-in="pay" placeholder="0.000" min="0" step="0.001" inputmode="decimal" class="w-24 px-2 py-2 bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black outline-none focus:border-primary text-center"></div><div class="flex items-center justify-between border-t border-blue-200/50 dark:border-blue-800/50 pt-2.5"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">الباقي للعميل:</span><span class="text-lg font-black text-primary" id="p-change">0.000 ر.ع</span></div></div>
   <button id="p-ok" data-a="pay-ok" class="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">تأكيد الدفع وحفظ الطلب</button></div>`);
  payRecalc();
}
function payRecalc(){
  const s=S.m;if(!s||s.type!=='pay')return;
  const t=cartTotal(),sub=cartSub(),d=cartDisc(),vat=S.vat?Math.round(t*5/105):0;
  $('#ck-sub').textContent=mt(sub);$('#ck-total').innerHTML=m(t);
  $('#ck-disc-row').classList.toggle('hidden',!d);$('#ck-disc').textContent='−'+mt(d);
  $('#ck-vat-row').classList.toggle('hidden',!vat);$('#ck-vat').textContent=mt(vat);
  const r=Math.round((parseFloat($('#p-recv').value)||0)*1000),ch=$('#p-change');
  if(r===0){ch.textContent='0.000 ر.ع';ch.className='text-lg font-black text-primary';}
  else if(r>=t){ch.textContent=mt(r-t);ch.className='text-lg font-black text-emerald-500';}
  else{ch.textContent='المبلغ ناقص!';ch.className='text-sm font-black text-rose-500';}
  cartSync();
}
function payMode(k){
  S.m.mode=k;
  document.querySelectorAll('#pay-modes [data-a="pq"]').forEach(b=>{b.className=`py-2.5 rounded-xl text-[11px] ${b.dataset.k===k?'font-black '+SEGON:'font-bold '+SEGOFF}`;});
  $('#p-cust').classList.toggle('hidden',k!=='credit');$('#cash-calc').classList.toggle('hidden',k!=='cash');
}
let paying=false;
async function payConfirm(){
  if(paying)return;
  const s=S.m,c=S.cart,total=cartTotal();
  if(!c.lines.length||total<=0)return;
  if(!shiftOpen()){showToast('افتح وردية أول','error');return;}
  if(s.mode==='credit'&&!$('#p-cust').value){showToast('يرجى تحديد العميل','error');return;}
  paying=true;const btn=$('#p-ok');if(btn){btn.disabled=true;btn.classList.add('opacity-60');}
  try{
    const pay={cash:0,visa:0,credit:0};pay[s.mode]=total;
    const inv=createInvoice({lines:c.lines.filter(l=>l.qty>0).map(l=>({pid:l.pid,vid:l.vid,qty:l.qty,price:unitPrice(l),amt:cartLineAmt(l)})),type:c.type,ref:c.type==='car'?($('#oref').value||'').trim():'',note:($('#onote').value||'').trim().slice(0,300),discount:cartDisc(),pay,customerId:s.mode==='credit'?Number($('#p-cust').value):null,t:tick(),shift:curShift().id,by:roleName()});
    S.cart={lines:[],type:'table',ref:'',disc:'',note:''};
    await persist();
    const sheet=$('#cart-panel-container');if(sheet&&!sheet.classList.contains('translate-y-full'))A['cart-toggle']();
    closeModal();if(S.page==='pos'){drawCart();renderChrome();refreshChips();}else render();
    showInvoicePreview(inv);showToast(PS.err?'تنبيه: لم يُحفظ على الجهاز!':'تم الحفظ',PS.err?'error':'success');
  }finally{paying=false;}
}

/* ── الفاتورة: معاينة بعرض الورق الحراري 72mm، مع واتساب ومشاركة PDF وطباعة (نفس أزرارك) ── */
function invDate(ms,plain){const d=new Date(ms);
  try{const g=d.toLocaleDateString('ar-OM-u-ca-gregory-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}),
    h=d.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn',{year:'numeric',month:'long',day:'numeric'}).replace(/\s*هـ\s*$/,''),
    t=d.toLocaleTimeString('ar-OM-u-nu-latn',{hour:'2-digit',minute:'2-digit'});
    return `${g} م — ${h} هـ${plain?' — ':'<br>'}${t}`;}catch(e){return d.toLocaleString('ar-OM');}}
const qrCache=new Map();
function qrURL(text){if(!text)return '';if(qrCache.has(text))return qrCache.get(text);let u;
  try{const q=window.qrcode(0,'M');q.addData(text);q.make();u=q.createDataURL(3,8);}catch(e){u='https://api.qrserver.com/v1/create-qr-code/?size=90x90&data='+encodeURIComponent(text);}
  qrCache.set(text,u);return u;}
function qrHandle(url){if(!url)return '';try{const p=url.replace(/^https?:\/\//i,'').replace(/^www\./i,'').split('?')[0].split('/').filter(Boolean);return p.length>1?'@'+p[p.length-1]:'';}catch(e){return '';}}
const payText=i=>Object.keys(PAYL).filter(k=>i.pay[k]>0).map(k=>PAYL[k]+(Object.keys(PAYL).filter(z=>i.pay[z]>0).length>1?' '+fmt(i.pay[k]):'')).join(' + ');
function receiptInner(inv){
  const st=S.store,qr=qrURL(st.qr),handle=qrHandle(st.qr);
  const logo=st.logo?`<img src="${st.logo}" style="width:50px;height:50px;object-fit:cover;margin:0 auto 8px auto;border-radius:8px;display:block">`:'';
  const rows=inv.lines.map(l=>`<tr style="border-bottom:1px dashed #ccc"><td style="padding:4px 0;word-break:break-word">${esc(l.name)}</td><td style="text-align:center">${qtyStr(Math.round(l.qty*1000)/1000)}</td><td style="text-align:left">${fmt(l.amt)}</td></tr>`).join('');
  const cust=inv.customerId?custName(inv.customerId):'عميل نقدي';
  return `<div style="text-align:center;border-bottom:1px dashed #000;margin-bottom:8px;padding-bottom:8px">${logo}<h2 style="margin:0;font-size:15px">${esc(st.name)}</h2><p style="margin:2px 0;font-size:10px">${esc(st.desc)}</p><p style="margin:2px 0;font-size:10px">${invDate(inv.t)}</p></div>
  <div style="border-bottom:1px dashed #000;margin-bottom:8px;padding-bottom:8px;font-size:10.5px"><p style="margin:2px 0"><strong>رقم:</strong> #${inv.id}</p><p style="margin:2px 0"><strong>العميل:</strong> ${esc(cust)}</p><p style="margin:2px 0"><strong>دفع:</strong> ${payText(inv)}</p>${inv.type==='car'&&inv.ref?`<p style="margin:2px 0;font-size:12px"><strong>رقم السيارة:</strong> ${esc(inv.ref)}</p>`:''}${inv.note?`<p style="margin:2px 0;font-size:11px"><strong>ملاحظات:</strong> ${esc(inv.note)}</p>`:''}<p style="margin:2px 0"><strong>كاشير:</strong> ${esc(inv.by)}</p></div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10.5px"><thead><tr><th style="text-align:right;border-bottom:1px solid #000">صنف</th><th style="text-align:center;border-bottom:1px solid #000">الكمية</th><th style="text-align:left;border-bottom:1px solid #000">مجموع</th></tr></thead><tbody>${rows}</tbody></table>
  <div style="border-bottom:1px dashed #000;margin-bottom:8px;padding-bottom:8px;font-size:11px">${inv.discount>0?`<div style="display:flex;justify-content:space-between"><span>الخصم:</span><span>${fmt(inv.discount)}</span></div>`:''}${inv.vat>0?`<div style="display:flex;justify-content:space-between"><span>منها ضريبة 5%:</span><span>${fmt(inv.vat)}</span></div>`:''}<div style="display:flex;justify-content:space-between;margin-top:5px;font-weight:bold"><span>الصافي:</span><span>${fmt(inv.total)} ر.ع</span></div></div>
  ${inv.status!=='ok'?`<div style="text-align:center;margin:6px 0;color:#b34a3e;font-weight:900;border:2px solid #b34a3e;border-radius:6px;padding:3px 0">فاتورة ملغاة</div>`:''}
  ${qr?`<div style="text-align:center;margin-top:10px"><img src="${qr}" style="width:75px;height:75px;margin:0 auto"><p style="margin:3px 0 0 0;font-size:9px">تابعنا على انستقرام</p>${handle?`<p style="margin:1px 0 0 0;font-size:10px;font-weight:bold;direction:ltr">${esc(handle)}</p>`:''}</div>`:''}`;
}
function showInvoicePreview(inv){S.pv=inv;prepShare(inv);$('#invoice-preview-content').innerHTML=receiptInner(inv);$('#invoice-preview-modal').classList.remove('hidden');}
function closePreview(){$('#invoice-preview-modal').classList.add('hidden');unstickSoon();}
function printInvoice(inv){
  const f=document.createElement('iframe');f.style.display='none';document.body.appendChild(f);
  const qr=qrURL(S.store.qr);let inner=receiptInner(inv);
  if(qr)inner=inner.replace(/<img src="data:image\/gif[^>]*>|<img src="https:\/\/api\.qrserver[^>]*>/,mm=>mm.replace('<img ','<img onload="window.print()" '));
  const c=`<html dir="rtl"><head><meta charset="utf-8"><style>@page{size:72mm auto;margin:0}*{box-sizing:border-box}body{font-family:Tahoma,'Cairo',sans-serif;margin:0 auto;padding:4mm 2mm;width:72mm;max-width:72mm;font-size:11px;color:#000;line-height:1.3}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{text-align:right;padding-bottom:4px;border-bottom:1px solid #000;font-size:11px}td{font-size:10.5px}</style></head><body>${inner}${qr?'':'<script>window.onload=function(){window.print()}<\/script>'}</body></html>`;
  try{const d=f.contentWindow.document;d.open();d.write(c);d.close();}catch(e){showToast('تعذّر تجهيز الطباعة','error');}
  setTimeout(()=>{try{document.body.removeChild(f);}catch(e){}},5000);
}
let h2pP=null;
function ensureHtml2pdf(){
  if(window.html2pdf)return Promise.resolve(window.html2pdf);if(h2pP)return h2pP;
  const MSG='تعذّر تحميل مكتبة الـPDF — تأكد من اتصال الإنترنت ثم أعد المحاولة';
  h2pP=new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/html2pdf.bundle.min.js';
    const t=setTimeout(()=>{h2pP=null;rej(new Error(MSG));},20000);
    s.onload=()=>{clearTimeout(t);window.html2pdf?res(window.html2pdf):(h2pP=null,rej(new Error(MSG)));};
    s.onerror=()=>{clearTimeout(t);h2pP=null;rej(new Error(MSG));};document.head.appendChild(s);});
  return h2pP;
}
/* ملف الفاتورة للمشاركة: PDF (واتساب) أو صورة PNG بعرض 576 نقطة (تطبيقات الطابعات الحرارية). يُجهَّز مسبقاً عند ظهور الفاتورة حتى تكون المشاركة فورية داخل لمسة المستخدم (شرط iOS) */
async function makeInvoiceFile(inv){
  const png=S.store.shareFmt==='png',h2=await ensureHtml2pdf();
  const el=document.createElement('div');el.innerHTML=`<div style="width:${png?'270px':'72mm'};padding:10px;font-family:'Cairo',sans-serif;direction:rtl;background:#fff;color:#000;box-sizing:border-box">${receiptInner(inv)}</div>`;
  if(png){const cv=await h2().set({html2canvas:{scale:576/290,useCORS:true,backgroundColor:'#ffffff'}}).from(el).toCanvas().get('canvas');
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));return new File([blob],`Invoice_${inv.id}.png`,{type:'image/png'});}
  const blob=await h2().set({margin:0,filename:`Invoice_${inv.id}.pdf`,image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:[72,200],orientation:'portrait'}}).from(el).output('blob');
  return new File([blob],`Invoice_${inv.id}.pdf`,{type:'application/pdf'});
}
function prepShare(inv){const fm=S.store.shareFmt==='png'?'png':'pdf';S.sharePre={id:inv.id,fmt:fm,p:null};setTimeout(()=>{if(S.sharePre&&S.sharePre.id===inv.id)S.sharePre.p=makeInvoiceFile(inv).catch(()=>null);},500);}
async function shareInvoiceFile(inv){
  const btn=$('#btn-share-preview'),orig=btn.innerHTML;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';btn.disabled=true;
  try{
    const fm=S.store.shareFmt==='png'?'png':'pdf',pre=S.sharePre&&S.sharePre.id===inv.id&&S.sharePre.fmt===fm&&S.sharePre.p;
    let file=pre?await pre:null;if(!file)file=await makeInvoiceFile(inv);
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:`فاتورة #${inv.id}`,files:[file]});}catch(err){if(err.name!=='AbortError')console.log('Share error:',err);}}
    else{const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(u),15000);showToast('جُهّز ملف الفاتورة للمشاركة');}
  }catch(e){showToast((e&&e.message)||'حدث خطأ أثناء المعالجة','error');}
  finally{btn.innerHTML=orig;btn.disabled=false;}
}
function normalizePhone(raw){if(!raw)return '';let d=String(raw).replace(/[^\d]/g,'');d=d.replace(/^00/,'');if(d.length===8)d='968'+d;else if(d.length===9&&d.startsWith('0'))d='968'+d.slice(1);return d;}
function invoiceText(inv){
  const st=S.store,L=[];
  L.push(`*${st.name}*`);if(st.desc)L.push(st.desc);L.push('');
  L.push(`فاتورة رقم: #${inv.id}`);L.push(`التاريخ: ${invDate(inv.t,true)}`);
  if(inv.customerId)L.push(`العميل: ${custName(inv.customerId)}`);
  if(inv.type==='car'&&inv.ref)L.push(`رقم السيارة: ${inv.ref}`);
  if(inv.note)L.push(`ملاحظات: ${inv.note}`);
  L.push('––––––––––––');inv.lines.forEach(l=>L.push(`${l.name} × ${qtyStr(Math.round(l.qty*1000)/1000)} = ${fmt(l.amt)}`));L.push('––––––––––––');
  if(inv.discount>0)L.push(`الخصم: ${fmt(inv.discount)}`);
  if(inv.vat>0)L.push(`منها ضريبة 5%: ${fmt(inv.vat)}`);
  L.push(`*الإجمالي: ${fmt(inv.total)} ر.ع*`);L.push(`طريقة الدفع: ${payText(inv)}`);L.push('');
  if(inv.customerId){const n=S.invoices.filter(i=>i.customerId===inv.customerId&&i.status==='ok').length;L.push(n>1?`زيارتكم رقم ${n} معنا — نورتونا! 🌿`:'شكراً لزيارتكم 🌿');}else L.push('شكراً لزيارتكم 🌿');
  if(st.qr)L.push(`تابعنا: ${st.qr}`);
  return L.join('\n');
}
function waOpen(title,ph,text){
  S.waText=text;$('#wa-phone').value=normalizePhone(ph).replace(/^968/,'');
  $('#wa-preview').textContent=text;$('#wa-title').textContent=title;
  $('#whatsapp-modal').classList.remove('hidden');waRefresh();setTimeout(()=>$('#wa-phone').focus(),100);
}
function openWhatsApp(inv){const c=inv.customerId?S.customers.find(x=>x.id===inv.customerId):null;waOpen('إرسال الفاتورة',c?c.ph:'',invoiceText(inv));}
const waHref=()=>{const phone=normalizePhone($('#wa-phone').value);return phone.length<11?'#':`https://wa.me/${phone}?text=${encodeURIComponent(S.waText)}`;};
function waRefresh(){$('#wa-send').href=waHref();}

/* ── الفواتير ── */
function invList(){
  const u=S.ui.inv,cur=curShift().id,sid=u.shift==='cur'?cur:Number(u.shift),q=u.q.trim();
  if(/^\d{4,}$/.test(q)){const i=ix().inv.get(+q);return i?[i]:[];}   /* رقم فاتورة كامل: يُبحث في كل الورديات */
  let l=(ix().invBy.get(sid)||[]).slice();
  if(u.f==='cancelled')l=l.filter(i=>!ok(i));else if(u.f!=='all')l=l.filter(i=>i.pay[u.f]>0&&ok(i));
  if(u.q.trim())l=l.filter(i=>String(i.id).includes(u.q.trim()));
  return l.slice().reverse();
}
function invBody(){
  const l=invList(),shown=l.slice(0,80),good=l.filter(ok);
  $('#inv-count').textContent=good.length;$('#inv-total').textContent=mt(good.reduce((a,i)=>a+i.total,0));
  $('#invoices-table-body').innerHTML=shown.map(i=>`<tr class="hover:bg-gray-50 dark:hover:bg-gray-800 ${ok(i)?'':'opacity-60'}"><td class="p-4 font-bold text-primary">${i.id}</td><td class="p-4">${dm(i.t)} ${hm(i.t)}</td><td class="p-4 text-center font-bold text-gray-500">${esc(i.by)}</td><td class="p-4 text-center">${payBadges(i)}</td><td class="p-4 text-center text-red-500">${i.discount?fmt(i.discount):'0'}</td><td class="p-4 text-center font-black ${ok(i)?'text-emerald-500':'text-gray-400 line-through'}">${fmt(i.total)}</td><td class="p-4 flex gap-2"><button data-a="inv-prev" data-id="${i.id}" title="عرض وطباعة" class="text-emerald-500 hover:bg-emerald-50 p-2 rounded-lg transition-colors">${ic('fa-eye')}</button><button data-a="inv-wa" data-id="${i.id}" title="مشاركة الفاتورة عبر واتساب" class="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"><i class="fab fa-whatsapp"></i></button>${ok(i)?'':'<span class="text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded">ملغاة</span>'}${isMgr()?`<button data-a="inv" data-id="${i.id}" title="${ok(i)?'إلغاء / تفاصيل':'تفاصيل'}" class="${ok(i)?'text-amber-500 hover:bg-amber-50':'text-gray-400 hover:bg-gray-100'} p-2 rounded-lg transition-colors">${ic(ok(i)?'fa-undo':'fa-info-circle')}</button>`:''}</td></tr>`).join('')||empty(7,'لا يوجد مبيعات');
}
function pgInvoices(){
  const u=S.ui.inv,cur=curShift().id;
  return `<div class="tab-content active space-y-6"><div class="${TOOLBAR}"><div class="relative w-full sm:w-64"><input type="text" id="inv-search" data-in="invq" value="${esc(u.q)}" placeholder="ابحث برقم الفاتورة..." class="${SRCH}"><i class="fas fa-search absolute right-3.5 top-3.5 text-gray-400 text-xs"></i></div>
   <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"><select data-in="invshift" class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold outline-none">${[...S.shifts].reverse().slice(0,90).map(s=>`<option value="${s.id===cur?'cur':s.id}" ${((u.shift==='cur'&&s.id===cur)||String(s.id)===String(u.shift))?'selected':''}>${s.id===cur?(s.init?'لا وردية بعد':'الوردية الحالية'):'وردية '+dm(s.start)}</option>`).join('')}</select>
   <select data-in="invf" class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold outline-none">${[['all','كل الفواتير'],['cash','كاش'],['visa','فيزا'],['credit','آجل'],['cancelled','الملغاة']].map(([k,n])=>`<option value="${k}" ${u.f===k?'selected':''}>${n}</option>`).join('')}</select></div></div>
   <div class="grid grid-cols-2 gap-4"><div class="${CARD} p-4 flex flex-col items-center justify-center"><span class="text-xs text-gray-500 font-bold mb-1">عدد الفواتير المعروضة</span><span id="inv-count" class="text-xl font-black text-blue-500">0</span></div><div class="${CARD} p-4 flex flex-col items-center justify-center"><span class="text-xs text-gray-500 font-bold mb-1">إجمالي المبيعات (الصافي)</span><span id="inv-total" class="text-xl font-black text-emerald-500">0.000 ر.ع</span></div></div>
   ${tbl([['رقم الفاتورة'],['التاريخ'],['الكاشير','text-center'],['طريقة الدفع','text-center'],['الخصم','text-center'],['الصافي','text-center'],['الإجراءات','text-left']],'<tr><td></td></tr>').replace('<tbody class="divide-y divide-gray-100 dark:divide-gray-800"><tr><td></td></tr></tbody>','<tbody id="invoices-table-body" class="divide-y divide-gray-100 dark:divide-gray-800"></tbody>')}
   <p class="text-[11px] text-gray-400">الأرقام متسلسلة ولا تتغير، والإلغاء يبقى له أثر في السجل.</p></div>`;
}
function showInvoice(id,cancelling=false){
  const i=ix().inv.get(id);S.m={type:'inv',id,reason:''};
  const canCancel=ok(i)&&i.shift===curShift().id&&shiftOpen();
  modal(`${mHead(ic('fa-receipt','text-primary ml-2'),'فاتورة '+i.id)}<div class="space-y-4">
   <p class="text-[11px] text-gray-400 font-bold">${dm(i.t)} ${hm(i.t)} · ${typeText(i)} · ${esc(i.by)}${i.customerId?' · العميل: '+esc(custName(i.customerId)):''}</p>
   <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-2 text-xs">${i.lines.map(l=>`<div class="flex justify-between"><span>${esc(l.name)} × ${qtyStr(Math.round(l.qty*1000)/1000)}</span><span class="font-bold">${fmt(l.amt)}</span></div>`).join('')}
    ${i.discount?`<div class="flex justify-between text-red-500"><span>خصم</span><span>−${fmt(i.discount)}</span></div>`:''}${i.vat?`<div class="flex justify-between text-gray-500"><span>منها ضريبة 5%</span><span>${fmt(i.vat)}</span></div>`:''}
    <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-black"><span>الإجمالي</span><span class="text-emerald-500">${mt(i.total)}</span></div></div>
   <div class="flex gap-2 flex-wrap text-xs font-bold">${payBadges(i)}</div>
   ${ok(i)?'':`<div class="bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl p-3.5 text-xs font-bold leading-6">أُلغيت ${hm(i.cancel.t)} بواسطة ${esc(i.cancel.by)}. السبب: ${esc(i.cancel.reason)}.${i.pay.credit?' الدين رجع تلقائياً وما بقي على العميل شيء من هذه الفاتورة.':''}</div>`}
   ${cancelling?`<div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-3"><p class="text-xs font-black">سبب الإلغاء</p><div class="flex flex-wrap gap-2">${['خطأ في الإدخال','العميل غيّر طلبه','تأخر الطلب','أخرى'].map(r=>`<button data-a="reason" data-r="${r}" class="px-3 py-2 rounded-xl text-[11px] font-bold border-2 border-transparent bg-white dark:bg-gray-700 text-gray-500">${r}</button>`).join('')}</div></div>
     <div class="flex gap-3"><button data-a="inv" data-id="${i.id}" class="flex-1 ${BTN_GRAY}">رجوع</button><button id="cancel-ok" data-a="cancel-ok" disabled class="flex-1 bg-red-500 disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold text-xs">تأكيد الإلغاء</button></div>`
   :(ok(i)?(isMgr()?`<button data-a="cancel-start" data-id="${i.id}" ${canCancel?'':'disabled'} class="w-full bg-red-50 dark:bg-red-950/40 text-red-500 disabled:opacity-50 py-3.5 rounded-2xl font-bold text-xs">${ic('fa-undo','ml-1')} إلغاء الفاتورة</button>${canCancel?'':'<p class="text-[10px] text-gray-400 text-center">فواتير الورديات المقفلة لا تُلغى</p>'}`:'<p class="text-[11px] text-gray-400 text-center font-bold">الإلغاء يحتاج المدير</p>'):'')}
   ${isMgr()?`<details class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3.5"><summary class="text-xs font-black cursor-pointer text-gray-600 dark:text-gray-300">للمحاسب: القيود التلقائية</summary><p class="text-[10px] text-gray-400 my-2">تتسجل لوحدها مع كل فاتورة، وأنت ما تدخلها ولا تحتاج تفهمها.</p><table class="w-full text-right text-[11px]"><thead class="text-gray-400"><tr><th class="py-1">الحساب</th><th class="py-1 text-left">مدين</th><th class="py-1 text-left">دائن</th></tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-700">${journal(i).map(([a,s,v])=>`<tr><td class="py-1.5">${a}</td><td class="py-1.5 text-left">${s==='dr'?fmt(v):''}</td><td class="py-1.5 text-left">${s==='cr'?fmt(v):''}</td></tr>`).join('')}</tbody></table></details>`:''}</div>`);
}

/* ── العملاء ── */
function statement(id){
  const rows=[];
  S.invoices.forEach(i=>{if(i.customerId===id&&i.pay.credit>0)rows.push({t:i.t,txt:`فاتورة #${i.id}`+(ok(i)?'':' (ملغاة)'),dr:ok(i)?i.pay.credit:0,cr:0,void:!ok(i),raw:i.pay.credit});});
  S.custPays.forEach(p=>{if(p.customerId===id)rows.push({t:p.t,txt:p.amount<0?'رد مبلغ للعميل':'سداد '+({cash:'كاش',visa:'فيزا',transfer:'تحويل'}[p.method]),dr:p.amount<0?-p.amount:0,cr:p.amount>0?p.amount:0});});
  rows.sort((a,b)=>a.t-b.t);let b=0;rows.forEach(r=>{b+=r.dr-r.cr;r.bal=b;});return rows;
}
function custRows(){
  const q=S.ui.cust.q.trim();
  return S.customers.filter(c=>!c.gone).map(c=>({c,b:custBal(c.id)})).filter(x=>!q||x.c.n.includes(q)||x.c.ph.includes(q)).sort((a,b)=>b.b-a.b).map(({c,b})=>`<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-4 font-bold">${esc(c.n)}</td><td class="p-4 text-gray-500"><span class="num">${c.ph}</span></td>
   <td class="p-4 text-center font-black ${b>0?'text-red-500':b<0?'text-emerald-500':'text-gray-400'}">${b>0?'عليه '+fmt(b):b<0?'له '+fmt(-b):'مسدّد'}</td>
   <td class="p-4 flex gap-1 justify-end">${iconBtn('cstmt',c.id,ic('fa-file-invoice'),'text-primary hover:bg-blue-50','كشف الحساب')}${b>0?iconBtn('custpay',c.id,ic('fa-hand-holding-usd'),'text-emerald-500 hover:bg-emerald-50','سند قبض'):''}${b>0?iconBtn('remind',c.id,'<i class="fab fa-whatsapp"></i>','text-emerald-600 hover:bg-emerald-50','رسالة تذكير'):''}${b<0?iconBtn('refund',c.id,ic('fa-undo'),'text-amber-500 hover:bg-amber-50','رد المبلغ'):''}${iconBtn('cust-del',c.id,ic('fa-trash'),'text-red-500 hover:bg-red-50','حذف العميل')}</td></tr>`).join('')||empty(4,'لا نتائج');
}
function pgCustomers(){
  return `<div class="tab-content active space-y-6"><div class="${TOOLBAR}"><div class="flex items-center gap-2 w-full sm:w-auto relative"><input type="text" id="cust-search" data-in="cq" value="${esc(S.ui.cust.q)}" placeholder="ابحث باسم العميل أو رقمه..." class="${SRCH.replace('w-full','w-full sm:w-64')}"><i class="fas fa-search absolute right-3.5 top-3.5 text-gray-400 text-xs"></i></div>
   <button data-a="newcust" class="${BTN}">${ic('fa-user-plus')}<span>إضافة عميل جديد</span></button></div>
   ${infoBox('رصيد كل عميل يُحسب دائماً من حركاته (آجل ناقص سداد)، ولا يُخزَّن كرقم مستقل. لذلك ما يختلف أبداً عن حساباتك، وإذا العميل سدّد أكثر من فواتيره يظهر "له" بدل ما يختفي المبلغ.')}
   ${tbl([['اسم العميل'],['رقم الهاتف'],['الرصيد','text-center'],['الإجراءات وسند القبض','text-left']],'<tr><td></td></tr>').replace('<tbody class="divide-y divide-gray-100 dark:divide-gray-800"><tr><td></td></tr></tbody>','<tbody id="customers-table-body" class="divide-y divide-gray-100 dark:divide-gray-800"></tbody>')}</div>`;
}
function showStatement(id){
  const c=S.customers.find(x=>x.id===id),b=custBal(id),rows=statement(id);
  modal(`${mHead(ic('fa-file-invoice','text-primary ml-2'),'كشف حساب '+esc(c.n))}<div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4"><span class="text-xs font-black text-gray-500">${b>0?'الرصيد المستحق عليه':b<0?'له عندنا':'الرصيد'}</span><span class="text-2xl font-black ${b>0?'text-red-500':b<0?'text-emerald-500':'text-gray-400'}">${m(Math.abs(b))}</span></div>
   <div class="overflow-x-auto"><table class="w-full text-right text-xs"><thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-bold border-b dark:border-gray-800"><tr><th class="p-3">التاريخ</th><th class="p-3">البيان</th><th class="p-3 text-center">عليه</th><th class="p-3 text-center">له</th><th class="p-3 text-center">الرصيد</th></tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-800">${rows.slice().reverse().map(r=>`<tr class="${r.void?'text-gray-400 line-through':''}"><td class="p-3">${dm(r.t)}</td><td class="p-3 font-bold">${r.txt}</td><td class="p-3 text-center">${r.dr?fmt(r.dr):r.void?fmt(r.raw):''}</td><td class="p-3 text-center text-emerald-500">${r.cr?fmt(r.cr):''}</td><td class="p-3 text-center font-black">${fmt(r.bal)}</td></tr>`).join('')||empty(5,'لا حركات')}</tbody></table></div>`,'max-w-2xl');
}

/* ── المنتجات ── */
function prodCards(){
  const q=(S.ui.prod&&S.ui.prod.q||'').trim().toLowerCase();
  return prodIds().filter(id=>!q||PROD[id].n.toLowerCase().includes(q)||(PROD[id].bc||'').toLowerCase().includes(q)).map(id=>{const p=PROD[id],hv=p.vars&&p.vars.length;
   let st,sc='text-gray-400';
   if(p.svc){st='خدمة';sc='text-blue-500';}else{const q2=stockQty(p.own);st='المخزون: '+q2;if(q2<=(STOCK.find(x=>x.id===p.own)||{min:5}).min)sc='text-red-500';}
   return `<div class="${CARD} p-4 flex flex-col items-center text-center">
   <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center text-3xl mb-3 overflow-hidden">${pic(p)}</div><h4 class="font-bold text-xs text-gray-800 dark:text-gray-100 mb-1">${esc(p.n)}</h4>
   <p class="text-xs font-black text-emerald-500 mb-0.5">${hv?'من ':''}<span class="num">${fmt(p.p)}</span> ر.ع${hv?` <span class="text-[9px] text-gray-400">· ${p.vars.length} أحجام</span>`:''}</p><p class="text-[10px] font-bold mb-3 ${sc}">${st}</p>
   <div class="flex gap-2 w-full"><button data-a="prod-del" data-id="${id}" class="bg-red-50 dark:bg-red-950/40 text-red-500 px-3 py-2.5 rounded-xl text-xs">${ic('fa-trash')}</button><button data-a="prod-edit" data-id="${id}" class="flex-1 bg-primary/10 text-primary py-2.5 rounded-xl text-[11px] font-bold">${ic('fa-pen','ml-1')} تعديل</button></div></div>`;}).join('')||'<p class="col-span-full text-center text-xs text-gray-400 font-bold py-10">لا نتائج</p>';
}
function pgProducts(){
  return `<div class="tab-content active space-y-6"><div class="${TOOLBAR}"><div class="flex items-center gap-2 w-full sm:w-auto relative"><input type="text" id="prod-search" data-in="prodq" value="${esc((S.ui.prod&&S.ui.prod.q)||'')}" placeholder="ابحث باسم المنتج أو الباركود..." class="${SRCH.replace('w-full','w-full sm:w-64')}"><i class="fas fa-search absolute right-3.5 top-3.5 text-gray-400 text-xs"></i></div><button data-a="prod-new" class="${BTN}">${ic('fa-plus')}<span>إضافة صنف جديد</span></button></div>
   <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="prod-grid">${prodCards()}</div></div>`;
}
/* نافذة "إضافة صنف": نفس حقول نافذتك ونفس ترتيبها (خدمة، الاسم، الباركود، الكمية الافتتاحية، السعر، التكلفة، الأحجام، الصورة) */
const VI='w-full px-2.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold outline-none';
const newVid=()=>'v'+Date.now().toString(36)+Math.floor(Math.random()*46656).toString(36);
const vRow=v=>`<div class="vrow grid gap-1.5 items-center" style="grid-template-columns:1fr 4.6rem 4.6rem 1.8rem" data-vid="${v.id||newVid()}"><input type="text" class="v-name ${VI}" maxlength="24" placeholder="الحجم (كبيرة)" value="${esc(v.n||'')}"><input type="text" inputmode="decimal" data-in="vrow" class="v-price ${VI} text-center text-emerald-500" placeholder="السعر" value="${v.p!=null?fmt(v.p):''}"><input type="text" inputmode="decimal" data-in="vrow" class="v-cost ${VI} text-center text-rose-500" placeholder="التكلفة" value="${v.c?fmt(v.c):''}"><button type="button" data-a="v-del" class="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500">${ic('fa-times-circle')}</button></div>`;
function prodModal(id){
  const p=id?PROD[id]:null,vs=(p&&p.vars)||[];
  S.m={type:'prod',id:id||null,img:(p&&p.img)||''};
  modal(`<h3 class="text-lg font-black mb-4 text-gray-800 dark:text-white">${id?'تعديل الصنف':'إضافة صنف'}</h3><div class="space-y-4">
   <div class="flex items-center gap-3 mb-2"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pd-svc" data-a="prod-svc" ${p&&p.svc?'checked':''} class="w-4 h-4 rounded text-primary border-gray-300 bg-white"><span class="text-xs font-bold text-gray-700 dark:text-gray-300">خدمة / تحضير فوري</span></label></div>
   <div><label class="${LBL}">اسم المنتج</label><input type="text" id="pd-n" value="${esc(p?p.n:'')}" class="${INP}"></div>
   <div class="grid grid-cols-2 gap-3"><div><label class="${LBL}">الباركود</label><input type="text" id="pd-bc" value="${esc((p&&p.bc)||'')}" class="${INP}"></div><div id="pd-stock-box"><label class="${LBL}">الكمية الافتتاحية</label><input type="number" id="pd-stock" min="0" value="${p&&p.own?stockQty(p.own):0}" class="${INP} text-center"></div></div>
   <div class="grid grid-cols-2 gap-3"><div><label class="${LBL}">سعر البيع (ر.ع)</label><input type="text" inputmode="decimal" id="pd-p" value="${p&&p.p?fmt(p.p):''}" class="${INP} text-center text-emerald-500"></div><div><label class="${LBL}">التكلفة (ر.ع)</label><input type="text" inputmode="decimal" id="pd-c" value="${p&&p.c?fmt(p.c):''}" class="${INP} text-center text-rose-500"></div></div>
   <div class="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-3 space-y-2"><div class="flex items-center justify-between gap-2"><div><p class="text-[11px] font-black text-gray-600 dark:text-gray-300">أحجام / خيارات بأسعار مختلفة</p><p class="text-[10px] text-gray-400 font-bold">مثال: بيتزا صغيرة / وسط / كبيرة. اتركها فاضية إذا الصنف بسعر واحد</p></div><div class="flex gap-1.5 shrink-0"><button type="button" data-a="v-preset" class="bg-blue-50 text-primary px-2.5 py-1.5 rounded-lg font-black text-[10px]">صغير / وسط / كبير</button><button type="button" data-a="v-add" class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg font-black text-[10px]">${ic('fa-plus')} حجم</button></div></div><div id="pd-vlist" class="space-y-2">${vs.map(vRow).join('')}</div><p id="pd-vhint" class="hidden text-[10px] font-bold text-amber-600 leading-5">عند وجود أحجام يُستخدم سعر وتكلفة كل حجم، والمخزون يبقى رقم واحد مشترك للصنف.</p></div>
   <div><label class="${LBL}">صورة / إيموجي</label><div class="flex gap-2"><input type="text" id="pd-icon" data-in="pdicon" placeholder="☕" value="${esc(p&&!p.img?(p.icon||''):'')}" class="w-20 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-base text-center outline-none"><div class="flex-1 relative"><input type="file" id="pd-file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"><div id="pd-imgbtn" class="w-full h-full bg-blue-50 text-primary border border-blue-200 rounded-2xl flex items-center justify-center font-bold text-xs pointer-events-none"></div></div></div></div>
   <div class="flex gap-3 pt-2"><button data-a="prod-save" class="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg">حفظ</button><button data-a="close-modal" class="flex-1 ${BTN_GRAY}">إلغاء</button></div></div>`);
  prodSync();
}
/* مع وجود أحجام: السعر والتكلفة يؤخذان من أرخص حجم ولا يُكتبان يدوياً (نفس منطقك) */
function prodSync(){
  const svc=$('#pd-svc').checked,rows=document.querySelectorAll('#pd-vlist .vrow'),has=rows.length>0,pr=$('#pd-p'),co=$('#pd-c'),bx=$('#pd-stock-box');
  bx.style.opacity=svc?'0.4':'1';bx.style.pointerEvents=svc?'none':'auto';
  pr.disabled=has;co.disabled=has;pr.classList.toggle('opacity-40',has);co.classList.toggle('opacity-40',has);$('#pd-vhint').classList.toggle('hidden',!has);
  if(has){let best=null;rows.forEach(r=>{const pv=r.querySelector('.v-price').value.trim();if(pv==='')return;const v=parseB(pv);if(!best||v<best.p)best={p:v,c:parseB(r.querySelector('.v-cost').value)};});pr.value=best?fmt(best.p):'';co.value=best&&best.c?fmt(best.c):'';}
  $('#pd-imgbtn').innerHTML=S.m.img?`<img src="${S.m.img}" alt="" class="w-7 h-7 rounded-lg object-cover ml-2">تغيير الصورة`:'صورة';
}
function readVars(){
  const out=[],seen=new Set();
  for(const r of document.querySelectorAll('#pd-vlist .vrow')){
    const n=r.querySelector('.v-name').value.trim(),pv=r.querySelector('.v-price').value.trim(),cv=r.querySelector('.v-cost').value.trim();
    if(!n&&pv===''&&cv==='')continue;
    if(!n)return {error:'اكتب اسم الحجم (مثال: كبيرة)'};
    if(pv==='')return {error:'اكتب سعر الحجم: '+n};
    if(seen.has(n))return {error:'اسم الحجم مكرر: '+n};seen.add(n);
    out.push({id:r.dataset.vid,n,p:parseB(pv),c:parseB(cv)});
  }
  return {list:out};
}
function prodSave(){
  const s=S.m,old=s.id?PROD[s.id]:null,n=$('#pd-n').value.trim();
  if(!n){showToast('اكتب اسم المنتج','error');return;}
  const svc=$('#pd-svc').checked;let bc=$('#pd-bc').value.trim();
  const vr=readVars();if(vr.error){showToast(vr.error,'error');return;}
  if(!vr.list.length){$('#pd-vlist').innerHTML='';prodSync();}
  let p=parseB($('#pd-p').value),c=parseB($('#pd-c').value);
  if(vr.list.length){const lo=vr.list.reduce((a,b)=>b.p<a.p?b:a);p=lo.p;c=lo.c;}else if($('#pd-p').value.trim()===''){showToast('اكتب سعر البيع','error');return;}
  if(!bc)bc='SKU'+Math.floor(10000+Math.random()*90000);
  if(prodIds().some(k=>k!==s.id&&(PROD[k].n===n||PROD[k].bc===bc))){showToast('الصنف مسجل مسبقاً!','error');return;}
  const id=s.id||('p'+Date.now().toString(36)),np={...(old||{}),n,p,c,bc,svc,img:s.img||'',icon:s.img?'':($('#pd-icon').value.trim()||'📦')};
  if(vr.list.length)np.vars=vr.list;else delete np.vars;
  {
    const q=svc?0:Math.max(0,parseInt($('#pd-stock').value,10)||0),it=np.own&&STOCK.find(x=>x.id===np.own);
    if(svc){if(np.own){const i=STOCK.findIndex(x=>x.id===np.own);if(i>=0)STOCK.splice(i,1);delete np.own;delete np.uses;}}
    else if(it){it.n=n;const cur=stockQty(it.id);if(q!==cur)S.adjusts.push({id:uid(),t:tick(),shift:curShift().id,stockId:it.id,delta:q-cur,note:'تعديل يدوي للكمية'});}
    else{const sid='o_'+id,it2={id:sid,n,unit:'حبة',scale:1,min:5,start:0,own:id};STOCK.push(it2);np.own=sid;np.uses={[sid]:1};PROD[id]=np;it2.start=q-stockQty(sid);} /* الكمية الافتتاحية = الموجود الآن، فلا تُخصم مبيعات سابقة */
  }
  PROD[id]=np;S.rev++;closeModal();render();showToast(s.id?'تم التعديل':'تم الإضافة');
}

/* ── المخزون ── */
function pgInventory(){
  return `<div class="tab-content active space-y-6">${infoBox('اختياري: يشتغل البرنامج بدونه. كل صنف تضيفه بكمية افتتاحية (بالحبة) تنخصم كميته لوحدها مع كل بيع، والأصناف التحضيرية مثل المشاوي ما لها مخزون. تصحح أي فرق بالجرد.')}
   ${tbl([['الصنف'],['الكمية الآن','text-center'],['الحد الأدنى','text-center'],['الحالة','text-center'],['الإجراء','text-left']],STOCK.map(it=>{const q=stockQty(it.id),s=stockState(it);
    return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-4 font-bold">${esc(it.n)}</td><td class="p-4 text-center font-black">${qtyText(it,q)}</td><td class="p-4 text-center text-gray-500">${qtyText(it,it.min)}</td><td class="p-4 text-center"><span class="px-3 py-1 rounded-xl font-bold ${s==='ok'?'bg-emerald-50 text-emerald-500':s==='low'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-500'}">${s==='ok'?'كافٍ':s==='low'?'قرب يخلص':'خلص'}</span></td><td class="p-4 text-left"><button data-a="count" data-id="${it.id}" class="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[11px] font-bold">جرد</button></td></tr>`}).join(''))}</div>`;
}
function countModal(id){
  const it=STOCK.find(s=>s.id===id),q=stockQty(id);S.m={type:'count',id,q};
  modal(`${mHead(ic('fa-boxes','text-amber-500 ml-2'),'جرد '+esc(it.n))}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold">الكمية حسب البرنامج: <span class="text-gray-800 dark:text-white">${qtyText(it,q)}</span></p>
   <div><label class="${LBL}">الكمية الفعلية (${it.unit})</label><input id="c-qty" inputmode="decimal" data-in="countq" placeholder="0" class="${INP} text-center text-lg"></div><p id="c-diff" class="text-xs font-bold"></p>${mActions('id="c-ok" data-a="count-ok" disabled','حفظ الجرد')}</div>`);
}

/* ── الموردين (فواتير المشتريات كاش / فيزا / آجل) ── */
function suppStatement(id){
  const rows=[];S.purchases.forEach(p=>{if(p.supplierId===id&&p.pay.credit>0)rows.push({t:p.t,txt:'فاتورة مشتريات '+p.no,dr:p.pay.credit,cr:0});});
  S.suppPays.forEach(p=>{if(p.supplierId===id)rows.push({t:p.t,txt:'دفعة '+({cash:'كاش',visa:'فيزا'}[p.method]),dr:0,cr:p.amount});});
  rows.sort((a,b)=>a.t-b.t);let b=0;rows.forEach(r=>{b+=r.dr-r.cr;r.bal=b;});return rows;
}
function pgSuppliers(){
  return `<div class="tab-content active space-y-6"><div class="${CARD} p-6"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4"><h4 class="font-black text-sm text-gray-800 dark:text-white flex items-center gap-2">${ic('fa-truck','text-emerald-500')} إدارة الموردين المسجلين</h4><button data-a="newpur" class="${BTN_GREEN}">${ic('fa-file-invoice')}<span>تسجيل فاتورة مشتريات</span></button></div>
   <div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><input type="text" id="sp-name" placeholder="اسم المورد" class="${INP}"><input type="text" id="sp-phone" placeholder="رقم الهاتف" class="${INP}"><button data-a="newsupp" class="${BTN_DARK}">إضافة كرت مورد</button></div></div>
   ${tbl([['المورد'],['المستحق له (ر.ع)','text-center'],['سند الصرف وكشف الحساب','text-left']],S.suppliers.filter(s=>!s.gone).map(s=>{const b=suppBal(s.id);return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-4 font-bold">${esc(s.n)}</td><td class="p-4 text-center font-black ${b>0?'text-red-500':'text-gray-400'}">${fmt(b)}</td><td class="p-4 flex gap-2 justify-end"><button data-a="sstmt" data-id="${s.id}" class="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[11px] font-bold">كشف</button><button data-a="supppay" data-id="${s.id}" ${b>0?'':'disabled'} class="bg-red-50 text-red-500 disabled:opacity-40 px-3 py-1.5 rounded-xl text-[11px] font-bold">سند</button><button data-a="supp-del" data-id="${s.id}" title="حذف المورد" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">${ic('fa-trash')}</button></td></tr>`}).join(''))}
   <div class="${CARD} overflow-hidden"><div class="p-5 border-b border-gray-100 dark:border-gray-800/80"><h4 class="font-black text-sm text-gray-800 dark:text-white flex items-center gap-2">${ic('fa-file-invoice','text-emerald-500')} سجل فواتير المشتريات السابقة</h4></div><div class="overflow-x-auto"><table class="w-full text-right text-xs"><thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-bold border-b dark:border-gray-800"><tr><th class="p-4">المرجع</th><th class="p-4">التاريخ</th><th class="p-4">المورد</th><th class="p-4 text-center">الإجمالي</th><th class="p-4 text-center">الدفع</th><th class="p-4 text-left">الإجراءات</th></tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-800">${S.purchases.slice(-100).reverse().map(p=>`<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-4 font-bold text-primary">${p.no}</td><td class="p-4">${dm(p.t)}</td><td class="p-4">${esc(suppName(p.supplierId))}</td><td class="p-4 text-center font-black text-emerald-500">${fmt(p.total)}</td><td class="p-4 text-center">${Object.keys(PAYL).filter(k=>p.pay[k]>0).map(k=>`<span class="${k==='credit'?'bg-amber-50 text-amber-700':'bg-blue-50 text-primary'} px-3 rounded-xl">${PAYL[k]}</span>`).join(' ')}</td><td class="p-4 text-left"><button data-a="pur" data-id="${p.id}" class="text-emerald-500 hover:bg-emerald-50 p-2 rounded-lg transition-colors">${ic('fa-eye')}</button></td></tr>`).join('')}</tbody></table></div></div></div>`;
}
const defStock=()=>STOCK.length?STOCK[0].id:'';
function newPurchase(){const sp=S.suppliers.filter(x=>!x.gone);if(!sp.length){showToast('أضف مورداً أول (من الأعلى)','error');return;}S.m={type:'pur',lines:[{stockId:defStock(),qty:'',cost:''}],pay:'cash',sup:String(sp[0].id)};drawPur();}
function drawPur(){
  const s=S.m;
  modal(`${mHead(ic('fa-file-invoice','text-emerald-500 ml-2'),'فاتورة مشتريات جديدة')}<div class="space-y-4"><div><label class="${LBL}">المورد</label><select data-in="pursup" class="${INP}">${S.suppliers.filter(x=>!x.gone).map(x=>`<option value="${x.id}" ${String(x.id)===s.sup?'selected':''}>${esc(x.n)}</option>`).join('')}</select></div>
   <div class="space-y-3">${s.lines.map((l,ix)=>`<div class="grid grid-cols-5 gap-2 items-end"><div class="col-span-2"><label class="${LBL}">الصنف</label><select data-in="purline" data-ix="${ix}" data-f="stockId" class="${INP}">${STOCK.map(x=>`<option value="${x.id}" ${l.stockId===x.id?'selected':''}>${esc(x.n)}</option>`).join('')}<option value="" ${l.stockId===''?'selected':''}>أخرى (غير مخزّن)</option></select></div><div><label class="${LBL}">الكمية</label><input inputmode="decimal" data-in="purline" data-ix="${ix}" data-f="qty" value="${esc(l.qty)}" placeholder="0" class="${INP} text-center"></div><div class="col-span-2"><label class="${LBL}">المبلغ (ر.ع)</label><input inputmode="decimal" data-in="purline" data-ix="${ix}" data-f="cost" value="${esc(l.cost)}" placeholder="0.000" class="${INP} text-center"></div></div>`).join('')}<button data-a="pur-addline" class="text-primary text-xs font-bold">+ إضافة سطر</button></div>
   <div><label class="${LBL}">طريقة الدفع</label><div class="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl" id="pur-pay">${[['cash','💵 كاش'],['visa','💳 فيزا'],['credit','📝 آجل']].map(([k,n])=>`<button data-a="purpay" data-k="${k}" class="py-2.5 rounded-xl text-[11px] font-black ${s.pay===k?SEGON:SEGOFF}">${n}</button>`).join('')}</div></div>
   <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4"><span class="text-xs font-black text-gray-500">الإجمالي:</span><span class="text-xl font-black text-emerald-500" id="pur-total">0.000 ر.ع</span></div>${mActions('id="pur-ok" data-a="pur-ok" disabled','حفظ الفاتورة')}</div>`,'max-w-lg');
  purCalc();
}
function purCalc(){const t=S.m.lines.reduce((a,l)=>a+parseB(l.cost),0);$('#pur-total').textContent=mt(t);$('#pur-ok').disabled=!(t>0);}
function purSave(){
  const s=S.m,lines=s.lines.filter(l=>parseB(l.cost)>0).map(l=>{const it=STOCK.find(x=>x.id===l.stockId);return {stockId:l.stockId||null,name:it?it.n:'أخرى',qty:it?Math.round((parseFloat(String(l.qty).replace(',','.'))||0)*it.scale):1,cost:parseB(l.cost)}});
  const total=lines.reduce((a,l)=>a+l.cost,0),pay={cash:0,visa:0,credit:0};pay[s.pay]=total;
  const p=createPurchase({t:tick(),shift:curShift().id,supplierId:Number(s.sup),lines,pay});closeModal();render();showToast(`حُفظت فاتورة ${p.no} · ${mt(total)} · ${PAYL[s.pay]}`);
}
function showPurchase(id){
  const p=S.purchases.find(x=>x.id===id);
  modal(`${mHead(ic('fa-file-invoice','text-emerald-500 ml-2'),'فاتورة '+p.no)}<p class="text-[11px] text-gray-400 font-bold mb-3">${esc(suppName(p.supplierId))} · ${dm(p.t)} ${hm(p.t)}</p><div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-xs space-y-2">${p.lines.map(l=>{const it=STOCK.find(s=>s.id===l.stockId);return `<div class="flex justify-between"><span>${esc(l.name)} ${it?'· '+qtyText(it,l.qty):''}</span><span class="font-bold">${fmt(l.cost)}</span></div>`}).join('')}<div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-black"><span>الإجمالي</span><span class="text-emerald-500">${mt(p.total)}</span></div></div><div class="flex gap-2 mt-3 text-xs font-bold">${Object.keys(PAYL).filter(k=>p.pay[k]>0).map(k=>`<span class="${k==='credit'?'bg-amber-50 text-amber-700':'bg-blue-50 text-primary'} px-3 py-1 rounded-xl">${PAYL[k]} ${fmt(p.pay[k])}</span>`).join('')}</div>`);
}

/* ── المصروفات ── */
function pgExpenses(){
  const u=S.ui.exp,sid=curShift().id,mine=S.expenses.filter(e=>e.shift===sid).slice().reverse();
  const last=realShifts().slice(-7).map(s=>s.id),by={};S.expenses.filter(e=>last.includes(e.shift)).forEach(e=>by[e.cat]=(by[e.cat]||0)+e.amount);const mx=Math.max(1,...Object.values(by));
  return `<div class="tab-content active space-y-6"><div class="${CARD} p-6 space-y-4"><h4 class="font-black text-sm text-gray-800 dark:text-white flex items-center gap-2">${ic('fa-wallet','text-primary')} تسجيل صرف سريع</h4>
   <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label class="${LBL}">المبلغ (ر.ع)</label><input id="e-amount" inputmode="decimal" placeholder="0.000" value="${esc(u.amount)}" data-bind="exp.amount" class="${INP} text-center text-xl text-red-500"></div><div><label class="${LBL}">ملاحظة (اختياري)</label><input id="e-note" value="${esc(u.note)}" data-bind="exp.note" class="${INP}"></div></div>
   <div><label class="${LBL}">التصنيف</label><div class="flex flex-wrap gap-2">${EXP_CATS.map(c=>`<button data-a="expcat" data-k="${c}" class="px-4 py-2.5 rounded-xl text-[11px] font-black ${u.cat===c?SEGON:'bg-gray-100 dark:bg-gray-800 '+SEGOFF}">${c}</button>`).join('')}</div></div>
   <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">${[['cash','من الصندوق'],['visa','من البنك']].map(([k,n])=>`<button data-a="expfrom" data-k="${k}" class="py-2.5 rounded-xl text-[11px] font-black ${u.from===k?SEGON:SEGOFF}">${n}</button>`).join('')}</div>
   <button data-a="exp-ok" ${shiftOpen()?'':'disabled'} class="w-full ${BTN} disabled:opacity-50 py-4">تسجيل الصرف</button></div>
   ${tbl([['الوقت'],['التصنيف'],['المصدر','text-center'],['المبلغ','text-center']],mine.map(e=>`<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-4 text-gray-500">${hm(e.t)}</td><td class="p-4 font-bold">${e.cat}${e.note?`<span class="block text-[10px] text-gray-400 font-normal">${esc(e.note)}</span>`:''}</td><td class="p-4 text-center"><span class="${e.from==='cash'?'bg-gray-100 text-gray-600':'bg-blue-50 text-primary'} px-3 rounded-xl">${e.from==='cash'?'الصندوق':'البنك'}</span></td><td class="p-4 text-center font-black text-red-500">${fmt(e.amount)}</td></tr>`).join('')||empty(4,'لا مصروفات في هذه الوردية بعد'))}
   <div class="${CARD} p-5"><h4 class="font-bold text-xs mb-4 text-gray-600 dark:text-gray-300">${ic('fa-chart-pie','ml-1.5 text-primary')} آخر 7 ورديات حسب التصنيف</h4><div class="space-y-3">${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><div class="flex justify-between text-xs font-bold mb-1"><span>${k}</span><span class="text-red-500">${mt(v)}</span></div><div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width:${Math.round(v/mx*100)}%"></div></div></div>`).join('')}</div>
   <p class="text-[11px] text-gray-400 mt-4">مشتريات اللحم والفحم ما تدخل هنا. هي تتحول لمخزون، وتكلفتها تنحسب لما يُباع الصنف.</p></div></div>`;
}

/* ── الأرباح ── */
function niceStep(mx){for(const s of [5000,10000,25000,50000,100000,250000,500000])if(mx/s<=5)return s;return 500000;}
function chart(rows){
  if(!rows.length)return '<p class="text-xs text-gray-400 font-bold py-6 text-center">لا ورديات بعد</p>';
  const W=640,H=230,pl=10,pr=46,pt=14,pb=34,iw=W-pl-pr,ih=H-pt-pb,mx=Math.max(1000,...rows.map(r=>r.sales)),st=niceStep(mx),top=Math.ceil(mx/st)*st;
  const y=v=>pt+ih-(v/top)*ih,gw=iw/rows.length,bw=Math.min(26,gw*.3);let g='';
  for(let v=0;v<=top;v+=st)g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity=".18"/><text x="${W-pr+8}" y="${y(v)+4}" fill="currentColor" font-size="12">${Math.round(v/1000)}</text>`;
  rows.forEach((r,i)=>{const cx=W-pr-gw*(i+.5),ph=Math.max(0,(Math.max(r.profit,0)/top)*ih);
    g+=`<rect x="${cx-bw-2}" y="${y(r.sales)}" width="${bw}" height="${Math.max(0,ih-(y(r.sales)-pt))}" rx="4" fill="rgb(23 112 122 / .15)" stroke="rgb(23 112 122)" stroke-width="1.5"><title>${r.label}: مبيعات ${fmt(r.sales)}</title></rect>`;
    g+=`<rect x="${cx+2}" y="${pt+ih-ph}" width="${bw}" height="${ph}" rx="4" fill="rgb(35 128 73)"><title>${r.label}: ربح ${fmt(r.profit)}</title></rect><text x="${cx}" y="${H-12}" text-anchor="middle" fill="currentColor" font-size="12">${r.label}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="المبيعات والربح لكل وردية" class="text-gray-400 w-full" style="height:auto;max-width:720px">${g}</svg>`;
}
function pgProfit(){
  const cur=S.ui.profit.range==='cur',sh=cur?[curShift()]:realShifts().slice(-7),cs=curShift();
  const t={net:0,cogs:0,exp:0,profit:0,vat:0};sh.forEach(s=>{const x=shiftStats(s.id);t.net+=x.net;t.cogs+=x.cogs;t.exp+=x.exp;t.profit+=x.profit;t.vat+=x.vat;});
  const debts=S.customers.reduce((a,c)=>a+Math.max(0,custBal(c.id)),0),owe=S.suppliers.reduce((a,s)=>a+Math.max(0,suppBal(s.id)),0),st=shiftStats(cs.id);
  const rows=realShifts().slice(-7).map(s=>({label:`${new Date(s.start).getDate()}/${new Date(s.start).getMonth()+1}`,sales:shiftStats(s.id).net,profit:shiftStats(s.id).profit}));
  return `<div class="tab-content active space-y-6"><div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-sm">${[['cur','الوردية الحالية'],['week','آخر 7 ورديات']].map(([k,n])=>`<button data-a="prange" data-k="${k}" class="py-2.5 rounded-xl text-[11px] font-black ${(cur?'cur':'week')===k?SEGON:SEGOFF}">${n}</button>`).join('')}</div>
   <div class="${CARD} p-6"><p class="text-xs text-gray-400 font-bold mb-1">صافي الربح</p><h3 class="text-3xl font-black ${t.profit>=0?'text-emerald-500':'text-red-500'}">${m(t.profit)}</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">${tile('المبيعات',mt(t.net),t.vat?'بدون الضريبة':'')}${tile('ناقص تكلفة الأصناف',mt(t.cogs))}${tile('ناقص المصروفات',mt(t.exp))}</div><p class="text-[11px] text-gray-400 mt-3">تكلفة الأصناف تقديرية حسب التكلفة المسجّلة لكل صنف.</p></div>
   <div class="${CARD} p-5"><h4 class="font-bold text-xs mb-3 text-gray-600 dark:text-gray-300">${ic('fa-coins','ml-1.5 text-primary')} فلوسي الآن</h4><div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${tile('كاش في الصندوق',mt(drawer(cs.id)),'المتوقع')}${tile('مبيعات الفيزا (هذه الوردية)',mt(st.visa))}${tile('ديون العملاء لك',mt(debts))}${tile('ديونك للموردين',mt(owe))}${t.vat?tile('ضريبة مستحقة للدولة',mt(t.vat)):''}</div></div>
   <div class="${CARD} p-5"><h4 class="font-bold text-xs mb-3 text-gray-600 dark:text-gray-300">${ic('fa-chart-line','ml-1.5 text-primary')} المبيعات والربح لكل وردية</h4><div class="flex gap-4 text-[11px] text-gray-400 font-bold mb-2"><span><i class="inline-block w-3 h-3 rounded align-middle ml-1 bg-primary/10 border border-primary"></i>المبيعات</span><span><i class="inline-block w-3 h-3 rounded align-middle ml-1 bg-emerald-500"></i>الربح</span><span>الأرقام بالريال العماني</span></div>${chart(rows)}</div>
   <details class="${CARD} p-5"><summary class="text-xs font-black cursor-pointer text-gray-600 dark:text-gray-300">للمحاسب: كيف تُسجَّل هذه الأرقام؟</summary><p class="text-xs text-gray-400 leading-6 mt-3">كل بيع وصرف وسداد يتحول تلقائياً إلى قيد مزدوج (مدين ودائن) في الخلفية، ومنها يُستخرج ميزان المراجعة والميزانية وقائمة الدخل بملف جاهز للمحاسب. هذه الشاشة تعرض لك النتيجة بلغة عادية.</p></details></div>`;
}

/* ── المراقبة ── */
function pgWatch(){
  const ev=[];
  const since=Date.now()-90*864e5;
  for(let n=S.invoices.length-1;n>=0;n--){const i=S.invoices[n];if(i.t<since)break;
    if(!ok(i))ev.push({t:i.cancel.t,k:'إلغاء فاتورة',c:'amber',ic:'fa-undo',txt:`فاتورة ${i.id} بقيمة ${mt(i.total)} · السبب: ${i.cancel.reason} · ${i.cancel.by}`});
    if(ok(i)&&i.discount>0&&i.discount>=i.sub*.1)ev.push({t:i.t,k:'خصم كبير',c:'amber',ic:'fa-coins',txt:`فاتورة ${i.id}: خصم ${mt(i.discount)} من ${mt(i.sub)} · ${i.by}`});
  }
  S.shifts.forEach(s=>{if(s.end&&s.diff)ev.push({t:s.end,k:'فرق صندوق',c:s.diff<0?'red':'amber',ic:'fa-clock',txt:`وردية ${dm(s.start)}: المتوقع ${mt(s.expected)}، الفعلي ${mt(s.counted)}، الفرق ${mt(s.diff)}`});});
  S.customers.forEach(c=>{if(c.gone)return;const b=custBal(c.id);if(b<0)ev.push({t:Date.now(),k:'رصيد دائن لعميل',c:'emerald',ic:'fa-hand-holding-usd',txt:`${c.n}: له عندنا ${mt(-b)} بسبب فاتورة أُلغيت بعد السداد`});});
  ev.sort((a,b)=>b.t-a.t);
  const C={red:'bg-red-50 dark:bg-red-950/40 text-red-500',amber:'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'};
  return `<div class="tab-content active space-y-6">${infoBox('هنا الأشياء اللي تستاهل تنتبه لها (آخر 90 يوماً): الإلغاءات والخصومات الكبيرة وفروقات الصندوق، مع اسم الموظف والوقت. بدل سجل طويل ما تقرأه.')}
   <div class="${CARD} divide-y divide-gray-100 dark:divide-gray-800">${ev.map(e=>`<div class="p-4 flex items-center gap-3"><div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${C[e.c]}">${ic(e.ic)}</div><div class="flex-1 min-w-0"><p class="font-black text-xs text-gray-800 dark:text-white">${e.k}</p><p class="text-[11px] text-gray-500 mt-0.5 leading-5">${e.txt}</p></div><span class="text-[10px] text-gray-400 font-bold shrink-0">${e.k==='رصيد دائن لعميل'?'للعلم':dm(e.t)+' '+hm(e.t)}</span></div>`).join('')||'<p class="p-8 text-center text-xs text-gray-400 font-bold">لا شيء.</p>'}</div></div>`;
}

/* ── الوردية ── */
function pgShift(){
  const sh=curShift(),open=!sh.end,u=S.ui.close;let body='';
  if(open){
    const rows=drawerRows(sh.id),exp=drawer(sh.id);
    body=`<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="${CARD} p-5"><h4 class="font-bold text-xs mb-3 text-gray-600 dark:text-gray-300">${ic('fa-coins','ml-1.5 text-primary')} حساب الصندوق</h4><table class="w-full text-right text-xs"><tbody class="divide-y divide-gray-100 dark:divide-gray-800">${rows.map(([n,v,sg])=>`<tr><td class="py-2.5 text-gray-500 font-bold">${sg>0?'＋':'−'} ${n}</td><td class="py-2.5 text-left font-black ${sg>0?'text-emerald-500':'text-red-500'}">${fmt(v)}</td></tr>`).join('')}<tr><td class="py-3 font-black">المتوقع بالصندوق</td><td class="py-3 text-left font-black text-lg">${mt(exp)}</td></tr></tbody></table></div>
     <div class="${CARD} p-5 space-y-4"><h4 class="font-bold text-xs text-gray-600 dark:text-gray-300">${ic('fa-clock','ml-1.5 text-primary')} عدّ الصندوق</h4><div><label class="${LBL}">المبلغ الفعلي (ر.ع)</label><input id="c-count" inputmode="decimal" placeholder="0.000" value="${esc(u.counted)}" data-bind="close.counted" class="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xl font-black text-center outline-none"></div>
      <div id="c-res" class="rounded-2xl p-3.5 text-xs font-bold bg-gray-50 dark:bg-gray-800/50 text-gray-500">اكتب المبلغ اللي عدّيته في الصندوق.</div><button id="c-btn" data-a="close-start" disabled class="w-full ${BTN_DARK} disabled:opacity-50 py-4">إقفال الوردية</button></div></div>`;
  } else {
    body=`<div class="${CARD} p-6"><h4 class="font-black text-sm text-gray-800 dark:text-white mb-4">${ic('fa-clock','text-primary ml-2')} فتح وردية جديدة</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end"><div><label class="${LBL}">رصيد الافتتاح في الصندوق (ر.ع)</label><input id="fl" inputmode="decimal" value="${esc(u.float)}" data-bind="close.float" class="${INP} text-center"></div><button data-a="open-shift" class="${BTN} py-4">فتح الوردية</button></div></div>`;
  }
  const hist=realShifts().filter(s=>s.end).slice(-60).reverse();
  return `<div class="tab-content active space-y-6">${infoBox('الوردية تفتحها وتقفلها أنت، وما تعتمد على الساعة. مثلاً من 6:05 م إلى 2:10 ص تنحسب وردية وحدة حتى لو مرّ منتصف الليل. وإذا نسيت تقفلها يذكّرك البرنامج.')}
   ${open?'':`<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 rounded-2xl p-3.5 text-xs font-bold">لا توجد وردية مفتوحة. افتح وردية جديدة لتبدأ البيع.</div>`}${body}
   ${tbl([['الوردية'],['من – إلى'],['فواتير','text-center'],['المبيعات','text-center'],['الفرق','text-center']],hist.map(s=>{const x=shiftStats(s.id),same=new Date(s.end).getDate()===new Date(s.start).getDate();
    return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-4 font-bold">${dm(s.start)}</td><td class="p-4 text-gray-500">${hm(s.start)} ← ${hm(s.end)}${same?'':' <span class="text-[10px] text-gray-400">(اليوم التالي)</span>'}</td><td class="p-4 text-center">${x.n}</td><td class="p-4 text-center font-black text-emerald-500">${fmt(x.total)}</td><td class="p-4 text-center">${s.diff==null?'—':s.diff===0?'<span class="bg-emerald-50 text-emerald-500 px-3 py-1 rounded-xl font-bold">مطابق</span>':`<span class="${s.diff<0?'bg-red-50 text-red-500':'bg-amber-50 text-amber-700'} px-3 py-1 rounded-xl font-bold">${s.diff<0?'نقص':'زيادة'} ${fmt(Math.abs(s.diff))}</span>`}</td></tr>`}).join(''))}</div>`;
}
function closeRes(){
  const u=S.ui.close,el=$('#c-res');if(!el)return;
  if(u.counted.trim()===''){el.className='rounded-2xl p-3.5 text-xs font-bold bg-gray-50 dark:bg-gray-800/50 text-gray-500';el.textContent='اكتب المبلغ اللي عدّيته في الصندوق.';$('#c-btn').disabled=true;return;}
  const d=parseB(u.counted)-drawer(curShift().id);
  el.className='rounded-2xl p-3.5 text-xs font-bold '+(d===0?'bg-emerald-50 text-emerald-500':d<0?'bg-red-50 text-red-500':'bg-amber-50 text-amber-700');
  el.textContent=d===0?'مطابق تماماً.':d<0?'نقص '+mt(-d):'زيادة '+mt(d);$('#c-btn').disabled=false;
}

/* ── الإعدادات ── */
const APP_BUILD='2026.10.29-b1f68b50';
const isStandalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const stampNow=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'_'+pad(d.getHours())+pad(d.getMinutes());};
function installTip(){
  if(isStandalone()||!isIOS())return '';
  return `<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-3.5 text-[11px] font-bold text-primary leading-6 text-right">${ic('fa-info-circle','ml-1.5')}<b>ثبّت البرنامج على الشاشة الرئيسية:</b> اضغط زر المشاركة <span class="num">⬆︎</span> في Safari ثم «إضافة إلى الشاشة الرئيسية». بعدها افتحه من الأيقونة دائماً، لأن بيانات المتصفح وبيانات الأيقونة منفصلة عن بعض.</div>`;
}
function pgSettings(){
  const st=S.store,cashiers=S.users.filter(u=>u.role==='cashier'),by=new Map();
  for(const i of S.invoices)if(ok(i)){const r=by.get(i.by)||[0,0];r[0]++;r[1]+=i.total;by.set(i.by,r);}
  const rows=cashiers.map(u=>{const [n,sum]=by.get(u.name)||[0,0];return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800"><td class="p-3 font-bold">${esc(u.name)}</td><td class="p-3 text-center"><span dir="ltr" class="font-mono text-gray-500">${esc(u.user)}</span></td><td class="p-3 text-center font-black text-emerald-500">${fmt(sum)}</td><td class="p-3 text-center">${n}</td><td class="p-3 text-center"><span class="${u.on?'bg-emerald-50 text-emerald-500':'bg-red-50 text-red-500'} px-3 py-1 rounded-xl font-bold">${u.on?'نشط':'موقوف'}</span></td><td class="p-3 flex gap-1 justify-end">${iconBtn('user-reset',u.id,ic('fa-key'),'text-amber-500 hover:bg-amber-50','تغيير الرمز')}${iconBtn('user-toggle',u.id,ic(u.on?'fa-power-off':'fa-check-circle'),u.on?'text-amber-600 hover:bg-amber-50':'text-emerald-500 hover:bg-emerald-50',u.on?'إيقاف الحساب':'تفعيل الحساب')}${iconBtn('user-del',u.id,ic('fa-trash'),'text-red-500 hover:bg-red-50','حذف الكاشير')}</td></tr>`;}).join('')||empty(6,'لا يوجد كاشير');
  const bk=S.meta.lastBackup,bkTxt=bk?`${dm(bk)} ${hm(bk)}`:'لم تُؤخذ نسخة بعد';
  const FILE='absolute inset-0 w-full h-full opacity-0 cursor-pointer';
  return `<div class="tab-content active space-y-6">
    <div class="${CARD} p-6 space-y-4"><div class="flex items-center gap-3"><div class="w-12 h-12 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-2xl flex items-center justify-center text-xl">${ic('fa-user-shield')}</div><div><h3 class="font-black text-sm">إدارة الموظفين والكاشيرية</h3><p class="text-[11px] text-gray-400">كل موظف يدخل باسم مستخدم ورمز خاص فيه، وكل فاتورة تُسجَّل باسمه</p></div></div><hr class="dark:border-gray-800">
     <div class="flex justify-end mb-2"><button data-a="user-new" class="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md">${ic('fa-plus','mr-1')} إضافة كاشير جديد</button></div>
     <div class="overflow-x-auto border dark:border-gray-700 rounded-xl"><table class="w-full text-right text-xs"><thead class="bg-gray-50 dark:bg-gray-800 text-gray-500"><tr><th class="p-3">الموظف</th><th class="p-3 text-center">اسم المستخدم</th><th class="p-3 text-center">المبيعات</th><th class="p-3 text-center">الفواتير</th><th class="p-3 text-center">الحالة</th><th class="p-3 text-left">إجراء</th></tr></thead><tbody class="divide-y dark:divide-gray-700">${rows}</tbody></table></div></div>
    <div class="${CARD} p-6 space-y-4"><div class="flex items-center gap-3"><div class="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-primary rounded-2xl flex items-center justify-center text-xl">${ic('fa-store')}</div><div><h3 class="font-black text-sm">بيانات المتجر وإعدادات النظام</h3><p class="text-[11px] text-gray-400">تظهر هذه البيانات في الفاتورة المطبوعة وفي رسالة الواتساب</p></div></div><hr class="dark:border-gray-800">
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label class="${LBL}">اسم المحل</label><input type="text" id="st-name" value="${esc(st.name)}" class="${INP}"></div>
      <div><label class="${LBL}">وصف ونوع النشاط</label><input type="text" id="st-desc" value="${esc(st.desc)}" class="${INP}"></div>
      <div><label class="${LBL}">رقم الهاتف</label><input type="text" id="st-phone" value="${esc(st.phone)}" class="${INP}"></div>
      <div><label class="${LBL}">رصيد افتتاح الصندوق الافتراضي (ر.ع)</label><input type="text" inputmode="decimal" id="st-float" value="${esc(st.float)}" class="${INP}"><p class="text-[10px] font-bold text-gray-400 mt-1.5">يظهر جاهزاً عند فتح كل وردية، وتقدر تغيّره وقتها.</p></div>
      <div><label class="${LBL}">صيغة مشاركة الفاتورة</label><select id="st-share" class="${INP}"><option value="pdf" ${st.shareFmt==='png'?'':'selected'}>PDF (واتساب والمشاركة العادية)</option><option value="png" ${st.shareFmt==='png'?'selected':''}>صورة PNG (لتطبيقات الطابعات الحرارية)</option></select></div>
      <div class="md:col-span-2"><label class="${LBL}">رابط QR في الفاتورة <span class="text-gray-300 font-normal">(حساب التواصل أو أي رابط)</span></label><input type="text" id="st-qr" dir="ltr" value="${esc(st.qr)}" placeholder="https://instagram.com/username" class="${INP} text-left"><p class="text-[10px] font-bold text-gray-400 mt-1.5">اتركه فارغاً لإخفاء الـQR من الفاتورة. كلما قصر الرابط، صار المسح أسهل.</p></div>
      <div class="md:col-span-2"><label class="${LBL}">شعار المؤسسة (Logo)</label><div class="flex gap-2"><input type="file" id="st-logo" accept="image/*" class="w-full px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs outline-none cursor-pointer"><div id="st-logo-prev" class="w-11 h-11 bg-white border rounded-xl flex items-center justify-center overflow-hidden shrink-0">${st.logo?`<img src="${st.logo}" class="w-full h-full object-cover">`:'🖼️'}</div></div></div>
     </div>
     <div class="pt-2"><button data-a="set-save" class="bg-primary hover:bg-blue-600 text-white py-3 px-6 rounded-2xl font-black text-xs transition-all">حفظ البيانات العامة</button></div></div>
    <div class="${CARD} p-6 space-y-4"><div class="flex items-center gap-3"><div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-2xl flex items-center justify-center text-xl">${ic('fa-download')}</div><div><h3 class="font-black text-sm">النسخ الاحتياطي</h3><p class="text-[11px] text-gray-400">بياناتك كلها على هذا الآيباد فقط، ما في سيرفر. النسخة هي أمانك لو ضاع الجهاز أو انمسحت بياناته</p></div></div><hr class="dark:border-gray-800">
     <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${tile('آخر نسخة',bkTxt)}${tile('عدد الفواتير',String(S.invoices.length))}<div id="storage-info" class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4"><p class="text-[11px] text-gray-400 font-bold mb-1">التخزين</p><p class="text-lg font-black text-gray-800 dark:text-white">…</p></div></div>
     <div class="flex flex-wrap gap-3"><button data-a="bk-save" class="${BTN_GREEN}">${ic('fa-download')}<span>حفظ نسخة احتياطية الآن</span></button><div class="relative"><div class="${BTN_GRAY} px-6 flex items-center gap-2 pointer-events-none">${ic('fa-upload')}<span>استرجاع من نسخة</span></div><input type="file" id="bk-file" accept=".json,application/json" class="${FILE}"></div></div>
     <p class="text-[11px] text-gray-400 font-bold leading-6">اضغط «حفظ نسخة» وبتطلع لك قائمة المشاركة: احفظها في «الملفات» (iCloud) أو أرسلها لنفسك على واتساب. خذ نسخة بعد إقفال كل وردية.</p>
     ${installTip()}
     <div id="install-state" class="text-[11px] font-bold ${isStandalone()?'text-emerald-500':'text-amber-600'}">${isStandalone()?'✓ يعمل كتطبيق مثبّت على الشاشة الرئيسية':'يعمل الآن داخل المتصفح'}</div></div>
    <div class="${CARD} p-6 space-y-4"><div class="flex items-center gap-3"><div class="w-12 h-12 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-2xl flex items-center justify-center text-xl">${ic('fa-key')}</div><div><h3 class="font-black text-sm">رمز الاسترجاع</h3><p class="text-[11px] text-gray-400">لو نسيت رمز المدير تدخل به بدل ما تخسر بياناتك. اكتبه واحفظه بعيد عن الآيباد</p></div></div>
     <div><button data-a="rec-new" class="${BTN_GRAY} px-6">إنشاء رمز استرجاع جديد</button></div></div>
    <div class="${CARD} p-6 space-y-4"><div class="flex items-center gap-3"><div class="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-primary rounded-2xl flex items-center justify-center text-xl">${ic('fa-box')}</div><div><h3 class="font-black text-sm">استيراد من برنامجك القديم</h3><p class="text-[11px] text-gray-400">اختر ملف النسخة الاحتياطية القديم (JSON)، فتنتقل أصنافك وعملاؤك وموردوك بدل ما تكتبهم من جديد</p></div></div>
     <div class="relative inline-block"><div class="${BTN_GRAY} px-6 flex items-center gap-2 pointer-events-none">${ic('fa-upload')}<span>اختيار ملف النسخة القديمة</span></div><input type="file" id="old-file" accept=".json,application/json" class="${FILE}"></div>
     <p class="text-[10px] font-bold text-gray-400 leading-5">يُستورد: الأصناف (بأسعارها وأحجامها وكمياتها) والعملاء والموردون بدون أرصدة. الفواتير القديمة والديون ما تنتقل، وما يتكرر صنف موجود بنفس الاسم.</p></div>
    <p class="text-center text-[10px] font-bold text-gray-300">نسخة البرنامج <span dir="ltr">${APP_BUILD}</span></p></div>`;
}
async function storageInfo(){
  const el=$('#storage-info');if(!el)return;let used='—',pers='';
  try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();used=(e.usage/1048576).toFixed(1)+' ميغابايت';}
    if(navigator.storage&&navigator.storage.persisted)pers=(await navigator.storage.persisted())?'محمي من المسح التلقائي':'غير محمي من المسح التلقائي';}catch(e){}
  const e2=$('#storage-info');if(e2)e2.innerHTML=`<p class="text-[11px] text-gray-400 font-bold mb-1">التخزين</p><p class="text-lg font-black text-gray-800 dark:text-white">${used}</p>${pers?`<p class="text-[10px] ${pers[0]==='م'?'text-emerald-500':'text-amber-600'} font-bold mt-0.5">${pers}</p>`:''}`;
}

/* ── حارس التمرير على iPad (نفس فكرة برنامجك): بعد إغلاق نافذة أو الرجوع للتطبيق نعيد تنشيط حاويات التمرير ونحفظ مكانها ── */
function unstick(){['main-content-area','pos-products-grid','cart-items'].forEach(id=>{const el=document.getElementById(id);if(!el||el.clientHeight===0)return;const t=el.scrollTop,l=el.scrollLeft;el.style.overflow='hidden';void el.offsetHeight;el.style.overflow='';el.scrollTop=t;el.scrollLeft=l;});}
let unstickRaf=0;function unstickSoon(){cancelAnimationFrame(unstickRaf);unstickRaf=requestAnimationFrame(()=>requestAnimationFrame(unstick));}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)unstick();});
window.addEventListener('pageshow',unstick);window.addEventListener('orientationchange',()=>setTimeout(unstick,300));

/* ───────── عرض وتوجيه ───────── */
const VIEWS={dashboard:pgDashboard,pos:pgPos,invoices:pgInvoices,customers:pgCustomers,products:pgProducts,inventory:pgInventory,suppliers:pgSuppliers,expenses:pgExpenses,profit:pgProfit,watch:pgWatch,shift:pgShift,settings:pgSettings};
function render(){
  if(!S.user)return;
  if(!allowed(S.page)){S.page=homePage();if(location.hash.slice(1)!==hashOf(S.page))location.hash=hashOf(S.page);}
  renderChrome();
  const area=$('#main-content-area');area.classList.toggle('pos-mode',S.page==='pos');fitSidebar();area.innerHTML=VIEWS[S.page]();
  if(S.page==='pos'){drawGrid();drawCart();}
  if(S.page==='invoices')invBody();
  if(S.page==='customers')$('#customers-table-body').innerHTML=custRows();
  if(S.page==='shift')closeRes();
  if(S.page==='settings')storageInfo();
}
function go(p){S.page=p;if(location.hash.slice(1)!==hashOf(p))location.hash=hashOf(p);sidebar(false);render();$('#main-content-area').scrollTop=0;}
window.addEventListener('hashchange',()=>{const p=pageOf(location.hash.slice(1));if(VIEWS[p]&&p!==S.page){S.page=p;render();}});

/* ───────── الأحداث ───────── */
const A={
 logout:()=>{S.user=null;S.cart={lines:[],type:'table',ref:'',disc:'',note:''};try{localStorage.removeItem(SESS_KEY);}catch(e){}closeModal();closePreview();$('#whatsapp-modal').classList.add('hidden');sidebar(false);showAuth();},
 eye:e=>{const i=$('#'+e.dataset.t),show=i.type==='password';i.type=show?'text':'password';e.querySelector('i').className='fas '+(show?'fa-eye':'fa-eye-slash')+' text-xs';},
 'inv-prev':e=>showInvoicePreview(ix().inv.get(+e.dataset.id)),
 'inv-wa':e=>openWhatsApp(ix().inv.get(+e.dataset.id)),
 'pv-wa':()=>openWhatsApp(S.pv),'pv-share':()=>shareInvoiceFile(S.pv),'pv-print':()=>printInvoice(S.pv),'pv-close':()=>closePreview(),
 'wa-send':(el,ev)=>{if(waHref()==='#'){ev.preventDefault();showToast('رقم الهاتف غير صحيح','error');return;}el.href=waHref();setTimeout(()=>{$('#whatsapp-modal').classList.add('hidden');unstickSoon();},300);},
 'wa-close':()=>{$('#whatsapp-modal').classList.add('hidden');unstickSoon();},
 'wa-copy':()=>{try{navigator.clipboard.writeText(S.waText).then(()=>showToast('تم النسخ'),()=>showToast('حدّد النص وانسخه يدوياً','error'));}catch(_){showToast('حدّد النص وانسخه يدوياً','error');}},
 'set-save':()=>{const st=S.store,v=id=>($(id).value||'').trim();st.name=v('#st-name')||st.name;st.desc=v('#st-desc');st.phone=v('#st-phone');st.qr=v('#st-qr');st.shareFmt=$('#st-share').value==='png'?'png':'pdf';if(S.logoDraft!==undefined){st.logo=S.logoDraft;S.logoDraft=undefined;}
   const f=parseB($('#st-float').value);st.float=fmt(f);S.ui.close.float=st.float;renderChrome();showToast('تم حفظ الإعدادات');},
 'user-new':()=>{S.m={type:'un'};modal(`${mHead(ic('fa-user-plus','text-amber-500 ml-2'),'إضافة كاشير جديد')}<div class="space-y-4"><div><label class="${LBL}">اسم الموظف</label><input id="un-n" class="${INP}"></div><div><label class="${LBL}">اسم المستخدم (بالإنجليزية، بدون مسافات)</label><input id="un-u" dir="ltr" autocapitalize="none" class="${INP} text-left"></div><div><label class="${LBL}">الرمز (٤ أحرف أو أرقام على الأقل)</label><input id="un-p" type="password" dir="ltr" class="${INP} text-left"></div>${mActions('data-a="user-new-ok"','حفظ')}</div>`);},
 'user-new-ok':async()=>{const n=$('#un-n').value.trim(),u=$('#un-u').value.trim().toLowerCase(),p=$('#un-p').value;
   if(!n||!u){showToast('اكتب الاسم واسم المستخدم','error');return;}if(!/^[a-z0-9_.-]+$/.test(u)){showToast('اسم المستخدم بالإنجليزية وبدون مسافات','error');return;}
   if(p.length<4){showToast('الرمز ٤ خانات على الأقل','error');return;}if(S.users.some(x=>x.user===u)){showToast('اسم المستخدم مستخدم من قبل','error');return;}
   const nu={id:uid(),name:n,user:u,role:'cashier',on:true};await setPass(nu,p);S.users.push(nu);closeModal();render();showToast('أُضيف الكاشير');},
 'user-del':e=>{const u=S.users.find(x=>x.id==e.dataset.id);S.m={type:'ud',id:u.id};modal(`${mHead(ic('fa-trash','text-red-500 ml-2'),'حذف كاشير')}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold leading-6">حذف حساب <span class="text-gray-800 dark:text-white">${esc(u.name)}</span> (${esc(u.user)}) نهائياً؟ ما يقدر يدخل بعدها، وفواتيره السابقة تبقى باسمه.</p>${mActions('data-a="user-del-ok"','حذف الحساب','bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs')}</div>`);},
 'user-del-ok':()=>{const i=S.users.findIndex(x=>x.id===S.m.id);if(i>=0&&S.users[i].role==='cashier')S.users.splice(i,1);closeModal();render();showToast('تم حذف الكاشير');},
 'user-toggle':e=>{const u=S.users.find(x=>x.id==e.dataset.id);u.on=!u.on;render();showToast(u.on?'تم تفعيل الحساب':'تم إيقاف الحساب');},
 'user-reset':e=>{const u=S.users.find(x=>x.id==e.dataset.id);S.m={type:'ur',id:u.id};modal(`${mHead(ic('fa-key','text-amber-500 ml-2'),'تغيير رمز '+esc(u.name))}<div class="space-y-4"><div><label class="${LBL}">الرمز الجديد (٤ أحرف أو أرقام على الأقل)</label><input id="ur-p" type="password" dir="ltr" class="${INP} text-left"></div>${mActions('data-a="user-reset-ok"','حفظ الرمز')}</div>`);},
 'user-reset-ok':async()=>{const p=$('#ur-p').value;if(p.length<4){showToast('الرمز ٤ خانات على الأقل','error');return;}await setPass(S.users.find(x=>x.id===S.m.id),p);closeModal();showToast('تم تغيير الرمز');},
 go:e=>go(e.dataset.p),sidebar:()=>toggleSidebar(),'sidebar-close':()=>sidebar(false),
 theme:()=>{const d=!document.documentElement.classList.contains('dark');setTheme(d);},
 add:e=>tapProduct(e.dataset.id),vpick:e=>{closeModal();cartAdd(e.dataset.id,e.dataset.v);},
 inc:e=>{const l=S.cart.lines[+e.dataset.ix];if(l.qty+1>ownMax(l)+1e-9){showToast('تجاوزت الكمية المتوفرة!','error');return;}l.qty=Math.round((l.qty+1)*1000)/1000;delete l.amt;drawCart();},
 dec:e=>{const l=S.cart.lines[+e.dataset.ix];l.qty=Math.round((l.qty-1)*1000)/1000;delete l.amt;if(l.qty<=0)S.cart.lines.splice(+e.dataset.ix,1);drawCart();},
 rm:e=>{S.cart.lines.splice(+e.dataset.ix,1);drawCart();},
 clear:()=>{S.cart.lines=[];S.cart.disc='';S.cart.note='';drawCart();},
 'cart-toggle':()=>{const c=$('#cart-panel-container'),o=$('#mobile-cart-overlay');const hide=!c.classList.contains('translate-y-full');c.classList.toggle('translate-y-full',hide);o.classList.toggle('hidden',hide);cartSync();if(hide)unstickSoon();},
 otype:e=>{const t=e.dataset.k;S.cart.type=t;document.querySelectorAll('#order-types [data-a="otype"]').forEach(b=>{b.className=`py-3 rounded-xl text-xs ${b.dataset.k===t?'font-black '+SEGON:'font-bold '+SEGOFF}`;});$('#car-row').classList.toggle('hidden',t!=='car');if(t==='car')setTimeout(()=>{const f=$('#oref');f&&f.focus();},60);},
 pay:()=>openCheckout(),pq:e=>payMode(e.dataset.k),'pay-ok':()=>payConfirm(),'close-modal':()=>closeModal(),
 inv:e=>showInvoice(+e.dataset.id),
 'cancel-start':e=>showInvoice(+e.dataset.id,true),
 reason:e=>{S.m.reason=e.dataset.r;document.querySelectorAll('[data-a="reason"]').forEach(b=>{b.className=`px-3 py-2 rounded-xl text-[11px] font-bold border-2 ${b===e?'border-primary bg-blue-50 text-primary':'border-transparent bg-white dark:bg-gray-700 text-gray-500'}`;});$('#cancel-ok').disabled=false;},
 'cancel-ok':()=>{const id=S.m.id,r=S.m.reason;cancelInvoice(id,r,roleName(),tick());closeModal();render();showToast(`أُلغيت الفاتورة ${id} وبقي لها أثر`);},
 cstmt:e=>showStatement(+e.dataset.id),
 newcust:()=>{S.m={type:'nc'};modal(`${mHead(ic('fa-user-plus','text-primary ml-2'),'عميل جديد')}<div class="space-y-4"><div><label class="${LBL}">الاسم</label><input id="nc-n" class="${INP}"></div><div><label class="${LBL}">الجوال</label><input id="nc-p" inputmode="tel" class="${INP}"></div>${mActions('data-a="nc-ok"','حفظ')}</div>`);},
 'nc-ok':()=>{const n=$('#nc-n').value.trim();if(!n)return;S.customers.push({id:uid(),n,ph:$('#nc-p').value.trim()||'—'});closeModal();render();showToast('أُضيف العميل');},
 custpay:e=>{const c=S.customers.find(x=>x.id==e.dataset.id),b=custBal(c.id);S.m={type:'cp',id:c.id,method:'cash'};
   modal(`${mHead(ic('fa-hand-holding-usd','text-emerald-500 ml-2'),'سند قبض من '+esc(c.n))}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold">المستحق عليه: <span class="text-red-500">${mt(b)}</span></p><div><label class="${LBL}">المبلغ (ر.ع)</label><input id="cp-a" inputmode="decimal" data-in="cpa" placeholder="0.000" class="${INP} text-center text-lg text-emerald-500"></div>
   <button data-a="cp-full" data-v="${fmt(b)}" class="text-primary text-xs font-bold">كامل المبلغ</button>
   <div class="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl" id="cp-methods">${[['cash','💵 كاش'],['visa','💳 فيزا'],['transfer','🏦 تحويل']].map(([k,n])=>`<button data-a="cp-m" data-k="${k}" class="py-2.5 rounded-xl text-[11px] font-black ${k==='cash'?SEGON:SEGOFF}">${n}</button>`).join('')}</div><p id="cp-msg" class="text-xs font-bold"></p>${mActions('id="cp-ok" data-a="cp-ok" disabled','تسجيل السداد',BTN_GREEN)}</div>`);},
 'cp-full':e=>{$('#cp-a').value=e.dataset.v;cpCalc();},
 'cp-m':e=>{S.m.method=e.dataset.k;document.querySelectorAll('#cp-methods [data-a="cp-m"]').forEach(b=>{b.className=`py-2.5 rounded-xl text-[11px] font-black ${b===e?SEGON:SEGOFF}`;});},
 'cp-ok':()=>{const a=parseB($('#cp-a').value);S.custPays.push({id:uid(),t:tick(),shift:curShift().id,customerId:S.m.id,amount:a,method:S.m.method});closeModal();render();showToast(`سُجّل سداد ${mt(a)}`);},
 refund:e=>{const c=S.customers.find(x=>x.id==e.dataset.id),b=-custBal(c.id);S.m={type:'rf',id:c.id,amt:b};
   modal(`${mHead(ic('fa-undo','text-amber-500 ml-2'),'رد مبلغ لـ'+esc(c.n))}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold leading-6">سيُسجَّل رد <span class="text-emerald-500">${mt(b)}</span> نقداً من الصندوق، ويصير رصيد العميل صفر.</p>${mActions('data-a="rf-ok"','تأكيد الرد',BTN_GREEN)}</div>`);},
 'rf-ok':()=>{S.custPays.push({id:uid(),t:tick(),shift:curShift().id,customerId:S.m.id,amount:-S.m.amt,method:'cash'});closeModal();render();showToast('سُجّل الرد');},
 remind:e=>{const c=S.customers.find(x=>x.id==e.dataset.id),b=custBal(c.id);waOpen('تذكير بالدين',c.ph,`السلام عليكم ${c.n}،\nنذكّركم بأن رصيدكم المستحق لدينا ${fmt(b)} ر.ع.\nنشكر تعاملكم معنا.`);},
 'cust-del':e=>{const c=S.customers.find(x=>x.id==e.dataset.id),b=custBal(c.id);S.m={type:'cd',id:c.id};
   modal(`${mHead(ic('fa-trash','text-red-500 ml-2'),'حذف عميل')}<div class="space-y-4">${b!==0?`<p class="text-xs text-gray-500 font-bold leading-6">ما يمدي تحذف <span class="text-gray-800 dark:text-white">${esc(c.n)}</span> لأن ${b>0?'عليه رصيد':'له عندنا رصيد'} <span class="${b>0?'text-red-500':'text-emerald-500'}">${mt(Math.abs(b))}</span>. ${b>0?'سجّل سند قبض بالمبلغ':'رُدّ له المبلغ'} أول، وبعدها احذفه.</p><button data-a="close-modal" class="w-full ${BTN_GRAY}">حسناً</button>`:`<p class="text-xs text-gray-500 font-bold leading-6">حذف "${esc(c.n)}" من قائمة العملاء؟ فواتيره القديمة تبقى كما هي.</p>${mActions('data-a="cust-del-ok"','حذف','bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs')}`}</div>`);},
 'cust-del-ok':()=>{const c=S.customers.find(x=>x.id===S.m.id);if(c&&custBal(c.id)===0)c.gone=true;closeModal();render();showToast('تم حذف العميل');},
 'prod-new':()=>prodModal(null),'prod-edit':e=>prodModal(e.dataset.id),
 'prod-save':()=>prodSave(),'prod-svc':()=>prodSync(),
 'v-add':()=>{$('#pd-vlist').insertAdjacentHTML('beforeend',vRow({}));prodSync();const r=[...document.querySelectorAll('#pd-vlist .v-name')].pop();r&&r.focus();},
 'v-preset':()=>{const have=new Set([...document.querySelectorAll('#pd-vlist .v-name')].map(i=>i.value.trim()));['صغير','وسط','كبير'].forEach(n=>{if(!have.has(n))$('#pd-vlist').insertAdjacentHTML('beforeend',vRow({n}));});prodSync();},
 'v-del':e=>{e.closest('.vrow').remove();prodSync();},
 'prod-del':e=>{const id=e.dataset.id;S.m={type:'pd',id};modal(`${mHead(ic('fa-trash','text-red-500 ml-2'),'حذف صنف')}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold leading-6">حذف "${esc(PROD[id].n)}" من القائمة؟ الفواتير القديمة تبقى كما هي.</p>${mActions('data-a="prod-del-ok"','حذف','bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs')}</div>`);},
 'prod-del-ok':()=>{const id=S.m.id,p=PROD[id];p.gone=true;S.rev++;if(p.own){const i=STOCK.findIndex(x=>x.id===p.own);if(i>=0)STOCK.splice(i,1);}S.cart.lines=S.cart.lines.filter(l=>l.pid!==id);closeModal();render();showToast('تم الحذف');},
 count:e=>countModal(e.dataset.id),
 'count-ok':()=>{const it=STOCK.find(s=>s.id===S.m.id),v=Math.round((parseFloat(String($('#c-qty').value).replace(',','.'))||0)*it.scale);S.adjusts.push({id:uid(),t:tick(),shift:curShift().id,stockId:it.id,delta:v-S.m.q,note:'جرد'});closeModal();render();showToast('حُفظ الجرد');},
 newpur:()=>newPurchase(),'pur-addline':()=>{S.m.lines.push({stockId:defStock(),qty:'',cost:''});drawPur();},
 purpay:e=>{S.m.pay=e.dataset.k;document.querySelectorAll('#pur-pay [data-a="purpay"]').forEach(b=>{b.className=`py-2.5 rounded-xl text-[11px] font-black ${b===e?SEGON:SEGOFF}`;});},
 'pur-ok':()=>purSave(),pur:e=>showPurchase(+e.dataset.id),
 newsupp:()=>{const n=$('#sp-name').value.trim();if(!n){showToast('اكتب اسم المورد','error');return;}S.suppliers.push({id:uid(),n,ph:($('#sp-phone').value||'').trim()});render();showToast('أُضيف المورد');},
 'supp-del':e=>{const c=S.suppliers.find(x=>x.id==e.dataset.id),b=suppBal(c.id);S.m={type:'sd',id:c.id};
   modal(`${mHead(ic('fa-trash','text-red-500 ml-2'),'حذف مورد')}<div class="space-y-4">${b!==0?`<p class="text-xs text-gray-500 font-bold leading-6">ما يمدي تحذف <span class="text-gray-800 dark:text-white">${esc(c.n)}</span> لأن بينكم رصيد <span class="text-red-500">${mt(Math.abs(b))}</span>. سجّل سند صرف أول، وبعدها احذفه.</p><button data-a="close-modal" class="w-full ${BTN_GRAY}">حسناً</button>`:`<p class="text-xs text-gray-500 font-bold leading-6">حذف "${esc(c.n)}" من الموردين؟ فواتير مشترياته القديمة تبقى كما هي.</p>${mActions('data-a="supp-del-ok"','حذف','bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs')}`}</div>`);},
 'supp-del-ok':()=>{const c=S.suppliers.find(x=>x.id===S.m.id);if(c&&suppBal(c.id)===0)c.gone=true;closeModal();render();showToast('تم حذف المورد');},
 sstmt:e=>{const s=S.suppliers.find(x=>x.id==e.dataset.id),b=suppBal(s.id),rows=suppStatement(s.id);
   modal(`${mHead(ic('fa-truck','text-emerald-500 ml-2'),'كشف حساب '+esc(s.n))}<div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4"><span class="text-xs font-black text-gray-500">المستحق له</span><span class="text-2xl font-black ${b>0?'text-red-500':'text-gray-400'}">${m(b)}</span></div><div class="overflow-x-auto"><table class="w-full text-right text-xs"><thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-bold border-b dark:border-gray-800"><tr><th class="p-3">التاريخ</th><th class="p-3">البيان</th><th class="p-3 text-center">علينا</th><th class="p-3 text-center">دفعنا</th><th class="p-3 text-center">الرصيد</th></tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-800">${rows.slice().reverse().map(r=>`<tr><td class="p-3">${dm(r.t)}</td><td class="p-3 font-bold">${r.txt}</td><td class="p-3 text-center">${r.dr?fmt(r.dr):''}</td><td class="p-3 text-center text-emerald-500">${r.cr?fmt(r.cr):''}</td><td class="p-3 text-center font-black">${fmt(r.bal)}</td></tr>`).join('')||empty(5,'لا حركات آجلة')}</tbody></table></div>`,'max-w-2xl');},
 supppay:e=>{const s=S.suppliers.find(x=>x.id==e.dataset.id),b=suppBal(s.id);S.m={type:'sp',id:s.id,method:'cash'};
   modal(`${mHead(ic('fa-truck','text-emerald-500 ml-2'),'سند صرف لـ'+esc(s.n))}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold">المستحق عليكم: <span class="text-red-500">${mt(b)}</span></p><div><label class="${LBL}">المبلغ (ر.ع)</label><input id="sp-a" inputmode="decimal" data-in="spa" placeholder="0.000" class="${INP} text-center text-lg"></div><button data-a="sp-full" data-v="${fmt(b)}" class="text-primary text-xs font-bold">كامل المبلغ</button>
   <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl" id="sp-methods">${[['cash','💵 كاش'],['visa','💳 فيزا']].map(([k,n])=>`<button data-a="sp-m" data-k="${k}" class="py-2.5 rounded-xl text-[11px] font-black ${k==='cash'?SEGON:SEGOFF}">${n}</button>`).join('')}</div><p id="sp-msg" class="text-xs font-bold"></p>${mActions('id="sp-ok" data-a="sp-ok" disabled','تسجيل الدفعة',BTN_GREEN)}</div>`);},
 'sp-full':e=>{$('#sp-a').value=e.dataset.v;spCalc();},
 'sp-m':e=>{S.m.method=e.dataset.k;document.querySelectorAll('#sp-methods [data-a="sp-m"]').forEach(b=>{b.className=`py-2.5 rounded-xl text-[11px] font-black ${b===e?SEGON:SEGOFF}`;});},
 'sp-ok':()=>{const a=parseB($('#sp-a').value);S.suppPays.push({id:uid(),t:tick(),shift:curShift().id,supplierId:S.m.id,amount:a,method:S.m.method});closeModal();render();showToast(`سُجّلت دفعة ${mt(a)}`);},
 expcat:e=>{S.ui.exp.cat=e.dataset.k;render();},expfrom:e=>{S.ui.exp.from=e.dataset.k;render();},
 'exp-ok':()=>{const u=S.ui.exp,a=parseB(u.amount);if(!a){showToast('اكتب المبلغ أول','error');return;}S.expenses.push({id:uid(),t:tick(),shift:curShift().id,cat:u.cat,amount:a,note:u.note,from:u.from});S.ui.exp={amount:'',cat:u.cat,note:'',from:u.from};render();showToast(`سُجّل صرف ${mt(a)} · ${u.cat}`);},
 prange:e=>{S.ui.profit.range=e.dataset.k;render();},
 'close-start':()=>{const sh=curShift(),exp=drawer(sh.id),cnt=parseB(S.ui.close.counted),d=cnt-exp;S.m={type:'cs',exp,cnt,d};
   modal(`${mHead(ic('fa-clock','text-primary ml-2'),'تأكيد إقفال الوردية')}<div class="space-y-4"><div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-2 text-xs font-bold"><div class="flex justify-between"><span class="text-gray-500">المتوقع</span><span>${mt(exp)}</span></div><div class="flex justify-between"><span class="text-gray-500">الفعلي</span><span>${mt(cnt)}</span></div><div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-black"><span>الفرق</span><span class="${d===0?'text-emerald-500':d<0?'text-red-500':'text-amber-600'}">${d===0?'مطابق':(d<0?'نقص ':'زيادة ')+mt(Math.abs(d))}</span></div></div><p class="text-[11px] text-gray-400 leading-6">بعد الإقفال لا تُعدَّل فواتير هذه الوردية. الفرق يظهر في صفحة المراقبة للمدير.</p>${mActions('data-a="close-ok"','تأكيد الإقفال',BTN_DARK)}</div>`);},
 'close-ok':()=>{const sh=curShift(),s=S.m;sh.end=tick();sh.expected=s.exp;sh.counted=s.cnt;sh.diff=s.d;touch('shifts',sh);S.ui.close.counted='';closeModal();render();showToast('أُقفلت الوردية');if(S.invoices.length)setTimeout(backupPrompt,400);},
 'open-shift':()=>{const f=parseB(S.ui.close.float);S.shifts.push({id:uid(),start:tick(),end:null,float:f,expected:null,counted:null,diff:null});render();showToast('فُتحت وردية جديدة');}
};
function cpCalc(){const s=S.m,b=custBal(s.id),a=parseB($('#cp-a').value),el=$('#cp-msg'),g=a>0&&a<=b;el.textContent=a<=0?'':a>b?`المبلغ أكبر من المستحق (${fmt(b)})`:(a===b?'سداد كامل':`يتبقى عليه ${mt(b-a)}`);el.className='text-xs font-bold '+(g?'text-emerald-500':'text-amber-600');$('#cp-ok').disabled=!g;}
function spCalc(){const s=S.m,b=suppBal(s.id),a=parseB($('#sp-a').value),el=$('#sp-msg'),g=a>0&&a<=b;el.textContent=a<=0?'':a>b?`المبلغ أكبر من المستحق (${fmt(b)})`:(a===b?'سداد كامل':`يتبقى علينا ${mt(b-a)}`);el.className='text-xs font-bold '+(g?'text-emerald-500':'text-amber-600');$('#sp-ok').disabled=!g;}
document.addEventListener('click',ev=>{
  if(ev.target.id==='app-modal'){if(!(S.m&&(S.m.type==='pay'||S.m.type==='rec')))closeModal();return;}
  const el=ev.target.closest('[data-a],[data-theme-btn]');if(!el)return;
  if(el.dataset.themeBtn!==undefined){A.theme();return;}
  if(el.tagName==='INPUT'&&el.type!=='checkbox')return;
  const f=A[el.dataset.a];if(!f)return;
  const r=f(el,ev);if(r&&r.then)r.then(()=>persist(),e=>{console.error(e);showToast('خطأ: '+(e.message||e),'error');});else persist();
});
document.addEventListener('input',ev=>{
  const el=ev.target,k=el.dataset.in,bind=el.dataset.bind;
  if(bind){const [g,f]=bind.split('.');S.ui[g][f]=el.value;if(g==='close'&&f==='counted')closeRes();return;}
  if(!k)return;
  if(k==='pay')payRecalc();
  else if(k==='posq'){S.posQ=el.value;drawGrid();}
  else if(k==='oref')S.cart.ref=el.value;
  else if(k==='odisc'){S.cart.disc=el.value;payRecalc();}
  else if(k==='cqty'){const ix=+el.dataset.ix,l=S.cart.lines[ix];let q=parseFloat(el.value);if(isNaN(q)||q<0)q=0;const mx=ownMax(l);if(q>mx+1e-9){q=mx;el.value=qtyStr(q);showToast('الكمية المتاحة '+qtyStr(mx),'error');}l.qty=q;delete l.amt;$('#ctot-'+ix).value=fmt(cartLineAmt(l));cartSync();}
  else if(k==='ctot'){const ix=+el.dataset.ix,l=S.cart.lines[ix],pr=unitPrice(l);let a=parseB(el.value),q=pr>0?a/pr:0;const mx=ownMax(l);if(q>mx+1e-9){q=mx;a=Math.round(mx*pr);el.value=fmt(a);showToast('الكمية المتاحة '+qtyStr(mx),'error');}l.amt=a;l.qty=q;$('#cqty-'+ix).value=qtyStr(Math.round(l.qty*1000)/1000);cartSync();}
  else if(k==='invq'){S.ui.inv.q=el.value;invBody();}
  else if(k==='cq'){S.ui.cust.q=el.value;$('#customers-table-body').innerHTML=custRows();}
  else if(k==='prodq'){S.ui.prod={q:el.value};$('#prod-grid').innerHTML=prodCards();}
  else if(k==='vrow')prodSync();
  else if(k==='pdicon'){if(el.value.trim()&&S.m.img){S.m.img='';prodSync();}}
  else if(k==='waphone')waRefresh();
  else if(k==='cpa')cpCalc();
  else if(k==='spa')spCalc();
  else if(k==='pursup')S.m.sup=el.value;
  else if(k==='purline'){S.m.lines[+el.dataset.ix][el.dataset.f]=el.value;purCalc();}
  else if(k==='countq'){const it=STOCK.find(s=>s.id===S.m.id),v=Math.round((parseFloat(String(el.value).replace(',','.'))||0)*it.scale),d=v-S.m.q,s=$('#c-diff');
    s.textContent=el.value.trim()===''?'':d===0?'مطابق للبرنامج':`الفرق: ${d>0?'زيادة':'نقص'} ${qtyText(it,Math.abs(d))}`;s.className='text-xs font-bold '+(d===0?'text-emerald-500':'text-amber-600');$('#c-ok').disabled=el.value.trim()==='';}
});
document.addEventListener('change',ev=>{
  const el=ev.target,k=el.dataset.in;
  if(k==='invshift'){S.ui.inv.shift=el.value;render();}
  else if(k==='invf'){S.ui.inv.f=el.value;invBody();}
  else if(k==='purline'&&el.dataset.f==='stockId')S.m.lines[+el.dataset.ix].stockId=el.value;
  else if(k==='pay')payRecalc();
  else if(k==='cqty'||k==='ctot'){const ix=+el.dataset.ix,l=S.cart.lines[ix];if(l&&!(l.qty>0)){S.cart.lines.splice(ix,1);drawCart();}}
  else if((el.id==='bk-file'||el.id==='bk-file-setup')&&el.files&&el.files[0]){const f=el.files[0];el.value='';readText(f).then(t=>{let b=null;try{b=JSON.parse(t);}catch(e){}confirmRestore(b);},()=>showToast('تعذّرت قراءة الملف','error'));}
  else if(el.id==='old-file'&&el.files&&el.files[0]){const f=el.files[0];el.value='';readText(f).then(t=>{let d=null;try{d=JSON.parse(t);}catch(e){}
    if(!d||!Array.isArray(d.products)){showToast('هذا الملف ليس نسخة من البرنامج القديم','error');return;}
    const [np,nc,ns]=importOld(d);persist();render();showToast(`تم استيراد ${np} صنف و${nc} عميل و${ns} مورد`);},()=>showToast('تعذّرت قراءة الملف','error'));}
  else if(el.id==='pd-file'&&el.files&&el.files[0]){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{if(!S.m||S.m.type!=='prod')return;const c=document.createElement('canvas'),k=Math.min(1,160/Math.max(im.width,im.height)),x=c.getContext('2d');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);S.m.img=c.toDataURL('image/jpeg',0.82);$('#pd-icon').value='';el.value='';prodSync();};im.onerror=()=>showToast('تعذّر قراءة الصورة','error');im.src=r.result;};r.readAsDataURL(el.files[0]);}
  else if(el.id==='st-logo'&&el.files&&el.files[0]){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,128/Math.max(im.width,im.height));c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);S.logoDraft=c.toDataURL('image/png');$('#st-logo-prev').innerHTML=`<img src="${S.logoDraft}" class="w-full h-full object-cover">`;};im.src=r.result;};r.readAsDataURL(el.files[0]);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});window.addEventListener('pagehide',()=>{persist();});
document.addEventListener('submit',ev=>{if(ev.target.id==='login-form'){ev.preventDefault();tryLogin();}else if(ev.target.id==='setup-form'){ev.preventDefault();trySetup();}else if(ev.target.id==='forgot-form'){ev.preventDefault();tryForgot();}else if(ev.target.id==='wa-form'){ev.preventDefault();$('#wa-send').click();}});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if(!$('#whatsapp-modal').classList.contains('hidden'))$('#whatsapp-modal').classList.add('hidden');else if(!$('#invoice-preview-modal').classList.contains('hidden'))closePreview();else if(!$('#app-modal').classList.contains('hidden')&&!(S.m&&S.m.type==='rec'))closeModal();}});

/* الوضع الليلي: يتبع إعداد الجهاز ويمكن تبديله من القائمة (نفس زر "ليلي" في برنامجك) */
function setTheme(dark){const r=document.documentElement;r.classList.toggle('dark',dark);r.setAttribute('data-theme',dark?'dark':'light');const b=$('#btn-theme-label');if(b)b.textContent=dark?'نهاري':'ليلي';const i=$('#sidebar-theme-icon');if(i)i.className='fas '+(dark?'fa-sun':'fa-moon')+' text-xs text-gray-400';const j=$('#auth-theme-icon');if(j)j.className='fas '+(dark?'fa-sun':'fa-moon')+' text-xs';}
(function(){const mq=window.matchMedia('(prefers-color-scheme: dark)');const explicit=document.documentElement.getAttribute('data-theme');setTheme(explicit?explicit==='dark':mq.matches);
 if(mq.addEventListener)mq.addEventListener('change',e=>setTheme(e.matches));
 new MutationObserver(()=>{const t=document.documentElement.getAttribute('data-theme');if(t&&(t==='dark')!==document.documentElement.classList.contains('dark'))setTheme(t==='dark');}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});})();

/* ── الدخول ── */
/* ── الحسابات (محلية على الآيباد، بدون سيرفر) ──
   الرمز لا يُخزَّن نصاً: ملح + PBKDF2. هذا يمنع الاستخدام العابر، أما حماية الجهاز نفسه فبقفل الآيباد */
const hexOf=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function pwHash(salt,pw){
  try{if(window.crypto&&crypto.subtle){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
    return 'p'+hexOf(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256));}}catch(e){}
  let h=5381;const t=salt+':'+pw;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))>>>0;return 'x'+h.toString(16);
}
const newSalt=()=>{try{return hexOf(crypto.getRandomValues(new Uint8Array(8)));}catch(e){return Math.random().toString(36).slice(2,12);}};
async function setPass(u,pw){u.salt=newSalt();u.hash=await pwHash(u.salt,pw);delete u.pass;}
const RC_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newRecCode(){let a;try{a=crypto.getRandomValues(new Uint8Array(16));}catch(e){a=Array.from({length:16},()=>Math.floor(Math.random()*256));}return [...a].map(x=>RC_CH[x%RC_CH.length]).join('').replace(/(.{4})(?=.)/g,'$1-');}
const normRec=c=>String(c).toUpperCase().replace(/[^A-Z0-9]/g,'');
async function setRecovery(code){const salt=newSalt();S.meta.rec={salt,hash:await pwHash(salt,normRec(code))};}
async function checkRecovery(code){const r=S.meta.rec;return !!r&&(await pwHash(r.salt,normRec(code)))===r.hash;}
function showRecModal(code,after){
  S.m={type:'rec'};S.afterRec=after;
  modal(`<h3 class="text-lg font-black mb-3 text-gray-800 dark:text-white">${ic('fa-key','text-amber-500 ml-2')}رمز الاسترجاع</h3><div class="space-y-4">
   <p class="text-xs text-gray-500 font-bold leading-6">هذا الرمز يرجّعك للحساب لو نسيت رمز المدير. <b class="text-red-500">يظهر مرة وحدة فقط.</b> اكتبه على ورقة أو احفظه عندك بعيد عن الآيباد.</p>
   <div dir="ltr" class="font-mono text-xl sm:text-2xl font-black tracking-wider text-center bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-amber-300 rounded-2xl py-4 select-all" id="rec-code">${esc(code)}</div>
   <div class="grid grid-cols-2 gap-2"><button data-a="rec-copy" data-v="${esc(code)}" class="${BTN_GRAY}">${ic('fa-copy','ml-1')} نسخ</button><button data-a="rec-share" data-v="${esc(code)}" class="${BTN_GRAY}">${ic('fa-share-nodes','ml-1')} مشاركة</button></div>
   <label class="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"><input type="checkbox" id="rec-ack" data-a="rec-ack" class="w-4 h-4 rounded text-primary border-gray-300"><span>حفظت الرمز في مكان آمن</span></label>
   <button id="rec-done" data-a="rec-done" disabled class="w-full ${BTN} disabled:opacity-50 py-4">متابعة</button></div>`);
}

const SESS_KEY='cafe-sess';let loginFails=0,lockUntil=0;
function authMode(mode){
  ['login','setup','forgot'].forEach(m=>$('#'+m+'-form').classList.toggle('hidden',m!==mode));
  $('#auth-sub').textContent={login:'ادخل باسم المستخدم للمتابعة',setup:'إعداد المتجر لأول مرة',forgot:'استعادة الدخول برمز الاسترجاع'}[mode];
  ['#login-err','#reg-err','#fg-err'].forEach(i=>$(i).classList.add('hidden'));
  $('#auth-view').classList.remove('hidden');$('#app-view').classList.add('hidden');
  setTimeout(()=>{const f=$({login:'#login-user',setup:'#reg-store',forgot:'#fg-user'}[mode]);f&&f.focus();},60);
}
function showAuth(){$('#login-pass').value='';authMode('login');}
function showSetup(){authMode('setup');}
function enter(u,remember){
  S.user=u;try{if(remember)localStorage.setItem(SESS_KEY,String(u.id));else localStorage.removeItem(SESS_KEY);}catch(e){}
  $('#auth-view').classList.add('hidden');$('#app-view').classList.remove('hidden');
  const h=pageOf(location.hash.slice(1));S.page=VIEWS[h]&&allowed(h)?h:homePage();if(location.hash.slice(1)!==hashOf(S.page))location.hash=hashOf(S.page);
  render();
}
const errMsg=(id,t)=>{const e=$(id);e.textContent=t;e.classList.remove('hidden');};
const locked=()=>{const now=Date.now();return now<lockUntil?Math.ceil((lockUntil-now)/1000):0;};
function failed(id,msg){if(++loginFails>=5){lockUntil=Date.now()+30000;loginFails=0;errMsg(id,'محاولات خاطئة كثيرة — انتظر 30 ثانية');}else errMsg(id,msg);}
async function tryLogin(){
  if(locked()){errMsg('#login-err','محاولات خاطئة كثيرة — انتظر '+locked()+' ثانية');return;}
  const un=$('#login-user').value.trim().toLowerCase(),pw=$('#login-pass').value,cand=S.users.find(x=>x.user===un),u=cand&&cand.hash&&(await pwHash(cand.salt,pw))===cand.hash?cand:null;
  if(!u){failed('#login-err','اسم المستخدم أو الرمز غير صحيح');return;}
  if(!u.on){errMsg('#login-err','هذا الحساب موقوف — راجع المدير');return;}
  loginFails=0;enter(u,$('#login-remember').checked);
}
async function trySetup(){
  const v=id=>($(id).value||'').trim(),store=v('#reg-store'),name=v('#reg-name'),phone=v('#reg-phone'),un=v('#reg-user').toLowerCase(),pw=$('#reg-pass').value;
  if(!store||!name||!un){errMsg('#reg-err','اكتب اسم المتجر واسمك واسم المستخدم');return;}
  if(phone.replace(/\D/g,'').length<8){errMsg('#reg-err','رقم الهاتف غير صحيح');return;}
  if(!/^[a-z0-9_.-]{3,}$/.test(un)){errMsg('#reg-err','اسم المستخدم بالإنجليزية وبدون مسافات (٣ أحرف على الأقل)');return;}
  if(pw.length<4){errMsg('#reg-err','الرمز ٤ خانات على الأقل');return;}
  if(pw!==$('#reg-pass2').value){errMsg('#reg-err','الرمزان غير متطابقين');return;}
  if(S.users.length)return;
  const b=$('#setup-form button[type=submit]');b.disabled=true;
  try{
    S.store.name=store;S.store.phone=phone;S.meta.created=Date.now();
    const u={id:uid(),name,user:un,role:'manager',on:true};await setPass(u,pw);S.users.push(u);
    S.shifts.push({id:uid(),start:Date.now(),end:Date.now(),float:0,expected:0,counted:0,diff:0,init:true});
    const code=newRecCode();await setRecovery(code);await persist();
    ['#reg-store','#reg-name','#reg-phone','#reg-user','#reg-pass','#reg-pass2'].forEach(i=>$(i).value='');
    showRecModal(code,()=>{enter(u,true);showToast('أهلاً '+name+'، ابدأ بإضافة أصنافك');});
  }finally{b.disabled=false;}
}
async function tryForgot(){
  if(locked()){errMsg('#fg-err','محاولات خاطئة كثيرة — انتظر '+locked()+' ثانية');return;}
  const un=($('#fg-user').value||'').trim().toLowerCase(),code=$('#fg-code').value,pw=$('#fg-pass').value,u=S.users.find(x=>x.user===un&&x.role==='manager');
  if(!u||!(await checkRecovery(code))){failed('#fg-err','اسم المستخدم أو رمز الاسترجاع غير صحيح');return;}
  if(pw.length<4){errMsg('#fg-err','الرمز الجديد ٤ خانات على الأقل');return;}
  if(pw!==$('#fg-pass2').value){errMsg('#fg-err','الرمزان غير متطابقين');return;}
  loginFails=0;await setPass(u,pw);u.on=true;const nc=newRecCode();await setRecovery(nc);await persist();
  ['#fg-code','#fg-pass','#fg-pass2'].forEach(i=>$(i).value='');
  showRecModal(nc,()=>{showAuth();showToast('تم تغيير الرمز، سجّل دخولك');});
}

/* ── النسخ الاحتياطي والاسترجاع واستيراد القديم ── */
function backupPrompt(){S.m={type:'bp'};modal(`${mHead(ic('fa-download','text-emerald-500 ml-2'),'نسخة احتياطية؟')}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold leading-6">أُقفلت الوردية. خذ نسخة من بياناتك الحين وأرسلها لنفسك، لأن كل شيء محفوظ على هذا الآيباد فقط.</p><div class="flex gap-3"><button data-a="bk-save-close" class="flex-1 ${BTN_GREEN}">${ic('fa-download')}<span>حفظ نسخة</span></button><button data-a="close-modal" class="flex-1 ${BTN_GRAY}">لاحقاً</button></div></div>`);}
function markBackup(){S.meta.lastBackup=Date.now();persist();if(S.page==='settings'&&S.user)render();}
async function shareBackup(){
  const json=JSON.stringify(buildBackup()),stamp=stampNow();
  const f1=new File([json],'cafe-backup-'+stamp+'.json',{type:'application/json'}),f2=new File([json],'cafe-backup-'+stamp+'.json.txt',{type:'text/plain'});
  try{
    for(const f of [f1,f2])if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'نسخة احتياطية — '+S.store.name});markBackup();showToast('تم حفظ النسخة');return;}
  }catch(e){if(e&&e.name==='AbortError')return;}
  const u=URL.createObjectURL(f1),a=document.createElement('a');a.href=u;a.download=f1.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);
  markBackup();showToast('جُهّزت النسخة، تلقاها في «الملفات» ← التنزيلات');
}
const readText=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsText(f);});
function confirmRestore(b){
  if(!backupOk(b)){showToast('هذا الملف ليس نسخة احتياطية من هذا البرنامج','error');return;}
  S.pendingRestore=b;S.m={type:'rs'};
  modal(`${mHead(ic('fa-upload','text-red-500 ml-2'),'استرجاع نسخة احتياطية')}<div class="space-y-4"><div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-xs font-bold space-y-2"><div class="flex justify-between"><span class="text-gray-500">تاريخ النسخة</span><span>${dm(b.at)} ${hm(b.at)}</span></div><div class="flex justify-between"><span class="text-gray-500">المتجر</span><span>${esc(b.kv.store&&b.kv.store.name||'—')}</span></div><div class="flex justify-between"><span class="text-gray-500">الفواتير</span><span>${b.invoices.length}</span></div><div class="flex justify-between"><span class="text-gray-500">الأصناف</span><span>${Object.keys(b.kv.products||{}).length}</span></div></div>
   ${S.users.length?`<p class="text-xs text-red-500 font-bold leading-6">تنبيه: كل البيانات الحالية على هذا الآيباد بتنمسح وتنحل محلها بيانات النسخة.</p>`:''}${mActions('data-a="restore-ok"','استرجاع','bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs')}</div>`);
}
function importOld(d){
  let np=0,nc=0,ns=0;const names=new Set(prodIds().map(k=>PROD[k].n));
  (Array.isArray(d.products)?d.products:[]).forEach(o=>{
    if(!o||!o.name||names.has(String(o.name)))return;names.add(String(o.name));
    const id='p'+Date.now().toString(36)+(np++).toString(36),p={n:String(o.name).slice(0,60),p:Math.round((+o.price||0)*1000),c:Math.round((+o.cost||0)*1000),bc:String(o.barcode||('SKU'+Math.floor(10000+Math.random()*90000))),svc:!!o.isService,img:'',icon:'📦'};
    const m=typeof o.media==='string'?o.media:'';if(m.startsWith('data:image')){if(m.length<120000)p.img=m;}else if(m)p.icon=m.slice(0,8);
    const vs=(Array.isArray(o.variants)?o.variants:[]).filter(v=>v&&v.name).map(v=>({id:newVid(),n:String(v.name).slice(0,24),p:Math.round((+v.price||0)*1000),c:Math.round((+v.cost||0)*1000)}));
    if(vs.length){const lo=vs.reduce((a,b)=>b.p<a.p?b:a);p.vars=vs;p.p=lo.p;p.c=lo.c;}
    if(!p.svc){const sid='o_'+id;STOCK.push({id:sid,n:p.n,unit:'حبة',scale:1,min:5,start:Math.max(0,parseInt(o.stock,10)||0),own:id});p.own=sid;p.uses={[sid]:1};}
    PROD[id]=p;});
  const cn=new Set(S.customers.map(c=>c.n));(Array.isArray(d.customers)?d.customers:[]).forEach(c=>{const n=c&&(c.name||c.n);if(!n||cn.has(n))return;cn.add(n);S.customers.push({id:uid(),n:String(n).slice(0,60),ph:String(c.phone||c.ph||'—').slice(0,20)});nc++;});
  const sn=new Set(S.suppliers.map(c=>c.n));(Array.isArray(d.suppliers)?d.suppliers:[]).forEach(c=>{const n=c&&(c.name||c.n);if(!n||sn.has(n))return;sn.add(n);S.suppliers.push({id:uid(),n:String(n).slice(0,60),ph:String(c.phone||c.ph||'')});ns++;});
  S.rev++;return [np,nc,ns];
}
Object.assign(A,{
 'auth-mode':e=>authMode(e.dataset.m),
 'bk-save':()=>shareBackup(),'bk-save-close':()=>{closeModal();return shareBackup();},
 'restore-ok':async()=>{const b=S.pendingRestore;if(!b)return;try{await restoreBackup(b);location.reload();}catch(e){showToast('تعذّر الاسترجاع: '+(e.message||e),'error');}},
 'rec-new':async()=>{const c=newRecCode();await setRecovery(c);await persist();showRecModal(c,()=>{showToast('تم إنشاء رمز استرجاع جديد');});},
 'rec-copy':e=>{try{navigator.clipboard.writeText(e.dataset.v).then(()=>showToast('تم النسخ'),()=>showToast('حدّد الرمز وانسخه يدوياً','error'));}catch(_){showToast('حدّد الرمز وانسخه يدوياً','error');}},
 'rec-share':e=>{try{if(navigator.share)navigator.share({title:'رمز استرجاع '+S.store.name,text:e.dataset.v}).catch(()=>{});else A['rec-copy'](e);}catch(_){A['rec-copy'](e);}},
 'rec-ack':e=>{$('#rec-done').disabled=!e.checked;},
 'rec-done':()=>{const f=S.afterRec;S.afterRec=null;closeModal();f&&f();},
 reload:()=>location.reload()
});

/* ── التشغيل ── */
window.onPersistError=e=>{$('#persist-banner').classList.remove('hidden');console.error(e);};
function registerSW(){
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
  navigator.serviceWorker.register('sw.js').then(reg=>{
    try{reg.update();}catch(e){}
    reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)$('#update-banner').classList.remove('hidden');});});
  }).catch(()=>{});
}
(async()=>{
  try{await loadState();}catch(e){$('#fatal-msg').textContent=String((e&&e.message)||e);$('#fatal-view').classList.remove('hidden');return;}
  loadCart();$('#install-tip').innerHTML=installTip();
  if(!S.users.length)showSetup();
  else{let rid=null;try{rid=localStorage.getItem(SESS_KEY);}catch(e){}const ru=rid&&S.users.find(x=>String(x.id)===rid&&x.on);if(ru)enter(ru,true);else showAuth();}
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  registerSW();
})();

})();
