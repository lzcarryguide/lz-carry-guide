/* LZ Carry Events Center — event selection and personal preparation */
(function(){
"use strict";
var results=document.getElementById("event-results");if(!results)return;
var storage="lzcarry-event-checklists-v1",saved={};try{saved=JSON.parse(localStorage.getItem(storage)||"{}")||{};}catch(e){saved={};}
function slug(s){return String(s||"event").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function enhance(){
[].slice.call(results.querySelectorAll("details.event-profile")).forEach(function(card){
if(card.dataset.uxReady==="1")return;card.dataset.uxReady="1";
card.addEventListener("toggle",function(){if(card.open)[].slice.call(results.querySelectorAll("details.event-profile")).forEach(function(other){if(other!==card)other.open=false;});});
var name=(card.querySelector("summary h3")||{}).textContent||"Event",key=slug(name),body=card.querySelector(".profile-body");if(!body)return;
var prepHead=[].slice.call(body.querySelectorAll("h4")).find(function(h){return /^preparation$/i.test(h.textContent.trim());});
if(!prepHead)return;
var source=prepHead.nextElementSibling;if(!source||source.tagName!=="UL")return;
var items=[].slice.call(source.querySelectorAll("li"));if(!items.length)return;
var wrap=document.createElement("section");wrap.className="event-personal-checklist";
var title=document.createElement("div");title.className="event-checklist-heading";var h=document.createElement("strong");h.textContent="My preparation checklist";var progress=document.createElement("span");progress.className="small muted";title.append(h,progress);wrap.appendChild(title);
var list=document.createElement("div");list.className="event-checklist-items";wrap.appendChild(list);
var state=saved[key]||{};
items.forEach(function(item,index){var label=document.createElement("label");label.className="event-check-item";var input=document.createElement("input");input.type="checkbox";input.checked=!!state[index];var text=document.createElement("span");text.textContent=item.textContent;input.addEventListener("change",function(){state[index]=input.checked;saved[key]=state;try{localStorage.setItem(storage,JSON.stringify(saved));}catch(e){}update();});label.append(input,text);list.appendChild(label);});
function update(){var n=items.filter(function(_,i){return!!state[i];}).length;progress.textContent=n+" / "+items.length+" ready";wrap.dataset.complete=String(n===items.length);}
update();source.insertAdjacentElement("afterend",wrap);
});
}
var observer=new MutationObserver(enhance);observer.observe(results,{childList:true,subtree:true});enhance();
["event-routines","weekly-cycle","event-planning"].forEach(function(id){var section=document.getElementById(id);if(!section||section.querySelector(".event-reference-disclosure"))return;var wrap=section.querySelector(".wrap");if(!wrap)return;var heading=wrap.querySelector("h2"),title=heading?heading.textContent.trim():"Additional event reference";var details=document.createElement("details");details.className="event-reference-disclosure";var summary=document.createElement("summary");var heading=wrap.querySelector("h2");if(heading)summary.appendChild(heading);else summary.textContent=title;var content=document.createElement("div");content.className="event-reference-content";while(wrap.firstChild){var node=wrap.firstChild;if(node===heading){wrap.removeChild(node);continue;}content.appendChild(node);}details.append(summary,content);wrap.appendChild(details);});
})();