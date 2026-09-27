import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ComponentType, EmploymentStatus, PayrollStatus, Prisma } from '@prisma/client';
import { calculatePayroll, PayrollInput, StatusPTKP } from '@nexus-hris/payroll-engine';
import { PrismaService } from '../../prisma/prisma.service';
import { PayrollRateLoaderService } from '../helpers/payroll-rate-loader.service';
import { CalculateBatchPayrollDto } from '../dto/calculate-batch.dto';

@Injectable()
export class PayrollCalculationService {
  private readonly logger = new Logger(PayrollCalculationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLoader: PayrollRateLoaderService,
  ) {}

  async calculateBatch(periodId: string, dto: CalculateBatchPayrollDto, userId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException(`Periode penggajian dengan ID ${periodId} tidak ditemukan`);
    }

    if (period.status === PayrollStatus.LOCKED) {
      throw new BadRequestException(
        'Periode telah DIKUNCI (LOCKED) dan tidak dapat dikalkulasi ulang demi kepatuhan audit.',
      );
    }

    if (period.status === PayrollStatus.APPROVED) {
      throw new BadRequestException(
        'Periode telah DISETUJUI (APPROVED). Kembalikan ke DRAFT jika ingin mengkalkulasi ulang.',
      );
    }

    const [terTable, ptkpTable, bpjsKesRates, bpjsTkRates] = await this.rateLoader.loadAllRates();

