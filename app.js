"use strict";
/* north star: state, sync, food, pages and events */

/* ===== core: state, sync, helpers ===== */
/* ============================================================
   north star — core: state, dates, merge/sync, cycle, stats, charts
   ============================================================ */
const KEY="northstar.v1", LKEY="northstar.local";
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

const def=()=>({v:2,
  settings:{name:"",avatar:"",goal:80,startW:"",carGoal:8000,waterGoal:8,calGoal:"",stepGoal:"",cycleLen:28,periodLen:5,trackCycle:true},
  days:{},weeks:{},months:{},weights:[],jobs:[],savings:[],periods:[],
  checks:{car:{},job:{},health:{}},notes:{car90:"",why:"",scent:"",muse:0},su:{},del:{}});
/* device-local: look + sync connection (never synced) */
const defLocal=()=>({theme:"dark",house:"winedark",syncUrl:"",token:"",lastSync:0,lastBackup:0,auto:true,dense:"cozy",hide:{},fold:{}});

function normalize(o){
  const r=Object.assign(def(),o||{});
  r.settings=Object.assign(def().settings,r.settings||{});
  r.checks=Object.assign({car:{},job:{},health:{}},r.checks||{});
  r.notes=Object.assign(def().notes,r.notes||{});
  ["weights","jobs","savings","periods"].forEach(c=>{r[c]=(Array.isArray(r[c])?r[c]:[]).map(it=>{if(!it.id)it.id=uid();if(!it._u)it._u=1;return it})});
  ["days","weeks","months","su","del"].forEach(c=>{if(!r[c]||typeof r[c]!=="object")r[c]={}});
  r.v=2;return r;
}

let st=def(),LS=defLocal(),mem=false;
try{
  const raw=localStorage.getItem(KEY),l=localStorage.getItem(LKEY);
  if(raw){const o=JSON.parse(raw);st=normalize(o);
    if(!l&&o.settings){["theme","house","syncUrl","lastBackup"].forEach(k=>{if(o.settings[k])LS[k]=o.settings[k]})}}
  if(l)LS=Object.assign(defLocal(),JSON.parse(l));
}catch(e){mem=true}

/* ---------- persistence ---------- */
let saveT=null,dirty=false,syncT=null,syncing=false;
function setSaved(t){const e=document.getElementById("saved");if(e)e.textContent=mem&&!/saved \d/.test(t)?"not saved on this device":t}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(st));localStorage.setItem(LKEY,JSON.stringify(LS));setSaved("saved "+new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}))}catch(e){setSaved("not saved (storage blocked)")}}
function persistLocal(){try{localStorage.setItem(LKEY,JSON.stringify(LS))}catch(e){}}
function save(){dirty=true;clearTimeout(saveT);saveT=setTimeout(persist,250);setSaved("saving…");if(LS.syncUrl&&!syncing)setSyncState("pending");scheduleSync()}
function scheduleSync(){clearTimeout(syncT);if(LS.syncUrl&&LS.auto)syncT=setTimeout(()=>syncNow(false),15000)}

/* ---------- dates ---------- */
const p2=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());
const mkey=d=>d.getFullYear()+"-"+p2(d.getMonth()+1);
const parse=k=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d||1)};
const todayKey=()=>dkey(new Date());
const dn=k=>{const [y,m,d]=k.split("-").map(Number);return Date.UTC(y,m-1,d)/864e5};
const daysBetween=(a,b)=>Math.round(dn(b)-dn(a));
const addDays=(k,n)=>{const d=parse(k);d.setDate(d.getDate()+n);return dkey(d)};
const monday=k=>addDays(k,-((parse(k).getDay()+6)%7));
function isoWeek(k){const d=parse(k);const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear();const w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return y+"-W"+p2(w)}
const weekDays=k=>{const m=monday(k);return[0,1,2,3,4,5,6].map(i=>addDays(m,i))};
const pretty=k=>parse(k).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const short=k=>parse(k).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
const md=k=>parse(k).toLocaleDateString(undefined,{month:"short",day:"numeric"});
const monthLabel=id=>parse(id+"-01").toLocaleDateString(undefined,{month:"long",year:"numeric"});
const addMonths=(id,n)=>{const [y,m]=id.split("-").map(Number);const d=new Date(y,m-1+n,1);return mkey(d)};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- state paths ---------- */
const gp=p=>p.split("/").reduce((o,k)=>o&&o[k],st);
function stamp(p){
  const k=p.split("/"),now=Date.now();
  if(["days","weeks","months"].includes(k[0])&&k[1]){const o=st[k[0]][k[1]]||(st[k[0]][k[1]]={});o._u=now}
  else if(["jobs","savings","weights","periods"].includes(k[0])){const it=st[k[0]][+k[1]];if(it)it._u=now}
  else st.su[k[0]]=now;
}
function sp(p,v){
  const ks=p.split("/");let o=st;
  ks.slice(0,-1).forEach(k=>{if(o[k]==null)o[k]={};o=o[k]});
  o[ks[ks.length-1]]=v;stamp(p);if(p.charAt(0)==="d")calNote(p,v);
}
function addItem(coll,item){item.id=uid();item._u=Date.now();st[coll].push(item);return item}
function delItem(coll,i){const it=st[coll][i];if(!it)return;st.del[it.id]=Date.now();st[coll].splice(i,1)}

/* ---------- merge (so two devices never clobber each other) ---------- */
function mergeState(a,b){
  const out=JSON.parse(JSON.stringify(a));
  ["days","weeks","months"].forEach(c=>{
    Object.keys(b[c]||{}).forEach(k=>{const x=out[c][k],y=b[c][k];if(!x||(y._u||0)>(x._u||0))out[c][k]=y});
  });
  out.del=Object.assign({},b.del||{},out.del||{});
  Object.keys(b.del||{}).forEach(id=>{out.del[id]=Math.max(out.del[id]||0,b.del[id]||0)});
  ["weights","jobs","savings","periods"].forEach(c=>{
    const map={};
    [...(out[c]||[]),...(b[c]||[])].forEach(it=>{const cur=map[it.id];if(!cur||(it._u||0)>(cur._u||0))map[it.id]=it});
    out[c]=Object.values(map).filter(it=>!(out.del[it.id]&&out.del[it.id]>=(it._u||0)));
    out[c].sort((x,y)=>String(x.d||x.s||"").localeCompare(String(y.d||y.s||""))||x.id.localeCompare(y.id));
  });
  ["settings","checks","notes"].forEach(s=>{
    if((b.su&&b.su[s]||0)>(out.su[s]||0)){out[s]=b[s];out.su[s]=b.su[s]}
  });
  return out;
}

/* ---------- Google Drive sync (Apps Script web app) ---------- */
let syncMsg="";
function setSyncState(s,msg){
  syncMsg=msg||"";
  document.documentElement.classList.toggle("syncing",s==="busy");document.querySelectorAll(".syncdot").forEach(e=>{e.classList.remove("ok","busy","err","pending");if(s)e.classList.add(s)});
  document.querySelectorAll(".syncstat").forEach(e=>{
    e.textContent=s==="pending"?"unsynced changes":s==="busy"?"syncing…":s==="err"?"sync problem":s==="ok"?"synced "+new Date(LS.lastSync).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):(LS.syncUrl?"not synced yet":"sync off");
    e.title=msg||"";
  });
}
async function syncNow(manual){
  if(!LS.syncUrl){if(manual)toast("Add your sync URL in Settings first");return false}
  if(syncing)return false;
  syncing=true;setSyncState("busy");
  try{
    const sep=LS.syncUrl.includes("?")?"&":"?";
    const r=await fetch(LS.syncUrl+sep+"t="+encodeURIComponent(LS.token||"")+"&_="+Date.now(),{cache:"no-store"});
    const txt=await r.text();let remote=null;
    try{remote=JSON.parse(txt)}catch(e){throw new Error("The sync URL didn't return data. Check the URL, and that the web app is shared with “Anyone”.")}
    if(remote&&remote.error)throw new Error(remote.error);
    let changed=false;
    if(remote&&remote.settings){const before=JSON.stringify(st);st=normalize(mergeState(st,normalize(remote)));changed=JSON.stringify(st)!==before}
    try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}
    const body=JSON.stringify({token:LS.token||"",data:st});
    try{
      const pr=await fetch(LS.syncUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body});
      const j=await pr.json().catch(()=>null);
      if(j&&j.error)throw new Error(j.error);
    }catch(e){
      if(e instanceof TypeError)await fetch(LS.syncUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body});
      else throw e;
    }
    LS.lastSync=Date.now();dirty=false;persistLocal();setSyncState("ok");
    if(manual)toast("synced with Google Drive");
    if(changed&&typeof afterRemoteChange==="function")afterRemoteChange();
    return true;
  }catch(e){setSyncState("err",e.message);if(manual)toast(e.message||"sync failed");return false}
  finally{syncing=false}
}

/* ---------- per-day stats ---------- */
const nums=a=>a.filter(x=>Number.isFinite(x));
const avg=a=>{a=nums(a);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
const r1=n=>n==null?"–":(Math.round(n*10)/10).toString();
const r0=n=>n==null?"–":Math.round(n).toLocaleString();
function dayStats(k){
  const d=st.days[k]||{};
  const rit=Object.values(d.rit||{}).filter(Boolean).length;
  const meals=d.meals||{};
  const kcal=Object.values(meals).reduce((a,m)=>a+(+m.k||0),0);
  const mealsLogged=Object.values(meals).some(m=>(m.t||"").trim()||+m.k);
  const o={d,rit,done:!!d.done||rit>=3,water:+d.water||0,steps:+d.steps||0,sleep:+d.sleep||0,mood:+d.mood||0,energy:+d.energy||0,kcal,mealsLogged,flow:d.flow||"",weed:d.weed||"",win:d.win||""};
  o.has=!!(rit||o.water||o.steps||o.sleep||o.mood||o.energy||mealsLogged||d.journal||d.win||d.grat||d.flow||d.done||d.weed||d.wake||d.bed);
  return o;
}
const loggedDays=()=>Object.keys(st.days).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)&&dayStats(k).has).sort();
const stepGoalFor=k=>+st.settings.stepGoal||STEP_GOALS[k.slice(0,7)]||(k<"2026-11"?3000:10000);
const monthOf=k=>{const id=k.slice(0,7);return M.find(m=>m.id===id)||null};
const monthNear=k=>monthOf(k)||(k.slice(0,7)<M[0].id?M[0]:M[M.length-1]);

/* ---------- weight ---------- */
const weightsSorted=()=>[...st.weights].sort((a,b)=>a.d.localeCompare(b.d));
const startW=()=>{const v=parseFloat(st.settings.startW);if(isFinite(v))return v;const w=weightsSorted()[0];return w?+w.w:null};
function weekWeight(k){const wk=isoWeek(k);return st.weights.find(w=>w.wk===wk)||null}
function upsertWeight(d,w){
  const wk=isoWeek(d),ex=st.weights.find(x=>x.wk===wk);
  if(ex){ex.d=d;ex.w=w;ex._u=Date.now()}else addItem("weights",{d,w,wk});
  if(!st.settings.startW){st.settings.startW=w;st.su.settings=Date.now()}
}

/* ---------- cycle ---------- */
const sortedP=()=>[...st.periods].sort((a,b)=>a.s.localeCompare(b.s));
function cycleLen(){
  const ps=sortedP(),ds=[];
  for(let i=1;i<ps.length;i++){const n=daysBetween(ps[i-1].s,ps[i].s);if(n>=18&&n<=50)ds.push(n)}
  const rec=ds.slice(-6);
  return rec.length?Math.round(rec.reduce((a,b)=>a+b,0)/rec.length):(+st.settings.cycleLen||28);
}
function periodLen(){
  const ds=sortedP().filter(p=>p.e).map(p=>daysBetween(p.s,p.e)+1).filter(n=>n>=1&&n<=12).slice(-6);
  return ds.length?Math.round(ds.reduce((a,b)=>a+b,0)/ds.length):(+st.settings.periodLen||5);
}
function cycleInfo(k){
  if(st.settings.trackCycle===false)return null;
  const ps=sortedP();
  if(!ps.length||k<ps[0].s)return null;
  const len=cycleLen(),pl=periodLen();
  let last=null;for(const p of ps){if(p.s<=k)last=p;else break}
  const isLast=last===ps[ps.length-1];
  let day=daysBetween(last.s,k)+1,wrapped=false;
  if(isLast&&day>len){day=((day-1)%len)+1;wrapped=true}
  const plEff=last.e?daysBetween(last.s,last.e)+1:pl;
  const ov=len-14;
  const ph=day<=plEff?"menstrual":day<ov-1?"follicular":day<=ov+1?"ovulatory":"luteal";
  return{day,len,ph,pred:wrapped||k>todayKey(),overdue:isLast&&daysBetween(last.s,todayKey())+1>len&&k===todayKey(),start:last.s};
}
function nextPeriod(){
  const ps=sortedP();if(!ps.length)return null;
  const len=cycleLen(),t=todayKey();let n=addDays(ps[ps.length-1].s,len);
  while(n<t)n=addDays(n,len);
  return n;
}
function periodOn(k){return sortedP().find(p=>p.s<=k&&(p.e?k<=p.e:daysBetween(p.s,k)<periodLen()))||null}

/* ---------- small ui helpers used by pages ---------- */
const B=p=>`data-k="${p}"`;
const txt=(p,ph="",cls="")=>`<input type="text" ${B(p)} value="${esc(gp(p))}" placeholder="${esc(ph)}" class="${cls}">`;
const area=(p,ph="",rows=4)=>`<textarea ${B(p)} rows="${rows}" placeholder="${esc(ph)}">${esc(gp(p))}</textarea>`;
const numIn=(p,ph="",extra="")=>`<input type="number" inputmode="decimal" ${B(p)} value="${esc(gp(p))}" placeholder="${esc(ph)}" ${extra}>`;
const chk=(p,l,s="",re=false)=>`<label class="ck"><input type="checkbox" ${B(p)} ${re?'data-re="1"':""} ${gp(p)?"checked":""}><span>${l}${s?`<small>${s}</small>`:""}</span></label>`;
const ul=a=>`<ul class="l">${a.map(x=>`<li>${x}</li>`).join("")}</ul>`;
const bar=(n,g)=>`<div class="bar"><i style="width:${g?Math.max(0,Math.min(100,n/g*100)):0}%"></i></div>`;

/* ---------- charts ---------- */
function chartLine(series,o={}){
  const W=640,H=o.h||190,L=36,R=10,T=10,Bm=22;
  const all=series.flatMap(s=>s.pts);
  if(!all.length)return `<p class="muted small" style="padding:18px 0">Nothing logged in this range yet.</p>`;
  let lo=Math.min(...all.map(p=>p.v)),hi=Math.max(...all.map(p=>p.v));
  if(o.zero)lo=Math.min(0,lo);
  if(o.goal!=null){lo=Math.min(lo,o.goal);hi=Math.max(hi,o.goal)}
  if(lo===hi){lo-=1;hi+=1}
  const pad=(hi-lo)*.08;if(!o.zero)lo-=pad;hi+=pad;
  const t0=Math.min(...all.map(p=>p.t)),t1=Math.max(...all.map(p=>p.t)),span=Math.max(t1-t0,864e5);
  const X=t=>L+(t-t0)/span*(W-L-R),Y=v=>T+(hi-v)/(hi-lo)*(H-T-Bm);
  let g="";
  for(let i=0;i<=3;i++){const v=lo+(hi-lo)*i/3;g+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".1"/><text x="2" y="${Y(v)+3}">${(hi-lo)<8?v.toFixed(1):Math.round(v).toLocaleString()}</text>`}
  for(let i=0;i<=3;i++){const t=t0+span*i/3;const d=new Date(t);g+=`<text x="${Math.min(W-34,Math.max(L-6,X(t)-14))}" y="${H-6}">${d.toLocaleDateString(undefined,{month:"short",day:"numeric"})}</text>`}
  if(o.goal!=null)g+=`<line x1="${L}" x2="${W-R}" y1="${Y(o.goal)}" y2="${Y(o.goal)}" stroke="var(--ok)" stroke-dasharray="4 4" opacity=".8"/>`;
  series.forEach(s=>{
    const pts=[...s.pts].sort((a,b)=>a.t-b.t);if(!pts.length)return;
    const c=s.c||"var(--accT)";
    g+=`<path d="${pts.map((p,i)=>(i?"L":"M")+X(p.t).toFixed(1)+" "+Y(p.v).toFixed(1)).join(" ")}" fill="none" stroke="${c}" stroke-width="2" ${s.dash?'stroke-dasharray="4 4" opacity=".55"':""} stroke-linejoin="round"/>`;
    if(!s.dash&&pts.length<=45)g+=pts.map(p=>`<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.6" fill="${c}"/>`).join("");
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.label||"chart")}" style="color:var(--text);display:block">${g}</svg>`;
}
const legend=s=>`<div class="legend">${s.map(x=>`<span style="--lc:${x.c||"var(--accT)"}">${esc(x.name)}</span>`).join("")}</div>`;

/* weight plan line (gentle pace) */
function planLine(){
  const sw=startW();if(!sw)return null;
  const goal=+st.settings.goal||80;
  return [{t:new Date(2027,0,1).getTime(),v:sw}].concat(M.filter(m=>m.id>="2027-01").map(m=>{const[y,mo]=m.id.split("-").map(Number);return{t:new Date(y,mo,0).getTime(),v:Math.round((sw-m.lost*(goal/80))*10)/10}}));
}

/* theme + house */
function applyLook(){
  let th=LS.theme;if(th==="auto"||!th)th=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
  document.documentElement.dataset.theme=th;document.documentElement.dataset.dense=LS.dense||"cozy";
  const h=HOUSES.find(x=>x[0]===LS.house)||HOUSES[0];
  document.documentElement.style.setProperty("--ah",h[2]);document.documentElement.style.setProperty("--as",h[3]+"%");
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=th==="dark"?"#16131a":"#ebe6df";
  document.querySelectorAll(".themeBtn").forEach(b=>b.innerHTML=th==="dark"?'<i class="ph ph-moon"></i>':'<i class="ph ph-sun"></i>');
}
function toast(t){const e=document.getElementById("toast");if(!e)return;e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2400)}

/* shrink an image file to a small data URL (used for the avatar only) */
function compressImg(file,max=160,q=.85){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      const sc=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*sc)),h=Math.max(1,Math.round(img.height*sc)),c=document.createElement("canvas");
      c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      let o=c.toDataURL("image/webp",q);if(!/^data:image\/webp/.test(o))o=c.toDataURL("image/png");res(o);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("unreadable image"))};
    img.src=url;
  });
}

/* ===== food ===== */
/* ============================================================
   north star — rough calorie estimator (offline, built-in food list)
   format:  names | aliases ; kcal per typical serving ; grams per serving ; grams per cup (optional)
   Estimates only. Edit this list freely.
   ============================================================ */
const FOOD_RAW=`
egg|eggs|boiled egg|fried egg|scrambled egg|poached egg;75;50
egg white|egg whites;17;33
omelette|omelet;190;120
bacon|bacon strip|bacon strips|bacon slice;45;12
sausage|breakfast sausage|sausage link;90;30
toast|bread|sourdough|slice of bread|rye;85;32
bagel;270;105
croissant;230;57
english muffin;130;57
pancake|pancakes;90;40
waffle|waffles;220;75
french toast;180;65
cereal;150;40;40
granola;220;50;100
oatmeal|porridge|oats|overnight oats;160;234;234
yogurt|greek yogurt|yoghurt;110;170;245
cottage cheese;110;113;226
milk|whole milk;150;244;244
skim milk|nonfat milk;85;245;245
oat milk;120;240;240
almond milk;40;240;240
soy milk;100;240;240
cream|heavy cream|half and half|creamer;50;30
butter;100;14
cream cheese;50;14
cheese|cheddar|mozzarella|swiss|gouda|brie|feta|goat cheese|parmesan;110;28
string cheese;80;28
apple;95;182
banana;105;118
orange;62;131
clementine|tangerine;35;74
grapes;100;150;151
strawberry|strawberries;50;150;152
blueberry|blueberries;85;148;148
raspberry|raspberries;65;123;123
blackberry|blackberries;62;144;144
pomegranate;230;282
pomegranate seeds|pomegranate arils|arils;140;174;174
fig|figs;37;50
dried fig|dried figs;21;8
mango;200;336
peach|nectarine;60;150
pear;100;178
plum;30;66
cherries|cherry;100;154;154
watermelon;45;150;152
pineapple;80;165;165
kiwi;42;69
avocado;240;150
lemon|lime;17;58
date|dates|medjool date;66;24
raisins;130;40;145
salad|green salad|side salad;45;100
caesar salad;190;150
spinach;7;30;30
kale;33;67;67
broccoli;31;91;91
carrot|carrots;25;61
cucumber;16;100
tomato|tomatoes;22;123
bell pepper|pepper;30;119
onion;44;110
mushroom|mushrooms;15;70;70
zucchini;33;196
cauliflower;27;107;107
sweet potato;115;130
potato|baked potato;160;173
mashed potatoes|mashed potato;210;210;210
french fries|fries;365;117
chips|potato chips|crisps;150;28
corn;130;90
peas;60;80;80
green beans;35;110
asparagus;20;90
brussels sprouts;38;88
cabbage;22;89
beets|beet;35;82
eggplant|aubergine;35;82
roasted vegetables|veggies|vegetables|veg;80;150
rice|white rice|brown rice|basmati;205;158;158
fried rice;330;200
pasta|spaghetti|noodles|penne|macaroni;220;140;140
mac and cheese|mac & cheese;350;200
ramen;380;350
quinoa;220;185;185
couscous;175;157;157
tortilla|wrap;140;45
pita;165;60
naan;260;90
cracker|crackers;70;16
pretzel|pretzels;110;28
popcorn;95;25
rice cake;35;9
chicken|chicken breast|grilled chicken|roast chicken;165;100
chicken thigh;210;100
fried chicken;320;120
chicken nuggets|nuggets|nugget;45;18
turkey;135;85
beef|steak|sirloin;250;100
ground beef|hamburger meat;250;100
burger|hamburger|cheeseburger;550;230
hot dog;290;100
pork|pork chop;230;100
ham;100;85
salmon;235;113
tuna|canned tuna;130;100
shrimp|prawns;85;85
fish|white fish|cod;105;100
sardines;190;92
tofu;90;120
tempeh;160;84
beans|black beans|chickpeas|lentils|kidney beans;225;172;172
hummus;70;30
falafel;57;17
peanut butter|almond butter|nut butter;95;16
peanut butter and jelly|pb and j|pbj;380;100
nuts|almonds|walnuts|cashews|peanuts|pistachios;165;28
trail mix;175;30
seeds|pumpkin seeds|sunflower seeds|chia seeds;150;28
protein bar|granola bar|bar;200;60
protein shake|protein powder;120;30
pizza|pizza slice;285;107
sandwich;400;200
grilled cheese;400;130
burrito;550;250
taco|tacos;180;80
quesadilla;470;150
nachos;550;200
sushi|sushi roll|maki|roll;45;30
nigiri;55;40
sashimi;40;30
miso soup;40;240
soup|stew|chili;220;250;250
curry;350;300
pad thai;550;300
pho;450;500
lasagna;380;250
shawarma|gyro;550;250
kebab;300;150
tabbouleh|tabouleh;120;120
baba ganoush;45;30
dumplings|dumpling;45;25
spring roll|spring rolls;100;60
grain bowl|salad bowl|bowl;500;400
smoothie;220;350
acai bowl;380;300
edamame;120;155;155
seaweed|nori;10;5
kimchi;15;100
olives|olive;40;30
pickles|pickle;5;35
dark chocolate|chocolate;170;28
chocolate bar;230;43
cookie|cookies;150;40
brownie;230;60
cake|cake slice;350;100
cupcake;300;80
ice cream|gelato;140;66
donut|doughnut;260;70
candy|gummies;100;30
muffin;380;113
pastry|danish;300;80
pie|pie slice;320;125
water|sparkling water|seltzer|herbal tea|tisane|green tea|black tea|tea|black coffee|coffee|iced coffee|espresso|americano;3;240;240
matcha latte|chai latte|latte|flat white;170;350
cappuccino;120;240
matcha;5;250
hot chocolate;190;240
juice|orange juice|apple juice;110;240;240
soda|coke|cola;150;355
kombucha;60;240
beer;150;355
wine|red wine|white wine;125;150
cocktail;200;150
whiskey|vodka|gin|tequila|shot;100;44
olive oil|oil;120;14
mayo|mayonnaise;95;14
ketchup;20;17
dressing|ranch|vinaigrette;75;30
salsa;10;30
guacamole;45;30
honey|jam|jelly|maple syrup|syrup|sugar;55;18
soy sauce;10;15
`;
const FOODS=[],FOOD_NAMES=[];
FOOD_RAW.trim().split("\n").forEach(l=>{
  const [n,k,g,c]=l.split(";"),f={names:n.split("|"),k:+k,g:+g,c:+c||0};
  FOODS.push(f);f.names.forEach(x=>FOOD_NAMES.push({name:x,f}));
});
FOOD_NAMES.sort((a,b)=>b.name.length-a.name.length);

