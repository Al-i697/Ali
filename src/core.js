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
