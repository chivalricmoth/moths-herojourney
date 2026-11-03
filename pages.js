"use strict";
/* ============================================================
   north star — pages. ONE definition per page (no wrappers, no
   load-order tricks). Layout = a 12-column .board grid; cards
   declare their width with s3…s12 and the DOM order is the
   mobile reading order.
   ============================================================ */
const DATE_RE=/^\d{4}-\d\d-\d\d$/, MON_RE=/^\d{4}-\d\d$/;
const R=()=>{const h=location.hash.replace("#","").split("/");return{name:h[0]||"today",arg:h[1]||"",arg2:h[2]||""}};
const MOODS=["","low","meh","okay","good","bright"], ENERGY=["","drained","low","steady","good","charged"];
const SYMPTOMS=[["cramps","Cramps"],["headache","Headache"],["bloat","Bloated"],["tired","Tired"],["moody","Moody"],["cravings","Cravings"],["tender","Tender"],["acne","Breakouts"],["great","Great energy"]];
const FLOWS=[["spot","Spotting"],["light","Light"],["med","Medium"],["heavy","Heavy"]];
const MEALS=[["b","Breakfast"],["l","Lunch"],["d","Dinner"],["s","Snacks"]];
let aq="",amo="",trRange=90,customOpen=false;

const head=(t,sub,acts="")=>`<div class="pgh"><div><h1>${t}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div><div class="acts">${acts}</div></div>`;
const chip=(t,on)=>`<span class="chip ${on?"on":""}">${t}</span>`;
const kpi=(t,v,sub)=>`<div class="kpi"><div class="k">${t}</div><div class="stat num">${v}</div><div class="small muted">${sub}</div></div>`;
const stk=(cls,...h)=>{const s=h.join("");return s?`<div class="stack ${cls}">${s}</div>`:""};

/* ---------- avatar (image store keeps transparency) ---------- */
function avatarHtml(cls=""){
  const id=st.settings.avatarId,a=st.settings.avatar,n=(st.settings.name||"").trim();
  const inner=id?`<img data-img="${esc(id)}" alt="">`:a?`<img src="${a}" alt="">`:(n?esc(n[0].toUpperCase()):'<i class="ph-fill ph-sparkle"></i>');
  return `<div class="av ${cls}">${inner}</div>`;
}
async function setAvatar(file){
  try{const id=await IMG.addFile(file,320,.9);sp("settings/avatarId",id);sp("settings/avatar","");save();render();toast("avatar updated")}
  catch(e){toast("couldn’t read that image")}
}
function afterImagesPulled(){hydrateImgs(document)}

/* ---------- the one card builder: id, title, icon, body ---------- */
const hid=id=>!!(LS.hide&&LS.hide[id]);
const folded=id=>!!(LS.fold&&LS.fold[id]);
function card(id,t,ic,body,o={}){
  if(hid(id))return"";
  return `<section class="card ${o.cls||""} ${folded(id)?"folded":""}" id="${id}"><h3><i class="ph ph-${ic}"></i>${t}${o.r!=null?`<span class="r">${o.r}</span>`:""}<button class="fold" data-act="fold" data-id="${id}" aria-label="Collapse or expand"><i class="ph ph-caret-down"></i></button></h3><div class="cb">${body}</div></section>`;
}
const fld=(lbl,why,body)=>`<div class="rv"><div class="qq">${lbl}</div><div class="why">${why}</div>${body}</div>`;
const rng=d=>`${md(d[0])} – ${md(d[6])}`;

/* ---------- Today customisation ---------- */
const TODAY_CARDS=[["journal","Journal"],["mood","Check-in"],["water","Water"],["move","Move & sleep"],["rituals","Rituals"],["meals","Meals"],["needle","Needle-movers"],["cycle","Cycle"],["light","Pick your light"],["muse","Muse"],["close","Close the day"],["pins","Pinned images"]];
const denseSeg=()=>`<div class="seg">${[["cozy","Cozy"],["compact","Compact"]].map(([v,l])=>`<button class="${(LS.dense||"cozy")===v?"on":""}" data-act="dense" data-v="${v}">${l}</button>`).join("")}</div>`;
const customPanel=()=>!customOpen?"":`<div class="card custom"><h3><i class="ph ph-sliders-horizontal"></i>Customize Today<span class="r">saved on this device</span></h3><p class="small muted" style="margin-bottom:8px">Tap a card to show or hide it. Every card also has a collapse arrow.</p><div class="chips">${TODAY_CARDS.map(([k,l])=>`<button class="chip ${hid(k)?"":"on"}" data-act="toggleCard" data-id="${k}">${l}</button>`).join("")}</div><div class="row" style="margin-top:12px;align-items:center">${denseSeg()}<button class="btn sm ghost" data-act="resetLayout">Reset layout</button></div></div>`;
const layoutCard=()=>`<div class="card"><h3><i class="ph ph-sliders-horizontal"></i>Layout</h3><label class="f" style="margin-top:0">Density</label>${denseSeg()}<p class="small muted" style="margin-top:8px">Show or hide cards on Today with the Customize button there. Collapse any card with its arrow. Saved on this device.</p><button class="btn sm" data-act="resetLayout" style="margin-top:8px">Reset layout</button></div>`;

/* ============================================================ TODAY */
function journalCard(dk,d){
  const dn=Math.floor(parse(dk)/864e5),P=(typeof PROMPTS!=="undefined"&&PROMPTS[jtab])||JP[jtab]||JP.reflect,q=P[dn%P.length];
  const has=!!gp(`days/${dk}/jfree`);
  return card("journal","Journal","notebook",`
   <div class="jtabs">${JT.map(([k,l,i])=>`<button class="${jtab===k?"on":""}" data-act="jtab" data-v="${k}"><i class="ph ph-${i}"></i>${l}${gp(`days/${dk}/j_${k}`)?'<span class="d"></span>':""}</button>`).join("")}</div>
   <div class="prompt"><div><div class="q">${esc(q[0])}</div><div class="why">${esc(q[1]||"")}</div></div></div>
   ${rte(`days/${dk}/j_${jtab}`,"write until it’s out of your head…",250)}
   <details class="jfree" ${has?"open":""}><summary><span class="ml">Free write</span></summary>${rte(`days/${dk}/jfree`,"anything else…",110)}</details>
   <div class="trio"><div><label class="f" style="margin-top:0">One win</label>${txt(`days/${dk}/win`)}</div><div><label class="f" style="margin-top:0">Grateful for</label>${txt(`days/${dk}/grat`)}</div><div><label class="f" style="margin-top:0">Tomorrow’s first step</label>${txt(`days/${dk}/tomorrow`,"the very first physical action")}</div></div>`,{cls:"s8 journal"});
}
const pinHtml=p=>`<figure class="pin"><img src="${esc(p.u)}" alt="" referrerpolicy="no-referrer" loading="lazy"><button class="x" data-act="pinDel" data-id="${esc(p.id)}" aria-label="Unpin"><i class="ph ph-x"></i></button>${p.c?`<figcaption>${esc(p.c)}</figcaption>`:""}</figure>`;

