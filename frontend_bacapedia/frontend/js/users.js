// ==========================================================
// users.js — Kelola user oleh admin
// ==========================================================

requireAuth();
requireRole(["admin"]);
renderNavbar("users");

const usersTable = document.getElementById("usersTable");
const usersTableBody = document.getElementById("usersTableBody");
const loadingText = document.getElementById("loadingText");
const emptyState = document.getElementById("emptyState");
const errorAlert = document.getElementById("errorAlert");
const successAlert = document.getElementById("successAlert");
const addUserBtn = document.getElementById("addUserBtn");


// ==========================================================
// Alert
// ==========================================================

function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.style.display = "block";
    successAlert.style.display = "none";

    setTimeout(() => {
        errorAlert.style.display = "none";
    }, 4000);
}


function showSuccess(msg) {
    successAlert.textContent = msg;
    successAlert.style.display = "block";
    errorAlert.style.display = "none";

    setTimeout(() => {
        successAlert.style.display = "none";
    }, 3000);
}


// ==========================================================
// Load Users
// ==========================================================

async function loadUsers() {

    loadingText.style.display = "block";
    usersTable.style.display = "none";
    emptyState.style.display = "none";

    try {

        const res = await apiFetch("/users");
        const users = res.data || res;

        loadingText.style.display = "none";

        if (!users.length) {
            emptyState.style.display = "block";
            return;
        }

        usersTable.style.display = "table";

        usersTableBody.innerHTML = users
            .map(renderUserRow)
            .join("");

    } catch (err) {

        loadingText.style.display = "none";

        showError(
            err.message || "Gagal memuat daftar user."
        );
    }
}


// ==========================================================
// Render User
// ==========================================================

function renderUserRow(user) {

    return `
        <tr>

            <td data-label="Nama">
                <strong>
                    ${user.name || "-"}
                </strong>
            </td>

            <td data-label="Email">
                ${user.email || "-"}
            </td>

            <td data-label="Role">
                <span class="badge">
                    ${user.role || "-"}
                </span>
            </td>

        </tr>
    `;
}


// ==========================================================
// Modal
// ==========================================================

const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const userModalTitle = document.getElementById("userModalTitle");
const userFormError = document.getElementById("userFormError");


function openAddUser() {

    userForm.reset();

    userModalTitle.textContent = "Tambah User";

    userFormError.textContent = "";
    userFormError.style.display = "none";

    userModal.classList.add("open");
}


function closeUserModal() {

    userModal.classList.remove("open");

    userForm.reset();

    userFormError.textContent = "";
    userFormError.style.display = "none";
}


// Tombol Tambah User
addUserBtn.addEventListener(
    "click",
    openAddUser
);


// ==========================================================
// Submit Tambah User
// ==========================================================

userForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        userFormError.style.display = "none";


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const role =
            document.getElementById("role").value;


        // Validasi password
        if (password.length < 6) {

            userFormError.textContent =
                "Password yang dimasukan harus berjumlah minimal 6 karakter";

            userFormError.style.display = "block";

            return;
        }


        const payload = {
            name: name,
            email: email,
            password: password,
            role: role
        };


        try {

            await apiFetch("/users", {
                method: "POST",
                body: payload
            });


            showSuccess(
                "User berhasil ditambahkan."
            );


            closeUserModal();

            await loadUsers();

        } catch (err) {

            if (err.errors) {

                const firstError =
                    Object.values(err.errors)[0];

                userFormError.textContent =
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError;

            } else {

                userFormError.textContent =
                    err.message ||
                    "Gagal menambahkan user.";
            }

            userFormError.style.display = "block";
        }
    }
);


// ==========================================================
// Init
// ==========================================================

loadUsers();