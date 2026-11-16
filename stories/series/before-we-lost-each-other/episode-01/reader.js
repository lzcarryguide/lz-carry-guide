(() => {
  "use strict";

  const pages = [...document.querySelectorAll("img.page")];
  const pageButtons = [...document.querySelectorAll(".page-open")];
  const viewer = document.getElementById("viewer");
  const viewerImage = document.getElementById("viewer-image");
  const viewerLabel = document.getElementById("viewer-label");
  const previous = document.getElementById("previous-page");
  const next = document.getElementById("next-page");
  const zoomIn = document.getElementById("zoom-in");
  const zoomOut = document.getElementById("zoom-out");
  const zoomReset = document.getElementById("zoom-reset");
  const zoomLevel = document.getElementById("zoom-level");
  const currentLabel = document.getElementById("current-page");
  const bookmarkButton = document.getElementById("bookmark-page");
  const fullscreenButton = document.getElementById("fullscreen-viewer");
  const audioPanel = document.querySelector(".audio");
  const audioHome = audioPanel ? audioPanel.parentElement : null;
  const audio = document.getElementById("music");
  const playButton = document.getElementById("toggle");
  const muteButton = document.getElementById("mute-toggle");
  const volumeInput = document.getElementById("volume");
  const volumeLabel = document.getElementById("volval");
  const status = document.getElementById("status");

  const series = "before-we-lost-each-other-episode-01";
  const progressKey = "tva-reading-progress-v1";
  const bookmarkKey = "tva-bookmarks-v1";
  const preferenceKey = "tva-audio-preference-v1";
  const volumeKey = "tva-audio-volume-v1";
  const muteKey = "tva-audio-muted-v1";

  let activePage = 1;
  let zoom = 1;
  let restoring = true;
  let scrollFrame = 0;
  let musicPreference = "on";
  let preferredVolume = 0.18;
  let musicStarting = false;

  function readStored(key, fallback, validate) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      return validate(value) ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // Private browsing or storage limits must never interrupt reading.
    }
  }

  function validPage(value) {
    return Number.isInteger(value) && value >= 1 && value <= pages.length;
  }

  function getBookmarks() {
    const stored = readStored(bookmarkKey, [], Array.isArray);
    return stored.filter(item => item && typeof item === "object" && validPage(item.page));
  }

  function getProgress() {
    const stored = readStored(progressKey, {}, value => value && typeof value === "object" && !Array.isArray(value));
    const record = stored[series];
    if (!record || typeof record !== "object" || !validPage(record.page)) return null;
    const scrollY = Number(record.scrollY);
    if (!Number.isFinite(scrollY) || scrollY < 0 || scrollY > 100000000) return null;
    return { page: record.page, scrollY };
  }

  function setCurrent(page) {
    activePage = Math.max(1, Math.min(pages.length, Number(page) || 1));
    currentLabel.textContent = "Page " + activePage + " of " + pages.length;
    const saved = getBookmarks().some(item => item.page === activePage);
    bookmarkButton.setAttribute("aria-pressed", String(saved));
    bookmarkButton.textContent = saved ? "★ Bookmarked" : "☆ Bookmark Page";
    if (viewer.open) {
      viewerLabel.textContent = "Page " + activePage + " of " + pages.length;
      previous.disabled = activePage === 1;
      next.disabled = activePage === pages.length;
    }
  }

  function saveProgress() {
    if (restoring) return;
    let visiblePage = 1;
    pages.forEach((img, index) => {
      if (img.getBoundingClientRect().top < window.innerHeight * 0.55) visiblePage = index + 1;
    });
    setCurrent(visiblePage);
    const all = readStored(progressKey, {}, value => value && typeof value === "object" && !Array.isArray(value));
    all[series] = { page: visiblePage, scrollY: Math.max(0, window.scrollY) };
    writeStored(progressKey, all);
  }

  window.addEventListener("scroll", () => {
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        saveProgress();
      });
    }
  }, { passive: true });

  function restorePosition() {
    if (!restoring) return;
    const saved = getProgress();
    const hash = location.hash.match(/^#page-(\d{1,2})$/);
    if (hash && validPage(Number(hash[1]))) {
      const target = document.getElementById("page-" + Number(hash[1]));
      if (target) target.scrollIntoView();
      setCurrent(Number(hash[1]));
    } else if (saved) {
      window.scrollTo(0, saved.scrollY);
      setCurrent(saved.page);
    }
    restoring = false;
  }

  window.addEventListener("load", restorePosition, { once: true });
  if (document.readyState === "complete") restorePosition();

  bookmarkButton.addEventListener("click", () => {
    const existing = getBookmarks();
    const alreadySaved = existing.some(item => item.page === activePage);
    const updated = alreadySaved
      ? existing.filter(item => item.page !== activePage)
      : [...existing, { page: activePage }];
    writeStored(bookmarkKey, updated);
    setCurrent(activePage);
  });

  function applyZoom(value) {
    zoom = Math.max(1, Math.min(4, Math.round(value * 4) / 4));
    viewerImage.style.setProperty("--zoom", String(zoom));
    zoomLevel.textContent = Math.round(zoom * 100) + "%";
    zoomOut.disabled = zoom <= 1;
    zoomIn.disabled = zoom >= 4;
  }

  function showPage(page) {
    setCurrent(page);
    const img = pages[activePage - 1];
    viewerImage.src = img.currentSrc || img.src;
    viewerImage.alt = img.alt + " enlarged";
    applyZoom(1);
  }

  pageButtons.forEach(button => {
    button.addEventListener("click", () => {
      const page = Number(button.dataset.page);
      if (!validPage(page)) return;
      showPage(page);
      if (typeof viewer.showModal === "function" && !viewer.open) {
        if (audioPanel) viewer.appendChild(audioPanel);
        viewer.showModal();
      }
    });
  });

  previous.addEventListener("click", () => showPage(activePage - 1));
  next.addEventListener("click", () => showPage(activePage + 1));
  zoomIn.addEventListener("click", () => applyZoom(zoom + 0.25));
  zoomOut.addEventListener("click", () => applyZoom(zoom - 0.25));
  zoomReset.addEventListener("click", () => applyZoom(1));

  document.getElementById("close-viewer").addEventListener("click", async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) { /* Close the reader regardless. */ }
    }
    if (viewer.open) viewer.close();
  });

  viewer.addEventListener("close", () => {
    viewerImage.removeAttribute("src");
    if (audioPanel && audioHome && audioPanel.parentElement === viewer) audioHome.appendChild(audioPanel);
  });

  document.addEventListener("keydown", event => {
    if (!viewer.open) return;
    if (event.key === "ArrowRight") showPage(activePage + 1);
    if (event.key === "ArrowLeft") showPage(activePage - 1);
  });

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (viewer.requestFullscreen) {
        await viewer.requestFullscreen();
      } else {
        status.textContent = "Native fullscreen is not supported by this browser. The enlarged reader remains available.";
      }
    } catch (_) {
      status.textContent = "Fullscreen was unavailable or declined by the browser. The enlarged reader remains available.";
    }
  }

  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    const isFullscreen = document.fullscreenElement === viewer;
    fullscreenButton.textContent = isFullscreen ? "Exit fullscreen" : "Fullscreen";
    fullscreenButton.setAttribute("aria-pressed", String(isFullscreen));
  });

  musicPreference = readStored(preferenceKey, "on", value => value === "on" || value === "off");
  const mutedPreference = readStored(muteKey, false, value => typeof value === "boolean");
  preferredVolume = readStored(volumeKey, 0.18, value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1);
  volumeInput.value = String(preferredVolume);
  audio.volume = preferredVolume;
  audio.muted = mutedPreference;
  volumeLabel.textContent = Math.round(preferredVolume * 100) + "%";

  function updateAudioControls(playing, message) {
    playButton.textContent = playing ? "Pause music" : "Play music";
    playButton.setAttribute("aria-pressed", String(playing));
    muteButton.textContent = audio.muted ? "Unmute" : "Mute";
    muteButton.setAttribute("aria-pressed", String(audio.muted));
    if (message) status.textContent = message;
  }

  function startMusic() {
    if (musicPreference === "off" || !audio.paused || musicStarting) return;
    musicStarting = true;
    status.textContent = "Starting soundtrack…";
    let result;
    try {
      result = audio.play();
    } catch (_) {
      musicStarting = false;
      updateAudioControls(false, "Your browser blocked playback. Tap Play music to try again.");
      return;
    }
    if (result && typeof result.then === "function") {
      result.then(() => {
        musicStarting = false;
        if (audio.paused || musicPreference === "off") return;
        writeStored(preferenceKey, "on");
        updateAudioControls(true, "Original soundtrack playing · You can turn it off anytime");
      }).catch(() => {
        musicStarting = false;
        if (musicPreference !== "off") updateAudioControls(false, "Tap Play music to start the soundtrack.");
      });
    } else {
      musicStarting = false;
      updateAudioControls(true, "Original soundtrack playing · You can turn it off anytime");
    }
  }

  updateAudioControls(false, musicPreference === "off"
    ? "Music is off · Your preference is saved"
    : "Music ready · Starts with your first reader interaction");

  function firstReaderInteraction(event) {
    if (!event.isTrusted || musicPreference === "off" || !audio.paused || musicStarting) return;
    const target = event.target;
    if (target && target.closest && target.closest(".audio")) return;
    const insideReader = target && target.closest && target.closest(".episode, .reader-tools, .reader-intro");
    if (!insideReader) {
      if (event.type !== "scroll") return;
      const rect = document.querySelector(".episode")?.getBoundingClientRect();
      if (!rect || rect.top >= window.innerHeight || rect.bottom <= 0) return;
    }
    startMusic();
  }

  ["pointerdown", "touchstart", "keydown", "wheel", "scroll"].forEach(type => {
    document.addEventListener(type, firstReaderInteraction, { capture: true, passive: type !== "keydown" });
  });

  playButton.addEventListener("click", () => {
    if (!audio.paused || musicStarting) {
      musicPreference = "off";
      writeStored(preferenceKey, "off");
      musicStarting = false;
      audio.pause();
      updateAudioControls(false, "Music paused · Your preference is saved");
      return;
    }
    musicPreference = "on";
    writeStored(preferenceKey, "on");
    startMusic();
  });

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    writeStored(muteKey, audio.muted);
    updateAudioControls(!audio.paused, audio.muted ? "Sound muted · Playback can continue" : "Sound unmuted");
  });

  volumeInput.addEventListener("input", () => {
    const value = Number(volumeInput.value);
    if (!Number.isFinite(value) || value < 0 || value > 1) return;
    audio.volume = value;
    volumeLabel.textContent = Math.round(value * 100) + "%";
    writeStored(volumeKey, value);
  });

  audio.addEventListener("playing", () => {
    musicStarting = false;
    if (musicPreference === "off") {
      audio.pause();
      return;
    }
    updateAudioControls(true, "Original soundtrack playing · You can turn it off anytime");
  });
  audio.addEventListener("pause", () => {
    if (musicPreference === "off") updateAudioControls(false, "Music off · Your preference is saved");
  });
  audio.addEventListener("error", () => {
    musicStarting = false;
    updateAudioControls(false, "Soundtrack unavailable. Your reading remains unaffected.");
  });
})();