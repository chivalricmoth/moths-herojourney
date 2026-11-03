"use strict";
/* ============================================================
   north star — pages
   ============================================================ */
const DATE_RE=/^\d{4}-\d\d-\d\d$/, MON_RE=/^\d{4}-\d\d$/;
const R=()=>{const h=location.hash.replace("#","").split("/");return{name:h[0]||"today",arg:h[1]||"",arg2:h[2]||""}};
const MOODS=["","low","meh","okay","good","bright"], ENERGY=["","drained","low","steady","good","charged"];
const SYMPTOMS=[["cramps","Cramps"],["headache","Headache"],["bloat","Bloated"],["tired","Tired"],["moody","Moody"],["cravings","Cravings"],["tender","Tender"],["acne","Breakouts"],["great","Great energy"]];
const FLOWS=[["spot","Spotting"],["light","Light"],["med","Medium"],["heavy","Heavy"]];
const MEALS=[["b","Breakfast"],["l","Lunch"],["d","Dinner"],["s","Snacks"]];
let aq="",amo="",trRange=90;

function avatarHtml(cls=""){
  const a=st.settings.avatar,n=(st.settings.name||"").trim();
  return `<div class="av ${cls}">${a?`<img src="${a}" alt="">`:esc(n?n[0].toUpperCase():"")||'<i class="ph-fill ph-sparkle"></i>'}</div>`;
}
const head=(t,sub,acts="")=>`<div class="pgh"><div><h1>${t}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div><div class="acts">${acts}</div></div>`;
const chip=(t,on)=>`<span class="chip ${on?"on":""}">${t}</span>`;

