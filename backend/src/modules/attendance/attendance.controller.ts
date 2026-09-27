import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { LogAttendanceDto } from './dto/log-attendance.dto';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Mengambil riwayat absensi milik user sendiri (Self-Service)
   */
  @Get('my-logs')
  getMyLogs(
    @CurrentUser('sub') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.findMyAttendance(
      userId,
      month ? Number(month) : new Date().getMonth() + 1,
      year ? Number(year) : new Date().getFullYear(),
    );
  }

  /**
   * Clock-in mandiri oleh karyawan hari ini (Self-Service)
   */
  @Post('my-clock')
  @HttpCode(HttpStatus.OK)
  myClock(
    @CurrentUser('sub') userId: string,
    @Body('status') status?: any,
    @Body('notes') notes?: string,
  ) {
    return this.attendanceService.myClock(userId, status, notes);
  }

  /**
   * Mengambil riwayat pengajuan lembur milik user sendiri (Self-Service)
   */
  @Get('my-overtime')
  getMyOvertime(
    @CurrentUser('sub') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.findMyOvertime(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  /**
   * Mengambil daftar kehadiran karyawan bulanan
   */
  @Get()
  @RequirePermissions('attendance.read')
  findAttendance(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.findAttendance(
      companyId,
      month ? Number(month) : new Date().getMonth() + 1,
      year ? Number(year) : new Date().getFullYear(),
    );
  }

  /**
   * Mencatat absensi karyawan
   */
  @Post('log')
  @RequirePermissions('attendance.correct')
  logAttendance(@Body() dto: LogAttendanceDto) {
    return this.attendanceService.logAttendance(dto);
  }

  /**
   * Membuat simulasi presensi satu bulan penuh untuk seluruh karyawan aktif
   */
  @Post('simulate-month')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('attendance.correct')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  simulateMonthlyAttendance(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.simulateMonthlyAttendance(
      companyId,
      month ? Number(month) : new Date().getMonth() + 1,
      year ? Number(year) : new Date().getFullYear(),
    );
  }

  /**
   * Mengambil daftar entri lembur
   */
  @Get('overtime')
  @RequirePermissions('attendance.read')
  findOvertime(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.findOvertime(
      companyId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  /**
   * Mengajukan lembur baru
   */
  @Post('overtime')
  @RequirePermissions('attendance.read')
  createOvertime(@Body() dto: CreateOvertimeDto) {
    return this.attendanceService.createOvertime(dto);
  }

  /**
   * Menyetujui lembur
   */
  @Patch('overtime/:id/approve')
  @RequirePermissions('attendance.correct')
  approveOvertime(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.approveOvertime(id);
  }

  /**
   * Menolak lembur
   */
  @Patch('overtime/:id/reject')
  @RequirePermissions('attendance.correct')
  rejectOvertime(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.rejectOvertime(id);
  }
}

