(function () {
  function node(tag, cls, value) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = value == null ? "" : String(value);
    return el;
  }
  function addList(card, heading, values) {
    if (!Array.isArray(values) || !values.length) return;
    card.appendChild(node("h4", "", heading));
    var ul = document.createElement("ul");
    values.forEach(function (v) { ul.appendChild(node("li", "", v)); });
    card.appendChild(ul);
  }
  function makeCard(r, kind) {
    var card = node("article", "card knowledge-card", "");
    if (kind === "hero") {
      card.appendChild(node("span", "pill", [r.rarity, r.faction, r.season != null ? "Season " + r.season : ""].filter(Boolean).join(" · ") || "Details pending"));
      card.appendChild(node("h3", "", r.name));
      card.appendChild(node("p", "", [r.role, r.troopType].filter(Boolean).join(" · ") || "Role and troop line pending verification"));
      card.appendChild(node("p", "small muted", r.dataStatus || "Verification pending"));
      if (r.skills && r.skills.length) addList(card, "Skills", r.skills.map(function (s) { return s.name + ": " + s.effect; }));
      if (r.exclusiveEquipment) card.appendChild(node("p", "", "Exclusive Equipment: " + r.exclusiveEquipment));
      card.appendChild(node("p", "small muted", r.investmentNote || ""));
    } else if (kind === "troop") {
      card.appendChild(node("span", "pill", r.faction));
      card.appendChild(node("h3", "", r.name));
      card.appendChild(node("p", "", "Camp: " + r.camp));
      card.appendChild(node("p", "", r.summary));
      var table = document.createElement("div");
      table.className = "troop-tier-list";
      (r.tiers || []).forEach(function (t) {
        var line = [ "T" + t.tier, t.unitName || "Name pending", "Camp " + t.campLevel, "ATK " + t.attack, "DEF " + t.defense, "HP " + t.hp ].join(" · ");
        table.appendChild(node("p", "small", line));
        if (t.reportedAlternativeNames && t.reportedAlternativeNames.length) table.appendChild(node("p", "small muted", "Alternative community names: " + t.reportedAlternativeNames.join(", ")));
      });
      card.appendChild(table);
      card.appendChild(node("p", "small muted", r.note || ""));
    } else {
      card.appendChild(node("span", "pill", r.type + (r.frequency ? " · " + r.frequency : "")));
      card.appendChild(node("h3", "", r.name));
      card.appendChild(node("p", "", r.objective || r.summary || ""));
      addList(card, "How it works", r.mechanics || []);
      addList(card, "Preparation", r.preparation || []);
      if (r.scoring) card.appendChild(node("p", "", "Scoring: " + r.scoring));
      if (r.rewards) card.appendChild(node("p", "", "Rewards: " + r.rewards));
      if (r.conflicts && r.conflicts.length) addList(card, "Source discrepancies", r.conflicts);
      card.appendChild(node("p", "small muted", r.verification || "Confirm current rules in-game."));
    }
    return card;
  }
  function setup(cfg) {
    var search = document.getElementById(cfg.searchId), filter = document.getElementById(cfg.filterId);
    var count = document.getElementById(cfg.countId), results = document.getElementById(cfg.resultsId);
    if (!search || !count || !results) return;
    function render() {
      var term = search.value.trim().toLowerCase(), selected = filter ? filter.value : "";
      var visible = cfg.records.filter(function (r) {
        var hay = [r.name,r.faction,r.troopType,r.camp,r.role,r.type,r.rarity,r.objective,r.summary,(r.tags||[]).join(" ")].filter(Boolean).join(" ").toLowerCase();
        return (!selected || r[cfg.filterField] === selected) && (!term || hay.indexOf(term) !== -1);
      });
      count.textContent = visible.length + (visible.length === 1 ? " record" : " records");
      results.replaceChildren();
      if (!visible.length) { results.appendChild(node("p","card","No matching records. Try another search or filter.")); return; }
      visible.forEach(function (r) { results.appendChild(makeCard(r,cfg.kind)); });
    }
    search.addEventListener("input",render);
    if (filter) filter.addEventListener("change",render);
    render();
  }
  function load(url,key,cfg,root) {
    fetch(url).then(function(r){if(!r.ok)throw new Error("Database unavailable");return r.json();})
      .then(function(data){if(!data||data.schemaVersion!==2||!Array.isArray(data[key]))throw new Error("Invalid database");cfg.records=data[key];setup(cfg);})
      .catch(function(){root.replaceChildren(node("div","card","Directory unavailable. Please refresh to reload the local database."));});
  }
  var root=document.getElementById("hero-results");
  if(root)load("data/heroes.json","heroes",{kind:"hero",searchId:"hero-search",filterId:"hero-faction",countId:"hero-count",resultsId:"hero-results",filterField:"faction"},root);
  root=document.getElementById("troop-results");
  if(root)load("data/troops.json","classes",{kind:"troop",searchId:"troop-search",filterId:"troop-faction",countId:"troop-count",resultsId:"troop-results",filterField:"faction"},root);
  root=document.getElementById("event-results");
  if(root)load("data/events.json","events",{kind:"event",searchId:"event-search",filterId:"event-type",countId:"event-count",resultsId:"event-results",filterField:"type"},root);
})();