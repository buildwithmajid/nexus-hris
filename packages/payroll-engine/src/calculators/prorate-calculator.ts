/**
 * Menghitung prorata gaji pokok berdasarkan hari kerja aktual
 * @param baseSalary Gaji pokok bulanan penuh
 * @param workingDays Hari kerja aktual yang dihadiri karyawan
 * @param totalWorkingDays Total hari kerja dalam bulan tersebut
 */
export function prorateSalary(
  baseSalary: number,
  workingDays: number,
  totalWorkingDays: number
): number {
  if (workingDays >= totalWorkingDays) {
    return baseSalary;
  }
  return Math.round((baseSalary * workingDays) / totalWorkingDays);
}
