/* Speedup planner: arithmetic over values supplied by the player; no game timer assumptions. */
(function(){
"use strict";
var root=document.getElementById("speedup-planner");if(!root)return;
var key="lzcarry-speedup-plan-v1",ids=["speedup-task","speedup-days","speedup-hours","speedup-minutes","speedup-available"],state={};
try{state=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){state={};}
ids.forEach(function(id){var input=document.getElementById(id);if(input&&state[id]!==undefined)input.value=String(state[id]);});
var output=document.getElementById("speedup-results"),status=document.getElementById("speedup-status");
function clamp(id,min,max){var input=document.getElementById(id),raw=input?Number(input.value):min,value=Math.floor(Math.max(min,Math.min(max,Number.isFinite(raw)?raw:min)));if(input&&input.value!==String(value))input.value=String(value);return value;}
function format(minutes){var n=Math.max(0,Math.floor(minutes)),days=Math.floor(n/1440),hours=Math.floor((n%1440)/60),mins=n%60;var parts=[];if(days)parts.push(days+"d");if(hours)parts.push(hours+"h");if(mins||!parts.length)parts.push(mins+"m");return parts.join(" ");}
function render(){
var task=document.getElementById("speedup-task").value||"Building",days=clamp("speedup-days",0,3650),hours=clamp("speedup-hours",0,23),mins=clamp("speedup-minutes",0,59),available=clamp("speedup-available",0,5256000),remaining=days*1440+hours*60+mins,used=Math.min(remaining,available),after=Math.max(0,remaining-available),percent=remaining?Math.round(used/remaining*100):0;
state={};ids.forEach(function(id){var el=document.getElementById(id);state[id]=el.value;});
try{localStorage.setItem(key,JSON.stringify(state));status.textContent="Saved on this device.";}catch(e){status.textContent="Browser storage unavailable; this calculation may not persist.";}
output.replaceChildren();
var heading=document.createElement("strong");heading.textContent=task+" timer · "+format(remaining);output.appendChild(heading);
var track=document.createElement("div");track.className="speedup-progress-track";track.setAttribute("role","progressbar");track.setAttribute("aria-label","Timer covered by available speedups");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","100");track.setAttribute("aria-valuenow",String(percent));var fill=document.createElement("span");fill.style.width=percent+"%";track.appendChild(fill);output.appendChild(track);
var detail=document.createElement("p");detail.className="small";detail.textContent="Available: "+format(available)+" · Applied in estimate: "+format(used)+" · Remaining: "+format(after);output.appendChild(detail);
var note=document.createElement("p");note.className="small muted";note.textContent=remaining===0?"Enter the remaining time shown by your game.":available===0?"Enter your available speedup minutes to estimate the remaining timer.":after===0?"Your entered speedup time covers the full timer, with "+format(available-remaining)+" left over.":"Your entered speedups cover "+percent+"% of the timer; "+format(after)+" remains.";
output.appendChild(note);
}
ids.forEach(function(id){var input=document.getElementById(id);if(input)input.addEventListener("input",render);});
document.getElementById("speedup-reset").addEventListener("click",function(){state={};ids.forEach(function(id){var input=document.getElementById(id);if(!input)return;input.value=id==="speedup-task"?"Building":"0";});try{localStorage.removeItem(key);}catch(e){}render();status.textContent="Speedup planner reset.";});
render();
})();
