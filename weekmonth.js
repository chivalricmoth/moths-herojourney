"use strict";
/* north star — Week + Month upgrades (wraps the originals, swaps in new cards) */
const cardBy=(doc,t)=>[...doc.querySelectorAll(".card")].find(c=>{const h=c.querySelector("h3");return h&&h.textContent.trim().startsWith(t)});
const mk=(doc,h)=>{const t=doc.createElement("div");t.innerHTML=h;return t.firstElementChild};
const rng=d=>`${md(d[0])} – ${md(d[6])}`;
const fld=(lbl,why,body)=>`<div class="rv"><div class="q">${lbl}</div><div class="why">${why}</div>${body}</div>`;
const _pWeek=pWeek;
pWeek=function(arg){
  const k=DATE_RE.test(arg)?arg:todayKey(),days=weekDays(k),w=`weeks/${isoWeek(k)}`;
  const prev=weekDays(addDays(days[0],-7)),next=weekDays(addDays(days[0],7)),pw=`weeks/${isoWeek(prev[0])}`;
  const cur=monday(todayKey()),rel=days[0]===cur?"this week":days[0]<cur?"a past week":"an upcoming week";
  const doc=new DOMParser().parseFromString(`<body>${_pWeek(arg)}</body>`,"text/html");
  const sub=doc.querySelector(".pgh .sub");
  if(sub)sub.innerHTML=`<span class="tag">${rel}</span>${esc(rng(days))}`;
  const pgh=doc.querySelector(".pgh");
  if(pgh)pgh.insertAdjacentElement("afterend",mk(doc,`<div class="wkctx"><i class="ph ph-info"></i><span>Everything on this page is about <b>${rel==="this week"?"this week":"the week of "+esc(rng(days))}</b> (${esc(rng(days))}). <b>Last week</b> means ${esc(rng(prev))}; it only appears as a recap of what you planned.</span></div>`));
  doc.querySelectorAll(".wk .day").forEach((a,i)=>{const s=dayStats(days[i]),f=FACE[s.mood];const d=a.querySelector(".d");if(d)d.insertAdjacentHTML("afterend",`<div class="face">${f?`<i class="ph-fill ph-${f}"></i>`:""}</div>`)});
  const old=["Last week, honestly","Next week"].map(t=>cardBy(doc,t));
  const col=old[0]&&old[0].parentElement;
  old.forEach(c=>c&&c.remove());
  const ppl=[["nw","Weight"],["nc","Car"],["nj","Job"],["adj","One adjustment"],["rw","Reward"]].filter(([x])=>gp(pw+"/"+x));
  const recap=`<div class="card tint"><h3><i class="ph ph-arrow-bend-up-left"></i>Last week’s plan for this week<span class="r">${esc(rng(prev))}</span></h3>${ppl.length?`<ul class="l">${ppl.map(([x,l])=>`<li><b>${l}:</b> ${esc(gp(pw+"/"+x))}</li>`).join("")}</ul>`:`<p class="small muted">Nothing was planned during ${esc(rng(prev))}. Plan below at the end of this week and it will show up here next time.</p>`}${gp(pw+"/slid")?`<div class="note" style="margin-top:10px"><b>What slid last week:</b> ${esc(gp(pw+"/slid"))}</div>`:""}</div>`;
  const review=`<div class="card"><h3><i class="ph ph-notebook"></i>Look back at this week<span class="r">${esc(rng(days))}</span></h3>
   ${fld("Three wins","small counts. wins are evidence you can use on bad days.",[1,2,3].map(n=>txt(w+"/win"+n)).join('<div style="height:6px"></div>'))}
   ${fld("What slid, and what was underneath it?","name the habit that dropped, then the real reason: tired, scared, bored, overbooked?",rte(w+"/slid","be specific and kind…",90))}
   ${fld("What did my energy teach me?","look at the mood and energy rows above. which days drained me, and what was in them?",rte(w+"/energy","patterns, not verdicts…",90))}
   ${fld("Shadow check: where did I act against what I say I want?","not to punish. the gap shows what the old pattern is protecting.",rte(w+"/shadow","I said I wanted…, but I…",90))}
   ${fld("Evidence of my ideal self","one outfit, meal, choice, room or sentence that felt like her. collect it.",rte(w+"/ideal","she showed up when…",90))}
   <div class="row"><div><label class="f">Strength sessions</label>${numIn(w+"/lifts","0")}</div><div><label class="f">Applications</label>${numIn(w+"/apps","0")}</div><div><label class="f">Driving minutes</label>${numIn(w+"/drive","0")}</div></div></div>`;
  const plan=`<div class="card"><h3><i class="ph ph-compass"></i>Plan next week<span class="r">${esc(rng(next))}</span></h3>
   ${fld("One move each","the smallest action that still moves the needle. write it as a verb.",`<label class="f" style="margin-top:0">Weight</label>${txt(w+"/nw")}<label class="f">Car</label>${txt(w+"/nc")}<label class="f">Job</label>${txt(w+"/nj")}`)}
   ${fld("One adjustment (smaller, not harder)","if something slid, shrink it. do not add more.",txt(w+"/adj"))}
   ${fld("Protect and drop","one thing to guard on your calendar, one thing you’ll stop pretending you’ll do.",`${txt(w+"/protect","protect…")}<div style="height:6px"></div>${txt(w+"/drop","drop…")}`)}
   ${fld("Pleasure on purpose","something to look forward to so the week isn’t only tasks.",`${txt(w+"/movie","movie night pick")}<div style="height:6px"></div>${txt(w+"/adv","small adventure")}<div style="height:6px"></div>${txt(w+"/rw","reward for showing up")}`)}</div>`;
  if(col){col.insertAdjacentHTML("afterbegin","");col.append(mk(doc,recap),mk(doc,review),mk(doc,plan))}
  return doc.body.innerHTML;
};
const _pMonth=pMonth;
pMonth=function(arg){
  const id=MON_RE.test(arg)?arg:mkey(new Date()),m=M.find(x=>x.id===id);
  const doc=new DOMParser().parseFromString(`<body>${_pMonth(arg)}</body>`,"text/html");
  const nDays=parse(addDays(addMonths(id,1)+"-01",-1)).getDate(),keys=Array.from({length:nDays},(_,i)=>id+"-"+p2(i+1));
  const done=keys.filter(k=>dayStats(k).done).length,logged=keys.filter(k=>dayStats(k).has).length,left=keys.filter(k=>k>=todayKey()).length;
  const top=`<div class="card nowcard"><div><div class="k">${esc(monthLabel(id))}</div><div class="t">${m?esc(m.ph):"This month"}</div><div class="muted small">${done} days showed up · ${logged} logged${left&&left<nDays?` · ${left} days left`:""}</div></div><div class="ring" style="--p:${Math.round(done/nDays*100)}"><b>${Math.round(done/nDays*100)}%</b></div></div>`;
  const cal=cardBy(doc,"Calendar");if(cal)cal.insertAdjacentElement("beforebegin",mk(doc,top));
  const notes=cardBy(doc,"Notes for");
  if(notes){const p=`months/${id}`;notes.replaceWith(mk(doc,`<div class="card"><h3><i class="ph ph-notebook"></i>Month reflection<span class="r">${esc(monthLabel(id))}</span></h3>
   ${fld("Intention for the month","one sentence. how do you want this month to feel?",txt(p+"/intent","this month I’m…"))}
   ${fld("What did this month teach me?","what would you tell yourself on the 1st, knowing what you know now?",rte(p+"/taught","write it out…",110))}
   ${fld("Shadow and growth","what pattern showed up again, and what did you do differently this time?",rte(p+"/shadow","the pattern was…",110))}
   ${fld("Carrying forward","what comes with you into next month, and what do you leave here?",rte(p+"/forward","keep… / leave…",90))}
   ${fld("Notes","anything else.",area(p+"/note","What happened? What would make next month easier?",4))}</div>`))}
  return doc.body.innerHTML;
};
