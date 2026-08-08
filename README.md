# BacaPedia - Backend API

Backend API untuk aplikasi **BacaPedia**, yaitu sistem manajemen perpustakaan yang menyediakan fitur autentikasi pengguna, pengelolaan kategori dan buku, serta sistem peminjaman dan pengembalian buku.

## Teknologi

* PHP 8.2+
* Laravel 12
* Laravel Sanctum 4
* MySQL
* Composer
* Postman untuk pengujian API

## Fitur

* Register dan login pengguna
* Authentication menggunakan Laravel Sanctum
* Role-based authorization

  * `admin`
  * `petugas`
  * `anggota`
* CRUD kategori buku
* CRUD buku
* Validasi data buku
* Peminjaman buku
* Pengembalian buku
* Pengurangan stok saat buku dipinjam
* Penambahan stok saat buku dikembalikan
* Perhitungan denda keterlambatan otomatis
* Pembatasan akses data peminjaman berdasarkan role

## Persyaratan Sistem

Pastikan perangkat sudah memiliki:

* PHP >= 8.2
* Composer
* MySQL
* Git

## Instalasi

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY>
```

Masuk ke folder project:

```bash
cd BacaPedia
```

### 2. Install Dependency

```bash
composer install
```

### 3. Konfigurasi Environment

Buat file `.env` dari `.env.example`:

```bash
copy .env.example .env
```

Untuk Linux/macOS:

```bash
cp .env.example .env
```

Kemudian generate application key:

```bash
php artisan key:generate
```

### 4. Konfigurasi Database

Buat database baru di MySQL, kemudian sesuaikan konfigurasi database pada file `.env`.

Contoh:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bacapedia
DB_USERNAME=root
DB_PASSWORD=
```

Sesuaikan `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` dengan konfigurasi MySQL pada perangkat masing-masing.

### 5. Jalankan Migration

```bash
php artisan migrate
```

Migration akan membuat tabel yang dibutuhkan oleh sistem, termasuk:

* users
* categories
* books
* loans
* personal_access_tokens

### 6. Jalankan Server

```bash
php artisan serve
```

Secara default API dapat diakses melalui:

```text
http://localhost:8000
```

Endpoint API menggunakan prefix:

```text
http://localhost:8000/api
```

## Authentication

BacaPedia menggunakan **Laravel Sanctum** untuk authentication berbasis Bearer Token.

Setelah berhasil login, API akan memberikan token.

Gunakan token tersebut pada Postman:

```text
Authorization
Type: Bearer Token
Token: <token>
```

Endpoint yang membutuhkan authentication harus menggunakan Bearer Token.

## Role Pengguna

| Role      | Keterangan                                                          |
| --------- | ------------------------------------------------------------------- |
| `admin`   | Memiliki akses penuh terhadap pengelolaan kategori dan buku         |
| `petugas` | Dapat menambahkan dan mengubah data buku                            |
| `anggota` | Dapat melihat buku dan melakukan peminjaman serta pengembalian buku |

Role default pengguna baru adalah:

```text
anggota
```

## Daftar Endpoint API

### Authentication

| Method | Endpoint        | Keterangan                              | Auth  |
| ------ | --------------- | --------------------------------------- | ----- |
| POST   | `/api/register` | Registrasi pengguna                     | Tidak |
| POST   | `/api/login`    | Login pengguna                          | Tidak |
| POST   | `/api/logout`   | Logout pengguna                         | Ya    |
| GET    | `/api/user`     | Mendapatkan data user yang sedang login | Ya    |

### Categories

| Method | Endpoint                     | Keterangan                  | Role             |
| ------ | ---------------------------- | --------------------------- | ---------------- |
| GET    | `/api/categories`            | Menampilkan semua kategori  | Semua user login |
| GET    | `/api/categories/{category}` | Menampilkan detail kategori | Semua user login |
| POST   | `/api/categories`            | Menambahkan kategori        | Admin            |
| PUT    | `/api/categories/{category}` | Mengubah kategori           | Admin            |
| DELETE | `/api/categories/{category}` | Menghapus kategori          | Admin            |

### Books

| Method | Endpoint            | Keterangan              | Role             |
| ------ | ------------------- | ----------------------- | ---------------- |
| GET    | `/api/books`        | Menampilkan semua buku  | Semua user login |
| GET    | `/api/books/{book}` | Menampilkan detail buku | Semua user login |
| POST   | `/api/books`        | Menambahkan buku        | Admin, Petugas   |
| PUT    | `/api/books/{book}` | Mengubah data buku      | Admin, Petugas   |
| DELETE | `/api/books/{book}` | Menghapus buku          | Admin            |

