"use strict";
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
  const r=R(),nm=(st.settings.name||"").trim(),mo=monthNear(todayKey());
  document.documentElement.classList.toggle("pinned",pinned());
  const nav=NAVS.map(([k,l,ic])=>`<a href="#${k}" class="${r.name===k?"on":""}" title="${l}">${ico(ic,r.name===k)}<span class="lb">${l}</span></a>`).join("");
  $("side").innerHTML=`<nav class="rail" aria-label="sections">
   <div class="rhead"><a class="av" href="#settings" title="Settings">${avatarHtml()}</a><div class="who lb"><a class="wordmark" href="#today" style="font-size:1.5rem">north star</a><small>${esc(mo.ph)} · ${esc(mo.lbl)}</small></div></div>
   <div class="rnav">${nav}</div><div class="rsep"></div>
   <div class="rq">
    <button data-act="cycleHouse" title="Accent colour"><span class="dot"></span><span class="lb">Accent</span></button>
    <button data-act="toggleTheme" class="themeBtn-w" title="Light / dark"><span class="themeBtn"></span><span class="lb">Light / dark</span></button></div>
   <div class="rfoot">
    <div class="syncline"><span class="syncdot"></span><span class="lb syncstat"></span></div>
    <button data-act="pin" title="Pin sidebar">${ico(pinned()?"push-pin-slash":"push-pin")}<span class="lb">${pinned()?"Unpin":"Pin open"}</span></button>
    <div class="rnav"><a href="#settings" class="${r.name==="settings"?"on":""}">${ico("gear-six",r.name==="settings")}<span class="lb">Settings</span></a></div>
   </div></nav>`;
  $("topbar").innerHTML=`<a class="wordmark" href="#today">north star</a><div class="tools"><span class="syncdot"></span><a class="ib" href="#archive" aria-label="Archive"><i class="ph ph-archive"></i></a><button class="ib" data-act="cycleHouse" aria-label="Accent colour"><span class="dot"></span></button><button class="ib" data-act="toggleTheme" aria-label="Light or dark"><span class="themeBtn"></span></button><a class="av" href="#settings" aria-label="Settings">${avatarHtml()}</a></div>`;
  $("tabs").innerHTML=NAVS.filter(n=>TABS.includes(n[0])).map(([k,l,ic])=>`<a href="#${k}" class="${r.name===k?"on":""}">${ico(ic,r.name===k)}${l}</a>`).join("");
}
function render(){
  const y=window.scrollY,r=R();
  chrome();applyLook();
  const fn={today:pToday,week:pWeek,month:pMonth,vision:pVision,archive:pArchive,plan:pPlan,settings:pSettings}[r.name]||pToday;
  $("main").innerHTML=fn(r.arg);
  setSyncState(syncing?"busy":syncMsg?"err":LS.lastSync?"ok":"",syncMsg);
  setSaved(mem?"not saved on this device":"");
  window.scrollTo(0,y);
  const tc=document.querySelector(".tile.cur");if(tc)tc.parentElement.scrollLeft=Math.max(0,tc.offsetLeft-20);
}
function afterRemoteChange(){
  const a=document.activeElement;
  if(!a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName)){render();toast("updated from your other device")}
}
window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0)});

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
  sp(k,t.type==="checkbox"?t.checked:t.value);save();
  if(/\/(steps|sleep|k)$/.test(k))liveUpdate();
  if((t.type==="checkbox"||t.type==="radio")&&t.dataset.re)render();
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.id==="amo"){amo=t.value;render();return}
  if(t.id==="avf"&&t.files[0]){setAvatar(t.files[0]);t.value="";return}
  if(t.id==="imp"&&t.files[0]){
    const r=new FileReader();
    r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!=="object"||!o.settings)throw 0;st=normalize(mergeState(st,normalize(o)));save();render();toast("restored (merged with what was here)")}catch(x){toast("that file doesn’t look like a backup")}};
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
   case"savePin":sp("settings/pinBoard",$("pinUrl").value.trim());save();render();if(!document.getElementById("pinjs")){const s=document.createElement("script");s.id="pinjs";s.async=true;s.src="https://assets.pinterest.com/js/pinit.js";document.body.appendChild(s)}else if(window.PinUtils)PinUtils.build();break;
   case"go":location.hash=D.h;break;
   case"tick":sp(`days/${dk}/rit/${D.id}`,true);save();render();break;
   case"goto":{const el=$(D.t);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});const f=el.querySelector("input,textarea");if(f)setTimeout(()=>f.focus({preventScroll:true}),350)}break}
   case"water":{const c=+gp(`days/${dk}/water`)||0,n=+D.n;sp(`days/${dk}/water`,c===n?n-1:n);save();render();break}
   case"rate":{const c=+gp(`days/${dk}/${D.f}`)||0,n=+D.n;sp(`days/${dk}/${D.f}`,c===n?0:n);save();render();break}
   case"markDone":{const d=st.days[dk]||(st.days[dk]={});sp(`days/${dk}/done`,!d.done);save();render();if(st.days[dk].done)toast("day closed. well done.");break}
   case"muse":st.notes.muse=Math.floor(Math.random()*MUSES.length);st.su.notes=Date.now();save();render();break;
   case"sym":sp(`days/${dk}/sym/${D.s}`,!gp(`days/${dk}/sym/${D.s}`));save();render();break;
   case"flow":sp(`days/${dk}/flow`,gp(`days/${dk}/flow`)===D.f?"":D.f);save();render();break;
   case"periodStart":if(!st.periods.some(p=>p.s===D.d)){addItem("periods",{s:D.d});if(st.settings.trackCycle===false)sp("settings/trackCycle",true);save();render();toast("period start logged")}break;
   case"periodEnd":{const open=sortedP().filter(p=>p.s<=D.d&&!p.e).pop();if(open){open.e=D.d;open._u=Date.now();save();render();toast("period end logged")}break}
   case"periodUndo":{const idx=st.periods.findIndex(p=>p.s===D.d);if(idx>=0){delItem("periods",idx);save();render()}break}
   case"periodAdd":{const v=$("pstart")&&$("pstart").value;if(!v)return toast("pick a date");if(!st.periods.some(p=>p.s===v))addItem("periods",{s:v});save();render();toast("added");break}
   case"delPeriod":delItem("periods",i);save();render();break;
   case"saveWeight":{const d=$("wd").value,w=parseFloat($("wv").value);if(!d||!isFinite(w))return toast("add a date and weight");upsertWeight(d,w);save();render();toast("weigh-in saved");break}
   case"addJob":{const c=$("jc").value.trim(),r=$("jr").value.trim();if(!c&&!r)return toast("add a company or role");addItem("jobs",{d:todayKey(),c,r,s:$("js").value});save();render();break}
   case"delJob":delItem("jobs",i);save();render();break;
   case"addSave":{const amt=parseFloat($("sa").value);if(!isFinite(amt))return toast("add an amount");addItem("savings",{d:$("sd").value||todayKey(),amt,bucket:$("sb").value,note:$("sn").value});save();render();toast("deposited");break}
   case"delSave":delItem("savings",i);save();render();break;
   case"range":trRange=+D.v;render();break;
   case"theme":LS.theme=D.v;persistLocal();applyLook();render();break;
   case"toggleTheme":LS.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";persistLocal();applyLook();break;
   case"pickHouse":LS.house=D.h;persistLocal();applyLook();render();break;
   case"cycleHouse":{const n=(HOUSES.findIndex(h=>h[0]===LS.house)+1)%HOUSES.length;LS.house=HOUSES[n][0];persistLocal();applyLook();toast("house: "+HOUSES[n][1]);if(R().name==="settings")render();break}
   case"rmAvatar":sp("settings/avatar","");save();render();break;
   case"syncSave":saveConn();toast("connection saved");break;
   case"syncNow":saveConn();await syncNow(true);if(R().name==="settings")render();break;
   case"export":{LS.lastBackup=Date.now();persistLocal();const blob=new Blob([JSON.stringify(st,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),l=document.createElement("a");l.href=u;l.download="northstar-backup-"+todayKey()+".json";l.click();URL.revokeObjectURL(u);render();break}
   case"fold":{LS.fold=LS.fold||{};LS.fold[D.id]=!LS.fold[D.id];persistLocal();const c=$(D.id);if(c)c.classList.toggle("folded",!!LS.fold[D.id]);break}
   case"custom":customOpen=!customOpen;render();break;
   case"toggleCard":LS.hide=LS.hide||{};LS.hide[D.id]=!LS.hide[D.id];persistLocal();render();break;
   case"dense":LS.dense=D.v;persistLocal();applyLook();render();break;
   case"resetLayout":LS.hide={};LS.fold={};LS.dense="cozy";persistLocal();applyLook();render();toast("layout reset");break;
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
document.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.vis&&t.files&&t.files.length){addVision([...t.files]);t.value=""}});
document.addEventListener("dragover",e=>{if(e.target.closest&&e.target.closest("#vdrop")){e.preventDefault();e.target.closest("#vdrop").classList.add("over")}});
document.addEventListener("dragleave",e=>{const d=e.target.closest&&e.target.closest("#vdrop");if(d)d.classList.remove("over")});
document.addEventListener("drop",e=>{if(e.target.closest&&e.target.closest("#vdrop")){e.preventDefault();addVision([...e.dataTransfer.files])}});
document.addEventListener("click",e=>{
  const im=e.target.closest(".masonry img");
  if(im&&im.src){const lb=document.createElement("div");lb.className="lightbox";lb.innerHTML=`<img src="${im.src}" alt="">`;lb.onclick=()=>lb.remove();document.body.appendChild(lb)}
  if(e.target.closest('[data-act="rmAvatar"]'))sp("settings/avatarId","");
},true);
new MutationObserver(()=>hydrateImgs(document)).observe(document.body,{childList:true,subtree:true});

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
try{const n=loggedDays().length;if(n>7&&!LS.syncUrl&&(!LS.lastBackup||Date.now()-LS.lastBackup>7*864e5))setTimeout(()=>toast("It’s been a week: back up or connect sync in Settings"),2200)}catch(e){}
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
hydrateImgs(document);
