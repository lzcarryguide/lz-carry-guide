/* LZ Carry player data portability. All progress remains in this browser unless the player exports it. */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var root = new URL("../../", script.src);
  var KEYS = [
    "lzcarry-formation-library-v1",
    "lzcarry:hq-planner:v2",
    "lzcarry-research-plan-v1",
    "lzcarry-event-prep-v2"
  ];
  var schema = "lz-carry-player-data";
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  var nav = document.querySelector("header nav");
  if (!nav) return;
  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("assets/css/player-data.css", root).href;
  document.head.appendChild(style);

  var trigger = el("button", "player-data-trigger", "My Progress");
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-label", "Manage saved LZ Carry progress");
  nav.appendChild(trigger);

  var dialog = el("dialog", "player-data-dialog");
  dialog.setAttribute("aria-labelledby", "player-data-title");
  var panel = el("div", "player-data-panel");
  var head = el("div", "player-data-head");
  var title = el("h2", "", "Save & manage progress");
  title.id = "player-data-title";
  var close = el("button", "player-data-close", "Close");
  close.type = "button";
  close.setAttribute("aria-label", "Close progress manager");
  head.append(title, close);
  var intro = el("p", "small muted", "Your planners save progress in this browser. Export a backup before changing devices or clearing browser data.");
  var summary = el("p", "player-data-summary", "");
  summary.setAttribute("aria-live", "polite");
  var exportBtn = el("button", "btn", "Export my progress");
  exportBtn.type = "button";
  var importBtn = el("button", "btn secondary", "Import a backup");
  importBtn.type = "button";
  var file = el("input", "player-data-file");
  file.type = "file";
  file.accept = "application/json,.json";
  file.hidden = true;
  file.setAttribute("aria-label", "Choose a LZ Carry progress backup JSON file");
  var buttons = el("div", "player-data-actions");
  buttons.append(exportBtn, importBtn);
  var warning = el("p", "small muted", "Import replaces matching saved planner data on this device. A rollback snapshot is created first. Never upload passwords, verification codes or account credentials.");
  panel.append(head, intro, summary, buttons, file, warning);
  dialog.appendChild(panel);
  document.body.appendChild(dialog);

  function readData() {
    var data = {};
    KEYS.forEach(function (key) {
      var value = localStorage.getItem(key);
      if (value !== null) {
        try { data[key] = JSON.parse(value); }
        catch (_) { data[key] = value; }
      }
    });
    return data;
  }
  function status() {
    try {
      var data = readData();
      var count = Object.keys(data).length;
      var size = new Blob([JSON.stringify(data)]).size;
      summary.textContent = count + " of " + KEYS.length + " planner data sets found on this device · " + Math.ceil(size / 1024) + " KB";
    } catch (_) {
      summary.textContent = "Browser storage is unavailable. Export and import cannot run in this session.";
    }
  }
  function download(filename, contents) {
    var blob = new Blob([contents], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = el("a", "");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function snapshot() {
    return {
      format: schema,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      app: "LZ Carry",
      data: readData()
    };
  }
  trigger.addEventListener("click", function () {
    status();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });
  close.addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
  exportBtn.addEventListener("click", function () {
    try {
      var backup = snapshot();
      download("lz-carry-progress-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(backup, null, 2));
      summary.textContent = "Backup exported. Keep the JSON file somewhere safe; it is not stored in your game account.";
    } catch (_) {
      summary.textContent = "Export failed. Check browser storage and try again.";
    }
  });
  importBtn.addEventListener("click", function () { file.click(); });
  file.addEventListener("change", async function () {
    var selected = file.files && file.files[0];
    if (!selected) return;
    try {
      if (selected.size > 2 * 1024 * 1024) throw new Error("The backup is larger than 2 MB.");
      var payload = JSON.parse(await selected.text());
      if (!payload || payload.format !== schema || payload.schemaVersion !== 1 || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
        throw new Error("This is not a supported LZ Carry progress backup.");
      }
      var incoming = {};
      Object.keys(payload.data).forEach(function (key) {
        if (KEYS.indexOf(key) < 0) throw new Error("The backup contains an unsupported data key.");
        var value = payload.data[key];
        if (key === "lzcarry-formation-library-v1" && (!Array.isArray(value) || value.length > 500)) throw new Error("Saved formation data is invalid.");
        if (key !== "lzcarry-formation-library-v1" && (!value || typeof value !== "object" || Array.isArray(value))) throw new Error("Planner progress data is invalid.");
        incoming[key] = JSON.stringify(value);
      });
      if (!Object.keys(incoming).length) throw new Error("The backup contains no saved planner data.");
      if (!window.confirm("Import " + Object.keys(incoming).length + " data set(s)? Matching saved progress on this device will be replaced.")) return;
      var before = {};
      KEYS.forEach(function (key) { before[key] = localStorage.getItem(key); });
      var rollbackKey = "lzcarry-player-data-rollback-v1";
      localStorage.setItem(rollbackKey, JSON.stringify({ savedAt: new Date().toISOString(), values: before }));
      try {
        Object.keys(incoming).forEach(function (key) { localStorage.setItem(key, incoming[key]); });
      } catch (writeError) {
        KEYS.forEach(function (key) {
          if (before[key] === null) localStorage.removeItem(key);
          else localStorage.setItem(key, before[key]);
        });
        throw writeError;
      }
      status();
      summary.textContent = "Progress imported successfully. Reload planner pages to display the restored data.";
      file.value = "";
    } catch (error) {
      summary.textContent = error && error.message ? error.message : "Import failed. No data was imported.";
      file.value = "";
    }
  });
})();
