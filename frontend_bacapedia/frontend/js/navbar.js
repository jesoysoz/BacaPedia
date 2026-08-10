// ==========================================================
// navbar.js — Render navbar sesuai role user yang sedang login
// ==========================================================

function renderNavbar(activePage) {
    const el = document.getElementById("navbar");
    if (!el) return;

    const user = getUser();
    if (!user) return;

    const isAdmin = user.role === "admin";
    const isStaff = user.role === "admin" || user.role === "petugas";

    const links = [
        {
            href: "books.html",
            label: "Buku",
            key: "books"
        },
        {
            href: "loans.html",
            label: "Peminjaman",
            key: "loans"
        },
    ];

    // Admin dan petugas dapat mengakses kategori
    if (isStaff) {
        links.push({
            href: "categories.html",
            label: "Kategori",
            key: "categories"
        });
    }

    // Hanya admin yang dapat mengakses User
    if (isAdmin) {
        links.push({
            href: "users.html",
            label: "User",
            key: "users"
        });
    }

    const linksHtml = links
        .map(
            (l) =>
                `<a href="${l.href}" class="${
                    l.key === activePage ? "active" : ""
                }">${l.label}</a>`
        )
        .join("");

    el.innerHTML = `
        <a class="brand" href="books.html">📚 BacaPedia</a>

        <nav>
            ${linksHtml}
        </nav>

        <div class="user-info">
            <span>${user.name}</span>
            <span class="role-badge">${user.role}</span>
            <button class="btn-logout" onclick="logout()">Keluar</button>
        </div>
    `;
}