const NUMW={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twelve:12,dozen:12,half:.5,couple:2,few:3,some:1};
const FRAC={"½":.5,"¼":.25,"¾":.75,"⅓":.33,"⅔":.67};
const UNITS={cup:"cup",cups:"cup",c:"cup",tbsp:"tbsp",tablespoon:"tbsp",tablespoons:"tbsp",tsp:"tsp",teaspoon:"tsp",teaspoons:"tsp",oz:"oz",ounce:"oz",ounces:"oz",g:"g",gram:"g",grams:"g",ml:"ml",handful:"hand",handfuls:"hand",scoop:"scoop",scoops:"scoop",bowl:"bowl",bowls:"bowl",glass:"cup",glasses:"cup",can:"each",cans:"each",bottle:"each",slice:"each",slices:"each",piece:"each",pieces:"each",pcs:"each",pc:"each",serving:"each",servings:"each",roll:"each",rolls:"each",strip:"each",strips:"each",wedge:"each",wedges:"each",link:"each",links:"each",patty:"each",stick:"each",square:"each",squares:"each"};
const PROTECT=[["mac and cheese","mac_and_cheese"],["mac & cheese","mac_and_cheese"],["peanut butter and jelly","peanut_butter_and_jelly"],["pb and j","pbj"],["half and half","half_and_half"],["fish and chips","fish_chips"],["rice and beans","rice_beans"]];

function matchFood(txt){
  const t=" "+txt.replace(/_/g," ")+" ";
  for(const {name,f} of FOOD_NAMES){
    const re=new RegExp("(^|[^a-z])"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(e?s)?([^a-z]|$)");
    if(re.test(t))return f;
  }
  return null;
}
function parseQty(words){
  let q=null,i=0;
  const w=words[0];if(w===undefined)return{q:null,i:0};
  const m=w.match(/^(\d+(?:\.\d+)?)(?:x)?(?:\/(\d+))?$/);
  if(/^x\d+$/.test(w)){return{q:+w.slice(1),i:1}}
  if(m){q=m[2]?(+m[1])/(+m[2]):+m[1];i=1;
    if(words[1]&&/^\d+\/\d+$/.test(words[1])&&!m[2]){const [a,b]=words[1].split("/");q+=(+a)/(+b);i=2}
    return{q,i}}
  if(FRAC[w]!==undefined)return{q:FRAC[w],i:1};
  const mix=w.match(/^(\d+)([½¼¾⅓⅔])$/);if(mix)return{q:+mix[1]+FRAC[mix[2]],i:1};
  if(NUMW[w]!==undefined)return{q:NUMW[w],i:1};
  return{q:null,i:0};
}
function estimateItem(raw,isWith){
  let s=raw.toLowerCase().replace(/\(.*?\)/g," ").replace(/[^a-z0-9½¼¾⅓⅔.\/&\s-]/g," ").replace(/\s+/g," ").trim();
  if(!s)return null;
  s=s.replace(/^(of|a bit of|some)\s+/,"");
  let words=s.split(" "),size=1;
  const {q,i}=parseQty(words);let qty=q;words=words.slice(i);
  if(["small","mini"].includes(words[0])){size=.8;words.shift()}else if(["large","big","huge"].includes(words[0])){size=1.3;words.shift()}else if(words[0]==="medium"){words.shift()}
  let unit=null;
  if(words[0]&&UNITS[words[0]]){unit=UNITS[words[0]];words.shift()}
  if(words[0]==="of")words.shift();
  const food=matchFood(words.join(" "))||matchFood(s);
  if(!food)return{text:raw.trim(),k:0,unknown:true};
  const cupG=food.c||(food.g>=100?food.g:150),perG=food.k/food.g;
  let n=qty==null?1:qty,k;
  switch(unit){
   case"g":k=perG*n;break;
   case"oz":k=perG*n*28.35;break;
   case"ml":k=perG*n*(cupG/240);break;
   case"cup":k=perG*cupG*n;break;
   case"tbsp":k=perG*cupG*n/16;break;
   case"tsp":k=perG*cupG*n/48;break;
   case"hand":k=perG*30*n;break;
   case"scoop":k=food.c?perG*cupG*n/2:food.k*n;break;
   case"bowl":k=food.c?perG*cupG*1.25*n:food.k*n*1.3;break;
   default:k=food.k*n;
  }
  k*=size;
  if(isWith&&qty==null&&!unit&&food.c)k=perG*cupG/8;  /* a splash, not a cup */
  return{text:raw.trim(),k:Math.round(k),food:food.names[0]};
}
const _estCache=new Map();
function estimateMeal(text){
  text=(text||"").trim();
  if(!text)return{total:0,items:[],unknown:[]};
  if(_estCache.has(text))return _estCache.get(text);
  let t=text.toLowerCase();PROTECT.forEach(([a,b])=>{t=t.split(a).join(b)});
  const parts=t.split(/[,;\n+&]|\band\b|\bplus\b/);
  const items=[],unknown=[];
  parts.forEach(p=>{
    const sub=p.split(/\bwith\b/);
    sub.forEach((x,idx)=>{const r=estimateItem(x,idx>0);if(!r)return;if(r.unknown)unknown.push(r.text);else items.push(r)});
  });
  const total=Math.round(items.reduce((a,b)=>a+b.k,0)/5)*5;
  const out={total,items,unknown};
  _estCache.set(text,out);return out;
}

/* ===== pages ===== */
/* ============================================================
   north star — pages. ONE definition per page (no wrappers, no
   load-order tricks). Layout = a 12-column .board grid; cards
   declare their width with s3…s12 and the DOM order is the
   mobile reading order.
   ============================================================ */
const DATE_RE=/^\d{4}-\d\d-\d\d$/, MON_RE=/^\d{4}-\d\d$/;
const R=()=>{const h=location.hash.replace("#","").split("/");return{name:h[0]||"today",arg:h[1]||"",arg2:h[2]||""}};
const MOODS=["","low","meh","okay","good","bright"], ENERGY=["","drained","low","steady","good","charged"];
const SYMPTOMS=[["cramps","Cramps"],["headache","Headache"],["bloat","Bloated"],["tired","Tired"],["moody","Moody"],["cravings","Cravings"],["tender","Tender"],["acne","Breakouts"],["great","Great energy"],["migraine","Migraine"],["backache","Back ache"],["nausea","Nausea"],["insomnia","Couldn’t sleep"],["brainfog","Brain fog"],["anxiety","Anxious body"],["jointpain","Joint pain"],["musclesore","Sore muscles"],["dizzy","Dizzy"],["oversleep","Slept too much"],["palpitations","Racing heart"],["hotflush","Hot flushes"],["chills","Chills"],["sorethroat","Sore throat"],["congested","Congested"],["cough","Cough"],["allergy","Allergies"],["indigestion","Indigestion"],["constipated","Constipated"],["looseness","Upset tummy"],["lowappetite","No appetite"],["hungry","Always hungry"],["sweetcrave","Sweet cravings"],["saltycrave","Salty cravings"],["dryskin","Dry skin"],["oilyskin","Oily skin"],["hairfall","Hair shedding"],["swollen","Puffy"],["eyestrain","Eye strain"],["tmj","Jaw tension"],["tension","Tight shoulders"],["lowlibido","Low libido"],["highlibido","High libido"],["spotting","Spotting"],["ovpain","Ovulation pain"],["pms","PMS"],["weak","Weak"],["glow","Glowing"],["strong","Feeling strong"]];
const FLOWS=[["spot","Spotting"],["light","Light"],["med","Medium"],["heavy","Heavy"]];
const MEALS=[["b","Breakfast"],["l","Lunch"],["d","Dinner"],["s","Snacks"]];
let aq="",amo="",trRange=90,customOpen=false;

const head=(t,sub,acts="")=>`<div class="pgh"><div><h1>${t}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div><div class="acts">${acts}</div></div>`;
const chip=(t,on)=>`<span class="chip ${on?"on":""}">${t}</span>`;
const kpi=(t,v,sub)=>`<div class="kpi"><div class="k">${t}</div><div class="stat num">${v}</div><div class="small muted">${sub}</div></div>`;

const calHtml=t=>esc(t).replace(/\[([^\]]+)\]/g,'<i class="stage">[$1]</i>');
const starred=k=>{const d=st.days[k];if(!d)return false;try{const S=dayStats(k);return !!(S.done||S.rit>=3)}catch(e){return !!d.done}};
function starKeys(){const o={};Object.keys(st.days).forEach(k=>{if(DATE_RE.test(k)&&starred(k))o[k]=1});const ev=(st.notes&&st.notes.stars)||{};Object.keys(ev).forEach(k=>{if(DATE_RE.test(k))o[k]=1});return o}
function starStats(){
  const set=starKeys(),ks=Object.keys(set).sort(),today=todayKey();let best=0;
  if(ks.length){let r=0,m=0;for(let k=ks[0];k<=today;k=addDays(k,1)){if(set[k]){r++;m=0;if(r>best)best=r}else{m++;if(m>=2){r=0;m=0}}}}
  let run=0,miss=0,k=set[today]?today:addDays(today,-1);
  for(let i=0;i<4000;i++){if(set[k]){run++;miss=0}else{miss++;if(miss>=2)break}k=addDays(k,-1)}
  return{stars:ks.length,best,run}
}
function celebrate(dk,closed){
  if(!starred(dk))return;
  const had=gp(`notes/stars/${dk}`);let gap=0;
  if(!had){const prev=Object.keys(starKeys()).filter(k=>k<dk).sort().pop();gap=prev?daysBetween(prev,dk)-1:0;sp(`notes/stars/${dk}`,1);save()}
  const s=starStats();LS.cel=LS.cel||{};let msg=null;
  if(!had){
    if(CAL_RUNS.includes(s.run)&&!LS.cel["r"+s.run]){LS.cel["r"+s.run]=1;msg=CAL_RUN[s.run]}
    else if(CAL_STARS.includes(s.stars)&&!LS.cel["s"+s.stars]){LS.cel["s"+s.stars]=1;msg=CAL_STAR[s.stars]}
    else if(gap>=2)msg=CAL_BACK[s.stars%CAL_BACK.length];
  }
  if(!msg&&closed){const mo=+gp(`days/${dk}/mood`)||0;msg=(mo>0&&mo<=2)?"Read it. It’s in the drawer. Go and drink something warm, you’ve earned it.":CAL_CLOSE[s.stars%CAL_CLOSE.length]}
  if(msg){persistLocal();toast(msg)}
}
/* Calbert reads the room: first matching rule wins (priority order); lines are picked by day so they don't flicker */
function calLine(dk){
  const t=todayKey(),isT=dk===t,S=dayStats(dk),d=S.d,ci=cycleInfo(dk),pv=addDays(dk,-1),n=Math.floor(parse(dk)/864e5);
  const lg=loggedDays().filter(k=>k<dk),last=lg.pop(),gap=last?daysBetween(last,dk):0;
  const ws=weightsSorted(),wk=ws.filter(w=>w.d===dk).length&&ws.filter(w=>w.d<dk).pop();
  const jr=k=>Object.keys((st.days[k]||{})).some(x=>/^j_|^jfree$|^win$|^grat$/.test(x)&&st.days[k][x]);
  const ti=Math.max(0,TIERS.findIndex(x=>x[0]===(d.tier||"lantern"))),need=RIT.filter(r=>r.t<=ti).length;
  const P=dayStats(pv),h=new Date().getHours();
  const rules=[
    ["sleep",S.sleep>0&&S.sleep<6],
    ["steps",P.has&&P.steps>0&&P.steps<stepGoalFor(pv)],
    [ci&&ci.ph==="menstrual"?"mens":"hare",d.tier==="bonfire"],
    ["period",st.periods.some(p=>p.s===dk)||(ci&&ci.ph==="menstrual"&&ci.day===1)],
    ["errand",[0,1,2].some(i=>d["t3d"+i])],
    ["nojournal",isT&&!jr(dk)&&[1,2,3].every(i=>!jr(addDays(dk,-i)))&&lg.length>0],
    ["weighin",!!wk&&daysBetween(wk.d,dk)>=10],
    ["comeback",S.has&&gap>=10],
    ["rituals",S.rit>=need&&need>0],
    ["morning",isT&&h>=5&&h<12],
    ["afternoon",isT&&h>=12&&h<17],
    ["evening",isT&&h>=17&&h<24],
    ["witching",isT&&h<5]
  ];
  const ev=isT&&(st.notes||{}).calEv,mk={bonfire:ci&&ci.ph==="menstrual"?"mens":"hare"};
  let hit=null,salt=0;
  if(ev&&ev.d===dk){const key=mk[ev.k]||ev.k;hit=rules.find(r=>r[0]===key&&r[1]);if(hit)salt=Math.floor(ev.t/6e4)}
  if(!hit)hit=rules.find(r=>r[1]);
  if(!hit)return null;
  const pool=CAL_CTX[hit[0]];return pool[(n+salt)%pool.length];
}
const bk=ph=>ph==="Runway"?"The Thaw (Prologue)":"Book I · "+ph;

/* ---------- avatar (image store keeps transparency) ---------- */
function avatarHtml(cls=""){
  const a=st.settings.avatar,n=(st.settings.name||"").trim();
  const inner=a?`<img src="${a}" alt="">`:(n?esc(n[0].toUpperCase()):'<i class="ph-fill ph-sparkle"></i>');
  return `<div class="av ${cls}">${inner}</div>`;
}
async function setAvatar(file){
  try{sp("settings/avatar",await compressImg(file,160,.85));save();render();toast("avatar updated")}
  catch(e){toast("couldn’t read that image")}
}

/* ---------- the one card builder: id, title, icon, body ---------- */
const MUP=["today","week","month"],WS=[1,2,3,4,6],DWM={3:2,4:2,5:3,6:3,7:4,8:4,9:4,12:6}; 
const folded=id=>!!(LS.fold&&LS.fold[id]);
const LAY=pg=>{const l=(st.notes||{}).layout,p=l&&l[pg];return p&&typeof p==="object"?p:{o:[],w:{}}};
function mu(pg,arr){
  const L=LAY(pg),idOf=h=>(h.match(/data-id="([^"]+)"/)||[])[1],ix=id=>{const i=(L.o||[]).indexOf(id);return i<0?1e6:i};
  const s=arr.filter(Boolean).map((h,i)=>[h,i,idOf(h)]).sort((a,b)=>ix(a[2])-ix(b[2])||a[1]-b[1]).map(x=>x[0]);
  return `<div class="mu" data-page="${pg}">${s.join("")}</div>`;
}
function card(id,t,ic,body,o={}){
  const pg=R().name,inMu=MUP.includes(pg),m=(o.cls||"").match(/\bs(\d+)\b/),w=(LAY(pg).w||{})[id]||o.w||(m&&DWM[m[1]])||2;
  const lights=`<span class="lights"><button class="lt lt-fold" data-act="fold" data-id="${id}" data-g="–" aria-label="Collapse or expand" title="collapse"></button>${inMu?`<button class="lt lt-move" data-g="✥" aria-label="Drag to move" title="drag to move"></button><button class="lt lt-wide" data-act="wide" data-id="${id}" data-g="↔" aria-label="Change width" title="width"></button>`:""}</span>`;
  const sec=`<section class="card ${o.cls||""} ${folded(id)?"folded":""}" id="${id}"><div class="cbar">${lights}<h3><i class="ph ph-${ic}"></i>${t}${o.r!=null?`<span class="r">${o.r}</span>`:""}</h3></div><div class="cb">${body}</div></section>`;
  return inMu?`<div class="mi" data-id="${id}" style="--w:${w}">${sec}</div>`:sec;
}
const fld=(lbl,why,body)=>`<div class="rv"><div class="qq">${lbl}</div><div class="why">${calHtml(why)}</div>${body}</div>`;
const rng=d=>`${md(d[0])} – ${md(d[6])}`;

/* ---------- Today customisation ---------- */

const denseSeg=()=>`<div class="seg">${[["cozy","Cozy"],["compact","Compact"]].map(([v,l])=>`<button class="${(LS.dense||"cozy")===v?"on":""}" data-act="dense" data-v="${v}">${l}</button>`).join("")}</div>`;
const layoutCard=()=>`<div class="card"><h3><i class="ph ph-sliders-horizontal"></i>Layout</h3><label class="f" style="margin-top:0">Density</label>${denseSeg()}<p class="small muted" style="margin-top:8px">Drag cards by the middle light, change width with the right light, and collapse with the left. Focus mode is in the sidebar.</p><button class="btn sm" data-act="resetLayout" style="margin-top:8px">Reset layout</button></div>`;


/* ============================================================ TODAY */
function journalCard(dk,d){
  const dn=Math.floor(parse(dk)/864e5),P=PROMPTS[jtab]||PROMPTS.reflect,q=P[dn%P.length];
  const has=!!gp(`days/${dk}/jfree`);
  return card("journal","Journal","notebook",`
   <div class="jtabs">${JT.map(([k,l,i])=>`<button class="${jtab===k?"on":""}" data-act="jtab" data-v="${k}"><i class="ph ph-${i}"></i>${l}${gp(`days/${dk}/j_${k}`)?'<span class="d"></span>':""}</button>`).join("")}</div>
   <div class="prompt"><div><div class="q">${esc(q[0])}</div><div class="why">${calHtml(q[1]||"")}</div></div></div>
   ${rte(`days/${dk}/j_${jtab}`,"write until it’s out of your head…",250)}
   <details class="jfree" ${has?"open":""}><summary><span class="ml">Free write</span></summary>${rte(`days/${dk}/jfree`,"anything else…",110)}</details>
   <div class="trio"><div><label class="f" style="margin-top:0">One win</label>${txt(`days/${dk}/win`)}</div><div><label class="f" style="margin-top:0">Grateful for</label>${txt(`days/${dk}/grat`)}</div><div><label class="f" style="margin-top:0">Tomorrow’s first step</label>${txt(`days/${dk}/tomorrow`,"the very first physical action")}</div></div><label class="f">Reward I’m taking</label>${txt(`days/${dk}/reward`,"tea, bath, a chapter, a movie")}`,{cls:"s8 journal"});
}

