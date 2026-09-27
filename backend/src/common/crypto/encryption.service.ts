import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { AppConfig } from '../../config/configuration';

/**
 * EncryptionService — enkripsi dan dekripsi field sensitif menggunakan AES-256-GCM.
 *
 * Kenapa AES-256-GCM?
 * - AES-256: standar enkripsi yang diakui NIST, key 256-bit
 * - GCM (Galois/Counter Mode): authenticated encryption — deteksi tamper
 * - Authentication tag (16 byte): memastikan data tidak dimodifikasi
 * - Random IV per enkripsi: mencegah ciphertext yang sama untuk plaintext yang sama
 *
 * Format output: base64(iv) + ":" + base64(ciphertext) + ":" + base64(authTag)
 */
@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly pepper: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const keyHex = configService.get('encryption.key', { infer: true });
    this.key = Buffer.from(keyHex, 'hex'); // 64 hex chars = 32 bytes = 256 bits
    this.pepper = configService.get('encryption.pepper', { infer: true });
  }

  /**
   * Enkripsi plaintext menjadi format terenkripsi.
   * @param plaintext - Teks asli yang akan dienkripsi
   * @returns String terenkripsi dalam format "iv:ciphertext:authTag" (base64)
   */
  encrypt(plaintext: string): string {
    // IV random 12 byte — WAJIB unik per enkripsi untuk GCM
    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // Authentication tag untuk integrity check (mencegah tamper)
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      encrypted.toString('base64'),
      authTag.toString('base64'),
    ].join(':');
  }

  /**
   * Dekripsi string terenkripsi kembali ke plaintext.
   * @param encryptedData - String dalam format "iv:ciphertext:authTag"
   * @returns Plaintext asli
   * @throws Error jika data tampered (auth tag tidak cocok)
   */
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Format data terenkripsi tidak valid');
    }

    const [ivBase64, encryptedBase64, authTagBase64] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(), // Melempar error jika auth tag tidak cocok
      ]);
      return decrypted.toString('utf8');
    } catch {
      // Jangan expose detail error — hanya log internal
      throw new Error('Dekripsi gagal: data mungkin telah dimodifikasi');
    }
  }

  /**
   * Buat hash deterministik untuk keperluan lookup/search.
   * SHA-256(value + pepper) — mencegah rainbow table attack.
   *
   * Digunakan untuk kolom nikHash, npwpHash agar bisa query
   * tanpa perlu decrypt semua record.
   *
   * @param value - Nilai yang akan di-hash (NIK, NPWP, dll)
   * @returns Hash hex 64 karakter
   */
  hash(value: string): string {
    return createHash('sha256')
      .update(value + this.pepper)
      .digest('hex');
  }

  /**
   * Cek apakah nilai cocok dengan hash yang tersimpan.
   * Lebih aman dari decrypt lalu compare (timing-safe).
   */
  verifyHash(value: string, storedHash: string): boolean {
    const computedHash = this.hash(value);
    // Timing-safe comparison untuk mencegah timing attack
    if (computedHash.length !== storedHash.length) return false;
    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return result === 0;
  }
}