/* ============================================================ TODAY */
function pToday(arg){
  const dk=DATE_RE.test(arg)?arg:todayKey(),isToday=dk===todayKey();
  const m=monthNear(dk),d=st.days[dk]||{},S=dayStats(dk);
  const tier=d.tier||"lantern",ti=TIERS.findIndex(t=>t[0]===tier);
  const dayN=Math.floor((parse(dk)-new Date(parse(dk).getFullYear(),0,0))/864e5);
  const mantra=MANTRAS[dayN%MANTRAS.length];
  const rits=RIT.filter(r=>r.t<=ti);
  const wg=+st.settings.waterGoal||8,sg=stepGoalFor(dk),calG=+st.settings.calGoal||0;
  const ci=cycleInfo(dk),muse=MUSES[(st.notes.muse||0)%MUSES.length];
  const hr=new Date().getHours(),greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
  const nm=(st.settings.name||"").trim();

  /* guided steps */
  const steps=rits.map(r=>({k:"rit",id:r.id,t:r.l,s:r.s,done:!!gp(`days/${dk}/rit/${r.id}`)}));
  if(ti>=1){
    steps.push({k:"go",t:"Log what you ate",s:"Awareness, not judgment.",done:S.mealsLogged,to:"meals"});
  }
  steps.push({k:"go",t:"Check in: energy and mood",s:"Two taps.",done:!!(S.mood&&S.energy),to:"mood"});
  if(ti>=1){
    steps.push({k:"go",t:"Write one win",s:"Small counts.",done:!!d.win,to:"journal"});
    steps.push({k:"go",t:"Name tomorrow’s first step",s:"The very first physical action.",done:!!d.tomorrow,to:"journal"});
  }
  steps.push({k:"close",t:"Close the day",s:"You showed up. That’s the whole job.",done:!!d.done});
  const next=steps.find(x=>!x.done),doneN=steps.filter(x=>x.done).length,pct=Math.round(doneN/steps.length*100);

  const nowBtn=!next?"":next.k==="rit"?`<button class="btn solid" data-act="tick" data-id="${next.id}">Done ✓</button>`:next.k==="close"?`<button class="btn solid" data-act="markDone">Close the day</button>`:`<button class="btn solid" data-act="goto" data-t="${next.to}">Go →</button>`;
  const nowCard=`<div class="card nowcard" data-o="1"><div><div class="k">${next?"Next up":"All done"}</div><div class="t">${next?esc(next.t):"Rest well. You showed up today."}</div><div class="muted small">${next?esc(next.s):esc(mantra)}</div><div style="margin-top:10px">${nowBtn}</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div></div>`;

  const lightCard=`<div class="card" data-o="4"><h3>Pick your light</h3><div class="light">${TIERS.map(t=>`<label><input type="radio" name="tier" ${B(`days/${dk}/tier`)} value="${t[0]}" data-re="1" ${tier===t[0]?"checked":""}>${t[1]}</label>`).join("")}</div><div class="tierhint">${esc(TIERS[ti][2])}</div></div>`;

  const ritCard=`<div class="card" data-o="5"><h3>Rituals <span class="r">${steps.filter(x=>x.k==="rit"&&x.done).length} of ${rits.length}</span></h3>${GROUPS.map(g=>{const rs=rits.filter(r=>r.g===g[0]);if(!rs.length)return"";const n=rs.filter(r=>gp(`days/${dk}/rit/${r.id}`)).length;return`<div class="grp"><h4>${g[1]}<span class="small muted" style="font-family:var(--sans);font-style:normal">${n}/${rs.length}</span></h4>${rs.map(r=>chk(`days/${dk}/rit/${r.id}`,r.l,r.s,true)).join("")}</div>`}).join("")}<div class="note" style="margin-top:12px">Never zero twice. Three rituals ticked counts as a day you showed up.</div></div>`;

  const needleCard=`<div class="card" data-o="8"><h3>Needle-movers <span class="r">${esc(m.lbl)}</span></h3>${["Weight","Car","Job"].map((n,i)=>`<div style="margin-bottom:12px"><div class="small muted" style="margin-bottom:4px"><b>${n}</b> · ${esc(m.f[i])}</div><div class="inl"><input type="checkbox" ${B(`days/${dk}/t3d${i}`)} ${gp(`days/${dk}/t3d${i}`)?"checked":""} aria-label="${n} done">${txt(`days/${dk}/t3/${i}`,"Smallest next step?")}</div></div>`).join("")}</div>`;

  const waterCard=`<div class="card" id="water" data-o="2"><h3>Water <span class="r num">${S.water} / ${wg} glasses</span></h3><div class="water">${Array.from({length:Math.max(wg,S.water)},(_,i)=>`<button class="${i<S.water?"on":""}" data-act="water" data-n="${i+1}" aria-label="${i+1} glasses"></button>`).join("")}</div>${bar(S.water,wg)}</div>`;

  const mealsCard=`<div class="card" id="meals" data-o="6"><h3>Meals <span class="r num" id="kcalTot">${S.kcal?S.kcal.toLocaleString()+" kcal":"–"}${calG?" / "+calG.toLocaleString():""}</span></h3>${MEALS.map(([id,l])=>`<div class="meal"><b>${l}</b><input type="text" ${B(`days/${dk}/meals/${id}/t`)} value="${esc(gp(`days/${dk}/meals/${id}/t`))}" placeholder="what you had" aria-label="${l}"><input type="number" inputmode="numeric" ${B(`days/${dk}/meals/${id}/k`)} value="${esc(gp(`days/${dk}/meals/${id}/k`))}" placeholder="kcal" aria-label="${l} calories"></div>`).join("")}<div class="small muted" style="margin-top:8px">Awareness, not judgment. Add before you subtract; the 10% is allowed.</div></div>`;

  const moveCard=`<div class="card" data-o="7"><h3>Move &amp; sleep</h3><div class="row"><div><label class="f" style="margin-top:0">Steps · goal ${sg.toLocaleString()}</label>${numIn(`days/${dk}/steps`,"0")}<div id="stepsBar">${bar(S.steps,sg)}</div></div><div><label class="f" style="margin-top:0">Sleep (hours)</label>${numIn(`days/${dk}/sleep`,"0",'step=".5"')}<div id="sleepBar">${bar(S.sleep,8)}</div></div></div></div>`;

  const rate=(f,v)=>`<div class="tap">${[1,2,3,4,5].map(n=>`<button class="${v===n?"on":""}" data-act="rate" data-f="${f}" data-n="${n}" aria-label="${f} ${n}">${n}</button>`).join("")}</div>`;
  const moodCard=`<div class="card" id="mood" data-o="3"><h3>Check-in</h3><label class="f" style="margin-top:0">Energy <span class="muted">${ENERGY[S.energy]||""}</span></label>${rate("energy",S.energy)}<label class="f">Mood <span class="muted">${MOODS[S.mood]||""}</span></label>${rate("mood",S.mood)}</div>`;

  /* cycle */
  let cycleCard;
  const onP=periodOn(dk);
  const pBtns=[];
  if(isToday||dk<=todayKey()){
    if(!onP)pBtns.push(`<button class="btn sm" data-act="periodStart" data-d="${dk}">Period started</button>`);
    if(onP&&!onP.e)pBtns.push(`<button class="btn sm" data-act="periodEnd" data-d="${dk}">Period ended</button>`);
    if(st.periods.find(p=>p.s===dk))pBtns.push(`<button class="btn sm ghost" data-act="periodUndo" data-d="${dk}">Undo start</button>`);
  }
  const symHtml=`<label class="f">Body</label><div class="chips">${SYMPTOMS.map(([k,l])=>`<button class="chip ${gp(`days/${dk}/sym/${k}`)?"on":""}" data-act="sym" data-s="${k}">${l}</button>`).join("")}</div>`;
  const flowHtml=(onP||d.flow)?`<label class="f">Flow</label><div class="chips">${FLOWS.map(([k,l])=>`<button class="chip ${d.flow===k?"on":""}" data-act="flow" data-f="${k}">${l}</button>`).join("")}</div>`:"";
  if(st.settings.trackCycle===false){cycleCard=""}
  else if(ci){
    const P=PHASES[ci.ph],tip=P.tips[(dayN+ci.day)%P.tips.length],nx=nextPeriod();
    cycleCard=`<div class="card tint" data-o="9"><h3>Cycle <span class="r">day ${ci.day} of ~${ci.len}${ci.pred?" · est.":""}</span></h3><div class="chips" style="margin-bottom:8px"><span class="chip phase" style="--ph:${P.hue}">${P.name} phase</span>${ci.overdue?`<span class="chip">period may be due</span>`:""}</div><p class="small muted" style="margin-bottom:8px">${esc(P.blurb)}</p><p class="tip">${esc(tip)}</p>${nx?`<p class="small muted" style="margin-top:8px">Next period around ${md(nx)} (${daysBetween(todayKey(),nx)} days).</p>`:""}<div class="chips" style="margin-top:10px">${pBtns.join("")}</div>${flowHtml}${symHtml}</div>`;
  }else{
    cycleCard=`<div class="card tint" data-o="9"><h3>Cycle</h3><p class="small muted">Log the first day of your last period and the app will estimate your phase and offer a daily tip that fits.</p><div class="inl" style="margin-top:10px"><input type="date" id="pstart" value="${dk}" max="${todayKey()}"><button class="btn solid sm" data-act="periodAdd">Save</button></div><p class="small muted" style="margin-top:8px">Or turn cycle tracking off in Settings.</p></div>`;
  }

  const journalCard=`<div class="card" id="journal" data-o="10"><h3>Journal</h3>${area(`days/${dk}/journal`,"Write until the thought is out of your head…",4)}<label class="f">One win</label>${txt(`days/${dk}/win`)}<label class="f">Grateful for</label>${txt(`days/${dk}/grat`)}<label class="f">Tomorrow’s first step</label>${txt(`days/${dk}/tomorrow`,"The very first physical action")}</div>`;
  const museCard=`<div class="card" data-o="11"><h3>Muse of the day <button class="tx" data-act="muse">another</button></h3><div class="serif" style="font-size:1.25rem;line-height:1.2">${esc(muse[0])}</div><div class="small muted" style="margin:2px 0 6px"><i>${esc(muse[1])}</i></div><p class="small">${esc(muse[2])}</p></div>`;
  const closeCard=`<div class="card" data-o="12"><h3>Close the day</h3><button class="btn ${d.done?"":"solid"}" data-act="markDone" style="width:100%">${d.done?"✓ Day closed (tap to reopen)":"Close the day"}</button><label class="f">Reward I’m taking</label>${txt(`days/${dk}/reward`,"tea, bath, a chapter, a movie")}<p class="small muted" style="margin-top:10px">Days shown up in ${esc(monthLabel(dk.slice(0,7)))}: <b class="num">${monthDone(dk.slice(0,7))}</b></p></div>`;

  const nav=`<button class="btn sm" data-act="go" data-h="#today/${addDays(dk,-1)}" aria-label="previous day">←</button>${isToday?"":`<button class="btn sm" data-act="go" data-h="#today">Today</button>`}<button class="btn sm" data-act="go" data-h="#today/${addDays(dk,1)}" aria-label="next day">→</button>`;
  const phChip=ci?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}">${PHASES[ci.ph].name}</span>`:"";
  return head(isToday?(nm?`${greet}, ${esc(nm)}`:"Today"):short(dk),`${esc(pretty(dk))} · <span class="serif" style="font-size:1rem">${esc(m.ph)}</span> ${phChip}`,nav)+
   `<p class="lede" style="margin:-4px 0 14px;max-width:70ch">${esc(m.line)}</p>`+
   `<div class="cols c3"><div class="col">${nowCard}${lightCard}${ritCard}</div><div class="col">${waterCard}${mealsCard}${moveCard}${moodCard}${needleCard}</div><div class="col">${cycleCard}${journalCard}${museCard}${closeCard}</div></div>`;
}
function monthDone(mk){let n=0;Object.keys(st.days).forEach(k=>{if(k.startsWith(mk)&&dayStats(k).done)n++});return n}

