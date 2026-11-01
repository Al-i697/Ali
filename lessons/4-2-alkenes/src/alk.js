/* ---------- helpers for the alkenes lesson: alkene data (book table 4-6 and activity-book exercise 4-2) and small drawings ---------- */
var ENE=[
 {n:2,f:'C2H4',name:'إيثين',bp:-104,st:'غاز'},{n:3,f:'C3H6',name:'بروبين',bp:-47,st:'غاز'},{n:4,f:'C4H8',name:'بيوتين',bp:-6,st:'غاز'},
 {n:5,f:'C5H10',name:'بنتين',bp:30,st:'سائل'},{n:6,f:'C6H12',name:'هكسين',bp:60,st:'سائل'}
];
var PREF=['ميث','إيث','بروب','بيوت','بنت','هكس'];
/* a small framed drawing, used inside the options of the questions */
function sfe(svg){return '<span style="display:inline-block;background:rgba(var(--d2),.5);border-radius:12px;padding:2px 8px;direction:ltr">'+svg+'</span>'}
function pbox(svg){return '<div class="panel" style="padding:8px 14px;align-items:center">'+svg+'</div>'}
/* a numbered list of short statements */
function ul(a){return '<ul style="margin:0;padding-inline-start:22px;font-size:21px;line-height:1.55">'+a.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ul>'}
