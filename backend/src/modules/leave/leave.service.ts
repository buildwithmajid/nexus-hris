import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { AttendanceStatus, EmploymentStatus, LeaveRequestStatus } from '@prisma/client';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Menginisialisasi tipe cuti standar Republik Indonesia jika belum ada
   */
  async ensureDefaultLeaveTypes() {
    const count = await this.prisma.leaveType.count();
    if (count === 0) {
      this.logger.log('Inisialisasi tipe cuti standar Indonesia...');
      await this.prisma.leaveType.createMany({
        data: [
          {
            name: 'Cuti Tahunan',
            defaultQuotaDays: 12,
            isPaid: true,
            requiresDocument: false,
          },
          {
            name: 'Cuti Sakit',
            defaultQuotaDays: 14,
            isPaid: true,
            requiresDocument: true,
          },
          {
            name: 'Cuti Menikah',
            defaultQuotaDays: 3,
            isPaid: true,
            requiresDocument: false,
          },
          {
            name: 'Cuti Melahirkan',
            defaultQuotaDays: 90,
            isPaid: true,
            requiresDocument: true,
          },
          {
            name: 'Cuti Tanpa Upah (Unpaid Leave)',
            defaultQuotaDays: 0,
            isPaid: false,
            requiresDocument: false,
          },
        ],
      });
    }
  }

  /**
   * Mengambil seluruh tipe cuti yang tersedia
   */
  async getLeaveTypes() {
    await this.ensureDefaultLeaveTypes();
    return this.prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Helper internal: Ambil employee untuk user yang sedang login
   */
  private async getEmployeeForUser(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new NotFoundException('Profil data karyawan tidak terhubung dengan akun user ini');
    }
    return employee;
  }

  /**
   * Memastikan setiap karyawan aktif memiliki saldo cuti tahunan
   */
  async ensureLeaveBalances(companyId: string, year: number) {
    await this.ensureDefaultLeaveTypes();
    const annualLeaveType = await this.prisma.leaveType.findFirst({
      where: { name: 'Cuti Tahunan' },
    });
    if (!annualLeaveType) return;

    const employees = await this.prisma.employee.findMany({
      where: { companyId, employmentStatus: EmploymentStatus.ACTIVE },
    });

    for (const emp of employees) {
      await this.prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: emp.id,
            leaveTypeId: annualLeaveType.id,
            year,
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          leaveTypeId: annualLeaveType.id,
          year,
          quotaDays: annualLeaveType.defaultQuotaDays,
          usedDays: 0,
        },
      });
    }
  }

  /**
   * Mengambil saldo cuti seluruh karyawan di perusahaan (Untuk HR / Finance)
   */
  async getLeaveBalances(companyId: string, year: number) {
    await this.ensureLeaveBalances(companyId, year);
    return this.prisma.leaveBalance.findMany({
      where: {
        employee: { companyId },
        year,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
        leaveType: true,
      },
      orderBy: { employee: { fullName: 'asc' } },
    });
  }

  /**
   * Mengambil saldo cuti milik user yang login (Self-Service)
   */
  async getMyLeaveBalances(userId: string, year: number) {
    const employee = await this.getEmployeeForUser(userId);
    await this.ensureLeaveBalances(employee.companyId, year);

    return this.prisma.leaveBalance.findMany({
      where: {
        employeeId: employee.id,
        year,
      },
      include: {
        leaveType: true,
      },
    });
  }

  /**
   * Mengajukan permohonan cuti baru
   */
  async createLeaveRequest(userId: string, dto: CreateLeaveRequestDto) {
    const userEmployee = await this.getEmployeeForUser(userId);
    // Jika dto.employeeId dikirimkan, pastikan sama dengan ID karyawan pengetik
    const targetEmployeeId = (dto.employeeId && dto.employeeId === userEmployee.id)
      ? dto.employeeId
      : userEmployee.id;

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start) {
      throw new BadRequestException('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
    }

    return this.prisma.leaveRequest.create({
      data: {
        employeeId: targetEmployeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays: dto.totalDays,
        reason: dto.reason,
        status: LeaveRequestStatus.PENDING,
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            fullName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  /**
   * Mengambil antrean pengajuan cuti untuk persetujuan HR / Finance
   */
  async getLeaveRequests(companyId: string, year?: number) {
    const filter = year
      ? {
          gte: new Date(Date.UTC(year, 0, 1)),
          lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
        }
      : undefined;

    return this.prisma.leaveRequest.findMany({
      where: {
        employee: { companyId },
        ...(filter ? { startDate: filter } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mengambil riwayat pengajuan cuti milik user yang login (Self-Service)
   */
  async getMyLeaveRequests(userId: string, year?: number) {
    const employee = await this.getEmployeeForUser(userId);
    const filter = year
      ? {
          gte: new Date(Date.UTC(year, 0, 1)),
          lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
        }
      : undefined;

    return this.prisma.leaveRequest.findMany({
      where: {
        employeeId: employee.id,
        ...(filter ? { startDate: filter } : {}),
      },
      include: {
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Menyetujui pengajuan cuti (Status -> APPROVED)
   * Mengurangi saldo cuti & SINKRONISASI OTOMATIS ke tabel presensi (status ON_LEAVE / SICK)
   */
  async approveLeaveRequest(id: string, reviewerId?: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true, employee: true },
    });

    if (!request) {
      throw new NotFoundException(`Pengajuan cuti dengan ID ${id} tidak ditemukan`);
    }

    if (request.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException('Hanya pengajuan cuti berstatus PENDING yang dapat disetujui');
    }

    const currentYear = request.startDate.getFullYear();

    return this.prisma.$transaction(async (tx) => {
      // 1. Update status pengajuan cuti menjadi APPROVED
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: { status: LeaveRequestStatus.APPROVED },
        include: { leaveType: true, employee: true },
      });

      // 2. Update saldo cuti terpakai (usedDays) jika cuti kuota
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year: currentYear,
          },
        },
      });

      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            usedDays: {
              increment: Number(request.totalDays),
            },
          },
        });
      }

      // 3. SINKRONISASI OTOMATIS KE TABEL PRESENSI (ATTENDANCE)
      const isSick = request.leaveType.name.toLowerCase().includes('sakit');
      const attendanceStatus: AttendanceStatus = isSick
        ? AttendanceStatus.SICK
        : AttendanceStatus.ON_LEAVE;

      // Iterasi setiap tanggal hari kerja (Senin - Jumat) dalam rentang cuti
      const curDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      while (curDate <= endDate) {
        const dayOfWeek = curDate.getUTCDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const targetDate = new Date(
            Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate()),
          );

          await tx.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: request.employeeId,
                date: targetDate,
              },
            },
            update: {
              status: attendanceStatus,
              notes: `Cuti Disetujui: ${request.leaveType.name}`,
            },
            create: {
              employeeId: request.employeeId,
              date: targetDate,
              status: attendanceStatus,
              notes: `Cuti Disetujui: ${request.leaveType.name}`,
            },
          });
        }
        curDate.setUTCDate(curDate.getUTCDate() + 1);
      }

      this.logger.log(
        `Cuti '${request.leaveType.name}' karyawan ${request.employee.fullName} berhasil disetujui & disinkronkan ke presensi secara atomik.`,
      );

      return updated;
    });
  }

  /**
   * Menolak pengajuan cuti (Status -> REJECTED)
   */
  async rejectLeaveRequest(id: string, reviewerId?: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Pengajuan cuti dengan ID ${id} tidak ditemukan`);
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveRequestStatus.REJECTED },
      include: { leaveType: true, employee: true },
    });
  }
}
