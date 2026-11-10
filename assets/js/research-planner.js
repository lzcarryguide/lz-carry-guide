/* LZ Carry Laboratory Route Planner
   Community-reported gates are planning hints, not live unlock checks. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
var root=$("lab-planner"); if(!root)return;
var STORAGE="lzcarry-research-plan-v1";
var catalog=[
["New Home",1,0,"free","Core starting tree; finish its route before alliance branches."],
["Shelter Building",5,0,"free","Foundation route; reported prerequisite for HQ Management."],
["Elite Troops",8,0,"disputed","Critical combat bridge; badge price differs by source."],
["Hero Training",8,0,"badge","Community guides prioritize an early Cockpit checkpoint, not an automatic full clear."],
["HQ Management",14,0,"free","Reported after Shelter Building 100%; separate Lab 14 gate is source-dependent."],
["Alliance Recognition",10,0,"badge","Recurring Alliance Duel value; higher priority for active participants."],
["Fully Armed Alliance",10,0,"badge","War-focused; situational unless it serves your alliance role."],
["Military Strategies",16,0,"badge","Broad combat bridge after Elite Troops 100%."],
["Siege to Seize",18,0,"badge","Military Strategies threshold conflicts: 15% vs 40%."],
["Peace Shield",18,0,"badge","Military Strategies 45% reported; PvP survival route."],
["Rapid Growth",22,0,"free","Reported after HQ Management 100%; useful badge-free parallel work."],
["Field Research",22,0,"badge","Reported after Siege to Seize 100%."],
["Army Building",25,0,"badge","Reported after Peace Shield 100%; formation-focused."],
["Rider Training",25,0,"badge","Reported after Field Research 100%; specialize only if Riders are your main line."],
["Assaulter Training",25,0,"badge","Reported after Field Research 100%; specialize only if Assaulters are your main line."],
["Shooter Training",25,0,"badge","Reported after Field Research 100%; specialize only if Shooters are your main line."],
["Unit Special Training",30,30,"badge","T10 route; both HQ 30 and Lab 30 are reported."],
["Age of Steel / Steel Age",30,0,"disputed","Support route; Lab 30 vs typically Lab 31 differs by source."],
["Tactical Master",31,0,"badge","Reported after Army Building 100%; major late-game commitment."],
["Leader's Will",35,0,"badge","Reported Lab 35 + Tactical Master 80%; role-dependent late-game."],
["Army Expansion",33,18,"free2","Second Lab No.2 level 33 + Rapid Growth 50% + Season 2 Day 50 reported; resource/time intensive."],
["Allied Troops",null,0,"disputed","Alternate Z Tools entry; absent from the 21-tree SIN Command list. Confirm it exists in your Lab."]
];
var paths={
"balanced":[["New Home","Shelter Building","HQ Management","Rapid Growth"],"Badge-light foundation path. Keep the free queue moving while protecting badges for the account's next real gate."],
"early-low":[["New Home","Shelter Building","Alliance Recognition","Elite Troops","Hero Training","HQ Management"],"Early-game F2P / low-spend route: complete the foundation, then make Alliance Recognition the first badge investment if you actively participate in Alliance Duel. Elite Troops' badge price conflicts across sources, so check your live panel before prioritizing it. Hero Training's Cockpit is a reported checkpoint; do not assume every account should max it immediately."],
"mid-low":[["Military Strategies","Peace Shield","Siege to Seize","Rapid Growth","Field Research"],"Mid-game low-badge route: use Military Strategies as the bridge, compare the Peace Shield survival path with Siege to Seize, and keep Rapid Growth moving in a badge-free queue. The exact Siege gate is disputed."],
"high":[["Alliance Recognition","Fully Armed Alliance","Military Strategies","Peace Shield","Siege to Seize","Field Research","Army Building","Tactical Master"],"High badge-income route: parallelize more badge branches only when your recurring badge supply supports them. Do not treat high spending as a reason to ignore prerequisites, resource bottlenecks or the value of survival research."],
"duel":[["Alliance Recognition","New Home","Elite Troops","Military Strategies"],"For active Alliance Duel participants: recurring reward value plus a broad combat bridge. Confirm Elite Troops' live badge price."],
"combat":[["Elite Troops","Military Strategies","Peace Shield","Siege to Seize","Field Research"],"Combat route. The 15% vs 40% Siege gate is disputed; choose based on your live tree, and compare the survival branch before spending."],
"specialize":[["Field Research","Assaulter Training","Rider Training","Shooter Training"],"After Field Research, prioritize the one troop line that matches your developed main formation; this is not a recommendation to max all three."],
"t10":[["Unit Special Training","Army Expansion","Tactical Master","Leader's Will"],"Late-game targets only. Separate Lab, season-day and prior-tree conditions remain important; this is not a guaranteed linear unlock chain."]
};
var state={};try{state=JSON.parse(localStorage.getItem(STORAGE)||"{}");}catch(e){state={};}
var route=$("lab-route"),hq=$("lab-hq"),lab=$("lab-level"),lab2=$("lab-second"),lab2level=$("lab-second-level"),season50=$("lab-season-day50"),list=$("lab-plan-list"),next=$("lab-next"),summary=$("lab-plan-summary"),pathSelect=$("lab-path");
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(e){}}
function status(name){return state[name]||"Not started";}
function eligible(item){var labOK=item[1]===null||Number(lab.value)>=item[1],hqOK=!item[2]||Number(hq.value)>=item[2];if(item[3]==="free2")return !!lab2.checked&&Number(lab2level.value)>=33&&Number(hq.value)>=18&&!!season50.checked;return labOK&&hqOK;}
function render(){
 var chosen=paths[pathSelect.value]||paths.balanced,focus=chosen[0],done=0,active=0,visible=[];
 catalog.forEach(function(item){var s=status(item[0]);if(s==="Done")done++;if(s==="In progress")active++;if(focus.indexOf(item[0])>=0||pathSelect.value==="balanced")visible.push(item);});
 list.replaceChildren();
 visible.forEach(function(item){
  var card=document.createElement("article");card.className="card lab-plan-item";
  var top=document.createElement("div");top.className="lab-plan-item-head";
  var title=document.createElement("h4");title.textContent=item[0];top.append(title);
  var badge=document.createElement("span");badge.className="pill";badge.textContent=item[3]==="free"||item[3]==="free2"?"Badge-free reported":item[3]==="disputed"?"Verify in game":"Badge tree";top.append(badge);card.append(top);
  var gate=document.createElement("p");gate.className="small muted";gate.textContent=item[1]===null?"Gate unknown / alternate source only":(item[3]==="free2"?"Reported Lab No. 2 level 33 + HQ 18 + Season 2 Day 50":"Reported Lab "+item[1]+(item[2]?" + HQ "+item[2]:""));card.append(gate);
  var note=document.createElement("p");note.textContent=item[4];card.append(note);
  var statusLine=document.createElement("div");statusLine.className="lab-plan-status";
  var select=document.createElement("select");select.setAttribute("aria-label",item[0]+" progress");["Not started","In progress","Done"].forEach(function(v){var o=document.createElement("option");o.value=v;o.textContent=v;select.append(o);});select.value=status(item[0]);select.addEventListener("change",function(){state[item[0]]=select.value;save();render();});statusLine.append(select);
  var ready=document.createElement("span");ready.className="small "+(eligible(item)?"text-good":"muted");ready.textContent=item[1]===null?"Gate not mapped":eligible(item)?(item[0]==="Army Expansion"?"Input checks met; verify Rapid Growth 50% in game":"Lab/HQ level gate met; confirm prerequisites in game") :"Below reported Lab/HQ or Lab No. 2 / season gate";statusLine.append(ready);card.append(statusLine);
  if(item[3]==="disputed"||item[3]==="free2"||item[1]===null){var warn=document.createElement("p");warn.className="notice small";warn.textContent="Planning caution: community references conflict or omit a required condition. Your in-game Laboratory unlock panel takes priority.";card.append(warn);}
  list.append(card);
 });
 var order=focus.map(function(n){return catalog.find(function(x){return x[0]===n;});}).filter(Boolean);
 var candidate=order.find(function(x){return status(x[0])!=="Done"&&eligible(x);});
 next.textContent=candidate?candidate[0]+" — "+candidate[4]+" Check the required prior-tree percentage and live unlock panel before starting.":"No mapped next route focus is within the selected level gates. Check the live Laboratory panel and prerequisites.";
 summary.textContent=done+" marked done · "+active+" in progress · "+catalog.length+" indexed entries. This is a personal checklist, not a live unlock calculator.";
 route.textContent=chosen[1];
}
function toggleSecond(){ $("lab-second-extra").hidden=!lab2.checked; $("lab-season-extra").hidden=!lab2.checked; render(); }
[hq,lab,lab2level,season50,pathSelect].forEach(function(el){el.addEventListener("change",render);});
lab2.addEventListener("change",toggleSecond);
$("lab-plan-reset").addEventListener("click",function(){if(!confirm("Reset your saved Laboratory checklist on this browser?"))return;state={};save();render();});
toggleSecond();
})();