"use strict";
/* north star — Vision gallery, Pinterest embed, avatar in the image store (keeps transparency) */
function afterImagesPulled(){hydrateImgs(document)}
avatarHtml=function(cls=""){
  const id=st.settings.avatarId,a=st.settings.avatar,n=(st.settings.name||"").trim();
  const inner=id?`<img data-img="${esc(id)}" alt="">`:a?`<img src="${a}" alt="">`:(n?esc(n[0].toUpperCase()):'<i class="ph-fill ph-sparkle"></i>');
  return `<div class="av ${cls}">${inner}</div>`;
};
setAvatar=async function(file){
  try{const id=await IMG.addFile(file,320,.9);sp("settings/avatarId",id);sp("settings/avatar","");save();render();toast("avatar updated")}
  catch(e){toast("couldn’t read that image")}
};
function ensurePin(){
  if(!(st.settings.pinBoard||"").trim())return;
  if(window.PinUtils&&document.querySelector("[data-pin-do]"))return void PinUtils.build();
  if(document.getElementById("pinjs"))return;
  const s=document.createElement("script");s.id="pinjs";s.async=true;s.src="https://assets.pinterest.com/js/pinit.js";document.body.appendChild(s);
}
pVision=function(){
  const u=(st.settings.pinBoard||"").trim(),w=Math.max(320,Math.min(1200,(document.getElementById("main").clientWidth||900)-40));
  setTimeout(ensurePin,60);
  const nm=u.replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//,"").replace(/\/$/,"");
  return head("Vision","scroll it when you need to remember who you’re becoming")+
  `<div class="vhero"><div><div class="nm">${u?esc(nm.split("/").pop().replace(/-/g," ")):"no board yet"}</div><div class="u">${u?esc(nm):"paste a board link to start"}</div></div><div class="acts">${u?`<a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener"><i class="ph ph-arrow-square-out"></i>Open on Pinterest</a>`:""}</div></div>`+
  (u?`<div class="pinwrap"><a data-pin-do="embedBoard" data-pin-board-width="${w}" data-pin-scale-height="720" data-pin-scale-width="115" href="${esc(u)}"></a></div>`:`<div class="note">no board linked yet.</div>`)+
  `<div class="card" style="margin-top:14px"><h3><i class="ph ph-link"></i>Board link</h3><div class="inl"><input type="url" id="pinUrl" placeholder="https://pinterest.com/you/your-board/" value="${esc(u)}"><button class="btn solid" data-act="savePin">Save</button></div><p class="small muted" style="margin-top:8px">Pinterest controls how the board looks inside the embed. If it doesn’t load, use the button above.</p></div>`;
};
const _pSet=pSettings;
pSettings=function(){
  const doc=new DOMParser().parseFromString(`<body>${_pSet()}</body>`,"text/html"),p=cardBy(doc,"Profile");
  if(p)p.insertAdjacentElement("afterend",mk(doc,`<div class="card"><h3><i class="ph ph-push-pin"></i>Pinterest board</h3><label class="f" style="margin-top:0">Board link</label>${txt("settings/pinBoard","https://pinterest.com/you/your-board/")}<p class="small muted" style="margin-top:8px">Shows on the Vision page. <a href="#vision">Open Vision →</a></p></div>`));
  return doc.body.innerHTML;
};
document.addEventListener("click",e=>{const b=e.target.closest('[data-act="rmAvatar"]');if(b){sp("settings/avatarId","")}},true);
new MutationObserver(()=>hydrateImgs(document)).observe(document.body,{childList:true,subtree:true});
render();hydrateImgs(document);
