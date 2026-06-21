# Zizaissance Akademik

Aplikasi web untuk mengelola data mahasiswa, dibuat untuk memenuhi tugas mata kuliah Algoritma dan Pemrograman II.

## Identitas Mahasiswa

- Nama: Auliyah Nurul Azizah
- NIM: 241011450263
- Kelas: 03TPLE002
- Mata Kuliah: Algoritma dan Pemrograman II

## Demo Live

- Frontend (Vercel): _https://zizaissance-akademik.vercel.app/_
- Backend API (Railway): _https://zizaissance-akademik-production.up.railway.app/_

Login default: `admin` / `admin123` (atau daftar akun baru lewat halaman registrasi)

## Tentang Project

Zizaissance Akademik adalah sistem CRUD data mahasiswa lengkap dengan pencarian dan pengurutan, dibungkus dengan tampilan yang memiliki sentuhan bertema sakura dan matcha. Selain jadi tugas kuliah, project ini juga jadi tempat latihan membangun full-stack app dari nol, mulai dari auth dengan OTP email, sampai deploy ke production.

## Fitur Utama

- Login, registrasi dengan verifikasi OTP via email, dan reset kata sandi
- CRUD data mahasiswa (tambah, lihat, edit, hapus)
- Pencarian dengan algoritma yang dipilih otomatis sesuai pola input
- Pengurutan data dengan pilihan 5 algoritma berbeda
- Dashboard statistik (total mahasiswa, status aktif/lulus, rata-rata IPK, distribusi per jurusan)
- Export data ke CSV dan JSON
- Tabel dengan sorting per kolom langsung di halaman Data Mahasiswa

## Implementasi Algoritma

### Pencarian (Searching)

Ada tiga algoritma pencarian yang dipakai, dan sistem otomatis pilih salah satunya tergantung apa yang diketik user di kolom pencarian.

Binary Search (O(log n)) dipakai kalau input berupa angka 10 digit (cocok untuk NIM lengkap). Data diurutkan dulu berdasarkan NIM, lalu dicari dengan membagi array jadi dua terus-menerus.

Linear Search (O(n)) dipakai untuk input NIM sebagian atau teks (nama/jurusan). Scan satu per satu dari awal array, mendukung partial match.

Sequential Search (O(n × k)) dipakai kalau input mengandung "@" (terdeteksi sebagai email). Scan berurutan yang mengecek beberapa field sekaligus: NIM, nama, jurusan, dan email.

Jumlah langkah komputasi (steps) dan kompleksitas waktu aktual bisa dilihat lewat toggle "Info Algoritma" di halaman Pencarian.

### Pengurutan (Sorting)

Lima pilihan algoritma sorting tersedia di halaman Pengurutan, masing-masing dengan kompleksitas waktu yang berbeda:

- Bubble Sort (O(n²)): bandingkan elemen berdekatan berulang kali, tukar kalau salah urutan
- Selection Sort (O(n²)): cari elemen minimum tiap iterasi, taruh di depan
- Insertion Sort (O(n²) worst case, O(n) best case): sisipkan tiap elemen ke posisi yang tepat di bagian array yang sudah terurut
- Merge Sort (O(n log n)): divide and conquer, stabil untuk data besar
- Shell Sort (O(n log² n)): variasi Insertion Sort dengan gap yang mengecil bertahap

Tabel Data Mahasiswa juga punya sorting per kolom (client-side) buat navigasi data yang lebih cepat.

## Tech Stack

Frontend
- React 19 + TypeScript
- Vite
- CSS

Backend
- Node.js + Express 5
- TypeScript
- JSON file-based storage (tanpa database eksternal)
- Brevo API (pengiriman OTP via email, lewat REST API bukan SMTP)
- JSON Web Token (JWT) untuk autentikasi
- bcryptjs untuk hashing kata sandi

Deployment
- Frontend: Vercel
- Backend: Railway

## Struktur Project

Monorepo dengan backend dan frontend terpisah:

```
manajemen-mahasiswa/
├── backend/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── search/        # Linear, Binary, Sequential Search
│   │   │   └── sort/          # Bubble, Selection, Insertion, Merge, Shell Sort
│   │   ├── controllers/       # MahasiswaController
│   │   ├── exceptions/        # Custom error classes
│   │   ├── middleware/        # authMiddleware (verifikasi JWT)
│   │   ├── models/            # Mahasiswa, MahasiswaAktif, MahasiswaLulus (OOP + inheritance)
│   │   ├── routes/            # auth.routes, mahasiswa.routes
│   │   ├── services/          # AuthService, MahasiswaService, FileIOService
│   │   └── app.ts
│   ├── data/                  # Penyimpanan data JSON (di-ignore dari git)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Seluruh komponen utama (Login, Dashboard)
│   │   ├── App.css
│   │   └── main.tsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## Cara Jalankan di Lokal

### Yang dibutuhkan

- Node.js v18+
- npm
- Akun Brevo dengan API key aktif (buat fitur OTP email), daftar gratis di brevo.com, lalu verifikasi alamat pengirim di menu Senders

### Backend

```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend` dengan isi:

```
PORT=3001
JWT_SECRET=isi_dengan_secret_key_acak
JWT_EXPIRES_IN=24h
RESET_TOKEN_EXPIRES=15

BREVO_API_KEY=xkeysib_api_key_dari_brevo
EMAIL_FROM_ADDRESS=email_pengirim_yang_sudah_diverifikasi@gmail.com
```

Jalankan server development:

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
```

Buat file `.env` di dalam folder `frontend` dengan isi:

```
VITE_API_URL=http://localhost:3001/api/v1
```

Jalankan server development:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

### Login Default

```
Username: admin
Password: admin123
```

Catatan: karena pengiriman email lewat Brevo memakai alamat pengirim dari domain publik (Gmail), beberapa penyedia email bisa menandainya sebagai mencurigakan dan menaruh OTP di folder Spam/Junk, bukan inbox utama. Cek folder Spam dulu kalau OTP tidak kunjung muncul. Untuk produksi yang lebih serius, idealnya pakai domain sendiri yang sudah diverifikasi (DKIM/SPF) di Brevo supaya deliverability-nya lebih baik.

## Build untuk Production

Backend
```bash
cd backend
npm run build
npm start
```

Frontend
```bash
cd frontend
npm run build
```
