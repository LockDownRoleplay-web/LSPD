function initLeitstelle() {
    const tbody = document.getElementById("leit-tbody");
    const addBtn = document.getElementById("leit-add-row");
    const clearBtn = document.getElementById("leit-clear-rows");
    const resetBtn = document.getElementById("leit-reset");
    const copyBtn = document.getElementById("leit-copy");

    let rows = Array.from({ length: 5 }, () => ({
        type: "ADAM",
        number: "1",
        name: "",
        funker: "",
        status: ""
    }));

    const STATUS_OPTIONS = [
        "",
        "10-8 Einsatzbereit",
        "10-7 Außer Dienst",
        "10-6 Beschäftigt",
        "10-23 An Einsatzstelle",
        "10-76 Auf Anfahrt",
        "10-19 Zurück zur Wache"
    ];

    const NUMBER_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i + 1));

    function renderTable() {
        tbody.innerHTML = "";

        rows.forEach((u, index) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>
                    <select class="call-select">
                        <option value="ADAM" ${u.type === "ADAM" ? "selected" : ""}>ADAM</option>
                        <option value="LINCOLN" ${u.type === "LINCOLN" ? "selected" : ""}>LINCOLN</option>
                    </select>
                </td>

                <td>
                    <select class="num-select">
                        ${NUMBER_OPTIONS.map(n => `
                            <option value="${n}" ${u.number === n ? "selected" : ""}>${n}</option>
                        `).join("")}
                    </select>
                </td>

                <td>
                    <input type="text" class="table-input" value="${u.name}">
                </td>

                <td>
                    <input type="text" class="table-input" value="${u.funker}">
                </td>

                <td class="status-del-wrapper">
                    <select class="status-select">
                        ${STATUS_OPTIONS.map(s => `
                            <option value="${s}" ${u.status === s ? "selected" : ""}>${s}</option>
                        `).join("")}
                    </select>

                    <button class="row-del" data-id="${index}">✕</button>
                </td>
            `;

            tbody.appendChild(tr);

            // Event-Listener
            const el = tr.querySelectorAll("select, input");

            el[0].addEventListener("change", e => rows[index].type = e.target.value);
            el[1].addEventListener("change", e => rows[index].number = e.target.value);
            el[2].addEventListener("input", e => rows[index].name = e.target.value);
            el[3].addEventListener("input", e => rows[index].funker = e.target.value);
            el[4].addEventListener("change", e => rows[index].status = e.target.value);

            // Delete button
            tr.querySelector(".row-del").addEventListener("click", () => {
                rows.splice(index, 1);
                renderTable();
            });
        });
    }

    addBtn.addEventListener("click", () => {
        rows.push({ type: "ADAM", number: "1", name: "", funker: "", status: "" });
        renderTable();
    });

    clearBtn.addEventListener("click", () => {
        rows = Array.from({ length: 5 }, () => ({
            type: "ADAM",
            number: "1",
            name: "",
            funker: "",
            status: ""
        }));
        renderTable();
    });

    resetBtn.addEventListener("click", () => {
        document.getElementById("leit-datum").value = "";
        document.getElementById("leit-kanal").value = "";
        document.getElementById("leit-leiter").value = "";
        document.getElementById("leit-disponent").value = "";
        document.getElementById("leit-notizen").value = "";
        clearBtn.click();
    });

    copyBtn.addEventListener("click", () => {
        let out = "LSPD Leitstellenblatt\n-----------------\n\n";

        rows.forEach(r => {
            out += `${r.type}-${r.number} | ${r.name} | Funker: ${r.funker} | ${r.status}\n`;
        });

        navigator.clipboard.writeText(out);
        alert("Leitstellenblatt kopiert!");
    });

    renderTable();
}

document.addEventListener("DOMContentLoaded", initLeitstelle);
