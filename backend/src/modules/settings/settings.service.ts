import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil detail profil dan legalitas perusahaan
   */
  async getCompanySettings(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            departments: true,
            employees: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Data perusahaan tidak ditemukan');
    }

    return company;
  }

  /**
   * Memperbarui profil legalitas dan kelas risiko JKK perusahaan
   */
  async updateCompanySettings(companyId: string, dto: UpdateCompanySettingsDto) {
    const existing = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!existing) {
      throw new NotFoundException('Data perusahaan tidak ditemukan');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.npwp !== undefined && { npwp: dto.npwp }),
        ...(dto.riskClassJkk && { riskClassJkk: dto.riskClassJkk }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });
  }

  /**
   * Mengambil parameter statuter BPJS & Perpajakan TER aktif
   */
  async getStatutoryRates() {
    return {
      bpjsKesehatan: {
        name: 'BPJS Kesehatan',
        companyPercent: 4.0,
        employeePercent: 1.0,
        wageCap: 12000000,
        regulation: 'Perpres No. 64/2020',
      },
      bpjsKetenagakerjaan: {
        jht: {
          name: 'Jaminan Hari Tua (JHT)',
          companyPercent: 3.7,
          employeePercent: 2.0,
          wageCap: null,
          regulation: 'PP No. 46/2015',
        },
        jkk: {
          name: 'Jaminan Kecelakaan Kerja (JKK)',
          riskClasses: [
            { class: 'I', label: 'Tingkat Risiko Sangat Rendah (Perkantoran/IT)', ratePercent: 0.24 },
            { class: 'II', label: 'Tingkat Risiko Rendah (Perdagangan/Retail)', ratePercent: 0.54 },
            { class: 'III', label: 'Tingkat Risiko Sedang (Manufaktur/Logistik)', ratePercent: 0.89 },
            { class: 'IV', label: 'Tingkat Risiko Tinggi (Industri Berat/Kimia)', ratePercent: 1.27 },
            { class: 'V', label: 'Tingkat Risiko Sangat Tinggi (Pertambangan/Konstruksi)', ratePercent: 1.74 },
          ],
          regulation: 'PP No. 44/2015',
        },
        jkm: {
          name: 'Jaminan Kematian (JKM)',
          companyPercent: 0.3,
          employeePercent: 0.0,
          regulation: 'PP No. 44/2015',
        },
        jp: {
          name: 'Jaminan Pensiun (JP)',
          companyPercent: 2.0,
          employeePercent: 1.0,
          wageCap: 10042300,
          regulation: 'Surat Edaran BPJS TK No. B/108/022024',
        },
      },
      taxPph21: {
        regulation: 'PMK No. 168/2023 & PP No. 58/2023',
        effectiveMethod: 'Tarif Efektif Rata-Rata (TER) Bulanan',
        categories: [
          { category: 'A', ptkpStatus: 'TK/0 (54jt), TK/1 (58.5jt), K/0 (58.5jt)', bracketsCount: 44 },
          { category: 'B', ptkpStatus: 'TK/2 (63jt), TK/3 (67.5jt), K/1 (63jt), K/2 (67.5jt)', bracketsCount: 40 },
          { category: 'C', ptkpStatus: 'K/3 (72jt)', bracketsCount: 41 },
        ],
      },
    };
  }

  /**
   * Mengambil daftar seluruh pengguna dan role terdaftar
   */
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        roleId: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: {
              select: { name: true },
            },
            position: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Mengambil daftar peran (roles) dan permissions
   */
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Mengubah peran (role) dari seorang pengguna
   */
  async updateUserRole(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true,
      },
    });
  }
}

