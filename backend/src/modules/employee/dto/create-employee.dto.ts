import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  IsEnum,
  IsIn,
  MinLength,
  MaxLength,
  Min,
  Matches,
  Length,
} from 'class-validator';
import { ContractType } from '@prisma/client';

export class CreateEmployeeDto {
  /** ID user akun yang terhubung dengan karyawan ini */
  @IsUUID()
  userId: string;

  /** Perusahaan tempat karyawan bekerja */
  @IsUUID()
  companyId: string;

  /** Departemen tempat karyawan ditempatkan */
  @IsUUID()
  departmentId: string;

  /** Jabatan karyawan */
  @IsUUID()
  positionId: string;

  /** Atasan langsung karyawan (opsional) */
  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  /** Kode unik karyawan, hanya huruf kapital, angka, dan tanda hubung */
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Kode karyawan hanya boleh berisi huruf kapital, angka, dan tanda hubung',
  })
  employeeCode: string;

  /** Nama lengkap karyawan */
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  /** Tanggal lahir karyawan (format ISO 8601) */
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  /** Tanggal bergabung karyawan (format ISO 8601) */
  @IsDateString()
  joinDate: string;

  /** Jenis kontrak kerja karyawan */
  @IsEnum(ContractType, {
    message: 'Tipe kontrak tidak valid',
  })
  contractType: ContractType;

  /**
   * Status PTKP untuk perhitungan PPh 21.
   * Format: TK/0-TK/3 (tidak kawin) atau K/0-K/3 (kawin)
   */
  @IsIn(['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'], {
    message: 'Status PTKP tidak valid. Gunakan format TK/0-TK/3 atau K/0-K/3',
  })
  maritalStatusPtkp: string;

  /** Gaji pokok karyawan dalam rupiah (minimal Rp1.000.000) */
  @IsNumber()
  @IsPositive()
  @Min(1000000, { message: 'Gaji pokok minimal Rp1.000.000' })
  baseSalary: number;

  /** Tunjangan tetap bulanan karyawan (opsional) */
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAllowance?: number;

  /** ID shift kerja yang ditetapkan untuk karyawan (opsional) */
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  /** Nomor Induk Kependudukan (16 digit angka) */
  @IsOptional()
  @IsString()
  @Length(16, 16, { message: 'NIK harus 16 digit' })
  @Matches(/^\d{16}$/, { message: 'NIK harus berisi 16 digit angka' })
  nik?: string;

  /** Nama bank untuk pembayaran gaji */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  /** Nomor rekening bank karyawan */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccountNumber?: string;

  /** Nomor NPWP karyawan (format: xx.xxx.xxx.x-xxx.xxx) */
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, {
    message: 'Format NPWP tidak valid (xx.xxx.xxx.x-xxx.xxx)',
  })
  npwp?: string;

  /** Nomor kepesertaan BPJS Kesehatan */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bpjsKesehatanNumber?: string;

  /** Nomor kepesertaan BPJS Ketenagakerjaan */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bpjsTkNumber?: string;
}
