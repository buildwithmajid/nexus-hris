"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOvertime = calculateOvertime;
function calculateOvertime(baseSalary, entries, hourlyDivisor = 173) {
    const hourlyRate = baseSalary / hourlyDivisor;
    let totalAmount = 0;
    const details = [];
    for (const entry of entries) {
        let multiplierTotal = 0;
        if (entry.isHoliday) {
            if (entry.hours > 0) {
                const h1 = Math.min(entry.hours, 8);
                multiplierTotal += h1 * 2.0;
            }
            if (entry.hours > 8) {
                const h2 = Math.min(entry.hours - 8, 1);
                multiplierTotal += h2 * 3.0;
            }
            if (entry.hours > 9) {
                const h3 = entry.hours - 9;
                multiplierTotal += h3 * 4.0;
            }
        }
        else {
            if (entry.hours > 0) {
                const h1 = Math.min(entry.hours, 1);
                multiplierTotal += h1 * 1.5;
            }
            if (entry.hours > 1) {
                const h2 = entry.hours - 1;
                multiplierTotal += h2 * 2.0;
            }
        }
        const amount = Math.round(hourlyRate * multiplierTotal);
        totalAmount += amount;
        details.push({
            date: entry.date,
            hours: entry.hours,
            isHoliday: entry.isHoliday,
            amount
        });
    }
    return {
        total: totalAmount,
        details
    };
}
//# sourceMappingURL=overtime-calculator.js.map