function pToday(arg){
  const dk=DATE_RE.test(arg)?arg:todayKey(),isToday=dk===todayKey();
  const m=monthNear(dk),d=st.days[dk]||{},S=dayStats(dk);
  const tier=d.tier||"lantern",ti=Math.max(0,TIERS.findIndex(t=>t[0]===tier));
  const dayN=Math.floor((parse(dk)-new Date(parse(dk).getFullYear(),0,0))/864e5);
  const mantra=MANTRAS[dayN%MANTRAS.length];
  const rits=RIT.filter(r=>r.t<=ti),ss=starStats();
  const wg=+st.settings.waterGoal||8,sg=stepGoalFor(dk),calG=+st.settings.calGoal||0;
  const ci=cycleInfo(dk),muse=MUSES[museIdx(dk)];
  const hr=new Date().getHours(),greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening",nm=(st.settings.name||"").trim();

  /* guided steps */
  const steps=rits.map(r=>({k:"rit",id:r.id,t:r.l,s:r.s,done:!!gp(`days/${dk}/rit/${r.id}`)}));
  if(ti>=1)steps.push({k:"go",t:"Log what you ate",s:"Awareness, not judgment.",done:S.mealsLogged,to:"meals"});
  steps.push({k:"go",t:"Check in: energy and mood",s:"Two taps.",done:!!(S.mood&&S.energy),to:"body"});
  if(ti>=1){steps.push({k:"go",t:"Write one win",s:"Small counts.",done:!!d.win,to:"journal"});steps.push({k:"go",t:"Name tomorrow’s first step",s:"The very first physical action.",done:!!d.tomorrow,to:"journal"})}
  steps.push({k:"close",t:"Close the day",s:"Seal it and I’ll put it in the drawer.",done:!!d.done});
  const next=steps.find(x=>!x.done),doneN=steps.filter(x=>x.done).length,pct=Math.round(doneN/steps.length*100);
  const nowBtn=!next?(d.done?`<button class="btn" data-act="markDone">Reopen the day</button>`:""):next.k==="rit"?`<button class="btn solid" data-act="tick" data-id="${next.id}">Done ✓</button>`:next.k==="close"?`<button class="btn solid" data-act="markDone">Close the day</button>`:`<button class="btn solid" data-act="goto" data-t="${next.to}">Go →</button>`;
  const g=(t,ic,txt)=>`<button data-act="goto" data-t="${t}"><i class="ph ph-${ic}"></i>${txt}</button>`;
  const glance=`<div class="glance">${g("body","drop",`${S.water}/${wg}`)}${g("body","footprints",S.steps.toLocaleString())}${g("body","smiley",MOODS[S.mood]||"mood?")}${g("meals","fork-knife",S.kcal?S.kcal.toLocaleString()+" kcal":"meals")}${g("journal","notebook",d.win||d.jfree||gp(`days/${dk}/j_${jtab}`)?"written":"write")}${g("now","star-four",ss.stars+" stars"+(ss.run>1?" · run "+ss.run:""))}</div>`;
  const nowCard=card("now","Next up","sun-horizon",`<div class="nc"><div class="t">${next?esc(next.t):"That’s the lot. Go and drink something warm."}</div><div class="muted small">${next?esc(next.s):esc(mantra)}</div><div class="nbtn">${nowBtn}</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div>${glance}`,{cls:"nowc glow s8",r:`${doneN}/${steps.length}`});
  const lightCard=card("light","Choose your familiar","butterfly",`<div class="light">${TIERS.map(t=>`<label><input type="radio" name="tier" ${B(`days/${dk}/tier`)} value="${t[0]}" data-re="1" ${tier===t[0]?"checked":""}>${t[1]}</label>`).join("")}</div><div class="tierhint">${esc(TIERS[ti][2])}</div><p class="mantra it">${esc(mantra)}</p>`,{cls:"s4"});

  const ritCard=card("rituals","Rituals","flame",`${GROUPS.map(g=>{const rs=rits.filter(r=>r.g===g[0]);if(!rs.length)return"";const n=rs.filter(r=>gp(`days/${dk}/rit/${r.id}`)).length;return`<div class="grp"><h4>${g[1]}<span class="small muted" style="font-family:var(--sans);font-style:normal">${n}/${rs.length}</span></h4>${rs.map(r=>chk(`days/${dk}/rit/${r.id}`,r.l,r.s,true)).join("")}</div>`}).join("")}<div class="note" style="margin-top:12px">Never zero twice. Three rituals ticked earns a star.</div>`,{cls:"s4",r:`${steps.filter(x=>x.k==="rit"&&x.done).length} of ${rits.length}`});

  const needleCard=card("needle","Errands for the Lady","compass",["Weight","Car","Job"].map((n,i)=>`<div style="margin-bottom:12px"><div class="small muted" style="margin-bottom:4px"><b>${n}</b> · ${esc(m.f[i])}</div><div class="inl"><input type="checkbox" ${B(`days/${dk}/t3d${i}`)} ${gp(`days/${dk}/t3d${i}`)?"checked":""} aria-label="${n} done">${txt(`days/${dk}/t3/${i}`,"Smallest next step?")}</div></div>`).join(""),{r:esc(m.lbl)});

  const mealsCard=card("meals","Meals","fork-knife",`${MEALS.map(([id,l])=>{const t=gp(`days/${dk}/meals/${id}/t`)||"",e=estimateMeal(t);return `<div class="meal2"><div class="mh"><span><i class="ph ph-${{b:"coffee",l:"bowl-food",d:"cooking-pot",s:"cookie"}[id]||"fork-knife"}"></i>${l}</span><span class="est" id="est_${id}">${e.total?"≈ "+e.total+" kcal":""}</span></div><textarea data-meal="${id}" rows="2" placeholder="e.g. 2 eggs, toast with butter, large oat latte">${esc(t)}</textarea><div class="mf"><span id="unk_${id}" class="unk">${e.unknown.length?"couldn’t size: "+esc(e.unknown.join(", ")):""}</span><span style="margin-left:auto">override</span>${numIn(`days/${dk}/meals/${id}/k`,"kcal")}</div></div>`}).join("")}<p class="small muted" style="margin-top:8px">estimates are rough. awareness, not judgment.</p>`,{cls:"s4",r:`<span class="num" id="kcalTot">${S.kcal?S.kcal.toLocaleString()+" kcal":"–"}${calG?" / "+calG.toLocaleString():""}</span>`});

  const bodyCard=card("body","Body","heartbeat",`<div class="water">${Array.from({length:Math.max(wg,S.water)},(_,i)=>`<button class="${i<S.water?"on":""}" data-act="water" data-n="${i+1}" aria-label="${i+1} glasses"></button>`).join("")}</div>${bar(S.water,wg)}<div class="small muted num" style="margin-top:4px">${S.water} / ${wg} glasses</div><div class="row" style="margin-top:12px"><div><label class="f" style="margin-top:0">Steps · goal ${sg.toLocaleString()}</label>${numIn(`days/${dk}/steps`,"0")}<div id="stepsBar">${bar(S.steps,sg)}</div></div><div><label class="f" style="margin-top:0">Sleep (hours)</label>${numIn(`days/${dk}/sleep`,"0",'step=".5"')}<div id="sleepBar">${bar(S.sleep,8)}</div></div></div>${sleepTimes(dk,d)}<label class="f">Mood <span class="muted">${MOODS[S.mood]||""}</span></label>${faceRow("mood",S.mood,FACE,MOODS)}<label class="f">Energy <span class="muted">${ENERGY[S.energy]||""}</span></label>${faceRow("energy",S.energy,BATT,ENERGY)}${feelBody(dk)}${weedHtml(d)}${symBody(dk)}`,{cls:"s6"});

  /* cycle */
  let cycleCard="";
  const onP=periodOn(dk),pBtns=[];
  if(dk<=todayKey()){
    if(!onP)pBtns.push(`<button class="btn sm" data-act="periodStart" data-d="${dk}">Period started</button>`);
    if(onP&&!onP.e)pBtns.push(`<button class="btn sm" data-act="periodEnd" data-d="${dk}">Period ended</button>`);
    if(st.periods.find(p=>p.s===dk))pBtns.push(`<button class="btn sm ghost" data-act="periodUndo" data-d="${dk}">Undo start</button>`);
  }
  const symHtml=`<label class="f">Body</label><div class="chips">${SYMPTOMS.map(([k,l])=>`<button class="chip ${gp(`days/${dk}/sym/${k}`)?"on":""}" data-act="sym" data-s="${k}">${l}</button>`).join("")}</div>`;
  const flowHtml=(onP||d.flow)?`<label class="f">Flow</label><div class="chips">${FLOWS.map(([k,l])=>`<button class="chip ${d.flow===k?"on":""}" data-act="flow" data-f="${k}">${l}</button>`).join("")}</div>`:"";
  if(st.settings.trackCycle!==false){
    if(ci){
      const P=PHASES[ci.ph],tip=P.tips[(dayN+ci.day)%P.tips.length],nx=nextPeriod();
      cycleCard=card("cycle","Cycle","moon",`<div class="chips" style="margin-bottom:8px"><span class="chip phase" style="--ph:${P.hue}">${P.name} phase</span>${ci.overdue?`<span class="chip">period may be due</span>`:""}</div><p class="small muted" style="margin-bottom:8px">${esc(P.blurb)}</p><p class="tip">${esc(tip)}</p>${nx?`<p class="small muted" style="margin-top:8px">Next period around ${md(nx)} (${daysBetween(todayKey(),nx)} days).</p>`:""}<div class="chips" style="margin-top:10px">${pBtns.join("")}</div>${flowHtml}`,{cls:"tint",r:`day ${ci.day} of ~${ci.len}${ci.pred?" · est.":""}`});
    }else cycleCard=card("cycle","Cycle","moon",`<p class="small muted">Log the first day of your last period and the app will estimate your phase and offer a daily tip that fits.</p><div class="inl" style="margin-top:10px"><input type="date" id="pstart" value="${dk}" max="${todayKey()}"><button class="btn solid sm" data-act="periodAdd">Save</button></div><p class="small muted" style="margin-top:8px">Or turn cycle tracking off in Settings.</p>`,{cls:"tint"});
  }

  const museCard=card("muse","Muse of the day","star-four",`<div class="it" style="font-size:1.3rem;line-height:1.2">${esc(muse[0])}</div><div class="small muted" style="margin:2px 0 6px"><i>${esc(muse[1])}</i></div><p class="small">${esc(muse[2])}</p>`,{cls:"s4",r:"new every day"});
  const nav=`<button class="btn sm" data-act="go" data-h="#today/${addDays(dk,-1)}" aria-label="previous day">←</button>${isToday?"":`<button class="btn sm" data-act="go" data-h="#today">Today</button>`}<button class="btn sm" data-act="go" data-h="#today/${addDays(dk,1)}" aria-label="next day">→</button>`;
  const phChip=ci?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}">${PHASES[ci.ph].name}</span>`:"";
  const lineQ=calLine(dk)||LINES[Math.floor(parse(dk)/864e5)%LINES.length];
  if(isToday&&Array.isArray(st.notes.pins)&&st.notes.pins.length&&!dayPins(dk).length){sp(`days/${dk}/pins`,[{id:uid(),items:st.notes.pins}]);sp("notes/pins",[]);save()}
  const cards=[nowCard,lightCard,journalCard(dk,d),bodyCard,ritCard,mealsCard,needleCard,cycleCard,museCard,...pinsCards(dk)];
const tmEye=(isToday?"today":dk<todayKey()?"looking back":"looking ahead")+" · "+parse(dk).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}),
 tmH=isToday?`${greet}${nm?`, <em>${esc(nm)}</em>`:""}`:esc(short(dk)),
 tmChips=`${ci?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}"><i class="ph ph-moon"></i>${PHASES[ci.ph].name} · day ${ci.day}</span>`:""}<span class="chip"><i class="ph ph-star-four"></i>${ss.stars} star${ss.stars===1?"":"s"}${ss.run>1?" · run "+ss.run:""}</span><span class="chip"><i class="ph ph-flag"></i>${esc(m.ph)}</span>`;
return `<div class="tmast"><div class="tm-l"><div class="tm-top"><span class="tm-eye">${esc(tmEye)}</span><div class="tm-nav">${nav}</div></div><h1 class="tm-h">${tmH}</h1><div class="chips tm-chips">${tmChips}</div></div><div class="line"><img class="calmoth" src="calbert.png" alt="Calbert" title="Calbert"><span class="cl">${calHtml(lineQ||m.line)}</span></div></div>`+mu("today",cards);
}
function monthDone(mk){let n=0;Object.keys(st.days).forEach(k=>{if(k.startsWith(mk)&&dayStats(k).done)n++});return n}

/* ---- journal prompts, faces, rich-text editor ---- */
const FACE=["","smiley-sad","smiley-nervous","smiley-meh","smiley","smiley-wink"];
const BATT=["","battery-empty","battery-low","battery-medium","battery-high","battery-full"];
const JT=JBLOCKS.map(b=>[b[0],b[1],b[2].replace("ph-","")]);
let jtab=JT[0][0];
const scopeCss=css=>{
  css=String(css).replace(/\/\*[\s\S]*?\*\//g,"").replace(/@import[^;]*;?/gi,"").replace(/javascript:|expression\s*\(|behavior\s*:|-moz-binding/gi,"").replace(/position\s*:\s*fixed/gi,"position:absolute").replace(/url\(\s*(['"]?)(?!https:|data:image\/)[^)]*\)/gi,"none");
  const SC=[".rte",".rt-view"],walk=s=>{let out="",i=0;while(i<s.length){const o=s.indexOf("{",i);if(o<0)break;const sel=s.slice(i,o).trim();let d=1,j=o+1;while(j<s.length&&d){if(s[j]==="{")d++;else if(s[j]==="}")d--;j++}const body=s.slice(o+1,j-1);i=j;
    if(/^@(media|supports)/i.test(sel))out+=sel+"{"+walk(body)+"}";else if(sel[0]==="@")out+=sel+"{"+body+"}";
    else out+=sel.split(",").flatMap(x=>{x=x.trim();if(/^\.(rte|rt-view)(\s|$|[.:#\[])/.test(x))return[x];return /^(html|body|:root)$/i.test(x)?SC:SC.map(p=>p+" "+x)}).join(",")+"{"+body+"}"}return out};
  return walk(css);
};
const cleanStyle=v=>String(v).replace(/javascript:|expression\s*\(|behavior\s*:|-moz-binding/gi,"").replace(/position\s*:\s*fixed/gi,"").replace(/url\(\s*(['"]?)(?!https:|data:image\/)[^)]*\)/gi,"none");
const SAFE_ATTR=/^(href|src|data-img|data-done|class|style|target|rel|alt|title|referrerpolicy|loading|width|height|colspan|rowspan|align|start|open|color|face|size)$/;
const safeHtml=h=>{const d=new DOMParser().parseFromString(`<div>${h||""}</div>`,"text/html"),r=d.body.firstChild;r.querySelectorAll("script,iframe,object,embed,link,meta,base,form,frame,frameset,applet,noscript,template").forEach(n=>n.remove());r.querySelectorAll("style").forEach(n=>{n.textContent=scopeCss(n.textContent)});r.querySelectorAll("*").forEach(n=>{[...n.attributes].forEach(a=>{const k=a.name,v=a.value.trim();if(/^on/.test(k)||!SAFE_ATTR.test(k)||(k==="href"&&!/^(https?:|mailto:)/i.test(v))||(k==="src"&&!/^(data:image\/|https?:\/\/)/i.test(v)))n.removeAttribute(k);else if(k==="style")n.setAttribute("style",cleanStyle(a.value))});if(n.tagName==="A"){n.target="_blank";n.rel="noopener"}});return r.innerHTML};
const rte=(p,ph,min)=>`<div class="rtewrap">${rtbar()}<div class="rte" contenteditable="true" data-rte="${p}" data-ph="${esc(ph)}" style="min-height:${min||150}px">${safeHtml(gp(p))}</div></div>`;
function faceRow(f,v,ic,labels){return `<div class="faces">${[1,2,3,4,5].map(n=>`<button class="${v===n?"on":""}" data-act="rate" data-f="${f}" data-n="${n}" aria-label="${labels[n]}"><i class="ph${v===n?"-fill":""} ph-${ic[n]}"></i>${labels[n]}</button>`).join("")}</div>`}
const FEEL_G=[["bright",["calm","hopeful","proud","loved","energised","inspired","grateful","playful","confident","creative","content","focused","joyful","peaceful","excited","optimistic","motivated","relaxed","cozy","connected","safe","free","curious","romantic","nostalgic","silly","radiant","grounded"]],["soft",["tender","wistful","bittersweet","sentimental","sensitive","vulnerable","emotional","homesick","reflective","melancholy"]],["heavy",["anxious","stressed","overwhelmed","sad","lonely","numb","angry","ashamed","restless","irritable","tired","foggy","guilty","jealous","bored","hopeless","burnt out","panicky","insecure","frustrated","disappointed","empty","resentful","on edge","dread","unmotivated","touchy","withdrawn","scattered","drained"]]];
const FEEL_X=FEEL_G.flatMap(g=>g[1]);
const feelHtml=dk=>FEEL_G.map(([g,l])=>`<div class="feelg"><small>${g}</small><div class="feels">${l.map(f=>`<button class="chip ${gp(`days/${dk}/feel/${f}`)?"on":""}" data-act="feel" data-f="${f}">${f}</button>`).join("")}</div></div>`).join("");
/* pinned images belong to the day: each day has its own pin cards (empty tomorrow, kept in the archive) */
const dayPins=dk=>{const p=gp(`days/${dk}/pins`);return Array.isArray(p)?p:[]};
const pinView=()=>LS.pinX||(LS.pinX={});
function pinMut(dk,cid,fn){const cs=dayPins(dk).map(c=>c.id===cid?Object.assign({},c,{items:fn(c.items||[])}):c);if(!cs.some(c=>c.id===cid))cs.push({id:cid,items:fn([])});sp(`days/${dk}/pins`,cs);save();render()}
function pinsCards(dk){
  const cs=dayPins(dk),list=cs.length?cs:[{id:"p0",items:[]}];
  return list.map((c,ix)=>{
    const items=c.items||[],i=Math.min(pinView()[c.id]||0,Math.max(0,items.length-1)),p=items[i];
    const r=(list.length>1?`<button class="tx" data-act="pinCardDel" data-c="${c.id}">remove</button> `:"")+(ix===list.length-1?`<button class="tx" data-act="pinCardAdd">+ card</button>`:"");
    const body=!p?`<div class="inl pinadd"><input type="url" id="pinU_${c.id}" placeholder="image link (https://…)"><input type="text" id="pinC_${c.id}" placeholder="caption"><button class="btn solid sm" data-act="pinAdd" data-c="${c.id}">Pin</button></div><p class="small muted" style="margin-top:8px">paste a direct image link. it fills the whole card and stays with this day.</p>`
    :`<div class="pinfull"><img src="${esc(p.u)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('bad')">${p.c?`<span class="cap">${esc(p.c)}</span>`:""}<div class="pbtn">${items.length>1?`<button data-act="pinNext" data-c="${c.id}" aria-label="Next"><i class="ph ph-caret-right"></i></button>`:""}<button data-act="pinAddP" data-c="${c.id}" aria-label="Add"><i class="ph ph-plus"></i></button><button data-act="pinDel" data-c="${c.id}" data-id="${esc(p.id)}" aria-label="Unpin"><i class="ph ph-trash"></i></button></div><em class="pcount">${i+1}/${items.length}</em><div class="perr">couldn’t load that link. remove it and try the direct image URL.</div></div>`;
    return card(ix===0?"pins":"pins_"+c.id,"Pinned images","push-pin",body,{cls:"s4 pinc",r});
  });
}

/* ---- week helpers ---- */
function barsHtml(vals,labels,goal,fmt=r0){
  const mx=Math.max(goal||0,...vals,1);
  return `<div class="mini-bars">${vals.map((v,i)=>`<div title="${esc(labels[i])}: ${fmt(v)}"><i class="${goal&&v>=goal?"goal":""}" style="height:${v?Math.max(4,v/mx*100):2}%;${v?"":"opacity:.25"}"></i>${labels[i]}</div>`).join("")}</div>`;
}

/* ---- weekly R.E.P.O.R.T. + events helpers ---- */
const wkOf=k=>`weeks/${isoWeek(k)}`;
const REP=[["R","Reading","a photo of what you’re reading, or a line you loved from this month’s book","reading"],["E","Eating","a favourite meal, snack or coffee from the week","eating"],["P","Playing","a hobby, game, activity or event you took part in","playing"],["O","Obsessing","what you can’t stop thinking about, listening to or watching","obsessing"],["R","Recommending","a product, show, spot or tip to pass on or save for posterity","recommending"],["T","Treating","something special you did or bought to pamper yourself","treating"]];
const picSrc=v=>/^https?:/.test(v)?`<img src="${esc(v)}" alt="" referrerpolicy="no-referrer" loading="lazy">`:"";
/* ============================================================
   R.E.P.O.R.T. v2: paste over the old repHtml() in app.js,
   and DELETE the old repLink / repClr branches in the
   "weekly report / pins / events handlers" click listener.
   Data model is unchanged: weeks/<wk>/rep/<i>/i (image url) and /t (text).
   ============================================================ */
const repUI={}; /* key -> {mode:"url"|"write"|"edit", val, st:"load"|"fail"} (transient, never synced) */
const repKey=(w,i)=>`${w}/rep/${i}`;

function repCard(w,i,rc){
  const [,name,why]=REP[i],k=repKey(w,i),im=(gp(k+"/i")||"").trim(),tx=gp(k+"/t")||"";
  const hasI=/^https?:\/\//i.test(im),hasT=!!tx.trim(),ui=repUI[k]||{},num=p2(i+1);
  const edit=(hasI||hasT)&&ui.mode!=="url";
  const head=`<header class="rh"><span class="rl">${name}</span><span class="rn">${num}</span>${edit?`<button class="rbtn" data-act="repEdit" data-r="${esc(k)}" aria-label="Edit ${name}" title="Edit"><i class="ph ph-pencil-simple"></i></button>`:""}</header>`;
  const tray=ui.mode==="edit"?`<div class="rtray"><button class="btn sm ghost" data-act="repOpen" data-m="url" data-r="${esc(k)}"><i class="ph ph-link"></i>${hasI?"change":"add"} image link</button>${hasI?`<button class="btn sm ghost" data-act="repRmImg" data-r="${esc(k)}"><i class="ph ph-x"></i>remove image</button>`:""}${hasT?`<button class="btn sm ghost" data-act="repClrTxt" data-r="${esc(k)}"><i class="ph ph-trash"></i>clear text</button>`:""}<button class="btn sm ghost" data-act="repDone" data-r="${esc(k)}">done</button></div>`:"";
  const cap=(ph,extra="")=>`<textarea class="rcap" ${B(k+"/t")} data-grow rows="2" placeholder="${esc(ph)}" ${extra}>${esc(tx)}</textarea>`;
  let body,kind;
  if(ui.mode==="url"){
    const v=ui.val!=null?ui.val:im;kind="form";
    const prev=ui.st==="load"?`<div class="rslot sk" aria-label="loading image"></div>`:ui.st==="fail"?`<div class="rslot rfail"><b>couldn’t load that link</b><span>Check it’s a direct image URL. It’s still below to edit.</span></div>`:"";
    body=`${prev}<div class="rform"><label class="f" style="margin-top:0">Image link</label><input type="url" data-repurl="${esc(k)}" value="${esc(v)}" placeholder="https://…" data-autofocus><div class="chips" style="margin-top:8px"><button class="btn solid sm" data-act="repUrlSave" data-r="${esc(k)}">${ui.st==="load"?"Checking…":"Save"}</button><button class="btn sm ghost" data-act="repUrlCancel" data-r="${esc(k)}">Cancel</button>${hasI?`<button class="btn sm ghost" data-act="repRmImg" data-r="${esc(k)}">Remove image</button>`:""}</div></div>`;
  }else if(hasI){
    kind="img";
    body=`<button class="rslot rmedia" data-act="repZoom" data-r="${esc(k)}" data-u="${esc(im)}" data-c="${esc(tx.replace(/<[^>]*>/g,""))}" aria-label="Open ${name} image full size"><img src="${esc(im)}" alt="" referrerpolicy="no-referrer" loading="lazy" onload="this.parentNode.classList.add('ld')" onerror="this.parentNode.classList.add('bad')"><span class="rerr"><b>couldn’t load</b><small>tap to fix the link</small></span></button>${cap(why)}`;
  }else if(hasT||ui.mode==="write"){
    kind="q";
    body=`<div class="rslot rquote"><textarea ${B(k+"/t")} data-grow rows="2" placeholder="${esc(why)}" ${ui.mode==="write"?"data-autofocus":""}>${esc(tx)}</textarea></div>`;
  }else{
    kind="empty";
    body=`<div class="rempty"><p>${esc(why)}</p>${i===0&&rc&&rc.fic?`<small>this month: ${esc(rc.fic)}</small>`:""}<div class="racts"><button class="btn sm ghost" data-act="repOpen" data-m="url" data-r="${esc(k)}"><i class="ph ph-plus"></i>image link</button><button class="btn sm ghost" data-act="repOpen" data-m="write" data-r="${esc(k)}"><i class="ph ph-plus"></i>write</button></div></div>`;
  }
  return `<article class="rcard k-${kind}">${head}${tray}<div class="rbody">${body}</div></article>`;
}
function repHtml(w,mid){
  const rc=RECS[mid];
  return card("report","Weekly R.E.P.O.R.T.","newspaper",`<div class="repwrap"><div class="rep3">${REP.map((_,i)=>`<div class="rc ${(gp(repKey(w,i)+"/t")||"").length>240?"wide":""}">${repCard(w,i,rc)}</div>`).join("")}</div></div>`,{cls:"s12",r:"the week in six snapshots"});
}

/* call this at the END of render() */
const FS=!!(window.CSS&&CSS.supports&&CSS.supports("field-sizing","content"));
function fitTa(t){t.style.height="auto";if(!FS)t.style.height=t.scrollHeight+"px";else t.style.height=""}
window.addEventListener("resize",()=>{clearTimeout(window._rg);window._rg=setTimeout(repGrow,120)});
function repGrow(){
  document.querySelectorAll(".rcard textarea[data-grow]").forEach(fitTa);
  const f=document.querySelector(".rcard [data-autofocus]");
  if(f){f.removeAttribute("data-autofocus");f.focus({preventScroll:true})}
}
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.matches&&t.matches(".rcard textarea[data-grow]")){const rcc=t.closest(".rc");if(rcc)rcc.classList.toggle("wide",t.value.length>240);fitTa(t);if(window.muRefresh)muRefresh()}
});

function repZoom(u,c){
  const lb=document.createElement("div");lb.className="lightbox";lb.setAttribute("role","dialog");
  lb.innerHTML=`<figure><img src="${esc(u)}" alt="" referrerpolicy="no-referrer">${c?`<figcaption>${esc(c)}</figcaption>`:""}</figure>`;
  const close=()=>{lb.remove();document.removeEventListener("keydown",onK)},onK=ev=>{if(ev.key==="Escape")close()};
  lb.onclick=close;document.addEventListener("keydown",onK);document.body.appendChild(lb);
}
function repUrlSave(k,root){
  const inp=root.querySelector("input[data-repurl]"),u=(inp.value||"").trim();
  if(!/^https?:\/\//i.test(u)){repUI[k]={mode:"url",val:u,st:"fail"};return render()}
  repUI[k]={mode:"url",val:u,st:"load"};render();
  const img=new Image();img.referrerPolicy="no-referrer";
  img.onload=()=>{sp(k+"/i",u);save();delete repUI[k];render()};
  img.onerror=()=>{repUI[k]={mode:"url",val:u,st:"fail"};render()};
  img.src=u;
}
document.addEventListener("click",e=>{
  const b=e.target.closest('[data-act^="rep"]');if(!b)return;
  const a=b.dataset.act,k=b.dataset.r;
  if(a==="repOpen")repUI[k]={mode:b.dataset.m,val:null};
  else if(a==="repEdit")repUI[k]=repUI[k]&&repUI[k].mode==="edit"?undefined:{mode:"edit"};
  else if(a==="repDone"||a==="repUrlCancel")delete repUI[k];
  else if(a==="repRmImg"){sp(k+"/i","");save();delete repUI[k]}
  else if(a==="repClrTxt"){sp(k+"/t","");save();delete repUI[k]}
  else if(a==="repZoom"){if(b.classList.contains("bad"))repUI[k]={mode:"url",val:null};else return repZoom(b.dataset.u,b.dataset.c)}
  else if(a==="repUrlSave")return repUrlSave(k,b.closest(".rcard"));
  else return;
  if(repUI[k]===undefined)delete repUI[k];
  render();
});
document.addEventListener("keydown",e=>{
  const t=e.target;if(!t.matches||!t.matches("input[data-repurl]"))return;
  if(e.key==="Enter"){e.preventDefault();repUrlSave(t.dataset.repurl,t.closest(".rcard"))}
  else if(e.key==="Escape"){delete repUI[t.dataset.repurl];render()}
});
const evOf=id=>Array.isArray(gp(`months/${id}/ev`))?gp(`months/${id}/ev`):[];
const gcUrl=e=>`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.t)}&dates=${e.d.replace(/-/g,"")}/${addDays(e.d,1).replace(/-/g,"")}`;
const gcEmbed=()=>{const v=(st.settings.gcalEmbed||"").trim();if(!v)return"";const s=/^https?:/.test(v)?v:`https://calendar.google.com/calendar/embed?mode=AGENDA&src=${encodeURIComponent(v)}`;return /^https:\/\/calendar\.google\.com\//.test(s)?`<iframe class="gcal" src="${esc(s)}" loading="lazy"></iframe>`:""};

