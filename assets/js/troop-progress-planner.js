/* Troop quantity goal tracker. No costs, unlocks or promotion ratios are inferred. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);},root=$("troop-progress-planner");if(!root)return;
var key="lzcarry-troop-plan-v1",state={};try{state=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){state={};}
var cls=$("troop-plan-class"),tier=$("troop-plan-tier"),current=$("troop-plan-current"),target=$("troop-plan-target"),out=$("troop-plan-result"),records=[];
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}}
function render(){
 current.value=state.current==null?"":state.current;target.value=state.target==null?"":state.target;
 out.replaceChildren();out.appendChild(document.createElement("h3")).textContent="Troop goal";
 var selected=records.find(function(r){return r.id===cls.value;}),selectedTier=selected&&(selected.tiers||[]).find(function(t){return String(t.tier)===tier.value;});
 if(!selected||!selectedTier){out.appendChild(document.createTextNode("Choose a troop class and target tier to start tracking a quantity goal."));return;}
 var name=document.createElement("p");name.textContent="Target: "+selected.name+" · T"+selectedTier.tier+" · "+(selectedTier.unitName||"Name pending");out.appendChild(name);
 var p=document.createElement("p");p.className="small muted";p.textContent="Tier name evidence: "+(selectedTier.nameStatus||"Not reconciled")+". Current game-client confirmation is still required.";out.appendChild(p);
 var have=state.current==null||state.current===""?null:Number(state.current),goal=state.target==null||state.target===""?null:Number(state.target);
 if(have===null||goal===null||!Number.isFinite(have)||!Number.isFinite(goal)||have<0||goal<0||!Number.isInteger(have)||!Number.isInteger(goal)){var note=document.createElement("p");note.textContent="Enter non-negative whole-number counts for both fields to calculate your remaining quantity.";out.appendChild(note);return;}
 var gap=Math.max(0,goal-have),result=document.createElement("strong");result.className="troop-goal-gap";result.textContent=gap===0?"Target reached":gap.toLocaleString("en-US")+" more units needed";out.appendChild(result);
 var detail=document.createElement("p");detail.className="small muted";detail.textContent=gap===0?"Your current quantity meets or exceeds this personal target.":"This is a quantity gap only. It does not mean every lower-tier unit can be promoted or that training is available at this tier.";out.appendChild(detail);
}
function fillTiers(){var selected=records.find(function(r){return r.id===cls.value;});tier.replaceChildren();if(!selected){tier.disabled=true;var empty=document.createElement("option");empty.value="";empty.textContent="Choose class first";tier.append(empty);return;}tier.disabled=false;(selected.tiers||[]).forEach(function(t){var o=document.createElement("option");o.value=String(t.tier);o.textContent="T"+t.tier+" · "+(t.unitName||"Name pending");tier.append(o);});tier.value=state.tier&&selected.tiers.some(function(t){return String(t.tier)===String(state.tier);})?String(state.tier):String(selected.tiers[0].tier);}
fetch("data/troops.json").then(function(r){if(!r.ok)throw Error("Troop data unavailable");return r.json();}).then(function(d){if(d.schemaVersion!==2||!Array.isArray(d.classes))throw Error("Unsupported troop dataset");records=d.classes;records.forEach(function(r){var o=document.createElement("option");o.value=r.id;o.textContent=r.name+" · "+r.faction;cls.append(o);});cls.value=records.some(function(r){return r.id===state.classId;})?state.classId:records[0].id;fillTiers();render();}).catch(function(){out.textContent="Troop database unavailable. Refresh and try again.";});
cls.addEventListener("change",function(){state.classId=cls.value;fillTiers();state.tier=tier.value;save();render();});
tier.addEventListener("change",function(){state.tier=tier.value;save();render();});
[current,target].forEach(function(input){input.addEventListener("input",function(){state[input===current?"current":"target"]=input.value===""?null:Number(input.value);save();render();});});
$("troop-plan-reset").addEventListener("click",function(){state={};try{localStorage.removeItem(key);}catch(e){}current.value="";target.value="";if(records.length){cls.value=records[0].id;fillTiers();}render();});
})();
