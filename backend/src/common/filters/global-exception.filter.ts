import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Global exception filter — menangkap semua error dan memformat response.
 *
 * Security principles:
 * - Production: TIDAK menampilkan stack trace, detail internal, atau pesan error raw
 * - Development: menampilkan full error untuk debugging
 * - Selalu log error internal secara lengkap (untuk monitoring)
 * - Prisma errors dikonversi ke HTTP errors yang aman
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolveException(exception);

    // Log error lengkap untuk monitoring — TIDAK dikirim ke client
    this.logger.error(
      `[${request.method}] ${request.url} → ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      statusCode: status,
      message: this.isProduction ? this.getSafeMessage(status, message) : message,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Stack trace TIDAK pernah dikirim ke client
    });
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string | string[];
  } {
    // NestJS HttpException (termasuk ValidationPipe errors)
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && 'message' in response
          ? (response as { message: string | string[] }).message
          : exception.message;
      return { status: exception.getStatus(), message };
    }

    // Prisma known errors — konversi ke HTTP yang aman
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // Prisma validation errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Data tidak valid',
      };
    }

    // Semua error tidak dikenal → 500 dengan pesan generik
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Terjadi kesalahan internal server',
    };
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          message: 'Data sudah ada (duplikat)',
        };
      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Data tidak ditemukan',
        };
      case 'P2003':
        // Foreign key constraint
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referensi data tidak valid',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Terjadi kesalahan database',
        };
    }
  }

  /**
   * Di production, ganti pesan 500 dengan pesan generik.
   * Pesan 4xx tetap diteruskan karena berguna untuk user/developer.
   */
  private getSafeMessage(
    status: number,
    message: string | string[],
  ): string | string[] {
    if (status >= 500) {
      return 'Terjadi kesalahan internal. Silakan coba lagi atau hubungi administrator.';
    }
    return message;
  }
}

