"use strict";
/* ============================================================
   north star — image store (IndexedDB) + compression + Drive image sync
   Images never live inside the main JSON; they're kept here and synced
   one-by-one as separate files through the same Apps Script.
   ============================================================ */
const IMG={db:null,mem:{},ready:null};
IMG.open=function(){
  if(IMG.ready)return IMG.ready;
  IMG.ready=new Promise(res=>{
    try{
      const rq=indexedDB.open("northstar-img",1);
      rq.onupgradeneeded=()=>rq.result.createObjectStore("img",{keyPath:"id"});
      rq.onsuccess=()=>{IMG.db=rq.result;res(true)};
      rq.onerror=()=>res(false);
    }catch(e){res(false)}
  });
  return IMG.ready;
};
IMG.tx=function(mode,fn){
  return IMG.open().then(ok=>new Promise(res=>{
    if(!ok||!IMG.db)return res(null);
    try{const t=IMG.db.transaction("img",mode),s=t.objectStore("img"),r=fn(s);
      t.oncomplete=()=>res(r&&"result" in r?r.result:true);t.onerror=()=>res(null);t.onabort=()=>res(null)}catch(e){res(null)}
  }));
};
IMG.put=async function(data,id){
  id=id||("i"+uid());
  const rec={id,d:data,t:Date.now()};
  IMG.mem[id]=data;
  await IMG.tx("readwrite",s=>s.put(rec));
  return id;
};
IMG.get=async function(id){
  if(IMG.mem[id])return IMG.mem[id];
  const r=await IMG.tx("readonly",s=>s.get(id));
  if(r&&r.d){IMG.mem[id]=r.d;return r.d}
  return null;
};
IMG.ids=async function(){const r=await IMG.tx("readonly",s=>s.getAllKeys());return Array.isArray(r)?r:[]};
IMG.del=async function(id){delete IMG.mem[id];await IMG.tx("readwrite",s=>s.delete(id))};

/* resize + re-encode. alpha=true keeps transparency (avatars) */
IMG.compress=function(file,max,q,alpha){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      const sc=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*sc)),h=Math.max(1,Math.round(img.height*sc));
      const c=document.createElement("canvas");c.width=w;c.height=h;
      const x=c.getContext("2d");x.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      let out;
      if(alpha){out=c.toDataURL("image/webp",q);if(!/^data:image\/webp/.test(out))out=c.toDataURL("image/png")}
      else out=c.toDataURL("image/jpeg",q);
      res(out);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("couldn’t read that image"))};
    img.src=url;
  });
};
/* store a user file and return its id */
IMG.addFile=async function(file,max=1400,q=.82){
  const d=await IMG.compress(file,max,q,/png|webp|gif/.test(file.type));
  return IMG.put(d);
};

/* ---------- show stored images inside the page ---------- */
async function hydrateImgs(root){
  const els=(root||document).querySelectorAll("img[data-img]:not([data-ok])");
  for(const el of els){
    const d=await IMG.get(el.dataset.img);
    if(d){el.src=d;el.dataset.ok="1"}else{el.alt="image not on this device yet";el.classList.add("pending")}
  }
}

/* ---------- Drive sync for images (separate files via the same Apps Script) ---------- */
let imgSyncing=false;
async function syncImages(){
  if(!LS.syncUrl||imgSyncing)return;
  imgSyncing=true;
  try{
    const base=LS.syncUrl+(LS.syncUrl.includes("?")?"&":"?")+"t="+encodeURIComponent(LS.token||"");
    const r=await fetch(base+"&what=imgs&_="+Date.now(),{cache:"no-store"});
    const j=await r.json();
    if(!j||j.error||!Array.isArray(j.ids))return;
    const remote=new Set(j.ids),local=await IMG.ids();
    let pulled=0;
    for(const id of j.ids){
      if(local.includes(id))continue;
      try{
        const rr=await fetch(base+"&what=img&id="+encodeURIComponent(id),{cache:"no-store"}),jj=await rr.json();
        if(jj&&jj.d){await IMG.put(jj.d,id);pulled++}
      }catch(e){}
    }
    for(const id of local){
      if(remote.has(id))continue;
      const d=await IMG.get(id);if(!d)continue;
      const body=JSON.stringify({token:LS.token||"",kind:"img",id,d});
      try{await fetch(LS.syncUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body})}
      catch(e){try{await fetch(LS.syncUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body})}catch(x){}}
    }
    if(pulled&&typeof afterImagesPulled==="function")afterImagesPulled();
  }catch(e){}
  finally{imgSyncing=false}
}
