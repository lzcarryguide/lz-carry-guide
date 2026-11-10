/* LZ Carry universal search — client-side index across published pages and local JSON databases. */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var root = new URL("../../", script.src);
  var pages = [
    { file: "index.html", title: "Home", category: "Page" },
    { file: "guides.html", title: "Guides", category: "Page" },
    { file: "beginner.html", title: "Beginner's Guide", category: "Page" },
    { file: "research.html", title: "Research Center", category: "Page" },
    { file: "heroes.html", title: "Hero Formation Lab", category: "Page" },
    { file: "events.html", title: "Events Center", category: "Page" },
    { file: "pilot.html", title: "LZ Carry Service", category: "Page" }
  ];
  var datasets = [
    { file: "data/guides.json", page: "guides.html", title: "Guide", key: ["title", "name"] },
    { file: "data/hq-requirements.json", page: "beginner.html#hq-planner-section", title: "HQ requirement", key: ["targetHq", "hqLevel", "level", "title", "name"] },
    { file: "data/heroes.json", page: "heroes.html", title: "Hero", key: ["name", "faction", "troopType", "rarity", "role"] },
    { file: "data/troops.json", page: "heroes.html", title: "Troop", key: ["name", "title", "class", "faction"] },
    { file: "data/events.json", page: "events.html", title: "Event", key: ["name", "title"] }
  ];
  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = new URL("assets/css/universal-search.css", root).href;
  document.head.appendChild(css);

  function make(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  var nav = document.querySelector("header nav");
  if (!nav) return;
  var trigger = make("button", "universal-search-trigger", "⌕  Search LZ Carry");
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-label", "Search the entire LZ Carry website");
  nav.appendChild(trigger);

  var dialog = make("dialog", "universal-search-dialog");
  dialog.setAttribute("aria-labelledby", "universal-search-title");
  var panel = make("div", "universal-search-panel");
  var heading = make("div", "universal-search-heading");
  var titleWrap = make("div", "");
  titleWrap.appendChild(make("p", "eyebrow", "LZ CARRY KNOWLEDGE HUB"));
  titleWrap.appendChild(make("h2", "", "Search everything"));
  titleWrap.lastChild.id = "universal-search-title";
  heading.appendChild(titleWrap);
  var close = make("button", "universal-search-close", "Close");
  close.type = "button";
  close.setAttribute("aria-label", "Close search");
  heading.appendChild(close);
  var input = make("input", "universal-search-input");
  input.type = "search";
  input.placeholder = "Search heroes, research, HQ levels, events…";
  input.setAttribute("aria-label", "Search all LZ Carry content");
  input.autocomplete = "off";
  var hint = make("p", "universal-search-hint", "Search across guides, planners, heroes, troops, research and events. Press Escape to close.");
  var results = make("div", "universal-search-results");
  results.setAttribute("aria-live", "polite");
  results.setAttribute("aria-label", "Search results");
  panel.append(heading, input, hint, results);
  dialog.appendChild(panel);
  document.body.appendChild(dialog);

  var index = [];
  var indexed = false;
  var building = null;
  var timer = 0;
  function plainText(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script,style,noscript,header,footer,nav,svg").forEach(function (n) { n.remove(); });
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }
  function excerpt(text, query) {
    var lower = text.toLowerCase(), at = lower.indexOf(query.toLowerCase());
    if (at < 0) return text.slice(0, 150);
    var start = Math.max(0, at - 65), end = Math.min(text.length, at + query.length + 95);
    return (start ? "… " : "") + text.slice(start, end) + (end < text.length ? " …" : "");
  }
  function add(item) {
    if (!item || !item.text || !item.text.trim()) return;
    index.push({ title: item.title || "LZ Carry", category: item.category || "Reference", text: item.text, url: item.url || "index.html" });
  }
  function recordText(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(recordText).filter(Boolean).join(" · ");
    if (typeof value === "object") return Object.keys(value).filter(function (k) { return !/url|image|portrait|icon|id|source/i.test(k); }).map(function (k) { return recordText(value[k]); }).filter(Boolean).join(" · ");
    return "";
  }
  function collectRecords(value, cfg, parent) {
    if (Array.isArray(value)) {
      value.forEach(function (item) { collectRecords(item, cfg, parent); });
      return;
    }
    if (!value || typeof value !== "object") return;
    var isRecord = cfg.key.some(function (k) { return value[k] != null && String(value[k]).trim(); });
    if (isRecord) {
      var title = cfg.key.map(function (k) { return value[k]; }).find(function (v) { return v != null && String(v).trim(); });
      if (cfg.file === "data/hq-requirements.json" && value.targetHq != null) title = "HQ " + value.targetHq + " upgrade";
      add({ title: String(title), category: cfg.title, text: recordText(value), url: cfg.page });
    } else {
      Object.keys(value).forEach(function (k) { if (k !== "schemaVersion" && k !== "lastUpdated") collectRecords(value[k], cfg, value); });
    }
  }
  async function buildIndex() {
    if (indexed) return;
    if (building) return building;
    building = Promise.all(pages.map(async function (p) {
      try {
        var response = await fetch(new URL(p.file, root).href, { credentials: "same-origin" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        var text = plainText(await response.text());
        add({ title: p.title, category: p.category, text: text, url: p.file });
      } catch (e) { /* One unavailable page must not disable search elsewhere. */ }
    }).concat(datasets.map(async function (cfg) {
      try {
        var response = await fetch(new URL(cfg.file, root).href, { credentials: "same-origin" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        collectRecords(await response.json(), cfg);
      } catch (e) { /* A missing optional dataset is reported in the index footer. */ }
    }))).then(function () { indexed = true; });
    return building;
  }
  function render(query) {
    results.replaceChildren();
    if (query.length < 2) {
      results.appendChild(make("p", "universal-search-empty", "Type at least 2 characters to search the website."));
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = index.map(function (item) {
      var hay = (item.title + " " + item.category + " " + item.text).toLowerCase();
      var score = terms.reduce(function (n, term) { return n + (hay.includes(term) ? 1 : 0); }, 0);
      if (score !== terms.length) return null;
      score += item.title.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
      return { item: item, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 40);
    if (!matches.length) {
      results.appendChild(make("p", "universal-search-empty", "No matches found. Try a hero name, research tree, HQ level or event keyword."));
      return;
    }
    matches.forEach(function (match) {
      var item = match.item;
      var link = make("a", "universal-search-result");
      link.href = new URL(item.url, root).href;
      link.appendChild(make("span", "universal-search-result-meta", item.category));
      link.appendChild(make("strong", "universal-search-result-title", item.title));
      link.appendChild(make("span", "universal-search-result-excerpt", excerpt(item.text, query)));
      results.appendChild(link);
    });
    results.appendChild(make("p", "universal-search-footer", matches.length === 40 ? "Showing the 40 strongest matches." : matches.length + " matching results."));
  }
  function search() {
    var query = input.value.trim();
    if (!indexed) {
      results.replaceChildren(make("p", "universal-search-empty", "Building the search index…"));
      buildIndex().then(function () { render(input.value.trim()); });
    } else render(query);
  }
  trigger.addEventListener("click", function () {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    input.value = "";
    results.replaceChildren(make("p", "universal-search-empty", "Type at least 2 characters to search the website."));
    input.focus();
    buildIndex();
  });
  close.addEventListener("click", function () { dialog.close ? dialog.close() : dialog.removeAttribute("open"); trigger.focus(); });
  dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
  input.addEventListener("input", function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(search, 100);
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { dialog.close(); trigger.focus(); }
  });
  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (!dialog.open) trigger.click();
      input.focus();
    }
  });
})();
