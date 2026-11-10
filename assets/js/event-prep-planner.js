/* LZ Carry Full Preparedness planner.
   AT is fixed UTC-2. Theme selection is manual because the server's active
   event task list is authoritative and the rotation sequence can vary. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);},root=$("event-prep-planner");if(!root)return;
var themes={
"Vehicle":[
"Check the live Mod Vehicle Boost task list before spending.",
"Prepare Modification Blueprints and Golden Wrenches only when those actions are listed.",
"Check whether eligible Boomer / Creep rallies are included in this rotation.",
"Keep a reserve for the second matching Full Preparedness window if your live schedule confirms it."
],
"Shelter":[
"Check the live Shelter Upgrade task list and its eligible building actions.",
"Prepare completed buildings and construction speedups; claim or spend only when the task panel confirms scoring.",
"Review your next HQ / building prerequisite before using scarce speedups.",
"Keep a reserve for the second matching Full Preparedness window if your live schedule confirms it."
],
"Research":[
"Check the live Age of Science task list and confirm which research actions score.",
"Prepare research completions, research speedups and badges only for listed tasks.",
"Check the next Laboratory prerequisite before committing badges.",
"Keep a reserve for the second matching Full Preparedness window if your live schedule confirms it."
],
"Heroes":[
"Check whether Hero Initiative lists EXP, Prime Recruitment Tickets, fragments, skills or equipment.",
"Do not assume every hero upgrade action scores in this rotation.",
"Keep materials for your main formation before chasing ranking rewards.",
"Keep a reserve for the second matching Full Preparedness window if your live schedule confirms it."
],
"Training":[
"Check the live Army Expansion / Unit Training task list and eligible troop tiers.",
"Prepare troop training, promotions and training speedups only when listed.",
"Check troop camp and research prerequisites before starting a large queue.",
"Keep a reserve for the second matching Full Preparedness window if your live schedule confirms it."
]
};
var key="lzcarry-event-prep-v2",day="",checks={};
try{checks=JSON.parse(localStorage.getItem(key)||"{}");if(!checks||typeof checks!=="object")checks={};}catch(e){checks={};}
function atParts(){
 var parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Etc/GMT+2",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date()),o={};
 parts.forEach(function(p){o[p.type]=p.value;});return o;
}
function tick(){
 var p=atParts(),h=Number(p.hour),m=Number(p.minute),s=Number(p.second),start=Math.floor(h/4)*4;
 $("event-at-clock").textContent=p.weekday+" · "+p.year+"-"+p.month+"-"+p.day+" · "+p.hour+":"+p.minute+":"+p.second+" AT";
 $("event-at-window").textContent=String(start).padStart(2,"0")+":00–"+String((start+4)%24).padStart(2,"0")+":00 Apocalypse Time";
 var remaining=4*3600-((h%4)*3600+m*60+s),rh=Math.floor(remaining/3600),rm=Math.floor((remaining%3600)/60),rs=remaining%60;
 $("event-at-next").textContent=String(rh).padStart(1,"0")+"h "+String(rm).padStart(2,"0")+"m "+String(rs).padStart(2,"0")+"s until next four-hour boundary";
 var overlap=(h>=8&&h<12)||(h>=20&&h<24);
 $("event-at-overlap").textContent=overlap?"Potential overlap window. Confirm the Alliance Duel day and check that the same action appears in BOTH live task lists.":"Outside the two commonly reported overlap windows (08:00–12:00 and 20:00–00:00 AT).";
 $("event-at-overlap").className=overlap?"notice":"small muted";
 var nowKey=p.year+p.month+p.day;
 if(day!==nowKey){day=nowKey;render();}
}
function render(){
 var theme=$("event-prep-theme").value,next=$("event-prep-next-theme").value,context=$("event-theme-context");
 if(!theme){
  context.textContent="Select the theme displayed in your live Event Center. The clock shows the current four-hour block but cannot detect your server's active theme.";
 }else{
  context.textContent="Current theme selected: "+theme+". "+(next?"Next theme selected: "+next+".":"Next theme not confirmed; check the live Event Center before planning the next window.")+" These selections are manual, not automatically detected.";
 }
 var items=themes[theme]||[],container=$("event-prep-checks"),milestoneContainer=$("event-prep-milestones");
 container.replaceChildren();milestoneContainer.replaceChildren();
 if(!theme){var empty=document.createElement("p");empty.className="small muted";empty.textContent="Choose a live Full Preparedness theme to load its preparation checklist.";container.append(empty);milestoneContainer.append(empty.cloneNode(true));return;}
 function addCheck(target,text,id){
  var label=document.createElement("label");label.className="event-check-row";
  var cb=document.createElement("input");cb.type="checkbox";cb.checked=!!checks[id];
  cb.addEventListener("change",function(){checks[id]=cb.checked;try{localStorage.setItem(key,JSON.stringify(checks));}catch(e){context.textContent="Browser storage is unavailable; checklist changes may not persist.";}}); 
  var span=document.createElement("span");span.textContent=text;label.append(cb,span);target.append(label);
 }
 items.forEach(function(t,i){addCheck(container,t,day+"-"+theme+"-"+i);});
 ["Personal chest 1 reached and claimed","Personal chest 2 reached and claimed","Personal chest 3 reached and claimed","Daily Preparedness Medal chest checked"].forEach(function(t,i){addCheck(milestoneContainer,t,day+"-"+theme+"-milestone-"+i);});
}
$("event-prep-theme").addEventListener("change",render);
$("event-prep-next-theme").addEventListener("change",render);
$("event-prep-reset").addEventListener("click",function(){checks={};try{localStorage.removeItem(key);}catch(e){}render();});
render();tick();setInterval(tick,1000);
})();