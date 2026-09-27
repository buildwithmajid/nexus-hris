import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Global agar semua module bisa inject tanpa import ulang
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

