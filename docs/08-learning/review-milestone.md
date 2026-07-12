# Dokumentasi Pembelajaran (Learning Review) - Sprint 1
**Mentor:** Senior Software Engineer  
**Penerima Mentoring:** Idong (Junior Software Engineer)  
**Bahasa Pengantar:** Bahasa Indonesia  

Dokumen ini adalah ringkasan komprehensif perjalanan pembelajaran kita selama **Sprint 1 (Milestone 1.1 & 1.2)**. Di sini, kita akan membahas semua fitur yang telah kita rancang dari awal, alasan di balik pilihan arsitektur tersebut, daftar istilah teknologi baru beserta penjelasannya, serta studi kasus penggunaannya di industri nyata.

---

## 1. Apa Sering Kita Bangun? (What We Built & What They Are)

Berikut adalah daftar modul dan fitur yang telah kita rancang dan bangun dari awal proyek hingga selesainya pondasi dashboard layout:

### A. Lapisan Dasar & Database (Infrastruktur Prisma & SQLite)
*   **Next.js App Router & TypeScript Strict Mode:**  
    Kita mengonfigurasi Next.js 14 sebagai kerangka kerja utama dengan opsi pengetikan TypeScript yang sangat ketat (`strict: true`) guna menghindari bug *null pointer* atau salah tipe data sebelum aplikasi dideploy.
*   **SQLite & Prisma ORM:**  
    Kita mengintegrasikan SQLite sebagai database lokal yang sangat ringan dan mudah dikelola tanpa perlu menjalankan server database terpisah. Prisma ORM digunakan sebagai penerjemah bahasa pemrograman (TypeScript) ke bahasa database (SQL).
*   **Database Seeder (`prisma/seed.ts`):**  
    Sebuah skrip otomatis untuk mengisi database dengan data awal yang dibutuhkan aplikasi untuk pertama kali berjalan, seperti pembagian Divisi default (`skripsi`, `job`, `skill`, `personal`) dan baris setelan awal `CompanyConfig`.

### B. Lapisan Keamanan & Session (Authentication Foundation)
*   **Timing-Safe Passcode Verifier (`src/lib/auth.ts`):**  
    Sistem verifikasi kata sandi (PIN) sederhana untuk memvalidasi akses administrator tunggal ke sistem IDONG OS. Verifikator ini membandingkan hash SHA-256 kata sandi secara aman dari serangan pembacaan waktu komputasi.
*   **Edge-Compatible Session Encryption (`src/lib/session.ts`):**  
    Sistem pembuatan token session menggunakan algoritme kriptografi **HMAC-SHA256** melalui standard Web Crypto API. Token ini memuat data sesi (payload) yang ditandatangani secara kriptografis sehingga mustahil diubah atau dipalsukan oleh pengguna.
*   **Cookies Wrapper (`src/lib/cookies.ts`):**  
    Kumpulan fungsi pembantu untuk menyimpan, membaca, dan menghapus token sesi ke dalam cookie browser dengan kebijakan keamanan tingkat tinggi.
*   **Edge Middleware (`src/middleware.ts`):**  
    Sistem pencegat rute (*route protector*) yang memeriksa validitas token cookie sesi setiap kali pengguna memanggil halaman internal seperti `/dashboard` atau `/settings`. Jika token tidak valid, pengguna langsung dialihkan ke halaman `/login`.

### C. Kerangka Dashboard (Dashboard Layout & Sidebar)
*   **Page Container (`PageContainer.tsx`) & Main Content (`MainContent.tsx`):**  
    Komponen pembungkus terpisah yang memastikan halaman memiliki tinggi minimal memenuhi layar penuh (`min-h-screen`) dan pembagian padding isi yang rapi.
*   **Sidebar (`Sidebar.tsx`) & Navigation Item (`NavigationItem.tsx`):**  
    Panel navigasi samping kiri selebar **280px** (pada layar desktop) yang menampung enam menu utama. Komponen `NavigationItem` diisolasi agar dapat menampilkan ikon, teks, animasi hover geser, dan status aktif.
*   **Header (`Header.tsx`):**  
    Bar atas lengket (*sticky*) yang memuat salam penyambut hangat ("Hello, Admin"), tampilan tanggal hari ini yang dinamis di sisi klien, kotak pencarian placeholder, tombol notifikasi, dan avatar profil pengguna.
