# 📚 BUKU PANDUAN SISTEM: LibraryRank
> **Kategori Dokumen:** Panduan Teknis & Operasional Produk (System Manual)  
> **Versi:** 1.0.0 (Production Release)  
> **Penyusun:** Senior System Designer & Gamification Engineer  
> **Tanggal Pembaruan:** 13 Juli 2026

---

## 1. PENDAHULUAN & OVERVIEW PROYEK

### 1.1 Deskripsi Produk
**LibraryRank** adalah aplikasi dasbor analitik dan papan peringkat (*leaderboard*) berbasis gamifikasi yang dirancang untuk meningkatkan interaksi, retensi, dan aktivitas kunjungan serta peminjaman buku oleh pemustaka (Mahasiswa, Dosen, dan Tenaga Kependidikan/Tendik) di Perpustakaan Universitas. 

Sistem ini dirancang untuk bekerja secara **Zero-Touch** berdampingan dengan sistem otomasi perpustakaan **Koha ILS (Integrated Library System)**. LibraryRank menyerap data log transaksi sirkulasi dan log mesin scanner gerbang masuk secara pasif tanpa mengubah sedikit pun struktur database inti Koha.

### 1.2 Tujuan Produk Dibuat
*   **Meningkatkan Literasi & Aktivitas:** Memotivasi mahasiswa dan civitas akademika untuk lebih aktif berkunjung ke perpustakaan dan meminjam koleksi fisik.
*   **Gamifikasi Pengalaman Perpustakaan:** Mengubah rutinitas membaca yang konvensional menjadi kompetisi bersahabat melalui pemberian skor XP (*Experience Points*), pencapaian level (*Leveling*), penganugerahan lencana prestasi (*Badges*), dan penukaran hadiah (*Rewards*).
*   **Dasbor Analitik bagi Pustakawan:** Menyediakan data analitik real-time mengenai fakultas teraktif, buku terpopuler, dan pola kunjungan harian sebagai bahan evaluasi manajemen perpustakaan.

### 1.3 Arsitektur Integrasi Sistem
Sistem ini menggunakan Django sebagai backend pengendali utama yang terhubung secara paralel ke **tiga database berbeda**:
1.  **Database `libraryrank` (Write/Read):** Database lokal aplikasi untuk menyimpan aturan gamifikasi, kupon penukaran merchandise, kunci API, data seminar, dan log sistem.
2.  **Database `koha` (Read-Only):** Database utama Koha ILS untuk memantau data peminjaman buku (*issues*), pengembalian, dan statistik keanggotaan (*borrowers*).
3.  **Database `koha_satellite` (Read-Only):** Database pencatat log pintu gerbang masuk (*visitorhistory*) untuk menghitung aktivitas kunjungan fisik harian secara presisi.

```text
  [ PENGGUNA BROWSER ] ──── Minta Halaman / Filter Periode
          │
          ▼
  [ DJANGO WEB APPLICATION ]
          │
          ├────► [ DB 'libraryrank' (Lokal) ] ─ Aturan Poin, Badge, Kupon, API Keys, Seminar
          │
          ├────► [ DB 'koha' (Read-Only) ] ──── Data Anggota, Buku & Sirkulasi Peminjaman
          │
          └────► [ DB 'satellite' (Read-Only) ]─ Data Scan Gerbang Masuk (Visitor History)
```

---

## 2. DAFTAR ISI (TABLE OF CONTENTS)
1.  **Pendahuluan & Overview Proyek**
    *   1.1 Deskripsi Produk
    *   1.2 Tujuan Produk Dibuat
    *   1.3 Arsitektur Integrasi Sistem
