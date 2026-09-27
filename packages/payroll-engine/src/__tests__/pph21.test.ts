import { describe, it, expect } from 'vitest';
import {
  getTerCategory,
  lookupTerRate,
  calculatePph21Monthly,
  calculatePph21Progressive,
  getPtkpAmount,
  reconcileDecemberPph21
} from '../calculators/pph21-calculator.js';
import type { TerRateRow, PtkpEntry } from '../types.js';
import terRatesData from '../rules/pph21-ter.rates.json' with { type: 'json' };
import ptkpRatesData from '../rules/ptkp.rates.json' with { type: 'json' };

const terTable = terRatesData as TerRateRow[];
const ptkpTable = ptkpRatesData as PtkpEntry[];

describe('PPh21 Calculator', () => {
  it('getTerCategory', () => {
    expect(getTerCategory('TK/0')).toBe('A');
    expect(getTerCategory('TK/1')).toBe('A');
    expect(getTerCategory('K/0')).toBe('A');
    expect(getTerCategory('TK/2')).toBe('B');
    expect(getTerCategory('TK/3')).toBe('B');
    expect(getTerCategory('K/1')).toBe('B');
    expect(getTerCategory('K/2')).toBe('B');
    expect(getTerCategory('K/3')).toBe('C');
  });

  it('lookupTerRate', () => {
    const miniTerTable: TerRateRow[] = [
      { kategori: 'A', batasBawah: 0, batasAtas: 5400000, tarif: 0 },
      { kategori: 'A', batasBawah: 5400001, batasAtas: 5650000, tarif: 0.0025 },
      { kategori: 'A', batasBawah: 8550001, batasAtas: 9650000, tarif: 0.0175 },
      { kategori: 'A', batasBawah: 1400000001, batasAtas: null, tarif: 0.34 },
    ];
    
    expect(lookupTerRate('A', 5000000, miniTerTable)).toBe(0);
    expect(lookupTerRate('A', 5500000, miniTerTable)).toBe(0.0025);
    expect(lookupTerRate('A', 9000000, miniTerTable)).toBe(0.0175);
    expect(lookupTerRate('A', 2000000000, miniTerTable)).toBe(0.34);
  });

  it('calculatePph21Monthly', () => {
    // statusPTKP 'K/0', grossIncome 8939000 dengan terTable lengkap
    const result = calculatePph21Monthly('K/0', 8939000, terTable);
    expect(result.kategori).toBe('A');
    expect(result.tarif).toBe(0.0175);
    expect(result.amount).toBe(Math.round(8939000 * 0.0175)); // 156433
  });

  it('calculatePph21Monthly gaji kecil', () => {
    const result = calculatePph21Monthly('TK/0', 4000000, terTable);
    expect(result.tarif).toBe(0);
    expect(result.amount).toBe(0);
  });

  it('calculatePph21Progressive', () => {
    expect(calculatePph21Progressive(50000000)).toBe(2500000); // 50jt * 5%
    expect(calculatePph21Progressive(100000000)).toBe(9000000); // 60jt*5% + 40jt*15%
    expect(calculatePph21Progressive(0)).toBe(0);
    expect(calculatePph21Progressive(300000000)).toBe(44000000); // 60jt*5% + 190jt*15% + 50jt*25%
  });

  it('calculatePph21Progressive bracket 4 dan 5', () => {
    // PKP 600jt → masuk bracket 4 (30%)
    // 60jt*5% + 190jt*15% + 250jt*25% + 100jt*30% = 3jt + 28.5jt + 62.5jt + 30jt = 124jt
    expect(calculatePph21Progressive(600_000_000)).toBe(124_000_000);

    // PKP 6M → masuk bracket 5 (35%)
    // 60jt*5% + 190jt*15% + 250jt*25% + 4500jt*30% + 1000jt*35%
    // = 3jt + 28.5jt + 62.5jt + 1350jt + 350jt = 1794jt
    expect(calculatePph21Progressive(6_000_000_000)).toBe(1_794_000_000);

    // Negatif → 0
    expect(calculatePph21Progressive(-100000)).toBe(0);
  });

  it('lookupTerRate tidak ditemukan → return 0', () => {
    // Kategori yang tidak ada di tabel
    expect(lookupTerRate('B', 5000000, [
      { kategori: 'A', batasBawah: 0, batasAtas: 5400000, tarif: 0 },
    ])).toBe(0);
  });

  it('getPtkpAmount', () => {
    expect(getPtkpAmount('TK/0', ptkpTable)).toBe(54000000);
    expect(getPtkpAmount('K/3', ptkpTable)).toBe(72000000);
  });

  it('reconcileDecemberPph21', () => {
    const result = reconcileDecemberPph21({
      totalBrutoAnnual: 120000000,
      totalTerDeducted: 2500000,
      statusPTKP: 'TK/0',
      iuranPensiunAnnual: 1200000,
      ptkpTable
    });
    
    expect(result).toBeDefined();
    expect(result.ptkpAmount).toBe(54000000);
    // Biaya Jabatan 5% * 120jt = 6jt
    expect(result.biayaJabatan).toBe(6000000);
    // Netto = 120jt - 6jt - 1.2jt = 112,800,000
    // PKP = Netto - 54jt = 58,800,000
    // Pajak Setahun = 60jt*5% (krn di bawah 60jt) -> 58,800,000 * 5% = 2,940,000
    expect(result.pkp).toBe(58800000);
    expect(result.totalAnnualTax).toBe(2940000);
    // December Amount = 2,940,000 - 2,500,000 = 440,000
    expect(result.decemberAmount).toBe(440000);
  });
});
