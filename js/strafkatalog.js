window.Straf = (function () {

    function init() {
        initStrafkatalog();
    }

    function initStrafkatalog() {

        const categoriesEl = document.getElementById("straf-categories");
        const listEl = document.getElementById("straf-list");
        const summaryList = document.getElementById("straf-summary-list");

        const metricCount = document.getElementById("metric-count");
        const metricMoney = document.getElementById("metric-money");
        const metricJail = document.getElementById("metric-jail");

        const copyBtn = document.getElementById("straf-copy");
        const clearBtn = document.getElementById("straf-clear");

        let activeCategory = "allgemein";
        let selected = [];

        // ---------------------------------------------
        // STRAFKATALOG
        // ---------------------------------------------
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
                    { id: "g6", name: "Zwangsprostitution", fine: 6000, jail: 70 },
                    { id: "g7", name: "Zuhälterei", fine: 3000, jail: 40 }
                ]
            },

            {
                id: "koerper",
                icon: "🩸",
                name: "Körperverletzung / Tötung",
                offences: [
                    { id: "k1", name: "Einfache Körperverletzung", fine: 1000, jail: 15 },
                    { id: "k2", name: "Gefährliche Körperverletzung", fine: 2000, jail: 30 },
                    { id: "k3", name: "Schwere Körperverletzung", fine: 3000, jail: 40 },
                    { id: "k4", name: "Fahrlässige Tötung", fine: 3000, jail: 40 },
                    { id: "k5", name: "Totschlag", fine: 6000, jail: 80 },
                    { id: "k6", name: "Mord", fine: 0, jail: 120 }
                ]
            },

            {
                id: "eigentum",
                icon: "💰",
                name: "Eigentumsdelikte",
                offences: [
                    { id: "e1", name: "Einfacher Raub", fine: 3000, jail: 35 },
                    { id: "e2", name: "Hausraub", fine: 5000, jail: 55 },
                    { id: "e3", name: "Ladenraub", fine: 4000, jail: 40 },
                    { id: "e4", name: "Bankraub", fine: 8000, jail: 80 },
                    { id: "e5", name: "Geldautomatensprengung", fine: 5000, jail: 60 },
                    { id: "e6", name: "Fahrzeugraub", fine: 4500, jail: 45 },
                    { id: "e7", name: "Einbruchdiebstahl", fine: 5000, jail: 50 }
                ]
            },

            {
                id: "verkehr",
                icon: "🚓",
                name: "Verkehrsdelikte",
                offences: [
                    { id: "v1", name: "Fahren ohne Fahrzeugpapiere", fine: 300, jail: 10 },
                    { id: "v2", name: "Falschparken", fine: 150, jail: 0 },
                    { id: "v3", name: "Gefährdung des Straßenverkehrs", fine: 300, jail: 5 },
                    { id: "v4", name: "Unfallflucht", fine: 1000, jail: 10 },
                    { id: "v5", name: "Fahren ohne Führerschein", fine: 1000, jail: 10 },
                    { id: "v6", name: "Illegales Autorennen", fine: 2000, jail: 20 },
                    { id: "v7", name: "Fahren unter Drogen/Alkohol", fine: 1500, jail: 15 },
                    { id: "v8", name: "1–20 km/h", fine: 150, jail: 0 },
                    { id: "v9", name: "21–40 km/h", fine: 300, jail: 0 },
                    { id: "v10", name: "41–60 km/h", fine: 750, jail: 0 },
                    { id: "v11", name: "61–100 km/h", fine: 1250, jail: 0 },
                    { id: "v12", name: "Über 100 km/h", fine: 1500, jail: 0 }
                ]
            },

            {
                id: "drogen",
                icon: "💊",
                name: "Drogendelikte",
                offences: [
                    { id: "d1", name: "Weiche Drogen", fine: 1000, jail: 10 },
                    { id: "d2", name: "Drogenhandel (klein)", fine: 2000, jail: 25 },
                    { id: "d3", name: "Drogenhandel (mittel)", fine: 4000, jail: 35 },
                    { id: "d4", name: "Drogenhandel (groß)", fine: 6000, jail: 45 },
                    { id: "d5", name: "Drogenproduktion", fine: 5000, jail: 40 }
                ]
            },

            {
                id: "waffen",
                icon: "🏛️",
                name: "Waffen- & Staatsdelikte",
                offences: [
                    { id: "s1", name: "Unerlaubter Besitz Handwaffe", fine: 2000, jail: 20 },
                    { id: "s2", name: "Unerlaubtes Führen Handfeuerwaffe", fine: 2500, jail: 25 },
                    { id: "s3", name: "Besitz von Langwaffen", fine: 3000, jail: 35 },
                    { id: "s4", name: "Handel mit Langwaffen", fine: 4500, jail: 45 },
                    { id: "s5", name: "Besitz von Sprengstoff", fine: 5000, jail: 50 },
                    { id: "s6", name: "Vorbereitung eines Anschlags", fine: 0, jail: 70 }
                ]
            }
        ];

        // ---------------------------------------------
        // Kategorien anzeigen
        // ---------------------------------------------
        function renderCategories() {
            categoriesEl.innerHTML = "";
            CATALOG.forEach(cat => {
                const btn = document.createElement("button");
                btn.className = "chip" + (cat.id === activeCategory ? " chip-active" : "");
                btn.dataset.id = cat.id;
                btn.innerHTML = `<span class="chip-icon">${cat.icon}</span>${cat.name}`;
                categoriesEl.appendChild(btn);
            });
        }

        // ---------------------------------------------
        // Kategorien-Klick FIX (hat dir gefehlt!)
        // ---------------------------------------------
        categoriesEl.addEventListener("click", e => {
            const chip = e.target.closest(".chip");
            if (!chip) return;

            activeCategory = chip.dataset.id;
            renderCategories();
            renderOffences();
        });

        // ---------------------------------------------
        // Strafenliste anzeigen
        // ---------------------------------------------
        function renderOffences() {
            listEl.innerHTML = "";

            const cat = CATALOG.find(c => c.id === activeCategory);
            if (!cat) return;

            cat.offences.forEach(o => {
                const row = document.createElement("div");
                row.className = "offence-row";
                row.innerHTML = `
                    <div class="offence-name">${o.name}</div>
                    <div class="offence-meta">${o.fine} $</div>
                    <div class="offence-meta">${o.jail} Min.</div>
                `;

                const btn = document.createElement("button");
                btn.className = "btn btn-primary btn-xs";
                btn.textContent = "➕";
                btn.addEventListener("click", () => {
                    selected.push(o);
                    renderSummary();
                });

                row.appendChild(btn);
                listEl.appendChild(row);
            });
        }

        // ---------------------------------------------
        // Zusammenfassung
        // ---------------------------------------------
        function renderSummary() {
            summaryList.innerHTML = "";

            if (selected.length === 0) {
                summaryList.innerHTML = `<div class="summary-empty">Noch keine Delikte hinzugefügt.</div>`;
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
                row.innerHTML = `
                    <div>${o.name}</div>
                    <div>${o.fine} $</div>
                    <div>${o.jail} Min.</div>
                `;

                const delBtn = document.createElement("button");
                delBtn.className = "btn btn-ghost btn-xs";
                delBtn.textContent = "✕";
                delBtn.addEventListener("click", () => {
                    selected.splice(index, 1);
                    renderSummary();
                });

                row.appendChild(delBtn);
                summaryList.appendChild(row);
            });

            metricCount.textContent = selected.length;
            metricMoney.textContent = totalFine + " $";
            metricJail.textContent = totalJail + " Min.";
        }

        // ---------------------------------------------
        // Zusammenfassung für Copy erstellen
        // ---------------------------------------------
        function buildSummaryText() {
            if (selected.length === 0)
                return "Keine Delikte ausgewählt.";

            let totalFine = 0;
            let totalJail = 0;

            let lines = [];

            lines.push("LSPD Strafzusammenfassung");
            lines.push("-------------------------");
            lines.push("");

            selected.forEach(o => {
                lines.push(`${o.name} (${o.fine} $ / ${o.jail} Min.)`);
                totalFine += o.fine;
                totalJail += o.jail;
            });

            lines.push("");
            lines.push("-------------------------");
            lines.push(`Gesamtstrafe: ${totalFine} $`);
            lines.push(`Gesamthaftzeit: ${totalJail} Min.`);

            return lines.join("\n");
        }

        // ---------------------------------------------
        // Buttons
        // ---------------------------------------------
        clearBtn.addEventListener("click", () => {
            selected = [];
            renderSummary();
        });

        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(buildSummaryText()).then(() => {
                alert("Strafzusammenfassung kopiert!");
            });
        });

        // ---------------------------------------------
        // Init
        // ---------------------------------------------
        renderCategories();
        renderOffences();
        renderSummary();
    }

    return { init };

})();
