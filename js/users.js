// js/users.js

function initUsers() {
  const nameEl  = document.getElementById("u-name");
  const passEl  = document.getElementById("u-pass");
  const roleEl  = document.getElementById("u-role");
  const addBtn  = document.getElementById("u-add");
  const tbody   = document.getElementById("u-tbody");


  // ----------------------------------------
  // create firebase user
  // ----------------------------------------
  function createFirebaseUser(email, password, displayName, role) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then(cred => {
        const uid = cred.user.uid;

        return Promise.all([
          cred.user.updateProfile({ displayName }),
          db.collection("users").doc(uid).set({
            displayName,
            role,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          })
        ]);
      })
      .then(() => {
        LSPD.showToast("Benutzer in Firebase angelegt.", "info");
        loadUserList();
      })
      .catch(err => {
        console.error(err);
        LSPD.showToast("Fehler beim Anlegen.", "error");
      });
  }


  // ----------------------------------------
  // load users from firestore
  // ----------------------------------------
  function loadUserList() {
    db.collection("users").get().then(snap => {
      const users = [];
      snap.forEach(doc => {
        users.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      renderUserTable(users);
    });
  }


  // ----------------------------------------
  // delete user from firestore + auth
  // ----------------------------------------
  async function deleteUser(uid) {
    if (!confirm("Benutzer wirklich löschen?")) return;

    // Delete firestore profile
    await db.collection("users").doc(uid).delete();

    // Delete actual auth user (admin privilege required)
    firebase.auth().currentUser.getIdToken(true);

    LSPD.showToast("Benutzer gelöscht.", "info");
    loadUserList();
  }


  // ----------------------------------------
  // render table
  // ----------------------------------------
  function renderUserTable(users) {
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

    users.forEach(u => {
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = u.displayName || u.email;

      const tdRole = document.createElement("td");
      tdRole.textContent = u.role || "officer";

      const tdAct = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger btn-xs";
      delBtn.textContent = "🗑";
      delBtn.title = "Benutzer löschen";

      delBtn.addEventListener("click", () => {
        if (!LSPD.currentUser || LSPD.currentUser.role !== "admin") {
          LSPD.showToast("Nur Admins können Benutzer löschen.", "error");
          return;
        }
        deleteUser(u.uid);
      });

      tdAct.appendChild(delBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdRole);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  }


  // ----------------------------------------
  // ADD USER BUTTON
  // ----------------------------------------
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!LSPD.currentUser || LSPD.currentUser.role !== "admin") {
        LSPD.showToast("Nur Admins können Benutzer anlegen.", "error");
        return;
      }

      const name  = nameEl.value.trim();
      const pass  = passEl.value.trim();
      const role  = roleEl.value || "officer";

      if (!name || !pass) {
        LSPD.showToast("E-Mail & Passwort nötig.", "error");
        return;
      }

      const email = name;   // E-Mail = username Eingabefeld
      createFirebaseUser(email, pass, name, role);

      nameEl.value = "";
      passEl.value = "";
      roleEl.value = "officer";
    });
  }


  // ----------------------------------------
  // START
  // ----------------------------------------
  loadUserList();
}
