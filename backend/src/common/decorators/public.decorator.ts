import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() — mark endpoint sebagai tidak memerlukan autentikasi.
 *
 * Gunakan HANYA untuk:
 * - POST /auth/login
 * - POST /auth/refresh
 * - GET /health
 *
 * JANGAN mark endpoint yang mengandung data sensitif sebagai @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

