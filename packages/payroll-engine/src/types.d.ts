export type StatusPTKP = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
export type TerKategori = 'A' | 'B' | 'C';
export type RoundingStrategy = 'round' | 'ceil' | 'floor';
export interface Employee {
    id: string;
    fullName: string;
    statusPTKP: StatusPTKP;
    baseSalary: number;
    fixedAllowance: number;
    joinDate: string;
    resignDate?: string;
}
export interface OvertimeEntry {
    date: string;
    hours: number;
    isHoliday: boolean;
}
export interface AttendanceSummary {
    workingDays: number;
    totalWorkingDays: number;
    alphaCount: number;
    overtimeEntries: OvertimeEntry[];
}
export interface PayrollPeriod {
    month: number;
    year: number;
    isLastPeriod: boolean;
}
export interface TerRateRow {
    kategori: TerKategori;
    batasBawah: number;
    batasAtas: number | null;
    tarif: number;
}
export interface PtkpEntry {
    status: StatusPTKP;
    amountPerYear: number;
}
export interface BpjsKesehatanRates {
    companyPercent: number;
    employeePercent: number;
    wageCap: number;
}
export interface BpjsKetenagakerjaanRates {
    jht: {
        companyPercent: number;
        employeePercent: number;
    };
    jkk: {
        companyPercent: number;
    };
    jkm: {
        companyPercent: number;
    };
    jp: {
        companyPercent: number;
        employeePercent: number;
        wageCap: number;
    };
}
export interface OvertimeRule {
    isHoliday: boolean;
    hourFrom: number;
    hourTo: number | null;
    multiplier: number;
}
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
