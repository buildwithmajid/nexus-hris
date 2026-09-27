import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  /**
   * Mengambil semua jenis cuti yang tersedia
   */
  @Get('types')
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  /**
   * Mengambil rekap saldo cuti seluruh karyawan di perusahaan (Admin/HR View)
   */
  @Get('balances')
  @RequirePermissions('leave.read')
  getLeaveBalances(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getLeaveBalances(
      companyId,
      year ? Number(year) : new Date().getFullYear(),
    );
  }

  /**
   * Mengambil saldo cuti milik user yang sedang login (Self-Service)
   */
  @Get('my-balances')
  getMyLeaveBalances(
    @CurrentUser('sub') userId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getMyLeaveBalances(
      userId,
      year ? Number(year) : new Date().getFullYear(),
    );
  }

  /**
   * Mengambil antrean pengajuan cuti perusahaan untuk diverifikasi (Admin/HR View)
   */
  @Get('requests')
  @RequirePermissions('leave.read')
  getLeaveRequests(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getLeaveRequests(
      companyId,
      year ? Number(year) : undefined,
    );
  }

  /**
   * Mengambil riwayat pengajuan cuti milik user yang login (Self-Service)
   */
  @Get('my-requests')
  getMyLeaveRequests(
    @CurrentUser('sub') userId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getMyLeaveRequests(
      userId,
      year ? Number(year) : undefined,
    );
  }

  /**
   * Mengajukan cuti baru (Self-Service atau Admin atas nama sendiri)
   */
  @Post('requests')
  createLeaveRequest(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.createLeaveRequest(userId, dto);
  }

  /**
   * Menyetujui pengajuan cuti (HR / Atasan)
   */
  @Patch('requests/:id/approve')
  @RequirePermissions('leave.approve')
  approveLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') reviewerId: string,
  ) {
    return this.leaveService.approveLeaveRequest(id, reviewerId);
  }

  /**
   * Menolak pengajuan cuti
   */
  @Patch('requests/:id/reject')
  @RequirePermissions('leave.approve')
  rejectLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') reviewerId: string,
  ) {
    return this.leaveService.rejectLeaveRequest(id, reviewerId);
  }
}

