# Sprint 1 Review: Fondasi Proyek, Database, & Autentikasi
**Peran Mentor:** Senior Software Engineer  
**Penerima Mentoring:** Idong (Junior Software Engineer)  
**Bahasa:** Bahasa Indonesia  

Halo Dong! Kerja bagus minggu ini. Kita sudah berhasil menyelesaikan **Sprint 1 (Milestone 1.1 & 1.2)** dengan sangat baik. Semua fondasi infrastruktur sekarang sudah siap, aman, dan bisa dideploy di homelab kamu.

Mari kita bahas apa saja yang sudah kita buat secara mendalam agar kamu bisa mempelajarinya untuk jangka panjang.

---

## 1. Apa yang Kita Bangun?
Sepanjang Sprint 1, kita berfokus membangun **pondasi arsitektur, lapisan data, dan sistem keamanan**:

1.  **Pondasi Aplikasi (Scaffolding):**
    *   Setup Next.js 14 (App Router) menggunakan TypeScript ketat (`strict: true`, `noImplicitAny: true`).
    *   Integrasi Tailwind CSS v3 untuk visual kustom bergaya gelap minimalis (Linear/Notion-like).
2.  **Lapisan Data & Infrastruktur Database:**
    *   Setup database menggunakan SQLite dan **Prisma ORM (v6)**.
    *   Desain Singleton Prisma Client (`src/lib/db.ts`) untuk mencegah kebocoran koneksi.
    *   Skrip database seeder (`prisma/seed.ts`) untuk menyuntikkan data default `CompanyConfig` dan 4 `Division` (Skripsi, Job, Skill, Personal).
    *   Migrasi database otomatis (`prisma migrate dev`) untuk menambahkan kolom konfigurasi `AppConfig` ke tabel `CompanyConfig`.
3.  **Sistem Keamanan & Autentikasi:**
    *   Autentikasi berbasis PIN satu user dengan validasi hash SHA-256 timing-safe (`src/lib/auth.ts`).
    *   Session Manager berbasis **Web Crypto API HMAC-SHA256** (`src/lib/session.ts`) yang menghasilkan token tamper-proof dan aman dieksekusi di Edge Runtime.
    *   Next.js **Edge Middleware** (`src/middleware.ts`) untuk memproteksi rute `/dashboard` dan `/settings` dengan otomatis me-redirect user tidak dikenal ke `/login`.
    *   Halaman **Login Page** (`/login`) dengan Server Actions (`handleLogin`) dan **Settings Page** (`/settings`) yang memproses setelan tema, layout kolom, timezone, serta jam pengingat standup harian.

---

## 2. Kenapa Dibangun Seperti Itu?
Setiap keputusan desain arsitektur yang kita ambil memiliki alasan teknis yang kuat:

*   **Prisma Client Singleton di `src/lib/db.ts`:**
    Next.js memiliki fitur *Hot Module Replacement (HMR)* saat development. Setiap kali kamu mengubah kode, Next.js akan me-reload modul. Jika kita tidak menaruh instance `PrismaClient` di objek global (`globalThis`), setiap reload akan membuka koneksi baru ke SQLite, mengakibatkan database terkunci (*database locked*) dalam waktu singkat.
*   **Web Crypto API (HMAC-SHA256) untuk Session:**
    Next.js Middleware berjalan di **Edge Runtime** (bukan Node.js standar) agar memiliki performa super cepat dekat dengan user. Namun, Edge Runtime tidak mendukung modul bawaan Node.js yang sinkron seperti `crypto.pbkdf2Sync` atau `crypto.createDecipheriv`. Oleh karena itu, kita mendesain enkripsi session secara asinkron menggunakan Web Crypto API global (`crypto.subtle`) agar bisa dieksekusi lancar di Edge Middleware tanpa *runtime crash*.
*   **Keamanan Cookie HTTP-Only & SameSite=Strict:**
    Token session disimpan di browser dengan konfigurasi `httpOnly: true` (mencegah script malicious mencuri token lewat XSS) dan `sameSite: "strict"` (mencegah browser mengirim cookie saat ada link rujukan dari luar, memitigasi serangan CSRF).
*   **Database Upsert dalam Seeder:**
    Menggunakan `upsert` (update jika ada, create jika tidak ada) memastikan skrip seeder kita bersifat *idempotent* — bisa dijalankan berulang-ulang tanpa takut duplikasi data atau error.