2.  **Daftar Isi (Table of Contents)**
3.  **Fitur-Fitur Utama & Mekanisme Gamifikasi**
    *   3.1 Papan Peringkat Interaktif (Leaderboard)
    *   3.2 Kartu Profil Prestasi & Riwayat Peminjaman (User Modal)
    *   3.3 Sistem Poin XP (Experience Points) & Level
    *   3.4 Sistem Lencana Otomatis (Badges Engine)
    *   3.5 Penukaran Hadiah (Redemption System) dengan OTP
    *   3.6 Modul Event/Seminar Perpustakaan
    *   3.7 Generator Instagram Story & Berbagi Sosial
    *   3.8 Ekspor Laporan Excel & PDF
4.  **Panduan Penggunaan bagi Pengguna Umum (Pemustaka)**
    *   4.1 Cara Mengakses & Membaca Leaderboard
    *   4.2 Cara Melihat Detail Profil & Lencana
    *   4.3 Cara Melakukan Klaim/Penukaran Merchandise
    *   4.4 Cara Mendaftar dan Mengklaim Poin Seminar
    *   4.5 Cara Membagikan Prestasi ke Media Sosial
5.  **Panduan Operasional bagi Administrator & Pustakawan**
    *   5.1 Akses Dasbor Django Admin
    *   5.2 Konfigurasi Aturan Main (XP & Level)
    *   5.3 Manajemen Katalog & Stok Merchandise
    *   5.4 Validasi dan Eksekusi Klaim Hadiah Mahasiswa
    *   5.5 Pengelolaan Seminar (Input Manual & Unggah CSV Kehadiran)
    *   5.6 Pengaturan Siklus Musim (Reset Klasemen)
    *   5.7 Integrasi API & Keamanan
6.  **Spesifikasi Teknis & Pemecahan Masalah (Troubleshooting)**

---

## 3. FITUR-FITUR UTAMA & MEKANISME GAMIFIKASI

### 3.1 Papan Peringkat Interaktif (Leaderboard)
Leaderboard menyajikan data secara dinamis berdasarkan kalkulasi aktivitas pemustaka di perpustakaan.
*   **Tab Kategori:** Pemisahan pemustaka ke dalam tab *Overview* (Nominasi teratas semua kategori), *Mahasiswa*, *Dosen*, dan *Tendik* (Staf).
*   **Visualisasi Prestasi:** Pemustaka yang menempati peringkat **Top 1, Top 2, dan Top 3** mendapatkan sorotan border menyala khusus (*Gold/Silver/Bronze Glow*) serta simbol api menyala (🔥) di samping baris peringkat mereka untuk memberikan kesan eksklusif.

### 3.2 Kartu Profil Prestasi & Riwayat Peminjaman (User Modal)
Mengklik baris nama pemustaka di leaderboard akan menampilkan kartu profil digital dalam bentuk popup modal:
*   **Detail Akademis:** Menampilkan inisial nama, NIM/ID Anggota, nama lengkap, fakultas, dan tahun angkatan.
*   **Metrik Kunjungan:** Menampilkan akumulasi poin XP, jumlah total hari berturut-turut mengunjungi perpustakaan (*Day Streak*), serta total buku yang dipinjam.
*   **Buku yang Dipinjam Terakhir:** Menampilkan 5 judul buku terakhir yang dipinjam beserta statusnya (*Borrowed* - sedang dipinjam, *Returned* - dikembalikan, *Overdue* - terlambat mengembalikan).

### 3.3 Sistem Poin XP (Experience Points) & Level
Poin XP diperoleh dari aktivitas fisik maupun transaksi sirkulasi di perpustakaan secara otomatis:
*   **Kunjungan Fisik (Gate Scan):** Nilai poin dihitung berdasarkan kebijakan poin aktif (Contoh: `1 Kunjungan = 2 XP`).
*   **Peminjaman Buku:** Nilai poin dihitung berdasarkan buku yang dipinjam (Contoh: `1 Peminjaman = 5 XP`).
*   **Partisipasi Event:** Mendaftar seminar mendapatkan poin partisipasi, dan hadir di lokasi mendapatkan poin penuh (Contoh: `Pendaftaran = 2 XP`, `Kehadiran = 15 XP`).
*   **Leveling:** Level dihitung secara berjenjang berdasarkan batas minimum akumulasi XP yang diatur di database (Level 1: *Visitor*, Level 2: *Reader*, Level 3: *Worm*, dst.).

