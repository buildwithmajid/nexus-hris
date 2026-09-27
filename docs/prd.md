# Product Requirements Document (PRD)
# Sistem HRIS & Payroll Management

**Versi:** 1.0
**Tanggal:** 23 September 2026
**Status:** Draft — Portfolio Project

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Perusahaan skala kecil-menengah di Indonesia sering masih mengelola data karyawan, absensi, dan penggajian secara manual (Excel/spreadsheet), yang rawan human error, sulit diaudit, dan tidak scalable. Sistem HRIS (Human Resource Information System) yang terintegrasi dibutuhkan untuk mengotomatisasi proses HR dari absensi hingga penggajian dengan perhitungan yang taat aturan perpajakan dan ketenagakerjaan Indonesia.

### 1.2 Tujuan Produk
- Mengotomatisasi pencatatan absensi karyawan secara akurat dan anti-manipulasi.
- Menghitung gaji otomatis termasuk PPh 21, BPJS Kesehatan, BPJS Ketenagakerjaan, lembur, dan potongan lain.
- Menyediakan alur approval berjenjang untuk pengajuan cuti, izin, dan reimbursement.
- Memberikan visibilitas data HR melalui dashboard dan laporan.
- Menjadi portfolio project yang menunjukkan kemampuan menangani business logic kompleks, bukan sekadar CRUD.

### 1.3 Target Pengguna (Persona)
| Persona | Kebutuhan Utama |
|---|---|
| **Staff/Karyawan** | Absen mudah, ajukan cuti, lihat slip gaji |
| **Manager/Atasan Langsung** | Approve pengajuan tim, lihat kehadiran tim |
| **HR Admin** | Kelola data karyawan, proses payroll, atur kebijakan |
| **Finance** | Verifikasi payroll sebelum disbursement, lihat laporan biaya |
| **Super Admin** | Kelola konfigurasi sistem, role, dan akses |

---

## 2. Scope Produk

### 2.1 In-Scope (MVP)
1. Manajemen data karyawan (employee master data)
2. Absensi (clock-in/out dengan validasi lokasi)
3. Pengajuan & approval cuti/izin
4. Perhitungan payroll otomatis (gaji pokok, lembur, potongan, PPh21, BPJS)
5. Slip gaji digital (PDF)
6. Role-based access control (RBAC)
7. Dashboard ringkasan per role

### 2.2 In-Scope (Advanced/Fase 2)
1. Perhitungan THR otomatis
2. Reimbursement/expense claim dengan approval
3. Performance review sederhana (KPI/OKR tracking)
4. Multi-level approval workflow (staff → manager → HR → finance)
5. Notifikasi email/WhatsApp untuk approval & slip gaji
6. Export laporan payroll ke format perbankan (untuk transfer massal)
7. Audit trail (siapa mengubah data apa, kapan)

### 2.3 Out-of-Scope
- Recruitment/ATS (applicant tracking system)
- Modul training & learning management
- Integrasi payroll disbursement langsung ke bank (real API, cukup export file)

---

## 3. User Stories & Fitur Detail

### 3.1 Modul Employee Management
- Sebagai HR Admin, saya bisa menambah/edit/menonaktifkan data karyawan (data pribadi, jabatan, departemen, tipe kontrak, tanggal mulai kerja, gaji pokok).
- Sebagai HR Admin, saya bisa mengatur struktur organisasi (departemen, jabatan, atasan langsung).
- Sistem menyimpan riwayat perubahan data karyawan (histori jabatan/gaji).

### 3.2 Modul Absensi
- Sebagai Karyawan, saya bisa clock-in/out melalui web dengan validasi geolocation (radius kantor) dan/atau foto selfie.
- Sebagai Karyawan, saya bisa mengajukan izin lupa absen dengan alasan, menunggu approval atasan.
- Sistem otomatis menandai status: hadir, terlambat, alpha, cuti, izin, sakit.
- Sebagai HR Admin, saya bisa mengatur jam kerja & toleransi keterlambatan per departemen/shift.

