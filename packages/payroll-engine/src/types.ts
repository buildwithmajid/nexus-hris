// === Input Types ===

export type StatusPTKP = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
export type TerKategori = 'A' | 'B' | 'C';
export type RoundingStrategy = 'round' | 'ceil' | 'floor';

export interface Employee {
  id: string;
  fullName: string;
  statusPTKP: StatusPTKP;
  baseSalary: number;       // gaji pokok bulanan
  fixedAllowance: number;   // tunjangan tetap bulanan
  joinDate: string;         // ISO date string
  resignDate?: string;      // ISO date string, nullable
}

export interface OvertimeEntry {
  date: string;
  hours: number;
  isHoliday: boolean;
}

export interface AttendanceSummary {
  workingDays: number;      // hari kerja aktual karyawan bulan ini
  totalWorkingDays: number; // total hari kerja dalam bulan
  alphaCount: number;       // hari tidak hadir tanpa keterangan
  overtimeEntries: OvertimeEntry[];
}

export interface PayrollPeriod {
  month: number;            // 1-12
  year: number;
  isLastPeriod: boolean;    // true jika Desember atau bulan terakhir kerja
}

// === Rate/Config Types ===

export interface TerRateRow {
  kategori: TerKategori;
  batasBawah: number;
  batasAtas: number | null; // null = tidak terbatas
  tarif: number;            // desimal, misal 0.0175 untuk 1.75%
}

export interface PtkpEntry {
  status: StatusPTKP;
  amountPerYear: number;
}

export interface BpjsKesehatanRates {
  companyPercent: number;   // 0.04
  employeePercent: number;  // 0.01
  wageCap: number;          // 12_000_000
}

export interface BpjsKetenagakerjaanRates {
  jht: { companyPercent: number; employeePercent: number };
  jkk: { companyPercent: number };
  jkm: { companyPercent: number };
  jp: { companyPercent: number; employeePercent: number; wageCap: number };
}

export interface OvertimeRule {
  isHoliday: boolean;
  hourFrom: number;
  hourTo: number | null;  // null = sisa jam
  multiplier: number;
}

// === Output Types ===

export interface OvertimeResult {
  total: number;
  details: OvertimeEntryResult[];
}

export interface OvertimeEntryResult {
  date: string;
  hours: number;
  isHoliday: boolean;
  amount: number;
}

export interface BpjsKesehatanResult {
  company: number;
  employee: number;
}

export interface BpjsKetenagakerjaanResult {
  company: number;
  employee: number;
  breakdown: {
    jhtCompany: number;
    jhtEmployee: number;
    jkkCompany: number;
    jkmCompany: number;
    jpCompany: number;
    jpEmployee: number;
  };
}

export interface Pph21MonthlyResult {
  kategori: TerKategori;
  tarif: number;
  amount: number;
}

export interface Pph21ReconciliationResult {
  totalAnnualTax: number;
  totalTerDeducted: number;
  decemberAmount: number;
  biayaJabatan: number;
  ptkpAmount: number;
  pkp: number;
}

export interface OtherDeduction {
  name: string;
  amount: number;
}

export interface PayrollResult {
  employeeId: string;
  employeeName: string;
  period: PayrollPeriod;
  baseSalary: number;
  proratedSalary: number;
  fixedAllowance: number;
  overtime: OvertimeResult;
  grossIncome: number;
  bpjsKesehatan: BpjsKesehatanResult;
  bpjsKetenagakerjaan: BpjsKetenagakerjaanResult;
  pph21: Pph21MonthlyResult | Pph21ReconciliationResult;
  pph21Amount: number;
  otherDeductions: OtherDeduction[];
  totalOtherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}
