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
import { PayrollService } from './payroll.service';
import { CreatePayrollPeriodDto } from './dto/create-period.dto';
import { CalculateBatchPayrollDto } from './dto/calculate-batch.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  /**
   * Membuat periode penggajian baru (Status: DRAFT).
   * Izin: payroll.run
   */
  @Post('periods')
  @RequirePermissions('payroll.run')
  createPeriod(
    @Body() dto: CreatePayrollPeriodDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.payrollService.createPeriod(dto, userId);
  }

  /**
   * Mengambil daftar periode penggajian untuk sebuah perusahaan.
   * Izin: payroll.read
   */
  @Get('periods')
  @RequirePermissions('payroll.read')
  findPeriods(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('year') year?: string,
  ) {
    return this.payrollService.findPeriods(companyId, year ? Number(year) : undefined);
  }

  /**
   * Mengambil detail dan rekapitulasi penggajian suatu periode.
   * Izin: payroll.read
   */
  @Get('periods/:id')
  @RequirePermissions('payroll.read')
  getPeriodDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.getPeriodDetail(id);
  }

  /**
   * Menjalankan kalkulasi batch payroll untuk periode tersebut.
   * Izin: payroll.run
   * Rate limited: 10 eksekusi per menit untuk melindungi beban komputasi
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('periods/:id/calculate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll.run')
  calculateBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CalculateBatchPayrollDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.payrollService.calculateBatch(id, dto, userId);
  }

  /**
   * Mengajukan periode penggajian ke tahap verifikasi (DRAFT -> PENDING_APPROVAL).
   * Izin: payroll.run
   */
  @Post('periods/:id/submit')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll.run')
  submitPeriod(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.payrollService.submitPeriod(id, userId);
  }

  /**
   * Menyetujui periode penggajian (PENDING_APPROVAL -> APPROVED).
   * Izin: payroll.approve (Finance/Management)
   */
  @Post('periods/:id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll.approve')
  approvePeriod(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.payrollService.approvePeriod(id, userId);
  }

  /**
   * Mengunci periode penggajian secara permanen (APPROVED -> LOCKED).
   * Izin: payroll.lock (Finance/Super Admin)
   */
  @Post('periods/:id/lock')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll.lock')
  lockPeriod(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.payrollService.lockPeriod(id, userId);
  }

  /**
   * Mengambil slip gaji resmi karyawan tertentu pada periode ini.
   * Izin: payroll.read
   */
  @Get('periods/:id/slips/:employeeId')
  @RequirePermissions('payroll.read')
  getEmployeeSlip(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.payrollService.getEmployeeSlip(id, employeeId);
  }

  /**
   * Mengambil slip gaji karyawan yang sedang login (Self-service untuk staff).
   * Tidak membutuhkan permission khusus, cukup login sebagai karyawan.
   */
  @Get('my-slip')
  getMySlip(
    @CurrentUser('sub') userId: string,
    @Query('periodId') periodId?: string,
  ) {
    return this.payrollService.getMySlip(userId, periodId);
  }
}

