(function () {
  function makeText(tag, className, value) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value == null ? "" : String(value);
    return element;
  }

  function makeCard(record, kind) {
    var article = makeText("article", "card knowledge-card", "");
    if (kind === "hero") {
      article.appendChild(makeText("span", "pill", record.faction || "Faction pending"));
      article.appendChild(makeText("h3", "", record.name));
      article.appendChild(makeText("p", "", record.troopType || "Troop type pending"));
      article.appendChild(makeText("p", "small muted", record.note));
    } else if (kind === "troop") {
      article.appendChild(makeText("span", "pill", record.faction));
      article.appendChild(makeText("h3", "", record.name));
      article.appendChild(makeText("p", "", "Camp: " + record.camp));
      article.appendChild(makeText("p", "", record.summary));
      article.appendChild(makeText("p", "small muted", record.note));
    } else {
      article.appendChild(makeText("span", "pill", record.type));
      article.appendChild(makeText("h3", "", record.name));
      article.appendChild(makeText("p", "", record.summary));
      article.appendChild(makeText("p", "", "Preparation: " + record.preparation));
      article.appendChild(makeText("p", "small muted", "Schedule and rewards: check current in-game event details."));
    }
    return article;
  }

  function setupDirectory(config) {
    var search = document.getElementById(config.searchId);
    var filter = document.getElementById(config.filterId);
    var count = document.getElementById(config.countId);
    var results = document.getElementById(config.resultsId);
    if (!search || !filter || !count || !results) return;

    function render() {
      var term = search.value.trim().toLowerCase();
      var selected = filter.value;
      var visible = config.records.filter(function (record) {
        var text = [record.name, record.title, record.faction, record.troopType, record.camp, record.summary, record.role, record.type, (record.tags || []).join(" ")].filter(Boolean).join(" ").toLowerCase();
        return (!selected || record[config.filterField] === selected) && (!term || text.indexOf(term) !== -1);
      });
      count.textContent = visible.length + (visible.length === 1 ? " record" : " records");
      results.replaceChildren();
      if (!visible.length) {
        var empty = makeText("div", "card knowledge-empty", "");
        empty.appendChild(makeText("h3", "", "No matching records"));
        empty.appendChild(makeText("p", "", "Try a different search term or filter."));
        results.appendChild(empty);
        return;
      }
      visible.forEach(function (record) { results.appendChild(makeCard(record, config.kind)); });
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    render();
  }

  function loadDirectory(url, key, config, root) {
    fetch(url).then(function (response) {
      if (!response.ok) throw new Error("Database request failed");
      return response.json();
    }).then(function (data) {
      if (!data || data.schemaVersion !== 1 || !Array.isArray(data[key])) throw new Error("Database format invalid");
      config.records = data[key];
      setupDirectory(config);
    }).catch(function () {
      root.replaceChildren();
      var message = makeText("div", "card", "");
      message.appendChild(makeText("h3", "", "Directory unavailable"));
      message.appendChild(makeText("p", "", "Please refresh to reload the local database."));
      root.appendChild(message);
    });
  }

  var heroRoot = document.getElementById("hero-results");
  if (heroRoot) loadDirectory("data/heroes.json", "heroes", {
    kind: "hero", searchId: "hero-search", filterId: "hero-faction",
    countId: "hero-count", resultsId: "hero-results", filterField: "faction"
  }, heroRoot);

  var troopRoot = document.getElementById("troop-results");
  if (troopRoot) loadDirectory("data/troops.json", "troops", {
    kind: "troop", searchId: "troop-search", filterId: "troop-faction",
    countId: "troop-count", resultsId: "troop-results", filterField: "faction"
  }, troopRoot);

  var eventRoot = document.getElementById("event-results");
  if (eventRoot) loadDirectory("data/events.json", "events", {
    kind: "event", searchId: "event-search", filterId: "event-type",
    countId: "event-count", resultsId: "event-results", filterField: "type"
  }, eventRoot);
})();