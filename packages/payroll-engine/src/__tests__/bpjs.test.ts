import { describe, it, expect } from 'vitest';
import { calculateBpjsKesehatan, calculateBpjsKetenagakerjaan } from '../calculators/bpjs-calculator.js';
import type { BpjsKesehatanRates, BpjsKetenagakerjaanRates } from '../types.js';

describe('BPJS Calculator', () => {
  const kesehatanRates: BpjsKesehatanRates = { companyPercent: 0.04, employeePercent: 0.01, wageCap: 12_000_000 };
  const tkRates: BpjsKetenagakerjaanRates = {
    jht: { companyPercent: 0.037, employeePercent: 0.02 },
    jkk: { companyPercent: 0.0024 },
    jkm: { companyPercent: 0.003 },
    jp: { companyPercent: 0.02, employeePercent: 0.01, wageCap: 10_042_300 },
  };

  describe('Kesehatan', () => {
    it('Gaji 8jt (di bawah cap)', () => {
      const result = calculateBpjsKesehatan(8000000, kesehatanRates);
      expect(result.company).toBe(320000);
      expect(result.employee).toBe(80000);
    });

    it('Gaji 15jt (di atas cap)', () => {
      const result = calculateBpjsKesehatan(15000000, kesehatanRates);
      expect(result.company).toBe(480000); // 12jt * 0.04
      expect(result.employee).toBe(120000); // 12jt * 0.01
    });

    it('Gaji tepat 12jt', () => {
      const result = calculateBpjsKesehatan(12000000, kesehatanRates);
      expect(result.company).toBe(480000);
      expect(result.employee).toBe(120000);
    });
  });

  describe('Ketenagakerjaan', () => {
    it('Gaji 8jt (di bawah JP cap)', () => {
      const result = calculateBpjsKetenagakerjaan(8000000, tkRates);
      expect(result.breakdown.jhtCompany).toBe(296000);
      expect(result.breakdown.jhtEmployee).toBe(160000);
      expect(result.breakdown.jkkCompany).toBe(19200);
      expect(result.breakdown.jkmCompany).toBe(24000);
      expect(result.breakdown.jpCompany).toBe(160000);
      expect(result.breakdown.jpEmployee).toBe(80000);
      
      expect(result.company).toBe(296000 + 19200 + 24000 + 160000);
      expect(result.employee).toBe(160000 + 80000);
    });

    it('Gaji 15jt (di atas JP cap)', () => {
      const result = calculateBpjsKetenagakerjaan(15000000, tkRates);
      expect(result.breakdown.jpCompany).toBe(Math.round(10042300 * 0.02)); // 200846
      expect(result.breakdown.jpEmployee).toBe(Math.round(10042300 * 0.01)); // 100423
    });

    it('Verify breakdown sum = company + employee totals', () => {
      const result = calculateBpjsKetenagakerjaan(8000000, tkRates);
      const companySum = result.breakdown.jhtCompany + result.breakdown.jkkCompany + result.breakdown.jkmCompany + result.breakdown.jpCompany;
      const employeeSum = result.breakdown.jhtEmployee + result.breakdown.jpEmployee;
      
      expect(result.company).toBe(companySum);
      expect(result.employee).toBe(employeeSum);
    });
  });
});
