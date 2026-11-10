/* Manual research cost calculator. It never supplies or guesses game costs. */
(function(){
"use strict";
var root=document.getElementById("research-resource-calculator");if(!root)return;
var key="lzcarry-research-resource-calculator-v1",inputs=Array.from(root.querySelectorAll("input[data-resource]")),out=document.getElementById("research-resource-results"),state={};
try{state=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){state={};}
var fmt=new Intl.NumberFormat("en-US",{maximumFractionDigits:3});
function render(){
 var lines=[],complete=true;
 inputs.forEach(function(input){var k=input.dataset.resource+"-"+input.dataset.kind;input.value=state[k]==null?"":state[k];});
 ["food","wood","zent","steel","badges"].forEach(function(resource){
  var available=state[resource+"-available"],cost=state[resource+"-cost"];
  if(available==null||cost==null||available===""||cost===""){complete=false;return;}
  var have=Number(available),need=Number(cost);if(!Number.isFinite(have)||!Number.isFinite(need)||have<0||need<0){complete=false;return;}
  var deficit=Math.max(0,need-have),remaining=Math.max(0,have-need);
  lines.push({name:resource.charAt(0).toUpperCase()+resource.slice(1),deficit:deficit,remaining:remaining});
 });
 out.replaceChildren();var h=document.createElement("h3");h.textContent="Resource balance";out.append(h);
 if(!lines.length){var p=document.createElement("p");p.textContent="Enter available amounts and planned costs to calculate your shortfall.";out.append(p);return;}
 var list=document.createElement("dl");list.className="research-resource-totals";
 lines.forEach(function(line){var wrap=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=line.name;dd.textContent=line.deficit?("Short by "+fmt.format(line.deficit)):("Covered · "+fmt.format(line.remaining)+" remaining");dd.className=line.deficit?"resource-shortfall":"resource-covered";wrap.append(dt,dd);list.append(wrap);});
 out.append(list);
 var note=document.createElement("p");note.className="small muted";note.textContent=complete?"All five entered resource balances have been compared.":"Only resources with both values entered are shown; complete the remaining fields for a full comparison.";out.append(note);
}
inputs.forEach(function(input){input.addEventListener("input",function(){var n=input.value;state[input.dataset.resource+"-"+input.dataset.kind]=n===""?null:Number(n);try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}render();});});
document.getElementById("research-resource-reset").addEventListener("click",function(){state={};try{localStorage.removeItem(key);}catch(e){}render();});
render();
})();
