import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsUUID()
  companyId: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsUUID()
  parentDepartmentId?: string;
}
