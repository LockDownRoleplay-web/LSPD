// js/users.js

function initUsers() {
  const nameEl = document.getElementById("u-name");
  const passEl = document.getElementById("u-pass");
  const roleEl = document.getElementById("u-role");
  const addBtn = document.getElementById("u-add");
  const tbody = document.getElementById("u-tbody");

  function renderUserTable() {
    if (!tbody) return;
    const users = LSPD.loadUsers ? LSPD.loadUsers() : [];
    tbody.innerHTML = "";

    if (!users.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 3;
      td.textContent = "Keine Benutzer vorhanden.";
      td.style.fontSize = "11px";
      td.style.color = "#6b7280";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    users.forEach((u, index) => {
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = u.username;

      const tdRole = document.createElement("td");
      tdRole.textContent = u.role === "admin" ? "Admin" : "User";

      const tdAct = document.createElement("td");
      if (u.username === "Police_Admin") {
        tdAct.textContent = "Inhaber";
        tdAct.style.fontSize = "11px";
        tdAct.style.color = "#9ca3af";
      } else {
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-danger btn-xs";
        delBtn.textContent = "🗑";
        delBtn.title = "Benutzer löschen";
        delBtn.addEventListener("click", () => {
          if (!LSPD.currentUser || LSPD.currentUser.role !== "admin") {
            LSPD.showToast("Nur Admins können Benutzer löschen.", "error");
            return;
          }
          if (!confirm("Benutzer wirklich löschen?")) return;
          const arr = LSPD.loadUsers();
          arr.splice(index, 1);
          LSPD.saveUsers(arr);
          renderUserTable();
          LSPD.showToast("Benutzer gelöscht.");
        });
        tdAct.appendChild(delBtn);
      }

      tr.appendChild(tdName);
      tr.appendChild(tdRole);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  }

  LSPD.renderUserTable = renderUserTable;

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!LSPD.currentUser || LSPD.currentUser.role !== "admin") {
        LSPD.showToast("Nur Admins können Benutzer anlegen.", "error");
        return;
      }
      const username = nameEl.value.trim();
      const password = passEl.value.trim();
      const role = roleEl.value || "user";

      if (!username || !password) {
        LSPD.showToast("Benutzername & Passwort sind Pflichtfelder.", "error");
        return;
      }

      const users = LSPD.loadUsers();
      if (users.some((u) => u.username === username)) {
        LSPD.showToast("Benutzername existiert bereits.", "error");
        return;
      }

      users.push({ username, password, role });
      LSPD.saveUsers(users);
      nameEl.value = "";
      passEl.value = "";
      roleEl.value = "user";
      renderUserTable();
      LSPD.showToast("Benutzer angelegt.");
    });
  }

  renderUserTable();
}
