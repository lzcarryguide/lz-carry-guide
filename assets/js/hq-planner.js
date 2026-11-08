(() => {
  const root = document.querySelector("#hq-planner");
  if (!root) return;
  const currentSelect = root.querySelector("#hq-current");
  const targetSelect = root.querySelector("#hq-target");
  const stepsNode = root.querySelector("#hq-steps");
  const totalsNode = root.querySelector("#hq-totals");
  const progressNode = root.querySelector("#hq-progress");
  const storageKey = "lzcarry:hq-planner:v1";
  let records = [];
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(storageKey) || "{}") || {}; } catch (_) { progress = {}; }

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch (_) {} };
  const keyFor = (target, building) => target + ":" + building;
  const selectedRange = () => ({ from:Number(currentSelect.value), to:Number(targetSelect.value) });
  const setDefaults = () => {
    currentSelect.innerHTML = Array.from({length:35},(_,i)=>'<option value="'+(i+1)+'">HQ '+(i+1)+'</option>').join("");
    targetSelect.innerHTML = Array.from({length:35},(_,i)=>'<option value="'+(i+1)+'">HQ '+(i+1)+'</option>').join("");
    currentSelect.value = "1"; targetSelect.value = "10";
  };
  const render = () => {
    const {from,to} = selectedRange();
    targetSelect.querySelectorAll("option").forEach(o => { o.disabled = Number(o.value) <= from; });
    if (to <= from) targetSelect.value = String(Math.min(35, from+1));
    const end = Number(targetSelect.value);
    const chosen = records.filter(r => r.targetHq > from && r.targetHq <= end);
    let done = 0, total = 0;
    const cards = chosen.map(record => {
      const buildings = record.requiredBuildings || [];
      const isCommunity = record.verificationStatus === "community-candidate";
      const buildingHtml = buildings.length ? buildings.map((b,i) => {
        const key = keyFor(record.targetHq, i);
        const checked = !!progress[key];
        total++; if (checked) done++;
        return '<label class="hq-check"><input type="checkbox" data-key="'+esc(key)+'" '+(checked?'checked':'')+'><span><strong>'+esc(b.name)+'</strong><small>Required level: '+(Number.isInteger(b.requiredLevel)?esc(b.requiredLevel):'Not verified')+'</small></span></label>';
      }).join("") : '<p class="small muted">No prerequisite building listed in the current community reference. This is not yet confirmed in-game.</p>';
      return '<article class="card hq-step"><div class="hq-step-head"><div><p class="eyebrow">Upgrade step</p><h3>HQ '+record.targetHq+'</h3></div><span class="pill">Community candidate</span></div><div class="hq-step-grid"><section><h4>Prerequisite buildings</h4>'+buildingHtml+'</section><section><h4>HQ upgrade resources</h4><p class="hq-unknown">Not verified for your server/version</p><p class="small muted">No cost is included in totals until checked against in-game upgrade screens.</p></section></div><p class="small muted">Source: <a href="'+esc(record.source.url)+'" target="_blank" rel="noopener">'+esc(record.source.name)+'</a></p><p class="small muted">'+esc(record.notes)+'</p></article>';
    }).join("");
    stepsNode.innerHTML = cards || '<div class="card"><h3>Choose a higher target HQ</h3><p>Select a target above your current level to see the upgrade steps.</p></div>';
    progressNode.textContent = total ? done+" of "+total+" prerequisite checks marked complete" : "No prerequisite checks in this range";
    totalsNode.innerHTML = '<h3>Resource totals</h3><p class="hq-unknown">Unavailable — costs are not verified.</p><p class="small muted">This planner will not sum incomplete or community-only resource values. A verified total will appear only after every upgrade in your selected range has complete cost data.</p>';
    stepsNode.querySelectorAll('input[type="checkbox"][data-key]').forEach(input => input.addEventListener("change", () => {
      progress[input.dataset.key] = input.checked; save(); render();
    }));
  };
  setDefaults();
  currentSelect.addEventListener("change",render);
  targetSelect.addEventListener("change",render);
  fetch("data/hq-requirements.json").then(r => { if(!r.ok) throw new Error("Dataset unavailable"); return r.json(); }).then(data => {
    if (data.schemaVersion !== 2 || !Array.isArray(data.levels)) throw new Error("Unsupported HQ data version");
    records = data.levels.filter(r => r.verificationStatus === "community-candidate");
    render();
  }).catch(() => {
    stepsNode.innerHTML = '<div class="card"><h3>HQ data unavailable</h3><p>The planner could not load its requirements dataset. Please refresh and try again.</p></div>';
    totalsNode.textContent = "Totals unavailable.";
  });
})();