/* ============================================================ WEEK */


const todoOf=w=>Array.isArray(gp(w+"/todo"))?gp(w+"/todo"):[];
const PARTS=["rituals","water","steps","sleep","food","check-in","journal"],DN=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
function dayParts(k){const s=dayStats(k),d=s.d,wg=+st.settings.waterGoal||8,j=Object.keys(d).some(x=>/^j_|^jfree$|^win$|^grat$/.test(x)&&d[x]);
  return[s.rit>=3,s.water>=wg,s.steps>=stepGoalFor(k),s.sleep>=7,s.mealsLogged,!!(s.mood&&s.energy),!!j]}
function phaseAvg(ph){const L=loggedDays().filter(k=>{const c=cycleInfo(k);return c&&c.ph===ph}).map(dayStats);return insAvg(L)}

function pWeek(arg){
  const k=DATE_RE.test(arg)?arg:todayKey(),days=weekDays(k),wk=isoWeek(k),w=`weeks/${wk}`;wpW=w;
  const S=days.map(dayStats),L=["M","T","W","T","F","S","S"];
  const wg=+st.settings.waterGoal||8,sgs=days.map(stepGoalFor),logged=S.filter(s=>s.has);
  const aSteps=avg(S.filter(s=>s.steps).map(s=>s.steps)),aSleep=avg(S.filter(s=>s.sleep).map(s=>s.sleep)),aWater=avg(S.filter(s=>s.water).map(s=>s.water));
  const aMood=avg(S.filter(s=>s.mood).map(s=>s.mood)),aEn=avg(S.filter(s=>s.energy).map(s=>s.energy)),aKcal=avg(S.filter(s=>s.kcal).map(s=>s.kcal));
  const showed=S.filter(s=>s.done).length,wdc=S.filter(s=>s.weed==="y").length;
  const prev=weekDays(addDays(days[0],-7)),next=weekDays(addDays(days[0],7)),pw=`weeks/${isoWeek(prev[0])}`;
  const cur=monday(todayKey()),rel=days[0]===cur?"this week":days[0]<cur?"a past week":"an upcoming week";
  const strip=days.map((dk,i)=>{const s=S[i],ci=cycleInfo(dk),f=FACE[s.mood];return`<a class="day ${dk===todayKey()?"today":""}" href="#today/${dk}" ${ci?`style="background:hsl(${PHASES[ci.ph].hue} 40% 50%/.12)"`:""}><b>${L[i]}</b><div class="d num">${parse(dk).getDate()}</div><div class="face">${f?`<i class="ph-fill ph-${f}"></i>`:""}</div><div class="pips"><i class="pip ${s.done?"on":""}"></i><i class="pip ${s.water>=wg?"on":""}"></i><i class="pip ${s.steps>=sgs[i]?"on":""}"></i><i class="pip ${s.mealsLogged?"on":""}"></i></div></a>`}).join("");

  const sw=startW(),ww=weekWeight(k),ws=weightsSorted(),last=ws.length?ws[ws.length-1]:null,prevW=ww?ws.filter(x=>x.d<ww.d).pop():null,goal=+st.settings.goal||80;
  const defD=todayKey()>=days[0]&&todayKey()<=days[6]?todayKey():days[6];
  const wCard=card("wweigh","Weekly weigh-in","scales",`<div class="row"><div><label class="f" style="margin-top:0">Date</label><input type="date" id="wd" value="${ww?ww.d:defD}"></div><div><label class="f" style="margin-top:0">Weight (lbs)</label><input type="number" step=".1" inputmode="decimal" id="wv" value="${ww?ww.w:""}" placeholder="${last?last.w:""}"></div><button class="btn solid" data-act="saveWeight">${ww?"Update":"Log"}</button></div><p class="small muted" style="margin-top:10px">${ww?`This week: <b class="num">${ww.w}</b>${prevW?` · ${(ww.w-prevW.w)>0?"+":""}${r1(ww.w-prevW.w)} vs last weigh-in`:""}`:"Same day, same time, one number. The trend matters, not the day."}${sw&&last?` · Start ${sw} → now ${last.w} · ${r1(sw-last.w)} of ${goal} lost`:""}</p>`,{cls:"s4",r:wk});
  const statsCard=card("wstats","At a glance","chart-bar",`<div class="tiles">${kpi("Showed up",showed+"<small> / 7</small>",`${logged.length} days logged`)}${kpi("Avg steps",r0(aSteps),`goal ${r0(avg(sgs))}`)}${kpi("Avg sleep",r1(aSleep)+"<small> h</small>","per night")}${kpi("Avg water",r1(aWater)+"<small> gl</small>",`goal ${wg}`)}${kpi("Energy · mood",`${r1(aEn)} · ${r1(aMood)}`,"out of 5")}${kpi("Avg intake",aKcal?r0(aKcal)+"<small> kcal</small>":"–","days logged")}</div>`,{r:rel});
  const chartsCard=card("wcharts","Daily rhythm","chart-line",`<div class="minis"><div><h4>Steps</h4>${barsHtml(S.map(s=>s.steps),L,avg(sgs))}</div><div><h4>Water</h4>${barsHtml(S.map(s=>s.water),L,wg)}</div><div><h4>Sleep</h4>${barsHtml(S.map(s=>s.sleep),L,8,r1)}</div><div><h4>Mood · energy</h4>${barsHtml(S.map(s=>s.mood),L,0,r1)}${barsHtml(S.map(s=>s.energy),L,0,r1)}</div></div><div class="small muted" style="margin-top:8px">green = goal met</div>`,{cls:"s4"});
  const ppl=[["nw","Weight"],["nc","Car"],["nj","Job"],["adj","One adjustment"],["rw","Reward"]].filter(([x])=>gp(pw+"/"+x));
  const recapCard=card("wrecap","Last week’s plan","arrow-bend-up-left",`${ppl.length?`<ul class="l">${ppl.map(([x,l])=>`<li><b>${l}:</b> ${esc(gp(pw+"/"+x))}</li>`).join("")}</ul>`:`<p class="small muted">Nothing was planned during ${esc(rng(prev))}. Plan at the end of this week and it shows up here next time.</p>`}${gp(pw+"/slid")?`<div class="note" style="margin-top:10px"><b>What slid:</b> ${esc(gp(pw+"/slid"))}</div>`:""}`,{cls:"tint",r:esc(rng(prev))});
  
  const reviewCard=card("wreview","Look back at this week","notebook",`<div class="fields2">
   ${fld("Three wins","Three. Small ones count, and I take a dim view of anyone who says they had none. Wins are evidence you can use on a bad day.",[1,2,3].map(n=>txt(w+"/win"+n)).join('<div style="height:6px"></div>'))}
   ${fld("What slid, and what was underneath it?","Name the habit that dropped, then the real reason. The reason is nearly always smaller than the excuse.",rte(w+"/slid","be specific and kind…",90))}
   ${fld("What did my energy teach me?","Which days drained you, and what was in them? Patterns, not verdicts. [He peers at the calendar.] Tuesdays, probably.",rte(w+"/energy","patterns, not verdicts…",90))}
   ${fld("Shadow check","Where did you act against what you say you want? Not to punish anyone. I only want the pattern, and I’ll complain about the weather while you look.",rte(w+"/shadow","I said I wanted…, but I…",90))}
   ${fld("Evidence of my ideal self","One outfit, meal, choice or sentence. Collect it and I’ll file it in the drawer.",rte(w+"/ideal","my ideal self showed up when…",90))}</div>
  `,{cls:"s6",r:esc(rng(days))});
  const planCard=card("wplan","Plan next week","compass",`<div class="fields2">
   ${fld("One move each","The smallest action that still counts. Write it as a verb, I can’t abide a noun with ambitions.",`<label class="f" style="margin-top:0">Weight</label>${txt(w+"/nw")}<label class="f">Car</label>${txt(w+"/nc")}<label class="f">Job</label>${txt(w+"/nj")}`)}
   ${fld("One adjustment","If something slid, shrink it. Don’t add more, there’s no prize for a longer list.",txt(w+"/adj"))}
   ${fld("Protect and drop","One thing to guard, and one thing you’ll stop pretending you’ll do. The Lady has noticed the second one.",`${txt(w+"/protect","protect…")}<div style="height:6px"></div>${txt(w+"/drop","drop…")}`)}
   ${fld("Pleasure on purpose","Something to look forward to. I’m told this is allowed.",`${txt(w+"/movie","movie night pick")}<div style="height:6px"></div>${txt(w+"/adv","small adventure")}<div style="height:6px"></div>${txt(w+"/rw","reward for showing up")}`)}</div>`,{cls:"s6",r:esc(rng(next))});
  const nav=`<button class="btn sm" data-act="go" data-h="#week/${addDays(days[0],-7)}">←</button><button class="btn sm" data-act="go" data-h="#week">This week</button><button class="btn sm" data-act="go" data-h="#week/${addDays(days[0],7)}">→</button>`;
const td=todayKey(),P=days.map(dayParts),past=days.map(x=>x<=td),sc=P.map((p,i)=>past[i]?p.filter(Boolean).length/7:null),live=sc.filter(x=>x!=null),score=live.length?Math.round(avg(live)*100):0,ss=starStats();
let rn=0;const hot=S.map(s=>{rn=s.done?rn+1:0;return s.done&&rn>=3});
const strk=days.map((dk,i)=>`<span class="${S[i].done?"on":""} ${hot[i]?"hot":""}" title="${esc(short(dk))}"><i class="ph${S[i].done?"-fill":""} ph-${!past[i]?"circle-dashed":S[i].done?"flame":"moon"}"></i>${L[i]}</span>`).join("");
const verdict=!logged.length?"nothing logged yet. start tiny.":score>=80?"a good week. frame it.":score>=55?"steady. the road’s still there.":score>=30?"a Moth week. it counts in full.":"a quiet one. one small thing, then another.";
const lg=days.map((dk,i)=>({dk,i,n:P[i].filter(Boolean).length})).filter(x=>past[x.i]&&S[x.i].has);
const best=[...lg].sort((a,b)=>b.n-a.n||b.dk.localeCompare(a.dk))[0],worst=lg.length>1?[...lg].sort((a,b)=>a.n-b.n||a.dk.localeCompare(b.dk))[0]:null;
const wd=dk=>parse(dk).toLocaleDateString(undefined,{weekday:"long"}),lst=(x,v)=>PARTS.filter((_,j)=>!!P[x.i][j]===v).join(", ")||"none";
const hl=best?`<p class="small" style="margin-top:10px"><b>best</b> ${wd(best.dk)} · ${best.n}/7 <small class="muted">${lst(best,true)}</small>${worst?` <br><b>hardest</b> ${wd(worst.dk)} · ${worst.n}/7 <small class="muted">missed ${lst(worst,false)}. a data point, not a verdict.</small>`:""}</p>`:`<p class="small muted" style="margin-top:10px">log a couple of days and the best and hardest will show up here.</p>`;
const hero=card("whero","Week at a glance","sparkle",`<div class="whero"><div class="ring xl" style="--p:${score}"><b>${score}<small>score</small></b></div><div><div class="verdict">${verdict}</div><div class="streak">${strk}</div><div class="chips" style="margin-top:12px">${showed===7?chip('<i class="ph-fill ph-crown"></i> perfect week',1):""}${chip(showed+"/7 showed up",showed>=4)}${chip(r0(aSteps)+" avg steps")}${chip(r1(aSleep)+"h sleep")}${wdc?chip("🌿 "+wdc+" weed day"+(wdc===1?"":"s")):""}</div>${hl}</div><div class="run num">${ss.run}<small>day run${ss.run===1?"":"s"}</small><small style="margin-top:6px">best ${ss.best}</small></div></div>`,{cls:"glow s12",r:rel});
const tl=todoOf(w),tdn=tl.filter(x=>x.x).length,pv=todoOf(pw).filter(x=>!x.x);
const todoCard=card("wtodo","To-do this week","check-square",`${bar(tdn,tl.length)}<ul class="todo" style="margin-top:8px">${tl.map(x=>`<li class="${x.x?"done":""}"><input type="checkbox" data-act="todoTog" data-w="${w}" data-id="${esc(x.id)}" ${x.x?"checked":""} aria-label="done"><span>${esc(x.t)}</span>${x.d?`<small class="muted">${esc(DN[(parse(x.d).getDay()+6)%7])}</small>`:""}<button class="tx" data-act="todoDel" data-w="${w}" data-id="${esc(x.id)}">remove</button></li>`).join("")}</ul>
 <div class="inl"><input type="text" id="todoT" placeholder="add a task…"><select id="todoD" style="width:auto"><option value="">any day</option>${days.map(dk=>`<option value="${dk}">${esc(short(dk))}</option>`).join("")}</select><button class="btn solid sm" data-act="todoAdd" data-w="${w}">Add</button></div>${pv.length?`<button class="btn sm ghost" style="margin-top:8px" data-act="todoCarry" data-w="${w}" data-pw="${pw}">Carry over ${pv.length} from last week</button>`:""}`,{cls:"s6",r:`${tdn}/${tl.length}`});
return head("Week",`<span class="tag">${rel}</span>${esc(rng(days))}, ${parse(days[6]).getFullYear()}`,nav)+
 `<div class="wk">${strip}</div><div class="legend" style="margin:8px 0 14px"><span style="--lc:var(--acc)">dots: rituals · water · steps · food logged</span></div>`+
 mu("week",[hero,todoCard,wCard,statsCard,chartsCard,recapCard,repHtml(w,days[0].slice(0,7)),...wpCards(w),reviewCard,planCard]);
}
/* ============================================================ MONTH */
function evCard(id){
  const L=evOf(id).slice().sort((a,b)=>a.d.localeCompare(b.d)),td=todayKey();
  return card("mevents","Events &amp; reminders","bell",`<div class="row"><div style="flex:0 0 150px"><input type="date" id="evD" value="${td.startsWith(id)?td:id+"-01"}"></div><div style="flex:2 1 160px"><input type="text" id="evT" placeholder="what’s happening?"></div><button class="btn solid sm" data-act="evAdd" data-m="${id}">Add</button></div>
   <div style="margin-top:8px">${L.length?L.map(e=>`<div class="ev ${e.d<td?"past":""}"><div class="dt"><b>${parse(e.d).getDate()}</b><small>${esc(short(e.d).split(" ")[0])}</small></div><div>${esc(e.t)}</div><div class="acts"><a class="btn sm ghost" href="${gcUrl(e)}" target="_blank" rel="noopener" title="Add to Google Calendar"><i class="ph ph-calendar-plus"></i></a><button class="btn sm ghost" data-act="evDel" data-m="${id}" data-id="${esc(e.id)}" aria-label="Delete"><i class="ph ph-trash"></i></button></div></div>`).join(""):`<p class="small muted">nothing yet. add appointments, deadlines, birthdays.</p>`}</div>
   <details style="margin-top:10px"><summary><span class="ml" style="font-size:.85rem">Show my Google Calendar</span></summary><div class="mbody"><input type="text" ${B("settings/gcalEmbed")} value="${esc(st.settings.gcalEmbed||"")}" data-re="1" placeholder="calendar email, or the embed link"><p class="small muted" style="margin-top:6px">Google Calendar → Settings → your calendar → “Integrate calendar” → paste the embed link. Only works for public calendars.</p>${gcEmbed()}</div></details>`,{cls:"s4",r:`<span class="num">${L.length}</span>`});
}
const stripH=h=>String(h||"").replace(/<[^>]*>/g," ").replace(/&nbsp;|&#8203;|\u200b/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
const JF=[["j_anchor","anchor"],["j_reflect","reflect"],["j_shadow","shadow"],["j_track","on track"],["jfree","free write"]];
function monthTexts(id,keys){
  const o=[],wk=[...new Set(keys.map(isoWeek))];
  keys.forEach(k=>{const d=st.days[k];if(!d)return;[...JF.map(x=>x[0]),"win","grat"].forEach(f=>d[f]&&o.push(["journal · "+md(k),d[f]]))});
  wk.forEach(x=>{const w=st.weeks[x];if(!w)return;["win1","win2","win3","slid","energy","shadow","ideal"].forEach(f=>w[f]&&o.push(["week review",w[f]]));Object.values(w.rep||{}).forEach(r=>r&&r.t&&o.push(["R.E.P.O.R.T.",r.t]));(w.pins||[]).forEach(p=>[p.b,p.i].filter(Boolean).forEach(t=>o.push(["week pin",t])))});
  const mo=st.months[id]||{};["taught","shadow","forward","note","intent"].forEach(f=>mo[f]&&o.push(["reflection",mo[f]]));
  return o;
}
function monthTitles(id){
  const r=RECS[id]||{},raw=[r.fic,r.non,...[].concat(r.film||[]),...[].concat(r.listen||[])].filter(Boolean),t=new Set();
  raw.forEach(s=>String(s).split(/ by | — |\(|\)/).forEach(x=>{x=x.trim();if(x.length>3&&!/^[\d\s]+$/.test(x))t.add(x.toLowerCase())}));return[...t];
}
function monthSnips(id,keys){
  const rx=monthTitles(id).map(x=>[x,new RegExp("(^|[^a-z0-9])"+rxEsc(x)+"(?=[^a-z0-9]|$)","i")]),seen=new Set(),res=[];
  monthTexts(id,keys).forEach(([src,h])=>paras(h).forEach(p=>{const m=rx.find(([,r])=>r.test(p));if(m&&!seen.has(p)){seen.add(p);res.push({s:p,src,t:m[0]})}}));
  return res.slice(0,8);
}
function pickDay(keys){
  const c=keys.filter(k=>{const d=st.days[k]||{};return stripH(JF.map(x=>d[x[0]]).join(" ")).length>20});
  return c.length?c[Math.floor((LS.rnd==null?.37:LS.rnd)*c.length)%c.length]:null;
}
function pMonth(arg){
  const id=MON_RE.test(arg)?arg:mkey(new Date()),m=M.find(x=>x.id===id),first=id+"-01",p=`months/${id}`;
  const nxt=addMonths(id,1),nDays=parse(addDays(nxt+"-01",-1)).getDate();
  const keys=Array.from({length:nDays},(_,i)=>id+"-"+p2(i+1)),S=keys.map(dayStats),wg=+st.settings.waterGoal||8;
  let start=monday(first);const cells=[];
  while(cells.length<42){cells.push(start);start=addDays(start,1)}
  if(cells.slice(35).every(k=>k.slice(0,7)!==id))cells.length=35;
  const cal=["M","T","W","T","F","S","S"].map(x=>`<div class="h">${x}</div>`).join("")+cells.map(k=>{
    const out=k.slice(0,7)!==id,s=dayStats(k),ci=cycleInfo(k),dots=(s.done?`<i></i>`:"")+(s.water>=wg?`<i class="w"></i>`:"")+(s.mealsLogged?`<i class="f"></i>`:"");
    return`<a class="c ${out?"out":""} ${k===todayKey()?"today":""} ${ci?"ph":""} ${ci&&ci.pred?"pred":""}" ${ci?`style="--ph:${PHASES[ci.ph].hue}"`:""} href="#today/${k}" aria-label="${short(k)}"><span class="n num">${parse(k).getDate()}</span><span class="m">${dots}</span></a>`}).join("");
  const calCard=card("mcal","Calendar","calendar-blank",`<div class="cal">${cal}</div><div class="legend"><span style="--lc:var(--acc)">showed up</span><span style="--lc:hsl(200 50% 55%)">water goal</span><span style="--lc:var(--warn)">food logged</span>${st.settings.trackCycle!==false?Object.values(PHASES).map(x=>`<span style="--lc:hsl(${x.hue} 40% 55%)">${x.name.toLowerCase()}</span>`).join(""):""}</div>`,{cls:"s7"});
  const done=S.filter(s=>s.done).length,logged=S.filter(s=>s.has).length,left=keys.filter(k=>k>=todayKey()).length,pct=Math.round(done/nDays*100);
  const topCard=card("mtop",esc(monthLabel(id)),"flag",`<div class="nc"><div class="t">${m?esc(bk(m.ph)):"This month"}</div><div class="muted small">${done} days showed up · ${logged} logged${left&&left<nDays?` · ${left} days left`:""}</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div>`,{cls:"nowc glow s4"});
  const ws=weightsSorted().filter(x=>x.d.startsWith(id)),wch=ws.length>1?ws[ws.length-1].w-ws[0].w:null;
  const aS=r0(avg(S.filter(s=>s.steps).map(s=>s.steps))),aSl=r1(avg(S.filter(s=>s.sleep).map(s=>s.sleep))),aW=r1(avg(S.filter(s=>s.water).map(s=>s.water))),aEn=r1(avg(S.filter(s=>s.energy).map(s=>s.energy))),aMo=r1(avg(S.filter(s=>s.mood).map(s=>s.mood)));
  const statsCard=card("mstats","The month in numbers","chart-bar",`<div class="tiles tiles6">${kpi("Showed up",done+"<small> / "+nDays+"</small>","days")}${kpi("Avg steps",aS,"logged days")}${kpi("Avg sleep",aSl+"<small> h</small>","logged nights")}${kpi("Avg water",aW+"<small> gl</small>",`goal ${wg}`)}${kpi("Energy · mood",`${aEn} · ${aMo}`,"out of 5")}${kpi("Weight",ws.length?ws[ws.length-1].w:"–",wch!=null?`${wch>0?"+":""}${r1(wch)} · ${ws.length} weigh-ins`:`${ws.length} weigh-in`)}</div>`,{cls:"s12"});
  const pl=planLine(),wsAll=weightsSorted(),series=[{name:"you",pts:wsAll.map(x=>({t:parse(x.d).getTime(),v:+x.w}))}];if(pl)series.push({name:"gentle pace",pts:pl,dash:1});
  const wCard=card("mweight","Weight vs gentle pace","chart-line-up",`${chartLine(series,{h:300,label:"weight over time"})}${legend(series.map((s,i)=>({name:s.name,c:i?"var(--t55)":"var(--accT)"})))}${startW()?"":`<p class="small muted">Log a weigh-in on the Week page to start the chart.</p>`}`,{cls:"s7"});
  let run=0,best=0;S.forEach(s=>{if(s.done){run++;best=Math.max(best,run)}else run=0});
  const stars=keys.filter(starred).length;
  let planCard="",msCard="",detCard="",bookCard="";
  if(m){
    const n=m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length;
    planCard=card("mplan",`${esc(bk(m.ph))} · ${esc(m.lbl)}`,"flag",`<p class="lede" style="margin-bottom:10px">${esc(m.line)}</p>${bar(n,m.ms.length)}<div class="focus3">${["Weight","Car","Job"].map((x,i)=>`<div><div class="small muted"><b>focus · ${x}</b></div><p class="small">${esc(m.f[i])}</p></div>`).join("")}</div>`,{cls:"s8",r:`<span class="num">${n}/${m.ms.length} quests</span>`});
    msCard=card("mmiles","Milestones","check-square",m.ms.map((x,i)=>chk(`months/${m.id}/ms/${i}`,esc(x),"",true)).join(""),{cls:"s4",r:m.lost?`pace −${m.lost} lbs`:"baseline"});
    detCard=card("mdetail","The month in detail","list-bullets",Object.entries(m.sec).map(([k,v],i)=>`<details ${i===0?"open":""}><summary><span class="ml" style="font-size:1.05rem">${k}</span></summary><div class="mbody">${ul(v.map(esc))}</div></details>`).join(""),{cls:"s6"});
  }else planCard=card("mplan","Plan","flag",`<p class="small muted">The written plan runs November 2026 – December 2027. Trackers and notes still work here.</p>`,{cls:"s8"});
  const rc=RECS[id];
  if(rc||m){const r=rc||{};bookCard=card("mbooks","Books · film · listen","books",`${[["book-open-text","Fiction",r.fic],["lightbulb","Nonfiction",r.non],["film-slate","Films",r.film],["headphones","Albums",r.listen]].filter(x=>x[2]).map(([i,k,v])=>`<div class="pick"><i class="ph ph-${i}"></i><div class="k">${k}</div><div class="v">${Array.isArray(v)?v.map(esc).join("<br>"):esc(v)}</div></div>`).join("")}${r.why?`<p class="small" style="margin-top:8px"><i>${esc(r.why)}</i></p>`:""}${m?`<ul class="l" style="margin-top:8px">${m.rw.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="note" style="margin-top:10px"><b>If this month slides:</b> ${esc(m.slip)}</div>`:""}`,{cls:"s5"})}
  const sn=monthSnips(id,keys);
  const snipCard=card("msnip","Echoes","quotes",sn.length?sn.map(x=>`<div class="snip"><small>${esc(x.src)} · ${esc(x.t)}</small>${hi(x.s,x.t)}</div>`).join(""):calb("Mention this month’s books, films or albums in your journal, REPORT or reflection and the whole paragraph turns up here."),{cls:"s6",r:`${sn.length}`});
  const rk=pickDay(keys),rd=rk?st.days[rk]:null;
  const randCard=card("mrandom","From the drawer","archive",rk?`<p class="small muted" style="margin-bottom:4px">${esc(pretty(rk))}</p>${JF.filter(f=>stripH(rd[f[0]])).map(([f,l])=>`<div class="rt-view"><b class="rtl">${l}</b>${safeHtml(rd[f])}</div>`).join("")}<a class="btn sm" href="#today/${rk}" style="margin-top:6px">Open that day →</a>`:calb("Write a journal entry this month and a random one will surface here."),{cls:"s6",r:rk?`<button class="tx" data-act="rnd">another</button>`:""});
  const mood=+gp(p+"/mood")||0,mo3=[0,1,2].map(i=>gp(p+"/mo/"+i)).filter(Boolean);
  const RS=[["intent","Intention","One sentence. How should this month feel?",txt(p+"/intent","this month I’m…")],["taught","What this month taught me","What would you tell yourself on the first? Plainly, without the apology.",rte(p+"/taught","write it out…",100)],["shadow","Shadow and growth","Which pattern turned up again, and what was different this time?",rte(p+"/shadow","the pattern was…",100)],["forward","Carrying forward","What comes with you, and what stays here? Pack light.",rte(p+"/forward","keep… / leave…",100)]];
  const reflect=card("mreflect","Month reflection","notebook",`<label class="f" style="margin-top:0">Mood of the month <span class="muted">${MOODS[mood]||""}</span></label><div class="mmood">${[1,2,3,4,5].map(n=>`<button class="chip ${mood===n?"on":""}" data-act="mmood" data-m="${id}" data-n="${n}"><i class="ph${mood===n?"-fill":""} ph-${FACE[n]}"></i>${MOODS[n]}</button>`).join("")}</div>
   <div class="rstep"><span class="no">i.</span><div class="qq">Top three moments</div><div class="why">The ones you’d keep if you could keep three.</div><div class="moments">${[0,1,2].map(i=>txt(`${p}/mo/${i}`,"a moment…")).join("")}</div></div>
   ${RS.map(([,t,w,h],i)=>`<div class="rstep"><span class="no">${["ii","iii","iv","v"][i]}.</span><div class="qq">${t}</div><div class="why">${w}</div>${h}</div>`).join("")}
   <div class="rstep"><span class="no">vi.</span><div class="qq">Notes</div><div class="why">Anything else. The drawer has room.</div>${area(p+"/note","What happened? What would make next month easier?",3)}</div>`,{cls:"s8",r:esc(monthLabel(id))});
  const prn=`<div id="prn" class="prn"><h1>${esc(monthLabel(id))}</h1><p>${m?esc(bk(m.ph))+" · "+esc(m.line):""}</p>
   <h2>the month in numbers</h2><div class="pg"><div><p>showed up: <b>${done}/${nDays}</b> · stars: <b>${stars}</b> · best run: <b>${best}</b><br>avg steps ${aS} · sleep ${aSl} h · water ${aW} · energy ${aEn} · mood ${aMo}<br>weight: ${ws.length?ws.map(x=>x.w).join(" → "):"–"}</p>${mood?`<p>mood of the month: ${MOODS[mood]}</p>`:""}${m?`<h2>milestones</h2>${m.ms.map((x,i)=>`<div>${gp(`months/${id}/ms/${i}`)?"☑":"☐"} ${esc(x)}</div>`).join("")}`:""}</div>
   <div><div class="hm" style="grid-template-columns:repeat(7,1fr)">${["M","T","W","T","F","S","S"].map(x=>`<span class="ch">${x}</span>`).join("")}${Array.from({length:(parse(first).getDay()+6)%7},()=>"<span></span>").join("")}${keys.map((k,i)=>`<i style="--v:${S[i].done?1:S[i].has?.35:0};font:700 7pt/26px var(--sans);text-align:center;font-style:normal;color:#16131a">${i+1}</i>`).join("")}</div></div></div>
   <h2>reflection</h2>${gp(p+"/intent")?`<p><b>intention:</b> ${esc(gp(p+"/intent"))}</p>`:""}${mo3.length?`<p><b>top moments:</b> ${mo3.map(esc).join(" · ")}</p>`:""}${["taught","shadow","forward"].filter(f=>stripH(gp(p+"/"+f))).map(f=>`<div class="ph"><b>${{taught:"taught me",shadow:"shadow and growth",forward:"carrying forward"}[f]}</b>${safeHtml(gp(p+"/"+f))}</div>`).join("")}${stripH(gp(p+"/note"))?`<p>${esc(gp(p+"/note"))}</p>`:""}
   ${sn.length?`<h2>echoes: books · films · albums</h2>${sn.slice(0,5).map(x=>`<div class="snip">${esc(x.s)} <small>${esc(x.src)}</small></div>`).join("")}`:""}
   ${rk?`<h2>from the drawer · ${esc(md(rk))}</h2>${JF.filter(f=>stripH(rd[f[0]])).map(([f,l])=>`<div class="ph"><b>${l}</b>${safeHtml(rd[f])}</div>`).join("")}`:""}</div>`;
  const nav=`<button class="btn sm" data-act="print"><i class="ph ph-printer"></i><span class="hide-m">Print review</span></button><button class="btn sm" data-act="go" data-h="#month/${addMonths(id,-1)}">←</button><button class="btn sm" data-act="go" data-h="#month">This month</button><button class="btn sm" data-act="go" data-h="#month/${addMonths(id,1)}">→</button>`;
  return head("Month",monthLabel(id)+(m?` · ${bk(m.ph)}`:""),nav).replace("<h1>",`<h1 class="ghost" data-ghost="${m?m.gh:"month"}">`)+
   mu("month",[topCard,planCard,calCard,msCard,statsCard,wCard,bookCard,snipCard,randCard,reflect,evCard(id),detCard])+prn;
}
/* ============================================================ PLAN (one router, one tab bar) */
const PLAN_TABS=[["roadmap","Roadmap"],["tracks","Tracks"],["toolkit","Toolkit"],["atelier","Atelier"],["syllabus","Syllabus"]];
const PLAN_SUB={roadmap:"the map, the quests, the why, the next step",tracks:"car, job, health and money",toolkit:"for the days that wobble. it lives by the lampshade",atelier:"the aesthetic you’re building",syllabus:"the four-year cultural syllabus"};
function pPlan(arg){
  const t=PLAN_TABS.some(x=>x[0]===arg)?arg:"roadmap";
  const tabs=`<div class="subtabs">${PLAN_TABS.map(([k,l])=>`<button class="${t===k?"on":""}" data-act="go" data-h="#plan/${k}">${l}</button>`).join("")}</div>`;
  const body={roadmap:planRoadmap,tracks:planTracks,toolkit:planToolkit,atelier:planAtelier,syllabus:planSyllabus}[t]();
  return head("Plan",PLAN_SUB[t])+tabs+body;
}
function planRoadmap(){
  const now=monthNear(todayKey()),nowId=now.id,s0=parse("2026-11-01"),e0=parse("2027-12-31"),pct=Math.max(0,Math.min(100,Math.round((parse(todayKey())-s0)/(e0-s0)*100)));
  const done=m=>m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length,tot=M.reduce((a,m)=>a+m.ms.length,0),dn=M.reduce((a,m)=>a+done(m),0);
  const tl=M.map(m=>{const n=done(m);return `<a class="tile ${m.id===nowId?"cur":m.id<nowId?"past":""}" href="#month/${m.id}"><span class="k">${esc(bk(m.ph))}</span><b>${esc(m.lbl)}</b>${bar(n,m.ms.length)}<span class="n">${n}/${m.ms.length} quests${m.lost?` · −${m.lost} lbs`:""}</span><small>${esc(m.line)}</small></a>`}).join("");
  const qi=Math.floor(new Date().getMonth()/3);
  const qs=QUARTERS.map((q,i)=>`<div class="q ${i===qi&&todayKey()>="2027-01"?"cur":""}"><span class="k small muted">${q[0]} · ${q[1]}</span><div class="big">${q[2]}</div><p>${esc(q[3])}</p></div>`).join("");
  return `<div class="board">
   <section class="card tint s8"><div class="small muted" style="margin-bottom:6px">identity</div><p class="quote">“at my core, i am a maker of meaning. i am here to tell stories that matter, to end the harmful cycles before me, to break curses, and to be happy and joyful.”</p></section>
   <section class="card nowcard s4"><div class="nc"><div class="k">${esc(bk(now.ph))}</div><div class="t">${dn}/${tot}</div><div class="muted small">quests done</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div></section>
   ${card("proad","Roadmap","path",`<div class="tl">${tl}</div>`,{cls:"s12",r:"nov 2026 → dec 2027"})}
   ${card("pquarters","Quarters","map-trifold",`<div class="qs">${qs}</div>`,{cls:"s12"})}</div>`+planMap();
}
function planSyllabus(){
  const now=todayKey().slice(0,7);
  const ck=(id,k,l,ic)=>chk(`checks/syl/${id}_${k}`,`<i class="ph ph-${ic}"></i> ${esc(l)}`,"",true);
  const yrs=Object.keys(SYL_YEARS).map(y=>{
    const ms=SYL.filter(s=>s.id.startsWith(y)),tot=ms.reduce((a,s)=>a+2+s.films.length+s.albums.length,0);
    const done=ms.reduce((a,s)=>a+["f","nf",...s.films.map((_,i)=>"m"+i),...s.albums.map((_,i)=>"a"+i)].filter(k=>gp(`checks/syl/${s.id}_${k}`)).length,0);
    const body=ms.map(s=>`<details ${s.id===now?"open":""}><summary><span class="ml">${esc(monthLabel(s.id))}</span><span class="small muted">${esc(s.f.split(" by ")[0])}</span></summary><div class="mbody"><div class="grid syl3"><div><div class="small muted"><b>Reading</b></div>${ck(s.id,"f",s.f,"book-open-text")}${ck(s.id,"nf",s.nf,"lightbulb")}</div><div><div class="small muted"><b>Films</b></div>${s.films.map((x,i)=>ck(s.id,"m"+i,x,"film-slate")).join("")}</div><div><div class="small muted"><b>Albums</b></div>${s.albums.map((x,i)=>ck(s.id,"a"+i,x,"vinyl-record")).join("")}</div></div></div></details>`).join("");
    return `<div class="card"><h3><i class="ph ph-books"></i>${y} · ${esc(SYL_YEARS[y][0])}<span class="r num">${done}/${tot}</span></h3><p class="small muted" style="margin-bottom:8px">${esc(SYL_YEARS[y][1])}</p>${bar(done,tot)}<div style="margin-top:10px">${body}</div></div>`}).join("");
  return `<div class="cols c2"><div class="col">${yrs}</div></div>`;
}

/* ============================================================ VISION */
const visOf=()=>(Array.isArray(st.notes.vision)?st.notes.vision:[]).filter(v=>v&&v.u);
function pVision(){
  const it=visOf();
  return head("Vision","a moodboard of where you’re going. links only, so it follows you everywhere.",`<span class="muted small num">${it.length} picture${it.length===1?"":"s"}</span>`).replace("<h1>",`<h1 class="ghost" data-ghost="muse">`)+
   `<div class="addpic"><input type="url" id="vU" placeholder="paste an image link (https://…)" aria-label="image link"><input type="text" class="cap" id="vC" placeholder="caption (optional)" aria-label="caption"><button class="btn solid" data-act="visAdd"><i class="ph ph-plus"></i>Add picture</button></div>`+
   (it.length?`<div class="mood">${it.map(v=>`<figure class="mtile"><img data-act="visZoom" data-u="${esc(v.u)}" data-c="${esc(v.c||"")}" src="${esc(v.u)}" alt="${esc(v.c||"")}" loading="lazy" referrerpolicy="no-referrer" onerror="var f=this.parentNode;f.classList.add('broken');this.replaceWith(document.createTextNode('couldn’t load this link'))"><figcaption data-act="visCap" data-id="${esc(v.id)}">${esc(v.c||"add a caption")}</figcaption><button class="x" data-act="visDel" data-id="${esc(v.id)}" aria-label="Remove"><i class="ph ph-x"></i></button></figure>`).join("")}</div>`:`<div class="vempty"><img src="calbert.png" alt="">nothing on the board yet. paste a link above and pin something that looks like where you’re going.</div>`);
}

/* ============================================================ ARCHIVE extras */
function archSummary(){const ssA=starStats();
  const ks=loggedDays(),end=todayKey();
  const cells=[];
  for(let k=monday(addDays(end,-364));k<=end;k=addDays(k,1))cells.push(heatCell(k));
  let run=0,best=0,showed=0,cur=0;
  if(ks.length)for(let k=ks[0];k<=end;k=addDays(k,1)){if(dayStats(k).done){run++;showed++;if(run>best)best=run}else run=0}
  let k=end;if(!dayStats(k).done)k=addDays(k,-1);while(dayStats(k).done){cur++;k=addDays(k,-1)}
  return `<div class="card" style="margin-bottom:14px"><h3><i class="ph ph-calendar-check"></i>The past year<span class="r">each square is a day</span></h3><div class="tiles">${kpi("Days logged",ks.length,"all time")}${kpi("Showed up",showed,"days")}${kpi("Stars",ssA.stars,"they only ever go up")}${kpi("Best Run",ssA.best+"<small> d</small>","consecutive starred days")}${ssA.run>0?kpi("Run now",ssA.run+"<small> d</small>","one missed day is forgiven"):""}</div><div class="heat">${cells.join("")}</div>${heatLegend()}</div>`;
}

/* ============================================================ ARCHIVE */
/* ---- Insights tab: what your own data says ---- */
const insAvg=L=>{const e=nums(L.map(s=>s.energy).filter(x=>x>0)),m=nums(L.map(s=>s.mood).filter(x=>x>0));return{n:L.length,e:e.length>=3?avg(e):null,m:m.length>=3?avg(m):null}};
const hbars=(rows,mx=5)=>`<div class="hbars">${rows.map(([l,v,sub,c])=>`<div><span>${l}</span><i style="--w:${v==null?0:Math.max(3,v/mx*100)}%;${c?`--hc:${c}`:""}"></i><b class="num">${v==null?"–":r1(v)}</b>${sub?`<em>${sub}</em>`:""}</div>`).join("")}</div>`;
const icard=(t,body,note)=>`<div class="card"><h3>${t}</h3>${note?`<p class="small" style="margin-bottom:10px">${note}</p>`:""}${body}</div>`;
const NEED="<p class='small muted'>Log a few more days and this will fill in.</p>";
const archTabs=(cur)=>`<div class="subtabs">${[["days","Days"],["weeks","Weeks"],["months","Months"],["trends","Trends"],["insights","Insights"],["cycle","Cycle"]].map(([k,l])=>`<button class="${cur===k?"on":""}" data-act="go" data-h="#archive/${k}">${l}</button>`).join("")}</div>`;
function archDays(){
  let ks=loggedDays().reverse();
  if(amo)ks=ks.filter(k=>k.startsWith(amo));
  const q=aq.trim().toLowerCase();
  if(q)ks=ks.filter(k=>{const d=st.days[k];return[d.journal,d.win,d.grat,d.reward,d.tomorrow,...Object.values(d.meals||{}).map(x=>x.t)].join(" ").toLowerCase().includes(q)});
  if(!ks.length)return`<p class="muted">Nothing in the drawer yet. Days appear here once you log something.</p>`;
  return`<div class="arch">${ks.slice(0,250).map(k=>{const s=dayStats(k),ci=cycleInfo(k);return`<a class="arow" href="#today/${k}"><b>${short(k)}, ${parse(k).getFullYear()}</b><div class="chips">${s.done?chip("showed up",1):""}${s.rit?chip(s.rit+" rituals"):""}${s.water?chip(s.water+" water"):""}${s.steps?chip(s.steps.toLocaleString()+" steps"):""}${s.sleep?chip(s.sleep+"h sleep"):""}${s.kcal?chip(s.kcal.toLocaleString()+" kcal"):""}${s.mood?chip('<i class="ph ph-'+FACE[s.mood]+'"></i>'+MOODS[s.mood]):""}${s.energy?chip('<i class="ph ph-'+BATT[s.energy]+'"></i>'+ENERGY[s.energy]):""}${s.flow?chip("flow "+s.flow):""}${ci&&s.has?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}">${PHASES[ci.ph].name.toLowerCase()}</span>`:""}</div><span class="muted small" style="max-width:26ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.win)}</span></a>`}).join("")}</div>${ks.length>250?`<p class="muted small">Showing the latest 250 of ${ks.length}. Narrow with search or month.</p>`:""}`;
}
function archWeeks(){
  const set={};loggedDays().forEach(k=>{set[monday(k)]=1});st.weights.forEach(w=>{set[monday(w.d)]=1});
  const ws=Object.keys(set).sort().reverse();
  if(!ws.length)return`<p class="muted">Nothing in the drawer yet. Weeks appear here once you log days or a weigh-in.</p>`;
  return`<div class="arch">${ws.map(mo=>{const days=weekDays(mo),S=days.map(dayStats),w=weekWeight(mo),wk=isoWeek(mo),rv=st.weeks[wk]||{};
    return`<a class="arow" href="#week/${mo}"><b>${md(mo)} – ${md(days[6])}</b><div class="chips">${chip(S.filter(s=>s.done).length+"/7 showed up",S.filter(s=>s.done).length>=4)}${chip(r0(avg(S.filter(s=>s.steps).map(s=>s.steps)))+" avg steps")}${chip(r1(avg(S.filter(s=>s.sleep).map(s=>s.sleep)))+"h sleep")}${w?chip("weigh-in "+w.w,1):""}${rv.win1?chip("review written"):""}${(rv.pins||[]).length?chip("📌 "+rv.pins.length+" pin"+(rv.pins.length===1?"":"s")):""}</div><span class="muted small">${esc(rv.win1||"")}</span></a>`}).join("")}</div>`;
}
function archMonths(){
  const ks=loggedDays();const set={};ks.forEach(k=>set[k.slice(0,7)]=1);st.weights.forEach(w=>set[w.d.slice(0,7)]=1);Object.keys(st.months).forEach(k=>set[k]=1);set[mkey(new Date())]=1;
  const ms=Object.keys(set).sort().reverse();
  return`<div class="arch">${ms.map(id=>{const m=M.find(x=>x.id===id),n=daysIn(id),S=Array.from({length:n},(_,i)=>dayStats(id+"-"+p2(i+1))),ws=weightsSorted().filter(x=>x.d.startsWith(id)),ds=m?m.ms.filter((_,i)=>gp(`months/${id}/ms/${i}`)).length:0;
    return`<a class="arow" href="#month/${id}"><b>${monthLabel(id)}</b><div class="chips">${chip(S.filter(s=>s.done).length+" days showed up",S.filter(s=>s.done).length>=10)}${m?chip(ds+"/"+m.ms.length+" quests",ds===m.ms.length):""}${chip(r0(avg(S.filter(s=>s.steps).map(s=>s.steps)))+" avg steps")}${ws.length?chip("weight "+ws[ws.length-1].w,1):""}</div><span class="muted small">${m?esc(bk(m.ph)):""}</span></a>`}).join("")}</div>`;
}
const daysIn=id=>parse(addDays(addMonths(id,1)+"-01",-1)).getDate();
function archTrends(){
  const ks=loggedDays().filter(k=>!trRange||daysBetween(k,todayKey())<=trRange);
  const pts=f=>ks.map(k=>({t:parse(k).getTime(),v:f(dayStats(k))})).filter(p=>p.v>0);
  const wsel=weightsSorted().filter(x=>!trRange||daysBetween(x.d,todayKey())<=trRange);
  const pl=planLine(),wser=[{name:"weight",pts:wsel.map(x=>({t:parse(x.d).getTime(),v:+x.w}))}];if(pl&&!trRange||pl&&trRange>=365)wser.push({name:"gentle pace",pts:pl,c:"var(--t55)",dash:1});
  const card=(t,series,o)=>`<div class="card"><h3>${t}</h3>${chartLine(series,o)}${series.length>1?legend(series):""}</div>`;
  const rng=`<div class="seg" role="group" aria-label="range">${[[30,"30d"],[90,"90d"],[365,"1y"],[0,"All"]].map(([v,l])=>`<button class="${trRange===v?"on":""}" data-act="range" data-v="${v}">${l}</button>`).join("")}</div>`;
  return`<div style="margin-bottom:12px">${rng}</div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">${card("Weight",wser,{label:"weight"})}${card("Steps",[{name:"steps",pts:pts(s=>s.steps)}],{goal:stepGoalFor(todayKey()),zero:1})}${card("Sleep (hours)",[{name:"sleep",pts:pts(s=>s.sleep)}],{goal:8,zero:1})}${card("Water (glasses)",[{name:"water",pts:pts(s=>s.water)}],{goal:+st.settings.waterGoal||8,zero:1})}${card("Mood &amp; energy",[{name:"mood",pts:pts(s=>s.mood),c:"var(--accT)"},{name:"energy",pts:pts(s=>s.energy),c:"hsl(200 50% 62%)"}],{zero:1})}${card("Calories logged",[{name:"kcal",pts:pts(s=>s.kcal)}],{zero:1,goal:+st.settings.calGoal||undefined})}</div>`;
}
function archCycle(){
  const ps=sortedP();
  const rows=ps.map((p,i)=>{const prev=ps[i-1],cl=prev?daysBetween(prev.s,p.s):null,pl=p.e?daysBetween(p.s,p.e)+1:null;return`<tr><td>${md(p.s)}, ${parse(p.s).getFullYear()}</td><td><input type="date" value="${p.e||""}" data-k="periods/${st.periods.indexOf(p)}/e" aria-label="period end" style="min-height:34px;padding:4px 8px"></td><td class="num">${pl?pl+" d":"–"}</td><td class="num">${cl?cl+" d":"–"}</td><td><button class="tx" data-act="delPeriod" data-i="${st.periods.indexOf(p)}">remove</button></td></tr>`}).reverse().join("");
  const nx=nextPeriod();
  return`<div class="cols c2"><div class="col"><div class="card tint"><h3>Overview</h3>${ps.length?`<p>Average cycle <b class="num">${cycleLen()}</b> days · period <b class="num">${periodLen()}</b> days${nx?` · next around <b>${md(nx)}</b>`:""}.</p>`:`<p class="muted">No periods logged yet. Add one on the right, or tap “Period started” on a Today page.</p>`}<p class="small muted" style="margin-top:10px">${esc(CYCLE_NOTE)}</p></div><div class="card"><h3>Add a past period</h3><div class="row"><div><label class="f" style="margin-top:0">First day</label><input type="date" id="pstart" max="${todayKey()}"></div><button class="btn solid" data-act="periodAdd">Add</button></div></div></div>
  <div class="col"><div class="card"><h3>History</h3>${ps.length?`<table class="tbl"><tr><th>Started</th><th>Ended</th><th>Length</th><th>Cycle</th><th></th></tr>${rows}</table>`:`<p class="muted small">Nothing yet.</p>`}</div></div></div>`;
}
function pArchive(arg){
  const t=["days","weeks","months","trends","insights","cycle"].includes(arg)?arg:"days";
  let body="";
  if(t==="days"){
    const mos=[...new Set(loggedDays().map(k=>k.slice(0,7)))].sort().reverse();
    body=archSummary()+`<div class="row" style="margin-bottom:12px"><div style="flex:2 1 220px"><input type="text" id="aq" placeholder="Search journal, wins, meals…" value="${esc(aq)}" aria-label="search"></div><div><select id="amo" aria-label="month"><option value="">All months</option>${mos.map(m=>`<option value="${m}" ${amo===m?"selected":""}>${monthLabel(m)}</option>`).join("")}</select></div></div><div id="archList">${archDays()}</div>`;
  }else if(t==="weeks")body=archWeeks();else if(t==="months")body=archMonths();else if(t==="trends")body=archTrends();else if(t==="insights")body=archInsights();else body=archCycle();
  return head("Archive","The drawer: every day, week and month you’ve logged, and the trends between them.")+archTabs(t)+body;
}

