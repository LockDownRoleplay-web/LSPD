// js/leitstelle.js

function initLeitstelle() {
  const tbody = document.getElementById("leit-tbody");
  const addBtn = document.getElementById("leit-add-row");
  const clearBtn = document.getElementById("leit-clear-rows");
  const copyBtn = document.getElementById("leit-copy");
  const resetBtn = document.getElementById("leit-reset");

  const STATUS_OPTIONS = [
    "",
    "10-8 · Einsatzbereit",
    "10-7 · Außer Dienst",
    "10-6 · Beschäftigt",
    "10-23 · An Einsatzstelle",
    "10-76 · Auf Anfahrt",
    "10-19 · Zurück zur Wache",
  ];

  function createRow() {
    const tr = document.createElement("tr");

    function tdInput(placeholder) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder || "";
      input.className = "table-input";
      td.appendChild(input);
      return td;
    }

    function tdSelect() {
      const td = document.createElement("td");
      const sel = document.createElement("select");
      sel.className = "table-select";
      STATUS_OPTIONS.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
      });
      td.appendChild(sel);
      return td;
    }

    tr.appendChild(tdInput("Rufname"));
    tr.appendChild(tdInput("DN + Name"));
    tr.appendChild(tdInput("DN + Name"));
    tr.appendChild(tdSelect());
    tr.appendChild(tdInput("Bemerkung"));
    return tr;
  }

  function initRows() {
    tbody.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      tbody.appendChild(createRow());
    }
  }

  addBtn.addEventListener("click", () => {
    tbody.appendChild(createRow());
  });

  clearBtn.addEventListener("click", () => {
    initRows();
  });

  resetBtn.addEventListener("click", () => {
    document.getElementById("leit-datum").value = "";
    document.getElementById("leit-kanal").value = "";
    document.getElementById("leit-leiter").value = "";
    document.getElementById("leit-disponent").value = "";
    document.getElementById("leit-notizen").value = "";
    initRows();
  });

  copyBtn.addEventListener("click", () => {
    const lines = [];
    const datum = document.getElementById("leit-datum").value || "-";
    const kanal = document.getElementById("leit-kanal").value || "-";
    const leiter = document.getElementById("leit-leiter").value || "-";
    const disp = document.getElementById("leit-disponent").value || "-";
    const notes = document.getElementById("leit-notizen").value || "-";

    lines.push("LSPD · Leitstellenblatt");
    lines.push("==============================================");
    lines.push("Datum / Uhrzeit: " + datum);
    lines.push("Funkkanal:       " + kanal);
    lines.push("Supervisor:      " + leiter);
    lines.push("Disponent:       " + disp);
    lines.push("");
    lines.push("Lage / Hinweise");
    lines.push("----------------------------------------------");
    lines.push(notes);
    lines.push("");
    lines.push("Eingeteilte Einheiten");
    lines.push("----------------------------------------------");
    lines.push("Rufname | Rang + Name | Funk | Status | Bemerkung");

    const rows = tbody.querySelectorAll("tr");
    rows.forEach((tr) => {
      const vals = [];
      tr.querySelectorAll("td").forEach((td) => {
        const el = td.querySelector("input, select");
        vals.push(el ? (el.value || "") : "");
      });
      if (vals.some((v) => v.trim() !== "")) {
        lines.push(vals.join(" | "));
      }
    });

    const text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => LSPD.showToast("Leitstellenblatt kopiert."),
        () => LSPD.showToast("Konnte nicht in die Zwischenablage schreiben.", "error")
      );
    } else {
      LSPD.showToast("Clipboard-API nicht verfügbar.", "error");
    }
  });

  initRows();
}
