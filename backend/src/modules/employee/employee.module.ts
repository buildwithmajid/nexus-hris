import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeEncryptionService } from './services/employee-encryption.service';
import { EmployeeHistoryService } from './services/employee-history.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeEncryptionService, EmployeeHistoryService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
