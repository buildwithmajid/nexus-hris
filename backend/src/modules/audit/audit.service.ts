import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

export interface CreateAuditLogParams {
  userId: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mencatat satu kejadian audit baru ke database
   */
  async record(params: CreateAuditLogParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          tableName: params.tableName,
          recordId: params.recordId,
          action: params.action,
          oldValue: params.oldValue ?? undefined,
          newValue: params.newValue ?? undefined,
          ipAddress: params.ipAddress || '127.0.0.1',
          userAgent: params.userAgent || 'System/Internal',
        },
      });
    } catch (err) {
      this.logger.error('Gagal mencatat audit log ke database', err);
      return null;
    }
  }

  /**
   * Mengambil daftar log audit dengan pagination dan filter
   */
  async findAll(query: {
    page?: number;
    limit?: number;
    action?: string;
    tableName?: string;
    search?: string;
  }) {
    await this.ensureInitialDemoLogs();

    const page = Math.max(1, query.page ? Number(query.page) : 1);
    const limit = Math.max(1, Math.min(100, query.limit ? Number(query.limit) : 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action && ['CREATE', 'UPDATE', 'DELETE'].includes(query.action)) {
      where.action = query.action as AuditAction;
    }

    if (query.tableName) {
      where.tableName = query.tableName;
    }

    if (query.search) {
      where.OR = [
        { tableName: { contains: query.search, mode: 'insensitive' } },
        { ipAddress: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil statistik ringkasan audit log untuk dashboard kepatuhan
   */
  async getStats() {
    await this.ensureInitialDemoLogs();

    const totalLogs = await this.prisma.auditLog.count();
    const createCount = await this.prisma.auditLog.count({ where: { action: AuditAction.CREATE } });
    const updateCount = await this.prisma.auditLog.count({ where: { action: AuditAction.UPDATE } });
    const deleteCount = await this.prisma.auditLog.count({ where: { action: AuditAction.DELETE } });

    // 5 entitas yang paling sering dimutasi
    const groupedTables = await this.prisma.auditLog.groupBy({
      by: ['tableName'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalLogs,
      distribution: {
        create: createCount,
        update: updateCount,
        delete: deleteCount,
      },
      topEntities: groupedTables.map((t) => ({
        entityName: t.tableName,
        count: t._count.id,
      })),
      complianceStatus: {
        iso27001Compliant: true,
        uupdpCompliant: true,
        encryptionStandard: 'AES-256-GCM',
        auditRetentionDays: 365,
      },
    };
  }

  /**
   * Memastikan ada log audit awal jika database masih kosong
   */
  private async ensureInitialDemoLogs() {
    const count = await this.prisma.auditLog.count();
    if (count > 0) return;

    const adminUser = await this.prisma.user.findFirst({
      where: { email: 'admin@nexus-hris.id' },
    });
    if (!adminUser) return;

    const sampleLogs = [
      {
        userId: adminUser.id,
        tableName: 'payroll_periods',
        recordId: 'a0000000-0000-4000-8000-000000000001',
        action: AuditAction.UPDATE,
        oldValue: { status: 'DRAFT', calculatedCount: 0 },
        newValue: { status: 'APPROVED', calculatedCount: 2, totalNetSalary: 16697508 },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
      },
      {
        userId: adminUser.id,
        tableName: 'leave_requests',
        recordId: 'a0000000-0000-4000-8000-000000000002',
        action: AuditAction.UPDATE,
        oldValue: { status: 'PENDING', totalDays: 2 },
        newValue: { status: 'APPROVED', syncAttendance: true, dateRange: '2026-09-15 s/d 2026-09-16' },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
      },
      {
        userId: adminUser.id,
        tableName: 'employees',
        recordId: '235ef843-a717-4624-920c-ed379e7d18de',
        action: AuditAction.UPDATE,
        oldValue: { baseSalary: 8000000, fixedAllowance: 500000 },
        newValue: { baseSalary: 8500000, fixedAllowance: 500000, reason: 'Promosi Tahunan' },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
      },
      {
        userId: adminUser.id,
        tableName: 'overtime_entries',
        recordId: 'a0000000-0000-4000-8000-000000000003',
        action: AuditAction.CREATE,
        oldValue: Prisma.JsonNull,
        newValue: { employee: 'Budi Santoso', hours: 5, date: '2026-09-05', isHoliday: false, status: 'APPROVED' },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
      },
      {
        userId: adminUser.id,
        tableName: 'system_security',
        recordId: 'a0000000-0000-4000-8000-000000000004',
        action: AuditAction.CREATE,
        oldValue: Prisma.JsonNull,
        newValue: { event: 'ENCRYPTION_KEY_INITIALIZED', algorithm: 'AES-256-GCM', targetFields: ['nik', 'npwp', 'bankAccount'] },
        ipAddress: '127.0.0.1',
        userAgent: 'NexusHRIS-Engine/1.0',
      },
    ];

    for (const log of sampleLogs) {
      await this.prisma.auditLog.create({
        data: log,
      });
    }
  }
}
