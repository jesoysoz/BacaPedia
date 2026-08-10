# BacaPedia Frontend (HTML/CSS/JS sederhana)

Frontend ini murni HTML, CSS, dan JavaScript biasa (tanpa framework/build tool), yang berkomunikasi langsung dengan API Laravel BacaPedia Anda.

## Struktur File

```
frontend/
├── index.html          → Halaman login
├── register.html        → Halaman daftar akun
├── books.html           → Daftar buku (pinjam untuk anggota, CRUD untuk admin/petugas)
├── loans.html            → Riwayat/daftar peminjaman + tombol kembalikan
├── categories.html      → CRUD kategori (khusus admin/petugas)
├── css/style.css        → Semua styling
├── js/api.js             → Helper koneksi ke API (base URL, token, fetch wrapper)
├── js/navbar.js          → Navbar dinamis sesuai role
├── js/login.js
├── js/register.js
├── js/books.js
├── js/loans.js
└── js/categories.js
```

## 1. Sesuaikan Alamat API

Buka `js/api.js`, baris paling atas:
```js
const API_BASE_URL = "http://localhost:8000/api";
```
Sesuaikan dengan alamat Laravel Anda kalau berbeda.

## 2. Setting CORS di Laravel (WAJIB)

Karena frontend ini dijalankan dari origin/port yang berbeda dari Laravel, backend perlu mengizinkan request lintas origin. Buka `config/cors.php` di project Laravel Anda, pastikan:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'], // atau spesifik: ['http://127.0.0.1:5500']
'allowed_headers' => ['*'],
```

Lalu jalankan:
```bash
php artisan config:clear
```

## 3. Jalankan Frontend

Karena pakai `fetch()`, file **tidak bisa dibuka langsung lewat double-click** (protokol `file://` akan diblokir CORS). Jalankan lewat local server, contoh:

**Opsi A — pakai PHP built-in server** (dari dalam folder `frontend/`):
```bash
php -S localhost:5500
```
Lalu buka `http://localhost:5500` di browser.

**Opsi B — pakai ekstensi "Live Server" di VS Code**
Klik kanan `index.html` → "Open with Live Server".

## 4. Pastikan Laravel Server Juga Jalan

```bash
php artisan serve
```
(berjalan di `http://localhost:8000` sesuai `API_BASE_URL`)

## Catatan

- Nama field dari API (`judul`, `stok`, `nama_kategori`, dll) mengikuti struktur database BacaPedia Anda. Kalau ada nama kolom yang beda, sesuaikan di file JS terkait (`books.js`, `categories.js`).
- Endpoint login/register saya asumsikan `/api/login` dan `/api/register` mengembalikan field `token`. Kalau nama field response Anda berbeda, sesuaikan di `js/login.js` dan `js/register.js`.
- Session/token disimpan di `localStorage` browser — cukup untuk kebutuhan tugas/deadline, tapi untuk aplikasi produksi sebaiknya dipertimbangkan opsi yang lebih aman (httpOnly cookie, dll).
