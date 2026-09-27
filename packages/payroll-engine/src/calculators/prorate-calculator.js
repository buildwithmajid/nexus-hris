"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prorateSalary = prorateSalary;
function prorateSalary(baseSalary, workingDays, totalWorkingDays) {
    if (workingDays >= totalWorkingDays) {
        return baseSalary;
    }
    return Math.round((baseSalary * workingDays) / totalWorkingDays);
}
//# sourceMappingURL=prorate-calculator.js.map