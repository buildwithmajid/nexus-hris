import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  npwp?: string;

  @IsOptional()
  @IsIn(['I', 'II', 'III', 'IV', 'V'], {
    message: 'Kelas risiko JKK harus I, II, III, IV, atau V',
  })
  riskClassJkk?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

