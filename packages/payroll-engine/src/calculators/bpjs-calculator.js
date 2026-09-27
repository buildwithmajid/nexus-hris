"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBpjsKesehatan = calculateBpjsKesehatan;
exports.calculateBpjsKetenagakerjaan = calculateBpjsKetenagakerjaan;
function calculateBpjsKesehatan(grossIncome, rates) {
    const baseAmount = Math.min(grossIncome, rates.wageCap);
    return {
        company: Math.round(baseAmount * rates.companyPercent),
        employee: Math.round(baseAmount * rates.employeePercent)
    };
}
function calculateBpjsKetenagakerjaan(grossIncome, rates) {
    const jhtCompany = Math.round(grossIncome * rates.jht.companyPercent);
    const jhtEmployee = Math.round(grossIncome * rates.jht.employeePercent);
    const jkkCompany = Math.round(grossIncome * rates.jkk.companyPercent);
    const jkmCompany = Math.round(grossIncome * rates.jkm.companyPercent);
    const jpBaseAmount = Math.min(grossIncome, rates.jp.wageCap);
    const jpCompany = Math.round(jpBaseAmount * rates.jp.companyPercent);
    const jpEmployee = Math.round(jpBaseAmount * rates.jp.employeePercent);
    const totalCompany = jhtCompany + jkkCompany + jkmCompany + jpCompany;
    const totalEmployee = jhtEmployee + jpEmployee;
    return {
        company: totalCompany,
        employee: totalEmployee,
        breakdown: {
            jhtCompany,
            jhtEmployee,
            jkkCompany,
            jkmCompany,
            jpCompany,
            jpEmployee
        }
    };
}
//# sourceMappingURL=bpjs-calculator.js.map