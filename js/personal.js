window.Personal = (function () {

    const STORAGE_KEY = "lspd_personal_v1";

    let people = [];
    let editIndex = -1;

    function init() {
        load();
        renderList();
        bindEvents();
    }

    // ---------------------------------------------
    // STORAGE
    // ---------------------------------------------
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    }

    function load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        people = raw ? JSON.parse(raw) : [];
    }

    // ---------------------------------------------
    // EVENTS BINDEN
    // ---------------------------------------------
    function bindEvents() {

        const saveBtn = document.getElementById("p-save");
        const resetBtn = document.getElementById("p-reset");

        const searchInput = document.getElementById("p-search");
        const searchClear = document.getElementById("p-search-clear");

        saveBtn.addEventListener("click", onSave);
        resetBtn.addEventListener("click", clearForm);

        searchInput.addEventListener("input", renderList);
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            renderList();
        });
    }

    // ---------------------------------------------
    // MITARBEITER SPEICHERN
    // ---------------------------------------------
    function onSave() {

        const obj = {
            name: document.getElementById("p-name").value.trim(),
            id: document.getElementById("p-id").value.trim(),
            rank: document.getElementById("p-rank").value,
            dept: document.getElementById("p-dept").value,
            status: document.getElementById("p-status").value,
            gear: document.getElementById("p-gear").value.trim(),
            quals: document.getElementById("p-quals").value.trim(),
            notes: document.getElementById("p-notes").value.trim(),
        };

        if (!obj.name) {
            alert("Bitte einen Namen eingeben!");
            return;
        }

        if (editIndex === -1) {
            // Neuer Eintrag
            people.push(obj);
        } else {
            // Existierenden Eintrag aktualisieren
            people[editIndex] = obj;
        }

        save();
        renderList();
        clearForm();

        alert("Mitarbeiter gespeichert!");
    }

    // ---------------------------------------------
    // FORMULAR LEEREN
    // ---------------------------------------------
    function clearForm() {
        editIndex = -1;

        document.getElementById("p-name").value = "";
        document.getElementById("p-id").value = "";
        document.getElementById("p-rank").value = "";
        document.getElementById("p-dept").value = "";
        document.getElementById("p-status").value = "Aktiv";
        document.getElementById("p-gear").value = "";
        document.getElementById("p-quals").value = "";
        document.getElementById("p-notes").value = "";
    }

    // ---------------------------------------------
    // LISTE ANZEIGEN
    // ---------------------------------------------
    function renderList() {

        const tbody = document.getElementById("p-tbody");
        const search = document.getElementById("p-search").value.toLowerCase();

        tbody.innerHTML = "";

        people
            .filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.id.toLowerCase().includes(search) ||
                p.rank.toLowerCase().includes(search) ||
                p.dept.toLowerCase().includes(search) ||
                p.status.toLowerCase().includes(search)
            )
            .forEach((p, index) => {

                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${p.name}</td>
                    <td>${p.id}</td>
                    <td>${p.rank}</td>
                    <td>${p.dept}</td>
                    <td>${p.status}</td>
                    <td>
                        <button class="btn btn-xs btn-primary" data-edit="${index}">✎</button>
                        <button class="btn btn-xs btn-danger" data-del="${index}">✕</button>
                    </td>
                `;

                tbody.appendChild(tr);
            });

        // Edit / Delete Buttons binden
        tbody.querySelectorAll("[data-edit]").forEach(btn =>
            btn.addEventListener("click", (e) => editPerson(e.target.dataset.edit))
        );

        tbody.querySelectorAll("[data-del]").forEach(btn =>
            btn.addEventListener("click", (e) => deletePerson(e.target.dataset.del))
        );
    }

    // ---------------------------------------------
    // BEARBEITEN
    // ---------------------------------------------
    function editPerson(i) {
        const p = people[i];
        editIndex = i;

        document.getElementById("p-name").value = p.name;
        document.getElementById("p-id").value = p.id;
        document.getElementById("p-rank").value = p.rank;
        document.getElementById("p-dept").value = p.dept;
        document.getElementById("p-status").value = p.status;
        document.getElementById("p-gear").value = p.gear;
        document.getElementById("p-quals").value = p.quals;
        document.getElementById("p-notes").value = p.notes;
    }

    // ---------------------------------------------
    // LÖSCHEN
    // ---------------------------------------------
    function deletePerson(i) {
        if (!confirm("Mitarbeiter wirklich löschen?")) return;

        people.splice(i, 1);
        save();
        renderList();
    }

    return { init };

})();
