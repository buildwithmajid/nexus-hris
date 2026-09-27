# Payroll Calculation Engine — Spesifikasi Teknis Detail
## Dokumen Pendamping PRD Sistem HRIS

**Versi:** 1.0
**Tanggal:** 23 September 2026
**Referensi regulasi:** PP 58/2023, PMK 168/2023 (skema TER PPh 21), ketentuan BPJS Kesehatan & Ketenagakerjaan berlaku 2026

> ⚠️ **Catatan penting:** Semua persentase & batas nominal di dokumen ini adalah rate yang berlaku saat dokumen dibuat (2026) dan **bisa berubah sewaktu-waktu** oleh pemerintah. Implementasi harus menyimpan rate ini sebagai **data konfigurasi di database**, bukan hardcode di kode program, supaya bisa di-update tanpa deploy ulang.

---

## 1. Arsitektur Rule Engine

Buat modul terpisah `payroll-engine` yang tidak bergantung langsung ke tabel `employees`, tapi menerima input berupa objek data dan mengembalikan hasil hitung. Ini memudahkan unit testing.

```
/payroll-engine
  /rules
    pph21-ter.rules.json      <- tabel tarif TER, diupdate via admin panel
    bpjs.rules.json            <- persentase & batas upah BPJS
    overtime.rules.json        <- multiplier lembur
  /calculators
    Pph21Calculator.ts
    BpjsCalculator.ts
    OvertimeCalculator.ts
    PayrollOrchestrator.ts     <- menggabungkan semua komponen
  /tests
    pph21.test.ts
    bpjs.test.ts
    overtime.test.ts
```

Alur orchestrator:
```
Input: Employee, AttendanceSummary, PayrollPeriod
  1. Hitung Gaji Pokok (prorata jika perlu)
  2. Hitung Tunjangan Tetap
  3. Hitung Lembur → OvertimeCalculator
  4. Hitung Penghasilan Bruto = Pokok + Tunjangan + Lembur
  5. Hitung Potongan BPJS (karyawan) → BpjsCalculator
  6. Hitung PPh 21 → Pph21Calculator (butuh Penghasilan Bruto)
  7. Hitung Potongan Lain (kasbon, absensi alpha, dll)
  8. Gaji Bersih = Bruto - BPJS_karyawan - PPh21 - Potongan_lain
Output: PayrollDetail (breakdown lengkap tiap komponen, untuk slip gaji)
```

---

## 2. Perhitungan Lembur (Overtime)

Berdasarkan Kepmenaker No. 102/2004 (formula umum yang dipakai kebanyakan perusahaan swasta):

**Dasar perhitungan:** Upah per jam = Gaji Pokok bulanan ÷ 173

| Kondisi | Multiplier |
|---|---|
| Jam ke-1 (hari kerja biasa) | 1.5× upah/jam |
| Jam ke-2 dst (hari kerja biasa) | 2× upah/jam |
| 8 jam pertama (hari libur/weekend) | 2× upah/jam |
| Jam ke-9 (hari libur) | 3× upah/jam |
| Jam ke-10, 11 (hari libur) | 4× upah/jam |

**Pseudocode:**
```typescript
function calculateOvertime(gajiPokok: number, overtimeHours: OvertimeEntry[]): number {
  const upahPerJam = gajiPokok / 173;
  let totalLembur = 0;

  for (const entry of overtimeHours) {
    if (entry.isHoliday) {
      // Formula hari libur
      const jamPertama8 = Math.min(entry.hours, 8);
      const jamKe9 = entry.hours > 8 ? Math.min(entry.hours - 8, 1) : 0;
      const jamSisanya = entry.hours > 9 ? entry.hours - 9 : 0;

      totalLembur += jamPertama8 * 2 * upahPerJam;
      totalLembur += jamKe9 * 3 * upahPerJam;
      totalLembur += jamSisanya * 4 * upahPerJam;
    } else {
      // Formula hari kerja biasa
      const jamPertama = Math.min(entry.hours, 1);
      const jamSisanya = entry.hours > 1 ? entry.hours - 1 : 0;

      totalLembur += jamPertama * 1.5 * upahPerJam;
      totalLembur += jamSisanya * 2 * upahPerJam;
    }
  }

  return Math.round(totalLembur);
}
```