/* ============================================================ WEEK */
function barsHtml(vals,labels,goal,fmt=r0){
  const mx=Math.max(goal||0,...vals,1);
  return `<div class="mini-bars">${vals.map((v,i)=>`<div title="${esc(labels[i])}: ${fmt(v)}"><i class="${goal&&v>=goal?"goal":""}" style="height:${v?Math.max(4,v/mx*100):2}%;${v?"":"opacity:.25"}"></i>${labels[i]}</div>`).join("")}</div>`;
}
function pWeek(arg){
  const k=DATE_RE.test(arg)?arg:todayKey(),days=weekDays(k),wk=isoWeek(k),w=`weeks/${wk}`;
  const S=days.map(dayStats),L=["M","T","W","T","F","S","S"];
  const wg=+st.settings.waterGoal||8,sgs=days.map(stepGoalFor);
  const logged=S.filter(s=>s.has);
  const aSteps=avg(S.filter(s=>s.steps).map(s=>s.steps)),aSleep=avg(S.filter(s=>s.sleep).map(s=>s.sleep)),aWater=avg(S.filter(s=>s.water).map(s=>s.water));
  const aMood=avg(S.filter(s=>s.mood).map(s=>s.mood)),aEn=avg(S.filter(s=>s.energy).map(s=>s.energy)),aKcal=avg(S.filter(s=>s.kcal).map(s=>s.kcal));
  const showed=S.filter(s=>s.done).length;
  const strip=days.map((dk,i)=>{const s=S[i],ci=cycleInfo(dk);return`<a class="day ${dk===todayKey()?"today":""}" href="#today/${dk}" ${ci?`style="background:hsl(${PHASES[ci.ph].hue} 40% 50%/.12)"`:""}><b>${L[i]}</b><div class="d num">${parse(dk).getDate()}</div><div class="pips"><i class="pip ${s.done?"on":""}"></i><i class="pip ${s.water>=wg?"on":""}"></i><i class="pip ${s.steps>=sgs[i]?"on":""}"></i><i class="pip ${s.mealsLogged?"on":""}"></i></div></a>`}).join("");
  const sw=startW(),ww=weekWeight(k),ws=weightsSorted(),last=ws.length?ws[ws.length-1]:null,prev=ww?ws.filter(x=>x.d<ww.d).pop():null;
  const goal=+st.settings.goal||80;
  const defD=todayKey()>=days[0]&&todayKey()<=days[6]?todayKey():days[6];
  const wCard=`<div class="card"><h3>Weekly weigh-in <span class="r">${wk}</span></h3><div class="row"><div><label class="f" style="margin-top:0">Date</label><input type="date" id="wd" value="${ww?ww.d:defD}"></div><div><label class="f" style="margin-top:0">Weight (lbs)</label><input type="number" step=".1" inputmode="decimal" id="wv" value="${ww?ww.w:""}" placeholder="${last?last.w:""}"></div><button class="btn solid" data-act="saveWeight">${ww?"Update":"Log"}</button></div><p class="small muted" style="margin-top:10px">${ww?`This week: <b class="num">${ww.w}</b>${prev?` · ${(ww.w-prev.w)>0?"+":""}${r1(ww.w-prev.w)} vs last weigh-in`:""}`:"Same day, same time, one number. The trend matters, not the day."}${sw&&last?` · Start ${sw} → now ${last.w} · ${r1(sw-last.w)} of ${goal} lost`:""}</p>${ws.length>1?chartLine([{pts:ws.slice(-14).map(x=>({t:parse(x.d).getTime(),v:+x.w}))}],{h:150,label:"weight"}):""}</div>`;
  const stat=(t,v,sub)=>`<div class="card"><h3>${t}</h3><div class="stat num">${v}</div><div class="small muted">${sub}</div></div>`;
  const stats=`<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${stat("Showed up",showed+"<small> / 7 days</small>",`${logged.length} days logged`)}${stat("Avg steps",r0(aSteps),`goal ${r0(avg(sgs))}`)}${stat("Avg sleep",r1(aSleep)+"<small> h</small>","per logged night")}${stat("Avg water",r1(aWater)+"<small> gl</small>",`goal ${wg}`)}${stat("Energy / mood",`${r1(aEn)} / ${r1(aMood)}`,"out of 5")}${stat("Avg intake",aKcal?r0(aKcal)+"<small> kcal</small>":"–","on days logged")}</div>`;
  const charts=`<div class="card"><h3>Steps</h3>${barsHtml(S.map(s=>s.steps),L,avg(sgs))}<h3 style="margin-top:14px">Water</h3>${barsHtml(S.map(s=>s.water),L,wg)}<h3 style="margin-top:14px">Sleep</h3>${barsHtml(S.map(s=>s.sleep),L,8,r1)}<h3 style="margin-top:14px">Mood &amp; energy</h3>${barsHtml(S.map(s=>s.mood),L,0,r1)}${barsHtml(S.map(s=>s.energy),L,0,r1)}<div class="small muted" style="margin-top:6px">top row mood, bottom row energy · green = goal met</div></div>`;
  const review=`<div class="card"><h3>Last week, honestly</h3><label class="f" style="margin-top:0">Three wins</label>${txt(w+"/win1")}<div style="height:6px"></div>${txt(w+"/win2")}<div style="height:6px"></div>${txt(w+"/win3")}<label class="f">What slid?</label>${txt(w+"/slid")}<label class="f">What I learned about my energy</label>${txt(w+"/energy")}<div class="row"><div><label class="f">Strength sessions</label>${numIn(w+"/lifts","0")}</div><div><label class="f">Applications</label>${numIn(w+"/apps","0")}</div><div><label class="f">Driving minutes</label>${numIn(w+"/drive","0")}</div></div></div>`;
  const nextW=`<div class="card"><h3>Next week</h3><label class="f" style="margin-top:0">Weight: one move</label>${txt(w+"/nw")}<label class="f">Car: one move</label>${txt(w+"/nc")}<label class="f">Job: one move</label>${txt(w+"/nj")}<label class="f">Movie night pick</label>${txt(w+"/movie")}<label class="f">Small adventure</label>${txt(w+"/adv")}<label class="f">One adjustment (smaller, not harder)</label>${txt(w+"/adj")}<label class="f">Reward for showing up</label>${txt(w+"/rw")}</div>`;
  const rhythm=`<div class="card"><h3>The weekly rhythm</h3>${ul(["<b>Mon · Plan:</b> write next week’s three needle-movers.","<b>Tue–Thu · Build:</b> applications, driving, strength, calls.","<b>Fri · Review:</b> fill the review. What worked? What slid?","<b>Sat–Sun · Adventure + movie:</b> one small adventure, a reset hour."])}<div class="note" style="margin-top:10px">Missed the review? Write “one win, one adjustment” and move on.</div></div>`;
  const nav=`<button class="btn sm" data-act="go" data-h="#week/${addDays(days[0],-7)}">←</button><button class="btn sm" data-act="go" data-h="#week">This week</button><button class="btn sm" data-act="go" data-h="#week/${addDays(days[0],7)}">→</button>`;
  return head("Week",`${md(days[0])} – ${md(days[6])}, ${parse(days[6]).getFullYear()}`,nav)+
   `<div class="wk" style="margin-bottom:14px">${strip}</div><div class="legend" style="margin:-6px 0 14px"><span style="--lc:var(--acc)">rituals · water · steps · food logged (dots, in order)</span></div>`+
   `<div class="cols c2"><div class="col">${wCard}${charts}${rhythm}</div><div class="col">${stats}${review}${nextW}</div></div>`;
}

