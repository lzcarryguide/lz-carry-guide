/* Evidence-aware Lucky Rose log. Candidate reports are never promoted to Verified without a live-client observation. */
(function(){
"use strict";
var root=document.getElementById("lucky-rose-tracker");if(!root)return;
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=String(text);return n;}
function badge(status,label){var info=window.LZCarryDataStatus?window.LZCarryDataStatus.describe(status):{label:label||"Unconfirmed",className:"is-unconfirmed",detail:"Evidence is incomplete."};var b=el("span","pill evidence-badge "+info.className,label||info.label);b.title=info.detail;return b;}
function link(source){var a=el("a","lucky-rose-source",source.name+" · checked "+source.checkedAt);try{var u=new URL(source.url,location.href);if(u.protocol!=="https:"&&u.protocol!=="http:")throw Error("Unsafe source URL");a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";}catch(_){a.removeAttribute("href");}return a;}
fetch("data/lucky-rose-history.json").then(function(r){if(!r.ok)throw Error("Lucky Rose data unavailable");return r.json();}).then(function(d){
if(d.schemaVersion!==1||!Array.isArray(d.history))throw Error("Unsupported Lucky Rose dataset");
var candidate=d.activeCandidate,active=root.querySelector("#lucky-rose-current"),history=root.querySelector("#lucky-rose-history"),note=root.querySelector("#lucky-rose-scope-note");
active.replaceChildren();
if(candidate){
var head=el("div","lucky-rose-current-head");head.append(el("p","eyebrow","Week of "+candidate.weekOf),badge(candidate.status,"Community-supported · awaiting in-game confirmation"));active.append(head);
var number=el("strong","lucky-rose-number","#"+candidate.number);active.append(number);
active.append(el("h3","",candidate.buff+" · "+candidate.durationHours+" hours"));
active.append(el("p","small muted","Community reports agree on this candidate. It has not been verified in the current game client by LZ Carry."));
var sources=el("div","lucky-rose-sources");(candidate.sources||[]).forEach(function(s){sources.append(link(s));});active.append(sources);
var conflicts=el("ul","lucky-rose-conflicts","");(candidate.conflicts||[]).forEach(function(x){conflicts.append(el("li","",x));});active.append(conflicts);
}else{
active.append(badge("unconfirmed","Awaiting verification"));
active.append(el("p","","No current-week candidate is recorded. Check the in-game Lucky Rose panel before sending Yellow Roses."));
}
note.textContent=(d.policy&&d.policy.scope)||"Buff scope is not confirmed. Check the live client.";
history.replaceChildren();
var entries=d.history.slice().sort(function(a,b){return b.weekOf.localeCompare(a.weekOf);});
if(!entries.length)history.append(el("p","small muted","No historical observations have been recorded yet."));
entries.forEach(function(item){
var row=el("article","lucky-rose-history-row"),left=el("div","lucky-rose-history-main");
left.append(el("strong","","Week of "+item.weekOf+" · #"+item.number));
left.append(el("p","",item.buff+" · "+item.durationHours+" hours"));
left.append(el("p","small muted",item.notes||"Community report; not archived from the LZ Carry game client."));
row.append(left,badge(item.status));history.append(row);
});
}).catch(function(){root.querySelector("#lucky-rose-current").textContent="Lucky Rose evidence log unavailable. Refresh to try again.";});
})();
