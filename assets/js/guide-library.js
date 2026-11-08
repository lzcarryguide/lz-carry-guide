(() => {
  const search = document.querySelector("#guide-search");
  const category = document.querySelector("#guide-category");
  const results = document.querySelector("#guide-results");
  const count = document.querySelector("#guide-count");
  if (!search || !category || !results || !count) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const render = (entries) => {
    const term = search.value.trim().toLocaleLowerCase();
    const selected = category.value;
    const visible = entries.filter((entry) => {
      if (entry.status !== "published") return false;
      if (selected && entry.category !== selected) return false;
      const haystack = [entry.title, entry.summary, entry.category, ...(entry.stage || []), ...(entry.tags || [])].join(" ").toLocaleLowerCase();
      return !term || haystack.includes(term);
    });
    count.textContent = visible.length + (visible.length === 1 ? " published guide" : " published guides");
    if (!visible.length) {
      results.innerHTML = '<div class="library-empty card"><h2>No published guides match yet</h2><p>The searchable index is connected, but it will show only reviewed guides with source details. Try another category or check back as verified content is added.</p></div>';
      return;
    }
    results.innerHTML = visible.map((entry) => {
      const tags = (entry.tags || []).map((tag) => '<span class="pill">' + escapeHtml(tag) + '</span>').join(" ");
      const sourceNote = entry.verifiedAt ? '<p class="small muted">Verified: ' + escapeHtml(entry.verifiedAt) + '</p>' : "";
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
      const entries = data.entries.filter((entry) => entry && entry.status === "published" && entry.title && entry.url && Array.isArray(entry.sources) && entry.sources.length);
      render(entries);
      search.addEventListener("input", () => render(entries));
      category.addEventListener("change", () => render(entries));
    })
    .catch(() => {
      count.textContent = "Guide index unavailable";
      results.innerHTML = '<div class="library-empty card"><h2>Guide index could not load</h2><p>Please refresh the page. The category pages remain available while the searchable index is offline.</p></div>';
    });
})();