/* ============================================================ MONTH */
function pMonth(arg){
  const id=MON_RE.test(arg)?arg:mkey(new Date()),m=M.find(x=>x.id===id),first=id+"-01";
  const nxt=addMonths(id,1),endK=addDays(nxt+"-01",-1),nDays=parse(endK).getDate();
  const keys=Array.from({length:nDays},(_,i)=>id+"-"+p2(i+1)),S=keys.map(dayStats);
  const wg=+st.settings.waterGoal||8;
  let start=monday(first);const cells=[];
  while(cells.length<42){cells.push(start);start=addDays(start,1)}
  if(cells.slice(35).every(k=>k.slice(0,7)!==id))cells.length=35;
  const cal=["M","T","W","T","F","S","S"].map(x=>`<div class="h">${x}</div>`).join("")+cells.map(k=>{
    const out=k.slice(0,7)!==id,s=dayStats(k),ci=cycleInfo(k),onP=!!periodOn(k);
    const dots=(s.done?`<i></i>`:"")+(s.water>=wg?`<i class="w"></i>`:"")+(s.mealsLogged?`<i class="f"></i>`:"");
    return`<a class="c ${out?"out":""} ${k===todayKey()?"today":""} ${ci?"ph":""} ${ci&&ci.pred?"pred":""}" ${ci?`style="--ph:${PHASES[ci.ph].hue}"`:""} href="#today/${k}" aria-label="${short(k)}"><span class="n num">${parse(k).getDate()}${onP&&!ci?"":""}</span><span class="m">${dots}</span></a>`}).join("");
  const calCard=`<div class="card"><h3>Calendar</h3><div class="cal">${cal}</div><div class="legend"><span style="--lc:var(--acc)">showed up</span><span style="--lc:hsl(200 50% 55%)">water goal</span><span style="--lc:var(--warn)">food logged</span>${st.settings.trackCycle!==false?Object.values(PHASES).map(p=>`<span style="--lc:hsl(${p.hue} 40% 55%)">${p.name.toLowerCase()}</span>`).join(""):""}</div></div>`;
  const showed=S.filter(s=>s.done).length;
  const stat=(t,v,sub)=>`<div class="card"><h3>${t}</h3><div class="stat num">${v}</div><div class="small muted">${sub}</div></div>`;
  const ws=weightsSorted().filter(x=>x.d.startsWith(id));
  const wch=ws.length>1?ws[ws.length-1].w-ws[0].w:null;
  const stats=`<div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${stat("Showed up",showed+"<small> / "+nDays+"</small>","days")}${stat("Avg steps",r0(avg(S.filter(s=>s.steps).map(s=>s.steps))),"logged days")}${stat("Avg sleep",r1(avg(S.filter(s=>s.sleep).map(s=>s.sleep)))+"<small> h</small>","logged nights")}${stat("Avg water",r1(avg(S.filter(s=>s.water).map(s=>s.water)))+"<small> gl</small>",`goal ${wg}`)}${stat("Energy / mood",`${r1(avg(S.filter(s=>s.energy).map(s=>s.energy)))} / ${r1(avg(S.filter(s=>s.mood).map(s=>s.mood)))}`,"out of 5")}${stat("Weight",ws.length?ws[ws.length-1].w:"–",wch!=null?`${wch>0?"+":""}${r1(wch)} this month · ${ws.length} weigh-ins`:`${ws.length} weigh-in`)}</div>`;
  const pl=planLine(),wsAll=weightsSorted();
  const series=[{name:"you",pts:wsAll.map(x=>({t:parse(x.d).getTime(),v:+x.w}))}];if(pl)series.push({name:"gentle pace",pts:pl,dash:1});
  const wCard=`<div class="card"><h3>Weight vs gentle pace</h3>${chartLine(series,{h:200,label:"weight over time"})}${legend(series.map((s,i)=>({name:s.name,c:i?"var(--t55)":"var(--accT)"})))}${startW()?"":`<p class="small muted">Log a weigh-in on the Week page to start the chart.</p>`}</div>`;
  const per=sortedP().filter(p=>p.s.startsWith(id)),nx=nextPeriod();
  const cycCard=st.settings.trackCycle===false?"":`<div class="card tint"><h3>Cycle this month</h3>${per.length?`<p class="small">Period started ${per.map(p=>md(p.s)).join(", ")}.</p>`:`<p class="small muted">No period start logged this month.</p>`}<p class="small muted" style="margin-top:6px">Average cycle ~${cycleLen()} days${nx?` · next expected around ${md(nx)}`:""}.</p></div>`;
  let plan="";
  if(m){
    const n=m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length;
    plan=`<div class="card"><h3>${esc(m.ph)} · ${esc(m.lbl)} <span class="r num">${n}/${m.ms.length} milestones</span></h3><p class="lede" style="margin-bottom:10px">${esc(m.line)}</p>${bar(n,m.ms.length)}<div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:12px" id="focus3">${["Weight","Car","Job"].map((x,i)=>`<div><div class="small muted"><b>focus · ${x}</b></div><p class="small">${esc(m.f[i])}</p></div>`).join("")}</div></div>`+
    `<div class="card"><h3>Milestones <span class="r">${m.lost?`pace −${m.lost} lbs`:"baseline"}</span></h3>${m.ms.map((x,i)=>chk(`months/${m.id}/ms/${i}`,esc(x),"",true)).join("")}</div>`+
    `<div class="card"><h3>The month in detail</h3>${Object.entries(m.sec).map(([k,v],i)=>`<details ${i===0?"open":""}><summary><span class="ml" style="font-size:1.1rem">${k}</span></summary><div class="mbody">${ul(v.map(esc))}</div></details>`).join("")}</div>`+
    `<div class="card"><h3>Books · film · reward</h3><p class="small"><b>Fiction</b> ${esc(m.fic)}<br><b>Nonfiction</b> ${esc(m.non)}<br><b>Movie night</b> ${esc(m.film)}</p>${ul(m.rw.map(esc))}<div class="note" style="margin-top:10px"><b>If this month slides:</b> ${esc(m.slip)}</div></div>`;
  }else plan=`<div class="card"><h3>Plan</h3><p class="small muted">The written plan runs November 2026 – December 2027. Trackers and notes still work here.</p></div>`;
  const notes=`<div class="card"><h3>Notes for ${esc(monthLabel(id))}</h3>${area(`months/${id}/note`,"What happened? What would make next month easier?",4)}</div>`;
  const nav=`<button class="btn sm" data-act="go" data-h="#month/${addMonths(id,-1)}">←</button><button class="btn sm" data-act="go" data-h="#month">This month</button><button class="btn sm" data-act="go" data-h="#month/${addMonths(id,1)}">→</button>`;
  return head("Month",monthLabel(id)+(m?` · ${m.ph}`:""),nav)+
   `<div class="cols c2"><div class="col">${calCard}${stats}${wCard}${cycCard}</div><div class="col">${plan}${notes}</div></div>`;
}

