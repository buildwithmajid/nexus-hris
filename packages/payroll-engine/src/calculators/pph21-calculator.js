"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTerCategory = getTerCategory;
exports.lookupTerRate = lookupTerRate;
exports.calculatePph21Monthly = calculatePph21Monthly;
exports.calculatePph21Progressive = calculatePph21Progressive;
exports.getPtkpAmount = getPtkpAmount;
exports.reconcileDecemberPph21 = reconcileDecemberPph21;
function getTerCategory(statusPTKP) {
    if (['TK/0', 'TK/1', 'K/0'].includes(statusPTKP))
        return 'A';
    if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(statusPTKP))
        return 'B';
    if (['K/3'].includes(statusPTKP))
        return 'C';
    return 'A';
}
function lookupTerRate(kategori, grossIncome, terTable) {
    const row = terTable.find((r) => r.kategori === kategori &&
        grossIncome >= r.batasBawah &&
        (r.batasAtas === null || grossIncome <= r.batasAtas));
    return row ? row.tarif : 0;
}
function calculatePph21Monthly(statusPTKP, grossIncome, terTable) {
    const kategori = getTerCategory(statusPTKP);
    const tarif = lookupTerRate(kategori, grossIncome, terTable);
    const amount = Math.round(grossIncome * tarif);
    return {
        kategori,
        tarif,
        amount,
    };
}
function calculatePph21Progressive(taxableIncome) {
    let tax = 0;
    let remaining = Math.max(0, taxableIncome);
    if (remaining > 0) {
        const amount = Math.min(remaining, 60_000_000);
        tax += amount * 0.05;
        remaining -= amount;
    }
    if (remaining > 0) {
        const amount = Math.min(remaining, 190_000_000);
        tax += amount * 0.15;
        remaining -= amount;
    }
    if (remaining > 0) {
        const amount = Math.min(remaining, 250_000_000);
        tax += amount * 0.25;
        remaining -= amount;
    }
    if (remaining > 0) {
        const amount = Math.min(remaining, 4_500_000_000);
        tax += amount * 0.30;
        remaining -= amount;
    }
    if (remaining > 0) {
        tax += remaining * 0.35;
    }
    return Math.round(tax);
}
function getPtkpAmount(statusPTKP, ptkpTable) {
    const entry = ptkpTable.find((e) => e.status === statusPTKP);
    return entry ? entry.amountPerYear : 54_000_000;
}
function reconcileDecemberPph21(params) {
    const { statusPTKP, totalBrutoAnnual, totalTerDeducted, iuranPensiunAnnual, ptkpTable } = params;
    const biayaJabatan = Math.min(Math.round(totalBrutoAnnual * 0.05), 6_000_000);
    const netto = totalBrutoAnnual - biayaJabatan - iuranPensiunAnnual;
    const ptkpAmount = getPtkpAmount(statusPTKP, ptkpTable);
    const pkp = Math.max(0, netto - ptkpAmount);
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
//# sourceMappingURL=pph21-calculator.js.map