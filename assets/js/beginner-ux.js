/* Beginner page: put the guided checklist first and progressively disclose long reference text. */
(function(){
"use strict";
var main=document.querySelector("main"),mode=document.getElementById("beginner-mode"),guide=document.querySelector(".beginner-field-guide");
if(!main)return;
var category=[].slice.call(main.querySelectorAll(":scope > section")).find(function(section){return section.querySelector(".grid")&&!section.id&&!section.classList.contains("beginner-field-guide");});
if(mode&&category)main.insertBefore(mode,category);
function collapse(section,className,title,subtitle){
if(!section||section.querySelector("."+className))return;
var wrap=section.querySelector(".wrap");if(!wrap)return;
var details=document.createElement("details");details.className=className;
var summary=document.createElement("summary"),strong=document.createElement("strong");strong.textContent=title;summary.appendChild(strong);
if(subtitle){var small=document.createElement("span");small.className="small muted";small.textContent=subtitle;summary.appendChild(small);}
var content=document.createElement("div");content.className="beginner-reference-content";
while(wrap.firstChild)content.appendChild(wrap.firstChild);
details.append(summary,content);wrap.appendChild(details);
}
collapse(category,"beginner-category-disclosure","Browse beginner topics","Account setup, HQ progression and daily routine");
collapse(guide,"beginner-reference-disclosure","Detailed beginner reference","Six practical topics with links to the existing tools");
})();
