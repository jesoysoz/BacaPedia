// Kalau sudah login, langsung lempar ke halaman buku
if (getToken()) {
  window.location.href = "books.html";
}

const loginForm = document.getElementById("loginForm");
const errorAlert = document.getElementById("errorAlert");
const submitBtn = document.getElementById("submitBtn");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorAlert.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // Sesuaikan path/nama field ini dengan endpoint login Anda jika berbeda
    const res = await apiFetch("/login", {
      method: "POST",
      body: { email, password },
    });

    const token = res.token || res.data?.token || res.access_token;
    if (!token) throw new Error("Token tidak ditemukan di response login.");

    setToken(token);

    // Ambil profil user (termasuk role) untuk keperluan navbar & authorization di frontend
    const userRes = await apiFetch("/user");
    setUser(userRes.data || userRes);

    window.location.href = "books.html";
  } catch (err) {
    errorAlert.textContent = err.message || "Email atau kata sandi salah.";
    errorAlert.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
  }
});
