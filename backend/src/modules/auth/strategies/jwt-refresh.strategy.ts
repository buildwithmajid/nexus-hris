import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AppConfig } from '../../../config/configuration';

export interface RefreshTokenPayload {
  sub: string;
  familyId: string;
  tokenId: string;
}

/**
 * JWT Refresh Strategy — verifikasi refresh token.
 * Refresh token diambil dari body (field: refreshToken).
 * Token asli diteruskan ke service untuk validasi dan rotasi.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.refreshSecret', { infer: true }),
      passReqToCallback: true, // Butuh akses ke raw token untuk hashing
    });
  }

  validate(
    req: Request,
    payload: RefreshTokenPayload,
  ): RefreshTokenPayload & { rawToken: string } {
    const rawToken = req.body?.refreshToken as string | undefined;
    if (!rawToken) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }
    return { ...payload, rawToken };
  }
}

