/* Player dashboard aggregates only data entered or saved by the player in this browser. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
var profileKey="lzcarry-player-profile-v1";
var keys={formations:"lzcarry-formation-library-v1",hq:"lzcarry:hq-planner:v2",research:"lzcarry-research-plan-v1",events:"lzcarry-event-prep-v2",beginner:"lzcarry-beginner-mode-v1",troop:"lzcarry-troop-plan-v1"};
var select=$("dashboard-hq"),status=$("dashboard-status");
if(!select)return;
for(var i=1;i<=35;i++){var o=document.createElement("option");o.value=String(i);o.textContent="HQ "+i;select.append(o);}
var profile={};try{profile=JSON.parse(localStorage.getItem(profileKey)||"{}")||{};}catch(e){profile={};}
select.value=profile.currentHq?String(profile.currentHq):"";
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"null")||fallback;}catch(e){return fallback;}}
function card(title,copy,url,label){var node=document.createElement("article");node.className="dashboard-recommendation";var h=document.createElement("strong");h.textContent=title;var p=document.createElement("p");p.textContent=copy;var a=document.createElement("a");a.href=url;a.textContent=label;node.append(h,p,a);return node;}
function render(){
 var formations=read(keys.formations,[]),hq=read(keys.hq,{}),research=read(keys.research,{}),events=read(keys.events,{}),beginner=read(keys.beginner,{}),troop=read(keys.troop,{});
 if(!Array.isArray(formations))formations=[];
 var heroNames={};formations.forEach(function(f){if(f&&Array.isArray(f.heroes))f.heroes.forEach(function(name){if(typeof name==="string"&&name.trim())heroNames[name.trim()]=true;});});
 var researchNames=Object.keys(research).filter(function(k){return research[k]==="Done"||research[k]==="In progress";});
 var researchDone=researchNames.filter(function(k){return research[k]==="Done";}).length;
 var eventDone=Object.keys(events).filter(function(k){return events[k]===true;}).length;
 var hqDone=Object.keys(hq).filter(function(k){return hq[k]===true;}).length;
 var beginnerDone=Object.keys(beginner).filter(function(k){return beginner[k]===true;}).length;
 $("dashboard-hq-value").textContent=profile.currentHq?"HQ "+profile.currentHq:"Not set";
 $("dashboard-formation-value").textContent=String(formations.length);
 $("dashboard-hero-value").textContent=String(Object.keys(heroNames).length);
 $("dashboard-research-value").textContent=researchDone+" / "+researchNames.length;
 $("dashboard-event-value").textContent=String(eventDone);
 var troopNames={assaulters:"Assaulters",shooters:"Shooters",riders:"Riders"};
 $("dashboard-troop-value").textContent=troop.classId&&troop.tier?((troopNames[troop.classId]||troop.classId)+" T"+troop.tier):"Not set";
 var rec=$("dashboard-recommendations");rec.replaceChildren();
 if(!profile.currentHq)rec.append(card("Set your current HQ","Add your current HQ level to personalize your next planning steps. This is player-entered, not read from your game account.","#dashboard-hq","Set HQ level"));
 else rec.append(card("Plan your next HQ upgrade","Use the HQ planner to review community-reported prerequisites and compare source values before spending.","beginner.html#hq-planner-section","Open HQ planner"));
 if(researchNames.length===0||researchDone<researchNames.length)rec.append(card("Continue Laboratory research","Your research route is saved locally. Review disputed gates in the live Laboratory before committing resources.","research.html#lab-planner","Resume research"));
 if(formations.length===0)rec.append(card("Build your first hero formation","Create a lineup and save it so you can compare future changes.","heroes.html#formation-builder","Open formation builder"));
 else rec.append(card("Review your saved formations",formations.length+" formation(s) are saved in this browser. Compare them before replacing a lineup.","heroes.html#formation-builder","Review formations"));
 if(beginnerDone<5)rec.append(card("Follow Beginner Mode","Complete the guided foundations checklist at your own pace. It links to the existing planners rather than duplicating them.","beginner.html#beginner-mode","Continue beginner path"));
 if(eventDone===0)rec.append(card("Prepare for your next event","Choose the theme shown in your live Event Center; event rotations and dates are not automatically synchronized.","events.html#event-prep-planner","Open event planner"));
 if(!rec.children.length)rec.append(card("Review your saved progress","Your local trackers look complete. Recheck current game requirements and update your saved progress when your account changes.","beginner.html","Review progression"));
 $("dashboard-event-note").textContent=eventDone?eventDone+" preparation check(s) saved on this device. Confirm the live event theme and schedule in game. HQ checklist: "+hqDone+" prerequisite(s) marked complete.":"No event preparation checks are currently saved. Event schedules are not automatically synced; confirm dates and themes in the live game.";
}
$("dashboard-save").addEventListener("click",function(){var n=Number(select.value);if(!Number.isInteger(n)||n<1||n>35){profile={};localStorage.removeItem(profileKey);status.textContent="Current HQ cleared."; }else{profile.currentHq=n;profile.updatedAt=new Date().toISOString();try{localStorage.setItem(profileKey,JSON.stringify(profile));status.textContent="Your HQ level was saved on this device.";}catch(e){status.textContent="Browser storage unavailable; your HQ level was not saved.";}}render();});
render();
})();
