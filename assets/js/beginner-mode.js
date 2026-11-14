/* Beginner Mode checklist; player-entered completion only. */
(function(){
"use strict";
var root=document.getElementById("beginner-mode");if(!root)return;
var key="lzcarry-beginner-mode-v1",state={};
try{state=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){state={};}
if(state&&typeof state==="object"&&!Array.isArray(state)&&Object.prototype.hasOwnProperty.call(state,"events")){delete state.events;try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}}
var boxes=Array.from(root.querySelectorAll("[data-step]")),out=document.getElementById("beginner-progress-text");
function render(){var done=0;boxes.forEach(function(box){var id=box.dataset.step;box.checked=!!state[id];if(box.checked)done++;});out.textContent=done+" of "+boxes.length+" steps complete";}
boxes.forEach(function(box){box.addEventListener("change",function(){state[box.dataset.step]=box.checked;try{localStorage.setItem(key,JSON.stringify(state));}catch(e){out.textContent="Browser storage unavailable; checklist changes may not persist.";return;}render();});});
document.getElementById("beginner-reset").addEventListener("click",function(){if(!confirm("Reset your Beginner Mode checklist?"))return;state={};try{localStorage.removeItem(key);}catch(e){}render();});
render();
})();
