import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { AppConfig } from '../../../config/configuration';

/**
 * JWT Strategy untuk access token.
 * Payload di-embed dengan permissions agar tidak perlu hit DB per request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // WAJIB false — jangan lewatkan expired token
      secretOrKey: configService.get('jwt.accessSecret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Verifikasi user masih aktif (tidak dinonaktifkan setelah token diterbitkan)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isActive: true },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Akun tidak aktif.');
    }

    return payload;
  }
}

