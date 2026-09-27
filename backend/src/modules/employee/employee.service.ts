import { Injectable, NotFoundException } from '@nestjs/common';
import { Employee, EmploymentStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeEncryptionService } from './services/employee-encryption.service';
import { EmployeeHistoryService } from './services/employee-history.service';

type EmployeeWithDecrypted = Employee & {
  nik?: string;
  bankAccountNumber?: string;
  npwp?: string;
};

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EmployeeEncryptionService,
    private readonly history: EmployeeHistoryService,
  ) {}

  /**
   * Membuat data karyawan baru.
   * Field sensitif (NIK, rekening, NPWP) dienkripsi sebelum disimpan.
   * Hash NIK dan NPWP dibuat untuk keperluan pencarian tanpa dekripsi.
   * Secara otomatis membuatkan akun User jika belum tersedia.
   */
  async create(
    dto: CreateEmployeeDto,
    createdByUserId: string,
  ): Promise<EmployeeWithDecrypted> {
    // 1. Verifikasi / Auto-provision User Account jika belum ada
    let userIdToUse = dto.userId;
    const existingUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!existingUser) {
      const staffRole = await this.prisma.role.findFirst({
        where: { name: 'staff' },
      });
      const roleId = staffRole?.id || (await this.prisma.role.findFirst())?.id;

      if (roleId) {
        const cleanName = dto.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const userEmail = `${cleanName}.${dto.employeeCode.toLowerCase()}@nexus-hris.id`;
        const tempPassword = process.env.DEFAULT_STAFF_PASSWORD || `NexusStaff@${Math.random().toString(36).slice(-8)}!`;
        const defaultHash = await argon2.hash(tempPassword, {
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 4,
        });

        const createdUser = await this.prisma.user.create({
          data: {
            id: dto.userId,
            email: userEmail,
            passwordHash: defaultHash,
            roleId,
          },
        });
        userIdToUse = createdUser.id;
      }
    }

    const encrypted = this.encryption.encryptSensitiveFields(
      dto.nik,
      dto.bankAccountNumber,
      dto.npwp,
    );

    // 3. Simpan ke database dengan field terenkripsi
    const employee = await this.prisma.employee.create({
      data: {
        userId: userIdToUse,
        companyId: dto.companyId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        supervisorId: dto.supervisorId ?? null,
        employeeCode: dto.employeeCode,
        fullName: dto.fullName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        joinDate: new Date(dto.joinDate),
        contractType: dto.contractType,
        maritalStatusPtkp: dto.maritalStatusPtkp,
        baseSalary: dto.baseSalary,
        fixedAllowance: dto.fixedAllowance ?? 0,
        shiftId: dto.shiftId ?? null,
        encryptedNik: encrypted.encryptedNik,
        nikHash: encrypted.nikHash,
        encryptedBankAccount: encrypted.encryptedBankAccount,
        bankName: dto.bankName ?? null,
        encryptedNpwp: encrypted.encryptedNpwp,
        npwpHash: encrypted.npwpHash,
        bpjsKesehatanNumber: dto.bpjsKesehatanNumber ?? null,
        bpjsTkNumber: dto.bpjsTkNumber ?? null,
      },
    });

    // Kembalikan data karyawan dengan field sensitif yang sudah didekripsi
    return this.encryption.decryptSensitiveFields(employee);
  }

  /**
   * Mengambil daftar karyawan berdasarkan perusahaan dengan pagination.
   * Pencarian berdasarkan NIK (jika input 16 digit) atau nama lengkap.
   */
  async findAll(
    companyId: string,
    query: { page?: number; limit?: number; search?: string; departmentId?: string; ptkp?: string },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Bangun kondisi pencarian
    const where: any = {
      companyId,
      employmentStatus: { not: EmploymentStatus.TERMINATED },
    };

    if (query.search) {
      const search = query.search.trim();

      if (/^\d{16}$/.test(search)) {
        where.nikHash = this.encryption.hashForSearch(search);
      } else {
        // Pencarian berdasarkan nama lengkap (case-insensitive)
        where.fullName = { contains: search, mode: 'insensitive' };
      }
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.ptkp) {
      where.maritalStatusPtkp = query.ptkp;
    }

    const [total, employees] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        // Pilih field yang aman — field terenkripsi tidak dikembalikan ke list
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          companyId: true,
          departmentId: true,
          positionId: true,
          supervisorId: true,
          contractType: true,
          maritalStatusPtkp: true,
          baseSalary: true,
          fixedAllowance: true,
          joinDate: true,
          birthDate: true,
          employmentStatus: true,
          bankName: true,
          bpjsKesehatanNumber: true,
          bpjsTkNumber: true,
          shiftId: true,
          createdAt: true,
          updatedAt: true,
          department: { select: { id: true, name: true } },
          position: { select: { id: true, title: true, level: true } },
        },
      }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil detail satu karyawan berdasarkan ID.
   * Field sensitif (NIK, rekening, NPWP) akan didekripsi sebelum dikembalikan.
   */
  async findOne(id: string): Promise<EmployeeWithDecrypted> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        supervisor: { select: { id: true, fullName: true, employeeCode: true } },
        leaveBalances: {
          include: { leaveType: true },
          where: { year: new Date().getFullYear() },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }

    return this.encryption.decryptSensitiveFields(employee);
  }

  /**
   * Memperbarui data karyawan.
   * - Jika gaji pokok, jabatan, atau departemen berubah → catat di EmployeeHistory
   * - Jika NIK berubah → enkripsi ulang dan perbarui hash
   */
  async update(
    id: string,
    dto: UpdateEmployeeDto,
    updatedByUserId: string,
  ): Promise<EmployeeWithDecrypted> {
    // Cek keberadaan karyawan
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }

    const dtoAny = dto as any;

    // Deteksi perubahan yang perlu dicatat di riwayat
    const hasHistoryChange =
      (dtoAny.baseSalary !== undefined && Number(dtoAny.baseSalary) !== Number(existing.baseSalary)) ||
      (dtoAny.positionId !== undefined && dtoAny.positionId !== existing.positionId) ||
      (dtoAny.departmentId !== undefined && dtoAny.departmentId !== existing.departmentId);

    const { nik, bankAccountNumber, npwp, userId: _userId, ...safeDto } = dtoAny;
    const updateData: any = { ...safeDto };

    if (nik !== undefined || bankAccountNumber !== undefined || npwp !== undefined) {
      const encrypted = this.encryption.encryptSensitiveFields(nik, bankAccountNumber, npwp);
      if (nik !== undefined) {
        updateData.encryptedNik = encrypted.encryptedNik;
        updateData.nikHash = encrypted.nikHash;
      }
      if (bankAccountNumber !== undefined) {
        updateData.encryptedBankAccount = encrypted.encryptedBankAccount;
      }
      if (npwp !== undefined) {
        updateData.encryptedNpwp = encrypted.encryptedNpwp;
        updateData.npwpHash = encrypted.npwpHash;
      }
    }

    // Konversi tanggal string ke objek Date jika ada
    if (safeDto.joinDate) updateData.joinDate = new Date(safeDto.joinDate as string);
    if (safeDto.birthDate) updateData.birthDate = new Date(safeDto.birthDate as string);

    // Jalankan update dan catat riwayat dalam satu transaksi
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.employee.update({
        where: { id },
        data: updateData,
      });

      if (hasHistoryChange) {
        const changes: Array<{ field: string; oldValue?: string | null; newValue?: string | null }> = [];

        if ((updateData as any).baseSalary !== undefined && (updateData as any).baseSalary !== existing.baseSalary) {
          changes.push({
            field: 'baseSalary',
            oldValue: String(existing.baseSalary),
            newValue: String((updateData as any).baseSalary),
          });
        }
        if ((updateData as any).positionId !== undefined && (updateData as any).positionId !== existing.positionId) {
          changes.push({
            field: 'positionId',
            oldValue: existing.positionId,
            newValue: (updateData as any).positionId,
          });
        }
        if ((updateData as any).departmentId !== undefined && (updateData as any).departmentId !== existing.departmentId) {
          changes.push({
            field: 'departmentId',
            oldValue: existing.departmentId,
            newValue: (updateData as any).departmentId,
          });
        }

        await this.history.recordMultipleChanges(id, changes, updatedByUserId);
      }

      return result;
    });

    return this.encryption.decryptSensitiveFields(updated);
  }

  /**
   * Menon-aktifkan karyawan (soft delete).
   * Status diubah menjadi TERMINATED dan tanggal resign dicatat.
   * Perubahan status dicatat di EmployeeHistory.
   */
  async softDelete(id: string, updatedByUserId: string): Promise<void> {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }

    const resignDate = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: {
          employmentStatus: EmploymentStatus.TERMINATED,
          resignDate,
        },
      });

      await this.history.recordStatusChange(
        id,
        existing.employmentStatus,
        EmploymentStatus.TERMINATED,
        updatedByUserId,
      );
    });
  }

  /**
   * Mengambil data profil karyawan berdasarkan userId yang login.
   * Digunakan untuk Employee Self-Service (ESS).
   */
  async findByUserId(userId: string): Promise<
    EmployeeWithDecrypted & {
      department?: { name: string } | null;
      position?: { title: string } | null;
      company?: { name: string } | null;
    }
  > {
    let employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
        company: { select: { name: true } },
      },
    });

    // Fallback untuk akun demo jika userId belum terikat record employee
    if (!employee) {
      employee = await this.prisma.employee.findFirst({
        where: { employmentStatus: EmploymentStatus.ACTIVE },
        include: {
          department: { select: { name: true } },
          position: { select: { title: true } },
          company: { select: { name: true } },
        },
      });
    }

    if (!employee) {
      throw new NotFoundException('Data karyawan tidak ditemukan');
    }

    const decrypted = this.encryption.decryptSensitiveFields(employee);
    return {
      ...decrypted,
      department: employee.department,
      position: employee.position,
      company: employee.company,
    };
  }
}
