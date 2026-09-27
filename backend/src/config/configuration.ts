import { Env } from './env.validation';

/**
 * Factory function untuk @nestjs/config.
 * Semua akses config via ConfigService<ReturnType<typeof configuration>, true>
 * menjadi type-safe penuh.
 */
export const configuration = () =>
  ({
    nodeEnv: process.env.NODE_ENV as Env['NODE_ENV'],
    port: parseInt(process.env.PORT ?? '3000', 10),

    database: {
      url: process.env.DATABASE_URL!,
    },

    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET!,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET!,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },

    encryption: {
      key: process.env.ENCRYPTION_KEY!,
      pepper: process.env.ENCRYPTION_PEPPER!,
    },

    cors: {
      origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
        .split(',')
        .map((o) => o.trim()),
    },

    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    },

    argon2: {
      memoryCost: parseInt(process.env.ARGON2_MEMORY_COST ?? '65536', 10),
      timeCost: parseInt(process.env.ARGON2_TIME_COST ?? '3', 10),
      parallelism: parseInt(process.env.ARGON2_PARALLELISM ?? '4', 10),
    },
  }) as const;

export type AppConfig = ReturnType<typeof configuration>;

