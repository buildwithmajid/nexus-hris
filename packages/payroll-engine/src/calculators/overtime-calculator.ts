import { OvertimeEntry, OvertimeResult, OvertimeEntryResult } from '../types.js';

/**
 * Menghitung lembur berdasarkan Kepmenaker 102/2004
 * @param baseSalary Gaji pokok untuk dasar perhitungan
 * @param entries Data lembur per hari
 * @param hourlyDivisor Pembagi untuk nilai sejam (default 173)
 */
export function calculateOvertime(
  baseSalary: number,
  entries: OvertimeEntry[],
  hourlyDivisor: number = 173
): OvertimeResult {
  const hourlyRate = baseSalary / hourlyDivisor;
  let totalAmount = 0;
  const details: OvertimeEntryResult[] = [];

  for (const entry of entries) {
    let multiplierTotal = 0;
    
    if (entry.isHoliday) {
      // Hari libur
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
    } else {
      // Hari kerja biasa
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