### Loans

| Method | Endpoint                   | Keterangan                    | Auth |
| ------ | -------------------------- | ----------------------------- | ---- |
| GET    | `/api/loans`               | Menampilkan data peminjaman   | Ya   |
| POST   | `/api/loans`               | Membuat peminjaman            | Ya   |
| GET    | `/api/loans/{loan}`        | Menampilkan detail peminjaman | Ya   |
| PUT    | `/api/loans/{loan}/return` | Mengembalikan buku            | Ya   |

## Validasi Buku

Data buku yang ditambahkan harus memenuhi validasi:

* `judul` wajib diisi
* `penulis` wajib diisi
* `penerbit` wajib diisi
* `category_id` wajib diisi dan harus terdaftar
* `stok` wajib berupa integer dan minimal `0`
* `tahun_terbit` wajib berupa 4 digit
* Tahun terbit minimal 1900
* Tahun terbit tidak boleh melebihi tahun sekarang

Jika validasi gagal, API mengembalikan HTTP status:

```text
422 Unprocessable Content
```

## Sistem Peminjaman

Saat pengguna melakukan peminjaman:

1. Sistem memeriksa ketersediaan stok buku.
2. Jika stok habis, peminjaman ditolak.
3. Jika stok tersedia, data peminjaman dibuat.
4. Stok buku dikurangi sebanyak 1.
5. Lama masa peminjaman adalah 7 hari.
6. Status awal peminjaman adalah `dipinjam`.

Contoh request:

```json
{
    "buku_id": 1
}
```

## Sistem Pengembalian dan Denda

Saat buku dikembalikan:

1. Status peminjaman berubah menjadi `dikembalikan`.
2. Tanggal pengembalian dicatat.
3. Stok buku bertambah 1.
4. Sistem mengecek apakah pengembalian melewati tanggal jatuh tempo.
5. Jika terlambat, sistem menghitung denda otomatis.

Besarnya denda:

```text
Rp2.000 × jumlah hari keterlambatan
```

Contoh:

| Keterlambatan |   Denda |
| ------------: | ------: |
|        0 hari |     Rp0 |
|        1 hari | Rp2.000 |
|        2 hari | Rp4.000 |
|        3 hari | Rp6.000 |

## Contoh Request Login

```http
POST /api/login
```

Request body:

```json
{
    "email": "petugas1@gmail.com",
    "password": "password"
}
```

Contoh response:

```json
{
    "message": "Login Berhasil!",
    "user": {
        "id": 4,
        "name": "petugas1",
        "email": "petugas1@gmail.com",
        "role": "petugas"
    },
    "token": "<token>"
}
```

Token tersebut digunakan sebagai Bearer Token untuk endpoint yang membutuhkan authentication.

## Contoh Request Menambahkan Buku

```http
POST /api/books
```

Request body:

```json
{
    "judul": "Grandmaster of Demonic Cultivation",
    "penulis": "Mo Xiang Tong Xiu",
    "penerbit": "Jinjiang Literature",
    "category_id": 1,
    "stok": 5,
    "tahun_terbit": 2016
}
```

## Contoh Request Peminjaman

```http
POST /api/loans
```

Request body:

```json
{
    "buku_id": 1
}
```

## Contoh Request Pengembalian

```http
PUT /api/loans/{loan}/return
```

Tidak membutuhkan request body.

Sistem akan otomatis menentukan tanggal pengembalian dan menghitung denda apabila terdapat keterlambatan.

## Testing API

API dapat diuji menggunakan **Postman**.

Pastikan:

1. Jalankan Laravel menggunakan `php artisan serve`.
2. Gunakan URL `http://localhost:8000`.
3. Login untuk mendapatkan Bearer Token.
4. Masukkan token pada menu **Authorization → Bearer Token**.
5. Kirim request sesuai endpoint yang ingin diuji.

## Struktur Database

Sistem menggunakan beberapa tabel utama:

* `users`
* `categories`
* `books`
* `loans`
* `personal_access_tokens`

Dokumen ERD dan rancangan skema tabel disertakan secara terpisah dalam submission project.

## Source Code

Source code backend lengkap tersedia pada repository project BacaPedia.

## Catatan

File `.env` tidak disertakan dalam repository karena berisi konfigurasi environment lokal. Gunakan `.env.example` sebagai template konfigurasi.
