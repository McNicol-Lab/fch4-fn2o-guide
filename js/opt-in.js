/*
 * Privacy-safe opt-in for the Network page.
 *
 * - The typed email is normalized (trim + lowercase), hashed with SHA-256 in the
 *   browser via Web Crypto, and compared to data/email-hashes.json.
 * - The email is never uploaded, logged, or stored. Only the display name is
 *   kept (in this browser's localStorage) if the person opts in.
 * - The "request public listing" button opens a GitHub issue whose title and
 *   body contain ONLY the display name.
 */
(function () {
  "use strict";

  var HASHES_URL = "data/email-hashes.json";
  var PUBLIC_URL = "data/opted-in.json";
  var LOCAL_KEY = "fch4fn2o-optin-names";
  var REPO_ISSUES = "https://github.com/McNicol-Lab/fch4-fn2o-guide/issues/new";

  var hashSetPromise = null;

  function loadHashes() {
    if (!hashSetPromise) {
      hashSetPromise = fetch(HASHES_URL, { cache: "no-cache" })
        .then(function (r) {
          if (!r.ok) throw new Error("hash list unavailable");
          return r.json();
        })
        .then(function (data) {
          var list = Array.isArray(data) ? data : (data.hashes || []);
          return new Set(list.map(function (h) { return String(h).toLowerCase(); }));
        });
    }
    return hashSetPromise;
  }

  async function sha256Hex(text) {
    var bytes = new TextEncoder().encode(text);
    var digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map(function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text != null) node.textContent = text;
    return node;
  }

  function getLocalNames() {
    try {
      var v = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      return Array.isArray(v) ? v.filter(function (x) { return typeof x === "string"; }) : [];
    } catch (e) { return []; }
  }

  function setLocalNames(names) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(names)); } catch (e) { /* storage blocked */ }
  }

  function renderLocal() {
    var wrap = document.getElementById("optin-local-wrap");
    var ul = document.getElementById("optin-local");
    if (!wrap || !ul) return;
    var names = getLocalNames();
    ul.innerHTML = "";
    names.forEach(function (n) { ul.appendChild(el("li", null, n)); });
    wrap.style.display = names.length ? "" : "none";
  }

  function renderPublic() {
    var box = document.getElementById("optin-public");
    if (!box) return;
    fetch(PUBLIC_URL, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (data) {
        var names = (Array.isArray(data) ? data : [])
          .map(function (x) { return typeof x === "string" ? x : (x && x.name) || ""; })
          .filter(Boolean);
        box.innerHTML = "";
        if (!names.length) {
          box.appendChild(el("p", { "class": "small-note" },
            "No public names have been added yet. The default acknowledgment goes to FLUXNET-Coop and the CH\u2084/N\u2082O Data Processing Committee."));
          return;
        }
        var ul = el("ul", { "class": "name-list" });
        names.forEach(function (n) { ul.appendChild(el("li", null, n)); });
        box.appendChild(ul);
      });
  }

  function issueUrl(displayName) {
    var params = new URLSearchParams({
      title: "opt-in: " + displayName,
      body: displayName,
      labels: "name-opt-in"
    });
    return REPO_ISSUES + "?" + params.toString();
  }

  function showMessage(kind, nodes) {
    var box = document.getElementById("optin-message");
    box.innerHTML = "";
    var div = el("div", { "class": "optin-msg " + kind });
    nodes.forEach(function (n) { div.appendChild(typeof n === "string" ? el("p", null, n) : n); });
    box.appendChild(div);
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    var emailInput = document.getElementById("optin-email");
    var nameInput = document.getElementById("optin-name");
    var consent = document.getElementById("optin-consent");

    var normalized = (emailInput.value || "").trim().toLowerCase();
    var displayName = (nameInput.value || "").trim().replace(/\s+/g, " ");

    if (!normalized) {
      showMessage("info", ["Please type the email you use with the committee."]);
      return;
    }
    if (!(window.crypto && crypto.subtle)) {
      showMessage("no", ["Sorry, this browser cannot run the secure in-browser check. Please try a recent browser over https."]);
      return;
    }

    var matched = false;
    try {
      var set = await loadHashes();
      var hex = await sha256Hex(normalized);
      matched = set.has(hex);
    } catch (e) {
      showMessage("no", ["Sorry, the check could not run right now. Please try again later."]);
      return;
    }

    // Clear the email from the form as soon as the check is done; it is never stored.
    emailInput.value = "";
    normalized = "";

    if (!matched) {
      showMessage("no", [
        "We couldn\u2019t find that email. This check is only for people who are already on the private committee contact list.",
        "Everyone is welcome to use the guide, and the acknowledgment on this site goes to FLUXNET-Coop and the CH\u2084/N\u2082O Data Processing Committee."
      ]);
      return;
    }

    if (!consent.checked || !displayName) {
      showMessage("info", [
        "Your email is recognized. If you would like to be listed, type the name you want shown, check \u201cList my name on this public page,\u201d and submit again. (You will need to retype your email.)"
      ]);
      return;
    }

    var names = getLocalNames();
    if (names.indexOf(displayName) === -1) names.push(displayName);
    setLocalNames(names);
    renderLocal();

    var link = el("a", {
      "class": "btn btn-gold btn-sm",
      href: issueUrl(displayName),
      target: "_blank",
      rel: "noopener"
    }, "Request public listing on GitHub");

    showMessage("ok", [
      "Thank you, " + displayName + "! Your name now appears below in this browser.",
      "To be listed for every visitor, open the pre-filled GitHub issue. It contains only your display name. A maintainer will add it to the public list in a later update.",
      link
    ]);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("optin-form");
    if (form) form.addEventListener("submit", onSubmit);
    var clear = document.getElementById("optin-clear");
    if (clear) clear.addEventListener("click", function () { setLocalNames([]); renderLocal(); });
    renderLocal();
    renderPublic();
  });
})();
