import { IsString, IsUUID, IsOptional, MaxLength, IsInt, Min, Max } from 'class-validator';

export class CreatePositionDto {
  @IsUUID()
  departmentId: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  level?: number;
}
