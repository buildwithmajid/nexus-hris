import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsUUID('4', { message: 'ID Perusahaan tidak valid' })
  companyId: string;

  @IsInt({ message: 'Bulan harus berupa angka 1-12' })
  @Min(1, { message: 'Bulan minimal 1 (Januari)' })
  @Max(12, { message: 'Bulan maksimal 12 (Desember)' })
  month: number;

  @IsInt({ message: 'Tahun harus berupa angka' })
  @Min(2020, { message: 'Tahun minimal 2020' })
  @Max(2100, { message: 'Tahun maksimal 2100' })
  year: number;
}

