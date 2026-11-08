(() => {
  const root = document.querySelector("#hq-planner-section");
  if (!root) return;
  const currentSelect=root.querySelector("#hq-current"), targetSelect=root.querySelector("#hq-target");
  const stepsNode=root.querySelector("#hq-steps"), totalsNode=root.querySelector("#hq-totals"), progressNode=root.querySelector("#hq-progress");
  const storageKey="lzcarry:hq-planner:v2";
  let records=[], progress={};
  try { progress=JSON.parse(localStorage.getItem(storageKey)||"{}")||{}; } catch (_) { progress={}; }
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch(_){}};
  const fmt=n=>new Intl.NumberFormat("en-US",{maximumFractionDigits:3}).format(n);
  const money=(n)=>n===0?"0":fmt(n)+"M";
  const keyFor=(target,i)=>target+":"+i;
  const setOptions=()=>{
    currentSelect.innerHTML=Array.from({length:35},(_,i)=>'<option value="'+(i+1)+'">HQ '+(i+1)+'</option>').join("");
    targetSelect.innerHTML=currentSelect.innerHTML; currentSelect.value="1"; targetSelect.value="10";
  };
  const render=()=>{
    const from=Number(currentSelect.value);
    targetSelect.querySelectorAll("option").forEach(o=>o.disabled=Number(o.value)<=from);
    if(Number(targetSelect.value)<=from) targetSelect.value=String(Math.min(35,from+1));
    const to=Number(targetSelect.value), chosen=records.filter(r=>r.targetHq>from&&r.targetHq<=to);
    let done=0,total=0;
    const cards=chosen.map(r=>{
      const buildings=r.requiredBuildings||[];
      const buildingHtml=buildings.length?buildings.map((b,i)=>{
        const k=keyFor(r.targetHq,i), checked=!!progress[k]; total++;if(checked)done++;
        return '<label class="hq-check"><input type="checkbox" data-key="'+esc(k)+'" '+(checked?'checked':'')+'><span><strong>'+esc(b.name)+'</strong><small>Required level: '+(Number.isInteger(b.requiredLevel)?esc(b.requiredLevel):'Not listed by source')+' · Community-reported</small></span></label>';
      }).join(""):'<p class="small muted">No prerequisite building listed by the cited table.</p>';
      const x=r.resources||{}, hasCosts=["woodMillions","foodMillions","zentMillions","steelMillions"].every(k=>Number.isFinite(x[k]));
      const costHtml=hasCosts?'<dl class="hq-cost-list"><div><dt>Food</dt><dd>'+money(x.foodMillions)+'</dd></div><div><dt>Wood</dt><dd>'+money(x.woodMillions)+'</dd></div><div><dt>Zent</dt><dd>'+money(x.zentMillions)+'</dd></div><div><dt>Steel</dt><dd>'+money(x.steelMillions)+'</dd></div></dl><p class="small muted">Base HQ construction cost. Source precision: '+esc(x.sourcePrecision||"as published")+'</p><p class="small muted">Base build time: <strong>'+esc(x.duration||"Not listed")+'</strong></p>':'<p class="hq-unknown">Cost not listed in the selected source.</p>';
      const alt=(r.alternateResourceSources||[]).find(s=>s.displayedResources);
      const comparison=alt?'<section class="hq-source-comparison"><h4>Alternate published figures</h4><p class="small muted">'+esc(alt.name)+'</p><dl class="hq-cost-list"><div><dt>Food</dt><dd>'+esc(alt.displayedResources.food)+'</dd></div><div><dt>Wood</dt><dd>'+esc(alt.displayedResources.wood)+'</dd></div><div><dt>Zent</dt><dd>'+esc(alt.displayedResources.zent)+'</dd></div><div><dt>Steel</dt><dd>'+esc(alt.displayedResources.steel)+'</dd></div></dl><p class="small muted">Shown as published (K/M/B); do not combine with the selected source total.</p></section>':'';
      return '<article class="card hq-step"><div class="hq-step-head"><div><p class="eyebrow">Upgrade step</p><h3>HQ '+r.targetHq+'</h3></div><span class="pill">Community sourced</span></div><div class="hq-step-grid"><section><h4>Prerequisite buildings</h4>'+buildingHtml+'</section><section><h4>HQ upgrade resources</h4>'+costHtml+comparison+'</section></div><p class="small muted">Sources: '+unique.map(sourceLink).join(" · ")+'</p><p class="small muted">'+esc(r.notes||"Community reference; compare values and confirm account-specific costs in game.")+'</p></article>';
    }).join("");
    stepsNode.innerHTML=cards||'<div class="card"><h3>Choose a higher target HQ</h3><p>Select a target above your current level to see its upgrade steps.</p></div>';
    progressNode.textContent=total?done+" of "+total+" prerequisite checks marked complete":"No prerequisite checks listed in this range";
    const complete=chosen.length>0&&chosen.every(r=>r.resources&&["woodMillions","foodMillions","zentMillions","steelMillions"].every(k=>Number.isFinite(r.resources[k])));
    if(complete){
      const sum={foodMillions:0,woodMillions:0,zentMillions:0,steelMillions:0};
      chosen.forEach(r=>Object.keys(sum).forEach(k=>sum[k]+=r.resources[k]));
      totalsNode.innerHTML='<h3>Estimated published-source totals · HQ '+(from+1)+' to HQ '+to+'</h3><p class="small muted">Sum of the Last Z Guides per-level table for upgrades above your current HQ. Figures inherit its displayed precision and may differ by account/server/version.</p><dl class="hq-cost-list"><div><dt>Food</dt><dd>'+money(sum.foodMillions)+'</dd></div><div><dt>Wood</dt><dd>'+money(sum.woodMillions)+'</dd></div><div><dt>Zent</dt><dd>'+money(sum.zentMillions)+'</dd></div><div><dt>Steel</dt><dd>'+money(sum.steelMillions)+'</dd></div></dl><p class="small muted">This total covers HQ construction only, not the cost of upgrading prerequisite buildings.</p>';
    } else totalsNode.innerHTML='<h3>Resource totals</h3><p class="hq-unknown">Incomplete — one or more selected levels lack published cost data.</p>';
    stepsNode.querySelectorAll('input[type="checkbox"][data-key]').forEach(input=>input.addEventListener("change",()=>{progress[input.dataset.key]=input.checked;save();render();}));
  };
  setOptions(); currentSelect.addEventListener("change",render);targetSelect.addEventListener("change",render);
  fetch("data/hq-requirements.json").then(r=>{if(!r.ok)throw new Error("Dataset unavailable");return r.json();}).then(d=>{
    if(d.schemaVersion!==4||!Array.isArray(d.levels))throw new Error("Unsupported dataset");
    records=d.levels.filter(r=>r.verificationStatus==="community-candidate").sort((a,b)=>a.targetHq-b.targetHq);render();
  }).catch(()=>{stepsNode.innerHTML='<div class="card"><h3>HQ data unavailable</h3><p>Refresh and try again.</p></div>';totalsNode.textContent="Totals unavailable.";});
})();