### 3.4 Sistem Lencana Otomatis (Badges Engine)
Lencana (*Badges*) dikalkulasikan secara *on-the-fly* pada database Koha menggunakan filter tanggal tertentu untuk mendeteksi kebiasaan membaca pemustaka:
*   **Weekly Warrior 🥈:** Diberikan otomatis jika pemustaka melakukan kunjungan minimal 3 kali dalam 7 hari terakhir.
*   **Book Worm 📚:** Diberikan jika pemustaka meminjam minimal 5 buku dalam satu semester terakhir (180 hari).
*   **Library Legend 🥇:** Diberikan eksklusif kepada pemustaka yang masuk dalam jajaran **Top 10 besar** klasemen utama bulan berjalan.

### 3.5 Penukaran Hadiah (Redemption System) dengan OTP
Mahasiswa yang memiliki akumulasi poin yang cukup dapat menukarkannya dengan merchandise fisik yang disediakan perpustakaan.
*   **Verifikasi OTP Email:** Sistem mengirimkan kode OTP 6 digit ke email institusi pemustaka (`nim@student.ums.ac.id`) untuk memvalidasi bahwa pemilik akun lah yang melakukan penukaran.
*   **Kode Klaim Unik:** Setelah OTP diverifikasi, sistem memotong stok sementara dan menerbitkan kode klaim unik (`UMS-REDEEM-XXXXXX`) yang dikirim ke email pemustaka untuk ditukarkan ke meja sirkulasi perpustakaan.

### 3.6 Modul Event/Seminar Perpustakaan
Sistem mengelola registrasi kegiatan seminar perpustakaan secara mandiri:
*   **Registrasi Instan:** Pemustaka mendaftar secara online melalui halaman `/seminar` dan langsung mendapatkan poin pendaftaran.
*   **Klaim Kehadiran Mandiri:** Panitia mengaktifkan "Kode Klaim Kehadiran" di akhir acara. Peserta seminar memasukkan kode unik tersebut pada halaman web mereka untuk mencairkan poin kehadiran secara instan.

### 3.7 Generator Instagram Story & Berbagi Sosial
*   **Ekspor Gambar IG Story:** Menggunakan library `html2canvas` pada sisi klien untuk merender kartu profil menjadi gambar beresolusi tinggi (`LibraryRank_Achievement.png`) secara otomatis dan mengunduhnya ke perangkat pengguna.
*   **Pintasan Media Sosial:** Tombol berbagi cepat ke WhatsApp, Facebook, dan X (Twitter) dengan format teks undangan yang sudah terisi otomatis.

### 3.8 Ekspor Laporan Excel & PDF
Pustakawan dapat mengunduh salinan klasemen saat ini dengan mengeklik tombol ekspor di dasbor utama:
*   **Format Excel (.xlsx):** Menghasilkan dokumen baris berisi nama, NIM, fakultas, total kunjungan, total buku dipinjam, dan total poin.
*   **Format PDF:** Menyajikan klasemen cetak secara rapi untuk laporan berkala kepada jajaran pimpinan universitas.

---

## 4. PANDUAN PENGGUNAAN BAGI PENGGUNA UMUM (PEMUSTAKA)

### 4.1 Cara Mengakses & Membaca Leaderboard
1.  Buka web browser dan akses alamat domain LibraryRank (misal: `http://libraryrank.univ.ac.id/`).
2.  Halaman utama akan langsung memuat tab **Overview** secara default.
3.  Gunakan navigasi tab di bagian atas klasemen untuk memfilter daftar:
    *   **Mahasiswa:** Klasemen khusus kategori mahasiswa.
    *   **Dosen:** Klasemen khusus dosen.
    *   **Tendik:** Klasemen khusus staf dan pustakawan.
    *   **Buku Populer:** Menampilkan daftar buku paling sering dipinjam dalam rentang waktu yang dipilih.
    *   **Fakultas Teraktif:** Peringkat fakultas dengan statistik peminjaman terbanyak.