function pToday(arg){
  const dk=DATE_RE.test(arg)?arg:todayKey(),isToday=dk===todayKey();
  const m=monthNear(dk),d=st.days[dk]||{},S=dayStats(dk);
  const tier=d.tier||"lantern",ti=Math.max(0,TIERS.findIndex(t=>t[0]===tier));
  const dayN=Math.floor((parse(dk)-new Date(parse(dk).getFullYear(),0,0))/864e5);
  const mantra=MANTRAS[dayN%MANTRAS.length];
  const rits=RIT.filter(r=>r.t<=ti);
  const wg=+st.settings.waterGoal||8,sg=stepGoalFor(dk),calG=+st.settings.calGoal||0;
  const ci=cycleInfo(dk),muse=MUSES[(st.notes.muse||0)%MUSES.length];
  const hr=new Date().getHours(),greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening",nm=(st.settings.name||"").trim();

  /* guided steps */
  const steps=rits.map(r=>({k:"rit",id:r.id,t:r.l,s:r.s,done:!!gp(`days/${dk}/rit/${r.id}`)}));
  if(ti>=1)steps.push({k:"go",t:"Log what you ate",s:"Awareness, not judgment.",done:S.mealsLogged,to:"meals"});
  steps.push({k:"go",t:"Check in: energy and mood",s:"Two taps.",done:!!(S.mood&&S.energy),to:"mood"});
  if(ti>=1){steps.push({k:"go",t:"Write one win",s:"Small counts.",done:!!d.win,to:"journal"});steps.push({k:"go",t:"Name tomorrow’s first step",s:"The very first physical action.",done:!!d.tomorrow,to:"journal"})}
  steps.push({k:"close",t:"Close the day",s:"You showed up. That’s the whole job.",done:!!d.done});
  const next=steps.find(x=>!x.done),doneN=steps.filter(x=>x.done).length,pct=Math.round(doneN/steps.length*100);
  const nowBtn=!next?"":next.k==="rit"?`<button class="btn solid" data-act="tick" data-id="${next.id}">Done ✓</button>`:next.k==="close"?`<button class="btn solid" data-act="markDone">Close the day</button>`:`<button class="btn solid" data-act="goto" data-t="${next.to}">Go →</button>`;
  const g=(t,ic,txt)=>`<button data-act="goto" data-t="${t}"><i class="ph ph-${ic}"></i>${txt}</button>`;
  const glance=`<div class="glance">${g("water","drop",`${S.water}/${wg}`)}${g("move","footprints",S.steps.toLocaleString())}${g("mood","smiley",MOODS[S.mood]||"mood?")}${g("meals","fork-knife",S.kcal?S.kcal.toLocaleString()+" kcal":"meals")}${g("journal","notebook",d.win||d.jfree||gp(`days/${dk}/j_${jtab}`)?"written":"write")}</div>`;
  const nowCard=`<section class="card nowcard s8" id="now"><div class="nc"><div class="k">${next?"Next up":"All done"}</div><div class="t">${next?esc(next.t):"Rest well. You showed up today."}</div><div class="muted small">${next?esc(next.s):esc(mantra)}</div><div class="nbtn">${nowBtn}</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div>${glance}</section>`;

  const lightCard=card("light","Pick your light","lightbulb",`<div class="light">${TIERS.map(t=>`<label><input type="radio" name="tier" ${B(`days/${dk}/tier`)} value="${t[0]}" data-re="1" ${tier===t[0]?"checked":""}>${t[1]}</label>`).join("")}</div><div class="tierhint">${esc(TIERS[ti][2])}</div><p class="mantra it">${esc(mantra)}</p>`,{cls:"s4"});

  const ritCard=card("rituals","Rituals","flame",`${GROUPS.map(g=>{const rs=rits.filter(r=>r.g===g[0]);if(!rs.length)return"";const n=rs.filter(r=>gp(`days/${dk}/rit/${r.id}`)).length;return`<div class="grp"><h4>${g[1]}<span class="small muted" style="font-family:var(--sans);font-style:normal">${n}/${rs.length}</span></h4>${rs.map(r=>chk(`days/${dk}/rit/${r.id}`,r.l,r.s,true)).join("")}</div>`}).join("")}<div class="note" style="margin-top:12px">Never zero twice. Three rituals ticked counts as a day you showed up.</div>`,{cls:"s4",r:`${steps.filter(x=>x.k==="rit"&&x.done).length} of ${rits.length}`});

  const needleCard=card("needle","Needle-movers","compass",["Weight","Car","Job"].map((n,i)=>`<div style="margin-bottom:12px"><div class="small muted" style="margin-bottom:4px"><b>${n}</b> · ${esc(m.f[i])}</div><div class="inl"><input type="checkbox" ${B(`days/${dk}/t3d${i}`)} ${gp(`days/${dk}/t3d${i}`)?"checked":""} aria-label="${n} done">${txt(`days/${dk}/t3/${i}`,"Smallest next step?")}</div></div>`).join(""),{r:esc(m.lbl)});

  const waterCard=card("water","Water","drop",`<div class="water">${Array.from({length:Math.max(wg,S.water)},(_,i)=>`<button class="${i<S.water?"on":""}" data-act="water" data-n="${i+1}" aria-label="${i+1} glasses"></button>`).join("")}</div>${bar(S.water,wg)}`,{r:`<span class="num">${S.water} / ${wg} glasses</span>`});

  const mealsCard=card("meals","Meals","fork-knife",`${MEALS.map(([id,l])=>{const t=gp(`days/${dk}/meals/${id}/t`)||"",e=estimateMeal(t);return `<div class="meal2"><div class="mh"><span><i class="ph ph-${{b:"coffee",l:"bowl-food",d:"cooking-pot",s:"cookie"}[id]||"fork-knife"}"></i>${l}</span><span class="est" id="est_${id}">${e.total?"≈ "+e.total+" kcal":""}</span></div><textarea data-meal="${id}" rows="2" placeholder="e.g. 2 eggs, toast with butter, large oat latte">${esc(t)}</textarea><div class="mf"><span id="unk_${id}" class="unk">${e.unknown.length?"couldn’t size: "+esc(e.unknown.join(", ")):""}</span><span style="margin-left:auto">override</span>${numIn(`days/${dk}/meals/${id}/k`,"kcal")}</div></div>`}).join("")}<p class="small muted" style="margin-top:8px">estimates are rough. awareness, not judgment.</p>`,{cls:"s4",r:`<span class="num" id="kcalTot">${S.kcal?S.kcal.toLocaleString()+" kcal":"–"}${calG?" / "+calG.toLocaleString():""}</span>`});

  const moveCard=card("move","Move &amp; sleep","person-simple-walk",`<div class="row"><div><label class="f" style="margin-top:0">Steps · goal ${sg.toLocaleString()}</label>${numIn(`days/${dk}/steps`,"0")}<div id="stepsBar">${bar(S.steps,sg)}</div></div><div><label class="f" style="margin-top:0">Sleep (hours)</label>${numIn(`days/${dk}/sleep`,"0",'step=".5"')}<div id="sleepBar">${bar(S.sleep,8)}</div></div></div>`);

  const moodCard=card("mood","Check-in","smiley",`<label class="f" style="margin-top:0">Mood <span class="muted">${MOODS[S.mood]||""}</span></label>${faceRow("mood",S.mood,FACE,MOODS)}<label class="f">Energy <span class="muted">${ENERGY[S.energy]||""}</span></label>${faceRow("energy",S.energy,BATT,ENERGY)}<label class="f">How else do you feel?</label>${feelHtml(dk)}`);

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
      cycleCard=card("cycle","Cycle","moon",`<div class="chips" style="margin-bottom:8px"><span class="chip phase" style="--ph:${P.hue}">${P.name} phase</span>${ci.overdue?`<span class="chip">period may be due</span>`:""}</div><p class="small muted" style="margin-bottom:8px">${esc(P.blurb)}</p><p class="tip">${esc(tip)}</p>${nx?`<p class="small muted" style="margin-top:8px">Next period around ${md(nx)} (${daysBetween(todayKey(),nx)} days).</p>`:""}<div class="chips" style="margin-top:10px">${pBtns.join("")}</div>${flowHtml}${symHtml}`,{cls:"tint",r:`day ${ci.day} of ~${ci.len}${ci.pred?" · est.":""}`});
    }else cycleCard=card("cycle","Cycle","moon",`<p class="small muted">Log the first day of your last period and the app will estimate your phase and offer a daily tip that fits.</p><div class="inl" style="margin-top:10px"><input type="date" id="pstart" value="${dk}" max="${todayKey()}"><button class="btn solid sm" data-act="periodAdd">Save</button></div><p class="small muted" style="margin-top:8px">Or turn cycle tracking off in Settings.</p>`,{cls:"tint"});
  }

  const museCard=card("muse","Muse of the day","star-four",`<div class="it" style="font-size:1.3rem;line-height:1.2">${esc(muse[0])}</div><div class="small muted" style="margin:2px 0 6px"><i>${esc(muse[1])}</i></div><p class="small">${esc(muse[2])}</p>`,{cls:"s4",r:`<button class="tx" data-act="muse">another</button>`});
  const closeCard=card("close","Close the day","check-circle",`<button class="btn ${d.done?"":"solid"}" data-act="markDone" style="width:100%">${d.done?"✓ Day closed (tap to reopen)":"Close the day"}</button><label class="f">Reward I’m taking</label>${txt(`days/${dk}/reward`,"tea, bath, a chapter, a movie")}<p class="small muted" style="margin-top:10px">Days shown up in ${esc(monthLabel(dk.slice(0,7)))}: <b class="num">${monthDone(dk.slice(0,7))}</b></p>`,{cls:"s4"});
  const pinsCard=card("pins","Pinned images","push-pin",`${pinsOf().length?`<div class="pgal">${pinsOf().map(pinHtml).join("")}</div>`:""}<div class="inl pinadd"><input type="url" id="pinU" placeholder="image link (https://…)"><input type="text" id="pinC" placeholder="caption (optional)"><button class="btn solid sm" data-act="pinAdd">Pin</button></div>`,{cls:"s4"});

  const nav=`<button class="btn sm" data-act="custom" title="Customize Today"><i class="ph ph-sliders-horizontal"></i><span class="hide-m">Customize</span></button><button class="btn sm" data-act="go" data-h="#today/${addDays(dk,-1)}" aria-label="previous day">←</button>${isToday?"":`<button class="btn sm" data-act="go" data-h="#today">Today</button>`}<button class="btn sm" data-act="go" data-h="#today/${addDays(dk,1)}" aria-label="next day">→</button>`;
  const phChip=ci?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}">${PHASES[ci.ph].name}</span>`:"";
  const lineQ=typeof LINES!=="undefined"?LINES[Math.floor(parse(dk)/864e5)%LINES.length]:"";
  return head(isToday?(nm?`${greet}, ${esc(nm)}`:"Today"):short(dk),`${esc(pretty(dk))} · <span class="it" style="font-size:1rem">${esc(m.ph)}</span> ${phChip}`,nav)+customPanel()+
   `<div class="line"><i class="ph ph-quotes"></i><span class="it">${esc(lineQ||m.line)}</span>${lineQ?`<span class="small muted lede-s">${esc(m.line)}</span>`:""}</div>`+
   `<div class="board">${nowCard}${lightCard}${journalCard(dk,d)}${stk("s4",moodCard,waterCard,moveCard)}${ritCard}${mealsCard}${stk("s4",needleCard,cycleCard)}${museCard}${closeCard}${pinsCard}</div>`;
}
function monthDone(mk){let n=0;Object.keys(st.days).forEach(k=>{if(k.startsWith(mk)&&dayStats(k).done)n++});return n}

