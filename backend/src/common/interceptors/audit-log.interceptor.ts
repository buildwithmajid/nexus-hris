import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../../modules/prisma/prisma.service';

/**
 * AuditLogInterceptor — otomatis mencatat semua operasi mutasi data ke audit_logs.
 *
 * Mencatat: siapa (user_id), kapan (timestamp), endpoint apa,
 * IP address, dan User-Agent untuk keperluan forensik.
 *
 * Hanya aktif untuk method: POST, PUT, PATCH, DELETE
 * Endpoint yang dikecualikan: /auth/login (untuk menghindari spam log)
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);
  private readonly MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  private readonly EXCLUDED_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;

    // Hanya log mutasi, bukan GET
    if (!this.MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    // Exclude auth endpoints dari audit log agar tidak spam
    const isExcluded = this.EXCLUDED_PATHS.some((path) => url.startsWith(path));
    if (isExcluded) {
      return next.handle();
    }

    const user = (request as any).user as { sub: string } | undefined;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          if (user?.sub) {
            void this.writeAuditLog({
              userId: user.sub,
              action: method,
              path: url,
              ip: ip ?? 'unknown',
              userAgent: request.headers['user-agent'] ?? 'unknown',
              durationMs: Date.now() - startTime,
            });
          }
        },
        error: () => {
          // Tidak log audit untuk request yang error (sudah ditangani filter)
        },
      }),
    );
  }

  private async writeAuditLog(data: {
    userId: string;
    action: string;
    path: string;
    ip: string;
    userAgent: string;
    durationMs: number;
  }): Promise<void> {
    try {
      this.logger.log(
        `AUDIT | user=${data.userId} | ${data.action} ${data.path} | ip=${data.ip} | ${data.durationMs}ms`,
      );

      // Map HTTP method ke Prisma AuditAction
      let auditAction: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE';
      if (data.action === 'POST') auditAction = 'CREATE';
      else if (data.action === 'DELETE') auditAction = 'DELETE';

      // Ekstrak nama entitas/tabel dari path URL
      const pathSegments = data.path.replace(/^\/api\/v1\//, '').split('/');
      const tableName = pathSegments[0] || 'general_system';

      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          tableName,
          recordId: data.userId, // fallback UUID
          action: auditAction,
          newValue: {
            path: data.path,
            method: data.action,
            durationMs: data.durationMs,
          },
          ipAddress: data.ip,
          userAgent: data.userAgent.substring(0, 500),
        },
      });
    } catch (error) {
      // Jangan biarkan audit log failure merusak request utama
      this.logger.error('Gagal menulis audit log ke database', error);
    }
  }
}

