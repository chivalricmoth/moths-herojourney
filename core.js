"use strict";
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
function save(){dirty=true;clearTimeout(saveT);saveT=setTimeout(persist,250);setSaved("saving…");scheduleSync()}
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
  o[ks[ks.length-1]]=v;stamp(p);
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
  document.querySelectorAll(".syncdot").forEach(e=>{e.className="syncdot "+s});
  document.querySelectorAll(".syncstat").forEach(e=>{
    e.textContent=s==="busy"?"syncing…":s==="err"?"sync problem":s==="ok"?"synced "+new Date(LS.lastSync).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):(LS.syncUrl?"not synced yet":"sync off");
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
  const o={d,rit,done:!!d.done||rit>=3,water:+d.water||0,steps:+d.steps||0,sleep:+d.sleep||0,mood:+d.mood||0,energy:+d.energy||0,kcal,mealsLogged,flow:d.flow||"",win:d.win||""};
  o.has=!!(rit||o.water||o.steps||o.sleep||o.mood||o.energy||mealsLogged||d.journal||d.win||d.grat||d.flow||d.done);
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
const PH_HUE=n=>PHASES[n].hue;

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