/* ---- plan sub-pages ---- */
function det(t,body,open){return`<details ${open?"open":""}><summary><span class="ml">${t}</span></summary><div class="mbody">${body}</div></details>`}
function planMap(){
  const y=YEARS[0],nowId=monthNear(todayKey()).id;
  return`<div class="cols c2"><div class="col">
   <div class="card"><h3>Where you are → where you’re going</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div><div class="small muted"><b>Right now</b></div>${ul(["Gig work, low pay, high procrastination","Living at home; no license or car yet","HUSKY lapsed (fixable, with a form)","Anxiety, depression, CPTSD; possible OCD/AuDHD (assessment is a 2027 goal)","$0 budget; every step has a free route"])}</div><div><div class="small muted"><b>2030: the north star self</b></div>${ul(["Your own space, schedule and car","Stable, well-paying job with benefits","Savings and quiet financial confidence","A village, a creative life, a channel","Mostly free of shame; defined by what she makes and loves"])}</div></div><div class="note" style="margin-top:10px">The gap isn’t a verdict. It’s a to-do list with an order.</div></div>
   <div class="card"><h3>The four-year spine</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${YEARS.map(x=>`<div><div class="it" style="font-size:1.6rem;line-height:1">${x.y}</div><div class="small muted" style="margin-bottom:4px"><b>${x.t}</b></div>${ul(x.items.map(i=>`<b>${i[0]}.</b> ${i[1]}`))}</div>`).join("")}</div></div>
   <div class="card"><h3>If you must cut to three</h3><p class="small">Weight, car, job: already your three. Everything else is optional in 2027. The order matters: <b>insurance → permit → job → license → car</b>, with body habits underneath all of it.</p></div></div>
   <div class="col">
   <div class="card"><h3>Why these three</h3>${Object.entries(y.why).map(([k,v])=>`<p class="small" style="margin-bottom:6px"><b>${k}</b> · ${v.map(esc).join(" · ")}</p>`).join("")}<label class="f">Your own “why” (read weekly)</label>${area("notes/why","Write the reason in your own voice, the one that actually makes you move…",4)}</div>
   <div class="card"><h3>The first 90 days</h3>${ul(["<b>Week 1:</b> HUSKY application. Locate tax / income paperwork.","<b>Weeks 2–4:</b> Work Zone course, practice tests, résumé v1, library card, 10-minute walks.","<b>Dec:</b> $59 saved, DMV appointment booked, LinkedIn, target list, sleep window, baseline weigh-in.","<b>Jan:</b> permit passed, first therapy intake, 3 apps/week, strength twice a week.","<b>Feb–Mar:</b> driving practice, 5 apps/week, interviews, temp-agency Plan B, steps to 7k."])}</div>
   </div></div>`;
}
const BK=BUCKETS;
function sums(){const s={};BK.forEach(b=>s[b[0]]=0);st.savings.forEach(x=>{s[x.bucket]=(s[x.bucket]||0)+(+x.amt||0)});return s}
function planTracks(){
  const sm=sums(),jc=st.jobs.reduce((a,j)=>{a[j.s]=(a[j.s]||0)+1;return a},{});
  const bk=(l,n,g)=>`<div style="margin:8px 0"><div class="small num"><b>${l}</b> · $${n.toLocaleString()}${g?` / $${(+g).toLocaleString()}`:""}</div>${bar(n,g)}</div>`;
  return`<div class="cols c2"><div class="col">
   <div class="card"><h3>Car <span class="r">${CAR_STEPS.filter((_,i)=>gp(`checks/car/${i}`)).length}/${CAR_STEPS.length}</span></h3>${CAR_STEPS.map((x,i)=>chk(`checks/car/${i}`,x,"",true)).join("")}<label class="f">Notes (permit date, road test, instructor)</label>${area("notes/car90","Permit passed on ___; earliest road test ___",3)}</div>
   <div class="card"><h3>Health &amp; benefits <span class="r">${HEALTH_STEPS.filter((_,i)=>gp(`checks/health/${i}`)).length}/${HEALTH_STEPS.length}</span></h3>${HEALTH_STEPS.map((x,i)=>chk(`checks/health/${i}`,x,"",true)).join("")}</div>
   <div class="card"><h3>Money buckets</h3>${bk("Permit",sm.permit,59)}${bk("License",sm.license,84)}${bk("Emergency starter",sm.emergency,1000)}${bk("Car fund",sm.car,+st.settings.carGoal)}${bk("2028 savings",sm.future,0)}<label class="f">Car fund goal ($): car + insurance + registration + repair cushion</label>${numIn("settings/carGoal","8000",'data-re="1"')}<h3 style="margin-top:16px">Add a deposit</h3><div class="row"><div><input type="date" id="sd" value="${todayKey()}"></div><div><input type="number" step=".01" inputmode="decimal" id="sa" placeholder="$"></div><div><select id="sb">${BK.map(b=>`<option value="${b[0]}">${b[1]}</option>`).join("")}</select></div><div><input type="text" id="sn" placeholder="note"></div><button class="btn solid" data-act="addSave">Add</button></div>${st.savings.length?`<table class="tbl" style="margin-top:10px"><tr><th>Date</th><th>$</th><th>Bucket</th><th></th></tr>${st.savings.slice().reverse().slice(0,12).map(x=>`<tr><td>${md(x.d)}</td><td class="num">${(+x.amt).toFixed(2)}</td><td>${esc((BK.find(b=>b[0]===x.bucket)||[0,x.bucket])[1])}${x.note?` · <span class="muted">${esc(x.note)}</span>`:""}</td><td><button class="tx" data-act="delSave" data-i="${st.savings.indexOf(x)}">remove</button></td></tr>`).join("")}</table>`:""}</div></div>
   <div class="col">
   <div class="card"><h3>Job &amp; benefits <span class="r">${JOB_STEPS.filter((_,i)=>gp(`checks/job/${i}`)).length}/${JOB_STEPS.length}</span></h3>${JOB_STEPS.map((x,i)=>chk(`checks/job/${i}`,x,"",true)).join("")}</div>
   <div class="card"><h3>Application log <span class="r">${st.jobs.length} · ${["applied","screening","interview","offer"].map(k=>k[0]+" "+(jc[k]||0)).join(" · ")}</span></h3><div class="row"><div><input type="text" id="jc" placeholder="Company"></div><div><input type="text" id="jr" placeholder="Role"></div><div><select id="js"><option>applied</option><option>screening</option><option>interview</option><option>offer</option><option>rejected</option><option>ghosted</option></select></div><button class="btn solid" data-act="addJob">Add</button></div>${st.jobs.length?`<table class="tbl" style="margin-top:10px"><tr><th>Date</th><th>Company</th><th>Role</th><th>Status</th><th></th></tr>${st.jobs.map((j,i)=>`<tr><td>${md(j.d)}</td><td>${esc(j.c)}</td><td>${esc(j.r)}</td><td><select data-k="jobs/${i}/s" style="min-height:32px;padding:3px 6px;font-size:.8rem">${["applied","screening","interview","offer","rejected","ghosted"].map(o=>`<option ${o===j.s?"selected":""}>${o}</option>`).join("")}</select></td><td><button class="tx" data-act="delJob" data-i="${i}">remove</button></td></tr>`).join("")}</table>`:""}</div>
   </div></div>`;
}
function planToolkit(){
  return`<div class="cols c2"><div class="col"><div class="card">${det("I wavered. What now? (the reset ladder)",ul(TOOLKIT.reset)+`<p class="it" style="font-style:italic;margin-top:8px">Say it out loud: “No worries, I have a back-up plan. I have resources for this.”</p>`,true)}${det("Procrastination &amp; executive dysfunction",ul(TOOLKIT.proc)+`<p class="note" style="margin-top:10px">I can’t diagnose ADHD, autism, or OCD, but if these tactics feel hard to hold even when you’re motivated, ask a clinician for an evaluation.</p>`)}${det("Moth-day menu",ul(TOOLKIT.candle))}${det("The shame loop breaker",ul(TOOLKIT.shame)+`<p class="it" style="font-style:italic">Shame is never in the driver’s seat.</p>`)}</div>
   <div class="card tint"><h3>When it gets dark</h3><p class="small">I’m a moth, and I’m no use for this part. People are. If the heaviness turns into thoughts of not wanting to be here, please reach out to a person right away. In the US, call or text <b>988</b> (Suicide &amp; Crisis Lifeline) any time. If you’re in immediate danger, call <b>911</b>. This plan will wait. You matter more than the plan.</p></div></div>
   <div class="col"><div class="card">${det("Plan B and Plan C",TOOLKIT.planb.map(([n,a])=>`<p class="small"><b>${n}</b></p>${ul(a)}`).join(""),true)}${det("Reward menu",ul(TOOLKIT.reward))}${det("$0 resource list (verify locally)",ul(TOOLKIT.resources))}</div>
   <div class="card"><h3>Doctor &amp; therapist visit: questions to bring</h3>${ul(TOOLKIT.doctor)}</div></div></div>`;
}
function planAtelier(){
  return`<div class="cols c2"><div class="col">
   <div class="card tint"><h3>The morning scene</h3><p class="it" style="font-size:1.2rem;line-height:1.5">A Tuesday in 2030. First light through gauzy curtains. Sheets that slip and whisper, not too warm. City sounds in the distance, quieter inside. A sleepy hand finds the speaker, music starts, the day begins. You feel light, lean, loose. You can run three flights of stairs and still talk. Your clothes fit. You rely on yourself.</p><p class="small muted">Yours. Read it before you start the day.</p></div>
   <div class="card"><h3>Aesthetic anchors</h3>${AESTHETIC.map(([k,v])=>`<p class="small" style="margin-bottom:6px"><b>${k}</b> · ${esc(v)}</p>`).join("")}<label class="f">Signature scent</label>${txt("notes/scent","Jasmine, clove, fig, smoke…")}</div></div>
   <div class="col"><div class="card"><h3>Whimsigoth rituals menu</h3>${ul(TOOLKIT.whimsi)}</div>
   <div class="card"><h3>Muses · borrow one a day</h3><div class="grid">${MUSES.map(x=>`<div><div class="it" style="font-size:1.15rem;line-height:1.2"><b>${esc(x[0])}</b> <i class="muted">· ${esc(x[1])}</i></div><p class="small muted">${esc(x[2])}</p></div>`).join("")}</div></div></div></div>`;
}

