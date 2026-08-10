requireAuth();
renderNavbar("books");

const user = getUser();
const isStaff = user.role === "admin" || user.role === "petugas";
const isAdmin = user.role === "admin";

const booksTable = document.getElementById("booksTable");
const booksTableBody = document.getElementById("booksTableBody");
const loadingText = document.getElementById("loadingText");
const emptyState = document.getElementById("emptyState");
const errorAlert = document.getElementById("errorAlert");
const successAlert = document.getElementById("successAlert");
const addBookBtn = document.getElementById("addBookBtn");

let categoriesCache = [];

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

// Staff (admin/petugas) boleh tambah/edit buku
if (isStaff) {
  addBookBtn.style.display = "inline-block";
}

async function loadCategories() {
  try {
    const res = await apiFetch("/categories");
    categoriesCache = res.data || res;
    const select = document.getElementById("category_id");
    select.innerHTML = categoriesCache
      .map((c) => `<option value="${c.id}">${c.nama_kategori}</option>`)
      .join("");
  } catch (err) {
    // Kategori gagal dimuat tidak menghentikan halaman buku
    console.error(err);
  }
}

function categoryName(id) {
  const c = categoriesCache.find((c) => c.id === id);
  return c ? c.nama_kategori : "-";
}

async function loadBooks() {
  loadingText.style.display = "block";
  booksTable.style.display = "none";
  emptyState.style.display = "none";

  try {
    const res = await apiFetch("/books");
    const books = res.data || res;

    loadingText.style.display = "none";

    if (!books.length) {
      emptyState.style.display = "block";
      return;
    }

    booksTable.style.display = "table";
    booksTableBody.innerHTML = books.map((book) => renderBookRow(book)).join("");
  } catch (err) {
    loadingText.style.display = "none";
    showError(err.message || "Gagal memuat daftar buku.");
  }
}

function renderBookRow(book) {
  const stok = book.stok ?? 0;
  const stokBadge =
    stok > 0
      ? `<span class="badge badge-stok-ok">${stok} tersedia</span>`
      : `<span class="badge badge-stok-habis">Stok habis</span>`;

  const kategori = book.kategori?.nama_kategori || "-";

  let actions = "";

  if (user.role === "anggota") {
    actions = `<button class="btn btn-amber btn-sm" ${stok <= 0 ? "disabled" : ""} onclick="borrowBook(${book.id})">Pinjam</button>`;
  }
  if (isStaff) {
    actions += `<button class="btn btn-outline btn-sm" onclick='openEditBook(${JSON.stringify(book)})'>Ubah</button>`;
  }
  if (isAdmin) {
    actions += `<button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Hapus</button>`;
  }

  return `
    <tr>
      <td data-label="Judul"><strong>${book.judul}</strong></td>
      <td data-label="Penulis">${book.penulis}</td>
      <td data-label="Kategori">${kategori}</td>
      <td data-label="Stok">${stokBadge}</td>
      <td data-label="Aksi"><div class="table-actions">${actions}</div></td>
    </tr>
  `;
}

async function borrowBook(bookId) {
  if (!confirm("Pinjam buku ini?")) return;
  try {
    await apiFetch("/loans", { method: "POST", body: { buku_id: bookId } });
    showSuccess("Peminjaman berhasil dibuat!");
    loadBooks();
  } catch (err) {
    showError(err.message || "Gagal meminjam buku.");
  }
}

// ---------- Modal Tambah/Edit ----------
const bookModal = document.getElementById("bookModal");
const bookForm = document.getElementById("bookForm");
const bookModalTitle = document.getElementById("bookModalTitle");
const bookFormError = document.getElementById("bookFormError");

function openAddBook() {
  bookForm.reset();
  document.getElementById("bookId").value = "";
  bookModalTitle.textContent = "Tambah Buku";
  bookFormError.style.display = "none";
  bookModal.classList.add("open");
}

function openEditBook(book) {
  document.getElementById("bookId").value = book.id;
  document.getElementById("judul").value = book.judul;
  document.getElementById("penulis").value = book.penulis;
  document.getElementById("penerbit").value = book.penerbit;
  const categoryId = book.kategori?.id ?? book.category_id;
  document.getElementById("category_id").value = categoryId || "";
  document.getElementById("stok").value = book.stok;
  document.getElementById("tahun_terbit").value = book.tahun_terbit;
  bookModalTitle.textContent = "Ubah Buku";
  bookFormError.style.display = "none";
  bookModal.classList.add("open");
}

function closeBookModal() {
  bookModal.classList.remove("open");
}

addBookBtn.addEventListener("click", openAddBook);

bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  bookFormError.style.display = "none";

  const id = document.getElementById("bookId").value;
  const payload = {
    judul: document.getElementById("judul").value.trim(),
    penulis: document.getElementById("penulis").value.trim(),
    penerbit: document.getElementById("penerbit").value.trim(),
    category_id: Number(document.getElementById("category_id").value),
    stok: Number(document.getElementById("stok").value),
    tahun_terbit: Number(document.getElementById("tahun_terbit").value),
  };

  try {
    if (id) {
      await apiFetch(`/books/${id}`, { method: "PUT", body: payload });
      showSuccess("Buku berhasil diperbarui.");
    } else {
      await apiFetch("/books", { method: "POST", body: payload });
      showSuccess("Buku berhasil ditambahkan.");
    }
    closeBookModal();
    loadBooks();
  } catch (err) {
    if (err.errors) {
      const firstError = Object.values(err.errors)[0];
      bookFormError.textContent = Array.isArray(firstError) ? firstError[0] : err.message;
    } else {
      bookFormError.textContent = err.message || "Gagal menyimpan buku.";
    }
    bookFormError.style.display = "block";
  }
});

async function deleteBook(id) {
  if (!confirm("Hapus buku ini? Tindakan tidak bisa dibatalkan.")) return;
  try {
    await apiFetch(`/books/${id}`, { method: "DELETE" });
    showSuccess("Buku berhasil dihapus.");
    loadBooks();
  } catch (err) {
    showError(err.message || "Gagal menghapus buku.");
  }
}

// ---------- Init ----------
(async function init() {
  await loadCategories();
  await loadBooks();
})();