**Edge case yang harus dihandle:**
- Lembur di hari libur nasional vs weekend (Sabtu/Minggu) bisa beda formula tergantung kebijakan perusahaan (sistem kerja 5 hari vs 6 hari) — buat configurable.
- Pembulatan: gunakan pembulatan ke rupiah penuh sesuai kebijakan perusahaan (round up/down/nearest — configurable).

---

## 3. Perhitungan BPJS

### 3.1 BPJS Kesehatan
- **Total iuran:** 5% dari gaji (upah + tunjangan tetap)
- **Dibayar perusahaan:** 4%
- **Dipotong dari karyawan:** 1%
- **Batas atas upah yang dihitung:** Rp12.000.000/bulan (di atas ini tetap dihitung dari Rp12.000.000)

```typescript
function calculateBpjsKesehatan(gajiBruto: number): { perusahaan: number, karyawan: number } {
  const BATAS_ATAS = 12_000_000;
  const dasarPerhitungan = Math.min(gajiBruto, BATAS_ATAS);

  return {
    perusahaan: Math.round(dasarPerhitungan * 0.04),
    karyawan: Math.round(dasarPerhitungan * 0.01),
  };
}
```

### 3.2 BPJS Ketenagakerjaan
Empat komponen, masing-masing beda pembagian beban:

| Program | Perusahaan | Karyawan | Batas Upah |
|---|---|---|---|
| JHT (Jaminan Hari Tua) | 3.7% | 2% | Tidak ada batas |
| JKK (Jaminan Kecelakaan Kerja) | 0.24%–1.74% (sesuai tingkat risiko usaha) | 0% | Tidak ada batas |
| JKM (Jaminan Kematian) | 0.3% | 0% | Tidak ada batas |
| JP (Jaminan Pensiun) | 2% | 1% | Ada batas atas (disesuaikan berkala oleh pemerintah — cek nilai terbaru saat implementasi) |

```typescript
interface BpjsKetenagakerjaanRates {
  jht: { perusahaan: number; karyawan: number };
  jkk: { perusahaan: number }; // sesuai kelas risiko perusahaan
  jkm: { perusahaan: number };
  jp: { perusahaan: number; karyawan: number; batasUpah: number };
}

function calculateBpjsKetenagakerjaan(
  gajiBruto: number,
  rates: BpjsKetenagakerjaanRates
): { perusahaan: number; karyawan: number; breakdown: object } {
  const dasarJP = Math.min(gajiBruto, rates.jp.batasUpah);

  const jhtPerusahaan = Math.round(gajiBruto * rates.jht.perusahaan);
  const jhtKaryawan = Math.round(gajiBruto * rates.jht.karyawan);
  const jkkPerusahaan = Math.round(gajiBruto * rates.jkk.perusahaan);
  const jkmPerusahaan = Math.round(gajiBruto * rates.jkm.perusahaan);
  const jpPerusahaan = Math.round(dasarJP * rates.jp.perusahaan);
  const jpKaryawan = Math.round(dasarJP * rates.jp.karyawan);

  return {
    perusahaan: jhtPerusahaan + jkkPerusahaan + jkmPerusahaan + jpPerusahaan,
    karyawan: jhtKaryawan + jpKaryawan,
    breakdown: { jhtPerusahaan, jhtKaryawan, jkkPerusahaan, jkmPerusahaan, jpPerusahaan, jpKaryawan },
  };
}
```

**Catatan implementasi:** JKK persentasenya tergantung kelas risiko usaha perusahaan (5 kelas, dari 0.24% sampai 1.74%) — simpan sebagai setting per-tenant/perusahaan, bukan konstanta global. Batas upah JP disesuaikan berkala oleh pemerintah, jadi wajib jadi parameter configurable di admin panel, bukan angka tetap di kode.

**Yang dipotong dari gaji karyawan** hanya: JHT karyawan (2%) + JP karyawan (1%) = 3% dari gaji. JKK dan JKM sepenuhnya beban perusahaan (tidak mengurangi take-home pay).

---

## 4. Perhitungan PPh 21 (Skema TER)

Ini bagian paling kompleks. Sejak 2024, pemotongan bulanan (Januari–November) memakai skema **TER (Tarif Efektif Rata-rata)**, dan baru di bulan Desember/masa kerja terakhir dihitung ulang pakai tarif progresif Pasal 17 untuk rekonsiliasi.

### 4.1 Langkah 1: Tentukan Kategori TER