*   **Widget Grid (`WidgetGrid.tsx`) & Widget Card (`WidgetCard.tsx`):**  
    Sistem tata letak grid responsif (1 kolom di HP, 2 kolom di tablet, 3 kolom di komputer desktop) untuk menata kartu-kartu widget agar sejajar secara otomatis. `WidgetCard` membungkus setiap widget dengan desain warna gelap, garis pembatas 1px, dan ikon status.
*   **Mock Widgets (Streak, Contract, Focus, Activity, Job Pipeline):**  
    Representasi visual data yang dihardcode secara statis tanpa memanggil API untuk mensimulasikan kegunaan dashboard sesungguhnya.

---

## 2. Kenapa Dibangun Seperti Itu? (Architectural Decisions)

Dalam dunia rekayasa perangkat lunak, setiap baris kode harus memiliki alasan pemilihan arsitektur yang rasional. Berikut adalah alasan mengapa kita membangun modul-modul di atas dengan cara tertentu:

*   **Penerapan Singleton Pattern pada Prisma Client:**  
    Di Next.js, fitur *Hot Module Replacement (HMR)* akan terus-menerus memuat ulang file kode saat proses pengembangan. Jika kita membuat instance `new PrismaClient()` secara langsung tanpa pola Singleton, setiap perubahan kode akan membuat koneksi database baru ke SQLite. Dalam waktu singkat, hal ini akan menyebabkan SQLite terkunci (*database locked error*). Dengan menyimpan instance pada objek global (`globalThis`), kita menjamin hanya ada **satu koneksi aktif** selama aplikasi berjalan.
*   **Pemilihan Web Crypto API dibandingkan Modul Node.js Crypto Bawaan:**  
    Next.js Middleware berjalan di atas **Edge Runtime** (seperti Cloudflare Workers) yang hanya mendukung API standar peramban (*web standard APIs*). Edge Runtime tidak mendukung modul-modul bawaan Node.js yang sinkron seperti `crypto.pbkdf2Sync` atau `crypto.createCipheriv` karena keterbatasan memori dan kecepatan. Dengan mendesain ulang generator sesi di `session.ts` menggunakan API kriptografi asinkron standar Web Crypto (`crypto.subtle`), kita memastikan sistem sesi berjalan mulus di tingkat CDN/Edge tanpa *runtime crash*.
*   **Pengaturan Cookie yang Super Ketat (`httpOnly: true` & `SameSite=Strict`):**  
    Menyimpan token sesi di penyimpanan lokal biasa seperti `localStorage` sangat berbahaya karena dapat dicuri dengan mudah menggunakan skrip JavaScript jahat (serangan XSS). Dengan mengaktifkan `httpOnly: true`, peramban memblokir akses JavaScript terhadap cookie tersebut. Selain itu, parameter `SameSite=Strict` memastikan peramban tidak akan pernah menyertakan cookie ini pada permintaan yang berasal dari situs luar, sehingga aplikasi kita aman dari pembajakan sesi bermodus CSRF.

---

## 3. Glosarium Istilah Baru & Studi Kasus di Industri (New Words & Real-World Use Cases)

Mari kita pelajari istilah-istilah teknis baru yang kita gunakan sepanjang sprint ini beserta penerapannya di dunia industri nyata:

### 1. **Singleton Pattern**
*   **Penjelasan:** Sebuah pola desain perangkat lunak yang membatasi pembuatan instance dari suatu kelas menjadi hanya satu instance tunggal di seluruh aplikasi.
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Digunakan pada sistem pooling koneksi database (seperti koneksi PostgreSQL di aplikasi e-commerce besar) atau pada sistem pencatat log (*logger*) pusat agar file log tidak ditulis secara bersamaan oleh banyak objek berbeda yang bisa merusak file.

### 2. **Edge Runtime**
*   **Penjelasan:** Lingkungan eksekusi kode server minimalis yang berjalan dekat dengan lokasi geografis pengguna (di server-server CDN terdistribusi di seluruh dunia), alih-alih di satu server pusat.
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Perusahaan seperti Netflix menggunakannya untuk mendeteksi lokasi geografis pengguna secara instan dan mengalihkan pengguna ke server streaming video terdekat sebelum halaman web utama selesai dimuat.