**Edge case penting:**
- Karyawan clock-in dari device/lokasi berbeda → sistem log IP & device fingerprint.
- Shift kerja malam yang melewati tengah malam (cross-day shift).
- Libur nasional & cuti bersama otomatis dari kalender.

### 3.3 Modul Cuti & Izin
- Sebagai Karyawan, saya bisa mengajukan cuti (tahunan, sakit, melahirkan, dll) dengan saldo cuti otomatis terpotong setelah approve.
- Sebagai Manager, saya bisa approve/reject pengajuan dengan catatan.
- Sistem menghitung saldo cuti tahunan otomatis (prorata untuk karyawan baru).
- Sebagai HR Admin, saya bisa override saldo cuti secara manual dengan alasan tercatat.

### 3.4 Modul Payroll (Core — paling kompleks)
- Sebagai HR Admin, saya bisa menjalankan proses payroll bulanan untuk semua karyawan sekaligus atau per individu.
- Komponen perhitungan:
  - **Gaji Pokok** (prorata jika karyawan masuk/keluar di tengah bulan)
  - **Tunjangan tetap** (transport, makan, jabatan)
  - **Lembur**: dihitung dari jam kerja aktual di luar jam normal, dengan formula sesuai aturan (1.5x jam pertama, 2x jam berikutnya — dapat dikonfigurasi)
  - **Potongan**: BPJS Kesehatan (1% karyawan), BPJS Ketenagakerjaan (JHT, JKK, JKM, JP — sesuai persentase berlaku), PPh 21 (progresif sesuai PTKP & lapisan tarif)
  - **Potongan lain**: kasbon, pinjaman, absensi (alpha)
- Sebagai Finance, saya bisa mereview & approve batch payroll sebelum dikunci.
- Sebagai Karyawan, saya bisa mengunduh slip gaji (PDF) setelah payroll di-approve.
- Sistem menyimpan histori payroll per periode (tidak bisa diubah setelah dikunci — untuk keperluan audit).

**Catatan teknis penting:** Perhitungan PPh 21 dan BPJS harus dibuat sebagai *rule engine* yang terpisah dan mudah dikonfigurasi (tarif berubah setiap tahun mengikuti regulasi), bukan hardcoded di logic utama.

### 3.5 Modul Approval Workflow (Generik)
- Approval workflow dibuat generik (reusable) untuk cuti, izin, reimbursement, dan payroll — dengan konfigurasi jumlah level approval per jenis pengajuan.
- Sebagai Manager, saya menerima notifikasi setiap ada pengajuan baru yang perlu diapprove.

### 3.6 Modul Dashboard & Laporan
- Dashboard HR Admin: jumlah karyawan aktif, tingkat kehadiran, pengajuan pending, biaya payroll bulan berjalan.
- Dashboard Karyawan: ringkasan kehadiran, saldo cuti, slip gaji terakhir.
- Laporan: rekap absensi per periode, rekap payroll per departemen, laporan pajak (untuk pelaporan ke kantor pajak).

---

## 4. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Keamanan** | Data gaji & pribadi terenkripsi at-rest, akses berbasis RBAC, audit log wajib untuk data sensitif |
| **Performa** | Proses payroll batch untuk 500 karyawan selesai < 30 detik |
| **Skalabilitas** | Arsitektur modular agar mudah ditambah modul baru (payroll, performance, dll) |
| **Ketersediaan** | Uptime 99% (untuk keperluan demo/portfolio, cukup deployment stabil di cloud) |
| **Kompabilitas** | Responsive — bisa diakses via mobile browser untuk absensi lapangan |
| **Auditability** | Semua perubahan data gaji & approval harus tercatat (siapa, kapan, apa yang diubah) |

---

## 5. Rancangan Teknis (Rekomendasi)

### 5.1 Tech Stack
- **Frontend:** Next.js (React) + TailwindCSS
- **Backend:** Node.js (NestJS) — cocok untuk modular architecture dengan dependency injection
- **Database:** PostgreSQL (relasional, cocok untuk data finansial yang butuh konsistensi/transaction)
- **Cache/Queue:** Redis (untuk job scheduler proses payroll & notifikasi async)
- **Auth:** JWT + refresh token, RBAC middleware
- **File storage:** S3-compatible (untuk slip gaji PDF, foto absensi)
- **Deployment:** Docker + CI/CD (GitHub Actions) ke VPS/cloud (Railway, Render, atau VPS sendiri)

