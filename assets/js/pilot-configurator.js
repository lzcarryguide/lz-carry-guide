/* LZ Carry Pilot package selector — pricing only, no payment processing */
(function(){
"use strict";
var form=document.getElementById("pilot-configurator");if(!form)return;
var output=document.getElementById("pilot-booking-summary"),total=document.getElementById("pilot-total"),status=document.getElementById("pilot-price-status");
var packages={
daily:{name:"Daily Pilot",price:3,unit:"day",items:["Full Preparedness","Boomer","Mines","Melee","Arena","Fury Lord"]},
saturday:{name:"Saturday Special",price:8,unit:"fixed",items:["All Daily Pilot services","Enemy Buster RSS loot-cap assistance"]},
weekly:{name:"Weekly Elite Management",price:30,unit:"fixed",items:["7 days of Daily Piloting (Full Preparedness, Boomer, Mines, Melee, Arena and Fury Lord)","Saturday Enemy Buster participation and RSS Loot-Cap assistance","Upgrade planning and progression","Account management","Alliance tasks, Monday–Saturday"]}
};
function val(name){var el=form.querySelector('[name="'+name+'"]:checked')||form.querySelector('[name="'+name+'"]');return el?el.value:"";}
function checked(name){var el=form.querySelector('[name="'+name+'"]');return!!(el&&el.checked);}
function num(name,min,max){var el=form.querySelector('[name="'+name+'"]'),v=el?Number(el.value):min,result=Math.floor(Math.min(max,Math.max(min,Number.isFinite(v)?v:min)));if(el&&el.value!==String(result))el.value=String(result);return result;}
function line(label,value){var li=document.createElement("li");var strong=document.createElement("strong");strong.textContent=label+": ";li.append(strong,document.createTextNode(value));return li;}
function render(){
var pkg=val("package")||"daily",item=packages[pkg],days=num("days",1,Infinity),svsAccounts=num("svs-accounts",1,3),fullAccounts=num("full-svs-accounts",1,20),canyonAccounts=num("canyon-accounts",1,20);
var base=pkg==="daily"?item.price*days:item.price,extras=0,quote=false,summary=document.createElement("div"),addOns=[],summaryList=document.createElement("ul");
summaryList.appendChild(line("Package",item.name+(pkg==="daily"?" · "+days+" day"+(days===1?"":"s"):"")));
summaryList.appendChild(line("Included services",item.items.join(" · ")));
if(checked("svs-chest")){var svsTotal=5*svsAccounts;extras+=svsTotal;addOns.push("SVS Chest Opening — $5 per account × "+svsAccounts+" account"+(svsAccounts===1?"":"s")+" = $"+svsTotal+". Each account is charged separately; maximum capacity 2–3 accounts.");}
if(checked("full-svs")){quote=true;addOns.push("Full SVS Participation — individual quote for "+fullAccounts+" account"+(fullAccounts===1?"":"s")+" (participation time and workload)");}
if(checked("canyon")){extras+=8*canyonAccounts;addOns.push("Canyon Clash — $8 × "+canyonAccounts+" account"+(canyonAccounts===1?"":"s")+" = $"+(8*canyonAccounts)+" (approximately 45 minutes per account)");}
summaryList.appendChild(line("Optional add-ons",addOns.length?addOns.join(" · "):"None selected"));
summaryList.appendChild(line("Known subtotal","$"+(base+extras)));
if(quote)summaryList.appendChild(line("Additional quote","Full SVS Participation is priced individually per account and is not included in the subtotal."));
summary.appendChild(summaryList);output.replaceChildren(summary);
total.textContent="$"+(base+extras)+(quote?" + SVS quote":"");
status.textContent=quote?"Known subtotal excludes the individually quoted Full SVS Participation.":"Calculated from the published package and add-on prices.";
var daysField=document.getElementById("pilot-days-field");if(daysField)daysField.hidden=pkg!=="daily";
var svsField=document.getElementById("pilot-svs-accounts-field");if(svsField)svsField.hidden=!checked("svs-chest");
var fullField=document.getElementById("pilot-full-svs-accounts-field");if(fullField)fullField.hidden=!checked("full-svs");
var canyonField=document.getElementById("pilot-canyon-accounts-field");if(canyonField)canyonField.hidden=!checked("canyon");
var req=document.getElementById("pilot-request");var help=document.getElementById("pilot-assistance");
if(req){var requestReady=!!req.dataset.destination;req.disabled=!requestReady;req.textContent=requestReady?"Request a Pilot":"Request a Pilot — unavailable";req.title=requestReady?"":"The existing Discord ticket URL could not be recovered from the repository." ;if(requestReady)req.removeAttribute("aria-describedby");else req.setAttribute("aria-describedby","pilot-contact-status");}
if(help){var helpReady=!!help.dataset.destination;help.disabled=!helpReady;help.textContent=helpReady?"Ask for Assistance":"Ask for Assistance — unavailable";help.title=helpReady?"":"The existing Discord service channel URL could not be recovered from the repository.";if(helpReady)help.removeAttribute("aria-describedby");else help.setAttribute("aria-describedby","pilot-contact-status");}
}
form.addEventListener("input",render);form.addEventListener("change",render);
var copy=document.getElementById("pilot-copy-summary");if(copy)copy.addEventListener("click",function(){var text=output.innerText+"\nTotal: "+total.textContent;var area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();try{document.execCommand("copy");copy.textContent="Summary copied";}catch(e){copy.textContent="Select and copy the summary above";}area.remove();});
render();
[["pilot-request","pilot-assistance"]].forEach(function(ids){ids.forEach(function(id){var button=document.getElementById(id);if(button)button.addEventListener("click",function(){if(button.dataset.destination)window.location.assign(button.dataset.destination);});});});
})();