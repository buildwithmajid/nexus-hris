import { Injectable } from '@nestjs/common';
import {
  BpjsKesehatanRates,
  BpjsKetenagakerjaanRates,
  PtkpEntry,
  StatusPTKP,
  TerKategori,
  TerRateRow,
} from '@nexus-hris/payroll-engine';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayrollRateLoaderService {
  constructor(private readonly prisma: PrismaService) {}

  async loadTerTable(): Promise<TerRateRow[]> {
    const rows = await this.prisma.terRate.findMany({
      orderBy: [{ kategori: 'asc' }, { batasBawah: 'asc' }],
    });

    return rows.map((r) => ({
      kategori: r.kategori as TerKategori,
      batasBawah: Number(r.batasBawah),
      batasAtas: r.batasAtas !== null ? Number(r.batasAtas) : null,
      tarif: Number(r.tarif),
    }));
  }

  async loadPtkpTable(): Promise<PtkpEntry[]> {
    const rows = await this.prisma.ptkpRate.findMany();
    return rows.map((r) => ({
      status: r.status as StatusPTKP,
      amountPerYear: Number(r.amountPerYear),
    }));
  }

  async loadBpjsKesehatanRates(): Promise<BpjsKesehatanRates> {
    const row = await this.prisma.bpjsRate.findFirst({
      where: { program: 'kesehatan' },
    });

    return {
      companyPercent: row ? Number(row.companyPercentage) : 0.04,
      employeePercent: row ? Number(row.employeePercentage) : 0.01,
      wageCap: row && row.wageCap ? Number(row.wageCap) : 12_000_000,
    };
  }

  async loadBpjsKetenagakerjaanRates(): Promise<BpjsKetenagakerjaanRates> {
    const rows = await this.prisma.bpjsRate.findMany({
      where: { program: { in: ['jht', 'jkk', 'jkm', 'jp'] } },
    });

    const jht = rows.find((r) => r.program === 'jht');
    const jkk = rows.find((r) => r.program === 'jkk');
    const jkm = rows.find((r) => r.program === 'jkm');
    const jp = rows.find((r) => r.program === 'jp');

    return {
      jht: {
        companyPercent: jht ? Number(jht.companyPercentage) : 0.037,
        employeePercent: jht ? Number(jht.employeePercentage) : 0.02,
      },
      jkk: {
        companyPercent: jkk ? Number(jkk.companyPercentage) : 0.0024,
      },
      jkm: {
        companyPercent: jkm ? Number(jkm.companyPercentage) : 0.003,
      },
      jp: {
        companyPercent: jp ? Number(jp.companyPercentage) : 0.02,
        employeePercent: jp ? Number(jp.employeePercentage) : 0.01,
        wageCap: jp && jp.wageCap ? Number(jp.wageCap) : 10_042_300,
      },
    };
  }

  async loadAllRates() {
    return Promise.all([
      this.loadTerTable(),
      this.loadPtkpTable(),
      this.loadBpjsKesehatanRates(),
      this.loadBpjsKetenagakerjaanRates(),
    ]);
  }
}
