// ==========================================================
// api.js — Helper untuk komunikasi dengan API Laravel BacaPedia
// ==========================================================

// Ganti sesuai alamat backend Laravel Anda
const API_BASE_URL = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("bacapedia_token");
}

function setToken(token) {
  localStorage.setItem("bacapedia_token", token);
}

function getUser() {
  const raw = localStorage.getItem("bacapedia_user");
  return raw ? JSON.parse(raw) : null;
}

function setUser(user) {
  localStorage.setItem("bacapedia_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("bacapedia_token");
  localStorage.removeItem("bacapedia_user");
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

/**
 * Wrapper fetch ke API Laravel.
 * Otomatis menambahkan header Authorization & Accept.
 * @param {string} path - contoh: "/books" atau "/loans/5/return"
 * @param {object} options - { method, body }
 */
async function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Token invalid/expired -> paksa logout
  if (res.status === 401) {
    clearSession();
    window.location.href = "index.html";
    throw new Error("Sesi berakhir, silakan login kembali.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.message || "Terjadi kesalahan.");
    error.status = res.status;
    error.errors = data?.errors || null;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Wajib login untuk mengakses halaman ini.
 * Panggil di awal setiap halaman terproteksi.
 */
function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

/**
 * Wajib role tertentu untuk mengakses halaman ini.
 * @param {string[]} allowedRoles
 */
function requireRole(allowedRoles) {
  const user = getUser();
  if (!user || !allowedRoles.includes(user.role)) {
    window.location.href = "books.html";
  }
}

/** Format tanggal ke format Indonesia yang mudah dibaca */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** Format angka ke Rupiah */
function formatRupiah(num) {
  return "Rp" + Number(num || 0).toLocaleString("id-ID");
}
