import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard — guard global yang melindungi semua endpoint by default.
 *
 * Endpoint yang ingin dibuka (public) harus menggunakan decorator @Public().
 * Ini lebih aman dari opt-in (default public, harus mark protected)
 * karena developer tidak bisa lupa mark endpoint sebagai protected.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Cek apakah endpoint ditandai @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
    if (err || !user) {
      // Pesan generik — jangan bocorkan detail mengapa gagal
      throw new UnauthorizedException('Akses ditolak. Silakan login terlebih dahulu.');
    }
    return user;
  }
}

