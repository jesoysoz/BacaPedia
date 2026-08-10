requireAuth();
renderNavbar("loans");

const user = getUser();
const isStaff = user.role === "admin" || user.role === "petugas";

const loansTable = document.getElementById("loansTable");
const loansTableBody = document.getElementById("loansTableBody");
const loadingText = document.getElementById("loadingText");
const emptyState = document.getElementById("emptyState");
const errorAlert = document.getElementById("errorAlert");
const successAlert = document.getElementById("successAlert");

let allLoans = [];
let currentFilter = "semua";

if (isStaff) {
  document.getElementById("pageTitle").textContent = "Seluruh Peminjaman";
  document.getElementById("pageSubtitle").textContent = "Kelola dan proses pengembalian buku anggota";
  document.getElementById("peminjamHeader").style.display = "table-cell";
}

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

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-tabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderLoans();
}

async function loadLoans() {
  loadingText.style.display = "block";
  loansTable.style.display = "none";
  emptyState.style.display = "none";

  try {
    const res = await apiFetch("/loans");
    allLoans = res.data || res;
    loadingText.style.display = "none";
    renderLoans();
  } catch (err) {
    loadingText.style.display = "none";
    showError(err.message || "Gagal memuat data peminjaman.");
  }
}

function renderLoans() {
  const filtered =
    currentFilter === "semua" ? allLoans : allLoans.filter((l) => l.status === currentFilter);

  if (!filtered.length) {
    loansTable.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  loansTable.style.display = "table";
  emptyState.style.display = "none";
  loansTableBody.innerHTML = filtered.map((loan) => renderLoanRow(loan)).join("");
}

function renderLoanRow(loan) {
  const statusBadge =
    loan.status === "dipinjam"
      ? `<span class="badge badge-dipinjam">Dipinjam</span>`
      : `<span class="badge badge-dikembalikan">Dikembalikan</span>`;

  const peminjamCell = isStaff
    ? `<td data-label="Peminjam">${loan.user?.name || "-"}</td>`
    : "";

  let actionCell = "-";
  const isOwner = loan.user?.id === user.id;
  const canReturn = loan.status === "dipinjam" && (isStaff || isOwner);

  if (canReturn) {
    actionCell = `<button class="btn btn-amber btn-sm" onclick="returnLoan(${loan.id})">Kembalikan</button>`;
  }

  return `
    <tr>
      <td data-label="Buku"><strong>${loan.book?.judul || "-"}</strong></td>
      ${peminjamCell}
      <td data-label="Tgl Pinjam">${formatDate(loan.tanggal_pinjam)}</td>
      <td data-label="Jatuh Tempo">${formatDate(loan.tanggal_jatuh_tempo)}</td>
      <td data-label="Tgl Kembali">${formatDate(loan.tanggal_kembali)}</td>
      <td data-label="Status">${statusBadge}</td>
      <td data-label="Denda">${loan.denda > 0 ? formatRupiah(loan.denda) : "-"}</td>
      <td data-label="Aksi">${actionCell}</td>
    </tr>
  `;
}

async function returnLoan(loanId) {
  if (!confirm("Proses pengembalian buku ini?")) return;
  try {
    const res = await apiFetch(`/loans/${loanId}/return`, { method: "PUT" });
    const denda = res.data?.denda || 0;
    showSuccess(
      denda > 0
        ? `Buku berhasil dikembalikan. Denda keterlambatan: ${formatRupiah(denda)}`
        : "Buku berhasil dikembalikan."
    );
    loadLoans();
  } catch (err) {
    showError(err.message || "Gagal memproses pengembalian.");
  }
}

loadLoans();
