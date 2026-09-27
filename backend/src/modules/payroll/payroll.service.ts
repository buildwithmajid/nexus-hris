import { Injectable, NotFoundException } from '@nestjs/common';
import { ComponentType, EmploymentStatus, PayrollStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollPeriodDto } from './dto/create-period.dto';
import { CalculateBatchPayrollDto } from './dto/calculate-batch.dto';
import { PayrollPeriodWorkflowService } from './services/payroll-period-workflow.service';
import { PayrollCalculationService } from './services/payroll-calculation.service';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly periodWorkflow: PayrollPeriodWorkflowService,
    private readonly calculation: PayrollCalculationService,
  ) {}

  async createPeriod(dto: CreatePayrollPeriodDto, userId: string) {
    return this.periodWorkflow.createPeriod(dto, userId);
  }

  async findPeriods(companyId: string, year?: number) {
    return this.periodWorkflow.findPeriods(companyId, year);
  }

  async getPeriodDetail(periodId: string) {
    return this.periodWorkflow.getPeriodDetail(periodId);
  }

  async calculateBatch(periodId: string, dto: CalculateBatchPayrollDto, userId: string) {
    return this.calculation.calculateBatch(periodId, dto, userId);
  }

  async submitPeriod(periodId: string, userId: string) {
    return this.periodWorkflow.submitPeriod(periodId, userId);
  }

  async approvePeriod(periodId: string, userId: string) {
    return this.periodWorkflow.approvePeriod(periodId, userId);
  }

  async lockPeriod(periodId: string, userId: string) {
    return this.periodWorkflow.lockPeriod(periodId, userId);
  }

  async getEmployeeSlip(periodId: string, employeeId: string) {
    const detail = await this.prisma.payrollDetail.findUnique({
      where: {
        payrollPeriodId_employeeId: {
          payrollPeriodId: periodId,
          employeeId,
        },
      },
      include: {
        payrollPeriod: {
          select: {
            month: true,
            year: true,
            status: true,
            company: { select: { name: true, address: true } },
          },
        },
        employee: {
          select: {
            employeeCode: true,
            fullName: true,
            maritalStatusPtkp: true,
            bankName: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
        payrollComponents: true,
      },
    });

    if (!detail) {
      throw new NotFoundException('Slip gaji tidak ditemukan untuk karyawan pada periode ini');
    }

    const earnings = detail.payrollComponents.filter(
      (c) => c.componentType === ComponentType.EARNING,
    );
    const deductions = detail.payrollComponents.filter(
      (c) => c.componentType === ComponentType.DEDUCTION,
    );

    return {
      detail,
      earnings,
      deductions,
    };
  }

  async getMySlip(userId: string, periodId?: string) {
    let employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    // Fallback demo: jika user adalah admin yang menguji role staff, ambil employee aktif
    if (!employee) {
      employee = await this.prisma.employee.findFirst({
        where: { employmentStatus: EmploymentStatus.ACTIVE },
      });
    }

    if (!employee) {
      throw new NotFoundException('Data karyawan untuk akun Anda tidak ditemukan');
    }

    if (periodId) {
      return this.getEmployeeSlip(periodId, employee.id);
    }

    // Ambil slip periode terbaru yang sudah APPROVED atau LOCKED
    const latestDetail = await this.prisma.payrollDetail.findFirst({
      where: {
        employeeId: employee.id,
        payrollPeriod: {
          status: { in: [PayrollStatus.APPROVED, PayrollStatus.LOCKED] },
        },
      },
      orderBy: {
        payrollPeriod: {
          year: 'desc',
        },
      },
    });

    if (!latestDetail) {
      throw new NotFoundException('Belum ada slip gaji yang dirilis untuk Anda');
    }

    return this.getEmployeeSlip(latestDetail.payrollPeriodId, employee.id);
  }
}
