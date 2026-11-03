"use strict";
/* north star — adds a Phosphor icon to every card heading that lacks one */
const H_ICONS=[["Profile","user-circle"],["Look","palette"],["Targets","target"],["Cycle","moon"],["Sync","cloud-arrow-up"],["Back","download-simple"],["Your data","database"],["Data","database"],["Water","drop"],["Rituals","flame"],["Pick your light","lightbulb"],["Needle","compass"],["Move","person-simple-walk"],["Muse","star-four"],["Close","check-circle"],["Weekly weigh","scales"],["Steps","footprints"],["Calendar","calendar-blank"],["Plan","map-trifold"],["Milestones","flag"],["The month","list-bullets"],["The weekly","repeat"],["Weight","chart-line-up"],["Toolkit","toolbox"],["Atelier","paint-brush"],["Palette","palette"],["Next up","arrow-right"],["Stats","chart-bar"],["Trends","chart-line"],["Quarter","map-trifold"],["Job","briefcase"],["Car","car"],["Saving","piggy-bank"],["Health","heartbeat"],["Notes","note-pencil"]];
function iconHeads(){
  document.querySelectorAll("#main .card h3").forEach(h=>{
    if(h.querySelector("i.ph,i.ph-fill"))return;
    const t=h.textContent.trim(),hit=H_ICONS.find(([k])=>t.startsWith(k)||t.includes(k));
    if(hit)h.insertAdjacentHTML("afterbegin",`<i class="ph ph-${hit[1]}"></i>`);
  });
}
new MutationObserver(iconHeads).observe(document.getElementById("main"),{childList:true,subtree:true});
iconHeads();
