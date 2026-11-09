/* LZ Carry Event Prep planner — uses the fixed Apocalypse Time reference (UTC-2). */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);},root=$("event-prep-planner");if(!root)return;
var themes={
"Vehicle":["Check the active Vehicle / Mod Vehicle task list.","Set aside eligible blueprints, wrenches or vehicle actions only if listed.","Check whether a Full Preparedness window overlaps before spending."],
"Shelter":["Check the live construction task list and caps.","Review completed buildings and construction speedups; do not claim early if claiming scores.","Confirm whether the current Full Preparedness task matches."],
"Research":["Check the live research task list and badge eligibility.","Review the next Laboratory prerequisite before committing badges.","Keep research speedups for confirmed scoring windows where practical."],
"Heroes":["Check whether the event scores recruitment, fragments, EXP, gear or specific upgrades.","Do not assume hero level-ups score in every Hero event.","Keep materials for your main formation before chasing rank."],
"Training":["Check which troop tiers, promotions or training actions score.","Avoid filling queues with a tier you do not need just for points.","Coordinate healing and training resources with alliance needs."],
"Combat":["Read the live combat scoring and loss penalties.","Coordinate targets, rallies, shields and reinforcement with alliance leadership.","Do not risk troops for an unverified point assumption."]
};
var key="lzcarry-event-prep-v1",day="",checks={};try{checks=JSON.parse(localStorage.getItem(key)||"{}");}catch(e){checks={};}
function atParts(){var parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Etc/GMT+2",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date()),o={};parts.forEach(function(p){o[p.type]=p.value;});return o;}
function tick(){
 var p=atParts(),h=Number(p.hour),m=Number(p.minute),s=Number(p.second),slot=Math.floor(h/4),start=slot*4,mins=(3-slot%6)*0; 
 $("event-at-clock").textContent=p.weekday+" · "+p.year+"-"+p.month+"-"+p.day+" · "+p.hour+":"+p.minute+":"+p.second+" AT";
 $("event-at-window").textContent=String(start).padStart(2,"0")+":00–"+String((start+4)%24).padStart(2,"0")+":00 Apocalypse Time";
 $("event-at-next").textContent=(4-(h%4)-1)+ "h "+String(59-m).padStart(2,"0")+"m "+String(59-s).padStart(2,"0")+"s until next four-hour boundary";
 var golden=(h>=8&&h<12)||(h>=20&&h<24);
 $("event-at-overlap").textContent=golden?"Potential Full Prep / Alliance Duel overlap window (verify both live task lists).":"Not one of the commonly reported 08:00–12:00 or 20:00–00:00 overlap windows.";
 $("event-at-overlap").className=golden?"notice":"small muted";
 var nowKey=p.year+p.month+p.day;if(day!==nowKey){day=nowKey;render();}
}
function render(){
 var theme=$("event-prep-theme").value,items=themes[theme]||[],container=$("event-prep-checks");container.replaceChildren();
 items.forEach(function(t,i){var id=day+"-"+theme+"-"+i,label=document.createElement("label");label.className="event-check-row";var cb=document.createElement("input");cb.type="checkbox";cb.checked=!!checks[id];cb.addEventListener("change",function(){checks[id]=cb.checked;try{localStorage.setItem(key,JSON.stringify(checks));}catch(e){}});var span=document.createElement("span");span.textContent=t;label.append(cb,span);container.append(label);});
}
$("event-prep-theme").addEventListener("change",render);
$("event-prep-reset").addEventListener("click",function(){checks={};try{localStorage.removeItem(key);}catch(e){}render();});
render();tick();setInterval(tick,1000);
})();