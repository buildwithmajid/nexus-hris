import { Injectable } from '@nestjs/common';
import { Company, Department, Position } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Membuat perusahaan baru beserta data NPWP dan kelas risiko JKK
   */
  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        npwp: dto.npwp,
        riskClassJkk: dto.riskClassJkk,
        address: dto.address,
      },
    });
  }

  /**
   * Mengambil seluruh daftar perusahaan
   */
  async findAllCompanies(): Promise<Company[]> {
    return this.prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Membuat departemen baru di bawah perusahaan tertentu.
   * Mendukung hierarki departemen melalui parentDepartmentId.
   */
  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    return this.prisma.department.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        parentDepartmentId: dto.parentDepartmentId ?? null,
      },
    });
  }

  /**
   * Mengambil semua departemen milik perusahaan tertentu,
   * termasuk referensi departemen induk
   */
  async findDepartmentsByCompany(companyId: string): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { companyId },
      include: {
        parentDepartment: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Membuat jabatan baru di dalam departemen tertentu
   */
  async createPosition(dto: CreatePositionDto): Promise<Position> {
    return this.prisma.position.create({
      data: {
        departmentId: dto.departmentId,
        title: dto.title,
        level: dto.level ?? undefined,
      },
    });
  }

  /**
   * Mengambil semua jabatan yang ada di dalam departemen tertentu,
   * diurutkan berdasarkan level lalu judul jabatan
   */
  async findPositionsByDepartment(departmentId: string): Promise<Position[]> {
    return this.prisma.position.findMany({
      where: { departmentId },
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
    });
  }
}
