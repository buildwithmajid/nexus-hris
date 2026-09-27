import { describe, it, expect } from 'vitest';
import { calculatePayroll } from '../calculators/payroll-orchestrator.js';
import type { Employee, AttendanceSummary, PayrollPeriod, BpjsKesehatanRates, BpjsKetenagakerjaanRates, TerRateRow, PtkpEntry } from '../types.js';

import terRatesData from '../rules/pph21-ter.rates.json' with { type: 'json' };
import ptkpRatesData from '../rules/ptkp.rates.json' with { type: 'json' };
import bpjsRatesData from '../rules/bpjs.rates.json' with { type: 'json' };

const terTable = terRatesData as TerRateRow[];
const ptkpTable = ptkpRatesData as PtkpEntry[];
const bpjsRates = bpjsRatesData as {
  kesehatan: BpjsKesehatanRates;
  ketenagakerjaan: BpjsKetenagakerjaanRates;
};

describe('Payroll Orchestrator', () => {
  const employee: Employee = {
    id: 'emp-001',
    fullName: 'Ahmad Fauzi',
    statusPTKP: 'K/0',
    baseSalary: 8_000_000,
    fixedAllowance: 500_000,
    joinDate: '2024-01-15',
  };

  const attendance: AttendanceSummary = {
    workingDays: 22,
    totalWorkingDays: 22,
    alphaCount: 0,
    overtimeEntries: [
      { date: '2026-09-05', hours: 5, isHoliday: false },
    ],
  };

  const period: PayrollPeriod = { month: 9, year: 2026, isLastPeriod: false };

  it('End-to-end spec example', () => {
    const result = calculatePayroll({
      employee,
      attendance,
      period,
      bpjsKesehatanRates: bpjsRates.kesehatan,
      bpjsKetenagakerjaanRates: bpjsRates.ketenagakerjaan,
      terTable,
      ptkpTable
    });

    const expectedOvertime = Math.round((1 * 1.5 + 4 * 2) * (8000000 / 173)); // 439306
    const expectedGross = 8000000 + 500000 + expectedOvertime; // 8939306
    expect(result.grossIncome).toBe(expectedGross);

    const bpjsKesEmployee = Math.round(expectedGross * 0.01); // 89393
    const jhtEmployee = Math.round(expectedGross * 0.02); // 178786
    const jpEmployee = Math.round(expectedGross * 0.01); // 89393
    const totalBpjsTkEmployee = jhtEmployee + jpEmployee; // 268179

    const expectedPph21 = Math.round(expectedGross * 0.0175); // 156438

    const expectedNet = expectedGross - bpjsKesEmployee - totalBpjsTkEmployee - expectedPph21; // 8425296

    expect(result.pph21Amount).toBe(expectedPph21);
    expect(result.netSalary).toBe(expectedNet);
  });

  it('Tanpa lembur', () => {
    const result = calculatePayroll({
      employee,
      attendance: { ...attendance, overtimeEntries: [] },
      period,
      bpjsKesehatanRates: bpjsRates.kesehatan,
      bpjsKetenagakerjaanRates: bpjsRates.ketenagakerjaan,
      terTable,
      ptkpTable
    });

    expect(result.overtime.total).toBe(0);
    expect(result.grossIncome).toBe(8500000);
  });

  it('Dengan other deductions', () => {
    const result = calculatePayroll({
      employee,
      attendance,
      period,
      bpjsKesehatanRates: bpjsRates.kesehatan,
      bpjsKetenagakerjaanRates: bpjsRates.ketenagakerjaan,
      terTable,
      ptkpTable,
      otherDeductions: [{ name: 'Kasbon', amount: 500000 }]
    });

    const expectedOvertime = Math.round((1 * 1.5 + 4 * 2) * (8000000 / 173));
    const expectedGross = 8000000 + 500000 + expectedOvertime;
    const bpjsKesEmployee = Math.round(expectedGross * 0.01);
    const jhtEmployee = Math.round(expectedGross * 0.02);
    const jpEmployee = Math.round(expectedGross * 0.01);
    const totalBpjsTkEmployee = jhtEmployee + jpEmployee;
    const expectedPph21 = Math.round(expectedGross * 0.0175);
    const expectedNet = expectedGross - bpjsKesEmployee - totalBpjsTkEmployee - expectedPph21 - 500000;

    expect(result.netSalary).toBe(expectedNet);
  });

  it('Desember reconciliation', () => {
    const result = calculatePayroll({
      employee,
      attendance: { ...attendance, overtimeEntries: [] },
      period: { month: 12, year: 2026, isLastPeriod: true },
      bpjsKesehatanRates: bpjsRates.kesehatan,
      bpjsKetenagakerjaanRates: bpjsRates.ketenagakerjaan,
      terTable,
      ptkpTable,
      totalBrutoYtd: 93500000, // 8.5jt x 11 bulan
      totalTerDeductedYtd: 1358500, // 8.5jt x 11 x 0.0145
      totalIuranPensiunYtd: 2805000, // jht+jp = 3% * 8.5jt = 255rb * 11
    });

    expect(result.pph21Amount).toBeDefined();
    expect(result.netSalary).toBeDefined();
    expect(typeof result.pph21Amount).toBe('number');
    // Pastikan pph21 reconciliation menghasilkan angka valid (bukan NaN)
    expect(Number.isNaN(result.pph21Amount)).toBe(false);
    expect(result.netSalary).toBeLessThan(result.grossIncome);
  });

  it('Employee tanpa fixedAllowance (falsy branch)', () => {
    const empNoAllowance: Employee = {
      ...employee,
      fixedAllowance: 0,
    };
    const result = calculatePayroll({
      employee: empNoAllowance,
      attendance: { ...attendance, overtimeEntries: [] },
      period,
      bpjsKesehatanRates: bpjsRates.kesehatan,
      bpjsKetenagakerjaanRates: bpjsRates.ketenagakerjaan,
      terTable,
      ptkpTable,
    });

    expect(result.fixedAllowance).toBe(0);
    expect(result.grossIncome).toBe(8_000_000);
  });

  it('Prorate gaji — karyawan masuk di tengah bulan', () => {
    const result = calculatePayroll({
      employee,
      attendance: { ...attendance, workingDays: 15, overtimeEntries: [] },
      period,
      bpjsKesehatanRates: bpjsRates.kesehatan,
      bpjsKetenagakerjaanRates: bpjsRates.ketenagakerjaan,
      terTable,
      ptkpTable,
    });

    const expectedProrate = Math.round(8_000_000 * 15 / 22);
    expect(result.proratedSalary).toBe(expectedProrate);
    expect(result.grossIncome).toBe(expectedProrate + 500_000);
  });
});
