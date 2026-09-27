"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePayroll = calculatePayroll;
const prorate_calculator_js_1 = require("./prorate-calculator.js");
const overtime_calculator_js_1 = require("./overtime-calculator.js");
const bpjs_calculator_js_1 = require("./bpjs-calculator.js");
const pph21_calculator_js_1 = require("./pph21-calculator.js");
function calculatePayroll(input) {
    const { employee, attendance, period, bpjsKesehatanRates, bpjsKetenagakerjaanRates, terTable, ptkpTable, otherDeductions = [] } = input;
    const proratedSalary = (0, prorate_calculator_js_1.prorateSalary)(employee.baseSalary, attendance.workingDays, attendance.totalWorkingDays);
    const fixedAllowance = employee.fixedAllowance || 0;
    const overtime = (0, overtime_calculator_js_1.calculateOvertime)(employee.baseSalary, attendance.overtimeEntries);
    const grossIncome = proratedSalary + fixedAllowance + overtime.total;
    const bpjsKesehatan = (0, bpjs_calculator_js_1.calculateBpjsKesehatan)(grossIncome, bpjsKesehatanRates);
    const bpjsKetenagakerjaan = (0, bpjs_calculator_js_1.calculateBpjsKetenagakerjaan)(grossIncome, bpjsKetenagakerjaanRates);
    let pph21;
    let pph21Amount = 0;
    if (period.isLastPeriod) {
        const totalBrutoAnnual = (input.totalBrutoYtd || 0) + grossIncome;
        const totalTerDeducted = input.totalTerDeductedYtd || 0;
        const iuranPensiunBulanan = bpjsKetenagakerjaan.breakdown.jhtEmployee + bpjsKetenagakerjaan.breakdown.jpEmployee;
        const totalIuranPensiunAnnual = (input.totalIuranPensiunYtd || 0) + iuranPensiunBulanan;
        pph21 = (0, pph21_calculator_js_1.reconcileDecemberPph21)({
            statusPTKP: employee.statusPTKP,
            totalBrutoAnnual,
            totalTerDeducted,
            iuranPensiunAnnual: totalIuranPensiunAnnual,
            ptkpTable,
            terTable
        });
        pph21Amount = pph21.decemberAmount;
    }
    else {
        pph21 = (0, pph21_calculator_js_1.calculatePph21Monthly)(employee.statusPTKP, grossIncome, terTable);
        pph21Amount = pph21.amount;
    }
    const totalOtherDeductions = otherDeductions.reduce((sum, ded) => sum + ded.amount, 0);
    const totalDeductions = bpjsKesehatan.employee +
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
//# sourceMappingURL=payroll-orchestrator.js.map