/* ============================================================ ARCHIVE */
const archTabs=(cur)=>`<div class="subtabs">${[["days","Days"],["weeks","Weeks"],["months","Months"],["trends","Trends"],["cycle","Cycle"]].map(([k,l])=>`<button class="${cur===k?"on":""}" data-act="go" data-h="#archive/${k}">${l}</button>`).join("")}</div>`;
function archDays(){
  let ks=loggedDays().reverse();
  if(amo)ks=ks.filter(k=>k.startsWith(amo));
  const q=aq.trim().toLowerCase();
  if(q)ks=ks.filter(k=>{const d=st.days[k];return[d.journal,d.win,d.grat,d.reward,d.tomorrow,...Object.values(d.meals||{}).map(x=>x.t)].join(" ").toLowerCase().includes(q)});
  if(!ks.length)return`<p class="muted">No days match yet. Days appear here once you log something.</p>`;
  return`<div class="arch">${ks.slice(0,250).map(k=>{const s=dayStats(k),ci=cycleInfo(k);return`<a class="arow" href="#today/${k}"><b>${short(k)}, ${parse(k).getFullYear()}</b><div class="chips">${s.done?chip("showed up",1):""}${s.rit?chip(s.rit+" rituals"):""}${s.water?chip(s.water+" water"):""}${s.steps?chip(s.steps.toLocaleString()+" steps"):""}${s.sleep?chip(s.sleep+"h sleep"):""}${s.kcal?chip(s.kcal.toLocaleString()+" kcal"):""}${s.mood?chip("mood "+s.mood):""}${s.energy?chip("energy "+s.energy):""}${s.flow?chip("flow "+s.flow):""}${ci&&s.has?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}">${PHASES[ci.ph].name.toLowerCase()}</span>`:""}</div><span class="muted small" style="max-width:26ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.win)}</span></a>`}).join("")}</div>${ks.length>250?`<p class="muted small">Showing the latest 250 of ${ks.length}. Narrow with search or month.</p>`:""}`;
}
function archWeeks(){
  const set={};loggedDays().forEach(k=>{set[monday(k)]=1});st.weights.forEach(w=>{set[monday(w.d)]=1});
  const ws=Object.keys(set).sort().reverse();
  if(!ws.length)return`<p class="muted">Weeks appear here once you log days or a weigh-in.</p>`;
  return`<div class="arch">${ws.map(mo=>{const days=weekDays(mo),S=days.map(dayStats),w=weekWeight(mo),wk=isoWeek(mo),rv=st.weeks[wk]||{};
    return`<a class="arow" href="#week/${mo}"><b>${md(mo)} – ${md(days[6])}</b><div class="chips">${chip(S.filter(s=>s.done).length+"/7 showed up",S.filter(s=>s.done).length>=4)}${chip(r0(avg(S.filter(s=>s.steps).map(s=>s.steps)))+" avg steps")}${chip(r1(avg(S.filter(s=>s.sleep).map(s=>s.sleep)))+"h sleep")}${w?chip("weigh-in "+w.w,1):""}${rv.win1?chip("review written"):""}</div><span class="muted small">${esc(rv.win1||"")}</span></a>`}).join("")}</div>`;
}
function archMonths(){
  const ks=loggedDays();const set={};ks.forEach(k=>set[k.slice(0,7)]=1);st.weights.forEach(w=>set[w.d.slice(0,7)]=1);Object.keys(st.months).forEach(k=>set[k]=1);set[mkey(new Date())]=1;
  const ms=Object.keys(set).sort().reverse();
  return`<div class="arch">${ms.map(id=>{const m=M.find(x=>x.id===id),n=daysIn(id),S=Array.from({length:n},(_,i)=>dayStats(id+"-"+p2(i+1))),ws=weightsSorted().filter(x=>x.d.startsWith(id)),ds=m?m.ms.filter((_,i)=>gp(`months/${id}/ms/${i}`)).length:0;
    return`<a class="arow" href="#month/${id}"><b>${monthLabel(id)}</b><div class="chips">${chip(S.filter(s=>s.done).length+" days showed up",S.filter(s=>s.done).length>=10)}${m?chip(ds+"/"+m.ms.length+" milestones",ds===m.ms.length):""}${chip(r0(avg(S.filter(s=>s.steps).map(s=>s.steps)))+" avg steps")}${ws.length?chip("weight "+ws[ws.length-1].w,1):""}</div><span class="muted small">${m?esc(m.ph):""}</span></a>`}).join("")}</div>`;
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
  const t=["days","weeks","months","trends","cycle"].includes(arg)?arg:"days";
  let body="";
  if(t==="days"){
    const mos=[...new Set(loggedDays().map(k=>k.slice(0,7)))].sort().reverse();
    body=`<div class="row" style="margin-bottom:12px"><div style="flex:2 1 220px"><input type="text" id="aq" placeholder="Search journal, wins, meals…" value="${esc(aq)}" aria-label="search"></div><div><select id="amo" aria-label="month"><option value="">All months</option>${mos.map(m=>`<option value="${m}" ${amo===m?"selected":""}>${monthLabel(m)}</option>`).join("")}</select></div></div><div id="archList">${archDays()}</div>`;
  }else if(t==="weeks")body=archWeeks();else if(t==="months")body=archMonths();else if(t==="trends")body=archTrends();else body=archCycle();
  return head("Archive","Every day, week and month you’ve logged, and the trends between them.")+archTabs(t)+body;
}

