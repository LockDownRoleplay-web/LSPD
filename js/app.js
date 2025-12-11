// js/app.js
(function () {

  window.LSPD = window.LSPD || {};
  let current = null;

  function getAuthRef() {
    return window.auth;
  }
  function getDb() {
    return window.db;
  }

  // -------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------
  function setupLogin() {

    const emailInput = document.getElementById("login-user");
    const passInput  = document.getElementById("login-pass");
    const btn        = document.getElementById("login-btn");
    const errorEl    = document.getElementById("login-error");
    const logoutBtn  = document.getElementById("logout-btn");

    errorEl.style.display = "none";

    async function tryLogin() {
      const email = emailInput.value.trim();
      const pass  = passInput.value.trim();

      const auth = getAuthRef();
      const db   = getDb();

      errorEl.style.display = "none";

      try {
        // 🔹 Login
        const cred = await window.signInWithEmailAndPassword(auth, email, pass);
        const user = cred.user;

        // 🔹 Firestore: User-Dokument abrufen
        const userRef = window.fsDoc(db, "users", user.uid);
        const snap = await window.fsGetDoc(userRef);



        if (!snap.exists()) {
          errorEl.textContent = "Kein Rollenprofil gefunden.";
          errorEl.style.display = "block";
          return;
        }

        const data = snap.data();

        current = {
          uid: user.uid,
          email: user.email,
          name: data.displayName || user.email,
          role: data.role || "officer"
        };

        window.LSPD.currentUser = current;
        sessionStorage.setItem("lspd_current_user", JSON.stringify(current));

        showApp();
        showOnlyAdminParts(isAdmin());
        startModules();

      } catch (err) {
        console.error("LOGIN ERROR:", err);
        errorEl.textContent = "Login fehlgeschlagen.";
        errorEl.style.display = "block";
      }
    }

    btn.addEventListener("click", tryLogin);
    emailInput.addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });
    passInput.addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });

    // Logout Button
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("lspd_current_user");
        window.location.reload();
      });
    }
  }

  // -------------------------------------------------------
  // ADMIN CHECK
  // -------------------------------------------------------
  function isAdmin() {
    return current && (current.role === "admin" || current.role === "chief");
  }

  function showOnlyAdminParts(flag) {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = flag ? "block" : "none";
    });
  }

  // -------------------------------------------------------
  // SESSION RESTORE
  // -------------------------------------------------------
  function restoreSession() {
    const raw = sessionStorage.getItem("lspd_current_user");
    if (!raw) return false;

    try {
      current = JSON.parse(raw);
      window.LSPD.currentUser = current;
      showApp();
      showOnlyAdminParts(isAdmin());
      startModules();
      return true;
    } catch {
      return false;
    }
  }

  // -------------------------------------------------------
  // SHOW APP UI
  // -------------------------------------------------------
  function showApp() {
    const login = document.getElementById("login-screen");
    const app   = document.querySelector(".app");

    login.style.display = "none";
    app.style.display   = "block";
  }

  // -------------------------------------------------------
  // MODULE INIT
  // -------------------------------------------------------
  function startModules() {
    if (window.Personal && Personal.init) Personal.init();
    if (window.Users && Users.init)       Users.init();
    if (window.Straf && Straf.init)       Straf.init();
    if (window.Leit && Leit.init)         Leit.init();
  }

  // -------------------------------------------------------
  // NAVIGATION
  // -------------------------------------------------------
  function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-item");
    const views   = document.querySelectorAll(".view");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;

        buttons.forEach(b => b.classList.remove("nav-item-active"));
        btn.classList.add("nav-item-active");

        views.forEach(v => v.classList.toggle("view-active", v.id === target));
      });
    });
  }

  // -------------------------------------------------------
  // UI SCALE
  // -------------------------------------------------------
  function setupScale() {
    const KEY = "lspd_ui_scale";
    const saved = localStorage.getItem(KEY) || "100";
    document.documentElement.style.setProperty("--ui-scale", saved + "%");

    const sel = document.getElementById("ui-scale");
    if (!sel) return;

    sel.value = saved;
    sel.addEventListener("change", () => {
      localStorage.setItem(KEY, sel.value);
      document.documentElement.style.setProperty("--ui-scale", sel.value + "%");
    });
  }

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const restored = restoreSession();

    if (!restored) {
      document.getElementById("login-screen").style.display = "flex";
    }

    setupLogin();
    setupNavigation();
    setupScale();
  });

})();
