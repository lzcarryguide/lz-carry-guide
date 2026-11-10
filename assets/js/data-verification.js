/* Shared evidence labels for LZ Carry game data. Community evidence is never silently promoted to in-game verification. */
(function (global) {
  "use strict";
  var definitions = {
    verified: {
      label: "Verified",
      detail: "Checked against the current in-game client or an official publisher source.",
      className: "is-verified"
    },
    "community-supported": {
      label: "Community-supported",
      detail: "Corroborated by community references; not publisher-certified or confirmed in the current client.",
      className: "is-community"
    },
    estimated: {
      label: "Estimated",
      detail: "Derived from a stated calculation or assumption, not an exact confirmed game value.",
      className: "is-estimated"
    },
    outdated: {
      label: "Outdated",
      detail: "Previously supported, but it needs rechecking before use.",
      className: "is-outdated"
    },
    unconfirmed: {
      label: "Unconfirmed",
      detail: "Evidence is incomplete, conflicting or awaiting current in-game confirmation.",
      className: "is-unconfirmed"
    }
  };
  function normalize(input, fallback) {
    var raw = input;
    var method = "";
    if (input && typeof input === "object") {
      raw = input.status || input.value || "";
      method = [input.method, input.verificationMethod, input.checkedAgainst, input.sourceType].filter(Boolean).join(" ").toLowerCase();
    }
    if (raw == null || raw === "") raw = fallback || "";
    var value = String(raw).toLowerCase().replace(/[_\s]+/g, "-");
    if (/outdated|superseded|stale|expired/.test(value)) return "outdated";
    if (/estimated|estimate|approximate|projected|derived/.test(value)) return "estimated";
    if (/community-candidate|pending|unconfirmed|conflict|disagree|needs-confirmation|not-enough-evidence|provisional/.test(value)) {
      if (/community-indexed|multiple-community-sources|corroborated-community/.test(value)) return "community-supported";
      return "unconfirmed";
    }
    if (/not-supported/.test(value)) return "unconfirmed";
    if (/community|corroborat|multiple-sources|source-comparison|\bsupported\b/.test(value)) return "community-supported";
    if (/verified|confirmed/.test(value)) {
      if (/in-game|client|official|publisher/.test(method + " " + value)) return "verified";
      return "community-supported";
    }
    return "unconfirmed";
  }
  function describe(input, fallback) {
    var status = normalize(input, fallback);
    return { status: status, label: definitions[status].label, detail: definitions[status].detail, className: definitions[status].className };
  }
  global.LZCarryDataStatus = Object.freeze({
    definitions: Object.freeze(definitions),
    normalize: normalize,
    describe: describe
  });
})(window);
