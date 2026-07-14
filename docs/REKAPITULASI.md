# Rekapitulasi & Panduan Dokumentasi Arsitektur IDONG OS

Dokumen ini merangkum seluruh sistem, repositori database, komponen antarmuka (UI), server actions, dan konfigurasi DevOps yang telah dibangun selama pengerjaan proyek **IDONG OS**.

---

## Daftar Isi & Pintasan File Dokumentasi

*   **Rencana Rilis & Target:** [docs/03-roadmap/implementation-roadmap.md](file:///f:/IDONG%20OS/docs/03-roadmap/implementation-roadmap.md)
*   **Panduan Jaringan VPN Aman:** [docs/04-deployment/tailscale.md](file:///f:/IDONG%20OS/docs/04-deployment/tailscale.md)
*   **Log Perubahan Sesi:** [walkthrough.md](file:///C:/Users/ASUSPRO/.gemini/antigravity-ide/brain/b0391e24-d15b-4eee-bf77-e5018da81c11/walkthrough.md)
*   **Lembar Tugas Kerja:** [task.md](file:///C:/Users/ASUSPRO/.gemini/antigravity-ide/brain/b0391e24-d15b-4eee-bf77-e5018da81c11/task.md)

---

## 1. Modul Inti & Dasbor Utama

Dasbor utama mengoordinasikan ringkasan statistik harian, pelacakan kalender absensi, kueri data audit aktivitas, serta spanduk pengingat jika standup harian berstatus tunda (*pending*).

*   **Server Page:** [src/app/dashboard/page.tsx](file:///f:/IDONG%20OS/src/app/dashboard/page.tsx)
*   **Client Page:** [src/app/dashboard/DashboardPageClient.tsx](file:///f:/IDONG%20OS/src/app/dashboard/DashboardPageClient.tsx)
*   **Widget Absensi Kalender:** [src/components/widgets/AbsensiCalendarWidget.tsx](file:///f:/IDONG%20OS/src/components/widgets/AbsensiCalendarWidget.tsx)
*   **Sidebar Navigasi:** [src/components/Sidebar.tsx](file:///f:/IDONG%20OS/src/components/Sidebar.tsx)

---

## 2. Alur Standup Harian (Milestone 2.1)

Melacak kegiatan harian pengguna, tingkat energi (1-5), emosi/mood (1-5), serta memicu penambahan jumlah streak harian jika log standup berhasil dimasukkan hari ini.

*   **Daily Log Repository:** [src/repositories/DailyLogRepository.ts](file:///f:/IDONG%20OS/src/repositories/DailyLogRepository.ts)
*   **Server Action:** [src/app/dashboard/actions.ts](file:///f:/IDONG%20OS/src/app/dashboard/actions.ts)
*   **Modal UI Input:** [src/components/DailyStandupModal.tsx](file:///f:/IDONG%20OS/src/components/DailyStandupModal.tsx)

---

## 3. Kontrak & Evaluasi Mingguan (Milestone 2.2)

Setiap awal minggu, pengguna mengunci tepat 3 komitmen utama. Di akhir minggu (Hari Minggu), pengguna mencentang komitmen yang berhasil diselesaikan. Jika jumlah komitmen yang selesai kurang dari 2 (skor < 67%), kontrak berstatus `FAILED`, memicu penalti yang secara otomatis me-reset streak harian ke `0` dan menyalakan `redFlagStatus = true`.

*   **Weekly Contract Repository:** [src/repositories/WeeklyContractRepository.ts](file:///f:/IDONG%20OS/src/repositories/WeeklyContractRepository.ts)
*   **Server Actions:** [src/app/weekly-contract/actions.ts](file:///f:/IDONG%20OS/src/app/weekly-contract/actions.ts)
*   **Weekly Route Page:** [src/app/weekly-contract/page.tsx](file:///f:/IDONG%20OS/src/app/weekly-contract/page.tsx)
*   **Form Kunci Komitmen:** [src/components/WeeklyContractForm.tsx](file:///f:/IDONG%20OS/src/components/WeeklyContractForm.tsx)
*   **Form Evaluasi Akhir:** [src/components/WeeklyContractReview.tsx](file:///f:/IDONG%20OS/src/components/WeeklyContractReview.tsx)
*   **Dashboard Widget:** [src/components/widgets/WeeklyContractWidget.tsx](file:///f:/IDONG%20OS/src/components/widgets/WeeklyContractWidget.tsx)

---

## 4. Modul Skripsi & Decision Matrix (Milestone 3.1)

Membantu pengguna menentukan topik skripsi terbaik menggunakan Decision Matrix terbobot berdasarkan 4 kriteria: Kelulusan Cepat (30%), Relevansi Karir (30%), Nilai Portofolio (20%), dan Keamanan Risiko (20%). Setelah satu judul difinalkan, sistem secara otomatis me-seed sasaran (`Goal`) skripsi baru di basis data lengkap dengan 6 milestone tugas bab (Bab 1 - 5 dan Sidang Akhir).

*   **Skripsi Repository:** [src/repositories/SkripsiRepository.ts](file:///f:/IDONG%20OS/src/repositories/SkripsiRepository.ts)
*   **Server Actions:** [src/app/skripsi/actions.ts](file:///f:/IDONG%20OS/src/app/skripsi/actions.ts)
*   **Skripsi Route Page:** [src/app/skripsi/page.tsx](file:///f:/IDONG%20OS/src/app/skripsi/page.tsx)
*   **Matrix Perhitungan UI:** [src/components/DecisionMatrix.tsx](file:///f:/IDONG%20OS/src/components/DecisionMatrix.tsx)
*   **Checklist Milestone Bab:** [src/components/MilestoneChecklist.tsx](file:///f:/IDONG%20OS/src/components/MilestoneChecklist.tsx)

---

## 5. Modul Karir & Kanban Kesiapan Kerja (Milestone 3.2)

Mengelola pipeline lamaran pekerjaan dalam format Kanban 5 kolom (Wishlist, Applied, Interview, Offer, Rejected). Dilengkapi pelacak progres sertifikasi profesional (`completedTask / totalTask`) dan bank kartu review Tanya Jawab (Flashcards) teknis untuk persiapan wawancara.

*   **Career Repository:** [src/repositories/JobRepository.ts](file:///f:/IDONG%20OS/src/repositories/JobRepository.ts)
*   **Server Actions:** [src/app/job-readiness/actions.ts](file:///f:/IDONG%20OS/src/app/job-readiness/actions.ts)
*   **Job Readiness Page:** [src/app/job-readiness/page.tsx](file:///f:/IDONG%20OS/src/app/job-readiness/page.tsx)
*   **Tabs Client Wrapper:** [src/app/job-readiness/JobReadinessClient.tsx](file:///f:/IDONG%20OS/src/app/job-readiness/JobReadinessClient.tsx)
*   **Kanban Board UI:** [src/components/KanbanBoard.tsx](file:///f:/IDONG%20OS/src/components/KanbanBoard.tsx)
*   **Sertifikasi Progress:** [src/components/CertificationTracker.tsx](file:///f:/IDONG%20OS/src/components/CertificationTracker.tsx)
*   **Tanya Jawab Flashcards:** [src/components/InterviewPrep.tsx](file:///f:/IDONG%20OS/src/components/InterviewPrep.tsx)

---

## 6. Modul Skill Building & Homelab Tracker (Milestone 3.3)

Memfasilitasi pelacakan target kompetensi teknis di bawah division `skill`, dikelompokkan secara virtual menggunakan awalan judul target (`[Homelab]`, `[Learning Path]`, `[Certification]`, `[Projects]`). Setiap penghapusan subtarget secara transaksional merekam log audit `DELETED_TASK`.

*   **Skill Repository:** [src/repositories/SkillRepository.ts](file:///f:/IDONG%20OS/src/repositories/SkillRepository.ts)
*   **Server Actions:** [src/app/skill-building/actions.ts](file:///f:/IDONG%20OS/src/app/skill-building/actions.ts)
*   **Skill Building Page:** [src/app/skill-building/page.tsx](file:///f:/IDONG%20OS/src/app/skill-building/page.tsx)
*   **Tabs Client Wrapper:** [src/app/skill-building/SkillBuildingClient.tsx](file:///f:/IDONG%20OS/src/app/skill-building/SkillBuildingClient.tsx)
*   **Skill Goal Card UI:** [src/components/SkillGoalCard.tsx](file:///f:/IDONG%20OS/src/components/SkillGoalCard.tsx)

---

## 7. Modul Analisis & Heatmap (Milestone 3.4)

Pusat laporan performa kerja visual. Roda sirkular SVG progres menghitung rasio keaktifan standup harian, tingkat keberhasilan kontrak mingguan, dan sebaran pengerjaan tugas kompetensi. Menampilkan grafik garis SVG tren energi & mood 30 hari terakhir, serta kontribusi absensi grid ala GitHub (90 hari terakhir).

*   **Analytics Repository:** [src/repositories/AnalyticsRepository.ts](file:///f:/IDONG%20OS/src/repositories/AnalyticsRepository.ts)
*   **Analytics Page:** [src/app/analytics/page.tsx](file:///f:/IDONG%20OS/src/app/analytics/page.tsx)
*   **Circular Progress Ring:** [src/components/PerformanceGauges.tsx](file:///f:/IDONG%20OS/src/components/PerformanceGauges.tsx)
*   **Grafik Garis SVG:** [src/components/EnergyMoodChart.tsx](file:///f:/IDONG%20OS/src/components/EnergyMoodChart.tsx)
*   **Absensi Grid Heatmap:** [src/components/ContributionHeatmap.tsx](file:///f:/IDONG%20OS/src/components/ContributionHeatmap.tsx)

---

## 8. Telegram Bot Daemon Worker (Milestone 4.1)

Aplikasi latar belakang node independen untuk memproses alur notifikasi scheduler. Bekerja secara independen dari Next.js untuk:
1.  Mengirim peringatan harian pukul `dailyReminder` (misal 08:00) jika pengguna belum mengunggah log standup.
2.  Mengirim peringatan *red flag* bahaya pukul 23:00 jika standup hari ini masih kosong.
3.  Mengirim rangkuman status komitmen mingguan, skor pencapaian, dan streak aktif pada hari Minggu malam pukul `weeklyReminder`.

*   **Bot Daemon Script:** [worker/daemon.ts](file:///f:/IDONG%20OS/worker/daemon.ts)

---

## 9. Containerization, Backups & CI/CD (Milestone 4.2)

*   **Multi-Stage Dockerfile:** [Dockerfile](file:///f:/IDONG%20OS/Dockerfile) - Mengemas Next.js dan Worker ke image minimalis.
*   **Compose Orchestration:** [docker-compose.yml](file:///f:/IDONG%20OS/docker-compose.yml) - Menghubungkan service Next.js web, worker daemon, dan mensinkronisasikan basis data SQLite via *shared persistent volume*.
*   **Nginx Config Proxy:** [nginx.conf](file:///f:/IDONG%20OS/nginx.conf) - Mengarahkan request port 80 ke server Next.js port 3000.
*   **Prisma Database Schema:** [prisma/schema.prisma](file:///f:/IDONG%20OS/prisma/schema.prisma) - Desain model relasional tabel data.
*   **Automated Backup Script:** [scripts/backup-db.ps1](file:///f:/IDONG%20OS/scripts/backup-db.ps1) - Menyalin database SQLite dengan stempel tanggal dan menghapus cadangan yang berumur lebih dari 7 cadangan terbaru.
*   **GitHub Actions Workflow:** [.github/workflows/deploy.yml](file:///f:/IDONG%20OS/.github/workflows/deploy.yml) - Memicu otomatisasi linter dan uji build pada push ke branch `main`.
