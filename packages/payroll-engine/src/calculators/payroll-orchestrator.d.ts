import { Employee, AttendanceSummary, PayrollPeriod, BpjsKesehatanRates, BpjsKetenagakerjaanRates, TerRateRow, PtkpEntry, OtherDeduction, PayrollResult } from '../types.js';
export interface PayrollInput {
    employee: Employee;
    attendance: AttendanceSummary;
    period: PayrollPeriod;
    bpjsKesehatanRates: BpjsKesehatanRates;
    bpjsKetenagakerjaanRates: BpjsKetenagakerjaanRates;
    terTable: TerRateRow[];
    ptkpTable: PtkpEntry[];
    otherDeductions?: OtherDeduction[];
    totalBrutoYtd?: number;
    totalTerDeductedYtd?: number;
    totalIuranPensiunYtd?: number;
}
export declare function calculatePayroll(input: PayrollInput): PayrollResult;