| Kategori | Status PTKP |
|---|---|
| **TER A** | TK/0, TK/1, K/0 |
| **TER B** | TK/2, TK/3, K/1, K/2 |
| **TER C** | K/3 |

```typescript
function getTerCategory(statusPTKP: string): 'A' | 'B' | 'C' {
  const mapping: Record<string, 'A' | 'B' | 'C'> = {
    'TK/0': 'A', 'TK/1': 'A', 'K/0': 'A',
    'TK/2': 'B', 'TK/3': 'B', 'K/1': 'B', 'K/2': 'B',
    'K/3': 'C',
  };
  return mapping[statusPTKP];
}
```

### 4.2 Langkah 2: Cocokkan Penghasilan Bruto Bulanan ke Tabel TER

Tabel TER berisi banyak lapisan (puluhan baris per kategori, dari 0% sampai ~34%), jadi **simpan sebagai tabel di database**, bukan hardcode if-else. Struktur tabel:

```sql
CREATE TABLE ter_rates (
  id SERIAL PRIMARY KEY,
  kategori CHAR(1) NOT NULL,        -- 'A', 'B', atau 'C'
  batas_bawah BIGINT NOT NULL,      -- penghasilan bruto bulanan, batas bawah
  batas_atas BIGINT,                -- batas atas (NULL = tidak terbatas)
  tarif DECIMAL(5,4) NOT NULL,      -- misal 0.0025 untuk 0.25%
  berlaku_sejak DATE NOT NULL       -- untuk histori jika rate berubah
);
```

```typescript
async function getTerRate(kategori: 'A' | 'B' | 'C', penghasilanBruto: number): Promise<number> {
  const row = await db.query(
    `SELECT tarif FROM ter_rates
     WHERE kategori = $1
       AND batas_bawah <= $2
       AND ($2 <= batas_atas OR batas_atas IS NULL)
       AND berlaku_sejak <= CURRENT_DATE
     ORDER BY berlaku_sejak DESC
     LIMIT 1`,
    [kategori, penghasilanBruto]
  );
  return row?.tarif ?? 0;
}

async function calculatePph21Bulanan(employee: Employee, penghasilanBruto: number): Promise<number> {
  const kategori = getTerCategory(employee.statusPTKP);
  const tarif = await getTerRate(kategori, penghasilanBruto);
  return Math.round(penghasilanBruto * tarif);
}
```

### 4.3 Langkah 3: Rekonsiliasi Bulan Desember (atau Bulan Terakhir Kerja)

Di masa pajak terakhir, hitung ulang PPh 21 **setahun penuh** pakai tarif progresif Pasal 17, lalu bandingkan dengan total yang sudah dipotong Jan–Nov via TER.

**Tarif progresif Pasal 17:**

| Lapisan PKP | Tarif |
|---|---|
| s.d. Rp60.000.000 | 5% |
| > Rp60.000.000 – Rp250.000.000 | 15% |
| > Rp250.000.000 – Rp500.000.000 | 25% |
| > Rp500.000.000 – Rp5.000.000.000 | 30% |
| > Rp5.000.000.000 | 35% |

```typescript
function calculatePph21Progresif(penghasilanKenaPajakSetahun: number): number {
  const brackets = [
    { max: 60_000_000, rate: 0.05 },
    { max: 250_000_000, rate: 0.15 },
    { max: 500_000_000, rate: 0.25 },
    { max: 5_000_000_000, rate: 0.30 },
    { max: Infinity, rate: 0.35 },
  ];

  let pajak = 0;
  let sisaPKP = penghasilanKenaPajakSetahun;
  let batasBawah = 0;

  for (const bracket of brackets) {
    if (sisaPKP <= 0) break;
    const lebar = bracket.max - batasBawah;
    const kenaPajakDiLapisanIni = Math.min(sisaPKP, lebar);
    pajak += kenaPajakDiLapisanIni * bracket.rate;
    sisaPKP -= kenaPajakDiLapisanIni;
    batasBawah = bracket.max;
  }

  return Math.round(pajak);
}

async function reconcileDecemberPph21(employee: Employee, totalBrutoSetahun: number, totalTerSudahDipotong: number) {
  const biayaJabatan = Math.min(totalBrutoSetahun * 0.05, 6_000_000); // maks 500rb/bulan x 12
  const iuranPensiunSetahun = employee.iuranPensiunTahunan ?? 0;
  const ptkpSetahun = getPtkpAmount(employee.statusPTKP); // dari tabel PTKP

  const penghasilanNettoSetahun = totalBrutoSetahun - biayaJabatan - iuranPensiunSetahun;
  const pkp = Math.max(0, penghasilanNettoSetahun - ptkpSetahun);

  const totalPajakSetahun = calculatePph21Progresif(pkp);
  const selisihDesember = totalPajakSetahun - totalTerSudahDipotong;

  return {
    totalPajakSetahun,
    totalTerSudahDipotong,
    pph21Desember: Math.max(0, selisihDesember), // yang dipotong di slip gaji Desember
  };
}
```