/* ============================================================ PLAN */
function det(t,body,open){return`<details ${open?"open":""}><summary><span class="ml">${t}</span></summary><div class="mbody">${body}</div></details>`}
function pPlan(arg){
  const t=["map","tracks","toolkit","atelier"].includes(arg)?arg:"map";
  const tabs=`<div class="subtabs">${[["map","The map"],["tracks","Tracks"],["toolkit","Toolkit"],["atelier","Atelier"]].map(([k,l])=>`<button class="${t===k?"on":""}" data-act="go" data-h="#plan/${k}">${l}</button>`).join("")}</div>`;
  const body={map:planMap,tracks:planTracks,toolkit:planToolkit,atelier:planAtelier}[t]();
  return head("Plan","Four years, one person arriving. Each year does one job for the next.")+tabs+body;
}
function planMap(){
  const y=YEARS[0],nowId=monthNear(todayKey()).id;
  const year=M.map(m=>{const n=m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length;return`<a class="arow" href="#month/${m.id}" style="${m.id===nowId?"border-color:var(--accT)":""}"><b>${m.lbl}</b><div class="chips">${chip(m.ph,m.id===nowId)}${chip(n+"/"+m.ms.length+" milestones",n===m.ms.length)}${chip(m.lost?"−"+m.lost+" lbs pace":"baseline")}</div><span class="muted small serif" style="font-size:.95rem">${esc(m.line)}</span></a>`}).join("");
  return`<div class="cols c2"><div class="col">
   <div class="card"><h3>Where you are → where you’re going</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div><div class="small muted"><b>Right now</b></div>${ul(["Gig work, low pay, high procrastination","Living at home; no license or car yet","HUSKY lapsed (fixable, with a form)","Anxiety, depression, CPTSD; possible OCD/AuDHD (assessment is a 2027 goal)","$0 budget; every step has a free route"])}</div><div><div class="small muted"><b>2030: the north star self</b></div>${ul(["Your own space, schedule and car","Stable, well-paying job with benefits","Savings and quiet financial confidence","A village, a creative life, a channel","Mostly free of shame; defined by what she makes and loves"])}</div></div><div class="note" style="margin-top:10px">The gap isn’t a verdict. It’s a to-do list with an order.</div></div>
   <div class="card"><h3>The four-year spine</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${YEARS.map(x=>`<div><div class="serif" style="font-size:1.6rem;line-height:1">${x.y}</div><div class="small muted" style="margin-bottom:4px"><b>${x.t}</b></div>${ul(x.items.map(i=>`<b>${i[0]}.</b> ${i[1]}`))}</div>`).join("")}</div></div>
   <div class="card"><h3>If you must cut to three</h3><p class="small">Weight, car, job: already your three. Everything else is optional in 2027. The order matters: <b>insurance → permit → job → license → car</b>, with body habits underneath all of it.</p></div></div>
   <div class="col">
   <div class="card"><h3>Why these three</h3>${Object.entries(y.why).map(([k,v])=>`<p class="small" style="margin-bottom:6px"><b>${k}</b> · ${v.map(esc).join(" · ")}</p>`).join("")}<label class="f">Your own “why” (read weekly)</label>${area("notes/why","Write the reason in your own voice, the one that actually makes you move…",4)}</div>
   <div class="card"><h3>The first 90 days</h3>${ul(["<b>Week 1:</b> HUSKY application. Locate tax / income paperwork.","<b>Weeks 2–4:</b> Work Zone course, practice tests, résumé v1, library card, 10-minute walks.","<b>Dec:</b> $59 saved, DMV appointment booked, LinkedIn, target list, sleep window, baseline weigh-in.","<b>Jan:</b> permit passed, first therapy intake, 3 apps/week, strength twice a week.","<b>Feb–Mar:</b> driving practice, 5 apps/week, interviews, temp-agency Plan B, steps to 7k."])}</div>
   <div class="card tint"><h3>Identity</h3><p class="serif" style="font-size:1.3rem;line-height:1.35;font-style:italic">“At my core, I am a maker of meaning. I am here to tell stories that matter, to end the harmful cycles before me, to break curses, and to be happy and joyful.”</p></div>
   <div class="card"><h3>2027 by month</h3><div class="arch">${year}</div></div></div></div>`;
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
  return`<div class="cols c2"><div class="col"><div class="card">${det("I wavered. What now? (the reset ladder)",ul(TOOLKIT.reset)+`<p class="serif" style="font-style:italic;margin-top:8px">Say it out loud: “No worries, I have a back-up plan. I have resources for this.”</p>`,true)}${det("Procrastination &amp; executive dysfunction",ul(TOOLKIT.proc)+`<p class="note" style="margin-top:10px">I can’t diagnose ADHD, autism, or OCD, but if these tactics feel hard to hold even when you’re motivated, ask a clinician for an evaluation.</p>`)}${det("Candle-day menu",ul(TOOLKIT.candle))}${det("The shame loop breaker",ul(TOOLKIT.shame)+`<p class="serif" style="font-style:italic">Shame is never in the driver’s seat.</p>`)}</div>
   <div class="card tint"><h3>When it gets dark</h3><p class="small">If the heaviness turns into thoughts of not wanting to be here, please reach out to a person right away. In the US, call or text <b>988</b> (Suicide &amp; Crisis Lifeline) any time. If you’re in immediate danger, call <b>911</b>. This plan will wait. You matter more than the plan.</p></div></div>
   <div class="col"><div class="card">${det("Plan B and Plan C",TOOLKIT.planb.map(([n,a])=>`<p class="small"><b>${n}</b></p>${ul(a)}`).join(""),true)}${det("Reward menu",ul(TOOLKIT.reward))}${det("$0 resource list (verify locally)",ul(TOOLKIT.resources))}</div></div></div>`;
}
function planAtelier(){
  return`<div class="cols c2"><div class="col">
   <div class="card tint"><h3>The morning scene</h3><p class="serif" style="font-size:1.2rem;line-height:1.5">A Tuesday in 2030. First light through gauzy curtains. Sheets that slip and whisper, not too warm. City sounds in the distance, quieter inside. A sleepy hand finds the speaker, music starts, the day begins. You feel light, lean, loose. You can run three flights of stairs and still talk. Your clothes fit. You rely on yourself.</p><p class="small muted">Yours. Read it before you start the day.</p></div>
   <div class="card"><h3>Palette · 60 / 30 / 10</h3><div class="pal">${PALETTE.map(p=>`<i style="background:${p[0]}" title="${p[1]}">${p[1].split(" ")[0]}</i>`).join("")}</div><p class="small" style="margin-top:8px"><b>Black / espresso base (60%)</b>, <b>one jewel tone (30%)</b>, <b>one warm metal or skin-adjacent accent (10%)</b>. Fabrics: silk, linen, cotton, velvet, lace, leather.</p><label class="f">Signature scent</label>${txt("notes/scent","Jasmine, clove, fig, smoke…")}</div>
   <div class="card"><h3>Rules from your list</h3>${ul(TOOLKIT.rules)}</div>
   <div class="card"><h3>Doctor &amp; therapist visit: questions to bring</h3>${ul(TOOLKIT.doctor)}</div></div>
   <div class="col"><div class="card"><h3>Whimsigoth rituals menu</h3>${ul(TOOLKIT.whimsi)}</div>
   <div class="card"><h3>Muses · borrow one a day</h3><div class="grid">${MUSES.map(x=>`<div><div class="serif" style="font-size:1.15rem;line-height:1.2"><b>${esc(x[0])}</b> <i class="muted">· ${esc(x[1])}</i></div><p class="small muted">${esc(x[2])}</p></div>`).join("")}</div></div></div></div>`;
}