/* ============================================================ SETTINGS */
function pSettings(){
  const s=st.settings;
  const prof=`<div class="card"><h3>Profile</h3><div class="inl" style="gap:16px;align-items:center">${avatarHtml("lg")}<div style="flex:1"><label class="btn sm">Upload avatar<input type="file" id="avf" accept="image/*" style="display:none"></label> ${s.avatar?`<button class="btn sm ghost" data-act="rmAvatar">Remove</button>`:""}<p class="small muted" style="margin-top:6px">Shrunk to a small square on this device and synced with the rest of your data.</p></div></div><label class="f">Your name</label>${txt("settings/name","Morning Star, unless you say otherwise")}</div>`;
  const look=`<div class="card"><h3>Look</h3><label class="f" style="margin-top:0">Theme</label><div class="seg">${[["dark","Dark"],["light","Light"],["auto","Device"]].map(([v,l])=>`<button class="${LS.theme===v?"on":""}" data-act="theme" data-v="${v}">${l}</button>`).join("")}</div><label class="f">Accent colour</label><div class="sw">${HOUSES.map(h=>`<button data-act="pickHouse" data-h="${h[0]}" class="${LS.house===h[0]?"on":""}" title="${h[1]}" aria-label="${h[1]}" style="background:linear-gradient(hsl(${h[2]} ${h[3]}% 56%),hsl(${h[2]} ${h[3]}% 28%))"></button>`).join("")}</div><p class="small muted">Look settings are per device.</p></div>`;
  const targets=`<div class="card"><h3>Targets</h3><div class="row"><div><label class="f" style="margin-top:0">Water goal (glasses)</label>${numIn("settings/waterGoal","8")}</div><div><label class="f" style="margin-top:0">Daily steps override</label>${numIn("settings/stepGoal","by month")}</div></div><div class="row"><div><label class="f">Calorie goal (optional)</label>${numIn("settings/calGoal","none")}</div><div><label class="f">Starting weight (lbs)</label>${numIn("settings/startW","","step=\".1\"")}</div><div><label class="f">Goal: lbs to lose in 2027</label>${numIn("settings/goal","80")}</div></div><p class="small muted" style="margin-top:8px">Leave the calorie goal empty to log without a target. A doctor or dietitian is the right person to set one.</p></div>`;
  const cyc=`<div class="card"><h3>Cycle</h3><label class="ck" style="border:0"><input type="checkbox" ${B("settings/trackCycle")} data-re="1" ${s.trackCycle!==false?"checked":""}><span>Track my cycle and show phase tips</span></label><div class="row"><div><label class="f">Usual cycle length (days)</label>${numIn("settings/cycleLen","28")}</div><div><label class="f">Usual period length (days)</label>${numIn("settings/periodLen","5")}</div></div><p class="small muted" style="margin-top:8px">Once you’ve logged a few periods, the app uses your own averages instead. Add or edit periods in Archive → Cycle.</p></div>`;
  const sync=`<div class="card"><h3>Sync across devices <span class="r"><span class="syncdot"></span><span class="syncstat"></span></span></h3><p class="small muted">Your data lives in this browser and, once connected, in a file in your own Google Drive. Sync merges both ways, so editing on your phone and your computer never overwrites either. Setup steps are in the README.</p><label class="f">Apps Script web-app URL</label><input type="url" id="syncUrl" value="${esc(LS.syncUrl)}" placeholder="https://script.google.com/macros/s/…/exec"><label class="f">Secret token (same one you put in the script)</label><input type="password" id="syncTok" value="${esc(LS.token)}" autocomplete="off" placeholder="a long random phrase"><label class="ck" style="border:0"><input type="checkbox" id="syncAuto" ${LS.auto?"checked":""}><span>Sync automatically when I open the app and after changes</span></label><div class="chips" style="margin-top:8px"><button class="btn solid" data-act="syncNow">Sync now</button><button class="btn" data-act="syncSave">Save connection</button></div><p class="small muted" style="margin-top:8px" id="saved"></p></div>`;
  const data=`<div class="card"><h3>Your data</h3><div class="chips"><button class="btn solid" data-act="export">Download backup (.json)</button><label class="btn">Restore from file<input type="file" id="imp" accept=".json,application/json" style="display:none"></label><button class="btn" data-act="reset">Erase this device</button></div><p class="small muted" style="margin-top:8px">${LS.lastBackup?"Last backup: "+new Date(LS.lastBackup).toLocaleDateString():"No manual backup yet."} Restoring merges with what’s here.</p></div>`;
  return head("Settings","Profile, look, targets and sync.")+`<div class="cols c2"><div class="col">${prof}${look}${layoutCard()}${targets}</div><div class="col">${sync}${cyc}${data}</div></div>`;
}

