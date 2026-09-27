import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  /**
   * Password harus:
   * - Minimal 8 karakter
   * - Mengandung minimal 1 huruf besar
   * - Mengandung minimal 1 huruf kecil
   * - Mengandung minimal 1 angka
   */
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(128, { message: 'Password maksimal 128 karakter' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;
}

