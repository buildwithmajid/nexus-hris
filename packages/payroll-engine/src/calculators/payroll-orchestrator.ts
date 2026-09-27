import { 
  Employee, 
  AttendanceSummary, 
  PayrollPeriod, 
  BpjsKesehatanRates, 
  BpjsKetenagakerjaanRates, 
  TerRateRow, 
  PtkpEntry, 
  OtherDeduction, 
  PayrollResult 
} from '../types.js';

import { prorateSalary } from './prorate-calculator.js';
import { calculateOvertime } from './overtime-calculator.js';
import { calculateBpjsKesehatan, calculateBpjsKetenagakerjaan } from './bpjs-calculator.js';
import { calculatePph21Monthly, reconcileDecemberPph21 } from './pph21-calculator.js';

export interface PayrollInput {
  employee: Employee;
  attendance: AttendanceSummary;
  period: PayrollPeriod;
  bpjsKesehatanRates: BpjsKesehatanRates;
  bpjsKetenagakerjaanRates: BpjsKetenagakerjaanRates;
  terTable: TerRateRow[];
  ptkpTable: PtkpEntry[];
  otherDeductions?: OtherDeduction[];
  // Untuk rekonsiliasi Desember
  totalBrutoYtd?: number;        // bruto Jan-Nov
  totalTerDeductedYtd?: number;  // total PPh21 TER sudah dipotong Jan-Nov
  totalIuranPensiunYtd?: number; // total iuran pensiun (JP + JHT Karyawan) Jan-Nov
}

/**
 * Fungsi utama untuk menjalankan perhitungan payroll lengkap (Orchestrator)
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const {
    employee,
    attendance,
    period,
    bpjsKesehatanRates,
    bpjsKetenagakerjaanRates,
    terTable,
    ptkpTable,
    otherDeductions = []
  } = input;

  // 1. Prorasi Gaji Pokok
  const proratedSalary = prorateSalary(
    employee.baseSalary,
    attendance.workingDays,
    attendance.totalWorkingDays
  );

  // 2. Tunjangan Tetap (Tidak diprorate)
  const fixedAllowance = employee.fixedAllowance || 0;

  // 3. Hitung Lembur
  const overtime = calculateOvertime(employee.baseSalary, attendance.overtimeEntries);

  // 4. Gross Income Bulan Ini
  const grossIncome = proratedSalary + fixedAllowance + overtime.total;

  // 5. BPJS Kesehatan
  const bpjsKesehatan = calculateBpjsKesehatan(grossIncome, bpjsKesehatanRates);

  // 6. BPJS Ketenagakerjaan
  const bpjsKetenagakerjaan = calculateBpjsKetenagakerjaan(grossIncome, bpjsKetenagakerjaanRates);

  // 7. Perhitungan PPh 21
  let pph21;
  let pph21Amount = 0;

  if (period.isLastPeriod) {
    // Rekonsiliasi Akhir Tahun / Resign
    const totalBrutoAnnual = (input.totalBrutoYtd || 0) + grossIncome;
    const totalTerDeducted = input.totalTerDeductedYtd || 0;
    
    // Iuran Pensiun / JHT Karyawan untuk pengurang pajak
    const iuranPensiunBulanan = bpjsKetenagakerjaan.breakdown.jhtEmployee + bpjsKetenagakerjaan.breakdown.jpEmployee;
    const totalIuranPensiunAnnual = (input.totalIuranPensiunYtd || 0) + iuranPensiunBulanan;

    pph21 = reconcileDecemberPph21({
      statusPTKP: employee.statusPTKP,
      totalBrutoAnnual,
      totalTerDeducted,
      iuranPensiunAnnual: totalIuranPensiunAnnual,
      ptkpTable,
      terTable
    });
    
    pph21Amount = pph21.decemberAmount;
  } else {
    // PPh 21 Bulanan dengan skema TER
    pph21 = calculatePph21Monthly(employee.statusPTKP, grossIncome, terTable);
    pph21Amount = pph21.amount;
  }

  // 8. Other Deductions
  const totalOtherDeductions = otherDeductions.reduce((sum, ded) => sum + ded.amount, 0);

  // 9. Perhitungan Net Salary
  const totalDeductions = 
    bpjsKesehatan.employee + 
    bpjsKetenagakerjaan.employee + 
    pph21Amount + 
    totalOtherDeductions;

  const netSalary = grossIncome - totalDeductions;

  return {
    employeeId: employee.id,
    employeeName: employee.fullName,
    period,
    baseSalary: employee.baseSalary,
    proratedSalary,
    fixedAllowance,
    overtime,
    grossIncome,
    bpjsKesehatan,
    bpjsKetenagakerjaan,
    pph21,
    pph21Amount,
    otherDeductions,
    totalOtherDeductions,
    totalDeductions,
    netSalary
  };
}