/* ============================================================ SETTINGS */
function pSettings(){
  const s=st.settings;
  const prof=`<div class="card"><h3>Profile</h3><div class="inl" style="gap:16px;align-items:center">${avatarHtml("lg")}<div style="flex:1"><label class="btn sm">Upload avatar<input type="file" id="avf" accept="image/*" style="display:none"></label> ${s.avatar?`<button class="btn sm ghost" data-act="rmAvatar">Remove</button>`:""}<p class="small muted" style="margin-top:6px">Cropped square and stored in your data, so it syncs to your other devices.</p></div></div><label class="f">Your name</label>${txt("settings/name","What should the app call you?")}</div>`;
  const look=`<div class="card"><h3>Look</h3><label class="f" style="margin-top:0">Theme</label><div class="seg">${[["dark","Dark"],["light","Light"],["auto","Device"]].map(([v,l])=>`<button class="${LS.theme===v?"on":""}" data-act="theme" data-v="${v}">${l}</button>`).join("")}</div><label class="f">House (accent colour)</label><div class="sw">${HOUSES.map(h=>`<button data-act="pickHouse" data-h="${h[0]}" class="${LS.house===h[0]?"on":""}" title="${h[1]}" aria-label="${h[1]}" style="background:linear-gradient(hsl(${h[2]} ${h[3]}% 56%),hsl(${h[2]} ${h[3]}% 28%))"></button>`).join("")}</div><p class="small muted">Look settings are per device.</p></div>`;
  const targets=`<div class="card"><h3>Targets</h3><div class="row"><div><label class="f" style="margin-top:0">Water goal (glasses)</label>${numIn("settings/waterGoal","8")}</div><div><label class="f" style="margin-top:0">Daily steps override</label>${numIn("settings/stepGoal","by month")}</div></div><div class="row"><div><label class="f">Calorie goal (optional)</label>${numIn("settings/calGoal","none")}</div><div><label class="f">Starting weight (lbs)</label>${numIn("settings/startW","","step=\".1\"")}</div><div><label class="f">Goal: lbs to lose in 2027</label>${numIn("settings/goal","80")}</div></div><p class="small muted" style="margin-top:8px">Leave the calorie goal empty to log without a target. A doctor or dietitian is the right person to set one.</p></div>`;
  const cyc=`<div class="card"><h3>Cycle</h3><label class="ck" style="border:0"><input type="checkbox" ${B("settings/trackCycle")} data-re="1" ${s.trackCycle!==false?"checked":""}><span>Track my cycle and show phase tips</span></label><div class="row"><div><label class="f">Usual cycle length (days)</label>${numIn("settings/cycleLen","28")}</div><div><label class="f">Usual period length (days)</label>${numIn("settings/periodLen","5")}</div></div><p class="small muted" style="margin-top:8px">Once you’ve logged a few periods, the app uses your own averages instead. Add or edit periods in Archive → Cycle.</p></div>`;
  const sync=`<div class="card"><h3>Sync across devices <span class="r"><span class="syncdot"></span><span class="syncstat"></span></span></h3><p class="small muted">Your data lives in this browser and, once connected, in a file in your own Google Drive. Sync merges both ways, so editing on your phone and your computer never overwrites either. Setup steps are in the README.</p><label class="f">Apps Script web-app URL</label><input type="url" id="syncUrl" value="${esc(LS.syncUrl)}" placeholder="https://script.google.com/macros/s/…/exec"><label class="f">Secret token (same one you put in the script)</label><input type="password" id="syncTok" value="${esc(LS.token)}" autocomplete="off" placeholder="a long random phrase"><label class="ck" style="border:0"><input type="checkbox" id="syncAuto" ${LS.auto?"checked":""}><span>Sync automatically when I open the app and after changes</span></label><div class="chips" style="margin-top:8px"><button class="btn solid" data-act="syncNow">Sync now</button><button class="btn" data-act="syncSave">Save connection</button></div><p class="small muted" style="margin-top:8px" id="saved"></p></div>`;
  const data=`<div class="card"><h3>Your data</h3><div class="chips"><button class="btn solid" data-act="export">Download backup (.json)</button><label class="btn">Restore from file<input type="file" id="imp" accept=".json,application/json" style="display:none"></label><button class="btn" data-act="reset">Erase this device</button></div><p class="small muted" style="margin-top:8px">${LS.lastBackup?"Last backup: "+new Date(LS.lastBackup).toLocaleDateString():"No manual backup yet."} Restoring merges with what’s here.</p></div>`;
  return head("Settings","Profile, look, targets and sync.")+`<div class="cols c2"><div class="col">${prof}${look}${targets}</div><div class="col">${sync}${cyc}${data}</div></div>`;
}