/* ---- journal prompts, faces, rich-text editor ---- */
const FACE=["","smiley-sad","smiley-nervous","smiley-meh","smiley","smiley-wink"];
const BATT=["","battery-empty","battery-low","battery-medium","battery-high","battery-full"];
const JP={
 reflect:[["What did today ask of me, and what did I give?","name the gap without scolding it."],["Where did I feel most like myself today?","notice what that version of you was doing."],["What am I pretending not to know right now?","the quiet thing is usually the true thing."],["What would I tell a friend who had my exact day?","then hear it yourself."],["What is one thing I’m ready to let go of?","release is also progress."]],
 shadow:[["What am I judging in someone else that I secretly fear or want?","the shadow lives in the sharpest opinions."],["When did I perform today instead of being honest?","who were you performing for?"],["What story do I keep telling about why I can’t?","write it out, then argue with it."],["What feeling did I dodge today, and how?","scrolling, snacking, over-planning. be specific."],["Which part of me did I abandon to be liked?","that part is still around. what does it want?"]],
 track:[["What are the three things that actually move my needle this week?","everything else is decoration."],["Where did I drift today, and what pulled me?","pull, not blame."],["What is the smallest version of tomorrow that still counts?","a candle day is still a day."],["What am I avoiding that I already know the first step of?","write the first step as a verb."],["What does future me need from today’s me?","one concrete gift."]],
 ideal:[["What did my ideal self do today without thinking about it?","what is the habit hiding in that sentence?"],["Describe tonight in the life I’m building: light, room, clothes, sound.","make the aesthetic specific enough to buy or do."],["What did I wear, eat, read or make that felt like your ideal self?","collect the evidence."],["Which small choice today was a vote for the person I’m becoming?","count the votes, not the slips."],["What one thing could I change in my space this week to feel more like your ideal self?","lamp, candle, shelf, ritual."]]
};
const JT=typeof JBLOCKS!=="undefined"?JBLOCKS.map(b=>[b[0],b[1],b[2].replace("ph-","")]):[["reflect","Reflect","notebook"],["shadow","Shadow","moon-stars"],["track","On track","target"],["ideal","Ideal self","sparkle"]];
let jtab=JT[0][0];
if(typeof MUSES!=="undefined")MUSES.push(["Sarah Manning","scrappy reinvention, many selves, one stubborn spine","Pick the version of you the day needs and commit to her bit. Improvise, then follow through."],["Hecate / Persephone","thresholds, crossroads, the underworld as a home","Stand at one crossroads on purpose: write the two paths, then take the smaller step."],["Guillermo del Toro","tender monsters, beautiful dread","Find the strange, tender thing in an ordinary task. Make the workspace a little more cathedral."],["Patti Smith","poet-punk devotion to the work","Make something unpolished and sincere before you check your phone."],["Kathleen Hanna","loud, collective, unembarrassed","Say the true thing out loud, kindly, once. Then send someone a message of solidarity."]);
const safeHtml=h=>{const d=new DOMParser().parseFromString(`<div>${h||""}</div>`,"text/html"),r=d.body.firstChild;r.querySelectorAll("script,style,iframe,object,embed").forEach(n=>n.remove());r.querySelectorAll("*").forEach(n=>{[...n.attributes].forEach(a=>{const k=a.name;if(/^on/.test(k)||(k==="href"&&!/^(https?:|mailto:)/i.test(a.value))||(k==="src"&&!/^(data:image\/|https?:\/\/)/.test(a.value))||!/^(href|src|data-img|data-done|class|target|rel|alt|referrerpolicy|loading)$/.test(k))n.removeAttribute(k)});if(n.tagName==="A"){n.target="_blank";n.rel="noopener"}});return r.innerHTML};
const rtbar=()=>`<div class="rtebar">${[["bold","text-b","Bold"],["italic","text-italic","Italic"],["underline","text-underline","Underline"],["todo","check-square","To-do"],["link","link","Link"],["image","image","Image upload"],["imglink","globe","Image from link"]].map(([c,i,t])=>`<button class="rb" type="button" data-rt="${c}" title="${t}" aria-label="${t}"><i class="ph ph-${i}"></i></button>`).join("")}</div>`;
const rte=(p,ph,min)=>`<div class="rtewrap">${rtbar()}<div class="rte" contenteditable="true" data-rte="${p}" data-ph="${esc(ph)}" style="min-height:${min||150}px">${safeHtml(gp(p))}</div></div>`;
function faceRow(f,v,ic,labels){return `<div class="faces">${[1,2,3,4,5].map(n=>`<button class="${v===n?"on":""}" data-act="rate" data-f="${f}" data-n="${n}" aria-label="${labels[n]}"><i class="ph${v===n?"-fill":""} ph-${ic[n]}"></i>${labels[n]}</button>`).join("")}</div>`}
const FEEL_X=["calm","hopeful","proud","loved","energised","inspired","grateful","playful","confident","creative","content","focused","anxious","stressed","overwhelmed","sad","lonely","numb","angry","ashamed","restless","irritable","tired","foggy"];
const feelHtml=dk=>`<div class="feels">${FEEL_X.map(f=>`<button class="chip ${gp(`days/${dk}/feel/${f}`)?"on":""}" data-act="feel" data-f="${f}">${f}</button>`).join("")}</div>`;
const pinsOf=()=>Array.isArray(st.notes.pins)?st.notes.pins:[];

/* ---- week helpers ---- */
function barsHtml(vals,labels,goal,fmt=r0){
  const mx=Math.max(goal||0,...vals,1);
  return `<div class="mini-bars">${vals.map((v,i)=>`<div title="${esc(labels[i])}: ${fmt(v)}"><i class="${goal&&v>=goal?"goal":""}" style="height:${v?Math.max(4,v/mx*100):2}%;${v?"":"opacity:.25"}"></i>${labels[i]}</div>`).join("")}</div>`;
}

