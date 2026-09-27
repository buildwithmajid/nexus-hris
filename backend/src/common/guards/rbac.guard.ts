import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * RbacGuard — guard RBAC berbasis permission code.
 *
 * Digunakan bersama @RequirePermissions('employee.create', 'payroll.approve').
 * User harus memiliki SEMUA permission yang diminta (AND logic).
 *
 * Permission di-load dari JWT payload (sudah di-embed saat login)
 * sehingga tidak perlu hit database di setiap request.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Jika tidak ada @RequirePermissions, lewati (hanya butuh authenticated)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { permissions?: string[] } | undefined;

    if (!user?.permissions) {
      throw new ForbiddenException('Akses ditolak. Anda tidak memiliki izin yang diperlukan.');
    }

    const userPermissions = new Set(user.permissions);
    const hasAll = requiredPermissions.every((perm) => userPermissions.has(perm));

    if (!hasAll) {
      throw new ForbiddenException('Akses ditolak. Izin tidak mencukupi.');
    }

    return true;
  }
}