/* events */
let lastRange=null,rtTarget=null;
document.addEventListener("selectionchange",()=>{const s=getSelection();if(s.rangeCount&&s.anchorNode&&s.anchorNode.parentElement&&s.anchorNode.parentElement.closest("[data-rte]"))lastRange=s.getRangeAt(0).cloneRange()});
document.addEventListener("mousedown",e=>{if(e.target.closest("[data-rt],[data-rtcol]"))e.preventDefault()});
document.addEventListener("click",e=>{
  const j=e.target.closest('[data-act="jtab"]');if(j){jtab=j.dataset.v;render();return}
  if(!e.target.closest(".rtc"))document.querySelectorAll(".rtpop").forEach(p=>p.hidden=true);
  const td=e.target.closest(".td");if(td&&e.target.closest("[data-rte]")&&e.offsetX<28){td.dataset.done=td.dataset.done==="1"?"0":"1";saveRte(td.closest("[data-rte]"));return}
  const sw=e.target.closest("[data-rtcol]");
  if(sw){const wrap=sw.closest(".rtewrap"),f=sw.dataset.rtk==="fore";rtRun(wrap.querySelector("[data-rte]"),()=>rtX(f?"foreColor":"hiliteColor",sw.dataset.rtcol||(f?"inherit":"transparent"),1));wrap.querySelectorAll(".rtpop").forEach(p=>p.hidden=true);return}
  const b=e.target.closest("[data-rt]");if(!b)return;
  const wrap=b.closest(".rtewrap"),ed=wrap.querySelector("[data-rte]"),c=b.dataset.rt;
  if(c==="pop"){const p=wrap.querySelector(`.rtpop[data-pop="${b.dataset.pop}"]`),was=!p.hidden;wrap.querySelectorAll(".rtpop").forEach(x=>x.hidden=true);p.hidden=was;return}
  if(c==="code"){rtCode(wrap);return}
  rtRun(ed,()=>{
    if(["bold","italic","underline"].includes(c))rtX(c);
    else if(RTB[c]){const cur=(document.queryCommandValue("formatBlock")||"").toLowerCase().replace(/[<>]/g,"");rtX("formatBlock",cur===RTB[c]&&c!=="p"?"<p>":"<"+RTB[c]+">")}
    else if(c==="ul")rtX("insertUnorderedList");else if(c==="ol")rtX("insertOrderedList");
    else if(c==="hr")rtX("insertHTML","<hr><p><br></p>");
    else if(c==="clear"){rtX("removeFormat");rtX("formatBlock","<p>")}
    else if(c==="todo")rtX("insertHTML",'<div class="td" data-done="0">&#8203;</div>');
    else if(c==="link"){const u=prompt("Link URL");if(u)rtX("createLink",/^(https?:|mailto:)/.test(u)?u:"https://"+u)}
    else if(c==="imglink"){const u=prompt("Image link (https://…)");if(u&&/^https?:\/\//.test(u))rtX("insertHTML",`<img src="${u.replace(/["<>]/g,"")}" alt="" referrerpolicy="no-referrer" loading="lazy"><br>`)}
  });
});
function saveRte(ed){if(!ed)return;const h=ed.innerHTML.replace(/ src="data:[^"]*"/g,m=>m);sp(ed.dataset.rte,h==="<br>"?"":h.replace(/(<img[^>]*data-img[^>]*?) src="[^"]*"/g,"$1"));save()}
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains("rtecode")){sp(t.dataset.rtp,safeHtml(rtTidy(t.value)));save();return}
  if(t.matches&&t.matches("[data-rte]")){saveRte(t);return}
  if(t.dataset&&t.dataset.meal){
    const dk=curDay(),id=t.dataset.meal,e2=estimateMeal(t.value),kp=`days/${dk}/meals/${id}/k`,ap=`days/${dk}/meals/${id}/ka`;
    sp(`days/${dk}/meals/${id}/t`,t.value);
    const cur=gp(kp),ka=gp(ap);if(!cur||+cur===+ka){sp(kp,e2.total||"");const ki=document.querySelector(`[data-k="${kp}"]`);if(ki)ki.value=e2.total||""}
    sp(ap,e2.total);save();
    t.style.height="auto";t.style.height=t.scrollHeight+"px";
    const es=document.getElementById("est_"+id),us=document.getElementById("unk_"+id);
    if(es)es.textContent=e2.total?"≈ "+e2.total+" kcal":"";if(us)us.textContent=e2.unknown.length?"couldn’t size: "+e2.unknown.join(", "):"";
    liveUpdate();
  }
},true);

/* ---- weekly report / pins / events handlers ---- */
/* ---------- handlers ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,D=b.dataset,dk=curDay();
  if(a==="feel"){sp(`days/${dk}/feel/${D.f}`,!gp(`days/${dk}/feel/${D.f}`));save();render()}
  else if(a==="pinAdd"||a==="pinAddP"){let u,c;if(a==="pinAdd"){u=($("pinU_"+D.c).value||"").trim();c=($("pinC_"+D.c).value||"").trim()}else{u=(prompt("Image link (https://…)")||"").trim();if(!u)return;c=(prompt("Caption (optional)")||"").trim()}if(!/^https?:\/\//.test(u))return toast("paste an image link starting with https://");pinView()[D.c]=((dayPins(dk).find(x=>x.id===D.c)||{items:[]}).items||[]).length;persistLocal();pinMut(dk,D.c,it=>it.concat({id:uid(),u,c}))}
  else if(a==="pinNext"){const n=((dayPins(dk).find(x=>x.id===D.c)||{items:[]}).items||[]).length;pinView()[D.c]=((pinView()[D.c]||0)+1)%Math.max(1,n);persistLocal();render()}
  else if(a==="pinDel"){pinView()[D.c]=0;persistLocal();pinMut(dk,D.c,it=>it.filter(p=>p.id!==D.id))}
  else if(a==="pinCardAdd"){const cs=dayPins(dk);sp(`days/${dk}/pins`,(cs.length?cs:[{id:"p0",items:[]}]).concat({id:uid(),items:[]}));save();render()}
  else if(a==="pinCardDel"){sp(`days/${dk}/pins`,dayPins(dk).filter(c=>c.id!==D.c));save();render()}
  else if(a==="wide"){const mi=b.closest(".mi"),pg=R().name,cur=+mi.style.getPropertyValue("--w")||2,n=WS[(WS.indexOf(cur)+1)%WS.length],Lt=JSON.parse(JSON.stringify(LAY(pg)));Lt.w=Lt.w||{};Lt.w[D.id]=n;mi.style.setProperty("--w",n);sp("notes/layout/"+pg,Lt);save();if(window.muRefresh)muRefresh()}
  else if(a==="todoAdd"){const t=$("todoT").value.trim();if(!t)return;sp(D.w+"/todo",todoOf(D.w).concat({id:uid(),t,d:$("todoD").value,x:false}));save();render();setTimeout(()=>{const i=$("todoT");i&&i.focus()},50)}
  else if(a==="todoTog"){sp(D.w+"/todo",todoOf(D.w).map(x=>x.id===D.id?Object.assign({},x,{x:!x.x}):x));save();render()}
  else if(a==="todoDel"){sp(D.w+"/todo",todoOf(D.w).filter(x=>x.id!==D.id));save();render()}
  else if(a==="todoCarry"){sp(D.w+"/todo",todoOf(D.w).concat(todoOf(D.pw).filter(x=>!x.x).map(x=>({id:uid(),t:x.t,d:"",x:false}))));save();render()}
  else if(a==="evAdd"){const d=$("evD").value,t=$("evT").value.trim();if(!d||!t)return toast("add a date and a note");sp(`months/${D.m}/ev`,evOf(D.m).concat({id:uid(),d,t}));save();render()}
  else if(a==="evDel"){sp(`months/${D.m}/ev`,evOf(D.m).filter(x=>x.id!==D.id));save();render()}
});
document.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const id=e.target.id||"";if(/^pin[UC]_/.test(id)){e.preventDefault();const b=e.target.closest(".pinadd").querySelector('[data-act="pinAdd"]');b&&b.click();return}if(id==="todoT"){e.preventDefault();const b=document.querySelector('[data-act="todoAdd"]');b&&b.click()}});

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,D=b.dataset;
  if(a==="visAdd"){const u=($("vU").value||"").trim();if(!/^https?:\/\//i.test(u))return toast("paste a link starting with https://");sp("notes/vision",visOf().concat({id:uid(),u,c:($("vC").value||"").trim()}));save();render()}
  else if(a==="mmood"){sp(`months/${D.m}/mood`,(+gp(`months/${D.m}/mood`)||0)===+D.n?0:+D.n);save();render()}
  else if(a==="rnd"){LS.rnd=Math.random();persistLocal();render()}
  else if(a==="print")window.print();
  else if(a==="visZoom")repZoom(D.u,D.c);
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.target.id==="vU"||e.target.id==="vC")){e.preventDefault();const b=document.querySelector('[data-act="visAdd"]');b&&b.click()}});

/* ============================================================
   v14 additions: editor, body tracking, Calbert live line, week pins, echoes
   ============================================================ */

/* ---- Calbert's line reacts to what you log today ---- */
function calEvt(k){st.notes.calEv={k,t:Date.now(),d:todayKey()};st.su.notes=Date.now()}
function calNote(p,v){
  const m=/^days\/(\d{4}-\d\d-\d\d)\/(.+)$/.exec(p);if(!m||m[1]!==todayKey())return;const f=m[2];let k=null;
  if(/^t3d\d$/.test(f)&&v)k="errand";else if(/^rit\//.test(f)&&v)k="rituals";else if(f==="sleep"&&+v>0)k="sleep";
  else if(f==="tier"&&v==="bonfire")k="bonfire";else if(f==="flow"&&v)k="period";
  if(k)calEvt(k);
}
function lineRefresh(){
  const el=document.querySelector(".line .cl");if(!el||R().name!=="today")return;
  const dk=curDay(),m=monthNear(dk),q=calLine(dk)||LINES[Math.floor(parse(dk)/864e5)%LINES.length]||m.line,h=calHtml(q);
  if(el.innerHTML===h)return;
  el.innerHTML=h;const mo=document.querySelector(".line .calmoth");if(mo){mo.classList.remove("flap");void mo.offsetWidth;mo.classList.add("flap")}
}
setInterval(lineRefresh,60000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")lineRefresh()});

/* ---- sleep times ---- */
const hm=v=>{const m=/^(\d\d):(\d\d)/.exec(v||"");return m?+m[1]*60+ +m[2]:null};
const sleepMin=d=>{const a=hm(d.bed),b=hm(d.wake);if(a==null||b==null)return null;let m=b-a;if(m<=0)m+=1440;return m};
const sleepTxt=d=>{const m=sleepMin(d);return m==null?"log both times and I’ll work out the hours":`${Math.floor(m/60)}h ${m%60}m asleep`};
const sleepTimes=(dk,d)=>`<div class="row sleept"><div><label class="f">Went to bed <span class="muted">(last night)</span></label><div class="inl"><input type="time" ${B(`days/${dk}/bed`)} value="${esc(d.bed||"")}" aria-label="bedtime"><button class="tx" data-act="tnow" data-f="bed">now</button></div></div><div><label class="f">Woke up</label><div class="inl"><input type="time" ${B(`days/${dk}/wake`)} value="${esc(d.wake||"")}" aria-label="wake time"><button class="tx" data-act="tnow" data-f="wake">now</button></div></div></div><div class="small muted" id="sleepAuto" style="margin-top:4px">${sleepTxt(d)}</div>`;
function autoSleep(dk){
  const d=st.days[dk]||{},m=sleepMin(d);
  if(m!=null){
    const h=Math.round(m/6)/10;
    if(!d.sleep||+d.sleep===+d.sleepA)sp(`days/${dk}/sleep`,h);
    sp(`days/${dk}/sleepA`,h);
    if(dk===curDay()){const si=document.querySelector(`[data-k="days/${dk}/sleep"]`);if(si)si.value=h;liveUpdate()}
  }
  const el=$("sleepAuto");if(el&&dk===curDay())el.textContent=sleepTxt(d);
}
const weedHtml=d=>`<label class="f">🌿 Weed today <span class="muted">${d.weed==="y"?"yes":d.weed==="n"?"no":"not logged"}</span></label><div class="seg wseg">${[["y","Yes"],["n","No"]].map(([v,l])=>`<button class="${d.weed===v?"on":""}" data-act="weed" data-v="${v}">${l}</button>`).join("")}</div>`;
function symBody(dk){
  const on=k=>!!gp(`days/${dk}/sym/${k}`),ch=([k,l])=>`<button class="chip ${on(k)?"on":""}" data-act="sym" data-s="${k}">${l}</button>`,more=SYMPTOMS.slice(15);
  return `<label class="f">Symptoms &amp; body notes</label><div class="chips">${SYMPTOMS.slice(0,15).map(ch).join("")}</div><details class="symmore" ${more.some(x=>on(x[0]))?"open":""}><summary><span class="ml" style="font-size:.85rem">more symptoms</span></summary><div class="chips" style="margin-top:8px">${more.map(ch).join("")}</div></details>`;
}
function weedCard(ks,S){
  const Y=ks.filter(k=>S[k].d.weed==="y").map(k=>S[k]),N=ks.filter(k=>S[k].d.weed==="n").map(k=>S[k]);
  if(!Y.length&&!N.length)return icard("Weed days vs. not",NEED,"Tap yes or no under Today → Body.");
  const a=insAvg(Y),b=insAvg(N),m=(L,f)=>{const v=nums(L.map(f).filter(x=>x>0));return v.length?avg(v):null};
  const rows=[["weed · energy",a.e,a.n+"d"],["weed · mood",a.m,""],["no weed · energy",b.e,b.n+"d"],["no weed · mood",b.m,""]].filter(r=>r[1]!=null);
  const ln=(l,L)=>L.length?`<b>${l}</b>: ${L.length} day${L.length===1?"":"s"} · avg sleep ${r1(m(L,s=>s.sleep))}h · ${r0(m(L,s=>s.steps))} steps`:"";
  return icard("Weed days vs. not",(rows.length?hbars(rows):"<p class='small muted'>Energy and mood need a few more logged days on each side.</p>")+`<p class="small" style="margin-top:10px">${[ln("Yes",Y),ln("No",N)].filter(Boolean).join("<br>")}</p>`,"A pattern spotter, never a verdict.");
}

/* ---- rich text editor v2 ---- */
const RTF=["Manrope","Cormorant Garamond","Cutive Mono","Pinyon Script","Caveat","Playfair Display","Lora","Special Elite"];
const RTC=["#e5484d","#f08a24","#f2c94c","#4caf7d","#3fb8c4","#5b8cff","#a06bff","#e56bb0","#ffffff","#9a9aa5","#1b1b22"];
const RTB={h1:"h1",h2:"h2",h3:"h3",quote:"blockquote",p:"p"};
const rtpal=k=>`<div class="rtpop" data-pop="${k}" hidden>${HOUSES.map(h=>`hsl(${h[2]} ${h[3]+25}% 60%)`).concat(RTC).map(c=>`<button type="button" data-rtcol="${c}" data-rtk="${k}" style="background:${c}" aria-label="${c}"></button>`).join("")}<label class="rtcust" title="any colour">+<input type="color" data-rtcustom="${k}" value="#ff6fa8"></label><button type="button" class="rtnone" data-rtcol="" data-rtk="${k}">clear</button></div>`;
const rtbar=()=>{
  const b=(c,l,t,x="")=>`<button class="rb ${x}" type="button" data-rt="${c}" title="${t}" aria-label="${t}">${l}</button>`,ic=n=>`<i class="ph ph-${n}"></i>`,sep='<span class="sep"></span>';
  return `<div class="rtebar"><select class="rtfont" data-rtfont title="Font" aria-label="Font"><option value="">Font</option>${RTF.map(f=>`<option value="${f}" style="font-family:'${f}'">${f}</option>`).join("")}</select>${sep}`
  +b("bold",ic("text-b"),"Bold")+b("italic",ic("text-italic"),"Italic")+b("underline",ic("text-underline"),"Squiggle underline")+sep
  +b("h1","H1","Heading 1")+b("h2","H2","Heading 2")+b("h3","H3","Heading 3")+b("p","¶","Normal text")+sep
  +b("ul",ic("list-bullets"),"Bulleted list")+b("ol","1.","Numbered list")+b("quote","❝","Quote")+b("hr","—","Divider")+sep
  +`<span class="rtc"><button class="rb" type="button" data-rt="pop" data-pop="fore" title="Text colour" aria-label="Text colour"><span class="rtA">A</span></button>${rtpal("fore")}</span><span class="rtc"><button class="rb" type="button" data-rt="pop" data-pop="back" title="Highlight colour" aria-label="Highlight colour"><span class="rtA hl">ab</span></button>${rtpal("back")}</span>`+sep
  +b("todo",ic("check-square"),"To-do")+b("link",ic("link"),"Link")+b("imglink",ic("globe"),"Image from link")+b("clear","Tx","Clear formatting")+b("code","&lt;/&gt;","HTML / CSS view","rbcode")+`</div>`;
};
const rtEd=el=>el.closest(".rtewrap").querySelector("[data-rte]");
function rtRun(ed,fn){ed.focus();if(lastRange&&ed.contains(lastRange.startContainer)){const s=getSelection();s.removeAllRanges();s.addRange(lastRange)}fn();saveRte(ed)}
const rtX=(cmd,val,css)=>{try{document.execCommand("styleWithCSS",false,!!css)}catch(e){}document.execCommand(cmd,false,val)};
const rtTidy=s=>s.replace(/(<\/(?:p|div|h[1-6]|li|ul|ol|blockquote|style)>)\s*\n/gi,"$1");
function rtCode(wrap){
  const ed=wrap.querySelector("[data-rte]");let ta=wrap.querySelector(".rtecode");
  if(ta){ed.innerHTML=safeHtml(rtTidy(ta.value));ta.remove();ed.hidden=false;wrap.classList.remove("code");saveRte(ed)}
  else{ta=document.createElement("textarea");ta.className="rtecode";ta.spellcheck=false;ta.dataset.rtp=ed.dataset.rte;
    ta.placeholder="HTML + CSS. Inline styles, classes and <style> blocks all work. Scripts and on… handlers are removed on save.";
    ta.value=ed.innerHTML.replace(/<\/(p|div|h[1-6]|li|ul|ol|blockquote|style)>/gi,"$&\n");ta.style.minHeight=ed.style.minHeight;
    ed.hidden=true;wrap.appendChild(ta);wrap.classList.add("code");ta.focus()}
}

/* ---- echoes: the whole paragraph that mentions the book / film / album / author ---- */
const paras=h=>String(h||"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<\/(p|div|h[1-6]|li|blockquote|ul|ol|tr)>|<br\s*\/?>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&nbsp;|&#8203;|​/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").split(/\n+/).map(s=>s.replace(/\s+/g," ").trim()).filter(s=>s.length>=12);
const rxEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const hi=(s,t)=>s.split(new RegExp("("+rxEsc(t)+")","ig")).map((x,i)=>i%2?`<mark>${esc(x)}</mark>`:esc(x)).join("");

/* ---- week pins: 1 to 3 typed cards, saved to the week ---- */
const WPT=[["img","image link","images-square"],["note","note","note"],["link","web link","link"],["quote","quote","quotes"],["recipe","recipe","cooking-pot"]];
const wPins=w=>{const p=gp(w+"/pins");return Array.isArray(p)?p:[]};
const wpUI={};let wpW="";
const domOf=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return u}};
const wLines=s=>String(s||"").split(/\n+/).map(x=>x.replace(/^\s*(?:[-*•]|\d+[.)])\s*/,"").trim()).filter(Boolean);
function wpForm(id,t,v){
  v=v||{};
  const f=(k,lbl,ph,rows)=>`<label class="f">${lbl}</label>${rows?`<textarea data-wf="${k}" rows="${rows}" placeholder="${ph}">${esc(v[k]||"")}</textarea>`:`<input data-wf="${k}" type="${k==="u"?"url":"text"}" value="${esc(v[k]||"")}" placeholder="${ph}">`}`;
  const F={img:[f("u","Image link","https://…"),f("c","Caption","optional")],
   note:[f("h","Title","optional"),f("b","Note","write anything. the card grows to fit all of it.",6)],
   link:[f("u","Web link","https://…"),f("h","Title","what is it? (optional)"),f("b","Note","why you saved it (optional)",2)],
   quote:[f("b","Quote","the words…",4),f("c","Said by","optional")],
   recipe:[f("h","Recipe name","name of the dish"),f("i","Ingredients","one per line",6),f("b","Method","one step per line",7)]}[t];
  return `<div class="wpform" data-wpin="${id}">${F.join("")}<div class="chips" style="margin-top:12px"><button class="btn solid sm" data-act="wpSave" data-id="${id}" data-t="${t}">Pin it</button><button class="btn sm ghost" data-act="wpCancel" data-id="${id}">Cancel</button></div></div>`;
}
function wpView(p){
  const t=p.t,src=/^https?:\/\//i.test(p.u||"")?p.u:"";
  if(t==="img")return src?`<button class="wpimg" data-act="wpZoom" data-u="${esc(src)}" data-c="${esc(p.c||"")}" aria-label="Open image"><img src="${esc(src)}" alt="" referrerpolicy="no-referrer" loading="lazy" onload="window.muRefresh&&muRefresh()" onerror="this.parentNode.classList.add('bad');window.muRefresh&&muRefresh()"></button>${p.c?`<span class="wpcap">${esc(p.c)}</span>`:""}`:`<p class="small muted">no image link</p>`;
  if(t==="link"){const d=domOf(src);return `${src?`<a class="wplink" href="${esc(src)}" target="_blank" rel="noopener"><img class="fav" src="https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(d)}" alt=""><span><b>${esc(p.h||d)}</b><small>${esc(d)}</small></span><i class="ph ph-export"></i></a>`:""}${p.b?`<div class="wptxt" style="margin-top:10px">${esc(p.b)}</div>`:""}`}
  if(t==="quote")return `<blockquote class="wpq">${esc(p.b||"")}${p.c?`<cite>${esc(p.c)}</cite>`:""}</blockquote>`;
  if(t==="recipe"){const I=wLines(p.i),M=wLines(p.b);return `${p.h?`<div class="wph">${esc(p.h)}</div>`:""}<div class="wprec">${I.length?`<h5>Ingredients</h5><ul>${I.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}${M.length?`<h5>Method</h5><ol>${M.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}</div><p class="small muted" style="margin-top:6px">tap an ingredient to tick it off</p>`}
  return `${p.h?`<div class="wph">${esc(p.h)}</div>`:""}<div class="wptxt">${esc(p.b||"")}</div>`;
}
function wpCards(w){
  const L=wPins(w),out=L.map(p=>{
    const ui=wpUI[p.id]||{},T=WPT.find(x=>x[0]===p.t)||WPT[1];
    return card("wpin_"+p.id,T[1],T[2],ui.mode==="edit"?wpForm(p.id,p.t,p):wpView(p),{cls:"s4 wpin k-"+p.t,r:ui.mode==="edit"?"":`<button class="tx" data-act="wpEdit" data-id="${p.id}">edit</button> <button class="tx" data-act="wpDel" data-id="${p.id}">remove</button>`});
  });
  if(L.length<3){
    const ui=wpUI.new||{};
    const body=ui.mode==="form"?wpForm("new",ui.t,null):`<p class="small muted" style="margin-bottom:10px">${L.length?"room for "+(3-L.length)+" more. pick what to pin:":"pin something from this week to come back to: a picture, a recipe, a link, a quote, a note."}</p><div class="wptypes">${WPT.map(([k,l,i])=>`<button class="btn sm" data-act="wpType" data-t="${k}"><i class="ph ph-${i}"></i>${l}</button>`).join("")}</div>`;
    out.push(card("wpin_new","Week pins","push-pin",body,{cls:"s4 wpin",r:`${L.length}/3`}));
  }
  return out;
}
const calb=t=>`<div class="cempty"><img src="calbert.png" alt=""><p>${t}</p></div>`;
document.addEventListener("click",e=>{
  const li=e.target.closest(".wprec li");if(li){li.classList.toggle("got");return}
  const b=e.target.closest('[data-act^="wp"]');if(!b)return;
  const a=b.dataset.act,D=b.dataset;
  if(a==="wpZoom")return repZoom(D.u,D.c);
  if(a==="wpType")wpUI.new={mode:"form",t:D.t};
  else if(a==="wpCancel")delete wpUI[D.id];
  else if(a==="wpEdit")wpUI[D.id]={mode:"edit"};
  else if(a==="wpDel"){if(!confirm("Remove this pin?"))return;sp(wpW+"/pins",wPins(wpW).filter(p=>p.id!==D.id));save()}
  else if(a==="wpSave"){
    const root=b.closest(".wpform"),v={};root.querySelectorAll("[data-wf]").forEach(x=>v[x.dataset.wf]=x.value.trim());
    const t=D.t,bad=(t==="img"||t==="link")&&!/^https?:\/\//i.test(v.u||"")?"paste a link starting with https://":(t==="note"||t==="quote")&&!v.b?"write something first":t==="recipe"&&!v.h&&!v.i?"add a name or ingredients":"";
    if(bad)return toast(bad);
    const L=wPins(wpW),pin=Object.assign({id:D.id==="new"?uid():D.id,t},v);
    if(D.id==="new"){if(L.length>=3)return toast("three pins per week is the limit");sp(wpW+"/pins",L.concat(pin))}
    else sp(wpW+"/pins",L.map(p=>p.id===D.id?pin:p));
    save();delete wpUI[D.id];delete wpUI.new;
  }else return;
  render();
});

/* ===== shell and events ===== */
/* ============================================================
   north star — shell, events, boot
   ============================================================ */
const NAVS=[["today","Today","sun-horizon"],["week","Week","calendar-dots"],["month","Month","calendar-blank"],["vision","Vision","images-square"],["archive","Archive","archive"],["plan","Plan","compass"]];
const TABS=["today","week","month","vision","plan"];
const curDay=()=>{const r=R();return r.name==="today"&&DATE_RE.test(r.arg)?r.arg:todayKey()};
const $=id=>document.getElementById(id);
const ico=(n,f)=>`<i class="ph${f?"-fill":""} ph-${n}"></i>`;
const pinned=()=>!!LS.pinned;

function chrome(){
  const r=R(),mo=monthNear(todayKey()),ss=starStats();
  const dpar=dayParts(todayKey()),dp=Math.round(dpar.filter(Boolean).length/dpar.length*100);
  document.documentElement.classList.toggle("pinned",pinned());
  document.documentElement.classList.toggle("sheet",sheetOpen);

  const star=n=>`${n} star${n===1?"":"s"}`;
  const nav=NAVS.map(([k,l,ic])=>{const on=r.name===k;
    return `<a href="#${k}" class="rr ${on?"on":""}" title="${l}" ${on?'aria-current="page"':""}><span class="ic">${ico(ic,on)}</span><span class="lb">${l}</span></a>`}).join("");
  const pinL=pinned()?"Unpin sidebar":"Pin sidebar open";
  const th=document.documentElement.dataset.theme||"dark",hs=HOUSES.find(h=>h[0]===LS.house)||HOUSES[0];
  const row=o=>`<button class="rr ${o.on?"on":""}" data-act="${o.act}" title="${o.t}" aria-label="${o.t}" ${o.pr!=null?`aria-pressed="${o.pr}"`:""} ${o.x||""}><span class="ic">${o.ic}</span><span class="lb">${o.l}${o.s?`<small>${o.s}</small>`:""}</span></button>`;
  const tools=[
    row({act:"syncNow",t:"Sync now",l:"Sync",s:'<span class="syncstat"></span>',ic:'<span class="aic"><i class="ph ph-sync"></i><span class="syncdot sd"></span></span>'}),
    row({act:"pin",t:pinL,l:"Pin sidebar",ic:ico(pinned()?"push-pin":"push-pin-slash",pinned()),on:pinned(),pr:pinned()}),
    row({act:"cycleHouse",t:"Next accent colour",l:"Accent",s:`<span class="accLb">${esc(hs[1])}</span>`,ic:`<span class="aic">${ico("palette")}<span class="adot"></span></span>`}),
    row({act:"toggleTheme",t:"Light or dark",l:"Theme",s:`<span class="themeLb">${th==="dark"?"Dark":"Light"}</span>`,ic:'<span class="tg"></span>'})
  ].join("");
  $("side").innerHTML=`<nav class="rail" aria-label="sections">
   <div class="rhd">
     <a class="rav" href="#settings" title="Profile and settings" aria-label="Profile and settings">${avatarHtml()}</a>
     <div class="who lb"><a class="wordmark" href="#today"><img class="wm" src="calbert.png" alt="">north star</a><small>${esc(mo.ph)} · ${esc(mo.lbl)}</small></div>
   </div>
   <a class="rr rpg" href="#today" title="Today"><span class="ic"><span class="ring" style="--p:${dp}"><b>${dp}</b></span></span><span class="lb t">today<small>${star(ss.stars)}${ss.run>1?` · run ${ss.run}`:""}</small></span></a>
   <div class="rlab"><span class="lb">the road</span></div>
   <div class="rgrp">${nav}</div>
   <div class="rlab"><span class="lb">tools</span></div>
   <div class="rgrp">${tools}</div>
   <div class="rfoot">
     <a href="#settings" class="rr ${r.name==="settings"?"on":""}" title="Settings"><span class="ic">${ico("gear-six",r.name==="settings")}</span><span class="lb">Settings</span></a>
   </div></nav>`;
  const hs2=HOUSES.map(h=>`<button data-act="pickHouse" data-h="${h[0]}" class="${LS.house===h[0]?"on":""}" aria-label="${h[1]}" title="${h[1]}" style="background:linear-gradient(hsl(${h[2]} ${h[3]}% 56%),hsl(${h[2]} ${h[3]}% 28%))"></button>`).join("");
  $("topbar").innerHTML=`<a class="wordmark" href="#today"><img class="wm" src="calbert.png" alt="">north star</a><div class="tools"><button class="ib" data-act="syncNow" aria-label="Sync now"><span class="aic"><i class="ph ph-sync"></i><span class="syncdot sd"></span></span></button><button class="ib avb" data-act="sheet" aria-label="Menu" aria-expanded="${sheetOpen}">${avatarHtml()}</button></div><div class="msheet"><div class="ms-h">Accent colour</div><div class="sw">${hs2}</div><div class="ms-h">Theme</div><div class="seg">${[["dark","Dark"],["light","Light"],["auto","Device"]].map(([v,l])=>`<button class="${LS.theme===v?"on":""}" data-act="theme" data-v="${v}">${l}</button>`).join("")}</div><a class="btn" href="#settings"><i class="ph ph-gear-six"></i>Settings</a><div class="ms-sync"><span class="syncdot"></span><span class="syncstat"></span><button class="btn sm solid" data-act="syncNow">Sync now</button></div></div>`;
  $("tabs").innerHTML=NAVS.map(([k,l,ic])=>`<a href="#${k}" class="${r.name===k?"on":""}">${ico(ic,r.name===k)}${l}</a>`).join("");
}
let lastH=null,sheetOpen=false,lastInput=0,renderTok=0;
["wheel","touchmove","keydown"].forEach(ev=>addEventListener(ev,()=>{lastInput=Date.now()},{passive:true}));
document.addEventListener("click",e=>{if(sheetOpen&&!e.target.closest(".msheet,[data-act=sheet]")){sheetOpen=false;document.documentElement.classList.remove("sheet")}});
function render(top){
  const goTop=top===true,y=goTop?0:window.scrollY,r=R(),mn=$("main"),t0=Date.now(),tok=++renderTok;
  if(!goTop)mn.style.minHeight=mn.offsetHeight+"px";
  muDestroy();chrome();applyLook();
  const fn={today:pToday,week:pWeek,month:pMonth,vision:pVision,archive:pArchive,plan:pPlan,settings:pSettings}[r.name]||pToday;
  mn.classList.toggle("enter",lastH!==location.hash);lastH=location.hash;
  mn.innerHTML=fn(r.arg);repGrow();
  muInit();
  setSyncState(syncing?"busy":syncMsg?"err":dirty&&LS.syncUrl?"pending":LS.lastSync?"ok":"",syncMsg);
  setSaved(mem?"not saved on this device":"");
  window.scrollTo(0,y);
  const again=()=>{if(tok===renderTok&&lastInput<=t0)window.scrollTo(0,y)};
  requestAnimationFrame(again);setTimeout(again,150);
  setTimeout(()=>{again();if(tok===renderTok)mn.style.minHeight=""},450);
  const tc=document.querySelector(".tile.cur");if(tc)tc.parentElement.scrollLeft=Math.max(0,tc.offsetLeft-20);
}

/* ---------- muuri masonry: drag by the middle light only ---------- */
let MUG=null,MUR=null,muT=0;
function muDestroy(){clearTimeout(muT);if(MUR){MUR.disconnect();MUR=null}if(MUG){try{MUG.destroy(false)}catch(e){}MUG=null}}
function muRefresh(){clearTimeout(muT);muT=setTimeout(()=>{if(!MUG||MUG.getItems().some(i=>i.isDragging()))return;MUG.refreshItems();MUG.layout()},40)}
function saveLayout(){
  if(!MUG)return;
  const pg=MUG.getElement().dataset.page,L=JSON.parse(JSON.stringify(LAY(pg))),vis=MUG.getItems().map(i=>i.getElement().dataset.id);
  L.o=vis.concat((L.o||[]).filter(x=>!vis.includes(x)));sp("notes/layout/"+pg,L);save();
}
function muInit(){
  const el=document.querySelector(".mu");if(!el||typeof Muuri==="undefined")return;
  el.classList.add("on");
  MUG=new Muuri(el,{items:".mi",dragEnabled:true,dragHandle:".lt-move",layoutDuration:260,layoutEasing:"ease",
    dragRelease:{duration:260,easing:"ease"},layout:{fillGaps:true,rounding:false},
    dragPlaceholder:{enabled:true,duration:200,createElement:i=>{const p=i.getElement().cloneNode(true);p.classList.add("mu-ph");p.removeAttribute("data-id");p.querySelectorAll("[id]").forEach(n=>n.removeAttribute("id"));return p}}});
  MUG.on("dragEnd",saveLayout);
  if(window.ResizeObserver){MUR=new ResizeObserver(muRefresh);el.querySelectorAll(".card").forEach(c=>MUR.observe(c))}
  el.addEventListener("load",muRefresh,true);
}
document.addEventListener("keydown",e=>{ /* keyboard: arrows on the move light reorder */
  const b=e.target.closest&&e.target.closest(".lt-move");if(!b||!MUG)return;
  const d={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1}[e.key];if(!d)return;e.preventDefault();
  const mi=b.closest(".mi"),its=MUG.getItems(),i=its.findIndex(x=>x.getElement()===mi),j=i+d;
  if(j<0||j>=its.length)return;MUG.move(i,j);saveLayout();b.focus();
});

function afterRemoteChange(){
  const a=document.activeElement;
  if(!a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName)){render();toast("Another device has been busy. This one is up to date now.")}
}
window.addEventListener("hashchange",()=>{sheetOpen=false;render(true)});