    const employees = await this.prisma.employee.findMany({
      where: {
        companyId: period.companyId,
        employmentStatus: EmploymentStatus.ACTIVE,
        ...(dto.employeeIds && dto.employeeIds.length > 0
          ? { id: { in: dto.employeeIds } }
          : {}),
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('Tidak ada karyawan aktif yang ditemukan untuk dihitung.');
    }

    const totalWorkingDays = dto.totalWorkingDays ?? 22;
    const isLastPeriod = period.month === 12;

    this.logger.log(
      `Memulai batch payroll calculation untuk ${employees.length} karyawan (Periode ${period.month}/${period.year})`,
    );

    const calculatedResults: Array<{
      emp: (typeof employees)[number];
      result: ReturnType<typeof calculatePayroll>;
    }> = [];

    const startDate = new Date(Date.UTC(period.year, period.month - 1, 1));
    const endDate = new Date(Date.UTC(period.year, period.month, 0, 23, 59, 59));
    const employeeIds = employees.map((e) => e.id);

    // Ambil seluruh data lembur & presensi periode ini sekaligus (Eliminasi N+1 query)
    const [allOvertimeRecords, allAttendanceRecords] = await Promise.all([
      this.prisma.overtimeEntry.findMany({
        where: {
          employeeId: { in: employeeIds },
          date: { gte: startDate, lte: endDate },
          status: 'APPROVED',
        },
      }),
      this.prisma.attendance.findMany({
        where: {
          employeeId: { in: employeeIds },
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    // Grouping by employeeId di memori untuk pencarian O(1)
    const overtimeByEmployee = new Map<string, typeof allOvertimeRecords>();
    for (const ot of allOvertimeRecords) {
      const list = overtimeByEmployee.get(ot.employeeId) || [];
      list.push(ot);
      overtimeByEmployee.set(ot.employeeId, list);
    }

    const attendanceByEmployee = new Map<string, typeof allAttendanceRecords>();
    for (const att of allAttendanceRecords) {
      const list = attendanceByEmployee.get(att.employeeId) || [];
      list.push(att);
      attendanceByEmployee.set(att.employeeId, list);
    }

    for (const emp of employees) {
      const overtimeRecords = overtimeByEmployee.get(emp.id) || [];
      const overtimeEntries = overtimeRecords.map((ot) => ({
        date: ot.date.toISOString().split('T')[0],
        hours: Number(ot.hours),
        isHoliday: ot.isHoliday,
      }));

      const attendanceRecords = attendanceByEmployee.get(emp.id) || [];

      let workingDays = totalWorkingDays;
      let alphaCount = 0;
      if (attendanceRecords.length > 0) {
        workingDays = attendanceRecords.filter(
          (a) =>
            a.status === 'PRESENT' ||
            a.status === 'LATE' ||
            a.status === 'PERMIT' ||
            a.status === 'SICK' ||
            a.status === 'ON_LEAVE',
        ).length;
        alphaCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
      }

      const payrollInput: PayrollInput = {
        employee: {
          id: emp.id,
          fullName: emp.fullName,
          statusPTKP: (emp.maritalStatusPtkp as StatusPTKP) || 'TK/0',
          baseSalary: Number(emp.baseSalary),
          fixedAllowance: Number(emp.fixedAllowance),
          joinDate: emp.joinDate.toISOString().split('T')[0],
          resignDate: emp.resignDate ? emp.resignDate.toISOString().split('T')[0] : undefined,
        },
        attendance: {
          workingDays,
          totalWorkingDays,
          alphaCount,
          overtimeEntries,
        },
        period: {
          month: period.month,
          year: period.year,
          isLastPeriod,
        },
        bpjsKesehatanRates: bpjsKesRates,
        bpjsKetenagakerjaanRates: bpjsTkRates,
        terTable,
        ptkpTable,
        otherDeductions: [],
      };

      const result = calculatePayroll(payrollInput);
      calculatedResults.push({ emp, result });
    }

    await this.persistCalculationResults(period, calculatedResults, bpjsKesRates, bpjsTkRates, userId);

    this.logger.log(
      `Sukses menghitung payroll untuk ${calculatedResults.length} karyawan pada periode ${period.id}`,
    );

    return {
      message: `Sukses mengkalkulasi payroll untuk ${calculatedResults.length} karyawan`,
      calculatedCount: calculatedResults.length,
      periodId: period.id,
    };
  }

  private async persistCalculationResults(
    period: any,
    calculatedResults: Array<{ emp: any; result: ReturnType<typeof calculatePayroll> }>,
    bpjsKesRates: any,
    bpjsTkRates: any,
    userId: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      for (const { emp, result } of calculatedResults) {
        const rateSnapshot: Prisma.InputJsonValue = {
          calculatedAt: new Date().toISOString(),
          period: `${period.month}/${period.year}`,
          ptkpStatus: emp.maritalStatusPtkp,
          pph21Rate: 'tarif' in result.pph21 ? result.pph21.tarif : null,
          bpjsKesehatanCap: bpjsKesRates.wageCap,
          bpjsJpCap: bpjsTkRates.jp.wageCap,
        };

        const detail = await tx.payrollDetail.upsert({
          where: {
            payrollPeriodId_employeeId: {
              payrollPeriodId: period.id,
              employeeId: emp.id,
            },
          },
          create: {
            payrollPeriodId: period.id,
            employeeId: emp.id,
            baseSalary: result.baseSalary,
            fixedAllowance: result.fixedAllowance,
            overtimeAmount: result.overtime.total,
            grossIncome: result.grossIncome,
            bpjsKesehatanEmployee: result.bpjsKesehatan.employee,
            bpjsKesehatanCompany: result.bpjsKesehatan.company,
            bpjsTkEmployee: result.bpjsKetenagakerjaan.employee,
            bpjsTkCompany: result.bpjsKetenagakerjaan.company,
            pph21Amount: result.pph21Amount,
            otherDeductions: result.totalOtherDeductions,
            netSalary: result.netSalary,
            rateSnapshot,
          },
          update: {
            baseSalary: result.baseSalary,
            fixedAllowance: result.fixedAllowance,
            overtimeAmount: result.overtime.total,
            grossIncome: result.grossIncome,
            bpjsKesehatanEmployee: result.bpjsKesehatan.employee,
            bpjsKesehatanCompany: result.bpjsKesehatan.company,
            bpjsTkEmployee: result.bpjsKetenagakerjaan.employee,
            bpjsTkCompany: result.bpjsKetenagakerjaan.company,
            pph21Amount: result.pph21Amount,
            otherDeductions: result.totalOtherDeductions,
            netSalary: result.netSalary,
            rateSnapshot,
          },
        });

        await tx.payrollComponent.deleteMany({
          where: { payrollDetailId: detail.id },
        });

        await tx.payrollComponent.createMany({
          data: [
            {
              payrollDetailId: detail.id,
              componentType: ComponentType.EARNING,
              componentName: 'Gaji Pokok',
              amount: result.proratedSalary,
            },
            {
              payrollDetailId: detail.id,
              componentType: ComponentType.EARNING,
              componentName: 'Tunjangan Tetap',
              amount: result.fixedAllowance,
            },
            ...(result.overtime.total > 0
              ? [
                  {
                    payrollDetailId: detail.id,
                    componentType: ComponentType.EARNING,
                    componentName: 'Upah Lembur',
                    amount: result.overtime.total,
                  },
                ]
              : []),
            {
              payrollDetailId: detail.id,
              componentType: ComponentType.DEDUCTION,
              componentName: 'BPJS Kesehatan (Karyawan 1%)',
              amount: result.bpjsKesehatan.employee,
            },
            {
              payrollDetailId: detail.id,
              componentType: ComponentType.DEDUCTION,
              componentName: 'BPJS Ketenagakerjaan (JHT + JP Karyawan 3%)',
              amount: result.bpjsKetenagakerjaan.employee,
            },
            {
              payrollDetailId: detail.id,
              componentType: ComponentType.DEDUCTION,
              componentName: 'PPh 21 (TER)',
              amount: result.pph21Amount,
            },
          ],
        });
      }

      await tx.payrollPeriod.update({
        where: { id: period.id },
        data: {
          processedById: userId,
        },
      });
    });
  }
}