---

## 3. Alternatifnya Apa?
Sebagai engineer, kita harus selalu membandingkan opsi-opsi teknologi yang tersedia:

| Fitur | Pendekatan Kita | Alternatif | Kenapa Kita Memilih Pendekatan Kita? |
|---|---|---|---|
| **Database** | **SQLite** | PostgreSQL | Karena ini aplikasi single-user yang di-host di server RAM terbatas (Dell T40), SQLite menghemat memori (<10MB RAM) sedangkan Postgres butuh background service yang memakan RAM $\ge 100\text{MB}$. |
| **Session** | **Custom Web Crypto (HMAC)** | JWT via `jose` atau `jsonwebtoken` | Menulis custom signer menggunakan Web Crypto API asli menjaga aplikasi tetap ringan tanpa tambahan dependensi pihak ketiga, sekaligus 100% kompatibel dengan Edge Runtime. |
| **Auth** | **Static Passcode PIN** | NextAuth / Auth0 | Aplikasi ini khusus untuk satu orang (Idong). Memasang NextAuth atau mengintegrasikan OAuth Google terlalu kompleks (*over-engineering*) untuk dashboard internal homelab. |

---

## 4. Apa yang Dipelajari?
Dari sprint ini, kamu belajar beberapa konsep krusial:

1.  **Siklus Hidup Next.js App Router:** Bagaimana halaman Server Component (`page.tsx`) mengambil data secara aman langsung dari database, lalu menyuapnya ke Client Component (`SettingsForm.tsx`) untuk interaksi UI.
2.  **Pentingnya Edge vs Node Runtime:** Batasan-batasan Edge Runtime di Next.js Middleware dan cara menulis kode JavaScript universal yang berjalan di lingkungan server Node.js maupun Edge.
3.  **Timing-Attack Mitigation:** Memahami bahwa perbandingan string biasa (`a === b`) berhenti membandingkan karakter saat menemukan perbedaan pertama, sehingga rentan diretas hacker menggunakan taktik waktu respons (*timing attack*). Kita mengatasinya dengan `crypto.timingSafeEqual` yang selalu memeriksa seluruh panjang buffer.

---

## 5. Apa Istilah Baru Minggu Ini?
Berikut adalah glosarium teknologi yang kita pakai minggu ini:
*   **Singleton Pattern:** Pola desain software yang memastikan sebuah class hanya memiliki satu instance dan menyediakan titik akses global untuk itu (dalam kasus kita: `PrismaClient`).
*   **Edge Runtime:** Lingkungan eksekusi Next.js berbasis V8 engine yang minimalis dan super cepat, biasanya dipakai untuk menjalankan Middleware dekat dengan jaringan CDN.
*   **AEAD (Authenticated Encryption with Associated Data):** Jenis enkripsi yang menjamin kerahasiaan data sekaligus keasliannya (dalam HMAC/GCM session).
*   **Idempotency:** Sifat dari beberapa operasi yang jika dijalankan berkali-kali akan memberikan hasil akhir yang tetap sama (seperti skrip seeder kita).
*   **Timing Attack:** Serangan sampingan (*side-channel attack*) di mana penyerang menebak PIN/password dengan cara mengukur berapa lama server memproses pencocokan string.

---

## 6. Apa yang Sering Dipakai di Industri?
Pola-pola yang kita terapkan di IDONG OS adalah pola standar yang biasa dipakai di tim software profesional:

*   **ORM Migrations:** Di industri, mengubah struktur database secara manual di server produksi dilarang keras. Penggunaan migrasi SQL terstruktur (`prisma migrate`) yang di-track di Git adalah wajib hukumnya agar deploy otomatis berjalan lancar.
*   **Repository Pattern:** Memisahkan logika kueri database ke dalam class repository khusus (`AppConfigRepository.ts`) sangat sering dipakai agar kode bisnis utama tidak kotor oleh kode kueri ORM, memudahkan unit testing dengan *mock repository*.
*   **Zero-Trust Networking via VPN:** Industri modern mulai meninggalkan metode buka-port router publik (*port forwarding*) demi keamanan. Layanan seperti Tailscale (berbasis WireGuard) umum dipakai oleh tim DevOps untuk akses VPN internal perusahaan (*Internal Admin Portal*).
