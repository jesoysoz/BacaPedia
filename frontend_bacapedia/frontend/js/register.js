if (getToken()) {
  window.location.href = "books.html";
}

const registerForm = document.getElementById("registerForm");
const errorAlert = document.getElementById("errorAlert");
const submitBtn = document.getElementById("submitBtn");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorAlert.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    password_confirmation: document.getElementById("password_confirmation").value,
  };

  try {
    // Sesuaikan path endpoint register Anda jika berbeda
    await apiFetch("/register", { method: "POST", body: payload });

    // Setelah daftar, langsung login otomatis
    const res = await apiFetch("/login", {
      method: "POST",
      body: { email: payload.email, password: payload.password },
    });

    const token = res.token || res.data?.token || res.access_token;
    setToken(token);

    const userRes = await apiFetch("/user");
    setUser(userRes.data || userRes);

    window.location.href = "books.html";
  } catch (err) {
    if (err.errors) {
      const firstError = Object.values(err.errors)[0];
      errorAlert.textContent = Array.isArray(firstError) ? firstError[0] : err.message;
    } else {
      errorAlert.textContent = err.message || "Pendaftaran gagal.";
    }
    errorAlert.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Daftar";
  }
});
