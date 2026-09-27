import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class LogAttendanceDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

