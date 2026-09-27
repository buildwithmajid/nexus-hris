import { StatusPTKP, TerKategori, TerRateRow, PtkpEntry, Pph21MonthlyResult, Pph21ReconciliationResult } from '../types.js';

/**
 * Mendapatkan Kategori TER berdasarkan Status PTKP (Sesuai PMK 168/2023)
 */
export function getTerCategory(statusPTKP: StatusPTKP): TerKategori {
  if (['TK/0', 'TK/1', 'K/0'].includes(statusPTKP)) return 'A';
  if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(statusPTKP)) return 'B';
  if (['K/3'].includes(statusPTKP)) return 'C';
  return 'A'; // default fallback
}

/**
 * Mencari tarif TER yang berlaku berdasarkan kategori dan penghasilan bruto
 */
export function lookupTerRate(
  kategori: TerKategori,
  grossIncome: number,
  terTable: TerRateRow[]
): number {
  const row = terTable.find(
    (r) =>
      r.kategori === kategori &&
      grossIncome >= r.batasBawah &&
      (r.batasAtas === null || grossIncome <= r.batasAtas)
  );
  return row ? row.tarif : 0;
}

/**
 * Menghitung PPh 21 bulanan menggunakan skema TER (Tarif Efektif Rata-Rata)
 */
export function calculatePph21Monthly(
  statusPTKP: StatusPTKP,
  grossIncome: number,
  terTable: TerRateRow[]
): Pph21MonthlyResult {
  const kategori = getTerCategory(statusPTKP);
  const tarif = lookupTerRate(kategori, grossIncome, terTable);
  const amount = Math.round(grossIncome * tarif);

  return {
    kategori,
    tarif,
    amount,
  };
}

/**
 * Menghitung pajak tahunan menggunakan tarif progresif Pasal 17 UU HPP
 */
export function calculatePph21Progressive(taxableIncome: number): number {
  let tax = 0;
  let remaining = Math.max(0, taxableIncome);

  // Lapis 1: 5% (0 - 60jt)
  if (remaining > 0) {
    const amount = Math.min(remaining, 60_000_000);
    tax += amount * 0.05;
    remaining -= amount;
  }
  // Lapis 2: 15% (60jt - 250jt)
  if (remaining > 0) {
    const amount = Math.min(remaining, 190_000_000);
    tax += amount * 0.15;
    remaining -= amount;
  }
  // Lapis 3: 25% (250jt - 500jt)
  if (remaining > 0) {
    const amount = Math.min(remaining, 250_000_000);
    tax += amount * 0.25;
    remaining -= amount;
  }
  // Lapis 4: 30% (500jt - 5M)
  if (remaining > 0) {
    const amount = Math.min(remaining, 4_500_000_000);
    tax += amount * 0.30;
    remaining -= amount;
  }
  // Lapis 5: 35% (> 5M)
  if (remaining > 0) {
    tax += remaining * 0.35;
  }

  return Math.round(tax);
}

/**
 * Mendapatkan nilai PTKP berdasarkan status
 */
export function getPtkpAmount(statusPTKP: StatusPTKP, ptkpTable: PtkpEntry[]): number {
  const entry = ptkpTable.find((e) => e.status === statusPTKP);
  return entry ? entry.amountPerYear : 54_000_000;
}

/**
 * Parameter untuk rekonsiliasi PPh 21 Desember
 */
interface ReconciliationParams {
  statusPTKP: StatusPTKP;
  totalBrutoAnnual: number;
  totalTerDeducted: number;
  iuranPensiunAnnual: number;
  ptkpTable: PtkpEntry[];
  terTable?: TerRateRow[];
}

/**
 * Melakukan rekonsiliasi PPh 21 untuk bulan Desember atau bulan terakhir bekerja
 */
export function reconcileDecemberPph21(params: ReconciliationParams): Pph21ReconciliationResult {
  const { statusPTKP, totalBrutoAnnual, totalTerDeducted, iuranPensiunAnnual, ptkpTable } = params;
  
  // Biaya Jabatan = 5% dari Bruto, maks 6.000.000 per tahun
  const biayaJabatan = Math.min(Math.round(totalBrutoAnnual * 0.05), 6_000_000);
  
  // Penghasilan Netto = Bruto - Biaya Jabatan - Iuran Pensiun/JHT
  const netto = totalBrutoAnnual - biayaJabatan - iuranPensiunAnnual;
  
  const ptkpAmount = getPtkpAmount(statusPTKP, ptkpTable);
  const pkp = Math.max(0, netto - ptkpAmount);
  
  // Bulatkan PKP ke ribuan ke bawah sesuai aturan pajak
  const pkpBulat = Math.floor(pkp / 1000) * 1000;
  
  const totalAnnualTax = calculatePph21Progressive(pkpBulat);
  const decemberAmount = Math.max(0, totalAnnualTax - totalTerDeducted);

  return {
    totalAnnualTax,
    totalTerDeducted,
    decemberAmount,
    biayaJabatan,
    ptkpAmount,
    pkp: pkpBulat
  };
}
