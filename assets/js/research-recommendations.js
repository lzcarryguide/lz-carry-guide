/* Research Center profile recommendations reuse the canonical Laboratory routes and tree details. */
(function(){
"use strict";
var select=document.getElementById("research-player-profile"),out=document.getElementById("research-profile-results"),note=document.getElementById("research-profile-note");
if(!select||!out||!note)return;
var profiles={
 "early-low":{title:"F2P · conserve badges",items:["New Home","Shelter Building","Alliance Recognition","Elite Troops","Hero Training","HQ Management"],why:"Start with the foundation route, then spend scarce badges only where the existing route identifies a useful unlock or recurring Alliance Duel value. The Elite Troops badge price is disputed; Hero Training is a checkpoint, not an automatic full clear."},
 "mid-low":{title:"Mid Spend · balanced progression",items:["Military Strategies","Peace Shield","Siege to Seize","Rapid Growth","Field Research"],why:"Keep the badge-free economy route moving while choosing between the survival and offensive branches. The Siege to Seize threshold is disputed; use your live Laboratory's gate rather than assuming a universal percentage."},
 "high":{title:"Big Spend · parallel badge routes",items:["Alliance Recognition","Fully Armed Alliance","Military Strategies","Peace Shield","Siege to Seize","Field Research","Army Building","Tactical Master"],why:"Higher badge income can support more parallel badge branches, but spending does not remove prerequisites or resource bottlenecks. Prioritize only branches that serve your alliance role and combat goals."}
};
function text(node){return node?(node.textContent||"").trim():"";}
function savedProgress(name){try{var state=JSON.parse(localStorage.getItem("lzcarry-research-plan-v1")||"{}");var value=state&&state[name];return value==="Done"||value==="In progress"?value:"Not started";}catch(e){return"Not started";}}
function researchCard(name){return [].slice.call(document.querySelectorAll("#tree-map .research-tree-card")).find(function(card){var h=card.querySelector("summary h3");return h&&text(h)===name;});}
function detail(card,label){if(!card)return"Research entry not indexed in the current directory.";var p=[].slice.call(card.querySelectorAll(".research-tree-body p")).find(function(n){return new RegExp("^"+label+":","i").test(text(n));});return p?text(p).replace(new RegExp("^"+label+":\\s*","i"),""):"See the expanded research notes and confirm in-game.";}
function openResearch(name){var card=researchCard(name);if(!card)return;card.open=true;card.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});var summary=card.querySelector("summary");if(summary){summary.setAttribute("tabindex","-1");summary.focus({preventScroll:true});}}
function render(){
var profile=profiles[select.value]||profiles["early-low"];
note.textContent=profile.why;
out.replaceChildren();
profile.items.forEach(function(name,index){
var card=researchCard(name),item=document.createElement("article");item.className="research-profile-item";
var head=document.createElement("div");head.className="research-profile-item-head";
var number=document.createElement("span");number.className="research-profile-order";number.textContent=String(index+1);
var title=document.createElement("h3");title.textContent=name;head.append(number,title);
var priority=document.createElement("p");priority.className="small muted";priority.textContent="Priority: "+detail(card,"Priority");
var prereq=document.createElement("p");prereq.className="small muted";prereq.textContent="Prerequisite: "+detail(card,"Prerequisite");
var progress=document.createElement("p");progress.className="small muted research-profile-progress";progress.textContent="Your progress: "+savedProgress(name);
var why=document.createElement("button");why.type="button";why.className="btn secondary research-why-button";why.textContent="Why this research?";why.addEventListener("click",function(){openResearch(name);});
item.append(head,priority,prereq,progress,why);out.append(item);
});
}
select.addEventListener("change",render);
window.addEventListener("lzcarry-research-progress-change",render);
window.addEventListener("storage",function(event){if(event.key==="lzcarry-research-plan-v1")render();});
var apply=document.getElementById("research-apply-profile");
if(apply)apply.addEventListener("click",function(){var path=document.getElementById("lab-path");if(path){path.value=select.value;path.dispatchEvent(new Event("change",{bubbles:true}));}var planner=document.getElementById("lab-planner");if(planner)planner.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});});
render();
})();