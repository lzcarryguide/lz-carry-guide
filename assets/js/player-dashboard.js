/* Player dashboard aggregates only data entered or saved by the player in this browser. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
function el(tag,cls,text){var node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=String(text);return node;}
var profileKey="lzcarry-player-profile-v1";
var keys={hq:"lzcarry:hq-planner:v2",research:"lzcarry-research-plan-v1",beginner:"lzcarry-beginner-mode-v1",goals:"lzcarry-player-goals-v1"};
var select=$("dashboard-hq"),status=$("dashboard-status");
var goalForm=$("dashboard-goal-form"),goalList=$("dashboard-goal-list"),goalStatus=$("dashboard-goal-status"),goalClear=$("dashboard-goal-clear-completed");
if(!select)return;
for(var i=1;i<=35;i++){var o=document.createElement("option");o.value=String(i);o.textContent="HQ "+i;select.append(o);}
var profile={};try{profile=JSON.parse(localStorage.getItem(profileKey)||"{}")||{};}catch(e){profile={};}
select.value=profile.currentHq?String(profile.currentHq):"";
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"null")||fallback;}catch(e){return fallback;}}
function card(title,copy,url,label){var node=document.createElement("article");node.className="dashboard-recommendation";var h=document.createElement("strong");h.textContent=title;var p=document.createElement("p");p.textContent=copy;var a=document.createElement("a");a.href=url;a.textContent=label;node.append(h,p,a);return node;}
var goalLinks={HQ:["beginner.html#hq-planner-section","Open HQ planner"],Research:["research.html#lab-planner","Open Research Center"],Beginner:["beginner.html#beginner-mode","Open Beginner Mode"],Other:["dashboard.html#speedup-planner","Open Dashboard tools"]};
function validGoalDate(value){if(!value)return true;if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;var date=new Date(value+"T00:00:00Z");return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;}
function validGoalRecord(g){return!!(g&&typeof g.id==="string"&&g.id.length>0&&g.id.length<=128&&typeof g.title==="string"&&g.title.trim()&&g.title.length<=100&&["HQ","Research","Beginner","Other"].indexOf(g.category)>=0&&typeof g.dueDate==="string"&&validGoalDate(g.dueDate)&&typeof g.note==="string"&&g.note.length<=200&&typeof g.done==="boolean"&&typeof g.createdAt==="string"&&Number.isFinite(Date.parse(g.createdAt))&&new Date(g.createdAt).toISOString()===g.createdAt);}
function readGoals(){var all=read(keys.goals,[]);if(!Array.isArray(all))return[];var seen=Object.create(null),changed=false;var valid=all.filter(function(g){if(g&&(g.category==="Troops"||g.category==="Events")){g.category="Other";changed=true;}if(!validGoalRecord(g)||seen[g.id])return false;seen[g.id]=true;return true;});if(changed){try{localStorage.setItem(keys.goals,JSON.stringify(valid));}catch(e){}}return valid;}
function saveGoals(goals,message){try{localStorage.setItem(keys.goals,JSON.stringify(goals));if(goalStatus)goalStatus.textContent=message||"Goal saved on this device.";renderGoals();return true;}catch(e){if(goalStatus)goalStatus.textContent="Browser storage unavailable; the goal was not saved.";return false;}}
function renderGoals(){
 if(!goalList)return;
 var goals=readGoals(),done=goals.filter(function(g){return g.done;}).length;
 goals.sort(function(a,b){if(a.done!==b.done)return a.done?1:-1;if(a.dueDate&&b.dueDate)return a.dueDate.localeCompare(b.dueDate);if(a.dueDate)return-1;if(b.dueDate)return 1;return a.title.localeCompare(b.title);});
 var value=$("dashboard-goal-value");if(value)value.textContent=done+" / "+goals.length;
 var count=$("dashboard-goal-count");if(count)count.textContent=(goals.length-done)+" active · "+done+" complete";
 goalList.replaceChildren();
 if(!goals.length){goalList.append(el("p","small muted","No personal goals yet. Add a milestone when you are ready."));}
 goals.forEach(function(goal){
  var row=el("article","dashboard-goal-item"+(goal.done?" is-complete":"")),main=el("div","dashboard-goal-main"),label=el("label","dashboard-goal-check"),check=document.createElement("input");
  check.type="checkbox";check.checked=goal.done;check.setAttribute("aria-label","Complete goal: "+goal.title);
  check.addEventListener("change",function(){var latest=readGoals();latest.forEach(function(item){if(item.id===goal.id)item.done=check.checked;});saveGoals(latest,check.checked?"Goal marked complete.":"Goal reopened.");});
  label.append(check,el("span","",goal.title));
  var meta=el("div","dashboard-goal-meta");meta.append(el("span","",goal.category));
  if(goal.dueDate){var date=new Date(goal.dueDate+"T00:00:00");meta.append(el("span","", "Target "+new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(date)));}
  if(goal.note)meta.append(el("span","",goal.note));
  main.append(label,meta);
  var actions=el("div","dashboard-goal-actions"),destination=goalLinks[goal.category]||goalLinks.Other,link=el("a","",destination[1]),remove=el("button","btn secondary","Remove");
  link.href=destination[0];remove.type="button";remove.setAttribute("aria-label","Remove goal: "+goal.title);
  remove.addEventListener("click",function(){saveGoals(readGoals().filter(function(item){return item.id!==goal.id;}),"Goal removed.");});
  actions.append(link,remove);row.append(main,actions);goalList.append(row);
 });
 if(goalClear)goalClear.disabled=done===0;
}
function render(){
 var hq=read(keys.hq,{}),research=read(keys.research,{}),beginner=read(keys.beginner,{});
 var researchNames=Object.keys(research).filter(function(k){return research[k]==="Done"||research[k]==="In progress";});
 var researchDone=researchNames.filter(function(k){return research[k]==="Done";}).length;
 var hqDone=Object.keys(hq).filter(function(k){return hq[k]===true;}).length;
 var beginnerDone=["account","hq","research"].filter(function(k){return beginner[k]===true;}).length;
 $("dashboard-hq-value").textContent=profile.currentHq?"HQ "+profile.currentHq:"Not set";
 $("dashboard-research-value").textContent=researchDone+" / "+researchNames.length;
 renderGoals();
 var next=$("dashboard-next-action"),primary;
 if(!profile.currentHq)primary=card("Set your current HQ","Your HQ level is the starting point for useful upgrade planning. Add the level shown in your game; LZ Carry does not read your account automatically.","#dashboard-hq","Set HQ level");
 else if(hqDone===0)primary=card("Plan your next HQ upgrade","Your HQ level is saved, but no prerequisite progress is marked yet. Review the next target and confirm each building requirement in game.","beginner.html#hq-planner-section","Open HQ planner");
 else if(researchNames.length===0)primary=card("Start a Laboratory route","No research progress is tracked yet. Choose a route in the Laboratory and record the steps you have verified in game.","research.html#lab-planner","Start research planning");
 else if(researchDone<researchNames.length)primary=card("Continue Laboratory research",researchNames.length-researchDone+" tracked research item(s) are not marked complete. Review the live prerequisites before committing resources.","research.html#lab-planner","Resume research");

 else if(beginnerDone<3)primary=card("Complete your next progression milestone",beginnerDone+" of 3 Beginner Mode milestones are checked. Continue the guided path at your own pace.","beginner.html#beginner-mode","Continue Beginner Mode");
 else primary=card("Review your saved account plan","Your HQ, research and beginner progress are saved locally. Recheck live game requirements after your next milestone.","beginner.html","Review progression");
 if(next){primary.classList.add("dashboard-next-action-card");next.replaceChildren(primary);}
 var rec=$("dashboard-recommendations");rec.replaceChildren();
 if(!profile.currentHq)rec.append(card("Set your current HQ","Add your current HQ level to personalize your next planning steps. This is player-entered, not read from your game account.","#dashboard-hq","Set HQ level"));
 else rec.append(card("Plan your next HQ upgrade","Use the HQ planner to review community-reported prerequisites and compare source values before spending.","beginner.html#hq-planner-section","Open HQ planner"));
 if(researchNames.length===0||researchDone<researchNames.length)rec.append(card("Continue Laboratory research","Your research route is saved locally. Review disputed gates in the live Laboratory before committing resources.","research.html#lab-planner","Resume research"));

 if(beginnerDone<3)rec.append(card("Follow Beginner Mode","Complete the guided foundations checklist at your own pace. It links to the existing planners rather than duplicating them.","beginner.html#beginner-mode","Continue beginner path"));
 if(!rec.children.length)rec.append(card("Review your saved progress","Your local trackers look complete. Recheck current game requirements and update your saved progress when your account changes.","beginner.html","Review progression"));
 if(primary){var primaryTitle=(primary.querySelector("strong")||{}).textContent;[].slice.call(rec.children).forEach(function(item){var title=(item.querySelector("strong")||{}).textContent;if(title===primaryTitle)item.remove();});}
}
if(goalForm)goalForm.addEventListener("submit",function(e){e.preventDefault();var title=$("dashboard-goal-title").value.trim(),category=$("dashboard-goal-category").value,dueDate=$("dashboard-goal-due").value,note=$("dashboard-goal-note").value.trim(),goals=readGoals();if(!title){goalStatus.textContent="Enter a goal before saving.";return;}if(goals.length>=30){goalStatus.textContent="You can keep up to 30 personal goals. Remove an old goal first.";return;}goals.push({id:"goal-"+Date.now()+"-"+goals.length,title:title,category:category,dueDate:dueDate,note:note,done:false,createdAt:new Date().toISOString()});if(saveGoals(goals,"Personal goal saved on this device."))goalForm.reset();});
if(goalClear)goalClear.addEventListener("click",function(){var goals=readGoals(),done=goals.filter(function(g){return g.done;}).length;if(!done)return;if(!confirm("Clear "+done+" completed personal goal(s)?"))return;saveGoals(goals.filter(function(g){return !g.done;}),"Completed goals cleared.");});
$("dashboard-save").addEventListener("click",function(){var n=Number(select.value);if(!Number.isInteger(n)||n<1||n>35){profile={};localStorage.removeItem(profileKey);status.textContent="Current HQ cleared."; }else{profile.currentHq=n;profile.updatedAt=new Date().toISOString();try{localStorage.setItem(profileKey,JSON.stringify(profile));status.textContent="Your HQ level was saved on this device.";}catch(e){status.textContent="Browser storage unavailable; your HQ level was not saved.";}}render();});
render();
})();
