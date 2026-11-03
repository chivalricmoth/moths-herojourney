"use strict";
/* north star — Today upgrades: faces, roomy meals w/ kcal estimate, journal prompts + rich text */
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
function journalHtml(dk){
  const dn=Math.floor(parse(dk)/864e5),P=(typeof PROMPTS!=="undefined"&&PROMPTS[jtab])||JP[jtab]||JP.reflect,q=P[dn%P.length];
  return `<div class="card" id="journal" data-o="10"><h3><i class="ph ph-notebook"></i>Journal</h3>
  <div class="jtabs">${JT.map(([k,l,i])=>`<button class="${jtab===k?"on":""}" data-act="jtab" data-v="${k}"><i class="ph ph-${i}"></i>${l}${gp(`days/${dk}/j_${k}`)?'<span class="d"></span>':""}</button>`).join("")}</div>
  <div class="prompt"><div><div class="q">${esc(q[0])}</div><div class="why">${esc(q[1]||"")}</div></div></div>
  ${rte(`days/${dk}/j_${jtab}`,"write until it’s out of your head…",180)}
  <label class="f">Free write</label>${rte(`days/${dk}/jfree`,"anything else…",110)}
  <label class="f">One win</label>${txt(`days/${dk}/win`)}<label class="f">Grateful for</label>${txt(`days/${dk}/grat`)}
  <label class="f">Tomorrow’s first step</label>${txt(`days/${dk}/tomorrow`,"the very first physical action")}</div>`;
}
function faceRow(f,v,ic,labels){return `<div class="faces">${[1,2,3,4,5].map(n=>`<button class="${v===n?"on":""}" data-act="rate" data-f="${f}" data-n="${n}" aria-label="${labels[n]}"><i class="ph${v===n?"-fill":""} ph-${ic[n]}"></i>${labels[n]}</button>`).join("")}</div>`}
function mealsHtml(dk,S){
  const g=+st.settings.calGoal||0;
  return `<div class="card" id="meals" data-o="6"><h3><i class="ph ph-fork-knife"></i>Meals <span class="r num" id="kcalTot">${S.kcal?S.kcal.toLocaleString()+" kcal":"–"}${g?" / "+g.toLocaleString():""}</span></h3>
  ${MEALS.map(([id,l])=>{const t=gp(`days/${dk}/meals/${id}/t`)||"",e=estimateMeal(t);return `<div class="meal2"><div class="mh"><span><i class="ph ph-${{b:"coffee",l:"bowl-food",d:"cooking-pot",s:"cookie"}[id]||"fork-knife"}"></i>${l}</span><span class="est" id="est_${id}">${e.total?"≈ "+e.total+" kcal":""}</span></div>
  <textarea data-meal="${id}" rows="2" placeholder="e.g. 2 eggs, toast with butter, large oat latte">${esc(t)}</textarea>
  <div class="mf"><span id="unk_${id}" class="unk">${e.unknown.length?"couldn’t size: "+esc(e.unknown.join(", ")):""}</span><span style="margin-left:auto">override</span>${numIn(`days/${dk}/meals/${id}/k`,"kcal")}</div></div>`}).join("")}
  <p class="small muted" style="margin-top:8px">estimates are rough. awareness, not judgment.</p></div>`;
}
const FEEL_X=["calm","hopeful","proud","loved","energised","inspired","grateful","playful","confident","creative","content","focused","anxious","stressed","overwhelmed","sad","lonely","numb","angry","ashamed","restless","irritable","tired","foggy"];
const feelHtml=dk=>`<div class="feels">${FEEL_X.map(f=>`<button class="chip ${gp(`days/${dk}/feel/${f}`)?"on":""}" data-act="feel" data-f="${f}">${f}</button>`).join("")}</div>`;
const pinsOf=()=>Array.isArray(st.notes.pins)?st.notes.pins:[];
const pinHtml=p=>`<div class="card pin" data-o="11.${p.id.slice(-2).replace(/\D/g,"5")}"><h3><i class="ph ph-push-pin"></i>Pinned<span class="r"><button data-act="pinDel" data-id="${esc(p.id)}" aria-label="Unpin"><i class="ph ph-x"></i></button></span></h3><img src="${esc(p.u)}" alt="" referrerpolicy="no-referrer" loading="lazy">${p.c?`<div class="cap">${esc(p.c)}</div>`:""}</div>`;
const _pToday=pToday;
pToday=function(arg){
  const dk=DATE_RE.test(arg)?arg:todayKey(),S=dayStats(dk),d=st.days[dk]||{};
  const doc=new DOMParser().parseFromString(`<body>${_pToday(arg)}</body>`,"text/html");
  const sw=(id,h)=>{const n=doc.getElementById(id);if(n){const t=doc.createElement("div");t.innerHTML=h;n.replaceWith(t.firstElementChild)}};
  sw("mood",`<div class="card" id="mood" data-o="3"><h3><i class="ph ph-smiley"></i>Check-in</h3><label class="f" style="margin-top:0">Mood <span class="muted">${MOODS[S.mood]||""}</span></label>${faceRow("mood",S.mood,FACE,MOODS)}<label class="f">Energy <span class="muted">${ENERGY[S.energy]||""}</span></label>${faceRow("energy",S.energy,BATT,ENERGY)}<label class="f">How else do you feel?</label>${feelHtml(dk)}</div>`);
  sw("meals",mealsHtml(dk,S));{const col=doc.querySelector(".cols .col");if(col){pinsOf().forEach(p=>col.insertAdjacentHTML("beforeend",pinHtml(p)));col.insertAdjacentHTML("beforeend",`<div class="card pinadd" data-o="13"><h3><i class="ph ph-push-pin"></i>Pin an image</h3><div class="inl"><input type="url" id="pinU" placeholder="image link (https://…)"><input type="text" id="pinC" placeholder="caption (optional)"><button class="btn solid sm" data-act="pinAdd">Pin</button></div></div>`)}}if(typeof LINES!=="undefined"){const l=doc.querySelector("p.lede"),dn=Math.floor(parse(dk)/864e5);if(l)l.insertAdjacentHTML("afterend",`<div class="line"><i class="ph ph-quotes"></i><span class="it">${esc(LINES[dn%LINES.length])}</span></div>`)}sw("journal",journalHtml(dk));
  return doc.body.innerHTML;
};
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
