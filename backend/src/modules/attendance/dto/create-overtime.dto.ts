import { IsBoolean, IsDateString, IsNumber, IsPositive, IsUUID, Max, Min } from 'class-validator';

export class CreateOvertimeDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsNumber()
  @IsPositive()
  @Min(0.5, { message: 'Minimal durasi lembur adalah 0.5 jam' })
  @Max(14, { message: 'Maksimal durasi lembur adalah 14 jam per hari' })
  hours: number;

  @IsBoolean()
  isHoliday: boolean;
}

