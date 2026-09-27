import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Rate limited ketat (5 req / 60s) — mencegah brute-force attack pada login
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   * Rotasi refresh token — revoke lama, terbitkan baru
   */
  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @CurrentUser() payload: RefreshTokenPayload & { rawToken: string },
  ) {
    return this.authService.refreshTokens(payload);
  }

  /**
   * POST /auth/logout
   * Revoke semua refresh token user (semua sesi)
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@CurrentUser('sub') userId: string) {
    await this.authService.logout(userId);
  }

  /**
   * GET /auth/me
   * Profil user dari JWT payload (tanpa DB hit)
   */
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    // Hanya return field yang aman — tidak include passwordHash, dll
    return {
      id: user.sub,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    };
  }
}