### 3. **Timing Attack (Serangan Pembacaan Waktu)**
*   **Penjelasan:** Metode peretasan di mana penyerang menganalisis waktu yang dibutuhkan oleh server untuk merespons pencocokan string data (seperti password) untuk menebak karakter per karakter.
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Saat memvalidasi kunci lisensi API produk berbayar. Jika kita membandingkan kunci lisensi menggunakan `stringA === stringB`, peretas dapat menebak karakter lisensi dengan mengamati perbedaan waktu respons dalam milidetik. Validasi timing-safe (seperti `crypto.timingSafeEqual`) memaksa proses verifikasi selalu berjalan dalam waktu yang sama persis tidak peduli di karakter keberapa terdapat perbedaan.

### 4. **HMAC (Hash-based Message Authentication Code)**
*   **Penjelasan:** Algoritme penandatanganan pesan kriptografis yang menggabungkan fungsi hash (seperti SHA-256) dengan kunci rahasia (*secret key*) untuk membuktikan bahwa data tidak mengalami modifikasi.
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Digunakan oleh sistem pembayaran seperti Stripe atau Midtrans saat mengirimkan *webhooks* pemberitahuan status transaksi ke server kita. Server kita memverifikasi tanda tangan HMAC tersebut untuk memastikan bahwa data transaksi tersebut benar-benar dikirim dari sistem Stripe/Midtrans asli, bukan dipalsukan oleh peretas.

### 5. **SameSite Cookie Parameter**
*   **Penjelasan:** Atribut keamanan cookie yang mengontrol apakah cookie dikirim bersama dengan permintaan lintas situs (*cross-site requests*).
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Dipakai di portal perbankan online. Ketika nasabah sedang membuka tab bank dan kemudian tidak sengaja mengklik iklan jahat di situs lain yang mencoba mentransfer dana, peramban akan menolak menyertakan cookie login bank karena adanya instruksi `SameSite=Strict`.

### 6. **Idempotency (Idempotensi)**
*   **Penjelasan:** Karakteristik dari suatu operasi yang jika dijalankan berulang kali dengan parameter yang sama akan menghasilkan status akhir sistem yang sama persis tanpa efek samping negatif.
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Sangat krusial pada API transfer bank atau pembayaran digital. Jika koneksi internet pengguna terputus saat mengklik tombol "Bayar" dan pengguna menekan tombol itu berkali-kali, sistem pembayaran yang menggunakan token idempotensi hanya akan memotong saldo pengguna satu kali saja.

### 7. **Server Actions**
*   **Penjelasan:** Fitur Next.js yang memungkinkan kita menulis fungsi sisi server (seperti kueri database langsung) yang dapat dipanggil langsung dari komponen sisi klien seperti memanggil fungsi JavaScript biasa tanpa menulis endpoint REST API manual.
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Digunakan saat membuat formulir kontak cepat atau formulir pendaftaran buletin berita di halaman arahan produk. Pengembang tidak perlu lagi membuat router API baru, cukup panggil fungsi server action langsung dari aksi klik tombol formulir.

### 8. **Decoupled Architecture (Arsitektur Terdekopel)**
*   **Penjelasan:** Pendekatan desain sistem yang memisahkan modul-modul kode agar tidak saling bergantung secara ketat satu sama lain (misalnya memisahkan tampilan UI layout dari logika database).
*   **Kasus Penggunaan Nyata (Real-World Use Case):** Memungkinkan tim desainer frontend memperbarui gaya visual tombol-tombol pada antarmuka pengguna tanpa khawatir merusak kode kueri SQL di backend, mempercepat kolaborasi di perusahaan rintisan (*startup*).

---

## 4. Pelajaran Berharga bagi Idong
Dengan menyelesaikan Sprint 1 ini, kamu kini sudah memahami alur pengembangan web modern dari tingkat sistem operasi (homelab server), konfigurasi database terstruktur, sistem keamanan pertahanan berlapis, hingga seni mendesain tata letak antarmuka pengguna yang responsif. Pertahankan kualitas penulisan kodemu yang bersih ini, Dong! Sampai jumpa di review Sprint berikutnya.
