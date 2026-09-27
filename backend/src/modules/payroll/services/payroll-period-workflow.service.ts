import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PayrollPeriod, PayrollStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayrollPeriodDto } from '../dto/create-period.dto';

@Injectable()
export class PayrollPeriodWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async createPeriod(dto: CreatePayrollPeriodDto, userId: string): Promise<PayrollPeriod> {
    const existing = await this.prisma.payrollPeriod.findUnique({
      where: {
        companyId_month_year: {
          companyId: dto.companyId,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Periode penggajian untuk bulan ${dto.month}/${dto.year} di perusahaan ini sudah dibuat`,
      );
    }

    return this.prisma.payrollPeriod.create({
      data: {
        companyId: dto.companyId,
        month: dto.month,
        year: dto.year,
        status: PayrollStatus.DRAFT,
        processedById: userId,
      },
    });
  }

  async findPeriods(companyId: string, year?: number) {
    return this.prisma.payrollPeriod.findMany({
      where: {
        companyId,
        ...(year ? { year } : {}),
      },
      include: {
        processedBy: { select: { id: true, email: true } },
        approvedBy: { select: { id: true, email: true } },
        _count: { select: { payrollDetails: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getPeriodDetail(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        company: { select: { id: true, name: true } },
        processedBy: { select: { id: true, email: true } },
        approvedBy: { select: { id: true, email: true } },
        payrollDetails: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                fullName: true,
                maritalStatusPtkp: true,
                department: { select: { name: true } },
                position: { select: { title: true } },
              },
            },
          },
          orderBy: { employee: { fullName: 'asc' } },
        },
      },
    });

    if (!period) {
      throw new NotFoundException(`Periode penggajian dengan ID ${periodId} tidak ditemukan`);
    }

    const summary = period.payrollDetails.reduce(
      (acc, curr) => ({
        totalGross: acc.totalGross + Number(curr.grossIncome),
        totalPph21: acc.totalPph21 + Number(curr.pph21Amount),
        totalBpjsEmployee:
          acc.totalBpjsEmployee +
          Number(curr.bpjsKesehatanEmployee) +
          Number(curr.bpjsTkEmployee),
        totalNet: acc.totalNet + Number(curr.netSalary),
      }),
      { totalGross: 0, totalPph21: 0, totalBpjsEmployee: 0, totalNet: 0 },
    );

    return {
      period,
      summary,
    };
  }

  async submitPeriod(periodId: string, userId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { _count: { select: { payrollDetails: true } } },
    });

    if (!period) throw new NotFoundException('Periode tidak ditemukan');
    if (period._count.payrollDetails === 0) {
      throw new BadRequestException('Kalkulasi payroll harus dijalankan sebelum diajukan');
    }
    if (period.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException('Hanya periode berstatus DRAFT yang dapat diajukan');
    }

    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.PENDING_APPROVAL,
        processedById: userId,
      },
    });
  }

  async approvePeriod(periodId: string, userId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) throw new NotFoundException('Periode tidak ditemukan');
    if (period.status !== PayrollStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Hanya periode PENDING_APPROVAL yang dapat disetujui');
    }

    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.APPROVED,
        approvedById: userId,
      },
    });
  }

  async lockPeriod(periodId: string, userId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) throw new NotFoundException('Periode tidak ditemukan');
    if (period.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException('Periode harus di-APPROVED terlebih dahulu sebelum dikunci');
    }

    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.LOCKED,
        lockedAt: new Date(),
        approvedById: userId,
      },
    });
  }
}
