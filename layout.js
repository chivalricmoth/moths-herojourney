"use strict";
/* north star — turns .cols into a true masonry grid (cards fill gaps, wide cards span 2 columns) */
const WIDE_T=["Journal","Calendar","Look back","Weekly R.E.P.O.R.T","Month reflection","Events","Plan next week","Pinterest board","Quarter","The four-year","Weight vs"];
const ROW=8,GAP=14;
const lro=new ResizeObserver(es=>es.forEach(e=>fit(e.target)));
function fit(el){const h=el.getBoundingClientRect().height;if(h)el.style.gridRowEnd="span "+Math.ceil((h+GAP)/ROW)}
function masonry(){
  document.querySelectorAll("#main .cols").forEach(c=>{
    if(c.classList.contains("mas"))return;
    const cols=[...c.children].map(x=>x.classList.contains("col")?[...x.children]:[x]);
    let items=[];const mx=Math.max(...cols.map(a=>a.length));
    for(let i=0;i<mx;i++)cols.forEach(a=>{if(a[i])items.push(a[i])});
    const all=items.every(x=>x.dataset&&x.dataset.o);
    if(all)items.sort((a,b)=>a.dataset.o-b.dataset.o);
    c.replaceChildren(...items);c.classList.add("mas");
    items.forEach(it=>{
      const t=(it.querySelector("h3")||{}).textContent||"",w=it.dataset.w;
      if(w==="3")it.classList.add("w3");
      else if(w==="2"||(it.classList.contains("card")&&WIDE_T.some(k=>t.trim().includes(k)))||/repeat\(3,minmax/.test(it.getAttribute("style")||""))it.classList.add("w2");
      lro.observe(it);fit(it);
    });
  });
}
new MutationObserver(()=>requestAnimationFrame(masonry)).observe(document.getElementById("main"),{childList:true});
addEventListener("load",()=>document.querySelectorAll("#main .cols>*").forEach(fit));
masonry();
