import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    super({
      log:
        configService.get('nodeEnv', { infer: true }) === 'development'
          ? [
              // Di development, log query tapi TANPA menampilkan nilai parameter
              // untuk mencegah data sensitif muncul di log
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'error' },
              { emit: 'stdout', level: 'warn' },
            ]
          : [
              // Di production, hanya log error
              { emit: 'stdout', level: 'error' },
            ],
      errorFormat: 'minimal', // Jangan tampilkan stack trace Prisma di production
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Koneksi database berhasil');
    } catch (error) {
      this.logger.error('Gagal terhubung ke database', error);
      // Lempar ulang agar app tidak start tanpa database
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Koneksi database ditutup');
  }
}

