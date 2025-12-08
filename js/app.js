// js/app.js

(function () {
  const USER_KEY = "lspd_users_v2";

  // Global Namespace
  window.LSPD = window.LSPD || {};
  LSPD.currentUser = null;

  // --- Storage Helpers ---
  function loadUsers() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USER_KEY, JSON.stringify(users));
  }

  function ensureAdmin() {
    const users = loadUsers();
    const exists = users.some((u) => u.username === "Police_Admin");
    if (!exists) {
      users.push({
        username: "Police_Admin",
        password: "Policeadmin2",
        role: "admin",
      });
      saveUsers(users);
    }
  }

  // --- Toast ---
  function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    const icon = document.getElementById("toast-icon");
    const text = document.getElementById("toast-text");
    if (!toast) return;
    text.textContent = message;
    icon.textContent = type === "error" ? "⚠️" : "✅";
    toast.classList.remove("toast-hidden");
    setTimeout(() => toast.classList.add("toast-hidden"), 2300);
  }
  LSPD.showToast = showToast;

  // --- Login / Session ---
  function setCurrentUser(user) {
    LSPD.currentUser = user;
    sessionStorage.setItem(
      "lspd_current_user",
      JSON.stringify({ username: user.username, role: user.role })
    );
    updateUIForLogin();
  }

  function restoreSession() {
    const raw = sessionStorage.getItem("lspd_current_user");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data || !data.username) return;
      const users = loadUsers();
      const found = users.find((u) => u.username === data.username);
      if (found) {
        LSPD.currentUser = found;
      }
    } catch {
      // ignore
    }
  }

  function clearSession() {
    LSPD.currentUser = null;
    sessionStorage.removeItem("lspd_current_user");
    updateUIForLogin();
  }

  function updateUIForLogin() {
    const loginScreen = document.getElementById("login-screen");
    const appRoot = document.getElementById("app-root");
    const label = document.getElementById("current-user-label");
    const adminSections = document.querySelectorAll(".admin-only");

    if (LSPD.currentUser) {
      loginScreen.style.display = "none";
      appRoot.style.display = "block";
      label.textContent =
        LSPD.currentUser.username +
        " (" +
        (LSPD.currentUser.role === "admin" ? "Admin" : "User") +
        ")";
      adminSections.forEach((el) => {
        el.style.display = LSPD.currentUser.role === "admin" ? "block" : "none";
      });
    } else {
      loginScreen.style.display = "flex";
      appRoot.style.display = "none";
    }

    if (typeof LSPD.updateStrafLockUI === "function") {
      LSPD.updateStrafLockUI();
    }

    if (typeof LSPD.renderUserTable === "function") {
      LSPD.renderUserTable();
    }
  }

  function setupLogin() {
    const btn = document.getElementById("login-btn");
    const userInput = document.getElementById("login-user");
    const passInput = document.getElementById("login-pass");
    const errorEl = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");

    function tryLogin() {
      const username = userInput.value.trim();
      const password = passInput.value;
      const users = loadUsers();
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) {
        errorEl.style.display = "block";
        showToast("Login fehlgeschlagen.", "error");
        return;
      }
      errorEl.style.display = "none";
      setCurrentUser(user);
      showToast(`Eingeloggt als ${user.username}`, "info");
    }

    btn.addEventListener("click", tryLogin);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryLogin();
      }
    });
    passInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryLogin();
      }
    });

    logoutBtn.addEventListener("click", () => {
      clearSession();
    });

    LSPD.loadUsers = loadUsers;
    LSPD.saveUsers = saveUsers;
  }

  // --- Navigation ---
  function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-item");
    const views = document.querySelectorAll(".view");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        buttons.forEach((b) => b.classList.remove("nav-item-active"));
        btn.classList.add("nav-item-active");
        views.forEach((v) => {
          v.classList.toggle("view-active", v.id === targetId);
        });
        if (targetId === "view-strafkatalog" && typeof LSPD.updateStrafLockUI === "function") {
          LSPD.updateStrafLockUI();
        }
      });
    });
  }

  // --- UI Scale ---
  function setupScale() {
    const KEY = "lspd_ui_scale";
    const sel = document.getElementById("ui-scale");

    function applyScale(val) {
      document.documentElement.style.setProperty("--ui-scale", val+"%");
    }

    const saved = localStorage.getItem(KEY) || "200";
    applyScale(saved);

    if (sel) {
      sel.value = saved;
      sel.addEventListener("change", () => {
        const val = sel.value;
        localStorage.setItem(KEY, val);
        applyScale(val);
      });
    }
  }

  // --- INIT ---
  document.addEventListener("DOMContentLoaded", () => {
    ensureAdmin();
    restoreSession();
    setupLogin();
    setupNavigation();
    setupScale();

    if (typeof initLeitstelle === "function") initLeitstelle();
    if (typeof initStrafkatalog === "function") initStrafkatalog();
    if (typeof initPersonal === "function") initPersonal();
    if (typeof initUsers === "function") initUsers();

    updateUIForLogin();
  });
})();
