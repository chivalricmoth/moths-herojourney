"use strict";
/* north star v2 — handlers, weekly R.E.P.O.R.T., month events, plan overhaul */
const wkOf=k=>`weeks/${isoWeek(k)}`;
const REP=[["R","Reading","a photo of what you’re reading, or a line you loved from this month’s book","reading"],["E","Eating","a favourite meal, snack or coffee from the week","eating"],["P","Playing","a hobby, game, activity or event you took part in","playing"],["O","Obsessing","what you can’t stop thinking about, listening to or watching","obsessing"],["R","Recommending","a product, show, spot or tip to pass on or save for posterity","recommending"],["T","Treating","something special you did or bought to pamper yourself","treating"]];
const picSrc=v=>/^https?:/.test(v)?`<img src="${esc(v)}" alt="" referrerpolicy="no-referrer" loading="lazy">`:`<img data-img="${esc(v)}" alt="">`;
function repHtml(w,mid){
  const rc=typeof RECS!=="undefined"&&RECS[mid];
  return `<div class="card" data-w="2"><h3><i class="ph ph-newspaper"></i>Weekly R.E.P.O.R.T.<span class="r">the week in six snapshots</span></h3><div class="rep">${REP.map(([L,n,why],i)=>{const k=`${w}/rep/${i}`,im=gp(k+"/i");
   return `<div class="it2"><div class="L"><b>${L}</b><span>${n}</span></div><div class="why">${why}${i===0&&rc?` · this month: ${esc(rc.fic)}`:""}</div>
   <div class="ph-box ${im?"has":""}">${im?picSrc(im):""}<div class="btns"><label class="btn sm"><i class="ph ph-image"></i>${im?"Change":"Add photo"}<input type="file" accept="image/*" data-rep="${k}/i" class="hide"></label><button class="btn sm" data-act="repLink" data-k="${k}/i"><i class="ph ph-link"></i>Link</button>${im?`<button class="btn sm" data-act="repClr" data-k="${k}/i" aria-label="Remove"><i class="ph ph-x"></i></button>`:""}</div></div>
   ${area(k+"/t",i===0?"a line, a moment, a page number…":"a sentence or two…",2)}</div>`}).join("")}</div></div>`;
}
const _w2=pWeek;
pWeek=function(arg){
  const k=DATE_RE.test(arg)?arg:todayKey(),days=weekDays(k),doc=new DOMParser().parseFromString(`<body>${_w2(arg)}</body>`,"text/html"),col=doc.querySelectorAll(".cols .col")[1];
  if(col)col.insertAdjacentHTML("afterbegin",repHtml(wkOf(days[0]),days[0].slice(0,7)));
  return doc.body.innerHTML;
};
const evOf=id=>Array.isArray(gp(`months/${id}/ev`))?gp(`months/${id}/ev`):[];
const gcUrl=e=>`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.t)}&dates=${e.d.replace(/-/g,"")}/${addDays(e.d,1).replace(/-/g,"")}`;
const gcEmbed=()=>{const v=(st.settings.gcalEmbed||"").trim();if(!v)return"";const s=/^https?:/.test(v)?v:`https://calendar.google.com/calendar/embed?mode=AGENDA&src=${encodeURIComponent(v)}`;return /^https:\/\/calendar\.google\.com\//.test(s)?`<iframe class="gcal" src="${esc(s)}" loading="lazy"></iframe>`:""};
const _m2=pMonth;
pMonth=function(arg){
  const id=MON_RE.test(arg)?arg:mkey(new Date()),doc=new DOMParser().parseFromString(`<body>${_m2(arg)}</body>`,"text/html"),col=doc.querySelector(".cols .col");
  const L=evOf(id).slice().sort((a,b)=>a.d.localeCompare(b.d)),td=todayKey();
  if(col)col.insertAdjacentHTML("beforeend",`<div class="card"><h3><i class="ph ph-bell"></i>Events &amp; reminders<span class="r num">${L.length}</span></h3>
   <div class="row"><div style="flex:0 0 150px"><input type="date" id="evD" value="${td.startsWith(id)?td:id+"-01"}"></div><div style="flex:2 1 160px"><input type="text" id="evT" placeholder="what’s happening?"></div><button class="btn solid sm" data-act="evAdd" data-m="${id}">Add</button></div>
   <div style="margin-top:8px">${L.length?L.map(e=>`<div class="ev ${e.d<td?"past":""}"><div class="dt"><b>${parse(e.d).getDate()}</b><small>${esc(short(e.d).split(" ")[0])}</small></div><div>${esc(e.t)}</div><div class="acts"><a class="btn sm ghost" href="${gcUrl(e)}" target="_blank" rel="noopener" title="Add to Google Calendar"><i class="ph ph-calendar-plus"></i></a><button class="btn sm ghost" data-act="evDel" data-m="${id}" data-id="${esc(e.id)}" aria-label="Delete"><i class="ph ph-trash"></i></button></div></div>`).join(""):`<p class="small muted">nothing yet. add appointments, deadlines, birthdays.</p>`}</div>
   <details style="margin-top:10px"><summary><span class="ml" style="font-size:.85rem">Show my Google Calendar</span></summary><div class="mbody"><input type="text" ${B("settings/gcalEmbed")} value="${esc(st.settings.gcalEmbed||"")}" data-re="1" placeholder="calendar email, or the embed link"><p class="small muted" style="margin-top:6px">Google Calendar → Settings → your calendar → “Integrate calendar” → paste the embed link. Only works for calendars you’ve made public. The calendar icon beside each event adds it to Google Calendar.</p>${gcEmbed()}</div></details></div>`);
  return doc.body.innerHTML;
};
/* ---------- plan overhaul ---------- */
const _pPlan=pPlan;
pPlan=function(arg){
  const tabsK=[["roadmap","Roadmap"],["map","Why &amp; identity"],["tracks","Tracks"],["toolkit","Toolkit"],["atelier","Atelier"]],t=tabsK.some(x=>x[0]===arg)?arg:"roadmap";
  if(t!=="roadmap")return _pPlan(arg);
  const tabs=`<div class="subtabs">${tabsK.map(([k,l])=>`<button class="${t===k?"on":""}" data-act="go" data-h="#plan/${k}">${l}</button>`).join("")}</div>`;
  const now=monthNear(todayKey()),nowId=now.id,s0=parse("2026-11-01"),e0=parse("2027-12-31"),pct=Math.max(0,Math.min(100,Math.round((parse(todayKey())-s0)/(e0-s0)*100)));
  const done=m=>m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length,tot=M.reduce((a,m)=>a+m.ms.length,0),dn=M.reduce((a,m)=>a+done(m),0);
  const tl=M.map(m=>{const n=done(m);return `<a class="tile ${m.id===nowId?"cur":m.id<nowId?"past":""}" href="#month/${m.id}"><span class="k">${esc(m.ph)}</span><b>${esc(m.lbl)}</b>${bar(n,m.ms.length)}<span class="n">${n}/${m.ms.length} milestones${m.lost?` · −${m.lost} lbs`:""}</span><small>${esc(m.line)}</small></a>`}).join("");
  const qi=Math.floor((new Date().getMonth())/3);
  const qs=QUARTERS.map((q,i)=>`<div class="q ${i===qi&&todayKey()>="2027-01"?"cur":""}"><span class="k small muted">${q[0]} · ${q[1]}</span><div class="big">${q[2]}</div><p>${esc(q[3])}</p></div>`).join("");
  const cs=(k,A)=>A.filter((_,i)=>gp(`checks/${k}/${i}`)).length;
  const trk=[["car","Car","car",cs("car",CAR_STEPS),CAR_STEPS.length],["job","Job","briefcase",cs("job",JOB_STEPS),JOB_STEPS.length],["health","Health & benefits","heartbeat",cs("health",HEALTH_STEPS),HEALTH_STEPS.length]].map(([k,l,i,n,g])=>`<a class="trk2" href="#plan/tracks"><i class="ph ph-${i}"></i><b>${l}</b><span class="small muted">${n}/${g} steps</span>${bar(n,g)}</a>`).join("");
  const cur=M.find(m=>m.id===nowId);
  return head("Plan","the map, the milestones, the next step")+tabs+
   `<div class="cols c2"><div class="col"><div class="card tint" data-w="3"><div class="hero"><div><div class="small muted" style="margin-bottom:6px">identity</div><p class="quote">“at my core, i am a maker of meaning. i am here to tell stories that matter, to end the harmful cycles before me, to break curses, and to be happy and joyful.”</p></div><div class="bigring" style="--p:${pct}"><b>${pct}%<small>of the plan<br>elapsed</small></b></div></div><div class="chips" style="margin-top:12px"><span class="chip on">${esc(now.ph)}</span><span class="chip">${dn}/${tot} milestones done</span></div></div>
   <div class="card" data-w="3"><h3><i class="ph ph-path"></i>Roadmap<span class="r">nov 2026 → dec 2027</span></h3><div class="tl">${tl}</div></div>
   ${cur?`<div class="card"><h3><i class="ph ph-flag"></i>This month<span class="r">${esc(cur.lbl)}</span></h3><p class="lede" style="margin-bottom:8px">${esc(cur.line)}</p>${cur.ms.map((x,i)=>chk(`months/${cur.id}/ms/${i}`,esc(x),"",true)).join("")}<a class="btn sm" style="margin-top:10px" href="#month/${cur.id}">Open month →</a></div>`:""}
   <div class="card"><h3><i class="ph ph-compass"></i>Tracks</h3><div class="trks" style="grid-template-columns:1fr">${trk}</div></div>
   <div class="card" data-w="3"><h3><i class="ph ph-map-trifold"></i>Quarters</h3><div class="qs">${qs}</div></div></div></div>`+
   `<script>0</script>`.replace(/<script>0<\/script>/,"");
};
new MutationObserver(()=>{const c=document.querySelector(".tile.cur");if(c&&!c.dataset.s){c.dataset.s=1;c.parentElement.scrollLeft=c.offsetLeft-20}}).observe(document.getElementById("main"),{childList:true,subtree:true});
/* ---------- handlers ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,D=b.dataset,dk=curDay();
  if(a==="feel"){sp(`days/${dk}/feel/${D.f}`,!gp(`days/${dk}/feel/${D.f}`));save();render()}
  else if(a==="pinAdd"){const u=($("pinU").value||"").trim();if(!/^https?:\/\//.test(u))return toast("paste an image link starting with https://");sp("notes/pins",pinsOf().concat({id:uid(),u,c:($("pinC").value||"").trim()}));save();render();toast("pinned")}
  else if(a==="pinDel"){sp("notes/pins",pinsOf().filter(p=>p.id!==D.id));save();render()}
  else if(a==="repLink"){const u=prompt("Image link (https://…)");if(u&&/^https?:\/\//.test(u)){sp(D.k,u.trim());save();render()}}
  else if(a==="repClr"){sp(D.k,"");save();render()}
  else if(a==="evAdd"){const d=$("evD").value,t=$("evT").value.trim();if(!d||!t)return toast("add a date and a note");sp(`months/${D.m}/ev`,evOf(D.m).concat({id:uid(),d,t}));save();render()}
  else if(a==="evDel"){sp(`months/${D.m}/ev`,evOf(D.m).filter(x=>x.id!==D.id));save();render()}
});
document.addEventListener("change",async e=>{
  const t=e.target;if(!t.dataset||!t.dataset.rep||!t.files[0])return;
  try{const id=await IMG.addFile(t.files[0],900,.8);sp(t.dataset.rep,id);save();render()}catch(x){toast("couldn’t read that image")}
});
