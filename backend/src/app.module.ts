import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './modules/prisma/prisma.module';
import { EncryptionModule } from './common/crypto/encryption.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // ==========================================================================
    // Config — load .env dan validasi dengan Zod (fail-fast)
    // ==========================================================================
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      cache: true, // Cache config agar tidak re-parse setiap inject
    }),

    // ==========================================================================
    // Rate Limiting — 100 request per 60 detik per IP (global)
    // Endpoint login mendapat perlakuan lebih ketat via ThrottlerGuard lokal
    // ==========================================================================
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
            limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
          },
        ],
      }),
    }),

    // ==========================================================================
    // Core Infrastructure Modules (Global)
    // ==========================================================================
    PrismaModule,       // Database access — global
    EncryptionModule,   // AES-256-GCM + hashing — global

    // ==========================================================================
    // Feature Modules
    // ==========================================================================
    AuthModule,
    OrganizationModule,
    EmployeeModule,
    PayrollModule,
    AttendanceModule,
    LeaveModule,
    ReportsModule,
    AuditModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
