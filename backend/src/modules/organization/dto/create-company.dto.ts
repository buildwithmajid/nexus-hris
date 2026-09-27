import { IsString, IsOptional, MaxLength, Matches, IsIn } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, {
    message: 'Format NPWP tidak valid (xx.xxx.xxx.x-xxx.xxx)',
  })
  npwp?: string;

  // Kelas risiko JKK: I=0.24%, II=0.54%, III=0.89%, IV=1.27%, V=1.74%
  @IsOptional()
  @IsIn(['I', 'II', 'III', 'IV', 'V'], { message: 'Kelas risiko harus I, II, III, IV, atau V' })
  riskClassJkk?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
