import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

/**
 * Controller untuk mengelola struktur organisasi:
 * perusahaan, departemen, dan jabatan
 */
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ─── Perusahaan ─────────────────────────────────────────────────────────────

  /**
   * Membuat perusahaan baru.
   * Membutuhkan izin: config.manage
   */
  @Post('companies')
  @RequirePermissions('config.manage')
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.organizationService.createCompany(dto);
  }

  /**
   * Mengambil daftar seluruh perusahaan.
   * Membutuhkan izin: employee.read
   */
  @Get('companies')
  @RequirePermissions('employee.read')
  findAllCompanies() {
    return this.organizationService.findAllCompanies();
  }

  // ─── Departemen ─────────────────────────────────────────────────────────────

  /**
   * Membuat departemen baru di dalam perusahaan.
   * Membutuhkan izin: config.manage
   */
  @Post('departments')
  @RequirePermissions('config.manage')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationService.createDepartment(dto);
  }

  /**
   * Mengambil semua departemen milik perusahaan tertentu.
   * Membutuhkan izin: employee.read
   */
  @Get('companies/:companyId/departments')
  @RequirePermissions('employee.read')
  findDepartmentsByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return this.organizationService.findDepartmentsByCompany(companyId);
  }

  // ─── Jabatan ─────────────────────────────────────────────────────────────────

  /**
   * Membuat jabatan baru di dalam departemen.
   * Membutuhkan izin: config.manage
   */
  @Post('positions')
  @RequirePermissions('config.manage')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.organizationService.createPosition(dto);
  }

  /**
   * Mengambil semua jabatan yang ada di dalam departemen tertentu.
   * Membutuhkan izin: employee.read
   */
  @Get('departments/:departmentId/positions')
  @RequirePermissions('employee.read')
  findPositionsByDepartment(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
  ) {
    return this.organizationService.findPositionsByDepartment(departmentId);
  }
}
