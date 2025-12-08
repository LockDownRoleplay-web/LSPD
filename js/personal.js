// js/personal.js

function initPersonal() {
  const STORAGE_KEY = "lspd_personnel_v2";

  const nameEl = document.getElementById("p-name");
  const idEl = document.getElementById("p-id");
  const rankEl = document.getElementById("p-rank");
  const deptEl = document.getElementById("p-dept");
  const statusEl = document.getElementById("p-status");
  const gearEl = document.getElementById("p-gear");
  const qualsEl = document.getElementById("p-quals");
  const notesEl = document.getElementById("p-notes");
  const editIndexEl = document.getElementById("p-edit-index");

  const saveBtn = document.getElementById("p-save");
  const resetBtn = document.getElementById("p-reset");
  const searchEl = document.getElementById("p-search");
  const searchClearEl = document.getElementById("p-search-clear");
  const tbody = document.getElementById("p-tbody");

  let data = [];

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      data = raw ? JSON.parse(raw) : [];
    } catch {
      data = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearForm() {
    nameEl.value = "";
    idEl.value = "";
    rankEl.value = "";
    deptEl.value = "";
    statusEl.value = "Aktiv";
    gearEl.value = "";
    qualsEl.value = "";
    notesEl.value = "";
    editIndexEl.value = "-1";
  }

  function render(filterText = "") {
    tbody.innerHTML = "";
    const q = (filterText || "").toLowerCase();

    let count = 0;

    data.forEach((p, index) => {
      const combined = (
        (p.name || "") +
        " " +
        (p.id || "") +
        " " +
        (p.rank || "") +
        " " +
        (p.dept || "") +
        " " +
        (p.status || "")
      ).toLowerCase();

      if (q && !combined.includes(q)) return;

      count++;
      const tr = document.createElement("tr");

      function td(text) {
        const tdEl = document.createElement("td");
        tdEl.textContent = text || "";
        return tdEl;
      }

      tr.appendChild(td(p.name));
      tr.appendChild(td(p.id));
      tr.appendChild(td(p.rank));
      tr.appendChild(td(p.dept));
      tr.appendChild(td(p.status));

      const tdActions = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-ghost btn-xs";
      editBtn.textContent = "✏️";
      editBtn.title = "Bearbeiten";
      editBtn.addEventListener("click", () => {
        nameEl.value = p.name || "";
        idEl.value = p.id || "";
        rankEl.value = p.rank || "";
        deptEl.value = p.dept || "";
        statusEl.value = p.status || "Aktiv";
        gearEl.value = p.gear || "";
        qualsEl.value = p.quals || "";
        notesEl.value = p.notes || "";
        editIndexEl.value = String(index);
      });

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger btn-xs";
      delBtn.textContent = "🗑";
      delBtn.title = "Löschen";
      delBtn.addEventListener("click", () => {
        if (!confirm("Mitarbeiter wirklich löschen?")) return;
        data.splice(index, 1);
        save();
        render(searchEl.value);
        LSPD.showToast("Mitarbeiter gelöscht.");
      });

      tdActions.appendChild(editBtn);
      tdActions.appendChild(delBtn);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

    if (count === 0) {
      const tr = document.createElement("tr");
      const tdEmpty = document.createElement("td");
      tdEmpty.colSpan = 6;
      tdEmpty.textContent = "Keine Mitarbeiter gefunden.";
      tdEmpty.style.color = "#6b7280";
      tdEmpty.style.fontSize = "11px";
      tr.appendChild(tdEmpty);
      tbody.appendChild(tr);
    }
  }

  saveBtn.addEventListener("click", () => {
    const name = nameEl.value.trim();
    const id = idEl.value.trim();
    const rank = rankEl.value;
    const dept = deptEl.value;
    const status = statusEl.value;
    const gear = gearEl.value.trim();
    const quals = qualsEl.value.trim();
    const notes = notesEl.value.trim();
    const editIndex = parseInt(editIndexEl.value, 10);

    if (!name || !id || !rank || !dept) {
      LSPD.showToast("Name, Dienstnummer, Rang & Abteilung sind Pflichtfelder.", "error");
      return;
    }

    const entry = {
      name,
      id,
      rank,
      dept,
      status,
      gear,
      quals,
      notes,
    };

    if (!isNaN(editIndex) && editIndex >= 0 && editIndex < data.length) {
      data[editIndex] = entry;
      LSPD.showToast("Mitarbeiter aktualisiert.");
    } else {
      data.push(entry);
      LSPD.showToast("Mitarbeiter hinzugefügt.");
    }

    save();
    clearForm();
    render(searchEl.value);
  });

  resetBtn.addEventListener("click", () => {
    clearForm();
  });

  searchEl.addEventListener("input", () => {
    render(searchEl.value);
  });

  searchClearEl.addEventListener("click", () => {
    searchEl.value = "";
    render("");
  });

  load();
  render("");
}