/* ---- weekly R.E.P.O.R.T. + events helpers ---- */
const wkOf=k=>`weeks/${isoWeek(k)}`;
const REP=[["R","Reading","a photo of what you’re reading, or a line you loved from this month’s book","reading"],["E","Eating","a favourite meal, snack or coffee from the week","eating"],["P","Playing","a hobby, game, activity or event you took part in","playing"],["O","Obsessing","what you can’t stop thinking about, listening to or watching","obsessing"],["R","Recommending","a product, show, spot or tip to pass on or save for posterity","recommending"],["T","Treating","something special you did or bought to pamper yourself","treating"]];
const picSrc=v=>/^https?:/.test(v)?`<img src="${esc(v)}" alt="" referrerpolicy="no-referrer" loading="lazy">`:`<img data-img="${esc(v)}" alt="">`;
function repHtml(w,mid){
  const rc=typeof RECS!=="undefined"&&RECS[mid];
  return `<div class="card s12" id="report"><h3><i class="ph ph-newspaper"></i>Weekly R.E.P.O.R.T.<span class="r">the week in six snapshots</span></h3><div class="rep">${REP.map(([L,n,why],i)=>{const k=`${w}/rep/${i}`,im=gp(k+"/i");
   return `<div class="it2"><div class="L"><b>${L}</b><span>${n}</span></div><div class="why">${why}${i===0&&rc?` · this month: ${esc(rc.fic)}`:""}</div>
   <div class="ph-box ${im?"has":""}">${im?picSrc(im):""}<div class="btns"><label class="btn sm"><i class="ph ph-image"></i>${im?"Change":"Add photo"}<input type="file" accept="image/*" data-rep="${k}/i" class="hide"></label><button class="btn sm" data-act="repLink" data-k="${k}/i"><i class="ph ph-link"></i>Link</button>${im?`<button class="btn sm" data-act="repClr" data-k="${k}/i" aria-label="Remove"><i class="ph ph-x"></i></button>`:""}</div></div>
   ${area(k+"/t",i===0?"a line, a moment, a page number…":"a sentence or two…",2)}</div>`}).join("")}</div></div>`;
}
const evOf=id=>Array.isArray(gp(`months/${id}/ev`))?gp(`months/${id}/ev`):[];
const gcUrl=e=>`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.t)}&dates=${e.d.replace(/-/g,"")}/${addDays(e.d,1).replace(/-/g,"")}`;
const gcEmbed=()=>{const v=(st.settings.gcalEmbed||"").trim();if(!v)return"";const s=/^https?:/.test(v)?v:`https://calendar.google.com/calendar/embed?mode=AGENDA&src=${encodeURIComponent(v)}`;return /^https:\/\/calendar\.google\.com\//.test(s)?`<iframe class="gcal" src="${esc(s)}" loading="lazy"></iframe>`:""};

/* ============================================================ WEEK */
function pWeek(arg){
  const k=DATE_RE.test(arg)?arg:todayKey(),days=weekDays(k),wk=isoWeek(k),w=`weeks/${wk}`;
  const S=days.map(dayStats),L=["M","T","W","T","F","S","S"];
  const wg=+st.settings.waterGoal||8,sgs=days.map(stepGoalFor),logged=S.filter(s=>s.has);
  const aSteps=avg(S.filter(s=>s.steps).map(s=>s.steps)),aSleep=avg(S.filter(s=>s.sleep).map(s=>s.sleep)),aWater=avg(S.filter(s=>s.water).map(s=>s.water));
  const aMood=avg(S.filter(s=>s.mood).map(s=>s.mood)),aEn=avg(S.filter(s=>s.energy).map(s=>s.energy)),aKcal=avg(S.filter(s=>s.kcal).map(s=>s.kcal));
  const showed=S.filter(s=>s.done).length;
  const prev=weekDays(addDays(days[0],-7)),next=weekDays(addDays(days[0],7)),pw=`weeks/${isoWeek(prev[0])}`;
  const cur=monday(todayKey()),rel=days[0]===cur?"this week":days[0]<cur?"a past week":"an upcoming week";
  const strip=days.map((dk,i)=>{const s=S[i],ci=cycleInfo(dk),f=FACE[s.mood];return`<a class="day ${dk===todayKey()?"today":""}" href="#today/${dk}" ${ci?`style="background:hsl(${PHASES[ci.ph].hue} 40% 50%/.12)"`:""}><b>${L[i]}</b><div class="d num">${parse(dk).getDate()}</div><div class="face">${f?`<i class="ph-fill ph-${f}"></i>`:""}</div><div class="pips"><i class="pip ${s.done?"on":""}"></i><i class="pip ${s.water>=wg?"on":""}"></i><i class="pip ${s.steps>=sgs[i]?"on":""}"></i><i class="pip ${s.mealsLogged?"on":""}"></i></div></a>`}).join("");

  const sw=startW(),ww=weekWeight(k),ws=weightsSorted(),last=ws.length?ws[ws.length-1]:null,prevW=ww?ws.filter(x=>x.d<ww.d).pop():null,goal=+st.settings.goal||80;
  const defD=todayKey()>=days[0]&&todayKey()<=days[6]?todayKey():days[6];
  const wCard=card("wweigh","Weekly weigh-in","scales",`<div class="row"><div><label class="f" style="margin-top:0">Date</label><input type="date" id="wd" value="${ww?ww.d:defD}"></div><div><label class="f" style="margin-top:0">Weight (lbs)</label><input type="number" step=".1" inputmode="decimal" id="wv" value="${ww?ww.w:""}" placeholder="${last?last.w:""}"></div><button class="btn solid" data-act="saveWeight">${ww?"Update":"Log"}</button></div><p class="small muted" style="margin-top:10px">${ww?`This week: <b class="num">${ww.w}</b>${prevW?` · ${(ww.w-prevW.w)>0?"+":""}${r1(ww.w-prevW.w)} vs last weigh-in`:""}`:"Same day, same time, one number. The trend matters, not the day."}${sw&&last?` · Start ${sw} → now ${last.w} · ${r1(sw-last.w)} of ${goal} lost`:""}</p>${ws.length>1?chartLine([{pts:ws.slice(-14).map(x=>({t:parse(x.d).getTime(),v:+x.w}))}],{h:170,label:"weight"}):""}`,{cls:"s4",r:wk});
  const statsCard=card("wstats","At a glance","chart-bar",`<div class="tiles">${kpi("Showed up",showed+"<small> / 7</small>",`${logged.length} days logged`)}${kpi("Avg steps",r0(aSteps),`goal ${r0(avg(sgs))}`)}${kpi("Avg sleep",r1(aSleep)+"<small> h</small>","per night")}${kpi("Avg water",r1(aWater)+"<small> gl</small>",`goal ${wg}`)}${kpi("Energy · mood",`${r1(aEn)} · ${r1(aMood)}`,"out of 5")}${kpi("Avg intake",aKcal?r0(aKcal)+"<small> kcal</small>":"–","days logged")}</div>`,{r:rel});
  const chartsCard=card("wcharts","Daily rhythm","chart-line",`<div class="minis"><div><h4>Steps</h4>${barsHtml(S.map(s=>s.steps),L,avg(sgs))}</div><div><h4>Water</h4>${barsHtml(S.map(s=>s.water),L,wg)}</div><div><h4>Sleep</h4>${barsHtml(S.map(s=>s.sleep),L,8,r1)}</div><div><h4>Mood · energy</h4>${barsHtml(S.map(s=>s.mood),L,0,r1)}${barsHtml(S.map(s=>s.energy),L,0,r1)}</div></div><div class="small muted" style="margin-top:8px">green = goal met</div>`,{cls:"s4"});
  const ppl=[["nw","Weight"],["nc","Car"],["nj","Job"],["adj","One adjustment"],["rw","Reward"]].filter(([x])=>gp(pw+"/"+x));
  const recapCard=card("wrecap","Last week’s plan","arrow-bend-up-left",`${ppl.length?`<ul class="l">${ppl.map(([x,l])=>`<li><b>${l}:</b> ${esc(gp(pw+"/"+x))}</li>`).join("")}</ul>`:`<p class="small muted">Nothing was planned during ${esc(rng(prev))}. Plan at the end of this week and it shows up here next time.</p>`}${gp(pw+"/slid")?`<div class="note" style="margin-top:10px"><b>What slid:</b> ${esc(gp(pw+"/slid"))}</div>`:""}`,{cls:"tint",r:esc(rng(prev))});
  const rhythmCard=card("wrhythm","The weekly rhythm","repeat",ul(["<b>Mon · Plan:</b> write next week’s three needle-movers.","<b>Tue–Thu · Build:</b> applications, driving, strength, calls.","<b>Fri · Review:</b> fill the review. What worked? What slid?","<b>Sat–Sun · Adventure + movie:</b> one small adventure, a reset hour."])+`<div class="note" style="margin-top:10px">Missed the review? Write “one win, one adjustment” and move on.</div>`);
  const reviewCard=card("wreview","Look back at this week","notebook",`<div class="fields2">
   ${fld("Three wins","small counts. wins are evidence you can use on bad days.",[1,2,3].map(n=>txt(w+"/win"+n)).join('<div style="height:6px"></div>'))}
   ${fld("What slid, and what was underneath it?","name the habit that dropped, then the real reason.",rte(w+"/slid","be specific and kind…",90))}
   ${fld("What did my energy teach me?","which days drained me, and what was in them?",rte(w+"/energy","patterns, not verdicts…",90))}
   ${fld("Shadow check","where did I act against what I say I want? not to punish.",rte(w+"/shadow","I said I wanted…, but I…",90))}
   ${fld("Evidence of my ideal self","one outfit, meal, choice or sentence. collect it.",rte(w+"/ideal","my ideal self showed up when…",90))}</div>
   <div class="row" style="margin-top:12px"><div><label class="f" style="margin-top:0">Strength sessions</label>${numIn(w+"/lifts","0")}</div><div><label class="f" style="margin-top:0">Applications</label>${numIn(w+"/apps","0")}</div><div><label class="f" style="margin-top:0">Driving minutes</label>${numIn(w+"/drive","0")}</div></div>`,{cls:"s6",r:esc(rng(days))});
  const planCard=card("wplan","Plan next week","compass",`<div class="fields2">
   ${fld("One move each","the smallest action that still moves the needle. write it as a verb.",`<label class="f" style="margin-top:0">Weight</label>${txt(w+"/nw")}<label class="f">Car</label>${txt(w+"/nc")}<label class="f">Job</label>${txt(w+"/nj")}`)}
   ${fld("One adjustment","if something slid, shrink it. do not add more.",txt(w+"/adj"))}
   ${fld("Protect and drop","one thing to guard, one thing you’ll stop pretending you’ll do.",`${txt(w+"/protect","protect…")}<div style="height:6px"></div>${txt(w+"/drop","drop…")}`)}
   ${fld("Pleasure on purpose","something to look forward to.",`${txt(w+"/movie","movie night pick")}<div style="height:6px"></div>${txt(w+"/adv","small adventure")}<div style="height:6px"></div>${txt(w+"/rw","reward for showing up")}`)}</div>`,{cls:"s6",r:esc(rng(next))});
  const nav=`<button class="btn sm" data-act="go" data-h="#week/${addDays(days[0],-7)}">←</button><button class="btn sm" data-act="go" data-h="#week">This week</button><button class="btn sm" data-act="go" data-h="#week/${addDays(days[0],7)}">→</button>`;
  return head("Week",`<span class="tag">${rel}</span>${esc(rng(days))}, ${parse(days[6]).getFullYear()}`,nav)+
   `<div class="wk">${strip}</div><div class="legend" style="margin:8px 0 14px"><span style="--lc:var(--acc)">dots: rituals · water · steps · food logged</span></div>`+
   `<div class="board">${wCard}${stk("s4",statsCard,recapCard)}${chartsCard}${repHtml(wkOf(days[0]),days[0].slice(0,7))}${reviewCard}${stk("s6",planCard,rhythmCard)}</div>`;
}

/* ============================================================ MONTH */
function evCard(id){
  const L=evOf(id).slice().sort((a,b)=>a.d.localeCompare(b.d)),td=todayKey();
  return card("mevents","Events &amp; reminders","bell",`<div class="row"><div style="flex:0 0 150px"><input type="date" id="evD" value="${td.startsWith(id)?td:id+"-01"}"></div><div style="flex:2 1 160px"><input type="text" id="evT" placeholder="what’s happening?"></div><button class="btn solid sm" data-act="evAdd" data-m="${id}">Add</button></div>
   <div style="margin-top:8px">${L.length?L.map(e=>`<div class="ev ${e.d<td?"past":""}"><div class="dt"><b>${parse(e.d).getDate()}</b><small>${esc(short(e.d).split(" ")[0])}</small></div><div>${esc(e.t)}</div><div class="acts"><a class="btn sm ghost" href="${gcUrl(e)}" target="_blank" rel="noopener" title="Add to Google Calendar"><i class="ph ph-calendar-plus"></i></a><button class="btn sm ghost" data-act="evDel" data-m="${id}" data-id="${esc(e.id)}" aria-label="Delete"><i class="ph ph-trash"></i></button></div></div>`).join(""):`<p class="small muted">nothing yet. add appointments, deadlines, birthdays.</p>`}</div>
   <details style="margin-top:10px"><summary><span class="ml" style="font-size:.85rem">Show my Google Calendar</span></summary><div class="mbody"><input type="text" ${B("settings/gcalEmbed")} value="${esc(st.settings.gcalEmbed||"")}" data-re="1" placeholder="calendar email, or the embed link"><p class="small muted" style="margin-top:6px">Google Calendar → Settings → your calendar → “Integrate calendar” → paste the embed link. Only works for public calendars.</p>${gcEmbed()}</div></details>`,{cls:"s4",r:`<span class="num">${L.length}</span>`});
}
function pMonth(arg){
  const id=MON_RE.test(arg)?arg:mkey(new Date()),m=M.find(x=>x.id===id),first=id+"-01";
  const nxt=addMonths(id,1),endK=addDays(nxt+"-01",-1),nDays=parse(endK).getDate();
  const keys=Array.from({length:nDays},(_,i)=>id+"-"+p2(i+1)),S=keys.map(dayStats);
  const wg=+st.settings.waterGoal||8;
  let start=monday(first);const cells=[];
  while(cells.length<42){cells.push(start);start=addDays(start,1)}
  if(cells.slice(35).every(k=>k.slice(0,7)!==id))cells.length=35;
  const cal=["M","T","W","T","F","S","S"].map(x=>`<div class="h">${x}</div>`).join("")+cells.map(k=>{
    const out=k.slice(0,7)!==id,s=dayStats(k),ci=cycleInfo(k);
    const dots=(s.done?`<i></i>`:"")+(s.water>=wg?`<i class="w"></i>`:"")+(s.mealsLogged?`<i class="f"></i>`:"");
    return`<a class="c ${out?"out":""} ${k===todayKey()?"today":""} ${ci?"ph":""} ${ci&&ci.pred?"pred":""}" ${ci?`style="--ph:${PHASES[ci.ph].hue}"`:""} href="#today/${k}" aria-label="${short(k)}"><span class="n num">${parse(k).getDate()}</span><span class="m">${dots}</span></a>`}).join("");
  const calCard=card("mcal","Calendar","calendar-blank",`<div class="cal">${cal}</div><div class="legend"><span style="--lc:var(--acc)">showed up</span><span style="--lc:hsl(200 50% 55%)">water goal</span><span style="--lc:var(--warn)">food logged</span>${st.settings.trackCycle!==false?Object.values(PHASES).map(p=>`<span style="--lc:hsl(${p.hue} 40% 55%)">${p.name.toLowerCase()}</span>`).join(""):""}</div>`,{cls:"s7"});
  const done=S.filter(s=>s.done).length,logged=S.filter(s=>s.has).length,left=keys.filter(k=>k>=todayKey()).length,pct=Math.round(done/nDays*100);
  const topCard=`<section class="card nowcard s4" id="mtop"><div class="nc"><div class="k">${esc(monthLabel(id))}</div><div class="t">${m?esc(m.ph):"This month"}</div><div class="muted small">${done} days showed up · ${logged} logged${left&&left<nDays?` · ${left} days left`:""}</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div></section>`;
  const ws=weightsSorted().filter(x=>x.d.startsWith(id)),wch=ws.length>1?ws[ws.length-1].w-ws[0].w:null;
  const statsCard=card("mstats","The month in numbers","chart-bar",`<div class="tiles tiles6">${kpi("Showed up",done+"<small> / "+nDays+"</small>","days")}${kpi("Avg steps",r0(avg(S.filter(s=>s.steps).map(s=>s.steps))),"logged days")}${kpi("Avg sleep",r1(avg(S.filter(s=>s.sleep).map(s=>s.sleep)))+"<small> h</small>","logged nights")}${kpi("Avg water",r1(avg(S.filter(s=>s.water).map(s=>s.water)))+"<small> gl</small>",`goal ${wg}`)}${kpi("Energy · mood",`${r1(avg(S.filter(s=>s.energy).map(s=>s.energy)))} · ${r1(avg(S.filter(s=>s.mood).map(s=>s.mood)))}`,"out of 5")}${kpi("Weight",ws.length?ws[ws.length-1].w:"–",wch!=null?`${wch>0?"+":""}${r1(wch)} · ${ws.length} weigh-ins`:`${ws.length} weigh-in`)}</div>`,{cls:"s12"});
  const pl=planLine(),wsAll=weightsSorted();
  const series=[{name:"you",pts:wsAll.map(x=>({t:parse(x.d).getTime(),v:+x.w}))}];if(pl)series.push({name:"gentle pace",pts:pl,dash:1});
  const wCard=card("mweight","Weight vs gentle pace","chart-line-up",`${chartLine(series,{h:300,label:"weight over time"})}${legend(series.map((s,i)=>({name:s.name,c:i?"var(--t55)":"var(--accT)"})))}${startW()?"":`<p class="small muted">Log a weigh-in on the Week page to start the chart.</p>`}`,{cls:"s7"});
  const per=sortedP().filter(p=>p.s.startsWith(id)),nx=nextPeriod();
  const cycCard=st.settings.trackCycle===false?"":card("mcycle","Cycle this month","moon",`${per.length?`<p class="small">Period started ${per.map(p=>md(p.s)).join(", ")}.</p>`:`<p class="small muted">No period start logged this month.</p>`}<p class="small muted" style="margin-top:6px">Average cycle ~${cycleLen()} days${nx?` · next expected around ${md(nx)}`:""}.</p>`,{cls:"tint"});
  let planCard="",msCard="",detCard="",bookCard="";
  if(m){
    const n=m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length;
    planCard=card("mplan",`${esc(m.ph)} · ${esc(m.lbl)}`,"flag",`<p class="lede" style="margin-bottom:10px">${esc(m.line)}</p>${bar(n,m.ms.length)}<div class="focus3">${["Weight","Car","Job"].map((x,i)=>`<div><div class="small muted"><b>focus · ${x}</b></div><p class="small">${esc(m.f[i])}</p></div>`).join("")}</div>`,{cls:"s8",r:`<span class="num">${n}/${m.ms.length} milestones</span>`});
    msCard=card("mmiles","Milestones","check-square",m.ms.map((x,i)=>chk(`months/${m.id}/ms/${i}`,esc(x),"",true)).join(""),{r:m.lost?`pace −${m.lost} lbs`:"baseline"});
    detCard=card("mdetail","The month in detail","list-bullets",Object.entries(m.sec).map(([k,v],i)=>`<details ${i===0?"open":""}><summary><span class="ml" style="font-size:1.05rem">${k}</span></summary><div class="mbody">${ul(v.map(esc))}</div></details>`).join(""));
  }else planCard=card("mplan","Plan","flag",`<p class="small muted">The written plan runs November 2026 – December 2027. Trackers and notes still work here.</p>`,{cls:"s8"});
  const rc=typeof RECS!=="undefined"&&RECS[id];
  if(rc||m){const r=rc||{fic:m.fic,non:m.non,film:m.film};bookCard=card("mbooks","Books · film · listen","books",`${[["book-open-text","Fiction",r.fic],["lightbulb","Nonfiction",r.non],["film-slate","Films",r.film],["headphones","Albums",r.listen]].filter(x=>x[2]).map(([i,k,v])=>`<div class="pick"><i class="ph ph-${i}"></i><div class="k">${k}</div><div class="v">${Array.isArray(v)?v.map(esc).join("<br>"):esc(v)}</div></div>`).join("")}${m?`<ul class="l" style="margin-top:8px">${m.rw.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="note" style="margin-top:10px"><b>If this month slides:</b> ${esc(m.slip)}</div>`:""}`,{cls:"s5"})}
  const p=`months/${id}`;
  const reflect=card("mreflect","Month reflection","notebook",`<div class="fields2">
   ${fld("Intention for the month","one sentence. how do you want this month to feel?",txt(p+"/intent","this month I’m…"))}
   ${fld("What did this month teach me?","what would you tell yourself on the 1st?",rte(p+"/taught","write it out…",100))}
   ${fld("Shadow and growth","what pattern showed up again, and what was different?",rte(p+"/shadow","the pattern was…",100))}
   ${fld("Carrying forward","what comes with you, and what do you leave here?",rte(p+"/forward","keep… / leave…",100))}</div>
   ${fld("Notes","anything else.",area(p+"/note","What happened? What would make next month easier?",3))}`,{cls:"s8",r:esc(monthLabel(id))});
  const nav=`<button class="btn sm" data-act="go" data-h="#month/${addMonths(id,-1)}">←</button><button class="btn sm" data-act="go" data-h="#month">This month</button><button class="btn sm" data-act="go" data-h="#month/${addMonths(id,1)}">→</button>`;
  return head("Month",monthLabel(id)+(m?` · ${m.ph}`:""),nav)+
   `<div class="board">${topCard}${planCard}${calCard}${stk("s5",msCard,cycCard)}${statsCard}${wCard}${bookCard}${reflect}${stk("s4",evCard(id),detCard)}</div>`;
}

/* ============================================================ PLAN (one router, one tab bar) */
const PLAN_TABS=[["roadmap","Roadmap"],["map","Why &amp; identity"],["tracks","Tracks"],["toolkit","Toolkit"],["atelier","Atelier"],["syllabus","Syllabus"]];
const PLAN_SUB={roadmap:"the map, the milestones, the next step",map:"four years, one person arriving",tracks:"car, job, health and money",toolkit:"for the days that wobble",atelier:"the aesthetic you’re building",syllabus:"the four-year cultural syllabus"};
function pPlan(arg){
  const t=PLAN_TABS.some(x=>x[0]===arg)?arg:"roadmap";
  const tabs=`<div class="subtabs">${PLAN_TABS.map(([k,l])=>`<button class="${t===k?"on":""}" data-act="go" data-h="#plan/${k}">${l}</button>`).join("")}</div>`;
  const body={roadmap:planRoadmap,map:planMap,tracks:planTracks,toolkit:planToolkit,atelier:planAtelier,syllabus:planSyllabus}[t]();
  return head("Plan",PLAN_SUB[t])+tabs+body;
}
function planRoadmap(){
  const now=monthNear(todayKey()),nowId=now.id,s0=parse("2026-11-01"),e0=parse("2027-12-31"),pct=Math.max(0,Math.min(100,Math.round((parse(todayKey())-s0)/(e0-s0)*100)));
  const done=m=>m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length,tot=M.reduce((a,m)=>a+m.ms.length,0),dn=M.reduce((a,m)=>a+done(m),0);
  const tl=M.map(m=>{const n=done(m);return `<a class="tile ${m.id===nowId?"cur":m.id<nowId?"past":""}" href="#month/${m.id}"><span class="k">${esc(m.ph)}</span><b>${esc(m.lbl)}</b>${bar(n,m.ms.length)}<span class="n">${n}/${m.ms.length} milestones${m.lost?` · −${m.lost} lbs`:""}</span><small>${esc(m.line)}</small></a>`}).join("");
  const qi=Math.floor(new Date().getMonth()/3);
  const qs=QUARTERS.map((q,i)=>`<div class="q ${i===qi&&todayKey()>="2027-01"?"cur":""}"><span class="k small muted">${q[0]} · ${q[1]}</span><div class="big">${q[2]}</div><p>${esc(q[3])}</p></div>`).join("");
  const cs=(k,A)=>A.filter((_,i)=>gp(`checks/${k}/${i}`)).length;
  const trk=[["car","Car","car",cs("car",CAR_STEPS),CAR_STEPS.length],["job","Job","briefcase",cs("job",JOB_STEPS),JOB_STEPS.length],["health","Health & benefits","heartbeat",cs("health",HEALTH_STEPS),HEALTH_STEPS.length]].map(([k,l,i,n,g])=>`<a class="trk2" href="#plan/tracks"><i class="ph ph-${i}"></i><div><b>${l}</b><span class="small muted">${n}/${g} steps</span></div>${bar(n,g)}</a>`).join("");
  const cur=M.find(m=>m.id===nowId);
  return `<div class="board">
   <section class="card tint s8"><div class="small muted" style="margin-bottom:6px">identity</div><p class="quote">“at my core, i am a maker of meaning. i am here to tell stories that matter, to end the harmful cycles before me, to break curses, and to be happy and joyful.”</p></section>
   <section class="card nowcard s4"><div class="nc"><div class="k">${esc(now.ph)}</div><div class="t">${dn}/${tot}</div><div class="muted small">milestones done</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div></section>
   ${card("proad","Roadmap","path",`<div class="tl">${tl}</div>`,{cls:"s12",r:"nov 2026 → dec 2027"})}
   ${cur?card("pmonth","This month","flag",`<p class="lede" style="margin-bottom:8px">${esc(cur.line)}</p>${cur.ms.map((x,i)=>chk(`months/${cur.id}/ms/${i}`,esc(x),"",true)).join("")}<a class="btn sm" style="margin-top:10px" href="#month/${cur.id}">Open month →</a>`,{cls:"s6",r:esc(cur.lbl)}):""}
   ${card("ptracks","Tracks","compass",`<div class="trks">${trk}</div><a class="btn sm" style="margin-top:10px" href="#plan/tracks">Open tracks →</a>`,{cls:"s6"})}
   ${card("pquarters","Quarters","map-trifold",`<div class="qs">${qs}</div>`,{cls:"s12"})}</div>`;
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
const visOf=()=>Array.isArray(st.notes.vision)?st.notes.vision:[];
async function addVision(files){
  let n=0;
  for(const f of files){if(!/^image\//.test(f.type))continue;try{const id=await IMG.addFile(f,1200,.82);sp("notes/vision",visOf().concat({id:uid(),img:id,c:""}));n++}catch(x){}}
  save();render();toast(n?`added ${n} image${n>1?"s":""}`:"couldn’t read those images");
}
function ensurePin(){
  if(!(st.settings.pinBoard||"").trim())return;
  if(window.PinUtils&&document.querySelector("[data-pin-do]"))return void PinUtils.build();
  if(document.getElementById("pinjs"))return;
  const s=document.createElement("script");s.id="pinjs";s.async=true;s.src="https://assets.pinterest.com/js/pinit.js";document.body.appendChild(s);
}
function pVision(){
  const u=(st.settings.pinBoard||"").trim(),items=visOf(),w=Math.max(320,Math.min(1200,(document.getElementById("main").clientWidth||900)-60));
  setTimeout(ensurePin,60);
  const grid=items.length?`<div class="masonry">${items.map(v=>`<figure><img data-img="${esc(v.img)}" alt="${esc(v.c||"")}"><figcaption data-act="visCap" data-id="${esc(v.id)}">${esc(v.c||"add a caption")}</figcaption><button class="x" data-act="visDel" data-id="${esc(v.id)}" aria-label="Remove"><i class="ph ph-x"></i></button></figure>`).join("")}</div>`:`<div class="note">your board is empty. add images that make you feel like the person you’re becoming.</div>`;
  return head("Vision","scroll it when you need to remember who you’re becoming",`<span class="muted small num">${items.length} image${items.length===1?"":"s"}</span>`)+
   `<label class="drop" id="vdrop"><i class="ph ph-image-square"></i>Drop images here, or tap to add<input type="file" accept="image/*" multiple data-vis="1" class="hide"></label>`+
   `<div style="margin-top:14px">${grid}</div>`+
   `<div class="card" style="margin-top:14px"><details ${u?"open":""}><summary><span class="ml"><i class="ph ph-push-pin"></i> Pinterest board</span><span class="small muted">${u?"linked":"optional"}</span></summary><div class="mbody"><div class="inl"><input type="url" id="pinUrl" placeholder="https://pinterest.com/you/your-board/" value="${esc(u)}"><button class="btn solid" data-act="savePin">Save</button>${u?`<a class="btn" href="${esc(u)}" target="_blank" rel="noopener"><i class="ph ph-arrow-square-out"></i></a>`:""}</div><p class="small muted" style="margin:8px 0">Pinterest controls how the board looks inside the embed. If it doesn’t load, use the open button.</p>${u?`<div class="pinwrap"><a data-pin-do="embedBoard" data-pin-board-width="${w}" data-pin-scale-height="720" data-pin-scale-width="115" href="${esc(u)}"></a></div>`:""}</div></details></div>`;
}

/* ============================================================ ARCHIVE extras */
function archSummary(){
  const ks=loggedDays(),end=todayKey();
  const cells=[];
  for(let k=monday(addDays(end,-364));k<=end;k=addDays(k,1)){const s=st.days[k]?dayStats(k):null;cells.push(`<i class="${s&&s.has?(s.done?((s.d.journal||s.win||s.d.j_anchor)?"l3":"l2"):"l1"):""}" title="${esc(short(k))}"></i>`)}
  let run=0,best=0,showed=0,cur=0;
  if(ks.length)for(let k=ks[0];k<=end;k=addDays(k,1)){if(dayStats(k).done){run++;showed++;if(run>best)best=run}else run=0}
  let k=end;if(!dayStats(k).done)k=addDays(k,-1);while(dayStats(k).done){cur++;k=addDays(k,-1)}
  return `<div class="card" style="margin-bottom:14px"><h3><i class="ph ph-calendar-check"></i>The past year<span class="r">each square is a day</span></h3><div class="tiles">${kpi("Days logged",ks.length,"all time")}${kpi("Showed up",showed,"days")}${kpi("Current streak",cur+"<small> d</small>","showed-up days in a row")}${kpi("Best streak",best+"<small> d</small>","so far")}</div><div class="heat">${cells.join("")}</div><div class="legend"><span style="--lc:var(--t15)">nothing</span><span style="--lc:var(--a2)">logged</span><span style="--lc:var(--a3)">showed up</span><span style="--lc:var(--acc)">showed up + wrote</span></div></div>`;
}

/* ============================================================ ARCHIVE */
const archTabs=(cur)=>`<div class="subtabs">${[["days","Days"],["weeks","Weeks"],["months","Months"],["trends","Trends"],["cycle","Cycle"]].map(([k,l])=>`<button class="${cur===k?"on":""}" data-act="go" data-h="#archive/${k}">${l}</button>`).join("")}</div>`;
function archDays(){
  let ks=loggedDays().reverse();
  if(amo)ks=ks.filter(k=>k.startsWith(amo));
  const q=aq.trim().toLowerCase();
  if(q)ks=ks.filter(k=>{const d=st.days[k];return[d.journal,d.win,d.grat,d.reward,d.tomorrow,...Object.values(d.meals||{}).map(x=>x.t)].join(" ").toLowerCase().includes(q)});
  if(!ks.length)return`<p class="muted">No days match yet. Days appear here once you log something.</p>`;
  return`<div class="arch">${ks.slice(0,250).map(k=>{const s=dayStats(k),ci=cycleInfo(k);return`<a class="arow" href="#today/${k}"><b>${short(k)}, ${parse(k).getFullYear()}</b><div class="chips">${s.done?chip("showed up",1):""}${s.rit?chip(s.rit+" rituals"):""}${s.water?chip(s.water+" water"):""}${s.steps?chip(s.steps.toLocaleString()+" steps"):""}${s.sleep?chip(s.sleep+"h sleep"):""}${s.kcal?chip(s.kcal.toLocaleString()+" kcal"):""}${s.mood?chip('<i class="ph ph-'+FACE[s.mood]+'"></i>'+MOODS[s.mood]):""}${s.energy?chip('<i class="ph ph-'+BATT[s.energy]+'"></i>'+ENERGY[s.energy]):""}${s.flow?chip("flow "+s.flow):""}${ci&&s.has?`<span class="chip phase" style="--ph:${PHASES[ci.ph].hue}">${PHASES[ci.ph].name.toLowerCase()}</span>`:""}</div><span class="muted small" style="max-width:26ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.win)}</span></a>`}).join("")}</div>${ks.length>250?`<p class="muted small">Showing the latest 250 of ${ks.length}. Narrow with search or month.</p>`:""}`;
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
    body=archSummary()+`<div class="row" style="margin-bottom:12px"><div style="flex:2 1 220px"><input type="text" id="aq" placeholder="Search journal, wins, meals…" value="${esc(aq)}" aria-label="search"></div><div><select id="amo" aria-label="month"><option value="">All months</option>${mos.map(m=>`<option value="${m}" ${amo===m?"selected":""}>${monthLabel(m)}</option>`).join("")}</select></div></div><div id="archList">${archDays()}</div>`;
  }else if(t==="weeks")body=archWeeks();else if(t==="months")body=archMonths();else if(t==="trends")body=archTrends();else body=archCycle();
  return head("Archive","Every day, week and month you’ve logged, and the trends between them.")+archTabs(t)+body;
}

/* ---- plan sub-pages ---- */
function det(t,body,open){return`<details ${open?"open":""}><summary><span class="ml">${t}</span></summary><div class="mbody">${body}</div></details>`}
function planMap(){
  const y=YEARS[0],nowId=monthNear(todayKey()).id;
  const year=M.map(m=>{const n=m.ms.filter((_,i)=>gp(`months/${m.id}/ms/${i}`)).length;return`<a class="arow" href="#month/${m.id}" style="${m.id===nowId?"border-color:var(--accT)":""}"><b>${m.lbl}</b><div class="chips">${chip(m.ph,m.id===nowId)}${chip(n+"/"+m.ms.length+" milestones",n===m.ms.length)}${chip(m.lost?"−"+m.lost+" lbs pace":"baseline")}</div><span class="muted small serif" style="font-size:.95rem">${esc(m.line)}</span></a>`}).join("");
  return`<div class="cols c2"><div class="col">
   <div class="card"><h3>Where you are → where you’re going</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div><div class="small muted"><b>Right now</b></div>${ul(["Gig work, low pay, high procrastination","Living at home; no license or car yet","HUSKY lapsed (fixable, with a form)","Anxiety, depression, CPTSD; possible OCD/AuDHD (assessment is a 2027 goal)","$0 budget; every step has a free route"])}</div><div><div class="small muted"><b>2030: the north star self</b></div>${ul(["Your own space, schedule and car","Stable, well-paying job with benefits","Savings and quiet financial confidence","A village, a creative life, a channel","Mostly free of shame; defined by what she makes and loves"])}</div></div><div class="note" style="margin-top:10px">The gap isn’t a verdict. It’s a to-do list with an order.</div></div>
   <div class="card"><h3>The four-year spine</h3><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${YEARS.map(x=>`<div><div class="it" style="font-size:1.6rem;line-height:1">${x.y}</div><div class="small muted" style="margin-bottom:4px"><b>${x.t}</b></div>${ul(x.items.map(i=>`<b>${i[0]}.</b> ${i[1]}`))}</div>`).join("")}</div></div>
   <div class="card"><h3>If you must cut to three</h3><p class="small">Weight, car, job: already your three. Everything else is optional in 2027. The order matters: <b>insurance → permit → job → license → car</b>, with body habits underneath all of it.</p></div></div>
   <div class="col">
   <div class="card"><h3>Why these three</h3>${Object.entries(y.why).map(([k,v])=>`<p class="small" style="margin-bottom:6px"><b>${k}</b> · ${v.map(esc).join(" · ")}</p>`).join("")}<label class="f">Your own “why” (read weekly)</label>${area("notes/why","Write the reason in your own voice, the one that actually makes you move…",4)}</div>
   <div class="card"><h3>The first 90 days</h3>${ul(["<b>Week 1:</b> HUSKY application. Locate tax / income paperwork.","<b>Weeks 2–4:</b> Work Zone course, practice tests, résumé v1, library card, 10-minute walks.","<b>Dec:</b> $59 saved, DMV appointment booked, LinkedIn, target list, sleep window, baseline weigh-in.","<b>Jan:</b> permit passed, first therapy intake, 3 apps/week, strength twice a week.","<b>Feb–Mar:</b> driving practice, 5 apps/week, interviews, temp-agency Plan B, steps to 7k."])}</div>
   <div class="card tint"><h3>Identity</h3><p class="it" style="font-size:1.3rem;line-height:1.35;font-style:italic">“At my core, I am a maker of meaning. I am here to tell stories that matter, to end the harmful cycles before me, to break curses, and to be happy and joyful.”</p></div>
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
  return`<div class="cols c2"><div class="col"><div class="card">${det("I wavered. What now? (the reset ladder)",ul(TOOLKIT.reset)+`<p class="it" style="font-style:italic;margin-top:8px">Say it out loud: “No worries, I have a back-up plan. I have resources for this.”</p>`,true)}${det("Procrastination &amp; executive dysfunction",ul(TOOLKIT.proc)+`<p class="note" style="margin-top:10px">I can’t diagnose ADHD, autism, or OCD, but if these tactics feel hard to hold even when you’re motivated, ask a clinician for an evaluation.</p>`)}${det("Candle-day menu",ul(TOOLKIT.candle))}${det("The shame loop breaker",ul(TOOLKIT.shame)+`<p class="it" style="font-style:italic">Shame is never in the driver’s seat.</p>`)}</div>
   <div class="card tint"><h3>When it gets dark</h3><p class="small">If the heaviness turns into thoughts of not wanting to be here, please reach out to a person right away. In the US, call or text <b>988</b> (Suicide &amp; Crisis Lifeline) any time. If you’re in immediate danger, call <b>911</b>. This plan will wait. You matter more than the plan.</p></div></div>
   <div class="col"><div class="card">${det("Plan B and Plan C",TOOLKIT.planb.map(([n,a])=>`<p class="small"><b>${n}</b></p>${ul(a)}`).join(""),true)}${det("Reward menu",ul(TOOLKIT.reward))}${det("$0 resource list (verify locally)",ul(TOOLKIT.resources))}</div></div></div>`;
}
function planAtelier(){
  return`<div class="cols c2"><div class="col">
   <div class="card tint"><h3>The morning scene</h3><p class="it" style="font-size:1.2rem;line-height:1.5">A Tuesday in 2030. First light through gauzy curtains. Sheets that slip and whisper, not too warm. City sounds in the distance, quieter inside. A sleepy hand finds the speaker, music starts, the day begins. You feel light, lean, loose. You can run three flights of stairs and still talk. Your clothes fit. You rely on yourself.</p><p class="small muted">Yours. Read it before you start the day.</p></div>
   <div class="card"><h3>Palette · 60 / 30 / 10</h3><div class="pal">${PALETTE.map(p=>`<i style="background:${p[0]}" title="${p[1]}">${p[1].split(" ")[0]}</i>`).join("")}</div><p class="small" style="margin-top:8px"><b>Black / espresso base (60%)</b>, <b>one jewel tone (30%)</b>, <b>one warm metal or skin-adjacent accent (10%)</b>. Fabrics: silk, linen, cotton, velvet, lace, leather.</p><label class="f">Signature scent</label>${txt("notes/scent","Jasmine, clove, fig, smoke…")}</div>
   <div class="card"><h3>Rules from your list</h3>${ul(TOOLKIT.rules)}</div>
   <div class="card"><h3>Doctor &amp; therapist visit: questions to bring</h3>${ul(TOOLKIT.doctor)}</div></div>
   <div class="col"><div class="card"><h3>Whimsigoth rituals menu</h3>${ul(TOOLKIT.whimsi)}</div>
   <div class="card"><h3>Muses · borrow one a day</h3><div class="grid">${MUSES.map(x=>`<div><div class="it" style="font-size:1.15rem;line-height:1.2"><b>${esc(x[0])}</b> <i class="muted">· ${esc(x[1])}</i></div><p class="small muted">${esc(x[2])}</p></div>`).join("")}</div></div></div></div>`;
}

/* ============================================================ SETTINGS */
function pSettings(){
  const s=st.settings;
  const prof=`<div class="card"><h3>Profile</h3><div class="inl" style="gap:16px;align-items:center">${avatarHtml("lg")}<div style="flex:1"><label class="btn sm">Upload avatar<input type="file" id="avf" accept="image/*" style="display:none"></label> ${(s.avatar||s.avatarId)?`<button class="btn sm ghost" data-act="rmAvatar">Remove</button>`:""}<p class="small muted" style="margin-top:6px">Transparent PNGs stay transparent. Stored in your image library and synced with Drive.</p></div></div><label class="f">Your name</label>${txt("settings/name","What should the app call you?")}</div>`;
  const look=`<div class="card"><h3>Look</h3><label class="f" style="margin-top:0">Theme</label><div class="seg">${[["dark","Dark"],["light","Light"],["auto","Device"]].map(([v,l])=>`<button class="${LS.theme===v?"on":""}" data-act="theme" data-v="${v}">${l}</button>`).join("")}</div><label class="f">House (accent colour)</label><div class="sw">${HOUSES.map(h=>`<button data-act="pickHouse" data-h="${h[0]}" class="${LS.house===h[0]?"on":""}" title="${h[1]}" aria-label="${h[1]}" style="background:linear-gradient(hsl(${h[2]} ${h[3]}% 56%),hsl(${h[2]} ${h[3]}% 28%))"></button>`).join("")}</div><p class="small muted">Look settings are per device.</p></div>`;
  const targets=`<div class="card"><h3>Targets</h3><div class="row"><div><label class="f" style="margin-top:0">Water goal (glasses)</label>${numIn("settings/waterGoal","8")}</div><div><label class="f" style="margin-top:0">Daily steps override</label>${numIn("settings/stepGoal","by month")}</div></div><div class="row"><div><label class="f">Calorie goal (optional)</label>${numIn("settings/calGoal","none")}</div><div><label class="f">Starting weight (lbs)</label>${numIn("settings/startW","","step=\".1\"")}</div><div><label class="f">Goal: lbs to lose in 2027</label>${numIn("settings/goal","80")}</div></div><p class="small muted" style="margin-top:8px">Leave the calorie goal empty to log without a target. A doctor or dietitian is the right person to set one.</p></div>`;
  const cyc=`<div class="card"><h3>Cycle</h3><label class="ck" style="border:0"><input type="checkbox" ${B("settings/trackCycle")} data-re="1" ${s.trackCycle!==false?"checked":""}><span>Track my cycle and show phase tips</span></label><div class="row"><div><label class="f">Usual cycle length (days)</label>${numIn("settings/cycleLen","28")}</div><div><label class="f">Usual period length (days)</label>${numIn("settings/periodLen","5")}</div></div><p class="small muted" style="margin-top:8px">Once you’ve logged a few periods, the app uses your own averages instead. Add or edit periods in Archive → Cycle.</p></div>`;
  const sync=`<div class="card"><h3>Sync across devices <span class="r"><span class="syncdot"></span><span class="syncstat"></span></span></h3><p class="small muted">Your data lives in this browser and, once connected, in a file in your own Google Drive. Sync merges both ways, so editing on your phone and your computer never overwrites either. Setup steps are in the README.</p><label class="f">Apps Script web-app URL</label><input type="url" id="syncUrl" value="${esc(LS.syncUrl)}" placeholder="https://script.google.com/macros/s/…/exec"><label class="f">Secret token (same one you put in the script)</label><input type="password" id="syncTok" value="${esc(LS.token)}" autocomplete="off" placeholder="a long random phrase"><label class="ck" style="border:0"><input type="checkbox" id="syncAuto" ${LS.auto?"checked":""}><span>Sync automatically when I open the app and after changes</span></label><div class="chips" style="margin-top:8px"><button class="btn solid" data-act="syncNow">Sync now</button><button class="btn" data-act="syncSave">Save connection</button></div><p class="small muted" style="margin-top:8px" id="saved"></p></div>`;
  const data=`<div class="card"><h3>Your data</h3><div class="chips"><button class="btn solid" data-act="export">Download backup (.json)</button><label class="btn">Restore from file<input type="file" id="imp" accept=".json,application/json" style="display:none"></label><button class="btn" data-act="reset">Erase this device</button></div><p class="small muted" style="margin-top:8px">${LS.lastBackup?"Last backup: "+new Date(LS.lastBackup).toLocaleDateString():"No manual backup yet."} Restoring merges with what’s here.</p></div>`;
  return head("Settings","Profile, look, targets and sync.")+`<div class="cols c2"><div class="col">${prof}${look}${layoutCard()}${targets}</div><div class="col">${sync}${cyc}${data}</div></div>`;
}

/* events */
let lastRange=null,rtTarget=null;
document.addEventListener("selectionchange",()=>{const s=getSelection();if(s.rangeCount&&s.anchorNode&&s.anchorNode.parentElement&&s.anchorNode.parentElement.closest("[data-rte]"))lastRange=s.getRangeAt(0).cloneRange()});
document.addEventListener("mousedown",e=>{if(e.target.closest("[data-rt]"))e.preventDefault()});
document.addEventListener("click",e=>{
  const j=e.target.closest('[data-act="jtab"]');if(j){jtab=j.dataset.v;render();return}
  const td=e.target.closest(".td");if(td&&e.target.closest("[data-rte]")&&e.offsetX<28){td.dataset.done=td.dataset.done==="1"?"0":"1";saveRte(td.closest("[data-rte]"));return}
  const b=e.target.closest("[data-rt]");if(!b)return;
  const ed=b.closest(".rtewrap").querySelector("[data-rte]");ed.focus();
  if(lastRange&&ed.contains(lastRange.startContainer)){const s=getSelection();s.removeAllRanges();s.addRange(lastRange)}
  const c=b.dataset.rt;
  if(["bold","italic","underline"].includes(c))document.execCommand(c);
  else if(c==="todo")document.execCommand("insertHTML",false,'<div class="td" data-done="0">&#8203;</div>');
  else if(c==="link"){const u=prompt("Link URL");if(u)document.execCommand("createLink",false,/^(https?:|mailto:)/.test(u)?u:"https://"+u)}
  else if(c==="imglink"){const u=prompt("Image link (https://…)");if(u&&/^https?:\/\//.test(u))document.execCommand("insertHTML",false,`<img src="${u.replace(/["<>]/g,"")}" alt="" referrerpolicy="no-referrer" loading="lazy"><br>`)}
  else if(c==="image"){rtTarget=ed;let f=document.getElementById("rtimg");if(!f){f=document.createElement("input");f.type="file";f.accept="image/*";f.id="rtimg";f.className="hide";document.body.appendChild(f);f.addEventListener("change",async()=>{if(!f.files[0])return;try{const id=await IMG.addFile(f.files[0]);rtTarget.focus();document.execCommand("insertHTML",false,`<img data-img="${id}" alt=""><br>`);hydrateImgs(rtTarget);saveRte(rtTarget)}catch(x){toast("couldn’t add that image")}f.value=""})}f.click()}
  saveRte(ed);
});
function saveRte(ed){if(!ed)return;const h=ed.innerHTML.replace(/ src="data:[^"]*"/g,m=>m);sp(ed.dataset.rte,h==="<br>"?"":h.replace(/(<img[^>]*data-img[^>]*?) src="[^"]*"/g,"$1"));save()}
document.addEventListener("input",e=>{
  const t=e.target;
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
new MutationObserver(()=>{hydrateImgs(document.getElementById("main"))}).observe(document.getElementById("main"),{childList:true,subtree:true});

/* ---- weekly report / pins / events handlers ---- */
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
