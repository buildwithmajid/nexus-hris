import { Controller, Get, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Mengambil Ringkasan Eksekutif Payroll, Beban Perusahaan, Pajak PPh 21, dan Presensi
   * Query: ?companyId=uuid&month=9&year=2026
   */
  @Get('executive-summary')
  @RequirePermissions('report.read')
  getExecutiveSummary(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const m = month ? Number(month) : new Date().getMonth() + 1;
    const y = year ? Number(year) : new Date().getFullYear();
    return this.reportsService.getExecutiveSummary(companyId, m, y);
  }

  /**
   * Mengambil Tren Beban Penggajian Tahunan (Januari - Desember)
   * Query: ?companyId=uuid&year=2026
   */
  @Get('cost-trend')
  @RequirePermissions('report.read')
  getCostTrend(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('year') year?: string,
  ) {
    const y = year ? Number(year) : new Date().getFullYear();
    return this.reportsService.getCostTrend(companyId, y);
  }
}