**Tabel PTKP (Penghasilan Tidak Kena Pajak) setahun** — juga simpan sebagai data konfigurasi, karena bisa berubah:

| Status | PTKP/tahun |
|---|---|
| TK/0 | Rp54.000.000 |
| TK/1, K/0 | Rp58.500.000 |
| TK/2, K/1 | Rp63.000.000 |
| TK/3, K/2 | Rp67.500.000 |
| K/3 | Rp72.000.000 |

---

## 5. Contoh Perhitungan End-to-End

**Kasus:** Karyawan status K/0 (kawin, tanpa tanggungan → kategori TER A), gaji pokok Rp8.000.000, tunjangan tetap Rp500.000, lembur 5 jam hari kerja biasa bulan ini.

```
1. Upah per jam    = 8.000.000 / 173 = 46.243
2. Lembur          = (1 jam × 1.5 × 46.243) + (4 jam × 2 × 46.243)
                    = 69.365 + 369.960 = 439.325 ≈ 439.000

3. Penghasilan Bruto = 8.000.000 + 500.000 + 439.000 = 8.939.000

4. BPJS Kesehatan (karyawan, 1%)      = 89.390
5. BPJS Ketenagakerjaan (karyawan, 3%) = 268.170
   (JHT 2% = 178.780, JP 1% = 89.390)

6. Kategori TER = A (status K/0)
   Cocokkan Rp8.939.000 ke tabel TER A → misal tarif 1.25% (contoh, harus dicek ke tabel resmi)
   PPh 21 = 8.939.000 × 1.25% ≈ 111.738

7. Gaji Bersih = 8.939.000 - 89.390 - 268.170 - 111.738
              = 8.469.702
```

*(Angka tarif TER pada langkah 6 adalah ilustrasi — nilai tarif per lapisan penghasilan harus diambil dari tabel resmi PMK 168/2023 yang sudah dimasukkan ke database, bukan ditebak.)*

---

## 6. Rekomendasi Unit Test

Buat test case ini sebagai baseline validasi (bandingkan hasil kalkulator dengan perhitungan manual/kalkulator pajak resmi):

```
✓ Karyawan gaji di bawah PTKP bulanan → PPh21 = 0
✓ Karyawan TER kategori A, B, C dengan gaji sama → hasil PPh21 harus beda
✓ Gaji di atas batas atas BPJS Kesehatan → dasar hitung capped di 12jt
✓ Gaji di atas batas atas JP → dasar hitung JP capped sesuai rate berlaku
✓ Lembur hari libur vs hari biasa → formula & hasil harus berbeda
✓ Karyawan resign di tengah tahun → rekonsiliasi PPh21 dihitung di bulan terakhir kerja, bukan Desember
✓ Prorata gaji pokok untuk karyawan yang masuk di tengah bulan
```

---

## 7. Pertimbangan Desain Tambahan

- **Historisasi rate**: Setiap tabel rate (TER, BPJS, PTKP) punya kolom `berlaku_sejak` supaya payroll bulan-bulan lama tetap bisa dihitung ulang/diaudit dengan rate yang berlaku saat itu, meski rate terbaru sudah berubah.
- **Admin panel untuk update rate**: Jangan biarkan developer yang update rate manual ke database tiap tahun — buat UI sederhana untuk Super Admin mengelola tabel rate ini.
- **Snapshot di payroll_details**: Setelah payroll di-lock/approve, simpan snapshot rate yang dipakai (bukan hanya reference ke tabel rate) supaya kalau rate berubah di masa depan, histori payroll lama tidak ikut berubah retroaktif.
- **Kelas risiko JKK per perusahaan**: Simpan sebagai company setting, karena berbeda-beda tergantung jenis usaha (misal kantor vs pabrik beda kelas risiko).
