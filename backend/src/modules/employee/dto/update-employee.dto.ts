import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

// Semua field opsional — validasi tetap sama untuk field yang disertakan
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
