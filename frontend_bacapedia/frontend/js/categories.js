requireAuth();
requireRole(["admin", "petugas"]);
renderNavbar("categories");

const categoriesTable = document.getElementById("categoriesTable");
const categoriesTableBody = document.getElementById("categoriesTableBody");
const loadingText = document.getElementById("loadingText");
const emptyState = document.getElementById("emptyState");
const errorAlert = document.getElementById("errorAlert");
const successAlert = document.getElementById("successAlert");

function showError(msg) {
  errorAlert.textContent = msg;
  errorAlert.style.display = "block";
  successAlert.style.display = "none";
  setTimeout(() => (errorAlert.style.display = "none"), 4000);
}

function showSuccess(msg) {
  successAlert.textContent = msg;
  successAlert.style.display = "block";
  errorAlert.style.display = "none";
  setTimeout(() => (successAlert.style.display = "none"), 3000);
}

async function loadCategories() {
  loadingText.style.display = "block";
  categoriesTable.style.display = "none";
  emptyState.style.display = "none";

  try {
    const res = await apiFetch("/categories");
    const categories = res.data || res;
    loadingText.style.display = "none";

    if (!categories.length) {
      emptyState.style.display = "block";
      return;
    }

    categoriesTable.style.display = "table";
    categoriesTableBody.innerHTML = categories.map(renderCategoryRow).join("");
  } catch (err) {
    loadingText.style.display = "none";
    showError(err.message || "Gagal memuat data kategori.");
  }
}

function renderCategoryRow(cat) {
  const jumlahBuku = cat.books_count ?? cat.books?.length ?? "-";
  return `
    <tr>
      <td data-label="Nama Kategori"><strong>${cat.nama_kategori}</strong></td>
      <td data-label="Jumlah Buku">${jumlahBuku}</td>
      <td data-label="Aksi">
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick='openEditCategory(${JSON.stringify(cat)})'>Ubah</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.id})">Hapus</button>
        </div>
      </td>
    </tr>
  `;
}

// ---------- Modal ----------
const categoryModal = document.getElementById("categoryModal");
const categoryForm = document.getElementById("categoryForm");
const categoryModalTitle = document.getElementById("categoryModalTitle");
const categoryFormError = document.getElementById("categoryFormError");

function openAddCategory() {
  categoryForm.reset();
  document.getElementById("categoryId").value = "";
  categoryModalTitle.textContent = "Tambah Kategori";
  categoryFormError.style.display = "none";
  categoryModal.classList.add("open");
}

function openEditCategory(cat) {
  document.getElementById("categoryId").value = cat.id;
  document.getElementById("nama_kategori").value = cat.nama_kategori;
  categoryModalTitle.textContent = "Ubah Kategori";
  categoryFormError.style.display = "none";
  categoryModal.classList.add("open");
}

function closeCategoryModal() {
  categoryModal.classList.remove("open");
}

document.getElementById("addCategoryBtn").addEventListener("click", openAddCategory);

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  categoryFormError.style.display = "none";

  const id = document.getElementById("categoryId").value;
  const payload = { nama_kategori: document.getElementById("nama_kategori").value.trim() };

  try {
    if (id) {
      await apiFetch(`/categories/${id}`, { method: "PUT", body: payload });
      showSuccess("Kategori berhasil diperbarui.");
    } else {
      await apiFetch("/categories", { method: "POST", body: payload });
      showSuccess("Kategori berhasil ditambahkan.");
    }
    closeCategoryModal();
    loadCategories();
  } catch (err) {
    if (err.errors) {
      const firstError = Object.values(err.errors)[0];
      categoryFormError.textContent = Array.isArray(firstError) ? firstError[0] : err.message;
    } else {
      categoryFormError.textContent = err.message || "Gagal menyimpan kategori.";
    }
    categoryFormError.style.display = "block";
  }
});

async function deleteCategory(id) {
  if (!confirm("Hapus kategori ini? Buku yang memakai kategori ini bisa terpengaruh.")) return;
  try {
    await apiFetch(`/categories/${id}`, { method: "DELETE" });
    showSuccess("Kategori berhasil dihapus.");
    loadCategories();
  } catch (err) {
    showError(err.message || "Gagal menghapus kategori.");
  }
}

loadCategories();
