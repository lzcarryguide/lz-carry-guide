/* LZ Carry player data portability. Player progress stays local unless explicitly exported. */
(function(){
"use strict";
var script=document.currentScript;if(!script)return;var root=new URL("../../",script.src);
var KEYS=["lzcarry-formation-library-v1","lzcarry:hq-planner:v2","lzcarry-research-plan-v1","lzcarry-event-prep-v2","lzcarry-player-profile-v1","lzcarry-beginner-mode-v1","lzcarry-research-resource-calculator-v1","lzcarry-troop-plan-v1","lzcarry-event-reminders-v1"];
function el(t,c,s){var n=document.createElement(t);if(c)n.className=c;if(s!=null)n.textContent=s;return n;}
var nav=document.querySelector("header nav");if(!nav)return;
var css=document.createElement("link");css.rel="stylesheet";css.href=new URL("assets/css/player-data.css",root).href;document.head.append(css);
var trigger=el("button","player-data-trigger","My Progress");trigger.type="button";trigger.setAttribute("aria-haspopup","dialog");trigger.setAttribute("aria-label","Manage saved LZ Carry progress");nav.append(trigger);
var dialog=el("dialog","player-data-dialog");dialog.setAttribute("aria-labelledby","player-data-title");var panel=el("div","player-data-panel"),head=el("div","player-data-head"),title=el("h2","","Save & manage progress");title.id="player-data-title";var close=el("button","player-data-close","Close");close.type="button";head.append(title,close);
var intro=el("p","small muted","Your planners save progress in this browser. Export a backup before changing devices or clearing browser data."),summary=el("p","player-data-summary","");summary.setAttribute("aria-live","polite");
var exp=el("button","btn","Export my progress");exp.type="button";var imp=el("button","btn secondary","Import a backup");imp.type="button";var file=el("input","player-data-file");file.type="file";file.accept="application/json,.json";file.hidden=true;file.setAttribute("aria-label","Choose a LZ Carry progress backup JSON file");
var actions=el("div","player-data-actions");actions.append(exp,imp);var note=el("p","small muted","Import replaces matching saved planner data on this device. A rollback snapshot is created first. Never upload passwords, verification codes or account credentials.");panel.append(head,intro,summary,actions,file,note);dialog.append(panel);document.body.append(dialog);
function read(){var data={};KEYS.forEach(function(k){var v=localStorage.getItem(k);if(v!==null){try{data[k]=JSON.parse(v);}catch(_){data[k]=v;}}});return data;}
function refresh(){try{var d=read();summary.textContent=Object.keys(d).length+" of "+KEYS.length+" saved data sets found on this device · "+Math.ceil(new Blob([JSON.stringify(d)]).size/1024)+" KB";}catch(_){summary.textContent="Browser storage is unavailable.";}}
function download(name,text){var u=URL.createObjectURL(new Blob([text],{type:"application/json"})),a=el("a","");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},1000);}
trigger.addEventListener("click",function(){refresh();dialog.showModal?dialog.showModal():dialog.setAttribute("open","");});close.addEventListener("click",function(){dialog.close();});dialog.addEventListener("click",function(e){if(e.target===dialog)dialog.close();});
exp.addEventListener("click",function(){try{var b={format:"lz-carry-player-data",schemaVersion:1,exportedAt:new Date().toISOString(),app:"LZ Carry",data:read()};download("lz-carry-progress-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(b,null,2));summary.textContent="Backup exported. Keep the JSON file somewhere safe.";}catch(_){summary.textContent="Export failed. Check browser storage and try again."; }});
imp.addEventListener("click",function(){file.click();});
file.addEventListener("change",async function(){var f=file.files&&file.files[0];if(!f)return;try{
if(f.size>2097152)throw Error("Backup is larger than 2 MB.");var p=JSON.parse(await f.text());if(!p||p.format!=="lz-carry-player-data"||p.schemaVersion!==1||!p.data||typeof p.data!=="object"||Array.isArray(p.data))throw Error("Unsupported LZ Carry backup.");
var incoming={};Object.keys(p.data).forEach(function(k){if(KEYS.indexOf(k)<0)throw Error("Unsupported data key.");var v=p.data[k];if(k==="lzcarry-formation-library-v1"&&(!Array.isArray(v)||v.length>500))throw Error("Invalid saved formation data.");if(k==="lzcarry-event-reminders-v1"&&(!Array.isArray(v)||v.length>30||!v.every(function(x){return x&&typeof x.name==="string"&&typeof x.when==="string";})))throw Error("Invalid event reminder data.");if(k!=="lzcarry-formation-library-v1"&&k!=="lzcarry-event-reminders-v1"&&(!v||typeof v!=="object"||Array.isArray(v)))throw Error("Invalid planner progress data: "+k);incoming[k]=JSON.stringify(v);});
if(!Object.keys(incoming).length)throw Error("Backup contains no saved planner data.");if(!confirm("Import "+Object.keys(incoming).length+" data set(s)? Matching progress on this device will be replaced."))return;
var before={};KEYS.forEach(function(k){before[k]=localStorage.getItem(k);});localStorage.setItem("lzcarry-player-data-rollback-v1",JSON.stringify({savedAt:new Date().toISOString(),values:before}));
try{Object.keys(incoming).forEach(function(k){localStorage.setItem(k,incoming[k]);});}catch(e){KEYS.forEach(function(k){if(before[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,before[k]);});throw e;}
refresh();summary.textContent="Progress imported successfully. Reload planner pages to display restored data.";
}catch(e){summary.textContent=e.message||"Import failed. No data was imported.";}file.value="";});
})();
