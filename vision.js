"use strict";
/* north star — Vision gallery, Pinterest embed, avatar in the image store (keeps transparency) */
const visList=()=>Array.isArray(st.notes.vision)?st.notes.vision:[];
const visSave=l=>{sp("notes/vision",l);save()};
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
  const u=(st.settings.pinBoard||"").trim(),L=visList();
  setTimeout(ensurePin,60);
  const gal=L.length?`<div class="masonry">${L.map(x=>`<figure><img data-img="${esc(x.id)}" data-act="visView" alt="${esc(x.c||"")}"><figcaption>${esc(x.c||"")}</figcaption><button class="x" data-act="visDel" data-id="${esc(x.id)}" aria-label="Remove"><i class="ph ph-x"></i></button></figure>`).join("")}</div>`
   :`<div class="note">no images yet. add some below, or screenshot your Pinterest board and drop the images in. this gallery works offline and syncs with the rest of your data.</div>`;
  return head("Vision","scroll it when you need to remember who you’re becoming")+
  `<div class="card" style="margin-bottom:14px"><h3><i class="ph ph-images-square"></i>Gallery<span class="r num">${L.length} image${L.length===1?"":"s"}</span></h3>${gal}
   <label class="drop" style="display:block;margin-top:14px"><i class="ph ph-image"></i>add images<input type="file" id="visf" accept="image/*" multiple class="hide"></label></div>`+
  `<div class="card"><h3><i class="ph ph-push-pin"></i>Pinterest board<span class="r">paste link</span></h3>
   <div class="inl"><input type="url" id="pinUrl" placeholder="https://pinterest.com/you/your-board/" value="${esc(u)}"><button class="btn solid" data-act="savePin">Save</button></div>
   <p class="small muted" style="margin:8px 0 12px">Pinterest blocks copying a board’s images, so the board is embedded live here. Its look is controlled by Pinterest.</p>
   ${u?`<div class="pinframe"><div class="pf-h"><i class="ph ph-push-pin"></i>${esc(u.replace(/^https?:\/\/(www\.)?/,""))}</div><div class="pf-b"><a data-pin-do="embedBoard" data-pin-board-width="900" data-pin-scale-height="600" data-pin-scale-width="115" href="${esc(u)}"></a></div></div>`:""}</div>`;
};
const _pSet=pSettings;
pSettings=function(){
  const doc=new DOMParser().parseFromString(`<body>${_pSet()}</body>`,"text/html"),p=cardBy(doc,"Profile");
  if(p)p.insertAdjacentElement("afterend",mk(doc,`<div class="card"><h3><i class="ph ph-push-pin"></i>Pinterest board</h3><label class="f" style="margin-top:0">Board link</label>${txt("settings/pinBoard","https://pinterest.com/you/your-board/")}<p class="small muted" style="margin-top:8px">Shows on the Vision page. <a href="#vision">Open Vision →</a></p></div>`));
  return doc.body.innerHTML;
};
document.addEventListener("change",async e=>{
  const t=e.target;if(t.id!=="visf"||!t.files.length)return;
  const L=visList().slice();let n=0;
  for(const f of t.files){try{const id=await IMG.addFile(f,1400,.82);L.push({id,c:""});n++}catch(x){}}
  t.value="";if(n){visSave(L);render();toast(n+" added")}else toast("couldn’t read those images");
});
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-act^=vis]");if(!b)return;
  if(b.dataset.act==="visDel"){e.stopPropagation();if(!confirm("Remove this image from the gallery?"))return;await IMG.del(b.dataset.id);visSave(visList().filter(x=>x.id!==b.dataset.id));render()}
  else if(b.dataset.act==="visView"){const d=await IMG.get(b.dataset.img||b.getAttribute("data-img"));if(!d)return;const o=document.createElement("div");o.className="lightbox";o.innerHTML=`<img alt="">`;o.firstChild.src=d;o.onclick=()=>o.remove();document.body.appendChild(o)}
},true);
document.addEventListener("click",e=>{const b=e.target.closest('[data-act="rmAvatar"]');if(b){sp("settings/avatarId","")}},true);
new MutationObserver(()=>hydrateImgs(document)).observe(document.body,{childList:true,subtree:true});
render();hydrateImgs(document);
