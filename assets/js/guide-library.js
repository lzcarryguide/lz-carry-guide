(() => {
  const search = document.querySelector("#guide-search");
  const category = document.querySelector("#guide-category");
  const results = document.querySelector("#guide-results");
  const count = document.querySelector("#guide-count");
  if (!search || !category || !results || !count) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const validDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T00:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };

  const validSource = (source) => source &&
    typeof source.name === "string" && source.name.trim() &&
    ["in-game", "official", "community"].includes(source.type) &&
    validDate(source.checkedAt) &&
    typeof source.note === "string" && source.note.trim();

  const safeGuideUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return false;
    if (/^(javascript|data|vbscript):/i.test(value.trim())) return false;
    return !value.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(value.trim());
  };

  const isPublishable = (entry) => entry &&
    entry.status === "published" &&
    typeof entry.title === "string" && entry.title.trim() &&
    typeof entry.summary === "string" && entry.summary.trim() &&
    ["beginner", "research", "heroes", "events"].includes(entry.category) &&
    safeGuideUrl(entry.url) &&
    validDate(entry.verifiedAt) &&
    Array.isArray(entry.sources) && entry.sources.some(validSource);

  const render = (entries) => {
    const term = search.value.trim().toLocaleLowerCase();
    const selected = category.value;
    const visible = entries.filter((entry) => {
      if (selected && entry.category !== selected) return false;
      const haystack = [entry.title, entry.summary, entry.category, ...(entry.stage || []), ...(entry.tags || [])].join(" ").toLocaleLowerCase();
      return !term || haystack.includes(term);
    });
    count.textContent = visible.length + (visible.length === 1 ? " published guide" : " published guides");
    if (!visible.length) {
      results.innerHTML = '<div class="library-empty card"><h2>No guides match this search</h2><p>Clear the search or choose All categories to see the published quick-start guides.</p></div>';
      return;
    }
    results.innerHTML = visible.map((entry) => {
      const tags = (entry.tags || []).map((tag) => '<span class="pill">' + escapeHtml(tag) + '</span>').join(" ");
      const source = entry.sources.find(validSource);
      const sourceNote = '<p class="small muted">Reviewed: ' + escapeHtml(entry.verifiedAt) + '</p>' + (source ? '<details class="guide-source-note"><summary>Source & review note</summary><p class="small muted">' + escapeHtml(source.name) + ' · ' + escapeHtml(source.type) + ' · checked ' + escapeHtml(source.checkedAt) + '. ' + escapeHtml(source.note) + '</p></details>' : '');
      return '<article class="card"><p class="eyebrow">' + escapeHtml(entry.category) + '</p><h2>' + escapeHtml(entry.title) + '</h2><p>' + escapeHtml(entry.summary) + '</p><p class="small">' + tags + '</p>' + sourceNote + '<a class="btn" href="' + escapeHtml(entry.url) + '">Read guide</a></article>';
    }).join("");
  };

  fetch("data/guides.json")
    .then((response) => {
      if (!response.ok) throw new Error("Guide index request failed");
      return response.json();
    })
    .then((data) => {
      if (!data || data.schemaVersion !== 1 || !Array.isArray(data.entries)) throw new Error("Guide index format is invalid");
      const entries = data.entries.filter(isPublishable);
      render(entries);
      search.addEventListener("input", () => render(entries));
      category.addEventListener("change", () => render(entries));
    })
    .catch(() => {
      count.textContent = "Guide index unavailable";
      results.innerHTML = '<div class="library-empty card"><h2>Guide index could not load</h2><p>Please refresh the page. The category pages remain available while the searchable index is offline.</p></div>';
    });
})();