4.  Gunakan tombol filter tanggal (*date picker*) di kanan atas untuk membatasi analisis aktivitas perpustakaan pada rentang tanggal tertentu (Hari ini, Minggu ini, Bulan ini, atau Kustom).

### 4.2 Cara Melihat Detail Profil & Lencana
1.  Cari nama Anda atau teman Anda pada Papan Peringkat (Gunakan kolom pencarian di bagian atas jika nama tidak terlihat di halaman pertama).
2.  Klik pada baris nama pemustaka tersebut.
3.  Sebuah modal profil akan muncul di tengah layar:
    *   Perhatikan **Level** Anda saat ini (ditampilkan dengan warna lencana level).
    *   Lihat lencana penghargaan (**Badges**) yang berhasil Anda dapatkan di bawah avatar nama Anda. Arahkan kursor atau klik pada badge untuk membaca keterangannya.
    *   Di bagian bawah, Anda dapat memantau status keterlambatan buku yang Anda pinjam pada kolom **Recent Borrows**.

### 4.3 Cara Melakukan Klaim/Penukaran Merchandise
1.  Pada halaman utama, gulir ke bagian paling bawah ke bagian **Merchandise / Tukar Poin**.
2.  Pilih barang yang ingin Anda klaim (pastikan sisa stok > 0 dan poin XP Anda mencukupi). Klik **Tukar Poin**.
3.  Masukkan **NIM / ID Anggota** Anda, lalu klik **Kirim Kode OTP**.
4.  Buka email kampus Anda. Cari pesan dari `UMSLibrary` yang berisi 6-digit kode OTP. (Periksa folder *Spam* jika pesan tidak muncul dalam 1 menit).
5.  Masukkan kode OTP tersebut ke kolom verifikasi di halaman web LibraryRank, lalu klik **Verifikasi & Tukar**.
6.  Jika sukses, sistem akan mengunduh kupon digital dan mengirimkan salinan email berisi **Kode Kupon Unik** (contoh: `UMS-REDEEM-A5B2C1`).
7.  Kunjungi meja sirkulasi perpustakaan utama, tunjukkan pesan email kupon tersebut kepada petugas, dan ambil merchandise fisik Anda.

> [!IMPORTANT]
> Begitu kode OTP diverifikasi, poin Anda akan ditahan (*held/pending*) sementara dan stok barang berkurang 1. Poin baru akan benar-benar terpotong secara permanen setelah petugas menyetujui klaim fisik Anda.

### 4.4 Cara Mendaftar dan Mengklaim Poin Seminar
1.  Akses halaman `/seminar` melalui browser.
2.  Cari daftar seminar yang bertuliskan **Pendaftaran Dibuka**. Klik **Daftar Sekarang**.
3.  Masukkan **NIM** dan **Email Kampus** Anda pada form yang disediakan. Setelah sukses, Anda akan menerima email konfirmasi dan mendapatkan tambahan **+2 XP**.
4.  Pada saat seminar berlangsung hingga selesai, panitia akan menampilkan **Kode Klaim Kehadiran** (misal: `UMS-SEM-JULI`) di layar proyektor.
5.  Kembali ke halaman `/seminar`, temukan nama seminar yang Anda ikuti, klik **Klaim Kehadiran**, masukkan kode yang diberikan panitia, lalu klik **Kirim**.
6.  Poin kehadiran (**+15 XP**) akan langsung ditambahkan ke profil klasemen Anda.

### 4.5 Cara Membagikan Prestasi ke Media Sosial
1.  Klik nama Anda di leaderboard untuk memunculkan Kartu Profil.
2.  Pada bagian bawah kartu, klik tombol **📸 Generate IG Story**.
3.  Tunggu 2 detik, sistem akan secara otomatis memproses tangkapan layar kartu profil Anda secara bersih dan mengunduh berkas gambar `LibraryRank_Achievement.png` ke folder unduhan HP/Komputer Anda.
4.  Buka aplikasi Instagram, buat cerita baru (*Instastory*), masukkan gambar tersebut, dan bagikan ke pengikut Anda.
5.  Anda juga bisa menggunakan tombol berlogo WhatsApp, Facebook, atau X (Twitter) untuk membagikan tautan peringkat Anda secara langsung.

---

## 5. PANDUAN OPERASIONAL BAGI ADMINISTRATOR & PUSTAKAWAN

### 5.1 Akses Dasbor Django Admin
1.  Buka browser dan navigasikan ke alamat `/admin` (misal: `http://libraryrank.univ.ac.id/admin/`).
2.  Masukkan username dan password admin Anda.
3.  Aplikasi menggunakan tema modern **Unfold Admin** dengan menu navigasi yang terbagi rapi di sidebar sebelah kiri.

### 5.2 Konfigurasi Aturan Main (XP & Level)
Pustakawan memiliki hak penuh untuk mengubah bobot poin dan rentang level kapan saja:
*   **Mengubah Nilai Poin Kunjungan/Peminjaman:**
    1.  Buka menu **Kebijakan Poin XP** (`PointPolicy`).
    2.  Pilih tipe aktivitas (misal: `visit` atau `borrow`).
    3.  Ubah kolom `points` (poin) ke angka yang diinginkan. Klik **Save**.
*   **Mengatur Tingkatan Level:**
    1.  Buka menu **Level & Tiers** (`LevelTier`).
    2.  Pustakawan bisa menambahkan level baru (misal: Level 5, Poin minimum 5000 XP) atau mengubah nama tingkatannya beserta kode warna hex untuk mempercantik lencana visual di frontend.

### 5.3 Manajemen Katalog & Stok Merchandise
1.  Buka menu **Daftar Merchandise** (`Reward`).
2.  Klik **Add Merchandise** untuk menambahkan hadiah baru, atau klik nama barang untuk mengedit.
3.  Lengkapi form: Nama, Deskripsi, Harga Poin (`points_cost`), dan jumlah stok (`stock`).
4.  Unggah gambar merchandise.
    > [!TIP]
    > **Kompresi Gambar Otomatis:** Sistem backend LibraryRank telah dilengkapi dengan integrasi `Pillow (PIL)`. Setiap gambar merchandise yang diunggah akan otomatis dikompres ke format PNG dan dibatasi dimensi maksimalnya hingga 500px secara otomatis untuk menghemat ruang penyimpanan server.

### 5.4 Validasi dan Eksekusi Klaim Hadiah Mahasiswa
Ketika mahasiswa menukarkan poin secara mandiri, klaim tersebut akan masuk ke antrean admin dengan status `Pending`:
1.  Buka menu **Klaim Hadiah (Redeem)** (`RedemptionClaim`). Jumlah klaim masuk yang belum diproses akan ditampilkan pada label notifikasi merah di sidebar.
2.  Ketika mahasiswa datang ke meja sirkulasi membawa kode kupon (misal: `UMS-REDEEM-A5B2C1`):
    *   Cari kode tersebut pada kolom pencarian di admin.
    *   Pastikan identitas mahasiswa di layar cocok dengan kartu mahasiswa fisik.
    *   Klik tombol **Tandai Selesai** di kolom aksi. Sistem akan memotong poin mahasiswa secara permanen dan mencatat transaksi di sistem log.
    *   Serahkan barang fisik kepada mahasiswa.
3.  Jika mahasiswa membatalkan klaim atau ada kesalahan data:
    *   Klik tombol **Tolak** di kolom aksi.
    *   Sistem akan memulihkan sisa stok barang sebanyak 1 unit dan mengembalikan poin mahasiswa ke saldo klasemen mereka secara otomatis.

### 5.5 Pengelolaan Seminar (Input Manual & Unggah CSV Kehadiran)
Terdapat dua metode untuk mengelola data kehadiran seminar:

#### Metode A: Klaim Mandiri oleh Mahasiswa (Halaman Depan)
1.  Buat kegiatan di menu **Daftar Event / Seminar** (`Seminar`).
2.  Isi judul, deskripsi, pembicara, tanggal main, poin registrasi, poin kehadiran, serta ketik **Kode Klaim Kehadiran** (misal: `UMS-SEM-XYZ`).
3.  Pada saat seminar dimulai, buka kembali seminar tersebut di admin, lalu ubah status **Apakah klaim kehadiran sedang aktif** menjadi **Aktif**.
4.  Mahasiswa dapat memasukkan kode tersebut secara mandiri di halaman depan. Setelah seminar selesai, ubah status kembali menjadi **Nonaktif** agar kode tidak disalahgunakan di luar jam acara.

#### Metode B: Unggah Bulk CSV / Input Teks (Diambil dari Presensi Panitia)
Jika pendaftaran dilakukan secara offline dan panitia memiliki daftar NIM peserta dalam bentuk berkas Excel/CSV atau catatan teks:
1.  Buka menu **Upload Kehadiran (CSV)** (`SeminarUpload`).
2.  Klik **Add Input Data Seminar**.
3.  Isi judul seminar dan jumlah poin kehadiran yang ingin dibagikan (misal: `15` XP).
4.  Pilih salah satu metode input:
    *   **Metode CSV:** Unggah file `.csv` yang berisi kolom tunggal NIM/Cardnumber mahasiswa.
    *   **Metode Manual Input (Textbox):** Tempel (*paste*) daftar NIM peserta di kotak teks besar (satu NIM per baris).
5.  Klik **Save**. Sistem secara otomatis akan memproses data presensi tersebut di latar belakang, memfilter NIM yang tidak valid, menduplikasi entri yang ganda, membuat riwayat poin baru bagi masing-masing anggota secara instan, dan menghapus cache leaderboard agar peringkat langsung ter-update di layar monitor utama.

### 5.6 Pengaturan Siklus Musim (Reset Klasemen)
Perpustakaan dapat mengatur kapan papan peringkat di-reset kembali ke 0 XP (misalnya setiap semester atau tahun ajaran baru):
1.  Buka menu **Reset Poin & Klasemen** (`LeaderboardConfig`).
2.  Pilih salah satu mode reset:
    *   **Manual (Reset Kapan Saja):** Klasemen hanya akan di-reset jika pustakawan menekan tombol merah **Reset Klasemen Now** di panel admin. Semua poin sebelum tanggal reset akan diabaikan.
    *   **Otomatis Tiap Semester:** Sistem otomatis menyetel ulang poin klasemen pada tanggal 1 Januari dan 1 Juli.
    *   **Otomatis Tahunan:** Sistem menyetel ulang poin klasemen pada bulan tertentu yang dipilih (misalnya setiap bulan Agustus saat ajaran baru dimulai).
3.  Poin lama mahasiswa tidak dihapus dari sejarah, melainkan diarsipkan, dan papan peringkat publik akan menampilkan peringkat akumulasi baru terhitung sejak tanggal reset aktif.

### 5.7 Integrasi API & Keamanan
LibraryRank menyediakan REST API terenkripsi untuk kebutuhan sinkronisasi dengan aplikasi lain di kampus (seperti Portal Mahasiswa atau Dasbor Rektorat).
*   **Membuat Kunci Akses API:**
    1.  Buka menu **API Keys** (`APIKey`).
    2.  Klik **Add API Key**, ketikkan nama aplikasi eksternal (misal: *Mobile App Kampus*), lalu simpan.
    3.  Sistem akan men-generate token acak UUID unik yang wajib dikirim di bagian *Header* setiap request eksternal (`Authorization: Api-Key <TOKEN>`).
*   **Endpoint API yang Tersedia:**
    *   `GET /api/v1/member/<member_id>/` : Mengambil profil analitik, level, dan daftar badge anggota.
    *   `POST /api/v1/member/<member_id>/add_points/` : Menambahkan poin manual secara remote dari sistem luar.
    *   `GET /api/v1/rewards/` : Membaca katalog merchandise yang tersedia beserta stok aktif.
    *   `POST /api/v1/redeem/` : Melakukan penukaran kupon merchandise atas nama NIM tertentu melalui aplikasi eksternal.

---

## 6. SPESIFIKASI TEKNIS & PEMECAHAN MASALAH (TROUBLESHOOTING)

### 6.1 Spesifikasi Kebutuhan Lingkungan Server
*   **Operating System:** Windows Server 2019+ / Linux Ubuntu 22.04 LTS
*   **Python Engine:** Versi `3.11` ke atas
*   **Database Service:** MariaDB Versi `10.4` ke atas or MySQL Server `8.0`
*   **SMTP Service:** Akun pengirim surat aktif (Gmail SMTP atau SMTP Server Universitas) di port `587` dengan TLS diaktifkan.

### 6.2 Kendala yang Sering Terjadi & Solusinya

#### Gejala A: Halaman Utama Leaderboard Terlalu Lama Memuat Data (Loading Lembut/Lag)
*   **Analisis Masalah:** Kueri data real-time langsung ke tabel database Koha (`statistics` dan `issues`) yang memiliki jutaan data transaksi sirkulasi memakan waktu pemrosesan CPU yang besar.
*   **Solusi Sementara:** Sistem telah terintegrasi dengan mekanisme `LocMemCache` berdurasi 5-10 menit. Jika kueri tetap lambat, pastikan database administrator menambahkan indeks pada tabel Koha:
    ```sql
    ALTER TABLE koha.statistics ADD INDEX idx_datetime (datetime);
    ALTER TABLE koha.issues ADD INDEX idx_issuedate (issuedate);
    ALTER TABLE koha_satellite.visitorhistory ADD INDEX idx_visittime (visittime);
    ```

#### Gejala B: MySQL/MariaDB Mati Tiba-tiba dan Tidak Bisa Dijalankan Kembali di XAMPP
*   **Analisis Masalah:** Korupsi berkas replikasi multi-master karena adanya interupsi crash daya listrik atau kesalahan pengalihan berkas log sistem ke dalam data directory.
*   **Solusi Teknis:**
    1. Hentikan proses mysqld yang menggantung melalui CMD Administrator:
       ```cmd
       taskkill /F /IM mysqld.exe
       ```
    2. Masuk ke folder data MySQL XAMPP (`E:\xampp\mysql\data\`).
    3. Cari dan hapus berkas konfigurasi replikasi berikut:
       * `multi-master.info`
       * `master-*.info`
       * `relay-log-*.info`
    4. Jalankan kembali service MySQL melalui XAMPP Control Panel.

#### Gejala C: Mahasiswa Tidak Menerima OTP Penukaran di Email
*   **Analisis Masalah:** Koneksi ke SMTP Gmail/Universitas diblokir oleh firewall jaringan internal kampus atau masa berlaku token otentikasi SMTP kedaluwarsa.
*   **Solusi:**
    1. Jika berada dalam jaringan lokal kampus yang membatasi akses port 587 SMTP keluar, ubah nilai `EMAIL_BACKEND` di file konfigurasi `.env` dari `django.core.mail.backends.smtp.EmailBackend` menjadi `django.core.mail.backends.console.EmailBackend`.
    2. Jika menggunakan mode `console`, kode OTP akan dicetak langsung di konsol terminal log server sehingga petugas perpustakaan dapat membacakan kode tersebut secara manual untuk membantu mahasiswa di lokasi.
