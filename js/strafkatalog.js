// js/strafkatalog.js

function initStrafkatalog() {
  const STORAGE_LOCK_KEY = "lspd_straf_lock_v1";

  const categoriesEl = document.getElementById("straf-categories");
  const listEl = document.getElementById("straf-list");
  const searchInput = document.getElementById("straf-search");
  const searchClear = document.getElementById("straf-search-clear");
  const summaryList = document.getElementById("straf-summary-list");
  const metricCount = document.getElementById("metric-count");
  const metricMoney = document.getElementById("metric-money");
  const metricJail = document.getElementById("metric-jail");
  const copyBtn = document.getElementById("straf-copy");
  const clearBtn = document.getElementById("straf-clear");

  const lockBanner = document.getElementById("straf-lock-banner");
  const lockUserEl = document.getElementById("straf-lock-user");
  const lockCountdownEl = document.getElementById("straf-lock-countdown");
  const releaseOwnBtn = document.getElementById("straf-release-own");

  let activeCategory = "allgemein";
  let selected = [];
  let lockInterval = null;

  const LOCK_DURATION_SEC = 120;

  const CATALOG = [
    {
      id: "allgemein",
      icon: "⚖️",
      name: "Allgemeine Delikte",
      offences: [
        { id: "g1", name: "Bestechung", fine: 2500, jail: 25 },
        { id: "g2", name: "Amtsmissbrauch", fine: 4000, jail: 40 },
        { id: "g3", name: "Informationsverkauf", fine: 5000, jail: 50 },
        { id: "g4", name: "Behinderung FIB", fine: 4000, jail: 45 },
        { id: "g5", name: "Prostitution", fine: 1000, jail: 10 },
        { id: "g6", name: "Zwangs Prostitution", fine: 6000, jail: 70 },
        { id: "g7", name: "Zuhälterei", fine: 3000, jail: 40 },
      ],
    },
    {
      id: "eigentum",
      icon: "💰",
      name: "Eigentumsdelikte",
      offences: [
        { id: "e1", name: "Einfache Körperverletzung", fine: 1000, jail: 15 },
        { id: "e2", name: "Gefährliche Körperverletzung", fine: 2000, jail: 30 },
        { id: "e3", name: "Schwere Körperverletung", fine: 3000, jail: 40 },
        { id: "e4", name: "Fahrlössige Tötung", fine: 3000, jail: 40 },
        { id: "e5", name: "Totschlag", fine: 6000, jail: 80 },
        { id: "e6", name: "Mord", fine: 0, jail: 120 },
        { id: "e7", name: "Einfacher Raub", fine: 3000, jail: 35 },
        { id: "e8", name: "Hausraub", fine: 5000, jail: 55 },
        { id: "e9", name: "Ladenraub", fine: 4000, jail: 40 },
        { id: "e10", name: "Bankraub", fine: 8000, jail: 80 },
        { id: "e11", name: "Geldautomaten", fine: 5000, jail: 60 },
        { id: "e12", name: "Fahrzeugraub", fine: 4500, jail: 45 },
        { id: "e13", name: "Einbruchdiebstahl", fine: 5000, jail: 50 },
      ],
    },
    {
      id: "verkehr",
      icon: "🚓",
      name: "Verkehrsdelikte",
      offences: [
        { id: "v1", name: "Fahren ohne Fahrzeugpapiere", fine: 300, jail: 10 },
        { id: "v2", name: "Falschparken", fine: 150, jail: 0 },
        { id: "v3", name: "Gefährdung des Strassenverkehrs", fine: 300, jail: 5 },
        { id: "v4", name: "Unfallflucht", fine: 1000, jail: 10 },
        { id: "v5", name: "Fahren ohne Führerschein", fine: 1000, jail: 10 },
        { id: "v6", name: "Illegales Autorennen", fine: 2000, jail: 20 },
        { id: "v7", name: "Fahren unter Drogen/Alkohol", fine: 1500, jail: 15 },
        { id: "v8", name: "1-20 Km/h", fine: 150, jail: 0 },
        { id: "v9", name: "21-40 Km/h", fine: 300, jail: 0 },
        { id: "v10", name: "41-60 Km/h", fine: 750, jail: 0 },
        { id: "v11", name: "61-100 Km/h", fine: 1250, jail: 0 },
        { id: "v12", name: "Über 100 Km/h", fine: 1500, jail: 0 },      
      ],
    },
    {
      id: "drogen",
      icon: "💊",
      name: "Drogendelikte",
      offences: [
        { id: "d1", name: "Weiche Drogen", fine: 1000, jail: 10 },
        { id: "d2", name: "Drogenhandel (klein)", fine: 0, jail: 25 },
        { id: "d3", name: "Drogenhandel (Mittel)", fine: 0, jail: 35 },
        { id: "d4", name: "Drogenhandel (Gross)", fine: 0, jail: 45 },
        { id: "d5", name: "Drogenproduktion", fine: 0, jail: 40 },
      ],
    },
    {
      id: "staat",
      icon: "🏛️",
      name: "Waffen",
      offences: [
        { id: "s1", name: "Unerlaubter besitz Handwaffe", fine: 2000, jail: 20 },
        { id: "s2", name: "Unerlaubte Führen Handfeuerwaffe", fine: 2500, jail: 25 },
        { id: "s3", name: "Besitz von Langwaffe", fine: 3000, jail: 35 },
        { id: "s4", name: "Handel mit Langwaffen", fine: 4500, jail: 45 },
        { id: "s5", name: "Besitz von Sprengstoff", fine: 5000, jail: 50 },
        { id: "s6", name: "Vorbereitung eines Anschlags", fine: 0, jail: 70 },
      ],
    },
  ];

  function formatMoney(value) {
    return value.toLocaleString("de-DE") + " $";
  }

  function readLock() {
    try {
      const raw = localStorage.getItem(STORAGE_LOCK_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.by || !obj.since) return null;
      return obj;
    } catch {
      return null;
    }
  }

  function writeLock(by) {
    const now = Date.now();
    const obj = { by, since: now };
    localStorage.setItem(STORAGE_LOCK_KEY, JSON.stringify(obj));
  }

  function clearLock() {
    localStorage.removeItem(STORAGE_LOCK_KEY);
  }

  function getLockState() {
    const lock = readLock();
    if (!lock) return null;
    const now = Date.now();
    const elapsed = (now - lock.since) / 1000;
    if (elapsed > LOCK_DURATION_SEC) {
      clearLock();
      return null;
    }
    lock.remaining = Math.max(0, Math.floor(LOCK_DURATION_SEC - elapsed));
    return lock;
  }

  function ensureLock() {
    const current = LSPD.currentUser;
    if (!current) {
      LSPD.showToast("Bitte einloggen, um den Strafkatalog zu bearbeiten.", "error");
      return false;
    }
    const lock = getLockState();
    if (lock && lock.by !== current.username) {
      LSPD.showToast("Strafkatalog wird aktuell von " + lock.by + " bearbeitet.", "error");
      return false;
    }
    writeLock(current.username);
    updateLockUI();
    return true;
  }

  function updateLockUI() {
    const current = LSPD.currentUser;
    const lock = getLockState();

    if (!lock) {
      lockBanner.classList.add("lock-banner-hidden");
      if (lockInterval) {
        clearInterval(lockInterval);
        lockInterval = null;
      }
      return;
    }

    lockBanner.classList.remove("lock-banner-hidden");
    lockUserEl.textContent = lock.by;
    lockCountdownEl.textContent = lock.remaining != null ? lock.remaining : "--";

    if (!lockInterval) {
      lockInterval = setInterval(() => {
        const l = getLockState();
        if (!l) {
          if (lockInterval) clearInterval(lockInterval);
          lockInterval = null;
          lockBanner.classList.add("lock-banner-hidden");
          return;
        }
        lockUserEl.textContent = l.by;
        lockCountdownEl.textContent = l.remaining;
      }, 1000);
    }

    if (current && lock.by === current.username) {
      releaseOwnBtn.disabled = false;
    } else {
      releaseOwnBtn.disabled = true;
    }
  }

  LSPD.updateStrafLockUI = updateLockUI;

  releaseOwnBtn.addEventListener("click", () => {
    const current = LSPD.currentUser;
    const lock = getLockState();
    if (!current || !lock || lock.by !== current.username) return;
    clearLock();
    updateLockUI();
    LSPD.showToast("Strafkatalog-Lock freigegeben.");
  });

  function renderCategories() {
    categoriesEl.innerHTML = "";
    CATALOG.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (cat.id === activeCategory ? " chip-active" : "");
      btn.dataset.id = cat.id;

      const icon = document.createElement("span");
      icon.className = "chip-icon";
      icon.textContent = cat.icon;

      const label = document.createElement("span");
      label.textContent = cat.name;

      btn.appendChild(icon);
      btn.appendChild(label);
      categoriesEl.appendChild(btn);
    });
  }

  function getFilteredOffences() {
    const q = (searchInput.value || "").toLowerCase().trim();
    let offences = [];
    const activeCat = CATALOG.find((c) => c.id === activeCategory) || CATALOG[0];

    if (q) {
      CATALOG.forEach((cat) => {
        cat.offences.forEach((o) => offences.push(o));
      });
      offences = offences.filter((o) => o.name.toLowerCase().includes(q));
    } else {
      offences = activeCat.offences.slice();
    }
    return offences;
  }

  function renderOffences() {
    listEl.innerHTML = "";
    const offences = getFilteredOffences();

    if (offences.length === 0) {
      const empty = document.createElement("div");
      empty.className = "summary-empty";
      empty.textContent = "Keine Delikte gefunden.";
      listEl.appendChild(empty);
      return;
    }

    offences.forEach((o) => {
      const row = document.createElement("div");
      row.className = "offence-row";

      const name = document.createElement("div");
      name.className = "offence-name";
      name.textContent = o.name;

      const fine = document.createElement("div");
      fine.className = "offence-meta";
      fine.textContent = formatMoney(o.fine);

      const jail = document.createElement("div");
      jail.className = "offence-meta";
      jail.textContent = o.jail + " Min.";

      const btn = document.createElement("button");
      btn.className = "btn btn-primary btn-xs";
      btn.textContent = "➕";
      btn.title = "Zu Auswahl hinzufügen";
      btn.addEventListener("click", () => {
        if (!ensureLock()) return;
        selected.push(o);
        renderSummary();
      });

      row.appendChild(name);
      row.appendChild(fine);
      row.appendChild(jail);
      row.appendChild(btn);
      listEl.appendChild(row);
    });
  }

  function renderSummary() {
    summaryList.innerHTML = "";
    if (selected.length === 0) {
      const empty = document.createElement("div");
      empty.className = "summary-empty";
      empty.textContent =
        "Noch keine Delikte hinzugefügt. Wähle links eine Kategorie und füge Straftaten hinzu.";
      summaryList.appendChild(empty);
      metricCount.textContent = "0";
      metricMoney.textContent = "0 $";
      metricJail.textContent = "0 Min.";
      return;
    }

    let totalFine = 0;
    let totalJail = 0;

    selected.forEach((o, index) => {
      totalFine += o.fine;
      totalJail += o.jail;

      const row = document.createElement("div");
      row.className = "summary-item";

      const n = document.createElement("div");
      n.textContent = o.name;

      const f = document.createElement("div");
      f.textContent = formatMoney(o.fine);

      const j = document.createElement("div");
      j.textContent = o.jail + " Min.";

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-ghost btn-xs";
      removeBtn.textContent = "✕";
      removeBtn.title = "Entfernen";
      removeBtn.addEventListener("click", () => {
        if (!ensureLock()) return;
        selected.splice(index, 1);
        renderSummary();
      });

      row.appendChild(n);
      row.appendChild(f);
      row.appendChild(j);
      row.appendChild(removeBtn);
      summaryList.appendChild(row);
    });

    metricCount.textContent = String(selected.length);
    metricMoney.textContent = formatMoney(totalFine);
    metricJail.textContent = totalJail + " Min.";
  }

  categoriesEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeCategory = chip.dataset.id;
    renderCategories();
    renderOffences();
  });

  searchInput.addEventListener("input", () => {
    renderOffences();
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    renderOffences();
  });

  clearBtn.addEventListener("click", () => {
    if (!ensureLock()) return;
    if (!selected.length) return;
    if (!confirm("Ausgewählte Delikte wirklich löschen?")) return;
    selected = [];
    renderSummary();
  });

  copyBtn.addEventListener("click", () => {
    if (!selected.length) {
      LSPD.showToast("Keine Delikte ausgewählt.", "error");
      return;
    }
    const lines = [];
    lines.push("LSPD Strafkatalog – Zusammenfassung");
    lines.push("==============================================");
    lines.push("");

    selected.forEach((o, i) => {
      lines.push(
        `${i + 1}. ${o.name} | Strafe: ${formatMoney(o.fine)} | Haft: ${o.jail} Min.`
      );
    });

    const totalFine = selected.reduce((sum, o) => sum + o.fine, 0);
    const totalJail = selected.reduce((sum, o) => sum + o.jail, 0);

    lines.push("");
    lines.push("----------------------------------------------");
    lines.push("Gesamtstrafe:    " + formatMoney(totalFine));
    lines.push("Gesamt-Haftzeit: " + totalJail + " Min.");

    const text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => LSPD.showToast("Strafzettel kopiert."),
        () => LSPD.showToast("Konnte nicht in die Zwischenablage schreiben.", "error")
      );
    } else {
      LSPD.showToast("Clipboard-API nicht verfügbar.", "error");
    }
  });

  renderCategories();
  renderOffences();
  renderSummary();
  updateLockUI();
}
