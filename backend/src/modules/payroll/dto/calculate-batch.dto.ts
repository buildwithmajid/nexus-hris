import { IsArray, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CalculateBatchPayrollDto {
  /**
   * Jika diberikan, hanya karyawan dalam daftar ID ini yang akan dihitung.
   * Jika tidak diberikan, semua karyawan aktif di perusahaan akan dihitung.
   */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Setiap ID Karyawan harus berupa UUID yang valid' })
  employeeIds?: string[];

  /**
   * Jumlah hari kerja standar dalam sebulan (default: 22 hari).
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  totalWorkingDays?: number;
}

