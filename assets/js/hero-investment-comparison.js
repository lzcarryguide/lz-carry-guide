/* Side-by-side hero reference comparison; no automatic ranking or invented combat score. */
(function(){
"use strict";
var root=document.getElementById("hero-investment-compare");if(!root)return;
var key="lzcarry-hero-investment-compare-v1",ids=["hero-compare-a-current","hero-compare-a-target","hero-compare-a-stars","hero-compare-b-current","hero-compare-b-target","hero-compare-b-stars"],state={};
try{state=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){state={};}
var selectA=document.getElementById("hero-compare-a"),selectB=document.getElementById("hero-compare-b"),results=document.getElementById("hero-investment-results"),status=document.getElementById("hero-compare-status"),heroes=[];
function node(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function save(){state={a:selectA.value,b:selectB.value};ids.forEach(function(id){state[id]=document.getElementById(id).value;});try{localStorage.setItem(key,JSON.stringify(state));status.textContent="Comparison notes saved on this device."; }catch(e){status.textContent="Browser storage unavailable; comparison notes may not persist.";}}
function field(card,label,value){var p=node("p","",label+": "+(value===null||value===undefined||value===""?"Not confirmed":value));card.appendChild(p);}
function profile(hero,side){
var card=node("article","hero-investment-profile",""),title=node("h3","",hero.name),badge=node("span","pill",hero.verificationStatus||"Unconfirmed");
card.append(title,badge);
field(card,"Faction",hero.faction);field(card,"Troop type",hero.troopType);field(card,"Rarity",hero.rarity);field(card,"Indexed role",hero.role);field(card,"Season",hero.season===0?"Base roster":(hero.season===null||hero.season===undefined)?"Not confirmed":"Season "+hero.season);
var notes=hero.profileNotes||{},skills=Array.isArray(notes.skills)?notes.skills:[];
field(card,"Skill evidence",skills.length?skills.length+" community-indexed skill note(s)":"No reconciled skill notes");
field(card,"Investment note",notes.investment||hero.investmentNote||"No hero-specific investment note published");
field(card,"Source confidence",notes.sourceConfidence||notes.evidence||"No separate source-confidence note");
field(card,"Your current level",document.getElementById("hero-compare-"+side+"-current").value);
field(card,"Your target level",document.getElementById("hero-compare-"+side+"-target").value);
field(card,"Your star / skill note",document.getElementById("hero-compare-"+side+"-stars").value);
return card;
}
function render(){
if(!heroes.length)return;
results.replaceChildren();
var a=heroes.find(function(h){return h.id===selectA.value;}),b=heroes.find(function(h){return h.id===selectB.value;});
if(!a||!b){results.appendChild(node("p","small muted","Choose two heroes to compare their indexed profiles and your own notes."));save();return;}
if(a.id===b.id){results.appendChild(node("p","small muted","Choose two different heroes to compare side by side."));save();return;}
results.append(profile(a,"a"),profile(b,"b"));
var note=node("p","small muted",a.verificationStatus==="Community-supported"&&b.verificationStatus==="Community-supported"?"Both roster identities meet LZ Carry’s community-evidence threshold. This does not certify current skill effects or account-specific value.":"At least one selected record has incomplete or unconfirmed evidence. Treat its identity, season or skill information as provisional.");
results.appendChild(note);save();
}
function fillSelect(select){select.replaceChildren();select.appendChild(new Option("Select a hero",""));heroes.forEach(function(hero){var label=hero.name+" · "+(hero.faction||"Faction pending")+" · "+(hero.troopType||"Troop line pending")+" · "+(hero.verificationStatus||"Unconfirmed");select.appendChild(new Option(label,hero.id));});}
fetch("data/heroes.json").then(function(response){if(!response.ok)throw Error("Hero data request failed");return response.json();}).then(function(data){
heroes=Array.isArray(data.heroes)?data.heroes:[];fillSelect(selectA);fillSelect(selectB);
selectA.value=heroes.some(function(h){return h.id===state.a;})?state.a:(heroes[0]||{}).id||"";
selectB.value=heroes.some(function(h){return h.id===state.b;})?state.b:(heroes[1]||{}).id||"";
ids.forEach(function(id){var input=document.getElementById(id);if(input&&state[id]!==undefined)input.value=String(state[id]);});
selectA.addEventListener("change",render);selectB.addEventListener("change",render);ids.forEach(function(id){document.getElementById(id).addEventListener("input",render);});
render();
}).catch(function(){results.textContent="Hero data could not be loaded. Check the roster source before comparing investments.";status.textContent="Comparison unavailable until the hero roster loads.";});
document.getElementById("hero-compare-reset").addEventListener("click",function(){state={};selectA.value=heroes[0]?heroes[0].id:"";selectB.value=heroes[1]?heroes[1].id:"";ids.forEach(function(id){document.getElementById(id).value="";});try{localStorage.removeItem(key);}catch(e){}render();status.textContent="Comparison reset.";});
})();
