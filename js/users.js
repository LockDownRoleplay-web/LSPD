// js/users.js – Bereinigt, ohne Passwort-Reset, Firebase V9 kompatibel

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


export function initUsers() {

    const nameEl  = document.getElementById("u-name");   // E-Mail
    const passEl  = document.getElementById("u-pass");
    const roleEl  = document.getElementById("u-role");
    const addBtn  = document.getElementById("u-add");
    const tbody   = document.getElementById("u-tbody");

    // ------------------------------------------------------------
    // CREATE USER
    // ------------------------------------------------------------
    async function createFirebaseUser(email, password, displayName, role) {
        try {
            // AUTH USER
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(cred.user, { displayName });

            // FIRESTORE USER PROFILE
            await setDoc(doc(db, "users", cred.user.uid), {
                displayName,
                email,
                role,
                createdAt: serverTimestamp()
            });

            LSPD.showToast("Benutzer erfolgreich erstellt!", "success");
            loadUserList();

        } catch (err) {
            console.error(err);
            LSPD.showToast("Fehler beim Anlegen: " + err.message, "error");
        }
    }


    // ------------------------------------------------------------
    // LOAD USERS
    // ------------------------------------------------------------
    async function loadUserList() {
        tbody.innerHTML = "";

        const snap = await getDocs(collection(db, "users"));

        if (snap.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="font-size:11px;color:#6b7280;">
                        Keine Benutzer vorhanden.
                    </td>
                </tr>`;
            return;
        }

        snap.forEach(docu => {
            const u = docu.data();
            const uid = docu.id;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.displayName}</td>
                <td>${u.role}</td>
                <td></td>
            `;

            // DELETE BUTTON
            const delBtn = document.createElement("button");
            delBtn.className = "btn btn-danger btn-xs";
            delBtn.textContent = "🗑";
            delBtn.title = "Benutzer löschen";

            delBtn.addEventListener("click", () => {
                if (!LSPD.currentUser || LSPD.currentUser.role !== "admin") {
                    return LSPD.showToast("Nur Admins dürfen löschen.", "error");
                }
                deleteUser(uid);
            });

            tr.children[2].appendChild(delBtn);
            tbody.appendChild(tr);
        });
    }


    // ------------------------------------------------------------
    // DELETE USER (Firestore Profil)
    // ------------------------------------------------------------
    async function deleteUser(uid) {
        if (!confirm("Benutzer wirklich löschen?")) return;

        try {
            await deleteDoc(doc(db, "users", uid));

            LSPD.showToast("Benutzer gelöscht.", "info");
            loadUserList();

        } catch (err) {
            console.error(err);
            LSPD.showToast("Fehler beim Löschen: " + err.message, "error");
        }
    }


    // ------------------------------------------------------------
    // ADD USER BUTTON
    // ------------------------------------------------------------
    if (addBtn) {
        addBtn.addEventListener("click", async () => {

            if (!LSPD.currentUser || LSPD.currentUser.role !== "admin") {
                return LSPD.showToast("Nur Admins dürfen Benutzer anlegen.", "error");
            }

            const email = nameEl.value.trim();
            const password = passEl.value.trim();
            const role = roleEl.value;

            if (!email || !password) {
                return LSPD.showToast("E-Mail & Passwort erforderlich!", "error");
            }

            createFirebaseUser(email, password, email, role);

            nameEl.value = "";
            passEl.value = "";
            roleEl.value = "user";
        });
    }


    // ------------------------------------------------------------
    // INITIAL LOAD
    // ------------------------------------------------------------
    loadUserList();
}
