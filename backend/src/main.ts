import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RbacGuard } from './common/guards/rbac.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Sembunyikan error stack di log production
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['error', 'warn', 'log', 'debug'],
  });

  const reflector = app.get(Reflector);

  // ==========================================================================
  // 1. Helmet — security HTTP headers
  //    Mencegah: XSS, clickjacking, MIME sniffing, information disclosure
  // ==========================================================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      hidePoweredBy: true,
      dnsPrefetchControl: { allow: false },
      hsts: {
        maxAge: 31536000,       // 1 tahun
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ==========================================================================
  // 2. CORS — hanya izinkan origin yang terdaftar
  // ==========================================================================
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (misal Postman di dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' tidak diizinkan oleh CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ==========================================================================
  // 3. Body size limit — mencegah payload bombing
  // ==========================================================================
  app.use(require('express').json({ limit: '1mb' }));
  app.use(require('express').urlencoded({ limit: '1mb', extended: true }));

  // ==========================================================================
  // 4. Cookie parser (untuk refresh token via cookie jika diperlukan)
  // ==========================================================================
  app.use(cookieParser());

  // ==========================================================================
  // 5. Global prefix API
  // ==========================================================================
  app.setGlobalPrefix('api/v1');

  // ==========================================================================
  // 6. Global Validation Pipe
  //    - whitelist: strip semua property yang tidak ada di DTO
  //    - forbidNonWhitelisted: error jika ada property asing (bukan hanya strip)
  //    - transform: auto-transform string ke number/boolean sesuai tipe DTO
  // ==========================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ==========================================================================
  // 7. Global Exception Filter — sembunyikan stack trace di production
  // ==========================================================================
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ==========================================================================
  // 8. Global Guards — semua endpoint protected by default
  //    Endpoint public harus ditandai @Public()
  // ==========================================================================
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RbacGuard(reflector));

  // ==========================================================================
  // 9. Graceful shutdown
  // ==========================================================================
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🚀 Nexus HRIS API berjalan di: http://localhost:${port}/api/v1`);
    console.log(`📋 Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
  }
}

bootstrap().catch((err) => {
  console.error('Gagal menjalankan aplikasi:', err);
  process.exit(1);
});

