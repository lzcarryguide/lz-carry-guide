(() => {
  "use strict";

  const storyId = "before-we-lost-each-other";
  const episodeId = storyId + "-episode-01";
  const coverPath = "../assets/before-we-lost-each-other-cover.webp";

  function read(key, fallback, validate) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      return validate(value) ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Storage is optional. */ }
  }

  function validPage(value) {
    return Number.isInteger(value) && value >= 1 && value <= 12;
  }

  function favorites() {
    return read("tva-favorites-v1", [], Array.isArray).filter(value => typeof value === "string" && value === storyId);
  }

  function bookmarks() {
    return read("tva-bookmarks-v1", [], Array.isArray)
      .filter(item => item && typeof item === "object" && validPage(item.page));
  }

  function progress() {
    const all = read("tva-reading-progress-v1", {}, value => value && typeof value === "object" && !Array.isArray(value));
    const item = all[episodeId];
    if (!item || typeof item !== "object" || !validPage(item.page)) return null;
    const scrollY = Number(item.scrollY);
    if (!Number.isFinite(scrollY) || scrollY < 0 || scrollY > 100000000) return null;
    return { page: item.page, scrollY };
  }

  function makeCard(href, label, description) {
    const link = document.createElement("a");
    link.className = "story-card";
    link.href = href;
    const image = document.createElement("img");
    image.src = coverPath;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    const text = document.createElement("span");
    text.textContent = label;
    if (description) {
      const detail = document.createElement("small");
      detail.className = "muted";
      detail.textContent = description;
      const wrapper = document.createElement("div");
      wrapper.append(text, detail);
      link.append(image, wrapper);
    } else {
      link.append(image, text);
    }
    return link;
  }

  document.querySelectorAll("[data-favorite]").forEach(button => {
    const update = () => {
      const saved = favorites().includes(storyId);
      button.setAttribute("aria-pressed", String(saved));
      button.textContent = saved ? "✓ In My Library" : "♡ Add to My Library";
    };
    update();
    button.addEventListener("click", () => {
      const current = favorites();
      write("tva-favorites-v1", current.includes(storyId) ? [] : [storyId]);
      update();
    });
  });

  const library = document.querySelector("[data-library-list]");
  if (library) {
    const cards = [];
    const episodePath = "../series/before-we-lost-each-other/episode-01/";
    if (favorites().includes(storyId)) {
      cards.push(makeCard("../series/before-we-lost-each-other/", "FAVORITE · BEFORE WE LOST EACH OTHER"));
    }
    bookmarks().forEach(item => {
      cards.push(makeCard(episodePath + "#page-" + item.page,
        "BOOKMARK · Before We Lost Each Other · Page " + item.page));
    });
    const savedProgress = progress();
    if (savedProgress) {
      cards.push(makeCard(episodePath + "#page-" + savedProgress.page,
        "CONTINUE READING · Before We Lost Each Other",
        "Episode 01 · Resume at page " + savedProgress.page));
    }
    library.replaceChildren(...cards);
    const empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = cards.length > 0;
  }

  const continueSlot = document.querySelector("[data-continue-reading]");
  if (continueSlot) {
    const savedProgress = progress();
    if (savedProgress) {
      const link = makeCard("series/before-we-lost-each-other/episode-01/#page-" + savedProgress.page,
        "CONTINUE READING · BEFORE WE LOST EACH OTHER",
        "Episode 01 · Continue from page " + savedProgress.page);
      continueSlot.replaceChildren(link);
    }
  }

  const form = document.querySelector(".filters");
  if (form) {
    const card = document.querySelector("[data-story-card]");
    const empty = document.querySelector("[data-empty]");
    const count = document.querySelector("[data-count]");
    const search = form.querySelector('[name="search"]');
    const genre = form.querySelector('[name="genre"]');
    const status = form.querySelector('[name="status"]');
    const sort = form.querySelector('[name="sort"]');

    if (card && search && genre && status && sort) {
      const filter = () => {
        const query = search.value.trim().toLowerCase();
        const title = card.dataset.title || "";
        const description = card.dataset.description || "";
        const genres = (card.dataset.genres || "").split(",");
        const matches = (!query || (title + " " + description).toLowerCase().includes(query))
          && (!genre.value || genres.includes(genre.value))
          && (!status.value || card.dataset.status === status.value);
        card.hidden = !matches;
        if (empty) empty.hidden = matches;
        if (count) count.textContent = matches ? "1 story" : "0 stories";
      };
      [search, genre, status, sort].forEach(control => control.addEventListener("input", filter));
      [genre, status, sort].forEach(control => control.addEventListener("change", filter));
      filter();
    }
  }
})();