/* LZ Carry Pilot package selector — pricing only, no payment processing */
(function(){
"use strict";
var form=document.getElementById("pilot-configurator");if(!form)return;
var output=document.getElementById("pilot-booking-summary"),total=document.getElementById("pilot-total"),status=document.getElementById("pilot-price-status");
var packages={
daily:{name:"Daily Pilot",price:3,unit:"day",items:["Full Preparedness","Boomer","Mines","Melee","Arena","Fury Lord"]},
saturday:{name:"Saturday Special",price:8,unit:"fixed",items:["All Daily Pilot services","Enemy Buster RSS loot-cap assistance"]},
weekly:{name:"Weekly Elite Management",price:30,unit:"fixed",items:["Daily Pilot services for 7 days","Saturday Enemy Buster RSS loot-cap assistance","Upgrade planning and prioritization","Account progression management","Resource usage guidance","Alliance vs Alliance tasks, Monday–Saturday"]}
};
function val(name){var el=form.querySelector('[name="'+name+'"]:checked')||form.querySelector('[name="'+name+'"]');return el?el.value:"";}
function checked(name){var el=form.querySelector('[name="'+name+'"]');return!!(el&&el.checked);}
function num(name,min,max){var el=form.querySelector('[name="'+name+'"]'),v=el?Number(el.value):min;return Math.min(max,Math.max(min,Number.isFinite(v)?v:min));}
function line(label,value){var li=document.createElement("li");var strong=document.createElement("strong");strong.textContent=label+": ";li.append(strong,document.createTextNode(value));return li;}
function render(){
var pkg=val("package")||"daily",item=packages[pkg],days=num("days",1,7),svsAccounts=num("svs-accounts",2,3),fullAccounts=num("full-svs-accounts",1,20),canyonAccounts=num("canyon-accounts",1,20);
var base=pkg==="daily"?item.price*days:item.price,extras=0,quote=false,summary=document.createElement("div");
summary.appendChild(line("Package",item.name+(pkg==="daily"?" · "+days+" day"+(days===1?"":"s"):"")));
summary.appendChild(line("Included services",item.items.join(" · ")));
var addOns=[];
if(checked("svs-chest")){extras+=5;addOns.push("SVS Chest Opening — $5 (covers "+svsAccounts+" accounts)");}
if(checked("full-svs")){quote=true;addOns.push("Full SVS Participation — individual quote for "+fullAccounts+" account"+(fullAccounts===1?"":"s"));}
if(checked("canyon")){extras+=8*canyonAccounts;addOns.push("Canyon Clash — $8 × "+canyonAccounts+" account"+(canyonAccounts===1?"":"s")+" = $"+(8*canyonAccounts)+" (approximately 45 minutes per account)");}
summary.appendChild(line("Optional add-ons",addOns.length?addOns.join(" · "):"None selected"));
summary.appendChild(line("Known subtotal","$"+(base+extras)));
if(quote)summary.appendChild(line("Additional quote","Full SVS Participation is priced individually per account and is not included in the subtotal."));
output.replaceChildren(summary);
total.textContent="$"+(base+extras)+(quote?" + SVS quote":"");
status.textContent=quote?"Known subtotal excludes the individually quoted Full SVS Participation.":"Calculated from the published package and add-on prices.";
var daysField=document.getElementById("pilot-days-field");if(daysField)daysField.hidden=pkg!=="daily";
var svsField=document.getElementById("pilot-svs-accounts-field");if(svsField)svsField.hidden=!checked("svs-chest");
var fullField=document.getElementById("pilot-full-svs-accounts-field");if(fullField)fullField.hidden=!checked("full-svs");
var canyonField=document.getElementById("pilot-canyon-accounts-field");if(canyonField)canyonField.hidden=!checked("canyon");
var req=document.getElementById("pilot-request");var help=document.getElementById("pilot-assistance");
if(req){req.disabled=!req.dataset.destination;req.title=req.disabled?"The existing Discord ticket URL has not yet been configured.":"";}
if(help){help.disabled=!help.dataset.destination;help.title=help.disabled?"The existing Discord service channel URL has not yet been configured.":"";}
}
form.addEventListener("input",render);form.addEventListener("change",render);
var copy=document.getElementById("pilot-copy-summary");if(copy)copy.addEventListener("click",function(){var text=output.innerText+"\nTotal: "+total.textContent;var area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();try{document.execCommand("copy");copy.textContent="Summary copied";}catch(e){copy.textContent="Select and copy the summary above";}area.remove();});
render();
[["pilot-request","pilot-assistance"]].forEach(function(ids){ids.forEach(function(id){var button=document.getElementById(id);if(button)button.addEventListener("click",function(){if(button.dataset.destination)window.location.assign(button.dataset.destination);});});});
})();