import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil Ringkasan Eksekutif Payroll, Beban Perusahaan, Pajak PPh 21, dan Presensi
   */
  async getExecutiveSummary(companyId: string, month: number, year: number) {
    // 1. Cari data periode payroll untuk bulan & tahun yang dipilih
    const period = await this.prisma.payrollPeriod.findUnique({
      where: {
        companyId_month_year: {
          companyId,
          month,
          year,
        },
      },
      include: {
        company: true,
        payrollDetails: {
          include: {
            employee: {
              include: {
                department: true,
                position: true,
              },
            },
            overtimeEntries: true,
          },
        },
      },
    });

    // 2. Data Absensi & Presensi untuk bulan & tahun yang dipilih
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        employee: { companyId },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const attendanceSummary = {
      present: attendanceRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length,
      late: attendanceRecords.filter((a) => a.status === AttendanceStatus.LATE).length,
      onLeave: attendanceRecords.filter((a) => a.status === AttendanceStatus.ON_LEAVE).length,
      sick: attendanceRecords.filter((a) => a.status === AttendanceStatus.SICK).length,
      absent: attendanceRecords.filter((a) => a.status === AttendanceStatus.ABSENT).length,
      totalLogs: attendanceRecords.length,
      attendanceRatePercentage:
        attendanceRecords.length > 0
          ? Math.round(
              ((attendanceRecords.filter(
                (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE || a.status === AttendanceStatus.ON_LEAVE || a.status === AttendanceStatus.SICK,
              ).length) /
                attendanceRecords.length) *
                100,
            )
          : 100,
    };

    if (!period || period.payrollDetails.length === 0) {
      // Jika belum dihitung, hitung headcount karyawan aktif
      const activeEmployees = await this.prisma.employee.count({
        where: { companyId, employmentStatus: 'ACTIVE' },
      });

      return {
        hasData: false,
        periodInfo: {
          month,
          year,
          status: period?.status || 'NOT_CREATED',
          companyName: period?.company?.name || 'PT Nusantara Digital Solusi',
          headcount: activeEmployees,
        },
        costs: {
          totalBaseSalary: 0,
          totalFixedAllowance: 0,
          totalOvertimeAmount: 0,
          totalGrossIncome: 0,
          totalNetSalary: 0,
          totalPph21Amount: 0,
          totalBpjsCompany: 0,
          totalBpjsEmployee: 0,
          totalCompanyCost: 0,
        },
        bpjsBreakdown: {
          kesehatanCompany: 0,
          kesehatanEmployee: 0,
          jhtCompany: 0,
          jhtEmployee: 0,
          jkkCompany: 0,
          jkmCompany: 0,
          jpCompany: 0,
          jpEmployee: 0,
        },
        departmentBreakdown: [],
        attendanceSummary,
      };
    }

    // 3. Agregasi Payroll
    let totalBaseSalary = 0;
    let totalFixedAllowance = 0;
    let totalOvertimeAmount = 0;
    let totalGrossIncome = 0;
    let totalNetSalary = 0;
    let totalPph21Amount = 0;
    let totalBpjsKesCompany = 0;
    let totalBpjsKesEmployee = 0;
    let totalBpjsTkCompany = 0;
    let totalBpjsTkEmployee = 0;

    // Sub-breakdown BPJS Ketenagakerjaan
    let jhtCompany = 0;
    let jhtEmployee = 0;
    let jkkCompany = 0;
    let jkmCompany = 0;
    let jpCompany = 0;
    let jpEmployee = 0;

    // Departemen Map
    const deptMap = new Map<
      string,
      {
        departmentId: string;
        departmentName: string;
        headcount: number;
        totalGross: number;
        totalNet: number;
        totalOvertimeHours: number;
        totalOvertimeCost: number;
      }
    >();

    for (const d of period.payrollDetails) {
      const base = Number(d.baseSalary);
      const allow = Number(d.fixedAllowance);
      const ot = Number(d.overtimeAmount);
      const gross = Number(d.grossIncome);
      const net = Number(d.netSalary);
      const pph21 = Number(d.pph21Amount);
      const kesComp = Number(d.bpjsKesehatanCompany);
      const kesEmp = Number(d.bpjsKesehatanEmployee);
      const tkComp = Number(d.bpjsTkCompany);
      const tkEmp = Number(d.bpjsTkEmployee);

      totalBaseSalary += base;
      totalFixedAllowance += allow;
      totalOvertimeAmount += ot;
      totalGrossIncome += gross;
      totalNetSalary += net;
      totalPph21Amount += pph21;
      totalBpjsKesCompany += kesComp;
      totalBpjsKesEmployee += kesEmp;
      totalBpjsTkCompany += tkComp;
      totalBpjsTkEmployee += tkEmp;

      // Estimasi porsi BPJS TK spesifik
      const jhtC = Math.round(gross * 0.037);
      const jhtE = Math.round(gross * 0.02);
      const jkkC = Math.round(gross * 0.0024);
      const jkmC = Math.round(gross * 0.003);
      const jpWage = Math.min(gross, 10042300);
      const jpC = Math.round(jpWage * 0.02);
      const jpE = Math.round(jpWage * 0.01);

      jhtCompany += jhtC;
      jhtEmployee += jhtE;
      jkkCompany += jkkC;
      jkmCompany += jkmC;
      jpCompany += jpC;
      jpEmployee += jpE;

      // Hitung total jam lembur untuk karyawan ini
      const otHours = d.overtimeEntries.reduce((acc, curr) => acc + Number(curr.hours), 0);

      // Departemen grouping
      const deptId = d.employee.departmentId;
      const deptName = d.employee.department?.name || 'Umum';
      const existing = deptMap.get(deptId) || {
        departmentId: deptId,
        departmentName: deptName,
        headcount: 0,
        totalGross: 0,
        totalNet: 0,
        totalOvertimeHours: 0,
        totalOvertimeCost: 0,
      };

      existing.headcount += 1;
      existing.totalGross += gross;
      existing.totalNet += net;
      existing.totalOvertimeHours += otHours;
      existing.totalOvertimeCost += ot;
      deptMap.set(deptId, existing);
    }

    const totalBpjsCompany = totalBpjsKesCompany + totalBpjsTkCompany;
    const totalBpjsEmployee = totalBpjsKesEmployee + totalBpjsTkEmployee;
    const totalCompanyCost = totalGrossIncome + totalBpjsCompany;

    const departmentBreakdown = Array.from(deptMap.values()).map((dept) => ({
      ...dept,
      averageSalary: dept.headcount > 0 ? Math.round(dept.totalGross / dept.headcount) : 0,
      costPercentage: totalGrossIncome > 0 ? Math.round((dept.totalGross / totalGrossIncome) * 100) : 0,
    }));

    return {
      hasData: true,
      periodInfo: {
        periodId: period.id,
        month,
        year,
        status: period.status,
        companyName: period.company.name,
        headcount: period.payrollDetails.length,
        lockedAt: period.lockedAt,
      },
      costs: {
        totalBaseSalary,
        totalFixedAllowance,
        totalOvertimeAmount,
        totalGrossIncome,
        totalNetSalary,
        totalPph21Amount,
        totalBpjsCompany,
        totalBpjsEmployee,
        totalCompanyCost,
      },
      bpjsBreakdown: {
        kesehatanCompany: totalBpjsKesCompany,
        kesehatanEmployee: totalBpjsKesEmployee,
        jhtCompany,
        jhtEmployee,
        jkkCompany,
        jkmCompany,
        jpCompany,
        jpEmployee,
      },
      departmentBreakdown,
      attendanceSummary,
    };
  }

  /**
   * Mengambil Tren Beban Penggajian Tahunan (Januari - Desember)
   */
  async getCostTrend(companyId: string, year: number) {
    const periods = await this.prisma.payrollPeriod.findMany({
      where: {
        companyId,
        year,
      },
      include: {
        payrollDetails: true,
      },
      orderBy: {
        month: 'asc',
      },
    });

    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    const monthlyTrends = [];

    for (let m = 1; m <= 12; m++) {
      const p = periods.find((item) => item.month === m);
      if (p && p.payrollDetails.length > 0) {
        const gross = p.payrollDetails.reduce((sum, d) => sum + Number(d.grossIncome), 0);
        const net = p.payrollDetails.reduce((sum, d) => sum + Number(d.netSalary), 0);
        const pph = p.payrollDetails.reduce((sum, d) => sum + Number(d.pph21Amount), 0);
        const bpjsComp = p.payrollDetails.reduce(
          (sum, d) => sum + Number(d.bpjsKesehatanCompany) + Number(d.bpjsTkCompany),
          0,
        );
        const companyCost = gross + bpjsComp;

        monthlyTrends.push({
          month: m,
          monthName: monthNames[m - 1],
          status: p.status,
          headcount: p.payrollDetails.length,
          totalGross: gross,
          totalNet: net,
          totalPph21: pph,
          totalCompanyCost: companyCost,
        });
      } else {
        monthlyTrends.push({
          month: m,
          monthName: monthNames[m - 1],
          status: p?.status || 'EMPTY',
          headcount: 0,
          totalGross: 0,
          totalNet: 0,
          totalPph21: 0,
          totalCompanyCost: 0,
        });
      }
    }

    return {
      year,
      monthlyTrends,
    };
  }
}

