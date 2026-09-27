import { z } from 'zod';

/**
 * Skema validasi environment variables menggunakan Zod.
 * Aplikasi GAGAL START jika ada variable wajib yang tidak ada atau tidak valid.
 * Ini adalah security measure penting — mencegah app berjalan tanpa konfigurasi keamanan yang benar.
 */
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL harus berupa URL yang valid'),

  // JWT — access token short-lived
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET harus minimal 32 karakter — gunakan: openssl rand -hex 32'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  // JWT — refresh token
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET harus minimal 32 karakter dan berbeda dari ACCESS_SECRET'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Enkripsi field sensitif (AES-256-GCM)
  // Harus tepat 64 karakter hex = 32 byte — gunakan: openssl rand -hex 32
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY harus tepat 64 karakter hex (32 byte) — gunakan: openssl rand -hex 32'),

  // Pepper untuk lookup hash NIK/NPWP
  ENCRYPTION_PEPPER: z
    .string()
    .min(16, 'ENCRYPTION_PEPPER harus minimal 16 karakter'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3001'),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().int().positive().default(60000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),

  // Argon2 (password hashing)
  ARGON2_MEMORY_COST: z.coerce.number().int().min(8192).default(65536),
  ARGON2_TIME_COST: z.coerce.number().int().min(1).default(3),
  ARGON2_PARALLELISM: z.coerce.number().int().min(1).default(4),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Fungsi validasi yang dipanggil oleh @nestjs/config.
 * Melempar error deskriptif jika ada variable yang tidak valid — fail-fast.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // Sengaja throw Error biasa (bukan HttpException) karena ini sebelum app start
    throw new Error(
      `\n\n[Nexus HRIS] Konfigurasi environment tidak valid:\n${formatted}\n\nSalin .env.example ke .env dan isi semua variable yang wajib.\n`,
    );
  }

  return result.data;
}

