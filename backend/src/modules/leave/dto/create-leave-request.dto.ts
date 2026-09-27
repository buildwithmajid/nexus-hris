import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsUUID()
  leaveTypeId: string;

  @IsDateString()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  endDate: string; // YYYY-MM-DD

  @IsNumber()
  @IsPositive()
  @Min(0.5, { message: 'Minimal durasi cuti adalah 0.5 hari' })
  @Max(90, { message: 'Maksimal durasi cuti adalah 90 hari' })
  totalDays: number;

  @IsString()
  @MinLength(3, { message: 'Alasan cuti minimal 3 karakter' })
  reason: string;
}