### 5.2 Arsitektur
Disarankan **modular monolith** (bukan microservices penuh) — cukup untuk portfolio, tapi tetap menunjukkan pemisahan concern yang baik:
```
/modules
  /employee
  /attendance
  /leave
  /payroll
  /approval-workflow (generic/reusable)
  /notification
  /reporting
```

### 5.3 Skema Database (Entitas Utama)
- `employees` (id, nama, nik, departemen_id, jabatan_id, atasan_id, tanggal_masuk, status, gaji_pokok, ptkp_status)
- `attendance` (id, employee_id, tanggal, jam_masuk, jam_keluar, lokasi, status)
- `leave_requests` (id, employee_id, jenis_cuti, tanggal_mulai, tanggal_selesai, status, approved_by)
- `leave_balances` (id, employee_id, tahun, jenis_cuti, saldo)
- `payroll_periods` (id, bulan, tahun, status: draft/approved/locked)
- `payroll_details` (id, payroll_period_id, employee_id, gaji_pokok, tunjangan, lembur, potongan_bpjs, potongan_pph21, potongan_lain, gaji_bersih)
- `approval_workflows` (id, jenis_pengajuan, level, approver_role)
- `approval_logs` (id, request_id, request_type, approver_id, status, catatan, timestamp)
- `audit_logs` (id, user_id, table_name, record_id, action, old_value, new_value, timestamp)

---

## 6. Roadmap Pengerjaan (untuk Portfolio)

| Fase | Fitur | Estimasi Waktu |
|---|---|---|
| **Fase 1 (MVP)** | Employee mgmt, Auth+RBAC, Absensi dasar | 2-3 minggu |
| **Fase 2** | Cuti & approval workflow generik | 1-2 minggu |
| **Fase 3** | Payroll engine (PPh21, BPJS, lembur) | 2-3 minggu (paling kompleks) |
| **Fase 4** | Slip gaji PDF, dashboard, laporan | 1-2 minggu |
| **Fase 5 (Advanced)** | Reimbursement, notifikasi, audit trail, export bank | 2 minggu |

---

## 7. Metrik Keberhasilan (untuk Konteks Portfolio)
- Sistem bisa memproses payroll untuk data dummy 50-100 karyawan tanpa error perhitungan.
- Ada test case untuk perhitungan PPh 21 & BPJS yang tervalidasi manual.
- Ada dokumentasi arsitektur (README + diagram) yang menjelaskan keputusan desain.
- Ada demo video/link live deployment yang bisa diakses recruiter.

---

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Aturan pajak/BPJS berubah tiap tahun | Buat rule engine terpisah/configurable, bukan hardcoded |
| Scope terlalu besar untuk dikerjakan sendiri | Prioritaskan MVP dulu, fitur advance opsional |
| Kompleksitas perhitungan payroll salah | Buat unit test dengan kasus perhitungan manual sebagai baseline |
| Data sensitif (gaji) bocor | Terapkan encryption & access control sejak awal desain |

---

## 9. Lampiran: Referensi Perhitungan Indonesia
- **PPh 21**: Menggunakan skema TER (Tarif Efektif Rata-rata) yang berlaku sejak 2024, disederhanakan berdasarkan status PTKP (TK/0, K/1, dst).
- **BPJS Kesehatan**: 5% dari gaji (4% perusahaan, 1% karyawan), dengan batas atas gaji yang dihitung.
- **BPJS Ketenagakerjaan**: JHT (3.7% perusahaan + 2% karyawan), JKK (bervariasi sesuai risiko), JKM (0.3%), JP (opsional, ada batas gaji).

*Catatan: Persentase di atas bisa berubah sesuai regulasi terbaru — pastikan cek sumber resmi (BPJS, DJP) saat implementasi aktual, dan jangan hardcode angka ini di kode utama.*
