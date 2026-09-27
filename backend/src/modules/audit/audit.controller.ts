import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Mengambil daftar log audit aktivitas sistem
   * Query: ?page=1&limit=20&action=UPDATE&tableName=employees&search=xxx
   */
  @Get()
  @RequirePermissions('config.manage')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('tableName') tableName?: string,
    @Query('search') search?: string,
  ) {
    return this.auditService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      action,
      tableName,
      search,
    });
  }

  /**
   * Mengambil ringkasan statistik keamanan & kepatuhan audit
   */
  @Get('stats')
  @RequirePermissions('config.manage')
  getStats() {
    return this.auditService.getStats();
  }
}

