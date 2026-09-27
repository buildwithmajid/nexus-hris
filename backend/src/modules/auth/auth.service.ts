import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';
import { AppConfig } from '../../config/configuration';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Login — verifikasi kredensial dan terbitkan token pair.
   * Menggunakan Argon2id untuk verifikasi password hash.
   *
   * Security notes:
   * - Gunakan waktu delay yang konsisten agar tidak ada timing leak
   * - Pesan error generik (tidak membedakan "email tidak ada" vs "password salah")
   */
  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    // Selalu jalankan verifikasi Argon2 meski user tidak ada
    // untuk mencegah timing attack (attacker bisa deteksi email valid via response time)
    const dummyHash =
      '$argon2id$v=19$m=65536,t=3,p=4$dummydummy$dummydummydummydummydummydummydum';
    const passwordToVerify = user?.passwordHash ?? dummyHash;

    let isValidPassword = false;
    try {
      isValidPassword = await argon2.verify(passwordToVerify, dto.password);
    } catch {
      isValidPassword = false;
    }

    if (!user || !isValidPassword || !user.isActive) {
      // Pesan generik — jangan bocorkan apakah email terdaftar atau tidak
      throw new UnauthorizedException('Email atau password salah.');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    };

    return this.issueTokenPair(user.id, payload);
  }

  /**
   * Refresh token dengan rotasi.
   *
   * Alur:
   * 1. Cari token hash di database
   * 2. Jika sudah di-revoke → REVOKE SELURUH FAMILY (deteksi token theft)
   * 3. Jika valid → revoke token lama, terbitkan token baru dengan family yang sama
   *
   * "Token family" adalah grup refresh token dari satu sesi login.
   * Jika token lama digunakan lagi (sudah di-rotasi), artinya token dicuri.
   */
  async refreshTokens(
    payload: RefreshTokenPayload & { rawToken: string },
  ): Promise<TokenPair> {
    const tokenHash = this.hashToken(payload.rawToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token tidak valid.');
    }

    // Deteksi reuse attack — jika token sudah di-revoke tapi dipakai lagi
    if (storedToken.isRevoked) {
      this.logger.warn(
        `[SECURITY] Terdeteksi penggunaan ulang refresh token! family=${payload.familyId} user=${payload.sub}`,
      );
      // Revoke seluruh family — paksa user login ulang
      await this.prisma.refreshToken.updateMany({
        where: { familyId: payload.familyId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Sesi tidak valid. Silakan login ulang untuk keamanan akun Anda.',
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token sudah kedaluwarsa. Silakan login ulang.');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Akun tidak aktif.');
    }

    // Revoke token lama
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const permissions = storedToken.user.role.rolePermissions.map(
      (rp) => rp.permission.code,
    );

    const newPayload: JwtPayload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      roleId: storedToken.user.roleId,
      roleName: storedToken.user.role.name,
      permissions,
    };

    // Terbitkan token pair baru dengan family yang sama
    return this.issueTokenPair(storedToken.user.id, newPayload, payload.familyId);
  }

  /**
   * Logout — revoke semua refresh token milik user (semua sesi).
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Register — untuk keperluan seed/admin. Endpoint ini seharusnya dilindungi.
   */
  async register(dto: RegisterDto, defaultRoleName = 'staff'): Promise<{ id: string; email: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email sudah terdaftar.');
    }

    const defaultRole = await this.prisma.role.findFirst({
      where: { name: defaultRoleName },
    });

    if (!defaultRole) {
      throw new Error(`Role '${defaultRoleName}' tidak ditemukan. Jalankan prisma seed terlebih dahulu.`);
    }

    const argon2Config = this.configService.get('argon2', { infer: true });
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: argon2Config.memoryCost,
      timeCost: argon2Config.timeCost,
      parallelism: argon2Config.parallelism,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        roleId: defaultRole.id,
      },
      select: { id: true, email: true },
    });

    return user;
  }

  // =============================================================================
  // Private helpers
  // =============================================================================

  private async issueTokenPair(
    userId: string,
    jwtPayload: JwtPayload,
    existingFamilyId?: string,
  ): Promise<TokenPair> {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    const familyId = existingFamilyId ?? randomUUID();
    const tokenId = randomUUID();

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn,
    });

    // Refresh token payload minimal — tidak sertakan permissions
    const refreshPayload: RefreshTokenPayload = {
      sub: userId,
      familyId,
      tokenId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    // Hitung expiry date untuk disimpan di DB
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 hari

    // Simpan hash refresh token (bukan plaintext!)
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        familyId,
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /** SHA-256 dari raw token untuk disimpan di database */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
