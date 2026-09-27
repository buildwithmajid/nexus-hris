import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Global() // Tersedia di seluruh app tanpa import manual
@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}

