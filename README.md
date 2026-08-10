# BacaPedia - Backend API

Backend API untuk aplikasi **BacaPedia**, yaitu sistem manajemen perpustakaan yang menyediakan fitur autentikasi pengguna, pengelolaan kategori dan buku, serta sistem peminjaman dan pengembalian buku.

## Teknologi

- PHP 8.2+
- Laravel 12
- Laravel Sanctum 4
- MySQL
- Composer
- Postman untuk pengujian API

## Fitur

- Register dan login pengguna
- Authentication menggunakan Laravel Sanctum
- Role-based authorization
  - `admin`
  - `petugas`
  - `anggota`
- Pengelolaan user oleh admin
- CRUD kategori buku
- CRUD buku
- Validasi data buku
- Peminjaman buku
- Pembatasan maksimal 3 buku yang sedang dipinjam oleh satu anggota
- Pengembalian buku
- Pengurangan stok saat buku dipinjam
- Penambahan stok saat buku dikembalikan
- Perhitungan denda keterlambatan otomatis
- Pembatasan akses data peminjaman berdasarkan role
- Penampilan jumlah buku berdasarkan kategori
- Pembatasan fitur berdasarkan role pengguna

## Persyaratan Sistem

Pastikan perangkat sudah memiliki:

- PHP >= 8.2
- Composer
- MySQL
- Git

## Instalasi

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY>