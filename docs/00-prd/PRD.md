# PRD: Personal Ops — Career & Goal Tracking System

**Codename:** IDONG OS (ganti sesuai selera — saran lain: TRACKR, GERAK, HQ)
**Author:** Idong
**Versi:** 1.0
**Status:** Draft untuk pengembangan

---

## 1. Latar Belakang & Masalah

Saat ini kondisi:
- Libur semester → transisi ke semester 7, fase kritis sebelum lulus.
- Ada 3 kandidat proyek skripsi yang belum diputuskan.
- Punya target karier jelas (Cloud/Infra, SOC, atau MLOps/Edge AI) tapi belum ada sistem yang menghubungkan aktivitas harian → target itu.
- Masalah psikologis nyata: **kehilangan tekanan eksternal** (deadline kampus, dosen, kelompok) yang selama ini jadi motor gerak. Risiko: waktu luang berubah jadi ilusi produktif — sibuk tapi gak maju.

**Masalah inti yang harus dijawab produk ini:**
> Bagaimana membangun struktur akuntabilitas pribadi (seperti sebuah "perusahaan pribadi") yang menciptakan tekanan yang *sehat dan produktif* — bukan kesibukan palsu — supaya lulus dengan portofolio, sertifikasi, dan koneksi yang cukup untuk dapat kerja sebelum wisuda.

---

## 2. Visi Produk

Website ini bukan to-do list. Ini adalah **"Company Dashboard"** di mana Idong adalah CEO sekaligus satu-satunya karyawan dari perusahaan bernama dirinya sendiri. Setiap goal punya OKR, setiap minggu ada laporan progress ke "atasan" (diri sendiri di masa depan), dan setiap keputusan (termasuk skripsi) dicatat dan dipertanggungjawabkan.

**North Star Metric:** Job offer diterima sebelum tanggal wisuda.

---

## 3. Target User

Satu orang: Idong. Tapi didesain dengan disiplin seolah untuk banyak user, supaya:
- Data terstruktur rapi (bukan sekadar catatan bebas).
- Bisa di-maintain jangka panjang, bahkan dipakai lagi pas kerja nanti (habit yang menetap).

---

## 4. Prinsip Desain (WAJIB DIIKUTI)

Ini bagian penting biar hasil akhir gak kelihatan "AI slop":

| Jangan | Lakukan |
|---|---|
| Gradient blob ungu-pink generik | Palet warna terbatas (2-3 warna + netral), ala Linear/Vercel/Notion |
| Font default sistem / Inter tanpa hierarki | Tentukan type scale jelas: 1 font display + 1 font teks, ukuran konsisten |
| Card dengan shadow tebal & rounded berlebihan | Border tipis, whitespace besar, rounded konsisten (misal cuma 8px) |
| Emoji berlebihan di UI | Icon set konsisten (Lucide/Phosphor), emoji seperlunya saja |
| Dashboard penuh angka tanpa makna | Setiap angka punya konteks (trend, target, delta) |
| Copy generik ("Welcome back!", "Your Dashboard") | Copy personal & spesifik ("Minggu ke-3, target: submit judul skripsi") |

**Referensi visual mood:** Linear.app, Notion dashboard pribadi, Arc browser, GitHub Projects — clean, sedikit warna, tipografi kuat, data-dense tapi rapi.

**Mode:** Dark mode default (karena dipakai malam banyak & terasa lebih "command center"), dengan light mode opsional.

---

## 5. Struktur Produk — Modul Utama

Analogi: ini adalah perusahaan dengan **4 Divisi**.

### 5.1 Divisi: Skripsi & Riset
- **Decision Matrix** — 3 kandidat proyek dibandingkan dengan kriteria terbobot:
  - Kecepatan penyelesaian (effort tersisa)
  - Relevansi ke career track (Cloud/SOC/MLOps)
  - Nilai portofolio (seberapa "jual" di interview/LinkedIn)
  - Risiko (dosen pembimbing, data, akses)
  - Skor otomatis → rekomendasi, tapi keputusan akhir tetap manual (dicatat + alasan, supaya ada akuntabilitas)
- **Progress tracker** per proyek terpilih: milestone (bab 1-5, sidang, revisi)
- **Artifact log**: draft artikel, versi PPT, catatan revisi dosen

### 5.2 Divisi: Job Readiness
- **Application Kanban**: Wishlist → Applied → Interview → Offer/Rejected
- **Skill Gap Tracker**: sertifikasi (AWS SAA-C03 / Security+), progress modul belajar, target tanggal ujian
- **Portfolio Checklist**: proyek mana yang sudah punya repo rapi + README + demo (CV, Smart City Reporting, LibraryRank, IntegraSec)
- **Interview Prep Bank**: catatan pertanyaan teknis yang pernah ditemui, jawaban yang disiapkan

### 5.3 Divisi: Skill Building (Homelab & Sertifikasi)
- Terhubung ke rencana 6 bulan: CCTV detection → k3s → CI/CD
- Task tracker teknis dengan checklist granular (bukan "belajar k8s" doang, tapi "deploy nginx di k3s cluster", "setup ArgoCD")

### 5.4 Divisi: Organisasi & Personal
- Kegiatan IMM Adam Malik FKI UMS, desain grafis, community project (Trangsan, dsb)
- Supaya gak keteteran waktu antar-divisi

---

## 6. Sistem Akuntabilitas (Inti dari Permintaan Lo)

Ini bagian yang jawab kebutuhan "gw butuh rasa pressure":

1. **Weekly Contract** — Tiap Minggu malam, isi form: "Minggu ini gw komit ke 3 output konkret." Bukan "belajar Docker" tapi "selesaikan modul X, deploy Y, submit Z." Sistem gak kasih poin buat aktivitas yang gak menghasilkan artifact (file, deploy, submission, tulisan).
2. **Daily Standup ke Diri Sendiri** — 3 pertanyaan tiap malam:
   - Apa yang gw selesaikan hari ini (link/bukti)?
   - Apa blocker-nya?
   - Apa 1 hal paling penting besok?
3. **Streak dengan Integritas** — Streak cuma nambah kalau ada bukti konkret (link commit, file, screenshot progress), bukan cuma centang manual tanpa bukti. Kalau gak ada bukti 3 hari berturut, sistem kasih notifikasi "red flag."
4. **Weekly Review (Jumat/Minggu)** — Bandingkan komitmen vs realisasi. Tampilkan % penyelesaian per divisi. Ini pengganti "dosen nanyain progress."
5. **Deadline Buatan Sendiri dengan Konsekuensi** — Untuk setiap goal besar (misal: submit judul skripsi), user set tanggal + "taruhan" (misal: kalau telat, gak boleh main game minggu itu). Sistem cuma reminder, bukan penegak — tapi dicatat histori-nya biar keliatan pola (apakah sering ngaret).

---

## 7. Data Model (Ringkas)

```
Company (1 entity, root)
├── Division (Skripsi, Job, Skill, Personal)
│   └── Goal (OKR: Objective + Key Results)
│       └── Task (checklist item, punya due_date, status, artifact_link)
├── DailyLog (tanggal, 3 jawaban standup, mood/energy 1-5)
├── WeeklyContract (minggu, komitmen[], realisasi[], skor)
├── DecisionRecord (judul keputusan, opsi[], kriteria[], skor, keputusan_final, alasan)
├── Application (perusahaan, posisi, status, tanggal, catatan)
├── Certification (nama, target_tanggal, progress%, resource_link)
└── Artifact (tipe: repo/artikel/deploy/design, link, terhubung ke Goal/Task)
```

---

## 8. Rekomendasi Teknis (disesuaikan skill lo)

Karena lo lebih kuat di infra/cloud daripada software dev berat, ambil pendekatan **simple tapi production-grade**, sekalian latihan buat homelab plan lo:

- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui — clean, banyak referensi desain bagus, gak perlu reinvent komponen.
- **Backend/DB:** PostgreSQL (atau SQLite kalau resource server terbatas — lihat 8.1), Prisma sebagai ORM.
- **Auth:** Single-user, gak perlu ribet — cukup satu password/session. Karena akses dibatasi via Tailscale (lihat 8.1), auth publik yang berat gak wajib.
- **Analytics/Chart:** Recharts atau Tremor untuk dashboard visual.
- **Notifikasi:** In-app + opsional integrasi Telegram bot buat reminder harian.

### 8.1 Arsitektur Infrastruktur — Dell T40 + Proxmox + Tailscale

**Topologi:**
- Proxmox VE (host) di Dell T40 → 1 VM khusus untuk aplikasi ini, terpisah dari servis homelab lain (misal `personalhq-vm`).
- Spesifikasi awal VM: **2 vCPU / 4GB RAM / 20GB disk** — cukup ringan, T40 gak akan keberatan meski jalan bareng VM/LXC lain di server yang sama.
- Kalau RAM total T40 lo pas-pasan (≤8GB), pakai **SQLite** dulu daripada Postgres biar hemat memory footprint. Upgrade ke Postgres kapan pun kalau nanti nambah RAM/butuh concurrent write lebih berat.
- OS VM: Ubuntu Server 22.04/24.04 LTS (paling banyak referensi Docker & Tailscale).

**Stack di dalam VM (Docker Compose):**
```yaml
services:
  app:   # Next.js, port 3000
  db:    # Postgres (skip kalau pakai SQLite)
```

**Akses via Tailscale (bukan expose ke internet):**
- Install Tailscale **langsung di VM** (bukan cuma di Proxmox host), supaya VM ini punya IP tailnet sendiri, terpisah dari servis lain.
- Jalankan `tailscale serve https / 3000` — Tailscale otomatis bikin HTTPS dengan sertifikat valid di tailnet, **tanpa perlu setup Let's Encrypt atau reverse proxy manual**. Paling simpel buat kasus "1 app, 1 tujuan" kayak ini.
- Akses dari kampus/luar rumah tinggal buka `https://personalhq.<nama-tailnet>.ts.net` setelah Tailscale aktif di HP/laptop.
- **Gak ada port yang perlu dibuka di router rumah** — jauh lebih aman dibanding expose ke internet publik, apalagi ini nyimpen data pribadi (progress job hunting, dsb).

**Keamanan tambahan:**
- Proxmox Web UI (port 8006) tetap **hanya** boleh diakses via Tailscale/LAN — jangan pernah expose ke publik.
- Kalau Tailscale dipakai juga buat servis homelab lain, kasih tag khusus (misal `tag:personalhq`) di ACL Tailscale biar akses per servis tetap terpisah/terkontrol.
- Backup: schedule `vzdump` mingguan di Proxmox buat snapshot VM ini, simpan di storage terpisah (disk lain, kalau ada NAS).

**CI/CD (mulai manual, baru diotomatisasi):**
- MVP: deploy manual — SSH via Tailscale ke VM → `git pull && docker compose up -d --build`.
- Lanjutan (selaras rencana 6 bulan lo): migrasi ke **k3s single-node** di VM yang sama atau LXC terpisah, pasang ArgoCD/Watchtower buat auto-deploy tiap push ke GitHub. Sekalian jadi bahan latihan k3s buat portofolio infra.

---

## 9. MVP Roadmap

**Fase 1 (Minggu 1-2): Fondasi**
- Setup project, auth simple, struktur database
- CRUD Goal & Task per divisi
- Dashboard utama (overview semua divisi)

**Fase 2 (Minggu 3-4): Akuntabilitas**
- Daily Standup form
- Weekly Contract & Review
- Streak engine dengan validasi artifact

**Fase 3 (Minggu 5-6): Job & Skripsi Modules**
- Decision Matrix untuk skripsi
- Application Kanban
- Certification tracker

**Fase 4 (Minggu 7+): Polish & Deploy**
- Provision VM baru di Proxmox (2 vCPU/4GB RAM/20GB disk), install Docker + Tailscale
- Deploy via Docker Compose, aktifkan `tailscale serve` untuk HTTPS otomatis
- Test akses dari luar rumah (data seluler) buat pastikan Tailscale jalan
- Refinement UI/UX sesuai prinsip desain di atas
- (Opsional) Integrasi Telegram bot reminder
- (Lanjutan, gak wajib MVP) Migrasi ke k3s single-node begitu siap latihan lebih dalam

---

## 10. Metrik Keberhasilan

- Jumlah artifact konkret dihasilkan per minggu (bukan jumlah checklist dicentang)
- Konsistensi weekly contract (target vs realisasi) — trennya harus naik, bukan makin sering meleset
- Waktu dari sekarang → keputusan skripsi final (target: maksimal 2 minggu)
- Progress sertifikasi (% modul selesai per minggu)
- Jumlah aplikasi kerja terkirim per bulan begitu masuk fase job hunting

---

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Tool jadi ajang procrastination (rapihin UI/fitur terus) | Time-box development ke 4 fase di atas, resist nambah fitur baru sebelum MVP jalan dipakai 2 minggu |
| Streak dipalsukan tanpa bukti nyata | Wajib lampirkan artifact_link tiap klaim selesai |
| Overwhelmed karena 4 divisi sekaligus | Weekly contract cuma boleh punya maks 3 komitmen besar total (bukan per divisi) |
| Sistem jadi terlalu kaku, malah bikin stress | Ada kolom "energy/mood" harian — kalau energy rendah 2 hari berturut, sistem prompt untuk review beban, bukan push lebih keras |

---

## 12. Langkah Selanjutnya

1. Validasi struktur data & modul ini — ada yang mau ditambah/dibuang?
2. Tentuin nama produk final + skema warna (gw bisa bantu bikin mockup visual kalau udah fix arahnya)
3. Mulai Fase 1 — kalau mau, gw bisa langsung bantu scaffold project Next.js + Prisma-nya