/* in-place updates so typing never loses focus */
function liveUpdate(){
  const dk=curDay(),S=dayStats(dk);
  const kt=$("kcalTot");if(kt){const g=+st.settings.calGoal||0;kt.textContent=(S.kcal?S.kcal.toLocaleString()+" kcal":"–")+(g?" / "+g.toLocaleString():"")}
  const sb=$("stepsBar");if(sb)sb.querySelector("i").style.width=Math.min(100,S.steps/stepGoalFor(dk)*100)+"%";
  const lb=$("sleepBar");if(lb)lb.querySelector("i").style.width=Math.min(100,S.sleep/8*100)+"%";
}
function deferRender(){setTimeout(()=>{const a=document.activeElement;if(!a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName))render()},90)}

/* ---------- input binding ---------- */
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.id==="aq"){aq=t.value;const l=$("archList");if(l)l.innerHTML=archDays();return}
  const k=t.dataset&&t.dataset.k;if(!k)return;
  if(t.type==="radio"&&!t.checked)return;
  sp(k,t.type==="checkbox"?t.checked:t.value);save();if(/\/(bed|wake)$/.test(k))autoSleep(k.split("/")[1]);lineRefresh();if(/\/rit\//.test(k)&&t.checked)setTimeout(()=>celebrate(curDay(),false),120);
  if(/\/(steps|sleep|k)$/.test(k))liveUpdate();
  if((t.type==="checkbox"||t.type==="radio")&&t.dataset.re)render();
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.rtfont!==undefined){if(t.value)rtRun(rtEd(t),()=>rtX("fontName",t.value,1));t.value="";return}
  if(t.dataset&&t.dataset.rtcustom){rtRun(rtEd(t),()=>rtX(t.dataset.rtcustom==="fore"?"foreColor":"hiliteColor",t.value,1));return}
  if(t.id==="amo"){amo=t.value;render();return}
  if(t.id==="avf"&&t.files[0]){setAvatar(t.files[0]);t.value="";return}
  if(t.id==="imp"&&t.files[0]){
    const r=new FileReader();
    r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!=="object"||!o.settings)throw 0;st=normalize(mergeState(st,normalize(o)));save();render();toast("restored (merged with what was here)")}catch(x){toast("That isn’t a backup. Pick the .json file you downloaded from Settings.")}};
    r.readAsText(t.files[0]);t.value="";return;
  }
  if(t.dataset&&t.dataset.k&&t.type!=="checkbox"&&t.type!=="radio")deferRender();
});

/* ---------- clicks ---------- */
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-act]");if(!b)return;
  const a=b.dataset.act,i=+b.dataset.i,dk=curDay(),D=b.dataset;
  switch(a){
   case"pin":LS.pinned=!LS.pinned;persistLocal();render();break;
   case"go":location.hash=D.h;break;
   case"tick":sp(`days/${dk}/rit/${D.id}`,true);save();render();celebrate(dk,false);break;
   case"goto":{const el=$(D.t);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});const f=el.querySelector("input,textarea");if(f)setTimeout(()=>f.focus({preventScroll:true}),350)}break}
   case"water":{const c=+gp(`days/${dk}/water`)||0,n=+D.n;sp(`days/${dk}/water`,c===n?n-1:n);save();render();break}
   case"rate":{const c=+gp(`days/${dk}/${D.f}`)||0,n=+D.n;sp(`days/${dk}/${D.f}`,c===n?0:n);save();render();break}
   case"markDone":{const d=st.days[dk]||(st.days[dk]={});sp(`days/${dk}/done`,!d.done);save();render();if(st.days[dk].done)celebrate(dk,true);break}
   case"muse":st.notes.muse=Math.floor(Math.random()*MUSES.length);st.su.notes=Date.now();save();render();break;
   case"sym":sp(`days/${dk}/sym/${D.s}`,!gp(`days/${dk}/sym/${D.s}`));save();render();break;
   case"flow":sp(`days/${dk}/flow`,gp(`days/${dk}/flow`)===D.f?"":D.f);save();render();break;
   case"weed":sp(`days/${dk}/weed`,gp(`days/${dk}/weed`)===D.v?"":D.v);save();render();break;
   case"tnow":{const n=new Date(),t=p2(n.getHours())+":"+p2(n.getMinutes());let td=dk;if(D.f==="bed"&&n.getHours()>=17&&dk===todayKey()){td=addDays(dk,1);toast("bedtime saved to tomorrow’s sleep log")}sp(`days/${td}/${D.f}`,t);autoSleep(td);save();render();break}
   case"periodStart":if(!st.periods.some(p=>p.s===D.d)){addItem("periods",{s:D.d});if(D.d===todayKey())calEvt("period");if(st.settings.trackCycle===false)sp("settings/trackCycle",true);save();render();toast("period start logged")}break;
   case"periodEnd":{const open=sortedP().filter(p=>p.s<=D.d&&!p.e).pop();if(open){open.e=D.d;open._u=Date.now();save();render();toast("period end logged")}break}
   case"periodUndo":{const idx=st.periods.findIndex(p=>p.s===D.d);if(idx>=0){delItem("periods",idx);save();render()}break}
   case"periodAdd":{const v=$("pstart")&&$("pstart").value;if(!v)return toast("pick a date");if(!st.periods.some(p=>p.s===v))addItem("periods",{s:v});save();render();toast("added");break}
   case"delPeriod":delItem("periods",i);save();render();break;
   case"saveWeight":{const d=$("wd").value,w=parseFloat($("wv").value);if(!d||!isFinite(w))return toast("add a date and weight");upsertWeight(d,w);save();render();toast("Weigh-in saved. It goes in the drawer.");break}
   case"addJob":{const c=$("jc").value.trim(),r=$("jr").value.trim();if(!c&&!r)return toast("add a company or role");addItem("jobs",{d:todayKey(),c,r,s:$("js").value});save();render();break}
   case"delJob":delItem("jobs",i);save();render();break;
   case"addSave":{const amt=parseFloat($("sa").value);if(!isFinite(amt))return toast("add an amount");addItem("savings",{d:$("sd").value||todayKey(),amt,bucket:$("sb").value,note:$("sn").value});save();render();toast("deposited");break}
   case"delSave":delItem("savings",i);save();render();break;
   case"range":trRange=+D.v;render();break;
   case"theme":LS.theme=D.v;persistLocal();applyLook();render();break;
   case"toggleTheme":LS.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";persistLocal();applyLook();break;
   case"pickHouse":LS.house=D.h;persistLocal();applyLook();render();break;
   case"cycleHouse":{const n=(HOUSES.findIndex(h=>h[0]===LS.house)+1)%HOUSES.length;LS.house=HOUSES[n][0];persistLocal();applyLook();document.querySelectorAll(".accLb").forEach(e=>e.textContent=HOUSES[n][1]);toast("accent: "+HOUSES[n][1]);if(R().name==="settings")render();break}
   case"rmAvatar":sp("settings/avatar","");save();render();break;
   case"syncSave":saveConn();toast("connection saved");break;
   case"sheet":sheetOpen=!sheetOpen;document.documentElement.classList.toggle("sheet",sheetOpen);break;
   case"syncNow":saveConn();persist();await syncNow(true);if(R().name==="settings")render();break;
   case"export":{LS.lastBackup=Date.now();persistLocal();const blob=new Blob([JSON.stringify(st,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),l=document.createElement("a");l.href=u;l.download="northstar-backup-"+todayKey()+".json";l.click();URL.revokeObjectURL(u);render();break}
   case"fold":{LS.fold=LS.fold||{};LS.fold[D.id]=!LS.fold[D.id];persistLocal();const c=$(D.id);if(c)c.classList.toggle("folded",!!LS.fold[D.id]);muRefresh();break}
   case"dense":LS.dense=D.v;persistLocal();applyLook();render();break;
   case"resetLayout":LS.hide={};LS.fold={};LS.dense="cozy";sp("notes/layout",{});save();persistLocal();applyLook();render();toast("layout reset");break;
   case"visDel":sp("notes/vision",visOf().filter(v=>v.id!==D.id));save();render();break;
   case"visCap":{const v=visOf().find(x=>x.id===D.id);const c=prompt("Caption",v?v.c||"":"");if(c!==null&&v){sp("notes/vision",visOf().map(x=>x.id===D.id?Object.assign({},x,{c:c.trim()}):x));save();render()}break}
   case"reset":if(confirm("Erase all progress on THIS device? If sync is on, the Drive copy stays and can be pulled back. Download a backup first if unsure.")){st=def();persist();render()}break;
  }
});
function saveConn(){
  const u=$("syncUrl"),t=$("syncTok"),au=$("syncAuto");
  if(u)LS.syncUrl=u.value.trim();if(t)LS.token=t.value.trim();if(au)LS.auto=au.checked;
  persistLocal();
}

/* ---------- images: vision uploads, drag-drop, lightbox, avatar removal ---------- */

document.addEventListener("click",e=>{
  const im=e.target.closest(".mood img");
  if(im&&im.src){const lb=document.createElement("div");lb.className="lightbox";lb.innerHTML=`<img src="${im.src}" alt="">`;lb.onclick=()=>lb.remove();document.body.appendChild(lb)}
  if(e.target.closest('[data-act="rmAvatar"]'))sp("settings/avatar","");
},true);

/* ---------- boot ---------- */
applyLook();
if(!location.hash)location.hash="#today";
render();
if(matchMedia)matchMedia("(prefers-color-scheme: light)").addEventListener&&matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{if(LS.theme==="auto")applyLook()});
if(LS.syncUrl&&LS.auto)setTimeout(()=>syncNow(false),700);
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible"&&LS.syncUrl&&LS.auto&&Date.now()-LS.lastSync>60000)syncNow(false);
  if(document.visibilityState==="hidden"&&dirty){persist();if(LS.syncUrl&&LS.auto)syncNow(false)}
});
window.addEventListener("pagehide",()=>{if(dirty)persist()});
try{const n=loggedDays().length;if(n>7&&!LS.syncUrl&&(!LS.lastBackup||Date.now()-LS.lastBackup>7*864e5))setTimeout(()=>toast("It’s been a week. Download a backup or connect sync in Settings, before the hedgehog gets into the drawer."),2200)}catch(e){}
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
