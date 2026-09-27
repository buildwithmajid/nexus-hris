import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/** Parameter query untuk list karyawan */
interface FindAllQuery {
  page?: number;
  limit?: number;
  /** Pencarian berdasarkan NIK (16 digit) atau nama lengkap */
  search?: string;
  departmentId?: string;
  ptkp?: string;
}

/**
 * Controller untuk mengelola data karyawan.
 * Semua endpoint dilindungi dengan sistem izin berbasis permission.
 */
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * Mengambil daftar karyawan dengan pagination dan pencarian.
   * Query: ?page=1&limit=20&search=xxx&companyId=uuid&departmentId=uuid&ptkp=K/1
   * Membutuhkan izin: employee.read
   */
  @Get()
  @RequirePermissions('employee.read')
  findAll(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query() query: FindAllQuery,
  ) {
    return this.employeeService.findAll(companyId, {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      search: query.search,
      departmentId: query.departmentId,
      ptkp: query.ptkp,
    });
  }

  /**
   * Mengambil data profil karyawan yang sedang login (Self-service).
   */
  @Get('me')
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.employeeService.findByUserId(userId);
  }

  /**
   * Mengambil detail satu karyawan berdasarkan ID.
   * Field sensitif (NIK, rekening, NPWP) akan didekripsi.
   * Membutuhkan izin: employee.read
   */
  @Get(':id')
  @RequirePermissions('employee.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  /**
   * Membuat data karyawan baru.
   * Field sensitif otomatis dienkripsi sebelum disimpan.
   * Membutuhkan izin: employee.create
   */
  @Post()
  @RequirePermissions('employee.create')
  create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.employeeService.create(dto, userId);
  }

  /**
   * Memperbarui data karyawan.
   * Perubahan gaji pokok, jabatan, atau departemen otomatis dicatat di riwayat.
   * Membutuhkan izin: employee.update
   */
  @Patch(':id')
  @RequirePermissions('employee.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.employeeService.update(id, dto, userId);
  }

  /**
   * Menonaktifkan karyawan (soft delete).
   * Status karyawan diubah menjadi TERMINATED, data tidak dihapus permanen.
   * Membutuhkan izin: employee.delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('employee.delete')
  softDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.employeeService.softDelete(id, userId);
  }
}
