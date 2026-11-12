/* LZ Carry Research Center — compact progress layer */
(function(){
"use strict";
var root=document.getElementById("tree-map");if(!root)return;
var cards=[].slice.call(root.querySelectorAll(".research-tree-card"));
if(!cards.length)return;
var key="lzcarry-research-plan-v1",state={};
try{state=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){state={};}
var panel=document.createElement("section");panel.className="research-progress-panel";panel.setAttribute("aria-label","Research progress");
panel.innerHTML='<div class="research-progress-top"><div><span class="eyebrow">Your research · This device</span><h2>Progress tracker</h2><p class="small muted" id="research-progress-copy">Mark each tree as you work through it. Your progress stays in this browser.</p></div><button class="btn secondary" type="button" id="research-progress-reset">Reset progress</button></div><div class="research-progress-meter"><div class="research-progress-track"><span id="research-progress-fill"></span></div><strong id="research-progress-value">0%</strong></div><div class="research-next" id="research-next" aria-live="polite"></div>';
var controls=root.querySelector(".research-controls");if(controls)controls.insertAdjacentElement("afterend",panel);else root.insertBefore(panel,root.firstChild);
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}}
function label(card){var h=card.querySelector("summary h3");return h?h.textContent.trim():"";}
function update(){
var done=0,active=0,high=[];
cards.forEach(function(card){var s=state[label(card)]||"Not started";if(s==="Done")done++;if(s==="In progress")active++;var priority=[].slice.call(card.querySelectorAll(".research-tree-body p")).find(function(p){return /^Priority:/i.test(p.textContent.trim());});if(priority&&/high/i.test(priority.textContent)&&s!=="Done")high.push({name:label(card),note:priority.textContent.replace(/^Priority:\s*/i,"")});});
var pct=Math.round(done/cards.length*100),fill=document.getElementById("research-progress-fill");
if(fill)fill.style.width=pct+"%";
var value=document.getElementById("research-progress-value");if(value)value.textContent=pct+"%";
var copy=document.getElementById("research-progress-copy");if(copy)copy.textContent=done+" of "+cards.length+" research trees complete · "+active+" in progress";
var next=document.getElementById("research-next");if(next){next.replaceChildren();var strong=document.createElement("strong");strong.textContent="Recommended next research";var p=document.createElement("p");p.textContent=high.length?high[0].name+" — "+high[0].note:"No high-priority incomplete entry is identified by the current research notes. Review your next unlock in the live Laboratory.";next.append(strong,p);}
cards.forEach(function(card){var s=state[label(card)]||"Not started",summary=card.querySelector("summary");var badge=summary&&summary.querySelector(".research-progress-badge");if(!badge&&summary){badge=document.createElement("span");badge.className="research-progress-badge";summary.appendChild(badge);}if(badge){badge.textContent=s==="Done"?"Complete":s==="In progress"?"In progress":"Not started";badge.dataset.state=s==="Done"?"complete":s==="In progress"?"in-progress":"not-started";}});
}
cards.forEach(function(card){
var body=card.querySelector(".research-tree-body");if(!body)return;
var row=document.createElement("div");row.className="research-entry-controls";
var labelNode=document.createElement("label");labelNode.textContent="My progress";
var select=document.createElement("select");select.setAttribute("aria-label","Research tree "+label(card)+" progress");
["Not started","In progress","Done"].forEach(function(v){var o=document.createElement("option");o.value=v;o.textContent=v;select.appendChild(o);});
select.value=state[label(card)]||"Not started";
select.addEventListener("change",function(){state[label(card)]=select.value;save();window.dispatchEvent(new CustomEvent("lzcarry-research-progress-change",{detail:state}));update();});
labelNode.appendChild(select);row.appendChild(labelNode);
var hint=document.createElement("span");hint.className="small muted";hint.textContent="Personal checklist · saved on this device";row.appendChild(hint);
body.appendChild(row);
});
var reset=document.getElementById("research-progress-reset");if(reset)reset.addEventListener("click",function(){if(!window.confirm("Reset your research progress on this device?"))return;state={};save();window.dispatchEvent(new CustomEvent("lzcarry-research-progress-change",{detail:state}));cards.forEach(function(c){var s=c.querySelector(".research-entry-controls select");if(s)s.value="Not started";});update();});
update();
var optional=[].slice.call(document.querySelectorAll("main>section")).find(function(s){var h=s.querySelector("h2");return h&&/optional reference panels/i.test(h.textContent);});
if(optional&&!optional.querySelector(".research-reference-disclosure")){var wrap=optional.querySelector(".wrap");if(wrap){var details=document.createElement("details");details.className="research-reference-disclosure";var summary=document.createElement("summary");var heading=wrap.querySelector("h2");if(heading)summary.appendChild(heading);else summary.textContent="Advanced research notes & reference panels";var content=document.createElement("div");content.className="research-reference-content";while(wrap.firstChild){var node=wrap.firstChild;if(node===heading){wrap.removeChild(node);continue;}content.appendChild(node);}details.append(summary,content);wrap.appendChild(details);}}
})();