import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogAttendanceDto } from './dto/log-attendance.dto';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { AttendanceStatus, OvertimeStatus, EmploymentStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil daftar kehadiran karyawan pada periode/bulan tertentu
   */
  async findAttendance(companyId: string, month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    return this.prisma.attendance.findMany({
      where: {
        employee: { companyId },
        date: { gte: startDate, lte: endDate },
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
      },
      orderBy: [{ date: 'desc' }, { employee: { fullName: 'asc' } }],
    });
  }

  /**
   * Mencatat satu entri presensi
   */
  async logAttendance(dto: LogAttendanceDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${dto.employeeId} tidak ditemukan`);
    }

    const attendanceDate = new Date(dto.date);

    return this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date: attendanceDate,
        },
      },
      update: {
        status: dto.status,
        notes: dto.notes,
      },
      create: {
        employeeId: dto.employeeId,
        date: attendanceDate,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  /**
   * Mengisi presensi simulasi untuk seluruh karyawan aktif dalam 1 bulan
   * Berguna untuk testing dan verifikasi penggajian instan
   */
  async simulateMonthlyAttendance(companyId: string, month: number, year: number) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, employmentStatus: EmploymentStatus.ACTIVE },
    });

    if (employees.length === 0) {
      throw new BadRequestException('Tidak ada karyawan aktif pada perusahaan ini');
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    let totalGenerated = 0;

    for (const emp of employees) {
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(Date.UTC(year, month - 1, day));
        const dayOfWeek = currentDate.getUTCDay();

        // Lewati Sabtu (6) dan Minggu (0)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Status acak realistis: 95% PRESENT, 3% LATE, 2% PERMIT
        let status: AttendanceStatus = AttendanceStatus.PRESENT;
        const rand = Math.random();
        if (rand > 0.98) {
          status = AttendanceStatus.PERMIT;
        } else if (rand > 0.95) {
          status = AttendanceStatus.LATE;
        }

        await this.prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: emp.id,
              date: currentDate,
            },
          },
          update: { status },
          create: {
            employeeId: emp.id,
            date: currentDate,
            status,
            notes: 'Simulasi Sistem Nexus HRIS',
          },
        });
        totalGenerated++;
      }
    }

    this.logger.log(`Simulasi presensi selesai: ${totalGenerated} log dihasilkan`);
    return {
      message: `Berhasil membuat ${totalGenerated} data presensi simulasi untuk bulan ${month}/${year}`,
      totalRecords: totalGenerated,
    };
  }

  /**
   * Mengambil daftar lembur karyawan
   */
  async findOvertime(companyId: string, month?: number, year?: number) {
    const dateFilter =
      month && year
        ? {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lte: new Date(Date.UTC(year, month, 0, 23, 59, 59)),
          }
        : undefined;

    return this.prisma.overtimeEntry.findMany({
      where: {
        employee: { companyId },
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            baseSalary: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Mengajukan entri lembur baru
   */
  async createOvertime(dto: CreateOvertimeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${dto.employeeId} tidak ditemukan`);
    }

    return this.prisma.overtimeEntry.create({
      data: {
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        hours: dto.hours,
        isHoliday: dto.isHoliday,
        status: OvertimeStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  /**
   * Menyetujui lembur (Status -> APPROVED)
   */
  async approveOvertime(id: string) {
    const ot = await this.prisma.overtimeEntry.findUnique({ where: { id } });
    if (!ot) {
      throw new NotFoundException(`Data lembur dengan ID ${id} tidak ditemukan`);
    }

    return this.prisma.overtimeEntry.update({
      where: { id },
      data: { status: OvertimeStatus.APPROVED },
      include: {
        employee: { select: { fullName: true } },
      },
    });
  }

  /**
   * Menolak lembur (Status -> REJECTED)
   */
  async rejectOvertime(id: string) {
    const ot = await this.prisma.overtimeEntry.findUnique({ where: { id } });
    if (!ot) {
      throw new NotFoundException(`Data lembur dengan ID ${id} tidak ditemukan`);
    }

    return this.prisma.overtimeEntry.update({
      where: { id },
      data: { status: OvertimeStatus.REJECTED },
      include: {
        employee: { select: { fullName: true } },
      },
    });
  }

  /**
   * Helper internal: Ambil data employee untuk userId login
   */
  private async getEmployeeForUser(userId: string) {
    let employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      employee = await this.prisma.employee.findFirst({
        where: { employmentStatus: EmploymentStatus.ACTIVE },
      });
    }
    if (!employee) {
      throw new NotFoundException('Data karyawan tidak ditemukan');
    }
    return employee;
  }

  /**
   * Mengambil riwayat absensi milik user sendiri (Self-Service)
   */
  async findMyAttendance(userId: string, month: number, year: number) {
    const employee = await this.getEmployeeForUser(userId);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    return this.prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Clock-in mandiri oleh karyawan hari ini (Self-Service)
   */
  async myClock(
    userId: string,
    status: AttendanceStatus = AttendanceStatus.PRESENT,
    notes?: string,
  ) {
    const employee = await this.getEmployeeForUser(userId);
    const today = new Date();
    const todayDate = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );

    return this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: todayDate,
        },
      },
      update: {
        status,
        notes: notes || 'Presensi Mandiri via ESS Portal',
        clockInTime: today,
      },
      create: {
        employeeId: employee.id,
        date: todayDate,
        status,
        notes: notes || 'Presensi Mandiri via ESS Portal',
        clockInTime: today,
      },
    });
  }

  /**
   * Mengambil riwayat pengajuan lembur milik user sendiri (Self-Service)
   */
  async findMyOvertime(userId: string, month?: number, year?: number) {
    const employee = await this.getEmployeeForUser(userId);
    const dateFilter =
      month && year
        ? {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lte: new Date(Date.UTC(year, month, 0, 23, 59, 59)),
          }
        : undefined;

    return this.prisma.overtimeEntry.findMany({
      where: {
        employeeId: employee.id,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }
}

